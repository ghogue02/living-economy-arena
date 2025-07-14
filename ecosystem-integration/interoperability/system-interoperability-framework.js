/**
 * System Interoperability Framework - Phase 4 Ecosystem Integration
 * Enables seamless communication and coordination between heterogeneous systems
 */

const EventEmitter = require('events');
const WebSocket = require('ws');
const { CircuitBreaker } = require('opossum');

class SystemInteroperabilityFramework extends EventEmitter {
    constructor(config = {}) {
        super();
        this.config = {
            messageTimeout: config.messageTimeout || 30000,
            maxRetries: config.maxRetries || 3,
            circuitBreakerOptions: {
                timeout: 10000,
                errorThresholdPercentage: 50,
                resetTimeout: 30000,
                ...config.circuitBreakerOptions
            },
            enableServiceDiscovery: config.enableServiceDiscovery !== false,
            enableLoadBalancing: config.enableLoadBalancing !== false,
            enableHealthChecking: config.enableHealthChecking !== false,
            ...config
        };
        
        this.services = new Map();
        this.protocols = new Map();
        this.adapters = new Map();
        this.circuitBreakers = new Map();
        this.messageQueue = [];
        this.activeConnections = new Map();
        
        this.statistics = {
            totalMessages: 0,
            successfulMessages: 0,
            failedMessages: 0,
            averageLatency: 0,
            activeServices: 0,
            circuitBreakerTrips: 0
        };
        
        this.setupStandardProtocols();
        this.setupStandardAdapters();
        this.startHealthMonitoring();
    }

    setupStandardProtocols() {
        // HTTP/REST Protocol
        this.registerProtocol('http', {
            name: 'HTTP/REST Protocol',
            send: async (message, endpoint) => {
                const response = await fetch(endpoint.url, {
                    method: message.method || 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...endpoint.headers,
                        ...message.headers
                    },
                    body: JSON.stringify(message.payload)
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                
                return await response.json();
            },
            receive: (server, callback) => {
                // Setup HTTP server receiver (simplified)
                server.on('request', async (req, res) => {
                    try {
                        const body = await this.parseRequestBody(req);
                        const result = await callback(body);
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(result));
                    } catch (error) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ error: error.message }));
                    }
                });
            }
        });

        // WebSocket Protocol
        this.registerProtocol('websocket', {
            name: 'WebSocket Protocol',
            send: async (message, endpoint) => {
                return new Promise((resolve, reject) => {
                    const ws = new WebSocket(endpoint.url);
                    const timeout = setTimeout(() => {
                        ws.close();
                        reject(new Error('WebSocket message timeout'));
                    }, this.config.messageTimeout);
                    
                    ws.on('open', () => {
                        ws.send(JSON.stringify(message));
                    });
                    
                    ws.on('message', (data) => {
                        clearTimeout(timeout);
                        try {
                            const response = JSON.parse(data.toString());
                            resolve(response);
                        } catch (error) {
                            reject(new Error('Invalid JSON response'));
                        }
                        ws.close();
                    });
                    
                    ws.on('error', (error) => {
                        clearTimeout(timeout);
                        reject(error);
                    });
                });
            },
            receive: (server, callback) => {
                server.on('connection', (ws) => {
                    ws.on('message', async (data) => {
                        try {
                            const message = JSON.parse(data.toString());
                            const result = await callback(message);
                            ws.send(JSON.stringify(result));
                        } catch (error) {
                            ws.send(JSON.stringify({ error: error.message }));
                        }
                    });
                });
            }
        });

        // Message Queue Protocol (Redis/RabbitMQ style)
        this.registerProtocol('message_queue', {
            name: 'Message Queue Protocol',
            send: async (message, endpoint) => {
                // Simulate message queue sending
                this.messageQueue.push({
                    ...message,
                    queue: endpoint.queue,
                    timestamp: Date.now()
                });
                return { queued: true, messageId: this.generateMessageId() };
            },
            receive: (config, callback) => {
                // Process message queue
                setInterval(() => {
                    const messages = this.messageQueue.splice(0, 10); // Process in batches
                    messages.forEach(async (message) => {
                        try {
                            await callback(message);
                        } catch (error) {
                            this.emit('message_processing_error', { message, error });
                        }
                    });
                }, 1000);
            }
        });

        // GraphQL Protocol
        this.registerProtocol('graphql', {
            name: 'GraphQL Protocol',
            send: async (message, endpoint) => {
                const response = await fetch(endpoint.url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...endpoint.headers
                    },
                    body: JSON.stringify({
                        query: message.query,
                        variables: message.variables || {},
                        operationName: message.operationName
                    })
                });
                
                const result = await response.json();
                if (result.errors) {
                    throw new Error(`GraphQL Error: ${result.errors[0].message}`);
                }
                
                return result.data;
            }
        });
    }

    setupStandardAdapters() {
        // AI Personality System Adapter
        this.registerAdapter('ai-personality', {
            name: 'AI Personality System Adapter',
            protocol: 'http',
            endpoints: {
                getAgent: '/api/agents/:id',
                updatePersonality: '/api/agents/:id/personality',
                triggerBehavior: '/api/agents/:id/behaviors/:behavior'
            },
            transform: {
                incoming: (data) => ({
                    agentId: data.id || data.agentId,
                    personality: data.personality || {},
                    behaviors: data.behaviors || [],
                    timestamp: new Date().toISOString()
                }),
                outgoing: (data) => ({
                    id: data.agentId,
                    personality: data.personality,
                    behaviors: data.behaviors
                })
            }
        });

        // Economic Engine Adapter
        this.registerAdapter('economic-engine', {
            name: 'Economic Engine Adapter',
            protocol: 'websocket',
            endpoints: {
                processTransaction: '/transactions',
                getMarketData: '/market/:symbol',
                updatePrices: '/market/prices'
            },
            transform: {
                incoming: (data) => ({
                    transactionId: data.id || data.transactionId,
                    amount: Number(data.amount || 0),
                    currency: (data.currency || 'USD').toUpperCase(),
                    participants: data.participants || [],
                    timestamp: new Date().toISOString()
                }),
                outgoing: (data) => ({
                    id: data.transactionId,
                    amount: data.amount,
                    currency: data.currency,
                    participants: data.participants
                })
            }
        });

        // Market Infrastructure Adapter
        this.registerAdapter('market-infrastructure', {
            name: 'Market Infrastructure Adapter',
            protocol: 'message_queue',
            endpoints: {
                submitOrder: 'orders.submit',
                cancelOrder: 'orders.cancel',
                marketData: 'market.data'
            },
            transform: {
                incoming: (data) => ({
                    orderId: data.id || data.orderId,
                    symbol: data.symbol,
                    side: data.side, // buy/sell
                    quantity: Number(data.quantity || 0),
                    price: Number(data.price || 0),
                    timestamp: new Date().toISOString()
                })
            }
        });

        // Visualization System Adapter
        this.registerAdapter('visualization', {
            name: 'Visualization System Adapter',
            protocol: 'websocket',
            endpoints: {
                updateChart: '/charts/:chartId',
                broadcastData: '/broadcast',
                subscribe: '/subscribe/:topic'
            },
            transform: {
                incoming: (data) => ({
                    chartId: data.chartId || data.id,
                    dataPoints: data.dataPoints || data.data,
                    config: data.config || {},
                    timestamp: new Date().toISOString()
                })
            }
        });
    }

    registerService(name, config) {
        const service = {
            name,
            ...config,
            registeredAt: new Date().toISOString(),
            status: 'registered',
            lastHealthCheck: null
        };
        
        this.services.set(name, service);
        this.statistics.activeServices++;
        
        // Create circuit breaker for the service
        const circuitBreaker = new CircuitBreaker(
            (message) => this.sendMessage(name, message),
            this.config.circuitBreakerOptions
        );
        
        circuitBreaker.on('open', () => {
            this.statistics.circuitBreakerTrips++;
            this.emit('circuit_breaker_opened', { service: name });
        });
        
        circuitBreaker.on('halfOpen', () => {
            this.emit('circuit_breaker_half_open', { service: name });
        });
        
        circuitBreaker.on('close', () => {
            this.emit('circuit_breaker_closed', { service: name });
        });
        
        this.circuitBreakers.set(name, circuitBreaker);
        this.emit('service_registered', { name, config });
        
        return service;
    }

    registerProtocol(name, protocol) {
        this.protocols.set(name, protocol);
        this.emit('protocol_registered', { name, protocol });
    }

    registerAdapter(serviceName, adapter) {
        this.adapters.set(serviceName, adapter);
        this.emit('adapter_registered', { serviceName, adapter });
    }

    async sendMessage(serviceName, message, options = {}) {
        const startTime = Date.now();
        
        try {
            this.statistics.totalMessages++;
            
            const service = this.services.get(serviceName);
            if (!service) {
                throw new Error(`Service ${serviceName} not registered`);
            }
            
            const adapter = this.adapters.get(serviceName);
            if (!adapter) {
                throw new Error(`No adapter found for service ${serviceName}`);
            }
            
            const protocol = this.protocols.get(adapter.protocol);
            if (!protocol) {
                throw new Error(`Protocol ${adapter.protocol} not supported`);
            }
            
            // Transform outgoing message
            let transformedMessage = message;
            if (adapter.transform && adapter.transform.outgoing) {
                transformedMessage = adapter.transform.outgoing(message);
            }
            
            // Add message metadata
            const enrichedMessage = {
                ...transformedMessage,
                messageId: this.generateMessageId(),
                timestamp: new Date().toISOString(),
                source: 'ecosystem-integration',
                target: serviceName
            };
            
            // Send message through protocol
            const endpoint = this.resolveEndpoint(service, adapter, options.endpoint);
            const response = await protocol.send(enrichedMessage, endpoint);
            
            // Transform incoming response
            let transformedResponse = response;
            if (adapter.transform && adapter.transform.incoming) {
                transformedResponse = adapter.transform.incoming(response);
            }
            
            const latency = Date.now() - startTime;
            this.statistics.averageLatency = 
                (this.statistics.averageLatency + latency) / 2;
            this.statistics.successfulMessages++;
            
            this.emit('message_sent', {
                serviceName,
                messageId: enrichedMessage.messageId,
                latency,
                success: true
            });
            
            return transformedResponse;
            
        } catch (error) {
            this.statistics.failedMessages++;
            
            this.emit('message_failed', {
                serviceName,
                error: error.message,
                latency: Date.now() - startTime
            });
            
            throw error;
        }
    }

    async sendMessageWithCircuitBreaker(serviceName, message, options = {}) {
        const circuitBreaker = this.circuitBreakers.get(serviceName);
        if (!circuitBreaker) {
            return this.sendMessage(serviceName, message, options);
        }
        
        try {
            return await circuitBreaker.fire(message, options);
        } catch (error) {
            if (circuitBreaker.opened) {
                throw new Error(`Service ${serviceName} is currently unavailable (circuit breaker open)`);
            }
            throw error;
        }
    }

    async broadcastMessage(message, targetServices = [], options = {}) {
        const services = targetServices.length > 0 ? 
            targetServices : Array.from(this.services.keys());
        
        const promises = services.map(serviceName => 
            this.sendMessageWithCircuitBreaker(serviceName, message, options)
                .catch(error => ({ serviceName, error: error.message }))
        );
        
        const results = await Promise.allSettled(promises);
        
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;
        
        this.emit('broadcast_completed', {
            targetServices: services.length,
            successful,
            failed,
            results
        });
        
        return {
            successful,
            failed,
            results: results.map((result, index) => ({
                service: services[index],
                success: result.status === 'fulfilled',
                data: result.status === 'fulfilled' ? result.value : result.reason
            }))
        };
    }

    resolveEndpoint(service, adapter, endpointName) {
        const baseUrl = service.baseUrl || service.url;
        const endpointPath = adapter.endpoints[endpointName] || endpointName || '/';
        
        return {
            url: `${baseUrl}${endpointPath}`,
            headers: service.headers || {},
            auth: service.auth || {},
            queue: service.queue,
            ...service.endpoint
        };
    }

    async discoverServices(pattern = '*') {
        // Service discovery implementation
        // This would integrate with actual service discovery mechanisms
        const discovered = [];
        
        if (this.config.enableServiceDiscovery) {
            // Simulate service discovery
            const potentialServices = [
                { name: 'ai-personality', url: 'http://localhost:3001' },
                { name: 'economic-engine', url: 'http://localhost:3002' },
                { name: 'market-infrastructure', url: 'http://localhost:3003' }
            ];
            
            for (const service of potentialServices) {
                try {
                    const health = await this.checkServiceHealth(service.url + '/health');
                    if (health.healthy) {
                        discovered.push(service);
                    }
                } catch (error) {
                    // Service not available
                }
            }
        }
        
        this.emit('services_discovered', { pattern, discovered });
        return discovered;
    }

    async checkServiceHealth(serviceName) {
        const service = this.services.get(serviceName);
        if (!service) {
            return { healthy: false, error: 'Service not registered' };
        }
        
        try {
            const healthEndpoint = service.healthEndpoint || '/health';
            const response = await fetch(`${service.baseUrl}${healthEndpoint}`, {
                timeout: 5000
            });
            
            const healthy = response.ok;
            service.lastHealthCheck = new Date().toISOString();
            service.status = healthy ? 'healthy' : 'unhealthy';
            
            return { healthy, status: response.status };
        } catch (error) {
            service.status = 'unreachable';
            return { healthy: false, error: error.message };
        }
    }

    startHealthMonitoring() {
        if (!this.config.enableHealthChecking) return;
        
        setInterval(async () => {
            const services = Array.from(this.services.keys());
            const healthChecks = await Promise.allSettled(
                services.map(name => this.checkServiceHealth(name))
            );
            
            const healthReport = services.map((name, index) => ({
                service: name,
                health: healthChecks[index].status === 'fulfilled' ? 
                    healthChecks[index].value : 
                    { healthy: false, error: healthChecks[index].reason.message }
            }));
            
            this.emit('health_report', healthReport);
        }, 30000); // Every 30 seconds
    }

    generateMessageId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    parseRequestBody(req) {
        return new Promise((resolve, reject) => {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    resolve(JSON.parse(body));
                } catch (error) {
                    reject(new Error('Invalid JSON'));
                }
            });
            req.on('error', reject);
        });
    }

    getStatistics() {
        return {
            ...this.statistics,
            registeredServices: this.services.size,
            registeredProtocols: this.protocols.size,
            registeredAdapters: this.adapters.size,
            queuedMessages: this.messageQueue.length
        };
    }

    getServiceStatus() {
        return Array.from(this.services.entries()).map(([name, service]) => ({
            name,
            status: service.status,
            lastHealthCheck: service.lastHealthCheck,
            circuitBreakerState: this.circuitBreakers.get(name)?.state || 'unknown'
        }));
    }

    getRegisteredServices() {
        return Array.from(this.services.keys());
    }

    getAvailableProtocols() {
        return Array.from(this.protocols.keys());
    }

    unregisterService(name) {
        const removed = this.services.delete(name);
        if (removed) {
            this.statistics.activeServices--;
            this.circuitBreakers.delete(name);
            this.emit('service_unregistered', { name });
        }
        return removed;
    }

    shutdown() {
        this.activeConnections.forEach(connection => {
            if (connection.close) connection.close();
        });
        this.activeConnections.clear();
        this.emit('framework_shutdown');
    }
}

module.exports = { SystemInteroperabilityFramework };
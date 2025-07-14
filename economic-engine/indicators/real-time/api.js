/**
 * Real-time Economic Indicators API
 * High-performance API for economic metrics with caching and streaming
 */

const express = require('express');
const WebSocket = require('ws');
const Redis = require('redis');
const { performance } = require('perf_hooks');

class RealTimeIndicatorsAPI {
    constructor(config = {}) {
        this.config = {
            cacheExpiry: config.cacheExpiry || 5000, // 5 seconds
            rateLimit: config.rateLimit || 1000, // requests per minute
            websocketPort: config.websocketPort || 8080,
            ...config
        };

        this.cache = new Map();
        this.subscribers = new Map();
        this.metrics = {
            requests: 0,
            cacheHits: 0,
            cacheMisses: 0,
            errors: 0,
            avgResponseTime: 0
        };

        this.setupRedisCache();
        this.setupWebSocketServer();
    }

    async setupRedisCache() {
        try {
            this.redis = Redis.createClient();
            await this.redis.connect();
            console.log('Redis cache connected');
        } catch (error) {
            console.warn('Redis not available, using in-memory cache:', error.message);
            this.redis = null;
        }
    }

    setupWebSocketServer() {
        this.wss = new WebSocket.Server({ port: this.config.websocketPort });
        
        this.wss.on('connection', (ws) => {
            const clientId = this.generateClientId();
            console.log(`WebSocket client connected: ${clientId}`);
            
            ws.clientId = clientId;
            ws.subscriptions = new Set();
            
            ws.on('message', (message) => {
                this.handleWebSocketMessage(ws, message);
            });
            
            ws.on('close', () => {
                this.removeSubscriptions(clientId);
                console.log(`WebSocket client disconnected: ${clientId}`);
            });
        });
    }

    handleWebSocketMessage(ws, message) {
        try {
            const data = JSON.parse(message);
            
            switch (data.type) {
                case 'subscribe':
                    this.addSubscription(ws, data.indicators);
                    break;
                case 'unsubscribe':
                    this.removeSubscription(ws, data.indicators);
                    break;
                case 'get_indicators':
                    this.sendIndicators(ws, data.indicators);
                    break;
            }
        } catch (error) {
            ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
    }

    addSubscription(ws, indicators) {
        if (!Array.isArray(indicators)) {
            indicators = [indicators];
        }
        
        indicators.forEach(indicator => {
            ws.subscriptions.add(indicator);
            
            if (!this.subscribers.has(indicator)) {
                this.subscribers.set(indicator, new Set());
            }
            this.subscribers.get(indicator).add(ws);
        });
        
        ws.send(JSON.stringify({ 
            type: 'subscription_confirmed', 
            indicators 
        }));
    }

    removeSubscription(ws, indicators) {
        if (!Array.isArray(indicators)) {
            indicators = [indicators];
        }
        
        indicators.forEach(indicator => {
            ws.subscriptions.delete(indicator);
            
            if (this.subscribers.has(indicator)) {
                this.subscribers.get(indicator).delete(ws);
            }
        });
    }

    removeSubscriptions(clientId) {
        // Remove all subscriptions for a disconnected client
        for (const [indicator, clients] of this.subscribers) {
            const clientsToRemove = [];
            clients.forEach(client => {
                if (client.clientId === clientId) {
                    clientsToRemove.push(client);
                }
            });
            clientsToRemove.forEach(client => clients.delete(client));
        }
    }

    async sendIndicators(ws, indicators) {
        const data = {};
        
        for (const indicator of indicators) {
            data[indicator] = await this.getIndicator(indicator);
        }
        
        ws.send(JSON.stringify({
            type: 'indicators_data',
            data,
            timestamp: Date.now()
        }));
    }

    async getIndicator(indicator) {
        const startTime = performance.now();
        this.metrics.requests++;
        
        try {
            // Check cache first
            const cached = await this.getCachedIndicator(indicator);
            if (cached) {
                this.metrics.cacheHits++;
                return cached;
            }
            
            this.metrics.cacheMisses++;
            
            // Generate indicator data
            const data = this.generateIndicatorData(indicator);
            
            // Cache the result
            await this.cacheIndicator(indicator, data);
            
            return data;
        } catch (error) {
            this.metrics.errors++;
            throw error;
        } finally {
            const endTime = performance.now();
            const responseTime = endTime - startTime;
            this.updateAverageResponseTime(responseTime);
        }
    }

    async getCachedIndicator(indicator) {
        // Try Redis first
        if (this.redis) {
            try {
                const cached = await this.redis.get(`indicator:${indicator}`);
                if (cached) {
                    return JSON.parse(cached);
                }
            } catch (error) {
                console.warn('Redis error:', error.message);
            }
        }
        
        // Fall back to memory cache
        const memCached = this.cache.get(indicator);
        if (memCached && Date.now() - memCached.timestamp < this.config.cacheExpiry) {
            return memCached.data;
        }
        
        return null;
    }

    async cacheIndicator(indicator, data) {
        const cacheData = {
            data,
            timestamp: Date.now()
        };
        
        // Cache in Redis
        if (this.redis) {
            try {
                await this.redis.setEx(
                    `indicator:${indicator}`, 
                    Math.floor(this.config.cacheExpiry / 1000),
                    JSON.stringify(data)
                );
            } catch (error) {
                console.warn('Redis cache error:', error.message);
            }
        }
        
        // Cache in memory
        this.cache.set(indicator, cacheData);
    }

    generateIndicatorData(indicator) {
        // This would connect to your economic engines
        // For now, returning mock data structure
        switch (indicator) {
            case 'market_health':
                return this.generateMarketHealthIndicator();
            case 'inflation_rate':
                return this.generateInflationIndicator();
            case 'sentiment_index':
                return this.generateSentimentIndicator();
            case 'volatility_index':
                return this.generateVolatilityIndicator();
            case 'scarcity_index':
                return this.generateScarcityIndicator();
            case 'agent_activity':
                return this.generateAgentActivityIndicator();
            default:
                throw new Error(`Unknown indicator: ${indicator}`);
        }
    }

    generateMarketHealthIndicator() {
        return {
            value: Math.random() * 100,
            status: ['healthy', 'warning', 'critical'][Math.floor(Math.random() * 3)],
            components: {
                liquidity: Math.random() * 100,
                spread: Math.random() * 5,
                volume: Math.random() * 1000000,
                participation: Math.random() * 100
            },
            timestamp: Date.now()
        };
    }

    generateInflationIndicator() {
        return {
            current: (Math.random() - 0.5) * 0.1, // -5% to +5%
            target: 0.02, // 2%
            trend: ['rising', 'falling', 'stable'][Math.floor(Math.random() * 3)],
            drivers: {
                money_supply: Math.random() * 0.05,
                demand_pressure: Math.random() * 0.03,
                cost_push: Math.random() * 0.02
            },
            forecast: Array.from({ length: 12 }, () => (Math.random() - 0.5) * 0.1),
            timestamp: Date.now()
        };
    }

    generateSentimentIndicator() {
        return {
            value: Math.random(), // 0-1 scale
            classification: ['bearish', 'neutral', 'bullish'][Math.floor(Math.random() * 3)],
            fear_greed: {
                fear: Math.random(),
                greed: Math.random()
            },
            herding_factor: Math.random(),
            confidence: Math.random(),
            timestamp: Date.now()
        };
    }

    generateVolatilityIndicator() {
        return {
            current: Math.random() * 0.5, // 0-50%
            average: Math.random() * 0.3, // 0-30%
            percentile: Math.random() * 100, // 0-100th percentile
            breakdown: {
                market_structure: Math.random() * 0.1,
                psychology: Math.random() * 0.2,
                external_events: Math.random() * 0.15
            },
            forecast: Array.from({ length: 24 }, () => Math.random() * 0.5),
            timestamp: Date.now()
        };
    }

    generateScarcityIndicator() {
        return {
            global_index: Math.random(),
            critical_resources: Math.floor(Math.random() * 5),
            commodities: {
                oil: Math.random(),
                lithium: Math.random(),
                rare_earth: Math.random(),
                water: Math.random(),
                arable_land: Math.random()
            },
            time_to_depletion: {
                oil: Math.random() * 50 + 10, // 10-60 years
                lithium: Math.random() * 30 + 20, // 20-50 years
                rare_earth: Math.random() * 40 + 30 // 30-70 years
            },
            timestamp: Date.now()
        };
    }

    generateAgentActivityIndicator() {
        return {
            total_agents: Math.floor(Math.random() * 100000),
            active_agents: Math.floor(Math.random() * 80000),
            transactions_per_second: Math.floor(Math.random() * 1000),
            average_wealth: Math.random() * 10000,
            wealth_distribution: {
                gini_coefficient: Math.random(),
                percentiles: {
                    p10: Math.random() * 1000,
                    p50: Math.random() * 5000,
                    p90: Math.random() * 20000,
                    p99: Math.random() * 100000
                }
            },
            behavior_distribution: {
                conservative: Math.random(),
                balanced: Math.random(),
                aggressive: Math.random()
            },
            timestamp: Date.now()
        };
    }

    broadcastUpdate(indicator, data) {
        if (this.subscribers.has(indicator)) {
            const message = JSON.stringify({
                type: 'indicator_update',
                indicator,
                data,
                timestamp: Date.now()
            });
            
            this.subscribers.get(indicator).forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }
    }

    updateAverageResponseTime(responseTime) {
        this.metrics.avgResponseTime = (this.metrics.avgResponseTime * 0.9) + (responseTime * 0.1);
    }

    generateClientId() {
        return Math.random().toString(36).substr(2, 9);
    }

    getMetrics() {
        return {
            ...this.metrics,
            cacheHitRate: this.metrics.requests > 0 ? this.metrics.cacheHits / this.metrics.requests : 0,
            errorRate: this.metrics.requests > 0 ? this.metrics.errors / this.metrics.requests : 0,
            activeSubscriptions: this.subscribers.size,
            connectedClients: this.wss.clients.size
        };
    }

    // Express middleware for HTTP API
    createMiddleware() {
        const router = express.Router();
        
        router.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                metrics: this.getMetrics(),
                timestamp: Date.now()
            });
        });
        
        router.get('/indicators/:indicator', async (req, res) => {
            try {
                const data = await this.getIndicator(req.params.indicator);
                res.json(data);
            } catch (error) {
                res.status(404).json({ error: error.message });
            }
        });
        
        router.get('/indicators', async (req, res) => {
            const indicators = req.query.indicators?.split(',') || [
                'market_health', 'inflation_rate', 'sentiment_index', 
                'volatility_index', 'scarcity_index', 'agent_activity'
            ];
            
            const data = {};
            for (const indicator of indicators) {
                try {
                    data[indicator] = await this.getIndicator(indicator);
                } catch (error) {
                    data[indicator] = { error: error.message };
                }
            }
            
            res.json(data);
        });
        
        return router;
    }

    start() {
        console.log(`WebSocket server listening on port ${this.config.websocketPort}`);
        console.log(`Use ws://localhost:${this.config.websocketPort} to connect`);
    }

    stop() {
        this.wss.close();
        if (this.redis) {
            this.redis.disconnect();
        }
    }
}

module.exports = RealTimeIndicatorsAPI;
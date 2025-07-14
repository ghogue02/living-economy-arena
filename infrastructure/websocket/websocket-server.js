/**
 * High-Performance WebSocket Server for Living Economy Arena
 * Target: 100,000+ concurrent connections with <50ms latency
 */

const cluster = require('cluster');
const WebSocket = require('ws');
const redis = require('redis');
const { createAdapter } = require('@socket.io/redis-adapter');
const os = require('os');

const CLUSTER_WORKERS = process.env.CLUSTER_WORKERS || os.cpus().length;
const PORT = process.env.WS_PORT || 3001;
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

class HighPerformanceWebSocketServer {
    constructor() {
        this.connections = new Map();
        this.connectionCount = 0;
        this.messageQueue = [];
        this.redisClient = null;
        this.shardId = process.env.SHARD_ID || Math.floor(Math.random() * 1000);
        
        this.initializeRedis();
        this.setupMetrics();
    }

    async initializeRedis() {
        this.redisClient = redis.createClient({ url: REDIS_URL });
        this.redisSubscriber = redis.createClient({ url: REDIS_URL });
        
        await this.redisClient.connect();
        await this.redisSubscriber.connect();
        
        // Subscribe to cross-shard messages
        this.redisSubscriber.subscribe('shard-broadcast', (message) => {
            this.broadcastToShard(JSON.parse(message));
        });
        
        console.log(`Shard ${this.shardId}: Redis connected`);
    }

    setupMetrics() {
        this.metrics = {
            connectionsTotal: 0,
            messagesPerSecond: 0,
            averageLatency: 0,
            errorRate: 0,
            memoryUsage: 0
        };

        // Update metrics every second
        setInterval(() => {
            this.updateMetrics();
            this.reportMetrics();
        }, 1000);
    }

    createServer() {
        const wss = new WebSocket.Server({ 
            port: PORT,
            perMessageDeflate: {
                zlibDeflateOptions: {
                    chunkSize: 4 * 1024,
                    windowBits: 13,
                    level: 3
                },
                threshold: 1024,
                concurrencyLimit: 10
            },
            maxPayload: 64 * 1024, // 64KB max message size
        });

        wss.on('connection', (ws, req) => {
            this.handleConnection(ws, req);
        });

        console.log(`Shard ${this.shardId}: WebSocket server listening on port ${PORT}`);
        return wss;
    }

    handleConnection(ws, req) {
        const connectionId = this.generateConnectionId();
        const clientInfo = {
            id: connectionId,
            ip: req.socket.remoteAddress,
            userAgent: req.headers['user-agent'],
            connectedAt: Date.now(),
            lastActivity: Date.now(),
            shard: this.shardId
        };

        this.connections.set(connectionId, { ws, info: clientInfo });
        this.connectionCount++;

        // Send connection acknowledgment
        this.sendMessage(ws, {
            type: 'connection_ack',
            connectionId,
            shardId: this.shardId,
            timestamp: Date.now()
        });

        // Handle messages
        ws.on('message', (data) => {
            this.handleMessage(connectionId, data);
        });

        // Handle disconnection
        ws.on('close', () => {
            this.handleDisconnection(connectionId);
        });

        // Handle errors
        ws.on('error', (error) => {
            console.error(`Shard ${this.shardId}: WebSocket error for ${connectionId}:`, error);
            this.handleDisconnection(connectionId);
        });

        // Heartbeat mechanism
        ws.isAlive = true;
        ws.on('pong', () => {
            ws.isAlive = true;
            this.connections.get(connectionId).info.lastActivity = Date.now();
        });

        console.log(`Shard ${this.shardId}: New connection ${connectionId} (Total: ${this.connectionCount})`);
    }

    handleMessage(connectionId, data) {
        const startTime = Date.now();
        
        try {
            const message = JSON.parse(data);
            const connection = this.connections.get(connectionId);
            
            if (!connection) return;

            connection.info.lastActivity = Date.now();

            switch (message.type) {
                case 'economic_transaction':
                    this.handleEconomicTransaction(connectionId, message);
                    break;
                case 'agent_update':
                    this.handleAgentUpdate(connectionId, message);
                    break;
                case 'market_data_request':
                    this.handleMarketDataRequest(connectionId, message);
                    break;
                case 'ping':
                    this.sendMessage(connection.ws, { type: 'pong', timestamp: Date.now() });
                    break;
                default:
                    console.warn(`Shard ${this.shardId}: Unknown message type: ${message.type}`);
            }

            // Track latency
            const latency = Date.now() - startTime;
            this.updateLatencyMetric(latency);

        } catch (error) {
            console.error(`Shard ${this.shardId}: Error processing message from ${connectionId}:`, error);
            this.metrics.errorRate++;
        }
    }

    handleEconomicTransaction(connectionId, message) {
        // Process economic transaction with WebAssembly module
        const transaction = {
            id: this.generateTransactionId(),
            connectionId,
            data: message.data,
            timestamp: Date.now(),
            shardId: this.shardId
        };

        // Store in Redis for cross-shard consistency
        this.redisClient.setex(`transaction:${transaction.id}`, 3600, JSON.stringify(transaction));

        // Broadcast to relevant connections
        this.broadcastTransaction(transaction);
    }

    handleAgentUpdate(connectionId, message) {
        // Process agent state update
        const update = {
            connectionId,
            agentId: message.agentId,
            state: message.state,
            timestamp: Date.now(),
            shardId: this.shardId
        };

        // Store agent state in Redis
        this.redisClient.setex(`agent:${message.agentId}`, 1800, JSON.stringify(update));

        // Notify other shards of agent update
        this.redisClient.publish('shard-broadcast', JSON.stringify({
            type: 'agent_update',
            data: update
        }));
    }

    handleMarketDataRequest(connectionId, message) {
        // Fetch market data for requested assets
        this.getMarketData(message.assets).then(data => {
            const connection = this.connections.get(connectionId);
            if (connection) {
                this.sendMessage(connection.ws, {
                    type: 'market_data',
                    requestId: message.requestId,
                    data: data,
                    timestamp: Date.now()
                });
            }
        });
    }

    async getMarketData(assets) {
        // Implement market data retrieval from Redis cache or external API
        const data = {};
        for (const asset of assets) {
            const cached = await this.redisClient.get(`market:${asset}`);
            if (cached) {
                data[asset] = JSON.parse(cached);
            }
        }
        return data;
    }

    broadcastTransaction(transaction) {
        // Broadcast to connections interested in this transaction type
        for (const [connectionId, connection] of this.connections) {
            if (this.shouldReceiveTransaction(connection, transaction)) {
                this.sendMessage(connection.ws, {
                    type: 'transaction_broadcast',
                    transaction: transaction,
                    timestamp: Date.now()
                });
            }
        }
    }

    broadcastToShard(message) {
        // Handle cross-shard broadcasts
        switch (message.type) {
            case 'agent_update':
                this.broadcastToRelevantConnections(message);
                break;
            case 'global_announcement':
                this.broadcastToAll(message);
                break;
        }
    }

    sendMessage(ws, message) {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify(message));
        }
    }

    handleDisconnection(connectionId) {
        const connection = this.connections.get(connectionId);
        if (connection) {
            this.connections.delete(connectionId);
            this.connectionCount--;
            
            // Clean up agent state if applicable
            if (connection.info.agentId) {
                this.redisClient.del(`agent:${connection.info.agentId}`);
            }
            
            console.log(`Shard ${this.shardId}: Disconnected ${connectionId} (Total: ${this.connectionCount})`);
        }
    }

    setupHeartbeat() {
        setInterval(() => {
            for (const [connectionId, connection] of this.connections) {
                if (!connection.ws.isAlive) {
                    console.log(`Shard ${this.shardId}: Terminating inactive connection ${connectionId}`);
                    connection.ws.terminate();
                    this.handleDisconnection(connectionId);
                    continue;
                }
                
                connection.ws.isAlive = false;
                connection.ws.ping();
            }
        }, 30000); // 30 second heartbeat
    }

    updateMetrics() {
        this.metrics.connectionsTotal = this.connectionCount;
        this.metrics.memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    }

    reportMetrics() {
        // Send metrics to Redis for monitoring dashboard
        this.redisClient.setex(`metrics:shard:${this.shardId}`, 60, JSON.stringify({
            ...this.metrics,
            timestamp: Date.now(),
            shardId: this.shardId
        }));
    }

    generateConnectionId() {
        return `${this.shardId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    generateTransactionId() {
        return `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    shouldReceiveTransaction(connection, transaction) {
        // Implement filtering logic based on connection preferences
        return true; // For now, broadcast to all
    }

    broadcastToRelevantConnections(message) {
        // Implement intelligent message routing
        for (const [connectionId, connection] of this.connections) {
            this.sendMessage(connection.ws, message);
        }
    }

    broadcastToAll(message) {
        for (const [connectionId, connection] of this.connections) {
            this.sendMessage(connection.ws, message);
        }
    }

    updateLatencyMetric(latency) {
        // Update rolling average latency
        this.metrics.averageLatency = (this.metrics.averageLatency * 0.9) + (latency * 0.1);
    }
}

// Cluster setup for horizontal scaling
if (cluster.isMaster) {
    console.log(`Master process ${process.pid} starting ${CLUSTER_WORKERS} workers`);
    
    for (let i = 0; i < CLUSTER_WORKERS; i++) {
        cluster.fork({ SHARD_ID: i });
    }
    
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died, restarting...`);
        cluster.fork();
    });
} else {
    const server = new HighPerformanceWebSocketServer();
    const wss = server.createServer();
    server.setupHeartbeat();
    
    console.log(`Worker ${process.pid} started as shard ${server.shardId}`);
}

module.exports = HighPerformanceWebSocketServer;
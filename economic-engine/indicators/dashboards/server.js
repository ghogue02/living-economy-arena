/**
 * Real-time Economic Indicators Dashboard Server
 * WebSocket-based real-time economic metrics for 100,000+ AI agents
 */

const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');

const EconomicSimulationEngine = require('../../core/simulation/engine');
const SupplyDemandEngine = require('../../core/supply-demand/algorithms');
const MarketPsychologyEngine = require('../../core/volatility/psychology');
const MonetaryPolicyEngine = require('../../core/inflation/monetary-policy');
const CommodityScarcityEngine = require('../../markets/commodities/scarcity-engine');

class EconomicDashboardServer {
    constructor(config = {}) {
        this.config = {
            port: config.port || 3000,
            updateInterval: config.updateInterval || 1000, // 1 second
            historyLimit: config.historyLimit || 1000,
            ...config
        };

        // Initialize economic engines
        this.economicEngine = new EconomicSimulationEngine();
        this.supplyDemandEngine = new SupplyDemandEngine();
        this.psychologyEngine = new MarketPsychologyEngine();
        this.monetaryEngine = new MonetaryPolicyEngine();
        this.scarcityEngine = new CommodityScarcityEngine();

        // Initialize Express and Socket.IO
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = socketIo(this.server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        this.connectedClients = new Set();
        this.setupMiddleware();
        this.setupRoutes();
        this.setupWebSocket();
        this.startRealTimeUpdates();
    }

    setupMiddleware() {
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.static(path.join(__dirname, 'public')));
    }

    setupRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.json({ 
                status: 'healthy', 
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                agents: this.economicEngine.state.totalAgents,
                markets: this.economicEngine.markets.size
            });
        });

        // Get all economic indicators
        this.app.get('/api/indicators', (req, res) => {
            res.json(this.getAllIndicators());
        });

        // Get market data
        this.app.get('/api/markets', (req, res) => {
            const marketId = req.query.market;
            res.json(this.economicEngine.getMarketData(marketId));
        });

        // Get market psychology
        this.app.get('/api/psychology', (req, res) => {
            res.json(this.psychologyEngine.getPsychologyState());
        });

        // Get monetary policy data
        this.app.get('/api/monetary', (req, res) => {
            res.json(this.monetaryEngine.getMonetaryState());
        });

        // Get commodity scarcity data
        this.app.get('/api/scarcity', (req, res) => {
            res.json(this.scarcityEngine.getScarcityState());
        });

        // Get historical data
        this.app.get('/api/history/:indicator', (req, res) => {
            const indicator = req.params.indicator;
            const points = parseInt(req.query.points) || 100;
            res.json(this.getHistoricalData(indicator, points));
        });

        // Agent management endpoints
        this.app.post('/api/agents/register', (req, res) => {
            const agentId = this.economicEngine.registerAgent(req.body);
            res.json({ agentId, status: 'registered' });
        });

        this.app.delete('/api/agents/:agentId', (req, res) => {
            this.economicEngine.unregisterAgent(req.params.agentId);
            res.json({ status: 'unregistered' });
        });

        this.app.post('/api/agents/:agentId/action', (req, res) => {
            const success = this.economicEngine.submitAgentAction(req.params.agentId, req.body);
            res.json({ success });
        });

        // Dashboard UI
        this.app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
        });
    }

    setupWebSocket() {
        this.io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);
            this.connectedClients.add(socket);

            // Send initial data
            socket.emit('initial_data', this.getAllIndicators());

            // Handle client subscriptions
            socket.on('subscribe', (indicators) => {
                socket.subscribedIndicators = indicators;
            });

            socket.on('disconnect', () => {
                console.log('Client disconnected:', socket.id);
                this.connectedClients.delete(socket);
            });

            // Handle real-time agent actions
            socket.on('agent_action', (data) => {
                this.handleRealTimeAgentAction(data);
            });
        });
    }

    startRealTimeUpdates() {
        setInterval(() => {
            if (this.connectedClients.size > 0) {
                const indicators = this.getAllIndicators();
                this.io.emit('indicators_update', indicators);
            }
        }, this.config.updateInterval);

        // Listen to economic engine events
        this.economicEngine.on('tick', (data) => {
            this.io.emit('market_tick', data);
        });

        this.psychologyEngine.on('psychology_update', (data) => {
            this.io.emit('psychology_update', data);
        });

        this.monetaryEngine.on('inflation_update', (data) => {
            this.io.emit('inflation_update', data);
        });

        this.monetaryEngine.on('monetary_policy', (data) => {
            this.io.emit('monetary_policy_event', data);
        });

        this.scarcityEngine.on('scarcity_update', (data) => {
            this.io.emit('scarcity_update', data);
        });

        this.scarcityEngine.on('discovery_event', (data) => {
            this.io.emit('discovery_event', data);
        });

        this.scarcityEngine.on('catastrophic_event', (data) => {
            this.io.emit('catastrophic_event', data);
        });
    }

    getAllIndicators() {
        const economicIndicators = this.economicEngine.getEconomicIndicators();
        const marketData = this.economicEngine.getMarketData();
        const psychologyState = this.psychologyEngine.getPsychologyState();
        const monetaryState = this.monetaryEngine.getMonetaryState();
        const scarcityState = this.scarcityEngine.getScarcityState();

        return {
            timestamp: Date.now(),
            economic: economicIndicators,
            markets: marketData,
            psychology: psychologyState,
            monetary: monetaryState,
            scarcity: scarcityState,
            performance: this.getPerformanceMetrics()
        };
    }

    getHistoricalData(indicator, points) {
        switch (indicator) {
            case 'inflation':
                return this.monetaryEngine.getInflationHistory(points);
            case 'money_supply':
                return this.monetaryEngine.getMoneySupplyHistory(points);
            case 'psychology':
                return this.psychologyEngine.sentimentHistory.slice(-points);
            case 'scarcity':
                return this.scarcityEngine.getRecentEvents(points);
            default:
                return [];
        }
    }

    getPerformanceMetrics() {
        return {
            totalAgents: this.economicEngine.state.totalAgents,
            activeMarkets: this.economicEngine.markets.size,
            tickRate: this.config.updateInterval,
            connectedClients: this.connectedClients.size,
            memoryUsage: process.memoryUsage(),
            uptime: process.uptime()
        };
    }

    handleRealTimeAgentAction(data) {
        // Validate and process real-time agent actions
        if (data.agentId && data.action) {
            this.economicEngine.submitAgentAction(data.agentId, data.action);
        }
    }

    start() {
        this.server.listen(this.config.port, () => {
            console.log(`Economic Dashboard Server running on port ${this.config.port}`);
            console.log(`Dashboard URL: http://localhost:${this.config.port}`);
            console.log(`WebSocket endpoint: ws://localhost:${this.config.port}`);
        });
    }

    stop() {
        this.economicEngine.stop();
        this.server.close();
    }
}

module.exports = EconomicDashboardServer;

// Start server if run directly
if (require.main === module) {
    const server = new EconomicDashboardServer();
    server.start();

    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('Shutting down dashboard server...');
        server.stop();
        process.exit(0);
    });
}
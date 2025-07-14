/**
 * Living Economy Arena - Core Economic Simulation Engine
 * Supports 100,000+ concurrent AI agents with real-time economic dynamics
 */

const EventEmitter = require('eventemitter3');
const Decimal = require('decimal.js');
const { v4: uuidv4 } = require('uuid');
const logger = require('pino')();

class EconomicSimulationEngine extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            maxAgents: config.maxAgents || 100000,
            tickRate: config.tickRate || 100, // ms per economic tick
            marketOpenHours: config.marketOpenHours || 24,
            baseInflationRate: config.baseInflationRate || 0.02,
            volatilityThreshold: config.volatilityThreshold || 0.1,
            ...config
        };

        this.state = {
            currentTick: 0,
            totalAgents: 0,
            marketCap: new Decimal(1000000000), // $1B starting market cap
            moneySupply: new Decimal(10000000000), // $10B money supply
            inflationRate: new Decimal(this.config.baseInflationRate),
            globalSentiment: 0.5, // 0-1 scale (0=panic, 1=euphoria)
            isRunning: false
        };

        this.markets = new Map();
        this.agents = new Map();
        this.priceHistory = new Map();
        this.economicEvents = [];
        
        this.initializeMarkets();
        this.startSimulation();
    }

    initializeMarkets() {
        // Core commodity markets
        const commodities = [
            { id: 'food', name: 'Food', basePrice: 10, volatility: 0.05, scarcity: 0.3 },
            { id: 'energy', name: 'Energy', basePrice: 50, volatility: 0.15, scarcity: 0.4 },
            { id: 'materials', name: 'Raw Materials', basePrice: 25, volatility: 0.08, scarcity: 0.35 },
            { id: 'technology', name: 'Technology', basePrice: 100, volatility: 0.12, scarcity: 0.2 },
            { id: 'services', name: 'Services', basePrice: 30, volatility: 0.06, scarcity: 0.1 }
        ];

        commodities.forEach(commodity => {
            this.markets.set(commodity.id, {
                ...commodity,
                currentPrice: new Decimal(commodity.basePrice),
                supply: new Decimal(1000000),
                demand: new Decimal(1000000),
                totalVolume: new Decimal(0),
                priceHistory: [],
                agents: new Set(),
                lastUpdate: Date.now()
            });
        });

        logger.info('Initialized markets', { count: this.markets.size });
    }

    startSimulation() {
        if (this.state.isRunning) return;
        
        this.state.isRunning = true;
        this.simulationInterval = setInterval(() => {
            this.tick();
        }, this.config.tickRate);

        logger.info('Economic simulation started', { 
            tickRate: this.config.tickRate,
            maxAgents: this.config.maxAgents 
        });
    }

    tick() {
        this.state.currentTick++;
        const tickStart = Date.now();

        try {
            // Update market dynamics
            this.updateMarketPrices();
            
            // Process agent behaviors
            this.processAgentBehaviors();
            
            // Update economic indicators
            this.updateEconomicIndicators();
            
            // Handle random economic events
            this.processEconomicEvents();
            
            // Emit tick event for real-time updates
            this.emit('tick', {
                tick: this.state.currentTick,
                marketCap: this.state.marketCap.toString(),
                inflationRate: this.state.inflationRate.toString(),
                globalSentiment: this.state.globalSentiment,
                processingTime: Date.now() - tickStart
            });

        } catch (error) {
            logger.error('Error in simulation tick', { error: error.message, tick: this.state.currentTick });
        }
    }

    updateMarketPrices() {
        for (const [marketId, market] of this.markets) {
            const oldPrice = market.currentPrice;
            
            // Calculate supply/demand ratio
            const supplyDemandRatio = market.supply.div(market.demand);
            
            // Base price adjustment from supply/demand
            let priceMultiplier = new Decimal(1);
            if (supplyDemandRatio.lt(1)) {
                // Demand > Supply: Price increase
                priceMultiplier = new Decimal(2).minus(supplyDemandRatio);
            } else {
                // Supply > Demand: Price decrease
                priceMultiplier = supplyDemandRatio.div(2);
            }

            // Apply volatility based on agent psychology
            const volatilityFactor = this.calculateVolatilityFactor(market);
            const randomVolatility = (Math.random() - 0.5) * market.volatility * volatilityFactor;
            priceMultiplier = priceMultiplier.mul(new Decimal(1 + randomVolatility));

            // Apply inflation
            const inflationAdjustment = this.state.inflationRate.div(525600); // Per tick inflation
            priceMultiplier = priceMultiplier.mul(new Decimal(1).plus(inflationAdjustment));

            // Update price
            market.currentPrice = oldPrice.mul(priceMultiplier);
            
            // Ensure minimum price
            if (market.currentPrice.lt(market.basePrice * 0.1)) {
                market.currentPrice = new Decimal(market.basePrice * 0.1);
            }

            // Store price history
            market.priceHistory.push({
                timestamp: Date.now(),
                price: market.currentPrice.toNumber(),
                volume: market.totalVolume.toNumber(),
                supplyDemandRatio: supplyDemandRatio.toNumber()
            });

            // Keep only last 1000 price points
            if (market.priceHistory.length > 1000) {
                market.priceHistory.shift();
            }

            market.lastUpdate = Date.now();
        }
    }

    calculateVolatilityFactor(market) {
        // Volatility increases with:
        // 1. Extreme global sentiment (panic or euphoria)
        // 2. High scarcity
        // 3. Large supply/demand imbalances
        
        const sentimentVolatility = Math.abs(this.state.globalSentiment - 0.5) * 4; // 0-2 range
        const scarcityVolatility = market.scarcity * 2; // 0-2 range
        const imbalanceVolatility = Math.abs(market.supply.div(market.demand).toNumber() - 1) * 3;
        
        return Math.min(sentimentVolatility + scarcityVolatility + imbalanceVolatility, 5);
    }

    processAgentBehaviors() {
        // Aggregate agent psychology affects global sentiment
        let totalSentiment = 0;
        let agentCount = 0;

        for (const [agentId, agent] of this.agents) {
            if (agent.isActive) {
                totalSentiment += agent.sentiment || 0.5;
                agentCount++;
                
                // Process agent market decisions
                this.processAgentMarketActions(agent);
            }
        }

        if (agentCount > 0) {
            this.state.globalSentiment = totalSentiment / agentCount;
        }
    }

    processAgentMarketActions(agent) {
        // Simplified agent behavior - real implementation would be more complex
        for (const action of agent.pendingActions || []) {
            const market = this.markets.get(action.marketId);
            if (!market) continue;

            if (action.type === 'buy') {
                market.demand = market.demand.plus(action.quantity);
                market.totalVolume = market.totalVolume.plus(action.quantity);
            } else if (action.type === 'sell') {
                market.supply = market.supply.plus(action.quantity);
                market.totalVolume = market.totalVolume.plus(action.quantity);
            }
        }

        // Clear processed actions
        agent.pendingActions = [];
    }

    updateEconomicIndicators() {
        // Calculate market capitalization
        let totalMarketCap = new Decimal(0);
        for (const [marketId, market] of this.markets) {
            const marketValue = market.currentPrice.mul(market.supply);
            totalMarketCap = totalMarketCap.plus(marketValue);
        }
        this.state.marketCap = totalMarketCap;

        // Update inflation based on money supply and market activity
        const moneyVelocity = this.calculateMoneyVelocity();
        const inflationPressure = moneyVelocity * this.state.globalSentiment;
        this.state.inflationRate = new Decimal(this.config.baseInflationRate).mul(1 + inflationPressure);
    }

    calculateMoneyVelocity() {
        // Simplified money velocity calculation
        let totalVolume = new Decimal(0);
        for (const [marketId, market] of this.markets) {
            totalVolume = totalVolume.plus(market.totalVolume);
        }
        return totalVolume.div(this.state.moneySupply).toNumber();
    }

    processEconomicEvents() {
        // Random economic events that affect markets
        if (Math.random() < 0.001) { // 0.1% chance per tick
            this.triggerRandomEconomicEvent();
        }
    }

    triggerRandomEconomicEvent() {
        const events = [
            { type: 'resource_discovery', effect: 'supply_increase', magnitude: 0.2 },
            { type: 'natural_disaster', effect: 'supply_decrease', magnitude: 0.3 },
            { type: 'technological_breakthrough', effect: 'efficiency_increase', magnitude: 0.15 },
            { type: 'political_instability', effect: 'sentiment_decrease', magnitude: 0.4 },
            { type: 'trade_agreement', effect: 'demand_increase', magnitude: 0.25 }
        ];

        const event = events[Math.floor(Math.random() * events.length)];
        const affectedMarket = Array.from(this.markets.keys())[Math.floor(Math.random() * this.markets.size)];
        
        this.applyEconomicEvent(event, affectedMarket);
        
        logger.info('Economic event triggered', { 
            event: event.type, 
            market: affectedMarket, 
            magnitude: event.magnitude 
        });
    }

    applyEconomicEvent(event, marketId) {
        const market = this.markets.get(marketId);
        if (!market) return;

        const magnitude = event.magnitude;
        
        switch (event.effect) {
            case 'supply_increase':
                market.supply = market.supply.mul(1 + magnitude);
                break;
            case 'supply_decrease':
                market.supply = market.supply.mul(1 - magnitude);
                break;
            case 'demand_increase':
                market.demand = market.demand.mul(1 + magnitude);
                break;
            case 'sentiment_decrease':
                this.state.globalSentiment = Math.max(0, this.state.globalSentiment - magnitude);
                break;
            case 'efficiency_increase':
                market.volatility = Math.max(0.01, market.volatility - magnitude);
                break;
        }

        this.economicEvents.push({
            timestamp: Date.now(),
            event: event.type,
            market: marketId,
            effect: event.effect,
            magnitude: magnitude
        });
    }

    // Agent Management API
    registerAgent(agentConfig) {
        const agentId = uuidv4();
        const agent = {
            id: agentId,
            isActive: true,
            sentiment: 0.5,
            wealth: new Decimal(agentConfig.initialWealth || 1000),
            portfolio: new Map(),
            pendingActions: [],
            behaviorProfile: agentConfig.behaviorProfile || 'balanced',
            createdAt: Date.now(),
            ...agentConfig
        };

        this.agents.set(agentId, agent);
        this.state.totalAgents++;
        
        logger.info('Agent registered', { agentId, totalAgents: this.state.totalAgents });
        return agentId;
    }

    unregisterAgent(agentId) {
        if (this.agents.delete(agentId)) {
            this.state.totalAgents--;
            logger.info('Agent unregistered', { agentId, totalAgents: this.state.totalAgents });
        }
    }

    submitAgentAction(agentId, action) {
        const agent = this.agents.get(agentId);
        if (!agent || !agent.isActive) return false;

        agent.pendingActions.push({
            ...action,
            timestamp: Date.now()
        });
        
        return true;
    }

    // Market Data API
    getMarketData(marketId = null) {
        if (marketId) {
            const market = this.markets.get(marketId);
            return market ? this.formatMarketData(marketId, market) : null;
        }
        
        const allMarkets = {};
        for (const [id, market] of this.markets) {
            allMarkets[id] = this.formatMarketData(id, market);
        }
        return allMarkets;
    }

    formatMarketData(marketId, market) {
        return {
            id: marketId,
            name: market.name,
            currentPrice: market.currentPrice.toNumber(),
            basePrice: market.basePrice,
            supply: market.supply.toNumber(),
            demand: market.demand.toNumber(),
            volume: market.totalVolume.toNumber(),
            volatility: market.volatility,
            scarcity: market.scarcity,
            priceHistory: market.priceHistory.slice(-100), // Last 100 points
            lastUpdate: market.lastUpdate
        };
    }

    getEconomicIndicators() {
        return {
            currentTick: this.state.currentTick,
            totalAgents: this.state.totalAgents,
            marketCap: this.state.marketCap.toString(),
            moneySupply: this.state.moneySupply.toString(),
            inflationRate: this.state.inflationRate.toNumber(),
            globalSentiment: this.state.globalSentiment,
            moneyVelocity: this.calculateMoneyVelocity(),
            averageVolatility: this.calculateAverageVolatility(),
            recentEvents: this.economicEvents.slice(-10)
        };
    }

    calculateAverageVolatility() {
        let totalVolatility = 0;
        for (const [marketId, market] of this.markets) {
            totalVolatility += market.volatility;
        }
        return totalVolatility / this.markets.size;
    }

    stop() {
        if (this.simulationInterval) {
            clearInterval(this.simulationInterval);
            this.simulationInterval = null;
        }
        this.state.isRunning = false;
        logger.info('Economic simulation stopped');
    }
}

module.exports = EconomicSimulationEngine;

// Start engine if run directly
if (require.main === module) {
    const engine = new EconomicSimulationEngine();
    
    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('Shutting down economic simulation...');
        engine.stop();
        process.exit(0);
    });
}
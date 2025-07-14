/**
 * Integration Tests for Economic Simulation Engine
 * Comprehensive testing of economic dynamics and agent interactions
 */

const { jest } = require('@jest/globals');
const EconomicSimulationEngine = require('../../core/simulation/engine');
const SupplyDemandEngine = require('../../core/supply-demand/algorithms');
const MarketPsychologyEngine = require('../../core/volatility/psychology');
const MonetaryPolicyEngine = require('../../core/inflation/monetary-policy');
const CommodityScarcityEngine = require('../../markets/commodities/scarcity-engine');

describe('Economic Simulation Engine Integration Tests', () => {
    let economicEngine;
    let supplyDemandEngine;
    let psychologyEngine;
    let monetaryEngine;
    let scarcityEngine;

    beforeEach(() => {
        economicEngine = new EconomicSimulationEngine({
            maxAgents: 1000,
            tickRate: 10, // Faster for testing
            baseInflationRate: 0.02
        });
        
        supplyDemandEngine = new SupplyDemandEngine();
        psychologyEngine = new MarketPsychologyEngine();
        monetaryEngine = new MonetaryPolicyEngine();
        scarcityEngine = new CommodityScarcityEngine();
    });

    afterEach(() => {
        economicEngine.stop();
    });

    describe('Basic Economic Engine Functionality', () => {
        test('should initialize with default markets', () => {
            expect(economicEngine.markets.size).toBeGreaterThan(0);
            expect(economicEngine.state.isRunning).toBe(true);
            expect(economicEngine.state.totalAgents).toBe(0);
        });

        test('should register and manage agents', () => {
            const agentId1 = economicEngine.registerAgent({
                initialWealth: 1000,
                behaviorProfile: 'balanced'
            });
            
            const agentId2 = economicEngine.registerAgent({
                initialWealth: 2000,
                behaviorProfile: 'aggressive'
            });

            expect(economicEngine.state.totalAgents).toBe(2);
            expect(economicEngine.agents.has(agentId1)).toBe(true);
            expect(economicEngine.agents.has(agentId2)).toBe(true);

            economicEngine.unregisterAgent(agentId1);
            expect(economicEngine.state.totalAgents).toBe(1);
            expect(economicEngine.agents.has(agentId1)).toBe(false);
        });

        test('should process agent actions', () => {
            const agentId = economicEngine.registerAgent({
                initialWealth: 1000,
                behaviorProfile: 'balanced'
            });

            const action = {
                type: 'buy',
                marketId: 'food',
                quantity: 10,
                maxPrice: 15
            };

            const result = economicEngine.submitAgentAction(agentId, action);
            expect(result).toBe(true);

            const agent = economicEngine.agents.get(agentId);
            expect(agent.pendingActions).toHaveLength(1);
            expect(agent.pendingActions[0].type).toBe('buy');
        });

        test('should update market prices based on supply and demand', async () => {
            const initialPrice = economicEngine.markets.get('food').currentPrice.toNumber();
            
            // Create agents and actions to affect supply/demand
            const buyers = [];
            for (let i = 0; i < 10; i++) {
                const agentId = economicEngine.registerAgent({
                    initialWealth: 1000,
                    behaviorProfile: 'balanced'
                });
                buyers.push(agentId);
                
                economicEngine.submitAgentAction(agentId, {
                    type: 'buy',
                    marketId: 'food',
                    quantity: 100
                });
            }

            // Wait for a few ticks
            await new Promise(resolve => setTimeout(resolve, 100));

            const updatedPrice = economicEngine.markets.get('food').currentPrice.toNumber();
            expect(updatedPrice).not.toBe(initialPrice);
        });
    });

    describe('Supply and Demand Engine', () => {
        test('should calculate equilibrium price correctly', () => {
            const result = supplyDemandEngine.calculateEquilibriumPrice(
                1000, // supply
                1200, // demand
                100,  // current price
                { elasticity: 1.2, basePrice: 100 }
            );

            expect(result.price).toBeDefined();
            expect(result.ratio).toBeCloseTo(1.2);
            expect(result.adjustment).toBeGreaterThan(0); // Demand > Supply should increase price
        });

        test('should handle price elasticity correctly', () => {
            // Test with different elasticity values
            const lowElasticity = supplyDemandEngine.calculateEquilibriumPrice(
                1000, 1200, 100, { elasticity: 0.5, basePrice: 100 }
            );
            
            const highElasticity = supplyDemandEngine.calculateEquilibriumPrice(
                1000, 1200, 100, { elasticity: 2.0, basePrice: 100 }
            );

            expect(highElasticity.adjustment).toBeGreaterThan(lowElasticity.adjustment);
        });

        test('should calculate order book dynamics', () => {
            const buyOrders = [
                { price: 105, quantity: 100 },
                { price: 104, quantity: 150 },
                { price: 103, quantity: 200 }
            ];
            
            const sellOrders = [
                { price: 106, quantity: 120 },
                { price: 107, quantity: 180 },
                { price: 108, quantity: 250 }
            ];

            const result = supplyDemandEngine.calculateOrderBookDynamics(buyOrders, sellOrders);
            
            expect(result.trades).toHaveLength(0); // No overlap in this example
            expect(result.spread).toBe(1); // 106 - 105
            expect(result.bidDepth).toBe(450); // Total buy quantity
            expect(result.askDepth).toBe(550); // Total sell quantity
        });
    });

    describe('Market Psychology Engine', () => {
        test('should aggregate agent psychology correctly', () => {
            const agents = new Map();
            
            // Add agents with different psychology
            agents.set('agent1', {
                isActive: true,
                psychology: { sentiment: 0.8, fear: 0.2, greed: 0.7, confidence: 0.9 }
            });
            
            agents.set('agent2', {
                isActive: true,
                psychology: { sentiment: 0.3, fear: 0.8, greed: 0.2, confidence: 0.4 }
            });
            
            agents.set('agent3', {
                isActive: false, // Should be ignored
                psychology: { sentiment: 1.0, fear: 0.0, greed: 1.0, confidence: 1.0 }
            });

            const marketData = new Map();
            const result = psychologyEngine.updateMarketPsychology(agents, marketData);

            expect(result.globalSentiment).toBeCloseTo(0.55, 1); // Average of 0.8 and 0.3
            expect(result.fearIndex).toBeGreaterThan(0);
            expect(result.greedIndex).toBeGreaterThan(0);
        });

        test('should detect herding behavior', () => {
            const agents = new Map();
            
            // Create agents with similar sentiment (herding)
            for (let i = 0; i < 10; i++) {
                agents.set(`agent${i}`, {
                    isActive: true,
                    psychology: { sentiment: 0.9, fear: 0.1, greed: 0.8, confidence: 0.8 }
                });
            }

            const marketData = new Map();
            const result = psychologyEngine.updateMarketPsychology(agents, marketData);

            expect(result.herdingFactor).toBeGreaterThan(0.5); // High herding
            expect(result.volatilityMultiplier).toBeGreaterThan(1); // Increased volatility
        });

        test('should trigger psychology events', () => {
            let eventTriggered = false;
            psychologyEngine.on('psychology_event', () => {
                eventTriggered = true;
            });

            psychologyEngine.triggerPsychologyEvent('market_crash', 1.0);

            expect(eventTriggered).toBe(true);
            expect(psychologyEngine.psychologyState.fearIndex).toBeGreaterThan(0.5);
        });
    });

    describe('Monetary Policy Engine', () => {
        test('should calculate inflation based on money supply and velocity', () => {
            const marketData = new Map();
            const agentBehaviors = new Map();
            
            // Add some agent behavior data
            agentBehaviors.set('agent1', {
                isActive: true,
                economicBehavior: {
                    spending: 1000,
                    saving: 200,
                    investment: 300,
                    borrowing: 100
                }
            });

            const indicators = {};
            const inflation = monetaryEngine.updateInflation(marketData, agentBehaviors, indicators);

            expect(inflation).toBeDefined();
            expect(monetaryEngine.monetaryState.currentInflationRate.toNumber()).toBeGreaterThanOrEqual(-0.1);
            expect(monetaryEngine.monetaryState.currentInflationRate.toNumber()).toBeLessThanOrEqual(0.15);
        });

        test('should trigger monetary policy interventions', () => {
            let policyTriggered = false;
            monetaryEngine.on('monetary_policy', (event) => {
                policyTriggered = true;
                expect(event.type).toBeDefined();
                expect(event.reason).toBeDefined();
            });

            // Force high inflation to trigger intervention
            monetaryEngine.monetaryState.currentInflationRate = monetaryEngine.monetaryState.currentInflationRate.plus(0.11);
            monetaryEngine.checkMonetaryPolicyTriggers();

            expect(policyTriggered).toBe(true);
        });

        test('should maintain money supply history', () => {
            const marketData = new Map();
            const agentBehaviors = new Map();
            const indicators = {};

            monetaryEngine.updateInflation(marketData, agentBehaviors, indicators);
            monetaryEngine.updateInflation(marketData, agentBehaviors, indicators);

            const history = monetaryEngine.getMoneySupplyHistory();
            expect(history.length).toBeGreaterThanOrEqual(2);
            expect(history[0].timestamp).toBeDefined();
            expect(history[0].supply).toBeDefined();
        });
    });

    describe('Commodity Scarcity Engine', () => {
        test('should initialize commodities with correct properties', () => {
            expect(scarcityEngine.commodities.size).toBeGreaterThan(0);
            
            const oil = scarcityEngine.commodities.get('oil');
            expect(oil).toBeDefined();
            expect(oil.type).toBe('finite');
            expect(oil.currentReserves).toBeDefined();
            expect(oil.scarcityLevel).toBe(0); // Initially abundant
        });

        test('should process consumption and depletion', () => {
            const initialReserves = scarcityEngine.commodities.get('oil').currentReserves.toNumber();
            
            const consumptionData = new Map();
            consumptionData.set('oil', 1000000); // 1M barrels consumed

            scarcityEngine.updateScarcity(new Map(), consumptionData);

            const newReserves = scarcityEngine.commodities.get('oil').currentReserves.toNumber();
            expect(newReserves).toBeLessThan(initialReserves);
        });

        test('should trigger discovery events', () => {
            let discoveryTriggered = false;
            scarcityEngine.on('discovery_event', (event) => {
                discoveryTriggered = true;
                expect(event.commodityId).toBeDefined();
                expect(event.amount).toBeDefined();
            });

            scarcityEngine.triggerDiscoveryEvent('oil');
            expect(discoveryTriggered).toBe(true);
        });

        test('should calculate scarcity levels correctly', () => {
            const oil = scarcityEngine.commodities.get('oil');
            const initialReserves = oil.currentReserves;
            
            // Artificially deplete reserves
            oil.currentReserves = initialReserves.div(2);
            scarcityEngine.updateScarcityMetrics('oil');

            expect(oil.scarcityLevel).toBeCloseTo(0.5, 1);
            expect(oil.priceMultiplier).toBeGreaterThan(1);
        });

        test('should detect critical thresholds', () => {
            let criticalAlert = false;
            scarcityEngine.on('critical_scarcity', () => {
                criticalAlert = true;
            });

            const oil = scarcityEngine.commodities.get('oil');
            oil.currentReserves = oil.criticalThreshold.div(2); // Below critical
            scarcityEngine.updateScarcityMetrics('oil');

            expect(criticalAlert).toBe(true);
        });
    });

    describe('Integration Scenarios', () => {
        test('should handle market crash scenario', async () => {
            // Register multiple agents
            const agents = [];
            for (let i = 0; i < 50; i++) {
                const agentId = economicEngine.registerAgent({
                    initialWealth: 1000 + Math.random() * 9000,
                    behaviorProfile: ['conservative', 'balanced', 'aggressive'][i % 3]
                });
                agents.push(agentId);
            }

            // Trigger panic selling
            agents.forEach(agentId => {
                economicEngine.submitAgentAction(agentId, {
                    type: 'sell',
                    marketId: 'technology',
                    quantity: 50 + Math.random() * 100
                });
            });

            // Update psychology to reflect panic
            const agentMap = new Map();
            agents.forEach(agentId => {
                agentMap.set(agentId, {
                    isActive: true,
                    psychology: { sentiment: 0.1, fear: 0.9, greed: 0.1, confidence: 0.2 }
                });
            });

            psychologyEngine.updateMarketPsychology(agentMap, economicEngine.markets);

            await new Promise(resolve => setTimeout(resolve, 100));

            expect(psychologyEngine.psychologyState.fearIndex).toBeGreaterThan(0.5);
            expect(psychologyEngine.psychologyState.volatilityMultiplier).toBeGreaterThan(1.5);
        });

        test('should handle resource discovery impact on prices', () => {
            const initialState = scarcityEngine.getScarcityState();
            const oilInitialScarcity = initialState.commodities.oil.scarcityLevel;

            // Trigger major discovery
            scarcityEngine.triggerDiscoveryEvent('oil');
            
            const newState = scarcityEngine.getScarcityState();
            const oilNewScarcity = newState.commodities.oil.scarcityLevel;

            expect(oilNewScarcity).toBeLessThan(oilInitialScarcity);
            expect(newState.commodities.oil.priceMultiplier).toBeLessThan(
                initialState.commodities.oil.priceMultiplier
            );
        });

        test('should handle inflation spiral scenario', () => {
            // Simulate high money supply growth
            monetaryEngine.monetaryState.moneySupply = 
                monetaryEngine.monetaryState.moneySupply.mul(1.2); // 20% increase

            // High spending behavior
            const agentBehaviors = new Map();
            agentBehaviors.set('agent1', {
                isActive: true,
                economicBehavior: {
                    spending: 5000, // High spending
                    saving: 100,    // Low saving
                    investment: 200,
                    borrowing: 1000 // High borrowing
                }
            });

            const marketData = new Map();
            const indicators = {};

            monetaryEngine.updateInflation(marketData, agentBehaviors, indicators);

            expect(monetaryEngine.monetaryState.currentInflationRate.toNumber())
                .toBeGreaterThan(0.02); // Above base rate
        });
    });

    describe('Performance Tests', () => {
        test('should handle 1000 agents efficiently', async () => {
            const startTime = Date.now();
            
            // Register 1000 agents
            const agents = [];
            for (let i = 0; i < 1000; i++) {
                const agentId = economicEngine.registerAgent({
                    initialWealth: 1000 + Math.random() * 9000,
                    behaviorProfile: ['conservative', 'balanced', 'aggressive'][i % 3]
                });
                agents.push(agentId);
            }

            const registrationTime = Date.now() - startTime;
            expect(registrationTime).toBeLessThan(1000); // Should take less than 1 second

            // Submit actions for all agents
            const actionStartTime = Date.now();
            agents.forEach(agentId => {
                economicEngine.submitAgentAction(agentId, {
                    type: Math.random() > 0.5 ? 'buy' : 'sell',
                    marketId: ['food', 'energy', 'materials', 'technology', 'services'][Math.floor(Math.random() * 5)],
                    quantity: Math.floor(Math.random() * 100) + 1
                });
            });

            const actionTime = Date.now() - actionStartTime;
            expect(actionTime).toBeLessThan(500); // Should take less than 0.5 seconds

            // Wait for processing
            await new Promise(resolve => setTimeout(resolve, 200));

            expect(economicEngine.state.totalAgents).toBe(1000);
        });

        test('should maintain consistent tick rate under load', async () => {
            // Register many agents
            for (let i = 0; i < 500; i++) {
                economicEngine.registerAgent({
                    initialWealth: 1000,
                    behaviorProfile: 'balanced'
                });
            }

            const tickTimes = [];
            const startTime = Date.now();

            // Monitor tick events
            const tickHandler = (data) => {
                tickTimes.push(data.processingTime);
            };

            economicEngine.on('tick', tickHandler);

            // Wait for 10 ticks
            await new Promise(resolve => {
                const checkTicks = () => {
                    if (tickTimes.length >= 10) {
                        economicEngine.off('tick', tickHandler);
                        resolve();
                    } else {
                        setTimeout(checkTicks, 10);
                    }
                };
                checkTicks();
            });

            const averageTickTime = tickTimes.reduce((sum, time) => sum + time, 0) / tickTimes.length;
            expect(averageTickTime).toBeLessThan(50); // Average tick should be under 50ms
            expect(Math.max(...tickTimes)).toBeLessThan(100); // No tick should exceed 100ms
        });
    });
});
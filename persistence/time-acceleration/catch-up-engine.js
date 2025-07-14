/**
 * Time Acceleration & Catch-Up Engine
 * Handles rapid market evolution simulation when players are offline
 */

const EventEmitter = require('events');

class TimeAccelerationEngine extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            maxAcceleration: config.maxAcceleration || 100, // 100x speed
            defaultAcceleration: config.defaultAcceleration || 10, // 10x speed
            chunkSize: config.chunkSize || 3600000, // 1 hour chunks
            maxCatchUpTime: config.maxCatchUpTime || 86400000, // 24 hours max
            accuracyThreshold: config.accuracyThreshold || 0.95,
            ...config
        };
        
        this.isAccelerating = false;
        this.currentAcceleration = 1.0;
        this.accelerationStartTime = null;
        this.catchUpProgress = 0;
        
        this.simulationQueue = [];
        this.acceleratedEvents = [];
        
        this.metrics = {
            accelerationSessions: 0,
            totalAcceleratedTime: 0,
            eventsSimulated: 0,
            averageAccuracy: 0,
            performanceScore: 0
        };
    }
    
    async startCatchUp(targetTime, currentTime = Date.now()) {
        const timeDifference = targetTime - currentTime;
        
        if (timeDifference <= 0) {
            return { success: true, message: 'Already caught up' };
        }
        
        if (timeDifference > this.config.maxCatchUpTime) {
            throw new Error(`Time difference too large: ${timeDifference}ms > ${this.config.maxCatchUpTime}ms`);
        }
        
        console.log(`Starting catch-up simulation: ${timeDifference}ms to simulate`);
        
        this.isAccelerating = true;
        this.accelerationStartTime = Date.now();
        this.catchUpProgress = 0;
        
        try {
            const result = await this.simulateTimeSpan(currentTime, targetTime);
            
            this.metrics.accelerationSessions++;
            this.metrics.totalAcceleratedTime += timeDifference;
            
            this.emit('catch_up_complete', result);
            
            return result;
            
        } catch (error) {
            console.error('Catch-up simulation failed:', error);
            throw error;
        } finally {
            this.isAccelerating = false;
            this.currentAcceleration = 1.0;
        }
    }
    
    async simulateTimeSpan(startTime, endTime) {
        const totalDuration = endTime - startTime;
        const chunks = Math.ceil(totalDuration / this.config.chunkSize);
        
        const results = {
            success: true,
            startTime,
            endTime,
            duration: totalDuration,
            chunks,
            eventsGenerated: 0,
            stateUpdates: 0,
            accuracy: 0,
            performanceMetrics: {}
        };
        
        console.log(`Simulating ${chunks} time chunks of ${this.config.chunkSize}ms each`);
        
        for (let i = 0; i < chunks; i++) {
            const chunkStart = startTime + (i * this.config.chunkSize);
            const chunkEnd = Math.min(chunkStart + this.config.chunkSize, endTime);
            
            this.catchUpProgress = (i / chunks) * 100;
            
            try {
                const chunkResult = await this.simulateTimeChunk(chunkStart, chunkEnd, i);
                
                results.eventsGenerated += chunkResult.eventsGenerated;
                results.stateUpdates += chunkResult.stateUpdates;
                
                this.emit('chunk_complete', {
                    chunk: i + 1,
                    total: chunks,
                    progress: this.catchUpProgress,
                    result: chunkResult
                });
                
            } catch (error) {
                console.error(`Chunk ${i} simulation failed:`, error);
                results.errors = results.errors || [];
                results.errors.push({ chunk: i, error: error.message });
            }
        }
        
        this.catchUpProgress = 100;
        results.accuracy = this.calculateAccuracy(results);
        
        return results;
    }
    
    async simulateTimeChunk(startTime, endTime, chunkIndex) {
        const chunkDuration = endTime - startTime;
        const acceleration = this.calculateOptimalAcceleration(chunkDuration);
        
        this.currentAcceleration = acceleration;
        
        const chunkResult = {
            chunkIndex,
            startTime,
            endTime,
            duration: chunkDuration,
            acceleration,
            eventsGenerated: 0,
            stateUpdates: 0,
            marketMovements: 0,
            agentActions: 0
        };
        
        // Simulate market evolution for this time chunk
        const marketEvents = await this.simulateMarketEvolution(startTime, endTime, acceleration);
        chunkResult.marketMovements = marketEvents.length;
        chunkResult.eventsGenerated += marketEvents.length;
        
        // Simulate agent actions for this time chunk
        const agentEvents = await this.simulateAgentActions(startTime, endTime, acceleration);
        chunkResult.agentActions = agentEvents.length;
        chunkResult.eventsGenerated += agentEvents.length;
        
        // Simulate economic events
        const economicEvents = await this.simulateEconomicEvents(startTime, endTime, acceleration);
        chunkResult.eventsGenerated += economicEvents.length;
        
        // Apply all events to state
        const allEvents = [...marketEvents, ...agentEvents, ...economicEvents];
        const stateUpdates = await this.applyEventsToState(allEvents, startTime, endTime);
        chunkResult.stateUpdates = stateUpdates;
        
        this.metrics.eventsSimulated += chunkResult.eventsGenerated;
        
        return chunkResult;
    }
    
    calculateOptimalAcceleration(chunkDuration) {
        // Calculate optimal acceleration based on chunk size and system performance
        const baseAcceleration = this.config.defaultAcceleration;
        const maxAcceleration = this.config.maxAcceleration;
        
        // Adjust based on chunk duration
        const durationFactor = Math.min(chunkDuration / this.config.chunkSize, 1.0);
        
        // Adjust based on system load (simplified)
        const loadFactor = this.getSystemLoadFactor();
        
        const optimalAcceleration = Math.min(
            baseAcceleration * durationFactor * loadFactor,
            maxAcceleration
        );
        
        return Math.max(optimalAcceleration, 1.0);
    }
    
    getSystemLoadFactor() {
        // Simple system load calculation
        const memUsage = process.memoryUsage();
        const memFactor = 1.0 - (memUsage.heapUsed / memUsage.heapTotal);
        
        return Math.max(memFactor, 0.1); // Minimum 10% performance
    }
    
    async simulateMarketEvolution(startTime, endTime, acceleration) {
        const duration = endTime - startTime;
        const events = [];
        
        // Calculate expected number of market movements
        const baseMovementsPerHour = 60; // Base movements per hour
        const expectedMovements = Math.floor(
            (duration / 3600000) * baseMovementsPerHour * acceleration
        );
        
        const markets = ['commodities', 'currencies', 'services'];
        const symbols = ['GOLD', 'OIL', 'WHEAT', 'STEEL', 'LITHIUM', 'USD', 'EUR'];
        
        for (let i = 0; i < expectedMovements; i++) {
            const eventTime = startTime + (Math.random() * duration);
            const market = markets[Math.floor(Math.random() * markets.length)];
            const symbol = symbols[Math.floor(Math.random() * symbols.length)];
            
            events.push({
                type: 'market_movement',
                timestamp: eventTime,
                market,
                symbol,
                priceChange: (Math.random() - 0.5) * 0.1, // ±5% max change
                volume: Math.floor(Math.random() * 10000) + 1000,
                reason: 'accelerated_simulation',
                acceleration
            });
        }
        
        return events.sort((a, b) => a.timestamp - b.timestamp);
    }
    
    async simulateAgentActions(startTime, endTime, acceleration) {
        const duration = endTime - startTime;
        const events = [];
        
        // Calculate expected agent actions
        const baseActionsPerHour = 200; // Base actions per hour
        const expectedActions = Math.floor(
            (duration / 3600000) * baseActionsPerHour * acceleration
        );
        
        const actionTypes = ['buy', 'sell', 'analyze', 'hold'];
        const agentTypes = ['trader', 'investor', 'speculator', 'market_maker'];
        
        for (let i = 0; i < expectedActions; i++) {
            const eventTime = startTime + (Math.random() * duration);
            const actionType = actionTypes[Math.floor(Math.random() * actionTypes.length)];
            const agentType = agentTypes[Math.floor(Math.random() * agentTypes.length)];
            
            events.push({
                type: 'agent_action',
                timestamp: eventTime,
                agentId: `sim_${agentType}_${Math.floor(Math.random() * 1000)}`,
                agentType,
                action: actionType,
                parameters: this.generateActionParameters(actionType),
                reason: 'accelerated_simulation',
                acceleration
            });
        }
        
        return events.sort((a, b) => a.timestamp - b.timestamp);
    }
    
    generateActionParameters(actionType) {
        const symbols = ['GOLD', 'OIL', 'WHEAT', 'STEEL', 'LITHIUM'];
        const symbol = symbols[Math.floor(Math.random() * symbols.length)];
        
        switch (actionType) {
            case 'buy':
            case 'sell':
                return {
                    symbol,
                    quantity: Math.floor(Math.random() * 100) + 1,
                    orderType: Math.random() < 0.7 ? 'market' : 'limit',
                    limitPrice: Math.random() < 0.3 ? null : Math.random() * 1000
                };
            case 'analyze':
                return {
                    symbol,
                    timeframe: ['1m', '5m', '15m', '1h'][Math.floor(Math.random() * 4)],
                    indicators: ['RSI', 'MACD', 'SMA', 'Volume']
                };
            case 'hold':
                return {
                    symbol,
                    reason: ['uncertainty', 'waiting', 'analysis'][Math.floor(Math.random() * 3)]
                };
            default:
                return {};
        }
    }
    
    async simulateEconomicEvents(startTime, endTime, acceleration) {
        const duration = endTime - startTime;
        const events = [];
        
        // Calculate expected economic events (less frequent)
        const baseEventsPerDay = 5; // Base events per day
        const expectedEvents = Math.floor(
            (duration / 86400000) * baseEventsPerDay * Math.sqrt(acceleration)
        );
        
        const eventTypes = [
            'policy_change',
            'supply_disruption',
            'demand_surge',
            'resource_discovery',
            'market_manipulation',
            'economic_indicator_release'
        ];
        
        for (let i = 0; i < expectedEvents; i++) {
            const eventTime = startTime + (Math.random() * duration);
            const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            
            events.push({
                type: 'economic_event',
                timestamp: eventTime,
                subtype: eventType,
                magnitude: Math.random(),
                affectedMarkets: this.getAffectedMarkets(eventType),
                duration: Math.floor(Math.random() * 7200000) + 300000, // 5min to 2 hours
                reason: 'accelerated_simulation',
                acceleration
            });
        }
        
        return events.sort((a, b) => a.timestamp - b.timestamp);
    }
    
    getAffectedMarkets(eventType) {
        const marketMappings = {
            'policy_change': ['currencies', 'services'],
            'supply_disruption': ['commodities'],
            'demand_surge': ['commodities', 'currencies'],
            'resource_discovery': ['commodities'],
            'market_manipulation': ['commodities', 'currencies'],
            'economic_indicator_release': ['currencies', 'services']
        };
        
        return marketMappings[eventType] || ['commodities'];
    }
    
    async applyEventsToState(events, startTime, endTime) {
        let stateUpdates = 0;
        
        // Group events by type for efficient processing
        const eventsByType = events.reduce((groups, event) => {
            const type = event.type;
            if (!groups[type]) groups[type] = [];
            groups[type].push(event);
            return groups;
        }, {});
        
        // Process market movements
        if (eventsByType.market_movement) {
            stateUpdates += await this.processMarketMovements(eventsByType.market_movement);
        }
        
        // Process agent actions
        if (eventsByType.agent_action) {
            stateUpdates += await this.processAgentActions(eventsByType.agent_action);
        }
        
        // Process economic events
        if (eventsByType.economic_event) {
            stateUpdates += await this.processEconomicEvents(eventsByType.economic_event);
        }
        
        return stateUpdates;
    }
    
    async processMarketMovements(movements) {
        // Group by symbol for batch processing
        const bySymbol = movements.reduce((groups, movement) => {
            if (!groups[movement.symbol]) groups[movement.symbol] = [];
            groups[movement.symbol].push(movement);
            return groups;
        }, {});
        
        let updates = 0;
        
        for (const [symbol, symbolMovements] of Object.entries(bySymbol)) {
            // Calculate cumulative price change
            const totalChange = symbolMovements.reduce((sum, m) => sum + m.priceChange, 0);
            const totalVolume = symbolMovements.reduce((sum, m) => sum + m.volume, 0);
            
            // Apply to market state (simplified)
            await this.updateMarketState(symbol, {
                priceChange: totalChange,
                volume: totalVolume,
                lastUpdate: Math.max(...symbolMovements.map(m => m.timestamp))
            });
            
            updates++;
        }
        
        return updates;
    }
    
    async processAgentActions(actions) {
        // Group by agent for batch processing
        const byAgent = actions.reduce((groups, action) => {
            if (!groups[action.agentId]) groups[action.agentId] = [];
            groups[action.agentId].push(action);
            return groups;
        }, {});
        
        let updates = 0;
        
        for (const [agentId, agentActions] of Object.entries(byAgent)) {
            // Update agent state with all actions
            await this.updateAgentState(agentId, {
                actions: agentActions,
                lastActivity: Math.max(...agentActions.map(a => a.timestamp))
            });
            
            updates++;
        }
        
        return updates;
    }
    
    async processEconomicEvents(economicEvents) {
        let updates = 0;
        
        for (const event of economicEvents) {
            // Apply economic event effects
            await this.applyEconomicEventEffects(event);
            updates++;
        }
        
        return updates;
    }
    
    async updateMarketState(symbol, updates) {
        // Update market state in persistence layer
        // This would integrate with the main state manager
        console.log(`Market update: ${symbol} price change: ${updates.priceChange}%`);
    }
    
    async updateAgentState(agentId, updates) {
        // Update agent state in persistence layer
        console.log(`Agent update: ${agentId} performed ${updates.actions.length} actions`);
    }
    
    async applyEconomicEventEffects(event) {
        // Apply economic event effects to relevant markets
        console.log(`Economic event: ${event.subtype} affecting ${event.affectedMarkets.join(', ')}`);
    }
    
    calculateAccuracy(results) {
        // Calculate simulation accuracy based on various factors
        const errorRate = (results.errors?.length || 0) / results.chunks;
        const completionRate = results.eventsGenerated > 0 ? 1.0 : 0.0;
        
        const accuracy = (1.0 - errorRate) * completionRate;
        
        return Math.max(0, Math.min(1, accuracy));
    }
    
    async pauseAcceleration() {
        if (!this.isAccelerating) return;
        
        this.isAccelerating = false;
        this.emit('acceleration_paused');
    }
    
    async resumeAcceleration() {
        if (this.isAccelerating) return;
        
        this.isAccelerating = true;
        this.emit('acceleration_resumed');
    }
    
    getAccelerationStatus() {
        return {
            isAccelerating: this.isAccelerating,
            currentAcceleration: this.currentAcceleration,
            progress: this.catchUpProgress,
            startTime: this.accelerationStartTime,
            metrics: this.metrics
        };
    }
    
    getMetrics() {
        return {
            ...this.metrics,
            isAccelerating: this.isAccelerating,
            currentAcceleration: this.currentAcceleration,
            progress: this.catchUpProgress
        };
    }
}

module.exports = TimeAccelerationEngine;
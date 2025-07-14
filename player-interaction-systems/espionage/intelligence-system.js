/**
 * Intelligence & Espionage System
 * Provides market intelligence gathering, competitor surveillance, and economic warfare capabilities
 */

const EventEmitter = require('eventemitter3');
const { v4: uuidv4 } = require('uuid');

class IntelligenceSystem extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            maxOperationsPerPlayer: config.maxOperationsPerPlayer || 5,
            operationCooldown: config.operationCooldown || 600000, // 10 minutes
            detectionThreshold: config.detectionThreshold || 0.3,
            counterIntelligenceStrength: config.counterIntelligenceStrength || 0.5,
            informationDecayRate: config.informationDecayRate || 0.1, // 10% per hour
            maxIntelligenceRange: config.maxIntelligenceRange || 200, // km
            ...config
        };

        this.state = {
            activeOperations: new Map(),
            playerIntelligence: new Map(),
            counterOperations: new Map(),
            informationAssets: new Map(),
            surveillanceNetworks: new Map(),
            marketIntelligence: new Map()
        };

        this.operationTypes = {
            market_surveillance: {
                cost: 75000,
                duration: 7200000, // 2 hours
                successRate: 0.8,
                detectionRisk: 0.2,
                informationTypes: ['price_trends', 'volume_data', 'trader_patterns']
            },
            competitor_analysis: {
                cost: 100000,
                duration: 10800000, // 3 hours
                successRate: 0.7,
                detectionRisk: 0.3,
                informationTypes: ['business_strategy', 'financial_data', 'supply_chains']
            },
            insider_recruitment: {
                cost: 150000,
                duration: 21600000, // 6 hours
                successRate: 0.6,
                detectionRisk: 0.4,
                informationTypes: ['insider_trading_data', 'merger_plans', 'policy_changes']
            },
            trade_secret_theft: {
                cost: 200000,
                duration: 14400000, // 4 hours
                successRate: 0.5,
                detectionRisk: 0.6,
                informationTypes: ['technology_data', 'research_results', 'proprietary_methods']
            },
            economic_sabotage: {
                cost: 300000,
                duration: 18000000, // 5 hours
                successRate: 0.4,
                detectionRisk: 0.8,
                informationTypes: ['disruption_points', 'vulnerability_analysis']
            },
            counter_intelligence: {
                cost: 120000,
                duration: 14400000, // 4 hours
                successRate: 0.7,
                detectionRisk: 0.1,
                informationTypes: ['enemy_operations', 'security_analysis', 'threat_assessment']
            }
        };

        this.informationValue = {
            price_trends: { baseValue: 10000, decayRate: 0.2 },
            volume_data: { baseValue: 8000, decayRate: 0.15 },
            trader_patterns: { baseValue: 15000, decayRate: 0.1 },
            business_strategy: { baseValue: 25000, decayRate: 0.05 },
            financial_data: { baseValue: 20000, decayRate: 0.1 },
            supply_chains: { baseValue: 18000, decayRate: 0.08 },
            insider_trading_data: { baseValue: 50000, decayRate: 0.3 },
            merger_plans: { baseValue: 40000, decayRate: 0.25 },
            policy_changes: { baseValue: 35000, decayRate: 0.2 },
            technology_data: { baseValue: 60000, decayRate: 0.05 },
            research_results: { baseValue: 45000, decayRate: 0.08 },
            proprietary_methods: { baseValue: 55000, decayRate: 0.06 }
        };

        this.initializeSystem();
    }

    initializeSystem() {
        // Start operation monitoring
        setInterval(() => {
            this.updateOperations();
        }, 60000); // Every minute

        // Start information decay
        setInterval(() => {
            this.decayInformation();
        }, 300000); // Every 5 minutes

        // Start counter-intelligence sweeps
        setInterval(() => {
            this.performCounterIntelligenceSweeps();
        }, 900000); // Every 15 minutes

        console.log('Intelligence System initialized');
    }

    // Launch Intelligence Operation
    async launchOperation(playerId, operationType, targetParams, options = {}) {
        const operation = this.operationTypes[operationType];
        if (!operation) throw new Error('Invalid operation type');

        // Check if player has too many active operations
        const activeOps = Array.from(this.state.activeOperations.values())
            .filter(op => op.playerId === playerId && op.status === 'active');
        
        if (activeOps.length >= this.config.maxOperationsPerPlayer) {
            throw new Error('Maximum concurrent operations limit reached');
        }

        // Check cooldown (simplified - would be per operation type)
        const lastOperation = activeOps[activeOps.length - 1];
        if (lastOperation && Date.now() - lastOperation.startTime < this.config.operationCooldown) {
            throw new Error('Operation cooldown active');
        }

        const operationId = uuidv4();
        const intelligence = {
            id: operationId,
            playerId,
            type: operationType,
            target: targetParams,
            cost: operation.cost,
            startTime: Date.now(),
            duration: operation.duration,
            completionTime: Date.now() + operation.duration,
            status: 'active',
            successRate: this.calculateSuccessRate(playerId, operation, targetParams),
            detectionRisk: this.calculateDetectionRisk(playerId, operation, targetParams),
            progress: 0,
            results: null,
            detected: false,
            counterOperations: []
        };

        this.state.activeOperations.set(operationId, intelligence);

        // Schedule completion
        setTimeout(() => {
            this.completeOperation(operationId);
        }, operation.duration);

        // Check for immediate detection
        if (Math.random() < intelligence.detectionRisk * 0.3) { // 30% of risk for immediate detection
            this.detectOperation(operationId);
        }

        this.emit('operation_launched', { playerId, operationId, operation: intelligence });
        return { operationId, estimatedCompletion: intelligence.completionTime };
    }

    calculateSuccessRate(playerId, operation, targetParams) {
        let successRate = operation.successRate;

        // Player skill modifiers
        const playerIntel = this.state.playerIntelligence.get(playerId);
        if (playerIntel) {
            successRate += playerIntel.skillLevel * 0.1; // 10% per skill level
            successRate += playerIntel.experience * 0.05; // 5% per experience point
        }

        // Target difficulty modifiers
        if (targetParams.securityLevel) {
            successRate -= targetParams.securityLevel * 0.2; // 20% per security level
        }

        // Network advantages
        const network = this.state.surveillanceNetworks.get(playerId);
        if (network && network.coverage.includes(targetParams.region)) {
            successRate += 0.15; // 15% network bonus
        }

        return Math.max(0.1, Math.min(0.95, successRate)); // Cap between 10% and 95%
    }

    calculateDetectionRisk(playerId, operation, targetParams) {
        let detectionRisk = operation.detectionRisk;

        // Counter-intelligence strength in target area
        if (targetParams.hasCounterIntelligence) {
            detectionRisk += this.config.counterIntelligenceStrength;
        }

        // Player stealth modifiers
        const playerIntel = this.state.playerIntelligence.get(playerId);
        if (playerIntel) {
            detectionRisk -= playerIntel.stealthLevel * 0.1; // 10% per stealth level
        }

        // Previous detection history
        const recentDetections = Array.from(this.state.activeOperations.values())
            .filter(op => op.playerId === playerId && op.detected && 
                    Date.now() - op.startTime < 86400000).length; // Last 24 hours
        
        detectionRisk += recentDetections * 0.1; // 10% per recent detection

        return Math.max(0.05, Math.min(0.9, detectionRisk)); // Cap between 5% and 90%
    }

    async completeOperation(operationId) {
        const operation = this.state.activeOperations.get(operationId);
        if (!operation || operation.status !== 'active') return;

        operation.status = 'completed';
        operation.actualCompletionTime = Date.now();

        // Determine success
        const success = Math.random() < operation.successRate && !operation.detected;
        
        if (success) {
            operation.results = await this.generateOperationResults(operation);
            this.storeIntelligence(operation.playerId, operation.results);
            
            this.emit('operation_succeeded', { 
                operationId, 
                playerId: operation.playerId,
                results: operation.results 
            });
        } else {
            operation.results = { success: false, reason: operation.detected ? 'detected' : 'failed' };
            
            this.emit('operation_failed', { 
                operationId, 
                playerId: operation.playerId,
                reason: operation.results.reason 
            });
        }

        // Clean up after 1 hour
        setTimeout(() => {
            this.state.activeOperations.delete(operationId);
        }, 3600000);
    }

    async generateOperationResults(operation) {
        const operationType = this.operationTypes[operation.type];
        const results = {
            success: true,
            operationType: operation.type,
            target: operation.target,
            intelligence: [],
            actionableInsights: [],
            timestamp: Date.now()
        };

        // Generate intelligence based on operation type
        for (const infoType of operationType.informationTypes) {
            const intelligence = await this.generateIntelligenceData(infoType, operation.target);
            if (intelligence) {
                results.intelligence.push(intelligence);
            }
        }

        // Generate actionable insights
        results.actionableInsights = this.generateActionableInsights(results.intelligence, operation);

        return results;
    }

    async generateIntelligenceData(informationType, target) {
        const baseData = {
            type: informationType,
            value: this.informationValue[informationType]?.baseValue || 10000,
            quality: Math.random() * 0.4 + 0.6, // 60-100% quality
            timestamp: Date.now(),
            expirationTime: Date.now() + 3600000, // 1 hour default
            target: target
        };

        switch (informationType) {
            case 'price_trends':
                return {
                    ...baseData,
                    data: {
                        commodity: target.commodity || 'technology',
                        trendDirection: Math.random() > 0.5 ? 'upward' : 'downward',
                        magnitude: Math.random() * 0.3 + 0.1, // 10-40% change predicted
                        confidence: baseData.quality,
                        timeframe: '24-72 hours',
                        factors: this.generateTrendFactors()
                    }
                };

            case 'trader_patterns':
                return {
                    ...baseData,
                    data: {
                        traderId: target.traderId || 'unknown',
                        patterns: this.generateTraderPatterns(),
                        riskProfile: ['conservative', 'moderate', 'aggressive'][Math.floor(Math.random() * 3)],
                        averageVolume: Math.random() * 1000000 + 100000,
                        preferredAssets: this.generatePreferredAssets()
                    }
                };

            case 'business_strategy':
                return {
                    ...baseData,
                    data: {
                        company: target.company || 'unknown',
                        strategy: this.generateBusinessStrategy(),
                        timeline: '3-6 months',
                        budget: Math.random() * 10000000 + 1000000,
                        riskFactors: this.generateRiskFactors()
                    }
                };

            case 'insider_trading_data':
                return {
                    ...baseData,
                    expirationTime: Date.now() + 1800000, // 30 minutes - very time sensitive
                    data: {
                        asset: target.asset || 'unknown',
                        expectedChange: Math.random() * 0.5 + 0.1, // 10-60% change
                        timeframe: '1-6 hours',
                        confidence: baseData.quality * 0.8, // Insider info has risk
                        source: 'insider_contact',
                        verificationStatus: Math.random() > 0.3 ? 'verified' : 'unverified'
                    }
                };

            case 'technology_data':
                return {
                    ...baseData,
                    expirationTime: Date.now() + 86400000, // 24 hours
                    data: {
                        technology: target.technology || 'unknown',
                        developmentStage: ['research', 'prototype', 'testing', 'production'][Math.floor(Math.random() * 4)],
                        marketImpact: Math.random() * 0.8 + 0.2, // 20-100% impact
                        competitiveAdvantage: Math.random() * 0.6 + 0.3, // 30-90% advantage
                        commercializationTimeline: Math.random() * 24 + 6 // 6-30 months
                    }
                };

            default:
                return {
                    ...baseData,
                    data: {
                        type: informationType,
                        rawData: this.generateGenericIntelligence(informationType),
                        processed: false
                    }
                };
        }
    }

    generateTrendFactors() {
        const factors = [
            'supply_shortage',
            'demand_surge',
            'regulatory_changes',
            'technological_breakthrough',
            'geopolitical_events',
            'seasonal_patterns',
            'market_sentiment',
            'competitor_actions'
        ];
        
        const count = Math.floor(Math.random() * 3) + 1; // 1-3 factors
        return factors.sort(() => Math.random() - 0.5).slice(0, count);
    }

    generateTraderPatterns() {
        return {
            tradingFrequency: Math.random() * 100 + 10, // 10-110 trades per day
            averageHoldTime: Math.random() * 168 + 1, // 1-168 hours
            riskTolerance: Math.random(),
            marketTiming: Math.random() > 0.5 ? 'good' : 'poor',
            preferredTimeframes: ['short', 'medium', 'long'][Math.floor(Math.random() * 3)],
            emotionalTriggers: this.generateEmotionalTriggers()
        };
    }

    generateEmotionalTriggers() {
        const triggers = ['fear', 'greed', 'fomo', 'uncertainty', 'overconfidence'];
        return triggers.filter(() => Math.random() > 0.6);
    }

    generatePreferredAssets() {
        const assets = ['technology', 'energy', 'food', 'materials', 'services'];
        const count = Math.floor(Math.random() * 3) + 1;
        return assets.sort(() => Math.random() - 0.5).slice(0, count);
    }

    generateBusinessStrategy() {
        const strategies = [
            'market_expansion',
            'product_diversification',
            'cost_reduction',
            'technology_upgrade',
            'merger_acquisition',
            'vertical_integration',
            'international_expansion',
            'sustainability_focus'
        ];
        
        return strategies[Math.floor(Math.random() * strategies.length)];
    }

    generateRiskFactors() {
        const factors = [
            'regulatory_compliance',
            'market_competition',
            'technology_obsolescence',
            'supply_chain_disruption',
            'financial_leverage',
            'reputation_risk',
            'cyber_security',
            'talent_retention'
        ];
        
        const count = Math.floor(Math.random() * 4) + 1; // 1-4 factors
        return factors.sort(() => Math.random() - 0.5).slice(0, count);
    }

    generateGenericIntelligence(type) {
        return {
            reliability: Math.random(),
            detail: Math.random(),
            actionability: Math.random(),
            timeRelevance: Math.random(),
            competitiveValue: Math.random()
        };
    }

    generateActionableInsights(intelligenceData, operation) {
        const insights = [];

        intelligenceData.forEach(intel => {
            switch (intel.type) {
                case 'price_trends':
                    if (intel.data.confidence > 0.7) {
                        insights.push({
                            type: 'trading_opportunity',
                            action: intel.data.trendDirection === 'upward' ? 'buy' : 'sell',
                            asset: intel.data.commodity,
                            expectedReturn: intel.data.magnitude,
                            timeframe: intel.data.timeframe,
                            confidence: intel.data.confidence
                        });
                    }
                    break;

                case 'insider_trading_data':
                    if (intel.data.verificationStatus === 'verified') {
                        insights.push({
                            type: 'high_priority_trade',
                            action: intel.data.expectedChange > 0 ? 'buy' : 'sell',
                            asset: intel.data.asset,
                            expectedReturn: intel.data.expectedChange,
                            timeframe: intel.data.timeframe,
                            confidence: intel.data.confidence,
                            urgency: 'high'
                        });
                    }
                    break;

                case 'business_strategy':
                    insights.push({
                        type: 'strategic_positioning',
                        recommendation: this.generateStrategicRecommendation(intel.data),
                        timeframe: intel.data.timeline,
                        impact: 'medium',
                        confidence: intel.quality
                    });
                    break;

                case 'technology_data':
                    if (intel.data.developmentStage === 'testing' || intel.data.developmentStage === 'production') {
                        insights.push({
                            type: 'innovation_opportunity',
                            technology: intel.data.technology,
                            marketImpact: intel.data.marketImpact,
                            investmentRecommendation: intel.data.competitiveAdvantage > 0.6 ? 'invest' : 'monitor',
                            timeframe: `${intel.data.commercializationTimeline} months`,
                            confidence: intel.quality
                        });
                    }
                    break;
            }
        });

        return insights;
    }

    generateStrategicRecommendation(strategyData) {
        const recommendations = {
            market_expansion: 'Position for increased market share opportunities',
            product_diversification: 'Prepare for new product category competition',
            cost_reduction: 'Expect price competition, optimize efficiency',
            technology_upgrade: 'Monitor for technological disruption',
            merger_acquisition: 'Potential consolidation, consider partnerships',
            vertical_integration: 'Supply chain changes expected',
            international_expansion: 'Global market opportunities emerging',
            sustainability_focus: 'Environmental regulations may tighten'
        };

        return recommendations[strategyData.strategy] || 'Monitor competitive landscape changes';
    }

    // Counter-Intelligence Operations
    async launchCounterOperation(playerId, targetPlayerId, operationType = 'defensive') {
        const counterId = uuidv4();
        const counterOp = {
            id: counterId,
            playerId,
            targetPlayerId,
            type: operationType,
            startTime: Date.now(),
            duration: 7200000, // 2 hours
            status: 'active',
            effectiveness: this.calculateCounterEffectiveness(playerId, targetPlayerId),
            results: null
        };

        this.state.counterOperations.set(counterId, counterOp);

        // Schedule completion
        setTimeout(() => {
            this.completeCounterOperation(counterId);
        }, counterOp.duration);

        this.emit('counter_operation_launched', { playerId, counterId, counterOp });
        return { counterId, estimatedCompletion: counterOp.duration };
    }

    calculateCounterEffectiveness(defenderId, attackerId) {
        // Base effectiveness
        let effectiveness = 0.5;

        // Defender advantage
        const defenderIntel = this.state.playerIntelligence.get(defenderId);
        if (defenderIntel) {
            effectiveness += defenderIntel.counterIntelligenceLevel * 0.2;
        }

        // Attacker stealth
        const attackerIntel = this.state.playerIntelligence.get(attackerId);
        if (attackerIntel) {
            effectiveness -= attackerIntel.stealthLevel * 0.15;
        }

        return Math.max(0.1, Math.min(0.9, effectiveness));
    }

    completeCounterOperation(counterId) {
        const counterOp = this.state.counterOperations.get(counterId);
        if (!counterOp) return;

        counterOp.status = 'completed';
        counterOp.results = {
            success: Math.random() < counterOp.effectiveness,
            operationsDisrupted: 0,
            intelligenceGathered: null
        };

        if (counterOp.results.success) {
            // Find and disrupt target's operations
            const targetOps = Array.from(this.state.activeOperations.values())
                .filter(op => op.playerId === counterOp.targetPlayerId && op.status === 'active');

            targetOps.forEach(op => {
                if (Math.random() < 0.3) { // 30% chance to detect each operation
                    this.detectOperation(op.id);
                    counterOp.results.operationsDisrupted++;
                }
            });

            // Gather counter-intelligence
            if (Math.random() < 0.5) {
                counterOp.results.intelligenceGathered = {
                    type: 'counter_intelligence',
                    data: {
                        targetPlayer: counterOp.targetPlayerId,
                        operationCount: targetOps.length,
                        capabilities: this.assessPlayerCapabilities(counterOp.targetPlayerId),
                        vulnerabilities: this.identifyVulnerabilities(counterOp.targetPlayerId)
                    }
                };
            }
        }

        this.emit('counter_operation_completed', { 
            counterId, 
            playerId: counterOp.playerId,
            results: counterOp.results 
        });
    }

    detectOperation(operationId) {
        const operation = this.state.activeOperations.get(operationId);
        if (!operation) return;

        operation.detected = true;
        operation.status = 'compromised';

        // Reduce success rate to near zero
        operation.successRate *= 0.1;

        this.emit('operation_detected', { 
            operationId, 
            playerId: operation.playerId,
            operationType: operation.type 
        });
    }

    // Information Management
    storeIntelligence(playerId, intelligence) {
        if (!this.state.playerIntelligence.has(playerId)) {
            this.state.playerIntelligence.set(playerId, {
                playerId,
                skillLevel: 1,
                stealthLevel: 1,
                counterIntelligenceLevel: 1,
                experience: 0,
                intelligence: [],
                recentOperations: []
            });
        }

        const playerIntel = this.state.playerIntelligence.get(playerId);
        playerIntel.intelligence.push(intelligence);
        playerIntel.experience += 1;

        // Level up based on experience
        if (playerIntel.experience >= playerIntel.skillLevel * 10) {
            playerIntel.skillLevel += 1;
            this.emit('player_leveled_up', { playerId, newLevel: playerIntel.skillLevel });
        }

        // Keep only recent intelligence (last 50 items)
        if (playerIntel.intelligence.length > 50) {
            playerIntel.intelligence = playerIntel.intelligence.slice(-50);
        }
    }

    // System Updates
    updateOperations() {
        for (const [operationId, operation] of this.state.activeOperations) {
            if (operation.status === 'active') {
                // Update progress
                const elapsed = Date.now() - operation.startTime;
                operation.progress = Math.min(elapsed / operation.duration, 1.0);

                // Check for random detection events
                if (Math.random() < operation.detectionRisk * 0.01) { // 1% of risk per minute
                    this.detectOperation(operationId);
                }
            }
        }
    }

    decayInformation() {
        for (const playerIntel of this.state.playerIntelligence.values()) {
            playerIntel.intelligence = playerIntel.intelligence.filter(intel => {
                const age = Date.now() - intel.timestamp;
                const decayRate = this.informationValue[intel.type]?.decayRate || 0.1;
                const decayAmount = (age / 3600000) * decayRate; // Per hour decay
                
                intel.value = Math.max(0, intel.value * (1 - decayAmount));
                intel.quality = Math.max(0, intel.quality * (1 - decayAmount * 0.5));
                
                return intel.value > 100; // Remove worthless intelligence
            });
        }
    }

    performCounterIntelligenceSweeps() {
        // Automated counter-intelligence for high-security targets
        for (const [operationId, operation] of this.state.activeOperations) {
            if (operation.status === 'active' && operation.target.hasCounterIntelligence) {
                if (Math.random() < 0.2) { // 20% chance per sweep
                    this.detectOperation(operationId);
                }
            }
        }
    }

    // Assessment Methods
    assessPlayerCapabilities(playerId) {
        const playerIntel = this.state.playerIntelligence.get(playerId);
        if (!playerIntel) return { overall: 'unknown' };

        return {
            overall: playerIntel.skillLevel > 5 ? 'expert' : playerIntel.skillLevel > 3 ? 'advanced' : 'novice',
            stealth: playerIntel.stealthLevel,
            counterIntelligence: playerIntel.counterIntelligenceLevel,
            experience: playerIntel.experience,
            recentActivity: playerIntel.recentOperations.length
        };
    }

    identifyVulnerabilities(playerId) {
        const recentOps = Array.from(this.state.activeOperations.values())
            .filter(op => op.playerId === playerId && Date.now() - op.startTime < 86400000);

        const vulnerabilities = [];

        if (recentOps.length > 3) {
            vulnerabilities.push('overextended_operations');
        }

        const detectedOps = recentOps.filter(op => op.detected);
        if (detectedOps.length > 1) {
            vulnerabilities.push('poor_operational_security');
        }

        const highRiskOps = recentOps.filter(op => op.detectionRisk > 0.6);
        if (highRiskOps.length > 0) {
            vulnerabilities.push('high_risk_operations');
        }

        return vulnerabilities;
    }

    // Public API Methods
    getPlayerIntelligence(playerId) {
        return this.state.playerIntelligence.get(playerId) || null;
    }

    getActiveOperations(playerId) {
        return Array.from(this.state.activeOperations.values())
            .filter(op => op.playerId === playerId);
    }

    getMarketIntelligence(playerId, marketType = null) {
        const playerIntel = this.state.playerIntelligence.get(playerId);
        if (!playerIntel) return [];

        return playerIntel.intelligence.filter(intel => {
            if (marketType && intel.target && intel.target.market !== marketType) return false;
            return intel.value > 0 && Date.now() < intel.expirationTime;
        });
    }

    getSystemStatus() {
        return {
            activeOperations: this.state.activeOperations.size,
            totalPlayers: this.state.playerIntelligence.size,
            counterOperations: this.state.counterOperations.size,
            informationAssets: this.state.informationAssets.size,
            surveillanceNetworks: this.state.surveillanceNetworks.size
        };
    }
}

module.exports = IntelligenceSystem;
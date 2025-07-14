/**
 * Game Balance System - Main Integration Module
 * Coordinates all balance components to ensure fair gameplay
 */

const EventEmitter = require('eventemitter3');

// Import balance components
const WealthDistributionSystem = require('./algorithms/wealth-distribution');
const MarketEfficiencyCalculator = require('./algorithms/market-efficiency');
const InsiderTradingDetector = require('./anti-exploitation/insider-trading-detector');
const MarketManipulationPrevention = require('./anti-exploitation/market-manipulation-prevention');
const ResourceRegenerationSystem = require('./equilibrium/resource-regeneration');
const PlayerProgressionSystem = require('./progression/player-progression');
const FairnessMonitoringSystem = require('./monitoring/fairness-monitor');

class GameBalanceSystem extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // System integration settings
            enableWealthDistribution: config.enableWealthDistribution !== false,
            enableMarketEfficiency: config.enableMarketEfficiency !== false,
            enableAntiExploitation: config.enableAntiExploitation !== false,
            enableResourceRegeneration: config.enableResourceRegeneration !== false,
            enablePlayerProgression: config.enablePlayerProgression !== false,
            enableFairnessMonitoring: config.enableFairnessMonitoring !== false,
            
            // Cross-system coordination
            interventionCoordination: config.interventionCoordination !== false,
            dataSharing: config.dataSharing !== false,
            eventPropagation: config.eventPropagation !== false,
            
            // Performance settings
            updateFrequency: config.updateFrequency || 60000, // 1 minute
            deepAnalysisFrequency: config.deepAnalysisFrequency || 3600000, // 1 hour
            
            // Component configurations
            wealthDistributionConfig: config.wealthDistributionConfig || {},
            marketEfficiencyConfig: config.marketEfficiencyConfig || {},
            insiderTradingConfig: config.insiderTradingConfig || {},
            marketManipulationConfig: config.marketManipulationConfig || {},
            resourceRegenerationConfig: config.resourceRegenerationConfig || {},
            playerProgressionConfig: config.playerProgressionConfig || {},
            fairnessMonitoringConfig: config.fairnessMonitoringConfig || {},
            
            ...config
        };

        this.state = {
            initialized: false,
            systemHealth: {
                overall: 1.0,
                components: new Map(),
                lastUpdate: Date.now()
            },
            coordinationActive: false,
            lastDeepAnalysis: 0,
            interventionQueue: [],
            crossSystemEvents: []
        };

        this.components = {};
        this.metrics = {
            balanceEffectiveness: 0,
            fairnessScore: 0,
            systemStability: 0,
            interventionSuccess: 0
        };

        this.initializeComponents();
    }

    // Initialize all balance components
    async initializeComponents() {
        try {
            // Initialize wealth distribution system
            if (this.config.enableWealthDistribution) {
                this.components.wealthDistribution = new WealthDistributionSystem(
                    this.config.wealthDistributionConfig
                );
                this.setupComponentIntegration('wealthDistribution', this.components.wealthDistribution);
            }

            // Initialize market efficiency calculator
            if (this.config.enableMarketEfficiency) {
                this.components.marketEfficiency = new MarketEfficiencyCalculator(
                    this.config.marketEfficiencyConfig
                );
                this.setupComponentIntegration('marketEfficiency', this.components.marketEfficiency);
            }

            // Initialize anti-exploitation systems
            if (this.config.enableAntiExploitation) {
                this.components.insiderTradingDetector = new InsiderTradingDetector(
                    this.config.insiderTradingConfig
                );
                this.components.marketManipulationPrevention = new MarketManipulationPrevention(
                    this.config.marketManipulationConfig
                );
                
                this.setupComponentIntegration('insiderTradingDetector', this.components.insiderTradingDetector);
                this.setupComponentIntegration('marketManipulationPrevention', this.components.marketManipulationPrevention);
            }

            // Initialize resource regeneration system
            if (this.config.enableResourceRegeneration) {
                this.components.resourceRegeneration = new ResourceRegenerationSystem(
                    this.config.resourceRegenerationConfig
                );
                this.setupComponentIntegration('resourceRegeneration', this.components.resourceRegeneration);
            }

            // Initialize player progression system
            if (this.config.enablePlayerProgression) {
                this.components.playerProgression = new PlayerProgressionSystem(
                    this.config.playerProgressionConfig
                );
                this.setupComponentIntegration('playerProgression', this.components.playerProgression);
            }

            // Initialize fairness monitoring (should be last to integrate with all other systems)
            if (this.config.enableFairnessMonitoring) {
                this.components.fairnessMonitoring = new FairnessMonitoringSystem(
                    this.config.fairnessMonitoringConfig
                );
                this.setupFairnessMonitoringIntegration();
            }

            // Start coordination systems
            if (this.config.interventionCoordination) {
                this.startInterventionCoordination();
            }

            // Start update cycles
            this.startUpdateCycles();

            this.state.initialized = true;
            this.state.coordinationActive = true;

            this.emit('system_initialized', {
                components: Object.keys(this.components),
                timestamp: Date.now()
            });

            return true;

        } catch (error) {
            this.emit('initialization_error', { error: error.message });
            throw error;
        }
    }

    // Set up integration for individual components
    setupComponentIntegration(componentName, component) {
        if (!this.config.eventPropagation) return;

        // Forward all component events with component identifier
        component.on('*', (eventName, ...args) => {
            this.emit(`${componentName}_${eventName}`, ...args);
            
            // Log cross-system events for analysis
            this.state.crossSystemEvents.push({
                timestamp: Date.now(),
                component: componentName,
                event: eventName,
                data: args[0]
            });

            // Keep only recent events
            if (this.state.crossSystemEvents.length > 1000) {
                this.state.crossSystemEvents.shift();
            }
        });

        // Set up specific event handling for coordination
        this.setupSpecificEventHandling(componentName, component);
    }

    setupSpecificEventHandling(componentName, component) {
        switch (componentName) {
            case 'wealthDistribution':
                component.on('wealth_redistribution', (data) => {
                    this.handleWealthRedistribution(data);
                });
                component.on('wealth_cap_applied', (data) => {
                    this.handleWealthCap(data);
                });
                break;

            case 'marketEfficiency':
                component.on('efficiency_intervention', (data) => {
                    this.handleEfficiencyIntervention(data);
                });
                break;

            case 'insiderTradingDetector':
                component.on('suspicious_activity_detected', (data) => {
                    this.handleSuspiciousActivity('insider_trading', data);
                });
                component.on('enforcement_action', (data) => {
                    this.handleEnforcementAction('insider_trading', data);
                });
                break;

            case 'marketManipulationPrevention':
                component.on('manipulation_detected', (data) => {
                    this.handleSuspiciousActivity('market_manipulation', data);
                });
                component.on('enforcement_action', (data) => {
                    this.handleEnforcementAction('market_manipulation', data);
                });
                break;

            case 'resourceRegeneration':
                component.on('regeneration_cycle_complete', (data) => {
                    this.handleResourceRegeneration(data);
                });
                component.on('emergency_intervention', (data) => {
                    this.handleResourceEmergency(data);
                });
                break;

            case 'playerProgression':
                component.on('catch_up_activated', (data) => {
                    this.handleCatchUpActivation(data);
                });
                component.on('dominance_penalty_applied', (data) => {
                    this.handleDominancePenalty(data);
                });
                break;
        }
    }

    // Set up fairness monitoring integration
    setupFairnessMonitoringIntegration() {
        const fairnessMonitor = this.components.fairnessMonitoring;
        
        // Integrate all other systems with fairness monitoring
        Object.entries(this.components).forEach(([name, component]) => {
            if (name !== 'fairnessMonitoring') {
                const systemMapping = {
                    wealthDistribution: 'wealthDistribution',
                    marketEfficiency: 'marketEfficiency',
                    playerProgression: 'playerProgression',
                    insiderTradingDetector: 'antiExploitation',
                    marketManipulationPrevention: 'antiExploitation'
                };
                
                const systemType = systemMapping[name];
                if (systemType) {
                    fairnessMonitor.integrateWithSystem(systemType, component);
                }
            }
        });

        // Handle fairness monitoring events
        fairnessMonitor.on('fairness_violation', (data) => {
            this.handleFairnessViolation(data);
        });

        fairnessMonitor.on('intervention_executed', (data) => {
            this.handleFairnessIntervention(data);
        });
    }

    // Event handlers for cross-system coordination
    handleWealthRedistribution(data) {
        // Notify other systems about wealth redistribution
        if (this.components.playerProgression) {
            // May affect player progression and catch-up mechanics
            this.coordinateWealthProgressionImpact(data);
        }

        if (this.components.marketEfficiency) {
            // May affect market liquidity and efficiency
            this.coordinateWealthMarketImpact(data);
        }
    }

    handleWealthCap(data) {
        // When wealth cap is applied, may need to adjust other systems
        if (this.components.playerProgression) {
            // Check if player needs progression assistance
            const playerId = data.agentId;
            this.checkPlayerProgressionAfterWealthCap(playerId);
        }
    }

    handleEfficiencyIntervention(data) {
        // Market efficiency interventions may affect wealth distribution
        if (this.components.wealthDistribution && data.results) {
            this.coordinateEfficiencyWealthImpact(data);
        }
    }

    handleSuspiciousActivity(type, data) {
        // Coordinate anti-exploitation measures across systems
        if (this.components.playerProgression) {
            // May need to adjust player progression for violators
            this.coordinateExploitationProgressionImpact(type, data);
        }

        if (this.components.wealthDistribution) {
            // May need wealth adjustments for manipulation
            this.coordinateExploitationWealthImpact(type, data);
        }
    }

    handleEnforcementAction(type, data) {
        // Log enforcement actions for system-wide analysis
        this.recordEnforcementMetrics(type, data);
    }

    handleResourceRegeneration(data) {
        // Resource regeneration may affect market efficiency
        if (this.components.marketEfficiency) {
            this.coordinateResourceMarketImpact(data);
        }
    }

    handleResourceEmergency(data) {
        // Resource emergencies may require system-wide interventions
        this.triggerEmergencyCoordination('resource_emergency', data);
    }

    handleCatchUpActivation(data) {
        // Catch-up activation may affect wealth distribution
        if (this.components.wealthDistribution) {
            this.coordinateCatchUpWealthImpact(data);
        }
    }

    handleDominancePenalty(data) {
        // Dominance penalties may require market efficiency adjustments
        if (this.components.marketEfficiency) {
            this.coordinateDominanceMarketImpact(data);
        }
    }

    handleFairnessViolation(data) {
        // Fairness violations may require coordinated response
        this.triggerCoordinatedFairnessResponse(data);
    }

    handleFairnessIntervention(data) {
        // Track fairness intervention effectiveness
        this.recordFairnessInterventionMetrics(data);
    }

    // Coordination methods
    coordinateWealthProgressionImpact(data) {
        // Check if redistribution affects players needing catch-up
        const affectedAgents = data.actions?.map(action => action.agentId) || [];
        
        affectedAgents.forEach(agentId => {
            if (this.components.playerProgression) {
                // Update player status after wealth change
                this.components.playerProgression.updatePlayerStatus(agentId);
            }
        });
    }

    coordinateWealthMarketImpact(data) {
        // Wealth redistribution may affect market liquidity
        const totalRedistributed = data.redistributed || 0;
        
        if (totalRedistributed > 1000000) { // Significant redistribution
            // May need to adjust market efficiency calculations
            this.queueCoordinatedIntervention({
                type: 'market_liquidity_adjustment',
                trigger: 'wealth_redistribution',
                data: { amount: totalRedistributed }
            });
        }
    }

    coordinateEfficiencyWealthImpact(data) {
        // Market efficiency interventions may create wealth imbalances
        if (data.results.some(r => r.type === 'liquidity_injection')) {
            // Liquidity injections may concentrate wealth
            this.queueCoordinatedIntervention({
                type: 'wealth_concentration_check',
                trigger: 'efficiency_intervention',
                data
            });
        }
    }

    coordinateExploitationProgressionImpact(type, data) {
        // Exploitation may warrant progression penalties
        const violatorId = data.agentId || data.suspiciousAgents?.[0]?.agentId;
        
        if (violatorId && this.components.playerProgression) {
            this.queueCoordinatedIntervention({
                type: 'progression_penalty',
                trigger: `exploitation_${type}`,
                data: { agentId: violatorId, violationType: type }
            });
        }
    }

    triggerEmergencyCoordination(emergencyType, data) {
        // Coordinate emergency response across all systems
        const intervention = {
            id: this.generateInterventionId(),
            type: 'emergency_coordination',
            emergencyType,
            timestamp: Date.now(),
            data,
            actions: this.determineEmergencyActions(emergencyType, data)
        };

        this.state.interventionQueue.push(intervention);
        this.emit('emergency_coordination_triggered', intervention);
    }

    determineEmergencyActions(emergencyType, data) {
        const actions = [];
        
        switch (emergencyType) {
            case 'resource_emergency':
                // All systems may need to respond to resource crisis
                if (this.components.wealthDistribution) {
                    actions.push({
                        system: 'wealthDistribution',
                        action: 'emergency_redistribution',
                        params: { resourceType: data.resourceType }
                    });
                }
                
                if (this.components.marketEfficiency) {
                    actions.push({
                        system: 'marketEfficiency',
                        action: 'emergency_efficiency_boost',
                        params: { marketId: data.resourceType }
                    });
                }
                break;
                
            case 'system_fairness_crisis':
                // Comprehensive fairness response
                actions.push(...this.generateFairnessCrisisActions(data));
                break;
        }
        
        return actions;
    }

    // Start coordination systems
    startInterventionCoordination() {
        // Process intervention queue regularly
        this.interventionInterval = setInterval(() => {
            this.processInterventionQueue();
        }, 30000); // Every 30 seconds
    }

    startUpdateCycles() {
        // Regular system updates
        this.updateInterval = setInterval(() => {
            this.executeSystemUpdate();
        }, this.config.updateFrequency);

        // Deep analysis cycles
        this.deepAnalysisInterval = setInterval(() => {
            this.executeDeepAnalysis();
        }, this.config.deepAnalysisFrequency);
    }

    processInterventionQueue() {
        while (this.state.interventionQueue.length > 0) {
            const intervention = this.state.interventionQueue.shift();
            this.executeCoordinatedIntervention(intervention);
        }
    }

    executeCoordinatedIntervention(intervention) {
        intervention.executionStart = Date.now();
        intervention.results = [];

        try {
            for (const action of intervention.actions) {
                const result = this.executeInterventionAction(action);
                intervention.results.push(result);
            }

            intervention.status = 'completed';
            intervention.executionEnd = Date.now();

        } catch (error) {
            intervention.status = 'failed';
            intervention.error = error.message;
            intervention.executionEnd = Date.now();
        }

        this.emit('coordinated_intervention_executed', intervention);
    }

    executeInterventionAction(action) {
        const component = this.components[action.system];
        if (!component) {
            throw new Error(`Component ${action.system} not available`);
        }

        // Execute the specified action on the component
        if (typeof component[action.action] === 'function') {
            return component[action.action](action.params);
        } else {
            throw new Error(`Action ${action.action} not available on ${action.system}`);
        }
    }

    executeSystemUpdate() {
        // Update system health metrics
        this.updateSystemHealth();
        
        // Update balance effectiveness metrics
        this.updateBalanceMetrics();
        
        // Emit system update event
        this.emit('system_update', {
            timestamp: Date.now(),
            systemHealth: this.state.systemHealth,
            metrics: this.metrics
        });
    }

    executeDeepAnalysis() {
        if (!this.state.initialized) return;

        const analysis = {
            timestamp: Date.now(),
            systemHealth: this.state.systemHealth,
            componentMetrics: this.gatherComponentMetrics(),
            coordinationEffectiveness: this.calculateCoordinationEffectiveness(),
            balanceAnalysis: this.performBalanceAnalysis(),
            recommendations: this.generateSystemRecommendations()
        };

        this.state.lastDeepAnalysis = Date.now();
        
        this.emit('deep_analysis_complete', analysis);
        return analysis;
    }

    // Metrics and analysis methods
    updateSystemHealth() {
        const componentHealthScores = [];
        
        Object.entries(this.components).forEach(([name, component]) => {
            let healthScore = 1.0;
            
            // Calculate component-specific health
            if (component.getHealthMetrics) {
                const metrics = component.getHealthMetrics();
                healthScore = metrics.overallHealth || 1.0;
            } else if (component.state && component.state.systemHealth) {
                healthScore = component.state.systemHealth.overall || 1.0;
            }
            
            this.state.systemHealth.components.set(name, healthScore);
            componentHealthScores.push(healthScore);
        });

        // Calculate overall system health
        this.state.systemHealth.overall = componentHealthScores.length > 0 ?
            componentHealthScores.reduce((sum, score) => sum + score, 0) / componentHealthScores.length : 1.0;
        
        this.state.systemHealth.lastUpdate = Date.now();
    }

    updateBalanceMetrics() {
        // Balance effectiveness
        this.metrics.balanceEffectiveness = this.calculateBalanceEffectiveness();
        
        // Fairness score
        this.metrics.fairnessScore = this.calculateFairnessScore();
        
        // System stability
        this.metrics.systemStability = this.calculateSystemStability();
        
        // Intervention success rate
        this.metrics.interventionSuccess = this.calculateInterventionSuccessRate();
    }

    calculateBalanceEffectiveness() {
        // Calculate how well the system maintains balance
        let effectiveness = 0;
        let componentCount = 0;

        if (this.components.wealthDistribution) {
            const wealthMetrics = this.components.wealthDistribution.getWealthMetrics();
            const giniTarget = 0.4; // Target Gini coefficient
            const giniEffectiveness = Math.max(0, 1 - Math.abs(wealthMetrics.giniCoefficient - giniTarget) / giniTarget);
            effectiveness += giniEffectiveness;
            componentCount++;
        }

        if (this.components.marketEfficiency) {
            const efficiencyReport = this.components.marketEfficiency.getMarketEfficiencyReport();
            effectiveness += efficiencyReport.overallEfficiencyScore;
            componentCount++;
        }

        return componentCount > 0 ? effectiveness / componentCount : 1.0;
    }

    calculateFairnessScore() {
        if (this.components.fairnessMonitoring) {
            return this.components.fairnessMonitoring.state.systemHealth.overall;
        }
        return 1.0;
    }

    calculateSystemStability() {
        // Based on intervention frequency and system health variance
        const recentInterventions = this.state.crossSystemEvents.filter(event => 
            Date.now() - event.timestamp < 3600000 && // Last hour
            event.event.includes('intervention')
        ).length;

        const stabilityScore = Math.max(0, 1 - (recentInterventions / 10)); // Normalize to 0-1
        return stabilityScore;
    }

    calculateInterventionSuccessRate() {
        const recentInterventions = this.state.crossSystemEvents.filter(event => 
            Date.now() - event.timestamp < 86400000 && // Last 24 hours
            event.event.includes('intervention')
        );

        if (recentInterventions.length === 0) return 1.0;

        const successfulInterventions = recentInterventions.filter(intervention => 
            intervention.data?.status === 'completed' || intervention.data?.success
        ).length;

        return successfulInterventions / recentInterventions.length;
    }

    gatherComponentMetrics() {
        const metrics = {};
        
        Object.entries(this.components).forEach(([name, component]) => {
            if (component.getMetrics) {
                metrics[name] = component.getMetrics();
            } else if (component.getDetailedMetrics) {
                metrics[name] = component.getDetailedMetrics();
            } else if (component.getSystemStatus) {
                metrics[name] = component.getSystemStatus();
            }
        });

        return metrics;
    }

    calculateCoordinationEffectiveness() {
        const totalEvents = this.state.crossSystemEvents.length;
        const coordinatedEvents = this.state.crossSystemEvents.filter(event => 
            event.data?.coordinated || event.event.includes('coordinated')
        ).length;

        return totalEvents > 0 ? coordinatedEvents / totalEvents : 1.0;
    }

    performBalanceAnalysis() {
        return {
            wealthBalance: this.analyzeWealthBalance(),
            marketBalance: this.analyzeMarketBalance(),
            playerBalance: this.analyzePlayerBalance(),
            resourceBalance: this.analyzeResourceBalance(),
            overallBalance: this.metrics.balanceEffectiveness
        };
    }

    analyzeWealthBalance() {
        if (!this.components.wealthDistribution) return null;
        
        const metrics = this.components.wealthDistribution.getWealthMetrics();
        return {
            giniCoefficient: metrics.giniCoefficient,
            inequalityStatus: metrics.inequalityStatus,
            interventionCount: metrics.interventionHistory.length
        };
    }

    analyzeMarketBalance() {
        if (!this.components.marketEfficiency) return null;
        
        const report = this.components.marketEfficiency.getMarketEfficiencyReport();
        return {
            overallEfficiency: report.overallEfficiencyScore,
            marketCount: report.marketCount,
            interventionCount: report.interventionHistory.length
        };
    }

    analyzePlayerBalance() {
        if (!this.components.playerProgression) return null;
        
        const report = this.components.playerProgression.generateProgressionReport();
        return {
            fairnessMetrics: report.fairnessMetrics,
            catchUpActive: report.catchUpActive,
            dominanceWatch: report.dominanceWatch
        };
    }

    analyzeResourceBalance() {
        if (!this.components.resourceRegeneration) return null;
        
        const states = this.components.resourceRegeneration.getResourceStates();
        const avgUtilization = Object.values(states).reduce((sum, state) => 
            sum + state.poolUtilization, 0) / Object.keys(states).length;
        
        return {
            averageUtilization: avgUtilization,
            resourceCount: Object.keys(states).length,
            systemHealth: avgUtilization > 0.8 ? 'good' : avgUtilization > 0.5 ? 'fair' : 'poor'
        };
    }

    generateSystemRecommendations() {
        const recommendations = [];
        
        // System-wide recommendations based on metrics
        if (this.metrics.balanceEffectiveness < 0.7) {
            recommendations.push({
                priority: 'high',
                category: 'balance',
                action: 'Review and strengthen balance mechanisms',
                expectedImpact: 'Improve overall balance effectiveness'
            });
        }
        
        if (this.metrics.fairnessScore < 0.6) {
            recommendations.push({
                priority: 'critical',
                category: 'fairness',
                action: 'Implement emergency fairness measures',
                expectedImpact: 'Restore fair gameplay conditions'
            });
        }
        
        if (this.metrics.systemStability < 0.5) {
            recommendations.push({
                priority: 'medium',
                category: 'stability',
                action: 'Reduce intervention frequency and improve prediction',
                expectedImpact: 'Increase system stability'
            });
        }
        
        return recommendations;
    }

    // Public API methods
    
    // Register a new player across all systems
    registerPlayer(playerId, playerData = {}) {
        const results = {};
        
        if (this.components.wealthDistribution) {
            results.wealth = this.components.wealthDistribution.registerAgent(
                playerId, playerData.initialWealth || 1000
            );
        }
        
        if (this.components.insiderTradingDetector) {
            results.insiderTrading = this.components.insiderTradingDetector.registerAgent(
                playerId, playerData
            );
        }
        
        if (this.components.playerProgression) {
            results.progression = this.components.playerProgression.registerPlayer(
                playerId, playerData
            );
        }
        
        this.emit('player_registered', { playerId, results });
        return results;
    }

    // Register a new market across relevant systems
    registerMarket(marketId, marketData) {
        const results = {};
        
        if (this.components.marketEfficiency) {
            results.efficiency = this.components.marketEfficiency.registerMarket(
                marketId, marketData
            );
        }
        
        if (this.components.marketManipulationPrevention) {
            results.manipulation = this.components.marketManipulationPrevention.registerMarket(
                marketId, marketData
            );
        }
        
        if (this.components.resourceRegeneration) {
            results.resources = this.components.resourceRegeneration.registerMarket(
                marketId, marketData
            );
        }
        
        this.emit('market_registered', { marketId, results });
        return results;
    }

    // Record trading activity across all systems
    recordTradingActivity(agentId, tradeData) {
        const results = {};
        
        if (this.components.wealthDistribution) {
            this.components.wealthDistribution.updateAgentWealth(
                agentId, tradeData.newWealth
            );
            results.wealthUpdated = true;
        }
        
        if (this.components.insiderTradingDetector) {
            results.insiderTrading = this.components.insiderTradingDetector.recordTradingActivity(
                agentId, tradeData
            );
        }
        
        if (this.components.marketManipulationPrevention) {
            results.manipulation = this.components.marketManipulationPrevention.recordTradingActivity(
                agentId, tradeData
            );
        }
        
        if (this.components.marketEfficiency) {
            this.components.marketEfficiency.updateMarketData(
                tradeData.marketId, tradeData
            );
            results.efficiencyUpdated = true;
        }
        
        this.emit('trading_activity_recorded', { agentId, tradeData, results });
        return results;
    }

    // Get comprehensive system status
    getSystemStatus() {
        return {
            initialized: this.state.initialized,
            coordinationActive: this.state.coordinationActive,
            systemHealth: this.state.systemHealth,
            metrics: this.metrics,
            componentStatus: Object.fromEntries(
                Object.entries(this.components).map(([name, component]) => [
                    name,
                    {
                        active: !!component,
                        health: this.state.systemHealth.components.get(name) || 0
                    }
                ])
            ),
            lastDeepAnalysis: this.state.lastDeepAnalysis,
            interventionQueueLength: this.state.interventionQueue.length
        };
    }

    // Manual intervention trigger
    triggerManualIntervention(type, params = {}) {
        const intervention = {
            id: this.generateInterventionId(),
            type: 'manual',
            subType: type,
            timestamp: Date.now(),
            params,
            actions: this.determineManualInterventionActions(type, params)
        };
        
        this.state.interventionQueue.push(intervention);
        
        this.emit('manual_intervention_triggered', intervention);
        return intervention.id;
    }

    determineManualInterventionActions(type, params) {
        const actionMap = {
            'emergency_wealth_redistribution': [{
                system: 'wealthDistribution',
                action: 'executeEconomicReset',
                params: { resetType: params.resetType || 'partial' }
            }],
            'market_efficiency_boost': [{
                system: 'marketEfficiency',
                action: 'executeEfficiencyInterventions',
                params
            }],
            'player_assistance': [{
                system: 'playerProgression',
                action: 'activateCatchUpMechanics',
                params
            }],
            'resource_emergency': [{
                system: 'resourceRegeneration',
                action: 'executeEmergencyIntervention',
                params
            }]
        };
        
        return actionMap[type] || [];
    }

    // Utility methods
    queueCoordinatedIntervention(intervention) {
        intervention.id = this.generateInterventionId();
        intervention.timestamp = Date.now();
        this.state.interventionQueue.push(intervention);
    }

    generateInterventionId() {
        return `intervention_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    recordEnforcementMetrics(type, data) {
        // Record enforcement action metrics for analysis
        this.state.crossSystemEvents.push({
            timestamp: Date.now(),
            component: 'enforcement',
            event: `${type}_enforcement`,
            data
        });
    }

    recordFairnessInterventionMetrics(data) {
        // Record fairness intervention effectiveness
        this.state.crossSystemEvents.push({
            timestamp: Date.now(),
            component: 'fairness',
            event: 'fairness_intervention',
            data
        });
    }

    // Coordination placeholders for specific scenarios
    coordinateCatchUpWealthImpact(data) {
        // Coordinate catch-up with wealth system
    }

    coordinateDominanceMarketImpact(data) {
        // Coordinate dominance penalties with market efficiency
    }

    triggerCoordinatedFairnessResponse(data) {
        // Trigger coordinated response to fairness violations
    }

    coordinateExploitationWealthImpact(type, data) {
        // Coordinate exploitation response with wealth system
    }

    coordinateResourceMarketImpact(data) {
        // Coordinate resource regeneration with market efficiency
    }

    checkPlayerProgressionAfterWealthCap(playerId) {
        // Check if player needs assistance after wealth cap
    }

    generateFairnessCrisisActions(data) {
        // Generate actions for fairness crisis
        return [];
    }

    // Cleanup and shutdown
    stop() {
        // Stop all intervals
        if (this.updateInterval) clearInterval(this.updateInterval);
        if (this.deepAnalysisInterval) clearInterval(this.deepAnalysisInterval);
        if (this.interventionInterval) clearInterval(this.interventionInterval);
        
        // Stop all components
        Object.values(this.components).forEach(component => {
            if (component.stop) component.stop();
        });
        
        this.state.initialized = false;
        this.state.coordinationActive = false;
        
        this.emit('system_stopped');
    }
}

module.exports = GameBalanceSystem;
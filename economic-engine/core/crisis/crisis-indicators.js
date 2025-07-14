/**
 * Crisis Early Warning Indicators and Prediction System
 * Provides predictive analytics and risk assessment for economic crises
 */

const EventEmitter = require('eventemitter3');
const Decimal = require('decimal.js');
const { v4: uuidv4 } = require('uuid');
const logger = require('pino')();

class CrisisIndicatorsEngine extends EventEmitter {
    constructor(crisisEngine, psychologyEngine, config = {}) {
        super();
        
        this.crisisEngine = crisisEngine;
        this.psychologyEngine = psychologyEngine;
        
        this.config = {
            predictionHorizon: config.predictionHorizon || 50, // ticks ahead
            warningThreshold: config.warningThreshold || 0.7,
            alertThreshold: config.alertThreshold || 0.8,
            indicatorUpdateFrequency: config.indicatorUpdateFrequency || 5,
            historicalDepth: config.historicalDepth || 200,
            ...config
        };

        this.state = {
            indicators: new Map(),
            predictions: new Map(),
            alerts: new Map(),
            earlyWarnings: new Map(),
            riskScores: new Map(),
            historicalData: [],
            modelAccuracy: new Map(),
            currentTick: 0
        };

        this.indicatorTypes = {
            systemic_risk: {
                name: 'Systemic Risk Index',
                weight: 0.25,
                sources: ['leverage', 'interconnectedness', 'volatility'],
                prediction_accuracy: 0.75
            },
            liquidity_stress: {
                name: 'Liquidity Stress Indicator',
                weight: 0.20,
                sources: ['bank_liquidity', 'market_liquidity', 'funding_stress'],
                prediction_accuracy: 0.80
            },
            market_sentiment: {
                name: 'Market Sentiment Index',
                weight: 0.15,
                sources: ['fear_greed', 'confidence', 'herding_behavior'],
                prediction_accuracy: 0.65
            },
            currency_pressure: {
                name: 'Currency Pressure Index',
                weight: 0.15,
                sources: ['exchange_rate_volatility', 'capital_flows', 'reserves'],
                prediction_accuracy: 0.70
            },
            debt_sustainability: {
                name: 'Debt Sustainability Index',
                weight: 0.12,
                sources: ['debt_ratios', 'default_rates', 'coverage_ratios'],
                prediction_accuracy: 0.78
            },
            supply_chain_health: {
                name: 'Supply Chain Health Index',
                weight: 0.08,
                sources: ['scarcity_levels', 'production_efficiency', 'trade_flows'],
                prediction_accuracy: 0.72
            },
            political_stability: {
                name: 'Political Stability Index',
                weight: 0.05,
                sources: ['policy_uncertainty', 'intervention_frequency', 'public_support'],
                prediction_accuracy: 0.60
            }
        };

        this.alertLevels = {
            green: { threshold: 0.3, name: 'Normal', description: 'Low crisis risk' },
            yellow: { threshold: 0.5, name: 'Watch', description: 'Elevated risk indicators' },
            orange: { threshold: 0.7, name: 'Warning', description: 'High risk of crisis' },
            red: { threshold: 0.85, name: 'Alert', description: 'Crisis imminent or occurring' },
            critical: { threshold: 0.95, name: 'Critical', description: 'Severe crisis conditions' }
        };

        this.initializeIndicators();
        
        logger.info('Crisis Indicators Engine initialized');
    }

    initializeIndicators() {
        for (const [indicatorId, config] of Object.entries(this.indicatorTypes)) {
            this.state.indicators.set(indicatorId, {
                id: indicatorId,
                name: config.name,
                weight: config.weight,
                sources: config.sources,
                current_value: 0.3, // Start at low-medium risk
                historical_values: [],
                trend: 0,
                volatility: 0,
                reliability: config.prediction_accuracy,
                last_updated: Date.now(),
                sub_indicators: new Map()
            });
        }

        // Initialize prediction models
        this.initializePredictionModels();
    }

    initializePredictionModels() {
        const models = [
            {
                id: 'bank_run_predictor',
                name: 'Bank Run Prediction Model',
                target: 'bank_run',
                accuracy: 0.78,
                inputs: ['liquidity_stress', 'market_sentiment', 'systemic_risk']
            },
            {
                id: 'bubble_predictor',
                name: 'Bubble Formation Predictor',
                target: 'bubble',
                accuracy: 0.72,
                inputs: ['market_sentiment', 'systemic_risk', 'liquidity_stress']
            },
            {
                id: 'currency_crisis_predictor',
                name: 'Currency Crisis Predictor',
                target: 'currency_crisis',
                accuracy: 0.75,
                inputs: ['currency_pressure', 'debt_sustainability', 'political_stability']
            },
            {
                id: 'supply_shock_predictor',
                name: 'Supply Shock Predictor',
                target: 'supply_shock',
                accuracy: 0.70,
                inputs: ['supply_chain_health', 'political_stability', 'systemic_risk']
            },
            {
                id: 'debt_crisis_predictor',
                name: 'Debt Crisis Predictor',
                target: 'debt_crisis',
                accuracy: 0.80,
                inputs: ['debt_sustainability', 'systemic_risk', 'liquidity_stress']
            }
        ];

        models.forEach(model => {
            this.state.predictions.set(model.id, {
                ...model,
                current_probability: 0.1,
                prediction_horizon: this.config.predictionHorizon,
                confidence: 0.5,
                historical_accuracy: model.accuracy,
                recent_predictions: [],
                false_positives: 0,
                false_negatives: 0,
                true_positives: 0,
                true_negatives: 0
            });
        });
    }

    // Main tick processing
    tick(marketData, agents) {
        this.state.currentTick++;
        
        if (this.state.currentTick % this.config.indicatorUpdateFrequency === 0) {
            this.updateIndicators(marketData, agents);
            this.calculatePredictions();
            this.updateAlerts();
            this.validatePredictions();
            this.recordHistoricalData();
        }
        
        return this.getCrisisIndicatorsStatus();
    }

    updateIndicators(marketData, agents) {
        // Update each indicator
        for (const [indicatorId, indicator] of this.state.indicators) {
            const newValue = this.calculateIndicatorValue(indicatorId, marketData, agents);
            
            // Update historical values
            indicator.historical_values.push({
                value: newValue,
                timestamp: Date.now(),
                tick: this.state.currentTick
            });
            
            // Keep only recent history
            if (indicator.historical_values.length > this.config.historicalDepth) {
                indicator.historical_values.shift();
            }
            
            // Calculate trend and volatility
            this.updateIndicatorStatistics(indicator, newValue);
            
            indicator.current_value = newValue;
            indicator.last_updated = Date.now();
        }
        
        // Calculate composite risk score
        this.calculateCompositeRiskScore();
    }

    calculateIndicatorValue(indicatorId, marketData, agents) {
        switch (indicatorId) {
            case 'systemic_risk':
                return this.calculateSystemicRiskIndicator(marketData, agents);
            case 'liquidity_stress':
                return this.calculateLiquidityStressIndicator(marketData, agents);
            case 'market_sentiment':
                return this.calculateMarketSentimentIndicator(marketData, agents);
            case 'currency_pressure':
                return this.calculateCurrencyPressureIndicator(marketData, agents);
            case 'debt_sustainability':
                return this.calculateDebtSustainabilityIndicator(marketData, agents);
            case 'supply_chain_health':
                return this.calculateSupplyChainHealthIndicator(marketData, agents);
            case 'political_stability':
                return this.calculatePoliticalStabilityIndicator(marketData, agents);
            default:
                return 0.3;
        }
    }

    calculateSystemicRiskIndicator(marketData, agents) {
        let riskScore = 0;
        
        // Leverage concentration
        let highLeverageAgents = 0;
        for (const [agentId, agent] of agents) {
            if (agent.isActive && (agent.leverage || 1) > 3.0) {
                highLeverageAgents++;
            }
        }
        const leverageRisk = highLeverageAgents / Math.max(1, agents.size);
        riskScore += leverageRisk * 0.4;
        
        // Market volatility
        let avgVolatility = 0;
        for (const [marketId, market] of marketData) {
            avgVolatility += market.volatility || 0;
        }
        avgVolatility /= Math.max(1, marketData.size);
        riskScore += avgVolatility * 0.3;
        
        // Interconnectedness (simplified)
        const connectionDensity = this.calculateNetworkDensity(agents);
        riskScore += connectionDensity * 0.3;
        
        return Math.min(1, riskScore);
    }

    calculateLiquidityStressIndicator(marketData, agents) {
        let liquidityStress = 0;
        
        // Market liquidity
        let avgLiquidity = 0;
        for (const [marketId, market] of marketData) {
            avgLiquidity += market.liquidity || 0.8;
        }
        avgLiquidity /= Math.max(1, marketData.size);
        liquidityStress += (1 - avgLiquidity) * 0.5;
        
        // Banking system liquidity
        if (this.crisisEngine.bankRunEngine) {
            let bankLiquidity = 0;
            let bankCount = 0;
            for (const bank of this.crisisEngine.bankRunEngine.state.bankingInstitutions.values()) {
                bankLiquidity += bank.liquidity;
                bankCount++;
            }
            if (bankCount > 0) {
                liquidityStress += (1 - bankLiquidity / bankCount) * 0.5;
            }
        }
        
        return Math.min(1, liquidityStress);
    }

    calculateMarketSentimentIndicator(marketData, agents) {
        const psychologyState = this.psychologyEngine.getPsychologyState();
        
        // Convert sentiment to risk (lower sentiment = higher risk)
        const sentimentRisk = 1 - psychologyState.globalSentiment;
        const fearRisk = psychologyState.fearIndex;
        const herdingRisk = psychologyState.herdingFactor;
        
        return (sentimentRisk * 0.4 + fearRisk * 0.4 + herdingRisk * 0.2);
    }

    calculateCurrencyPressureIndicator(marketData, agents) {
        let currencyPressure = 0;
        
        if (this.crisisEngine.currencyCrisisEngine) {
            const currencyStatus = this.crisisEngine.currencyCrisisEngine.getCurrencyCrisisStatus();
            
            // Active currency crises
            const activeCrises = currencyStatus.activeCrises || [];
            currencyPressure += Math.min(1, activeCrises.length * 0.3);
            
            // Exchange rate volatility
            let totalVolatility = 0;
            let rateCount = 0;
            for (const rate of Object.values(currencyStatus.exchangeRates || {})) {
                totalVolatility += rate.volatility || 0;
                rateCount++;
            }
            if (rateCount > 0) {
                currencyPressure += (totalVolatility / rateCount) * 0.5;
            }
            
            // Capital flight risk
            let avgFlightRisk = 0;
            let flowCount = 0;
            for (const flow of Object.values(currencyStatus.capitalFlows || {})) {
                avgFlightRisk += flow.flight_risk || 0;
                flowCount++;
            }
            if (flowCount > 0) {
                currencyPressure += (avgFlightRisk / flowCount) * 0.3;
            }
        }
        
        return Math.min(1, currencyPressure);
    }

    calculateDebtSustainabilityIndicator(marketData, agents) {
        let debtRisk = 0;
        
        if (this.crisisEngine.debtCascadeEngine) {
            const debtStatus = this.crisisEngine.debtCascadeEngine.getDebtCascadeStatus();
            
            // Systemic risk from debt engine
            debtRisk += debtStatus.systemicRisk * 0.5;
            
            // Credit market stress
            let avgStress = 0;
            let marketCount = 0;
            for (const market of Object.values(debtStatus.creditMarkets || {})) {
                avgStress += market.stress_level || 0;
                marketCount++;
            }
            if (marketCount > 0) {
                debtRisk += (avgStress / marketCount) * 0.3;
            }
            
            // Leverage distribution
            const leverageDistribution = debtStatus.leverageDistribution || {};
            const extremeLeverageRatio = leverageDistribution.extreme / 
                Math.max(1, Object.values(leverageDistribution).reduce((a, b) => a + b, 0));
            debtRisk += extremeLeverageRatio * 0.2;
        }
        
        return Math.min(1, debtRisk);
    }

    calculateSupplyChainHealthIndicator(marketData, agents) {
        let supplyRisk = 0;
        
        if (this.crisisEngine.supplyShockEngine) {
            const supplyStatus = this.crisisEngine.supplyShockEngine.getSupplyShockStatus();
            
            // Active supply shocks
            const activeShocks = supplyStatus.activeShocks || [];
            supplyRisk += Math.min(1, activeShocks.length * 0.2);
            
            // Supply chain health
            const chainHealth = supplyStatus.supplyChainHealth || [];
            let avgHealth = 0;
            for (const chain of chainHealth) {
                avgHealth += chain.health_score || 0.8;
            }
            if (chainHealth.length > 0) {
                supplyRisk += (1 - avgHealth / chainHealth.length) * 0.5;
            }
            
            // Resource scarcity
            let avgScarcity = 0;
            let scarcityCount = 0;
            for (const scarcity of Object.values(supplyStatus.resourceScarcity || {})) {
                avgScarcity += scarcity.current_level || 0;
                scarcityCount++;
            }
            if (scarcityCount > 0) {
                supplyRisk += (avgScarcity / scarcityCount) * 0.3;
            }
        }
        
        return Math.min(1, supplyRisk);
    }

    calculatePoliticalStabilityIndicator(marketData, agents) {
        let politicalRisk = 0;
        
        if (this.crisisEngine.interventionEngine) {
            const interventionStatus = this.crisisEngine.interventionEngine.getInterventionStatus();
            
            // Declining political will
            politicalRisk += (1 - interventionStatus.politicalWill) * 0.4;
            
            // Low public support
            politicalRisk += (1 - interventionStatus.publicSupport) * 0.3;
            
            // High intervention frequency
            const activeInterventions = interventionStatus.activeInterventions || [];
            politicalRisk += Math.min(0.3, activeInterventions.length * 0.1);
        }
        
        // Economic warfare
        if (this.crisisEngine.economicWarfareEngine) {
            const warfareStatus = this.crisisEngine.economicWarfareEngine.getEconomicWarfareStatus();
            const activeWars = warfareStatus.activeWars || [];
            politicalRisk += Math.min(0.3, activeWars.length * 0.15);
        }
        
        return Math.min(1, politicalRisk);
    }

    calculateNetworkDensity(agents) {
        // Simplified network density calculation
        let totalConnections = 0;
        for (const [agentId, agent] of agents) {
            if (agent.isActive && agent.relationships) {
                totalConnections += Object.keys(agent.relationships).length;
            }
        }
        
        const maxPossibleConnections = agents.size * (agents.size - 1);
        return maxPossibleConnections > 0 ? totalConnections / maxPossibleConnections : 0;
    }

    updateIndicatorStatistics(indicator, newValue) {
        const previousValue = indicator.current_value;
        
        // Calculate trend
        indicator.trend = newValue - previousValue;
        
        // Calculate volatility (simplified)
        if (indicator.historical_values.length >= 10) {
            const recent = indicator.historical_values.slice(-10).map(h => h.value);
            const mean = recent.reduce((sum, v) => sum + v, 0) / recent.length;
            const variance = recent.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / recent.length;
            indicator.volatility = Math.sqrt(variance);
        }
    }

    calculateCompositeRiskScore() {
        let compositeScore = 0;
        let totalWeight = 0;
        
        for (const [indicatorId, indicator] of this.state.indicators) {
            const weight = this.indicatorTypes[indicatorId].weight;
            compositeScore += indicator.current_value * weight;
            totalWeight += weight;
        }
        
        const finalScore = totalWeight > 0 ? compositeScore / totalWeight : 0;
        
        this.state.riskScores.set('composite', {
            score: finalScore,
            level: this.getRiskLevel(finalScore),
            timestamp: Date.now(),
            trend: this.calculateCompositeRiskTrend(),
            contributors: this.getTopRiskContributors()
        });
    }

    getRiskLevel(score) {
        for (const [level, config] of Object.entries(this.alertLevels)) {
            if (score <= config.threshold) {
                return { level, ...config };
            }
        }
        return { level: 'critical', ...this.alertLevels.critical };
    }

    calculateCompositeRiskTrend() {
        if (this.state.historicalData.length < 2) return 0;
        
        const current = this.state.historicalData[this.state.historicalData.length - 1]?.composite_risk || 0;
        const previous = this.state.historicalData[this.state.historicalData.length - 2]?.composite_risk || 0;
        
        return current - previous;
    }

    getTopRiskContributors() {
        const contributors = [];
        
        for (const [indicatorId, indicator] of this.state.indicators) {
            const weight = this.indicatorTypes[indicatorId].weight;
            const contribution = indicator.current_value * weight;
            
            contributors.push({
                indicator: indicatorId,
                name: indicator.name,
                contribution: contribution,
                current_value: indicator.current_value,
                trend: indicator.trend
            });
        }
        
        return contributors.sort((a, b) => b.contribution - a.contribution).slice(0, 5);
    }

    calculatePredictions() {
        for (const [modelId, model] of this.state.predictions) {
            const probability = this.calculateCrisisProbability(model);
            
            model.current_probability = probability;
            model.confidence = this.calculatePredictionConfidence(model);
            
            // Store prediction
            model.recent_predictions.push({
                probability: probability,
                confidence: model.confidence,
                timestamp: Date.now(),
                tick: this.state.currentTick,
                prediction_horizon: this.config.predictionHorizon
            });
            
            // Keep only recent predictions
            if (model.recent_predictions.length > 100) {
                model.recent_predictions.shift();
            }
        }
    }

    calculateCrisisProbability(model) {
        let probability = 0;
        let totalWeight = 0;
        
        // Combine input indicators
        for (const inputId of model.inputs) {
            const indicator = this.state.indicators.get(inputId);
            if (indicator) {
                const weight = this.indicatorTypes[inputId]?.weight || 0.1;
                probability += indicator.current_value * weight;
                totalWeight += weight;
            }
        }
        
        if (totalWeight > 0) {
            probability = probability / totalWeight;
        }
        
        // Apply model-specific adjustments
        probability = this.applyModelAdjustments(probability, model);
        
        return Math.max(0, Math.min(1, probability));
    }

    applyModelAdjustments(baseProbability, model) {
        let adjustedProbability = baseProbability;
        
        // Model-specific logic
        switch (model.target) {
            case 'bank_run':
                // Bank runs more likely during high sentiment volatility
                const sentimentIndicator = this.state.indicators.get('market_sentiment');
                if (sentimentIndicator && sentimentIndicator.volatility > 0.1) {
                    adjustedProbability *= 1.3;
                }
                break;
                
            case 'bubble':
                // Bubbles more likely with low volatility (complacency)
                const systemicIndicator = this.state.indicators.get('systemic_risk');
                if (systemicIndicator && systemicIndicator.volatility < 0.05) {
                    adjustedProbability *= 1.2;
                }
                break;
                
            case 'currency_crisis':
                // Currency crises more likely with rapid deterioration
                const currencyIndicator = this.state.indicators.get('currency_pressure');
                if (currencyIndicator && currencyIndicator.trend > 0.1) {
                    adjustedProbability *= 1.4;
                }
                break;
        }
        
        // Apply model accuracy as confidence factor
        adjustedProbability *= model.historical_accuracy;
        
        return adjustedProbability;
    }

    calculatePredictionConfidence(model) {
        // Base confidence on model accuracy
        let confidence = model.historical_accuracy;
        
        // Reduce confidence if input indicators are volatile
        let avgVolatility = 0;
        for (const inputId of model.inputs) {
            const indicator = this.state.indicators.get(inputId);
            if (indicator) {
                avgVolatility += indicator.volatility;
            }
        }
        avgVolatility /= model.inputs.length;
        
        confidence *= (1 - Math.min(0.5, avgVolatility * 2));
        
        // Recent prediction accuracy
        if (model.recent_predictions.length > 10) {
            const recentAccuracy = this.calculateRecentAccuracy(model);
            confidence = confidence * 0.7 + recentAccuracy * 0.3;
        }
        
        return Math.max(0.1, Math.min(1, confidence));
    }

    calculateRecentAccuracy(model) {
        // Simplified accuracy calculation
        // In a real system, this would compare predictions to actual outcomes
        return model.historical_accuracy + (Math.random() - 0.5) * 0.2;
    }

    updateAlerts() {
        // Clear expired alerts
        this.clearExpiredAlerts();
        
        // Check for new alerts
        this.checkIndicatorAlerts();
        this.checkPredictionAlerts();
        this.checkCompositeRiskAlerts();
    }

    clearExpiredAlerts() {
        const cutoffTime = Date.now() - 300000; // 5 minutes
        
        for (const [alertId, alert] of this.state.alerts) {
            if (alert.timestamp < cutoffTime && alert.status !== 'active') {
                this.state.alerts.delete(alertId);
            }
        }
    }

    checkIndicatorAlerts() {
        for (const [indicatorId, indicator] of this.state.indicators) {
            if (indicator.current_value > this.config.warningThreshold) {
                this.createAlert('indicator_warning', {
                    indicator: indicatorId,
                    value: indicator.current_value,
                    threshold: this.config.warningThreshold,
                    trend: indicator.trend
                });
            }
            
            if (indicator.current_value > this.config.alertThreshold) {
                this.createAlert('indicator_alert', {
                    indicator: indicatorId,
                    value: indicator.current_value,
                    threshold: this.config.alertThreshold,
                    trend: indicator.trend
                });
            }
        }
    }

    checkPredictionAlerts() {
        for (const [modelId, model] of this.state.predictions) {
            if (model.current_probability > this.config.warningThreshold) {
                this.createAlert('crisis_prediction', {
                    crisis_type: model.target,
                    probability: model.current_probability,
                    confidence: model.confidence,
                    horizon: model.prediction_horizon
                });
            }
        }
    }

    checkCompositeRiskAlerts() {
        const compositeRisk = this.state.riskScores.get('composite');
        if (compositeRisk && compositeRisk.score > this.config.alertThreshold) {
            this.createAlert('composite_risk_alert', {
                risk_score: compositeRisk.score,
                risk_level: compositeRisk.level.level,
                trend: compositeRisk.trend,
                top_contributors: compositeRisk.contributors.slice(0, 3)
            });
        }
    }

    createAlert(alertType, data) {
        const alertId = `${alertType}_${Date.now()}`;
        
        const alert = {
            id: alertId,
            type: alertType,
            severity: this.determineAlertSeverity(alertType, data),
            timestamp: Date.now(),
            tick: this.state.currentTick,
            data: data,
            status: 'active',
            acknowledged: false,
            escalated: false
        };
        
        this.state.alerts.set(alertId, alert);
        
        // Create early warning if applicable
        if (alert.severity >= 3) {
            this.createEarlyWarning(alert);
        }
        
        logger.warn('Crisis alert triggered', {
            type: alertType,
            severity: alert.severity,
            data: data
        });
        
        this.emit('crisis_alert', alert);
    }

    determineAlertSeverity(alertType, data) {
        switch (alertType) {
            case 'indicator_warning':
                return data.value > 0.8 ? 3 : 2;
            case 'indicator_alert':
                return data.value > 0.9 ? 4 : 3;
            case 'crisis_prediction':
                return data.probability > 0.9 ? 4 : 3;
            case 'composite_risk_alert':
                return data.risk_score > 0.9 ? 5 : 4;
            default:
                return 1;
        }
    }

    createEarlyWarning(alert) {
        const warningId = `warning_${alert.id}`;
        
        const warning = {
            id: warningId,
            source_alert: alert.id,
            warning_type: this.mapAlertToWarningType(alert.type),
            estimated_time_to_crisis: this.estimateTimeToCrisis(alert),
            recommended_actions: this.generateRecommendedActions(alert),
            confidence_level: this.calculateWarningConfidence(alert),
            timestamp: Date.now(),
            status: 'active'
        };
        
        this.state.earlyWarnings.set(warningId, warning);
        
        this.emit('early_warning', warning);
    }

    mapAlertToWarningType(alertType) {
        const mapping = {
            indicator_warning: 'system_stress',
            indicator_alert: 'imminent_crisis',
            crisis_prediction: 'predicted_crisis',
            composite_risk_alert: 'systemic_crisis'
        };
        
        return mapping[alertType] || 'general_warning';
    }

    estimateTimeToCrisis(alert) {
        // Simplified time estimation based on alert type and severity
        let baseTicks = this.config.predictionHorizon;
        
        if (alert.severity >= 4) baseTicks /= 2;
        if (alert.severity >= 5) baseTicks /= 2;
        
        // Adjust based on trends
        if (alert.data.trend && alert.data.trend > 0.1) {
            baseTicks *= 0.7; // Crisis approaching faster
        }
        
        return Math.max(1, Math.floor(baseTicks));
    }

    generateRecommendedActions(alert) {
        const actions = [];
        
        switch (alert.type) {
            case 'indicator_warning':
                actions.push('Monitor indicator closely');
                actions.push('Review underlying causes');
                break;
            case 'crisis_prediction':
                actions.push('Prepare intervention measures');
                actions.push('Alert relevant authorities');
                actions.push('Increase monitoring frequency');
                break;
            case 'composite_risk_alert':
                actions.push('Activate crisis management protocol');
                actions.push('Consider emergency interventions');
                actions.push('Coordinate with all agencies');
                break;
        }
        
        return actions;
    }

    calculateWarningConfidence(alert) {
        // Base confidence on alert data
        let confidence = 0.7;
        
        if (alert.data.confidence) {
            confidence = alert.data.confidence;
        }
        
        // Adjust based on alert severity
        if (alert.severity >= 4) confidence += 0.1;
        
        return Math.max(0.1, Math.min(1, confidence));
    }

    validatePredictions() {
        // Check if any predictions should be validated against actual outcomes
        for (const [modelId, model] of this.state.predictions) {
            this.checkPredictionOutcomes(model);
        }
    }

    checkPredictionOutcomes(model) {
        // Check if predicted crises actually occurred
        const activeCrises = this.crisisEngine.getCrisisStatus().activeCrises || [];
        
        for (const prediction of model.recent_predictions.slice(-10)) {
            if (this.state.currentTick - prediction.tick >= prediction.prediction_horizon) {
                const actualCrisis = activeCrises.some(crisis => 
                    crisis.type.includes(model.target) || 
                    this.mapCrisisTypeToTarget(crisis.type) === model.target
                );
                
                this.recordPredictionOutcome(model, prediction, actualCrisis);
            }
        }
    }

    mapCrisisTypeToTarget(crisisType) {
        const mapping = {
            bank_run: 'bank_run',
            bubble_burst: 'bubble',
            supply_shock: 'supply_shock',
            currency_crisis: 'currency_crisis',
            debt_cascade: 'debt_crisis'
        };
        
        return mapping[crisisType] || null;
    }

    recordPredictionOutcome(model, prediction, actualOutcome) {
        const predicted = prediction.probability > 0.5;
        
        if (predicted && actualOutcome) {
            model.true_positives++;
        } else if (predicted && !actualOutcome) {
            model.false_positives++;
        } else if (!predicted && actualOutcome) {
            model.false_negatives++;
        } else {
            model.true_negatives++;
        }
        
        // Update model accuracy
        const totalPredictions = model.true_positives + model.false_positives + 
                               model.false_negatives + model.true_negatives;
        
        if (totalPredictions > 0) {
            model.historical_accuracy = (model.true_positives + model.true_negatives) / totalPredictions;
        }
    }

    recordHistoricalData() {
        const snapshot = {
            timestamp: Date.now(),
            tick: this.state.currentTick,
            composite_risk: this.state.riskScores.get('composite')?.score || 0,
            indicators: {},
            predictions: {},
            active_crises: this.crisisEngine.getCrisisStatus().activeCrises?.length || 0
        };
        
        // Record indicator values
        for (const [indicatorId, indicator] of this.state.indicators) {
            snapshot.indicators[indicatorId] = indicator.current_value;
        }
        
        // Record prediction probabilities
        for (const [modelId, model] of this.state.predictions) {
            snapshot.predictions[modelId] = model.current_probability;
        }
        
        this.state.historicalData.push(snapshot);
        
        // Keep limited history
        if (this.state.historicalData.length > this.config.historicalDepth) {
            this.state.historicalData.shift();
        }
    }

    // Public API
    getCrisisIndicatorsStatus() {
        return {
            indicators: Object.fromEntries(this.state.indicators),
            predictions: Object.fromEntries(this.state.predictions),
            riskScores: Object.fromEntries(this.state.riskScores),
            activeAlerts: Array.from(this.state.alerts.values()).filter(a => a.status === 'active'),
            earlyWarnings: Array.from(this.state.earlyWarnings.values()).filter(w => w.status === 'active'),
            currentTick: this.state.currentTick,
            systemHealth: this.calculateSystemHealth()
        };
    }

    calculateSystemHealth() {
        const compositeRisk = this.state.riskScores.get('composite');
        if (!compositeRisk) return { score: 0.7, status: 'unknown' };
        
        const healthScore = 1 - compositeRisk.score;
        let status = 'healthy';
        
        if (healthScore < 0.3) status = 'critical';
        else if (healthScore < 0.5) status = 'poor';
        else if (healthScore < 0.7) status = 'fair';
        else if (healthScore < 0.9) status = 'good';
        
        return {
            score: healthScore,
            status: status,
            trend: compositeRisk.trend,
            risk_level: compositeRisk.level.level
        };
    }

    getDashboard() {
        const compositeRisk = this.state.riskScores.get('composite');
        const activeAlerts = Array.from(this.state.alerts.values()).filter(a => a.status === 'active');
        const highProbabilityPredictions = Array.from(this.state.predictions.values())
            .filter(p => p.current_probability > 0.5);
        
        return {
            systemHealth: this.calculateSystemHealth(),
            riskLevel: compositeRisk?.level || { level: 'unknown' },
            topRisks: compositeRisk?.contributors || [],
            criticalAlerts: activeAlerts.filter(a => a.severity >= 4),
            immediatThreats: highProbabilityPredictions,
            trendAnalysis: this.getTrendAnalysis(),
            recommendedActions: this.getRecommendedActions()
        };
    }

    getTrendAnalysis() {
        if (this.state.historicalData.length < 10) return null;
        
        const recent = this.state.historicalData.slice(-10);
        const trends = {};
        
        // Analyze trends for each indicator
        for (const indicatorId of this.state.indicators.keys()) {
            const values = recent.map(d => d.indicators[indicatorId] || 0);
            trends[indicatorId] = this.calculateTrendDirection(values);
        }
        
        return trends;
    }

    calculateTrendDirection(values) {
        if (values.length < 3) return 'stable';
        
        const recent = values.slice(-3);
        const older = values.slice(-6, -3);
        
        const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
        
        const change = recentAvg - olderAvg;
        
        if (change > 0.05) return 'rising';
        if (change < -0.05) return 'falling';
        return 'stable';
    }

    getRecommendedActions() {
        const actions = [];
        const compositeRisk = this.state.riskScores.get('composite');
        
        if (compositeRisk && compositeRisk.score > 0.7) {
            actions.push('Consider immediate intervention measures');
            actions.push('Alert senior decision makers');
            actions.push('Increase monitoring to real-time');
        }
        
        const highRiskIndicators = Array.from(this.state.indicators.values())
            .filter(i => i.current_value > 0.7);
        
        for (const indicator of highRiskIndicators) {
            actions.push(`Address ${indicator.name} concerns`);
        }
        
        return actions.slice(0, 5); // Top 5 actions
    }

    // Manual controls for testing
    setIndicatorValue(indicatorId, value) {
        const indicator = this.state.indicators.get(indicatorId);
        if (indicator) {
            indicator.current_value = Math.max(0, Math.min(1, value));
            return true;
        }
        return false;
    }

    acknowledgeAlert(alertId) {
        const alert = this.state.alerts.get(alertId);
        if (alert) {
            alert.acknowledged = true;
            alert.status = 'acknowledged';
            return true;
        }
        return false;
    }

    getModelAccuracy() {
        const accuracy = {};
        
        for (const [modelId, model] of this.state.predictions) {
            accuracy[modelId] = {
                historical_accuracy: model.historical_accuracy,
                true_positives: model.true_positives,
                false_positives: model.false_positives,
                false_negatives: model.false_negatives,
                true_negatives: model.true_negatives
            };
        }
        
        return accuracy;
    }
}

module.exports = CrisisIndicatorsEngine;
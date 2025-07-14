/**
 * PHASE 3 CURRENCY CRISIS ENGINE
 * Advanced crisis detection and intervention mechanisms
 */

const Decimal = require('decimal.js');
const EventEmitter = require('eventemitter3');

class CurrencyCrisisEngine extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.crisisIndicators = new Map();
        this.activeAlerts = new Map();
        this.interventionProtocols = new Map();
        this.contagionModels = new Map();
        this.stabilizationMechanisms = new Map();
        
        this.initialize();
    }

    initialize() {
        this.initializeCrisisIndicators();
        this.initializeInterventionProtocols();
        this.initializeContagionModels();
        this.setupMonitoring();
    }

    initializeCrisisIndicators() {
        const currencies = [...this.config.majorCurrencies, ...this.config.emergingCurrencies];
        
        currencies.forEach(currency => {
            this.crisisIndicators.set(currency, {
                currency,
                
                // Early warning indicators
                exchangeRateVolatility: { current: 0.05, threshold: 0.15, weight: 0.25 },
                reserveDepletion: { current: 0.1, threshold: 0.3, weight: 0.3 },
                currentAccountDeficit: { current: 0.03, threshold: 0.08, weight: 0.2 },
                inflationRate: { current: 0.03, threshold: 0.1, weight: 0.15 },
                politicalStability: { current: 0.8, threshold: 0.5, weight: 0.1 },
                
                // Crisis levels
                riskLevel: 'low', // low, medium, high, critical
                crisisScore: 0.0,
                lastAssessment: Date.now(),
                
                // Historical patterns
                previousCrises: [],
                recoveryTime: null,
                supportLevels: [],
                
                isMonitored: true
            });
        });
    }

    initializeInterventionProtocols() {
        const protocols = [
            {
                name: 'Interest Rate Defense',
                type: 'monetary',
                triggerThreshold: 0.6,
                effectiveness: 0.7,
                cost: 'high',
                sideEffects: ['growth_slowdown', 'banking_stress']
            },
            {
                name: 'FX Intervention',
                type: 'reserve_based',
                triggerThreshold: 0.5,
                effectiveness: 0.6,
                cost: 'medium',
                sideEffects: ['reserve_depletion']
            },
            {
                name: 'Capital Controls',
                type: 'regulatory',
                triggerThreshold: 0.8,
                effectiveness: 0.8,
                cost: 'low',
                sideEffects: ['market_access_reduction', 'reputation_damage']
            },
            {
                name: 'IMF Support',
                type: 'multilateral',
                triggerThreshold: 0.9,
                effectiveness: 0.9,
                cost: 'very_high',
                sideEffects: ['conditionality', 'sovereignty_constraints']
            }
        ];

        protocols.forEach(protocol => {
            this.interventionProtocols.set(protocol.name, {
                ...protocol,
                isAvailable: true,
                lastUsed: null,
                successRate: 0.75,
                implementationTime: this.getImplementationTime(protocol.type)
            });
        });
    }

    initializeContagionModels() {
        const regions = {
            'developed': this.config.majorCurrencies,
            'emerging_asia': ['CNY', 'KRW', 'INR'],
            'emerging_americas': ['BRL', 'MXN'],
            'emerging_europe': ['RUB'],
            'africa': ['ZAR']
        };

        for (const [region, currencies] of Object.entries(regions)) {
            this.contagionModels.set(region, {
                region,
                currencies,
                contagionMatrix: this.buildContagionMatrix(currencies),
                vulnerabilityScore: this.calculateRegionalVulnerability(currencies),
                contagionChannels: ['trade', 'financial', 'confidence'],
                spilloverCoefficients: this.calculateSpilloverCoefficients(currencies),
                lastUpdate: Date.now()
            });
        }
    }

    setupMonitoring() {
        // Real-time crisis monitoring
        setInterval(() => {
            this.monitorCrisisIndicators();
        }, 5000); // Every 5 seconds

        // Daily comprehensive assessment
        setInterval(() => {
            this.comprehensiveRiskAssessment();
        }, 24 * 60 * 60 * 1000);

        // Contagion analysis
        setInterval(() => {
            this.analyzeContagionRisk();
        }, 60000); // Every minute
    }

    detectCrises() {
        const detectedCrises = [];
        
        for (const [currency, indicators] of this.crisisIndicators) {
            const crisisScore = this.calculateCrisisScore(indicators);
            indicators.crisisScore = crisisScore;
            
            const riskLevel = this.determineRiskLevel(crisisScore);
            
            if (riskLevel !== indicators.riskLevel) {
                indicators.riskLevel = riskLevel;
                this.handleRiskLevelChange(currency, riskLevel);
            }
            
            if (crisisScore > 0.8) {
                detectedCrises.push({
                    currency,
                    score: crisisScore,
                    level: riskLevel,
                    timestamp: Date.now()
                });
            }
            
            indicators.lastAssessment = Date.now();
        }
        
        return detectedCrises;
    }

    calculateCrisisScore(indicators) {
        let score = 0;
        
        // Weighted sum of normalized indicators
        for (const [key, indicator] of Object.entries(indicators)) {
            if (typeof indicator === 'object' && indicator.current !== undefined) {
                const normalized = this.normalizeIndicator(indicator);
                score += normalized * indicator.weight;
            }
        }
        
        return Math.min(1.0, Math.max(0.0, score));
    }

    normalizeIndicator(indicator) {
        if (indicator.current > indicator.threshold) {
            return Math.min(1.0, indicator.current / indicator.threshold);
        }
        return indicator.current / indicator.threshold;
    }

    determineRiskLevel(score) {
        if (score >= 0.9) return 'critical';
        if (score >= 0.7) return 'high';
        if (score >= 0.4) return 'medium';
        return 'low';
    }

    handleRiskLevelChange(currency, newLevel) {
        console.log(`🚨 ${currency} crisis risk level changed to: ${newLevel}`);
        
        // Trigger appropriate responses
        if (newLevel === 'critical') {
            this.triggerEmergencyProtocols(currency);
        } else if (newLevel === 'high') {
            this.activatePreventiveMeasures(currency);
        }
        
        this.emit('riskLevelChange', { currency, level: newLevel, timestamp: Date.now() });
    }

    triggerEmergencyProtocols(currency) {
        const availableProtocols = this.getAvailableProtocols(currency);
        
        // Implement emergency measures in order of effectiveness
        availableProtocols
            .sort((a, b) => b.effectiveness - a.effectiveness)
            .forEach(protocol => {
                this.implementProtocol(currency, protocol);
            });
    }

    activatePreventiveMeasures(currency) {
        // Implement less severe preventive measures
        const measures = [
            { name: 'Enhanced Monitoring', severity: 'low' },
            { name: 'Market Communication', severity: 'low' },
            { name: 'Contingency Planning', severity: 'medium' }
        ];
        
        measures.forEach(measure => {
            this.implementMeasure(currency, measure);
        });
    }

    implementProtocol(currency, protocol) {
        const implementation = {
            id: `IMPL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            currency,
            protocol: protocol.name,
            timestamp: Date.now(),
            status: 'active',
            effectiveness: protocol.effectiveness,
            estimatedDuration: protocol.implementationTime,
            cost: protocol.cost
        };
        
        this.activeAlerts.set(implementation.id, implementation);
        
        console.log(`🛡️ Implementing ${protocol.name} for ${currency}`);
        this.emit('interventionActivated', implementation);
    }

    buildContagionMatrix(currencies) {
        const matrix = {};
        
        currencies.forEach(from => {
            matrix[from] = {};
            currencies.forEach(to => {
                if (from !== to) {
                    matrix[from][to] = this.calculateContagionCoefficient(from, to);
                }
            });
        });
        
        return matrix;
    }

    calculateContagionCoefficient(from, to) {
        // Simplified contagion coefficient based on economic links
        const tradeLinks = this.getTradeLinks(from, to);
        const financialLinks = this.getFinancialLinks(from, to);
        const regionalProximity = this.getRegionalProximity(from, to);
        
        return (tradeLinks * 0.4 + financialLinks * 0.4 + regionalProximity * 0.2);
    }

    analyzeContagionRisk() {
        for (const [region, model] of this.contagionModels) {
            const vulnerableCurrencies = model.currencies.filter(currency => {
                const indicators = this.crisisIndicators.get(currency);
                return indicators && indicators.crisisScore > 0.5;
            });
            
            if (vulnerableCurrencies.length > 0) {
                this.simulateContagion(region, vulnerableCurrencies);
            }
        }
    }

    simulateContagion(region, vulnerableCurrencies) {
        const model = this.contagionModels.get(region);
        const contagionSimulation = {
            region,
            epicenter: vulnerableCurrencies[0],
            affectedCurrencies: [],
            severityLevels: new Map(),
            timeline: [],
            timestamp: Date.now()
        };
        
        // Simulate contagion spread
        vulnerableCurrencies.forEach(currency => {
            const spillovers = this.calculateSpillovers(currency, model);
            contagionSimulation.affectedCurrencies.push(...spillovers);
        });
        
        if (contagionSimulation.affectedCurrencies.length > 1) {
            console.log(`🦠 Contagion risk detected in ${region}`);
            this.emit('contagionAlert', contagionSimulation);
        }
    }

    calculateSpillovers(currency, model) {
        const spillovers = [];
        const contagionMatrix = model.contagionMatrix[currency] || {};
        
        for (const [target, coefficient] of Object.entries(contagionMatrix)) {
            if (coefficient > 0.3) { // Significant contagion risk
                spillovers.push({
                    currency: target,
                    coefficient,
                    estimatedImpact: coefficient * 0.8 // Simplified impact calculation
                });
            }
        }
        
        return spillovers;
    }

    // Utility methods
    getImplementationTime(type) {
        const times = {
            'monetary': 1, // 1 day
            'reserve_based': 0.5, // 12 hours
            'regulatory': 7, // 1 week
            'multilateral': 30 // 1 month
        };
        return times[type] || 1;
    }

    getAvailableProtocols(currency) {
        return Array.from(this.interventionProtocols.values())
            .filter(protocol => protocol.isAvailable);
    }

    calculateRegionalVulnerability(currencies) {
        let totalVulnerability = 0;
        
        currencies.forEach(currency => {
            const indicators = this.crisisIndicators.get(currency);
            if (indicators) {
                totalVulnerability += indicators.crisisScore;
            }
        });
        
        return currencies.length > 0 ? totalVulnerability / currencies.length : 0;
    }

    calculateSpilloverCoefficients(currencies) {
        const coefficients = {};
        
        currencies.forEach(currency => {
            coefficients[currency] = Math.random() * 0.5 + 0.2; // 0.2 to 0.7
        });
        
        return coefficients;
    }

    getTradeLinks(from, to) {
        // Simplified trade links calculation
        return Math.random() * 0.6;
    }

    getFinancialLinks(from, to) {
        // Simplified financial links calculation
        return Math.random() * 0.5;
    }

    getRegionalProximity(from, to) {
        // Simplified regional proximity
        return Math.random() * 0.3;
    }

    implementMeasure(currency, measure) {
        console.log(`📋 Implementing ${measure.name} for ${currency} (severity: ${measure.severity})`);
    }

    monitorCrisisIndicators() {
        // Update crisis indicators with real-time data
        for (const [currency, indicators] of this.crisisIndicators) {
            this.updateIndicators(currency, indicators);
        }
    }

    updateIndicators(currency, indicators) {
        // Simulate indicator updates (would be real data in production)
        indicators.exchangeRateVolatility.current += (Math.random() - 0.5) * 0.01;
        indicators.reserveDepletion.current += (Math.random() - 0.5) * 0.005;
        indicators.currentAccountDeficit.current += (Math.random() - 0.5) * 0.002;
        indicators.inflationRate.current += (Math.random() - 0.5) * 0.001;
        indicators.politicalStability.current += (Math.random() - 0.5) * 0.02;
        
        // Ensure bounds
        Object.values(indicators).forEach(indicator => {
            if (typeof indicator === 'object' && indicator.current !== undefined) {
                indicator.current = Math.max(0, indicator.current);
            }
        });
    }

    comprehensiveRiskAssessment() {
        console.log('📊 Conducting comprehensive crisis risk assessment...');
        
        // Generate daily risk report
        const riskReport = {
            timestamp: Date.now(),
            overallRisk: this.calculateOverallRisk(),
            currencyRisks: this.getCurrencyRiskSummary(),
            contagionRisks: this.getContagionRiskSummary(),
            recommendedActions: this.generateRecommendations()
        };
        
        this.emit('dailyRiskReport', riskReport);
    }

    calculateOverallRisk() {
        let totalRisk = 0;
        let count = 0;
        
        for (const [, indicators] of this.crisisIndicators) {
            totalRisk += indicators.crisisScore;
            count++;
        }
        
        return count > 0 ? totalRisk / count : 0;
    }

    getCurrencyRiskSummary() {
        const summary = {};
        
        for (const [currency, indicators] of this.crisisIndicators) {
            summary[currency] = {
                score: indicators.crisisScore,
                level: indicators.riskLevel,
                keyRisks: this.identifyKeyRisks(indicators)
            };
        }
        
        return summary;
    }

    getContagionRiskSummary() {
        const summary = {};
        
        for (const [region, model] of this.contagionModels) {
            summary[region] = {
                vulnerability: model.vulnerabilityScore,
                riskCurrencies: model.currencies.filter(currency => {
                    const indicators = this.crisisIndicators.get(currency);
                    return indicators && indicators.crisisScore > 0.5;
                })
            };
        }
        
        return summary;
    }

    identifyKeyRisks(indicators) {
        const risks = [];
        
        if (indicators.exchangeRateVolatility.current > indicators.exchangeRateVolatility.threshold) {
            risks.push('high_volatility');
        }
        if (indicators.reserveDepletion.current > indicators.reserveDepletion.threshold) {
            risks.push('reserve_pressure');
        }
        if (indicators.currentAccountDeficit.current > indicators.currentAccountDeficit.threshold) {
            risks.push('external_imbalance');
        }
        
        return risks;
    }

    generateRecommendations() {
        const recommendations = [];
        
        for (const [currency, indicators] of this.crisisIndicators) {
            if (indicators.riskLevel === 'high' || indicators.riskLevel === 'critical') {
                recommendations.push({
                    currency,
                    action: 'immediate_attention',
                    priority: indicators.riskLevel === 'critical' ? 'urgent' : 'high'
                });
            }
        }
        
        return recommendations;
    }

    // Public API
    getCrisisIndicators(currency) {
        return this.crisisIndicators.get(currency);
    }

    getAllCrisisIndicators() {
        return Array.from(this.crisisIndicators.values());
    }

    getActiveAlerts() {
        return Array.from(this.activeAlerts.values());
    }

    getContagionModels() {
        return Array.from(this.contagionModels.values());
    }

    getHealth() {
        const highRiskCurrencies = Array.from(this.crisisIndicators.values())
            .filter(indicators => indicators.riskLevel === 'high' || indicators.riskLevel === 'critical');
        
        return {
            monitoredCurrencies: this.crisisIndicators.size,
            highRiskCurrencies: highRiskCurrencies.length,
            activeAlerts: this.activeAlerts.size,
            overallRisk: this.calculateOverallRisk(),
            lastUpdate: Date.now()
        };
    }
}

module.exports = CurrencyCrisisEngine;
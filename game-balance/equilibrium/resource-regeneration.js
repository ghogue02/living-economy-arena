/**
 * Resource Regeneration System
 * Maintains economic balance through dynamic resource management and scarcity controls
 */

const Decimal = require('decimal.js');
const EventEmitter = require('eventemitter3');

class ResourceRegenerationSystem extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Base regeneration rates (per hour)
            baseRegenerationRates: config.baseRegenerationRates || {
                food: 0.05,      // 5% per hour
                energy: 0.03,    // 3% per hour
                materials: 0.04, // 4% per hour
                technology: 0.02, // 2% per hour
                services: 0.06    // 6% per hour
            },
            
            // Scarcity management
            optimalScarcityLevels: config.optimalScarcityLevels || {
                food: 0.3,       // 30% scarcity for food drives pricing
                energy: 0.4,     // 40% scarcity for energy
                materials: 0.35, // 35% scarcity for materials
                technology: 0.2, // 20% scarcity for technology
                services: 0.1    // 10% scarcity for services
            },
            
            // Dynamic adjustment parameters
            demandSensitivity: config.demandSensitivity || 0.5,
            priceSensitivity: config.priceSensitivity || 0.3,
            seasonalVariation: config.seasonalVariation || 0.2,
            eventImpactMultiplier: config.eventImpactMultiplier || 2.0,
            
            // Resource pool limits
            maxResourcePool: config.maxResourcePool || 10000000, // 10M units
            minResourcePool: config.minResourcePool || 100000,   // 100K units
            emergencyThreshold: config.emergencyThreshold || 0.1, // 10% of max
            
            // Market response parameters
            priceElasticity: config.priceElasticity || {
                food: 0.8,       // Inelastic
                energy: 0.6,     // Inelastic
                materials: 1.2,  // Elastic
                technology: 1.5, // Very elastic
                services: 1.3    // Elastic
            },
            
            // Environmental factors
            environmentalDecay: config.environmentalDecay || 0.02, // 2% decay from overuse
            sustainabilityBonus: config.sustainabilityBonus || 0.1, // 10% bonus for sustainable practices
            
            ...config
        };

        this.state = {
            resources: new Map(),
            regenerationHistory: new Map(),
            scarcityLevels: new Map(),
            demandPatterns: new Map(),
            environmentalHealth: new Map(),
            seasonalModifiers: new Map(),
            eventModifiers: new Map()
        };

        this.economicIndicators = {
            totalConsumption: new Map(),
            totalProduction: new Map(),
            priceHistory: new Map(),
            supplyDemandRatio: new Map()
        };

        this.initializeResources();
        this.startRegenerationCycle();
    }

    initializeResources() {
        const resourceTypes = Object.keys(this.config.baseRegenerationRates);
        
        resourceTypes.forEach(resourceType => {
            this.state.resources.set(resourceType, {
                id: resourceType,
                currentPool: new Decimal(5000000), // 5M starting pool
                maxPool: new Decimal(this.config.maxResourcePool),
                minPool: new Decimal(this.config.minResourcePool),
                baseRegenerationRate: this.config.baseRegenerationRates[resourceType],
                currentRegenerationRate: this.config.baseRegenerationRates[resourceType],
                consumption: new Decimal(0),
                production: new Decimal(0),
                scarcity: this.config.optimalScarcityLevels[resourceType],
                lastUpdate: Date.now(),
                environmentalImpact: 0,
                sustainabilityScore: 1.0
            });

            this.state.regenerationHistory.set(resourceType, []);
            this.state.scarcityLevels.set(resourceType, []);
            this.state.demandPatterns.set(resourceType, []);
            this.state.environmentalHealth.set(resourceType, 1.0);
            this.state.seasonalModifiers.set(resourceType, 1.0);
            this.state.eventModifiers.set(resourceType, 1.0);

            this.economicIndicators.totalConsumption.set(resourceType, new Decimal(0));
            this.economicIndicators.totalProduction.set(resourceType, new Decimal(0));
            this.economicIndicators.priceHistory.set(resourceType, []);
            this.economicIndicators.supplyDemandRatio.set(resourceType, 1.0);
        });
    }

    startRegenerationCycle() {
        // Run regeneration every minute
        this.regenerationInterval = setInterval(() => {
            this.executeRegenerationCycle();
        }, 60000);

        // Run deep analysis every hour
        this.analysisInterval = setInterval(() => {
            this.executeDeepAnalysis();
        }, 3600000);
    }

    executeRegenerationCycle() {
        for (const [resourceType, resource] of this.state.resources) {
            // Calculate dynamic regeneration rate
            const dynamicRate = this.calculateDynamicRegenerationRate(resourceType);
            
            // Apply regeneration
            const regenerationAmount = this.applyRegeneration(resourceType, dynamicRate);
            
            // Update scarcity levels
            this.updateScarcityLevel(resourceType);
            
            // Update environmental factors
            this.updateEnvironmentalFactors(resourceType);
            
            // Record regeneration history
            this.recordRegenerationHistory(resourceType, regenerationAmount, dynamicRate);
        }

        this.emit('regeneration_cycle_complete', {
            timestamp: Date.now(),
            resourceStates: this.getResourceStates()
        });
    }

    calculateDynamicRegenerationRate(resourceType) {
        const resource = this.state.resources.get(resourceType);
        const baseRate = resource.baseRegenerationRate;
        
        // Scarcity adjustment
        const scarcityAdjustment = this.calculateScarcityAdjustment(resourceType);
        
        // Demand pressure adjustment
        const demandAdjustment = this.calculateDemandAdjustment(resourceType);
        
        // Price pressure adjustment
        const priceAdjustment = this.calculatePriceAdjustment(resourceType);
        
        // Environmental health modifier
        const environmentalModifier = this.state.environmentalHealth.get(resourceType);
        
        // Seasonal modifier
        const seasonalModifier = this.state.seasonalModifiers.get(resourceType);
        
        // Event modifier
        const eventModifier = this.state.eventModifiers.get(resourceType);
        
        // Sustainability bonus
        const sustainabilityBonus = this.calculateSustainabilityBonus(resourceType);

        const dynamicRate = baseRate * 
            scarcityAdjustment * 
            demandAdjustment * 
            priceAdjustment * 
            environmentalModifier * 
            seasonalModifier * 
            eventModifier * 
            (1 + sustainabilityBonus);

        // Ensure rate stays within reasonable bounds
        const minRate = baseRate * 0.1; // 10% of base rate minimum
        const maxRate = baseRate * 5.0; // 500% of base rate maximum
        
        return Math.max(minRate, Math.min(maxRate, dynamicRate));
    }

    calculateScarcityAdjustment(resourceType) {
        const resource = this.state.resources.get(resourceType);
        const optimalScarcity = this.config.optimalScarcityLevels[resourceType];
        const currentScarcity = resource.scarcity;
        
        // Higher scarcity should increase regeneration rate
        if (currentScarcity > optimalScarcity) {
            const scarcityExcess = (currentScarcity - optimalScarcity) / optimalScarcity;
            return 1 + scarcityExcess * 2; // Up to 200% increase for extreme scarcity
        } else {
            const scarcityDeficit = (optimalScarcity - currentScarcity) / optimalScarcity;
            return 1 - scarcityDeficit * 0.5; // Up to 50% decrease for low scarcity
        }
    }

    calculateDemandAdjustment(resourceType) {
        const demandHistory = this.state.demandPatterns.get(resourceType);
        if (demandHistory.length === 0) return 1.0;

        // Calculate recent demand trend
        const recentDemand = demandHistory.slice(-10); // Last 10 data points
        const averageDemand = recentDemand.reduce((sum, d) => sum + d.demand, 0) / recentDemand.length;
        
        // Compare to historical average
        const historicalAverage = demandHistory.reduce((sum, d) => sum + d.demand, 0) / demandHistory.length;
        
        if (historicalAverage > 0) {
            const demandRatio = averageDemand / historicalAverage;
            return 1 + (demandRatio - 1) * this.config.demandSensitivity;
        }

        return 1.0;
    }

    calculatePriceAdjustment(resourceType) {
        const priceHistory = this.economicIndicators.priceHistory.get(resourceType);
        if (priceHistory.length === 0) return 1.0;

        // Calculate price trend
        const recentPrices = priceHistory.slice(-5); // Last 5 price points
        if (recentPrices.length < 2) return 1.0;

        const priceChange = recentPrices[recentPrices.length - 1].price - recentPrices[0].price;
        const basePriceHistory = priceHistory.slice(0, -5);
        const basePrice = basePriceHistory.length > 0 ? 
            basePriceHistory.reduce((sum, p) => sum + p.price, 0) / basePriceHistory.length :
            recentPrices[0].price;

        if (basePrice > 0) {
            const priceChangePercentage = priceChange / basePrice;
            return 1 + priceChangePercentage * this.config.priceSensitivity;
        }

        return 1.0;
    }

    calculateSustainabilityBonus(resourceType) {
        const resource = this.state.resources.get(resourceType);
        const sustainabilityScore = resource.sustainabilityScore;
        
        // Reward sustainable practices with regeneration bonus
        return (sustainabilityScore - 1) * this.config.sustainabilityBonus;
    }

    applyRegeneration(resourceType, regenerationRate) {
        const resource = this.state.resources.get(resourceType);
        
        // Calculate regeneration amount (rate is per hour, adjust for 1-minute intervals)
        const regenerationAmount = resource.currentPool.mul(regenerationRate / 60);
        
        // Apply regeneration
        const newPool = resource.currentPool.plus(regenerationAmount);
        resource.currentPool = Decimal.min(newPool, resource.maxPool);
        resource.currentRegenerationRate = regenerationRate;
        resource.lastUpdate = Date.now();

        // Track production
        this.economicIndicators.totalProduction.set(resourceType, 
            this.economicIndicators.totalProduction.get(resourceType).plus(regenerationAmount));

        return regenerationAmount;
    }

    updateScarcityLevel(resourceType) {
        const resource = this.state.resources.get(resourceType);
        
        // Calculate scarcity as inverse of availability
        const availabilityRatio = resource.currentPool.div(resource.maxPool);
        const scarcity = 1 - availabilityRatio.toNumber();
        
        resource.scarcity = scarcity;
        
        // Record scarcity history
        const scarcityHistory = this.state.scarcityLevels.get(resourceType);
        scarcityHistory.push({
            timestamp: Date.now(),
            scarcity,
            availabilityRatio: availabilityRatio.toNumber()
        });

        // Keep only recent history
        if (scarcityHistory.length > 168) { // 7 days of hourly data
            scarcityHistory.shift();
        }
    }

    updateEnvironmentalFactors(resourceType) {
        const resource = this.state.resources.get(resourceType);
        const consumption = this.economicIndicators.totalConsumption.get(resourceType);
        const production = this.economicIndicators.totalProduction.get(resourceType);
        
        // Calculate environmental impact based on consumption vs production ratio
        if (production.gt(0)) {
            const consumptionRatio = consumption.div(production).toNumber();
            
            // High consumption relative to production degrades environment
            if (consumptionRatio > 1.5) {
                const environmentalDamage = (consumptionRatio - 1.5) * this.config.environmentalDecay;
                const currentHealth = this.state.environmentalHealth.get(resourceType);
                const newHealth = Math.max(0.1, currentHealth - environmentalDamage);
                this.state.environmentalHealth.set(resourceType, newHealth);
                resource.environmentalImpact = consumptionRatio;
            } else if (consumptionRatio < 1.0) {
                // Sustainable consumption helps recovery
                const recovery = (1.0 - consumptionRatio) * 0.01; // Slow recovery
                const currentHealth = this.state.environmentalHealth.get(resourceType);
                const newHealth = Math.min(1.0, currentHealth + recovery);
                this.state.environmentalHealth.set(resourceType, newHealth);
                resource.environmentalImpact = consumptionRatio;
            }
            
            // Update sustainability score
            resource.sustainabilityScore = this.state.environmentalHealth.get(resourceType);
        }
    }

    recordRegenerationHistory(resourceType, regenerationAmount, regenerationRate) {
        const history = this.state.regenerationHistory.get(resourceType);
        
        history.push({
            timestamp: Date.now(),
            regenerationAmount: regenerationAmount.toNumber(),
            regenerationRate,
            currentPool: this.state.resources.get(resourceType).currentPool.toNumber(),
            scarcity: this.state.resources.get(resourceType).scarcity,
            environmentalHealth: this.state.environmentalHealth.get(resourceType)
        });

        // Keep only recent history
        if (history.length > 1440) { // 24 hours of minute data
            history.shift();
        }
    }

    // Record resource consumption
    recordConsumption(resourceType, amount, agentId) {
        const resource = this.state.resources.get(resourceType);
        if (!resource) return false;

        const consumptionAmount = new Decimal(amount);
        
        // Check if enough resources available
        if (resource.currentPool.gte(consumptionAmount)) {
            resource.currentPool = resource.currentPool.minus(consumptionAmount);
            resource.consumption = resource.consumption.plus(consumptionAmount);
            
            // Track total consumption
            this.economicIndicators.totalConsumption.set(resourceType,
                this.economicIndicators.totalConsumption.get(resourceType).plus(consumptionAmount));

            // Record demand pattern
            const demandHistory = this.state.demandPatterns.get(resourceType);
            const currentHour = Math.floor(Date.now() / 3600000);
            const existingEntry = demandHistory.find(d => d.hour === currentHour);
            
            if (existingEntry) {
                existingEntry.demand += consumptionAmount.toNumber();
            } else {
                demandHistory.push({
                    hour: currentHour,
                    demand: consumptionAmount.toNumber(),
                    agentCount: 1
                });
            }

            // Keep only recent demand history
            if (demandHistory.length > 168) { // 7 days
                demandHistory.shift();
            }

            this.emit('resource_consumed', {
                resourceType,
                amount: consumptionAmount.toNumber(),
                agentId,
                remainingPool: resource.currentPool.toNumber(),
                scarcity: resource.scarcity
            });

            return true;
        }

        return false; // Insufficient resources
    }

    // Update price information for analysis
    updatePriceData(resourceType, price, volume) {
        const priceHistory = this.economicIndicators.priceHistory.get(resourceType);
        
        priceHistory.push({
            timestamp: Date.now(),
            price,
            volume
        });

        // Keep only recent price history
        if (priceHistory.length > 1000) {
            priceHistory.shift();
        }

        // Update supply-demand ratio
        const resource = this.state.resources.get(resourceType);
        const consumption = this.economicIndicators.totalConsumption.get(resourceType);
        const production = this.economicIndicators.totalProduction.get(resourceType);
        
        if (consumption.gt(0)) {
            const ratio = production.div(consumption).toNumber();
            this.economicIndicators.supplyDemandRatio.set(resourceType, ratio);
        }
    }

    // Apply seasonal modifiers
    applySeasonalModifiers(season, modifiers) {
        for (const [resourceType, modifier] of Object.entries(modifiers)) {
            if (this.state.seasonalModifiers.has(resourceType)) {
                this.state.seasonalModifiers.set(resourceType, modifier);
            }
        }

        this.emit('seasonal_modifiers_applied', { season, modifiers });
    }

    // Apply event-based modifiers
    applyEventModifiers(eventType, modifiers, duration = 3600000) {
        for (const [resourceType, modifier] of Object.entries(modifiers)) {
            if (this.state.eventModifiers.has(resourceType)) {
                const currentModifier = this.state.eventModifiers.get(resourceType);
                const newModifier = currentModifier * modifier;
                this.state.eventModifiers.set(resourceType, newModifier);
            }
        }

        // Reset modifiers after duration
        setTimeout(() => {
            for (const resourceType of Object.keys(modifiers)) {
                this.state.eventModifiers.set(resourceType, 1.0);
            }
        }, duration);

        this.emit('event_modifiers_applied', { eventType, modifiers, duration });
    }

    executeDeepAnalysis() {
        const analysis = {
            timestamp: Date.now(),
            resourceAnalysis: new Map(),
            systemHealth: this.calculateSystemHealth(),
            recommendations: []
        };

        for (const [resourceType, resource] of this.state.resources) {
            const resourceAnalysis = this.analyzeResource(resourceType);
            analysis.resourceAnalysis.set(resourceType, resourceAnalysis);
            
            // Generate recommendations
            const recommendations = this.generateRecommendations(resourceType, resourceAnalysis);
            analysis.recommendations.push(...recommendations);
        }

        this.emit('deep_analysis_complete', analysis);
        return analysis;
    }

    analyzeResource(resourceType) {
        const resource = this.state.resources.get(resourceType);
        const history = this.state.regenerationHistory.get(resourceType);
        const scarcityHistory = this.state.scarcityLevels.get(resourceType);
        const demandHistory = this.state.demandPatterns.get(resourceType);

        return {
            currentState: {
                poolLevel: resource.currentPool.toNumber(),
                poolUtilization: resource.currentPool.div(resource.maxPool).toNumber(),
                scarcity: resource.scarcity,
                regenerationRate: resource.currentRegenerationRate,
                environmentalHealth: this.state.environmentalHealth.get(resourceType),
                sustainabilityScore: resource.sustainabilityScore
            },
            trends: {
                regenerationTrend: this.calculateTrend(history.map(h => h.regenerationRate)),
                scarcityTrend: this.calculateTrend(scarcityHistory.map(s => s.scarcity)),
                demandTrend: this.calculateTrend(demandHistory.map(d => d.demand)),
                environmentalTrend: this.calculateTrend(history.map(h => h.environmentalHealth))
            },
            efficiency: {
                regenerationEfficiency: this.calculateRegenerationEfficiency(resourceType),
                demandFulfillment: this.calculateDemandFulfillment(resourceType),
                priceStability: this.calculatePriceStability(resourceType)
            },
            risks: this.identifyRisks(resourceType)
        };
    }

    calculateTrend(values) {
        if (values.length < 2) return 0;
        
        const recent = values.slice(-10);
        const older = values.slice(-20, -10);
        
        if (older.length === 0) return 0;
        
        const recentAvg = recent.reduce((sum, v) => sum + v, 0) / recent.length;
        const olderAvg = older.reduce((sum, v) => sum + v, 0) / older.length;
        
        return olderAvg > 0 ? (recentAvg - olderAvg) / olderAvg : 0;
    }

    calculateRegenerationEfficiency(resourceType) {
        const resource = this.state.resources.get(resourceType);
        const optimalScarcity = this.config.optimalScarcityLevels[resourceType];
        
        // Efficiency is higher when scarcity is close to optimal
        const scarcityDeviation = Math.abs(resource.scarcity - optimalScarcity);
        return Math.max(0, 1 - scarcityDeviation);
    }

    calculateDemandFulfillment(resourceType) {
        const consumption = this.economicIndicators.totalConsumption.get(resourceType);
        const production = this.economicIndicators.totalProduction.get(resourceType);
        
        if (consumption.eq(0)) return 1.0;
        
        const fulfillmentRatio = production.div(consumption);
        return Math.min(1.0, fulfillmentRatio.toNumber());
    }

    calculatePriceStability(resourceType) {
        const priceHistory = this.economicIndicators.priceHistory.get(resourceType);
        if (priceHistory.length < 10) return 1.0;
        
        const recentPrices = priceHistory.slice(-10).map(p => p.price);
        const mean = recentPrices.reduce((sum, p) => sum + p, 0) / recentPrices.length;
        const variance = recentPrices.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / recentPrices.length;
        const stdDev = Math.sqrt(variance);
        
        // Lower coefficient of variation = higher stability
        const coefficientOfVariation = mean > 0 ? stdDev / mean : 0;
        return Math.max(0, 1 - coefficientOfVariation);
    }

    identifyRisks(resourceType) {
        const resource = this.state.resources.get(resourceType);
        const risks = [];

        // Pool depletion risk
        const poolUtilization = resource.currentPool.div(resource.maxPool).toNumber();
        if (poolUtilization < this.config.emergencyThreshold) {
            risks.push({
                type: 'depletion_risk',
                severity: 'high',
                description: 'Resource pool critically low',
                recommendation: 'Implement emergency regeneration measures'
            });
        }

        // Environmental degradation risk
        const environmentalHealth = this.state.environmentalHealth.get(resourceType);
        if (environmentalHealth < 0.3) {
            risks.push({
                type: 'environmental_risk',
                severity: 'medium',
                description: 'Environmental health degraded',
                recommendation: 'Reduce consumption pressure and implement sustainability measures'
            });
        }

        // Extreme scarcity risk
        if (resource.scarcity > 0.8) {
            risks.push({
                type: 'scarcity_risk',
                severity: 'high',
                description: 'Extreme resource scarcity',
                recommendation: 'Boost regeneration rate and limit consumption'
            });
        }

        return risks;
    }

    generateRecommendations(resourceType, analysis) {
        const recommendations = [];
        const resource = this.state.resources.get(resourceType);

        // Regeneration rate recommendations
        if (analysis.currentState.scarcity > this.config.optimalScarcityLevels[resourceType] * 1.5) {
            recommendations.push({
                type: 'increase_regeneration',
                priority: 'high',
                resourceType,
                action: 'Increase regeneration rate by 50%',
                expectedImpact: 'Reduce scarcity within 24 hours'
            });
        }

        // Environmental recommendations
        if (analysis.currentState.environmentalHealth < 0.5) {
            recommendations.push({
                type: 'environmental_restoration',
                priority: 'medium',
                resourceType,
                action: 'Implement consumption limits and sustainability incentives',
                expectedImpact: 'Improve environmental health over 7 days'
            });
        }

        // Demand management recommendations
        if (analysis.trends.demandTrend > 0.5) {
            recommendations.push({
                type: 'demand_management',
                priority: 'medium',
                resourceType,
                action: 'Consider demand-side interventions or alternative resources',
                expectedImpact: 'Stabilize demand growth'
            });
        }

        return recommendations;
    }

    calculateSystemHealth() {
        let totalHealth = 0;
        let resourceCount = 0;

        for (const [resourceType, resource] of this.state.resources) {
            const poolHealth = resource.currentPool.div(resource.maxPool).toNumber();
            const scarcityHealth = 1 - Math.abs(resource.scarcity - this.config.optimalScarcityLevels[resourceType]);
            const environmentalHealth = this.state.environmentalHealth.get(resourceType);
            
            const resourceHealth = (poolHealth + scarcityHealth + environmentalHealth) / 3;
            totalHealth += resourceHealth;
            resourceCount++;
        }

        const overallHealth = resourceCount > 0 ? totalHealth / resourceCount : 0;
        
        return {
            overallHealth,
            status: overallHealth > 0.8 ? 'HEALTHY' : overallHealth > 0.6 ? 'FAIR' : 'POOR',
            individualScores: Object.fromEntries(
                Array.from(this.state.resources.keys()).map(resourceType => [
                    resourceType,
                    this.calculateIndividualResourceHealth(resourceType)
                ])
            )
        };
    }

    calculateIndividualResourceHealth(resourceType) {
        const resource = this.state.resources.get(resourceType);
        const poolHealth = resource.currentPool.div(resource.maxPool).toNumber();
        const scarcityHealth = 1 - Math.abs(resource.scarcity - this.config.optimalScarcityLevels[resourceType]);
        const environmentalHealth = this.state.environmentalHealth.get(resourceType);
        
        return (poolHealth + scarcityHealth + environmentalHealth) / 3;
    }

    // Get comprehensive system status
    getResourceStates() {
        const states = {};
        
        for (const [resourceType, resource] of this.state.resources) {
            states[resourceType] = {
                currentPool: resource.currentPool.toNumber(),
                maxPool: resource.maxPool.toNumber(),
                poolUtilization: resource.currentPool.div(resource.maxPool).toNumber(),
                scarcity: resource.scarcity,
                regenerationRate: resource.currentRegenerationRate,
                environmentalHealth: this.state.environmentalHealth.get(resourceType),
                sustainabilityScore: resource.sustainabilityScore,
                consumption: resource.consumption.toNumber(),
                production: resource.production.toNumber(),
                lastUpdate: resource.lastUpdate
            };
        }

        return states;
    }

    // Emergency interventions
    executeEmergencyIntervention(resourceType, interventionType) {
        const resource = this.state.resources.get(resourceType);
        if (!resource) return false;

        let interventionApplied = false;

        switch (interventionType) {
            case 'emergency_regeneration':
                // Boost regeneration rate by 300%
                this.state.eventModifiers.set(resourceType, 4.0);
                setTimeout(() => {
                    this.state.eventModifiers.set(resourceType, 1.0);
                }, 3600000); // 1 hour
                interventionApplied = true;
                break;

            case 'resource_injection':
                // Directly add 20% of max pool
                const injectionAmount = resource.maxPool.mul(0.2);
                resource.currentPool = resource.currentPool.plus(injectionAmount);
                interventionApplied = true;
                break;

            case 'consumption_halt':
                // Temporarily prevent further consumption
                this.emit('consumption_halted', { resourceType, duration: 1800000 }); // 30 minutes
                interventionApplied = true;
                break;
        }

        if (interventionApplied) {
            this.emit('emergency_intervention', {
                resourceType,
                interventionType,
                timestamp: Date.now(),
                resourceState: states[resourceType]
            });
        }

        return interventionApplied;
    }

    stop() {
        if (this.regenerationInterval) {
            clearInterval(this.regenerationInterval);
        }
        if (this.analysisInterval) {
            clearInterval(this.analysisInterval);
        }
    }
}

module.exports = ResourceRegenerationSystem;
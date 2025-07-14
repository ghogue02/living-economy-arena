/**
 * Commodity Scarcity Mechanics with Resource Depletion/Discovery Events
 * Dynamic resource management for realistic economic scarcity modeling
 */

const Decimal = require('decimal.js');
const EventEmitter = require('eventemitter3');
const { v4: uuidv4 } = require('uuid');

class CommodityScarcityEngine extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            depletionRate: config.depletionRate || 0.001, // 0.1% per cycle
            discoveryProbability: config.discoveryProbability || 0.005, // 0.5% per cycle
            renewalRate: config.renewalRate || 0.002, // 0.2% per cycle for renewables
            catastropheProbability: config.catastropheProbability || 0.0001, // 0.01% per cycle
            maxScarcityMultiplier: config.maxScarcityMultiplier || 10,
            minReserveRatio: config.minReserveRatio || 0.05, // 5% reserves
            ...config
        };

        this.commodities = new Map();
        this.globalReserves = new Map();
        this.scarcityEvents = [];
        this.discoveryEvents = [];
        this.depletionHistory = new Map();
        
        this.initializeCommodities();
    }

    /**
     * Initialize commodity types with realistic scarcity parameters
     */
    initializeCommodities() {
        const commodityTypes = [
            {
                id: 'oil',
                name: 'Crude Oil',
                type: 'finite',
                baseReserves: new Decimal(1000000000), // 1B barrels
                currentReserves: new Decimal(1000000000),
                depletionRate: 0.003, // Higher depletion
                discoveryProbability: 0.002, // Lower discovery
                renewalRate: 0, // Non-renewable
                extractionCost: new Decimal(40),
                strategicImportance: 0.9,
                substituteAvailability: 0.3
            },
            {
                id: 'lithium',
                name: 'Lithium',
                type: 'finite',
                baseReserves: new Decimal(50000000), // 50M tons
                currentReserves: new Decimal(50000000),
                depletionRate: 0.005, // High depletion due to EV demand
                discoveryProbability: 0.008, // Active exploration
                renewalRate: 0.001, // Some recycling
                extractionCost: new Decimal(8000),
                strategicImportance: 0.85,
                substituteAvailability: 0.2
            },
            {
                id: 'rare_earth',
                name: 'Rare Earth Elements',
                type: 'finite',
                baseReserves: new Decimal(120000000), // 120M tons
                currentReserves: new Decimal(120000000),
                depletionRate: 0.004,
                discoveryProbability: 0.003,
                renewalRate: 0.002, // Some recycling
                extractionCost: new Decimal(15000),
                strategicImportance: 0.95,
                substituteAvailability: 0.1
            },
            {
                id: 'water',
                name: 'Fresh Water',
                type: 'renewable',
                baseReserves: new Decimal(35000000000), // 35B cubic meters
                currentReserves: new Decimal(35000000000),
                depletionRate: 0.002,
                discoveryProbability: 0.001,
                renewalRate: 0.05, // Significant natural renewal
                extractionCost: new Decimal(2),
                strategicImportance: 1.0,
                substituteAvailability: 0.1
            },
            {
                id: 'arable_land',
                name: 'Arable Land',
                type: 'finite_renewable',
                baseReserves: new Decimal(1400000000), // 1.4B hectares
                currentReserves: new Decimal(1400000000),
                depletionRate: 0.001, // Soil degradation
                discoveryProbability: 0.0005, // Land reclamation
                renewalRate: 0.003, // Soil restoration
                extractionCost: new Decimal(5000),
                strategicImportance: 0.95,
                substituteAvailability: 0.15
            },
            {
                id: 'carbon_credits',
                name: 'Carbon Credits',
                type: 'artificial',
                baseReserves: new Decimal(1000000000), // 1B credits
                currentReserves: new Decimal(1000000000),
                depletionRate: 0.006, // High consumption
                discoveryProbability: 0.01, // New projects
                renewalRate: 0.008, // Forest growth, etc.
                extractionCost: new Decimal(50),
                strategicImportance: 0.7,
                substituteAvailability: 0.8
            }
        ];

        commodityTypes.forEach(commodity => {
            this.commodities.set(commodity.id, {
                ...commodity,
                scarcityLevel: 0, // 0-1 scale
                priceMultiplier: 1,
                lastDiscovery: null,
                lastDepletion: null,
                productionCapacity: commodity.currentReserves.div(1000),
                extractionEfficiency: 0.8,
                reserveToProductionRatio: commodity.currentReserves.div(commodity.currentReserves.div(1000)),
                criticalThreshold: commodity.currentReserves.mul(0.2),
                emergencyThreshold: commodity.currentReserves.mul(0.05)
            });
            
            this.depletionHistory.set(commodity.id, []);
        });
    }

    /**
     * Update commodity scarcity based on consumption and events
     */
    updateScarcity(marketData, consumptionData) {
        for (const [commodityId, commodity] of this.commodities) {
            // Process consumption and depletion
            this.processConsumption(commodityId, consumptionData);
            
            // Check for natural depletion
            this.processNaturalDepletion(commodityId);
            
            // Check for renewal (for renewable resources)
            this.processRenewal(commodityId);
            
            // Check for discovery events
            this.checkDiscoveryEvents(commodityId);
            
            // Check for catastrophic events
            this.checkCatastrophicEvents(commodityId);
            
            // Update scarcity level and price multiplier
            this.updateScarcityMetrics(commodityId);
            
            // Record history
            this.recordDepletionHistory(commodityId);
        }
        
        // Emit scarcity update
        this.emit('scarcity_update', this.getScarcityState());
    }

    /**
     * Process consumption-based depletion
     */
    processConsumption(commodityId, consumptionData) {
        const commodity = this.commodities.get(commodityId);
        if (!commodity) return;
        
        // Get consumption for this commodity
        const consumption = consumptionData.get(commodityId) || new Decimal(0);
        
        // Apply extraction efficiency
        const actualExtraction = consumption.div(commodity.extractionEfficiency);
        
        // Deplete reserves
        commodity.currentReserves = commodity.currentReserves.minus(actualExtraction);
        
        // Ensure reserves don't go negative
        if (commodity.currentReserves.lt(0)) {
            commodity.currentReserves = new Decimal(0);
        }
        
        // Update extraction cost based on depletion
        this.updateExtractionCost(commodityId);
    }

    /**
     * Process natural depletion
     */
    processNaturalDepletion(commodityId) {
        const commodity = this.commodities.get(commodityId);
        if (!commodity) return;
        
        // Apply natural depletion rate
        const depletionAmount = commodity.currentReserves.mul(commodity.depletionRate);
        commodity.currentReserves = commodity.currentReserves.minus(depletionAmount);
        
        if (commodity.currentReserves.lt(0)) {
            commodity.currentReserves = new Decimal(0);
        }
    }

    /**
     * Process renewal for renewable resources
     */
    processRenewal(commodityId) {
        const commodity = this.commodities.get(commodityId);
        if (!commodity || commodity.renewalRate === 0) return;
        
        // Calculate renewal amount (can't exceed base reserves)
        const maxRenewal = commodity.baseReserves.minus(commodity.currentReserves);
        const renewalAmount = commodity.baseReserves.mul(commodity.renewalRate);
        const actualRenewal = Decimal.min(maxRenewal, renewalAmount);
        
        commodity.currentReserves = commodity.currentReserves.plus(actualRenewal);
        
        if (actualRenewal.gt(0)) {
            this.emit('resource_renewal', {
                commodityId,
                amount: actualRenewal.toString(),
                renewalRate: commodity.renewalRate
            });
        }
    }

    /**
     * Check for discovery events
     */
    checkDiscoveryEvents(commodityId) {
        const commodity = this.commodities.get(commodityId);
        if (!commodity) return;
        
        // Discovery probability increases with scarcity
        const scarcityMultiplier = 1 + commodity.scarcityLevel * 2;
        const discoveryChance = commodity.discoveryProbability * scarcityMultiplier;
        
        if (Math.random() < discoveryChance) {
            this.triggerDiscoveryEvent(commodityId);
        }
    }

    /**
     * Trigger a discovery event
     */
    triggerDiscoveryEvent(commodityId) {
        const commodity = this.commodities.get(commodityId);
        if (!commodity) return;
        
        // Discovery size varies (10% to 50% of current reserves)
        const discoverySize = commodity.currentReserves.mul(0.1 + Math.random() * 0.4);
        
        // Add to reserves
        commodity.currentReserves = commodity.currentReserves.plus(discoverySize);
        commodity.baseReserves = commodity.baseReserves.plus(discoverySize);
        
        const discoveryEvent = {
            id: uuidv4(),
            commodityId,
            type: 'discovery',
            amount: discoverySize.toString(),
            timestamp: Date.now(),
            impact: 'reserves_increased',
            discoveryType: this.getDiscoveryType()
        };
        
        this.discoveryEvents.push(discoveryEvent);
        commodity.lastDiscovery = Date.now();
        
        this.emit('discovery_event', discoveryEvent);
    }

    /**
     * Get discovery type
     */
    getDiscoveryType() {
        const types = [
            'new_deposit',
            'technological_advancement',
            'exploration_success',
            'seabed_discovery',
            'recycling_breakthrough',
            'substitute_development'
        ];
        return types[Math.floor(Math.random() * types.length)];
    }

    /**
     * Check for catastrophic events
     */
    checkCatastrophicEvents(commodityId) {
        const commodity = this.commodities.get(commodityId);
        if (!commodity) return;
        
        if (Math.random() < this.config.catastropheProbability) {
            this.triggerCatastrophicEvent(commodityId);
        }
    }

    /**
     * Trigger a catastrophic event
     */
    triggerCatastrophicEvent(commodityId) {
        const commodity = this.commodities.get(commodityId);
        if (!commodity) return;
        
        const eventTypes = [
            { type: 'natural_disaster', impact: 0.15, duration: 30 },
            { type: 'political_instability', impact: 0.25, duration: 60 },
            { type: 'supply_chain_disruption', impact: 0.1, duration: 15 },
            { type: 'environmental_catastrophe', impact: 0.3, duration: 90 },
            { type: 'technological_failure', impact: 0.2, duration: 45 }
        ];
        
        const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        // Reduce reserves or production capacity
        const lossAmount = commodity.currentReserves.mul(event.impact);
        commodity.currentReserves = commodity.currentReserves.minus(lossAmount);
        
        const catastrophicEvent = {
            id: uuidv4(),
            commodityId,
            type: 'catastrophic',
            eventType: event.type,
            impact: event.impact,
            duration: event.duration,
            lossAmount: lossAmount.toString(),
            timestamp: Date.now()
        };
        
        this.scarcityEvents.push(catastrophicEvent);
        
        this.emit('catastrophic_event', catastrophicEvent);
    }

    /**
     * Update extraction cost based on depletion
     */
    updateExtractionCost(commodityId) {
        const commodity = this.commodities.get(commodityId);
        if (!commodity) return;
        
        // Cost increases as reserves deplete (more difficult extraction)
        const depletionRatio = commodity.currentReserves.div(commodity.baseReserves);
        const costMultiplier = new Decimal(2).minus(depletionRatio); // 1x at full reserves, 2x at empty
        
        commodity.extractionCost = commodity.extractionCost.mul(costMultiplier);
    }

    /**
     * Update scarcity metrics
     */
    updateScarcityMetrics(commodityId) {
        const commodity = this.commodities.get(commodityId);
        if (!commodity) return;
        
        // Calculate scarcity level (0-1)
        const reserveRatio = commodity.currentReserves.div(commodity.baseReserves);
        commodity.scarcityLevel = Math.max(0, 1 - reserveRatio.toNumber());
        
        // Calculate price multiplier based on scarcity
        const baseMultiplier = 1 + commodity.scarcityLevel * (this.config.maxScarcityMultiplier - 1);
        
        // Apply strategic importance
        const strategicMultiplier = 1 + (commodity.strategicImportance - 0.5) * commodity.scarcityLevel;
        
        // Apply substitute availability (reduces scarcity impact)
        const substituteReduction = commodity.substituteAvailability * commodity.scarcityLevel * 0.3;
        
        commodity.priceMultiplier = baseMultiplier * strategicMultiplier * (1 - substituteReduction);
        
        // Update reserve-to-production ratio
        if (commodity.productionCapacity.gt(0)) {
            commodity.reserveToProductionRatio = commodity.currentReserves.div(commodity.productionCapacity);
        }
        
        // Check critical thresholds
        this.checkCriticalThresholds(commodityId);
    }

    /**
     * Check critical thresholds and trigger alerts
     */
    checkCriticalThresholds(commodityId) {
        const commodity = this.commodities.get(commodityId);
        if (!commodity) return;
        
        if (commodity.currentReserves.lte(commodity.emergencyThreshold)) {
            this.emit('emergency_scarcity', {
                commodityId,
                currentReserves: commodity.currentReserves.toString(),
                threshold: commodity.emergencyThreshold.toString(),
                severity: 'emergency'
            });
        } else if (commodity.currentReserves.lte(commodity.criticalThreshold)) {
            this.emit('critical_scarcity', {
                commodityId,
                currentReserves: commodity.currentReserves.toString(),
                threshold: commodity.criticalThreshold.toString(),
                severity: 'critical'
            });
        }
    }

    /**
     * Record depletion history
     */
    recordDepletionHistory(commodityId) {
        const commodity = this.commodities.get(commodityId);
        if (!commodity) return;
        
        const history = this.depletionHistory.get(commodityId);
        history.push({
            timestamp: Date.now(),
            currentReserves: commodity.currentReserves.toNumber(),
            scarcityLevel: commodity.scarcityLevel,
            priceMultiplier: commodity.priceMultiplier,
            extractionCost: commodity.extractionCost.toNumber()
        });
        
        // Keep only last 1000 entries
        if (history.length > 1000) {
            history.shift();
        }
    }

    /**
     * Get current scarcity state
     */
    getScarcityState() {
        const state = {};
        
        for (const [commodityId, commodity] of this.commodities) {
            state[commodityId] = {
                name: commodity.name,
                type: commodity.type,
                currentReserves: commodity.currentReserves.toString(),
                baseReserves: commodity.baseReserves.toString(),
                scarcityLevel: commodity.scarcityLevel,
                priceMultiplier: commodity.priceMultiplier,
                extractionCost: commodity.extractionCost.toString(),
                reserveToProductionRatio: commodity.reserveToProductionRatio.toString(),
                strategicImportance: commodity.strategicImportance,
                substituteAvailability: commodity.substituteAvailability,
                lastDiscovery: commodity.lastDiscovery,
                status: this.getCommodityStatus(commodity)
            };
        }
        
        return {
            commodities: state,
            recentEvents: this.getRecentEvents(),
            globalScarcityIndex: this.calculateGlobalScarcityIndex()
        };
    }

    /**
     * Get commodity status
     */
    getCommodityStatus(commodity) {
        if (commodity.currentReserves.lte(commodity.emergencyThreshold)) {
            return 'emergency';
        } else if (commodity.currentReserves.lte(commodity.criticalThreshold)) {
            return 'critical';
        } else if (commodity.scarcityLevel > 0.6) {
            return 'scarce';
        } else if (commodity.scarcityLevel > 0.3) {
            return 'moderate';
        } else {
            return 'abundant';
        }
    }

    /**
     * Get recent events
     */
    getRecentEvents(limit = 20) {
        const allEvents = [...this.scarcityEvents, ...this.discoveryEvents]
            .sort((a, b) => b.timestamp - a.timestamp);
        
        return allEvents.slice(0, limit);
    }

    /**
     * Calculate global scarcity index
     */
    calculateGlobalScarcityIndex() {
        let weightedScarcity = 0;
        let totalWeight = 0;
        
        for (const [commodityId, commodity] of this.commodities) {
            const weight = commodity.strategicImportance;
            weightedScarcity += commodity.scarcityLevel * weight;
            totalWeight += weight;
        }
        
        return totalWeight > 0 ? weightedScarcity / totalWeight : 0;
    }

    /**
     * Get commodity history
     */
    getCommodityHistory(commodityId, points = 100) {
        const history = this.depletionHistory.get(commodityId);
        return history ? history.slice(-points) : [];
    }

    /**
     * Manually trigger events for testing
     */
    manualTriggerEvent(commodityId, eventType, magnitude = 1.0) {
        switch (eventType) {
            case 'discovery':
                this.triggerDiscoveryEvent(commodityId);
                break;
            case 'catastrophe':
                this.triggerCatastrophicEvent(commodityId);
                break;
            case 'depletion':
                const commodity = this.commodities.get(commodityId);
                if (commodity) {
                    const depletionAmount = commodity.currentReserves.mul(0.1 * magnitude);
                    commodity.currentReserves = commodity.currentReserves.minus(depletionAmount);
                }
                break;
        }
    }
}

module.exports = CommodityScarcityEngine;
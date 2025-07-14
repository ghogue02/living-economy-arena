/**
 * Crisis Orchestration System
 * Allows players to trigger natural disasters and economic crises for market manipulation
 */

const EventEmitter = require('eventemitter3');
const { v4: uuidv4 } = require('uuid');

class CrisisOrchestrationSystem extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            maxCrisesPerPlayer: config.maxCrisesPerPlayer || 2,
            crisisCooldown: config.crisisCooldown || 7200000, // 2 hours
            detectionProbability: config.detectionProbability || 0.3,
            naturalRandomRate: config.naturalRandomRate || 0.001, // 0.1% chance per hour
            crisisDecayRate: config.crisisDecayRate || 0.1, // 10% reduction per hour
            maxSeverity: config.maxSeverity || 1.0,
            ...config
        };

        this.state = {
            activeCrises: new Map(),
            playerCrisisHistory: new Map(),
            scheduledEvents: new Map(),
            crisisEffects: new Map(),
            detectionEvents: new Map(),
            globalStability: 1.0,
            naturalDisasterQueue: []
        };

        this.crisisTypes = {
            natural_disasters: {
                earthquake: {
                    cost: 500000,
                    severity: [0.3, 0.8],
                    duration: [3600000, 7200000], // 1-2 hours
                    detectionRisk: 0.1,
                    targetTypes: ['infrastructure', 'supply_chains'],
                    effects: ['production_disruption', 'transportation_blockage', 'price_volatility']
                },
                hurricane: {
                    cost: 400000,
                    severity: [0.4, 0.9],
                    duration: [7200000, 14400000], // 2-4 hours
                    detectionRisk: 0.05,
                    targetTypes: ['coastal_regions', 'transportation'],
                    effects: ['supply_disruption', 'energy_shortage', 'evacuation_costs']
                },
                drought: {
                    cost: 600000,
                    severity: [0.2, 0.6],
                    duration: [21600000, 43200000], // 6-12 hours
                    detectionRisk: 0.15,
                    targetTypes: ['agriculture', 'water_supply'],
                    effects: ['crop_failure', 'water_scarcity', 'food_price_increase']
                },
                wildfire: {
                    cost: 350000,
                    severity: [0.3, 0.7],
                    duration: [5400000, 10800000], // 1.5-3 hours
                    detectionRisk: 0.2,
                    targetTypes: ['forests', 'rural_infrastructure'],
                    effects: ['property_damage', 'air_quality', 'insurance_claims']
                },
                flood: {
                    cost: 300000,
                    severity: [0.3, 0.8],
                    duration: [3600000, 10800000], // 1-3 hours
                    detectionRisk: 0.1,
                    targetTypes: ['river_valleys', 'urban_areas'],
                    effects: ['property_damage', 'transportation_disruption', 'agricultural_loss']
                }
            },
            technological_failures: {
                power_grid_failure: {
                    cost: 750000,
                    severity: [0.4, 0.9],
                    duration: [1800000, 7200000], // 30 min - 2 hours
                    detectionRisk: 0.4,
                    targetTypes: ['electrical_grid', 'industrial_facilities'],
                    effects: ['production_halt', 'data_loss', 'cascading_failures']
                },
                cyber_attack: {
                    cost: 800000,
                    severity: [0.3, 0.8],
                    duration: [3600000, 14400000], // 1-4 hours
                    detectionRisk: 0.6,
                    targetTypes: ['financial_systems', 'communications'],
                    effects: ['system_downtime', 'data_breach', 'trust_erosion']
                },
                satellite_disruption: {
                    cost: 900000,
                    severity: [0.2, 0.6],
                    duration: [7200000, 21600000], // 2-6 hours
                    detectionRisk: 0.3,
                    targetTypes: ['communications', 'navigation'],
                    effects: ['communication_loss', 'navigation_errors', 'financial_disruption']
                },
                supply_chain_hack: {
                    cost: 650000,
                    severity: [0.3, 0.7],
                    duration: [3600000, 10800000], // 1-3 hours
                    detectionRisk: 0.5,
                    targetTypes: ['logistics', 'manufacturing'],
                    effects: ['delivery_delays', 'inventory_disruption', 'quality_issues']
                }
            },
            economic_shocks: {
                currency_crisis: {
                    cost: 1000000,
                    severity: [0.4, 1.0],
                    duration: [14400000, 28800000], // 4-8 hours
                    detectionRisk: 0.7,
                    targetTypes: ['financial_markets', 'international_trade'],
                    effects: ['exchange_rate_volatility', 'capital_flight', 'inflation_spike']
                },
                bank_run: {
                    cost: 1200000,
                    severity: [0.5, 0.9],
                    duration: [7200000, 18000000], // 2-5 hours
                    detectionRisk: 0.8,
                    targetTypes: ['banking_system', 'financial_confidence'],
                    effects: ['liquidity_crisis', 'credit_freeze', 'panic_selling']
                },
                commodity_shock: {
                    cost: 800000,
                    severity: [0.3, 0.8],
                    duration: [10800000, 21600000], // 3-6 hours
                    detectionRisk: 0.6,
                    targetTypes: ['specific_commodity', 'supply_chains'],
                    effects: ['price_spike', 'shortage_panic', 'substitute_demand']
                },
                market_manipulation: {
                    cost: 1500000,
                    severity: [0.2, 0.7],
                    duration: [3600000, 7200000], // 1-2 hours
                    detectionRisk: 0.9,
                    targetTypes: ['specific_markets', 'investor_sentiment'],
                    effects: ['artificial_volatility', 'price_distortion', 'regulatory_response']
                }
            },
            social_disruptions: {
                labor_strike: {
                    cost: 400000,
                    severity: [0.3, 0.7],
                    duration: [14400000, 43200000], // 4-12 hours
                    detectionRisk: 0.5,
                    targetTypes: ['specific_industry', 'transportation'],
                    effects: ['production_halt', 'service_disruption', 'wage_pressure']
                },
                supply_blockade: {
                    cost: 600000,
                    severity: [0.4, 0.8],
                    duration: [7200000, 18000000], // 2-5 hours
                    detectionRisk: 0.4,
                    targetTypes: ['transportation_hubs', 'supply_routes'],
                    effects: ['delivery_delays', 'price_increases', 'shortage_anxiety']
                },
                regulatory_scandal: {
                    cost: 700000,
                    severity: [0.3, 0.6],
                    duration: [18000000, 36000000], // 5-10 hours
                    detectionRisk: 0.6,
                    targetTypes: ['regulatory_bodies', 'industry_reputation'],
                    effects: ['compliance_costs', 'market_uncertainty', 'policy_changes']
                }
            }
        };

        this.initializeSystem();
    }

    initializeSystem() {
        // Start crisis monitoring and decay
        setInterval(() => {
            this.updateActiveCrises();
        }, 300000); // Every 5 minutes

        // Start natural disaster generation
        setInterval(() => {
            this.generateNaturalDisasters();
        }, 3600000); // Every hour

        // Start detection monitoring
        setInterval(() => {
            this.performDetectionChecks();
        }, 600000); // Every 10 minutes

        // Start stability monitoring
        setInterval(() => {
            this.updateGlobalStability();
        }, 900000); // Every 15 minutes

        console.log('Crisis Orchestration System initialized');
    }

    // Crisis Orchestration
    async orchestrateCrisis(playerId, crisisCategory, crisisType, targetParams, options = {}) {
        const crisisConfig = this.crisisTypes[crisisCategory]?.[crisisType];
        if (!crisisConfig) throw new Error('Invalid crisis type');

        // Check player limits
        const activeCrises = Array.from(this.state.activeCrises.values())
            .filter(crisis => crisis.orchestrator === playerId);
        
        if (activeCrises.length >= this.config.maxCrisesPerPlayer) {
            throw new Error('Maximum active crises limit reached');
        }

        // Check cooldown
        const playerHistory = this.state.playerCrisisHistory.get(playerId) || [];
        const lastCrisis = playerHistory[playerHistory.length - 1];
        if (lastCrisis && Date.now() - lastCrisis.timestamp < this.config.crisisCooldown) {
            throw new Error('Crisis orchestration on cooldown');
        }

        const crisisId = uuidv4();
        const severity = this.calculateCrisisSeverity(crisisConfig, options.severity);
        const duration = this.calculateCrisisDuration(crisisConfig, severity);
        
        const crisis = {
            id: crisisId,
            category: crisisCategory,
            type: crisisType,
            orchestrator: playerId,
            target: targetParams,
            severity,
            plannedDuration: duration,
            actualDuration: 0,
            cost: crisisConfig.cost,
            detectionRisk: crisisConfig.detectionRisk,
            status: 'planning',
            startTime: null,
            endTime: null,
            detected: false,
            detectionTime: null,
            effects: [],
            economicImpact: 0,
            coverStory: options.coverStory || this.generateCoverStory(crisisCategory, crisisType),
            preparationTime: options.preparationTime || 1800000, // 30 minutes default
            scheduledStart: Date.now() + (options.preparationTime || 1800000)
        };

        // Store crisis
        this.state.activeCrises.set(crisisId, crisis);

        // Schedule crisis start
        setTimeout(() => {
            this.startCrisis(crisisId);
        }, crisis.preparationTime);

        // Record in player history
        if (!this.state.playerCrisisHistory.has(playerId)) {
            this.state.playerCrisisHistory.set(playerId, []);
        }
        this.state.playerCrisisHistory.get(playerId).push({
            crisisId,
            timestamp: Date.now(),
            type: crisisType,
            severity
        });

        this.emit('crisis_orchestrated', { crisisId, playerId, crisis });
        return { crisisId, estimatedStart: crisis.scheduledStart };
    }

    calculateCrisisSeverity(config, requestedSeverity) {
        const [minSeverity, maxSeverity] = config.severity;
        
        if (requestedSeverity) {
            return Math.max(minSeverity, Math.min(maxSeverity, requestedSeverity));
        }
        
        // Random severity within range
        return minSeverity + Math.random() * (maxSeverity - minSeverity);
    }

    calculateCrisisDuration(config, severity) {
        const [minDuration, maxDuration] = config.duration;
        
        // Higher severity tends to last longer
        const severityFactor = 0.3 + (severity * 0.7); // 30% to 100% based on severity
        const baseDuration = minDuration + (maxDuration - minDuration) * severityFactor;
        
        // Add some randomness
        const variance = baseDuration * 0.2; // ±20%
        return baseDuration + (Math.random() - 0.5) * 2 * variance;
    }

    generateCoverStory(category, type) {
        const coverStories = {
            natural_disasters: {
                earthquake: ['tectonic_instability', 'geological_survey_error', 'fracking_side_effect'],
                hurricane: ['climate_change', 'seasonal_pattern', 'ocean_temperature_anomaly'],
                drought: ['climate_cycle', 'atmospheric_pattern', 'water_management_failure'],
                wildfire: ['lightning_strike', 'power_line_failure', 'camping_accident'],
                flood: ['dam_failure', 'excessive_rainfall', 'poor_drainage_system']
            },
            technological_failures: {
                power_grid_failure: ['aging_infrastructure', 'overload_conditions', 'equipment_malfunction'],
                cyber_attack: ['foreign_state_actor', 'criminal_organization', 'insider_threat'],
                satellite_disruption: ['space_weather', 'debris_collision', 'technical_malfunction'],
                supply_chain_hack: ['criminal_network', 'disgruntled_employee', 'system_vulnerability']
            },
            economic_shocks: {
                currency_crisis: ['political_instability', 'trade_deficit', 'speculation_attack'],
                bank_run: ['rumor_spreading', 'financial_scandal', 'regulatory_concern'],
                commodity_shock: ['supply_disruption', 'speculation_bubble', 'geopolitical_tension'],
                market_manipulation: ['algorithmic_trading_error', 'insider_information', 'pump_dump_scheme']
            },
            social_disruptions: {
                labor_strike: ['wage_disputes', 'working_conditions', 'union_organizing'],
                supply_blockade: ['political_protest', 'environmental_activism', 'local_grievances'],
                regulatory_scandal: ['corruption_allegations', 'safety_violations', 'policy_failures']
            }
        };

        const stories = coverStories[category]?.[type] || ['unknown_cause'];
        return stories[Math.floor(Math.random() * stories.length)];
    }

    async startCrisis(crisisId) {
        const crisis = this.state.activeCrises.get(crisisId);
        if (!crisis || crisis.status !== 'planning') return;

        crisis.status = 'active';
        crisis.startTime = Date.now();
        crisis.endTime = Date.now() + crisis.plannedDuration;

        // Generate initial effects
        crisis.effects = await this.generateCrisisEffects(crisis);

        // Apply effects to the economic system
        await this.applyCrisisEffects(crisis);

        // Schedule crisis end
        setTimeout(() => {
            this.endCrisis(crisisId);
        }, crisis.plannedDuration);

        // Check for immediate detection
        if (Math.random() < crisis.detectionRisk * 0.2) { // 20% of detection risk applies immediately
            this.detectCrisisOrchestration(crisisId);
        }

        this.emit('crisis_started', { crisisId, crisis });
    }

    async generateCrisisEffects(crisis) {
        const config = this.crisisTypes[crisis.category][crisis.type];
        const effects = [];

        for (const effectType of config.effects) {
            const effect = await this.createCrisisEffect(effectType, crisis);
            if (effect) effects.push(effect);
        }

        return effects;
    }

    async createCrisisEffect(effectType, crisis) {
        const baseEffect = {
            type: effectType,
            severity: crisis.severity,
            duration: crisis.plannedDuration,
            target: crisis.target,
            startTime: Date.now(),
            decay: 0
        };

        switch (effectType) {
            case 'production_disruption':
                return {
                    ...baseEffect,
                    impact: {
                        type: 'production_modifier',
                        value: -crisis.severity * 0.6, // Up to 60% production reduction
                        targetIndustries: crisis.target.industries || ['all'],
                        targetRegions: crisis.target.regions || ['affected_area']
                    }
                };

            case 'transportation_blockage':
                return {
                    ...baseEffect,
                    impact: {
                        type: 'transportation_efficiency_modifier',
                        value: -crisis.severity * 0.8, // Up to 80% efficiency reduction
                        targetRoutes: crisis.target.routes || ['all'],
                        alternativeRouteCost: crisis.severity * 2.0 // 200% cost increase for alternatives
                    }
                };

            case 'price_volatility':
                return {
                    ...baseEffect,
                    impact: {
                        type: 'price_volatility_modifier',
                        value: crisis.severity * 1.5, // Up to 150% volatility increase
                        targetMarkets: crisis.target.markets || ['all'],
                        volatilityDirection: Math.random() > 0.5 ? 'upward' : 'bidirectional'
                    }
                };

            case 'supply_disruption':
                return {
                    ...baseEffect,
                    impact: {
                        type: 'supply_modifier',
                        value: -crisis.severity * 0.7, // Up to 70% supply reduction
                        targetCommodities: crisis.target.commodities || ['all'],
                        recoveryRate: 0.1 // 10% recovery per hour after crisis
                    }
                };

            case 'system_downtime':
                return {
                    ...baseEffect,
                    impact: {
                        type: 'system_availability_modifier',
                        value: -crisis.severity * 0.9, // Up to 90% system unavailability
                        targetSystems: crisis.target.systems || ['trading', 'communications'],
                        fallbackCost: crisis.severity * 3.0 // 300% cost for backup systems
                    }
                };

            case 'liquidity_crisis':
                return {
                    ...baseEffect,
                    impact: {
                        type: 'liquidity_modifier',
                        value: -crisis.severity * 0.8, // Up to 80% liquidity reduction
                        targetMarkets: crisis.target.markets || ['financial'],
                        borrowingCostIncrease: crisis.severity * 2.0 // 200% borrowing cost increase
                    }
                };

            case 'regulatory_response':
                return {
                    ...baseEffect,
                    impact: {
                        type: 'regulatory_compliance_modifier',
                        value: crisis.severity * 1.2, // Up to 120% compliance cost increase
                        targetIndustries: crisis.target.industries || ['finance'],
                        restrictionLevel: Math.floor(crisis.severity * 5) // 0-5 restriction level
                    }
                };

            default:
                return {
                    ...baseEffect,
                    impact: {
                        type: 'generic_disruption',
                        value: -crisis.severity * 0.5,
                        description: `Generic disruption: ${effectType}`
                    }
                };
        }
    }

    async applyCrisisEffects(crisis) {
        // Store effects for retrieval by economic engine
        this.state.crisisEffects.set(crisis.id, crisis.effects);

        // Calculate economic impact
        let totalImpact = 0;
        crisis.effects.forEach(effect => {
            totalImpact += Math.abs(effect.impact.value) * effect.severity;
        });
        crisis.economicImpact = totalImpact;

        // Update global stability
        this.state.globalStability = Math.max(0.1, this.state.globalStability - totalImpact * 0.1);

        this.emit('crisis_effects_applied', { crisisId: crisis.id, effects: crisis.effects });
    }

    async endCrisis(crisisId) {
        const crisis = this.state.activeCrises.get(crisisId);
        if (!crisis) return;

        crisis.status = 'ended';
        crisis.actualDuration = Date.now() - crisis.startTime;

        // Begin recovery phase
        await this.startRecoveryPhase(crisis);

        this.emit('crisis_ended', { crisisId, crisis });

        // Clean up after 24 hours
        setTimeout(() => {
            this.state.activeCrises.delete(crisisId);
            this.state.crisisEffects.delete(crisisId);
        }, 86400000);
    }

    async startRecoveryPhase(crisis) {
        const recoveryId = uuidv4();
        const recoveryDuration = crisis.actualDuration * 0.5; // Recovery takes 50% of crisis duration

        const recovery = {
            id: recoveryId,
            crisisId: crisis.id,
            startTime: Date.now(),
            duration: recoveryDuration,
            progress: 0,
            status: 'active'
        };

        // Gradually restore effects over recovery period
        const recoveryInterval = setInterval(() => {
            recovery.progress += 0.1; // 10% recovery per interval
            
            if (recovery.progress >= 1.0) {
                clearInterval(recoveryInterval);
                recovery.status = 'completed';
                this.state.crisisEffects.delete(crisis.id);
                this.emit('crisis_recovery_completed', { recoveryId, crisisId: crisis.id });
            } else {
                this.updateCrisisEffectsForRecovery(crisis.id, recovery.progress);
            }
        }, recoveryDuration / 10); // 10 recovery steps

        this.emit('crisis_recovery_started', { recoveryId, crisisId: crisis.id, recovery });
    }

    updateCrisisEffectsForRecovery(crisisId, recoveryProgress) {
        const effects = this.state.crisisEffects.get(crisisId);
        if (!effects) return;

        effects.forEach(effect => {
            // Reduce effect severity based on recovery progress
            const originalSeverity = effect.severity;
            effect.severity = originalSeverity * (1 - recoveryProgress);
            
            // Update impact value proportionally
            if (effect.impact.value < 0) {
                effect.impact.value = effect.impact.value * (1 - recoveryProgress);
            } else {
                effect.impact.value = effect.impact.value * (1 - recoveryProgress);
            }
        });

        this.emit('crisis_effects_updated', { crisisId, effects, recoveryProgress });
    }

    // Detection System
    detectCrisisOrchestration(crisisId) {
        const crisis = this.state.activeCrises.get(crisisId);
        if (!crisis) return;

        crisis.detected = true;
        crisis.detectionTime = Date.now();

        const detection = {
            id: uuidv4(),
            crisisId,
            orchestrator: crisis.orchestrator,
            detectionTime: Date.now(),
            evidence: this.generateDetectionEvidence(crisis),
            confidence: Math.random() * 0.4 + 0.6, // 60-100% confidence
            investigationStatus: 'ongoing'
        };

        this.state.detectionEvents.set(detection.id, detection);

        // Apply consequences for detected orchestration
        this.applyDetectionConsequences(crisis, detection);

        this.emit('crisis_orchestration_detected', { 
            detectionId: detection.id, 
            crisisId, 
            orchestrator: crisis.orchestrator,
            detection 
        });
    }

    generateDetectionEvidence(crisis) {
        const evidenceTypes = [
            'financial_trail',
            'communication_intercepts',
            'pattern_analysis',
            'insider_testimony',
            'forensic_analysis',
            'timing_anomalies',
            'resource_movements',
            'behavioral_patterns'
        ];

        const evidenceCount = Math.floor(Math.random() * 4) + 2; // 2-5 pieces of evidence
        const evidence = [];

        for (let i = 0; i < evidenceCount; i++) {
            const evidenceType = evidenceTypes[Math.floor(Math.random() * evidenceTypes.length)];
            evidence.push({
                type: evidenceType,
                strength: Math.random() * 0.6 + 0.4, // 40-100% strength
                description: this.generateEvidenceDescription(evidenceType, crisis)
            });
        }

        return evidence;
    }

    generateEvidenceDescription(evidenceType, crisis) {
        const descriptions = {
            financial_trail: `Unusual financial transactions totaling $${crisis.cost.toLocaleString()} traced to orchestrator`,
            communication_intercepts: `Communications suggesting advance knowledge of ${crisis.type}`,
            pattern_analysis: `Behavioral patterns consistent with planned crisis orchestration`,
            insider_testimony: `Witness reports of suspicious activity before ${crisis.type}`,
            forensic_analysis: `Technical analysis reveals artificial nature of crisis`,
            timing_anomalies: `Suspicious timing correlations with orchestrator's activities`,
            resource_movements: `Pre-positioned resources suggest advance planning`,
            behavioral_patterns: `Orchestrator's market positions suggest foreknowledge`
        };

        return descriptions[evidenceType] || `Evidence related to ${evidenceType}`;
    }

    applyDetectionConsequences(crisis, detection) {
        const orchestrator = crisis.orchestrator;
        
        // Reputation damage
        const reputationLoss = crisis.severity * 0.4 + detection.confidence * 0.3;
        
        // Economic penalties
        const economicPenalty = crisis.cost * (1 + crisis.severity);
        
        // Legal consequences
        const legalRisk = crisis.severity * detection.confidence;

        const consequences = {
            reputationLoss,
            economicPenalty,
            legalRisk,
            investigationDuration: 7200000, // 2 hours
            restrictionsApplied: this.determineRestrictions(crisis, detection)
        };

        this.emit('detection_consequences_applied', { 
            orchestrator, 
            crisisId: crisis.id,
            consequences 
        });
    }

    determineRestrictions(crisis, detection) {
        const restrictions = [];
        
        if (detection.confidence > 0.8) {
            restrictions.push('crisis_orchestration_ban');
        }
        
        if (crisis.severity > 0.7) {
            restrictions.push('enhanced_monitoring');
        }
        
        if (crisis.category === 'economic_shocks') {
            restrictions.push('financial_activity_restrictions');
        }

        return restrictions;
    }

    // Natural Disaster Generation
    generateNaturalDisasters() {
        // Generate random natural disasters
        if (Math.random() < this.config.naturalRandomRate) {
            const naturalTypes = Object.keys(this.crisisTypes.natural_disasters);
            const randomType = naturalTypes[Math.floor(Math.random() * naturalTypes.length)];
            
            this.triggerNaturalDisaster(randomType);
        }
    }

    async triggerNaturalDisaster(disasterType) {
        const crisisId = uuidv4();
        const config = this.crisisTypes.natural_disasters[disasterType];
        
        const crisis = {
            id: crisisId,
            category: 'natural_disasters',
            type: disasterType,
            orchestrator: null, // Natural disaster
            target: this.generateRandomTarget(),
            severity: this.calculateCrisisSeverity(config),
            plannedDuration: this.calculateCrisisDuration(config, 0.5),
            status: 'active',
            startTime: Date.now(),
            detected: false,
            effects: [],
            natural: true
        };

        crisis.endTime = Date.now() + crisis.plannedDuration;
        crisis.effects = await this.generateCrisisEffects(crisis);

        this.state.activeCrises.set(crisisId, crisis);
        await this.applyCrisisEffects(crisis);

        // Schedule end
        setTimeout(() => {
            this.endCrisis(crisisId);
        }, crisis.plannedDuration);

        this.emit('natural_disaster_occurred', { crisisId, crisis });
    }

    generateRandomTarget() {
        const regions = ['north', 'south', 'east', 'west', 'central'];
        const industries = ['agriculture', 'manufacturing', 'technology', 'energy', 'finance'];
        
        return {
            region: regions[Math.floor(Math.random() * regions.length)],
            industries: [industries[Math.floor(Math.random() * industries.length)]],
            severity: Math.random()
        };
    }

    // System Updates
    updateActiveCrises() {
        for (const [crisisId, crisis] of this.state.activeCrises) {
            if (crisis.status === 'active') {
                // Apply decay to crisis effects
                const elapsed = Date.now() - crisis.startTime;
                const decayFactor = (elapsed / 3600000) * this.config.crisisDecayRate;
                
                crisis.effects.forEach(effect => {
                    effect.decay = Math.min(decayFactor, 0.9); // Max 90% decay
                    if (effect.impact.value < 0) {
                        effect.impact.value = effect.impact.value * (1 - effect.decay);
                    }
                });
            }
        }
    }

    performDetectionChecks() {
        for (const [crisisId, crisis] of this.state.activeCrises) {
            if (crisis.orchestrator && !crisis.detected && crisis.status === 'active') {
                // Ongoing detection chance
                if (Math.random() < crisis.detectionRisk * 0.1) { // 10% of risk per check
                    this.detectCrisisOrchestration(crisisId);
                }
            }
        }
    }

    updateGlobalStability() {
        // Gradually recover global stability
        const activeCrisisCount = Array.from(this.state.activeCrises.values())
            .filter(c => c.status === 'active').length;
        
        const stabilityRecovery = 0.05 - (activeCrisisCount * 0.01); // Slower recovery with more crises
        this.state.globalStability = Math.min(1.0, this.state.globalStability + stabilityRecovery);
    }

    // Public API Methods
    getActiveCrises(playerId = null) {
        const crises = Array.from(this.state.activeCrises.values())
            .filter(crisis => crisis.status === 'active');
        
        if (playerId) {
            return crises.filter(crisis => crisis.orchestrator === playerId);
        }
        
        return crises;
    }

    getCrisisEffects() {
        const allEffects = [];
        
        for (const effects of this.state.crisisEffects.values()) {
            allEffects.push(...effects);
        }
        
        return allEffects;
    }

    getPlayerCrisisHistory(playerId) {
        return this.state.playerCrisisHistory.get(playerId) || [];
    }

    getGlobalStability() {
        return this.state.globalStability;
    }

    getSystemStatus() {
        return {
            activeCrises: this.state.activeCrises.size,
            globalStability: this.state.globalStability,
            detectionEvents: this.state.detectionEvents.size,
            naturalDisasterQueue: this.state.naturalDisasterQueue.length,
            totalOrchestrators: this.state.playerCrisisHistory.size
        };
    }
}

module.exports = CrisisOrchestrationSystem;
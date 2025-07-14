/**
 * Enhanced Cultural Evolution Engine
 * Phase 4: Advanced cultural adaptation, value system evolution,
 * cultural diffusion models, and cross-cultural interaction
 */

const EventEmitter = require('eventemitter3');

class EnhancedCulturalEvolution extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Cultural evolution parameters
            mutationRate: config.mutationRate || 0.05,
            selectionPressure: config.selectionPressure || 0.3,
            diffusionRate: config.diffusionRate || 0.2,
            culturalDrift: config.culturalDrift || 0.1,
            
            // Value system dimensions
            culturalDimensions: config.culturalDimensions || {
                'individualism_collectivism': { min: -1, max: 1, importance: 1.0 },
                'power_distance': { min: 0, max: 1, importance: 0.8 },
                'uncertainty_avoidance': { min: 0, max: 1, importance: 0.7 },
                'masculinity_femininity': { min: -1, max: 1, importance: 0.6 },
                'long_term_orientation': { min: 0, max: 1, importance: 0.9 },
                'indulgence_restraint': { min: -1, max: 1, importance: 0.5 },
                'environmental_consciousness': { min: 0, max: 1, importance: 0.8 },
                'technological_adoption': { min: 0, max: 1, importance: 0.7 },
                'economic_equality': { min: 0, max: 1, importance: 0.9 },
                'social_mobility': { min: 0, max: 1, importance: 0.8 }
            },
            
            // Cultural transmission mechanisms
            transmissionMechanisms: config.transmissionMechanisms || {
                'vertical': { weight: 0.4, generations: true },  // Parent to child
                'horizontal': { weight: 0.3, generations: false }, // Peer to peer
                'oblique': { weight: 0.3, generations: true }     // Elder to younger
            },
            
            // Cultural selection forces
            selectionForces: config.selectionForces || {
                'economic_success': 0.3,
                'social_cohesion': 0.2,
                'survival_advantage': 0.2,
                'reproductive_success': 0.1,
                'innovation_capacity': 0.2
            },
            
            ...config
        };

        // Core cultural structures
        this.agents = new Map();
        this.cultures = new Map();
        this.culturalGroups = new Map();
        this.valueSystems = new Map();
        
        // Evolution tracking
        this.culturalHistory = [];
        this.extinctCultures = new Map();
        this.emergentCultures = new Map();
        this.culturalInnovations = new Map();
        
        // Diffusion networks
        this.diffusionNetworks = new Map();
        this.culturalBridges = new Set();
        this.isolatedCultures = new Set();
        
        // Cultural dynamics
        this.culturalPressures = new Map();
        this.adaptationEvents = new Map();
        this.culturalConflicts = new Map();
        this.culturalSyntheses = new Map();
        
        // Metrics
        this.diversityMetrics = {
            culturalDiversity: 0,
            valueDiversity: 0,
            crossCulturalInteraction: 0,
            culturalStability: 0,
            adaptationRate: 0,
            innovationRate: 0
        };

        this.initializeCulturalEvolution();
    }

    initializeCulturalEvolution() {
        // Cultural evolution cycle
        this.evolutionInterval = setInterval(() => {
            this.evolveCultures();
        }, 120000); // Every 2 minutes
        
        // Value diffusion cycle
        this.diffusionInterval = setInterval(() => {
            this.diffuseCulturalValues();
        }, 60000); // Every minute
        
        // Cultural pressure assessment
        this.pressureInterval = setInterval(() => {
            this.assessCulturalPressures();
        }, 180000); // Every 3 minutes
        
        // Initialize base cultures
        this.initializeBaseCultures();
    }

    initializeBaseCultures() {
        const baseCultures = [
            {
                id: 'individualistic_progressive',
                name: 'Individualistic Progressive',
                values: {
                    individualism_collectivism: 0.8,
                    power_distance: 0.2,
                    uncertainty_avoidance: 0.3,
                    masculinity_femininity: 0.1,
                    long_term_orientation: 0.7,
                    indulgence_restraint: 0.6,
                    environmental_consciousness: 0.8,
                    technological_adoption: 0.9,
                    economic_equality: 0.6,
                    social_mobility: 0.9
                }
            },
            {
                id: 'collectivist_traditional',
                name: 'Collectivist Traditional',
                values: {
                    individualism_collectivism: -0.7,
                    power_distance: 0.8,
                    uncertainty_avoidance: 0.8,
                    masculinity_femininity: 0.4,
                    long_term_orientation: 0.9,
                    indulgence_restraint: -0.5,
                    environmental_consciousness: 0.6,
                    technological_adoption: 0.4,
                    economic_equality: 0.4,
                    social_mobility: 0.3
                }
            },
            {
                id: 'balanced_adaptive',
                name: 'Balanced Adaptive',
                values: {
                    individualism_collectivism: 0.1,
                    power_distance: 0.4,
                    uncertainty_avoidance: 0.5,
                    masculinity_femininity: -0.1,
                    long_term_orientation: 0.6,
                    indulgence_restraint: 0.2,
                    environmental_consciousness: 0.7,
                    technological_adoption: 0.7,
                    economic_equality: 0.7,
                    social_mobility: 0.6
                }
            }
        ];

        baseCultures.forEach(cultureData => {
            this.createCulture(cultureData.id, cultureData);
        });
    }

    // Agent and culture management
    registerAgent(agentId, culturalProfile = {}) {
        const agent = {
            id: agentId,
            
            // Cultural identity
            primaryCulture: culturalProfile.primaryCulture || this.assignInitialCulture(),
            culturalInfluences: new Map(),
            culturalAdaptability: culturalProfile.adaptability || Math.random(),
            
            // Value system (personal interpretation of cultural values)
            personalValues: this.generatePersonalValues(culturalProfile),
            valueFlexibility: culturalProfile.flexibility || Math.random(),
            valueStability: culturalProfile.stability || 0.5 + Math.random() * 0.5,
            
            // Cultural behavior
            culturalExpression: culturalProfile.expression || Math.random(),
            culturalConformity: culturalProfile.conformity || Math.random(),
            culturalInnovation: culturalProfile.innovation || Math.random(),
            
            // Social cultural factors
            culturalCommunity: new Set(),
            culturalMentors: new Set(),
            culturalStudents: new Set(),
            crossCulturalExposure: 0,
            
            // Evolution tracking
            culturalHistory: [],
            valueChanges: [],
            culturalMigrations: [],
            adaptationEvents: [],
            
            // Performance metrics
            culturalFitness: 0.5,
            socialIntegration: 0.5,
            culturalInnovations: 0,
            crossCulturalCompetence: 0,
            
            ...culturalProfile
        };

        this.agents.set(agentId, agent);
        
        // Add to cultural group
        this.addToCulturalGroup(agentId, agent.primaryCulture);
        
        return agent;
    }

    assignInitialCulture() {
        const cultures = Array.from(this.cultures.keys());
        if (cultures.length === 0) return null;
        
        // Weighted selection based on culture population
        const weights = cultures.map(cultureId => {
            const group = this.culturalGroups.get(cultureId);
            return group ? Math.sqrt(group.size) + 1 : 1; // Preference for larger cultures with diminishing returns
        });
        
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        const random = Math.random() * totalWeight;
        
        let cumulative = 0;
        for (let i = 0; i < cultures.length; i++) {
            cumulative += weights[i];
            if (random <= cumulative) {
                return cultures[i];
            }
        }
        
        return cultures[0];
    }

    generatePersonalValues(culturalProfile) {
        const baseCulture = this.cultures.get(culturalProfile.primaryCulture);
        const personalValues = {};
        
        if (baseCulture) {
            // Personal values are variations of cultural values
            Object.entries(baseCulture.values).forEach(([dimension, culturalValue]) => {
                const dimConfig = this.config.culturalDimensions[dimension];
                const variation = (Math.random() - 0.5) * 0.4; // ±20% variation
                
                let personalValue = culturalValue + variation;
                
                // Clamp to dimension limits
                if (dimConfig) {
                    personalValue = Math.max(dimConfig.min, Math.min(dimConfig.max, personalValue));
                }
                
                personalValues[dimension] = personalValue;
            });
        } else {
            // Generate random values if no base culture
            Object.entries(this.config.culturalDimensions).forEach(([dimension, dimConfig]) => {
                personalValues[dimension] = dimConfig.min + Math.random() * (dimConfig.max - dimConfig.min);
            });
        }
        
        return personalValues;
    }

    createCulture(cultureId, cultureData) {
        const culture = {
            id: cultureId,
            name: cultureData.name || cultureId,
            
            // Core value system
            values: { ...cultureData.values },
            valueVariance: this.calculateValueVariance(cultureData.values),
            valueCoherence: this.calculateValueCoherence(cultureData.values),
            
            // Cultural characteristics
            adaptability: cultureData.adaptability || Math.random(),
            innovativeness: cultureData.innovativeness || Math.random(),
            conservatism: cultureData.conservatism || Math.random(),
            openness: cultureData.openness || Math.random(),
            
            // Evolution state
            generation: 0,
            parentCultures: cultureData.parentCultures || [],
            mutations: [],
            adaptations: [],
            
            // Fitness metrics
            environmentalFitness: 0.5,
            socialFitness: 0.5,
            economicFitness: 0.5,
            reproductiveFitness: 0.5,
            
            // Population dynamics
            adherents: 0,
            growthRate: 0,
            migrationRate: 0,
            extinctionRisk: 0,
            
            // Cultural artifacts
            institutions: new Set(),
            practices: new Set(),
            symbols: new Set(),
            narratives: new Set(),
            
            // Temporal data
            emergenceTime: Date.now(),
            lastUpdate: Date.now(),
            
            ...cultureData
        };

        this.cultures.set(cultureId, culture);
        this.culturalGroups.set(cultureId, new Set());
        
        return culture;
    }

    addToCulturalGroup(agentId, cultureId) {
        const group = this.culturalGroups.get(cultureId);
        if (group) {
            group.add(agentId);
            
            // Update culture population
            const culture = this.cultures.get(cultureId);
            if (culture) {
                culture.adherents = group.size;
            }
        }
    }

    // Cultural evolution processes
    evolveCultures() {
        // Process each culture
        for (const [cultureId, culture] of this.cultures) {
            this.evolveIndividualCulture(cultureId, culture);
        }
        
        // Process cultural interactions
        this.processCulturalInteractions();
        
        // Handle cultural selection
        this.applyCulturalSelection();
        
        // Generate new cultures through synthesis
        this.generateSynthesisCultures();
        
        // Update diversity metrics
        this.updateDiversityMetrics();
    }

    evolveIndividualCulture(cultureId, culture) {
        const group = this.culturalGroups.get(cultureId);
        if (!group || group.size === 0) {
            this.markCultureForExtinction(cultureId);
            return;
        }
        
        // Apply mutations
        this.applyCulturalMutations(culture);
        
        // Apply selection pressures
        this.applySelectionPressures(culture);
        
        // Process internal adaptations
        this.processInternalAdaptations(culture, group);
        
        // Update fitness metrics
        this.updateCulturalFitness(culture, group);
        
        culture.generation++;
        culture.lastUpdate = Date.now();
    }

    applyCulturalMutations(culture) {
        Object.keys(culture.values).forEach(dimension => {
            if (Math.random() < this.config.mutationRate) {
                const dimConfig = this.config.culturalDimensions[dimension];
                const mutationStrength = (Math.random() - 0.5) * 0.2; // ±10% mutation
                
                let newValue = culture.values[dimension] + mutationStrength;
                
                // Clamp to dimension limits
                if (dimConfig) {
                    newValue = Math.max(dimConfig.min, Math.min(dimConfig.max, newValue));
                }
                
                culture.values[dimension] = newValue;
                culture.mutations.push({
                    dimension,
                    oldValue: culture.values[dimension],
                    newValue,
                    timestamp: Date.now(),
                    cause: 'random_mutation'
                });
            }
        });
    }

    applySelectionPressures(culture) {
        // Environmental pressures affect cultural fitness
        const pressures = this.culturalPressures.get(culture.id) || new Map();
        
        for (const [pressureType, pressureStrength] of pressures) {
            const fitnessImpact = this.calculatePressureImpact(culture, pressureType, pressureStrength);
            this.adjustCulturalValues(culture, pressureType, fitnessImpact);
        }
    }

    calculatePressureImpact(culture, pressureType, pressureStrength) {
        // Calculate how cultural values align with pressure
        let alignment = 0;
        
        switch (pressureType) {
            case 'economic_competition':
                alignment = culture.values.individualism_collectivism * 0.5 + 
                           culture.values.technological_adoption * 0.3 +
                           culture.values.economic_equality * -0.2;
                break;
            case 'environmental_crisis':
                alignment = culture.values.environmental_consciousness * 0.6 +
                           culture.values.long_term_orientation * 0.4;
                break;
            case 'social_upheaval':
                alignment = culture.values.uncertainty_avoidance * -0.4 +
                           culture.values.social_mobility * 0.6;
                break;
            case 'technological_disruption':
                alignment = culture.values.technological_adoption * 0.7 +
                           culture.values.uncertainty_avoidance * -0.3;
                break;
        }
        
        return alignment * pressureStrength;
    }

    adjustCulturalValues(culture, pressureType, impact) {
        const adjustmentStrength = Math.abs(impact) * this.config.selectionPressure;
        
        if (adjustmentStrength > 0.1) { // Significant pressure
            switch (pressureType) {
                case 'economic_competition':
                    this.adjustValue(culture, 'individualism_collectivism', impact > 0 ? 0.1 : -0.1);
                    this.adjustValue(culture, 'technological_adoption', impact > 0 ? 0.1 : -0.05);
                    break;
                case 'environmental_crisis':
                    this.adjustValue(culture, 'environmental_consciousness', impact > 0 ? 0.05 : 0.15);
                    this.adjustValue(culture, 'long_term_orientation', impact > 0 ? 0.05 : 0.1);
                    break;
                case 'social_upheaval':
                    this.adjustValue(culture, 'social_mobility', impact > 0 ? 0.05 : 0.1);
                    this.adjustValue(culture, 'power_distance', impact > 0 ? -0.05 : -0.1);
                    break;
                case 'technological_disruption':
                    this.adjustValue(culture, 'technological_adoption', impact > 0 ? 0.05 : 0.15);
                    this.adjustValue(culture, 'uncertainty_avoidance', impact > 0 ? -0.05 : -0.1);
                    break;
            }
        }
    }

    adjustValue(culture, dimension, adjustment) {
        const dimConfig = this.config.culturalDimensions[dimension];
        const newValue = culture.values[dimension] + adjustment;
        
        if (dimConfig) {
            culture.values[dimension] = Math.max(dimConfig.min, Math.min(dimConfig.max, newValue));
        }
        
        culture.adaptations.push({
            dimension,
            adjustment,
            timestamp: Date.now(),
            cause: 'selection_pressure'
        });
    }

    // Cultural diffusion
    diffuseCulturalValues() {
        // Process agent-to-agent cultural transmission
        for (const [agentId, agent] of this.agents) {
            this.processAgentCulturalTransmission(agentId, agent);
        }
        
        // Process group-level diffusion
        this.processGroupCulturalDiffusion();
        
        // Handle cultural bridges
        this.processCulturalBridges();
    }

    processAgentCulturalTransmission(agentId, agent) {
        // Find cultural transmission opportunities
        const transmissionOpportunities = this.findTransmissionOpportunities(agentId, agent);
        
        for (const opportunity of transmissionOpportunities) {
            this.executeTransmission(agent, opportunity);
        }
    }

    findTransmissionOpportunities(agentId, agent) {
        const opportunities = [];
        
        // Vertical transmission (from mentors)
        for (const mentorId of agent.culturalMentors) {
            const mentor = this.agents.get(mentorId);
            if (mentor && mentor.primaryCulture !== agent.primaryCulture) {
                opportunities.push({
                    type: 'vertical',
                    source: mentor,
                    weight: this.config.transmissionMechanisms.vertical.weight,
                    culturalDistance: this.calculateCulturalDistance(agent, mentor)
                });
            }
        }
        
        // Horizontal transmission (from peers)
        for (const peerId of agent.culturalCommunity) {
            const peer = this.agents.get(peerId);
            if (peer && peer.primaryCulture !== agent.primaryCulture) {
                opportunities.push({
                    type: 'horizontal',
                    source: peer,
                    weight: this.config.transmissionMechanisms.horizontal.weight,
                    culturalDistance: this.calculateCulturalDistance(agent, peer)
                });
            }
        }
        
        return opportunities;
    }

    executeTransmission(targetAgent, opportunity) {
        const transmissionStrength = this.calculateTransmissionStrength(targetAgent, opportunity);
        
        if (transmissionStrength > 0.1) {
            // Update personal values
            this.updatePersonalValues(targetAgent, opportunity.source, transmissionStrength);
            
            // Record cultural influence
            const influence = targetAgent.culturalInfluences.get(opportunity.source.primaryCulture) || 0;
            targetAgent.culturalInfluences.set(opportunity.source.primaryCulture, influence + transmissionStrength);
            
            // Check for cultural migration
            if (this.shouldMigrateCulture(targetAgent, opportunity.source)) {
                this.migrateCulture(targetAgent, opportunity.source.primaryCulture);
            }
        }
    }

    calculateTransmissionStrength(target, opportunity) {
        const baseProbability = opportunity.weight;
        const adaptabilityFactor = target.culturalAdaptability;
        const conformityFactor = target.culturalConformity;
        const distanceFactor = 1 / (1 + opportunity.culturalDistance); // Closer cultures transmit easier
        
        return baseProbability * adaptabilityFactor * conformityFactor * distanceFactor * this.config.diffusionRate;
    }

    updatePersonalValues(agent, sourceAgent, strength) {
        Object.keys(agent.personalValues).forEach(dimension => {
            if (sourceAgent.personalValues[dimension] !== undefined) {
                const difference = sourceAgent.personalValues[dimension] - agent.personalValues[dimension];
                const change = difference * strength * agent.valueFlexibility;
                
                agent.personalValues[dimension] += change;
                
                // Record value change
                agent.valueChanges.push({
                    dimension,
                    change,
                    source: sourceAgent.id,
                    timestamp: Date.now()
                });
            }
        });
    }

    // Cultural interactions and synthesis
    processCulturalInteractions() {
        const cultures = Array.from(this.cultures.keys());
        
        for (let i = 0; i < cultures.length; i++) {
            for (let j = i + 1; j < cultures.length; j++) {
                this.processCulturalPairInteraction(cultures[i], cultures[j]);
            }
        }
    }

    processCulturalPairInteraction(cultureId1, cultureId2) {
        const culture1 = this.cultures.get(cultureId1);
        const culture2 = this.cultures.get(cultureId2);
        
        if (!culture1 || !culture2) return;
        
        const interactionStrength = this.calculateInteractionStrength(culture1, culture2);
        
        if (interactionStrength > 0.3) {
            // Check for conflict
            if (this.detectCulturalConflict(culture1, culture2)) {
                this.processCulturalConflict(culture1, culture2);
            }
            
            // Check for synthesis opportunity
            if (this.detectSynthesisOpportunity(culture1, culture2)) {
                this.processCulturalSynthesis(culture1, culture2);
            }
            
            // Mutual influence
            this.processMutualInfluence(culture1, culture2, interactionStrength);
        }
    }

    calculateInteractionStrength(culture1, culture2) {
        const group1 = this.culturalGroups.get(culture1.id);
        const group2 = this.culturalGroups.get(culture2.id);
        
        if (!group1 || !group2) return 0;
        
        // Count cross-cultural connections
        let crossConnections = 0;
        
        for (const agentId of group1) {
            const agent = this.agents.get(agentId);
            if (agent) {
                for (const communityMember of agent.culturalCommunity) {
                    if (group2.has(communityMember)) {
                        crossConnections++;
                    }
                }
            }
        }
        
        const maxPossibleConnections = group1.size * group2.size;
        return maxPossibleConnections > 0 ? crossConnections / maxPossibleConnections : 0;
    }

    // Analytics and reporting
    getCulturalEvolutionMetrics() {
        return {
            ...this.diversityMetrics,
            cultures: {
                total: this.cultures.size,
                extinct: this.extinctCultures.size,
                emergent: this.emergentCultures.size
            },
            agents: {
                total: this.agents.size,
                culturalMigrations: this.calculateMigrationRate(),
                crossCulturalExposure: this.calculateAverageCrossCulturalExposure()
            },
            evolution: {
                generationSpread: this.calculateGenerationSpread(),
                mutationRate: this.calculateActualMutationRate(),
                adaptationEvents: this.adaptationEvents.size
            }
        };
    }

    getAgentCulturalProfile(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) return null;
        
        return {
            agentId,
            primaryCulture: agent.primaryCulture,
            personalValues: { ...agent.personalValues },
            culturalInfluences: Object.fromEntries(agent.culturalInfluences),
            
            characteristics: {
                adaptability: agent.culturalAdaptability,
                conformity: agent.culturalConformity,
                innovation: agent.culturalInnovation,
                expression: agent.culturalExpression
            },
            
            social: {
                community: Array.from(agent.culturalCommunity),
                mentors: Array.from(agent.culturalMentors),
                students: Array.from(agent.culturalStudents),
                crossCulturalExposure: agent.crossCulturalExposure
            },
            
            performance: {
                fitness: agent.culturalFitness,
                integration: agent.socialIntegration,
                innovations: agent.culturalInnovations,
                competence: agent.crossCulturalCompetence
            },
            
            history: {
                valueChanges: agent.valueChanges.slice(-10),
                migrations: agent.culturalMigrations,
                adaptations: agent.adaptationEvents.slice(-5)
            }
        };
    }

    getCultureProfile(cultureId) {
        const culture = this.cultures.get(cultureId);
        if (!culture) return null;
        
        const group = this.culturalGroups.get(cultureId);
        
        return {
            id: culture.id,
            name: culture.name,
            values: { ...culture.values },
            
            characteristics: {
                adaptability: culture.adaptability,
                innovativeness: culture.innovativeness,
                conservatism: culture.conservatism,
                openness: culture.openness
            },
            
            fitness: {
                environmental: culture.environmentalFitness,
                social: culture.socialFitness,
                economic: culture.economicFitness,
                reproductive: culture.reproductiveFitness
            },
            
            population: {
                adherents: culture.adherents,
                growthRate: culture.growthRate,
                migrationRate: culture.migrationRate,
                extinctionRisk: culture.extinctionRisk
            },
            
            evolution: {
                generation: culture.generation,
                parentCultures: culture.parentCultures,
                mutations: culture.mutations.length,
                adaptations: culture.adaptations.length
            },
            
            artifacts: {
                institutions: Array.from(culture.institutions),
                practices: Array.from(culture.practices),
                symbols: Array.from(culture.symbols),
                narratives: Array.from(culture.narratives)
            }
        };
    }

    // Utility methods placeholders
    calculateValueVariance(values) { return Math.random() * 0.5; }
    calculateValueCoherence(values) { return Math.random() * 0.8 + 0.2; }
    calculateCulturalDistance(agent1, agent2) { return Math.random(); }
    shouldMigrateCulture(agent, sourceAgent) { return Math.random() < 0.05; }
    migrateCulture(agent, newCultureId) { /* Implementation */ }
    detectCulturalConflict(culture1, culture2) { return Math.random() < 0.1; }
    detectSynthesisOpportunity(culture1, culture2) { return Math.random() < 0.05; }

    // Cleanup
    stop() {
        if (this.evolutionInterval) clearInterval(this.evolutionInterval);
        if (this.diffusionInterval) clearInterval(this.diffusionInterval);
        if (this.pressureInterval) clearInterval(this.pressureInterval);
    }
}

module.exports = EnhancedCulturalEvolution;
/**
 * Cultural Evolution System
 * Manages the evolution of cultural values and their impact on economic preferences
 */

const EventEmitter = require('eventemitter3');

class CulturalEvolutionSystem extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Cultural dimensions
            culturalDimensions: config.culturalDimensions || [
                'individualism_collectivism',
                'materialism_spiritualism',
                'traditionalism_progressivism',
                'competition_cooperation',
                'risk_tolerance',
                'environmental_concern',
                'equality_hierarchy',
                'trust_skepticism'
            ],
            
            // Evolution parameters
            evolutionRate: config.evolutionRate || 0.02, // 2% change per period
            influenceRadius: config.influenceRadius || 0.3, // How much agents influence each other
            generationLength: config.generationLength || 30, // Days per generation
            mutationRate: config.mutationRate || 0.05, // Random changes
            
            // Cultural pressure thresholds
            conformityPressure: config.conformityPressure || 0.7,
            diversityTarget: config.diversityTarget || 0.6,
            culturalInertia: config.culturalInertia || 0.8, // Resistance to change
            
            ...config
        };

        this.agents = new Map();
        this.culturalEras = [];
        this.culturalTrends = new Map();
        this.globalCulture = this.initializeGlobalCulture();
        
        this.state = {
            currentEra: 'formation',
            dominantValues: new Map(),
            culturalDiversity: 0.5,
            changeVelocity: 0,
            lastEvolution: Date.now(),
            generationCount: 0,
            culturalShifts: []
        };

        this.initializeCulturalFramework();
    }

    initializeGlobalCulture() {
        const culture = {};
        this.config.culturalDimensions.forEach(dimension => {
            culture[dimension] = 0.5; // Start neutral
        });
        return culture;
    }

    initializeCulturalFramework() {
        // Set up initial cultural era
        this.culturalEras.push({
            name: 'formation',
            startTime: Date.now(),
            dominantValues: { ...this.globalCulture },
            description: 'Initial cultural formation period'
        });
        
        // Set up cultural evolution timer
        this.evolutionInterval = setInterval(() => {
            this.evolveCulture();
        }, this.config.generationLength * 24 * 60 * 60 * 1000); // Convert days to ms
    }

    initializeCulture() {
        // Set up the foundational cultural framework
        this.emit('culture_initialized', {
            globalCulture: this.globalCulture,
            era: this.state.currentEra,
            dimensions: this.config.culturalDimensions
        });
    }

    registerAgent(agentId, culturalProfile = null) {
        const agent = {
            id: agentId,
            culturalProfile: culturalProfile || this.generateAgentCulture(),
            culturalHistory: [],
            influenceReceived: new Map(),
            influenceGiven: new Map(),
            
            // Cultural characteristics
            culturalFluidity: Math.random(), // How easily culture changes
            traditionalismScore: Math.random(),
            innovationOpenness: Math.random(),
            
            // Social influence
            culturalInfluence: 0,
            culturalResistance: Math.random(),
            
            // Economic behavior modifications
            economicPreferences: this.deriveEconomicPreferences(culturalProfile || this.generateAgentCulture()),
            
            // Cultural participation
            lastCulturalUpdate: Date.now(),
            culturalEvents: []
        };

        this.agents.set(agentId, agent);
        return agent;
    }

    generateAgentCulture() {
        const culture = {};
        
        this.config.culturalDimensions.forEach(dimension => {
            // Generate values with some variation around global culture
            const globalValue = this.globalCulture[dimension];
            const variation = (Math.random() - 0.5) * 0.4; // ±20% variation
            culture[dimension] = Math.max(0, Math.min(1, globalValue + variation));
        });
        
        return culture;
    }

    deriveEconomicPreferences(culturalProfile) {
        const preferences = {};
        
        // Map cultural dimensions to economic behaviors
        preferences.cooperationTendency = (
            culturalProfile.competition_cooperation * 0.4 +
            culturalProfile.trust_skepticism * 0.3 +
            culturalProfile.individualism_collectivism * 0.3
        );
        
        preferences.riskTolerance = (
            culturalProfile.risk_tolerance * 0.6 +
            culturalProfile.traditionalism_progressivism * 0.4
        );
        
        preferences.materialismFocus = (
            culturalProfile.materialism_spiritualism * 0.7 +
            (1 - culturalProfile.environmental_concern) * 0.3
        );
        
        preferences.hierarchyAcceptance = (
            (1 - culturalProfile.equality_hierarchy) * 0.6 +
            culturalProfile.traditionalism_progressivism * 0.4
        );
        
        preferences.innovationSeekingBehavior = (
            culturalProfile.traditionalism_progressivism * 0.5 +
            culturalProfile.risk_tolerance * 0.3 +
            (1 - culturalProfile.traditionalismScore || 0.5) * 0.2
        );
        
        return preferences;
    }

    // Core cultural evolution mechanics
    evolveCulture() {
        this.state.generationCount++;
        
        // Process agent cultural interactions
        this.processCulturalInteractions();
        
        // Calculate cultural trends
        this.calculateCulturalTrends();
        
        // Update global culture
        this.updateGlobalCulture();
        
        // Check for cultural shifts
        this.detectCulturalShifts();
        
        // Calculate cultural diversity
        this.calculateCulturalDiversity();
        
        // Check for era transitions
        this.checkEraTransition();
        
        this.state.lastEvolution = Date.now();
        
        this.emit('culture_evolved', {
            generation: this.state.generationCount,
            globalCulture: this.globalCulture,
            diversity: this.state.culturalDiversity,
            changeVelocity: this.state.changeVelocity
        });
    }

    processCulturalInteractions() {
        const agents = Array.from(this.agents.values());
        
        // Process cultural influence between agents
        agents.forEach(agent => {
            const influencers = this.getInfluencingAgents(agent, agents);
            this.applyCulturalInfluence(agent, influencers);
        });
        
        // Apply random mutations
        this.applyRandomMutations();
    }

    getInfluencingAgents(targetAgent, allAgents) {
        // In a full implementation, this would use the social network
        // For now, select random agents as influencers
        const influencerCount = Math.floor(Math.random() * 5) + 1;
        const shuffled = allAgents.filter(a => a.id !== targetAgent.id).sort(() => Math.random() - 0.5);
        return shuffled.slice(0, influencerCount);
    }

    applyCulturalInfluence(targetAgent, influencers) {
        if (influencers.length === 0) return;
        
        const influenceStrength = this.config.influenceRadius * (1 - targetAgent.culturalResistance);
        
        this.config.culturalDimensions.forEach(dimension => {
            let totalInfluence = 0;
            let influenceWeight = 0;
            
            influencers.forEach(influencer => {
                const culturalDistance = Math.abs(
                    targetAgent.culturalProfile[dimension] - influencer.culturalProfile[dimension]
                );
                
                // Closer cultures have more influence
                const proximityFactor = 1 - culturalDistance;
                const weight = proximityFactor * (influencer.culturalInfluence || 1);
                
                totalInfluence += influencer.culturalProfile[dimension] * weight;
                influenceWeight += weight;
            });
            
            if (influenceWeight > 0) {
                const averageInfluencerValue = totalInfluence / influenceWeight;
                const currentValue = targetAgent.culturalProfile[dimension];
                
                // Move toward average influencer value
                const changeAmount = (averageInfluencerValue - currentValue) * influenceStrength;
                const newValue = currentValue + changeAmount;
                
                targetAgent.culturalProfile[dimension] = Math.max(0, Math.min(1, newValue));
                
                // Record cultural change
                if (Math.abs(changeAmount) > 0.01) {
                    targetAgent.culturalHistory.push({
                        dimension,
                        oldValue: currentValue,
                        newValue: targetAgent.culturalProfile[dimension],
                        change: changeAmount,
                        timestamp: Date.now(),
                        source: 'social_influence'
                    });
                }
            }
        });
        
        // Update economic preferences based on new culture
        targetAgent.economicPreferences = this.deriveEconomicPreferences(targetAgent.culturalProfile);
        targetAgent.lastCulturalUpdate = Date.now();
    }

    applyRandomMutations() {
        for (const agent of this.agents.values()) {
            if (Math.random() < this.config.mutationRate) {
                this.mutateCulture(agent);
            }
        }
    }

    mutateCulture(agent) {
        const dimensionToMutate = this.config.culturalDimensions[
            Math.floor(Math.random() * this.config.culturalDimensions.length)
        ];
        
        const mutationSize = (Math.random() - 0.5) * 0.2; // ±10% mutation
        const oldValue = agent.culturalProfile[dimensionToMutate];
        const newValue = Math.max(0, Math.min(1, oldValue + mutationSize));
        
        agent.culturalProfile[dimensionToMutate] = newValue;
        
        agent.culturalHistory.push({
            dimension: dimensionToMutate,
            oldValue,
            newValue,
            change: mutationSize,
            timestamp: Date.now(),
            source: 'random_mutation'
        });
        
        // Update economic preferences
        agent.economicPreferences = this.deriveEconomicPreferences(agent.culturalProfile);
    }

    calculateCulturalTrends() {
        const newTrends = new Map();
        
        this.config.culturalDimensions.forEach(dimension => {
            const values = Array.from(this.agents.values())
                .map(agent => agent.culturalProfile[dimension]);
            
            if (values.length > 0) {
                const average = values.reduce((sum, val) => sum + val, 0) / values.length;
                const oldTrend = this.culturalTrends.get(dimension) || { value: 0.5, velocity: 0 };
                const velocity = average - oldTrend.value;
                
                newTrends.set(dimension, {
                    value: average,
                    velocity,
                    direction: velocity > 0.01 ? 'increasing' : velocity < -0.01 ? 'decreasing' : 'stable'
                });
            }
        });
        
        this.culturalTrends = newTrends;
        
        // Calculate overall change velocity
        const totalVelocity = Array.from(newTrends.values())
            .reduce((sum, trend) => sum + Math.abs(trend.velocity), 0);
        this.state.changeVelocity = totalVelocity / newTrends.size;
    }

    updateGlobalCulture() {
        // Update global culture based on agent averages
        this.config.culturalDimensions.forEach(dimension => {
            const trend = this.culturalTrends.get(dimension);
            if (trend) {
                const inertiaFactor = this.config.culturalInertia;
                const change = trend.velocity * (1 - inertiaFactor);
                this.globalCulture[dimension] = Math.max(0, Math.min(1, 
                    this.globalCulture[dimension] + change
                ));
            }
        });
        
        // Update dominant values
        this.updateDominantValues();
    }

    updateDominantValues() {
        this.state.dominantValues.clear();
        
        for (const [dimension, value] of Object.entries(this.globalCulture)) {
            let dominantValue;
            if (value > 0.7) {
                dominantValue = this.getHighValueLabel(dimension);
            } else if (value < 0.3) {
                dominantValue = this.getLowValueLabel(dimension);
            } else {
                dominantValue = 'balanced';
            }
            
            this.state.dominantValues.set(dimension, dominantValue);
        }
    }

    getHighValueLabel(dimension) {
        const labels = {
            'individualism_collectivism': 'collectivist',
            'materialism_spiritualism': 'spiritual',
            'traditionalism_progressivism': 'progressive',
            'competition_cooperation': 'cooperative',
            'risk_tolerance': 'risk_taking',
            'environmental_concern': 'environmentalist',
            'equality_hierarchy': 'egalitarian',
            'trust_skepticism': 'trusting'
        };
        return labels[dimension] || 'high';
    }

    getLowValueLabel(dimension) {
        const labels = {
            'individualism_collectivism': 'individualist',
            'materialism_spiritualism': 'materialist',
            'traditionalism_progressivism': 'traditionalist',
            'competition_cooperation': 'competitive',
            'risk_tolerance': 'risk_averse',
            'environmental_concern': 'growth_focused',
            'equality_hierarchy': 'hierarchical',
            'trust_skepticism': 'skeptical'
        };
        return labels[dimension] || 'low';
    }

    detectCulturalShifts() {
        const significantShifts = [];
        
        for (const [dimension, trend] of this.culturalTrends) {
            if (Math.abs(trend.velocity) > 0.05) { // 5% change threshold
                const shift = {
                    dimension,
                    direction: trend.direction,
                    magnitude: Math.abs(trend.velocity),
                    newValue: trend.value,
                    timestamp: Date.now()
                };
                
                significantShifts.push(shift);
            }
        }
        
        if (significantShifts.length > 0) {
            this.state.culturalShifts.push(...significantShifts);
            
            significantShifts.forEach(shift => {
                this.emit('cultural_shift', {
                    type: this.categorizeCulturalShift(shift),
                    shiftType: `${shift.dimension}_${shift.direction}`,
                    dimension: shift.dimension,
                    direction: shift.direction,
                    magnitude: shift.magnitude,
                    affectedAgents: this.getAffectedAgentsByShift(shift)
                });
            });
        }
    }

    categorizeCulturalShift(shift) {
        if (shift.magnitude > 0.1) return 'major_shift';
        if (shift.magnitude > 0.05) return 'moderate_shift';
        return 'minor_shift';
    }

    getAffectedAgentsByShift(shift) {
        // Return agents whose culture aligns with the shift
        return Array.from(this.agents.keys()).filter(agentId => {
            const agent = this.agents.get(agentId);
            const agentValue = agent.culturalProfile[shift.dimension];
            
            if (shift.direction === 'increasing') {
                return agentValue > 0.5;
            } else {
                return agentValue < 0.5;
            }
        });
    }

    calculateCulturalDiversity() {
        const agents = Array.from(this.agents.values());
        if (agents.length < 2) {
            this.state.culturalDiversity = 0;
            return;
        }
        
        let totalDistance = 0;
        let comparisons = 0;
        
        for (let i = 0; i < agents.length; i++) {
            for (let j = i + 1; j < agents.length; j++) {
                const distance = this.calculateCulturalDistance(
                    agents[i].culturalProfile,
                    agents[j].culturalProfile
                );
                totalDistance += distance;
                comparisons++;
            }
        }
        
        this.state.culturalDiversity = comparisons > 0 ? totalDistance / comparisons : 0;
    }

    calculateCulturalDistance(profile1, profile2) {
        let totalDistance = 0;
        
        this.config.culturalDimensions.forEach(dimension => {
            const distance = Math.abs(profile1[dimension] - profile2[dimension]);
            totalDistance += distance;
        });
        
        return totalDistance / this.config.culturalDimensions.length;
    }

    calculateCulturalSimilarity(profile1, profile2) {
        return 1 - this.calculateCulturalDistance(profile1, profile2);
    }

    checkEraTransition() {
        const currentEra = this.culturalEras[this.culturalEras.length - 1];
        const eraAge = Date.now() - currentEra.startTime;
        const eraAgeInGenerations = eraAge / (this.config.generationLength * 24 * 60 * 60 * 1000);
        
        // Check for era transition conditions
        const shouldTransition = 
            eraAgeInGenerations > 10 || // Era lasted 10+ generations
            this.state.changeVelocity > 0.15 || // Rapid cultural change
            this.hasRevolutionaryCulturalChange();
        
        if (shouldTransition) {
            this.transitionToNewEra();
        }
    }

    hasRevolutionaryCulturalChange() {
        // Check if any dimension has changed dramatically
        const currentEra = this.culturalEras[this.culturalEras.length - 1];
        
        for (const dimension of this.config.culturalDimensions) {
            const eraValue = currentEra.dominantValues[dimension];
            const currentValue = this.globalCulture[dimension];
            
            if (Math.abs(currentValue - eraValue) > 0.3) {
                return true;
            }
        }
        return false;
    }

    transitionToNewEra() {
        const newEraName = this.generateEraName();
        const currentEra = this.culturalEras[this.culturalEras.length - 1];
        
        // End current era
        currentEra.endTime = Date.now();
        
        // Start new era
        const newEra = {
            name: newEraName,
            startTime: Date.now(),
            dominantValues: { ...this.globalCulture },
            description: this.generateEraDescription(newEraName),
            previousEra: currentEra.name
        };
        
        this.culturalEras.push(newEra);
        this.state.currentEra = newEraName;
        
        this.emit('cultural_era_transition', {
            oldEra: currentEra.name,
            newEra: newEraName,
            dominantValues: Object.fromEntries(this.state.dominantValues),
            culturalChanges: this.summarizeCulturalChanges(currentEra, newEra)
        });
    }

    generateEraName() {
        const dominantTraits = Array.from(this.state.dominantValues.entries())
            .filter(([_, value]) => value !== 'balanced')
            .map(([_, value]) => value);
        
        if (dominantTraits.length === 0) return 'balanced';
        
        const eraNames = {
            'materialist': 'Material Age',
            'spiritual': 'Spiritual Renaissance',
            'progressive': 'Progressive Era',
            'traditionalist': 'Traditional Revival',
            'cooperative': 'Cooperation Age',
            'competitive': 'Competition Era',
            'environmentalist': 'Green Revolution',
            'egalitarian': 'Equality Movement',
            'hierarchical': 'Hierarchical Period'
        };
        
        const primaryTrait = dominantTraits[0];
        return eraNames[primaryTrait] || `${primaryTrait} Era`;
    }

    generateEraDescription(eraName) {
        return `Cultural era characterized by ${eraName.toLowerCase()} values and beliefs`;
    }

    summarizeCulturalChanges(oldEra, newEra) {
        const changes = {};
        
        this.config.culturalDimensions.forEach(dimension => {
            const oldValue = oldEra.dominantValues[dimension];
            const newValue = newEra.dominantValues[dimension];
            const change = newValue - oldValue;
            
            if (Math.abs(change) > 0.1) {
                changes[dimension] = {
                    change,
                    direction: change > 0 ? 'increased' : 'decreased',
                    magnitude: Math.abs(change)
                };
            }
        });
        
        return changes;
    }

    // Special events
    recordPhilanthropicAct(agentId, amount, cause) {
        const agent = this.agents.get(agentId);
        if (!agent) return;
        
        // Philanthropic acts influence cultural values
        const culturalImpact = Math.min(0.05, amount / 100000); // Max 5% impact
        
        // Increase spiritual/cooperative values
        agent.culturalProfile.materialism_spiritualism = Math.min(1, 
            agent.culturalProfile.materialism_spiritualism + culturalImpact
        );
        agent.culturalProfile.competition_cooperation = Math.min(1,
            agent.culturalProfile.competition_cooperation + culturalImpact
        );
        
        // Record cultural event
        agent.culturalEvents.push({
            type: 'philanthropy',
            impact: culturalImpact,
            cause,
            amount,
            timestamp: Date.now()
        });
        
        // Update economic preferences
        agent.economicPreferences = this.deriveEconomicPreferences(agent.culturalProfile);
    }

    triggerRevolutionaryCulturalShift() {
        // Revolutionary events cause dramatic cultural changes
        const revolutionaryChanges = {
            'equality_hierarchy': 0.3, // Strong shift toward equality
            'individualism_collectivism': 0.2, // Shift toward collectivism
            'competition_cooperation': 0.25, // Shift toward cooperation
            'trust_skepticism': -0.15 // Increase skepticism of authority
        };
        
        for (const agent of this.agents.values()) {
            Object.entries(revolutionaryChanges).forEach(([dimension, change]) => {
                const oldValue = agent.culturalProfile[dimension];
                const newValue = Math.max(0, Math.min(1, oldValue + change));
                
                agent.culturalProfile[dimension] = newValue;
                agent.culturalHistory.push({
                    dimension,
                    oldValue,
                    newValue,
                    change,
                    timestamp: Date.now(),
                    source: 'revolutionary_event'
                });
            });
            
            agent.economicPreferences = this.deriveEconomicPreferences(agent.culturalProfile);
        }
        
        this.emit('revolutionary_cultural_shift', {
            changes: revolutionaryChanges,
            affectedAgents: this.agents.size,
            timestamp: Date.now()
        });
    }

    // Agent cultural analysis
    isAgentAffectedByCulturalShift(agentId, culturalData) {
        const agent = this.agents.get(agentId);
        if (!agent) return false;
        
        const agentValue = agent.culturalProfile[culturalData.dimension];
        const globalValue = this.globalCulture[culturalData.dimension];
        
        // Agent is affected if their values align with the shift direction
        const culturalAlignment = Math.abs(agentValue - globalValue);
        return culturalAlignment < 0.3; // Within 30% of global value
    }

    // Analytics and reporting
    getCulturalStatistics() {
        return {
            currentEra: this.state.currentEra,
            generationCount: this.state.generationCount,
            culturalDiversity: this.state.culturalDiversity,
            changeVelocity: this.state.changeVelocity,
            
            globalCulture: this.globalCulture,
            dominantValues: Object.fromEntries(this.state.dominantValues),
            culturalTrends: this.formatCulturalTrends(),
            
            recentShifts: this.state.culturalShifts.slice(-10),
            erasHistory: this.culturalEras.slice(-5),
            
            culturalDimensionStats: this.analyzeCulturalDimensions()
        };
    }

    formatCulturalTrends() {
        const trends = {};
        for (const [dimension, trend] of this.culturalTrends) {
            trends[dimension] = {
                value: trend.value,
                direction: trend.direction,
                velocity: trend.velocity
            };
        }
        return trends;
    }

    analyzeCulturalDimensions() {
        const stats = {};
        
        this.config.culturalDimensions.forEach(dimension => {
            const values = Array.from(this.agents.values())
                .map(agent => agent.culturalProfile[dimension]);
            
            if (values.length > 0) {
                const sorted = values.sort((a, b) => a - b);
                stats[dimension] = {
                    mean: values.reduce((sum, val) => sum + val, 0) / values.length,
                    median: sorted[Math.floor(sorted.length / 2)],
                    min: sorted[0],
                    max: sorted[sorted.length - 1],
                    standardDeviation: this.calculateStandardDeviation(values)
                };
            }
        });
        
        return stats;
    }

    calculateStandardDeviation(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDifferences = values.map(val => Math.pow(val - mean, 2));
        const variance = squaredDifferences.reduce((sum, val) => sum + val, 0) / values.length;
        return Math.sqrt(variance);
    }

    getAgentCulturalProfile(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) return null;
        
        return {
            agentId,
            culturalProfile: { ...agent.culturalProfile },
            economicPreferences: { ...agent.economicPreferences },
            culturalHistory: agent.culturalHistory.slice(-20),
            culturalEvents: agent.culturalEvents.slice(-10),
            
            culturalAlignment: this.calculateCulturalAlignment(agent),
            culturalInfluence: agent.culturalInfluence,
            culturalFluidity: agent.culturalFluidity,
            
            distanceFromGlobal: this.calculateCulturalDistance(
                agent.culturalProfile, 
                this.globalCulture
            )
        };
    }

    calculateCulturalAlignment(agent) {
        const alignment = {};
        
        this.config.culturalDimensions.forEach(dimension => {
            const agentValue = agent.culturalProfile[dimension];
            const globalValue = this.globalCulture[dimension];
            alignment[dimension] = 1 - Math.abs(agentValue - globalValue);
        });
        
        return alignment;
    }

    // Cleanup
    stop() {
        if (this.evolutionInterval) {
            clearInterval(this.evolutionInterval);
        }
    }
}

module.exports = CulturalEvolutionSystem;
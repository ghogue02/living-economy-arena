/**
 * Collective Behavior Engine
 * Handles emergent group behaviors, crowd psychology, and mass coordination
 */

const EventEmitter = require('eventemitter3');

class CollectiveBehaviorEngine extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Crowd psychology parameters
            conformityThreshold: config.conformityThreshold || 0.6, // 60% threshold for mass adoption
            influenceRadius: config.influenceRadius || 50, // How many agents can influence each other
            memoryLength: config.memoryLength || 168, // Hours to remember behaviors
            
            // Emergent behavior types
            behaviorTypes: config.behaviorTypes || [
                'market_panic',
                'speculation_bubble',
                'social_movement',
                'economic_boycott',
                'innovation_adoption',
                'political_mobilization',
                'resource_hoarding',
                'cooperation_wave'
            ],
            
            // Contagion parameters
            contagionRate: config.contagionRate || 0.15,
            resistanceDecay: config.resistanceDecay || 0.05,
            influenceStrength: config.influenceStrength || 1.0,
            
            ...config
        };

        this.agents = new Map();
        this.behaviorClusters = new Map();
        this.emergentBehaviors = new Map();
        this.socialMoods = new Map();
        
        this.state = {
            currentMood: 'neutral',
            dominantBehavior: null,
            contagionLevel: 0,
            collectiveIntelligence: 50,
            socialCohesion: 50,
            lastBehaviorCascade: 0
        };

        this.initializeBehaviorTracking();
    }

    initializeBehaviorTracking() {
        // Set up behavior processing timer
        this.behaviorInterval = setInterval(() => {
            this.processBehaviorContagion();
            this.updateSocialMoods();
            this.detectEmergentBehaviors();
        }, 60000); // Every minute
    }

    registerAgent(agentId, agentData = {}) {
        const agent = {
            id: agentId,
            currentBehaviors: new Set(),
            behaviorHistory: [],
            influenceReceived: new Map(),
            influenceGiven: new Map(),
            
            // Psychological traits affecting collective behavior
            conformityTendency: agentData.conformityTendency || Math.random(),
            influenceResistance: agentData.influenceResistance || Math.random(),
            leadershipPotential: agentData.leadershipPotential || Math.random(),
            
            // Social position
            networkPosition: agentData.networkPosition || 'peripheral', // central, intermediate, peripheral
            socialConnections: new Set(),
            reputationInfluence: agentData.reputation || 50,
            
            // Behavior state
            lastBehaviorChange: Date.now(),
            behaviorIntensity: 0,
            resistanceLevel: 1.0,
            
            // Group memberships affecting behavior
            organizationMemberships: agentData.organizationMemberships || new Set(),
            socialClass: agentData.socialClass || 'middle',
            
            ...agentData
        };

        this.agents.set(agentId, agent);
        return agent;
    }

    // Core behavior contagion mechanics
    processBehaviorContagion() {
        const activeAgents = Array.from(this.agents.values());
        
        // Process each active behavior
        for (const [behaviorType, behavior] of this.emergentBehaviors) {
            this.propagateBehavior(behaviorType, behavior, activeAgents);
        }
        
        // Update behavior intensities
        this.updateBehaviorIntensities();
        
        // Detect behavior cascades
        this.detectBehaviorCascades();
    }

    propagateBehavior(behaviorType, behavior, agentPool) {
        const affectedAgents = [];
        
        // Find agents currently exhibiting this behavior
        const behaviorCarriers = agentPool.filter(agent => 
            agent.currentBehaviors.has(behaviorType)
        );
        
        if (behaviorCarriers.length === 0) return;
        
        // Propagate to connected agents
        agentPool.forEach(targetAgent => {
            if (!targetAgent.currentBehaviors.has(behaviorType)) {
                const influenceStrength = this.calculateInfluenceStrength(
                    behaviorCarriers, 
                    targetAgent, 
                    behaviorType
                );
                
                if (this.shouldAdoptBehavior(targetAgent, behaviorType, influenceStrength)) {
                    this.adoptBehavior(targetAgent.id, behaviorType, influenceStrength);
                    affectedAgents.push(targetAgent.id);
                }
            }
        });
        
        // Update behavior statistics
        behavior.spreadCount = behaviorCarriers.length;
        behavior.newAdoptions = affectedAgents.length;
        behavior.totalReach += affectedAgents.length;
        
        if (affectedAgents.length > 0) {
            this.emit('behavior_spread', {
                behaviorType,
                carriers: behaviorCarriers.length,
                newAdoptions: affectedAgents.length,
                affectedAgents
            });
        }
    }

    calculateInfluenceStrength(carriers, targetAgent, behaviorType) {
        let totalInfluence = 0;
        
        carriers.forEach(carrier => {
            // Base influence from behavior intensity
            let influence = carrier.behaviorIntensity;
            
            // Reputation/status multiplier
            const statusMultiplier = (carrier.reputationInfluence / 50);
            influence *= statusMultiplier;
            
            // Network position multiplier
            const networkMultiplier = this.getNetworkPositionMultiplier(carrier.networkPosition);
            influence *= networkMultiplier;
            
            // Social connection bonus
            if (targetAgent.socialConnections.has(carrier.id)) {
                influence *= 1.5; // 50% bonus for direct connections
            }
            
            // Same social class bonus
            if (targetAgent.socialClass === carrier.socialClass) {
                influence *= 1.2; // 20% bonus for same class
            }
            
            // Organization membership bonus
            const sharedOrgs = this.getSharedOrganizations(targetAgent, carrier);
            influence *= (1 + sharedOrgs.length * 0.1);
            
            totalInfluence += influence;
        });
        
        // Diminishing returns for multiple carriers
        return totalInfluence / (1 + Math.log(carriers.length));
    }

    getNetworkPositionMultiplier(position) {
        const multipliers = {
            'central': 2.0,
            'intermediate': 1.3,
            'peripheral': 0.8
        };
        return multipliers[position] || 1.0;
    }

    getSharedOrganizations(agent1, agent2) {
        const shared = [];
        for (const org of agent1.organizationMemberships) {
            if (agent2.organizationMemberships.has(org)) {
                shared.push(org);
            }
        }
        return shared;
    }

    shouldAdoptBehavior(agent, behaviorType, influenceStrength) {
        // Calculate adoption probability
        const baseAdoptionRate = this.config.contagionRate;
        const conformityFactor = agent.conformityTendency;
        const resistanceFactor = agent.resistanceLevel * agent.influenceResistance;
        
        // Behavior-specific factors
        const behaviorFactor = this.getBehaviorSpecificFactor(agent, behaviorType);
        
        const adoptionProbability = (baseAdoptionRate * conformityFactor * influenceStrength * behaviorFactor) / resistanceFactor;
        
        return Math.random() < Math.min(0.9, adoptionProbability);
    }

    getBehaviorSpecificFactor(agent, behaviorType) {
        // Different agents are more susceptible to different behaviors
        const factorMap = {
            'market_panic': agent.socialClass === 'working' ? 1.3 : 0.8,
            'speculation_bubble': agent.socialClass === 'upper' ? 1.4 : 0.7,
            'social_movement': 1.0 + (1 - agent.influenceResistance) * 0.5,
            'economic_boycott': agent.reputationInfluence > 60 ? 1.2 : 0.9,
            'innovation_adoption': agent.leadershipPotential > 0.7 ? 1.5 : 0.8,
            'political_mobilization': 1.0 + (agent.conformityTendency * 0.3),
            'resource_hoarding': agent.socialClass === 'working' ? 1.4 : 0.6,
            'cooperation_wave': 1.0 + (agent.reputationInfluence / 100)
        };
        
        return factorMap[behaviorType] || 1.0;
    }

    adoptBehavior(agentId, behaviorType, influenceStrength) {
        const agent = this.agents.get(agentId);
        if (!agent) return false;
        
        agent.currentBehaviors.add(behaviorType);
        agent.behaviorIntensity = Math.min(1.0, influenceStrength);
        agent.lastBehaviorChange = Date.now();
        
        // Record behavior adoption
        agent.behaviorHistory.push({
            behaviorType,
            action: 'adopted',
            timestamp: Date.now(),
            intensity: agent.behaviorIntensity,
            influenceSource: 'contagion'
        });
        
        // Update resistance (adopting behavior reduces resistance temporarily)
        agent.resistanceLevel = Math.max(0.1, agent.resistanceLevel - this.config.resistanceDecay);
        
        // Add to behavior cluster
        this.addToBehaviorCluster(agentId, behaviorType);
        
        this.emit('behavior_adopted', {
            agentId,
            behaviorType,
            intensity: agent.behaviorIntensity
        });
        
        return true;
    }

    // Emergent behavior detection
    detectEmergentBehaviors() {
        const behaviorCounts = new Map();
        const totalAgents = this.agents.size;
        
        if (totalAgents === 0) return;
        
        // Count current behaviors
        for (const agent of this.agents.values()) {
            for (const behavior of agent.currentBehaviors) {
                behaviorCounts.set(behavior, (behaviorCounts.get(behavior) || 0) + 1);
            }
        }
        
        // Detect emergent behaviors (behaviors reaching critical mass)
        for (const [behaviorType, count] of behaviorCounts) {
            const penetration = count / totalAgents;
            
            if (penetration >= this.config.conformityThreshold) {
                if (!this.emergentBehaviors.has(behaviorType)) {
                    this.createEmergentBehavior(behaviorType, count, penetration);
                } else {
                    this.updateEmergentBehavior(behaviorType, count, penetration);
                }
            }
        }
        
        // Remove behaviors that have fallen below threshold
        for (const [behaviorType, behavior] of this.emergentBehaviors) {
            const currentCount = behaviorCounts.get(behaviorType) || 0;
            const currentPenetration = currentCount / totalAgents;
            
            if (currentPenetration < this.config.conformityThreshold * 0.5) {
                this.dissolveEmergentBehavior(behaviorType);
            }
        }
    }

    createEmergentBehavior(behaviorType, count, penetration) {
        const behavior = {
            type: behaviorType,
            startTime: Date.now(),
            peakPenetration: penetration,
            currentPenetration: penetration,
            participantCount: count,
            spreadCount: count,
            totalReach: count,
            newAdoptions: 0,
            duration: 0,
            intensity: this.calculateBehaviorIntensity(behaviorType, penetration),
            economicImpact: 0,
            socialImpact: 0
        };
        
        this.emergentBehaviors.set(behaviorType, behavior);
        this.state.dominantBehavior = behaviorType;
        
        // Calculate economic and social impacts
        this.calculateBehaviorImpacts(behavior);
        
        this.emit('emergent_behavior_detected', {
            behaviorType,
            penetration,
            participantCount: count,
            intensity: behavior.intensity,
            economicImpact: behavior.economicImpact
        });
    }

    updateEmergentBehavior(behaviorType, count, penetration) {
        const behavior = this.emergentBehaviors.get(behaviorType);
        if (!behavior) return;
        
        behavior.currentPenetration = penetration;
        behavior.participantCount = count;
        behavior.duration = Date.now() - behavior.startTime;
        behavior.peakPenetration = Math.max(behavior.peakPenetration, penetration);
        behavior.intensity = this.calculateBehaviorIntensity(behaviorType, penetration);
        
        this.calculateBehaviorImpacts(behavior);
    }

    calculateBehaviorIntensity(behaviorType, penetration) {
        // Intensity increases with penetration and behavior-specific factors
        const baseIntensity = Math.min(1.0, penetration * 2);
        const behaviorMultiplier = this.getBehaviorIntensityMultiplier(behaviorType);
        
        return baseIntensity * behaviorMultiplier;
    }

    getBehaviorIntensityMultiplier(behaviorType) {
        const multipliers = {
            'market_panic': 2.0,
            'speculation_bubble': 1.8,
            'social_movement': 1.5,
            'economic_boycott': 1.3,
            'innovation_adoption': 1.2,
            'political_mobilization': 1.7,
            'resource_hoarding': 1.6,
            'cooperation_wave': 1.1
        };
        
        return multipliers[behaviorType] || 1.0;
    }

    calculateBehaviorImpacts(behavior) {
        const participantRatio = behavior.participantCount / this.agents.size;
        const intensityFactor = behavior.intensity;
        
        // Economic impact calculation
        behavior.economicImpact = this.calculateEconomicImpact(behavior.type, participantRatio, intensityFactor);
        
        // Social impact calculation
        behavior.socialImpact = this.calculateSocialImpact(behavior.type, participantRatio, intensityFactor);
    }

    calculateEconomicImpact(behaviorType, participantRatio, intensity) {
        const baseImpacts = {
            'market_panic': -50 * participantRatio * intensity,
            'speculation_bubble': 30 * participantRatio * intensity,
            'social_movement': -10 * participantRatio * intensity,
            'economic_boycott': -25 * participantRatio * intensity,
            'innovation_adoption': 20 * participantRatio * intensity,
            'political_mobilization': -5 * participantRatio * intensity,
            'resource_hoarding': -15 * participantRatio * intensity,
            'cooperation_wave': 15 * participantRatio * intensity
        };
        
        return baseImpacts[behaviorType] || 0;
    }

    calculateSocialImpact(behaviorType, participantRatio, intensity) {
        const baseImpacts = {
            'market_panic': -30 * participantRatio * intensity,
            'speculation_bubble': -10 * participantRatio * intensity,
            'social_movement': 20 * participantRatio * intensity,
            'economic_boycott': 15 * participantRatio * intensity,
            'innovation_adoption': 10 * participantRatio * intensity,
            'political_mobilization': 25 * participantRatio * intensity,
            'resource_hoarding': -20 * participantRatio * intensity,
            'cooperation_wave': 30 * participantRatio * intensity
        };
        
        return baseImpacts[behaviorType] || 0;
    }

    dissolveEmergentBehavior(behaviorType) {
        const behavior = this.emergentBehaviors.get(behaviorType);
        if (!behavior) return;
        
        behavior.endTime = Date.now();
        behavior.totalDuration = behavior.endTime - behavior.startTime;
        
        this.emit('emergent_behavior_dissolved', {
            behaviorType,
            duration: behavior.totalDuration,
            peakPenetration: behavior.peakPenetration,
            totalReach: behavior.totalReach
        });
        
        this.emergentBehaviors.delete(behaviorType);
        
        // Update dominant behavior
        this.updateDominantBehavior();
    }

    updateDominantBehavior() {
        let maxPenetration = 0;
        let dominantBehavior = null;
        
        for (const [behaviorType, behavior] of this.emergentBehaviors) {
            if (behavior.currentPenetration > maxPenetration) {
                maxPenetration = behavior.currentPenetration;
                dominantBehavior = behaviorType;
            }
        }
        
        this.state.dominantBehavior = dominantBehavior;
    }

    // Social mood tracking
    updateSocialMoods() {
        const moodFactors = this.calculateMoodFactors();
        const newMood = this.determineSocialMood(moodFactors);
        
        if (newMood !== this.state.currentMood) {
            const oldMood = this.state.currentMood;
            this.state.currentMood = newMood;
            
            this.emit('social_mood_change', {
                oldMood,
                newMood,
                factors: moodFactors
            });
        }
    }

    calculateMoodFactors() {
        const factors = {
            optimism: 0,
            fear: 0,
            anger: 0,
            cooperation: 0,
            uncertainty: 0
        };
        
        // Analyze current behaviors for mood indicators
        for (const [behaviorType, behavior] of this.emergentBehaviors) {
            const intensity = behavior.intensity;
            
            switch (behaviorType) {
                case 'market_panic':
                    factors.fear += intensity * 0.8;
                    factors.uncertainty += intensity * 0.6;
                    break;
                case 'speculation_bubble':
                    factors.optimism += intensity * 0.7;
                    factors.uncertainty += intensity * 0.3;
                    break;
                case 'social_movement':
                    factors.anger += intensity * 0.5;
                    factors.cooperation += intensity * 0.4;
                    break;
                case 'cooperation_wave':
                    factors.cooperation += intensity * 0.9;
                    factors.optimism += intensity * 0.3;
                    break;
                case 'resource_hoarding':
                    factors.fear += intensity * 0.6;
                    factors.uncertainty += intensity * 0.7;
                    break;
            }
        }
        
        // Normalize factors
        const maxFactor = Math.max(...Object.values(factors));
        if (maxFactor > 0) {
            Object.keys(factors).forEach(key => {
                factors[key] = factors[key] / maxFactor;
            });
        }
        
        return factors;
    }

    determineSocialMood(factors) {
        const threshold = 0.6;
        
        if (factors.fear > threshold) return 'fearful';
        if (factors.anger > threshold) return 'angry';
        if (factors.optimism > threshold) return 'optimistic';
        if (factors.cooperation > threshold) return 'cooperative';
        if (factors.uncertainty > threshold) return 'uncertain';
        
        return 'neutral';
    }

    // Behavior cascades detection
    detectBehaviorCascades() {
        const now = Date.now();
        const recentAdoptions = new Map();
        
        // Count recent behavior adoptions
        for (const agent of this.agents.values()) {
            const recentBehaviors = agent.behaviorHistory.filter(event => 
                now - event.timestamp < 3600000 && // Last hour
                event.action === 'adopted'
            );
            
            recentBehaviors.forEach(behavior => {
                const count = recentAdoptions.get(behavior.behaviorType) || 0;
                recentAdoptions.set(behavior.behaviorType, count + 1);
            });
        }
        
        // Detect cascades (rapid adoption)
        for (const [behaviorType, adoptionCount] of recentAdoptions) {
            const cascadeThreshold = Math.max(10, this.agents.size * 0.05); // 5% of agents
            
            if (adoptionCount > cascadeThreshold) {
                this.triggerBehaviorCascade(behaviorType, adoptionCount);
            }
        }
    }

    triggerBehaviorCascade(behaviorType, adoptionCount) {
        this.state.lastBehaviorCascade = Date.now();
        this.state.contagionLevel = Math.min(1.0, adoptionCount / this.agents.size);
        
        // Reduce resistance for all agents during cascade
        for (const agent of this.agents.values()) {
            agent.resistanceLevel *= 0.8;
        }
        
        this.emit('behavior_cascade', {
            behaviorType,
            adoptionCount,
            contagionLevel: this.state.contagionLevel,
            timestamp: Date.now()
        });
    }

    // Behavior management methods
    initiateBehavior(agentId, behaviorType, intensity = 0.5) {
        const agent = this.agents.get(agentId);
        if (!agent) return false;
        
        agent.currentBehaviors.add(behaviorType);
        agent.behaviorIntensity = intensity;
        agent.lastBehaviorChange = Date.now();
        
        agent.behaviorHistory.push({
            behaviorType,
            action: 'initiated',
            timestamp: Date.now(),
            intensity,
            influenceSource: 'internal'
        });
        
        this.addToBehaviorCluster(agentId, behaviorType);
        
        this.emit('behavior_initiated', {
            agentId,
            behaviorType,
            intensity
        });
        
        return true;
    }

    removeBehavior(agentId, behaviorType) {
        const agent = this.agents.get(agentId);
        if (!agent) return false;
        
        if (agent.currentBehaviors.has(behaviorType)) {
            agent.currentBehaviors.delete(behaviorType);
            agent.lastBehaviorChange = Date.now();
            
            agent.behaviorHistory.push({
                behaviorType,
                action: 'abandoned',
                timestamp: Date.now(),
                intensity: 0,
                influenceSource: 'decay'
            });
            
            this.removeFromBehaviorCluster(agentId, behaviorType);
            
            this.emit('behavior_abandoned', {
                agentId,
                behaviorType
            });
            
            return true;
        }
        
        return false;
    }

    updateBehaviorIntensities() {
        for (const agent of this.agents.values()) {
            // Natural decay of behavior intensity
            agent.behaviorIntensity = Math.max(0, agent.behaviorIntensity - 0.01);
            
            // Recovery of resistance over time
            agent.resistanceLevel = Math.min(1.0, agent.resistanceLevel + this.config.resistanceDecay * 0.1);
            
            // Remove behaviors with zero intensity
            const behaviorsToRemove = [];
            for (const behaviorType of agent.currentBehaviors) {
                if (agent.behaviorIntensity === 0) {
                    behaviorsToRemove.push(behaviorType);
                }
            }
            
            behaviorsToRemove.forEach(behaviorType => {
                this.removeBehavior(agent.id, behaviorType);
            });
        }
    }

    // Behavior clustering
    addToBehaviorCluster(agentId, behaviorType) {
        if (!this.behaviorClusters.has(behaviorType)) {
            this.behaviorClusters.set(behaviorType, new Set());
        }
        this.behaviorClusters.get(behaviorType).add(agentId);
    }

    removeFromBehaviorCluster(agentId, behaviorType) {
        const cluster = this.behaviorClusters.get(behaviorType);
        if (cluster) {
            cluster.delete(agentId);
            if (cluster.size === 0) {
                this.behaviorClusters.delete(behaviorType);
            }
        }
    }

    // Analytics and reporting
    getCollectiveBehaviorStatistics() {
        const behaviorStats = {};
        
        // Current behavior distribution
        const currentBehaviors = new Map();
        for (const agent of this.agents.values()) {
            for (const behavior of agent.currentBehaviors) {
                currentBehaviors.set(behavior, (currentBehaviors.get(behavior) || 0) + 1);
            }
        }
        
        // Emergent behavior summary
        const emergentSummary = {};
        for (const [behaviorType, behavior] of this.emergentBehaviors) {
            emergentSummary[behaviorType] = {
                penetration: behavior.currentPenetration,
                intensity: behavior.intensity,
                duration: behavior.duration,
                economicImpact: behavior.economicImpact,
                socialImpact: behavior.socialImpact
            };
        }
        
        return {
            totalAgents: this.agents.size,
            currentMood: this.state.currentMood,
            dominantBehavior: this.state.dominantBehavior,
            contagionLevel: this.state.contagionLevel,
            collectiveIntelligence: this.state.collectiveIntelligence,
            socialCohesion: this.state.socialCohesion,
            
            currentBehaviors: Object.fromEntries(currentBehaviors),
            emergentBehaviors: emergentSummary,
            behaviorClusterSizes: this.getBehaviorClusterSizes(),
            
            // Network effects
            averageConnectivity: this.calculateAverageConnectivity(),
            influenceDistribution: this.analyzeInfluenceDistribution()
        };
    }

    getBehaviorClusterSizes() {
        const sizes = {};
        for (const [behaviorType, cluster] of this.behaviorClusters) {
            sizes[behaviorType] = cluster.size;
        }
        return sizes;
    }

    calculateAverageConnectivity() {
        if (this.agents.size === 0) return 0;
        
        const totalConnections = Array.from(this.agents.values())
            .reduce((sum, agent) => sum + agent.socialConnections.size, 0);
        
        return totalConnections / this.agents.size;
    }

    analyzeInfluenceDistribution() {
        const influences = Array.from(this.agents.values())
            .map(agent => agent.reputationInfluence)
            .sort((a, b) => b - a);
        
        return {
            max: influences[0] || 0,
            median: influences[Math.floor(influences.length / 2)] || 0,
            average: influences.reduce((a, b) => a + b, 0) / influences.length || 0,
            gini: this.calculateGiniCoefficient(influences)
        };
    }

    calculateGiniCoefficient(values) {
        if (values.length === 0) return 0;
        
        const n = values.length;
        let sumOfDifferences = 0;
        
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                sumOfDifferences += Math.abs(values[i] - values[j]);
            }
        }
        
        const mean = values.reduce((a, b) => a + b, 0) / n;
        return sumOfDifferences / (2 * n * n * mean);
    }

    // Cleanup
    stop() {
        if (this.behaviorInterval) {
            clearInterval(this.behaviorInterval);
        }
    }
}

module.exports = CollectiveBehaviorEngine;
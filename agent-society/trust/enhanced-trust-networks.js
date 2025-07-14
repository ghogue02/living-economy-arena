/**
 * Enhanced Trust Networks
 * Phase 4: Multi-dimensional trust systems, trust propagation,
 * reputation inheritance, and trust-based economic interactions
 */

const EventEmitter = require('eventemitter3');

class EnhancedTrustNetworks extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Trust dimensions
            trustDimensions: config.trustDimensions || {
                'competence': { weight: 0.3, decay: 0.05, range: [0, 1] },
                'benevolence': { weight: 0.25, decay: 0.03, range: [0, 1] },
                'integrity': { weight: 0.25, decay: 0.02, range: [0, 1] },
                'predictability': { weight: 0.15, decay: 0.04, range: [0, 1] },
                'transparency': { weight: 0.05, decay: 0.03, range: [0, 1] }
            },
            
            // Trust propagation parameters
            maxPropagationDepth: config.maxPropagationDepth || 3,
            propagationDecay: config.propagationDecay || 0.7,
            transitivityThreshold: config.transitivityThreshold || 0.6,
            trustUpdateThreshold: config.trustUpdateThreshold || 0.1,
            
            // Trust network structure
            trustThresholds: config.trustThresholds || {
                'complete_trust': 0.9,
                'high_trust': 0.7,
                'moderate_trust': 0.5,
                'low_trust': 0.3,
                'distrust': 0.1
            },
            
            // Economic trust parameters
            economicTrustWeight: config.economicTrustWeight || 0.4,
            creditScoreIntegration: config.creditScoreIntegration !== false,
            trustBasedPricing: config.trustBasedPricing !== false,
            
            // Reputation inheritance
            inheritanceEnabled: config.inheritanceEnabled !== false,
            inheritanceRate: config.inheritanceRate || 0.3,
            associationDecay: config.associationDecay || 0.1,
            
            ...config
        };

        // Core trust structures
        this.agents = new Map();
        this.trustRelationships = new Map();
        this.trustCommunities = new Map();
        this.reputationNetworks = new Map();
        
        // Trust propagation state
        this.trustPaths = new Map();
        this.propagationQueues = new Map();
        this.trustCascades = new Map();
        
        // Economic trust integration
        this.economicTrustScores = new Map();
        this.creditRatings = new Map();
        this.trustBasedContracts = new Map();
        this.trustInsurance = new Map();
        
        // Reputation inheritance tracking
        this.reputationInheritance = new Map();
        this.associationNetworks = new Map();
        this.inheritedTrust = new Map();
        
        // Trust analytics
        this.trustMetrics = {
            averageTrust: 0.5,
            networkDensity: 0,
            trustVariance: 0,
            propagationEfficiency: 0,
            economicTrustCorrelation: 0
        };

        this.initializeTrustNetworks();
    }

    initializeTrustNetworks() {
        // Trust propagation cycle
        this.propagationInterval = setInterval(() => {
            this.propagateTrust();
        }, 30000); // Every 30 seconds
        
        // Trust decay processing
        this.decayInterval = setInterval(() => {
            this.processTrustDecay();
        }, 300000); // Every 5 minutes
        
        // Economic trust updates
        this.economicInterval = setInterval(() => {
            this.updateEconomicTrust();
        }, 600000); // Every 10 minutes
        
        // Reputation inheritance processing
        this.inheritanceInterval = setInterval(() => {
            this.processReputationInheritance();
        }, 900000); // Every 15 minutes
    }

    // Agent registration and trust management
    registerAgent(agentId, trustProfile = {}) {
        const agent = {
            id: agentId,
            
            // Trust characteristics
            trustworthiness: this.initializeTrustworthiness(trustProfile),
            trustPropensity: trustProfile.trustPropensity || 0.5,
            trustSensitivity: trustProfile.trustSensitivity || 0.5,
            
            // Trust behavior patterns
            trustGiving: {
                frequency: trustProfile.trustGiving?.frequency || 0.5,
                magnitude: trustProfile.trustGiving?.magnitude || 0.5,
                reciprocity: trustProfile.trustGiving?.reciprocity || 0.5,
                conditions: trustProfile.trustGiving?.conditions || []
            },
            
            // Trust receiving
            trustReceiving: {
                acceptance: trustProfile.trustReceiving?.acceptance || 0.5,
                maintenance: trustProfile.trustReceiving?.maintenance || 0.5,
                violation_sensitivity: trustProfile.trustReceiving?.violation_sensitivity || 0.5
            },
            
            // Economic trust factors
            economicHistory: {
                transactions: [],
                defaults: 0,
                punctuality: 0.5,
                reliability: 0.5,
                financialStability: 0.5
            },
            
            // Social trust factors
            socialConnections: new Set(),
            communityStanding: 0.5,
            socialCapital: 0.5,
            culturalAlignment: new Map(),
            
            // Trust network position
            trustCentrality: 0,
            trustBrokerage: 0,
            trustCommunities: new Set(),
            
            // Reputation data
            directReputation: 0.5,
            inheritedReputation: 0.5,
            associatedReputation: new Map(),
            reputationSources: new Set(),
            
            // Performance tracking
            trustViolations: [],
            trustBuildingEvents: [],
            reciprocityScore: 0.5,
            
            ...trustProfile
        };

        this.agents.set(agentId, agent);
        this.trustRelationships.set(agentId, new Map());
        this.economicTrustScores.set(agentId, this.calculateInitialEconomicTrust(agent));
        
        return agent;
    }

    initializeTrustworthiness(trustProfile) {
        const trustworthiness = {};
        
        Object.keys(this.config.trustDimensions).forEach(dimension => {
            const dimConfig = this.config.trustDimensions[dimension];
            const [min, max] = dimConfig.range;
            
            trustworthiness[dimension] = trustProfile.trustworthiness?.[dimension] || 
                (min + Math.random() * (max - min));
        });
        
        return trustworthiness;
    }

    calculateInitialEconomicTrust(agent) {
        let economicTrust = 0.5; // Base economic trust
        
        // Factor in economic history
        economicTrust += (agent.economicHistory.reliability - 0.5) * 0.3;
        economicTrust += (agent.economicHistory.punctuality - 0.5) * 0.2;
        economicTrust += (agent.economicHistory.financialStability - 0.5) * 0.3;
        
        // Factor in social elements
        economicTrust += (agent.communityStanding - 0.5) * 0.2;
        
        return Math.max(0, Math.min(1, economicTrust));
    }

    // Trust relationship management
    establishTrustRelationship(trusterId, trusteeId, initialTrust = {}) {
        if (trusterId === trusteeId) return false;
        
        const truster = this.agents.get(trusterId);
        const trustee = this.agents.get(trusteeId);
        
        if (!truster || !trustee) return false;
        
        const relationship = {
            trusterId,
            trusteeId,
            
            // Multi-dimensional trust scores
            trust: this.initializeRelationshipTrust(initialTrust),
            confidence: initialTrust.confidence || 0.5,
            
            // Relationship metadata
            establishedAt: Date.now(),
            lastUpdated: Date.now(),
            interactionCount: 0,
            
            // Trust dynamics
            trustTrajectory: [],
            volatility: 0.1,
            stability: 0.5,
            
            // Economic factors
            economicWeight: 0,
            transactionHistory: [],
            defaultRisk: 0.1,
            
            // Context
            context: initialTrust.context || 'general',
            domain: initialTrust.domain || 'social',
            conditions: initialTrust.conditions || [],
            
            // Trust propagation
            propagationWeight: this.calculatePropagationWeight(truster, trustee),
            transitivity: 0.5
        };
        
        // Store bidirectional relationship
        this.trustRelationships.get(trusterId).set(trusteeId, relationship);
        
        // Create reverse relationship for network analysis
        const reverseRelationship = { ...relationship };
        reverseRelationship.trusterId = trusteeId;
        reverseRelationship.trusteeId = trusterId;
        reverseRelationship.trust = this.initializeRelationshipTrust({}); // Start neutral
        
        if (!this.trustRelationships.has(trusteeId)) {
            this.trustRelationships.set(trusteeId, new Map());
        }
        this.trustRelationships.get(trusteeId).set(trusterId, reverseRelationship);
        
        this.emit('trust_relationship_established', {
            trusterId,
            trusteeId,
            initialTrust: this.calculateOverallTrust(relationship.trust)
        });
        
        return relationship;
    }

    initializeRelationshipTrust(initialTrust) {
        const trust = {};
        
        Object.keys(this.config.trustDimensions).forEach(dimension => {
            trust[dimension] = initialTrust[dimension] || 0.5; // Start neutral
        });
        
        return trust;
    }

    updateTrust(trusterId, trusteeId, trustUpdate, context = {}) {
        const relationships = this.trustRelationships.get(trusterId);
        const relationship = relationships?.get(trusteeId);
        
        if (!relationship) return false;
        
        const oldTrust = { ...relationship.trust };
        const oldOverallTrust = this.calculateOverallTrust(oldTrust);
        
        // Update trust dimensions
        Object.entries(trustUpdate).forEach(([dimension, change]) => {
            if (this.config.trustDimensions[dimension]) {
                const dimConfig = this.config.trustDimensions[dimension];
                const [min, max] = dimConfig.range;
                
                relationship.trust[dimension] = Math.max(min, Math.min(max,
                    relationship.trust[dimension] + change
                ));
            }
        });
        
        const newOverallTrust = this.calculateOverallTrust(relationship.trust);
        const trustChange = newOverallTrust - oldOverallTrust;
        
        // Update relationship metadata
        relationship.lastUpdated = Date.now();
        relationship.interactionCount++;
        relationship.trustTrajectory.push({
            timestamp: Date.now(),
            oldTrust: oldOverallTrust,
            newTrust: newOverallTrust,
            change: trustChange,
            context
        });
        
        // Update volatility and stability
        this.updateTrustDynamics(relationship);
        
        // Check for significant trust changes
        if (Math.abs(trustChange) >= this.config.trustUpdateThreshold) {
            this.triggerTrustPropagation(trusterId, trusteeId, trustChange);
        }
        
        this.emit('trust_updated', {
            trusterId,
            trusteeId,
            oldTrust: oldOverallTrust,
            newTrust: newOverallTrust,
            change: trustChange,
            dimensions: Object.keys(trustUpdate)
        });
        
        return true;
    }

    calculateOverallTrust(trustDimensions) {
        let weightedSum = 0;
        let totalWeight = 0;
        
        Object.entries(trustDimensions).forEach(([dimension, value]) => {
            const weight = this.config.trustDimensions[dimension]?.weight || 0.2;
            weightedSum += value * weight;
            totalWeight += weight;
        });
        
        return totalWeight > 0 ? weightedSum / totalWeight : 0.5;
    }

    updateTrustDynamics(relationship) {
        const trajectory = relationship.trustTrajectory;
        
        if (trajectory.length > 1) {
            // Calculate volatility (variance of trust changes)
            const recentChanges = trajectory.slice(-10).map(t => t.change);
            const meanChange = recentChanges.reduce((a, b) => a + b, 0) / recentChanges.length;
            const variance = recentChanges.reduce((sum, change) => sum + Math.pow(change - meanChange, 2), 0) / recentChanges.length;
            
            relationship.volatility = Math.sqrt(variance);
            
            // Calculate stability (consistency of trust direction)
            const positiveChanges = recentChanges.filter(c => c > 0).length;
            const negativeChanges = recentChanges.filter(c => c < 0).length;
            const neutralChanges = recentChanges.filter(c => c === 0).length;
            
            relationship.stability = Math.max(positiveChanges, negativeChanges, neutralChanges) / recentChanges.length;
        }
    }

    // Trust propagation
    propagateTrust() {
        // Process each active propagation
        for (const [cascadeId, cascade] of this.trustCascades) {
            this.processTrustCascade(cascadeId, cascade);
        }
        
        // Clean up completed cascades
        this.cleanupCompletedCascades();
    }

    triggerTrustPropagation(sourceId, targetId, trustChange) {
        const cascadeId = `${sourceId}_${targetId}_${Date.now()}`;
        
        const cascade = {
            id: cascadeId,
            sourceId,
            targetId,
            originalChange: trustChange,
            currentDepth: 0,
            maxDepth: this.config.maxPropagationDepth,
            
            // Propagation state
            visited: new Set([sourceId]),
            currentWave: new Map([[targetId, trustChange]]),
            totalAffected: 1,
            
            // Tracking
            startTime: Date.now(),
            propagationPath: [sourceId, targetId],
            attenuationFactor: this.config.propagationDecay
        };
        
        this.trustCascades.set(cascadeId, cascade);
    }

    processTrustCascade(cascadeId, cascade) {
        if (cascade.currentDepth >= cascade.maxDepth || cascade.currentWave.size === 0) {
            return;
        }
        
        const nextWave = new Map();
        
        for (const [nodeId, trustImpact] of cascade.currentWave) {
            if (cascade.visited.has(nodeId)) continue;
            
            cascade.visited.add(nodeId);
            
            // Find nodes connected to current node
            const connections = this.trustRelationships.get(nodeId);
            if (!connections) continue;
            
            for (const [connectedId, relationship] of connections) {
                if (cascade.visited.has(connectedId)) continue;
                
                // Calculate propagated impact
                const propagatedImpact = this.calculatePropagatedTrustImpact(
                    trustImpact, 
                    relationship, 
                    cascade.currentDepth
                );
                
                if (Math.abs(propagatedImpact) >= 0.01) { // Minimum impact threshold
                    // Accumulate impact if node already in next wave
                    const existingImpact = nextWave.get(connectedId) || 0;
                    nextWave.set(connectedId, existingImpact + propagatedImpact);
                    
                    cascade.propagationPath.push(connectedId);
                    cascade.totalAffected++;
                    
                    // Apply indirect trust update
                    this.applyIndirectTrustUpdate(nodeId, connectedId, propagatedImpact);
                }
            }
        }
        
        cascade.currentWave = nextWave;
        cascade.currentDepth++;
    }

    calculatePropagatedTrustImpact(originalImpact, relationship, depth) {
        // Base propagation with decay
        let propagatedImpact = originalImpact * Math.pow(this.config.propagationDecay, depth);
        
        // Weight by relationship strength
        const relationshipTrust = this.calculateOverallTrust(relationship.trust);
        propagatedImpact *= relationshipTrust;
        
        // Weight by transitivity
        propagatedImpact *= relationship.transitivity;
        
        // Weight by propagation weight
        propagatedImpact *= relationship.propagationWeight;
        
        return propagatedImpact;
    }

    applyIndirectTrustUpdate(intermediateId, targetId, impact) {
        // This represents trust changing due to network effects
        // More sophisticated models could consider multiple paths
        
        const relationships = this.trustRelationships.get(intermediateId);
        const relationship = relationships?.get(targetId);
        
        if (relationship) {
            // Apply smaller impact for indirect trust
            const indirectImpact = impact * 0.3; // 30% of direct impact
            
            Object.keys(relationship.trust).forEach(dimension => {
                const dimConfig = this.config.trustDimensions[dimension];
                const [min, max] = dimConfig.range;
                
                const currentValue = relationship.trust[dimension];
                const newValue = Math.max(min, Math.min(max, currentValue + indirectImpact));
                
                relationship.trust[dimension] = newValue;
            });
            
            relationship.lastUpdated = Date.now();
        }
    }

    // Reputation inheritance
    processReputationInheritance() {
        for (const [agentId, agent] of this.agents) {
            this.updateInheritedReputation(agentId, agent);
        }
    }

    updateInheritedReputation(agentId, agent) {
        let inheritedScore = 0;
        let inheritanceWeight = 0;
        
        // Inherit from associated entities
        for (const [associateId, associationStrength] of agent.associatedReputation) {
            const associate = this.agents.get(associateId);
            if (associate) {
                const associateReputation = associate.directReputation;
                const inheritance = associateReputation * associationStrength * this.config.inheritanceRate;
                
                inheritedScore += inheritance;
                inheritanceWeight += associationStrength;
            }
        }
        
        // Inherit from trust network
        const trustConnections = this.trustRelationships.get(agentId);
        if (trustConnections) {
            for (const [connectionId, relationship] of trustConnections) {
                const connection = this.agents.get(connectionId);
                if (connection) {
                    const trustLevel = this.calculateOverallTrust(relationship.trust);
                    const connectionReputation = connection.directReputation;
                    
                    if (trustLevel > this.config.trustThresholds.moderate_trust) {
                        const inheritance = connectionReputation * trustLevel * 0.1; // Lower weight for trust-based inheritance
                        inheritedScore += inheritance;
                        inheritanceWeight += trustLevel;
                    }
                }
            }
        }
        
        // Update inherited reputation
        if (inheritanceWeight > 0) {
            agent.inheritedReputation = inheritedScore / inheritanceWeight;
        }
        
        // Store inheritance details
        this.inheritedTrust.set(agentId, {
            agentId,
            inheritedScore,
            inheritanceWeight,
            sources: Array.from(agent.associatedReputation.keys()),
            lastUpdated: Date.now()
        });
    }

    // Economic trust integration
    updateEconomicTrust() {
        for (const [agentId, agent] of this.agents) {
            this.updateAgentEconomicTrust(agentId, agent);
        }
    }

    updateAgentEconomicTrust(agentId, agent) {
        let economicTrust = this.economicTrustScores.get(agentId) || 0.5;
        
        // Factor in recent transaction performance
        const recentTransactions = agent.economicHistory.transactions.slice(-10);
        if (recentTransactions.length > 0) {
            const successRate = recentTransactions.filter(t => t.successful).length / recentTransactions.length;
            const avgAmount = recentTransactions.reduce((sum, t) => sum + t.amount, 0) / recentTransactions.length;
            const avgTimeliness = recentTransactions.reduce((sum, t) => sum + (t.onTime ? 1 : 0), 0) / recentTransactions.length;
            
            economicTrust = economicTrust * 0.7 + (successRate * 0.4 + avgTimeliness * 0.3) * 0.3;
        }
        
        // Factor in defaults
        const defaultPenalty = Math.min(0.5, agent.economicHistory.defaults * 0.1);
        economicTrust -= defaultPenalty;
        
        // Factor in overall trust network
        const networkTrust = this.calculateNetworkTrust(agentId);
        economicTrust = economicTrust * 0.8 + networkTrust * 0.2;
        
        economicTrust = Math.max(0, Math.min(1, economicTrust));
        this.economicTrustScores.set(agentId, economicTrust);
        
        // Update credit rating if enabled
        if (this.config.creditScoreIntegration) {
            this.updateCreditRating(agentId, economicTrust);
        }
    }

    calculateNetworkTrust(agentId) {
        const relationships = this.trustRelationships.get(agentId);
        if (!relationships || relationships.size === 0) return 0.5;
        
        let totalTrust = 0;
        let totalWeight = 0;
        
        for (const [otherId, relationship] of relationships) {
            const trust = this.calculateOverallTrust(relationship.trust);
            const weight = relationship.interactionCount + 1; // +1 to avoid zero weights
            
            totalTrust += trust * weight;
            totalWeight += weight;
        }
        
        return totalWeight > 0 ? totalTrust / totalWeight : 0.5;
    }

    updateCreditRating(agentId, economicTrust) {
        // Convert economic trust to credit score (300-850 scale)
        const creditScore = 300 + (economicTrust * 550);
        
        let creditRating;
        if (creditScore >= 800) creditRating = 'Excellent';
        else if (creditScore >= 740) creditRating = 'Very Good';
        else if (creditScore >= 670) creditRating = 'Good';
        else if (creditScore >= 580) creditRating = 'Fair';
        else creditRating = 'Poor';
        
        this.creditRatings.set(agentId, {
            agentId,
            score: Math.round(creditScore),
            rating: creditRating,
            economicTrust,
            lastUpdated: Date.now()
        });
    }

    // Trust-based economic interactions
    calculateTrustBasedPrice(sellerId, buyerId, basePrice) {
        if (!this.config.trustBasedPricing) return basePrice;
        
        const relationships = this.trustRelationships.get(sellerId);
        const relationship = relationships?.get(buyerId);
        
        if (!relationship) return basePrice; // No relationship = base price
        
        const trust = this.calculateOverallTrust(relationship.trust);
        const economicTrust = this.economicTrustScores.get(buyerId) || 0.5;
        
        // Calculate trust-based discount/premium
        const combinedTrust = (trust * 0.6 + economicTrust * 0.4);
        
        let priceModifier = 1.0;
        
        if (combinedTrust > this.config.trustThresholds.high_trust) {
            // High trust = discount
            priceModifier = 0.95 - (combinedTrust - this.config.trustThresholds.high_trust) * 0.2;
        } else if (combinedTrust < this.config.trustThresholds.low_trust) {
            // Low trust = premium
            priceModifier = 1.05 + (this.config.trustThresholds.low_trust - combinedTrust) * 0.3;
        }
        
        return basePrice * priceModifier;
    }

    // Analytics and reporting
    getTrustNetworkMetrics() {
        return {
            network: {
                totalAgents: this.agents.size,
                totalRelationships: this.getTotalRelationships(),
                networkDensity: this.calculateNetworkDensity(),
                averageTrust: this.calculateAverageTrust()
            },
            
            trust_distribution: this.analyzeTrustDistribution(),
            economic_trust: this.analyzeEconomicTrustMetrics(),
            propagation: this.analyzePropagationMetrics(),
            inheritance: this.analyzeInheritanceMetrics(),
            
            communities: this.analyzeTrustCommunities(),
            centrality: this.analyzeTrustCentrality()
        };
    }

    getAgentTrustProfile(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) return null;
        
        const relationships = this.trustRelationships.get(agentId);
        const economicTrust = this.economicTrustScores.get(agentId);
        const creditRating = this.creditRatings.get(agentId);
        const inheritance = this.inheritedTrust.get(agentId);
        
        return {
            agentId,
            trustworthiness: { ...agent.trustworthiness },
            trustCharacteristics: {
                propensity: agent.trustPropensity,
                sensitivity: agent.trustSensitivity,
                giving: { ...agent.trustGiving },
                receiving: { ...agent.trustReceiving }
            },
            
            relationships: {
                total: relationships ? relationships.size : 0,
                byTrustLevel: this.categorizeTrustLevels(relationships),
                averageTrust: this.calculateAverageRelationshipTrust(relationships)
            },
            
            reputation: {
                direct: agent.directReputation,
                inherited: agent.inheritedReputation,
                combined: (agent.directReputation * 0.7 + agent.inheritedReputation * 0.3)
            },
            
            economic: {
                trust: economicTrust,
                creditRating: creditRating ? creditRating.rating : 'Unrated',
                creditScore: creditRating ? creditRating.score : null,
                transactionHistory: agent.economicHistory.transactions.length,
                defaults: agent.economicHistory.defaults
            },
            
            network: {
                centrality: agent.trustCentrality,
                brokerage: agent.trustBrokerage,
                communities: Array.from(agent.trustCommunities)
            },
            
            inheritance: inheritance ? {
                inheritedScore: inheritance.inheritedScore,
                sources: inheritance.sources.length,
                lastUpdated: inheritance.lastUpdated
            } : null
        };
    }

    // Utility methods
    calculatePropagationWeight(truster, trustee) {
        // Weight based on trustworthiness and social position
        const trusterReliability = Object.values(truster.trustworthiness)
            .reduce((sum, val) => sum + val, 0) / Object.keys(truster.trustworthiness).length;
        
        const trusteeReliability = Object.values(trustee.trustworthiness)
            .reduce((sum, val) => sum + val, 0) / Object.keys(trustee.trustworthiness).length;
        
        return (trusterReliability + trusteeReliability) / 2;
    }

    getTotalRelationships() {
        let total = 0;
        for (const relationships of this.trustRelationships.values()) {
            total += relationships.size;
        }
        return total / 2; // Divide by 2 for bidirectional relationships
    }

    calculateNetworkDensity() {
        const n = this.agents.size;
        const actualEdges = this.getTotalRelationships();
        const possibleEdges = n * (n - 1) / 2;
        
        return possibleEdges > 0 ? actualEdges / possibleEdges : 0;
    }

    // Cleanup
    stop() {
        if (this.propagationInterval) clearInterval(this.propagationInterval);
        if (this.decayInterval) clearInterval(this.decayInterval);
        if (this.economicInterval) clearInterval(this.economicInterval);
        if (this.inheritanceInterval) clearInterval(this.inheritanceInterval);
    }
}

module.exports = EnhancedTrustNetworks;
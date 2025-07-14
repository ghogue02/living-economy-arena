/**
 * Reputation System
 * Tracks agent reputation across multiple dimensions affecting business relationships
 */

const EventEmitter = require('eventemitter3');

class ReputationSystem extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            maxReputation: config.maxReputation || 100,
            minReputation: config.minReputation || 0,
            reputationDecayRate: config.reputationDecayRate || 0.1, // Monthly decay
            reputationCategories: config.reputationCategories || [
                'business_integrity',
                'financial_reliability',
                'social_cooperation',
                'innovation',
                'leadership',
                'criminal_activity',
                'political_influence',
                'philanthropy'
            ],
            reputationWeights: config.reputationWeights || {
                business_integrity: 0.25,
                financial_reliability: 0.20,
                social_cooperation: 0.15,
                innovation: 0.10,
                leadership: 0.10,
                criminal_activity: -0.15,
                political_influence: 0.05,
                philanthropy: 0.10
            },
            
            // Thresholds for reputation milestones
            reputationTiers: config.reputationTiers || [
                { threshold: 90, name: 'legendary', bonus: 0.5 },
                { threshold: 80, name: 'excellent', bonus: 0.3 },
                { threshold: 70, name: 'good', bonus: 0.2 },
                { threshold: 50, name: 'neutral', bonus: 0.0 },
                { threshold: 30, name: 'poor', bonus: -0.2 },
                { threshold: 10, name: 'terrible', bonus: -0.4 },
                { threshold: 0, name: 'criminal', bonus: -0.6 }
            ],
            
            ...config
        };

        this.agents = new Map();
        this.reputationHistory = new Map();
        this.networkEffects = new Map(); // How agents affect each other's reputation
        
        this.state = {
            totalReputationEvents: 0,
            averageReputation: 50,
            reputationDistribution: new Map(),
            lastDecayProcess: Date.now()
        };

        this.initializeReputationNetwork();
    }

    initializeReputationNetwork() {
        // Set up reputation decay timer
        this.decayInterval = setInterval(() => {
            this.processReputationDecay();
        }, 86400000); // Daily decay processing
    }

    registerAgent(agentId, initialReputation = 50) {
        const agent = {
            id: agentId,
            overallReputation: initialReputation,
            categoryScores: {},
            reputationHistory: [],
            networkInfluence: 0,
            lastUpdate: Date.now(),
            
            // Reputation modifiers
            reputationTier: this.calculateReputationTier(initialReputation),
            reputationTrend: 'stable', // rising, falling, stable
            
            // Social proof metrics
            endorsements: new Set(),
            testimonials: [],
            publicIncidents: [],
            
            // Business relationship effects
            trustLevel: initialReputation,
            creditworthiness: initialReputation,
            partnershipAttractiveness: initialReputation
        };

        // Initialize category scores
        this.config.reputationCategories.forEach(category => {
            agent.categoryScores[category] = initialReputation;
        });

        this.agents.set(agentId, agent);
        this.reputationHistory.set(agentId, []);
        
        this.updateReputationDistribution();
        
        return agent;
    }

    updateReputation(agentId, change, category, context = {}) {
        const agent = this.agents.get(agentId);
        if (!agent) return false;

        const oldReputation = agent.overallReputation;
        
        // Update category-specific score
        if (this.config.reputationCategories.includes(category)) {
            const categoryWeight = this.config.reputationWeights[category] || 0.1;
            const weightedChange = change * Math.abs(categoryWeight);
            
            agent.categoryScores[category] = Math.max(
                this.config.minReputation,
                Math.min(this.config.maxReputation, agent.categoryScores[category] + weightedChange)
            );
        }

        // Recalculate overall reputation
        agent.overallReputation = this.calculateOverallReputation(agent);
        
        // Update derived metrics
        agent.reputationTier = this.calculateReputationTier(agent.overallReputation);
        agent.reputationTrend = this.calculateReputationTrend(agent, oldReputation);
        agent.trustLevel = this.calculateTrustLevel(agent);
        agent.creditworthiness = this.calculateCreditworthiness(agent);
        agent.partnershipAttractiveness = this.calculatePartnershipAttractiveness(agent);
        
        // Record reputation event
        const reputationEvent = {
            timestamp: Date.now(),
            change: agent.overallReputation - oldReputation,
            category,
            context,
            newReputation: agent.overallReputation,
            newTier: agent.reputationTier.name
        };
        
        agent.reputationHistory.push(reputationEvent);
        this.reputationHistory.get(agentId).push(reputationEvent);
        
        // Keep only last 100 events
        if (agent.reputationHistory.length > 100) {
            agent.reputationHistory.shift();
        }

        // Apply network effects
        this.applyNetworkReputationEffects(agentId, change, category);
        
        // Check for reputation milestones
        this.checkReputationMilestones(agentId, oldReputation, agent.overallReputation);
        
        this.state.totalReputationEvents++;
        this.updateReputationDistribution();
        
        this.emit('reputation_updated', {
            agentId,
            oldReputation,
            newReputation: agent.overallReputation,
            change: agent.overallReputation - oldReputation,
            category,
            tier: agent.reputationTier.name
        });

        return true;
    }

    calculateOverallReputation(agent) {
        let weightedSum = 0;
        let totalWeight = 0;

        for (const [category, score] of Object.entries(agent.categoryScores)) {
            const weight = Math.abs(this.config.reputationWeights[category] || 0.1);
            weightedSum += score * weight;
            totalWeight += weight;
        }

        return totalWeight > 0 ? Math.round(weightedSum / totalWeight) : 50;
    }

    calculateReputationTier(reputation) {
        for (const tier of this.config.reputationTiers) {
            if (reputation >= tier.threshold) {
                return tier;
            }
        }
        return this.config.reputationTiers[this.config.reputationTiers.length - 1];
    }

    calculateReputationTrend(agent, oldReputation) {
        const recentEvents = agent.reputationHistory.slice(-10);
        if (recentEvents.length < 3) return 'stable';
        
        const recentChange = recentEvents.reduce((sum, event) => sum + event.change, 0);
        
        if (recentChange > 5) return 'rising';
        if (recentChange < -5) return 'falling';
        return 'stable';
    }

    calculateTrustLevel(agent) {
        // Trust level based on specific categories
        const integrityScore = agent.categoryScores.business_integrity || 50;
        const reliabilityScore = agent.categoryScores.financial_reliability || 50;
        const cooperationScore = agent.categoryScores.social_cooperation || 50;
        const criminalPenalty = Math.abs(agent.categoryScores.criminal_activity - 50);
        
        const trustScore = (integrityScore + reliabilityScore + cooperationScore) / 3 - criminalPenalty;
        return Math.max(0, Math.min(100, trustScore));
    }

    calculateCreditworthiness(agent) {
        // Financial reputation affects creditworthiness most heavily
        const financialScore = agent.categoryScores.financial_reliability || 50;
        const integrityScore = agent.categoryScores.business_integrity || 50;
        const reputationBonus = (agent.overallReputation - 50) * 0.5;
        
        return Math.max(0, Math.min(100, (financialScore * 0.6 + integrityScore * 0.4) + reputationBonus));
    }

    calculatePartnershipAttractiveness(agent) {
        // Business partnership attractiveness
        const leadershipScore = agent.categoryScores.leadership || 50;
        const innovationScore = agent.categoryScores.innovation || 50;
        const integrityScore = agent.categoryScores.business_integrity || 50;
        const networkBonus = Math.min(20, agent.networkInfluence);
        
        return Math.max(0, Math.min(100, 
            (leadershipScore * 0.3 + innovationScore * 0.3 + integrityScore * 0.4) + networkBonus
        ));
    }

    applyNetworkReputationEffects(agentId, change, category) {
        const agent = this.agents.get(agentId);
        if (!agent) return;

        // Reputation changes propagate through networks
        const networkConnections = this.getNetworkConnections(agentId);
        
        networkConnections.forEach(connectedAgentId => {
            const connectedAgent = this.agents.get(connectedAgentId);
            if (!connectedAgent) return;
            
            // Calculate influence strength
            const influenceStrength = this.calculateInfluenceStrength(agentId, connectedAgentId);
            const networkEffect = change * influenceStrength * 0.1; // 10% of original change
            
            if (Math.abs(networkEffect) > 0.5) {
                this.updateReputation(connectedAgentId, networkEffect, 'social_cooperation', {
                    source: 'network_effect',
                    influencer: agentId,
                    originalCategory: category
                });
            }
        });
    }

    getNetworkConnections(agentId) {
        // This would integrate with the social connections from the main society system
        // For now, return empty array - would be populated by external system
        return [];
    }

    calculateInfluenceStrength(influencerId, targetId) {
        const influencer = this.agents.get(influencerId);
        const target = this.agents.get(targetId);
        
        if (!influencer || !target) return 0;
        
        // Influence based on reputation difference and network position
        const reputationRatio = influencer.overallReputation / Math.max(1, target.overallReputation);
        const networkRatio = influencer.networkInfluence / Math.max(1, target.networkInfluence + 1);
        
        return Math.min(1, (reputationRatio + networkRatio) / 4);
    }

    checkReputationMilestones(agentId, oldReputation, newReputation) {
        const oldTier = this.calculateReputationTier(oldReputation);
        const newTier = this.calculateReputationTier(newReputation);
        
        if (oldTier.name !== newTier.name) {
            this.emit('reputation_milestone', {
                agentId,
                oldTier: oldTier.name,
                newTier: newTier.name,
                change: newReputation - oldReputation,
                timestamp: Date.now()
            });
            
            // Award network influence for positive milestones
            const agent = this.agents.get(agentId);
            if (agent && newTier.threshold > oldTier.threshold) {
                agent.networkInfluence += 5;
            }
        }
        
        // Special milestones
        if (newReputation >= 90 && oldReputation < 90) {
            this.emit('reputation_milestone', {
                agentId,
                milestone: 'legendary_status',
                newReputation,
                specialEffects: ['increased_business_opportunities', 'political_influence', 'social_leadership']
            });
        }
        
        if (newReputation <= 10 && oldReputation > 10) {
            this.emit('reputation_milestone', {
                agentId,
                milestone: 'reputation_collapse',
                newReputation,
                specialEffects: ['business_ostracism', 'credit_denial', 'social_isolation']
            });
        }
    }

    // Endorsement system
    addEndorsement(endorserId, endorsedId, category) {
        const endorser = this.agents.get(endorserId);
        const endorsed = this.agents.get(endorsedId);
        
        if (!endorser || !endorsed || endorserId === endorsedId) return false;
        
        // Endorsement value based on endorser's reputation
        const endorsementValue = Math.max(1, endorser.overallReputation / 20);
        
        endorsed.endorsements.add(endorserId);
        this.updateReputation(endorsedId, endorsementValue, category, {
            type: 'endorsement',
            endorser: endorserId,
            endorserReputation: endorser.overallReputation
        });
        
        // Small reputation boost for endorser (social cooperation)
        this.updateReputation(endorserId, 1, 'social_cooperation', {
            type: 'gave_endorsement',
            target: endorsedId
        });
        
        return true;
    }

    // Testimonial system
    addTestimonial(authorId, subjectId, testimonialText, rating) {
        const author = this.agents.get(authorId);
        const subject = this.agents.get(subjectId);
        
        if (!author || !subject || authorId === subjectId) return false;
        
        const testimonial = {
            id: Date.now() + Math.random(),
            authorId,
            authorReputation: author.overallReputation,
            text: testimonialText,
            rating, // 1-5 scale
            timestamp: Date.now(),
            verified: author.overallReputation > 60 // Auto-verify high reputation authors
        };
        
        subject.testimonials.push(testimonial);
        
        // Keep only last 50 testimonials
        if (subject.testimonials.length > 50) {
            subject.testimonials.shift();
        }
        
        // Update reputation based on testimonial
        const testimonialImpact = (rating - 3) * (author.overallReputation / 50); // -2 to +2 * author weight
        this.updateReputation(subjectId, testimonialImpact, 'business_integrity', {
            type: 'testimonial',
            rating,
            authorId,
            verified: testimonial.verified
        });
        
        return testimonial.id;
    }

    // Public incident reporting
    reportPublicIncident(agentId, incidentType, severity, details = {}) {
        const agent = this.agents.get(agentId);
        if (!agent) return false;
        
        const incident = {
            id: Date.now() + Math.random(),
            type: incidentType, // 'scandal', 'fraud', 'breach_of_trust', 'criminal_charge'
            severity, // 1-10 scale
            details,
            timestamp: Date.now(),
            verified: details.verified || false
        };
        
        agent.publicIncidents.push(incident);
        
        // Calculate reputation damage
        const baseDamage = severity * 2;
        const categoryDamage = this.getIncidentCategoryDamage(incidentType);
        
        Object.entries(categoryDamage).forEach(([category, multiplier]) => {
            const damage = baseDamage * multiplier;
            this.updateReputation(agentId, -damage, category, {
                type: 'public_incident',
                incident: incidentType,
                severity
            });
        });
        
        this.emit('public_incident', {
            agentId,
            incident: incidentType,
            severity,
            reputationImpact: baseDamage
        });
        
        return incident.id;
    }

    getIncidentCategoryDamage(incidentType) {
        const damageMap = {
            'scandal': { 'business_integrity': 1.5, 'social_cooperation': 1.0 },
            'fraud': { 'business_integrity': 2.0, 'financial_reliability': 2.0, 'criminal_activity': 1.0 },
            'breach_of_trust': { 'business_integrity': 1.8, 'social_cooperation': 1.5 },
            'criminal_charge': { 'criminal_activity': 2.5, 'business_integrity': 1.0 },
            'corruption': { 'business_integrity': 2.0, 'political_influence': 1.5 },
            'environmental_damage': { 'business_integrity': 1.0, 'social_cooperation': 1.5 }
        };
        
        return damageMap[incidentType] || { 'business_integrity': 1.0 };
    }

    // Reputation recovery mechanics
    initiateReputationRecovery(agentId, recoveryPlan) {
        const agent = this.agents.get(agentId);
        if (!agent) return false;
        
        const recovery = {
            agentId,
            plan: recoveryPlan,
            startDate: Date.now(),
            duration: recoveryPlan.duration || 90, // days
            investmentRequired: recoveryPlan.investment || 0,
            expectedRecovery: recoveryPlan.expectedGain || 10,
            milestones: recoveryPlan.milestones || [],
            status: 'active'
        };
        
        // Immediate small boost for taking action
        this.updateReputation(agentId, 2, 'business_integrity', {
            type: 'reputation_recovery_initiated',
            plan: recoveryPlan.type
        });
        
        this.emit('reputation_recovery_started', recovery);
        
        return recovery;
    }

    // Reputation decay processing
    processReputationDecay() {
        const now = Date.now();
        const daysSinceLastDecay = (now - this.state.lastDecayProcess) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLastDecay < 30) return; // Monthly decay
        
        this.state.lastDecayProcess = now;
        
        for (const [agentId, agent] of this.agents) {
            // Decay extreme reputations toward neutral
            const decayAmount = this.config.reputationDecayRate;
            
            if (agent.overallReputation > 60) {
                // High reputation slowly decays
                this.updateReputation(agentId, -decayAmount, 'business_integrity', {
                    type: 'natural_decay',
                    reason: 'time_passage'
                });
            } else if (agent.overallReputation < 40) {
                // Low reputation slowly recovers
                this.updateReputation(agentId, decayAmount * 0.5, 'business_integrity', {
                    type: 'natural_recovery',
                    reason: 'time_passage'
                });
            }
        }
    }

    updateReputationDistribution() {
        const distribution = new Map();
        
        for (const [agentId, agent] of this.agents) {
            const tier = agent.reputationTier.name;
            distribution.set(tier, (distribution.get(tier) || 0) + 1);
        }
        
        this.state.reputationDistribution = distribution;
        
        // Calculate average reputation
        const totalReputation = Array.from(this.agents.values())
            .reduce((sum, agent) => sum + agent.overallReputation, 0);
        this.state.averageReputation = this.agents.size > 0 ? totalReputation / this.agents.size : 50;
    }

    // Analytics and reporting
    getReputationStatistics() {
        return {
            totalAgents: this.agents.size,
            averageReputation: this.state.averageReputation,
            reputationDistribution: Object.fromEntries(this.state.reputationDistribution),
            totalEvents: this.state.totalReputationEvents,
            
            // Category statistics
            categoryAverages: this.calculateCategoryAverages(),
            
            // Trend analysis
            reputationTrends: this.analyzeReputationTrends(),
            
            // Network effects
            networkInfluenceDistribution: this.analyzeNetworkInfluence()
        };
    }

    calculateCategoryAverages() {
        const categoryTotals = {};
        const categoryCount = {};
        
        for (const agent of this.agents.values()) {
            for (const [category, score] of Object.entries(agent.categoryScores)) {
                categoryTotals[category] = (categoryTotals[category] || 0) + score;
                categoryCount[category] = (categoryCount[category] || 0) + 1;
            }
        }
        
        const averages = {};
        for (const category of this.config.reputationCategories) {
            averages[category] = categoryCount[category] > 0 ? 
                categoryTotals[category] / categoryCount[category] : 50;
        }
        
        return averages;
    }

    analyzeReputationTrends() {
        const trends = { rising: 0, falling: 0, stable: 0 };
        
        for (const agent of this.agents.values()) {
            trends[agent.reputationTrend]++;
        }
        
        return trends;
    }

    analyzeNetworkInfluence() {
        const influences = Array.from(this.agents.values()).map(a => a.networkInfluence).sort((a, b) => b - a);
        
        return {
            max: influences[0] || 0,
            median: influences[Math.floor(influences.length / 2)] || 0,
            average: influences.reduce((a, b) => a + b, 0) / influences.length || 0,
            top10Percent: influences.slice(0, Math.ceil(influences.length * 0.1))
        };
    }

    getAgentReputationProfile(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) return null;
        
        return {
            agentId,
            overallReputation: agent.overallReputation,
            tier: agent.reputationTier,
            trend: agent.reputationTrend,
            categoryScores: { ...agent.categoryScores },
            
            // Business metrics
            trustLevel: agent.trustLevel,
            creditworthiness: agent.creditworthiness,
            partnershipAttractiveness: agent.partnershipAttractiveness,
            
            // Social proof
            endorsementCount: agent.endorsements.size,
            testimonialCount: agent.testimonials.length,
            averageTestimonialRating: this.calculateAverageTestimonialRating(agent),
            publicIncidentCount: agent.publicIncidents.length,
            
            // Network
            networkInfluence: agent.networkInfluence,
            
            // Recent history
            recentEvents: agent.reputationHistory.slice(-10)
        };
    }

    calculateAverageTestimonialRating(agent) {
        if (agent.testimonials.length === 0) return 0;
        
        const totalRating = agent.testimonials.reduce((sum, testimonial) => sum + testimonial.rating, 0);
        return totalRating / agent.testimonials.length;
    }

    // Business relationship impact
    calculateBusinessRelationshipImpact(agentId1, agentId2) {
        const agent1 = this.agents.get(agentId1);
        const agent2 = this.agents.get(agentId2);
        
        if (!agent1 || !agent2) return { canInteract: false, riskLevel: 'unknown' };
        
        const avgReputation = (agent1.overallReputation + agent2.overallReputation) / 2;
        const reputationDifference = Math.abs(agent1.overallReputation - agent2.overallReputation);
        const trustCompatibility = Math.abs(agent1.trustLevel - agent2.trustLevel);
        
        // Calculate interaction feasibility
        const canInteract = avgReputation > 20 && reputationDifference < 40;
        
        // Calculate risk level
        let riskLevel = 'low';
        if (Math.min(agent1.overallReputation, agent2.overallReputation) < 30) riskLevel = 'high';
        else if (trustCompatibility > 30) riskLevel = 'medium';
        
        return {
            canInteract,
            riskLevel,
            trustCompatibility: 100 - trustCompatibility,
            reputationSynergy: 100 - reputationDifference,
            recommendedInteractionTypes: this.getRecommendedInteractions(agent1, agent2)
        };
    }

    getRecommendedInteractions(agent1, agent2) {
        const interactions = [];
        
        if (agent1.trustLevel > 70 && agent2.trustLevel > 70) {
            interactions.push('high_value_partnership', 'joint_venture', 'strategic_alliance');
        }
        
        if (agent1.overallReputation > 60 && agent2.overallReputation > 60) {
            interactions.push('business_partnership', 'collaborative_project');
        }
        
        if (Math.min(agent1.overallReputation, agent2.overallReputation) > 40) {
            interactions.push('standard_transaction', 'professional_services');
        }
        
        return interactions;
    }
}

module.exports = ReputationSystem;
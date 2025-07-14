/**
 * Coalition & Alliance System
 * Manages player cooperation, treaties, resource sharing, and betrayal mechanics
 */

const EventEmitter = require('eventemitter3');
const { v4: uuidv4 } = require('uuid');

class CoalitionSystem extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            maxCoalitionSize: config.maxCoalitionSize || 8,
            maxCoalitionsPerPlayer: config.maxCoalitionsPerPlayer || 3,
            treatyDuration: config.treatyDuration || 86400000, // 24 hours
            betrayalCooldown: config.betrayalCooldown || 172800000, // 48 hours
            trustDecayRate: config.trustDecayRate || 0.02, // 2% per hour
            cooperationBonus: config.cooperationBonus || 0.25, // 25% bonus
            reputationPenalty: config.reputationPenalty || 0.5, // 50% penalty for betrayal
            ...config
        };

        this.state = {
            coalitions: new Map(),
            treaties: new Map(),
            playerRelationships: new Map(),
            sharedResources: new Map(),
            tradeAgreements: new Map(),
            betrayalHistory: new Map(),
            diplomacyActions: new Map()
        };

        this.coalitionTypes = {
            trade_bloc: {
                maxSize: 6,
                benefits: ['trade_discount', 'market_access', 'price_stability'],
                requirements: ['economic_alignment', 'trade_volume'],
                cooperationBonus: 0.2
            },
            research_consortium: {
                maxSize: 5,
                benefits: ['technology_sharing', 'research_acceleration', 'cost_reduction'],
                requirements: ['technology_investment', 'research_capacity'],
                cooperationBonus: 0.3
            },
            defense_pact: {
                maxSize: 4,
                benefits: ['mutual_protection', 'intelligence_sharing', 'coordinated_response'],
                requirements: ['security_investment', 'strategic_alignment'],
                cooperationBonus: 0.15
            },
            economic_cartel: {
                maxSize: 4,
                benefits: ['price_control', 'market_manipulation', 'supply_coordination'],
                requirements: ['market_dominance', 'resource_control'],
                cooperationBonus: 0.35,
                riskLevel: 'high' // More likely to be targeted by regulators
            },
            innovation_hub: {
                maxSize: 6,
                benefits: ['patent_sharing', 'talent_pooling', 'venture_funding'],
                requirements: ['innovation_capacity', 'startup_ecosystem'],
                cooperationBonus: 0.25
            },
            resource_alliance: {
                maxSize: 8,
                benefits: ['resource_sharing', 'supply_security', 'strategic_reserves'],
                requirements: ['resource_ownership', 'logistics_capability'],
                cooperationBonus: 0.2
            }
        };

        this.treatyTypes = {
            non_aggression: {
                duration: 86400000, // 24 hours
                terms: ['no_hostile_actions', 'no_espionage', 'no_market_manipulation'],
                benefits: ['reduced_security_costs', 'stable_relations']
            },
            trade_agreement: {
                duration: 172800000, // 48 hours
                terms: ['preferential_pricing', 'priority_access', 'volume_commitments'],
                benefits: ['cost_reduction', 'supply_security', 'revenue_stability']
            },
            technology_sharing: {
                duration: 259200000, // 72 hours
                terms: ['patent_access', 'research_collaboration', 'knowledge_transfer'],
                benefits: ['innovation_acceleration', 'development_cost_reduction']
            },
            mutual_defense: {
                duration: 345600000, // 96 hours
                terms: ['coordinated_defense', 'intelligence_sharing', 'joint_operations'],
                benefits: ['security_enhancement', 'threat_deterrence']
            },
            resource_sharing: {
                duration: 172800000, // 48 hours
                terms: ['resource_pooling', 'emergency_assistance', 'strategic_coordination'],
                benefits: ['resource_efficiency', 'crisis_resilience']
            }
        };

        this.initializeSystem();
    }

    initializeSystem() {
        // Start relationship decay timer
        setInterval(() => {
            this.updateRelationships();
        }, 300000); // Every 5 minutes

        // Start treaty expiration monitoring
        setInterval(() => {
            this.updateTreaties();
        }, 60000); // Every minute

        // Start coalition maintenance
        setInterval(() => {
            this.maintainCoalitions();
        }, 600000); // Every 10 minutes

        console.log('Coalition System initialized');
    }

    // Coalition Management
    async createCoalition(founderId, coalitionType, name, description = '') {
        const coalitionConfig = this.coalitionTypes[coalitionType];
        if (!coalitionConfig) throw new Error('Invalid coalition type');

        // Check if founder can create more coalitions
        const founderCoalitions = Array.from(this.state.coalitions.values())
            .filter(c => c.members.includes(founderId));
        
        if (founderCoalitions.length >= this.config.maxCoalitionsPerPlayer) {
            throw new Error('Maximum coalition limit reached');
        }

        const coalitionId = uuidv4();
        const coalition = {
            id: coalitionId,
            name,
            description,
            type: coalitionType,
            founder: founderId,
            members: [founderId],
            created: Date.now(),
            status: 'active',
            trust: new Map([[founderId, 1.0]]),
            sharedResources: new Map(),
            cooperationScore: 1.0,
            achievements: [],
            governance: {
                decisionMaking: 'consensus', // consensus, majority, founder_led
                resourceSharing: 'voluntary', // voluntary, mandatory, proportional
                conflictResolution: 'mediation' // mediation, voting, arbitration
            },
            benefits: coalitionConfig.benefits,
            requirements: coalitionConfig.requirements,
            cooperationBonus: coalitionConfig.cooperationBonus,
            riskLevel: coalitionConfig.riskLevel || 'medium'
        };

        this.state.coalitions.set(coalitionId, coalition);
        this.initializePlayerRelationship(founderId, founderId, 1.0);

        this.emit('coalition_created', { coalitionId, founderId, coalition });
        return { coalitionId, coalition };
    }

    async inviteToCoalition(coalitionId, inviterId, inviteeId) {
        const coalition = this.state.coalitions.get(coalitionId);
        if (!coalition) throw new Error('Coalition not found');

        if (!coalition.members.includes(inviterId)) {
            throw new Error('Only coalition members can invite others');
        }

        if (coalition.members.includes(inviteeId)) {
            throw new Error('Player already in coalition');
        }

        const coalitionConfig = this.coalitionTypes[coalition.type];
        if (coalition.members.length >= coalitionConfig.maxSize) {
            throw new Error('Coalition at maximum capacity');
        }

        // Check if invitee can join more coalitions
        const inviteeCoalitions = Array.from(this.state.coalitions.values())
            .filter(c => c.members.includes(inviteeId));
        
        if (inviteeCoalitions.length >= this.config.maxCoalitionsPerPlayer) {
            throw new Error('Invitee at maximum coalition limit');
        }

        const invitationId = uuidv4();
        const invitation = {
            id: invitationId,
            coalitionId,
            inviterId,
            inviteeId,
            timestamp: Date.now(),
            status: 'pending',
            expirationTime: Date.now() + 3600000 // 1 hour to respond
        };

        // Store invitation (in practice, you'd have an invitations map)
        this.emit('coalition_invitation_sent', { invitationId, invitation });
        return { invitationId };
    }

    async respondToInvitation(invitationId, inviteeId, response) {
        // In practice, you'd retrieve invitation from storage
        // For now, simulating acceptance
        if (response === 'accept') {
            return await this.acceptCoalitionInvitation(invitationId, inviteeId);
        } else {
            this.emit('coalition_invitation_declined', { invitationId, inviteeId });
            return { status: 'declined' };
        }
    }

    async acceptCoalitionInvitation(invitationId, inviteeId) {
        // Simulate getting invitation details
        const coalitionId = 'temp'; // Would get from invitation
        const coalition = this.state.coalitions.get(coalitionId);
        if (!coalition) throw new Error('Coalition not found');

        // Add member to coalition
        coalition.members.push(inviteeId);
        coalition.trust.set(inviteeId, 0.5); // Start with neutral trust

        // Initialize relationships with existing members
        coalition.members.forEach(memberId => {
            if (memberId !== inviteeId) {
                this.initializePlayerRelationship(inviteeId, memberId, 0.5);
                this.initializePlayerRelationship(memberId, inviteeId, 0.5);
            }
        });

        // Update cooperation score
        this.updateCooperationScore(coalitionId);

        this.emit('coalition_member_joined', { coalitionId, inviteeId, coalition });
        return { coalitionId, status: 'joined' };
    }

    async leaveCoalition(coalitionId, playerId) {
        const coalition = this.state.coalitions.get(coalitionId);
        if (!coalition) throw new Error('Coalition not found');

        if (!coalition.members.includes(playerId)) {
            throw new Error('Player not in coalition');
        }

        // Remove member
        coalition.members = coalition.members.filter(id => id !== playerId);
        coalition.trust.delete(playerId);

        // Handle founder leaving
        if (coalition.founder === playerId && coalition.members.length > 0) {
            coalition.founder = coalition.members[0]; // Transfer leadership
        }

        // Dissolve coalition if empty
        if (coalition.members.length === 0) {
            this.state.coalitions.delete(coalitionId);
            this.emit('coalition_dissolved', { coalitionId, reason: 'empty' });
        } else {
            this.updateCooperationScore(coalitionId);
            this.emit('coalition_member_left', { coalitionId, playerId, coalition });
        }

        return { status: 'left' };
    }

    // Treaty System
    async proposeTreaty(proposerId, targetId, treatyType, terms = {}, duration = null) {
        const treatyConfig = this.treatyTypes[treatyType];
        if (!treatyConfig) throw new Error('Invalid treaty type');

        const treatyId = uuidv4();
        const treaty = {
            id: treatyId,
            type: treatyType,
            proposer: proposerId,
            target: targetId,
            terms: { ...treatyConfig.terms, ...terms },
            benefits: treatyConfig.benefits,
            duration: duration || treatyConfig.duration,
            proposed: Date.now(),
            status: 'proposed',
            expirationTime: null,
            violations: [],
            renewalCount: 0
        };

        this.emit('treaty_proposed', { treatyId, treaty });
        return { treatyId };
    }

    async respondToTreaty(treatyId, targetId, response, counterTerms = null) {
        // Simulate treaty retrieval
        if (response === 'accept') {
            return await this.acceptTreaty(treatyId, targetId);
        } else if (response === 'counter') {
            return await this.counterTreaty(treatyId, targetId, counterTerms);
        } else {
            this.emit('treaty_declined', { treatyId, targetId });
            return { status: 'declined' };
        }
    }

    async acceptTreaty(treatyId, targetId) {
        // Create active treaty
        const treaty = {
            id: treatyId,
            status: 'active',
            activatedAt: Date.now(),
            // ... other treaty details
        };

        const expirationTime = Date.now() + treaty.duration;
        treaty.expirationTime = expirationTime;

        this.state.treaties.set(treatyId, treaty);

        // Schedule expiration
        setTimeout(() => {
            this.expireTreaty(treatyId);
        }, treaty.duration);

        // Update relationships
        this.updateRelationshipTrust(treaty.proposer, targetId, 0.2);
        this.updateRelationshipTrust(targetId, treaty.proposer, 0.2);

        this.emit('treaty_activated', { treatyId, treaty });
        return { treatyId, status: 'active' };
    }

    async counterTreaty(treatyId, targetId, counterTerms) {
        const counterTreatyId = uuidv4();
        
        this.emit('treaty_countered', { 
            originalTreatyId: treatyId, 
            counterTreatyId, 
            targetId, 
            counterTerms 
        });
        
        return { counterTreatyId, status: 'countered' };
    }

    // Resource Sharing
    async shareResources(coalitionId, sharerId, resourceType, amount, conditions = {}) {
        const coalition = this.state.coalitions.get(coalitionId);
        if (!coalition) throw new Error('Coalition not found');

        if (!coalition.members.includes(sharerId)) {
            throw new Error('Only coalition members can share resources');
        }

        const shareId = uuidv4();
        const resourceShare = {
            id: shareId,
            coalitionId,
            sharerId,
            resourceType,
            amount,
            conditions,
            timestamp: Date.now(),
            status: 'available',
            claims: new Map(),
            expirationTime: Date.now() + (conditions.duration || 3600000), // 1 hour default
            restrictions: conditions.restrictions || {}
        };

        if (!coalition.sharedResources.has(resourceType)) {
            coalition.sharedResources.set(resourceType, []);
        }
        coalition.sharedResources.get(resourceType).push(resourceShare);

        // Increase trust with all coalition members
        coalition.members.forEach(memberId => {
            if (memberId !== sharerId) {
                this.updateRelationshipTrust(sharerId, memberId, 0.1);
            }
        });

        this.emit('resources_shared', { shareId, coalitionId, sharerId, resourceShare });
        return { shareId };
    }

    async claimSharedResources(coalitionId, claimerId, shareId, amount) {
        const coalition = this.state.coalitions.get(coalitionId);
        if (!coalition) throw new Error('Coalition not found');

        if (!coalition.members.includes(claimerId)) {
            throw new Error('Only coalition members can claim resources');
        }

        // Find the resource share
        let resourceShare = null;
        for (const [resourceType, shares] of coalition.sharedResources) {
            resourceShare = shares.find(share => share.id === shareId);
            if (resourceShare) break;
        }

        if (!resourceShare) throw new Error('Resource share not found');
        if (resourceShare.sharerId === claimerId) throw new Error('Cannot claim own resources');

        const availableAmount = resourceShare.amount - 
            Array.from(resourceShare.claims.values()).reduce((sum, claim) => sum + claim.amount, 0);

        if (amount > availableAmount) throw new Error('Insufficient resources available');

        // Check conditions
        if (resourceShare.conditions.requiresApproval && !resourceShare.approved) {
            throw new Error('Resource sharing requires approval');
        }

        const claimId = uuidv4();
        const claim = {
            id: claimId,
            claimerId,
            amount,
            timestamp: Date.now(),
            status: 'claimed'
        };

        resourceShare.claims.set(claimId, claim);

        // Update trust between sharer and claimer
        this.updateRelationshipTrust(resourceShare.sharerId, claimerId, 0.05);
        this.updateRelationshipTrust(claimerId, resourceShare.sharerId, 0.05);

        this.emit('resources_claimed', { claimId, shareId, claimerId, claim });
        return { claimId, amount };
    }

    // Betrayal System
    async betrayCoalition(coalitionId, betrayerId, betrayalType, targetMembers = []) {
        const coalition = this.state.coalitions.get(coalitionId);
        if (!coalition) throw new Error('Coalition not found');

        if (!coalition.members.includes(betrayerId)) {
            throw new Error('Only coalition members can betray');
        }

        // Check betrayal cooldown
        const lastBetrayal = this.state.betrayalHistory.get(betrayerId);
        if (lastBetrayal && Date.now() - lastBetrayal.timestamp < this.config.betrayalCooldown) {
            throw new Error('Betrayal cooldown active');
        }

        const betrayalId = uuidv4();
        const betrayal = {
            id: betrayalId,
            coalitionId,
            betrayerId,
            type: betrayalType,
            targetMembers: targetMembers.length > 0 ? targetMembers : coalition.members.filter(id => id !== betrayerId),
            timestamp: Date.now(),
            consequences: await this.calculateBetrayalConsequences(coalitionId, betrayerId, betrayalType),
            status: 'executed'
        };

        // Record betrayal
        this.state.betrayalHistory.set(betrayerId, betrayal);

        // Apply consequences
        await this.applyBetrayalConsequences(betrayal);

        // Remove betrayer from coalition
        await this.leaveCoalition(coalitionId, betrayerId);

        this.emit('coalition_betrayed', { betrayalId, coalitionId, betrayerId, betrayal });
        return { betrayalId, consequences: betrayal.consequences };
    }

    async calculateBetrayalConsequences(coalitionId, betrayerId, betrayalType) {
        const coalition = this.state.coalitions.get(coalitionId);
        const consequences = {
            reputationLoss: 0,
            trustPenalty: 0,
            economicImpact: 0,
            coalitionDamage: 0,
            benefits: []
        };

        switch (betrayalType) {
            case 'resource_theft':
                consequences.reputationLoss = 0.3;
                consequences.trustPenalty = 0.5;
                consequences.economicImpact = 0.2;
                consequences.benefits = ['stolen_resources'];
                break;

            case 'information_leak':
                consequences.reputationLoss = 0.4;
                consequences.trustPenalty = 0.6;
                consequences.coalitionDamage = 0.3;
                consequences.benefits = ['competitor_payment', 'strategic_advantage'];
                break;

            case 'sabotage':
                consequences.reputationLoss = 0.5;
                consequences.trustPenalty = 0.8;
                consequences.coalitionDamage = 0.4;
                consequences.economicImpact = 0.3;
                consequences.benefits = ['market_advantage'];
                break;

            case 'hostile_takeover':
                consequences.reputationLoss = 0.6;
                consequences.trustPenalty = 1.0;
                consequences.coalitionDamage = 0.6;
                consequences.economicImpact = 0.4;
                consequences.benefits = ['resource_control', 'market_position'];
                break;

            case 'defection':
                consequences.reputationLoss = 0.2;
                consequences.trustPenalty = 0.3;
                consequences.coalitionDamage = 0.1;
                consequences.benefits = ['freedom', 'new_opportunities'];
                break;
        }

        return consequences;
    }

    async applyBetrayalConsequences(betrayal) {
        const { betrayerId, consequences, targetMembers } = betrayal;

        // Apply reputation loss
        // (This would integrate with player reputation system)

        // Apply trust penalties
        targetMembers.forEach(memberId => {
            this.updateRelationshipTrust(betrayerId, memberId, -consequences.trustPenalty);
            this.updateRelationshipTrust(memberId, betrayerId, -consequences.trustPenalty);
        });

        // Spread reputation damage to other players
        for (const playerId of this.state.playerRelationships.keys()) {
            if (!targetMembers.includes(playerId) && playerId !== betrayerId) {
                this.updateRelationshipTrust(playerId, betrayerId, -consequences.reputationLoss * 0.5);
            }
        }
    }

    // Relationship Management
    initializePlayerRelationship(playerId1, playerId2, initialTrust = 0.5) {
        if (!this.state.playerRelationships.has(playerId1)) {
            this.state.playerRelationships.set(playerId1, new Map());
        }
        
        const relationships = this.state.playerRelationships.get(playerId1);
        if (!relationships.has(playerId2)) {
            relationships.set(playerId2, {
                trust: initialTrust,
                history: [],
                lastInteraction: Date.now(),
                cooperationCount: 0,
                betrayalCount: 0,
                tradeValue: 0
            });
        }
    }

    updateRelationshipTrust(playerId1, playerId2, change) {
        this.initializePlayerRelationship(playerId1, playerId2);
        
        const relationship = this.state.playerRelationships.get(playerId1).get(playerId2);
        relationship.trust = Math.max(0, Math.min(1, relationship.trust + change));
        relationship.lastInteraction = Date.now();
        
        if (change > 0) {
            relationship.cooperationCount++;
        } else if (change < 0) {
            relationship.betrayalCount++;
        }

        relationship.history.push({
            timestamp: Date.now(),
            change,
            type: change > 0 ? 'cooperation' : 'betrayal'
        });

        // Keep only recent history
        if (relationship.history.length > 20) {
            relationship.history.shift();
        }
    }

    updateCooperationScore(coalitionId) {
        const coalition = this.state.coalitions.get(coalitionId);
        if (!coalition) return;

        let totalTrust = 0;
        let relationshipCount = 0;

        coalition.members.forEach(member1 => {
            coalition.members.forEach(member2 => {
                if (member1 !== member2) {
                    const trust = this.getRelationshipTrust(member1, member2);
                    totalTrust += trust;
                    relationshipCount++;
                }
            });
        });

        coalition.cooperationScore = relationshipCount > 0 ? totalTrust / relationshipCount : 1.0;
        
        // Apply cooperation bonus
        const bonus = coalition.cooperationScore * coalition.cooperationBonus;
        coalition.currentBonus = bonus;
    }

    getRelationshipTrust(playerId1, playerId2) {
        const relationships = this.state.playerRelationships.get(playerId1);
        if (!relationships || !relationships.has(playerId2)) return 0.5;
        
        return relationships.get(playerId2).trust;
    }

    // System Updates
    updateRelationships() {
        // Apply trust decay over time
        for (const [playerId, relationships] of this.state.playerRelationships) {
            for (const [otherId, relationship] of relationships) {
                const timeSinceInteraction = Date.now() - relationship.lastInteraction;
                const decayAmount = (timeSinceInteraction / 3600000) * this.config.trustDecayRate;
                
                // Decay towards neutral (0.5)
                if (relationship.trust > 0.5) {
                    relationship.trust = Math.max(0.5, relationship.trust - decayAmount);
                } else {
                    relationship.trust = Math.min(0.5, relationship.trust + decayAmount);
                }
            }
        }
    }

    updateTreaties() {
        const now = Date.now();
        
        for (const [treatyId, treaty] of this.state.treaties) {
            if (treaty.status === 'active' && now >= treaty.expirationTime) {
                this.expireTreaty(treatyId);
            }
        }
    }

    expireTreaty(treatyId) {
        const treaty = this.state.treaties.get(treatyId);
        if (!treaty) return;

        treaty.status = 'expired';
        
        this.emit('treaty_expired', { treatyId, treaty });
        
        // Clean up after 24 hours
        setTimeout(() => {
            this.state.treaties.delete(treatyId);
        }, 86400000);
    }

    maintainCoalitions() {
        for (const [coalitionId, coalition] of this.state.coalitions) {
            this.updateCooperationScore(coalitionId);
            
            // Check for coalition dissolution due to low cooperation
            if (coalition.cooperationScore < 0.2 && coalition.members.length > 1) {
                this.emit('coalition_unstable', { coalitionId, coalition });
            }
            
            // Auto-expire shared resources
            for (const [resourceType, shares] of coalition.sharedResources) {
                coalition.sharedResources.set(resourceType, 
                    shares.filter(share => Date.now() < share.expirationTime)
                );
            }
        }
    }

    // Public API Methods
    getPlayerCoalitions(playerId) {
        return Array.from(this.state.coalitions.values())
            .filter(coalition => coalition.members.includes(playerId));
    }

    getPlayerRelationships(playerId) {
        return this.state.playerRelationships.get(playerId) || new Map();
    }

    getCoalitionDetails(coalitionId) {
        return this.state.coalitions.get(coalitionId) || null;
    }

    getActiveTreaties(playerId) {
        return Array.from(this.state.treaties.values())
            .filter(treaty => 
                (treaty.proposer === playerId || treaty.target === playerId) && 
                treaty.status === 'active'
            );
    }

    getSystemStatus() {
        return {
            totalCoalitions: this.state.coalitions.size,
            activeTreaties: Array.from(this.state.treaties.values())
                .filter(t => t.status === 'active').length,
            totalRelationships: Array.from(this.state.playerRelationships.values())
                .reduce((sum, relations) => sum + relations.size, 0),
            averageTrust: this.calculateAverageTrust(),
            betrayalRate: this.calculateBetrayalRate()
        };
    }

    calculateAverageTrust() {
        let totalTrust = 0;
        let count = 0;
        
        for (const relationships of this.state.playerRelationships.values()) {
            for (const relationship of relationships.values()) {
                totalTrust += relationship.trust;
                count++;
            }
        }
        
        return count > 0 ? totalTrust / count : 0.5;
    }

    calculateBetrayalRate() {
        const recentBetrayals = Array.from(this.state.betrayalHistory.values())
            .filter(betrayal => Date.now() - betrayal.timestamp < 86400000).length; // Last 24 hours
        
        const totalPlayers = this.state.playerRelationships.size;
        return totalPlayers > 0 ? recentBetrayals / totalPlayers : 0;
    }
}

module.exports = CoalitionSystem;
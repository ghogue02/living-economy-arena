/**
 * Community Governance Framework
 * Phase 4: Self-organizing communities, democratic decision making,
 * governance token systems, and consensus mechanisms
 */

const EventEmitter = require('eventemitter3');

class CommunityGovernance extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Governance models
            governanceModels: config.governanceModels || [
                'direct_democracy', 'representative_democracy', 'liquid_democracy',
                'consensus_based', 'meritocracy', 'technocracy', 'sortition'
            ],
            
            // Voting systems
            votingSystems: config.votingSystems || {
                'simple_majority': { threshold: 0.5, quorum: 0.3 },
                'supermajority': { threshold: 0.67, quorum: 0.4 },
                'consensus': { threshold: 0.9, quorum: 0.6 },
                'qualified_majority': { threshold: 0.6, quorum: 0.5 },
                'unanimous': { threshold: 1.0, quorum: 0.8 }
            },
            
            // Token governance parameters
            tokenSystemEnabled: config.tokenSystemEnabled !== false,
            tokenDistributionMethod: config.tokenDistributionMethod || 'contribution_based',
            tokenDecayRate: config.tokenDecayRate || 0.02,
            voteWeightMethod: config.voteWeightMethod || 'quadratic',
            
            // Proposal parameters
            proposalThreshold: config.proposalThreshold || 100, // Min tokens to propose
            proposalDuration: config.proposalDuration || 604800000, // 7 days in ms
            executionDelay: config.executionDelay || 86400000, // 1 day in ms
            
            // Community parameters
            minCommunitySize: config.minCommunitySize || 5,
            maxCommunitySize: config.maxCommunitySize || 10000,
            delegationEnabled: config.delegationEnabled !== false,
            recursiveDelegation: config.recursiveDelegation !== false,
            
            ...config
        };

        // Core governance structures
        this.communities = new Map();
        this.proposals = new Map();
        this.votes = new Map();
        this.delegations = new Map();
        this.governanceTokens = new Map();
        
        // Decision tracking
        this.activeDecisions = new Map();
        this.executedDecisions = new Map();
        this.failedDecisions = new Map();
        this.decisionHistory = [];
        
        // Governance analytics
        this.participationMetrics = new Map();
        this.consensusMetrics = new Map();
        this.effectivenessMetrics = new Map();
        
        // Community dynamics
        this.factions = new Map();
        this.coalitions = new Map();
        this.conflicts = new Map();
        this.emergentLeadership = new Map();

        this.initializeGovernanceFramework();
    }

    initializeGovernanceFramework() {
        // Governance processing cycle
        this.governanceInterval = setInterval(() => {
            this.processGovernanceActivities();
        }, 60000); // Every minute
        
        // Token system updates
        this.tokenInterval = setInterval(() => {
            this.updateTokenSystem();
        }, 300000); // Every 5 minutes
        
        // Community health assessment
        this.healthInterval = setInterval(() => {
            this.assessCommunityHealth();
        }, 600000); // Every 10 minutes
    }

    // Community management
    createCommunity(communityId, config = {}) {
        const community = {
            id: communityId,
            name: config.name || communityId,
            
            // Governance configuration
            governanceModel: config.governanceModel || 'representative_democracy',
            votingSystem: config.votingSystem || 'simple_majority',
            constitutionalRules: config.constitutionalRules || this.getDefaultConstitution(),
            
            // Membership
            members: new Set(),
            leadership: new Map(),
            representatives: new Map(),
            stakeholders: new Map(),
            
            // Token system
            tokens: {
                totalSupply: 0,
                circulating: 0,
                distribution: new Map(),
                inflation: config.tokenInflation || 0.05
            },
            
            // Governance state
            activeProposals: new Set(),
            votingPower: new Map(),
            delegationNetwork: new Map(),
            factions: new Map(),
            
            // Decision history
            decisions: [],
            successfulProposals: 0,
            failedProposals: 0,
            participationRate: 0,
            
            // Community health
            cohesion: 0.5,
            satisfaction: 0.5,
            legitimacy: 0.5,
            effectiveness: 0.5,
            
            // Temporal data
            createdAt: Date.now(),
            lastElection: null,
            nextElection: null,
            
            ...config
        };

        this.communities.set(communityId, community);
        
        // Initialize token system if enabled
        if (this.config.tokenSystemEnabled) {
            this.initializeCommunityTokens(communityId, community);
        }
        
        this.emit('community_created', {
            communityId,
            governanceModel: community.governanceModel,
            votingSystem: community.votingSystem
        });
        
        return community;
    }

    addMemberToCommunity(communityId, agentId, membershipData = {}) {
        const community = this.communities.get(communityId);
        if (!community) return false;
        
        const membership = {
            agentId,
            joinedAt: Date.now(),
            role: membershipData.role || 'member',
            stake: membershipData.stake || 0,
            votingPower: 0,
            reputation: membershipData.reputation || 50,
            
            // Participation tracking
            proposalsSubmitted: 0,
            votesParticipated: 0,
            delegationsReceived: 0,
            delegationsGiven: 0,
            
            // Governance activity
            lastVote: null,
            lastProposal: null,
            delegateTo: null,
            delegatedFrom: new Set(),
            
            ...membershipData
        };
        
        community.members.add(agentId);
        community.stakeholders.set(agentId, membership);
        
        // Assign initial tokens if enabled
        if (this.config.tokenSystemEnabled) {
            this.assignInitialTokens(communityId, agentId, membership);
        }
        
        // Calculate voting power
        this.updateMemberVotingPower(communityId, agentId);
        
        return membership;
    }

    initializeCommunityTokens(communityId, community) {
        const initialSupply = community.members.size * 1000; // 1000 tokens per member initially
        community.tokens.totalSupply = initialSupply;
        community.tokens.circulating = initialSupply;
        
        this.governanceTokens.set(communityId, {
            communityId,
            totalSupply: initialSupply,
            holders: new Map(),
            transfers: [],
            distributions: [],
            burnEvents: [],
            lastUpdate: Date.now()
        });
    }

    assignInitialTokens(communityId, agentId, membership) {
        const baseTokens = 1000;
        const reputationBonus = Math.floor((membership.reputation - 50) * 10);
        const stakeBonus = Math.floor(membership.stake * 100);
        
        const totalTokens = Math.max(100, baseTokens + reputationBonus + stakeBonus);
        
        const community = this.communities.get(communityId);
        const tokenSystem = this.governanceTokens.get(communityId);
        
        if (community && tokenSystem) {
            community.tokens.distribution.set(agentId, totalTokens);
            tokenSystem.holders.set(agentId, totalTokens);
            
            tokenSystem.distributions.push({
                agentId,
                amount: totalTokens,
                reason: 'initial_allocation',
                timestamp: Date.now()
            });
        }
    }

    // Proposal system
    submitProposal(communityId, proposerId, proposalData) {
        const community = this.communities.get(communityId);
        const proposer = community?.stakeholders.get(proposerId);
        
        if (!community || !proposer) return null;
        
        // Check proposer eligibility
        if (!this.canSubmitProposal(community, proposer)) {
            return null;
        }
        
        const proposalId = `${communityId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        const proposal = {
            id: proposalId,
            communityId,
            proposerId,
            
            // Proposal content
            title: proposalData.title,
            description: proposalData.description,
            type: proposalData.type || 'general',
            category: proposalData.category || 'governance',
            
            // Implementation details
            actions: proposalData.actions || [],
            parameters: proposalData.parameters || {},
            budgetRequest: proposalData.budgetRequest || 0,
            timeline: proposalData.timeline || {},
            
            // Voting configuration
            votingSystem: proposalData.votingSystem || community.votingSystem,
            threshold: proposalData.threshold || this.config.votingSystems[community.votingSystem].threshold,
            quorum: proposalData.quorum || this.config.votingSystems[community.votingSystem].quorum,
            
            // Timeline
            submittedAt: Date.now(),
            votingStartsAt: Date.now() + (proposalData.discussionPeriod || 86400000), // 1 day discussion
            votingEndsAt: Date.now() + (proposalData.discussionPeriod || 86400000) + this.config.proposalDuration,
            executionDelay: this.config.executionDelay,
            
            // Voting state
            votes: new Map(),
            totalVotingPower: 0,
            yesVotes: 0,
            noVotes: 0,
            abstainVotes: 0,
            participation: 0,
            
            // Status
            status: 'discussion',
            result: null,
            executedAt: null,
            
            // Discussion
            comments: [],
            amendments: [],
            supporters: new Set(),
            opponents: new Set(),
            
            ...proposalData
        };
        
        this.proposals.set(proposalId, proposal);
        community.activeProposals.add(proposalId);
        
        // Update proposer stats
        proposer.proposalsSubmitted++;
        proposer.lastProposal = Date.now();
        
        this.emit('proposal_submitted', {
            proposalId,
            communityId,
            proposerId,
            title: proposal.title,
            type: proposal.type
        });
        
        return proposal;
    }

    canSubmitProposal(community, proposer) {
        if (!this.config.tokenSystemEnabled) return true;
        
        const tokens = community.tokens.distribution.get(proposer.agentId) || 0;
        return tokens >= this.config.proposalThreshold;
    }

    // Voting system
    castVote(proposalId, voterId, voteChoice, reasoning = '') {
        const proposal = this.proposals.get(proposalId);
        const community = this.communities.get(proposal?.communityId);
        const voter = community?.stakeholders.get(voterId);
        
        if (!proposal || !community || !voter) return false;
        
        // Check voting eligibility
        if (!this.canVote(proposal, voter)) return false;
        
        const votingPower = this.calculateVotingPower(community, voter);
        
        const vote = {
            voterId,
            proposalId,
            choice: voteChoice, // 'yes', 'no', 'abstain'
            power: votingPower,
            reasoning,
            timestamp: Date.now(),
            delegated: voter.delegateTo !== null
        };
        
        // Remove previous vote if exists
        if (proposal.votes.has(voterId)) {
            const previousVote = proposal.votes.get(voterId);
            this.removeVoteFromTally(proposal, previousVote);
        }
        
        proposal.votes.set(voterId, vote);
        this.addVoteToTally(proposal, vote);
        
        // Update voter stats
        voter.votesParticipated++;
        voter.lastVote = Date.now();
        
        this.emit('vote_cast', {
            proposalId,
            voterId,
            choice: voteChoice,
            power: votingPower
        });
        
        // Check if voting is complete
        this.checkVotingCompletion(proposalId);
        
        return true;
    }

    canVote(proposal, voter) {
        const now = Date.now();
        return proposal.status === 'voting' && 
               now >= proposal.votingStartsAt && 
               now <= proposal.votingEndsAt &&
               !proposal.votes.has(voter.agentId);
    }

    calculateVotingPower(community, voter) {
        let power = 1; // Base voting power
        
        if (this.config.tokenSystemEnabled) {
            const tokens = community.tokens.distribution.get(voter.agentId) || 0;
            
            switch (this.config.voteWeightMethod) {
                case 'linear':
                    power = tokens / 1000; // 1 token = 0.001 voting power
                    break;
                case 'quadratic':
                    power = Math.sqrt(tokens / 1000);
                    break;
                case 'logarithmic':
                    power = Math.log(tokens + 1) / Math.log(1001);
                    break;
                default:
                    power = Math.min(10, tokens / 100); // Capped linear
            }
        }
        
        // Reputation modifier
        const reputationModifier = voter.reputation / 50; // 0.5x to 2x based on reputation
        power *= reputationModifier;
        
        // Role modifier
        const roleModifiers = {
            'leader': 1.5,
            'representative': 1.3,
            'expert': 1.2,
            'member': 1.0,
            'observer': 0.5
        };
        power *= roleModifiers[voter.role] || 1.0;
        
        return Math.max(0.1, power);
    }

    addVoteToTally(proposal, vote) {
        proposal.totalVotingPower += vote.power;
        
        switch (vote.choice) {
            case 'yes':
                proposal.yesVotes += vote.power;
                break;
            case 'no':
                proposal.noVotes += vote.power;
                break;
            case 'abstain':
                proposal.abstainVotes += vote.power;
                break;
        }
        
        proposal.participation = proposal.votes.size;
    }

    removeVoteFromTally(proposal, vote) {
        proposal.totalVotingPower -= vote.power;
        
        switch (vote.choice) {
            case 'yes':
                proposal.yesVotes -= vote.power;
                break;
            case 'no':
                proposal.noVotes -= vote.power;
                break;
            case 'abstain':
                proposal.abstainVotes -= vote.power;
                break;
        }
    }

    // Delegation system
    delegateVotingPower(communityId, delegatorId, delegateId) {
        const community = this.communities.get(communityId);
        const delegator = community?.stakeholders.get(delegatorId);
        const delegate = community?.stakeholders.get(delegateId);
        
        if (!community || !delegator || !delegate || delegatorId === delegateId) {
            return false;
        }
        
        // Remove previous delegation
        if (delegator.delegateTo) {
            this.removeDelegation(communityId, delegatorId);
        }
        
        // Create new delegation
        delegator.delegateTo = delegateId;
        delegate.delegatedFrom.add(delegatorId);
        delegator.delegationsGiven++;
        delegate.delegationsReceived++;
        
        // Update delegation network
        if (!community.delegationNetwork.has(delegateId)) {
            community.delegationNetwork.set(delegateId, new Set());
        }
        community.delegationNetwork.get(delegateId).add(delegatorId);
        
        this.emit('delegation_created', {
            communityId,
            delegatorId,
            delegateId
        });
        
        return true;
    }

    removeDelegation(communityId, delegatorId) {
        const community = this.communities.get(communityId);
        const delegator = community?.stakeholders.get(delegatorId);
        
        if (!community || !delegator || !delegator.delegateTo) {
            return false;
        }
        
        const delegateId = delegator.delegateTo;
        const delegate = community.stakeholders.get(delegateId);
        
        if (delegate) {
            delegate.delegatedFrom.delete(delegatorId);
        }
        
        // Update delegation network
        const network = community.delegationNetwork.get(delegateId);
        if (network) {
            network.delete(delegatorId);
            if (network.size === 0) {
                community.delegationNetwork.delete(delegateId);
            }
        }
        
        delegator.delegateTo = null;
        
        this.emit('delegation_removed', {
            communityId,
            delegatorId,
            delegateId
        });
        
        return true;
    }

    // Consensus mechanisms
    buildConsensus(proposalId) {
        const proposal = this.proposals.get(proposalId);
        if (!proposal) return null;
        
        const community = this.communities.get(proposal.communityId);
        if (!community) return null;
        
        // Analyze voting patterns and build consensus
        const consensusData = {
            proposalId,
            currentSupport: this.calculateSupport(proposal),
            consensusLevel: this.calculateConsensusLevel(proposal),
            polarization: this.calculatePolarization(proposal),
            convergence: this.calculateConvergence(proposal),
            
            // Consensus building strategies
            mediationNeeded: false,
            compromiseOptions: [],
            stakeholderConcerns: [],
            
            // Timeline
            startTime: Date.now(),
            estimatedResolution: null,
            consensusThreshold: proposal.threshold
        };
        
        // Identify consensus building opportunities
        this.identifyConsensusOpportunities(proposal, consensusData);
        
        // Suggest compromise solutions
        this.generateCompromiseOptions(proposal, consensusData);
        
        return consensusData;
    }

    calculateSupport(proposal) {
        const totalVotes = proposal.yesVotes + proposal.noVotes + proposal.abstainVotes;
        return totalVotes > 0 ? proposal.yesVotes / totalVotes : 0;
    }

    calculateConsensusLevel(proposal) {
        const support = this.calculateSupport(proposal);
        const participation = proposal.participation;
        const community = this.communities.get(proposal.communityId);
        const totalMembers = community?.members.size || 1;
        
        const participationRate = participation / totalMembers;
        
        // Consensus is stronger with higher support and participation
        return support * participationRate;
    }

    // Process governance activities
    processGovernanceActivities() {
        // Update proposal statuses
        this.updateProposalStatuses();
        
        // Process delegations
        this.processDelegationEffects();
        
        // Update community health metrics
        this.updateCommunityHealthMetrics();
        
        // Check for governance events
        this.checkGovernanceEvents();
    }

    updateProposalStatuses() {
        const now = Date.now();
        
        for (const [proposalId, proposal] of this.proposals) {
            switch (proposal.status) {
                case 'discussion':
                    if (now >= proposal.votingStartsAt) {
                        proposal.status = 'voting';
                        this.emit('voting_started', { proposalId });
                    }
                    break;
                    
                case 'voting':
                    if (now >= proposal.votingEndsAt) {
                        this.concludeVoting(proposalId);
                    }
                    break;
                    
                case 'passed':
                    if (now >= proposal.votingEndsAt + proposal.executionDelay) {
                        this.executeProposal(proposalId);
                    }
                    break;
            }
        }
    }

    concludeVoting(proposalId) {
        const proposal = this.proposals.get(proposalId);
        if (!proposal) return;
        
        const community = this.communities.get(proposal.communityId);
        if (!community) return;
        
        // Calculate final results
        const support = this.calculateSupport(proposal);
        const totalMembers = community.members.size;
        const participationRate = proposal.participation / totalMembers;
        
        // Determine outcome
        const passed = support >= proposal.threshold && 
                      participationRate >= proposal.quorum;
        
        proposal.status = passed ? 'passed' : 'failed';
        proposal.result = {
            passed,
            support,
            participationRate,
            finalTally: {
                yes: proposal.yesVotes,
                no: proposal.noVotes,
                abstain: proposal.abstainVotes
            }
        };
        
        // Update community stats
        if (passed) {
            community.successfulProposals++;
        } else {
            community.failedProposals++;
        }
        
        community.activeProposals.delete(proposalId);
        community.decisions.push({
            proposalId,
            result: proposal.result,
            timestamp: Date.now()
        });
        
        this.emit('voting_concluded', {
            proposalId,
            passed,
            support,
            participationRate
        });
    }

    executeProposal(proposalId) {
        const proposal = this.proposals.get(proposalId);
        if (!proposal || proposal.status !== 'passed') return;
        
        proposal.status = 'executed';
        proposal.executedAt = Date.now();
        
        // Execute proposal actions
        this.executeProposalActions(proposal);
        
        this.emit('proposal_executed', {
            proposalId,
            communityId: proposal.communityId,
            actions: proposal.actions.length
        });
    }

    executeProposalActions(proposal) {
        // Implementation would depend on action types
        proposal.actions.forEach(action => {
            switch (action.type) {
                case 'budget_allocation':
                    this.allocateBudget(proposal.communityId, action.amount, action.purpose);
                    break;
                case 'rule_change':
                    this.updateCommunityRules(proposal.communityId, action.rules);
                    break;
                case 'member_action':
                    this.executeMemberAction(proposal.communityId, action);
                    break;
                case 'governance_change':
                    this.updateGovernanceStructure(proposal.communityId, action);
                    break;
            }
        });
    }

    // Analytics and reporting
    getCommunityGovernanceMetrics(communityId) {
        const community = this.communities.get(communityId);
        if (!community) return null;
        
        return {
            community: {
                id: communityId,
                members: community.members.size,
                governanceModel: community.governanceModel,
                votingSystem: community.votingSystem
            },
            
            participation: {
                averageParticipation: this.calculateAverageParticipation(communityId),
                activeMembers: this.countActiveMembers(communityId),
                delegationRate: this.calculateDelegationRate(communityId)
            },
            
            decision_making: {
                totalProposals: community.successfulProposals + community.failedProposals,
                successRate: this.calculateSuccessRate(community),
                averageConsensusTime: this.calculateAverageConsensusTime(communityId),
                consensusLevel: this.calculateAverageConsensusLevel(communityId)
            },
            
            health: {
                cohesion: community.cohesion,
                satisfaction: community.satisfaction,
                legitimacy: community.legitimacy,
                effectiveness: community.effectiveness
            },
            
            tokens: this.config.tokenSystemEnabled ? {
                totalSupply: community.tokens.totalSupply,
                distribution: this.analyzeTokenDistribution(communityId),
                activity: this.analyzeTokenActivity(communityId)
            } : null
        };
    }

    getGovernanceOverview() {
        return {
            communities: this.communities.size,
            totalMembers: this.getTotalMembers(),
            activeProposals: this.getActiveProposalCount(),
            totalDecisions: this.getTotalDecisionCount(),
            
            governance_models: this.getGovernanceModelDistribution(),
            participation_rates: this.getParticipationRateDistribution(),
            consensus_effectiveness: this.getConsensusEffectivenessMetrics(),
            
            token_metrics: this.config.tokenSystemEnabled ? 
                this.getTokenSystemMetrics() : null
        };
    }

    // Utility methods placeholder implementations
    getDefaultConstitution() {
        return {
            principles: ['transparency', 'accountability', 'participation'],
            rights: ['vote', 'propose', 'delegate', 'appeal'],
            procedures: ['discussion', 'voting', 'execution', 'review']
        };
    }

    updateMemberVotingPower(communityId, agentId) {
        const community = this.communities.get(communityId);
        const member = community?.stakeholders.get(agentId);
        
        if (community && member) {
            const power = this.calculateVotingPower(community, member);
            community.votingPower.set(agentId, power);
        }
    }

    // Cleanup
    stop() {
        if (this.governanceInterval) clearInterval(this.governanceInterval);
        if (this.tokenInterval) clearInterval(this.tokenInterval);
        if (this.healthInterval) clearInterval(this.healthInterval);
    }
}

module.exports = CommunityGovernance;
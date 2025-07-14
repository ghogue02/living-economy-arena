/**
 * DAO Framework
 * Decentralized Autonomous Organization infrastructure and governance structures
 */

class DAOFramework {
    constructor() {
        this.daos = new Map();
        this.daoTemplates = new Map();
        this.membershipRules = new Map();
        this.governance = new Map();
        this.treasury = new Map();
        this.modules = new Map();
        
        this.initializeTemplates();
    }

    initializeTemplates() {
        // Initialize standard DAO templates
        this.registerTemplate('basic-dao', new BasicDAOTemplate());
        this.registerTemplate('investment-dao', new InvestmentDAOTemplate());
        this.registerTemplate('protocol-dao', new ProtocolDAOTemplate());
        this.registerTemplate('social-dao', new SocialDAOTemplate());
        this.registerTemplate('guild-dao', new GuildDAOTemplate());
        this.registerTemplate('venture-dao', new VentureDAOTemplate());
    }

    registerTemplate(name, template) {
        this.daoTemplates.set(name, template);
    }

    // Create a new DAO
    async createDAO(config) {
        const {
            id,
            name,
            description,
            template = 'basic-dao',
            founders = [],
            initialConfig = {},
            treasuryConfig = {},
            governanceConfig = {},
            membershipConfig = {}
        } = config;

        if (this.daos.has(id)) {
            throw new Error('DAO with this ID already exists');
        }

        const templateInstance = this.daoTemplates.get(template);
        if (!templateInstance) {
            throw new Error(`Unknown DAO template: ${template}`);
        }

        // Create DAO structure
        const dao = {
            id,
            name,
            description,
            template,
            createdAt: Date.now(),
            status: 'active',
            founders,
            members: new Map(),
            roles: new Map(),
            proposals: new Map(),
            treasury: {
                assets: new Map(),
                transactions: [],
                ...treasuryConfig
            },
            governance: {
                votingMechanism: 'simple-majority',
                quorum: 0.1,
                proposalThreshold: 0.01,
                executionDelay: 24 * 60 * 60 * 1000, // 24 hours
                ...governanceConfig
            },
            membership: {
                type: 'open', // open, invite-only, token-gated
                requirements: [],
                maxMembers: Infinity,
                ...membershipConfig
            },
            modules: new Set(),
            metadata: initialConfig
        };

        // Initialize with template
        await templateInstance.initialize(dao);

        // Add founders as initial members
        for (const founder of founders) {
            await this.addMember(id, founder, 'founder');
        }

        this.daos.set(id, dao);
        this.governance.set(id, new DAOGovernance(dao));
        this.treasury.set(id, new DAOTreasury(dao));

        this.emitEvent('dao-created', { daoId: id, dao });

        return dao;
    }

    // Add member to DAO
    async addMember(daoId, memberId, role = 'member') {
        const dao = this.daos.get(daoId);
        if (!dao) {
            throw new Error('DAO not found');
        }

        // Check membership requirements
        const isEligible = await this.checkMembershipEligibility(dao, memberId);
        if (!isEligible) {
            throw new Error('Member does not meet eligibility requirements');
        }

        // Check member limit
        if (dao.members.size >= dao.membership.maxMembers) {
            throw new Error('DAO has reached maximum member limit');
        }

        const member = {
            id: memberId,
            role,
            joinedAt: Date.now(),
            votingPower: await this.calculateMemberVotingPower(dao, memberId),
            reputation: 0,
            contributions: [],
            delegations: new Map()
        };

        dao.members.set(memberId, member);

        this.emitEvent('member-added', { daoId, memberId, member });

        return member;
    }

    // Create proposal
    async createProposal(daoId, proposalConfig) {
        const dao = this.daos.get(daoId);
        if (!dao) {
            throw new Error('DAO not found');
        }

        const {
            id,
            title,
            description,
            type,
            proposerId,
            actions = [],
            metadata = {}
        } = proposalConfig;

        const governance = this.governance.get(daoId);
        const member = dao.members.get(proposerId);

        if (!member) {
            throw new Error('Proposer is not a DAO member');
        }

        // Check proposal threshold
        const hasThreshold = await governance.checkProposalThreshold(proposerId);
        if (!hasThreshold) {
            throw new Error('Proposer does not meet proposal threshold');
        }

        const proposal = {
            id,
            title,
            description,
            type,
            proposerId,
            actions,
            metadata,
            createdAt: Date.now(),
            status: 'active',
            votingStartTime: Date.now(),
            votingEndTime: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days
            votes: new Map(),
            results: null,
            executed: false
        };

        dao.proposals.set(id, proposal);

        this.emitEvent('proposal-created', { daoId, proposalId: id, proposal });

        return proposal;
    }

    // Vote on proposal
    async voteOnProposal(daoId, proposalId, voterId, vote) {
        const dao = this.daos.get(daoId);
        if (!dao) {
            throw new Error('DAO not found');
        }

        const proposal = dao.proposals.get(proposalId);
        if (!proposal) {
            throw new Error('Proposal not found');
        }

        const member = dao.members.get(voterId);
        if (!member) {
            throw new Error('Voter is not a DAO member');
        }

        if (proposal.status !== 'active') {
            throw new Error('Proposal voting is not active');
        }

        if (Date.now() > proposal.votingEndTime) {
            throw new Error('Voting period has ended');
        }

        const governance = this.governance.get(daoId);
        await governance.castVote(proposalId, voterId, vote);

        this.emitEvent('vote-cast', { daoId, proposalId, voterId, vote });
    }

    // Execute proposal
    async executeProposal(daoId, proposalId) {
        const dao = this.daos.get(daoId);
        const proposal = dao.proposals.get(proposalId);

        if (!proposal) {
            throw new Error('Proposal not found');
        }

        if (proposal.executed) {
            throw new Error('Proposal already executed');
        }

        const governance = this.governance.get(daoId);
        const canExecute = await governance.canExecuteProposal(proposalId);

        if (!canExecute) {
            throw new Error('Proposal cannot be executed');
        }

        // Execute proposal actions
        const results = [];
        for (const action of proposal.actions) {
            const result = await this.executeAction(daoId, action);
            results.push(result);
        }

        proposal.executed = true;
        proposal.executedAt = Date.now();
        proposal.executionResults = results;

        this.emitEvent('proposal-executed', { daoId, proposalId, results });

        return results;
    }

    // Execute specific action
    async executeAction(daoId, action) {
        const dao = this.daos.get(daoId);
        
        switch (action.type) {
            case 'transfer-funds':
                return await this.transferFunds(daoId, action.recipient, action.amount, action.token);
            
            case 'update-governance':
                return await this.updateGovernance(daoId, action.changes);
            
            case 'add-member':
                return await this.addMember(daoId, action.memberId, action.role);
            
            case 'remove-member':
                return await this.removeMember(daoId, action.memberId);
            
            case 'update-role':
                return await this.updateMemberRole(daoId, action.memberId, action.newRole);
            
            case 'install-module':
                return await this.installModule(daoId, action.moduleId, action.config);
            
            case 'custom':
                return await this.executeCustomAction(daoId, action);
            
            default:
                throw new Error(`Unknown action type: ${action.type}`);
        }
    }

    // Transfer funds from treasury
    async transferFunds(daoId, recipient, amount, token = 'ETH') {
        const treasury = this.treasury.get(daoId);
        return await treasury.transfer(recipient, amount, token);
    }

    // Update governance parameters
    async updateGovernance(daoId, changes) {
        const dao = this.daos.get(daoId);
        const governance = this.governance.get(daoId);
        
        Object.assign(dao.governance, changes);
        await governance.updateConfig(changes);
        
        return { updated: true, changes };
    }

    // Remove member
    async removeMember(daoId, memberId) {
        const dao = this.daos.get(daoId);
        const removed = dao.members.delete(memberId);
        
        if (removed) {
            this.emitEvent('member-removed', { daoId, memberId });
        }
        
        return { removed };
    }

    // Update member role
    async updateMemberRole(daoId, memberId, newRole) {
        const dao = this.daos.get(daoId);
        const member = dao.members.get(memberId);
        
        if (member) {
            member.role = newRole;
            member.votingPower = await this.calculateMemberVotingPower(dao, memberId);
            this.emitEvent('member-role-updated', { daoId, memberId, newRole });
        }
        
        return { updated: !!member };
    }

    // Install module
    async installModule(daoId, moduleId, config) {
        const dao = this.daos.get(daoId);
        const module = this.modules.get(moduleId);
        
        if (!module) {
            throw new Error(`Unknown module: ${moduleId}`);
        }
        
        await module.install(dao, config);
        dao.modules.add(moduleId);
        
        return { installed: true };
    }

    // Execute custom action
    async executeCustomAction(daoId, action) {
        // Extensible action system
        const handler = this.getActionHandler(action.handler);
        return await handler.execute(daoId, action.params);
    }

    // Check membership eligibility
    async checkMembershipEligibility(dao, memberId) {
        const requirements = dao.membership.requirements;
        
        for (const requirement of requirements) {
            const met = await this.checkRequirement(requirement, memberId);
            if (!met) {
                return false;
            }
        }
        
        return true;
    }

    // Check specific requirement
    async checkRequirement(requirement, memberId) {
        switch (requirement.type) {
            case 'token-balance':
                const balance = await this.getTokenBalance(memberId, requirement.token);
                return balance >= requirement.minAmount;
            
            case 'nft-ownership':
                const owns = await this.ownsNFT(memberId, requirement.contract, requirement.tokenId);
                return owns;
            
            case 'reputation':
                const reputation = await this.getReputation(memberId);
                return reputation >= requirement.minReputation;
            
            case 'invitation':
                return await this.hasValidInvitation(memberId, requirement.inviterId);
            
            default:
                return true;
        }
    }

    // Calculate member voting power
    async calculateMemberVotingPower(dao, memberId) {
        // Base implementation - can be overridden by templates
        const member = dao.members.get(memberId);
        if (!member) return 0;
        
        let power = 1; // Base power
        
        // Role-based power
        const rolePower = this.getRolePower(member.role);
        power *= rolePower;
        
        // Reputation-based power
        if (dao.governance.reputationWeighted) {
            power *= Math.sqrt(member.reputation + 1);
        }
        
        // Token-based power
        if (dao.governance.tokenWeighted) {
            const tokenBalance = await this.getTokenBalance(memberId, dao.governance.governanceToken);
            power *= Math.sqrt(tokenBalance + 1);
        }
        
        return power;
    }

    // Get role-based voting power
    getRolePower(role) {
        const rolePowers = {
            'founder': 3,
            'admin': 2,
            'member': 1,
            'contributor': 0.5
        };
        return rolePowers[role] || 1;
    }

    // DAO status and analytics
    getDAOStatus(daoId) {
        const dao = this.daos.get(daoId);
        if (!dao) return null;

        const governance = this.governance.get(daoId);
        const treasury = this.treasury.get(daoId);

        return {
            id: dao.id,
            name: dao.name,
            status: dao.status,
            memberCount: dao.members.size,
            activeProposals: Array.from(dao.proposals.values()).filter(p => p.status === 'active').length,
            treasuryValue: treasury.getTotalValue(),
            lastActivity: this.getLastActivity(dao),
            healthScore: this.calculateHealthScore(dao)
        };
    }

    // Calculate DAO health score
    calculateHealthScore(dao) {
        let score = 100;
        
        // Member activity
        const activeMembers = this.getActiveMemberCount(dao);
        const memberActivityRatio = activeMembers / dao.members.size;
        score *= memberActivityRatio;
        
        // Proposal activity
        const recentProposals = this.getRecentProposalCount(dao);
        if (recentProposals === 0) score *= 0.8;
        
        // Treasury health
        const treasury = this.treasury.get(dao.id);
        const treasuryHealth = treasury.getHealthScore();
        score *= treasuryHealth;
        
        return Math.max(0, Math.min(100, score));
    }

    // Helper methods
    getActiveMemberCount(dao) {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        return Array.from(dao.members.values()).filter(member => 
            member.lastActivity > thirtyDaysAgo
        ).length;
    }

    getRecentProposalCount(dao) {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
        return Array.from(dao.proposals.values()).filter(proposal => 
            proposal.createdAt > thirtyDaysAgo
        ).length;
    }

    getLastActivity(dao) {
        let lastActivity = dao.createdAt;
        
        for (const proposal of dao.proposals.values()) {
            if (proposal.createdAt > lastActivity) {
                lastActivity = proposal.createdAt;
            }
        }
        
        return lastActivity;
    }

    // External integrations (mocked)
    async getTokenBalance(memberId, token) {
        return 1000; // Mock
    }

    async ownsNFT(memberId, contract, tokenId) {
        return true; // Mock
    }

    async getReputation(memberId) {
        return 75; // Mock
    }

    async hasValidInvitation(memberId, inviterId) {
        return true; // Mock
    }

    getActionHandler(handlerName) {
        // Return custom action handler
        return {
            execute: async (daoId, params) => ({ success: true })
        };
    }

    emitEvent(eventType, data) {
        console.log(`[DAO Event] ${eventType}:`, data);
    }
}

// DAO Governance System
class DAOGovernance {
    constructor(dao) {
        this.dao = dao;
        this.votingEngine = new (require('../voting/decentralized-voting-engine').DecentralizedVotingEngine)();
    }

    async checkProposalThreshold(proposerId) {
        const member = this.dao.members.get(proposerId);
        if (!member) return false;
        
        const totalVotingPower = this.getTotalVotingPower();
        const requiredPower = totalVotingPower * this.dao.governance.proposalThreshold;
        
        return member.votingPower >= requiredPower;
    }

    async castVote(proposalId, voterId, vote) {
        const proposal = this.dao.proposals.get(proposalId);
        const member = this.dao.members.get(voterId);
        
        proposal.votes.set(voterId, {
            vote,
            votingPower: member.votingPower,
            timestamp: Date.now()
        });
    }

    async canExecuteProposal(proposalId) {
        const proposal = this.dao.proposals.get(proposalId);
        
        if (Date.now() < proposal.votingEndTime) {
            return false;
        }
        
        if (Date.now() < proposal.votingEndTime + this.dao.governance.executionDelay) {
            return false;
        }
        
        // Check quorum
        const totalVotingPower = this.getTotalVotingPower();
        const votedPower = Array.from(proposal.votes.values())
            .reduce((sum, vote) => sum + vote.votingPower, 0);
        
        const quorumMet = (votedPower / totalVotingPower) >= this.dao.governance.quorum;
        
        if (!quorumMet) {
            return false;
        }
        
        // Check if proposal passed
        return this.calculateProposalResult(proposal).passed;
    }

    calculateProposalResult(proposal) {
        const votes = { for: 0, against: 0, abstain: 0 };
        
        for (const voteData of proposal.votes.values()) {
            votes[voteData.vote] += voteData.votingPower;
        }
        
        const totalVoted = votes.for + votes.against + votes.abstain;
        const passed = votes.for > votes.against;
        
        return {
            passed,
            votes,
            totalVoted,
            forPercentage: totalVoted > 0 ? (votes.for / totalVoted) * 100 : 0
        };
    }

    getTotalVotingPower() {
        return Array.from(this.dao.members.values())
            .reduce((sum, member) => sum + member.votingPower, 0);
    }

    async updateConfig(changes) {
        // Update governance configuration
        Object.assign(this.dao.governance, changes);
    }
}

// DAO Treasury System
class DAOTreasury {
    constructor(dao) {
        this.dao = dao;
    }

    async transfer(recipient, amount, token) {
        const balance = this.dao.treasury.assets.get(token) || 0;
        
        if (balance < amount) {
            throw new Error('Insufficient treasury balance');
        }
        
        this.dao.treasury.assets.set(token, balance - amount);
        
        const transaction = {
            type: 'transfer',
            recipient,
            amount,
            token,
            timestamp: Date.now(),
            txHash: this.generateTxHash()
        };
        
        this.dao.treasury.transactions.push(transaction);
        
        return transaction;
    }

    getTotalValue() {
        // Calculate total treasury value in USD equivalent
        let total = 0;
        for (const [token, amount] of this.dao.treasury.assets) {
            const price = this.getTokenPrice(token);
            total += amount * price;
        }
        return total;
    }

    getHealthScore() {
        const totalValue = this.getTotalValue();
        const memberCount = this.dao.members.size;
        const valuePerMember = totalValue / memberCount;
        
        // Health based on treasury size relative to member count
        if (valuePerMember > 10000) return 1.0;
        if (valuePerMember > 1000) return 0.8;
        if (valuePerMember > 100) return 0.6;
        return 0.4;
    }

    getTokenPrice(token) {
        // Mock price oracle
        const prices = {
            'ETH': 2000,
            'USDC': 1,
            'DAI': 1
        };
        return prices[token] || 1;
    }

    generateTxHash() {
        return Math.random().toString(36).substring(2, 15);
    }
}

// DAO Templates
class BasicDAOTemplate {
    async initialize(dao) {
        dao.governance.votingMechanism = 'simple-majority';
        dao.governance.quorum = 0.1;
        dao.membership.type = 'open';
    }
}

class InvestmentDAOTemplate {
    async initialize(dao) {
        dao.governance.votingMechanism = 'supermajority';
        dao.governance.quorum = 0.3;
        dao.membership.type = 'token-gated';
        dao.membership.requirements = [{
            type: 'token-balance',
            token: 'INVESTMENT_TOKEN',
            minAmount: 1000
        }];
    }
}

class ProtocolDAOTemplate {
    async initialize(dao) {
        dao.governance.votingMechanism = 'quadratic';
        dao.governance.tokenWeighted = true;
        dao.membership.type = 'token-gated';
    }
}

class SocialDAOTemplate {
    async initialize(dao) {
        dao.governance.votingMechanism = 'ranked-choice';
        dao.governance.reputationWeighted = true;
        dao.membership.type = 'invite-only';
    }
}

class GuildDAOTemplate {
    async initialize(dao) {
        dao.governance.votingMechanism = 'conviction';
        dao.membership.type = 'open';
        dao.governance.specialRoles = true;
    }
}

class VentureDAOTemplate {
    async initialize(dao) {
        dao.governance.votingMechanism = 'supermajority';
        dao.governance.quorum = 0.5;
        dao.membership.type = 'invite-only';
        dao.governance.executionDelay = 7 * 24 * 60 * 60 * 1000; // 7 days
    }
}

module.exports = {
    DAOFramework,
    DAOGovernance,
    DAOTreasury,
    BasicDAOTemplate,
    InvestmentDAOTemplate,
    ProtocolDAOTemplate,
    SocialDAOTemplate,
    GuildDAOTemplate,
    VentureDAOTemplate
};
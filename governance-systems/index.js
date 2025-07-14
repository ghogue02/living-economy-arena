/**
 * Governance Systems - Main Entry Point
 * Decentralized governance and voting systems for the Living Economy Arena
 */

const { GovernanceOrchestrator } = require('./core/governance-orchestrator');
const { DecentralizedVotingEngine } = require('./voting/decentralized-voting-engine');
const { DAOFramework } = require('./dao/dao-framework');
const { GovernanceTokenSystem } = require('./core/governance-token-system');
const { ConsensusMechanismEngine } = require('./consensus/consensus-mechanisms');
const { ProposalReferendumSystem } = require('./proposals/proposal-referendum-system');
const { GovernanceAnalytics } = require('./analytics/governance-analytics');

class GovernanceSystem {
    constructor(config = {}) {
        this.config = {
            enableAnalytics: true,
            enableSecurity: true,
            autoExecution: true,
            securityLevel: 'high',
            ...config
        };

        // Initialize the orchestrator which manages all components
        this.orchestrator = new GovernanceOrchestrator(this.config);
        
        // Direct access to components for advanced usage
        this.components = {
            voting: this.orchestrator.votingEngine,
            dao: this.orchestrator.daoFramework,
            tokens: this.orchestrator.tokenSystem,
            consensus: this.orchestrator.consensusEngine,
            proposals: this.orchestrator.proposalSystem,
            analytics: this.orchestrator.analytics
        };

        this.initialized = false;
    }

    // Initialize the governance system
    async initialize() {
        if (this.initialized) {
            throw new Error('Governance system already initialized');
        }

        try {
            await this.orchestrator.initializeOrchestrator();
            this.initialized = true;
            
            console.log('🏛️ Governance System initialized successfully');
            console.log('📊 Components active:', Object.keys(this.components).length);
            
            return {
                success: true,
                timestamp: Date.now(),
                components: this.getComponentStatus()
            };
        } catch (error) {
            console.error('❌ Failed to initialize governance system:', error);
            throw error;
        }
    }

    // Quick start methods for common use cases

    // Create a basic DAO with token governance
    async createBasicDAO(config) {
        this.ensureInitialized();
        
        const {
            name,
            description,
            founders = [],
            initialTokenSupply = 1000000,
            votingMechanism = 'simple-majority'
        } = config;

        const daoId = `dao-${Date.now()}`;
        const tokenId = `${daoId}-token`;

        // Create governance token
        const token = await this.components.tokens.createToken(tokenId, {
            name: `${name} Governance Token`,
            symbol: name.substring(0, 4).toUpperCase(),
            totalSupply: initialTokenSupply,
            transferable: true,
            votingPower: 1,
            features: ['delegation', 'staking', 'snapshot']
        });

        // Create DAO
        const dao = await this.components.dao.createDAO({
            id: daoId,
            name,
            description,
            template: 'basic-dao',
            founders,
            governanceConfig: {
                votingMechanism,
                tokenWeighted: true,
                governanceToken: tokenId
            }
        });

        // Distribute initial tokens to founders
        if (founders.length > 0) {
            const tokensPerFounder = Math.floor(initialTokenSupply * 0.1 / founders.length);
            for (const founder of founders) {
                await this.components.tokens.mintTokens(tokenId, founder, tokensPerFounder, 'founder-allocation');
            }
        }

        return {
            dao,
            token,
            daoId,
            tokenId,
            quickAccess: {
                createProposal: (proposalConfig) => this.createProposal(daoId, proposalConfig),
                vote: (proposalId, voterId, vote) => this.castVote(daoId, proposalId, voterId, vote),
                getStatus: () => this.getGovernanceStatus(daoId)
            }
        };
    }

    // Create a voting-only governance system
    async createVotingSystem(config) {
        this.ensureInitialized();
        
        const {
            name,
            eligibilityRules = [],
            votingMechanism = 'simple-majority',
            votingPowerRules = {}
        } = config;

        const systemId = `voting-${Date.now()}`;

        const governance = await this.orchestrator.createGovernance({
            id: systemId,
            type: 'token-voting',
            tokenConfig: {
                name: `${name} Voting Token`,
                symbol: name.substring(0, 4).toUpperCase(),
                totalSupply: 1000000,
                transferable: false,
                features: ['non-transferable', 'reputation-based']
            }
        });

        return {
            governance,
            systemId,
            quickAccess: {
                createVote: (voteConfig) => this.components.voting.createVote(systemId, {
                    ...voteConfig,
                    mechanism: votingMechanism,
                    eligibilityRules,
                    votingPowerRules
                }),
                castVote: (voteId, voterId, vote) => this.components.voting.castVote(voteId, voterId, vote),
                getResults: (voteId) => this.components.voting.calculateResults(voteId)
            }
        };
    }

    // Create a consensus-based governance system
    async createConsensusSystem(config) {
        this.ensureInitialized();
        
        const {
            name,
            mechanism = 'proof-of-stake',
            validators = [],
            stakingRequired = true
        } = config;

        const systemId = `consensus-${Date.now()}`;

        // Register validators
        for (const validator of validators) {
            await this.components.consensus.registerValidator(validator.id, {
                publicKey: validator.publicKey,
                stake: validator.stake || 0,
                authority: validator.authority || false,
                metadata: validator.metadata || {}
            });
        }

        const governance = await this.orchestrator.createGovernance({
            id: systemId,
            type: 'consensus',
            consensusConfig: {
                mechanism,
                validators: validators.map(v => v.id),
                stakingRequired
            }
        });

        return {
            governance,
            systemId,
            quickAccess: {
                initiateConsensus: (roundConfig) => this.orchestrator.executeConsensus({
                    ...roundConfig,
                    governanceId: systemId,
                    mechanism
                }),
                submitMessage: (roundId, validatorId, message) => 
                    this.components.consensus.submitConsensusMessage(roundId, validatorId, message),
                getStatus: (roundId) => this.components.consensus.getConsensusStatus(roundId)
            }
        };
    }

    // Main governance operations

    async createProposal(governanceId, proposalConfig) {
        this.ensureInitialized();
        return await this.orchestrator.submitProposal(governanceId, proposalConfig);
    }

    async castVote(governanceId, proposalId, voterId, vote) {
        this.ensureInitialized();
        return await this.orchestrator.castVote(governanceId, proposalId, voterId, vote);
    }

    async delegateVotingPower(governanceId, delegatorId, delegateId, amount) {
        this.ensureInitialized();
        return await this.orchestrator.delegateVotingPower(governanceId, delegatorId, delegateId, amount);
    }

    async createReferendum(referendumConfig) {
        this.ensureInitialized();
        return await this.components.proposals.createReferendum(referendumConfig);
    }

    // Analytics and monitoring

    getGovernanceStatus(governanceId) {
        this.ensureInitialized();
        return this.orchestrator.getGovernanceStatus(governanceId);
    }

    getSystemAnalytics() {
        this.ensureInitialized();
        return this.orchestrator.getSystemAnalytics();
    }

    getProposalAnalytics(proposalId) {
        this.ensureInitialized();
        if (!this.components.analytics) {
            throw new Error('Analytics not enabled');
        }
        return this.components.analytics.getProposalAnalytics(proposalId);
    }

    getParticipantAnalytics(participantId) {
        this.ensureInitialized();
        if (!this.components.analytics) {
            throw new Error('Analytics not enabled');
        }
        return this.components.analytics.getParticipantAnalytics(participantId);
    }

    getGovernanceTrends(timeRange = '30d') {
        this.ensureInitialized();
        if (!this.components.analytics) {
            throw new Error('Analytics not enabled');
        }
        return this.components.analytics.getGovernanceTrends(timeRange);
    }

    // Advanced features

    async optimizeGovernance(governanceId) {
        this.ensureInitialized();
        return await this.orchestrator.optimizeGovernanceParameters(governanceId);
    }

    async createCrossGovernanceProposal(proposalConfig) {
        this.ensureInitialized();
        return await this.orchestrator.createCrossGovernanceProposal(proposalConfig);
    }

    registerIntegration(name, integration) {
        this.ensureInitialized();
        return this.orchestrator.registerIntegration(name, integration);
    }

    async executeIntegration(name, operation, params) {
        this.ensureInitialized();
        return await this.orchestrator.executeIntegration(name, operation, params);
    }

    // Token operations

    async createGovernanceToken(tokenConfig) {
        this.ensureInitialized();
        return await this.components.tokens.createToken(tokenConfig.id, tokenConfig);
    }

    async mintTokens(tokenId, recipient, amount, reason) {
        this.ensureInitialized();
        return await this.components.tokens.mintTokens(tokenId, recipient, amount, reason);
    }

    async transferTokens(tokenId, from, to, amount) {
        this.ensureInitialized();
        return await this.components.tokens.transferTokens(tokenId, from, to, amount);
    }

    async stakeTokens(tokenId, staker, amount, duration) {
        this.ensureInitialized();
        return await this.components.tokens.stakeTokens(tokenId, staker, amount, duration);
    }

    async createVestingSchedule(tokenId, beneficiary, totalAmount, startTime, duration, cliffDuration) {
        this.ensureInitialized();
        return this.components.tokens.createVestingSchedule(tokenId, beneficiary, totalAmount, startTime, duration, cliffDuration);
    }

    async createTokenSnapshot(tokenId, blockNumber) {
        this.ensureInitialized();
        return this.components.tokens.createSnapshot(tokenId, blockNumber);
    }

    // Utility methods

    getTokenInfo(tokenId) {
        this.ensureInitialized();
        return this.components.tokens.getTokenInfo(tokenId);
    }

    getTokenHolderInfo(tokenId, holderId) {
        this.ensureInitialized();
        return this.components.tokens.getHolderInfo(tokenId, holderId);
    }

    getTopTokenHolders(tokenId, limit = 10) {
        this.ensureInitialized();
        return this.components.tokens.getTopHolders(tokenId, limit);
    }

    getTokenAnalytics(tokenId) {
        this.ensureInitialized();
        return this.components.tokens.getTokenAnalytics(tokenId);
    }

    getComponentStatus() {
        return {
            initialized: this.initialized,
            orchestrator: this.orchestrator ? 'active' : 'inactive',
            components: this.orchestrator ? this.orchestrator.getComponentStatus() : {}
        };
    }

    getSystemHealth() {
        this.ensureInitialized();
        const analytics = this.getSystemAnalytics();
        const health = analytics?.health || { overall: 0 };
        
        return {
            score: health.overall,
            status: health.overall >= 80 ? 'healthy' : health.overall >= 60 ? 'warning' : 'critical',
            components: health.components || {},
            recommendations: health.recommendations || []
        };
    }

    // Event handling
    onEvent(eventType, callback) {
        this.ensureInitialized();
        // Event subscription would be implemented here
        console.log(`Subscribed to ${eventType} events`);
    }

    // Helper methods
    ensureInitialized() {
        if (!this.initialized) {
            throw new Error('Governance system not initialized. Call initialize() first.');
        }
    }

    // Static factory methods for quick setup
    static async createBasicSetup(config = {}) {
        const system = new GovernanceSystem(config);
        await system.initialize();
        return system;
    }

    static async createDAOSetup(daoConfig) {
        const system = new GovernanceSystem();
        await system.initialize();
        const dao = await system.createBasicDAO(daoConfig);
        return { system, dao };
    }

    static async createVotingSetup(votingConfig) {
        const system = new GovernanceSystem();
        await system.initialize();
        const voting = await system.createVotingSystem(votingConfig);
        return { system, voting };
    }

    // Demo and testing methods
    async runDemo() {
        console.log('🚀 Starting Governance System Demo...');
        
        // Create demo DAO
        const dao = await this.createBasicDAO({
            name: 'Demo DAO',
            description: 'A demonstration DAO for testing governance features',
            founders: ['alice', 'bob', 'charlie'],
            initialTokenSupply: 1000000
        });

        console.log('✅ Created demo DAO:', dao.daoId);

        // Create demo proposal
        const proposal = await dao.quickAccess.createProposal({
            id: 'demo-proposal-1',
            title: 'Increase community funding',
            description: 'Proposal to increase funding for community initiatives',
            type: 'treasury-spending',
            proposerId: 'alice',
            actions: [{
                type: 'transfer-funds',
                recipient: 'community-fund',
                amount: 10000,
                token: 'ETH'
            }]
        });

        console.log('✅ Created demo proposal:', proposal.id);

        // Cast demo votes
        await dao.quickAccess.vote(proposal.id, 'alice', 'approve');
        await dao.quickAccess.vote(proposal.id, 'bob', 'approve');
        await dao.quickAccess.vote(proposal.id, 'charlie', 'reject');

        console.log('✅ Cast demo votes');

        // Get status
        const status = dao.quickAccess.getStatus();
        console.log('📊 DAO Status:', status);

        // Get analytics if available
        if (this.components.analytics) {
            const analytics = this.getSystemAnalytics();
            console.log('📈 System Analytics:', analytics);
        }

        console.log('🏁 Demo completed successfully!');

        return {
            dao,
            proposal,
            status,
            analytics: this.components.analytics ? this.getSystemAnalytics() : null
        };
    }
}

// Export main class and components
module.exports = {
    GovernanceSystem,
    GovernanceOrchestrator,
    DecentralizedVotingEngine,
    DAOFramework,
    GovernanceTokenSystem,
    ConsensusMechanismEngine,
    ProposalReferendumSystem,
    GovernanceAnalytics
};

// For ES6 imports
module.exports.default = GovernanceSystem;
/**
 * Governance Systems Orchestrator
 * Main integration point for all governance components
 */

const { DecentralizedVotingEngine } = require('../voting/decentralized-voting-engine');
const { DAOFramework } = require('../dao/dao-framework');
const { GovernanceTokenSystem } = require('./governance-token-system');
const { ConsensusMechanismEngine } = require('../consensus/consensus-mechanisms');
const { ProposalReferendumSystem } = require('../proposals/proposal-referendum-system');
const { GovernanceAnalytics } = require('../analytics/governance-analytics');

class GovernanceOrchestrator {
    constructor(config = {}) {
        this.config = {
            enableAnalytics: true,
            enableSecurity: true,
            autoExecution: true,
            ...config
        };

        // Initialize core components
        this.votingEngine = new DecentralizedVotingEngine();
        this.daoFramework = new DAOFramework();
        this.tokenSystem = new GovernanceTokenSystem();
        this.consensusEngine = new ConsensusMechanismEngine();
        this.proposalSystem = new ProposalReferendumSystem();
        
        if (this.config.enableAnalytics) {
            this.analytics = new GovernanceAnalytics();
        }

        // System state
        this.activeGovernances = new Map();
        this.systemMetrics = new Map();
        this.eventHistory = [];
        this.integrations = new Map();

        this.initializeOrchestrator();
    }

    async initializeOrchestrator() {
        // Set up event listeners between components
        this.setupEventListeners();
        
        // Initialize system governance token
        await this.initializeSystemGovernance();
        
        // Start monitoring services
        this.startMonitoring();

        this.emitEvent('orchestrator-initialized', {
            timestamp: Date.now(),
            components: this.getComponentStatus()
        });
    }

    setupEventListeners() {
        // Voting engine events
        this.votingEngine.on = this.createEventListener('voting-engine');
        
        // DAO framework events  
        this.daoFramework.on = this.createEventListener('dao-framework');
        
        // Token system events
        this.tokenSystem.on = this.createEventListener('token-system');
        
        // Consensus engine events
        this.consensusEngine.on = this.createEventListener('consensus-engine');
        
        // Proposal system events
        this.proposalSystem.on = this.createEventListener('proposal-system');
    }

    createEventListener(source) {
        return (eventType, data) => {
            const event = {
                source,
                type: eventType,
                data,
                timestamp: Date.now()
            };

            this.eventHistory.push(event);
            this.handleSystemEvent(event);

            // Record analytics if enabled
            if (this.analytics && this.isVotingEvent(eventType)) {
                this.analytics.recordVotingData(this.extractVotingData(event));
            }
        };
    }

    async initializeSystemGovernance() {
        // Create system governance DAO
        const systemDAO = await this.daoFramework.createDAO({
            id: 'system-governance',
            name: 'System Governance DAO',
            description: 'Governance for the overall governance system',
            template: 'protocol-dao',
            founders: ['system'],
            governanceConfig: {
                votingMechanism: 'quadratic',
                quorum: 0.2,
                proposalThreshold: 0.05
            }
        });

        // Initialize governance tokens for the system
        await this.tokenSystem.createToken('SYS_GOV', {
            name: 'System Governance Token',
            symbol: 'SGOV',
            totalSupply: 1000000,
            votingPower: 1,
            features: ['delegation', 'staking', 'snapshot']
        });

        this.systemDAO = systemDAO;
    }

    startMonitoring() {
        // Monitor system health every minute
        setInterval(() => {
            this.updateSystemMetrics();
        }, 60000);

        // Cleanup old events every hour
        setInterval(() => {
            this.cleanupOldEvents();
        }, 3600000);
    }

    // Main governance operations

    // Create new governance instance
    async createGovernance(config) {
        const {
            id,
            type = 'dao',
            tokenConfig,
            daoConfig,
            consensusConfig,
            proposalConfig
        } = config;

        if (this.activeGovernances.has(id)) {
            throw new Error('Governance instance already exists');
        }

        const governance = {
            id,
            type,
            createdAt: Date.now(),
            status: 'active',
            components: {}
        };

        // Initialize based on type
        switch (type) {
            case 'dao':
                governance.components.dao = await this.daoFramework.createDAO(daoConfig);
                break;
            
            case 'token-voting':
                governance.components.token = await this.tokenSystem.createToken(id, tokenConfig);
                break;
            
            case 'consensus':
                governance.components.consensus = await this.consensusEngine.registerValidator(id, consensusConfig);
                break;
            
            case 'hybrid':
                // Initialize multiple components
                if (daoConfig) {
                    governance.components.dao = await this.daoFramework.createDAO(daoConfig);
                }
                if (tokenConfig) {
                    governance.components.token = await this.tokenSystem.createToken(id, tokenConfig);
                }
                if (consensusConfig) {
                    governance.components.consensus = await this.consensusEngine.registerValidator(id, consensusConfig);
                }
                break;
        }

        this.activeGovernances.set(id, governance);

        this.emitEvent('governance-created', { governanceId: id, governance });

        return governance;
    }

    // Submit proposal through orchestrator
    async submitProposal(governanceId, proposalConfig) {
        const governance = this.activeGovernances.get(governanceId);
        if (!governance) {
            throw new Error('Governance instance not found');
        }

        // Route to appropriate system based on governance type
        let proposal;
        
        if (governance.components.dao) {
            proposal = await this.daoFramework.createProposal(governanceId, proposalConfig);
        } else {
            proposal = await this.proposalSystem.createProposal(proposalConfig);
        }

        // Track proposal in orchestrator
        this.trackProposal(governanceId, proposal);

        return proposal;
    }

    // Cast vote through orchestrator
    async castVote(governanceId, proposalId, voterId, vote) {
        const governance = this.activeGovernances.get(governanceId);
        if (!governance) {
            throw new Error('Governance instance not found');
        }

        let result;

        // Route vote to appropriate system
        if (governance.components.dao) {
            result = await this.daoFramework.voteOnProposal(governanceId, proposalId, voterId, vote);
        } else {
            result = await this.proposalSystem.castVote(proposalId, voterId, vote);
        }

        // Record analytics
        if (this.analytics) {
            const votingData = {
                proposalId,
                voterId,
                vote,
                votingPower: await this.getVotingPower(governanceId, voterId),
                timestamp: Date.now(),
                mechanism: governance.type,
                metadata: { governanceId }
            };
            
            this.analytics.recordVotingData(votingData);
        }

        return result;
    }

    // Delegate voting power
    async delegateVotingPower(governanceId, delegatorId, delegateId, amount) {
        const governance = this.activeGovernances.get(governanceId);
        if (!governance) {
            throw new Error('Governance instance not found');
        }

        let result;

        if (governance.components.token) {
            const tokenId = Object.keys(governance.components.token)[0];
            result = await this.tokenSystem.delegateVotingPower(tokenId, delegatorId, delegateId, amount);
        } else if (governance.components.dao) {
            // Implement DAO delegation
            result = await this.daoFramework.delegateVote(governanceId, delegatorId, delegateId);
        }

        this.emitEvent('voting-power-delegated', {
            governanceId,
            delegatorId,
            delegateId,
            amount
        });

        return result;
    }

    // Execute consensus round
    async executeConsensus(consensusConfig) {
        const {
            roundId,
            governanceId,
            validators,
            proposal,
            mechanism = 'proof-of-stake'
        } = consensusConfig;

        // Get validators from governance if not provided
        let validatorSet = validators;
        if (!validatorSet && governanceId) {
            validatorSet = await this.getValidatorSet(governanceId);
        }

        const consensusRound = await this.consensusEngine.initializeConsensusRound(roundId, {
            mechanism,
            validators: validatorSet,
            proposal
        });

        return consensusRound;
    }

    // Get comprehensive governance status
    getGovernanceStatus(governanceId) {
        const governance = this.activeGovernances.get(governanceId);
        if (!governance) {
            return null;
        }

        const status = {
            id: governanceId,
            type: governance.type,
            status: governance.status,
            createdAt: governance.createdAt,
            components: {}
        };

        // Get status from each component
        if (governance.components.dao) {
            status.components.dao = this.daoFramework.getDAOStatus(governanceId);
        }

        if (governance.components.token) {
            const tokenId = Object.keys(governance.components.token)[0];
            status.components.token = this.tokenSystem.getTokenInfo(tokenId);
        }

        if (governance.components.consensus) {
            // Add consensus status
            status.components.consensus = this.consensusEngine.getValidatorSet('proof-of-stake');
        }

        // Add analytics if available
        if (this.analytics) {
            status.analytics = this.analytics.getGovernanceTrends();
        }

        return status;
    }

    // Get system-wide analytics
    getSystemAnalytics() {
        if (!this.analytics) {
            return null;
        }

        return {
            overview: {
                activeGovernances: this.activeGovernances.size,
                totalProposals: this.getTotalProposals(),
                totalVotes: this.getTotalVotes(),
                systemHealth: this.calculateSystemHealth()
            },
            governance: this.analytics.getGovernanceTrends(),
            network: this.analytics.getNetworkAnalysis(),
            health: this.analytics.calculateGovernanceHealthScore()
        };
    }

    // Cross-governance operations

    // Create cross-governance proposal
    async createCrossGovernanceProposal(proposalConfig) {
        const {
            affectedGovernances,
            coordinationMechanism = 'sequential',
            ...baseConfig
        } = proposalConfig;

        const crossProposal = {
            id: baseConfig.id,
            type: 'cross-governance',
            affectedGovernances,
            coordinationMechanism,
            baseConfig,
            status: 'pending',
            results: new Map(),
            createdAt: Date.now()
        };

        // Execute based on coordination mechanism
        switch (coordinationMechanism) {
            case 'sequential':
                await this.executeSequentialProposal(crossProposal);
                break;
            
            case 'parallel':
                await this.executeParallelProposal(crossProposal);
                break;
            
            case 'consensus':
                await this.executeConsensusProposal(crossProposal);
                break;
        }

        return crossProposal;
    }

    // System maintenance and optimization

    // Optimize governance parameters
    async optimizeGovernanceParameters(governanceId) {
        const governance = this.activeGovernances.get(governanceId);
        if (!governance) {
            throw new Error('Governance instance not found');
        }

        const analytics = this.analytics?.getGovernanceHealthScore();
        if (!analytics) {
            throw new Error('Analytics not available for optimization');
        }

        const optimizations = [];

        // Analyze participation and suggest improvements
        if (analytics.components.participation < 70) {
            optimizations.push({
                parameter: 'quorum',
                suggestion: 'reduce',
                reason: 'Low participation detected'
            });
        }

        // Analyze power distribution
        if (analytics.components.distribution < 60) {
            optimizations.push({
                parameter: 'votingMechanism',
                suggestion: 'quadratic',
                reason: 'High power concentration detected'
            });
        }

        return optimizations;
    }

    // System health monitoring
    updateSystemMetrics() {
        const metrics = {
            timestamp: Date.now(),
            activeGovernances: this.activeGovernances.size,
            systemLoad: this.calculateSystemLoad(),
            eventRate: this.calculateEventRate(),
            errorRate: this.calculateErrorRate(),
            memoryUsage: this.getMemoryUsage()
        };

        this.systemMetrics.set(Date.now(), metrics);
        
        // Keep only last 24 hours of metrics
        const cutoff = Date.now() - (24 * 60 * 60 * 1000);
        for (const [timestamp, _] of this.systemMetrics) {
            if (timestamp < cutoff) {
                this.systemMetrics.delete(timestamp);
            }
        }
    }

    // Integration management
    registerIntegration(name, integration) {
        this.integrations.set(name, integration);
        
        this.emitEvent('integration-registered', { name, integration });
    }

    async executeIntegration(name, operation, params) {
        const integration = this.integrations.get(name);
        if (!integration) {
            throw new Error(`Integration '${name}' not found`);
        }

        return await integration.execute(operation, params);
    }

    // Helper methods
    async getVotingPower(governanceId, voterId) {
        const governance = this.activeGovernances.get(governanceId);
        
        if (governance.components.token) {
            const tokenId = Object.keys(governance.components.token)[0];
            return await this.tokenSystem.calculateVotingPower(tokenId, voterId);
        }
        
        if (governance.components.dao) {
            const dao = this.daoFramework.daos.get(governanceId);
            const member = dao?.members.get(voterId);
            return member?.votingPower || 0;
        }
        
        return 1; // Default voting power
    }

    async getValidatorSet(governanceId) {
        const governance = this.activeGovernances.get(governanceId);
        
        if (governance.components.dao) {
            const dao = this.daoFramework.daos.get(governanceId);
            return Array.from(dao.members.keys());
        }
        
        return [];
    }

    trackProposal(governanceId, proposal) {
        // Track proposal lifecycle for analytics and monitoring
        this.emitEvent('proposal-tracked', {
            governanceId,
            proposalId: proposal.id,
            type: proposal.type
        });
    }

    handleSystemEvent(event) {
        // Process system-wide events
        switch (event.type) {
            case 'vote-cast':
                this.processVoteEvent(event);
                break;
            
            case 'proposal-created':
                this.processProposalEvent(event);
                break;
            
            case 'dao-created':
                this.processDAOEvent(event);
                break;
        }
    }

    processVoteEvent(event) {
        // Process vote events for system optimization
        this.updateSystemMetrics();
    }

    processProposalEvent(event) {
        // Process proposal events
        this.updateSystemMetrics();
    }

    processDAOEvent(event) {
        // Process DAO events
        this.updateSystemMetrics();
    }

    isVotingEvent(eventType) {
        return ['vote-cast', 'voting-power-delegated', 'proposal-voting-started'].includes(eventType);
    }

    extractVotingData(event) {
        // Extract voting data for analytics
        return {
            proposalId: event.data.proposalId || event.data.voteId,
            voterId: event.data.voterId || event.data.delegatorId,
            vote: event.data.vote || 'delegation',
            votingPower: event.data.votingPower || event.data.amount || 1,
            timestamp: event.timestamp,
            mechanism: event.data.mechanism || 'unknown',
            metadata: event.data
        };
    }

    getComponentStatus() {
        return {
            votingEngine: 'active',
            daoFramework: 'active',
            tokenSystem: 'active',
            consensusEngine: 'active',
            proposalSystem: 'active',
            analytics: this.analytics ? 'active' : 'disabled'
        };
    }

    getTotalProposals() {
        // Count proposals across all systems
        let total = 0;
        for (const governance of this.activeGovernances.values()) {
            if (governance.components.dao) {
                const dao = this.daoFramework.daos.get(governance.id);
                total += dao?.proposals.size || 0;
            }
        }
        return total;
    }

    getTotalVotes() {
        // Count votes across all systems
        return this.eventHistory.filter(e => e.type === 'vote-cast').length;
    }

    calculateSystemHealth() {
        const metrics = Array.from(this.systemMetrics.values()).slice(-10); // Last 10 metrics
        if (metrics.length === 0) return 100;
        
        const avgLoad = metrics.reduce((sum, m) => sum + m.systemLoad, 0) / metrics.length;
        const avgErrorRate = metrics.reduce((sum, m) => sum + m.errorRate, 0) / metrics.length;
        
        return Math.max(0, 100 - (avgLoad * 50) - (avgErrorRate * 100));
    }

    calculateSystemLoad() {
        // Simplified load calculation
        return Math.min(1, this.activeGovernances.size / 100);
    }

    calculateEventRate() {
        const recentEvents = this.eventHistory.filter(e => 
            Date.now() - e.timestamp < 60000 // Last minute
        );
        return recentEvents.length;
    }

    calculateErrorRate() {
        const recentEvents = this.eventHistory.filter(e => 
            Date.now() - e.timestamp < 300000 // Last 5 minutes
        );
        const errorEvents = recentEvents.filter(e => e.type.includes('error') || e.type.includes('failed'));
        return recentEvents.length > 0 ? errorEvents.length / recentEvents.length : 0;
    }

    getMemoryUsage() {
        // Simplified memory usage calculation
        return {
            events: this.eventHistory.length,
            governances: this.activeGovernances.size,
            metrics: this.systemMetrics.size
        };
    }

    cleanupOldEvents() {
        const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours
        this.eventHistory = this.eventHistory.filter(e => e.timestamp >= cutoff);
    }

    emitEvent(eventType, data) {
        const event = {
            source: 'orchestrator',
            type: eventType,
            data,
            timestamp: Date.now()
        };
        
        this.eventHistory.push(event);
        console.log(`[Governance Orchestrator] ${eventType}:`, data);
    }

    // Async placeholder methods for cross-governance operations
    async executeSequentialProposal(crossProposal) {
        // Implementation for sequential proposal execution
        return { success: true };
    }

    async executeParallelProposal(crossProposal) {
        // Implementation for parallel proposal execution  
        return { success: true };
    }

    async executeConsensusProposal(crossProposal) {
        // Implementation for consensus-based proposal execution
        return { success: true };
    }
}

module.exports = { GovernanceOrchestrator };
/**
 * Proposal and Referendum System
 * Democratic decision-making processes and proposal lifecycle management
 */

const { DecentralizedVotingEngine } = require('../voting/decentralized-voting-engine');
const { GovernanceTokenSystem } = require('../core/governance-token-system');

class ProposalReferendumSystem {
    constructor() {
        this.proposals = new Map();
        this.referendums = new Map();
        this.proposalTypes = new Map();
        this.proposalTemplates = new Map();
        this.votingEngine = new DecentralizedVotingEngine();
        this.tokenSystem = new GovernanceTokenSystem();
        this.proposalQueue = [];
        this.executionQueue = [];
        
        this.initializeProposalTypes();
        this.initializeTemplates();
    }

    initializeProposalTypes() {
        // Register different proposal types
        this.registerProposalType('governance-change', {
            requiredThreshold: 0.05, // 5% of token holders
            votingMechanism: 'supermajority',
            votingDuration: 7 * 24 * 60 * 60 * 1000, // 7 days
            executionDelay: 2 * 24 * 60 * 60 * 1000, // 2 days
            quorum: 0.3
        });

        this.registerProposalType('treasury-spending', {
            requiredThreshold: 0.02,
            votingMechanism: 'simple-majority',
            votingDuration: 5 * 24 * 60 * 60 * 1000,
            executionDelay: 24 * 60 * 60 * 1000,
            quorum: 0.15
        });

        this.registerProposalType('protocol-upgrade', {
            requiredThreshold: 0.1,
            votingMechanism: 'supermajority',
            votingDuration: 14 * 24 * 60 * 60 * 1000,
            executionDelay: 7 * 24 * 60 * 60 * 1000,
            quorum: 0.5
        });

        this.registerProposalType('emergency-action', {
            requiredThreshold: 0.03,
            votingMechanism: 'simple-majority',
            votingDuration: 24 * 60 * 60 * 1000,
            executionDelay: 0,
            quorum: 0.2
        });

        this.registerProposalType('constitutional-amendment', {
            requiredThreshold: 0.15,
            votingMechanism: 'supermajority',
            votingDuration: 21 * 24 * 60 * 60 * 1000,
            executionDelay: 14 * 24 * 60 * 60 * 1000,
            quorum: 0.6
        });
    }

    initializeTemplates() {
        // Standard proposal templates
        this.registerTemplate('treasury-grant', {
            title: "Treasury Grant Proposal",
            fields: ['recipient', 'amount', 'purpose', 'deliverables', 'timeline'],
            validation: this.validateTreasuryGrant.bind(this)
        });

        this.registerTemplate('parameter-change', {
            title: "Parameter Change Proposal",
            fields: ['parameter', 'currentValue', 'proposedValue', 'rationale'],
            validation: this.validateParameterChange.bind(this)
        });

        this.registerTemplate('code-upgrade', {
            title: "Code Upgrade Proposal",
            fields: ['contractAddress', 'newCode', 'migrationPlan', 'riskAssessment'],
            validation: this.validateCodeUpgrade.bind(this)
        });
    }

    registerProposalType(type, config) {
        this.proposalTypes.set(type, config);
    }

    registerTemplate(name, template) {
        this.proposalTemplates.set(name, template);
    }

    // Create new proposal
    async createProposal(proposalConfig) {
        const {
            id,
            title,
            description,
            type,
            proposerId,
            actions = [],
            template = null,
            metadata = {},
            urgency = 'normal'
        } = proposalConfig;

        // Validate proposal type
        const proposalTypeConfig = this.proposalTypes.get(type);
        if (!proposalTypeConfig) {
            throw new Error(`Unknown proposal type: ${type}`);
        }

        // Check proposer eligibility
        const isEligible = await this.checkProposerEligibility(proposerId, type);
        if (!isEligible) {
            throw new Error('Proposer does not meet eligibility requirements');
        }

        // Validate using template if provided
        if (template) {
            const templateConfig = this.proposalTemplates.get(template);
            if (templateConfig) {
                const validationResult = await templateConfig.validation(proposalConfig);
                if (!validationResult.valid) {
                    throw new Error(`Template validation failed: ${validationResult.errors.join(', ')}`);
                }
            }
        }

        const proposal = {
            id,
            title,
            description,
            type,
            proposerId,
            actions,
            template,
            metadata,
            urgency,
            createdAt: Date.now(),
            status: 'draft',
            phase: 'submission',
            submissionThreshold: proposalTypeConfig.requiredThreshold,
            support: new Map(),
            opposition: new Map(),
            comments: [],
            history: [],
            votingConfig: {
                mechanism: proposalTypeConfig.votingMechanism,
                duration: proposalTypeConfig.votingDuration,
                quorum: proposalTypeConfig.quorum,
                executionDelay: proposalTypeConfig.executionDelay
            }
        };

        this.proposals.set(id, proposal);
        this.addToHistory(proposal, 'created', { proposerId });

        this.emitEvent('proposal-created', { proposalId: id, proposal });

        return proposal;
    }

    // Support proposal during submission phase
    async supportProposal(proposalId, supporterId, stake = 0) {
        const proposal = this.proposals.get(proposalId);
        if (!proposal) {
            throw new Error('Proposal not found');
        }

        if (proposal.phase !== 'submission') {
            throw new Error('Proposal is not in submission phase');
        }

        // Check supporter eligibility
        const isEligible = await this.checkVoterEligibility(supporterId);
        if (!isEligible) {
            throw new Error('Supporter is not eligible');
        }

        const votingPower = await this.calculateVotingPower(supporterId);
        proposal.support.set(supporterId, {
            stake: stake || votingPower,
            timestamp: Date.now()
        });

        // Check if submission threshold met
        const totalSupport = await this.calculateTotalSupport(proposal);
        const totalVotingPower = await this.getTotalVotingPower();
        const supportPercentage = totalSupport / totalVotingPower;

        if (supportPercentage >= proposal.submissionThreshold) {
            await this.advanceToVoting(proposalId);
        }

        this.emitEvent('proposal-supported', { proposalId, supporterId, stake: votingPower });

        return { totalSupport, supportPercentage, thresholdMet: supportPercentage >= proposal.submissionThreshold };
    }

    // Advance proposal to voting phase
    async advanceToVoting(proposalId) {
        const proposal = this.proposals.get(proposalId);
        
        proposal.phase = 'voting';
        proposal.status = 'active';
        proposal.votingStartTime = Date.now();
        proposal.votingEndTime = Date.now() + proposal.votingConfig.duration;

        // Create voting round
        const voteConfig = {
            title: proposal.title,
            description: proposal.description,
            options: ['approve', 'reject'],
            mechanism: proposal.votingConfig.mechanism,
            duration: proposal.votingConfig.duration,
            eligibilityRules: await this.getVotingEligibilityRules(),
            votingPowerRules: await this.getVotingPowerRules(),
            metadata: { proposalId, type: proposal.type }
        };

        const vote = await this.votingEngine.createVote(proposalId, voteConfig);
        proposal.voteId = vote.id;

        this.addToHistory(proposal, 'voting-started', { 
            votingStartTime: proposal.votingStartTime,
            votingEndTime: proposal.votingEndTime 
        });

        this.emitEvent('proposal-voting-started', { proposalId, proposal });

        // Schedule voting end
        setTimeout(() => {
            this.endVoting(proposalId);
        }, proposal.votingConfig.duration);

        return proposal;
    }

    // Cast vote on proposal
    async castVote(proposalId, voterId, vote) {
        const proposal = this.proposals.get(proposalId);
        if (!proposal) {
            throw new Error('Proposal not found');
        }

        if (proposal.phase !== 'voting') {
            throw new Error('Proposal is not in voting phase');
        }

        // Delegate to voting engine
        const result = await this.votingEngine.castVote(proposal.voteId, voterId, { choice: vote });

        this.emitEvent('vote-cast', { proposalId, voterId, vote });

        return result;
    }

    // End voting and calculate results
    async endVoting(proposalId) {
        const proposal = this.proposals.get(proposalId);
        if (!proposal || proposal.phase !== 'voting') {
            return;
        }

        const results = await this.votingEngine.calculateResults(proposal.voteId);
        proposal.votingResults = results;
        proposal.phase = 'completed';

        // Check if proposal passed
        const passed = this.evaluateProposalResults(proposal, results);
        proposal.passed = passed;

        if (passed) {
            proposal.status = 'passed';
            await this.scheduleExecution(proposalId);
        } else {
            proposal.status = 'rejected';
        }

        this.addToHistory(proposal, 'voting-ended', { results, passed });

        this.emitEvent('proposal-voting-ended', { proposalId, results, passed });

        return { results, passed };
    }

    // Evaluate if proposal passed based on results and rules
    evaluateProposalResults(proposal, results) {
        const { totalVotingPower, winner, winnerPercentage } = results;
        
        // Check quorum
        const quorumMet = (totalVotingPower / await this.getTotalVotingPower()) >= proposal.votingConfig.quorum;
        if (!quorumMet) {
            return false;
        }

        // Check if approved
        if (winner !== 'approve') {
            return false;
        }

        // Check if supermajority required
        if (proposal.votingConfig.mechanism === 'supermajority') {
            return winnerPercentage >= 67; // 2/3 majority
        }

        return winnerPercentage > 50;
    }

    // Schedule proposal execution
    async scheduleExecution(proposalId) {
        const proposal = this.proposals.get(proposalId);
        const executionTime = Date.now() + proposal.votingConfig.executionDelay;

        proposal.executionScheduledAt = executionTime;
        proposal.phase = 'execution-pending';

        this.executionQueue.push({
            proposalId,
            executionTime,
            proposal
        });

        // Sort execution queue by time
        this.executionQueue.sort((a, b) => a.executionTime - b.executionTime);

        this.addToHistory(proposal, 'execution-scheduled', { executionTime });

        // Schedule execution
        setTimeout(() => {
            this.executeProposal(proposalId);
        }, proposal.votingConfig.executionDelay);

        return { executionTime };
    }

    // Execute proposal
    async executeProposal(proposalId) {
        const proposal = this.proposals.get(proposalId);
        if (!proposal || proposal.phase !== 'execution-pending') {
            return;
        }

        proposal.phase = 'executing';
        proposal.executionStartedAt = Date.now();

        try {
            const results = [];
            
            for (const action of proposal.actions) {
                const result = await this.executeAction(action, proposal);
                results.push(result);
            }

            proposal.executionResults = results;
            proposal.status = 'executed';
            proposal.phase = 'executed';
            proposal.executedAt = Date.now();

            this.addToHistory(proposal, 'executed', { results });

            this.emitEvent('proposal-executed', { proposalId, results });

            return results;

        } catch (error) {
            proposal.status = 'execution-failed';
            proposal.executionError = error.message;
            proposal.failedAt = Date.now();

            this.addToHistory(proposal, 'execution-failed', { error: error.message });

            this.emitEvent('proposal-execution-failed', { proposalId, error: error.message });

            throw error;
        }
    }

    // Execute individual action
    async executeAction(action, proposal) {
        switch (action.type) {
            case 'transfer-funds':
                return await this.transferFunds(action.recipient, action.amount, action.token);
            
            case 'update-parameter':
                return await this.updateParameter(action.parameter, action.value);
            
            case 'upgrade-contract':
                return await this.upgradeContract(action.contract, action.newImplementation);
            
            case 'grant-role':
                return await this.grantRole(action.role, action.recipient);
            
            case 'revoke-role':
                return await this.revokeRole(action.role, action.target);
            
            case 'mint-tokens':
                return await this.mintTokens(action.token, action.recipient, action.amount);
            
            case 'burn-tokens':
                return await this.burnTokens(action.token, action.amount);
            
            case 'custom':
                return await this.executeCustomAction(action, proposal);
            
            default:
                throw new Error(`Unknown action type: ${action.type}`);
        }
    }

    // Create referendum
    async createReferendum(referendumConfig) {
        const {
            id,
            title,
            question,
            options,
            proposerId,
            votingMechanism = 'simple-majority',
            duration = 7 * 24 * 60 * 60 * 1000,
            metadata = {}
        } = referendumConfig;

        const referendum = {
            id,
            title,
            question,
            options,
            proposerId,
            votingMechanism,
            duration,
            metadata,
            createdAt: Date.now(),
            status: 'active',
            startTime: Date.now(),
            endTime: Date.now() + duration,
            results: null
        };

        // Create voting round
        const voteConfig = {
            title,
            description: question,
            options,
            mechanism: votingMechanism,
            duration,
            eligibilityRules: await this.getVotingEligibilityRules(),
            votingPowerRules: await this.getVotingPowerRules(),
            metadata: { referendumId: id, type: 'referendum' }
        };

        const vote = await this.votingEngine.createVote(id, voteConfig);
        referendum.voteId = vote.id;

        this.referendums.set(id, referendum);

        this.emitEvent('referendum-created', { referendumId: id, referendum });

        // Schedule end
        setTimeout(() => {
            this.endReferendum(id);
        }, duration);

        return referendum;
    }

    // End referendum
    async endReferendum(referendumId) {
        const referendum = this.referendums.get(referendumId);
        if (!referendum || referendum.status !== 'active') {
            return;
        }

        const results = await this.votingEngine.calculateResults(referendum.voteId);
        referendum.results = results;
        referendum.status = 'completed';
        referendum.completedAt = Date.now();

        this.emitEvent('referendum-completed', { referendumId, results });

        return results;
    }

    // Add comment to proposal
    addComment(proposalId, commenterId, content) {
        const proposal = this.proposals.get(proposalId);
        if (!proposal) {
            throw new Error('Proposal not found');
        }

        const comment = {
            id: `${proposalId}-${Date.now()}`,
            commenterId,
            content,
            timestamp: Date.now(),
            replies: []
        };

        proposal.comments.push(comment);

        this.emitEvent('comment-added', { proposalId, comment });

        return comment;
    }

    // Helper methods
    async checkProposerEligibility(proposerId, proposalType) {
        // Check token balance, reputation, etc.
        const balance = await this.tokenSystem.getBalance('GOV', proposerId);
        const minBalance = this.getMinProposalBalance(proposalType);
        return balance >= minBalance;
    }

    async checkVoterEligibility(voterId) {
        // Basic eligibility check
        const balance = await this.tokenSystem.getBalance('GOV', voterId);
        return balance > 0;
    }

    async calculateVotingPower(voterId) {
        return await this.tokenSystem.calculateVotingPower('GOV', voterId);
    }

    async calculateTotalSupport(proposal) {
        let total = 0;
        for (const [supporterId, support] of proposal.support) {
            total += support.stake;
        }
        return total;
    }

    async getTotalVotingPower() {
        const tokenInfo = this.tokenSystem.getTokenInfo('GOV');
        return tokenInfo?.circulatingSupply || 1000000;
    }

    getMinProposalBalance(proposalType) {
        const thresholds = {
            'governance-change': 10000,
            'treasury-spending': 5000,
            'protocol-upgrade': 20000,
            'emergency-action': 15000,
            'constitutional-amendment': 50000
        };
        return thresholds[proposalType] || 1000;
    }

    async getVotingEligibilityRules() {
        return [
            {
                type: 'token-holder',
                tokenAddress: 'GOV',
                minimumBalance: 1
            }
        ];
    }

    async getVotingPowerRules() {
        return {
            tokenBased: true,
            tokenAddress: 'GOV',
            tokenMultiplier: 1,
            minimumPower: 0
        };
    }

    addToHistory(proposal, action, data) {
        proposal.history.push({
            action,
            timestamp: Date.now(),
            data
        });
    }

    // Template validation methods
    async validateTreasuryGrant(proposalConfig) {
        const errors = [];
        
        if (!proposalConfig.metadata.recipient) {
            errors.push('Recipient is required');
        }
        
        if (!proposalConfig.metadata.amount || proposalConfig.metadata.amount <= 0) {
            errors.push('Valid amount is required');
        }
        
        if (!proposalConfig.metadata.purpose) {
            errors.push('Purpose is required');
        }

        return { valid: errors.length === 0, errors };
    }

    async validateParameterChange(proposalConfig) {
        const errors = [];
        
        if (!proposalConfig.metadata.parameter) {
            errors.push('Parameter name is required');
        }
        
        if (proposalConfig.metadata.currentValue === undefined) {
            errors.push('Current value is required');
        }
        
        if (proposalConfig.metadata.proposedValue === undefined) {
            errors.push('Proposed value is required');
        }

        return { valid: errors.length === 0, errors };
    }

    async validateCodeUpgrade(proposalConfig) {
        const errors = [];
        
        if (!proposalConfig.metadata.contractAddress) {
            errors.push('Contract address is required');
        }
        
        if (!proposalConfig.metadata.newCode) {
            errors.push('New code is required');
        }
        
        if (!proposalConfig.metadata.riskAssessment) {
            errors.push('Risk assessment is required');
        }

        return { valid: errors.length === 0, errors };
    }

    // Action execution methods (simplified)
    async transferFunds(recipient, amount, token) {
        console.log(`Transferring ${amount} ${token} to ${recipient}`);
        return { success: true, txHash: 'mock-tx-hash' };
    }

    async updateParameter(parameter, value) {
        console.log(`Updating parameter ${parameter} to ${value}`);
        return { success: true, parameter, oldValue: 'old', newValue: value };
    }

    async upgradeContract(contract, newImplementation) {
        console.log(`Upgrading contract ${contract} to ${newImplementation}`);
        return { success: true, contract, newImplementation };
    }

    async grantRole(role, recipient) {
        console.log(`Granting role ${role} to ${recipient}`);
        return { success: true, role, recipient };
    }

    async revokeRole(role, target) {
        console.log(`Revoking role ${role} from ${target}`);
        return { success: true, role, target };
    }

    async mintTokens(token, recipient, amount) {
        await this.tokenSystem.mintTokens(token, recipient, amount, 'proposal-execution');
        return { success: true, token, recipient, amount };
    }

    async burnTokens(token, amount) {
        console.log(`Burning ${amount} ${token}`);
        return { success: true, token, amount };
    }

    async executeCustomAction(action, proposal) {
        console.log(`Executing custom action:`, action);
        return { success: true, action: action.customType };
    }

    // Get proposal status
    getProposalStatus(proposalId) {
        const proposal = this.proposals.get(proposalId);
        if (!proposal) return null;

        return {
            id: proposal.id,
            title: proposal.title,
            type: proposal.type,
            status: proposal.status,
            phase: proposal.phase,
            createdAt: proposal.createdAt,
            votingStartTime: proposal.votingStartTime,
            votingEndTime: proposal.votingEndTime,
            supportCount: proposal.support.size,
            passed: proposal.passed,
            executed: proposal.status === 'executed'
        };
    }

    // Get referendum status
    getReferendumStatus(referendumId) {
        const referendum = this.referendums.get(referendumId);
        if (!referendum) return null;

        return {
            id: referendum.id,
            title: referendum.title,
            question: referendum.question,
            status: referendum.status,
            startTime: referendum.startTime,
            endTime: referendum.endTime,
            results: referendum.results
        };
    }

    emitEvent(eventType, data) {
        console.log(`[Proposal Event] ${eventType}:`, data);
    }
}

module.exports = { ProposalReferendumSystem };
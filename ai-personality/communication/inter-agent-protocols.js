/**
 * Phase 2 Inter-Agent Communication Protocols
 * Advanced communication system for coalition formation and collective intelligence
 */

class InterAgentProtocols {
    constructor() {
        this.messageTypes = new Map();
        this.protocols = new Map();
        this.activeConnections = new Map();
        this.messageQueue = new Map();
        this.communicationHistory = new Map();
        
        // Communication channels
        this.channels = {
            DIRECT: 'direct_message',
            BROADCAST: 'broadcast',
            COALITION: 'coalition_private',
            MARKET_SIGNAL: 'market_signal',
            GOSSIP: 'gossip_network',
            SECRET: 'encrypted_channel',
            NEGOTIATION: 'negotiation_protocol'
        };

        // Initialize core message types
        this.initializeMessageTypes();
        this.initializeProtocols();
        
        // Communication learning and adaptation
        this.communicationAI = new CommunicationAI();
        this.languageEvolution = new LanguageEvolution();
        this.reputationFilter = new ReputationBasedFilter();
        
        // Fraud detection and verification
        this.fraudDetector = new CommunicationFraudDetector();
        this.messageVerification = new MessageVerificationSystem();
        
        // Cultural communication adaptation
        this.culturalAdapter = new CulturalCommunicationAdapter();
    }

    initializeMessageTypes() {
        // Coalition formation messages
        this.registerMessageType('COALITION_INVITE', {
            fields: ['initiator', 'target_agents', 'purpose', 'terms', 'duration', 'trust_required'],
            encryption: 'standard',
            verification: 'signature',
            priority: 'high'
        });

        this.registerMessageType('COALITION_RESPONSE', {
            fields: ['responder', 'decision', 'counter_terms', 'conditions', 'trust_level'],
            encryption: 'standard',
            verification: 'signature',
            priority: 'high'
        });

        // Information sharing messages
        this.registerMessageType('MARKET_INTELLIGENCE', {
            fields: ['source', 'intelligence_type', 'data', 'confidence', 'expiry', 'value'],
            encryption: 'light',
            verification: 'reputation',
            priority: 'medium'
        });

        this.registerMessageType('RUMOR_PROPAGATION', {
            fields: ['originator', 'rumor_content', 'credibility', 'decay_rate', 'hop_count'],
            encryption: 'none',
            verification: 'gossip',
            priority: 'low'
        });

        // Negotiation and trading messages
        this.registerMessageType('TRADE_PROPOSAL', {
            fields: ['proposer', 'asset', 'quantity', 'price', 'terms', 'urgency'],
            encryption: 'standard',
            verification: 'signature',
            priority: 'high'
        });

        this.registerMessageType('NEGOTIATION_COUNTER', {
            fields: ['negotiator', 'original_proposal', 'modified_terms', 'reasoning'],
            encryption: 'standard',
            verification: 'signature',
            priority: 'high'
        });

        // Trust and reputation messages
        this.registerMessageType('TRUST_UPDATE', {
            fields: ['reporter', 'target_agent', 'interaction_type', 'outcome', 'evidence'],
            encryption: 'light',
            verification: 'reputation',
            priority: 'medium'
        });

        this.registerMessageType('REPUTATION_QUERY', {
            fields: ['requester', 'target_agent', 'context', 'urgency'],
            encryption: 'none',
            verification: 'basic',
            priority: 'low'
        });

        // Collective intelligence messages
        this.registerMessageType('CONSENSUS_PROPOSAL', {
            fields: ['proposer', 'topic', 'proposal_data', 'voting_mechanism', 'deadline'],
            encryption: 'standard',
            verification: 'signature',
            priority: 'high'
        });

        this.registerMessageType('CONSENSUS_VOTE', {
            fields: ['voter', 'proposal_id', 'vote', 'reasoning', 'weight'],
            encryption: 'light',
            verification: 'signature',
            priority: 'medium'
        });

        // Secret coalition messages
        this.registerMessageType('SECRET_COALITION', {
            fields: ['initiator', 'members', 'secret_purpose', 'code_language', 'detection_avoidance'],
            encryption: 'heavy',
            verification: 'multi_sig',
            priority: 'critical'
        });

        this.registerMessageType('CODE_MESSAGE', {
            fields: ['sender', 'coded_content', 'decryption_hint', 'coalition_id'],
            encryption: 'heavy',
            verification: 'coalition_key',
            priority: 'high'
        });
    }

    initializeProtocols() {
        // Coalition Formation Protocol
        this.registerProtocol('COALITION_FORMATION', {
            phases: ['invitation', 'negotiation', 'agreement', 'formation', 'execution'],
            timeout: 3600000, // 1 hour
            participants: 'multi',
            encryption_required: true,
            reputation_threshold: 60
        });

        // Information Market Protocol
        this.registerProtocol('INFORMATION_MARKET', {
            phases: ['offer', 'valuation', 'negotiation', 'exchange', 'verification'],
            timeout: 1800000, // 30 minutes
            participants: 'bilateral',
            encryption_required: false,
            reputation_threshold: 40
        });

        // Consensus Building Protocol
        this.registerProtocol('CONSENSUS_BUILDING', {
            phases: ['proposal', 'discussion', 'voting', 'tallying', 'implementation'],
            timeout: 7200000, // 2 hours
            participants: 'multi',
            encryption_required: false,
            reputation_threshold: 50
        });

        // Secret Operation Protocol
        this.registerProtocol('SECRET_OPERATION', {
            phases: ['recruitment', 'planning', 'coordination', 'execution', 'dissolution'],
            timeout: 21600000, // 6 hours
            participants: 'invite_only',
            encryption_required: true,
            reputation_threshold: 80
        });
    }

    // Core communication methods
    sendMessage(fromAgent, toAgent, messageType, data, options = {}) {
        const messageId = this.generateMessageId();
        const messageSpec = this.messageTypes.get(messageType);
        
        if (!messageSpec) {
            throw new Error(`Unknown message type: ${messageType}`);
        }

        // Validate message data
        this.validateMessageData(data, messageSpec);

        // Apply cultural communication adaptation
        const culturallyAdapted = this.culturalAdapter.adaptMessage(
            fromAgent, toAgent, messageType, data
        );

        // Build message
        const message = {
            id: messageId,
            type: messageType,
            from: fromAgent,
            to: toAgent,
            data: culturallyAdapted.data,
            timestamp: Date.now(),
            channel: options.channel || this.channels.DIRECT,
            priority: messageSpec.priority,
            cultural_style: culturallyAdapted.style,
            ...options
        };

        // Apply encryption if required
        if (messageSpec.encryption !== 'none') {
            message.encrypted_data = this.encryptMessage(message, messageSpec.encryption);
            delete message.data; // Remove unencrypted data
        }

        // Apply verification
        message.verification = this.generateVerification(message, messageSpec.verification);

        // Fraud detection check
        const fraudCheck = this.fraudDetector.analyzeMessage(message, fromAgent);
        if (fraudCheck.risk_level > 80) {
            throw new Error(`Message blocked: High fraud risk detected`);
        }

        // Reputation-based filtering
        const reputationCheck = this.reputationFilter.shouldDeliverMessage(
            fromAgent, toAgent, messageType
        );
        if (!reputationCheck.allowed) {
            return {
                success: false,
                reason: reputationCheck.reason,
                message_id: messageId
            };
        }

        // Queue message for delivery
        this.queueMessage(message);

        // Record communication
        this.recordCommunication(fromAgent, toAgent, messageType, message);

        // Learn from communication patterns
        this.communicationAI.learnFromCommunication(message, fromAgent, toAgent);

        return {
            success: true,
            message_id: messageId,
            delivery_estimate: this.estimateDeliveryTime(toAgent, messageSpec.priority),
            cultural_adaptation: culturallyAdapted.adaptations
        };
    }

    broadcastMessage(fromAgent, messageType, data, targetCriteria = {}) {
        const eligibleAgents = this.findEligibleRecipients(fromAgent, targetCriteria);
        const results = [];

        eligibleAgents.forEach(toAgent => {
            try {
                const result = this.sendMessage(fromAgent, toAgent, messageType, data, {
                    channel: this.channels.BROADCAST
                });
                results.push({ agent: toAgent, ...result });
            } catch (error) {
                results.push({ agent: toAgent, success: false, error: error.message });
            }
        });

        return {
            total_sent: results.filter(r => r.success).length,
            total_failed: results.filter(r => !r.success).length,
            results: results
        };
    }

    // Coalition formation methods
    initiateCoalition(initiator, purpose, targetAgents, terms = {}) {
        const coalitionId = this.generateCoalitionId();
        
        const invitationData = {
            coalition_id: coalitionId,
            purpose: purpose,
            terms: {
                profit_sharing: terms.profit_sharing || 'equal',
                decision_making: terms.decision_making || 'consensus',
                duration: terms.duration || 3600000, // 1 hour default
                trust_required: terms.trust_required || 70,
                ...terms
            },
            deadline: Date.now() + (terms.response_time || 300000) // 5 minutes default
        };

        // Send invitations to target agents
        const invitations = targetAgents.map(agent => {
            return this.sendMessage(initiator, agent, 'COALITION_INVITE', invitationData, {
                channel: this.channels.COALITION
            });
        });

        // Track coalition formation
        this.trackCoalitionFormation(coalitionId, initiator, targetAgents, terms);

        return {
            coalition_id: coalitionId,
            invitations_sent: invitations.filter(i => i.success).length,
            invitation_results: invitations
        };
    }

    respondToCoalition(responder, coalitionId, decision, counterTerms = null) {
        const coalition = this.getCoalitionFormation(coalitionId);
        if (!coalition) {
            throw new Error(`Coalition ${coalitionId} not found`);
        }

        const responseData = {
            coalition_id: coalitionId,
            decision: decision, // 'accept', 'reject', 'counter'
            counter_terms: counterTerms,
            trust_verification: this.verifyTrustLevels(responder, coalition.members),
            commitment_level: this.calculateCommitmentLevel(responder, coalition.purpose)
        };

        const result = this.sendMessage(responder, coalition.initiator, 'COALITION_RESPONSE', responseData, {
            channel: this.channels.COALITION
        });

        // Update coalition formation status
        this.updateCoalitionResponse(coalitionId, responder, decision, counterTerms);

        return result;
    }

    // Information sharing and market intelligence
    shareMarketIntelligence(agent, intelligenceType, data, targetAgents = null) {
        const intelligence = {
            intelligence_type: intelligenceType,
            data: data,
            confidence: this.calculateIntelligenceConfidence(agent, intelligenceType, data),
            value_estimate: this.estimateInformationValue(intelligenceType, data),
            expiry: Date.now() + (data.ttl || 1800000), // 30 minutes default
            source_reputation: this.getAgentReputation(agent)
        };

        if (targetAgents) {
            // Direct sharing to specific agents
            return targetAgents.map(target => {
                return this.sendMessage(agent, target, 'MARKET_INTELLIGENCE', intelligence);
            });
        } else {
            // Broadcast to network
            return this.broadcastMessage(agent, 'MARKET_INTELLIGENCE', intelligence, {
                min_reputation: 40,
                max_recipients: 10,
                relevance_filter: intelligenceType
            });
        }
    }

    propagateRumor(originator, rumorContent, initialCredibility = 50) {
        const rumor = {
            originator: originator,
            rumor_content: rumorContent,
            credibility: initialCredibility,
            decay_rate: 0.1, // Credibility decay per hop
            hop_count: 0,
            propagation_id: this.generateRumorId()
        };

        // Start rumor propagation through gossip network
        const initialTargets = this.getGossipTargets(originator, 3); // Start with 3 agents
        
        initialTargets.forEach(target => {
            this.sendMessage(originator, target, 'RUMOR_PROPAGATION', rumor, {
                channel: this.channels.GOSSIP
            });
        });

        // Track rumor spread
        this.trackRumorPropagation(rumor.propagation_id, originator, rumorContent);

        return {
            propagation_id: rumor.propagation_id,
            initial_spread: initialTargets.length,
            estimated_reach: this.estimateRumorReach(initialCredibility, initialTargets.length)
        };
    }

    // Collective intelligence and consensus building
    proposeConsensus(proposer, topic, proposalData, votingMechanism = 'simple_majority') {
        const proposalId = this.generateProposalId();
        
        const proposal = {
            proposal_id: proposalId,
            topic: topic,
            proposal_data: proposalData,
            voting_mechanism: votingMechanism,
            deadline: Date.now() + (proposalData.voting_time || 3600000), // 1 hour default
            minimum_participation: proposalData.minimum_participation || 0.6
        };

        // Broadcast proposal to eligible voters
        const eligibleVoters = this.getEligibleVoters(proposer, topic);
        
        const broadcast = this.broadcastMessage(proposer, 'CONSENSUS_PROPOSAL', proposal, {
            target_agents: eligibleVoters,
            channel: this.channels.BROADCAST
        });

        // Track consensus building
        this.trackConsensusBuilding(proposalId, proposer, topic, eligibleVoters);

        return {
            proposal_id: proposalId,
            eligible_voters: eligibleVoters.length,
            broadcast_result: broadcast,
            deadline: proposal.deadline
        };
    }

    castVote(voter, proposalId, vote, reasoning = '') {
        const proposal = this.getConsensusProposal(proposalId);
        if (!proposal) {
            throw new Error(`Proposal ${proposalId} not found`);
        }

        if (Date.now() > proposal.deadline) {
            throw new Error(`Voting deadline passed for proposal ${proposalId}`);
        }

        const voteData = {
            proposal_id: proposalId,
            vote: vote,
            reasoning: reasoning,
            weight: this.calculateVoterWeight(voter, proposal.topic),
            voting_power: this.getVotingPower(voter)
        };

        const result = this.sendMessage(voter, proposal.proposer, 'CONSENSUS_VOTE', voteData);

        // Record vote
        this.recordVote(proposalId, voter, vote, voteData.weight);

        return result;
    }

    // Secret coalition and encrypted communication
    createSecretCoalition(initiator, purpose, codeLanguage = null) {
        const secretId = this.generateSecretCoalitionId();
        const encryptionKey = this.generateCoalitionKey();
        
        const secretCoalition = {
            secret_id: secretId,
            initiator: initiator,
            purpose: purpose,
            code_language: codeLanguage || this.generateCodeLanguage(),
            encryption_key: encryptionKey,
            detection_avoidance: this.generateAvoidanceStrategy(),
            formation_time: Date.now(),
            members: [initiator]
        };

        // Store secret coalition (encrypted)
        this.storeSecretCoalition(secretId, secretCoalition);

        return {
            secret_id: secretId,
            code_language: secretCoalition.code_language,
            recruitment_guidelines: this.generateRecruitmentGuidelines(secretCoalition)
        };
    }

    recruitSecretMember(recruiter, secretId, targetAgent, trustVerification) {
        const secretCoalition = this.getSecretCoalition(secretId);
        if (!secretCoalition || !secretCoalition.members.includes(recruiter)) {
            throw new Error('Unauthorized secret coalition access');
        }

        // Verify trust level for secret operations
        const trustLevel = this.verifySecretTrust(recruiter, targetAgent);
        if (trustLevel < 80) {
            throw new Error('Insufficient trust for secret coalition recruitment');
        }

        const recruitmentMessage = {
            secret_id: secretId,
            coded_invitation: this.encodeSecretInvitation(secretCoalition, targetAgent),
            trust_verification: trustVerification,
            detection_risk: this.assessDetectionRisk(targetAgent, secretCoalition)
        };

        return this.sendMessage(recruiter, targetAgent, 'SECRET_COALITION', recruitmentMessage, {
            channel: this.channels.SECRET,
            encryption: 'heavy'
        });
    }

    sendCodedMessage(sender, secretId, codedContent, decryptionHint = null) {
        const secretCoalition = this.getSecretCoalition(secretId);
        if (!secretCoalition || !secretCoalition.members.includes(sender)) {
            throw new Error('Unauthorized secret coalition access');
        }

        const codeMessage = {
            coalition_id: secretId,
            coded_content: codedContent,
            decryption_hint: decryptionHint,
            language_style: secretCoalition.code_language.style,
            authenticity_proof: this.generateAuthenticityProof(sender, secretCoalition)
        };

        // Send to all coalition members
        const results = secretCoalition.members
            .filter(member => member !== sender)
            .map(member => {
                return this.sendMessage(sender, member, 'CODE_MESSAGE', codeMessage, {
                    channel: this.channels.SECRET,
                    encryption: 'heavy'
                });
            });

        return {
            messages_sent: results.filter(r => r.success).length,
            total_members: secretCoalition.members.length - 1,
            results: results
        };
    }

    // Communication learning and evolution
    adaptCommunicationStyle(agent, targetAgent, context) {
        return this.communicationAI.adaptCommunicationStyle(agent, targetAgent, context);
    }

    evolveCommunicationLanguage(populationData) {
        return this.languageEvolution.evolveLanguage(populationData);
    }

    // Utility methods
    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    }

    generateCoalitionId() {
        return `coal_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    generateSecretCoalitionId() {
        return `secret_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    }

    generateProposalId() {
        return `prop_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    generateRumorId() {
        return `rumor_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    validateMessageData(data, messageSpec) {
        const requiredFields = messageSpec.fields;
        const missingFields = requiredFields.filter(field => !(field in data));
        
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        return true;
    }

    registerMessageType(type, specification) {
        this.messageTypes.set(type, specification);
    }

    registerProtocol(name, specification) {
        this.protocols.set(name, specification);
    }

    // Communication analytics
    getCommunicationMetrics(agent) {
        const history = this.communicationHistory.get(agent) || [];
        
        return {
            total_messages: history.length,
            message_types: this.analyzeMessageTypes(history),
            communication_frequency: this.calculateCommunicationFrequency(history),
            network_reach: this.calculateNetworkReach(agent),
            trust_network_size: this.getTrustNetworkSize(agent),
            reputation_impact: this.calculateReputationImpact(agent),
            cultural_adaptation: this.culturalAdapter.getAdaptationMetrics(agent),
            fraud_detection_history: this.fraudDetector.getAgentHistory(agent)
        };
    }

    getNetworkCommunicationStats() {
        return {
            total_messages: this.getTotalMessageCount(),
            active_coalitions: this.getActiveCoalitionCount(),
            rumor_spread_rate: this.calculateRumorSpreadRate(),
            consensus_success_rate: this.calculateConsensusSuccessRate(),
            secret_coalition_detection_rate: this.calculateSecretDetectionRate(),
            language_evolution_metrics: this.languageEvolution.getEvolutionMetrics(),
            fraud_detection_accuracy: this.fraudDetector.getAccuracyMetrics()
        };
    }
}

module.exports = InterAgentProtocols;
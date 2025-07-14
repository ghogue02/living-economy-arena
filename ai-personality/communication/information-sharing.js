/**
 * Information Sharing Systems with Verification and Gossip Networks
 * Advanced information propagation, market intelligence, and rumor management
 */

class InformationSharingSystem {
    constructor(trustNetwork, reputationSystem) {
        this.trustNetwork = trustNetwork;
        this.reputationSystem = reputationSystem;
        this.informationMarket = new InformationMarket();
        this.gossipNetwork = new GossipNetwork();
        this.verificationEngine = new InformationVerificationEngine();
        this.rumorTracker = new RumorTracker();
        
        // Information types and categories
        this.informationTypes = {
            MARKET_DATA: 'market_data',
            TRADE_SIGNALS: 'trade_signals',
            AGENT_BEHAVIOR: 'agent_behavior',
            COALITION_INTELLIGENCE: 'coalition_intelligence',
            RUMOR: 'rumor',
            VERIFIED_FACT: 'verified_fact',
            PREDICTION: 'prediction',
            STRATEGY_INSIGHT: 'strategy_insight'
        };

        // Information quality levels
        this.qualityLevels = {
            PREMIUM: { confidence: 90, value_multiplier: 3.0, verification_required: true },
            HIGH: { confidence: 75, value_multiplier: 2.0, verification_required: true },
            MEDIUM: { confidence: 60, value_multiplier: 1.0, verification_required: false },
            LOW: { confidence: 40, value_multiplier: 0.5, verification_required: false },
            RUMOR: { confidence: 20, value_multiplier: 0.1, verification_required: false }
        };

        // Active information items
        this.activeInformation = new Map();
        this.informationHistory = new Map();
        this.verificationRequests = new Map();
        
        // Information decay and aging
        this.decayEngine = new InformationDecayEngine();
        this.relevanceCalculator = new RelevanceCalculator();
    }

    // Core information sharing methods
    shareInformation(sharer, informationType, data, targetAgents = null, options = {}) {
        const informationId = this.generateInformationId();
        
        const information = {
            id: informationId,
            type: informationType,
            sharer: sharer,
            data: data,
            timestamp: Date.now(),
            quality_level: options.quality_level || this.assessInformationQuality(sharer, data),
            confidence: options.confidence || this.calculateConfidence(sharer, informationType, data),
            value_estimate: this.estimateInformationValue(informationType, data, sharer),
            verification_status: 'pending',
            source_reputation: this.reputationSystem.getReputation(sharer),
            sharing_motivation: options.motivation || 'cooperation',
            access_level: options.access_level || 'public',
            ttl: options.ttl || this.calculateDefaultTTL(informationType),
            tags: options.tags || this.generateInformationTags(data),
            metadata: {
                creation_context: options.context || {},
                sharing_cost: this.calculateSharingCost(sharer, informationType, data),
                expected_recipients: targetAgents ? targetAgents.length : this.estimateRecipientCount(informationType),
                strategic_value: this.assessStrategicValue(informationType, data)
            }
        };

        // Quality assessment and verification
        if (information.quality_level === 'PREMIUM' || information.quality_level === 'HIGH') {
            information.verification_status = 'verification_required';
            this.requestVerification(information);
        }

        // Information filtering and routing
        const routingDecision = this.determineInformationRouting(information, targetAgents);
        
        // Store information
        this.activeInformation.set(informationId, information);
        
        // Execute sharing based on routing decision
        const sharingResults = this.executeInformationSharing(information, routingDecision);
        
        // Track information propagation
        this.trackInformationPropagation(informationId, sharingResults);
        
        return {
            information_id: informationId,
            sharing_results: sharingResults,
            quality_assessment: information.quality_level,
            verification_required: information.verification_status === 'verification_required',
            estimated_value: information.value_estimate,
            propagation_estimate: this.estimatePropagationReach(information)
        };
    }

    requestInformation(requester, informationType, specificCriteria = {}, paymentOffer = 0) {
        const requestId = this.generateRequestId();
        
        const request = {
            id: requestId,
            requester: requester,
            type: informationType,
            criteria: specificCriteria,
            payment_offer: paymentOffer,
            timestamp: Date.now(),
            deadline: Date.now() + (specificCriteria.deadline || 3600000), // 1 hour default
            urgency: specificCriteria.urgency || 'medium',
            quality_requirement: specificCriteria.quality || 'MEDIUM',
            verification_requirement: specificCriteria.verification || false,
            max_age: specificCriteria.max_age || 1800000, // 30 minutes
            source_reputation_threshold: specificCriteria.min_reputation || 40
        };

        // Find potential information providers
        const providers = this.findInformationProviders(request);
        
        // Create information market listing
        const marketListing = this.informationMarket.createRequest(request, providers);
        
        // Notify potential providers
        const notifications = this.notifyInformationProviders(request, providers);
        
        return {
            request_id: requestId,
            market_listing: marketListing.id,
            potential_providers: providers.length,
            notification_results: notifications,
            estimated_fulfillment_time: this.estimateFulfillmentTime(request, providers)
        };
    }

    // Information verification and quality control
    verifyInformation(informationId, verifier, verificationData) {
        const information = this.activeInformation.get(informationId);
        if (!information) {
            throw new Error(`Information ${informationId} not found`);
        }

        const verification = {
            verifier: verifier,
            verification_method: verificationData.method || 'manual_review',
            confidence_level: verificationData.confidence || 0,
            supporting_evidence: verificationData.evidence || [],
            contradicting_evidence: verificationData.contradictions || [],
            verification_time: Date.now(),
            verifier_reputation: this.reputationSystem.getReputation(verifier),
            verification_cost: verificationData.cost || 0
        };

        // Calculate verification score
        const verificationScore = this.calculateVerificationScore(verification, information);
        
        // Update information verification status
        if (verificationScore >= 80) {
            information.verification_status = 'verified';
            information.quality_level = this.upgradeQualityLevel(information.quality_level);
        } else if (verificationScore <= 30) {
            information.verification_status = 'disputed';
            information.quality_level = this.downgradeQualityLevel(information.quality_level);
        } else {
            information.verification_status = 'partial_verification';
        }

        // Store verification
        if (!information.verifications) {
            information.verifications = [];
        }
        information.verifications.push(verification);

        // Update information value based on verification
        information.value_estimate = this.recalculateValue(information);

        // Notify stakeholders of verification result
        this.notifyVerificationResult(informationId, verification, verificationScore);

        return {
            verification_score: verificationScore,
            new_status: information.verification_status,
            updated_quality: information.quality_level,
            updated_value: information.value_estimate
        };
    }

    crossVerifyInformation(informationId, additionalSources = []) {
        const information = this.activeInformation.get(informationId);
        if (!information) {
            throw new Error(`Information ${informationId} not found`);
        }

        const crossVerification = {
            original_information: information,
            verification_sources: additionalSources,
            verification_results: [],
            consensus_level: 0,
            contradictions: [],
            supporting_evidence: []
        };

        // Gather verification from multiple sources
        for (const source of additionalSources) {
            const sourceInfo = this.getRelatedInformation(source, information);
            if (sourceInfo) {
                const comparison = this.compareInformation(information, sourceInfo);
                crossVerification.verification_results.push({
                    source: source,
                    comparison: comparison,
                    reliability: this.assessSourceReliability(source)
                });
            }
        }

        // Calculate consensus level
        crossVerification.consensus_level = this.calculateConsensusLevel(crossVerification.verification_results);

        // Identify contradictions and supporting evidence
        crossVerification.contradictions = this.identifyContradictions(crossVerification.verification_results);
        crossVerification.supporting_evidence = this.identifySupportingEvidence(crossVerification.verification_results);

        // Update information based on cross-verification
        if (crossVerification.consensus_level >= 70) {
            information.verification_status = 'cross_verified';
            information.confidence = Math.min(100, information.confidence + 20);
        } else if (crossVerification.consensus_level <= 30) {
            information.verification_status = 'contradicted';
            information.confidence = Math.max(10, information.confidence - 30);
        }

        return crossVerification;
    }

    // Gossip network and rumor propagation
    propagateRumor(originator, rumorContent, initialCredibility = 50, propagationStrategy = 'viral') {
        const rumorId = this.generateRumorId();
        
        const rumor = {
            id: rumorId,
            originator: originator,
            content: rumorContent,
            initial_credibility: initialCredibility,
            current_credibility: initialCredibility,
            propagation_strategy: propagationStrategy,
            creation_time: Date.now(),
            last_propagation: Date.now(),
            hop_count: 0,
            unique_spreaders: new Set([originator]),
            verification_attempts: [],
            contradiction_evidence: [],
            decay_rate: this.calculateRumorDecayRate(rumorContent, originator),
            virality_score: this.calculateViralityScore(rumorContent),
            believability_factors: this.analyzeRumorBelievability(rumorContent)
        };

        // Determine initial propagation targets
        const initialTargets = this.selectInitialPropagationTargets(originator, rumor, propagationStrategy);
        
        // Start rumor propagation
        const propagationResults = this.gossipNetwork.initiateRumorSpread(rumor, initialTargets);
        
        // Track rumor in system
        this.rumorTracker.trackRumor(rumor);
        
        return {
            rumor_id: rumorId,
            initial_spread: propagationResults.initial_reach,
            estimated_total_reach: this.estimateRumorReach(rumor, propagationResults),
            virality_assessment: rumor.virality_score,
            credibility_projection: this.projectCredibilityDecay(rumor)
        };
    }

    spreadGossip(spreader, gossipContent, targetAgent = null) {
        const gossip = {
            spreader: spreader,
            content: gossipContent,
            timestamp: Date.now(),
            gossip_type: this.classifyGossipType(gossipContent),
            credibility: this.calculateGossipCredibility(spreader, gossipContent),
            social_impact: this.assessGossipSocialImpact(gossipContent),
            target_agent: targetAgent
        };

        if (targetAgent) {
            // Direct gossip to specific agent
            return this.sendDirectGossip(gossip, targetAgent);
        } else {
            // Spread through gossip network
            return this.gossipNetwork.spreadGossip(gossip);
        }
    }

    // Information market mechanics
    createInformationOffer(seller, informationType, data, price, terms = {}) {
        const offerId = this.generateOfferId();
        
        const offer = {
            id: offerId,
            seller: seller,
            type: informationType,
            data_preview: this.createDataPreview(data),
            full_data: data, // Encrypted until purchase
            price: price,
            terms: {
                exclusive: terms.exclusive || false,
                limited_uses: terms.limited_uses || null,
                expiry: terms.expiry || null,
                verification_guarantee: terms.verification_guarantee || false,
                refund_policy: terms.refund_policy || 'no_refund',
                ...terms
            },
            quality_assessment: this.assessInformationQuality(seller, data),
            seller_reputation: this.reputationSystem.getReputation(seller),
            creation_time: Date.now(),
            view_count: 0,
            inquiry_count: 0
        };

        // List in information market
        const marketListing = this.informationMarket.createOffer(offer);
        
        return {
            offer_id: offerId,
            market_listing: marketListing.id,
            preview_available: true,
            estimated_interest: this.estimateMarketInterest(offer)
        };
    }

    purchaseInformation(buyer, offerId, negotiatedTerms = null) {
        const offer = this.informationMarket.getOffer(offerId);
        if (!offer) {
            throw new Error(`Offer ${offerId} not found`);
        }

        // Verify buyer can afford the information
        if (!this.verifyBuyerCapacity(buyer, offer.price)) {
            throw new Error('Insufficient resources for purchase');
        }

        // Process the transaction
        const transaction = this.informationMarket.processTransaction(buyer, offer, negotiatedTerms);
        
        // Transfer information to buyer
        const informationTransfer = this.transferInformation(offer, buyer, transaction);
        
        // Update reputation scores based on transaction
        this.updateTransactionReputations(offer.seller, buyer, transaction);
        
        return {
            transaction_id: transaction.id,
            information_received: informationTransfer.success,
            value_assessment: this.assessPurchaseValue(buyer, offer, transaction),
            seller_rating_request: this.generateRatingRequest(transaction)
        };
    }

    // Information aging and decay
    processInformationDecay() {
        const currentTime = Date.now();
        const decayedInformation = [];

        for (const [id, information] of this.activeInformation) {
            const age = currentTime - information.timestamp;
            const decayAmount = this.decayEngine.calculateDecay(information, age);
            
            if (decayAmount > 0) {
                information.confidence = Math.max(0, information.confidence - decayAmount);
                information.value_estimate = Math.max(0, information.value_estimate * (1 - decayAmount / 100));
                
                // Mark as decayed if confidence drops too low
                if (information.confidence < 20) {
                    information.status = 'expired';
                    decayedInformation.push(id);
                }
            }
        }

        // Remove expired information
        decayedInformation.forEach(id => {
            const info = this.activeInformation.get(id);
            this.archiveInformation(id, info);
            this.activeInformation.delete(id);
        });

        return {
            processed_items: this.activeInformation.size,
            expired_items: decayedInformation.length,
            average_confidence: this.calculateAverageConfidence()
        };
    }

    updateInformationRelevance() {
        const relevanceUpdates = [];

        for (const [id, information] of this.activeInformation) {
            const newRelevance = this.relevanceCalculator.calculateCurrentRelevance(information);
            const oldRelevance = information.relevance || 50;
            
            if (Math.abs(newRelevance - oldRelevance) > 10) {
                information.relevance = newRelevance;
                information.value_estimate = this.recalculateValue(information);
                
                relevanceUpdates.push({
                    information_id: id,
                    old_relevance: oldRelevance,
                    new_relevance: newRelevance,
                    value_change: information.value_estimate - (information.previous_value || 0)
                });
            }
        }

        return relevanceUpdates;
    }

    // Information analytics and insights
    analyzeInformationFlow(timeWindow = 3600000) { // 1 hour default
        const cutoffTime = Date.now() - timeWindow;
        const recentInformation = Array.from(this.activeInformation.values())
            .filter(info => info.timestamp >= cutoffTime);

        const analysis = {
            total_information_items: recentInformation.length,
            information_types: this.analyzeInformationTypes(recentInformation),
            quality_distribution: this.analyzeQualityDistribution(recentInformation),
            sharing_patterns: this.analyzeSharingPatterns(recentInformation),
            verification_rates: this.analyzeVerificationRates(recentInformation),
            information_value_trends: this.analyzeValueTrends(recentInformation),
            most_active_sharers: this.identifyActiveSharers(recentInformation),
            most_valuable_information: this.identifyValuableInformation(recentInformation),
            network_effects: this.analyzeNetworkEffects(recentInformation)
        };

        return analysis;
    }

    getInformationNetworkMetrics() {
        return {
            active_information_count: this.activeInformation.size,
            average_information_age: this.calculateAverageAge(),
            information_velocity: this.calculateInformationVelocity(),
            verification_backlog: this.verificationRequests.size,
            rumor_count: this.rumorTracker.getActiveRumorCount(),
            market_activity: this.informationMarket.getActivityMetrics(),
            gossip_network_health: this.gossipNetwork.getHealthMetrics(),
            quality_standards_compliance: this.assessQualityCompliance()
        };
    }

    generateInformationReport(agentId) {
        const agentInformation = this.getAgentInformation(agentId);
        
        return {
            agent_id: agentId,
            information_sharing_activity: {
                items_shared: agentInformation.shared.length,
                items_received: agentInformation.received.length,
                verification_contributions: agentInformation.verifications.length,
                market_transactions: agentInformation.transactions.length
            },
            reputation_metrics: {
                information_reputation: this.calculateInformationReputation(agentId),
                verification_accuracy: this.calculateVerificationAccuracy(agentId),
                sharing_consistency: this.calculateSharingConsistency(agentId)
            },
            network_position: {
                information_centrality: this.calculateInformationCentrality(agentId),
                trust_network_influence: this.calculateTrustInfluence(agentId),
                gossip_network_reach: this.calculateGossipReach(agentId)
            },
            recommendations: this.generateInformationRecommendations(agentId)
        };
    }

    // Utility methods
    generateInformationId() {
        return `info_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    }

    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    generateOfferId() {
        return `offer_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    generateRumorId() {
        return `rumor_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    }

    calculateInformationValue(type, data, sharer) {
        const baseValue = this.getBaseInformationValue(type);
        const qualityMultiplier = this.getQualityMultiplier(data);
        const sharerReputation = this.reputationSystem.getReputation(sharer);
        const timeliness = this.calculateTimeliness(data);
        const uniqueness = this.calculateUniqueness(type, data);
        
        return baseValue * qualityMultiplier * (sharerReputation / 100) * timeliness * uniqueness;
    }
}

module.exports = InformationSharingSystem;
/**
 * Phase 2 Memory Confidence and Uncertainty Tracking System
 * Advanced confidence modeling with uncertainty quantification
 */

class MemoryConfidenceUncertainty {
    constructor() {
        this.confidenceCalculator = new ConfidenceCalculator();
        this.uncertaintyQuantifier = new UncertaintyQuantifier();
        this.metamemorySystem = new MetamemorySystem();
        this.calibrationEngine = new ConfidenceCalibrationEngine();
        
        // Confidence factors and weights
        this.confidenceFactors = {
            encoding_quality: {
                weight: 0.25,
                subfactors: {
                    attention_level: 0.4,      // How much attention during encoding
                    encoding_depth: 0.3,       // Depth of processing
                    distinctiveness: 0.2,      // How distinctive the memory is
                    elaboration: 0.1           // Amount of elaborative processing
                }
            },
            retrieval_fluency: {
                weight: 0.2,
                subfactors: {
                    retrieval_ease: 0.5,       // How easily memory was retrieved
                    retrieval_speed: 0.3,      // Speed of retrieval
                    retrieval_effort: 0.2      // Effort required for retrieval
                }
            },
            memory_characteristics: {
                weight: 0.2,
                subfactors: {
                    vividness: 0.3,            // Vividness of memory details
                    coherence: 0.25,           // Internal coherence
                    completeness: 0.25,        // Completeness of memory
                    sensory_detail: 0.2        // Amount of sensory detail
                }
            },
            source_monitoring: {
                weight: 0.15,
                subfactors: {
                    source_clarity: 0.4,       // Clarity of memory source
                    source_plausibility: 0.3,  // Plausibility of source
                    source_consistency: 0.3    // Consistency of source information
                }
            },
            external_validation: {
                weight: 0.1,
                subfactors: {
                    corroboration: 0.5,        // External corroboration
                    consistency_with_knowledge: 0.3, // Consistency with existing knowledge
                    plausibility: 0.2          // General plausibility
                }
            },
            temporal_factors: {
                weight: 0.1,
                subfactors: {
                    recency: 0.4,              // How recent the memory is
                    rehearsal_count: 0.3,      // How often recalled
                    time_since_encoding: 0.3   // Time since original encoding
                }
            }
        };
        
        // Uncertainty sources
        this.uncertaintySources = {
            episodic_uncertainty: {
                description: 'Uncertainty about specific episodic details',
                types: ['temporal_uncertainty', 'spatial_uncertainty', 'participant_uncertainty', 'sequence_uncertainty'],
                measurement: 'detail_confidence_variance'
            },
            semantic_uncertainty: {
                description: 'Uncertainty about factual content',
                types: ['fact_uncertainty', 'rule_uncertainty', 'relationship_uncertainty'],
                measurement: 'knowledge_confidence'
            },
            source_uncertainty: {
                description: 'Uncertainty about memory source',
                types: ['source_identity', 'source_timing', 'source_context'],
                measurement: 'source_monitoring_confidence'
            },
            reconstructive_uncertainty: {
                description: 'Uncertainty introduced during reconstruction',
                types: ['inference_uncertainty', 'schema_uncertainty', 'gap_filling_uncertainty'],
                measurement: 'reconstruction_confidence'
            },
            emotional_uncertainty: {
                description: 'Uncertainty about emotional content',
                types: ['emotion_type_uncertainty', 'intensity_uncertainty', 'valence_uncertainty'],
                measurement: 'emotional_confidence'
            },
            temporal_uncertainty: {
                description: 'Uncertainty about timing and sequence',
                types: ['absolute_time_uncertainty', 'relative_time_uncertainty', 'duration_uncertainty'],
                measurement: 'temporal_confidence'
            }
        };
        
        // Confidence calibration parameters
        this.calibrationParams = {
            overconfidence_bias: 0.15,        // Tendency to be overconfident
            underconfidence_bias: 0.08,       // Tendency to be underconfident
            confidence_granularity: 10,       // Number of confidence levels
            calibration_window: 100,          // Number of memories for calibration
            learning_rate: 0.05,              // How quickly calibration adapts
            
            // Domain-specific calibration
            domain_calibration: {
                episodic: { bias: 0.12, variance: 0.2 },
                semantic: { bias: -0.05, variance: 0.15 },
                emotional: { bias: 0.08, variance: 0.25 },
                social: { bias: 0.1, variance: 0.18 },
                temporal: { bias: 0.15, variance: 0.22 }
            }
        };
        
        // Metamemory knowledge
        this.metamemoryKnowledge = {
            memory_strengths: {},     // Known strengths in memory
            memory_weaknesses: {},    // Known weaknesses
            confidence_patterns: {}, // Patterns in confidence accuracy
            uncertainty_patterns: {},// Patterns in uncertainty
            domain_expertise: {},    // Expertise in different domains
            
            // Self-knowledge about memory
            metamemory_beliefs: {
                memory_capability: 70,         // Belief in memory capability
                confidence_accuracy: 60,       // Belief in confidence accuracy
                forgetting_rate: 50,          // Belief about forgetting rate
                interference_susceptibility: 40, // Belief about interference
                false_memory_resistance: 65    // Belief about false memory resistance
            }
        };
        
        // Tracking history
        this.confidenceHistory = [];
        this.uncertaintyHistory = [];
        this.calibrationHistory = [];
        this.metamemoryUpdates = [];
    }
    
    // Main confidence calculation interface
    async calculateMemoryConfidence(memory, retrievalContext = {}) {
        const confidenceSession = {
            session_id: this.generateConfidenceId(),
            timestamp: Date.now(),
            memory_id: memory.id,
            retrieval_context: retrievalContext,
            confidence_factors: {},
            uncertainty_analysis: {},
            final_confidence: 0,
            confidence_breakdown: {},
            uncertainty_breakdown: {},
            metamemory_assessment: {}
        };
        
        try {
            // Calculate base confidence factors
            confidenceSession.confidence_factors = await this.calculateConfidenceFactors(
                memory,
                retrievalContext
            );
            
            // Analyze uncertainty sources
            confidenceSession.uncertainty_analysis = await this.analyzeUncertaintySources(
                memory,
                retrievalContext
            );
            
            // Apply metamemory knowledge
            confidenceSession.metamemory_assessment = await this.applyMetamemoryKnowledge(
                memory,
                confidenceSession.confidence_factors,
                confidenceSession.uncertainty_analysis
            );
            
            // Calculate final confidence
            confidenceSession.final_confidence = await this.calculateFinalConfidence(
                confidenceSession.confidence_factors,
                confidenceSession.uncertainty_analysis,
                confidenceSession.metamemory_assessment
            );
            
            // Apply calibration
            confidenceSession.calibrated_confidence = await this.applyConfidenceCalibration(
                confidenceSession.final_confidence,
                memory,
                retrievalContext
            );
            
            // Generate confidence breakdown
            confidenceSession.confidence_breakdown = this.generateConfidenceBreakdown(
                confidenceSession
            );
            
            // Generate uncertainty breakdown
            confidenceSession.uncertainty_breakdown = this.generateUncertaintyBreakdown(
                confidenceSession.uncertainty_analysis
            );
            
            confidenceSession.status = 'completed';
            
            // Store confidence calculation
            this.confidenceHistory.push(confidenceSession);
            
            // Update metamemory if validation available
            if (retrievalContext.validation_available) {
                this.updateMetamemoryKnowledge(confidenceSession, retrievalContext.validation_data);
            }
            
        } catch (error) {
            confidenceSession.status = 'failed';
            confidenceSession.error = error.message;
            confidenceSession.final_confidence = 0.5; // Default neutral confidence
        }
        
        return confidenceSession;
    }
    
    // Calculate individual confidence factors
    async calculateConfidenceFactors(memory, retrievalContext) {
        const factors = {};
        
        // Encoding quality factors
        factors.encoding_quality = this.calculateEncodingQuality(memory);
        
        // Retrieval fluency factors
        factors.retrieval_fluency = this.calculateRetrievalFluency(memory, retrievalContext);
        
        // Memory characteristics factors
        factors.memory_characteristics = this.calculateMemoryCharacteristics(memory);
        
        // Source monitoring factors
        factors.source_monitoring = this.calculateSourceMonitoring(memory);
        
        // External validation factors
        factors.external_validation = this.calculateExternalValidation(memory, retrievalContext);
        
        // Temporal factors
        factors.temporal_factors = this.calculateTemporalFactors(memory);
        
        return factors;
    }
    
    calculateEncodingQuality(memory) {
        const encoding = {
            attention_level: memory.encoding_attention || 70,
            encoding_depth: this.assessEncodingDepth(memory),
            distinctiveness: this.assessDistinctiveness(memory),
            elaboration: this.assessElaboration(memory)
        };
        
        // Calculate weighted score
        const subfactors = this.confidenceFactors.encoding_quality.subfactors;
        const score = Object.keys(encoding).reduce((sum, factor) => {
            return sum + encoding[factor] * subfactors[factor];
        }, 0);
        
        return {
            score: score,
            components: encoding,
            confidence_contribution: score * this.confidenceFactors.encoding_quality.weight
        };
    }
    
    calculateRetrievalFluency(memory, retrievalContext) {
        const fluency = {
            retrieval_ease: retrievalContext.retrieval_ease || this.estimateRetrievalEase(memory),
            retrieval_speed: retrievalContext.retrieval_speed || this.estimateRetrievalSpeed(memory),
            retrieval_effort: retrievalContext.retrieval_effort || this.estimateRetrievalEffort(memory)
        };
        
        const subfactors = this.confidenceFactors.retrieval_fluency.subfactors;
        const score = Object.keys(fluency).reduce((sum, factor) => {
            return sum + fluency[factor] * subfactors[factor];
        }, 0);
        
        return {
            score: score,
            components: fluency,
            confidence_contribution: score * this.confidenceFactors.retrieval_fluency.weight
        };
    }
    
    calculateMemoryCharacteristics(memory) {
        const characteristics = {
            vividness: memory.vividness || this.assessVividness(memory),
            coherence: memory.coherence || this.assessCoherence(memory),
            completeness: memory.completeness || this.assessCompleteness(memory),
            sensory_detail: memory.sensory_detail || this.assessSensoryDetail(memory)
        };
        
        const subfactors = this.confidenceFactors.memory_characteristics.subfactors;
        const score = Object.keys(characteristics).reduce((sum, factor) => {
            return sum + characteristics[factor] * subfactors[factor];
        }, 0);
        
        return {
            score: score,
            components: characteristics,
            confidence_contribution: score * this.confidenceFactors.memory_characteristics.weight
        };
    }
    
    calculateSourceMonitoring(memory) {
        const sourceMonitoring = {
            source_clarity: this.assessSourceClarity(memory),
            source_plausibility: this.assessSourcePlausibility(memory),
            source_consistency: this.assessSourceConsistency(memory)
        };
        
        const subfactors = this.confidenceFactors.source_monitoring.subfactors;
        const score = Object.keys(sourceMonitoring).reduce((sum, factor) => {
            return sum + sourceMonitoring[factor] * subfactors[factor];
        }, 0);
        
        return {
            score: score,
            components: sourceMonitoring,
            confidence_contribution: score * this.confidenceFactors.source_monitoring.weight
        };
    }
    
    // Analyze uncertainty sources
    async analyzeUncertaintySources(memory, retrievalContext) {
        const uncertaintyAnalysis = {
            total_uncertainty: 0,
            uncertainty_sources: {},
            uncertainty_breakdown: {},
            dominant_uncertainty_source: null
        };
        
        // Analyze each uncertainty source
        for (const [sourceName, sourceConfig] of Object.entries(this.uncertaintySources)) {
            const uncertainty = this.calculateUncertaintySource(memory, sourceName, sourceConfig);
            uncertaintyAnalysis.uncertainty_sources[sourceName] = uncertainty;
        }
        
        // Calculate total uncertainty
        uncertaintyAnalysis.total_uncertainty = this.calculateTotalUncertainty(
            uncertaintyAnalysis.uncertainty_sources
        );
        
        // Generate uncertainty breakdown
        uncertaintyAnalysis.uncertainty_breakdown = this.generateUncertaintyBreakdown(
            uncertaintyAnalysis.uncertainty_sources
        );
        
        // Identify dominant uncertainty source
        uncertaintyAnalysis.dominant_uncertainty_source = this.identifyDominantUncertaintySource(
            uncertaintyAnalysis.uncertainty_sources
        );
        
        return uncertaintyAnalysis;
    }
    
    calculateUncertaintySource(memory, sourceName, sourceConfig) {
        let uncertainty = 0;
        const uncertaintyDetails = {};
        
        switch (sourceName) {
            case 'episodic_uncertainty':
                uncertainty = this.calculateEpisodicUncertainty(memory);
                break;
            case 'semantic_uncertainty':
                uncertainty = this.calculateSemanticUncertainty(memory);
                break;
            case 'source_uncertainty':
                uncertainty = this.calculateSourceUncertainty(memory);
                break;
            case 'reconstructive_uncertainty':
                uncertainty = this.calculateReconstructiveUncertainty(memory);
                break;
            case 'emotional_uncertainty':
                uncertainty = this.calculateEmotionalUncertainty(memory);
                break;
            case 'temporal_uncertainty':
                uncertainty = this.calculateTemporalUncertainty(memory);
                break;
        }
        
        return {
            uncertainty_level: uncertainty,
            uncertainty_types: sourceConfig.types,
            measurement_method: sourceConfig.measurement,
            details: uncertaintyDetails
        };
    }
    
    calculateEpisodicUncertainty(memory) {
        let uncertainty = 0;
        
        // Check detail consistency and completeness
        const detailCompleteness = this.assessDetailCompleteness(memory);
        uncertainty += (100 - detailCompleteness) / 100 * 0.3;
        
        // Check temporal precision
        const temporalPrecision = this.assessTemporalPrecision(memory);
        uncertainty += (100 - temporalPrecision) / 100 * 0.25;
        
        // Check spatial precision
        const spatialPrecision = this.assessSpatialPrecision(memory);
        uncertainty += (100 - spatialPrecision) / 100 * 0.2;
        
        // Check participant certainty
        const participantCertainty = this.assessParticipantCertainty(memory);
        uncertainty += (100 - participantCertainty) / 100 * 0.15;
        
        // Check sequence certainty
        const sequenceCertainty = this.assessSequenceCertainty(memory);
        uncertainty += (100 - sequenceCertainty) / 100 * 0.1;
        
        return Math.min(1.0, uncertainty);
    }
    
    calculateSemanticUncertainty(memory) {
        let uncertainty = 0;
        
        // Check factual confidence
        const factualConfidence = memory.factual_confidence || 70;
        uncertainty += (100 - factualConfidence) / 100 * 0.4;
        
        // Check rule certainty
        const ruleCertainty = this.assessRuleCertainty(memory);
        uncertainty += (100 - ruleCertainty) / 100 * 0.3;
        
        // Check relationship certainty
        const relationshipCertainty = this.assessRelationshipCertainty(memory);
        uncertainty += (100 - relationshipCertainty) / 100 * 0.3;
        
        return Math.min(1.0, uncertainty);
    }
    
    // Apply metamemory knowledge
    async applyMetamemoryKnowledge(memory, confidenceFactors, uncertaintyAnalysis) {
        const metamemoryAssessment = {
            domain_expertise_adjustment: 0,
            personal_bias_adjustment: 0,
            pattern_based_adjustment: 0,
            metamemory_confidence: 0
        };
        
        // Apply domain expertise knowledge
        const memoryDomain = this.identifyMemoryDomain(memory);
        const domainExpertise = this.metamemoryKnowledge.domain_expertise[memoryDomain] || 50;
        metamemoryAssessment.domain_expertise_adjustment = (domainExpertise - 50) / 100 * 0.1;
        
        // Apply personal bias knowledge
        const personalBias = this.assessPersonalBias(memory, confidenceFactors);
        metamemoryAssessment.personal_bias_adjustment = personalBias;
        
        // Apply pattern-based knowledge
        const patternAdjustment = this.applyConfidencePatterns(memory, confidenceFactors);
        metamemoryAssessment.pattern_based_adjustment = patternAdjustment;
        
        // Calculate overall metamemory confidence
        metamemoryAssessment.metamemory_confidence = this.calculateMetamemoryConfidence(
            memory,
            confidenceFactors,
            uncertaintyAnalysis
        );
        
        return metamemoryAssessment;
    }
    
    // Calculate final confidence
    async calculateFinalConfidence(confidenceFactors, uncertaintyAnalysis, metamemoryAssessment) {
        let finalConfidence = 0;
        
        // Sum weighted confidence factors
        for (const [factorName, factorData] of Object.entries(confidenceFactors)) {
            finalConfidence += factorData.confidence_contribution;
        }
        
        // Apply uncertainty penalty
        const uncertaintyPenalty = uncertaintyAnalysis.total_uncertainty * 0.3;
        finalConfidence -= uncertaintyPenalty;
        
        // Apply metamemory adjustments
        finalConfidence += metamemoryAssessment.domain_expertise_adjustment;
        finalConfidence += metamemoryAssessment.personal_bias_adjustment;
        finalConfidence += metamemoryAssessment.pattern_based_adjustment;
        
        // Apply metamemory confidence weighting
        const metamemoryWeight = metamemoryAssessment.metamemory_confidence / 100 * 0.1;
        finalConfidence = finalConfidence * (1 - metamemoryWeight) + 
                         metamemoryAssessment.metamemory_confidence * metamemoryWeight;
        
        // Ensure confidence is in valid range [0, 100]
        return Math.max(0, Math.min(100, finalConfidence));
    }
    
    // Apply confidence calibration
    async applyConfidenceCalibration(rawConfidence, memory, retrievalContext) {
        const memoryDomain = this.identifyMemoryDomain(memory);
        const domainCalibration = this.calibrationParams.domain_calibration[memoryDomain] || 
                                 this.calibrationParams.domain_calibration.episodic;
        
        // Apply domain-specific bias correction
        let calibratedConfidence = rawConfidence - (domainCalibration.bias * 100);
        
        // Apply variance adjustment
        const confidenceDeviation = calibratedConfidence - 50; // Deviation from neutral
        calibratedConfidence = 50 + confidenceDeviation * (1 - domainCalibration.variance);
        
        // Apply general overconfidence/underconfidence correction
        if (calibratedConfidence > 70) {
            calibratedConfidence -= this.calibrationParams.overconfidence_bias * 100;
        } else if (calibratedConfidence < 30) {
            calibratedConfidence += this.calibrationParams.underconfidence_bias * 100;
        }
        
        return Math.max(0, Math.min(100, calibratedConfidence));
    }
    
    // Update metamemory knowledge based on validation
    updateMetamemoryKnowledge(confidenceSession, validationData) {
        const update = {
            timestamp: Date.now(),
            confidence_predicted: confidenceSession.final_confidence,
            confidence_calibrated: confidenceSession.calibrated_confidence,
            accuracy_actual: validationData.accuracy,
            confidence_error: Math.abs(confidenceSession.calibrated_confidence - validationData.accuracy),
            memory_domain: this.identifyMemoryDomain({ id: confidenceSession.memory_id }),
            learning_updates: {}
        };
        
        // Update domain expertise
        const domain = update.memory_domain;
        if (!this.metamemoryKnowledge.domain_expertise[domain]) {
            this.metamemoryKnowledge.domain_expertise[domain] = 50;
        }
        
        // Adjust domain expertise based on performance
        const performanceAdjustment = (validationData.accuracy - 50) * this.calibrationParams.learning_rate;
        this.metamemoryKnowledge.domain_expertise[domain] += performanceAdjustment;
        this.metamemoryKnowledge.domain_expertise[domain] = Math.max(0, Math.min(100, 
            this.metamemoryKnowledge.domain_expertise[domain]));
        
        // Update confidence patterns
        this.updateConfidencePatterns(confidenceSession, validationData);
        
        // Update uncertainty patterns
        this.updateUncertaintyPatterns(confidenceSession, validationData);
        
        // Store metamemory update
        this.metamemoryUpdates.push(update);
        
        return update;
    }
    
    // Generate confidence intervals
    generateConfidenceInterval(confidence, uncertainty, intervalWidth = 0.95) {
        const halfWidth = uncertainty * 1.96 * (intervalWidth / 0.95); // Adjust for different interval widths
        
        return {
            point_estimate: confidence,
            lower_bound: Math.max(0, confidence - halfWidth),
            upper_bound: Math.min(100, confidence + halfWidth),
            interval_width: intervalWidth,
            uncertainty_level: uncertainty
        };
    }
    
    // Confidence updating based on new evidence
    async updateConfidenceWithEvidence(memoryId, newEvidence, evidenceWeight = 1.0) {
        const updateSession = {
            session_id: this.generateUpdateId(),
            timestamp: Date.now(),
            memory_id: memoryId,
            new_evidence: newEvidence,
            evidence_weight: evidenceWeight,
            prior_confidence: 0,
            updated_confidence: 0,
            confidence_change: 0
        };
        
        // Get current confidence
        const currentMemory = this.getMemoryById(memoryId);
        if (!currentMemory) {
            throw new Error(`Memory ${memoryId} not found`);
        }
        
        updateSession.prior_confidence = currentMemory.confidence || 50;
        
        // Calculate evidence impact
        const evidenceImpact = this.calculateEvidenceImpact(newEvidence, currentMemory);
        
        // Update confidence using Bayesian updating
        updateSession.updated_confidence = this.bayesianConfidenceUpdate(
            updateSession.prior_confidence,
            evidenceImpact,
            evidenceWeight
        );
        
        updateSession.confidence_change = updateSession.updated_confidence - updateSession.prior_confidence;
        
        return updateSession;
    }
    
    // Utility methods
    generateConfidenceId() {
        return `conf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    generateUpdateId() {
        return `upd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    identifyMemoryDomain(memory) {
        // Identify the domain of the memory for calibration purposes
        if (memory.type === 'trade' || memory.type === 'financial') return 'semantic';
        if (memory.type === 'social' || memory.participants) return 'social';
        if (memory.emotional_profile && memory.emotional_profile.intensity > 70) return 'emotional';
        if (memory.timestamp || memory.temporal_context) return 'temporal';
        return 'episodic'; // Default
    }
    
    bayesianConfidenceUpdate(priorConfidence, evidenceImpact, evidenceWeight) {
        // Simple Bayesian updating of confidence
        const prior = priorConfidence / 100; // Convert to probability
        const likelihood = evidenceImpact; // Evidence likelihood
        
        // Bayesian update
        const posterior = (likelihood * prior) / 
                         ((likelihood * prior) + ((1 - likelihood) * (1 - prior)));
        
        // Weight the update
        const weightedPosterior = prior + evidenceWeight * (posterior - prior);
        
        return Math.max(0, Math.min(100, weightedPosterior * 100));
    }
    
    // Public interface for system statistics
    getConfidenceUncertaintyStats() {
        return {
            total_confidence_calculations: this.confidenceHistory.length,
            avg_confidence_level: this.calculateAverageConfidence(),
            avg_uncertainty_level: this.calculateAverageUncertainty(),
            confidence_calibration_accuracy: this.calculateCalibrationAccuracy(),
            metamemory_accuracy: this.calculateMetamemoryAccuracy(),
            most_uncertain_domain: this.getMostUncertainDomain(),
            confidence_trend: this.calculateConfidenceTrend(),
            uncertainty_trend: this.calculateUncertaintyTrend(),
            calibration_performance: this.getCalibrationPerformance()
        };
    }
}

// Supporting classes
class ConfidenceCalculator {
    constructor() {
        this.calculationHistory = [];
    }
}

class UncertaintyQuantifier {
    constructor() {
        this.uncertaintyModels = new Map();
    }
}

class MetamemorySystem {
    constructor() {
        this.metamemoryKnowledge = new Map();
    }
}

class ConfidenceCalibrationEngine {
    constructor() {
        this.calibrationData = [];
    }
}

module.exports = MemoryConfidenceUncertainty;
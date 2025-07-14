/**
 * Phase 2 Episodic vs Semantic Memory Differentiation
 * Advanced separation and interaction between episodic and semantic memory systems
 */

class EpisodicSemanticDifferentiation {
    constructor() {
        this.episodicMemoryStore = new EpisodicMemoryStore();
        this.semanticMemoryStore = new SemanticMemoryStore();
        this.memoryClassifier = new MemoryTypeClassifier();
        this.transformationEngine = new EpisodicToSemanticTransformation();
        
        // Memory system characteristics
        this.systemCharacteristics = {
            episodic: {
                content_type: 'specific_events',
                temporal_specificity: 'high',
                contextual_richness: 'high',
                personal_relevance: 'high',
                accuracy_decay: 'moderate',
                confidence_decay: 'high',
                reconstruction_susceptibility: 'high',
                emotional_dependency: 'high',
                retrieval_cues: ['temporal', 'spatial', 'contextual', 'emotional'],
                forgetting_curve: 'exponential',
                interference_susceptibility: 'high'
            },
            semantic: {
                content_type: 'general_knowledge',
                temporal_specificity: 'low',
                contextual_richness: 'low',
                personal_relevance: 'variable',
                accuracy_decay: 'low',
                confidence_decay: 'low',
                reconstruction_susceptibility: 'low',
                emotional_dependency: 'low',
                retrieval_cues: ['conceptual', 'categorical', 'associative'],
                forgetting_curve: 'power_law',
                interference_susceptibility: 'low'
            }
        };
        
        // Transformation parameters
        this.transformationParams = {
            // Conditions for episodic to semantic transformation
            repetition_threshold: 5,        // Number of similar episodes
            abstraction_threshold: 0.7,     // Similarity threshold for abstraction
            temporal_distance_threshold: 30, // Days before transformation eligible
            confidence_threshold: 0.8,      // Minimum confidence for transformation
            
            // Semantic crystallization parameters
            crystallization_delay: 24 * 60 * 60 * 1000, // 24 hours
            consolidation_strength: 0.85,   // Strength of semantic consolidation
            episodic_preservation_rate: 0.3, // How much episodic detail preserved
            
            // Bidirectional influence parameters
            semantic_to_episodic_influence: 0.4, // How semantic knowledge affects episodic recall
            episodic_to_semantic_influence: 0.6,  // How episodic memories inform semantic knowledge
            
            // Quality control parameters
            false_semantic_detection_threshold: 0.5,
            consistency_check_strength: 0.8,
            source_monitoring_accuracy: 0.7
        };
        
        // Memory interaction patterns
        this.interactionPatterns = {
            episodic_cueing_semantic: {
                description: 'Episodic memories trigger related semantic knowledge',
                strength: 0.8,
                bidirectional: true,
                examples: ['remembering_specific_example_helps_recall_general_rule']
            },
            semantic_scaffolding_episodic: {
                description: 'Semantic knowledge provides framework for episodic encoding',
                strength: 0.7,
                bidirectional: false,
                examples: ['existing_knowledge_helps_understand_new_experience']
            },
            episodic_updating_semantic: {
                description: 'New episodic experiences update semantic knowledge',
                strength: 0.6,
                bidirectional: false,
                examples: ['exception_updates_rule', 'new_example_refines_concept']
            },
            semantic_biasing_episodic: {
                description: 'Semantic knowledge biases episodic reconstruction',
                strength: 0.5,
                bidirectional: false,
                examples: ['schema_fills_memory_gaps', 'expectation_alters_recall']
            }
        };
        
        // Classification features
        this.classificationFeatures = {
            temporal_markers: {
                'specific_time': 1.0,      // "at 3:15 PM on Tuesday"
                'relative_time': 0.8,      // "yesterday", "last week"
                'vague_time': 0.3,         // "once", "sometimes"
                'atemporal': 0.0           // no time reference
            },
            spatial_markers: {
                'specific_location': 1.0,   // "in the kitchen at home"
                'general_location': 0.6,    // "at work", "downtown"
                'vague_location': 0.3,      // "somewhere", "around here"
                'aspatial': 0.0             // no location reference
            },
            personal_markers: {
                'first_person': 1.0,        // "I did", "I saw"
                'second_person': 0.7,       // "you said", "we went"
                'third_person': 0.3,        // "they did", "someone said"
                'impersonal': 0.0           // "it is known that"
            },
            specificity_markers: {
                'unique_details': 1.0,      // specific, unrepeatable details
                'typical_details': 0.6,     // common, repeatable details
                'general_patterns': 0.3,    // general tendencies
                'abstract_concepts': 0.0    // pure abstractions
            }
        };
    }
    
    // Main differentiation process
    processMemoryDifferentiation(memories) {
        const results = {
            classified_memories: [],
            episodic_memories: [],
            semantic_memories: [],
            hybrid_memories: [],
            transformation_candidates: [],
            interaction_analysis: {},
            system_metrics: {}
        };
        
        // Classify each memory
        for (const memory of memories) {
            const classification = this.classifyMemoryType(memory);
            const enrichedMemory = this.enrichMemoryWithTypeInfo(memory, classification);
            
            results.classified_memories.push(enrichedMemory);
            
            // Route to appropriate store
            switch (classification.primary_type) {
                case 'episodic':
                    results.episodic_memories.push(enrichedMemory);
                    this.episodicMemoryStore.store(enrichedMemory);
                    break;
                case 'semantic':
                    results.semantic_memories.push(enrichedMemory);
                    this.semanticMemoryStore.store(enrichedMemory);
                    break;
                case 'hybrid':
                    results.hybrid_memories.push(enrichedMemory);
                    break;
            }
        }
        
        // Identify transformation candidates
        results.transformation_candidates = this.identifyTransformationCandidates(
            results.episodic_memories
        );
        
        // Analyze interactions between systems
        results.interaction_analysis = this.analyzeSystemInteractions(
            results.episodic_memories,
            results.semantic_memories
        );
        
        // Calculate system metrics
        results.system_metrics = this.calculateSystemMetrics(results);
        
        return results;
    }
    
    classifyMemoryType(memory) {
        const features = this.extractClassificationFeatures(memory);
        const scores = this.calculateTypeScores(features);
        
        const classification = {
            primary_type: this.determinePrimaryType(scores),
            confidence: this.calculateClassificationConfidence(scores),
            episodic_score: scores.episodic,
            semantic_score: scores.semantic,
            hybrid_indicators: this.identifyHybridIndicators(scores, features),
            classification_features: features,
            classification_reasoning: this.generateClassificationReasoning(scores, features)
        };
        
        return classification;
    }
    
    extractClassificationFeatures(memory) {
        const content = JSON.stringify(memory).toLowerCase();
        const features = {
            temporal_specificity: this.extractTemporalFeatures(memory, content),
            spatial_specificity: this.extractSpatialFeatures(memory, content),
            personal_involvement: this.extractPersonalFeatures(memory, content),
            content_specificity: this.extractSpecificityFeatures(memory, content),
            contextual_richness: this.extractContextualFeatures(memory),
            emotional_content: this.extractEmotionalFeatures(memory),
            sensory_details: this.extractSensoryFeatures(memory),
            narrative_structure: this.extractNarrativeFeatures(memory)
        };
        
        return features;
    }
    
    extractTemporalFeatures(memory, content) {
        const timeWords = {
            specific: ['at', 'on', 'during', 'when', 'exactly', 'precisely'],
            relative: ['yesterday', 'today', 'last', 'next', 'ago', 'before', 'after'],
            vague: ['once', 'sometimes', 'often', 'usually', 'occasionally'],
            atemporal: ['always', 'never', 'generally', 'typically']
        };
        
        let maxScore = 0;
        let dominantType = 'atemporal';
        
        for (const [type, words] of Object.entries(timeWords)) {
            const score = words.reduce((count, word) => 
                count + (content.split(word).length - 1), 0) / words.length;
            
            if (score > maxScore) {
                maxScore = score;
                dominantType = type;
            }
        }
        
        return {
            dominant_type: dominantType,
            specificity_score: this.classificationFeatures.temporal_markers[dominantType],
            temporal_anchors: this.findTemporalAnchors(memory),
            relative_timing: this.extractRelativeTiming(memory)
        };
    }
    
    extractSpatialFeatures(memory, content) {
        const locationWords = {
            specific: ['in', 'at', 'on', 'inside', 'outside', 'near', 'behind'],
            general: ['home', 'work', 'school', 'downtown', 'upstairs'],
            vague: ['somewhere', 'anywhere', 'nowhere', 'place'],
            aspatial: ['everywhere', 'universally', 'generally']
        };
        
        let maxScore = 0;
        let dominantType = 'aspatial';
        
        for (const [type, words] of Object.entries(locationWords)) {
            const score = words.reduce((count, word) => 
                count + (content.split(word).length - 1), 0) / words.length;
            
            if (score > maxScore) {
                maxScore = score;
                dominantType = type;
            }
        }
        
        return {
            dominant_type: dominantType,
            specificity_score: this.classificationFeatures.spatial_markers[dominantType],
            location_details: this.extractLocationDetails(memory),
            spatial_context: this.extractSpatialContext(memory)
        };
    }
    
    extractPersonalFeatures(memory, content) {
        const personalPronouns = {
            first: ['i', 'me', 'my', 'mine', 'myself'],
            second: ['you', 'your', 'yours', 'we', 'us', 'our'],
            third: ['he', 'she', 'they', 'them', 'his', 'her', 'their'],
            impersonal: ['it', 'one', 'people', 'everyone', 'someone']
        };
        
        let maxScore = 0;
        let dominantType = 'impersonal';
        
        for (const [type, pronouns] of Object.entries(personalPronouns)) {
            const score = pronouns.reduce((count, pronoun) => 
                count + (content.split(` ${pronoun} `).length - 1), 0) / pronouns.length;
            
            if (score > maxScore) {
                maxScore = score;
                dominantType = type;
            }
        }
        
        return {
            dominant_type: dominantType,
            involvement_score: this.classificationFeatures.personal_markers[dominantType],
            perspective: this.extractPerspective(memory),
            agency_level: this.extractAgencyLevel(memory)
        };
    }
    
    extractSpecificityFeatures(memory, content) {
        const specificityIndicators = {
            unique: this.countUniqueDetails(memory),
            typical: this.countTypicalDetails(memory),
            general: this.countGeneralPatterns(memory),
            abstract: this.countAbstractConcepts(memory)
        };
        
        const total = Object.values(specificityIndicators).reduce((sum, count) => sum + count, 0);
        
        if (total === 0) {
            return {
                dominant_type: 'abstract',
                specificity_score: 0,
                detail_distribution: specificityIndicators
            };
        }
        
        const dominantType = Object.keys(specificityIndicators).reduce((a, b) => 
            specificityIndicators[a] > specificityIndicators[b] ? a : b
        );
        
        return {
            dominant_type: dominantType,
            specificity_score: this.classificationFeatures.specificity_markers[dominantType],
            detail_distribution: specificityIndicators,
            detail_density: total / (content.length / 100) // details per 100 characters
        };
    }
    
    extractContextualFeatures(memory) {
        let richness = 0;
        
        // Check for various contextual elements
        if (memory.context) richness += 20;
        if (memory.participants) richness += 15;
        if (memory.environment) richness += 15;
        if (memory.emotional_context) richness += 10;
        if (memory.social_context) richness += 10;
        if (memory.cultural_context) richness += 10;
        if (memory.temporal_context) richness += 10;
        if (memory.causal_context) richness += 10;
        
        return {
            richness_score: richness,
            context_types: this.identifyContextTypes(memory),
            context_depth: this.calculateContextDepth(memory)
        };
    }
    
    extractEmotionalFeatures(memory) {
        const emotionalContent = {
            has_emotions: !!(memory.emotional_profile || memory.emotions),
            intensity: memory.emotional_profile?.intensity || 0,
            valence: memory.emotional_profile?.valence || 0,
            emotional_detail_level: this.calculateEmotionalDetailLevel(memory)
        };
        
        return emotionalContent;
    }
    
    extractSensoryFeatures(memory) {
        const sensoryChannels = ['visual', 'auditory', 'tactile', 'olfactory', 'gustatory'];
        const sensoryContent = {};
        
        sensoryChannels.forEach(channel => {
            sensoryContent[channel] = this.detectSensoryContent(memory, channel);
        });
        
        const totalSensoryRichness = Object.values(sensoryContent).reduce((sum, present) => 
            sum + (present ? 1 : 0), 0);
        
        return {
            sensory_richness: totalSensoryRichness,
            sensory_channels: sensoryContent,
            dominant_sense: this.findDominantSense(sensoryContent)
        };
    }
    
    extractNarrativeFeatures(memory) {
        return {
            has_narrative_structure: this.hasNarrativeStructure(memory),
            story_completeness: this.calculateStoryCompleteness(memory),
            causal_chain_length: this.calculateCausalChainLength(memory),
            temporal_sequence: this.hasTemporalSequence(memory)
        };
    }
    
    calculateTypeScores(features) {
        let episodicScore = 0;
        let semanticScore = 0;
        
        // Temporal specificity contribution
        episodicScore += features.temporal_specificity.specificity_score * 25;
        semanticScore += (1 - features.temporal_specificity.specificity_score) * 25;
        
        // Spatial specificity contribution
        episodicScore += features.spatial_specificity.specificity_score * 20;
        semanticScore += (1 - features.spatial_specificity.specificity_score) * 20;
        
        // Personal involvement contribution
        episodicScore += features.personal_involvement.involvement_score * 20;
        semanticScore += (1 - features.personal_involvement.involvement_score) * 20;
        
        // Content specificity contribution
        episodicScore += features.content_specificity.specificity_score * 15;
        semanticScore += (1 - features.content_specificity.specificity_score) * 15;
        
        // Contextual richness contribution
        episodicScore += (features.contextual_richness.richness_score / 100) * 10;
        semanticScore += (1 - features.contextual_richness.richness_score / 100) * 10;
        
        // Sensory details contribution
        episodicScore += (features.sensory_details.sensory_richness / 5) * 10;
        semanticScore += (1 - features.sensory_details.sensory_richness / 5) * 10;
        
        return {
            episodic: Math.min(100, episodicScore),
            semantic: Math.min(100, semanticScore)
        };
    }
    
    determinePrimaryType(scores) {
        const threshold = 60;
        const difference = Math.abs(scores.episodic - scores.semantic);
        
        if (difference < 20) {
            return 'hybrid';
        } else if (scores.episodic > scores.semantic && scores.episodic > threshold) {
            return 'episodic';
        } else if (scores.semantic > scores.episodic && scores.semantic > threshold) {
            return 'semantic';
        } else {
            return 'hybrid';
        }
    }
    
    calculateClassificationConfidence(scores) {
        const maxScore = Math.max(scores.episodic, scores.semantic);
        const difference = Math.abs(scores.episodic - scores.semantic);
        
        // High confidence if one score is clearly dominant
        if (difference > 30 && maxScore > 70) {
            return 0.9;
        } else if (difference > 20 && maxScore > 60) {
            return 0.8;
        } else if (difference > 10) {
            return 0.7;
        } else {
            return 0.6; // Low confidence for hybrid memories
        }
    }
    
    identifyHybridIndicators(scores, features) {
        const indicators = [];
        
        // Check for mixed temporal specificity
        if (features.temporal_specificity.specificity_score > 0.3 && 
            features.temporal_specificity.specificity_score < 0.8) {
            indicators.push('mixed_temporal_specificity');
        }
        
        // Check for abstract content with personal involvement
        if (features.personal_involvement.involvement_score > 0.6 &&
            features.content_specificity.specificity_score < 0.4) {
            indicators.push('personal_abstract_knowledge');
        }
        
        // Check for specific details with general applicability
        if (features.content_specificity.specificity_score > 0.6 &&
            features.contextual_richness.richness_score < 40) {
            indicators.push('specific_generalizable_content');
        }
        
        return indicators;
    }
    
    enrichMemoryWithTypeInfo(memory, classification) {
        return {
            ...memory,
            memory_type: classification.primary_type,
            type_confidence: classification.confidence,
            episodic_score: classification.episodic_score,
            semantic_score: classification.semantic_score,
            hybrid_indicators: classification.hybrid_indicators,
            classification_features: classification.classification_features,
            system_routing: this.determineSystemRouting(classification),
            processing_priority: this.calculateProcessingPriority(memory, classification),
            transformation_eligibility: this.assessTransformationEligibility(memory, classification)
        };
    }
    
    identifyTransformationCandidates(episodicMemories) {
        const candidates = [];
        
        // Group similar episodic memories
        const memoryGroups = this.groupSimilarMemories(episodicMemories);
        
        for (const group of memoryGroups) {
            if (group.length >= this.transformationParams.repetition_threshold) {
                const transformationAssessment = this.assessTransformationPotential(group);
                
                if (transformationAssessment.eligible) {
                    candidates.push({
                        source_memories: group.map(m => m.id),
                        transformation_type: transformationAssessment.transformation_type,
                        confidence: transformationAssessment.confidence,
                        expected_semantic_content: transformationAssessment.semantic_content,
                        transformation_priority: transformationAssessment.priority,
                        estimated_completion_time: transformationAssessment.completion_time
                    });
                }
            }
        }
        
        return candidates.sort((a, b) => b.transformation_priority - a.transformation_priority);
    }
    
    assessTransformationPotential(episodicGroup) {
        const commonElements = this.extractCommonElements(episodicGroup);
        const abstractionLevel = this.calculateAbstractionLevel(commonElements);
        const confidence = this.calculateTransformationConfidence(episodicGroup, commonElements);
        
        const assessment = {
            eligible: confidence > this.transformationParams.confidence_threshold,
            transformation_type: this.determineTransformationType(commonElements),
            confidence: confidence,
            semantic_content: this.generateSemanticContent(commonElements, abstractionLevel),
            priority: this.calculateTransformationPriority(episodicGroup, commonElements),
            completion_time: this.estimateTransformationTime(episodicGroup.length, abstractionLevel)
        };
        
        return assessment;
    }
    
    executeTransformation(transformationCandidate) {
        const transformationSession = {
            session_id: this.generateTransformationId(),
            timestamp: Date.now(),
            source_memories: transformationCandidate.source_memories,
            transformation_type: transformationCandidate.transformation_type,
            stages: {}
        };
        
        try {
            // Stage 1: Extract common elements
            transformationSession.stages.extraction = this.extractCommonElementsStage(
                transformationCandidate.source_memories
            );
            
            // Stage 2: Abstract patterns
            transformationSession.stages.abstraction = this.abstractPatternsStage(
                transformationSession.stages.extraction.common_elements
            );
            
            // Stage 3: Generate semantic knowledge
            transformationSession.stages.semantic_generation = this.generateSemanticKnowledgeStage(
                transformationSession.stages.abstraction.patterns
            );
            
            // Stage 4: Validate and refine
            transformationSession.stages.validation = this.validateSemanticKnowledgeStage(
                transformationSession.stages.semantic_generation.semantic_knowledge
            );
            
            // Stage 5: Integrate into semantic memory
            transformationSession.stages.integration = this.integrateSemanticMemoryStage(
                transformationSession.stages.validation.validated_knowledge
            );
            
            transformationSession.status = 'completed';
            transformationSession.result = transformationSession.stages.integration.integrated_knowledge;
            
        } catch (error) {
            transformationSession.status = 'failed';
            transformationSession.error = error.message;
        }
        
        return transformationSession;
    }
    
    analyzeSystemInteractions(episodicMemories, semanticMemories) {
        const interactions = {
            episodic_to_semantic_influences: [],
            semantic_to_episodic_influences: [],
            bidirectional_reinforcements: [],
            system_conflicts: [],
            interaction_strength: 0
        };
        
        // Analyze episodic to semantic influences
        for (const episodicMemory of episodicMemories) {
            const influences = this.findSemanticInfluences(episodicMemory, semanticMemories);
            interactions.episodic_to_semantic_influences.push(...influences);
        }
        
        // Analyze semantic to episodic influences
        for (const semanticMemory of semanticMemories) {
            const influences = this.findEpisodicInfluences(semanticMemory, episodicMemories);
            interactions.semantic_to_episodic_influences.push(...influences);
        }
        
        // Identify bidirectional reinforcements
        interactions.bidirectional_reinforcements = this.findBidirectionalReinforcements(
            interactions.episodic_to_semantic_influences,
            interactions.semantic_to_episodic_influences
        );
        
        // Detect system conflicts
        interactions.system_conflicts = this.detectSystemConflicts(
            episodicMemories,
            semanticMemories
        );
        
        // Calculate overall interaction strength
        interactions.interaction_strength = this.calculateInteractionStrength(interactions);
        
        return interactions;
    }
    
    // Utility methods
    generateTransformationId() {
        return `trans_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    groupSimilarMemories(memories) {
        // Implement clustering algorithm for similar memories
        const groups = [];
        // Placeholder implementation
        return groups;
    }
    
    extractCommonElements(memoryGroup) {
        // Extract elements that appear across multiple memories in the group
        const commonElements = {
            patterns: [],
            rules: [],
            relationships: [],
            concepts: []
        };
        
        // Placeholder implementation
        return commonElements;
    }
    
    getSystemStats() {
        return {
            total_episodic_memories: this.episodicMemoryStore.count(),
            total_semantic_memories: this.semanticMemoryStore.count(),
            transformations_completed: this.transformationEngine.getCompletedCount(),
            classification_accuracy: this.memoryClassifier.getAccuracy(),
            interaction_strength: this.calculateAverageInteractionStrength()
        };
    }
}

// Supporting classes
class EpisodicMemoryStore {
    constructor() {
        this.memories = new Map();
    }
    
    store(memory) {
        this.memories.set(memory.id, memory);
    }
    
    count() {
        return this.memories.size;
    }
}

class SemanticMemoryStore {
    constructor() {
        this.knowledge = new Map();
    }
    
    store(knowledge) {
        this.knowledge.set(knowledge.id, knowledge);
    }
    
    count() {
        return this.knowledge.size;
    }
}

class MemoryTypeClassifier {
    constructor() {
        this.classificationHistory = [];
    }
    
    getAccuracy() {
        // Calculate classification accuracy based on validation
        return 0.85; // Placeholder
    }
}

class EpisodicToSemanticTransformation {
    constructor() {
        this.transformationHistory = [];
    }
    
    getCompletedCount() {
        return this.transformationHistory.filter(t => t.status === 'completed').length;
    }
}

module.exports = EpisodicSemanticDifferentiation;
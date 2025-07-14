/**
 * Phase 2 Emotional Memory Core System
 * Advanced emotional weighting and experience processing for agent intelligence
 */

class EmotionalMemoryCore {
    constructor(agentId) {
        this.agentId = agentId;
        this.emotionalProfile = this.initializeEmotionalProfile();
        this.experienceProcessor = new ExperienceProcessor();
        this.memoryConsolidator = new MemoryConsolidator();
        this.flashbulbMemories = [];
        this.traumaticMemories = [];
        this.nostalgicMemories = [];
        
        // Advanced emotional weighting system
        this.emotionalWeights = {
            // Primary emotions with intensity scaling
            fear: { base: 2.5, intensity_multiplier: 0.8, decay_rate: 0.7 },
            joy: { base: 1.8, intensity_multiplier: 0.6, decay_rate: 0.85 },
            anger: { base: 2.2, intensity_multiplier: 0.9, decay_rate: 0.75 },
            sadness: { base: 2.0, intensity_multiplier: 0.7, decay_rate: 0.8 },
            surprise: { base: 1.5, intensity_multiplier: 1.2, decay_rate: 0.9 },
            disgust: { base: 1.9, intensity_multiplier: 0.8, decay_rate: 0.78 },
            trust: { base: 1.6, intensity_multiplier: 0.5, decay_rate: 0.95 },
            anticipation: { base: 1.4, intensity_multiplier: 0.7, decay_rate: 0.88 },
            
            // Complex emotional states
            betrayal: { base: 3.0, intensity_multiplier: 1.0, decay_rate: 0.6 },
            euphoria: { base: 2.1, intensity_multiplier: 0.9, decay_rate: 0.82 },
            melancholy: { base: 1.7, intensity_multiplier: 0.6, decay_rate: 0.85 },
            anxiety: { base: 2.3, intensity_multiplier: 0.8, decay_rate: 0.73 },
            pride: { base: 1.8, intensity_multiplier: 0.7, decay_rate: 0.87 },
            shame: { base: 2.4, intensity_multiplier: 0.9, decay_rate: 0.68 },
            nostalgia: { base: 1.9, intensity_multiplier: 0.5, decay_rate: 0.92 },
            
            // Context-dependent emotional modifiers
            contextual: {
                first_time: 1.5,        // First experiences are more emotional
                unexpected: 1.8,        // Unexpected events carry more weight
                repetitive: 0.7,        // Repeated experiences lose emotional impact
                life_changing: 3.5,     // Life-changing events maximum weight
                social: 1.3,            // Social interactions have extra weight
                private: 1.1,           // Private experiences moderate weight
                public: 1.4,            // Public experiences higher weight
                financial: 1.7,         // Financial events carry extra emotional weight
                relationship: 2.0       // Relationship events are highly emotional
            }
        };
        
        // Memory confidence tracking
        this.confidenceFactors = {
            rehearsal_count: 0.1,       // Each recall increases confidence
            emotional_intensity: 0.05,  // Strong emotions increase confidence
            sensory_detail: 0.08,       // Rich sensory details increase confidence
            consistency: 0.15,          // Consistent recall patterns
            corroboration: 0.2,         // External validation
            recency: 0.12              // Recent memories more confident
        };
    }
    
    initializeEmotionalProfile() {
        return {
            baseline_mood: 50,          // Neutral baseline
            emotional_volatility: 30,   // How quickly emotions change
            emotional_depth: 60,        // How deeply emotions are felt
            emotional_memory_bias: 40,  // Tendency to remember emotional events
            emotional_regulation: 45,   // Ability to control emotional responses
            empathy_level: 55,          // Sensitivity to others' emotions
            trauma_sensitivity: 70,     // Susceptibility to traumatic memories
            nostalgia_tendency: 35,     // Propensity for nostalgic memories
            
            // Emotional learning parameters
            conditioning_rate: 0.15,    // How quickly emotional associations form
            extinction_rate: 0.05,      // How quickly emotional associations fade
            generalization_tendency: 0.3, // How broadly emotional responses generalize
            
            // Current emotional state
            current_emotions: {
                primary: 'neutral',
                secondary: null,
                intensity: 20,
                duration: 0,
                triggers: []
            }
        };
    }
    
    // Enhanced memory encoding with emotional weighting
    encodeExperience(rawExperience, emotionalContext) {
        const emotionalWeight = this.calculateEmotionalWeight(emotionalContext);
        const significanceScore = this.calculateSignificance(rawExperience, emotionalContext);
        
        const encodedMemory = {
            id: this.generateMemoryId(),
            timestamp: Date.now(),
            type: rawExperience.type,
            content: rawExperience.data,
            
            // Emotional characteristics
            emotional_profile: {
                primary_emotion: emotionalContext.primary_emotion,
                secondary_emotions: emotionalContext.secondary_emotions || [],
                intensity: emotionalContext.intensity,
                valence: emotionalContext.valence, // positive/negative
                arousal: emotionalContext.arousal,  // high/low activation
                emotional_weight: emotionalWeight
            },
            
            // Memory characteristics
            significance: significanceScore,
            confidence: this.calculateInitialConfidence(rawExperience, emotionalContext),
            vividness: this.calculateVividness(emotionalContext),
            accessibility: this.calculateAccessibility(emotionalContext, significanceScore),
            
            // Processing metadata
            encoding_strength: emotionalWeight * significanceScore / 100,
            decay_rate: this.calculateDecayRate(emotionalContext),
            interference_resistance: this.calculateInterferenceResistance(emotionalContext),
            
            // Contextual information
            context: {
                environmental: rawExperience.environment,
                social: rawExperience.social_context,
                temporal: rawExperience.temporal_context,
                personal_state: this.emotionalProfile.current_emotions
            },
            
            // Memory tags for retrieval
            tags: this.generateAdvancedTags(rawExperience, emotionalContext),
            associations: this.findAssociations(rawExperience, emotionalContext),
            
            // Tracking metadata
            rehearsal_count: 0,
            last_accessed: Date.now(),
            reconstruction_count: 0,
            false_details: [],
            confidence_history: [this.calculateInitialConfidence(rawExperience, emotionalContext)]
        };
        
        // Check for special memory types
        this.categorizeSpecialMemory(encodedMemory, emotionalContext);
        
        return encodedMemory;
    }
    
    calculateEmotionalWeight(emotionalContext) {
        const { primary_emotion, intensity, valence, arousal } = emotionalContext;
        
        // Base weight from emotion type
        const emotionData = this.emotionalWeights[primary_emotion] || this.emotionalWeights.neutral;
        let weight = emotionData.base;
        
        // Apply intensity scaling
        weight *= (1 + (intensity / 100) * emotionData.intensity_multiplier);
        
        // Apply valence and arousal modifiers
        weight *= (1 + Math.abs(valence) / 200); // Extreme emotions more weighted
        weight *= (1 + arousal / 200);           // High arousal increases weight
        
        // Apply contextual modifiers
        if (emotionalContext.contextual_factors) {
            emotionalContext.contextual_factors.forEach(factor => {
                if (this.emotionalWeights.contextual[factor]) {
                    weight *= this.emotionalWeights.contextual[factor];
                }
            });
        }
        
        return Math.min(5.0, weight); // Cap at 5x normal weight
    }
    
    calculateSignificance(rawExperience, emotionalContext) {
        let significance = 50; // Base significance
        
        // Event impact factors
        significance += Math.min(30, Math.abs(rawExperience.impact_score || 0) / 10);
        
        // Unexpectedness increases significance
        if (rawExperience.expectedness < 30) {
            significance += (30 - rawExperience.expectedness) * 0.5;
        }
        
        // First-time experiences are more significant
        if (rawExperience.is_novel) {
            significance += 20;
        }
        
        // Goal relevance
        if (rawExperience.goal_relevance > 70) {
            significance += 15;
        }
        
        // Social significance
        if (rawExperience.social_impact > 50) {
            significance += 10;
        }
        
        // Emotional intensity contributes to significance
        significance += emotionalContext.intensity * 0.3;
        
        return Math.min(100, significance);
    }
    
    calculateInitialConfidence(rawExperience, emotionalContext) {
        let confidence = 70; // Base confidence
        
        // Clear, detailed experiences have higher confidence
        confidence += (rawExperience.detail_level || 50) * 0.4;
        
        // Strong emotions can increase or decrease confidence
        if (emotionalContext.intensity > 80) {
            // Very intense emotions can actually reduce accuracy
            confidence -= 10;
        } else if (emotionalContext.intensity > 40) {
            // Moderate emotions improve encoding
            confidence += 8;
        }
        
        // Attention level during encoding
        confidence += (rawExperience.attention_level || 50) * 0.3;
        
        return Math.min(100, Math.max(10, confidence));
    }
    
    calculateVividness(emotionalContext) {
        // More emotional memories tend to be more vivid
        return Math.min(100, 30 + emotionalContext.intensity * 0.7);
    }
    
    calculateAccessibility(emotionalContext, significance) {
        // Emotional memories are generally more accessible
        let accessibility = 50;
        accessibility += emotionalContext.intensity * 0.4;
        accessibility += significance * 0.3;
        
        // Negative emotions can reduce accessibility (suppression)
        if (emotionalContext.valence < -50) {
            accessibility *= 0.8;
        }
        
        return Math.min(100, accessibility);
    }
    
    calculateDecayRate(emotionalContext) {
        const emotionData = this.emotionalWeights[emotionalContext.primary_emotion];
        let baseDecay = emotionData ? emotionData.decay_rate : 0.85;
        
        // Traumatic memories decay slower
        if (emotionalContext.primary_emotion === 'fear' && emotionalContext.intensity > 80) {
            baseDecay *= 0.7;
        }
        
        // Positive memories with high arousal decay slower
        if (emotionalContext.valence > 50 && emotionalContext.arousal > 70) {
            baseDecay *= 0.9;
        }
        
        return baseDecay;
    }
    
    calculateInterferenceResistance(emotionalContext) {
        // Emotional memories are more resistant to interference
        let resistance = 30 + emotionalContext.intensity * 0.5;
        
        // Traumatic memories are very resistant to interference
        if (emotionalContext.intensity > 90 && emotionalContext.valence < -70) {
            resistance += 25;
        }
        
        return Math.min(100, resistance);
    }
    
    generateAdvancedTags(rawExperience, emotionalContext) {
        const tags = [];
        
        // Basic type tags
        tags.push(rawExperience.type, emotionalContext.primary_emotion);
        
        // Emotional tags
        if (emotionalContext.intensity > 70) tags.push('high_intensity');
        if (emotionalContext.valence > 50) tags.push('positive');
        if (emotionalContext.valence < -50) tags.push('negative');
        if (emotionalContext.arousal > 70) tags.push('high_arousal');
        
        // Context tags
        if (rawExperience.social_context) {
            tags.push('social', ...rawExperience.social_context.participants);
        }
        
        // Significance tags
        if (rawExperience.is_novel) tags.push('first_time');
        if (rawExperience.goal_relevance > 70) tags.push('goal_relevant');
        
        return [...new Set(tags)]; // Remove duplicates
    }
    
    findAssociations(rawExperience, emotionalContext) {
        // Find related memories and concepts
        const associations = {
            emotional: [], // Memories with similar emotional profiles
            contextual: [], // Memories in similar contexts
            temporal: [], // Memories from similar time periods
            semantic: [] // Memories with related content
        };
        
        // This would connect to existing memories for association finding
        // Implementation would involve similarity calculations
        
        return associations;
    }
    
    categorizeSpecialMemory(encodedMemory, emotionalContext) {
        const { intensity, valence, arousal } = emotionalContext;
        
        // Flashbulb memories: highly emotional, surprising events
        if (intensity > 85 && arousal > 80 && encodedMemory.content.expectedness < 20) {
            this.flashbulbMemories.push({
                memory_id: encodedMemory.id,
                created: Date.now(),
                emotional_snapshot: { ...emotionalContext },
                special_characteristics: ['vivid', 'detailed', 'confident', 'persistent']
            });
            encodedMemory.tags.push('flashbulb_memory');
        }
        
        // Traumatic memories: high intensity negative emotions with lasting impact
        if (intensity > 80 && valence < -70 && arousal > 60) {
            this.traumaticMemories.push({
                memory_id: encodedMemory.id,
                trauma_type: this.categorizeTrauma(encodedMemory.content),
                severity: intensity,
                triggers: this.identifyTraumaTriggers(encodedMemory.content),
                avoidance_patterns: [],
                processing_attempts: 0
            });
            encodedMemory.tags.push('traumatic_memory');
            encodedMemory.special_handling = 'trauma_protocol';
        }
        
        // Nostalgic memories: positive memories with temporal distance
        if (valence > 60 && encodedMemory.content.temporal_significance) {
            this.nostalgicMemories.push({
                memory_id: encodedMemory.id,
                nostalgia_triggers: this.identifyNostalgiaTriggers(encodedMemory.content),
                idealization_level: 0,
                reconstruction_bias: 'positive'
            });
            encodedMemory.tags.push('nostalgic_memory');
        }
    }
    
    categorizeTrauma(content) {
        // Identify type of traumatic experience
        if (content.type === 'betrayal') return 'relational_trauma';
        if (content.type === 'loss') return 'grief_trauma';
        if (content.type === 'threat') return 'fear_trauma';
        if (content.type === 'failure') return 'competence_trauma';
        return 'general_trauma';
    }
    
    identifyTraumaTriggers(content) {
        // Extract potential triggers from traumatic content
        const triggers = [];
        
        if (content.location) triggers.push({ type: 'location', value: content.location });
        if (content.participants) triggers.push({ type: 'people', value: content.participants });
        if (content.sounds) triggers.push({ type: 'auditory', value: content.sounds });
        if (content.smells) triggers.push({ type: 'olfactory', value: content.smells });
        if (content.time_of_day) triggers.push({ type: 'temporal', value: content.time_of_day });
        
        return triggers;
    }
    
    identifyNostalgiaTriggers(content) {
        // Extract elements that could trigger nostalgic recall
        const triggers = [];
        
        if (content.music) triggers.push({ type: 'music', value: content.music });
        if (content.scents) triggers.push({ type: 'scent', value: content.scents });
        if (content.visual_details) triggers.push({ type: 'visual', value: content.visual_details });
        if (content.season) triggers.push({ type: 'seasonal', value: content.season });
        
        return triggers;
    }
    
    generateMemoryId() {
        return `emem_${this.agentId}_${Date.now()}_${Math.random().toString(36).substr(2, 12)}`;
    }
    
    // Memory retrieval with emotional context
    retrieveMemoriesWithEmotionalContext(retrievalCue, emotionalState) {
        const relevantMemories = [];
        
        // This would integrate with the main memory system
        // and provide emotionally-weighted retrieval
        
        return relevantMemories;
    }
    
    // Update emotional profile based on experiences
    updateEmotionalProfile(newExperience) {
        const { emotional_profile } = newExperience;
        
        // Gradually adjust baseline mood
        const moodImpact = (emotional_profile.valence - 50) * 0.01;
        this.emotionalProfile.baseline_mood += moodImpact;
        this.emotionalProfile.baseline_mood = Math.max(0, Math.min(100, this.emotionalProfile.baseline_mood));
        
        // Update current emotional state
        this.emotionalProfile.current_emotions = {
            primary: emotional_profile.primary_emotion,
            secondary: emotional_profile.secondary_emotions[0] || null,
            intensity: emotional_profile.intensity * 0.8, // Emotions fade
            duration: this.emotionalProfile.current_emotions.duration + 1,
            triggers: [newExperience.id]
        };
    }
    
    getEmotionalMemoryStats() {
        return {
            total_emotional_memories: this.flashbulbMemories.length + this.traumaticMemories.length + this.nostalgicMemories.length,
            flashbulb_memories: this.flashbulbMemories.length,
            traumatic_memories: this.traumaticMemories.length,
            nostalgic_memories: this.nostalgicMemories.length,
            emotional_profile: { ...this.emotionalProfile },
            emotional_weights_summary: Object.keys(this.emotionalWeights).length
        };
    }
}

module.exports = EmotionalMemoryCore;
/**
 * Advanced Emotional Intelligence System - Phase 2 Enhancement
 * Sophisticated emotional processing with neural modeling, emotional contagion,
 * adaptive emotional regulation, and complex emotional state management
 * 
 * Features:
 * - Multi-dimensional emotional processing (valence, arousal, dominance)
 * - Emotional contagion and social emotional influence
 * - Adaptive coping mechanisms with learning
 * - Emotional memory consolidation
 * - Trauma and emotional resilience modeling
 * - Emotional intelligence skill development
 */

class EmotionalIntelligenceSystem {
    constructor(personalityDNA) {
        this.personality = personalityDNA;
        this.emotionalState = this.initializeEmotionalState();
        this.emotionalHistory = [];
        this.emotionalMemory = new EmotionalMemorySystem();
        this.emotionalRegulation = new AdaptiveEmotionalRegulation(personalityDNA);
        this.emotionalContagion = new EmotionalContagionEngine(personalityDNA);
        this.emotionalSkills = this.initializeEmotionalSkills();
        this.traumaSystem = new TraumaResponseSystem(personalityDNA);
        this.resilienceFactors = this.calculateResilienceFactors();
    }

    initializeEmotionalState() {
        const traits = this.personality.traits;
        
        return {
            // Core dimensional model (Russell's Circumplex Model)
            valence: 50, // Positive-negative emotional tone
            arousal: 30, // Activation level (calm-excited)
            dominance: 50, // Control/power feeling
            
            // Basic emotions (Ekman's model + extensions)
            emotions: {
                joy: this.calculateBaseEmotion('joy', traits),
                sadness: this.calculateBaseEmotion('sadness', traits),
                anger: this.calculateBaseEmotion('anger', traits),
                fear: this.calculateBaseEmotion('fear', traits),
                surprise: this.calculateBaseEmotion('surprise', traits),
                disgust: this.calculateBaseEmotion('disgust', traits),
                contempt: this.calculateBaseEmotion('contempt', traits),
                pride: this.calculateBaseEmotion('pride', traits),
                shame: this.calculateBaseEmotion('shame', traits),
                guilt: this.calculateBaseEmotion('guilt', traits),
                envy: this.calculateBaseEmotion('envy', traits),
                gratitude: this.calculateBaseEmotion('gratitude', traits)
            },
            
            // Trading-specific emotions
            trading_emotions: {
                euphoria: 0,
                panic: 0,
                fomo: 0,
                regret: 0,
                overconfidence: traits.overconfidence_bias || 30,
                analysis_paralysis: 0,
                revenge_urge: 0,
                loss_aversion_anxiety: traits.loss_aversion || 50
            },
            
            // Social emotions
            social_emotions: {
                trust: traits.trust_propensity || 50,
                empathy: traits.empathy || 50,
                social_anxiety: traits.social_anxiety || 30,
                belongingness: 50,
                rejection_sensitivity: traits.rejection_sensitivity || 30,
                social_dominance: 40
            },
            
            // Meta-emotional awareness
            meta_emotions: {
                emotional_clarity: traits.self_awareness || 50,
                emotional_intensity: 50,
                emotional_complexity: 30, // Multiple simultaneous emotions
                emotional_coherence: 70, // How well emotions align
                emotional_granularity: traits.emotional_perception || 50 // Ability to distinguish emotions
            },
            
            // Regulation state
            regulation: {
                active_strategies: [],
                regulation_effort: 0,
                regulation_effectiveness: 0,
                exhaustion_level: 0, // Ego depletion
                recovery_capacity: traits.stress_tolerance || 50
            },
            
            // Temporal dynamics
            dynamics: {
                emotion_duration: {},
                peak_intensity_reached: {},
                emotion_transitions: [],
                mood_baseline: 50,
                mood_drift: 0
            },
            
            // Context and triggers
            context: {
                last_trigger: null,
                trigger_sensitivity: traits.neuroticism || 40,
                social_influence_received: 0,
                environmental_stress: 0,
                fatigue_level: 0
            },
            
            timestamp: Date.now()
        };
    }

    calculateBaseEmotion(emotion, traits) {
        const emotionFormulas = {
            joy: (traits.optimism + traits.extraversion + (100 - traits.neuroticism)) / 3,
            sadness: (traits.pessimism + traits.neuroticism + (100 - traits.emotional_stability)) / 3,
            anger: ((100 - traits.patience) + traits.vindictiveness + (100 - traits.agreeableness)) / 3,
            fear: (traits.fear + traits.neuroticism + (100 - traits.confidence)) / 3,
            surprise: (100 - traits.pattern_recognition) * 0.8,
            disgust: (traits.neuroticism + (100 - traits.agreeableness)) / 2,
            contempt: (traits.narcissism + (100 - traits.empathy) + traits.psychopathy) / 3,
            pride: (traits.confidence + traits.narcissism + traits.self_awareness) / 3,
            shame: (traits.neuroticism + (100 - traits.self_awareness) + traits.rejection_sensitivity) / 3,
            guilt: (traits.agreeableness + traits.conscientiousness + (100 - traits.narcissism)) / 3,
            envy: (traits.neuroticism + (100 - traits.agreeableness) + traits.competitiveness) / 3,
            gratitude: (traits.agreeableness + traits.empathy + (100 - traits.narcissism)) / 3
        };

        const baseLevel = emotionFormulas[emotion] || 30;
        return Math.max(0, Math.min(100, baseLevel + (Math.random() * 20 - 10)));
    }

    initializeEmotionalSkills() {
        const traits = this.personality.traits;
        
        return {
            // Mayer-Salovey EI model
            perceiving_emotions: {
                facial_recognition: traits.empathy_accuracy || 50,
                vocal_recognition: traits.emotional_perception || 50,
                body_language_reading: traits.social_skills || 50,
                contextual_perception: traits.emotional_understanding || 50,
                self_emotion_awareness: traits.self_awareness || 50
            },
            
            using_emotions: {
                motivation_enhancement: traits.motivation_drive || 50,
                cognitive_facilitation: 50,
                creative_enhancement: traits.openness || 50,
                decision_guidance: 40,
                attention_direction: 50
            },
            
            understanding_emotions: {
                emotion_causation: traits.analytical_thinking || 50,
                emotion_progression: 40,
                emotion_combinations: 30,
                cultural_emotion_knowledge: traits.cultural_intelligence || 50,
                emotion_consequences: 45
            },
            
            managing_emotions: {
                self_regulation: traits.self_regulation || 50,
                emotion_repair: traits.emotional_management || 50,
                emotion_enhancement: 40,
                others_regulation: traits.social_skills || 40,
                relationship_management: traits.empathy || 50
            },
            
            // Skill development tracking
            skill_development: {
                total_practice_hours: 0,
                recent_successes: 0,
                recent_failures: 0,
                learning_rate: traits.learning_speed || 50,
                skill_decay_rate: 2 // Skills decay without practice
            }
        };
    }

    calculateResilienceFactors() {
        const traits = this.personality.traits;
        
        return {
            cognitive_flexibility: traits.adaptability || 50,
            optimism: traits.optimism || 50,
            self_efficacy: traits.confidence || 50,
            social_support_seeking: traits.cooperation || 50,
            meaning_making: traits.openness || 50,
            emotional_regulation_capacity: traits.emotional_stability || 50,
            stress_inoculation: 0, // Built through experience
            post_traumatic_growth_potential: traits.openness || 50
        };
    }

    // Advanced emotional processing
    processComplexEmotionalEvent(event) {
        const response = {
            event: event,
            timestamp: Date.now(),
            pre_state: this.cloneEmotionalState(),
            emotional_changes: {},
            regulation_applied: [],
            social_influence: null,
            trauma_impact: null,
            learning_opportunities: [],
            skill_development: {},
            resilience_factors_used: []
        };

        // Multi-stage emotional processing
        this.processEventThroughDimensions(event, response);
        this.processEventThroughBasicEmotions(event, response);
        this.processEventThroughTradingEmotions(event, response);
        this.processEventThroughSocialEmotions(event, response);
        
        // Apply emotional contagion if social event
        if (event.social_context) {
            response.social_influence = this.emotionalContagion.processContagion(
                event.social_context, 
                this.emotionalState
            );
        }
        
        // Check for trauma response
        if (this.isTraumaticEvent(event)) {
            response.trauma_impact = this.traumaSystem.processTrauma(event, this.emotionalState);
        }
        
        // Apply emotional regulation
        response.regulation_applied = this.emotionalRegulation.regulateResponse(
            this.emotionalState, 
            event, 
            response.emotional_changes
        );
        
        // Update emotional state
        this.updateEmotionalState(response);
        
        // Process learning opportunities
        response.learning_opportunities = this.identifyLearningOpportunities(event, response);
        
        // Update emotional skills
        response.skill_development = this.updateEmotionalSkills(event, response);
        
        // Record in memory systems
        this.emotionalMemory.recordComplexEvent(response);
        this.emotionalHistory.push(response);
        this.pruneEmotionalHistory();
        
        // Update resilience factors
        this.updateResilienceFactors(event, response);
        
        return {
            emotional_state: this.emotionalState,
            response: response,
            recommendations: this.generateAdvancedRecommendations(),
            skill_insights: this.getSkillDevelopmentInsights(),
            resilience_assessment: this.assessResilienceGrowth()
        };
    }

    processEventThroughDimensions(event, response) {
        const { valence_impact, arousal_impact, dominance_impact } = this.calculateDimensionalImpact(event);
        
        // Apply impacts with personality modulation
        const personalityModulation = this.calculatePersonalityModulation(event);
        
        response.emotional_changes.valence = valence_impact * personalityModulation.valence_sensitivity;
        response.emotional_changes.arousal = arousal_impact * personalityModulation.arousal_sensitivity;
        response.emotional_changes.dominance = dominance_impact * personalityModulation.dominance_sensitivity;
    }

    calculateDimensionalImpact(event) {
        const eventImpacts = {
            'success': { valence: 30, arousal: 20, dominance: 15 },
            'failure': { valence: -25, arousal: 15, dominance: -10 },
            'betrayal': { valence: -40, arousal: 30, dominance: -20 },
            'cooperation': { valence: 20, arousal: 10, dominance: 5 },
            'market_crash': { valence: -50, arousal: 40, dominance: -25 },
            'windfall': { valence: 45, arousal: 35, dominance: 20 },
            'social_rejection': { valence: -30, arousal: 25, dominance: -15 },
            'recognition': { valence: 35, arousal: 20, dominance: 15 }
        };

        const baseImpact = eventImpacts[event.type] || { valence: 0, arousal: 0, dominance: 0 };
        const intensityMultiplier = (event.intensity || 50) / 50;

        return {
            valence_impact: baseImpact.valence * intensityMultiplier,
            arousal_impact: baseImpact.arousal * intensityMultiplier,
            dominance_impact: baseImpact.dominance * intensityMultiplier
        };
    }

    calculatePersonalityModulation(event) {
        const traits = this.personality.traits;
        
        return {
            valence_sensitivity: 1 + (traits.neuroticism - 50) * 0.01,
            arousal_sensitivity: 1 + (traits.extraversion - 50) * 0.008,
            dominance_sensitivity: 1 + (traits.narcissism - 50) * 0.01
        };
    }

    processEventThroughBasicEmotions(event, response) {
        const emotionTriggers = this.getEmotionTriggers(event);
        
        Object.entries(emotionTriggers).forEach(([emotion, intensity]) => {
            if (!response.emotional_changes.emotions) response.emotional_changes.emotions = {};
            
            // Apply personality-based emotion modulation
            const personalityMod = this.getEmotionPersonalityModulation(emotion);
            const finalIntensity = intensity * personalityMod;
            
            response.emotional_changes.emotions[emotion] = finalIntensity;
        });
    }

    getEmotionTriggers(event) {
        const triggers = {
            'success': { joy: 30, pride: 25, gratitude: 15 },
            'failure': { sadness: 25, shame: 20, anger: 15 },
            'betrayal': { anger: 40, sadness: 30, contempt: 25, disgust: 20 },
            'loss': { sadness: 35, regret: 30, anger: 20 },
            'gain': { joy: 30, surprise: 15, pride: 20 },
            'threat': { fear: 40, anxiety: 30 },
            'injustice': { anger: 35, contempt: 25, disgust: 20 },
            'achievement': { joy: 35, pride: 30, gratitude: 15 }
        };

        return triggers[event.type] || {};
    }

    getEmotionPersonalityModulation(emotion) {
        const traits = this.personality.traits;
        const modulations = {
            'anger': 1 + ((100 - traits.patience) + traits.vindictiveness - 100) * 0.005,
            'fear': 1 + (traits.neuroticism + traits.fear - 100) * 0.005,
            'joy': 1 + (traits.optimism + traits.extraversion - 100) * 0.005,
            'sadness': 1 + (traits.neuroticism + traits.pessimism - 100) * 0.005,
            'pride': 1 + (traits.narcissism + traits.confidence - 100) * 0.005,
            'shame': 1 + (traits.neuroticism - traits.self_awareness) * 0.005,
            'guilt': 1 + (traits.conscientiousness + traits.agreeableness - 100) * 0.005
        };

        return Math.max(0.1, modulations[emotion] || 1);
    }

    processEventThroughTradingEmotions(event, response) {
        if (event.market_context) {
            if (!response.emotional_changes.trading_emotions) response.emotional_changes.trading_emotions = {};
            
            const tradingImpacts = this.calculateTradingEmotionImpacts(event);
            Object.assign(response.emotional_changes.trading_emotions, tradingImpacts);
        }
    }

    calculateTradingEmotionImpacts(event) {
        const impacts = {};
        const { volatility, profit_loss, market_direction } = event.market_context;
        
        if (profit_loss > 0) {
            impacts.euphoria = Math.min(40, profit_loss * 0.001);
            impacts.overconfidence = Math.min(30, profit_loss * 0.0008);
        } else if (profit_loss < 0) {
            impacts.panic = Math.min(50, Math.abs(profit_loss) * 0.001);
            impacts.regret = Math.min(40, Math.abs(profit_loss) * 0.0009);
            impacts.loss_aversion_anxiety = Math.min(35, Math.abs(profit_loss) * 0.0007);
        }
        
        if (volatility > 70) {
            impacts.anxiety = Math.min(30, (volatility - 70) * 0.8);
        }
        
        if (market_direction > 20 && this.emotionalState.trading_emotions.fomo < 50) {
            impacts.fomo = Math.min(35, market_direction * 0.6);
        }
        
        return impacts;
    }

    isTraumaticEvent(event) {
        const traumaticTypes = ['betrayal', 'major_loss', 'abuse', 'abandonment', 'life_threatening'];
        return traumaticTypes.includes(event.type) || 
               (event.intensity > 85 && event.outcome === 'negative') ||
               (event.emotional_impact && event.emotional_impact > 80);
    }

    updateEmotionalState(response) {
        // Update dimensional values
        this.emotionalState.valence = Math.max(-100, Math.min(100, 
            this.emotionalState.valence + (response.emotional_changes.valence || 0)));
        this.emotionalState.arousal = Math.max(0, Math.min(100, 
            this.emotionalState.arousal + (response.emotional_changes.arousal || 0)));
        this.emotionalState.dominance = Math.max(-100, Math.min(100, 
            this.emotionalState.dominance + (response.emotional_changes.dominance || 0)));

        // Update basic emotions
        if (response.emotional_changes.emotions) {
            Object.entries(response.emotional_changes.emotions).forEach(([emotion, change]) => {
                const current = this.emotionalState.emotions[emotion] || 0;
                this.emotionalState.emotions[emotion] = Math.max(0, Math.min(100, current + change));
            });
        }

        // Update trading emotions
        if (response.emotional_changes.trading_emotions) {
            Object.entries(response.emotional_changes.trading_emotions).forEach(([emotion, change]) => {
                const current = this.emotionalState.trading_emotions[emotion] || 0;
                this.emotionalState.trading_emotions[emotion] = Math.max(0, Math.min(100, current + change));
            });
        }

        // Update meta-emotional states
        this.updateMetaEmotionalStates();
        
        // Apply emotional decay over time
        this.applyEmotionalDecay();
        
        this.emotionalState.timestamp = Date.now();
    }

    updateMetaEmotionalStates() {
        // Calculate emotional complexity (number of active emotions)
        const activeEmotions = Object.values(this.emotionalState.emotions).filter(e => e > 30).length;
        this.emotionalState.meta_emotions.emotional_complexity = Math.min(100, activeEmotions * 10);

        // Calculate emotional intensity
        const allEmotions = [...Object.values(this.emotionalState.emotions), 
                           ...Object.values(this.emotionalState.trading_emotions)];
        const avgIntensity = allEmotions.reduce((sum, e) => sum + e, 0) / allEmotions.length;
        this.emotionalState.meta_emotions.emotional_intensity = avgIntensity;

        // Calculate emotional coherence (how well emotions align)
        this.emotionalState.meta_emotions.emotional_coherence = this.calculateEmotionalCoherence();
    }

    calculateEmotionalCoherence() {
        const conflicts = [];
        
        // Check for emotional conflicts
        const emotions = this.emotionalState.emotions;
        if (emotions.joy > 50 && emotions.sadness > 50) conflicts.push(Math.min(emotions.joy, emotions.sadness));
        if (emotions.fear > 50 && emotions.anger > 50) conflicts.push(Math.min(emotions.fear, emotions.anger));
        if (emotions.pride > 50 && emotions.shame > 50) conflicts.push(Math.min(emotions.pride, emotions.shame));
        
        const totalConflict = conflicts.reduce((sum, c) => sum + c, 0);
        return Math.max(0, 100 - totalConflict * 0.5);
    }

    identifyLearningOpportunities(event, response) {
        const opportunities = [];
        
        // Emotional regulation learning
        if (response.regulation_applied.length > 0) {
            opportunities.push({
                type: 'emotional_regulation',
                skill_area: 'managing_emotions',
                description: 'Practice emotional regulation techniques',
                potential_improvement: 5
            });
        }
        
        // Emotional perception learning
        if (event.social_context) {
            opportunities.push({
                type: 'social_emotion_reading',
                skill_area: 'perceiving_emotions',
                description: 'Improve social emotional perception',
                potential_improvement: 3
            });
        }
        
        // Emotional understanding learning
        if (this.emotionalState.meta_emotions.emotional_complexity > 70) {
            opportunities.push({
                type: 'emotion_complexity_handling',
                skill_area: 'understanding_emotions',
                description: 'Better understand complex emotional states',
                potential_improvement: 4
            });
        }
        
        return opportunities;
    }

    updateEmotionalSkills(event, response) {
        const skillUpdates = {};
        
        response.learning_opportunities.forEach(opportunity => {
            const skillArea = opportunity.skill_area;
            const subSkills = this.emotionalSkills[skillArea];
            
            if (subSkills) {
                Object.keys(subSkills).forEach(skill => {
                    if (typeof subSkills[skill] === 'number') {
                        const improvement = opportunity.potential_improvement * 
                                          (this.emotionalSkills.skill_development.learning_rate / 100);
                        subSkills[skill] = Math.min(100, subSkills[skill] + improvement);
                        
                        if (!skillUpdates[skillArea]) skillUpdates[skillArea] = {};
                        skillUpdates[skillArea][skill] = improvement;
                    }
                });
            }
        });
        
        // Update practice tracking
        this.emotionalSkills.skill_development.total_practice_hours += 0.1;
        
        return skillUpdates;
    }

    updateResilienceFactors(event, response) {
        if (event.outcome === 'negative' && event.intensity > 60) {
            // Stress inoculation from surviving difficult events
            this.resilienceFactors.stress_inoculation = Math.min(100, 
                this.resilienceFactors.stress_inoculation + 2);
        }
        
        if (response.regulation_applied.length > 0) {
            // Emotional regulation capacity improves with use
            this.resilienceFactors.emotional_regulation_capacity = Math.min(100,
                this.resilienceFactors.emotional_regulation_capacity + 1);
        }
        
        // Post-traumatic growth potential
        if (this.isTraumaticEvent(event) && this.emotionalState.meta_emotions.emotional_coherence > 60) {
            this.resilienceFactors.post_traumatic_growth_potential = Math.min(100,
                this.resilienceFactors.post_traumatic_growth_potential + 3);
        }
    }

    generateAdvancedRecommendations() {
        const recommendations = [];
        
        // Emotional state recommendations
        const emotionalIntensity = this.emotionalState.meta_emotions.emotional_intensity;
        if (emotionalIntensity > 80) {
            recommendations.push({
                type: 'emotional_regulation',
                urgency: 'high',
                message: 'Consider emotional regulation techniques to manage intensity',
                suggested_techniques: this.getSuggestedRegulationTechniques()
            });
        }
        
        // Skill development recommendations
        const skillAreas = this.identifyWeakSkillAreas();
        skillAreas.forEach(area => {
            recommendations.push({
                type: 'skill_development',
                urgency: 'medium',
                message: `Focus on developing ${area} emotional intelligence skills`,
                practice_suggestions: this.getSkillPracticeSuggestions(area)
            });
        });
        
        // Resilience recommendations
        if (this.getOverallResilienceScore() < 60) {
            recommendations.push({
                type: 'resilience_building',
                urgency: 'medium',
                message: 'Focus on building emotional resilience',
                resilience_activities: this.getResilienceBuildingActivities()
            });
        }
        
        return recommendations;
    }

    getSuggestedRegulationTechniques() {
        const currentEmotion = this.getDominantEmotion();
        const techniques = {
            'anger': ['deep_breathing', 'cognitive_reframing', 'progressive_relaxation'],
            'fear': ['grounding_techniques', 'rational_analysis', 'gradual_exposure'],
            'sadness': ['social_support', 'meaning_making', 'behavioral_activation'],
            'anxiety': ['mindfulness', 'body_scan', 'thought_stopping']
        };
        
        return techniques[currentEmotion] || ['mindfulness', 'deep_breathing'];
    }

    getDominantEmotion() {
        const emotions = this.emotionalState.emotions;
        return Object.entries(emotions).reduce((max, [emotion, value]) => 
            value > emotions[max] ? emotion : max, 'neutral');
    }

    identifyWeakSkillAreas() {
        const weakAreas = [];
        const threshold = 40;
        
        Object.entries(this.emotionalSkills).forEach(([area, skills]) => {
            if (typeof skills === 'object' && !Array.isArray(skills)) {
                const avgSkill = Object.values(skills).filter(v => typeof v === 'number')
                    .reduce((sum, v, _, arr) => sum + v / arr.length, 0);
                if (avgSkill < threshold) {
                    weakAreas.push(area);
                }
            }
        });
        
        return weakAreas;
    }

    getSkillPracticeSuggestions(skillArea) {
        const suggestions = {
            'perceiving_emotions': [
                'Practice reading facial expressions',
                'Listen to vocal tone variations',
                'Observe body language in social situations'
            ],
            'understanding_emotions': [
                'Study emotion triggers and patterns',
                'Practice emotion labeling',
                'Analyze emotion combinations'
            ],
            'managing_emotions': [
                'Practice regulation techniques',
                'Develop emotion repair strategies',
                'Work on relationship management'
            ],
            'using_emotions': [
                'Use emotions to enhance creativity',
                'Channel emotions for motivation',
                'Practice emotion-guided decision making'
            ]
        };
        
        return suggestions[skillArea] || ['General emotional intelligence practice'];
    }

    getOverallResilienceScore() {
        return Object.values(this.resilienceFactors).reduce((sum, val) => sum + val, 0) / 
               Object.keys(this.resilienceFactors).length;
    }

    getResilienceBuildingActivities() {
        return [
            'Practice cognitive flexibility exercises',
            'Build social support networks',
            'Develop meaning-making practices',
            'Engage in stress inoculation training',
            'Practice optimistic thinking patterns'
        ];
    }

    // Comprehensive emotional intelligence assessment
    getEmotionalIntelligenceAssessment() {
        return {
            overall_ei_score: this.calculateOverallEIScore(),
            skill_breakdown: this.getSkillBreakdown(),
            emotional_state: {
                current_dimensions: {
                    valence: this.emotionalState.valence,
                    arousal: this.emotionalState.arousal,
                    dominance: this.emotionalState.dominance
                },
                dominant_emotions: this.getTopEmotions(3),
                emotional_complexity: this.emotionalState.meta_emotions.emotional_complexity,
                emotional_coherence: this.emotionalState.meta_emotions.emotional_coherence
            },
            resilience_profile: this.resilienceFactors,
            development_recommendations: this.generateAdvancedRecommendations(),
            skill_development_trajectory: this.getSkillDevelopmentTrajectory(),
            emotional_regulation_effectiveness: this.assessRegulationEffectiveness()
        };
    }

    calculateOverallEIScore() {
        let totalScore = 0;
        let skillCount = 0;
        
        Object.values(this.emotionalSkills).forEach(skillGroup => {
            if (typeof skillGroup === 'object' && !Array.isArray(skillGroup)) {
                Object.values(skillGroup).forEach(skill => {
                    if (typeof skill === 'number') {
                        totalScore += skill;
                        skillCount++;
                    }
                });
            }
        });
        
        return skillCount > 0 ? totalScore / skillCount : 50;
    }

    getSkillBreakdown() {
        const breakdown = {};
        
        Object.entries(this.emotionalSkills).forEach(([area, skills]) => {
            if (typeof skills === 'object' && !Array.isArray(skills)) {
                const numericSkills = Object.entries(skills).filter(([k, v]) => typeof v === 'number');
                if (numericSkills.length > 0) {
                    breakdown[area] = {
                        average: numericSkills.reduce((sum, [k, v]) => sum + v, 0) / numericSkills.length,
                        skills: Object.fromEntries(numericSkills)
                    };
                }
            }
        });
        
        return breakdown;
    }

    getTopEmotions(count) {
        const allEmotions = { ...this.emotionalState.emotions, ...this.emotionalState.trading_emotions };
        return Object.entries(allEmotions)
            .sort(([,a], [,b]) => b - a)
            .slice(0, count)
            .map(([emotion, intensity]) => ({ emotion, intensity }));
    }

    getSkillDevelopmentTrajectory() {
        // Simplified trajectory based on practice and improvement
        const development = this.emotionalSkills.skill_development;
        return {
            practice_hours: development.total_practice_hours,
            learning_rate: development.learning_rate,
            recent_progress: development.recent_successes - development.recent_failures,
            projected_improvement: this.calculateProjectedImprovement()
        };
    }

    calculateProjectedImprovement() {
        const development = this.emotionalSkills.skill_development;
        const currentLevel = this.calculateOverallEIScore();
        const learningEfficiency = development.learning_rate / 100;
        const practiceEffect = Math.log(development.total_practice_hours + 1) * 2;
        
        return Math.min(20, practiceEffect * learningEfficiency);
    }

    assessRegulationEffectiveness() {
        return {
            regulation_capacity: this.emotionalRegulation.getRegulationCapacity(),
            recent_regulation_success: this.emotionalRegulation.getRecentSuccessRate(),
            exhaustion_level: this.emotionalState.regulation.exhaustion_level,
            recovery_capacity: this.emotionalState.regulation.recovery_capacity
        };
    }

    applyEmotionalDecay() {
        // Emotions naturally decay over time
        const decayRates = {
            anger: 0.95, fear: 0.92, joy: 0.88, sadness: 0.90,
            euphoria: 0.85, panic: 0.90, fomo: 0.88
        };
        
        Object.entries(decayRates).forEach(([emotion, rate]) => {
            if (this.emotionalState.emotions[emotion]) {
                this.emotionalState.emotions[emotion] *= rate;
            }
            if (this.emotionalState.trading_emotions[emotion]) {
                this.emotionalState.trading_emotions[emotion] *= rate;
            }
        });
    }

    cloneEmotionalState() {
        return JSON.parse(JSON.stringify(this.emotionalState));
    }

    pruneEmotionalHistory() {
        if (this.emotionalHistory.length > 200) {
            this.emotionalHistory = this.emotionalHistory.slice(-200);
        }
    }

    getSkillDevelopmentInsights() {
        return {
            strongest_skills: this.getStrongestSkills(),
            improvement_areas: this.identifyWeakSkillAreas(),
            learning_efficiency: this.calculateLearningEfficiency(),
            skill_transfer_opportunities: this.identifySkillTransferOpportunities()
        };
    }

    getStrongestSkills() {
        const allSkills = [];
        Object.entries(this.emotionalSkills).forEach(([area, skills]) => {
            if (typeof skills === 'object' && !Array.isArray(skills)) {
                Object.entries(skills).forEach(([skill, value]) => {
                    if (typeof value === 'number') {
                        allSkills.push({ area, skill, value });
                    }
                });
            }
        });
        
        return allSkills.sort((a, b) => b.value - a.value).slice(0, 5);
    }

    calculateLearningEfficiency() {
        const development = this.emotionalSkills.skill_development;
        const successRate = development.recent_successes / 
                           (development.recent_successes + development.recent_failures + 1);
        return successRate * (development.learning_rate / 100);
    }

    identifySkillTransferOpportunities() {
        // Skills that can reinforce each other
        const strongSkills = this.getStrongestSkills();
        const weakAreas = this.identifyWeakSkillAreas();
        
        const transfers = [];
        strongSkills.forEach(strong => {
            weakAreas.forEach(weak => {
                if (this.skillsCanReinforce(strong.area, weak)) {
                    transfers.push({
                        from: strong.area,
                        to: weak,
                        potential: this.calculateTransferPotential(strong.value, weak)
                    });
                }
            });
        });
        
        return transfers;
    }

    skillsCanReinforce(strongArea, weakArea) {
        const reinforcements = {
            'perceiving_emotions': ['understanding_emotions', 'managing_emotions'],
            'understanding_emotions': ['using_emotions', 'managing_emotions'],
            'managing_emotions': ['using_emotions'],
            'using_emotions': ['managing_emotions']
        };
        
        return reinforcements[strongArea]?.includes(weakArea) || false;
    }

    calculateTransferPotential(strongValue, weakArea) {
        return Math.min(20, (strongValue - 50) * 0.2);
    }

    assessResilienceGrowth() {
        return {
            current_resilience: this.getOverallResilienceScore(),
            resilience_factors: this.resilienceFactors,
            growth_trajectory: this.calculateResilienceGrowth(),
            stress_inoculation_level: this.resilienceFactors.stress_inoculation,
            post_traumatic_growth: this.resilienceFactors.post_traumatic_growth_potential
        };
    }

    calculateResilienceGrowth() {
        // Based on experience processing and skill development
        const experienceCount = this.emotionalHistory.length;
        const avgRegulationSuccess = this.emotionalRegulation.getRecentSuccessRate();
        const skillDevelopment = this.calculateOverallEIScore();
        
        return {
            experience_based: Math.min(20, experienceCount * 0.1),
            regulation_based: avgRegulationSuccess * 0.15,
            skill_based: (skillDevelopment - 50) * 0.1,
            total_growth_potential: Math.min(50, experienceCount * 0.05 + skillDevelopment * 0.1)
        };
    }
}

// Supporting classes for the emotional intelligence system

class EmotionalMemorySystem {
    constructor() {
        this.memories = [];
        this.consolidatedPatterns = new Map();
        this.emotionalAssociations = new Map();
    }

    recordComplexEvent(eventResponse) {
        this.memories.push({
            timestamp: eventResponse.timestamp,
            event_type: eventResponse.event.type,
            emotional_pattern: this.extractEmotionalPattern(eventResponse),
            regulation_success: eventResponse.regulation_applied.length > 0,
            learning_gained: eventResponse.learning_opportunities.length,
            trauma_level: eventResponse.trauma_impact ? eventResponse.trauma_impact.severity : 0
        });

        this.consolidateMemories();
        this.updateEmotionalAssociations(eventResponse);
    }

    extractEmotionalPattern(eventResponse) {
        return {
            dominant_emotion: this.findDominantEmotion(eventResponse.emotional_changes),
            intensity_level: this.calculateIntensityLevel(eventResponse.emotional_changes),
            complexity: this.calculateComplexity(eventResponse.emotional_changes),
            regulation_needed: eventResponse.regulation_applied.length > 0
        };
    }

    findDominantEmotion(changes) {
        let maxEmotion = 'neutral';
        let maxChange = 0;

        Object.entries(changes.emotions || {}).forEach(([emotion, change]) => {
            if (Math.abs(change) > maxChange) {
                maxChange = Math.abs(change);
                maxEmotion = emotion;
            }
        });

        return maxEmotion;
    }

    calculateIntensityLevel(changes) {
        const allChanges = [
            ...Object.values(changes.emotions || {}),
            ...Object.values(changes.trading_emotions || {}),
            Math.abs(changes.valence || 0),
            Math.abs(changes.arousal || 0)
        ];

        return allChanges.reduce((sum, change) => sum + Math.abs(change), 0) / allChanges.length;
    }

    calculateComplexity(changes) {
        const emotionCount = Object.keys(changes.emotions || {}).length;
        const tradingEmotionCount = Object.keys(changes.trading_emotions || {}).length;
        return emotionCount + tradingEmotionCount;
    }

    consolidateMemories() {
        if (this.memories.length < 10) return;

        // Find patterns in recent memories
        const recentMemories = this.memories.slice(-20);
        const patterns = this.findEmotionalPatterns(recentMemories);

        patterns.forEach(pattern => {
            const key = `${pattern.trigger}_${pattern.response}`;
            if (!this.consolidatedPatterns.has(key)) {
                this.consolidatedPatterns.set(key, { frequency: 0, outcomes: [] });
            }
            
            const existing = this.consolidatedPatterns.get(key);
            existing.frequency++;
            existing.outcomes.push(pattern.successful);
        });
    }

    findEmotionalPatterns(memories) {
        // Simplified pattern detection
        return memories.map(memory => ({
            trigger: memory.event_type,
            response: memory.emotional_pattern.dominant_emotion,
            successful: memory.regulation_success && memory.learning_gained > 0
        }));
    }

    updateEmotionalAssociations(eventResponse) {
        const eventType = eventResponse.event.type;
        const emotions = eventResponse.emotional_changes.emotions || {};

        Object.entries(emotions).forEach(([emotion, intensity]) => {
            const key = `${eventType}_${emotion}`;
            if (!this.emotionalAssociations.has(key)) {
                this.emotionalAssociations.set(key, { strength: 0, frequency: 0 });
            }

            const association = this.emotionalAssociations.get(key);
            association.strength = (association.strength * association.frequency + intensity) / (association.frequency + 1);
            association.frequency++;
        });
    }

    getEmotionalInsights() {
        return {
            total_memories: this.memories.length,
            consolidated_patterns: this.consolidatedPatterns.size,
            emotional_associations: this.emotionalAssociations.size,
            most_common_triggers: this.getMostCommonTriggers(),
            strongest_associations: this.getStrongestAssociations()
        };
    }

    getMostCommonTriggers() {
        const triggerCounts = {};
        this.memories.forEach(memory => {
            triggerCounts[memory.event_type] = (triggerCounts[memory.event_type] || 0) + 1;
        });

        return Object.entries(triggerCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([trigger, count]) => ({ trigger, count }));
    }

    getStrongestAssociations() {
        return Array.from(this.emotionalAssociations.entries())
            .sort(([,a], [,b]) => b.strength - a.strength)
            .slice(0, 5)
            .map(([key, data]) => ({ association: key, ...data }));
    }
}

class AdaptiveEmotionalRegulation {
    constructor(personalityDNA) {
        this.personality = personalityDNA;
        this.regulationStrategies = this.initializeStrategies();
        this.strategyEffectiveness = new Map();
        this.regulationHistory = [];
        this.exhaustionLevel = 0;
    }

    initializeStrategies() {
        return {
            cognitive_reframing: {
                effectiveness: this.personality.traits.analytical_thinking || 50,
                energy_cost: 30,
                suitable_emotions: ['anger', 'fear', 'sadness', 'regret']
            },
            deep_breathing: {
                effectiveness: 60,
                energy_cost: 10,
                suitable_emotions: ['anxiety', 'panic', 'anger', 'fear']
            },
            progressive_relaxation: {
                effectiveness: 70,
                energy_cost: 40,
                suitable_emotions: ['anxiety', 'tension', 'anger']
            },
            mindfulness: {
                effectiveness: this.personality.traits.self_awareness || 50,
                energy_cost: 20,
                suitable_emotions: ['all']
            },
            social_support_seeking: {
                effectiveness: this.personality.traits.social_skills || 50,
                energy_cost: 25,
                suitable_emotions: ['sadness', 'fear', 'anxiety', 'shame']
            },
            emotional_expression: {
                effectiveness: this.personality.traits.emotional_regulation || 50,
                energy_cost: 15,
                suitable_emotions: ['anger', 'sadness', 'frustration']
            },
            problem_solving: {
                effectiveness: this.personality.traits.analytical_thinking || 50,
                energy_cost: 35,
                suitable_emotions: ['anxiety', 'worry', 'frustration']
            },
            distraction: {
                effectiveness: 40,
                energy_cost: 20,
                suitable_emotions: ['rumination', 'obsessive_thoughts']
            }
        };
    }

    regulateResponse(emotionalState, event, emotionalChanges) {
        const appliedStrategies = [];
        const dominantEmotion = this.findDominantEmotion(emotionalChanges);
        const emotionIntensity = this.getEmotionIntensity(emotionalChanges, dominantEmotion);

        // Only regulate if emotion is intense enough and we have energy
        if (emotionIntensity > 60 && this.exhaustionLevel < 80) {
            const suitableStrategies = this.getSuitableStrategies(dominantEmotion);
            const selectedStrategy = this.selectBestStrategy(suitableStrategies, dominantEmotion);

            if (selectedStrategy) {
                const regulationResult = this.applyRegulationStrategy(
                    selectedStrategy, 
                    emotionalState, 
                    emotionIntensity
                );
                
                appliedStrategies.push(regulationResult);
                this.updateStrategyEffectiveness(selectedStrategy, regulationResult.effectiveness);
                this.exhaustionLevel += regulationResult.energy_cost;
            }
        }

        // Natural recovery of regulation capacity
        this.exhaustionLevel = Math.max(0, this.exhaustionLevel - 2);

        return appliedStrategies;
    }

    findDominantEmotion(changes) {
        let maxEmotion = 'neutral';
        let maxIntensity = 0;

        const allChanges = { ...(changes.emotions || {}), ...(changes.trading_emotions || {}) };
        Object.entries(allChanges).forEach(([emotion, intensity]) => {
            if (Math.abs(intensity) > maxIntensity) {
                maxIntensity = Math.abs(intensity);
                maxEmotion = emotion;
            }
        });

        return maxEmotion;
    }

    getEmotionIntensity(changes, emotion) {
        return Math.abs(changes.emotions?.[emotion] || changes.trading_emotions?.[emotion] || 0);
    }

    getSuitableStrategies(emotion) {
        return Object.entries(this.regulationStrategies).filter(([strategy, config]) => {
            return config.suitable_emotions.includes(emotion) || config.suitable_emotions.includes('all');
        });
    }

    selectBestStrategy(suitableStrategies, emotion) {
        if (suitableStrategies.length === 0) return null;

        // Select based on effectiveness and energy availability
        const availableEnergy = 100 - this.exhaustionLevel;
        
        const scored = suitableStrategies.map(([strategy, config]) => {
            const learnedEffectiveness = this.strategyEffectiveness.get(strategy) || config.effectiveness;
            const energyFit = config.energy_cost <= availableEnergy ? 1 : 0.5;
            const score = learnedEffectiveness * energyFit;
            
            return { strategy, config, score };
        });

        scored.sort((a, b) => b.score - a.score);
        return scored[0]?.strategy;
    }

    applyRegulationStrategy(strategy, emotionalState, emotionIntensity) {
        const config = this.regulationStrategies[strategy];
        const learnedEffectiveness = this.strategyEffectiveness.get(strategy) || config.effectiveness;
        
        // Calculate actual effectiveness based on context
        let actualEffectiveness = learnedEffectiveness;
        
        // Personality modifiers
        if (strategy === 'cognitive_reframing') {
            actualEffectiveness += this.personality.traits.analytical_thinking * 0.2;
        } else if (strategy === 'social_support_seeking') {
            actualEffectiveness += this.personality.traits.extraversion * 0.15;
        }
        
        // Exhaustion penalty
        actualEffectiveness *= (1 - this.exhaustionLevel * 0.005);
        
        const regulationAmount = (actualEffectiveness / 100) * emotionIntensity * 0.6;

        return {
            strategy: strategy,
            effectiveness: actualEffectiveness,
            regulation_amount: regulationAmount,
            energy_cost: config.energy_cost,
            timestamp: Date.now()
        };
    }

    updateStrategyEffectiveness(strategy, observedEffectiveness) {
        const current = this.strategyEffectiveness.get(strategy) || this.regulationStrategies[strategy].effectiveness;
        
        // Learning: weighted average with recency bias
        const newEffectiveness = current * 0.8 + observedEffectiveness * 0.2;
        this.strategyEffectiveness.set(strategy, newEffectiveness);
        
        this.regulationHistory.push({
            strategy,
            effectiveness: observedEffectiveness,
            timestamp: Date.now()
        });

        // Keep recent history
        if (this.regulationHistory.length > 100) {
            this.regulationHistory.shift();
        }
    }

    getRegulationCapacity() {
        return Math.max(0, 100 - this.exhaustionLevel);
    }

    getRecentSuccessRate() {
        const recentHistory = this.regulationHistory.slice(-20);
        if (recentHistory.length === 0) return 50;

        const avgEffectiveness = recentHistory.reduce((sum, record) => sum + record.effectiveness, 0) / recentHistory.length;
        return avgEffectiveness;
    }

    getStrategyPreferences() {
        const preferences = Array.from(this.strategyEffectiveness.entries())
            .sort(([,a], [,b]) => b - a);
        
        return {
            most_effective: preferences.slice(0, 3),
            least_effective: preferences.slice(-3),
            total_strategies_learned: preferences.length
        };
    }
}

class EmotionalContagionEngine {
    constructor(personalityDNA) {
        this.personality = personalityDNA;
        this.susceptibility = this.calculateSusceptibility();
        this.influenceStrength = this.calculateInfluenceStrength();
    }

    calculateSusceptibility() {
        const traits = this.personality.traits;
        return {
            general: (traits.empathy + traits.social_skills + (100 - traits.emotional_stability)) / 3,
            positive_emotions: (traits.optimism + traits.extraversion) / 2,
            negative_emotions: (traits.neuroticism + traits.empathy) / 2,
            group_emotions: (traits.agreeableness + (100 - traits.independent_thinking)) / 2
        };
    }

    calculateInfluenceStrength() {
        const traits = this.personality.traits;
        return {
            charisma: (traits.extraversion + traits.confidence + traits.social_skills) / 3,
            emotional_expressiveness: (traits.extraversion + (100 - traits.emotional_stability)) / 2,
            authority: (traits.confidence + traits.narcissism) / 2
        };
    }

    processContagion(socialContext, currentEmotionalState) {
        const { others_emotions, group_dynamics, relationship_context } = socialContext;
        const contagionEffects = {};

        others_emotions.forEach(otherEmotion => {
            const contagionStrength = this.calculateContagionStrength(
                otherEmotion, 
                currentEmotionalState, 
                relationship_context
            );

            Object.entries(otherEmotion.emotions).forEach(([emotion, intensity]) => {
                if (!contagionEffects[emotion]) contagionEffects[emotion] = 0;
                contagionEffects[emotion] += intensity * contagionStrength * 0.1;
            });
        });

        return {
            contagion_effects: contagionEffects,
            susceptibility_factors: this.susceptibility,
            group_influence: this.processGroupInfluence(group_dynamics),
            social_pressure: this.calculateSocialPressure(socialContext)
        };
    }

    calculateContagionStrength(otherEmotion, currentState, relationshipContext) {
        let baseStrength = this.susceptibility.general / 100;

        // Relationship modifier
        if (relationshipContext.trust_level > 70) {
            baseStrength *= 1.5;
        } else if (relationshipContext.trust_level < 30) {
            baseStrength *= 0.5;
        }

        // Emotional similarity increases contagion
        const emotionalSimilarity = this.calculateEmotionalSimilarity(otherEmotion, currentState);
        baseStrength *= (1 + emotionalSimilarity * 0.3);

        // Authority modifier
        if (otherEmotion.authority_level > 70) {
            baseStrength *= 1.3;
        }

        return Math.min(1, baseStrength);
    }

    calculateEmotionalSimilarity(otherEmotion, currentState) {
        let similarity = 0;
        let emotionCount = 0;

        Object.entries(otherEmotion.emotions).forEach(([emotion, intensity]) => {
            if (currentState.emotions[emotion]) {
                const diff = Math.abs(intensity - currentState.emotions[emotion]);
                similarity += (100 - diff) / 100;
                emotionCount++;
            }
        });

        return emotionCount > 0 ? similarity / emotionCount : 0;
    }

    processGroupInfluence(groupDynamics) {
        const { group_emotion, group_cohesion, social_pressure } = groupDynamics;
        
        const groupInfluenceStrength = (this.susceptibility.group_emotions / 100) * 
                                      (group_cohesion / 100) * 
                                      (social_pressure / 100);

        return {
            influence_strength: groupInfluenceStrength,
            group_emotion_adoption: group_emotion ? Object.fromEntries(
                Object.entries(group_emotion).map(([emotion, intensity]) => 
                    [emotion, intensity * groupInfluenceStrength * 0.05]
                )
            ) : {}
        };
    }

    calculateSocialPressure(socialContext) {
        const { group_size, unanimity, authority_present } = socialContext;
        
        let pressure = 0;
        
        // Group size effect (Asch conformity studies)
        if (group_size >= 3) pressure += 30;
        else pressure += group_size * 8;
        
        // Unanimity effect
        if (unanimity > 80) pressure += 25;
        
        // Authority presence
        if (authority_present) pressure += 20;
        
        return Math.min(100, pressure);
    }
}

class TraumaResponseSystem {
    constructor(personalityDNA) {
        this.personality = personalityDNA;
        this.traumaHistory = [];
        this.triggerSensitivity = this.calculateTriggerSensitivity();
        this.copingMechanisms = this.initializeCopingMechanisms();
        this.recoveryCapacity = this.calculateRecoveryCapacity();
    }

    calculateTriggerSensitivity() {
        const traits = this.personality.traits;
        return {
            general: (traits.neuroticism + (100 - traits.emotional_stability)) / 2,
            interpersonal: (traits.empathy + traits.rejection_sensitivity) / 2,
            achievement: (traits.perfectionism + traits.shame) / 2,
            control: (traits.need_for_control + traits.anxiety) / 2
        };
    }

    initializeCopingMechanisms() {
        const traits = this.personality.traits;
        return {
            healthy_coping: {
                social_support: traits.social_skills || 40,
                emotional_processing: traits.self_awareness || 40,
                meaning_making: traits.openness || 40,
                problem_solving: traits.analytical_thinking || 40,
                self_care: traits.conscientiousness || 40
            },
            maladaptive_coping: {
                avoidance: 20,
                denial: 15,
                substance_use: 10,
                self_harm: 5,
                dissociation: 10
            }
        };
    }

    calculateRecoveryCapacity() {
        const traits = this.personality.traits;
        return {
            resilience: (traits.emotional_stability + traits.optimism + traits.stress_tolerance) / 3,
            social_support: traits.social_skills || 40,
            self_efficacy: traits.confidence || 40,
            flexibility: traits.adaptability || 40,
            growth_mindset: traits.openness || 40
        };
    }

    processTrauma(event, emotionalState) {
        const traumaImpact = this.assessTraumaImpact(event, emotionalState);
        const copingResponse = this.selectCopingResponse(traumaImpact);
        const recoveryPlan = this.generateRecoveryPlan(traumaImpact);

        this.traumaHistory.push({
            event: event,
            impact: traumaImpact,
            coping_used: copingResponse,
            timestamp: Date.now()
        });

        // Update trigger sensitivity based on trauma
        this.updateTriggerSensitivity(traumaImpact);

        return {
            severity: traumaImpact.severity,
            impact_areas: traumaImpact.impact_areas,
            coping_response: copingResponse,
            recovery_plan: recoveryPlan,
            trigger_development: this.identifyNewTriggers(event)
        };
    }

    assessTraumaImpact(event, emotionalState) {
        let severity = event.intensity || 50;
        
        // Increase severity based on personal vulnerabilities
        if (event.type === 'betrayal' && this.triggerSensitivity.interpersonal > 70) {
            severity *= 1.4;
        }
        
        if (event.type === 'failure' && this.triggerSensitivity.achievement > 70) {
            severity *= 1.3;
        }

        // Current emotional state modifier
        if (emotionalState.meta_emotions.emotional_stability < 40) {
            severity *= 1.2;
        }

        return {
            severity: Math.min(100, severity),
            impact_areas: this.identifyImpactAreas(event),
            protective_factors: this.identifyProtectiveFactors(),
            risk_factors: this.identifyRiskFactors()
        };
    }

    identifyImpactAreas(event) {
        const impacts = [];
        
        switch(event.type) {
            case 'betrayal':
                impacts.push('trust', 'relationships', 'self_worth');
                break;
            case 'failure':
                impacts.push('confidence', 'self_efficacy', 'identity');
                break;
            case 'loss':
                impacts.push('attachment', 'security', 'meaning');
                break;
            case 'abuse':
                impacts.push('safety', 'trust', 'self_worth', 'emotional_regulation');
                break;
        }
        
        return impacts;
    }

    selectCopingResponse(traumaImpact) {
        const selectedCoping = {};
        
        // Choose healthy coping based on strengths
        Object.entries(this.copingMechanisms.healthy_coping).forEach(([mechanism, strength]) => {
            if (strength > 60 && Math.random() > 0.3) {
                selectedCoping[mechanism] = Math.min(strength, traumaImpact.severity * 0.8);
            }
        });

        // Add maladaptive coping if healthy coping is insufficient
        const totalHealthyCoping = Object.values(selectedCoping).reduce((sum, val) => sum + val, 0);
        if (totalHealthyCoping < traumaImpact.severity * 0.6) {
            Object.entries(this.copingMechanisms.maladaptive_coping).forEach(([mechanism, tendency]) => {
                if (tendency > 30 && Math.random() > 0.7) {
                    selectedCoping[mechanism] = tendency * 0.5;
                }
            });
        }

        return selectedCoping;
    }

    generateRecoveryPlan(traumaImpact) {
        const plan = {
            immediate_needs: [],
            short_term_goals: [],
            long_term_goals: [],
            support_needed: [],
            estimated_timeline: this.estimateRecoveryTimeline(traumaImpact.severity)
        };

        // Immediate needs
        if (traumaImpact.severity > 80) {
            plan.immediate_needs.push('safety_establishment', 'emotional_stabilization');
        }
        if (traumaImpact.severity > 60) {
            plan.immediate_needs.push('stress_management', 'basic_functioning');
        }

        // Short-term goals
        plan.short_term_goals.push('emotional_processing', 'trigger_identification', 'coping_skill_development');

        // Long-term goals
        plan.long_term_goals.push('meaning_reconstruction', 'relationship_repair', 'post_traumatic_growth');

        // Support needed
        if (this.recoveryCapacity.social_support < 50) {
            plan.support_needed.push('social_support_building');
        }
        if (this.recoveryCapacity.resilience < 40) {
            plan.support_needed.push('resilience_training');
        }

        return plan;
    }

    estimateRecoveryTimeline(severity) {
        const baseRecovery = this.recoveryCapacity.resilience;
        const recoveryFactor = baseRecovery / 100;
        
        // Timeline in weeks
        const timeline = {
            acute_phase: Math.ceil(severity * 0.1 / recoveryFactor),
            adaptation_phase: Math.ceil(severity * 0.3 / recoveryFactor),
            integration_phase: Math.ceil(severity * 0.5 / recoveryFactor)
        };

        return timeline;
    }

    identifyNewTriggers(event) {
        const triggers = [];
        
        // Context-based triggers
        if (event.context) {
            triggers.push({
                type: 'contextual',
                trigger: event.context,
                sensitivity: event.intensity * 0.8
            });
        }

        // Sensory triggers
        if (event.sensory_details) {
            triggers.push({
                type: 'sensory',
                trigger: event.sensory_details,
                sensitivity: event.intensity * 0.6
            });
        }

        // Emotional triggers
        triggers.push({
            type: 'emotional',
            trigger: event.type,
            sensitivity: event.intensity * 0.7
        });

        return triggers;
    }

    updateTriggerSensitivity(traumaImpact) {
        traumaImpact.impact_areas.forEach(area => {
            if (this.triggerSensitivity[area]) {
                this.triggerSensitivity[area] = Math.min(100, 
                    this.triggerSensitivity[area] + traumaImpact.severity * 0.1);
            }
        });
    }

    identifyProtectiveFactors() {
        const factors = [];
        
        if (this.recoveryCapacity.social_support > 70) factors.push('strong_social_support');
        if (this.recoveryCapacity.resilience > 70) factors.push('high_resilience');
        if (this.recoveryCapacity.flexibility > 70) factors.push('cognitive_flexibility');
        if (this.personality.traits.optimism > 70) factors.push('optimistic_outlook');
        if (this.personality.traits.self_awareness > 70) factors.push('self_awareness');

        return factors;
    }

    identifyRiskFactors() {
        const factors = [];
        
        if (this.personality.traits.neuroticism > 70) factors.push('high_neuroticism');
        if (this.personality.traits.emotional_stability < 30) factors.push('emotional_instability');
        if (this.traumaHistory.length > 3) factors.push('trauma_history');
        if (this.recoveryCapacity.social_support < 40) factors.push('social_isolation');
        if (this.copingMechanisms.maladaptive_coping.avoidance > 50) factors.push('avoidant_coping');

        return factors;
    }

    getTraumaRecoveryStatus() {
        return {
            trauma_count: this.traumaHistory.length,
            current_trigger_sensitivity: this.triggerSensitivity,
            recovery_capacity: this.recoveryCapacity,
            coping_mechanisms: this.copingMechanisms,
            protective_factors: this.identifyProtectiveFactors(),
            risk_factors: this.identifyRiskFactors(),
            post_traumatic_growth: this.assessPostTraumaticGrowth()
        };
    }

    assessPostTraumaticGrowth() {
        if (this.traumaHistory.length === 0) return null;

        const recentTrauma = this.traumaHistory.slice(-3);
        const growthAreas = {
            appreciation_of_life: 0,
            relating_to_others: 0,
            personal_strength: 0,
            new_possibilities: 0,
            spiritual_development: 0
        };

        // Calculate growth based on recovery capacity and coping
        const recoveryStrength = this.recoveryCapacity.resilience;
        const healthyCopingStrength = Object.values(this.copingMechanisms.healthy_coping)
            .reduce((sum, val) => sum + val, 0) / 5;

        const growthPotential = (recoveryStrength + healthyCopingStrength) / 2;

        if (growthPotential > 60) {
            growthAreas.appreciation_of_life = growthPotential * 0.8;
            growthAreas.personal_strength = growthPotential * 0.9;
            growthAreas.relating_to_others = growthPotential * 0.7;
            growthAreas.new_possibilities = growthPotential * 0.6;
            growthAreas.spiritual_development = growthPotential * 0.5;
        }

        return growthAreas;
    }
}

module.exports = EmotionalIntelligenceSystem;
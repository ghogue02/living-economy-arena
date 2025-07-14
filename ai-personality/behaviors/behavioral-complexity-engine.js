/**
 * Behavioral Complexity Engine - Phase 2 Enhancement
 * Advanced behavioral modeling with personality-driven decision trees,
 * adaptive behavior patterns, social dynamics, and emergent behaviors
 * 
 * Features:
 * - Multi-layered decision architecture
 * - Adaptive behavior pattern learning
 * - Social context behavioral modification
 * - Personality disorder behavioral manifestations
 * - Habit formation and extinction
 * - Behavioral scripts and schemas
 * - Impulsivity and self-control modeling
 * - Social role adaptation
 */

class BehavioralComplexityEngine {
    constructor(personalityDNA, emotionalIntelligence) {
        this.personality = personalityDNA;
        this.emotionalIntelligence = emotionalIntelligence;
        this.behaviorPatterns = this.initializeBehaviorPatterns();
        this.decisionArchitecture = new MultiLayeredDecisionSystem(personalityDNA);
        this.socialBehavior = new SocialBehaviorSystem(personalityDNA);
        this.habitSystem = new HabitFormationSystem(personalityDNA);
        this.impulsivitySystem = new ImpulsivityControlSystem(personalityDNA, emotionalIntelligence);
        this.behaviorHistory = [];
        this.currentBehaviorState = this.initializeBehaviorState();
        this.adaptiveBehaviorLearning = new AdaptiveBehaviorLearning(personalityDNA);
    }

    initializeBehaviorPatterns() {
        const traits = this.personality.traits;
        
        return {
            // Core behavioral tendencies
            approach_avoidance: {
                approach_motivation: (traits.extraversion + traits.optimism + traits.risk_tolerance) / 3,
                avoidance_motivation: (traits.neuroticism + traits.fear + (100 - traits.confidence)) / 3,
                current_orientation: 'neutral'
            },
            
            // Social behavioral patterns
            social_patterns: {
                dominance_seeking: (traits.extraversion + traits.narcissism + traits.confidence) / 3,
                affiliation_seeking: (traits.agreeableness + traits.empathy + traits.cooperation) / 3,
                social_withdrawal: (traits.neuroticism + traits.social_anxiety + (100 - traits.extraversion)) / 3,
                impression_management: (traits.narcissism + traits.social_skills + traits.reputation_concern) / 3
            },
            
            // Decision-making patterns
            decision_patterns: {
                deliberation_speed: this.calculateDeliberationSpeed(traits),
                information_seeking: (traits.analytical_thinking + traits.curiosity + traits.research_depth) / 3,
                risk_assessment_style: this.determineRiskAssessmentStyle(traits),
                decision_confidence: (traits.confidence + (100 - traits.overthinking)) / 2
            },
            
            // Emotional behavioral patterns
            emotional_patterns: {
                emotional_expression: this.calculateEmotionalExpression(traits),
                emotional_suppression: (traits.self_control + (100 - traits.emotional_openness)) / 2,
                emotional_seeking: (traits.sensation_seeking + traits.emotional_intensity) / 2,
                mood_regulation_behavior: traits.emotional_regulation || 50
            },
            
            // Trading-specific behavioral patterns
            trading_patterns: {
                position_sizing_behavior: this.calculatePositionSizing(traits),
                timing_behavior: this.calculateTimingBehavior(traits),
                information_processing_style: this.determineInfoProcessingStyle(traits),
                loss_handling_behavior: this.calculateLossHandling(traits),
                profit_taking_behavior: this.calculateProfitTaking(traits)
            },
            
            // Consistency and variability
            behavioral_consistency: {
                routine_adherence: (traits.conscientiousness + traits.discipline) / 2,
                spontaneity: (traits.impulsiveness + traits.openness + (100 - traits.routine_preference)) / 3,
                adaptability: traits.adaptability || 50,
                context_sensitivity: (traits.social_skills + traits.emotional_perception) / 2
            }
        };
    }

    calculateDeliberationSpeed(traits) {
        const speed = (traits.impulsiveness + (100 - traits.analytical_thinking) + (100 - traits.patience)) / 3;
        return {
            speed_score: speed,
            style: speed > 70 ? 'impulsive' : speed > 40 ? 'moderate' : 'deliberative'
        };
    }

    determineRiskAssessmentStyle(traits) {
        if (traits.analytical_thinking > 70) return 'systematic';
        if (traits.intuition > 70) return 'intuitive';
        if (traits.fear > 70) return 'pessimistic';
        if (traits.overconfidence_bias > 70) return 'optimistic';
        return 'balanced';
    }

    calculateEmotionalExpression(traits) {
        return {
            intensity: (traits.extraversion + traits.emotional_intensity + (100 - traits.emotional_suppression)) / 3,
            frequency: (traits.extraversion + traits.social_skills) / 2,
            authenticity: (traits.agreeableness + (100 - traits.manipulation_tendency)) / 2,
            appropriateness: (traits.social_skills + traits.emotional_intelligence) / 2
        };
    }

    calculatePositionSizing(traits) {
        const baseSize = traits.risk_tolerance;
        const confidence = traits.confidence;
        const greed = traits.greed;
        
        return {
            base_size: baseSize,
            confidence_modifier: confidence * 0.01,
            greed_modifier: greed * 0.008,
            fear_modifier: traits.fear * -0.01,
            consistency: traits.discipline / 100
        };
    }

    calculateTimingBehavior(traits) {
        return {
            patience_level: traits.patience,
            impulsivity_factor: traits.impulsiveness,
            perfectionism_delay: traits.perfectionism * 0.5,
            fomo_acceleration: traits.fomo || 30,
            analysis_paralysis_risk: (traits.overthinking + traits.perfectionism) / 2
        };
    }

    determineInfoProcessingStyle(traits) {
        if (traits.analytical_thinking > 70 && traits.pattern_recognition > 60) return 'systematic_analytical';
        if (traits.intuition > 70 && traits.pattern_recognition > 60) return 'intuitive_pattern';
        if (traits.social_skills > 70 && traits.information_sharing > 60) return 'social_collaborative';
        if (traits.impulsiveness > 70) return 'rapid_surface';
        return 'mixed_approach';
    }

    calculateLossHandling(traits) {
        return {
            loss_aversion_strength: traits.loss_aversion || 70,
            emotional_reaction: (traits.neuroticism + (100 - traits.emotional_stability)) / 2,
            acceptance_time: (100 - traits.patience) / 10, // days
            rationalization_tendency: (traits.overconfidence_bias + traits.self_justification) / 2,
            learning_from_loss: (traits.learning_speed + traits.self_awareness) / 2
        };
    }

    calculateProfitTaking(traits) {
        return {
            greed_override: traits.greed,
            discipline_factor: traits.discipline,
            fear_of_loss: traits.loss_aversion || 70,
            satisfaction_threshold: (100 - traits.greed + traits.contentment) / 2,
            regret_avoidance: traits.regret_avoidance || 60
        };
    }

    initializeBehaviorState() {
        return {
            current_mode: 'normal', // normal, stressed, excited, focused, etc.
            energy_level: 70,
            social_energy: 60,
            cognitive_load: 30,
            emotional_regulation_capacity: 80,
            decision_fatigue: 0,
            current_habits_active: [],
            recent_behavior_sequence: [],
            context_adaptations: {},
            timestamp: Date.now()
        };
    }

    // Main behavioral decision interface
    generateBehavioralResponse(situation, context) {
        const response = {
            situation: situation,
            context: context,
            timestamp: Date.now(),
            decision_layers: {},
            behavioral_output: {},
            adaptations_made: [],
            learning_opportunities: [],
            consistency_metrics: {}
        };

        // Multi-layered decision processing
        response.decision_layers = this.decisionArchitecture.processDecision(situation, context);
        
        // Apply social behavioral modifications
        if (context.social_context) {
            response.social_modifications = this.socialBehavior.modifyBehavior(
                response.decision_layers.base_decision,
                context.social_context
            );
        }

        // Check for habit activation
        response.habit_activation = this.habitSystem.checkHabitActivation(situation, context);
        
        // Apply impulsivity and self-control
        response.impulse_control = this.impulsivitySystem.processImpulses(
            response.decision_layers,
            this.currentBehaviorState
        );

        // Generate final behavioral output
        response.behavioral_output = this.synthesizeBehavior(response);

        // Update behavior state
        this.updateBehaviorState(response);

        // Record behavior and learn
        this.recordBehavior(response);
        response.learning_opportunities = this.adaptiveBehaviorLearning.identifyLearningOpportunities(response);

        // Calculate consistency metrics
        response.consistency_metrics = this.calculateConsistencyMetrics(response);

        return response;
    }

    synthesizeBehavior(response) {
        const synthesis = {
            primary_action: null,
            action_intensity: 50,
            action_confidence: 50,
            behavioral_style: 'default',
            emotional_expression: {},
            social_adjustments: {},
            timing_factors: {},
            risk_factors: {},
            follow_up_intentions: []
        };

        // Start with base decision
        const baseDecision = response.decision_layers.base_decision;
        synthesis.primary_action = baseDecision.action;
        synthesis.action_confidence = baseDecision.confidence;

        // Apply social modifications
        if (response.social_modifications) {
            synthesis.social_adjustments = response.social_modifications;
            synthesis.action_intensity *= response.social_modifications.intensity_modifier || 1;
        }

        // Apply habit influences
        if (response.habit_activation && response.habit_activation.activated_habits.length > 0) {
            synthesis.behavioral_style = 'habitual';
            synthesis.action_intensity *= 1.2; // Habits are typically stronger
        }

        // Apply impulse control modifications
        if (response.impulse_control) {
            if (response.impulse_control.impulse_override) {
                synthesis.behavioral_style = 'impulsive';
                synthesis.primary_action = response.impulse_control.impulse_action;
                synthesis.action_intensity *= response.impulse_control.impulse_strength;
            } else if (response.impulse_control.regulation_applied) {
                synthesis.behavioral_style = 'controlled';
                synthesis.action_intensity *= response.impulse_control.regulation_factor;
            }
        }

        // Apply personality-specific behavioral style
        synthesis.behavioral_style = this.determinePersonalityBehavioralStyle(synthesis.behavioral_style);

        // Calculate emotional expression in behavior
        synthesis.emotional_expression = this.calculateBehavioralEmotionalExpression();

        // Determine timing factors
        synthesis.timing_factors = this.calculateTimingFactors(response);

        // Assess risk factors in behavior
        synthesis.risk_factors = this.assessBehavioralRisks(synthesis);

        // Generate follow-up behavioral intentions
        synthesis.follow_up_intentions = this.generateFollowUpIntentions(synthesis, response);

        return synthesis;
    }

    determinePersonalityBehavioralStyle(currentStyle) {
        const traits = this.personality.traits;
        
        if (currentStyle === 'impulsive') return currentStyle;
        if (currentStyle === 'habitual') return currentStyle;
        
        // Determine from personality
        if (traits.extraversion > 70 && traits.confidence > 70) return 'assertive';
        if (traits.agreeableness > 70 && traits.cooperation > 70) return 'collaborative';
        if (traits.conscientiousness > 70 && traits.discipline > 70) return 'methodical';
        if (traits.neuroticism > 70) return 'anxious';
        if (traits.openness > 70) return 'exploratory';
        if (traits.analytical_thinking > 70) return 'analytical';
        
        return 'balanced';
    }

    calculateBehavioralEmotionalExpression() {
        const currentEmotions = this.emotionalIntelligence.emotionalState.emotions;
        const expressionStyle = this.behaviorPatterns.emotional_patterns.emotional_expression;
        
        const expression = {};
        Object.entries(currentEmotions).forEach(([emotion, intensity]) => {
            if (intensity > 40) {
                expression[emotion] = {
                    intensity: intensity * (expressionStyle.intensity / 100),
                    authenticity: expressionStyle.authenticity,
                    appropriateness: expressionStyle.appropriateness
                };
            }
        });
        
        return expression;
    }

    calculateTimingFactors(response) {
        const timingBehavior = this.behaviorPatterns.trading_patterns.timing_behavior;
        const urgency = response.situation.urgency || 50;
        
        return {
            decision_speed: this.calculateDecisionSpeed(urgency, timingBehavior),
            patience_application: Math.max(0, timingBehavior.patience_level - urgency),
            impulsivity_risk: Math.min(100, timingBehavior.impulsivity_factor + urgency * 0.5),
            analysis_time_needed: this.calculateAnalysisTime(response.situation),
            optimal_timing_window: this.estimateOptimalTiming(response.situation)
        };
    }

    calculateDecisionSpeed(urgency, timingBehavior) {
        const baseSpeed = 100 - timingBehavior.patience_level;
        const urgencyModifier = urgency * 0.8;
        const impulsivityModifier = timingBehavior.impulsivity_factor * 0.5;
        
        return Math.min(100, baseSpeed + urgencyModifier + impulsivityModifier);
    }

    calculateAnalysisTime(situation) {
        const complexity = situation.complexity || 50;
        const analyticalNeed = this.personality.traits.analytical_thinking;
        const perfectionism = this.personality.traits.perfectionism || 50;
        
        return (complexity * analyticalNeed * perfectionism) / 125000; // Returns hours needed
    }

    estimateOptimalTiming(situation) {
        // Simple heuristic for optimal timing
        const marketVolatility = situation.market_volatility || 50;
        const opportunityWindow = situation.opportunity_window || 100;
        
        return {
            window_start: Date.now(),
            window_end: Date.now() + (opportunityWindow * 60 * 1000), // minutes to milliseconds
            confidence: Math.max(20, 100 - marketVolatility)
        };
    }

    assessBehavioralRisks(synthesis) {
        const risks = {};
        
        // Impulsivity risks
        if (synthesis.behavioral_style === 'impulsive') {
            risks.impulsive_decision = {
                probability: 0.8,
                severity: 'high',
                mitigation: 'Implement cooling-off period'
            };
        }
        
        // Overconfidence risks
        if (synthesis.action_confidence > 85 && this.personality.traits.overconfidence_bias > 70) {
            risks.overconfidence = {
                probability: 0.7,
                severity: 'medium',
                mitigation: 'Seek contrary evidence'
            };
        }
        
        // Social conformity risks
        if (synthesis.social_adjustments.conformity_pressure > 70) {
            risks.social_conformity = {
                probability: 0.6,
                severity: 'medium',
                mitigation: 'Independent analysis verification'
            };
        }
        
        // Emotional regulation risks
        const emotionalIntensity = this.emotionalIntelligence.emotionalState.meta_emotions.emotional_intensity;
        if (emotionalIntensity > 80) {
            risks.emotional_override = {
                probability: 0.5,
                severity: 'high',
                mitigation: 'Emotional regulation techniques'
            };
        }
        
        return risks;
    }

    generateFollowUpIntentions(synthesis, response) {
        const intentions = [];
        
        // Learning intentions
        if (response.learning_opportunities.length > 0) {
            intentions.push({
                type: 'learning',
                description: 'Review decision outcome for learning',
                timeframe: 'post_outcome',
                priority: 'medium'
            });
        }
        
        // Monitoring intentions
        if (synthesis.risk_factors && Object.keys(synthesis.risk_factors).length > 0) {
            intentions.push({
                type: 'monitoring',
                description: 'Monitor for identified risks',
                timeframe: 'ongoing',
                priority: 'high'
            });
        }
        
        // Adjustment intentions
        if (synthesis.action_confidence < 60) {
            intentions.push({
                type: 'adjustment',
                description: 'Reassess decision if new information emerges',
                timeframe: 'short_term',
                priority: 'medium'
            });
        }
        
        // Social follow-up intentions
        if (response.social_modifications && response.social_modifications.relationship_impact) {
            intentions.push({
                type: 'social',
                description: 'Follow up on relationship implications',
                timeframe: 'medium_term',
                priority: 'low'
            });
        }
        
        return intentions;
    }

    updateBehaviorState(response) {
        // Update energy levels
        const actionIntensity = response.behavioral_output.action_intensity || 50;
        this.currentBehaviorState.energy_level = Math.max(0, 
            this.currentBehaviorState.energy_level - actionIntensity * 0.1);
        
        // Update cognitive load
        const decisionComplexity = response.situation.complexity || 50;
        this.currentBehaviorState.cognitive_load = Math.min(100,
            this.currentBehaviorState.cognitive_load + decisionComplexity * 0.2);
        
        // Update decision fatigue
        this.currentBehaviorState.decision_fatigue = Math.min(100,
            this.currentBehaviorState.decision_fatigue + 5);
        
        // Update emotional regulation capacity
        if (response.impulse_control && response.impulse_control.regulation_applied) {
            this.currentBehaviorState.emotional_regulation_capacity = Math.max(0,
                this.currentBehaviorState.emotional_regulation_capacity - 10);
        }
        
        // Update recent behavior sequence
        this.currentBehaviorState.recent_behavior_sequence.push({
            action: response.behavioral_output.primary_action,
            style: response.behavioral_output.behavioral_style,
            timestamp: Date.now()
        });
        
        // Keep only recent behaviors
        if (this.currentBehaviorState.recent_behavior_sequence.length > 10) {
            this.currentBehaviorState.recent_behavior_sequence.shift();
        }
        
        // Natural recovery over time
        this.applyNaturalRecovery();
        
        this.currentBehaviorState.timestamp = Date.now();
    }

    applyNaturalRecovery() {
        // Energy recovery
        this.currentBehaviorState.energy_level = Math.min(100,
            this.currentBehaviorState.energy_level + 1);
        
        // Cognitive load reduction
        this.currentBehaviorState.cognitive_load = Math.max(0,
            this.currentBehaviorState.cognitive_load - 2);
        
        // Decision fatigue reduction
        this.currentBehaviorState.decision_fatigue = Math.max(0,
            this.currentBehaviorState.decision_fatigue - 1);
        
        // Emotional regulation capacity recovery
        this.currentBehaviorState.emotional_regulation_capacity = Math.min(100,
            this.currentBehaviorState.emotional_regulation_capacity + 2);
    }

    recordBehavior(response) {
        this.behaviorHistory.push({
            timestamp: response.timestamp,
            situation_type: response.situation.type,
            behavior_output: response.behavioral_output,
            decision_layers: response.decision_layers,
            consistency_score: response.consistency_metrics.overall_consistency,
            effectiveness: null // To be updated when outcome is known
        });
        
        // Keep recent history
        if (this.behaviorHistory.length > 500) {
            this.behaviorHistory = this.behaviorHistory.slice(-500);
        }
    }

    calculateConsistencyMetrics(response) {
        const recentBehaviors = this.behaviorHistory.slice(-10);
        
        if (recentBehaviors.length < 3) {
            return { overall_consistency: 85, pattern_stability: 'insufficient_data' };
        }
        
        // Calculate action consistency
        const actionTypes = recentBehaviors.map(b => b.behavior_output.primary_action);
        const actionConsistency = this.calculatePatternConsistency(actionTypes);
        
        // Calculate style consistency
        const styles = recentBehaviors.map(b => b.behavior_output.behavioral_style);
        const styleConsistency = this.calculatePatternConsistency(styles);
        
        // Calculate confidence consistency
        const confidences = recentBehaviors.map(b => b.behavior_output.action_confidence);
        const confidenceConsistency = this.calculateVarianceConsistency(confidences);
        
        const overallConsistency = (actionConsistency + styleConsistency + confidenceConsistency) / 3;
        
        return {
            overall_consistency: overallConsistency,
            action_consistency: actionConsistency,
            style_consistency: styleConsistency,
            confidence_consistency: confidenceConsistency,
            pattern_stability: this.assessPatternStability(recentBehaviors)
        };
    }

    calculatePatternConsistency(values) {
        if (values.length === 0) return 50;
        
        const uniqueValues = [...new Set(values)];
        const dominantValue = this.findMostFrequent(values);
        const dominantFrequency = values.filter(v => v === dominantValue).length;
        
        return (dominantFrequency / values.length) * 100;
    }

    calculateVarianceConsistency(values) {
        if (values.length === 0) return 50;
        
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        const standardDeviation = Math.sqrt(variance);
        
        // Lower standard deviation = higher consistency
        return Math.max(0, 100 - standardDeviation);
    }

    findMostFrequent(arr) {
        const frequency = {};
        arr.forEach(item => frequency[item] = (frequency[item] || 0) + 1);
        return Object.keys(frequency).reduce((a, b) => frequency[a] > frequency[b] ? a : b);
    }

    assessPatternStability(behaviors) {
        if (behaviors.length < 5) return 'insufficient_data';
        
        const consistencyScores = behaviors.map(b => b.consistency_score).filter(s => s !== null);
        if (consistencyScores.length === 0) return 'no_data';
        
        const avgConsistency = consistencyScores.reduce((sum, score) => sum + score, 0) / consistencyScores.length;
        
        if (avgConsistency > 80) return 'highly_stable';
        if (avgConsistency > 60) return 'moderately_stable';
        if (avgConsistency > 40) return 'somewhat_unstable';
        return 'highly_variable';
    }

    // Comprehensive behavioral analysis
    getBehavioralAnalysis() {
        return {
            behavior_patterns: this.behaviorPatterns,
            current_state: this.currentBehaviorState,
            consistency_profile: this.getConsistencyProfile(),
            behavioral_strengths: this.identifyBehavioralStrengths(),
            behavioral_risks: this.identifyBehavioralRisks(),
            adaptation_capacity: this.assessAdaptationCapacity(),
            habit_profile: this.habitSystem.getHabitProfile(),
            impulse_control_profile: this.impulsivitySystem.getImpulseControlProfile(),
            social_behavior_profile: this.socialBehavior.getSocialBehaviorProfile(),
            learning_trajectory: this.adaptiveBehaviorLearning.getLearningTrajectory(),
            behavioral_recommendations: this.generateBehavioralRecommendations()
        };
    }

    getConsistencyProfile() {
        const recentBehaviors = this.behaviorHistory.slice(-20);
        const consistencyScores = recentBehaviors.map(b => b.consistency_score).filter(s => s !== null);
        
        return {
            average_consistency: consistencyScores.length > 0 ? 
                consistencyScores.reduce((sum, score) => sum + score, 0) / consistencyScores.length : 50,
            consistency_trend: this.calculateConsistencyTrend(consistencyScores),
            pattern_stability: this.assessPatternStability(recentBehaviors),
            behavioral_predictability: this.calculateBehavioralPredictability()
        };
    }

    calculateConsistencyTrend(scores) {
        if (scores.length < 5) return 'insufficient_data';
        
        const recent = scores.slice(-5);
        const older = scores.slice(-10, -5);
        
        const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length;
        const olderAvg = older.length > 0 ? older.reduce((sum, score) => sum + score, 0) / older.length : recentAvg;
        
        const trend = recentAvg - olderAvg;
        
        if (trend > 5) return 'improving';
        if (trend < -5) return 'declining';
        return 'stable';
    }

    calculateBehavioralPredictability() {
        const patterns = this.adaptiveBehaviorLearning.getLearnedPatterns();
        const patternStrength = patterns.length > 0 ? 
            patterns.reduce((sum, p) => sum + p.reliability, 0) / patterns.length : 50;
        
        const personalityConsistency = this.personality.getPersonalityStability();
        const habitStrength = this.habitSystem.getOverallHabitStrength();
        
        return (patternStrength + personalityConsistency + habitStrength) / 3;
    }

    identifyBehavioralStrengths() {
        const strengths = [];
        
        const consistencyProfile = this.getConsistencyProfile();
        if (consistencyProfile.average_consistency > 75) {
            strengths.push({
                type: 'high_consistency',
                description: 'Maintains consistent behavioral patterns',
                impact: 'high'
            });
        }
        
        if (this.currentBehaviorState.emotional_regulation_capacity > 80) {
            strengths.push({
                type: 'emotional_regulation',
                description: 'Strong emotional self-control',
                impact: 'high'
            });
        }
        
        if (this.behaviorPatterns.behavioral_consistency.adaptability > 70) {
            strengths.push({
                type: 'behavioral_flexibility',
                description: 'Adapts behavior well to different contexts',
                impact: 'medium'
            });
        }
        
        const socialProfile = this.socialBehavior.getSocialBehaviorProfile();
        if (socialProfile.social_effectiveness > 70) {
            strengths.push({
                type: 'social_competence',
                description: 'Effective social behavioral adjustment',
                impact: 'medium'
            });
        }
        
        return strengths;
    }

    identifyBehavioralRisks() {
        const risks = [];
        
        if (this.currentBehaviorState.decision_fatigue > 70) {
            risks.push({
                type: 'decision_fatigue',
                description: 'High decision fatigue affecting judgment',
                severity: 'medium',
                mitigation: 'Take decision breaks, delegate routine decisions'
            });
        }
        
        const impulsivityRisk = this.impulsivitySystem.assessImpulsivityRisk();
        if (impulsivityRisk.overall_risk > 60) {
            risks.push({
                type: 'impulsive_behavior',
                description: 'High risk of impulsive decisions',
                severity: 'high',
                mitigation: 'Implement delay mechanisms, strengthen self-control'
            });
        }
        
        if (this.behaviorPatterns.behavioral_consistency.routine_adherence < 40) {
            risks.push({
                type: 'inconsistent_execution',
                description: 'Poor adherence to planned behaviors',
                severity: 'medium',
                mitigation: 'Strengthen habit formation, improve planning'
            });
        }
        
        const consistencyProfile = this.getConsistencyProfile();
        if (consistencyProfile.pattern_stability === 'highly_variable') {
            risks.push({
                type: 'behavioral_unpredictability',
                description: 'Highly variable behavioral patterns',
                severity: 'medium',
                mitigation: 'Focus on core behavioral principles, reduce complexity'
            });
        }
        
        return risks;
    }

    assessAdaptationCapacity() {
        const adaptabilityScore = this.behaviorPatterns.behavioral_consistency.adaptability;
        const contextSensitivity = this.behaviorPatterns.behavioral_consistency.context_sensitivity;
        const learningCapacity = this.adaptiveBehaviorLearning.getLearningCapacity();
        
        return {
            overall_capacity: (adaptabilityScore + contextSensitivity + learningCapacity) / 3,
            adaptability_score: adaptabilityScore,
            context_sensitivity: contextSensitivity,
            learning_capacity: learningCapacity,
            adaptation_speed: this.calculateAdaptationSpeed(),
            adaptation_effectiveness: this.calculateAdaptationEffectiveness()
        };
    }

    calculateAdaptationSpeed() {
        const learningSpeed = this.personality.traits.learning_speed || 50;
        const flexibility = this.personality.traits.adaptability || 50;
        const openness = this.personality.traits.openness || 50;
        
        return (learningSpeed + flexibility + openness) / 3;
    }

    calculateAdaptationEffectiveness() {
        const recentAdaptations = this.behaviorHistory.slice(-20).filter(b => b.behavior_output.social_adjustments);
        if (recentAdaptations.length === 0) return 50;
        
        const effectivenessScores = recentAdaptations.map(adaptation => {
            // Simplified effectiveness calculation
            return adaptation.effectiveness || 50;
        });
        
        return effectivenessScores.reduce((sum, score) => sum + score, 0) / effectivenessScores.length;
    }

    generateBehavioralRecommendations() {
        const recommendations = [];
        
        const risks = this.identifyBehavioralRisks();
        risks.forEach(risk => {
            recommendations.push({
                type: 'risk_mitigation',
                priority: risk.severity,
                description: risk.mitigation,
                target_area: risk.type
            });
        });
        
        const consistencyProfile = this.getConsistencyProfile();
        if (consistencyProfile.average_consistency < 60) {
            recommendations.push({
                type: 'consistency_improvement',
                priority: 'medium',
                description: 'Focus on developing more consistent behavioral patterns',
                target_area: 'behavioral_consistency'
            });
        }
        
        const adaptationCapacity = this.assessAdaptationCapacity();
        if (adaptationCapacity.overall_capacity < 50) {
            recommendations.push({
                type: 'adaptation_enhancement',
                priority: 'medium',
                description: 'Develop better behavioral adaptation skills',
                target_area: 'behavioral_flexibility'
            });
        }
        
        const currentState = this.currentBehaviorState;
        if (currentState.energy_level < 40) {
            recommendations.push({
                type: 'energy_management',
                priority: 'high',
                description: 'Take breaks to restore energy levels',
                target_area: 'energy_conservation'
            });
        }
        
        return recommendations;
    }

    // Behavior outcome learning
    updateBehaviorOutcome(behaviorId, outcome) {
        const behavior = this.behaviorHistory.find(b => 
            Math.abs(b.timestamp - behaviorId) < 1000); // Find by approximate timestamp
        
        if (behavior) {
            behavior.effectiveness = this.calculateEffectiveness(outcome);
            
            // Update adaptive learning
            this.adaptiveBehaviorLearning.recordOutcome(behavior, outcome);
            
            // Update habit system
            this.habitSystem.updateHabitStrength(behavior, outcome);
            
            // Update impulse control learning
            this.impulsivitySystem.updateRegulationLearning(behavior, outcome);
        }
    }

    calculateEffectiveness(outcome) {
        // Simple effectiveness calculation based on outcome
        if (outcome.success && outcome.satisfaction > 70) return 85;
        if (outcome.success && outcome.satisfaction > 40) return 70;
        if (outcome.success) return 60;
        if (outcome.learning_value > 50) return 45;
        return 30;
    }

    // Get predictive behavioral insights
    predictBehaviorInSituation(hypotheticalSituation) {
        return {
            predicted_behavior: this.decisionArchitecture.predictDecision(hypotheticalSituation),
            confidence: this.calculatePredictionConfidence(hypotheticalSituation),
            behavioral_factors: this.identifyInfluencingFactors(hypotheticalSituation),
            alternative_behaviors: this.generateAlternativeBehaviors(hypotheticalSituation),
            risk_assessment: this.predictBehavioralRisks(hypotheticalSituation)
        };
    }

    calculatePredictionConfidence(situation) {
        const patternMatch = this.findSimilarPastSituations(situation);
        const personalityConsistency = this.personality.getPersonalityStability();
        const behavioralConsistency = this.getConsistencyProfile().average_consistency;
        
        const matchConfidence = patternMatch.length > 0 ? 
            patternMatch.reduce((sum, match) => sum + match.similarity, 0) / patternMatch.length : 30;
        
        return (matchConfidence + personalityConsistency + behavioralConsistency) / 3;
    }

    findSimilarPastSituations(situation) {
        return this.behaviorHistory.filter(behavior => {
            return this.calculateSituationSimilarity(behavior.situation_type, situation.type) > 60;
        }).map(behavior => ({
            behavior: behavior,
            similarity: this.calculateSituationSimilarity(behavior.situation_type, situation.type)
        }));
    }

    calculateSituationSimilarity(pastType, currentType) {
        // Simplified similarity calculation
        if (pastType === currentType) return 100;
        
        const typeCategories = {
            'trading': ['buy', 'sell', 'hold', 'analyze'],
            'social': ['cooperate', 'compete', 'communicate', 'network'],
            'decision': ['choose', 'evaluate', 'plan', 'execute']
        };
        
        for (const [category, types] of Object.entries(typeCategories)) {
            if (types.includes(pastType) && types.includes(currentType)) {
                return 70;
            }
        }
        
        return 30;
    }

    identifyInfluencingFactors(situation) {
        return {
            personality_factors: this.getRelevantPersonalityTraits(situation),
            emotional_factors: this.getRelevantEmotionalFactors(situation),
            contextual_factors: this.getRelevantContextualFactors(situation),
            habitual_factors: this.getRelevantHabits(situation),
            social_factors: this.getRelevantSocialFactors(situation)
        };
    }

    getRelevantPersonalityTraits(situation) {
        // Return traits most relevant to the situation type
        const relevanceMap = {
            'trading': ['risk_tolerance', 'greed', 'fear', 'analytical_thinking', 'patience'],
            'social': ['extraversion', 'agreeableness', 'empathy', 'social_skills'],
            'decision': ['conscientiousness', 'analytical_thinking', 'confidence', 'impulsiveness']
        };
        
        const category = this.categorizeSituation(situation.type);
        const relevantTraits = relevanceMap[category] || Object.keys(this.personality.traits).slice(0, 5);
        
        return relevantTraits.map(trait => ({
            trait: trait,
            value: this.personality.traits[trait],
            influence_strength: this.calculateTraitInfluence(trait, situation)
        }));
    }

    categorizeSituation(situationType) {
        if (['buy', 'sell', 'hold', 'analyze'].includes(situationType)) return 'trading';
        if (['cooperate', 'compete', 'communicate', 'network'].includes(situationType)) return 'social';
        return 'decision';
    }

    calculateTraitInfluence(trait, situation) {
        // Simplified trait influence calculation
        const traitValue = this.personality.traits[trait];
        const situationRelevance = this.getTraitSituationRelevance(trait, situation.type);
        
        return (Math.abs(traitValue - 50) / 50) * (situationRelevance / 100);
    }

    getTraitSituationRelevance(trait, situationType) {
        const relevanceMap = {
            'risk_tolerance': { 'buy': 90, 'sell': 80, 'invest': 95 },
            'social_skills': { 'cooperate': 90, 'communicate': 95, 'network': 85 },
            'analytical_thinking': { 'analyze': 95, 'evaluate': 90, 'plan': 85 }
        };
        
        return relevanceMap[trait]?.[situationType] || 50;
    }

    getRelevantEmotionalFactors(situation) {
        const currentEmotions = this.emotionalIntelligence.emotionalState.emotions;
        return Object.entries(currentEmotions)
            .filter(([emotion, intensity]) => intensity > 40)
            .map(([emotion, intensity]) => ({
                emotion: emotion,
                intensity: intensity,
                influence_on_behavior: this.calculateEmotionalInfluence(emotion, intensity, situation)
            }));
    }

    calculateEmotionalInfluence(emotion, intensity, situation) {
        const emotionBehaviorMap = {
            'fear': { 'buy': -0.8, 'sell': 0.9, 'hold': 0.6 },
            'greed': { 'buy': 0.9, 'sell': -0.5, 'invest': 0.7 },
            'anger': { 'compete': 0.8, 'cooperate': -0.6, 'revenge_trade': 0.9 }
        };
        
        const behaviorEffect = emotionBehaviorMap[emotion]?.[situation.type] || 0;
        return (intensity / 100) * behaviorEffect;
    }

    getRelevantContextualFactors(situation) {
        return {
            market_context: situation.market_context || {},
            social_context: situation.social_context || {},
            time_pressure: situation.urgency || 50,
            resource_availability: situation.resources || 50,
            environmental_stress: this.currentBehaviorState.cognitive_load
        };
    }

    getRelevantHabits(situation) {
        return this.habitSystem.getRelevantHabits(situation);
    }

    getRelevantSocialFactors(situation) {
        if (!situation.social_context) return null;
        
        return this.socialBehavior.analyzeRelevantSocialFactors(situation.social_context);
    }

    generateAlternativeBehaviors(situation) {
        const primaryPrediction = this.decisionArchitecture.predictDecision(situation);
        const alternatives = [];
        
        // Generate personality-driven alternatives
        const personalityAlternatives = this.generatePersonalityAlternatives(situation, primaryPrediction);
        alternatives.push(...personalityAlternatives);
        
        // Generate emotional alternatives
        const emotionalAlternatives = this.generateEmotionalAlternatives(situation, primaryPrediction);
        alternatives.push(...emotionalAlternatives);
        
        // Generate social alternatives
        if (situation.social_context) {
            const socialAlternatives = this.generateSocialAlternatives(situation, primaryPrediction);
            alternatives.push(...socialAlternatives);
        }
        
        return alternatives.slice(0, 5); // Return top 5 alternatives
    }

    generatePersonalityAlternatives(situation, primaryPrediction) {
        const alternatives = [];
        
        // High conscientiousness alternative
        if (this.personality.traits.conscientiousness > 70) {
            alternatives.push({
                behavior: 'methodical_analysis',
                description: 'Thorough systematic analysis before action',
                probability: 0.3,
                personality_driver: 'conscientiousness'
            });
        }
        
        // High openness alternative
        if (this.personality.traits.openness > 70) {
            alternatives.push({
                behavior: 'creative_solution',
                description: 'Explore unconventional approaches',
                probability: 0.25,
                personality_driver: 'openness'
            });
        }
        
        return alternatives;
    }

    generateEmotionalAlternatives(situation, primaryPrediction) {
        const alternatives = [];
        const dominantEmotion = this.emotionalIntelligence.getDominantEmotion();
        
        if (dominantEmotion === 'fear' && this.emotionalIntelligence.emotionalState.emotions.fear > 60) {
            alternatives.push({
                behavior: 'risk_avoidance',
                description: 'Choose safest available option',
                probability: 0.4,
                emotional_driver: 'fear'
            });
        }
        
        if (dominantEmotion === 'anger' && this.emotionalIntelligence.emotionalState.emotions.anger > 60) {
            alternatives.push({
                behavior: 'aggressive_action',
                description: 'Take assertive or confrontational approach',
                probability: 0.35,
                emotional_driver: 'anger'
            });
        }
        
        return alternatives;
    }

    generateSocialAlternatives(situation, primaryPrediction) {
        const alternatives = [];
        const socialContext = situation.social_context;
        
        if (socialContext.group_pressure > 60) {
            alternatives.push({
                behavior: 'conformity',
                description: 'Align with group consensus',
                probability: 0.3,
                social_driver: 'group_pressure'
            });
        }
        
        if (socialContext.authority_present) {
            alternatives.push({
                behavior: 'authority_deference',
                description: 'Defer to authority figure',
                probability: 0.25,
                social_driver: 'authority'
            });
        }
        
        return alternatives;
    }

    predictBehavioralRisks(situation) {
        const risks = [];
        
        // Predict based on current state
        if (this.currentBehaviorState.decision_fatigue > 70) {
            risks.push({
                type: 'poor_decision_quality',
                probability: 0.6,
                impact: 'medium'
            });
        }
        
        // Predict based on emotional state
        const emotionalIntensity = this.emotionalIntelligence.emotionalState.meta_emotions.emotional_intensity;
        if (emotionalIntensity > 80) {
            risks.push({
                type: 'emotional_override',
                probability: 0.5,
                impact: 'high'
            });
        }
        
        // Predict based on personality vulnerabilities
        if (this.personality.traits.impulsiveness > 70 && situation.urgency > 60) {
            risks.push({
                type: 'impulsive_decision',
                probability: 0.7,
                impact: 'high'
            });
        }
        
        return risks;
    }
}

// Supporting classes (simplified versions for the main engine)

class MultiLayeredDecisionSystem {
    constructor(personalityDNA) {
        this.personality = personalityDNA;
    }

    processDecision(situation, context) {
        return {
            base_decision: {
                action: this.determineBaseAction(situation),
                confidence: this.calculateBaseConfidence(situation),
                reasoning: this.generateBaseReasoning(situation)
            },
            personality_modulation: this.applyPersonalityModulation(situation),
            context_adjustment: this.applyContextAdjustment(context),
            final_decision: null
        };
    }

    determineBaseAction(situation) {
        // Simplified action determination
        const situationMap = {
            'market_opportunity': 'analyze_then_act',
            'social_conflict': 'assess_then_respond',
            'time_pressure': 'quick_decision',
            'complex_problem': 'systematic_approach'
        };
        
        return situationMap[situation.type] || 'evaluate_options';
    }

    calculateBaseConfidence(situation) {
        const complexity = situation.complexity || 50;
        const familiarity = this.calculateFamiliarity(situation);
        const personalConfidence = this.personality.traits.confidence || 50;
        
        return (familiarity + personalConfidence + (100 - complexity)) / 3;
    }

    calculateFamiliarity(situation) {
        // Simplified familiarity calculation
        return Math.random() * 100; // In real implementation, this would check past similar situations
    }

    generateBaseReasoning(situation) {
        return `Evaluating ${situation.type} based on available information and past experience`;
    }

    applyPersonalityModulation(situation) {
        return {
            risk_adjustment: this.personality.traits.risk_tolerance - 50,
            confidence_adjustment: this.personality.traits.confidence - 50,
            speed_adjustment: this.personality.traits.impulsiveness - 50
        };
    }

    applyContextAdjustment(context) {
        return {
            social_pressure_effect: context.social_context ? context.social_context.pressure_level || 0 : 0,
            time_pressure_effect: context.urgency || 0,
            resource_constraint_effect: (100 - (context.resources || 100)) / 2
        };
    }

    predictDecision(situation) {
        const decision = this.processDecision(situation, {});
        return {
            predicted_action: decision.base_decision.action,
            confidence: decision.base_decision.confidence,
            key_factors: [decision.personality_modulation, decision.context_adjustment]
        };
    }
}

class SocialBehaviorSystem {
    constructor(personalityDNA) {
        this.personality = personalityDNA;
        this.socialAdaptations = new Map();
    }

    modifyBehavior(baseDecision, socialContext) {
        const modifications = {
            intensity_modifier: 1.0,
            conformity_pressure: this.calculateConformityPressure(socialContext),
            social_desirability_bias: this.calculateSocialDesirabilityBias(socialContext),
            relationship_considerations: this.analyzeRelationshipImpact(socialContext),
            status_considerations: this.analyzeStatusImplications(socialContext),
            impression_management: this.calculateImpressionManagement(socialContext)
        };

        return modifications;
    }

    calculateConformityPressure(socialContext) {
        const groupSize = socialContext.group_size || 1;
        const unanimity = socialContext.unanimity || 50;
        const personalConformityTendency = (100 - this.personality.traits.independent_thinking) || 30;

        const groupPressure = Math.min(100, groupSize * 10 + unanimity * 0.5);
        return (groupPressure * personalConformityTendency) / 100;
    }

    calculateSocialDesirabilityBias(socialContext) {
        const reputationConcern = this.personality.traits.reputation_concern || 50;
        const observability = socialContext.observability || 50;

        return (reputationConcern * observability) / 100;
    }

    analyzeRelationshipImpact(socialContext) {
        return {
            relationship_importance: socialContext.relationship_importance || 50,
            trust_implications: socialContext.trust_implications || 0,
            future_interaction_likelihood: socialContext.future_interactions || 50
        };
    }

    analyzeStatusImplications(socialContext) {
        const statusConcern = this.personality.traits.narcissism || 30;
        const statusOpportunity = socialContext.status_opportunity || 0;

        return {
            status_gain_potential: statusOpportunity,
            status_loss_risk: socialContext.status_risk || 0,
            status_motivation: (statusConcern * statusOpportunity) / 100
        };
    }

    calculateImpressionManagement(socialContext) {
        const narcissism = this.personality.traits.narcissism || 30;
        const socialSkills = this.personality.traits.social_skills || 50;
        const audience = socialContext.audience_importance || 50;

        return (narcissism + socialSkills + audience) / 3;
    }

    getSocialBehaviorProfile() {
        return {
            social_effectiveness: this.calculateSocialEffectiveness(),
            conformity_tendency: this.getConformityTendency(),
            social_adaptability: this.getSocialAdaptability(),
            impression_management_skill: this.getImpressionManagementSkill()
        };
    }

    calculateSocialEffectiveness() {
        const socialSkills = this.personality.traits.social_skills || 50;
        const empathy = this.personality.traits.empathy || 50;
        const charisma = this.personality.traits.charisma || 50;

        return (socialSkills + empathy + charisma) / 3;
    }

    getConformityTendency() {
        return 100 - (this.personality.traits.independent_thinking || 50);
    }

    getSocialAdaptability() {
        const adaptability = this.personality.traits.adaptability || 50;
        const socialIntelligence = this.personality.traits.social_skills || 50;
        const contextSensitivity = this.personality.traits.emotional_perception || 50;

        return (adaptability + socialIntelligence + contextSensitivity) / 3;
    }

    getImpressionManagementSkill() {
        const manipulation = this.personality.traits.manipulation_tendency || 30;
        const socialSkills = this.personality.traits.social_skills || 50;
        const selfAwareness = this.personality.traits.self_awareness || 50;

        return (manipulation + socialSkills + selfAwareness) / 3;
    }

    analyzeRelevantSocialFactors(socialContext) {
        return {
            group_dynamics: this.analyzeGroupDynamics(socialContext),
            authority_influence: this.analyzeAuthorityInfluence(socialContext),
            peer_pressure: this.analyzePeerPressure(socialContext),
            social_norms: this.analyzeSocialNorms(socialContext)
        };
    }

    analyzeGroupDynamics(socialContext) {
        return {
            cohesion: socialContext.group_cohesion || 50,
            size: socialContext.group_size || 1,
            leadership: socialContext.leadership_present || false,
            conflict_level: socialContext.conflict_level || 0
        };
    }

    analyzeAuthorityInfluence(socialContext) {
        const authorityPresent = socialContext.authority_present || false;
        const authorityDeference = this.personality.traits.authority_deference || 50;

        return {
            present: authorityPresent,
            personal_deference: authorityDeference,
            influence_strength: authorityPresent ? authorityDeference : 0
        };
    }

    analyzePeerPressure(socialContext) {
        const peerInfluence = socialContext.peer_influence || 0;
        const conformityTendency = this.getConformityTendency();

        return {
            pressure_level: peerInfluence,
            susceptibility: conformityTendency,
            effective_pressure: (peerInfluence * conformityTendency) / 100
        };
    }

    analyzeSocialNorms(socialContext) {
        return {
            norm_clarity: socialContext.norm_clarity || 50,
            norm_enforcement: socialContext.norm_enforcement || 50,
            personal_norm_adherence: this.personality.traits.rule_following || 50
        };
    }
}

class HabitFormationSystem {
    constructor(personalityDNA) {
        this.personality = personalityDNA;
        this.habits = new Map();
        this.habitFormationRate = this.calculateHabitFormationRate();
    }

    calculateHabitFormationRate() {
        const conscientiousness = this.personality.traits.conscientiousness || 50;
        const consistency = this.personality.traits.consistency || 50;
        const discipline = this.personality.traits.discipline || 50;

        return (conscientiousness + consistency + discipline) / 3;
    }

    checkHabitActivation(situation, context) {
        const activatedHabits = [];
        const situationCues = this.extractSituationCues(situation, context);

        this.habits.forEach((habit, habitId) => {
            if (this.isHabitTriggered(habit, situationCues)) {
                activatedHabits.push({
                    habit_id: habitId,
                    habit: habit,
                    activation_strength: this.calculateActivationStrength(habit, situationCues)
                });
            }
        });

        return {
            activated_habits: activatedHabits,
            habit_competition: this.resolveHabitCompetition(activatedHabits),
            dominant_habit: this.findDominantHabit(activatedHabits)
        };
    }

    extractSituationCues(situation, context) {
        return {
            situation_type: situation.type,
            time_of_day: context.time_of_day || 'unknown',
            emotional_state: context.emotional_state || 'neutral',
            social_context: context.social_context ? 'social' : 'individual',
            stress_level: context.stress_level || 'normal'
        };
    }

    isHabitTriggered(habit, cues) {
        let matchScore = 0;
        let totalCues = 0;

        habit.triggers.forEach(trigger => {
            totalCues++;
            if (cues[trigger.cue_type] === trigger.cue_value) {
                matchScore += trigger.importance;
            }
        });

        return matchScore / totalCues > 0.6; // Threshold for habit activation
    }

    calculateActivationStrength(habit, cues) {
        return habit.strength * this.calculateCueMatch(habit, cues);
    }

    calculateCueMatch(habit, cues) {
        let totalMatch = 0;
        habit.triggers.forEach(trigger => {
            if (cues[trigger.cue_type] === trigger.cue_value) {
                totalMatch += trigger.importance;
            }
        });
        return totalMatch / habit.triggers.length;
    }

    resolveHabitCompetition(activatedHabits) {
        if (activatedHabits.length <= 1) return 'no_competition';
        
        const strengthDifference = Math.abs(
            activatedHabits[0].activation_strength - activatedHabits[1].activation_strength
        );
        
        if (strengthDifference > 20) return 'clear_winner';
        if (strengthDifference > 10) return 'moderate_competition';
        return 'strong_competition';
    }

    findDominantHabit(activatedHabits) {
        if (activatedHabits.length === 0) return null;
        
        return activatedHabits.reduce((max, current) => 
            current.activation_strength > max.activation_strength ? current : max
        );
    }

    updateHabitStrength(behavior, outcome) {
        const relevantHabits = this.findRelevantHabits(behavior);
        
        relevantHabits.forEach(habitId => {
            const habit = this.habits.get(habitId);
            if (habit) {
                const strengthChange = this.calculateStrengthChange(outcome);
                habit.strength = Math.max(0, Math.min(100, habit.strength + strengthChange));
                habit.reinforcement_count += outcome.success ? 1 : 0;
                habit.total_activations += 1;
            }
        });
    }

    findRelevantHabits(behavior) {
        const relevantHabits = [];
        this.habits.forEach((habit, habitId) => {
            if (habit.behavior_type === behavior.behavior_output.primary_action) {
                relevantHabits.push(habitId);
            }
        });
        return relevantHabits;
    }

    calculateStrengthChange(outcome) {
        if (outcome.success) {
            return outcome.satisfaction > 70 ? 3 : 1;
        } else {
            return outcome.learning_value > 50 ? -1 : -2;
        }
    }

    getHabitProfile() {
        const habitStrengths = Array.from(this.habits.values()).map(h => h.strength);
        const averageStrength = habitStrengths.length > 0 ? 
            habitStrengths.reduce((sum, s) => sum + s, 0) / habitStrengths.length : 0;

        return {
            total_habits: this.habits.size,
            average_habit_strength: averageStrength,
            habit_formation_rate: this.habitFormationRate,
            strongest_habits: this.getStrongestHabits(3),
            habit_consistency: this.calculateHabitConsistency()
        };
    }

    getStrongestHabits(count) {
        return Array.from(this.habits.entries())
            .sort(([,a], [,b]) => b.strength - a.strength)
            .slice(0, count)
            .map(([id, habit]) => ({ id, habit }));
    }

    calculateHabitConsistency() {
        const habits = Array.from(this.habits.values());
        if (habits.length === 0) return 0;

        const consistencyScores = habits.map(habit => {
            return habit.reinforcement_count / Math.max(1, habit.total_activations);
        });

        return consistencyScores.reduce((sum, score) => sum + score, 0) / consistencyScores.length * 100;
    }

    getOverallHabitStrength() {
        const profile = this.getHabitProfile();
        return profile.average_habit_strength;
    }

    getRelevantHabits(situation) {
        const relevantHabits = [];
        this.habits.forEach((habit, habitId) => {
            const relevanceScore = this.calculateHabitRelevance(habit, situation);
            if (relevanceScore > 50) {
                relevantHabits.push({
                    habit_id: habitId,
                    habit: habit,
                    relevance: relevanceScore
                });
            }
        });

        return relevantHabits.sort((a, b) => b.relevance - a.relevance);
    }

    calculateHabitRelevance(habit, situation) {
        let relevance = 0;
        
        habit.triggers.forEach(trigger => {
            if (trigger.cue_type === 'situation_type' && trigger.cue_value === situation.type) {
                relevance += 40;
            }
            if (trigger.cue_type === 'context' && this.contextMatches(trigger.cue_value, situation.context)) {
                relevance += 30;
            }
        });

        return Math.min(100, relevance);
    }

    contextMatches(habitContext, situationContext) {
        // Simplified context matching
        return habitContext === situationContext;
    }
}

class ImpulsivityControlSystem {
    constructor(personalityDNA, emotionalIntelligence) {
        this.personality = personalityDNA;
        this.emotionalIntelligence = emotionalIntelligence;
        this.controlMechanisms = this.initializeControlMechanisms();
        this.impulseHistory = [];
    }

    initializeControlMechanisms() {
        const traits = this.personality.traits;
        
        return {
            cognitive_control: {
                strength: (traits.self_control + traits.discipline + traits.conscientiousness) / 3,
                mechanisms: ['delay_technique', 'cost_benefit_analysis', 'goal_reminder']
            },
            emotional_regulation: {
                strength: (traits.emotional_stability + traits.stress_tolerance) / 2,
                mechanisms: ['breathing_technique', 'emotion_labeling', 'perspective_taking']
            },
            behavioral_inhibition: {
                strength: (traits.discipline + (100 - traits.impulsiveness)) / 2,
                mechanisms: ['pause_and_plan', 'alternative_generation', 'implementation_intention']
            },
            social_control: {
                strength: (traits.social_awareness + traits.reputation_concern) / 2,
                mechanisms: ['social_consequence_evaluation', 'role_model_consideration']
            }
        };
    }

    processImpulses(decisionLayers, behaviorState) {
        const impulses = this.detectImpulses(decisionLayers, behaviorState);
        
        if (impulses.length === 0) {
            return { impulse_detected: false, regulation_applied: false };
        }

        const strongestImpulse = impulses.reduce((max, current) => 
            current.strength > max.strength ? current : max);

        const controlResult = this.attemptImpulseControl(strongestImpulse, behaviorState);
        
        this.recordImpulseEvent(strongestImpulse, controlResult);

        return {
            impulse_detected: true,
            impulse_type: strongestImpulse.type,
            impulse_strength: strongestImpulse.strength,
            regulation_applied: controlResult.success,
            regulation_mechanism: controlResult.mechanism,
            impulse_override: !controlResult.success,
            impulse_action: strongestImpulse.action,
            regulation_factor: controlResult.success ? controlResult.effectiveness : 1
        };
    }

    detectImpulses(decisionLayers, behaviorState) {
        const impulses = [];

        // Emotional impulses
        const emotionalIntensity = this.emotionalIntelligence.emotionalState.meta_emotions.emotional_intensity;
        if (emotionalIntensity > 70) {
            impulses.push({
                type: 'emotional',
                strength: emotionalIntensity,
                trigger: this.emotionalIntelligence.getDominantEmotion(),
                action: this.mapEmotionToImpulse(this.emotionalIntelligence.getDominantEmotion())
            });
        }

        // Personality-driven impulses
        const impulsiveness = this.personality.traits.impulsiveness || 30;
        if (impulsiveness > 60 && behaviorState.decision_fatigue > 50) {
            impulses.push({
                type: 'personality',
                strength: impulsiveness,
                trigger: 'high_impulsiveness_with_fatigue',
                action: 'quick_decision_without_analysis'
            });
        }

        // Greed-driven impulses
        const greed = this.personality.traits.greed || 30;
        if (greed > 70 && decisionLayers.base_decision.action.includes('profit')) {
            impulses.push({
                type: 'greed',
                strength: greed,
                trigger: 'profit_opportunity',
                action: 'maximize_position_size'
            });
        }

        // Fear-driven impulses
        const fear = this.emotionalIntelligence.emotionalState.emotions.fear || 30;
        if (fear > 60) {
            impulses.push({
                type: 'fear',
                strength: fear,
                trigger: 'perceived_threat',
                action: 'immediate_exit_or_avoidance'
            });
        }

        return impulses;
    }

    mapEmotionToImpulse(emotion) {
        const emotionImpulseMap = {
            'anger': 'aggressive_retaliation',
            'fear': 'immediate_escape',
            'greed': 'resource_hoarding',
            'euphoria': 'risk_escalation',
            'envy': 'competitive_aggression',
            'panic': 'emergency_exit'
        };

        return emotionImpulseMap[emotion] || 'uncontrolled_action';
    }

    attemptImpulseControl(impulse, behaviorState) {
        const availableEnergy = 100 - behaviorState.emotional_regulation_capacity;
        if (availableEnergy < 20) {
            return { success: false, mechanism: 'insufficient_energy', effectiveness: 0 };
        }

        const relevantControlMechanisms = this.selectControlMechanisms(impulse);
        const bestMechanism = relevantControlMechanisms[0];

        if (!bestMechanism) {
            return { success: false, mechanism: 'no_mechanism_available', effectiveness: 0 };
        }

        const controlStrength = this.controlMechanisms[bestMechanism.category].strength;
        const mechanismEffectiveness = bestMechanism.effectiveness;
        const impulseResistance = this.calculateImpulseResistance(impulse, controlStrength);

        const controlSuccess = impulseResistance > impulse.strength;
        const effectiveness = controlSuccess ? mechanismEffectiveness : mechanismEffectiveness * 0.3;

        return {
            success: controlSuccess,
            mechanism: bestMechanism.name,
            effectiveness: effectiveness,
            energy_cost: bestMechanism.energy_cost
        };
    }

    selectControlMechanisms(impulse) {
        const mechanisms = [];

        Object.entries(this.controlMechanisms).forEach(([category, config]) => {
            config.mechanisms.forEach(mechanism => {
                const effectiveness = this.calculateMechanismEffectiveness(mechanism, impulse, config.strength);
                mechanisms.push({
                    category: category,
                    name: mechanism,
                    effectiveness: effectiveness,
                    energy_cost: this.calculateEnergyCost(mechanism)
                });
            });
        });

        return mechanisms.sort((a, b) => b.effectiveness - a.effectiveness);
    }

    calculateMechanismEffectiveness(mechanism, impulse, categoryStrength) {
        const mechanismImpulseMapping = {
            'delay_technique': { 'emotional': 0.7, 'personality': 0.8, 'greed': 0.6, 'fear': 0.5 },
            'cost_benefit_analysis': { 'greed': 0.9, 'personality': 0.7, 'emotional': 0.6, 'fear': 0.8 },
            'breathing_technique': { 'emotional': 0.8, 'fear': 0.9, 'anger': 0.7 },
            'pause_and_plan': { 'personality': 0.9, 'all': 0.6 }
        };

        const typeEffectiveness = mechanismImpulseMapping[mechanism]?.[impulse.type] || 
                                mechanismImpulseMapping[mechanism]?.['all'] || 0.5;

        return (categoryStrength / 100) * typeEffectiveness * 100;
    }

    calculateEnergyCost(mechanism) {
        const energyCosts = {
            'delay_technique': 15,
            'cost_benefit_analysis': 25,
            'breathing_technique': 10,
            'emotion_labeling': 15,
            'pause_and_plan': 20,
            'alternative_generation': 30,
            'social_consequence_evaluation': 20
        };

        return energyCosts[mechanism] || 20;
    }

    calculateImpulseResistance(impulse, controlStrength) {
        const baseResistance = controlStrength;
        const personalityModifier = this.getPersonalityControlModifier(impulse.type);
        const experienceModifier = this.getExperienceModifier(impulse.type);

        return baseResistance * personalityModifier * experienceModifier;
    }

    getPersonalityControlModifier(impulseType) {
        const traits = this.personality.traits;
        
        switch(impulseType) {
            case 'emotional':
                return (traits.emotional_stability || 50) / 50;
            case 'greed':
                return ((100 - traits.greed) + traits.discipline) / 100;
            case 'fear':
                return ((100 - traits.fear) + traits.confidence) / 100;
            case 'personality':
                return ((100 - traits.impulsiveness) + traits.self_control) / 100;
            default:
                return 1.0;
        }
    }

    getExperienceModifier(impulseType) {
        const relevantExperiences = this.impulseHistory.filter(event => 
            event.impulse.type === impulseType);

        if (relevantExperiences.length === 0) return 1.0;

        const successRate = relevantExperiences.filter(e => e.control_result.success).length / 
                           relevantExperiences.length;

        return 0.8 + (successRate * 0.4); // Range: 0.8 to 1.2
    }

    recordImpulseEvent(impulse, controlResult) {
        this.impulseHistory.push({
            timestamp: Date.now(),
            impulse: impulse,
            control_result: controlResult
        });

        // Keep recent history
        if (this.impulseHistory.length > 100) {
            this.impulseHistory.shift();
        }
    }

    updateRegulationLearning(behavior, outcome) {
        const relevantImpulseEvents = this.impulseHistory.filter(event => 
            Math.abs(event.timestamp - behavior.timestamp) < 60000); // Within 1 minute

        relevantImpulseEvents.forEach(event => {
            if (event.control_result.success && outcome.success) {
                // Successful control led to good outcome - strengthen mechanism
                this.strengthenControlMechanism(event.control_result.mechanism);
            } else if (!event.control_result.success && !outcome.success) {
                // Failed control led to bad outcome - note need for better control
                this.noteControlFailure(event.impulse.type);
            }
        });
    }

    strengthenControlMechanism(mechanism) {
        // Find which category this mechanism belongs to
        Object.entries(this.controlMechanisms).forEach(([category, config]) => {
            if (config.mechanisms.includes(mechanism)) {
                config.strength = Math.min(100, config.strength + 1);
            }
        });
    }

    noteControlFailure(impulseType) {
        // Identify which control mechanisms need strengthening for this impulse type
        const relevantCategories = this.getRelevantControlCategories(impulseType);
        relevantCategories.forEach(category => {
            // Slight decrease to indicate need for improvement
            this.controlMechanisms[category].strength = Math.max(0, 
                this.controlMechanisms[category].strength - 0.5);
        });
    }

    getRelevantControlCategories(impulseType) {
        const relevanceMap = {
            'emotional': ['emotional_regulation', 'cognitive_control'],
            'greed': ['cognitive_control', 'behavioral_inhibition'],
            'fear': ['emotional_regulation', 'cognitive_control'],
            'personality': ['behavioral_inhibition', 'cognitive_control'],
            'social': ['social_control', 'cognitive_control']
        };

        return relevanceMap[impulseType] || ['cognitive_control'];
    }

    getImpulseControlProfile() {
        return {
            control_mechanisms: this.controlMechanisms,
            recent_impulse_frequency: this.calculateRecentImpulseFrequency(),
            control_success_rate: this.calculateControlSuccessRate(),
            most_challenging_impulses: this.identifyChallengingImpulses(),
            control_strength_by_type: this.getControlStrengthByType()
        };
    }

    calculateRecentImpulseFrequency() {
        const recentPeriod = 7 * 24 * 60 * 60 * 1000; // 7 days
        const recentImpulses = this.impulseHistory.filter(event => 
            Date.now() - event.timestamp < recentPeriod);

        return recentImpulses.length / 7; // Impulses per day
    }

    calculateControlSuccessRate() {
        if (this.impulseHistory.length === 0) return 50;

        const successfulControls = this.impulseHistory.filter(event => 
            event.control_result.success).length;

        return (successfulControls / this.impulseHistory.length) * 100;
    }

    identifyChallengingImpulses() {
        const impulseTypes = {};
        
        this.impulseHistory.forEach(event => {
            const type = event.impulse.type;
            if (!impulseTypes[type]) {
                impulseTypes[type] = { total: 0, failed: 0 };
            }
            impulseTypes[type].total++;
            if (!event.control_result.success) {
                impulseTypes[type].failed++;
            }
        });

        return Object.entries(impulseTypes)
            .map(([type, data]) => ({
                type: type,
                failure_rate: data.failed / data.total,
                frequency: data.total
            }))
            .sort((a, b) => b.failure_rate - a.failure_rate)
            .slice(0, 3);
    }

    getControlStrengthByType() {
        const strengthByType = {};

        Object.entries(this.controlMechanisms).forEach(([category, config]) => {
            strengthByType[category] = config.strength;
        });

        return strengthByType;
    }

    assessImpulsivityRisk() {
        const personalityRisk = this.personality.traits.impulsiveness || 30;
        const emotionalRisk = this.emotionalIntelligence.emotionalState.meta_emotions.emotional_intensity;
        const controlCapacity = this.calculateControlSuccessRate();
        const fatigueRisk = this.getCurrentFatigueLevel();

        const overallRisk = (personalityRisk + emotionalRisk + (100 - controlCapacity) + fatigueRisk) / 4;

        return {
            overall_risk: overallRisk,
            personality_component: personalityRisk,
            emotional_component: emotionalRisk,
            control_deficit: 100 - controlCapacity,
            fatigue_component: fatigueRisk,
            risk_level: this.categorizeRisk(overallRisk)
        };
    }

    getCurrentFatigueLevel() {
        // This would be provided by the behavior state in a full implementation
        return 30; // Placeholder
    }

    categorizeRisk(riskScore) {
        if (riskScore > 80) return 'very_high';
        if (riskScore > 60) return 'high';
        if (riskScore > 40) return 'medium';
        if (riskScore > 20) return 'low';
        return 'very_low';
    }
}

class AdaptiveBehaviorLearning {
    constructor(personalityDNA) {
        this.personality = personalityDNA;
        this.learnedPatterns = new Map();
        this.outcomeHistory = [];
        this.adaptationRules = this.initializeAdaptationRules();
    }

    initializeAdaptationRules() {
        const learningSpeed = this.personality.traits.learning_speed || 50;
        const adaptability = this.personality.traits.adaptability || 50;
        const openness = this.personality.traits.openness || 50;

        return {
            learning_rate: learningSpeed / 100,
            adaptation_threshold: 100 - adaptability, // Lower threshold = faster adaptation
            pattern_recognition_sensitivity: (learningSpeed + openness) / 200,
            outcome_weighting: {
                success: 1.0,
                failure: 0.8,
                neutral: 0.3
            }
        };
    }

    identifyLearningOpportunities(behaviorResponse) {
        const opportunities = [];

        // Decision accuracy learning
        opportunities.push({
            type: 'decision_accuracy',
            description: 'Learn from decision outcome accuracy',
            learning_potential: this.calculateLearningPotential(behaviorResponse),
            focus_area: 'decision_making'
        });

        // Behavioral effectiveness learning
        if (behaviorResponse.behavioral_output.action_confidence < 70) {
            opportunities.push({
                type: 'confidence_calibration',
                description: 'Improve confidence calibration',
                learning_potential: 60,
                focus_area: 'self_awareness'
            });
        }

        // Pattern recognition learning
        const patternComplexity = this.assessPatternComplexity(behaviorResponse);
        if (patternComplexity > 60) {
            opportunities.push({
                type: 'pattern_recognition',
                description: 'Recognize complex behavioral patterns',
                learning_potential: patternComplexity,
                focus_area: 'pattern_recognition'
            });
        }

        // Social learning opportunities
        if (behaviorResponse.social_modifications) {
            opportunities.push({
                type: 'social_learning',
                description: 'Learn from social interaction outcomes',
                learning_potential: 50,
                focus_area: 'social_intelligence'
            });
        }

        return opportunities;
    }

    calculateLearningPotential(behaviorResponse) {
        const situationNovelty = this.assessSituationNovelty(behaviorResponse.situation);
        const decisionComplexity = behaviorResponse.situation.complexity || 50;
        const uncertaintyLevel = 100 - behaviorResponse.behavioral_output.action_confidence;

        return (situationNovelty + decisionComplexity + uncertaintyLevel) / 3;
    }

    assessSituationNovelty(situation) {
        const similarSituations = this.findSimilarSituations(situation);
        if (similarSituations.length === 0) return 100;
        if (similarSituations.length < 3) return 70;
        if (similarSituations.length < 10) return 40;
        return 20;
    }

    findSimilarSituations(situation) {
        return this.outcomeHistory.filter(outcome => 
            outcome.behavior.situation_type === situation.type);
    }

    assessPatternComplexity(behaviorResponse) {
        const layerCount = Object.keys(behaviorResponse.decision_layers).length;
        const factorCount = this.countInfluencingFactors(behaviorResponse);
        const interactionComplexity = this.assessFactorInteractions(behaviorResponse);

        return (layerCount * 10 + factorCount * 5 + interactionComplexity) / 3;
    }

    countInfluencingFactors(behaviorResponse) {
        let factorCount = 0;
        
        if (behaviorResponse.social_modifications) factorCount += 3;
        if (behaviorResponse.habit_activation?.activated_habits.length > 0) factorCount += 2;
        if (behaviorResponse.impulse_control?.impulse_detected) factorCount += 2;
        
        return factorCount;
    }

    assessFactorInteractions(behaviorResponse) {
        // Simplified interaction complexity assessment
        let complexity = 0;
        
        if (behaviorResponse.social_modifications && 
            behaviorResponse.impulse_control?.impulse_detected) {
            complexity += 20; // Social-impulse interaction
        }
        
        if (behaviorResponse.habit_activation?.activated_habits.length > 1) {
            complexity += 15; // Multiple habit competition
        }
        
        return Math.min(100, complexity);
    }

    recordOutcome(behavior, outcome) {
        this.outcomeHistory.push({
            timestamp: Date.now(),
            behavior: behavior,
            outcome: outcome,
            learning_extracted: false
        });

        // Process learning from this outcome
        this.processLearning(behavior, outcome);

        // Keep recent history
        if (this.outcomeHistory.length > 200) {
            this.outcomeHistory.shift();
        }
    }

    processLearning(behavior, outcome) {
        // Update learned patterns
        this.updateLearnedPatterns(behavior, outcome);
        
        // Extract behavioral rules
        this.extractBehavioralRules(behavior, outcome);
        
        // Update adaptation parameters
        this.updateAdaptationParameters(behavior, outcome);
    }

    updateLearnedPatterns(behavior, outcome) {
        const patternKey = this.generatePatternKey(behavior);
        
        if (!this.learnedPatterns.has(patternKey)) {
            this.learnedPatterns.set(patternKey, {
                frequency: 0,
                success_rate: 0,
                outcomes: [],
                confidence: 0,
                last_updated: Date.now()
            });
        }

        const pattern = this.learnedPatterns.get(patternKey);
        pattern.frequency++;
        pattern.outcomes.push(outcome);
        
        // Calculate success rate
        const successes = pattern.outcomes.filter(o => o.success).length;
        pattern.success_rate = successes / pattern.outcomes.length;
        
        // Update confidence based on frequency and consistency
        pattern.confidence = Math.min(95, pattern.frequency * 5 + pattern.success_rate * 30);
        pattern.last_updated = Date.now();

        // Keep recent outcomes only
        if (pattern.outcomes.length > 20) {
            pattern.outcomes = pattern.outcomes.slice(-20);
        }
    }

    generatePatternKey(behavior) {
        return `${behavior.situation_type}_${behavior.behavior_output.behavioral_style}_${behavior.behavior_output.primary_action}`;
    }

    extractBehavioralRules(behavior, outcome) {
        // Extract "if-then" rules from successful behaviors
        if (outcome.success && outcome.satisfaction > 70) {
            const rule = {
                condition: this.extractCondition(behavior),
                action: behavior.behavior_output.primary_action,
                confidence: outcome.satisfaction,
                last_reinforced: Date.now()
            };

            this.storeOrUpdateRule(rule);
        }
    }

    extractCondition(behavior) {
        return {
            situation_type: behavior.situation_type,
            emotional_state: this.categorizeEmotionalState(behavior),
            social_context: behavior.social_modifications ? 'social' : 'individual',
            urgency_level: this.categorizeUrgency(behavior)
        };
    }

    categorizeEmotionalState(behavior) {
        // Simplified emotional state categorization
        if (behavior.behavioral_output.emotional_expression) {
            const emotions = Object.keys(behavior.behavioral_output.emotional_expression);
            return emotions.length > 0 ? emotions[0] : 'neutral';
        }
        return 'neutral';
    }

    categorizeUrgency(behavior) {
        const urgency = behavior.situation?.urgency || 50;
        if (urgency > 70) return 'high';
        if (urgency > 40) return 'medium';
        return 'low';
    }

    storeOrUpdateRule(rule) {
        // Simplified rule storage - in full implementation would use more sophisticated rule system
        const ruleKey = JSON.stringify(rule.condition);
        // This would be stored in a rules database
    }

    updateAdaptationParameters(behavior, outcome) {
        const learningValue = this.calculateLearningValue(outcome);
        
        // Adjust learning rate based on success
        if (outcome.success) {
            this.adaptationRules.learning_rate = Math.min(1.0, 
                this.adaptationRules.learning_rate * 1.02);
        } else {
            this.adaptationRules.learning_rate = Math.max(0.1, 
                this.adaptationRules.learning_rate * 0.98);
        }

        // Adjust pattern recognition sensitivity
        if (learningValue > 70) {
            this.adaptationRules.pattern_recognition_sensitivity = Math.min(1.0,
                this.adaptationRules.pattern_recognition_sensitivity * 1.01);
        }
    }

    calculateLearningValue(outcome) {
        let value = 0;
        
        if (outcome.success) value += 40;
        if (outcome.satisfaction > 70) value += 30;
        if (outcome.learning_value > 50) value += 20;
        if (outcome.unexpected_result) value += 10;
        
        return Math.min(100, value);
    }

    getLearningTrajectory() {
        const recentOutcomes = this.outcomeHistory.slice(-20);
        const learningRate = this.calculateCurrentLearningRate(recentOutcomes);
        const patternRecognitionImprovement = this.calculatePatternRecognitionImprovement();
        const adaptationSpeed = this.calculateAdaptationSpeed();

        return {
            current_learning_rate: learningRate,
            pattern_recognition_improvement: patternRecognitionImprovement,
            adaptation_speed: adaptationSpeed,
            learning_efficiency: this.calculateLearningEfficiency(),
            knowledge_accumulation: this.assessKnowledgeAccumulation()
        };
    }

    calculateCurrentLearningRate(recentOutcomes) {
        if (recentOutcomes.length < 5) return this.adaptationRules.learning_rate;

        const learningValues = recentOutcomes.map(outcome => 
            this.calculateLearningValue(outcome.outcome));
        
        return learningValues.reduce((sum, val) => sum + val, 0) / learningValues.length / 100;
    }

    calculatePatternRecognitionImprovement() {
        const patternCount = this.learnedPatterns.size;
        const averageConfidence = this.calculateAveragePatternConfidence();
        
        return (patternCount * 2 + averageConfidence) / 3;
    }

    calculateAveragePatternConfidence() {
        if (this.learnedPatterns.size === 0) return 0;

        const confidences = Array.from(this.learnedPatterns.values()).map(p => p.confidence);
        return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
    }

    calculateAdaptationSpeed() {
        const adaptabilityTrait = this.personality.traits.adaptability || 50;
        const learningSpeedTrait = this.personality.traits.learning_speed || 50;
        const currentLearningRate = this.adaptationRules.learning_rate * 100;

        return (adaptabilityTrait + learningSpeedTrait + currentLearningRate) / 3;
    }

    calculateLearningEfficiency() {
        const recentOutcomes = this.outcomeHistory.slice(-10);
        if (recentOutcomes.length === 0) return 50;

        const successRate = recentOutcomes.filter(o => o.outcome.success).length / recentOutcomes.length;
        const learningRate = this.calculateCurrentLearningRate(recentOutcomes);

        return (successRate * 60 + learningRate * 40);
    }

    assessKnowledgeAccumulation() {
        return {
            total_patterns_learned: this.learnedPatterns.size,
            high_confidence_patterns: this.countHighConfidencePatterns(),
            knowledge_diversity: this.calculateKnowledgeDiversity(),
            retention_rate: this.calculateRetentionRate()
        };
    }

    countHighConfidencePatterns() {
        return Array.from(this.learnedPatterns.values()).filter(p => p.confidence > 80).length;
    }

    calculateKnowledgeDiversity() {
        const situationTypes = new Set();
        this.learnedPatterns.forEach((pattern, key) => {
            const situationType = key.split('_')[0];
            situationTypes.add(situationType);
        });
        
        return situationTypes.size * 10; // Convert to percentage-like scale
    }

    calculateRetentionRate() {
        const oldPatterns = Array.from(this.learnedPatterns.values()).filter(p => 
            Date.now() - p.last_updated > 30 * 24 * 60 * 60 * 1000); // 30 days old
        
        if (oldPatterns.length === 0) return 100;
        
        const stillRelevant = oldPatterns.filter(p => p.confidence > 40).length;
        return (stillRelevant / oldPatterns.length) * 100;
    }

    getLearningCapacity() {
        const personalityCapacity = (this.personality.traits.learning_speed + 
                                   this.personality.traits.adaptability + 
                                   this.personality.traits.openness) / 3;
        
        const currentEfficiency = this.calculateLearningEfficiency();
        
        return (personalityCapacity + currentEfficiency) / 2;
    }

    getLearnedPatterns() {
        return Array.from(this.learnedPatterns.entries()).map(([key, pattern]) => ({
            pattern_key: key,
            reliability: pattern.success_rate,
            confidence: pattern.confidence,
            frequency: pattern.frequency
        }));
    }
}

module.exports = BehavioralComplexityEngine;
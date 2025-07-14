/**
 * Emotional Response System for AI Traders
 * Models emotional reactions during market volatility and trading scenarios
 */

class EmotionalResponseSystem {
    constructor(personalityDNA) {
        this.personality = personalityDNA;
        this.currentEmotions = this.initializeEmotionalState();
        this.emotionalHistory = [];
        this.volatilityResponses = new VolatilityEmotionEngine(personalityDNA);
        this.socialEmotions = new SocialEmotionEngine(personalityDNA);
        this.cognitiveEmotions = new CognitiveEmotionEngine(personalityDNA);
        this.emotionalRegulation = new EmotionalRegulationSystem(personalityDNA);
        this.emotionalMemory = new EmotionalMemorySystem();
    }

    initializeEmotionalState() {
        const traits = this.personality.traits;
        
        return {
            // Primary emotions (0-100 intensity)
            fear: this.calculateBaseEmotion('fear', traits),
            greed: this.calculateBaseEmotion('greed', traits),
            anger: this.calculateBaseEmotion('anger', traits),
            joy: this.calculateBaseEmotion('joy', traits),
            surprise: this.calculateBaseEmotion('surprise', traits),
            sadness: this.calculateBaseEmotion('sadness', traits),
            
            // Trading-specific emotions
            euphoria: 0,
            panic: 0,
            fomo: 0, // Fear of missing out
            regret: 0,
            confidence: traits.confidence,
            anxiety: this.calculateBaseEmotion('anxiety', traits),
            
            // Social emotions
            trust: traits.trust_propensity,
            envy: 0,
            pride: 0,
            shame: 0,
            guilt: 0,
            
            // Meta-emotional states
            emotional_clarity: traits.emotional_stability,
            emotional_intensity: 50,
            emotional_volatility: 100 - traits.emotional_stability,
            
            // Timestamp and context
            last_updated: Date.now(),
            dominant_emotion: 'neutral',
            emotion_duration: {}
        };
    }

    calculateBaseEmotion(emotion, traits) {
        const baseLevels = {
            fear: (traits.fear + (100 - traits.confidence) + (100 - traits.emotional_stability)) / 3,
            greed: traits.greed,
            anger: (100 - traits.patience + traits.vindictiveness) / 2,
            joy: (traits.optimism + traits.emotional_stability) / 2,
            surprise: (100 - traits.pattern_recognition) * 0.7,
            sadness: (traits.pessimism + (100 - traits.emotional_stability)) / 2,
            anxiety: (100 - traits.stress_tolerance + 100 - traits.emotional_stability) / 2
        };
        
        return Math.max(0, Math.min(100, baseLevels[emotion] + (Math.random() * 20 - 10)));
    }

    // Main emotional processing interface
    processEmotionalEvent(event) {
        const emotionalResponse = {
            event: event,
            timestamp: Date.now(),
            pre_emotions: { ...this.currentEmotions },
            triggered_emotions: {},
            regulation_applied: false,
            decisions_affected: [],
            memory_impact: 0
        };

        // Process the event through different emotional subsystems
        this.processVolatilityEmotions(event, emotionalResponse);
        this.processSocialEmotions(event, emotionalResponse);
        this.processCognitiveEmotions(event, emotionalResponse);
        
        // Apply emotional regulation
        this.emotionalRegulation.regulate(this.currentEmotions, event);
        
        // Update emotional state
        this.updateEmotionalState(emotionalResponse);
        
        // Record in emotional memory
        this.emotionalMemory.recordEmotionalEvent(emotionalResponse);
        
        // Update emotional history
        this.emotionalHistory.push(emotionalResponse);
        this.pruneEmotionalHistory();
        
        return {
            emotional_state: this.currentEmotions,
            response: emotionalResponse,
            recommendations: this.generateEmotionalRecommendations()
        };
    }

    processVolatilityEmotions(event, response) {
        if (event.type === 'market_volatility') {
            const volatilityResponse = this.volatilityResponses.processVolatility(
                event.data.volatility_level,
                event.data.market_direction,
                this.currentEmotions
            );
            
            Object.assign(response.triggered_emotions, volatilityResponse);
        }
    }

    processSocialEmotions(event, response) {
        if (event.type === 'social_interaction') {
            const socialResponse = this.socialEmotions.processSocialEvent(
                event.data,
                this.currentEmotions
            );
            
            Object.assign(response.triggered_emotions, socialResponse);
        }
    }

    processCognitiveEmotions(event, response) {
        if (event.type === 'decision_outcome' || event.type === 'learning_event') {
            const cognitiveResponse = this.cognitiveEmotions.processCognitiveEvent(
                event.data,
                this.currentEmotions
            );
            
            Object.assign(response.triggered_emotions, cognitiveResponse);
        }
    }

    updateEmotionalState(response) {
        // Apply triggered emotions to current state
        Object.entries(response.triggered_emotions).forEach(([emotion, change]) => {
            const currentLevel = this.currentEmotions[emotion] || 0;
            this.currentEmotions[emotion] = Math.max(0, Math.min(100, currentLevel + change));
        });
        
        // Update emotion durations
        this.updateEmotionDurations();
        
        // Calculate dominant emotion
        this.currentEmotions.dominant_emotion = this.calculateDominantEmotion();
        
        // Update meta-emotional states
        this.updateMetaEmotionalStates();
        
        this.currentEmotions.last_updated = Date.now();
    }

    updateEmotionDurations() {
        const now = Date.now();
        
        Object.keys(this.currentEmotions).forEach(emotion => {
            if (typeof this.currentEmotions[emotion] === 'number' && this.currentEmotions[emotion] > 60) {
                if (!this.currentEmotions.emotion_duration[emotion]) {
                    this.currentEmotions.emotion_duration[emotion] = now;
                }
            } else {
                delete this.currentEmotions.emotion_duration[emotion];
            }
        });
    }

    calculateDominantEmotion() {
        const emotions = ['fear', 'greed', 'anger', 'joy', 'surprise', 'sadness', 'euphoria', 'panic', 'anxiety'];
        
        let maxEmotion = 'neutral';
        let maxIntensity = 30; // Threshold for dominance
        
        emotions.forEach(emotion => {
            if (this.currentEmotions[emotion] > maxIntensity) {
                maxIntensity = this.currentEmotions[emotion];
                maxEmotion = emotion;
            }
        });
        
        return maxEmotion;
    }

    updateMetaEmotionalStates() {
        // Calculate emotional intensity
        const emotions = ['fear', 'greed', 'anger', 'joy', 'euphoria', 'panic', 'anxiety'];
        const totalIntensity = emotions.reduce((sum, emotion) => sum + this.currentEmotions[emotion], 0);
        this.currentEmotions.emotional_intensity = totalIntensity / emotions.length;
        
        // Calculate emotional clarity (inverse of conflicting emotions)
        const conflicts = this.calculateEmotionalConflicts();
        this.currentEmotions.emotional_clarity = Math.max(0, 100 - conflicts * 10);
        
        // Update emotional volatility based on recent changes
        this.currentEmotions.emotional_volatility = this.calculateEmotionalVolatility();
    }

    calculateEmotionalConflicts() {
        let conflicts = 0;
        
        // Fear vs Greed
        if (this.currentEmotions.fear > 50 && this.currentEmotions.greed > 50) conflicts++;
        
        // Joy vs Sadness
        if (this.currentEmotions.joy > 50 && this.currentEmotions.sadness > 50) conflicts++;
        
        // Confidence vs Anxiety
        if (this.currentEmotions.confidence > 70 && this.currentEmotions.anxiety > 50) conflicts++;
        
        // Euphoria vs Panic
        if (this.currentEmotions.euphoria > 50 && this.currentEmotions.panic > 50) conflicts++;
        
        return conflicts;
    }

    calculateEmotionalVolatility() {
        if (this.emotionalHistory.length < 5) return 50;
        
        const recent = this.emotionalHistory.slice(-5);
        const emotionChanges = recent.map(event => {
            const changes = Object.values(event.triggered_emotions);
            return changes.reduce((sum, change) => sum + Math.abs(change), 0);
        });
        
        const avgChange = emotionChanges.reduce((sum, change) => sum + change, 0) / emotionChanges.length;
        return Math.min(100, avgChange * 2);
    }

    // Decision impact assessment
    assessDecisionImpact(decision, context) {
        const emotionalInfluence = {
            decision_modification: 'none',
            confidence_adjustment: 0,
            risk_adjustment: 0,
            timing_adjustment: 0,
            emotional_override: false,
            reasoning: []
        };

        // Fear impact
        if (this.currentEmotions.fear > 70) {
            emotionalInfluence.risk_adjustment = -20;
            emotionalInfluence.confidence_adjustment = -15;
            emotionalInfluence.reasoning.push('High fear reducing risk tolerance');
        }

        // Greed impact
        if (this.currentEmotions.greed > 70) {
            emotionalInfluence.risk_adjustment = 15;
            emotionalInfluence.timing_adjustment = -10; // Impatient
            emotionalInfluence.reasoning.push('Greed increasing risk appetite');
        }

        // Panic impact
        if (this.currentEmotions.panic > 60) {
            emotionalInfluence.emotional_override = true;
            emotionalInfluence.decision_modification = 'exit_all_positions';
            emotionalInfluence.reasoning.push('Panic triggering emergency exit');
        }

        // Euphoria impact
        if (this.currentEmotions.euphoria > 70) {
            emotionalInfluence.risk_adjustment = 25;
            emotionalInfluence.confidence_adjustment = 20;
            emotionalInfluence.reasoning.push('Euphoria driving overconfidence');
        }

        // FOMO impact
        if (this.currentEmotions.fomo > 60 && decision.type === 'entry') {
            emotionalInfluence.timing_adjustment = -20; // Rush to enter
            emotionalInfluence.risk_adjustment = 10;
            emotionalInfluence.reasoning.push('FOMO accelerating entry decision');
        }

        // Regret impact
        if (this.currentEmotions.regret > 50) {
            emotionalInfluence.confidence_adjustment = -10;
            emotionalInfluence.decision_modification = 'increase_analysis';
            emotionalInfluence.reasoning.push('Regret causing decision paralysis');
        }

        // Emotional clarity impact
        if (this.currentEmotions.emotional_clarity < 40) {
            emotionalInfluence.decision_modification = 'delay_decision';
            emotionalInfluence.reasoning.push('Low emotional clarity suggests delaying decision');
        }

        return emotionalInfluence;
    }

    // Emotional regulation and coping
    applyEmotionalCoping(stressor) {
        const copingStrategies = this.emotionalRegulation.getCopingStrategies(
            stressor,
            this.currentEmotions,
            this.personality.traits
        );

        copingStrategies.forEach(strategy => {
            this.applyCopingStrategy(strategy);
        });

        return copingStrategies;
    }

    applyCopingStrategy(strategy) {
        switch(strategy.type) {
            case 'cognitive_reframing':
                this.currentEmotions.anxiety = Math.max(0, this.currentEmotions.anxiety - strategy.effectiveness);
                this.currentEmotions.confidence = Math.min(100, this.currentEmotions.confidence + strategy.effectiveness * 0.5);
                break;
                
            case 'emotional_dampening':
                Object.keys(this.currentEmotions).forEach(emotion => {
                    if (typeof this.currentEmotions[emotion] === 'number' && this.currentEmotions[emotion] > 70) {
                        this.currentEmotions[emotion] *= (1 - strategy.effectiveness / 100);
                    }
                });
                break;
                
            case 'focus_redirection':
                this.currentEmotions.emotional_clarity = Math.min(100, this.currentEmotions.emotional_clarity + strategy.effectiveness);
                break;
                
            case 'social_support_seeking':
                this.currentEmotions.trust = Math.min(100, this.currentEmotions.trust + strategy.effectiveness * 0.3);
                this.currentEmotions.anxiety = Math.max(0, this.currentEmotions.anxiety - strategy.effectiveness * 0.4);
                break;
        }
    }

    // Emotional learning and adaptation
    learnFromEmotionalOutcome(emotion, decision, outcome) {
        const learning = {
            emotion_pre_decision: emotion,
            decision: decision,
            outcome: outcome,
            emotional_accuracy: this.assessEmotionalAccuracy(emotion, outcome),
            adjustment_needed: this.calculateEmotionalAdjustment(emotion, outcome),
            timestamp: Date.now()
        };

        this.emotionalMemory.recordEmotionalLearning(learning);
        
        // Apply learning to future emotional responses
        this.calibrateEmotionalResponses(learning);
        
        return learning;
    }

    assessEmotionalAccuracy(emotion, outcome) {
        // How well did emotions predict the outcome?
        let accuracy = 50;
        
        if (emotion.fear > 70 && outcome.includes('loss')) accuracy += 30;
        if (emotion.greed > 70 && outcome.includes('excessive_risk')) accuracy += 25;
        if (emotion.confidence > 80 && outcome.includes('success')) accuracy += 20;
        if (emotion.anxiety > 60 && outcome.includes('avoided_danger')) accuracy += 25;
        
        // Penalty for emotional overreaction
        if (emotion.emotional_intensity > 80 && outcome.includes('minor')) accuracy -= 20;
        
        return Math.max(0, Math.min(100, accuracy));
    }

    calculateEmotionalAdjustment(emotion, outcome) {
        const adjustments = {};
        
        // If fear was too high for a positive outcome
        if (emotion.fear > 70 && outcome.includes('success')) {
            adjustments.fear_sensitivity = -5;
        }
        
        // If greed led to losses
        if (emotion.greed > 70 && outcome.includes('loss')) {
            adjustments.greed_regulation = 10;
        }
        
        // If overconfidence led to failure
        if (emotion.confidence > 85 && outcome.includes('failure')) {
            adjustments.confidence_calibration = -8;
        }
        
        return adjustments;
    }

    calibrateEmotionalResponses(learning) {
        // Adjust emotional response patterns based on learning
        if (learning.adjustment_needed.fear_sensitivity) {
            this.volatilityResponses.adjustFearSensitivity(learning.adjustment_needed.fear_sensitivity);
        }
        
        if (learning.adjustment_needed.greed_regulation) {
            this.cognitiveEmotions.adjustGreedRegulation(learning.adjustment_needed.greed_regulation);
        }
    }

    // Emotional state queries
    getEmotionalProfile() {
        return {
            current_emotions: this.currentEmotions,
            dominant_emotion: this.currentEmotions.dominant_emotion,
            emotional_stability: this.calculateEmotionalStability(),
            decision_readiness: this.assessDecisionReadiness(),
            emotional_risks: this.identifyEmotionalRisks(),
            coping_capacity: this.assessCopingCapacity()
        };
    }

    calculateEmotionalStability() {
        const volatility = this.currentEmotions.emotional_volatility;
        const clarity = this.currentEmotions.emotional_clarity;
        const intensity = this.currentEmotions.emotional_intensity;
        
        return (100 - volatility) * 0.4 + clarity * 0.4 + (100 - intensity) * 0.2;
    }

    assessDecisionReadiness() {
        let readiness = 100;
        
        // High emotional intensity reduces readiness
        if (this.currentEmotions.emotional_intensity > 80) readiness -= 30;
        
        // Low emotional clarity reduces readiness
        if (this.currentEmotions.emotional_clarity < 40) readiness -= 25;
        
        // Specific emotional states that impair decisions
        if (this.currentEmotions.panic > 50) readiness -= 40;
        if (this.currentEmotions.euphoria > 70) readiness -= 20;
        if (this.currentEmotions.anger > 60) readiness -= 15;
        
        return Math.max(0, readiness);
    }

    identifyEmotionalRisks() {
        const risks = [];
        
        if (this.currentEmotions.greed > 70 && this.currentEmotions.fear < 30) {
            risks.push({
                type: 'excessive_risk_taking',
                probability: 0.8,
                impact: 'high',
                mitigation: 'Implement stricter risk controls'
            });
        }
        
        if (this.currentEmotions.panic > 60) {
            risks.push({
                type: 'panic_selling',
                probability: 0.9,
                impact: 'very_high',
                mitigation: 'Emergency cooling-off period required'
            });
        }
        
        if (this.currentEmotions.fomo > 70) {
            risks.push({
                type: 'impulsive_entry',
                probability: 0.7,
                impact: 'medium',
                mitigation: 'Mandatory analysis delay'
            });
        }
        
        if (this.currentEmotions.regret > 60) {
            risks.push({
                type: 'decision_paralysis',
                probability: 0.6,
                impact: 'medium',
                mitigation: 'Structured decision framework'
            });
        }
        
        return risks;
    }

    assessCopingCapacity() {
        const emotionalStability = this.personality.traits.emotional_stability;
        const stressTolerance = this.personality.traits.stress_tolerance;
        const currentStress = this.currentEmotions.emotional_intensity;
        
        return (emotionalStability + stressTolerance) / 2 - currentStress * 0.3;
    }

    generateEmotionalRecommendations() {
        const recommendations = [];
        
        const readiness = this.assessDecisionReadiness();
        if (readiness < 50) {
            recommendations.push({
                type: 'decision_delay',
                urgency: 'high',
                message: 'Emotional state not optimal for trading decisions',
                suggested_delay: Math.round((50 - readiness) * 2) + ' minutes'
            });
        }
        
        const risks = this.identifyEmotionalRisks();
        risks.forEach(risk => {
            recommendations.push({
                type: 'risk_mitigation',
                urgency: risk.impact === 'very_high' ? 'critical' : 'medium',
                message: risk.mitigation,
                risk_type: risk.type
            });
        });
        
        if (this.currentEmotions.emotional_intensity > 70) {
            recommendations.push({
                type: 'emotional_regulation',
                urgency: 'medium',
                message: 'Consider emotional regulation techniques',
                suggested_techniques: this.emotionalRegulation.recommendTechniques(this.currentEmotions)
            });
        }
        
        return recommendations;
    }

    // Utility methods
    pruneEmotionalHistory() {
        if (this.emotionalHistory.length > 100) {
            this.emotionalHistory = this.emotionalHistory.slice(-100);
        }
    }

    // Decay emotions over time
    applyEmotionalDecay(timePassed) {
        const decayRates = {
            panic: 0.95,    // Fast decay
            euphoria: 0.92, // Fast decay
            anger: 0.90,    // Medium decay
            fomo: 0.93,     // Fast decay
            regret: 0.85,   // Slow decay
            fear: 0.88,     // Medium decay
            greed: 0.96,    // Very slow decay
            anxiety: 0.87   // Medium decay
        };
        
        Object.entries(decayRates).forEach(([emotion, rate]) => {
            if (this.currentEmotions[emotion]) {
                this.currentEmotions[emotion] *= Math.pow(rate, timePassed);
            }
        });
    }
}

// Supporting emotion processing engines

class VolatilityEmotionEngine {
    constructor(personalityDNA) {
        this.personality = personalityDNA;
        this.fearSensitivity = this.calculateFearSensitivity();
        this.excitementSensitivity = this.calculateExcitementSensitivity();
    }

    processVolatility(volatilityLevel, direction, currentEmotions) {
        const response = {};
        
        // Fear response to high volatility
        if (volatilityLevel > 60) {
            const fearIncrease = (volatilityLevel - 60) * this.fearSensitivity * 0.5;
            response.fear = fearIncrease;
            response.anxiety = fearIncrease * 0.8;
        }
        
        // Excitement response for risk-seekers
        if (volatilityLevel > 70 && this.personality.traits.risk_tolerance > 70) {
            response.euphoria = (volatilityLevel - 70) * this.excitementSensitivity * 0.3;
        }
        
        // Panic threshold
        if (volatilityLevel > 85 && currentEmotions.fear > 60) {
            response.panic = Math.min(40, (volatilityLevel - 85) * 2);
        }
        
        // FOMO during rapid upward movement
        if (direction > 20 && volatilityLevel > 50) {
            response.fomo = Math.min(30, direction * 0.8);
        }
        
        return response;
    }

    calculateFearSensitivity() {
        return (this.personality.traits.fear + (100 - this.personality.traits.risk_tolerance)) / 200;
    }

    calculateExcitementSensitivity() {
        return (this.personality.traits.risk_tolerance + this.personality.traits.optimism) / 200;
    }

    adjustFearSensitivity(adjustment) {
        this.fearSensitivity = Math.max(0.1, Math.min(2.0, this.fearSensitivity + adjustment * 0.01));
    }
}

class SocialEmotionEngine {
    constructor(personalityDNA) {
        this.personality = personalityDNA;
    }

    processSocialEvent(eventData, currentEmotions) {
        const response = {};
        
        switch(eventData.type) {
            case 'betrayal':
                response.anger = Math.min(50, eventData.severity * 0.8);
                response.trust = -Math.min(30, eventData.severity * 0.6);
                response.sadness = Math.min(25, eventData.severity * 0.4);
                break;
                
            case 'cooperation_success':
                response.joy = Math.min(30, eventData.benefit * 0.5);
                response.trust = Math.min(20, eventData.benefit * 0.3);
                response.confidence = Math.min(15, eventData.benefit * 0.2);
                break;
                
            case 'social_rejection':
                response.sadness = Math.min(40, eventData.intensity * 0.7);
                response.anger = Math.min(25, eventData.intensity * 0.4);
                break;
                
            case 'reputation_damage':
                response.shame = Math.min(45, eventData.damage * 0.8);
                response.anxiety = Math.min(35, eventData.damage * 0.6);
                break;
        }
        
        return response;
    }
}

class CognitiveEmotionEngine {
    constructor(personalityDNA) {
        this.personality = personalityDNA;
        this.greedRegulation = this.calculateGreedRegulation();
    }

    processCognitiveEvent(eventData, currentEmotions) {
        const response = {};
        
        switch(eventData.type) {
            case 'large_profit':
                response.euphoria = Math.min(40, eventData.amount * 0.001);
                response.greed = Math.min(30, eventData.amount * 0.0008);
                response.confidence = Math.min(25, eventData.amount * 0.0005);
                break;
                
            case 'large_loss':
                response.regret = Math.min(50, Math.abs(eventData.amount) * 0.001);
                response.fear = Math.min(35, Math.abs(eventData.amount) * 0.0008);
                response.sadness = Math.min(30, Math.abs(eventData.amount) * 0.0006);
                break;
                
            case 'missed_opportunity':
                response.regret = Math.min(40, eventData.missed_profit * 0.0008);
                response.fomo = Math.min(35, eventData.missed_profit * 0.0007);
                break;
                
            case 'successful_prediction':
                response.pride = Math.min(30, eventData.accuracy);
                response.confidence = Math.min(20, eventData.accuracy * 0.3);
                break;
                
            case 'failed_prediction':
                response.shame = Math.min(25, (100 - eventData.accuracy) * 0.3);
                response.confidence = -Math.min(15, (100 - eventData.accuracy) * 0.2);
                break;
        }
        
        return response;
    }

    calculateGreedRegulation() {
        return (this.personality.traits.discipline + this.personality.traits.emotional_stability) / 200;
    }

    adjustGreedRegulation(adjustment) {
        this.greedRegulation = Math.max(0.1, Math.min(1.0, this.greedRegulation + adjustment * 0.01));
    }
}

class EmotionalRegulationSystem {
    constructor(personalityDNA) {
        this.personality = personalityDNA;
        this.regulationCapacity = this.calculateRegulationCapacity();
    }

    regulate(emotions, trigger) {
        const regulationActions = [];
        
        // Panic regulation
        if (emotions.panic > 70) {
            const reduction = this.regulationCapacity * 30;
            emotions.panic = Math.max(0, emotions.panic - reduction);
            regulationActions.push({ type: 'panic_dampening', effectiveness: reduction });
        }
        
        // Euphoria regulation
        if (emotions.euphoria > 80) {
            const reduction = this.regulationCapacity * 20;
            emotions.euphoria = Math.max(0, emotions.euphoria - reduction);
            regulationActions.push({ type: 'euphoria_dampening', effectiveness: reduction });
        }
        
        // Anger regulation
        if (emotions.anger > 60) {
            const reduction = this.regulationCapacity * 25;
            emotions.anger = Math.max(0, emotions.anger - reduction);
            regulationActions.push({ type: 'anger_management', effectiveness: reduction });
        }
        
        return regulationActions;
    }

    getCopingStrategies(stressor, emotions, traits) {
        const strategies = [];
        
        if (emotions.anxiety > 70) {
            strategies.push({
                type: 'cognitive_reframing',
                effectiveness: traits.analytical_thinking * 0.5,
                description: 'Reframe situation analytically'
            });
        }
        
        if (emotions.emotional_intensity > 80) {
            strategies.push({
                type: 'emotional_dampening',
                effectiveness: this.regulationCapacity * 40,
                description: 'Apply emotional dampening techniques'
            });
        }
        
        if (emotions.emotional_clarity < 40) {
            strategies.push({
                type: 'focus_redirection',
                effectiveness: traits.discipline * 0.6,
                description: 'Redirect focus to clear thinking'
            });
        }
        
        return strategies;
    }

    recommendTechniques(emotions) {
        const techniques = [];
        
        if (emotions.anxiety > 60) techniques.push('deep_breathing');
        if (emotions.anger > 50) techniques.push('progressive_relaxation');
        if (emotions.panic > 40) techniques.push('grounding_techniques');
        if (emotions.emotional_intensity > 70) techniques.push('mindfulness_meditation');
        
        return techniques;
    }

    calculateRegulationCapacity() {
        return (this.personality.traits.emotional_stability + 
                this.personality.traits.discipline + 
                this.personality.traits.stress_tolerance) / 300;
    }
}

class EmotionalMemorySystem {
    constructor() {
        this.emotionalEvents = [];
        this.emotionalLearnings = [];
        this.emotionalPatterns = new Map();
    }

    recordEmotionalEvent(event) {
        this.emotionalEvents.push(event);
        
        if (this.emotionalEvents.length > 200) {
            this.emotionalEvents.shift();
        }
        
        this.updateEmotionalPatterns(event);
    }

    recordEmotionalLearning(learning) {
        this.emotionalLearnings.push(learning);
        
        if (this.emotionalLearnings.length > 100) {
            this.emotionalLearnings.shift();
        }
    }

    updateEmotionalPatterns(event) {
        const patternKey = `${event.event.type}_${event.pre_emotions.dominant_emotion}`;
        
        if (!this.emotionalPatterns.has(patternKey)) {
            this.emotionalPatterns.set(patternKey, {
                frequency: 0,
                outcomes: [],
                avg_regulation_success: 0
            });
        }
        
        const pattern = this.emotionalPatterns.get(patternKey);
        pattern.frequency++;
        pattern.outcomes.push(event.regulation_applied);
        
        // Calculate average regulation success
        const successes = pattern.outcomes.filter(o => o).length;
        pattern.avg_regulation_success = successes / pattern.outcomes.length;
    }

    getEmotionalInsights() {
        return {
            total_events: this.emotionalEvents.length,
            patterns_discovered: this.emotionalPatterns.size,
            regulation_effectiveness: this.calculateOverallRegulationEffectiveness(),
            most_common_trigger: this.getMostCommonTrigger(),
            emotional_growth: this.calculateEmotionalGrowth()
        };
    }

    calculateOverallRegulationEffectiveness() {
        const regulatedEvents = this.emotionalEvents.filter(e => e.regulation_applied);
        return (regulatedEvents.length / this.emotionalEvents.length) * 100;
    }

    getMostCommonTrigger() {
        const triggerCounts = {};
        this.emotionalEvents.forEach(event => {
            const trigger = event.event.type;
            triggerCounts[trigger] = (triggerCounts[trigger] || 0) + 1;
        });
        
        return Object.entries(triggerCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'none';
    }

    calculateEmotionalGrowth() {
        if (this.emotionalLearnings.length < 10) return 50;
        
        const recent = this.emotionalLearnings.slice(-10);
        const older = this.emotionalLearnings.slice(-20, -10);
        
        const recentAccuracy = recent.reduce((sum, l) => sum + l.emotional_accuracy, 0) / recent.length;
        const olderAccuracy = older.reduce((sum, l) => sum + l.emotional_accuracy, 0) / older.length;
        
        return ((recentAccuracy - olderAccuracy) / olderAccuracy) * 100 + 50;
    }
}

module.exports = EmotionalResponseSystem;
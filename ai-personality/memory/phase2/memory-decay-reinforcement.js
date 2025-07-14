/**
 * Phase 2 Memory Decay and Reinforcement Engine
 * Sophisticated memory decay modeling with reinforcement learning
 */

class MemoryDecayReinforcement {
    constructor() {
        this.decayModels = new Map();
        this.reinforcementHistory = [];
        this.forgettingCurves = new Map();
        this.strengtheningSessions = [];
        
        // Decay parameters based on memory science
        this.decayParams = {
            // Ebbinghaus forgetting curve parameters
            ebbinghaus: {
                initial_retention: 100,
                decay_constant: 1.84,
                time_constant: 1.25, // hours
                asymptotic_retention: 20
            },
            
            // Bahrick's permastore model parameters
            permastore: {
                initial_decay_rate: 0.3,
                permastore_threshold: 25,
                permastore_decay_rate: 0.02,
                transition_time: 168 // hours (1 week)
            },
            
            // Spacing effect parameters
            spacing_effect: {
                optimal_intervals: [0.25, 1, 3, 9, 27], // hours
                spacing_multiplier: 1.3,
                max_interval: 8760, // hours (1 year)
                min_interval: 0.1 // hours (6 minutes)
            },
            
            // Testing effect parameters
            testing_effect: {
                retrieval_strength_bonus: 1.4,
                failed_retrieval_penalty: 0.8,
                successful_retrieval_bonus: 1.2,
                desirable_difficulty_range: [0.5, 0.8]
            }
        };
        
        // Memory type specific decay rates
        this.memoryTypeDecay = {
            episodic: {
                base_decay_rate: 0.85,
                emotional_modifier: 0.15,
                rehearsal_protection: 0.3,
                interference_susceptibility: 0.7
            },
            semantic: {
                base_decay_rate: 0.95,
                emotional_modifier: 0.05,
                rehearsal_protection: 0.5,
                interference_susceptibility: 0.3
            },
            procedural: {
                base_decay_rate: 0.98,
                emotional_modifier: 0.02,
                rehearsal_protection: 0.8,
                interference_susceptibility: 0.1
            },
            flashbulb: {
                base_decay_rate: 0.75,
                emotional_modifier: 0.25,
                rehearsal_protection: 0.9,
                interference_susceptibility: 0.2
            },
            traumatic: {
                base_decay_rate: 0.65,
                emotional_modifier: 0.35,
                rehearsal_protection: 0.95,
                interference_susceptibility: 0.1
            }
        };
        
        // Reinforcement strategies
        this.reinforcementStrategies = {
            spaced_repetition: {
                algorithm: 'SM-2', // SuperMemo algorithm
                ease_factor: 2.5,
                interval_modifier: 1.3,
                minimum_ease: 1.3,
                maximum_ease: 4.0
            },
            active_recall: {
                difficulty_adjustment: 0.15,
                success_bonus: 1.2,
                failure_penalty: 0.6,
                confidence_threshold: 0.8
            },
            elaborative_rehearsal: {
                association_strength_bonus: 1.4,
                depth_processing_bonus: 1.3,
                meaning_connection_bonus: 1.5
            },
            interleaving: {
                switching_bonus: 1.1,
                discrimination_improvement: 1.25,
                confusion_penalty: 0.9
            }
        };
        
        // Forgetting factors
        this.forgettingFactors = {
            interference: {
                proactive: 0.8,  // Old learning interferes with new
                retroactive: 0.85 // New learning interferes with old
            },
            consolidation_failure: 0.7,
            retrieval_failure: 0.9,
            context_dependency: 0.8,
            state_dependency: 0.85,
            motivated_forgetting: 0.6
        };
    }
    
    // Main decay and reinforcement processing
    processMemoryDecayReinforcement(memories, timeElapsed) {
        const results = {
            processed_memories: [],
            decay_analysis: {},
            reinforcement_opportunities: [],
            forgetting_predictions: {},
            optimization_suggestions: []
        };
        
        for (const memory of memories) {
            // Calculate current memory strength
            const currentStrength = this.calculateCurrentMemoryStrength(memory, timeElapsed);
            
            // Apply decay models
            const decayAnalysis = this.applyDecayModels(memory, timeElapsed);
            
            // Identify reinforcement needs
            const reinforcementNeeds = this.identifyReinforcementNeeds(memory, currentStrength);
            
            // Generate reinforcement schedule
            const reinforcementSchedule = this.generateReinforcementSchedule(memory, reinforcementNeeds);
            
            // Predict future forgetting
            const forgettingPrediction = this.predictForgetting(memory, decayAnalysis);
            
            const processedMemory = {
                ...memory,
                current_strength: currentStrength,
                decay_analysis: decayAnalysis,
                reinforcement_needs: reinforcementNeeds,
                reinforcement_schedule: reinforcementSchedule,
                forgetting_prediction: forgettingPrediction,
                last_decay_update: Date.now()
            };
            
            results.processed_memories.push(processedMemory);
            
            if (reinforcementNeeds.requires_reinforcement) {
                results.reinforcement_opportunities.push({
                    memory_id: memory.id,
                    urgency: reinforcementNeeds.urgency,
                    strategy: reinforcementNeeds.recommended_strategy,
                    timing: reinforcementSchedule.next_session
                });
            }
        }
        
        results.decay_analysis = this.analyzeOverallDecay(results.processed_memories);
        results.forgetting_predictions = this.generateForgettingPredictions(results.processed_memories);
        results.optimization_suggestions = this.generateOptimizationSuggestions(results.processed_memories);
        
        return results;
    }
    
    calculateCurrentMemoryStrength(memory, timeElapsed) {
        const memoryType = memory.type || 'episodic';
        const typeParams = this.memoryTypeDecay[memoryType] || this.memoryTypeDecay.episodic;
        
        let strength = memory.initial_strength || 100;
        
        // Apply base decay
        const timeInDays = timeElapsed / (24 * 60 * 60 * 1000);
        const baseDecay = Math.exp(-timeInDays / (typeParams.base_decay_rate * 30)); // 30-day baseline
        strength *= baseDecay;
        
        // Apply emotional modifiers
        if (memory.emotional_profile) {
            const emotionalBonus = memory.emotional_profile.intensity * typeParams.emotional_modifier / 100;
            strength *= (1 + emotionalBonus);
        }
        
        // Apply rehearsal protection
        if (memory.rehearsal_count) {
            const rehearsalProtection = Math.min(0.9, memory.rehearsal_count * typeParams.rehearsal_protection / 10);
            strength *= (1 + rehearsalProtection);
        }
        
        // Apply interference effects
        const interferenceEffect = this.calculateInterferenceEffect(memory);
        strength *= (1 - interferenceEffect * typeParams.interference_susceptibility);
        
        return Math.max(0, Math.min(100, strength));
    }
    
    applyDecayModels(memory, timeElapsed) {
        const models = {};
        
        // Ebbinghaus forgetting curve
        models.ebbinghaus = this.applyEbbinghausCurve(memory, timeElapsed);
        
        // Bahrick permastore model
        models.permastore = this.applyPermastoreModel(memory, timeElapsed);
        
        // Power law of forgetting
        models.power_law = this.applyPowerLawForgetting(memory, timeElapsed);
        
        // Exponential decay with consolidation
        models.consolidation = this.applyConsolidationDecay(memory, timeElapsed);
        
        // Select best fitting model
        const bestModel = this.selectBestDecayModel(memory, models);
        
        return {
            models: models,
            best_model: bestModel,
            predicted_strength: models[bestModel].predicted_strength,
            decay_rate: models[bestModel].decay_rate,
            half_life: models[bestModel].half_life
        };
    }
    
    applyEbbinghausCurve(memory, timeElapsed) {
        const params = this.decayParams.ebbinghaus;
        const timeInHours = timeElapsed / (60 * 60 * 1000);
        
        // R(t) = (100-c) * exp(-t/s) + c
        const retention = (params.initial_retention - params.asymptotic_retention) * 
                         Math.exp(-timeInHours / params.time_constant) + 
                         params.asymptotic_retention;
        
        return {
            model_name: 'ebbinghaus',
            predicted_strength: retention,
            decay_rate: params.decay_constant,
            half_life: params.time_constant * Math.log(2),
            model_fit: this.calculateModelFit(memory, retention)
        };
    }
    
    applyPermastoreModel(memory, timeElapsed) {
        const params = this.decayParams.permastore;
        const timeInHours = timeElapsed / (60 * 60 * 1000);
        
        let retention;
        if (timeInHours < params.transition_time) {
            // Initial rapid decay
            retention = 100 * Math.exp(-params.initial_decay_rate * timeInHours / 24);
        } else {
            // Permastore phase with very slow decay
            const transitionRetention = 100 * Math.exp(-params.initial_decay_rate * params.transition_time / 24);
            const permastoreTime = timeInHours - params.transition_time;
            retention = Math.max(params.permastore_threshold, 
                               transitionRetention * Math.exp(-params.permastore_decay_rate * permastoreTime / 8760));
        }
        
        return {
            model_name: 'permastore',
            predicted_strength: retention,
            decay_rate: timeInHours < params.transition_time ? params.initial_decay_rate : params.permastore_decay_rate,
            half_life: timeInHours < params.transition_time ? 24 / params.initial_decay_rate : 8760 / params.permastore_decay_rate,
            model_fit: this.calculateModelFit(memory, retention)
        };
    }
    
    applyPowerLawForgetting(memory, timeElapsed) {
        const timeInDays = timeElapsed / (24 * 60 * 60 * 1000);
        const alpha = memory.power_law_alpha || 0.5; // Forgetting rate parameter
        const beta = memory.power_law_beta || 100;   // Initial strength parameter
        
        // R(t) = β * t^(-α)
        const retention = timeInDays > 0 ? beta * Math.pow(timeInDays, -alpha) : beta;
        
        return {
            model_name: 'power_law',
            predicted_strength: Math.min(100, retention),
            decay_rate: alpha,
            half_life: Math.pow(2, 1/alpha), // Days for 50% retention
            model_fit: this.calculateModelFit(memory, Math.min(100, retention))
        };
    }
    
    applyConsolidationDecay(memory, timeElapsed) {
        const timeInHours = timeElapsed / (60 * 60 * 1000);
        const consolidationLevel = memory.consolidation_level || 0.5;
        
        // Two-phase decay: fast initial decay, then slow consolidated decay
        const fastDecayRate = 0.1;  // per hour
        const slowDecayRate = 0.001; // per hour
        const consolidationStrength = consolidationLevel;
        
        const fastComponent = (1 - consolidationStrength) * Math.exp(-fastDecayRate * timeInHours);
        const slowComponent = consolidationStrength * Math.exp(-slowDecayRate * timeInHours);
        
        const retention = (fastComponent + slowComponent) * 100;
        
        return {
            model_name: 'consolidation',
            predicted_strength: retention,
            decay_rate: consolidationStrength < 0.5 ? fastDecayRate : slowDecayRate,
            half_life: consolidationStrength < 0.5 ? Math.log(2) / fastDecayRate : Math.log(2) / slowDecayRate,
            model_fit: this.calculateModelFit(memory, retention)
        };
    }
    
    selectBestDecayModel(memory, models) {
        // Select model with best fit to historical data
        let bestModel = 'ebbinghaus'; // default
        let bestFit = 0;
        
        for (const [modelName, modelData] of Object.entries(models)) {
            if (modelData.model_fit > bestFit) {
                bestFit = modelData.model_fit;
                bestModel = modelName;
            }
        }
        
        return bestModel;
    }
    
    identifyReinforcementNeeds(memory, currentStrength) {
        const criticalThreshold = 30;
        const warningThreshold = 50;
        
        let requiresReinforcement = false;
        let urgency = 'low';
        let recommendedStrategy = 'maintenance';
        
        if (currentStrength < criticalThreshold) {
            requiresReinforcement = true;
            urgency = 'critical';
            recommendedStrategy = 'intensive_recall';
        } else if (currentStrength < warningThreshold) {
            requiresReinforcement = true;
            urgency = 'moderate';
            recommendedStrategy = 'spaced_repetition';
        } else if (memory.importance > 80) {
            // Important memories get proactive reinforcement
            requiresReinforcement = true;
            urgency = 'preventive';
            recommendedStrategy = 'maintenance_rehearsal';
        }
        
        return {
            requires_reinforcement: requiresReinforcement,
            urgency: urgency,
            recommended_strategy: recommendedStrategy,
            current_strength: currentStrength,
            strength_trend: this.calculateStrengthTrend(memory),
            reinforcement_effectiveness: this.predictReinforcementEffectiveness(memory, recommendedStrategy)
        };
    }
    
    generateReinforcementSchedule(memory, reinforcementNeeds) {
        if (!reinforcementNeeds.requires_reinforcement) {
            return { schedule: [], next_session: null };
        }
        
        const strategy = reinforcementNeeds.recommended_strategy;
        const schedule = [];
        
        switch (strategy) {
            case 'spaced_repetition':
                schedule.push(...this.generateSpacedRepetitionSchedule(memory));
                break;
            case 'intensive_recall':
                schedule.push(...this.generateIntensiveRecallSchedule(memory));
                break;
            case 'maintenance_rehearsal':
                schedule.push(...this.generateMaintenanceSchedule(memory));
                break;
        }
        
        return {
            schedule: schedule,
            next_session: schedule.length > 0 ? schedule[0] : null,
            total_sessions: schedule.length,
            estimated_duration: this.estimateScheduleDuration(schedule)
        };
    }
    
    generateSpacedRepetitionSchedule(memory) {
        const intervals = this.decayParams.spacing_effect.optimal_intervals;
        const schedule = [];
        const now = Date.now();
        
        let currentEaseFactor = memory.ease_factor || this.reinforcementStrategies.spaced_repetition.ease_factor;
        let currentInterval = intervals[0];
        
        for (let i = 0; i < 5; i++) { // Generate 5 review sessions
            const sessionTime = now + (currentInterval * 60 * 60 * 1000); // Convert hours to ms
            
            schedule.push({
                session_number: i + 1,
                scheduled_time: sessionTime,
                interval_hours: currentInterval,
                ease_factor: currentEaseFactor,
                expected_difficulty: this.predictDifficulty(memory, currentInterval),
                session_type: 'spaced_repetition'
            });
            
            // Calculate next interval using SM-2 algorithm
            currentInterval *= currentEaseFactor;
            currentEaseFactor = Math.max(
                this.reinforcementStrategies.spaced_repetition.minimum_ease,
                currentEaseFactor - 0.02
            );
        }
        
        return schedule;
    }
    
    generateIntensiveRecallSchedule(memory) {
        const schedule = [];
        const now = Date.now();
        const sessionIntervals = [0.1, 0.5, 2, 6, 24]; // Hours
        
        sessionIntervals.forEach((interval, index) => {
            schedule.push({
                session_number: index + 1,
                scheduled_time: now + (interval * 60 * 60 * 1000),
                interval_hours: interval,
                intensity: 'high',
                session_type: 'intensive_recall',
                focus_areas: this.identifyWeakAreas(memory)
            });
        });
        
        return schedule;
    }
    
    generateMaintenanceSchedule(memory) {
        const schedule = [];
        const now = Date.now();
        const maintenanceInterval = 7 * 24; // Weekly maintenance
        
        for (let week = 1; week <= 4; week++) {
            schedule.push({
                session_number: week,
                scheduled_time: now + (week * maintenanceInterval * 60 * 60 * 1000),
                interval_hours: maintenanceInterval,
                intensity: 'low',
                session_type: 'maintenance',
                duration_minutes: 5
            });
        }
        
        return schedule;
    }
    
    predictForgetting(memory, decayAnalysis) {
        const predictions = {};
        const timeHorizons = [1, 7, 30, 90, 365]; // Days
        
        timeHorizons.forEach(days => {
            const timeInMs = days * 24 * 60 * 60 * 1000;
            const predictedStrength = this.extrapolateDecay(memory, decayAnalysis, timeInMs);
            
            predictions[`${days}_days`] = {
                predicted_strength: predictedStrength,
                forgetting_probability: this.calculateForgettingProbability(predictedStrength),
                confidence_interval: this.calculateConfidenceInterval(predictedStrength),
                intervention_needed: predictedStrength < 30
            };
        });
        
        return predictions;
    }
    
    // Reinforcement execution methods
    executeReinforcement(memory, strategy, sessionParams = {}) {
        const session = {
            memory_id: memory.id,
            strategy: strategy,
            timestamp: Date.now(),
            parameters: sessionParams,
            results: {}
        };
        
        switch (strategy) {
            case 'spaced_repetition':
                session.results = this.executeSpacedRepetition(memory, sessionParams);
                break;
            case 'active_recall':
                session.results = this.executeActiveRecall(memory, sessionParams);
                break;
            case 'elaborative_rehearsal':
                session.results = this.executeElaborativeRehearsal(memory, sessionParams);
                break;
            case 'interleaving':
                session.results = this.executeInterleaving(memory, sessionParams);
                break;
        }
        
        // Update memory strength based on reinforcement
        this.updateMemoryStrength(memory, session.results);
        
        // Store session for learning
        this.reinforcementHistory.push(session);
        
        return session;
    }
    
    executeSpacedRepetition(memory, params) {
        const difficulty = params.difficulty || this.predictDifficulty(memory, params.interval_hours);
        const success = Math.random() > difficulty; // Simulate retrieval attempt
        
        let strengthGain = 0;
        let newEaseFactor = memory.ease_factor || 2.5;
        
        if (success) {
            strengthGain = 15 + (1 - difficulty) * 10;
            newEaseFactor = Math.min(4.0, newEaseFactor + 0.1);
        } else {
            strengthGain = -5;
            newEaseFactor = Math.max(1.3, newEaseFactor - 0.2);
        }
        
        return {
            success: success,
            difficulty: difficulty,
            strength_gain: strengthGain,
            new_ease_factor: newEaseFactor,
            next_interval: this.calculateNextInterval(params.interval_hours, newEaseFactor, success)
        };
    }
    
    executeActiveRecall(memory, params) {
        const recallAttempts = params.attempts || 3;
        const results = [];
        let totalStrengthGain = 0;
        
        for (let i = 0; i < recallAttempts; i++) {
            const difficulty = 0.3 + (i * 0.2); // Increasing difficulty
            const success = Math.random() > difficulty;
            
            const strengthGain = success ? 8 : -2;
            totalStrengthGain += strengthGain;
            
            results.push({
                attempt: i + 1,
                success: success,
                difficulty: difficulty,
                strength_gain: strengthGain
            });
        }
        
        return {
            attempts: results,
            total_strength_gain: totalStrengthGain,
            success_rate: results.filter(r => r.success).length / recallAttempts,
            confidence_improvement: totalStrengthGain > 0 ? 10 : -5
        };
    }
    
    executeElaborativeRehearsal(memory, params) {
        const elaborations = params.elaborations || 3;
        let strengthGain = 5; // Base gain for elaboration
        
        // Bonus for creating meaningful connections
        strengthGain += elaborations * 3;
        
        // Bonus for depth of processing
        if (params.depth === 'deep') {
            strengthGain *= 1.5;
        }
        
        return {
            elaborations_created: elaborations,
            depth_level: params.depth || 'moderate',
            strength_gain: strengthGain,
            understanding_improvement: elaborations * 2,
            transfer_potential: strengthGain / 10
        };
    }
    
    executeInterleaving(memory, params) {
        const relatedMemories = params.related_memories || [];
        const switchingBonus = relatedMemories.length * 2;
        
        let strengthGain = 6 + switchingBonus;
        
        // Penalty for confusion
        if (Math.random() < 0.3) {
            strengthGain *= 0.8;
        }
        
        return {
            memories_interleaved: relatedMemories.length,
            switching_bonus: switchingBonus,
            strength_gain: strengthGain,
            discrimination_improvement: switchingBonus,
            confusion_occurred: strengthGain < 6
        };
    }
    
    updateMemoryStrength(memory, reinforcementResults) {
        const strengthGain = reinforcementResults.total_strength_gain || reinforcementResults.strength_gain || 0;
        
        memory.current_strength = Math.min(100, (memory.current_strength || 50) + strengthGain);
        memory.reinforcement_count = (memory.reinforcement_count || 0) + 1;
        memory.last_reinforcement = Date.now();
        
        if (reinforcementResults.new_ease_factor) {
            memory.ease_factor = reinforcementResults.new_ease_factor;
        }
        
        // Update strength history
        memory.strength_history = memory.strength_history || [];
        memory.strength_history.push({
            timestamp: Date.now(),
            strength: memory.current_strength,
            method: 'reinforcement'
        });
    }
    
    // Utility methods
    calculateInterferenceEffect(memory) {
        // Simplified interference calculation
        const age = Date.now() - memory.timestamp;
        const ageInDays = age / (24 * 60 * 60 * 1000);
        
        // More recent memories experience more interference
        return Math.min(0.5, 0.1 + (1 / (ageInDays + 1)) * 0.4);
    }
    
    calculateModelFit(memory, predictedStrength) {
        if (!memory.strength_history || memory.strength_history.length === 0) {
            return 0.5; // Default fit for new memories
        }
        
        const actualStrength = memory.current_strength || 50;
        const error = Math.abs(predictedStrength - actualStrength);
        return Math.max(0, 1 - (error / 100));
    }
    
    calculateStrengthTrend(memory) {
        if (!memory.strength_history || memory.strength_history.length < 2) {
            return 'stable';
        }
        
        const recent = memory.strength_history.slice(-3);
        const trend = recent[recent.length - 1].strength - recent[0].strength;
        
        if (trend > 5) return 'increasing';
        if (trend < -5) return 'decreasing';
        return 'stable';
    }
    
    predictReinforcementEffectiveness(memory, strategy) {
        // Predict how effective a reinforcement strategy will be
        let effectiveness = 0.6; // Base effectiveness
        
        if (strategy === 'spaced_repetition' && memory.type === 'semantic') {
            effectiveness += 0.2; // Spaced repetition works well for semantic memory
        }
        
        if (strategy === 'active_recall' && memory.current_strength < 40) {
            effectiveness += 0.15; // Active recall good for weak memories
        }
        
        return Math.min(1.0, effectiveness);
    }
    
    getDecayReinorcementStats() {
        return {
            total_reinforcement_sessions: this.reinforcementHistory.length,
            avg_strength_improvement: this.calculateAvgStrengthImprovement(),
            most_effective_strategy: this.findMostEffectiveStrategy(),
            forgetting_curve_accuracy: this.calculateForgettingCurveAccuracy(),
            reinforcement_success_rate: this.calculateReinforcementSuccessRate()
        };
    }
}

module.exports = MemoryDecayReinforcement;
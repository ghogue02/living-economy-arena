/**
 * AI Trader Personality DNA System - Phase 2 Enhanced
 * Advanced psychological realism with 75+ traits, personality disorders, 
 * trait evolution, emotional intelligence, and cognitive bias modeling
 * 
 * Phase 2 Enhancements:
 * - Personality disorder spectrum modeling (Big 5 + Dark Triad + Clinical)
 * - Trait interdependencies and evolution algorithms
 * - Cultural and generational personality influences
 * - Trauma and major life event impacts
 * - Cognitive bias implementation (15+ biases)
 * - Personality stability vs plasticity dynamics
 */

class PersonalityDNA {
    constructor() {
        this.traits = this.generateFullTraitSet();
        this.dominantTraits = this.calculateDominantTraits();
        this.personalityType = this.classifyPersonalityType();
        this.tradingStyle = this.deriveTradingStyle();
    }

    generateFullTraitSet() {
        const traits = {};
        
        // Big Five Personality Model (0-100 scale)
        const bigFiveTraits = [
            'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'
        ];
        
        // Dark Triad + Additional Clinical Traits
        const darkTriadTraits = [
            'narcissism', 'machiavellianism', 'psychopathy', 'sadism',
            'borderline_tendency', 'antisocial_tendency', 'histrionic_tendency'
        ];
        
        // Core Psychological Traits (Enhanced)
        const coreTraits = [
            'risk_tolerance', 'greed', 'fear', 'patience', 'confidence', 
            'optimism', 'pessimism', 'impulsiveness', 'analytical_thinking',
            'intuition', 'emotional_stability', 'stress_tolerance',
            'self_control', 'perfectionism', 'need_for_control', 'ambition'
        ];

        // Social & Relationship Traits
        const socialTraits = [
            'trust_propensity', 'loyalty', 'vindictiveness', 'cooperation',
            'competitiveness', 'empathy', 'manipulation_tendency', 'reputation_concern',
            'network_building', 'information_sharing', 'reciprocity', 'altruism'
        ];

        // Cognitive & Learning Traits
        const cognitiveTraits = [
            'learning_speed', 'memory_retention', 'pattern_recognition', 
            'adaptability', 'curiosity', 'skepticism', 'overconfidence_bias',
            'loss_aversion', 'anchoring_bias', 'confirmation_bias', 'availability_bias'
        ];

        // Trading Specific Traits
        const tradingTraits = [
            'profit_focus', 'volume_preference', 'diversification_tendency',
            'timing_skill', 'research_depth', 'trend_following', 'contrarian_tendency',
            'momentum_trading', 'value_investing', 'speculation_appetite',
            'arbitrage_detection', 'market_making_skill', 'liquidity_providing'
        ];

        // Behavioral Traits
        const behavioralTraits = [
            'consistency', 'discipline', 'flexibility', 'persistence',
            'revenge_trading', 'herd_mentality', 'independent_thinking',
            'risk_seeking', 'loss_cutting_ability', 'profit_taking_discipline'
        ];

        // Cognitive Bias Traits (New in Phase 2)
        const cognitiveBiasTraits = [
            'confirmation_bias', 'anchoring_bias', 'availability_bias', 'overconfidence_bias',
            'loss_aversion', 'endowment_effect', 'sunk_cost_fallacy', 'gambler_fallacy',
            'hindsight_bias', 'optimism_bias', 'recency_bias', 'herding_bias',
            'authority_bias', 'framing_effect', 'representativeness_heuristic'
        ];
        
        // Emotional Intelligence Traits (New in Phase 2)
        const emotionalIntelligenceTraits = [
            'self_awareness', 'self_regulation', 'motivation_drive', 'empathy_accuracy',
            'social_skills', 'emotional_perception', 'emotional_understanding',
            'emotional_integration', 'emotional_management', 'mood_regulation'
        ];
        
        // Cultural and Background Traits (New in Phase 2)
        const culturalTraits = [
            'collectivism_individualism', 'power_distance_comfort', 'uncertainty_avoidance',
            'long_term_orientation', 'indulgence_restraint', 'cultural_intelligence',
            'tradition_respect', 'authority_deference', 'social_hierarchy_acceptance'
        ];
        
        // Generate all traits with advanced correlation logic
        const allTraits = [
            ...bigFiveTraits, ...darkTriadTraits, ...coreTraits, ...socialTraits, 
            ...cognitiveTraits, ...tradingTraits, ...behavioralTraits, 
            ...cognitiveBiasTraits, ...emotionalIntelligenceTraits, ...culturalTraits
        ];
        
        // Generate Big Five first (foundational)
        bigFiveTraits.forEach(trait => {
            traits[trait] = this.generateBigFiveTrait(trait);
        });
        
        // Generate other traits with Big Five influence
        const remainingTraits = allTraits.filter(t => !bigFiveTraits.includes(t));
        remainingTraits.forEach(trait => {
            traits[trait] = this.generateTraitValue(trait, traits);
        });
        
        // Apply personality disorder influences
        this.applyPersonalityDisorderInfluences(traits);
        
        // Initialize trait evolution parameters
        this.initializeTraitEvolution(traits);

        return traits;
    }
    
    generateBigFiveTrait(trait) {
        // Generate Big Five with realistic distributions
        const distributions = {
            'openness': { mean: 60, std: 20 },
            'conscientiousness': { mean: 55, std: 18 },
            'extraversion': { mean: 50, std: 22 },
            'agreeableness': { mean: 65, std: 16 },
            'neuroticism': { mean: 40, std: 20 }
        };
        
        const dist = distributions[trait];
        return Math.max(0, Math.min(100, this.generateNormalDistribution(dist.mean, dist.std)));
    }
    
    generateNormalDistribution(mean, std) {
        // Box-Muller transformation for normal distribution
        let u1 = Math.random();
        let u2 = Math.random();
        let z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return z0 * std + mean;
    }

    generateTraitValue(trait, existingTraits) {
        let baseValue = Math.random() * 100;
        
        // Enhanced correlation logic with Big Five influence
        const bigFiveInfluences = this.calculateBigFiveInfluences(trait, existingTraits);
        const traitCorrelations = this.getTraitCorrelations(trait);
        
        // Apply Big Five influences first
        Object.entries(bigFiveInfluences).forEach(([bigFiveTrait, influence]) => {
            if (existingTraits[bigFiveTrait] !== undefined) {
                const adjustment = (existingTraits[bigFiveTrait] - 50) * influence * 0.4;
                baseValue = Math.max(0, Math.min(100, baseValue + adjustment));
            }
        });
        
        // Apply specific trait correlations
        Object.entries(traitCorrelations).forEach(([relatedTrait, correlation]) => {
            if (existingTraits[relatedTrait] !== undefined) {
                const adjustment = (existingTraits[relatedTrait] - 50) * correlation * 0.3;
                baseValue = Math.max(0, Math.min(100, baseValue + adjustment));
            }
        });
        
        return Math.round(baseValue);
    }
    
    calculateBigFiveInfluences(trait) {
        const influences = {
            // Openness influences
            'analytical_thinking': { 'openness': 0.7 },
            'curiosity': { 'openness': 0.8 },
            'pattern_recognition': { 'openness': 0.5 },
            
            // Conscientiousness influences  
            'discipline': { 'conscientiousness': 0.9 },
            'patience': { 'conscientiousness': 0.7 },
            'self_control': { 'conscientiousness': 0.8 },
            'perfectionism': { 'conscientiousness': 0.6 },
            
            // Extraversion influences
            'confidence': { 'extraversion': 0.6 },
            'network_building': { 'extraversion': 0.8 },
            'social_skills': { 'extraversion': 0.7 },
            'cooperation': { 'extraversion': 0.4 },
            
            // Agreeableness influences
            'trust_propensity': { 'agreeableness': 0.7 },
            'empathy': { 'agreeableness': 0.8 },
            'altruism': { 'agreeableness': 0.6 },
            'vindictiveness': { 'agreeableness': -0.7 },
            
            // Neuroticism influences
            'emotional_stability': { 'neuroticism': -0.9 },
            'stress_tolerance': { 'neuroticism': -0.8 },
            'fear': { 'neuroticism': 0.6 }
        };
        
        return influences[trait] || {};
    }
    
    getTraitCorrelations(trait) {
        const correlations = {
            // Enhanced correlations with psychological realism
            'greed': { 'risk_tolerance': 0.6, 'impulsiveness': 0.4, 'patience': -0.5, 'narcissism': 0.3 },
            'fear': { 'risk_tolerance': -0.7, 'emotional_stability': -0.5, 'confidence': -0.6, 'neuroticism': 0.8 },
            'patience': { 'impulsiveness': -0.8, 'discipline': 0.7, 'analytical_thinking': 0.5, 'conscientiousness': 0.6 },
            'trust_propensity': { 'cooperation': 0.6, 'loyalty': 0.5, 'vindictiveness': -0.7, 'agreeableness': 0.7 },
            'overconfidence_bias': { 'confidence': 0.8, 'risk_tolerance': 0.4, 'learning_speed': -0.3, 'narcissism': 0.5 },
            
            // Dark Triad correlations
            'narcissism': { 'confidence': 0.7, 'empathy': -0.6, 'need_for_control': 0.5 },
            'machiavellianism': { 'manipulation_tendency': 0.8, 'trust_propensity': -0.6 },
            'psychopathy': { 'empathy': -0.8, 'impulsiveness': 0.5, 'emotional_stability': 0.3, 'risk_tolerance': 0.6 },
            
            // Cognitive bias correlations
            'confirmation_bias': { 'overconfidence_bias': 0.4, 'analytical_thinking': -0.3, 'openness': -0.5 },
            'anchoring_bias': { 'analytical_thinking': -0.4, 'flexibility': -0.6 },
            'loss_aversion': { 'risk_tolerance': -0.7, 'fear': 0.6, 'neuroticism': 0.5 },
            
            // Emotional intelligence correlations
            'self_awareness': { 'emotional_stability': 0.6 },
            'empathy_accuracy': { 'agreeableness': 0.7, 'social_skills': 0.6 },
            'emotional_regulation': { 'self_control': 0.8, 'emotional_stability': 0.7, 'stress_tolerance': 0.6 }
        };
        
        return correlations[trait] || {};
    }

    calculateDominantTraits() {
        const sorted = Object.entries(this.traits)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8);
        
        return Object.fromEntries(sorted);
    }

    classifyPersonalityType() {
        const { risk_tolerance, greed, patience, analytical_thinking, trust_propensity } = this.traits;
        
        if (risk_tolerance > 70 && greed > 60) return 'AGGRESSIVE_SPECULATOR';
        if (patience > 80 && analytical_thinking > 70) return 'STRATEGIC_ANALYST';
        if (trust_propensity > 75 && cooperation > 70) return 'COLLABORATIVE_TRADER';
        if (risk_tolerance < 30 && patience > 60) return 'CONSERVATIVE_INVESTOR';
        if (impulsiveness > 70 && emotional_stability < 40) return 'EMOTIONAL_TRADER';
        if (pattern_recognition > 80 && analytical_thinking > 75) return 'ALGORITHMIC_THINKER';
        if (network_building > 70 && information_sharing > 60) return 'SOCIAL_TRADER';
        if (contrarian_tendency > 70 && independent_thinking > 75) return 'CONTRARIAN_REBEL';
        
        return 'BALANCED_TRADER';
    }

    deriveTradingStyle() {
        const styles = [];
        
        if (this.traits.momentum_trading > 70) styles.push('MOMENTUM');
        if (this.traits.value_investing > 70) styles.push('VALUE');
        if (this.traits.arbitrage_detection > 70) styles.push('ARBITRAGE');
        if (this.traits.market_making_skill > 70) styles.push('MARKET_MAKING');
        if (this.traits.speculation_appetite > 70) styles.push('SPECULATION');
        if (this.traits.trend_following > 70) styles.push('TREND_FOLLOWING');
        if (this.traits.contrarian_tendency > 70) styles.push('CONTRARIAN');
        
        return styles.length > 0 ? styles : ['GENERALIST'];
    }
    
    // Phase 2 Enhancement Methods
    
    applyPersonalityDisorderInfluences(traits) {
        // Model personality disorder tendencies based on trait combinations
        const disorderInfluences = {
            borderline: {
                triggers: { 
                    'emotional_stability': (val) => val < 30, 
                    'impulsiveness': (val) => val > 70,
                    'neuroticism': (val) => val > 70
                },
                effects: { 
                    'mood_swings': 25, 
                    'relationship_instability': 30, 
                    'identity_confusion': 20,
                    'abandonment_fear': 35
                }
            },
            narcissistic: {
                triggers: { 
                    'narcissism': (val) => val > 70, 
                    'empathy': (val) => val < 30,
                    'confidence': (val) => val > 80
                },
                effects: { 
                    'grandiosity': 30, 
                    'entitlement': 25, 
                    'exploitation_tendency': 20,
                    'empathy_deficit': 25
                }
            },
            antisocial: {
                triggers: { 
                    'psychopathy': (val) => val > 60, 
                    'empathy': (val) => val < 25,
                    'agreeableness': (val) => val < 30
                },
                effects: { 
                    'rule_breaking': 25, 
                    'manipulation_skill': 20, 
                    'remorse_capacity': -35,
                    'deception_skill': 20
                }
            },
            avoidant: {
                triggers: { 
                    'fear': (val) => val > 70, 
                    'social_anxiety': (val) => val > 60,
                    'extraversion': (val) => val < 30
                },
                effects: { 
                    'rejection_sensitivity': 30, 
                    'isolation_tendency': 25, 
                    'risk_avoidance': 20,
                    'social_inhibition': 25
                }
            },
            histrionic: {
                triggers: {
                    'attention_seeking': (val) => val > 70,
                    'emotional_volatility': (val) => val > 60,
                    'extraversion': (val) => val > 80
                },
                effects: {
                    'dramatic_behavior': 25,
                    'attention_need': 30,
                    'emotional_shallowness': 20
                }
            }
        };
        
        Object.entries(disorderInfluences).forEach(([disorder, config]) => {
            const triggersMatched = Object.entries(config.triggers).filter(([trait, condition]) => {
                return traits[trait] && condition(traits[trait]);
            }).length;
            
            const triggerThreshold = Object.keys(config.triggers).length * 0.7;
            if (triggersMatched >= triggerThreshold) {
                Object.entries(config.effects).forEach(([trait, effect]) => {
                    if (!traits[trait]) traits[trait] = 50;
                    traits[trait] = Math.max(0, Math.min(100, traits[trait] + effect));
                });
                
                traits[`${disorder}_tendency`] = Math.min(100, (traits[`${disorder}_tendency`] || 0) + 30);
            }
        });
    }
    
    initializeTraitEvolution(traits) {
        // Initialize evolution parameters for each trait
        this.evolutionParameters = {};
        Object.keys(traits).forEach(trait => {
            this.evolutionParameters[trait] = {
                plasticity: this.calculateTraitPlasticity(trait),
                stability_threshold: Math.random() * 20 + 70, // 70-90
                change_momentum: 0,
                recent_changes: [],
                major_event_sensitivity: this.calculateEventSensitivity(trait),
                baseline_value: traits[trait],
                genetic_component: Math.random() * 0.3 + 0.2 // 20-50% genetic
            };
        });
    }
    
    calculateTraitPlasticity(trait) {
        // Some traits are more plastic (changeable) than others
        const plasticityMap = {
            // High plasticity (easily changed by experience)
            'confidence': 0.8, 'trust_propensity': 0.9, 'fear': 0.7, 'optimism': 0.6,
            'risk_tolerance': 0.7, 'emotional_stability': 0.5, 'mood_regulation': 0.6,
            
            // Medium plasticity
            'patience': 0.4, 'greed': 0.5, 'analytical_thinking': 0.3, 'discipline': 0.4,
            'self_awareness': 0.5, 'social_skills': 0.4, 'stress_tolerance': 0.4,
            
            // Low plasticity (core personality traits)
            'openness': 0.2, 'conscientiousness': 0.2, 'extraversion': 0.1, 
            'agreeableness': 0.2, 'neuroticism': 0.1, 'intelligence': 0.1,
            
            // Very low plasticity (genetic/temperamental)
            'narcissism': 0.05, 'psychopathy': 0.02, 'empathy_accuracy': 0.1,
            'genetic_risk_tolerance': 0.05, 'temperament': 0.03
        };
        
        return plasticityMap[trait] || 0.3; // Default medium plasticity
    }
    
    calculateEventSensitivity(trait) {
        // How much major life events affect each trait
        const sensitivityMap = {
            'trust_propensity': 0.9, 'emotional_stability': 0.7, 'fear': 0.8,
            'confidence': 0.6, 'optimism': 0.5, 'pessimism': 0.5,
            'risk_tolerance': 0.4, 'stress_tolerance': 0.6, 'self_awareness': 0.4,
            'mood_regulation': 0.5, 'social_skills': 0.3
        };
        
        return sensitivityMap[trait] || 0.3;
    }
    
    // Enhanced personality evolution with psychological realism
    evolveTrait(trait, experience) {
        if (!this.evolutionParameters[trait]) return;
        
        const params = this.evolutionParameters[trait];
        const currentValue = this.traits[trait];
        
        // Calculate change magnitude based on experience
        let changeMagnitude = this.calculateChangeMagnitude(experience, params);
        
        // Apply plasticity constraints
        changeMagnitude *= params.plasticity;
        
        // Apply genetic constraints (some traits resist change)
        if (Math.abs(changeMagnitude) > 0) {
            const geneticResistance = params.genetic_component;
            changeMagnitude *= (1 - geneticResistance);
        }
        
        // Apply stability threshold (major changes need strong experiences)
        if (Math.abs(changeMagnitude) > 5 && experience.intensity < params.stability_threshold) {
            changeMagnitude *= 0.3; // Reduce dramatic changes from minor events
        }
        
        // Update trait with momentum
        const newValue = Math.max(0, Math.min(100, currentValue + changeMagnitude));
        this.traits[trait] = newValue;
        
        // Update evolution tracking
        params.recent_changes.push({
            change: changeMagnitude,
            timestamp: Date.now(),
            trigger: experience.type
        });
        
        // Maintain change momentum
        params.change_momentum = params.change_momentum * 0.8 + changeMagnitude * 0.2;
        
        // Cleanup old changes
        if (params.recent_changes.length > 10) {
            params.recent_changes.shift();
        }
    }
    
    calculateChangeMagnitude(experience, params) {
        const { type, outcome, intensity, emotional_impact } = experience;
        let magnitude = 0;
        
        // Base magnitude from experience intensity
        magnitude = intensity * 0.1 * (outcome === 'positive' ? 1 : -1);
        
        // Emotional impact multiplier
        if (emotional_impact) {
            magnitude *= (1 + emotional_impact * 0.5);
        }
        
        // Event-specific trait sensitivities
        if (params.major_event_sensitivity && this.isMajorEvent(experience)) {
            magnitude *= 1.5;
        }
        
        // Apply cognitive biases to trait evolution
        magnitude = this.applyEvolutionBiases(magnitude, experience);
        
        return magnitude;
    }
    
    isMajorEvent(experience) {
        const majorEvents = ['betrayal', 'major_loss', 'life_changing_win', 'trauma', 'breakthrough'];
        return majorEvents.includes(experience.type) || experience.intensity > 80;
    }
    
    applyEvolutionBiases(magnitude, experience) {
        // Recency bias - recent events have more impact
        const timeSinceEvent = Date.now() - (experience.timestamp || Date.now());
        const recencyMultiplier = Math.max(0.5, 1 - (timeSinceEvent / (1000 * 60 * 60 * 24 * 30))); // Decay over 30 days
        
        // Loss aversion - negative events have stronger impact
        if (magnitude < 0) {
            magnitude *= (1 + this.traits.loss_aversion * 0.01);
        }
        
        // Confirmation bias - changes that align with existing traits are amplified
        const confirmationEffect = this.calculateConfirmationBias(magnitude, experience);
        magnitude *= confirmationEffect;
        
        return magnitude * recencyMultiplier;
    }
    
    calculateConfirmationBias(magnitude, experience) {
        // If change aligns with existing extreme traits, amplify it
        const relevantTraits = this.getRelevantTraits(experience.type);
        let biasEffect = 1.0;
        
        relevantTraits.forEach(trait => {
            const currentValue = this.traits[trait];
            if ((magnitude > 0 && currentValue > 70) || (magnitude < 0 && currentValue < 30)) {
                biasEffect *= (1 + this.traits.confirmation_bias * 0.005);
            }
        });
        
        return biasEffect;
    }
    
    getRelevantTraits(experienceType) {
        const relevanceMap = {
            'betrayal': ['trust_propensity', 'vindictiveness', 'emotional_stability'],
            'major_loss': ['risk_tolerance', 'fear', 'confidence', 'pessimism'],
            'big_win': ['confidence', 'risk_tolerance', 'optimism', 'overconfidence_bias'],
            'cooperation': ['trust_propensity', 'cooperation', 'loyalty'],
            'social_rejection': ['social_anxiety', 'rejection_sensitivity', 'extraversion']
        };
        
        return relevanceMap[experienceType] || [];
    }

    // Personality evolution over time (enhanced)
    evolvePersonality(experiences) {
        experiences.forEach(exp => {
            // Use new enhanced trait evolution
            this.getRelevantTraits(exp.type).forEach(trait => {
                this.evolveTrait(trait, exp);
            });
            
            // Keep legacy method for compatibility
            this.applyExperienceToTraits(exp);
        });
        this.recalculatePersonality();
    }

    applyExperienceToTraits(experience) {
        const { type, outcome, intensity } = experience;
        const modifier = (outcome === 'positive' ? 1 : -1) * intensity * 0.1;

        switch(type) {
            case 'major_loss':
                this.traits.risk_tolerance = Math.max(0, this.traits.risk_tolerance - 5);
                this.traits.fear = Math.min(100, this.traits.fear + 3);
                this.traits.loss_aversion = Math.min(100, this.traits.loss_aversion + 4);
                break;
            case 'big_win':
                this.traits.confidence = Math.min(100, this.traits.confidence + 3);
                this.traits.risk_tolerance = Math.min(100, this.traits.risk_tolerance + 2);
                this.traits.overconfidence_bias = Math.min(100, this.traits.overconfidence_bias + 2);
                break;
            case 'betrayal':
                this.traits.trust_propensity = Math.max(0, this.traits.trust_propensity - 8);
                this.traits.vindictiveness = Math.min(100, this.traits.vindictiveness + 5);
                this.traits.cooperation = Math.max(0, this.traits.cooperation - 4);
                break;
            case 'successful_cooperation':
                this.traits.trust_propensity = Math.min(100, this.traits.trust_propensity + 3);
                this.traits.cooperation = Math.min(100, this.traits.cooperation + 4);
                this.traits.loyalty = Math.min(100, this.traits.loyalty + 2);
                break;
        }
    }

    recalculatePersonality() {
        this.dominantTraits = this.calculateDominantTraits();
        this.personalityType = this.classifyPersonalityType();
        this.tradingStyle = this.deriveTradingStyle();
    }

    getPersonalityProfile() {
        return {
            traits: this.traits,
            dominantTraits: this.dominantTraits,
            personalityType: this.personalityType,
            tradingStyle: this.tradingStyle,
            profileSummary: this.generateProfileSummary()
        };
    }

    generateProfileSummary() {
        const dominant = Object.keys(this.dominantTraits).slice(0, 3);
        const disorderTendencies = this.getPersonalityDisorderTendencies();
        const cognitiveProfile = this.getCognitiveBiasProfile();
        
        let summary = `${this.personalityType} with strong ${dominant.join(', ')} tendencies. Trading styles: ${this.tradingStyle.join(', ')}.`;
        
        if (disorderTendencies.length > 0) {
            summary += ` Shows ${disorderTendencies.join(', ')} characteristics.`;
        }
        
        if (cognitiveProfile.dominant_biases.length > 0) {
            summary += ` Primary cognitive biases: ${cognitiveProfile.dominant_biases.slice(0, 2).join(', ')}.`;
        }
        
        return summary;
    }
    
    // Phase 2 Analysis Methods
    
    getPersonalityDisorderTendencies() {
        const disorders = [];
        const threshold = 60;
        
        Object.keys(this.traits).forEach(trait => {
            if (trait.endsWith('_tendency') && this.traits[trait] > threshold) {
                disorders.push(trait.replace('_tendency', ''));
            }
        });
        
        return disorders;
    }
    
    getCognitiveBiasProfile() {
        const biases = [
            'confirmation_bias', 'anchoring_bias', 'availability_bias', 'overconfidence_bias',
            'loss_aversion', 'endowment_effect', 'sunk_cost_fallacy', 'gambler_fallacy',
            'hindsight_bias', 'optimism_bias', 'recency_bias', 'herding_bias'
        ];
        
        const biasLevels = biases.map(bias => ({
            bias,
            level: this.traits[bias] || 50
        })).sort((a, b) => b.level - a.level);
        
        return {
            dominant_biases: biasLevels.slice(0, 3).map(b => b.bias),
            bias_intensity: biasLevels.slice(0, 3).reduce((sum, b) => sum + b.level, 0) / 3,
            bias_profile: biasLevels
        };
    }
    
    getEmotionalIntelligenceProfile() {
        const eiTraits = [
            'self_awareness', 'self_regulation', 'motivation_drive', 'empathy_accuracy',
            'social_skills', 'emotional_perception', 'emotional_understanding',
            'emotional_integration', 'emotional_management', 'mood_regulation'
        ];
        
        const eiValues = eiTraits.map(trait => this.traits[trait] || 50);
        const averageEI = eiValues.reduce((sum, val) => sum + val, 0) / eiValues.length;
        
        return {
            overall_ei: averageEI,
            ei_breakdown: Object.fromEntries(eiTraits.map(trait => [trait, this.traits[trait] || 50])),
            ei_strengths: eiTraits.filter(trait => (this.traits[trait] || 50) > 70),
            ei_weaknesses: eiTraits.filter(trait => (this.traits[trait] || 50) < 40)
        };
    }
    
    getCulturalProfile() {
        return {
            individualism_score: this.traits.collectivism_individualism || 50,
            power_distance: this.traits.power_distance_comfort || 50,
            uncertainty_avoidance: this.traits.uncertainty_avoidance || 50,
            long_term_orientation: this.traits.long_term_orientation || 50,
            cultural_adaptability: this.traits.cultural_intelligence || 50
        };
    }
    
    getPersonalityStability() {
        if (!this.evolutionParameters) return 85; // Default high stability
        
        const traitStabilities = Object.entries(this.evolutionParameters).map(([trait, params]) => {
            const recentChanges = params.recent_changes.slice(-5);
            const changeVariance = this.calculateVariance(recentChanges.map(c => c.change));
            return Math.max(0, 100 - changeVariance * 10);
        });
        
        return traitStabilities.reduce((sum, stability) => sum + stability, 0) / traitStabilities.length;
    }
    
    calculateVariance(values) {
        if (values.length === 0) return 0;
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
        return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
    }
    
    getTraitEvolutionHistory(trait) {
        if (!this.evolutionParameters[trait]) return [];
        return this.evolutionParameters[trait].recent_changes;
    }
    
    predictPersonalityChange(futureExperience) {
        const predictions = {};
        const relevantTraits = this.getRelevantTraits(futureExperience.type);
        
        relevantTraits.forEach(trait => {
            if (this.evolutionParameters[trait]) {
                const params = this.evolutionParameters[trait];
                const predictedChange = this.calculateChangeMagnitude(futureExperience, params);
                predictions[trait] = {
                    current_value: this.traits[trait],
                    predicted_change: predictedChange,
                    predicted_new_value: Math.max(0, Math.min(100, this.traits[trait] + predictedChange)),
                    confidence: this.calculatePredictionConfidence(trait, futureExperience)
                };
            }
        });
        
        return predictions;
    }
    
    calculatePredictionConfidence(trait, experience) {
        const params = this.evolutionParameters[trait];
        const historicalAccuracy = params.recent_changes.length / 10; // More history = more confidence
        const plasticityFactor = params.plasticity; // More plastic = less predictable
        const experienceClarity = experience.intensity / 100; // Clearer experiences = more predictable
        
        return Math.min(95, (historicalAccuracy * 40 + experienceClarity * 30 + (1 - plasticityFactor) * 30));
    }
    
    // Enhanced personality analysis for Phase 2
    getAdvancedPersonalityAnalysis() {
        return {
            core_personality: this.getPersonalityProfile(),
            big_five_profile: this.getBigFiveProfile(),
            dark_triad_profile: this.getDarkTriadProfile(),
            cognitive_bias_profile: this.getCognitiveBiasProfile(),
            emotional_intelligence: this.getEmotionalIntelligenceProfile(),
            cultural_profile: this.getCulturalProfile(),
            personality_disorders: this.getPersonalityDisorderTendencies(),
            personality_stability: this.getPersonalityStability(),
            trait_plasticity: this.getTraitPlasticityProfile(),
            psychological_health: this.assessPsychologicalHealth()
        };
    }
    
    getBigFiveProfile() {
        return {
            openness: this.traits.openness,
            conscientiousness: this.traits.conscientiousness,
            extraversion: this.traits.extraversion,
            agreeableness: this.traits.agreeableness,
            neuroticism: this.traits.neuroticism
        };
    }
    
    getDarkTriadProfile() {
        return {
            narcissism: this.traits.narcissism || 0,
            machiavellianism: this.traits.machiavellianism || 0,
            psychopathy: this.traits.psychopathy || 0,
            sadism: this.traits.sadism || 0,
            dark_triad_total: (this.traits.narcissism + this.traits.machiavellianism + this.traits.psychopathy) / 3
        };
    }
    
    getTraitPlasticityProfile() {
        if (!this.evolutionParameters) return {};
        
        const plasticityProfile = {};
        Object.entries(this.evolutionParameters).forEach(([trait, params]) => {
            plasticityProfile[trait] = {
                plasticity: params.plasticity,
                recent_changes: params.recent_changes.length,
                change_momentum: params.change_momentum,
                stability: 100 - (Math.abs(params.change_momentum) * 10)
            };
        });
        
        return plasticityProfile;
    }
    
    assessPsychologicalHealth() {
        const healthFactors = {
            emotional_stability: this.traits.emotional_stability || 50,
            stress_tolerance: this.traits.stress_tolerance || 50,
            self_awareness: this.traits.self_awareness || 50,
            emotional_regulation: this.traits.emotional_regulation || 50,
            social_functioning: (this.traits.social_skills + this.traits.empathy + this.traits.cooperation) / 3
        };
        
        const healthScore = Object.values(healthFactors).reduce((sum, score) => sum + score, 0) / Object.keys(healthFactors).length;
        
        // Deduct for personality disorder tendencies
        const disorderPenalty = this.getPersonalityDisorderTendencies().length * 10;
        
        return {
            overall_health: Math.max(0, healthScore - disorderPenalty),
            health_factors: healthFactors,
            risk_factors: this.identifyPsychologicalRiskFactors(),
            protective_factors: this.identifyProtectiveFactors()
        };
    }
    
    identifyPsychologicalRiskFactors() {
        const risks = [];
        
        if (this.traits.neuroticism > 70) risks.push('high_neuroticism');
        if (this.traits.emotional_stability < 30) risks.push('emotional_instability');
        if (this.traits.narcissism > 70) risks.push('narcissistic_tendencies');
        if (this.traits.psychopathy > 60) risks.push('psychopathic_traits');
        if (this.traits.social_anxiety > 70) risks.push('social_dysfunction');
        if (this.traits.impulsiveness > 80) risks.push('impulse_control_issues');
        
        return risks;
    }
    
    identifyProtectiveFactors() {
        const protective = [];
        
        if (this.traits.emotional_stability > 70) protective.push('emotional_resilience');
        if (this.traits.self_awareness > 70) protective.push('self_insight');
        if (this.traits.empathy > 70) protective.push('strong_empathy');
        if (this.traits.social_skills > 70) protective.push('social_competence');
        if (this.traits.stress_tolerance > 70) protective.push('stress_resilience');
        if (this.traits.conscientiousness > 70) protective.push('self_discipline');
        
        return protective;
    }
}

module.exports = PersonalityDNA;
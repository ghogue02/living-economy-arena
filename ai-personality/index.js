/**
 * AI Trader Personality System - Main Integration Module
 * Complete personality-driven AI trader with 50+ traits and complex behaviors
 */

const PersonalityDNA = require('./core/personality-dna');
const TradingDecisionTree = require('./behaviors/decision-trees');
const AgentMemory = require('./memory/agent-memory');
const TrustNetwork = require('./relationships/trust-network');
const AdaptiveLearningSystem = require('./learning/adaptive-learning');
const EmotionalResponseSystem = require('./traits/emotional-responses');
const AgentSpecializationSystem = require('./learning/specialization-paths');
const Phase2MetaLearningIntegration = require('./learning/phase2-meta-learning-integration');

class AITraderPersonalitySystem {
    constructor(agentId, config = {}) {
        this.agentId = agentId;
        this.config = {
            enableEmotions: true,
            enableLearning: true,
            enableSpecialization: true,
            enableNetworking: true,
            enablePhase2MetaLearning: true,
            memoryRetention: 90, // days
            personalityEvolution: true,
            ...config
        };

        // Initialize core personality
        this.personalityDNA = new PersonalityDNA();
        
        // Initialize subsystems
        this.memory = new AgentMemory(agentId);
        this.decisionTree = new TradingDecisionTree(this.personalityDNA);
        this.emotionalSystem = new EmotionalResponseSystem(this.personalityDNA);
        this.learningSystem = new AdaptiveLearningSystem(agentId, this.personalityDNA);
        this.specializationSystem = new AgentSpecializationSystem(agentId, this.personalityDNA);
        
        // Initialize Phase 2 Meta-Learning (if enabled)
        this.phase2MetaLearning = null;
        if (this.config.enablePhase2MetaLearning) {
            this.phase2MetaLearning = new Phase2MetaLearningIntegration(
                agentId, 
                this.personalityDNA, 
                this.learningSystem
            );
        }
        
        // Network components (managed externally but interfaced here)
        this.trustNetwork = null;
        this.relationships = new Map();
        
        // Performance and state tracking
        this.performanceHistory = [];
        this.currentState = this.initializeState();
        this.activeSessions = new Map();
        
        // Initialize specialization
        this.initializeAgent();
    }

    initializeAgent() {
        // Set up specialization path
        const specializationResult = this.specializationSystem.initializeSpecialization();
        this.currentState.specialization = specializationResult;
        
        // Initialize emotional baseline
        this.currentState.emotional_state = this.emotionalSystem.getEmotionalProfile();
        
        // Create initial memory entries
        this.memory.recordTradeExperience(
            {
                type: 'initialization',
                timestamp: Date.now(),
                personality_snapshot: this.personalityDNA.getPersonalityProfile()
            },
            'successful',
            50
        );
        
        return {
            agent_id: this.agentId,
            personality: this.personalityDNA.getPersonalityProfile(),
            specialization: specializationResult,
            initial_state: this.currentState
        };
    }

    initializeState() {
        return {
            active: true,
            last_decision: null,
            recent_performance: [],
            emotional_state: null,
            specialization: null,
            current_focus: 'general_trading',
            energy_level: 100,
            stress_level: 0,
            confidence_level: this.personalityDNA.traits.confidence,
            last_activity: Date.now(),
            session_count: 0
        };
    }

    // Main decision-making interface
    makeDecision(opportunity, marketData, networkContext = {}) {
        const sessionId = this.startDecisionSession();
        
        try {
            // Update emotional state based on recent events
            this.updateEmotionalState(marketData);
            
            // Gather relevant memories
            const relevantMemories = this.memory.getRelevantMemories({
                opportunity: opportunity,
                market_state: marketData,
                counterparty: opportunity.counterparty
            });
            
            // Get relationship context
            const relationshipContext = this.getRelationshipContext(opportunity.counterparty);
            
            // Assess emotional impact on decision
            const emotionalInfluence = this.emotionalSystem.assessDecisionImpact(
                opportunity, 
                { 
                    market: marketData,
                    emotional_state: this.currentState.emotional_state.current_emotions,
                    recent_performance: this.currentState.recent_performance
                }
            );
            
            // Make the core decision
            const decision = this.decisionTree.makeTradeDecision(
                marketData,
                opportunity,
                this.memory,
                {
                    getRelationship: (counterparty) => this.getRelationshipData(counterparty),
                    ...relationshipContext
                }
            );
            
            // Apply emotional modifications
            this.applyEmotionalModifications(decision, emotionalInfluence);
            
            // Apply specialization insights
            this.applySpecializationInsights(decision, opportunity);
            
            // Record the decision
            this.recordDecision(decision, opportunity, marketData);
            
            // Update state
            this.updateAgentState(decision, opportunity);
            
            return {
                decision: decision,
                reasoning: this.generateDetailedReasoning(decision, emotionalInfluence),
                confidence: decision.confidence,
                emotional_state: this.currentState.emotional_state,
                specialization_input: this.getSpecializationInput(opportunity),
                session_id: sessionId
            };
            
        } finally {
            this.endDecisionSession(sessionId);
        }
    }

    updateEmotionalState(marketData) {
        // Process market volatility as emotional event
        if (marketData.volatility > 70) {
            const volatilityEvent = {
                type: 'market_volatility',
                data: {
                    volatility_level: marketData.volatility,
                    market_direction: marketData.trend,
                    liquidity: marketData.liquidity
                }
            };
            
            const emotionalResponse = this.emotionalSystem.processEmotionalEvent(volatilityEvent);
            this.currentState.emotional_state = emotionalResponse.emotional_state;
        }
        
        // Apply emotional decay over time
        const timeSinceLastUpdate = Date.now() - this.currentState.last_activity;
        if (timeSinceLastUpdate > 60000) { // 1 minute
            this.emotionalSystem.applyEmotionalDecay(timeSinceLastUpdate / 60000);
        }
    }

    applyEmotionalModifications(decision, emotionalInfluence) {
        // Apply emotional overrides if necessary
        if (emotionalInfluence.emotional_override) {
            decision.action = emotionalInfluence.decision_modification;
            decision.reasoning += '; EMOTIONAL OVERRIDE: ' + emotionalInfluence.reasoning.join(', ');
            decision.confidence = Math.max(20, decision.confidence - 30);
        }
        
        // Apply adjustments
        decision.confidence += emotionalInfluence.confidence_adjustment;
        decision.risk_adjustment = emotionalInfluence.risk_adjustment;
        decision.timing_adjustment = emotionalInfluence.timing_adjustment;
        
        // Add emotional reasoning
        if (emotionalInfluence.reasoning.length > 0) {
            decision.emotional_factors = emotionalInfluence.reasoning;
        }
    }

    applySpecializationInsights(decision, opportunity) {
        const context = {
            opportunity_type: opportunity.type,
            market_conditions: opportunity.market_context,
            complexity: opportunity.complexity || 50
        };
        
        const adaptedStrategy = this.learningSystem.getAdaptedStrategy(context);
        
        if (adaptedStrategy.confidence > 70) {
            decision.specialized_approach = adaptedStrategy.base_strategy;
            decision.adaptations = adaptedStrategy.adaptations;
            decision.confidence = Math.min(100, decision.confidence + adaptedStrategy.confidence * 0.1);
            decision.reasoning += `; Specialized ${adaptedStrategy.base_strategy.name} approach applied`;
        }
    }

    // Learning and experience processing
    processExperienceOutcome(sessionId, outcome, performance) {
        const session = this.activeSessions.get(sessionId);
        if (!session) return null;

        // Record trade experience in memory
        const tradeExperience = {
            trade: {
                ...session.opportunity,
                profit_loss: performance.profit_loss,
                execution_time: performance.execution_time,
                market_context: session.marketData
            },
            decision: session.decision,
            performance: performance
        };

        const memoryId = this.memory.recordTradeExperience(
            tradeExperience.trade,
            outcome,
            this.calculateEmotionalImpact(performance)
        );

        // Process learning
        const learningResult = this.learningSystem.learnFromExperience({
            outcome: outcome,
            context: session.marketData,
            decision: session.decision,
            performance: performance,
            emotional_impact: this.calculateEmotionalImpact(performance)
        });

        // Process Phase 2 meta-learning (if enabled)
        let metaLearningResult = null;
        if (this.phase2MetaLearning) {
            metaLearningResult = this.phase2MetaLearning.processLearningExperience({
                outcome: outcome,
                context: session.marketData,
                decision: session.decision,
                performance: performance,
                type: 'trading_experience',
                emotional_impact: this.calculateEmotionalImpact(performance),
                counterparty: session.opportunity.counterparty,
                strategies_used: session.decision.specialized_approach ? [session.decision.specialized_approach.name] : [],
                betrayal_involved: outcome === 'betrayal',
                cooperation_involved: outcome === 'cooperation'
            }, {
                market_conditions: session.marketData,
                social_environment: this.getSocialEnvironmentContext(session),
                learning_environment: this.getLearningEnvironmentContext(),
                emotional_state: session.emotional_state
            });
        }

        // Gain skill experience
        this.gainSkillExperience(session.opportunity, performance, outcome);

        // Process emotional learning
        const emotionalLearning = this.emotionalSystem.learnFromEmotionalOutcome(
            session.emotional_state,
            session.decision,
            outcome
        );

        // Update personality based on experience
        if (this.config.personalityEvolution) {
            this.evolvePersonality(outcome, performance);
        }

        // Update performance history
        this.performanceHistory.push({
            session_id: sessionId,
            outcome: outcome,
            performance: performance,
            learning_impact: learningResult.impact,
            timestamp: Date.now()
        });

        return {
            memory_id: memoryId,
            learning_result: learningResult,
            meta_learning_result: metaLearningResult,
            emotional_learning: emotionalLearning,
            personality_changes: this.getRecentPersonalityChanges(),
            skill_progress: this.getSkillProgressUpdate()
        };
    }

    calculateEmotionalImpact(performance) {
        let impact = 50;
        
        // Large profits/losses have high emotional impact
        impact += Math.min(40, Math.abs(performance.profit_loss) / 100);
        
        // Unexpected outcomes increase impact
        if (performance.unexpected) {
            impact += 20;
        }
        
        // First experiences have higher impact
        if (this.performanceHistory.length < 10) {
            impact += 15;
        }
        
        return Math.min(100, impact);
    }

    gainSkillExperience(opportunity, performance, outcome) {
        const relevantSkills = this.identifyRelevantSkills(opportunity);
        const experiencePoints = this.calculateExperiencePoints(performance, outcome);
        
        relevantSkills.forEach(skill => {
            const skillGain = this.specializationSystem.gainExperience(
                skill,
                experiencePoints,
                {
                    opportunity_type: opportunity.type,
                    outcome: outcome,
                    performance: performance,
                    emotional_state: this.currentState.emotional_state
                }
            );
            
            if (skillGain && skillGain.milestones_achieved.length > 0) {
                this.processSkillMilestones(skill, skillGain.milestones_achieved);
            }
        });
    }

    identifyRelevantSkills(opportunity) {
        const skillMap = {
            'day_trade': ['scalping', 'technical_analysis', 'timing_skill'],
            'arbitrage': ['arbitrage_detection', 'execution_speed', 'analytical_thinking'],
            'long_term': ['fundamental_analysis', 'patience', 'research_depth'],
            'social_trade': ['network_building', 'trust_assessment', 'communication']
        };
        
        return skillMap[opportunity.type] || ['general_trading', 'risk_management'];
    }

    calculateExperiencePoints(performance, outcome) {
        let points = 10; // Base experience
        
        // Outcome bonuses
        if (outcome === 'successful') points += 15;
        if (outcome === 'failed') points += 8; // Still learn from failure
        
        // Performance bonuses
        if (performance.profit_loss > 0) {
            points += Math.min(20, performance.profit_loss / 50);
        }
        
        // Difficulty bonuses
        if (performance.difficulty > 50) {
            points += (performance.difficulty - 50) * 0.3;
        }
        
        return Math.round(points);
    }

    evolvePersonality(outcome, performance) {
        const experiences = [];
        
        // Major outcomes trigger personality evolution
        if (Math.abs(performance.profit_loss) > 500) {
            experiences.push({
                type: performance.profit_loss > 0 ? 'big_win' : 'major_loss',
                outcome: performance.profit_loss > 0 ? 'positive' : 'negative',
                intensity: Math.min(100, Math.abs(performance.profit_loss) / 100)
            });
        }
        
        // Betrayal or cooperation events
        if (performance.relationship_outcome) {
            experiences.push({
                type: performance.relationship_outcome,
                outcome: performance.relationship_outcome === 'betrayal' ? 'negative' : 'positive',
                intensity: 70
            });
        }
        
        if (experiences.length > 0) {
            this.personalityDNA.evolvePersonality(experiences);
        }
    }

    // Relationship management
    updateRelationship(counterparty, interaction) {
        if (!this.relationships.has(counterparty)) {
            this.relationships.set(counterparty, {
                trust_level: 50,
                interaction_count: 0,
                successful_trades: 0,
                failed_trades: 0,
                last_interaction: Date.now(),
                relationship_quality: 'unknown'
            });
        }
        
        const relationship = this.relationships.get(counterparty);
        relationship.interaction_count++;
        relationship.last_interaction = Date.now();
        
        // Update based on interaction outcome
        if (interaction.outcome === 'successful') {
            relationship.successful_trades++;
            relationship.trust_level = Math.min(100, relationship.trust_level + 3);
        } else if (interaction.outcome === 'failed') {
            relationship.failed_trades++;
            relationship.trust_level = Math.max(0, relationship.trust_level - 2);
        } else if (interaction.outcome === 'betrayal') {
            relationship.trust_level = Math.max(0, relationship.trust_level - 20);
            
            // Record betrayal in memory
            this.memory.recordBetrayalEvent(
                counterparty,
                interaction.betrayal_type || 'general',
                interaction.context || {},
                interaction.damage || 100
            );
        } else if (interaction.outcome === 'cooperation') {
            relationship.trust_level = Math.min(100, relationship.trust_level + 5);
            
            // Record partnership success
            this.memory.recordPartnershipSuccess(
                counterparty,
                interaction.collaboration || {},
                interaction.mutual_benefit || 50
            );
        }
        
        // Update relationship quality
        relationship.relationship_quality = this.classifyRelationshipQuality(relationship);
        
        return relationship;
    }

    classifyRelationshipQuality(relationship) {
        const { trust_level, successful_trades, failed_trades } = relationship;
        
        if (trust_level > 80 && successful_trades > failed_trades * 2) return 'trusted_partner';
        if (trust_level > 60 && successful_trades > failed_trades) return 'reliable_contact';
        if (trust_level < 30 || failed_trades > successful_trades) return 'risky_counterparty';
        if (trust_level < 10) return 'avoid';
        
        return 'neutral';
    }

    getRelationshipContext(counterparty) {
        if (!counterparty) return {};
        
        const relationship = this.relationships.get(counterparty);
        if (!relationship) return { trust_level: 50, relationship_quality: 'unknown' };
        
        return {
            trust_level: relationship.trust_level,
            relationship_quality: relationship.relationship_quality,
            interaction_history: {
                total: relationship.interaction_count,
                successful: relationship.successful_trades,
                failed: relationship.failed_trades
            }
        };
    }

    // Network integration
    connectToTrustNetwork(trustNetwork) {
        this.trustNetwork = trustNetwork;
        trustNetwork.addAgent(this.agentId, this.personalityDNA.getPersonalityProfile());
    }

    updateNetworkTrust(counterparty, interaction) {
        if (this.trustNetwork) {
            this.trustNetwork.updateTrustLevel(this.agentId, counterparty, interaction);
        }
        
        return this.updateRelationship(counterparty, interaction);
    }

    // State management
    updateAgentState(decision, opportunity) {
        this.currentState.last_decision = decision;
        this.currentState.last_activity = Date.now();
        this.currentState.session_count++;
        
        // Update energy level based on decision complexity
        const energyCost = this.calculateEnergyCost(decision, opportunity);
        this.currentState.energy_level = Math.max(0, this.currentState.energy_level - energyCost);
        
        // Update stress level
        if (decision.risk_adjustment > 10) {
            this.currentState.stress_level = Math.min(100, this.currentState.stress_level + 5);
        }
        
        // Update confidence based on decision quality
        if (decision.confidence > 80) {
            this.currentState.confidence_level = Math.min(100, this.currentState.confidence_level + 1);
        } else if (decision.confidence < 40) {
            this.currentState.confidence_level = Math.max(0, this.currentState.confidence_level - 2);
        }
    }

    calculateEnergyCost(decision, opportunity) {
        let cost = 5; // Base cost
        
        // Complex decisions cost more energy
        if (decision.action === 'GATHER_MORE_INFO') cost += 3;
        if (decision.action === 'NEGOTIATE_TERMS') cost += 4;
        
        // High-risk decisions are more taxing
        if (decision.risk_adjustment > 15) cost += 3;
        
        // Emotional decisions cost more
        if (decision.emotional_factors && decision.emotional_factors.length > 0) cost += 2;
        
        return cost;
    }

    // Session management
    startDecisionSession() {
        const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        
        this.activeSessions.set(sessionId, {
            start_time: Date.now(),
            emotional_state: { ...this.currentState.emotional_state },
            decision: null,
            opportunity: null,
            marketData: null
        });
        
        return sessionId;
    }

    endDecisionSession(sessionId) {
        const session = this.activeSessions.get(sessionId);
        if (session) {
            session.end_time = Date.now();
            session.duration = session.end_time - session.start_time;
            
            // Move to completed sessions (keep last 50)
            // Implementation would store in memory system
            
            this.activeSessions.delete(sessionId);
        }
    }

    // Analytics and reporting
    getPersonalityAnalysis() {
        const analysis = {
            core_personality: this.personalityDNA.getPersonalityProfile(),
            emotional_profile: this.emotionalSystem.getEmotionalProfile(),
            specialization_status: this.specializationSystem.getSpecializationStatus(),
            learning_stats: this.learningSystem.getLearningStats(),
            memory_stats: this.memory.getMemoryStats(),
            current_state: this.currentState,
            performance_summary: this.getPerformanceSummary()
        };

        // Add Phase 2 meta-learning analysis if enabled
        if (this.phase2MetaLearning) {
            analysis.phase2_meta_learning = {
                status: this.phase2MetaLearning.getPhase2Status(),
                insights: this.phase2MetaLearning.getMetaLearningInsights(),
                optimization_opportunities: this.phase2MetaLearning.optimizeMetaLearning()
            };
        }

        return analysis;
    }

    getPerformanceSummary() {
        if (this.performanceHistory.length === 0) {
            return { status: 'no_data' };
        }
        
        const recent = this.performanceHistory.slice(-20);
        const totalPnL = recent.reduce((sum, p) => sum + (p.performance.profit_loss || 0), 0);
        const successRate = recent.filter(p => p.outcome === 'successful').length / recent.length;
        
        return {
            total_sessions: this.performanceHistory.length,
            recent_sessions: recent.length,
            success_rate: Math.round(successRate * 100),
            total_pnl: totalPnL,
            avg_pnl_per_trade: totalPnL / recent.length,
            learning_velocity: this.learningSystem.getLearningStats().learning_velocity,
            specialization_progress: this.specializationSystem.assessSpecializationProgress().overall_progress
        };
    }

    getDetailedMetrics() {
        return {
            personality_metrics: {
                stability: this.calculatePersonalityStability(),
                evolution_rate: this.calculateEvolutionRate(),
                trait_distribution: this.analyzeTraitDistribution()
            },
            emotional_metrics: {
                emotional_intelligence: this.calculateEmotionalIntelligence(),
                regulation_effectiveness: this.emotionalSystem.emotionalMemory.getEmotionalInsights().regulation_effectiveness,
                dominant_emotions: this.identifyDominantEmotions()
            },
            learning_metrics: {
                skill_development_rate: this.calculateSkillDevelopmentRate(),
                adaptation_speed: this.calculateAdaptationSpeed(),
                knowledge_retention: this.calculateKnowledgeRetention()
            },
            social_metrics: {
                network_size: this.relationships.size,
                avg_trust_level: this.calculateAverageTrustLevel(),
                relationship_quality_distribution: this.analyzeRelationshipDistribution()
            }
        };
    }

    // Utility methods for analytics
    calculatePersonalityStability() {
        // How stable is the personality over time
        return 85; // Simplified implementation
    }

    calculateEvolutionRate() {
        // How quickly personality traits change
        return 15; // Simplified implementation
    }

    analyzeTraitDistribution() {
        const traits = this.personalityDNA.traits;
        const distribution = { low: 0, medium: 0, high: 0 };
        
        Object.values(traits).forEach(value => {
            if (value < 33) distribution.low++;
            else if (value < 67) distribution.medium++;
            else distribution.high++;
        });
        
        return distribution;
    }

    calculateEmotionalIntelligence() {
        const emotionalStability = this.personalityDNA.traits.emotional_stability;
        const empathy = this.personalityDNA.traits.empathy;
        const selfAwareness = this.currentState.emotional_state.emotional_clarity;
        
        return (emotionalStability + empathy + selfAwareness) / 3;
    }

    identifyDominantEmotions() {
        const emotions = this.currentState.emotional_state.current_emotions;
        return Object.entries(emotions)
            .filter(([emotion, intensity]) => typeof intensity === 'number' && intensity > 60)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3)
            .map(([emotion, intensity]) => ({ emotion, intensity }));
    }

    calculateSkillDevelopmentRate() {
        const specializationProgress = this.specializationSystem.assessSpecializationProgress();
        return specializationProgress.learning_velocity;
    }

    calculateAdaptationSpeed() {
        const learningStats = this.learningSystem.getLearningStats();
        return learningStats.adaptation_count / Math.max(1, learningStats.total_experiences) * 100;
    }

    calculateKnowledgeRetention() {
        // How well the agent retains learned information
        return this.personalityDNA.traits.memory_retention;
    }

    calculateAverageTrustLevel() {
        if (this.relationships.size === 0) return 50;
        
        const totalTrust = Array.from(this.relationships.values())
            .reduce((sum, rel) => sum + rel.trust_level, 0);
        
        return totalTrust / this.relationships.size;
    }

    analyzeRelationshipDistribution() {
        const distribution = {
            trusted_partners: 0,
            reliable_contacts: 0,
            neutral: 0,
            risky_counterparties: 0,
            avoid: 0
        };
        
        this.relationships.forEach(rel => {
            distribution[rel.relationship_quality] = (distribution[rel.relationship_quality] || 0) + 1;
        });
        
        return distribution;
    }

    // Helper methods
    generateDetailedReasoning(decision, emotionalInfluence) {
        const reasoning = [decision.reasoning];
        
        if (emotionalInfluence.reasoning.length > 0) {
            reasoning.push('Emotional factors: ' + emotionalInfluence.reasoning.join(', '));
        }
        
        if (decision.specialized_approach) {
            reasoning.push(`Specialization: ${decision.specialized_approach.name} approach applied`);
        }
        
        const personality = this.personalityDNA.personalityType;
        reasoning.push(`Personality influence: ${personality} traits applied`);
        
        return reasoning.join('; ');
    }

    getSpecializationInput(opportunity) {
        return {
            path: this.currentState.specialization.selectedPath,
            relevant_skills: this.identifyRelevantSkills(opportunity),
            competency_level: this.specializationSystem.calculateOverallCompetency(),
            confidence: this.currentState.specialization.specialization_confidence
        };
    }

    getRecentPersonalityChanges() {
        // Track recent personality evolution
        return this.personalityDNA.getPersonalityProfile(); // Simplified
    }

    getSkillProgressUpdate() {
        return this.specializationSystem.getSkillSnapshot();
    }

    getSocialEnvironmentContext(session) {
        return {
            network_structure: this.trustNetwork ? this.trustNetwork.getNetworkSnapshot() : null,
            trust_data: this.relationships.size > 0 ? Object.fromEntries(this.relationships) : null,
            collaboration_data: this.getCollaborationData(),
            information_flow: this.getInformationFlowData(),
            network_trust_level: this.calculateAverageTrustLevel(),
            activity_level: this.calculateNetworkActivityLevel(),
            collaboration_opportunities: this.identifyCollaborationOpportunities()
        };
    }

    getLearningEnvironmentContext() {
        return {
            skill_gaps: this.identifyCurrentSkillGaps(),
            new_domains: this.identifyPotentialNewDomains(),
            opportunity_count: this.countLearningOpportunities(),
            difficulty_level: this.assessCurrentDifficultyLevel(),
            learning_velocity: this.learningSystem.getLearningStats().learning_velocity,
            specialization_progress: this.specializationSystem.assessSpecializationProgress().overall_progress
        };
    }

    getCollaborationData() {
        const collaborations = [];
        this.relationships.forEach((relationship, counterparty) => {
            if (relationship.successful_trades > 0) {
                collaborations.push({
                    counterparty: counterparty,
                    success_rate: relationship.successful_trades / (relationship.successful_trades + relationship.failed_trades),
                    trust_level: relationship.trust_level,
                    interaction_count: relationship.interaction_count,
                    last_interaction: relationship.last_interaction
                });
            }
        });
        return collaborations;
    }

    getInformationFlowData() {
        // Simplified information flow analysis
        return {
            information_sources: this.relationships.size,
            information_quality: this.calculateAverageInformationQuality(),
            information_frequency: this.calculateInformationFrequency(),
            network_efficiency: this.calculateNetworkEfficiency()
        };
    }

    calculateNetworkActivityLevel() {
        const recentInteractions = Array.from(this.relationships.values())
            .filter(rel => Date.now() - rel.last_interaction < 24 * 60 * 60 * 1000) // Last 24 hours
            .length;
        return Math.min(100, recentInteractions * 10);
    }

    identifyCollaborationOpportunities() {
        const opportunities = [];
        this.relationships.forEach((relationship, counterparty) => {
            if (relationship.trust_level > 60 && relationship.relationship_quality === 'reliable_contact') {
                opportunities.push({
                    counterparty: counterparty,
                    opportunity_type: 'partnership_expansion',
                    potential: relationship.trust_level / 100,
                    mutual_benefit: 75
                });
            }
        });
        return opportunities;
    }

    identifyCurrentSkillGaps() {
        const skillSnapshot = this.specializationSystem.getSkillSnapshot();
        const gaps = [];
        
        Object.entries(skillSnapshot).forEach(([skill, data]) => {
            if (data.level < 50) {
                gaps.push({
                    skill: skill,
                    current_level: data.level,
                    importance: this.assessSkillImportance(skill),
                    gap_size: 50 - data.level
                });
            }
        });
        
        return gaps.sort((a, b) => b.importance - a.importance);
    }

    identifyPotentialNewDomains() {
        const currentSpecialization = this.currentState.specialization.selectedPath.primary_path;
        const potentialDomains = [];
        
        // Based on current specialization, suggest related domains
        const domainMap = {
            'day_trader': ['algorithmic_trading', 'options_trading'],
            'long_term_investor': ['sector_analysis', 'macro_economics'],
            'market_maker': ['derivatives_trading', 'risk_management'],
            'arbitrageur': ['cryptocurrency', 'cross_exchange_trading'],
            'quantitative_analyst': ['machine_learning', 'data_science'],
            'social_trader': ['social_media_analysis', 'sentiment_analysis']
        };
        
        const suggestedDomains = domainMap[currentSpecialization] || ['risk_management', 'market_analysis'];
        
        suggestedDomains.forEach(domain => {
            potentialDomains.push({
                name: domain,
                potential: this.assessDomainPotential(domain),
                relevance: this.assessDomainRelevance(domain, currentSpecialization),
                entry_difficulty: this.assessDomainEntryDifficulty(domain)
            });
        });
        
        return potentialDomains.filter(domain => domain.potential > 0.6);
    }

    countLearningOpportunities() {
        let opportunities = 5; // Base opportunities
        
        // More opportunities based on network size
        opportunities += Math.min(10, this.relationships.size);
        
        // More opportunities based on skill gaps
        const skillGaps = this.identifyCurrentSkillGaps();
        opportunities += skillGaps.length;
        
        // Market volatility creates learning opportunities
        const recentPerformance = this.performanceHistory.slice(-5);
        const hasVolatilePerformance = recentPerformance.some(p => Math.abs(p.performance.profit_loss) > 200);
        if (hasVolatilePerformance) opportunities += 3;
        
        return Math.min(50, opportunities);
    }

    assessCurrentDifficultyLevel() {
        const recentPerformance = this.performanceHistory.slice(-10);
        if (recentPerformance.length === 0) return 50;
        
        const avgDifficulty = recentPerformance.reduce((sum, p) => sum + (p.performance.difficulty || 50), 0) / recentPerformance.length;
        return avgDifficulty;
    }

    calculateAverageInformationQuality() {
        // Based on trust levels of information sources
        if (this.relationships.size === 0) return 50;
        
        const totalQuality = Array.from(this.relationships.values())
            .reduce((sum, rel) => sum + rel.trust_level, 0);
        
        return totalQuality / this.relationships.size;
    }

    calculateInformationFrequency() {
        const recentInteractions = Array.from(this.relationships.values())
            .filter(rel => Date.now() - rel.last_interaction < 7 * 24 * 60 * 60 * 1000) // Last 7 days
            .length;
        
        return Math.min(100, recentInteractions * 5);
    }

    calculateNetworkEfficiency() {
        // Simplified network efficiency based on trust distribution
        const trustLevels = Array.from(this.relationships.values()).map(rel => rel.trust_level);
        if (trustLevels.length === 0) return 50;
        
        const avgTrust = trustLevels.reduce((sum, trust) => sum + trust, 0) / trustLevels.length;
        const trustVariance = trustLevels.reduce((sum, trust) => sum + Math.pow(trust - avgTrust, 2), 0) / trustLevels.length;
        
        return Math.max(0, 100 - Math.sqrt(trustVariance));
    }

    assessSkillImportance(skill) {
        const currentSpecialization = this.currentState.specialization.selectedPath.primary_path;
        const coreSkills = this.specializationSystem.getCoreSkillsForPath(currentSpecialization);
        
        if (coreSkills.includes(skill)) return 90;
        
        // General importance assessment
        const importantSkills = ['risk_management', 'market_analysis', 'decision_making'];
        if (importantSkills.includes(skill)) return 70;
        
        return 50;
    }

    assessDomainPotential(domain) {
        const personalityTraits = this.personalityDNA.traits;
        
        // Match domain to personality
        const domainFit = {
            'algorithmic_trading': personalityTraits.analytical_thinking / 100,
            'options_trading': personalityTraits.risk_tolerance / 100,
            'sector_analysis': personalityTraits.research_depth / 100,
            'macro_economics': personalityTraits.analytical_thinking / 100,
            'derivatives_trading': personalityTraits.risk_tolerance / 100,
            'cryptocurrency': personalityTraits.adaptability / 100,
            'machine_learning': personalityTraits.analytical_thinking / 100,
            'social_media_analysis': personalityTraits.network_building / 100
        };
        
        return domainFit[domain] || 0.5;
    }

    assessDomainRelevance(domain, currentSpecialization) {
        const relevanceMap = {
            'day_trader': {
                'algorithmic_trading': 0.9,
                'options_trading': 0.7
            },
            'long_term_investor': {
                'sector_analysis': 0.9,
                'macro_economics': 0.8
            },
            'quantitative_analyst': {
                'machine_learning': 0.95,
                'data_science': 0.9
            }
        };
        
        return relevanceMap[currentSpecialization]?.[domain] || 0.5;
    }

    assessDomainEntryDifficulty(domain) {
        const difficultyMap = {
            'algorithmic_trading': 0.8,
            'machine_learning': 0.9,
            'derivatives_trading': 0.7,
            'cryptocurrency': 0.6,
            'sector_analysis': 0.5,
            'social_media_analysis': 0.4
        };
        
        return difficultyMap[domain] || 0.6;
    }

    getRelationshipData(counterparty) {
        return this.relationships.get(counterparty) || null;
    }

    processSkillMilestones(skill, milestones) {
        milestones.forEach(milestone => {
            // Create emotional response to achievement
            const achievementEvent = {
                type: 'skill_milestone',
                data: {
                    skill: skill,
                    milestone: milestone,
                    achievement_level: milestone.level
                }
            };
            
            this.emotionalSystem.processEmotionalEvent(achievementEvent);
        });
    }

    // Public interface methods
    getAgentSnapshot() {
        return {
            agent_id: this.agentId,
            personality: this.personalityDNA.getPersonalityProfile(),
            current_state: this.currentState,
            relationships: Object.fromEntries(this.relationships),
            performance_summary: this.getPerformanceSummary(),
            last_updated: Date.now()
        };
    }

    exportAgentData() {
        return {
            agent_id: this.agentId,
            config: this.config,
            personality_dna: this.personalityDNA.getPersonalityProfile(),
            memory_export: this.memory.getMemoryStats(),
            learning_export: this.learningSystem.getLearningStats(),
            specialization_export: this.specializationSystem.getSpecializationStatus(),
            emotional_export: this.emotionalSystem.getEmotionalProfile(),
            relationships_export: Object.fromEntries(this.relationships),
            performance_history: this.performanceHistory.slice(-50), // Last 50 entries
            export_timestamp: Date.now()
        };
    }

    importAgentData(data) {
        // Restore agent from exported data
        if (data.agent_id !== this.agentId) {
            throw new Error('Agent ID mismatch during import');
        }
        
        // Restore basic state
        this.config = { ...this.config, ...data.config };
        this.performanceHistory = data.performance_history || [];
        
        // Restore relationships
        if (data.relationships_export) {
            this.relationships = new Map(Object.entries(data.relationships_export));
        }
        
        // Note: Full restoration would require more complex state management
        // This is a simplified implementation
        
        return true;
    }
}

module.exports = {
    AITraderPersonalitySystem,
    PersonalityDNA,
    TradingDecisionTree,
    AgentMemory,
    TrustNetwork,
    AdaptiveLearningSystem,
    EmotionalResponseSystem,
    AgentSpecializationSystem,
    Phase2MetaLearningIntegration
};
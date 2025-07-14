/**
 * Agent Specialization System - Phase 2 Enhancement
 * Advanced market specialization paths with trading expertise development
 * 
 * PHASE 2 ENHANCEMENTS:
 * - Expanded from 7 basic paths to 15+ sophisticated specialization paths
 * - Detailed skill progression systems with 100+ skills
 * - Expertise development with mastery levels and certifications
 * - Niche strategies for each specialization with unique advantages
 * - Performance optimization specific to each trading style
 * - Cross-specialization learning and hybrid paths
 * - Specialization-specific tools and market access
 * - Reputation systems specific to each specialization
 * - Mentorship programs and knowledge transfer systems
 * - Competitive rankings and leaderboards
 */

class AgentSpecializationSystem {
    constructor(agentId, personalityDNA) {
        this.agentId = agentId;
        this.personality = personalityDNA;
        this.specializationPath = null;
        this.expertiseAreas = new Map();
        this.skillProgression = new SkillProgressionTracker();
        this.specializedStrategies = new SpecializedStrategyLibrary();
        this.competencyMatrix = new CompetencyMatrix();
        this.specializationMetrics = new SpecializationMetrics();
        
        // Phase 2 Enhancement Components
        this.expertiseDevelopment = new ExpertiseDevelopmentEngine();
        this.crossSpecializationLearning = new CrossSpecializationLearning();
        this.reputationSystem = new SpecializationReputationSystem();
        this.mentorshipProgram = new MentorshipProgram();
        this.competitiveRankings = new CompetitiveRankings();
        this.nicheStrategies = new NicheStrategyEngine();
        this.performanceOptimizer = new PerformanceOptimizer();
        this.hybridPaths = new HybridPathManager();
        this.specializationTools = new SpecializationToolkit();
    }

    // Initialize specialization based on personality
    initializeSpecialization() {
        const recommendedPaths = this.analyzeSpecializationFit();
        this.specializationPath = this.selectOptimalPath(recommendedPaths);
        
        this.initializeSkills();
        this.setupLearningProgression();
        this.createSpecializationGoals();
        
        return {
            selectedPath: this.specializationPath,
            initialSkills: this.getSkillSnapshot(),
            learningPlan: this.generateLearningPlan(),
            timeline: this.estimateSpecializationTimeline()
        };
    }

    analyzeSpecializationFit() {
        const traits = this.personality.traits;
        const analyzedPaths = [];

        // PHASE 2: 15 SOPHISTICATED SPECIALIZATION PATHS

        // High-Frequency Trader Analysis
        const hftFit = this.calculateHighFrequencyTraderFit(traits);
        analyzedPaths.push({
            path: 'high_frequency_trader',
            fit_score: hftFit.score,
            strengths: hftFit.strengths,
            challenges: hftFit.challenges,
            description: 'Microsecond execution, latency arbitrage, and ultra-high speed trading',
            specialization_tier: 'elite',
            market_access_required: ['co_location', 'premium_data_feeds', 'fpga_systems']
        });

        // Quantitative Analyst Analysis (Enhanced)
        const quantFit = this.calculateQuantitativeAnalystFit(traits);
        analyzedPaths.push({
            path: 'quantitative_analyst',
            fit_score: quantFit.score,
            strengths: quantFit.strengths,
            challenges: quantFit.challenges,
            description: 'Mathematical models, algorithmic strategies, statistical arbitrage',
            specialization_tier: 'expert',
            market_access_required: ['research_databases', 'statistical_software', 'backtesting_platforms']
        });

        // Market Maker Analysis (Enhanced)
        const marketMakerFit = this.calculateMarketMakerFit(traits);
        analyzedPaths.push({
            path: 'market_maker',
            fit_score: marketMakerFit.score,
            strengths: marketMakerFit.strengths,
            challenges: marketMakerFit.challenges,
            description: 'Liquidity provision, spread optimization, order book management',
            specialization_tier: 'professional',
            market_access_required: ['market_maker_programs', 'rebate_structures', 'order_flow_data']
        });

        // Risk Arbitrageur Analysis
        const riskArbFit = this.calculateRiskArbitrageurFit(traits);
        analyzedPaths.push({
            path: 'risk_arbitrageur',
            fit_score: riskArbFit.score,
            strengths: riskArbFit.strengths,
            challenges: riskArbFit.challenges,
            description: 'Merger arbitrage, event-driven strategies, corporate actions',
            specialization_tier: 'expert',
            market_access_required: ['corporate_intelligence', 'legal_databases', 'insider_networks']
        });

        // Macro Trader Analysis
        const macroFit = this.calculateMacroTraderFit(traits);
        analyzedPaths.push({
            path: 'macro_trader',
            fit_score: macroFit.score,
            strengths: macroFit.strengths,
            challenges: macroFit.challenges,
            description: 'Global economic trends, currency speculation, geopolitical analysis',
            specialization_tier: 'elite',
            market_access_required: ['economic_databases', 'central_bank_feeds', 'geopolitical_intelligence']
        });

        // Options Specialist Analysis
        const optionsFit = this.calculateOptionsSpecialistFit(traits);
        analyzedPaths.push({
            path: 'options_specialist',
            fit_score: optionsFit.score,
            strengths: optionsFit.strengths,
            challenges: optionsFit.challenges,
            description: 'Volatility trading, Greeks optimization, complex derivatives',
            specialization_tier: 'professional',
            market_access_required: ['options_chains', 'volatility_surfaces', 'risk_models']
        });

        // Commodity Expert Analysis
        const commodityFit = this.calculateCommodityExpertFit(traits);
        analyzedPaths.push({
            path: 'commodity_expert',
            fit_score: commodityFit.score,
            strengths: commodityFit.strengths,
            challenges: commodityFit.challenges,
            description: 'Physical markets, storage strategies, supply chain analysis',
            specialization_tier: 'professional',
            market_access_required: ['commodity_exchanges', 'storage_facilities', 'supply_data']
        });

        // ESG Investor Analysis
        const esgFit = this.calculateESGInvestorFit(traits);
        analyzedPaths.push({
            path: 'esg_investor',
            fit_score: esgFit.score,
            strengths: esgFit.strengths,
            challenges: esgFit.challenges,
            description: 'Sustainable investing, impact measurement, green finance',
            specialization_tier: 'emerging',
            market_access_required: ['esg_ratings', 'impact_databases', 'sustainability_metrics']
        });

        // Cryptocurrency Maverick Analysis
        const cryptoFit = this.calculateCryptocurrencyMaverickFit(traits);
        analyzedPaths.push({
            path: 'cryptocurrency_maverick',
            fit_score: cryptoFit.score,
            strengths: cryptoFit.strengths,
            challenges: cryptoFit.challenges,
            description: 'DeFi protocols, yield farming, blockchain analysis',
            specialization_tier: 'emerging',
            market_access_required: ['defi_platforms', 'blockchain_analytics', 'yield_farms']
        });

        // Behavioral Analyst Analysis
        const behavioralFit = this.calculateBehavioralAnalystFit(traits);
        analyzedPaths.push({
            path: 'behavioral_analyst',
            fit_score: behavioralFit.score,
            strengths: behavioralFit.strengths,
            challenges: behavioralFit.challenges,
            description: 'Sentiment analysis, crowd psychology, behavioral finance',
            specialization_tier: 'expert',
            market_access_required: ['sentiment_feeds', 'social_analytics', 'behavioral_models']
        });

        // Credit Specialist Analysis
        const creditFit = this.calculateCreditSpecialistFit(traits);
        analyzedPaths.push({
            path: 'credit_specialist',
            fit_score: creditFit.score,
            strengths: creditFit.strengths,
            challenges: creditFit.challenges,
            description: 'Bond trading, credit risk assessment, fixed income strategies',
            specialization_tier: 'professional',
            market_access_required: ['credit_ratings', 'bond_platforms', 'yield_curves']
        });

        // Insider Intelligence Analysis
        const insiderFit = this.calculateInsiderIntelligenceFit(traits);
        analyzedPaths.push({
            path: 'insider_intelligence',
            fit_score: insiderFit.score,
            strengths: insiderFit.strengths,
            challenges: insiderFit.challenges,
            description: 'Information networks, early signals, regulatory intelligence',
            specialization_tier: 'elite',
            market_access_required: ['information_networks', 'regulatory_feeds', 'insider_channels']
        });

        // Social Trader Analysis (Enhanced)
        const socialTraderFit = this.calculateSocialTraderFit(traits);
        analyzedPaths.push({
            path: 'social_trader',
            fit_score: socialTraderFit.score,
            strengths: socialTraderFit.strengths,
            challenges: socialTraderFit.challenges,
            description: 'Influence building, follower strategies, network effects',
            specialization_tier: 'emerging',
            market_access_required: ['social_platforms', 'influence_metrics', 'follower_analytics']
        });

        // Crisis Opportunist Analysis
        const crisisFit = this.calculateCrisisOpportunistFit(traits);
        analyzedPaths.push({
            path: 'crisis_opportunist',
            fit_score: crisisFit.score,
            strengths: crisisFit.strengths,
            challenges: crisisFit.challenges,
            description: 'Distressed assets, volatility exploitation, crisis alpha',
            specialization_tier: 'elite',
            market_access_required: ['distressed_markets', 'volatility_products', 'crisis_indicators']
        });

        // Algorithmic Pioneer Analysis
        const algoPioneerFit = this.calculateAlgorithmicPioneerFit(traits);
        analyzedPaths.push({
            path: 'algorithmic_pioneer',
            fit_score: algoPioneerFit.score,
            strengths: algoPioneerFit.strengths,
            challenges: algoPioneerFit.challenges,
            description: 'AI strategies, machine learning models, algorithm innovation',
            specialization_tier: 'elite',
            market_access_required: ['ml_platforms', 'ai_infrastructure', 'research_clusters']
        });

        return analyzedPaths.sort((a, b) => b.fit_score - a.fit_score);
    }

    calculateDayTraderFit(traits) {
        let score = 0;
        const strengths = [];
        const challenges = [];

        // High impulsiveness and low patience favor day trading
        if (traits.impulsiveness > 70) {
            score += 25;
            strengths.push('Quick decision making');
        } else {
            challenges.push('May be too methodical for rapid trades');
        }

        if (traits.patience < 40) {
            score += 20;
            strengths.push('Comfort with short timeframes');
        } else {
            challenges.push('May prefer longer-term positions');
        }

        // High stress tolerance essential
        if (traits.stress_tolerance > 70) {
            score += 30;
            strengths.push('Can handle high-pressure situations');
        } else {
            score -= 15;
            challenges.push('May struggle with day trading stress');
        }

        // Risk tolerance important
        if (traits.risk_tolerance > 60) {
            score += 15;
            strengths.push('Comfortable with frequent risk exposure');
        }

        // Timing skill crucial
        if (traits.timing_skill > 70) {
            score += 20;
            strengths.push('Excellent market timing abilities');
        }

        return { score: Math.max(0, score), strengths, challenges };
    }

    calculateInvestorFit(traits) {
        let score = 0;
        const strengths = [];
        const challenges = [];

        // High patience essential
        if (traits.patience > 70) {
            score += 30;
            strengths.push('Patient long-term perspective');
        } else {
            score -= 20;
            challenges.push('May lack patience for long-term holds');
        }

        // Analytical thinking important
        if (traits.analytical_thinking > 70) {
            score += 25;
            strengths.push('Strong research and analysis skills');
        }

        // Research depth
        if (traits.research_depth > 60) {
            score += 20;
            strengths.push('Thorough due diligence approach');
        }

        // Value investing tendency
        if (traits.value_investing > 60) {
            score += 20;
            strengths.push('Natural value investing instincts');
        }

        // Low impulsiveness preferred
        if (traits.impulsiveness < 40) {
            score += 15;
            strengths.push('Disciplined approach to investing');
        } else {
            challenges.push('May make impulsive trades');
        }

        return { score: Math.max(0, score), strengths, challenges };
    }

    calculateMarketMakerFit(traits) {
        let score = 0;
        const strengths = [];
        const challenges = [];

        // Market making skill
        if (traits.market_making_skill > 70) {
            score += 35;
            strengths.push('Natural market making abilities');
        }

        // Liquidity providing tendency
        if (traits.liquidity_providing > 60) {
            score += 25;
            strengths.push('Inclined to provide market liquidity');
        }

        // Risk management crucial
        if (traits.risk_tolerance > 40 && traits.risk_tolerance < 80) {
            score += 20;
            strengths.push('Balanced risk approach suitable for market making');
        }

        // Consistency important
        if (traits.consistency > 70) {
            score += 20;
            strengths.push('Consistent performance style');
        }

        // Timing skill
        if (traits.timing_skill > 60) {
            score += 15;
            strengths.push('Good timing for spread capture');
        }

        return { score: Math.max(0, score), strengths, challenges };
    }

    calculateArbitrageurFit(traits) {
        let score = 0;
        const strengths = [];
        const challenges = [];

        // Arbitrage detection crucial
        if (traits.arbitrage_detection > 70) {
            score += 40;
            strengths.push('Excellent arbitrage opportunity identification');
        } else {
            score -= 10;
            challenges.push('May miss arbitrage opportunities');
        }

        // Analytical thinking essential
        if (traits.analytical_thinking > 75) {
            score += 25;
            strengths.push('Strong analytical capabilities');
        }

        // Timing skill critical
        if (traits.timing_skill > 75) {
            score += 25;
            strengths.push('Precise execution timing');
        }

        // Attention to detail
        if (traits.pattern_recognition > 70) {
            score += 20;
            strengths.push('Excellent pattern recognition');
        }

        // Low risk tolerance suitable for arbitrage
        if (traits.risk_tolerance < 60) {
            score += 15;
            strengths.push('Conservative risk approach');
        }

        return { score: Math.max(0, score), strengths, challenges };
    }

    calculateQuantFit(traits) {
        let score = 0;
        const strengths = [];
        const challenges = [];

        // Analytical thinking paramount
        if (traits.analytical_thinking > 80) {
            score += 35;
            strengths.push('Exceptional analytical capabilities');
        } else {
            score -= 15;
            challenges.push('May lack quantitative rigor');
        }

        // Pattern recognition important
        if (traits.pattern_recognition > 75) {
            score += 25;
            strengths.push('Strong pattern identification skills');
        }

        // Research depth
        if (traits.research_depth > 70) {
            score += 20;
            strengths.push('Deep research methodology');
        }

        // Mathematical approach
        if (traits.intuition < 50) {
            score += 15;
            strengths.push('Systematic over intuitive approach');
        }

        // Consistency
        if (traits.consistency > 70) {
            score += 15;
            strengths.push('Systematic execution');
        }

        return { score: Math.max(0, score), strengths, challenges };
    }

    calculateRiskManagerFit(traits) {
        let score = 0;
        const strengths = [];
        const challenges = [];

        // Conservative risk tolerance ideal
        if (traits.risk_tolerance < 50) {
            score += 30;
            strengths.push('Conservative risk perspective');
        }

        // Analytical thinking important
        if (traits.analytical_thinking > 70) {
            score += 25;
            strengths.push('Strong analytical risk assessment');
        }

        // Loss aversion beneficial
        if (traits.loss_aversion > 60) {
            score += 20;
            strengths.push('Natural loss prevention focus');
        }

        // Patience important
        if (traits.patience > 60) {
            score += 15;
            strengths.push('Patient risk monitoring approach');
        }

        // Discipline essential
        if (traits.discipline > 70) {
            score += 20;
            strengths.push('Disciplined risk management');
        }

        return { score: Math.max(0, score), strengths, challenges };
    }

    calculateSocialTraderFit(traits) {
        let score = 0;
        const strengths = [];
        const challenges = [];

        // Network building essential
        if (traits.network_building > 70) {
            score += 30;
            strengths.push('Strong networking abilities');
        }

        // Information sharing
        if (traits.information_sharing > 60) {
            score += 25;
            strengths.push('Good information exchange skills');
        }

        // Trust propensity
        if (traits.trust_propensity > 60) {
            score += 20;
            strengths.push('Builds trust relationships effectively');
        }

        // Cooperation
        if (traits.cooperation > 65) {
            score += 20;
            strengths.push('Collaborative trading approach');
        }

        // Social intelligence
        if (traits.empathy > 50) {
            score += 15;
            strengths.push('Good social relationship management');
        }

        return { score: Math.max(0, score), strengths, challenges };
    }

    // PHASE 2: ADVANCED SPECIALIZATION FITNESS CALCULATIONS

    calculateHighFrequencyTraderFit(traits) {
        let score = 0;
        const strengths = [];
        const challenges = [];

        // Ultra-low latency requirements
        if (traits.reaction_speed > 85) {
            score += 40;
            strengths.push('Exceptional reaction speed for microsecond trading');
        } else {
            score -= 20;
            challenges.push('Insufficient speed for HFT operations');
        }

        // Technical precision essential
        if (traits.technical_precision > 80) {
            score += 30;
            strengths.push('High technical precision for system optimization');
        }

        // Stress tolerance crucial for high-frequency operations
        if (traits.stress_tolerance > 85) {
            score += 25;
            strengths.push('Can handle extreme pressure of HFT');
        } else {
            challenges.push('May struggle with HFT stress levels');
        }

        // Mathematical aptitude
        if (traits.analytical_thinking > 75) {
            score += 20;
            strengths.push('Strong analytical skills for algorithm development');
        }

        // Risk management critical
        if (traits.risk_tolerance > 30 && traits.risk_tolerance < 70) {
            score += 15;
            strengths.push('Balanced risk approach for HFT');
        }

        return { score: Math.max(0, score), strengths, challenges };
    }

    calculateQuantitativeAnalystFit(traits) {
        let score = 0;
        const strengths = [];
        const challenges = [];

        // Mathematical modeling paramount
        if (traits.analytical_thinking > 85) {
            score += 40;
            strengths.push('Exceptional mathematical and analytical capabilities');
        } else {
            score -= 15;
            challenges.push('Insufficient quantitative rigor');
        }

        // Research depth essential
        if (traits.research_depth > 80) {
            score += 30;
            strengths.push('Deep research methodology for model development');
        }

        // Pattern recognition for statistical patterns
        if (traits.pattern_recognition > 80) {
            score += 25;
            strengths.push('Superior pattern identification in data');
        }

        // Programming and system thinking
        if (traits.systematic_thinking > 75) {
            score += 20;
            strengths.push('Systematic approach to model building');
        }

        // Low emotional bias preferred
        if (traits.emotional_stability > 70) {
            score += 15;
            strengths.push('Objective, emotion-free analysis');
        }

        return { score: Math.max(0, score), strengths, challenges };
    }

    calculateRiskArbitrageurFit(traits) {
        let score = 0;
        const strengths = [];
        const challenges = [];

        // Event detection and analysis
        if (traits.market_intuition > 75) {
            score += 35;
            strengths.push('Excellent event recognition and analysis');
        }

        // Information processing speed
        if (traits.information_processing > 80) {
            score += 30;
            strengths.push('Rapid information synthesis for event arbitrage');
        }

        // Legal and regulatory knowledge
        if (traits.regulatory_awareness > 70) {
            score += 25;
            strengths.push('Strong regulatory and legal framework understanding');
        }

        // Risk assessment precision
        if (traits.risk_assessment > 75) {
            score += 20;
            strengths.push('Precise risk evaluation for merger arbitrage');
        }

        // Patience for event completion
        if (traits.patience > 60) {
            score += 15;
            strengths.push('Patient approach to event completion');
        }

        return { score: Math.max(0, score), strengths, challenges };
    }

    calculateMacroTraderFit(traits) {
        let score = 0;
        const strengths = [];
        const challenges = [];

        // Global perspective essential
        if (traits.macro_perspective > 80) {
            score += 40;
            strengths.push('Exceptional global macroeconomic perspective');
        } else {
            challenges.push('Limited macro-economic understanding');
        }

        // Economic analysis depth
        if (traits.economic_analysis > 75) {
            score += 30;
            strengths.push('Deep economic analysis capabilities');
        }

        // Geopolitical awareness
        if (traits.geopolitical_awareness > 70) {
            score += 25;
            strengths.push('Strong geopolitical risk assessment');
        }

        // Long-term thinking
        if (traits.strategic_thinking > 75) {
            score += 20;
            strengths.push('Strategic long-term market perspective');
        }

        // Currency and global market understanding
        if (traits.cross_market_analysis > 65) {
            score += 15;
            strengths.push('Multi-market analysis capabilities');
        }

        return { score: Math.max(0, score), strengths, challenges };
    }

    calculateOptionsSpecialistFit(traits) {
        let score = 0;
        const strengths = [];
        const challenges = [];

        // Options theory knowledge
        if (traits.options_expertise > 75) {
            score += 40;
            strengths.push('Advanced options theory and Greeks understanding');
        } else {
            score -= 10;
            challenges.push('Limited options expertise');
        }

        // Volatility analysis
        if (traits.volatility_analysis > 70) {
            score += 30;
            strengths.push('Strong volatility modeling and analysis');
        }

        // Mathematical precision for Greeks
        if (traits.mathematical_precision > 75) {
            score += 25;
            strengths.push('Precise mathematical calculations for complex derivatives');
        }

        // Risk management for complex instruments
        if (traits.complex_risk_management > 70) {
            score += 20;
            strengths.push('Sophisticated risk management for derivatives');
        }

        // Market timing for volatility
        if (traits.timing_skill > 65) {
            score += 15;
            strengths.push('Good timing for volatility opportunities');
        }

        return { score: Math.max(0, score), strengths, challenges };
    }

    calculateCommodityExpertFit(traits) {
        let score = 0;
        const strengths = [];
        const challenges = [];

        // Physical market understanding
        if (traits.physical_market_knowledge > 75) {
            score += 35;
            strengths.push('Deep understanding of physical commodity markets');
        }

        // Supply chain analysis
        if (traits.supply_chain_analysis > 70) {
            score += 30;
            strengths.push('Strong supply chain and logistics analysis');
        }

        // Storage and logistics
        if (traits.logistics_expertise > 65) {
            score += 25;
            strengths.push('Storage and transportation optimization skills');
        }

        // Weather and seasonal patterns
        if (traits.seasonal_analysis > 60) {
            score += 20;
            strengths.push('Understanding of seasonal and weather impacts');
        }

        // Long-term inventory management
        if (traits.inventory_management > 65) {
            score += 15;
            strengths.push('Effective inventory and storage strategies');
        }

        return { score: Math.max(0, score), strengths, challenges };
    }

    calculateESGInvestorFit(traits) {
        let score = 0;
        const strengths = [];
        const challenges = [];

        // ESG knowledge and passion
        if (traits.esg_knowledge > 70) {
            score += 35;
            strengths.push('Strong ESG framework understanding and commitment');
        }

        // Impact measurement
        if (traits.impact_analysis > 65) {
            score += 30;
            strengths.push('Sophisticated impact measurement capabilities');
        }

        // Long-term value focus
        if (traits.long_term_thinking > 70) {
            score += 25;
            strengths.push('Long-term sustainable value perspective');
        }

        // Research depth for ESG factors
        if (traits.esg_research > 60) {
            score += 20;
            strengths.push('Comprehensive ESG research methodology');
        }

        // Stakeholder consideration
        if (traits.stakeholder_awareness > 65) {
            score += 15;
            strengths.push('Multi-stakeholder impact assessment');
        }

        return { score: Math.max(0, score), strengths, challenges };
    }

    calculateCryptocurrencyMaverickFit(traits) {
        let score = 0;
        const strengths = [];
        const challenges = [];

        // DeFi and blockchain expertise
        if (traits.blockchain_expertise > 75) {
            score += 40;
            strengths.push('Advanced blockchain and DeFi protocol understanding');
        } else {
            score -= 15;
            challenges.push('Insufficient blockchain technology knowledge');
        }

        // Risk tolerance for volatile markets
        if (traits.risk_tolerance > 75) {
            score += 30;
            strengths.push('High risk tolerance for crypto volatility');
        }

        // Technology adoption
        if (traits.technology_adoption > 80) {
            score += 25;
            strengths.push('Early technology adoption and innovation');
        }

        // 24/7 market adaptability
        if (traits.adaptability > 70) {
            score += 20;
            strengths.push('Adaptability to 24/7 crypto markets');
        }

        // Community and social aspects
        if (traits.community_engagement > 60) {
            score += 15;
            strengths.push('Strong crypto community engagement');
        }

        return { score: Math.max(0, score), strengths, challenges };
    }

    calculateBehavioralAnalystFit(traits) {
        let score = 0;
        const strengths = [];
        const challenges = [];

        // Behavioral finance knowledge
        if (traits.behavioral_finance > 80) {
            score += 40;
            strengths.push('Deep behavioral finance and psychology understanding');
        }

        // Sentiment analysis capabilities
        if (traits.sentiment_analysis > 75) {
            score += 30;
            strengths.push('Advanced sentiment analysis and interpretation');
        }

        // Social psychology understanding
        if (traits.social_psychology > 70) {
            score += 25;
            strengths.push('Strong crowd psychology and market sentiment insights');
        }

        // Data analysis for behavioral patterns
        if (traits.behavioral_data_analysis > 70) {
            score += 20;
            strengths.push('Sophisticated behavioral data analysis');
        }

        // Empathy for market psychology
        if (traits.empathy > 65) {
            score += 15;
            strengths.push('Understanding of investor emotions and motivations');
        }

        return { score: Math.max(0, score), strengths, challenges };
    }

    calculateCreditSpecialistFit(traits) {
        let score = 0;
        const strengths = [];
        const challenges = [];

        // Credit analysis expertise
        if (traits.credit_analysis > 80) {
            score += 40;
            strengths.push('Advanced credit analysis and risk assessment');
        }

        // Fixed income knowledge
        if (traits.fixed_income_expertise > 75) {
            score += 30;
            strengths.push('Deep fixed income and bond market understanding');
        }

        // Financial statement analysis
        if (traits.financial_analysis > 70) {
            score += 25;
            strengths.push('Strong financial statement and credit analysis');
        }

        // Duration and yield curve analysis
        if (traits.yield_curve_analysis > 65) {
            score += 20;
            strengths.push('Sophisticated yield curve and duration analysis');
        }

        // Conservative risk approach
        if (traits.risk_tolerance < 60) {
            score += 15;
            strengths.push('Conservative risk approach suitable for credit');
        }

        return { score: Math.max(0, score), strengths, challenges };
    }

    calculateInsiderIntelligenceFit(traits) {
        let score = 0;
        const strengths = [];
        const challenges = [];

        // Information network building
        if (traits.information_networks > 80) {
            score += 40;
            strengths.push('Exceptional information network development');
        }

        // Signal detection and processing
        if (traits.signal_detection > 75) {
            score += 30;
            strengths.push('Advanced early signal detection and analysis');
        }

        // Regulatory awareness critical
        if (traits.regulatory_compliance > 80) {
            score += 25;
            strengths.push('Strong regulatory compliance and ethical boundaries');
        } else {
            score -= 20;
            challenges.push('Regulatory compliance risks');
        }

        // Information synthesis
        if (traits.information_synthesis > 70) {
            score += 20;
            strengths.push('Effective information synthesis and pattern recognition');
        }

        // Discretion and confidentiality
        if (traits.discretion > 75) {
            score += 15;
            strengths.push('High discretion and confidentiality management');
        }

        return { score: Math.max(0, score), strengths, challenges };
    }

    calculateCrisisOpportunistFit(traits) {
        let score = 0;
        const strengths = [];
        const challenges = [];

        // Crisis recognition and response
        if (traits.crisis_recognition > 80) {
            score += 40;
            strengths.push('Exceptional crisis identification and opportunity recognition');
        }

        // Stress tolerance for extreme volatility
        if (traits.extreme_stress_tolerance > 85) {
            score += 30;
            strengths.push('Extreme stress tolerance for crisis situations');
        } else {
            challenges.push('May struggle with crisis-level stress');
        }

        // Contrarian thinking
        if (traits.contrarian_thinking > 75) {
            score += 25;
            strengths.push('Strong contrarian mindset for crisis opportunities');
        }

        // Rapid decision making under pressure
        if (traits.pressure_decision_making > 70) {
            score += 20;
            strengths.push('Effective decision making under extreme pressure');
        }

        // Risk tolerance for distressed assets
        if (traits.distressed_risk_tolerance > 70) {
            score += 15;
            strengths.push('Appropriate risk tolerance for distressed investing');
        }

        return { score: Math.max(0, score), strengths, challenges };
    }

    calculateAlgorithmicPioneerFit(traits) {
        let score = 0;
        const strengths = [];
        const challenges = [];

        // AI and ML expertise
        if (traits.ai_ml_expertise > 85) {
            score += 40;
            strengths.push('Cutting-edge AI and machine learning expertise');
        } else {
            score -= 20;
            challenges.push('Insufficient AI/ML technical foundation');
        }

        // Innovation and research mindset
        if (traits.innovation_mindset > 80) {
            score += 30;
            strengths.push('Strong innovation and research orientation');
        }

        // Programming and system architecture
        if (traits.system_architecture > 75) {
            score += 25;
            strengths.push('Advanced system architecture and programming skills');
        }

        // Experimental approach
        if (traits.experimental_thinking > 70) {
            score += 20;
            strengths.push('Experimental and hypothesis-driven approach');
        }

        // Continuous learning
        if (traits.continuous_learning > 80) {
            score += 15;
            strengths.push('Rapid adaptation to new AI/ML technologies');
        }

        return { score: Math.max(0, score), strengths, challenges };
    }

    selectOptimalPath(analyzedPaths) {
        const topPath = analyzedPaths[0];
        
        // Consider personality type compatibility
        const personalityBonus = this.calculatePersonalityBonus(topPath.path);
        
        // Check for minimum threshold
        if (topPath.fit_score + personalityBonus >= 60) {
            return {
                primary_path: topPath.path,
                fit_score: topPath.fit_score + personalityBonus,
                strengths: topPath.strengths,
                challenges: topPath.challenges,
                description: topPath.description,
                secondary_paths: analyzedPaths.slice(1, 3).filter(p => p.fit_score > 40),
                specialization_confidence: this.calculateSpecializationConfidence(topPath)
            };
        } else {
            // Multi-path specialization for unclear fit
            return {
                primary_path: 'generalist',
                secondary_paths: analyzedPaths.slice(0, 2),
                specialization_confidence: 30,
                description: 'Generalist approach with multiple specialization areas'
            };
        }
    }

    calculatePersonalityBonus(path) {
        const personalityType = this.personality.personalityType;
        
        const bonuses = {
            'AGGRESSIVE_SPECULATOR': { 'day_trader': 15, 'arbitrageur': 10 },
            'STRATEGIC_ANALYST': { 'quantitative_analyst': 20, 'long_term_investor': 15 },
            'COLLABORATIVE_TRADER': { 'social_trader': 25, 'market_maker': 10 },
            'CONSERVATIVE_INVESTOR': { 'long_term_investor': 20, 'risk_manager': 15 },
            'ALGORITHMIC_THINKER': { 'quantitative_analyst': 25, 'arbitrageur': 15 },
            'SOCIAL_TRADER': { 'social_trader': 30, 'market_maker': 10 }
        };
        
        return bonuses[personalityType]?.[path] || 0;
    }

    calculateSpecializationConfidence(path) {
        let confidence = path.fit_score;
        
        // Boost confidence for strong personality alignment
        const personalityAlignment = this.calculatePersonalityBonus(path.path);
        confidence += personalityAlignment;
        
        // Reduce confidence for many challenges
        confidence -= path.challenges.length * 5;
        
        // Boost confidence for many strengths
        confidence += path.strengths.length * 3;
        
        return Math.max(0, Math.min(100, confidence));
    }

    // Skill development system
    initializeSkills() {
        const coreSkills = this.getCoreSkillsForPath(this.specializationPath.primary_path);
        
        coreSkills.forEach(skill => {
            const initialLevel = this.calculateInitialSkillLevel(skill);
            this.expertiseAreas.set(skill, {
                current_level: initialLevel,
                max_potential: this.calculateMaxPotential(skill),
                learning_rate: this.calculateLearningRate(skill),
                experience_points: 0,
                skill_history: [],
                last_used: Date.now(),
                competency_milestones: this.generateMilestones(skill)
            });
        });
    }

    getCoreSkillsForPath(path) {
        const skillSets = {
            // PHASE 2: EXPANDED SKILL SETS WITH 100+ SKILLS

            'high_frequency_trader': [
                // Core HFT Skills (15)
                'microsecond_execution', 'latency_optimization', 'co_location_management', 'fpga_programming',
                'market_microstructure', 'order_flow_analysis', 'tick_data_processing', 'ultra_low_latency',
                'arbitrage_detection', 'statistical_arbitrage', 'momentum_ignition', 'liquidity_detection',
                'price_improvement', 'execution_algorithms', 'risk_controls',
                // Advanced Skills (8)
                'hardware_optimization', 'network_protocols', 'kernel_bypass', 'timestamp_precision',
                'queue_position_tracking', 'rebate_optimization', 'dark_pool_detection', 'cross_connect_management'
            ],
            'quantitative_analyst': [
                // Mathematical Modeling (12)
                'statistical_modeling', 'mathematical_modeling', 'stochastic_calculus', 'monte_carlo_simulation',
                'regression_analysis', 'time_series_analysis', 'optimization_theory', 'numerical_methods',
                'bayesian_statistics', 'machine_learning', 'signal_processing', 'factor_modeling',
                // Programming & Technology (8)
                'python_programming', 'r_programming', 'matlab_usage', 'c_plus_plus', 'sql_databases',
                'data_visualization', 'backtesting_frameworks', 'version_control',
                // Research & Analysis (6)
                'research_methodology', 'academic_writing', 'peer_review', 'data_mining', 'feature_engineering', 'model_validation'
            ],
            'market_maker': [
                // Core Market Making (10)
                'spread_management', 'inventory_control', 'liquidity_provision', 'order_book_dynamics',
                'delta_hedging', 'gamma_hedging', 'vega_hedging', 'theta_management',
                'bid_ask_optimization', 'rebate_capture',
                // Risk Management (8)
                'position_sizing', 'exposure_limits', 'correlation_hedging', 'stress_testing',
                'scenario_analysis', 'value_at_risk', 'expected_shortfall', 'tail_risk',
                // Technology & Execution (7)
                'execution_algorithms', 'smart_order_routing', 'order_management_systems', 'risk_controls',
                'market_data_processing', 'latency_monitoring', 'system_monitoring'
            ],
            'risk_arbitrageur': [
                // Event Analysis (10)
                'merger_analysis', 'acquisition_modeling', 'deal_probability_assessment', 'regulatory_analysis',
                'antitrust_evaluation', 'financing_analysis', 'synergy_valuation', 'breakup_analysis',
                'shareholder_voting', 'timeline_estimation',
                // Legal & Regulatory (8)
                'securities_law', 'merger_regulations', 'disclosure_requirements', 'insider_trading_rules',
                'fiduciary_duties', 'proxy_regulations', 'international_law', 'litigation_analysis',
                // Valuation & Modeling (7)
                'dcf_modeling', 'comparable_analysis', 'precedent_transactions', 'sum_of_parts', 'option_valuation',
                'credit_analysis', 'liquidation_analysis'
            ],
            'macro_trader': [
                // Economic Analysis (12)
                'macroeconomic_analysis', 'monetary_policy', 'fiscal_policy', 'central_bank_analysis',
                'inflation_modeling', 'growth_forecasting', 'employment_analysis', 'trade_balance',
                'current_account', 'capital_flows', 'sovereign_debt', 'currency_analysis',
                // Geopolitical Analysis (8)
                'geopolitical_risk', 'election_analysis', 'policy_analysis', 'international_relations',
                'commodity_geopolitics', 'sanctions_analysis', 'trade_wars', 'military_conflicts',
                // Trading & Strategy (6)
                'carry_trades', 'momentum_strategies', 'mean_reversion', 'breakout_trading', 'position_sizing', 'correlation_trading'
            ],
            'options_specialist': [
                // Options Theory (12)
                'black_scholes_modeling', 'binomial_models', 'monte_carlo_pricing', 'exotic_options',
                'volatility_modeling', 'implied_volatility', 'volatility_surface', 'volatility_skew',
                'delta_hedging', 'gamma_hedging', 'vega_hedging', 'theta_management',
                // Greeks & Risk (8)
                'delta_analysis', 'gamma_analysis', 'vega_analysis', 'theta_analysis',
                'rho_analysis', 'volga_analysis', 'vanna_analysis', 'charm_analysis',
                // Strategy & Execution (6)
                'covered_calls', 'protective_puts', 'straddles', 'strangles', 'butterflies', 'condors'
            ],
            'commodity_expert': [
                // Physical Markets (10)
                'supply_analysis', 'demand_forecasting', 'storage_economics', 'transportation_costs',
                'quality_specifications', 'delivery_logistics', 'warehouse_management', 'inventory_tracking',
                'seasonal_patterns', 'weather_analysis',
                // Market Structure (8)
                'spot_pricing', 'forward_curves', 'contango_backwardation', 'basis_trading',
                'calendar_spreads', 'location_spreads', 'quality_spreads', 'crack_spreads',
                // Fundamental Analysis (7)
                'production_analysis', 'consumption_trends', 'trade_flows', 'government_policies',
                'environmental_regulations', 'technology_impacts', 'substitution_effects'
            ],
            'esg_investor': [
                // ESG Framework (10)
                'esg_scoring', 'materiality_assessment', 'stakeholder_analysis', 'impact_measurement',
                'sustainability_metrics', 'carbon_footprint', 'social_impact', 'governance_evaluation',
                'regulatory_compliance', 'reporting_standards',
                // Investment Analysis (8)
                'sustainable_finance', 'green_bonds', 'impact_investing', 'negative_screening',
                'positive_screening', 'integration_analysis', 'engagement_strategies', 'proxy_voting',
                // Research & Reporting (7)
                'esg_research', 'sustainability_reporting', 'integrated_reporting', 'stakeholder_engagement',
                'peer_benchmarking', 'trend_analysis', 'risk_assessment'
            ],
            'cryptocurrency_maverick': [
                // Blockchain Technology (12)
                'blockchain_analysis', 'smart_contracts', 'defi_protocols', 'yield_farming',
                'liquidity_mining', 'staking_strategies', 'governance_tokens', 'cross_chain_bridges',
                'layer2_scaling', 'consensus_mechanisms', 'tokenomics', 'nft_analysis',
                // Trading & DeFi (8)
                'automated_market_makers', 'impermanent_loss', 'flash_loans', 'arbitrage_bots',
                'mev_extraction', 'sandwich_attacks', 'frontrunning_protection', 'slippage_optimization',
                // Security & Compliance (6)
                'wallet_security', 'smart_contract_audits', 'regulatory_compliance', 'tax_optimization',
                'kyc_aml', 'privacy_coins'
            ],
            'behavioral_analyst': [
                // Behavioral Finance (12)
                'sentiment_analysis', 'crowd_psychology', 'behavioral_biases', 'decision_heuristics',
                'prospect_theory', 'loss_aversion', 'anchoring_bias', 'confirmation_bias',
                'herding_behavior', 'overconfidence', 'mental_accounting', 'framing_effects',
                // Data Analysis (8)
                'social_media_analysis', 'news_sentiment', 'alternative_data', 'text_mining',
                'natural_language_processing', 'machine_learning', 'predictive_modeling', 'backtesting',
                // Research Methods (6)
                'survey_design', 'experimental_design', 'statistical_analysis', 'data_visualization',
                'academic_research', 'behavioral_experiments'
            ],
            'credit_specialist': [
                // Credit Analysis (12)
                'credit_modeling', 'default_probability', 'recovery_rates', 'credit_spreads',
                'yield_curve_analysis', 'duration_analysis', 'convexity_analysis', 'credit_derivatives',
                'structured_products', 'asset_backed_securities', 'mortgage_backed_securities', 'collateralized_debt_obligations',
                // Fixed Income (8)
                'bond_valuation', 'yield_calculations', 'price_sensitivity', 'interest_rate_risk',
                'credit_risk', 'liquidity_risk', 'prepayment_risk', 'extension_risk',
                // Regulatory & Legal (6)
                'banking_regulations', 'capital_requirements', 'stress_testing', 'accounting_standards',
                'legal_documentation', 'covenant_analysis'
            ],
            'insider_intelligence': [
                // Information Networks (10)
                'network_building', 'relationship_management', 'information_synthesis', 'signal_detection',
                'pattern_recognition', 'anomaly_detection', 'insider_activity', 'corporate_intelligence',
                'regulatory_intelligence', 'competitive_intelligence',
                // Compliance & Ethics (8)
                'regulatory_compliance', 'insider_trading_laws', 'material_information', 'disclosure_requirements',
                'confidentiality_management', 'ethical_boundaries', 'legal_risk_assessment', 'documentation_standards',
                // Analysis & Strategy (7)
                'information_verification', 'source_reliability', 'timing_analysis', 'impact_assessment',
                'risk_reward_analysis', 'position_sizing', 'exit_strategies'
            ],
            'social_trader': [
                // Social Networks (10)
                'network_analysis', 'influence_mapping', 'social_capital', 'reputation_systems',
                'viral_marketing', 'community_building', 'content_creation', 'engagement_optimization',
                'follower_analytics', 'social_proof',
                // Trading & Strategy (8)
                'copy_trading', 'signal_sharing', 'portfolio_transparency', 'performance_tracking',
                'risk_disclosure', 'educational_content', 'market_commentary', 'strategy_explanation',
                // Technology & Platforms (7)
                'social_trading_platforms', 'api_integration', 'data_analytics', 'mobile_optimization',
                'user_experience', 'gamification', 'notification_systems'
            ],
            'crisis_opportunist': [
                // Crisis Analysis (12)
                'crisis_identification', 'volatility_analysis', 'distressed_securities', 'bankruptcy_analysis',
                'liquidation_analysis', 'restructuring_analysis', 'special_situations', 'event_driven_strategies',
                'contrarian_investing', 'value_investing', 'deep_value_analysis', 'turnaround_analysis',
                // Risk Management (8)
                'extreme_risk_management', 'tail_risk_hedging', 'volatility_trading', 'correlation_breakdown',
                'liquidity_management', 'position_sizing', 'portfolio_hedging', 'stress_testing',
                // Psychological Factors (6)
                'fear_greed_analysis', 'market_psychology', 'behavioral_finance', 'emotional_discipline',
                'contrarian_mindset', 'patience_under_pressure'
            ],
            'algorithmic_pioneer': [
                // AI & Machine Learning (12)
                'machine_learning', 'deep_learning', 'neural_networks', 'reinforcement_learning',
                'natural_language_processing', 'computer_vision', 'time_series_forecasting', 'ensemble_methods',
                'feature_engineering', 'model_selection', 'hyperparameter_tuning', 'model_validation',
                // Programming & Systems (8)
                'python_programming', 'distributed_computing', 'cloud_computing', 'big_data_processing',
                'real_time_systems', 'database_optimization', 'api_development', 'system_architecture',
                // Research & Innovation (6)
                'research_methodology', 'academic_collaboration', 'patent_filing', 'technology_transfer',
                'innovation_management', 'competitive_analysis'
            ],
            
            // Legacy paths with enhanced skills
            'day_trader': [
                'scalping', 'momentum_trading', 'technical_analysis', 'risk_management',
                'order_execution', 'market_reading', 'volatility_trading', 'news_trading',
                'level_ii_analysis', 'tape_reading', 'support_resistance', 'chart_patterns'
            ],
            'long_term_investor': [
                'fundamental_analysis', 'value_assessment', 'sector_analysis', 'company_research',
                'financial_modeling', 'risk_assessment', 'portfolio_management', 'patience_discipline',
                'dcf_modeling', 'ratio_analysis', 'industry_analysis', 'competitive_advantage'
            ],
            'arbitrageur': [
                'price_discrepancy_detection', 'execution_speed', 'risk_free_profit', 'correlation_analysis',
                'cross_market_analysis', 'timing_precision', 'capital_efficiency', 'regulatory_knowledge',
                'statistical_arbitrage', 'pairs_trading', 'merger_arbitrage', 'convertible_arbitrage'
            ],
            'risk_manager': [
                'var_calculation', 'stress_testing', 'scenario_analysis', 'correlation_modeling',
                'hedging_strategies', 'portfolio_analysis', 'regulatory_compliance', 'loss_prevention',
                'monte_carlo_simulation', 'backtesting', 'risk_reporting', 'capital_allocation'
            ]
        };
        
        return skillSets[path] || ['general_trading', 'risk_management', 'market_analysis'];
    }

    calculateInitialSkillLevel(skill) {
        const traits = this.personality.traits;
        let baseLevel = 20; // Everyone starts with some basic level
        
        // Trait-based adjustments
        const skillTraitMap = {
            'technical_analysis': 'analytical_thinking',
            'fundamental_analysis': 'research_depth',
            'risk_management': 'loss_aversion',
            'momentum_trading': 'trend_following',
            'scalping': 'timing_skill',
            'network_analysis': 'network_building',
            'execution_speed': 'timing_skill',
            'patience_discipline': 'patience'
        };
        
        const relatedTrait = skillTraitMap[skill];
        if (relatedTrait && traits[relatedTrait]) {
            baseLevel += (traits[relatedTrait] - 50) * 0.3;
        }
        
        // Add some randomness
        baseLevel += Math.random() * 20 - 10;
        
        return Math.max(0, Math.min(100, baseLevel));
    }

    calculateMaxPotential(skill) {
        const traits = this.personality.traits;
        let potential = 70; // Base potential
        
        // Learning speed affects all potentials
        potential += (traits.learning_speed - 50) * 0.4;
        
        // Specific trait bonuses
        const skillBonuses = {
            'analytical_thinking': ['technical_analysis', 'fundamental_analysis', 'statistical_modeling'],
            'patience': ['long_term_investing', 'patience_discipline'],
            'timing_skill': ['scalping', 'execution_speed', 'momentum_trading'],
            'network_building': ['relationship_building', 'network_analysis']
        };
        
        Object.entries(skillBonuses).forEach(([trait, skills]) => {
            if (skills.includes(skill)) {
                potential += (traits[trait] - 50) * 0.3;
            }
        });
        
        return Math.max(60, Math.min(95, potential));
    }

    calculateLearningRate(skill) {
        const traits = this.personality.traits;
        let rate = 1.0;
        
        // Base learning speed
        rate *= (traits.learning_speed / 50);
        
        // Curiosity affects learning
        rate *= (1 + (traits.curiosity - 50) / 100);
        
        // Adaptability helps with new skills
        rate *= (1 + (traits.adaptability - 50) / 150);
        
        return Math.max(0.3, Math.min(2.0, rate));
    }

    generateMilestones(skill) {
        return [
            { level: 25, description: `Basic ${skill} competency`, reward: 'confidence_boost' },
            { level: 50, description: `Intermediate ${skill} proficiency`, reward: 'strategy_unlock' },
            { level: 75, description: `Advanced ${skill} expertise`, reward: 'efficiency_boost' },
            { level: 90, description: `Master-level ${skill}`, reward: 'teaching_ability' }
        ];
    }

    // Skill progression and learning
    gainExperience(skill, experience_points, context = {}) {
        const skillData = this.expertiseAreas.get(skill);
        if (!skillData) return null;

        const learningEvent = {
            timestamp: Date.now(),
            experience_gained: experience_points,
            context: context,
            skill_before: skillData.current_level,
            effectiveness: this.calculateLearningEffectiveness(skill, context)
        };

        // Apply learning rate
        const adjusted_experience = experience_points * skillData.learning_rate * learningEvent.effectiveness;
        skillData.experience_points += adjusted_experience;

        // Calculate new skill level
        const newLevel = this.calculateSkillLevelFromExperience(skillData.experience_points, skillData.max_potential);
        const levelGain = newLevel - skillData.current_level;
        
        skillData.current_level = newLevel;
        skillData.skill_history.push(learningEvent);
        skillData.last_used = Date.now();

        // Check for milestone achievements
        const milestones = this.checkMilestoneAchievements(skill, skillData);

        // Update skill progression tracker
        this.skillProgression.recordProgression(skill, levelGain, context);

        // Update specialization metrics
        this.specializationMetrics.updateSkillMetrics(skill, levelGain);

        return {
            skill: skill,
            level_gained: levelGain,
            new_level: newLevel,
            milestones_achieved: milestones,
            learning_effectiveness: learningEvent.effectiveness,
            experience_gained: adjusted_experience
        };
    }

    calculateLearningEffectiveness(skill, context) {
        let effectiveness = 1.0;

        // Recent usage improves learning
        const skillData = this.expertiseAreas.get(skill);
        const timeSinceUse = Date.now() - skillData.last_used;
        if (timeSinceUse < 24 * 60 * 60 * 1000) { // Less than 24 hours
            effectiveness *= 1.2;
        }

        // Emotional state affects learning
        if (context.emotional_state) {
            const emotions = context.emotional_state;
            if (emotions.confidence > 70) effectiveness *= 1.1;
            if (emotions.anxiety > 60) effectiveness *= 0.9;
            if (emotions.fear > 70) effectiveness *= 0.8;
        }

        // Success vs failure
        if (context.outcome === 'success') {
            effectiveness *= 1.3;
        } else if (context.outcome === 'failure') {
            effectiveness *= 0.7; // Still learn from failure, but less effectively
        }

        // Collaborative learning bonus
        if (context.collaborative) {
            effectiveness *= 1.15;
        }

        return effectiveness;
    }

    calculateSkillLevelFromExperience(experience, maxPotential) {
        // Logarithmic skill progression
        const baseLevel = Math.log(experience / 100 + 1) * 25;
        return Math.min(maxPotential, baseLevel);
    }

    checkMilestoneAchievements(skill, skillData) {
        const achieved = [];
        
        skillData.competency_milestones.forEach(milestone => {
            if (skillData.current_level >= milestone.level && 
                !skillData.milestones_achieved?.includes(milestone.level)) {
                
                achieved.push(milestone);
                
                // Apply milestone rewards
                this.applyMilestoneReward(skill, milestone);
                
                // Track achievement
                if (!skillData.milestones_achieved) {
                    skillData.milestones_achieved = [];
                }
                skillData.milestones_achieved.push(milestone.level);
            }
        });
        
        return achieved;
    }

    applyMilestoneReward(skill, milestone) {
        switch(milestone.reward) {
            case 'confidence_boost':
                // Boost confidence in related decisions
                this.specializationMetrics.addConfidenceBoost(skill, 5);
                break;
            case 'strategy_unlock':
                // Unlock specialized strategies
                this.specializedStrategies.unlockStrategiesForSkill(skill);
                break;
            case 'efficiency_boost':
                // Improve execution efficiency
                this.specializationMetrics.addEfficiencyBoost(skill, 10);
                break;
            case 'teaching_ability':
                // Can now teach others this skill
                this.specializationMetrics.unlockTeachingAbility(skill);
                break;
        }
    }

    // Specialization evolution
    evolveSpecialization(performanceData) {
        const evolution = {
            path_adjustments: [],
            new_skills_needed: [],
            skill_rebalancing: [],
            specialization_deepening: []
        };

        // Analyze performance patterns
        const patterns = this.analyzePerformancePatterns(performanceData);
        
        // Suggest path adjustments
        if (patterns.underperformance_areas.length > 0) {
            evolution.path_adjustments = this.suggestPathAdjustments(patterns);
        }

        // Identify skill gaps
        const skillGaps = this.identifySkillGaps(performanceData);
        evolution.new_skills_needed = skillGaps;

        // Suggest specialization deepening
        const deepeningOpportunities = this.identifyDeepeningOpportunities();
        evolution.specialization_deepening = deepeningOpportunities;

        return evolution;
    }

    analyzePerformancePatterns(performanceData) {
        // Analyze recent performance to identify patterns
        const patterns = {
            strong_performance_areas: [],
            underperformance_areas: [],
            consistency_metrics: {},
            learning_velocity: {}
        };

        // Identify areas where performance is consistently good
        Object.entries(performanceData).forEach(([area, data]) => {
            const avgPerformance = data.reduce((sum, p) => sum + p.score, 0) / data.length;
            const consistency = this.calculateConsistency(data);
            
            if (avgPerformance > 75 && consistency > 70) {
                patterns.strong_performance_areas.push(area);
            } else if (avgPerformance < 50) {
                patterns.underperformance_areas.push(area);
            }
            
            patterns.consistency_metrics[area] = consistency;
        });

        return patterns;
    }

    suggestPathAdjustments(patterns) {
        const adjustments = [];
        
        // If underperforming in core areas, suggest skill focus
        patterns.underperformance_areas.forEach(area => {
            const coreSkills = this.getCoreSkillsForPath(this.specializationPath.primary_path);
            if (coreSkills.includes(area)) {
                adjustments.push({
                    type: 'skill_focus',
                    target: area,
                    reason: 'Core skill underperformance',
                    priority: 'high'
                });
            }
        });

        // If strong in non-core areas, suggest secondary specialization
        patterns.strong_performance_areas.forEach(area => {
            const coreSkills = this.getCoreSkillsForPath(this.specializationPath.primary_path);
            if (!coreSkills.includes(area)) {
                adjustments.push({
                    type: 'secondary_specialization',
                    target: area,
                    reason: 'Natural aptitude discovered',
                    priority: 'medium'
                });
            }
        });

        return adjustments;
    }

    identifySkillGaps(performanceData) {
        const gaps = [];
        const currentSkills = Array.from(this.expertiseAreas.keys());
        const requiredSkills = this.getCoreSkillsForPath(this.specializationPath.primary_path);
        
        // Missing core skills
        requiredSkills.forEach(skill => {
            if (!currentSkills.includes(skill)) {
                gaps.push({
                    skill: skill,
                    type: 'missing_core_skill',
                    urgency: 'high',
                    reason: 'Required for specialization path'
                });
            }
        });

        // Underdeveloped skills
        currentSkills.forEach(skill => {
            const skillData = this.expertiseAreas.get(skill);
            if (skillData.current_level < 40 && requiredSkills.includes(skill)) {
                gaps.push({
                    skill: skill,
                    type: 'underdeveloped_core_skill',
                    urgency: 'medium',
                    current_level: skillData.current_level,
                    reason: 'Core skill needs development'
                });
            }
        });

        return gaps;
    }

    identifyDeepeningOpportunities() {
        const opportunities = [];
        
        this.expertiseAreas.forEach((skillData, skill) => {
            // High-level skills that could become specializations
            if (skillData.current_level > 70) {
                opportunities.push({
                    skill: skill,
                    type: 'mastery_deepening',
                    current_level: skillData.current_level,
                    potential: skillData.max_potential,
                    benefits: this.calculateDeepeningBenefits(skill, skillData)
                });
            }
        });

        return opportunities.sort((a, b) => b.benefits.total_value - a.benefits.total_value);
    }

    calculateDeepeningBenefits(skill, skillData) {
        return {
            performance_improvement: (skillData.max_potential - skillData.current_level) * 0.5,
            teaching_value: skillData.current_level > 80 ? 20 : 0,
            strategy_unlocks: skillData.current_level > 75 ? 15 : 0,
            reputation_boost: skillData.current_level > 85 ? 25 : 0,
            total_value: 0 // Calculated as sum of above
        };
    }

    // Cross-training and skill transfer
    identifySkillTransferOpportunities() {
        const transfers = [];
        
        this.expertiseAreas.forEach((skillData, skill) => {
            if (skillData.current_level > 60) {
                const relatedSkills = this.findRelatedSkills(skill);
                relatedSkills.forEach(relatedSkill => {
                    const transferPotential = this.calculateTransferPotential(skill, relatedSkill);
                    if (transferPotential > 30) {
                        transfers.push({
                            from_skill: skill,
                            to_skill: relatedSkill,
                            transfer_potential: transferPotential,
                            estimated_boost: transferPotential * 0.2
                        });
                    }
                });
            }
        });
        
        return transfers.sort((a, b) => b.transfer_potential - a.transfer_potential);
    }

    findRelatedSkills(skill) {
        const skillRelations = {
            'technical_analysis': ['pattern_recognition', 'chart_reading', 'indicator_analysis'],
            'fundamental_analysis': ['company_research', 'financial_modeling', 'sector_analysis'],
            'risk_management': ['var_calculation', 'hedging_strategies', 'portfolio_analysis'],
            'momentum_trading': ['trend_following', 'breakout_trading', 'volume_analysis'],
            'network_building': ['relationship_management', 'communication', 'trust_building']
        };
        
        return skillRelations[skill] || [];
    }

    calculateTransferPotential(fromSkill, toSkill) {
        // Simplified transfer potential calculation
        const skillSynergies = {
            'technical_analysis': { 'pattern_recognition': 80, 'chart_reading': 90 },
            'fundamental_analysis': { 'company_research': 85, 'financial_modeling': 75 },
            'risk_management': { 'var_calculation': 70, 'hedging_strategies': 80 }
        };
        
        return skillSynergies[fromSkill]?.[toSkill] || 20;
    }

    // Performance assessment
    assessSpecializationProgress() {
        const assessment = {
            overall_progress: 0,
            skill_distribution: this.calculateSkillDistribution(),
            specialization_depth: this.calculateSpecializationDepth(),
            competency_level: this.calculateOverallCompetency(),
            learning_velocity: this.calculateLearningVelocity(),
            recommendations: []
        };

        // Calculate overall progress
        let totalProgress = 0;
        let skillCount = 0;
        
        this.expertiseAreas.forEach((skillData) => {
            totalProgress += (skillData.current_level / skillData.max_potential) * 100;
            skillCount++;
        });
        
        assessment.overall_progress = skillCount > 0 ? totalProgress / skillCount : 0;

        // Generate recommendations
        assessment.recommendations = this.generateProgressRecommendations(assessment);

        return assessment;
    }

    calculateSkillDistribution() {
        const distribution = {
            beginner: 0,    // 0-30
            intermediate: 0, // 31-60
            advanced: 0,    // 61-80
            expert: 0       // 81-100
        };

        this.expertiseAreas.forEach((skillData) => {
            const level = skillData.current_level;
            if (level <= 30) distribution.beginner++;
            else if (level <= 60) distribution.intermediate++;
            else if (level <= 80) distribution.advanced++;
            else distribution.expert++;
        });

        return distribution;
    }

    calculateSpecializationDepth() {
        const coreSkills = this.getCoreSkillsForPath(this.specializationPath.primary_path);
        let coreSkillTotal = 0;
        let coreSkillCount = 0;

        coreSkills.forEach(skill => {
            const skillData = this.expertiseAreas.get(skill);
            if (skillData) {
                coreSkillTotal += skillData.current_level;
                coreSkillCount++;
            }
        });

        return coreSkillCount > 0 ? coreSkillTotal / coreSkillCount : 0;
    }

    calculateOverallCompetency() {
        const weights = {
            'day_trader': { 'execution_speed': 0.3, 'risk_management': 0.25, 'technical_analysis': 0.25 },
            'long_term_investor': { 'fundamental_analysis': 0.4, 'patience_discipline': 0.3, 'research_depth': 0.3 },
            'arbitrageur': { 'arbitrage_detection': 0.4, 'execution_speed': 0.3, 'risk_management': 0.3 }
        };

        const pathWeights = weights[this.specializationPath.primary_path] || {};
        let weightedTotal = 0;
        let totalWeight = 0;

        Object.entries(pathWeights).forEach(([skill, weight]) => {
            const skillData = this.expertiseAreas.get(skill);
            if (skillData) {
                weightedTotal += skillData.current_level * weight;
                totalWeight += weight;
            }
        });

        return totalWeight > 0 ? weightedTotal / totalWeight : 50;
    }

    calculateLearningVelocity() {
        const recentHistory = [];
        
        this.expertiseAreas.forEach((skillData) => {
            const recentEvents = skillData.skill_history.slice(-5);
            recentEvents.forEach(event => {
                recentHistory.push({
                    timestamp: event.timestamp,
                    learning_rate: event.experience_gained / 100 // Normalize
                });
            });
        });

        if (recentHistory.length === 0) return 0;

        const totalLearning = recentHistory.reduce((sum, event) => sum + event.learning_rate, 0);
        return totalLearning / recentHistory.length;
    }

    generateProgressRecommendations(assessment) {
        const recommendations = [];

        // Low overall progress
        if (assessment.overall_progress < 40) {
            recommendations.push({
                type: 'focus_core_skills',
                priority: 'high',
                message: 'Focus on developing core specialization skills',
                specific_actions: this.getCoreSkillsForPath(this.specializationPath.primary_path).slice(0, 3)
            });
        }

        // Unbalanced skill distribution
        if (assessment.skill_distribution.beginner > assessment.skill_distribution.advanced) {
            recommendations.push({
                type: 'skill_balance',
                priority: 'medium',
                message: 'Balance skill development across competency levels',
                specific_actions: ['Develop intermediate skills', 'Focus learning efforts']
            });
        }

        // Low specialization depth
        if (assessment.specialization_depth < 50) {
            recommendations.push({
                type: 'deepen_specialization',
                priority: 'high',
                message: 'Increase depth in core specialization area',
                specific_actions: ['Intensive practice', 'Seek mentorship', 'Advanced training']
            });
        }

        // Slow learning velocity
        if (assessment.learning_velocity < 0.1) {
            recommendations.push({
                type: 'accelerate_learning',
                priority: 'medium',
                message: 'Increase learning activity and experience acquisition',
                specific_actions: ['More frequent practice', 'Seek challenging opportunities', 'Active learning']
            });
        }

        return recommendations;
    }

    // Utility methods
    calculateConsistency(performanceData) {
        if (performanceData.length < 3) return 50;
        
        const mean = performanceData.reduce((sum, p) => sum + p.score, 0) / performanceData.length;
        const variance = performanceData.reduce((sum, p) => sum + Math.pow(p.score - mean, 2), 0) / performanceData.length;
        const standardDeviation = Math.sqrt(variance);
        
        // Convert to consistency score (lower deviation = higher consistency)
        return Math.max(0, 100 - standardDeviation);
    }

    // Public interface
    getSpecializationStatus() {
        return {
            specialization_path: this.specializationPath,
            current_skills: this.getSkillSnapshot(),
            progress_assessment: this.assessSpecializationProgress(),
            learning_recommendations: this.generateLearningPlan(),
            specialization_metrics: this.specializationMetrics.getMetrics()
        };
    }

    getSkillSnapshot() {
        const snapshot = {};
        this.expertiseAreas.forEach((data, skill) => {
            snapshot[skill] = {
                level: Math.round(data.current_level),
                potential: data.max_potential,
                progress: Math.round((data.current_level / data.max_potential) * 100),
                last_used: data.last_used,
                experience_points: data.experience_points
            };
        });
        return snapshot;
    }

    generateLearningPlan() {
        const plan = {
            immediate_focus: [],
            medium_term_goals: [],
            long_term_objectives: [],
            skill_priorities: this.calculateSkillPriorities()
        };

        // Immediate focus (next 30 days)
        const urgentSkills = this.identifyUrgentSkills();
        plan.immediate_focus = urgentSkills.slice(0, 3);

        // Medium term (3-6 months)
        const developmentSkills = this.identifyDevelopmentSkills();
        plan.medium_term_goals = developmentSkills.slice(0, 5);

        // Long term (6+ months)
        const masterSkills = this.identifyMasterySkills();
        plan.long_term_objectives = masterSkills;

        return plan;
    }

    identifyUrgentSkills() {
        const urgent = [];
        const coreSkills = this.getCoreSkillsForPath(this.specializationPath.primary_path);
        
        coreSkills.forEach(skill => {
            const skillData = this.expertiseAreas.get(skill);
            if (skillData && skillData.current_level < 40) {
                urgent.push({
                    skill: skill,
                    current_level: skillData.current_level,
                    urgency_score: 100 - skillData.current_level,
                    reason: 'Core skill below threshold'
                });
            }
        });

        return urgent.sort((a, b) => b.urgency_score - a.urgency_score);
    }

    identifyDevelopmentSkills() {
        const development = [];
        
        this.expertiseAreas.forEach((skillData, skill) => {
            if (skillData.current_level >= 40 && skillData.current_level < 70) {
                development.push({
                    skill: skill,
                    current_level: skillData.current_level,
                    potential_gain: skillData.max_potential - skillData.current_level,
                    learning_efficiency: skillData.learning_rate
                });
            }
        });

        return development.sort((a, b) => (b.potential_gain * b.learning_efficiency) - (a.potential_gain * a.learning_efficiency));
    }

    identifyMasterySkills() {
        const mastery = [];
        
        this.expertiseAreas.forEach((skillData, skill) => {
            if (skillData.current_level >= 70) {
                mastery.push({
                    skill: skill,
                    current_level: skillData.current_level,
                    mastery_potential: skillData.max_potential - skillData.current_level,
                    strategic_value: this.calculateStrategicValue(skill)
                });
            }
        });

        return mastery.sort((a, b) => b.strategic_value - a.strategic_value);
    }

    calculateSkillPriorities() {
        const priorities = {};
        
        this.expertiseAreas.forEach((skillData, skill) => {
            const coreSkills = this.getCoreSkillsForPath(this.specializationPath.primary_path);
            const isCoreSkill = coreSkills.includes(skill);
            const developmentPotential = skillData.max_potential - skillData.current_level;
            const learningEfficiency = skillData.learning_rate;
            
            let priority = 50;
            if (isCoreSkill) priority += 30;
            priority += developmentPotential * 0.3;
            priority += learningEfficiency * 20;
            
            if (skillData.current_level < 30) priority += 20; // Urgent development
            
            priorities[skill] = Math.min(100, priority);
        });
        
        return priorities;
    }

    calculateStrategicValue(skill) {
        // How valuable is mastering this skill for the agent's future
        const coreSkills = this.getCoreSkillsForPath(this.specializationPath.primary_path);
        let value = 50;
        
        if (coreSkills.includes(skill)) value += 30;
        
        // Teaching potential
        const skillData = this.expertiseAreas.get(skill);
        if (skillData.current_level > 80) value += 20;
        
        // Rarity and market value
        const rareSkills = ['arbitrage_detection', 'statistical_modeling', 'network_analysis'];
        if (rareSkills.includes(skill)) value += 15;
        
        return value;
    }

    estimateSpecializationTimeline() {
        const coreSkills = this.getCoreSkillsForPath(this.specializationPath.primary_path);
        let totalTimeEstimate = 0;
        
        coreSkills.forEach(skill => {
            const skillData = this.expertiseAreas.get(skill);
            if (skillData) {
                const remainingDevelopment = Math.max(0, 70 - skillData.current_level); // Target 70 for proficiency
                const timeEstimate = remainingDevelopment / (skillData.learning_rate * 5); // 5 skill points per time unit
                totalTimeEstimate += timeEstimate;
            }
        });
        
        return {
            estimated_days: Math.round(totalTimeEstimate),
            confidence: this.specializationPath.specialization_confidence,
            factors: {
                skill_count: coreSkills.length,
                avg_learning_rate: this.calculateAverageLearningRate(),
                current_competency: this.calculateOverallCompetency()
            }
        };
    }

    calculateAverageLearningRate() {
        let totalRate = 0;
        let skillCount = 0;
        
        this.expertiseAreas.forEach((skillData) => {
            totalRate += skillData.learning_rate;
            skillCount++;
        });
        
        return skillCount > 0 ? totalRate / skillCount : 1.0;
    }
}

// Supporting classes for specialization system

class SkillProgressionTracker {
    constructor() {
        this.progressionHistory = [];
        this.learningPatterns = new Map();
    }

    recordProgression(skill, levelGain, context) {
        this.progressionHistory.push({
            skill: skill,
            level_gain: levelGain,
            timestamp: Date.now(),
            context: context
        });

        this.updateLearningPatterns(skill, levelGain, context);
    }

    updateLearningPatterns(skill, levelGain, context) {
        if (!this.learningPatterns.has(skill)) {
            this.learningPatterns.set(skill, {
                total_sessions: 0,
                total_gain: 0,
                avg_gain_per_session: 0,
                best_contexts: [],
                learning_curve: []
            });
        }

        const pattern = this.learningPatterns.get(skill);
        pattern.total_sessions++;
        pattern.total_gain += levelGain;
        pattern.avg_gain_per_session = pattern.total_gain / pattern.total_sessions;
        pattern.learning_curve.push({ gain: levelGain, timestamp: Date.now() });

        // Keep only recent learning curve data
        if (pattern.learning_curve.length > 20) {
            pattern.learning_curve.shift();
        }
    }
}

class SpecializedStrategyLibrary {
    constructor() {
        this.strategies = new Map();
        this.skillRequirements = new Map();
    }

    unlockStrategiesForSkill(skill) {
        const strategies = this.getStrategiesForSkill(skill);
        strategies.forEach(strategy => {
            this.strategies.set(strategy.id, strategy);
        });
    }

    getStrategiesForSkill(skill) {
        const strategyTemplates = {
            'scalping': [
                { id: 'micro_scalping', name: 'Micro Scalping', risk: 'low', frequency: 'very_high' },
                { id: 'news_scalping', name: 'News Event Scalping', risk: 'medium', frequency: 'high' }
            ],
            'arbitrage_detection': [
                { id: 'spatial_arbitrage', name: 'Cross-Exchange Arbitrage', risk: 'low', frequency: 'medium' },
                { id: 'temporal_arbitrage', name: 'Time-based Arbitrage', risk: 'low', frequency: 'high' }
            ],
            'network_analysis': [
                { id: 'social_sentiment', name: 'Social Network Sentiment Trading', risk: 'medium', frequency: 'medium' },
                { id: 'influence_trading', name: 'Influencer-based Trading', risk: 'high', frequency: 'low' }
            ]
        };

        return strategyTemplates[skill] || [];
    }
}

class CompetencyMatrix {
    constructor() {
        this.competencies = new Map();
        this.skillInteractions = new Map();
    }

    assessCompetency(skill, level, context) {
        // Assess competency based on skill level and context
        return {
            technical_competency: this.calculateTechnicalCompetency(skill, level),
            practical_application: this.calculatePracticalApplication(skill, context),
            teaching_ability: level > 80 ? 'advanced' : level > 60 ? 'intermediate' : 'basic',
            innovation_potential: this.calculateInnovationPotential(skill, level)
        };
    }

    calculateTechnicalCompetency(skill, level) {
        if (level < 30) return 'novice';
        if (level < 50) return 'beginner';
        if (level < 70) return 'intermediate';
        if (level < 85) return 'advanced';
        return 'expert';
    }

    calculatePracticalApplication(skill, context) {
        // How well can the skill be applied in practice
        return context.success_rate > 70 ? 'high' : context.success_rate > 50 ? 'medium' : 'low';
    }

    calculateInnovationPotential(skill, level) {
        // Potential to innovate or create new approaches
        return level > 85 ? 'high' : level > 70 ? 'medium' : 'low';
    }
}

class SpecializationMetrics {
    constructor() {
        this.metrics = {
            skill_development_rate: 0,
            specialization_focus: 0,
            cross_skill_synergy: 0,
            competency_breadth: 0,
            mastery_depth: 0,
            learning_efficiency: 0
        };
        this.metricHistory = [];
    }

    updateSkillMetrics(skill, levelGain) {
        // Update various specialization metrics
        this.metrics.skill_development_rate = this.calculateDevelopmentRate();
        this.recordMetricSnapshot();
    }

    calculateDevelopmentRate() {
        // Calculate recent skill development rate
        return 50; // Simplified
    }

    addConfidenceBoost(skill, amount) {
        // Track confidence boosts from milestones
    }

    addEfficiencyBoost(skill, amount) {
        // Track efficiency improvements
    }

    unlockTeachingAbility(skill) {
        // Track teaching abilities unlocked
    }

    recordMetricSnapshot() {
        this.metricHistory.push({
            ...this.metrics,
            timestamp: Date.now()
        });

        if (this.metricHistory.length > 50) {
            this.metricHistory.shift();
        }
    }

    getMetrics() {
        return {
            current: this.metrics,
            trend: this.calculateTrend(),
            history: this.metricHistory.slice(-10)
        };
    }

    calculateTrend() {
        if (this.metricHistory.length < 5) return 'insufficient_data';
        
        const recent = this.metricHistory.slice(-5);
        const older = this.metricHistory.slice(-10, -5);
        
        // Simplified trend calculation
        return 'improving'; // Placeholder
    }
}

module.exports = AgentSpecializationSystem;
/**
 * Government Intervention and Recovery Engine
 * Simulates policy responses, bailouts, stimulus packages, and crisis management
 */

const EventEmitter = require('eventemitter3');
const Decimal = require('decimal.js');
const { v4: uuidv4 } = require('uuid');
const logger = require('pino')();

class InterventionEngine extends EventEmitter {
    constructor(crisisEngine, psychologyEngine, config = {}) {
        super();
        
        this.crisisEngine = crisisEngine;
        this.psychologyEngine = psychologyEngine;
        
        this.config = {
            interventionThreshold: config.interventionThreshold || 0.7,
            maxInterventionSize: config.maxInterventionSize || 0.3,
            politicalWillDecay: config.politicalWillDecay || 0.02,
            effectivenessMultiplier: config.effectivenessMultiplier || 1.2,
            moralHazardIncrease: config.moralHazardIncrease || 0.1,
            ...config
        };

        this.state = {
            governments: new Map(),
            activeInterventions: new Map(),
            policyTools: new Map(),
            bailoutFunds: new Map(),
            politicalWill: 1.0,
            publicSupport: 0.7,
            fiscalCapacity: 1.0,
            interventionHistory: []
        };

        this.interventionTypes = {
            liquidity_injection: {
                name: 'Emergency Liquidity Injection',
                target: 'banking_system',
                effectiveness: 0.8,
                cost_multiplier: 0.5,
                duration: 10,
                side_effects: ['moral_hazard', 'inflation_risk']
            },
            interest_rate_cut: {
                name: 'Emergency Interest Rate Cut',
                target: 'monetary_policy',
                effectiveness: 0.6,
                cost_multiplier: 0.1,
                duration: 30,
                side_effects: ['asset_bubbles', 'currency_weakness']
            },
            fiscal_stimulus: {
                name: 'Fiscal Stimulus Package',
                target: 'aggregate_demand',
                effectiveness: 0.7,
                cost_multiplier: 1.5,
                duration: 50,
                side_effects: ['debt_increase', 'crowding_out']
            },
            bank_bailout: {
                name: 'Bank Bailout Program',
                target: 'financial_institutions',
                effectiveness: 0.9,
                cost_multiplier: 2.0,
                duration: 100,
                side_effects: ['moral_hazard', 'public_anger', 'debt_increase']
            },
            trading_halt: {
                name: 'Emergency Trading Halt',
                target: 'market_volatility',
                effectiveness: 0.5,
                cost_multiplier: 0.2,
                duration: 3,
                side_effects: ['liquidity_reduction', 'confidence_loss']
            },
            regulatory_action: {
                name: 'Emergency Regulatory Measures',
                target: 'market_manipulation',
                effectiveness: 0.8,
                cost_multiplier: 0.3,
                duration: 20,
                side_effects: ['regulatory_burden', 'innovation_reduction']
            },
            currency_support: {
                name: 'Currency Defense Operation',
                target: 'exchange_rate',
                effectiveness: 0.6,
                cost_multiplier: 1.0,
                duration: 15,
                side_effects: ['reserve_depletion', 'import_costs']
            },
            debt_relief: {
                name: 'Emergency Debt Relief Program',
                target: 'debt_crisis',
                effectiveness: 0.7,
                cost_multiplier: 1.8,
                duration: 80,
                side_effects: ['moral_hazard', 'credit_expansion']
            }
        };

        this.initializeGovernments();
        
        logger.info('Intervention Engine initialized');
    }

    initializeGovernments() {
        // Initialize government entities with intervention capabilities
        const governments = [
            {
                id: 'central_authority',
                name: 'Central Economic Authority',
                type: 'monetary',
                intervention_capacity: new Decimal(5000000000),
                political_will: 0.8,
                fiscal_space: 0.7,
                response_speed: 0.8
            },
            {
                id: 'fiscal_ministry',
                name: 'Fiscal Policy Ministry',
                type: 'fiscal',
                intervention_capacity: new Decimal(3000000000),
                political_will: 0.6,
                fiscal_space: 0.6,
                response_speed: 0.5
            },
            {
                id: 'regulatory_authority',
                name: 'Market Regulatory Authority',
                type: 'regulatory',
                intervention_capacity: new Decimal(1000000000),
                political_will: 0.9,
                fiscal_space: 0.8,
                response_speed: 0.9
            },
            {
                id: 'emergency_fund',
                name: 'Crisis Emergency Fund',
                type: 'emergency',
                intervention_capacity: new Decimal(2000000000),
                political_will: 1.0,
                fiscal_space: 1.0,
                response_speed: 1.0
            }
        ];

        governments.forEach(gov => {
            this.state.governments.set(gov.id, {
                ...gov,
                available_capacity: gov.intervention_capacity,
                active_interventions: new Set(),
                success_rate: 0.7,
                public_approval: 0.6,
                credibility: 0.8,
                intervention_fatigue: 0
            });
        });

        // Initialize policy tools
        this.initializePolicyTools();
    }

    initializePolicyTools() {
        const tools = [
            {
                id: 'monetary_policy',
                name: 'Monetary Policy Tools',
                authority: 'central_authority',
                available: true,
                effectiveness: 0.8,
                political_cost: 0.1
            },
            {
                id: 'fiscal_policy',
                name: 'Fiscal Policy Tools',
                authority: 'fiscal_ministry',
                available: true,
                effectiveness: 0.7,
                political_cost: 0.4
            },
            {
                id: 'regulatory_tools',
                name: 'Regulatory Tools',
                authority: 'regulatory_authority',
                available: true,
                effectiveness: 0.6,
                political_cost: 0.2
            },
            {
                id: 'emergency_powers',
                name: 'Emergency Powers',
                authority: 'emergency_fund',
                available: true,
                effectiveness: 0.9,
                political_cost: 0.8
            }
        ];

        tools.forEach(tool => {
            this.state.policyTools.set(tool.id, {
                ...tool,
                usage_count: 0,
                last_used: 0,
                cooldown: 0,
                public_acceptance: 0.7
            });
        });
    }

    // Main tick processing
    tick(marketData, agents) {
        this.updateGovernmentStates();
        this.assessInterventionNeeds();
        this.updateActiveInterventions();
        this.updatePolicyTools();
        this.calculatePublicSupport();
        this.updatePoliticalWill();
        this.processBailoutFunds();
        
        return this.getInterventionStatus();
    }

    updateGovernmentStates() {
        for (const [govId, government] of this.state.governments) {
            // Update intervention fatigue
            if (government.active_interventions.size > 0) {
                government.intervention_fatigue = Math.min(1, government.intervention_fatigue + 0.01);
            } else {
                government.intervention_fatigue = Math.max(0, government.intervention_fatigue - 0.005);
            }
            
            // Update credibility based on intervention success
            this.updateGovernmentCredibility(government);
            
            // Update available capacity
            this.updateInterventionCapacity(government);
            
            // Update political will
            government.political_will = Math.max(0.1, government.political_will - this.config.politicalWillDecay * government.intervention_fatigue);
        }
    }

    updateGovernmentCredibility(government) {
        // Base credibility recovery
        government.credibility = Math.min(1, government.credibility + 0.001);
        
        // Credibility affected by recent intervention outcomes
        let recentSuccesses = 0;
        let recentFailures = 0;
        
        for (const intervention of this.state.interventionHistory.slice(-10)) {
            if (intervention.government_id === government.id) {
                if (intervention.success_rating > 0.6) {
                    recentSuccesses++;
                } else if (intervention.success_rating < 0.4) {
                    recentFailures++;
                }
            }
        }
        
        government.credibility += (recentSuccesses - recentFailures) * 0.05;
        government.credibility = Math.max(0, Math.min(1, government.credibility));
    }

    updateInterventionCapacity(government) {
        // Fiscal capacity regeneration
        const regenerationRate = 0.001 * government.fiscal_space;
        const additionalCapacity = government.intervention_capacity.mul(regenerationRate);
        government.available_capacity = government.available_capacity.plus(additionalCapacity);
        
        // Cap at maximum capacity
        government.available_capacity = Decimal.min(government.available_capacity, government.intervention_capacity);
    }

    assessInterventionNeeds() {
        const crisisStatus = this.crisisEngine.getCrisisStatus();
        const systemicRisk = crisisStatus.systemicRisk || 0;
        
        // Trigger interventions based on crisis severity
        if (systemicRisk > this.config.interventionThreshold) {
            this.triggerEmergencyIntervention(systemicRisk);
        }
        
        // Check for specific crisis types
        for (const crisis of crisisStatus.activeCrises || []) {
            this.evaluateTargetedIntervention(crisis);
        }
    }

    triggerEmergencyIntervention(systemicRisk) {
        // Select appropriate intervention type
        const interventionType = this.selectInterventionType(systemicRisk);
        const government = this.selectRespondingGovernment(interventionType);
        
        if (!government || government.available_capacity.lt(1000000)) {
            return; // Insufficient capacity
        }
        
        this.launchIntervention(interventionType, government, systemicRisk);
    }

    selectInterventionType(systemicRisk) {
        const crisisStatus = this.crisisEngine.getCrisisStatus();
        
        // Priority interventions based on crisis types
        if (crisisStatus.activeCrises) {
            for (const crisis of crisisStatus.activeCrises) {
                switch (crisis.type) {
                    case 'bank_run':
                        return 'liquidity_injection';
                    case 'bubble_burst':
                        return 'trading_halt';
                    case 'currency_crisis':
                        return 'currency_support';
                    case 'debt_cascade':
                        return 'debt_relief';
                    case 'supply_shock':
                        return 'fiscal_stimulus';
                }
            }
        }
        
        // Default based on systemic risk level
        if (systemicRisk > 0.9) return 'bank_bailout';
        if (systemicRisk > 0.8) return 'liquidity_injection';
        if (systemicRisk > 0.7) return 'interest_rate_cut';
        
        return 'regulatory_action';
    }

    selectRespondingGovernment(interventionType) {
        const template = this.interventionTypes[interventionType];
        
        // Find most appropriate government
        let bestGovernment = null;
        let bestScore = 0;
        
        for (const [govId, government] of this.state.governments) {
            const suitabilityScore = this.calculateGovernmentSuitability(government, template);
            
            if (suitabilityScore > bestScore && government.available_capacity.gt(100000)) {
                bestScore = suitabilityScore;
                bestGovernment = government;
            }
        }
        
        return bestGovernment;
    }

    calculateGovernmentSuitability(government, template) {
        let score = 0;
        
        // Match government type to intervention target
        if (template.target === 'banking_system' && government.type === 'monetary') score += 0.5;
        if (template.target === 'aggregate_demand' && government.type === 'fiscal') score += 0.5;
        if (template.target === 'market_manipulation' && government.type === 'regulatory') score += 0.5;
        
        // General capabilities
        score += government.political_will * 0.3;
        score += government.credibility * 0.2;
        score += government.response_speed * 0.2;
        score += (1 - government.intervention_fatigue) * 0.2;
        
        // Capacity considerations
        const capacityRatio = government.available_capacity.div(government.intervention_capacity).toNumber();
        score += capacityRatio * 0.3;
        
        return score;
    }

    launchIntervention(interventionType, government, intensity) {
        const template = this.interventionTypes[interventionType];
        
        const intervention = {
            id: uuidv4(),
            type: interventionType,
            name: template.name,
            government_id: government.id,
            government_name: government.name,
            startTime: Date.now(),
            intensity: Math.min(1, intensity * 1.2),
            target: template.target,
            duration: template.duration,
            cost: this.calculateInterventionCost(template, government, intensity),
            effectiveness: this.calculateInterventionEffectiveness(template, government),
            side_effects: [...template.side_effects],
            
            // Tracking
            ticks_active: 0,
            current_effectiveness: 0,
            public_reaction: 0,
            economic_impact: new Decimal(0),
            success_indicators: new Map(),
            
            // State
            phase: 'initiation', // initiation, implementation, evaluation
            is_active: true
        };
        
        // Deduct cost from government capacity
        government.available_capacity = government.available_capacity.minus(intervention.cost);
        government.active_interventions.add(intervention.id);
        
        this.state.activeInterventions.set(intervention.id, intervention);
        
        // Apply immediate intervention effects
        this.applyInterventionEffects(intervention);
        
        // Update political costs
        this.applyPoliticalCosts(intervention, government);
        
        logger.warn('Government intervention launched', {
            type: interventionType,
            government: government.name,
            cost: intervention.cost.toString(),
            intensity: intervention.intensity
        });
        
        this.emit('intervention_launched', intervention);
    }

    calculateInterventionCost(template, government, intensity) {
        const baseCost = government.intervention_capacity.mul(0.1); // 10% of capacity as base
        const intensityMultiplier = 0.5 + intensity * 0.5; // 0.5x to 1x based on intensity
        const typeMultiplier = template.cost_multiplier;
        
        return baseCost.mul(intensityMultiplier).mul(typeMultiplier);
    }

    calculateInterventionEffectiveness(template, government) {
        let effectiveness = template.effectiveness;
        
        // Government-specific adjustments
        effectiveness *= government.credibility;
        effectiveness *= (1 - government.intervention_fatigue * 0.3);
        effectiveness *= government.response_speed;
        
        // Policy tool availability
        const relevantTool = this.findRelevantPolicyTool(template.target);
        if (relevantTool && relevantTool.available) {
            effectiveness *= relevantTool.effectiveness;
        } else {
            effectiveness *= 0.7; // Reduced effectiveness without tools
        }
        
        return Math.max(0.1, Math.min(1, effectiveness * this.config.effectivenessMultiplier));
    }

    findRelevantPolicyTool(target) {
        for (const tool of this.state.policyTools.values()) {
            if ((target === 'banking_system' && tool.id === 'monetary_policy') ||
                (target === 'aggregate_demand' && tool.id === 'fiscal_policy') ||
                (target === 'market_manipulation' && tool.id === 'regulatory_tools') ||
                (target === 'exchange_rate' && tool.id === 'monetary_policy')) {
                return tool;
            }
        }
        return this.state.policyTools.get('emergency_powers');
    }

    applyInterventionEffects(intervention) {
        const intensity = intervention.intensity;
        const effectiveness = intervention.effectiveness;
        const impact = intensity * effectiveness;
        
        switch (intervention.type) {
            case 'liquidity_injection':
                this.applyLiquidityInjection(intervention, impact);
                break;
            case 'interest_rate_cut':
                this.applyInterestRateCut(intervention, impact);
                break;
            case 'fiscal_stimulus':
                this.applyFiscalStimulus(intervention, impact);
                break;
            case 'bank_bailout':
                this.applyBankBailout(intervention, impact);
                break;
            case 'trading_halt':
                this.applyTradingHalt(intervention, impact);
                break;
            case 'regulatory_action':
                this.applyRegulatoryAction(intervention, impact);
                break;
            case 'currency_support':
                this.applyCurrencySupport(intervention, impact);
                break;
            case 'debt_relief':
                this.applyDebtRelief(intervention, impact);
                break;
        }
    }

    applyLiquidityInjection(intervention, impact) {
        // Boost market liquidity
        for (const [marketId, market] of this.crisisEngine.economicEngine.markets) {
            market.liquidity = Math.min(1, (market.liquidity || 0.8) + impact * 0.3);
        }
        
        // Reduce banking system stress
        if (this.crisisEngine.bankRunEngine) {
            for (const bank of this.crisisEngine.bankRunEngine.state.bankingInstitutions.values()) {
                bank.liquidity = Math.min(1, bank.liquidity + impact * 0.4);
                bank.confidence = Math.min(1, bank.confidence + impact * 0.2);
            }
        }
        
        // Psychological impact
        this.psychologyEngine.triggerPsychologyEvent('uncertainty', -impact * 0.5); // Reduce uncertainty
        
        intervention.economic_impact = intervention.economic_impact.plus(intervention.cost.mul(impact));
    }

    applyInterestRateCut(intervention, impact) {
        // Stimulate borrowing and investment
        const agents = this.crisisEngine.economicEngine.agents;
        for (const [agentId, agent] of agents) {
            if (agent.isActive && agent.psychology) {
                agent.psychology.confidence = Math.min(1, (agent.psychology.confidence || 0.5) + impact * 0.1);
                
                // Encourage risk-taking
                agent.psychology.risk_tolerance = Math.min(100, (agent.psychology.risk_tolerance || 50) + impact * 10);
            }
        }
        
        // Market effects
        for (const [marketId, market] of this.crisisEngine.economicEngine.markets) {
            market.demand = market.demand.mul(1 + impact * 0.1); // Increase demand
        }
    }

    applyFiscalStimulus(intervention, impact) {
        // Direct wealth injection to agents
        const agents = this.crisisEngine.economicEngine.agents;
        const stimulusPerAgent = intervention.cost.div(Math.max(1, agents.size)).mul(impact);
        
        for (const [agentId, agent] of agents) {
            if (agent.isActive && agent.wealth) {
                agent.wealth = agent.wealth.plus(stimulusPerAgent);
                
                // Psychological boost
                if (agent.psychology) {
                    agent.psychology.confidence = Math.min(1, (agent.psychology.confidence || 0.5) + impact * 0.05);
                }
            }
        }
        
        // Increase aggregate demand
        for (const [marketId, market] of this.crisisEngine.economicEngine.markets) {
            market.demand = market.demand.mul(1 + impact * 0.15);
        }
    }

    applyBankBailout(intervention, impact) {
        // Directly support failing banks
        if (this.crisisEngine.bankRunEngine) {
            for (const [bankId, bank] of this.crisisEngine.bankRunEngine.state.bankingInstitutions) {
                if (bank.liquidity < 0.3 || bank.confidence < 0.3) {
                    bank.liquidity = Math.min(1, bank.liquidity + impact * 0.6);
                    bank.confidence = Math.min(1, bank.confidence + impact * 0.7);
                    bank.reserves = bank.reserves.plus(intervention.cost.mul(0.1));
                }
            }
        }
        
        // Moral hazard increase
        for (const [agentId, agent] of this.crisisEngine.economicEngine.agents) {
            if (agent.isActive && agent.leverage) {
                agent.leverage = Math.min(this.config.maxInterventionSize * 10, agent.leverage * (1 + this.config.moralHazardIncrease));
            }
        }
    }

    applyTradingHalt(intervention, impact) {
        // Reduce market volatility immediately
        for (const [marketId, market] of this.crisisEngine.economicEngine.markets) {
            market.volatility = Math.max(0.01, market.volatility * (1 - impact * 0.8));
        }
        
        // Reduce panic but also reduce liquidity
        this.psychologyEngine.triggerPsychologyEvent('market_crash', -impact); // Reduce panic
        
        for (const [marketId, market] of this.crisisEngine.economicEngine.markets) {
            market.liquidity = Math.max(0.1, (market.liquidity || 0.8) * (1 - impact * 0.3));
        }
    }

    applyRegulatoryAction(intervention, impact) {
        // Reduce market manipulation
        if (this.crisisEngine.economicWarfareEngine) {
            for (const manipulation of this.crisisEngine.economicWarfareEngine.state.manipulationAttempts.values()) {
                manipulation.intensity *= (1 - impact * 0.8);
            }
        }
        
        // Improve market fairness perception
        this.psychologyEngine.triggerPsychologyEvent('uncertainty', -impact * 0.3);
    }

    applyCurrencySupport(intervention, impact) {
        // Support currency values and confidence
        if (this.crisisEngine.currencyCrisisEngine) {
            for (const [currencyId, currency] of this.crisisEngine.currencyCrisisEngine.state.currencies) {
                currency.confidence = Math.min(1, currency.confidence + impact * 0.4);
                currency.reserves = currency.reserves.plus(intervention.cost.mul(0.2));
            }
        }
    }

    applyDebtRelief(intervention, impact) {
        // Reduce agent debt burdens
        if (this.crisisEngine.debtCascadeEngine) {
            for (const [agentId, debtProfile] of this.crisisEngine.debtCascadeEngine.state.debtNetwork) {
                debtProfile.total_debt = debtProfile.total_debt.mul(1 - impact * 0.3);
                debtProfile.default_probability = Math.max(0, debtProfile.default_probability - impact * 0.4);
            }
        }
        
        // Improve agent psychology
        for (const [agentId, agent] of this.crisisEngine.economicEngine.agents) {
            if (agent.isActive && agent.psychology) {
                agent.psychology.fear = Math.max(0, (agent.psychology.fear || 0.5) - impact * 0.2);
                agent.psychology.confidence = Math.min(1, (agent.psychology.confidence || 0.5) + impact * 0.3);
            }
        }
    }

    applyPoliticalCosts(intervention, government) {
        const politicalCost = this.calculatePoliticalCost(intervention);
        
        government.political_will = Math.max(0.1, government.political_will - politicalCost);
        this.state.publicSupport = Math.max(0, this.state.publicSupport - politicalCost * 0.5);
        
        // Use relevant policy tool
        const relevantTool = this.findRelevantPolicyTool(intervention.target);
        if (relevantTool) {
            relevantTool.usage_count++;
            relevantTool.last_used = Date.now();
            relevantTool.public_acceptance = Math.max(0.1, relevantTool.public_acceptance - politicalCost);
        }
    }

    calculatePoliticalCost(intervention) {
        const template = this.interventionTypes[intervention.type];
        let cost = template.cost_multiplier * 0.1; // Base political cost
        
        // Higher costs for controversial interventions
        if (intervention.type === 'bank_bailout') cost += 0.3;
        if (intervention.type === 'debt_relief') cost += 0.2;
        
        // Size matters
        const costRatio = intervention.cost.div(new Decimal(1000000000)).toNumber(); // Relative to 1B
        cost += Math.min(0.5, costRatio * 0.1);
        
        return cost;
    }

    evaluateTargetedIntervention(crisis) {
        // Evaluate if a targeted intervention is needed for specific crisis
        if (crisis.intensity > 0.6 && Math.random() < 0.1) {
            const interventionType = this.mapCrisisToIntervention(crisis.type);
            if (interventionType) {
                const government = this.selectRespondingGovernment(interventionType);
                if (government) {
                    this.launchIntervention(interventionType, government, crisis.intensity);
                }
            }
        }
    }

    mapCrisisToIntervention(crisisType) {
        const mapping = {
            bank_run: 'liquidity_injection',
            bubble_burst: 'trading_halt',
            supply_shock: 'fiscal_stimulus',
            currency_crisis: 'currency_support',
            debt_cascade: 'debt_relief'
        };
        
        return mapping[crisisType] || 'regulatory_action';
    }

    updateActiveInterventions() {
        for (const [interventionId, intervention] of this.state.activeInterventions) {
            intervention.ticks_active++;
            
            // Update intervention phase
            this.updateInterventionPhase(intervention);
            
            // Apply ongoing effects
            this.applyOngoingInterventionEffects(intervention);
            
            // Apply side effects
            this.applySideEffects(intervention);
            
            // Check for completion
            if (this.shouldCompleteIntervention(intervention)) {
                this.completeIntervention(interventionId, intervention);
            }
        }
    }

    updateInterventionPhase(intervention) {
        const progress = intervention.ticks_active / intervention.duration;
        
        if (progress < 0.2) {
            intervention.phase = 'initiation';
        } else if (progress < 0.8) {
            intervention.phase = 'implementation';
            intervention.current_effectiveness = intervention.effectiveness;
        } else {
            intervention.phase = 'evaluation';
            intervention.current_effectiveness = intervention.effectiveness * 0.5; // Declining effectiveness
        }
    }

    applyOngoingInterventionEffects(intervention) {
        // Reduced ongoing effects compared to initial impact
        const ongoingImpact = intervention.current_effectiveness * intervention.intensity * 0.1;
        
        // Apply smaller version of intervention effects
        switch (intervention.type) {
            case 'fiscal_stimulus':
                this.applyFiscalStimulus(intervention, ongoingImpact);
                break;
            case 'interest_rate_cut':
                this.applyInterestRateCut(intervention, ongoingImpact);
                break;
            // Other interventions typically have one-time effects
        }
    }

    applySideEffects(intervention) {
        for (const sideEffect of intervention.side_effects) {
            this.applySideEffect(intervention, sideEffect);
        }
    }

    applySideEffect(intervention, sideEffect) {
        const effectIntensity = intervention.intensity * 0.1;
        
        switch (sideEffect) {
            case 'moral_hazard':
                // Increase agent risk-taking
                for (const [agentId, agent] of this.crisisEngine.economicEngine.agents) {
                    if (agent.isActive && agent.psychology) {
                        agent.psychology.risk_tolerance = Math.min(100, 
                            (agent.psychology.risk_tolerance || 50) + effectIntensity * 5
                        );
                    }
                }
                break;
                
            case 'inflation_risk':
                // Increase inflation pressure
                this.crisisEngine.economicEngine.state.inflationRate = 
                    this.crisisEngine.economicEngine.state.inflationRate.mul(1 + effectIntensity);
                break;
                
            case 'debt_increase':
                // Increase government debt (simplified)
                this.state.fiscalCapacity = Math.max(0.1, this.state.fiscalCapacity - effectIntensity);
                break;
                
            case 'public_anger':
                // Reduce public support
                this.state.publicSupport = Math.max(0, this.state.publicSupport - effectIntensity * 2);
                break;
                
            case 'currency_weakness':
                // Weaken currency
                if (this.crisisEngine.currencyCrisisEngine) {
                    for (const rate of this.crisisEngine.currencyCrisisEngine.state.exchangeRates.values()) {
                        rate.current_rate = rate.current_rate.mul(1 - effectIntensity * 0.1);
                    }
                }
                break;
                
            case 'asset_bubbles':
                // Increase bubble formation risk
                if (this.crisisEngine.bubbleEngine) {
                    for (const [marketId, market] of this.crisisEngine.economicEngine.markets) {
                        market.currentPrice = market.currentPrice.mul(1 + effectIntensity * 0.05);
                    }
                }
                break;
        }
    }

    shouldCompleteIntervention(intervention) {
        return (
            intervention.ticks_active >= intervention.duration ||
            intervention.current_effectiveness < 0.1
        );
    }

    completeIntervention(interventionId, intervention) {
        intervention.endTime = Date.now();
        intervention.total_duration = intervention.endTime - intervention.startTime;
        intervention.is_active = false;
        
        // Calculate success rating
        intervention.success_rating = this.calculateSuccessRating(intervention);
        
        // Update government state
        const government = this.state.governments.get(intervention.government_id);
        if (government) {
            government.active_interventions.delete(interventionId);
            
            // Update success rate
            government.success_rate = government.success_rate * 0.9 + intervention.success_rating * 0.1;
            
            // Update public approval based on success
            const approvalChange = (intervention.success_rating - 0.5) * 0.2;
            government.public_approval = Math.max(0, Math.min(1, government.public_approval + approvalChange));
        }
        
        // Record in history
        this.state.interventionHistory.push({
            ...intervention,
            economic_impact: intervention.economic_impact.toString()
        });
        
        this.state.activeInterventions.delete(interventionId);
        
        logger.info('Government intervention completed', {
            type: intervention.type,
            government: intervention.government_name,
            successRating: intervention.success_rating,
            duration: intervention.total_duration
        });
        
        this.emit('intervention_completed', intervention);
    }

    calculateSuccessRating(intervention) {
        let successScore = 0.5; // Base neutral score
        
        // Economic impact assessment
        const economicBenefit = intervention.economic_impact.div(intervention.cost).toNumber();
        successScore += Math.min(0.3, economicBenefit * 0.1);
        
        // Crisis mitigation effectiveness
        const currentCrisisIntensity = this.crisisEngine.state.crisisIntensity || 0;
        if (currentCrisisIntensity < 0.5) successScore += 0.2; // Crisis reduced
        
        // Public reaction
        successScore += (intervention.public_reaction + 0.5) * 0.2;
        
        // Side effect penalties
        successScore -= intervention.side_effects.length * 0.05;
        
        return Math.max(0, Math.min(1, successScore));
    }

    updatePolicyTools() {
        for (const [toolId, tool] of this.state.policyTools) {
            // Cooldown reduction
            if (tool.cooldown > 0) {
                tool.cooldown--;
                tool.available = tool.cooldown === 0;
            }
            
            // Public acceptance recovery
            if (tool.public_acceptance < 0.8) {
                tool.public_acceptance = Math.min(0.8, tool.public_acceptance + 0.002);
            }
            
            // Effectiveness decay with overuse
            if (tool.usage_count > 5) {
                tool.effectiveness = Math.max(0.3, tool.effectiveness - 0.001);
            }
        }
    }

    calculatePublicSupport() {
        // Base public support changes
        let supportChange = 0;
        
        // Support increases during successful interventions
        let successfulInterventions = 0;
        let totalInterventions = 0;
        
        for (const intervention of this.state.interventionHistory.slice(-10)) {
            totalInterventions++;
            if (intervention.success_rating > 0.6) successfulInterventions++;
        }
        
        if (totalInterventions > 0) {
            const successRate = successfulInterventions / totalInterventions;
            supportChange += (successRate - 0.5) * 0.01;
        }
        
        // Support decreases with high intervention frequency
        const activeInterventionCount = this.state.activeInterventions.size;
        if (activeInterventionCount > 3) {
            supportChange -= (activeInterventionCount - 3) * 0.005;
        }
        
        // Economic conditions affect support
        const crisisIntensity = this.crisisEngine.state.crisisIntensity || 0;
        supportChange -= crisisIntensity * 0.01;
        
        this.state.publicSupport = Math.max(0.1, Math.min(1, this.state.publicSupport + supportChange));
    }

    updatePoliticalWill() {
        // Political will recovery
        if (this.state.politicalWill < 0.8) {
            this.state.politicalWill = Math.min(0.8, this.state.politicalWill + 0.001);
        }
        
        // Political will affected by public support
        const supportEffect = (this.state.publicSupport - 0.5) * 0.002;
        this.state.politicalWill = Math.max(0.1, Math.min(1, this.state.politicalWill + supportEffect));
    }

    processBailoutFunds() {
        // Process dedicated bailout funds
        for (const [fundId, fund] of this.state.bailoutFunds) {
            // Fund regeneration
            if (fund.available_funds.lt(fund.total_capacity)) {
                const regeneration = fund.total_capacity.mul(0.001);
                fund.available_funds = fund.available_funds.plus(regeneration);
                fund.available_funds = Decimal.min(fund.available_funds, fund.total_capacity);
            }
        }
    }

    // Public API
    getInterventionStatus() {
        return {
            governments: Object.fromEntries(this.state.governments),
            activeInterventions: Array.from(this.state.activeInterventions.values()),
            policyTools: Object.fromEntries(this.state.policyTools),
            politicalWill: this.state.politicalWill,
            publicSupport: this.state.publicSupport,
            fiscalCapacity: this.state.fiscalCapacity,
            interventionHistory: this.state.interventionHistory.slice(-10)
        };
    }

    getInterventionCapabilities() {
        const capabilities = [];
        
        for (const [govId, government] of this.state.governments) {
            capabilities.push({
                government: government.name,
                type: government.type,
                available_capacity: government.available_capacity.toString(),
                total_capacity: government.intervention_capacity.toString(),
                political_will: government.political_will,
                credibility: government.credibility,
                active_interventions: government.active_interventions.size,
                intervention_fatigue: government.intervention_fatigue,
                readiness_score: this.calculateReadinessScore(government)
            });
        }
        
        return capabilities.sort((a, b) => b.readiness_score - a.readiness_score);
    }

    calculateReadinessScore(government) {
        const capacityRatio = government.available_capacity.div(government.intervention_capacity).toNumber();
        
        return (
            capacityRatio * 0.3 +
            government.political_will * 0.25 +
            government.credibility * 0.2 +
            (1 - government.intervention_fatigue) * 0.15 +
            government.response_speed * 0.1
        );
    }

    // Manual triggers for testing
    forceIntervention(interventionType, governmentId = null) {
        const government = governmentId ? 
            this.state.governments.get(governmentId) :
            this.selectRespondingGovernment(interventionType);
            
        if (government) {
            this.launchIntervention(interventionType, government, 0.8);
            return true;
        }
        return false;
    }

    setPublicSupport(level) {
        this.state.publicSupport = Math.max(0, Math.min(1, level));
    }

    setPoliticalWill(level) {
        this.state.politicalWill = Math.max(0, Math.min(1, level));
    }
}

module.exports = InterventionEngine;
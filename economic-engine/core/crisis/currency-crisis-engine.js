/**
 * Currency Crisis and Devaluation Engine
 * Simulates currency attacks, exchange rate instability, and capital flight
 */

const EventEmitter = require('eventemitter3');
const Decimal = require('decimal.js');
const { v4: uuidv4 } = require('uuid');
const logger = require('pino')();

class CurrencyCrisisEngine extends EventEmitter {
    constructor(crisisEngine, psychologyEngine, config = {}) {
        super();
        
        this.crisisEngine = crisisEngine;
        this.psychologyEngine = psychologyEngine;
        
        this.config = {
            devaluationThreshold: config.devaluationThreshold || 0.7,
            attackThreshold: config.attackThreshold || 0.8,
            capitalFlightThreshold: config.capitalFlightThreshold || 0.6,
            reserveRatio: config.reserveRatio || 0.3,
            interventionCost: config.interventionCost || 0.1,
            contagionRange: config.contagionRange || 0.5,
            ...config
        };

        this.state = {
            currencies: new Map(),
            exchangeRates: new Map(),
            activeCrises: new Map(),
            capitalFlows: new Map(),
            interventions: new Map(),
            speculativeAttacks: new Map(),
            tradeBalances: new Map(),
            crisisHistory: []
        };

        this.crisisTypes = {
            currency_attack: {
                name: 'Speculative Currency Attack',
                triggers: ['low_reserves', 'trade_deficit', 'political_instability'],
                intensity_range: [0.6, 1.0],
                duration_range: [15, 45],
                contagion_probability: 0.7
            },
            inflation_crisis: {
                name: 'Hyperinflation Crisis',
                triggers: ['monetary_expansion', 'supply_shock', 'confidence_loss'],
                intensity_range: [0.5, 0.9],
                duration_range: [30, 100],
                contagion_probability: 0.4
            },
            capital_flight: {
                name: 'Mass Capital Flight',
                triggers: ['currency_weakness', 'political_risk', 'economic_instability'],
                intensity_range: [0.4, 0.8],
                duration_range: [20, 60],
                contagion_probability: 0.6
            },
            devaluation_spiral: {
                name: 'Competitive Devaluation',
                triggers: ['trade_war', 'export_competitiveness', 'regional_crisis'],
                intensity_range: [0.3, 0.7],
                duration_range: [40, 120],
                contagion_probability: 0.8
            }
        };

        this.initializeCurrencySystem();
        
        logger.info('Currency Crisis Engine initialized');
    }

    initializeCurrencySystem() {
        // Initialize virtual currencies
        const currencies = [
            {
                id: 'USD',
                name: 'US Dollar',
                type: 'reserve',
                stability: 0.9,
                reserves: new Decimal(500000000),
                is_reserve_currency: true
            },
            {
                id: 'EUR',
                name: 'Euro',
                type: 'major',
                stability: 0.85,
                reserves: new Decimal(300000000),
                is_reserve_currency: false
            },
            {
                id: 'ARENA',
                name: 'Arena Credits',
                type: 'digital',
                stability: 0.7,
                reserves: new Decimal(100000000),
                is_reserve_currency: false
            },
            {
                id: 'REGIONAL',
                name: 'Regional Currency',
                type: 'emerging',
                stability: 0.6,
                reserves: new Decimal(50000000),
                is_reserve_currency: false
            }
        ];

        currencies.forEach(currency => {
            this.state.currencies.set(currency.id, {
                ...currency,
                base_value: new Decimal(1),
                current_value: new Decimal(1),
                volatility: 0.1,
                inflation_rate: 0.02,
                interest_rate: 0.03,
                money_supply: new Decimal(1000000000),
                debt_to_gdp: 0.6,
                current_account: new Decimal(0),
                confidence: 0.8,
                under_attack: false,
                intervention_active: false,
                last_intervention: 0
            });
        });

        // Initialize exchange rates (all relative to USD)
        const baseRates = {
            'EUR': 0.85,
            'ARENA': 0.001,
            'REGIONAL': 0.05
        };

        for (const [currencyId, rate] of Object.entries(baseRates)) {
            this.state.exchangeRates.set(`${currencyId}/USD`, {
                base_rate: new Decimal(rate),
                current_rate: new Decimal(rate),
                volatility: 0.1,
                trend: 0,
                daily_change: 0,
                volume: new Decimal(1000000),
                bid_ask_spread: 0.001
            });
        }

        // Initialize trade balances
        this.initializeTradeBalances();
    }

    initializeTradeBalances() {
        for (const currencyId of this.state.currencies.keys()) {
            if (currencyId !== 'USD') {
                this.state.tradeBalances.set(currencyId, {
                    exports: new Decimal(Math.random() * 100000000 + 50000000),
                    imports: new Decimal(Math.random() * 100000000 + 50000000),
                    balance: new Decimal(0),
                    competitiveness: 0.5 + Math.random() * 0.3
                });
            }
        }

        // Calculate balances
        this.updateTradeBalances();
    }

    updateTradeBalances() {
        for (const [currencyId, trade] of this.state.tradeBalances) {
            trade.balance = trade.exports.minus(trade.imports);
            
            // Update competitiveness based on exchange rate
            const exchangeRate = this.state.exchangeRates.get(`${currencyId}/USD`);
            if (exchangeRate) {
                const rateDeviation = exchangeRate.current_rate.div(exchangeRate.base_rate).toNumber();
                trade.competitiveness = 0.5 + (rateDeviation - 1) * 0.5; // Weaker currency = more competitive
            }
        }
    }

    // Main tick processing
    tick(marketData, agents) {
        this.updateCurrencyFundamentals(marketData);
        this.updateExchangeRates();
        this.calculateCapitalFlows(agents);
        this.updateTradeBalances();
        this.evaluateCrisisTriggers();
        this.updateActiveCrises();
        this.processSpeculativeAttacks();
        this.processInterventions();
        this.updateCurrencyConfidence();
        
        return this.getCurrencyCrisisStatus();
    }

    updateCurrencyFundamentals(marketData) {
        for (const [currencyId, currency] of this.state.currencies) {
            // Update inflation based on market conditions
            const marketInflation = this.calculateMarketInflation(marketData);
            currency.inflation_rate = currency.inflation_rate * 0.95 + marketInflation * 0.05;
            
            // Update money supply (simplified monetary policy)
            const psychologyState = this.psychologyEngine.getPsychologyState();
            const monetaryExpansion = (1 - psychologyState.globalSentiment) * 0.01;
            currency.money_supply = currency.money_supply.mul(1 + monetaryExpansion);
            
            // Update interest rates (reactive to inflation and crisis)
            const targetRate = Math.max(0.001, currency.inflation_rate + 0.02);
            currency.interest_rate = currency.interest_rate * 0.9 + targetRate * 0.1;
            
            // Update debt levels
            currency.debt_to_gdp += Math.random() * 0.001 - 0.0005; // Random walk
            currency.debt_to_gdp = Math.max(0.1, Math.min(2.0, currency.debt_to_gdp));
            
            // Update reserves based on interventions and trade
            this.updateCurrencyReserves(currency);
        }
    }

    calculateMarketInflation(marketData) {
        let avgPriceChange = 0;
        let marketCount = 0;
        
        for (const [marketId, market] of marketData) {
            if (market.priceHistory && market.priceHistory.length >= 5) {
                const recent = market.priceHistory.slice(-5);
                const priceChange = (recent[recent.length - 1].price - recent[0].price) / recent[0].price;
                avgPriceChange += priceChange;
                marketCount++;
            }
        }
        
        return marketCount > 0 ? Math.max(0, avgPriceChange / marketCount) : 0.02;
    }

    updateCurrencyReserves(currency) {
        // Reserves affected by trade balance and interventions
        const tradeBalance = this.state.tradeBalances.get(currency.id);
        if (tradeBalance) {
            const reserveChange = tradeBalance.balance.mul(0.1); // 10% of trade balance affects reserves
            currency.reserves = currency.reserves.plus(reserveChange);
        }
        
        // Minimum reserves
        currency.reserves = Decimal.max(currency.reserves, new Decimal(1000000));
    }

    updateExchangeRates() {
        for (const [pairId, rate] of this.state.exchangeRates) {
            const [baseCurrency, quoteCurrency] = pairId.split('/');
            const baseCurrencyData = this.state.currencies.get(baseCurrency);
            const quoteCurrencyData = this.state.currencies.get(quoteCurrency);
            
            if (!baseCurrencyData || !quoteCurrencyData) continue;
            
            // Calculate fundamental rate based on economic factors
            const fundamentalRate = this.calculateFundamentalRate(baseCurrencyData, quoteCurrencyData);
            
            // Apply market forces
            const marketPressure = this.calculateMarketPressure(pairId, baseCurrencyData);
            
            // Apply speculative pressure
            const speculativePressure = this.calculateSpeculativePressure(baseCurrency);
            
            // Update rate
            const oldRate = rate.current_rate;
            const targetRate = fundamentalRate.mul(1 + marketPressure + speculativePressure);
            rate.current_rate = rate.current_rate.mul(0.95).plus(targetRate.mul(0.05)); // Gradual adjustment
            
            // Update metrics
            rate.daily_change = rate.current_rate.div(oldRate).minus(1).toNumber();
            rate.trend = rate.trend * 0.9 + rate.daily_change * 0.1;
            
            // Update volatility
            rate.volatility = Math.abs(rate.daily_change) * 10 + rate.volatility * 0.95;
            rate.volatility = Math.min(1, rate.volatility);
            
            // Update bid-ask spread based on volatility
            rate.bid_ask_spread = Math.max(0.001, rate.volatility * 0.01);
        }
    }

    calculateFundamentalRate(baseCurrency, quoteCurrency) {
        // Simplified fundamental valuation
        let fundamentalRatio = 1.0;
        
        // Interest rate differential
        fundamentalRatio *= (1 + quoteCurrency.interest_rate) / (1 + baseCurrency.interest_rate);
        
        // Inflation differential
        fundamentalRatio *= (1 + quoteCurrency.inflation_rate) / (1 + baseCurrency.inflation_rate);
        
        // Stability differential
        fundamentalRatio *= quoteCurrency.stability / baseCurrency.stability;
        
        // Debt differential
        fundamentalRatio *= baseCurrency.debt_to_gdp / quoteCurrency.debt_to_gdp;
        
        return new Decimal(fundamentalRatio);
    }

    calculateMarketPressure(pairId, currency) {
        let pressure = 0;
        
        // Trade balance pressure
        const tradeBalance = this.state.tradeBalances.get(currency.id);
        if (tradeBalance) {
            const balanceRatio = tradeBalance.balance.div(tradeBalance.exports.plus(1)).toNumber();
            pressure += balanceRatio * 0.1; // Positive balance strengthens currency
        }
        
        // Reserve pressure
        const reserveRatio = currency.reserves.div(currency.money_supply).toNumber();
        if (reserveRatio < this.config.reserveRatio) {
            pressure -= (this.config.reserveRatio - reserveRatio) * 2; // Low reserves weaken currency
        }
        
        // Confidence pressure
        pressure += (currency.confidence - 0.5) * 0.3;
        
        return pressure;
    }

    calculateSpeculativePressure(currencyId) {
        const attack = this.state.speculativeAttacks.get(currencyId);
        if (!attack) return 0;
        
        return -attack.intensity * 0.4; // Attacks weaken currency
    }

    calculateCapitalFlows(agents) {
        for (const [currencyId, currency] of this.state.currencies) {
            let capitalFlow = this.state.capitalFlows.get(currencyId) || {
                inflows: new Decimal(0),
                outflows: new Decimal(0),
                net_flow: new Decimal(0),
                flight_risk: 0,
                speculative_volume: new Decimal(0)
            };
            
            // Reset flows
            capitalFlow.inflows = new Decimal(0);
            capitalFlow.outflows = new Decimal(0);
            capitalFlow.speculative_volume = new Decimal(0);
            
            // Calculate flows based on agent behavior
            for (const [agentId, agent] of agents) {
                if (!agent.isActive) continue;
                
                const flowDecision = this.calculateAgentCapitalFlow(agent, currency);
                
                if (flowDecision.amount.gt(0)) {
                    if (flowDecision.direction === 'inflow') {
                        capitalFlow.inflows = capitalFlow.inflows.plus(flowDecision.amount);
                    } else {
                        capitalFlow.outflows = capitalFlow.outflows.plus(flowDecision.amount);
                    }
                    
                    if (flowDecision.speculative) {
                        capitalFlow.speculative_volume = capitalFlow.speculative_volume.plus(flowDecision.amount);
                    }
                }
            }
            
            // Calculate net flow and flight risk
            capitalFlow.net_flow = capitalFlow.inflows.minus(capitalFlow.outflows);
            const totalFlow = capitalFlow.inflows.plus(capitalFlow.outflows);
            capitalFlow.flight_risk = totalFlow.gt(0) ? 
                capitalFlow.outflows.div(totalFlow).toNumber() : 0;
            
            this.state.capitalFlows.set(currencyId, capitalFlow);
            
            // Update currency reserves based on flows
            const netImpact = capitalFlow.net_flow.mul(0.1);
            currency.reserves = currency.reserves.plus(netImpact);
        }
    }

    calculateAgentCapitalFlow(agent, currency) {
        const psychology = agent.psychology || {};
        const wealth = agent.wealth || new Decimal(0);
        
        let flowProbability = 0;
        let flowAmount = new Decimal(0);
        let isSpeculative = false;
        
        // Base flow based on currency attractiveness
        const interestDifferential = currency.interest_rate - 0.03; // vs benchmark
        flowProbability += interestDifferential * 10; // Interest rate attraction
        
        // Risk factors
        flowProbability -= (1 - currency.stability) * 0.5;
        flowProbability -= currency.inflation_rate * 10;
        flowProbability += currency.confidence * 0.3;
        
        // Agent psychology
        const riskTolerance = (psychology.risk_tolerance || 50) / 100;
        const fear = psychology.fear || 0.5;
        const greed = psychology.greed || 0.5;
        
        flowProbability += riskTolerance * 0.2;
        flowProbability -= fear * 0.4;
        
        // Speculative behavior
        if (greed > 0.7 && psychology.speculation_appetite > 0.6) {
            flowProbability += 0.3;
            isSpeculative = true;
        }
        
        // Calculate flow amount
        if (Math.abs(flowProbability) > 0.1 && Math.random() < 0.1) {
            const flowRatio = Math.min(0.2, Math.abs(flowProbability) * 0.1);
            flowAmount = wealth.mul(flowRatio);
        }
        
        return {
            amount: flowAmount,
            direction: flowProbability > 0 ? 'inflow' : 'outflow',
            speculative: isSpeculative,
            probability: flowProbability
        };
    }

    evaluateCrisisTriggers() {
        for (const [currencyId, currency] of this.state.currencies) {
            if (this.state.activeCrises.has(currencyId)) continue;
            
            const vulnerabilityScore = this.calculateCurrencyVulnerability(currency);
            const triggerProbability = this.calculateCrisisTriggerProbability(vulnerabilityScore, currency);
            
            if (triggerProbability > 0.8 && Math.random() < 0.002) {
                this.triggerCurrencyCrisis(currencyId, currency, vulnerabilityScore);
            }
        }
    }

    calculateCurrencyVulnerability(currency) {
        let vulnerability = 0;
        
        // Reserve adequacy
        const reserveRatio = currency.reserves.div(currency.money_supply).toNumber();
        if (reserveRatio < this.config.reserveRatio) {
            vulnerability += (this.config.reserveRatio - reserveRatio) * 2;
        }
        
        // Debt sustainability
        if (currency.debt_to_gdp > 0.9) {
            vulnerability += (currency.debt_to_gdp - 0.9) * 0.5;
        }
        
        // Inflation pressure
        if (currency.inflation_rate > 0.05) {
            vulnerability += (currency.inflation_rate - 0.05) * 10;
        }
        
        // Capital flight risk
        const capitalFlow = this.state.capitalFlows.get(currency.id);
        if (capitalFlow && capitalFlow.flight_risk > this.config.capitalFlightThreshold) {
            vulnerability += (capitalFlow.flight_risk - this.config.capitalFlightThreshold) * 2;
        }
        
        // Confidence erosion
        vulnerability += (0.8 - currency.confidence) * 1.5;
        
        return Math.min(1, vulnerability);
    }

    calculateCrisisTriggerProbability(vulnerabilityScore, currency) {
        let probability = vulnerabilityScore;
        
        // External factors
        const psychologyState = this.psychologyEngine.getPsychologyState();
        probability += psychologyState.fearIndex * 0.3;
        probability += (1 - psychologyState.globalSentiment) * 0.2;
        
        // Currency-specific factors
        if (currency.under_attack) probability += 0.4;
        if (currency.is_reserve_currency) probability *= 0.5; // Reserve currencies more stable
        
        // Contagion from other crises
        const activeCrisisCount = this.state.activeCrises.size;
        if (activeCrisisCount > 0) {
            probability += activeCrisisCount * 0.1;
        }
        
        return Math.min(1, probability);
    }

    triggerCurrencyCrisis(currencyId, currency, vulnerabilityScore) {
        const crisisType = this.selectCrisisType(currency, vulnerabilityScore);
        const crisisTemplate = this.crisisTypes[crisisType];
        
        const crisis = {
            id: uuidv4(),
            type: crisisType,
            name: crisisTemplate.name,
            currency_id: currencyId,
            currency_name: currency.name,
            startTime: Date.now(),
            intensity: this.randomInRange(crisisTemplate.intensity_range),
            duration: Math.floor(this.randomInRange(crisisTemplate.duration_range)),
            contagion_probability: crisisTemplate.contagion_probability,
            
            // Initial conditions
            initial_rate: this.getCurrentRate(currencyId),
            initial_reserves: currency.reserves,
            initial_confidence: currency.confidence,
            
            // Tracking
            max_devaluation: 0,
            capital_fled: new Decimal(0),
            intervention_cost: new Decimal(0),
            affected_agents: new Set(),
            contagion_events: [],
            
            // State
            phase: 'onset', // onset, acceleration, peak, stabilization
            ticks_active: 0
        };
        
        this.state.activeCrises.set(currencyId, crisis);
        
        // Apply immediate crisis effects
        this.applyCrisisEffects(crisis, currency);
        
        // Trigger psychological responses
        this.psychologyEngine.triggerPsychologyEvent('market_crash', crisis.intensity);
        
        logger.error('Currency crisis triggered', {
            type: crisisType,
            currency: currencyId,
            intensity: crisis.intensity,
            vulnerability: vulnerabilityScore
        });
        
        this.emit('currency_crisis_triggered', crisis);
    }

    selectCrisisType(currency, vulnerabilityScore) {
        const reserveRatio = currency.reserves.div(currency.money_supply).toNumber();
        const capitalFlow = this.state.capitalFlows.get(currency.id);
        
        if (reserveRatio < 0.1) return 'currency_attack';
        if (currency.inflation_rate > 0.1) return 'inflation_crisis';
        if (capitalFlow && capitalFlow.flight_risk > 0.7) return 'capital_flight';
        
        return 'devaluation_spiral';
    }

    randomInRange(range) {
        return range[0] + Math.random() * (range[1] - range[0]);
    }

    getCurrentRate(currencyId) {
        const rate = this.state.exchangeRates.get(`${currencyId}/USD`);
        return rate ? rate.current_rate : new Decimal(1);
    }

    applyCrisisEffects(crisis, currency) {
        const intensity = crisis.intensity;
        
        // Immediate devaluation
        const devaluation = intensity * 0.2; // Up to 20% immediate drop
        for (const [pairId, rate] of this.state.exchangeRates) {
            if (pairId.startsWith(crisis.currency_id + '/')) {
                rate.current_rate = rate.current_rate.mul(1 - devaluation);
                crisis.max_devaluation = Math.max(crisis.max_devaluation, devaluation);
            }
        }
        
        // Confidence crash
        currency.confidence = Math.max(0.1, currency.confidence - intensity * 0.4);
        
        // Reserve pressure
        const reserveLoss = currency.reserves.mul(intensity * 0.1);
        currency.reserves = currency.reserves.minus(reserveLoss);
        
        // Volatility spike
        for (const [pairId, rate] of this.state.exchangeRates) {
            if (pairId.startsWith(crisis.currency_id + '/')) {
                rate.volatility = Math.min(1, rate.volatility + intensity * 0.5);
            }
        }
        
        // Interest rate emergency response
        if (crisis.type === 'currency_attack') {
            currency.interest_rate = Math.min(0.5, currency.interest_rate + intensity * 0.1);
        }
    }

    updateActiveCrises() {
        for (const [currencyId, crisis] of this.state.activeCrises) {
            crisis.ticks_active++;
            
            const currency = this.state.currencies.get(currencyId);
            if (!currency) continue;
            
            // Update crisis phase
            this.updateCrisisPhase(crisis);
            
            // Apply ongoing effects
            this.applyOngoingCrisisEffects(crisis, currency);
            
            // Check for contagion
            if (Math.random() < crisis.contagion_probability * 0.05) {
                this.triggerCrisisContagion(crisis);
            }
            
            // Check for resolution
            if (this.shouldResolveCrisis(crisis)) {
                this.resolveCurrencyCrisis(currencyId, crisis);
            }
        }
    }

    updateCrisisPhase(crisis) {
        const progress = crisis.ticks_active / crisis.duration;
        
        if (progress < 0.1) {
            crisis.phase = 'onset';
        } else if (progress < 0.4) {
            crisis.phase = 'acceleration';
            crisis.intensity = Math.min(1, crisis.intensity * 1.05);
        } else if (progress < 0.7) {
            crisis.phase = 'peak';
        } else {
            crisis.phase = 'stabilization';
            crisis.intensity *= 0.98;
        }
    }

    applyOngoingCrisisEffects(crisis, currency) {
        const phaseMultipliers = {
            onset: 0.5,
            acceleration: 1.2,
            peak: 1.0,
            stabilization: 0.7
        };
        
        const effectMultiplier = phaseMultipliers[crisis.phase] * crisis.intensity;
        
        // Continued devaluation pressure
        if (effectMultiplier > 0.3) {
            const additionalDevaluation = effectMultiplier * 0.01;
            for (const [pairId, rate] of this.state.exchangeRates) {
                if (pairId.startsWith(crisis.currency_id + '/')) {
                    rate.current_rate = rate.current_rate.mul(1 - additionalDevaluation);
                }
            }
            crisis.max_devaluation = Math.max(crisis.max_devaluation, 
                crisis.max_devaluation + additionalDevaluation);
        }
        
        // Capital flight acceleration
        const capitalFlow = this.state.capitalFlows.get(currency.id);
        if (capitalFlow) {
            const flightIncrease = capitalFlow.outflows.mul(effectMultiplier * 0.1);
            crisis.capital_fled = crisis.capital_fled.plus(flightIncrease);
        }
        
        // Confidence erosion
        currency.confidence = Math.max(0, currency.confidence - effectMultiplier * 0.02);
        
        // Reserve depletion
        if (crisis.type === 'currency_attack') {
            const reserveLoss = currency.reserves.mul(effectMultiplier * 0.02);
            currency.reserves = currency.reserves.minus(reserveLoss);
        }
    }

    processSpeculativeAttacks() {
        // Check for new attacks
        for (const [currencyId, currency] of this.state.currencies) {
            if (!this.state.speculativeAttacks.has(currencyId) && 
                !currency.is_reserve_currency) {
                
                const attackProbability = this.calculateAttackProbability(currency);
                
                if (attackProbability > this.config.attackThreshold && Math.random() < 0.001) {
                    this.launchSpeculativeAttack(currencyId, currency);
                }
            }
        }
        
        // Update ongoing attacks
        for (const [currencyId, attack] of this.state.speculativeAttacks) {
            attack.duration--;
            attack.intensity *= 0.99; // Natural decay
            
            if (attack.duration <= 0 || attack.intensity < 0.2) {
                this.endSpeculativeAttack(currencyId);
            }
        }
    }

    calculateAttackProbability(currency) {
        let probability = 0;
        
        // Vulnerability factors
        const reserveRatio = currency.reserves.div(currency.money_supply).toNumber();
        probability += Math.max(0, (this.config.reserveRatio - reserveRatio) * 2);
        
        // Overvaluation
        const exchangeRate = this.getCurrentRate(currency.id);
        if (exchangeRate.gt(currency.base_value.mul(1.2))) {
            probability += 0.3;
        }
        
        // Political/economic instability
        probability += (0.8 - currency.confidence) * 0.5;
        
        // Market conditions
        const psychologyState = this.psychologyEngine.getPsychologyState();
        probability += psychologyState.greedIndex * 0.2; // Greed drives speculation
        
        return Math.min(1, probability);
    }

    launchSpeculativeAttack(currencyId, currency) {
        const attack = {
            id: uuidv4(),
            currency_id: currencyId,
            startTime: Date.now(),
            intensity: 0.5 + Math.random() * 0.4,
            duration: 10 + Math.floor(Math.random() * 20),
            type: 'coordinated_selling',
            volume: currency.money_supply.mul(0.1), // 10% of money supply
            participants: Math.floor(Math.random() * 50 + 10)
        };
        
        this.state.speculativeAttacks.set(currencyId, attack);
        currency.under_attack = true;
        
        logger.warn('Speculative attack launched', {
            currency: currencyId,
            intensity: attack.intensity,
            duration: attack.duration
        });
        
        this.emit('speculative_attack_launched', attack);
    }

    endSpeculativeAttack(currencyId) {
        const attack = this.state.speculativeAttacks.get(currencyId);
        const currency = this.state.currencies.get(currencyId);
        
        if (attack && currency) {
            attack.endTime = Date.now();
            currency.under_attack = false;
            
            this.emit('speculative_attack_ended', attack);
        }
        
        this.state.speculativeAttacks.delete(currencyId);
    }

    processInterventions() {
        for (const [currencyId, currency] of this.state.currencies) {
            // Check if intervention is needed
            if (this.shouldIntervene(currency) && !currency.intervention_active) {
                this.launchIntervention(currencyId, currency);
            }
        }
        
        // Update ongoing interventions
        for (const [interventionId, intervention] of this.state.interventions) {
            intervention.duration--;
            
            // Apply intervention effects
            this.applyInterventionEffects(intervention);
            
            if (intervention.duration <= 0) {
                this.endIntervention(interventionId);
            }
        }
    }

    shouldIntervene(currency) {
        // Intervention triggers
        const reserveRatio = currency.reserves.div(currency.money_supply).toNumber();
        const exchangeRate = this.getCurrentRate(currency.id);
        const devaluation = exchangeRate.div(currency.base_value).toNumber();
        
        return (
            reserveRatio < 0.2 || // Low reserves
            devaluation < 0.8 || // 20% devaluation
            currency.under_attack || // Under speculative attack
            this.state.activeCrises.has(currency.id) // Active crisis
        );
    }

    launchIntervention(currencyId, currency) {
        const intervention = {
            id: uuidv4(),
            currency_id: currencyId,
            type: 'rate_defense',
            startTime: Date.now(),
            intensity: 0.7,
            duration: 15 + Math.floor(Math.random() * 10),
            cost: currency.reserves.mul(this.config.interventionCost),
            target_rate: this.getCurrentRate(currencyId).mul(1.1)
        };
        
        this.state.interventions.set(intervention.id, intervention);
        currency.intervention_active = true;
        currency.last_intervention = Date.now();
        
        // Immediate cost
        currency.reserves = currency.reserves.minus(intervention.cost);
        
        logger.info('Currency intervention launched', {
            currency: currencyId,
            type: intervention.type,
            cost: intervention.cost.toString()
        });
        
        this.emit('currency_intervention_launched', intervention);
    }

    applyInterventionEffects(intervention) {
        const currency = this.state.currencies.get(intervention.currency_id);
        if (!currency) return;
        
        // Support exchange rate
        for (const [pairId, rate] of this.state.exchangeRates) {
            if (pairId.startsWith(intervention.currency_id + '/')) {
                const supportStrength = intervention.intensity * 0.02;
                rate.current_rate = rate.current_rate.mul(1 + supportStrength);
            }
        }
        
        // Boost confidence
        currency.confidence = Math.min(1, currency.confidence + intervention.intensity * 0.01);
        
        // Additional costs
        const additionalCost = intervention.cost.mul(0.1);
        currency.reserves = currency.reserves.minus(additionalCost);
    }

    endIntervention(interventionId) {
        const intervention = this.state.interventions.get(interventionId);
        
        if (intervention) {
            const currency = this.state.currencies.get(intervention.currency_id);
            if (currency) {
                currency.intervention_active = false;
            }
            
            intervention.endTime = Date.now();
            this.emit('currency_intervention_ended', intervention);
        }
        
        this.state.interventions.delete(interventionId);
    }

    triggerCrisisContagion(originCrisis) {
        const contagionTargets = this.findContagionTargets(originCrisis);
        
        for (const targetId of contagionTargets) {
            if (!this.state.activeCrises.has(targetId)) {
                const targetCurrency = this.state.currencies.get(targetId);
                if (targetCurrency) {
                    const contagionIntensity = originCrisis.intensity * this.config.contagionRange;
                    
                    // Trigger crisis with reduced intensity
                    this.triggerCurrencyCrisis(targetId, targetCurrency, contagionIntensity);
                    
                    // Record contagion
                    originCrisis.contagion_events.push({
                        target_currency: targetId,
                        intensity: contagionIntensity,
                        timestamp: Date.now()
                    });
                    
                    logger.warn('Currency crisis contagion', {
                        origin: originCrisis.currency_id,
                        target: targetId,
                        intensity: contagionIntensity
                    });
                }
            }
        }
    }

    findContagionTargets(crisis) {
        const targets = [];
        
        // Regional contagion (currencies with similar characteristics)
        for (const [currencyId, currency] of this.state.currencies) {
            if (currencyId === crisis.currency_id || currency.is_reserve_currency) continue;
            
            // Similar vulnerability makes currencies susceptible to contagion
            const vulnerability = this.calculateCurrencyVulnerability(currency);
            if (vulnerability > 0.5 && Math.random() < 0.3) {
                targets.push(currencyId);
            }
        }
        
        return targets;
    }

    updateCurrencyConfidence() {
        for (const [currencyId, currency] of this.state.currencies) {
            // Base confidence recovery
            if (!this.state.activeCrises.has(currencyId) && !currency.under_attack) {
                currency.confidence = Math.min(1, currency.confidence + 0.005);
            }
            
            // Confidence affected by market psychology
            const psychologyState = this.psychologyEngine.getPsychologyState();
            const sentimentImpact = (psychologyState.globalSentiment - 0.5) * 0.01;
            currency.confidence = Math.max(0, Math.min(1, currency.confidence + sentimentImpact));
        }
    }

    shouldResolveCrisis(crisis) {
        return (
            crisis.ticks_active >= crisis.duration ||
            crisis.intensity < 0.2
        );
    }

    resolveCurrencyCrisis(currencyId, crisis) {
        const currency = this.state.currencies.get(currencyId);
        crisis.endTime = Date.now();
        crisis.total_duration = crisis.endTime - crisis.startTime;
        
        // Determine resolution outcome
        const finalRate = this.getCurrentRate(currencyId);
        crisis.final_devaluation = crisis.initial_rate.div(finalRate).minus(1).toNumber();
        
        if (crisis.final_devaluation < 0.1) {
            crisis.resolution = 'successful_defense';
        } else if (crisis.final_devaluation < 0.3) {
            crisis.resolution = 'managed_devaluation';
        } else {
            crisis.resolution = 'currency_collapse';
        }
        
        // Record in history
        this.state.crisisHistory.push({
            ...crisis,
            affected_agents: crisis.affected_agents.size,
            contagion_count: crisis.contagion_events.length
        });
        
        this.state.activeCrises.delete(currencyId);
        
        logger.info('Currency crisis resolved', {
            currency: currencyId,
            resolution: crisis.resolution,
            finalDevaluation: crisis.final_devaluation,
            duration: crisis.total_duration
        });
        
        this.emit('currency_crisis_resolved', crisis);
    }

    // Public API
    getCurrencyCrisisStatus() {
        return {
            activeCrises: Array.from(this.state.activeCrises.values()),
            currencies: Object.fromEntries(this.state.currencies),
            exchangeRates: Object.fromEntries(this.state.exchangeRates),
            capitalFlows: Object.fromEntries(this.state.capitalFlows),
            speculativeAttacks: Object.fromEntries(this.state.speculativeAttacks),
            activeInterventions: Array.from(this.state.interventions.values()),
            recentHistory: this.state.crisisHistory.slice(-10)
        };
    }

    getCurrencyHealthReport() {
        const report = [];
        
        for (const [currencyId, currency] of this.state.currencies) {
            const vulnerability = this.calculateCurrencyVulnerability(currency);
            const reserveRatio = currency.reserves.div(currency.money_supply).toNumber();
            const capitalFlow = this.state.capitalFlows.get(currencyId);
            
            report.push({
                currency: currencyId,
                name: currency.name,
                health_score: (1 - vulnerability) * currency.confidence,
                vulnerability_score: vulnerability,
                confidence: currency.confidence,
                reserve_ratio: reserveRatio,
                inflation_rate: currency.inflation_rate,
                capital_flight_risk: capitalFlow ? capitalFlow.flight_risk : 0,
                under_attack: currency.under_attack,
                has_crisis: this.state.activeCrises.has(currencyId),
                risk_level: vulnerability > 0.7 ? 'high' : vulnerability > 0.4 ? 'medium' : 'low'
            });
        }
        
        return report.sort((a, b) => b.vulnerability_score - a.vulnerability_score);
    }

    // Manual triggers for testing
    forceCurrencyCrisis(currencyId, crisisType = 'currency_attack', intensity = 0.8) {
        const currency = this.state.currencies.get(currencyId);
        if (currency && !this.state.activeCrises.has(currencyId)) {
            this.triggerCurrencyCrisis(currencyId, currency, intensity);
            return true;
        }
        return false;
    }

    forceSpeculativeAttack(currencyId) {
        const currency = this.state.currencies.get(currencyId);
        if (currency && !this.state.speculativeAttacks.has(currencyId)) {
            this.launchSpeculativeAttack(currencyId, currency);
            return true;
        }
        return false;
    }
}

module.exports = CurrencyCrisisEngine;
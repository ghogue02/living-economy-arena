/**
 * Market Bubble Formation and Burst Engine
 * Simulates speculative bubbles driven by agent herd behavior and psychological factors
 */

const EventEmitter = require('eventemitter3');
const Decimal = require('decimal.js');
const { v4: uuidv4 } = require('uuid');
const logger = require('pino')();

class BubbleEngine extends EventEmitter {
    constructor(crisisEngine, psychologyEngine, config = {}) {
        super();
        
        this.crisisEngine = crisisEngine;
        this.psychologyEngine = psychologyEngine;
        
        this.config = {
            bubbleThreshold: config.bubbleThreshold || 1.5, // Price ratio vs fundamental value
            euphoriaTrigger: config.euphoriaTrigger || 0.8,
            herdingThreshold: config.herdingThreshold || 0.7,
            maxBubbleSize: config.maxBubbleSize || 5.0,
            burstProbability: config.burstProbability || 0.001,
            fundamentalDecay: config.fundamentalDecay || 0.999,
            momentumDecay: config.momentumDecay || 0.95,
            ...config
        };

        this.state = {
            activeBubbles: new Map(),
            marketMomentum: new Map(),
            fundamentalValues: new Map(),
            speculativeInterest: new Map(),
            herdingBehavior: new Map(),
            bubbleHistory: []
        };

        this.bubbleTypes = {
            asset_bubble: {
                name: 'Asset Price Bubble',
                formation_speed: 1.2,
                burst_intensity: 0.8,
                recovery_time: 30
            },
            commodity_bubble: {
                name: 'Commodity Bubble',
                formation_speed: 0.8,
                burst_intensity: 0.6,
                recovery_time: 20
            },
            tech_bubble: {
                name: 'Technology Speculation Bubble',
                formation_speed: 1.5,
                burst_intensity: 0.9,
                recovery_time: 50
            },
            currency_bubble: {
                name: 'Currency Speculation Bubble',
                formation_speed: 1.0,
                burst_intensity: 0.7,
                recovery_time: 25
            }
        };
        
        logger.info('Bubble Engine initialized');
    }

    // Main tick processing
    tick(marketData, agents) {
        this.updateFundamentalValues(marketData);
        this.calculateMarketMomentum(marketData);
        this.analyzeSpeculativeInterest(agents, marketData);
        this.updateHerdingBehavior(agents);
        this.detectBubbleFormation(marketData, agents);
        this.updateActiveBubbles(marketData, agents);
        this.evaluateBubbleBursts(marketData, agents);
        
        return this.getBubbleStatus();
    }

    updateFundamentalValues(marketData) {
        for (const [marketId, market] of marketData) {
            let fundamentalValue = this.state.fundamentalValues.get(marketId);
            
            if (!fundamentalValue) {
                // Initialize fundamental value based on market characteristics
                fundamentalValue = {
                    value: market.basePrice,
                    intrinsic_factors: {
                        supply_demand: 1.0,
                        utility: market.scarcity ? (1 - market.scarcity) : 0.5,
                        production_cost: market.basePrice * 0.8,
                        economic_conditions: 1.0
                    },
                    last_update: Date.now()
                };
            }
            
            // Update fundamental value based on real economic factors
            const supplyDemandRatio = market.supply.div(market.demand).toNumber();
            fundamentalValue.intrinsic_factors.supply_demand = Math.max(0.1, Math.min(3.0, 2 / supplyDemandRatio));
            
            // Economic conditions adjustment
            const psychologyState = this.psychologyEngine.getPsychologyState();
            fundamentalValue.intrinsic_factors.economic_conditions = 0.5 + psychologyState.globalSentiment * 0.5;
            
            // Calculate new fundamental value
            const factors = fundamentalValue.intrinsic_factors;
            const newValue = market.basePrice * 
                           factors.supply_demand * 
                           factors.utility * 
                           factors.economic_conditions;
            
            // Apply gradual change with decay
            fundamentalValue.value = fundamentalValue.value * this.config.fundamentalDecay + 
                                   newValue * (1 - this.config.fundamentalDecay);
            
            fundamentalValue.last_update = Date.now();
            this.state.fundamentalValues.set(marketId, fundamentalValue);
        }
    }

    calculateMarketMomentum(marketData) {
        for (const [marketId, market] of marketData) {
            let momentum = this.state.marketMomentum.get(marketId) || {
                price_momentum: 0,
                volume_momentum: 0,
                volatility_momentum: 0,
                social_momentum: 0
            };
            
            if (market.priceHistory && market.priceHistory.length >= 10) {
                const prices = market.priceHistory.slice(-10).map(p => p.price);
                const volumes = market.priceHistory.slice(-10).map(p => p.volume || 0);
                
                // Calculate price momentum
                const shortTermTrend = this.calculateTrend(prices.slice(-5));
                const longTermTrend = this.calculateTrend(prices);
                momentum.price_momentum = (shortTermTrend * 0.7 + longTermTrend * 0.3) * this.config.momentumDecay;
                
                // Calculate volume momentum
                const volumeTrend = this.calculateTrend(volumes);
                momentum.volume_momentum = volumeTrend * this.config.momentumDecay;
                
                // Calculate volatility momentum
                const volatility = this.calculateVolatility(prices);
                momentum.volatility_momentum = volatility * this.config.momentumDecay;
            }
            
            // Social momentum from agent behavior
            momentum.social_momentum = this.calculateSocialMomentum(marketId) * this.config.momentumDecay;
            
            this.state.marketMomentum.set(marketId, momentum);
        }
    }

    calculateTrend(values) {
        if (values.length < 2) return 0;
        
        let trend = 0;
        for (let i = 1; i < values.length; i++) {
            trend += (values[i] - values[i-1]) / values[i-1];
        }
        
        return trend / (values.length - 1);
    }

    calculateVolatility(prices) {
        if (prices.length < 2) return 0;
        
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push((prices[i] - prices[i-1]) / prices[i-1]);
        }
        
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        
        return Math.sqrt(variance);
    }

    calculateSocialMomentum(marketId) {
        // Simplified social momentum - would use actual agent sentiment data
        const psychologyState = this.psychologyEngine.getPsychologyState();
        return psychologyState.herdingFactor * psychologyState.globalSentiment;
    }

    analyzeSpeculativeInterest(agents, marketData) {
        for (const [marketId, market] of marketData) {
            let speculativeInterest = this.state.speculativeInterest.get(marketId) || {
                speculator_count: 0,
                speculation_volume: new Decimal(0),
                average_greed: 0,
                leveraged_positions: 0,
                new_entrants: 0
            };
            
            // Reset counters
            speculativeInterest.speculator_count = 0;
            speculativeInterest.speculation_volume = new Decimal(0);
            speculativeInterest.average_greed = 0;
            speculativeInterest.leveraged_positions = 0;
            speculativeInterest.new_entrants = 0;
            
            let greedSum = 0;
            
            // Analyze agents for speculative behavior
            for (const [agentId, agent] of agents) {
                if (!agent.isActive) continue;
                
                const psychology = agent.psychology || {};
                const greed = psychology.greed || 0.5;
                const speculation_appetite = psychology.speculation_appetite || 0.5;
                
                // Check if agent is speculating in this market
                if (speculation_appetite > 0.6 && greed > 0.6) {
                    speculativeInterest.speculator_count++;
                    greedSum += greed;
                    
                    // Estimate speculation volume (simplified)
                    const speculationVolume = (agent.wealth || new Decimal(1000)).mul(speculation_appetite);
                    speculativeInterest.speculation_volume = speculativeInterest.speculation_volume.plus(speculationVolume);
                    
                    // Check for leverage
                    if (agent.leverage && agent.leverage > 1.5) {
                        speculativeInterest.leveraged_positions++;
                    }
                    
                    // Check for new entrants (agents with low experience but high greed)
                    if (psychology.experience < 0.3 && greed > 0.7) {
                        speculativeInterest.new_entrants++;
                    }
                }
            }
            
            speculativeInterest.average_greed = speculativeInterest.speculator_count > 0 ? 
                greedSum / speculativeInterest.speculator_count : 0;
            
            this.state.speculativeInterest.set(marketId, speculativeInterest);
        }
    }

    updateHerdingBehavior(agents) {
        const psychologyState = this.psychologyEngine.getPsychologyState();
        
        for (const [marketId, market] of this.crisisEngine.economicEngine.markets) {
            let herdingBehavior = this.state.herdingBehavior.get(marketId) || {
                intensity: 0,
                direction: 0, // -1 = selling herd, 1 = buying herd
                participants: 0,
                conformity_pressure: 0
            };
            
            // Calculate herding based on agent behavior similarity
            const marketAgents = Array.from(agents.values()).filter(agent => 
                agent.isActive && this.isAgentActiveInMarket(agent, marketId)
            );
            
            if (marketAgents.length > 10) {
                const sentiments = marketAgents.map(agent => agent.psychology?.sentiment || 0.5);
                const decisions = marketAgents.map(agent => this.getAgentMarketDecision(agent, marketId));
                
                // Calculate sentiment uniformity
                const avgSentiment = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;
                const sentimentVariance = sentiments.reduce((sum, s) => sum + Math.pow(s - avgSentiment, 2), 0) / sentiments.length;
                const uniformity = 1 - Math.min(1, sentimentVariance * 4); // Normalize variance
                
                // Calculate decision uniformity
                const buyDecisions = decisions.filter(d => d === 'buy').length;
                const sellDecisions = decisions.filter(d => d === 'sell').length;
                const totalDecisions = buyDecisions + sellDecisions;
                
                if (totalDecisions > 0) {
                    const buyRatio = buyDecisions / totalDecisions;
                    const sellRatio = sellDecisions / totalDecisions;
                    const maxRatio = Math.max(buyRatio, sellRatio);
                    
                    herdingBehavior.intensity = uniformity * maxRatio;
                    herdingBehavior.direction = buyRatio > sellRatio ? 1 : -1;
                    herdingBehavior.participants = Math.floor(maxRatio * totalDecisions);
                    herdingBehavior.conformity_pressure = psychologyState.herdingFactor;
                }
            }
            
            this.state.herdingBehavior.set(marketId, herdingBehavior);
        }
    }

    isAgentActiveInMarket(agent, marketId) {
        // Simplified check - in reality would examine agent's portfolio and recent actions
        return agent.pendingActions && agent.pendingActions.some(action => action.marketId === marketId);
    }

    getAgentMarketDecision(agent, marketId) {
        // Simplified decision inference - in reality would analyze recent actions
        const psychology = agent.psychology || {};
        const greed = psychology.greed || 0.5;
        const fear = psychology.fear || 0.5;
        
        if (greed > fear + 0.2) return 'buy';
        if (fear > greed + 0.2) return 'sell';
        return 'hold';
    }

    detectBubbleFormation(marketData, agents) {
        for (const [marketId, market] of marketData) {
            if (this.state.activeBubbles.has(marketId)) continue;
            
            const bubbleScore = this.calculateBubbleScore(marketId, market);
            
            if (bubbleScore > 0.7 && Math.random() < 0.01) {
                this.formBubble(marketId, market, bubbleScore);
            }
        }
    }

    calculateBubbleScore(marketId, market) {
        const fundamentalValue = this.state.fundamentalValues.get(marketId);
        const momentum = this.state.marketMomentum.get(marketId);
        const speculativeInterest = this.state.speculativeInterest.get(marketId);
        const herdingBehavior = this.state.herdingBehavior.get(marketId);
        
        if (!fundamentalValue || !momentum || !speculativeInterest || !herdingBehavior) {
            return 0;
        }
        
        let score = 0;
        
        // Price deviation from fundamental value
        const currentPrice = market.currentPrice.toNumber();
        const priceRatio = currentPrice / fundamentalValue.value;
        if (priceRatio > this.config.bubbleThreshold) {
            score += Math.min(0.4, (priceRatio - this.config.bubbleThreshold) / 2);
        }
        
        // Momentum factors
        score += Math.max(0, momentum.price_momentum) * 0.2;
        score += Math.max(0, momentum.volume_momentum) * 0.1;
        score += Math.max(0, momentum.social_momentum) * 0.15;
        
        // Speculative interest
        const totalAgents = this.crisisEngine.economicEngine.agents.size;
        const speculatorRatio = totalAgents > 0 ? speculativeInterest.speculator_count / totalAgents : 0;
        score += speculatorRatio * 0.3;
        score += speculativeInterest.average_greed * 0.2;
        
        // Herding behavior
        if (herdingBehavior.direction > 0) { // Buying herd
            score += herdingBehavior.intensity * 0.25;
        }
        
        // Psychology factors
        const psychologyState = this.psychologyEngine.getPsychologyState();
        if (psychologyState.greedIndex > this.config.euphoriaTrigger) {
            score += 0.2;
        }
        
        return Math.min(1, score);
    }

    formBubble(marketId, market, bubbleScore) {
        const bubbleType = this.determineBubbleType(market);
        const bubbleTemplate = this.bubbleTypes[bubbleType];
        
        const bubble = {
            id: uuidv4(),
            marketId,
            marketName: market.name,
            type: bubbleType,
            typeName: bubbleTemplate.name,
            startTime: Date.now(),
            phase: 'formation', // formation, expansion, euphoria, instability
            intensity: bubbleScore,
            size: 1.0, // Size multiplier for price effects
            formation_speed: bubbleTemplate.formation_speed,
            burst_intensity: bubbleTemplate.burst_intensity,
            recovery_time: bubbleTemplate.recovery_time,
            
            // Tracking metrics
            initial_price: market.currentPrice.toNumber(),
            peak_price: market.currentPrice.toNumber(),
            participants: new Set(),
            speculation_volume: new Decimal(0),
            duration: 0,
            
            // Burst risk factors
            burst_probability: 0.001,
            external_shocks: [],
            leverage_risk: 0,
            liquidity_risk: 0
        };
        
        this.state.activeBubbles.set(marketId, bubble);
        
        // Apply initial bubble effects
        this.applyBubbleFormationEffects(bubble, market);
        
        // Trigger psychological responses
        this.psychologyEngine.triggerPsychologyEvent('euphoria', bubbleScore * 0.5);
        
        logger.warn('Market bubble forming', {
            marketId,
            marketName: market.name,
            type: bubbleType,
            score: bubbleScore
        });
        
        this.emit('bubble_formed', bubble);
    }

    determineBubbleType(market) {
        // Determine bubble type based on market characteristics
        if (market.id === 'technology') return 'tech_bubble';
        if (market.id === 'energy' || market.id === 'materials') return 'commodity_bubble';
        if (market.name && market.name.includes('currency')) return 'currency_bubble';
        return 'asset_bubble';
    }

    applyBubbleFormationEffects(bubble, market) {
        // Increase speculative interest
        market.volatility = Math.min(1, market.volatility + 0.1);
        
        // Attract more speculative volume
        const speculativeIncrease = market.totalVolume.mul(0.2);
        market.totalVolume = market.totalVolume.plus(speculativeIncrease);
        
        // Slight price momentum increase
        const priceIncrease = 1 + (bubble.intensity * 0.05);
        market.currentPrice = market.currentPrice.mul(priceIncrease);
    }

    updateActiveBubbles(marketData, agents) {
        for (const [marketId, bubble] of this.state.activeBubbles) {
            bubble.duration++;
            
            const market = marketData.get(marketId);
            if (!market) continue;
            
            // Update bubble phase
            this.updateBubblePhase(bubble, market);
            
            // Apply bubble effects
            this.applyBubbleEffects(bubble, market, agents);
            
            // Update burst probability
            this.updateBurstProbability(bubble, market);
            
            // Track metrics
            this.updateBubbleMetrics(bubble, market);
        }
    }

    updateBubblePhase(bubble, market) {
        const currentPrice = market.currentPrice.toNumber();
        const fundamentalValue = this.state.fundamentalValues.get(bubble.marketId);
        const priceRatio = fundamentalValue ? currentPrice / fundamentalValue.value : 1;
        
        if (bubble.duration < 10) {
            bubble.phase = 'formation';
        } else if (priceRatio < 2.0 && bubble.duration < 30) {
            bubble.phase = 'expansion';
            bubble.intensity = Math.min(1, bubble.intensity * 1.02);
        } else if (priceRatio >= 2.0 || bubble.intensity > 0.8) {
            bubble.phase = 'euphoria';
            bubble.intensity = Math.min(1, bubble.intensity * 1.01);
        } else if (bubble.burst_probability > 0.1 || bubble.duration > 50) {
            bubble.phase = 'instability';
            bubble.intensity *= 0.99; // Slight decline
        }
    }

    applyBubbleEffects(bubble, market, agents) {
        const phaseMultipliers = {
            formation: 1.0,
            expansion: 1.2,
            euphoria: 1.5,
            instability: 0.9
        };
        
        const effectMultiplier = phaseMultipliers[bubble.phase] * bubble.intensity;
        
        // Price effects
        const priceIncrease = 1 + (effectMultiplier * 0.02 * bubble.formation_speed);
        market.currentPrice = market.currentPrice.mul(priceIncrease);
        
        // Update peak price
        const currentPrice = market.currentPrice.toNumber();
        if (currentPrice > bubble.peak_price) {
            bubble.peak_price = currentPrice;
        }
        
        // Size effects
        bubble.size = currentPrice / bubble.initial_price;
        
        // Volatility effects
        market.volatility = Math.min(1, market.volatility + effectMultiplier * 0.01);
        
        // Volume effects (speculative trading)
        const volumeIncrease = market.totalVolume.mul(effectMultiplier * 0.05);
        market.totalVolume = market.totalVolume.plus(volumeIncrease);
        bubble.speculation_volume = bubble.speculation_volume.plus(volumeIncrease);
        
        // Agent effects
        this.applyBubbleAgentEffects(bubble, agents, effectMultiplier);
    }

    applyBubbleAgentEffects(bubble, agents, effectMultiplier) {
        for (const [agentId, agent] of agents) {
            if (!agent.isActive) continue;
            
            const psychology = agent.psychology || {};
            
            // Increase greed during bubble
            if (bubble.phase === 'euphoria' || bubble.phase === 'expansion') {
                psychology.greed = Math.min(1, (psychology.greed || 0.5) + effectMultiplier * 0.02);
                psychology.confidence = Math.min(1, (psychology.confidence || 0.5) + effectMultiplier * 0.01);
                
                // Reduce fear perception
                psychology.fear = Math.max(0, (psychology.fear || 0.5) - effectMultiplier * 0.01);
            }
            
            // Track participants
            if (psychology.greed > 0.7 && this.isAgentActiveInMarket(agent, bubble.marketId)) {
                bubble.participants.add(agentId);
            }
        }
    }

    updateBurstProbability(bubble, market) {
        let burstProbability = this.config.burstProbability;
        
        // Size factor - larger bubbles more likely to burst
        burstProbability += Math.max(0, (bubble.size - 2.0) * 0.001);
        
        // Duration factor - older bubbles more unstable
        burstProbability += Math.max(0, (bubble.duration - 30) * 0.0001);
        
        // Intensity factor
        burstProbability += bubble.intensity * 0.002;
        
        // Market factors
        if (market.volatility > 0.8) burstProbability += 0.001;
        
        // Leverage risk
        const speculativeInterest = this.state.speculativeInterest.get(bubble.marketId);
        if (speculativeInterest) {
            bubble.leverage_risk = speculativeInterest.leveraged_positions / Math.max(1, speculativeInterest.speculator_count);
            burstProbability += bubble.leverage_risk * 0.002;
        }
        
        // Liquidity risk
        bubble.liquidity_risk = 1 - (market.liquidity || 1);
        burstProbability += bubble.liquidity_risk * 0.001;
        
        // External shocks
        const psychologyState = this.psychologyEngine.getPsychologyState();
        if (psychologyState.fearIndex > 0.7) {
            burstProbability += 0.005;
        }
        
        bubble.burst_probability = Math.min(0.1, burstProbability);
    }

    updateBubbleMetrics(bubble, market) {
        // Update tracking metrics for analysis
        const currentPrice = market.currentPrice.toNumber();
        
        bubble.current_price = currentPrice;
        bubble.price_deviation = currentPrice / bubble.initial_price;
        bubble.participant_count = bubble.participants.size;
        bubble.total_speculation_volume = bubble.speculation_volume.toNumber();
    }

    evaluateBubbleBursts(marketData, agents) {
        for (const [marketId, bubble] of this.state.activeBubbles) {
            if (Math.random() < bubble.burst_probability) {
                this.burstBubble(marketId, bubble, marketData, agents);
            }
        }
    }

    burstBubble(marketId, bubble, marketData, agents) {
        const market = marketData.get(marketId);
        if (!market) return;
        
        bubble.burstTime = Date.now();
        bubble.burst_trigger = this.identifyBurstTrigger(bubble);
        
        // Calculate burst severity
        const burstSeverity = this.calculateBurstSeverity(bubble);
        
        // Apply immediate price crash
        const priceCrash = 1 - (burstSeverity * bubble.burst_intensity);
        market.currentPrice = market.currentPrice.mul(Math.max(0.1, priceCrash));
        
        // Massive volatility spike
        market.volatility = Math.min(1, market.volatility + burstSeverity * 0.5);
        
        // Liquidity crisis
        market.liquidity = Math.max(0.1, (market.liquidity || 1) - burstSeverity * 0.3);
        
        // Apply agent effects
        this.applyBubbleBurstAgentEffects(bubble, agents, burstSeverity);
        
        // Trigger psychological panic
        this.psychologyEngine.triggerPsychologyEvent('bubble_burst', burstSeverity);
        
        // Record in history
        bubble.total_duration = bubble.burstTime - bubble.startTime;
        bubble.burst_severity = burstSeverity;
        bubble.final_price = market.currentPrice.toNumber();
        bubble.max_size = bubble.size;
        
        this.state.bubbleHistory.push({
            ...bubble,
            participants: bubble.participants.size,
            speculation_volume: bubble.speculation_volume.toNumber()
        });
        
        this.state.activeBubbles.delete(marketId);
        
        logger.error('Market bubble burst', {
            marketId,
            marketName: bubble.marketName,
            burstSeverity,
            maxSize: bubble.size,
            duration: bubble.total_duration,
            participants: bubble.participants.size
        });
        
        this.emit('bubble_burst', bubble);
        
        // Trigger potential crisis cascade
        if (burstSeverity > 0.7) {
            this.crisisEngine.triggerCrisis('bubble_burst', { systemicRisk: burstSeverity });
        }
    }

    identifyBurstTrigger(bubble) {
        if (bubble.leverage_risk > 0.6) return 'leverage_liquidation';
        if (bubble.liquidity_risk > 0.7) return 'liquidity_crisis';
        if (bubble.size > 4.0) return 'fundamental_disconnect';
        if (bubble.duration > 60) return 'natural_exhaustion';
        return 'external_shock';
    }

    calculateBurstSeverity(bubble) {
        let severity = 0.3; // Base severity
        
        // Size amplifies severity
        severity += Math.max(0, (bubble.size - 1.5) * 0.2);
        
        // Duration amplifies severity
        severity += Math.max(0, (bubble.duration - 20) * 0.01);
        
        // Leverage amplifies severity
        severity += bubble.leverage_risk * 0.3;
        
        // Participant count amplifies severity
        const participantRatio = bubble.participants.size / Math.max(1, this.crisisEngine.economicEngine.agents.size);
        severity += participantRatio * 0.4;
        
        return Math.min(1, severity);
    }

    applyBubbleBurstAgentEffects(bubble, agents, burstSeverity) {
        for (const agentId of bubble.participants) {
            const agent = agents.get(agentId);
            if (!agent || !agent.isActive) continue;
            
            const psychology = agent.psychology || {};
            
            // Massive fear increase
            psychology.fear = Math.min(1, (psychology.fear || 0.5) + burstSeverity * 0.4);
            
            // Greed crash
            psychology.greed = Math.max(0, (psychology.greed || 0.5) - burstSeverity * 0.6);
            
            // Confidence destruction
            psychology.confidence = Math.max(0, (psychology.confidence || 0.5) - burstSeverity * 0.5);
            
            // Wealth impact (simplified)
            if (agent.wealth) {
                const wealthLoss = burstSeverity * 0.3; // Lose up to 30% of wealth
                agent.wealth = agent.wealth.mul(1 - wealthLoss);
            }
            
            // Reduce leverage if leveraged
            if (agent.leverage && agent.leverage > 1) {
                agent.leverage = Math.max(1, agent.leverage - burstSeverity * 2);
            }
        }
    }

    // Public API
    getBubbleStatus() {
        return {
            activeBubbles: Array.from(this.state.activeBubbles.values()),
            bubbleHistory: this.state.bubbleHistory.slice(-10),
            marketMomentum: Object.fromEntries(this.state.marketMomentum),
            speculativeInterest: Object.fromEntries(this.state.speculativeInterest),
            herdingBehavior: Object.fromEntries(this.state.herdingBehavior)
        };
    }

    getBubbleRiskAssessment() {
        const risks = [];
        
        for (const [marketId, market] of this.crisisEngine.economicEngine.markets) {
            const bubbleScore = this.calculateBubbleScore(marketId, market);
            const fundamentalValue = this.state.fundamentalValues.get(marketId);
            
            if (bubbleScore > 0.3 || (fundamentalValue && market.currentPrice.toNumber() / fundamentalValue.value > 1.3)) {
                risks.push({
                    marketId,
                    marketName: market.name,
                    bubbleScore,
                    priceRatio: fundamentalValue ? market.currentPrice.toNumber() / fundamentalValue.value : 1,
                    riskLevel: bubbleScore > 0.7 ? 'high' : bubbleScore > 0.5 ? 'medium' : 'low'
                });
            }
        }
        
        return risks.sort((a, b) => b.bubbleScore - a.bubbleScore);
    }

    getFundamentalAnalysis() {
        const analysis = [];
        
        for (const [marketId, fundamentalValue] of this.state.fundamentalValues) {
            const market = this.crisisEngine.economicEngine.markets.get(marketId);
            if (market) {
                analysis.push({
                    marketId,
                    marketName: market.name,
                    currentPrice: market.currentPrice.toNumber(),
                    fundamentalValue: fundamentalValue.value,
                    deviation: (market.currentPrice.toNumber() / fundamentalValue.value - 1) * 100,
                    factors: fundamentalValue.intrinsic_factors
                });
            }
        }
        
        return analysis;
    }

    // Manual triggers for testing
    forceBubble(marketId, intensity = 0.8) {
        const market = this.crisisEngine.economicEngine.markets.get(marketId);
        if (market && !this.state.activeBubbles.has(marketId)) {
            this.formBubble(marketId, market, intensity);
            return true;
        }
        return false;
    }

    forceBubbleBurst(marketId) {
        const bubble = this.state.activeBubbles.get(marketId);
        const market = this.crisisEngine.economicEngine.markets.get(marketId);
        if (bubble && market) {
            this.burstBubble(marketId, bubble, this.crisisEngine.economicEngine.markets, this.crisisEngine.economicEngine.agents);
            return true;
        }
        return false;
    }
}

module.exports = BubbleEngine;
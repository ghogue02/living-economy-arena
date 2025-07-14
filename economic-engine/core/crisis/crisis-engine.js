/**
 * Living Economy Arena - Market Crisis Generation Engine
 * Simulates realistic economic crises with agent-driven cascade effects
 */

const EventEmitter = require('eventemitter3');
const Decimal = require('decimal.js');
const { v4: uuidv4 } = require('uuid');
const logger = require('pino')();

class MarketCrisisEngine extends EventEmitter {
    constructor(economicEngine, psychologyEngine, config = {}) {
        super();
        
        this.economicEngine = economicEngine;
        this.psychologyEngine = psychologyEngine;
        
        this.config = {
            crisisThreshold: config.crisisThreshold || 0.8,
            cascadeMultiplier: config.cascadeMultiplier || 1.5,
            recoveryRate: config.recoveryRate || 0.02,
            interventionThreshold: config.interventionThreshold || 0.9,
            maxCrisisIntensity: config.maxCrisisIntensity || 2.0,
            crisisMemoryDecay: config.crisisMemoryDecay || 0.98,
            ...config
        };

        this.state = {
            activeCrises: new Map(),
            crisisIntensity: 0,
            systemicRisk: 0,
            liquidity: 1.0,
            confidence: 1.0,
            interventionActive: false,
            lastCrisisTime: 0,
            crisisHistory: []
        };

        this.triggers = {
            bankRun: { threshold: 0.7, probability: 0.001 },
            bubble: { threshold: 0.6, probability: 0.0005 },
            supplyShock: { threshold: 0.5, probability: 0.002 },
            currencyCrisis: { threshold: 0.8, probability: 0.0003 },
            debtCascade: { threshold: 0.75, probability: 0.0008 },
            marketCorner: { threshold: 0.4, probability: 0.0001 }
        };

        this.interventions = new Map();
        this.initializeCrisisTypes();
        
        logger.info('Market Crisis Engine initialized');
    }

    initializeCrisisTypes() {
        // Define crisis behavior templates
        this.crisisTypes = {
            bank_run: {
                name: 'Bank Run',
                triggers: ['confidence_loss', 'liquidity_shortage', 'panic_spreading'],
                effects: {
                    liquidity: -0.4,
                    confidence: -0.6,
                    volatility: 0.8,
                    fear: 0.7
                },
                duration: { min: 5, max: 20 }, // in simulation ticks
                cascadeProbability: 0.6
            },
            bubble_burst: {
                name: 'Market Bubble Burst',
                triggers: ['overvaluation', 'euphoria_peak', 'external_shock'],
                effects: {
                    prices: -0.5,
                    confidence: -0.7,
                    volatility: 1.2,
                    greed: -0.8
                },
                duration: { min: 10, max: 40 },
                cascadeProbability: 0.8
            },
            supply_shock: {
                name: 'Supply Chain Disruption',
                triggers: ['resource_shortage', 'production_halt', 'trade_disruption'],
                effects: {
                    supply: -0.6,
                    prices: 0.4,
                    scarcity: 0.8,
                    hoarding: 0.5
                },
                duration: { min: 15, max: 60 },
                cascadeProbability: 0.4
            },
            currency_crisis: {
                name: 'Currency Devaluation Crisis',
                triggers: ['trade_imbalance', 'confidence_loss', 'speculation_attack'],
                effects: {
                    exchange_rate: -0.3,
                    inflation: 0.6,
                    international_trade: -0.4,
                    capital_flight: 0.8
                },
                duration: { min: 20, max: 80 },
                cascadeProbability: 0.7
            },
            debt_cascade: {
                name: 'Debt Crisis Cascade',
                triggers: ['overleveraging', 'default_spike', 'credit_freeze'],
                effects: {
                    credit_availability: -0.8,
                    leverage: -0.6,
                    defaults: 0.9,
                    interconnected_risk: 1.0
                },
                duration: { min: 25, max: 100 },
                cascadeProbability: 0.9
            },
            market_corner: {
                name: 'Market Cornering Attempt',
                triggers: ['large_position', 'manipulation_detected', 'liquidity_squeeze'],
                effects: {
                    manipulation: 0.8,
                    price_distortion: 0.6,
                    market_fairness: -0.7,
                    regulatory_response: 0.9
                },
                duration: { min: 3, max: 15 },
                cascadeProbability: 0.3
            }
        };
    }

    // Main crisis monitoring and triggering
    tick(marketData, agents) {
        const riskFactors = this.calculateSystemicRisk(marketData, agents);
        this.updateCrisisState(riskFactors);
        
        // Check for new crisis triggers
        this.evaluateCrisisTriggers(riskFactors, marketData, agents);
        
        // Update active crises
        this.updateActiveCrises(marketData, agents);
        
        // Check for interventions
        this.evaluateInterventions(riskFactors);
        
        // Apply crisis effects
        this.applyCrisisEffects(marketData, agents);
        
        // Update recovery processes
        this.updateRecovery();
        
        return this.getCrisisStatus();
    }

    calculateSystemicRisk(marketData, agents) {
        const psychologyState = this.psychologyEngine.getPsychologyState();
        
        const factors = {
            leverage: this.calculateAverageLeverage(agents),
            liquidity: this.calculateLiquidityRisk(marketData),
            interconnectedness: this.calculateInterconnectedness(agents),
            volatility: this.calculateMarketVolatility(marketData),
            sentiment: 1 - psychologyState.globalSentiment,
            concentration: this.calculateMarketConcentration(marketData),
            external: this.calculateExternalRisk()
        };

        // Weighted systemic risk calculation
        const weights = {
            leverage: 0.2,
            liquidity: 0.18,
            interconnectedness: 0.15,
            volatility: 0.12,
            sentiment: 0.15,
            concentration: 0.1,
            external: 0.1
        };

        let systemicRisk = 0;
        for (const [factor, value] of Object.entries(factors)) {
            systemicRisk += value * weights[factor];
        }

        this.state.systemicRisk = Math.min(1, systemicRisk);
        
        return { ...factors, systemicRisk: this.state.systemicRisk };
    }

    evaluateCrisisTriggers(riskFactors, marketData, agents) {
        for (const [crisisType, trigger] of Object.entries(this.triggers)) {
            if (this.state.activeCrises.has(crisisType)) continue;
            
            const triggerProbability = this.calculateTriggerProbability(
                crisisType, 
                riskFactors, 
                marketData, 
                agents
            );
            
            if (triggerProbability > trigger.threshold && Math.random() < trigger.probability * triggerProbability) {
                this.triggerCrisis(crisisType, riskFactors);
            }
        }
    }

    calculateTriggerProbability(crisisType, riskFactors, marketData, agents) {
        const baseRisk = riskFactors.systemicRisk;
        let probability = baseRisk;
        
        switch (crisisType) {
            case 'bankRun':
                probability += (1 - riskFactors.liquidity) * 0.3;
                probability += riskFactors.sentiment * 0.4;
                break;
            case 'bubble':
                probability += this.detectBubbleConditions(marketData) * 0.5;
                probability += (this.psychologyEngine.getPsychologyState().greedIndex) * 0.3;
                break;
            case 'supplyShock':
                probability += this.calculateSupplyVulnerability(marketData) * 0.4;
                break;
            case 'currencyCrisis':
                probability += this.calculateCurrencyVulnerability(marketData) * 0.6;
                break;
            case 'debtCascade':
                probability += riskFactors.leverage * 0.5;
                probability += riskFactors.interconnectedness * 0.3;
                break;
            case 'marketCorner':
                probability += riskFactors.concentration * 0.7;
                break;
        }
        
        return Math.min(1, probability);
    }

    triggerCrisis(crisisType, riskFactors) {
        const crisisTemplate = this.crisisTypes[crisisType];
        if (!crisisTemplate) return;

        const crisis = {
            id: uuidv4(),
            type: crisisType,
            name: crisisTemplate.name,
            startTime: Date.now(),
            intensity: Math.random() * 0.3 + 0.4, // 0.4-0.7 initial intensity
            duration: Math.floor(
                Math.random() * (crisisTemplate.duration.max - crisisTemplate.duration.min) 
                + crisisTemplate.duration.min
            ),
            ticksActive: 0,
            effects: { ...crisisTemplate.effects },
            cascadeProbability: crisisTemplate.cascadeProbability,
            affectedMarkets: new Set(),
            affectedAgents: new Set(),
            interventions: []
        };

        // Adjust crisis intensity based on systemic risk
        crisis.intensity *= (1 + riskFactors.systemicRisk * 0.5);
        crisis.intensity = Math.min(this.config.maxCrisisIntensity, crisis.intensity);

        this.state.activeCrises.set(crisisType, crisis);
        this.state.crisisIntensity = Math.max(this.state.crisisIntensity, crisis.intensity);
        this.state.lastCrisisTime = Date.now();

        // Trigger psychological responses
        this.psychologyEngine.triggerPsychologyEvent(
            this.mapCrisisToEvent(crisisType), 
            crisis.intensity
        );

        // Record crisis
        this.state.crisisHistory.push({
            type: crisisType,
            startTime: crisis.startTime,
            intensity: crisis.intensity,
            riskFactors: { ...riskFactors }
        });

        logger.warn('Crisis triggered', { 
            type: crisisType, 
            intensity: crisis.intensity,
            systemicRisk: riskFactors.systemicRisk 
        });

        this.emit('crisis_triggered', crisis);
    }

    updateActiveCrises(marketData, agents) {
        for (const [crisisType, crisis] of this.state.activeCrises) {
            crisis.ticksActive++;
            
            // Natural decay over time
            crisis.intensity *= 0.995;
            
            // Check for cascade effects
            if (Math.random() < crisis.cascadeProbability * crisis.intensity * 0.1) {
                this.triggerCascade(crisis, marketData, agents);
            }
            
            // Check if crisis should end
            if (crisis.ticksActive >= crisis.duration || crisis.intensity < 0.1) {
                this.endCrisis(crisisType);
            }
        }
        
        // Update overall crisis intensity
        this.state.crisisIntensity = Array.from(this.state.activeCrises.values())
            .reduce((max, crisis) => Math.max(max, crisis.intensity), 0);
    }

    triggerCascade(originCrisis, marketData, agents) {
        const cascadeTypes = this.determineCascadeTypes(originCrisis);
        
        for (const cascadeType of cascadeTypes) {
            if (!this.state.activeCrises.has(cascadeType)) {
                const cascadeIntensity = originCrisis.intensity * 0.6 * Math.random();
                if (cascadeIntensity > 0.2) {
                    this.triggerCrisis(cascadeType, { systemicRisk: cascadeIntensity });
                    
                    logger.warn('Crisis cascade triggered', {
                        origin: originCrisis.type,
                        cascade: cascadeType,
                        intensity: cascadeIntensity
                    });
                }
            }
        }
    }

    determineCascadeTypes(crisis) {
        const cascadeMap = {
            bank_run: ['debt_cascade', 'currency_crisis'],
            bubble_burst: ['bank_run', 'debt_cascade'],
            supply_shock: ['currency_crisis', 'market_corner'],
            currency_crisis: ['bank_run', 'supply_shock'],
            debt_cascade: ['bank_run', 'currency_crisis'],
            market_corner: ['supply_shock']
        };
        
        return cascadeMap[crisis.type] || [];
    }

    applyCrisisEffects(marketData, agents) {
        for (const [crisisType, crisis] of this.state.activeCrises) {
            this.applyMarketEffects(crisis, marketData);
            this.applyAgentEffects(crisis, agents);
        }
    }

    applyMarketEffects(crisis, marketData) {
        const effects = crisis.effects;
        const intensity = crisis.intensity;
        
        for (const [marketId, market] of marketData) {
            // Liquidity effects
            if (effects.liquidity) {
                const liquidityChange = effects.liquidity * intensity * 0.1;
                market.liquidity = Math.max(0.1, (market.liquidity || 1) + liquidityChange);
            }
            
            // Price effects
            if (effects.prices) {
                const priceMultiplier = 1 + (effects.prices * intensity * 0.05);
                market.currentPrice = market.currentPrice.mul(priceMultiplier);
            }
            
            // Supply effects
            if (effects.supply) {
                const supplyMultiplier = 1 + (effects.supply * intensity * 0.1);
                market.supply = market.supply.mul(supplyMultiplier);
            }
            
            // Volatility effects
            if (effects.volatility) {
                market.volatility += effects.volatility * intensity * 0.02;
                market.volatility = Math.min(1, market.volatility);
            }
            
            crisis.affectedMarkets.add(marketId);
        }
    }

    applyAgentEffects(crisis, agents) {
        const effects = crisis.effects;
        const intensity = crisis.intensity;
        
        for (const [agentId, agent] of agents) {
            if (!agent.isActive) continue;
            
            // Confidence effects
            if (effects.confidence) {
                const confidenceChange = effects.confidence * intensity * 0.1;
                agent.psychology = agent.psychology || {};
                agent.psychology.confidence = Math.max(0, Math.min(1, 
                    (agent.psychology.confidence || 0.5) + confidenceChange
                ));
            }
            
            // Fear effects
            if (effects.fear) {
                const fearChange = effects.fear * intensity * 0.1;
                agent.psychology.fear = Math.max(0, Math.min(1,
                    (agent.psychology.fear || 0.5) + fearChange
                ));
            }
            
            // Leverage effects (debt crisis)
            if (effects.leverage && agent.leverage) {
                const leverageChange = effects.leverage * intensity * 0.05;
                agent.leverage = Math.max(0, agent.leverage + leverageChange);
            }
            
            crisis.affectedAgents.add(agentId);
        }
    }

    evaluateInterventions(riskFactors) {
        if (this.state.interventionActive) return;
        
        if (this.state.crisisIntensity > this.config.interventionThreshold || 
            riskFactors.systemicRisk > this.config.interventionThreshold) {
            
            this.triggerIntervention(riskFactors);
        }
    }

    triggerIntervention(riskFactors) {
        const interventionType = this.selectInterventionType(riskFactors);
        
        const intervention = {
            id: uuidv4(),
            type: interventionType,
            startTime: Date.now(),
            intensity: Math.min(1, riskFactors.systemicRisk + 0.2),
            duration: this.calculateInterventionDuration(interventionType),
            effects: this.getInterventionEffects(interventionType)
        };
        
        this.interventions.set(intervention.id, intervention);
        this.state.interventionActive = true;
        
        logger.info('Government intervention triggered', {
            type: interventionType,
            intensity: intervention.intensity,
            systemicRisk: riskFactors.systemicRisk
        });
        
        this.emit('intervention_triggered', intervention);
    }

    endCrisis(crisisType) {
        const crisis = this.state.activeCrises.get(crisisType);
        if (!crisis) return;
        
        crisis.endTime = Date.now();
        crisis.totalDuration = crisis.endTime - crisis.startTime;
        
        // Record crisis completion
        const historyEntry = this.state.crisisHistory.find(h => 
            h.type === crisisType && h.startTime === crisis.startTime
        );
        if (historyEntry) {
            historyEntry.endTime = crisis.endTime;
            historyEntry.totalDuration = crisis.totalDuration;
            historyEntry.affectedMarkets = crisis.affectedMarkets.size;
            historyEntry.affectedAgents = crisis.affectedAgents.size;
        }
        
        this.state.activeCrises.delete(crisisType);
        
        logger.info('Crisis ended', {
            type: crisisType,
            duration: crisis.totalDuration,
            affectedMarkets: crisis.affectedMarkets.size,
            affectedAgents: crisis.affectedAgents.size
        });
        
        this.emit('crisis_ended', crisis);
    }

    // Crisis detection helpers
    detectBubbleConditions(marketData) {
        let bubbleScore = 0;
        let marketCount = 0;
        
        for (const [marketId, market] of marketData) {
            if (market.priceHistory && market.priceHistory.length >= 20) {
                const prices = market.priceHistory.slice(-20).map(p => p.price);
                const basePrice = market.basePrice;
                const currentPrice = prices[prices.length - 1];
                
                // Price deviation from base
                const priceRatio = currentPrice / basePrice;
                if (priceRatio > 1.5) bubbleScore += 0.3;
                if (priceRatio > 2.0) bubbleScore += 0.4;
                
                // Price growth velocity
                const recentGrowth = (prices[prices.length - 1] - prices[prices.length - 10]) / prices[prices.length - 10];
                if (recentGrowth > 0.2) bubbleScore += 0.3;
                
                marketCount++;
            }
        }
        
        return marketCount > 0 ? bubbleScore / marketCount : 0;
    }

    calculateSupplyVulnerability(marketData) {
        let vulnerability = 0;
        let marketCount = 0;
        
        for (const [marketId, market] of marketData) {
            const supplyDemandRatio = market.supply.div(market.demand).toNumber();
            if (supplyDemandRatio < 0.8) vulnerability += 0.4;
            if (supplyDemandRatio < 0.6) vulnerability += 0.3;
            if (market.scarcity > 0.7) vulnerability += 0.3;
            marketCount++;
        }
        
        return marketCount > 0 ? vulnerability / marketCount : 0;
    }

    calculateCurrencyVulnerability(marketData) {
        // Simplified currency vulnerability - would need forex data in real implementation
        const psychologyState = this.psychologyEngine.getPsychologyState();
        let vulnerability = 0;
        
        // High fear increases currency vulnerability
        vulnerability += psychologyState.fearIndex * 0.4;
        
        // Low confidence increases vulnerability
        vulnerability += (1 - psychologyState.globalSentiment) * 0.3;
        
        // Trade imbalances (simplified)
        let totalImports = 0, totalExports = 0;
        for (const [marketId, market] of marketData) {
            totalImports += market.totalVolume ? market.totalVolume.toNumber() * 0.3 : 0;
            totalExports += market.totalVolume ? market.totalVolume.toNumber() * 0.7 : 0;
        }
        
        const tradeBalance = totalExports / (totalImports + 1);
        if (tradeBalance < 0.8) vulnerability += 0.3;
        
        return Math.min(1, vulnerability);
    }

    // Recovery and intervention systems
    updateRecovery() {
        if (this.state.crisisIntensity > 0) {
            // Natural recovery
            this.state.crisisIntensity *= (1 - this.config.recoveryRate);
            
            // Recovery from interventions
            if (this.state.interventionActive) {
                this.state.crisisIntensity *= 0.98; // Faster recovery with intervention
                this.state.confidence = Math.min(1, this.state.confidence + 0.01);
                this.state.liquidity = Math.min(1, this.state.liquidity + 0.02);
            }
        }
        
        // Update intervention status
        this.updateInterventions();
    }

    updateInterventions() {
        for (const [interventionId, intervention] of this.interventions) {
            intervention.duration--;
            
            if (intervention.duration <= 0) {
                this.endIntervention(interventionId);
            }
        }
        
        if (this.interventions.size === 0) {
            this.state.interventionActive = false;
        }
    }

    endIntervention(interventionId) {
        const intervention = this.interventions.get(interventionId);
        if (!intervention) return;
        
        intervention.endTime = Date.now();
        this.interventions.delete(interventionId);
        
        logger.info('Intervention ended', {
            type: intervention.type,
            duration: intervention.endTime - intervention.startTime
        });
        
        this.emit('intervention_ended', intervention);
    }

    // Utility methods
    calculateAverageLeverage(agents) {
        let totalLeverage = 0;
        let count = 0;
        
        for (const [agentId, agent] of agents) {
            if (agent.isActive && agent.leverage !== undefined) {
                totalLeverage += agent.leverage;
                count++;
            }
        }
        
        return count > 0 ? totalLeverage / count : 0;
    }

    calculateLiquidityRisk(marketData) {
        let liquidityRisk = 0;
        let marketCount = 0;
        
        for (const [marketId, market] of marketData) {
            const liquidity = market.liquidity || 1;
            liquidityRisk += (1 - liquidity);
            marketCount++;
        }
        
        return marketCount > 0 ? liquidityRisk / marketCount : 0;
    }

    calculateInterconnectedness(agents) {
        // Simplified interconnectedness - would need network analysis in real implementation
        let connections = 0;
        const totalAgents = agents.size;
        
        for (const [agentId, agent] of agents) {
            if (agent.relationships) {
                connections += Object.keys(agent.relationships).length;
            }
        }
        
        return totalAgents > 0 ? (connections / totalAgents) / 10 : 0; // Normalize
    }

    calculateMarketVolatility(marketData) {
        let totalVolatility = 0;
        let marketCount = 0;
        
        for (const [marketId, market] of marketData) {
            totalVolatility += market.volatility || 0;
            marketCount++;
        }
        
        return marketCount > 0 ? totalVolatility / marketCount : 0;
    }

    calculateMarketConcentration(marketData) {
        // Calculate HHI-style concentration
        let concentration = 0;
        let totalVolume = 0;
        const volumes = [];
        
        for (const [marketId, market] of marketData) {
            const volume = market.totalVolume ? market.totalVolume.toNumber() : 0;
            volumes.push(volume);
            totalVolume += volume;
        }
        
        if (totalVolume > 0) {
            for (const volume of volumes) {
                const marketShare = volume / totalVolume;
                concentration += marketShare * marketShare;
            }
        }
        
        return concentration;
    }

    calculateExternalRisk() {
        // Placeholder for external risk factors
        // In real implementation, would consider geopolitical events, natural disasters, etc.
        return Math.random() * 0.1; // Base external risk
    }

    selectInterventionType(riskFactors) {
        const types = ['liquidity_injection', 'interest_rate_cut', 'bailout', 'trading_halt', 'regulatory_action'];
        
        if (riskFactors.liquidity > 0.7) return 'liquidity_injection';
        if (this.state.activeCrises.has('bank_run')) return 'bailout';
        if (this.state.activeCrises.has('market_corner')) return 'regulatory_action';
        if (riskFactors.volatility > 0.8) return 'trading_halt';
        
        return 'interest_rate_cut'; // Default
    }

    calculateInterventionDuration(type) {
        const durations = {
            liquidity_injection: 20,
            interest_rate_cut: 50,
            bailout: 30,
            trading_halt: 5,
            regulatory_action: 40
        };
        
        return durations[type] || 20;
    }

    getInterventionEffects(type) {
        const effects = {
            liquidity_injection: { liquidity: 0.3, confidence: 0.2 },
            interest_rate_cut: { confidence: 0.25, demand: 0.15 },
            bailout: { confidence: 0.4, systemic_risk: -0.3 },
            trading_halt: { volatility: -0.5, panic: -0.3 },
            regulatory_action: { manipulation: -0.8, fairness: 0.6 }
        };
        
        return effects[type] || {};
    }

    mapCrisisToEvent(crisisType) {
        const mapping = {
            bank_run: 'market_crash',
            bubble_burst: 'bubble_burst',
            supply_shock: 'uncertainty',
            currency_crisis: 'market_crash',
            debt_cascade: 'market_crash',
            market_corner: 'uncertainty'
        };
        
        return mapping[crisisType] || 'uncertainty';
    }

    // Public API
    getCrisisStatus() {
        return {
            activeCrises: Array.from(this.state.activeCrises.values()),
            crisisIntensity: this.state.crisisIntensity,
            systemicRisk: this.state.systemicRisk,
            interventionActive: this.state.interventionActive,
            activeInterventions: Array.from(this.interventions.values()),
            recentHistory: this.state.crisisHistory.slice(-10)
        };
    }

    getMarketStabilityIndex() {
        return Math.max(0, 1 - this.state.crisisIntensity - this.state.systemicRisk * 0.5);
    }

    getCrisisRiskFactors() {
        return {
            systemicRisk: this.state.systemicRisk,
            liquidity: this.state.liquidity,
            confidence: this.state.confidence,
            crisisIntensity: this.state.crisisIntensity,
            interventionActive: this.state.interventionActive
        };
    }

    // Manual crisis triggers for testing/events
    forceCrisis(crisisType, intensity = 0.5) {
        if (this.crisisTypes[crisisType]) {
            this.triggerCrisis(crisisType, { systemicRisk: intensity });
            return true;
        }
        return false;
    }
}

module.exports = MarketCrisisEngine;
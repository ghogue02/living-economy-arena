/**
 * Debt Crisis Cascade Engine
 * Simulates debt defaults, credit freezes, and financial contagion through interconnected networks
 */

const EventEmitter = require('eventemitter3');
const Decimal = require('decimal.js');
const { v4: uuidv4 } = require('uuid');
const logger = require('pino')();

class DebtCascadeEngine extends EventEmitter {
    constructor(crisisEngine, psychologyEngine, config = {}) {
        super();
        
        this.crisisEngine = crisisEngine;
        this.psychologyEngine = psychologyEngine;
        
        this.config = {
            defaultThreshold: config.defaultThreshold || 0.8,
            leverageLimit: config.leverageLimit || 5.0,
            contagionRadius: config.contagionRadius || 3,
            creditFreezeThreshold: config.creditFreezeThreshold || 0.7,
            recoveryRate: config.recoveryRate || 0.01,
            ...config
        };

        this.state = {
            debtNetwork: new Map(),
            activeCascades: new Map(),
            creditMarkets: new Map(),
            defaultEvents: [],
            leverageDistribution: new Map(),
            systemicRisk: 0,
            creditFreeze: false,
            cascadeHistory: []
        };

        this.cascadeTypes = {
            leverage_liquidation: {
                name: 'Leverage Liquidation Cascade',
                intensity_multiplier: 1.5,
                contagion_speed: 0.8,
                recovery_difficulty: 0.9
            },
            credit_crunch: {
                name: 'Credit Market Freeze',
                intensity_multiplier: 1.2,
                contagion_speed: 0.6,
                recovery_difficulty: 0.7
            },
            sovereign_default: {
                name: 'Sovereign Debt Crisis',
                intensity_multiplier: 2.0,
                contagion_speed: 0.9,
                recovery_difficulty: 0.95
            },
            corporate_cascade: {
                name: 'Corporate Default Cascade',
                intensity_multiplier: 1.3,
                contagion_speed: 0.7,
                recovery_difficulty: 0.8
            }
        };

        this.initializeDebtNetwork();
        
        logger.info('Debt Cascade Engine initialized');
    }

    initializeDebtNetwork() {
        // Initialize credit markets
        const creditMarkets = [
            {
                id: 'corporate_bonds',
                name: 'Corporate Bond Market',
                size: new Decimal(500000000),
                liquidity: 0.8,
                default_rate: 0.02,
                credit_rating: 'BBB'
            },
            {
                id: 'government_bonds',
                name: 'Government Bond Market',
                size: new Decimal(1000000000),
                liquidity: 0.95,
                default_rate: 0.005,
                credit_rating: 'AAA'
            },
            {
                id: 'leveraged_loans',
                name: 'Leveraged Loan Market',
                size: new Decimal(200000000),
                liquidity: 0.6,
                default_rate: 0.05,
                credit_rating: 'BB'
            },
            {
                id: 'retail_credit',
                name: 'Consumer Credit Market',
                size: new Decimal(300000000),
                liquidity: 0.7,
                default_rate: 0.03,
                credit_rating: 'A'
            }
        ];

        creditMarkets.forEach(market => {
            this.state.creditMarkets.set(market.id, {
                ...market,
                outstanding_debt: market.size,
                new_issuance: new Decimal(0),
                defaults_this_period: new Decimal(0),
                spread: 0.02,
                stress_level: 0,
                frozen: false
            });
        });
    }

    // Main tick processing
    tick(marketData, agents) {
        this.updateDebtNetwork(agents);
        this.calculateLeverageDistribution(agents);
        this.updateCreditMarkets();
        this.calculateSystemicRisk();
        this.processDefaultEvents(agents);
        this.evaluateCascadeTriggers();
        this.updateActiveCascades();
        this.processCreditFreeze();
        
        return this.getDebtCascadeStatus();
    }

    updateDebtNetwork(agents) {
        // Build debt network from agent relationships
        this.state.debtNetwork.clear();
        
        for (const [agentId, agent] of agents) {
            if (!agent.isActive) continue;
            
            const debtProfile = {
                agent_id: agentId,
                total_debt: this.calculateAgentDebt(agent),
                leverage_ratio: this.calculateLeverageRatio(agent),
                debt_to_wealth: this.calculateDebtToWealth(agent),
                credit_rating: this.calculateCreditRating(agent),
                default_probability: this.calculateDefaultProbability(agent),
                connections: new Set(),
                counterparty_exposure: new Map(),
                is_systemically_important: this.isSystemicallyImportant(agent)
            };
            
            // Establish debt connections (simplified network)
            this.establishDebtConnections(debtProfile, agents);
            
            this.state.debtNetwork.set(agentId, debtProfile);
        }
    }

    calculateAgentDebt(agent) {
        // Simplified debt calculation based on leverage and wealth
        const wealth = agent.wealth || new Decimal(1000);
        const leverage = agent.leverage || 1;
        return wealth.mul(Math.max(0, leverage - 1));
    }

    calculateLeverageRatio(agent) {
        const wealth = agent.wealth || new Decimal(1000);
        const debt = this.calculateAgentDebt(agent);
        return debt.div(wealth.plus(1)).toNumber();
    }

    calculateDebtToWealth(agent) {
        const wealth = agent.wealth || new Decimal(1000);
        const debt = this.calculateAgentDebt(agent);
        return debt.div(wealth).toNumber();
    }

    calculateCreditRating(agent) {
        const psychology = agent.psychology || {};
        const confidence = psychology.confidence || 0.5;
        const leverage = this.calculateLeverageRatio(agent);
        const wealth = agent.wealth || new Decimal(1000);
        
        let score = 100;
        score -= leverage * 30; // Leverage reduces rating
        score += confidence * 20; // Confidence improves rating
        score += Math.min(20, Math.log10(wealth.toNumber() + 1) * 5); // Wealth improves rating
        
        if (score > 90) return 'AAA';
        if (score > 80) return 'AA';
        if (score > 70) return 'A';
        if (score > 60) return 'BBB';
        if (score > 50) return 'BB';
        if (score > 40) return 'B';
        return 'C';
    }

    calculateDefaultProbability(agent) {
        const psychology = agent.psychology || {};
        const leverage = this.calculateLeverageRatio(agent);
        const fear = psychology.fear || 0.5;
        const confidence = psychology.confidence || 0.5;
        
        let probability = 0;
        
        // High leverage increases default risk
        probability += Math.max(0, (leverage - 0.5) * 0.4);
        
        // Fear increases default risk
        probability += fear * 0.3;
        
        // Low confidence increases default risk
        probability += (1 - confidence) * 0.2;
        
        // Market stress increases default risk
        const psychologyState = this.psychologyEngine.getPsychologyState();
        probability += psychologyState.fearIndex * 0.2;
        
        return Math.min(1, probability);
    }

    isSystemicallyImportant(agent) {
        const wealth = agent.wealth || new Decimal(1000);
        const leverage = agent.leverage || 1;
        const connections = agent.relationships ? Object.keys(agent.relationships).length : 0;
        
        // Large, highly leveraged, or well-connected agents are systemically important
        return (
            wealth.gt(100000) || // High wealth
            leverage > 3.0 || // High leverage
            connections > 10 // Many connections
        );
    }

    establishDebtConnections(debtProfile, agents) {
        // Simplified connection establishment
        const agentIds = Array.from(agents.keys());
        const maxConnections = Math.min(10, Math.floor(agentIds.length * 0.1));
        
        for (let i = 0; i < maxConnections; i++) {
            const randomAgent = agentIds[Math.floor(Math.random() * agentIds.length)];
            if (randomAgent !== debtProfile.agent_id) {
                debtProfile.connections.add(randomAgent);
                
                // Calculate exposure (simplified)
                const exposure = debtProfile.total_debt.mul(Math.random() * 0.1);
                debtProfile.counterparty_exposure.set(randomAgent, exposure);
            }
        }
    }

    calculateLeverageDistribution(agents) {
        const distribution = {
            low: 0, // < 1.5x
            medium: 0, // 1.5x - 3x
            high: 0, // 3x - 5x
            extreme: 0 // > 5x
        };
        
        for (const [agentId, debtProfile] of this.state.debtNetwork) {
            const leverage = debtProfile.leverage_ratio;
            
            if (leverage < 1.5) distribution.low++;
            else if (leverage < 3.0) distribution.medium++;
            else if (leverage < 5.0) distribution.high++;
            else distribution.extreme++;
        }
        
        this.state.leverageDistribution = distribution;
    }

    updateCreditMarkets() {
        for (const [marketId, market] of this.state.creditMarkets) {
            // Update default rates based on economic conditions
            const psychologyState = this.psychologyEngine.getPsychologyState();
            const stressMultiplier = 1 + (1 - psychologyState.globalSentiment) * 2;
            
            market.default_rate = Math.min(0.2, market.default_rate * stressMultiplier * 0.01 + market.default_rate * 0.99);
            
            // Update spreads based on risk
            market.spread = Math.max(0.001, market.default_rate * 10 + market.stress_level * 0.05);
            
            // Update liquidity based on stress
            market.liquidity = Math.max(0.1, market.liquidity - market.stress_level * 0.1);
            
            // Calculate new defaults
            const defaultAmount = market.outstanding_debt.mul(market.default_rate / 365); // Daily defaults
            market.defaults_this_period = defaultAmount;
            market.outstanding_debt = market.outstanding_debt.minus(defaultAmount);
            
            // Update stress level
            market.stress_level = this.calculateMarketStressLevel(market);
        }
    }

    calculateMarketStressLevel(market) {
        let stress = 0;
        
        // High default rate increases stress
        stress += Math.min(1, market.default_rate * 20);
        
        // Low liquidity increases stress
        stress += Math.max(0, (0.8 - market.liquidity) * 2);
        
        // High spreads indicate stress
        stress += Math.min(1, market.spread * 20);
        
        // Systemic risk spillover
        stress += this.state.systemicRisk * 0.3;
        
        return Math.min(1, stress);
    }

    calculateSystemicRisk() {
        let systemicRisk = 0;
        let totalWeight = 0;
        
        // Aggregate risk from debt network
        for (const [agentId, debtProfile] of this.state.debtNetwork) {
            const weight = debtProfile.is_systemically_important ? 3 : 1;
            systemicRisk += debtProfile.default_probability * weight;
            totalWeight += weight;
        }
        
        if (totalWeight > 0) {
            systemicRisk /= totalWeight;
        }
        
        // Add credit market stress
        let marketStress = 0;
        for (const market of this.state.creditMarkets.values()) {
            marketStress += market.stress_level;
        }
        marketStress /= this.state.creditMarkets.size;
        
        systemicRisk = (systemicRisk + marketStress) / 2;
        
        // Add leverage risk
        const extremeLeverageRatio = this.state.leverageDistribution.extreme / 
            Math.max(1, Object.values(this.state.leverageDistribution).reduce((a, b) => a + b, 0));
        systemicRisk += extremeLeverageRatio * 0.3;
        
        this.state.systemicRisk = Math.min(1, systemicRisk);
    }

    processDefaultEvents(agents) {
        for (const [agentId, debtProfile] of this.state.debtNetwork) {
            if (Math.random() < debtProfile.default_probability * 0.01) { // 1% of probability per tick
                this.triggerDefaultEvent(agentId, debtProfile, agents);
            }
        }
    }

    triggerDefaultEvent(agentId, debtProfile, agents) {
        const defaultEvent = {
            id: uuidv4(),
            agent_id: agentId,
            timestamp: Date.now(),
            default_amount: debtProfile.total_debt,
            credit_rating: debtProfile.credit_rating,
            systemic_importance: debtProfile.is_systemically_important,
            counterparty_losses: new Map(),
            cascade_triggered: false
        };
        
        // Calculate counterparty losses
        for (const [counterpartyId, exposure] of debtProfile.counterparty_exposure) {
            const lossRate = Math.random() * 0.8 + 0.2; // 20-100% loss
            const loss = exposure.mul(lossRate);
            defaultEvent.counterparty_losses.set(counterpartyId, loss);
            
            // Apply loss to counterparty
            const counterparty = agents.get(counterpartyId);
            if (counterparty && counterparty.wealth) {
                counterparty.wealth = counterparty.wealth.minus(loss);
                
                // Update counterparty's psychology
                if (counterparty.psychology) {
                    counterparty.psychology.fear = Math.min(1, (counterparty.psychology.fear || 0.5) + 0.2);
                    counterparty.psychology.confidence = Math.max(0, (counterparty.psychology.confidence || 0.5) - 0.3);
                }
            }
        }
        
        // Update defaulting agent
        const agent = agents.get(agentId);
        if (agent) {
            agent.leverage = 1; // Reset leverage after default
            if (agent.wealth) {
                agent.wealth = agent.wealth.mul(0.1); // Severe wealth loss
            }
            
            // Psychological impact
            if (agent.psychology) {
                agent.psychology.fear = Math.min(1, (agent.psychology.fear || 0.5) + 0.8);
                agent.psychology.confidence = Math.max(0, (agent.psychology.confidence || 0.5) - 0.9);
            }
        }
        
        this.state.defaultEvents.push(defaultEvent);
        
        // Check if this triggers a cascade
        if (debtProfile.is_systemically_important || debtProfile.total_debt.gt(10000000)) {
            this.triggerDebtCascade(defaultEvent);
        }
        
        logger.warn('Debt default event', {
            agentId,
            amount: defaultEvent.default_amount.toString(),
            systemicImportance: debtProfile.is_systemically_important,
            counterparties: defaultEvent.counterparty_losses.size
        });
        
        this.emit('debt_default', defaultEvent);
    }

    evaluateCascadeTriggers() {
        // Check for systemic cascade triggers
        if (this.state.systemicRisk > this.config.defaultThreshold && Math.random() < 0.001) {
            this.triggerSystemicCascade();
        }
        
        // Check for leverage liquidation triggers
        const extremeLeverageRatio = this.state.leverageDistribution.extreme / 
            Math.max(1, Object.values(this.state.leverageDistribution).reduce((a, b) => a + b, 0));
        
        if (extremeLeverageRatio > 0.1 && Math.random() < 0.0005) {
            this.triggerLeverageLiquidationCascade();
        }
        
        // Check for credit freeze triggers
        if (!this.state.creditFreeze) {
            let avgStress = 0;
            for (const market of this.state.creditMarkets.values()) {
                avgStress += market.stress_level;
            }
            avgStress /= this.state.creditMarkets.size;
            
            if (avgStress > this.config.creditFreezeThreshold && Math.random() < 0.002) {
                this.triggerCreditFreeze();
            }
        }
    }

    triggerSystemicCascade() {
        const cascade = {
            id: uuidv4(),
            type: 'sovereign_default',
            name: 'Systemic Debt Crisis',
            startTime: Date.now(),
            intensity: 0.8 + Math.random() * 0.2,
            affected_agents: new Set(),
            affected_markets: new Set(),
            total_losses: new Decimal(0),
            propagation_rounds: 0,
            is_active: true
        };
        
        this.state.activeCascades.set(cascade.id, cascade);
        this.propagateCascade(cascade);
        
        logger.error('Systemic debt cascade triggered', {
            intensity: cascade.intensity,
            systemicRisk: this.state.systemicRisk
        });
        
        this.emit('debt_cascade_triggered', cascade);
    }

    triggerLeverageLiquidationCascade() {
        const cascade = {
            id: uuidv4(),
            type: 'leverage_liquidation',
            name: 'Leverage Liquidation Cascade',
            startTime: Date.now(),
            intensity: 0.6 + Math.random() * 0.3,
            affected_agents: new Set(),
            affected_markets: new Set(),
            total_losses: new Decimal(0),
            propagation_rounds: 0,
            is_active: true
        };
        
        this.state.activeCascades.set(cascade.id, cascade);
        this.propagateLeverageCascade(cascade);
        
        logger.warn('Leverage liquidation cascade triggered', {
            intensity: cascade.intensity,
            extremeLeverage: this.state.leverageDistribution.extreme
        });
        
        this.emit('leverage_cascade_triggered', cascade);
    }

    triggerDebtCascade(triggerEvent) {
        const cascade = {
            id: uuidv4(),
            type: 'corporate_cascade',
            name: 'Corporate Default Cascade',
            trigger_event: triggerEvent.id,
            startTime: Date.now(),
            intensity: triggerEvent.systemic_importance ? 0.8 : 0.5,
            affected_agents: new Set([triggerEvent.agent_id]),
            affected_markets: new Set(),
            total_losses: triggerEvent.default_amount,
            propagation_rounds: 0,
            is_active: true
        };
        
        this.state.activeCascades.set(cascade.id, cascade);
        triggerEvent.cascade_triggered = true;
        
        this.propagateCascade(cascade);
        
        logger.warn('Debt cascade triggered by default', {
            triggerAgent: triggerEvent.agent_id,
            defaultAmount: triggerEvent.default_amount.toString(),
            intensity: cascade.intensity
        });
        
        this.emit('debt_cascade_triggered', cascade);
    }

    propagateCascade(cascade) {
        cascade.propagation_rounds++;
        const cascadeTemplate = this.cascadeTypes[cascade.type];
        
        // Find propagation targets
        const targets = this.findCascadeTargets(cascade);
        
        for (const targetId of targets) {
            if (!cascade.affected_agents.has(targetId)) {
                const debtProfile = this.state.debtNetwork.get(targetId);
                if (debtProfile) {
                    // Calculate cascade impact
                    const impact = this.calculateCascadeImpact(cascade, debtProfile, cascadeTemplate);
                    
                    if (impact.force_default) {
                        cascade.affected_agents.add(targetId);
                        cascade.total_losses = cascade.total_losses.plus(impact.loss_amount);
                        
                        // Apply impact to agent
                        this.applyCascadeImpact(targetId, impact);
                    }
                }
            }
        }
        
        // Update affected markets
        for (const [marketId, market] of this.state.creditMarkets) {
            if (cascade.affected_agents.size > 10) { // Significant cascade
                market.stress_level = Math.min(1, market.stress_level + cascade.intensity * 0.1);
                cascade.affected_markets.add(marketId);
            }
        }
        
        // Check for continued propagation
        if (cascade.propagation_rounds < 5 && targets.length > 0 && cascade.intensity > 0.2) {
            // Schedule next propagation round (would be handled in updateActiveCascades)
            cascade.intensity *= 0.8; // Diminishing intensity
        } else {
            cascade.is_active = false;
        }
    }

    propagateLeverageCascade(cascade) {
        // Target highly leveraged agents for forced liquidation
        for (const [agentId, debtProfile] of this.state.debtNetwork) {
            if (debtProfile.leverage_ratio > 3.0 && Math.random() < cascade.intensity * 0.2) {
                cascade.affected_agents.add(agentId);
                
                // Force deleveraging
                const agent = this.crisisEngine.economicEngine.agents.get(agentId);
                if (agent) {
                    const wealthLoss = agent.wealth ? agent.wealth.mul(0.3) : new Decimal(0);
                    cascade.total_losses = cascade.total_losses.plus(wealthLoss);
                    
                    if (agent.wealth) {
                        agent.wealth = agent.wealth.minus(wealthLoss);
                    }
                    agent.leverage = Math.max(1, agent.leverage * 0.5); // Forced deleveraging
                    
                    // Psychological impact
                    if (agent.psychology) {
                        agent.psychology.fear = Math.min(1, (agent.psychology.fear || 0.5) + 0.4);
                        agent.psychology.confidence = Math.max(0, (agent.psychology.confidence || 0.5) - 0.5);
                    }
                }
            }
        }
    }

    findCascadeTargets(cascade) {
        const targets = [];
        
        // Find connected agents for network propagation
        for (const affectedId of cascade.affected_agents) {
            const debtProfile = this.state.debtNetwork.get(affectedId);
            if (debtProfile) {
                for (const connectionId of debtProfile.connections) {
                    if (!cascade.affected_agents.has(connectionId)) {
                        targets.push(connectionId);
                    }
                }
            }
        }
        
        // Add systemically important agents at risk
        for (const [agentId, debtProfile] of this.state.debtNetwork) {
            if (debtProfile.is_systemically_important && 
                debtProfile.default_probability > 0.6 && 
                !cascade.affected_agents.has(agentId)) {
                targets.push(agentId);
            }
        }
        
        return targets.slice(0, 20); // Limit propagation targets
    }

    calculateCascadeImpact(cascade, debtProfile, cascadeTemplate) {
        const baseImpact = cascade.intensity * cascadeTemplate.intensity_multiplier;
        
        // Determine if this agent defaults due to cascade
        const defaultProbability = debtProfile.default_probability + baseImpact * 0.5;
        const forceDefault = defaultProbability > 0.8 && Math.random() < 0.3;
        
        let lossAmount = new Decimal(0);
        if (forceDefault) {
            lossAmount = debtProfile.total_debt.mul(0.8 + Math.random() * 0.2); // 80-100% loss
        }
        
        return {
            force_default: forceDefault,
            loss_amount: lossAmount,
            confidence_impact: baseImpact * 0.3,
            fear_impact: baseImpact * 0.4
        };
    }

    applyCascadeImpact(agentId, impact) {
        const agent = this.crisisEngine.economicEngine.agents.get(agentId);
        if (!agent) return;
        
        // Apply financial impact
        if (agent.wealth && impact.loss_amount.gt(0)) {
            agent.wealth = agent.wealth.minus(impact.loss_amount);
        }
        
        // Apply psychological impact
        if (agent.psychology) {
            agent.psychology.fear = Math.min(1, (agent.psychology.fear || 0.5) + impact.fear_impact);
            agent.psychology.confidence = Math.max(0, (agent.psychology.confidence || 0.5) - impact.confidence_impact);
        }
        
        // Force deleveraging
        if (impact.force_default) {
            agent.leverage = Math.max(1, (agent.leverage || 1) * 0.3);
        }
    }

    triggerCreditFreeze() {
        this.state.creditFreeze = true;
        
        // Freeze credit markets
        for (const [marketId, market] of this.state.creditMarkets) {
            market.frozen = true;
            market.liquidity *= 0.1; // Severe liquidity reduction
            market.spread *= 5; // Massive spread widening
            market.new_issuance = new Decimal(0); // No new issuance
        }
        
        // Psychological impact
        this.psychologyEngine.triggerPsychologyEvent('market_crash', 0.8);
        
        logger.error('Credit freeze triggered', {
            systemicRisk: this.state.systemicRisk,
            affectedMarkets: this.state.creditMarkets.size
        });
        
        this.emit('credit_freeze_triggered', {
            timestamp: Date.now(),
            trigger_risk: this.state.systemicRisk,
            affected_markets: Array.from(this.state.creditMarkets.keys())
        });
    }

    updateActiveCascades() {
        for (const [cascadeId, cascade] of this.state.activeCascades) {
            if (cascade.is_active) {
                // Continue propagation if conditions are met
                if (cascade.propagation_rounds < 5 && cascade.intensity > 0.2) {
                    this.propagateCascade(cascade);
                } else {
                    this.resolveCascade(cascadeId, cascade);
                }
            }
        }
    }

    processCreditFreeze() {
        if (this.state.creditFreeze) {
            // Check for thaw conditions
            if (this.state.systemicRisk < 0.3 && Math.random() < 0.01) {
                this.thawCreditMarkets();
            } else {
                // Continue freeze effects
                for (const market of this.state.creditMarkets.values()) {
                    market.stress_level = Math.min(1, market.stress_level + 0.05);
                }
            }
        }
    }

    thawCreditMarkets() {
        this.state.creditFreeze = false;
        
        // Gradually restore credit markets
        for (const [marketId, market] of this.state.creditMarkets) {
            market.frozen = false;
            market.liquidity = Math.min(0.8, market.liquidity * 2); // Partial restoration
            market.spread = Math.max(market.spread * 0.5, 0.01); // Reduce spreads
        }
        
        logger.info('Credit markets thawing', {
            systemicRisk: this.state.systemicRisk
        });
        
        this.emit('credit_thaw', {
            timestamp: Date.now(),
            systemic_risk: this.state.systemicRisk
        });
    }

    resolveCascade(cascadeId, cascade) {
        cascade.endTime = Date.now();
        cascade.total_duration = cascade.endTime - cascade.startTime;
        cascade.is_active = false;
        
        // Record in history
        this.state.cascadeHistory.push({
            ...cascade,
            affected_agents: cascade.affected_agents.size,
            affected_markets: cascade.affected_markets.size,
            total_losses: cascade.total_losses.toString()
        });
        
        this.state.activeCascades.delete(cascadeId);
        
        logger.info('Debt cascade resolved', {
            type: cascade.type,
            duration: cascade.total_duration,
            affectedAgents: cascade.affected_agents.size,
            totalLosses: cascade.total_losses.toString()
        });
        
        this.emit('debt_cascade_resolved', cascade);
    }

    // Public API
    getDebtCascadeStatus() {
        return {
            activeCascades: Array.from(this.state.activeCascades.values()),
            systemicRisk: this.state.systemicRisk,
            creditFreeze: this.state.creditFreeze,
            creditMarkets: Object.fromEntries(this.state.creditMarkets),
            leverageDistribution: this.state.leverageDistribution,
            recentDefaults: this.state.defaultEvents.slice(-10),
            cascadeHistory: this.state.cascadeHistory.slice(-5)
        };
    }

    getNetworkRiskAnalysis() {
        const analysis = {
            total_nodes: this.state.debtNetwork.size,
            systemic_agents: 0,
            high_leverage_agents: 0,
            high_default_risk_agents: 0,
            total_debt: new Decimal(0),
            average_leverage: 0,
            network_density: 0,
            risk_concentration: {}
        };
        
        let totalLeverage = 0;
        let totalConnections = 0;
        
        for (const [agentId, debtProfile] of this.state.debtNetwork) {
            if (debtProfile.is_systemically_important) analysis.systemic_agents++;
            if (debtProfile.leverage_ratio > 3.0) analysis.high_leverage_agents++;
            if (debtProfile.default_probability > 0.5) analysis.high_default_risk_agents++;
            
            analysis.total_debt = analysis.total_debt.plus(debtProfile.total_debt);
            totalLeverage += debtProfile.leverage_ratio;
            totalConnections += debtProfile.connections.size;
        }
        
        if (this.state.debtNetwork.size > 0) {
            analysis.average_leverage = totalLeverage / this.state.debtNetwork.size;
            analysis.network_density = totalConnections / (this.state.debtNetwork.size * (this.state.debtNetwork.size - 1));
        }
        
        // Risk concentration by credit rating
        const ratingCounts = {};
        for (const debtProfile of this.state.debtNetwork.values()) {
            ratingCounts[debtProfile.credit_rating] = (ratingCounts[debtProfile.credit_rating] || 0) + 1;
        }
        analysis.risk_concentration = ratingCounts;
        
        return analysis;
    }

    getCreditMarketReport() {
        const report = [];
        
        for (const [marketId, market] of this.state.creditMarkets) {
            report.push({
                id: marketId,
                name: market.name,
                size: market.size.toString(),
                outstanding_debt: market.outstanding_debt.toString(),
                default_rate: market.default_rate,
                spread: market.spread,
                liquidity: market.liquidity,
                stress_level: market.stress_level,
                frozen: market.frozen,
                health_score: (1 - market.stress_level) * market.liquidity,
                risk_level: market.stress_level > 0.7 ? 'high' : market.stress_level > 0.4 ? 'medium' : 'low'
            });
        }
        
        return report.sort((a, b) => b.stress_level - a.stress_level);
    }

    // Manual triggers for testing
    forceDebtCascade(cascadeType = 'corporate_cascade', intensity = 0.8) {
        const cascade = {
            id: uuidv4(),
            type: cascadeType,
            name: this.cascadeTypes[cascadeType].name,
            startTime: Date.now(),
            intensity: intensity,
            affected_agents: new Set(),
            affected_markets: new Set(),
            total_losses: new Decimal(0),
            propagation_rounds: 0,
            is_active: true
        };
        
        this.state.activeCascades.set(cascade.id, cascade);
        this.propagateCascade(cascade);
        
        return cascade.id;
    }

    forceCreditFreeze() {
        if (!this.state.creditFreeze) {
            this.triggerCreditFreeze();
            return true;
        }
        return false;
    }

    forceAgentDefault(agentId) {
        const debtProfile = this.state.debtNetwork.get(agentId);
        if (debtProfile) {
            this.triggerDefaultEvent(agentId, debtProfile, this.crisisEngine.economicEngine.agents);
            return true;
        }
        return false;
    }
}

module.exports = DebtCascadeEngine;
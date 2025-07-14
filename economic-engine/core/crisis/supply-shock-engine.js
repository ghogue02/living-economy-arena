/**
 * Supply Chain Disruption and Shortage Engine
 * Simulates supply shocks, resource scarcity, and hoarding behaviors
 */

const EventEmitter = require('eventemitter3');
const Decimal = require('decimal.js');
const { v4: uuidv4 } = require('uuid');
const logger = require('pino')();

class SupplyShockEngine extends EventEmitter {
    constructor(crisisEngine, psychologyEngine, config = {}) {
        super();
        
        this.crisisEngine = crisisEngine;
        this.psychologyEngine = psychologyEngine;
        
        this.config = {
            scarcityThreshold: config.scarcityThreshold || 0.7,
            hoardingTrigger: config.hoardingTrigger || 0.6,
            supplyChainVulnerability: config.supplyChainVulnerability || 0.3,
            recoveryRate: config.recoveryRate || 0.02,
            cascadeThreshold: config.cascadeThreshold || 0.8,
            substitutionFactor: config.substitutionFactor || 0.4,
            ...config
        };

        this.state = {
            activeShocks: new Map(),
            supplyChains: new Map(),
            resourceScarcity: new Map(),
            hoardingBehavior: new Map(),
            substitutionPatterns: new Map(),
            productionDisruptions: new Map(),
            shockHistory: []
        };

        this.shockTypes = {
            resource_shortage: {
                name: 'Critical Resource Shortage',
                intensity_range: [0.4, 0.8],
                duration_range: [20, 80],
                cascade_probability: 0.6,
                recovery_difficulty: 0.7
            },
            production_halt: {
                name: 'Production Facility Shutdown',
                intensity_range: [0.6, 1.0],
                duration_range: [10, 40],
                cascade_probability: 0.4,
                recovery_difficulty: 0.5
            },
            logistics_disruption: {
                name: 'Transportation/Logistics Crisis',
                intensity_range: [0.3, 0.7],
                duration_range: [5, 25],
                cascade_probability: 0.8,
                recovery_difficulty: 0.4
            },
            trade_embargo: {
                name: 'Trade Embargo/Sanctions',
                intensity_range: [0.5, 0.9],
                duration_range: [30, 120],
                cascade_probability: 0.7,
                recovery_difficulty: 0.9
            },
            natural_disaster: {
                name: 'Natural Disaster Impact',
                intensity_range: [0.7, 1.0],
                duration_range: [15, 60],
                cascade_probability: 0.5,
                recovery_difficulty: 0.8
            }
        };

        this.initializeSupplyChains();
        
        logger.info('Supply Shock Engine initialized');
    }

    initializeSupplyChains() {
        // Define interdependent supply chains
        const chains = [
            {
                id: 'food_supply',
                name: 'Food Supply Chain',
                inputs: ['energy', 'materials', 'labor'],
                outputs: ['food'],
                vulnerability: 0.4,
                criticality: 0.9,
                substitutability: 0.3
            },
            {
                id: 'energy_supply',
                name: 'Energy Supply Chain',
                inputs: ['materials', 'technology'],
                outputs: ['energy'],
                vulnerability: 0.6,
                criticality: 1.0,
                substitutability: 0.5
            },
            {
                id: 'manufacturing',
                name: 'Manufacturing Chain',
                inputs: ['materials', 'energy', 'technology'],
                outputs: ['technology', 'materials'],
                vulnerability: 0.5,
                criticality: 0.7,
                substitutability: 0.6
            },
            {
                id: 'services_chain',
                name: 'Services Supply Chain',
                inputs: ['technology', 'energy'],
                outputs: ['services'],
                vulnerability: 0.3,
                criticality: 0.6,
                substitutability: 0.8
            }
        ];

        chains.forEach(chain => {
            this.state.supplyChains.set(chain.id, {
                ...chain,
                current_efficiency: 1.0,
                disruption_level: 0,
                backup_capacity: 0.2,
                dependencies: new Map(),
                dependent_chains: new Set(),
                last_shock: 0
            });
        });

        // Establish supply chain dependencies
        this.establishSupplyDependencies();
    }

    establishSupplyDependencies() {
        for (const [chainId, chain] of this.state.supplyChains) {
            for (const input of chain.inputs) {
                // Find chains that produce this input
                for (const [otherChainId, otherChain] of this.state.supplyChains) {
                    if (otherChain.outputs.includes(input)) {
                        chain.dependencies.set(input, otherChainId);
                        otherChain.dependent_chains.add(chainId);
                    }
                }
            }
        }
    }

    // Main tick processing
    tick(marketData, agents) {
        this.updateSupplyChainStates(marketData);
        this.calculateResourceScarcity(marketData);
        this.updateHoardingBehavior(agents, marketData);
        this.processProductionDisruptions();
        this.evaluateSupplyShockTriggers(marketData, agents);
        this.updateActiveShocks(marketData, agents);
        this.processSupplyChainCascades();
        
        return this.getSupplyShockStatus();
    }

    updateSupplyChainStates(marketData) {
        for (const [chainId, chain] of this.state.supplyChains) {
            // Calculate efficiency based on input availability
            let efficiency = 1.0;
            
            for (const [input, sourceChainId] of chain.dependencies) {
                const sourceChain = this.state.supplyChains.get(sourceChainId);
                const market = this.findMarketByResource(input, marketData);
                
                if (sourceChain) {
                    efficiency *= sourceChain.current_efficiency;
                }
                
                if (market) {
                    const supplyRatio = market.supply.div(market.demand).toNumber();
                    efficiency *= Math.min(1, supplyRatio + 0.2); // Some buffer
                }
            }
            
            // Apply disruption effects
            efficiency *= (1 - chain.disruption_level);
            
            // Natural recovery
            if (chain.current_efficiency < efficiency) {
                chain.current_efficiency = Math.min(efficiency, chain.current_efficiency + this.config.recoveryRate);
            } else {
                chain.current_efficiency = efficiency;
            }
            
            // Update market effects
            this.applySupplyChainEffects(chain, marketData);
        }
    }

    findMarketByResource(resource, marketData) {
        for (const [marketId, market] of marketData) {
            if (marketId === resource || market.name?.toLowerCase().includes(resource.toLowerCase())) {
                return market;
            }
        }
        return null;
    }

    applySupplyChainEffects(chain, marketData) {
        for (const output of chain.outputs) {
            const market = this.findMarketByResource(output, marketData);
            if (market) {
                // Efficiency affects supply
                const expectedSupply = market.supply.mul(chain.current_efficiency);
                market.supply = market.supply.mul(0.9).plus(expectedSupply.mul(0.1)); // Gradual adjustment
                
                // Efficiency affects scarcity
                market.scarcity = Math.max(0, Math.min(1, market.scarcity + (1 - chain.current_efficiency) * 0.1));
            }
        }
    }

    calculateResourceScarcity(marketData) {
        for (const [marketId, market] of marketData) {
            let scarcity = this.state.resourceScarcity.get(marketId) || {
                current_level: market.scarcity || 0.3,
                trend: 0,
                causes: [],
                severity: 'normal'
            };
            
            // Calculate scarcity based on supply/demand
            const supplyDemandRatio = market.supply.div(market.demand).toNumber();
            const targetScarcity = Math.max(0, Math.min(1, 1.5 - supplyDemandRatio));
            
            // Update trend
            scarcity.trend = targetScarcity - scarcity.current_level;
            
            // Gradual adjustment
            scarcity.current_level = scarcity.current_level * 0.9 + targetScarcity * 0.1;
            
            // Identify causes
            scarcity.causes = [];
            if (supplyDemandRatio < 0.8) scarcity.causes.push('high_demand');
            if (supplyDemandRatio < 0.6) scarcity.causes.push('supply_shortage');
            if (market.volatility > 0.7) scarcity.causes.push('market_instability');
            
            // Determine severity
            if (scarcity.current_level > 0.8) scarcity.severity = 'critical';
            else if (scarcity.current_level > 0.6) scarcity.severity = 'high';
            else if (scarcity.current_level > 0.4) scarcity.severity = 'moderate';
            else scarcity.severity = 'normal';
            
            this.state.resourceScarcity.set(marketId, scarcity);
            
            // Update market scarcity
            market.scarcity = scarcity.current_level;
        }
    }

    updateHoardingBehavior(agents, marketData) {
        for (const [marketId, market] of marketData) {
            let hoardingBehavior = this.state.hoardingBehavior.get(marketId) || {
                hoarding_agents: new Set(),
                total_hoarded: new Decimal(0),
                hoarding_intensity: 0,
                price_impact: 0,
                triggers: []
            };
            
            // Reset counters
            hoardingBehavior.hoarding_agents.clear();
            hoardingBehavior.total_hoarded = new Decimal(0);
            hoardingBehavior.triggers = [];
            
            const scarcity = this.state.resourceScarcity.get(marketId);
            if (!scarcity) continue;
            
            // Check for hoarding triggers
            if (scarcity.current_level > this.config.hoardingTrigger) {
                hoardingBehavior.triggers.push('scarcity_fear');
            }
            
            const psychologyState = this.psychologyEngine.getPsychologyState();
            if (psychologyState.fearIndex > 0.6) {
                hoardingBehavior.triggers.push('general_panic');
            }
            
            if (market.volatility > 0.6) {
                hoardingBehavior.triggers.push('price_volatility');
            }
            
            // Calculate hoarding behavior among agents
            if (hoardingBehavior.triggers.length > 0) {
                for (const [agentId, agent] of agents) {
                    if (!agent.isActive) continue;
                    
                    const hoardingProbability = this.calculateAgentHoardingProbability(
                        agent, market, scarcity, hoardingBehavior.triggers
                    );
                    
                    if (hoardingProbability > 0.5 && Math.random() < 0.2) {
                        const hoardAmount = this.calculateHoardAmount(agent, market, hoardingProbability);
                        
                        hoardingBehavior.hoarding_agents.add(agentId);
                        hoardingBehavior.total_hoarded = hoardingBehavior.total_hoarded.plus(hoardAmount);
                        
                        // Remove from market supply
                        market.supply = market.supply.minus(hoardAmount.mul(0.1)); // Gradual impact
                        market.demand = market.demand.plus(hoardAmount.mul(0.2)); // Increased demand
                    }
                }
            }
            
            // Calculate hoarding intensity
            const totalAgents = agents.size;
            hoardingBehavior.hoarding_intensity = totalAgents > 0 ? 
                hoardingBehavior.hoarding_agents.size / totalAgents : 0;
            
            // Calculate price impact
            const hoardedRatio = hoardingBehavior.total_hoarded.div(market.supply.plus(1)).toNumber();
            hoardingBehavior.price_impact = Math.min(0.5, hoardedRatio * 2);
            
            // Apply price effects
            if (hoardingBehavior.price_impact > 0.1) {
                const priceIncrease = 1 + hoardingBehavior.price_impact;
                market.currentPrice = market.currentPrice.mul(priceIncrease);
            }
            
            this.state.hoardingBehavior.set(marketId, hoardingBehavior);
        }
    }

    calculateAgentHoardingProbability(agent, market, scarcity, triggers) {
        const psychology = agent.psychology || {};
        let probability = 0;
        
        // Base probability from scarcity
        probability += scarcity.current_level * 0.4;
        
        // Fear increases hoarding
        probability += (psychology.fear || 0.5) * 0.3;
        
        // Risk aversion increases hoarding
        const riskAversion = 1 - (psychology.risk_tolerance || 50) / 100;
        probability += riskAversion * 0.2;
        
        // Memory of past shortages
        if (psychology.memory_retention > 70) {
            probability += 0.1;
        }
        
        // Wealth affects ability to hoard
        if (agent.wealth && agent.wealth.gt(10000)) {
            probability += 0.1;
        }
        
        // Trigger-specific adjustments
        triggers.forEach(trigger => {
            switch (trigger) {
                case 'scarcity_fear':
                    probability += 0.2;
                    break;
                case 'general_panic':
                    probability += (psychology.panic_susceptibility || 50) / 100 * 0.3;
                    break;
                case 'price_volatility':
                    probability += 0.1;
                    break;
            }
        });
        
        return Math.min(1, probability);
    }

    calculateHoardAmount(agent, market, hoardingProbability) {
        const baseAmount = agent.wealth ? agent.wealth.mul(0.1) : new Decimal(1000);
        const scarcityMultiplier = 1 + hoardingProbability;
        const marketShare = market.supply.gt(0) ? baseAmount.div(market.supply) : new Decimal(0.001);
        
        return baseAmount.mul(scarcityMultiplier).mul(Math.min(0.1, marketShare.toNumber()));
    }

    processProductionDisruptions() {
        for (const [chainId, chain] of this.state.supplyChains) {
            let disruption = this.state.productionDisruptions.get(chainId) || {
                active_disruptions: [],
                total_impact: 0,
                recovery_progress: 0,
                estimated_recovery_time: 0
            };
            
            // Process active disruptions
            disruption.active_disruptions = disruption.active_disruptions.filter(disrupt => {
                disrupt.duration--;
                disrupt.intensity *= 0.98; // Natural decay
                
                return disrupt.duration > 0 && disrupt.intensity > 0.1;
            });
            
            // Calculate total impact
            disruption.total_impact = disruption.active_disruptions
                .reduce((sum, disrupt) => sum + disrupt.intensity, 0);
            disruption.total_impact = Math.min(1, disruption.total_impact);
            
            // Update chain disruption level
            chain.disruption_level = disruption.total_impact;
            
            this.state.productionDisruptions.set(chainId, disruption);
        }
    }

    evaluateSupplyShockTriggers(marketData, agents) {
        // External shock triggers
        this.evaluateExternalShockTriggers();
        
        // Market-driven triggers
        for (const [marketId, market] of marketData) {
            const scarcity = this.state.resourceScarcity.get(marketId);
            if (!scarcity) continue;
            
            const triggerProbability = this.calculateShockTriggerProbability(market, scarcity);
            
            if (triggerProbability > 0.8 && Math.random() < 0.005) {
                this.triggerSupplyShock(marketId, market, scarcity);
            }
        }
    }

    evaluateExternalShockTriggers() {
        // Random external events
        if (Math.random() < 0.0001) { // 0.01% chance per tick
            this.triggerRandomExternalShock();
        }
        
        // Geopolitical events (simplified)
        const psychologyState = this.psychologyEngine.getPsychologyState();
        if (psychologyState.fearIndex > 0.8 && Math.random() < 0.001) {
            this.triggerGeopoliticalShock();
        }
    }

    calculateShockTriggerProbability(market, scarcity) {
        let probability = 0;
        
        // High scarcity increases probability
        probability += scarcity.current_level * 0.4;
        
        // Rapid scarcity increase
        if (scarcity.trend > 0.1) probability += 0.3;
        
        // Market volatility
        probability += market.volatility * 0.2;
        
        // Supply/demand imbalance
        const supplyRatio = market.supply.div(market.demand).toNumber();
        if (supplyRatio < 0.5) probability += 0.4;
        
        return Math.min(1, probability);
    }

    triggerSupplyShock(marketId, market, scarcity) {
        const shockType = this.selectShockType(market, scarcity);
        const shockTemplate = this.shockTypes[shockType];
        
        const shock = {
            id: uuidv4(),
            type: shockType,
            name: shockTemplate.name,
            affected_market: marketId,
            affected_market_name: market.name,
            startTime: Date.now(),
            intensity: this.randomInRange(shockTemplate.intensity_range),
            duration: Math.floor(this.randomInRange(shockTemplate.duration_range)),
            cascade_probability: shockTemplate.cascade_probability,
            recovery_difficulty: shockTemplate.recovery_difficulty,
            
            // Impact tracking
            supply_reduction: 0,
            price_increase: 0,
            hoarding_increase: 0,
            affected_agents: new Set(),
            cascade_events: [],
            
            // State
            phase: 'initial', // initial, escalation, peak, recovery
            ticks_active: 0
        };
        
        this.state.activeShocks.set(shock.id, shock);
        
        // Apply immediate effects
        this.applyShockEffects(shock, market);
        
        // Trigger production disruption
        this.triggerProductionDisruption(marketId, shock);
        
        // Psychological impact
        this.psychologyEngine.triggerPsychologyEvent('uncertainty', shock.intensity);
        
        logger.warn('Supply shock triggered', {
            type: shockType,
            market: marketId,
            intensity: shock.intensity,
            duration: shock.duration
        });
        
        this.emit('supply_shock_triggered', shock);
    }

    selectShockType(market, scarcity) {
        const types = Object.keys(this.shockTypes);
        
        // Market-specific logic
        if (market.id === 'energy') {
            return Math.random() < 0.4 ? 'resource_shortage' : 'production_halt';
        }
        
        if (market.id === 'food') {
            return Math.random() < 0.3 ? 'natural_disaster' : 'logistics_disruption';
        }
        
        if (scarcity.severity === 'critical') {
            return 'resource_shortage';
        }
        
        return types[Math.floor(Math.random() * types.length)];
    }

    randomInRange(range) {
        return range[0] + Math.random() * (range[1] - range[0]);
    }

    applyShockEffects(shock, market) {
        const intensity = shock.intensity;
        
        // Supply reduction
        const supplyReduction = intensity * 0.3;
        market.supply = market.supply.mul(1 - supplyReduction);
        shock.supply_reduction = supplyReduction;
        
        // Price increase
        const priceIncrease = 1 + (intensity * 0.4);
        market.currentPrice = market.currentPrice.mul(priceIncrease);
        shock.price_increase = priceIncrease - 1;
        
        // Volatility increase
        market.volatility = Math.min(1, market.volatility + intensity * 0.3);
        
        // Scarcity increase
        market.scarcity = Math.min(1, market.scarcity + intensity * 0.4);
    }

    triggerProductionDisruption(marketId, shock) {
        // Find affected supply chains
        for (const [chainId, chain] of this.state.supplyChains) {
            if (chain.outputs.includes(marketId) || 
                chain.inputs.includes(marketId)) {
                
                const disruption = {
                    shock_id: shock.id,
                    intensity: shock.intensity * (chain.vulnerability + 0.2),
                    duration: shock.duration,
                    type: shock.type
                };
                
                let chainDisruption = this.state.productionDisruptions.get(chainId) || {
                    active_disruptions: [],
                    total_impact: 0,
                    recovery_progress: 0,
                    estimated_recovery_time: 0
                };
                
                chainDisruption.active_disruptions.push(disruption);
                this.state.productionDisruptions.set(chainId, chainDisruption);
            }
        }
    }

    triggerRandomExternalShock() {
        const marketIds = Array.from(this.crisisEngine.economicEngine.markets.keys());
        const randomMarket = marketIds[Math.floor(Math.random() * marketIds.length)];
        const market = this.crisisEngine.economicEngine.markets.get(randomMarket);
        
        if (market) {
            const scarcity = this.state.resourceScarcity.get(randomMarket) || { current_level: 0.3 };
            this.triggerSupplyShock(randomMarket, market, scarcity);
        }
    }

    triggerGeopoliticalShock() {
        // Simulate trade embargo or sanctions
        const shockType = 'trade_embargo';
        const marketIds = ['energy', 'materials', 'technology']; // Strategic resources
        
        for (const marketId of marketIds) {
            const market = this.crisisEngine.economicEngine.markets.get(marketId);
            if (market) {
                const scarcity = this.state.resourceScarcity.get(marketId) || { current_level: 0.3 };
                this.triggerSupplyShock(marketId, market, scarcity);
            }
        }
    }

    updateActiveShocks(marketData, agents) {
        for (const [shockId, shock] of this.state.activeShocks) {
            shock.ticks_active++;
            
            // Update shock phase
            this.updateShockPhase(shock);
            
            // Apply ongoing effects
            const market = marketData.get(shock.affected_market);
            if (market) {
                this.applyOngoingShockEffects(shock, market, agents);
            }
            
            // Check for resolution
            if (this.shouldResolveShock(shock)) {
                this.resolveShock(shockId, shock);
            }
        }
    }

    updateShockPhase(shock) {
        const progress = shock.ticks_active / shock.duration;
        
        if (progress < 0.1) {
            shock.phase = 'initial';
        } else if (progress < 0.4) {
            shock.phase = 'escalation';
            shock.intensity = Math.min(1, shock.intensity * 1.02);
        } else if (progress < 0.7) {
            shock.phase = 'peak';
        } else {
            shock.phase = 'recovery';
            shock.intensity *= 0.98;
        }
    }

    applyOngoingShockEffects(shock, market, agents) {
        const phaseMultipliers = {
            initial: 0.8,
            escalation: 1.2,
            peak: 1.0,
            recovery: 0.6
        };
        
        const effectMultiplier = phaseMultipliers[shock.phase] * shock.intensity;
        
        // Continued supply pressure
        if (effectMultiplier > 0.3) {
            market.supply = market.supply.mul(1 - effectMultiplier * 0.01);
        }
        
        // Hoarding reinforcement
        const hoardingBehavior = this.state.hoardingBehavior.get(shock.affected_market);
        if (hoardingBehavior) {
            shock.hoarding_increase = hoardingBehavior.hoarding_intensity;
        }
        
        // Agent impact tracking
        for (const [agentId, agent] of agents) {
            if (!agent.isActive) continue;
            
            // Agents affected by resource shortage
            if (this.isAgentAffectedByShock(agent, shock)) {
                shock.affected_agents.add(agentId);
                
                // Psychological impact
                const psychology = agent.psychology || {};
                psychology.fear = Math.min(1, (psychology.fear || 0.5) + effectMultiplier * 0.05);
                psychology.confidence = Math.max(0, (psychology.confidence || 0.5) - effectMultiplier * 0.03);
            }
        }
    }

    isAgentAffectedByShock(agent, shock) {
        // Simplified - check if agent needs the affected resource
        const psychology = agent.psychology || {};
        const needsResource = Math.random() < 0.3; // 30% chance agent needs any given resource
        
        return needsResource || (psychology.fear > 0.6);
    }

    processSupplyChainCascades() {
        for (const [shockId, shock] of this.state.activeShocks) {
            if (shock.intensity > this.config.cascadeThreshold && Math.random() < shock.cascade_probability * 0.1) {
                this.triggerSupplyChainCascade(shock);
            }
        }
    }

    triggerSupplyChainCascade(originShock) {
        const affectedChains = this.findCascadeTargets(originShock);
        
        for (const chainId of affectedChains) {
            const chain = this.state.supplyChains.get(chainId);
            if (!chain) continue;
            
            // Find markets for this chain's outputs
            for (const output of chain.outputs) {
                const market = this.findMarketByResource(output, this.crisisEngine.economicEngine.markets);
                if (market && !this.isMarketAlreadyShocked(output)) {
                    const cascadeIntensity = originShock.intensity * 0.6;
                    const scarcity = this.state.resourceScarcity.get(output) || { current_level: 0.3 };
                    
                    // Create cascade shock
                    const cascadeShock = this.createCascadeShock(originShock, output, market, cascadeIntensity);
                    this.state.activeShocks.set(cascadeShock.id, cascadeShock);
                    
                    // Record cascade relationship
                    originShock.cascade_events.push({
                        target_market: output,
                        cascade_shock_id: cascadeShock.id,
                        intensity: cascadeIntensity,
                        timestamp: Date.now()
                    });
                    
                    logger.warn('Supply chain cascade triggered', {
                        origin: originShock.affected_market,
                        target: output,
                        intensity: cascadeIntensity
                    });
                }
            }
        }
    }

    findCascadeTargets(shock) {
        const targets = [];
        
        // Find chains that depend on the shocked resource
        for (const [chainId, chain] of this.state.supplyChains) {
            if (chain.inputs.includes(shock.affected_market)) {
                targets.push(chainId);
                
                // Also consider chains dependent on this one
                for (const dependentChain of chain.dependent_chains) {
                    targets.push(dependentChain);
                }
            }
        }
        
        return [...new Set(targets)]; // Remove duplicates
    }

    isMarketAlreadyShocked(marketId) {
        for (const shock of this.state.activeShocks.values()) {
            if (shock.affected_market === marketId) {
                return true;
            }
        }
        return false;
    }

    createCascadeShock(originShock, marketId, market, intensity) {
        return {
            id: uuidv4(),
            type: 'cascade_' + originShock.type,
            name: `Cascade ${originShock.name}`,
            affected_market: marketId,
            affected_market_name: market.name,
            startTime: Date.now(),
            intensity: intensity,
            duration: Math.floor(originShock.duration * 0.7),
            cascade_probability: 0.3, // Lower probability for secondary cascades
            recovery_difficulty: originShock.recovery_difficulty * 0.8,
            
            // Cascade specific
            origin_shock_id: originShock.id,
            cascade_level: (originShock.cascade_level || 0) + 1,
            
            // Tracking
            supply_reduction: 0,
            price_increase: 0,
            hoarding_increase: 0,
            affected_agents: new Set(),
            cascade_events: [],
            
            phase: 'initial',
            ticks_active: 0
        };
    }

    shouldResolveShock(shock) {
        return (
            shock.ticks_active >= shock.duration ||
            shock.intensity < 0.1 ||
            (shock.phase === 'recovery' && shock.intensity < 0.3)
        );
    }

    resolveShock(shockId, shock) {
        shock.endTime = Date.now();
        shock.total_duration = shock.endTime - shock.startTime;
        
        // Determine resolution outcome
        if (shock.intensity < 0.3) {
            shock.resolution = 'natural_recovery';
        } else if (shock.ticks_active >= shock.duration) {
            shock.resolution = 'time_exhaustion';
        } else {
            shock.resolution = 'intervention_recovery';
        }
        
        // Apply recovery effects
        this.applyShockRecovery(shock);
        
        // Record in history
        this.state.shockHistory.push({
            ...shock,
            affected_agents: shock.affected_agents.size,
            cascade_count: shock.cascade_events.length
        });
        
        this.state.activeShocks.delete(shockId);
        
        logger.info('Supply shock resolved', {
            type: shock.type,
            market: shock.affected_market,
            resolution: shock.resolution,
            duration: shock.total_duration,
            affectedAgents: shock.affected_agents.size
        });
        
        this.emit('supply_shock_resolved', shock);
    }

    applyShockRecovery(shock) {
        const market = this.crisisEngine.economicEngine.markets.get(shock.affected_market);
        if (!market) return;
        
        // Gradual supply recovery
        const recoveryRate = this.config.recoveryRate * (1 - shock.recovery_difficulty);
        market.supply = market.supply.mul(1 + recoveryRate);
        
        // Scarcity reduction
        market.scarcity = Math.max(0, market.scarcity - recoveryRate * 2);
        
        // Volatility reduction
        market.volatility = Math.max(0.05, market.volatility - 0.1);
    }

    // Public API
    getSupplyShockStatus() {
        return {
            activeShocks: Array.from(this.state.activeShocks.values()),
            supplyChainHealth: this.getSupplyChainHealth(),
            resourceScarcity: Object.fromEntries(this.state.resourceScarcity),
            hoardingBehavior: Object.fromEntries(this.state.hoardingBehavior),
            productionDisruptions: Object.fromEntries(this.state.productionDisruptions),
            recentHistory: this.state.shockHistory.slice(-10)
        };
    }

    getSupplyChainHealth() {
        const health = [];
        
        for (const [chainId, chain] of this.state.supplyChains) {
            health.push({
                id: chainId,
                name: chain.name,
                efficiency: chain.current_efficiency,
                disruption_level: chain.disruption_level,
                criticality: chain.criticality,
                vulnerability: chain.vulnerability,
                health_score: chain.current_efficiency * (1 - chain.disruption_level),
                status: this.getChainStatus(chain)
            });
        }
        
        return health.sort((a, b) => b.criticality - a.criticality);
    }

    getChainStatus(chain) {
        const healthScore = chain.current_efficiency * (1 - chain.disruption_level);
        
        if (healthScore > 0.8) return 'healthy';
        if (healthScore > 0.6) return 'stressed';
        if (healthScore > 0.4) return 'disrupted';
        return 'critical';
    }

    getScarcityReport() {
        const report = [];
        
        for (const [marketId, scarcity] of this.state.resourceScarcity) {
            if (scarcity.current_level > 0.4) {
                report.push({
                    resource: marketId,
                    scarcity_level: scarcity.current_level,
                    severity: scarcity.severity,
                    trend: scarcity.trend,
                    causes: scarcity.causes,
                    risk_level: scarcity.current_level > 0.7 ? 'high' : 'medium'
                });
            }
        }
        
        return report.sort((a, b) => b.scarcity_level - a.scarcity_level);
    }

    // Manual triggers for testing
    forceSupplyShock(marketId, shockType = 'resource_shortage', intensity = 0.7) {
        const market = this.crisisEngine.economicEngine.markets.get(marketId);
        if (market) {
            const scarcity = this.state.resourceScarcity.get(marketId) || { current_level: intensity };
            this.triggerSupplyShock(marketId, market, scarcity);
            return true;
        }
        return false;
    }

    forceHoardingBehavior(marketId, intensity = 0.8) {
        const hoardingBehavior = this.state.hoardingBehavior.get(marketId) || {
            hoarding_agents: new Set(),
            total_hoarded: new Decimal(0),
            hoarding_intensity: 0,
            price_impact: 0,
            triggers: ['forced_test']
        };
        
        hoardingBehavior.hoarding_intensity = intensity;
        hoardingBehavior.triggers = ['forced_test'];
        this.state.hoardingBehavior.set(marketId, hoardingBehavior);
        
        return true;
    }
}

module.exports = SupplyShockEngine;
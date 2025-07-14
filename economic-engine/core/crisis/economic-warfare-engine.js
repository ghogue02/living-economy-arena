/**
 * Economic Warfare and Faction Conflict Engine
 * Simulates trade wars, economic sanctions, market manipulation, and faction-based economic combat
 */

const EventEmitter = require('eventemitter3');
const Decimal = require('decimal.js');
const { v4: uuidv4 } = require('uuid');
const logger = require('pino')();

class EconomicWarfareEngine extends EventEmitter {
    constructor(crisisEngine, psychologyEngine, config = {}) {
        super();
        
        this.crisisEngine = crisisEngine;
        this.psychologyEngine = psychologyEngine;
        
        this.config = {
            warThreshold: config.warThreshold || 0.7,
            sanctionEffectiveness: config.sanctionEffectiveness || 0.6,
            manipulationDetectionRate: config.manipulationDetectionRate || 0.3,
            retalliationProbability: config.retalliationProbability || 0.8,
            economicDamageMultiplier: config.economicDamageMultiplier || 1.5,
            ...config
        };

        this.state = {
            factions: new Map(),
            activeWars: new Map(),
            tradeTensions: new Map(),
            sanctions: new Map(),
            manipulationAttempts: new Map(),
            economicEspionage: new Map(),
            warfareHistory: []
        };

        this.warfareTypes = {
            trade_war: {
                name: 'Trade War',
                weapons: ['tariffs', 'quotas', 'dumping', 'subsidies'],
                escalation_speed: 0.6,
                economic_damage: 0.4,
                duration_range: [30, 120]
            },
            currency_war: {
                name: 'Currency War',
                weapons: ['devaluation', 'intervention', 'controls'],
                escalation_speed: 0.8,
                economic_damage: 0.5,
                duration_range: [20, 80]
            },
            sanctions_campaign: {
                name: 'Economic Sanctions',
                weapons: ['asset_freeze', 'trade_embargo', 'financial_blockade'],
                escalation_speed: 0.4,
                economic_damage: 0.7,
                duration_range: [60, 200]
            },
            market_manipulation: {
                name: 'Market Manipulation War',
                weapons: ['price_fixing', 'cornering', 'spoofing', 'pump_dump'],
                escalation_speed: 1.0,
                economic_damage: 0.3,
                duration_range: [10, 40]
            },
            resource_warfare: {
                name: 'Resource Economic Warfare',
                weapons: ['supply_cutoff', 'stockpiling', 'cartel_formation'],
                escalation_speed: 0.5,
                economic_damage: 0.8,
                duration_range: [40, 150]
            }
        };

        this.initializeFactions();
        
        logger.info('Economic Warfare Engine initialized');
    }

    initializeFactions() {
        // Create player factions with different economic strategies
        const factions = [
            {
                id: 'corporate_alliance',
                name: 'Corporate Alliance',
                type: 'corporate',
                economic_focus: 'profit_maximization',
                aggression_level: 0.6,
                resources: new Decimal(1000000000),
                influence: 0.7
            },
            {
                id: 'sovereign_union',
                name: 'Sovereign States Union',
                type: 'governmental',
                economic_focus: 'stability',
                aggression_level: 0.4,
                resources: new Decimal(2000000000),
                influence: 0.8
            },
            {
                id: 'trading_guild',
                name: 'Independent Trading Guild',
                type: 'merchant',
                economic_focus: 'trade_dominance',
                aggression_level: 0.7,
                resources: new Decimal(500000000),
                influence: 0.5
            },
            {
                id: 'tech_syndicate',
                name: 'Technology Syndicate',
                type: 'innovation',
                economic_focus: 'technological_supremacy',
                aggression_level: 0.5,
                resources: new Decimal(800000000),
                influence: 0.6
            }
        ];

        factions.forEach(faction => {
            this.state.factions.set(faction.id, {
                ...faction,
                controlled_agents: new Set(),
                controlled_markets: new Set(),
                active_strategies: new Map(),
                warfare_capabilities: this.calculateWarfareCapabilities(faction),
                relationships: new Map(),
                reputation: 0.5,
                war_exhaustion: 0,
                economic_health: 1.0
            });
        });

        // Initialize faction relationships
        this.initializeFactionRelationships();
    }

    calculateWarfareCapabilities(faction) {
        const capabilities = {
            trade_disruption: 0.5,
            market_manipulation: 0.3,
            resource_control: 0.4,
            financial_warfare: 0.6,
            information_warfare: 0.3
        };

        // Adjust based on faction type
        switch (faction.type) {
            case 'corporate':
                capabilities.market_manipulation += 0.3;
                capabilities.financial_warfare += 0.2;
                break;
            case 'governmental':
                capabilities.trade_disruption += 0.4;
                capabilities.resource_control += 0.3;
                break;
            case 'merchant':
                capabilities.trade_disruption += 0.4;
                capabilities.resource_control += 0.2;
                break;
            case 'innovation':
                capabilities.information_warfare += 0.4;
                capabilities.market_manipulation += 0.2;
                break;
        }

        // Scale by resources and influence
        const resourceMultiplier = Math.min(2, Math.log10(faction.resources.toNumber()) / 8);
        const influenceMultiplier = faction.influence;

        for (const [capability, value] of Object.entries(capabilities)) {
            capabilities[capability] = Math.min(1, value * resourceMultiplier * influenceMultiplier);
        }

        return capabilities;
    }

    initializeFactionRelationships() {
        const factionIds = Array.from(this.state.factions.keys());
        
        for (const factionId of factionIds) {
            const faction = this.state.factions.get(factionId);
            
            for (const otherFactionId of factionIds) {
                if (factionId !== otherFactionId) {
                    // Initialize neutral to slightly hostile relationships
                    const relationship = 0.3 + Math.random() * 0.4; // 0.3-0.7 range
                    faction.relationships.set(otherFactionId, {
                        trust: relationship,
                        trade_volume: new Decimal(Math.random() * 10000000),
                        conflict_history: [],
                        cooperation_history: [],
                        last_interaction: Date.now()
                    });
                }
            }
        }
    }

    // Main tick processing
    tick(marketData, agents) {
        this.updateFactionStates(agents);
        this.assessTradeTensions();
        this.processActiveSanctions();
        this.detectManipulationAttempts(marketData);
        this.evaluateWarfareEscalation();
        this.updateActiveWars();
        this.processEconomicEspionage();
        this.updateFactionRelationships();
        
        return this.getEconomicWarfareStatus();
    }

    updateFactionStates(agents) {
        for (const [factionId, faction] of this.state.factions) {
            // Update controlled agents
            faction.controlled_agents.clear();
            
            for (const [agentId, agent] of agents) {
                if (agent.isActive && this.determineFactionAffiliation(agent) === factionId) {
                    faction.controlled_agents.add(agentId);
                }
            }
            
            // Update economic health based on controlled agents' performance
            faction.economic_health = this.calculateFactionEconomicHealth(faction, agents);
            
            // Update war exhaustion
            if (faction.war_exhaustion > 0) {
                faction.war_exhaustion = Math.max(0, faction.war_exhaustion - 0.01);
            }
            
            // Update reputation based on recent actions
            this.updateFactionReputation(faction);
        }
    }

    determineFactionAffiliation(agent) {
        // Simplified faction assignment based on agent characteristics
        const psychology = agent.psychology || {};
        const wealth = agent.wealth ? agent.wealth.toNumber() : 1000;
        
        if (psychology.greed > 0.7 && wealth > 100000) return 'corporate_alliance';
        if (psychology.confidence > 0.7) return 'sovereign_union';
        if (psychology.arbitrage_detection > 70) return 'trading_guild';
        if (psychology.analytical_thinking > 70) return 'tech_syndicate';
        
        // Random assignment for others
        const factionIds = Array.from(this.state.factions.keys());
        return factionIds[Math.floor(Math.random() * factionIds.length)];
    }

    calculateFactionEconomicHealth(faction, agents) {
        let totalWealth = new Decimal(0);
        let avgConfidence = 0;
        let agentCount = 0;
        
        for (const agentId of faction.controlled_agents) {
            const agent = agents.get(agentId);
            if (agent) {
                totalWealth = totalWealth.plus(agent.wealth || new Decimal(0));
                avgConfidence += (agent.psychology?.confidence || 0.5);
                agentCount++;
            }
        }
        
        if (agentCount === 0) return 0.5;
        
        avgConfidence /= agentCount;
        const wealthScore = Math.min(1, Math.log10(totalWealth.toNumber() + 1) / 10);
        
        return (wealthScore + avgConfidence) / 2;
    }

    updateFactionReputation(faction) {
        // Reputation decays towards neutral (0.5) over time
        const neutralDecay = 0.001;
        if (faction.reputation > 0.5) {
            faction.reputation = Math.max(0.5, faction.reputation - neutralDecay);
        } else {
            faction.reputation = Math.min(0.5, faction.reputation + neutralDecay);
        }
    }

    assessTradeTensions() {
        const factionIds = Array.from(this.state.factions.keys());
        
        for (let i = 0; i < factionIds.length; i++) {
            for (let j = i + 1; j < factionIds.length; j++) {
                const faction1Id = factionIds[i];
                const faction2Id = factionIds[j];
                
                const tensionLevel = this.calculateTradeTension(faction1Id, faction2Id);
                const tensionKey = `${faction1Id}-${faction2Id}`;
                
                this.state.tradeTensions.set(tensionKey, {
                    faction1: faction1Id,
                    faction2: faction2Id,
                    tension_level: tensionLevel,
                    last_updated: Date.now(),
                    escalation_factors: this.getEscalationFactors(faction1Id, faction2Id),
                    risk_of_conflict: this.calculateConflictRisk(tensionLevel)
                });
            }
        }
    }

    calculateTradeTension(faction1Id, faction2Id) {
        const faction1 = this.state.factions.get(faction1Id);
        const faction2 = this.state.factions.get(faction2Id);
        
        if (!faction1 || !faction2) return 0;
        
        const relationship1 = faction1.relationships.get(faction2Id);
        const relationship2 = faction2.relationships.get(faction1Id);
        
        if (!relationship1 || !relationship2) return 0;
        
        let tension = 0;
        
        // Base tension from poor relationships
        tension += (1 - relationship1.trust) * 0.4;
        tension += (1 - relationship2.trust) * 0.4;
        
        // Economic competition tension
        const healthDifference = Math.abs(faction1.economic_health - faction2.economic_health);
        tension += healthDifference * 0.3;
        
        // Resource competition
        const resourceRatio = faction1.resources.div(faction2.resources.plus(1)).toNumber();
        if (resourceRatio > 2 || resourceRatio < 0.5) {
            tension += 0.2; // Significant resource imbalance
        }
        
        // Aggression level contribution
        tension += (faction1.aggression_level + faction2.aggression_level) * 0.1;
        
        return Math.min(1, tension);
    }

    getEscalationFactors(faction1Id, faction2Id) {
        const factors = [];
        
        const faction1 = this.state.factions.get(faction1Id);
        const faction2 = this.state.factions.get(faction2Id);
        
        if (faction1.economic_health < 0.3 || faction2.economic_health < 0.3) {
            factors.push('economic_desperation');
        }
        
        if (faction1.aggression_level > 0.7 || faction2.aggression_level > 0.7) {
            factors.push('high_aggression');
        }
        
        if (faction1.controlled_markets.size === faction2.controlled_markets.size) {
            factors.push('market_competition');
        }
        
        const relationship1 = faction1.relationships.get(faction2Id);
        if (relationship1 && relationship1.conflict_history.length > 2) {
            factors.push('historical_conflicts');
        }
        
        return factors;
    }

    calculateConflictRisk(tensionLevel) {
        if (tensionLevel > 0.8) return 'high';
        if (tensionLevel > 0.6) return 'medium';
        if (tensionLevel > 0.4) return 'low';
        return 'minimal';
    }

    processActiveSanctions() {
        for (const [sanctionId, sanction] of this.state.sanctions) {
            sanction.duration--;
            
            // Apply sanction effects
            this.applySanctionEffects(sanction);
            
            // Check for retaliation
            if (Math.random() < this.config.retalliationProbability * 0.01) {
                this.triggerSanctionRetaliation(sanction);
            }
            
            // Check for expiration
            if (sanction.duration <= 0 || sanction.effectiveness < 0.1) {
                this.expireSanction(sanctionId);
            }
        }
    }

    applySanctionEffects(sanction) {
        const targetFaction = this.state.factions.get(sanction.target_faction);
        if (!targetFaction) return;
        
        // Economic damage
        const damage = sanction.intensity * sanction.effectiveness * 0.01;
        targetFaction.economic_health = Math.max(0.1, targetFaction.economic_health - damage);
        
        // Resource reduction
        const resourceLoss = targetFaction.resources.mul(damage);
        targetFaction.resources = targetFaction.resources.minus(resourceLoss);
        
        // Reputation impact
        targetFaction.reputation = Math.max(0, targetFaction.reputation - damage * 0.5);
        
        // Effectiveness decay over time
        sanction.effectiveness *= 0.995;
    }

    triggerSanctionRetaliation(originSanction) {
        const retaliationSanction = {
            id: uuidv4(),
            imposing_faction: originSanction.target_faction,
            target_faction: originSanction.imposing_faction,
            type: 'retaliation_' + originSanction.type,
            intensity: originSanction.intensity * 0.8,
            effectiveness: this.config.sanctionEffectiveness * 0.7,
            duration: Math.floor(originSanction.duration * 0.6),
            retaliation_for: originSanction.id,
            timestamp: Date.now()
        };
        
        this.state.sanctions.set(retaliationSanction.id, retaliationSanction);
        
        logger.warn('Sanction retaliation triggered', {
            retaliator: retaliationSanction.imposing_faction,
            target: retaliationSanction.target_faction,
            originSanction: originSanction.id
        });
        
        this.emit('sanction_retaliation', retaliationSanction);
    }

    expireSanction(sanctionId) {
        const sanction = this.state.sanctions.get(sanctionId);
        if (sanction) {
            sanction.end_time = Date.now();
            
            logger.info('Sanction expired', {
                id: sanctionId,
                imposer: sanction.imposing_faction,
                target: sanction.target_faction,
                duration: Date.now() - sanction.timestamp
            });
            
            this.emit('sanction_expired', sanction);
        }
        
        this.state.sanctions.delete(sanctionId);
    }

    detectManipulationAttempts(marketData) {
        for (const [marketId, market] of marketData) {
            // Look for signs of manipulation
            const manipulationScore = this.calculateManipulationScore(market);
            
            if (manipulationScore > 0.7 && Math.random() < this.config.manipulationDetectionRate) {
                this.detectManipulation(marketId, market, manipulationScore);
            }
        }
    }

    calculateManipulationScore(market) {
        let score = 0;
        
        // Unusual price movements
        if (market.priceHistory && market.priceHistory.length >= 5) {
            const recent = market.priceHistory.slice(-5);
            const volatility = this.calculatePriceVolatility(recent);
            if (volatility > 0.2) score += 0.3;
        }
        
        // Volume anomalies
        const avgVolume = market.totalVolume ? market.totalVolume.toNumber() / 10 : 1000;
        const currentVolume = market.totalVolume ? market.totalVolume.toNumber() : 1000;
        if (currentVolume > avgVolume * 5) score += 0.4; // Volume spike
        
        // Supply/demand imbalances
        const supplyRatio = market.supply.div(market.demand).toNumber();
        if (supplyRatio > 5 || supplyRatio < 0.2) score += 0.3;
        
        return Math.min(1, score);
    }

    calculatePriceVolatility(priceHistory) {
        if (priceHistory.length < 2) return 0;
        
        const returns = [];
        for (let i = 1; i < priceHistory.length; i++) {
            returns.push((priceHistory[i].price - priceHistory[i-1].price) / priceHistory[i-1].price);
        }
        
        const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
        
        return Math.sqrt(variance);
    }

    detectManipulation(marketId, market, manipulationScore) {
        const manipulation = {
            id: uuidv4(),
            market_id: marketId,
            market_name: market.name,
            timestamp: Date.now(),
            manipulation_score: manipulationScore,
            suspected_type: this.identifyManipulationType(market),
            suspected_faction: this.identifySuspectedFaction(marketId),
            evidence_strength: manipulationScore,
            investigation_status: 'detected'
        };
        
        this.state.manipulationAttempts.set(manipulation.id, manipulation);
        
        // Trigger counter-measures
        this.triggerCounterManipulation(manipulation);
        
        logger.warn('Market manipulation detected', {
            market: marketId,
            score: manipulationScore,
            suspectedFaction: manipulation.suspected_faction
        });
        
        this.emit('manipulation_detected', manipulation);
    }

    identifyManipulationType(market) {
        const supplyRatio = market.supply.div(market.demand).toNumber();
        
        if (supplyRatio > 3) return 'supply_hoarding';
        if (supplyRatio < 0.3) return 'demand_pumping';
        if (market.volatility > 0.8) return 'volatility_manipulation';
        return 'price_manipulation';
    }

    identifySuspectedFaction(marketId) {
        // Simplified faction identification based on market control
        for (const [factionId, faction] of this.state.factions) {
            if (faction.controlled_markets.has(marketId) || 
                faction.warfare_capabilities.market_manipulation > 0.7) {
                return factionId;
            }
        }
        
        // Random suspect if no clear culprit
        const factionIds = Array.from(this.state.factions.keys());
        return factionIds[Math.floor(Math.random() * factionIds.length)];
    }

    triggerCounterManipulation(manipulation) {
        // Find factions with capability to counter
        for (const [factionId, faction] of this.state.factions) {
            if (factionId !== manipulation.suspected_faction && 
                faction.warfare_capabilities.market_manipulation > 0.5 &&
                Math.random() < 0.3) {
                
                this.launchCounterManipulation(factionId, manipulation);
                break;
            }
        }
    }

    launchCounterManipulation(factionId, targetManipulation) {
        const counter = {
            id: uuidv4(),
            faction_id: factionId,
            target_manipulation: targetManipulation.id,
            market_id: targetManipulation.market_id,
            type: 'counter_manipulation',
            intensity: 0.6,
            timestamp: Date.now(),
            success_probability: this.calculateCounterSuccessProbability(factionId)
        };
        
        this.state.manipulationAttempts.set(counter.id, counter);
        
        logger.info('Counter-manipulation launched', {
            faction: factionId,
            targetMarket: targetManipulation.market_id,
            against: targetManipulation.suspected_faction
        });
        
        this.emit('counter_manipulation_launched', counter);
    }

    calculateCounterSuccessProbability(factionId) {
        const faction = this.state.factions.get(factionId);
        if (!faction) return 0.3;
        
        return Math.min(0.9, 
            faction.warfare_capabilities.market_manipulation * 0.6 + 
            faction.economic_health * 0.4
        );
    }

    evaluateWarfareEscalation() {
        for (const [tensionKey, tension] of this.state.tradeTensions) {
            if (tension.tension_level > this.config.warThreshold && 
                tension.risk_of_conflict === 'high' &&
                Math.random() < 0.001) {
                
                this.escalateToEconomicWarfare(tension);
            }
        }
    }

    escalateToEconomicWarfare(tension) {
        const warType = this.selectWarfareType(tension);
        const warTemplate = this.warfareTypes[warType];
        
        const war = {
            id: uuidv4(),
            type: warType,
            name: warTemplate.name,
            faction1: tension.faction1,
            faction2: tension.faction2,
            startTime: Date.now(),
            intensity: 0.5 + Math.random() * 0.3,
            duration: Math.floor(this.randomInRange(warTemplate.duration_range)),
            weapons_used: [],
            economic_damage: {
                faction1: new Decimal(0),
                faction2: new Decimal(0)
            },
            escalation_level: 0,
            active_fronts: new Set(),
            ticks_active: 0
        };
        
        this.state.activeWars.set(war.id, war);
        
        // Apply immediate war effects
        this.initiateWarfareActions(war, warTemplate);
        
        // Update faction states
        const faction1 = this.state.factions.get(war.faction1);
        const faction2 = this.state.factions.get(war.faction2);
        
        if (faction1) faction1.war_exhaustion += 0.2;
        if (faction2) faction2.war_exhaustion += 0.2;
        
        logger.error('Economic warfare escalated', {
            type: warType,
            faction1: war.faction1,
            faction2: war.faction2,
            intensity: war.intensity
        });
        
        this.emit('economic_warfare_escalated', war);
    }

    selectWarfareType(tension) {
        const factors = tension.escalation_factors;
        
        if (factors.includes('economic_desperation')) return 'resource_warfare';
        if (factors.includes('market_competition')) return 'market_manipulation';
        if (factors.includes('historical_conflicts')) return 'sanctions_campaign';
        
        // Default to trade war
        return 'trade_war';
    }

    randomInRange(range) {
        return range[0] + Math.random() * (range[1] - range[0]);
    }

    initiateWarfareActions(war, warTemplate) {
        // Select initial weapons
        const initialWeapons = warTemplate.weapons.slice(0, 2); // Start with 2 weapons
        war.weapons_used = [...initialWeapons];
        
        // Apply weapon effects
        for (const weapon of initialWeapons) {
            this.applyWarfareWeapon(war, weapon);
        }
    }

    applyWarfareWeapon(war, weapon) {
        const faction1 = this.state.factions.get(war.faction1);
        const faction2 = this.state.factions.get(war.faction2);
        
        if (!faction1 || !faction2) return;
        
        switch (weapon) {
            case 'tariffs':
                this.applyTariffWeapon(war, faction1, faction2);
                break;
            case 'sanctions':
                this.applySanctionWeapon(war, faction1, faction2);
                break;
            case 'devaluation':
                this.applyDevaluationWeapon(war, faction1, faction2);
                break;
            case 'supply_cutoff':
                this.applySupplyCutoffWeapon(war, faction1, faction2);
                break;
            case 'market_manipulation':
                this.applyMarketManipulationWeapon(war, faction1, faction2);
                break;
            default:
                this.applyGenericWarfareWeapon(war, faction1, faction2);
        }
    }

    applyTariffWeapon(war, faction1, faction2) {
        // Reduce trade volume between factions
        const relationship1 = faction1.relationships.get(faction2.id);
        const relationship2 = faction2.relationships.get(faction1.id);
        
        if (relationship1) {
            relationship1.trade_volume = relationship1.trade_volume.mul(0.8);
        }
        if (relationship2) {
            relationship2.trade_volume = relationship2.trade_volume.mul(0.8);
        }
        
        // Economic damage
        const damage1 = faction1.resources.mul(0.02);
        const damage2 = faction2.resources.mul(0.02);
        
        faction1.resources = faction1.resources.minus(damage1);
        faction2.resources = faction2.resources.minus(damage2);
        
        war.economic_damage.faction1 = war.economic_damage.faction1.plus(damage1);
        war.economic_damage.faction2 = war.economic_damage.faction2.plus(damage2);
    }

    applySanctionWeapon(war, faction1, faction2) {
        // Create mutual sanctions
        const sanction1 = this.createWarSanction(faction1.id, faction2.id, war.intensity);
        const sanction2 = this.createWarSanction(faction2.id, faction1.id, war.intensity);
        
        this.state.sanctions.set(sanction1.id, sanction1);
        this.state.sanctions.set(sanction2.id, sanction2);
    }

    createWarSanction(imposer, target, intensity) {
        return {
            id: uuidv4(),
            imposing_faction: imposer,
            target_faction: target,
            type: 'economic_warfare',
            intensity: intensity,
            effectiveness: this.config.sanctionEffectiveness,
            duration: 30 + Math.floor(Math.random() * 20),
            timestamp: Date.now()
        };
    }

    applyDevaluationWeapon(war, faction1, faction2) {
        // Currency war effects would be applied to currency markets
        // This is a simplified version affecting economic health
        const devaluationCost = faction1.resources.mul(0.05);
        faction1.resources = faction1.resources.minus(devaluationCost);
        faction2.economic_health = Math.max(0.1, faction2.economic_health - 0.1);
        
        war.economic_damage.faction1 = war.economic_damage.faction1.plus(devaluationCost);
    }

    applySupplyCutoffWeapon(war, faction1, faction2) {
        // Trigger supply shocks in markets controlled by the target
        for (const marketId of faction2.controlled_markets) {
            // This would interface with the supply shock engine
            if (this.crisisEngine.supplyShockEngine) {
                this.crisisEngine.supplyShockEngine.forceSupplyShock(marketId, 'trade_embargo', 0.6);
            }
        }
    }

    applyMarketManipulationWeapon(war, faction1, faction2) {
        // Launch coordinated market manipulation
        for (const marketId of faction2.controlled_markets) {
            if (Math.random() < 0.3) { // 30% chance per market
                this.launchWarfareManipulation(faction1.id, marketId, war.intensity);
            }
        }
    }

    launchWarfareManipulation(factionId, marketId, intensity) {
        const manipulation = {
            id: uuidv4(),
            faction_id: factionId,
            market_id: marketId,
            type: 'warfare_manipulation',
            intensity: intensity,
            timestamp: Date.now(),
            warfare_context: true
        };
        
        this.state.manipulationAttempts.set(manipulation.id, manipulation);
    }

    applyGenericWarfareWeapon(war, faction1, faction2) {
        // Generic economic damage
        const damage = war.intensity * this.config.economicDamageMultiplier * 0.01;
        
        const damage1 = faction1.resources.mul(damage);
        const damage2 = faction2.resources.mul(damage);
        
        faction1.resources = faction1.resources.minus(damage1);
        faction2.resources = faction2.resources.minus(damage2);
        
        war.economic_damage.faction1 = war.economic_damage.faction1.plus(damage1);
        war.economic_damage.faction2 = war.economic_damage.faction2.plus(damage2);
    }

    updateActiveWars() {
        for (const [warId, war] of this.state.activeWars) {
            war.ticks_active++;
            
            // Escalate war intensity occasionally
            if (Math.random() < 0.05) {
                this.escalateWar(war);
            }
            
            // Apply ongoing war effects
            this.applyOngoingWarEffects(war);
            
            // Check for war resolution
            if (this.shouldResolveWar(war)) {
                this.resolveWar(warId, war);
            }
        }
    }

    escalateWar(war) {
        war.escalation_level++;
        war.intensity = Math.min(1, war.intensity * 1.1);
        
        // Add new weapons
        const warTemplate = this.warfareTypes[war.type];
        const availableWeapons = warTemplate.weapons.filter(w => !war.weapons_used.includes(w));
        
        if (availableWeapons.length > 0) {
            const newWeapon = availableWeapons[Math.floor(Math.random() * availableWeapons.length)];
            war.weapons_used.push(newWeapon);
            this.applyWarfareWeapon(war, newWeapon);
        }
        
        logger.warn('Economic war escalated', {
            warId: war.id,
            newIntensity: war.intensity,
            escalationLevel: war.escalation_level
        });
    }

    applyOngoingWarEffects(war) {
        const faction1 = this.state.factions.get(war.faction1);
        const faction2 = this.state.factions.get(war.faction2);
        
        if (!faction1 || !faction2) return;
        
        // Ongoing war exhaustion
        faction1.war_exhaustion = Math.min(1, faction1.war_exhaustion + 0.005);
        faction2.war_exhaustion = Math.min(1, faction2.war_exhaustion + 0.005);
        
        // Continuous economic damage
        const continuousDamage = war.intensity * 0.001;
        const damage1 = faction1.resources.mul(continuousDamage);
        const damage2 = faction2.resources.mul(continuousDamage);
        
        faction1.resources = faction1.resources.minus(damage1);
        faction2.resources = faction2.resources.minus(damage2);
        
        war.economic_damage.faction1 = war.economic_damage.faction1.plus(damage1);
        war.economic_damage.faction2 = war.economic_damage.faction2.plus(damage2);
        
        // Reputation damage
        faction1.reputation = Math.max(0, faction1.reputation - 0.001);
        faction2.reputation = Math.max(0, faction2.reputation - 0.001);
    }

    shouldResolveWar(war) {
        const faction1 = this.state.factions.get(war.faction1);
        const faction2 = this.state.factions.get(war.faction2);
        
        return (
            war.ticks_active >= war.duration ||
            (faction1 && faction1.war_exhaustion > 0.8) ||
            (faction2 && faction2.war_exhaustion > 0.8) ||
            (faction1 && faction1.economic_health < 0.2) ||
            (faction2 && faction2.economic_health < 0.2)
        );
    }

    resolveWar(warId, war) {
        war.endTime = Date.now();
        war.total_duration = war.endTime - war.startTime;
        
        // Determine winner (if any)
        const faction1 = this.state.factions.get(war.faction1);
        const faction2 = this.state.factions.get(war.faction2);
        
        let winner = null;
        if (faction1 && faction2) {
            const score1 = faction1.economic_health - faction1.war_exhaustion;
            const score2 = faction2.economic_health - faction2.war_exhaustion;
            
            if (Math.abs(score1 - score2) > 0.2) {
                winner = score1 > score2 ? war.faction1 : war.faction2;
            }
        }
        
        war.resolution = winner ? `victory_${winner}` : 'stalemate';
        
        // Apply post-war effects
        this.applyPostWarEffects(war, winner);
        
        // Record in history
        this.state.warfareHistory.push({
            ...war,
            economic_damage: {
                faction1: war.economic_damage.faction1.toString(),
                faction2: war.economic_damage.faction2.toString()
            }
        });
        
        this.state.activeWars.delete(warId);
        
        logger.info('Economic war resolved', {
            type: war.type,
            resolution: war.resolution,
            duration: war.total_duration,
            totalDamage: war.economic_damage.faction1.plus(war.economic_damage.faction2).toString()
        });
        
        this.emit('economic_war_resolved', war);
    }

    applyPostWarEffects(war, winner) {
        const faction1 = this.state.factions.get(war.faction1);
        const faction2 = this.state.factions.get(war.faction2);
        
        if (winner) {
            const winnerFaction = this.state.factions.get(winner);
            const loserFaction = winner === war.faction1 ? faction2 : faction1;
            
            if (winnerFaction && loserFaction) {
                // Winner gains reputation and resources
                winnerFaction.reputation = Math.min(1, winnerFaction.reputation + 0.2);
                const spoils = loserFaction.resources.mul(0.1);
                winnerFaction.resources = winnerFaction.resources.plus(spoils);
                loserFaction.resources = loserFaction.resources.minus(spoils);
                
                // Loser loses reputation
                loserFaction.reputation = Math.max(0, loserFaction.reputation - 0.3);
            }
        }
        
        // Both factions begin recovery
        if (faction1) faction1.war_exhaustion = Math.max(0, faction1.war_exhaustion - 0.3);
        if (faction2) faction2.war_exhaustion = Math.max(0, faction2.war_exhaustion - 0.3);
    }

    processEconomicEspionage() {
        // Simplified espionage system
        for (const [factionId, faction] of this.state.factions) {
            if (faction.warfare_capabilities.information_warfare > 0.6 && Math.random() < 0.001) {
                this.conductEspionage(factionId);
            }
        }
    }

    conductEspionage(spyFactionId) {
        const targets = Array.from(this.state.factions.keys()).filter(id => id !== spyFactionId);
        const targetId = targets[Math.floor(Math.random() * targets.length)];
        
        const espionage = {
            id: uuidv4(),
            spy_faction: spyFactionId,
            target_faction: targetId,
            timestamp: Date.now(),
            type: 'intelligence_gathering',
            success: Math.random() < 0.7, // 70% success rate
            intelligence_gathered: null
        };
        
        if (espionage.success) {
            espionage.intelligence_gathered = this.gatherIntelligence(targetId);
        }
        
        this.state.economicEspionage.set(espionage.id, espionage);
        
        this.emit('espionage_conducted', espionage);
    }

    gatherIntelligence(targetFactionId) {
        const targetFaction = this.state.factions.get(targetFactionId);
        if (!targetFaction) return null;
        
        return {
            economic_health: targetFaction.economic_health,
            resources: targetFaction.resources.toString(),
            war_exhaustion: targetFaction.war_exhaustion,
            active_strategies: Array.from(targetFaction.active_strategies.keys()),
            controlled_agents_count: targetFaction.controlled_agents.size
        };
    }

    updateFactionRelationships() {
        for (const [factionId, faction] of this.state.factions) {
            for (const [otherFactionId, relationship] of faction.relationships) {
                // Natural relationship recovery over time
                if (relationship.trust < 0.5) {
                    relationship.trust = Math.min(0.5, relationship.trust + 0.001);
                }
                
                // Reduce trust if in active war
                const activeWar = Array.from(this.state.activeWars.values()).find(war => 
                    (war.faction1 === factionId && war.faction2 === otherFactionId) ||
                    (war.faction2 === factionId && war.faction1 === otherFactionId)
                );
                
                if (activeWar) {
                    relationship.trust = Math.max(0, relationship.trust - 0.01);
                }
            }
        }
    }

    // Public API
    getEconomicWarfareStatus() {
        return {
            factions: Object.fromEntries(this.state.factions),
            activeWars: Array.from(this.state.activeWars.values()),
            tradeTensions: Object.fromEntries(this.state.tradeTensions),
            activeSanctions: Array.from(this.state.sanctions.values()),
            detectedManipulations: Array.from(this.state.manipulationAttempts.values()),
            espionageOperations: Array.from(this.state.economicEspionage.values()).slice(-10),
            warfareHistory: this.state.warfareHistory.slice(-5)
        };
    }

    getFactionPowerRanking() {
        const rankings = [];
        
        for (const [factionId, faction] of this.state.factions) {
            const powerScore = this.calculateFactionPower(faction);
            rankings.push({
                faction_id: factionId,
                name: faction.name,
                power_score: powerScore,
                economic_health: faction.economic_health,
                resources: faction.resources.toString(),
                controlled_agents: faction.controlled_agents.size,
                reputation: faction.reputation,
                war_exhaustion: faction.war_exhaustion,
                active_wars: Array.from(this.state.activeWars.values()).filter(war => 
                    war.faction1 === factionId || war.faction2 === factionId
                ).length
            });
        }
        
        return rankings.sort((a, b) => b.power_score - a.power_score);
    }

    calculateFactionPower(faction) {
        const resourceScore = Math.min(1, Math.log10(faction.resources.toNumber() + 1) / 10);
        const healthScore = faction.economic_health;
        const influenceScore = faction.influence;
        const reputationScore = faction.reputation;
        const exhaustionPenalty = faction.war_exhaustion;
        
        return Math.max(0, (resourceScore + healthScore + influenceScore + reputationScore) / 4 - exhaustionPenalty);
    }

    // Manual triggers for testing
    forceEconomicWar(faction1Id, faction2Id, warType = 'trade_war') {
        const tension = {
            faction1: faction1Id,
            faction2: faction2Id,
            tension_level: 0.9,
            escalation_factors: ['forced_test'],
            risk_of_conflict: 'high'
        };
        
        this.escalateToEconomicWarfare(tension);
        return true;
    }

    forceSanction(imposingFactionId, targetFactionId, intensity = 0.8) {
        const sanction = {
            id: uuidv4(),
            imposing_faction: imposingFactionId,
            target_faction: targetFactionId,
            type: 'forced_sanction',
            intensity: intensity,
            effectiveness: this.config.sanctionEffectiveness,
            duration: 50,
            timestamp: Date.now()
        };
        
        this.state.sanctions.set(sanction.id, sanction);
        return sanction.id;
    }

    forceManipulation(factionId, marketId) {
        return this.launchWarfareManipulation(factionId, marketId, 0.8);
    }
}

module.exports = EconomicWarfareEngine;
/**
 * Player Control Engine - Core system for player influence mechanics
 * Provides indirect control over AI agents through environmental manipulation
 */

const EventEmitter = require('eventemitter3');
const { v4: uuidv4 } = require('uuid');

class PlayerControlEngine extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            maxPoliciesPerPlayer: config.maxPoliciesPerPlayer || 10,
            policyEffectiveness: config.policyEffectiveness || 0.8,
            influenceDecayRate: config.influenceDecayRate || 0.05, // 5% decay per hour
            maxInfluenceRange: config.maxInfluenceRange || 100, // km
            playerActionCooldown: config.playerActionCooldown || 300000, // 5 minutes
            budgetLimits: {
                infrastructure: config.budgetLimits?.infrastructure || 1000000,
                propaganda: config.budgetLimits?.propaganda || 500000,
                espionage: config.budgetLimits?.espionage || 250000,
                policies: config.budgetLimits?.policies || 750000
            },
            ...config
        };

        this.state = {
            players: new Map(),
            activePolicies: new Map(),
            playerActions: new Map(),
            influenceZones: new Map(),
            playerBudgets: new Map(),
            actionCooldowns: new Map(),
            coalitions: new Map()
        };

        this.policyTypes = {
            taxation: {
                agent_income_tax: { cost: 50000, effectiveness: 0.7, duration: 3600000 },
                corporate_tax: { cost: 100000, effectiveness: 0.8, duration: 7200000 },
                trade_tariff: { cost: 75000, effectiveness: 0.6, duration: 1800000 },
                luxury_tax: { cost: 25000, effectiveness: 0.5, duration: 1800000 }
            },
            subsidies: {
                startup_grants: { cost: 80000, effectiveness: 0.9, duration: 14400000 },
                research_funding: { cost: 120000, effectiveness: 0.8, duration: 21600000 },
                infrastructure_incentives: { cost: 200000, effectiveness: 0.7, duration: 28800000 },
                export_subsidies: { cost: 60000, effectiveness: 0.6, duration: 10800000 }
            },
            regulations: {
                market_restrictions: { cost: 40000, effectiveness: 0.8, duration: 3600000 },
                quality_standards: { cost: 90000, effectiveness: 0.7, duration: 7200000 },
                environmental_rules: { cost: 110000, effectiveness: 0.6, duration: 14400000 },
                labor_laws: { cost: 70000, effectiveness: 0.8, duration: 10800000 }
            },
            information: {
                market_reports: { cost: 30000, effectiveness: 0.9, duration: 1800000 },
                economic_forecasts: { cost: 50000, effectiveness: 0.8, duration: 3600000 },
                competitor_analysis: { cost: 80000, effectiveness: 0.7, duration: 7200000 },
                insider_tips: { cost: 100000, effectiveness: 0.9, duration: 900000 }
            }
        };

        this.infrastructureTypes = {
            transportation: {
                highways: { cost: 500000, efficiency_boost: 0.3, range: 50 },
                ports: { cost: 800000, efficiency_boost: 0.5, range: 100 },
                airports: { cost: 1200000, efficiency_boost: 0.4, range: 200 },
                railways: { cost: 700000, efficiency_boost: 0.35, range: 150 }
            },
            communication: {
                fiber_networks: { cost: 300000, efficiency_boost: 0.25, range: 30 },
                satellite_coverage: { cost: 600000, efficiency_boost: 0.4, range: 500 },
                data_centers: { cost: 400000, efficiency_boost: 0.3, range: 50 },
                research_networks: { cost: 350000, efficiency_boost: 0.2, range: 75 }
            },
            utilities: {
                power_plants: { cost: 900000, efficiency_boost: 0.4, range: 100 },
                water_systems: { cost: 450000, efficiency_boost: 0.3, range: 60 },
                waste_management: { cost: 250000, efficiency_boost: 0.2, range: 40 },
                renewable_energy: { cost: 600000, efficiency_boost: 0.35, range: 80 }
            }
        };

        this.initializeSystem();
    }

    initializeSystem() {
        // Start influence decay timer
        setInterval(() => {
            this.decayInfluence();
        }, 60000); // Every minute

        // Start policy expiration timer
        setInterval(() => {
            this.updatePolicyExpirations();
        }, 30000); // Every 30 seconds

        // Start budget regeneration timer
        setInterval(() => {
            this.regenerateBudgets();
        }, 300000); // Every 5 minutes

        console.log('Player Control Engine initialized');
    }

    // Player Management
    registerPlayer(playerId, playerData = {}) {
        const player = {
            id: playerId,
            name: playerData.name || `Player_${playerId.slice(0, 8)}`,
            level: playerData.level || 1,
            experience: playerData.experience || 0,
            reputation: playerData.reputation || 0,
            influence: playerData.influence || 100,
            region: playerData.region || 'neutral',
            specialization: playerData.specialization || 'generalist',
            registeredAt: Date.now(),
            lastActive: Date.now(),
            actionHistory: [],
            achievements: [],
            coalitionMemberships: []
        };

        this.state.players.set(playerId, player);
        
        // Initialize player budget
        this.state.playerBudgets.set(playerId, {
            infrastructure: this.config.budgetLimits.infrastructure,
            propaganda: this.config.budgetLimits.propaganda,
            espionage: this.config.budgetLimits.espionage,
            policies: this.config.budgetLimits.policies,
            lastRegeneration: Date.now()
        });

        // Initialize action cooldowns
        this.state.actionCooldowns.set(playerId, {});

        this.emit('player_registered', { playerId, player });
        return player;
    }

    // Policy Implementation System
    async implementPolicy(playerId, policyType, policySubtype, targetParams = {}) {
        const player = this.state.players.get(playerId);
        if (!player) throw new Error('Player not found');

        const policyConfig = this.policyTypes[policyType]?.[policySubtype];
        if (!policyConfig) throw new Error('Invalid policy type');

        // Check cooldown
        if (this.isOnCooldown(playerId, 'policy')) {
            throw new Error('Policy action on cooldown');
        }

        // Check budget
        const budget = this.state.playerBudgets.get(playerId);
        if (budget.policies < policyConfig.cost) {
            throw new Error('Insufficient policy budget');
        }

        // Check policy limits
        const activePolicies = Array.from(this.state.activePolicies.values())
            .filter(p => p.playerId === playerId);
        if (activePolicies.length >= this.config.maxPoliciesPerPlayer) {
            throw new Error('Maximum policy limit reached');
        }

        const policyId = uuidv4();
        const policy = {
            id: policyId,
            playerId,
            type: policyType,
            subtype: policySubtype,
            target: targetParams,
            cost: policyConfig.cost,
            effectiveness: policyConfig.effectiveness * this.calculatePlayerEfficiencyMultiplier(player),
            duration: policyConfig.duration,
            startTime: Date.now(),
            expirationTime: Date.now() + policyConfig.duration,
            status: 'active',
            effects: []
        };

        // Deduct budget
        budget.policies -= policyConfig.cost;

        // Apply policy effects
        const effects = await this.applyPolicyEffects(policy);
        policy.effects = effects;

        // Store policy
        this.state.activePolicies.set(policyId, policy);

        // Set cooldown
        this.setCooldown(playerId, 'policy');

        // Record action
        this.recordPlayerAction(playerId, 'policy_implementation', policy);

        this.emit('policy_implemented', { playerId, policy, effects });
        return { policyId, effects };
    }

    async applyPolicyEffects(policy) {
        const effects = [];

        switch (policy.type) {
            case 'taxation':
                effects.push(...await this.applyTaxationEffects(policy));
                break;
            case 'subsidies':
                effects.push(...await this.applySubsidyEffects(policy));
                break;
            case 'regulations':
                effects.push(...await this.applyRegulationEffects(policy));
                break;
            case 'information':
                effects.push(...await this.applyInformationEffects(policy));
                break;
        }

        return effects;
    }

    async applyTaxationEffects(policy) {
        const effects = [];
        const { subtype, target, effectiveness } = policy;

        switch (subtype) {
            case 'agent_income_tax':
                // Reduce agent disposable income, affecting spending behavior
                effects.push({
                    type: 'agent_income_modifier',
                    value: -effectiveness * 0.2, // 20% income reduction at max effectiveness
                    target: target.agentTypes || ['all'],
                    region: target.region || null
                });
                break;

            case 'corporate_tax':
                // Increase corporate costs, affecting pricing and expansion
                effects.push({
                    type: 'corporate_cost_modifier',
                    value: effectiveness * 0.15, // 15% cost increase
                    target: target.corporations || ['all'],
                    region: target.region || null
                });
                break;

            case 'trade_tariff':
                // Increase import costs for specific goods
                effects.push({
                    type: 'trade_cost_modifier',
                    value: effectiveness * 0.25, // 25% trade cost increase
                    target: target.commodities || ['all'],
                    direction: 'import'
                });
                break;

            case 'luxury_tax':
                // Reduce demand for luxury goods
                effects.push({
                    type: 'demand_modifier',
                    value: -effectiveness * 0.3, // 30% demand reduction
                    target: target.luxuryGoods || ['technology', 'services'],
                    region: target.region || null
                });
                break;
        }

        return effects;
    }

    async applySubsidyEffects(policy) {
        const effects = [];
        const { subtype, target, effectiveness } = policy;

        switch (subtype) {
            case 'startup_grants':
                // Encourage new business formation
                effects.push({
                    type: 'business_formation_modifier',
                    value: effectiveness * 0.4, // 40% increase in startup rate
                    target: target.industries || ['all'],
                    region: target.region || null
                });
                break;

            case 'research_funding':
                // Boost technological advancement
                effects.push({
                    type: 'research_efficiency_modifier',
                    value: effectiveness * 0.5, // 50% research boost
                    target: target.researchAreas || ['technology'],
                    region: target.region || null
                });
                break;

            case 'infrastructure_incentives':
                // Encourage infrastructure investment
                effects.push({
                    type: 'infrastructure_investment_modifier',
                    value: effectiveness * 0.3, // 30% investment boost
                    target: target.infrastructureTypes || ['all'],
                    region: target.region || null
                });
                break;

            case 'export_subsidies':
                // Boost export competitiveness
                effects.push({
                    type: 'export_competitiveness_modifier',
                    value: effectiveness * 0.35, // 35% export boost
                    target: target.commodities || ['all'],
                    region: target.region || null
                });
                break;
        }

        return effects;
    }

    async applyRegulationEffects(policy) {
        const effects = [];
        const { subtype, target, effectiveness } = policy;

        switch (subtype) {
            case 'market_restrictions':
                // Limit market participation
                effects.push({
                    type: 'market_access_modifier',
                    value: -effectiveness * 0.25, // 25% access reduction
                    target: target.markets || ['all'],
                    restrictions: target.restrictions || {}
                });
                break;

            case 'quality_standards':
                // Increase production costs but improve quality
                effects.push({
                    type: 'quality_cost_modifier',
                    value: effectiveness * 0.15, // 15% cost increase
                    qualityBonus: effectiveness * 0.2, // 20% quality increase
                    target: target.industries || ['all']
                });
                break;

            case 'environmental_rules':
                // Increase environmental compliance costs
                effects.push({
                    type: 'environmental_cost_modifier',
                    value: effectiveness * 0.2, // 20% compliance cost
                    target: target.industries || ['energy', 'materials'],
                    sustainabilityBonus: effectiveness * 0.15
                });
                break;

            case 'labor_laws':
                // Affect labor costs and productivity
                effects.push({
                    type: 'labor_cost_modifier',
                    value: effectiveness * 0.1, // 10% labor cost increase
                    productivityBonus: effectiveness * 0.08, // 8% productivity increase
                    target: target.industries || ['all']
                });
                break;
        }

        return effects;
    }

    async applyInformationEffects(policy) {
        const effects = [];
        const { subtype, target, effectiveness } = policy;

        switch (subtype) {
            case 'market_reports':
                // Improve agent decision-making accuracy
                effects.push({
                    type: 'decision_accuracy_modifier',
                    value: effectiveness * 0.15, // 15% accuracy improvement
                    target: target.agentTypes || ['all'],
                    informationType: 'market_data'
                });
                break;

            case 'economic_forecasts':
                // Help agents with long-term planning
                effects.push({
                    type: 'planning_horizon_modifier',
                    value: effectiveness * 0.2, // 20% longer planning horizon
                    target: target.agentTypes || ['all'],
                    informationType: 'forecasts'
                });
                break;

            case 'competitor_analysis':
                // Improve competitive positioning
                effects.push({
                    type: 'competitive_advantage_modifier',
                    value: effectiveness * 0.25, // 25% competitive advantage
                    target: target.agentTypes || ['corporate'],
                    informationType: 'competitor_data'
                });
                break;

            case 'insider_tips':
                // Provide early access to market information
                effects.push({
                    type: 'information_timing_modifier',
                    value: effectiveness * 0.4, // 40% earlier information access
                    target: target.agentTypes || ['trader'],
                    informationType: 'insider_data'
                });
                break;
        }

        return effects;
    }

    // Infrastructure Investment System
    async investInfrastructure(playerId, infrastructureType, infrastructureSubtype, location, options = {}) {
        const player = this.state.players.get(playerId);
        if (!player) throw new Error('Player not found');

        const infraConfig = this.infrastructureTypes[infrastructureType]?.[infrastructureSubtype];
        if (!infraConfig) throw new Error('Invalid infrastructure type');

        // Check cooldown
        if (this.isOnCooldown(playerId, 'infrastructure')) {
            throw new Error('Infrastructure action on cooldown');
        }

        // Check budget
        const budget = this.state.playerBudgets.get(playerId);
        if (budget.infrastructure < infraConfig.cost) {
            throw new Error('Insufficient infrastructure budget');
        }

        const investmentId = uuidv4();
        const investment = {
            id: investmentId,
            playerId,
            type: infrastructureType,
            subtype: infrastructureSubtype,
            location,
            cost: infraConfig.cost,
            efficiencyBoost: infraConfig.efficiency_boost,
            range: infraConfig.range,
            constructionStart: Date.now(),
            constructionDuration: options.fastTrack ? 1800000 : 3600000, // 30 min or 1 hour
            completionTime: Date.now() + (options.fastTrack ? 1800000 : 3600000),
            status: 'under_construction',
            effects: []
        };

        // Deduct budget
        budget.infrastructure -= infraConfig.cost;

        // Create influence zone
        const influenceZone = {
            id: `influence_${investmentId}`,
            playerId,
            center: location,
            radius: infraConfig.range,
            type: 'infrastructure',
            efficiency: infraConfig.efficiency_boost,
            created: Date.now(),
            active: false // Will be activated when construction completes
        };

        this.state.influenceZones.set(influenceZone.id, influenceZone);

        // Set cooldown
        this.setCooldown(playerId, 'infrastructure');

        // Schedule completion
        setTimeout(() => {
            this.completeInfrastructureProject(investmentId);
        }, investment.constructionDuration);

        // Record action
        this.recordPlayerAction(playerId, 'infrastructure_investment', investment);

        this.emit('infrastructure_investment_started', { playerId, investment, influenceZone });
        return { investmentId, estimatedCompletion: investment.completionTime };
    }

    completeInfrastructureProject(investmentId) {
        // Find the investment (this would be stored somewhere)
        const influenceZone = Array.from(this.state.influenceZones.values())
            .find(zone => zone.id === `influence_${investmentId}`);

        if (influenceZone) {
            influenceZone.active = true;
            influenceZone.activatedAt = Date.now();

            this.emit('infrastructure_completed', { 
                investmentId, 
                playerId: influenceZone.playerId,
                location: influenceZone.center,
                efficiency: influenceZone.efficiency
            });
        }
    }

    // Propaganda/Marketing System
    async launchPropagandaCampaign(playerId, campaignType, target, message, budget) {
        const player = this.state.players.get(playerId);
        if (!player) throw new Error('Player not found');

        // Check cooldown
        if (this.isOnCooldown(playerId, 'propaganda')) {
            throw new Error('Propaganda action on cooldown');
        }

        // Check budget
        const playerBudget = this.state.playerBudgets.get(playerId);
        if (playerBudget.propaganda < budget) {
            throw new Error('Insufficient propaganda budget');
        }

        const campaignId = uuidv4();
        const campaign = {
            id: campaignId,
            playerId,
            type: campaignType,
            target,
            message,
            budget,
            effectiveness: Math.min(budget / 100000, 1.0), // $100k = 100% effectiveness
            duration: 3600000, // 1 hour
            startTime: Date.now(),
            expirationTime: Date.now() + 3600000,
            status: 'active',
            reach: this.calculateCampaignReach(budget, target),
            influence: this.calculateCampaignInfluence(budget, campaignType)
        };

        // Deduct budget
        playerBudget.propaganda -= budget;

        // Apply campaign effects
        const effects = await this.applyCampaignEffects(campaign);
        campaign.effects = effects;

        // Set cooldown
        this.setCooldown(playerId, 'propaganda');

        // Record action
        this.recordPlayerAction(playerId, 'propaganda_campaign', campaign);

        this.emit('propaganda_campaign_launched', { playerId, campaign, effects });
        return { campaignId, effects };
    }

    calculateCampaignReach(budget, target) {
        const baseBudget = 50000; // $50k base
        const reachMultiplier = Math.sqrt(budget / baseBudget);
        
        switch (target.type) {
            case 'global': return Math.min(reachMultiplier * 0.8, 1.0);
            case 'regional': return Math.min(reachMultiplier * 0.9, 1.0);
            case 'local': return Math.min(reachMultiplier * 1.0, 1.0);
            case 'demographic': return Math.min(reachMultiplier * 0.7, 1.0);
            default: return Math.min(reachMultiplier * 0.6, 1.0);
        }
    }

    calculateCampaignInfluence(budget, campaignType) {
        const baseBudget = 50000;
        const influenceMultiplier = budget / baseBudget;

        const typeMultipliers = {
            brand_awareness: 0.8,
            product_preference: 1.0,
            sentiment_manipulation: 1.2,
            disinformation: 0.6, // Lower effectiveness due to resistance
            reputation_attack: 1.1,
            market_confidence: 0.9
        };

        return Math.min(influenceMultiplier * (typeMultipliers[campaignType] || 0.8), 2.0);
    }

    async applyCampaignEffects(campaign) {
        const effects = [];
        const { type, target, effectiveness, influence, reach } = campaign;

        switch (type) {
            case 'brand_awareness':
                effects.push({
                    type: 'brand_preference_modifier',
                    value: effectiveness * influence * 0.3,
                    target: target.brands || [],
                    reach: reach,
                    duration: campaign.duration
                });
                break;

            case 'product_preference':
                effects.push({
                    type: 'product_demand_modifier',
                    value: effectiveness * influence * 0.25,
                    target: target.products || [],
                    reach: reach,
                    duration: campaign.duration
                });
                break;

            case 'sentiment_manipulation':
                effects.push({
                    type: 'market_sentiment_modifier',
                    value: effectiveness * influence * 0.2,
                    target: target.markets || ['all'],
                    sentiment: target.sentiment || 'positive',
                    reach: reach,
                    duration: campaign.duration
                });
                break;

            case 'disinformation':
                effects.push({
                    type: 'information_distortion_modifier',
                    value: effectiveness * influence * 0.15,
                    target: target.informationTypes || ['market_data'],
                    distortionType: target.distortionType || 'noise',
                    reach: reach,
                    duration: campaign.duration
                });
                break;

            case 'reputation_attack':
                effects.push({
                    type: 'reputation_modifier',
                    value: -effectiveness * influence * 0.4,
                    target: target.entities || [],
                    reach: reach,
                    duration: campaign.duration
                });
                break;

            case 'market_confidence':
                effects.push({
                    type: 'confidence_modifier',
                    value: effectiveness * influence * 0.35,
                    target: target.markets || ['all'],
                    confidence: target.confidence || 'bullish',
                    reach: reach,
                    duration: campaign.duration
                });
                break;
        }

        return effects;
    }

    // Utility Methods
    isOnCooldown(playerId, actionType) {
        const cooldowns = this.state.actionCooldowns.get(playerId);
        if (!cooldowns) return false;

        const cooldownEnd = cooldowns[actionType];
        if (!cooldownEnd) return false;

        return Date.now() < cooldownEnd;
    }

    setCooldown(playerId, actionType) {
        const cooldowns = this.state.actionCooldowns.get(playerId) || {};
        cooldowns[actionType] = Date.now() + this.config.playerActionCooldown;
        this.state.actionCooldowns.set(playerId, cooldowns);
    }

    calculatePlayerEfficiencyMultiplier(player) {
        // Base efficiency from player level and experience
        let multiplier = 1.0 + (player.level - 1) * 0.1; // 10% per level above 1
        
        // Reputation bonus
        multiplier += Math.max(0, player.reputation / 1000) * 0.2; // Up to 20% for reputation
        
        // Specialization bonus
        const specializationBonus = {
            'economist': 1.2,
            'politician': 1.15,
            'business_mogul': 1.1,
            'tech_innovator': 1.05,
            'generalist': 1.0
        };
        
        multiplier *= specializationBonus[player.specialization] || 1.0;
        
        return Math.min(multiplier, 2.0); // Cap at 200% efficiency
    }

    recordPlayerAction(playerId, actionType, actionData) {
        const player = this.state.players.get(playerId);
        if (!player) return;

        const action = {
            type: actionType,
            timestamp: Date.now(),
            data: actionData,
            id: uuidv4()
        };

        player.actionHistory.push(action);
        player.lastActive = Date.now();

        // Keep only last 100 actions
        if (player.actionHistory.length > 100) {
            player.actionHistory.shift();
        }
    }

    decayInfluence() {
        for (const [zoneId, zone] of this.state.influenceZones) {
            if (zone.active) {
                const ageHours = (Date.now() - zone.activatedAt) / 3600000;
                const decayAmount = ageHours * this.config.influenceDecayRate;
                
                zone.efficiency = Math.max(0, zone.efficiency - decayAmount);
                
                // Remove zones with no influence left
                if (zone.efficiency <= 0) {
                    this.state.influenceZones.delete(zoneId);
                    this.emit('influence_zone_expired', { zoneId, playerId: zone.playerId });
                }
            }
        }
    }

    updatePolicyExpirations() {
        const now = Date.now();
        
        for (const [policyId, policy] of this.state.activePolicies) {
            if (now >= policy.expirationTime) {
                policy.status = 'expired';
                this.state.activePolicies.delete(policyId);
                
                this.emit('policy_expired', { 
                    policyId, 
                    playerId: policy.playerId,
                    type: policy.type,
                    subtype: policy.subtype
                });
            }
        }
    }

    regenerateBudgets() {
        for (const [playerId, budget] of this.state.playerBudgets) {
            const player = this.state.players.get(playerId);
            if (!player) continue;

            const regenerationRate = 0.1; // 10% of max budget per cycle
            const timeSinceLastRegen = Date.now() - budget.lastRegeneration;
            const cycles = Math.floor(timeSinceLastRegen / 300000); // 5-minute cycles

            if (cycles > 0) {
                Object.keys(this.config.budgetLimits).forEach(budgetType => {
                    const maxBudget = this.config.budgetLimits[budgetType];
                    const regenAmount = maxBudget * regenerationRate * cycles;
                    
                    budget[budgetType] = Math.min(
                        budget[budgetType] + regenAmount,
                        maxBudget
                    );
                });

                budget.lastRegeneration = Date.now();
            }
        }
    }

    // Public API Methods
    getPlayerStatus(playerId) {
        const player = this.state.players.get(playerId);
        if (!player) return null;

        const budget = this.state.playerBudgets.get(playerId);
        const cooldowns = this.state.actionCooldowns.get(playerId) || {};
        const activePolicies = Array.from(this.state.activePolicies.values())
            .filter(p => p.playerId === playerId);
        const influenceZones = Array.from(this.state.influenceZones.values())
            .filter(z => z.playerId === playerId);

        return {
            player,
            budget,
            cooldowns,
            activePolicies,
            influenceZones,
            totalInfluence: influenceZones.reduce((sum, zone) => sum + zone.efficiency, 0)
        };
    }

    getSystemStatus() {
        return {
            totalPlayers: this.state.players.size,
            activePolicies: this.state.activePolicies.size,
            influenceZones: this.state.influenceZones.size,
            playerBudgets: Array.from(this.state.playerBudgets.values()),
            systemUptime: Date.now() - this.startTime || Date.now()
        };
    }

    // Get effects that should be applied to the economic engine
    getCurrentEffects() {
        const effects = [];

        // Collect policy effects
        for (const policy of this.state.activePolicies.values()) {
            if (policy.status === 'active') {
                effects.push(...policy.effects);
            }
        }

        // Collect infrastructure effects
        for (const zone of this.state.influenceZones.values()) {
            if (zone.active && zone.type === 'infrastructure') {
                effects.push({
                    type: 'regional_efficiency_modifier',
                    value: zone.efficiency,
                    location: zone.center,
                    radius: zone.radius,
                    playerId: zone.playerId
                });
            }
        }

        return effects;
    }
}

module.exports = PlayerControlEngine;
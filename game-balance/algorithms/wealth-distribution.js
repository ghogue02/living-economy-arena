/**
 * Wealth Distribution Algorithm
 * Prevents extreme inequality and ensures fair economic opportunities
 */

const Decimal = require('decimal.js');
const EventEmitter = require('eventemitter3');

class WealthDistributionSystem extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Wealth inequality thresholds
            maxGiniCoefficient: config.maxGiniCoefficient || 0.7, // Above this triggers intervention
            targetGiniCoefficient: config.targetGiniCoefficient || 0.4, // Ideal inequality level
            
            // Progressive taxation rates
            wealthTaxBrackets: config.wealthTaxBrackets || [
                { threshold: 0, rate: 0.0 },           // No tax on basic wealth
                { threshold: 10000, rate: 0.01 },      // 1% on moderate wealth
                { threshold: 100000, rate: 0.02 },     // 2% on high wealth
                { threshold: 1000000, rate: 0.05 },    // 5% on very high wealth
                { threshold: 10000000, rate: 0.1 }     // 10% on extreme wealth
            ],
            
            // Universal Basic Assets (UBA)
            basicAssetAllocation: config.basicAssetAllocation || 1000,
            ubaRefreshRate: config.ubaRefreshRate || 86400000, // 24 hours in ms
            
            // Wealth concentration limits
            maxWealthPercentage: config.maxWealthPercentage || 0.05, // Max 5% of total wealth per agent
            concentrationThreshold: config.concentrationThreshold || 0.1, // Top 10% wealth threshold
            
            // Redistribution mechanisms
            redistributionPool: config.redistributionPool || 0.0,
            redistributionRate: config.redistributionRate || 0.1, // 10% of taxes redistributed immediately
            
            ...config
        };

        this.state = {
            totalWealth: new Decimal(0),
            wealthDistribution: new Map(),
            giniCoefficient: 0,
            lastUBADistribution: 0,
            redistributionPool: new Decimal(0),
            interventionHistory: [],
            wealthStats: {
                median: 0,
                mean: 0,
                top1Percent: 0,
                top10Percent: 0,
                bottom50Percent: 0
            }
        };

        this.agents = new Map();
        this.interventionCooldown = new Map();
    }

    // Register agent for wealth tracking
    registerAgent(agentId, initialWealth = 0) {
        this.agents.set(agentId, {
            id: agentId,
            wealth: new Decimal(initialWealth),
            lastTaxation: Date.now(),
            ubaEligible: true,
            interventionCount: 0,
            wealthHistory: [{ timestamp: Date.now(), wealth: initialWealth }]
        });

        this.updateWealthDistribution();
        return true;
    }

    // Update agent wealth
    updateAgentWealth(agentId, newWealth) {
        const agent = this.agents.get(agentId);
        if (!agent) return false;

        const oldWealth = agent.wealth;
        agent.wealth = new Decimal(newWealth);
        
        // Track wealth history
        agent.wealthHistory.push({
            timestamp: Date.now(),
            wealth: newWealth,
            change: newWealth - oldWealth.toNumber()
        });

        // Keep only last 100 entries
        if (agent.wealthHistory.length > 100) {
            agent.wealthHistory.shift();
        }

        this.updateWealthDistribution();
        this.checkWealthConcentration(agentId);
        
        return true;
    }

    // Calculate current wealth distribution and Gini coefficient
    updateWealthDistribution() {
        const wealthValues = Array.from(this.agents.values())
            .map(agent => agent.wealth.toNumber())
            .sort((a, b) => a - b);

        if (wealthValues.length === 0) return;

        // Calculate total wealth
        this.state.totalWealth = wealthValues.reduce((sum, wealth) => sum.plus(wealth), new Decimal(0));

        // Calculate Gini coefficient
        this.state.giniCoefficient = this.calculateGiniCoefficient(wealthValues);

        // Calculate wealth statistics
        this.updateWealthStatistics(wealthValues);

        // Check if intervention is needed
        this.checkInequalityIntervention();
    }

    calculateGiniCoefficient(wealthValues) {
        const n = wealthValues.length;
        if (n === 0) return 0;

        let sumOfDifferences = 0;
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                sumOfDifferences += Math.abs(wealthValues[i] - wealthValues[j]);
            }
        }

        const meanWealth = wealthValues.reduce((a, b) => a + b, 0) / n;
        return sumOfDifferences / (2 * n * n * meanWealth);
    }

    updateWealthStatistics(wealthValues) {
        const n = wealthValues.length;
        if (n === 0) return;

        this.state.wealthStats.median = n % 2 === 0 
            ? (wealthValues[n/2 - 1] + wealthValues[n/2]) / 2
            : wealthValues[Math.floor(n/2)];

        this.state.wealthStats.mean = wealthValues.reduce((a, b) => a + b, 0) / n;

        // Top percentiles
        const top1Index = Math.floor(n * 0.99);
        const top10Index = Math.floor(n * 0.9);
        const bottom50Index = Math.floor(n * 0.5);

        this.state.wealthStats.top1Percent = wealthValues.slice(top1Index).reduce((a, b) => a + b, 0);
        this.state.wealthStats.top10Percent = wealthValues.slice(top10Index).reduce((a, b) => a + b, 0);
        this.state.wealthStats.bottom50Percent = wealthValues.slice(0, bottom50Index).reduce((a, b) => a + b, 0);
    }

    // Check if wealth inequality requires intervention
    checkInequalityIntervention() {
        if (this.state.giniCoefficient > this.config.maxGiniCoefficient) {
            this.executeWealthRedistribution();
        }

        // Check for Universal Basic Assets distribution
        if (Date.now() - this.state.lastUBADistribution > this.config.ubaRefreshRate) {
            this.distributeUniversalBasicAssets();
        }
    }

    // Execute progressive wealth taxation and redistribution
    executeWealthRedistribution() {
        let totalTaxes = new Decimal(0);
        const taxActions = [];

        for (const [agentId, agent] of this.agents) {
            const wealth = agent.wealth;
            const tax = this.calculateProgressiveTax(wealth);

            if (tax.gt(0)) {
                agent.wealth = agent.wealth.minus(tax);
                totalTaxes = totalTaxes.plus(tax);
                
                taxActions.push({
                    agentId,
                    previousWealth: wealth.plus(tax).toNumber(),
                    newWealth: agent.wealth.toNumber(),
                    taxAmount: tax.toNumber()
                });
            }
        }

        // Add to redistribution pool
        this.state.redistributionPool = this.state.redistributionPool.plus(totalTaxes);

        // Immediate redistribution
        const immediateRedistribution = totalTaxes.mul(this.config.redistributionRate);
        this.redistributeWealth(immediateRedistribution);

        // Log intervention
        this.state.interventionHistory.push({
            timestamp: Date.now(),
            type: 'progressive_taxation',
            giniCoefficient: this.state.giniCoefficient,
            totalTaxes: totalTaxes.toNumber(),
            redistributed: immediateRedistribution.toNumber(),
            affectedAgents: taxActions.length
        });

        this.emit('wealth_redistribution', {
            totalTaxes: totalTaxes.toNumber(),
            redistributed: immediateRedistribution.toNumber(),
            giniCoefficient: this.state.giniCoefficient,
            actions: taxActions
        });

        // Update distribution after intervention
        this.updateWealthDistribution();
    }

    calculateProgressiveTax(wealth) {
        let tax = new Decimal(0);
        let remainingWealth = wealth;

        for (let i = this.config.wealthTaxBrackets.length - 1; i >= 0; i--) {
            const bracket = this.config.wealthTaxBrackets[i];
            
            if (wealth.gt(bracket.threshold)) {
                const taxableInBracket = remainingWealth.minus(bracket.threshold);
                const bracketTax = taxableInBracket.mul(bracket.rate);
                tax = tax.plus(bracketTax);
                remainingWealth = new Decimal(bracket.threshold);
            }
        }

        return tax;
    }

    // Redistribute wealth to lower-wealth agents
    redistributeWealth(amount) {
        const eligibleAgents = Array.from(this.agents.values())
            .filter(agent => agent.wealth.lt(this.state.wealthStats.median))
            .sort((a, b) => a.wealth.toNumber() - b.wealth.toNumber());

        if (eligibleAgents.length === 0) return;

        const perAgentAmount = amount.div(eligibleAgents.length);

        eligibleAgents.forEach(agent => {
            agent.wealth = agent.wealth.plus(perAgentAmount);
        });

        this.state.redistributionPool = this.state.redistributionPool.minus(amount);
    }

    // Distribute Universal Basic Assets to all agents
    distributeUniversalBasicAssets() {
        const distributionAmount = new Decimal(this.config.basicAssetAllocation);
        
        for (const [agentId, agent] of this.agents) {
            if (agent.ubaEligible) {
                agent.wealth = agent.wealth.plus(distributionAmount);
            }
        }

        this.state.lastUBADistribution = Date.now();
        
        this.emit('uba_distribution', {
            amount: distributionAmount.toNumber(),
            recipients: this.agents.size,
            timestamp: Date.now()
        });

        this.updateWealthDistribution();
    }

    // Check for excessive wealth concentration
    checkWealthConcentration(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) return;

        const wealthPercentage = agent.wealth.div(this.state.totalWealth).toNumber();
        
        if (wealthPercentage > this.config.maxWealthPercentage) {
            this.executeWealthCap(agentId, wealthPercentage);
        }
    }

    // Enforce wealth concentration limits
    executeWealthCap(agentId, currentPercentage) {
        const agent = this.agents.get(agentId);
        if (!agent) return;

        const maxAllowedWealth = this.state.totalWealth.mul(this.config.maxWealthPercentage);
        const excessWealth = agent.wealth.minus(maxAllowedWealth);

        if (excessWealth.gt(0)) {
            agent.wealth = maxAllowedWealth;
            this.state.redistributionPool = this.state.redistributionPool.plus(excessWealth);

            // Redistribute excess immediately
            this.redistributeWealth(excessWealth.mul(0.8)); // Redistribute 80%, keep 20% for future

            this.state.interventionHistory.push({
                timestamp: Date.now(),
                type: 'wealth_cap',
                agentId,
                previousWealth: agent.wealth.plus(excessWealth).toNumber(),
                newWealth: agent.wealth.toNumber(),
                cappedAmount: excessWealth.toNumber(),
                wealthPercentage: currentPercentage
            });

            this.emit('wealth_cap_applied', {
                agentId,
                cappedAmount: excessWealth.toNumber(),
                wealthPercentage: currentPercentage
            });
        }
    }

    // Get wealth distribution metrics
    getWealthMetrics() {
        return {
            giniCoefficient: this.state.giniCoefficient,
            totalWealth: this.state.totalWealth.toNumber(),
            wealthStats: this.state.wealthStats,
            redistributionPool: this.state.redistributionPool.toNumber(),
            interventionHistory: this.state.interventionHistory.slice(-10),
            agentCount: this.agents.size,
            inequalityStatus: this.getInequalityStatus()
        };
    }

    getInequalityStatus() {
        if (this.state.giniCoefficient > this.config.maxGiniCoefficient) {
            return 'EXCESSIVE_INEQUALITY';
        } else if (this.state.giniCoefficient > this.config.targetGiniCoefficient) {
            return 'HIGH_INEQUALITY';
        } else if (this.state.giniCoefficient < 0.2) {
            return 'LOW_INEQUALITY';
        } else {
            return 'BALANCED';
        }
    }

    // Get individual agent wealth info
    getAgentWealthInfo(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) return null;

        const wealthPercentile = this.calculateWealthPercentile(agent.wealth);
        const wealthRank = this.calculateWealthRank(agentId);

        return {
            agentId,
            currentWealth: agent.wealth.toNumber(),
            wealthPercentile,
            wealthRank,
            wealthHistory: agent.wealthHistory.slice(-10),
            ubaEligible: agent.ubaEligible,
            interventionCount: agent.interventionCount,
            nextTaxLiability: this.calculateProgressiveTax(agent.wealth).toNumber()
        };
    }

    calculateWealthPercentile(wealth) {
        const wealthValues = Array.from(this.agents.values())
            .map(agent => agent.wealth.toNumber())
            .sort((a, b) => a - b);

        const position = wealthValues.findIndex(w => w >= wealth.toNumber());
        return position / wealthValues.length;
    }

    calculateWealthRank(agentId) {
        const wealthValues = Array.from(this.agents.values())
            .map(agent => ({ id: agent.id, wealth: agent.wealth.toNumber() }))
            .sort((a, b) => b.wealth - a.wealth);

        return wealthValues.findIndex(agent => agent.id === agentId) + 1;
    }

    // Reset wealth distribution (emergency intervention)
    executeEconomicReset(resetType = 'partial') {
        const resetActions = [];

        switch (resetType) {
            case 'partial':
                // Reduce extreme wealth by 50%, boost bottom 50%
                this.executePartialReset(resetActions);
                break;
            case 'complete':
                // Reset all agents to basic allocation
                this.executeCompleteReset(resetActions);
                break;
            case 'progressive':
                // Gradual wealth leveling over time
                this.executeProgressiveReset(resetActions);
                break;
        }

        this.state.interventionHistory.push({
            timestamp: Date.now(),
            type: 'economic_reset',
            resetType,
            affectedAgents: resetActions.length,
            totalWealthBefore: this.state.totalWealth.toNumber()
        });

        this.updateWealthDistribution();
        
        this.emit('economic_reset', {
            resetType,
            actions: resetActions,
            newGiniCoefficient: this.state.giniCoefficient
        });
    }

    executePartialReset(resetActions) {
        const medianWealth = this.state.wealthStats.median;

        for (const [agentId, agent] of this.agents) {
            const currentWealth = agent.wealth.toNumber();
            let newWealth = currentWealth;

            if (currentWealth > medianWealth * 5) {
                // Reduce extreme wealth
                newWealth = currentWealth * 0.5;
            } else if (currentWealth < medianWealth * 0.5) {
                // Boost low wealth
                newWealth = medianWealth * 0.5;
            }

            if (newWealth !== currentWealth) {
                agent.wealth = new Decimal(newWealth);
                resetActions.push({
                    agentId,
                    previousWealth: currentWealth,
                    newWealth,
                    adjustment: newWealth - currentWealth
                });
            }
        }
    }

    executeCompleteReset(resetActions) {
        const baseAllocation = this.config.basicAssetAllocation * 5; // 5x UBA as reset amount

        for (const [agentId, agent] of this.agents) {
            const currentWealth = agent.wealth.toNumber();
            agent.wealth = new Decimal(baseAllocation);
            
            resetActions.push({
                agentId,
                previousWealth: currentWealth,
                newWealth: baseAllocation,
                adjustment: baseAllocation - currentWealth
            });
        }
    }

    executeProgressiveReset(resetActions) {
        const targetWealth = this.state.wealthStats.mean;
        const adjustmentRate = 0.1; // 10% adjustment per reset

        for (const [agentId, agent] of this.agents) {
            const currentWealth = agent.wealth.toNumber();
            const difference = targetWealth - currentWealth;
            const adjustment = difference * adjustmentRate;
            const newWealth = currentWealth + adjustment;

            if (Math.abs(adjustment) > 1) { // Only adjust if meaningful
                agent.wealth = new Decimal(newWealth);
                resetActions.push({
                    agentId,
                    previousWealth: currentWealth,
                    newWealth,
                    adjustment
                });
            }
        }
    }
}

module.exports = WealthDistributionSystem;
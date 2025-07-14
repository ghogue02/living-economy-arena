/**
 * Inflation/Deflation Systems Based on Money Supply and Agent Behaviors
 * Advanced monetary policy simulation for AI-driven economies
 */

const Decimal = require('decimal.js');
const EventEmitter = require('eventemitter3');

class MonetaryPolicyEngine extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            baseInflationRate: config.baseInflationRate || 0.02, // 2% annual
            moneySupplyGrowthRate: config.moneySupplyGrowthRate || 0.03, // 3% annual
            velocityTarget: config.velocityTarget || 1.5,
            maxInflationRate: config.maxInflationRate || 0.15, // 15% max
            deflationThreshold: config.deflationThreshold || -0.01, // -1%
            interestRateBase: config.interestRateBase || 0.05, // 5% base rate
            quantitativeEasingThreshold: config.quantitativeEasingThreshold || 0.01,
            ...config
        };

        this.monetaryState = {
            currentInflationRate: new Decimal(this.config.baseInflationRate),
            moneySupply: new Decimal(config.initialMoneySupply || 10000000000), // $10B
            moneyVelocity: new Decimal(1.5),
            interestRate: new Decimal(this.config.interestRateBase),
            priceLevel: new Decimal(100), // Base price index = 100
            realGDP: new Decimal(1000000000), // $1B real GDP
            nominalGDP: new Decimal(1000000000), // $1B nominal GDP
            unemploymentRate: new Decimal(0.05), // 5%
            wageLevel: new Decimal(50000), // Average wage
            savingsRate: new Decimal(0.1), // 10% savings rate
            investmentRate: new Decimal(0.15), // 15% investment rate
            lastUpdate: Date.now()
        };

        this.inflationHistory = [];
        this.moneySupplyHistory = [];
        this.economicCycles = [];
        
        this.agentBehaviorMetrics = {
            spendingVelocity: 0,
            savingsPropensity: 0,
            investmentActivity: 0,
            borrowingDemand: 0,
            leverageRatio: 0
        };
    }

    /**
     * Update inflation based on money supply, velocity, and agent behaviors
     */
    updateInflation(marketData, agentBehaviors, economicIndicators) {
        const monetaryFactors = this.calculateMonetaryFactors(marketData);
        const behavioralFactors = this.calculateBehavioralInflationFactors(agentBehaviors);
        const demandSupplyPressure = this.calculateDemandSupplyPressure(marketData);
        
        // Apply Quantity Theory of Money: MV = PY
        const newInflationRate = this.calculateQuantityTheoryInflation(
            monetaryFactors,
            behavioralFactors,
            demandSupplyPressure
        );
        
        // Update money velocity based on agent activity
        this.updateMoneyVelocity(agentBehaviors);
        
        // Update interest rates based on inflation
        this.updateInterestRates();
        
        // Update price level
        this.updatePriceLevel();
        
        // Update GDP measures
        this.updateGDPMeasures(marketData);
        
        // Record history
        this.recordInflationHistory();
        
        // Check for monetary policy interventions
        this.checkMonetaryPolicyTriggers();
        
        this.monetaryState.lastUpdate = Date.now();
        
        // Emit inflation update
        this.emit('inflation_update', this.getMonetaryState());
        
        return this.monetaryState.currentInflationRate.toNumber();
    }

    /**
     * Calculate monetary factors contributing to inflation
     */
    calculateMonetaryFactors(marketData) {
        // Money supply growth rate
        const previousSupply = this.moneySupplyHistory.length > 0 
            ? new Decimal(this.moneySupplyHistory[this.moneySupplyHistory.length - 1].supply)
            : this.monetaryState.moneySupply;
        
        const supplyGrowthRate = this.monetaryState.moneySupply.minus(previousSupply)
            .div(previousSupply);
        
        // Velocity changes
        const velocityChange = this.calculateVelocityChange();
        
        // Credit expansion (simplified)
        const creditExpansion = this.calculateCreditExpansion();
        
        return {
            supplyGrowthRate: supplyGrowthRate.toNumber(),
            velocityChange: velocityChange.toNumber(),
            creditExpansion: creditExpansion.toNumber()
        };
    }

    /**
     * Calculate behavioral factors affecting inflation
     */
    calculateBehavioralInflationFactors(agentBehaviors) {
        let totalSpending = new Decimal(0);
        let totalSaving = new Decimal(0);
        let totalInvestment = new Decimal(0);
        let totalBorrowing = new Decimal(0);
        let activeAgents = 0;
        
        for (const [agentId, agent] of agentBehaviors) {
            if (!agent.isActive) continue;
            
            const behavior = agent.economicBehavior || {};
            totalSpending = totalSpending.plus(behavior.spending || 0);
            totalSaving = totalSaving.plus(behavior.saving || 0);
            totalInvestment = totalInvestment.plus(behavior.investment || 0);
            totalBorrowing = totalBorrowing.plus(behavior.borrowing || 0);
            activeAgents++;
        }
        
        if (activeAgents === 0) {
            return {
                spendingPressure: 0,
                savingsDrag: 0,
                investmentMultiplier: 1,
                leverageRisk: 0
            };
        }
        
        const avgSpending = totalSpending.div(activeAgents);
        const avgSaving = totalSaving.div(activeAgents);
        const avgInvestment = totalInvestment.div(activeAgents);
        const avgBorrowing = totalBorrowing.div(activeAgents);
        
        // Update metrics
        this.agentBehaviorMetrics = {
            spendingVelocity: avgSpending.toNumber(),
            savingsPropensity: avgSaving.div(avgSpending.plus(avgSaving)).toNumber(),
            investmentActivity: avgInvestment.toNumber(),
            borrowingDemand: avgBorrowing.toNumber(),
            leverageRatio: avgBorrowing.div(avgSpending.plus(1)).toNumber()
        };
        
        return {
            spendingPressure: Math.max(0, avgSpending.minus(100).div(100).toNumber()),
            savingsDrag: avgSaving.div(avgSpending.plus(avgSaving)).toNumber(),
            investmentMultiplier: Math.min(2, 1 + avgInvestment.div(1000).toNumber()),
            leverageRisk: this.agentBehaviorMetrics.leverageRatio
        };
    }

    /**
     * Calculate demand/supply pressure across markets
     */
    calculateDemandSupplyPressure(marketData) {
        let totalPressure = 0;
        let marketCount = 0;
        
        for (const [marketId, market] of marketData) {
            if (market.supply && market.demand) {
                const pressure = new Decimal(market.demand).div(market.supply).minus(1);
                totalPressure += pressure.toNumber();
                marketCount++;
            }
        }
        
        return marketCount > 0 ? totalPressure / marketCount : 0;
    }

    /**
     * Calculate inflation using Quantity Theory of Money (MV = PY)
     */
    calculateQuantityTheoryInflation(monetaryFactors, behavioralFactors, demandSupplyPressure) {
        // Base inflation from money supply growth
        let inflationRate = new Decimal(monetaryFactors.supplyGrowthRate);
        
        // Add velocity effects
        inflationRate = inflationRate.plus(monetaryFactors.velocityChange);
        
        // Add behavioral spending pressure
        inflationRate = inflationRate.plus(behavioralFactors.spendingPressure * 0.3);
        
        // Subtract savings drag
        inflationRate = inflationRate.minus(behavioralFactors.savingsDrag * 0.2);
        
        // Add investment multiplier effect
        inflationRate = inflationRate.mul(behavioralFactors.investmentMultiplier);
        
        // Add demand/supply pressure
        inflationRate = inflationRate.plus(demandSupplyPressure * 0.4);
        
        // Add leverage risk (credit-driven inflation)
        inflationRate = inflationRate.plus(behavioralFactors.leverageRisk * 0.25);
        
        // Apply base inflation rate as minimum
        inflationRate = inflationRate.plus(this.config.baseInflationRate);
        
        // Clamp to realistic bounds
        const clampedRate = Math.max(
            -0.1, // Max 10% deflation
            Math.min(this.config.maxInflationRate, inflationRate.toNumber())
        );
        
        // Apply smoothing (don't change too rapidly)
        const currentRate = this.monetaryState.currentInflationRate;
        const maxChange = 0.005; // Max 0.5% change per update
        const change = clampedRate - currentRate.toNumber();
        const smoothedChange = Math.max(-maxChange, Math.min(maxChange, change));
        
        this.monetaryState.currentInflationRate = currentRate.plus(smoothedChange);
        
        return this.monetaryState.currentInflationRate;
    }

    /**
     * Update money velocity based on agent transaction frequency
     */
    updateMoneyVelocity(agentBehaviors) {
        let totalTransactions = 0;
        let totalWealth = new Decimal(0);
        let activeAgents = 0;
        
        for (const [agentId, agent] of agentBehaviors) {
            if (!agent.isActive) continue;
            
            const transactions = agent.transactionCount || 0;
            const wealth = new Decimal(agent.wealth || 1000);
            
            totalTransactions += transactions;
            totalWealth = totalWealth.plus(wealth);
            activeAgents++;
        }
        
        if (activeAgents > 0 && totalWealth.gt(0)) {
            // Velocity = (Total Transactions * Average Transaction Size) / Money Supply
            const avgTransactionSize = totalWealth.div(activeAgents).div(10); // Simplified
            const nominalTransactionVolume = new Decimal(totalTransactions).mul(avgTransactionSize);
            const newVelocity = nominalTransactionVolume.div(this.monetaryState.moneySupply);
            
            // Smooth velocity changes
            this.monetaryState.moneyVelocity = this.monetaryState.moneyVelocity.mul(0.9)
                .plus(newVelocity.mul(0.1));
        }
    }

    /**
     * Calculate velocity change
     */
    calculateVelocityChange() {
        const targetVelocity = new Decimal(this.config.velocityTarget);
        return this.monetaryState.moneyVelocity.minus(targetVelocity).div(targetVelocity);
    }

    /**
     * Calculate credit expansion effects
     */
    calculateCreditExpansion() {
        // Simplified credit expansion based on borrowing demand
        const borrowingRatio = this.agentBehaviorMetrics.borrowingDemand / 1000;
        return Math.min(0.1, borrowingRatio * 0.5); // Max 10% credit expansion effect
    }

    /**
     * Update interest rates based on inflation and economic conditions
     */
    updateInterestRates() {
        // Taylor Rule: r = r* + π + 0.5(π - π*) + 0.5(y - y*)
        const realInterestRate = new Decimal(0.02); // 2% real rate
        const inflationTarget = new Decimal(this.config.baseInflationRate);
        const outputGap = this.calculateOutputGap();
        
        const newInterestRate = realInterestRate
            .plus(this.monetaryState.currentInflationRate)
            .plus(this.monetaryState.currentInflationRate.minus(inflationTarget).mul(0.5))
            .plus(outputGap.mul(0.5));
        
        // Smooth interest rate changes
        this.monetaryState.interestRate = this.monetaryState.interestRate.mul(0.8)
            .plus(newInterestRate.mul(0.2));
        
        // Clamp interest rates
        this.monetaryState.interestRate = new Decimal(Math.max(0, 
            Math.min(0.2, this.monetaryState.interestRate.toNumber())));
    }

    /**
     * Calculate output gap (simplified)
     */
    calculateOutputGap() {
        // Simplified: assume potential GDP grows at 3% annually
        const potentialGDP = this.monetaryState.realGDP.mul(1.03); // Simplified
        return this.monetaryState.realGDP.minus(potentialGDP).div(potentialGDP);
    }

    /**
     * Update price level based on inflation
     */
    updatePriceLevel() {
        const inflationFactor = new Decimal(1).plus(this.monetaryState.currentInflationRate.div(525600)); // Per tick
        this.monetaryState.priceLevel = this.monetaryState.priceLevel.mul(inflationFactor);
    }

    /**
     * Update GDP measures
     */
    updateGDPMeasures(marketData) {
        // Calculate nominal GDP from market activity
        let nominalGDP = new Decimal(0);
        for (const [marketId, market] of marketData) {
            const marketValue = new Decimal(market.currentPrice || 1).mul(market.totalVolume || 0);
            nominalGDP = nominalGDP.plus(marketValue);
        }
        
        // Smooth GDP changes
        this.monetaryState.nominalGDP = this.monetaryState.nominalGDP.mul(0.9)
            .plus(nominalGDP.mul(0.1));
        
        // Real GDP = Nominal GDP / Price Level
        this.monetaryState.realGDP = this.monetaryState.nominalGDP.div(this.monetaryState.priceLevel.div(100));
    }

    /**
     * Record inflation history
     */
    recordInflationHistory() {
        this.inflationHistory.push({
            timestamp: Date.now(),
            inflationRate: this.monetaryState.currentInflationRate.toNumber(),
            priceLevel: this.monetaryState.priceLevel.toNumber(),
            interestRate: this.monetaryState.interestRate.toNumber(),
            moneyVelocity: this.monetaryState.moneyVelocity.toNumber()
        });
        
        this.moneySupplyHistory.push({
            timestamp: Date.now(),
            supply: this.monetaryState.moneySupply.toNumber(),
            realGDP: this.monetaryState.realGDP.toNumber(),
            nominalGDP: this.monetaryState.nominalGDP.toNumber()
        });
        
        // Keep only last 1000 entries
        if (this.inflationHistory.length > 1000) {
            this.inflationHistory.shift();
        }
        if (this.moneySupplyHistory.length > 1000) {
            this.moneySupplyHistory.shift();
        }
    }

    /**
     * Check for monetary policy interventions
     */
    checkMonetaryPolicyTriggers() {
        const inflation = this.monetaryState.currentInflationRate.toNumber();
        
        // Hyperinflation intervention
        if (inflation > 0.1) { // 10% inflation
            this.triggerMonetaryTightening();
        }
        
        // Deflationary spiral intervention
        if (inflation < this.config.deflationThreshold) {
            this.triggerQuantitativeEasing();
        }
        
        // Unemployment-based intervention
        if (this.monetaryState.unemploymentRate.gt(0.08)) { // 8% unemployment
            this.triggerExpansionaryPolicy();
        }
    }

    /**
     * Trigger monetary tightening
     */
    triggerMonetaryTightening() {
        // Reduce money supply growth
        const reduction = this.monetaryState.moneySupply.mul(0.01); // 1% reduction
        this.monetaryState.moneySupply = this.monetaryState.moneySupply.minus(reduction);
        
        // Increase interest rates
        this.monetaryState.interestRate = this.monetaryState.interestRate.mul(1.1);
        
        this.emit('monetary_policy', {
            type: 'tightening',
            reason: 'high_inflation',
            magnitude: 0.01,
            newSupply: this.monetaryState.moneySupply.toString(),
            newRate: this.monetaryState.interestRate.toString()
        });
    }

    /**
     * Trigger quantitative easing
     */
    triggerQuantitativeEasing() {
        // Increase money supply
        const increase = this.monetaryState.moneySupply.mul(0.05); // 5% increase
        this.monetaryState.moneySupply = this.monetaryState.moneySupply.plus(increase);
        
        // Lower interest rates
        this.monetaryState.interestRate = this.monetaryState.interestRate.mul(0.9);
        
        this.emit('monetary_policy', {
            type: 'quantitative_easing',
            reason: 'deflation_risk',
            magnitude: 0.05,
            newSupply: this.monetaryState.moneySupply.toString(),
            newRate: this.monetaryState.interestRate.toString()
        });
    }

    /**
     * Trigger expansionary policy
     */
    triggerExpansionaryPolicy() {
        // Moderate money supply increase
        const increase = this.monetaryState.moneySupply.mul(0.02); // 2% increase
        this.monetaryState.moneySupply = this.monetaryState.moneySupply.plus(increase);
        
        this.emit('monetary_policy', {
            type: 'expansionary',
            reason: 'high_unemployment',
            magnitude: 0.02,
            newSupply: this.monetaryState.moneySupply.toString()
        });
    }

    /**
     * Get current monetary state
     */
    getMonetaryState() {
        return {
            currentInflationRate: this.monetaryState.currentInflationRate.toNumber(),
            moneySupply: this.monetaryState.moneySupply.toString(),
            moneyVelocity: this.monetaryState.moneyVelocity.toNumber(),
            interestRate: this.monetaryState.interestRate.toNumber(),
            priceLevel: this.monetaryState.priceLevel.toNumber(),
            realGDP: this.monetaryState.realGDP.toString(),
            nominalGDP: this.monetaryState.nominalGDP.toString(),
            unemploymentRate: this.monetaryState.unemploymentRate.toNumber(),
            agentBehaviorMetrics: this.agentBehaviorMetrics,
            lastUpdate: this.monetaryState.lastUpdate
        };
    }

    /**
     * Get inflation history
     */
    getInflationHistory(points = 100) {
        return this.inflationHistory.slice(-points);
    }

    /**
     * Get money supply history
     */
    getMoneySupplyHistory(points = 100) {
        return this.moneySupplyHistory.slice(-points);
    }

    /**
     * Manual monetary policy adjustment
     */
    adjustMonetaryPolicy(policyChange) {
        if (policyChange.moneySupplyChange) {
            const change = this.monetaryState.moneySupply.mul(policyChange.moneySupplyChange);
            this.monetaryState.moneySupply = this.monetaryState.moneySupply.plus(change);
        }
        
        if (policyChange.interestRateChange) {
            this.monetaryState.interestRate = this.monetaryState.interestRate.plus(policyChange.interestRateChange);
        }
        
        this.emit('manual_policy_adjustment', policyChange);
    }
}

module.exports = MonetaryPolicyEngine;
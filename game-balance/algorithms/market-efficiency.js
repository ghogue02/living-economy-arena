/**
 * Market Efficiency Calculator
 * Ensures fair pricing, optimal liquidity, and efficient price discovery
 */

const Decimal = require('decimal.js');
const EventEmitter = require('eventemitter3');

class MarketEfficiencyCalculator extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Price efficiency thresholds
            maxPriceDeviation: config.maxPriceDeviation || 0.05, // 5% max deviation from fair value
            minLiquidityDepth: config.minLiquidityDepth || 100000, // Minimum market depth
            maxSpreadPercentage: config.maxSpreadPercentage || 0.02, // 2% max bid-ask spread
            
            // Market depth requirements
            minOrderBookLevels: config.minOrderBookLevels || 10,
            liquidityDistributionThreshold: config.liquidityDistributionThreshold || 0.3,
            
            // Price discovery metrics
            priceStabilityWindow: config.priceStabilityWindow || 300000, // 5 minutes
            maxVolatilityThreshold: config.maxVolatilityThreshold || 0.1, // 10% volatility threshold
            
            // Market maker requirements
            minimumMarketMakers: config.minimumMarketMakers || 5,
            marketMakerSpreadRequirement: config.marketMakerSpreadRequirement || 0.01,
            
            // Fair pricing parameters
            fundamentalPriceWeight: config.fundamentalPriceWeight || 0.7,
            marketPriceWeight: config.marketPriceWeight || 0.3,
            priceUpdateFrequency: config.priceUpdateFrequency || 1000, // 1 second
            
            ...config
        };

        this.state = {
            markets: new Map(),
            efficiencyMetrics: new Map(),
            fairValueModels: new Map(),
            liquidityProviders: new Map(),
            interventionHistory: [],
            overallEfficiencyScore: 0
        };

        this.priceHistories = new Map();
        this.volumeProfiles = new Map();
        this.liquidityAnalysis = new Map();
    }

    // Register market for efficiency monitoring
    registerMarket(marketId, marketConfig) {
        this.state.markets.set(marketId, {
            id: marketId,
            name: marketConfig.name,
            basePrice: new Decimal(marketConfig.basePrice),
            currentPrice: new Decimal(marketConfig.currentPrice || marketConfig.basePrice),
            fundamentalValue: new Decimal(marketConfig.fundamentalValue || marketConfig.basePrice),
            supply: new Decimal(marketConfig.supply || 1000000),
            demand: new Decimal(marketConfig.demand || 1000000),
            liquidityDepth: new Decimal(0),
            spreadPercentage: 0,
            volatility: 0,
            marketMakers: new Set(),
            orderBook: { bids: [], asks: [] },
            priceDeviation: 0,
            efficiencyScore: 1.0,
            lastUpdate: Date.now()
        });

        this.priceHistories.set(marketId, []);
        this.volumeProfiles.set(marketId, []);
        this.liquidityAnalysis.set(marketId, {
            totalLiquidity: new Decimal(0),
            bidLiquidity: new Decimal(0),
            askLiquidity: new Decimal(0),
            liquidityDistribution: [],
            marketMakerCount: 0
        });

        this.calculateFairValue(marketId);
        return true;
    }

    // Update market data and recalculate efficiency
    updateMarketData(marketId, marketData) {
        const market = this.state.markets.get(marketId);
        if (!market) return false;

        // Update market state
        if (marketData.currentPrice) {
            market.currentPrice = new Decimal(marketData.currentPrice);
        }
        if (marketData.supply) {
            market.supply = new Decimal(marketData.supply);
        }
        if (marketData.demand) {
            market.demand = new Decimal(marketData.demand);
        }
        if (marketData.orderBook) {
            market.orderBook = marketData.orderBook;
        }

        // Update price history
        const priceHistory = this.priceHistories.get(marketId);
        priceHistory.push({
            timestamp: Date.now(),
            price: market.currentPrice.toNumber(),
            volume: marketData.volume || 0,
            spread: marketData.spread || 0
        });

        // Keep only recent history
        if (priceHistory.length > 1000) {
            priceHistory.shift();
        }

        // Recalculate efficiency metrics
        this.calculateMarketEfficiency(marketId);
        market.lastUpdate = Date.now();

        return true;
    }

    // Calculate fair value based on fundamentals and market conditions
    calculateFairValue(marketId) {
        const market = this.state.markets.get(marketId);
        if (!market) return null;

        // Supply-demand based fundamental value
        const supplyDemandRatio = market.supply.div(market.demand);
        let fundamentalValue = market.basePrice;

        // Adjust for supply-demand imbalance
        if (supplyDemandRatio.lt(1)) {
            // High demand, low supply - price should be higher
            fundamentalValue = fundamentalValue.div(supplyDemandRatio);
        } else {
            // High supply, low demand - price should be lower
            fundamentalValue = fundamentalValue.mul(supplyDemandRatio.pow(-0.5));
        }

        // Historical price momentum factor
        const priceHistory = this.priceHistories.get(marketId);
        if (priceHistory.length > 10) {
            const recentPrices = priceHistory.slice(-10);
            const avgPrice = recentPrices.reduce((sum, p) => sum + p.price, 0) / recentPrices.length;
            const momentum = avgPrice / market.basePrice.toNumber();
            fundamentalValue = fundamentalValue.mul(Math.pow(momentum, 0.1)); // Small momentum adjustment
        }

        // Weighted fair value calculation
        const weightedFairValue = fundamentalValue.mul(this.config.fundamentalPriceWeight)
            .plus(market.currentPrice.mul(this.config.marketPriceWeight));

        market.fundamentalValue = weightedFairValue;
        this.state.fairValueModels.set(marketId, {
            fundamentalValue: fundamentalValue.toNumber(),
            weightedFairValue: weightedFairValue.toNumber(),
            supplyDemandRatio: supplyDemandRatio.toNumber(),
            calculatedAt: Date.now()
        });

        return weightedFairValue;
    }

    // Calculate comprehensive market efficiency metrics
    calculateMarketEfficiency(marketId) {
        const market = this.state.markets.get(marketId);
        if (!market) return null;

        const metrics = {
            priceEfficiency: this.calculatePriceEfficiency(marketId),
            liquidityEfficiency: this.calculateLiquidityEfficiency(marketId),
            spreadEfficiency: this.calculateSpreadEfficiency(marketId),
            volatilityEfficiency: this.calculateVolatilityEfficiency(marketId),
            depthEfficiency: this.calculateDepthEfficiency(marketId),
            marketMakerEfficiency: this.calculateMarketMakerEfficiency(marketId)
        };

        // Overall efficiency score (weighted average)
        const weights = {
            priceEfficiency: 0.3,
            liquidityEfficiency: 0.25,
            spreadEfficiency: 0.2,
            volatilityEfficiency: 0.1,
            depthEfficiency: 0.1,
            marketMakerEfficiency: 0.05
        };

        let efficiencyScore = 0;
        for (const [metric, value] of Object.entries(metrics)) {
            efficiencyScore += value * weights[metric];
        }

        market.efficiencyScore = efficiencyScore;
        this.state.efficiencyMetrics.set(marketId, {
            ...metrics,
            overallEfficiency: efficiencyScore,
            timestamp: Date.now()
        });

        // Check if intervention is needed
        this.checkEfficiencyIntervention(marketId, metrics);

        return metrics;
    }

    calculatePriceEfficiency(marketId) {
        const market = this.state.markets.get(marketId);
        const fairValue = market.fundamentalValue;

        // Price deviation from fair value
        const deviation = market.currentPrice.minus(fairValue).abs().div(fairValue);
        market.priceDeviation = deviation.toNumber();

        // Efficiency score (1.0 = perfect, 0.0 = completely inefficient)
        const maxDeviation = this.config.maxPriceDeviation;
        const efficiency = Math.max(0, 1 - (deviation.toNumber() / maxDeviation));

        return efficiency;
    }

    calculateLiquidityEfficiency(marketId) {
        const market = this.state.markets.get(marketId);
        const liquidityData = this.liquidityAnalysis.get(marketId);

        // Calculate total available liquidity
        let totalLiquidity = new Decimal(0);
        const { bids, asks } = market.orderBook;

        bids.forEach(bid => {
            totalLiquidity = totalLiquidity.plus(bid.quantity * bid.price);
        });
        asks.forEach(ask => {
            totalLiquidity = totalLiquidity.plus(ask.quantity * ask.price);
        });

        liquidityData.totalLiquidity = totalLiquidity;
        market.liquidityDepth = totalLiquidity;

        // Efficiency based on meeting minimum requirements
        const minLiquidity = this.config.minLiquidityDepth;
        const efficiency = Math.min(1.0, totalLiquidity.toNumber() / minLiquidity);

        return efficiency;
    }

    calculateSpreadEfficiency(marketId) {
        const market = this.state.markets.get(marketId);
        const { bids, asks } = market.orderBook;

        if (bids.length === 0 || asks.length === 0) {
            market.spreadPercentage = 1.0; // Maximum spread if no liquidity
            return 0;
        }

        const bestBid = Math.max(...bids.map(b => b.price));
        const bestAsk = Math.min(...asks.map(a => a.price));
        const spread = (bestAsk - bestBid) / bestBid;
        
        market.spreadPercentage = spread;

        // Efficiency score based on spread tightness
        const maxSpread = this.config.maxSpreadPercentage;
        const efficiency = Math.max(0, 1 - (spread / maxSpread));

        return efficiency;
    }

    calculateVolatilityEfficiency(marketId) {
        const priceHistory = this.priceHistories.get(marketId);
        if (priceHistory.length < 10) return 1.0;

        // Calculate recent volatility
        const recentPrices = priceHistory.slice(-20).map(p => p.price);
        const returns = [];
        for (let i = 1; i < recentPrices.length; i++) {
            returns.push((recentPrices[i] - recentPrices[i-1]) / recentPrices[i-1]);
        }

        const variance = returns.reduce((sum, r) => sum + r * r, 0) / returns.length;
        const volatility = Math.sqrt(variance);

        const market = this.state.markets.get(marketId);
        market.volatility = volatility;

        // Efficiency decreases with excessive volatility
        const maxVolatility = this.config.maxVolatilityThreshold;
        const efficiency = Math.max(0, 1 - (volatility / maxVolatility));

        return efficiency;
    }

    calculateDepthEfficiency(marketId) {
        const market = this.state.markets.get(marketId);
        const { bids, asks } = market.orderBook;

        const bidLevels = bids.length;
        const askLevels = asks.length;
        const totalLevels = bidLevels + askLevels;

        // Efficiency based on order book depth
        const minLevels = this.config.minOrderBookLevels;
        const depthEfficiency = Math.min(1.0, totalLevels / minLevels);

        // Also consider liquidity distribution across levels
        const liquidityConcentration = this.calculateLiquidityConcentration(marketId);
        const distributionEfficiency = 1 - liquidityConcentration;

        return (depthEfficiency + distributionEfficiency) / 2;
    }

    calculateLiquidityConcentration(marketId) {
        const market = this.state.markets.get(marketId);
        const { bids, asks } = market.orderBook;

        const allOrders = [...bids, ...asks];
        if (allOrders.length === 0) return 1.0;

        const totalVolume = allOrders.reduce((sum, order) => sum + order.quantity, 0);
        const volumeSquares = allOrders.reduce((sum, order) => {
            const share = order.quantity / totalVolume;
            return sum + share * share;
        }, 0);

        return volumeSquares; // Herfindahl index for liquidity concentration
    }

    calculateMarketMakerEfficiency(marketId) {
        const market = this.state.markets.get(marketId);
        const marketMakerCount = market.marketMakers.size;

        // Efficiency based on number of active market makers
        const minMakers = this.config.minimumMarketMakers;
        const efficiency = Math.min(1.0, marketMakerCount / minMakers);

        return efficiency;
    }

    // Check if market efficiency requires intervention
    checkEfficiencyIntervention(marketId, metrics) {
        const market = this.state.markets.get(marketId);
        const interventions = [];

        // Price efficiency intervention
        if (metrics.priceEfficiency < 0.5) {
            interventions.push({
                type: 'price_correction',
                severity: 1 - metrics.priceEfficiency,
                action: 'adjust_fair_value_weight'
            });
        }

        // Liquidity intervention
        if (metrics.liquidityEfficiency < 0.3) {
            interventions.push({
                type: 'liquidity_injection',
                severity: 1 - metrics.liquidityEfficiency,
                action: 'incentivize_market_makers'
            });
        }

        // Spread intervention
        if (metrics.spreadEfficiency < 0.4) {
            interventions.push({
                type: 'spread_tightening',
                severity: 1 - metrics.spreadEfficiency,
                action: 'market_maker_incentives'
            });
        }

        // Execute interventions if needed
        if (interventions.length > 0) {
            this.executeEfficiencyInterventions(marketId, interventions);
        }
    }

    // Execute market efficiency interventions
    executeEfficiencyInterventions(marketId, interventions) {
        const market = this.state.markets.get(marketId);
        const interventionResults = [];

        for (const intervention of interventions) {
            let result = null;

            switch (intervention.type) {
                case 'price_correction':
                    result = this.executePriceCorrection(marketId, intervention.severity);
                    break;
                case 'liquidity_injection':
                    result = this.executeLiquidityInjection(marketId, intervention.severity);
                    break;
                case 'spread_tightening':
                    result = this.executeSpreadTightening(marketId, intervention.severity);
                    break;
            }

            if (result) {
                interventionResults.push(result);
            }
        }

        // Log intervention
        this.state.interventionHistory.push({
            timestamp: Date.now(),
            marketId,
            interventions,
            results: interventionResults,
            preEfficiencyScore: market.efficiencyScore
        });

        this.emit('efficiency_intervention', {
            marketId,
            interventions,
            results: interventionResults
        });

        // Recalculate efficiency after intervention
        setTimeout(() => {
            this.calculateMarketEfficiency(marketId);
        }, 1000);
    }

    executePriceCorrection(marketId, severity) {
        const market = this.state.markets.get(marketId);
        
        // Adjust price toward fair value
        const fairValue = market.fundamentalValue;
        const priceDiff = fairValue.minus(market.currentPrice);
        const correctionFactor = severity * 0.5; // Max 50% correction
        
        const priceAdjustment = priceDiff.mul(correctionFactor);
        const newPrice = market.currentPrice.plus(priceAdjustment);
        
        // Apply gradual price correction
        market.currentPrice = newPrice;

        return {
            type: 'price_correction',
            oldPrice: market.currentPrice.minus(priceAdjustment).toNumber(),
            newPrice: newPrice.toNumber(),
            adjustment: priceAdjustment.toNumber(),
            severity
        };
    }

    executeLiquidityInjection(marketId, severity) {
        const market = this.state.markets.get(marketId);
        
        // Calculate needed liquidity injection
        const currentLiquidity = market.liquidityDepth;
        const targetLiquidity = new Decimal(this.config.minLiquidityDepth);
        const liquidityGap = targetLiquidity.minus(currentLiquidity);
        
        if (liquidityGap.gt(0)) {
            const injectionAmount = liquidityGap.mul(severity);
            
            // Add synthetic liquidity to order book
            this.addSyntheticLiquidity(marketId, injectionAmount);
            
            return {
                type: 'liquidity_injection',
                injectionAmount: injectionAmount.toNumber(),
                previousLiquidity: currentLiquidity.toNumber(),
                targetLiquidity: targetLiquidity.toNumber(),
                severity
            };
        }

        return null;
    }

    addSyntheticLiquidity(marketId, amount) {
        const market = this.state.markets.get(marketId);
        const currentPrice = market.currentPrice.toNumber();
        const spreadPercentage = market.spreadPercentage;

        // Add liquidity on both sides of the book
        const bidPrice = currentPrice * (1 - spreadPercentage / 2);
        const askPrice = currentPrice * (1 + spreadPercentage / 2);
        const liquidityPerSide = amount.div(2).toNumber();

        // Add synthetic orders (these would be from incentivized market makers)
        market.orderBook.bids.push({
            price: bidPrice,
            quantity: liquidityPerSide / bidPrice,
            type: 'synthetic_mm'
        });

        market.orderBook.asks.push({
            price: askPrice,
            quantity: liquidityPerSide / askPrice,
            type: 'synthetic_mm'
        });
    }

    executeSpreadTightening(marketId, severity) {
        const market = this.state.markets.get(marketId);
        const { bids, asks } = market.orderBook;

        if (bids.length === 0 || asks.length === 0) return null;

        const currentSpread = market.spreadPercentage;
        const targetSpread = this.config.maxSpreadPercentage;
        const spreadReduction = (currentSpread - targetSpread) * severity * 0.5;

        // Adjust bid/ask prices to tighten spread
        const midPrice = market.currentPrice.toNumber();
        const newSpread = Math.max(targetSpread, currentSpread - spreadReduction);

        // Update order book prices
        bids.forEach(bid => {
            if (bid.type === 'synthetic_mm') {
                bid.price = midPrice * (1 - newSpread / 2);
            }
        });

        asks.forEach(ask => {
            if (ask.type === 'synthetic_mm') {
                ask.price = midPrice * (1 + newSpread / 2);
            }
        });

        return {
            type: 'spread_tightening',
            oldSpread: currentSpread,
            newSpread: newSpread,
            reduction: spreadReduction,
            severity
        };
    }

    // Get market efficiency report
    getMarketEfficiencyReport(marketId = null) {
        if (marketId) {
            const market = this.state.markets.get(marketId);
            const metrics = this.state.efficiencyMetrics.get(marketId);
            const fairValue = this.state.fairValueModels.get(marketId);

            if (!market || !metrics) return null;

            return {
                marketId,
                currentPrice: market.currentPrice.toNumber(),
                fairValue: fairValue ? fairValue.weightedFairValue : null,
                priceDeviation: market.priceDeviation,
                efficiencyScore: market.efficiencyScore,
                metrics,
                liquidityDepth: market.liquidityDepth.toNumber(),
                spreadPercentage: market.spreadPercentage,
                volatility: market.volatility,
                marketMakers: market.marketMakers.size,
                lastUpdate: market.lastUpdate
            };
        }

        // Return overall efficiency report
        const marketReports = {};
        let totalEfficiency = 0;
        let marketCount = 0;

        for (const [id, market] of this.state.markets) {
            marketReports[id] = this.getMarketEfficiencyReport(id);
            totalEfficiency += market.efficiencyScore;
            marketCount++;
        }

        this.state.overallEfficiencyScore = marketCount > 0 ? totalEfficiency / marketCount : 0;

        return {
            overallEfficiencyScore: this.state.overallEfficiencyScore,
            marketCount,
            markets: marketReports,
            interventionHistory: this.state.interventionHistory.slice(-20),
            timestamp: Date.now()
        };
    }

    // Get efficiency recommendations
    getEfficiencyRecommendations(marketId) {
        const metrics = this.state.efficiencyMetrics.get(marketId);
        if (!metrics) return [];

        const recommendations = [];

        if (metrics.priceEfficiency < 0.7) {
            recommendations.push({
                type: 'price_efficiency',
                priority: 'high',
                action: 'Review fundamental value calculations and market data inputs',
                impact: 'Improved price discovery and reduced arbitrage opportunities'
            });
        }

        if (metrics.liquidityEfficiency < 0.6) {
            recommendations.push({
                type: 'liquidity_efficiency',
                priority: 'high',
                action: 'Incentivize market makers and improve order book depth',
                impact: 'Reduced slippage and improved trading experience'
            });
        }

        if (metrics.spreadEfficiency < 0.5) {
            recommendations.push({
                type: 'spread_efficiency',
                priority: 'medium',
                action: 'Implement market maker rebates and competition',
                impact: 'Tighter spreads and lower trading costs'
            });
        }

        if (metrics.volatilityEfficiency < 0.8) {
            recommendations.push({
                type: 'volatility_efficiency',
                priority: 'medium',
                action: 'Implement volatility dampening mechanisms',
                impact: 'More stable pricing and reduced market stress'
            });
        }

        return recommendations;
    }
}

module.exports = MarketEfficiencyCalculator;
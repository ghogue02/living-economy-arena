/**
 * Advanced Supply & Demand Algorithms
 * Realistic economic modeling for AI agent markets
 */

const Decimal = require('decimal.js');

class SupplyDemandEngine {
    constructor(config = {}) {
        this.config = {
            elasticity: config.elasticity || 1.2,
            dampingFactor: config.dampingFactor || 0.95,
            priceMemory: config.priceMemory || 0.1, // How much past prices influence current
            maxPriceChange: config.maxPriceChange || 0.5, // Maximum 50% price change per tick
            ...config
        };
    }

    /**
     * Calculate equilibrium price based on supply and demand curves
     */
    calculateEquilibriumPrice(supply, demand, currentPrice, marketConfig) {
        const supplyDecimal = new Decimal(supply);
        const demandDecimal = new Decimal(demand);
        const currentPriceDecimal = new Decimal(currentPrice);
        
        // Calculate basic supply/demand ratio
        const ratio = demandDecimal.div(supplyDecimal);
        
        // Apply price elasticity of demand
        const elasticity = marketConfig.elasticity || this.config.elasticity;
        const priceAdjustment = this.calculatePriceElasticity(ratio, elasticity);
        
        // Apply dampening to prevent extreme volatility
        const dampedAdjustment = priceAdjustment.mul(this.config.dampingFactor);
        
        // Calculate new price
        let newPrice = currentPriceDecimal.mul(new Decimal(1).plus(dampedAdjustment));
        
        // Apply maximum change constraint
        const maxChange = currentPriceDecimal.mul(this.config.maxPriceChange);
        const change = newPrice.minus(currentPriceDecimal);
        
        if (change.abs().gt(maxChange)) {
            newPrice = currentPriceDecimal.plus(change.gt(0) ? maxChange : maxChange.neg());
        }
        
        // Apply price memory (smoothing)
        newPrice = currentPriceDecimal.mul(this.config.priceMemory)
                  .plus(newPrice.mul(new Decimal(1).minus(this.config.priceMemory)));
        
        return {
            price: newPrice,
            ratio: ratio.toNumber(),
            adjustment: dampedAdjustment.toNumber(),
            elasticity: elasticity
        };
    }

    /**
     * Calculate price elasticity effect
     */
    calculatePriceElasticity(ratio, elasticity) {
        // More elastic goods have stronger price responses
        const baseAdjustment = ratio.minus(1); // 0 at equilibrium
        return baseAdjustment.mul(elasticity);
    }

    /**
     * Calculate supply curve based on production costs and capacity
     */
    calculateSupplyCurve(baseSupply, productionCost, capacity, agentProducers) {
        let totalSupply = new Decimal(baseSupply);
        
        // Each producer contributes based on their production function
        for (const producer of agentProducers) {
            const producerSupply = this.calculateProducerSupply(
                producer.capacity,
                producer.marginalCost,
                productionCost,
                producer.efficiency
            );
            totalSupply = totalSupply.plus(producerSupply);
        }
        
        // Apply capacity constraints
        const maxCapacity = new Decimal(capacity);
        if (totalSupply.gt(maxCapacity)) {
            totalSupply = maxCapacity;
        }
        
        return totalSupply;
    }

    /**
     * Calculate individual producer supply
     */
    calculateProducerSupply(capacity, marginalCost, marketPrice, efficiency = 1) {
        const profitMargin = new Decimal(marketPrice).minus(marginalCost).mul(efficiency);
        
        if (profitMargin.lte(0)) {
            return new Decimal(0); // No production if unprofitable
        }
        
        // Supply increases with profit margin, but with diminishing returns
        const supplyRatio = profitMargin.div(marketPrice);
        const supply = new Decimal(capacity).mul(supplyRatio.sqrt());
        
        return supply;
    }

    /**
     * Calculate demand curve based on consumer utility and wealth
     */
    calculateDemandCurve(baseDemand, averageWealth, priceLevel, necessity, agentConsumers) {
        let totalDemand = new Decimal(baseDemand);
        
        // Each consumer contributes based on their demand function
        for (const consumer of agentConsumers) {
            const consumerDemand = this.calculateConsumerDemand(
                consumer.wealth,
                consumer.utility,
                priceLevel,
                necessity,
                consumer.preferences
            );
            totalDemand = totalDemand.plus(consumerDemand);
        }
        
        return totalDemand;
    }

    /**
     * Calculate individual consumer demand
     */
    calculateConsumerDemand(wealth, utility, price, necessity, preferences = {}) {
        const wealthDecimal = new Decimal(wealth);
        const priceDecimal = new Decimal(price);
        const utilityDecimal = new Decimal(utility);
        
        // Price elasticity varies by necessity
        const priceElasticity = necessity > 0.8 ? 0.3 : 1.5; // Necessities are less elastic
        
        // Calculate affordability
        const affordabilityRatio = wealthDecimal.div(priceDecimal);
        
        // Calculate utility-based demand
        const utilityDemand = utilityDecimal.mul(affordabilityRatio);
        
        // Apply price elasticity
        const elasticDemand = utilityDemand.div(priceDecimal.pow(priceElasticity));
        
        // Apply preferences multiplier
        const preferenceMultiplier = preferences.multiplier || 1;
        
        return elasticDemand.mul(preferenceMultiplier);
    }

    /**
     * Calculate market clearing mechanism
     */
    calculateMarketClearing(supply, demand, currentPrice, marketConfig) {
        const equilibrium = this.calculateEquilibriumPrice(supply, demand, currentPrice, marketConfig);
        
        // Calculate actual traded quantity (minimum of supply and demand at equilibrium)
        const supplyAtPrice = this.getSupplyAtPrice(supply, equilibrium.price, marketConfig);
        const demandAtPrice = this.getDemandAtPrice(demand, equilibrium.price, marketConfig);
        
        const tradedQuantity = Decimal.min(supplyAtPrice, demandAtPrice);
        
        // Calculate market efficiency (how close to perfect clearing)
        const efficiency = tradedQuantity.div(Decimal.max(supplyAtPrice, demandAtPrice));
        
        return {
            clearingPrice: equilibrium.price,
            tradedQuantity: tradedQuantity,
            efficiency: efficiency.toNumber(),
            surplus: {
                consumer: this.calculateConsumerSurplus(demandAtPrice, equilibrium.price),
                producer: this.calculateProducerSurplus(supplyAtPrice, equilibrium.price)
            }
        };
    }

    /**
     * Calculate supply at a given price
     */
    getSupplyAtPrice(baseSupply, price, marketConfig) {
        // Supply curve: higher prices incentivize more production
        const supplyElasticity = marketConfig.supplyElasticity || 0.8;
        const priceMultiplier = new Decimal(price).div(marketConfig.basePrice || 1).pow(supplyElasticity);
        return new Decimal(baseSupply).mul(priceMultiplier);
    }

    /**
     * Calculate demand at a given price
     */
    getDemandAtPrice(baseDemand, price, marketConfig) {
        // Demand curve: higher prices reduce demand
        const demandElasticity = marketConfig.demandElasticity || 1.2;
        const priceMultiplier = new Decimal(marketConfig.basePrice || 1).div(price).pow(demandElasticity);
        return new Decimal(baseDemand).mul(priceMultiplier);
    }

    /**
     * Calculate consumer surplus
     */
    calculateConsumerSurplus(quantity, price) {
        // Simplified triangular approximation
        return quantity.mul(price).div(2);
    }

    /**
     * Calculate producer surplus
     */
    calculateProducerSurplus(quantity, price) {
        // Simplified triangular approximation
        return quantity.mul(price).div(2);
    }

    /**
     * Advanced market microstructure modeling
     */
    calculateOrderBookDynamics(buyOrders, sellOrders) {
        // Sort orders by price
        const sortedBuys = buyOrders.sort((a, b) => b.price - a.price);
        const sortedSells = sellOrders.sort((a, b) => a.price - b.price);
        
        // Calculate bid-ask spread
        const bestBid = sortedBuys[0]?.price || 0;
        const bestAsk = sortedSells[0]?.price || Infinity;
        const spread = bestAsk - bestBid;
        
        // Calculate market depth
        const bidDepth = sortedBuys.reduce((sum, order) => sum + order.quantity, 0);
        const askDepth = sortedSells.reduce((sum, order) => sum + order.quantity, 0);
        
        // Find matches and execute trades
        const trades = [];
        let buyIndex = 0;
        let sellIndex = 0;
        
        while (buyIndex < sortedBuys.length && sellIndex < sortedSells.length) {
            const buyOrder = sortedBuys[buyIndex];
            const sellOrder = sortedSells[sellIndex];
            
            if (buyOrder.price >= sellOrder.price) {
                // Trade occurs
                const tradeQuantity = Math.min(buyOrder.quantity, sellOrder.quantity);
                const tradePrice = (buyOrder.price + sellOrder.price) / 2; // Mid-point
                
                trades.push({
                    quantity: tradeQuantity,
                    price: tradePrice,
                    timestamp: Date.now()
                });
                
                buyOrder.quantity -= tradeQuantity;
                sellOrder.quantity -= tradeQuantity;
                
                if (buyOrder.quantity === 0) buyIndex++;
                if (sellOrder.quantity === 0) sellIndex++;
            } else {
                break; // No more matches possible
            }
        }
        
        return {
            trades,
            spread,
            bidDepth,
            askDepth,
            marketPrice: trades.length > 0 ? trades[trades.length - 1].price : (bestBid + bestAsk) / 2
        };
    }

    /**
     * Calculate price impact of large orders
     */
    calculatePriceImpact(orderSize, marketDepth, volatility) {
        // Kyle's lambda model approximation
        const lambda = volatility / Math.sqrt(marketDepth);
        return lambda * orderSize;
    }
}

module.exports = SupplyDemandEngine;
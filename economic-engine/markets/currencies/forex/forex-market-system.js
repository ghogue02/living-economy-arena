/**
 * PHASE 3 FOREX MARKET SYSTEM
 * Comprehensive forex trading with spot, forward, and futures markets
 */

const Decimal = require('decimal.js');
const EventEmitter = require('eventemitter3');

class ForexMarketSystem extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.spotMarket = new Map();
        this.forwardMarket = new Map();
        this.futuresMarket = new Map();
        this.orderBooks = new Map();
        this.marketMakers = new Map();
        this.tradingVolume = new Map();
        this.marketDepth = new Map();
        this.isActive = false;
        
        this.initialize();
    }

    async initialize() {
        console.log('🌐 Initializing Forex Market System...');
        
        this.initializeMarkets();
        this.initializeOrderBooks();
        this.initializeMarketMakers();
        this.setupTradingHours();
        
        console.log('✅ Forex Market System initialized');
    }

    initializeMarkets() {
        // Initialize spot markets for all currency pairs
        const currencies = [...this.config.majorCurrencies, ...this.config.emergingCurrencies, ...this.config.cryptocurrencies];
        
        for (let i = 0; i < currencies.length; i++) {
            for (let j = i + 1; j < currencies.length; j++) {
                const pair = `${currencies[i]}/${currencies[j]}`;
                
                // Spot market
                this.spotMarket.set(pair, {
                    pair,
                    bid: new Decimal(0),
                    ask: new Decimal(0),
                    spread: new Decimal(0),
                    volume: new Decimal(0),
                    lastPrice: new Decimal(0),
                    priceChange: new Decimal(0),
                    isActive: true,
                    tradingSession: this.getCurrentTradingSession(pair),
                    liquidityProviders: [],
                    lastUpdate: Date.now()
                });

                // Forward market (1M, 3M, 6M, 1Y)
                const forwardTenors = ['1M', '3M', '6M', '1Y'];
                forwardTenors.forEach(tenor => {
                    const forwardPair = `${pair}_${tenor}`;
                    this.forwardMarket.set(forwardPair, {
                        pair,
                        tenor,
                        maturityDate: this.calculateMaturityDate(tenor),
                        forwardRate: new Decimal(0),
                        swap: new Decimal(0),
                        volume: new Decimal(0),
                        openInterest: new Decimal(0),
                        isActive: true,
                        lastUpdate: Date.now()
                    });
                });

                // Futures market (quarterly contracts)
                const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
                quarters.forEach(quarter => {
                    const futuresSymbol = `${pair}_${quarter}${new Date().getFullYear()}`;
                    this.futuresMarket.set(futuresSymbol, {
                        symbol: futuresSymbol,
                        pair,
                        quarter,
                        expiryDate: this.calculateExpiryDate(quarter),
                        futuresPrice: new Decimal(0),
                        volume: new Decimal(0),
                        openInterest: new Decimal(0),
                        dailySettlement: new Decimal(0),
                        marginRequirement: new Decimal(0),
                        isActive: true,
                        lastUpdate: Date.now()
                    });
                });
            }
        }

        console.log(`📈 Initialized ${this.spotMarket.size} spot markets`);
        console.log(`📊 Initialized ${this.forwardMarket.size} forward markets`);
        console.log(`🔮 Initialized ${this.futuresMarket.size} futures markets`);
    }

    initializeOrderBooks() {
        // Create order books for each market
        for (const pair of this.spotMarket.keys()) {
            this.orderBooks.set(pair, {
                bids: [], // Array of {price, size, timestamp, orderId}
                asks: [], // Array of {price, size, timestamp, orderId}
                lastTrade: null,
                totalBidVolume: new Decimal(0),
                totalAskVolume: new Decimal(0),
                bestBid: null,
                bestAsk: null,
                spread: new Decimal(0),
                midPrice: new Decimal(0)
            });
        }
    }

    initializeMarketMakers() {
        // Create algorithmic market makers for each pair
        for (const pair of this.spotMarket.keys()) {
            this.marketMakers.set(pair, {
                pair,
                isActive: true,
                inventory: new Decimal(0),
                targetInventory: new Decimal(0),
                maxInventory: new Decimal(1000000),
                skew: new Decimal(0),
                
                // Pricing parameters
                baseSpread: this.getBaseSpread(pair),
                spreadMultiplier: 1.0,
                inventoryPenalty: 0.001,
                
                // Risk management
                maxPosition: new Decimal(5000000),
                stopLoss: 0.02,
                takeProfit: 0.01,
                
                // Performance metrics
                quotesProvided: 0,
                tradesExecuted: 0,
                pnl: new Decimal(0),
                lastUpdate: Date.now()
            });
        }
    }

    setupTradingHours() {
        // Forex markets are open 24/5, but activity varies by session
        setInterval(() => {
            this.updateTradingSessions();
        }, 60000); // Check every minute

        // Market maker updates
        setInterval(() => {
            this.updateMarketMakers();
        }, 1000); // Update every second

        // Calculate market depth
        setInterval(() => {
            this.calculateMarketDepth();
        }, 5000); // Every 5 seconds
    }

    async start() {
        this.isActive = true;
        
        // Start market maker algorithms
        for (const [pair, mm] of this.marketMakers) {
            mm.isActive = true;
            this.startMarketMaker(pair);
        }
        
        // Start order matching engine
        this.startOrderMatching();
        
        console.log('🚀 Forex markets are now active');
    }

    startMarketMaker(pair) {
        const mm = this.marketMakers.get(pair);
        if (!mm) return;

        // Provide continuous quotes
        setInterval(() => {
            if (mm.isActive && this.isActive) {
                this.updateMarketMakerQuotes(pair);
            }
        }, 100); // 10 times per second
    }

    updateMarketMakerQuotes(pair) {
        const mm = this.marketMakers.get(pair);
        const orderBook = this.orderBooks.get(pair);
        
        if (!mm || !orderBook) return;

        // Get theoretical fair value (simplified)
        const fairValue = this.calculateFairValue(pair);
        
        // Calculate inventory skew
        const inventorySkew = mm.inventory.div(mm.maxInventory).mul(mm.inventoryPenalty);
        
        // Calculate spread
        const spread = this.calculateSpread(pair);
        const halfSpread = spread.div(2);
        
        // Calculate bid/ask prices
        const bidPrice = fairValue.sub(halfSpread).sub(inventorySkew);
        const askPrice = fairValue.add(halfSpread).add(inventorySkew);
        
        // Determine quote sizes
        const bidSize = this.calculateQuoteSize(pair, 'bid');
        const askSize = this.calculateQuoteSize(pair, 'ask');
        
        // Remove old market maker quotes
        this.removeMarketMakerQuotes(pair);
        
        // Add new quotes
        this.addQuote(pair, 'bid', bidPrice, bidSize, `MM_${pair}_BID`);
        this.addQuote(pair, 'ask', askPrice, askSize, `MM_${pair}_ASK`);
        
        mm.quotesProvided++;
        mm.lastUpdate = Date.now();
    }

    calculateFairValue(pair) {
        // Use multiple sources for fair value calculation
        const orderBook = this.orderBooks.get(pair);
        
        if (orderBook.bestBid && orderBook.bestAsk) {
            return orderBook.bestBid.add(orderBook.bestAsk).div(2);
        }
        
        // Fallback to spot market price
        const spot = this.spotMarket.get(pair);
        return spot ? spot.lastPrice : new Decimal(1);
    }

    calculateSpread(pair) {
        const [base, quote] = pair.split('/');
        const baseSpread = this.getBaseSpread(pair);
        const mm = this.marketMakers.get(pair);
        
        // Adjust spread based on volatility, liquidity, and market conditions
        const volatilityMultiplier = this.getVolatilityMultiplier(pair);
        const liquidityMultiplier = this.getLiquidityMultiplier(pair);
        const sessionMultiplier = this.getSessionMultiplier(pair);
        
        return new Decimal(baseSpread)
            .mul(volatilityMultiplier)
            .mul(liquidityMultiplier)
            .mul(sessionMultiplier)
            .mul(mm.spreadMultiplier);
    }

    calculateQuoteSize(pair, side) {
        const mm = this.marketMakers.get(pair);
        const baseSize = this.getBaseQuoteSize(pair);
        
        // Adjust size based on inventory and risk
        let sizeMultiplier = 1.0;
        
        if (side === 'bid' && mm.inventory.gt(mm.targetInventory)) {
            sizeMultiplier *= 0.5; // Reduce bid size when long
        } else if (side === 'ask' && mm.inventory.lt(mm.targetInventory)) {
            sizeMultiplier *= 0.5; // Reduce ask size when short
        }
        
        return new Decimal(baseSize).mul(sizeMultiplier);
    }

    addQuote(pair, side, price, size, orderId) {
        const orderBook = this.orderBooks.get(pair);
        if (!orderBook) return;

        const quote = {
            price: new Decimal(price),
            size: new Decimal(size),
            timestamp: Date.now(),
            orderId,
            type: 'market_maker'
        };

        if (side === 'bid') {
            orderBook.bids.push(quote);
            orderBook.bids.sort((a, b) => b.price.cmp(a.price)); // Descending price
        } else {
            orderBook.asks.push(quote);
            orderBook.asks.sort((a, b) => a.price.cmp(b.price)); // Ascending price
        }

        this.updateOrderBookStats(pair);
    }

    removeMarketMakerQuotes(pair) {
        const orderBook = this.orderBooks.get(pair);
        if (!orderBook) return;

        // Remove old market maker quotes
        orderBook.bids = orderBook.bids.filter(order => !order.orderId.startsWith('MM_'));
        orderBook.asks = orderBook.asks.filter(order => !order.orderId.startsWith('MM_'));
    }

    updateOrderBookStats(pair) {
        const orderBook = this.orderBooks.get(pair);
        if (!orderBook) return;

        // Update best bid/ask
        orderBook.bestBid = orderBook.bids.length > 0 ? orderBook.bids[0].price : null;
        orderBook.bestAsk = orderBook.asks.length > 0 ? orderBook.asks[0].price : null;

        // Calculate spread and mid price
        if (orderBook.bestBid && orderBook.bestAsk) {
            orderBook.spread = orderBook.bestAsk.sub(orderBook.bestBid);
            orderBook.midPrice = orderBook.bestBid.add(orderBook.bestAsk).div(2);
        }

        // Calculate total volumes
        orderBook.totalBidVolume = orderBook.bids.reduce(
            (total, bid) => total.add(bid.size), 
            new Decimal(0)
        );
        orderBook.totalAskVolume = orderBook.asks.reduce(
            (total, ask) => total.add(ask.size), 
            new Decimal(0)
        );
    }

    startOrderMatching() {
        // Continuous order matching
        setInterval(() => {
            for (const pair of this.orderBooks.keys()) {
                this.matchOrders(pair);
            }
        }, 10); // Every 10ms for high-frequency matching
    }

    matchOrders(pair) {
        const orderBook = this.orderBooks.get(pair);
        if (!orderBook || !orderBook.bestBid || !orderBook.bestAsk) return;

        // Check if orders can be matched
        if (orderBook.bestBid.gte(orderBook.bestAsk)) {
            const bidOrder = orderBook.bids[0];
            const askOrder = orderBook.asks[0];
            
            // Determine trade price and size
            const tradePrice = askOrder.price; // Price improvement for buyer
            const tradeSize = Decimal.min(bidOrder.size, askOrder.size);
            
            // Execute trade
            this.executeTrade(pair, tradePrice, tradeSize, bidOrder, askOrder);
        }
    }

    executeTrade(pair, price, size, bidOrder, askOrder) {
        const trade = {
            pair,
            price: new Decimal(price),
            size: new Decimal(size),
            timestamp: Date.now(),
            buyOrderId: bidOrder.orderId,
            sellOrderId: askOrder.orderId,
            tradeId: `TRADE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };

        // Update order sizes
        bidOrder.size = bidOrder.size.sub(size);
        askOrder.size = askOrder.size.sub(size);

        // Remove filled orders
        const orderBook = this.orderBooks.get(pair);
        if (bidOrder.size.lte(0)) {
            orderBook.bids.shift();
        }
        if (askOrder.size.lte(0)) {
            orderBook.asks.shift();
        }

        // Update market data
        this.updateMarketData(pair, trade);
        
        // Update market maker inventory
        this.updateMarketMakerInventory(pair, trade);

        // Emit trade event
        this.emit('trade', trade);

        console.log(`💱 Trade executed: ${pair} ${size} @ ${price}`);
    }

    updateMarketData(pair, trade) {
        const spot = this.spotMarket.get(pair);
        if (!spot) return;

        const previousPrice = spot.lastPrice;
        spot.lastPrice = trade.price;
        spot.priceChange = trade.price.sub(previousPrice);
        spot.volume = spot.volume.add(trade.size);
        spot.lastUpdate = trade.timestamp;

        // Update trading volume tracking
        const today = new Date().toDateString();
        if (!this.tradingVolume.has(pair)) {
            this.tradingVolume.set(pair, new Map());
        }
        const pairVolume = this.tradingVolume.get(pair);
        const dailyVolume = pairVolume.get(today) || new Decimal(0);
        pairVolume.set(today, dailyVolume.add(trade.size));
    }

    updateMarketMakerInventory(pair, trade) {
        // Update market maker inventory based on trades
        for (const [mmPair, mm] of this.marketMakers) {
            if (mmPair === pair) {
                if (trade.sellOrderId.startsWith('MM_')) {
                    mm.inventory = mm.inventory.sub(trade.size);
                } else if (trade.buyOrderId.startsWith('MM_')) {
                    mm.inventory = mm.inventory.add(trade.size);
                }
                mm.tradesExecuted++;
            }
        }
    }

    calculateMarketDepth() {
        for (const [pair, orderBook] of this.orderBooks) {
            const depth = {
                pair,
                bids: this.calculateDepthLevels(orderBook.bids),
                asks: this.calculateDepthLevels(orderBook.asks),
                totalBidVolume: orderBook.totalBidVolume,
                totalAskVolume: orderBook.totalAskVolume,
                timestamp: Date.now()
            };
            
            this.marketDepth.set(pair, depth);
        }
    }

    calculateDepthLevels(orders) {
        const levels = [];
        let cumulativeSize = new Decimal(0);
        
        for (const order of orders.slice(0, 10)) { // Top 10 levels
            cumulativeSize = cumulativeSize.add(order.size);
            levels.push({
                price: order.price,
                size: order.size,
                cumulativeSize: new Decimal(cumulativeSize)
            });
        }
        
        return levels;
    }

    updateTradingSessions() {
        const currentHour = new Date().getUTCHours();
        
        for (const [pair, spot] of this.spotMarket) {
            spot.tradingSession = this.getCurrentTradingSession(pair, currentHour);
        }
    }

    getCurrentTradingSession(pair, hour = null) {
        const currentHour = hour || new Date().getUTCHours();
        const sessions = this.config.tradingHours;
        
        if (currentHour >= sessions.sydney.start || currentHour < sessions.sydney.end) {
            return 'sydney';
        } else if (currentHour >= sessions.tokyo.start && currentHour < sessions.tokyo.end) {
            return 'tokyo';
        } else if (currentHour >= sessions.london.start && currentHour < sessions.london.end) {
            return 'london';
        } else if (currentHour >= sessions.newYork.start && currentHour < sessions.newYork.end) {
            return 'newYork';
        }
        
        return 'closed';
    }

    // Forward market methods
    calculateForwardRate(pair, tenor) {
        const spot = this.getSpotRate(pair);
        const [base, quote] = pair.split('/');
        
        // Get interest rates
        const baseRate = this.getInterestRate(base);
        const quoteRate = this.getInterestRate(quote);
        
        // Calculate time to maturity in years
        const timeToMaturity = this.getTenorInYears(tenor);
        
        // Forward rate formula: Spot * (1 + quoteRate * time) / (1 + baseRate * time)
        const forwardRate = spot.mul(
            new Decimal(1).add(new Decimal(quoteRate).mul(timeToMaturity))
        ).div(
            new Decimal(1).add(new Decimal(baseRate).mul(timeToMaturity))
        );
        
        return forwardRate;
    }

    // Futures market methods
    calculateFuturesPrice(pair, quarter) {
        const spot = this.getSpotRate(pair);
        const timeToExpiry = this.getTimeToExpiry(quarter);
        const [base, quote] = pair.split('/');
        
        // Simplified futures pricing (cost of carry model)
        const baseRate = this.getInterestRate(base);
        const quoteRate = this.getInterestRate(quote);
        const carryRate = quoteRate - baseRate;
        
        return spot.mul(Math.exp(carryRate * timeToExpiry));
    }

    // Utility methods
    getBaseSpread(pair) {
        const [base, quote] = pair.split('/');
        const majorPairs = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF'];
        
        if (majorPairs.includes(pair)) {
            return 0.00001; // 0.1 pip
        } else if (this.config.majorCurrencies.includes(base) && this.config.majorCurrencies.includes(quote)) {
            return 0.00002; // 0.2 pip
        } else {
            return 0.0001; // 1 pip
        }
    }

    getVolatilityMultiplier(pair) {
        // Simplified volatility adjustment
        return 1.0 + Math.random() * 0.5;
    }

    getLiquidityMultiplier(pair) {
        // Adjust based on pair liquidity
        const [base, quote] = pair.split('/');
        if (this.config.majorCurrencies.includes(base) && this.config.majorCurrencies.includes(quote)) {
            return 1.0;
        }
        return 1.5;
    }

    getSessionMultiplier(pair) {
        const session = this.getCurrentTradingSession(pair);
        const multipliers = {
            sydney: 1.2,
            tokyo: 1.0,
            london: 0.8,
            newYork: 0.9,
            closed: 2.0
        };
        return multipliers[session] || 1.0;
    }

    getBaseQuoteSize(pair) {
        return 100000; // Standard lot size
    }

    getSpotRate(pair) {
        const spot = this.spotMarket.get(pair);
        return spot ? spot.lastPrice : new Decimal(1);
    }

    getInterestRate(currency) {
        // Simplified interest rate lookup
        const rates = {
            USD: 0.05, EUR: 0.04, GBP: 0.05, JPY: -0.001,
            CHF: 0.015, CAD: 0.045, AUD: 0.04
        };
        return rates[currency] || 0.03;
    }

    getTenorInYears(tenor) {
        const tenors = {
            '1M': 1/12,
            '3M': 3/12,
            '6M': 6/12,
            '1Y': 1
        };
        return tenors[tenor] || 0.25;
    }

    calculateMaturityDate(tenor) {
        const now = new Date();
        const months = {
            '1M': 1,
            '3M': 3,
            '6M': 6,
            '1Y': 12
        };
        
        const maturity = new Date(now);
        maturity.setMonth(maturity.getMonth() + (months[tenor] || 3));
        return maturity;
    }

    calculateExpiryDate(quarter) {
        const year = new Date().getFullYear();
        const expiryDates = {
            'Q1': new Date(year, 2, 31), // March 31
            'Q2': new Date(year, 5, 30), // June 30
            'Q3': new Date(year, 8, 30), // September 30
            'Q4': new Date(year, 11, 31) // December 31
        };
        return expiryDates[quarter] || new Date();
    }

    getTimeToExpiry(quarter) {
        const expiry = this.calculateExpiryDate(quarter);
        const now = new Date();
        return (expiry.getTime() - now.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
    }

    // Public API methods
    async executeTrade(trade) {
        const { pair, side, size, orderType, price } = trade;
        
        // Validate trade
        if (!this.spotMarket.has(pair)) {
            throw new Error(`Invalid currency pair: ${pair}`);
        }
        
        // Generate order ID
        const orderId = `ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Create order
        const order = {
            orderId,
            pair,
            side,
            size: new Decimal(size),
            orderType,
            price: price ? new Decimal(price) : null,
            timestamp: Date.now(),
            status: 'pending'
        };
        
        // Add to order book
        this.addOrderToBook(order);
        
        return order;
    }

    addOrderToBook(order) {
        const orderBook = this.orderBooks.get(order.pair);
        if (!orderBook) return;

        if (order.side === 'buy') {
            orderBook.bids.push(order);
            orderBook.bids.sort((a, b) => b.price.cmp(a.price));
        } else {
            orderBook.asks.push(order);
            orderBook.asks.sort((a, b) => a.price.cmp(b.price));
        }

        this.updateOrderBookStats(order.pair);
    }

    getMarketDepth(pair) {
        return this.marketDepth.get(pair);
    }

    getTotalVolume() {
        let total = new Decimal(0);
        for (const [, spot] of this.spotMarket) {
            total = total.add(spot.volume);
        }
        return total;
    }

    getHealth() {
        return {
            isActive: this.isActive,
            totalPairs: this.spotMarket.size,
            totalVolume: this.getTotalVolume().toNumber(),
            activeMarketMakers: Array.from(this.marketMakers.values()).filter(mm => mm.isActive).length,
            averageSpread: this.getAverageSpread(),
            lastUpdate: Date.now()
        };
    }

    getAverageSpread() {
        let totalSpread = new Decimal(0);
        let count = 0;
        
        for (const [, orderBook] of this.orderBooks) {
            if (orderBook.spread && orderBook.spread.gt(0)) {
                totalSpread = totalSpread.add(orderBook.spread);
                count++;
            }
        }
        
        return count > 0 ? totalSpread.div(count).toNumber() : 0;
    }
}

module.exports = ForexMarketSystem;
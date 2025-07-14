/**
 * PHASE 3 MULTI-CURRENCY ENGINE
 * Core engine managing multiple currencies with realistic mechanics
 */

const Decimal = require('decimal.js');
const EventEmitter = require('eventemitter3');

class MultiCurrencyEngine extends EventEmitter {
    constructor(config) {
        super();
        this.config = config;
        this.currencies = new Map();
        this.exchangeRates = new Map();
        this.historicalRates = new Map();
        this.volatilityModels = new Map();
        this.correlationMatrix = new Map();
        
        this.initialize();
    }

    initialize() {
        this.initializeCurrencies();
        this.initializeExchangeRates();
        this.initializeVolatilityModels();
        this.startRateUpdates();
        
        console.log('🔄 Multi-Currency Engine initialized');
    }

    initializeCurrencies() {
        // Major currencies
        this.config.majorCurrencies.forEach(code => {
            this.currencies.set(code, {
                code,
                type: 'major',
                name: this.getCurrencyName(code),
                symbol: this.getCurrencySymbol(code),
                decimals: 2,
                centralBank: this.config.centralBanks[code],
                
                // Economic properties
                baseInterestRate: this.getBaseInterestRate(code),
                inflationRate: this.getInflationRate(code),
                gdpGrowth: this.getGDPGrowth(code),
                debtToGDP: this.getDebtToGDP(code),
                
                // Market properties
                liquidity: 1.0, // Major currencies have highest liquidity
                volatility: 0.05, // Low volatility for major currencies
                tradingVolume: new Decimal(0),
                marketCap: this.getMarketCap(code),
                
                // Trading characteristics
                spread: 0.0001, // 1 pip for majors
                commission: 0.0001,
                maxLeverage: this.config.maxLeverage.major,
                marginRequirement: this.config.marginRequirements.major,
                
                // State
                isActive: true,
                lastUpdate: Date.now(),
                trend: 'neutral'
            });
        });

        // Emerging market currencies
        this.config.emergingCurrencies.forEach(code => {
            this.currencies.set(code, {
                code,
                type: 'emerging',
                name: this.getCurrencyName(code),
                symbol: this.getCurrencySymbol(code),
                decimals: 2,
                centralBank: this.getEmergingCentralBank(code),
                
                // Economic properties (more volatile)
                baseInterestRate: this.getBaseInterestRate(code),
                inflationRate: this.getInflationRate(code) * 2, // Higher inflation
                gdpGrowth: this.getGDPGrowth(code),
                debtToGDP: this.getDebtToGDP(code) * 1.5,
                
                // Market properties
                liquidity: 0.3, // Lower liquidity
                volatility: 0.15, // Higher volatility
                tradingVolume: new Decimal(0),
                marketCap: this.getMarketCap(code) * 0.1,
                
                // Trading characteristics
                spread: 0.0005, // Wider spreads
                commission: 0.0003,
                maxLeverage: this.config.maxLeverage.emerging,
                marginRequirement: this.config.marginRequirements.emerging,
                
                // State
                isActive: true,
                lastUpdate: Date.now(),
                trend: 'neutral'
            });
        });

        // Cryptocurrencies
        this.config.cryptocurrencies.forEach(code => {
            this.currencies.set(code, {
                code,
                type: 'crypto',
                name: this.getCurrencyName(code),
                symbol: this.getCurrencySymbol(code),
                decimals: 8,
                centralBank: null, // Decentralized
                
                // Economic properties
                baseInterestRate: 0, // No central bank
                inflationRate: code === 'BTC' ? -0.02 : 0.05, // Deflationary or controlled
                gdpGrowth: 0,
                debtToGDP: 0,
                
                // Market properties
                liquidity: 0.2, // Variable liquidity
                volatility: 0.4, // Very high volatility
                tradingVolume: new Decimal(0),
                marketCap: this.getCryptoMarketCap(code),
                
                // Trading characteristics
                spread: 0.001, // 0.1% spread
                commission: 0.0025, // Higher fees
                maxLeverage: this.config.maxLeverage.crypto,
                marginRequirement: this.config.marginRequirements.crypto,
                
                // State
                isActive: true,
                lastUpdate: Date.now(),
                trend: 'neutral'
            });
        });

        console.log(`💰 Initialized ${this.currencies.size} currencies`);
    }

    initializeExchangeRates() {
        // Set USD as base currency
        const baseCurrency = 'USD';
        
        // Initialize rates for all currency pairs
        for (const [code1, currency1] of this.currencies) {
            for (const [code2, currency2] of this.currencies) {
                if (code1 !== code2) {
                    const pair = `${code1}/${code2}`;
                    const rate = this.calculateInitialRate(code1, code2);
                    
                    this.exchangeRates.set(pair, {
                        pair,
                        bid: new Decimal(rate).mul(0.9999), // Slightly lower bid
                        ask: new Decimal(rate).mul(1.0001), // Slightly higher ask
                        mid: new Decimal(rate),
                        spread: new Decimal(rate).mul(0.0002),
                        volume: new Decimal(0),
                        lastUpdate: Date.now(),
                        change24h: 0,
                        high24h: new Decimal(rate),
                        low24h: new Decimal(rate),
                        openPrice: new Decimal(rate)
                    });
                }
            }
        }

        console.log(`📊 Initialized ${this.exchangeRates.size} exchange rates`);
    }

    initializeVolatilityModels() {
        for (const [code, currency] of this.currencies) {
            this.volatilityModels.set(code, {
                historicalVolatility: currency.volatility,
                impliedVolatility: currency.volatility * 1.2,
                realizeddVolatility: currency.volatility * 0.8,
                
                // GARCH model parameters
                alpha: 0.1, // ARCH term
                beta: 0.85, // GARCH term
                omega: 0.0001, // Constant term
                
                // Volatility clustering
                currentRegime: 'normal', // normal, high, extreme
                regimeChangeProbability: 0.05,
                
                // Stochastic volatility
                meanReversion: 0.02,
                volatilityOfVolatility: 0.3,
                
                lastUpdate: Date.now()
            });
        }
    }

    startRateUpdates() {
        // Update rates every second during market hours
        setInterval(() => {
            this.updateExchangeRates();
        }, 1000);

        // Update volatility models every minute
        setInterval(() => {
            this.updateVolatilityModels();
        }, 60000);

        // Update correlations every 5 minutes
        setInterval(() => {
            this.updateCorrelations();
        }, 300000);
    }

    updateExchangeRates() {
        const currentTime = Date.now();
        
        for (const [pair, rate] of this.exchangeRates) {
            const [base, quote] = pair.split('/');
            const baseCurrency = this.currencies.get(base);
            const quoteCurrency = this.currencies.get(quote);
            
            if (!baseCurrency || !quoteCurrency) continue;
            
            // Calculate volatility-adjusted price movement
            const volatility = this.getEffectiveVolatility(base, quote);
            const randomWalk = this.generateRandomWalk(volatility);
            
            // Apply economic factors
            const economicFactor = this.calculateEconomicFactor(base, quote);
            
            // Calculate new mid price
            const newMid = rate.mid.mul(1 + randomWalk + economicFactor);
            
            // Update bid/ask with spread
            const spreadMultiplier = this.calculateDynamicSpread(pair);
            const spread = newMid.mul(spreadMultiplier);
            
            rate.bid = newMid.sub(spread.div(2));
            rate.ask = newMid.add(spread.div(2));
            rate.mid = newMid;
            rate.spread = spread;
            
            // Update 24h statistics
            this.update24hStats(rate, newMid);
            
            rate.lastUpdate = currentTime;
            
            // Emit rate update event
            this.emit('rateUpdate', { pair, rate: rate.mid, bid: rate.bid, ask: rate.ask });
        }
    }

    generateRandomWalk(volatility) {
        // Box-Muller transform for normal distribution
        const u1 = Math.random();
        const u2 = Math.random();
        const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        
        // Scale by volatility and time step (assuming 1 second intervals)
        return z0 * volatility * Math.sqrt(1 / (365.25 * 24 * 3600));
    }

    calculateEconomicFactor(base, quote) {
        const baseCurrency = this.currencies.get(base);
        const quoteCurrency = this.currencies.get(quote);
        
        // Interest rate differential
        const interestDiff = baseCurrency.baseInterestRate - quoteCurrency.baseInterestRate;
        
        // Inflation differential
        const inflationDiff = baseCurrency.inflationRate - quoteCurrency.inflationRate;
        
        // GDP growth differential
        const gdpDiff = baseCurrency.gdpGrowth - quoteCurrency.gdpGrowth;
        
        // Combine factors with weights
        return (interestDiff * 0.4 + inflationDiff * -0.3 + gdpDiff * 0.3) * 0.001;
    }

    getEffectiveVolatility(base, quote) {
        const baseVol = this.volatilityModels.get(base);
        const quoteVol = this.volatilityModels.get(quote);
        
        // Combined volatility using correlation
        const correlation = this.getCorrelation(base, quote);
        return Math.sqrt(
            baseVol.historicalVolatility ** 2 + 
            quoteVol.historicalVolatility ** 2 - 
            2 * correlation * baseVol.historicalVolatility * quoteVol.historicalVolatility
        );
    }

    calculateDynamicSpread(pair) {
        const [base, quote] = pair.split('/');
        const baseCurrency = this.currencies.get(base);
        const quoteCurrency = this.currencies.get(quote);
        const rate = this.exchangeRates.get(pair);
        
        // Base spread from currency characteristics
        let spread = (baseCurrency.spread + quoteCurrency.spread) / 2;
        
        // Adjust for liquidity
        const avgLiquidity = (baseCurrency.liquidity + quoteCurrency.liquidity) / 2;
        spread *= (2 - avgLiquidity); // Lower liquidity = wider spreads
        
        // Adjust for volatility
        const volatility = this.getEffectiveVolatility(base, quote);
        spread *= (1 + volatility * 10); // Higher volatility = wider spreads
        
        // Adjust for trading volume
        const volumeFactor = Math.max(0.5, 1 - rate.volume.toNumber() / 1000000);
        spread *= volumeFactor;
        
        return spread;
    }

    update24hStats(rate, newPrice) {
        const now = Date.now();
        const oneDayAgo = now - 24 * 60 * 60 * 1000;
        
        // Update high/low
        if (newPrice.gt(rate.high24h)) rate.high24h = newPrice;
        if (newPrice.lt(rate.low24h)) rate.low24h = newPrice;
        
        // Calculate 24h change
        rate.change24h = newPrice.sub(rate.openPrice).div(rate.openPrice).mul(100).toNumber();
        
        // Reset daily stats if needed (simplified)
        if (now % (24 * 60 * 60 * 1000) < 1000) {
            rate.openPrice = newPrice;
            rate.high24h = newPrice;
            rate.low24h = newPrice;
        }
    }

    updateVolatilityModels() {
        for (const [code, model] of this.volatilityModels) {
            // GARCH(1,1) update
            const newObservation = this.getLatestReturn(code);
            const newVolatility = Math.sqrt(
                model.omega + 
                model.alpha * (newObservation ** 2) + 
                model.beta * (model.historicalVolatility ** 2)
            );
            
            model.historicalVolatility = newVolatility;
            
            // Update regime
            this.updateVolatilityRegime(model);
            
            model.lastUpdate = Date.now();
        }
    }

    updateVolatilityRegime(model) {
        // Simple regime switching based on volatility level
        if (model.historicalVolatility > 0.3) {
            model.currentRegime = 'extreme';
        } else if (model.historicalVolatility > 0.15) {
            model.currentRegime = 'high';
        } else {
            model.currentRegime = 'normal';
        }
    }

    updateCorrelations() {
        // Calculate correlations between all currency pairs
        const currencies = Array.from(this.currencies.keys());
        
        for (let i = 0; i < currencies.length; i++) {
            for (let j = i + 1; j < currencies.length; j++) {
                const corr = this.calculateCorrelation(currencies[i], currencies[j]);
                this.correlationMatrix.set(`${currencies[i]}-${currencies[j]}`, corr);
            }
        }
    }

    calculateCorrelation(currency1, currency2) {
        // Simplified correlation calculation
        // In reality, this would use historical price data
        const type1 = this.currencies.get(currency1).type;
        const type2 = this.currencies.get(currency2).type;
        
        if (type1 === type2) {
            return 0.3 + Math.random() * 0.4; // Same type currencies are more correlated
        } else {
            return -0.2 + Math.random() * 0.4; // Different types less correlated
        }
    }

    getCorrelation(currency1, currency2) {
        const key = `${currency1}-${currency2}`;
        const reverseKey = `${currency2}-${currency1}`;
        return this.correlationMatrix.get(key) || this.correlationMatrix.get(reverseKey) || 0;
    }

    getLatestReturn(currency) {
        // Simplified return calculation
        const basePair = `${currency}/USD`;
        const rate = this.exchangeRates.get(basePair);
        
        if (rate && rate.openPrice) {
            return rate.mid.sub(rate.openPrice).div(rate.openPrice).toNumber();
        }
        
        return 0;
    }

    // Helper methods for initialization
    getCurrencyName(code) {
        const names = {
            USD: 'US Dollar', EUR: 'Euro', GBP: 'British Pound', JPY: 'Japanese Yen',
            CHF: 'Swiss Franc', CAD: 'Canadian Dollar', AUD: 'Australian Dollar',
            CNY: 'Chinese Yuan', INR: 'Indian Rupee', BRL: 'Brazilian Real',
            RUB: 'Russian Ruble', ZAR: 'South African Rand', MXN: 'Mexican Peso',
            KRW: 'South Korean Won', BTC: 'Bitcoin', ETH: 'Ethereum',
            USDC: 'USD Coin', USDT: 'Tether', ADA: 'Cardano', SOL: 'Solana'
        };
        return names[code] || code;
    }

    getCurrencySymbol(code) {
        const symbols = {
            USD: '$', EUR: '€', GBP: '£', JPY: '¥',
            CHF: 'CHF', CAD: 'C$', AUD: 'A$',
            CNY: '¥', INR: '₹', BRL: 'R$',
            RUB: '₽', ZAR: 'R', MXN: '$',
            KRW: '₩', BTC: '₿', ETH: 'Ξ'
        };
        return symbols[code] || code;
    }

    getBaseInterestRate(code) {
        const rates = {
            USD: 0.05, EUR: 0.04, GBP: 0.05, JPY: -0.001,
            CHF: 0.015, CAD: 0.045, AUD: 0.04,
            CNY: 0.035, INR: 0.065, BRL: 0.13,
            RUB: 0.2, ZAR: 0.075, MXN: 0.11, KRW: 0.03
        };
        return rates[code] || 0.05;
    }

    getInflationRate(code) {
        const rates = {
            USD: 0.03, EUR: 0.025, GBP: 0.04, JPY: 0.005,
            CHF: 0.008, CAD: 0.035, AUD: 0.032,
            CNY: 0.02, INR: 0.06, BRL: 0.08,
            RUB: 0.15, ZAR: 0.055, MXN: 0.078, KRW: 0.025
        };
        return rates[code] || 0.03;
    }

    getGDPGrowth(code) {
        const growth = {
            USD: 0.025, EUR: 0.015, GBP: 0.02, JPY: 0.008,
            CHF: 0.018, CAD: 0.022, AUD: 0.025,
            CNY: 0.06, INR: 0.07, BRL: 0.01,
            RUB: -0.02, ZAR: 0.005, MXN: 0.02, KRW: 0.025
        };
        return growth[code] || 0.02;
    }

    getDebtToGDP(code) {
        const debt = {
            USD: 1.28, EUR: 0.85, GBP: 1.02, JPY: 2.6,
            CHF: 0.42, CAD: 1.15, AUD: 0.62,
            CNY: 0.72, INR: 0.89, BRL: 0.98,
            RUB: 0.21, ZAR: 0.71, MXN: 0.61, KRW: 0.48
        };
        return debt[code] || 0.8;
    }

    getMarketCap(code) {
        // Simplified market cap in trillions USD
        const caps = {
            USD: 100, EUR: 15, GBP: 3, JPY: 8,
            CHF: 1, CAD: 2, AUD: 1.5
        };
        return caps[code] || 1;
    }

    getCryptoMarketCap(code) {
        const caps = {
            BTC: 0.8, ETH: 0.4, USDC: 0.05,
            USDT: 0.08, ADA: 0.015, SOL: 0.02
        };
        return caps[code] || 0.01;
    }

    getEmergingCentralBank(code) {
        const banks = {
            CNY: 'PBOC', INR: 'RBI', BRL: 'BCB',
            RUB: 'CBR', ZAR: 'SARB', MXN: 'BANXICO', KRW: 'BOK'
        };
        return banks[code] || 'CENTRAL_BANK';
    }

    calculateInitialRate(base, quote) {
        // Simplified initial rate calculation based on relative economic strength
        const baseCurrency = this.currencies.get(base);
        const quoteCurrency = this.currencies.get(quote);
        
        if (base === 'USD') return this.getUSDRate(quote);
        if (quote === 'USD') return 1 / this.getUSDRate(base);
        
        // Cross rate calculation
        const baseToUSD = 1 / this.getUSDRate(base);
        const quoteToUSD = 1 / this.getUSDRate(quote);
        return baseToUSD / quoteToUSD;
    }

    getUSDRate(currency) {
        const rates = {
            EUR: 0.85, GBP: 0.75, JPY: 150,
            CHF: 0.9, CAD: 1.35, AUD: 1.5,
            CNY: 7.2, INR: 83, BRL: 5.2,
            RUB: 90, ZAR: 18, MXN: 17, KRW: 1300,
            BTC: 0.000025, ETH: 0.0005, USDC: 1,
            USDT: 1, ADA: 2.5, SOL: 0.02
        };
        return rates[currency] || 1;
    }

    // Public API methods
    getCurrency(code) {
        return this.currencies.get(code);
    }

    getExchangeRate(pair) {
        return this.exchangeRates.get(pair);
    }

    getAllCurrencies() {
        return Array.from(this.currencies.values());
    }

    getAllExchangeRates() {
        return Array.from(this.exchangeRates.values());
    }

    getVolatilityModel(currency) {
        return this.volatilityModels.get(currency);
    }

    getCorrelationMatrix() {
        return this.correlationMatrix;
    }

    getHealth() {
        return {
            totalCurrencies: this.currencies.size,
            totalPairs: this.exchangeRates.size,
            avgVolatility: this.getAverageVolatility(),
            systemLoad: this.getSystemLoad(),
            lastUpdate: Date.now()
        };
    }

    getAverageVolatility() {
        let total = 0;
        for (const [, model] of this.volatilityModels) {
            total += model.historicalVolatility;
        }
        return total / this.volatilityModels.size;
    }

    getSystemLoad() {
        // Simplified system load calculation
        return Math.min(1, this.currencies.size / 100);
    }
}

module.exports = MultiCurrencyEngine;
/**
 * Statistical Anomaly Detector - Advanced Pattern Recognition
 * Detects impossible trades, market manipulation, and statistical anomalies
 */

class StatisticalAnomalyDetector {
    constructor() {
        this.priceHistory = new Map(); // symbol -> PriceHistory
        this.volumeHistory = new Map(); // symbol -> VolumeHistory
        this.userProfiles = new Map(); // userId -> UserProfile
        this.marketBaselines = new Map(); // symbol -> MarketBaseline
        this.anomalies = new Map(); // timestamp -> Anomaly[]
        
        // Statistical thresholds
        this.thresholds = {
            priceDeviation: 3.0,      // Standard deviations from mean
            volumeDeviation: 2.5,     // Standard deviations for volume
            velocityThreshold: 5.0,   // Price velocity threshold
            correlationThreshold: 0.95, // Suspicious correlation
            probabilityThreshold: 0.001, // Statistical impossibility
            
            // User behavior thresholds
            profitThreshold: 10.0,    // Impossible profit margin
            timingPrecision: 0.1,     // Timing precision threshold
            patternRepetition: 0.8,   // Pattern repetition threshold
            
            // Market manipulation
            washTradingThreshold: 0.7,
            pumpDumpThreshold: 2.0,
            
            // Temporal analysis
            activitySpikeFactor: 5.0,
            quietPeriodFactor: 0.1
        };

        // Window sizes for analysis
        this.windows = {
            short: 60 * 1000,         // 1 minute
            medium: 300 * 1000,       // 5 minutes
            long: 1800 * 1000,        // 30 minutes
            extended: 3600 * 1000,    // 1 hour
            daily: 86400 * 1000       // 24 hours
        };

        this.startPeriodicAnalysis();
    }

    /**
     * Analyze a trade for statistical anomalies
     */
    analyzeTrade(trade) {
        const timestamp = Date.now();
        const symbol = trade.symbol || `${trade.baseAsset}/${trade.quoteAsset}`;
        
        // Update historical data
        this.updatePriceHistory(symbol, trade.price, trade.volume, timestamp);
        this.updateUserProfile(trade.userId, trade);
        
        // Run multiple anomaly detection algorithms
        const anomalies = [];
        
        // 1. Price anomaly detection
        const priceAnomalies = this.detectPriceAnomalies(symbol, trade);
        anomalies.push(...priceAnomalies);
        
        // 2. Volume anomaly detection
        const volumeAnomalies = this.detectVolumeAnomalies(symbol, trade);
        anomalies.push(...volumeAnomalies);
        
        // 3. Velocity anomaly detection
        const velocityAnomalies = this.detectVelocityAnomalies(symbol, trade);
        anomalies.push(...velocityAnomalies);
        
        // 4. User behavior anomalies
        const behaviorAnomalies = this.detectUserBehaviorAnomalies(trade);
        anomalies.push(...behaviorAnomalies);
        
        // 5. Market manipulation detection
        const manipulationAnomalies = this.detectMarketManipulation(symbol, trade);
        anomalies.push(...manipulationAnomalies);
        
        // 6. Temporal pattern anomalies
        const temporalAnomalies = this.detectTemporalAnomalies(trade);
        anomalies.push(...temporalAnomalies);
        
        // 7. Cross-market correlation anomalies
        const correlationAnomalies = this.detectCorrelationAnomalies(symbol, trade);
        anomalies.push(...correlationAnomalies);
        
        // Store anomalies if any found
        if (anomalies.length > 0) {
            this.anomalies.set(timestamp, anomalies);
        }
        
        // Calculate overall anomaly score
        const anomalyScore = this.calculateAnomalyScore(anomalies);
        
        return {
            timestamp,
            tradeId: trade.id,
            symbol,
            userId: trade.userId,
            anomalies,
            anomalyScore,
            riskLevel: this.categorizeRisk(anomalyScore),
            recommendedAction: this.getRecommendedAction(anomalyScore, anomalies)
        };
    }

    /**
     * Detect price anomalies using statistical analysis
     */
    detectPriceAnomalies(symbol, trade) {
        const priceHistory = this.priceHistory.get(symbol);
        if (!priceHistory || priceHistory.prices.length < 10) {
            return [];
        }

        const anomalies = [];
        const currentPrice = trade.price;
        
        // 1. Z-score analysis
        const stats = this.calculatePriceStatistics(priceHistory.prices);
        const zScore = Math.abs((currentPrice - stats.mean) / stats.stdDev);
        
        if (zScore > this.thresholds.priceDeviation) {
            anomalies.push({
                type: 'PRICE_DEVIATION',
                severity: this.categorizeSeverity(zScore, this.thresholds.priceDeviation),
                details: {
                    currentPrice,
                    expectedRange: [stats.mean - 2 * stats.stdDev, stats.mean + 2 * stats.stdDev],
                    zScore,
                    confidence: this.calculateConfidence(zScore, this.thresholds.priceDeviation)
                }
            });
        }
        
        // 2. Bollinger Band analysis
        const bollingerBands = this.calculateBollingerBands(priceHistory.prices);
        if (currentPrice < bollingerBands.lower || currentPrice > bollingerBands.upper) {
            anomalies.push({
                type: 'BOLLINGER_BAND_BREACH',
                severity: currentPrice < bollingerBands.lowerExtreme || currentPrice > bollingerBands.upperExtreme ? 'HIGH' : 'MEDIUM',
                details: {
                    currentPrice,
                    bollingerBands,
                    breachDirection: currentPrice > bollingerBands.upper ? 'UPWARD' : 'DOWNWARD'
                }
            });
        }
        
        // 3. Statistical impossibility
        const probability = this.calculatePriceProbability(currentPrice, stats);
        if (probability < this.thresholds.probabilityThreshold) {
            anomalies.push({
                type: 'STATISTICALLY_IMPOSSIBLE_PRICE',
                severity: 'HIGH',
                details: {
                    currentPrice,
                    probability,
                    standardDeviations: zScore
                }
            });
        }
        
        // 4. Sudden price gap detection
        if (priceHistory.prices.length > 0) {
            const lastPrice = priceHistory.prices[priceHistory.prices.length - 1].price;
            const priceChange = Math.abs((currentPrice - lastPrice) / lastPrice);
            
            if (priceChange > 0.1) { // 10% sudden change
                anomalies.push({
                    type: 'SUDDEN_PRICE_GAP',
                    severity: priceChange > 0.25 ? 'HIGH' : 'MEDIUM',
                    details: {
                        priceChange,
                        lastPrice,
                        currentPrice,
                        changePercent: priceChange * 100
                    }
                });
            }
        }

        return anomalies;
    }

    /**
     * Detect volume anomalies
     */
    detectVolumeAnomalies(symbol, trade) {
        const volumeHistory = this.volumeHistory.get(symbol);
        if (!volumeHistory || volumeHistory.volumes.length < 10) {
            return [];
        }

        const anomalies = [];
        const currentVolume = trade.volume;
        
        // Volume Z-score analysis
        const volumeStats = this.calculateVolumeStatistics(volumeHistory.volumes);
        const volumeZScore = Math.abs((currentVolume - volumeStats.mean) / volumeStats.stdDev);
        
        if (volumeZScore > this.thresholds.volumeDeviation) {
            anomalies.push({
                type: 'VOLUME_ANOMALY',
                severity: this.categorizeSeverity(volumeZScore, this.thresholds.volumeDeviation),
                details: {
                    currentVolume,
                    expectedRange: [volumeStats.mean - 2 * volumeStats.stdDev, volumeStats.mean + 2 * volumeStats.stdDev],
                    zScore: volumeZScore,
                    volumeType: currentVolume > volumeStats.mean ? 'UNUSUALLY_HIGH' : 'UNUSUALLY_LOW'
                }
            });
        }

        // Volume spike detection
        const recentVolumes = volumeHistory.volumes.slice(-10).map(v => v.volume);
        const averageRecentVolume = recentVolumes.reduce((a, b) => a + b, 0) / recentVolumes.length;
        
        if (currentVolume > averageRecentVolume * this.thresholds.activitySpikeFactor) {
            anomalies.push({
                type: 'VOLUME_SPIKE',
                severity: 'HIGH',
                details: {
                    currentVolume,
                    averageRecentVolume,
                    spikeFactor: currentVolume / averageRecentVolume
                }
            });
        }

        return anomalies;
    }

    /**
     * Detect velocity (rate of change) anomalies
     */
    detectVelocityAnomalies(symbol, trade) {
        const priceHistory = this.priceHistory.get(symbol);
        if (!priceHistory || priceHistory.prices.length < 3) {
            return [];
        }

        const anomalies = [];
        const recentPrices = priceHistory.prices.slice(-3);
        
        // Calculate velocity (price change rate)
        const velocity = this.calculatePriceVelocity(recentPrices);
        const historicalVelocities = this.calculateHistoricalVelocities(priceHistory.prices);
        
        if (historicalVelocities.length > 10) {
            const velocityStats = this.calculateStatistics(historicalVelocities);
            const velocityZScore = Math.abs((velocity - velocityStats.mean) / velocityStats.stdDev);
            
            if (velocityZScore > this.thresholds.velocityThreshold) {
                anomalies.push({
                    type: 'VELOCITY_ANOMALY',
                    severity: this.categorizeSeverity(velocityZScore, this.thresholds.velocityThreshold),
                    details: {
                        currentVelocity: velocity,
                        expectedVelocity: velocityStats.mean,
                        velocityZScore,
                        direction: velocity > 0 ? 'RAPID_INCREASE' : 'RAPID_DECREASE'
                    }
                });
            }
        }

        return anomalies;
    }

    /**
     * Detect user behavior anomalies
     */
    detectUserBehaviorAnomalies(trade) {
        const userProfile = this.userProfiles.get(trade.userId);
        if (!userProfile || userProfile.trades.length < 10) {
            return [];
        }

        const anomalies = [];
        
        // 1. Impossible profit analysis
        const profitAnalysis = this.analyzeProfitability(userProfile, trade);
        if (profitAnalysis.isAnomalous) {
            anomalies.push({
                type: 'IMPOSSIBLE_PROFIT',
                severity: 'HIGH',
                details: profitAnalysis
            });
        }
        
        // 2. Trading pattern analysis
        const patternAnalysis = this.analyzeUserPatterns(userProfile);
        if (patternAnalysis.suspiciousPatterns.length > 0) {
            anomalies.push({
                type: 'SUSPICIOUS_TRADING_PATTERN',
                severity: 'MEDIUM',
                details: patternAnalysis
            });
        }
        
        // 3. Timing precision analysis
        const timingAnalysis = this.analyzeTimingPrecision(userProfile);
        if (timingAnalysis.isPrecise) {
            anomalies.push({
                type: 'INHUMAN_TIMING_PRECISION',
                severity: 'HIGH',
                details: timingAnalysis
            });
        }
        
        // 4. Market timing analysis
        const marketTimingAnalysis = this.analyzeMarketTiming(userProfile, trade);
        if (marketTimingAnalysis.isPerfect) {
            anomalies.push({
                type: 'PERFECT_MARKET_TIMING',
                severity: 'HIGH',
                details: marketTimingAnalysis
            });
        }

        return anomalies;
    }

    /**
     * Detect market manipulation patterns
     */
    detectMarketManipulation(symbol, trade) {
        const anomalies = [];
        
        // 1. Wash trading detection
        const washTradingScore = this.detectWashTrading(trade.userId, symbol);
        if (washTradingScore > this.thresholds.washTradingThreshold) {
            anomalies.push({
                type: 'WASH_TRADING',
                severity: 'HIGH',
                details: {
                    washTradingScore,
                    suspiciousTransactions: this.getRelatedTransactions(trade.userId, symbol)
                }
            });
        }
        
        // 2. Pump and dump detection
        const pumpDumpAnalysis = this.detectPumpAndDump(symbol, trade);
        if (pumpDumpAnalysis.isPumpDump) {
            anomalies.push({
                type: 'PUMP_AND_DUMP',
                severity: 'HIGH',
                details: pumpDumpAnalysis
            });
        }
        
        // 3. Coordinated trading detection
        const coordinationAnalysis = this.detectCoordinatedTrading(symbol, trade);
        if (coordinationAnalysis.isCoordinated) {
            anomalies.push({
                type: 'COORDINATED_TRADING',
                severity: 'HIGH',
                details: coordinationAnalysis
            });
        }

        return anomalies;
    }

    /**
     * Detect temporal pattern anomalies
     */
    detectTemporalAnomalies(trade) {
        const anomalies = [];
        const timestamp = Date.now();
        
        // 1. Off-hours trading analysis
        const timeAnalysis = this.analyzeTradeTime(timestamp);
        if (timeAnalysis.isUnusual) {
            anomalies.push({
                type: 'UNUSUAL_TRADING_HOURS',
                severity: 'MEDIUM',
                details: timeAnalysis
            });
        }
        
        // 2. High-frequency pattern detection
        const frequencyAnalysis = this.analyzeTradeFrequency(trade.userId, timestamp);
        if (frequencyAnalysis.isHighFrequency) {
            anomalies.push({
                type: 'HIGH_FREQUENCY_ANOMALY',
                severity: 'HIGH',
                details: frequencyAnalysis
            });
        }

        return anomalies;
    }

    /**
     * Detect cross-market correlation anomalies
     */
    detectCorrelationAnomalies(symbol, trade) {
        const anomalies = [];
        
        // Analyze correlation with related markets
        const correlatedMarkets = this.getCorrelatedMarkets(symbol);
        
        for (const relatedSymbol of correlatedMarkets) {
            const correlation = this.calculateRealtimeCorrelation(symbol, relatedSymbol);
            
            if (Math.abs(correlation) < 0.1 && this.isNormallyCorrelated(symbol, relatedSymbol)) {
                anomalies.push({
                    type: 'CORRELATION_BREAKDOWN',
                    severity: 'MEDIUM',
                    details: {
                        primarySymbol: symbol,
                        relatedSymbol,
                        currentCorrelation: correlation,
                        expectedCorrelation: this.getHistoricalCorrelation(symbol, relatedSymbol)
                    }
                });
            }
        }

        return anomalies;
    }

    /**
     * Calculate comprehensive anomaly score
     */
    calculateAnomalyScore(anomalies) {
        if (anomalies.length === 0) return 0;
        
        const severityWeights = {
            'LOW': 0.1,
            'MEDIUM': 0.3,
            'HIGH': 0.6,
            'CRITICAL': 1.0
        };
        
        const typeWeights = {
            'STATISTICALLY_IMPOSSIBLE_PRICE': 1.0,
            'IMPOSSIBLE_PROFIT': 0.9,
            'WASH_TRADING': 0.8,
            'PUMP_AND_DUMP': 0.8,
            'INHUMAN_TIMING_PRECISION': 0.7,
            'PRICE_DEVIATION': 0.5,
            'VOLUME_ANOMALY': 0.4,
            'VELOCITY_ANOMALY': 0.4
        };
        
        let totalScore = 0;
        let maxScore = 0;
        
        for (const anomaly of anomalies) {
            const severityWeight = severityWeights[anomaly.severity] || 0.3;
            const typeWeight = typeWeights[anomaly.type] || 0.3;
            const score = severityWeight * typeWeight;
            
            totalScore += score;
            maxScore = Math.max(maxScore, score);
        }
        
        // Combine average and maximum scores
        const averageScore = totalScore / anomalies.length;
        return Math.min(1.0, (averageScore + maxScore) / 2);
    }

    /**
     * Update price history for a symbol
     */
    updatePriceHistory(symbol, price, volume, timestamp) {
        if (!this.priceHistory.has(symbol)) {
            this.priceHistory.set(symbol, {
                prices: [],
                volumes: [],
                timestamps: []
            });
        }
        
        const history = this.priceHistory.get(symbol);
        history.prices.push({ price, timestamp });
        history.volumes.push({ volume, timestamp });
        history.timestamps.push(timestamp);
        
        // Keep only recent data (last 1000 points or 24 hours)
        const cutoff = timestamp - this.windows.daily;
        history.prices = history.prices.filter(p => p.timestamp > cutoff).slice(-1000);
        history.volumes = history.volumes.filter(v => v.timestamp > cutoff).slice(-1000);
        history.timestamps = history.timestamps.filter(t => t > cutoff).slice(-1000);
        
        // Update volume history separately for easier access
        if (!this.volumeHistory.has(symbol)) {
            this.volumeHistory.set(symbol, { volumes: [] });
        }
        this.volumeHistory.get(symbol).volumes.push({ volume, timestamp });
    }

    /**
     * Update user trading profile
     */
    updateUserProfile(userId, trade) {
        if (!this.userProfiles.has(userId)) {
            this.userProfiles.set(userId, {
                trades: [],
                totalVolume: 0,
                profitLoss: 0,
                averageTradeSize: 0,
                tradingPairs: new Set(),
                firstTradeTime: Date.now(),
                patterns: {
                    timingIntervals: [],
                    priceTargets: [],
                    volumePatterns: []
                }
            });
        }
        
        const profile = this.userProfiles.get(userId);
        profile.trades.push({
            ...trade,
            timestamp: Date.now()
        });
        
        profile.totalVolume += trade.volume;
        profile.tradingPairs.add(trade.symbol || `${trade.baseAsset}/${trade.quoteAsset}`);
        
        // Update patterns
        if (profile.trades.length > 1) {
            const lastTrade = profile.trades[profile.trades.length - 2];
            profile.patterns.timingIntervals.push(Date.now() - lastTrade.timestamp);
        }
        
        profile.patterns.priceTargets.push(trade.price);
        profile.patterns.volumePatterns.push(trade.volume);
        
        // Keep only recent data
        profile.trades = profile.trades.slice(-500);
        profile.patterns.timingIntervals = profile.patterns.timingIntervals.slice(-100);
        profile.patterns.priceTargets = profile.patterns.priceTargets.slice(-100);
        profile.patterns.volumePatterns = profile.patterns.volumePatterns.slice(-100);
    }

    /**
     * Calculate various statistical measures
     */
    calculatePriceStatistics(prices) {
        const values = prices.map(p => p.price);
        return this.calculateStatistics(values);
    }

    calculateVolumeStatistics(volumes) {
        const values = volumes.map(v => v.volume);
        return this.calculateStatistics(values);
    }

    calculateStatistics(values) {
        const n = values.length;
        const mean = values.reduce((a, b) => a + b, 0) / n;
        const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / n;
        const stdDev = Math.sqrt(variance);
        
        const sorted = [...values].sort((a, b) => a - b);
        const median = n % 2 === 0 ? 
            (sorted[n/2 - 1] + sorted[n/2]) / 2 : 
            sorted[Math.floor(n/2)];
        
        return {
            mean,
            median,
            stdDev,
            variance,
            min: Math.min(...values),
            max: Math.max(...values),
            range: Math.max(...values) - Math.min(...values)
        };
    }

    /**
     * Calculate Bollinger Bands
     */
    calculateBollingerBands(prices, period = 20, multiplier = 2) {
        if (prices.length < period) {
            return null;
        }
        
        const recentPrices = prices.slice(-period).map(p => p.price);
        const stats = this.calculateStatistics(recentPrices);
        
        return {
            middle: stats.mean,
            upper: stats.mean + (multiplier * stats.stdDev),
            lower: stats.mean - (multiplier * stats.stdDev),
            upperExtreme: stats.mean + (3 * stats.stdDev),
            lowerExtreme: stats.mean - (3 * stats.stdDev)
        };
    }

    /**
     * Calculate price velocity
     */
    calculatePriceVelocity(prices) {
        if (prices.length < 2) return 0;
        
        const timeDiff = prices[prices.length - 1].timestamp - prices[0].timestamp;
        const priceDiff = prices[prices.length - 1].price - prices[0].price;
        
        return timeDiff > 0 ? priceDiff / timeDiff : 0;
    }

    calculateHistoricalVelocities(prices) {
        const velocities = [];
        for (let i = 2; i < prices.length; i++) {
            const segment = prices.slice(i - 2, i + 1);
            velocities.push(this.calculatePriceVelocity(segment));
        }
        return velocities;
    }

    /**
     * Analyze user profitability for impossible gains
     */
    analyzeProfitability(userProfile, currentTrade) {
        const recentTrades = userProfile.trades.slice(-10);
        
        // Calculate theoretical profit if perfect timing
        let totalProfit = 0;
        let impossibleProfits = 0;
        
        for (let i = 1; i < recentTrades.length; i++) {
            const prevTrade = recentTrades[i - 1];
            const trade = recentTrades[i];
            
            // Simplified profit calculation
            const profit = (trade.price - prevTrade.price) / prevTrade.price;
            totalProfit += profit;
            
            // Check for impossible profits (>50% in short time)
            if (profit > 0.5 && (trade.timestamp - prevTrade.timestamp) < 60000) {
                impossibleProfits++;
            }
        }
        
        const averageProfit = totalProfit / Math.max(recentTrades.length - 1, 1);
        
        return {
            isAnomalous: averageProfit > this.thresholds.profitThreshold || impossibleProfits > 2,
            averageProfit,
            impossibleProfits,
            totalTrades: recentTrades.length,
            confidence: Math.min(impossibleProfits / 5, 1.0)
        };
    }

    /**
     * Helper methods for various analyses
     */
    categorizeSeverity(value, threshold) {
        if (value > threshold * 2) return 'CRITICAL';
        if (value > threshold * 1.5) return 'HIGH';
        if (value > threshold) return 'MEDIUM';
        return 'LOW';
    }

    calculateConfidence(zScore, threshold) {
        return Math.min(zScore / threshold, 1.0);
    }

    categorizeRisk(anomalyScore) {
        if (anomalyScore >= 0.8) return 'CRITICAL';
        if (anomalyScore >= 0.6) return 'HIGH';
        if (anomalyScore >= 0.4) return 'MEDIUM';
        if (anomalyScore >= 0.2) return 'LOW';
        return 'MINIMAL';
    }

    getRecommendedAction(anomalyScore, anomalies) {
        if (anomalyScore >= 0.8) return 'IMMEDIATE_INVESTIGATION';
        if (anomalyScore >= 0.6) return 'ENHANCED_MONITORING';
        if (anomalyScore >= 0.4) return 'FLAG_FOR_REVIEW';
        if (anomalyScore >= 0.2) return 'LOG_AND_MONITOR';
        return 'NO_ACTION';
    }

    calculatePriceProbability(price, stats) {
        // Use normal distribution to calculate probability
        const zScore = Math.abs((price - stats.mean) / stats.stdDev);
        return 2 * (1 - this.normalCDF(zScore));
    }

    normalCDF(x) {
        // Approximation of normal cumulative distribution function
        return 0.5 * (1 + this.erf(x / Math.sqrt(2)));
    }

    erf(x) {
        // Approximation of error function
        const a1 =  0.254829592;
        const a2 = -0.284496736;
        const a3 =  1.421413741;
        const a4 = -1.453152027;
        const a5 =  1.061405429;
        const p  =  0.3275911;

        const sign = x < 0 ? -1 : 1;
        x = Math.abs(x);

        const t = 1.0 / (1.0 + p * x);
        const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

        return sign * y;
    }

    // Placeholder methods for complex analyses (would need full implementation)
    analyzeUserPatterns(userProfile) {
        return { suspiciousPatterns: [] };
    }

    analyzeTimingPrecision(userProfile) {
        return { isPrecise: false };
    }

    analyzeMarketTiming(userProfile, trade) {
        return { isPerfect: false };
    }

    detectWashTrading(userId, symbol) {
        return 0;
    }

    detectPumpAndDump(symbol, trade) {
        return { isPumpDump: false };
    }

    detectCoordinatedTrading(symbol, trade) {
        return { isCoordinated: false };
    }

    analyzeTradeTime(timestamp) {
        return { isUnusual: false };
    }

    analyzeTradeFrequency(userId, timestamp) {
        return { isHighFrequency: false };
    }

    getCorrelatedMarkets(symbol) {
        return [];
    }

    calculateRealtimeCorrelation(symbol1, symbol2) {
        return 0;
    }

    isNormallyCorrelated(symbol1, symbol2) {
        return false;
    }

    getHistoricalCorrelation(symbol1, symbol2) {
        return 0;
    }

    getRelatedTransactions(userId, symbol) {
        return [];
    }

    /**
     * Periodic analysis and cleanup
     */
    startPeriodicAnalysis() {
        // Run market-wide analysis every 5 minutes
        setInterval(() => {
            this.performMarketAnalysis();
            this.cleanupOldData();
        }, 300000);
    }

    performMarketAnalysis() {
        // Implement market-wide statistical analysis
        const marketAnomalies = this.detectMarketWideAnomalies();
        
        if (marketAnomalies.length > 0) {
            this.logSecurityEvent('MARKET_WIDE_ANOMALIES', {
                timestamp: Date.now(),
                anomalies: marketAnomalies,
                severity: 'HIGH'
            });
        }
    }

    detectMarketWideAnomalies() {
        // Placeholder for market-wide analysis
        return [];
    }

    cleanupOldData() {
        const now = Date.now();
        const maxAge = this.windows.daily;
        
        // Clean up old anomalies
        for (const [timestamp, _] of this.anomalies.entries()) {
            if (now - timestamp > maxAge) {
                this.anomalies.delete(timestamp);
            }
        }
    }

    logSecurityEvent(event, data) {
        const logEntry = {
            timestamp: Date.now(),
            event,
            data,
            component: 'ANOMALY_DETECTOR'
        };
        
        console.log(`[ANOMALY_DETECTOR] ${event}:`, logEntry);
    }

    /**
     * Get comprehensive analysis report
     */
    generateAnalysisReport(symbol, userId = null) {
        const now = Date.now();
        const recentAnomalies = Array.from(this.anomalies.entries())
            .filter(([timestamp, _]) => now - timestamp < this.windows.extended)
            .map(([timestamp, anomalies]) => ({ timestamp, anomalies }));

        const report = {
            timestamp: now,
            symbol,
            userId,
            recentAnomalies: recentAnomalies.length,
            systemHealth: this.calculateSystemHealth(),
            marketBaselines: this.getMarketBaselines(symbol),
            recommendations: this.generateRecommendations(recentAnomalies)
        };

        if (userId) {
            const userProfile = this.userProfiles.get(userId);
            report.userProfile = userProfile ? {
                totalTrades: userProfile.trades.length,
                averageTradeSize: userProfile.averageTradeSize,
                tradingPairs: userProfile.tradingPairs.size,
                riskLevel: this.assessUserRiskLevel(userProfile)
            } : null;
        }

        return report;
    }

    calculateSystemHealth() {
        const recentAnomalies = Array.from(this.anomalies.entries())
            .filter(([timestamp, _]) => Date.now() - timestamp < this.windows.medium);
        
        if (recentAnomalies.length > 50) return 'CRITICAL';
        if (recentAnomalies.length > 20) return 'DEGRADED';
        if (recentAnomalies.length > 5) return 'WARNING';
        return 'HEALTHY';
    }

    getMarketBaselines(symbol) {
        const priceHistory = this.priceHistory.get(symbol);
        if (!priceHistory) return null;
        
        return {
            priceStats: this.calculatePriceStatistics(priceHistory.prices),
            volumeStats: this.calculateVolumeStatistics(this.volumeHistory.get(symbol)?.volumes || [])
        };
    }

    generateRecommendations(recentAnomalies) {
        const recommendations = [];
        
        if (recentAnomalies.length > 10) {
            recommendations.push('Increase monitoring frequency');
            recommendations.push('Review user accounts with multiple anomalies');
        }
        
        if (recentAnomalies.some(({ anomalies }) => anomalies.some(a => a.type === 'WASH_TRADING'))) {
            recommendations.push('Investigate potential wash trading schemes');
        }
        
        return recommendations;
    }

    assessUserRiskLevel(userProfile) {
        // Simplified risk assessment
        if (userProfile.trades.length > 1000) return 'HIGH';
        if (userProfile.tradingPairs.size > 20) return 'MEDIUM';
        return 'LOW';
    }
}

module.exports = StatisticalAnomalyDetector;
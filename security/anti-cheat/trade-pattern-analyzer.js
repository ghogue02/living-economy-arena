/**
 * Trade Pattern Analyzer - Advanced Bot Detection
 * Analyzes trading patterns to detect automated bot usage and suspicious behaviors
 */

class TradePatternAnalyzer {
    constructor() {
        this.patterns = new Map();
        this.suspicionScores = new Map();
        this.timeWindows = {
            short: 60 * 1000,     // 1 minute
            medium: 300 * 1000,   // 5 minutes
            long: 1800 * 1000     // 30 minutes
        };
        this.thresholds = {
            botProbability: 0.85,
            suspicionLevel: 0.7,
            maxTradesPerMinute: 10,
            minTimeBetweenTrades: 500 // ms
        };
    }

    /**
     * Analyze a new trade for bot patterns
     */
    analyzeTrade(trade) {
        const userId = trade.userId;
        const timestamp = Date.now();
        
        // Initialize user data if new
        if (!this.patterns.has(userId)) {
            this.patterns.set(userId, {
                trades: [],
                timings: [],
                volumes: [],
                prices: [],
                lastAnalysis: timestamp
            });
        }

        const userPattern = this.patterns.get(userId);
        
        // Update pattern data
        this.updatePatternData(userPattern, trade, timestamp);
        
        // Run detection algorithms
        const analysisResult = this.runDetectionAlgorithms(userId, userPattern);
        
        // Update suspicion score
        this.updateSuspicionScore(userId, analysisResult);
        
        return {
            userId,
            timestamp,
            suspicionScore: this.suspicionScores.get(userId) || 0,
            flags: analysisResult.flags,
            botProbability: analysisResult.botProbability,
            recommended_action: this.getRecommendedAction(analysisResult)
        };
    }

    updatePatternData(userPattern, trade, timestamp) {
        // Add trade to pattern history
        userPattern.trades.push({
            id: trade.id,
            timestamp,
            volume: trade.volume,
            price: trade.price,
            type: trade.type,
            pair: trade.pair
        });

        // Calculate timing intervals
        if (userPattern.trades.length > 1) {
            const lastTrade = userPattern.trades[userPattern.trades.length - 2];
            userPattern.timings.push(timestamp - lastTrade.timestamp);
        }

        userPattern.volumes.push(trade.volume);
        userPattern.prices.push(trade.price);

        // Cleanup old data (keep last 1000 trades or 24 hours)
        const cutoff = timestamp - (24 * 60 * 60 * 1000);
        userPattern.trades = userPattern.trades.filter(t => t.timestamp > cutoff).slice(-1000);
        userPattern.timings = userPattern.timings.slice(-999);
        userPattern.volumes = userPattern.volumes.slice(-1000);
        userPattern.prices = userPattern.prices.slice(-1000);
    }

    runDetectionAlgorithms(userId, pattern) {
        const flags = [];
        let botProbability = 0;

        // 1. Timing Analysis - Check for machine-like precision
        const timingAnalysis = this.analyzeTimingPatterns(pattern.timings);
        if (timingAnalysis.isSuspicious) {
            flags.push('PRECISE_TIMING');
            botProbability += 0.3;
        }

        // 2. Volume Analysis - Check for identical volumes
        const volumeAnalysis = this.analyzeVolumePatterns(pattern.volumes);
        if (volumeAnalysis.isSuspicious) {
            flags.push('IDENTICAL_VOLUMES');
            botProbability += 0.25;
        }

        // 3. Frequency Analysis - Check for inhuman trading frequency
        const frequencyAnalysis = this.analyzeFrequency(pattern.trades);
        if (frequencyAnalysis.isSuspicious) {
            flags.push('HIGH_FREQUENCY');
            botProbability += 0.2;
        }

        // 4. Price Pattern Analysis - Check for systematic price targeting
        const priceAnalysis = this.analyzePricePatterns(pattern.prices, pattern.trades);
        if (priceAnalysis.isSuspicious) {
            flags.push('SYSTEMATIC_PRICING');
            botProbability += 0.15;
        }

        // 5. Market Response Analysis - Check for instant market reactions
        const responseAnalysis = this.analyzeMarketResponse(pattern.trades);
        if (responseAnalysis.isSuspicious) {
            flags.push('INSTANT_RESPONSE');
            botProbability += 0.2;
        }

        // 6. Behavioral Consistency - Check for lack of human variance
        const behaviorAnalysis = this.analyzeBehavioralConsistency(pattern);
        if (behaviorAnalysis.isSuspicious) {
            flags.push('LACK_OF_VARIANCE');
            botProbability += 0.1;
        }

        return {
            flags,
            botProbability: Math.min(botProbability, 1.0),
            details: {
                timing: timingAnalysis,
                volume: volumeAnalysis,
                frequency: frequencyAnalysis,
                pricing: priceAnalysis,
                response: responseAnalysis,
                behavior: behaviorAnalysis
            }
        };
    }

    analyzeTimingPatterns(timings) {
        if (timings.length < 10) return { isSuspicious: false };

        // Calculate timing statistics
        const mean = timings.reduce((a, b) => a + b, 0) / timings.length;
        const variance = timings.reduce((acc, timing) => acc + Math.pow(timing - mean, 2), 0) / timings.length;
        const stdDev = Math.sqrt(variance);
        const coefficientOfVariation = stdDev / mean;

        // Check for machine-like precision (very low variance)
        const isPrecise = coefficientOfVariation < 0.1 && stdDev < 100;
        
        // Check for exact intervals
        const exactIntervals = this.countExactIntervals(timings);
        const hasExactIntervals = exactIntervals > timings.length * 0.3;

        return {
            isSuspicious: isPrecise || hasExactIntervals,
            coefficientOfVariation,
            exactIntervalRatio: exactIntervals / timings.length,
            details: { mean, stdDev, exactIntervals }
        };
    }

    analyzeVolumePatterns(volumes) {
        if (volumes.length < 5) return { isSuspicious: false };

        // Count identical volumes
        const volumeCounts = {};
        volumes.forEach(vol => {
            volumeCounts[vol] = (volumeCounts[vol] || 0) + 1;
        });

        const maxRepeats = Math.max(...Object.values(volumeCounts));
        const identicalRatio = maxRepeats / volumes.length;

        // Check for suspiciously identical volumes
        const isSuspicious = identicalRatio > 0.7 || maxRepeats > 20;

        return {
            isSuspicious,
            identicalRatio,
            maxRepeats,
            uniqueVolumes: Object.keys(volumeCounts).length
        };
    }

    analyzeFrequency(trades) {
        const now = Date.now();
        const recentTrades = trades.filter(trade => now - trade.timestamp < this.timeWindows.short);
        const tradesPerMinute = recentTrades.length;

        // Check medium-term frequency
        const mediumTrades = trades.filter(trade => now - trade.timestamp < this.timeWindows.medium);
        const avgTradesPerMinute = mediumTrades.length / 5;

        const isSuspicious = tradesPerMinute > this.thresholds.maxTradesPerMinute || 
                           avgTradesPerMinute > this.thresholds.maxTradesPerMinute * 0.8;

        return {
            isSuspicious,
            currentFrequency: tradesPerMinute,
            averageFrequency: avgTradesPerMinute,
            threshold: this.thresholds.maxTradesPerMinute
        };
    }

    analyzePricePatterns(prices, trades) {
        if (prices.length < 10) return { isSuspicious: false };

        // Check for systematic price targeting (e.g., always round numbers)
        const roundNumbers = prices.filter(price => price % 1 === 0 || price % 0.1 === 0).length;
        const roundRatio = roundNumbers / prices.length;

        // Check for arithmetic progressions
        const hasProgression = this.detectArithmeticProgression(prices);

        // Check for price following specific algorithms
        const algorithmicPattern = this.detectAlgorithmicPricing(trades);

        const isSuspicious = roundRatio > 0.8 || hasProgression || algorithmicPattern;

        return {
            isSuspicious,
            roundNumberRatio: roundRatio,
            hasProgression,
            algorithmicPattern
        };
    }

    analyzeMarketResponse(trades) {
        // This would integrate with market data to check response times
        // For now, simplified version checking trade timing relative to market events
        
        const quickResponses = trades.filter((trade, index) => {
            if (index === 0) return false;
            const timeDiff = trade.timestamp - trades[index - 1].timestamp;
            return timeDiff < this.thresholds.minTimeBetweenTrades;
        });

        const quickResponseRatio = quickResponses.length / Math.max(trades.length - 1, 1);
        const isSuspicious = quickResponseRatio > 0.3;

        return {
            isSuspicious,
            quickResponseRatio,
            quickResponses: quickResponses.length
        };
    }

    analyzeBehavioralConsistency(pattern) {
        // Analyze variance in trading behavior
        const timingVariance = this.calculateVariance(pattern.timings);
        const volumeVariance = this.calculateVariance(pattern.volumes);
        
        // Human traders typically show more variance
        const lowVariance = timingVariance < 1000 && volumeVariance < 0.1;
        
        // Check for patterns that never change
        const tradeTypes = [...new Set(pattern.trades.map(t => t.type))];
        const limitedTypes = tradeTypes.length < 2 && pattern.trades.length > 50;

        const isSuspicious = lowVariance || limitedTypes;

        return {
            isSuspicious,
            timingVariance,
            volumeVariance,
            tradeTypeVariety: tradeTypes.length,
            details: { lowVariance, limitedTypes }
        };
    }

    countExactIntervals(timings) {
        const intervals = {};
        timings.forEach(timing => {
            intervals[timing] = (intervals[timing] || 0) + 1;
        });
        
        return Object.values(intervals).filter(count => count > 1).reduce((a, b) => a + b, 0);
    }

    detectArithmeticProgression(prices) {
        if (prices.length < 5) return false;
        
        const diffs = [];
        for (let i = 1; i < prices.length; i++) {
            diffs.push(prices[i] - prices[i - 1]);
        }
        
        const uniqueDiffs = [...new Set(diffs.map(d => Math.round(d * 100) / 100))];
        return uniqueDiffs.length <= 2 && diffs.length > 10;
    }

    detectAlgorithmicPricing(trades) {
        // Detect if prices follow mathematical formulas
        if (trades.length < 10) return false;
        
        // Check for fibonacci sequences, geometric progressions, etc.
        const prices = trades.map(t => t.price);
        
        // Simple geometric progression check
        const ratios = [];
        for (let i = 1; i < prices.length && i < 20; i++) {
            if (prices[i - 1] !== 0) {
                ratios.push(prices[i] / prices[i - 1]);
            }
        }
        
        if (ratios.length > 5) {
            const avgRatio = ratios.reduce((a, b) => a + b, 0) / ratios.length;
            const variance = ratios.reduce((acc, ratio) => acc + Math.pow(ratio - avgRatio, 2), 0) / ratios.length;
            return variance < 0.001; // Very consistent ratio
        }
        
        return false;
    }

    calculateVariance(values) {
        if (values.length < 2) return 0;
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        return values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / values.length;
    }

    updateSuspicionScore(userId, analysisResult) {
        const currentScore = this.suspicionScores.get(userId) || 0;
        const newScore = Math.min(currentScore * 0.9 + analysisResult.botProbability * 0.1, 1.0);
        this.suspicionScores.set(userId, newScore);
    }

    getRecommendedAction(analysisResult) {
        if (analysisResult.botProbability >= this.thresholds.botProbability) {
            return 'IMMEDIATE_SUSPENSION';
        } else if (analysisResult.botProbability >= this.thresholds.suspicionLevel) {
            return 'ENHANCED_MONITORING';
        } else if (analysisResult.flags.length > 0) {
            return 'ROUTINE_MONITORING';
        }
        return 'NO_ACTION';
    }

    // Get user risk assessment
    getUserRiskAssessment(userId) {
        const pattern = this.patterns.get(userId);
        const suspicionScore = this.suspicionScores.get(userId) || 0;
        
        if (!pattern) {
            return { risk: 'UNKNOWN', reason: 'No trading data available' };
        }

        if (suspicionScore >= this.thresholds.botProbability) {
            return { risk: 'HIGH', reason: 'High bot probability detected' };
        } else if (suspicionScore >= this.thresholds.suspicionLevel) {
            return { risk: 'MEDIUM', reason: 'Suspicious patterns detected' };
        } else {
            return { risk: 'LOW', reason: 'Normal trading patterns' };
        }
    }

    // Generate comprehensive report
    generateSecurityReport(userId) {
        const pattern = this.patterns.get(userId);
        const suspicionScore = this.suspicionScores.get(userId) || 0;
        
        if (!pattern) {
            return { error: 'No data available for user' };
        }

        const analysisResult = this.runDetectionAlgorithms(userId, pattern);
        
        return {
            userId,
            timestamp: Date.now(),
            suspicionScore,
            botProbability: analysisResult.botProbability,
            riskLevel: this.getUserRiskAssessment(userId).risk,
            flags: analysisResult.flags,
            statistics: {
                totalTrades: pattern.trades.length,
                timeSpan: pattern.trades.length > 0 ? Date.now() - pattern.trades[0].timestamp : 0,
                averageVolume: pattern.volumes.reduce((a, b) => a + b, 0) / pattern.volumes.length,
                averageTimingInterval: pattern.timings.reduce((a, b) => a + b, 0) / pattern.timings.length
            },
            detailedAnalysis: analysisResult.details
        };
    }
}

module.exports = TradePatternAnalyzer;
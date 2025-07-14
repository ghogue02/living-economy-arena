/**
 * Market Volatility System Based on Agent Psychology Aggregation
 * Models how collective AI agent emotions and behaviors drive market volatility
 */

const Decimal = require('decimal.js');
const EventEmitter = require('eventemitter3');

class MarketPsychologyEngine extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            sentimentWeight: config.sentimentWeight || 0.4,
            fearWeight: config.fearWeight || 0.3,
            greedWeight: config.greedWeight || 0.3,
            herdingThreshold: config.herdingThreshold || 0.7,
            panicThreshold: config.panicThreshold || 0.8,
            euphoriaBias: config.euphoriaBias || 0.15,
            memoryDecay: config.memoryDecay || 0.95,
            ...config
        };

        this.psychologyState = {
            globalSentiment: 0.5, // 0 = extreme fear, 1 = extreme greed
            fearIndex: 0.5,
            greedIndex: 0.5,
            herdingFactor: 0,
            confidenceLevel: 0.5,
            marketMemory: [],
            volatilityMultiplier: 1.0,
            dominantEmotion: 'neutral'
        };

        this.agentPsychology = new Map();
        this.sentimentHistory = [];
    }

    /**
     * Update market psychology based on aggregate agent behaviors
     */
    updateMarketPsychology(agents, marketData) {
        const psychologyMetrics = this.aggregateAgentPsychology(agents);
        const marketInfluence = this.calculateMarketInfluence(marketData);
        
        // Update global sentiment
        this.psychologyState.globalSentiment = this.calculateGlobalSentiment(
            psychologyMetrics,
            marketInfluence
        );
        
        // Update fear and greed indices
        this.updateFearGreedIndex(psychologyMetrics, marketData);
        
        // Calculate herding behavior
        this.psychologyState.herdingFactor = this.calculateHerdingFactor(psychologyMetrics);
        
        // Update confidence level
        this.psychologyState.confidenceLevel = this.calculateConfidenceLevel(
            psychologyMetrics,
            marketData
        );
        
        // Calculate volatility multiplier
        this.psychologyState.volatilityMultiplier = this.calculateVolatilityMultiplier();
        
        // Determine dominant emotion
        this.psychologyState.dominantEmotion = this.getDominantEmotion();
        
        // Store in memory with decay
        this.updateMarketMemory();
        
        // Emit psychology update
        this.emit('psychology_update', this.psychologyState);
        
        return this.psychologyState;
    }

    /**
     * Aggregate individual agent psychology into market-wide metrics
     */
    aggregateAgentPsychology(agents) {
        let totalSentiment = 0;
        let totalFear = 0;
        let totalGreed = 0;
        let totalConfidence = 0;
        let activeAgents = 0;
        
        const sentimentClusters = { bearish: 0, neutral: 0, bullish: 0 };
        const behaviorTypes = { conservative: 0, balanced: 0, aggressive: 0 };
        
        for (const [agentId, agent] of agents) {
            if (!agent.isActive) continue;
            
            const psychology = agent.psychology || this.getDefaultPsychology();
            
            totalSentiment += psychology.sentiment || 0.5;
            totalFear += psychology.fear || 0.5;
            totalGreed += psychology.greed || 0.5;
            totalConfidence += psychology.confidence || 0.5;
            activeAgents++;
            
            // Cluster analysis
            if (psychology.sentiment < 0.3) sentimentClusters.bearish++;
            else if (psychology.sentiment > 0.7) sentimentClusters.bullish++;
            else sentimentClusters.neutral++;
            
            // Behavior type analysis
            const behaviorType = psychology.behaviorType || 'balanced';
            behaviorTypes[behaviorType] = (behaviorTypes[behaviorType] || 0) + 1;
        }
        
        if (activeAgents === 0) {
            return this.getDefaultAggregatedPsychology();
        }
        
        return {
            averageSentiment: totalSentiment / activeAgents,
            averageFear: totalFear / activeAgents,
            averageGreed: totalGreed / activeAgents,
            averageConfidence: totalConfidence / activeAgents,
            activeAgents,
            sentimentClusters,
            behaviorTypes,
            sentimentVariance: this.calculateSentimentVariance(agents, totalSentiment / activeAgents)
        };
    }

    /**
     * Calculate sentiment variance (how much agents disagree)
     */
    calculateSentimentVariance(agents, averageSentiment) {
        let variance = 0;
        let count = 0;
        
        for (const [agentId, agent] of agents) {
            if (!agent.isActive) continue;
            
            const sentiment = agent.psychology?.sentiment || 0.5;
            variance += Math.pow(sentiment - averageSentiment, 2);
            count++;
        }
        
        return count > 0 ? variance / count : 0;
    }

    /**
     * Calculate market influence from price movements and volume
     */
    calculateMarketInfluence(marketData) {
        const priceMovements = [];
        const volumes = [];
        
        for (const [marketId, market] of marketData) {
            if (market.priceHistory && market.priceHistory.length >= 2) {
                const recent = market.priceHistory.slice(-10);
                const priceChange = (recent[recent.length - 1].price - recent[0].price) / recent[0].price;
                priceMovements.push(priceChange);
                volumes.push(market.totalVolume || 0);
            }
        }
        
        const averagePriceMovement = priceMovements.length > 0 
            ? priceMovements.reduce((sum, mv) => sum + mv, 0) / priceMovements.length 
            : 0;
            
        const totalVolume = volumes.reduce((sum, vol) => sum + vol, 0);
        const volumeIntensity = Math.min(totalVolume / 1000000, 2); // Normalize volume
        
        return {
            priceMovement: averagePriceMovement,
            volumeIntensity,
            marketMomentum: averagePriceMovement * volumeIntensity
        };
    }

    /**
     * Calculate global sentiment incorporating all factors
     */
    calculateGlobalSentiment(psychologyMetrics, marketInfluence) {
        const baseSentiment = psychologyMetrics.averageSentiment;
        
        // Adjust for market momentum
        const momentumAdjustment = marketInfluence.marketMomentum * 0.2;
        
        // Adjust for sentiment variance (high disagreement reduces sentiment extremes)
        const varianceAdjustment = (psychologyMetrics.sentimentVariance - 0.1) * 0.3;
        
        // Apply memory decay from previous sentiment
        const memoryInfluence = this.psychologyState.globalSentiment * this.config.memoryDecay;
        const newInfluence = 1 - this.config.memoryDecay;
        
        let newSentiment = baseSentiment + momentumAdjustment - varianceAdjustment;
        newSentiment = memoryInfluence + (newSentiment * newInfluence);
        
        // Clamp between 0 and 1
        return Math.max(0, Math.min(1, newSentiment));
    }

    /**
     * Update fear and greed indices
     */
    updateFearGreedIndex(psychologyMetrics, marketData) {
        // Fear increases with: market decline, high volatility, low confidence
        let fearFactors = 0;
        fearFactors += (1 - psychologyMetrics.averageConfidence) * 0.4;
        fearFactors += psychologyMetrics.averageFear * 0.6;
        
        // Greed increases with: market gains, high confidence, recent profits
        let greedFactors = 0;
        greedFactors += psychologyMetrics.averageConfidence * 0.4;
        greedFactors += psychologyMetrics.averageGreed * 0.6;
        
        // Apply memory decay
        this.psychologyState.fearIndex = this.psychologyState.fearIndex * this.config.memoryDecay 
            + fearFactors * (1 - this.config.memoryDecay);
        this.psychologyState.greedIndex = this.psychologyState.greedIndex * this.config.memoryDecay 
            + greedFactors * (1 - this.config.memoryDecay);
        
        // Normalize
        this.psychologyState.fearIndex = Math.max(0, Math.min(1, this.psychologyState.fearIndex));
        this.psychologyState.greedIndex = Math.max(0, Math.min(1, this.psychologyState.greedIndex));
    }

    /**
     * Calculate herding behavior factor
     */
    calculateHerdingFactor(psychologyMetrics) {
        // Herding occurs when many agents have similar sentiment (low variance)
        const sentimentUniformity = 1 - psychologyMetrics.sentimentVariance;
        
        // Strong herding when uniformity is high and sentiment is extreme
        const sentimentExtremity = Math.abs(psychologyMetrics.averageSentiment - 0.5) * 2;
        
        return sentimentUniformity * sentimentExtremity;
    }

    /**
     * Calculate overall market confidence level
     */
    calculateConfidenceLevel(psychologyMetrics, marketData) {
        let confidence = psychologyMetrics.averageConfidence;
        
        // Reduce confidence during high volatility
        const volatility = this.calculateMarketVolatility(marketData);
        confidence *= (1 - volatility * 0.3);
        
        // Reduce confidence when sentiment is very extreme
        const sentimentExtremity = Math.abs(this.psychologyState.globalSentiment - 0.5) * 2;
        confidence *= (1 - sentimentExtremity * 0.2);
        
        return Math.max(0, Math.min(1, confidence));
    }

    /**
     * Calculate current market volatility
     */
    calculateMarketVolatility(marketData) {
        let totalVolatility = 0;
        let marketCount = 0;
        
        for (const [marketId, market] of marketData) {
            if (market.priceHistory && market.priceHistory.length >= 10) {
                const prices = market.priceHistory.slice(-10).map(p => p.price);
                const volatility = this.calculatePriceVolatility(prices);
                totalVolatility += volatility;
                marketCount++;
            }
        }
        
        return marketCount > 0 ? totalVolatility / marketCount : 0;
    }

    /**
     * Calculate price volatility from price series
     */
    calculatePriceVolatility(prices) {
        if (prices.length < 2) return 0;
        
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push((prices[i] - prices[i-1]) / prices[i-1]);
        }
        
        const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
        const variance = returns.reduce((sum, r) => sum + Math.pow(r - meanReturn, 2), 0) / returns.length;
        
        return Math.sqrt(variance);
    }

    /**
     * Calculate volatility multiplier based on psychology
     */
    calculateVolatilityMultiplier() {
        let multiplier = 1.0;
        
        // Fear increases volatility
        multiplier += this.psychologyState.fearIndex * this.config.fearWeight;
        
        // Greed can increase volatility (bubbles)
        multiplier += this.psychologyState.greedIndex * this.config.greedWeight;
        
        // Herding behavior amplifies volatility
        multiplier += this.psychologyState.herdingFactor * 0.5;
        
        // Low confidence increases volatility
        multiplier += (1 - this.psychologyState.confidenceLevel) * 0.3;
        
        // Extreme sentiment increases volatility
        const sentimentExtremity = Math.abs(this.psychologyState.globalSentiment - 0.5) * 2;
        multiplier += sentimentExtremity * 0.4;
        
        // Clamp between 0.1 and 5.0
        return Math.max(0.1, Math.min(5.0, multiplier));
    }

    /**
     * Determine the dominant market emotion
     */
    getDominantEmotion() {
        const fear = this.psychologyState.fearIndex;
        const greed = this.psychologyState.greedIndex;
        const sentiment = this.psychologyState.globalSentiment;
        
        if (fear > this.config.panicThreshold) return 'panic';
        if (greed > this.config.panicThreshold) return 'euphoria';
        if (fear > 0.6) return 'fear';
        if (greed > 0.6) return 'greed';
        if (sentiment > 0.7) return 'optimism';
        if (sentiment < 0.3) return 'pessimism';
        
        return 'neutral';
    }

    /**
     * Update market memory with decay
     */
    updateMarketMemory() {
        this.sentimentHistory.push({
            timestamp: Date.now(),
            sentiment: this.psychologyState.globalSentiment,
            fear: this.psychologyState.fearIndex,
            greed: this.psychologyState.greedIndex,
            volatility: this.psychologyState.volatilityMultiplier
        });
        
        // Keep only last 1000 entries
        if (this.sentimentHistory.length > 1000) {
            this.sentimentHistory.shift();
        }
        
        // Apply memory decay to stored memories
        this.psychologyState.marketMemory = this.psychologyState.marketMemory.map(memory => ({
            ...memory,
            weight: memory.weight * this.config.memoryDecay
        })).filter(memory => memory.weight > 0.01);
    }

    /**
     * Get current psychology state for external systems
     */
    getPsychologyState() {
        return {
            ...this.psychologyState,
            sentimentHistory: this.sentimentHistory.slice(-100) // Last 100 points
        };
    }

    /**
     * Default psychology for new agents
     */
    getDefaultPsychology() {
        return {
            sentiment: 0.5,
            fear: 0.5,
            greed: 0.5,
            confidence: 0.5,
            behaviorType: 'balanced'
        };
    }

    /**
     * Default aggregated psychology when no agents
     */
    getDefaultAggregatedPsychology() {
        return {
            averageSentiment: 0.5,
            averageFear: 0.5,
            averageGreed: 0.5,
            averageConfidence: 0.5,
            activeAgents: 0,
            sentimentClusters: { bearish: 0, neutral: 1, bullish: 0 },
            behaviorTypes: { conservative: 0, balanced: 1, aggressive: 0 },
            sentimentVariance: 0
        };
    }

    /**
     * Update individual agent psychology
     */
    updateAgentPsychology(agentId, psychologyUpdate) {
        this.agentPsychology.set(agentId, {
            ...this.getDefaultPsychology(),
            ...psychologyUpdate,
            lastUpdate: Date.now()
        });
    }

    /**
     * Trigger market psychology events
     */
    triggerPsychologyEvent(eventType, magnitude = 1.0) {
        switch (eventType) {
            case 'market_crash':
                this.psychologyState.fearIndex = Math.min(1, this.psychologyState.fearIndex + 0.4 * magnitude);
                this.psychologyState.globalSentiment = Math.max(0, this.psychologyState.globalSentiment - 0.3 * magnitude);
                break;
            case 'bubble_burst':
                this.psychologyState.greedIndex = Math.max(0, this.psychologyState.greedIndex - 0.5 * magnitude);
                this.psychologyState.fearIndex = Math.min(1, this.psychologyState.fearIndex + 0.6 * magnitude);
                break;
            case 'euphoria':
                this.psychologyState.greedIndex = Math.min(1, this.psychologyState.greedIndex + 0.4 * magnitude);
                this.psychologyState.globalSentiment = Math.min(1, this.psychologyState.globalSentiment + 0.3 * magnitude);
                break;
            case 'uncertainty':
                this.psychologyState.confidenceLevel = Math.max(0, this.psychologyState.confidenceLevel - 0.3 * magnitude);
                break;
        }
        
        this.emit('psychology_event', { eventType, magnitude, state: this.psychologyState });
    }
}

module.exports = MarketPsychologyEngine;
/**
 * Behavioral Decision Trees for AI Traders
 * Complex decision-making algorithms based on personality traits
 */

class TradingDecisionTree {
    constructor(personalityDNA) {
        this.personality = personalityDNA;
        this.decisionHistory = [];
        this.currentMarketState = null;
        this.emotionalState = this.calculateEmotionalState();
    }

    // Main decision entry point
    makeTradeDecision(marketData, opportunity, agentMemory, relationships) {
        const context = {
            market: marketData,
            opportunity: opportunity,
            memory: agentMemory,
            relationships: relationships,
            personality: this.personality.traits,
            emotionalState: this.emotionalState
        };

        const decision = this.evaluateOpportunity(context);
        this.recordDecision(decision, context);
        this.updateEmotionalState(decision, context);
        
        return decision;
    }

    evaluateOpportunity(context) {
        // Multi-factor decision tree
        const factors = {
            riskAssessment: this.assessRisk(context),
            profitPotential: this.evaluateProfitPotential(context),
            trustLevel: this.evaluateCounterpartyTrust(context),
            marketConditions: this.analyzeMarketConditions(context),
            personalityFit: this.assessPersonalityFit(context),
            memoryInfluence: this.applyMemoryInfluence(context),
            emotionalFactors: this.processEmotionalFactors(context)
        };

        return this.synthesizeDecision(factors, context);
    }

    assessRisk(context) {
        const { opportunity, personality, market } = context;
        const baseRisk = opportunity.risk_level || 50;
        
        // Personality adjustments
        const riskTolerance = personality.risk_tolerance;
        const fear = personality.fear;
        const confidence = personality.confidence;
        
        // Market volatility adjustment
        const volatilityMultiplier = market.volatility > 70 ? 1.5 : 1.0;
        
        // Calculate perceived risk
        let perceivedRisk = baseRisk * volatilityMultiplier;
        perceivedRisk += (100 - riskTolerance) * 0.3;
        perceivedRisk += fear * 0.2;
        perceivedRisk -= confidence * 0.15;
        
        return {
            baseRisk,
            perceivedRisk: Math.max(0, Math.min(100, perceivedRisk)),
            riskAcceptable: perceivedRisk <= riskTolerance,
            riskScore: this.calculateRiskScore(perceivedRisk, riskTolerance)
        };
    }

    evaluateProfitPotential(context) {
        const { opportunity, personality, market } = context;
        const basePotential = opportunity.profit_potential || 50;
        
        // Personality influences on profit evaluation
        const greed = personality.greed;
        const optimism = personality.optimism;
        const analytical = personality.analytical_thinking;
        
        let adjustedPotential = basePotential;
        adjustedPotential += (greed - 50) * 0.4;
        adjustedPotential += (optimism - 50) * 0.2;
        
        // Analytical traders are more realistic
        if (analytical > 70) {
            adjustedPotential *= 0.85; // More conservative estimates
        }
        
        return {
            basePotential,
            adjustedPotential: Math.max(0, Math.min(100, adjustedPotential)),
            exceedsThreshold: adjustedPotential >= personality.profit_focus,
            attractiveness: this.calculateAttractiveness(adjustedPotential, personality.profit_focus)
        };
    }

    evaluateCounterpartyTrust(context) {
        const { opportunity, relationships, personality } = context;
        const counterparty = opportunity.counterparty;
        
        if (!counterparty) return { trustLevel: 50, trustAcceptable: true };
        
        const relationship = relationships.getRelationship(counterparty);
        const baseTrust = personality.trust_propensity;
        
        let trustLevel = baseTrust;
        
        if (relationship) {
            trustLevel += relationship.trustScore * 0.6;
            trustLevel -= relationship.betrayalCount * 15;
            trustLevel += relationship.successfulTrades * 2;
            trustLevel -= relationship.failedTrades * 3;
        }
        
        return {
            trustLevel: Math.max(0, Math.min(100, trustLevel)),
            trustAcceptable: trustLevel >= 40,
            relationshipBonus: relationship ? relationship.trustScore : 0
        };
    }

    analyzeMarketConditions(context) {
        const { market, personality } = context;
        const { volatility, trend, liquidity } = market;
        
        let marketScore = 50;
        
        // Trend followers like strong trends
        if (personality.trend_following > 60) {
            marketScore += Math.abs(trend) * 0.3;
        }
        
        // Contrarians like uncertainty
        if (personality.contrarian_tendency > 60) {
            marketScore += volatility * 0.2;
        }
        
        // Risk-averse agents dislike volatility
        if (personality.risk_tolerance < 40) {
            marketScore -= volatility * 0.4;
        }
        
        return {
            marketScore: Math.max(0, Math.min(100, marketScore)),
            conditionsFavorable: marketScore >= 60,
            volatilityComfort: this.assessVolatilityComfort(volatility, personality)
        };
    }

    assessPersonalityFit(context) {
        const { opportunity, personality } = context;
        const { type, duration, complexity } = opportunity;
        
        let fitScore = 50;
        
        // Match opportunity type to personality
        switch(type) {
            case 'day_trade':
                fitScore += personality.impulsiveness * 0.3;
                fitScore += (100 - personality.patience) * 0.2;
                break;
            case 'long_term':
                fitScore += personality.patience * 0.4;
                fitScore += personality.analytical_thinking * 0.2;
                break;
            case 'arbitrage':
                fitScore += personality.arbitrage_detection * 0.5;
                fitScore += personality.timing_skill * 0.3;
                break;
            case 'speculation':
                fitScore += personality.speculation_appetite * 0.4;
                fitScore += personality.risk_tolerance * 0.2;
                break;
        }
        
        return {
            fitScore: Math.max(0, Math.min(100, fitScore)),
            personalityMatch: fitScore >= 60,
            styleCompatibility: this.checkStyleCompatibility(type, personality)
        };
    }

    applyMemoryInfluence(context) {
        const { memory, opportunity, personality } = context;
        const relevantMemories = memory.getRelevantMemories(opportunity);
        
        let memoryBias = 0;
        let confidenceAdjustment = 0;
        
        relevantMemories.forEach(mem => {
            if (mem.outcome === 'positive') {
                memoryBias += mem.intensity * 0.1;
                confidenceAdjustment += 2;
            } else {
                memoryBias -= mem.intensity * 0.15;
                confidenceAdjustment -= 3;
            }
        });
        
        // Apply availability bias
        if (personality.availability_bias > 60) {
            memoryBias *= 1.5;
        }
        
        return {
            memoryBias,
            confidenceAdjustment,
            relevantMemoryCount: relevantMemories.length,
            memoryInfluence: this.calculateMemoryInfluence(memoryBias, personality)
        };
    }

    processEmotionalFactors(context) {
        const { personality } = context;
        const currentEmotion = this.emotionalState;
        
        let emotionalModifier = 0;
        
        // Fear reduces risk-taking
        if (currentEmotion.fear > 60) {
            emotionalModifier -= 20;
        }
        
        // Greed increases risk-taking
        if (currentEmotion.greed > 70) {
            emotionalModifier += 15;
        }
        
        // Anger can lead to revenge trading
        if (currentEmotion.anger > 50 && personality.revenge_trading > 60) {
            emotionalModifier += 25; // Dangerous impulsive behavior
        }
        
        // Euphoria leads to overconfidence
        if (currentEmotion.euphoria > 60) {
            emotionalModifier += personality.overconfidence_bias * 0.2;
        }
        
        return {
            emotionalModifier,
            dominantEmotion: this.getDominantEmotion(),
            emotionalStability: personality.emotional_stability,
            shouldDelay: this.shouldDelayDecision(currentEmotion, personality)
        };
    }

    synthesizeDecision(factors, context) {
        const weights = this.calculateFactorWeights(context.personality);
        let totalScore = 0;
        
        // Weighted combination of all factors
        totalScore += factors.riskAssessment.riskScore * weights.risk;
        totalScore += factors.profitPotential.attractiveness * weights.profit;
        totalScore += factors.trustLevel.trustLevel * weights.trust;
        totalScore += factors.marketConditions.marketScore * weights.market;
        totalScore += factors.personalityFit.fitScore * weights.personality;
        totalScore += factors.memoryInfluence.memoryInfluence * weights.memory;
        totalScore += factors.emotionalFactors.emotionalModifier * weights.emotion;
        
        const decision = {
            action: this.determineAction(totalScore, factors),
            confidence: this.calculateConfidence(totalScore, factors),
            reasoning: this.generateReasoning(factors),
            score: totalScore,
            factors: factors,
            timestamp: Date.now()
        };
        
        return this.validateDecision(decision, context);
    }

    calculateFactorWeights(personality) {
        return {
            risk: 0.25 + (personality.risk_tolerance - 50) * 0.002,
            profit: 0.20 + (personality.greed - 50) * 0.002,
            trust: 0.15 + (personality.trust_propensity - 50) * 0.002,
            market: 0.15 + (personality.analytical_thinking - 50) * 0.001,
            personality: 0.10,
            memory: 0.10 + (personality.memory_retention - 50) * 0.001,
            emotion: 0.05 + (100 - personality.emotional_stability) * 0.001
        };
    }

    determineAction(score, factors) {
        if (score > 70) return 'EXECUTE_TRADE';
        if (score > 50) return 'NEGOTIATE_TERMS';
        if (score > 30) return 'GATHER_MORE_INFO';
        return 'REJECT_OPPORTUNITY';
    }

    calculateConfidence(score, factors) {
        let confidence = Math.min(100, Math.abs(score - 50) * 2);
        
        // Adjust for personality traits
        if (this.personality.traits.overconfidence_bias > 70) {
            confidence *= 1.2;
        }
        if (this.personality.traits.confidence > 80) {
            confidence += 10;
        }
        
        return Math.min(100, confidence);
    }

    generateReasoning(factors) {
        const reasons = [];
        
        if (factors.riskAssessment.riskAcceptable) {
            reasons.push('Risk within acceptable range');
        } else {
            reasons.push('Risk too high for comfort level');
        }
        
        if (factors.profitPotential.exceedsThreshold) {
            reasons.push('Profit potential meets requirements');
        }
        
        if (factors.trustLevel.trustAcceptable) {
            reasons.push('Counterparty trust level adequate');
        } else {
            reasons.push('Trust concerns with counterparty');
        }
        
        return reasons.join('; ');
    }

    // Emotional state management
    calculateEmotionalState() {
        const p = this.personality.traits;
        return {
            fear: p.fear + Math.random() * 20 - 10,
            greed: p.greed + Math.random() * 20 - 10,
            anger: Math.random() * 40,
            euphoria: Math.random() * 40,
            anxiety: p.stress_tolerance < 50 ? 60 : 30
        };
    }

    updateEmotionalState(decision, context) {
        // Emotional reactions to decisions and outcomes
        if (decision.action === 'REJECT_OPPORTUNITY') {
            this.emotionalState.fear += 5;
        } else if (decision.action === 'EXECUTE_TRADE') {
            this.emotionalState.euphoria += 10;
            this.emotionalState.greed += 5;
        }
        
        // Decay emotions over time
        Object.keys(this.emotionalState).forEach(emotion => {
            this.emotionalState[emotion] *= 0.95;
        });
    }

    recordDecision(decision, context) {
        this.decisionHistory.push({
            decision,
            context: {
                opportunity: context.opportunity,
                marketState: context.market,
                emotionalState: { ...this.emotionalState }
            },
            timestamp: Date.now()
        });
        
        // Keep last 100 decisions
        if (this.decisionHistory.length > 100) {
            this.decisionHistory.shift();
        }
    }

    // Utility methods
    calculateRiskScore(perceivedRisk, tolerance) {
        return Math.max(0, 100 - Math.abs(perceivedRisk - tolerance));
    }

    calculateAttractiveness(potential, threshold) {
        return potential > threshold ? potential : potential * 0.5;
    }

    shouldDelayDecision(emotion, personality) {
        const emotionalIntensity = Object.values(emotion).reduce((a, b) => a + b, 0) / 5;
        return emotionalIntensity > 70 && personality.emotional_stability < 40;
    }

    getDominantEmotion() {
        return Object.entries(this.emotionalState)
            .sort(([,a], [,b]) => b - a)[0][0];
    }

    validateDecision(decision, context) {
        // Apply final personality-based filters
        const p = this.personality.traits;
        
        // Impulsive personalities might ignore analysis
        if (p.impulsiveness > 80 && Math.random() > 0.7) {
            decision.action = 'EXECUTE_TRADE';
            decision.reasoning += '; Impulsive override';
        }
        
        // Very conservative personalities add extra checks
        if (p.risk_tolerance < 20 && decision.action === 'EXECUTE_TRADE') {
            decision.action = 'GATHER_MORE_INFO';
            decision.reasoning += '; Conservative caution';
        }
        
        return decision;
    }
}

module.exports = TradingDecisionTree;
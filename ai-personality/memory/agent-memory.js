/**
 * Agent Memory System
 * Persistent memory for AI traders to remember past trades, betrayals, partnerships
 */

class AgentMemory {
    constructor(agentId) {
        this.agentId = agentId;
        this.experiences = [];
        this.relationships = new Map();
        this.marketMemories = [];
        this.personalLearnings = [];
        this.tradeHistory = [];
        this.emotionalMemories = [];
        this.memoryWeights = this.initializeMemoryWeights();
    }

    initializeMemoryWeights() {
        return {
            recent: 1.0,         // Recent memories are more influential
            significant: 1.5,    // High-impact events weighted more
            emotional: 1.3,      // Emotional memories are sticky
            repeated: 1.2,       // Patterns that repeat get emphasis
            successful: 1.1,     // Success reinforces memory
            traumatic: 2.0       // Traumatic events have lasting impact
        };
    }

    // Store different types of memories
    recordTradeExperience(trade, outcome, emotional_impact = 50) {
        const experience = {
            id: this.generateMemoryId(),
            type: 'trade',
            timestamp: Date.now(),
            data: {
                trade: trade,
                outcome: outcome,
                profit_loss: trade.profit_loss,
                counterparty: trade.counterparty,
                market_conditions: trade.market_context,
                decision_factors: trade.decision_reasoning
            },
            emotional_impact: emotional_impact,
            significance: this.calculateSignificance(trade, outcome),
            tags: this.generateTags(trade, outcome),
            decay_rate: this.calculateDecayRate(emotional_impact)
        };

        this.experiences.push(experience);
        this.updateRelationshipMemory(trade.counterparty, outcome, trade);
        this.consolidateMemories();
        
        return experience.id;
    }

    recordBetrayalEvent(counterparty, betrayalType, context, damage = 100) {
        const betrayal = {
            id: this.generateMemoryId(),
            type: 'betrayal',
            timestamp: Date.now(),
            data: {
                counterparty: counterparty,
                betrayal_type: betrayalType,
                context: context,
                damage_amount: damage,
                trust_before: this.getTrustLevel(counterparty),
                market_conditions: context.market_state
            },
            emotional_impact: 90, // Betrayals are highly emotional
            significance: Math.min(100, damage / 10 + 50),
            tags: ['betrayal', 'trust_loss', betrayalType, counterparty],
            decay_rate: 0.85 // Betrayals fade slowly
        };

        this.emotionalMemories.push(betrayal);
        this.updateRelationshipMemory(counterparty, 'betrayal', { damage });
        this.triggerEmotionalResponse('anger', 'distrust');
    }

    recordPartnershipSuccess(counterparty, collaboration, mutual_benefit) {
        const partnership = {
            id: this.generateMemoryId(),
            type: 'partnership',
            timestamp: Date.now(),
            data: {
                counterparty: counterparty,
                collaboration_type: collaboration.type,
                mutual_benefit: mutual_benefit,
                trust_level: this.getTrustLevel(counterparty),
                success_metrics: collaboration.results
            },
            emotional_impact: 70,
            significance: mutual_benefit / 5 + 30,
            tags: ['partnership', 'cooperation', 'mutual_benefit', counterparty],
            decay_rate: 0.95
        };

        this.experiences.push(partnership);
        this.updateRelationshipMemory(counterparty, 'cooperation', collaboration);
        this.triggerEmotionalResponse('trust', 'satisfaction');
    }

    recordMarketPattern(pattern, accuracy, profitability) {
        const marketMemory = {
            id: this.generateMemoryId(),
            type: 'market_pattern',
            timestamp: Date.now(),
            data: {
                pattern: pattern,
                accuracy: accuracy,
                profitability: profitability,
                market_conditions: pattern.context,
                indicators: pattern.indicators,
                timeframe: pattern.timeframe
            },
            emotional_impact: profitability > 0 ? 60 : 30,
            significance: accuracy * profitability / 100,
            tags: ['market', 'pattern', pattern.type, pattern.timeframe],
            decay_rate: 0.90
        };

        this.marketMemories.push(marketMemory);
        this.personalLearnings.push({
            learning: `Pattern ${pattern.type} in ${pattern.timeframe} conditions`,
            confidence: accuracy,
            profitability: profitability,
            timestamp: Date.now()
        });
    }

    // Relationship memory management
    updateRelationshipMemory(counterparty, outcome, context) {
        if (!this.relationships.has(counterparty)) {
            this.relationships.set(counterparty, {
                trustScore: 50,
                interactions: [],
                betrayalCount: 0,
                successfulTrades: 0,
                failedTrades: 0,
                totalVolume: 0,
                avgProfitability: 0,
                emotionalHistory: [],
                lastInteraction: Date.now(),
                relationship_type: 'unknown'
            });
        }

        const relationship = this.relationships.get(counterparty);
        
        // Update based on outcome
        switch(outcome) {
            case 'successful':
                relationship.trustScore = Math.min(100, relationship.trustScore + 5);
                relationship.successfulTrades++;
                break;
            case 'failed':
                relationship.trustScore = Math.max(0, relationship.trustScore - 3);
                relationship.failedTrades++;
                break;
            case 'betrayal':
                relationship.trustScore = Math.max(0, relationship.trustScore - 25);
                relationship.betrayalCount++;
                break;
            case 'cooperation':
                relationship.trustScore = Math.min(100, relationship.trustScore + 8);
                break;
        }

        // Record interaction
        relationship.interactions.push({
            outcome: outcome,
            context: context,
            timestamp: Date.now(),
            trust_change: relationship.trustScore
        });

        // Update relationship classification
        relationship.relationship_type = this.classifyRelationship(relationship);
        relationship.lastInteraction = Date.now();
    }

    classifyRelationship(relationshipData) {
        const { trustScore, betrayalCount, successfulTrades, failedTrades } = relationshipData;
        
        if (betrayalCount > 2) return 'enemy';
        if (trustScore > 80 && successfulTrades > 5) return 'trusted_partner';
        if (trustScore > 60 && successfulTrades > failedTrades * 2) return 'reliable_contact';
        if (trustScore < 30 || failedTrades > successfulTrades * 2) return 'unreliable';
        if (successfulTrades + failedTrades < 3) return 'unknown';
        return 'neutral';
    }

    // Memory retrieval and analysis
    getRelevantMemories(context, limit = 10) {
        const { opportunity, market_state, counterparty } = context;
        const relevantMemories = [];

        // Get memories related to similar opportunities
        this.experiences.forEach(memory => {
            const relevance = this.calculateRelevance(memory, context);
            if (relevance > 30) {
                relevantMemories.push({
                    ...memory,
                    relevance: relevance,
                    weight: this.calculateMemoryWeight(memory)
                });
            }
        });

        // Sort by relevance and weight
        relevantMemories.sort((a, b) => (b.relevance * b.weight) - (a.relevance * a.weight));
        
        return relevantMemories.slice(0, limit);
    }

    calculateRelevance(memory, context) {
        let relevance = 0;
        
        // Type matching
        if (memory.type === 'trade' && context.opportunity) {
            relevance += 40;
            
            // Counterparty matching
            if (memory.data.counterparty === context.counterparty) {
                relevance += 30;
            }
            
            // Market condition similarity
            const marketSimilarity = this.calculateMarketSimilarity(
                memory.data.market_conditions, 
                context.market_state
            );
            relevance += marketSimilarity * 20;
        }
        
        // Time decay
        const age = (Date.now() - memory.timestamp) / (1000 * 60 * 60 * 24); // days
        const timeDecay = Math.exp(-age / 30); // 30-day half-life
        relevance *= timeDecay;
        
        return relevance;
    }

    calculateMemoryWeight(memory) {
        let weight = 1.0;
        
        // Apply significance weighting
        weight *= (memory.significance / 50);
        
        // Apply emotional impact
        weight *= (1 + memory.emotional_impact / 200);
        
        // Apply specific memory type weights
        if (memory.tags.includes('betrayal')) weight *= this.memoryWeights.traumatic;
        if (memory.tags.includes('success')) weight *= this.memoryWeights.successful;
        if (memory.emotional_impact > 70) weight *= this.memoryWeights.emotional;
        
        return weight;
    }

    calculateMarketSimilarity(market1, market2) {
        if (!market1 || !market2) return 0;
        
        const volatilitySim = 1 - Math.abs(market1.volatility - market2.volatility) / 100;
        const trendSim = 1 - Math.abs(market1.trend - market2.trend) / 100;
        const liquiditySim = 1 - Math.abs(market1.liquidity - market2.liquidity) / 100;
        
        return (volatilitySim + trendSim + liquiditySim) / 3 * 100;
    }

    // Trust and relationship queries
    getTrustLevel(counterparty) {
        const relationship = this.relationships.get(counterparty);
        return relationship ? relationship.trustScore : 50; // Default neutral trust
    }

    getRelationship(counterparty) {
        return this.relationships.get(counterparty) || null;
    }

    getTrustedPartners(minTrust = 70) {
        const trusted = [];
        this.relationships.forEach((data, counterparty) => {
            if (data.trustScore >= minTrust && data.relationship_type === 'trusted_partner') {
                trusted.push({
                    counterparty: counterparty,
                    trustScore: data.trustScore,
                    interactions: data.interactions.length,
                    type: data.relationship_type
                });
            }
        });
        return trusted.sort((a, b) => b.trustScore - a.trustScore);
    }

    getEnemies() {
        const enemies = [];
        this.relationships.forEach((data, counterparty) => {
            if (data.relationship_type === 'enemy' || data.betrayalCount > 0) {
                enemies.push({
                    counterparty: counterparty,
                    betrayalCount: data.betrayalCount,
                    trustScore: data.trustScore,
                    threat_level: this.calculateThreatLevel(data)
                });
            }
        });
        return enemies.sort((a, b) => b.threat_level - a.threat_level);
    }

    calculateThreatLevel(relationshipData) {
        return relationshipData.betrayalCount * 25 + 
               (100 - relationshipData.trustScore) * 0.5 +
               relationshipData.failedTrades * 5;
    }

    // Memory consolidation and optimization
    consolidateMemories() {
        // Remove very old, low-significance memories
        const cutoffTime = Date.now() - (90 * 24 * 60 * 60 * 1000); // 90 days
        
        this.experiences = this.experiences.filter(memory => {
            return memory.timestamp > cutoffTime || 
                   memory.significance > 70 || 
                   memory.emotional_impact > 80;
        });

        // Consolidate similar experiences
        this.consolidateSimilarExperiences();
        
        // Update memory weights based on patterns
        this.updateMemoryWeights();
    }

    consolidateSimilarExperiences() {
        // Group similar experiences and create pattern memories
        const patterns = this.identifyPatterns();
        patterns.forEach(pattern => {
            if (pattern.frequency > 3) {
                this.personalLearnings.push({
                    learning: pattern.description,
                    confidence: pattern.confidence,
                    evidence_count: pattern.frequency,
                    timestamp: Date.now()
                });
            }
        });
    }

    identifyPatterns() {
        // Simple pattern identification
        const patterns = [];
        
        // Market condition patterns
        const marketGroups = this.groupBy(this.marketMemories, m => 
            `${Math.floor(m.data.market_conditions.volatility/20)}_${Math.floor(m.data.market_conditions.trend/20)}`
        );
        
        Object.entries(marketGroups).forEach(([key, memories]) => {
            if (memories.length > 3) {
                const avgProfitability = memories.reduce((sum, m) => sum + m.data.profitability, 0) / memories.length;
                patterns.push({
                    type: 'market_condition',
                    description: `Market pattern ${key} typically ${avgProfitability > 0 ? 'profitable' : 'unprofitable'}`,
                    frequency: memories.length,
                    confidence: Math.min(95, memories.length * 15),
                    profitability: avgProfitability
                });
            }
        });
        
        return patterns;
    }

    updateMemoryWeights() {
        // Adjust memory weights based on recent performance
        const recentSuccesses = this.experiences.filter(e => 
            e.timestamp > Date.now() - (7 * 24 * 60 * 60 * 1000) && 
            e.data.outcome === 'successful'
        ).length;
        
        if (recentSuccesses > 5) {
            this.memoryWeights.successful *= 1.1;
        } else if (recentSuccesses < 2) {
            this.memoryWeights.successful *= 0.95;
        }
    }

    // Emotional processing
    triggerEmotionalResponse(primary_emotion, secondary_emotion = null) {
        const emotionalEvent = {
            primary: primary_emotion,
            secondary: secondary_emotion,
            intensity: 70 + Math.random() * 30,
            timestamp: Date.now(),
            context: 'memory_processing'
        };
        
        this.emotionalMemories.push(emotionalEvent);
        
        // Keep last 50 emotional memories
        if (this.emotionalMemories.length > 50) {
            this.emotionalMemories.shift();
        }
    }

    // Utility methods
    generateMemoryId() {
        return `mem_${this.agentId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    calculateSignificance(trade, outcome) {
        let significance = 50;
        
        // Large trades are more significant
        significance += Math.min(30, Math.abs(trade.profit_loss) / 100);
        
        // Unexpected outcomes are more significant
        if (outcome !== trade.expected_outcome) {
            significance += 20;
        }
        
        // First-time counterparties are significant
        if (!this.relationships.has(trade.counterparty)) {
            significance += 15;
        }
        
        return Math.min(100, significance);
    }

    generateTags(trade, outcome) {
        const tags = [outcome, trade.type, trade.asset_class];
        
        if (trade.counterparty) tags.push(trade.counterparty);
        if (trade.profit_loss > 100) tags.push('large_profit');
        if (trade.profit_loss < -100) tags.push('large_loss');
        if (trade.duration < 3600) tags.push('short_term');
        if (trade.duration > 86400) tags.push('long_term');
        
        return tags;
    }

    calculateDecayRate(emotional_impact) {
        // Higher emotional impact means slower decay
        return 0.8 + (emotional_impact / 500);
    }

    groupBy(array, keyFn) {
        return array.reduce((groups, item) => {
            const key = keyFn(item);
            groups[key] = groups[key] || [];
            groups[key].push(item);
            return groups;
        }, {});
    }

    // Public interface for memory queries
    getMemoryStats() {
        return {
            total_experiences: this.experiences.length,
            total_relationships: this.relationships.size,
            trusted_partners: this.getTrustedPartners().length,
            enemies: this.getEnemies().length,
            market_patterns: this.personalLearnings.length,
            emotional_memories: this.emotionalMemories.length,
            memory_health: this.calculateMemoryHealth()
        };
    }

    calculateMemoryHealth() {
        const recentMemories = this.experiences.filter(e => 
            e.timestamp > Date.now() - (30 * 24 * 60 * 60 * 1000)
        ).length;
        
        const healthScore = Math.min(100, (recentMemories * 10) + 
                                    (this.relationships.size * 5) + 
                                    (this.personalLearnings.length * 3));
        return healthScore;
    }
}

module.exports = AgentMemory;
/**
 * Meta-Knowledge Base for storing and managing meta-learning insights
 * Handles knowledge about knowledge, learning patterns, and strategic insights
 */

class MetaKnowledgeBase {
    constructor() {
        this.metaKnowledge = new Map();
        this.knowledgeIndex = new Map();
        this.conceptualHierarchy = new ConceptualHierarchy();
        this.knowledgeGraph = new KnowledgeGraph('meta_knowledge');
        this.confidence_tracker = new ConfidenceTracker();
        this.usage_statistics = new Map();
        this.knowledge_relationships = new Map();
        this.temporal_knowledge = new TemporalKnowledgeManager();
    }

    updateMetaKnowledge(metaLearningEvent) {
        const knowledgeUpdates = this.extractKnowledgeFromEvent(metaLearningEvent);
        
        knowledgeUpdates.forEach(update => {
            this.storeMetaKnowledge(update);
            this.updateKnowledgeRelationships(update);
            this.updateConceptualHierarchy(update);
            this.trackConfidence(update);
        });

        this.consolidateKnowledge();
        this.pruneOutdatedKnowledge();
    }

    extractKnowledgeFromEvent(event) {
        const knowledgeUpdates = [];

        // Extract insights as meta-knowledge
        event.learning_insights.forEach(insight => {
            knowledgeUpdates.push({
                type: 'learning_insight',
                content: insight,
                source: 'meta_learning_event',
                timestamp: event.timestamp,
                confidence: insight.confidence,
                domain: this.inferDomain(insight),
                applicability: this.assessApplicability(insight)
            });
        });

        // Extract adaptation patterns
        event.adaptations.forEach(adaptation => {
            knowledgeUpdates.push({
                type: 'adaptation_pattern',
                content: adaptation,
                source: 'strategy_adaptation',
                timestamp: event.timestamp,
                confidence: adaptation.confidence,
                domain: adaptation.target_system || 'general',
                applicability: this.assessAdaptationApplicability(adaptation)
            });
        });

        // Extract meta-patterns
        event.meta_patterns.forEach(pattern => {
            knowledgeUpdates.push({
                type: 'meta_pattern',
                content: pattern,
                source: 'pattern_recognition',
                timestamp: event.timestamp,
                confidence: pattern.confidence,
                domain: pattern.domain_a || 'cross_domain',
                applicability: this.assessPatternApplicability(pattern)
            });
        });

        return knowledgeUpdates;
    }

    storeMetaKnowledge(knowledgeUpdate) {
        const knowledgeId = this.generateKnowledgeId(knowledgeUpdate);
        
        const metaKnowledgeEntry = {
            id: knowledgeId,
            type: knowledgeUpdate.type,
            content: knowledgeUpdate.content,
            source: knowledgeUpdate.source,
            timestamp: knowledgeUpdate.timestamp,
            confidence: knowledgeUpdate.confidence,
            domain: knowledgeUpdate.domain,
            applicability: knowledgeUpdate.applicability,
            usage_count: 0,
            last_used: null,
            effectiveness_history: [],
            relationships: [],
            conceptual_position: null,
            temporal_validity: this.assessTemporalValidity(knowledgeUpdate)
        };

        this.metaKnowledge.set(knowledgeId, metaKnowledgeEntry);
        this.indexKnowledge(metaKnowledgeEntry);
        this.knowledgeGraph.addNode(metaKnowledgeEntry);
    }

    indexKnowledge(knowledgeEntry) {
        // Index by type
        if (!this.knowledgeIndex.has(knowledgeEntry.type)) {
            this.knowledgeIndex.set(knowledgeEntry.type, []);
        }
        this.knowledgeIndex.get(knowledgeEntry.type).push(knowledgeEntry.id);

        // Index by domain
        if (!this.knowledgeIndex.has(knowledgeEntry.domain)) {
            this.knowledgeIndex.set(knowledgeEntry.domain, []);
        }
        this.knowledgeIndex.get(knowledgeEntry.domain).push(knowledgeEntry.id);

        // Index by confidence level
        const confidenceLevel = this.getConfidenceLevel(knowledgeEntry.confidence);
        if (!this.knowledgeIndex.has(confidenceLevel)) {
            this.knowledgeIndex.set(confidenceLevel, []);
        }
        this.knowledgeIndex.get(confidenceLevel).push(knowledgeEntry.id);
    }

    updateKnowledgeRelationships(knowledgeUpdate) {
        const newKnowledgeId = this.generateKnowledgeId(knowledgeUpdate);
        
        // Find related existing knowledge
        const relatedKnowledge = this.findRelatedKnowledge(knowledgeUpdate);
        
        relatedKnowledge.forEach(relatedId => {
            const relationshipType = this.determineRelationshipType(newKnowledgeId, relatedId);
            const relationshipStrength = this.calculateRelationshipStrength(newKnowledgeId, relatedId);
            
            this.addKnowledgeRelationship(newKnowledgeId, relatedId, {
                type: relationshipType,
                strength: relationshipStrength,
                created: Date.now()
            });
        });
    }

    findRelatedKnowledge(knowledgeUpdate) {
        const related = [];
        
        // Find knowledge in same domain
        const domainKnowledge = this.knowledgeIndex.get(knowledgeUpdate.domain) || [];
        related.push(...domainKnowledge);

        // Find knowledge with similar content
        const similarContent = this.findSimilarContent(knowledgeUpdate.content);
        related.push(...similarContent);

        // Find knowledge with overlapping applicability
        const overlapApplicability = this.findOverlappingApplicability(knowledgeUpdate.applicability);
        related.push(...overlapApplicability);

        return [...new Set(related)]; // Remove duplicates
    }

    findSimilarContent(content) {
        const similar = [];
        
        this.metaKnowledge.forEach((knowledge, id) => {
            const similarity = this.calculateContentSimilarity(content, knowledge.content);
            if (similarity > 0.7) {
                similar.push(id);
            }
        });

        return similar;
    }

    calculateContentSimilarity(content1, content2) {
        // Simplified content similarity calculation
        if (typeof content1 === 'string' && typeof content2 === 'string') {
            const words1 = new Set(content1.toLowerCase().split(' '));
            const words2 = new Set(content2.toLowerCase().split(' '));
            const intersection = new Set([...words1].filter(x => words2.has(x)));
            const union = new Set([...words1, ...words2]);
            return intersection.size / union.size;
        }
        
        // For object content, check property overlap
        if (typeof content1 === 'object' && typeof content2 === 'object') {
            const keys1 = new Set(Object.keys(content1));
            const keys2 = new Set(Object.keys(content2));
            const intersection = new Set([...keys1].filter(x => keys2.has(x)));
            const union = new Set([...keys1, ...keys2]);
            return intersection.size / union.size;
        }

        return 0;
    }

    updateConceptualHierarchy(knowledgeUpdate) {
        const concept = this.extractConcept(knowledgeUpdate);
        this.conceptualHierarchy.addConcept(concept);
        
        // Update the knowledge entry with its conceptual position
        const knowledgeId = this.generateKnowledgeId(knowledgeUpdate);
        const knowledge = this.metaKnowledge.get(knowledgeId);
        if (knowledge) {
            knowledge.conceptual_position = concept.position;
        }
    }

    extractConcept(knowledgeUpdate) {
        return {
            id: this.generateConceptId(knowledgeUpdate),
            type: knowledgeUpdate.type,
            domain: knowledgeUpdate.domain,
            abstraction_level: this.assessAbstractionLevel(knowledgeUpdate),
            generality: this.assessGenerality(knowledgeUpdate),
            specificity: this.assessSpecificity(knowledgeUpdate),
            position: null // Will be set by conceptual hierarchy
        };
    }

    consolidateKnowledge() {
        // Find knowledge that can be consolidated
        const consolidationCandidates = this.findConsolidationCandidates();
        
        consolidationCandidates.forEach(candidates => {
            if (candidates.length > 2) {
                const consolidatedKnowledge = this.consolidateKnowledgeGroup(candidates);
                this.replaceKnowledgeGroup(candidates, consolidatedKnowledge);
            }
        });
    }

    findConsolidationCandidates() {
        const candidates = [];
        const processed = new Set();
        
        this.metaKnowledge.forEach((knowledge, id) => {
            if (!processed.has(id)) {
                const similar = this.findHighlySimilarKnowledge(id);
                if (similar.length > 1) {
                    candidates.push(similar);
                    similar.forEach(similarId => processed.add(similarId));
                }
            }
        });

        return candidates;
    }

    findHighlySimilarKnowledge(knowledgeId) {
        const knowledge = this.metaKnowledge.get(knowledgeId);
        const similar = [knowledgeId];
        
        this.metaKnowledge.forEach((otherKnowledge, otherId) => {
            if (otherId !== knowledgeId) {
                const similarity = this.calculateKnowledgeSimilarity(knowledge, otherKnowledge);
                if (similarity > 0.85) {
                    similar.push(otherId);
                }
            }
        });

        return similar;
    }

    calculateKnowledgeSimilarity(knowledge1, knowledge2) {
        let similarity = 0;
        
        // Type similarity
        if (knowledge1.type === knowledge2.type) similarity += 0.3;
        
        // Domain similarity
        if (knowledge1.domain === knowledge2.domain) similarity += 0.2;
        
        // Content similarity
        const contentSim = this.calculateContentSimilarity(knowledge1.content, knowledge2.content);
        similarity += contentSim * 0.4;
        
        // Applicability similarity
        const applicabilitySim = this.calculateApplicabilitySimilarity(knowledge1.applicability, knowledge2.applicability);
        similarity += applicabilitySim * 0.1;

        return similarity;
    }

    consolidateKnowledgeGroup(knowledgeIds) {
        const knowledgeGroup = knowledgeIds.map(id => this.metaKnowledge.get(id));
        
        return {
            id: this.generateConsolidatedId(knowledgeIds),
            type: 'consolidated_knowledge',
            content: this.mergeKnowledgeContent(knowledgeGroup),
            source: 'knowledge_consolidation',
            timestamp: Date.now(),
            confidence: this.calculateConsolidatedConfidence(knowledgeGroup),
            domain: knowledgeGroup[0].domain,
            applicability: this.mergeApplicability(knowledgeGroup),
            consolidated_from: knowledgeIds,
            usage_count: knowledgeGroup.reduce((sum, k) => sum + k.usage_count, 0),
            effectiveness_history: this.mergeEffectivenessHistories(knowledgeGroup),
            relationships: this.mergeRelationships(knowledgeGroup),
            temporal_validity: this.assessConsolidatedTemporalValidity(knowledgeGroup)
        };
    }

    pruneOutdatedKnowledge() {
        const currentTime = Date.now();
        const outdatedKnowledge = [];
        
        this.metaKnowledge.forEach((knowledge, id) => {
            if (this.isKnowledgeOutdated(knowledge, currentTime)) {
                outdatedKnowledge.push(id);
            }
        });

        outdatedKnowledge.forEach(id => {
            this.removeKnowledge(id);
        });
    }

    isKnowledgeOutdated(knowledge, currentTime) {
        // Check temporal validity
        if (knowledge.temporal_validity.expiry_time && currentTime > knowledge.temporal_validity.expiry_time) {
            return true;
        }

        // Check usage patterns
        const timeSinceLastUse = currentTime - (knowledge.last_used || knowledge.timestamp);
        const usageThreshold = 30 * 24 * 60 * 60 * 1000; // 30 days
        
        if (timeSinceLastUse > usageThreshold && knowledge.usage_count < 3) {
            return true;
        }

        // Check effectiveness
        if (knowledge.effectiveness_history.length > 5) {
            const recentEffectiveness = knowledge.effectiveness_history.slice(-5);
            const avgEffectiveness = recentEffectiveness.reduce((sum, e) => sum + e.score, 0) / recentEffectiveness.length;
            if (avgEffectiveness < 0.3) {
                return true;
            }
        }

        return false;
    }

    // Knowledge retrieval methods
    getRelevantKnowledge(query, context = {}) {
        const relevantKnowledge = [];
        
        // Direct domain match
        if (query.domain) {
            const domainKnowledge = this.knowledgeIndex.get(query.domain) || [];
            relevantKnowledge.push(...domainKnowledge.map(id => this.metaKnowledge.get(id)));
        }

        // Type-based search
        if (query.type) {
            const typeKnowledge = this.knowledgeIndex.get(query.type) || [];
            relevantKnowledge.push(...typeKnowledge.map(id => this.metaKnowledge.get(id)));
        }

        // Content-based search
        if (query.content) {
            const contentMatches = this.searchByContent(query.content);
            relevantKnowledge.push(...contentMatches);
        }

        // Context-based filtering
        const contextFiltered = this.filterByContext(relevantKnowledge, context);
        
        // Rank by relevance
        return this.rankByRelevance(contextFiltered, query, context);
    }

    searchByContent(contentQuery) {
        const matches = [];
        
        this.metaKnowledge.forEach((knowledge, id) => {
            const similarity = this.calculateContentSimilarity(contentQuery, knowledge.content);
            if (similarity > 0.5) {
                matches.push({
                    ...knowledge,
                    relevance_score: similarity
                });
            }
        });

        return matches.sort((a, b) => b.relevance_score - a.relevance_score);
    }

    filterByContext(knowledge, context) {
        return knowledge.filter(k => {
            // Check confidence threshold
            if (context.min_confidence && k.confidence < context.min_confidence) {
                return false;
            }

            // Check temporal relevance
            if (context.time_window) {
                const age = Date.now() - k.timestamp;
                if (age > context.time_window) {
                    return false;
                }
            }

            // Check applicability
            if (context.situation && !this.isApplicableToSituation(k, context.situation)) {
                return false;
            }

            return true;
        });
    }

    rankByRelevance(knowledge, query, context) {
        return knowledge.map(k => ({
            ...k,
            relevance_score: this.calculateRelevanceScore(k, query, context)
        })).sort((a, b) => b.relevance_score - a.relevance_score);
    }

    calculateRelevanceScore(knowledge, query, context) {
        let score = 0;

        // Confidence weight
        score += knowledge.confidence * 0.3;

        // Usage frequency weight
        score += Math.min(1, knowledge.usage_count / 10) * 0.2;

        // Recency weight
        const age = Date.now() - knowledge.timestamp;
        const recency = Math.max(0, 1 - age / (30 * 24 * 60 * 60 * 1000)); // 30-day window
        score += recency * 0.2;

        // Effectiveness weight
        if (knowledge.effectiveness_history.length > 0) {
            const avgEffectiveness = knowledge.effectiveness_history.reduce((sum, e) => sum + e.score, 0) / knowledge.effectiveness_history.length;
            score += avgEffectiveness * 0.3;
        }

        return score;
    }

    // Knowledge management methods
    updateKnowledgeEffectiveness(knowledgeId, effectivenessScore, context) {
        const knowledge = this.metaKnowledge.get(knowledgeId);
        if (knowledge) {
            knowledge.effectiveness_history.push({
                score: effectivenessScore,
                context: context,
                timestamp: Date.now()
            });

            // Keep only recent effectiveness data
            if (knowledge.effectiveness_history.length > 20) {
                knowledge.effectiveness_history.shift();
            }

            // Update confidence based on effectiveness
            this.updateConfidenceBasedOnEffectiveness(knowledge);
        }
    }

    updateConfidenceBasedOnEffectiveness(knowledge) {
        if (knowledge.effectiveness_history.length < 3) return;

        const recentEffectiveness = knowledge.effectiveness_history.slice(-5);
        const avgEffectiveness = recentEffectiveness.reduce((sum, e) => sum + e.score, 0) / recentEffectiveness.length;
        
        // Adjust confidence based on effectiveness
        const confidenceAdjustment = (avgEffectiveness - 0.5) * 0.1;
        knowledge.confidence = Math.max(0, Math.min(1, knowledge.confidence + confidenceAdjustment));
    }

    markKnowledgeUsed(knowledgeId, context) {
        const knowledge = this.metaKnowledge.get(knowledgeId);
        if (knowledge) {
            knowledge.usage_count++;
            knowledge.last_used = Date.now();
            
            // Track usage statistics
            this.updateUsageStatistics(knowledgeId, context);
        }
    }

    updateUsageStatistics(knowledgeId, context) {
        if (!this.usage_statistics.has(knowledgeId)) {
            this.usage_statistics.set(knowledgeId, {
                total_uses: 0,
                contexts: new Map(),
                effectiveness_by_context: new Map()
            });
        }

        const stats = this.usage_statistics.get(knowledgeId);
        stats.total_uses++;

        // Track context usage
        const contextKey = this.generateContextKey(context);
        stats.contexts.set(contextKey, (stats.contexts.get(contextKey) || 0) + 1);
    }

    forgetKnowledge(knowledgeId, forgettingStrength) {
        const knowledge = this.metaKnowledge.get(knowledgeId);
        if (knowledge) {
            // Reduce confidence
            knowledge.confidence *= (1 - forgettingStrength);
            
            // If confidence drops too low, remove the knowledge
            if (knowledge.confidence < 0.1) {
                this.removeKnowledge(knowledgeId);
            }
        }
    }

    reinforceKnowledge(knowledgeId, reinforcementStrength) {
        const knowledge = this.metaKnowledge.get(knowledgeId);
        if (knowledge) {
            // Increase confidence
            knowledge.confidence = Math.min(1, knowledge.confidence + reinforcementStrength * 0.1);
            
            // Update temporal validity
            knowledge.temporal_validity.reinforcement_count = (knowledge.temporal_validity.reinforcement_count || 0) + 1;
        }
    }

    removeKnowledge(knowledgeId) {
        const knowledge = this.metaKnowledge.get(knowledgeId);
        if (knowledge) {
            // Remove from main storage
            this.metaKnowledge.delete(knowledgeId);
            
            // Remove from indices
            this.removeFromIndices(knowledgeId, knowledge);
            
            // Remove from knowledge graph
            this.knowledgeGraph.removeNode(knowledgeId);
            
            // Remove relationships
            this.removeKnowledgeRelationships(knowledgeId);
            
            // Remove from usage statistics
            this.usage_statistics.delete(knowledgeId);
        }
    }

    // Utility methods
    generateKnowledgeId(knowledgeUpdate) {
        const content_hash = this.hashContent(knowledgeUpdate.content);
        return `meta_knowledge_${knowledgeUpdate.type}_${content_hash}`;
    }

    hashContent(content) {
        return Math.abs(JSON.stringify(content).split('').reduce((a, b) => {
            a = ((a << 5) - a) + b.charCodeAt(0);
            return a & a;
        }, 0)).toString(36);
    }

    getConfidenceLevel(confidence) {
        if (confidence >= 0.8) return 'high_confidence';
        if (confidence >= 0.6) return 'medium_confidence';
        if (confidence >= 0.4) return 'low_confidence';
        return 'very_low_confidence';
    }

    // Public interface
    getAllKnowledge() {
        return Array.from(this.metaKnowledge.values());
    }

    getKnowledgeCount() {
        return this.metaKnowledge.size;
    }

    getKnowledgeByType(type) {
        const knowledgeIds = this.knowledgeIndex.get(type) || [];
        return knowledgeIds.map(id => this.metaKnowledge.get(id));
    }

    getKnowledgeByDomain(domain) {
        const knowledgeIds = this.knowledgeIndex.get(domain) || [];
        return knowledgeIds.map(id => this.metaKnowledge.get(id));
    }

    getKnowledgeStatistics() {
        const stats = {
            total_knowledge: this.metaKnowledge.size,
            by_type: {},
            by_domain: {},
            by_confidence: {},
            average_confidence: 0,
            most_used: null,
            least_used: null
        };

        let totalConfidence = 0;
        let maxUsage = 0;
        let minUsage = Infinity;

        this.metaKnowledge.forEach((knowledge, id) => {
            // Count by type
            stats.by_type[knowledge.type] = (stats.by_type[knowledge.type] || 0) + 1;
            
            // Count by domain
            stats.by_domain[knowledge.domain] = (stats.by_domain[knowledge.domain] || 0) + 1;
            
            // Count by confidence level
            const confLevel = this.getConfidenceLevel(knowledge.confidence);
            stats.by_confidence[confLevel] = (stats.by_confidence[confLevel] || 0) + 1;
            
            totalConfidence += knowledge.confidence;
            
            // Track usage extremes
            if (knowledge.usage_count > maxUsage) {
                maxUsage = knowledge.usage_count;
                stats.most_used = { id, usage_count: knowledge.usage_count };
            }
            if (knowledge.usage_count < minUsage) {
                minUsage = knowledge.usage_count;
                stats.least_used = { id, usage_count: knowledge.usage_count };
            }
        });

        stats.average_confidence = this.metaKnowledge.size > 0 ? totalConfidence / this.metaKnowledge.size : 0;

        return stats;
    }
}

// Supporting classes would be implemented here
class ConceptualHierarchy {
    constructor() {
        this.concepts = new Map();
        this.hierarchy = new Map();
    }

    addConcept(concept) {
        this.concepts.set(concept.id, concept);
        this.positionInHierarchy(concept);
    }

    positionInHierarchy(concept) {
        // Simplified hierarchical positioning
        concept.position = {
            level: concept.abstraction_level,
            parent: this.findParentConcept(concept),
            children: this.findChildConcepts(concept)
        };
    }

    findParentConcept(concept) {
        // Find more abstract parent concept
        return null; // Simplified
    }

    findChildConcepts(concept) {
        // Find more specific child concepts
        return []; // Simplified
    }
}

class KnowledgeGraph {
    constructor(domain) {
        this.domain = domain;
        this.nodes = new Map();
        this.edges = new Map();
    }

    addNode(knowledge) {
        this.nodes.set(knowledge.id, knowledge);
    }

    removeNode(knowledgeId) {
        this.nodes.delete(knowledgeId);
        this.edges.delete(knowledgeId);
    }

    addEdge(fromId, toId, relationship) {
        if (!this.edges.has(fromId)) {
            this.edges.set(fromId, new Map());
        }
        this.edges.get(fromId).set(toId, relationship);
    }

    weakenConnections(knowledgeId, strength) {
        const connections = this.edges.get(knowledgeId);
        if (connections) {
            connections.forEach((relationship, targetId) => {
                relationship.strength *= (1 - strength);
                if (relationship.strength < 0.1) {
                    connections.delete(targetId);
                }
            });
        }
    }

    strengthenConnections(knowledgeId, strength) {
        const connections = this.edges.get(knowledgeId);
        if (connections) {
            connections.forEach((relationship, targetId) => {
                relationship.strength = Math.min(1, relationship.strength + strength);
            });
        }
    }
}

class ConfidenceTracker {
    constructor() {
        this.confidenceHistory = new Map();
    }

    trackConfidence(knowledgeId, confidence, context) {
        if (!this.confidenceHistory.has(knowledgeId)) {
            this.confidenceHistory.set(knowledgeId, []);
        }
        
        this.confidenceHistory.get(knowledgeId).push({
            confidence: confidence,
            context: context,
            timestamp: Date.now()
        });
    }
}

class TemporalKnowledgeManager {
    constructor() {
        this.temporalPatterns = new Map();
    }

    assessTemporalValidity(knowledgeUpdate) {
        return {
            creation_time: Date.now(),
            expiry_time: null,
            decay_rate: 0.01,
            temporal_context: this.extractTemporalContext(knowledgeUpdate),
            reinforcement_count: 0
        };
    }

    extractTemporalContext(knowledgeUpdate) {
        return {
            market_phase: 'normal',
            seasonal_factors: [],
            temporal_dependencies: []
        };
    }
}

module.exports = MetaKnowledgeBase;
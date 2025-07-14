/**
 * Social Network Analysis System
 * Phase 4: Advanced relationship mapping, influence propagation,
 * network topology analysis, and community detection
 */

const EventEmitter = require('eventemitter3');

class SocialNetworkAnalysis extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Network analysis parameters
            maxNetworkSize: config.maxNetworkSize || 100000,
            influenceDecayRate: config.influenceDecayRate || 0.1,
            communityDetectionThreshold: config.communityDetectionThreshold || 0.6,
            bridgeThreshold: config.bridgeThreshold || 0.3,
            
            // Relationship types and weights
            relationshipTypes: config.relationshipTypes || {
                'family': { weight: 1.0, decay: 0.01, bidirectional: true },
                'friendship': { weight: 0.8, decay: 0.05, bidirectional: true },
                'professional': { weight: 0.7, decay: 0.1, bidirectional: true },
                'business': { weight: 0.6, decay: 0.15, bidirectional: false },
                'mentorship': { weight: 0.9, decay: 0.05, bidirectional: false },
                'rivalry': { weight: -0.5, decay: 0.2, bidirectional: true },
                'collaboration': { weight: 0.8, decay: 0.08, bidirectional: true },
                'subordination': { weight: 0.4, decay: 0.1, bidirectional: false }
            },
            
            // Influence propagation settings
            influenceHops: config.influenceHops || 3,
            propagationThreshold: config.propagationThreshold || 0.1,
            convergenceThreshold: config.convergenceThreshold || 0.05,
            
            // Community detection algorithms
            communityAlgorithms: config.communityAlgorithms || [
                'louvain', 'leiden', 'spectral', 'modularity'
            ],
            
            ...config
        };

        // Core network structures
        this.agents = new Map();
        this.relationships = new Map(); // adjacency list representation
        this.communities = new Map();
        this.influenceNetworks = new Map();
        this.networkMetrics = new Map();
        
        // Dynamic network state
        this.networkTopology = {
            nodes: 0,
            edges: 0,
            density: 0,
            clustering: 0,
            pathLength: 0,
            modularity: 0,
            smallWorldness: 0
        };
        
        // Influence propagation state
        this.activeInfluences = new Map();
        this.influenceCascades = new Map();
        this.viralThreshold = 0.3;
        
        // Community structures
        this.communityHierarchy = new Map();
        this.bridgeNodes = new Set();
        this.isolatedNodes = new Set();
        this.centralNodes = new Set();

        this.initializeNetworkAnalysis();
    }

    initializeNetworkAnalysis() {
        // Network analysis cycle
        this.analysisInterval = setInterval(() => {
            this.performNetworkAnalysis();
        }, 60000); // Every minute
        
        // Influence propagation cycle
        this.influenceInterval = setInterval(() => {
            this.propagateInfluences();
        }, 30000); // Every 30 seconds
        
        // Community detection cycle
        this.communityInterval = setInterval(() => {
            this.detectCommunities();
        }, 300000); // Every 5 minutes
    }

    // Agent and relationship management
    registerAgent(agentId, agentData = {}) {
        const agent = {
            id: agentId,
            
            // Basic properties
            type: agentData.type || 'individual',
            status: agentData.status || 'active',
            joinedAt: Date.now(),
            
            // Network position metrics
            centrality: {
                degree: 0,
                betweenness: 0,
                closeness: 0,
                eigenvector: 0,
                pagerank: 0
            },
            
            // Influence metrics
            influence: {
                local: 0,
                global: 0,
                reach: 0,
                velocity: 0,
                persistence: 0
            },
            
            // Community membership
            communities: new Set(),
            bridgeScore: 0,
            clustering: 0,
            
            // Relationship statistics
            relationshipCounts: new Map(),
            strongTies: new Set(),
            weakTies: new Set(),
            
            // Dynamic properties
            activityLevel: 1.0,
            reputation: agentData.reputation || 50,
            trustScore: agentData.trustScore || 50,
            
            // Social roles
            socialRoles: new Set(),
            leadershipScore: 0,
            followerScore: 0,
            
            ...agentData
        };

        this.agents.set(agentId, agent);
        this.relationships.set(agentId, new Map());
        
        this.networkTopology.nodes++;
        
        return agent;
    }

    createRelationship(sourceId, targetId, relationshipType, strength = 1.0, metadata = {}) {
        const source = this.agents.get(sourceId);
        const target = this.agents.get(targetId);
        
        if (!source || !target || sourceId === targetId) {
            return false;
        }
        
        const relationshipConfig = this.config.relationshipTypes[relationshipType];
        if (!relationshipConfig) {
            return false;
        }
        
        const relationship = {
            type: relationshipType,
            strength: Math.max(0, Math.min(1, strength)),
            weight: relationshipConfig.weight,
            created: Date.now(),
            lastInteraction: Date.now(),
            interactionCount: 0,
            
            // Relationship quality metrics
            trust: metadata.trust || 0.5,
            intimacy: metadata.intimacy || 0.3,
            commitment: metadata.commitment || 0.5,
            satisfaction: metadata.satisfaction || 0.5,
            
            // Dynamic properties
            stability: 0.5,
            growthRate: 0,
            decay: relationshipConfig.decay,
            
            // Context
            context: metadata.context || 'general',
            tags: metadata.tags || [],
            
            ...metadata
        };
        
        // Create relationship
        this.relationships.get(sourceId).set(targetId, relationship);
        
        // Create reverse relationship if bidirectional
        if (relationshipConfig.bidirectional) {
            const reverseRelationship = { ...relationship };
            this.relationships.get(targetId).set(sourceId, reverseRelationship);
        }
        
        // Update network topology
        this.networkTopology.edges++;
        
        // Update relationship counts
        this.updateRelationshipCounts(sourceId, targetId, relationshipType);
        
        this.emit('relationship_created', {
            sourceId,
            targetId,
            relationshipType,
            strength,
            bidirectional: relationshipConfig.bidirectional
        });
        
        return relationship;
    }

    updateRelationshipCounts(sourceId, targetId, relationshipType) {
        const source = this.agents.get(sourceId);
        const target = this.agents.get(targetId);
        
        if (source) {
            const count = source.relationshipCounts.get(relationshipType) || 0;
            source.relationshipCounts.set(relationshipType, count + 1);
        }
        
        if (target) {
            const count = target.relationshipCounts.get(relationshipType) || 0;
            target.relationshipCounts.set(relationshipType, count + 1);
        }
    }

    // Network analysis operations
    performNetworkAnalysis() {
        // Update basic topology metrics
        this.updateTopologyMetrics();
        
        // Calculate centrality measures
        this.calculateCentralityMeasures();
        
        // Update influence metrics
        this.updateInfluenceMetrics();
        
        // Identify network roles
        this.identifyNetworkRoles();
        
        // Update network health metrics
        this.updateNetworkHealth();
    }

    updateTopologyMetrics() {
        const nodeCount = this.agents.size;
        const edgeCount = this.networkTopology.edges;
        
        // Network density
        const maxEdges = nodeCount * (nodeCount - 1) / 2;
        this.networkTopology.density = maxEdges > 0 ? edgeCount / maxEdges : 0;
        
        // Clustering coefficient
        this.networkTopology.clustering = this.calculateGlobalClustering();
        
        // Average path length
        this.networkTopology.pathLength = this.calculateAveragePathLength();
        
        // Small-worldness
        this.networkTopology.smallWorldness = this.calculateSmallWorldness();
    }

    calculateCentralityMeasures() {
        // Degree centrality
        this.calculateDegreeCentrality();
        
        // Betweenness centrality
        this.calculateBetweennessCentrality();
        
        // Closeness centrality
        this.calculateClosenessCentrality();
        
        // Eigenvector centrality
        this.calculateEigenvectorCentrality();
        
        // PageRank
        this.calculatePageRank();
    }

    calculateDegreeCentrality() {
        const maxDegree = this.agents.size - 1;
        
        for (const [agentId, agent] of this.agents) {
            const connections = this.relationships.get(agentId);
            const degree = connections ? connections.size : 0;
            
            agent.centrality.degree = maxDegree > 0 ? degree / maxDegree : 0;
        }
    }

    calculateBetweennessCentrality() {
        // Implementation of Brandes' algorithm for betweenness centrality
        const betweenness = new Map();
        const agents = Array.from(this.agents.keys());
        
        // Initialize betweenness scores
        agents.forEach(agentId => betweenness.set(agentId, 0));
        
        // For each node, calculate shortest paths and dependencies
        for (const source of agents) {
            const stack = [];
            const paths = new Map();
            const dependencies = new Map();
            const distances = new Map();
            const predecessors = new Map();
            
            // Initialize
            agents.forEach(agentId => {
                paths.set(agentId, 0);
                dependencies.set(agentId, 0);
                distances.set(agentId, -1);
                predecessors.set(agentId, []);
            });
            
            paths.set(source, 1);
            distances.set(source, 0);
            
            // BFS
            const queue = [source];
            while (queue.length > 0) {
                const current = queue.shift();
                stack.push(current);
                
                const connections = this.relationships.get(current);
                if (connections) {
                    for (const neighbor of connections.keys()) {
                        // First time we reach this neighbor
                        if (distances.get(neighbor) < 0) {
                            queue.push(neighbor);
                            distances.set(neighbor, distances.get(current) + 1);
                        }
                        
                        // Shortest path to neighbor via current
                        if (distances.get(neighbor) === distances.get(current) + 1) {
                            paths.set(neighbor, paths.get(neighbor) + paths.get(current));
                            predecessors.get(neighbor).push(current);
                        }
                    }
                }
            }
            
            // Calculate dependencies
            while (stack.length > 0) {
                const w = stack.pop();
                for (const v of predecessors.get(w)) {
                    const dependency = (paths.get(v) / paths.get(w)) * (1 + dependencies.get(w));
                    dependencies.set(v, dependencies.get(v) + dependency);
                }
                
                if (w !== source) {
                    betweenness.set(w, betweenness.get(w) + dependencies.get(w));
                }
            }
        }
        
        // Normalize and update agent centrality
        const normalizationFactor = (agents.length - 1) * (agents.length - 2) / 2;
        for (const [agentId, score] of betweenness) {
            const agent = this.agents.get(agentId);
            if (agent) {
                agent.centrality.betweenness = normalizationFactor > 0 ? score / normalizationFactor : 0;
            }
        }
    }

    calculateClosenessCentrality() {
        for (const [agentId, agent] of this.agents) {
            const distances = this.calculateShortestPaths(agentId);
            const totalDistance = Array.from(distances.values())
                .filter(d => d > 0 && d < Infinity)
                .reduce((sum, d) => sum + d, 0);
            
            const reachableNodes = Array.from(distances.values())
                .filter(d => d > 0 && d < Infinity).length;
            
            if (reachableNodes > 0 && totalDistance > 0) {
                agent.centrality.closeness = (reachableNodes * reachableNodes) / 
                    ((this.agents.size - 1) * totalDistance);
            } else {
                agent.centrality.closeness = 0;
            }
        }
    }

    calculateShortestPaths(sourceId) {
        const distances = new Map();
        const agents = Array.from(this.agents.keys());
        
        // Initialize distances
        agents.forEach(agentId => {
            distances.set(agentId, agentId === sourceId ? 0 : Infinity);
        });
        
        // Dijkstra's algorithm (simplified for unweighted graph)
        const unvisited = new Set(agents);
        
        while (unvisited.size > 0) {
            // Find unvisited node with minimum distance
            let current = null;
            let minDistance = Infinity;
            
            for (const agentId of unvisited) {
                if (distances.get(agentId) < minDistance) {
                    minDistance = distances.get(agentId);
                    current = agentId;
                }
            }
            
            if (current === null || minDistance === Infinity) break;
            
            unvisited.delete(current);
            
            // Update distances to neighbors
            const connections = this.relationships.get(current);
            if (connections) {
                for (const neighbor of connections.keys()) {
                    if (unvisited.has(neighbor)) {
                        const newDistance = distances.get(current) + 1;
                        if (newDistance < distances.get(neighbor)) {
                            distances.set(neighbor, newDistance);
                        }
                    }
                }
            }
        }
        
        return distances;
    }

    calculateEigenvectorCentrality() {
        const agents = Array.from(this.agents.keys());
        const n = agents.length;
        
        if (n === 0) return;
        
        // Initialize centrality scores
        let centrality = new Map();
        agents.forEach(agentId => centrality.set(agentId, 1.0));
        
        // Power iteration
        const maxIterations = 100;
        const tolerance = 1e-6;
        
        for (let iter = 0; iter < maxIterations; iter++) {
            const newCentrality = new Map();
            agents.forEach(agentId => newCentrality.set(agentId, 0));
            
            // Update centrality scores
            for (const agentId of agents) {
                const connections = this.relationships.get(agentId);
                if (connections) {
                    for (const [neighborId, relationship] of connections) {
                        const weight = Math.abs(relationship.weight * relationship.strength);
                        newCentrality.set(neighborId, 
                            newCentrality.get(neighborId) + weight * centrality.get(agentId));
                    }
                }
            }
            
            // Normalize
            const norm = Math.sqrt(Array.from(newCentrality.values())
                .reduce((sum, val) => sum + val * val, 0));
            
            if (norm > 0) {
                agents.forEach(agentId => {
                    newCentrality.set(agentId, newCentrality.get(agentId) / norm);
                });
            }
            
            // Check convergence
            let converged = true;
            for (const agentId of agents) {
                if (Math.abs(newCentrality.get(agentId) - centrality.get(agentId)) > tolerance) {
                    converged = false;
                    break;
                }
            }
            
            centrality = newCentrality;
            
            if (converged) break;
        }
        
        // Update agent centrality
        for (const [agentId, score] of centrality) {
            const agent = this.agents.get(agentId);
            if (agent) {
                agent.centrality.eigenvector = score;
            }
        }
    }

    calculatePageRank() {
        const agents = Array.from(this.agents.keys());
        const n = agents.length;
        const dampingFactor = 0.85;
        
        if (n === 0) return;
        
        // Initialize PageRank scores
        let pagerank = new Map();
        agents.forEach(agentId => pagerank.set(agentId, 1.0 / n));
        
        const maxIterations = 100;
        const tolerance = 1e-6;
        
        for (let iter = 0; iter < maxIterations; iter++) {
            const newPagerank = new Map();
            agents.forEach(agentId => newPagerank.set(agentId, (1 - dampingFactor) / n));
            
            for (const agentId of agents) {
                const connections = this.relationships.get(agentId);
                const outDegree = connections ? connections.size : 0;
                
                if (outDegree > 0) {
                    const contribution = dampingFactor * pagerank.get(agentId) / outDegree;
                    
                    for (const neighborId of connections.keys()) {
                        newPagerank.set(neighborId, 
                            newPagerank.get(neighborId) + contribution);
                    }
                } else {
                    // Distribute to all nodes (dangling node)
                    const contribution = dampingFactor * pagerank.get(agentId) / n;
                    agents.forEach(nodeId => {
                        newPagerank.set(nodeId, newPagerank.get(nodeId) + contribution);
                    });
                }
            }
            
            // Check convergence
            let converged = true;
            for (const agentId of agents) {
                if (Math.abs(newPagerank.get(agentId) - pagerank.get(agentId)) > tolerance) {
                    converged = false;
                    break;
                }
            }
            
            pagerank = newPagerank;
            
            if (converged) break;
        }
        
        // Update agent centrality
        for (const [agentId, score] of pagerank) {
            const agent = this.agents.get(agentId);
            if (agent) {
                agent.centrality.pagerank = score;
            }
        }
    }

    // Influence propagation
    propagateInfluence(sourceId, influenceType, strength, metadata = {}) {
        const influence = {
            id: `${sourceId}_${influenceType}_${Date.now()}`,
            sourceId,
            type: influenceType,
            initialStrength: strength,
            currentStrength: strength,
            
            // Propagation state
            visited: new Set([sourceId]),
            activeNodes: new Map([[sourceId, strength]]),
            totalReach: 1,
            hopsRemaining: this.config.influenceHops,
            
            // Tracking
            startTime: Date.now(),
            propagationPath: [sourceId],
            influenceDecay: metadata.decay || this.config.influenceDecayRate,
            
            ...metadata
        };
        
        this.activeInfluences.set(influence.id, influence);
        
        this.emit('influence_propagation_started', {
            influenceId: influence.id,
            sourceId,
            type: influenceType,
            strength
        });
        
        return influence.id;
    }

    propagateInfluences() {
        for (const [influenceId, influence] of this.activeInfluences) {
            this.stepInfluencePropagation(influenceId, influence);
        }
        
        // Clean up completed influences
        this.cleanupCompletedInfluences();
    }

    stepInfluencePropagation(influenceId, influence) {
        if (influence.hopsRemaining <= 0 || influence.activeNodes.size === 0) {
            return;
        }
        
        const nextActiveNodes = new Map();
        
        for (const [nodeId, nodeStrength] of influence.activeNodes) {
            const connections = this.relationships.get(nodeId);
            if (!connections) continue;
            
            for (const [neighborId, relationship] of connections) {
                if (influence.visited.has(neighborId)) continue;
                
                // Calculate propagated strength
                const propagationStrength = this.calculatePropagationStrength(
                    nodeStrength, relationship, influence
                );
                
                if (propagationStrength >= this.config.propagationThreshold) {
                    // Accumulate influence if neighbor is already in next wave
                    const existingStrength = nextActiveNodes.get(neighborId) || 0;
                    nextActiveNodes.set(neighborId, existingStrength + propagationStrength);
                    
                    influence.visited.add(neighborId);
                    influence.propagationPath.push(neighborId);
                    influence.totalReach++;
                    
                    // Update neighbor's influence metrics
                    this.updateAgentInfluenceReceived(neighborId, influence, propagationStrength);
                }
            }
        }
        
        // Update influence state
        influence.activeNodes = nextActiveNodes;
        influence.hopsRemaining--;
        influence.currentStrength = this.calculateCurrentInfluenceStrength(influence);
        
        // Check for viral behavior
        if (nextActiveNodes.size > influence.activeNodes.size * 2) {
            this.detectViralInfluence(influenceId, influence);
        }
    }

    calculatePropagationStrength(sourceStrength, relationship, influence) {
        // Base propagation based on relationship strength and weight
        let propagationStrength = sourceStrength * relationship.strength * Math.abs(relationship.weight);
        
        // Apply influence-specific decay
        propagationStrength *= (1 - influence.influenceDecay);
        
        // Relationship type modifiers
        const typeModifiers = {
            'family': 1.2,
            'friendship': 1.0,
            'professional': 0.8,
            'business': 0.6,
            'mentorship': 1.1,
            'rivalry': 0.3,
            'collaboration': 1.0,
            'subordination': 0.7
        };
        
        const modifier = typeModifiers[relationship.type] || 1.0;
        propagationStrength *= modifier;
        
        return propagationStrength;
    }

    // Community detection
    detectCommunities() {
        // Run multiple community detection algorithms
        const communityResults = new Map();
        
        for (const algorithm of this.config.communityAlgorithms) {
            try {
                const communities = this.runCommunityDetection(algorithm);
                communityResults.set(algorithm, communities);
            } catch (error) {
                console.warn(`Community detection algorithm ${algorithm} failed:`, error);
            }
        }
        
        // Find consensus communities
        const consensusCommunities = this.findConsensusCommunities(communityResults);
        
        // Update community memberships
        this.updateCommunityMemberships(consensusCommunities);
        
        // Identify bridge nodes
        this.identifyBridgeNodes(consensusCommunities);
        
        // Calculate modularity
        this.networkTopology.modularity = this.calculateModularity(consensusCommunities);
        
        this.emit('communities_detected', {
            algorithmCount: communityResults.size,
            communityCount: consensusCommunities.size,
            modularity: this.networkTopology.modularity,
            bridgeNodeCount: this.bridgeNodes.size
        });
    }

    runCommunityDetection(algorithm) {
        switch (algorithm) {
            case 'louvain':
                return this.louvainCommunityDetection();
            case 'leiden':
                return this.leidenCommunityDetection();
            case 'spectral':
                return this.spectralCommunityDetection();
            case 'modularity':
                return this.modularityCommunityDetection();
            default:
                throw new Error(`Unknown community detection algorithm: ${algorithm}`);
        }
    }

    louvainCommunityDetection() {
        // Simplified Louvain algorithm implementation
        const agents = Array.from(this.agents.keys());
        const communities = new Map();
        
        // Initialize each node in its own community
        agents.forEach((agentId, index) => {
            communities.set(agentId, index);
        });
        
        let improved = true;
        let iteration = 0;
        const maxIterations = 100;
        
        while (improved && iteration < maxIterations) {
            improved = false;
            
            for (const agentId of agents) {
                const currentCommunity = communities.get(agentId);
                let bestCommunity = currentCommunity;
                let bestGain = 0;
                
                // Try moving to neighboring communities
                const connections = this.relationships.get(agentId);
                if (connections) {
                    const neighborCommunities = new Set();
                    
                    for (const neighborId of connections.keys()) {
                        neighborCommunities.add(communities.get(neighborId));
                    }
                    
                    for (const community of neighborCommunities) {
                        if (community !== currentCommunity) {
                            const gain = this.calculateModularityGain(
                                agentId, currentCommunity, community, communities
                            );
                            
                            if (gain > bestGain) {
                                bestGain = gain;
                                bestCommunity = community;
                            }
                        }
                    }
                }
                
                if (bestCommunity !== currentCommunity) {
                    communities.set(agentId, bestCommunity);
                    improved = true;
                }
            }
            
            iteration++;
        }
        
        // Convert to community structure
        const communityStructure = new Map();
        for (const [agentId, communityId] of communities) {
            if (!communityStructure.has(communityId)) {
                communityStructure.set(communityId, new Set());
            }
            communityStructure.get(communityId).add(agentId);
        }
        
        return communityStructure;
    }

    // Analytics and reporting
    getNetworkAnalytics() {
        return {
            topology: { ...this.networkTopology },
            communities: {
                count: this.communities.size,
                bridgeNodes: this.bridgeNodes.size,
                isolatedNodes: this.isolatedNodes.size,
                centralNodes: this.centralNodes.size
            },
            influence: {
                activeInfluences: this.activeInfluences.size,
                cascadeCount: this.influenceCascades.size,
                averageReach: this.calculateAverageInfluenceReach()
            },
            centrality: this.getCentralityStatistics(),
            relationships: this.getRelationshipStatistics()
        };
    }

    getAgentNetworkProfile(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) return null;
        
        const connections = this.relationships.get(agentId);
        
        return {
            agentId,
            centrality: { ...agent.centrality },
            influence: { ...agent.influence },
            communities: Array.from(agent.communities),
            socialRoles: Array.from(agent.socialRoles),
            
            relationships: {
                total: connections ? connections.size : 0,
                byType: Object.fromEntries(agent.relationshipCounts),
                strongTies: agent.strongTies.size,
                weakTies: agent.weakTies.size
            },
            
            networkPosition: {
                bridgeScore: agent.bridgeScore,
                clustering: agent.clustering,
                leadershipScore: agent.leadershipScore,
                followerScore: agent.followerScore
            }
        };
    }

    // Utility methods placeholder
    calculateGlobalClustering() { return Math.random() * 0.8; }
    calculateAveragePathLength() { return 2 + Math.random() * 4; }
    calculateSmallWorldness() { return Math.random() * 2; }
    leidenCommunityDetection() { return this.louvainCommunityDetection(); }
    spectralCommunityDetection() { return this.louvainCommunityDetection(); }
    modularityCommunityDetection() { return this.louvainCommunityDetection(); }

    // Cleanup
    stop() {
        if (this.analysisInterval) clearInterval(this.analysisInterval);
        if (this.influenceInterval) clearInterval(this.influenceInterval);
        if (this.communityInterval) clearInterval(this.communityInterval);
    }
}

module.exports = SocialNetworkAnalysis;
/**
 * Phase 2 Enhanced Trust Relationship Network System
 * Advanced multi-dimensional trust modeling with sophisticated reputation propagation,
 * social dynamics, and complex relationship mechanisms for AI agent societies
 * 
 * Features:
 * - Multi-dimensional trust modeling (competence, benevolence, integrity, predictability)
 * - Advanced reputation propagation with network effects
 * - Social dynamics with group behavior and coalitions
 * - Trust verification and validation mechanisms
 * - Reputation recovery and redemption systems
 * - Trust contagion and influence networks
 * - Social proof and consensus mechanisms
 * - Betrayal detection and response systems
 * - Trust-based coalition formation
 * - Network analysis and optimization
 */

const EventEmitter = require('eventemitter3');

class Phase2TrustNetwork extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Multi-dimensional trust configuration
            trustDimensions: {
                competence: { weight: 0.25, decay: 0.95, volatility: 0.1 },
                benevolence: { weight: 0.25, decay: 0.92, volatility: 0.15 },
                integrity: { weight: 0.30, decay: 0.98, volatility: 0.08 },
                predictability: { weight: 0.20, decay: 0.90, volatility: 0.12 }
            },
            
            // Trust propagation settings
            propagationRules: {
                maxHops: 3,
                decayPerHop: 0.7,
                minimumInfluence: 0.1,
                trustThreshold: 0.6,
                socialProofWeight: 0.3
            },
            
            // Network dynamics
            networkDynamics: {
                coalitionFormationThreshold: 0.75,
                betrayalDetectionSensitivity: 0.8,
                reputationRecoveryRate: 0.05,
                trustContagionRate: 0.15,
                socialInfluenceDecay: 0.88
            },
            
            // Trust verification
            verification: {
                consensusThreshold: 0.67,
                witnessRequirement: 3,
                verificationDecay: 0.95,
                challengePeriod: 24 * 60 * 60 * 1000 // 24 hours
            },
            
            ...config
        };
        
        this.nodes = new Map(); // agentId -> EnhancedAgentNode
        this.edges = new Map(); // edgeId -> MultidimensionalTrustEdge
        this.coalitions = new Map(); // coalitionId -> Coalition
        this.trustChallenges = new Map(); // challengeId -> TrustChallenge
        this.socialProofEvents = new Map(); // eventId -> SocialProofEvent
        
        // Enhanced subsystems
        this.communityDetector = new AdvancedCommunityDetector();
        this.reputationPropagator = new ReputationPropagationEngine(this.config);
        this.betrayalDetector = new BetrayalDetectionSystem(this.config);
        this.trustVerifier = new TrustVerificationSystem(this.config);
        this.socialDynamics = new SocialDynamicsEngine(this.config);
        this.networkOptimizer = new TrustNetworkOptimizer();
        this.networkMetrics = new EnhancedNetworkMetrics();
        
        // Trust learning and adaptation
        this.trustLearningEngine = new TrustLearningEngine();
        this.contextualTrustAnalyzer = new ContextualTrustAnalyzer();
        this.trustPatternRecognizer = new TrustPatternRecognizer();
        
        // Initialize network state
        this.networkState = {
            totalInteractions: 0,
            betrayalEvents: 0,
            recoveryEvents: 0,
            coalitionCount: 0,
            averageTrustLevel: 0.5,
            networkHealth: 1.0,
            lastAnalysis: Date.now()
        };
        
        this.initializeAdvancedFeatures();
    }

    // Agent network management
    addAgent(agentId, agentProfile) {
        if (!this.nodes.has(agentId)) {
            this.nodes.set(agentId, new AgentNode(agentId, agentProfile));
        }
    }

    establishConnection(agentA, agentB, initialTrust = 50, context = {}) {
        const edgeId = this.createEdgeId(agentA, agentB);
        
        if (!this.edges.has(edgeId)) {
            const edge = new TrustEdge(agentA, agentB, initialTrust, context);
            this.edges.set(edgeId, edge);
            
            // Update node connections
            this.nodes.get(agentA).addConnection(agentB, edgeId);
            this.nodes.get(agentB).addConnection(agentA, edgeId);
        }
        
        return edgeId;
    }

    // Trust level queries and updates
    getTrustLevel(agentA, agentB) {
        const edgeId = this.createEdgeId(agentA, agentB);
        const edge = this.edges.get(edgeId);
        
        if (!edge) return 50; // Default neutral trust
        
        return edge.calculateCurrentTrust();
    }

    updateTrustLevel(agentA, agentB, interaction) {
        const edgeId = this.createEdgeId(agentA, agentB);
        let edge = this.edges.get(edgeId);
        
        if (!edge) {
            edge = new TrustEdge(agentA, agentB, 50, {});
            this.edges.set(edgeId, edge);
        }
        
        edge.recordInteraction(interaction);
        this.propagateTrustUpdate(agentA, agentB, interaction);
        
        return edge.calculateCurrentTrust();
    }

    // Trust propagation through network
    propagateTrustUpdate(agentA, agentB, interaction) {
        const propagationStrength = this.calculatePropagationStrength(interaction);
        
        if (propagationStrength > 0.3) {
            const neighborsA = this.getDirectNeighbors(agentA);
            const neighborsB = this.getDirectNeighbors(agentB);
            
            // Propagate to mutual connections
            const mutualConnections = neighborsA.filter(n => neighborsB.includes(n));
            
            mutualConnections.forEach(neighborId => {
                this.applyIndirectTrustUpdate(neighborId, agentA, agentB, interaction, propagationStrength);
            });
        }
    }

    calculatePropagationStrength(interaction) {
        const { type, outcome, magnitude } = interaction;
        let strength = 0;
        
        switch(type) {
            case 'major_betrayal':
                strength = 0.8;
                break;
            case 'significant_cooperation':
                strength = 0.6;
                break;
            case 'public_scandal':
                strength = 0.9;
                break;
            case 'joint_success':
                strength = 0.5;
                break;
            default:
                strength = 0.2;
        }
        
        return strength * (magnitude / 100);
    }

    applyIndirectTrustUpdate(observerAgent, agentA, agentB, interaction, strength) {
        const observerToA = this.getTrustLevel(observerAgent, agentA);
        const observerToB = this.getTrustLevel(observerAgent, agentB);
        
        // Update trust based on observed interaction and existing relationships
        if (interaction.outcome === 'betrayal') {
            // If A betrayed B, and observer trusts B, observer loses trust in A
            if (observerToB > 60) {
                const trustLoss = strength * 10;
                this.adjustTrust(observerAgent, agentA, -trustLoss);
            }
        } else if (interaction.outcome === 'cooperation') {
            // Successful cooperation increases trust in both parties
            if (observerToA > 40 && observerToB > 40) {
                const trustGain = strength * 5;
                this.adjustTrust(observerAgent, agentA, trustGain);
                this.adjustTrust(observerAgent, agentB, trustGain);
            }
        }
    }

    adjustTrust(agentA, agentB, adjustment) {
        const edgeId = this.createEdgeId(agentA, agentB);
        const edge = this.edges.get(edgeId);
        
        if (edge) {
            edge.adjustTrust(adjustment);
        }
    }

    // Network analysis and queries
    getDirectNeighbors(agentId) {
        const node = this.nodes.get(agentId);
        return node ? Array.from(node.connections.keys()) : [];
    }

    getIndirectNeighbors(agentId, maxDepth = 2) {
        const visited = new Set();
        const neighbors = new Set();
        const queue = [{ id: agentId, depth: 0 }];
        
        while (queue.length > 0) {
            const { id, depth } = queue.shift();
            
            if (visited.has(id) || depth >= maxDepth) continue;
            visited.add(id);
            
            if (depth > 0) neighbors.add(id);
            
            const directNeighbors = this.getDirectNeighbors(id);
            directNeighbors.forEach(neighborId => {
                if (!visited.has(neighborId)) {
                    queue.push({ id: neighborId, depth: depth + 1 });
                }
            });
        }
        
        return Array.from(neighbors);
    }

    findTrustedPartners(agentId, minTrust = 70) {
        const neighbors = this.getDirectNeighbors(agentId);
        return neighbors
            .map(neighborId => ({
                agentId: neighborId,
                trustLevel: this.getTrustLevel(agentId, neighborId),
                relationshipStrength: this.calculateRelationshipStrength(agentId, neighborId)
            }))
            .filter(partner => partner.trustLevel >= minTrust)
            .sort((a, b) => b.trustLevel - a.trustLevel);
    }

    findPotentialThreats(agentId, maxThreat = 30) {
        const neighbors = this.getDirectNeighbors(agentId);
        return neighbors
            .map(neighborId => ({
                agentId: neighborId,
                trustLevel: this.getTrustLevel(agentId, neighborId),
                threatLevel: this.calculateThreatLevel(agentId, neighborId)
            }))
            .filter(threat => threat.trustLevel <= maxThreat)
            .sort((a, b) => a.trustLevel - b.trustLevel);
    }

    calculateRelationshipStrength(agentA, agentB) {
        const edgeId = this.createEdgeId(agentA, agentB);
        const edge = this.edges.get(edgeId);
        
        if (!edge) return 0;
        
        const trustLevel = edge.calculateCurrentTrust();
        const interactionCount = edge.interactions.length;
        const recency = this.calculateRecency(edge.lastInteraction);
        const consistency = edge.calculateConsistency();
        
        return (trustLevel * 0.4 + 
                Math.min(100, interactionCount * 5) * 0.3 + 
                recency * 0.2 + 
                consistency * 0.1);
    }

    calculateThreatLevel(agentA, agentB) {
        const edgeId = this.createEdgeId(agentA, agentB);
        const edge = this.edges.get(edgeId);
        
        if (!edge) return 0;
        
        const trustLevel = edge.calculateCurrentTrust();
        const betrayalCount = edge.getBetrayalCount();
        const influence = this.calculateAgentInfluence(agentB);
        
        return (100 - trustLevel) * 0.6 + 
               betrayalCount * 20 + 
               influence * 0.2;
    }

    calculateAgentInfluence(agentId) {
        const connections = this.getDirectNeighbors(agentId).length;
        const avgTrustReceived = this.calculateAverageTrustReceived(agentId);
        const networkCentrality = this.networkMetrics.calculateCentrality(agentId, this);
        
        return connections * 2 + avgTrustReceived * 0.5 + networkCentrality;
    }

    calculateAverageTrustReceived(agentId) {
        const neighbors = this.getDirectNeighbors(agentId);
        if (neighbors.length === 0) return 50;
        
        const totalTrust = neighbors.reduce((sum, neighborId) => {
            return sum + this.getTrustLevel(neighborId, agentId);
        }, 0);
        
        return totalTrust / neighbors.length;
    }

    // Community and clustering analysis
    detectCommunities() {
        return this.communityDetector.detect(this);
    }

    findTradingCliques(minSize = 3, minAvgTrust = 70) {
        const communities = this.detectCommunities();
        
        return communities
            .filter(community => community.size >= minSize)
            .map(community => ({
                members: community.members,
                avgTrust: this.calculateCommunityTrust(community.members),
                cohesion: this.calculateCommunitySize(community.members),
                tradingPotential: this.assessTradingPotential(community.members)
            }))
            .filter(clique => clique.avgTrust >= minAvgTrust)
            .sort((a, b) => b.tradingPotential - a.tradingPotential);
    }

    calculateCommunityTrust(members) {
        let totalTrust = 0;
        let connections = 0;
        
        for (let i = 0; i < members.length; i++) {
            for (let j = i + 1; j < members.length; j++) {
                const trust = this.getTrustLevel(members[i], members[j]);
                if (trust > 0) {
                    totalTrust += trust;
                    connections++;
                }
            }
        }
        
        return connections > 0 ? totalTrust / connections : 0;
    }

    calculateCommunitySize(members) {
        const possibleConnections = members.length * (members.length - 1) / 2;
        let actualConnections = 0;
        
        for (let i = 0; i < members.length; i++) {
            for (let j = i + 1; j < members.length; j++) {
                if (this.getTrustLevel(members[i], members[j]) > 0) {
                    actualConnections++;
                }
            }
        }
        
        return actualConnections / possibleConnections;
    }

    assessTradingPotential(members) {
        // Assess diversity of trading styles and complementary skills
        const profiles = members.map(id => this.nodes.get(id).profile);
        const diversity = this.calculateDiversity(profiles);
        const complementarity = this.calculateComplementarity(profiles);
        const trust = this.calculateCommunityTrust(members);
        
        return diversity * 0.3 + complementarity * 0.4 + trust * 0.3;
    }

    // Reputation system integration
    updateReputation(agentId, action, context) {
        this.reputationSystem.updateReputation(agentId, action, context);
        
        // Propagate reputation changes through network
        const neighbors = this.getDirectNeighbors(agentId);
        neighbors.forEach(neighborId => {
            const trustLevel = this.getTrustLevel(neighborId, agentId);
            const reputationImpact = this.reputationSystem.getReputationImpact(action);
            
            // Adjust trust based on reputation change
            if (Math.abs(reputationImpact) > 10) {
                const trustAdjustment = reputationImpact * (trustLevel / 100) * 0.1;
                this.adjustTrust(neighborId, agentId, trustAdjustment);
            }
        });
    }

    getAgentReputation(agentId) {
        return this.reputationSystem.getReputation(agentId);
    }

    // Network evolution and maintenance
    evolveNetwork(timeStep) {
        // Decay trust over time for inactive relationships
        this.edges.forEach((edge, edgeId) => {
            const timeSinceLastInteraction = timeStep - edge.lastInteraction;
            if (timeSinceLastInteraction > 30) { // 30 time units
                edge.applyTimeDecay(timeSinceLastInteraction);
            }
        });
        
        // Remove very weak connections
        this.pruneWeakConnections();
        
        // Update network metrics
        this.networkMetrics.update(this);
    }

    pruneWeakConnections(threshold = 10) {
        const edgesToRemove = [];
        
        this.edges.forEach((edge, edgeId) => {
            if (edge.calculateCurrentTrust() < threshold && 
                edge.interactions.length < 3) {
                edgesToRemove.push(edgeId);
            }
        });
        
        edgesToRemove.forEach(edgeId => {
            const edge = this.edges.get(edgeId);
            this.nodes.get(edge.agentA).removeConnection(edge.agentB);
            this.nodes.get(edge.agentB).removeConnection(edge.agentA);
            this.edges.delete(edgeId);
        });
    }

    // Utility methods
    createEdgeId(agentA, agentB) {
        return agentA < agentB ? `${agentA}_${agentB}` : `${agentB}_${agentA}`;
    }

    calculateRecency(timestamp) {
        const age = Date.now() - timestamp;
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        return Math.max(0, 100 - (age / maxAge) * 100);
    }

    calculateDiversity(profiles) {
        // Calculate diversity of trading styles and personality types
        const styles = profiles.flatMap(p => p.tradingStyle);
        const uniqueStyles = new Set(styles);
        return (uniqueStyles.size / styles.length) * 100;
    }

    calculateComplementarity(profiles) {
        // Calculate how well different profiles complement each other
        const skillMatrix = profiles.map(p => p.skills || {});
        // Complex calculation would go here
        return 75; // Placeholder
    }

    // Public interface
    getNetworkStats() {
        return {
            totalAgents: this.nodes.size,
            totalConnections: this.edges.size,
            avgTrustLevel: this.calculateAverageTrustLevel(),
            networkDensity: this.calculateNetworkDensity(),
            largestCommunitySize: this.getLargestCommunitySize(),
            mostInfluentialAgent: this.getMostInfluentialAgent()
        };
    }

    calculateAverageTrustLevel() {
        let totalTrust = 0;
        this.edges.forEach(edge => {
            totalTrust += edge.calculateCurrentTrust();
        });
        return this.edges.size > 0 ? totalTrust / this.edges.size : 50;
    }

    calculateNetworkDensity() {
        const n = this.nodes.size;
        const maxConnections = n * (n - 1) / 2;
        return maxConnections > 0 ? this.edges.size / maxConnections : 0;
    }

    getLargestCommunitySize() {
        const communities = this.detectCommunities();
        return communities.length > 0 ? Math.max(...communities.map(c => c.size)) : 0;
    }

    getMostInfluentialAgent() {
        let maxInfluence = 0;
        let mostInfluential = null;
        
        this.nodes.forEach((node, agentId) => {
            const influence = this.calculateAgentInfluence(agentId);
            if (influence > maxInfluence) {
                maxInfluence = influence;
                mostInfluential = agentId;
            }
        });
        
        return { agentId: mostInfluential, influence: maxInfluence };
    }
}

// Supporting classes

class AgentNode {
    constructor(agentId, profile) {
        this.agentId = agentId;
        this.profile = profile;
        this.connections = new Map(); // neighborId -> edgeId
        this.lastActivity = Date.now();
    }

    addConnection(neighborId, edgeId) {
        this.connections.set(neighborId, edgeId);
    }

    removeConnection(neighborId) {
        this.connections.delete(neighborId);
    }
}

class TrustEdge {
    constructor(agentA, agentB, initialTrust, context) {
        this.agentA = agentA;
        this.agentB = agentB;
        this.baseTrust = initialTrust;
        this.currentTrust = initialTrust;
        this.interactions = [];
        this.context = context;
        this.created = Date.now();
        this.lastInteraction = Date.now();
        this.trustHistory = [{ trust: initialTrust, timestamp: Date.now() }];
    }

    recordInteraction(interaction) {
        this.interactions.push({
            ...interaction,
            timestamp: Date.now()
        });
        
        this.updateTrust(interaction);
        this.lastInteraction = Date.now();
    }

    updateTrust(interaction) {
        const { type, outcome, magnitude } = interaction;
        let trustChange = 0;
        
        switch(type) {
            case 'trade':
                trustChange = outcome === 'successful' ? magnitude * 0.1 : -magnitude * 0.15;
                break;
            case 'betrayal':
                trustChange = -magnitude * 0.5;
                break;
            case 'cooperation':
                trustChange = magnitude * 0.2;
                break;
            case 'information_sharing':
                trustChange = outcome === 'helpful' ? 5 : -2;
                break;
        }
        
        this.currentTrust = Math.max(0, Math.min(100, this.currentTrust + trustChange));
        this.trustHistory.push({
            trust: this.currentTrust,
            timestamp: Date.now(),
            trigger: interaction
        });
    }

    calculateCurrentTrust() {
        // Apply time decay and interaction patterns
        const baseDecay = this.calculateTimeDecay();
        const consistencyBonus = this.calculateConsistency() * 0.1;
        
        return Math.max(0, Math.min(100, this.currentTrust * baseDecay + consistencyBonus));
    }

    calculateTimeDecay() {
        const age = (Date.now() - this.lastInteraction) / (1000 * 60 * 60 * 24); // days
        return Math.max(0.7, Math.exp(-age / 60)); // 60-day half-life
    }

    calculateConsistency() {
        if (this.interactions.length < 3) return 50;
        
        const outcomes = this.interactions.map(i => i.outcome === 'successful' ? 1 : 0);
        const mean = outcomes.reduce((a, b) => a + b) / outcomes.length;
        const variance = outcomes.reduce((sum, outcome) => sum + Math.pow(outcome - mean, 2), 0) / outcomes.length;
        
        return (1 - variance) * 100; // Lower variance = higher consistency
    }

    getBetrayalCount() {
        return this.interactions.filter(i => i.type === 'betrayal').length;
    }

    adjustTrust(adjustment) {
        this.currentTrust = Math.max(0, Math.min(100, this.currentTrust + adjustment));
        this.trustHistory.push({
            trust: this.currentTrust,
            timestamp: Date.now(),
            trigger: { type: 'external_adjustment', magnitude: adjustment }
        });
    }

    applyTimeDecay(timePassed) {
        const decayRate = 0.99; // 1% decay per time unit
        const decay = Math.pow(decayRate, timePassed);
        this.currentTrust *= decay;
    }
}

class CommunityDetector {
    detect(network) {
        // Simplified community detection using modularity optimization
        const communities = [];
        const visited = new Set();
        
        network.nodes.forEach((node, agentId) => {
            if (!visited.has(agentId)) {
                const community = this.expandCommunity(agentId, network, visited);
                if (community.length > 1) {
                    communities.push({
                        members: community,
                        size: community.length
                    });
                }
            }
        });
        
        return communities;
    }

    expandCommunity(startAgent, network, visited) {
        const community = [startAgent];
        const queue = [startAgent];
        visited.add(startAgent);
        
        while (queue.length > 0) {
            const currentAgent = queue.shift();
            const neighbors = network.getDirectNeighbors(currentAgent);
            
            neighbors.forEach(neighborId => {
                if (!visited.has(neighborId)) {
                    const trustLevel = network.getTrustLevel(currentAgent, neighborId);
                    if (trustLevel > 60) { // Strong trust threshold
                        community.push(neighborId);
                        queue.push(neighborId);
                        visited.add(neighborId);
                    }
                }
            });
        }
        
        return community;
    }
}

class ReputationSystem {
    constructor() {
        this.reputations = new Map(); // agentId -> reputation score
    }

    updateReputation(agentId, action, context) {
        if (!this.reputations.has(agentId)) {
            this.reputations.set(agentId, 50); // Neutral start
        }
        
        const currentRep = this.reputations.get(agentId);
        const impact = this.getReputationImpact(action);
        const newRep = Math.max(0, Math.min(100, currentRep + impact));
        
        this.reputations.set(agentId, newRep);
    }

    getReputationImpact(action) {
        const impacts = {
            'successful_trade': 2,
            'failed_trade': -1,
            'betrayal': -15,
            'cooperation': 5,
            'information_sharing': 3,
            'market_manipulation': -10,
            'helping_newcomer': 4
        };
        
        return impacts[action.type] || 0;
    }

    getReputation(agentId) {
        return this.reputations.get(agentId) || 50;
    }
}

class NetworkMetrics {
    update(network) {
        this.totalNodes = network.nodes.size;
        this.totalEdges = network.edges.size;
        this.density = this.calculateDensity(network);
        this.avgClustering = this.calculateAverageClustering(network);
    }

    calculateDensity(network) {
        const n = network.nodes.size;
        const maxEdges = n * (n - 1) / 2;
        return maxEdges > 0 ? network.edges.size / maxEdges : 0;
    }

    calculateAverageClustering(network) {
        let totalClustering = 0;
        let nodeCount = 0;
        
        network.nodes.forEach((node, agentId) => {
            const clustering = this.calculateLocalClustering(agentId, network);
            totalClustering += clustering;
            nodeCount++;
        });
        
        return nodeCount > 0 ? totalClustering / nodeCount : 0;
    }

    calculateLocalClustering(agentId, network) {
        const neighbors = network.getDirectNeighbors(agentId);
        if (neighbors.length < 2) return 0;
        
        let connections = 0;
        for (let i = 0; i < neighbors.length; i++) {
            for (let j = i + 1; j < neighbors.length; j++) {
                if (network.getTrustLevel(neighbors[i], neighbors[j]) > 0) {
                    connections++;
                }
            }
        }
        
        const maxConnections = neighbors.length * (neighbors.length - 1) / 2;
        return connections / maxConnections;
    }

    calculateCentrality(agentId, network) {
        // Simplified centrality calculation
        const neighbors = network.getDirectNeighbors(agentId);
        return neighbors.length / network.nodes.size;
    }
}

module.exports = TrustNetwork;
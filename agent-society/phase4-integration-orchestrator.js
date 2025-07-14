/**
 * Phase 4 Integration Orchestrator
 * Advanced Social Dynamics and Collective Intelligence Systems
 * 
 * Integrates all Phase 4 systems:
 * - Enhanced Collective Intelligence Engine
 * - Social Network Analysis System
 * - Enhanced Cultural Evolution Engine
 * - Community Governance Framework
 * - Enhanced Trust Networks
 * - Social Impact Measurement System
 */

const EventEmitter = require('eventemitter3');
const EnhancedCollectiveIntelligence = require('./collective/enhanced-collective-intelligence');
const SocialNetworkAnalysis = require('./networks/social-network-analysis');
const EnhancedCulturalEvolution = require('./culture/enhanced-cultural-evolution');
const CommunityGovernance = require('./governance/community-governance');
const EnhancedTrustNetworks = require('./trust/enhanced-trust-networks');
const SocialImpactMeasurement = require('./impact/social-impact-measurement');

// Legacy systems for backward compatibility
const SocialOrganizations = require('./organizations/social-organizations');
const ReputationSystem = require('./reputation/reputation-system');
const CollectiveBehavior = require('./collective/collective-behavior');
const ClassMobility = require('./mobility/class-mobility');
const CulturalEvolution = require('./culture/cultural-evolution');

class Phase4IntegrationOrchestrator extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Integration parameters
            enablePhase4Systems: config.enablePhase4Systems !== false,
            enableLegacySystems: config.enableLegacySystems !== false,
            hybridMode: config.hybridMode !== false,
            
            // System priorities
            systemPriorities: config.systemPriorities || {
                'collective_intelligence': 1.0,
                'social_networks': 0.9,
                'cultural_evolution': 0.8,
                'governance': 0.9,
                'trust_networks': 0.8,
                'impact_measurement': 0.7
            },
            
            // Cross-system integration weights
            integrationWeights: config.integrationWeights || {
                'trust_reputation_correlation': 0.8,
                'culture_governance_alignment': 0.7,
                'network_collective_synergy': 0.9,
                'impact_outcome_correlation': 0.6
            },
            
            // Performance and scaling
            maxAgents: config.maxAgents || 100000,
            maxCommunities: config.maxCommunities || 1000,
            processingBatchSize: config.processingBatchSize || 1000,
            
            // Advanced features
            emergentBehaviorDetection: config.emergentBehaviorDetection !== false,
            predictiveAnalytics: config.predictiveAnalytics !== false,
            crossSystemLearning: config.crossSystemLearning !== false,
            adaptiveOptimization: config.adaptiveOptimization !== false,
            
            ...config
        };

        // Initialize all systems
        this.systems = {};
        this.legacySystems = {};
        
        // Cross-system state
        this.agents = new Map();
        this.communities = new Map();
        this.crossSystemMetrics = new Map();
        this.emergentProperties = new Map();
        
        // Integration state
        this.systemInteractions = new Map();
        this.dataFlowPaths = new Map();
        this.synchronizationPoints = new Map();
        
        // Performance tracking
        this.systemPerformance = new Map();
        this.integrationEfficiency = 0;
        this.lastOptimization = Date.now();

        this.initializeIntegratedSystems();
    }

    initializeIntegratedSystems() {
        console.log('🚀 Initializing Phase 4 Advanced Social Dynamics Systems...');
        
        // Initialize Phase 4 systems
        if (this.config.enablePhase4Systems) {
            this.initializePhase4Systems();
        }
        
        // Initialize legacy systems for backward compatibility
        if (this.config.enableLegacySystems) {
            this.initializeLegacySystems();
        }
        
        // Set up cross-system integration
        this.setupCrossSystemIntegration();
        
        // Start orchestration processes
        this.startOrchestrationProcesses();
        
        console.log('✅ Phase 4 Advanced Social Dynamics Systems initialized successfully!');
    }

    initializePhase4Systems() {
        console.log('  📋 Initializing Enhanced Collective Intelligence...');
        this.systems.collectiveIntelligence = new EnhancedCollectiveIntelligence(this.config);
        
        console.log('  🌐 Initializing Social Network Analysis...');
        this.systems.socialNetworks = new SocialNetworkAnalysis(this.config);
        
        console.log('  🧬 Initializing Enhanced Cultural Evolution...');
        this.systems.culturalEvolution = new EnhancedCulturalEvolution(this.config);
        
        console.log('  🏛️ Initializing Community Governance...');
        this.systems.governance = new CommunityGovernance(this.config);
        
        console.log('  🤝 Initializing Enhanced Trust Networks...');
        this.systems.trustNetworks = new EnhancedTrustNetworks(this.config);
        
        console.log('  📊 Initializing Social Impact Measurement...');
        this.systems.impactMeasurement = new SocialImpactMeasurement(this.config);
        
        // Set up system event listeners
        this.setupSystemEventListeners();
    }

    initializeLegacySystems() {
        console.log('  🔄 Initializing Legacy Social Organizations...');
        this.legacySystems.organizations = new SocialOrganizations(this.config);
        
        console.log('  🔄 Initializing Legacy Reputation System...');
        this.legacySystems.reputation = new ReputationSystem(this.config);
        
        console.log('  🔄 Initializing Legacy Collective Behavior...');
        this.legacySystems.collectiveBehavior = new CollectiveBehavior(this.config);
        
        console.log('  🔄 Initializing Legacy Class Mobility...');
        this.legacySystems.classMobility = new ClassMobility(this.config);
        
        console.log('  🔄 Initializing Legacy Cultural Evolution...');
        this.legacySystems.culturalEvolutionLegacy = new CulturalEvolution(this.config);
    }

    setupSystemEventListeners() {
        // Collective Intelligence events
        this.systems.collectiveIntelligence.on('emergent_intelligence_detected', (data) => {
            this.handleEmergentIntelligence(data);
        });
        
        this.systems.collectiveIntelligence.on('problem_solving_started', (data) => {
            this.coordinateProblemSolving(data);
        });
        
        // Social Network events
        this.systems.socialNetworks.on('community_detected', (data) => {
            this.handleCommunityDetection(data);
        });
        
        this.systems.socialNetworks.on('influence_cascade', (data) => {
            this.handleInfluenceCascade(data);
        });
        
        // Cultural Evolution events
        this.systems.culturalEvolution.on('cultural_shift', (data) => {
            this.handleCulturalShift(data);
        });
        
        // Governance events
        this.systems.governance.on('proposal_executed', (data) => {
            this.handleGovernanceDecision(data);
        });
        
        // Trust Network events
        this.systems.trustNetworks.on('trust_updated', (data) => {
            this.handleTrustUpdate(data);
        });
        
        // Impact Measurement events
        this.systems.impactMeasurement.on('impact_measured', (data) => {
            this.handleImpactMeasurement(data);
        });
    }

    setupCrossSystemIntegration() {
        // Define integration patterns
        this.integrationPatterns = {
            'trust_reputation_sync': {
                systems: ['trustNetworks', 'reputation'],
                syncInterval: 300000, // 5 minutes
                bidirectional: true
            },
            
            'culture_governance_alignment': {
                systems: ['culturalEvolution', 'governance'],
                syncInterval: 600000, // 10 minutes
                bidirectional: true
            },
            
            'network_collective_coordination': {
                systems: ['socialNetworks', 'collectiveIntelligence'],
                syncInterval: 120000, // 2 minutes
                bidirectional: true
            },
            
            'impact_outcome_tracking': {
                systems: ['impactMeasurement', 'governance', 'trustNetworks'],
                syncInterval: 900000, // 15 minutes
                bidirectional: false
            }
        };
        
        // Set up data flow paths
        this.setupDataFlowPaths();
    }

    setupDataFlowPaths() {
        this.dataFlowPaths.set('agent_registration', [
            'collectiveIntelligence.registerAgent',
            'socialNetworks.registerAgent',
            'culturalEvolution.registerAgent',
            'trustNetworks.registerAgent',
            'impactMeasurement.registerAgent'
        ]);
        
        this.dataFlowPaths.set('community_creation', [
            'governance.createCommunity',
            'culturalEvolution.createCulture',
            'impactMeasurement.registerCommunity',
            'socialNetworks.updateCommunityStructure'
        ]);
        
        this.dataFlowPaths.set('trust_update', [
            'trustNetworks.updateTrust',
            'reputation.updateReputation',
            'socialNetworks.updateRelationshipStrength'
        ]);
    }

    startOrchestrationProcesses() {
        // Main orchestration cycle
        this.orchestrationInterval = setInterval(() => {
            this.performOrchestrationCycle();
        }, 60000); // Every minute
        
        // Cross-system synchronization
        this.syncInterval = setInterval(() => {
            this.synchronizeSystems();
        }, 300000); // Every 5 minutes
        
        // Emergent behavior detection
        this.emergenceInterval = setInterval(() => {
            this.detectEmergentBehaviors();
        }, 180000); // Every 3 minutes
        
        // Performance optimization
        this.optimizationInterval = setInterval(() => {
            this.optimizeSystemPerformance();
        }, 1800000); // Every 30 minutes
    }

    // Agent management with full integration
    registerAgent(agentId, agentData = {}) {
        console.log(`🤖 Registering agent ${agentId} across all systems...`);
        
        const integratedAgent = {
            id: agentId,
            registeredAt: Date.now(),
            systems: new Set(),
            crossSystemData: {},
            emergentProperties: new Set(),
            
            // Aggregate metrics
            overallInfluence: 0,
            totalTrust: 0,
            culturalAlignment: 0,
            governanceParticipation: 0,
            impactContribution: 0,
            collectiveIntelligenceRating: 0,
            
            ...agentData
        };
        
        this.agents.set(agentId, integratedAgent);
        
        // Register with all Phase 4 systems
        if (this.config.enablePhase4Systems) {
            // Collective Intelligence
            const cognitiveProfile = this.systems.collectiveIntelligence.registerAgent(agentId, {
                ...agentData,
                cognitiveProfile: agentData.cognitiveProfile
            });
            integratedAgent.systems.add('collectiveIntelligence');
            integratedAgent.crossSystemData.cognitive = cognitiveProfile;
            
            // Social Networks
            const networkProfile = this.systems.socialNetworks.registerAgent(agentId, {
                ...agentData,
                networkData: agentData.networkData
            });
            integratedAgent.systems.add('socialNetworks');
            integratedAgent.crossSystemData.network = networkProfile;
            
            // Cultural Evolution
            const culturalProfile = this.systems.culturalEvolution.registerAgent(agentId, {
                ...agentData,
                culturalProfile: agentData.culturalProfile
            });
            integratedAgent.systems.add('culturalEvolution');
            integratedAgent.crossSystemData.cultural = culturalProfile;
            
            // Trust Networks
            const trustProfile = this.systems.trustNetworks.registerAgent(agentId, {
                ...agentData,
                trustProfile: agentData.trustProfile
            });
            integratedAgent.systems.add('trustNetworks');
            integratedAgent.crossSystemData.trust = trustProfile;
            
            // Impact Measurement
            const impactBaseline = this.systems.impactMeasurement.registerAgent(agentId, {
                ...agentData,
                baselineData: agentData.baselineData
            });
            integratedAgent.systems.add('impactMeasurement');
            integratedAgent.crossSystemData.impact = impactBaseline;
        }
        
        // Register with legacy systems if enabled
        if (this.config.enableLegacySystems && this.config.hybridMode) {
            this.registerAgentLegacySystems(agentId, agentData, integratedAgent);
        }
        
        // Calculate initial cross-system metrics
        this.updateAgentCrossSystemMetrics(agentId);
        
        this.emit('agent_registered', {
            agentId,
            systems: Array.from(integratedAgent.systems),
            crossSystemMetrics: this.crossSystemMetrics.get(agentId)
        });
        
        console.log(`✅ Agent ${agentId} successfully registered across ${integratedAgent.systems.size} systems`);
        
        return integratedAgent;
    }

    registerAgentLegacySystems(agentId, agentData, integratedAgent) {
        // Register with legacy reputation system
        if (this.legacySystems.reputation) {
            this.legacySystems.reputation.registerAgent(agentId, agentData.reputation || 50);
            integratedAgent.systems.add('reputation_legacy');
        }
        
        // Register with legacy collective behavior
        if (this.legacySystems.collectiveBehavior) {
            this.legacySystems.collectiveBehavior.registerAgent(agentId, agentData);
            integratedAgent.systems.add('collectiveBehavior_legacy');
        }
        
        // Register with legacy class mobility
        if (this.legacySystems.classMobility) {
            this.legacySystems.classMobility.registerAgent(agentId, agentData.socialClass || 'middle', agentData.wealth || 1000);
            integratedAgent.systems.add('classMobility_legacy');
        }
    }

    // Community management with full integration
    createCommunity(communityId, communityData = {}) {
        console.log(`🏘️ Creating community ${communityId} across governance and cultural systems...`);
        
        const integratedCommunity = {
            id: communityId,
            createdAt: Date.now(),
            systems: new Set(),
            crossSystemData: {},
            
            // Aggregate metrics
            overallHealth: 0,
            governanceEffectiveness: 0,
            culturalCoherence: 0,
            trustLevel: 0,
            socialImpact: 0,
            
            ...communityData
        };
        
        this.communities.set(communityId, integratedCommunity);
        
        // Create in governance system
        const governanceCommunity = this.systems.governance.createCommunity(communityId, {
            ...communityData,
            governanceConfig: communityData.governanceConfig
        });
        integratedCommunity.systems.add('governance');
        integratedCommunity.crossSystemData.governance = governanceCommunity;
        
        // Create culture in cultural evolution system
        if (communityData.culturalData) {
            const culture = this.systems.culturalEvolution.createCulture(communityId, {
                ...communityData.culturalData,
                name: communityData.name || communityId
            });
            integratedCommunity.systems.add('culturalEvolution');
            integratedCommunity.crossSystemData.cultural = culture;
        }
        
        // Register in impact measurement system
        const impactBaseline = this.systems.impactMeasurement.registerCommunity(communityId, {
            ...communityData,
            baselineData: communityData.impactBaseline
        });
        integratedCommunity.systems.add('impactMeasurement');
        integratedCommunity.crossSystemData.impact = impactBaseline;
        
        this.emit('community_created', {
            communityId,
            systems: Array.from(integratedCommunity.systems),
            governanceModel: governanceCommunity.governanceModel
        });
        
        console.log(`✅ Community ${communityId} successfully created across ${integratedCommunity.systems.size} systems`);
        
        return integratedCommunity;
    }

    // Cross-system event handlers
    handleEmergentIntelligence(data) {
        console.log(`🧠 Emergent intelligence detected: ${data.capability}`);
        
        // Notify governance system for potential policy adaptations
        if (this.systems.governance) {
            // Could trigger governance discussions about new capabilities
        }
        
        // Update cultural evolution with new innovation
        if (this.systems.culturalEvolution) {
            // Could influence cultural innovation rates
        }
        
        // Measure impact of emergent intelligence
        if (this.systems.impactMeasurement) {
            this.systems.impactMeasurement.measureImpact('collective', 'community', {
                metrics: { emergentCapability: data.capability },
                attributedInterventions: ['collective_intelligence']
            });
        }
        
        this.emit('emergent_behavior_detected', {
            type: 'collective_intelligence',
            data
        });
    }

    handleCommunityDetection(data) {
        console.log(`🏘️ Community structure detected: ${data.communityCount} communities`);
        
        // Update governance system with community boundaries
        if (this.systems.governance) {
            // Could inform governance jurisdiction boundaries
        }
        
        // Update cultural evolution with community-based cultural groups
        if (this.systems.culturalEvolution) {
            // Could align cultural groups with detected communities
        }
        
        this.emit('community_structure_updated', data);
    }

    handleCulturalShift(data) {
        console.log(`🧬 Cultural shift detected: ${data.shiftType}`);
        
        // Update governance systems with cultural changes
        if (this.systems.governance) {
            // Cultural shifts might require governance adaptations
        }
        
        // Update trust networks - cultural alignment affects trust
        if (this.systems.trustNetworks) {
            // Cultural shifts could affect trust patterns
        }
        
        this.emit('cultural_shift_propagated', data);
    }

    handleTrustUpdate(data) {
        // Sync with legacy reputation system
        if (this.config.hybridMode && this.legacySystems.reputation) {
            const trustChange = data.change;
            const reputationChange = trustChange * this.config.integrationWeights.trust_reputation_correlation;
            
            this.legacySystems.reputation.updateReputation(
                data.trusteeId,
                reputationChange * 10, // Scale trust change to reputation scale
                'social_cooperation',
                { source: 'trust_network_sync', originalTruster: data.trusterId }
            );
        }
        
        // Update social network relationship strength
        if (this.systems.socialNetworks) {
            // Trust changes should reflect in social network edge weights
        }
    }

    handleGovernanceDecision(data) {
        console.log(`🏛️ Governance decision executed: ${data.proposalId}`);
        
        // Measure social impact of governance decisions
        if (this.systems.impactMeasurement) {
            this.systems.impactMeasurement.measureImpact(data.communityId, 'community', {
                metrics: { governanceDecision: data.proposalId },
                attributedInterventions: ['community_governance']
            });
        }
    }

    handleImpactMeasurement(data) {
        console.log(`📊 Impact measured for ${data.targetType} ${data.targetId}: ${data.impact.toFixed(3)}`);
        
        // Update agent/community records with impact data
        if (data.targetType === 'agent') {
            const agent = this.agents.get(data.targetId);
            if (agent) {
                agent.impactContribution = data.impact;
                this.updateAgentCrossSystemMetrics(data.targetId);
            }
        } else if (data.targetType === 'community') {
            const community = this.communities.get(data.targetId);
            if (community) {
                community.socialImpact = data.impact;
            }
        }
    }

    // Main orchestration cycle
    performOrchestrationCycle() {
        console.log('🔄 Performing orchestration cycle...');
        
        // Update cross-system metrics for all agents
        for (const [agentId] of this.agents) {
            this.updateAgentCrossSystemMetrics(agentId);
        }
        
        // Update community health across systems
        for (const [communityId] of this.communities) {
            this.updateCommunityHealth(communityId);
        }
        
        // Process system interactions
        this.processSystemInteractions();
        
        // Emit orchestration cycle complete
        this.emit('orchestration_cycle_complete', {
            agentsProcessed: this.agents.size,
            communitiesProcessed: this.communities.size,
            timestamp: Date.now()
        });
    }

    updateAgentCrossSystemMetrics(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) return;
        
        const metrics = {
            agentId,
            timestamp: Date.now(),
            
            // Collective intelligence metrics
            collectiveIQ: this.getAgentCollectiveIQ(agentId),
            problemSolvingContribution: this.getAgentProblemSolvingContribution(agentId),
            
            // Social network metrics
            networkCentrality: this.getAgentNetworkCentrality(agentId),
            influenceScore: this.getAgentInfluenceScore(agentId),
            
            // Cultural metrics
            culturalFitness: this.getAgentCulturalFitness(agentId),
            culturalInnovation: this.getAgentCulturalInnovation(agentId),
            
            // Trust metrics
            trustworthiness: this.getAgentTrustworthiness(agentId),
            economicTrust: this.getAgentEconomicTrust(agentId),
            
            // Governance metrics
            governanceParticipation: this.getAgentGovernanceParticipation(agentId),
            leadershipScore: this.getAgentLeadershipScore(agentId),
            
            // Impact metrics
            socialImpact: this.getAgentSocialImpact(agentId),
            impactEfficiency: this.getAgentImpactEfficiency(agentId),
            
            // Composite scores
            overallContribution: 0,
            systemAlignment: 0,
            emergentPotential: 0
        };
        
        // Calculate composite scores
        metrics.overallContribution = this.calculateOverallContribution(metrics);
        metrics.systemAlignment = this.calculateSystemAlignment(agentId);
        metrics.emergentPotential = this.calculateEmergentPotential(agentId);
        
        this.crossSystemMetrics.set(agentId, metrics);
        
        // Update agent aggregate metrics
        agent.overallInfluence = metrics.influenceScore;
        agent.totalTrust = metrics.trustworthiness;
        agent.culturalAlignment = metrics.culturalFitness;
        agent.governanceParticipation = metrics.governanceParticipation;
        agent.impactContribution = metrics.socialImpact;
        agent.collectiveIntelligenceRating = metrics.collectiveIQ;
    }

    // System synchronization
    synchronizeSystems() {
        console.log('🔄 Synchronizing cross-system data...');
        
        for (const [patternName, pattern] of Object.entries(this.integrationPatterns)) {
            this.executeIntegrationPattern(patternName, pattern);
        }
        
        this.emit('systems_synchronized', {
            patterns: Object.keys(this.integrationPatterns),
            timestamp: Date.now()
        });
    }

    executeIntegrationPattern(patternName, pattern) {
        switch (patternName) {
            case 'trust_reputation_sync':
                this.syncTrustAndReputation();
                break;
            case 'culture_governance_alignment':
                this.alignCultureAndGovernance();
                break;
            case 'network_collective_coordination':
                this.coordinateNetworkAndCollective();
                break;
            case 'impact_outcome_tracking':
                this.trackImpactAcrossSystems();
                break;
        }
    }

    syncTrustAndReputation() {
        // Synchronize trust network data with reputation system
        if (!this.systems.trustNetworks || !this.legacySystems.reputation) return;
        
        for (const [agentId] of this.agents) {
            const trustProfile = this.systems.trustNetworks.getAgentTrustProfile(agentId);
            if (trustProfile) {
                // Update legacy reputation based on trust metrics
                const reputationAdjustment = (trustProfile.reputation.combined - 0.5) * 10;
                if (Math.abs(reputationAdjustment) > 1) {
                    this.legacySystems.reputation.updateReputation(
                        agentId,
                        reputationAdjustment,
                        'social_cooperation',
                        { source: 'trust_sync', trustScore: trustProfile.reputation.combined }
                    );
                }
            }
        }
    }

    alignCultureAndGovernance() {
        // Ensure governance systems reflect cultural values
        for (const [communityId, community] of this.communities) {
            if (community.systems.has('governance') && community.systems.has('culturalEvolution')) {
                const culturalProfile = this.systems.culturalEvolution.getCultureProfile(communityId);
                const governanceMetrics = this.systems.governance.getCommunityGovernanceMetrics(communityId);
                
                if (culturalProfile && governanceMetrics) {
                    // Adjust governance effectiveness based on cultural alignment
                    const alignment = this.calculateCulturalGovernanceAlignment(culturalProfile, governanceMetrics);
                    community.culturalCoherence = alignment;
                }
            }
        }
    }

    // Analytics and reporting
    getIntegratedSystemMetrics() {
        return {
            // System overview
            systems: {
                phase4_enabled: this.config.enablePhase4Systems,
                legacy_enabled: this.config.enableLegacySystems,
                hybrid_mode: this.config.hybridMode,
                active_systems: Object.keys(this.systems).length + Object.keys(this.legacySystems).length
            },
            
            // Population metrics
            population: {
                total_agents: this.agents.size,
                total_communities: this.communities.size,
                registered_systems_per_agent: this.calculateAverageSystemsPerAgent(),
                cross_system_coverage: this.calculateCrossSystemCoverage()
            },
            
            // Performance metrics
            performance: {
                integration_efficiency: this.integrationEfficiency,
                system_synchronization_rate: this.calculateSynchronizationRate(),
                emergent_behavior_frequency: this.calculateEmergentBehaviorFrequency(),
                cross_system_correlation: this.calculateCrossSystemCorrelation()
            },
            
            // System-specific aggregates
            collective_intelligence: this.systems.collectiveIntelligence ? 
                this.systems.collectiveIntelligence.getCollectiveIntelligenceMetrics() : null,
            social_networks: this.systems.socialNetworks ? 
                this.systems.socialNetworks.getNetworkAnalytics() : null,
            cultural_evolution: this.systems.culturalEvolution ? 
                this.systems.culturalEvolution.getCulturalEvolutionMetrics() : null,
            governance: this.systems.governance ? 
                this.systems.governance.getGovernanceOverview() : null,
            trust_networks: this.systems.trustNetworks ? 
                this.systems.trustNetworks.getTrustNetworkMetrics() : null,
            impact_measurement: this.systems.impactMeasurement ? 
                this.systems.impactMeasurement.getImpactDashboard() : null,
            
            // Cross-system insights
            emergent_properties: Array.from(this.emergentProperties.values()),
            integration_patterns: Object.keys(this.integrationPatterns),
            system_interactions: this.systemInteractions.size
        };
    }

    getAgentIntegratedProfile(agentId) {
        const agent = this.agents.get(agentId);
        const metrics = this.crossSystemMetrics.get(agentId);
        
        if (!agent || !metrics) return null;
        
        return {
            // Basic information
            agentId,
            registeredAt: agent.registeredAt,
            activeSystems: Array.from(agent.systems),
            
            // Cross-system metrics
            metrics: { ...metrics },
            
            // System-specific profiles
            profiles: {
                collective_intelligence: this.systems.collectiveIntelligence ? 
                    this.systems.collectiveIntelligence.getAgentContributions(agentId) : null,
                social_networks: this.systems.socialNetworks ? 
                    this.systems.socialNetworks.getAgentNetworkProfile(agentId) : null,
                cultural_evolution: this.systems.culturalEvolution ? 
                    this.systems.culturalEvolution.getAgentCulturalProfile(agentId) : null,
                trust_networks: this.systems.trustNetworks ? 
                    this.systems.trustNetworks.getAgentTrustProfile(agentId) : null,
                governance: this.getAgentGovernanceProfile(agentId),
                impact: this.getAgentImpactProfile(agentId)
            },
            
            // Emergent properties
            emergentProperties: Array.from(agent.emergentProperties),
            
            // Performance indicators
            overallContribution: metrics.overallContribution,
            systemAlignment: metrics.systemAlignment,
            emergentPotential: metrics.emergentPotential
        };
    }

    // Utility methods for metric calculations
    getAgentCollectiveIQ(agentId) {
        if (!this.systems.collectiveIntelligence) return 0.5;
        const contributions = this.systems.collectiveIntelligence.getAgentContributions(agentId);
        return contributions ? contributions.solutionQuality : 0.5;
    }

    getAgentNetworkCentrality(agentId) {
        if (!this.systems.socialNetworks) return 0.5;
        const profile = this.systems.socialNetworks.getAgentNetworkProfile(agentId);
        return profile ? profile.centrality.degree : 0.5;
    }

    getAgentTrustworthiness(agentId) {
        if (!this.systems.trustNetworks) return 0.5;
        const profile = this.systems.trustNetworks.getAgentTrustProfile(agentId);
        return profile ? profile.reputation.combined : 0.5;
    }

    calculateOverallContribution(metrics) {
        const weights = {
            collectiveIQ: 0.2,
            networkCentrality: 0.15,
            culturalFitness: 0.15,
            trustworthiness: 0.15,
            governanceParticipation: 0.15,
            socialImpact: 0.2
        };
        
        let weightedSum = 0;
        let totalWeight = 0;
        
        Object.entries(weights).forEach(([metric, weight]) => {
            if (metrics[metric] !== undefined) {
                weightedSum += metrics[metric] * weight;
                totalWeight += weight;
            }
        });
        
        return totalWeight > 0 ? weightedSum / totalWeight : 0.5;
    }

    // Cleanup
    stop() {
        console.log('🛑 Stopping Phase 4 Integration Orchestrator...');
        
        // Stop orchestration processes
        if (this.orchestrationInterval) clearInterval(this.orchestrationInterval);
        if (this.syncInterval) clearInterval(this.syncInterval);
        if (this.emergenceInterval) clearInterval(this.emergenceInterval);
        if (this.optimizationInterval) clearInterval(this.optimizationInterval);
        
        // Stop all Phase 4 systems
        Object.values(this.systems).forEach(system => {
            if (system.stop) system.stop();
        });
        
        // Stop all legacy systems
        Object.values(this.legacySystems).forEach(system => {
            if (system.stop) system.stop();
        });
        
        console.log('✅ Phase 4 Integration Orchestrator stopped successfully');
    }
}

module.exports = Phase4IntegrationOrchestrator;
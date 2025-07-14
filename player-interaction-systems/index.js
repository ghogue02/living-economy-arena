/**
 * Player Interaction Systems - Main Integration Module
 * Coordinates all player control and influence mechanisms
 */

const EventEmitter = require('eventemitter3');

// Import subsystems
const PlayerControlEngine = require('./core/player-control-engine');
const IntelligenceSystem = require('./espionage/intelligence-system');
const CoalitionSystem = require('./alliances/coalition-system');
const CrisisOrchestrationSystem = require('./influence/crisis-orchestration');

class PlayerInteractionSystems extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // System integration settings
            enablePolicyControl: config.enablePolicyControl !== false,
            enableIntelligence: config.enableIntelligence !== false,
            enableCoalitions: config.enableCoalitions !== false,
            enableCrisisOrchestration: config.enableCrisisOrchestration !== false,
            
            // Cross-system coordination
            systemIntegration: config.systemIntegration !== false,
            eventPropagation: config.eventPropagation !== false,
            sharedMemory: config.sharedMemory !== false,
            
            // Performance settings
            updateFrequency: config.updateFrequency || 60000, // 1 minute
            syncFrequency: config.syncFrequency || 300000, // 5 minutes
            
            // Component configurations
            playerControlConfig: config.playerControlConfig || {},
            intelligenceConfig: config.intelligenceConfig || {},
            coalitionConfig: config.coalitionConfig || {},
            crisisOrchestrationConfig: config.crisisOrchestrationConfig || {},
            
            ...config
        };

        this.state = {
            initialized: false,
            systemHealth: {
                overall: 1.0,
                components: new Map(),
                lastUpdate: Date.now()
            },
            coordinationActive: false,
            crossSystemEvents: [],
            playerRegistry: new Map(),
            activeInfluences: new Map(),
            systemMetrics: {
                totalPlayers: 0,
                activePolicies: 0,
                activeOperations: 0,
                activeCoalitions: 0,
                activeCrises: 0
            }
        };

        this.components = {};
        this.initializeComponents();
    }

    async initializeComponents() {
        try {
            console.log('🎮 Initializing Player Interaction Systems...');

            // Initialize Player Control Engine
            if (this.config.enablePolicyControl) {
                console.log('🔧 Initializing Player Control Engine...');
                this.components.playerControl = new PlayerControlEngine(
                    this.config.playerControlConfig
                );
                this.setupComponentIntegration('playerControl', this.components.playerControl);
                console.log('✅ Player Control Engine ready');
            }

            // Initialize Intelligence System
            if (this.config.enableIntelligence) {
                console.log('🔧 Initializing Intelligence System...');
                this.components.intelligence = new IntelligenceSystem(
                    this.config.intelligenceConfig
                );
                this.setupComponentIntegration('intelligence', this.components.intelligence);
                console.log('✅ Intelligence System ready');
            }

            // Initialize Coalition System
            if (this.config.enableCoalitions) {
                console.log('🔧 Initializing Coalition System...');
                this.components.coalitions = new CoalitionSystem(
                    this.config.coalitionConfig
                );
                this.setupComponentIntegration('coalitions', this.components.coalitions);
                console.log('✅ Coalition System ready');
            }

            // Initialize Crisis Orchestration System
            if (this.config.enableCrisisOrchestration) {
                console.log('🔧 Initializing Crisis Orchestration System...');
                this.components.crisisOrchestration = new CrisisOrchestrationSystem(
                    this.config.crisisOrchestrationConfig
                );
                this.setupComponentIntegration('crisisOrchestration', this.components.crisisOrchestration);
                console.log('✅ Crisis Orchestration System ready');
            }

            // Setup cross-component coordination
            this.setupCrossSystemCoordination();

            // Start system monitoring
            this.startSystemMonitoring();

            this.state.initialized = true;
            this.state.coordinationActive = true;

            console.log('✅ Player Interaction Systems initialization complete!');
            this.emit('system_initialized', {
                components: Object.keys(this.components),
                timestamp: Date.now()
            });

            return true;

        } catch (error) {
            console.error('❌ Player Interaction Systems initialization failed:', error);
            this.emit('initialization_error', { error: error.message });
            throw error;
        }
    }

    setupComponentIntegration(componentName, component) {
        if (!this.config.eventPropagation) return;

        // Forward all component events with component identifier
        component.on('*', (eventName, ...args) => {
            this.emit(`${componentName}_${eventName}`, ...args);
            
            // Log cross-system events for analysis
            this.state.crossSystemEvents.push({
                timestamp: Date.now(),
                component: componentName,
                event: eventName,
                data: args[0]
            });

            // Keep only recent events
            if (this.state.crossSystemEvents.length > 1000) {
                this.state.crossSystemEvents.shift();
            }
        });

        // Set up specific event handling for coordination
        this.setupSpecificEventHandling(componentName, component);
    }

    setupSpecificEventHandling(componentName, component) {
        switch (componentName) {
            case 'playerControl':
                component.on('policy_implemented', (data) => {
                    this.handlePolicyImplemented(data);
                });
                component.on('infrastructure_completed', (data) => {
                    this.handleInfrastructureCompleted(data);
                });
                component.on('propaganda_campaign_launched', (data) => {
                    this.handlePropagandaCampaign(data);
                });
                break;

            case 'intelligence':
                component.on('operation_succeeded', (data) => {
                    this.handleIntelligenceSuccess(data);
                });
                component.on('operation_detected', (data) => {
                    this.handleOperationDetected(data);
                });
                component.on('player_leveled_up', (data) => {
                    this.handlePlayerLevelUp(data);
                });
                break;

            case 'coalitions':
                component.on('coalition_created', (data) => {
                    this.handleCoalitionCreated(data);
                });
                component.on('coalition_betrayed', (data) => {
                    this.handleCoalitionBetrayed(data);
                });
                component.on('treaty_activated', (data) => {
                    this.handleTreatyActivated(data);
                });
                break;

            case 'crisisOrchestration':
                component.on('crisis_started', (data) => {
                    this.handleCrisisStarted(data);
                });
                component.on('crisis_orchestration_detected', (data) => {
                    this.handleCrisisDetected(data);
                });
                component.on('natural_disaster_occurred', (data) => {
                    this.handleNaturalDisaster(data);
                });
                break;
        }
    }

    setupCrossSystemCoordination() {
        if (!this.config.systemIntegration) return;

        console.log('🔧 Setting up cross-system coordination...');

        // Intelligence affects policy effectiveness
        if (this.components.intelligence && this.components.playerControl) {
            this.setupIntelligencePolicyCoordination();
        }

        // Coalitions affect crisis response
        if (this.components.coalitions && this.components.crisisOrchestration) {
            this.setupCoalitionCrisisCoordination();
        }

        // All systems affect player reputation and relationships
        this.setupReputationCoordination();

        console.log('✅ Cross-system coordination ready');
    }

    setupIntelligencePolicyCoordination() {
        // Intelligence gathering affects policy targeting accuracy
        this.components.intelligence.on('operation_succeeded', (data) => {
            if (data.results && data.results.intelligence) {
                const playerId = data.playerId;
                const intelligence = data.results.intelligence;

                // Provide intelligence bonuses for policy implementation
                intelligence.forEach(intel => {
                    if (intel.type === 'market_surveillance' || intel.type === 'competitor_analysis') {
                        this.components.playerControl.updatePlayerEfficiencyBonus(
                            playerId, 
                            'intelligence_gathering', 
                            0.15,
                            intel.expirationTime
                        );
                    }
                });
            }
        });
    }

    setupCoalitionCrisisCoordination() {
        // Coalition members can coordinate crisis responses
        this.components.crisisOrchestration.on('crisis_started', (data) => {
            const { crisis } = data;
            
            // Find coalitions that might respond to crisis
            const affectedCoalitions = this.findAffectedCoalitions(crisis);
            
            affectedCoalitions.forEach(coalition => {
                this.coordinateCoalitionCrisisResponse(coalition, crisis);
            });
        });
    }

    setupReputationCoordination() {
        // Track reputation changes across all systems
        const reputationEvents = [
            'policy_implemented',
            'operation_detected',
            'coalition_betrayed',
            'crisis_orchestration_detected',
            'intelligence_success',
            'treaty_violated'
        ];

        reputationEvents.forEach(eventType => {
            this.on(`*_${eventType}`, (data) => {
                this.updatePlayerReputation(data.playerId, eventType, data);
            });
        });
    }

    // Event Handlers
    handlePolicyImplemented(data) {
        const { playerId, policy } = data;
        
        // Policy implementation may affect intelligence operations
        if (this.components.intelligence) {
            this.notifyIntelligenceOfPolicyChange(playerId, policy);
        }

        // Policy may affect coalition relationships
        if (this.components.coalitions) {
            this.assessPolicyCoalitionImpact(playerId, policy);
        }

        this.updatePlayerActivity(playerId, 'policy_implementation');
    }

    handleInfrastructureCompleted(data) {
        const { playerId, location, efficiency } = data;
        
        // Infrastructure may affect crisis resistance
        if (this.components.crisisOrchestration) {
            this.updateRegionalResilience(location, efficiency);
        }

        // Infrastructure may benefit coalition members
        if (this.components.coalitions) {
            this.shareInfrastructureBenefits(playerId, location, efficiency);
        }
    }

    handlePropagandaCampaign(data) {
        const { playerId, campaign } = data;
        
        // Propaganda may affect intelligence operations
        if (this.components.intelligence && campaign.type === 'disinformation') {
            this.applyInformationDistortion(campaign);
        }

        // Propaganda may affect coalition trust
        if (this.components.coalitions && campaign.target.includes('coalition_members')) {
            this.assessPropagandaCoalitionImpact(playerId, campaign);
        }
    }

    handleIntelligenceSuccess(data) {
        const { playerId, results } = data;
        
        // Successful intelligence may improve policy targeting
        if (this.components.playerControl) {
            this.applyIntelligenceBonus(playerId, results);
        }

        // Intelligence success may affect coalition standing
        if (this.components.coalitions) {
            this.updateCoalitionIntelligenceSharing(playerId, results);
        }
    }

    handleOperationDetected(data) {
        const { playerId, operationType } = data;
        
        // Detection may trigger coalition responses
        if (this.components.coalitions) {
            this.handleIntelligenceDetectionInCoalitions(playerId, operationType);
        }

        // Detection may affect crisis orchestration capabilities
        if (this.components.crisisOrchestration) {
            this.applyDetectionPenalties(playerId);
        }
    }

    handlePlayerLevelUp(data) {
        const { playerId, newLevel } = data;
        
        // Level up affects capabilities across all systems
        this.broadcastPlayerLevelUp(playerId, newLevel);
    }

    handleCoalitionCreated(data) {
        const { coalitionId, founderId } = data;
        
        // New coalitions may affect intelligence targeting
        if (this.components.intelligence) {
            this.updateIntelligenceTargeting(founderId, 'coalition_formation');
        }

        // Coalitions may coordinate crisis responses
        if (this.components.crisisOrchestration) {
            this.registerCoalitionForCrisisCoordination(coalitionId);
        }
    }

    handleCoalitionBetrayed(data) {
        const { betrayalId, coalitionId, betrayerId } = data;
        
        // Betrayal affects intelligence operations
        if (this.components.intelligence) {
            this.applyBetrayalIntelligencePenalties(betrayerId, coalitionId);
        }

        // Betrayal may affect crisis orchestration trust
        if (this.components.crisisOrchestration) {
            this.updateCrisisCoordinationTrust(betrayerId, -0.5);
        }
    }

    handleTreatyActivated(data) {
        const { treatyId, treaty } = data;
        
        // Treaties may affect intelligence sharing
        if (this.components.intelligence && treaty.type === 'intelligence_sharing') {
            this.enableIntelligenceSharing(treaty.proposer, treaty.target);
        }

        // Treaties may affect crisis coordination
        if (this.components.crisisOrchestration && treaty.type === 'mutual_defense') {
            this.enableMutualCrisisResponse(treaty.proposer, treaty.target);
        }
    }

    handleCrisisStarted(data) {
        const { crisisId, crisis } = data;
        
        // Crisis may trigger intelligence operations
        if (this.components.intelligence && crisis.orchestrator) {
            this.triggerCrisisInvestigation(crisis);
        }

        // Crisis may trigger coalition responses
        if (this.components.coalitions) {
            this.notifyCoalitionsOfCrisis(crisis);
        }

        // Crisis affects policy effectiveness
        if (this.components.playerControl) {
            this.applyCrisisToRegionalPolicies(crisis);
        }
    }

    handleCrisisDetected(data) {
        const { orchestrator, detection } = data;
        
        // Detection affects all player systems
        this.applyDetectionConsequencesAcrossSystems(orchestrator, detection);
    }

    handleNaturalDisaster(data) {
        const { crisis } = data;
        
        // Natural disasters may trigger coalition aid
        if (this.components.coalitions) {
            this.coordinateDisasterRelief(crisis);
        }

        // Natural disasters affect infrastructure and policies
        if (this.components.playerControl) {
            this.assessDisasterInfrastructureImpact(crisis);
        }
    }

    // Coordination Methods
    findAffectedCoalitions(crisis) {
        if (!this.components.coalitions) return [];
        
        // Find coalitions that might be affected by the crisis
        const allCoalitions = Array.from(this.components.coalitions.state.coalitions.values());
        
        return allCoalitions.filter(coalition => {
            // Check if coalition members are in affected region
            if (crisis.target && crisis.target.region) {
                return coalition.members.some(memberId => {
                    const player = this.state.playerRegistry.get(memberId);
                    return player && player.region === crisis.target.region;
                });
            }
            return false;
        });
    }

    coordinateCoalitionCrisisResponse(coalition, crisis) {
        // Coalitions can coordinate responses to crises
        const response = {
            coalitionId: coalition.id,
            crisisId: crisis.id,
            responseType: 'coordinated_defense',
            participants: coalition.members,
            effectivenessBonus: coalition.cooperationScore * 0.3, // 30% max bonus
            timestamp: Date.now()
        };

        this.emit('coalition_crisis_response', response);
    }

    updatePlayerReputation(playerId, eventType, data) {
        const player = this.state.playerRegistry.get(playerId);
        if (!player) return;

        const reputationChanges = {
            'policy_implemented': 0.05,
            'operation_detected': -0.15,
            'coalition_betrayed': -0.3,
            'crisis_orchestration_detected': -0.4,
            'intelligence_success': 0.1,
            'treaty_violated': -0.2
        };

        const change = reputationChanges[eventType] || 0;
        player.reputation = Math.max(-1, Math.min(1, player.reputation + change));

        this.emit('player_reputation_updated', { playerId, newReputation: player.reputation, change });
    }

    updatePlayerActivity(playerId, activityType) {
        const player = this.state.playerRegistry.get(playerId);
        if (!player) return;

        player.lastActivity = Date.now();
        player.activityHistory = player.activityHistory || [];
        player.activityHistory.push({
            type: activityType,
            timestamp: Date.now()
        });

        // Keep only recent activity
        if (player.activityHistory.length > 50) {
            player.activityHistory.shift();
        }
    }

    // System Monitoring
    startSystemMonitoring() {
        console.log('📊 Starting Player Interaction Systems monitoring...');

        // Update system metrics every minute
        setInterval(() => {
            this.updateSystemMetrics();
        }, this.config.updateFrequency);

        // Sync systems every 5 minutes
        setInterval(() => {
            this.syncSystems();
        }, this.config.syncFrequency);
    }

    updateSystemMetrics() {
        this.state.systemMetrics = {
            totalPlayers: this.state.playerRegistry.size,
            activePolicies: this.components.playerControl ? 
                this.components.playerControl.state.activePolicies.size : 0,
            activeOperations: this.components.intelligence ? 
                this.components.intelligence.state.activeOperations.size : 0,
            activeCoalitions: this.components.coalitions ? 
                this.components.coalitions.state.coalitions.size : 0,
            activeCrises: this.components.crisisOrchestration ? 
                this.components.crisisOrchestration.state.activeCrises.size : 0
        };

        // Update component health
        Object.keys(this.components).forEach(componentName => {
            const component = this.components[componentName];
            let health = 1.0;
            
            if (component.getSystemStatus) {
                const status = component.getSystemStatus();
                // Simple health calculation based on system load
                health = Math.max(0.1, 1.0 - (Object.values(status).reduce((sum, val) => 
                    sum + (typeof val === 'number' ? val / 1000 : 0), 0) / 10));
            }
            
            this.state.systemHealth.components.set(componentName, health);
        });

        // Calculate overall health
        const componentHealths = Array.from(this.state.systemHealth.components.values());
        this.state.systemHealth.overall = componentHealths.length > 0 ?
            componentHealths.reduce((sum, health) => sum + health, 0) / componentHealths.length : 1.0;
        
        this.state.systemHealth.lastUpdate = Date.now();

        this.emit('system_metrics_updated', {
            metrics: this.state.systemMetrics,
            health: this.state.systemHealth
        });
    }

    syncSystems() {
        // Synchronize data between systems if needed
        if (this.config.sharedMemory) {
            this.synchronizePlayerData();
            this.synchronizeInfluenceData();
        }
    }

    synchronizePlayerData() {
        // Ensure all systems have consistent player data
        for (const [playerId, player] of this.state.playerRegistry) {
            // Update player data across all components
            Object.values(this.components).forEach(component => {
                if (component.updatePlayerData) {
                    component.updatePlayerData(playerId, player);
                }
            });
        }
    }

    synchronizeInfluenceData() {
        // Collect all active influences from all systems
        const allInfluences = [];

        if (this.components.playerControl) {
            allInfluences.push(...this.components.playerControl.getCurrentEffects());
        }

        if (this.components.crisisOrchestration) {
            allInfluences.push(...this.components.crisisOrchestration.getCrisisEffects());
        }

        // Store aggregated influences
        this.state.activeInfluences.set('aggregated', allInfluences);
    }

    // Public API Methods

    // Player Management
    async registerPlayer(playerId, playerData = {}) {
        const player = {
            id: playerId,
            name: playerData.name || `Player_${playerId.slice(0, 8)}`,
            reputation: playerData.reputation || 0,
            level: playerData.level || 1,
            registeredAt: Date.now(),
            lastActivity: Date.now(),
            activityHistory: [],
            systemAccess: {
                policies: true,
                intelligence: true,
                coalitions: true,
                crisisOrchestration: true
            },
            ...playerData
        };

        this.state.playerRegistry.set(playerId, player);

        // Register with all systems
        const registrationResults = {};

        if (this.components.playerControl) {
            registrationResults.playerControl = this.components.playerControl.registerPlayer(playerId, playerData);
        }

        if (this.components.intelligence) {
            // Intelligence system registers players automatically
            registrationResults.intelligence = { registered: true };
        }

        if (this.components.coalitions) {
            // Coalition system registers players automatically
            registrationResults.coalitions = { registered: true };
        }

        if (this.components.crisisOrchestration) {
            // Crisis system registers players automatically
            registrationResults.crisisOrchestration = { registered: true };
        }

        this.emit('player_registered', { playerId, player, registrationResults });
        return { playerId, registrationResults };
    }

    // Get all effects that should be applied to the economic engine
    getCurrentMarketEffects() {
        const effects = [];

        // Collect policy effects
        if (this.components.playerControl) {
            effects.push(...this.components.playerControl.getCurrentEffects());
        }

        // Collect crisis effects
        if (this.components.crisisOrchestration) {
            effects.push(...this.components.crisisOrchestration.getCrisisEffects());
        }

        // Collect coalition effects (if any)
        if (this.components.coalitions) {
            // Add coalition-based market effects
            const coalitions = Array.from(this.components.coalitions.state.coalitions.values());
            coalitions.forEach(coalition => {
                if (coalition.currentBonus && coalition.members.length > 2) {
                    effects.push({
                        type: 'coalition_cooperation_bonus',
                        value: coalition.currentBonus,
                        playerId: coalition.members,
                        coalitionId: coalition.id
                    });
                }
            });
        }

        return effects;
    }

    // System Status and Analytics
    getSystemStatus() {
        return {
            initialized: this.state.initialized,
            coordinationActive: this.state.coordinationActive,
            systemHealth: this.state.systemHealth,
            metrics: this.state.systemMetrics,
            componentStatus: Object.fromEntries(
                Object.entries(this.components).map(([name, component]) => [
                    name,
                    {
                        active: !!component,
                        health: this.state.systemHealth.components.get(name) || 0,
                        status: component.getSystemStatus ? component.getSystemStatus() : 'unknown'
                    }
                ])
            ),
            playerCount: this.state.playerRegistry.size,
            lastUpdate: Date.now()
        };
    }

    getPlayerOverview(playerId) {
        const player = this.state.playerRegistry.get(playerId);
        if (!player) return null;

        const overview = { player };

        // Collect data from all systems
        if (this.components.playerControl) {
            overview.controlStatus = this.components.playerControl.getPlayerStatus(playerId);
        }

        if (this.components.intelligence) {
            overview.intelligenceStatus = this.components.intelligence.getPlayerIntelligence(playerId);
        }

        if (this.components.coalitions) {
            overview.coalitions = this.components.coalitions.getPlayerCoalitions(playerId);
            overview.relationships = this.components.coalitions.getPlayerRelationships(playerId);
        }

        if (this.components.crisisOrchestration) {
            overview.crisisHistory = this.components.crisisOrchestration.getPlayerCrisisHistory(playerId);
        }

        return overview;
    }

    // Component Access
    getPolicyEngine() {
        return this.components.playerControl;
    }

    getIntelligenceSystem() {
        return this.components.intelligence;
    }

    getCoalitionSystem() {
        return this.components.coalitions;
    }

    getCrisisOrchestrationSystem() {
        return this.components.crisisOrchestration;
    }

    // Shutdown
    async shutdown() {
        console.log('🛑 Shutting down Player Interaction Systems...');

        this.state.coordinationActive = false;

        // Shutdown all components
        Object.values(this.components).forEach(component => {
            if (component.stop) {
                component.stop();
            }
        });

        this.state.initialized = false;
        
        console.log('✅ Player Interaction Systems shutdown complete');
        this.emit('system_shutdown');
    }
}

module.exports = PlayerInteractionSystems;
/**
 * Core State Manager for Persistent World State
 * Handles 24/7 autonomous market evolution and state persistence
 */

const EventEmitter = require('events');
const crypto = require('crypto');
const StateShardingSystem = require('../../infrastructure/scaling/state-sharding');

class PersistentStateManager extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            nodeId: config.nodeId || this.generateNodeId(),
            autonomous: config.autonomous !== false,
            timeAcceleration: config.timeAcceleration || 1.0,
            snapshotInterval: config.snapshotInterval || 60000, // 1 minute
            compressionLevel: config.compressionLevel || 'high',
            maxEventHistory: config.maxEventHistory || 10000000, // 10M events
            redundancyLevel: config.redundancyLevel || 3,
            ...config
        };
        
        // Core components
        this.stateSharding = null;
        this.eventRecorder = null;
        this.snapshotEngine = null;
        this.autonomousEngine = null;
        this.compressionEngine = null;
        this.failoverManager = null;
        
        // State tracking
        this.currentState = new Map();
        this.stateVersions = new Map();
        this.pendingUpdates = new Map();
        this.eventBuffer = [];
        this.checkpoints = new Map();
        
        // Metrics and monitoring
        this.metrics = {
            uptime: Date.now(),
            stateUpdates: 0,
            eventsRecorded: 0,
            snapshotsTaken: 0,
            autonomousActions: 0,
            compressionRatio: 0,
            recoveryEvents: 0,
            dataIntegrityChecks: 0
        };
        
        // Operational flags
        this.isRunning = false;
        this.autonomousMode = config.autonomous !== false;
        this.maintenanceMode = false;
        
        this.initialize();
    }
    
    generateNodeId() {
        return `persist-${crypto.randomBytes(8).toString('hex')}-${Date.now()}`;
    }
    
    async initialize() {
        try {
            console.log(`Initializing Persistent State Manager: ${this.config.nodeId}`);
            
            // Initialize state sharding system
            this.stateSharding = new StateShardingSystem({
                nodeId: this.config.nodeId,
                totalShards: this.config.totalShards || 32,
                replicationFactor: this.config.redundancyLevel,
                consistencyLevel: 'strong'
            });
            
            // Initialize core components
            await this.initializeEventRecorder();
            await this.initializeSnapshotEngine();
            await this.initializeAutonomousEngine();
            await this.initializeCompressionEngine();
            await this.initializeFailoverManager();
            
            // Set up monitoring and health checks
            this.setupMonitoring();
            this.setupHealthChecks();
            
            // Start autonomous operation if enabled
            if (this.autonomousMode) {
                await this.startAutonomousOperation();
            }
            
            this.isRunning = true;
            this.emit('ready');
            
            console.log(`Persistent State Manager ready: ${this.config.nodeId}`);
            
        } catch (error) {
            console.error('Failed to initialize Persistent State Manager:', error);
            this.emit('error', error);
        }
    }
    
    async initializeEventRecorder() {
        this.eventRecorder = {
            buffer: [],
            batchSize: 1000,
            flushInterval: 5000, // 5 seconds
            compressionEnabled: true,
            
            async record(event) {
                const enrichedEvent = {
                    ...event,
                    id: crypto.randomBytes(16).toString('hex'),
                    timestamp: Date.now(),
                    nodeId: this.config.nodeId,
                    version: this.getStateVersion(event.entityId || 'global'),
                    checksum: this.calculateEventChecksum(event)
                };
                
                this.buffer.push(enrichedEvent);
                this.metrics.eventsRecorded++;
                
                // Immediate flush for critical events
                if (event.priority === 'critical') {
                    await this.flush();
                }
                
                // Auto-flush when buffer is full
                if (this.buffer.length >= this.batchSize) {
                    await this.flush();
                }
                
                return enrichedEvent.id;
            },
            
            async flush() {
                if (this.buffer.length === 0) return;
                
                const events = [...this.buffer];
                this.buffer = [];
                
                try {
                    // Compress events if enabled
                    const data = this.compressionEnabled ? 
                        await this.parent.compressionEngine.compress(events) : 
                        events;
                    
                    // Store in sharded system
                    await this.parent.stateSharding.set(
                        `events:batch:${Date.now()}`,
                        data,
                        { persist: true, replicate: true }
                    );
                    
                    // Update event index
                    await this.updateEventIndex(events);
                    
                } catch (error) {
                    console.error('Failed to flush events:', error);
                    // Re-add events to buffer for retry
                    this.buffer.unshift(...events);
                    throw error;
                }
            },
            
            async updateEventIndex(events) {
                const indexUpdates = [];
                
                for (const event of events) {
                    // Entity-based index
                    if (event.entityId) {
                        indexUpdates.push({
                            key: `index:entity:${event.entityId}`,
                            value: event.id
                        });
                    }
                    
                    // Type-based index
                    indexUpdates.push({
                        key: `index:type:${event.type}`,
                        value: event.id
                    });
                    
                    // Time-based index
                    const timeSlot = Math.floor(event.timestamp / 3600000); // Hour slots
                    indexUpdates.push({
                        key: `index:time:${timeSlot}`,
                        value: event.id
                    });
                }
                
                await this.parent.stateSharding.batchOperation(indexUpdates);
            },
            
            parent: this
        };
        
        // Set up auto-flush interval
        setInterval(() => {
            this.eventRecorder.flush().catch(error => {
                console.error('Auto-flush failed:', error);
            });
        }, this.eventRecorder.flushInterval);
    }
    
    async initializeSnapshotEngine() {
        this.snapshotEngine = {
            snapshots: new Map(),
            compressionEnabled: true,
            maxSnapshots: 100,
            
            async takeSnapshot(entityId = 'global', options = {}) {
                const startTime = Date.now();
                
                try {
                    const state = await this.parent.getCurrentState(entityId);
                    const version = this.parent.getStateVersion(entityId);
                    
                    const snapshot = {
                        id: crypto.randomBytes(16).toString('hex'),
                        entityId,
                        version,
                        timestamp: Date.now(),
                        state: state,
                        metadata: {
                            size: JSON.stringify(state).length,
                            nodeId: this.parent.config.nodeId,
                            compressionEnabled: this.compressionEnabled,
                            ...options.metadata
                        }
                    };
                    
                    // Compress if enabled
                    if (this.compressionEnabled) {
                        const compressed = await this.parent.compressionEngine.compress(snapshot.state);
                        snapshot.compressedState = compressed;
                        snapshot.metadata.compressedSize = compressed.length;
                        snapshot.metadata.compressionRatio = 
                            (1 - compressed.length / snapshot.metadata.size) * 100;
                    }
                    
                    // Store snapshot
                    await this.parent.stateSharding.set(
                        `snapshot:${entityId}:${snapshot.id}`,
                        snapshot,
                        { persist: true, replicate: true }
                    );
                    
                    // Update snapshot index
                    await this.updateSnapshotIndex(snapshot);
                    
                    // Manage snapshot lifecycle
                    await this.manageSnapshotLifecycle(entityId);
                    
                    this.snapshots.set(snapshot.id, snapshot);
                    this.parent.metrics.snapshotsTaken++;
                    
                    console.log(`Snapshot taken for ${entityId}: ${snapshot.id} (${Date.now() - startTime}ms)`);
                    
                    return snapshot;
                    
                } catch (error) {
                    console.error(`Failed to take snapshot for ${entityId}:`, error);
                    throw error;
                }
            },
            
            async restoreSnapshot(snapshotId, options = {}) {
                try {
                    const snapshot = await this.parent.stateSharding.get(`snapshot:${snapshotId}`);
                    if (!snapshot) {
                        throw new Error(`Snapshot not found: ${snapshotId}`);
                    }
                    
                    let state = snapshot.state;
                    
                    // Decompress if needed
                    if (snapshot.compressedState) {
                        state = await this.parent.compressionEngine.decompress(snapshot.compressedState);
                    }
                    
                    // Restore state
                    if (options.verify !== false) {
                        await this.verifySnapshotIntegrity(snapshot, state);
                    }
                    
                    await this.parent.restoreState(snapshot.entityId, state, snapshot.version);
                    
                    console.log(`Snapshot restored: ${snapshotId} for ${snapshot.entityId}`);
                    
                    return {
                        success: true,
                        snapshotId,
                        entityId: snapshot.entityId,
                        version: snapshot.version,
                        timestamp: snapshot.timestamp
                    };
                    
                } catch (error) {
                    console.error(`Failed to restore snapshot ${snapshotId}:`, error);
                    throw error;
                }
            },
            
            async updateSnapshotIndex(snapshot) {
                const indexUpdates = [
                    {
                        key: `index:snapshots:${snapshot.entityId}`,
                        value: JSON.stringify({
                            id: snapshot.id,
                            timestamp: snapshot.timestamp,
                            version: snapshot.version
                        })
                    },
                    {
                        key: `index:snapshots:latest:${snapshot.entityId}`,
                        value: snapshot.id
                    }
                ];
                
                await this.parent.stateSharding.batchOperation(indexUpdates);
            },
            
            async manageSnapshotLifecycle(entityId) {
                // Get all snapshots for entity
                const snapshots = await this.getSnapshotsForEntity(entityId);
                
                if (snapshots.length > this.maxSnapshots) {
                    // Remove oldest snapshots
                    const toRemove = snapshots
                        .sort((a, b) => a.timestamp - b.timestamp)
                        .slice(0, snapshots.length - this.maxSnapshots);
                    
                    for (const snapshot of toRemove) {
                        await this.parent.stateSharding.delete(`snapshot:${entityId}:${snapshot.id}`);
                        this.snapshots.delete(snapshot.id);
                    }
                }
            },
            
            async getSnapshotsForEntity(entityId) {
                // Implementation would query snapshot index
                return [];
            },
            
            async verifySnapshotIntegrity(snapshot, state) {
                // Verify checksum, size, and structure
                const stateSize = JSON.stringify(state).length;
                if (stateSize !== snapshot.metadata.size) {
                    throw new Error('Snapshot size mismatch');
                }
                
                // Additional integrity checks...
                return true;
            },
            
            parent: this
        };
        
        // Set up automatic snapshots
        setInterval(async () => {
            if (!this.maintenanceMode) {
                try {
                    await this.snapshotEngine.takeSnapshot('global');
                } catch (error) {
                    console.error('Automatic snapshot failed:', error);
                }
            }
        }, this.config.snapshotInterval);
    }
    
    async initializeAutonomousEngine() {
        this.autonomousEngine = {
            isActive: false,
            agentSimulators: new Map(),
            marketSimulators: new Map(),
            eventGenerators: new Map(),
            
            async start() {
                if (this.isActive) return;
                
                this.isActive = true;
                console.log('Starting autonomous market evolution...');
                
                // Initialize agent simulators
                await this.initializeAgentSimulators();
                
                // Initialize market simulators
                await this.initializeMarketSimulators();
                
                // Initialize event generators
                await this.initializeEventGenerators();
                
                // Start autonomous loops
                this.startAutonomousLoops();
            },
            
            async stop() {
                this.isActive = false;
                console.log('Stopping autonomous market evolution...');
                
                // Cleanup autonomous processes
                this.cleanupAutonomousProcesses();
            },
            
            async initializeAgentSimulators() {
                // Create simulators for offline agent behavior
                const agentTypes = ['trader', 'investor', 'speculator', 'market_maker'];
                
                for (const type of agentTypes) {
                    this.agentSimulators.set(type, {
                        type,
                        population: 1000,
                        activityLevel: 0.3,
                        behaviors: await this.loadAgentBehaviors(type),
                        
                        async simulate() {
                            const activeAgents = Math.floor(this.population * this.activityLevel);
                            const actions = [];
                            
                            for (let i = 0; i < activeAgents; i++) {
                                const behavior = this.behaviors[Math.floor(Math.random() * this.behaviors.length)];
                                const action = await this.generateAction(behavior);
                                if (action) actions.push(action);
                            }
                            
                            return actions;
                        },
                        
                        async generateAction(behavior) {
                            // Generate realistic agent action based on behavior profile
                            return {
                                type: behavior.type,
                                agentId: `autonomous_${type}_${Math.floor(Math.random() * this.population)}`,
                                action: behavior.action,
                                parameters: behavior.generateParameters(),
                                timestamp: Date.now()
                            };
                        },
                        
                        async loadAgentBehaviors(agentType) {
                            // Load behavior profiles from AI personality system
                            return [
                                {
                                    type: 'trade',
                                    action: 'buy',
                                    weight: 0.4,
                                    generateParameters: () => ({
                                        symbol: this.selectRandomSymbol(),
                                        quantity: Math.floor(Math.random() * 100) + 1,
                                        price: null // Market price
                                    })
                                },
                                {
                                    type: 'trade',
                                    action: 'sell',
                                    weight: 0.4,
                                    generateParameters: () => ({
                                        symbol: this.selectRandomSymbol(),
                                        quantity: Math.floor(Math.random() * 100) + 1,
                                        price: null // Market price
                                    })
                                },
                                {
                                    type: 'analysis',
                                    action: 'evaluate',
                                    weight: 0.2,
                                    generateParameters: () => ({
                                        symbol: this.selectRandomSymbol(),
                                        timeframe: '1h'
                                    })
                                }
                            ];
                        },
                        
                        selectRandomSymbol() {
                            const symbols = ['GOLD', 'OIL', 'WHEAT', 'STEEL', 'LITHIUM'];
                            return symbols[Math.floor(Math.random() * symbols.length)];
                        }
                    });
                }
            },
            
            async initializeMarketSimulators() {
                // Create simulators for market dynamics
                const markets = ['commodities', 'currencies', 'services'];
                
                for (const market of markets) {
                    this.marketSimulators.set(market, {
                        market,
                        volatility: 0.1,
                        trendStrength: 0.05,
                        
                        async simulate() {
                            // Simulate market movements
                            const movements = [];
                            
                            const symbols = await this.getMarketSymbols();
                            
                            for (const symbol of symbols) {
                                const movement = this.generatePriceMovement(symbol);
                                if (movement) movements.push(movement);
                            }
                            
                            return movements;
                        },
                        
                        generatePriceMovement(symbol) {
                            // Generate realistic price movement
                            const direction = Math.random() < 0.5 ? -1 : 1;
                            const magnitude = Math.random() * this.volatility;
                            const change = direction * magnitude;
                            
                            return {
                                type: 'price_movement',
                                symbol,
                                change,
                                timestamp: Date.now(),
                                reason: 'autonomous_simulation'
                            };
                        },
                        
                        async getMarketSymbols() {
                            // Get symbols for this market
                            return ['GOLD', 'OIL', 'WHEAT', 'STEEL', 'LITHIUM'];
                        }
                    });
                }
            },
            
            async initializeEventGenerators() {
                // Create generators for random economic events
                this.eventGenerators.set('economic', {
                    frequency: 0.001, // 0.1% chance per cycle
                    
                    async generate() {
                        if (Math.random() > this.frequency) return null;
                        
                        const eventTypes = [
                            'resource_discovery',
                            'supply_disruption',
                            'demand_surge',
                            'policy_change',
                            'natural_disaster'
                        ];
                        
                        const type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
                        
                        return {
                            type: 'economic_event',
                            subtype: type,
                            magnitude: Math.random(),
                            affectedMarkets: this.selectAffectedMarkets(type),
                            duration: Math.floor(Math.random() * 3600000) + 300000, // 5 min to 1 hour
                            timestamp: Date.now()
                        };
                    },
                    
                    selectAffectedMarkets(eventType) {
                        const marketMappings = {
                            'resource_discovery': ['commodities'],
                            'supply_disruption': ['commodities', 'services'],
                            'demand_surge': ['commodities', 'currencies'],
                            'policy_change': ['currencies', 'services'],
                            'natural_disaster': ['commodities', 'currencies', 'services']
                        };
                        
                        return marketMappings[eventType] || ['commodities'];
                    }
                });
            },
            
            startAutonomousLoops() {
                // Agent simulation loop
                setInterval(async () => {
                    if (!this.isActive) return;
                    
                    try {
                        for (const [type, simulator] of this.agentSimulators) {
                            const actions = await simulator.simulate();
                            for (const action of actions) {
                                await this.parent.recordEvent({
                                    type: 'autonomous_agent_action',
                                    ...action
                                });
                                this.parent.metrics.autonomousActions++;
                            }
                        }
                    } catch (error) {
                        console.error('Agent simulation error:', error);
                    }
                }, 10000); // Every 10 seconds
                
                // Market simulation loop
                setInterval(async () => {
                    if (!this.isActive) return;
                    
                    try {
                        for (const [market, simulator] of this.marketSimulators) {
                            const movements = await simulator.simulate();
                            for (const movement of movements) {
                                await this.parent.recordEvent({
                                    type: 'autonomous_market_movement',
                                    ...movement
                                });
                            }
                        }
                    } catch (error) {
                        console.error('Market simulation error:', error);
                    }
                }, 5000); // Every 5 seconds
                
                // Event generation loop
                setInterval(async () => {
                    if (!this.isActive) return;
                    
                    try {
                        for (const [type, generator] of this.eventGenerators) {
                            const event = await generator.generate();
                            if (event) {
                                await this.parent.recordEvent({
                                    type: 'autonomous_economic_event',
                                    ...event
                                });
                            }
                        }
                    } catch (error) {
                        console.error('Event generation error:', error);
                    }
                }, 30000); // Every 30 seconds
            },
            
            cleanupAutonomousProcesses() {
                // Cleanup would be handled by process termination
            },
            
            parent: this
        };
    }
    
    async initializeCompressionEngine() {
        this.compressionEngine = {
            level: this.config.compressionLevel,
            
            async compress(data) {
                const zlib = require('zlib');
                const jsonString = JSON.stringify(data);
                
                return new Promise((resolve, reject) => {
                    zlib.gzip(jsonString, (error, compressed) => {
                        if (error) reject(error);
                        else resolve(compressed.toString('base64'));
                    });
                });
            },
            
            async decompress(compressedData) {
                const zlib = require('zlib');
                const buffer = Buffer.from(compressedData, 'base64');
                
                return new Promise((resolve, reject) => {
                    zlib.gunzip(buffer, (error, decompressed) => {
                        if (error) reject(error);
                        else {
                            try {
                                resolve(JSON.parse(decompressed.toString()));
                            } catch (parseError) {
                                reject(parseError);
                            }
                        }
                    });
                });
            }
        };
    }
    
    async initializeFailoverManager() {
        this.failoverManager = {
            backupNodes: new Set(),
            primaryNode: true,
            healthCheckInterval: 10000,
            
            async registerBackupNode(nodeId) {
                this.backupNodes.add(nodeId);
                console.log(`Backup node registered: ${nodeId}`);
            },
            
            async promoteToPrimary() {
                if (this.primaryNode) return;
                
                console.log('Promoting to primary node...');
                this.primaryNode = true;
                
                // Take over primary responsibilities
                await this.parent.autonomousEngine.start();
                
                this.parent.emit('promoted_to_primary');
            },
            
            async demoteToPrimary() {
                if (!this.primaryNode) return;
                
                console.log('Demoting to backup node...');
                this.primaryNode = false;
                
                // Stop primary responsibilities
                await this.parent.autonomousEngine.stop();
                
                this.parent.emit('demoted_to_backup');
            },
            
            startHealthChecks() {
                setInterval(async () => {
                    try {
                        await this.performHealthCheck();
                    } catch (error) {
                        console.error('Health check failed:', error);
                    }
                }, this.healthCheckInterval);
            },
            
            async performHealthCheck() {
                // Check system health and trigger failover if needed
                const health = {
                    memory: process.memoryUsage(),
                    cpu: process.cpuUsage(),
                    uptime: process.uptime(),
                    connections: this.parent.stateSharding ? 
                        this.parent.stateSharding.getShardingMetrics() : null
                };
                
                // Check for critical issues
                if (health.memory.heapUsed / health.memory.heapTotal > 0.9) {
                    console.warn('High memory usage detected');
                    this.parent.emit('health_warning', { type: 'memory', health });
                }
                
                return health;
            },
            
            parent: this
        };
        
        this.failoverManager.startHealthChecks();
    }
    
    setupMonitoring() {
        // Set up comprehensive monitoring
        setInterval(() => {
            const metrics = this.getMetrics();
            this.emit('metrics', metrics);
            
            // Log important metrics
            if (metrics.eventsRecorded > 0 || metrics.stateUpdates > 0) {
                console.log(`Persistence Metrics: ${metrics.eventsRecorded} events, ${metrics.stateUpdates} updates, ${metrics.snapshotsTaken} snapshots`);
            }
        }, 60000); // Every minute
    }
    
    setupHealthChecks() {
        // Set up health checks for critical components
        setInterval(async () => {
            try {
                await this.performSystemHealthCheck();
            } catch (error) {
                console.error('System health check failed:', error);
                this.emit('health_check_failed', error);
            }
        }, 30000); // Every 30 seconds
    }
    
    async performSystemHealthCheck() {
        const checks = {
            stateSharding: this.stateSharding ? 'healthy' : 'failed',
            eventRecorder: this.eventRecorder ? 'healthy' : 'failed',
            snapshotEngine: this.snapshotEngine ? 'healthy' : 'failed',
            autonomousEngine: this.autonomousEngine?.isActive ? 'active' : 'inactive',
            compressionEngine: this.compressionEngine ? 'healthy' : 'failed',
            failoverManager: this.failoverManager ? 'healthy' : 'failed'
        };
        
        const failedChecks = Object.entries(checks)
            .filter(([_, status]) => status === 'failed')
            .map(([component, _]) => component);
        
        if (failedChecks.length > 0) {
            this.emit('health_check_warning', { 
                failed: failedChecks, 
                all: checks 
            });
        }
        
        return checks;
    }
    
    // Public API methods
    async recordEvent(event) {
        return this.eventRecorder.record(event);
    }
    
    async takeSnapshot(entityId = 'global', options = {}) {
        return this.snapshotEngine.takeSnapshot(entityId, options);
    }
    
    async restoreSnapshot(snapshotId, options = {}) {
        return this.snapshotEngine.restoreSnapshot(snapshotId, options);
    }
    
    async updateState(entityId, updates, options = {}) {
        const version = this.incrementStateVersion(entityId);
        
        try {
            // Apply updates to current state
            let currentState = this.currentState.get(entityId) || {};
            currentState = { ...currentState, ...updates };
            
            this.currentState.set(entityId, currentState);
            this.stateVersions.set(entityId, version);
            
            // Record state update event
            await this.recordEvent({
                type: 'state_update',
                entityId,
                updates,
                version,
                priority: options.priority || 'normal'
            });
            
            // Persist to sharded storage
            if (options.persist !== false) {
                await this.stateSharding.set(
                    `state:${entityId}`,
                    currentState,
                    { replicate: true, persist: true }
                );
            }
            
            this.metrics.stateUpdates++;
            
            return {
                success: true,
                entityId,
                version,
                timestamp: Date.now()
            };
            
        } catch (error) {
            console.error(`Failed to update state for ${entityId}:`, error);
            throw error;
        }
    }
    
    async getCurrentState(entityId) {
        let state = this.currentState.get(entityId);
        
        if (!state) {
            // Try to load from persistent storage
            try {
                const result = await this.stateSharding.get(`state:${entityId}`);
                if (result?.value) {
                    state = result.value;
                    this.currentState.set(entityId, state);
                }
            } catch (error) {
                console.error(`Failed to load state for ${entityId}:`, error);
            }
        }
        
        return state || {};
    }
    
    async restoreState(entityId, state, version) {
        this.currentState.set(entityId, state);
        this.stateVersions.set(entityId, version);
        
        // Persist restored state
        await this.stateSharding.set(
            `state:${entityId}`,
            state,
            { replicate: true, persist: true }
        );
        
        await this.recordEvent({
            type: 'state_restored',
            entityId,
            version,
            priority: 'critical'
        });
    }
    
    getStateVersion(entityId) {
        return this.stateVersions.get(entityId) || 0;
    }
    
    incrementStateVersion(entityId) {
        const current = this.getStateVersion(entityId);
        const next = current + 1;
        this.stateVersions.set(entityId, next);
        return next;
    }
    
    calculateEventChecksum(event) {
        const data = JSON.stringify({
            type: event.type,
            entityId: event.entityId,
            data: event.data
        });
        return crypto.createHash('sha256').update(data).digest('hex').substring(0, 16);
    }
    
    async startAutonomousOperation() {
        if (this.autonomousEngine) {
            await this.autonomousEngine.start();
        }
    }
    
    async stopAutonomousOperation() {
        if (this.autonomousEngine) {
            await this.autonomousEngine.stop();
        }
    }
    
    getMetrics() {
        return {
            ...this.metrics,
            uptime: Date.now() - this.metrics.uptime,
            nodeId: this.config.nodeId,
            isRunning: this.isRunning,
            autonomousMode: this.autonomousMode,
            maintenanceMode: this.maintenanceMode,
            currentStateSize: this.currentState.size,
            eventBufferSize: this.eventRecorder?.buffer?.length || 0,
            shardingMetrics: this.stateSharding?.getShardingMetrics() || null
        };
    }
    
    async shutdown() {
        console.log('Shutting down Persistent State Manager...');
        
        this.isRunning = false;
        
        // Stop autonomous operation
        await this.stopAutonomousOperation();
        
        // Flush any pending events
        if (this.eventRecorder) {
            await this.eventRecorder.flush();
        }
        
        // Take final snapshot
        if (this.snapshotEngine) {
            await this.snapshotEngine.takeSnapshot('global', {
                metadata: { reason: 'shutdown' }
            });
        }
        
        // Shutdown state sharding
        if (this.stateSharding) {
            await this.stateSharding.shutdown();
        }
        
        console.log('Persistent State Manager shutdown complete');
    }
}

module.exports = PersistentStateManager;
/**
 * Phase 2 Scaling Infrastructure Orchestrator
 * Master orchestrator for 10,000+ agent scaling infrastructure
 * Built for Living Economy Arena - Agent Scaling Infrastructure
 */

const EventEmitter = require('events');
const { performance } = require('perf_hooks');

// Import all Phase 2 scaling components
const MassiveAgentCoordinator = require('./coordination/massive-agent-coordinator');
const CollectiveIntelligenceEngine = require('./distributed-intelligence/collective-intelligence-engine');
const PerformanceOptimizationEngine = require('./performance/performance-optimization-engine');
const IntelligentAutoScaler = require('./auto-scaling/intelligent-auto-scaler');

class Phase2ScalingOrchestrator extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            maxAgents: config.maxAgents || 50000,
            initialAgents: config.initialAgents || 1000,
            enableIntelligence: config.enableIntelligence !== false,
            enableOptimization: config.enableOptimization !== false,
            enableAutoScaling: config.enableAutoScaling !== false,
            integrationMode: config.integrationMode || 'full',
            healthCheckInterval: config.healthCheckInterval || 30000,
            metricsInterval: config.metricsInterval || 10000,
            ...config
        };
        
        // Core scaling infrastructure components
        this.agentCoordinator = null;
        this.intelligenceEngine = null;
        this.performanceEngine = null;
        this.autoScaler = null;
        
        // Integration state
        this.orchestrationState = {
            status: 'initializing',
            components: new Map(),
            integrations: new Map(),
            health: new Map(),
            metrics: new Map()
        };
        
        // Performance tracking
        this.metrics = {
            totalAgents: 0,
            activeClusters: 0,
            intelligenceNodes: 0,
            optimizationsApplied: 0,
            scalingEvents: 0,
            systemHealth: 0,
            overallPerformance: 0,
            integrationEfficiency: 0,
            resourceUtilization: 0
        };
        
        // Event coordination
        this.eventCoordinator = new EventCoordinator(this);
        this.healthMonitor = new HealthMonitor(this);
        this.metricsAggregator = new MetricsAggregator(this);
        this.integrationManager = new IntegrationManager(this);
        
        this.initializeOrchestrator();
    }
    
    async initializeOrchestrator() {
        try {
            console.log('🎭 Initializing Phase 2 Scaling Infrastructure Orchestrator...');
            
            // Initialize core components
            await this.initializeCoreComponents();
            
            // Setup component integrations
            await this.setupComponentIntegrations();
            
            // Start orchestration loops
            await this.startOrchestrationLoops();
            
            // Initialize monitoring and health checks
            await this.initializeMonitoring();
            
            this.orchestrationState.status = 'active';
            
            console.log('✅ Phase 2 Scaling Infrastructure Orchestrator initialized');
            console.log(`📊 Supporting up to ${this.config.maxAgents.toLocaleString()} agents`);
            
            this.emit('orchestrator-ready', {
                maxAgents: this.config.maxAgents,
                components: this.getActiveComponents(),
                integrations: this.getActiveIntegrations()
            });
            
        } catch (error) {
            console.error('❌ Orchestrator initialization failed:', error);
            this.orchestrationState.status = 'failed';
            this.emit('error', error);
        }
    }
    
    async initializeCoreComponents() {
        console.log('🔧 Initializing core scaling components...');
        
        // Initialize Agent Coordinator
        this.agentCoordinator = new MassiveAgentCoordinator({
            maxAgents: this.config.maxAgents,
            coordinationNodes: 16,
            hierarchyLevels: 5,
            clusterSize: 100,
            communicationMode: 'mesh',
            intelligenceLevel: 'enhanced'
        });
        
        await this.agentCoordinator.initializeCoordination();
        this.orchestrationState.components.set('agent-coordinator', {
            instance: this.agentCoordinator,
            status: 'active',
            health: 1.0
        });
        
        // Initialize Collective Intelligence Engine
        if (this.config.enableIntelligence) {
            this.intelligenceEngine = new CollectiveIntelligenceEngine({
                maxAgents: this.config.maxAgents,
                intelligenceTypes: ['analytical', 'creative', 'practical', 'emotional', 'social', 'systems'],
                learningModes: ['individual', 'collaborative', 'collective', 'emergent'],
                consensusMechanism: 'weighted-voting',
                emergentThreshold: 0.8
            });
            
            await this.intelligenceEngine.initializeCollectiveIntelligence();
            this.orchestrationState.components.set('intelligence-engine', {
                instance: this.intelligenceEngine,
                status: 'active',
                health: 1.0
            });
        }
        
        // Initialize Performance Optimization Engine
        if (this.config.enableOptimization) {
            this.performanceEngine = new PerformanceOptimizationEngine({
                maxAgents: this.config.maxAgents,
                optimizationInterval: 5000,
                performanceTargets: {
                    averageLatency: 10,
                    throughput: 10000,
                    resourceUtilization: 0.7,
                    errorRate: 0.001,
                    availability: 0.999
                },
                adaptiveThresholds: true,
                predictiveOptimization: true
            });
            
            await this.performanceEngine.initializeOptimizationEngine();
            this.orchestrationState.components.set('performance-engine', {
                instance: this.performanceEngine,
                status: 'active',
                health: 1.0
            });
        }
        
        // Initialize Intelligent Auto-Scaler
        if (this.config.enableAutoScaling) {
            this.autoScaler = new IntelligentAutoScaler({
                maxAgents: this.config.maxAgents,
                minAgents: 100,
                initialAgents: this.config.initialAgents,
                scaleUpThreshold: 0.8,
                scaleDownThreshold: 0.3,
                cooldownPeriod: 30000,
                predictiveWindow: 300000,
                adaptiveLearning: true,
                costOptimization: true
            });
            
            await this.autoScaler.initializeAutoScaler();
            this.orchestrationState.components.set('auto-scaler', {
                instance: this.autoScaler,
                status: 'active',
                health: 1.0
            });
        }
        
        console.log(`✅ Initialized ${this.orchestrationState.components.size} core components`);
    }
    
    async setupComponentIntegrations() {
        console.log('🔗 Setting up component integrations...');
        
        // Integration: Agent Coordinator <-> Intelligence Engine
        if (this.agentCoordinator && this.intelligenceEngine) {
            await this.setupCoordinatorIntelligenceIntegration();
        }
        
        // Integration: Performance Engine <-> Auto Scaler
        if (this.performanceEngine && this.autoScaler) {
            await this.setupPerformanceScalingIntegration();
        }
        
        // Integration: Intelligence Engine <-> Performance Engine
        if (this.intelligenceEngine && this.performanceEngine) {
            await this.setupIntelligencePerformanceIntegration();
        }
        
        // Integration: All components for cross-cutting concerns
        await this.setupCrossCuttingIntegrations();
        
        console.log(`✅ Setup ${this.orchestrationState.integrations.size} component integrations`);
    }
    
    async setupCoordinatorIntelligenceIntegration() {
        const integration = {
            name: 'coordinator-intelligence',
            components: ['agent-coordinator', 'intelligence-engine'],
            type: 'bidirectional',
            status: 'active'
        };
        
        // Agent Coordinator events -> Intelligence Engine
        this.agentCoordinator.on('agent-spawned', async (event) => {
            await this.intelligenceEngine.assignAgentToIntelligence(
                event.agentId,
                event.intelligence || 'analytical',
                event.capabilities || []
            );
        });
        
        this.agentCoordinator.on('task-coordinated', async (event) => {
            await this.intelligenceEngine.processCollectiveTask({
                id: event.taskId,
                agentCount: event.agentCount,
                complexity: 0.5,
                collaboration_level: 'high',
                analytical_reasoning: true,
                social_coordination: true
            });
        });
        
        // Intelligence Engine events -> Agent Coordinator
        this.intelligenceEngine.on('collective-task-completed', async (event) => {
            // Use collective insights to improve coordination
            await this.enhanceCoordinationWithIntelligence(event);
        });
        
        this.intelligenceEngine.on('agent-intelligence-assigned', async (event) => {
            // Update agent capabilities in coordinator
            await this.updateAgentCapabilities(event.agentId, event.nodeId);
        });
        
        this.orchestrationState.integrations.set('coordinator-intelligence', integration);
    }
    
    async setupPerformanceScalingIntegration() {
        const integration = {
            name: 'performance-scaling',
            components: ['performance-engine', 'auto-scaler'],
            type: 'bidirectional',
            status: 'active'
        };
        
        // Performance Engine events -> Auto Scaler
        this.performanceEngine.on('optimization-completed', async (event) => {
            // Use optimization insights for scaling decisions
            await this.informScalingWithOptimization(event);
        });
        
        // Auto Scaler events -> Performance Engine
        this.autoScaler.on('scaling-completed', async (event) => {
            // Trigger performance optimization after scaling
            await this.optimizeAfterScaling(event);
        });
        
        this.orchestrationState.integrations.set('performance-scaling', integration);
    }
    
    async setupIntelligencePerformanceIntegration() {
        const integration = {
            name: 'intelligence-performance',
            components: ['intelligence-engine', 'performance-engine'],
            type: 'collaborative',
            status: 'active'
        };
        
        // Use collective intelligence for performance optimization
        this.performanceEngine.on('optimization-cycle', async (event) => {
            await this.applyIntelligenceToOptimization(event);
        });
        
        // Use performance insights for intelligence enhancement
        this.intelligenceEngine.on('collective-processing', async (event) => {
            await this.enhanceIntelligenceWithPerformance(event);
        });
        
        this.orchestrationState.integrations.set('intelligence-performance', integration);
    }
    
    async setupCrossCuttingIntegrations() {
        // Setup event coordination across all components
        await this.eventCoordinator.initialize();
        
        // Setup health monitoring for all components
        await this.healthMonitor.initialize();
        
        // Setup metrics aggregation from all components
        await this.metricsAggregator.initialize();
        
        // Setup integration management
        await this.integrationManager.initialize();
    }
    
    async startOrchestrationLoops() {
        // Main orchestration loop
        setInterval(() => {
            this.runOrchestrationCycle();
        }, this.config.metricsInterval);
        
        // Health monitoring loop
        setInterval(() => {
            this.runHealthCheck();
        }, this.config.healthCheckInterval);
        
        // Integration monitoring loop
        setInterval(() => {
            this.monitorIntegrations();
        }, 60000); // Every minute
        
        console.log('🔄 Orchestration loops started');
    }
    
    async initializeMonitoring() {
        // Initialize all monitoring systems
        await Promise.all([
            this.healthMonitor.startMonitoring(),
            this.metricsAggregator.startAggregation(),
            this.integrationManager.startMonitoring()
        ]);
        
        console.log('📊 Monitoring systems initialized');
    }
    
    async runOrchestrationCycle() {
        try {
            const cycleStartTime = performance.now();
            
            // Aggregate metrics from all components
            await this.aggregateSystemMetrics();
            
            // Coordinate cross-component operations
            await this.coordinateCrossComponentOperations();
            
            // Optimize system-wide performance
            await this.optimizeSystemWidePerformance();
            
            // Update system health
            await this.updateSystemHealth();
            
            const cycleTime = performance.now() - cycleStartTime;
            this.metrics.orchestrationCycleTime = cycleTime;
            
        } catch (error) {
            console.error('❌ Orchestration cycle failed:', error);
        }
    }
    
    async aggregateSystemMetrics() {
        const componentMetrics = new Map();
        
        // Collect metrics from each component
        if (this.agentCoordinator) {
            componentMetrics.set('agent-coordinator', this.agentCoordinator.getSystemMetrics());
        }
        
        if (this.intelligenceEngine) {
            componentMetrics.set('intelligence-engine', this.intelligenceEngine.getCollectiveIntelligenceMetrics());
        }
        
        if (this.performanceEngine) {
            componentMetrics.set('performance-engine', this.performanceEngine.getOptimizationMetrics());
        }
        
        if (this.autoScaler) {
            componentMetrics.set('auto-scaler', this.autoScaler.getScalingMetrics());
        }
        
        // Aggregate into system-wide metrics
        await this.metricsAggregator.aggregateMetrics(componentMetrics);
        
        // Update orchestrator metrics
        this.updateOrchestratorMetrics(componentMetrics);
    }
    
    updateOrchestratorMetrics(componentMetrics) {
        // Total agents
        const coordinatorMetrics = componentMetrics.get('agent-coordinator');
        if (coordinatorMetrics) {
            this.metrics.totalAgents = coordinatorMetrics.agentMetrics?.total || 0;
            this.metrics.activeClusters = coordinatorMetrics.clusterMetrics?.total || 0;
        }
        
        // Intelligence nodes
        const intelligenceMetrics = componentMetrics.get('intelligence-engine');
        if (intelligenceMetrics) {
            this.metrics.intelligenceNodes = intelligenceMetrics.intelligenceNodes?.total || 0;
        }
        
        // Optimizations applied
        const performanceMetrics = componentMetrics.get('performance-engine');
        if (performanceMetrics) {
            this.metrics.optimizationsApplied = performanceMetrics.optimizationsApplied || 0;
        }
        
        // Scaling events
        const scalerMetrics = componentMetrics.get('auto-scaler');
        if (scalerMetrics) {
            this.metrics.scalingEvents = scalerMetrics.scalingEvents || 0;
        }
        
        // Calculate overall performance
        this.metrics.overallPerformance = this.calculateOverallPerformance(componentMetrics);
        this.metrics.integrationEfficiency = this.calculateIntegrationEfficiency();
    }
    
    calculateOverallPerformance(componentMetrics) {
        const performanceFactors = [];
        
        // Agent coordination performance
        const coordinatorMetrics = componentMetrics.get('agent-coordinator');
        if (coordinatorMetrics) {
            performanceFactors.push(coordinatorMetrics.systemHealth?.overallHealth || 0);
        }
        
        // Intelligence performance
        const intelligenceMetrics = componentMetrics.get('intelligence-engine');
        if (intelligenceMetrics) {
            performanceFactors.push(intelligenceMetrics.systemHealth?.overallHealth || 0);
        }
        
        // Optimization performance
        const performanceEngineMetrics = componentMetrics.get('performance-engine');
        if (performanceEngineMetrics) {
            performanceFactors.push(performanceEngineMetrics.systemHealth?.overallHealth || 0);
        }
        
        // Scaling performance
        const scalerMetrics = componentMetrics.get('auto-scaler');
        if (scalerMetrics) {
            performanceFactors.push(scalerMetrics.performanceAnalysis?.scalingEfficiency || 0);
        }
        
        return performanceFactors.length > 0 ? 
            performanceFactors.reduce((sum, factor) => sum + factor, 0) / performanceFactors.length : 0;
    }
    
    calculateIntegrationEfficiency() {
        let activeIntegrations = 0;
        let healthyIntegrations = 0;
        
        for (const integration of this.orchestrationState.integrations.values()) {
            activeIntegrations++;
            if (integration.status === 'active') {
                healthyIntegrations++;
            }
        }
        
        return activeIntegrations > 0 ? healthyIntegrations / activeIntegrations : 1;
    }
    
    async coordinateCrossComponentOperations() {
        // Coordinate operations that span multiple components
        
        // Example: Coordinate agent spawning with intelligence assignment and scaling
        if (this.shouldSpawnMoreAgents()) {
            await this.coordinateAgentSpawning();
        }
        
        // Example: Coordinate performance optimization with scaling decisions
        if (this.shouldOptimizeAndScale()) {
            await this.coordinateOptimizationAndScaling();
        }
        
        // Example: Coordinate intelligence enhancement with resource allocation
        if (this.shouldEnhanceIntelligence()) {
            await this.coordinateIntelligenceEnhancement();
        }
    }
    
    shouldSpawnMoreAgents() {
        return this.metrics.totalAgents < this.config.maxAgents * 0.8 &&
               this.metrics.overallPerformance > 0.8;
    }
    
    async coordinateAgentSpawning() {
        const targetAgents = Math.min(
            this.config.maxAgents,
            this.metrics.totalAgents + 100
        );
        
        // Spawn agents through coordinator
        const spawnPromises = [];
        for (let i = 0; i < 100; i++) {
            spawnPromises.push(this.agentCoordinator.spawnAgent({
                type: 'enhanced',
                intelligence: this.selectOptimalIntelligenceType(),
                capabilities: this.generateOptimalCapabilities()
            }));
        }
        
        await Promise.all(spawnPromises);
        
        // Update scaling target
        if (this.autoScaler) {
            await this.autoScaler.scaleToTarget(targetAgents, 'orchestrated-spawn');
        }
        
        console.log(`🚀 Coordinated spawning of 100 agents (total: ${targetAgents})`);
    }
    
    selectOptimalIntelligenceType() {
        const types = ['analytical', 'creative', 'practical', 'emotional', 'social', 'systems'];
        return types[Math.floor(Math.random() * types.length)];
    }
    
    generateOptimalCapabilities() {
        const capabilities = [
            'coordination', 'optimization', 'learning', 'communication',
            'analysis', 'creativity', 'problem-solving', 'decision-making'
        ];
        
        // Select 3-5 random capabilities
        const count = 3 + Math.floor(Math.random() * 3);
        const selected = [];
        
        for (let i = 0; i < count; i++) {
            const capability = capabilities[Math.floor(Math.random() * capabilities.length)];
            if (!selected.includes(capability)) {
                selected.push(capability);
            }
        }
        
        return selected;
    }
    
    shouldOptimizeAndScale() {
        return this.metrics.overallPerformance < 0.7 && this.metrics.totalAgents > 1000;
    }
    
    async coordinateOptimizationAndScaling() {
        console.log('⚡ Coordinating optimization and scaling...');
        
        // Get performance recommendations
        let performanceIssues = [];
        if (this.performanceEngine) {
            const perfMetrics = this.performanceEngine.getOptimizationMetrics();
            performanceIssues = perfMetrics.systemHealth?.bottlenecks || [];
        }
        
        // Get scaling recommendations
        let scalingRecommendations = [];
        if (this.autoScaler) {
            scalingRecommendations = await this.autoScaler.getScalingRecommendations();
        }
        
        // Coordinate actions
        if (performanceIssues.length > 0) {
            // Apply performance optimizations first
            console.log('🔧 Applying performance optimizations...');
            
            // Then consider scaling if needed
            const highPriorityScaling = scalingRecommendations.filter(r => r.urgency === 'high');
            if (highPriorityScaling.length > 0) {
                console.log('📈 Executing coordinated scaling...');
                
                for (const recommendation of highPriorityScaling) {
                    if (recommendation.type === 'scale_up') {
                        const currentAgents = this.metrics.totalAgents;
                        const targetAgents = Math.ceil(currentAgents * 1.2);
                        await this.autoScaler.scaleToTarget(targetAgents, 'performance-optimization');
                    }
                }
            }
        }
    }
    
    shouldEnhanceIntelligence() {
        return this.metrics.intelligenceNodes > 0 && 
               this.metrics.overallPerformance > 0.6 &&
               Math.random() > 0.9; // Occasional enhancement
    }
    
    async coordinateIntelligenceEnhancement() {
        console.log('🧠 Coordinating intelligence enhancement...');
        
        if (this.intelligenceEngine) {
            // Process a collective intelligence task to enhance capabilities
            await this.intelligenceEngine.processCollectiveTask({
                id: `enhancement-${Date.now()}`,
                description: 'System-wide intelligence enhancement',
                complexity: 0.8,
                collaboration_level: 'high',
                creative_solution: true,
                analytical_reasoning: true,
                social_coordination: true,
                innovation_needed: true,
                collective_behavior: true
            });
        }
    }
    
    async optimizeSystemWidePerformance() {
        // Apply system-wide optimizations that require cross-component coordination
        
        // Optimize resource allocation across components
        await this.optimizeResourceAllocation();
        
        // Balance load across all systems
        await this.balanceSystemLoad();
        
        // Optimize communication between components
        await this.optimizeCommunication();
    }
    
    async optimizeResourceAllocation() {
        // Analyze resource usage across all components
        const resourceUsage = new Map();
        
        for (const [name, component] of this.orchestrationState.components) {
            if (component.instance && component.instance.getSystemMetrics) {
                const metrics = component.instance.getSystemMetrics();
                resourceUsage.set(name, {
                    cpu: metrics.resourceUtilization || 0.5,
                    memory: metrics.memoryUsage || 0.4,
                    network: metrics.networkUtilization || 0.3
                });
            }
        }
        
        // Rebalance resources if needed
        const totalCpu = Array.from(resourceUsage.values()).reduce((sum, usage) => sum + usage.cpu, 0) / resourceUsage.size;
        
        if (totalCpu > 0.8) {
            console.log('⚖️ Rebalancing system resources due to high CPU usage');
            
            // Request resource optimization from performance engine
            if (this.performanceEngine) {
                // Trigger resource optimization
                await this.performanceEngine.runOptimizationCycle();
            }
        }
    }
    
    async balanceSystemLoad() {
        // Balance load across coordination clusters
        if (this.agentCoordinator && this.metrics.activeClusters > 5) {
            const coordinatorMetrics = this.agentCoordinator.getSystemMetrics();
            const loadDistribution = coordinatorMetrics.clusterMetrics?.loadDistribution || {};
            
            // Check for unbalanced clusters
            const loads = Object.values(loadDistribution);
            const maxLoad = Math.max(...loads);
            const minLoad = Math.min(...loads);
            
            if (maxLoad - minLoad > 0.4) {
                console.log('⚖️ Rebalancing cluster loads');
                await this.agentCoordinator.balanceClusterLoads();
            }
        }
    }
    
    async optimizeCommunication() {
        // Optimize communication efficiency between components
        if (this.metrics.integrationEfficiency < 0.8) {
            console.log('📡 Optimizing inter-component communication');
            
            // Reset integration connections
            await this.integrationManager.optimizeConnections();
        }
    }
    
    async updateSystemHealth() {
        const healthScores = new Map();
        
        // Collect health from all components
        for (const [name, component] of this.orchestrationState.components) {
            if (component.instance && component.instance.getSystemMetrics) {
                const metrics = component.instance.getSystemMetrics();
                healthScores.set(name, metrics.systemHealth?.overallHealth || 0.5);
            }
        }
        
        // Calculate overall system health
        const healthValues = Array.from(healthScores.values());
        this.metrics.systemHealth = healthValues.length > 0 ? 
            healthValues.reduce((sum, health) => sum + health, 0) / healthValues.length : 0;
        
        // Update component health in orchestration state
        for (const [name, health] of healthScores) {
            const component = this.orchestrationState.components.get(name);
            if (component) {
                component.health = health;
            }
        }
    }
    
    async runHealthCheck() {
        try {
            const healthReport = await this.healthMonitor.checkSystemHealth();
            
            if (healthReport.criticalIssues.length > 0) {
                console.warn(`⚠️ System health issues detected: ${healthReport.criticalIssues.length} critical`);
                await this.handleHealthIssues(healthReport.criticalIssues);
            }
            
            // Update orchestration status based on health
            if (healthReport.overallHealth < 0.5) {
                this.orchestrationState.status = 'degraded';
            } else if (healthReport.overallHealth > 0.8) {
                this.orchestrationState.status = 'optimal';
            } else {
                this.orchestrationState.status = 'active';
            }
            
        } catch (error) {
            console.error('❌ Health check failed:', error);
        }
    }
    
    async handleHealthIssues(issues) {
        for (const issue of issues) {
            console.log(`🚨 Handling health issue: ${issue.component} - ${issue.type}`);
            
            try {
                switch (issue.type) {
                    case 'high-latency':
                        if (this.performanceEngine) {
                            await this.performanceEngine.runOptimizationCycle();
                        }
                        break;
                    case 'resource-exhaustion':
                        if (this.autoScaler) {
                            const currentAgents = this.metrics.totalAgents;
                            await this.autoScaler.scaleToTarget(Math.ceil(currentAgents * 1.2), 'health-issue');
                        }
                        break;
                    case 'coordination-failure':
                        if (this.agentCoordinator) {
                            await this.agentCoordinator.optimizeNetworkTopology();
                        }
                        break;
                    case 'intelligence-degradation':
                        if (this.intelligenceEngine) {
                            await this.coordinateIntelligenceEnhancement();
                        }
                        break;
                }
            } catch (error) {
                console.error(`❌ Failed to handle health issue ${issue.type}:`, error);
            }
        }
    }
    
    async monitorIntegrations() {
        for (const [name, integration] of this.orchestrationState.integrations) {
            try {
                const health = await this.integrationManager.checkIntegrationHealth(name);
                integration.health = health;
                
                if (health < 0.5) {
                    console.warn(`⚠️ Integration health issue: ${name} (${(health * 100).toFixed(1)}%)`);
                    await this.integrationManager.repairIntegration(name);
                }
            } catch (error) {
                console.error(`❌ Integration monitoring failed for ${name}:`, error);
                integration.status = 'error';
            }
        }
    }
    
    // Enhanced integration methods
    async enhanceCoordinationWithIntelligence(event) {
        // Use collective intelligence insights to improve agent coordination
        if (event.insights && event.insights.length > 0) {
            console.log('🧠 Enhancing coordination with collective intelligence insights');
            
            for (const insight of event.insights) {
                if (insight.insight.includes('coordination')) {
                    // Apply coordination improvements
                    await this.agentCoordinator.optimizeNetworkTopology();
                }
            }
        }
    }
    
    async updateAgentCapabilities(agentId, intelligenceNodeId) {
        // Update agent capabilities based on intelligence assignment
        console.log(`🔄 Updating agent ${agentId} capabilities for intelligence node ${intelligenceNodeId}`);
    }
    
    async informScalingWithOptimization(event) {
        // Use performance optimization results to inform scaling decisions
        if (event.actualImpact > 0.2 && this.autoScaler) {
            console.log('📈 Performance optimization suggests scaling opportunity');
        }
    }
    
    async optimizeAfterScaling(event) {
        // Trigger performance optimization after scaling events
        if (event.action === 'scale_up' && this.performanceEngine) {
            console.log('⚡ Optimizing performance after scale-up event');
            setTimeout(() => {
                this.performanceEngine.runAdvancedOptimizationCycle();
            }, 5000); // Allow time for scaling to complete
        }
    }
    
    async applyIntelligenceToOptimization(event) {
        // Use collective intelligence to enhance performance optimization
        if (this.intelligenceEngine) {
            // Process optimization challenges as collective intelligence tasks
            await this.intelligenceEngine.processCollectiveTask({
                id: `optimization-${Date.now()}`,
                description: 'Performance optimization challenge',
                optimization_needed: true,
                analytical_reasoning: true,
                pattern_detection: true,
                complexity: 0.7
            });
        }
    }
    
    async enhanceIntelligenceWithPerformance(event) {
        // Use performance insights to enhance collective intelligence
        console.log('📊 Enhancing intelligence with performance insights');
    }
    
    // Public API methods
    async spawnAgents(count, options = {}) {
        if (!this.agentCoordinator) {
            throw new Error('Agent coordinator not available');
        }
        
        const results = [];
        const spawnPromises = [];
        
        for (let i = 0; i < count; i++) {
            spawnPromises.push(this.agentCoordinator.spawnAgent({
                type: options.type || 'enhanced',
                intelligence: options.intelligence || this.selectOptimalIntelligenceType(),
                capabilities: options.capabilities || this.generateOptimalCapabilities()
            }));
        }
        
        const spawnResults = await Promise.all(spawnPromises);
        results.push(...spawnResults);
        
        // Update auto-scaler if enabled
        if (this.autoScaler) {
            const newTarget = this.metrics.totalAgents + count;
            await this.autoScaler.scaleToTarget(newTarget, 'manual-spawn');
        }
        
        return {
            success: true,
            spawnedAgents: count,
            totalAgents: this.metrics.totalAgents + count,
            results
        };
    }
    
    async orchestrateTask(taskConfig) {
        if (!this.agentCoordinator) {
            throw new Error('Agent coordinator not available');
        }
        
        let result = await this.agentCoordinator.coordinateTask(taskConfig);
        
        // Enhance with collective intelligence if available
        if (this.intelligenceEngine && taskConfig.useIntelligence !== false) {
            const intelligenceResult = await this.intelligenceEngine.processCollectiveTask({
                ...taskConfig,
                collaboration_level: 'high',
                analytical_reasoning: true
            });
            
            result.intelligenceEnhancement = intelligenceResult;
        }
        
        return result;
    }
    
    async scaleSystem(targetAgents, reason = 'manual') {
        if (!this.autoScaler) {
            throw new Error('Auto-scaler not available');
        }
        
        return await this.autoScaler.scaleToTarget(targetAgents, reason);
    }
    
    async optimizePerformance(options = {}) {
        if (!this.performanceEngine) {
            throw new Error('Performance engine not available');
        }
        
        if (options.advanced) {
            await this.performanceEngine.runAdvancedOptimizationCycle();
        } else {
            await this.performanceEngine.runOptimizationCycle();
        }
        
        return this.performanceEngine.getOptimizationMetrics();
    }
    
    getActiveComponents() {
        return Array.from(this.orchestrationState.components.keys());
    }
    
    getActiveIntegrations() {
        return Array.from(this.orchestrationState.integrations.keys());
    }
    
    getSystemMetrics() {
        return {
            ...this.metrics,
            timestamp: Date.now(),
            
            // Orchestration state
            orchestrationState: {
                status: this.orchestrationState.status,
                activeComponents: this.getActiveComponents().length,
                activeIntegrations: this.getActiveIntegrations().length,
                systemHealth: this.metrics.systemHealth
            },
            
            // Component health
            componentHealth: Object.fromEntries(
                Array.from(this.orchestrationState.components.entries()).map(([name, comp]) => [
                    name, { status: comp.status, health: comp.health }
                ])
            ),
            
            // Integration status
            integrationStatus: Object.fromEntries(
                Array.from(this.orchestrationState.integrations.entries()).map(([name, integ]) => [
                    name, { status: integ.status, health: integ.health || 1.0 }
                ])
            ),
            
            // Capacity information
            capacity: {
                maxAgents: this.config.maxAgents,
                currentAgents: this.metrics.totalAgents,
                utilizationPercentage: (this.metrics.totalAgents / this.config.maxAgents) * 100,
                availableCapacity: this.config.maxAgents - this.metrics.totalAgents
            }
        };
    }
    
    async shutdown() {
        console.log('🛑 Shutting down Phase 2 Scaling Infrastructure Orchestrator...');
        
        this.orchestrationState.status = 'shutting-down';
        
        // Stop monitoring loops
        clearInterval(this.orchestrationTimer);
        clearInterval(this.healthTimer);
        clearInterval(this.integrationTimer);
        
        // Shutdown components in reverse order
        const shutdownPromises = [];
        
        if (this.autoScaler) {
            shutdownPromises.push(this.autoScaler.shutdown());
        }
        
        if (this.performanceEngine) {
            shutdownPromises.push(this.performanceEngine.shutdown());
        }
        
        if (this.intelligenceEngine) {
            shutdownPromises.push(this.intelligenceEngine.shutdown());
        }
        
        if (this.agentCoordinator) {
            shutdownPromises.push(this.agentCoordinator.shutdown());
        }
        
        await Promise.all(shutdownPromises);
        
        // Shutdown support systems
        await Promise.all([
            this.eventCoordinator.shutdown(),
            this.healthMonitor.shutdown(),
            this.metricsAggregator.shutdown(),
            this.integrationManager.shutdown()
        ]);
        
        this.orchestrationState.status = 'shutdown';
        
        console.log('✅ Phase 2 Scaling Infrastructure Orchestrator shutdown complete');
    }
}

// Supporting classes for orchestration
class EventCoordinator {
    constructor(orchestrator) {
        this.orchestrator = orchestrator;
        this.eventQueue = [];
        this.eventHandlers = new Map();
    }
    
    async initialize() {
        console.log('📡 Event Coordinator initialized');
    }
    
    async shutdown() {
        this.eventQueue = [];
        this.eventHandlers.clear();
    }
}

class HealthMonitor {
    constructor(orchestrator) {
        this.orchestrator = orchestrator;
        this.healthHistory = [];
    }
    
    async initialize() {
        console.log('🏥 Health Monitor initialized');
    }
    
    async startMonitoring() {
        console.log('🔍 Health monitoring started');
    }
    
    async checkSystemHealth() {
        const issues = [];
        const healthScores = [];
        
        // Check each component's health
        for (const [name, component] of this.orchestrator.orchestrationState.components) {
            const health = component.health || 0.5;
            healthScores.push(health);
            
            if (health < 0.3) {
                issues.push({
                    component: name,
                    type: 'component-failure',
                    severity: 'critical',
                    health
                });
            } else if (health < 0.6) {
                issues.push({
                    component: name,
                    type: 'performance-degradation',
                    severity: 'warning',
                    health
                });
            }
        }
        
        const overallHealth = healthScores.length > 0 ? 
            healthScores.reduce((sum, h) => sum + h, 0) / healthScores.length : 0;
        
        return {
            overallHealth,
            criticalIssues: issues.filter(i => i.severity === 'critical'),
            warnings: issues.filter(i => i.severity === 'warning'),
            componentCount: this.orchestrator.orchestrationState.components.size,
            timestamp: Date.now()
        };
    }
    
    async shutdown() {
        this.healthHistory = [];
    }
}

class MetricsAggregator {
    constructor(orchestrator) {
        this.orchestrator = orchestrator;
        this.aggregatedMetrics = new Map();
    }
    
    async initialize() {
        console.log('📊 Metrics Aggregator initialized');
    }
    
    async startAggregation() {
        console.log('📈 Metrics aggregation started');
    }
    
    async aggregateMetrics(componentMetrics) {
        const aggregated = {
            timestamp: Date.now(),
            totalAgents: 0,
            totalClusters: 0,
            totalIntelligenceNodes: 0,
            averageLatency: 0,
            totalThroughput: 0,
            averageResourceUtilization: 0,
            systemWideHealth: 0
        };
        
        let componentCount = 0;
        
        for (const [componentName, metrics] of componentMetrics) {
            componentCount++;
            
            // Aggregate specific metrics based on component type
            if (componentName === 'agent-coordinator') {
                aggregated.totalAgents += metrics.agentMetrics?.total || 0;
                aggregated.totalClusters += metrics.clusterMetrics?.total || 0;
            }
            
            if (componentName === 'intelligence-engine') {
                aggregated.totalIntelligenceNodes += metrics.intelligenceNodes?.total || 0;
            }
            
            // Add to averages
            aggregated.averageLatency += metrics.currentLatency || 0;
            aggregated.totalThroughput += metrics.currentThroughput || 0;
            aggregated.averageResourceUtilization += metrics.currentResourceUtilization || 0;
            aggregated.systemWideHealth += metrics.systemHealth?.overallHealth || 0;
        }
        
        // Calculate averages
        if (componentCount > 0) {
            aggregated.averageLatency /= componentCount;
            aggregated.averageResourceUtilization /= componentCount;
            aggregated.systemWideHealth /= componentCount;
        }
        
        this.aggregatedMetrics.set('latest', aggregated);
        
        return aggregated;
    }
    
    async shutdown() {
        this.aggregatedMetrics.clear();
    }
}

class IntegrationManager {
    constructor(orchestrator) {
        this.orchestrator = orchestrator;
        this.integrationHealth = new Map();
    }
    
    async initialize() {
        console.log('🔗 Integration Manager initialized');
    }
    
    async startMonitoring() {
        console.log('🔍 Integration monitoring started');
    }
    
    async checkIntegrationHealth(integrationName) {
        // Simulate integration health check
        const baseHealth = 0.8 + Math.random() * 0.2;
        this.integrationHealth.set(integrationName, baseHealth);
        return baseHealth;
    }
    
    async repairIntegration(integrationName) {
        console.log(`🔧 Repairing integration: ${integrationName}`);
        
        // Simulate integration repair
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const integration = this.orchestrator.orchestrationState.integrations.get(integrationName);
        if (integration) {
            integration.status = 'active';
            integration.health = 0.9 + Math.random() * 0.1;
        }
    }
    
    async optimizeConnections() {
        console.log('📡 Optimizing integration connections');
        
        // Reset and optimize all integration connections
        for (const [name, integration] of this.orchestrator.orchestrationState.integrations) {
            if (integration.status === 'active') {
                integration.health = Math.min(1.0, (integration.health || 0.5) + 0.1);
            }
        }
    }
    
    async shutdown() {
        this.integrationHealth.clear();
    }
}

module.exports = Phase2ScalingOrchestrator;
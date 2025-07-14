/**
 * Main Integration for Living Economy Arena Infrastructure
 * Orchestrates all technical components for 100,000+ connections with <50ms latency
 */

const HighPerformanceWebSocketServer = require('./websocket/websocket-server');
const WebGPUAccelerator = require('./webgpu/gpu-accelerator');
const WASMEconomicEngine = require('./wasm/economic-engine');
const StateShardingSystem = require('./scaling/state-sharding');
const GlobalCDNDistribution = require('./cdn/global-distribution');
const OverloadProtectionSystem = require('./rate-limiting/overload-protection');

const EventEmitter = require('events');

class LivingEconomyInfrastructure extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            maxConnections: config.maxConnections || 100000,
            targetLatency: config.targetLatency || 50, // milliseconds
            shardCount: config.shardCount || 16,
            replicationFactor: config.replicationFactor || 3,
            enableWebGPU: config.enableWebGPU !== false,
            enableWASM: config.enableWASM !== false,
            enableCDN: config.enableCDN !== false,
            enableRateLimiting: config.enableRateLimiting !== false,
            ...config
        };
        
        // Core infrastructure components
        this.webSocketServer = null;
        this.gpuAccelerator = null;
        this.wasmEngine = null;
        this.shardingSystem = null;
        this.cdnDistribution = null;
        this.overloadProtection = null;
        
        // Performance monitoring
        this.performanceMetrics = {
            connections: 0,
            latency: {
                avg: 0,
                p50: 0,
                p95: 0,
                p99: 0
            },
            throughput: {
                requestsPerSecond: 0,
                messagesPerSecond: 0,
                bytesPerSecond: 0
            },
            system: {
                cpu: 0,
                memory: 0,
                networkIO: 0
            },
            errors: {
                rate: 0,
                count: 0
            }
        };
        
        this.isInitialized = false;
        this.isRunning = false;
        
        // Performance tracking
        this.latencyBuffer = [];
        this.throughputBuffer = [];
        this.errorBuffer = [];
        
        this.initializeInfrastructure();
    }

    async initializeInfrastructure() {
        console.log('🚀 Initializing Living Economy Arena Infrastructure...');
        console.log(`Target: ${this.config.maxConnections} connections with <${this.config.targetLatency}ms latency`);
        
        try {
            // Initialize components in dependency order
            await this.initializeWebGPU();
            await this.initializeWASM();
            await this.initializeSharding();
            await this.initializeCDN();
            await this.initializeRateLimiting();
            await this.initializeWebSocketServer();
            
            // Setup cross-component integration
            this.setupComponentIntegration();
            
            // Start performance monitoring
            this.startPerformanceMonitoring();
            
            this.isInitialized = true;
            
            console.log('✅ Infrastructure initialization complete!');
            this.emit('ready', this.getSystemStatus());
            
        } catch (error) {
            console.error('❌ Infrastructure initialization failed:', error);
            this.emit('error', error);
            throw error;
        }
    }

    async initializeWebGPU() {
        if (!this.config.enableWebGPU) {
            console.log('⏭️ WebGPU acceleration disabled');
            return;
        }
        
        console.log('🔧 Initializing WebGPU acceleration...');
        this.gpuAccelerator = new WebGPUAccelerator();
        
        // Wait for WebGPU initialization
        const initialized = await this.gpuAccelerator.initializeWebGPU();
        if (initialized) {
            console.log('✅ WebGPU acceleration ready');
        } else {
            console.log('⚠️ WebGPU not available, using CPU fallback');
        }
    }

    async initializeWASM() {
        if (!this.config.enableWASM) {
            console.log('⏭️ WASM economic engine disabled');
            return;
        }
        
        console.log('🔧 Initializing WASM economic engine...');
        this.wasmEngine = new WASMEconomicEngine();
        
        const initialized = await this.wasmEngine.initializeWASM();
        if (initialized) {
            console.log('✅ WASM economic engine ready');
        } else {
            console.log('⚠️ WASM not available, using JavaScript fallback');
        }
    }

    async initializeSharding() {
        console.log('🔧 Initializing state sharding system...');
        this.shardingSystem = new StateShardingSystem({
            totalShards: this.config.shardCount,
            replicationFactor: this.config.replicationFactor,
            consistencyLevel: 'eventual'
        });
        
        await new Promise((resolve) => {
            this.shardingSystem.once('ready', resolve);
        });
        
        console.log('✅ State sharding system ready');
    }

    async initializeCDN() {
        if (!this.config.enableCDN) {
            console.log('⏭️ CDN distribution disabled');
            return;
        }
        
        console.log('🔧 Initializing global CDN distribution...');
        this.cdnDistribution = new GlobalCDNDistribution({
            maxCacheSize: 2 * 1024 * 1024 * 1024, // 2GB per edge
            compressionLevel: 6,
            pushEnabled: true
        });
        
        await new Promise((resolve) => {
            this.cdnDistribution.once('ready', resolve);
        });
        
        console.log('✅ Global CDN distribution ready');
    }

    async initializeRateLimiting() {
        if (!this.config.enableRateLimiting) {
            console.log('⏭️ Rate limiting disabled');
            return;
        }
        
        console.log('🔧 Initializing overload protection...');
        this.overloadProtection = new OverloadProtectionSystem({
            maxConnections: this.config.maxConnections,
            maxRequestsPerSecond: this.config.maxConnections * 10, // 10 requests per connection per second
            adaptiveScaling: true,
            ddosProtection: true,
            gracefulDegradation: true
        });
        
        await new Promise((resolve) => {
            this.overloadProtection.once('ready', resolve);
        });
        
        console.log('✅ Overload protection ready');
    }

    async initializeWebSocketServer() {
        console.log('🔧 Initializing high-performance WebSocket server...');
        this.webSocketServer = new HighPerformanceWebSocketServer();
        
        // Configure WebSocket server with other components
        this.webSocketServer.gpuAccelerator = this.gpuAccelerator;
        this.webSocketServer.wasmEngine = this.wasmEngine;
        this.webSocketServer.shardingSystem = this.shardingSystem;
        this.webSocketServer.cdnDistribution = this.cdnDistribution;
        this.webSocketServer.overloadProtection = this.overloadProtection;
        
        console.log('✅ WebSocket server ready');
    }

    setupComponentIntegration() {
        console.log('🔧 Setting up component integration...');
        
        // WebSocket <-> Sharding integration
        if (this.webSocketServer && this.shardingSystem) {
            this.webSocketServer.on('agent_state_update', async (data) => {
                await this.shardingSystem.set(`agent:${data.agentId}`, data.state);
            });
            
            this.webSocketServer.on('transaction', async (data) => {
                await this.shardingSystem.set(`transaction:${data.id}`, data);
            });
        }
        
        // WebSocket <-> CDN integration
        if (this.webSocketServer && this.cdnDistribution) {
            this.webSocketServer.on('market_data_update', async (data) => {
                await this.cdnDistribution.distribute('market_data', data, {
                    strategy: 'push_all',
                    compress: true
                });
            });
            
            this.webSocketServer.on('price_update', async (data) => {
                await this.cdnDistribution.distribute('market_prices', data, {
                    strategy: 'push_all',
                    compress: true,
                    ttl: 5000 // 5 second TTL for price data
                });
            });
        }
        
        // WebSocket <-> Rate Limiting integration
        if (this.webSocketServer && this.overloadProtection) {
            this.webSocketServer.processRequest = async (request, context) => {
                return await this.overloadProtection.processRequest(request, context);
            };
        }
        
        // GPU <-> WASM integration for economic calculations
        if (this.gpuAccelerator && this.wasmEngine) {
            this.setupComputationPipeline();
        }
        
        // Performance metrics integration
        this.setupPerformanceIntegration();
        
        console.log('✅ Component integration complete');
    }

    setupComputationPipeline() {
        // Create hybrid GPU/WASM computation pipeline
        this.computationPipeline = {
            async processEconomicSimulation(agents, marketData, steps) {
                // Try GPU first for large datasets
                if (agents.length > 1000) {
                    try {
                        return await this.gpuAccelerator.runEconomicSimulation(agents, marketData, steps);
                    } catch (error) {
                        console.warn('GPU simulation failed, falling back to WASM:', error);
                    }
                }
                
                // Fall back to WASM
                return await this.wasmEngine.simulateEconomicGrowth(
                    { agents, marketData },
                    { simulationSteps: steps },
                    steps
                );
            },
            
            async optimizeResourceAllocation(resources, demands, constraints) {
                // Try GPU for large optimization problems
                if (resources.length * demands.length > 10000) {
                    try {
                        return await this.gpuAccelerator.optimizeResourceAllocation(resources, demands, constraints);
                    } catch (error) {
                        console.warn('GPU optimization failed, falling back to WASM:', error);
                    }
                }
                
                // Fall back to WASM
                return await this.wasmEngine.optimizeResourceAllocation(resources, demands, [], constraints);
            },
            
            async calculateAgentDecisions(agentStates, environment) {
                // GPU is better for parallel agent decision making
                try {
                    return await this.gpuAccelerator.calculateAgentDecisions(agentStates, environment);
                } catch (error) {
                    console.warn('GPU decisions failed, falling back to WASM:', error);
                    return await this.wasmEngine.calculateAgentUtilities(agentStates, environment, []);
                }
            }
        };
        
        // Expose computation pipeline to WebSocket server
        if (this.webSocketServer) {
            this.webSocketServer.computationPipeline = this.computationPipeline;
        }
    }

    setupPerformanceIntegration() {
        // Collect metrics from all components
        if (this.webSocketServer) {
            this.webSocketServer.on('metrics_update', (metrics) => {
                this.updatePerformanceMetrics('websocket', metrics);
            });
        }
        
        if (this.shardingSystem) {
            this.shardingSystem.on('metrics_update', (metrics) => {
                this.updatePerformanceMetrics('sharding', metrics);
            });
        }
        
        if (this.cdnDistribution) {
            this.cdnDistribution.on('metrics_update', (metrics) => {
                this.updatePerformanceMetrics('cdn', metrics);
            });
        }
        
        if (this.overloadProtection) {
            this.overloadProtection.on('metrics_update', (metrics) => {
                this.updatePerformanceMetrics('rate_limiting', metrics);
            });
            
            this.overloadProtection.on('system_metrics', (metrics) => {
                this.performanceMetrics.system = metrics;
            });
        }
    }

    updatePerformanceMetrics(component, metrics) {
        // Update latency metrics
        if (metrics.latency !== undefined) {
            this.latencyBuffer.push(metrics.latency);
            if (this.latencyBuffer.length > 1000) {
                this.latencyBuffer.shift();
            }
            
            this.calculateLatencyPercentiles();
        }
        
        // Update throughput metrics
        if (metrics.requestsPerSecond !== undefined) {
            this.performanceMetrics.throughput.requestsPerSecond = metrics.requestsPerSecond;
        }
        
        if (metrics.messagesPerSecond !== undefined) {
            this.performanceMetrics.throughput.messagesPerSecond = metrics.messagesPerSecond;
        }
        
        // Update error metrics
        if (metrics.error !== undefined) {
            this.errorBuffer.push(Date.now());
            if (this.errorBuffer.length > 1000) {
                this.errorBuffer.shift();
            }
            
            this.calculateErrorRate();
        }
        
        // Emit aggregated metrics
        this.emit('performance_update', {
            component,
            metrics: this.performanceMetrics,
            timestamp: Date.now()
        });
    }

    calculateLatencyPercentiles() {
        if (this.latencyBuffer.length === 0) return;
        
        const sorted = [...this.latencyBuffer].sort((a, b) => a - b);
        const len = sorted.length;
        
        this.performanceMetrics.latency.avg = sorted.reduce((sum, val) => sum + val, 0) / len;
        this.performanceMetrics.latency.p50 = sorted[Math.floor(len * 0.5)];
        this.performanceMetrics.latency.p95 = sorted[Math.floor(len * 0.95)];
        this.performanceMetrics.latency.p99 = sorted[Math.floor(len * 0.99)];
    }

    calculateErrorRate() {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;
        
        const recentErrors = this.errorBuffer.filter(timestamp => timestamp > oneMinuteAgo);
        this.performanceMetrics.errors.rate = recentErrors.length / 60; // errors per second
        this.performanceMetrics.errors.count = this.errorBuffer.length;
    }

    startPerformanceMonitoring() {
        console.log('📊 Starting performance monitoring...');
        
        // Update performance metrics every second
        setInterval(() => {
            this.collectSystemMetrics();
            this.checkPerformanceTargets();
            this.emit('metrics_update', this.performanceMetrics);
        }, 1000);
        
        // Generate performance reports every minute
        setInterval(() => {
            this.generatePerformanceReport();
        }, 60000);
        
        // Auto-scaling decisions every 30 seconds
        setInterval(() => {
            this.evaluateAutoScaling();
        }, 30000);
    }

    collectSystemMetrics() {
        // Update connection count
        if (this.webSocketServer) {
            this.performanceMetrics.connections = this.webSocketServer.connectionCount || 0;
        }
        
        // Update sharding metrics
        if (this.shardingSystem) {
            const shardMetrics = this.shardingSystem.getShardingMetrics();
            this.performanceMetrics.sharding = shardMetrics;
        }
        
        // Update CDN metrics
        if (this.cdnDistribution) {
            const cdnMetrics = this.cdnDistribution.getGlobalMetrics();
            this.performanceMetrics.cdn = cdnMetrics;
        }
        
        // Update GPU metrics
        if (this.gpuAccelerator) {
            const gpuMetrics = this.gpuAccelerator.getPerformanceMetrics();
            this.performanceMetrics.gpu = gpuMetrics;
        }
        
        // Update WASM metrics
        if (this.wasmEngine) {
            const wasmMetrics = this.wasmEngine.getPerformanceMetrics();
            this.performanceMetrics.wasm = wasmMetrics;
        }
    }

    checkPerformanceTargets() {
        const alerts = [];
        
        // Check latency target
        if (this.performanceMetrics.latency.p95 > this.config.targetLatency) {
            alerts.push({
                type: 'latency_exceeded',
                message: `P95 latency ${this.performanceMetrics.latency.p95}ms exceeds target ${this.config.targetLatency}ms`,
                severity: 'warning'
            });
        }
        
        // Check connection capacity
        const connectionUtilization = this.performanceMetrics.connections / this.config.maxConnections;
        if (connectionUtilization > 0.9) {
            alerts.push({
                type: 'capacity_warning',
                message: `Connection utilization at ${(connectionUtilization * 100).toFixed(1)}%`,
                severity: connectionUtilization > 0.95 ? 'critical' : 'warning'
            });
        }
        
        // Check error rate
        if (this.performanceMetrics.errors.rate > 100) { // More than 100 errors per second
            alerts.push({
                type: 'high_error_rate',
                message: `Error rate: ${this.performanceMetrics.errors.rate.toFixed(1)} errors/sec`,
                severity: 'critical'
            });
        }
        
        // Emit alerts
        if (alerts.length > 0) {
            this.emit('performance_alerts', alerts);
        }
    }

    generatePerformanceReport() {
        const report = {
            timestamp: Date.now(),
            summary: {
                connections: this.performanceMetrics.connections,
                maxConnections: this.config.maxConnections,
                utilizationPercent: (this.performanceMetrics.connections / this.config.maxConnections * 100).toFixed(1),
                latencyP95: this.performanceMetrics.latency.p95,
                targetLatency: this.config.targetLatency,
                latencyCompliance: this.performanceMetrics.latency.p95 <= this.config.targetLatency,
                throughput: this.performanceMetrics.throughput,
                errorRate: this.performanceMetrics.errors.rate
            },
            components: {
                websocket: this.webSocketServer ? 'active' : 'disabled',
                gpu: this.gpuAccelerator ? (this.gpuAccelerator.isInitialized ? 'active' : 'fallback') : 'disabled',
                wasm: this.wasmEngine ? (this.wasmEngine.isInitialized ? 'active' : 'fallback') : 'disabled',
                sharding: this.shardingSystem ? 'active' : 'disabled',
                cdn: this.cdnDistribution ? 'active' : 'disabled',
                rateLimiting: this.overloadProtection ? 'active' : 'disabled'
            },
            performance: this.performanceMetrics
        };
        
        this.emit('performance_report', report);
        
        // Log summary
        console.log(`📊 Performance Report: ${report.summary.connections}/${report.summary.maxConnections} connections (${report.summary.utilizationPercent}%), P95 latency: ${report.summary.latencyP95}ms`);
    }

    evaluateAutoScaling() {
        const connectionUtilization = this.performanceMetrics.connections / this.config.maxConnections;
        const latencyCompliance = this.performanceMetrics.latency.p95 <= this.config.targetLatency;
        
        let scalingRecommendation = 'none';
        
        // Scale up if high utilization or latency issues
        if (connectionUtilization > 0.8 || !latencyCompliance) {
            scalingRecommendation = 'scale_up';
        }
        
        // Scale down if low utilization
        if (connectionUtilization < 0.3 && latencyCompliance) {
            scalingRecommendation = 'scale_down';
        }
        
        if (scalingRecommendation !== 'none') {
            this.emit('scaling_recommendation', {
                action: scalingRecommendation,
                reason: {
                    connectionUtilization,
                    latencyCompliance,
                    currentConnections: this.performanceMetrics.connections,
                    currentLatency: this.performanceMetrics.latency.p95
                },
                timestamp: Date.now()
            });
        }
    }

    // High-level API methods
    async processEconomicSimulation(agents, marketData, steps = 1000) {
        if (!this.computationPipeline) {
            throw new Error('Computation pipeline not initialized');
        }
        
        return await this.computationPipeline.processEconomicSimulation(agents, marketData, steps);
    }

    async optimizeResourceAllocation(resources, demands, constraints = {}) {
        if (!this.computationPipeline) {
            throw new Error('Computation pipeline not initialized');
        }
        
        return await this.computationPipeline.optimizeResourceAllocation(resources, demands, constraints);
    }

    async calculateAgentDecisions(agentStates, environment) {
        if (!this.computationPipeline) {
            throw new Error('Computation pipeline not initialized');
        }
        
        return await this.computationPipeline.calculateAgentDecisions(agentStates, environment);
    }

    async distributeMarketData(dataType, data, options = {}) {
        if (!this.cdnDistribution) {
            throw new Error('CDN distribution not available');
        }
        
        return await this.cdnDistribution.distribute(dataType, data, options);
    }

    async storeAgentState(agentId, state) {
        if (!this.shardingSystem) {
            throw new Error('Sharding system not available');
        }
        
        return await this.shardingSystem.set(`agent:${agentId}`, state);
    }

    async getAgentState(agentId) {
        if (!this.shardingSystem) {
            throw new Error('Sharding system not available');
        }
        
        return await this.shardingSystem.get(`agent:${agentId}`);
    }

    getSystemStatus() {
        return {
            initialized: this.isInitialized,
            running: this.isRunning,
            config: this.config,
            performance: this.performanceMetrics,
            components: {
                websocket: this.webSocketServer ? 'active' : 'inactive',
                gpu: this.gpuAccelerator ? (this.gpuAccelerator.isInitialized ? 'active' : 'fallback') : 'inactive',
                wasm: this.wasmEngine ? (this.wasmEngine.isInitialized ? 'active' : 'fallback') : 'inactive',
                sharding: this.shardingSystem ? 'active' : 'inactive',
                cdn: this.cdnDistribution ? 'active' : 'inactive',
                rateLimiting: this.overloadProtection ? 'active' : 'inactive'
            },
            targets: {
                maxConnections: this.config.maxConnections,
                targetLatency: this.config.targetLatency,
                currentCompliance: {
                    connections: this.performanceMetrics.connections <= this.config.maxConnections,
                    latency: this.performanceMetrics.latency.p95 <= this.config.targetLatency
                }
            },
            timestamp: Date.now()
        };
    }

    async start() {
        if (!this.isInitialized) {
            throw new Error('Infrastructure not initialized');
        }
        
        console.log('🚀 Starting Living Economy Arena Infrastructure...');
        
        // Start all components
        if (this.webSocketServer) {
            await this.webSocketServer.start?.();
        }
        
        this.isRunning = true;
        
        console.log('✅ Infrastructure is running!');
        console.log(`🌐 Ready for ${this.config.maxConnections} connections with <${this.config.targetLatency}ms latency`);
        
        this.emit('started', this.getSystemStatus());
    }

    async shutdown() {
        console.log('🛑 Shutting down Living Economy Arena Infrastructure...');
        
        this.isRunning = false;
        
        // Shutdown components in reverse order
        if (this.webSocketServer) {
            await this.webSocketServer.shutdown?.();
        }
        
        if (this.overloadProtection) {
            await this.overloadProtection.shutdown();
        }
        
        if (this.cdnDistribution) {
            await this.cdnDistribution.shutdown();
        }
        
        if (this.shardingSystem) {
            await this.shardingSystem.shutdown();
        }
        
        console.log('✅ Infrastructure shutdown complete');
        this.emit('shutdown');
    }
}

module.exports = LivingEconomyInfrastructure;
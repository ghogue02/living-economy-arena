/**
 * Ecosystem Integration Layer - Main Orchestrator
 * Coordinates all integration components for the Living Economy Arena
 */

const { UniversalAPIGateway } = require('./gateway/universal-api-gateway');
const { DataHarmonizationEngine } = require('./harmonization/data-harmonization-engine');
const { WorkflowAutomationEngine } = require('./automation/workflow-automation-engine');
const { SystemInteroperabilityFramework } = require('./interoperability/system-interoperability-framework');
const { EventDrivenArchitecture } = require('./events/event-driven-architecture');
const { IntegrationMonitoringAnalytics } = require('./monitoring/integration-monitoring-analytics');

class EcosystemIntegrationOrchestrator {
    constructor(config = {}) {
        this.config = {
            gateway: {
                port: 8080,
                rateLimitWindow: 15 * 60 * 1000,
                rateLimitMax: 1000,
                ...config.gateway
            },
            harmonization: {
                enableValidation: true,
                enableTransformation: true,
                enableCaching: true,
                cacheSize: 10000,
                ...config.harmonization
            },
            automation: {
                maxConcurrentWorkflows: 100,
                maxStepsPerWorkflow: 1000,
                defaultTimeout: 300000,
                enableParallelExecution: true,
                ...config.automation
            },
            interoperability: {
                messageTimeout: 30000,
                maxRetries: 3,
                enableServiceDiscovery: true,
                enableLoadBalancing: true,
                enableHealthChecking: true,
                ...config.interoperability
            },
            events: {
                maxEventHistory: 100000,
                retentionPeriod: 7 * 24 * 60 * 60 * 1000,
                enableEventSourcing: true,
                enableEventReplay: true,
                enableCorrelation: true,
                ...config.events
            },
            monitoring: {
                metricsRetention: 30 * 24 * 60 * 60 * 1000,
                enablePredictiveAnalytics: true,
                enableRealTimeAlerts: true,
                samplingRate: 1.0,
                ...config.monitoring
            },
            ...config
        };

        this.components = {};
        this.isInitialized = false;
        this.isRunning = false;
        
        this.statistics = {
            startTime: null,
            uptime: 0,
            totalRequests: 0,
            totalEvents: 0,
            totalWorkflows: 0,
            healthStatus: 'initializing'
        };
    }

    async initialize() {
        if (this.isInitialized) {
            throw new Error('Integration layer already initialized');
        }

        console.log('🚀 Initializing Ecosystem Integration Layer...');

        try {
            // Initialize monitoring first to track initialization
            console.log('📊 Initializing Monitoring & Analytics...');
            this.components.monitoring = new IntegrationMonitoringAnalytics(this.config.monitoring);
            
            // Initialize event system early for coordination
            console.log('📡 Initializing Event-Driven Architecture...');
            this.components.events = new EventDrivenArchitecture(this.config.events);
            
            // Initialize data harmonization
            console.log('🔄 Initializing Data Harmonization...');
            this.components.harmonization = new DataHarmonizationEngine(this.config.harmonization);
            
            // Initialize interoperability framework
            console.log('🌐 Initializing System Interoperability...');
            this.components.interoperability = new SystemInteroperabilityFramework(this.config.interoperability);
            
            // Initialize workflow automation
            console.log('⚙️ Initializing Workflow Automation...');
            this.components.automation = new WorkflowAutomationEngine(this.config.automation);
            
            // Initialize API gateway last
            console.log('🚪 Initializing Universal API Gateway...');
            this.components.gateway = new UniversalAPIGateway(this.config.gateway);

            // Setup inter-component communication
            this.setupComponentIntegration();
            
            // Setup monitoring for all components
            this.setupMonitoring();

            this.isInitialized = true;
            this.statistics.healthStatus = 'initialized';
            
            console.log('✅ Ecosystem Integration Layer initialized successfully');
            
            // Publish initialization event
            await this.components.events.publishEvent('system.integration_initialized', {
                timestamp: new Date().toISOString(),
                components: Object.keys(this.components),
                configuration: this.config
            });

        } catch (error) {
            this.statistics.healthStatus = 'initialization_failed';
            console.error('❌ Failed to initialize Ecosystem Integration Layer:', error);
            throw error;
        }
    }

    setupComponentIntegration() {
        // Gateway -> Events integration
        this.components.gateway.on('request', async (request) => {
            await this.components.events.publishEvent('gateway.request_received', {
                method: request.method,
                url: request.url,
                timestamp: Date.now()
            });
        });

        // Events -> Monitoring integration
        this.components.events.on('event_published', (event) => {
            this.components.monitoring.recordMetric('events.publish_rate', 1, {
                event_type: event.type,
                source: event.metadata.source
            });
        });

        // Automation -> Events integration
        this.components.automation.on('workflow_completed', async (result) => {
            await this.components.events.publishEvent('workflow.completed', {
                workflowId: result.workflow,
                duration: result.duration,
                success: result.success,
                timestamp: Date.now()
            });
        });

        // Interoperability -> Monitoring integration
        this.components.interoperability.on('message_sent', (data) => {
            this.components.monitoring.recordMetric('interop.message_throughput', 1, {
                service: data.serviceName,
                success: data.success
            });
        });

        // Harmonization -> Monitoring integration
        this.components.harmonization.on('data_harmonized', (data) => {
            this.components.monitoring.recordMetric('harmonization.transformation_latency', 
                data.duration, {
                    data_type: data.dataType,
                    format: data.targetFormat
                }
            );
        });

        console.log('🔗 Component integration configured');
    }

    setupMonitoring() {
        // Register standard dashboards
        this.components.monitoring.createDashboard('system_overview', {
            widgets: [
                {
                    id: 'gateway_requests',
                    type: 'metric',
                    metric: 'gateway.requests_per_second',
                    title: 'Gateway Requests/sec'
                },
                {
                    id: 'event_throughput',
                    type: 'metric',
                    metric: 'events.publish_rate',
                    title: 'Event Throughput'
                },
                {
                    id: 'workflow_success_rate',
                    type: 'metric',
                    metric: 'workflow.success_rate',
                    title: 'Workflow Success Rate'
                },
                {
                    id: 'system_health',
                    type: 'chart',
                    metric: 'system.cpu_usage',
                    title: 'System Health',
                    timeRange: 3600000
                }
            ],
            refreshInterval: 30000
        });

        // Setup automatic health reporting
        setInterval(() => {
            this.updateHealthMetrics();
        }, 30000);

        console.log('📈 Monitoring dashboards configured');
    }

    updateHealthMetrics() {
        // Record gateway metrics
        const gatewayMetrics = this.components.gateway.getMetrics();
        this.components.monitoring.recordMetric('gateway.requests_per_second', 
            gatewayMetrics.requests / 60); // Approximate RPS
        this.components.monitoring.recordMetric('gateway.active_connections', 
            gatewayMetrics.activeConnections);

        // Record event system metrics
        const eventStats = this.components.events.getStatistics();
        this.components.monitoring.recordMetric('events.total_events', eventStats.totalEvents);
        this.components.monitoring.recordMetric('events.active_subscribers', eventStats.activeSubscribers);

        // Record automation metrics
        const automationStats = this.components.automation.getStatistics();
        this.components.monitoring.recordMetric('workflow.total_executions', automationStats.totalExecutions);
        this.components.monitoring.recordMetric('workflow.success_rate', 
            automationStats.successfulExecutions / Math.max(automationStats.totalExecutions, 1));

        // Record interoperability metrics
        const interopStats = this.components.interoperability.getStatistics();
        this.components.monitoring.recordMetric('interop.active_services', interopStats.registeredServices);
        this.components.monitoring.recordMetric('interop.message_success_rate', 
            interopStats.successfulMessages / Math.max(interopStats.totalMessages, 1));

        // Update overall statistics
        this.statistics.uptime = Date.now() - (this.statistics.startTime || Date.now());
        this.statistics.totalRequests = gatewayMetrics.requests;
        this.statistics.totalEvents = eventStats.totalEvents;
        this.statistics.totalWorkflows = automationStats.totalExecutions;
    }

    async start() {
        if (!this.isInitialized) {
            await this.initialize();
        }

        if (this.isRunning) {
            throw new Error('Integration layer already running');
        }

        console.log('🔄 Starting Ecosystem Integration Layer...');

        try {
            this.statistics.startTime = Date.now();

            // Start API Gateway
            console.log('🚪 Starting Universal API Gateway...');
            await this.components.gateway.start();

            // Start monitoring
            console.log('📊 Starting monitoring systems...');
            this.startHealthMonitoring();

            this.isRunning = true;
            this.statistics.healthStatus = 'running';

            console.log('✅ Ecosystem Integration Layer started successfully');
            console.log(`🌐 Gateway listening on port ${this.config.gateway.port}`);

            // Publish start event
            await this.components.events.publishEvent('system.integration_started', {
                timestamp: new Date().toISOString(),
                port: this.config.gateway.port,
                components: Object.keys(this.components)
            });

        } catch (error) {
            this.statistics.healthStatus = 'start_failed';
            console.error('❌ Failed to start Ecosystem Integration Layer:', error);
            throw error;
        }
    }

    startHealthMonitoring() {
        // Periodic health checks
        setInterval(() => {
            this.performHealthCheck();
        }, 60000); // Every minute

        // Component status monitoring
        setInterval(() => {
            this.monitorComponentStatus();
        }, 30000); // Every 30 seconds
    }

    async performHealthCheck() {
        const healthResults = {};

        // Check each component
        for (const [name, component] of Object.entries(this.components)) {
            try {
                if (component.getStatistics) {
                    const stats = component.getStatistics();
                    healthResults[name] = {
                        status: 'healthy',
                        statistics: stats
                    };
                } else {
                    healthResults[name] = { status: 'healthy' };
                }
            } catch (error) {
                healthResults[name] = {
                    status: 'unhealthy',
                    error: error.message
                };
            }
        }

        // Update overall health
        const unhealthyComponents = Object.values(healthResults).filter(
            result => result.status === 'unhealthy'
        ).length;

        if (unhealthyComponents === 0) {
            this.statistics.healthStatus = 'healthy';
        } else if (unhealthyComponents < Object.keys(this.components).length / 2) {
            this.statistics.healthStatus = 'degraded';
        } else {
            this.statistics.healthStatus = 'unhealthy';
        }

        // Publish health event
        await this.components.events.publishEvent('system.health_check', {
            overallStatus: this.statistics.healthStatus,
            components: healthResults,
            timestamp: Date.now()
        });
    }

    monitorComponentStatus() {
        for (const [name, component] of Object.entries(this.components)) {
            if (component.on && !component._monitoringSetup) {
                // Setup error monitoring
                component.on('error', (error) => {
                    console.error(`Component ${name} error:`, error);
                    this.components.monitoring.recordMetric(`${name}.errors`, 1);
                });
                
                component._monitoringSetup = true;
            }
        }
    }

    async stop() {
        if (!this.isRunning) {
            return;
        }

        console.log('🛑 Stopping Ecosystem Integration Layer...');

        try {
            // Publish stop event
            if (this.components.events) {
                await this.components.events.publishEvent('system.integration_stopping', {
                    timestamp: new Date().toISOString(),
                    uptime: this.statistics.uptime
                });
            }

            // Stop components in reverse order
            if (this.components.gateway) {
                console.log('🚪 Stopping API Gateway...');
                // Gateway would have a stop method in a full implementation
            }

            if (this.components.interoperability) {
                console.log('🌐 Stopping Interoperability Framework...');
                this.components.interoperability.shutdown();
            }

            this.isRunning = false;
            this.statistics.healthStatus = 'stopped';

            console.log('✅ Ecosystem Integration Layer stopped successfully');

        } catch (error) {
            console.error('❌ Error stopping Ecosystem Integration Layer:', error);
            throw error;
        }
    }

    // Public API methods for external systems
    async processData(data, dataType, targetFormat = 'standard') {
        if (!this.isRunning) {
            throw new Error('Integration layer not running');
        }
        
        return await this.components.harmonization.harmonizeData(data, dataType, targetFormat);
    }

    async executeWorkflow(templateName, parameters = {}, options = {}) {
        if (!this.isRunning) {
            throw new Error('Integration layer not running');
        }
        
        const workflowId = await this.components.automation.createWorkflow(templateName, parameters, options);
        return await this.components.automation.executeWorkflow(workflowId);
    }

    async sendMessage(serviceName, message, options = {}) {
        if (!this.isRunning) {
            throw new Error('Integration layer not running');
        }
        
        return await this.components.interoperability.sendMessageWithCircuitBreaker(serviceName, message, options);
    }

    async publishEvent(eventType, payload, metadata = {}) {
        if (!this.isRunning) {
            throw new Error('Integration layer not running');
        }
        
        return await this.components.events.publishEvent(eventType, payload, metadata);
    }

    subscribeToEvents(eventType, handler, options = {}) {
        if (!this.isRunning) {
            throw new Error('Integration layer not running');
        }
        
        return this.components.events.subscribe(eventType, handler, options);
    }

    getSystemHealth() {
        return {
            status: this.statistics.healthStatus,
            uptime: this.statistics.uptime,
            components: Object.keys(this.components).reduce((acc, name) => {
                acc[name] = this.components[name].getStatistics ? 
                    this.components[name].getStatistics() : 
                    { status: 'unknown' };
                return acc;
            }, {}),
            statistics: this.statistics
        };
    }

    getMonitoringData(dashboardName) {
        return this.components.monitoring.getDashboardData(dashboardName);
    }

    generateReport(type, options = {}) {
        return this.components.monitoring.generateReport(type, options);
    }

    // Component access methods
    getGateway() { return this.components.gateway; }
    getHarmonization() { return this.components.harmonization; }
    getAutomation() { return this.components.automation; }
    getInteroperability() { return this.components.interoperability; }
    getEvents() { return this.components.events; }
    getMonitoring() { return this.components.monitoring; }
}

module.exports = { EcosystemIntegrationOrchestrator };
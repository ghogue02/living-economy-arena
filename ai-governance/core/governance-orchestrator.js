/**
 * AI Governance Orchestrator
 * Core coordination system for all governance operations
 */

const EventEmitter = require('events');

class AIGovernanceOrchestrator extends EventEmitter {
    constructor(config = {}) {
        super();
        this.config = config;
        this.startTime = null;
        this.subsystemRegistry = new Map();
        this.messageQueue = [];
        this.processingQueue = false;
        this.healthChecks = new Map();
        
        // Performance metrics
        this.metrics = {
            totalRequests: 0,
            successfulRequests: 0,
            failedRequests: 0,
            averageResponseTime: 0,
            queueLength: 0,
            activeSubsystems: 0
        };
    }

    /**
     * Initialize the orchestrator
     */
    async initialize() {
        this.startTime = Date.now();
        console.log('🎯 Initializing AI Governance Orchestrator...');
        
        // Set up health monitoring
        this.setupHealthMonitoring();
        
        // Start message processing
        this.startMessageProcessing();
        
        console.log('✅ Governance Orchestrator initialized');
        return true;
    }

    /**
     * Register a subsystem with the orchestrator
     */
    registerSubsystem(name, subsystem) {
        this.subsystemRegistry.set(name, {
            instance: subsystem,
            status: 'registered',
            lastHealthCheck: Date.now(),
            requestCount: 0,
            errorCount: 0
        });
        
        console.log(`📝 Registered subsystem: ${name}`);
        this.metrics.activeSubsystems = this.subsystemRegistry.size;
        
        // Set up subsystem event listeners
        this.setupSubsystemListeners(name, subsystem);
    }

    /**
     * Set up event listeners for a subsystem
     */
    setupSubsystemListeners(name, subsystem) {
        subsystem.on('request', (data) => {
            this.handleSubsystemRequest(name, data);
        });
        
        subsystem.on('error', (error) => {
            this.handleSubsystemError(name, error);
        });
        
        subsystem.on('status', (status) => {
            this.updateSubsystemStatus(name, status);
        });
    }

    /**
     * Route a governance request to appropriate subsystems
     */
    async routeRequest(requestType, data) {
        const requestId = this.generateRequestId();
        const startTime = Date.now();
        
        try {
            this.metrics.totalRequests++;
            
            // Add to processing queue
            await this.queueMessage({
                id: requestId,
                type: requestType,
                data,
                timestamp: Date.now()
            });
            
            // Determine target subsystems
            const targetSubsystems = this.determineTargetSubsystems(requestType);
            
            // Process request through subsystems
            const results = await this.processRequest(requestId, requestType, data, targetSubsystems);
            
            // Update metrics
            this.metrics.successfulRequests++;
            this.updateAverageResponseTime(Date.now() - startTime);
            
            return {
                requestId,
                results,
                processingTime: Date.now() - startTime,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            this.metrics.failedRequests++;
            console.error(`❌ Request ${requestId} failed:`, error);
            throw error;
        }
    }

    /**
     * Determine which subsystems should handle a request
     */
    determineTargetSubsystems(requestType) {
        const routingMap = {
            'ethical-validation': ['ethics', 'audit'],
            'compliance-check': ['compliance', 'audit', 'reporting'],
            'risk-assessment': ['risk', 'monitoring'],
            'decision-validation': ['ethics', 'compliance', 'risk', 'audit'],
            'audit-request': ['audit', 'transparency'],
            'violation-handling': ['enforcement', 'compliance', 'audit'],
            'transparency-request': ['transparency', 'audit'],
            'monitoring-alert': ['monitoring', 'risk', 'enforcement']
        };
        
        return routingMap[requestType] || [];
    }

    /**
     * Process request through target subsystems
     */
    async processRequest(requestId, requestType, data, targetSubsystems) {
        const results = {};
        const processingPromises = [];
        
        for (const subsystemName of targetSubsystems) {
            const subsystemInfo = this.subsystemRegistry.get(subsystemName);
            
            if (!subsystemInfo) {
                console.warn(`⚠️ Subsystem ${subsystemName} not registered`);
                continue;
            }
            
            const promise = this.callSubsystem(subsystemName, requestType, data)
                .then(result => {
                    results[subsystemName] = result;
                    subsystemInfo.requestCount++;
                })
                .catch(error => {
                    results[subsystemName] = { error: error.message };
                    subsystemInfo.errorCount++;
                });
            
            processingPromises.push(promise);
        }
        
        // Wait for all subsystems to respond
        await Promise.all(processingPromises);
        
        return results;
    }

    /**
     * Call a specific subsystem
     */
    async callSubsystem(subsystemName, requestType, data) {
        const subsystemInfo = this.subsystemRegistry.get(subsystemName);
        const subsystem = subsystemInfo.instance;
        
        // Route to appropriate method based on request type
        const methodMap = {
            'ethical-validation': 'validateDecision',
            'compliance-check': 'checkCompliance',
            'risk-assessment': 'assessRisk',
            'decision-validation': 'validateDecision',
            'audit-request': 'processAuditRequest',
            'violation-handling': 'handleViolation',
            'transparency-request': 'generateExplanation',
            'monitoring-alert': 'processAlert'
        };
        
        const methodName = methodMap[requestType];
        
        if (!methodName || typeof subsystem[methodName] !== 'function') {
            throw new Error(`Method ${methodName} not available on subsystem ${subsystemName}`);
        }
        
        return await subsystem[methodName](data);
    }

    /**
     * Set up health monitoring for all subsystems
     */
    setupHealthMonitoring() {
        setInterval(async () => {
            await this.performHealthChecks();
        }, 30000); // Every 30 seconds
    }

    /**
     * Perform health checks on all subsystems
     */
    async performHealthChecks() {
        for (const [name, info] of this.subsystemRegistry) {
            try {
                const healthResult = await this.checkSubsystemHealth(name, info.instance);
                this.healthChecks.set(name, {
                    status: healthResult.healthy ? 'healthy' : 'unhealthy',
                    lastCheck: Date.now(),
                    details: healthResult
                });
                
                if (!healthResult.healthy) {
                    this.emit('subsystem-unhealthy', { name, details: healthResult });
                }
                
            } catch (error) {
                this.healthChecks.set(name, {
                    status: 'error',
                    lastCheck: Date.now(),
                    error: error.message
                });
                
                this.emit('subsystem-error', { name, error });
            }
        }
    }

    /**
     * Check health of a specific subsystem
     */
    async checkSubsystemHealth(name, subsystem) {
        if (typeof subsystem.healthCheck === 'function') {
            return await subsystem.healthCheck();
        }
        
        // Basic health check - verify subsystem is responsive
        return {
            healthy: true,
            timestamp: Date.now(),
            checks: ['basic-responsiveness']
        };
    }

    /**
     * Start message queue processing
     */
    startMessageProcessing() {
        if (this.processingQueue) return;
        
        this.processingQueue = true;
        this.processMessageQueue();
    }

    /**
     * Process queued messages
     */
    async processMessageQueue() {
        while (this.processingQueue) {
            if (this.messageQueue.length > 0) {
                const message = this.messageQueue.shift();
                await this.processQueuedMessage(message);
            } else {
                // Wait before checking again
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            this.metrics.queueLength = this.messageQueue.length;
        }
    }

    /**
     * Process a queued message
     */
    async processQueuedMessage(message) {
        try {
            this.emit('message-processing', message);
            // Message processing logic here
            this.emit('message-processed', message);
        } catch (error) {
            this.emit('message-error', { message, error });
        }
    }

    /**
     * Add message to processing queue
     */
    async queueMessage(message) {
        this.messageQueue.push(message);
        this.metrics.queueLength = this.messageQueue.length;
    }

    /**
     * Handle subsystem requests
     */
    handleSubsystemRequest(subsystemName, data) {
        this.emit('subsystem-request', { subsystem: subsystemName, data });
    }

    /**
     * Handle subsystem errors
     */
    handleSubsystemError(subsystemName, error) {
        console.error(`❌ Subsystem ${subsystemName} error:`, error);
        this.emit('subsystem-error', { subsystem: subsystemName, error });
    }

    /**
     * Update subsystem status
     */
    updateSubsystemStatus(subsystemName, status) {
        const subsystemInfo = this.subsystemRegistry.get(subsystemName);
        if (subsystemInfo) {
            subsystemInfo.status = status;
            subsystemInfo.lastHealthCheck = Date.now();
        }
    }

    /**
     * Get orchestrator status
     */
    getStatus() {
        const subsystemStatuses = {};
        
        for (const [name, info] of this.subsystemRegistry) {
            subsystemStatuses[name] = {
                status: info.status,
                requestCount: info.requestCount,
                errorCount: info.errorCount,
                lastHealthCheck: info.lastHealthCheck,
                health: this.healthChecks.get(name)
            };
        }
        
        return {
            uptime: this.getUptime(),
            metrics: this.metrics,
            subsystems: subsystemStatuses,
            queueLength: this.messageQueue.length,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Get system uptime
     */
    getUptime() {
        return this.startTime ? Date.now() - this.startTime : 0;
    }

    /**
     * Update average response time metric
     */
    updateAverageResponseTime(responseTime) {
        const currentAvg = this.metrics.averageResponseTime;
        const totalRequests = this.metrics.totalRequests;
        
        this.metrics.averageResponseTime = 
            (currentAvg * (totalRequests - 1) + responseTime) / totalRequests;
    }

    /**
     * Generate unique request ID
     */
    generateRequestId() {
        return `orch-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Shutdown orchestrator
     */
    async shutdown() {
        console.log('🛑 Shutting down Governance Orchestrator...');
        
        this.processingQueue = false;
        
        // Notify all subsystems of shutdown
        this.emit('shutdown');
        
        console.log('✅ Governance Orchestrator shut down');
    }
}

module.exports = AIGovernanceOrchestrator;
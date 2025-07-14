/**
 * Default Configuration for Ecosystem Integration Layer
 */

module.exports = {
    // Universal API Gateway Configuration
    gateway: {
        port: process.env.GATEWAY_PORT || 8080,
        rateLimitWindow: 15 * 60 * 1000, // 15 minutes
        rateLimitMax: 1000,
        corsOrigins: ['*'],
        enableMetrics: true,
        enableLogging: true,
        logLevel: 'info'
    },

    // Data Harmonization Configuration
    harmonization: {
        enableValidation: true,
        enableTransformation: true,
        enableCaching: true,
        cacheSize: 10000,
        cacheTTL: 5 * 60 * 1000, // 5 minutes
        validationMode: 'strict', // 'strict', 'lenient', 'disabled'
        transformationTimeout: 10000,
        batchSize: 100
    },

    // Workflow Automation Configuration
    automation: {
        maxConcurrentWorkflows: 100,
        maxStepsPerWorkflow: 1000,
        defaultTimeout: 300000, // 5 minutes
        enableParallelExecution: true,
        enableRetry: true,
        maxRetries: 3,
        retryDelay: 1000,
        enableWorkflowPersistence: true,
        workflowStoragePath: './data/workflows'
    },

    // System Interoperability Configuration
    interoperability: {
        messageTimeout: 30000,
        maxRetries: 3,
        enableServiceDiscovery: true,
        enableLoadBalancing: true,
        enableHealthChecking: true,
        healthCheckInterval: 30000,
        circuitBreakerOptions: {
            timeout: 10000,
            errorThresholdPercentage: 50,
            resetTimeout: 30000,
            rollingCountTimeout: 10000,
            rollingCountBuckets: 10
        },
        protocols: {
            http: { timeout: 30000, retries: 3 },
            websocket: { timeout: 30000, pingInterval: 30000 },
            message_queue: { batchSize: 100, flushInterval: 1000 },
            graphql: { timeout: 30000, maxDepth: 10 }
        }
    },

    // Event-Driven Architecture Configuration
    events: {
        maxEventHistory: 100000,
        retentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
        enableEventSourcing: true,
        enableEventReplay: true,
        enableCorrelation: true,
        batchSize: 100,
        flushInterval: 1000,
        snapshotInterval: 10000, // events
        maxCorrelationWindow: 60000, // 1 minute
        enableEventCompression: true,
        compressionThreshold: 1000 // bytes
    },

    // Integration Monitoring Configuration
    monitoring: {
        metricsRetention: 30 * 24 * 60 * 60 * 1000, // 30 days
        samplingRate: 1.0,
        enablePredictiveAnalytics: true,
        enableRealTimeAlerts: true,
        enableAnomalyDetection: true,
        alertThresholds: {
            errorRate: 0.05, // 5%
            responseTime: 5000, // 5 seconds
            resourceUsage: 0.9, // 90%
            throughputDrop: 0.3, // 30% drop
            memoryUsage: 0.85, // 85%
            cpuUsage: 0.85 // 85%
        },
        dashboardRefreshInterval: 30000,
        reportGenerationInterval: 3600000, // 1 hour
        exportFormats: ['json', 'csv', 'prometheus'],
        enableMetricsExport: true,
        metricsExportInterval: 60000,
        metricsExportPath: './data/metrics'
    },

    // System Integration Settings
    integration: {
        enableAutoDiscovery: true,
        autoDiscoveryInterval: 60000,
        enableAutoScaling: false,
        scalingThresholds: {
            cpu: 0.8,
            memory: 0.8,
            throughput: 1000
        },
        enableFailover: true,
        failoverTimeout: 30000,
        enableLoadBalancing: true,
        loadBalancingStrategy: 'round_robin', // 'round_robin', 'least_connections', 'weighted'
        enableCaching: true,
        cacheStrategy: 'lru', // 'lru', 'lfu', 'ttl'
        cacheTTL: 300000 // 5 minutes
    },

    // Security Configuration
    security: {
        enableAuthentication: true,
        enableAuthorization: true,
        enableRateLimiting: true,
        enableRequestValidation: true,
        enableResponseValidation: false,
        enableEncryption: true,
        encryptionAlgorithm: 'aes-256-gcm',
        enableAuditLogging: true,
        auditLogLevel: 'info',
        enableCSRFProtection: true,
        enableXSSProtection: true,
        enableSQLInjectionProtection: true
    },

    // Logging Configuration
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: 'json',
        enableConsoleLogging: true,
        enableFileLogging: true,
        logDirectory: './logs',
        maxFileSize: '100MB',
        maxFiles: 10,
        enableRotation: true,
        enableCorrelationIds: true,
        enableStructuredLogging: true
    },

    // Storage Configuration
    storage: {
        type: 'filesystem', // 'filesystem', 'redis', 'mongodb', 'postgresql'
        connectionString: process.env.STORAGE_CONNECTION_STRING,
        options: {
            filesystem: {
                basePath: './data',
                enableCompression: true,
                enableEncryption: false
            },
            redis: {
                host: 'localhost',
                port: 6379,
                db: 0,
                enableCluster: false
            },
            mongodb: {
                database: 'ecosystem_integration',
                collection: 'events',
                enableSharding: false
            }
        }
    },

    // Performance Tuning
    performance: {
        enableCPUProfiling: false,
        enableMemoryProfiling: false,
        enableGarbageCollectionTuning: true,
        maxOldSpaceSize: 4096, // MB
        maxSemiSpaceSize: 512, // MB
        enableClusterMode: false,
        workerProcesses: require('os').cpus().length,
        enableKeepAlive: true,
        keepAliveTimeout: 65000,
        maxConnections: 10000,
        enableCompression: true,
        compressionLevel: 6
    },

    // Development Settings
    development: {
        enableHotReload: false,
        enableDebugLogging: false,
        enableTestMode: false,
        enableMockServices: false,
        mockServiceDelay: 100,
        enableAPIDocumentation: true,
        documentationPort: 8081,
        enableHealthEndpoints: true,
        enableMetricsEndpoints: true,
        enableDebugEndpoints: false
    },

    // Production Settings
    production: {
        enableClusterMode: true,
        enableLoadBalancing: true,
        enableFailover: true,
        enableMonitoring: true,
        enableAlerting: true,
        enableBackups: true,
        backupInterval: 24 * 60 * 60 * 1000, // 24 hours
        enableOptimizations: true,
        enableCaching: true,
        enableCompression: true
    },

    // External Service Endpoints
    services: {
        'ai-personality': {
            baseUrl: process.env.AI_PERSONALITY_URL || 'http://localhost:3001',
            healthEndpoint: '/health',
            timeout: 30000,
            retries: 3,
            circuitBreaker: true
        },
        'economic-engine': {
            baseUrl: process.env.ECONOMIC_ENGINE_URL || 'http://localhost:3002',
            healthEndpoint: '/health',
            timeout: 30000,
            retries: 3,
            circuitBreaker: true
        },
        'market-infrastructure': {
            baseUrl: process.env.MARKET_INFRASTRUCTURE_URL || 'http://localhost:3003',
            healthEndpoint: '/health',
            timeout: 30000,
            retries: 3,
            circuitBreaker: true
        },
        'game-balance': {
            baseUrl: process.env.GAME_BALANCE_URL || 'http://localhost:3004',
            healthEndpoint: '/health',
            timeout: 30000,
            retries: 3,
            circuitBreaker: true
        },
        'security': {
            baseUrl: process.env.SECURITY_URL || 'http://localhost:3005',
            healthEndpoint: '/health',
            timeout: 30000,
            retries: 3,
            circuitBreaker: true
        },
        'visualization': {
            baseUrl: process.env.VISUALIZATION_URL || 'http://localhost:3006',
            healthEndpoint: '/health',
            timeout: 30000,
            retries: 3,
            circuitBreaker: true
        },
        'player-interaction': {
            baseUrl: process.env.PLAYER_INTERACTION_URL || 'http://localhost:3007',
            healthEndpoint: '/health',
            timeout: 30000,
            retries: 3,
            circuitBreaker: true
        },
        'persistence': {
            baseUrl: process.env.PERSISTENCE_URL || 'http://localhost:3008',
            healthEndpoint: '/health',
            timeout: 30000,
            retries: 3,
            circuitBreaker: true
        }
    }
};
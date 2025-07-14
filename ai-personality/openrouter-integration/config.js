/**
 * OpenRouter Integration Configuration
 * Centralized configuration for AI model management and optimization
 */

module.exports = {
    // API Configuration
    api: {
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: process.env.OPENROUTER_API_KEY || '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',
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000
    },
    
    // Model Configuration (Based on 2025 Research)
    models: {
        primary: {
            id: 'moonshotai/kimi-k2:free',
            description: 'Primary model - 1T parameters, 32B active, excellent for reasoning and coding',
            contextWindow: 128000,
            specialties: ['reasoning', 'coding', 'tool_use', 'agentic_tasks']
        },
        
        fallbacks: [
            {
                id: 'moonshotai/kimi-k2:free',
                priority: 1,
                specialties: ['reasoning', 'coding', 'general'],
                contextWindow: 128000
            },
            {
                id: 'meta-llama/llama-4-maverick:free',
                priority: 2,
                specialties: ['general', 'conversation', 'analysis'],
                contextWindow: 8192
            },
            {
                id: 'moonshotai/kimi-vl-a3b-thinking:free',
                priority: 3,
                specialties: ['multimodal', 'visual', 'thinking'],
                contextWindow: 32768
            },
            {
                id: 'microsoft/phi-3-mini-4k-instruct:free',
                priority: 4,
                specialties: ['instruction_following', 'quick_responses'],
                contextWindow: 4096
            },
            {
                id: 'google/gemma-7b-it:free',
                priority: 5,
                specialties: ['general', 'backup'],
                contextWindow: 8192
            }
        ]
    },
    
    // Rate Limiting (2025 OpenRouter Limits)
    rateLimits: {
        freeModels: {
            requestsPerMinute: 20,
            dailyRequestsBasic: 50,    // Less than $10 account balance
            dailyRequestsPremium: 1000, // $10+ account balance
            upgradeThreshold: 10.00
        },
        
        monitoring: {
            warningThreshold: 0.8,    // Warn at 80% of limit
            criticalThreshold: 0.95   // Critical at 95% of limit
        }
    },
    
    // Request Optimization
    optimization: {
        // Model selection based on request type
        modelSelection: {
            'coding': ['moonshotai/kimi-k2:free', 'meta-llama/llama-4-maverick:free'],
            'reasoning': ['moonshotai/kimi-k2:free'],
            'general': ['moonshotai/kimi-k2:free', 'meta-llama/llama-4-maverick:free'],
            'multimodal': ['moonshotai/kimi-vl-a3b-thinking:free', 'moonshotai/kimi-k2:free'],
            'web_search': ['moonshotai/kimi-k2:free'], // Excellent tool use capabilities
            'analysis': ['moonshotai/kimi-k2:free', 'meta-llama/llama-4-maverick:free'],
            'quick_response': ['microsoft/phi-3-mini-4k-instruct:free'],
            'conversation': ['meta-llama/llama-4-maverick:free', 'moonshotai/kimi-k2:free']
        },
        
        // Default parameters for different request types
        defaultParameters: {
            'coding': {
                temperature: 0.3,
                top_p: 0.9,
                max_tokens: 4096,
                frequency_penalty: 0.1
            },
            'reasoning': {
                temperature: 0.7,
                top_p: 0.95,
                max_tokens: 4096,
                frequency_penalty: 0
            },
            'general': {
                temperature: 0.7,
                top_p: 1.0,
                max_tokens: 2048,
                frequency_penalty: 0
            },
            'web_search': {
                temperature: 0.3,
                top_p: 0.9,
                max_tokens: 2048,
                frequency_penalty: 0.1
            }
        }
    },
    
    // Performance Monitoring
    monitoring: {
        metricsCollection: true,
        performanceThresholds: {
            responseTime: 30000,      // 30 seconds max
            successRate: 0.8,         // 80% minimum success rate
            errorRate: 0.2            // 20% maximum error rate
        },
        
        alerting: {
            enabled: true,
            channels: ['console', 'events'],
            thresholds: {
                highErrorRate: 0.3,
                slowResponse: 45000,
                rateLimitApproaching: 0.8
            }
        }
    },
    
    // Error Handling
    errorHandling: {
        retryableErrors: [
            'rate_limit',
            'server_error',
            'timeout',
            'network_error'
        ],
        
        fallbackStrategies: {
            'rate_limit': 'wait_and_retry',
            'server_error': 'try_fallback_model',
            'timeout': 'try_fallback_model',
            'authentication_error': 'fail_immediately',
            'invalid_request': 'fail_immediately'
        },
        
        gracefulDegradation: {
            enabled: true,
            fallbackResponse: 'AI services are temporarily unavailable. Please try again later.',
            offlineMode: false
        }
    },
    
    // Cost Management
    costManagement: {
        budgetTracking: true,
        monthlyBudget: 0, // Free tier
        alertThresholds: {
            usage: [0.5, 0.8, 0.95], // 50%, 80%, 95% of budget
            timeframe: 'monthly'
        },
        
        optimization: {
            preferFreeModels: true,
            automaticFallback: true,
            cacheResponses: true,
            cacheTTL: 3600000 // 1 hour
        }
    },
    
    // Integration Settings
    integration: {
        // Phase 2 AI Personality Integration
        aiPersonality: {
            enabled: true,
            memoryIntegration: true,
            learningIntegration: true,
            emotionalContext: true
        },
        
        // Phase 3 Market Complexity Integration
        marketComplexity: {
            enabled: true,
            economicContext: true,
            agentCoordination: true,
            decisionSupport: true
        },
        
        // Swarm Coordination
        swarmCoordination: {
            enabled: true,
            memorySharing: true,
            taskDistribution: true,
            collectiveIntelligence: true
        }
    },
    
    // Security Configuration
    security: {
        apiKeyRotation: false, // Manual for now
        requestValidation: true,
        responseFiltering: true,
        auditLogging: true,
        
        rateProtection: {
            enabled: true,
            strictMode: false,
            bufferRequests: true
        }
    },
    
    // Development/Testing
    development: {
        debugMode: process.env.NODE_ENV === 'development',
        verboseLogging: false,
        mockResponses: false,
        
        testing: {
            enabled: true,
            mockFailures: false,
            simulateRateLimits: false
        }
    }
};
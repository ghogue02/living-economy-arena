/**
 * OpenRouter AI Integration Framework
 * Phase 3 Market Complexity: Advanced AI Intelligence System
 * 
 * Features:
 * - Primary model: moonshotai/kimi-k2:free with fallback cascading
 * - Cost optimization and rate limiting
 * - Intelligent model selection and routing
 * - Performance monitoring and analytics
 * - Web search integration capabilities
 * - Error handling and graceful degradation
 */

const axios = require('axios');
const EventEmitter = require('events');

class OpenRouterIntegration extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.apiKey = config.apiKey || process.env.OPENROUTER_API_KEY || 'YOUR_API_KEY_HERE';
        this.baseURL = 'https://openrouter.ai/api/v1';
        this.primaryModel = 'moonshotai/kimi-k2:free';
        
        // Free model fallback hierarchy based on 2025 research
        this.fallbackModels = [
            'moonshotai/kimi-k2:free',
            'meta-llama/llama-4-maverick:free',
            'moonshotai/kimi-vl-a3b-thinking:free',
            'microsoft/phi-3-mini-4k-instruct:free',
            'google/gemma-7b-it:free'
        ];
        
        // Rate limiting configuration (2025 OpenRouter limits)
        this.rateLimits = {
            freeModels: {
                requestsPerMinute: 20,
                dailyRequests: config.accountBalance >= 10 ? 1000 : 50
            },
            currentUsage: {
                requestsThisMinute: 0,
                requestsToday: 0,
                lastReset: Date.now()
            }
        };
        
        // Performance tracking
        this.performance = {
            requestCount: 0,
            totalTokens: 0,
            totalCost: 0,
            averageResponseTime: 0,
            modelSuccessRates: new Map(),
            errorCounts: new Map()
        };
        
        this.initializeRateLimitReset();
    }
    
    /**
     * Initialize rate limit reset timers
     */
    initializeRateLimitReset() {
        // Reset per-minute counter
        setInterval(() => {
            this.rateLimits.currentUsage.requestsThisMinute = 0;
        }, 60000);
        
        // Reset daily counter at midnight
        const msUntilMidnight = new Date().setHours(24,0,0,0) - Date.now();
        setTimeout(() => {
            this.rateLimits.currentUsage.requestsToday = 0;
            setInterval(() => {
                this.rateLimits.currentUsage.requestsToday = 0;
            }, 86400000); // 24 hours
        }, msUntilMidnight);
    }
    
    /**
     * Check if request is within rate limits
     */
    checkRateLimit() {
        const { currentUsage, freeModels } = this.rateLimits;
        
        if (currentUsage.requestsThisMinute >= freeModels.requestsPerMinute) {
            throw new Error(`Rate limit exceeded: ${freeModels.requestsPerMinute} requests per minute`);
        }
        
        if (currentUsage.requestsToday >= freeModels.dailyRequests) {
            throw new Error(`Daily limit exceeded: ${freeModels.dailyRequests} requests per day`);
        }
        
        return true;
    }
    
    /**
     * Intelligent model selection based on request type and performance
     */
    selectOptimalModel(requestType = 'general', context = {}) {
        const modelPreferences = {
            'coding': ['moonshotai/kimi-k2:free', 'meta-llama/llama-4-maverick:free'],
            'reasoning': ['moonshotai/kimi-k2:free', 'moonshotai/kimi-vl-a3b-thinking:free'],
            'general': ['moonshotai/kimi-k2:free', 'meta-llama/llama-4-maverick:free'],
            'multimodal': ['moonshotai/kimi-vl-a3b-thinking:free', 'moonshotai/kimi-k2:free'],
            'web_search': ['moonshotai/kimi-k2:free'] // Primary model excellent for tool use
        };
        
        const preferredModels = modelPreferences[requestType] || this.fallbackModels;
        
        // Select based on success rates and availability
        for (const model of preferredModels) {
            const successRate = this.performance.modelSuccessRates.get(model) || 1.0;
            if (successRate > 0.8) { // Only use models with >80% success rate
                return model;
            }
        }
        
        return this.primaryModel; // Fallback to primary
    }
    
    /**
     * Core AI completion request with intelligent fallback
     */
    async createCompletion(messages, options = {}) {
        const startTime = Date.now();
        
        try {
            this.checkRateLimit();
            
            const requestType = options.requestType || 'general';
            const selectedModel = options.model || this.selectOptimalModel(requestType, options.context);
            
            const requestData = {
                model: selectedModel,
                messages: messages,
                temperature: options.temperature || 0.7,
                max_tokens: options.maxTokens || 4096,
                top_p: options.topP || 1.0,
                frequency_penalty: options.frequencyPenalty || 0,
                presence_penalty: options.presencePenalty || 0,
                stream: options.stream || false,
                ...options.providerParams // Additional provider-specific parameters
            };
            
            const response = await this.makeRequest('/chat/completions', requestData, selectedModel);
            
            // Update performance metrics
            this.updatePerformanceMetrics(selectedModel, response, startTime, true);
            
            return {
                content: response.data.choices[0].message.content,
                model: selectedModel,
                usage: response.data.usage,
                responseTime: Date.now() - startTime,
                success: true
            };
            
        } catch (error) {
            return await this.handleRequestError(error, messages, options, startTime);
        }
    }
    
    /**
     * Make HTTP request to OpenRouter API
     */
    async makeRequest(endpoint, data, model) {
        // Update rate limiting counters
        this.rateLimits.currentUsage.requestsThisMinute++;
        this.rateLimits.currentUsage.requestsToday++;
        
        const config = {
            method: 'POST',
            url: `${this.baseURL}${endpoint}`,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://living-economy-arena.com',
                'X-Title': 'Living Economy Arena - Phase 3 AI Integration'
            },
            data: data,
            timeout: 30000 // 30 second timeout
        };
        
        const response = await axios(config);
        
        // Emit success event for monitoring
        this.emit('requestSuccess', { model, data: response.data });
        
        return response;
    }
    
    /**
     * Handle request errors with intelligent fallback
     */
    async handleRequestError(error, messages, options, startTime) {
        const errorType = this.categorizeError(error);
        
        // Update error metrics
        const model = options.model || this.primaryModel;
        this.updatePerformanceMetrics(model, null, startTime, false);
        
        // Emit error event for monitoring
        this.emit('requestError', { model, error: errorType, originalError: error });
        
        // Try fallback models for recoverable errors
        if (errorType === 'rate_limit' || errorType === 'server_error' || errorType === 'model_unavailable') {
            return await this.tryFallbackModels(messages, options, [model]);
        }
        
        // For non-recoverable errors, return error response
        return {
            content: `Error: ${errorType} - ${error.message}`,
            model: model,
            usage: { total_tokens: 0, prompt_tokens: 0, completion_tokens: 0 },
            responseTime: Date.now() - startTime,
            success: false,
            error: errorType
        };
    }
    
    /**
     * Try fallback models in sequence
     */
    async tryFallbackModels(messages, options, failedModels = []) {
        for (const fallbackModel of this.fallbackModels) {
            if (failedModels.includes(fallbackModel)) continue;
            
            try {
                console.log(`Trying fallback model: ${fallbackModel}`);
                
                const fallbackOptions = { ...options, model: fallbackModel };
                const result = await this.createCompletion(messages, fallbackOptions);
                
                if (result.success) {
                    return result;
                }
            } catch (fallbackError) {
                console.warn(`Fallback model ${fallbackModel} also failed:`, fallbackError.message);
                failedModels.push(fallbackModel);
            }
        }
        
        // All models failed
        return {
            content: 'All AI models are currently unavailable. Please try again later.',
            model: 'fallback_failed',
            usage: { total_tokens: 0, prompt_tokens: 0, completion_tokens: 0 },
            responseTime: 0,
            success: false,
            error: 'all_models_failed'
        };
    }
    
    /**
     * Categorize errors for intelligent handling
     */
    categorizeError(error) {
        if (error.response) {
            const status = error.response.status;
            const data = error.response.data;
            
            if (status === 429) return 'rate_limit';
            if (status === 503) return 'server_error';
            if (status === 400 && data.error?.type === 'invalid_request') return 'invalid_request';
            if (status === 401) return 'authentication_error';
            if (status >= 500) return 'server_error';
        }
        
        if (error.code === 'ECONNABORTED') return 'timeout';
        if (error.code === 'ENOTFOUND') return 'network_error';
        
        return 'unknown_error';
    }
    
    /**
     * Update performance metrics and learning
     */
    updatePerformanceMetrics(model, response, startTime, success) {
        this.performance.requestCount++;
        
        if (success && response) {
            const responseTime = Date.now() - startTime;
            this.performance.averageResponseTime = 
                (this.performance.averageResponseTime * (this.performance.requestCount - 1) + responseTime) 
                / this.performance.requestCount;
            
            if (response.data.usage) {
                this.performance.totalTokens += response.data.usage.total_tokens;
                // Estimate cost (free models have $0 cost but we track for premium models)
                this.performance.totalCost += 0; // Free models
            }
        }
        
        // Update model success rates
        const currentSuccessRate = this.performance.modelSuccessRates.get(model) || 1.0;
        const currentCount = this.performance.errorCounts.get(model) || 0;
        const newSuccessRate = success ? 
            Math.min(1.0, currentSuccessRate + 0.1) : 
            Math.max(0.1, currentSuccessRate - 0.2);
        
        this.performance.modelSuccessRates.set(model, newSuccessRate);
        this.performance.errorCounts.set(model, success ? Math.max(0, currentCount - 1) : currentCount + 1);
    }
    
    /**
     * Web search integration using AI model capabilities
     */
    async performWebSearch(query, options = {}) {
        const searchPrompt = [
            {
                role: 'system',
                content: `You are an AI assistant with web search capabilities. When a user asks for current information, you should provide accurate, up-to-date responses based on your knowledge and indicate if the information might need verification from current web sources.`
            },
            {
                role: 'user',
                content: `Search for information about: ${query}
                
Please provide:
1. Current, accurate information about this topic
2. Key insights and findings
3. Recent developments or changes (if applicable)
4. Sources or references when possible
5. Indicate if this information should be verified with current web sources

Query: ${query}`
            }
        ];
        
        return await this.createCompletion(searchPrompt, {
            requestType: 'web_search',
            temperature: 0.3, // Lower temperature for factual searches
            maxTokens: 2048,
            ...options
        });
    }
    
    /**
     * Enhanced AI conversation with context awareness
     */
    async enhancedConversation(messages, context = {}) {
        // Add system context for market complexity and AI personality integration
        const enhancedMessages = [
            {
                role: 'system',
                content: `You are an advanced AI agent in the Living Economy Arena Phase 3 Market Complexity system. You have access to:
                
- Advanced reasoning capabilities (Kimi K2 model)
- Market analysis and economic intelligence
- Cross-agent coordination and learning systems
- Real-time decision making for complex scenarios

Context: ${JSON.stringify(context, null, 2)}

Provide intelligent, context-aware responses that integrate with the broader agent society and economic systems.`
            },
            ...messages
        ];
        
        return await this.createCompletion(enhancedMessages, {
            requestType: 'reasoning',
            temperature: 0.7,
            maxTokens: 4096,
            context: context
        });
    }
    
    /**
     * Get comprehensive system status and metrics
     */
    getSystemStatus() {
        const uptime = Date.now() - this.performance.lastReset || Date.now();
        
        return {
            status: 'operational',
            uptime: uptime,
            models: {
                primary: this.primaryModel,
                fallbacks: this.fallbackModels,
                successRates: Object.fromEntries(this.performance.modelSuccessRates)
            },
            rateLimits: {
                current: this.rateLimits.currentUsage,
                limits: this.rateLimits.freeModels
            },
            performance: {
                totalRequests: this.performance.requestCount,
                averageResponseTime: this.performance.averageResponseTime,
                totalTokens: this.performance.totalTokens,
                totalCost: this.performance.totalCost
            },
            capabilities: [
                'Advanced reasoning with Kimi K2',
                'Intelligent model fallback',
                'Cost optimization',
                'Rate limit management',
                'Performance monitoring',
                'Web search integration',
                'Context-aware conversations'
            ]
        };
    }
    
    /**
     * Cost optimization recommendations
     */
    getCostOptimizationRecommendations() {
        const recommendations = [];
        
        if (this.rateLimits.freeModels.dailyRequests < 1000) {
            recommendations.push({
                type: 'account_upgrade',
                description: 'Add $10 to account balance to increase daily limit from 50 to 1000 requests',
                impact: '20x increase in daily capacity',
                cost: '$10 one-time'
            });
        }
        
        const inefficientModels = Array.from(this.performance.modelSuccessRates.entries())
            .filter(([model, rate]) => rate < 0.8);
        
        if (inefficientModels.length > 0) {
            recommendations.push({
                type: 'model_optimization',
                description: `Models with low success rates: ${inefficientModels.map(([m]) => m).join(', ')}`,
                impact: 'Reduced request failures and retry costs',
                action: 'Review model selection logic'
            });
        }
        
        return recommendations;
    }
}

module.exports = OpenRouterIntegration;
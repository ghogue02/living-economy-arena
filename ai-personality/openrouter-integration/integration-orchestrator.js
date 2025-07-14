/**
 * OpenRouter Integration Orchestrator
 * Phase 3 Market Complexity: Coordinates OpenRouter AI with existing systems
 * 
 * This orchestrator manages the integration between:
 * - OpenRouter AI models (primary: moonshotai/kimi-k2:free)
 * - Phase 2 AI Personality and Learning Systems
 * - Market Complexity and Economic Analysis
 * - Agent Society and Communication Systems
 * - Swarm Coordination and Intelligence
 */

const OpenRouterIntegration = require('./index');
const OpenRouterMonitor = require('./monitoring');
const config = require('./config');
const EventEmitter = require('events');

class OpenRouterOrchestrator extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.config = { ...config, ...options };
        this.openRouter = new OpenRouterIntegration(this.config.api);
        this.monitor = new OpenRouterMonitor(this.config.monitoring);
        
        // Integration components
        this.integrations = {
            aiPersonality: null,
            marketComplexity: null,
            agentSociety: null,
            swarmCoordination: null,
            memory: new Map(),
            activeContexts: new Map()
        };
        
        // Enhanced intelligence capabilities
        this.intelligence = {
            contextualMemory: new Map(),
            learningPatterns: new Map(),
            decisionHistory: [],
            predictionAccuracy: new Map(),
            adaptiveStrategies: new Map()
        };
        
        this.setupEventHandlers();
        this.initializeIntegrations();
    }
    
    /**
     * Initialize integrations with existing systems
     */
    async initializeIntegrations() {
        try {
            // Load existing AI personality system if available
            await this.loadAIPersonalityIntegration();
            
            // Load market complexity system if available
            await this.loadMarketComplexityIntegration();
            
            // Load agent society system if available
            await this.loadAgentSocietyIntegration();
            
            // Initialize swarm coordination
            await this.loadSwarmCoordination();
            
            this.emit('integrationInitialized', {
                timestamp: Date.now(),
                systems: Object.keys(this.integrations).filter(key => this.integrations[key] !== null)
            });
            
        } catch (error) {
            console.error('Integration initialization error:', error);
            this.emit('integrationError', { error, phase: 'initialization' });
        }
    }
    
    /**
     * Load AI Personality Integration (Phase 2)
     */
    async loadAIPersonalityIntegration() {
        try {
            const aiPersonalityPath = require.resolve('../enhanced-personality-system');
            const AIPersonalitySystem = require(aiPersonalityPath);
            
            this.integrations.aiPersonality = new AIPersonalitySystem({
                enhancedIntelligence: true,
                openRouterIntegration: true
            });
            
            console.log('✅ AI Personality System integrated');
            
        } catch (error) {
            console.warn('⚠️ AI Personality System not available:', error.message);
        }
    }
    
    /**
     * Load Market Complexity Integration (Phase 3)
     */
    async loadMarketComplexityIntegration() {
        try {
            // Attempt to load economic engine
            const economicEnginePath = require.resolve('../../economic-engine/core/simulation/engine');
            const EconomicEngine = require(economicEnginePath);
            
            this.integrations.marketComplexity = new EconomicEngine({
                aiEnhanced: true,
                openRouterIntegration: true
            });
            
            console.log('✅ Market Complexity System integrated');
            
        } catch (error) {
            console.warn('⚠️ Market Complexity System not available:', error.message);
        }
    }
    
    /**
     * Load Agent Society Integration
     */
    async loadAgentSocietyIntegration() {
        try {
            const agentSocietyPath = require.resolve('../../agent-society/index');
            const AgentSociety = require(agentSocietyPath);
            
            this.integrations.agentSociety = new AgentSociety({
                aiEnhanced: true,
                openRouterIntegration: true
            });
            
            console.log('✅ Agent Society System integrated');
            
        } catch (error) {
            console.warn('⚠️ Agent Society System not available:', error.message);
        }
    }
    
    /**
     * Load Swarm Coordination
     */
    async loadSwarmCoordination() {
        // Swarm coordination is built into this orchestrator
        this.integrations.swarmCoordination = {
            enabled: true,
            agents: new Map(),
            tasks: new Map(),
            coordination: new Map()
        };
        
        console.log('✅ Swarm Coordination enabled');
    }
    
    /**
     * Setup event handlers for monitoring and coordination
     */
    setupEventHandlers() {
        // Monitor OpenRouter events
        this.openRouter.on('requestSuccess', (data) => {
            this.monitor.recordRequest({ ...data, success: true });
            this.updateIntelligence('success', data);
        });
        
        this.openRouter.on('requestError', (data) => {
            this.monitor.recordRequest({ ...data, success: false });
            this.updateIntelligence('error', data);
        });
        
        // Monitor alerts
        this.monitor.on('alert', (alert) => {
            this.handleSystemAlert(alert);
        });
        
        // Periodic intelligence updates
        this.monitor.on('periodicReport', (report) => {
            this.analyzePerformancePatterns(report);
        });
    }
    
    /**
     * Enhanced AI request with full system integration
     */
    async enhancedAIRequest(input, context = {}) {
        const requestId = this.generateRequestId();
        const startTime = Date.now();
        
        try {
            // Prepare enhanced context
            const enhancedContext = await this.prepareEnhancedContext(input, context, requestId);
            
            // Determine optimal request type and model
            const requestType = this.determineRequestType(input, enhancedContext);
            
            // Build messages with full context integration
            const messages = await this.buildContextualMessages(input, enhancedContext, requestType);
            
            // Execute request with OpenRouter
            const result = await this.openRouter.createCompletion(messages, {
                requestType: requestType,
                context: enhancedContext,
                requestId: requestId
            });
            
            // Post-process with system integrations
            const enhancedResult = await this.postProcessResult(result, enhancedContext, requestId);
            
            // Update learning and memory systems
            await this.updateSystemLearning(input, enhancedResult, enhancedContext);
            
            return enhancedResult;
            
        } catch (error) {
            console.error('Enhanced AI request failed:', error);
            return this.handleRequestFailure(error, input, context, requestId);
        }
    }
    
    /**
     * Prepare enhanced context from all integrated systems
     */
    async prepareEnhancedContext(input, context, requestId) {
        const enhancedContext = {
            ...context,
            requestId,
            timestamp: Date.now(),
            systemIntegrations: {}
        };
        
        // Add AI personality context
        if (this.integrations.aiPersonality) {
            try {
                enhancedContext.systemIntegrations.personality = {
                    currentPersonality: await this.integrations.aiPersonality.getCurrentPersonality(),
                    emotionalState: await this.integrations.aiPersonality.getEmotionalState(),
                    learningHistory: await this.integrations.aiPersonality.getRecentLearning(),
                    relationships: await this.integrations.aiPersonality.getActiveRelationships()
                };
            } catch (error) {
                console.warn('Could not load AI personality context:', error.message);
            }
        }
        
        // Add market complexity context
        if (this.integrations.marketComplexity) {
            try {
                enhancedContext.systemIntegrations.market = {
                    currentConditions: await this.integrations.marketComplexity.getCurrentConditions(),
                    economicIndicators: await this.integrations.marketComplexity.getKeyIndicators(),
                    riskAssessment: await this.integrations.marketComplexity.getRiskAssessment(),
                    predictions: await this.integrations.marketComplexity.getShortTermPredictions()
                };
            } catch (error) {
                console.warn('Could not load market complexity context:', error.message);
            }
        }
        
        // Add agent society context
        if (this.integrations.agentSociety) {
            try {
                enhancedContext.systemIntegrations.society = {
                    socialNetwork: await this.integrations.agentSociety.getNetworkState(),
                    culturalContext: await this.integrations.agentSociety.getCulturalContext(),
                    collectiveBehavior: await this.integrations.agentSociety.getCollectiveBehavior(),
                    reputation: await this.integrations.agentSociety.getReputationState()
                };
            } catch (error) {
                console.warn('Could not load agent society context:', error.message);
            }
        }
        
        // Add swarm coordination context
        enhancedContext.systemIntegrations.swarm = {
            activeAgents: this.integrations.swarmCoordination.agents.size,
            activeTasks: this.integrations.swarmCoordination.tasks.size,
            coordinationState: Array.from(this.integrations.swarmCoordination.coordination.keys()),
            intelligence: this.getIntelligenceSummary()
        };
        
        // Add historical context and patterns
        enhancedContext.intelligence = {
            similarRequests: this.findSimilarRequests(input),
            learningPatterns: this.getRelevantLearningPatterns(input),
            predictionConfidence: this.calculatePredictionConfidence(input),
            adaptiveStrategy: this.selectAdaptiveStrategy(input, context)
        };
        
        return enhancedContext;
    }
    
    /**
     * Determine request type based on input and context
     */
    determineRequestType(input, context) {
        const inputLower = input.toLowerCase();
        
        // Market/Economic analysis
        if (inputLower.includes('market') || inputLower.includes('economic') || 
            inputLower.includes('trading') || inputLower.includes('financial')) {
            return 'market_analysis';
        }
        
        // Code/Technical
        if (inputLower.includes('code') || inputLower.includes('program') || 
            inputLower.includes('implement') || inputLower.includes('algorithm')) {
            return 'coding';
        }
        
        // Agent/Social behavior
        if (inputLower.includes('agent') || inputLower.includes('social') || 
            inputLower.includes('behavior') || inputLower.includes('interaction')) {
            return 'agent_behavior';
        }
        
        // Web search needed
        if (inputLower.includes('current') || inputLower.includes('latest') || 
            inputLower.includes('news') || inputLower.includes('recent')) {
            return 'web_search';
        }
        
        // Complex reasoning
        if (inputLower.includes('analyze') || inputLower.includes('strategy') || 
            inputLower.includes('predict') || inputLower.includes('optimize')) {
            return 'reasoning';
        }
        
        return 'general';
    }
    
    /**
     * Build contextual messages with system integration
     */
    async buildContextualMessages(input, context, requestType) {
        const systemMessage = this.buildSystemMessage(context, requestType);
        const contextualInput = this.enhanceInputWithContext(input, context);
        
        return [
            {
                role: 'system',
                content: systemMessage
            },
            {
                role: 'user',
                content: contextualInput
            }
        ];
    }
    
    /**
     * Build comprehensive system message
     */
    buildSystemMessage(context, requestType) {
        let systemMessage = `You are an advanced AI agent in the Living Economy Arena Phase 3 Market Complexity system with enhanced intelligence capabilities.

INTEGRATED SYSTEMS AVAILABLE:`;
        
        // Add personality integration info
        if (context.systemIntegrations.personality) {
            systemMessage += `\n\n🧠 AI PERSONALITY SYSTEM:
- Current Personality: ${JSON.stringify(context.systemIntegrations.personality.currentPersonality, null, 2)}
- Emotional State: ${JSON.stringify(context.systemIntegrations.personality.emotionalState, null, 2)}
- Learning History: Available for context-aware responses`;
        }
        
        // Add market complexity info
        if (context.systemIntegrations.market) {
            systemMessage += `\n\n📈 MARKET COMPLEXITY SYSTEM:
- Current Conditions: ${JSON.stringify(context.systemIntegrations.market.currentConditions, null, 2)}
- Economic Indicators: ${JSON.stringify(context.systemIntegrations.market.economicIndicators, null, 2)}
- Risk Assessment: ${JSON.stringify(context.systemIntegrations.market.riskAssessment, null, 2)}`;
        }
        
        // Add agent society info
        if (context.systemIntegrations.society) {
            systemMessage += `\n\n🤝 AGENT SOCIETY SYSTEM:
- Social Network State: ${JSON.stringify(context.systemIntegrations.society.socialNetwork, null, 2)}
- Cultural Context: ${JSON.stringify(context.systemIntegrations.society.culturalContext, null, 2)}`;
        }
        
        // Add swarm intelligence info
        systemMessage += `\n\n🐝 SWARM INTELLIGENCE:
- Active Agents: ${context.systemIntegrations.swarm.activeAgents}
- Active Tasks: ${context.systemIntegrations.swarm.activeTasks}
- Intelligence Summary: ${JSON.stringify(context.systemIntegrations.swarm.intelligence, null, 2)}`;
        
        // Add intelligence patterns
        if (context.intelligence) {
            systemMessage += `\n\n🧮 INTELLIGENCE PATTERNS:
- Similar Requests: ${context.intelligence.similarRequests.length} found
- Learning Patterns: ${JSON.stringify(context.intelligence.learningPatterns, null, 2)}
- Prediction Confidence: ${context.intelligence.predictionConfidence}
- Adaptive Strategy: ${context.intelligence.adaptiveStrategy}`;
        }
        
        // Add request-type specific instructions
        systemMessage += `\n\nREQUEST TYPE: ${requestType.toUpperCase()}`;
        
        switch (requestType) {
            case 'market_analysis':
                systemMessage += `\nFocus on economic analysis, market dynamics, and financial insights using integrated market complexity data.`;
                break;
            case 'coding':
                systemMessage += `\nProvide technical implementation with consideration for agent behaviors and system integration.`;
                break;
            case 'agent_behavior':
                systemMessage += `\nAnalyze social dynamics, behavioral patterns, and agent interactions using society system data.`;
                break;
            case 'web_search':
                systemMessage += `\nProvide current information and indicate what should be verified with web searches.`;
                break;
            case 'reasoning':
                systemMessage += `\nApply advanced reasoning using all available system context and intelligence patterns.`;
                break;
            default:
                systemMessage += `\nProvide comprehensive responses utilizing all available system integrations.`;
        }
        
        systemMessage += `\n\nProvide intelligent, context-aware responses that leverage the full capability of integrated systems.`;
        
        return systemMessage;
    }
    
    /**
     * Enhance input with relevant context
     */
    enhanceInputWithContext(input, context) {
        let enhancedInput = input;
        
        // Add relevant context hints
        if (context.intelligence.similarRequests.length > 0) {
            enhancedInput += `\n\n[Context: Similar requests were processed recently with insights that may be relevant.]`;
        }
        
        if (context.intelligence.predictionConfidence > 0.8) {
            enhancedInput += `\n\n[Context: High confidence predictions available for this type of request.]`;
        }
        
        return enhancedInput;
    }
    
    /**
     * Post-process result with system integrations
     */
    async postProcessResult(result, context, requestId) {
        const enhancedResult = {
            ...result,
            requestId,
            timestamp: Date.now(),
            systemIntegrations: {},
            recommendations: []
        };
        
        // Add personality-based post-processing
        if (this.integrations.aiPersonality && result.success) {
            try {
                enhancedResult.systemIntegrations.personalityInsights = 
                    await this.integrations.aiPersonality.analyzeResponse(result.content);
            } catch (error) {
                console.warn('Personality post-processing failed:', error.message);
            }
        }
        
        // Add market complexity analysis
        if (this.integrations.marketComplexity && result.success) {
            try {
                enhancedResult.systemIntegrations.marketImplications = 
                    await this.integrations.marketComplexity.analyzeImplications(result.content);
            } catch (error) {
                console.warn('Market complexity post-processing failed:', error.message);
            }
        }
        
        // Add swarm coordination recommendations
        enhancedResult.recommendations = this.generateRecommendations(result, context);
        
        // Store for future learning
        this.storeRequestResult(requestId, enhancedResult, context);
        
        return enhancedResult;
    }
    
    /**
     * Generate intelligent recommendations
     */
    generateRecommendations(result, context) {
        const recommendations = [];
        
        // Performance recommendations
        if (result.responseTime > 20000) {
            recommendations.push({
                type: 'performance',
                suggestion: 'Consider using a faster model for time-sensitive requests',
                impact: 'Reduced response time'
            });
        }
        
        // Integration recommendations
        if (context.systemIntegrations.market && !result.content.includes('market')) {
            recommendations.push({
                type: 'integration',
                suggestion: 'Market context is available but not utilized in response',
                impact: 'Enhanced market-aware insights'
            });
        }
        
        // Learning recommendations
        if (context.intelligence.predictionConfidence < 0.5) {
            recommendations.push({
                type: 'learning',
                suggestion: 'Low prediction confidence - consider gathering more similar examples',
                impact: 'Improved future predictions'
            });
        }
        
        return recommendations;
    }
    
    /**
     * Update system learning and intelligence
     */
    async updateSystemLearning(input, result, context) {
        // Update contextual memory
        this.intelligence.contextualMemory.set(context.requestId, {
            input,
            result,
            context,
            timestamp: Date.now()
        });
        
        // Update learning patterns
        const pattern = this.extractLearningPattern(input, result, context);
        if (pattern) {
            const patternKey = pattern.type + ':' + pattern.category;
            this.intelligence.learningPatterns.set(patternKey, pattern);
        }
        
        // Update decision history
        this.intelligence.decisionHistory.push({
            requestId: context.requestId,
            input,
            decision: result.model,
            success: result.success,
            responseTime: result.responseTime,
            timestamp: Date.now()
        });
        
        // Keep limited history
        if (this.intelligence.decisionHistory.length > 1000) {
            this.intelligence.decisionHistory = this.intelligence.decisionHistory.slice(-1000);
        }
        
        // Update prediction accuracy
        if (context.intelligence.adaptiveStrategy) {
            const strategyKey = context.intelligence.adaptiveStrategy;
            const currentAccuracy = this.intelligence.predictionAccuracy.get(strategyKey) || 0.5;
            const newAccuracy = result.success ? 
                Math.min(1.0, currentAccuracy + 0.05) : 
                Math.max(0.0, currentAccuracy - 0.1);
            this.intelligence.predictionAccuracy.set(strategyKey, newAccuracy);
        }
    }
    
    /**
     * Extract learning patterns from requests
     */
    extractLearningPattern(input, result, context) {
        const requestType = context.requestType || 'general';
        
        return {
            type: requestType,
            category: this.categorizeInput(input),
            success: result.success,
            responseTime: result.responseTime,
            modelUsed: result.model,
            contextFactors: Object.keys(context.systemIntegrations || {}),
            timestamp: Date.now()
        };
    }
    
    /**
     * Categorize input for learning
     */
    categorizeInput(input) {
        const inputLower = input.toLowerCase();
        
        if (inputLower.includes('analyze') || inputLower.includes('analysis')) return 'analysis';
        if (inputLower.includes('predict') || inputLower.includes('forecast')) return 'prediction';
        if (inputLower.includes('optimize') || inputLower.includes('improve')) return 'optimization';
        if (inputLower.includes('strategy') || inputLower.includes('plan')) return 'strategy';
        if (inputLower.includes('implement') || inputLower.includes('build')) return 'implementation';
        if (inputLower.includes('explain') || inputLower.includes('understand')) return 'explanation';
        
        return 'general';
    }
    
    /**
     * Find similar requests for context
     */
    findSimilarRequests(input) {
        const similar = [];
        const inputWords = input.toLowerCase().split(' ');
        
        for (const [requestId, memory] of this.intelligence.contextualMemory) {
            const memoryWords = memory.input.toLowerCase().split(' ');
            const similarity = this.calculateSimilarity(inputWords, memoryWords);
            
            if (similarity > 0.3) { // 30% similarity threshold
                similar.push({
                    requestId,
                    similarity,
                    input: memory.input,
                    success: memory.result.success,
                    timestamp: memory.timestamp
                });
            }
        }
        
        return similar.sort((a, b) => b.similarity - a.similarity).slice(0, 5);
    }
    
    /**
     * Calculate text similarity
     */
    calculateSimilarity(words1, words2) {
        const set1 = new Set(words1);
        const set2 = new Set(words2);
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        
        return intersection.size / union.size;
    }
    
    /**
     * Get relevant learning patterns
     */
    getRelevantLearningPatterns(input) {
        const category = this.categorizeInput(input);
        const relevantPatterns = {};
        
        for (const [key, pattern] of this.intelligence.learningPatterns) {
            if (pattern.category === category || pattern.type === 'general') {
                relevantPatterns[key] = pattern;
            }
        }
        
        return relevantPatterns;
    }
    
    /**
     * Calculate prediction confidence
     */
    calculatePredictionConfidence(input) {
        const category = this.categorizeInput(input);
        const similarRequests = this.findSimilarRequests(input);
        
        if (similarRequests.length === 0) return 0.5; // Neutral confidence
        
        const successRate = similarRequests.filter(r => r.success).length / similarRequests.length;
        const avgSimilarity = similarRequests.reduce((sum, r) => sum + r.similarity, 0) / similarRequests.length;
        
        return (successRate + avgSimilarity) / 2;
    }
    
    /**
     * Select adaptive strategy
     */
    selectAdaptiveStrategy(input, context) {
        const category = this.categorizeInput(input);
        const confidence = this.calculatePredictionConfidence(input);
        
        // High confidence - use learned strategy
        if (confidence > 0.8) {
            return 'learned_optimal';
        }
        
        // Market context available - use market-aware strategy
        if (context.systemIntegrations?.market) {
            return 'market_aware';
        }
        
        // Social context available - use social-aware strategy
        if (context.systemIntegrations?.society) {
            return 'social_aware';
        }
        
        // Default to balanced approach
        return 'balanced';
    }
    
    /**
     * Handle system alerts
     */
    handleSystemAlert(alert) {
        console.warn(`[ORCHESTRATOR ALERT] ${alert.severity}: ${alert.message}`);
        
        // Take adaptive actions based on alert type
        switch (alert.id) {
            case 'high_error_rate':
                this.adaptToHighErrorRate();
                break;
            case 'rate_limit_approaching':
                this.adaptToRateLimit();
                break;
            case 'slow_response':
                this.adaptToSlowResponse();
                break;
            case 'model_failure':
                this.adaptToModelFailure();
                break;
        }
        
        this.emit('alertHandled', { alert, timestamp: Date.now() });
    }
    
    /**
     * Adaptive responses to system conditions
     */
    adaptToHighErrorRate() {
        // Prefer more reliable models
        this.intelligence.adaptiveStrategies.set('error_mitigation', {
            preferStableModels: true,
            increaseRetryAttempts: true,
            enhanceErrorHandling: true
        });
    }
    
    adaptToRateLimit() {
        // Optimize request frequency and batching
        this.intelligence.adaptiveStrategies.set('rate_optimization', {
            batchRequests: true,
            prioritizeHighValue: true,
            delayNonCritical: true
        });
    }
    
    adaptToSlowResponse() {
        // Prefer faster models for time-sensitive requests
        this.intelligence.adaptiveStrategies.set('speed_optimization', {
            preferFastModels: true,
            reduceContextSize: true,
            enableParallelProcessing: true
        });
    }
    
    adaptToModelFailure() {
        // Update model reliability scores
        this.intelligence.adaptiveStrategies.set('reliability_optimization', {
            updateModelScores: true,
            preferProvenModels: true,
            enhanceFallbackChain: true
        });
    }
    
    /**
     * Web search integration with enhanced AI
     */
    async performEnhancedWebSearch(query, context = {}) {
        const enhancedQuery = this.enhanceSearchQuery(query, context);
        
        const result = await this.openRouter.performWebSearch(enhancedQuery, {
            requestType: 'web_search',
            context: context
        });
        
        return {
            ...result,
            originalQuery: query,
            enhancedQuery: enhancedQuery,
            systemIntegrations: this.getRelevantIntegrations('web_search')
        };
    }
    
    /**
     * Enhance search query with system context
     */
    enhanceSearchQuery(query, context) {
        let enhancedQuery = query;
        
        // Add market context if relevant
        if (context.systemIntegrations?.market && 
            (query.includes('market') || query.includes('economic'))) {
            enhancedQuery += ` current market conditions economic indicators`;
        }
        
        // Add temporal context
        const currentYear = new Date().getFullYear();
        if (!query.includes(currentYear.toString())) {
            enhancedQuery += ` ${currentYear}`;
        }
        
        return enhancedQuery;
    }
    
    /**
     * Get system status with full integration overview
     */
    getSystemStatus() {
        const openRouterStatus = this.openRouter.getSystemStatus();
        const monitoringSummary = this.monitor.getMetricsSummary();
        
        return {
            ...openRouterStatus,
            orchestrator: {
                status: 'operational',
                integrations: {
                    aiPersonality: this.integrations.aiPersonality ? 'active' : 'unavailable',
                    marketComplexity: this.integrations.marketComplexity ? 'active' : 'unavailable',
                    agentSociety: this.integrations.agentSociety ? 'active' : 'unavailable',
                    swarmCoordination: 'active'
                },
                intelligence: {
                    contextualMemorySize: this.intelligence.contextualMemory.size,
                    learningPatternsCount: this.intelligence.learningPatterns.size,
                    decisionHistoryLength: this.intelligence.decisionHistory.length,
                    adaptiveStrategiesCount: this.intelligence.adaptiveStrategies.size
                }
            },
            monitoring: monitoringSummary,
            capabilities: [
                'Enhanced AI with system integration',
                'Market-aware intelligence',
                'Agent behavior analysis',
                'Swarm coordination',
                'Adaptive learning',
                'Performance optimization',
                'Real-time monitoring',
                'Web search integration'
            ]
        };
    }
    
    /**
     * Utility methods
     */
    generateRequestId() {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    getIntelligenceSummary() {
        return {
            memorySize: this.intelligence.contextualMemory.size,
            learningPatterns: this.intelligence.learningPatterns.size,
            averageConfidence: this.calculateAverageConfidence(),
            adaptiveStrategies: this.intelligence.adaptiveStrategies.size
        };
    }
    
    calculateAverageConfidence() {
        if (this.intelligence.predictionAccuracy.size === 0) return 0.5;
        
        const values = Array.from(this.intelligence.predictionAccuracy.values());
        return values.reduce((sum, val) => sum + val, 0) / values.length;
    }
    
    getRelevantIntegrations(requestType) {
        const relevant = {};
        
        if (this.integrations.aiPersonality) relevant.personality = 'active';
        if (this.integrations.marketComplexity) relevant.market = 'active';
        if (this.integrations.agentSociety) relevant.society = 'active';
        relevant.swarm = 'active';
        
        return relevant;
    }
    
    storeRequestResult(requestId, result, context) {
        // Store in memory for learning
        this.integrations.memory.set(requestId, {
            result,
            context,
            timestamp: Date.now()
        });
        
        // Cleanup old entries (keep last 1000)
        if (this.integrations.memory.size > 1000) {
            const entries = Array.from(this.integrations.memory.entries());
            const sorted = entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
            const toKeep = sorted.slice(-1000);
            
            this.integrations.memory.clear();
            toKeep.forEach(([key, value]) => {
                this.integrations.memory.set(key, value);
            });
        }
    }
    
    handleRequestFailure(error, input, context, requestId) {
        return {
            content: `Request failed: ${error.message}. The system will adapt and improve based on this feedback.`,
            model: 'error_fallback',
            usage: { total_tokens: 0, prompt_tokens: 0, completion_tokens: 0 },
            responseTime: 0,
            success: false,
            error: error.message,
            requestId,
            recommendations: [
                {
                    type: 'retry',
                    suggestion: 'Try the request again with simpler input',
                    impact: 'Higher success probability'
                }
            ]
        };
    }
    
    analyzePerformancePatterns(report) {
        // Implement performance pattern analysis
        const patterns = {
            successTrends: this.analyzeSuccessTrends(report),
            responseTimeTrends: this.analyzeResponseTimeTrends(report),
            modelPerformance: this.analyzeModelPerformance(report)
        };
        
        this.emit('performanceAnalysis', { patterns, timestamp: Date.now() });
    }
    
    analyzeSuccessTrends(report) {
        // Analyze success rate trends
        return {
            currentRate: report.requests.successRate,
            trend: 'stable', // Could be 'improving', 'declining', 'stable'
            prediction: report.requests.successRate // Simple prediction
        };
    }
    
    analyzeResponseTimeTrends(report) {
        // Analyze response time trends
        return {
            currentAverage: report.performance.responseTime.average,
            trend: 'stable',
            prediction: report.performance.responseTime.average
        };
    }
    
    analyzeModelPerformance(report) {
        // Analyze individual model performance
        return report.modelPerformance.map(model => ({
            ...model,
            trend: 'stable',
            recommendation: model.successRate > 0.8 ? 'maintain' : 'investigate'
        }));
    }
}

module.exports = OpenRouterOrchestrator;
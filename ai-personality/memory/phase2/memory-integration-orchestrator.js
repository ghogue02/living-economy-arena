/**
 * Phase 2 Memory Integration Orchestrator
 * Central system that coordinates all advanced memory components
 */

const EmotionalMemoryCore = require('./emotional-memory-core');
const ExperienceProcessor = require('./experience-processor');
const MemoryConsolidator = require('./memory-consolidator');
const MemoryDecayReinforcement = require('./memory-decay-reinforcement');
const EpisodicSemanticDifferentiation = require('./episodic-semantic-differentiation');
const ContextDependentRetrieval = require('./context-dependent-retrieval');
const AgentMemory = require('../agent-memory'); // Phase 1 base system

class MemoryIntegrationOrchestrator {
    constructor(agentId) {
        this.agentId = agentId;
        
        // Initialize all memory subsystems
        this.emotionalCore = new EmotionalMemoryCore(agentId);
        this.experienceProcessor = new ExperienceProcessor();
        this.memoryConsolidator = new MemoryConsolidator();
        this.decayReinforcement = new MemoryDecayReinforcement();
        this.episodicSemantic = new EpisodicSemanticDifferentiation();
        this.contextualRetrieval = new ContextDependentRetrieval();
        this.baseMemory = new AgentMemory(agentId); // Phase 1 compatibility
        
        // Integration parameters
        this.integrationConfig = {
            // Processing pipeline configuration
            enable_emotional_weighting: true,
            enable_experience_processing: true,
            enable_consolidation: true,
            enable_decay_reinforcement: true,
            enable_episodic_semantic: true,
            enable_contextual_retrieval: true,
            
            // Real-time processing thresholds
            immediate_processing_threshold: 70, // Significance score
            delayed_processing_threshold: 40,   // Batch processing threshold
            background_processing_threshold: 20, // Low priority processing
            
            // Memory system coordination
            cross_system_synchronization: true,
            memory_sharing_enabled: true,
            conflict_resolution_enabled: true,
            performance_monitoring: true,
            
            // Processing timing
            immediate_processing_timeout: 1000,  // 1 second
            batch_processing_interval: 60000,    // 1 minute
            background_processing_interval: 300000, // 5 minutes
            
            // Quality control
            memory_validation_enabled: true,
            false_memory_detection: true,
            consistency_checking: true,
            confidence_tracking: true
        };
        
        // Processing queues
        this.processingQueues = {
            immediate: [],
            delayed: [],
            background: [],
            reinforcement: [],
            consolidation: []
        };
        
        // System state
        this.systemState = {
            processing_active: false,
            last_consolidation: Date.now(),
            last_reinforcement_check: Date.now(),
            memory_health_score: 100,
            system_load: 0,
            error_count: 0
        };
        
        // Performance metrics
        this.performanceMetrics = {
            total_memories_processed: 0,
            avg_processing_time: 0,
            memory_quality_score: 0,
            retrieval_success_rate: 0,
            consolidation_efficiency: 0,
            emotional_accuracy: 0
        };
        
        // Integration workflows
        this.workflows = {
            new_experience: this.createNewExperienceWorkflow(),
            memory_retrieval: this.createMemoryRetrievalWorkflow(),
            memory_reinforcement: this.createReinforcementWorkflow(),
            system_maintenance: this.createMaintenanceWorkflow()
        };
        
        // Start background processes
        this.initializeBackgroundProcesses();
    }
    
    // Main integration interface - process new experience
    async processNewExperience(rawExperience, emotionalContext, options = {}) {
        const processingSession = {
            session_id: this.generateSessionId(),
            timestamp: Date.now(),
            raw_experience: rawExperience,
            emotional_context: emotionalContext,
            options: { ...this.integrationConfig, ...options },
            stages: {},
            results: {},
            performance: {}
        };
        
        try {
            this.systemState.processing_active = true;
            
            // Stage 1: Initial triage and classification
            processingSession.stages.triage = await this.triageExperience(
                rawExperience, 
                emotionalContext
            );
            
            // Stage 2: Emotional encoding (if enabled)
            if (this.integrationConfig.enable_emotional_weighting) {
                processingSession.stages.emotional_encoding = await this.emotionalCore.encodeExperience(
                    rawExperience, 
                    emotionalContext
                );
            }
            
            // Stage 3: Experience processing (if enabled)
            if (this.integrationConfig.enable_experience_processing) {
                processingSession.stages.experience_processing = await this.experienceProcessor.processExperience(
                    rawExperience, 
                    this.getAllExistingMemories()
                );
            }
            
            // Stage 4: Memory type differentiation (if enabled)
            if (this.integrationConfig.enable_episodic_semantic) {
                processingSession.stages.type_differentiation = await this.episodicSemantic.processMemoryDifferentiation([
                    processingSession.stages.emotional_encoding || rawExperience
                ]);
            }
            
            // Stage 5: Integration with Phase 1 system
            processingSession.stages.phase1_integration = await this.integrateWithPhase1(
                processingSession.stages.emotional_encoding || rawExperience,
                emotionalContext
            );
            
            // Stage 6: Determine processing priority and route
            const processingPriority = this.determineProcessingPriority(processingSession);
            processingSession.priority = processingPriority;
            
            // Stage 7: Route to appropriate processing queue
            await this.routeToProcessingQueue(processingSession, processingPriority);
            
            // Stage 8: Immediate processing if high priority
            if (processingPriority === 'immediate') {
                processingSession.stages.immediate_consolidation = await this.executeImmediateConsolidation(
                    processingSession
                );
            }
            
            // Update system metrics
            this.updateSystemMetrics(processingSession);
            
            processingSession.status = 'completed';
            processingSession.results = this.extractProcessingResults(processingSession);
            
        } catch (error) {
            processingSession.status = 'failed';
            processingSession.error = error.message;
            this.systemState.error_count++;
        } finally {
            this.systemState.processing_active = false;
        }
        
        return processingSession.results;
    }
    
    // Main retrieval interface
    async retrieveMemories(retrievalContext, options = {}) {
        const retrievalSession = {
            session_id: this.generateSessionId(),
            timestamp: Date.now(),
            retrieval_context: retrievalContext,
            options: { ...this.integrationConfig, ...options },
            results: {}
        };
        
        try {
            // Use contextual retrieval system
            if (this.integrationConfig.enable_contextual_retrieval) {
                retrievalSession.results.contextual_memories = await this.contextualRetrieval.retrieveMemories(
                    retrievalContext,
                    this.createMemoryStore(),
                    options
                );
            }
            
            // Fallback to Phase 1 retrieval
            retrievalSession.results.phase1_memories = this.baseMemory.getRelevantMemories(
                retrievalContext,
                options.limit || 10
            );
            
            // Combine and deduplicate results
            retrievalSession.results.combined_memories = this.combineRetrievalResults(
                retrievalSession.results.contextual_memories || [],
                retrievalSession.results.phase1_memories || []
            );
            
            // Apply post-retrieval processing
            retrievalSession.results.final_memories = await this.applyPostRetrievalProcessing(
                retrievalSession.results.combined_memories,
                retrievalContext
            );
            
            // Update access counts and reinforcement schedules
            this.updateMemoryAccess(retrievalSession.results.final_memories);
            
        } catch (error) {
            retrievalSession.error = error.message;
            retrievalSession.results.final_memories = [];
        }
        
        return retrievalSession.results.final_memories;
    }
    
    // System maintenance and optimization
    async performSystemMaintenance() {
        const maintenanceSession = {
            session_id: this.generateSessionId(),
            timestamp: Date.now(),
            maintenance_type: 'full_system',
            tasks: {},
            results: {}
        };
        
        try {
            // Memory consolidation
            if (this.shouldPerformConsolidation()) {
                maintenanceSession.tasks.consolidation = await this.performMemoryConsolidation();
            }
            
            // Decay and reinforcement processing
            if (this.shouldPerformReinforcementCheck()) {
                maintenanceSession.tasks.reinforcement = await this.performDecayReinforcementCheck();
            }
            
            // System health assessment
            maintenanceSession.tasks.health_assessment = await this.assessSystemHealth();
            
            // Memory validation and cleanup
            maintenanceSession.tasks.validation = await this.performMemoryValidation();
            
            // Performance optimization
            maintenanceSession.tasks.optimization = await this.optimizeSystemPerformance();
            
            maintenanceSession.status = 'completed';
            
        } catch (error) {
            maintenanceSession.status = 'failed';
            maintenanceSession.error = error.message;
        }
        
        return maintenanceSession;
    }
    
    // Experience triage and classification
    async triageExperience(rawExperience, emotionalContext) {
        const triage = {
            significance_score: this.calculateSignificanceScore(rawExperience, emotionalContext),
            emotional_intensity: emotionalContext.intensity || 0,
            processing_urgency: 'normal',
            memory_type_prediction: 'episodic',
            expected_processing_time: 0,
            requires_immediate_attention: false
        };
        
        // Determine processing urgency
        if (triage.significance_score >= this.integrationConfig.immediate_processing_threshold) {
            triage.processing_urgency = 'immediate';
            triage.requires_immediate_attention = true;
        } else if (triage.significance_score >= this.integrationConfig.delayed_processing_threshold) {
            triage.processing_urgency = 'delayed';
        } else {
            triage.processing_urgency = 'background';
        }
        
        // Predict memory type
        triage.memory_type_prediction = this.predictMemoryType(rawExperience);
        
        // Estimate processing time
        triage.expected_processing_time = this.estimateProcessingTime(rawExperience, triage);
        
        return triage;
    }
    
    calculateSignificanceScore(rawExperience, emotionalContext) {
        let significance = 50; // Base significance
        
        // Emotional impact contribution
        if (emotionalContext.intensity) {
            significance += emotionalContext.intensity * 0.3;
        }
        
        // Novelty contribution
        if (rawExperience.is_novel) {
            significance += 20;
        }
        
        // Goal relevance contribution
        if (rawExperience.goal_relevance > 70) {
            significance += 15;
        }
        
        // Outcome unexpectedness
        if (rawExperience.unexpectedness > 80) {
            significance += 25;
        }
        
        // Social significance
        if (rawExperience.social_impact > 50) {
            significance += 10;
        }
        
        return Math.min(100, significance);
    }
    
    // Integration with Phase 1 system
    async integrateWithPhase1(processedExperience, emotionalContext) {
        const integration = {
            phase1_memory_id: null,
            trade_experience: false,
            relationship_update: false,
            pattern_learning: false
        };
        
        // Check if this is a trading experience
        if (this.isTradingExperience(processedExperience)) {
            integration.trade_experience = true;
            integration.phase1_memory_id = this.baseMemory.recordTradeExperience(
                processedExperience.data,
                processedExperience.outcome,
                emotionalContext.intensity
            );
        }
        
        // Check if this affects relationships
        if (this.affectsRelationships(processedExperience)) {
            integration.relationship_update = true;
            this.updateRelationshipMemory(processedExperience);
        }
        
        // Check if this provides market learning
        if (this.providesMarketLearning(processedExperience)) {
            integration.pattern_learning = true;
            this.updateMarketPatterns(processedExperience);
        }
        
        return integration;
    }
    
    // Processing queue management
    async routeToProcessingQueue(processingSession, priority) {
        const queueItem = {
            session: processingSession,
            priority: priority,
            queued_at: Date.now(),
            estimated_processing_time: processingSession.stages.triage.expected_processing_time
        };
        
        switch (priority) {
            case 'immediate':
                this.processingQueues.immediate.push(queueItem);
                break;
            case 'delayed':
                this.processingQueues.delayed.push(queueItem);
                break;
            case 'background':
                this.processingQueues.background.push(queueItem);
                break;
        }
        
        // Sort queues by priority/timestamp
        this.sortProcessingQueues();
    }
    
    // Memory consolidation
    async performMemoryConsolidation() {
        const consolidationCandidates = this.identifyConsolidationCandidates();
        
        if (consolidationCandidates.length === 0) {
            return { status: 'no_candidates', consolidated_count: 0 };
        }
        
        const consolidationResult = await this.memoryConsolidator.consolidateMemories(
            consolidationCandidates,
            this.getAllExistingMemories()
        );
        
        this.systemState.last_consolidation = Date.now();
        
        return {
            status: 'completed',
            consolidated_count: consolidationResult.length,
            consolidation_details: consolidationResult
        };
    }
    
    // Decay and reinforcement processing
    async performDecayReinforcementCheck() {
        const allMemories = this.getAllExistingMemories();
        const timeElapsed = Date.now() - this.systemState.last_reinforcement_check;
        
        const reinforcementResult = await this.decayReinforcement.processMemoryDecayReinforcement(
            allMemories,
            timeElapsed
        );
        
        // Schedule reinforcement sessions
        for (const opportunity of reinforcementResult.reinforcement_opportunities) {
            this.scheduleReinforcementSession(opportunity);
        }
        
        this.systemState.last_reinforcement_check = Date.now();
        
        return {
            status: 'completed',
            memories_processed: allMemories.length,
            reinforcement_opportunities: reinforcementResult.reinforcement_opportunities.length,
            decay_analysis: reinforcementResult.decay_analysis
        };
    }
    
    // System health assessment
    async assessSystemHealth() {
        const healthMetrics = {
            memory_count: this.getTotalMemoryCount(),
            avg_memory_strength: this.calculateAverageMemoryStrength(),
            consolidation_health: this.assessConsolidationHealth(),
            retrieval_performance: this.assessRetrievalPerformance(),
            emotional_processing_accuracy: this.assessEmotionalProcessingAccuracy(),
            system_load: this.calculateSystemLoad(),
            error_rate: this.calculateErrorRate()
        };
        
        // Calculate overall health score
        const healthScore = this.calculateOverallHealthScore(healthMetrics);
        this.systemState.memory_health_score = healthScore;
        
        return {
            health_score: healthScore,
            metrics: healthMetrics,
            recommendations: this.generateHealthRecommendations(healthMetrics)
        };
    }
    
    // Background processing initialization
    initializeBackgroundProcesses() {
        // Batch processing interval
        setInterval(() => {
            this.processBatchQueue();
        }, this.integrationConfig.batch_processing_interval);
        
        // Background processing interval
        setInterval(() => {
            this.processBackgroundQueue();
        }, this.integrationConfig.background_processing_interval);
        
        // System maintenance interval
        setInterval(() => {
            this.performSystemMaintenance();
        }, 24 * 60 * 60 * 1000); // Daily maintenance
    }
    
    // Utility methods
    generateSessionId() {
        return `mem_int_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    getAllExistingMemories() {
        // Combine memories from all systems
        const phase1Memories = this.baseMemory.experiences || [];
        const emotionalMemories = this.emotionalCore.getEmotionalMemoryStats();
        // Add other memory sources as needed
        
        return [...phase1Memories];
    }
    
    createMemoryStore() {
        // Create unified memory store interface
        return {
            getAllMemories: () => this.getAllExistingMemories(),
            getMemory: (id) => this.findMemoryById(id)
        };
    }
    
    determineProcessingPriority(processingSession) {
        const significance = processingSession.stages.triage.significance_score;
        
        if (significance >= this.integrationConfig.immediate_processing_threshold) {
            return 'immediate';
        } else if (significance >= this.integrationConfig.delayed_processing_threshold) {
            return 'delayed';
        } else {
            return 'background';
        }
    }
    
    // Memory sharing for agent communication
    async shareMemoryWithAgent(targetAgentId, memoryIds, sharingContext) {
        const sharingSession = {
            source_agent: this.agentId,
            target_agent: targetAgentId,
            memory_ids: memoryIds,
            sharing_context: sharingContext,
            timestamp: Date.now()
        };
        
        // Prepare memories for sharing
        const sharableMemories = this.prepareMemoriesForSharing(memoryIds, sharingContext);
        
        // Apply privacy and security filters
        const filteredMemories = this.applyPrivacyFilters(sharableMemories, targetAgentId);
        
        return {
            sharing_session: sharingSession,
            shared_memories: filteredMemories,
            sharing_success: true
        };
    }
    
    // Decision making integration
    async getMemoriesForDecision(decisionContext, options = {}) {
        // Retrieve relevant memories for decision making
        const relevantMemories = await this.retrieveMemories(decisionContext, options);
        
        // Extract decision-relevant insights
        const decisionInsights = this.extractDecisionInsights(relevantMemories, decisionContext);
        
        // Generate decision support information
        const decisionSupport = this.generateDecisionSupport(decisionInsights, decisionContext);
        
        return {
            relevant_memories: relevantMemories,
            decision_insights: decisionInsights,
            decision_support: decisionSupport,
            confidence_level: this.calculateDecisionConfidence(decisionSupport)
        };
    }
    
    // Public interface for getting system statistics
    getSystemStats() {
        return {
            agent_id: this.agentId,
            system_health: this.systemState.memory_health_score,
            total_memories: this.getTotalMemoryCount(),
            performance_metrics: { ...this.performanceMetrics },
            processing_queue_sizes: {
                immediate: this.processingQueues.immediate.length,
                delayed: this.processingQueues.delayed.length,
                background: this.processingQueues.background.length
            },
            subsystem_stats: {
                emotional_core: this.emotionalCore.getEmotionalMemoryStats(),
                experience_processor: this.experienceProcessor.getProcessingStats(),
                consolidator: this.memoryConsolidator.getConsolidationStats(),
                decay_reinforcement: this.decayReinforcement.getDecayReinorcementStats(),
                episodic_semantic: this.episodicSemantic.getSystemStats(),
                contextual_retrieval: this.contextualRetrieval.getRetrievalStats(),
                phase1_base: this.baseMemory.getMemoryStats()
            }
        };
    }
}

module.exports = MemoryIntegrationOrchestrator;
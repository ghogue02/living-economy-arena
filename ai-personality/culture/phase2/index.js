/**
 * Phase 2 Cultural Intelligence System - Main Entry Point
 * Comprehensive cultural intelligence with 20+ dimensions, adaptive learning, and system integration
 * 
 * Features:
 * - Cultural Intelligence System: 20+ cultural dimensions, backgrounds, value systems
 * - Cultural Learning & Acculturation: Adaptation stages, stress management, competency development
 * - Cultural Communication Patterns: Cross-cultural communication, style adaptation, conflict resolution
 * - Integration Orchestrator: Coordinates all systems with personality, society, and economic systems
 * 
 * Export Structure:
 * - Main orchestrator for full integration
 * - Individual systems for modular use
 * - Utility functions and configuration helpers
 * - Performance monitoring and analytics
 */

const CulturalIntegrationOrchestrator = require('./cultural-integration-orchestrator');
const CulturalIntelligenceSystem = require('./cultural-intelligence-system');
const CulturalLearningAcculturationSystem = require('./cultural-learning-acculturation');
const CulturalCommunicationPatternsSystem = require('./cultural-communication-patterns');

/**
 * Phase 2 Cultural Intelligence System
 * Main class for comprehensive cultural intelligence integration
 */
class Phase2CulturalIntelligenceSystem {
    constructor(config = {}) {
        this.config = {
            // System configuration
            enableFullIntegration: config.enableFullIntegration !== false, // Default true
            enablePerformanceMonitoring: config.enablePerformanceMonitoring !== false,
            enablePopulationDynamics: config.enablePopulationDynamics !== false,
            
            // Subsystem configurations
            culturalIntelligence: config.culturalIntelligence || {},
            culturalLearning: config.culturalLearning || {},
            culturalCommunication: config.culturalCommunication || {},
            integration: config.integration || {},
            
            // Performance and optimization
            optimizationLevel: config.optimizationLevel || 'balanced', // 'performance', 'balanced', 'comprehensive'
            realTimeProcessing: config.realTimeProcessing !== false,
            batchProcessingSize: config.batchProcessingSize || 100,
            
            ...config
        };

        // Initialize based on configuration
        if (this.config.enableFullIntegration) {
            this.orchestrator = new CulturalIntegrationOrchestrator(this.config.integration);
            this.culturalIntelligence = this.orchestrator.culturalIntelligenceSystem;
            this.culturalLearning = this.orchestrator.culturalLearningSystem;
            this.culturalCommunication = this.orchestrator.culturalCommunicationSystem;
        } else {
            // Initialize individual systems
            this.culturalIntelligence = new CulturalIntelligenceSystem(this.config.culturalIntelligence);
            this.culturalLearning = new CulturalLearningAcculturationSystem(this.config.culturalLearning);
            this.culturalCommunication = new CulturalCommunicationPatternsSystem(this.config.culturalCommunication);
            this.orchestrator = null;
        }

        this.systemMetrics = {
            initialization_time: Date.now(),
            agents_registered: 0,
            cultural_events_processed: 0,
            interactions_processed: 0,
            performance_data: []
        };
    }

    /**
     * Register an agent with full cultural intelligence system
     * @param {string} agentId - Unique agent identifier
     * @param {object} personalityDNA - Personality DNA object from enhanced personality system
     * @param {object} options - Cultural profile options
     * @returns {object} Integrated cultural profile
     */
    registerAgent(agentId, personalityDNA, options = {}) {
        const startTime = Date.now();
        
        try {
            let culturalProfile;
            
            if (this.orchestrator) {
                // Full integration with orchestrator
                culturalProfile = this.orchestrator.registerAgentWithCulturalIntelligence(
                    agentId, personalityDNA, options
                );
            } else {
                // Individual system registration
                const cultureAgent = this.culturalIntelligence.registerAgent(agentId, options.culturalOptions);
                const learningAgent = this.culturalLearning.registerAgent(
                    agentId, cultureAgent.cultural_profile, options.targetCulture
                );
                const communicationAgent = this.culturalCommunication.generateAgentCommunicationProfile(
                    agentId, cultureAgent.cultural_profile
                );
                
                culturalProfile = {
                    agent_id: agentId,
                    cultural_intelligence_profile: cultureAgent.cultural_profile,
                    learning_profile: learningAgent,
                    communication_profile: communicationAgent,
                    registration_timestamp: Date.now()
                };
            }
            
            this.systemMetrics.agents_registered++;
            this.systemMetrics.performance_data.push({
                operation: 'agent_registration',
                duration: Date.now() - startTime,
                timestamp: Date.now()
            });
            
            return culturalProfile;
            
        } catch (error) {
            console.error(`Error registering agent ${agentId} with cultural intelligence:`, error);
            throw error;
        }
    }

    /**
     * Process a cross-cultural interaction between agents
     * @param {string} agentId1 - First agent ID
     * @param {string} agentId2 - Second agent ID
     * @param {object} context - Interaction context
     * @returns {object} Interaction outcome and analysis
     */
    processCrossCulturalInteraction(agentId1, agentId2, context = {}) {
        const startTime = Date.now();
        
        try {
            let interaction;
            
            if (this.orchestrator) {
                interaction = this.orchestrator.orchestrateCrossCulturalInteraction(agentId1, agentId2);
            } else {
                interaction = this.culturalCommunication.processCrossCulturalInteraction(
                    agentId1, agentId2, context
                );
            }
            
            this.systemMetrics.interactions_processed++;
            this.systemMetrics.performance_data.push({
                operation: 'cross_cultural_interaction',
                duration: Date.now() - startTime,
                timestamp: Date.now()
            });
            
            return interaction;
            
        } catch (error) {
            console.error(`Error processing cross-cultural interaction:`, error);
            throw error;
        }
    }

    /**
     * Trigger a cultural event affecting the population
     * @param {string} eventType - Type of cultural event
     * @param {object} options - Event configuration options
     * @returns {object} Cultural event details and effects
     */
    triggerCulturalEvent(eventType, options = {}) {
        const startTime = Date.now();
        
        try {
            const event = this.culturalIntelligence.triggerCulturalEvent(eventType, options);
            
            this.systemMetrics.cultural_events_processed++;
            this.systemMetrics.performance_data.push({
                operation: 'cultural_event',
                duration: Date.now() - startTime,
                timestamp: Date.now()
            });
            
            return event;
            
        } catch (error) {
            console.error(`Error triggering cultural event:`, error);
            throw error;
        }
    }

    /**
     * Get comprehensive cultural intelligence report
     * @returns {object} System-wide cultural intelligence analytics
     */
    getCulturalIntelligenceReport() {
        if (this.orchestrator) {
            return this.orchestrator.getCulturalIntegrationReport();
        } else {
            return {
                cultural_intelligence: this.culturalIntelligence.getCulturalIntelligenceReport(),
                cultural_learning: this.culturalLearning.getCulturalLearningReport(),
                cultural_communication: this.culturalCommunication.getCommunicationAnalyticsReport(),
                system_metrics: this.systemMetrics
            };
        }
    }

    /**
     * Get agent-specific cultural profile and analytics
     * @param {string} agentId - Agent identifier
     * @returns {object} Detailed agent cultural profile
     */
    getAgentCulturalProfile(agentId) {
        if (this.orchestrator) {
            return this.orchestrator.getAgentCulturalProfile(agentId);
        } else {
            return {
                cultural_intelligence: this.culturalIntelligence.getAgentCulturalProfile(agentId),
                learning_profile: this.culturalLearning.getCulturalLearningReport(agentId),
                communication_profile: this.culturalCommunication.agentCommunicationProfiles.get(agentId)
            };
        }
    }

    /**
     * Update agent cultural experience (learning from events)
     * @param {string} agentId - Agent identifier
     * @param {object} experience - Cultural experience data
     * @returns {object} Updated cultural profile
     */
    updateAgentCulturalExperience(agentId, experience) {
        if (this.orchestrator) {
            return this.orchestrator.updateAgentCulturalExperience(agentId, experience);
        } else {
            // Apply experience to individual systems
            // This would require more complex coordination without orchestrator
            throw new Error('Cultural experience updates require full integration mode');
        }
    }

    /**
     * Integrate with other AI systems
     * @param {object} personalitySystem - Enhanced personality system
     * @param {object} agentSocietySystem - Agent society system
     * @param {object} economicSystem - Economic system
     */
    integrateWithSystems(personalitySystem, agentSocietySystem, economicSystem) {
        if (!this.orchestrator) {
            throw new Error('System integration requires full integration mode');
        }
        
        if (personalitySystem) {
            this.orchestrator.integrateWithPersonalitySystem(personalitySystem);
        }
        
        if (agentSocietySystem) {
            this.orchestrator.integrateWithAgentSocietySystem(agentSocietySystem);
        }
        
        if (economicSystem) {
            this.orchestrator.integrateWithEconomicSystem(economicSystem);
        }
    }

    /**
     * Get system performance metrics
     * @returns {object} Performance and efficiency metrics
     */
    getPerformanceMetrics() {
        const recentPerformance = this.systemMetrics.performance_data.slice(-100);
        
        return {
            system_metrics: this.systemMetrics,
            recent_performance: recentPerformance,
            average_operation_times: this.calculateAverageOperationTimes(recentPerformance),
            system_efficiency: this.calculateSystemEfficiency(),
            orchestrator_metrics: this.orchestrator ? this.orchestrator.calculatePerformanceMetrics() : null
        };
    }

    calculateAverageOperationTimes(performanceData) {
        const operations = {};
        
        performanceData.forEach(data => {
            if (!operations[data.operation]) {
                operations[data.operation] = [];
            }
            operations[data.operation].push(data.duration);
        });
        
        const averages = {};
        Object.keys(operations).forEach(operation => {
            const times = operations[operation];
            averages[operation] = times.reduce((sum, time) => sum + time, 0) / times.length;
        });
        
        return averages;
    }

    calculateSystemEfficiency() {
        const recentPerformance = this.systemMetrics.performance_data.slice(-50);
        if (recentPerformance.length === 0) return 1;
        
        const avgDuration = recentPerformance.reduce((sum, data) => sum + data.duration, 0) / recentPerformance.length;
        const targetDuration = 100; // 100ms target
        
        return Math.max(0, Math.min(1, targetDuration / avgDuration));
    }

    /**
     * Cleanup and shutdown system
     */
    cleanup() {
        if (this.orchestrator) {
            this.orchestrator.cleanup();
        } else {
            this.culturalIntelligence.cleanup();
            this.culturalLearning.cleanup();
            this.culturalCommunication.cleanup();
        }
    }
}

/**
 * Utility Functions
 */
const CulturalUtilities = {
    /**
     * Calculate cultural distance between two cultural profiles
     * @param {object} profile1 - First cultural profile
     * @param {object} profile2 - Second cultural profile
     * @returns {number} Cultural distance (0-1)
     */
    calculateCulturalDistance(profile1, profile2) {
        if (!profile1.cultural_dimensions || !profile2.cultural_dimensions) return 0;
        
        const dims1 = profile1.cultural_dimensions;
        const dims2 = profile2.cultural_dimensions;
        const dimensions = Object.keys(dims1);
        
        let totalDistance = 0;
        let validDimensions = 0;
        
        dimensions.forEach(dimension => {
            if (dims2[dimension] !== undefined) {
                totalDistance += Math.abs(dims1[dimension] - dims2[dimension]);
                validDimensions++;
            }
        });
        
        return validDimensions > 0 ? totalDistance / (validDimensions * 100) : 0;
    },

    /**
     * Generate cultural compatibility score
     * @param {object} profile1 - First cultural profile
     * @param {object} profile2 - Second cultural profile
     * @returns {number} Compatibility score (0-100)
     */
    calculateCulturalCompatibility(profile1, profile2) {
        const distance = this.calculateCulturalDistance(profile1, profile2);
        return Math.round((1 - distance) * 100);
    },

    /**
     * Recommend cultural adaptation strategies
     * @param {object} sourceCulture - Source cultural profile
     * @param {object} targetCulture - Target cultural profile
     * @returns {array} Array of adaptation strategies
     */
    recommendAdaptationStrategies(sourceCulture, targetCulture) {
        const strategies = [];
        const distance = this.calculateCulturalDistance(sourceCulture, targetCulture);
        
        if (distance > 0.7) {
            strategies.push('comprehensive_cultural_training');
            strategies.push('cultural_mentor_assignment');
            strategies.push('gradual_exposure_program');
        } else if (distance > 0.4) {
            strategies.push('targeted_skill_development');
            strategies.push('cultural_awareness_workshops');
        } else {
            strategies.push('peer_observation_learning');
            strategies.push('informal_cultural_exchange');
        }
        
        return strategies;
    },

    /**
     * Create cultural background templates for quick agent setup
     */
    getCulturalBackgroundTemplates() {
        return {
            western_individualistic: {
                individualism_collectivism: 75,
                power_distance: 35,
                uncertainty_avoidance: 45,
                direct_indirect_communication: 80
            },
            eastern_collectivistic: {
                individualism_collectivism: 25,
                power_distance: 70,
                long_term_orientation: 80,
                respect_for_age: 85
            },
            scandinavian_egalitarian: {
                hierarchy_egalitarianism: 85,
                social_justice_orientation: 90,
                environmental_concern: 85,
                gender_role_flexibility: 90
            },
            mediterranean_relationship_focused: {
                family_orientation: 85,
                relationship_first_approach: 90,
                emotional_expressiveness: 75,
                personal_trust_importance: 90
            }
        };
    }
};

/**
 * Configuration Helpers
 */
const ConfigurationHelpers = {
    /**
     * Create optimized configuration for different use cases
     */
    createPerformanceOptimizedConfig() {
        return {
            enableFullIntegration: true,
            optimizationLevel: 'performance',
            realTimeProcessing: false,
            batchProcessingSize: 500,
            culturalIntelligence: {
                culturalEvolutionRate: 0.01,
                diversityTarget: 0.6
            },
            culturalLearning: {
                learningRateBase: 0.015,
                adaptationStressThreshold: 70
            },
            integration: {
                personalityIntegrationStrength: 0.6,
                populationCulturalDynamics: true
            }
        };
    },

    createComprehensiveConfig() {
        return {
            enableFullIntegration: true,
            optimizationLevel: 'comprehensive',
            realTimeProcessing: true,
            culturalIntelligence: {
                culturalEvolutionRate: 0.02,
                diversityTarget: 0.8,
                homogenizationResistance: 0.9
            },
            culturalLearning: {
                learningRateBase: 0.025,
                adaptationStressThreshold: 50,
                culturalShockIntensity: 1.0
            },
            culturalCommunication: {
                adaptationRate: 0.03,
                miscommunicationThreshold: 0.5
            },
            integration: {
                personalityIntegrationStrength: 0.8,
                economicBehaviorIntegration: 0.7,
                crossCulturalInteractionRate: 0.4
            }
        };
    },

    createMinimalConfig() {
        return {
            enableFullIntegration: false,
            optimizationLevel: 'performance',
            enablePerformanceMonitoring: false,
            enablePopulationDynamics: false
        };
    }
};

// Export everything
module.exports = {
    // Main system
    Phase2CulturalIntelligenceSystem,
    
    // Individual systems for modular use
    CulturalIntelligenceSystem,
    CulturalLearningAcculturationSystem,
    CulturalCommunicationPatternsSystem,
    CulturalIntegrationOrchestrator,
    
    // Utilities
    CulturalUtilities,
    ConfigurationHelpers,
    
    // Quick access factory functions
    createCulturalIntelligenceSystem: (config) => new Phase2CulturalIntelligenceSystem(config),
    createPerformanceOptimizedSystem: () => new Phase2CulturalIntelligenceSystem(
        ConfigurationHelpers.createPerformanceOptimizedConfig()
    ),
    createComprehensiveSystem: () => new Phase2CulturalIntelligenceSystem(
        ConfigurationHelpers.createComprehensiveConfig()
    ),
    createMinimalSystem: () => new Phase2CulturalIntelligenceSystem(
        ConfigurationHelpers.createMinimalConfig()
    )
};
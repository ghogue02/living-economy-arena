/**
 * Phase 2 Cultural Intelligence System - Integration Example
 * Demonstrates comprehensive integration with enhanced personality system,
 * agent society, and economic systems for realistic cultural modeling
 * 
 * This example shows:
 * - Agent registration with cultural intelligence
 * - Cross-cultural interactions and learning
 * - Cultural event processing and population effects
 * - System integration and coordination
 * - Performance monitoring and optimization
 */

const { Phase2CulturalIntelligenceSystem, CulturalUtilities } = require('./index');
const PersonalityDNA = require('../core/personality-dna');

class CulturalIntelligenceIntegrationExample {
    constructor() {
        this.culturalSystem = null;
        this.agents = new Map();
        this.interactions = [];
        this.culturalEvents = [];
        
        console.log('🧠 Phase 2 Cultural Intelligence Integration Example');
        console.log('====================================================');
    }

    async runCompleteExample() {
        try {
            console.log('\n🚀 1. Initializing Cultural Intelligence System...');
            await this.initializeCulturalSystem();
            
            console.log('\n👥 2. Creating Diverse Agent Population...');
            await this.createDiverseAgentPopulation();
            
            console.log('\n🌍 3. Processing Cross-Cultural Interactions...');
            await this.processCrossCulturalInteractions();
            
            console.log('\n🎭 4. Triggering Cultural Events...');
            await this.triggerCulturalEvents();
            
            console.log('\n📚 5. Demonstrating Cultural Learning...');
            await this.demonstrateCulturalLearning();
            
            console.log('\n🔗 6. System Integration Examples...');
            await this.demonstrateSystemIntegration();
            
            console.log('\n📊 7. Analytics and Reporting...');
            await this.generateAnalyticsReports();
            
            console.log('\n✅ Integration Example Complete!');
            
        } catch (error) {
            console.error('❌ Error in integration example:', error);
        }
    }

    async initializeCulturalSystem() {
        // Create comprehensive cultural intelligence system
        this.culturalSystem = new Phase2CulturalIntelligenceSystem({
            enableFullIntegration: true,
            enablePopulationDynamics: true,
            optimizationLevel: 'comprehensive',
            
            culturalIntelligence: {
                culturalEvolutionRate: 0.025,
                diversityTarget: 0.8,
                homogenizationResistance: 0.9,
                culturalEventFrequency: 0.15
            },
            
            culturalLearning: {
                learningRateBase: 0.03,
                adaptationStressThreshold: 50,
                culturalShockIntensity: 1.0,
                resilienceRecoveryRate: 0.06
            },
            
            culturalCommunication: {
                adaptationRate: 0.025,
                miscommunicationThreshold: 0.5,
                competencyDevelopmentRate: 0.015
            },
            
            integration: {
                personalityIntegrationStrength: 0.8,
                economicBehaviorIntegration: 0.7,
                crossCulturalInteractionRate: 0.4,
                realTimeProcessing: true
            }
        });

        console.log('   ✅ Cultural Intelligence System initialized');
        console.log('   📊 Systems active: Cultural Intelligence, Learning, Communication, Integration');
    }

    async createDiverseAgentPopulation() {
        const culturalBackgrounds = [
            'western_individualistic',
            'eastern_collectivistic', 
            'scandinavian_egalitarian',
            'latin_mediterranean',
            'middle_eastern_traditional',
            'african_communalistic'
        ];

        const generationBirthYears = {
            'baby_boomers': 1955,
            'generation_x': 1972,
            'millennials': 1988,
            'generation_z': 2005
        };

        // Create 24 agents with diverse cultural backgrounds
        for (let i = 0; i < 24; i++) {
            const agentId = `agent_${String(i + 1).padStart(3, '0')}`;
            
            // Create personality DNA
            const personalityDNA = new PersonalityDNA();
            
            // Select cultural background and generation
            const culturalBackground = culturalBackgrounds[i % culturalBackgrounds.length];
            const generationKeys = Object.keys(generationBirthYears);
            const generation = generationKeys[Math.floor(i / 6) % generationKeys.length];
            const birthYear = generationBirthYears[generation] + Math.floor(Math.random() * 10);
            
            // Register agent with cultural intelligence
            const culturalProfile = this.culturalSystem.registerAgent(agentId, personalityDNA, {
                cultural_background: culturalBackground,
                birth_year: birthYear,
                education_level: 40 + Math.random() * 60, // 40-100%
                travel_exposure: Math.random() * 80, // 0-80%
                regional_influence: culturalBackground
            });

            this.agents.set(agentId, {
                personalityDNA,
                culturalProfile,
                culturalBackground,
                generation,
                birthYear,
                interactions: [],
                culturalExperiences: []
            });

            console.log(`   👤 ${agentId}: ${culturalBackground} (${generation}, born ${birthYear})`);
        }

        console.log(`   ✅ Created ${this.agents.size} agents with diverse cultural backgrounds`);
        
        // Display cultural diversity metrics
        this.displayPopulationDiversity();
    }

    displayPopulationDiversity() {
        const backgrounds = {};
        const generations = {};
        
        for (const agent of this.agents.values()) {
            backgrounds[agent.culturalBackground] = (backgrounds[agent.culturalBackground] || 0) + 1;
            generations[agent.generation] = (generations[agent.generation] || 0) + 1;
        }

        console.log('   📊 Population Diversity:');
        console.log('      Cultural Backgrounds:', backgrounds);
        console.log('      Generational Distribution:', generations);
    }

    async processCrossCulturalInteractions() {
        console.log('   🤝 Simulating cross-cultural interactions...');
        
        const agentIds = Array.from(this.agents.keys());
        const interactionCount = 15; // 15 interactions
        
        for (let i = 0; i < interactionCount; i++) {
            // Select two agents with different cultural backgrounds
            const agent1Id = agentIds[Math.floor(Math.random() * agentIds.length)];
            let agent2Id = agentIds[Math.floor(Math.random() * agentIds.length)];
            
            // Ensure different agents and preferably different cultures
            while (agent2Id === agent1Id || 
                   (Math.random() < 0.7 && this.agents.get(agent1Id).culturalBackground === 
                    this.agents.get(agent2Id).culturalBackground)) {
                agent2Id = agentIds[Math.floor(Math.random() * agentIds.length)];
            }

            const agent1 = this.agents.get(agent1Id);
            const agent2 = this.agents.get(agent2Id);

            // Generate interaction context
            const contexts = [
                { type: 'business_negotiation', complexity_level: 0.8, hierarchical_situation: true },
                { type: 'social_gathering', complexity_level: 0.4, cultural_context_importance: 0.9 },
                { type: 'collaborative_project', complexity_level: 0.6, time_pressure: true },
                { type: 'casual_encounter', complexity_level: 0.2, stakes_level: 0.1 }
            ];
            const context = contexts[Math.floor(Math.random() * contexts.length)];

            // Process interaction
            const interaction = this.culturalSystem.processCrossCulturalInteraction(
                agent1Id, agent2Id, context
            );

            this.interactions.push(interaction);
            agent1.interactions.push(interaction);
            agent2.interactions.push(interaction);

            // Calculate cultural distance for analysis
            const culturalDistance = CulturalUtilities.calculateCulturalDistance(
                agent1.culturalProfile.cultural_intelligence_profile,
                agent2.culturalProfile.cultural_intelligence_profile
            );

            console.log(`      ${i + 1}. ${agent1Id} (${agent1.culturalBackground}) ↔️ ${agent2Id} (${agent2.culturalBackground})`);
            console.log(`         Context: ${context.type}, Distance: ${(culturalDistance * 100).toFixed(0)}%, Success: ${interaction.outcome.overall_success ? '✅' : '❌'}`);
            
            if (interaction.outcome.miscommunications?.length > 0) {
                console.log(`         Miscommunications: ${interaction.outcome.miscommunications.map(m => m.type).join(', ')}`);
            }
        }

        const successRate = this.interactions.filter(i => i.outcome.overall_success).length / this.interactions.length;
        console.log(`   📈 Overall interaction success rate: ${(successRate * 100).toFixed(1)}%`);
    }

    async triggerCulturalEvents() {
        console.log('   🎭 Triggering cultural events affecting population...');
        
        const culturalEvents = [
            {
                type: 'cultural_festival',
                description: 'Global Cultural Heritage Festival',
                options: { backgrounds: ['all'], intensity: 0.8 }
            },
            {
                type: 'generational_movement',
                description: 'Youth Climate Change Movement',
                options: { cohorts: ['millennials', 'generation_z'], intensity: 0.9 }
            },
            {
                type: 'technological_cultural_shift',
                description: 'AI and Digital Transformation',
                options: { backgrounds: ['all'], intensity: 0.7 }
            },
            {
                type: 'cultural_clash',
                description: 'Traditional vs Progressive Values Conflict',
                options: { backgrounds: ['middle_eastern_traditional', 'scandinavian_egalitarian'], intensity: 0.6 }
            }
        ];

        for (const eventConfig of culturalEvents) {
            const event = this.culturalSystem.triggerCulturalEvent(
                eventConfig.type,
                eventConfig.options
            );
            
            this.culturalEvents.push(event);
            
            console.log(`      🎪 ${eventConfig.description}`);
            console.log(`         Type: ${event.type}, Participants: ${event.participants?.length || 'All'}`);
            
            // Simulate time passing for event effects
            await this.sleep(100);
        }

        console.log(`   ✅ Triggered ${culturalEvents.length} cultural events`);
    }

    async demonstrateCulturalLearning() {
        console.log('   📚 Demonstrating cultural learning and adaptation...');
        
        // Select an agent for detailed learning demonstration
        const agentId = 'agent_001';
        const agent = this.agents.get(agentId);
        
        console.log(`      👤 Focusing on ${agentId} (${agent.culturalBackground})`);
        
        // Get initial cultural profile
        let profile = this.culturalSystem.getAgentCulturalProfile(agentId);
        const initialCompetency = profile.overall_cultural_competency;
        
        console.log(`         Initial Cultural Competency: ${initialCompetency.toFixed(1)}%`);
        
        // Simulate cultural experiences
        const experiences = [
            {
                type: 'successful_cooperation',
                intensity: 75,
                cultural_dimensions: { trust_propensity: 80, cooperation: 85 },
                emotional_impact: 60,
                description: 'Successful international business partnership'
            },
            {
                type: 'cultural_mentorship',
                intensity: 60,
                cultural_dimensions: { cultural_intelligence: 70, adaptation_flexibility: 65 },
                emotional_impact: 40,
                description: 'Assigned cultural mentor for adaptation'
            },
            {
                type: 'cross_cultural_friendship',
                intensity: 80,
                cultural_dimensions: { empathy: 75, social_skills: 70 },
                emotional_impact: 85,
                description: 'Formed deep friendship across cultures'
            }
        ];

        for (const experience of experiences) {
            this.culturalSystem.updateAgentCulturalExperience(agentId, experience);
            agent.culturalExperiences.push(experience);
            
            // Get updated profile
            profile = this.culturalSystem.getAgentCulturalProfile(agentId);
            
            console.log(`         Experience: ${experience.description}`);
            console.log(`         Updated Competency: ${profile.overall_cultural_competency.toFixed(1)}%`);
            
            await this.sleep(50);
        }

        const finalCompetency = profile.overall_cultural_competency;
        const improvement = finalCompetency - initialCompetency;
        
        console.log(`      📈 Total improvement: +${improvement.toFixed(1)}% cultural competency`);
        
        // Display learning details
        if (profile.learning_profile) {
            console.log(`         Adaptation Progress: ${profile.learning_profile.adaptation_progress || 0}%`);
            console.log(`         Cultural Stress Level: ${profile.learning_profile.stress_level || 0}%`);
        }
    }

    async demonstrateSystemIntegration() {
        console.log('   🔗 Demonstrating system integration capabilities...');
        
        // Show cultural influence on personality traits
        const agentId = 'agent_002';
        const agent = this.agents.get(agentId);
        const culturalProfile = this.culturalSystem.getAgentCulturalProfile(agentId);
        
        if (culturalProfile.personality_cultural_integration) {
            console.log(`      👤 ${agentId} Personality-Culture Integration:`);
            console.log(`         Cultural Background: ${agent.culturalBackground}`);
            console.log(`         Trait Modifications:`, 
                Object.entries(culturalProfile.personality_cultural_integration.trait_modifications)
                    .slice(0, 3)
                    .map(([trait, mod]) => `${trait}: ${mod > 0 ? '+' : ''}${mod.toFixed(1)}`)
                    .join(', ')
            );
        }

        // Show economic behavior modifications
        if (culturalProfile.economic_behavior_cultural_modification) {
            console.log(`         Economic Behavior Modifications:`);
            const tradingAdjustments = culturalProfile.economic_behavior_cultural_modification.trading_behavior_adjustments;
            if (tradingAdjustments) {
                console.log(`         - Relationship Priority: ${(tradingAdjustments.relationship_priority_in_trades * 100).toFixed(0)}%`);
                console.log(`         - Long-term Focus: ${(tradingAdjustments.long_term_vs_short_term_focus * 100).toFixed(0)}%`);
                console.log(`         - Group Decisions: ${(tradingAdjustments.group_vs_individual_decisions * 100).toFixed(0)}%`);
            }
        }

        // Demonstrate cross-cultural compatibility analysis
        console.log(`      🤝 Cross-Cultural Compatibility Analysis:`);
        const agents = Array.from(this.agents.keys()).slice(0, 4);
        
        for (let i = 0; i < agents.length - 1; i++) {
            for (let j = i + 1; j < agents.length; j++) {
                const agent1Profile = this.culturalSystem.getAgentCulturalProfile(agents[i]);
                const agent2Profile = this.culturalSystem.getAgentCulturalProfile(agents[j]);
                
                const compatibility = CulturalUtilities.calculateCulturalCompatibility(
                    agent1Profile.cultural_intelligence_profile,
                    agent2Profile.cultural_intelligence_profile
                );
                
                const agent1Background = this.agents.get(agents[i]).culturalBackground;
                const agent2Background = this.agents.get(agents[j]).culturalBackground;
                
                console.log(`         ${agents[i]} (${agent1Background}) ↔️ ${agents[j]} (${agent2Background}): ${compatibility}% compatible`);
            }
        }
    }

    async generateAnalyticsReports() {
        console.log('   📊 Generating comprehensive analytics reports...');
        
        // System-wide cultural intelligence report
        const systemReport = this.culturalSystem.getCulturalIntelligenceReport();
        
        console.log('      🌍 System Overview:');
        console.log(`         Total Agents: ${systemReport.system_overview.total_agents}`);
        console.log(`         Cultural Diversity: ${(systemReport.cultural_diversity_analysis?.overall_diversity * 100).toFixed(1)}%`);
        console.log(`         System Efficiency: ${(systemReport.system_overview.performance_metrics?.system_efficiency * 100).toFixed(1)}%`);
        
        // Cultural interaction analytics
        const successfulInteractions = this.interactions.filter(i => i.outcome.overall_success);
        console.log(`      🤝 Interaction Analytics:`);
        console.log(`         Total Interactions: ${this.interactions.length}`);
        console.log(`         Success Rate: ${(successfulInteractions.length / this.interactions.length * 100).toFixed(1)}%`);
        
        // Miscommunication analysis
        const miscommunications = this.interactions.flatMap(i => i.outcome.miscommunications || []);
        const miscommunicationTypes = {};
        miscommunications.forEach(misc => {
            miscommunicationTypes[misc.type] = (miscommunicationTypes[misc.type] || 0) + 1;
        });
        
        if (Object.keys(miscommunicationTypes).length > 0) {
            console.log(`         Common Miscommunications:`, 
                Object.entries(miscommunicationTypes)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 3)
                    .map(([type, count]) => `${type} (${count})`)
                    .join(', ')
            );
        }

        // Cultural learning progress
        const culturalCompetencies = Array.from(this.agents.keys())
            .map(agentId => {
                const profile = this.culturalSystem.getAgentCulturalProfile(agentId);
                return profile.overall_cultural_competency;
            });
        
        const avgCompetency = culturalCompetencies.reduce((sum, comp) => sum + comp, 0) / culturalCompetencies.length;
        console.log(`      📚 Learning Analytics:`);
        console.log(`         Average Cultural Competency: ${avgCompetency.toFixed(1)}%`);
        console.log(`         Cultural Events Triggered: ${this.culturalEvents.length}`);
        
        // Performance metrics
        const performanceMetrics = this.culturalSystem.getPerformanceMetrics();
        console.log(`      ⚡ Performance Metrics:`);
        console.log(`         System Efficiency: ${(performanceMetrics.system_efficiency * 100).toFixed(1)}%`);
        
        if (performanceMetrics.average_operation_times) {
            const avgRegistration = performanceMetrics.average_operation_times.agent_registration;
            const avgInteraction = performanceMetrics.average_operation_times.cross_cultural_interaction;
            
            if (avgRegistration) console.log(`         Avg Registration Time: ${avgRegistration.toFixed(0)}ms`);
            if (avgInteraction) console.log(`         Avg Interaction Time: ${avgInteraction.toFixed(0)}ms`);
        }

        // Generate recommendations
        if (systemReport.recommendations?.length > 0) {
            console.log(`      💡 System Recommendations:`);
            systemReport.recommendations.slice(0, 3).forEach((rec, index) => {
                console.log(`         ${index + 1}. ${rec.description} (${rec.priority} priority)`);
            });
        }
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Cleanup method
    cleanup() {
        if (this.culturalSystem) {
            this.culturalSystem.cleanup();
        }
    }
}

// Run the integration example
async function runExample() {
    const example = new CulturalIntelligenceIntegrationExample();
    
    try {
        await example.runCompleteExample();
    } catch (error) {
        console.error('Example failed:', error);
    } finally {
        example.cleanup();
    }
}

// Export for use as module or run directly
if (require.main === module) {
    runExample().then(() => {
        console.log('\n🎉 Phase 2 Cultural Intelligence Integration Example Complete!');
        process.exit(0);
    }).catch(error => {
        console.error('Example error:', error);
        process.exit(1);
    });
}

module.exports = CulturalIntelligenceIntegrationExample;
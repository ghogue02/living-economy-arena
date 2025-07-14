/**
 * Player Interaction Systems - Integration Test
 * Comprehensive test of all player control and influence mechanisms
 */

const PlayerInteractionSystems = require('./index');

class PlayerInteractionSystemsTest {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            total: 0,
            details: []
        };
        
        this.playerSystem = null;
        this.testPlayers = [
            'player_001_alice',
            'player_002_bob', 
            'player_003_charlie',
            'player_004_diana'
        ];
    }

    async runAllTests() {
        console.log('🧪 Starting Player Interaction Systems Integration Tests\n');
        
        try {
            await this.initializeSystem();
            await this.testPlayerRegistration();
            await this.testPolicyImplementation();
            await this.testInfrastructureInvestment();
            await this.testPropagandaCampaigns();
            await this.testIntelligenceOperations();
            await this.testCoalitionFormation();
            await this.testTreatyNegotiation();
            await this.testResourceSharing();
            await this.testBetrayalMechanics();
            await this.testCrisisOrchestration();
            await this.testNaturalDisasters();
            await this.testCrossSystemCoordination();
            await this.testMarketEffects();
            await this.testSystemPerformance();
            
            await this.cleanup();
            
        } catch (error) {
            console.error('❌ Test suite failed:', error);
            this.recordTestResult('Test Suite', false, error.message);
        }
        
        this.printTestResults();
        return this.testResults;
    }

    async initializeSystem() {
        console.log('📋 Test 1: System Initialization');
        
        try {
            this.playerSystem = new PlayerInteractionSystems({
                enablePolicyControl: true,
                enableIntelligence: true,
                enableCoalitions: true,
                enableCrisisOrchestration: true,
                systemIntegration: true,
                eventPropagation: true,
                
                // Test configurations with shorter durations
                playerControlConfig: {
                    playerActionCooldown: 10000, // 10 seconds for testing
                    budgetLimits: {
                        infrastructure: 10000000,
                        propaganda: 5000000,
                        espionage: 2500000,
                        policies: 7500000
                    }
                },
                intelligenceConfig: {
                    operationCooldown: 30000, // 30 seconds for testing
                    detectionThreshold: 0.3
                },
                coalitionConfig: {
                    maxCoalitionSize: 4,
                    trustDecayRate: 0.01
                },
                crisisOrchestrationConfig: {
                    crisisCooldown: 60000, // 1 minute for testing
                    detectionProbability: 0.2
                }
            });

            await this.playerSystem.initializeComponents();
            
            this.recordTestResult('System Initialization', true, 'All components initialized successfully');
            
        } catch (error) {
            this.recordTestResult('System Initialization', false, error.message);
            throw error;
        }
    }

    async testPlayerRegistration() {
        console.log('📋 Test 2: Player Registration');
        
        try {
            const registrationPromises = this.testPlayers.map(async (playerId, index) => {
                const playerData = {
                    name: `Test Player ${index + 1}`,
                    level: Math.floor(Math.random() * 5) + 1,
                    reputation: Math.random() * 0.4 + 0.3, // 0.3 to 0.7
                    region: ['north', 'south', 'east', 'west'][index],
                    specialization: ['economist', 'politician', 'business_mogul', 'tech_innovator'][index]
                };
                
                const result = await this.playerSystem.registerPlayer(playerId, playerData);
                
                if (!result.playerId || !result.registrationResults) {
                    throw new Error(`Failed to register player ${playerId}`);
                }
                
                return result;
            });

            const registrationResults = await Promise.all(registrationPromises);
            
            this.recordTestResult('Player Registration', true, 
                `Successfully registered ${registrationResults.length} players`);
                
        } catch (error) {
            this.recordTestResult('Player Registration', false, error.message);
        }
    }

    async testPolicyImplementation() {
        console.log('📋 Test 3: Policy Implementation');
        
        try {
            const policyEngine = this.playerSystem.getPolicyEngine();
            const playerId = this.testPlayers[0];
            
            // Test taxation policy
            const taxationResult = await policyEngine.implementPolicy(
                playerId,
                'taxation',
                'agent_income_tax',
                { region: 'north', agentTypes: ['consumer'] }
            );
            
            if (!taxationResult.policyId || !taxationResult.effects) {
                throw new Error('Taxation policy implementation failed');
            }

            // Test subsidy policy
            const subsidyResult = await policyEngine.implementPolicy(
                playerId,
                'subsidies', 
                'startup_grants',
                { region: 'north', industries: ['technology'] }
            );
            
            if (!subsidyResult.policyId || !subsidyResult.effects) {
                throw new Error('Subsidy policy implementation failed');
            }

            // Test regulation policy
            const regulationResult = await policyEngine.implementPolicy(
                playerId,
                'regulations',
                'market_restrictions',
                { markets: ['technology'], restrictions: { minCapital: 100000 } }
            );
            
            if (!regulationResult.policyId || !regulationResult.effects) {
                throw new Error('Regulation policy implementation failed');
            }

            this.recordTestResult('Policy Implementation', true, 
                'Successfully implemented taxation, subsidy, and regulation policies');
                
        } catch (error) {
            this.recordTestResult('Policy Implementation', false, error.message);
        }
    }

    async testInfrastructureInvestment() {
        console.log('📋 Test 4: Infrastructure Investment');
        
        try {
            const policyEngine = this.playerSystem.getPolicyEngine();
            const playerId = this.testPlayers[1];
            
            // Test transportation infrastructure
            const transportResult = await policyEngine.investInfrastructure(
                playerId,
                'transportation',
                'highways',
                { x: 100, y: 200, region: 'south' },
                { fastTrack: true }
            );
            
            if (!transportResult.investmentId) {
                throw new Error('Transportation infrastructure investment failed');
            }

            // Test communication infrastructure
            const commResult = await policyEngine.investInfrastructure(
                playerId,
                'communication',
                'fiber_networks',
                { x: 150, y: 250, region: 'south' }
            );
            
            if (!commResult.investmentId) {
                throw new Error('Communication infrastructure investment failed');
            }

            this.recordTestResult('Infrastructure Investment', true, 
                'Successfully invested in transportation and communication infrastructure');
                
        } catch (error) {
            this.recordTestResult('Infrastructure Investment', false, error.message);
        }
    }

    async testPropagandaCampaigns() {
        console.log('📋 Test 5: Propaganda Campaigns');
        
        try {
            const policyEngine = this.playerSystem.getPolicyEngine();
            const playerId = this.testPlayers[2];
            
            // Test brand awareness campaign
            const brandResult = await policyEngine.launchPropagandaCampaign(
                playerId,
                'brand_awareness',
                { type: 'regional', region: 'east', brands: ['TechCorp'] },
                'Innovative technology for everyone',
                100000
            );
            
            if (!brandResult.campaignId || !brandResult.effects) {
                throw new Error('Brand awareness campaign failed');
            }

            // Test market sentiment campaign
            const sentimentResult = await policyEngine.launchPropagandaCampaign(
                playerId,
                'sentiment_manipulation',
                { type: 'global', markets: ['technology'], sentiment: 'positive' },
                'Technology sector shows strong growth potential',
                150000
            );
            
            if (!sentimentResult.campaignId || !sentimentResult.effects) {
                throw new Error('Market sentiment campaign failed');
            }

            this.recordTestResult('Propaganda Campaigns', true, 
                'Successfully launched brand awareness and sentiment manipulation campaigns');
                
        } catch (error) {
            this.recordTestResult('Propaganda Campaigns', false, error.message);
        }
    }

    async testIntelligenceOperations() {
        console.log('📋 Test 6: Intelligence Operations');
        
        try {
            const intelligenceSystem = this.playerSystem.getIntelligenceSystem();
            const playerId = this.testPlayers[0];
            
            // Test market surveillance
            const surveillanceResult = await intelligenceSystem.launchOperation(
                playerId,
                'market_surveillance',
                { commodity: 'technology', region: 'global' }
            );
            
            if (!surveillanceResult.operationId) {
                throw new Error('Market surveillance operation failed');
            }

            // Test competitor analysis
            const competitorResult = await intelligenceSystem.launchOperation(
                playerId,
                'competitor_analysis',
                { company: 'TechCorp', securityLevel: 2 }
            );
            
            if (!competitorResult.operationId) {
                throw new Error('Competitor analysis operation failed');
            }

            // Test counter-intelligence
            const counterResult = await intelligenceSystem.launchCounterOperation(
                playerId,
                this.testPlayers[1],
                'defensive'
            );
            
            if (!counterResult.counterId) {
                throw new Error('Counter-intelligence operation failed');
            }

            this.recordTestResult('Intelligence Operations', true, 
                'Successfully launched surveillance, competitor analysis, and counter-intelligence operations');
                
        } catch (error) {
            this.recordTestResult('Intelligence Operations', false, error.message);
        }
    }

    async testCoalitionFormation() {
        console.log('📋 Test 7: Coalition Formation');
        
        try {
            const coalitionSystem = this.playerSystem.getCoalitionSystem();
            const founderId = this.testPlayers[0];
            
            // Create trade bloc coalition
            const coalitionResult = await coalitionSystem.createCoalition(
                founderId,
                'trade_bloc',
                'Northern Trade Alliance',
                'Coalition for enhanced trade cooperation in northern regions'
            );
            
            if (!coalitionResult.coalitionId) {
                throw new Error('Coalition creation failed');
            }

            const coalitionId = coalitionResult.coalitionId;

            // Invite members
            const inviteResult = await coalitionSystem.inviteToCoalition(
                coalitionId,
                founderId,
                this.testPlayers[1]
            );
            
            if (!inviteResult.invitationId) {
                throw new Error('Coalition invitation failed');
            }

            // Accept invitation (simulated)
            const acceptResult = await coalitionSystem.acceptCoalitionInvitation(
                inviteResult.invitationId,
                this.testPlayers[1]
            );
            
            if (!acceptResult.coalitionId) {
                throw new Error('Coalition invitation acceptance failed');
            }

            // Add another member
            await coalitionSystem.inviteToCoalition(coalitionId, founderId, this.testPlayers[2]);
            await coalitionSystem.acceptCoalitionInvitation('temp_invite_2', this.testPlayers[2]);

            this.recordTestResult('Coalition Formation', true, 
                'Successfully created coalition and added members');
                
        } catch (error) {
            this.recordTestResult('Coalition Formation', false, error.message);
        }
    }

    async testTreatyNegotiation() {
        console.log('📋 Test 8: Treaty Negotiation');
        
        try {
            const coalitionSystem = this.playerSystem.getCoalitionSystem();
            const proposerId = this.testPlayers[0];
            const targetId = this.testPlayers[3];
            
            // Propose trade agreement
            const tradeProposal = await coalitionSystem.proposeTreaty(
                proposerId,
                targetId,
                'trade_agreement',
                { 
                    preferentialPricing: 0.1, 
                    volumeCommitments: { minimum: 10000 },
                    commodities: ['technology', 'energy']
                }
            );
            
            if (!tradeProposal.treatyId) {
                throw new Error('Trade treaty proposal failed');
            }

            // Accept treaty
            const acceptResult = await coalitionSystem.acceptTreaty(
                tradeProposal.treatyId,
                targetId
            );
            
            if (!acceptResult.treatyId) {
                throw new Error('Treaty acceptance failed');
            }

            // Propose technology sharing treaty
            const techProposal = await coalitionSystem.proposeTreaty(
                proposerId,
                targetId,
                'technology_sharing',
                { patentAccess: ['ai_algorithms', 'quantum_computing'] }
            );
            
            if (!techProposal.treatyId) {
                throw new Error('Technology sharing treaty proposal failed');
            }

            this.recordTestResult('Treaty Negotiation', true, 
                'Successfully proposed and activated trade and technology sharing treaties');
                
        } catch (error) {
            this.recordTestResult('Treaty Negotiation', false, error.message);
        }
    }

    async testResourceSharing() {
        console.log('📋 Test 9: Resource Sharing');
        
        try {
            const coalitionSystem = this.playerSystem.getCoalitionSystem();
            
            // Get coalition ID (from previous test)
            const coalitions = coalitionSystem.getPlayerCoalitions(this.testPlayers[0]);
            if (coalitions.length === 0) {
                throw new Error('No coalition available for resource sharing test');
            }
            
            const coalitionId = coalitions[0].id;
            const sharerId = this.testPlayers[0];
            const claimerId = this.testPlayers[1];
            
            // Share resources
            const shareResult = await coalitionSystem.shareResources(
                coalitionId,
                sharerId,
                'technology_patents',
                100,
                { 
                    duration: 3600000, // 1 hour
                    restrictions: { usageType: 'development_only' }
                }
            );
            
            if (!shareResult.shareId) {
                throw new Error('Resource sharing failed');
            }

            // Claim shared resources
            const claimResult = await coalitionSystem.claimSharedResources(
                coalitionId,
                claimerId,
                shareResult.shareId,
                25
            );
            
            if (!claimResult.claimId) {
                throw new Error('Resource claiming failed');
            }

            this.recordTestResult('Resource Sharing', true, 
                'Successfully shared and claimed coalition resources');
                
        } catch (error) {
            this.recordTestResult('Resource Sharing', false, error.message);
        }
    }

    async testBetrayalMechanics() {
        console.log('📋 Test 10: Betrayal Mechanics');
        
        try {
            const coalitionSystem = this.playerSystem.getCoalitionSystem();
            
            // Get coalition ID
            const coalitions = coalitionSystem.getPlayerCoalitions(this.testPlayers[2]);
            if (coalitions.length === 0) {
                throw new Error('No coalition available for betrayal test');
            }
            
            const coalitionId = coalitions[0].id;
            const betrayerId = this.testPlayers[2];
            
            // Execute betrayal
            const betrayalResult = await coalitionSystem.betrayCoalition(
                coalitionId,
                betrayerId,
                'resource_theft',
                [] // Target all members
            );
            
            if (!betrayalResult.betrayalId || !betrayalResult.consequences) {
                throw new Error('Coalition betrayal failed');
            }

            // Verify betrayer was removed from coalition
            const updatedCoalitions = coalitionSystem.getPlayerCoalitions(betrayerId);
            const stillInCoalition = updatedCoalitions.some(c => c.id === coalitionId);
            
            if (stillInCoalition) {
                throw new Error('Betrayer was not removed from coalition');
            }

            this.recordTestResult('Betrayal Mechanics', true, 
                'Successfully executed coalition betrayal with proper consequences');
                
        } catch (error) {
            this.recordTestResult('Betrayal Mechanics', false, error.message);
        }
    }

    async testCrisisOrchestration() {
        console.log('📋 Test 11: Crisis Orchestration');
        
        try {
            const crisisSystem = this.playerSystem.getCrisisOrchestrationSystem();
            const orchestrator = this.testPlayers[3];
            
            // Orchestrate natural disaster
            const earthquakeResult = await crisisSystem.orchestrateCrisis(
                orchestrator,
                'natural_disasters',
                'earthquake',
                { 
                    region: 'west',
                    industries: ['infrastructure', 'manufacturing'],
                    epicenter: { x: 300, y: 400 }
                },
                { 
                    severity: 0.6,
                    preparationTime: 5000, // 5 seconds for testing
                    coverStory: 'tectonic_instability'
                }
            );
            
            if (!earthquakeResult.crisisId) {
                throw new Error('Earthquake crisis orchestration failed');
            }

            // Orchestrate economic shock
            const currencyResult = await crisisSystem.orchestrateCrisis(
                orchestrator,
                'economic_shocks',
                'commodity_shock',
                {
                    commodity: 'energy',
                    markets: ['energy', 'transportation']
                },
                {
                    severity: 0.4,
                    preparationTime: 5000,
                    coverStory: 'supply_disruption'
                }
            );
            
            if (!currencyResult.crisisId) {
                throw new Error('Currency crisis orchestration failed');
            }

            // Wait for crises to start
            await new Promise(resolve => setTimeout(resolve, 6000));

            this.recordTestResult('Crisis Orchestration', true, 
                'Successfully orchestrated earthquake and commodity shock crises');
                
        } catch (error) {
            this.recordTestResult('Crisis Orchestration', false, error.message);
        }
    }

    async testNaturalDisasters() {
        console.log('📋 Test 12: Natural Disasters');
        
        try {
            const crisisSystem = this.playerSystem.getCrisisOrchestrationSystem();
            
            // Trigger natural disaster
            await crisisSystem.triggerNaturalDisaster('wildfire');
            
            // Get active crises
            const activeCrises = crisisSystem.getActiveCrises();
            const naturalDisaster = activeCrises.find(crisis => crisis.natural);
            
            if (!naturalDisaster) {
                throw new Error('Natural disaster was not triggered');
            }

            this.recordTestResult('Natural Disasters', true, 
                'Successfully triggered natural wildfire disaster');
                
        } catch (error) {
            this.recordTestResult('Natural Disasters', false, error.message);
        }
    }

    async testCrossSystemCoordination() {
        console.log('📋 Test 13: Cross-System Coordination');
        
        try {
            let coordinationEvents = 0;
            
            // Listen for cross-system coordination events
            const eventTypes = [
                'playerControl_policy_implemented',
                'intelligence_operation_succeeded',
                'coalitions_coalition_created',
                'crisisOrchestration_crisis_started',
                'player_reputation_updated'
            ];
            
            eventTypes.forEach(eventType => {
                this.playerSystem.on(eventType, () => {
                    coordinationEvents++;
                });
            });

            // Wait for existing events to propagate
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            if (coordinationEvents === 0) {
                throw new Error('No cross-system coordination events detected');
            }

            this.recordTestResult('Cross-System Coordination', true, 
                `Detected ${coordinationEvents} coordination events between systems`);
                
        } catch (error) {
            this.recordTestResult('Cross-System Coordination', false, error.message);
        }
    }

    async testMarketEffects() {
        console.log('📋 Test 14: Market Effects Generation');
        
        try {
            const marketEffects = this.playerSystem.getCurrentMarketEffects();
            
            if (!Array.isArray(marketEffects)) {
                throw new Error('Market effects not returned as array');
            }

            if (marketEffects.length === 0) {
                throw new Error('No market effects generated');
            }

            // Verify effect structure
            const validEffect = marketEffects.some(effect => 
                effect.type && 
                (effect.value !== undefined) &&
                effect.hasOwnProperty('target')
            );

            if (!validEffect) {
                throw new Error('Market effects have invalid structure');
            }

            this.recordTestResult('Market Effects Generation', true, 
                `Generated ${marketEffects.length} market effects with valid structure`);
                
        } catch (error) {
            this.recordTestResult('Market Effects Generation', false, error.message);
        }
    }

    async testSystemPerformance() {
        console.log('📋 Test 15: System Performance');
        
        try {
            const startTime = Date.now();
            
            // Get comprehensive status
            const systemStatus = this.playerSystem.getSystemStatus();
            
            if (!systemStatus.initialized || !systemStatus.coordinationActive) {
                throw new Error('System not properly initialized or coordinated');
            }

            // Test player overview performance
            const playerOverview = this.playerSystem.getPlayerOverview(this.testPlayers[0]);
            
            if (!playerOverview || !playerOverview.player) {
                throw new Error('Player overview not generated correctly');
            }

            const endTime = Date.now();
            const performanceTime = endTime - startTime;
            
            if (performanceTime > 1000) { // Should complete within 1 second
                throw new Error(`Performance test took too long: ${performanceTime}ms`);
            }

            this.recordTestResult('System Performance', true, 
                `System responded in ${performanceTime}ms with all components healthy`);
                
        } catch (error) {
            this.recordTestResult('System Performance', false, error.message);
        }
    }

    async cleanup() {
        console.log('📋 Test Cleanup');
        
        try {
            await this.playerSystem.shutdown();
            this.recordTestResult('System Cleanup', true, 'System shutdown successfully');
        } catch (error) {
            this.recordTestResult('System Cleanup', false, error.message);
        }
    }

    recordTestResult(testName, passed, details) {
        this.testResults.total++;
        if (passed) {
            this.testResults.passed++;
            console.log(`  ✅ ${testName}: ${details}`);
        } else {
            this.testResults.failed++;
            console.log(`  ❌ ${testName}: ${details}`);
        }
        
        this.testResults.details.push({
            test: testName,
            passed,
            details,
            timestamp: Date.now()
        });
    }

    printTestResults() {
        console.log('\n' + '='.repeat(80));
        console.log('🧪 PLAYER INTERACTION SYSTEMS TEST RESULTS');
        console.log('='.repeat(80));
        console.log(`Total Tests: ${this.testResults.total}`);
        console.log(`Passed: ${this.testResults.passed} ✅`);
        console.log(`Failed: ${this.testResults.failed} ❌`);
        console.log(`Success Rate: ${((this.testResults.passed / this.testResults.total) * 100).toFixed(1)}%`);
        
        if (this.testResults.failed > 0) {
            console.log('\nFailed Tests:');
            this.testResults.details
                .filter(result => !result.passed)
                .forEach(result => {
                    console.log(`  ❌ ${result.test}: ${result.details}`);
                });
        }
        
        console.log('\n🎯 Player Interaction Systems testing completed!');
        console.log('='.repeat(80));
    }
}

// Run tests if executed directly
if (require.main === module) {
    const tester = new PlayerInteractionSystemsTest();
    tester.runAllTests()
        .then(results => {
            process.exit(results.failed === 0 ? 0 : 1);
        })
        .catch(error => {
            console.error('Test execution failed:', error);
            process.exit(1);
        });
}

module.exports = PlayerInteractionSystemsTest;
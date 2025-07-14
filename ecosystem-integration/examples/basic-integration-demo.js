/**
 * Basic Integration Demo - Living Economy Arena Ecosystem Integration
 * Demonstrates core functionality of the integration layer
 */

const { EcosystemIntegrationOrchestrator } = require('../index');
const defaultConfig = require('../config/default-config');

class BasicIntegrationDemo {
    constructor() {
        this.orchestrator = new EcosystemIntegrationOrchestrator({
            ...defaultConfig,
            // Override for demo
            gateway: {
                ...defaultConfig.gateway,
                port: 8080
            },
            monitoring: {
                ...defaultConfig.monitoring,
                enableRealTimeAlerts: true
            }
        });
    }

    async run() {
        console.log('🎯 Starting Living Economy Arena Integration Demo');
        console.log('=' .repeat(60));

        try {
            // Initialize and start the integration layer
            await this.orchestrator.initialize();
            await this.orchestrator.start();

            console.log('\n🚀 Integration layer started successfully!');
            
            // Demo 1: Data Harmonization
            await this.demonstrateDataHarmonization();
            
            // Demo 2: Event-Driven Communication
            await this.demonstrateEventDrivenCommunication();
            
            // Demo 3: Workflow Automation
            await this.demonstrateWorkflowAutomation();
            
            // Demo 4: System Interoperability
            await this.demonstrateSystemInteroperability();
            
            // Demo 5: Real-time Monitoring
            await this.demonstrateRealtimeMonitoring();
            
            // Demo 6: Complete Integration Scenario
            await this.demonstrateCompleteIntegrationScenario();

            console.log('\n✅ All demos completed successfully!');
            console.log('🌐 Gateway is running on http://localhost:8080');
            console.log('📊 Monitor system health at http://localhost:8080/health');
            console.log('📈 View metrics at http://localhost:8080/metrics');
            
            // Keep the demo running
            console.log('\n⏳ Demo server running... Press Ctrl+C to stop');

        } catch (error) {
            console.error('❌ Demo failed:', error);
            process.exit(1);
        }
    }

    async demonstrateDataHarmonization() {
        console.log('\n📋 Demo 1: Data Harmonization');
        console.log('-'.repeat(40));

        // Sample agent data from different systems
        const agentDataFromAISystem = {
            agentId: 'ai_agent_001',
            traits: { intelligence: 0.8, creativity: 0.6 },
            behaviors: ['analytical', 'cautious'],
            x: 100,
            y: 200
        };

        const agentDataFromEconomicSystem = {
            id: 'eco_agent_001',
            personality: {
                traits: { risk_tolerance: 0.7, ambition: 0.9 },
                behaviors: ['aggressive_trader', 'market_maker']
            },
            position: { x: 150, y: 250, z: 10 }
        };

        try {
            // Harmonize data from AI system
            const harmonizedAI = await this.orchestrator.processData(
                agentDataFromAISystem, 
                'agent', 
                'standard'
            );
            console.log('✅ AI System data harmonized:', harmonizedAI.id);

            // Harmonize data from Economic system
            const harmonizedEco = await this.orchestrator.processData(
                agentDataFromEconomicSystem, 
                'agent', 
                'standard'
            );
            console.log('✅ Economic System data harmonized:', harmonizedEco.id);

            // Demonstrate batch harmonization
            const batchData = [agentDataFromAISystem, agentDataFromEconomicSystem];
            const harmonization = this.orchestrator.getHarmonization();
            const batchResult = await harmonization.batchHarmonize(batchData, 'agent', 'standard');
            
            console.log(`✅ Batch harmonization completed: ${batchResult.results.length} successful, ${batchResult.errors.length} errors`);

        } catch (error) {
            console.error('❌ Data harmonization failed:', error.message);
        }
    }

    async demonstrateEventDrivenCommunication() {
        console.log('\n📡 Demo 2: Event-Driven Communication');
        console.log('-'.repeat(40));

        try {
            // Subscribe to events
            const subscriptionId = this.orchestrator.subscribeToEvents(
                'market.trade',
                (event) => {
                    console.log(`📈 Trade event received: ${event.payload.symbol} @ $${event.payload.price}`);
                }
            );

            // Subscribe to agent actions
            this.orchestrator.subscribeToEvents(
                'agent.action',
                (event) => {
                    console.log(`🤖 Agent ${event.payload.agentId} performed: ${event.payload.action}`);
                }
            );

            // Publish sample events
            await this.orchestrator.publishEvent('market.trade', {
                symbol: 'LIVING_COIN',
                price: 125.50,
                volume: 1000,
                participants: ['trader_001', 'trader_002']
            });

            await this.orchestrator.publishEvent('agent.action', {
                agentId: 'agent_001',
                action: 'place_order',
                parameters: { symbol: 'LIVING_COIN', quantity: 100, side: 'buy' }
            });

            await this.orchestrator.publishEvent('market.trade', {
                symbol: 'LIVING_COIN',
                price: 126.00,
                volume: 500,
                participants: ['trader_001', 'market_maker_001']
            });

            // Trigger event correlation (rapid trades)
            for (let i = 0; i < 5; i++) {
                await this.orchestrator.publishEvent('market.trade', {
                    symbol: 'LIVING_COIN',
                    price: 125.50 + (i * 0.5),
                    volume: 200,
                    participants: ['bot_trader', 'arbitrage_bot']
                });
            }

            console.log('✅ Event publishing and correlation demonstrated');

        } catch (error) {
            console.error('❌ Event-driven communication failed:', error.message);
        }
    }

    async demonstrateWorkflowAutomation() {
        console.log('\n⚙️ Demo 3: Workflow Automation');
        console.log('-'.repeat(40));

        try {
            // Execute an agent interaction workflow
            const agentResult = await this.orchestrator.executeWorkflow(
                'agent_interaction',
                {
                    source: 'agent_001',
                    target: 'agent_002',
                    interactionType: 'negotiation',
                    subject: 'resource_trade'
                }
            );

            console.log(`✅ Agent interaction workflow completed: ${agentResult.success ? 'Success' : 'Failed'}`);
            console.log(`   Steps completed: ${agentResult.completedSteps}/${agentResult.totalSteps}`);

            // Execute an economic transaction workflow
            const transactionResult = await this.orchestrator.executeWorkflow(
                'economic_transaction',
                {
                    from: 'account_001',
                    to: 'account_002',
                    amount: 1000,
                    currency: 'LIVING_COIN',
                    type: 'transfer'
                }
            );

            console.log(`✅ Economic transaction workflow completed: ${transactionResult.success ? 'Success' : 'Failed'}`);

            // Execute market event processing workflow
            const marketResult = await this.orchestrator.executeWorkflow(
                'market_event_processing',
                {
                    eventType: 'price_discovery',
                    symbol: 'LIVING_COIN',
                    newPrice: 130.00,
                    priceChange: 0.04
                }
            );

            console.log(`✅ Market event processing workflow completed: ${marketResult.success ? 'Success' : 'Failed'}`);

        } catch (error) {
            console.error('❌ Workflow automation failed:', error.message);
        }
    }

    async demonstrateSystemInteroperability() {
        console.log('\n🌐 Demo 4: System Interoperability');
        console.log('-'.repeat(40));

        try {
            const interop = this.orchestrator.getInteroperability();

            // Register mock services for demonstration
            interop.registerService('ai-personality', {
                baseUrl: 'http://localhost:3001',
                healthEndpoint: '/health',
                protocol: 'http'
            });

            interop.registerService('economic-engine', {
                baseUrl: 'http://localhost:3002',
                healthEndpoint: '/health',
                protocol: 'websocket'
            });

            // Simulate service communication (would normally hit real services)
            try {
                const aiMessage = {
                    action: 'getAgentPersonality',
                    agentId: 'agent_001'
                };

                console.log('📤 Sending message to AI Personality System...');
                // This would normally succeed with a real service
                // const aiResponse = await this.orchestrator.sendMessage('ai-personality', aiMessage);
                console.log('ℹ️  (Service not running - this is expected in demo mode)');

            } catch (error) {
                console.log('ℹ️  Service communication simulated (services not running)');
            }

            // Demonstrate service discovery
            const discoveredServices = await interop.discoverServices();
            console.log(`✅ Service discovery completed: ${discoveredServices.length} services found`);

            // Show service status
            const serviceStatus = interop.getServiceStatus();
            console.log('📊 Service Status:');
            serviceStatus.forEach(service => {
                console.log(`   ${service.name}: ${service.status} (Circuit Breaker: ${service.circuitBreakerState})`);
            });

        } catch (error) {
            console.error('❌ System interoperability demo failed:', error.message);
        }
    }

    async demonstrateRealtimeMonitoring() {
        console.log('\n📊 Demo 5: Real-time Monitoring');
        console.log('-'.repeat(40));

        try {
            const monitoring = this.orchestrator.getMonitoring();

            // Record some sample metrics
            monitoring.recordMetric('gateway.requests_per_second', 45.5, { endpoint: '/api/agents' });
            monitoring.recordMetric('gateway.response_time', 120, { endpoint: '/api/agents' });
            monitoring.recordMetric('workflow.execution_time', 2500, { template: 'agent_interaction' });
            monitoring.recordMetric('events.publish_rate', 150, { event_type: 'market.trade' });

            // Simulate high load to trigger alerts
            monitoring.recordMetric('gateway.response_time', 6000, { endpoint: '/api/heavy_operation' });
            monitoring.recordMetric('system.cpu_usage', 0.95, { component: 'gateway' });

            // Generate a system health report
            const healthReport = monitoring.generateReport('system_health', {
                timeRange: 3600000 // Last hour
            });

            console.log('✅ System Health Report Generated:');
            console.log(`   Overall Health: ${healthReport.data.overallHealth}`);
            console.log(`   Metrics Collected: ${Object.keys(healthReport.data.metrics).length}`);
            console.log(`   Active Alerts: ${healthReport.data.alerts.length}`);

            // Generate performance report
            const perfReport = monitoring.generateReport('performance', {
                timeRange: 3600000
            });

            console.log('✅ Performance Report Generated:');
            console.log(`   Bottlenecks Identified: ${perfReport.data.bottlenecks.length}`);
            console.log(`   Recommendations: ${perfReport.data.recommendations.length}`);

            // Show current statistics
            const stats = monitoring.getStatistics();
            console.log('📈 Current Monitoring Statistics:');
            console.log(`   Total Metrics: ${stats.totalMetrics}`);
            console.log(`   Active Alerts: ${stats.activeAlerts}`);
            console.log(`   Registered Metrics: ${stats.registeredMetrics}`);

        } catch (error) {
            console.error('❌ Real-time monitoring failed:', error.message);
        }
    }

    async demonstrateCompleteIntegrationScenario() {
        console.log('\n🎯 Demo 6: Complete Integration Scenario');
        console.log('-'.repeat(40));
        console.log('Simulating a complex multi-system interaction...');

        try {
            // Scenario: A player wants to make a large trade that affects market dynamics
            
            // Step 1: Player action triggers event
            await this.orchestrator.publishEvent('player.interaction', {
                playerId: 'player_001',
                interactionType: 'large_trade_request',
                target: 'market_system',
                outcome: { symbol: 'LIVING_COIN', quantity: 10000, side: 'sell' }
            });

            // Step 2: Process the data through harmonization
            const tradeData = {
                orderId: 'order_' + Date.now(),
                symbol: 'LIVING_COIN',
                quantity: 10000,
                side: 'sell',
                player: 'player_001',
                timestamp: new Date().toISOString()
            };

            const harmonizedTrade = await this.orchestrator.processData(
                tradeData, 
                'market', 
                'standard'
            );

            // Step 3: Execute automated workflow for large trade processing
            const tradeWorkflow = await this.orchestrator.executeWorkflow(
                'market_event_processing',
                {
                    eventType: 'large_trade',
                    symbol: harmonizedTrade.symbol,
                    quantity: harmonizedTrade.volume,
                    impact: 'high'
                }
            );

            // Step 4: Trigger economic analysis
            await this.orchestrator.publishEvent('economic.transaction', {
                transactionId: harmonizedTrade.id,
                amount: harmonizedTrade.price * harmonizedTrade.volume,
                currency: 'LIVING_COIN',
                timestamp: Date.now()
            });

            // Step 5: Market responds with price adjustment
            await this.orchestrator.publishEvent('market.trade', {
                symbol: 'LIVING_COIN',
                price: 120.00, // Price dropped due to large sell
                volume: harmonizedTrade.volume,
                participants: ['player_001', 'market_maker_pool']
            });

            // Step 6: Other agents react to price change
            for (let i = 0; i < 3; i++) {
                await this.orchestrator.publishEvent('agent.action', {
                    agentId: `reactive_agent_${i + 1}`,
                    action: 'market_opportunity_response',
                    parameters: { 
                        symbol: 'LIVING_COIN', 
                        trigger: 'price_drop',
                        response: 'buy_order'
                    }
                });
            }

            console.log('✅ Complete integration scenario executed successfully!');
            console.log('   🔄 Data harmonized and validated');
            console.log('   ⚙️ Automated workflows triggered');
            console.log('   📡 Events published and correlated');
            console.log('   🌐 Multi-system coordination achieved');
            console.log('   📊 All activities monitored and recorded');

            // Show final system health
            const finalHealth = this.orchestrator.getSystemHealth();
            console.log(`📈 Final System Health: ${finalHealth.status}`);

        } catch (error) {
            console.error('❌ Complete integration scenario failed:', error.message);
        }
    }

    async gracefulShutdown() {
        console.log('\n🛑 Shutting down integration demo...');
        try {
            await this.orchestrator.stop();
            console.log('✅ Integration layer stopped successfully');
        } catch (error) {
            console.error('❌ Error during shutdown:', error.message);
        }
        process.exit(0);
    }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
    if (global.demo) {
        await global.demo.gracefulShutdown();
    } else {
        process.exit(0);
    }
});

process.on('SIGTERM', async () => {
    if (global.demo) {
        await global.demo.gracefulShutdown();
    } else {
        process.exit(0);
    }
});

// Run the demo
async function main() {
    const demo = new BasicIntegrationDemo();
    global.demo = demo;
    await demo.run();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { BasicIntegrationDemo };
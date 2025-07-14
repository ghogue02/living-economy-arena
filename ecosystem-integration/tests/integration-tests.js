/**
 * Comprehensive Integration Tests for Ecosystem Integration Layer
 */

const { EcosystemIntegrationOrchestrator } = require('../index');
const { UniversalAPIGateway } = require('../gateway/universal-api-gateway');
const { DataHarmonizationEngine } = require('../harmonization/data-harmonization-engine');
const { WorkflowAutomationEngine } = require('../automation/workflow-automation-engine');
const { SystemInteroperabilityFramework } = require('../interoperability/system-interoperability-framework');
const { EventDrivenArchitecture } = require('../events/event-driven-architecture');
const { IntegrationMonitoringAnalytics } = require('../monitoring/integration-monitoring-analytics');

describe('Ecosystem Integration Layer Tests', () => {
    let orchestrator;
    
    beforeAll(async () => {
        orchestrator = new EcosystemIntegrationOrchestrator({
            gateway: { port: 9090 }, // Different port for testing
            monitoring: { enableRealTimeAlerts: false }
        });
        await orchestrator.initialize();
    });

    afterAll(async () => {
        if (orchestrator) {
            await orchestrator.stop();
        }
    });

    describe('Universal API Gateway', () => {
        test('should initialize with default configuration', () => {
            const gateway = new UniversalAPIGateway();
            expect(gateway).toBeDefined();
            expect(gateway.config.port).toBe(8080);
        });

        test('should register services successfully', () => {
            const gateway = new UniversalAPIGateway();
            const service = gateway.registerService('test-service', 'http://localhost:3000');
            
            expect(service.name).toBe('test-service');
            expect(service.baseUrl).toBe('http://localhost:3000');
            expect(gateway.services.has('test-service')).toBe(true);
        });

        test('should track metrics correctly', () => {
            const gateway = new UniversalAPIGateway();
            const initialMetrics = gateway.getMetrics();
            
            expect(initialMetrics.requests).toBe(0);
            expect(initialMetrics.errors).toBe(0);
            expect(initialMetrics.activeConnections).toBe(0);
        });
    });

    describe('Data Harmonization Engine', () => {
        let harmonization;

        beforeEach(() => {
            harmonization = new DataHarmonizationEngine();
        });

        test('should harmonize agent data correctly', async () => {
            const agentData = {
                agentId: 'test_agent_001',
                traits: { intelligence: 0.8 },
                x: 100,
                y: 200
            };

            const harmonized = await harmonization.harmonizeData(agentData, 'agent', 'standard');
            
            expect(harmonized.id).toBe('test_agent_001');
            expect(harmonized.type).toBe('ai');
            expect(harmonized.position.x).toBe(100);
            expect(harmonized.position.y).toBe(200);
        });

        test('should validate data according to schema', async () => {
            const invalidData = {
                // Missing required fields
                traits: { intelligence: 0.8 }
            };

            await expect(harmonization.harmonizeData(invalidData, 'agent', 'standard'))
                .rejects.toThrow('Schema validation failed');
        });

        test('should handle batch harmonization', async () => {
            const batchData = [
                { agentId: 'agent_001', traits: {}, x: 0, y: 0 },
                { agentId: 'agent_002', traits: {}, x: 10, y: 10 },
                { agentId: 'agent_003', traits: {}, x: 20, y: 20 }
            ];

            const result = await harmonization.batchHarmonize(batchData, 'agent', 'standard');
            
            expect(result.results).toHaveLength(3);
            expect(result.errors).toHaveLength(0);
        });

        test('should cache transformation results', async () => {
            const data = { agentId: 'cache_test', traits: {}, x: 0, y: 0 };
            
            // First call
            const start1 = Date.now();
            await harmonization.harmonizeData(data, 'agent', 'standard');
            const duration1 = Date.now() - start1;
            
            // Second call (should be faster due to caching)
            const start2 = Date.now();
            await harmonization.harmonizeData(data, 'agent', 'standard');
            const duration2 = Date.now() - start2;
            
            expect(duration2).toBeLessThan(duration1);
            expect(harmonization.getStatistics().cacheHits).toBeGreaterThan(0);
        });
    });

    describe('Workflow Automation Engine', () => {
        let automation;

        beforeEach(() => {
            automation = new WorkflowAutomationEngine();
        });

        test('should create workflow from template', async () => {
            const workflowId = await automation.createWorkflow('agent_interaction', {
                source: 'agent_001',
                target: 'agent_002'
            });
            
            expect(workflowId).toBeDefined();
            expect(workflowId.startsWith('wf_')).toBe(true);
            
            const workflow = automation.getWorkflow(workflowId);
            expect(workflow.templateName).toBe('agent_interaction');
            expect(workflow.status).toBe('created');
        });

        test('should execute workflow successfully', async () => {
            const workflowId = await automation.createWorkflow('agent_interaction', {
                source: 'agent_001',
                target: 'agent_002'
            });
            
            const result = await automation.executeWorkflow(workflowId);
            
            expect(result.success).toBe(true);
            expect(result.completedSteps).toBe(result.totalSteps);
        });

        test('should handle workflow dependencies correctly', async () => {
            const workflowId = await automation.createWorkflow('economic_transaction', {
                from: 'account_001',
                to: 'account_002',
                amount: 1000
            });
            
            const workflow = automation.getWorkflow(workflowId);
            const executionGraph = automation.buildExecutionGraph(workflow.steps);
            
            // Check that dependent steps have correct in-degree
            expect(executionGraph.inDegree.get('validate_transaction')).toBe(0);
            expect(executionGraph.inDegree.get('fraud_check')).toBe(1);
            expect(executionGraph.inDegree.get('execute_transaction')).toBe(1);
        });

        test('should track execution statistics', async () => {
            const initialStats = automation.getStatistics();
            
            const workflowId = await automation.createWorkflow('agent_interaction', {});
            await automation.executeWorkflow(workflowId);
            
            const finalStats = automation.getStatistics();
            
            expect(finalStats.totalExecutions).toBe(initialStats.totalExecutions + 1);
            expect(finalStats.successfulExecutions).toBe(initialStats.successfulExecutions + 1);
        });
    });

    describe('System Interoperability Framework', () => {
        let interop;

        beforeEach(() => {
            interop = new SystemInteroperabilityFramework();
        });

        test('should register services and adapters', () => {
            interop.registerService('test-service', {
                baseUrl: 'http://localhost:3000',
                healthEndpoint: '/health'
            });

            expect(interop.services.has('test-service')).toBe(true);
            expect(interop.getRegisteredServices()).toContain('test-service');
        });

        test('should handle circuit breaker functionality', () => {
            interop.registerService('unreliable-service', {
                baseUrl: 'http://localhost:9999', // Non-existent service
                healthEndpoint: '/health'
            });

            expect(interop.circuitBreakers.has('unreliable-service')).toBe(true);
        });

        test('should provide service discovery', async () => {
            const services = await interop.discoverServices();
            expect(Array.isArray(services)).toBe(true);
        });

        test('should track communication statistics', () => {
            const stats = interop.getStatistics();
            
            expect(stats.totalMessages).toBeDefined();
            expect(stats.successfulMessages).toBeDefined();
            expect(stats.failedMessages).toBeDefined();
            expect(stats.registeredServices).toBeDefined();
        });
    });

    describe('Event-Driven Architecture', () => {
        let events;

        beforeEach(() => {
            events = new EventDrivenArchitecture();
        });

        test('should publish and subscribe to events', (done) => {
            const subscriptionId = events.subscribe('test.event', (event) => {
                expect(event.type).toBe('test.event');
                expect(event.payload.message).toBe('Hello World');
                events.unsubscribe(subscriptionId);
                done();
            });

            events.publishEvent('test.event', { message: 'Hello World' });
        });

        test('should handle event correlation', async () => {
            let correlationDetected = false;
            
            events.on('correlation_detected', () => {
                correlationDetected = true;
            });

            // Publish events that should trigger correlation
            for (let i = 0; i < 3; i++) {
                await events.publishEvent('market.trade', {
                    symbol: 'TEST_COIN',
                    price: 100 + i,
                    volume: 1000
                });
            }

            // Wait a bit for correlation processing
            await new Promise(resolve => setTimeout(resolve, 100));
            
            expect(correlationDetected).toBe(true);
        });

        test('should support event replay', async () => {
            // Publish some events
            await events.publishEvent('replay.test', { id: 1 });
            await events.publishEvent('replay.test', { id: 2 });
            await events.publishEvent('replay.test', { id: 3 });

            const aggregateEvents = events.getAggregateEvents('global');
            expect(aggregateEvents.length).toBeGreaterThanOrEqual(3);

            // Test replay
            const replayedEvents = await events.replayEvents('global', 0);
            expect(replayedEvents.length).toBeGreaterThanOrEqual(3);
        });

        test('should validate event schemas', async () => {
            const validEvent = {
                agentId: 'agent_001',
                action: 'test_action',
                timestamp: Date.now()
            };

            await expect(events.publishEvent('agent.action', validEvent))
                .resolves.toBeDefined();

            const invalidEvent = {
                // Missing required fields
                action: 'test_action'
            };

            await expect(events.publishEvent('agent.action', invalidEvent))
                .rejects.toThrow();
        });
    });

    describe('Integration Monitoring Analytics', () => {
        let monitoring;

        beforeEach(() => {
            monitoring = new IntegrationMonitoringAnalytics();
        });

        test('should record and retrieve metrics', () => {
            monitoring.recordMetric('test.metric', 42, { tag: 'test' });
            
            const stats = monitoring.getStatistics();
            expect(stats.totalMetrics).toBeGreaterThan(0);
            
            const latestValue = monitoring.getLatestMetricValue('test.metric');
            expect(latestValue).toBe(42);
        });

        test('should generate alerts on threshold breach', () => {
            let alertGenerated = false;
            
            monitoring.on('alert_generated', () => {
                alertGenerated = true;
            });

            monitoring.registerMetric('alert.test', {
                type: 'gauge',
                thresholds: { warning: 50, critical: 100 }
            });

            monitoring.recordMetric('alert.test', 150); // Should trigger critical alert
            
            expect(alertGenerated).toBe(true);
        });

        test('should detect anomalies', () => {
            // Register an anomaly detector
            monitoring.anomalyDetectors.set('test_detector', {
                metric: 'anomaly.test',
                algorithm: 'z_score',
                threshold: 2.0,
                windowSize: 10,
                data: []
            });

            // Generate normal data points
            for (let i = 0; i < 10; i++) {
                monitoring.recordMetric('anomaly.test', 100 + Math.random() * 5);
            }

            // Generate anomalous data point
            monitoring.recordMetric('anomaly.test', 200); // Significant outlier

            const detector = monitoring.anomalyDetectors.get('test_detector');
            expect(detector.data.length).toBe(10); // Window size maintained
        });

        test('should generate system health reports', () => {
            // Record some metrics
            monitoring.recordMetric('system.cpu_usage', 0.75);
            monitoring.recordMetric('system.memory_usage', 0.60);
            monitoring.recordMetric('gateway.response_time', 150);

            const report = monitoring.generateReport('system_health');
            
            expect(report.type).toBe('system_health');
            expect(report.data).toBeDefined();
            expect(report.data.overallHealth).toBeDefined();
        });
    });

    describe('Full Integration Tests', () => {
        test('should coordinate all components together', async () => {
            // Test that orchestrator initializes all components
            expect(orchestrator.getGateway()).toBeDefined();
            expect(orchestrator.getHarmonization()).toBeDefined();
            expect(orchestrator.getAutomation()).toBeDefined();
            expect(orchestrator.getInteroperability()).toBeDefined();
            expect(orchestrator.getEvents()).toBeDefined();
            expect(orchestrator.getMonitoring()).toBeDefined();
        });

        test('should handle end-to-end data flow', async () => {
            // Simulate data coming from an external system
            const rawData = {
                agentId: 'integration_test_agent',
                traits: { intelligence: 0.9 },
                x: 100,
                y: 200
            };

            // Process through harmonization
            const harmonizedData = await orchestrator.processData(rawData, 'agent', 'standard');
            expect(harmonizedData.id).toBe('integration_test_agent');

            // Publish as event
            const event = await orchestrator.publishEvent('agent.created', harmonizedData);
            expect(event.type).toBe('agent.created');

            // Execute related workflow
            const workflowResult = await orchestrator.executeWorkflow('agent_interaction', {
                source: harmonizedData.id,
                target: 'system'
            });
            expect(workflowResult.success).toBe(true);

            // Verify monitoring captured the activity
            const healthStatus = orchestrator.getSystemHealth();
            expect(healthStatus.status).toBeDefined();
        });

        test('should maintain system health during load', async () => {
            const initialHealth = orchestrator.getSystemHealth();
            
            // Simulate moderate load
            const promises = [];
            for (let i = 0; i < 10; i++) {
                promises.push(
                    orchestrator.publishEvent('load.test', { iteration: i })
                );
            }
            
            await Promise.all(promises);
            
            const finalHealth = orchestrator.getSystemHealth();
            expect(finalHealth.status).not.toBe('critical');
        });

        test('should handle component failures gracefully', async () => {
            // Test that system remains operational if a component fails
            const monitoring = orchestrator.getMonitoring();
            
            // Simulate component error
            monitoring.emit('error', new Error('Simulated component failure'));
            
            // System should still respond
            const health = orchestrator.getSystemHealth();
            expect(health).toBeDefined();
        });
    });

    describe('Performance Tests', () => {
        test('should handle high event throughput', async () => {
            const startTime = Date.now();
            const eventCount = 1000;
            
            const promises = [];
            for (let i = 0; i < eventCount; i++) {
                promises.push(
                    orchestrator.publishEvent('performance.test', { id: i })
                );
            }
            
            await Promise.all(promises);
            
            const duration = Date.now() - startTime;
            const throughput = eventCount / (duration / 1000); // events per second
            
            expect(throughput).toBeGreaterThan(100); // Should handle at least 100 events/sec
        });

        test('should maintain response times under load', async () => {
            const responseTimes = [];
            
            for (let i = 0; i < 100; i++) {
                const start = Date.now();
                
                await orchestrator.processData(
                    { agentId: `perf_test_${i}`, traits: {}, x: i, y: i },
                    'agent',
                    'standard'
                );
                
                responseTimes.push(Date.now() - start);
            }
            
            const avgResponseTime = responseTimes.reduce((a, b) => a + b) / responseTimes.length;
            const p95ResponseTime = responseTimes.sort((a, b) => a - b)[Math.floor(responseTimes.length * 0.95)];
            
            expect(avgResponseTime).toBeLessThan(100); // Average under 100ms
            expect(p95ResponseTime).toBeLessThan(500); // 95th percentile under 500ms
        });
    });
});

module.exports = {
    // Export test utilities for use in other test files
    createTestOrchestrator: () => new EcosystemIntegrationOrchestrator({
        gateway: { port: 9091 },
        monitoring: { enableRealTimeAlerts: false }
    })
};
#!/usr/bin/env node
/**
 * Phase 2 Integration Testing Demonstration
 * Quick demonstration of the comprehensive testing suite
 */

const Phase2IntegrationTestRunner = require('./test-runner');

async function runDemo() {
    console.log('🚀 Phase 2 Integration Testing Suite - DEMONSTRATION MODE\n');
    console.log('🎯 This demo will run a scaled-down version of the full test suite');
    console.log('📊 For production testing, increase maxAgents and enable all components\n');

    // Demo configuration (scaled down for demonstration)
    const demoConfig = {
        maxAgents: 1000, // Reduced for demo
        enablePerformanceValidation: true,
        enableLoadTesting: true,
        enableScenarioTesting: true,
        enableStressTest: false, // Disabled for demo
        testSuiteConfig: {
            testDuration: 60000, // 1 minute
            emergentThreshold: 0.6
        },
        performanceConfig: {
            targetLatency: 100,
            targetThroughput: 1000,
            monitoringInterval: 10000 // 10 seconds
        },
        loadTestConfig: {
            maxConcurrentOperations: 1000,
            stressTestDuration: 60000, // 1 minute
            rampUpDuration: 15000, // 15 seconds
            enableClusterMode: false // Disabled for demo
        },
        scenarioConfig: {
            scenarioDuration: 60000, // 1 minute
            complexityLevel: 'medium'
        },
        outputDir: './demo-results'
    };

    try {
        const testRunner = new Phase2IntegrationTestRunner(demoConfig);
        const results = await testRunner.runComprehensiveTests();

        console.log('\n🎉 DEMONSTRATION COMPLETE!');
        console.log('📋 Demo Results Summary:');
        console.log(`   Overall Score: ${(results.metadata.executionMetrics.overallScore * 100).toFixed(1)}%`);
        console.log(`   Components Run: ${results.metadata.executionMetrics.componentsRun}`);
        console.log(`   Duration: ${Math.round(results.metadata.executionMetrics.totalDuration / 1000)} seconds`);
        
        if (results.detailedResults.overallMetrics) {
            const metrics = results.detailedResults.overallMetrics;
            console.log('\n📊 Key Metrics:');
            console.log(`   Agent Coordination: ${(metrics.agentCoordination.score * 100).toFixed(1)}%`);
            console.log(`   Emergent Behaviors: ${metrics.emergentBehavior.totalBehaviors} detected`);
            console.log(`   System Reliability: ${(metrics.reliability.score * 100).toFixed(1)}%`);
            console.log(`   Real-World Readiness: ${metrics.realWorldReadiness.status}`);
        }

        console.log('\n💡 To run full production testing:');
        console.log('   - Set maxAgents to 10,000+ for full scale testing');
        console.log('   - Enable stress testing for maximum load validation');
        console.log('   - Increase test durations for comprehensive validation');
        console.log('   - Enable cluster mode for distributed testing');

        return results;

    } catch (error) {
        console.error('❌ Demo failed:', error);
        process.exit(1);
    }
}

// Run demo if executed directly
if (require.main === module) {
    runDemo()
        .then(() => {
            console.log('\n✨ Phase 2 Integration Testing Demo Complete!');
            process.exit(0);
        })
        .catch(error => {
            console.error('Demo execution failed:', error);
            process.exit(1);
        });
}

module.exports = { runDemo };
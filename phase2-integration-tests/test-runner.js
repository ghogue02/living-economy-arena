/**
 * Phase 2 Integration Test Runner
 * Master controller for comprehensive Phase 2 testing suite
 */

const Phase2IntegrationTestSuite = require('./index');
const Phase2TestImplementations = require('./test-implementations');
const Phase2PerformanceValidator = require('./performance-validator');
const Phase2LoadTestingFramework = require('./load-testing-framework');
const Phase2ScenarioTesting = require('./scenario-testing');

class Phase2IntegrationTestRunner {
    constructor(config = {}) {
        this.config = {
            maxAgents: config.maxAgents || 10000,
            enablePerformanceValidation: config.enablePerformanceValidation !== false,
            enableLoadTesting: config.enableLoadTesting !== false,
            enableScenarioTesting: config.enableScenarioTesting !== false,
            enableStressTest: config.enableStressTest !== false,
            testSuiteConfig: config.testSuiteConfig || {},
            performanceConfig: config.performanceConfig || {},
            loadTestConfig: config.loadTestConfig || {},
            scenarioConfig: config.scenarioConfig || {},
            reportFormat: config.reportFormat || 'comprehensive',
            outputDir: config.outputDir || './test-results',
            ...config
        };

        this.testComponents = {};
        this.testResults = {
            integrationTests: null,
            performanceValidation: null,
            loadTesting: null,
            scenarioTesting: null,
            overallMetrics: null
        };

        this.executionMetrics = {
            startTime: null,
            endTime: null,
            totalDuration: 0,
            componentsRun: 0,
            componentsFailed: 0,
            overallScore: 0
        };
    }

    /**
     * Initialize all test components
     */
    async initializeTestComponents() {
        console.log('🔧 Initializing Phase 2 test components...\n');

        try {
            // Integration Test Suite
            this.testComponents.integrationSuite = new Phase2IntegrationTestSuite({
                maxAgents: this.config.maxAgents,
                ...this.config.testSuiteConfig
            });

            // Performance Validator
            if (this.config.enablePerformanceValidation) {
                this.testComponents.performanceValidator = new Phase2PerformanceValidator({
                    maxAgents: this.config.maxAgents,
                    ...this.config.performanceConfig
                });
            }

            // Load Testing Framework
            if (this.config.enableLoadTesting) {
                this.testComponents.loadTestingFramework = new Phase2LoadTestingFramework({
                    maxAgents: this.config.maxAgents,
                    enableStressTest: this.config.enableStressTest,
                    ...this.config.loadTestConfig
                });
            }

            // Scenario Testing
            if (this.config.enableScenarioTesting) {
                this.testComponents.scenarioTesting = new Phase2ScenarioTesting({
                    maxAgents: this.config.maxAgents,
                    ...this.config.scenarioConfig
                });
            }

            console.log('✅ All test components initialized successfully\n');

        } catch (error) {
            console.error('❌ Failed to initialize test components:', error);
            throw error;
        }
    }

    /**
     * Run comprehensive Phase 2 integration testing
     */
    async runComprehensiveTests() {
        console.log('🚀 Starting Comprehensive Phase 2 Integration Testing\n');
        console.log('=' * 80);
        console.log('🧠 PHASE 2 AGENT INTELLIGENCE HIVE MIND TESTING');
        console.log('🎯 Mission: 10,000+ Agent Coordination & Emergent Behavior Validation');
        console.log('=' * 80);
        console.log();

        this.executionMetrics.startTime = Date.now();

        try {
            await this.initializeTestComponents();

            // Component 1: Core Integration Tests
            if (this.testComponents.integrationSuite) {
                console.log('📋 COMPONENT 1: Core Integration Testing');
                console.log('-' * 50);
                
                try {
                    await this.testComponents.integrationSuite.initializeTestSuite();
                    const integrationResults = await this.testComponents.integrationSuite.runIntegrationTests();
                    
                    this.testResults.integrationTests = integrationResults;
                    this.executionMetrics.componentsRun++;
                    
                    console.log('✅ Core integration testing completed\n');
                    
                } catch (error) {
                    console.error('❌ Core integration testing failed:', error.message);
                    this.executionMetrics.componentsFailed++;
                }
            }

            // Component 2: Performance Validation
            if (this.testComponents.performanceValidator) {
                console.log('📊 COMPONENT 2: Performance Validation');
                console.log('-' * 50);
                
                try {
                    await this.testComponents.performanceValidator.startMonitoring();
                    
                    // Run validation for 2 minutes
                    const validationDuration = 120000;
                    console.log(`  🔄 Running performance validation for ${validationDuration/1000} seconds...`);
                    
                    await new Promise(resolve => setTimeout(resolve, validationDuration));
                    
                    await this.testComponents.performanceValidator.stopMonitoring();
                    const performanceReport = this.testComponents.performanceValidator.generatePerformanceReport();
                    
                    this.testResults.performanceValidation = performanceReport;
                    this.executionMetrics.componentsRun++;
                    
                    console.log('✅ Performance validation completed\n');
                    
                } catch (error) {
                    console.error('❌ Performance validation failed:', error.message);
                    this.executionMetrics.componentsFailed++;
                }
            }

            // Component 3: Load Testing
            if (this.testComponents.loadTestingFramework) {
                console.log('🔥 COMPONENT 3: Load Testing');
                console.log('-' * 50);
                
                try {
                    const loadTestResults = await this.testComponents.loadTestingFramework.runLoadTestSuite();
                    
                    this.testResults.loadTesting = loadTestResults;
                    this.executionMetrics.componentsRun++;
                    
                    console.log('✅ Load testing completed\n');
                    
                } catch (error) {
                    console.error('❌ Load testing failed:', error.message);
                    this.executionMetrics.componentsFailed++;
                }
            }

            // Component 4: Real-World Scenario Testing
            if (this.testComponents.scenarioTesting) {
                console.log('🌍 COMPONENT 4: Real-World Scenario Testing');
                console.log('-' * 50);
                
                try {
                    const scenarioResults = await this.testComponents.scenarioTesting.runScenarioTestingSuite();
                    
                    this.testResults.scenarioTesting = scenarioResults;
                    this.executionMetrics.componentsRun++;
                    
                    console.log('✅ Scenario testing completed\n');
                    
                } catch (error) {
                    console.error('❌ Scenario testing failed:', error.message);
                    this.executionMetrics.componentsFailed++;
                }
            }

            // Calculate overall metrics
            this.testResults.overallMetrics = await this.calculateOverallMetrics();
            this.executionMetrics.endTime = Date.now();
            this.executionMetrics.totalDuration = this.executionMetrics.endTime - this.executionMetrics.startTime;

            // Generate comprehensive report
            const finalReport = await this.generateComprehensiveReport();

            console.log('🏁 COMPREHENSIVE TESTING COMPLETE!');
            console.log('=' * 80);
            
            this.printExecutionSummary();
            
            return finalReport;

        } catch (error) {
            console.error('❌ Comprehensive testing failed:', error);
            this.executionMetrics.endTime = Date.now();
            throw error;
        }
    }

    /**
     * Calculate overall metrics across all test components
     */
    async calculateOverallMetrics() {
        console.log('📊 Calculating overall test metrics...');

        const metrics = {
            testSuiteExecution: {
                totalComponents: Object.keys(this.testComponents).length,
                componentsRun: this.executionMetrics.componentsRun,
                componentsFailed: this.executionMetrics.componentsFailed,
                successRate: this.executionMetrics.componentsRun / Object.keys(this.testComponents).length
            },
            systemPerformance: this.extractPerformanceMetrics(),
            agentCoordination: this.extractCoordinationMetrics(),
            emergentBehavior: this.extractEmergentBehaviorMetrics(),
            scalability: this.extractScalabilityMetrics(),
            reliability: this.extractReliabilityMetrics(),
            realWorldReadiness: this.extractRealWorldReadinessMetrics()
        };

        // Calculate overall score
        const scores = [
            metrics.testSuiteExecution.successRate,
            metrics.systemPerformance.score || 0.5,
            metrics.agentCoordination.score || 0.5,
            metrics.emergentBehavior.score || 0.5,
            metrics.scalability.score || 0.5,
            metrics.reliability.score || 0.5,
            metrics.realWorldReadiness.score || 0.5
        ];

        this.executionMetrics.overallScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        metrics.overallScore = this.executionMetrics.overallScore;

        return metrics;
    }

    extractPerformanceMetrics() {
        if (!this.testResults.performanceValidation) {
            return { score: 0.5, details: 'Performance validation not run' };
        }

        const summary = this.testResults.performanceValidation.summary;
        return {
            score: summary?.overallScore || 0.5,
            latency: summary?.averageLatency || 'N/A',
            throughput: summary?.peakThroughput || 'N/A',
            memoryEfficiency: summary?.memoryEfficiency || 'N/A',
            status: summary?.status || 'UNKNOWN'
        };
    }

    extractCoordinationMetrics() {
        if (!this.testResults.integrationTests) {
            return { score: 0.5, details: 'Integration tests not run' };
        }

        const agentCoordination = this.testResults.integrationTests.agentCoordination || [];
        const passedTests = agentCoordination.filter(test => test.status === 'PASS').length;
        const totalTests = agentCoordination.length;

        return {
            score: totalTests > 0 ? passedTests / totalTests : 0.5,
            passedTests,
            totalTests,
            efficiency: agentCoordination.find(test => test.test === 'hierarchical-coordination')?.efficiency || 'N/A'
        };
    }

    extractEmergentBehaviorMetrics() {
        let emergentBehaviors = 0;
        let totalConfidence = 0;

        // From integration tests
        if (this.testResults.integrationTests?.emergentBehavior) {
            const behaviors = this.testResults.integrationTests.emergentBehavior.filter(b => b.status === 'PASS');
            emergentBehaviors += behaviors.length;
            totalConfidence += behaviors.reduce((sum, b) => sum + (b.confidence || 0), 0);
        }

        // From scenario testing
        if (this.testResults.scenarioTesting?.summary?.emergentBehaviorsTotal) {
            emergentBehaviors += this.testResults.scenarioTesting.summary.emergentBehaviorsTotal;
        }

        return {
            score: Math.min(emergentBehaviors / 10, 1.0), // Target: 10 emergent behaviors
            totalBehaviors: emergentBehaviors,
            averageConfidence: totalConfidence > 0 ? totalConfidence / emergentBehaviors : 0,
            status: emergentBehaviors >= 5 ? 'EXCELLENT' : emergentBehaviors >= 3 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
        };
    }

    extractScalabilityMetrics() {
        if (!this.testResults.loadTesting) {
            return { score: 0.5, details: 'Load testing not run' };
        }

        const maxAgents = this.testResults.loadTesting.systemLimits?.maxAgentsReached || 0;
        const targetAgents = this.config.maxAgents;

        return {
            score: Math.min(maxAgents / targetAgents, 1.0),
            maxAgentsReached: maxAgents,
            targetAgents,
            scalabilityFactor: maxAgents / targetAgents,
            status: maxAgents >= targetAgents ? 'TARGET_MET' : 'BELOW_TARGET'
        };
    }

    extractReliabilityMetrics() {
        let errorRates = [];
        let systemStability = [];

        // From performance validation
        if (this.testResults.performanceValidation?.details?.validation) {
            const validations = this.testResults.performanceValidation.details.validation;
            validations.forEach(v => {
                if (v.results) {
                    Object.values(v.results).forEach(result => {
                        if (result.passed === false) {
                            errorRates.push(1);
                        } else {
                            errorRates.push(0);
                        }
                    });
                }
            });
        }

        // From load testing
        if (this.testResults.loadTesting?.scenarios) {
            this.testResults.loadTesting.scenarios.forEach(scenario => {
                if (scenario.result?.metrics?.totalErrors !== undefined) {
                    const errorRate = scenario.result.metrics.totalErrors / 1000; // Normalize
                    errorRates.push(Math.min(errorRate, 1));
                }
            });
        }

        const avgErrorRate = errorRates.length > 0 ? errorRates.reduce((sum, rate) => sum + rate, 0) / errorRates.length : 0;
        const reliabilityScore = Math.max(0, 1 - avgErrorRate);

        return {
            score: reliabilityScore,
            averageErrorRate: avgErrorRate,
            systemStability: systemStability.length > 0 ? systemStability.reduce((sum, s) => sum + s, 0) / systemStability.length : 0.8,
            status: reliabilityScore >= 0.95 ? 'EXCELLENT' : reliabilityScore >= 0.8 ? 'GOOD' : 'NEEDS_IMPROVEMENT'
        };
    }

    extractRealWorldReadinessMetrics() {
        if (!this.testResults.scenarioTesting) {
            return { score: 0.5, details: 'Scenario testing not run' };
        }

        const summary = this.testResults.scenarioTesting.summary;
        const avgScore = summary?.averageScore || 0.5;
        const completionRate = summary?.completedScenarios / summary?.totalScenarios || 0;

        return {
            score: (avgScore + completionRate) / 2,
            averageScenarioScore: avgScore,
            scenarioCompletionRate: completionRate,
            totalScenarios: summary?.totalScenarios || 0,
            completedScenarios: summary?.completedScenarios || 0,
            status: avgScore >= 0.8 ? 'PRODUCTION_READY' : avgScore >= 0.6 ? 'NEAR_READY' : 'NEEDS_WORK'
        };
    }

    /**
     * Generate comprehensive test report
     */
    async generateComprehensiveReport() {
        console.log('📄 Generating comprehensive test report...');

        const report = {
            metadata: {
                testSuite: 'Phase 2 Agent Intelligence Integration Testing',
                version: '2.0.0',
                timestamp: Date.now(),
                configuration: this.config,
                executionMetrics: this.executionMetrics
            },
            executiveSummary: this.generateExecutiveSummary(),
            detailedResults: this.testResults,
            overallMetrics: this.testResults.overallMetrics,
            recommendations: this.generateRecommendations(),
            nextSteps: this.generateNextSteps(),
            appendices: {
                testConfiguration: this.config,
                systemSpecifications: await this.getSystemSpecifications(),
                testEnvironment: await this.getTestEnvironment()
            }
        };

        // Save report if output directory specified
        if (this.config.outputDir) {
            await this.saveReport(report);
        }

        return report;
    }

    generateExecutiveSummary() {
        const overallScore = this.executionMetrics.overallScore;
        const status = overallScore >= 0.8 ? 'EXCELLENT' : overallScore >= 0.6 ? 'GOOD' : 'NEEDS_IMPROVEMENT';

        return {
            overallScore,
            status,
            testCompletionRate: this.executionMetrics.componentsRun / Object.keys(this.testComponents).length,
            totalTestDuration: this.executionMetrics.totalDuration,
            keyAchievements: this.identifyKeyAchievements(),
            criticalIssues: this.identifyCriticalIssues(),
            recommendation: this.getOverallRecommendation(status)
        };
    }

    identifyKeyAchievements() {
        const achievements = [];

        if (this.testResults.overallMetrics?.agentCoordination?.score >= 0.8) {
            achievements.push('Excellent agent coordination efficiency achieved');
        }

        if (this.testResults.overallMetrics?.emergentBehavior?.totalBehaviors >= 5) {
            achievements.push(`${this.testResults.overallMetrics.emergentBehavior.totalBehaviors} emergent behaviors successfully detected`);
        }

        if (this.testResults.overallMetrics?.scalability?.maxAgentsReached >= this.config.maxAgents) {
            achievements.push(`Target agent scale of ${this.config.maxAgents} achieved`);
        }

        if (this.testResults.overallMetrics?.realWorldReadiness?.status === 'PRODUCTION_READY') {
            achievements.push('System validated as production-ready for real-world scenarios');
        }

        return achievements;
    }

    identifyCriticalIssues() {
        const issues = [];

        if (this.executionMetrics.componentsFailed > 0) {
            issues.push(`${this.executionMetrics.componentsFailed} test components failed to complete`);
        }

        if (this.testResults.overallMetrics?.reliability?.score < 0.8) {
            issues.push('System reliability below acceptable threshold');
        }

        if (this.testResults.overallMetrics?.scalability?.score < 0.8) {
            issues.push('Scalability targets not met');
        }

        if (this.testResults.overallMetrics?.emergentBehavior?.totalBehaviors < 3) {
            issues.push('Insufficient emergent behavior detection');
        }

        return issues;
    }

    getOverallRecommendation(status) {
        switch (status) {
            case 'EXCELLENT':
                return 'System is ready for production deployment with full confidence in Phase 2 capabilities.';
            case 'GOOD':
                return 'System shows strong performance with minor optimizations recommended before production.';
            default:
                return 'System requires significant improvements before production deployment.';
        }
    }

    generateRecommendations() {
        const recommendations = [];

        // Collect recommendations from each test component
        if (this.testResults.performanceValidation?.recommendations) {
            recommendations.push(...this.testResults.performanceValidation.recommendations);
        }

        if (this.testResults.loadTesting?.recommendations) {
            recommendations.push(...this.testResults.loadTesting.recommendations);
        }

        if (this.testResults.scenarioTesting?.recommendations) {
            recommendations.push(...this.testResults.scenarioTesting.recommendations);
        }

        // Add overall recommendations
        if (this.executionMetrics.overallScore < 0.8) {
            recommendations.push({
                type: 'overall',
                priority: 'high',
                message: 'Overall test score below 0.8',
                suggestion: 'Review critical issues and implement improvements across all test areas'
            });
        }

        return recommendations;
    }

    generateNextSteps() {
        return [
            'Review detailed test results and recommendations',
            'Address any critical issues identified during testing',
            'Implement suggested optimizations for performance improvement',
            'Conduct targeted follow-up testing for failed components',
            'Prepare for production deployment based on test outcomes',
            'Establish monitoring and alerting for production environment',
            'Plan for Phase 3 enhancements based on lessons learned'
        ];
    }

    printExecutionSummary() {
        console.log('\n📊 EXECUTION SUMMARY');
        console.log('-' * 30);
        console.log(`Overall Score: ${(this.executionMetrics.overallScore * 100).toFixed(1)}%`);
        console.log(`Components Run: ${this.executionMetrics.componentsRun}/${Object.keys(this.testComponents).length}`);
        console.log(`Total Duration: ${Math.round(this.executionMetrics.totalDuration / 1000 / 60)} minutes`);
        console.log(`Status: ${this.executionMetrics.overallScore >= 0.8 ? '✅ EXCELLENT' : this.executionMetrics.overallScore >= 0.6 ? '⚠️ GOOD' : '❌ NEEDS IMPROVEMENT'}`);
        console.log();

        if (this.testResults.overallMetrics) {
            console.log('🎯 KEY METRICS');
            console.log('-' * 20);
            console.log(`Agent Coordination: ${(this.testResults.overallMetrics.agentCoordination.score * 100).toFixed(1)}%`);
            console.log(`Emergent Behaviors: ${this.testResults.overallMetrics.emergentBehavior.totalBehaviors} detected`);
            console.log(`Max Agents: ${this.testResults.overallMetrics.scalability.maxAgentsReached || 'N/A'}`);
            console.log(`System Reliability: ${(this.testResults.overallMetrics.reliability.score * 100).toFixed(1)}%`);
            console.log(`Real-World Readiness: ${this.testResults.overallMetrics.realWorldReadiness.status}`);
        }
        
        console.log('\n🏆 Phase 2 Integration Testing Complete!');
    }

    async getSystemSpecifications() {
        const os = require('os');
        return {
            platform: os.platform(),
            arch: os.arch(),
            cpus: os.cpus().length,
            totalMemory: Math.round(os.totalmem() / 1024 / 1024 / 1024) + ' GB',
            nodeVersion: process.version,
            timestamp: Date.now()
        };
    }

    async getTestEnvironment() {
        return {
            maxAgents: this.config.maxAgents,
            testComponents: Object.keys(this.testComponents),
            enabledFeatures: {
                performanceValidation: this.config.enablePerformanceValidation,
                loadTesting: this.config.enableLoadTesting,
                scenarioTesting: this.config.enableScenarioTesting,
                stressTest: this.config.enableStressTest
            }
        };
    }

    async saveReport(report) {
        const fs = require('fs').promises;
        const path = require('path');
        
        try {
            await fs.mkdir(this.config.outputDir, { recursive: true });
            
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `phase2-integration-test-report-${timestamp}.json`;
            const filepath = path.join(this.config.outputDir, filename);
            
            await fs.writeFile(filepath, JSON.stringify(report, null, 2));
            console.log(`📄 Test report saved: ${filepath}`);
            
        } catch (error) {
            console.error('❌ Failed to save test report:', error);
        }
    }
}

module.exports = Phase2IntegrationTestRunner;
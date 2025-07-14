/**
 * Main Security System - Integrated Security Infrastructure
 * Central coordinator for all security systems in the Living Economy Arena
 */

const TradePatternAnalyzer = require('./anti-cheat/trade-pattern-analyzer');
const AntiDuplicationSystem = require('./anti-cheat/anti-duplication-system');
const AdvancedRateLimiter = require('./anti-cheat/rate-limiter');
const StatisticalAnomalyDetector = require('./verification/statistical-anomaly-detector');
const { SecureRNG } = require('./verification/secure-rng');
const StateVerificationSystem = require('./verification/state-verification');
const ReplayValidationSystem = require('./verification/replay-validator');
const PunishmentSystem = require('./enforcement/punishment-system');
const TradeRollbackSystem = require('./enforcement/trade-rollback-system');
const SecurityAuditLogger = require('./logging/audit-logger');
const PenetrationTestingFramework = require('./testing/penetration-testing-framework');

class MainSecuritySystem {
    constructor(options = {}) {
        // Initialize all security subsystems
        this.patternAnalyzer = new TradePatternAnalyzer();
        this.antiDuplication = new AntiDuplicationSystem();
        this.rateLimiter = new AdvancedRateLimiter();
        this.anomalyDetector = new StatisticalAnomalyDetector();
        this.secureRNG = new SecureRNG(options.rng || {});
        this.stateVerification = new StateVerificationSystem(options.state || {});
        this.replayValidator = new ReplayValidationSystem(options.replay || {});
        this.punishmentSystem = new PunishmentSystem(options.punishment || {});
        this.rollbackSystem = new TradeRollbackSystem(options.rollback || {});
        this.auditLogger = new SecurityAuditLogger(options.logging || {});
        this.pentestFramework = new PenetrationTestingFramework(options.pentest || {});
        
        // Configuration
        this.config = {
            // Integration settings
            enableRealTimeMonitoring: true,
            crossSystemValidation: true,
            automaticThreatResponse: true,
            
            // Thresholds
            anomalyThreshold: 0.8,
            suspicionThreshold: 0.7,
            autoRollbackThreshold: 0.9,
            
            // Performance
            maxConcurrentChecks: 100,
            checkTimeout: 30000,
            
            // Reporting
            generateDailyReports: true,
            alertOnCriticalIssues: true,
            integrateWithExternal: false
        };
        
        // System state
        this.securityLevel = 'NORMAL';
        this.threatLevel = 'LOW';
        this.activeThreats = new Set();
        this.systemMetrics = new Map();
        
        // Start integrated monitoring
        this.startIntegratedMonitoring();
        
        // Log system initialization
        this.auditLogger.logSystemEvent('SECURITY_SYSTEM_INITIALIZED', {
            subsystems: [
                'TradePatternAnalyzer',
                'AntiDuplicationSystem', 
                'AdvancedRateLimiter',
                'StatisticalAnomalyDetector',
                'SecureRNG',
                'StateVerificationSystem',
                'ReplayValidationSystem',
                'PunishmentSystem',
                'TradeRollbackSystem',
                'SecurityAuditLogger',
                'PenetrationTestingFramework'
            ],
            config: this.config,
            timestamp: Date.now()
        });
    }

    /**
     * Comprehensive security check for all trading operations
     */
    async performSecurityCheck(operation) {
        const checkId = this.generateCheckId();
        const startTime = Date.now();
        
        try {
            await this.auditLogger.logSecurityEvent('SECURITY_CHECK_STARTED', {
                checkId,
                operationType: operation.type,
                userId: operation.userId,
                details: this.sanitizeOperation(operation)
            });
            
            const securityResults = {
                checkId,
                operation,
                timestamp: startTime,
                results: {},
                overallRisk: 0,
                recommendations: [],
                approved: false,
                blockers: []
            };
            
            // 1. Rate limiting check
            const rateLimitResult = await this.rateLimiter.checkRateLimit(
                operation.userId, 
                operation.type, 
                operation.metadata || {}
            );
            
            securityResults.results.rateLimit = rateLimitResult;
            
            if (!rateLimitResult.allowed) {
                securityResults.blockers.push('RATE_LIMIT_EXCEEDED');
                await this.handleViolation(operation.userId, 'RATE_LIMIT_VIOLATION', rateLimitResult);
            }
            
            // 2. Trade pattern analysis (if trading operation)
            if (operation.type.includes('TRADE')) {
                const patternResult = this.patternAnalyzer.analyzeTrade(operation);
                securityResults.results.patternAnalysis = patternResult;
                
                if (patternResult.suspicionScore > this.config.suspicionThreshold) {
                    securityResults.blockers.push('SUSPICIOUS_PATTERN');
                    await this.handleViolation(operation.userId, 'BOT_USAGE', patternResult);
                }
                
                securityResults.overallRisk = Math.max(securityResults.overallRisk, patternResult.suspicionScore);
            }
            
            // 3. Statistical anomaly detection
            if (operation.type.includes('TRADE') || operation.type.includes('TRANSFER')) {
                const anomalyResult = this.anomalyDetector.analyzeTrade(operation);
                securityResults.results.anomalyDetection = anomalyResult;
                
                if (anomalyResult.anomalyScore > this.config.anomalyThreshold) {
                    securityResults.blockers.push('STATISTICAL_ANOMALY');
                    await this.handleViolation(operation.userId, 'STATISTICAL_ANOMALY', anomalyResult);
                }
                
                securityResults.overallRisk = Math.max(securityResults.overallRisk, anomalyResult.anomalyScore);
            }
            
            // 4. Anti-duplication check (for item/currency operations)
            if (operation.type.includes('TRANSFER') || operation.type.includes('CREATE')) {
                try {
                    const duplicationResult = this.antiDuplication.detectDuplicationAttempt(operation);
                    securityResults.results.duplicationCheck = duplicationResult;
                    
                    if (duplicationResult.isDuplicate) {
                        securityResults.blockers.push('DUPLICATION_DETECTED');
                        await this.handleViolation(operation.userId, 'DUPLICATION_EXPLOIT', duplicationResult);
                    }
                } catch (error) {
                    // Log but don't block for duplication check errors
                    await this.auditLogger.logSecurityEvent('DUPLICATION_CHECK_ERROR', {
                        checkId,
                        error: error.message,
                        operation: operation.type
                    });
                }
            }
            
            // 5. State verification (for state-changing operations)
            if (operation.stateData) {
                try {
                    const stateResult = await this.stateVerification.verifyAndRetrieveState(
                        operation.stateId,
                        operation.userId
                    );
                    securityResults.results.stateVerification = { valid: true, verified: stateResult };
                } catch (error) {
                    securityResults.results.stateVerification = { valid: false, error: error.message };
                    securityResults.blockers.push('STATE_VERIFICATION_FAILED');
                    await this.handleViolation(operation.userId, 'STATE_TAMPERING', { error: error.message });
                }
            }
            
            // 6. Replay validation (for recorded operations)
            if (operation.recordReplay) {
                try {
                    const replayResult = await this.replayValidator.recordAction(
                        operation.userId,
                        operation.type,
                        operation.data,
                        operation.metadata
                    );
                    securityResults.results.replayValidation = replayResult;
                } catch (error) {
                    securityResults.results.replayValidation = { valid: false, error: error.message };
                    await this.handleViolation(operation.userId, 'REPLAY_ATTACK', { error: error.message });
                }
            }
            
            // 7. Cross-system validation
            if (this.config.crossSystemValidation) {
                const crossValidation = await this.performCrossSystemValidation(operation, securityResults);
                securityResults.results.crossValidation = crossValidation;
                
                if (!crossValidation.valid) {
                    securityResults.blockers.push('CROSS_VALIDATION_FAILED');
                }
            }
            
            // Determine final approval
            securityResults.approved = securityResults.blockers.length === 0;
            
            // Generate recommendations
            securityResults.recommendations = this.generateSecurityRecommendations(securityResults);
            
            // Calculate execution time
            securityResults.executionTime = Date.now() - startTime;
            
            // Log completion
            await this.auditLogger.logSecurityEvent('SECURITY_CHECK_COMPLETED', {
                checkId,
                approved: securityResults.approved,
                blockers: securityResults.blockers,
                overallRisk: securityResults.overallRisk,
                executionTime: securityResults.executionTime
            });
            
            // Update system metrics
            this.updateSystemMetrics(securityResults);
            
            return securityResults;
            
        } catch (error) {
            await this.auditLogger.logSecurityEvent('SECURITY_CHECK_FAILED', {
                checkId,
                error: error.message,
                operation: operation.type,
                userId: operation.userId
            });
            throw error;
        }
    }

    /**
     * Handle security violations with integrated response
     */
    async handleViolation(userId, violationType, evidence) {
        try {
            // Log the violation
            await this.auditLogger.logSecurityEvent('SECURITY_VIOLATION_DETECTED', {
                userId,
                violationType,
                evidence: this.sanitizeEvidence(evidence),
                timestamp: Date.now()
            });
            
            // Report to punishment system
            const punishmentResult = await this.punishmentSystem.reportViolation(
                userId,
                violationType,
                evidence
            );
            
            // Check if rollback is needed
            if (violationType === 'DUPLICATION_EXPLOIT' || 
                (evidence.anomalyScore && evidence.anomalyScore > this.config.autoRollbackThreshold)) {
                
                await this.initiateSecurityRollback(userId, violationType, evidence);
            }
            
            // Update threat level
            this.updateThreatLevel(violationType, evidence);
            
            // Send security alert if critical
            if (this.isCriticalViolation(violationType)) {
                await this.sendSecurityAlert(userId, violationType, evidence);
            }
            
            return punishmentResult;
            
        } catch (error) {
            await this.auditLogger.logSecurityEvent('VIOLATION_HANDLING_FAILED', {
                userId,
                violationType,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Initiate security rollback for critical violations
     */
    async initiateSecurityRollback(userId, violationType, evidence) {
        try {
            // Find recent transactions that might need rollback
            const suspiciousTransactions = await this.findSuspiciousTransactions(userId, evidence);
            
            if (suspiciousTransactions.length > 0) {
                const rollbackResult = await this.rollbackSystem.initiateRollback(
                    suspiciousTransactions[0].id,
                    violationType,
                    evidence,
                    {
                        initiatedBy: 'SECURITY_SYSTEM',
                        autoExecute: true,
                        reason: `Automatic rollback due to ${violationType}`
                    }
                );
                
                await this.auditLogger.logSecurityEvent('SECURITY_ROLLBACK_INITIATED', {
                    userId,
                    violationType,
                    rollbackId: rollbackResult.rollbackId,
                    affectedTransactions: rollbackResult.affectedTransactions
                });
                
                return rollbackResult;
            }
            
        } catch (error) {
            await this.auditLogger.logSecurityEvent('SECURITY_ROLLBACK_FAILED', {
                userId,
                violationType,
                error: error.message
            });
        }
    }

    /**
     * Perform cross-system validation
     */
    async performCrossSystemValidation(operation, currentResults) {
        const validationResults = {
            valid: true,
            checks: [],
            confidence: 1.0
        };
        
        try {
            // Check consistency between systems
            if (currentResults.results.patternAnalysis && currentResults.results.anomalyDetection) {
                const patternRisk = currentResults.results.patternAnalysis.suspicionScore || 0;
                const anomalyRisk = currentResults.results.anomalyDetection.anomalyScore || 0;
                
                // Look for inconsistencies
                if (Math.abs(patternRisk - anomalyRisk) > 0.5) {
                    validationResults.checks.push({
                        check: 'RISK_CONSISTENCY',
                        passed: false,
                        details: `Pattern risk (${patternRisk}) and anomaly risk (${anomalyRisk}) are inconsistent`
                    });
                    validationResults.confidence *= 0.8;
                }
            }
            
            // Validate user status across systems
            const userStatus = await this.punishmentSystem.getUserStatus(operation.userId);
            if (userStatus.isSuspended || userStatus.isBanned) {
                validationResults.valid = false;
                validationResults.checks.push({
                    check: 'USER_STATUS',
                    passed: false,
                    details: `User is ${userStatus.isSuspended ? 'suspended' : 'banned'}`
                });
            }
            
            // Check system health
            const systemHealth = this.getSystemHealth();
            if (systemHealth.overallHealth !== 'HEALTHY') {
                validationResults.confidence *= 0.9;
                validationResults.checks.push({
                    check: 'SYSTEM_HEALTH',
                    passed: false,
                    details: `System health is ${systemHealth.overallHealth}`
                });
            }
            
        } catch (error) {
            validationResults.valid = false;
            validationResults.checks.push({
                check: 'VALIDATION_ERROR',
                passed: false,
                details: error.message
            });
        }
        
        return validationResults;
    }

    /**
     * Generate security random numbers through secure RNG
     */
    async generateSecureRandom(min, max, purpose, metadata = {}) {
        try {
            const randomResult = await this.secureRNG.generateSecureRandom(min, max, purpose, metadata);
            
            await this.auditLogger.logSecurityEvent('SECURE_RANDOM_GENERATED', {
                purpose,
                generationId: randomResult.generationId,
                isVerified: randomResult.isVerified
            });
            
            return randomResult;
            
        } catch (error) {
            await this.auditLogger.logSecurityEvent('SECURE_RANDOM_FAILED', {
                purpose,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Create secure state for client verification
     */
    async createSecureState(userId, stateData, metadata = {}) {
        try {
            const stateResult = await this.stateVerification.createState(userId, stateData, metadata);
            
            await this.auditLogger.logSecurityEvent('SECURE_STATE_CREATED', {
                userId,
                stateId: stateResult.stateId,
                integrityHash: stateResult.integrityHash
            });
            
            return stateResult;
            
        } catch (error) {
            await this.auditLogger.logSecurityEvent('SECURE_STATE_CREATION_FAILED', {
                userId,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Run automated penetration testing
     */
    async runSecurityAssessment(target, options = {}) {
        try {
            await this.auditLogger.logSecurityEvent('SECURITY_ASSESSMENT_STARTED', {
                target: target.name,
                options
            });
            
            const assessmentResult = await this.pentestFramework.runPenetrationTest(target, options);
            
            await this.auditLogger.logSecurityEvent('SECURITY_ASSESSMENT_COMPLETED', {
                testRunId: assessmentResult.testRunId,
                vulnerabilities: assessmentResult.vulnerabilities,
                severity: assessmentResult.severity
            });
            
            // Handle critical vulnerabilities
            if (assessmentResult.severity.critical > 0) {
                await this.handleCriticalVulnerabilities(assessmentResult);
            }
            
            return assessmentResult;
            
        } catch (error) {
            await this.auditLogger.logSecurityEvent('SECURITY_ASSESSMENT_FAILED', {
                target: target.name,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Get comprehensive system status
     */
    getSystemHealth() {
        const subsystemHealth = {
            patternAnalyzer: 'HEALTHY', // Would get actual status
            antiDuplication: this.antiDuplication.getSystemStatus().systemHealth,
            rateLimiter: this.rateLimiter.getSystemStatus().systemHealth,
            anomalyDetector: this.anomalyDetector.calculateSystemHealth(),
            secureRNG: this.secureRNG.getSystemStatus().health,
            stateVerification: this.stateVerification.calculateSystemHealth(),
            replayValidator: 'HEALTHY', // Would get actual status
            punishmentSystem: this.punishmentSystem.calculateSystemHealth(),
            rollbackSystem: this.rollbackSystem.calculateSystemHealth(),
            auditLogger: this.auditLogger.calculateSystemHealth(),
            pentestFramework: this.pentestFramework.calculateSystemHealth()
        };
        
        // Determine overall health
        const healthLevels = Object.values(subsystemHealth);
        let overallHealth = 'HEALTHY';
        
        if (healthLevels.includes('CRITICAL')) {
            overallHealth = 'CRITICAL';
        } else if (healthLevels.includes('DEGRADED')) {
            overallHealth = 'DEGRADED';
        } else if (healthLevels.includes('WARNING')) {
            overallHealth = 'WARNING';
        }
        
        return {
            overallHealth,
            subsystemHealth,
            securityLevel: this.securityLevel,
            threatLevel: this.threatLevel,
            activeThreats: this.activeThreats.size,
            systemMetrics: Object.fromEntries(this.systemMetrics)
        };
    }

    /**
     * Generate comprehensive security report
     */
    async generateSecurityReport(timeRange) {
        const report = await this.auditLogger.generateAuditReport(timeRange, {
            includeDetails: true,
            verifyIntegrity: true
        });
        
        // Add system-specific metrics
        report.securityMetrics = {
            systemHealth: this.getSystemHealth(),
            threatLevel: this.threatLevel,
            recentViolations: await this.getRecentViolations(timeRange),
            rollbacksExecuted: await this.getRecentRollbacks(timeRange),
            penetrationTestResults: await this.getRecentPentestResults(timeRange)
        };
        
        return report;
    }

    /**
     * Private helper methods
     */
    startIntegratedMonitoring() {
        // Start monitoring all subsystems
        setInterval(async () => {
            await this.performSystemHealthCheck();
        }, 60000); // Every minute
        
        setInterval(async () => {
            await this.performThreatAssessment();
        }, 300000); // Every 5 minutes
        
        if (this.config.generateDailyReports) {
            setInterval(async () => {
                await this.generateDailySecurityReport();
            }, 86400000); // Every 24 hours
        }
    }

    async performSystemHealthCheck() {
        const health = this.getSystemHealth();
        
        if (health.overallHealth !== 'HEALTHY') {
            await this.auditLogger.logSecurityEvent('SYSTEM_HEALTH_DEGRADED', {
                overallHealth: health.overallHealth,
                subsystemHealth: health.subsystemHealth,
                activeThreats: health.activeThreats
            });
        }
        
        // Auto-adjust security level based on health
        if (health.overallHealth === 'CRITICAL') {
            this.securityLevel = 'MAXIMUM';
        } else if (health.overallHealth === 'DEGRADED') {
            this.securityLevel = 'HIGH';
        } else {
            this.securityLevel = 'NORMAL';
        }
    }

    async performThreatAssessment() {
        // Analyze recent security events for threat patterns
        const recentEvents = await this.auditLogger.searchLogs({
            startTime: Date.now() - 300000, // Last 5 minutes
            severity: 'HIGH'
        });
        
        // Update threat level based on recent activity
        if (recentEvents.length > 10) {
            this.threatLevel = 'HIGH';
        } else if (recentEvents.length > 5) {
            this.threatLevel = 'MEDIUM';
        } else {
            this.threatLevel = 'LOW';
        }
    }

    generateCheckId() {
        return `check_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    sanitizeOperation(operation) {
        // Remove sensitive data from operation for logging
        const sanitized = { ...operation };
        delete sanitized.password;
        delete sanitized.privateKey;
        delete sanitized.secret;
        return sanitized;
    }

    sanitizeEvidence(evidence) {
        // Remove sensitive data from evidence
        if (typeof evidence === 'object' && evidence !== null) {
            const sanitized = { ...evidence };
            delete sanitized.password;
            delete sanitized.privateKey;
            delete sanitized.secret;
            return sanitized;
        }
        return evidence;
    }

    generateSecurityRecommendations(securityResults) {
        const recommendations = [];
        
        if (securityResults.overallRisk > 0.7) {
            recommendations.push('Consider additional verification steps for this user');
        }
        
        if (securityResults.blockers.includes('RATE_LIMIT_EXCEEDED')) {
            recommendations.push('Review user activity patterns for automation');
        }
        
        if (securityResults.blockers.includes('STATISTICAL_ANOMALY')) {
            recommendations.push('Investigate transaction patterns for market manipulation');
        }
        
        return recommendations;
    }

    updateSystemMetrics(securityResults) {
        const hour = Math.floor(Date.now() / 3600000);
        const key = `security_checks_${hour}`;
        
        if (!this.systemMetrics.has(key)) {
            this.systemMetrics.set(key, {
                total: 0,
                approved: 0,
                blocked: 0,
                avgRisk: 0,
                violations: 0
            });
        }
        
        const metrics = this.systemMetrics.get(key);
        metrics.total++;
        
        if (securityResults.approved) {
            metrics.approved++;
        } else {
            metrics.blocked++;
        }
        
        metrics.avgRisk = (metrics.avgRisk * (metrics.total - 1) + securityResults.overallRisk) / metrics.total;
        
        if (securityResults.blockers.length > 0) {
            metrics.violations++;
        }
    }

    updateThreatLevel(violationType, evidence) {
        const criticalViolations = ['DUPLICATION_EXPLOIT', 'STATE_TAMPERING', 'COORDINATED_CHEATING'];
        
        if (criticalViolations.includes(violationType)) {
            this.threatLevel = 'HIGH';
            this.activeThreats.add(`${violationType}_${Date.now()}`);
        }
    }

    isCriticalViolation(violationType) {
        const criticalTypes = [
            'DUPLICATION_EXPLOIT',
            'STATE_TAMPERING',
            'COORDINATED_CHEATING',
            'MARKET_MANIPULATION'
        ];
        return criticalTypes.includes(violationType);
    }

    async sendSecurityAlert(userId, violationType, evidence) {
        await this.auditLogger.logSecurityEvent('CRITICAL_SECURITY_ALERT', {
            userId,
            violationType,
            evidence: this.sanitizeEvidence(evidence),
            alertLevel: 'CRITICAL',
            requiresImmedateAttention: true
        });
    }

    async findSuspiciousTransactions(userId, evidence) {
        // Implementation would query transaction database
        return [];
    }

    async handleCriticalVulnerabilities(assessmentResult) {
        await this.auditLogger.logSecurityEvent('CRITICAL_VULNERABILITIES_DETECTED', {
            testRunId: assessmentResult.testRunId,
            criticalCount: assessmentResult.severity.critical,
            immediateActionRequired: true
        });
    }

    async getRecentViolations(timeRange) {
        return await this.auditLogger.searchLogs({
            startTime: timeRange.start,
            endTime: timeRange.end,
            eventTypes: ['SECURITY_VIOLATION_DETECTED']
        });
    }

    async getRecentRollbacks(timeRange) {
        return []; // Implementation would query rollback system
    }

    async getRecentPentestResults(timeRange) {
        return []; // Implementation would query pentest framework
    }

    async generateDailySecurityReport() {
        const yesterday = Date.now() - 86400000;
        const today = Date.now();
        
        const report = await this.generateSecurityReport({
            start: yesterday,
            end: today
        });
        
        await this.auditLogger.logSystemEvent('DAILY_SECURITY_REPORT_GENERATED', {
            reportId: report.reportId,
            summary: report.summary,
            criticalIssues: report.securityMetrics
        });
    }
}

module.exports = MainSecuritySystem;
/**
 * Punishment System - Graduated Response to Cheating and Rule Violations
 * Comprehensive system for detecting, classifying, and responding to violations
 */

class PunishmentSystem {
    constructor(options = {}) {
        this.violations = new Map(); // userId -> ViolationRecord
        this.punishments = new Map(); // punishmentId -> PunishmentRecord
        this.userPunishments = new Map(); // userId -> Set of punishmentIds
        this.appeals = new Map(); // appealId -> AppealRecord
        this.suspendedUsers = new Set();
        this.bannedUsers = new Set();
        
        // Configuration
        this.config = {
            // Violation thresholds
            warningThreshold: 3,
            suspensionThreshold: 5,
            banThreshold: 10,
            
            // Time windows
            violationDecayTime: 604800000,    // 7 days
            suspensionDuration: 86400000,     // 24 hours
            tempBanDuration: 259200000,       // 3 days
            
            // Punishment escalation
            escalationEnabled: true,
            escalationFactor: 1.5,
            maxEscalationLevel: 5,
            
            // Appeal system
            appealWindow: 2592000000,         // 30 days
            appealReviewTime: 86400000,       // 24 hours
            
            // Automatic systems
            autoWarning: true,
            autoSuspension: true,
            autoBan: false,                   // Require manual review for bans
            
            // Evidence collection
            collectEvidence: true,
            evidenceRetention: 2592000000,    // 30 days
            
            // Integration settings
            notifyUsers: true,
            notifyModerators: true,
            logToAuditTrail: true
        };

        // Violation classification
        this.violationTypes = {
            'BOT_USAGE': {
                severity: 'HIGH',
                basePoints: 5,
                description: 'Use of automated trading bots',
                evidenceRequired: ['trade_patterns', 'timing_analysis'],
                escalationRate: 2.0
            },
            'DUPLICATION_EXPLOIT': {
                severity: 'CRITICAL',
                basePoints: 10,
                description: 'Item or currency duplication',
                evidenceRequired: ['transaction_logs', 'state_verification'],
                escalationRate: 3.0
            },
            'RATE_LIMIT_VIOLATION': {
                severity: 'MEDIUM',
                basePoints: 2,
                description: 'Excessive API usage or rapid trading',
                evidenceRequired: ['rate_limit_logs'],
                escalationRate: 1.2
            },
            'MARKET_MANIPULATION': {
                severity: 'HIGH',
                basePoints: 7,
                description: 'Artificial market manipulation',
                evidenceRequired: ['trade_analysis', 'price_impact'],
                escalationRate: 2.5
            },
            'STATISTICAL_ANOMALY': {
                severity: 'MEDIUM',
                basePoints: 3,
                description: 'Statistically impossible trading patterns',
                evidenceRequired: ['statistical_analysis'],
                escalationRate: 1.5
            },
            'STATE_TAMPERING': {
                severity: 'CRITICAL',
                basePoints: 8,
                description: 'Client-side state manipulation',
                evidenceRequired: ['state_verification', 'checksum_mismatch'],
                escalationRate: 2.8
            },
            'REPLAY_ATTACK': {
                severity: 'HIGH',
                basePoints: 6,
                description: 'Replay or timing attack',
                evidenceRequired: ['replay_validation', 'timing_logs'],
                escalationRate: 2.2
            },
            'COORDINATED_CHEATING': {
                severity: 'CRITICAL',
                basePoints: 12,
                description: 'Coordinated cheating with multiple accounts',
                evidenceRequired: ['network_analysis', 'behavioral_correlation'],
                escalationRate: 3.5
            },
            'FALSE_REPORTING': {
                severity: 'LOW',
                basePoints: 1,
                description: 'False reporting of other users',
                evidenceRequired: ['report_verification'],
                escalationRate: 1.0
            },
            'HARASSMENT': {
                severity: 'MEDIUM',
                basePoints: 4,
                description: 'Harassment of other users',
                evidenceRequired: ['chat_logs', 'behavioral_evidence'],
                escalationRate: 1.8
            }
        };

        // Punishment types
        this.punishmentTypes = {
            'WARNING': {
                severity: 'LOW',
                restrictions: [],
                duration: 0,
                appealable: false
            },
            'TRADE_RESTRICTION': {
                severity: 'MEDIUM',
                restrictions: ['trading'],
                duration: 3600000,  // 1 hour
                appealable: true
            },
            'TEMPORARY_SUSPENSION': {
                severity: 'MEDIUM',
                restrictions: ['trading', 'market_access'],
                duration: 86400000, // 24 hours
                appealable: true
            },
            'ACCOUNT_SUSPENSION': {
                severity: 'HIGH',
                restrictions: ['all_access'],
                duration: 259200000, // 3 days
                appealable: true
            },
            'TEMPORARY_BAN': {
                severity: 'HIGH',
                restrictions: ['complete_ban'],
                duration: 604800000, // 7 days
                appealable: true
            },
            'PERMANENT_BAN': {
                severity: 'CRITICAL',
                restrictions: ['complete_ban'],
                duration: -1, // Permanent
                appealable: true
            },
            'ASSET_CONFISCATION': {
                severity: 'HIGH',
                restrictions: ['asset_removal'],
                duration: 0,
                appealable: true
            },
            'TRADE_ROLLBACK': {
                severity: 'MEDIUM',
                restrictions: ['transaction_reversal'],
                duration: 0,
                appealable: false
            }
        };

        this.startPeriodicTasks();
    }

    /**
     * Report a violation and determine appropriate punishment
     */
    async reportViolation(userId, violationType, evidence = {}, metadata = {}) {
        const violationId = this.generateViolationId();
        const timestamp = Date.now();
        
        try {
            // Validate violation type
            if (!this.violationTypes[violationType]) {
                throw new Error(`Unknown violation type: ${violationType}`);
            }
            
            const violationConfig = this.violationTypes[violationType];
            
            // Create violation record
            const violationRecord = {
                id: violationId,
                userId,
                type: violationType,
                severity: violationConfig.severity,
                basePoints: violationConfig.basePoints,
                timestamp,
                evidence,
                metadata,
                status: 'REPORTED',
                reviewStatus: 'PENDING',
                reviewer: null,
                reviewedAt: null,
                processed: false
            };
            
            // Get or create user violation history
            if (!this.violations.has(userId)) {
                this.violations.set(userId, {
                    userId,
                    totalViolations: 0,
                    totalPoints: 0,
                    violations: [],
                    escalationLevel: 0,
                    firstViolation: timestamp,
                    lastViolation: timestamp
                });
            }
            
            const userViolations = this.violations.get(userId);
            userViolations.violations.push(violationRecord);
            userViolations.totalViolations++;
            userViolations.lastViolation = timestamp;
            
            // Calculate violation points with decay
            const effectivePoints = this.calculateEffectivePoints(userViolations);
            userViolations.totalPoints = effectivePoints;
            
            // Determine appropriate punishment
            const punishment = await this.determinePunishment(userId, violationRecord, userViolations);
            
            // Apply punishment if automatic mode is enabled
            if (this.shouldAutoApplyPunishment(punishment)) {
                await this.applyPunishment(userId, punishment, violationRecord);
            }
            
            // Log violation
            this.logViolationEvent('VIOLATION_REPORTED', {
                violationId,
                userId,
                violationType,
                severity: violationConfig.severity,
                totalViolations: userViolations.totalViolations,
                totalPoints: userViolations.totalPoints,
                punishmentType: punishment.type
            });
            
            return {
                violationId,
                punishment,
                userStatus: await this.getUserStatus(userId),
                appealable: punishment.appealable
            };
            
        } catch (error) {
            this.logSecurityEvent('VIOLATION_REPORTING_FAILED', {
                userId,
                violationType,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Determine appropriate punishment based on violation history
     */
    async determinePunishment(userId, violationRecord, userViolations) {
        const violationType = violationRecord.type;
        const violationConfig = this.violationTypes[violationType];
        const totalPoints = userViolations.totalPoints;
        
        // Calculate escalation level
        const escalationLevel = this.calculateEscalationLevel(userViolations);
        
        // Determine base punishment type
        let punishmentType = this.getPunishmentTypeByPoints(totalPoints);
        
        // Apply severity-based adjustments
        punishmentType = this.adjustPunishmentForSeverity(punishmentType, violationConfig.severity);
        
        // Apply escalation
        if (this.config.escalationEnabled && escalationLevel > 0) {
            punishmentType = this.escalatePunishment(punishmentType, escalationLevel);
        }
        
        // Apply violation-specific adjustments
        punishmentType = this.adjustPunishmentForViolationType(punishmentType, violationType);
        
        // Get punishment configuration
        const punishmentConfig = this.punishmentTypes[punishmentType];
        
        // Calculate duration with escalation
        let duration = punishmentConfig.duration;
        if (duration > 0 && escalationLevel > 0) {
            duration = Math.floor(duration * Math.pow(this.config.escalationFactor, escalationLevel));
        }
        
        return {
            type: punishmentType,
            severity: punishmentConfig.severity,
            duration,
            restrictions: [...punishmentConfig.restrictions],
            appealable: punishmentConfig.appealable,
            reason: violationConfig.description,
            escalationLevel,
            violationId: violationRecord.id,
            automaticallApplied: this.shouldAutoApplyPunishment({ type: punishmentType })
        };
    }

    /**
     * Apply punishment to user
     */
    async applyPunishment(userId, punishment, violationRecord) {
        const punishmentId = this.generatePunishmentId();
        const timestamp = Date.now();
        const expiresAt = punishment.duration > 0 ? timestamp + punishment.duration : null;
        
        try {
            // Create punishment record
            const punishmentRecord = {
                id: punishmentId,
                userId,
                type: punishment.type,
                severity: punishment.severity,
                restrictions: punishment.restrictions,
                reason: punishment.reason,
                violationId: violationRecord.id,
                timestamp,
                expiresAt,
                duration: punishment.duration,
                escalationLevel: punishment.escalationLevel,
                status: 'ACTIVE',
                appealStatus: 'NOT_APPEALED',
                appealId: null,
                appliedBy: 'SYSTEM',
                evidence: violationRecord.evidence,
                metadata: {
                    automaticallyApplied: punishment.automaticallApplied,
                    violationType: violationRecord.type
                }
            };
            
            // Store punishment
            this.punishments.set(punishmentId, punishmentRecord);
            
            // Add to user punishments
            if (!this.userPunishments.has(userId)) {
                this.userPunishments.set(userId, new Set());
            }
            this.userPunishments.get(userId).add(punishmentId);
            
            // Apply restrictions
            await this.applyRestrictions(userId, punishment.restrictions, expiresAt);
            
            // Send notifications
            if (this.config.notifyUsers) {
                await this.notifyUser(userId, punishmentRecord);
            }
            
            if (this.config.notifyModerators) {
                await this.notifyModerators(punishmentRecord);
            }
            
            // Log punishment
            this.logViolationEvent('PUNISHMENT_APPLIED', {
                punishmentId,
                userId,
                type: punishment.type,
                duration: punishment.duration,
                restrictions: punishment.restrictions,
                violationId: violationRecord.id
            });
            
            return punishmentRecord;
            
        } catch (error) {
            this.logSecurityEvent('PUNISHMENT_APPLICATION_FAILED', {
                userId,
                punishmentType: punishment.type,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Apply specific restrictions to user
     */
    async applyRestrictions(userId, restrictions, expiresAt) {
        for (const restriction of restrictions) {
            switch (restriction) {
                case 'trading':
                    await this.restrictTrading(userId, expiresAt);
                    break;
                case 'market_access':
                    await this.restrictMarketAccess(userId, expiresAt);
                    break;
                case 'all_access':
                    await this.suspendAccount(userId, expiresAt);
                    break;
                case 'complete_ban':
                    await this.banUser(userId, expiresAt);
                    break;
                case 'asset_removal':
                    await this.confiscateAssets(userId);
                    break;
                case 'transaction_reversal':
                    await this.rollbackTransactions(userId);
                    break;
            }
        }
    }

    /**
     * Handle user appeals
     */
    async submitAppeal(userId, punishmentId, appealReason, evidence = {}) {
        const appealId = this.generateAppealId();
        const timestamp = Date.now();
        
        const punishmentRecord = this.punishments.get(punishmentId);
        if (!punishmentRecord) {
            throw new Error('Punishment not found');
        }
        
        if (punishmentRecord.userId !== userId) {
            throw new Error('Cannot appeal punishment for another user');
        }
        
        if (!punishmentRecord.appealable) {
            throw new Error('This punishment is not appealable');
        }
        
        if (punishmentRecord.appealStatus !== 'NOT_APPEALED') {
            throw new Error('Appeal already submitted for this punishment');
        }
        
        // Check appeal window
        if (timestamp - punishmentRecord.timestamp > this.config.appealWindow) {
            throw new Error('Appeal window has expired');
        }
        
        // Create appeal record
        const appealRecord = {
            id: appealId,
            userId,
            punishmentId,
            reason: appealReason,
            evidence,
            timestamp,
            status: 'PENDING',
            reviewedBy: null,
            reviewedAt: null,
            decision: null,
            decisionReason: null,
            reviewerNotes: []
        };
        
        // Store appeal
        this.appeals.set(appealId, appealRecord);
        
        // Update punishment record
        punishmentRecord.appealStatus = 'UNDER_REVIEW';
        punishmentRecord.appealId = appealId;
        
        // Log appeal
        this.logViolationEvent('APPEAL_SUBMITTED', {
            appealId,
            userId,
            punishmentId,
            punishmentType: punishmentRecord.type
        });
        
        // Notify moderators
        if (this.config.notifyModerators) {
            await this.notifyModeratorsOfAppeal(appealRecord, punishmentRecord);
        }
        
        return appealRecord;
    }

    /**
     * Process appeal (for moderators)
     */
    async processAppeal(appealId, reviewerId, decision, decisionReason, reviewerNotes = []) {
        const appealRecord = this.appeals.get(appealId);
        if (!appealRecord) {
            throw new Error('Appeal not found');
        }
        
        if (appealRecord.status !== 'PENDING') {
            throw new Error('Appeal has already been processed');
        }
        
        const punishmentRecord = this.punishments.get(appealRecord.punishmentId);
        if (!punishmentRecord) {
            throw new Error('Associated punishment not found');
        }
        
        const timestamp = Date.now();
        
        // Update appeal record
        appealRecord.status = 'REVIEWED';
        appealRecord.reviewedBy = reviewerId;
        appealRecord.reviewedAt = timestamp;
        appealRecord.decision = decision; // 'UPHELD', 'OVERTURNED', 'MODIFIED'
        appealRecord.decisionReason = decisionReason;
        appealRecord.reviewerNotes = reviewerNotes;
        
        // Process decision
        if (decision === 'OVERTURNED') {
            await this.overturnPunishment(appealRecord.punishmentId, reviewerId);
        } else if (decision === 'MODIFIED') {
            // Would need additional parameters for modification
            // await this.modifyPunishment(appealRecord.punishmentId, modifications);
        }
        
        // Update punishment appeal status
        punishmentRecord.appealStatus = decision;
        
        // Notify user
        if (this.config.notifyUsers) {
            await this.notifyUserOfAppealDecision(appealRecord.userId, appealRecord, decision);
        }
        
        // Log appeal decision
        this.logViolationEvent('APPEAL_PROCESSED', {
            appealId,
            punishmentId: appealRecord.punishmentId,
            decision,
            reviewerId
        });
        
        return appealRecord;
    }

    /**
     * Overturn a punishment
     */
    async overturnPunishment(punishmentId, reviewerId) {
        const punishmentRecord = this.punishments.get(punishmentId);
        if (!punishmentRecord) {
            throw new Error('Punishment not found');
        }
        
        // Remove restrictions
        await this.removeRestrictions(punishmentRecord.userId, punishmentRecord.restrictions);
        
        // Update punishment status
        punishmentRecord.status = 'OVERTURNED';
        punishmentRecord.overturnedBy = reviewerId;
        punishmentRecord.overturnedAt = Date.now();
        
        // Log overturn
        this.logViolationEvent('PUNISHMENT_OVERTURNED', {
            punishmentId,
            userId: punishmentRecord.userId,
            reviewerId,
            originalType: punishmentRecord.type
        });
    }

    /**
     * Utility methods for calculating punishments
     */
    calculateEffectivePoints(userViolations) {
        const now = Date.now();
        let totalPoints = 0;
        
        for (const violation of userViolations.violations) {
            const age = now - violation.timestamp;
            if (age < this.config.violationDecayTime) {
                // Apply decay factor
                const decayFactor = 1 - (age / this.config.violationDecayTime);
                totalPoints += violation.basePoints * decayFactor;
            }
        }
        
        return Math.max(0, totalPoints);
    }

    calculateEscalationLevel(userViolations) {
        const recentViolations = userViolations.violations.filter(v => 
            Date.now() - v.timestamp < this.config.violationDecayTime
        );
        
        let escalationLevel = 0;
        const violationCounts = {};
        
        // Count violations by type
        for (const violation of recentViolations) {
            violationCounts[violation.type] = (violationCounts[violation.type] || 0) + 1;
        }
        
        // Calculate escalation based on repeat violations
        for (const [type, count] of Object.entries(violationCounts)) {
            if (count > 1) {
                const typeConfig = this.violationTypes[type];
                escalationLevel += Math.floor((count - 1) * typeConfig.escalationRate);
            }
        }
        
        return Math.min(escalationLevel, this.config.maxEscalationLevel);
    }

    getPunishmentTypeByPoints(points) {
        if (points >= 20) return 'PERMANENT_BAN';
        if (points >= 15) return 'TEMPORARY_BAN';
        if (points >= 10) return 'ACCOUNT_SUSPENSION';
        if (points >= 7) return 'TEMPORARY_SUSPENSION';
        if (points >= 5) return 'TRADE_RESTRICTION';
        return 'WARNING';
    }

    adjustPunishmentForSeverity(punishmentType, severity) {
        if (severity === 'CRITICAL') {
            // Escalate punishment for critical violations
            const escalationMap = {
                'WARNING': 'TRADE_RESTRICTION',
                'TRADE_RESTRICTION': 'TEMPORARY_SUSPENSION',
                'TEMPORARY_SUSPENSION': 'ACCOUNT_SUSPENSION',
                'ACCOUNT_SUSPENSION': 'TEMPORARY_BAN',
                'TEMPORARY_BAN': 'PERMANENT_BAN'
            };
            return escalationMap[punishmentType] || punishmentType;
        }
        
        return punishmentType;
    }

    escalatePunishment(punishmentType, escalationLevel) {
        const escalationChain = [
            'WARNING',
            'TRADE_RESTRICTION', 
            'TEMPORARY_SUSPENSION',
            'ACCOUNT_SUSPENSION',
            'TEMPORARY_BAN',
            'PERMANENT_BAN'
        ];
        
        const currentIndex = escalationChain.indexOf(punishmentType);
        if (currentIndex === -1) return punishmentType;
        
        const newIndex = Math.min(currentIndex + escalationLevel, escalationChain.length - 1);
        return escalationChain[newIndex];
    }

    adjustPunishmentForViolationType(punishmentType, violationType) {
        // Special handling for specific violation types
        if (violationType === 'DUPLICATION_EXPLOIT') {
            // Always include asset confiscation for duplication
            return punishmentType; // Would need to add asset confiscation as additional restriction
        }
        
        if (violationType === 'COORDINATED_CHEATING') {
            // More severe punishment for coordinated cheating
            const severePunishments = ['ACCOUNT_SUSPENSION', 'TEMPORARY_BAN', 'PERMANENT_BAN'];
            if (!severePunishments.includes(punishmentType)) {
                return 'ACCOUNT_SUSPENSION';
            }
        }
        
        return punishmentType;
    }

    shouldAutoApplyPunishment(punishment) {
        switch (punishment.type) {
            case 'WARNING':
                return this.config.autoWarning;
            case 'TRADE_RESTRICTION':
            case 'TEMPORARY_SUSPENSION':
                return this.config.autoSuspension;
            case 'ACCOUNT_SUSPENSION':
            case 'TEMPORARY_BAN':
            case 'PERMANENT_BAN':
                return this.config.autoBan;
            default:
                return false;
        }
    }

    /**
     * Restriction implementation methods (would integrate with other systems)
     */
    async restrictTrading(userId, expiresAt) {
        // Implement trading restriction
        this.logViolationEvent('TRADING_RESTRICTED', { userId, expiresAt });
    }

    async restrictMarketAccess(userId, expiresAt) {
        // Implement market access restriction
        this.logViolationEvent('MARKET_ACCESS_RESTRICTED', { userId, expiresAt });
    }

    async suspendAccount(userId, expiresAt) {
        this.suspendedUsers.add(userId);
        this.logViolationEvent('ACCOUNT_SUSPENDED', { userId, expiresAt });
    }

    async banUser(userId, expiresAt) {
        this.bannedUsers.add(userId);
        this.logViolationEvent('USER_BANNED', { userId, expiresAt });
    }

    async confiscateAssets(userId) {
        // Implement asset confiscation
        this.logViolationEvent('ASSETS_CONFISCATED', { userId });
    }

    async rollbackTransactions(userId) {
        // Implement transaction rollback
        this.logViolationEvent('TRANSACTIONS_ROLLED_BACK', { userId });
    }

    async removeRestrictions(userId, restrictions) {
        for (const restriction of restrictions) {
            switch (restriction) {
                case 'all_access':
                    this.suspendedUsers.delete(userId);
                    break;
                case 'complete_ban':
                    this.bannedUsers.delete(userId);
                    break;
            }
        }
        this.logViolationEvent('RESTRICTIONS_REMOVED', { userId, restrictions });
    }

    /**
     * Notification methods (would integrate with notification system)
     */
    async notifyUser(userId, punishmentRecord) {
        // Implement user notification
        this.logViolationEvent('USER_NOTIFIED', { 
            userId, 
            punishmentType: punishmentRecord.type 
        });
    }

    async notifyModerators(punishmentRecord) {
        // Implement moderator notification
        this.logViolationEvent('MODERATORS_NOTIFIED', { 
            punishmentId: punishmentRecord.id 
        });
    }

    async notifyModeratorsOfAppeal(appealRecord, punishmentRecord) {
        // Implement appeal notification
        this.logViolationEvent('APPEAL_NOTIFICATION_SENT', { 
            appealId: appealRecord.id 
        });
    }

    async notifyUserOfAppealDecision(userId, appealRecord, decision) {
        // Implement appeal decision notification
        this.logViolationEvent('APPEAL_DECISION_SENT', { 
            userId, 
            appealId: appealRecord.id, 
            decision 
        });
    }

    /**
     * Status and reporting methods
     */
    async getUserStatus(userId) {
        const userViolations = this.violations.get(userId);
        const userPunishments = Array.from(this.userPunishments.get(userId) || [])
            .map(id => this.punishments.get(id))
            .filter(p => p && p.status === 'ACTIVE');
        
        return {
            userId,
            isSuspended: this.suspendedUsers.has(userId),
            isBanned: this.bannedUsers.has(userId),
            totalViolations: userViolations ? userViolations.totalViolations : 0,
            totalPoints: userViolations ? userViolations.totalPoints : 0,
            activePunishments: userPunishments.length,
            escalationLevel: userViolations ? this.calculateEscalationLevel(userViolations) : 0
        };
    }

    /**
     * System maintenance
     */
    startPeriodicTasks() {
        // Clean up expired punishments every hour
        setInterval(() => {
            this.cleanupExpiredPunishments();
        }, 3600000);
        
        // Decay violation points every day
        setInterval(() => {
            this.decayViolationPoints();
        }, 86400000);
    }

    cleanupExpiredPunishments() {
        const now = Date.now();
        const expiredPunishments = [];
        
        for (const [punishmentId, punishment] of this.punishments.entries()) {
            if (punishment.expiresAt && now >= punishment.expiresAt && punishment.status === 'ACTIVE') {
                expiredPunishments.push(punishmentId);
            }
        }
        
        for (const punishmentId of expiredPunishments) {
            const punishment = this.punishments.get(punishmentId);
            punishment.status = 'EXPIRED';
            
            // Remove restrictions
            this.removeRestrictions(punishment.userId, punishment.restrictions);
            
            this.logViolationEvent('PUNISHMENT_EXPIRED', {
                punishmentId,
                userId: punishment.userId,
                type: punishment.type
            });
        }
    }

    decayViolationPoints() {
        for (const [userId, userViolations] of this.violations.entries()) {
            const oldPoints = userViolations.totalPoints;
            const newPoints = this.calculateEffectivePoints(userViolations);
            
            if (newPoints !== oldPoints) {
                userViolations.totalPoints = newPoints;
                this.logViolationEvent('VIOLATION_POINTS_DECAYED', {
                    userId,
                    oldPoints,
                    newPoints
                });
            }
        }
    }

    /**
     * Utility methods
     */
    generateViolationId() {
        return `violation_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    }

    generatePunishmentId() {
        return `punishment_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    }

    generateAppealId() {
        return `appeal_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    }

    logViolationEvent(event, data) {
        if (this.config.logToAuditTrail) {
            console.log(`[PUNISHMENT_SYSTEM] ${event}:`, {
                timestamp: Date.now(),
                event,
                data
            });
        }
    }

    logSecurityEvent(event, data) {
        console.log(`[PUNISHMENT_SECURITY] ${event}:`, {
            timestamp: Date.now(),
            event,
            data,
            severity: this.getEventSeverity(event)
        });
    }

    getEventSeverity(event) {
        const highSeverityEvents = [
            'PUNISHMENT_APPLICATION_FAILED',
            'VIOLATION_REPORTING_FAILED'
        ];
        
        return highSeverityEvents.includes(event) ? 'HIGH' : 'MEDIUM';
    }

    /**
     * Get system status and metrics
     */
    getSystemStatus() {
        const totalViolations = Array.from(this.violations.values())
            .reduce((sum, user) => sum + user.totalViolations, 0);
        
        const activePunishments = Array.from(this.punishments.values())
            .filter(p => p.status === 'ACTIVE').length;
        
        const pendingAppeals = Array.from(this.appeals.values())
            .filter(a => a.status === 'PENDING').length;
        
        return {
            totalViolations,
            activePunishments,
            suspendedUsers: this.suspendedUsers.size,
            bannedUsers: this.bannedUsers.size,
            pendingAppeals,
            systemHealth: this.calculateSystemHealth()
        };
    }

    calculateSystemHealth() {
        const totalUsers = this.violations.size;
        if (totalUsers === 0) return 'HEALTHY';
        
        const bannedRatio = this.bannedUsers.size / totalUsers;
        const suspendedRatio = this.suspendedUsers.size / totalUsers;
        
        if (bannedRatio > 0.1 || suspendedRatio > 0.2) return 'CRITICAL';
        if (bannedRatio > 0.05 || suspendedRatio > 0.1) return 'DEGRADED';
        if (bannedRatio > 0.02 || suspendedRatio > 0.05) return 'WARNING';
        return 'HEALTHY';
    }
}

module.exports = PunishmentSystem;
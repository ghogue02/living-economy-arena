/**
 * Advanced Rate Limiter - Prevents Automated Trading Advantages
 * Multi-layered rate limiting system with adaptive algorithms and bot detection
 */

class AdvancedRateLimiter {
    constructor() {
        this.userBuckets = new Map(); // userId -> RateBucket
        this.globalBuckets = new Map(); // resource -> GlobalBucket
        this.adaptiveThresholds = new Map(); // userId -> AdaptiveThreshold
        this.suspiciousUsers = new Set();
        this.bannedUsers = new Set();
        
        // Configuration
        this.config = {
            // Trading limits
            maxTradesPerSecond: 2,
            maxTradesPerMinute: 50,
            maxTradesPerHour: 500,
            maxTradesPerDay: 5000,
            
            // Order limits
            maxOrdersPerSecond: 5,
            maxOrdersPerMinute: 100,
            maxOrderUpdatesPerSecond: 10,
            
            // Query limits
            maxQueriesPerSecond: 20,
            maxQueriesPerMinute: 500,
            
            // Global limits
            globalTradesPerSecond: 1000,
            globalOrdersPerSecond: 2000,
            
            // Adaptive settings
            adaptiveWindowMs: 300000, // 5 minutes
            suspicionThreshold: 0.8,
            banThreshold: 0.95,
            
            // Burst settings
            burstMultiplier: 2,
            burstWindowMs: 10000, // 10 seconds
            
            // Bot detection
            consecutiveViolations: 5,
            violationDecayMs: 600000, // 10 minutes
            
            // Penalties
            softBanDurationMs: 300000, // 5 minutes
            hardBanDurationMs: 3600000, // 1 hour
            escalationFactor: 2
        };

        this.startCleanupInterval();
    }

    /**
     * Check if action is allowed under rate limits
     */
    async checkRateLimit(userId, action, metadata = {}) {
        const timestamp = Date.now();
        
        // Check if user is banned
        if (this.bannedUsers.has(userId)) {
            const banInfo = this.getUserBanInfo(userId);
            if (banInfo && timestamp < banInfo.expiresAt) {
                return {
                    allowed: false,
                    reason: 'USER_BANNED',
                    retryAfter: banInfo.expiresAt - timestamp,
                    banLevel: banInfo.level
                };
            } else {
                // Ban expired, remove from banned list
                this.bannedUsers.delete(userId);
                this.clearUserBanInfo(userId);
            }
        }

        // Get or create user bucket
        const userBucket = this.getUserBucket(userId);
        
        // Check global limits first
        const globalCheck = this.checkGlobalLimits(action, timestamp);
        if (!globalCheck.allowed) {
            return globalCheck;
        }

        // Check user-specific limits
        const userCheck = this.checkUserLimits(userBucket, action, timestamp, metadata);
        if (!userCheck.allowed) {
            // Record violation
            this.recordViolation(userId, action, userCheck.reason, timestamp);
            return userCheck;
        }

        // Check adaptive limits
        const adaptiveCheck = this.checkAdaptiveLimits(userId, action, timestamp);
        if (!adaptiveCheck.allowed) {
            this.recordViolation(userId, action, adaptiveCheck.reason, timestamp);
            return adaptiveCheck;
        }

        // Check for bot-like behavior
        const botCheck = this.checkBotBehavior(userBucket, action, timestamp);
        if (botCheck.suspicious) {
            this.flagSuspiciousActivity(userId, botCheck.reason, timestamp);
            
            if (botCheck.severity === 'HIGH') {
                return {
                    allowed: false,
                    reason: 'BOT_BEHAVIOR_DETECTED',
                    suspicionLevel: botCheck.suspicionLevel,
                    details: botCheck.details
                };
            }
        }

        // Allow the action and update buckets
        this.consumeFromBucket(userBucket, action, timestamp);
        this.updateGlobalBuckets(action, timestamp);
        this.updateAdaptiveThresholds(userId, action, timestamp);

        return {
            allowed: true,
            remaining: this.calculateRemaining(userBucket, action),
            resetTime: this.calculateResetTime(userBucket, action),
            suspicionLevel: botCheck ? botCheck.suspicionLevel : 0
        };
    }

    /**
     * Get or create user rate bucket
     */
    getUserBucket(userId) {
        if (!this.userBuckets.has(userId)) {
            const timestamp = Date.now();
            this.userBuckets.set(userId, {
                userId,
                createdAt: timestamp,
                lastActivity: timestamp,
                
                // Trading buckets (multiple time windows)
                trades: {
                    perSecond: { count: 0, resetTime: timestamp + 1000 },
                    perMinute: { count: 0, resetTime: timestamp + 60000 },
                    perHour: { count: 0, resetTime: timestamp + 3600000 },
                    perDay: { count: 0, resetTime: timestamp + 86400000 }
                },
                
                // Order buckets
                orders: {
                    perSecond: { count: 0, resetTime: timestamp + 1000 },
                    perMinute: { count: 0, resetTime: timestamp + 60000 }
                },
                
                // Update buckets
                updates: {
                    perSecond: { count: 0, resetTime: timestamp + 1000 }
                },
                
                // Query buckets
                queries: {
                    perSecond: { count: 0, resetTime: timestamp + 1000 },
                    perMinute: { count: 0, resetTime: timestamp + 60000 }
                },
                
                // Violation tracking
                violations: [],
                suspicionScore: 0,
                lastViolation: null,
                
                // Burst detection
                burstTracking: {
                    actions: [],
                    burstStart: null,
                    burstCount: 0
                },
                
                // Behavioral analysis
                behavior: {
                    actionIntervals: [],
                    actionTypes: new Map(),
                    patterns: []
                }
            });
        }
        
        return this.userBuckets.get(userId);
    }

    /**
     * Check global rate limits
     */
    checkGlobalLimits(action, timestamp) {
        const globalBucket = this.getGlobalBucket(action);
        
        const limits = {
            'TRADE': this.config.globalTradesPerSecond,
            'ORDER': this.config.globalOrdersPerSecond,
            'QUERY': this.config.globalQueriesPerSecond || 5000
        };
        
        const limit = limits[action.toUpperCase()] || 1000;
        
        // Reset if needed
        if (timestamp >= globalBucket.resetTime) {
            globalBucket.count = 0;
            globalBucket.resetTime = timestamp + 1000;
        }
        
        if (globalBucket.count >= limit) {
            return {
                allowed: false,
                reason: 'GLOBAL_RATE_LIMIT_EXCEEDED',
                retryAfter: globalBucket.resetTime - timestamp,
                globalLimit: limit
            };
        }
        
        return { allowed: true };
    }

    /**
     * Check user-specific rate limits
     */
    checkUserLimits(userBucket, action, timestamp, metadata) {
        const actionType = action.toUpperCase();
        
        // Define limits based on action type
        const limits = this.getUserLimits(actionType, userBucket.userId);
        
        // Check each time window
        for (const [window, limit] of Object.entries(limits)) {
            const bucket = userBucket[actionType.toLowerCase() + 's'] || userBucket.trades;
            const windowBucket = bucket[window];
            
            if (!windowBucket) continue;
            
            // Reset bucket if expired
            if (timestamp >= windowBucket.resetTime) {
                windowBucket.count = 0;
                windowBucket.resetTime = this.calculateNextResetTime(timestamp, window);
            }
            
            // Check if limit exceeded
            if (windowBucket.count >= limit) {
                return {
                    allowed: false,
                    reason: `RATE_LIMIT_EXCEEDED_${window.toUpperCase()}`,
                    retryAfter: windowBucket.resetTime - timestamp,
                    limit,
                    current: windowBucket.count,
                    window
                };
            }
        }
        
        return { allowed: true };
    }

    /**
     * Get user-specific limits (may be adaptive)
     */
    getUserLimits(actionType, userId) {
        const baseLimits = {
            'TRADE': {
                perSecond: this.config.maxTradesPerSecond,
                perMinute: this.config.maxTradesPerMinute,
                perHour: this.config.maxTradesPerHour,
                perDay: this.config.maxTradesPerDay
            },
            'ORDER': {
                perSecond: this.config.maxOrdersPerSecond,
                perMinute: this.config.maxOrdersPerMinute
            },
            'UPDATE': {
                perSecond: this.config.maxOrderUpdatesPerSecond
            },
            'QUERY': {
                perSecond: this.config.maxQueriesPerSecond,
                perMinute: this.config.maxQueriesPerMinute
            }
        };
        
        let limits = baseLimits[actionType] || baseLimits['QUERY'];
        
        // Apply adaptive adjustments
        const adaptiveThreshold = this.adaptiveThresholds.get(userId);
        if (adaptiveThreshold) {
            limits = this.applyAdaptiveAdjustments(limits, adaptiveThreshold);
        }
        
        // Apply suspicion penalties
        if (this.suspiciousUsers.has(userId)) {
            limits = this.applySuspicionPenalties(limits);
        }
        
        return limits;
    }

    /**
     * Check adaptive rate limits based on user behavior
     */
    checkAdaptiveLimits(userId, action, timestamp) {
        const adaptiveThreshold = this.adaptiveThresholds.get(userId);
        if (!adaptiveThreshold) {
            return { allowed: true };
        }
        
        // Check if user is in adaptive penalty period
        if (adaptiveThreshold.penaltyUntil && timestamp < adaptiveThreshold.penaltyUntil) {
            return {
                allowed: false,
                reason: 'ADAPTIVE_PENALTY_ACTIVE',
                retryAfter: adaptiveThreshold.penaltyUntil - timestamp,
                adaptiveScore: adaptiveThreshold.score
            };
        }
        
        // Check adaptive score threshold
        if (adaptiveThreshold.score > this.config.suspicionThreshold) {
            const reductionFactor = Math.min(adaptiveThreshold.score, 0.95);
            const reducedLimit = Math.floor(this.config.maxTradesPerSecond * (1 - reductionFactor));
            
            if (reducedLimit <= 0) {
                return {
                    allowed: false,
                    reason: 'ADAPTIVE_LIMIT_EXCEEDED',
                    adaptiveScore: adaptiveThreshold.score,
                    recommendedDelay: 5000
                };
            }
        }
        
        return { allowed: true };
    }

    /**
     * Check for bot-like behavior patterns
     */
    checkBotBehavior(userBucket, action, timestamp) {
        const behavior = userBucket.behavior;
        const burstTracking = userBucket.burstTracking;
        
        let suspicionLevel = 0;
        const suspiciousPatterns = [];
        
        // 1. Check for precise timing patterns
        if (behavior.actionIntervals.length > 10) {
            const intervals = behavior.actionIntervals.slice(-10);
            const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
            const variance = intervals.reduce((acc, interval) => acc + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
            const stdDev = Math.sqrt(variance);
            
            // Very consistent timing is suspicious
            if (stdDev < 50 && avgInterval < 2000) {
                suspicionLevel += 0.3;
                suspiciousPatterns.push('PRECISE_TIMING');
            }
        }
        
        // 2. Check for burst patterns
        burstTracking.actions.push(timestamp);
        burstTracking.actions = burstTracking.actions.filter(t => timestamp - t < this.config.burstWindowMs);
        
        if (burstTracking.actions.length > this.config.maxTradesPerSecond * this.config.burstMultiplier) {
            suspicionLevel += 0.4;
            suspiciousPatterns.push('BURST_PATTERN');
        }
        
        // 3. Check action type diversity
        behavior.actionTypes.set(action, (behavior.actionTypes.get(action) || 0) + 1);
        const totalActions = Array.from(behavior.actionTypes.values()).reduce((a, b) => a + b, 0);
        const uniqueActions = behavior.actionTypes.size;
        
        if (totalActions > 50 && uniqueActions < 3) {
            suspicionLevel += 0.2;
            suspiciousPatterns.push('LIMITED_ACTION_DIVERSITY');
        }
        
        // 4. Check for impossible human speeds
        if (behavior.actionIntervals.length > 0) {
            const lastInterval = behavior.actionIntervals[behavior.actionIntervals.length - 1];
            if (lastInterval < 100) { // Less than 100ms between actions
                suspicionLevel += 0.5;
                suspiciousPatterns.push('IMPOSSIBLE_SPEED');
            }
        }
        
        // 5. Check violation history
        const recentViolations = userBucket.violations.filter(v => timestamp - v.timestamp < this.config.violationDecayMs);
        if (recentViolations.length >= this.config.consecutiveViolations) {
            suspicionLevel += 0.6;
            suspiciousPatterns.push('REPEATED_VIOLATIONS');
        }
        
        // Update user suspicion score
        userBucket.suspicionScore = Math.max(userBucket.suspicionScore * 0.95, suspicionLevel);
        
        // Determine severity
        let severity = 'LOW';
        if (suspicionLevel > 0.8) severity = 'HIGH';
        else if (suspicionLevel > 0.5) severity = 'MEDIUM';
        
        return {
            suspicious: suspicionLevel > 0.3,
            suspicionLevel,
            severity,
            patterns: suspiciousPatterns,
            reason: suspiciousPatterns.join(', '),
            details: {
                intervals: behavior.actionIntervals.slice(-5),
                burstCount: burstTracking.actions.length,
                actionDiversity: uniqueActions,
                recentViolations: recentViolations.length
            }
        };
    }

    /**
     * Record a violation
     */
    recordViolation(userId, action, reason, timestamp) {
        const userBucket = this.getUserBucket(userId);
        
        const violation = {
            timestamp,
            action,
            reason,
            severity: this.getViolationSeverity(reason)
        };
        
        userBucket.violations.push(violation);
        userBucket.lastViolation = timestamp;
        
        // Clean up old violations
        userBucket.violations = userBucket.violations.filter(v => 
            timestamp - v.timestamp < this.config.violationDecayMs
        );
        
        // Check for escalation
        this.checkViolationEscalation(userId, userBucket);
        
        // Log security event
        this.logSecurityEvent('RATE_LIMIT_VIOLATION', {
            userId,
            action,
            reason,
            violationCount: userBucket.violations.length
        });
    }

    /**
     * Check if violations warrant escalation
     */
    checkViolationEscalation(userId, userBucket) {
        const recentViolations = userBucket.violations.filter(v => 
            Date.now() - v.timestamp < this.config.violationDecayMs
        );
        
        if (recentViolations.length >= this.config.consecutiveViolations) {
            const highSeverityViolations = recentViolations.filter(v => v.severity === 'HIGH');
            
            if (highSeverityViolations.length >= 3) {
                // Hard ban
                this.banUser(userId, 'HARD_BAN', this.config.hardBanDurationMs);
            } else if (recentViolations.length >= this.config.consecutiveViolations) {
                // Soft ban
                this.banUser(userId, 'SOFT_BAN', this.config.softBanDurationMs);
            }
        }
    }

    /**
     * Ban a user temporarily
     */
    banUser(userId, banType, duration) {
        const timestamp = Date.now();
        const expiresAt = timestamp + duration;
        
        this.bannedUsers.add(userId);
        this.setBanInfo(userId, {
            type: banType,
            startTime: timestamp,
            expiresAt,
            level: banType === 'HARD_BAN' ? 2 : 1
        });
        
        this.logSecurityEvent('USER_BANNED', {
            userId,
            banType,
            duration,
            expiresAt
        });
    }

    /**
     * Flag suspicious activity
     */
    flagSuspiciousActivity(userId, reason, timestamp) {
        this.suspiciousUsers.add(userId);
        
        // Update adaptive thresholds
        let adaptiveThreshold = this.adaptiveThresholds.get(userId);
        if (!adaptiveThreshold) {
            adaptiveThreshold = {
                score: 0,
                penaltyUntil: null,
                lastUpdate: timestamp
            };
            this.adaptiveThresholds.set(userId, adaptiveThreshold);
        }
        
        adaptiveThreshold.score = Math.min(adaptiveThreshold.score + 0.1, 1.0);
        adaptiveThreshold.lastUpdate = timestamp;
        
        // Apply immediate penalty for high suspicion
        if (adaptiveThreshold.score > this.config.banThreshold) {
            adaptiveThreshold.penaltyUntil = timestamp + this.config.softBanDurationMs;
        }
        
        this.logSecurityEvent('SUSPICIOUS_ACTIVITY_FLAGGED', {
            userId,
            reason,
            suspicionScore: adaptiveThreshold.score
        });
    }

    /**
     * Consume from rate bucket
     */
    consumeFromBucket(userBucket, action, timestamp) {
        const actionType = action.toLowerCase() + 's';
        const buckets = userBucket[actionType] || userBucket.trades;
        
        // Update all time windows
        for (const [window, bucket] of Object.entries(buckets)) {
            if (timestamp >= bucket.resetTime) {
                bucket.count = 0;
                bucket.resetTime = this.calculateNextResetTime(timestamp, window);
            }
            bucket.count++;
        }
        
        // Update behavioral tracking
        if (userBucket.behavior.actionIntervals.length > 0) {
            const lastAction = userBucket.lastActivity;
            userBucket.behavior.actionIntervals.push(timestamp - lastAction);
            
            // Keep only last 100 intervals
            if (userBucket.behavior.actionIntervals.length > 100) {
                userBucket.behavior.actionIntervals = userBucket.behavior.actionIntervals.slice(-100);
            }
        }
        
        userBucket.lastActivity = timestamp;
    }

    /**
     * Update global buckets
     */
    updateGlobalBuckets(action, timestamp) {
        const globalBucket = this.getGlobalBucket(action);
        
        if (timestamp >= globalBucket.resetTime) {
            globalBucket.count = 0;
            globalBucket.resetTime = timestamp + 1000;
        }
        
        globalBucket.count++;
    }

    /**
     * Get global bucket for action
     */
    getGlobalBucket(action) {
        const key = action.toUpperCase();
        if (!this.globalBuckets.has(key)) {
            this.globalBuckets.set(key, {
                count: 0,
                resetTime: Date.now() + 1000
            });
        }
        return this.globalBuckets.get(key);
    }

    /**
     * Calculate remaining requests for user
     */
    calculateRemaining(userBucket, action) {
        const actionType = action.toLowerCase() + 's';
        const buckets = userBucket[actionType] || userBucket.trades;
        const limits = this.getUserLimits(action.toUpperCase(), userBucket.userId);
        
        const remaining = {};
        for (const [window, bucket] of Object.entries(buckets)) {
            const limit = limits[window] || 0;
            remaining[window] = Math.max(0, limit - bucket.count);
        }
        
        return remaining;
    }

    /**
     * Calculate reset times
     */
    calculateResetTime(userBucket, action) {
        const actionType = action.toLowerCase() + 's';
        const buckets = userBucket[actionType] || userBucket.trades;
        
        const resetTimes = {};
        for (const [window, bucket] of Object.entries(buckets)) {
            resetTimes[window] = bucket.resetTime;
        }
        
        return resetTimes;
    }

    calculateNextResetTime(timestamp, window) {
        const intervals = {
            perSecond: 1000,
            perMinute: 60000,
            perHour: 3600000,
            perDay: 86400000
        };
        
        return timestamp + (intervals[window] || 1000);
    }

    /**
     * Apply adaptive adjustments to limits
     */
    applyAdaptiveAdjustments(limits, adaptiveThreshold) {
        if (adaptiveThreshold.score <= 0.3) {
            return limits;
        }
        
        const reductionFactor = Math.min(adaptiveThreshold.score - 0.3, 0.7);
        const adjustedLimits = {};
        
        for (const [window, limit] of Object.entries(limits)) {
            adjustedLimits[window] = Math.max(1, Math.floor(limit * (1 - reductionFactor)));
        }
        
        return adjustedLimits;
    }

    /**
     * Apply suspicion penalties
     */
    applySuspicionPenalties(limits) {
        const penaltyFactor = 0.5; // 50% reduction for suspicious users
        const penalizedLimits = {};
        
        for (const [window, limit] of Object.entries(limits)) {
            penalizedLimits[window] = Math.max(1, Math.floor(limit * penaltyFactor));
        }
        
        return penalizedLimits;
    }

    /**
     * Update adaptive thresholds based on good behavior
     */
    updateAdaptiveThresholds(userId, action, timestamp) {
        let adaptiveThreshold = this.adaptiveThresholds.get(userId);
        if (!adaptiveThreshold) {
            adaptiveThreshold = {
                score: 0,
                penaltyUntil: null,
                lastUpdate: timestamp
            };
            this.adaptiveThresholds.set(userId, adaptiveThreshold);
        }
        
        // Gradually reduce suspicion score for good behavior
        const timeSinceLastUpdate = timestamp - adaptiveThreshold.lastUpdate;
        if (timeSinceLastUpdate > 60000) { // 1 minute of good behavior
            adaptiveThreshold.score = Math.max(0, adaptiveThreshold.score - 0.01);
            adaptiveThreshold.lastUpdate = timestamp;
        }
    }

    /**
     * Get violation severity
     */
    getViolationSeverity(reason) {
        const highSeverityReasons = ['BOT_BEHAVIOR_DETECTED', 'IMPOSSIBLE_SPEED', 'BURST_PATTERN'];
        const mediumSeverityReasons = ['REPEATED_VIOLATIONS', 'ADAPTIVE_LIMIT_EXCEEDED'];
        
        if (highSeverityReasons.some(r => reason.includes(r))) {
            return 'HIGH';
        } else if (mediumSeverityReasons.some(r => reason.includes(r))) {
            return 'MEDIUM';
        }
        return 'LOW';
    }

    /**
     * User ban info management (would be stored in database)
     */
    setBanInfo(userId, banInfo) {
        // In production, store in database
        if (!this.banInfo) this.banInfo = new Map();
        this.banInfo.set(userId, banInfo);
    }

    getUserBanInfo(userId) {
        if (!this.banInfo) return null;
        return this.banInfo.get(userId);
    }

    clearUserBanInfo(userId) {
        if (this.banInfo) {
            this.banInfo.delete(userId);
        }
    }

    /**
     * Security event logging
     */
    logSecurityEvent(event, data) {
        const logEntry = {
            timestamp: Date.now(),
            event,
            data,
            component: 'RATE_LIMITER'
        };
        
        // In production, send to security monitoring system
        console.log(`[RATE_LIMITER] ${event}:`, logEntry);
    }

    /**
     * Cleanup old data
     */
    startCleanupInterval() {
        setInterval(() => {
            this.cleanupOldData();
        }, 300000); // Clean up every 5 minutes
    }

    cleanupOldData() {
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        // Clean up user buckets
        for (const [userId, bucket] of this.userBuckets.entries()) {
            if (now - bucket.lastActivity > maxAge) {
                this.userBuckets.delete(userId);
            } else {
                // Clean up old violations
                bucket.violations = bucket.violations.filter(v => now - v.timestamp < this.config.violationDecayMs);
                
                // Clean up old action intervals
                bucket.behavior.actionIntervals = bucket.behavior.actionIntervals.slice(-100);
                
                // Clean up burst tracking
                bucket.burstTracking.actions = bucket.burstTracking.actions.filter(t => now - t < this.config.burstWindowMs);
            }
        }
        
        // Clean up adaptive thresholds
        for (const [userId, threshold] of this.adaptiveThresholds.entries()) {
            if (now - threshold.lastUpdate > maxAge) {
                this.adaptiveThresholds.delete(userId);
            }
        }
        
        // Remove expired bans
        for (const userId of this.bannedUsers) {
            const banInfo = this.getUserBanInfo(userId);
            if (banInfo && now >= banInfo.expiresAt) {
                this.bannedUsers.delete(userId);
                this.clearUserBanInfo(userId);
            }
        }
    }

    /**
     * Get comprehensive status report
     */
    getSystemStatus() {
        const now = Date.now();
        
        return {
            timestamp: now,
            activeUsers: this.userBuckets.size,
            suspiciousUsers: this.suspiciousUsers.size,
            bannedUsers: this.bannedUsers.size,
            globalBuckets: Object.fromEntries(this.globalBuckets),
            recentViolations: this.getRecentViolationCount(),
            systemHealth: this.calculateSystemHealth()
        };
    }

    getRecentViolationCount() {
        const now = Date.now();
        const fiveMinutesAgo = now - 300000;
        
        let violationCount = 0;
        for (const bucket of this.userBuckets.values()) {
            violationCount += bucket.violations.filter(v => v.timestamp > fiveMinutesAgo).length;
        }
        
        return violationCount;
    }

    calculateSystemHealth() {
        const totalUsers = this.userBuckets.size;
        if (totalUsers === 0) return 'HEALTHY';
        
        const suspiciousRatio = this.suspiciousUsers.size / totalUsers;
        const bannedRatio = this.bannedUsers.size / totalUsers;
        
        if (suspiciousRatio > 0.2 || bannedRatio > 0.1) {
            return 'CRITICAL';
        } else if (suspiciousRatio > 0.1 || bannedRatio > 0.05) {
            return 'DEGRADED';
        } else if (suspiciousRatio > 0.05 || bannedRatio > 0.02) {
            return 'WARNING';
        }
        
        return 'HEALTHY';
    }
}

module.exports = AdvancedRateLimiter;
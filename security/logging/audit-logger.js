/**
 * Security Audit Logger - Comprehensive Security Event Tracking
 * Central logging system for all security events, violations, and system activities
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class SecurityAuditLogger {
    constructor(options = {}) {
        this.logBuffer = [];
        this.logIndex = new Map(); // eventId -> LogEntry
        this.userActivityIndex = new Map(); // userId -> Activity[]
        this.eventTypeIndex = new Map(); // eventType -> EventId[]
        this.timeIndex = new Map(); // timeWindow -> EventId[]
        this.alertSubscribers = new Map(); // alertType -> Subscriber[]
        
        // Configuration
        this.config = {
            // Storage settings
            logDirectory: options.logDirectory || './security-logs',
            maxLogFileSize: 100 * 1024 * 1024,    // 100MB
            maxLogFiles: 100,
            retentionDays: 90,
            
            // Buffer settings
            bufferSize: 1000,
            flushInterval: 10000,    // 10 seconds
            forceFlushEvents: [
                'SECURITY_BREACH',
                'UNAUTHORIZED_ACCESS',
                'SYSTEM_COMPROMISE',
                'CRITICAL_VIOLATION'
            ],
            
            // Encryption settings
            encryptLogs: options.encryption || false,
            encryptionKey: options.encryptionKey,
            hashChain: true,
            digitalSignatures: true,
            
            // Indexing settings
            enableIndexing: true,
            indexFlushInterval: 60000,    // 1 minute
            timeWindowSize: 3600000,      // 1 hour windows
            
            // Alert settings
            realTimeAlerts: true,
            alertThresholds: {
                'FAILED_LOGIN': 5,
                'SUSPICIOUS_ACTIVITY': 3,
                'RATE_LIMIT_VIOLATION': 10,
                'VALIDATION_FAILURE': 5
            },
            
            // Compliance settings
            complianceLevel: 'HIGH',
            includeStackTraces: true,
            includeRequestDetails: true,
            sanitizePasswords: true,
            
            // Performance settings
            asyncLogging: true,
            compressionEnabled: true,
            batchWrites: true
        };

        // Security settings
        this.security = {
            logIntegrityKey: this.generateIntegrityKey(),
            lastHashChainLink: null,
            signaturePrivateKey: options.signatureKey,
            tamperDetection: true
        };

        // State tracking
        this.currentLogFile = null;
        this.currentLogFileSize = 0;
        this.logSequenceNumber = 0;
        this.flushTimer = null;
        this.indexFlushTimer = null;
        
        // Alert tracking
        this.alertCounts = new Map();
        this.lastAlertTime = new Map();
        
        this.initializeLogger();
    }

    /**
     * Log a security event
     */
    async logSecurityEvent(eventType, data, metadata = {}) {
        const eventId = this.generateEventId();
        const timestamp = Date.now();
        
        try {
            // Create log entry
            const logEntry = {
                id: eventId,
                timestamp,
                eventType,
                severity: this.determineSeverity(eventType),
                category: this.categorizeEvent(eventType),
                data: this.sanitizeData(data),
                metadata: {
                    ...metadata,
                    source: metadata.source || 'SECURITY_SYSTEM',
                    sessionId: metadata.sessionId,
                    userAgent: metadata.userAgent,
                    ipAddress: metadata.ipAddress,
                    requestId: metadata.requestId
                },
                
                // Security fields
                sequenceNumber: ++this.logSequenceNumber,
                checksum: null,
                signature: null,
                hashChainLink: null,
                
                // Context fields
                systemState: await this.captureSystemState(),
                stackTrace: this.config.includeStackTraces ? this.captureStackTrace() : null,
                
                // Compliance fields
                complianceFlags: this.getComplianceFlags(eventType),
                retentionPolicy: this.getRetentionPolicy(eventType),
                
                // Processing fields
                processed: false,
                indexed: false,
                archived: false
            };
            
            // Calculate security fields
            logEntry.checksum = this.calculateChecksum(logEntry);
            logEntry.hashChainLink = this.calculateHashChainLink(logEntry);
            
            if (this.config.digitalSignatures && this.security.signaturePrivateKey) {
                logEntry.signature = this.generateDigitalSignature(logEntry);
            }
            
            // Add to buffer
            this.logBuffer.push(logEntry);
            
            // Add to indices
            this.updateIndices(logEntry);
            
            // Check for immediate flush
            if (this.shouldForceFlush(eventType) || this.logBuffer.length >= this.config.bufferSize) {
                await this.flushBuffer();
            }
            
            // Check for alerts
            if (this.config.realTimeAlerts) {
                await this.checkAlertConditions(logEntry);
            }
            
            // Track user activity
            if (data.userId) {
                this.trackUserActivity(data.userId, logEntry);
            }
            
            return eventId;
            
        } catch (error) {
            // Critical: logging system failure
            console.error('[AUDIT_LOGGER] Failed to log security event:', {
                eventType,
                error: error.message,
                timestamp
            });
            
            // Try to log the logging failure
            try {
                await this.logSystemEvent('LOGGING_FAILURE', {
                    originalEventType: eventType,
                    error: error.message,
                    timestamp
                });
            } catch (secondaryError) {
                console.error('[AUDIT_LOGGER] Critical: Secondary logging failure:', secondaryError.message);
            }
            
            throw error;
        }
    }

    /**
     * Log user activity
     */
    async logUserActivity(userId, activity, details = {}) {
        return await this.logSecurityEvent('USER_ACTIVITY', {
            userId,
            activity,
            details,
            timestamp: Date.now()
        });
    }

    /**
     * Log system event
     */
    async logSystemEvent(eventType, data, metadata = {}) {
        return await this.logSecurityEvent(eventType, {
            ...data,
            systemEvent: true
        }, {
            ...metadata,
            source: 'SYSTEM'
        });
    }

    /**
     * Log authentication event
     */
    async logAuthEvent(eventType, userId, details = {}) {
        return await this.logSecurityEvent(eventType, {
            userId,
            ...details,
            category: 'AUTHENTICATION'
        });
    }

    /**
     * Log access control event
     */
    async logAccessEvent(eventType, userId, resource, action, result) {
        return await this.logSecurityEvent(eventType, {
            userId,
            resource,
            action,
            result,
            category: 'ACCESS_CONTROL'
        });
    }

    /**
     * Log data modification event
     */
    async logDataEvent(eventType, userId, dataType, operation, before = null, after = null) {
        return await this.logSecurityEvent(eventType, {
            userId,
            dataType,
            operation,
            before: this.sanitizeData(before),
            after: this.sanitizeData(after),
            category: 'DATA_MODIFICATION'
        });
    }

    /**
     * Flush log buffer to persistent storage
     */
    async flushBuffer() {
        if (this.logBuffer.length === 0) {
            return;
        }
        
        const entriesToFlush = [...this.logBuffer];
        this.logBuffer = [];
        
        try {
            // Prepare log data
            const logData = await this.prepareLogData(entriesToFlush);
            
            // Write to file
            await this.writeToLogFile(logData);
            
            // Update processing status
            entriesToFlush.forEach(entry => {
                entry.processed = true;
                this.logIndex.set(entry.id, entry);
            });
            
            // Update last hash chain link
            if (entriesToFlush.length > 0) {
                this.security.lastHashChainLink = entriesToFlush[entriesToFlush.length - 1].hashChainLink;
            }
            
        } catch (error) {
            // Re-add entries to buffer on failure
            this.logBuffer.unshift(...entriesToFlush);
            throw error;
        }
    }

    /**
     * Prepare log data for writing
     */
    async prepareLogData(entries) {
        let logData = entries.map(entry => JSON.stringify(entry)).join('\n') + '\n';
        
        // Apply compression if enabled
        if (this.config.compressionEnabled) {
            logData = await this.compressData(logData);
        }
        
        // Apply encryption if enabled
        if (this.config.encryptLogs && this.config.encryptionKey) {
            logData = await this.encryptData(logData);
        }
        
        return logData;
    }

    /**
     * Write data to log file
     */
    async writeToLogFile(data) {
        // Check if new log file is needed
        if (!this.currentLogFile || this.currentLogFileSize + data.length > this.config.maxLogFileSize) {
            await this.rotateLogFile();
        }
        
        // Write data
        await fs.appendFile(this.currentLogFile, data);
        this.currentLogFileSize += data.length;
    }

    /**
     * Rotate log file
     */
    async rotateLogFile() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `security-audit-${timestamp}.log`;
        this.currentLogFile = path.join(this.config.logDirectory, fileName);
        this.currentLogFileSize = 0;
        
        // Ensure directory exists
        await fs.mkdir(this.config.logDirectory, { recursive: true });
        
        // Clean up old log files
        await this.cleanupOldLogFiles();
    }

    /**
     * Clean up old log files
     */
    async cleanupOldLogFiles() {
        try {
            const files = await fs.readdir(this.config.logDirectory);
            const logFiles = files.filter(file => file.startsWith('security-audit-'));
            
            // Sort by creation time (newest first)
            const fileStats = await Promise.all(
                logFiles.map(async file => {
                    const filePath = path.join(this.config.logDirectory, file);
                    const stats = await fs.stat(filePath);
                    return { file, path: filePath, mtime: stats.mtime };
                })
            );
            
            fileStats.sort((a, b) => b.mtime - a.mtime);
            
            // Remove excess files
            if (fileStats.length > this.config.maxLogFiles) {
                const filesToDelete = fileStats.slice(this.config.maxLogFiles);
                for (const fileInfo of filesToDelete) {
                    await fs.unlink(fileInfo.path);
                }
            }
            
            // Remove files older than retention period
            const retentionCutoff = Date.now() - (this.config.retentionDays * 24 * 60 * 60 * 1000);
            for (const fileInfo of fileStats) {
                if (fileInfo.mtime.getTime() < retentionCutoff) {
                    await fs.unlink(fileInfo.path);
                }
            }
            
        } catch (error) {
            console.error('[AUDIT_LOGGER] Failed to cleanup old log files:', error.message);
        }
    }

    /**
     * Update search indices
     */
    updateIndices(logEntry) {
        if (!this.config.enableIndexing) {
            return;
        }
        
        // Add to main index
        this.logIndex.set(logEntry.id, logEntry);
        
        // Add to event type index
        if (!this.eventTypeIndex.has(logEntry.eventType)) {
            this.eventTypeIndex.set(logEntry.eventType, []);
        }
        this.eventTypeIndex.get(logEntry.eventType).push(logEntry.id);
        
        // Add to time index
        const timeWindow = Math.floor(logEntry.timestamp / this.config.timeWindowSize);
        if (!this.timeIndex.has(timeWindow)) {
            this.timeIndex.set(timeWindow, []);
        }
        this.timeIndex.get(timeWindow).push(logEntry.id);
        
        // Add to user activity index
        if (logEntry.data.userId) {
            this.trackUserActivity(logEntry.data.userId, logEntry);
        }
        
        logEntry.indexed = true;
    }

    /**
     * Track user activity
     */
    trackUserActivity(userId, logEntry) {
        if (!this.userActivityIndex.has(userId)) {
            this.userActivityIndex.set(userId, []);
        }
        
        const userActivity = this.userActivityIndex.get(userId);
        userActivity.push({
            eventId: logEntry.id,
            timestamp: logEntry.timestamp,
            eventType: logEntry.eventType,
            severity: logEntry.severity
        });
        
        // Keep only recent activity (last 1000 events)
        if (userActivity.length > 1000) {
            userActivity.splice(0, userActivity.length - 1000);
        }
    }

    /**
     * Check alert conditions
     */
    async checkAlertConditions(logEntry) {
        const eventType = logEntry.eventType;
        const threshold = this.config.alertThresholds[eventType];
        
        if (!threshold) {
            return;
        }
        
        // Count recent events of this type
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        
        if (!this.alertCounts.has(eventType)) {
            this.alertCounts.set(eventType, []);
        }
        
        const eventCounts = this.alertCounts.get(eventType);
        
        // Remove old events
        const cutoff = now - oneHour;
        const recentEvents = eventCounts.filter(timestamp => timestamp > cutoff);
        this.alertCounts.set(eventType, recentEvents);
        
        // Add current event
        recentEvents.push(now);
        
        // Check threshold
        if (recentEvents.length >= threshold) {
            await this.triggerAlert(eventType, recentEvents.length, logEntry);
        }
    }

    /**
     * Trigger security alert
     */
    async triggerAlert(eventType, count, triggerEvent) {
        const alertId = this.generateAlertId();
        const alert = {
            id: alertId,
            eventType,
            count,
            threshold: this.config.alertThresholds[eventType],
            triggerEvent,
            timestamp: Date.now(),
            severity: this.determineAlertSeverity(eventType, count),
            status: 'ACTIVE'
        };
        
        // Log the alert
        await this.logSystemEvent('SECURITY_ALERT_TRIGGERED', alert);
        
        // Notify subscribers
        const subscribers = this.alertSubscribers.get(eventType) || [];
        for (const subscriber of subscribers) {
            try {
                await subscriber.notify(alert);
            } catch (error) {
                console.error('[AUDIT_LOGGER] Failed to notify alert subscriber:', error.message);
            }
        }
        
        // Update last alert time
        this.lastAlertTime.set(eventType, Date.now());
    }

    /**
     * Search log entries
     */
    async searchLogs(criteria) {
        const results = [];
        
        // Parse search criteria
        const {
            eventTypes = [],
            severity = null,
            userId = null,
            startTime = null,
            endTime = null,
            limit = 100,
            offset = 0
        } = criteria;
        
        // Get candidate entries
        let candidates = [];
        
        if (eventTypes.length > 0) {
            // Search by event type
            for (const eventType of eventTypes) {
                const eventIds = this.eventTypeIndex.get(eventType) || [];
                candidates.push(...eventIds);
            }
        } else {
            // Get all entries
            candidates = Array.from(this.logIndex.keys());
        }
        
        // Filter candidates
        for (const eventId of candidates) {
            const entry = this.logIndex.get(eventId);
            if (!entry) continue;
            
            // Apply filters
            if (severity && entry.severity !== severity) continue;
            if (userId && entry.data.userId !== userId) continue;
            if (startTime && entry.timestamp < startTime) continue;
            if (endTime && entry.timestamp > endTime) continue;
            
            results.push(entry);
        }
        
        // Sort by timestamp (newest first)
        results.sort((a, b) => b.timestamp - a.timestamp);
        
        // Apply pagination
        return results.slice(offset, offset + limit);
    }

    /**
     * Get user activity history
     */
    getUserActivity(userId, timeRange = null) {
        const userActivity = this.userActivityIndex.get(userId) || [];
        
        if (!timeRange) {
            return userActivity;
        }
        
        return userActivity.filter(activity => 
            activity.timestamp >= timeRange.start && 
            activity.timestamp <= timeRange.end
        );
    }

    /**
     * Generate audit report
     */
    async generateAuditReport(timeRange, options = {}) {
        const { start, end } = timeRange;
        const report = {
            reportId: this.generateReportId(),
            timeRange,
            generatedAt: Date.now(),
            summary: {
                totalEvents: 0,
                eventsByType: {},
                eventsBySeverity: {},
                uniqueUsers: new Set(),
                topEvents: [],
                securityIncidents: []
            },
            details: options.includeDetails ? [] : null,
            compliance: {
                retentionCompliance: true,
                integrityVerified: false,
                dataComplete: true
            }
        };
        
        // Collect events in time range
        const events = await this.searchLogs({
            startTime: start,
            endTime: end,
            limit: 10000
        });
        
        // Generate summary
        report.summary.totalEvents = events.length;
        
        for (const event of events) {
            // Count by type
            report.summary.eventsByType[event.eventType] = 
                (report.summary.eventsByType[event.eventType] || 0) + 1;
            
            // Count by severity
            report.summary.eventsBySeverity[event.severity] = 
                (report.summary.eventsBySeverity[event.severity] || 0) + 1;
            
            // Track unique users
            if (event.data.userId) {
                report.summary.uniqueUsers.add(event.data.userId);
            }
            
            // Collect security incidents
            if (event.severity === 'HIGH' || event.severity === 'CRITICAL') {
                report.summary.securityIncidents.push({
                    eventId: event.id,
                    eventType: event.eventType,
                    timestamp: event.timestamp,
                    severity: event.severity,
                    userId: event.data.userId
                });
            }
        }
        
        // Convert Set to count
        report.summary.uniqueUsers = report.summary.uniqueUsers.size;
        
        // Find top events
        const eventTypeCounts = Object.entries(report.summary.eventsByType)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
        
        report.summary.topEvents = eventTypeCounts.map(([type, count]) => ({
            eventType: type,
            count
        }));
        
        // Verify integrity if requested
        if (options.verifyIntegrity) {
            report.compliance.integrityVerified = await this.verifyLogIntegrity(start, end);
        }
        
        // Include details if requested
        if (options.includeDetails) {
            report.details = events.map(event => ({
                id: event.id,
                timestamp: event.timestamp,
                eventType: event.eventType,
                severity: event.severity,
                userId: event.data.userId,
                summary: this.summarizeEvent(event)
            }));
        }
        
        return report;
    }

    /**
     * Verify log integrity
     */
    async verifyLogIntegrity(startTime = null, endTime = null) {
        const events = await this.searchLogs({
            startTime,
            endTime,
            limit: 100000
        });
        
        let integrityValid = true;
        const issues = [];
        
        for (const event of events) {
            // Verify checksum
            const calculatedChecksum = this.calculateChecksum(event);
            if (calculatedChecksum !== event.checksum) {
                integrityValid = false;
                issues.push({
                    eventId: event.id,
                    issue: 'CHECKSUM_MISMATCH',
                    expected: event.checksum,
                    calculated: calculatedChecksum
                });
            }
            
            // Verify hash chain link
            if (this.config.hashChain) {
                const calculatedLink = this.calculateHashChainLink(event);
                if (calculatedLink !== event.hashChainLink) {
                    integrityValid = false;
                    issues.push({
                        eventId: event.id,
                        issue: 'HASH_CHAIN_BROKEN',
                        expected: event.hashChainLink,
                        calculated: calculatedLink
                    });
                }
            }
        }
        
        return {
            valid: integrityValid,
            eventsChecked: events.length,
            issues
        };
    }

    /**
     * Initialize logger
     */
    async initializeLogger() {
        // Ensure log directory exists
        await fs.mkdir(this.config.logDirectory, { recursive: true });
        
        // Start flush timer
        if (this.config.flushInterval > 0) {
            this.flushTimer = setInterval(() => {
                this.flushBuffer().catch(error => {
                    console.error('[AUDIT_LOGGER] Flush error:', error.message);
                });
            }, this.config.flushInterval);
        }
        
        // Start index flush timer
        if (this.config.indexFlushInterval > 0) {
            this.indexFlushTimer = setInterval(() => {
                this.flushIndices().catch(error => {
                    console.error('[AUDIT_LOGGER] Index flush error:', error.message);
                });
            }, this.config.indexFlushInterval);
        }
        
        // Log system startup
        await this.logSystemEvent('AUDIT_LOGGER_STARTED', {
            config: {
                encryptLogs: this.config.encryptLogs,
                hashChain: this.config.hashChain,
                digitalSignatures: this.config.digitalSignatures,
                bufferSize: this.config.bufferSize,
                retentionDays: this.config.retentionDays
            }
        });
    }

    /**
     * Utility methods
     */
    generateEventId() {
        return `event_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;
    }

    generateAlertId() {
        return `alert_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    }

    generateReportId() {
        return `report_${Date.now()}_${crypto.randomBytes(6).toString('hex')}`;
    }

    generateIntegrityKey() {
        return crypto.randomBytes(32);
    }

    determineSeverity(eventType) {
        const severityMap = {
            'SECURITY_BREACH': 'CRITICAL',
            'UNAUTHORIZED_ACCESS': 'HIGH',
            'AUTHENTICATION_FAILURE': 'MEDIUM',
            'SUSPICIOUS_ACTIVITY': 'MEDIUM',
            'RATE_LIMIT_VIOLATION': 'LOW',
            'USER_ACTIVITY': 'INFO',
            'SYSTEM_EVENT': 'INFO'
        };
        
        return severityMap[eventType] || 'MEDIUM';
    }

    categorizeEvent(eventType) {
        if (eventType.includes('AUTH')) return 'AUTHENTICATION';
        if (eventType.includes('ACCESS')) return 'ACCESS_CONTROL';
        if (eventType.includes('DATA')) return 'DATA_PROTECTION';
        if (eventType.includes('NETWORK')) return 'NETWORK_SECURITY';
        if (eventType.includes('SYSTEM')) return 'SYSTEM_SECURITY';
        return 'GENERAL';
    }

    sanitizeData(data) {
        if (!data || typeof data !== 'object') return data;
        
        const sanitized = JSON.parse(JSON.stringify(data));
        
        // Remove sensitive fields
        if (this.config.sanitizePasswords) {
            this.sanitizePasswords(sanitized);
        }
        
        return sanitized;
    }

    sanitizePasswords(obj) {
        if (typeof obj !== 'object' || obj === null) return;
        
        for (const key in obj) {
            if (typeof obj[key] === 'string' && 
                (key.toLowerCase().includes('password') || 
                 key.toLowerCase().includes('secret') ||
                 key.toLowerCase().includes('token'))) {
                obj[key] = '[REDACTED]';
            } else if (typeof obj[key] === 'object') {
                this.sanitizePasswords(obj[key]);
            }
        }
    }

    calculateChecksum(entry) {
        const data = {
            id: entry.id,
            timestamp: entry.timestamp,
            eventType: entry.eventType,
            data: entry.data,
            sequenceNumber: entry.sequenceNumber
        };
        
        return crypto.createHmac('sha256', this.security.logIntegrityKey)
            .update(JSON.stringify(data))
            .digest('hex');
    }

    calculateHashChainLink(entry) {
        const data = entry.checksum + (this.security.lastHashChainLink || '');
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    generateDigitalSignature(entry) {
        // Implementation would use actual private key signing
        return crypto.createHmac('sha256', this.security.signaturePrivateKey || 'default-key')
            .update(entry.checksum)
            .digest('hex');
    }

    async captureSystemState() {
        return {
            timestamp: Date.now(),
            memoryUsage: process.memoryUsage(),
            uptime: process.uptime(),
            nodeVersion: process.version
        };
    }

    captureStackTrace() {
        const stack = new Error().stack;
        return stack ? stack.split('\n').slice(3, 8) : null; // Skip first 3 lines
    }

    getComplianceFlags(eventType) {
        return {
            pii: this.containsPII(eventType),
            retention: this.getRetentionPolicy(eventType),
            encryption: this.requiresEncryption(eventType)
        };
    }

    getRetentionPolicy(eventType) {
        const retentionMap = {
            'AUTHENTICATION_FAILURE': 365,  // 1 year
            'SECURITY_BREACH': 2555,        // 7 years
            'DATA_ACCESS': 1095,            // 3 years
            'USER_ACTIVITY': 90             // 90 days
        };
        
        return retentionMap[eventType] || this.config.retentionDays;
    }

    containsPII(eventType) {
        return eventType.includes('USER') || eventType.includes('AUTH');
    }

    requiresEncryption(eventType) {
        return this.determineSeverity(eventType) === 'HIGH' || 
               this.determineSeverity(eventType) === 'CRITICAL';
    }

    shouldForceFlush(eventType) {
        return this.config.forceFlushEvents.includes(eventType);
    }

    determineAlertSeverity(eventType, count) {
        const threshold = this.config.alertThresholds[eventType];
        if (count >= threshold * 3) return 'CRITICAL';
        if (count >= threshold * 2) return 'HIGH';
        return 'MEDIUM';
    }

    summarizeEvent(event) {
        return `${event.eventType}: ${event.data.userId || 'System'} at ${new Date(event.timestamp).toISOString()}`;
    }

    async compressData(data) {
        // Implementation would use actual compression
        return data;
    }

    async encryptData(data) {
        // Implementation would use actual encryption
        return data;
    }

    async flushIndices() {
        // Implementation would persist indices to disk
    }

    /**
     * Cleanup and shutdown
     */
    async shutdown() {
        // Clear timers
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        if (this.indexFlushTimer) {
            clearInterval(this.indexFlushTimer);
        }
        
        // Final flush
        await this.flushBuffer();
        await this.flushIndices();
        
        // Log shutdown
        await this.logSystemEvent('AUDIT_LOGGER_SHUTDOWN', {
            finalSequenceNumber: this.logSequenceNumber,
            totalEventsLogged: this.logIndex.size
        });
    }

    /**
     * Subscribe to alerts
     */
    subscribeToAlerts(eventType, subscriber) {
        if (!this.alertSubscribers.has(eventType)) {
            this.alertSubscribers.set(eventType, []);
        }
        this.alertSubscribers.get(eventType).push(subscriber);
    }

    /**
     * Get system status
     */
    getSystemStatus() {
        return {
            bufferSize: this.logBuffer.length,
            totalEvents: this.logIndex.size,
            currentLogFile: this.currentLogFile,
            currentLogFileSize: this.currentLogFileSize,
            sequenceNumber: this.logSequenceNumber,
            lastHashChainLink: this.security.lastHashChainLink,
            systemHealth: this.calculateSystemHealth()
        };
    }

    calculateSystemHealth() {
        if (this.logBuffer.length > this.config.bufferSize * 0.9) return 'OVERLOADED';
        if (this.currentLogFileSize > this.config.maxLogFileSize * 0.9) return 'ROTATION_NEEDED';
        return 'HEALTHY';
    }
}

module.exports = SecurityAuditLogger;
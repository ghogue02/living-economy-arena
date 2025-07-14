/**
 * Advanced Rate Limiting and Overload Protection System
 * Prevents server overload while maintaining 100,000+ connections
 */

const crypto = require('crypto');
const EventEmitter = require('events');

class OverloadProtectionSystem extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            maxConnections: config.maxConnections || 100000,
            maxRequestsPerSecond: config.maxRequestsPerSecond || 50000,
            circuitBreakerThreshold: config.circuitBreakerThreshold || 0.1, // 10% error rate
            adaptiveScaling: config.adaptiveScaling !== false,
            ddosProtection: config.ddosProtection !== false,
            gracefulDegradation: config.gracefulDegradation !== false,
            ...config
        };
        
        // Rate limiting stores
        this.connectionLimits = new Map();
        this.requestLimits = new Map();
        this.ipLimits = new Map();
        this.userAgentLimits = new Map();
        
        // Circuit breakers
        this.circuitBreakers = new Map();
        
        // Adaptive scaling
        this.loadMetrics = {
            cpu: 0,
            memory: 0,
            connections: 0,
            requestsPerSecond: 0,
            errorRate: 0,
            averageLatency: 0
        };
        
        // DDoS detection
        this.ddosDetection = {
            suspiciousIPs: new Map(),
            rateLimitViolations: new Map(),
            patternAnalysis: new Map(),
            geoAnomalies: new Map()
        };
        
        // Graceful degradation levels
        this.degradationLevels = {
            NORMAL: 0,
            LIGHT_LOAD: 1,
            MODERATE_LOAD: 2,
            HEAVY_LOAD: 3,
            CRITICAL_LOAD: 4,
            EMERGENCY: 5
        };
        
        this.currentDegradationLevel = this.degradationLevels.NORMAL;
        
        // Priority queues for different request types
        this.priorityQueues = new Map([
            ['critical', []],      // Market data, trade execution
            ['high', []],          // User commands, real-time updates  
            ['medium', []],        // Agent updates, notifications
            ['low', []],           // Analytics, historical data
            ['background', []]     // Cleanup, maintenance
        ]);
        
        this.initializeProtectionSystem();
    }

    initializeProtectionSystem() {
        // Setup rate limiting algorithms
        this.setupRateLimiters();
        
        // Initialize circuit breakers
        this.initializeCircuitBreakers();
        
        // Start monitoring and adaptive systems
        this.startMonitoring();
        this.startAdaptiveScaling();
        this.startDDoSDetection();
        
        // Setup request prioritization
        this.startRequestProcessor();
        
        console.log('Overload Protection System initialized');
        console.log(`Max connections: ${this.config.maxConnections}`);
        console.log(`Max requests/sec: ${this.config.maxRequestsPerSecond}`);
        
        this.emit('ready');
    }

    setupRateLimiters() {
        // Connection-based limits
        this.connectionLimiter = new TokenBucketLimiter({
            capacity: this.config.maxConnections,
            refillRate: this.config.maxConnections / 10, // Refill 10% per second
            name: 'connections'
        });
        
        // Request-based limits
        this.requestLimiter = new SlidingWindowLimiter({
            windowSize: 1000, // 1 second window
            maxRequests: this.config.maxRequestsPerSecond,
            name: 'requests'
        });
        
        // IP-based limits
        this.ipLimiter = new HierarchicalLimiter({
            levels: [
                { window: 1000, limit: 1000 },    // 1000 req/sec per IP
                { window: 60000, limit: 10000 },  // 10k req/min per IP
                { window: 3600000, limit: 100000 } // 100k req/hour per IP
            ],
            name: 'ip'
        });
        
        // User agent limits (bot detection)
        this.userAgentLimiter = new PatternLimiter({
            patterns: [
                { pattern: /bot|crawler|spider/i, limit: 100 },
                { pattern: /curl|wget|python/i, limit: 50 },
                { pattern: /.*/, limit: 1000 } // Default
            ],
            window: 60000,
            name: 'user_agent'
        });
    }

    initializeCircuitBreakers() {
        const endpoints = [
            'websocket_connect',
            'market_data',
            'trade_execution',
            'agent_update',
            'user_auth'
        ];
        
        endpoints.forEach(endpoint => {
            this.circuitBreakers.set(endpoint, new CircuitBreaker({
                failureThreshold: 5, // 5 failures
                timeout: 60000, // 60 second timeout
                resetTimeout: 30000, // 30 second reset
                name: endpoint
            }));
        });
    }

    // Main request processing method
    async processRequest(request, context = {}) {
        const startTime = Date.now();
        
        try {
            // 1. Initial request validation
            const validationResult = this.validateRequest(request, context);
            if (!validationResult.allowed) {
                return this.createRejectionResponse(validationResult.reason, validationResult.code);
            }
            
            // 2. DDoS detection check
            if (this.config.ddosProtection) {
                const ddosCheck = await this.checkDDoSPattern(request, context);
                if (ddosCheck.blocked) {
                    return this.createRejectionResponse('DDoS protection triggered', 429);
                }
            }
            
            // 3. Rate limiting checks
            const rateLimitResult = await this.checkRateLimits(request, context);
            if (!rateLimitResult.allowed) {
                return this.createRejectionResponse(rateLimitResult.reason, 429);
            }
            
            // 4. Circuit breaker check
            const endpoint = this.getEndpointFromRequest(request);
            const circuitBreaker = this.circuitBreakers.get(endpoint);
            if (circuitBreaker && circuitBreaker.state === 'OPEN') {
                return this.createRejectionResponse('Service temporarily unavailable', 503);
            }
            
            // 5. Load-based admission control
            const admissionResult = this.checkAdmissionControl(request, context);
            if (!admissionResult.allowed) {
                return this.createRejectionResponse(admissionResult.reason, 503);
            }
            
            // 6. Priority-based queueing
            const priority = this.calculateRequestPriority(request, context);
            if (priority < this.getMinimumPriorityForCurrentLoad()) {
                return this.queueRequest(request, context, priority);
            }
            
            // 7. Process request
            const result = await this.executeRequest(request, context);
            
            // 8. Update metrics and circuit breaker
            const latency = Date.now() - startTime;
            this.updateMetrics(endpoint, true, latency);
            if (circuitBreaker) {
                circuitBreaker.recordSuccess();
            }
            
            return result;
            
        } catch (error) {
            // Handle errors and update circuit breaker
            const latency = Date.now() - startTime;
            const endpoint = this.getEndpointFromRequest(request);
            
            this.updateMetrics(endpoint, false, latency);
            
            const circuitBreaker = this.circuitBreakers.get(endpoint);
            if (circuitBreaker) {
                circuitBreaker.recordFailure();
            }
            
            throw error;
        }
    }

    validateRequest(request, context) {
        // Basic request validation
        if (!request || !request.type) {
            return { allowed: false, reason: 'Invalid request format', code: 400 };
        }
        
        // Check if we're in emergency mode
        if (this.currentDegradationLevel >= this.degradationLevels.EMERGENCY) {
            const criticalTypes = ['trade_execution', 'market_data_critical'];
            if (!criticalTypes.includes(request.type)) {
                return { allowed: false, reason: 'Emergency mode - only critical requests allowed', code: 503 };
            }
        }
        
        // Validate request size
        const requestSize = JSON.stringify(request).length;
        if (requestSize > 1024 * 1024) { // 1MB limit
            return { allowed: false, reason: 'Request too large', code: 413 };
        }
        
        return { allowed: true };
    }

    async checkDDoSPattern(request, context) {
        const clientIP = context.clientIP || context.ip;
        const userAgent = context.userAgent || '';
        const timestamp = Date.now();
        
        if (!clientIP) {
            return { blocked: false };
        }
        
        // Pattern 1: Excessive request rate from single IP
        const ipRequests = this.ddosDetection.rateLimitViolations.get(clientIP) || [];
        ipRequests.push(timestamp);
        
        // Keep only last minute
        const recentRequests = ipRequests.filter(t => timestamp - t < 60000);
        this.ddosDetection.rateLimitViolations.set(clientIP, recentRequests);
        
        if (recentRequests.length > 6000) { // 100 req/sec for 1 minute
            this.markSuspiciousIP(clientIP, 'high_rate');
            return { blocked: true, reason: 'Excessive request rate' };
        }
        
        // Pattern 2: Suspicious user agent patterns
        const suspiciousPatterns = [
            /bot.*bot/i,
            /attack/i,
            /scan/i,
            /flood/i,
            /stress/i
        ];
        
        if (suspiciousPatterns.some(pattern => pattern.test(userAgent))) {
            this.markSuspiciousIP(clientIP, 'suspicious_user_agent');
            return { blocked: true, reason: 'Suspicious user agent' };
        }
        
        // Pattern 3: Geographic anomalies (simplified)
        const ipGeolocation = this.getIPGeolocation(clientIP);
        if (ipGeolocation && this.isGeoAnomalous(ipGeolocation)) {
            this.markSuspiciousIP(clientIP, 'geo_anomaly');
            return { blocked: true, reason: 'Geographic anomaly detected' };
        }
        
        // Pattern 4: Request pattern analysis
        const patternKey = `${clientIP}:${request.type}`;
        const patterns = this.ddosDetection.patternAnalysis.get(patternKey) || [];
        patterns.push({ timestamp, request: request.type });
        
        // Keep only last 5 minutes
        const recentPatterns = patterns.filter(p => timestamp - p.timestamp < 300000);
        this.ddosDetection.patternAnalysis.set(patternKey, recentPatterns);
        
        // Detect repetitive patterns
        if (this.detectRepetitivePattern(recentPatterns)) {
            this.markSuspiciousIP(clientIP, 'repetitive_pattern');
            return { blocked: true, reason: 'Repetitive attack pattern detected' };
        }
        
        return { blocked: false };
    }

    markSuspiciousIP(ip, reason) {
        const suspiciousData = this.ddosDetection.suspiciousIPs.get(ip) || {
            reasons: [],
            firstSeen: Date.now(),
            score: 0
        };
        
        suspiciousData.reasons.push({ reason, timestamp: Date.now() });
        suspiciousData.score += this.getThreatScore(reason);
        
        this.ddosDetection.suspiciousIPs.set(ip, suspiciousData);
        
        // Emit alert for monitoring
        this.emit('suspicious_activity', { ip, reason, score: suspiciousData.score });
        
        console.warn(`Marked IP ${ip} as suspicious: ${reason} (score: ${suspiciousData.score})`);
    }

    getThreatScore(reason) {
        const scores = {
            'high_rate': 10,
            'suspicious_user_agent': 5,
            'geo_anomaly': 3,
            'repetitive_pattern': 8
        };
        return scores[reason] || 1;
    }

    detectRepetitivePattern(patterns) {
        if (patterns.length < 10) return false;
        
        // Simple pattern detection: same request type at regular intervals
        const intervals = [];
        for (let i = 1; i < patterns.length; i++) {
            if (patterns[i].request === patterns[i-1].request) {
                intervals.push(patterns[i].timestamp - patterns[i-1].timestamp);
            }
        }
        
        if (intervals.length < 5) return false;
        
        // Check if intervals are suspiciously regular
        const avgInterval = intervals.reduce((sum, interval) => sum + interval, 0) / intervals.length;
        const variance = intervals.reduce((sum, interval) => sum + Math.pow(interval - avgInterval, 2), 0) / intervals.length;
        const coefficient = Math.sqrt(variance) / avgInterval;
        
        // Low coefficient of variation suggests automated pattern
        return coefficient < 0.1 && avgInterval < 1000; // Less than 1 second intervals
    }

    getIPGeolocation(ip) {
        // Simplified geolocation - in production, use a real service
        const privateRanges = [
            /^10\./,
            /^192\.168\./,
            /^172\.(1[6-9]|2[0-9]|3[01])\./,
            /^127\./
        ];
        
        if (privateRanges.some(range => range.test(ip))) {
            return null; // Private IP
        }
        
        // Mock geolocation data
        return {
            country: 'US',
            region: 'California',
            city: 'San Francisco'
        };
    }

    isGeoAnomalous(geolocation) {
        // Simplified anomaly detection
        const suspiciousCountries = ['XX', 'ZZ']; // Placeholder for suspicious countries
        return suspiciousCountries.includes(geolocation.country);
    }

    async checkRateLimits(request, context) {
        const clientIP = context.clientIP || context.ip;
        const userAgent = context.userAgent || '';
        
        // Global connection limit
        if (!this.connectionLimiter.isAllowed()) {
            return { allowed: false, reason: 'Global connection limit exceeded' };
        }
        
        // Global request rate limit
        if (!this.requestLimiter.isAllowed()) {
            return { allowed: false, reason: 'Global request rate limit exceeded' };
        }
        
        // IP-based rate limit
        if (clientIP && !this.ipLimiter.isAllowed(clientIP)) {
            return { allowed: false, reason: 'IP rate limit exceeded' };
        }
        
        // User agent rate limit
        if (!this.userAgentLimiter.isAllowed(userAgent)) {
            return { allowed: false, reason: 'User agent rate limit exceeded' };
        }
        
        // Check if IP is marked as suspicious
        const suspiciousData = this.ddosDetection.suspiciousIPs.get(clientIP);
        if (suspiciousData && suspiciousData.score > 50) {
            return { allowed: false, reason: 'IP blocked due to suspicious activity' };
        }
        
        return { allowed: true };
    }

    checkAdmissionControl(request, context) {
        const currentLoad = this.calculateCurrentLoad();
        
        // Reject requests if system is overloaded
        if (currentLoad > 0.95) {
            return { allowed: false, reason: 'System overloaded' };
        }
        
        // Apply degradation based on current load
        const degradationLevel = this.calculateDegradationLevel(currentLoad);
        
        if (degradationLevel > this.degradationLevels.NORMAL) {
            const requestPriority = this.calculateRequestPriority(request, context);
            const minPriority = this.getMinimumPriorityForLevel(degradationLevel);
            
            if (requestPriority < minPriority) {
                return { allowed: false, reason: `Request priority too low for current load level` };
            }
        }
        
        return { allowed: true };
    }

    calculateCurrentLoad() {
        // Weighted load calculation
        const cpuWeight = 0.3;
        const memoryWeight = 0.2;
        const connectionWeight = 0.3;
        const latencyWeight = 0.2;
        
        const cpuLoad = this.loadMetrics.cpu / 100;
        const memoryLoad = this.loadMetrics.memory / 100;
        const connectionLoad = this.loadMetrics.connections / this.config.maxConnections;
        const latencyLoad = Math.min(this.loadMetrics.averageLatency / 1000, 1); // Normalize to 1s
        
        return (cpuLoad * cpuWeight) + 
               (memoryLoad * memoryWeight) + 
               (connectionLoad * connectionWeight) + 
               (latencyLoad * latencyWeight);
    }

    calculateDegradationLevel(load) {
        if (load < 0.6) return this.degradationLevels.NORMAL;
        if (load < 0.7) return this.degradationLevels.LIGHT_LOAD;
        if (load < 0.8) return this.degradationLevels.MODERATE_LOAD;
        if (load < 0.9) return this.degradationLevels.HEAVY_LOAD;
        if (load < 0.95) return this.degradationLevels.CRITICAL_LOAD;
        return this.degradationLevels.EMERGENCY;
    }

    calculateRequestPriority(request, context) {
        // Priority scoring (higher = more important)
        let priority = 50; // Base priority
        
        // Request type priority
        const typePriorities = {
            'trade_execution': 100,
            'market_data_critical': 95,
            'websocket_connect': 80,
            'market_data': 70,
            'agent_update': 60,
            'user_command': 75,
            'notification': 40,
            'analytics': 30,
            'historical_data': 20,
            'maintenance': 10
        };
        
        priority = typePriorities[request.type] || priority;
        
        // User priority (VIP users, system agents, etc.)
        if (context.userType === 'vip') priority += 20;
        if (context.userType === 'system') priority += 30;
        if (context.userType === 'premium') priority += 10;
        
        // Time-sensitive requests
        if (request.urgent) priority += 15;
        if (request.realtime) priority += 10;
        
        // Geographic priority (closer users)
        if (context.latency < 50) priority += 5;
        else if (context.latency > 200) priority -= 5;
        
        return Math.max(0, Math.min(100, priority));
    }

    getMinimumPriorityForLevel(degradationLevel) {
        const thresholds = {
            [this.degradationLevels.NORMAL]: 0,
            [this.degradationLevels.LIGHT_LOAD]: 30,
            [this.degradationLevels.MODERATE_LOAD]: 50,
            [this.degradationLevels.HEAVY_LOAD]: 70,
            [this.degradationLevels.CRITICAL_LOAD]: 85,
            [this.degradationLevels.EMERGENCY]: 95
        };
        
        return thresholds[degradationLevel] || 0;
    }

    getMinimumPriorityForCurrentLoad() {
        return this.getMinimumPriorityForLevel(this.currentDegradationLevel);
    }

    queueRequest(request, context, priority) {
        const priorityName = this.getPriorityName(priority);
        const queue = this.priorityQueues.get(priorityName);
        
        if (queue) {
            queue.push({
                request,
                context,
                priority,
                timestamp: Date.now()
            });
            
            return {
                success: true,
                queued: true,
                queuePosition: queue.length,
                estimatedWait: this.estimateQueueWait(priorityName)
            };
        }
        
        return this.createRejectionResponse('Unable to queue request', 503);
    }

    getPriorityName(priority) {
        if (priority >= 90) return 'critical';
        if (priority >= 70) return 'high';
        if (priority >= 50) return 'medium';
        if (priority >= 30) return 'low';
        return 'background';
    }

    estimateQueueWait(priorityName) {
        const queue = this.priorityQueues.get(priorityName);
        if (!queue) return 0;
        
        const processingRate = this.getProcessingRate(priorityName);
        return (queue.length / processingRate) * 1000; // Convert to milliseconds
    }

    getProcessingRate(priorityName) {
        // Estimated requests per second for each priority
        const rates = {
            'critical': 1000,
            'high': 500,
            'medium': 200,
            'low': 100,
            'background': 50
        };
        
        return rates[priorityName] || 100;
    }

    async executeRequest(request, context) {
        // Placeholder for actual request execution
        // In real implementation, this would route to appropriate handlers
        
        const latency = Math.random() * 100 + 10; // Simulate processing time
        await new Promise(resolve => setTimeout(resolve, latency));
        
        return {
            success: true,
            data: `Processed ${request.type}`,
            latency,
            timestamp: Date.now()
        };
    }

    getEndpointFromRequest(request) {
        // Map request types to endpoints for circuit breaker management
        const mapping = {
            'websocket_connect': 'websocket_connect',
            'market_data': 'market_data',
            'market_data_critical': 'market_data',
            'trade_execution': 'trade_execution',
            'agent_update': 'agent_update',
            'user_auth': 'user_auth'
        };
        
        return mapping[request.type] || 'default';
    }

    updateMetrics(endpoint, success, latency) {
        // Update global metrics
        this.loadMetrics.requestsPerSecond++;
        this.loadMetrics.averageLatency = (this.loadMetrics.averageLatency * 0.95) + (latency * 0.05);
        
        if (!success) {
            this.loadMetrics.errorRate++;
        }
        
        // Emit metrics for monitoring
        this.emit('metrics_update', {
            endpoint,
            success,
            latency,
            timestamp: Date.now()
        });
    }

    startMonitoring() {
        // Monitor system resources
        setInterval(() => {
            this.updateSystemMetrics();
        }, 1000);
        
        // Reset per-second counters
        setInterval(() => {
            this.loadMetrics.requestsPerSecond = 0;
            this.loadMetrics.errorRate = 0;
        }, 1000);
        
        // Clean up old data
        setInterval(() => {
            this.cleanupOldData();
        }, 60000);
    }

    updateSystemMetrics() {
        // Simulate system metrics - in production, use actual system monitoring
        this.loadMetrics.cpu = Math.random() * 100;
        this.loadMetrics.memory = Math.random() * 100;
        this.loadMetrics.connections = Array.from(this.connectionLimits.values())
            .reduce((sum, count) => sum + count, 0);
        
        // Update degradation level
        const currentLoad = this.calculateCurrentLoad();
        this.currentDegradationLevel = this.calculateDegradationLevel(currentLoad);
        
        // Emit system metrics
        this.emit('system_metrics', this.loadMetrics);
    }

    startAdaptiveScaling() {
        if (!this.config.adaptiveScaling) return;
        
        setInterval(() => {
            this.adaptLimits();
        }, 5000);
    }

    adaptLimits() {
        const currentLoad = this.calculateCurrentLoad();
        
        // Adapt rate limits based on current load
        if (currentLoad > 0.8) {
            // Reduce limits under high load
            this.requestLimiter.adjustLimit(0.8);
            this.ipLimiter.adjustLimit(0.7);
        } else if (currentLoad < 0.4) {
            // Increase limits under low load
            this.requestLimiter.adjustLimit(1.2);
            this.ipLimiter.adjustLimit(1.3);
        }
        
        // Adapt circuit breaker thresholds
        this.circuitBreakers.forEach(breaker => {
            if (currentLoad > 0.9) {
                breaker.adjustThreshold(0.5); // More sensitive under high load
            } else {
                breaker.adjustThreshold(1.0); // Normal sensitivity
            }
        });
    }

    startDDoSDetection() {
        if (!this.config.ddosProtection) return;
        
        setInterval(() => {
            this.analyzeDDoSPatterns();
        }, 10000);
    }

    analyzeDDoSPatterns() {
        // Analyze suspicious IP patterns
        const now = Date.now();
        const fiveMinutesAgo = now - 300000;
        
        this.ddosDetection.suspiciousIPs.forEach((data, ip) => {
            // Remove old reasons
            data.reasons = data.reasons.filter(r => r.timestamp > fiveMinutesAgo);
            
            // Decay score over time
            const timeSinceFirst = now - data.firstSeen;
            if (timeSinceFirst > 3600000) { // 1 hour
                data.score *= 0.5; // Halve score every hour
            }
            
            // Remove if score is too low
            if (data.score < 1 && data.reasons.length === 0) {
                this.ddosDetection.suspiciousIPs.delete(ip);
            }
        });
    }

    startRequestProcessor() {
        // Process priority queues
        setInterval(() => {
            this.processQueues();
        }, 10);
    }

    processQueues() {
        const currentLoad = this.calculateCurrentLoad();
        if (currentLoad > 0.95) return; // Don't process queues if overloaded
        
        // Process queues in priority order
        const priorityOrder = ['critical', 'high', 'medium', 'low', 'background'];
        
        for (const priority of priorityOrder) {
            const queue = this.priorityQueues.get(priority);
            if (!queue || queue.length === 0) continue;
            
            // Process a few requests from this queue
            const batchSize = this.getBatchSize(priority, currentLoad);
            const batch = queue.splice(0, batchSize);
            
            batch.forEach(async (item) => {
                try {
                    await this.executeRequest(item.request, item.context);
                } catch (error) {
                    console.error(`Queued request processing failed:`, error);
                }
            });
            
            if (batch.length > 0) {
                break; // Process one priority level at a time
            }
        }
    }

    getBatchSize(priority, currentLoad) {
        const baseSizes = {
            'critical': 10,
            'high': 5,
            'medium': 3,
            'low': 2,
            'background': 1
        };
        
        const baseSize = baseSizes[priority] || 1;
        const loadFactor = Math.max(0.1, 1 - currentLoad);
        
        return Math.max(1, Math.floor(baseSize * loadFactor));
    }

    cleanupOldData() {
        const now = Date.now();
        const oneHourAgo = now - 3600000;
        
        // Clean up rate limit data
        this.ddosDetection.rateLimitViolations.forEach((requests, ip) => {
            const recent = requests.filter(timestamp => timestamp > oneHourAgo);
            if (recent.length === 0) {
                this.ddosDetection.rateLimitViolations.delete(ip);
            } else {
                this.ddosDetection.rateLimitViolations.set(ip, recent);
            }
        });
        
        // Clean up pattern analysis
        this.ddosDetection.patternAnalysis.forEach((patterns, key) => {
            const recent = patterns.filter(p => p.timestamp > oneHourAgo);
            if (recent.length === 0) {
                this.ddosDetection.patternAnalysis.delete(key);
            } else {
                this.ddosDetection.patternAnalysis.set(key, recent);
            }
        });
    }

    createRejectionResponse(reason, code) {
        return {
            success: false,
            rejected: true,
            reason,
            code,
            timestamp: Date.now(),
            retryAfter: this.calculateRetryAfter(code)
        };
    }

    calculateRetryAfter(code) {
        // Suggest retry time based on rejection reason
        const retryTimes = {
            429: 1000, // Rate limit - retry in 1 second
            503: 5000, // Service unavailable - retry in 5 seconds
            413: 0,    // Request too large - don't retry
            400: 0     // Bad request - don't retry
        };
        
        return retryTimes[code] || 1000;
    }

    getSystemStatus() {
        return {
            degradationLevel: this.currentDegradationLevel,
            loadMetrics: this.loadMetrics,
            connections: {
                current: this.loadMetrics.connections,
                max: this.config.maxConnections,
                utilization: this.loadMetrics.connections / this.config.maxConnections
            },
            rateLimits: {
                requests: this.requestLimiter.getStatus(),
                ip: this.ipLimiter.getStatus(),
                userAgent: this.userAgentLimiter.getStatus()
            },
            circuitBreakers: Object.fromEntries(
                Array.from(this.circuitBreakers.entries()).map(([name, breaker]) => [
                    name, breaker.getStatus()
                ])
            ),
            queues: Object.fromEntries(
                Array.from(this.priorityQueues.entries()).map(([priority, queue]) => [
                    priority, { length: queue.length }
                ])
            ),
            ddosProtection: {
                suspiciousIPs: this.ddosDetection.suspiciousIPs.size,
                blockedRequests: Array.from(this.ddosDetection.suspiciousIPs.values())
                    .reduce((sum, data) => sum + data.score, 0)
            }
        };
    }

    async shutdown() {
        console.log('Shutting down Overload Protection System');
        
        // Clear all intervals
        clearInterval(this.monitoringInterval);
        clearInterval(this.adaptiveInterval);
        clearInterval(this.ddosInterval);
        clearInterval(this.queueInterval);
        clearInterval(this.cleanupInterval);
        
        // Clear all data structures
        this.connectionLimits.clear();
        this.requestLimits.clear();
        this.ipLimits.clear();
        this.userAgentLimits.clear();
        this.circuitBreakers.clear();
        this.priorityQueues.clear();
        
        this.emit('shutdown');
    }
}

// Rate limiter implementations
class TokenBucketLimiter {
    constructor(config) {
        this.capacity = config.capacity;
        this.tokens = config.capacity;
        this.refillRate = config.refillRate;
        this.lastRefill = Date.now();
        this.name = config.name;
    }

    isAllowed(amount = 1) {
        this.refill();
        if (this.tokens >= amount) {
            this.tokens -= amount;
            return true;
        }
        return false;
    }

    refill() {
        const now = Date.now();
        const timeDelta = (now - this.lastRefill) / 1000;
        const tokensToAdd = timeDelta * this.refillRate;
        
        this.tokens = Math.min(this.capacity, this.tokens + tokensToAdd);
        this.lastRefill = now;
    }

    getStatus() {
        this.refill();
        return {
            tokens: this.tokens,
            capacity: this.capacity,
            utilization: 1 - (this.tokens / this.capacity)
        };
    }
}

class SlidingWindowLimiter {
    constructor(config) {
        this.windowSize = config.windowSize;
        this.maxRequests = config.maxRequests;
        this.requests = [];
        this.name = config.name;
    }

    isAllowed() {
        const now = Date.now();
        
        // Remove old requests outside window
        this.requests = this.requests.filter(timestamp => now - timestamp < this.windowSize);
        
        if (this.requests.length < this.maxRequests) {
            this.requests.push(now);
            return true;
        }
        
        return false;
    }

    adjustLimit(factor) {
        this.maxRequests = Math.floor(this.maxRequests * factor);
    }

    getStatus() {
        const now = Date.now();
        this.requests = this.requests.filter(timestamp => now - timestamp < this.windowSize);
        
        return {
            current: this.requests.length,
            max: this.maxRequests,
            utilization: this.requests.length / this.maxRequests
        };
    }
}

class HierarchicalLimiter {
    constructor(config) {
        this.levels = config.levels;
        this.requests = new Map();
        this.name = config.name;
    }

    isAllowed(key) {
        const now = Date.now();
        
        if (!this.requests.has(key)) {
            this.requests.set(key, []);
        }
        
        const keyRequests = this.requests.get(key);
        
        // Check all levels
        for (const level of this.levels) {
            const windowStart = now - level.window;
            const requestsInWindow = keyRequests.filter(timestamp => timestamp > windowStart);
            
            if (requestsInWindow.length >= level.limit) {
                return false;
            }
        }
        
        // All levels passed, add request
        keyRequests.push(now);
        
        // Cleanup old requests
        const oldestWindow = Math.max(...this.levels.map(l => l.window));
        const cutoff = now - oldestWindow;
        this.requests.set(key, keyRequests.filter(timestamp => timestamp > cutoff));
        
        return true;
    }

    adjustLimit(factor) {
        this.levels.forEach(level => {
            level.limit = Math.floor(level.limit * factor);
        });
    }

    getStatus() {
        return {
            keys: this.requests.size,
            levels: this.levels.length
        };
    }
}

class PatternLimiter {
    constructor(config) {
        this.patterns = config.patterns;
        this.window = config.window;
        this.requests = new Map();
        this.name = config.name;
    }

    isAllowed(userAgent) {
        const now = Date.now();
        
        // Find matching pattern
        const pattern = this.patterns.find(p => p.pattern.test(userAgent));
        if (!pattern) return true;
        
        const key = pattern.pattern.toString();
        
        if (!this.requests.has(key)) {
            this.requests.set(key, []);
        }
        
        const patternRequests = this.requests.get(key);
        const windowStart = now - this.window;
        const requestsInWindow = patternRequests.filter(timestamp => timestamp > windowStart);
        
        if (requestsInWindow.length >= pattern.limit) {
            return false;
        }
        
        patternRequests.push(now);
        this.requests.set(key, patternRequests.filter(timestamp => timestamp > windowStart));
        
        return true;
    }

    getStatus() {
        return {
            patterns: this.patterns.length,
            activeKeys: this.requests.size
        };
    }
}

class CircuitBreaker {
    constructor(config) {
        this.failureThreshold = config.failureThreshold;
        this.timeout = config.timeout;
        this.resetTimeout = config.resetTimeout;
        this.name = config.name;
        
        this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
        this.failureCount = 0;
        this.lastFailureTime = null;
        this.successCount = 0;
    }

    recordSuccess() {
        this.failureCount = 0;
        
        if (this.state === 'HALF_OPEN') {
            this.successCount++;
            if (this.successCount >= 3) { // Require 3 successes to close
                this.state = 'CLOSED';
                this.successCount = 0;
            }
        }
    }

    recordFailure() {
        this.failureCount++;
        this.lastFailureTime = Date.now();
        
        if (this.failureCount >= this.failureThreshold) {
            this.state = 'OPEN';
        }
    }

    canExecute() {
        if (this.state === 'CLOSED') {
            return true;
        }
        
        if (this.state === 'OPEN') {
            if (Date.now() - this.lastFailureTime >= this.resetTimeout) {
                this.state = 'HALF_OPEN';
                this.successCount = 0;
                return true;
            }
            return false;
        }
        
        // HALF_OPEN state
        return true;
    }

    adjustThreshold(factor) {
        this.failureThreshold = Math.max(1, Math.floor(this.failureThreshold * factor));
    }

    getStatus() {
        return {
            state: this.state,
            failureCount: this.failureCount,
            threshold: this.failureThreshold,
            lastFailure: this.lastFailureTime
        };
    }
}

module.exports = OverloadProtectionSystem;
/**
 * Comprehensive Event Recording System
 * Tracks all significant market movements and state changes
 */

const EventEmitter = require('events');
const crypto = require('crypto');

class EventRecordingSystem extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            maxEventsInMemory: config.maxEventsInMemory || 100000,
            compressionEnabled: config.compressionEnabled !== false,
            indexingEnabled: config.indexingEnabled !== false,
            realtimeProcessing: config.realtimeProcessing !== false,
            batchSize: config.batchSize || 1000,
            flushInterval: config.flushInterval || 5000,
            retentionPeriod: config.retentionPeriod || 31536000000, // 1 year
            ...config
        };
        
        // Event storage and processing
        this.eventBuffer = [];
        this.eventIndex = new Map();
        this.eventTypes = new Map();
        this.eventTimeline = [];
        
        // Processing queues
        this.processingQueue = [];
        this.replicationQueue = [];
        this.indexingQueue = [];
        
        // Event categorization
        this.eventCategories = {
            critical: new Set(['system_failure', 'data_corruption', 'security_breach']),
            market: new Set(['trade_executed', 'price_change', 'order_placed', 'order_cancelled']),
            agent: new Set(['agent_registered', 'agent_action', 'agent_decision']),
            economic: new Set(['inflation_change', 'policy_update', 'resource_discovery']),
            system: new Set(['state_update', 'snapshot_taken', 'failover_triggered']),
            user: new Set(['user_login', 'user_action', 'user_preference_change'])
        };
        
        // Metrics and statistics
        this.metrics = {
            totalEvents: 0,
            eventsPerSecond: 0,
            eventsByType: new Map(),
            eventsByCategory: new Map(),
            compressionRatio: 0,
            indexingPerformance: 0,
            storageEfficiency: 0,
            processingLatency: 0
        };
        
        // Performance tracking
        this.performanceTracker = {
            lastSecondEvents: 0,
            averageLatency: 0,
            peakEvents: 0,
            lastFlushTime: Date.now()
        };
        
        this.isInitialized = false;
        this.initialize();
    }
    
    async initialize() {
        try {
            console.log('Initializing Event Recording System...');
            
            // Set up automatic flushing
            this.setupAutoFlush();
            
            // Set up performance monitoring
            this.setupPerformanceMonitoring();
            
            // Set up event processing pipeline
            this.setupEventProcessingPipeline();
            
            // Set up cleanup routines
            this.setupCleanupRoutines();
            
            this.isInitialized = true;
            this.emit('ready');
            
            console.log('Event Recording System initialized');
            
        } catch (error) {
            console.error('Failed to initialize Event Recording System:', error);
            this.emit('error', error);
        }
    }
    
    async recordEvent(event, options = {}) {
        if (!this.isInitialized) {
            throw new Error('Event Recording System not initialized');
        }
        
        const startTime = process.hrtime.bigint();
        
        try {
            // Enrich event with metadata
            const enrichedEvent = await this.enrichEvent(event, options);
            
            // Validate event
            this.validateEvent(enrichedEvent);
            
            // Add to buffer
            this.eventBuffer.push(enrichedEvent);
            
            // Update metrics
            this.updateEventMetrics(enrichedEvent);
            
            // Real-time processing if enabled
            if (this.config.realtimeProcessing) {
                await this.processEventRealtime(enrichedEvent);
            }
            
            // Immediate flush for critical events
            if (this.isCriticalEvent(enrichedEvent)) {
                await this.flushEvents();
            }
            
            // Auto-flush if buffer is full
            if (this.eventBuffer.length >= this.config.batchSize) {
                setImmediate(() => this.flushEvents());
            }
            
            // Calculate processing latency
            const endTime = process.hrtime.bigint();
            const latency = Number(endTime - startTime) / 1000000; // Convert to milliseconds
            this.updateLatencyMetrics(latency);
            
            return enrichedEvent.id;
            
        } catch (error) {
            console.error('Failed to record event:', error);
            throw error;
        }
    }
    
    async enrichEvent(event, options) {
        const eventId = crypto.randomBytes(16).toString('hex');\n        const timestamp = Date.now();\n        \n        const enrichedEvent = {\n            id: eventId,\n            timestamp,\n            originalTimestamp: event.timestamp || timestamp,\n            type: event.type,\n            category: this.categorizeEvent(event.type),\n            priority: this.determinePriority(event),\n            data: event.data || {},\n            metadata: {\n                source: event.source || 'unknown',\n                version: '1.0',\n                schema: event.schema || 'default',\n                correlation: event.correlation || null,\n                causation: event.causation || null,\n                ...event.metadata\n            },\n            context: {\n                nodeId: options.nodeId || 'unknown',\n                sessionId: options.sessionId || null,\n                userId: options.userId || null,\n                traceId: options.traceId || this.generateTraceId(),\n                ...event.context\n            },\n            checksum: '',\n            compressed: false\n        };\n        \n        // Calculate checksum\n        enrichedEvent.checksum = this.calculateEventChecksum(enrichedEvent);\n        \n        return enrichedEvent;\n    }\n    \n    validateEvent(event) {\n        if (!event.type) {\n            throw new Error('Event type is required');\n        }\n        \n        if (!event.timestamp) {\n            throw new Error('Event timestamp is required');\n        }\n        \n        if (typeof event.data !== 'object') {\n            throw new Error('Event data must be an object');\n        }\n        \n        // Additional validation based on event type\n        this.validateEventByType(event);\n    }\n    \n    validateEventByType(event) {\n        const validators = {\n            'trade_executed': (e) => {\n                if (!e.data.symbol || !e.data.quantity || !e.data.price) {\n                    throw new Error('Trade event missing required fields');\n                }\n            },\n            'price_change': (e) => {\n                if (!e.data.symbol || typeof e.data.change !== 'number') {\n                    throw new Error('Price change event missing required fields');\n                }\n            },\n            'agent_action': (e) => {\n                if (!e.data.agentId || !e.data.action) {\n                    throw new Error('Agent action event missing required fields');\n                }\n            }\n        };\n        \n        const validator = validators[event.type];\n        if (validator) {\n            validator(event);\n        }\n    }\n    \n    categorizeEvent(eventType) {\n        for (const [category, types] of Object.entries(this.eventCategories)) {\n            if (types.has(eventType)) {\n                return category;\n            }\n        }\n        return 'other';\n    }\n    \n    determinePriority(event) {\n        // Determine event priority based on type and content\n        if (this.eventCategories.critical.has(event.type)) {\n            return 'critical';\n        }\n        \n        if (event.data?.urgent || event.priority === 'high') {\n            return 'high';\n        }\n        \n        if (this.eventCategories.market.has(event.type)) {\n            return 'medium';\n        }\n        \n        return 'low';\n    }\n    \n    isCriticalEvent(event) {\n        return event.priority === 'critical' || \n               event.category === 'critical' ||\n               event.data?.immediate === true;\n    }\n    \n    generateTraceId() {\n        return crypto.randomBytes(8).toString('hex');\n    }\n    \n    calculateEventChecksum(event) {\n        const checksumData = {\n            type: event.type,\n            timestamp: event.timestamp,\n            data: event.data\n        };\n        \n        return crypto.createHash('sha256')\n            .update(JSON.stringify(checksumData))\n            .digest('hex')\n            .substring(0, 16);\n    }\n    \n    async processEventRealtime(event) {\n        try {\n            // Real-time event processing\n            await this.updateEventIndex(event);\n            await this.triggerEventHandlers(event);\n            await this.updateEventTimeline(event);\n            \n        } catch (error) {\n            console.error('Real-time event processing failed:', error);\n        }\n    }\n    \n    async updateEventIndex(event) {\n        if (!this.config.indexingEnabled) return;\n        \n        const startTime = Date.now();\n        \n        try {\n            // Type-based index\n            if (!this.eventIndex.has(event.type)) {\n                this.eventIndex.set(event.type, []);\n            }\n            this.eventIndex.get(event.type).push(event.id);\n            \n            // Time-based index (hourly buckets)\n            const hourBucket = Math.floor(event.timestamp / 3600000);\n            const timeKey = `time:${hourBucket}`;\n            if (!this.eventIndex.has(timeKey)) {\n                this.eventIndex.set(timeKey, []);\n            }\n            this.eventIndex.get(timeKey).push(event.id);\n            \n            // Entity-based index (if applicable)\n            if (event.data.entityId) {\n                const entityKey = `entity:${event.data.entityId}`;\n                if (!this.eventIndex.has(entityKey)) {\n                    this.eventIndex.set(entityKey, []);\n                }\n                this.eventIndex.get(entityKey).push(event.id);\n            }\n            \n            // Update indexing performance metrics\n            const indexTime = Date.now() - startTime;\n            this.metrics.indexingPerformance = \n                (this.metrics.indexingPerformance * 0.9) + (indexTime * 0.1);\n                \n        } catch (error) {\n            console.error('Event indexing failed:', error);\n        }\n    }\n    \n    async triggerEventHandlers(event) {\n        // Emit event for real-time subscribers\n        this.emit('event', event);\n        this.emit(`event:${event.type}`, event);\n        this.emit(`event:${event.category}`, event);\n        \n        // Trigger specific handlers based on event type\n        const handlers = {\n            'system_failure': this.handleSystemFailure.bind(this),\n            'trade_executed': this.handleTradeExecution.bind(this),\n            'price_change': this.handlePriceChange.bind(this),\n            'agent_action': this.handleAgentAction.bind(this)\n        };\n        \n        const handler = handlers[event.type];\n        if (handler) {\n            try {\n                await handler(event);\n            } catch (error) {\n                console.error(`Event handler failed for ${event.type}:`, error);\n            }\n        }\n    }\n    \n    async updateEventTimeline(event) {\n        // Add to timeline (keeping it sorted and limited)\n        this.eventTimeline.push({\n            id: event.id,\n            timestamp: event.timestamp,\n            type: event.type,\n            category: event.category,\n            priority: event.priority\n        });\n        \n        // Sort by timestamp (most recent first)\n        this.eventTimeline.sort((a, b) => b.timestamp - a.timestamp);\n        \n        // Limit timeline size\n        if (this.eventTimeline.length > 10000) {\n            this.eventTimeline = this.eventTimeline.slice(0, 10000);\n        }\n    }\n    \n    async flushEvents() {\n        if (this.eventBuffer.length === 0) return;\n        \n        const events = [...this.eventBuffer];\n        this.eventBuffer = [];\n        \n        try {\n            // Compress events if enabled\n            let eventData = events;\n            if (this.config.compressionEnabled) {\n                eventData = await this.compressEvents(events);\n            }\n            \n            // Store events (would integrate with persistence layer)\n            await this.storeEvents(eventData, events);\n            \n            // Update storage metrics\n            this.updateStorageMetrics(events, eventData);\n            \n            console.log(`Flushed ${events.length} events`);\n            \n        } catch (error) {\n            console.error('Event flush failed:', error);\n            // Re-add events to buffer for retry\n            this.eventBuffer.unshift(...events);\n            throw error;\n        }\n    }\n    \n    async compressEvents(events) {\n        const zlib = require('zlib');\n        const jsonString = JSON.stringify(events);\n        \n        return new Promise((resolve, reject) => {\n            zlib.gzip(jsonString, (error, compressed) => {\n                if (error) {\n                    reject(error);\n                } else {\n                    resolve(compressed.toString('base64'));\n                }\n            });\n        });\n    }\n    \n    async storeEvents(eventData, originalEvents) {\n        // This would integrate with the persistence layer\n        // For now, we'll simulate storage\n        const batchId = crypto.randomBytes(8).toString('hex');\n        \n        console.log(`Storing event batch ${batchId} with ${originalEvents.length} events`);\n        \n        // Simulate storage delay\n        await new Promise(resolve => setTimeout(resolve, 10));\n        \n        return batchId;\n    }\n    \n    updateEventMetrics(event) {\n        this.metrics.totalEvents++;\n        \n        // Update type-based metrics\n        const typeCount = this.metrics.eventsByType.get(event.type) || 0;\n        this.metrics.eventsByType.set(event.type, typeCount + 1);\n        \n        // Update category-based metrics\n        const categoryCount = this.metrics.eventsByCategory.get(event.category) || 0;\n        this.metrics.eventsByCategory.set(event.category, categoryCount + 1);\n        \n        // Update events per second counter\n        this.performanceTracker.lastSecondEvents++;\n    }\n    \n    updateLatencyMetrics(latency) {\n        this.performanceTracker.averageLatency = \n            (this.performanceTracker.averageLatency * 0.9) + (latency * 0.1);\n        \n        this.metrics.processingLatency = this.performanceTracker.averageLatency;\n    }\n    \n    updateStorageMetrics(originalEvents, compressedData) {\n        if (this.config.compressionEnabled && typeof compressedData === 'string') {\n            const originalSize = JSON.stringify(originalEvents).length;\n            const compressedSize = compressedData.length;\n            \n            this.metrics.compressionRatio = \n                (1 - compressedSize / originalSize) * 100;\n        }\n        \n        this.metrics.storageEfficiency = \n            (this.metrics.storageEfficiency * 0.9) + \n            (this.eventBuffer.length < this.config.maxEventsInMemory ? 1 : 0) * 0.1;\n    }\n    \n    setupAutoFlush() {\n        setInterval(async () => {\n            try {\n                await this.flushEvents();\n            } catch (error) {\n                console.error('Auto-flush failed:', error);\n            }\n        }, this.config.flushInterval);\n    }\n    \n    setupPerformanceMonitoring() {\n        setInterval(() => {\n            // Update events per second\n            this.metrics.eventsPerSecond = this.performanceTracker.lastSecondEvents;\n            \n            // Track peak events\n            if (this.performanceTracker.lastSecondEvents > this.performanceTracker.peakEvents) {\n                this.performanceTracker.peakEvents = this.performanceTracker.lastSecondEvents;\n            }\n            \n            // Reset counter\n            this.performanceTracker.lastSecondEvents = 0;\n            \n            // Emit performance metrics\n            this.emit('performance_metrics', this.getMetrics());\n            \n        }, 1000);\n    }\n    \n    setupEventProcessingPipeline() {\n        // Set up background processing for non-critical events\n        setInterval(async () => {\n            await this.processBackgroundQueue();\n        }, 5000);\n    }\n    \n    setupCleanupRoutines() {\n        // Clean up old events from memory\n        setInterval(() => {\n            this.cleanupOldEvents();\n        }, 300000); // Every 5 minutes\n    }\n    \n    async processBackgroundQueue() {\n        // Process any queued background tasks\n        if (this.processingQueue.length > 0) {\n            const tasks = this.processingQueue.splice(0, 100);\n            for (const task of tasks) {\n                try {\n                    await task();\n                } catch (error) {\n                    console.error('Background task failed:', error);\n                }\n            }\n        }\n    }\n    \n    cleanupOldEvents() {\n        const cutoffTime = Date.now() - this.config.retentionPeriod;\n        \n        // Clean up timeline\n        this.eventTimeline = this.eventTimeline.filter(\n            event => event.timestamp > cutoffTime\n        );\n        \n        // Clean up indexes (simplified)\n        for (const [key, events] of this.eventIndex) {\n            if (key.startsWith('time:')) {\n                const hourBucket = parseInt(key.replace('time:', ''));\n                const bucketTime = hourBucket * 3600000;\n                \n                if (bucketTime < cutoffTime) {\n                    this.eventIndex.delete(key);\n                }\n            }\n        }\n    }\n    \n    // Event handler implementations\n    async handleSystemFailure(event) {\n        console.error('CRITICAL: System failure detected:', event.data);\n        this.emit('critical_alert', event);\n    }\n    \n    async handleTradeExecution(event) {\n        // Handle trade execution events\n        this.emit('trade_executed', event);\n    }\n    \n    async handlePriceChange(event) {\n        // Handle price change events\n        this.emit('price_changed', event);\n    }\n    \n    async handleAgentAction(event) {\n        // Handle agent action events\n        this.emit('agent_activity', event);\n    }\n    \n    // Query methods\n    async queryEvents(criteria) {\n        // Query events based on various criteria\n        const results = [];\n        \n        if (criteria.type) {\n            const typeEvents = this.eventIndex.get(criteria.type) || [];\n            results.push(...typeEvents);\n        }\n        \n        if (criteria.timeRange) {\n            const { start, end } = criteria.timeRange;\n            const timelineResults = this.eventTimeline.filter(\n                event => event.timestamp >= start && event.timestamp <= end\n            );\n            results.push(...timelineResults.map(e => e.id));\n        }\n        \n        if (criteria.entityId) {\n            const entityEvents = this.eventIndex.get(`entity:${criteria.entityId}`) || [];\n            results.push(...entityEvents);\n        }\n        \n        // Remove duplicates and return\n        return [...new Set(results)];\n    }\n    \n    getEventStats() {\n        return {\n            totalEvents: this.metrics.totalEvents,\n            eventTypes: Object.fromEntries(this.metrics.eventsByType),\n            eventCategories: Object.fromEntries(this.metrics.eventsByCategory),\n            bufferSize: this.eventBuffer.length,\n            timelineSize: this.eventTimeline.length,\n            indexSize: this.eventIndex.size\n        };\n    }\n    \n    getMetrics() {\n        return {\n            ...this.metrics,\n            performance: {\n                ...this.performanceTracker,\n                bufferSize: this.eventBuffer.length,\n                timelineSize: this.eventTimeline.length\n            },\n            system: {\n                memoryUsage: process.memoryUsage(),\n                uptime: process.uptime()\n            }\n        };\n    }\n    \n    async shutdown() {\n        console.log('Shutting down Event Recording System...');\n        \n        // Flush remaining events\n        await this.flushEvents();\n        \n        // Clear buffers\n        this.eventBuffer = [];\n        this.eventTimeline = [];\n        this.eventIndex.clear();\n        \n        console.log('Event Recording System shutdown complete');\n    }\n}\n\nmodule.exports = EventRecordingSystem;
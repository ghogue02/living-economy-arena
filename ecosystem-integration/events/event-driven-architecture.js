/**
 * Event-Driven Architecture System - Phase 4 Ecosystem Integration
 * Manages real-time event streaming, correlation, and distributed event handling
 */

const EventEmitter = require('events');
const { Readable, Transform, Writable } = require('stream');

class EventDrivenArchitecture extends EventEmitter {
    constructor(config = {}) {
        super();
        this.config = {
            maxEventHistory: config.maxEventHistory || 100000,
            retentionPeriod: config.retentionPeriod || 7 * 24 * 60 * 60 * 1000, // 7 days
            enableEventSourcing: config.enableEventSourcing !== false,
            enableEventReplay: config.enableEventReplay !== false,
            enableCorrelation: config.enableCorrelation !== false,
            batchSize: config.batchSize || 100,
            flushInterval: config.flushInterval || 1000,
            ...config
        };
        
        this.eventStore = new Map();
        this.eventStreams = new Map();
        this.subscribers = new Map();
        this.correlationRules = new Map();
        this.eventHistory = [];
        this.aggregates = new Map();
        this.snapshots = new Map();
        
        this.statistics = {
            totalEvents: 0,
            eventsProcessed: 0,
            activeStreams: 0,
            activeSubscribers: 0,
            correlatedEvents: 0,
            replayedEvents: 0
        };
        
        this.setupEventTypes();
        this.setupCorrelationRules();
        this.startEventProcessing();
    }

    setupEventTypes() {
        // Define standard event schemas
        this.eventSchemas = {
            'agent.action': {
                required: ['agentId', 'action', 'timestamp'],
                properties: {
                    agentId: 'string',
                    action: 'string',
                    parameters: 'object',
                    result: 'object'
                }
            },
            'market.trade': {
                required: ['symbol', 'price', 'volume', 'timestamp'],
                properties: {
                    symbol: 'string',
                    price: 'number',
                    volume: 'number',
                    participants: 'array'
                }
            },
            'system.state_change': {
                required: ['system', 'previousState', 'newState', 'timestamp'],
                properties: {
                    system: 'string',
                    previousState: 'object',
                    newState: 'object',
                    changeReason: 'string'
                }
            },
            'economic.transaction': {
                required: ['transactionId', 'amount', 'currency', 'timestamp'],
                properties: {
                    transactionId: 'string',
                    amount: 'number',
                    currency: 'string',
                    from: 'string',
                    to: 'string'
                }
            },
            'player.interaction': {
                required: ['playerId', 'interactionType', 'timestamp'],
                properties: {
                    playerId: 'string',
                    interactionType: 'string',
                    target: 'string',
                    outcome: 'object'
                }
            }
        };
    }

    setupCorrelationRules() {
        // Agent behavior correlation
        this.addCorrelationRule('agent_behavior_sequence', {
            pattern: ['agent.action', 'agent.action'],
            condition: (events) => {
                return events[0].agentId === events[1].agentId &&
                       events[1].timestamp - events[0].timestamp < 60000; // Within 1 minute
            },
            action: (events) => {
                this.emitCorrelatedEvent('agent.behavior_sequence', {
                    agentId: events[0].agentId,
                    actions: events.map(e => e.action),
                    duration: events[events.length - 1].timestamp - events[0].timestamp,
                    correlationId: this.generateCorrelationId()
                });
            }
        });

        // Market cascade correlation
        this.addCorrelationRule('market_cascade', {
            pattern: ['market.trade', 'market.trade', 'market.trade'],
            condition: (events) => {
                // Detect rapid succession of trades
                const priceChanges = events.map((e, i) => 
                    i > 0 ? (e.price - events[i-1].price) / events[i-1].price : 0
                );
                return Math.abs(priceChanges.reduce((a, b) => a + b, 0)) > 0.05; // 5% total change
            },
            action: (events) => {
                this.emitCorrelatedEvent('market.cascade_detected', {
                    symbol: events[0].symbol,
                    trades: events.length,
                    priceChange: events[events.length - 1].price - events[0].price,
                    volume: events.reduce((sum, e) => sum + e.volume, 0),
                    correlationId: this.generateCorrelationId()
                });
            }
        });

        // Economic crisis correlation
        this.addCorrelationRule('economic_crisis', {
            pattern: ['economic.transaction', 'market.trade', 'agent.action'],
            condition: (events) => {
                // Multiple large transactions + market activity + agent responses
                const largeTransactions = events.filter(e => 
                    e.type === 'economic.transaction' && e.amount > 1000000
                ).length;
                return largeTransactions >= 5;
            },
            action: (events) => {
                this.emitCorrelatedEvent('economic.crisis_indicators', {
                    triggerEvents: events.length,
                    largeTransactions: events.filter(e => e.type === 'economic.transaction').length,
                    marketActivity: events.filter(e => e.type === 'market.trade').length,
                    agentResponses: events.filter(e => e.type === 'agent.action').length,
                    correlationId: this.generateCorrelationId()
                });
            }
        });
    }

    async publishEvent(eventType, payload, metadata = {}) {
        const event = {
            id: this.generateEventId(),
            type: eventType,
            payload,
            metadata: {
                ...metadata,
                publishedAt: new Date().toISOString(),
                source: metadata.source || 'unknown',
                version: '1.0'
            },
            timestamp: Date.now()
        };

        // Validate event schema
        if (this.eventSchemas[eventType]) {
            this.validateEvent(event, this.eventSchemas[eventType]);
        }

        // Store event if event sourcing is enabled
        if (this.config.enableEventSourcing) {
            this.storeEvent(event);
        }

        // Add to processing queue
        this.eventHistory.push(event);
        this.statistics.totalEvents++;

        // Notify subscribers
        await this.notifySubscribers(event);

        // Check for correlations
        if (this.config.enableCorrelation) {
            this.checkCorrelations(event);
        }

        // Emit to internal listeners
        this.emit('event_published', event);

        return event;
    }

    subscribe(eventType, handler, options = {}) {
        const subscriptionId = this.generateSubscriptionId();
        const subscription = {
            id: subscriptionId,
            eventType,
            handler,
            options: {
                filter: options.filter,
                batchSize: options.batchSize || 1,
                ...options
            },
            createdAt: new Date().toISOString(),
            lastProcessed: null,
            processed: 0,
            errors: 0
        };

        if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, new Map());
        }
        
        this.subscribers.get(eventType).set(subscriptionId, subscription);
        this.statistics.activeSubscribers++;

        this.emit('subscription_created', { subscriptionId, eventType });

        return subscriptionId;
    }

    unsubscribe(subscriptionId) {
        for (const [eventType, subscribers] of this.subscribers) {
            if (subscribers.has(subscriptionId)) {
                subscribers.delete(subscriptionId);
                this.statistics.activeSubscribers--;
                if (subscribers.size === 0) {
                    this.subscribers.delete(eventType);
                }
                this.emit('subscription_removed', { subscriptionId, eventType });
                return true;
            }
        }
        return false;
    }

    async notifySubscribers(event) {
        const subscribers = this.subscribers.get(event.type) || new Map();
        const notifications = [];

        for (const [subscriptionId, subscription] of subscribers) {
            try {
                // Apply filter if specified
                if (subscription.options.filter && 
                    !subscription.options.filter(event)) {
                    continue;
                }

                // Handle batching
                if (subscription.options.batchSize > 1) {
                    if (!subscription.batch) {
                        subscription.batch = [];
                    }
                    subscription.batch.push(event);
                    
                    if (subscription.batch.length >= subscription.options.batchSize) {
                        notifications.push(
                            this.processSubscription(subscription, subscription.batch)
                        );
                        subscription.batch = [];
                    }
                } else {
                    notifications.push(
                        this.processSubscription(subscription, event)
                    );
                }
            } catch (error) {
                subscription.errors++;
                this.emit('subscription_error', {
                    subscriptionId,
                    error: error.message,
                    event
                });
            }
        }

        await Promise.allSettled(notifications);
    }

    async processSubscription(subscription, eventOrEvents) {
        try {
            await subscription.handler(eventOrEvents);
            subscription.processed++;
            subscription.lastProcessed = new Date().toISOString();
            this.statistics.eventsProcessed++;
        } catch (error) {
            subscription.errors++;
            throw error;
        }
    }

    createEventStream(eventType, options = {}) {
        const streamId = this.generateStreamId();
        const stream = new EventStream(eventType, options, this);
        
        this.eventStreams.set(streamId, stream);
        this.statistics.activeStreams++;
        
        this.emit('stream_created', { streamId, eventType });
        
        return stream;
    }

    storeEvent(event) {
        // Store in event store
        const aggregateId = event.metadata.aggregateId || 'global';
        if (!this.eventStore.has(aggregateId)) {
            this.eventStore.set(aggregateId, []);
        }
        
        this.eventStore.get(aggregateId).push(event);
        
        // Maintain history size
        if (this.eventHistory.length > this.config.maxEventHistory) {
            this.eventHistory = this.eventHistory.slice(-this.config.maxEventHistory);
        }
        
        // Clean up old events
        this.cleanupOldEvents();
    }

    cleanupOldEvents() {
        const cutoff = Date.now() - this.config.retentionPeriod;
        
        for (const [aggregateId, events] of this.eventStore) {
            const filteredEvents = events.filter(event => event.timestamp > cutoff);
            if (filteredEvents.length !== events.length) {
                this.eventStore.set(aggregateId, filteredEvents);
            }
        }
        
        this.eventHistory = this.eventHistory.filter(event => event.timestamp > cutoff);
    }

    async replayEvents(aggregateId, fromTimestamp = 0, toTimestamp = Date.now()) {
        if (!this.config.enableEventReplay) {
            throw new Error('Event replay is disabled');
        }
        
        const events = this.eventStore.get(aggregateId) || [];
        const filteredEvents = events.filter(event => 
            event.timestamp >= fromTimestamp && event.timestamp <= toTimestamp
        );
        
        this.statistics.replayedEvents += filteredEvents.length;
        
        for (const event of filteredEvents) {
            await this.notifySubscribers({
                ...event,
                metadata: {
                    ...event.metadata,
                    replayed: true,
                    originalTimestamp: event.timestamp,
                    replayTimestamp: Date.now()
                }
            });
        }
        
        this.emit('events_replayed', {
            aggregateId,
            count: filteredEvents.length,
            fromTimestamp,
            toTimestamp
        });
        
        return filteredEvents;
    }

    addCorrelationRule(name, rule) {
        this.correlationRules.set(name, {
            ...rule,
            id: name,
            matches: 0,
            lastMatch: null
        });
    }

    checkCorrelations(newEvent) {
        for (const [ruleName, rule] of this.correlationRules) {
            try {
                const recentEvents = this.getRecentEvents(rule.pattern.length * 10);
                const matchingSequences = this.findEventSequences(recentEvents, rule.pattern);
                
                for (const sequence of matchingSequences) {
                    if (rule.condition(sequence)) {
                        rule.matches++;
                        rule.lastMatch = new Date().toISOString();
                        this.statistics.correlatedEvents++;
                        
                        await rule.action(sequence);
                        
                        this.emit('correlation_detected', {
                            rule: ruleName,
                            events: sequence.length,
                            correlationId: this.generateCorrelationId()
                        });
                    }
                }
            } catch (error) {
                this.emit('correlation_error', {
                    rule: ruleName,
                    error: error.message
                });
            }
        }
    }

    findEventSequences(events, pattern) {
        const sequences = [];
        const patternLength = pattern.length;
        
        for (let i = 0; i <= events.length - patternLength; i++) {
            const sequence = [];
            let patternIndex = 0;
            
            for (let j = i; j < events.length && patternIndex < patternLength; j++) {
                if (events[j].type === pattern[patternIndex]) {
                    sequence.push(events[j]);
                    patternIndex++;
                }
            }
            
            if (sequence.length === patternLength) {
                sequences.push(sequence);
            }
        }
        
        return sequences;
    }

    emitCorrelatedEvent(eventType, payload) {
        return this.publishEvent(eventType, payload, {
            source: 'event-correlation',
            correlatedEvent: true
        });
    }

    getRecentEvents(count = 100) {
        return this.eventHistory.slice(-count);
    }

    getEventsByType(eventType, limit = 100) {
        return this.eventHistory
            .filter(event => event.type === eventType)
            .slice(-limit);
    }

    getEventsByTimeRange(startTime, endTime) {
        return this.eventHistory.filter(event => 
            event.timestamp >= startTime && event.timestamp <= endTime
        );
    }

    getAggregateEvents(aggregateId) {
        return this.eventStore.get(aggregateId) || [];
    }

    createSnapshot(aggregateId, state) {
        this.snapshots.set(aggregateId, {
            aggregateId,
            state,
            timestamp: Date.now(),
            eventCount: (this.eventStore.get(aggregateId) || []).length
        });
    }

    getSnapshot(aggregateId) {
        return this.snapshots.get(aggregateId);
    }

    validateEvent(event, schema) {
        for (const field of schema.required) {
            if (!(field in event.payload)) {
                throw new Error(`Required field '${field}' missing in event payload`);
            }
        }
        
        for (const [field, type] of Object.entries(schema.properties)) {
            if (field in event.payload) {
                const value = event.payload[field];
                if (typeof value !== type && type !== 'array' && type !== 'object') {
                    throw new Error(`Field '${field}' should be of type ${type}`);
                }
            }
        }
    }

    startEventProcessing() {
        // Batch processing of events
        setInterval(() => {
            this.processBatchedSubscriptions();
        }, this.config.flushInterval);
        
        // Statistics reporting
        setInterval(() => {
            this.emit('statistics_report', this.getStatistics());
        }, 60000); // Every minute
    }

    processBatchedSubscriptions() {
        for (const [eventType, subscribers] of this.subscribers) {
            for (const [subscriptionId, subscription] of subscribers) {
                if (subscription.batch && subscription.batch.length > 0) {
                    this.processSubscription(subscription, subscription.batch)
                        .catch(error => {
                            this.emit('subscription_error', {
                                subscriptionId,
                                error: error.message
                            });
                        });
                    subscription.batch = [];
                }
            }
        }
    }

    generateEventId() {
        return 'evt_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
    }

    generateSubscriptionId() {
        return 'sub_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
    }

    generateStreamId() {
        return 'str_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
    }

    generateCorrelationId() {
        return 'cor_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
    }

    getStatistics() {
        return {
            ...this.statistics,
            eventStoreSize: Array.from(this.eventStore.values()).reduce((sum, events) => sum + events.length, 0),
            correlationRules: this.correlationRules.size,
            snapshotsCount: this.snapshots.size,
            memoryUsage: {
                eventHistory: this.eventHistory.length,
                eventStore: this.eventStore.size,
                subscribers: this.statistics.activeSubscribers,
                streams: this.statistics.activeStreams
            }
        };
    }

    getSubscriptionStats() {
        const stats = [];
        for (const [eventType, subscribers] of this.subscribers) {
            for (const [subscriptionId, subscription] of subscribers) {
                stats.push({
                    id: subscriptionId,
                    eventType,
                    processed: subscription.processed,
                    errors: subscription.errors,
                    lastProcessed: subscription.lastProcessed
                });
            }
        }
        return stats;
    }

    getCorrelationStats() {
        return Array.from(this.correlationRules.entries()).map(([name, rule]) => ({
            name,
            matches: rule.matches,
            lastMatch: rule.lastMatch,
            pattern: rule.pattern
        }));
    }
}

// Event Stream class for real-time event streaming
class EventStream extends Readable {
    constructor(eventType, options, eventSystem) {
        super({ objectMode: true, ...options });
        this.eventType = eventType;
        this.eventSystem = eventSystem;
        this.buffer = [];
        this.subscriptionId = null;
        
        this.setupSubscription();
    }
    
    setupSubscription() {
        this.subscriptionId = this.eventSystem.subscribe(
            this.eventType,
            (event) => {
                this.buffer.push(event);
                this.processBuffer();
            }
        );
    }
    
    processBuffer() {
        while (this.buffer.length > 0) {
            const canPush = this.push(this.buffer.shift());
            if (!canPush) break;
        }
    }
    
    _read() {
        this.processBuffer();
    }
    
    _destroy(error, callback) {
        if (this.subscriptionId) {
            this.eventSystem.unsubscribe(this.subscriptionId);
        }
        callback(error);
    }
}

module.exports = { EventDrivenArchitecture, EventStream };
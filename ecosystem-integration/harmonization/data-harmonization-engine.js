/**
 * Cross-Platform Data Harmonization Engine - Phase 4 Ecosystem Integration
 * Standardizes data formats and ensures consistency across all systems
 */

const EventEmitter = require('events');
const Joi = require('joi');
const { Transform } = require('stream');

class DataHarmonizationEngine extends EventEmitter {
    constructor(config = {}) {
        super();
        this.config = {
            enableValidation: config.enableValidation !== false,
            enableTransformation: config.enableTransformation !== false,
            enableCaching: config.enableCaching !== false,
            cacheSize: config.cacheSize || 10000,
            ...config
        };
        
        this.schemas = new Map();
        this.transformers = new Map();
        this.validators = new Map();
        this.cache = new Map();
        this.statistics = {
            transformations: 0,
            validations: 0,
            cacheHits: 0,
            cacheMisses: 0,
            errors: 0
        };
        
        this.setupStandardSchemas();
        this.setupStandardTransformers();
    }

    setupStandardSchemas() {
        // Agent Schema
        this.registerSchema('agent', Joi.object({
            id: Joi.string().required(),
            type: Joi.string().valid('player', 'ai', 'system').required(),
            personality: Joi.object({
                traits: Joi.object(),
                behaviors: Joi.array(),
                emotions: Joi.object()
            }),
            position: Joi.object({
                x: Joi.number(),
                y: Joi.number(),
                z: Joi.number().optional()
            }),
            status: Joi.string().valid('active', 'inactive', 'suspended'),
            metadata: Joi.object(),
            timestamp: Joi.date().iso()
        }));

        // Economic Data Schema
        this.registerSchema('economic', Joi.object({
            id: Joi.string().required(),
            type: Joi.string().valid('transaction', 'price', 'volume', 'indicator').required(),
            amount: Joi.number().when('type', {
                is: Joi.valid('transaction', 'price', 'volume'),
                then: Joi.required()
            }),
            currency: Joi.string().length(3).uppercase(),
            participants: Joi.array().items(Joi.string()),
            market: Joi.string(),
            timestamp: Joi.date().iso().required(),
            metadata: Joi.object()
        }));

        // Event Schema
        this.registerSchema('event', Joi.object({
            id: Joi.string().required(),
            type: Joi.string().required(),
            source: Joi.string().required(),
            target: Joi.string().optional(),
            payload: Joi.object().required(),
            priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
            timestamp: Joi.date().iso().required(),
            correlationId: Joi.string().optional(),
            metadata: Joi.object()
        }));

        // Market Data Schema
        this.registerSchema('market', Joi.object({
            id: Joi.string().required(),
            symbol: Joi.string().required(),
            price: Joi.number().positive().required(),
            volume: Joi.number().min(0).required(),
            bid: Joi.number().positive(),
            ask: Joi.number().positive(),
            spread: Joi.number().min(0),
            volatility: Joi.number().min(0),
            timestamp: Joi.date().iso().required(),
            exchange: Joi.string(),
            metadata: Joi.object()
        }));

        // Player Action Schema
        this.registerSchema('player_action', Joi.object({
            id: Joi.string().required(),
            playerId: Joi.string().required(),
            action: Joi.string().required(),
            parameters: Joi.object(),
            result: Joi.object(),
            success: Joi.boolean().required(),
            timestamp: Joi.date().iso().required(),
            context: Joi.object(),
            metadata: Joi.object()
        }));
    }

    setupStandardTransformers() {
        // Agent data transformer
        this.registerTransformer('agent', 'standard', (data) => {
            return {
                id: data.id || data.agentId || data.agent_id,
                type: data.type || 'ai',
                personality: {
                    traits: data.personality?.traits || data.traits || {},
                    behaviors: data.personality?.behaviors || data.behaviors || [],
                    emotions: data.personality?.emotions || data.emotions || {}
                },
                position: {
                    x: data.position?.x || data.x || 0,
                    y: data.position?.y || data.y || 0,
                    z: data.position?.z || data.z
                },
                status: data.status || 'active',
                metadata: data.metadata || {},
                timestamp: new Date(data.timestamp || Date.now()).toISOString()
            };
        });

        // Economic data transformer
        this.registerTransformer('economic', 'standard', (data) => {
            return {
                id: data.id || data.transactionId || data.transaction_id,
                type: data.type || 'transaction',
                amount: Number(data.amount || data.value || 0),
                currency: (data.currency || 'USD').toUpperCase(),
                participants: Array.isArray(data.participants) ? data.participants : 
                           data.from && data.to ? [data.from, data.to] : [],
                market: data.market || data.exchange || 'default',
                timestamp: new Date(data.timestamp || Date.now()).toISOString(),
                metadata: data.metadata || {}
            };
        });

        // Event data transformer
        this.registerTransformer('event', 'standard', (data) => {
            return {
                id: data.id || data.eventId || this.generateId(),
                type: data.type || data.eventType || 'generic',
                source: data.source || data.from || 'unknown',
                target: data.target || data.to,
                payload: data.payload || data.data || {},
                priority: data.priority || 'medium',
                timestamp: new Date(data.timestamp || Date.now()).toISOString(),
                correlationId: data.correlationId || data.correlation_id,
                metadata: data.metadata || {}
            };
        });

        // Market data transformer
        this.registerTransformer('market', 'standard', (data) => {
            return {
                id: data.id || data.symbol + '_' + Date.now(),
                symbol: data.symbol || data.ticker,
                price: Number(data.price || data.last || 0),
                volume: Number(data.volume || 0),
                bid: Number(data.bid),
                ask: Number(data.ask),
                spread: data.spread || (data.ask - data.bid),
                volatility: Number(data.volatility || 0),
                timestamp: new Date(data.timestamp || Date.now()).toISOString(),
                exchange: data.exchange || 'default',
                metadata: data.metadata || {}
            };
        });
    }

    registerSchema(name, schema) {
        this.schemas.set(name, schema);
        this.emit('schema_registered', { name, schema });
    }

    registerTransformer(dataType, format, transformFunction) {
        const key = `${dataType}_${format}`;
        this.transformers.set(key, transformFunction);
        this.emit('transformer_registered', { dataType, format });
    }

    registerValidator(name, validatorFunction) {
        this.validators.set(name, validatorFunction);
        this.emit('validator_registered', { name });
    }

    async harmonizeData(data, dataType, targetFormat = 'standard') {
        try {
            const startTime = Date.now();
            
            // Check cache first
            const cacheKey = this.generateCacheKey(data, dataType, targetFormat);
            if (this.config.enableCaching && this.cache.has(cacheKey)) {
                this.statistics.cacheHits++;
                return this.cache.get(cacheKey);
            }
            this.statistics.cacheMisses++;

            // Transform data
            let harmonized = data;
            if (this.config.enableTransformation) {
                harmonized = await this.transformData(data, dataType, targetFormat);
            }

            // Validate harmonized data
            if (this.config.enableValidation) {
                harmonized = await this.validateData(harmonized, dataType);
            }

            // Cache result
            if (this.config.enableCaching) {
                this.cacheResult(cacheKey, harmonized);
            }

            this.statistics.transformations++;
            this.emit('data_harmonized', {
                dataType,
                targetFormat,
                duration: Date.now() - startTime,
                success: true
            });

            return harmonized;
        } catch (error) {
            this.statistics.errors++;
            this.emit('harmonization_error', {
                error: error.message,
                dataType,
                targetFormat,
                data
            });
            throw error;
        }
    }

    async transformData(data, dataType, targetFormat) {
        const transformerKey = `${dataType}_${targetFormat}`;
        const transformer = this.transformers.get(transformerKey);
        
        if (!transformer) {
            throw new Error(`No transformer found for ${dataType} to ${targetFormat}`);
        }

        if (typeof transformer === 'function') {
            return transformer(data);
        } else {
            throw new Error(`Invalid transformer for ${transformerKey}`);
        }
    }

    async validateData(data, dataType) {
        this.statistics.validations++;
        
        // Schema validation
        const schema = this.schemas.get(dataType);
        if (schema) {
            const { error, value } = schema.validate(data, { 
                stripUnknown: true,
                abortEarly: false 
            });
            
            if (error) {
                throw new Error(`Schema validation failed for ${dataType}: ${error.message}`);
            }
            data = value;
        }

        // Custom validation
        const validator = this.validators.get(dataType);
        if (validator) {
            const validationResult = await validator(data);
            if (validationResult !== true) {
                throw new Error(`Custom validation failed for ${dataType}: ${validationResult}`);
            }
        }

        return data;
    }

    createDataStream(dataType, targetFormat = 'standard') {
        return new Transform({
            objectMode: true,
            transform: async (chunk, encoding, callback) => {
                try {
                    const harmonized = await this.harmonizeData(chunk, dataType, targetFormat);
                    callback(null, harmonized);
                } catch (error) {
                    callback(error);
                }
            }
        });
    }

    async batchHarmonize(dataArray, dataType, targetFormat = 'standard') {
        const results = [];
        const errors = [];
        
        for (let i = 0; i < dataArray.length; i++) {
            try {
                const harmonized = await this.harmonizeData(dataArray[i], dataType, targetFormat);
                results.push(harmonized);
            } catch (error) {
                errors.push({ index: i, error: error.message, data: dataArray[i] });
            }
        }
        
        return { results, errors };
    }

    generateCacheKey(data, dataType, targetFormat) {
        const dataHash = this.hashObject(data);
        return `${dataType}_${targetFormat}_${dataHash}`;
    }

    cacheResult(key, data) {
        // Implement LRU cache behavior
        if (this.cache.size >= this.config.cacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        this.cache.set(key, data);
    }

    hashObject(obj) {
        const str = JSON.stringify(obj, Object.keys(obj).sort());
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return hash.toString(36);
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    getStatistics() {
        return {
            ...this.statistics,
            cacheSize: this.cache.size,
            registeredSchemas: this.schemas.size,
            registeredTransformers: this.transformers.size,
            registeredValidators: this.validators.size
        };
    }

    clearCache() {
        this.cache.clear();
        this.emit('cache_cleared');
    }

    getAvailableSchemas() {
        return Array.from(this.schemas.keys());
    }

    getAvailableTransformers() {
        return Array.from(this.transformers.keys());
    }

    // Export/Import functionality for schema sharing
    exportConfiguration() {
        return {
            schemas: Array.from(this.schemas.entries()).map(([name, schema]) => ({
                name,
                schema: schema.describe()
            })),
            transformers: Array.from(this.transformers.keys()),
            validators: Array.from(this.validators.keys())
        };
    }

    importConfiguration(config) {
        // Import schemas, transformers, and validators from another instance
        if (config.schemas) {
            config.schemas.forEach(({ name, schema }) => {
                this.registerSchema(name, Joi.compile(schema));
            });
        }
        // Note: Functions (transformers/validators) cannot be serialized
        // They need to be registered manually after import
    }
}

module.exports = { DataHarmonizationEngine };
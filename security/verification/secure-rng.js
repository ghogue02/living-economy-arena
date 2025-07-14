/**
 * Secure Random Number Generator - Cryptographically Secure RNG
 * Provides tamper-proof random number generation for market events and game mechanics
 */

const crypto = require('crypto');

class SecureRNG {
    constructor(options = {}) {
        this.seedHistory = [];
        this.generationHistory = new Map();
        this.verificationNodes = new Set();
        this.entropyPool = new EntropyPool();
        
        // Configuration
        this.config = {
            seedLength: 32,           // 256 bits
            historyRetention: 1000,   // Keep last 1000 generations
            verificationThreshold: 3, // Require 3 nodes for verification
            reseedInterval: 100,      // Reseed every 100 generations
            maxEntropyAge: 300000,    // 5 minutes max entropy age
            
            // Security parameters
            minEntropyBits: 256,
            hashAlgorithm: 'sha256',
            hmacAlgorithm: 'sha256',
            
            // Verification settings
            auditTrail: true,
            distributedVerification: options.distributed || false,
            blockchainIntegration: options.blockchain || false
        };

        this.generationCount = 0;
        this.lastReseed = Date.now();
        this.currentSeed = this.generateInitialSeed();
        
        // Initialize verification system
        if (this.config.distributedVerification) {
            this.initializeVerificationNetwork();
        }
    }

    /**
     * Generate cryptographically secure random number
     */
    async generateSecureRandom(min = 0, max = 1, purpose = 'GENERAL', metadata = {}) {
        const generationId = this.generateGenerationId();
        const timestamp = Date.now();
        
        try {
            // Check if reseed is needed
            await this.checkAndReseed();
            
            // Gather fresh entropy
            const entropy = await this.gatherEntropy();
            
            // Generate the random value
            const randomValue = await this.generateValue(min, max, entropy, purpose);
            
            // Create generation record
            const generationRecord = {
                id: generationId,
                timestamp,
                purpose,
                min,
                max,
                value: randomValue,
                seed: this.hashSeed(this.currentSeed),
                entropy: this.hashEntropy(entropy),
                metadata,
                verificationHash: null,
                verificationNodes: []
            };
            
            // Perform verification if required
            if (this.config.distributedVerification) {
                await this.performDistributedVerification(generationRecord);
            }
            
            // Calculate verification hash
            generationRecord.verificationHash = this.calculateVerificationHash(generationRecord);
            
            // Store in history
            this.generationHistory.set(generationId, generationRecord);
            this.generationCount++;
            
            // Cleanup old records
            this.cleanupHistory();
            
            // Log for audit trail
            if (this.config.auditTrail) {
                this.logGeneration(generationRecord);
            }
            
            return {
                value: randomValue,
                generationId,
                timestamp,
                verificationHash: generationRecord.verificationHash,
                isVerified: this.config.distributedVerification ? generationRecord.verificationNodes.length >= this.config.verificationThreshold : true
            };
            
        } catch (error) {
            this.logSecurityEvent('RNG_GENERATION_FAILED', {
                generationId,
                error: error.message,
                purpose,
                metadata
            });
            throw error;
        }
    }

    /**
     * Generate initial seed from multiple entropy sources
     */
    generateInitialSeed() {
        const timestamp = Date.now().toString();
        const randomBytes = crypto.randomBytes(this.config.seedLength);
        const processInfo = process.hrtime.bigint().toString();
        const systemEntropy = this.gatherSystemEntropy();
        
        const combinedEntropy = Buffer.concat([
            Buffer.from(timestamp),
            randomBytes,
            Buffer.from(processInfo),
            Buffer.from(systemEntropy)
        ]);
        
        const seed = crypto.createHash(this.config.hashAlgorithm)
            .update(combinedEntropy)
            .digest();
        
        this.seedHistory.push({
            timestamp: Date.now(),
            seedHash: this.hashSeed(seed),
            entropySource: 'INITIAL_SYSTEM'
        });
        
        return seed;
    }

    /**
     * Check if reseed is needed and perform if necessary
     */
    async checkAndReseed() {
        const shouldReseed = 
            this.generationCount % this.config.reseedInterval === 0 ||
            Date.now() - this.lastReseed > this.config.maxEntropyAge;
        
        if (shouldReseed) {
            await this.reseed();
        }
    }

    /**
     * Reseed the RNG with fresh entropy
     */
    async reseed() {
        const timestamp = Date.now();
        const freshEntropy = await this.gatherFreshEntropy();
        
        // Combine current seed with fresh entropy
        const newSeedData = Buffer.concat([
            this.currentSeed,
            Buffer.from(timestamp.toString()),
            freshEntropy
        ]);
        
        this.currentSeed = crypto.createHash(this.config.hashAlgorithm)
            .update(newSeedData)
            .digest();
        
        this.lastReseed = timestamp;
        
        // Record reseed event
        this.seedHistory.push({
            timestamp,
            seedHash: this.hashSeed(this.currentSeed),
            entropySource: 'RESEED',
            generationCount: this.generationCount
        });
        
        // Clean up old seed history
        if (this.seedHistory.length > 100) {
            this.seedHistory = this.seedHistory.slice(-100);
        }
        
        this.logSecurityEvent('RNG_RESEEDED', {
            timestamp,
            generationCount: this.generationCount,
            entropyBits: freshEntropy.length * 8
        });
    }

    /**
     * Gather entropy from multiple sources
     */
    async gatherEntropy() {
        const entropy = {
            timestamp: Date.now(),
            crypto: crypto.randomBytes(16),
            system: this.gatherSystemEntropy(),
            pool: this.entropyPool.getEntropy(),
            external: await this.gatherExternalEntropy()
        };
        
        return Buffer.concat([
            Buffer.from(entropy.timestamp.toString()),
            entropy.crypto,
            Buffer.from(entropy.system),
            entropy.pool,
            entropy.external
        ]);
    }

    /**
     * Gather fresh entropy for reseeding
     */
    async gatherFreshEntropy() {
        const sources = await Promise.all([
            this.gatherCryptoEntropy(),
            this.gatherTimingEntropy(),
            this.gatherNetworkEntropy(),
            this.gatherSystemStateEntropy()
        ]);
        
        return Buffer.concat(sources);
    }

    /**
     * System entropy gathering
     */
    gatherSystemEntropy() {
        const memUsage = process.memoryUsage();
        const cpuUsage = process.cpuUsage();
        const hrtime = process.hrtime.bigint();
        
        const systemData = JSON.stringify({
            memory: memUsage,
            cpu: cpuUsage,
            hrtime: hrtime.toString(),
            pid: process.pid,
            platform: process.platform,
            arch: process.arch
        });
        
        return systemData;
    }

    async gatherCryptoEntropy() {
        return crypto.randomBytes(32);
    }

    async gatherTimingEntropy() {
        const start = process.hrtime.bigint();
        await new Promise(resolve => setImmediate(resolve));
        const end = process.hrtime.bigint();
        const timingData = (end - start).toString();
        return Buffer.from(timingData);
    }

    async gatherNetworkEntropy() {
        // Gather entropy from network timing if available
        try {
            const start = Date.now();
            await new Promise(resolve => setTimeout(resolve, 1));
            const timing = Date.now() - start;
            return Buffer.from(timing.toString());
        } catch (error) {
            return Buffer.from('network_unavailable');
        }
    }

    async gatherSystemStateEntropy() {
        const state = {
            timestamp: Date.now(),
            random: Math.random(),
            counter: this.generationCount,
            uptime: process.uptime()
        };
        return Buffer.from(JSON.stringify(state));
    }

    async gatherExternalEntropy() {
        // In production, this could gather entropy from external sources
        // For now, using additional crypto.randomBytes
        return crypto.randomBytes(16);
    }

    /**
     * Generate the actual random value
     */
    async generateValue(min, max, entropy, purpose) {
        // Create HMAC using current seed and entropy
        const hmac = crypto.createHmac(this.config.hmacAlgorithm, this.currentSeed);
        hmac.update(entropy);
        hmac.update(Buffer.from(purpose));
        hmac.update(Buffer.from(this.generationCount.toString()));
        
        const hashOutput = hmac.digest();
        
        // Convert hash to number in range
        if (typeof min === 'number' && typeof max === 'number') {
            return this.hashToRange(hashOutput, min, max);
        } else {
            // Return normalized value between 0 and 1
            return this.hashToFloat(hashOutput);
        }
    }

    /**
     * Convert hash to number in specified range
     */
    hashToRange(hash, min, max) {
        // Use multiple bytes for better distribution
        const bytes = hash.slice(0, 8);
        let value = 0;
        
        for (let i = 0; i < bytes.length; i++) {
            value = (value * 256 + bytes[i]) % Number.MAX_SAFE_INTEGER;
        }
        
        // Normalize to range
        const range = max - min;
        const normalized = value / Number.MAX_SAFE_INTEGER;
        
        if (Number.isInteger(min) && Number.isInteger(max)) {
            return Math.floor(normalized * (range + 1)) + min;
        } else {
            return normalized * range + min;
        }
    }

    /**
     * Convert hash to float between 0 and 1
     */
    hashToFloat(hash) {
        const bytes = hash.slice(0, 8);
        let value = 0;
        
        for (let i = 0; i < bytes.length; i++) {
            value += bytes[i] / Math.pow(256, i + 1);
        }
        
        return value;
    }

    /**
     * Perform distributed verification
     */
    async performDistributedVerification(generationRecord) {
        const verificationPromises = [];
        
        for (const nodeId of this.verificationNodes) {
            verificationPromises.push(
                this.requestNodeVerification(nodeId, generationRecord)
            );
        }
        
        try {
            const verificationResults = await Promise.allSettled(verificationPromises);
            const successfulVerifications = verificationResults
                .filter(result => result.status === 'fulfilled' && result.value.verified)
                .map(result => result.value);
            
            generationRecord.verificationNodes = successfulVerifications;
            
            if (successfulVerifications.length < this.config.verificationThreshold) {
                throw new Error('Insufficient verification nodes responded');
            }
            
        } catch (error) {
            this.logSecurityEvent('VERIFICATION_FAILED', {
                generationId: generationRecord.id,
                error: error.message,
                availableNodes: this.verificationNodes.size
            });
            throw error;
        }
    }

    /**
     * Request verification from a node
     */
    async requestNodeVerification(nodeId, generationRecord) {
        // Simulate verification request (in production, this would be a network call)
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
        
        const verificationData = {
            nodeId,
            generationId: generationRecord.id,
            timestamp: Date.now(),
            verified: true, // Simulated verification result
            signature: this.generateNodeSignature(nodeId, generationRecord)
        };
        
        return verificationData;
    }

    /**
     * Verify a previously generated random number
     */
    async verifyGeneration(generationId, expectedValue = null) {
        const record = this.generationHistory.get(generationId);
        
        if (!record) {
            return {
                valid: false,
                reason: 'Generation record not found',
                generationId
            };
        }
        
        // Verify hash integrity
        const recalculatedHash = this.calculateVerificationHash(record);
        if (recalculatedHash !== record.verificationHash) {
            return {
                valid: false,
                reason: 'Verification hash mismatch',
                generationId,
                expected: record.verificationHash,
                calculated: recalculatedHash
            };
        }
        
        // Verify expected value if provided
        if (expectedValue !== null && record.value !== expectedValue) {
            return {
                valid: false,
                reason: 'Value mismatch',
                generationId,
                expected: expectedValue,
                actual: record.value
            };
        }
        
        // Verify distributed verification if applicable
        if (this.config.distributedVerification) {
            const verificationValid = record.verificationNodes.length >= this.config.verificationThreshold;
            if (!verificationValid) {
                return {
                    valid: false,
                    reason: 'Insufficient verification nodes',
                    generationId,
                    verificationNodes: record.verificationNodes.length,
                    required: this.config.verificationThreshold
                };
            }
        }
        
        return {
            valid: true,
            generationId,
            record,
            verificationNodes: record.verificationNodes.length
        };
    }

    /**
     * Calculate verification hash for a generation record
     */
    calculateVerificationHash(record) {
        const hashData = JSON.stringify({
            id: record.id,
            timestamp: record.timestamp,
            purpose: record.purpose,
            min: record.min,
            max: record.max,
            value: record.value,
            seed: record.seed,
            entropy: record.entropy,
            metadata: record.metadata
        });
        
        return crypto.createHash(this.config.hashAlgorithm)
            .update(hashData)
            .digest('hex');
    }

    /**
     * Hash seed for storage (never store actual seed)
     */
    hashSeed(seed) {
        return crypto.createHash(this.config.hashAlgorithm)
            .update(seed)
            .update('SEED_HASH_SALT')
            .digest('hex');
    }

    /**
     * Hash entropy for verification
     */
    hashEntropy(entropy) {
        return crypto.createHash(this.config.hashAlgorithm)
            .update(entropy)
            .update('ENTROPY_HASH_SALT')
            .digest('hex');
    }

    /**
     * Generate unique ID for each generation
     */
    generateGenerationId() {
        const timestamp = Date.now();
        const counter = this.generationCount;
        const random = crypto.randomBytes(8).toString('hex');
        
        return `${timestamp}-${counter}-${random}`;
    }

    /**
     * Generate node signature for verification
     */
    generateNodeSignature(nodeId, generationRecord) {
        const signatureData = JSON.stringify({
            nodeId,
            generationId: generationRecord.id,
            value: generationRecord.value,
            timestamp: Date.now()
        });
        
        return crypto.createHash('sha256')
            .update(signatureData)
            .update('NODE_SIGNATURE_SALT')
            .digest('hex');
    }

    /**
     * Initialize verification network
     */
    initializeVerificationNetwork() {
        // Initialize verification nodes (in production, these would be actual network nodes)
        for (let i = 0; i < 5; i++) {
            this.verificationNodes.add(`node-${i}-${crypto.randomBytes(4).toString('hex')}`);
        }
        
        this.logSecurityEvent('VERIFICATION_NETWORK_INITIALIZED', {
            nodeCount: this.verificationNodes.size,
            verificationThreshold: this.config.verificationThreshold
        });
    }

    /**
     * Cleanup old generation history
     */
    cleanupHistory() {
        if (this.generationHistory.size > this.config.historyRetention) {
            const sortedEntries = Array.from(this.generationHistory.entries())
                .sort(([,a], [,b]) => a.timestamp - b.timestamp);
            
            const toDelete = sortedEntries.slice(0, sortedEntries.length - this.config.historyRetention);
            toDelete.forEach(([id]) => this.generationHistory.delete(id));
        }
    }

    /**
     * Log generation for audit trail
     */
    logGeneration(record) {
        const auditEntry = {
            timestamp: record.timestamp,
            generationId: record.id,
            purpose: record.purpose,
            verificationHash: record.verificationHash,
            verificationNodes: record.verificationNodes.length,
            component: 'SECURE_RNG'
        };
        
        // In production, this would go to an audit system
        console.log('[RNG_AUDIT]', auditEntry);
    }

    /**
     * Log security events
     */
    logSecurityEvent(event, data) {
        const logEntry = {
            timestamp: Date.now(),
            event,
            data,
            component: 'SECURE_RNG'
        };
        
        console.log(`[SECURE_RNG] ${event}:`, logEntry);
    }

    /**
     * Get system status and health
     */
    getSystemStatus() {
        return {
            generationCount: this.generationCount,
            lastReseed: this.lastReseed,
            seedAge: Date.now() - this.lastReseed,
            historySize: this.generationHistory.size,
            verificationNodes: this.verificationNodes.size,
            entropyPoolSize: this.entropyPool.getSize(),
            configuredSecurity: {
                distributedVerification: this.config.distributedVerification,
                auditTrail: this.config.auditTrail,
                verificationThreshold: this.config.verificationThreshold
            },
            health: this.calculateSystemHealth()
        };
    }

    calculateSystemHealth() {
        const seedAge = Date.now() - this.lastReseed;
        const maxHealthyAge = this.config.maxEntropyAge * 2;
        
        if (seedAge > maxHealthyAge) return 'CRITICAL';
        if (seedAge > this.config.maxEntropyAge) return 'WARNING';
        if (this.config.distributedVerification && this.verificationNodes.size < this.config.verificationThreshold) return 'DEGRADED';
        return 'HEALTHY';
    }

    /**
     * Export audit data for compliance
     */
    exportAuditData(startTime, endTime) {
        const filteredHistory = Array.from(this.generationHistory.values())
            .filter(record => record.timestamp >= startTime && record.timestamp <= endTime);
        
        return {
            exportTime: Date.now(),
            timeRange: { startTime, endTime },
            totalGenerations: filteredHistory.length,
            seedHistory: this.seedHistory.filter(seed => seed.timestamp >= startTime && seed.timestamp <= endTime),
            generations: filteredHistory.map(record => ({
                id: record.id,
                timestamp: record.timestamp,
                purpose: record.purpose,
                verificationHash: record.verificationHash,
                verificationNodes: record.verificationNodes.length,
                metadata: record.metadata
            })),
            systemConfig: {
                seedLength: this.config.seedLength,
                hashAlgorithm: this.config.hashAlgorithm,
                distributedVerification: this.config.distributedVerification,
                verificationThreshold: this.config.verificationThreshold
            }
        };
    }
}

/**
 * Entropy Pool - Collects and manages entropy from various sources
 */
class EntropyPool {
    constructor() {
        this.pool = Buffer.alloc(0);
        this.maxSize = 4096; // 4KB entropy pool
        this.lastUpdate = Date.now();
    }

    addEntropy(data) {
        const entropyBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data.toString());
        this.pool = Buffer.concat([this.pool, entropyBuffer]);
        
        if (this.pool.length > this.maxSize) {
            this.pool = this.pool.slice(-this.maxSize);
        }
        
        this.lastUpdate = Date.now();
    }

    getEntropy(bytes = 16) {
        if (this.pool.length < bytes) {
            // If not enough entropy, mix with crypto.randomBytes
            const needed = bytes - this.pool.length;
            this.addEntropy(crypto.randomBytes(needed));
        }
        
        const entropy = this.pool.slice(0, bytes);
        this.pool = this.pool.slice(bytes);
        
        return entropy;
    }

    getSize() {
        return this.pool.length;
    }

    getAge() {
        return Date.now() - this.lastUpdate;
    }
}

module.exports = { SecureRNG, EntropyPool };
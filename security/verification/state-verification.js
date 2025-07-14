/**
 * Encrypted State Verification System - Prevents Client-Side Tampering
 * Comprehensive system for verifying game state integrity and preventing manipulation
 */

const crypto = require('crypto');

class StateVerificationSystem {
    constructor(options = {}) {
        this.stateStore = new Map(); // stateId -> StateRecord
        this.userStates = new Map(); // userId -> Set of stateIds
        this.verificationCache = new Map(); // cacheKey -> VerificationResult
        this.integrityChecks = new Map(); // checkId -> IntegrityCheck
        
        // Encryption configuration
        this.encryption = {
            algorithm: 'aes-256-gcm',
            keyLength: 32,
            ivLength: 16,
            tagLength: 16,
            saltLength: 32
        };
        
        // Verification configuration
        this.config = {
            verificationInterval: 30000,    // 30 seconds
            maxStateAge: 300000,           // 5 minutes
            integrityCheckInterval: 10000,  // 10 seconds
            cacheSize: 10000,
            maxStatesPerUser: 1000,
            
            // Security settings
            requireSignatures: true,
            enableTimestamping: true,
            distributedVerification: options.distributed || false,
            blockchainIntegration: options.blockchain || false,
            
            // Checksum settings
            checksumAlgorithm: 'sha256',
            merkleTreeDepth: 8,
            
            // Anti-tampering
            enableHoneypots: true,
            tamperDetectionSensitivity: 0.8,
            maxTamperAttempts: 3
        };

        // System keys (in production, these would be securely managed)
        this.systemKeys = this.generateSystemKeys();
        this.verificationNodes = new Set();
        
        // Tamper detection
        this.tamperAttempts = new Map(); // userId -> TamperRecord
        this.honeypots = new Map(); // stateId -> HoneypotData
        
        this.startPeriodicVerification();
        this.startIntegrityChecks();
    }

    /**
     * Create and encrypt a new state
     */
    async createState(userId, stateData, metadata = {}) {
        const stateId = this.generateStateId();
        const timestamp = Date.now();
        
        try {
            // Validate state data
            this.validateStateData(stateData);
            
            // Add honeypot data for tamper detection
            const protectedStateData = this.addHoneypots(stateData);
            
            // Encrypt the state data
            const encryptionResult = await this.encryptState(protectedStateData, userId);
            
            // Calculate integrity hash
            const integrityHash = this.calculateIntegrityHash(protectedStateData, metadata);
            
            // Create state record
            const stateRecord = {
                id: stateId,
                userId,
                timestamp,
                metadata,
                encryptedData: encryptionResult.encryptedData,
                encryptionKey: encryptionResult.encryptedKey,
                iv: encryptionResult.iv,
                tag: encryptionResult.tag,
                salt: encryptionResult.salt,
                integrityHash,
                checksum: this.calculateChecksum(protectedStateData),
                merkleRoot: this.calculateMerkleRoot(protectedStateData),
                signature: null,
                verificationStatus: 'PENDING',
                lastVerified: timestamp,
                tamperFlags: [],
                accessLog: []
            };
            
            // Generate signature
            if (this.config.requireSignatures) {
                stateRecord.signature = this.generateStateSignature(stateRecord);
            }
            
            // Store state
            this.stateStore.set(stateId, stateRecord);
            this.addStateToUser(userId, stateId);
            
            // Store honeypot tracking
            if (this.config.enableHoneypots) {
                this.honeypots.set(stateId, {
                    honeypotFields: this.getHoneypotFields(protectedStateData),
                    expectedValues: this.getHoneypotValues(protectedStateData)
                });
            }
            
            // Log state creation
            this.logStateEvent('STATE_CREATED', {
                stateId,
                userId,
                timestamp,
                integrityHash
            });
            
            return {
                stateId,
                timestamp,
                integrityHash,
                checksum: stateRecord.checksum,
                success: true
            };
            
        } catch (error) {
            this.logSecurityEvent('STATE_CREATION_FAILED', {
                userId,
                error: error.message,
                timestamp
            });
            throw error;
        }
    }

    /**
     * Verify and retrieve state data
     */
    async verifyAndRetrieveState(stateId, userId, expectedChecksum = null) {
        const stateRecord = this.stateStore.get(stateId);
        
        if (!stateRecord) {
            throw new Error('State not found');
        }
        
        if (stateRecord.userId !== userId) {
            this.logTamperAttempt(userId, 'UNAUTHORIZED_ACCESS', stateId);
            throw new Error('Unauthorized access to state');
        }
        
        try {
            // Check state age
            const age = Date.now() - stateRecord.timestamp;
            if (age > this.config.maxStateAge) {
                throw new Error('State expired');
            }
            
            // Verify signature if enabled
            if (this.config.requireSignatures) {
                const signatureValid = this.verifyStateSignature(stateRecord);
                if (!signatureValid) {
                    this.logTamperAttempt(userId, 'INVALID_SIGNATURE', stateId);
                    throw new Error('State signature verification failed');
                }
            }
            
            // Decrypt state data
            const decryptedData = await this.decryptState(stateRecord, userId);
            
            // Verify integrity
            const integrityVerification = await this.verifyStateIntegrity(stateRecord, decryptedData);
            if (!integrityVerification.valid) {
                this.logTamperAttempt(userId, 'INTEGRITY_FAILURE', stateId);
                throw new Error(`State integrity verification failed: ${integrityVerification.reason}`);
            }
            
            // Check honeypots for tampering
            if (this.config.enableHoneypots) {
                const honeypotCheck = this.checkHoneypots(stateId, decryptedData);
                if (honeypotCheck.tampered) {
                    this.logTamperAttempt(userId, 'HONEYPOT_TRIGGERED', stateId);
                    throw new Error('State tampering detected');
                }
            }
            
            // Verify expected checksum if provided
            if (expectedChecksum) {
                const actualChecksum = this.calculateChecksum(decryptedData);
                if (actualChecksum !== expectedChecksum) {
                    this.logTamperAttempt(userId, 'CHECKSUM_MISMATCH', stateId);
                    throw new Error('State checksum mismatch');
                }
            }
            
            // Remove honeypot data before returning
            const cleanData = this.removeHoneypots(decryptedData);
            
            // Update access log
            stateRecord.accessLog.push({
                timestamp: Date.now(),
                action: 'RETRIEVE',
                success: true
            });
            
            stateRecord.lastVerified = Date.now();
            stateRecord.verificationStatus = 'VERIFIED';
            
            return {
                stateId,
                data: cleanData,
                timestamp: stateRecord.timestamp,
                lastVerified: stateRecord.lastVerified,
                verificationStatus: stateRecord.verificationStatus,
                integrityScore: integrityVerification.score
            };
            
        } catch (error) {
            // Log failed access
            stateRecord.accessLog.push({
                timestamp: Date.now(),
                action: 'RETRIEVE',
                success: false,
                error: error.message
            });
            
            throw error;
        }
    }

    /**
     * Update existing state with verification
     */
    async updateState(stateId, userId, newStateData, metadata = {}) {
        const existingRecord = this.stateStore.get(stateId);
        
        if (!existingRecord) {
            throw new Error('State not found');
        }
        
        if (existingRecord.userId !== userId) {
            this.logTamperAttempt(userId, 'UNAUTHORIZED_UPDATE', stateId);
            throw new Error('Unauthorized state update');
        }
        
        try {
            // Verify current state integrity first
            const currentVerification = await this.verifyStateIntegrity(existingRecord);
            if (!currentVerification.valid) {
                throw new Error('Current state integrity compromised');
            }
            
            // Create new state with updated data
            const updateResult = await this.createState(userId, newStateData, {
                ...metadata,
                previousStateId: stateId,
                updateTimestamp: Date.now()
            });
            
            // Mark old state as superseded
            existingRecord.verificationStatus = 'SUPERSEDED';
            existingRecord.supersededBy = updateResult.stateId;
            existingRecord.supersededAt = Date.now();
            
            return updateResult;
            
        } catch (error) {
            this.logSecurityEvent('STATE_UPDATE_FAILED', {
                stateId,
                userId,
                error: error.message
            });
            throw error;
        }
    }

    /**
     * Encrypt state data
     */
    async encryptState(stateData, userId) {
        const plaintext = JSON.stringify(stateData);
        const salt = crypto.randomBytes(this.encryption.saltLength);
        
        // Derive encryption key
        const key = crypto.pbkdf2Sync(
            this.systemKeys.masterKey,
            salt,
            100000, // iterations
            this.encryption.keyLength,
            'sha512'
        );
        
        // Generate IV
        const iv = crypto.randomBytes(this.encryption.ivLength);
        
        // Encrypt data
        const cipher = crypto.createCipher(this.encryption.algorithm, key);
        cipher.setAAD(Buffer.from(userId)); // Additional authenticated data
        
        let encryptedData = cipher.update(plaintext, 'utf8', 'hex');
        encryptedData += cipher.final('hex');
        
        const tag = cipher.getAuthTag();
        
        // Encrypt the key with user-specific salt
        const userSalt = crypto.createHash('sha256').update(userId + this.systemKeys.userSalt).digest();
        const encryptedKey = this.encryptKey(key, userSalt);
        
        return {
            encryptedData,
            encryptedKey,
            iv: iv.toString('hex'),
            tag: tag.toString('hex'),
            salt: salt.toString('hex')
        };
    }

    /**
     * Decrypt state data
     */
    async decryptState(stateRecord, userId) {
        try {
            // Decrypt the encryption key
            const userSalt = crypto.createHash('sha256').update(userId + this.systemKeys.userSalt).digest();
            const key = this.decryptKey(stateRecord.encryptedKey, userSalt);
            
            // Decrypt the data
            const decipher = crypto.createDecipher(
                this.encryption.algorithm,
                key
            );
            
            decipher.setAAD(Buffer.from(userId));
            decipher.setAuthTag(Buffer.from(stateRecord.tag, 'hex'));
            
            let decryptedData = decipher.update(stateRecord.encryptedData, 'hex', 'utf8');
            decryptedData += decipher.final('utf8');
            
            return JSON.parse(decryptedData);
            
        } catch (error) {
            throw new Error('State decryption failed: ' + error.message);
        }
    }

    /**
     * Verify state integrity
     */
    async verifyStateIntegrity(stateRecord, decryptedData = null) {
        try {
            // Decrypt data if not provided
            if (!decryptedData) {
                decryptedData = await this.decryptState(stateRecord, stateRecord.userId);
            }
            
            // Verify checksum
            const currentChecksum = this.calculateChecksum(decryptedData);
            if (currentChecksum !== stateRecord.checksum) {
                return {
                    valid: false,
                    reason: 'Checksum mismatch',
                    expected: stateRecord.checksum,
                    actual: currentChecksum,
                    score: 0
                };
            }
            
            // Verify integrity hash
            const currentIntegrityHash = this.calculateIntegrityHash(decryptedData, stateRecord.metadata);
            if (currentIntegrityHash !== stateRecord.integrityHash) {
                return {
                    valid: false,
                    reason: 'Integrity hash mismatch',
                    expected: stateRecord.integrityHash,
                    actual: currentIntegrityHash,
                    score: 0.2
                };
            }
            
            // Verify Merkle root
            const currentMerkleRoot = this.calculateMerkleRoot(decryptedData);
            if (currentMerkleRoot !== stateRecord.merkleRoot) {
                return {
                    valid: false,
                    reason: 'Merkle root mismatch',
                    expected: stateRecord.merkleRoot,
                    actual: currentMerkleRoot,
                    score: 0.3
                };
            }
            
            // Check for structural integrity
            const structuralCheck = this.verifyStructuralIntegrity(decryptedData);
            if (!structuralCheck.valid) {
                return {
                    valid: false,
                    reason: 'Structural integrity failure',
                    details: structuralCheck.issues,
                    score: 0.5
                };
            }
            
            return {
                valid: true,
                score: 1.0,
                verifiedAt: Date.now()
            };
            
        } catch (error) {
            return {
                valid: false,
                reason: 'Verification error: ' + error.message,
                score: 0
            };
        }
    }

    /**
     * Add honeypot data for tamper detection
     */
    addHoneypots(stateData) {
        if (!this.config.enableHoneypots) {
            return stateData;
        }
        
        const protectedData = JSON.parse(JSON.stringify(stateData));
        
        // Add hidden checksum fields
        protectedData.__integrity_check = crypto.randomBytes(16).toString('hex');
        protectedData.__state_version = '1.0.0';
        protectedData.__last_modified = Date.now();
        
        // Add nested honeypot in complex structures
        if (typeof protectedData === 'object' && protectedData !== null) {
            protectedData.__security = {
                token: crypto.randomBytes(8).toString('hex'),
                validated: true,
                checksum: crypto.createHash('md5').update(JSON.stringify(stateData)).digest('hex')
            };
        }
        
        return protectedData;
    }

    /**
     * Check honeypots for tampering
     */
    checkHoneypots(stateId, decryptedData) {
        if (!this.config.enableHoneypots) {
            return { tampered: false };
        }
        
        const honeypotData = this.honeypots.get(stateId);
        if (!honeypotData) {
            return { tampered: false };
        }
        
        const violations = [];
        
        // Check for missing honeypot fields
        for (const field of honeypotData.honeypotFields) {
            if (!(field in decryptedData)) {
                violations.push(`Missing honeypot field: ${field}`);
            }
        }
        
        // Check for modified honeypot values
        for (const [field, expectedValue] of Object.entries(honeypotData.expectedValues)) {
            if (decryptedData[field] !== expectedValue) {
                violations.push(`Modified honeypot field: ${field}`);
            }
        }
        
        // Check security token integrity
        if (decryptedData.__security) {
            const originalChecksum = this.removeHoneypots(decryptedData);
            const expectedChecksum = crypto.createHash('md5').update(JSON.stringify(originalChecksum)).digest('hex');
            
            if (decryptedData.__security.checksum !== expectedChecksum) {
                violations.push('Security checksum mismatch');
            }
        }
        
        return {
            tampered: violations.length > 0,
            violations,
            severity: this.calculateTamperSeverity(violations)
        };
    }

    /**
     * Remove honeypot data before returning clean state
     */
    removeHoneypots(stateData) {
        const cleanData = JSON.parse(JSON.stringify(stateData));
        
        // Remove honeypot fields
        delete cleanData.__integrity_check;
        delete cleanData.__state_version;
        delete cleanData.__last_modified;
        delete cleanData.__security;
        
        return cleanData;
    }

    /**
     * Generate various verification hashes and checksums
     */
    calculateChecksum(data) {
        const normalizedData = this.normalizeData(data);
        return crypto.createHash(this.config.checksumAlgorithm)
            .update(JSON.stringify(normalizedData))
            .digest('hex');
    }

    calculateIntegrityHash(data, metadata) {
        const combinedData = {
            state: this.normalizeData(data),
            metadata: metadata || {},
            timestamp: Date.now()
        };
        
        return crypto.createHmac('sha256', this.systemKeys.integrityKey)
            .update(JSON.stringify(combinedData))
            .digest('hex');
    }

    calculateMerkleRoot(data) {
        // Create Merkle tree of data fields
        const fields = this.flattenObject(data);
        const leaves = fields.map(field => 
            crypto.createHash('sha256').update(JSON.stringify(field)).digest()
        );
        
        return this.buildMerkleTree(leaves);
    }

    /**
     * Generate and verify state signatures
     */
    generateStateSignature(stateRecord) {
        const signatureData = {
            id: stateRecord.id,
            userId: stateRecord.userId,
            timestamp: stateRecord.timestamp,
            integrityHash: stateRecord.integrityHash,
            checksum: stateRecord.checksum
        };
        
        return crypto.createHmac('sha256', this.systemKeys.signatureKey)
            .update(JSON.stringify(signatureData))
            .digest('hex');
    }

    verifyStateSignature(stateRecord) {
        const expectedSignature = this.generateStateSignature(stateRecord);
        return crypto.timingSafeEqual(
            Buffer.from(stateRecord.signature, 'hex'),
            Buffer.from(expectedSignature, 'hex')
        );
    }

    /**
     * Utility methods
     */
    normalizeData(data) {
        if (data === null || data === undefined) return data;
        if (typeof data !== 'object') return data;
        if (Array.isArray(data)) return data.map(item => this.normalizeData(item));
        
        const normalized = {};
        Object.keys(data).sort().forEach(key => {
            normalized[key] = this.normalizeData(data[key]);
        });
        
        return normalized;
    }

    flattenObject(obj, prefix = '') {
        const flattened = [];
        
        for (const key in obj) {
            const fullKey = prefix ? `${prefix}.${key}` : key;
            const value = obj[key];
            
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                flattened.push(...this.flattenObject(value, fullKey));
            } else {
                flattened.push({ key: fullKey, value });
            }
        }
        
        return flattened;
    }

    buildMerkleTree(leaves) {
        if (leaves.length === 0) return null;
        if (leaves.length === 1) return leaves[0].toString('hex');
        
        const nextLevel = [];
        for (let i = 0; i < leaves.length; i += 2) {
            const left = leaves[i];
            const right = leaves[i + 1] || left; // Duplicate last node if odd number
            const combined = Buffer.concat([left, right]);
            nextLevel.push(crypto.createHash('sha256').update(combined).digest());
        }
        
        return this.buildMerkleTree(nextLevel);
    }

    verifyStructuralIntegrity(data) {
        const issues = [];
        
        // Check for required fields based on data type
        if (data && typeof data === 'object') {
            // Verify object structure hasn't been malformed
            try {
                JSON.stringify(data);
            } catch (error) {
                issues.push('Data not JSON serializable');
            }
            
            // Check for suspicious modifications
            if (this.detectSuspiciousStructure(data)) {
                issues.push('Suspicious data structure detected');
            }
        }
        
        return {
            valid: issues.length === 0,
            issues
        };
    }

    detectSuspiciousStructure(data) {
        // Look for patterns that might indicate tampering
        const suspicious = [
            '__proto__',
            'constructor',
            'prototype',
            'eval',
            'function',
            'script'
        ];
        
        const dataStr = JSON.stringify(data);
        return suspicious.some(pattern => dataStr.includes(pattern));
    }

    /**
     * System key management
     */
    generateSystemKeys() {
        return {
            masterKey: crypto.randomBytes(32),
            integrityKey: crypto.randomBytes(32),
            signatureKey: crypto.randomBytes(32),
            userSalt: crypto.randomBytes(32).toString('hex')
        };
    }

    encryptKey(key, salt) {
        const cipher = crypto.createCipher('aes-256-cbc', salt);
        let encrypted = cipher.update(key, 'binary', 'hex');
        encrypted += cipher.final('hex');
        return encrypted;
    }

    decryptKey(encryptedKey, salt) {
        const decipher = crypto.createDecipher('aes-256-cbc', salt);
        let decrypted = decipher.update(encryptedKey, 'hex', 'binary');
        decrypted += decipher.final('binary');
        return Buffer.from(decrypted, 'binary');
    }

    /**
     * Tamper detection and logging
     */
    logTamperAttempt(userId, type, stateId) {
        if (!this.tamperAttempts.has(userId)) {
            this.tamperAttempts.set(userId, {
                attempts: [],
                totalAttempts: 0,
                firstAttempt: Date.now(),
                blocked: false
            });
        }
        
        const tamperRecord = this.tamperAttempts.get(userId);
        tamperRecord.attempts.push({
            type,
            stateId,
            timestamp: Date.now()
        });
        tamperRecord.totalAttempts++;
        
        // Check if user should be blocked
        if (tamperRecord.totalAttempts >= this.config.maxTamperAttempts) {
            tamperRecord.blocked = true;
            this.logSecurityEvent('USER_BLOCKED_TAMPERING', {
                userId,
                totalAttempts: tamperRecord.totalAttempts,
                types: tamperRecord.attempts.map(a => a.type)
            });
        }
        
        this.logSecurityEvent('TAMPER_ATTEMPT', {
            userId,
            type,
            stateId,
            totalAttempts: tamperRecord.totalAttempts
        });
    }

    calculateTamperSeverity(violations) {
        if (violations.length === 0) return 'NONE';
        if (violations.length >= 3) return 'HIGH';
        if (violations.some(v => v.includes('checksum'))) return 'HIGH';
        if (violations.length >= 2) return 'MEDIUM';
        return 'LOW';
    }

    /**
     * User and state management
     */
    addStateToUser(userId, stateId) {
        if (!this.userStates.has(userId)) {
            this.userStates.set(userId, new Set());
        }
        
        const userStateSet = this.userStates.get(userId);
        userStateSet.add(stateId);
        
        // Enforce user state limit
        if (userStateSet.size > this.config.maxStatesPerUser) {
            const sortedStates = Array.from(userStateSet)
                .map(id => ({ id, timestamp: this.stateStore.get(id)?.timestamp || 0 }))
                .sort((a, b) => a.timestamp - b.timestamp);
            
            const toRemove = sortedStates.slice(0, sortedStates.length - this.config.maxStatesPerUser);
            toRemove.forEach(({ id }) => {
                userStateSet.delete(id);
                this.stateStore.delete(id);
                this.honeypots.delete(id);
            });
        }
    }

    validateStateData(stateData) {
        if (stateData === null || stateData === undefined) {
            throw new Error('State data cannot be null or undefined');
        }
        
        if (typeof stateData === 'object') {
            try {
                JSON.stringify(stateData);
            } catch (error) {
                throw new Error('State data must be JSON serializable');
            }
        }
        
        // Additional validation rules can be added here
    }

    getHoneypotFields(data) {
        return ['__integrity_check', '__state_version', '__last_modified', '__security'];
    }

    getHoneypotValues(data) {
        return {
            '__integrity_check': data.__integrity_check,
            '__state_version': data.__state_version,
            '__last_modified': data.__last_modified,
            '__security': data.__security
        };
    }

    generateStateId() {
        const timestamp = Date.now();
        const random = crypto.randomBytes(8).toString('hex');
        return `state_${timestamp}_${random}`;
    }

    /**
     * Periodic verification and cleanup
     */
    startPeriodicVerification() {
        setInterval(async () => {
            await this.performPeriodicVerification();
        }, this.config.verificationInterval);
    }

    startIntegrityChecks() {
        setInterval(async () => {
            await this.performIntegrityChecks();
        }, this.config.integrityCheckInterval);
    }

    async performPeriodicVerification() {
        const now = Date.now();
        const statesToVerify = [];
        
        for (const [stateId, record] of this.stateStore.entries()) {
            if (now - record.lastVerified > this.config.verificationInterval) {
                statesToVerify.push(stateId);
            }
        }
        
        // Verify states in batches
        const batchSize = 10;
        for (let i = 0; i < statesToVerify.length; i += batchSize) {
            const batch = statesToVerify.slice(i, i + batchSize);
            await Promise.all(batch.map(stateId => this.verifyStateById(stateId)));
        }
    }

    async performIntegrityChecks() {
        // Check system integrity
        const systemCheck = this.performSystemIntegrityCheck();
        
        if (!systemCheck.valid) {
            this.logSecurityEvent('SYSTEM_INTEGRITY_FAILURE', systemCheck);
        }
        
        // Clean up expired states
        this.cleanupExpiredStates();
        
        // Clean up verification cache
        this.cleanupVerificationCache();
    }

    async verifyStateById(stateId) {
        try {
            const record = this.stateStore.get(stateId);
            if (!record) return;
            
            const verification = await this.verifyStateIntegrity(record);
            
            record.lastVerified = Date.now();
            record.verificationStatus = verification.valid ? 'VERIFIED' : 'FAILED';
            
            if (!verification.valid) {
                record.tamperFlags.push({
                    timestamp: Date.now(),
                    reason: verification.reason,
                    score: verification.score
                });
                
                this.logSecurityEvent('PERIODIC_VERIFICATION_FAILED', {
                    stateId,
                    userId: record.userId,
                    reason: verification.reason
                });
            }
            
        } catch (error) {
            this.logSecurityEvent('VERIFICATION_ERROR', {
                stateId,
                error: error.message
            });
        }
    }

    performSystemIntegrityCheck() {
        // Check system key integrity
        if (!this.systemKeys.masterKey || this.systemKeys.masterKey.length !== 32) {
            return { valid: false, reason: 'Master key compromised' };
        }
        
        // Check state store integrity
        if (this.stateStore.size > 100000) { // Arbitrary limit
            return { valid: false, reason: 'State store size exceeded' };
        }
        
        // Check for memory leaks
        const memoryUsage = process.memoryUsage();
        if (memoryUsage.heapUsed > 1000000000) { // 1GB limit
            return { valid: false, reason: 'Memory usage excessive' };
        }
        
        return { valid: true };
    }

    cleanupExpiredStates() {
        const now = Date.now();
        const expiredStates = [];
        
        for (const [stateId, record] of this.stateStore.entries()) {
            if (now - record.timestamp > this.config.maxStateAge * 2) {
                expiredStates.push(stateId);
            }
        }
        
        expiredStates.forEach(stateId => {
            const record = this.stateStore.get(stateId);
            if (record) {
                const userStates = this.userStates.get(record.userId);
                if (userStates) {
                    userStates.delete(stateId);
                }
            }
            
            this.stateStore.delete(stateId);
            this.honeypots.delete(stateId);
        });
        
        if (expiredStates.length > 0) {
            this.logStateEvent('STATES_EXPIRED', {
                count: expiredStates.length,
                stateIds: expiredStates
            });
        }
    }

    cleanupVerificationCache() {
        if (this.verificationCache.size > this.config.cacheSize) {
            const entries = Array.from(this.verificationCache.entries());
            const toDelete = entries.slice(0, entries.length - this.config.cacheSize);
            toDelete.forEach(([key]) => this.verificationCache.delete(key));
        }
    }

    /**
     * Logging and monitoring
     */
    logStateEvent(event, data) {
        const logEntry = {
            timestamp: Date.now(),
            event,
            data,
            component: 'STATE_VERIFICATION'
        };
        
        console.log(`[STATE_VERIFICATION] ${event}:`, logEntry);
    }

    logSecurityEvent(event, data) {
        const logEntry = {
            timestamp: Date.now(),
            event,
            data,
            component: 'STATE_VERIFICATION',
            severity: this.getEventSeverity(event)
        };
        
        console.log(`[STATE_SECURITY] ${event}:`, logEntry);
    }

    getEventSeverity(event) {
        const highSeverityEvents = [
            'TAMPER_ATTEMPT',
            'USER_BLOCKED_TAMPERING',
            'SYSTEM_INTEGRITY_FAILURE',
            'PERIODIC_VERIFICATION_FAILED'
        ];
        
        const mediumSeverityEvents = [
            'STATE_CREATION_FAILED',
            'STATE_UPDATE_FAILED',
            'VERIFICATION_ERROR'
        ];
        
        if (highSeverityEvents.includes(event)) return 'HIGH';
        if (mediumSeverityEvents.includes(event)) return 'MEDIUM';
        return 'LOW';
    }

    /**
     * System status and reporting
     */
    getSystemStatus() {
        return {
            totalStates: this.stateStore.size,
            totalUsers: this.userStates.size,
            honeypots: this.honeypots.size,
            tamperAttempts: this.tamperAttempts.size,
            verificationCacheSize: this.verificationCache.size,
            blockedUsers: Array.from(this.tamperAttempts.values()).filter(r => r.blocked).length,
            systemHealth: this.calculateSystemHealth(),
            securityMetrics: this.getSecurityMetrics()
        };
    }

    calculateSystemHealth() {
        const totalStates = this.stateStore.size;
        if (totalStates === 0) return 'HEALTHY';
        
        const failedStates = Array.from(this.stateStore.values())
            .filter(record => record.verificationStatus === 'FAILED').length;
        
        const failureRate = failedStates / totalStates;
        
        if (failureRate > 0.1) return 'CRITICAL';
        if (failureRate > 0.05) return 'DEGRADED';
        if (failureRate > 0.01) return 'WARNING';
        return 'HEALTHY';
    }

    getSecurityMetrics() {
        const now = Date.now();
        const hourAgo = now - 3600000;
        
        const recentTamperAttempts = Array.from(this.tamperAttempts.values())
            .reduce((total, record) => {
                return total + record.attempts.filter(a => a.timestamp > hourAgo).length;
            }, 0);
        
        const recentVerificationFailures = Array.from(this.stateStore.values())
            .filter(record => {
                return record.tamperFlags.some(flag => flag.timestamp > hourAgo);
            }).length;
        
        return {
            recentTamperAttempts,
            recentVerificationFailures,
            averageVerificationTime: this.calculateAverageVerificationTime(),
            encryptionStrength: 'AES-256-GCM',
            signatureAlgorithm: 'HMAC-SHA256'
        };
    }

    calculateAverageVerificationTime() {
        // This would track actual verification times in production
        return 25; // milliseconds
    }
}

module.exports = StateVerificationSystem;
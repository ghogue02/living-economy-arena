/**
 * Anti-Duplication System - Prevents Item/Currency Exploits
 * Comprehensive system to prevent duplication of items, currency, and assets
 */

const crypto = require('crypto');

class AntiDuplicationSystem {
    constructor() {
        this.itemRegistry = new Map(); // itemId -> ItemRecord
        this.transactionHistory = new Map(); // transactionId -> Transaction
        this.userAssets = new Map(); // userId -> Set of itemIds
        this.pendingTransactions = new Map(); // transactionId -> PendingTransaction
        this.blacklistedItems = new Set();
        this.suspiciousUsers = new Set();
        
        // Configuration
        this.config = {
            maxPendingTransactions: 100,
            transactionTimeout: 60000, // 1 minute
            duplicateDetectionWindow: 300000, // 5 minutes
            maxItemsPerUser: 10000,
            checksumValidation: true,
            distributedVerification: true
        };

        // Start cleanup interval
        this.startCleanupInterval();
    }

    /**
     * Register a new item in the system
     */
    registerItem(itemData) {
        const itemId = this.generateSecureItemId(itemData);
        const timestamp = Date.now();
        
        // Create comprehensive item record
        const itemRecord = {
            id: itemId,
            type: itemData.type,
            properties: { ...itemData.properties },
            createdAt: timestamp,
            createdBy: itemData.createdBy,
            currentOwner: itemData.owner || itemData.createdBy,
            ownershipHistory: [{
                owner: itemData.owner || itemData.createdBy,
                timestamp,
                transactionId: null,
                event: 'CREATED'
            }],
            checksum: this.calculateItemChecksum(itemData),
            integrityHash: this.generateIntegrityHash(itemData, timestamp),
            verificationNodes: [],
            status: 'ACTIVE',
            metadata: {
                lastVerified: timestamp,
                verificationCount: 0,
                suspicionFlags: []
            }
        };

        // Validate item uniqueness
        if (this.itemRegistry.has(itemId)) {
            throw new Error(`Duplicate item registration attempt: ${itemId}`);
        }

        // Store item record
        this.itemRegistry.set(itemId, itemRecord);
        
        // Update user assets
        this.addItemToUser(itemRecord.currentOwner, itemId);

        // Log creation
        this.logSecurityEvent('ITEM_CREATED', {
            itemId,
            owner: itemRecord.currentOwner,
            checksum: itemRecord.checksum
        });

        return {
            itemId,
            success: true,
            checksum: itemRecord.checksum,
            integrityHash: itemRecord.integrityHash
        };
    }

    /**
     * Transfer item ownership with duplication protection
     */
    async transferItem(transferData) {
        const { itemId, fromUser, toUser, transactionId, signature } = transferData;
        
        // Validate transaction
        const validation = await this.validateTransfer(transferData);
        if (!validation.isValid) {
            throw new Error(`Transfer validation failed: ${validation.reason}`);
        }

        // Create pending transaction
        const pendingTransaction = {
            id: transactionId,
            itemId,
            fromUser,
            toUser,
            timestamp: Date.now(),
            signature,
            status: 'PENDING',
            verificationNodes: [],
            locks: new Set([itemId, fromUser, toUser])
        };

        this.pendingTransactions.set(transactionId, pendingTransaction);

        try {
            // Distributed verification
            if (this.config.distributedVerification) {
                await this.performDistributedVerification(pendingTransaction);
            }

            // Execute transfer
            await this.executeTransfer(pendingTransaction);

            // Clean up
            this.pendingTransactions.delete(transactionId);

            return {
                success: true,
                transactionId,
                timestamp: Date.now(),
                newChecksum: this.itemRegistry.get(itemId).checksum
            };

        } catch (error) {
            // Rollback on failure
            this.pendingTransactions.delete(transactionId);
            throw error;
        }
    }

    /**
     * Validate transfer to prevent duplication
     */
    async validateTransfer(transferData) {
        const { itemId, fromUser, toUser, transactionId } = transferData;

        // Check if item exists
        const item = this.itemRegistry.get(itemId);
        if (!item) {
            return { isValid: false, reason: 'Item does not exist' };
        }

        // Check if item is blacklisted
        if (this.blacklistedItems.has(itemId)) {
            return { isValid: false, reason: 'Item is blacklisted' };
        }

        // Check ownership
        if (item.currentOwner !== fromUser) {
            return { isValid: false, reason: 'Sender does not own the item' };
        }

        // Check if user has item in their assets
        const userAssets = this.userAssets.get(fromUser);
        if (!userAssets || !userAssets.has(itemId)) {
            return { isValid: false, reason: 'Item not found in sender assets' };
        }

        // Check for duplicate transaction
        if (this.transactionHistory.has(transactionId)) {
            return { isValid: false, reason: 'Duplicate transaction ID' };
        }

        // Check for pending transactions on this item
        const pendingOnItem = Array.from(this.pendingTransactions.values())
            .filter(tx => tx.itemId === itemId && tx.status === 'PENDING');
        
        if (pendingOnItem.length > 0) {
            return { isValid: false, reason: 'Item has pending transactions' };
        }

        // Check integrity
        const integrityCheck = this.verifyItemIntegrity(item);
        if (!integrityCheck.isValid) {
            return { isValid: false, reason: `Integrity check failed: ${integrityCheck.reason}` };
        }

        // Check for suspicious activity
        if (this.suspiciousUsers.has(fromUser) || this.suspiciousUsers.has(toUser)) {
            return { isValid: false, reason: 'Suspicious user activity detected' };
        }

        // Check transaction rate limits
        const recentTransactions = this.getRecentTransactionsByUser(fromUser);
        if (recentTransactions.length > 50) { // Max 50 transactions per 5 minutes
            return { isValid: false, reason: 'Transaction rate limit exceeded' };
        }

        return { isValid: true };
    }

    /**
     * Execute the actual transfer
     */
    async executeTransfer(pendingTransaction) {
        const { itemId, fromUser, toUser, transactionId } = pendingTransaction;
        const item = this.itemRegistry.get(itemId);
        const timestamp = Date.now();

        // Update item ownership
        item.currentOwner = toUser;
        item.ownershipHistory.push({
            owner: toUser,
            timestamp,
            transactionId,
            event: 'TRANSFER'
        });

        // Update checksums and integrity
        item.checksum = this.calculateItemChecksum({
            type: item.type,
            properties: item.properties,
            currentOwner: toUser
        });
        item.metadata.lastVerified = timestamp;
        item.metadata.verificationCount++;

        // Update user assets
        this.removeItemFromUser(fromUser, itemId);
        this.addItemToUser(toUser, itemId);

        // Record transaction
        this.transactionHistory.set(transactionId, {
            id: transactionId,
            itemId,
            fromUser,
            toUser,
            timestamp,
            type: 'TRANSFER',
            blockHash: this.generateBlockHash(pendingTransaction),
            verified: true
        });

        // Log security event
        this.logSecurityEvent('ITEM_TRANSFERRED', {
            itemId,
            fromUser,
            toUser,
            transactionId,
            newChecksum: item.checksum
        });
    }

    /**
     * Verify item integrity to prevent tampering
     */
    verifyItemIntegrity(item) {
        // Recalculate checksum
        const currentChecksum = this.calculateItemChecksum({
            type: item.type,
            properties: item.properties,
            currentOwner: item.currentOwner
        });

        if (currentChecksum !== item.checksum) {
            this.flagSuspiciousActivity(item.currentOwner, 'CHECKSUM_MISMATCH');
            return { 
                isValid: false, 
                reason: 'Checksum mismatch - possible tampering detected' 
            };
        }

        // Verify ownership history chain
        const ownershipVerification = this.verifyOwnershipChain(item);
        if (!ownershipVerification.isValid) {
            return ownershipVerification;
        }

        // Check for impossible timestamps
        const timeVerification = this.verifyTimestamps(item);
        if (!timeVerification.isValid) {
            return timeVerification;
        }

        return { isValid: true };
    }

    /**
     * Detect duplication attempts
     */
    detectDuplicationAttempt(itemData) {
        const checksum = this.calculateItemChecksum(itemData);
        
        // Look for items with identical checksums but different IDs
        const duplicates = Array.from(this.itemRegistry.values())
            .filter(item => item.checksum === checksum && item.id !== itemData.id);

        if (duplicates.length > 0) {
            // Potential duplication detected
            this.logSecurityEvent('DUPLICATION_ATTEMPT', {
                originalItems: duplicates.map(d => d.id),
                attemptedItem: itemData.id,
                checksum
            });

            // Flag all involved users
            duplicates.forEach(duplicate => {
                this.flagSuspiciousActivity(duplicate.currentOwner, 'DUPLICATION_ATTEMPT');
            });

            return {
                isDuplicate: true,
                originalItems: duplicates,
                confidence: 0.95
            };
        }

        return { isDuplicate: false };
    }

    /**
     * Perform distributed verification across multiple nodes
     */
    async performDistributedVerification(transaction) {
        // This would integrate with multiple verification nodes
        // For now, implementing local verification with consensus simulation
        
        const verificationResults = [];
        const nodeCount = 3; // Simulate 3 verification nodes

        for (let i = 0; i < nodeCount; i++) {
            const result = await this.simulateNodeVerification(transaction, i);
            verificationResults.push(result);
        }

        const consensus = verificationResults.filter(r => r.verified).length;
        const requiredConsensus = Math.ceil(nodeCount / 2);

        if (consensus < requiredConsensus) {
            throw new Error('Distributed verification failed - insufficient consensus');
        }

        transaction.verificationNodes = verificationResults;
        return true;
    }

    async simulateNodeVerification(transaction, nodeId) {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));

        const item = this.itemRegistry.get(transaction.itemId);
        const isValid = this.verifyItemIntegrity(item).isValid;

        return {
            nodeId,
            verified: isValid,
            timestamp: Date.now(),
            signature: this.generateNodeSignature(transaction, nodeId)
        };
    }

    /**
     * Generate cryptographically secure item ID
     */
    generateSecureItemId(itemData) {
        const dataString = JSON.stringify({
            type: itemData.type,
            properties: itemData.properties,
            createdBy: itemData.createdBy,
            timestamp: Date.now(),
            nonce: crypto.randomBytes(16).toString('hex')
        });
        
        return crypto.createHash('sha256').update(dataString).digest('hex');
    }

    /**
     * Calculate item checksum for integrity verification
     */
    calculateItemChecksum(itemData) {
        const normalizedData = JSON.stringify({
            type: itemData.type,
            properties: this.normalizeProperties(itemData.properties),
            currentOwner: itemData.currentOwner
        });
        
        return crypto.createHash('md5').update(normalizedData).digest('hex');
    }

    /**
     * Generate integrity hash for additional security
     */
    generateIntegrityHash(itemData, timestamp) {
        const secretKey = this.getSystemSecretKey();
        const dataString = JSON.stringify({ ...itemData, timestamp });
        
        return crypto.createHmac('sha256', secretKey).update(dataString).digest('hex');
    }

    /**
     * Generate block hash for transaction immutability
     */
    generateBlockHash(transaction) {
        const blockData = JSON.stringify({
            transactionId: transaction.id,
            itemId: transaction.itemId,
            fromUser: transaction.fromUser,
            toUser: transaction.toUser,
            timestamp: transaction.timestamp,
            previousHash: this.getLastBlockHash()
        });
        
        return crypto.createHash('sha256').update(blockData).digest('hex');
    }

    /**
     * Normalize properties for consistent checksums
     */
    normalizeProperties(properties) {
        if (!properties || typeof properties !== 'object') return {};
        
        const normalized = {};
        Object.keys(properties).sort().forEach(key => {
            if (typeof properties[key] === 'object') {
                normalized[key] = this.normalizeProperties(properties[key]);
            } else {
                normalized[key] = properties[key];
            }
        });
        
        return normalized;
    }

    /**
     * Verify ownership chain integrity
     */
    verifyOwnershipChain(item) {
        const history = item.ownershipHistory;
        
        if (history.length === 0) {
            return { isValid: false, reason: 'No ownership history' };
        }

        // Verify first entry is creation
        if (history[0].event !== 'CREATED') {
            return { isValid: false, reason: 'Invalid ownership chain start' };
        }

        // Verify chronological order
        for (let i = 1; i < history.length; i++) {
            if (history[i].timestamp <= history[i-1].timestamp) {
                return { isValid: false, reason: 'Invalid timestamp order' };
            }
        }

        // Verify current owner matches last entry
        const lastEntry = history[history.length - 1];
        if (lastEntry.owner !== item.currentOwner) {
            return { isValid: false, reason: 'Current owner mismatch' };
        }

        return { isValid: true };
    }

    /**
     * Verify timestamps for impossible values
     */
    verifyTimestamps(item) {
        const now = Date.now();
        const creationTime = item.createdAt;

        // Check if creation time is in the future
        if (creationTime > now + 60000) { // 1 minute tolerance
            return { isValid: false, reason: 'Creation time in future' };
        }

        // Check ownership history timestamps
        for (const entry of item.ownershipHistory) {
            if (entry.timestamp > now + 60000) {
                return { isValid: false, reason: 'Ownership history timestamp in future' };
            }
            if (entry.timestamp < creationTime) {
                return { isValid: false, reason: 'Ownership history before creation' };
            }
        }

        return { isValid: true };
    }

    /**
     * Add item to user's asset list
     */
    addItemToUser(userId, itemId) {
        if (!this.userAssets.has(userId)) {
            this.userAssets.set(userId, new Set());
        }
        
        const userItems = this.userAssets.get(userId);
        
        // Check user item limit
        if (userItems.size >= this.config.maxItemsPerUser) {
            throw new Error('User item limit exceeded');
        }
        
        userItems.add(itemId);
    }

    /**
     * Remove item from user's asset list
     */
    removeItemFromUser(userId, itemId) {
        const userItems = this.userAssets.get(userId);
        if (userItems) {
            userItems.delete(itemId);
        }
    }

    /**
     * Get recent transactions by user
     */
    getRecentTransactionsByUser(userId) {
        const cutoff = Date.now() - this.config.duplicateDetectionWindow;
        return Array.from(this.transactionHistory.values())
            .filter(tx => (tx.fromUser === userId || tx.toUser === userId) && tx.timestamp > cutoff);
    }

    /**
     * Flag suspicious activity
     */
    flagSuspiciousActivity(userId, reason) {
        this.suspiciousUsers.add(userId);
        this.logSecurityEvent('SUSPICIOUS_ACTIVITY', { userId, reason });
        
        // Auto-blacklist items owned by highly suspicious users
        if (this.getSuspicionLevel(userId) > 0.8) {
            const userItems = this.userAssets.get(userId);
            if (userItems) {
                userItems.forEach(itemId => this.blacklistedItems.add(itemId));
            }
        }
    }

    /**
     * Get user suspicion level
     */
    getSuspicionLevel(userId) {
        // Implementation would track multiple factors
        return this.suspiciousUsers.has(userId) ? 0.7 : 0.1;
    }

    /**
     * Security event logging
     */
    logSecurityEvent(event, data) {
        const logEntry = {
            timestamp: Date.now(),
            event,
            data,
            severity: this.getEventSeverity(event)
        };
        
        // In production, this would send to security monitoring system
        console.log(`[SECURITY] ${event}:`, logEntry);
    }

    getEventSeverity(event) {
        const severityMap = {
            'ITEM_CREATED': 'INFO',
            'ITEM_TRANSFERRED': 'INFO',
            'DUPLICATION_ATTEMPT': 'HIGH',
            'SUSPICIOUS_ACTIVITY': 'MEDIUM',
            'CHECKSUM_MISMATCH': 'HIGH'
        };
        return severityMap[event] || 'MEDIUM';
    }

    /**
     * Utility methods
     */
    getSystemSecretKey() {
        // In production, this would be securely managed
        return process.env.SYSTEM_SECRET_KEY || 'default-secret-key-change-me';
    }

    getLastBlockHash() {
        // Implementation would maintain blockchain-like hash chain
        return crypto.createHash('sha256').update('genesis').digest('hex');
    }

    generateNodeSignature(transaction, nodeId) {
        const data = JSON.stringify({ transaction, nodeId, timestamp: Date.now() });
        return crypto.createHash('sha256').update(data).digest('hex');
    }

    /**
     * Cleanup expired pending transactions
     */
    startCleanupInterval() {
        setInterval(() => {
            const now = Date.now();
            const expired = Array.from(this.pendingTransactions.entries())
                .filter(([_, tx]) => now - tx.timestamp > this.config.transactionTimeout);
            
            expired.forEach(([txId, _]) => {
                this.pendingTransactions.delete(txId);
                this.logSecurityEvent('TRANSACTION_EXPIRED', { transactionId: txId });
            });
        }, 30000); // Clean up every 30 seconds
    }

    /**
     * Get comprehensive system status
     */
    getSystemStatus() {
        return {
            totalItems: this.itemRegistry.size,
            totalTransactions: this.transactionHistory.size,
            pendingTransactions: this.pendingTransactions.size,
            blacklistedItems: this.blacklistedItems.size,
            suspiciousUsers: this.suspiciousUsers.size,
            totalUsers: this.userAssets.size,
            systemHealth: this.calculateSystemHealth()
        };
    }

    calculateSystemHealth() {
        const suspiciousRatio = this.suspiciousUsers.size / Math.max(this.userAssets.size, 1);
        const blacklistRatio = this.blacklistedItems.size / Math.max(this.itemRegistry.size, 1);
        
        if (suspiciousRatio > 0.1 || blacklistRatio > 0.05) {
            return 'DEGRADED';
        } else if (suspiciousRatio > 0.05 || blacklistRatio > 0.02) {
            return 'WARNING';
        }
        return 'HEALTHY';
    }
}

module.exports = AntiDuplicationSystem;
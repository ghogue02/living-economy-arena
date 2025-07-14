/**
 * State Sharding System for Living Economy Arena
 * Horizontal scaling across servers with distributed state management
 */

const crypto = require('crypto');
const redis = require('redis');
const EventEmitter = require('events');

class StateShardingSystem extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.nodeId = config.nodeId || this.generateNodeId();
        this.totalShards = config.totalShards || 16;
        this.replicationFactor = config.replicationFactor || 3;
        this.consistencyLevel = config.consistencyLevel || 'eventual'; // 'strong', 'eventual', 'weak'
        
        this.shards = new Map();
        this.shardRing = [];
        this.replicaNodes = new Map();
        this.partitionMap = new Map();
        
        this.redisCluster = null;
        this.heartbeatInterval = null;
        this.syncInterval = null;
        
        this.metrics = {
            shardsManaged: 0,
            replicasManaged: 0,
            operationsPerSecond: 0,
            averageLatency: 0,
            consistencyViolations: 0,
            networkPartitions: 0
        };
        
        this.pendingOperations = new Map();
        this.vectorClocks = new Map();
        
        this.initializeSharding(config);
    }

    async initializeSharding(config) {
        try {
            // Initialize Redis cluster for distributed state
            this.redisCluster = redis.createCluster({
                rootNodes: config.redisNodes || [
                    { host: 'localhost', port: 7000 },
                    { host: 'localhost', port: 7001 },
                    { host: 'localhost', port: 7002 }
                ],
                defaults: {
                    password: config.redisPassword
                }
            });

            await this.redisCluster.connect();
            
            // Build consistent hash ring
            this.buildConsistentHashRing();
            
            // Initialize owned shards
            this.assignShards();
            
            // Start background processes
            this.startHeartbeat();
            this.startSyncProcess();
            this.setupClusterEventHandlers();
            
            console.log(`State Sharding initialized for node ${this.nodeId}`);
            console.log(`Managing ${this.shards.size} shards with ${this.replicationFactor} replicas each`);
            
            this.emit('ready');
            
        } catch (error) {
            console.error('State Sharding initialization failed:', error);
            this.emit('error', error);
        }
    }

    generateNodeId() {
        return `node-${crypto.randomBytes(8).toString('hex')}-${Date.now()}`;
    }

    buildConsistentHashRing() {
        // Build consistent hash ring for even distribution
        this.shardRing = [];
        
        for (let i = 0; i < this.totalShards; i++) {
            const virtualNodes = 150; // Virtual nodes per shard for better distribution
            
            for (let v = 0; v < virtualNodes; v++) {
                const hash = crypto.createHash('sha256')
                    .update(`shard-${i}-vnode-${v}`)
                    .digest('hex');
                
                this.shardRing.push({
                    hash,
                    shardId: i,
                    virtualNode: v
                });
            }
        }
        
        // Sort by hash for consistent ring ordering
        this.shardRing.sort((a, b) => a.hash.localeCompare(b.hash));
        
        console.log(`Consistent hash ring built with ${this.shardRing.length} virtual nodes`);
    }

    assignShards() {
        // Determine which shards this node is responsible for
        const nodesPerShard = Math.ceil(this.totalShards / 4); // Assume 4 nodes for demo
        const nodeIndex = parseInt(this.nodeId.split('-')[2], 16) % 4;
        
        for (let i = 0; i < this.totalShards; i++) {
            if (i % 4 === nodeIndex) {
                this.shards.set(i, {
                    id: i,
                    state: new Map(),
                    lastModified: Date.now(),
                    version: 0,
                    replicas: this.findReplicaNodes(i),
                    isActive: true,
                    operationLog: []
                });
                
                this.metrics.shardsManaged++;
            }
        }
        
        // Also handle replicas for other shards
        this.assignReplicas();
    }

    assignReplicas() {
        for (let i = 0; i < this.totalShards; i++) {
            if (!this.shards.has(i)) {
                const primaryNode = this.findPrimaryNode(i);
                if (this.shouldHoldReplica(i)) {
                    this.replicaNodes.set(i, {
                        id: i,
                        primaryNode,
                        state: new Map(),
                        lastSync: Date.now(),
                        version: 0,
                        isReplica: true
                    });
                    
                    this.metrics.replicasManaged++;
                }
            }
        }
    }

    findReplicaNodes(shardId) {
        // Find nodes that should hold replicas for this shard
        const replicas = [];
        const shardHash = crypto.createHash('sha256').update(`shard-${shardId}`).digest('hex');
        
        // Find position in ring
        let ringPosition = this.shardRing.findIndex(node => node.hash >= shardHash);
        if (ringPosition === -1) ringPosition = 0;
        
        // Select next N nodes for replicas
        for (let i = 1; i <= this.replicationFactor; i++) {
            const replicaPosition = (ringPosition + i) % this.shardRing.length;
            const replicaShardId = this.shardRing[replicaPosition].shardId;
            replicas.push(`node-for-shard-${replicaShardId}`);
        }
        
        return replicas;
    }

    findPrimaryNode(shardId) {
        const shardHash = crypto.createHash('sha256').update(`shard-${shardId}`).digest('hex');
        let ringPosition = this.shardRing.findIndex(node => node.hash >= shardHash);
        if (ringPosition === -1) ringPosition = 0;
        
        return `node-for-shard-${this.shardRing[ringPosition].shardId}`;
    }

    shouldHoldReplica(shardId) {
        // Determine if this node should hold a replica for the given shard
        const replicaNodes = this.findReplicaNodes(shardId);
        return replicaNodes.some(nodeId => nodeId.includes(this.nodeId.split('-')[2]));
    }

    // Core sharding operations
    async set(key, value, options = {}) {
        const shardId = this.getShardForKey(key);
        const shard = this.shards.get(shardId);
        
        if (!shard) {
            // Forward to appropriate node
            return this.forwardOperation('set', shardId, { key, value, options });
        }
        
        const startTime = Date.now();
        
        try {
            // Update vector clock
            this.updateVectorClock(shardId, key);
            
            // Create operation
            const operation = {
                type: 'set',
                key,
                value,
                timestamp: Date.now(),
                version: shard.version + 1,
                vectorClock: this.getVectorClock(shardId, key),
                nodeId: this.nodeId
            };
            
            // Apply operation locally
            shard.state.set(key, {
                value,
                version: operation.version,
                timestamp: operation.timestamp,
                vectorClock: operation.vectorClock
            });
            
            shard.version++;
            shard.lastModified = Date.now();
            shard.operationLog.push(operation);
            
            // Replicate to other nodes
            if (options.replicate !== false) {
                await this.replicateOperation(shardId, operation);
            }
            
            // Persist to Redis for durability
            if (options.persist !== false) {
                await this.persistShardState(shardId);
            }
            
            this.updateMetrics('set', Date.now() - startTime);
            
            return {
                success: true,
                version: operation.version,
                shardId,
                latency: Date.now() - startTime
            };
            
        } catch (error) {
            console.error(`Set operation failed for key ${key}:`, error);
            throw error;
        }
    }

    async get(key, options = {}) {
        const shardId = this.getShardForKey(key);
        const shard = this.shards.get(shardId);
        
        if (!shard) {
            // Try replica first
            const replica = this.replicaNodes.get(shardId);
            if (replica) {
                const result = replica.state.get(key);
                return result ? result.value : null;
            }
            
            // Forward to appropriate node
            return this.forwardOperation('get', shardId, { key, options });
        }
        
        const startTime = Date.now();
        
        try {
            const result = shard.state.get(key);
            
            if (!result) {
                return null;
            }
            
            // Check consistency requirements
            if (options.consistencyLevel === 'strong') {
                await this.verifyStrongConsistency(shardId, key, result);
            }
            
            this.updateMetrics('get', Date.now() - startTime);
            
            return {
                value: result.value,
                version: result.version,
                timestamp: result.timestamp,
                shardId,
                fromReplica: false
            };
            
        } catch (error) {
            console.error(`Get operation failed for key ${key}:`, error);
            throw error;
        }
    }

    async delete(key, options = {}) {
        const shardId = this.getShardForKey(key);
        const shard = this.shards.get(shardId);
        
        if (!shard) {
            return this.forwardOperation('delete', shardId, { key, options });
        }
        
        const startTime = Date.now();
        
        try {
            const operation = {
                type: 'delete',
                key,
                timestamp: Date.now(),
                version: shard.version + 1,
                vectorClock: this.getVectorClock(shardId, key),
                nodeId: this.nodeId
            };
            
            shard.state.delete(key);
            shard.version++;
            shard.lastModified = Date.now();
            shard.operationLog.push(operation);
            
            // Replicate deletion
            if (options.replicate !== false) {
                await this.replicateOperation(shardId, operation);
            }
            
            this.updateMetrics('delete', Date.now() - startTime);
            
            return {
                success: true,
                version: operation.version,
                shardId
            };
            
        } catch (error) {
            console.error(`Delete operation failed for key ${key}:`, error);
            throw error;
        }
    }

    async batchOperation(operations) {
        // Group operations by shard for efficiency
        const shardGroups = new Map();
        
        operations.forEach(op => {
            const shardId = this.getShardForKey(op.key);
            if (!shardGroups.has(shardId)) {
                shardGroups.set(shardId, []);
            }
            shardGroups.get(shardId).push(op);
        });
        
        // Execute operations in parallel by shard
        const promises = Array.from(shardGroups.entries()).map(([shardId, ops]) => {
            return this.executeBatchForShard(shardId, ops);
        });
        
        const results = await Promise.all(promises);
        return results.flat();
    }

    async executeBatchForShard(shardId, operations) {
        const shard = this.shards.get(shardId);
        if (!shard) {
            return this.forwardBatchOperation(shardId, operations);
        }
        
        const startTime = Date.now();
        const results = [];
        
        try {
            // Execute all operations in a single transaction
            for (const op of operations) {
                const operation = {
                    type: op.type,
                    key: op.key,
                    value: op.value,
                    timestamp: Date.now(),
                    version: shard.version + 1,
                    vectorClock: this.getVectorClock(shardId, op.key),
                    nodeId: this.nodeId
                };
                
                switch (op.type) {
                    case 'set':
                        shard.state.set(op.key, {
                            value: op.value,
                            version: operation.version,
                            timestamp: operation.timestamp,
                            vectorClock: operation.vectorClock
                        });
                        break;
                    case 'delete':
                        shard.state.delete(op.key);
                        break;
                }
                
                shard.version++;
                shard.operationLog.push(operation);
                results.push({
                    success: true,
                    operation: op,
                    version: operation.version
                });
            }
            
            shard.lastModified = Date.now();
            
            // Replicate all operations
            await this.replicateBatch(shardId, shard.operationLog.slice(-operations.length));
            
            this.updateMetrics('batch', Date.now() - startTime);
            
            return results;
            
        } catch (error) {
            console.error(`Batch operation failed for shard ${shardId}:`, error);
            throw error;
        }
    }

    getShardForKey(key) {
        // Use consistent hashing to determine shard
        const hash = crypto.createHash('sha256').update(key).digest('hex');
        
        // Find position in ring
        let position = this.shardRing.findIndex(node => node.hash >= hash);
        if (position === -1) position = 0;
        
        return this.shardRing[position].shardId;
    }

    updateVectorClock(shardId, key) {
        const clockKey = `${shardId}:${key}`;
        if (!this.vectorClocks.has(clockKey)) {
            this.vectorClocks.set(clockKey, new Map());
        }
        
        const clock = this.vectorClocks.get(clockKey);
        clock.set(this.nodeId, (clock.get(this.nodeId) || 0) + 1);
    }

    getVectorClock(shardId, key) {
        const clockKey = `${shardId}:${key}`;
        const clock = this.vectorClocks.get(clockKey);
        return clock ? Object.fromEntries(clock) : { [this.nodeId]: 1 };
    }

    async replicateOperation(shardId, operation) {
        const shard = this.shards.get(shardId);
        if (!shard || !shard.replicas) return;
        
        const replicationPromises = shard.replicas.map(async (replicaNode) => {
            try {
                await this.sendToReplica(replicaNode, {
                    type: 'replicate',
                    shardId,
                    operation
                });
            } catch (error) {
                console.error(`Replication failed to node ${replicaNode}:`, error);
                this.metrics.consistencyViolations++;
            }
        });
        
        // Wait for majority of replicas to acknowledge
        const required = Math.ceil(shard.replicas.length / 2);
        const settled = await Promise.allSettled(replicationPromises);
        const successful = settled.filter(result => result.status === 'fulfilled').length;
        
        if (successful < required && this.consistencyLevel === 'strong') {
            throw new Error('Failed to achieve required consistency level');
        }
    }

    async replicateBatch(shardId, operations) {
        const shard = this.shards.get(shardId);
        if (!shard || !shard.replicas) return;
        
        const replicationPromises = shard.replicas.map(async (replicaNode) => {
            try {
                await this.sendToReplica(replicaNode, {
                    type: 'replicate_batch',
                    shardId,
                    operations
                });
            } catch (error) {
                console.error(`Batch replication failed to node ${replicaNode}:`, error);
            }
        });
        
        await Promise.allSettled(replicationPromises);
    }

    async sendToReplica(replicaNode, message) {
        // In a real implementation, this would use network communication
        // For now, we'll use Redis pub/sub
        return this.redisCluster.publish(`replica:${replicaNode}`, JSON.stringify(message));
    }

    async forwardOperation(operation, shardId, args) {
        // Forward operation to the correct node
        const primaryNode = this.findPrimaryNode(shardId);
        
        // Use Redis to forward the operation
        const message = {
            operation,
            args,
            fromNode: this.nodeId,
            timestamp: Date.now()
        };
        
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Operation forwarding timeout'));
            }, 5000);
            
            this.redisCluster.publish(`forward:${primaryNode}`, JSON.stringify(message));
            
            // Listen for response
            const responseKey = `response:${this.nodeId}:${Date.now()}`;
            this.redisCluster.subscribe(responseKey, (response) => {
                clearTimeout(timeout);
                resolve(JSON.parse(response));
            });
        });
    }

    async forwardBatchOperation(shardId, operations) {
        const primaryNode = this.findPrimaryNode(shardId);
        const message = {
            operation: 'batch',
            args: { operations },
            fromNode: this.nodeId,
            timestamp: Date.now()
        };
        
        return this.sendAndWaitForResponse(`forward:${primaryNode}`, message);
    }

    async verifyStrongConsistency(shardId, key, localValue) {
        // Verify that majority of replicas have the same value
        const shard = this.shards.get(shardId);
        if (!shard || !shard.replicas) return true;
        
        const consistencyChecks = shard.replicas.map(async (replicaNode) => {
            try {
                const response = await this.sendAndWaitForResponse(`consistency:${replicaNode}`, {
                    type: 'verify',
                    shardId,
                    key,
                    expectedVersion: localValue.version
                });
                return response.consistent;
            } catch (error) {
                return false;
            }
        });
        
        const results = await Promise.allSettled(consistencyChecks);
        const consistent = results.filter(r => r.status === 'fulfilled' && r.value).length;
        const required = Math.ceil(shard.replicas.length / 2);
        
        if (consistent < required) {
            this.metrics.consistencyViolations++;
            throw new Error('Strong consistency requirements not met');
        }
        
        return true;
    }

    async sendAndWaitForResponse(channel, message) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error('Operation timeout'));
            }, 5000);
            
            const responseKey = `response:${this.nodeId}:${Date.now()}`;
            message.responseKey = responseKey;
            
            this.redisCluster.subscribe(responseKey, (response) => {
                clearTimeout(timeout);
                resolve(JSON.parse(response));
            });
            
            this.redisCluster.publish(channel, JSON.stringify(message));
        });
    }

    async persistShardState(shardId) {
        const shard = this.shards.get(shardId);
        if (!shard) return;
        
        const stateSnapshot = {
            shardId,
            version: shard.version,
            lastModified: shard.lastModified,
            state: Object.fromEntries(shard.state),
            operationLog: shard.operationLog.slice(-1000) // Keep last 1000 operations
        };
        
        await this.redisCluster.set(
            `shard:${shardId}:state`,
            JSON.stringify(stateSnapshot),
            'EX',
            3600 // 1 hour TTL
        );
    }

    startHeartbeat() {
        this.heartbeatInterval = setInterval(async () => {
            try {
                const heartbeat = {
                    nodeId: this.nodeId,
                    timestamp: Date.now(),
                    shardsManaged: Array.from(this.shards.keys()),
                    replicasManaged: Array.from(this.replicaNodes.keys()),
                    metrics: this.metrics
                };
                
                await this.redisCluster.setex(
                    `heartbeat:${this.nodeId}`,
                    30, // 30 second TTL
                    JSON.stringify(heartbeat)
                );
                
                this.emit('heartbeat', heartbeat);
                
            } catch (error) {
                console.error('Heartbeat failed:', error);
            }
        }, 10000); // 10 second heartbeat
    }

    startSyncProcess() {
        this.syncInterval = setInterval(async () => {
            try {
                await this.syncShards();
                await this.syncReplicas();
                await this.detectPartitions();
            } catch (error) {
                console.error('Sync process failed:', error);
            }
        }, 30000); // 30 second sync
    }

    async syncShards() {
        for (const [shardId, shard] of this.shards) {
            if (Date.now() - shard.lastModified > 60000) { // 1 minute threshold
                await this.persistShardState(shardId);
            }
        }
    }

    async syncReplicas() {
        for (const [shardId, replica] of this.replicaNodes) {
            if (Date.now() - replica.lastSync > 30000) { // 30 second threshold
                await this.syncReplicaWithPrimary(shardId);
            }
        }
    }

    async syncReplicaWithPrimary(shardId) {
        const replica = this.replicaNodes.get(shardId);
        if (!replica) return;
        
        try {
            const response = await this.sendAndWaitForResponse(`sync:${replica.primaryNode}`, {
                type: 'sync_request',
                shardId,
                currentVersion: replica.version
            });
            
            if (response.operations && response.operations.length > 0) {
                // Apply missing operations
                for (const operation of response.operations) {
                    this.applyReplicaOperation(shardId, operation);
                }
                
                replica.lastSync = Date.now();
                replica.version = response.latestVersion;
            }
            
        } catch (error) {
            console.error(`Replica sync failed for shard ${shardId}:`, error);
        }
    }

    applyReplicaOperation(shardId, operation) {
        const replica = this.replicaNodes.get(shardId);
        if (!replica) return;
        
        switch (operation.type) {
            case 'set':
                replica.state.set(operation.key, {
                    value: operation.value,
                    version: operation.version,
                    timestamp: operation.timestamp,
                    vectorClock: operation.vectorClock
                });
                break;
            case 'delete':
                replica.state.delete(operation.key);
                break;
        }
    }

    async detectPartitions() {
        // Check for network partitions by monitoring heartbeats
        const activeNodes = await this.redisCluster.keys('heartbeat:*');
        const currentTime = Date.now();
        
        let partitionDetected = false;
        
        for (const nodeKey of activeNodes) {
            try {
                const heartbeat = JSON.parse(await this.redisCluster.get(nodeKey));
                if (currentTime - heartbeat.timestamp > 60000) { // 1 minute threshold
                    console.warn(`Potential partition detected: ${heartbeat.nodeId} last seen ${new Date(heartbeat.timestamp)}`);
                    partitionDetected = true;
                }
            } catch (error) {
                // Node data corrupted or unavailable
                partitionDetected = true;
            }
        }
        
        if (partitionDetected) {
            this.metrics.networkPartitions++;
            this.emit('partition_detected');
        }
    }

    setupClusterEventHandlers() {
        // Handle incoming replica operations
        this.redisCluster.subscribe(`replica:${this.nodeId}`, (message) => {
            try {
                const data = JSON.parse(message);
                this.handleReplicaMessage(data);
            } catch (error) {
                console.error('Failed to handle replica message:', error);
            }
        });
        
        // Handle forwarded operations
        this.redisCluster.subscribe(`forward:${this.nodeId}`, (message) => {
            try {
                const data = JSON.parse(message);
                this.handleForwardedOperation(data);
            } catch (error) {
                console.error('Failed to handle forwarded operation:', error);
            }
        });
        
        // Handle consistency checks
        this.redisCluster.subscribe(`consistency:${this.nodeId}`, (message) => {
            try {
                const data = JSON.parse(message);
                this.handleConsistencyCheck(data);
            } catch (error) {
                console.error('Failed to handle consistency check:', error);
            }
        });
    }

    handleReplicaMessage(data) {
        if (data.type === 'replicate') {
            this.applyReplicaOperation(data.shardId, data.operation);
        } else if (data.type === 'replicate_batch') {
            data.operations.forEach(op => {
                this.applyReplicaOperation(data.shardId, op);
            });
        }
    }

    async handleForwardedOperation(data) {
        try {
            let result;
            
            switch (data.operation) {
                case 'set':
                    result = await this.set(data.args.key, data.args.value, data.args.options);
                    break;
                case 'get':
                    result = await this.get(data.args.key, data.args.options);
                    break;
                case 'delete':
                    result = await this.delete(data.args.key, data.args.options);
                    break;
                case 'batch':
                    result = await this.batchOperation(data.args.operations);
                    break;
            }
            
            // Send response back
            if (data.responseKey) {
                this.redisCluster.publish(data.responseKey, JSON.stringify(result));
            }
            
        } catch (error) {
            if (data.responseKey) {
                this.redisCluster.publish(data.responseKey, JSON.stringify({ error: error.message }));
            }
        }
    }

    async handleConsistencyCheck(data) {
        if (data.type === 'verify') {
            const replica = this.replicaNodes.get(data.shardId);
            if (replica) {
                const localData = replica.state.get(data.key);
                const consistent = localData && localData.version === data.expectedVersion;
                
                if (data.responseKey) {
                    this.redisCluster.publish(data.responseKey, JSON.stringify({ consistent }));
                }
            }
        }
    }

    updateMetrics(operation, latency) {
        this.metrics.operationsPerSecond++;
        this.metrics.averageLatency = (this.metrics.averageLatency * 0.9) + (latency * 0.1);
        
        // Reset operations counter every second
        if (!this.metricsResetTimer) {
            this.metricsResetTimer = setInterval(() => {
                this.metrics.operationsPerSecond = 0;
            }, 1000);
        }
    }

    getShardingMetrics() {
        return {
            ...this.metrics,
            nodeId: this.nodeId,
            totalShards: this.totalShards,
            shardsOwned: this.shards.size,
            replicasManaged: this.replicaNodes.size,
            vectorClocks: this.vectorClocks.size,
            ringSize: this.shardRing.length
        };
    }

    async shutdown() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
        
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        
        if (this.metricsResetTimer) {
            clearInterval(this.metricsResetTimer);
        }
        
        // Persist all shard states before shutdown
        for (const shardId of this.shards.keys()) {
            await this.persistShardState(shardId);
        }
        
        if (this.redisCluster) {
            await this.redisCluster.quit();
        }
        
        console.log(`State Sharding shutdown complete for node ${this.nodeId}`);
    }
}

module.exports = StateShardingSystem;
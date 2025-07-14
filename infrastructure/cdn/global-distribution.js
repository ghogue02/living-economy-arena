/**
 * Global CDN Distribution System for Living Economy Arena
 * Optimized market data distribution with <50ms latency worldwide
 */

const crypto = require('crypto');
const EventEmitter = require('events');

class GlobalCDNDistribution extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.regions = new Map();
        this.edgeServers = new Map();
        this.cacheHierarchy = new Map();
        this.routingTable = new Map();
        
        this.compressionStrategies = new Map();
        this.dataStreams = new Map();
        this.syncQueues = new Map();
        
        this.metrics = {
            globalLatency: new Map(),
            hitRates: new Map(),
            bandwidth: new Map(),
            edgeLoad: new Map(),
            compressionRatio: 0,
            activePushChannels: 0
        };
        
        this.config = {
            maxCacheSize: config.maxCacheSize || 2 * 1024 * 1024 * 1024, // 2GB per edge
            compressionLevel: config.compressionLevel || 6,
            ttlDefault: config.ttlDefault || 30000, // 30 seconds
            invalidationDelay: config.invalidationDelay || 100, // 100ms
            pushEnabled: config.pushEnabled !== false,
            ...config
        };
        
        this.initializeGlobalCDN();
    }

    initializeGlobalCDN() {
        // Define global edge server regions
        this.setupGlobalRegions();
        
        // Initialize edge servers for each region
        this.deployEdgeServers();
        
        // Setup data compression strategies
        this.initializeCompression();
        
        // Start real-time data streams
        this.initializeDataStreams();
        
        // Setup intelligent routing
        this.buildRoutingTable();
        
        console.log('Global CDN Distribution system initialized');
        console.log(`Deployed ${this.edgeServers.size} edge servers across ${this.regions.size} regions`);
        
        this.emit('ready');
    }

    setupGlobalRegions() {
        const regions = [
            // North America
            { id: 'us-east', name: 'US East', location: { lat: 39.0458, lng: -76.6413 }, capacity: 1000 },
            { id: 'us-west', name: 'US West', location: { lat: 37.7749, lng: -122.4194 }, capacity: 1000 },
            { id: 'us-central', name: 'US Central', location: { lat: 39.7392, lng: -104.9903 }, capacity: 800 },
            { id: 'canada', name: 'Canada', location: { lat: 43.6532, lng: -79.3832 }, capacity: 600 },
            
            // Europe
            { id: 'eu-west', name: 'EU West', location: { lat: 51.5074, lng: -0.1278 }, capacity: 1200 },
            { id: 'eu-central', name: 'EU Central', location: { lat: 52.5200, lng: 13.4050 }, capacity: 1000 },
            { id: 'eu-north', name: 'EU North', location: { lat: 59.3293, lng: 18.0686 }, capacity: 600 },
            
            // Asia Pacific
            { id: 'ap-northeast', name: 'AP Northeast', location: { lat: 35.6762, lng: 139.6503 }, capacity: 1500 },
            { id: 'ap-southeast', name: 'AP Southeast', location: { lat: 1.3521, lng: 103.8198 }, capacity: 1200 },
            { id: 'ap-south', name: 'AP South', location: { lat: 19.0760, lng: 72.8777 }, capacity: 1000 },
            { id: 'australia', name: 'Australia', location: { lat: -33.8688, lng: 151.2093 }, capacity: 800 },
            
            // Other regions
            { id: 'middle-east', name: 'Middle East', location: { lat: 25.2048, lng: 55.2708 }, capacity: 600 },
            { id: 'south-america', name: 'South America', location: { lat: -23.5505, lng: -46.6333 }, capacity: 700 },
            { id: 'africa', name: 'Africa', location: { lat: -26.2041, lng: 28.0473 }, capacity: 500 }
        ];
        
        regions.forEach(region => {
            this.regions.set(region.id, {
                ...region,
                edgeServers: [],
                totalLoad: 0,
                averageLatency: 0,
                status: 'active'
            });
        });
    }

    deployEdgeServers() {
        this.regions.forEach((region, regionId) => {
            // Deploy multiple edge servers per region based on capacity
            const serverCount = Math.ceil(region.capacity / 200); // 200 connections per server
            
            for (let i = 0; i < serverCount; i++) {
                const serverId = `${regionId}-edge-${i}`;
                const edgeServer = {
                    id: serverId,
                    regionId,
                    location: region.location,
                    cache: new Map(),
                    cacheSize: 0,
                    connections: 0,
                    maxConnections: 200,
                    lastUpdate: Date.now(),
                    compressionCache: new Map(),
                    streamChannels: new Map(),
                    status: 'active'
                };
                
                this.edgeServers.set(serverId, edgeServer);
                region.edgeServers.push(serverId);
            }
        });
    }

    initializeCompression() {
        // Market data compression strategies
        this.compressionStrategies.set('market_prices', {
            algorithm: 'delta_compression',
            precision: 4, // 4 decimal places for prices
            compressionRatio: 0.15 // 85% compression
        });
        
        this.compressionStrategies.set('trade_volumes', {
            algorithm: 'run_length_encoding',
            precision: 0, // Integer volumes
            compressionRatio: 0.3 // 70% compression
        });
        
        this.compressionStrategies.set('agent_positions', {
            algorithm: 'quantization',
            precision: 2, // 2 decimal places for positions
            compressionRatio: 0.25 // 75% compression
        });
        
        this.compressionStrategies.set('order_book', {
            algorithm: 'differential_encoding',
            precision: 4, // Price precision
            compressionRatio: 0.2 // 80% compression
        });
    }

    initializeDataStreams() {
        // Real-time market data streams
        const streamTypes = [
            'market_prices',
            'trade_executions', 
            'order_book_updates',
            'agent_positions',
            'economic_indicators',
            'volatility_data'
        ];
        
        streamTypes.forEach(streamType => {
            this.dataStreams.set(streamType, {
                type: streamType,
                frequency: this.getStreamFrequency(streamType),
                subscribers: new Map(),
                lastUpdate: Date.now(),
                compressionEnabled: true,
                priority: this.getStreamPriority(streamType)
            });
            
            this.syncQueues.set(streamType, []);
        });
        
        // Start stream processing
        this.startStreamProcessing();
    }

    getStreamFrequency(streamType) {
        const frequencies = {
            'market_prices': 100, // 10 updates per second
            'trade_executions': 50, // 20 updates per second
            'order_book_updates': 200, // 5 updates per second
            'agent_positions': 1000, // 1 update per second
            'economic_indicators': 5000, // Every 5 seconds
            'volatility_data': 1000 // 1 update per second
        };
        return frequencies[streamType] || 1000;
    }

    getStreamPriority(streamType) {
        const priorities = {
            'market_prices': 1, // Highest priority
            'trade_executions': 1,
            'order_book_updates': 2,
            'agent_positions': 3,
            'economic_indicators': 4,
            'volatility_data': 4
        };
        return priorities[streamType] || 5;
    }

    buildRoutingTable() {
        // Build optimized routing based on geographic proximity and latency
        this.edgeServers.forEach((server, serverId) => {
            const routes = new Map();
            
            // Calculate routes to all other servers
            this.edgeServers.forEach((targetServer, targetId) => {
                if (serverId !== targetId) {
                    const distance = this.calculateDistance(
                        server.location,
                        targetServer.location
                    );
                    
                    const estimatedLatency = this.estimateLatency(distance);
                    
                    routes.set(targetId, {
                        distance,
                        estimatedLatency,
                        hops: this.calculateHops(serverId, targetId),
                        bandwidth: this.estimateBandwidth(distance)
                    });
                }
            });
            
            // Sort routes by latency for optimal path selection
            const sortedRoutes = new Map([...routes.entries()].sort((a, b) => 
                a[1].estimatedLatency - b[1].estimatedLatency
            ));
            
            this.routingTable.set(serverId, sortedRoutes);
        });
    }

    calculateDistance(location1, location2) {
        // Haversine formula for great-circle distance
        const R = 6371; // Earth's radius in km
        const dLat = this.toRadians(location2.lat - location1.lat);
        const dLng = this.toRadians(location2.lng - location1.lng);
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(this.toRadians(location1.lat)) * Math.cos(this.toRadians(location2.lat)) *
                  Math.sin(dLng/2) * Math.sin(dLng/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    toRadians(degrees) {
        return degrees * (Math.PI / 180);
    }

    estimateLatency(distance) {
        // Base latency estimation: speed of light + processing delays
        const lightSpeedLatency = distance / 200000; // ~200,000 km/s through fiber
        const processingDelay = 5; // 5ms processing delay
        const routingDelay = distance / 10000; // Additional routing delay
        
        return lightSpeedLatency + processingDelay + routingDelay;
    }

    calculateHops(fromServerId, toServerId) {
        // Simplified hop calculation based on regions
        const fromRegion = this.edgeServers.get(fromServerId).regionId;
        const toRegion = this.edgeServers.get(toServerId).regionId;
        
        if (fromRegion === toRegion) return 1;
        
        // Inter-region hop calculation
        const regionDistance = {
            'us-east': { 'us-west': 2, 'eu-west': 2, 'ap-northeast': 3 },
            'eu-west': { 'ap-southeast': 3, 'middle-east': 2 },
            'ap-northeast': { 'australia': 2, 'ap-south': 2 }
        };
        
        return regionDistance[fromRegion]?.[toRegion] || 3;
    }

    estimateBandwidth(distance) {
        // Bandwidth estimation based on distance and connection type
        if (distance < 1000) return 10000; // 10 Gbps for local connections
        if (distance < 5000) return 5000;  // 5 Gbps for regional
        if (distance < 15000) return 1000; // 1 Gbps for continental
        return 500; // 500 Mbps for intercontinental
    }

    // Core CDN operations
    async distribute(dataType, data, options = {}) {
        const startTime = Date.now();
        
        try {
            // Compress data if enabled
            const compressedData = await this.compressData(dataType, data);
            
            // Determine distribution strategy
            const strategy = options.strategy || this.getDistributionStrategy(dataType);
            
            // Execute distribution based on strategy
            let results;
            switch (strategy) {
                case 'push_all':
                    results = await this.pushToAllEdges(dataType, compressedData, options);
                    break;
                case 'lazy_propagation':
                    results = await this.lazyPropagate(dataType, compressedData, options);
                    break;
                case 'intelligent_routing':
                    results = await this.intelligentDistribute(dataType, compressedData, options);
                    break;
                default:
                    results = await this.pushToAllEdges(dataType, compressedData, options);
            }
            
            // Update metrics
            this.updateDistributionMetrics(dataType, Date.now() - startTime, results);
            
            return {
                success: true,
                strategy,
                edgesUpdated: results.length,
                totalLatency: Date.now() - startTime,
                compressionRatio: compressedData.compressionRatio
            };
            
        } catch (error) {
            console.error(`Distribution failed for ${dataType}:`, error);
            throw error;
        }
    }

    async compressData(dataType, data) {
        const strategy = this.compressionStrategies.get(dataType);
        if (!strategy) {
            return { data, compressionRatio: 1.0, compressed: false };
        }
        
        const originalSize = JSON.stringify(data).length;
        let compressedData;
        
        switch (strategy.algorithm) {
            case 'delta_compression':
                compressedData = this.deltaCompress(data, strategy.precision);
                break;
            case 'run_length_encoding':
                compressedData = this.runLengthEncode(data);
                break;
            case 'quantization':
                compressedData = this.quantizeData(data, strategy.precision);
                break;
            case 'differential_encoding':
                compressedData = this.differentialEncode(data, strategy.precision);
                break;
            default:
                compressedData = data;
        }
        
        const compressedSize = JSON.stringify(compressedData).length;
        const compressionRatio = compressedSize / originalSize;
        
        return {
            data: compressedData,
            originalSize,
            compressedSize,
            compressionRatio,
            compressed: true,
            algorithm: strategy.algorithm
        };
    }

    deltaCompress(data, precision) {
        // Delta compression for price data
        if (!Array.isArray(data) || data.length === 0) return data;
        
        const compressed = [data[0]]; // Keep first value as reference
        
        for (let i = 1; i < data.length; i++) {
            const delta = data[i] - data[i-1];
            compressed.push(Math.round(delta * Math.pow(10, precision)) / Math.pow(10, precision));
        }
        
        return { type: 'delta', reference: data[0], deltas: compressed.slice(1) };
    }

    runLengthEncode(data) {
        // Run-length encoding for volume data
        if (!Array.isArray(data)) return data;
        
        const encoded = [];
        let currentValue = data[0];
        let count = 1;
        
        for (let i = 1; i < data.length; i++) {
            if (data[i] === currentValue) {
                count++;
            } else {
                encoded.push({ value: currentValue, count });
                currentValue = data[i];
                count = 1;
            }
        }
        
        encoded.push({ value: currentValue, count });
        return { type: 'rle', encoded };
    }

    quantizeData(data, precision) {
        // Quantization for position data
        const quantize = (value) => Math.round(value * Math.pow(10, precision)) / Math.pow(10, precision);
        
        if (Array.isArray(data)) {
            return data.map(item => {
                if (typeof item === 'object') {
                    const quantized = {};
                    for (const [key, value] of Object.entries(item)) {
                        quantized[key] = typeof value === 'number' ? quantize(value) : value;
                    }
                    return quantized;
                } else if (typeof item === 'number') {
                    return quantize(item);
                }
                return item;
            });
        }
        
        return data;
    }

    differentialEncode(data, precision) {
        // Differential encoding for order book data
        if (!data.bids || !data.asks) return data;
        
        const encodeBids = (bids) => {
            if (bids.length === 0) return [];
            
            const encoded = [bids[0]];
            for (let i = 1; i < bids.length; i++) {
                encoded.push([
                    bids[i][0] - bids[i-1][0], // Price difference
                    bids[i][1] // Volume (absolute)
                ]);
            }
            return encoded;
        };
        
        return {
            type: 'differential',
            bids: encodeBids(data.bids),
            asks: encodeBids(data.asks),
            timestamp: data.timestamp
        };
    }

    getDistributionStrategy(dataType) {
        const strategies = {
            'market_prices': 'push_all', // Critical data needs immediate distribution
            'trade_executions': 'push_all',
            'order_book_updates': 'intelligent_routing',
            'agent_positions': 'lazy_propagation',
            'economic_indicators': 'lazy_propagation',
            'volatility_data': 'intelligent_routing'
        };
        
        return strategies[dataType] || 'lazy_propagation';
    }

    async pushToAllEdges(dataType, compressedData, options) {
        const results = [];
        const promises = [];
        
        for (const [serverId, server] of this.edgeServers) {
            if (server.status === 'active') {
                promises.push(
                    this.updateEdgeCache(serverId, dataType, compressedData, options)
                        .then(result => ({ serverId, ...result }))
                        .catch(error => ({ serverId, error: error.message }))
                );
            }
        }
        
        const settled = await Promise.allSettled(promises);
        return settled.map(result => result.status === 'fulfilled' ? result.value : result.reason);
    }

    async lazyPropagate(dataType, compressedData, options) {
        // Only update origin region initially, propagate on demand
        const originRegion = options.originRegion || 'us-east';
        const region = this.regions.get(originRegion);
        
        if (!region) throw new Error(`Unknown origin region: ${originRegion}`);
        
        const results = [];
        
        // Update all servers in origin region
        for (const serverId of region.edgeServers) {
            try {
                const result = await this.updateEdgeCache(serverId, dataType, compressedData, options);
                results.push({ serverId, ...result });
            } catch (error) {
                results.push({ serverId, error: error.message });
            }
        }
        
        // Queue for lazy propagation to other regions
        this.queueForPropagation(dataType, compressedData, options, originRegion);
        
        return results;
    }

    async intelligentDistribute(dataType, compressedData, options) {
        // Distribute based on current load and subscriber patterns
        const results = [];
        const prioritizedServers = this.prioritizeServers(dataType);
        
        // Update high-priority servers first
        const highPriorityPromises = prioritizedServers.slice(0, 5).map(serverId =>
            this.updateEdgeCache(serverId, dataType, compressedData, options)
                .then(result => ({ serverId, ...result }))
                .catch(error => ({ serverId, error: error.message }))
        );
        
        const highPriorityResults = await Promise.all(highPriorityPromises);
        results.push(...highPriorityResults);
        
        // Update remaining servers in background
        this.backgroundUpdate(prioritizedServers.slice(5), dataType, compressedData, options);
        
        return results;
    }

    prioritizeServers(dataType) {
        const stream = this.dataStreams.get(dataType);
        if (!stream) return Array.from(this.edgeServers.keys());
        
        // Sort servers by subscriber count and load
        return Array.from(this.edgeServers.entries())
            .map(([serverId, server]) => ({
                serverId,
                score: this.calculateServerScore(serverId, dataType, server)
            }))
            .sort((a, b) => b.score - a.score)
            .map(item => item.serverId);
    }

    calculateServerScore(serverId, dataType, server) {
        const subscriberCount = this.dataStreams.get(dataType)?.subscribers.get(serverId) || 0;
        const loadFactor = 1 - (server.connections / server.maxConnections);
        const latencyFactor = 1 / (server.averageLatency || 50);
        
        return subscriberCount * loadFactor * latencyFactor;
    }

    async updateEdgeCache(serverId, dataType, compressedData, options) {
        const server = this.edgeServers.get(serverId);
        if (!server) throw new Error(`Server ${serverId} not found`);
        
        const startTime = Date.now();
        
        // Check cache capacity
        if (server.cacheSize >= this.config.maxCacheSize) {
            await this.evictCacheData(serverId);
        }
        
        // Store compressed data
        const cacheKey = `${dataType}:${options.key || 'latest'}`;
        const cacheEntry = {
            data: compressedData.data,
            metadata: {
                type: dataType,
                timestamp: Date.now(),
                ttl: options.ttl || this.config.ttlDefault,
                compressed: compressedData.compressed,
                compressionRatio: compressedData.compressionRatio,
                size: compressedData.compressedSize || JSON.stringify(compressedData.data).length
            }
        };
        
        server.cache.set(cacheKey, cacheEntry);
        server.cacheSize += cacheEntry.metadata.size;
        server.lastUpdate = Date.now();
        
        // Update compression cache for quick access
        if (compressedData.compressed) {
            server.compressionCache.set(cacheKey, {
                algorithm: compressedData.algorithm,
                originalSize: compressedData.originalSize,
                compressedSize: compressedData.compressedSize
            });
        }
        
        const latency = Date.now() - startTime;
        
        // Push to active stream channels
        this.pushToStreamChannels(serverId, dataType, cacheEntry);
        
        return {
            success: true,
            latency,
            cacheSize: server.cacheSize,
            compressionRatio: compressedData.compressionRatio
        };
    }

    async evictCacheData(serverId) {
        const server = this.edgeServers.get(serverId);
        if (!server) return;
        
        // LRU eviction with TTL consideration
        const entries = Array.from(server.cache.entries());
        const now = Date.now();
        
        // Sort by TTL expiry and last access
        entries.sort((a, b) => {
            const aExpiry = a[1].metadata.timestamp + a[1].metadata.ttl;
            const bExpiry = b[1].metadata.timestamp + b[1].metadata.ttl;
            return aExpiry - bExpiry;
        });
        
        // Remove expired entries first
        let removedSize = 0;
        const targetReduction = this.config.maxCacheSize * 0.2; // Remove 20%
        
        for (const [key, entry] of entries) {
            if (removedSize >= targetReduction) break;
            
            server.cache.delete(key);
            server.compressionCache.delete(key);
            removedSize += entry.metadata.size;
        }
        
        server.cacheSize -= removedSize;
        console.log(`Evicted ${removedSize} bytes from server ${serverId}`);
    }

    queueForPropagation(dataType, compressedData, options, excludeRegion) {
        const propagationItem = {
            dataType,
            data: compressedData,
            options,
            timestamp: Date.now(),
            excludeRegion
        };
        
        const queue = this.syncQueues.get(dataType);
        if (queue) {
            queue.push(propagationItem);
        }
    }

    backgroundUpdate(serverIds, dataType, compressedData, options) {
        // Update servers in background without blocking
        setImmediate(async () => {
            for (const serverId of serverIds) {
                try {
                    await this.updateEdgeCache(serverId, dataType, compressedData, options);
                } catch (error) {
                    console.error(`Background update failed for ${serverId}:`, error);
                }
            }
        });
    }

    pushToStreamChannels(serverId, dataType, cacheEntry) {
        const server = this.edgeServers.get(serverId);
        if (!server || !this.config.pushEnabled) return;
        
        const channels = server.streamChannels.get(dataType);
        if (channels && channels.size > 0) {
            const pushData = {
                type: dataType,
                data: cacheEntry.data,
                timestamp: cacheEntry.metadata.timestamp,
                compressed: cacheEntry.metadata.compressed
            };
            
            channels.forEach(channelId => {
                this.sendToPushChannel(channelId, pushData);
            });
            
            this.metrics.activePushChannels = channels.size;
        }
    }

    sendToPushChannel(channelId, data) {
        // In a real implementation, this would use WebSocket or Server-Sent Events
        this.emit('push_data', { channelId, data });
    }

    // Client-facing API
    async getData(dataType, key, clientLocation, options = {}) {
        const startTime = Date.now();
        
        try {
            // Find closest edge server
            const serverId = this.findClosestServer(clientLocation);
            const server = this.edgeServers.get(serverId);
            
            if (!server) {
                throw new Error('No available edge servers');
            }
            
            // Check cache
            const cacheKey = `${dataType}:${key || 'latest'}`;
            const cacheEntry = server.cache.get(cacheKey);
            
            if (cacheEntry) {
                // Check TTL
                const age = Date.now() - cacheEntry.metadata.timestamp;
                if (age <= cacheEntry.metadata.ttl) {
                    // Cache hit
                    const latency = Date.now() - startTime;
                    this.updateHitRateMetrics(serverId, true, latency);
                    
                    return {
                        data: cacheEntry.data,
                        metadata: cacheEntry.metadata,
                        source: 'edge_cache',
                        serverId,
                        latency
                    };
                } else {
                    // Expired, remove from cache
                    server.cache.delete(cacheKey);
                    server.compressionCache.delete(cacheKey);
                    server.cacheSize -= cacheEntry.metadata.size;
                }
            }
            
            // Cache miss - try to fetch from closest server with data
            const fallbackResult = await this.fetchFromFallback(dataType, key, serverId);
            
            const latency = Date.now() - startTime;
            this.updateHitRateMetrics(serverId, false, latency);
            
            return fallbackResult;
            
        } catch (error) {
            console.error(`Data retrieval failed for ${dataType}:${key}:`, error);
            throw error;
        }
    }

    findClosestServer(clientLocation) {
        if (!clientLocation || !clientLocation.lat || !clientLocation.lng) {
            // Default to a central US server
            return 'us-central-edge-0';
        }
        
        let closestServer = null;
        let minDistance = Infinity;
        
        this.edgeServers.forEach((server, serverId) => {
            if (server.status === 'active' && server.connections < server.maxConnections) {
                const distance = this.calculateDistance(clientLocation, server.location);
                if (distance < minDistance) {
                    minDistance = distance;
                    closestServer = serverId;
                }
            }
        });
        
        return closestServer || Array.from(this.edgeServers.keys())[0];
    }

    async fetchFromFallback(dataType, key, primaryServerId) {
        // Try to find data in other edge servers
        const routingTable = this.routingTable.get(primaryServerId);
        if (!routingTable) {
            throw new Error('No fallback servers available');
        }
        
        // Sort by estimated latency
        const sortedRoutes = Array.from(routingTable.entries())
            .sort((a, b) => a[1].estimatedLatency - b[1].estimatedLatency);
        
        for (const [serverId, route] of sortedRoutes.slice(0, 3)) { // Try top 3 closest
            const server = this.edgeServers.get(serverId);
            if (!server) continue;
            
            const cacheKey = `${dataType}:${key || 'latest'}`;
            const cacheEntry = server.cache.get(cacheKey);
            
            if (cacheEntry) {
                const age = Date.now() - cacheEntry.metadata.timestamp;
                if (age <= cacheEntry.metadata.ttl) {
                    // Update primary server cache
                    this.updateEdgeCache(primaryServerId, dataType, {
                        data: cacheEntry.data,
                        compressed: cacheEntry.metadata.compressed,
                        compressionRatio: 1.0
                    }, { key });
                    
                    return {
                        data: cacheEntry.data,
                        metadata: cacheEntry.metadata,
                        source: 'fallback_cache',
                        serverId,
                        latency: route.estimatedLatency
                    };
                }
            }
        }
        
        throw new Error(`Data not found: ${dataType}:${key}`);
    }

    startStreamProcessing() {
        // Process lazy propagation queues
        setInterval(() => {
            this.processLazyPropagation();
        }, 1000);
        
        // Update metrics
        setInterval(() => {
            this.updateGlobalMetrics();
        }, 5000);
        
        // Clean expired cache entries
        setInterval(() => {
            this.cleanExpiredCache();
        }, 30000);
    }

    processLazyPropagation() {
        this.syncQueues.forEach((queue, dataType) => {
            if (queue.length === 0) return;
            
            const batchSize = 10;
            const batch = queue.splice(0, batchSize);
            
            batch.forEach(async (item) => {
                try {
                    // Propagate to all regions except origin
                    for (const [regionId, region] of this.regions) {
                        if (regionId === item.excludeRegion) continue;
                        
                        // Update one server per region for efficiency
                        const serverId = region.edgeServers[0];
                        await this.updateEdgeCache(serverId, item.dataType, item.data, item.options);
                    }
                } catch (error) {
                    console.error(`Lazy propagation failed for ${item.dataType}:`, error);
                }
            });
        });
    }

    updateGlobalMetrics() {
        // Calculate global latency distribution
        this.regions.forEach((region, regionId) => {
            const latencies = region.edgeServers.map(serverId => {
                const server = this.edgeServers.get(serverId);
                return server ? (server.averageLatency || 0) : 0;
            });
            
            const avgLatency = latencies.reduce((sum, lat) => sum + lat, 0) / latencies.length;
            this.metrics.globalLatency.set(regionId, avgLatency);
        });
        
        // Calculate compression efficiency
        let totalOriginal = 0;
        let totalCompressed = 0;
        
        this.edgeServers.forEach(server => {
            server.compressionCache.forEach(info => {
                totalOriginal += info.originalSize;
                totalCompressed += info.compressedSize;
            });
        });
        
        this.metrics.compressionRatio = totalOriginal > 0 ? totalCompressed / totalOriginal : 1.0;
        
        // Emit metrics update
        this.emit('metrics_update', this.getGlobalMetrics());
    }

    updateDistributionMetrics(dataType, latency, results) {
        const successCount = results.filter(r => r.success).length;
        const failureCount = results.length - successCount;
        
        if (!this.metrics.hitRates.has(dataType)) {
            this.metrics.hitRates.set(dataType, { hits: 0, misses: 0, latency: 0 });
        }
        
        const typeMetrics = this.metrics.hitRates.get(dataType);
        typeMetrics.latency = (typeMetrics.latency * 0.9) + (latency * 0.1);
    }

    updateHitRateMetrics(serverId, hit, latency) {
        if (!this.metrics.hitRates.has(serverId)) {
            this.metrics.hitRates.set(serverId, { hits: 0, misses: 0, latency: 0 });
        }
        
        const serverMetrics = this.metrics.hitRates.get(serverId);
        if (hit) {
            serverMetrics.hits++;
        } else {
            serverMetrics.misses++;
        }
        serverMetrics.latency = (serverMetrics.latency * 0.9) + (latency * 0.1);
    }

    cleanExpiredCache() {
        const now = Date.now();
        
        this.edgeServers.forEach((server, serverId) => {
            const keysToDelete = [];
            
            server.cache.forEach((entry, key) => {
                const age = now - entry.metadata.timestamp;
                if (age > entry.metadata.ttl) {
                    keysToDelete.push(key);
                }
            });
            
            keysToDelete.forEach(key => {
                const entry = server.cache.get(key);
                server.cache.delete(key);
                server.compressionCache.delete(key);
                if (entry) {
                    server.cacheSize -= entry.metadata.size;
                }
            });
            
            if (keysToDelete.length > 0) {
                console.log(`Cleaned ${keysToDelete.length} expired entries from ${serverId}`);
            }
        });
    }

    getGlobalMetrics() {
        return {
            regions: this.regions.size,
            edgeServers: this.edgeServers.size,
            globalLatency: Object.fromEntries(this.metrics.globalLatency),
            hitRates: Object.fromEntries(this.metrics.hitRates),
            bandwidth: Object.fromEntries(this.metrics.bandwidth),
            compressionRatio: this.metrics.compressionRatio,
            activePushChannels: this.metrics.activePushChannels,
            totalCacheSize: Array.from(this.edgeServers.values())
                .reduce((total, server) => total + server.cacheSize, 0),
            activeConnections: Array.from(this.edgeServers.values())
                .reduce((total, server) => total + server.connections, 0)
        };
    }

    async shutdown() {
        console.log('Shutting down Global CDN Distribution system');
        
        // Clear all intervals
        clearInterval(this.lazyPropagationInterval);
        clearInterval(this.metricsInterval);
        clearInterval(this.cacheCleanupInterval);
        
        // Clear all caches
        this.edgeServers.forEach(server => {
            server.cache.clear();
            server.compressionCache.clear();
            server.streamChannels.clear();
        });
        
        this.emit('shutdown');
    }
}

module.exports = GlobalCDNDistribution;
/**
 * Data Processing Worker for Visualization System
 * Handles heavy data computations for real-time visualizations
 */

class DataProcessorWorker {
    constructor() {
        this.processingQueue = [];
        this.isProcessing = false;
        this.maxQueueSize = 1000;
        
        // Statistics tracking
        this.stats = {
            processedItems: 0,
            averageProcessingTime: 0,
            peakProcessingTime: 0,
            queueOverflows: 0
        };
        
        // Data buffers for different types
        this.buffers = {
            marketData: new CircularBuffer(5000),
            agentData: new CircularBuffer(10000),
            networkData: new CircularBuffer(2000),
            economicData: new CircularBuffer(1000)
        };
        
        this.setupMessageHandler();
        this.startProcessingLoop();
    }

    setupMessageHandler() {
        self.onmessage = (event) => {
            const { type, data, id, config } = event.data;
            
            this.addToQueue({
                type,
                data,
                id,
                config,
                timestamp: Date.now()
            });
        };
    }

    addToQueue(task) {
        if (this.processingQueue.length >= this.maxQueueSize) {
            this.stats.queueOverflows++;
            // Remove oldest task if queue is full
            this.processingQueue.shift();
        }
        
        this.processingQueue.push(task);
    }

    startProcessingLoop() {
        const process = () => {
            if (this.processingQueue.length > 0 && !this.isProcessing) {
                this.processNextTask();
            }
            
            // Process at 60fps when tasks are available
            setTimeout(process, 16);
        };
        
        process();
    }

    async processNextTask() {
        if (this.processingQueue.length === 0) return;
        
        this.isProcessing = true;
        const task = this.processingQueue.shift();
        const startTime = performance.now();
        
        try {
            let result = null;
            
            switch (task.type) {
                case 'process_market_data':
                    result = await this.processMarketData(task.data, task.config);
                    break;
                    
                case 'process_agent_network':
                    result = await this.processAgentNetwork(task.data, task.config);
                    break;
                    
                case 'calculate_economic_indicators':
                    result = await this.calculateEconomicIndicators(task.data, task.config);
                    break;
                    
                case 'generate_heatmap_data':
                    result = await this.generateHeatmapData(task.data, task.config);
                    break;
                    
                case 'analyze_patterns':
                    result = await this.analyzePatterns(task.data, task.config);
                    break;
                    
                case 'calculate_correlations':
                    result = await this.calculateCorrelations(task.data, task.config);
                    break;
                    
                default:
                    throw new Error(`Unknown task type: ${task.type}`);
            }
            
            const processingTime = performance.now() - startTime;
            this.updateStats(processingTime);
            
            // Send result back to main thread
            self.postMessage({
                type: 'processed_data',
                id: task.id,
                result: result,
                processingTime: processingTime,
                timestamp: Date.now()
            });
            
        } catch (error) {
            self.postMessage({
                type: 'processing_error',
                id: task.id,
                error: error.message,
                timestamp: Date.now()
            });
        }
        
        this.isProcessing = false;
    }

    async processMarketData(rawData, config) {
        const { symbol, timeframe, maxDataPoints } = config;
        const buffer = this.buffers.marketData;
        
        // Add new data to buffer
        rawData.forEach(dataPoint => {
            buffer.push({
                timestamp: dataPoint.timestamp,
                symbol: symbol,
                open: dataPoint.open,
                high: dataPoint.high,
                low: dataPoint.low,
                close: dataPoint.close,
                volume: dataPoint.volume,
                trades: dataPoint.trades || 0
            });
        });
        
        // Generate OHLCV candlesticks for the timeframe
        const candlesticks = this.generateCandlesticks(buffer.getData(), timeframe);
        
        // Calculate technical indicators
        const indicators = this.calculateTechnicalIndicators(candlesticks);
        
        // Calculate volume profile
        const volumeProfile = this.calculateVolumeProfile(candlesticks);
        
        // Detect price patterns
        const patterns = this.detectPricePatterns(candlesticks);
        
        return {
            symbol: symbol,
            timeframe: timeframe,
            candlesticks: candlesticks.slice(-maxDataPoints),
            indicators: indicators,
            volumeProfile: volumeProfile,
            patterns: patterns,
            summary: this.generateMarketSummary(candlesticks)
        };
    }

    generateCandlesticks(tickData, timeframe) {
        const timeframeMs = this.parseTimeframe(timeframe);
        const candles = new Map();
        
        tickData.forEach(tick => {
            const candleTime = Math.floor(tick.timestamp / timeframeMs) * timeframeMs;
            
            if (!candles.has(candleTime)) {
                candles.set(candleTime, {
                    timestamp: candleTime,
                    open: tick.close,
                    high: tick.close,
                    low: tick.close,
                    close: tick.close,
                    volume: 0,
                    trades: 0
                });
            }
            
            const candle = candles.get(candleTime);
            candle.high = Math.max(candle.high, tick.close);
            candle.low = Math.min(candle.low, tick.close);
            candle.close = tick.close;
            candle.volume += tick.volume;
            candle.trades += tick.trades;
        });
        
        return Array.from(candles.values()).sort((a, b) => a.timestamp - b.timestamp);
    }

    calculateTechnicalIndicators(candlesticks) {
        if (candlesticks.length < 20) return {};
        
        const closePrices = candlesticks.map(c => c.close);
        const volumes = candlesticks.map(c => c.volume);
        
        return {
            sma20: this.calculateSMA(closePrices, 20),
            sma50: this.calculateSMA(closePrices, 50),
            ema12: this.calculateEMA(closePrices, 12),
            ema26: this.calculateEMA(closePrices, 26),
            rsi: this.calculateRSI(closePrices, 14),
            macd: this.calculateMACD(closePrices),
            bollinger: this.calculateBollingerBands(closePrices, 20, 2),
            vwap: this.calculateVWAP(candlesticks),
            atr: this.calculateATR(candlesticks, 14),
            obv: this.calculateOBV(closePrices, volumes)
        };
    }

    calculateSMA(prices, period) {
        const result = [];
        for (let i = period - 1; i < prices.length; i++) {
            const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
            result.push(sum / period);
        }
        return result;
    }

    calculateEMA(prices, period) {
        const result = [];
        const multiplier = 2 / (period + 1);
        let ema = prices[0];
        result.push(ema);
        
        for (let i = 1; i < prices.length; i++) {
            ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
            result.push(ema);
        }
        
        return result;
    }

    calculateRSI(prices, period) {
        const gains = [];
        const losses = [];
        
        for (let i = 1; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }
        
        const result = [];
        for (let i = period - 1; i < gains.length; i++) {
            const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
            const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
            
            if (avgLoss === 0) {
                result.push(100);
            } else {
                const rs = avgGain / avgLoss;
                result.push(100 - (100 / (1 + rs)));
            }
        }
        
        return result;
    }

    calculateMACD(prices) {
        const ema12 = this.calculateEMA(prices, 12);
        const ema26 = this.calculateEMA(prices, 26);
        
        const macdLine = [];
        const startIndex = Math.max(0, ema26.length - ema12.length);
        
        for (let i = startIndex; i < ema12.length; i++) {
            macdLine.push(ema12[i] - ema26[i - startIndex]);
        }
        
        const signalLine = this.calculateEMA(macdLine, 9);
        const histogram = [];
        
        for (let i = 0; i < signalLine.length; i++) {
            histogram.push(macdLine[i + (macdLine.length - signalLine.length)] - signalLine[i]);
        }
        
        return {
            macd: macdLine,
            signal: signalLine,
            histogram: histogram
        };
    }

    calculateBollingerBands(prices, period, stdDev) {
        const sma = this.calculateSMA(prices, period);
        const result = { upper: [], middle: [], lower: [] };
        
        for (let i = period - 1; i < prices.length; i++) {
            const slice = prices.slice(i - period + 1, i + 1);
            const mean = sma[i - period + 1];
            const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
            const standardDeviation = Math.sqrt(variance);
            
            result.middle.push(mean);
            result.upper.push(mean + (standardDeviation * stdDev));
            result.lower.push(mean - (standardDeviation * stdDev));
        }
        
        return result;
    }

    calculateVWAP(candlesticks) {
        const result = [];
        let cumulativeVolume = 0;
        let cumulativeVolumePrice = 0;
        
        candlesticks.forEach(candle => {
            const typicalPrice = (candle.high + candle.low + candle.close) / 3;
            cumulativeVolumePrice += typicalPrice * candle.volume;
            cumulativeVolume += candle.volume;
            
            result.push(cumulativeVolumePrice / cumulativeVolume);
        });
        
        return result;
    }

    calculateATR(candlesticks, period) {
        const trueRanges = [];
        
        for (let i = 1; i < candlesticks.length; i++) {
            const current = candlesticks[i];
            const previous = candlesticks[i - 1];
            
            const tr1 = current.high - current.low;
            const tr2 = Math.abs(current.high - previous.close);
            const tr3 = Math.abs(current.low - previous.close);
            
            trueRanges.push(Math.max(tr1, tr2, tr3));
        }
        
        return this.calculateSMA(trueRanges, period);
    }

    calculateOBV(prices, volumes) {
        const result = [volumes[0]];
        
        for (let i = 1; i < prices.length; i++) {
            let obv = result[result.length - 1];
            
            if (prices[i] > prices[i - 1]) {
                obv += volumes[i];
            } else if (prices[i] < prices[i - 1]) {
                obv -= volumes[i];
            }
            
            result.push(obv);
        }
        
        return result;
    }

    calculateVolumeProfile(candlesticks) {
        const priceVolume = new Map();
        
        candlesticks.forEach(candle => {
            const priceStep = 0.01; // $0.01 price buckets
            const range = candle.high - candle.low;
            const volumePerPrice = candle.volume / (range / priceStep);
            
            for (let price = candle.low; price <= candle.high; price += priceStep) {
                const bucket = Math.round(price / priceStep) * priceStep;
                priceVolume.set(bucket, (priceVolume.get(bucket) || 0) + volumePerPrice);
            }
        });
        
        return Array.from(priceVolume.entries())
            .map(([price, volume]) => ({ price, volume }))
            .sort((a, b) => a.price - b.price);
    }

    detectPricePatterns(candlesticks) {
        const patterns = [];
        
        // Double top/bottom detection
        const peaks = this.findPeaks(candlesticks.map(c => c.high));
        const troughs = this.findTroughs(candlesticks.map(c => c.low));
        
        // Support and resistance levels
        const supportLevels = this.findSupportLevels(candlesticks);
        const resistanceLevels = this.findResistanceLevels(candlesticks);
        
        // Trend lines
        const trendLines = this.detectTrendLines(candlesticks);
        
        return {
            peaks,
            troughs,
            supportLevels,
            resistanceLevels,
            trendLines
        };
    }

    findPeaks(prices) {
        const peaks = [];
        for (let i = 1; i < prices.length - 1; i++) {
            if (prices[i] > prices[i - 1] && prices[i] > prices[i + 1]) {
                peaks.push({ index: i, value: prices[i] });
            }
        }
        return peaks;
    }

    findTroughs(prices) {
        const troughs = [];
        for (let i = 1; i < prices.length - 1; i++) {
            if (prices[i] < prices[i - 1] && prices[i] < prices[i + 1]) {
                troughs.push({ index: i, value: prices[i] });
            }
        }
        return troughs;
    }

    findSupportLevels(candlesticks) {
        const lows = candlesticks.map(c => c.low);
        const levels = [];
        
        // Find significant lows
        for (let i = 2; i < lows.length - 2; i++) {
            if (lows[i] <= Math.min(lows[i-2], lows[i-1], lows[i+1], lows[i+2])) {
                levels.push({
                    price: lows[i],
                    timestamp: candlesticks[i].timestamp,
                    strength: this.calculateLevelStrength(lows, lows[i])
                });
            }
        }
        
        return levels.filter(l => l.strength >= 2); // At least 2 touches
    }

    findResistanceLevels(candlesticks) {
        const highs = candlesticks.map(c => c.high);
        const levels = [];
        
        // Find significant highs
        for (let i = 2; i < highs.length - 2; i++) {
            if (highs[i] >= Math.max(highs[i-2], highs[i-1], highs[i+1], highs[i+2])) {
                levels.push({
                    price: highs[i],
                    timestamp: candlesticks[i].timestamp,
                    strength: this.calculateLevelStrength(highs, highs[i])
                });
            }
        }
        
        return levels.filter(l => l.strength >= 2); // At least 2 touches
    }

    calculateLevelStrength(prices, level) {
        const tolerance = level * 0.001; // 0.1% tolerance
        return prices.filter(price => Math.abs(price - level) <= tolerance).length;
    }

    detectTrendLines(candlesticks) {
        // Simplified trend line detection
        const prices = candlesticks.map(c => c.close);
        const trendLines = [];
        
        // Uptrend detection
        for (let i = 0; i < prices.length - 10; i++) {
            const slope = this.calculateSlope(prices.slice(i, i + 10));
            if (slope > 0.001) { // Positive slope threshold
                trendLines.push({
                    type: 'uptrend',
                    startIndex: i,
                    endIndex: i + 9,
                    slope: slope
                });
            }
        }
        
        // Downtrend detection
        for (let i = 0; i < prices.length - 10; i++) {
            const slope = this.calculateSlope(prices.slice(i, i + 10));
            if (slope < -0.001) { // Negative slope threshold
                trendLines.push({
                    type: 'downtrend',
                    startIndex: i,
                    endIndex: i + 9,
                    slope: slope
                });
            }
        }
        
        return trendLines;
    }

    calculateSlope(prices) {
        const n = prices.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = prices.reduce((sum, price) => sum + price, 0);
        const sumXY = prices.reduce((sum, price, index) => sum + (index * price), 0);
        const sumX2 = prices.reduce((sum, _, index) => sum + (index * index), 0);
        
        return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    }

    generateMarketSummary(candlesticks) {
        if (candlesticks.length === 0) return {};
        
        const latest = candlesticks[candlesticks.length - 1];
        const previous = candlesticks[candlesticks.length - 2];
        
        const change = previous ? latest.close - previous.close : 0;
        const changePercent = previous ? (change / previous.close) * 100 : 0;
        
        const high24h = Math.max(...candlesticks.slice(-24).map(c => c.high));
        const low24h = Math.min(...candlesticks.slice(-24).map(c => c.low));
        const volume24h = candlesticks.slice(-24).reduce((sum, c) => sum + c.volume, 0);
        
        return {
            currentPrice: latest.close,
            change: change,
            changePercent: changePercent,
            high24h: high24h,
            low24h: low24h,
            volume24h: volume24h,
            volatility: this.calculateVolatility(candlesticks.slice(-24))
        };
    }

    calculateVolatility(candlesticks) {
        if (candlesticks.length < 2) return 0;
        
        const returns = [];
        for (let i = 1; i < candlesticks.length; i++) {
            const returnRate = Math.log(candlesticks[i].close / candlesticks[i - 1].close);
            returns.push(returnRate);
        }
        
        const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
        const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
        
        return Math.sqrt(variance * 252); // Annualized volatility
    }

    async processAgentNetwork(networkData, config) {
        // Process agent network data for visualization
        const { agents, relationships } = networkData;
        
        // Calculate network metrics
        const metrics = this.calculateNetworkMetrics(agents, relationships);
        
        // Detect communities/clusters
        const communities = this.detectCommunities(agents, relationships);
        
        // Calculate centrality measures
        const centralities = this.calculateCentralities(agents, relationships);
        
        // Generate layout positions
        const positions = this.calculateNetworkLayout(agents, relationships, config);
        
        return {
            nodes: agents.map((agent, index) => ({
                ...agent,
                position: positions[index],
                centrality: centralities[agent.id],
                community: communities[agent.id]
            })),
            edges: relationships,
            metrics: metrics,
            communities: Object.values(communities)
        };
    }

    calculateNetworkMetrics(agents, relationships) {
        const nodeCount = agents.length;
        const edgeCount = relationships.length;
        const density = (2 * edgeCount) / (nodeCount * (nodeCount - 1));
        
        // Calculate degree distribution
        const degrees = new Map();
        relationships.forEach(rel => {
            degrees.set(rel.source, (degrees.get(rel.source) || 0) + 1);
            degrees.set(rel.target, (degrees.get(rel.target) || 0) + 1);
        });
        
        const avgDegree = Array.from(degrees.values()).reduce((sum, deg) => sum + deg, 0) / nodeCount;
        
        return {
            nodeCount,
            edgeCount,
            density,
            averageDegree: avgDegree,
            maxDegree: Math.max(...degrees.values()),
            minDegree: Math.min(...degrees.values())
        };
    }

    detectCommunities(agents, relationships) {
        // Simplified community detection using modularity
        const communities = {};
        let communityId = 0;
        
        // Start with each node in its own community
        agents.forEach(agent => {
            communities[agent.id] = communityId++;
        });
        
        // Merge communities based on edge density
        let improved = true;
        while (improved) {
            improved = false;
            
            for (const rel of relationships) {
                const sourceCommunity = communities[rel.source];
                const targetCommunity = communities[rel.target];
                
                if (sourceCommunity !== targetCommunity) {
                    // Calculate modularity gain
                    const gain = this.calculateModularityGain(
                        agents, relationships, communities,
                        sourceCommunity, targetCommunity
                    );
                    
                    if (gain > 0) {
                        // Merge communities
                        Object.keys(communities).forEach(nodeId => {
                            if (communities[nodeId] === targetCommunity) {
                                communities[nodeId] = sourceCommunity;
                            }
                        });
                        improved = true;
                    }
                }
            }
        }
        
        return communities;
    }

    calculateModularityGain(agents, relationships, communities, comm1, comm2) {
        // Simplified modularity gain calculation
        const totalEdges = relationships.length;
        
        let edgesWithin = 0;
        let degreeSum1 = 0;
        let degreeSum2 = 0;
        
        // Count edges and degrees
        relationships.forEach(rel => {
            if (communities[rel.source] === comm1 || communities[rel.source] === comm2) {
                degreeSum1++;
            }
            if (communities[rel.target] === comm1 || communities[rel.target] === comm2) {
                degreeSum2++;
            }
            
            if ((communities[rel.source] === comm1 && communities[rel.target] === comm1) ||
                (communities[rel.source] === comm2 && communities[rel.target] === comm2)) {
                edgesWithin++;
            }
        });
        
        const expectedEdges = (degreeSum1 * degreeSum2) / (2 * totalEdges);
        return (edgesWithin / totalEdges) - Math.pow(expectedEdges / totalEdges, 2);
    }

    calculateCentralities(agents, relationships) {
        const centralities = {};
        
        agents.forEach(agent => {
            centralities[agent.id] = {
                degree: this.calculateDegreeCentrality(agent.id, relationships),
                betweenness: this.calculateBetweennessCentrality(agent.id, agents, relationships),
                closeness: this.calculateClosenessCentrality(agent.id, agents, relationships)
            };
        });
        
        return centralities;
    }

    calculateDegreeCentrality(nodeId, relationships) {
        return relationships.filter(rel => 
            rel.source === nodeId || rel.target === nodeId
        ).length;
    }

    calculateBetweennessCentrality(nodeId, agents, relationships) {
        // Simplified betweenness centrality calculation
        let betweenness = 0;
        
        agents.forEach(source => {
            if (source.id === nodeId) return;
            
            agents.forEach(target => {
                if (target.id === nodeId || target.id === source.id) return;
                
                const paths = this.findShortestPaths(source.id, target.id, relationships);
                const pathsThroughNode = paths.filter(path => path.includes(nodeId));
                
                if (paths.length > 0) {
                    betweenness += pathsThroughNode.length / paths.length;
                }
            });
        });
        
        return betweenness;
    }

    calculateClosenessCentrality(nodeId, agents, relationships) {
        let totalDistance = 0;
        let reachableNodes = 0;
        
        agents.forEach(other => {
            if (other.id === nodeId) return;
            
            const distance = this.findShortestDistance(nodeId, other.id, relationships);
            if (distance < Infinity) {
                totalDistance += distance;
                reachableNodes++;
            }
        });
        
        return reachableNodes > 0 ? reachableNodes / totalDistance : 0;
    }

    findShortestPaths(source, target, relationships) {
        // Simplified path finding - returns array of path arrays
        // This is a basic implementation; more sophisticated algorithms could be used
        return [[source, target]]; // Placeholder
    }

    findShortestDistance(source, target, relationships) {
        // BFS to find shortest distance
        const queue = [{ node: source, distance: 0 }];
        const visited = new Set();
        
        while (queue.length > 0) {
            const { node, distance } = queue.shift();
            
            if (node === target) {
                return distance;
            }
            
            if (visited.has(node)) continue;
            visited.add(node);
            
            // Find neighbors
            relationships.forEach(rel => {
                if (rel.source === node && !visited.has(rel.target)) {
                    queue.push({ node: rel.target, distance: distance + 1 });
                } else if (rel.target === node && !visited.has(rel.source)) {
                    queue.push({ node: rel.source, distance: distance + 1 });
                }
            });
        }
        
        return Infinity;
    }

    calculateNetworkLayout(agents, relationships, config) {
        // Force-directed layout calculation
        const positions = agents.map(() => ({
            x: (Math.random() - 0.5) * 1000,
            y: (Math.random() - 0.5) * 1000,
            z: (Math.random() - 0.5) * 1000
        }));
        
        const forces = {
            attraction: 0.01,
            repulsion: 1000,
            damping: 0.9
        };
        
        // Run force simulation
        for (let iteration = 0; iteration < 100; iteration++) {
            const velocities = positions.map(() => ({ x: 0, y: 0, z: 0 }));
            
            // Repulsion forces
            for (let i = 0; i < positions.length; i++) {
                for (let j = i + 1; j < positions.length; j++) {
                    const dx = positions[j].x - positions[i].x;
                    const dy = positions[j].y - positions[i].y;
                    const dz = positions[j].z - positions[i].z;
                    const distance = Math.sqrt(dx*dx + dy*dy + dz*dz) + 0.1;
                    
                    const force = forces.repulsion / (distance * distance);
                    const fx = (dx / distance) * force;
                    const fy = (dy / distance) * force;
                    const fz = (dz / distance) * force;
                    
                    velocities[i].x -= fx;
                    velocities[i].y -= fy;
                    velocities[i].z -= fz;
                    velocities[j].x += fx;
                    velocities[j].y += fy;
                    velocities[j].z += fz;
                }
            }
            
            // Attraction forces
            relationships.forEach(rel => {
                const sourceIndex = agents.findIndex(a => a.id === rel.source);
                const targetIndex = agents.findIndex(a => a.id === rel.target);
                
                if (sourceIndex >= 0 && targetIndex >= 0) {
                    const dx = positions[targetIndex].x - positions[sourceIndex].x;
                    const dy = positions[targetIndex].y - positions[sourceIndex].y;
                    const dz = positions[targetIndex].z - positions[sourceIndex].z;
                    const distance = Math.sqrt(dx*dx + dy*dy + dz*dz);
                    
                    const force = forces.attraction * distance;
                    const fx = (dx / distance) * force;
                    const fy = (dy / distance) * force;
                    const fz = (dz / distance) * force;
                    
                    velocities[sourceIndex].x += fx;
                    velocities[sourceIndex].y += fy;
                    velocities[sourceIndex].z += fz;
                    velocities[targetIndex].x -= fx;
                    velocities[targetIndex].y -= fy;
                    velocities[targetIndex].z -= fz;
                }
            });
            
            // Apply velocities with damping
            for (let i = 0; i < positions.length; i++) {
                positions[i].x += velocities[i].x * forces.damping;
                positions[i].y += velocities[i].y * forces.damping;
                positions[i].z += velocities[i].z * forces.damping;
            }
        }
        
        return positions;
    }

    async calculateEconomicIndicators(economicData, config) {
        // Process economic indicators data
        const indicators = {};
        
        // Inflation calculations
        if (economicData.inflation) {
            indicators.inflation = this.processInflationData(economicData.inflation);
        }
        
        // Market health calculations
        if (economicData.markets) {
            indicators.marketHealth = this.calculateMarketHealth(economicData.markets);
        }
        
        // Wealth distribution analysis
        if (economicData.wealth) {
            indicators.wealthDistribution = this.analyzeWealthDistribution(economicData.wealth);
        }
        
        return indicators;
    }

    processInflationData(inflationData) {
        // Calculate inflation rate, trend, and forecasts
        const rates = inflationData.map(d => d.rate);
        const trend = this.calculateTrend(rates);
        const volatility = this.calculateVolatility(rates);
        
        return {
            current: rates[rates.length - 1],
            trend: trend,
            volatility: volatility,
            forecast: this.forecastInflation(rates)
        };
    }

    calculateMarketHealth(marketData) {
        // Composite market health score
        const liquidity = marketData.reduce((sum, m) => sum + m.liquidity, 0) / marketData.length;
        const volatility = marketData.reduce((sum, m) => sum + m.volatility, 0) / marketData.length;
        const volume = marketData.reduce((sum, m) => sum + m.volume, 0);
        
        // Health score (0-100)
        const healthScore = Math.max(0, Math.min(100, 
            (liquidity * 0.4) + ((1 - volatility) * 0.3) + (Math.log(volume) * 0.3)
        ));
        
        return {
            score: healthScore,
            liquidity: liquidity,
            volatility: volatility,
            volume: volume,
            status: healthScore > 80 ? 'healthy' : healthScore > 60 ? 'warning' : 'critical'
        };
    }

    analyzeWealthDistribution(wealthData) {
        const wealth = wealthData.map(d => d.wealth).sort((a, b) => a - b);
        
        return {
            giniCoefficient: this.calculateGini(wealth),
            percentiles: this.calculatePercentiles(wealth),
            mean: wealth.reduce((sum, w) => sum + w, 0) / wealth.length,
            median: wealth[Math.floor(wealth.length / 2)],
            concentration: this.calculateWealthConcentration(wealth)
        };
    }

    calculateGini(values) {
        const n = values.length;
        let sum = 0;
        
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                sum += Math.abs(values[i] - values[j]);
            }
        }
        
        const mean = values.reduce((a, b) => a + b, 0) / n;
        return sum / (2 * n * n * mean);
    }

    calculatePercentiles(values) {
        const sorted = [...values].sort((a, b) => a - b);
        return {
            p10: sorted[Math.floor(sorted.length * 0.1)],
            p25: sorted[Math.floor(sorted.length * 0.25)],
            p50: sorted[Math.floor(sorted.length * 0.5)],
            p75: sorted[Math.floor(sorted.length * 0.75)],
            p90: sorted[Math.floor(sorted.length * 0.9)],
            p99: sorted[Math.floor(sorted.length * 0.99)]
        };
    }

    calculateWealthConcentration(wealth) {
        const total = wealth.reduce((sum, w) => sum + w, 0);
        const top1Percent = wealth.slice(-Math.ceil(wealth.length * 0.01));
        const top10Percent = wealth.slice(-Math.ceil(wealth.length * 0.1));
        
        return {
            top1Percent: top1Percent.reduce((sum, w) => sum + w, 0) / total,
            top10Percent: top10Percent.reduce((sum, w) => sum + w, 0) / total
        };
    }

    async generateHeatmapData(rawData, config) {
        const { width, height, dataType } = config;
        const grid = new Array(width * height).fill(0);
        
        rawData.forEach(point => {
            const x = Math.floor((point.x + 1000) / 2000 * width);
            const y = Math.floor((point.y + 1000) / 2000 * height);
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
                const index = y * width + x;
                grid[index] += point.value;
            }
        });
        
        // Apply smoothing if requested
        if (config.smoothing) {
            return this.applyGaussianSmoothing(grid, width, height);
        }
        
        return grid;
    }

    applyGaussianSmoothing(grid, width, height) {
        const kernel = [
            [1, 2, 1],
            [2, 4, 2],
            [1, 2, 1]
        ];
        const kernelSum = 16;
        
        const smoothed = new Array(width * height);
        
        for (let y = 1; y < height - 1; y++) {
            for (let x = 1; x < width - 1; x++) {
                let sum = 0;
                
                for (let ky = -1; ky <= 1; ky++) {
                    for (let kx = -1; kx <= 1; kx++) {
                        const index = (y + ky) * width + (x + kx);
                        sum += grid[index] * kernel[ky + 1][kx + 1];
                    }
                }
                
                smoothed[y * width + x] = sum / kernelSum;
            }
        }
        
        return smoothed;
    }

    calculateTrend(values) {
        if (values.length < 2) return 0;
        
        const n = values.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = values.reduce((sum, val) => sum + val, 0);
        const sumXY = values.reduce((sum, val, index) => sum + (index * val), 0);
        const sumX2 = values.reduce((sum, _, index) => sum + (index * index), 0);
        
        return (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    }

    forecastInflation(rates) {
        // Simple linear regression forecast
        const trend = this.calculateTrend(rates);
        const lastRate = rates[rates.length - 1];
        
        const forecast = [];
        for (let i = 1; i <= 12; i++) {
            forecast.push(lastRate + (trend * i));
        }
        
        return forecast;
    }

    parseTimeframe(timeframe) {
        const units = {
            's': 1000,
            'm': 60 * 1000,
            'h': 60 * 60 * 1000,
            'd': 24 * 60 * 60 * 1000
        };
        
        const match = timeframe.match(/^(\d+)([smhd])$/);
        if (match) {
            const value = parseInt(match[1]);
            const unit = match[2];
            return value * units[unit];
        }
        
        return 60 * 1000; // Default to 1 minute
    }

    updateStats(processingTime) {
        this.stats.processedItems++;
        this.stats.averageProcessingTime = 
            (this.stats.averageProcessingTime * 0.9) + (processingTime * 0.1);
        this.stats.peakProcessingTime = 
            Math.max(this.stats.peakProcessingTime, processingTime);
    }
}

// Circular buffer implementation
class CircularBuffer {
    constructor(size) {
        this.size = size;
        this.buffer = new Array(size);
        this.head = 0;
        this.tail = 0;
        this.length = 0;
    }

    push(item) {
        this.buffer[this.head] = item;
        this.head = (this.head + 1) % this.size;
        
        if (this.length < this.size) {
            this.length++;
        } else {
            this.tail = (this.tail + 1) % this.size;
        }
    }

    getData() {
        const result = [];
        for (let i = 0; i < this.length; i++) {
            result.push(this.buffer[(this.tail + i) % this.size]);
        }
        return result;
    }
}

// Initialize the worker
new DataProcessorWorker();
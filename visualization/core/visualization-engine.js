/**
 * Living Economy Arena - Visualization Engine
 * Core system for real-time market data visualization and analytics
 */

class VisualizationEngine {
    constructor(config = {}) {
        this.config = {
            maxDataPoints: config.maxDataPoints || 10000,
            updateInterval: config.updateInterval || 16, // ~60fps
            bufferSize: config.bufferSize || 1000,
            webglEnabled: config.webglEnabled !== false,
            webgpuEnabled: config.webgpuEnabled !== false,
            ...config
        };

        // Core rendering systems
        this.renderEngine = null;
        this.dataStreams = new Map();
        this.visualizations = new Map();
        this.buffers = new Map();
        
        // Performance monitoring
        this.metrics = {
            frameRate: 60,
            lastRender: 0,
            dataLatency: 0,
            memoryUsage: 0,
            renderTime: 0
        };

        // State management
        this.isInitialized = false;
        this.isRunning = false;
        this.workers = [];
        
        this.initialize();
    }

    async initialize() {
        console.log('Initializing Visualization Engine...');
        
        try {
            // Initialize rendering backend
            await this.initializeRenderEngine();
            
            // Setup data processing workers
            this.setupWorkers();
            
            // Initialize visualization components
            this.initializeComponents();
            
            // Setup real-time data streams
            this.setupDataStreams();
            
            this.isInitialized = true;
            console.log('Visualization Engine initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize Visualization Engine:', error);
            throw error;
        }
    }

    async initializeRenderEngine() {
        // Try WebGPU first, fallback to WebGL, then Canvas
        if (this.config.webgpuEnabled && await this.tryWebGPU()) {
            console.log('Using WebGPU rendering backend');
            return;
        }
        
        if (this.config.webglEnabled && this.tryWebGL()) {
            console.log('Using WebGL rendering backend');
            return;
        }
        
        console.log('Using Canvas 2D rendering backend');
        this.initializeCanvas2D();
    }

    async tryWebGPU() {
        try {
            if (!navigator.gpu) return false;
            
            const adapter = await navigator.gpu.requestAdapter({
                powerPreference: 'high-performance'
            });
            
            if (!adapter) return false;
            
            const device = await adapter.requestDevice({
                requiredLimits: {
                    maxStorageBufferBindingSize: 1024 * 1024 * 1024,
                    maxComputeWorkgroupStorageSize: 32768
                }
            });
            
            this.renderEngine = new WebGPURenderer(device, adapter);
            return true;
            
        } catch (error) {
            console.warn('WebGPU not available:', error.message);
            return false;
        }
    }

    tryWebGL() {
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
            
            if (!gl) return false;
            
            this.renderEngine = new WebGLRenderer(gl);
            return true;
            
        } catch (error) {
            console.warn('WebGL not available:', error.message);
            return false;
        }
    }

    initializeCanvas2D() {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        this.renderEngine = new Canvas2DRenderer(ctx);
    }

    setupWorkers() {
        // Data processing worker for heavy computations
        const dataWorker = new Worker('/visualization/workers/data-processor.js');
        dataWorker.onmessage = (event) => this.handleWorkerMessage('data', event);
        this.workers.push(dataWorker);

        // Analytics worker for pattern recognition
        const analyticsWorker = new Worker('/visualization/workers/analytics.js');
        analyticsWorker.onmessage = (event) => this.handleWorkerMessage('analytics', event);
        this.workers.push(analyticsWorker);

        // Network analysis worker for agent relationships
        const networkWorker = new Worker('/visualization/workers/network-analysis.js');
        networkWorker.onmessage = (event) => this.handleWorkerMessage('network', event);
        this.workers.push(networkWorker);
    }

    initializeComponents() {
        // Market data visualizations
        this.registerVisualization('price_chart', new PriceChartVisualization());
        this.registerVisualization('order_book', new OrderBookVisualization());
        this.registerVisualization('volume_profile', new VolumeProfileVisualization());
        this.registerVisualization('market_depth', new MarketDepthVisualization());
        
        // Agent network visualizations
        this.registerVisualization('agent_network', new AgentNetworkVisualization());
        this.registerVisualization('wealth_distribution', new WealthDistributionVisualization());
        this.registerVisualization('trade_flows', new TradeFlowVisualization());
        
        // Economic indicators
        this.registerVisualization('inflation_gauge', new InflationGaugeVisualization());
        this.registerVisualization('market_health', new MarketHealthVisualization());
        this.registerVisualization('crisis_monitor', new CrisisMonitorVisualization());
        
        // 3D visualizations
        this.registerVisualization('market_3d', new Market3DVisualization());
        this.registerVisualization('agent_swarm', new AgentSwarmVisualization());
        this.registerVisualization('resource_flow', new ResourceFlowVisualization());
    }

    setupDataStreams() {
        // Market data streams
        this.createDataStream('market_prices', 'ws://localhost:8080/market-data');
        this.createDataStream('order_books', 'ws://localhost:8080/order-books');
        this.createDataStream('trade_executions', 'ws://localhost:8080/trades');
        
        // Economic indicators
        this.createDataStream('inflation_data', 'ws://localhost:3000/inflation');
        this.createDataStream('monetary_policy', 'ws://localhost:3000/monetary');
        this.createDataStream('scarcity_events', 'ws://localhost:3000/scarcity');
        
        // Agent activity
        this.createDataStream('agent_actions', 'ws://localhost:4000/agent-actions');
        this.createDataStream('network_updates', 'ws://localhost:4000/network');
        this.createDataStream('personality_changes', 'ws://localhost:4000/personality');
    }

    registerVisualization(id, visualization) {
        visualization.setRenderer(this.renderEngine);
        visualization.setConfig(this.config);
        this.visualizations.set(id, visualization);
        
        console.log(`Registered visualization: ${id}`);
    }

    createDataStream(id, url) {
        const stream = new DataStream(id, url);
        stream.onData = (data) => this.handleStreamData(id, data);
        stream.onError = (error) => this.handleStreamError(id, error);
        
        this.dataStreams.set(id, stream);
        
        console.log(`Created data stream: ${id}`);
    }

    handleStreamData(streamId, data) {
        // Buffer incoming data
        if (!this.buffers.has(streamId)) {
            this.buffers.set(streamId, new CircularBuffer(this.config.bufferSize));
        }
        
        const buffer = this.buffers.get(streamId);
        buffer.push(data);
        
        // Route data to relevant visualizations
        this.routeDataToVisualizations(streamId, data);
        
        // Update performance metrics
        this.updateDataLatencyMetric(data.timestamp);
    }

    routeDataToVisualizations(streamId, data) {
        // Define routing rules
        const routes = {
            'market_prices': ['price_chart', 'market_health', 'market_3d'],
            'order_books': ['order_book', 'market_depth', 'volume_profile'],
            'trade_executions': ['trade_flows', 'agent_network'],
            'inflation_data': ['inflation_gauge', 'crisis_monitor'],
            'agent_actions': ['agent_swarm', 'wealth_distribution'],
            'network_updates': ['agent_network', 'trade_flows']
        };
        
        const targetVisualizations = routes[streamId] || [];
        
        targetVisualizations.forEach(vizId => {
            const visualization = this.visualizations.get(vizId);
            if (visualization) {
                visualization.updateData(data);
            }
        });
    }

    start() {
        if (!this.isInitialized) {
            throw new Error('Visualization Engine not initialized');
        }
        
        if (this.isRunning) {
            console.warn('Visualization Engine already running');
            return;
        }
        
        this.isRunning = true;
        this.startRenderLoop();
        this.startDataStreams();
        
        console.log('Visualization Engine started');
    }

    stop() {
        this.isRunning = false;
        this.stopDataStreams();
        this.stopWorkers();
        
        console.log('Visualization Engine stopped');
    }

    startRenderLoop() {
        const render = (timestamp) => {
            if (!this.isRunning) return;
            
            const deltaTime = timestamp - this.metrics.lastRender;
            this.metrics.lastRender = timestamp;
            
            // Update frame rate metric
            this.metrics.frameRate = 1000 / deltaTime;
            
            // Render all active visualizations
            const renderStart = performance.now();
            this.renderFrame();
            this.metrics.renderTime = performance.now() - renderStart;
            
            // Schedule next frame
            requestAnimationFrame(render);
        };
        
        requestAnimationFrame(render);
    }

    renderFrame() {
        // Clear renderer
        this.renderEngine.clear();
        
        // Render each visualization
        for (const [id, visualization] of this.visualizations) {
            if (visualization.isVisible()) {
                try {
                    visualization.render();
                } catch (error) {
                    console.error(`Error rendering ${id}:`, error);
                }
            }
        }
        
        // Present frame
        this.renderEngine.present();
    }

    startDataStreams() {
        for (const stream of this.dataStreams.values()) {
            stream.connect();
        }
    }

    stopDataStreams() {
        for (const stream of this.dataStreams.values()) {
            stream.disconnect();
        }
    }

    stopWorkers() {
        this.workers.forEach(worker => worker.terminate());
        this.workers = [];
    }

    handleWorkerMessage(workerType, event) {
        const { type, data, id } = event.data;
        
        switch (workerType) {
            case 'data':
                this.handleDataWorkerMessage(type, data, id);
                break;
            case 'analytics':
                this.handleAnalyticsWorkerMessage(type, data, id);
                break;
            case 'network':
                this.handleNetworkWorkerMessage(type, data, id);
                break;
        }
    }

    handleDataWorkerMessage(type, data, id) {
        switch (type) {
            case 'processed_data':
                // Update visualization with processed data
                const visualization = this.visualizations.get(id);
                if (visualization) {
                    visualization.updateProcessedData(data);
                }
                break;
        }
    }

    handleAnalyticsWorkerMessage(type, data, id) {
        switch (type) {
            case 'pattern_detected':
                this.triggerPatternVisualization(data);
                break;
            case 'anomaly_detected':
                this.triggerAnomalyAlert(data);
                break;
        }
    }

    handleNetworkWorkerMessage(type, data, id) {
        switch (type) {
            case 'network_analysis':
                this.updateNetworkVisualization(data);
                break;
        }
    }

    triggerPatternVisualization(pattern) {
        // Highlight detected patterns in relevant visualizations
        const relevantViz = this.visualizations.get('price_chart');
        if (relevantViz) {
            relevantViz.highlightPattern(pattern);
        }
    }

    triggerAnomalyAlert(anomaly) {
        // Show anomaly indicators
        const crisisViz = this.visualizations.get('crisis_monitor');
        if (crisisViz) {
            crisisViz.showAnomalyAlert(anomaly);
        }
    }

    updateNetworkVisualization(networkData) {
        const networkViz = this.visualizations.get('agent_network');
        if (networkViz) {
            networkViz.updateNetworkStructure(networkData);
        }
    }

    updateDataLatencyMetric(dataTimestamp) {
        if (dataTimestamp) {
            this.metrics.dataLatency = Date.now() - dataTimestamp;
        }
    }

    // Public API methods
    getVisualization(id) {
        return this.visualizations.get(id);
    }

    showVisualization(id) {
        const viz = this.visualizations.get(id);
        if (viz) viz.show();
    }

    hideVisualization(id) {
        const viz = this.visualizations.get(id);
        if (viz) viz.hide();
    }

    getPerformanceMetrics() {
        return {
            ...this.metrics,
            memoryUsage: this.calculateMemoryUsage(),
            activeStreams: this.dataStreams.size,
            activeVisualizations: Array.from(this.visualizations.values())
                .filter(viz => viz.isVisible()).length
        };
    }

    calculateMemoryUsage() {
        let totalMemory = 0;
        
        // Calculate buffer memory usage
        for (const buffer of this.buffers.values()) {
            totalMemory += buffer.getMemoryUsage();
        }
        
        // Add visualization memory usage
        for (const viz of this.visualizations.values()) {
            totalMemory += viz.getMemoryUsage();
        }
        
        return totalMemory;
    }

    // Configuration management
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
        
        // Propagate config updates to visualizations
        for (const viz of this.visualizations.values()) {
            viz.setConfig(this.config);
        }
    }

    // Export capabilities
    exportVisualization(id, format = 'png') {
        const viz = this.visualizations.get(id);
        if (!viz) throw new Error(`Visualization ${id} not found`);
        
        return viz.export(format);
    }

    exportAllVisualizations(format = 'png') {
        const exports = {};
        
        for (const [id, viz] of this.visualizations) {
            if (viz.isVisible()) {
                exports[id] = viz.export(format);
            }
        }
        
        return exports;
    }
}

// Supporting classes
class DataStream {
    constructor(id, url) {
        this.id = id;
        this.url = url;
        this.websocket = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.onData = null;
        this.onError = null;
    }

    connect() {
        try {
            this.websocket = new WebSocket(this.url);
            
            this.websocket.onopen = () => {
                console.log(`Data stream connected: ${this.id}`);
                this.reconnectAttempts = 0;
            };
            
            this.websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (this.onData) this.onData(data);
            };
            
            this.websocket.onclose = () => {
                console.log(`Data stream disconnected: ${this.id}`);
                this.scheduleReconnect();
            };
            
            this.websocket.onerror = (error) => {
                console.error(`Data stream error: ${this.id}`, error);
                if (this.onError) this.onError(error);
            };
            
        } catch (error) {
            console.error(`Failed to create WebSocket for ${this.id}:`, error);
        }
    }

    disconnect() {
        if (this.websocket) {
            this.websocket.close();
            this.websocket = null;
        }
    }

    scheduleReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            const delay = Math.pow(2, this.reconnectAttempts) * 1000; // Exponential backoff
            setTimeout(() => {
                this.reconnectAttempts++;
                this.connect();
            }, delay);
        }
    }
}

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

    get(index) {
        if (index >= this.length) return undefined;
        return this.buffer[(this.tail + index) % this.size];
    }

    getLast(count = 1) {
        const result = [];
        for (let i = Math.max(0, this.length - count); i < this.length; i++) {
            result.push(this.get(i));
        }
        return result;
    }

    getMemoryUsage() {
        return this.buffer.length * 8; // Approximate bytes
    }
}

module.exports = VisualizationEngine;
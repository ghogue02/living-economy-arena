/**
 * Visualization Orchestrator
 * Central coordination system for all visualization components in the Living Economy Arena
 */

const VisualizationEngine = require('../core/visualization-engine');
const MarketDashboard = require('../components/market-dashboard');
const AgentNetworkVisualization = require('../components/agent-network-viz');
const EconomicHeatMapSystem = require('../components/heat-maps');
const MarketDepth3D = require('../components/3d-market-depth');

class VisualizationOrchestrator {
    constructor(config = {}) {
        this.config = {
            autoStart: config.autoStart !== false,
            dataSourceUrls: config.dataSourceUrls || {
                economic: 'ws://localhost:3000',
                market: 'ws://localhost:8080',
                agents: 'ws://localhost:4000',
                infrastructure: 'ws://localhost:5000'
            },
            enabledVisualizations: config.enabledVisualizations || [
                'market-dashboard',
                'agent-network',
                'heat-maps',
                '3d-market-depth'
            ],
            layout: config.layout || 'adaptive',
            theme: config.theme || 'dark',
            ...config
        };

        this.visualizationEngine = null;
        this.components = new Map();
        this.dataStreams = new Map();
        this.analytics = new Map();
        
        this.state = {
            isInitialized: false,
            isRunning: false,
            connectedSources: new Set(),
            lastUpdate: 0,
            errorCount: 0
        };
        
        this.eventHandlers = new Map();
        this.coordinationMemory = new Map();
        
        this.initialize();
    }

    async initialize() {
        console.log('🎯 Data Visualization Specialist: Initializing comprehensive visualization system...');
        
        try {
            // Initialize core visualization engine
            await this.initializeVisualizationEngine();
            
            // Create visualization components
            await this.createVisualizationComponents();
            
            // Setup data integration
            await this.setupDataIntegration();
            
            // Initialize analytics systems
            await this.initializeAnalytics();
            
            // Setup coordination with other hive mind components
            await this.setupHiveCoordination();
            
            // Setup event system
            this.setupEventSystem();
            
            this.state.isInitialized = true;
            
            if (this.config.autoStart) {
                await this.start();
            }
            
            console.log('✅ Visualization Orchestrator initialized successfully');
            
        } catch (error) {
            console.error('❌ Failed to initialize Visualization Orchestrator:', error);
            throw error;
        }
    }

    async initializeVisualizationEngine() {
        this.visualizationEngine = new VisualizationEngine({
            maxDataPoints: 10000,
            updateInterval: 16, // 60fps
            webglEnabled: true,
            webgpuEnabled: true
        });
        
        await this.visualizationEngine.start();
        console.log('✅ Visualization Engine initialized');
    }

    async createVisualizationComponents() {
        const container = this.createMainContainer();
        
        // Market Dashboard
        if (this.config.enabledVisualizations.includes('market-dashboard')) {
            const dashboardContainer = this.createComponentContainer('market-dashboard', container);
            const dashboard = new MarketDashboard(dashboardContainer, {
                symbols: ['BTC/USD', 'ETH/USD', 'SOL/USD', 'MATIC/USD'],
                layout: 'grid',
                theme: this.config.theme
            });
            
            this.components.set('market-dashboard', dashboard);
            console.log('✅ Market Dashboard created');
        }

        // Agent Network Visualization
        if (this.config.enabledVisualizations.includes('agent-network')) {
            const networkContainer = this.createComponentContainer('agent-network', container);
            const network = new AgentNetworkVisualization(networkContainer, {
                maxNodes: 1000,
                physics: true,
                force3D: true
            });
            
            this.components.set('agent-network', network);
            console.log('✅ Agent Network Visualization created');
        }

        // Economic Heat Maps
        if (this.config.enabledVisualizations.includes('heat-maps')) {
            const heatMapContainer = this.createComponentContainer('heat-maps', container);
            const heatMaps = new EconomicHeatMapSystem(heatMapContainer, {
                resolution: { width: 200, height: 200 },
                updateInterval: 1000
            });
            
            this.components.set('heat-maps', heatMaps);
            console.log('✅ Economic Heat Maps created');
        }

        // 3D Market Depth
        if (this.config.enabledVisualizations.includes('3d-market-depth')) {
            const depthContainer = this.createComponentContainer('3d-market-depth', container);
            const depth3D = new MarketDepth3D(depthContainer, {
                symbol: 'BTC/USD',
                maxDepth: 50,
                animation: true
            });
            
            this.components.set('3d-market-depth', depth3D);
            console.log('✅ 3D Market Depth created');
        }
    }

    createMainContainer() {
        const container = document.createElement('div');
        container.id = 'visualization-orchestrator';
        container.className = `visualization-container ${this.config.theme}`;
        
        container.innerHTML = `
            <div class="orchestrator-header">
                <div class="title-section">
                    <h1>Living Economy Arena - Data Visualization System</h1>
                    <div class="subtitle">Real-time market analysis for 100,000+ AI agents</div>
                </div>
                
                <div class="control-section">
                    <div class="connection-status" id="connection-status">
                        <span class="status-indicator"></span>
                        <span class="status-text">Initializing...</span>
                    </div>
                    
                    <div class="visualization-controls">
                        <button id="layout-toggle" class="control-btn">Layout</button>
                        <button id="theme-toggle" class="control-btn">Theme</button>
                        <button id="export-all" class="control-btn">Export</button>
                        <button id="fullscreen" class="control-btn">Fullscreen</button>
                    </div>
                </div>
            </div>
            
            <div class="orchestrator-main" id="orchestrator-main">
                <!-- Visualization components will be injected here -->
            </div>
            
            <div class="orchestrator-sidebar" id="orchestrator-sidebar">
                <div class="analytics-panel" id="analytics-panel">
                    <h3>Live Analytics</h3>
                    <div class="analytics-content">
                        <!-- Analytics will be populated here -->
                    </div>
                </div>
                
                <div class="performance-panel" id="performance-panel">
                    <h3>System Performance</h3>
                    <div class="performance-metrics">
                        <div class="metric">
                            <label>FPS:</label>
                            <span id="fps-counter">--</span>
                        </div>
                        <div class="metric">
                            <label>Memory:</label>
                            <span id="memory-usage">--</span>
                        </div>
                        <div class="metric">
                            <label>Data Rate:</label>
                            <span id="data-rate">--</span>
                        </div>
                    </div>
                </div>
                
                <div class="coordination-panel" id="coordination-panel">
                    <h3>Hive Coordination</h3>
                    <div class="coordination-status">
                        <div class="coord-item">
                            <span class="coord-label">Economic Engine:</span>
                            <span class="coord-status" id="economic-status">Offline</span>
                        </div>
                        <div class="coord-item">
                            <span class="coord-label">Market Infrastructure:</span>
                            <span class="coord-status" id="market-status">Offline</span>
                        </div>
                        <div class="coord-item">
                            <span class="coord-label">AI Personality:</span>
                            <span class="coord-status" id="ai-status">Offline</span>
                        </div>
                        <div class="coord-item">
                            <span class="coord-label">Game Balance:</span>
                            <span class="coord-status" id="balance-status">Offline</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
        this.applyStyles();
        
        return container;
    }

    createComponentContainer(componentId, parentContainer) {
        const container = document.createElement('div');
        container.id = `viz-${componentId}`;
        container.className = 'visualization-component';
        
        const main = parentContainer.querySelector('#orchestrator-main');
        main.appendChild(container);
        
        return container;
    }

    async setupDataIntegration() {
        // Economic Engine Integration
        await this.createDataStream('economic', {
            url: this.config.dataSourceUrls.economic,
            endpoints: ['/indicators', '/inflation', '/monetary', '/scarcity'],
            onData: (data) => this.handleEconomicData(data),
            onConnect: () => this.updateConnectionStatus('economic', true),
            onDisconnect: () => this.updateConnectionStatus('economic', false)
        });

        // Market Infrastructure Integration
        await this.createDataStream('market', {
            url: this.config.dataSourceUrls.market,
            endpoints: ['/market-data', '/order-books', '/trades'],
            onData: (data) => this.handleMarketData(data),
            onConnect: () => this.updateConnectionStatus('market', true),
            onDisconnect: () => this.updateConnectionStatus('market', false)
        });

        // Agent Network Integration
        await this.createDataStream('agents', {
            url: this.config.dataSourceUrls.agents,
            endpoints: ['/agent-actions', '/network', '/personality'],
            onData: (data) => this.handleAgentData(data),
            onConnect: () => this.updateConnectionStatus('agents', true),
            onDisconnect: () => this.updateConnectionStatus('agents', false)
        });

        console.log('✅ Data integration setup complete');
    }

    async createDataStream(streamId, config) {
        const stream = new DataStreamManager(streamId, config);
        
        stream.on('data', (data) => {
            this.routeDataToComponents(streamId, data);
            this.updateAnalytics(streamId, data);
            this.recordCoordinationData(streamId, data);
        });
        
        stream.on('error', (error) => {
            console.error(`Data stream error [${streamId}]:`, error);
            this.state.errorCount++;
        });
        
        this.dataStreams.set(streamId, stream);
        await stream.connect();
    }

    routeDataToComponents(streamId, data) {
        switch (streamId) {
            case 'economic':
                this.routeEconomicData(data);
                break;
            case 'market':
                this.routeMarketData(data);
                break;
            case 'agents':
                this.routeAgentData(data);
                break;
        }
    }

    routeEconomicData(data) {
        // Route to economic indicators in heat maps
        const heatMaps = this.components.get('heat-maps');
        if (heatMaps && data.type === 'economic_indicators') {
            heatMaps.updateEconomicIndicators(data);
        }

        // Route inflation data to dashboard
        const dashboard = this.components.get('market-dashboard');
        if (dashboard && data.type === 'inflation_update') {
            dashboard.updateEconomicIndicators(data);
        }

        // Store in coordination memory
        this.coordinationMemory.set(`economic_${data.type}`, {
            data: data,
            timestamp: Date.now(),
            source: 'economic-engine'
        });
    }

    routeMarketData(data) {
        // Route to market dashboard
        const dashboard = this.components.get('market-dashboard');
        if (dashboard) {
            switch (data.type) {
                case 'market_tick':
                    dashboard.updateMarketData(data.symbol, data);
                    break;
                case 'order_book':
                    dashboard.updateOrderBookData(data.symbol, data);
                    break;
                case 'trade_execution':
                    dashboard.updateTrade(data);
                    break;
            }
        }

        // Route to 3D market depth
        const depth3D = this.components.get('3d-market-depth');
        if (depth3D && data.type === 'order_book') {
            depth3D.updateOrderBookData(data);
        }

        // Store in coordination memory
        this.coordinationMemory.set(`market_${data.symbol}_${data.type}`, {
            data: data,
            timestamp: Date.now(),
            source: 'market-infrastructure'
        });
    }

    routeAgentData(data) {
        // Route to agent network visualization
        const network = this.components.get('agent-network');
        if (network) {
            switch (data.type) {
                case 'agent_actions':
                    network.updateNetworkData({ agents: data.agents });
                    break;
                case 'network_update':
                    network.updateNetworkData({ relationships: data.relationships });
                    break;
                case 'personality_change':
                    this.handlePersonalityUpdate(data);
                    break;
            }
        }

        // Route agent activity to heat maps
        const heatMaps = this.components.get('heat-maps');
        if (heatMaps && data.type === 'agent_actions') {
            heatMaps.updateAgentActivity(data);
        }

        // Store in coordination memory
        this.coordinationMemory.set(`agents_${data.type}`, {
            data: data,
            timestamp: Date.now(),
            source: 'ai-personality'
        });
    }

    async initializeAnalytics() {
        // Pattern Detection Analytics
        this.analytics.set('patterns', new PatternAnalyzer({
            sensitivity: 0.7,
            algorithms: ['trend', 'cycle', 'anomaly', 'correlation']
        }));

        // Performance Analytics
        this.analytics.set('performance', new PerformanceAnalyzer({
            metricsInterval: 1000,
            alertThresholds: {
                fps: 30,
                memory: 1024 * 1024 * 1024, // 1GB
                latency: 100 // 100ms
            }
        }));

        // Market Analytics
        this.analytics.set('market', new MarketAnalyzer({
            correlationWindow: 100,
            volatilityPeriod: 24,
            liquidityThreshold: 10000
        }));

        console.log('✅ Analytics systems initialized');
    }

    async setupHiveCoordination() {
        // Store coordination data for other hive mind components
        this.coordinationMemory.set('visualization_capabilities', {
            components: Array.from(this.components.keys()),
            dataStreams: Array.from(this.dataStreams.keys()),
            analytics: Array.from(this.analytics.keys()),
            timestamp: Date.now()
        });

        // Send coordination hooks to coordinate with claude-flow
        await this.sendCoordinationHook('pre-task', {
            description: 'Data visualization system active',
            capabilities: Array.from(this.components.keys()),
            status: 'ready'
        });

        console.log('✅ Hive coordination established');
    }

    async sendCoordinationHook(hookType, data) {
        try {
            // This would integrate with claude-flow hooks in a real implementation
            console.log(`🔗 Coordination Hook [${hookType}]:`, data);
            
            // Store in memory for other components to access
            this.coordinationMemory.set(`hook_${hookType}`, {
                data: data,
                timestamp: Date.now()
            });
            
        } catch (error) {
            console.warn('Coordination hook failed:', error);
        }
    }

    setupEventSystem() {
        // Component interaction events
        this.components.forEach((component, id) => {
            if (component.addEventListener) {
                component.addEventListener('patternDetected', (event) => {
                    this.handlePatternDetection(id, event.detail);
                });
                
                component.addEventListener('anomalyDetected', (event) => {
                    this.handleAnomalyDetection(id, event.detail);
                });
                
                component.addEventListener('userInteraction', (event) => {
                    this.handleUserInteraction(id, event.detail);
                });
            }
        });

        // Global event handlers
        document.getElementById('layout-toggle')?.addEventListener('click', () => {
            this.toggleLayout();
        });

        document.getElementById('theme-toggle')?.addEventListener('click', () => {
            this.toggleTheme();
        });

        document.getElementById('export-all')?.addEventListener('click', () => {
            this.exportAll();
        });

        document.getElementById('fullscreen')?.addEventListener('click', () => {
            this.toggleFullscreen();
        });

        console.log('✅ Event system setup complete');
    }

    async start() {
        if (!this.state.isInitialized) {
            throw new Error('Orchestrator not initialized');
        }

        // Start all components
        for (const [id, component] of this.components) {
            try {
                if (component.start) {
                    await component.start();
                }
                console.log(`✅ Started component: ${id}`);
            } catch (error) {
                console.error(`❌ Failed to start component ${id}:`, error);
            }
        }

        // Start data streams
        for (const [id, stream] of this.dataStreams) {
            try {
                await stream.start();
                console.log(`✅ Started data stream: ${id}`);
            } catch (error) {
                console.error(`❌ Failed to start data stream ${id}:`, error);
            }
        }

        // Start analytics
        for (const [id, analyzer] of this.analytics) {
            try {
                analyzer.start();
                console.log(`✅ Started analytics: ${id}`);
            } catch (error) {
                console.error(`❌ Failed to start analytics ${id}:`, error);
            }
        }

        // Start performance monitoring
        this.startPerformanceMonitoring();

        this.state.isRunning = true;
        this.updateConnectionStatus('system', true);

        // Send coordination notification
        await this.sendCoordinationHook('post-task', {
            task: 'visualization_system_start',
            status: 'success',
            components_active: this.components.size
        });

        console.log('🚀 Visualization Orchestrator fully operational');
    }

    async stop() {
        this.state.isRunning = false;

        // Stop all components
        for (const [id, component] of this.components) {
            try {
                if (component.stop) {
                    await component.stop();
                }
            } catch (error) {
                console.error(`Error stopping component ${id}:`, error);
            }
        }

        // Stop data streams
        for (const stream of this.dataStreams.values()) {
            try {
                await stream.disconnect();
            } catch (error) {
                console.error('Error stopping data stream:', error);
            }
        }

        this.updateConnectionStatus('system', false);
        console.log('⏹️ Visualization Orchestrator stopped');
    }

    startPerformanceMonitoring() {
        const monitor = () => {
            if (!this.state.isRunning) return;

            // Update FPS counter
            const fps = this.visualizationEngine?.getPerformanceMetrics()?.frameRate || 0;
            document.getElementById('fps-counter').textContent = Math.round(fps);

            // Update memory usage
            const memory = performance.memory ? 
                Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 
                0;
            document.getElementById('memory-usage').textContent = `${memory}MB`;

            // Update data rate
            const dataRate = this.calculateDataRate();
            document.getElementById('data-rate').textContent = `${dataRate}/s`;

            // Update analytics
            this.updateAnalyticsDisplay();

            setTimeout(monitor, 1000);
        };

        monitor();
    }

    calculateDataRate() {
        const now = Date.now();
        const window = 1000; // 1 second
        let count = 0;

        for (const [key, entry] of this.coordinationMemory) {
            if (now - entry.timestamp <= window) {
                count++;
            }
        }

        return count;
    }

    updateAnalyticsDisplay() {
        const analyticsContent = document.querySelector('#analytics-panel .analytics-content');
        if (!analyticsContent) return;

        let html = '';

        // Market analytics
        const marketAnalyzer = this.analytics.get('market');
        if (marketAnalyzer) {
            const metrics = marketAnalyzer.getMetrics();
            html += `
                <div class="analytics-section">
                    <h4>Market Analytics</h4>
                    <div class="metric">Volatility: ${(metrics.volatility * 100).toFixed(2)}%</div>
                    <div class="metric">Correlation: ${metrics.correlation.toFixed(3)}</div>
                    <div class="metric">Liquidity: $${metrics.liquidity.toLocaleString()}</div>
                </div>
            `;
        }

        // Pattern analytics
        const patternAnalyzer = this.analytics.get('patterns');
        if (patternAnalyzer) {
            const patterns = patternAnalyzer.getRecentPatterns();
            html += `
                <div class="analytics-section">
                    <h4>Detected Patterns</h4>
                    ${patterns.map(p => `
                        <div class="pattern-item">
                            <span class="pattern-type">${p.type}</span>
                            <span class="pattern-confidence">${(p.confidence * 100).toFixed(1)}%</span>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        analyticsContent.innerHTML = html;
    }

    updateConnectionStatus(source, connected) {
        if (connected) {
            this.state.connectedSources.add(source);
        } else {
            this.state.connectedSources.delete(source);
        }

        // Update UI
        const statusElement = document.getElementById(`${source}-status`);
        if (statusElement) {
            statusElement.textContent = connected ? 'Online' : 'Offline';
            statusElement.className = `coord-status ${connected ? 'online' : 'offline'}`;
        }

        // Update main connection indicator
        const mainStatus = document.querySelector('#connection-status .status-text');
        const mainIndicator = document.querySelector('#connection-status .status-indicator');
        
        if (this.state.connectedSources.size > 0) {
            mainStatus.textContent = `Connected (${this.state.connectedSources.size} sources)`;
            mainIndicator.className = 'status-indicator connected';
        } else {
            mainStatus.textContent = 'Disconnected';
            mainIndicator.className = 'status-indicator disconnected';
        }
    }

    handlePatternDetection(componentId, pattern) {
        console.log(`🔍 Pattern detected in ${componentId}:`, pattern);
        
        // Cross-component pattern correlation
        this.analytics.get('patterns')?.addPattern(pattern);
        
        // Notify other components
        this.broadcastToComponents('patternDetected', { source: componentId, pattern });
    }

    handleAnomalyDetection(componentId, anomaly) {
        console.log(`⚠️ Anomaly detected in ${componentId}:`, anomaly);
        
        // Store for crisis monitoring
        this.coordinationMemory.set(`anomaly_${Date.now()}`, {
            source: componentId,
            anomaly: anomaly,
            timestamp: Date.now()
        });
        
        // Alert other systems
        this.broadcastToComponents('anomalyDetected', { source: componentId, anomaly });
    }

    broadcastToComponents(eventType, data) {
        this.components.forEach((component, id) => {
            if (component.handleEvent) {
                component.handleEvent(eventType, data);
            }
        });
    }

    toggleLayout() {
        const layouts = ['grid', 'single', 'split', 'adaptive'];
        const currentIndex = layouts.indexOf(this.config.layout);
        const nextIndex = (currentIndex + 1) % layouts.length;
        
        this.config.layout = layouts[nextIndex];
        this.applyLayout();
    }

    toggleTheme() {
        this.config.theme = this.config.theme === 'dark' ? 'light' : 'dark';
        document.getElementById('visualization-orchestrator').className = 
            `visualization-container ${this.config.theme}`;
    }

    async exportAll() {
        const exports = {};
        
        for (const [id, component] of this.components) {
            if (component.export) {
                try {
                    exports[id] = component.export();
                } catch (error) {
                    console.error(`Export failed for ${id}:`, error);
                }
            }
        }
        
        // Download as JSON
        const blob = new Blob([JSON.stringify(exports, null, 2)], { 
            type: 'application/json' 
        });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `visualization-export-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        
        console.log('📤 Exported all visualizations');
    }

    toggleFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.getElementById('visualization-orchestrator').requestFullscreen();
        }
    }

    applyLayout() {
        const main = document.getElementById('orchestrator-main');
        main.className = `orchestrator-main layout-${this.config.layout}`;
    }

    applyStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .visualization-container {
                display: grid;
                grid-template-areas: 
                    "header header"
                    "main sidebar";
                grid-template-rows: 80px 1fr;
                grid-template-columns: 1fr 350px;
                height: 100vh;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: #0a0a0a;
                color: #ffffff;
            }
            
            .orchestrator-header {
                grid-area: header;
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 0 30px;
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border-bottom: 2px solid #00ff88;
            }
            
            .title-section h1 {
                margin: 0;
                font-size: 24px;
                background: linear-gradient(135deg, #00ff88 0%, #00d2ff 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }
            
            .subtitle {
                font-size: 14px;
                color: #aaa;
                margin-top: 4px;
            }
            
            .control-section {
                display: flex;
                align-items: center;
                gap: 20px;
            }
            
            .connection-status {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 20px;
            }
            
            .status-indicator {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: #666;
            }
            
            .status-indicator.connected {
                background: #00ff88;
                box-shadow: 0 0 10px #00ff88;
            }
            
            .status-indicator.disconnected {
                background: #ff4444;
            }
            
            .visualization-controls {
                display: flex;
                gap: 10px;
            }
            
            .control-btn {
                padding: 8px 16px;
                background: rgba(0, 255, 136, 0.2);
                border: 1px solid #00ff88;
                border-radius: 4px;
                color: #00ff88;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .control-btn:hover {
                background: rgba(0, 255, 136, 0.3);
                box-shadow: 0 0 10px rgba(0, 255, 136, 0.3);
            }
            
            .orchestrator-main {
                grid-area: main;
                padding: 20px;
                overflow: auto;
                display: grid;
                gap: 20px;
            }
            
            .orchestrator-main.layout-grid {
                grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
            }
            
            .orchestrator-main.layout-single {
                grid-template-columns: 1fr;
            }
            
            .orchestrator-main.layout-split {
                grid-template-columns: 1fr 1fr;
            }
            
            .orchestrator-main.layout-adaptive {
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
            }
            
            .visualization-component {
                background: rgba(42, 42, 42, 0.9);
                border: 1px solid #444;
                border-radius: 12px;
                min-height: 400px;
                overflow: hidden;
                backdrop-filter: blur(10px);
            }
            
            .orchestrator-sidebar {
                grid-area: sidebar;
                background: rgba(26, 26, 46, 0.95);
                border-left: 1px solid #444;
                padding: 20px;
                overflow-y: auto;
            }
            
            .orchestrator-sidebar h3 {
                color: #00ff88;
                margin: 0 0 15px 0;
                font-size: 16px;
            }
            
            .analytics-panel, .performance-panel, .coordination-panel {
                background: rgba(42, 42, 42, 0.5);
                border: 1px solid #333;
                border-radius: 8px;
                padding: 15px;
                margin-bottom: 20px;
            }
            
            .performance-metrics .metric {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                padding: 4px 0;
                border-bottom: 1px solid #333;
            }
            
            .metric:last-child {
                border-bottom: none;
            }
            
            .coordination-status .coord-item {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                padding: 4px 0;
            }
            
            .coord-status.online {
                color: #00ff88;
            }
            
            .coord-status.offline {
                color: #ff4444;
            }
            
            .analytics-section {
                margin-bottom: 15px;
                padding: 10px;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 4px;
            }
            
            .analytics-section h4 {
                margin: 0 0 8px 0;
                color: #00d2ff;
                font-size: 14px;
            }
            
            .pattern-item {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                margin: 4px 0;
            }
            
            .pattern-type {
                color: #ffaa00;
            }
            
            .pattern-confidence {
                color: #00ff88;
            }
        `;
        
        document.head.appendChild(style);
    }

    // Public API for other hive mind components
    getCoordinationData(key) {
        return this.coordinationMemory.get(key);
    }

    getAllCoordinationData() {
        return Object.fromEntries(this.coordinationMemory);
    }

    subscribeToUpdates(callback) {
        this.eventHandlers.set('update', callback);
    }

    getSystemStatus() {
        return {
            isRunning: this.state.isRunning,
            connectedSources: Array.from(this.state.connectedSources),
            componentCount: this.components.size,
            lastUpdate: this.state.lastUpdate,
            errorCount: this.state.errorCount
        };
    }
}

// Supporting classes
class DataStreamManager {
    constructor(id, config) {
        this.id = id;
        this.config = config;
        this.websockets = new Map();
        this.eventHandlers = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
    }

    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
    }

    emit(event, data) {
        const handlers = this.eventHandlers.get(event) || [];
        handlers.forEach(handler => handler(data));
    }

    async connect() {
        for (const endpoint of this.config.endpoints) {
            const url = `${this.config.url}${endpoint}`;
            const ws = new WebSocket(url);
            
            ws.onopen = () => {
                console.log(`🔗 Connected to ${url}`);
                this.reconnectAttempts = 0;
                if (this.config.onConnect) this.config.onConnect();
            };
            
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (this.config.onData) this.config.onData(data);
                this.emit('data', data);
            };
            
            ws.onclose = () => {
                console.log(`🔌 Disconnected from ${url}`);
                if (this.config.onDisconnect) this.config.onDisconnect();
                this.scheduleReconnect(url);
            };
            
            ws.onerror = (error) => {
                console.error(`❌ WebSocket error on ${url}:`, error);
                this.emit('error', error);
            };
            
            this.websockets.set(endpoint, ws);
        }
    }

    scheduleReconnect(url) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            const delay = Math.pow(2, this.reconnectAttempts) * 1000;
            setTimeout(() => {
                this.reconnectAttempts++;
                this.connect();
            }, delay);
        }
    }

    async start() {
        // Additional startup logic if needed
    }

    async disconnect() {
        this.websockets.forEach(ws => ws.close());
        this.websockets.clear();
    }
}

class PatternAnalyzer {
    constructor(config) {
        this.config = config;
        this.patterns = [];
        this.algorithms = config.algorithms;
    }

    addPattern(pattern) {
        this.patterns.push({
            ...pattern,
            timestamp: Date.now()
        });
        
        // Keep only recent patterns
        const cutoff = Date.now() - (5 * 60 * 1000); // 5 minutes
        this.patterns = this.patterns.filter(p => p.timestamp > cutoff);
    }

    getRecentPatterns() {
        return this.patterns.slice(-10);
    }

    start() {
        console.log('✅ Pattern analyzer started');
    }
}

class PerformanceAnalyzer {
    constructor(config) {
        this.config = config;
        this.metrics = {
            fps: 60,
            memory: 0,
            latency: 0
        };
    }

    start() {
        setInterval(() => {
            this.collectMetrics();
            this.checkAlerts();
        }, this.config.metricsInterval);
    }

    collectMetrics() {
        // Collect performance metrics
        if (performance.memory) {
            this.metrics.memory = performance.memory.usedJSHeapSize;
        }
    }

    checkAlerts() {
        // Check for performance alerts
        if (this.metrics.fps < this.config.alertThresholds.fps) {
            console.warn('⚠️ Low FPS detected:', this.metrics.fps);
        }
    }
}

class MarketAnalyzer {
    constructor(config) {
        this.config = config;
        this.metrics = {
            volatility: 0,
            correlation: 0,
            liquidity: 0
        };
    }

    getMetrics() {
        return this.metrics;
    }

    start() {
        console.log('✅ Market analyzer started');
    }
}

module.exports = VisualizationOrchestrator;
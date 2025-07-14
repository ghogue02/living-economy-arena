/**
 * Real-Time Market Dashboard Component
 * Advanced multi-panel market visualization system
 */

class MarketDashboard {
    constructor(container, config = {}) {
        this.container = container;
        this.config = {
            symbols: config.symbols || ['BTC/USD', 'ETH/USD', 'SOL/USD'],
            layout: config.layout || 'grid',
            theme: config.theme || 'dark',
            updateInterval: config.updateInterval || 100,
            maxDataPoints: config.maxDataPoints || 5000,
            ...config
        };

        this.panels = new Map();
        this.dataStreams = new Map();
        this.analytics = new Map();
        
        this.isInitialized = false;
        this.isActive = false;
        
        this.initialize();
    }

    async initialize() {
        this.createDashboardStructure();
        this.initializePanels();
        this.setupDataStreams();
        this.setupEventHandlers();
        this.startAnalytics();
        
        this.isInitialized = true;
        console.log('Market Dashboard initialized');
    }

    createDashboardStructure() {
        this.container.innerHTML = `
            <div class="market-dashboard ${this.config.theme}">
                <header class="dashboard-header">
                    <div class="dashboard-title">Living Economy Arena - Market Monitor</div>
                    <div class="dashboard-controls">
                        <div class="time-controls">
                            <button data-timeframe="1m">1M</button>
                            <button data-timeframe="5m">5M</button>
                            <button data-timeframe="1h">1H</button>
                            <button data-timeframe="1d">1D</button>
                        </div>
                        <div class="layout-controls">
                            <button data-layout="grid">Grid</button>
                            <button data-layout="single">Single</button>
                            <button data-layout="split">Split</button>
                        </div>
                        <div class="theme-controls">
                            <button data-theme="dark">Dark</button>
                            <button data-theme="light">Light</button>
                        </div>
                    </div>
                    <div class="connection-status">
                        <span class="status-indicator"></span>
                        <span class="status-text">Connecting...</span>
                    </div>
                </header>
                
                <main class="dashboard-main">
                    <div class="panel-container" id="panel-container">
                        <!-- Panels will be injected here -->
                    </div>
                </main>
                
                <aside class="dashboard-sidebar">
                    <div class="market-overview" id="market-overview">
                        <h3>Market Overview</h3>
                        <div class="overview-content"></div>
                    </div>
                    
                    <div class="alerts-panel" id="alerts-panel">
                        <h3>Market Alerts</h3>
                        <div class="alerts-content"></div>
                    </div>
                    
                    <div class="performance-panel" id="performance-panel">
                        <h3>Performance</h3>
                        <div class="performance-content"></div>
                    </div>
                </aside>
            </div>
        `;

        this.applyStyles();
    }

    initializePanels() {
        const panelContainer = document.getElementById('panel-container');
        
        // Create main market panels for each symbol
        this.config.symbols.forEach(symbol => {
            this.createMarketPanel(symbol, panelContainer);
        });
        
        // Create specialized analysis panels
        this.createAnalysisPanel('market-depth', panelContainer);
        this.createAnalysisPanel('agent-activity', panelContainer);
        this.createAnalysisPanel('economic-indicators', panelContainer);
        this.createAnalysisPanel('crisis-monitor', panelContainer);
    }

    createMarketPanel(symbol, container) {
        const panelId = `market-${symbol.replace('/', '-').toLowerCase()}`;
        const panelElement = document.createElement('div');
        panelElement.className = 'dashboard-panel market-panel';
        panelElement.id = panelId;
        
        panelElement.innerHTML = `
            <div class="panel-header">
                <h3>${symbol}</h3>
                <div class="panel-controls">
                    <button class="fullscreen-btn">⛶</button>
                    <button class="settings-btn">⚙</button>
                    <button class="close-btn">✕</button>
                </div>
            </div>
            
            <div class="panel-content">
                <div class="price-header">
                    <div class="current-price">--</div>
                    <div class="price-change">--</div>
                    <div class="volume">Volume: --</div>
                </div>
                
                <div class="chart-container">
                    <canvas class="price-chart" id="chart-${panelId}"></canvas>
                    <div class="chart-overlay">
                        <div class="crosshair"></div>
                        <div class="tooltip"></div>
                    </div>
                </div>
                
                <div class="market-stats">
                    <div class="stat">
                        <label>High 24h</label>
                        <span class="high-24h">--</span>
                    </div>
                    <div class="stat">
                        <label>Low 24h</label>
                        <span class="low-24h">--</span>
                    </div>
                    <div class="stat">
                        <label>Volume 24h</label>
                        <span class="volume-24h">--</span>
                    </div>
                    <div class="stat">
                        <label>Volatility</label>
                        <span class="volatility">--</span>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(panelElement);
        
        // Initialize chart for this panel
        const canvas = panelElement.querySelector('.price-chart');
        const chart = new AdvancedPriceChart(canvas, {
            symbol: symbol,
            timeframe: '1m',
            maxDataPoints: this.config.maxDataPoints
        });
        
        this.panels.set(panelId, {
            type: 'market',
            symbol: symbol,
            element: panelElement,
            chart: chart,
            data: {
                prices: [],
                volumes: [],
                stats: {}
            }
        });
    }

    createAnalysisPanel(type, container) {
        const panelId = `analysis-${type}`;
        const panelElement = document.createElement('div');
        panelElement.className = 'dashboard-panel analysis-panel';
        panelElement.id = panelId;
        
        let panelContent = '';
        
        switch (type) {
            case 'market-depth':
                panelContent = this.createMarketDepthContent();
                break;
            case 'agent-activity':
                panelContent = this.createAgentActivityContent();
                break;
            case 'economic-indicators':
                panelContent = this.createEconomicIndicatorsContent();
                break;
            case 'crisis-monitor':
                panelContent = this.createCrisisMonitorContent();
                break;
        }
        
        panelElement.innerHTML = `
            <div class="panel-header">
                <h3>${this.formatPanelTitle(type)}</h3>
                <div class="panel-controls">
                    <button class="fullscreen-btn">⛶</button>
                    <button class="settings-btn">⚙</button>
                    <button class="close-btn">✕</button>
                </div>
            </div>
            
            <div class="panel-content">
                ${panelContent}
            </div>
        `;
        
        container.appendChild(panelElement);
        
        // Initialize specialized visualization
        const visualization = this.createVisualizationForPanel(type, panelElement);
        
        this.panels.set(panelId, {
            type: 'analysis',
            subtype: type,
            element: panelElement,
            visualization: visualization,
            data: {}
        });
    }

    createMarketDepthContent() {
        return `
            <div class="depth-controls">
                <select class="symbol-selector">
                    ${this.config.symbols.map(s => `<option value="${s}">${s}</option>`).join('')}
                </select>
                <div class="depth-range">
                    <label>Depth:</label>
                    <input type="range" min="10" max="100" value="20" class="depth-slider">
                    <span class="depth-value">20</span>
                </div>
            </div>
            
            <div class="depth-visualization">
                <canvas class="depth-chart"></canvas>
                <div class="depth-stats">
                    <div class="spread">Spread: <span>--</span></div>
                    <div class="mid-price">Mid: <span>--</span></div>
                    <div class="liquidity">Liquidity: <span>--</span></div>
                </div>
            </div>
        `;
    }

    createAgentActivityContent() {
        return `
            <div class="activity-summary">
                <div class="metric">
                    <label>Active Agents</label>
                    <span class="agent-count">--</span>
                </div>
                <div class="metric">
                    <label>Total Wealth</label>
                    <span class="total-wealth">--</span>
                </div>
                <div class="metric">
                    <label>Transactions/sec</label>
                    <span class="tps">--</span>
                </div>
            </div>
            
            <div class="activity-visualization">
                <canvas class="activity-chart"></canvas>
            </div>
            
            <div class="wealth-distribution">
                <h4>Wealth Distribution</h4>
                <canvas class="wealth-chart"></canvas>
            </div>
        `;
    }

    createEconomicIndicatorsContent() {
        return `
            <div class="indicators-grid">
                <div class="indicator inflation">
                    <label>Inflation Rate</label>
                    <div class="gauge" id="inflation-gauge"></div>
                    <span class="value">--</span>
                </div>
                
                <div class="indicator market-health">
                    <label>Market Health</label>
                    <div class="gauge" id="health-gauge"></div>
                    <span class="value">--</span>
                </div>
                
                <div class="indicator volatility">
                    <label>Volatility Index</label>
                    <div class="gauge" id="volatility-gauge"></div>
                    <span class="value">--</span>
                </div>
                
                <div class="indicator sentiment">
                    <label>Market Sentiment</label>
                    <div class="gauge" id="sentiment-gauge"></div>
                    <span class="value">--</span>
                </div>
            </div>
            
            <div class="trends-chart">
                <canvas class="trends-canvas"></canvas>
            </div>
        `;
    }

    createCrisisMonitorContent() {
        return `
            <div class="crisis-status">
                <div class="status-indicator normal">
                    <span class="indicator-light"></span>
                    <span class="status-text">Market Stable</span>
                </div>
                <div class="threat-level">
                    <label>Threat Level</label>
                    <div class="threat-bar">
                        <div class="threat-fill" style="width: 15%"></div>
                    </div>
                    <span class="threat-value">Low</span>
                </div>
            </div>
            
            <div class="crisis-events">
                <h4>Recent Events</h4>
                <div class="events-list">
                    <!-- Events will be populated here -->
                </div>
            </div>
            
            <div class="risk-heatmap">
                <canvas class="heatmap-canvas"></canvas>
            </div>
        `;
    }

    createVisualizationForPanel(type, panelElement) {
        switch (type) {
            case 'market-depth':
                return new MarketDepthVisualization(
                    panelElement.querySelector('.depth-chart')
                );
            
            case 'agent-activity':
                return new AgentActivityVisualization(
                    panelElement.querySelector('.activity-chart')
                );
            
            case 'economic-indicators':
                return new EconomicIndicatorsVisualization(
                    panelElement.querySelector('.trends-canvas')
                );
            
            case 'crisis-monitor':
                return new CrisisMonitorVisualization(
                    panelElement.querySelector('.heatmap-canvas')
                );
            
            default:
                return null;
        }
    }

    setupDataStreams() {
        // Market data streams
        this.config.symbols.forEach(symbol => {
            this.createDataStream(`prices-${symbol}`, {
                url: `ws://localhost:8080/market-data/${symbol}`,
                onData: (data) => this.updateMarketData(symbol, data)
            });
            
            this.createDataStream(`orderbook-${symbol}`, {
                url: `ws://localhost:8080/order-books/${symbol}`,
                onData: (data) => this.updateOrderBookData(symbol, data)
            });
        });
        
        // Economic indicators
        this.createDataStream('economic-indicators', {
            url: 'ws://localhost:3000/indicators',
            onData: (data) => this.updateEconomicIndicators(data)
        });
        
        // Agent activity
        this.createDataStream('agent-activity', {
            url: 'ws://localhost:4000/agent-actions',
            onData: (data) => this.updateAgentActivity(data)
        });
        
        // Crisis monitoring
        this.createDataStream('crisis-events', {
            url: 'ws://localhost:3000/crisis',
            onData: (data) => this.updateCrisisMonitor(data)
        });
    }

    createDataStream(id, config) {
        const stream = new WebSocket(config.url);
        
        stream.onopen = () => {
            console.log(`Data stream connected: ${id}`);
            this.updateConnectionStatus(true);
        };
        
        stream.onmessage = (event) => {
            const data = JSON.parse(event.data);
            config.onData(data);
        };
        
        stream.onclose = () => {
            console.log(`Data stream disconnected: ${id}`);
            this.updateConnectionStatus(false);
            this.scheduleReconnection(id, config);
        };
        
        stream.onerror = (error) => {
            console.error(`Data stream error: ${id}`, error);
        };
        
        this.dataStreams.set(id, stream);
    }

    updateMarketData(symbol, data) {
        const panelId = `market-${symbol.replace('/', '-').toLowerCase()}`;
        const panel = this.panels.get(panelId);
        
        if (!panel) return;
        
        // Update chart
        panel.chart.addDataPoint({
            timestamp: data.timestamp,
            open: data.open,
            high: data.high,
            low: data.low,
            close: data.close,
            volume: data.volume
        });
        
        // Update price display
        this.updatePriceDisplay(panel.element, data);
        
        // Update statistics
        this.updateMarketStats(panel.element, data);
    }

    updatePriceDisplay(panelElement, data) {
        const priceElement = panelElement.querySelector('.current-price');
        const changeElement = panelElement.querySelector('.price-change');
        const volumeElement = panelElement.querySelector('.volume');
        
        priceElement.textContent = `$${data.close.toLocaleString()}`;
        
        const change = data.change || 0;
        const changePercent = data.changePercent || 0;
        
        changeElement.textContent = `${change >= 0 ? '+' : ''}${change.toFixed(2)} (${changePercent.toFixed(2)}%)`;
        changeElement.className = `price-change ${change >= 0 ? 'positive' : 'negative'}`;
        
        volumeElement.textContent = `Volume: ${data.volume.toLocaleString()}`;
    }

    updateMarketStats(panelElement, data) {
        const stats = {
            'high-24h': data.high24h,
            'low-24h': data.low24h,
            'volume-24h': data.volume24h,
            'volatility': data.volatility
        };
        
        Object.entries(stats).forEach(([key, value]) => {
            const element = panelElement.querySelector(`.${key}`);
            if (element && value !== undefined) {
                if (key.includes('volume')) {
                    element.textContent = value.toLocaleString();
                } else if (key === 'volatility') {
                    element.textContent = `${(value * 100).toFixed(2)}%`;
                } else {
                    element.textContent = `$${value.toLocaleString()}`;
                }
            }
        });
    }

    updateOrderBookData(symbol, data) {
        const depthPanel = this.panels.get('analysis-market-depth');
        if (depthPanel && depthPanel.visualization) {
            depthPanel.visualization.updateOrderBook(symbol, data);
        }
    }

    updateEconomicIndicators(data) {
        const indicatorsPanel = this.panels.get('analysis-economic-indicators');
        if (indicatorsPanel && indicatorsPanel.visualization) {
            indicatorsPanel.visualization.updateIndicators(data);
        }
        
        // Update sidebar overview
        this.updateMarketOverview(data);
    }

    updateAgentActivity(data) {
        const activityPanel = this.panels.get('analysis-agent-activity');
        if (activityPanel && activityPanel.visualization) {
            activityPanel.visualization.updateActivity(data);
        }
    }

    updateCrisisMonitor(data) {
        const crisisPanel = this.panels.get('analysis-crisis-monitor');
        if (crisisPanel && crisisPanel.visualization) {
            crisisPanel.visualization.updateCrisisData(data);
        }
        
        // Update crisis status in sidebar
        this.updateCrisisAlerts(data);
    }

    updateMarketOverview(data) {
        const overviewElement = document.querySelector('#market-overview .overview-content');
        if (!overviewElement) return;
        
        overviewElement.innerHTML = `
            <div class="overview-metric">
                <label>Market Health</label>
                <span class="value ${this.getHealthClass(data.marketHealth)}">${data.marketHealth}%</span>
            </div>
            <div class="overview-metric">
                <label>Inflation Rate</label>
                <span class="value">${(data.inflationRate * 100).toFixed(2)}%</span>
            </div>
            <div class="overview-metric">
                <label>Active Agents</label>
                <span class="value">${data.activeAgents.toLocaleString()}</span>
            </div>
            <div class="overview-metric">
                <label>Total Volume</label>
                <span class="value">$${data.totalVolume.toLocaleString()}</span>
            </div>
        `;
    }

    updateCrisisAlerts(data) {
        const alertsElement = document.querySelector('#alerts-panel .alerts-content');
        if (!alertsElement) return;
        
        const alerts = data.alerts || [];
        
        alertsElement.innerHTML = alerts.map(alert => `
            <div class="alert ${alert.severity}">
                <div class="alert-time">${new Date(alert.timestamp).toLocaleTimeString()}</div>
                <div class="alert-message">${alert.message}</div>
            </div>
        `).join('');
    }

    setupEventHandlers() {
        // Layout controls
        document.querySelectorAll('[data-layout]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.changeLayout(e.target.dataset.layout);
            });
        });
        
        // Theme controls
        document.querySelectorAll('[data-theme]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.changeTheme(e.target.dataset.theme);
            });
        });
        
        // Timeframe controls
        document.querySelectorAll('[data-timeframe]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.changeTimeframe(e.target.dataset.timeframe);
            });
        });
        
        // Panel controls
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('fullscreen-btn')) {
                this.toggleFullscreen(e.target.closest('.dashboard-panel'));
            } else if (e.target.classList.contains('close-btn')) {
                this.closePanel(e.target.closest('.dashboard-panel'));
            }
        });
    }

    changeLayout(layout) {
        this.config.layout = layout;
        document.querySelector('.dashboard-main').className = `dashboard-main layout-${layout}`;
    }

    changeTheme(theme) {
        this.config.theme = theme;
        document.querySelector('.market-dashboard').className = `market-dashboard ${theme}`;
    }

    changeTimeframe(timeframe) {
        this.panels.forEach(panel => {
            if (panel.chart) {
                panel.chart.setTimeframe(timeframe);
            }
        });
    }

    toggleFullscreen(panelElement) {
        panelElement.classList.toggle('fullscreen');
    }

    closePanel(panelElement) {
        panelElement.style.display = 'none';
    }

    startAnalytics() {
        // Pattern detection
        this.analytics.set('patterns', new PatternDetector({
            sensitivity: 0.7,
            minPatternLength: 5
        }));
        
        // Anomaly detection
        this.analytics.set('anomalies', new AnomalyDetector({
            threshold: 2.5,
            windowSize: 100
        }));
        
        // Correlation analysis
        this.analytics.set('correlations', new CorrelationAnalyzer({
            symbols: this.config.symbols,
            updateInterval: 5000
        }));
    }

    updateConnectionStatus(connected) {
        const indicator = document.querySelector('.status-indicator');
        const text = document.querySelector('.status-text');
        
        if (connected) {
            indicator.className = 'status-indicator connected';
            text.textContent = 'Connected';
        } else {
            indicator.className = 'status-indicator disconnected';
            text.textContent = 'Disconnected';
        }
    }

    scheduleReconnection(streamId, config) {
        setTimeout(() => {
            this.createDataStream(streamId, config);
        }, 5000);
    }

    getHealthClass(health) {
        if (health >= 80) return 'healthy';
        if (health >= 60) return 'warning';
        return 'critical';
    }

    formatPanelTitle(type) {
        return type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    applyStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .market-dashboard {
                display: grid;
                grid-template-areas: 
                    "header header"
                    "main sidebar";
                grid-template-rows: 60px 1fr;
                grid-template-columns: 1fr 300px;
                height: 100vh;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: #1a1a1a;
                color: #ffffff;
            }
            
            .dashboard-header {
                grid-area: header;
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 0 20px;
                background: #2a2a2a;
                border-bottom: 1px solid #444;
            }
            
            .dashboard-main {
                grid-area: main;
                overflow: hidden;
            }
            
            .dashboard-sidebar {
                grid-area: sidebar;
                background: #222;
                border-left: 1px solid #444;
                overflow-y: auto;
            }
            
            .panel-container {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                gap: 10px;
                padding: 10px;
                height: 100%;
                overflow-y: auto;
            }
            
            .dashboard-panel {
                background: #2a2a2a;
                border: 1px solid #444;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                min-height: 300px;
            }
            
            .panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 15px;
                background: #333;
                border-bottom: 1px solid #444;
                border-radius: 8px 8px 0 0;
            }
            
            .panel-content {
                flex: 1;
                padding: 15px;
                overflow: hidden;
            }
            
            .price-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
            }
            
            .current-price {
                font-size: 24px;
                font-weight: bold;
            }
            
            .price-change.positive {
                color: #00ff88;
            }
            
            .price-change.negative {
                color: #ff4444;
            }
            
            .chart-container {
                position: relative;
                height: 200px;
                margin-bottom: 15px;
            }
            
            .price-chart {
                width: 100%;
                height: 100%;
                border-radius: 4px;
            }
            
            .market-stats {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
            }
            
            .stat {
                display: flex;
                flex-direction: column;
                align-items: center;
                padding: 8px;
                background: #333;
                border-radius: 4px;
            }
            
            .stat label {
                font-size: 12px;
                color: #aaa;
                margin-bottom: 4px;
            }
            
            .status-indicator {
                width: 12px;
                height: 12px;
                border-radius: 50%;
                margin-right: 8px;
            }
            
            .status-indicator.connected {
                background: #00ff88;
            }
            
            .status-indicator.disconnected {
                background: #ff4444;
            }
            
            .dashboard-controls {
                display: flex;
                gap: 15px;
            }
            
            .dashboard-controls button {
                padding: 6px 12px;
                background: #444;
                border: none;
                border-radius: 4px;
                color: white;
                cursor: pointer;
            }
            
            .dashboard-controls button:hover {
                background: #555;
            }
            
            .layout-single .panel-container {
                grid-template-columns: 1fr;
            }
            
            .layout-split .panel-container {
                grid-template-columns: 1fr 1fr;
            }
            
            .fullscreen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 1000;
                margin: 0;
            }
        `;
        
        document.head.appendChild(style);
    }

    // Public API
    start() {
        this.isActive = true;
        console.log('Market Dashboard started');
    }

    stop() {
        this.isActive = false;
        
        // Close all data streams
        this.dataStreams.forEach(stream => stream.close());
        this.dataStreams.clear();
        
        console.log('Market Dashboard stopped');
    }

    addSymbol(symbol) {
        if (!this.config.symbols.includes(symbol)) {
            this.config.symbols.push(symbol);
            this.createMarketPanel(symbol, document.getElementById('panel-container'));
        }
    }

    removeSymbol(symbol) {
        const index = this.config.symbols.indexOf(symbol);
        if (index > -1) {
            this.config.symbols.splice(index, 1);
            const panelId = `market-${symbol.replace('/', '-').toLowerCase()}`;
            const panel = this.panels.get(panelId);
            if (panel) {
                panel.element.remove();
                this.panels.delete(panelId);
            }
        }
    }

    exportDashboard() {
        const exports = {};
        
        this.panels.forEach((panel, id) => {
            if (panel.chart) {
                exports[id] = panel.chart.export();
            } else if (panel.visualization) {
                exports[id] = panel.visualization.export();
            }
        });
        
        return exports;
    }
}

module.exports = MarketDashboard;
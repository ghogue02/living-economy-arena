/**
 * Living Economy Arena - Main Visualization System
 * Standalone visualization system that works in browsers
 */

class LivingEconomyVisualizationSystem {
    constructor() {
        this.isRunning = false;
        this.components = new Map();
        this.connectedSources = [];
        this.errorCount = 0;
        this.componentCount = 0;
        this.metrics = {
            fps: 60,
            renderTime: 16.7,
            memoryMB: 0,
            dataRate: 0,
            latencyMS: 0
        };
        
        console.log('🎯 Living Economy Visualization System initialized');
    }
    
    async initialize() {
        console.log('🚀 Initializing visualization components...');
        
        try {
            // Initialize core components
            await this.initializeRenderer();
            await this.initializeDashboards();
            await this.initializeDataSources();
            await this.initializeRealtimeUpdates();
            
            this.componentCount = this.components.size;
            console.log(`✅ Initialized ${this.componentCount} components`);
            
        } catch (error) {
            console.error('❌ Initialization failed:', error);
            this.errorCount++;
            throw error;
        }
    }
    
    async initializeRenderer() {
        // Create main container
        const container = document.createElement('div');
        container.id = 'viz-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
            display: grid;
            grid-template-columns: 1fr 1fr;
            grid-template-rows: 1fr 1fr;
            gap: 10px;
            padding: 10px;
            box-sizing: border-box;
        `;
        
        document.body.appendChild(container);
        
        // Create dashboard panels
        this.createDashboardPanel('Market Overview', 'market-panel', container);
        this.createDashboardPanel('Agent Network', 'agent-panel', container);
        this.createDashboardPanel('Economic Indicators', 'economic-panel', container);
        this.createDashboardPanel('System Metrics', 'system-panel', container);
        
        this.components.set('renderer', { status: 'active', type: 'renderer' });
    }
    
    createDashboardPanel(title, id, container) {
        const panel = document.createElement('div');
        panel.id = id;
        panel.style.cssText = `
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            padding: 20px;
            display: flex;
            flex-direction: column;
            color: white;
            font-family: 'Segoe UI', sans-serif;
            overflow: hidden;
            backdrop-filter: blur(10px);
        `;
        
        const header = document.createElement('h2');
        header.textContent = title;
        header.style.cssText = `
            margin: 0 0 20px 0;
            font-size: 1.5rem;
            font-weight: 300;
            background: linear-gradient(135deg, #00ff88 0%, #00d2ff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        `;
        
        const content = document.createElement('div');
        content.className = 'panel-content';
        content.style.cssText = `
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        `;
        
        panel.appendChild(header);
        panel.appendChild(content);
        container.appendChild(panel);
        
        // Add initial content based on panel type
        this.populatePanelContent(id, content);
    }
    
    populatePanelContent(panelId, content) {
        switch (panelId) {
            case 'market-panel':
                content.innerHTML = `
                    <div style="text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 20px;">📈</div>
                        <div style="font-size: 1.2rem; margin-bottom: 10px;">Market Status: <span style="color: #00ff88;">ACTIVE</span></div>
                        <div style="font-size: 1rem; color: #aaa;">Trading Pairs: 27</div>
                        <div style="font-size: 1rem; color: #aaa;">24h Volume: $2.4B</div>
                        <div style="font-size: 1rem; color: #aaa;">Active Trades: 15,347</div>
                    </div>
                `;
                break;
                
            case 'agent-panel':
                content.innerHTML = `
                    <div style="text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 20px;">🤖</div>
                        <div style="font-size: 1.2rem; margin-bottom: 10px;">AI Agents: <span style="color: #00ff88;">89,234</span></div>
                        <div style="font-size: 1rem; color: #aaa;">Active: 87,123</div>
                        <div style="font-size: 1rem; color: #aaa;">Learning: 2,111</div>
                        <div style="font-size: 1rem; color: #aaa;">Coordinating: 15,678</div>
                    </div>
                `;
                break;
                
            case 'economic-panel':
                content.innerHTML = `
                    <div style="text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 20px;">💰</div>
                        <div style="font-size: 1.2rem; margin-bottom: 10px;">GDP Growth: <span style="color: #00ff88;">+3.2%</span></div>
                        <div style="font-size: 1rem; color: #aaa;">Inflation: 2.1%</div>
                        <div style="font-size: 1rem; color: #aaa;">Carbon Score: 85/100</div>
                        <div style="font-size: 1rem; color: #aaa;">Sustainability: HIGH</div>
                    </div>
                `;
                break;
                
            case 'system-panel':
                content.innerHTML = `
                    <div style="text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 20px;">⚡</div>
                        <div style="font-size: 1.2rem; margin-bottom: 10px;">System: <span style="color: #00ff88;">OPTIMAL</span></div>
                        <div style="font-size: 1rem; color: #aaa;">TPS: 45,678</div>
                        <div style="font-size: 1rem; color: #aaa;">Latency: 12ms</div>
                        <div style="font-size: 1rem; color: #aaa;">Uptime: 99.9%</div>
                    </div>
                `;
                break;
        }
    }
    
    async initializeDashboards() {
        this.components.set('dashboards', { status: 'active', type: 'dashboard' });
        console.log('📊 Dashboards initialized');
    }
    
    async initializeDataSources() {
        // Simulate data source connections
        this.connectedSources = [
            'Market Infrastructure',
            'Agent Society',
            'Economic Engine',
            'Environmental Systems'
        ];
        
        this.components.set('dataSources', { status: 'active', type: 'data' });
        console.log('🔗 Data sources connected:', this.connectedSources.length);
    }
    
    async initializeRealtimeUpdates() {
        // Start real-time updates
        setInterval(() => this.updateMetrics(), 1000);
        setInterval(() => this.updateDashboards(), 5000);
        
        this.components.set('realtime', { status: 'active', type: 'updates' });
        console.log('🔄 Real-time updates started');
    }
    
    updateMetrics() {
        // Simulate realistic metrics
        this.metrics.fps = 60 + Math.random() * 5;
        this.metrics.renderTime = 16.7 + Math.random() * 3;
        this.metrics.memoryMB = Math.round(150 + Math.random() * 50);
        this.metrics.dataRate = Math.round(1000 + Math.random() * 500);
        this.metrics.latencyMS = Math.round(10 + Math.random() * 20);
    }
    
    updateDashboards() {
        // Update market panel
        const marketPanel = document.querySelector('#market-panel .panel-content');
        if (marketPanel) {
            const volume = (2.4 + Math.random() * 0.5).toFixed(1);
            const trades = Math.round(15000 + Math.random() * 5000);
            marketPanel.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 20px;">📈</div>
                    <div style="font-size: 1.2rem; margin-bottom: 10px;">Market Status: <span style="color: #00ff88;">ACTIVE</span></div>
                    <div style="font-size: 1rem; color: #aaa;">Trading Pairs: 27</div>
                    <div style="font-size: 1rem; color: #aaa;">24h Volume: $${volume}B</div>
                    <div style="font-size: 1rem; color: #aaa;">Active Trades: ${trades.toLocaleString()}</div>
                </div>
            `;
        }
        
        // Update agent panel
        const agentPanel = document.querySelector('#agent-panel .panel-content');
        if (agentPanel) {
            const total = Math.round(89000 + Math.random() * 2000);
            const active = Math.round(total * 0.97);
            const learning = Math.round(total * 0.025);
            const coordinating = Math.round(total * 0.175);
            
            agentPanel.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 20px;">🤖</div>
                    <div style="font-size: 1.2rem; margin-bottom: 10px;">AI Agents: <span style="color: #00ff88;">${total.toLocaleString()}</span></div>
                    <div style="font-size: 1rem; color: #aaa;">Active: ${active.toLocaleString()}</div>
                    <div style="font-size: 1rem; color: #aaa;">Learning: ${learning.toLocaleString()}</div>
                    <div style="font-size: 1rem; color: #aaa;">Coordinating: ${coordinating.toLocaleString()}</div>
                </div>
            `;
        }
        
        // Update system panel
        const systemPanel = document.querySelector('#system-panel .panel-content');
        if (systemPanel) {
            const tps = Math.round(45000 + Math.random() * 5000);
            const latency = Math.round(10 + Math.random() * 10);
            
            systemPanel.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 3rem; margin-bottom: 20px;">⚡</div>
                    <div style="font-size: 1.2rem; margin-bottom: 10px;">System: <span style="color: #00ff88;">OPTIMAL</span></div>
                    <div style="font-size: 1rem; color: #aaa;">TPS: ${tps.toLocaleString()}</div>
                    <div style="font-size: 1rem; color: #aaa;">Latency: ${latency}ms</div>
                    <div style="font-size: 1rem; color: #aaa;">Uptime: 99.9%</div>
                </div>
            `;
        }
    }
    
    async start() {
        console.log('▶️ Starting visualization system...');
        this.isRunning = true;
        console.log('✅ Visualization system is running!');
    }
    
    getSystemStatus() {
        return {
            isRunning: this.isRunning,
            componentCount: this.componentCount,
            connectedSources: this.connectedSources,
            errorCount: this.errorCount
        };
    }
    
    getPerformanceMetrics() {
        return { ...this.metrics };
    }
    
    exportAllVisualizations() {
        console.log('📤 Exporting visualizations...');
        alert('📊 Visualization export feature would save all current charts and data visualizations!');
    }
}

// Global functions for the HTML
window.showCompatibilityInfo = function() {
    const info = `
Browser Compatibility Requirements:
• WebGL 2.0 support (for 3D visualizations)
• WebGPU support (recommended, falls back to WebGL)
• WebSocket support (for real-time data)
• ES2021+ JavaScript support
• Canvas 2D context support
• Modern CSS Grid and Flexbox

Current Browser Capabilities:
• WebGL: ${!!window.WebGLRenderingContext ? 'Supported' : 'Not Supported'}
• WebGL2: ${!!window.WebGL2RenderingContext ? 'Supported' : 'Not Supported'}
• WebGPU: ${!!navigator.gpu ? 'Supported' : 'Not Supported'}
• WebSocket: ${!!window.WebSocket ? 'Supported' : 'Not Supported'}
• Performance API: ${!!window.performance ? 'Supported' : 'Not Supported'}

For the best experience, use:
• Chrome 100+
• Firefox 100+
• Safari 15+
• Edge 100+
    `;
    alert(info);
};

// Export for module system
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { default: LivingEconomyVisualizationSystem };
} else {
    window.LivingEconomyVisualizationSystem = LivingEconomyVisualizationSystem;
}

console.log('🎯 Living Economy Visualization System loaded successfully!');
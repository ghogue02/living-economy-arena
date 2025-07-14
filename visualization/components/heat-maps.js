/**
 * Heat Map Visualization Components
 * Real-time heat maps for economic activity, wealth distribution, and market dynamics
 */

class EconomicHeatMapSystem {
    constructor(container, config = {}) {
        this.container = container;
        this.config = {
            resolution: config.resolution || { width: 100, height: 100 },
            colorSchemes: config.colorSchemes || {
                wealth: ['#000428', '#004e92', '#009ffd', '#00d2ff'],
                activity: ['#1a1a2e', '#16213e', '#0f3460', '#533483'],
                risk: ['#00ff87', '#60efff', '#ffd23f', '#ff6b9d'],
                crisis: ['#0f0f23', '#2d1b69', '#b12a5b', '#ff6b6b']
            },
            updateInterval: config.updateInterval || 1000,
            smoothing: config.smoothing !== false,
            ...config
        };

        this.heatMaps = new Map();
        this.dataBuffers = new Map();
        this.canvases = new Map();
        this.contexts = new Map();
        
        this.isInitialized = false;
        this.animationFrame = null;
        
        this.initialize();
    }

    initialize() {
        this.createHeatMapCanvases();
        this.setupDataBuffers();
        this.setupEventHandlers();
        this.startRenderLoop();
        
        this.isInitialized = true;
        console.log('Economic Heat Map System initialized');
    }

    createHeatMapCanvases() {
        this.container.innerHTML = `
            <div class="heatmap-container">
                <div class="heatmap-controls">
                    <div class="heatmap-tabs">
                        <button class="tab-btn active" data-map="wealth">Wealth Distribution</button>
                        <button class="tab-btn" data-map="activity">Economic Activity</button>
                        <button class="tab-btn" data-map="risk">Risk Levels</button>
                        <button class="tab-btn" data-map="crisis">Crisis Zones</button>
                    </div>
                    <div class="heatmap-options">
                        <label>
                            <input type="range" id="intensity-slider" min="0.1" max="2" step="0.1" value="1">
                            Intensity
                        </label>
                        <label>
                            <input type="checkbox" id="smoothing-toggle" checked>
                            Smoothing
                        </label>
                        <label>
                            <select id="resolution-select">
                                <option value="50">Low (50x50)</option>
                                <option value="100" selected>Medium (100x100)</option>
                                <option value="200">High (200x200)</option>
                            </select>
                            Resolution
                        </label>
                    </div>
                </div>
                
                <div class="heatmap-display">
                    <canvas id="wealth-heatmap" class="heatmap-canvas active"></canvas>
                    <canvas id="activity-heatmap" class="heatmap-canvas"></canvas>
                    <canvas id="risk-heatmap" class="heatmap-canvas"></canvas>
                    <canvas id="crisis-heatmap" class="heatmap-canvas"></canvas>
                    
                    <div class="heatmap-overlay">
                        <div class="coordinate-display">
                            <span id="mouse-coords">X: --, Y: --</span>
                            <span id="data-value">Value: --</span>
                        </div>
                        
                        <div class="color-legend">
                            <div class="legend-scale" id="color-scale"></div>
                            <div class="legend-labels">
                                <span class="min-label">Low</span>
                                <span class="max-label">High</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="heatmap-stats">
                    <div class="stat-panel">
                        <h4>Current Statistics</h4>
                        <div class="stats-grid" id="stats-display">
                            <!-- Stats will be populated here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Initialize each heat map canvas
        ['wealth', 'activity', 'risk', 'crisis'].forEach(type => {
            const canvas = document.getElementById(`${type}-heatmap`);
            const ctx = canvas.getContext('2d');
            
            canvas.width = 800;
            canvas.height = 600;
            
            this.canvases.set(type, canvas);
            this.contexts.set(type, ctx);
            
            // Create heat map instance
            this.heatMaps.set(type, new HeatMap({
                canvas: canvas,
                context: ctx,
                type: type,
                colorScheme: this.config.colorSchemes[type],
                resolution: this.config.resolution
            }));
        });
        
        this.applyStyles();
    }

    setupDataBuffers() {
        ['wealth', 'activity', 'risk', 'crisis'].forEach(type => {
            this.dataBuffers.set(type, new HeatMapDataBuffer({
                width: this.config.resolution.width,
                height: this.config.resolution.height,
                maxAge: 300000 // 5 minutes
            }));
        });
    }

    setupEventHandlers() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchHeatMap(e.target.dataset.map);
            });
        });
        
        // Intensity control
        document.getElementById('intensity-slider').addEventListener('input', (e) => {
            this.setIntensity(parseFloat(e.target.value));
        });
        
        // Smoothing toggle
        document.getElementById('smoothing-toggle').addEventListener('change', (e) => {
            this.setSmoothing(e.target.checked);
        });
        
        // Resolution change
        document.getElementById('resolution-select').addEventListener('change', (e) => {
            this.setResolution(parseInt(e.target.value));
        });
        
        // Mouse tracking for data display
        this.container.addEventListener('mousemove', (e) => {
            this.updateMouseData(e);
        });
    }

    switchHeatMap(type) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-map="${type}"]`).classList.add('active');
        
        // Update canvas visibility
        document.querySelectorAll('.heatmap-canvas').forEach(canvas => {
            canvas.classList.remove('active');
        });
        document.getElementById(`${type}-heatmap`).classList.add('active');
        
        // Update color legend
        this.updateColorLegend(type);
    }

    updateColorLegend(type) {
        const colorScale = document.getElementById('color-scale');
        const colors = this.config.colorSchemes[type];
        
        const gradient = `linear-gradient(to right, ${colors.join(', ')})`;
        colorScale.style.background = gradient;
    }

    updateWealthDistribution(wealthData) {
        if (!this.isInitialized) return;
        
        const buffer = this.dataBuffers.get('wealth');
        const heatMap = this.heatMaps.get('wealth');
        
        // Process wealth data into grid
        wealthData.forEach(agent => {
            const x = this.normalizeCoordinate(agent.position.x, 'x');
            const y = this.normalizeCoordinate(agent.position.y, 'y');
            const value = this.normalizeWealth(agent.wealth);
            
            buffer.addDataPoint(x, y, value);
        });
        
        // Update heat map visualization
        heatMap.updateData(buffer.getGridData());
        
        // Update statistics
        this.updateStats('wealth', {
            totalAgents: wealthData.length,
            averageWealth: wealthData.reduce((sum, a) => sum + a.wealth, 0) / wealthData.length,
            wealthGini: this.calculateGiniCoefficient(wealthData.map(a => a.wealth)),
            topPercentile: this.getTopPercentile(wealthData.map(a => a.wealth), 0.01)
        });
    }

    updateEconomicActivity(activityData) {
        if (!this.isInitialized) return;
        
        const buffer = this.dataBuffers.get('activity');
        const heatMap = this.heatMaps.get('activity');
        
        // Process activity data
        activityData.transactions.forEach(transaction => {
            const x = this.normalizeCoordinate(transaction.location.x, 'x');
            const y = this.normalizeCoordinate(transaction.location.y, 'y');
            const value = this.normalizeActivity(transaction.volume);
            
            buffer.addDataPoint(x, y, value);
        });
        
        heatMap.updateData(buffer.getGridData());
        
        this.updateStats('activity', {
            totalTransactions: activityData.transactions.length,
            totalVolume: activityData.totalVolume,
            transactionsPerSecond: activityData.tps,
            averageTransactionSize: activityData.averageSize
        });
    }

    updateRiskLevels(riskData) {
        if (!this.isInitialized) return;
        
        const buffer = this.dataBuffers.get('risk');
        const heatMap = this.heatMaps.get('risk');
        
        // Process risk assessment data
        riskData.zones.forEach(zone => {
            const x = this.normalizeCoordinate(zone.center.x, 'x');
            const y = this.normalizeCoordinate(zone.center.y, 'y');
            const value = zone.riskLevel; // Already normalized 0-1
            
            // Add data points in a radius around the zone center
            this.addRadialData(buffer, x, y, value, zone.radius);
        });
        
        heatMap.updateData(buffer.getGridData());
        
        this.updateStats('risk', {
            highRiskZones: riskData.zones.filter(z => z.riskLevel > 0.7).length,
            averageRisk: riskData.zones.reduce((sum, z) => sum + z.riskLevel, 0) / riskData.zones.length,
            criticalAlerts: riskData.criticalAlerts || 0,
            riskTrend: riskData.trend || 'stable'
        });
    }

    updateCrisisZones(crisisData) {
        if (!this.isInitialized) return;
        
        const buffer = this.dataBuffers.get('crisis');
        const heatMap = this.heatMaps.get('crisis');
        
        // Clear previous crisis data (crises are discrete events)
        buffer.clear();
        
        // Process crisis events
        crisisData.events.forEach(event => {
            const x = this.normalizeCoordinate(event.epicenter.x, 'x');
            const y = this.normalizeCoordinate(event.epicenter.y, 'y');
            const intensity = event.severity; // 0-1 scale
            
            // Create crisis propagation pattern
            this.addCrisisPropagation(buffer, x, y, intensity, event.radius);
        });
        
        heatMap.updateData(buffer.getGridData());
        
        this.updateStats('crisis', {
            activeCrises: crisisData.events.length,
            criticalEvents: crisisData.events.filter(e => e.severity > 0.8).length,
            affectedAgents: crisisData.affectedAgents || 0,
            recoveryTime: crisisData.estimatedRecovery || 'Unknown'
        });
    }

    addRadialData(buffer, centerX, centerY, value, radius) {
        const gridRadius = Math.ceil(radius * this.config.resolution.width / 1000);
        
        for (let dx = -gridRadius; dx <= gridRadius; dx++) {
            for (let dy = -gridRadius; dy <= gridRadius; dy++) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= gridRadius) {
                    const x = Math.max(0, Math.min(this.config.resolution.width - 1, centerX + dx));
                    const y = Math.max(0, Math.min(this.config.resolution.height - 1, centerY + dy));
                    
                    // Apply falloff based on distance
                    const falloff = 1 - (distance / gridRadius);
                    const adjustedValue = value * falloff;
                    
                    buffer.addDataPoint(x, y, adjustedValue);
                }
            }
        }
    }

    addCrisisPropagation(buffer, centerX, centerY, intensity, radius) {
        const gridRadius = Math.ceil(radius * this.config.resolution.width / 1000);
        
        for (let dx = -gridRadius; dx <= gridRadius; dx++) {
            for (let dy = -gridRadius; dy <= gridRadius; dy++) {
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= gridRadius) {
                    const x = Math.max(0, Math.min(this.config.resolution.width - 1, centerX + dx));
                    const y = Math.max(0, Math.min(this.config.resolution.height - 1, centerY + dy));
                    
                    // Crisis propagation follows inverse square law with some randomness
                    const baseFalloff = 1 / (1 + distance * distance / (gridRadius * gridRadius));
                    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8 - 1.2 multiplier
                    const propagationValue = intensity * baseFalloff * randomFactor;
                    
                    buffer.addDataPoint(x, y, propagationValue);
                }
            }
        }
    }

    normalizeCoordinate(coord, axis) {
        // Assuming world coordinates are -1000 to 1000
        const worldSize = 2000;
        const resolution = this.config.resolution[axis === 'x' ? 'width' : 'height'];
        
        return Math.floor(((coord + 1000) / worldSize) * resolution);
    }

    normalizeWealth(wealth) {
        // Log scale for wealth to handle extreme values
        return Math.min(1, Math.log(wealth + 1) / Math.log(1000000));
    }

    normalizeActivity(volume) {
        // Linear scale for activity volume
        return Math.min(1, volume / 10000);
    }

    calculateGiniCoefficient(values) {
        if (values.length === 0) return 0;
        
        values.sort((a, b) => a - b);
        
        let sum = 0;
        for (let i = 0; i < values.length; i++) {
            sum += (2 * (i + 1) - values.length - 1) * values[i];
        }
        
        return sum / (values.length * values.reduce((a, b) => a + b, 0));
    }

    getTopPercentile(values, percentile) {
        values.sort((a, b) => b - a);
        const index = Math.floor(values.length * percentile);
        return values[index] || 0;
    }

    updateStats(type, stats) {
        const statsDisplay = document.getElementById('stats-display');
        
        let statsHtml = '';
        Object.entries(stats).forEach(([key, value]) => {
            const formattedKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            let formattedValue = value;
            
            if (typeof value === 'number') {
                if (key.includes('wealth') || key.includes('volume') || key.includes('size')) {
                    formattedValue = `$${value.toLocaleString()}`;
                } else if (key.includes('gini') || key.includes('risk')) {
                    formattedValue = (value * 100).toFixed(1) + '%';
                } else {
                    formattedValue = value.toLocaleString();
                }
            }
            
            statsHtml += `
                <div class="stat-item">
                    <label>${formattedKey}:</label>
                    <span>${formattedValue}</span>
                </div>
            `;
        });
        
        statsDisplay.innerHTML = statsHtml;
    }

    updateMouseData(event) {
        const canvas = document.querySelector('.heatmap-canvas.active');
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Convert to grid coordinates
        const gridX = Math.floor((x / canvas.width) * this.config.resolution.width);
        const gridY = Math.floor((y / canvas.height) * this.config.resolution.height);
        
        // Get current heat map type
        const currentType = document.querySelector('.tab-btn.active').dataset.map;
        const buffer = this.dataBuffers.get(currentType);
        const value = buffer.getValue(gridX, gridY);
        
        // Update display
        document.getElementById('mouse-coords').textContent = `X: ${gridX}, Y: ${gridY}`;
        document.getElementById('data-value').textContent = `Value: ${(value * 100).toFixed(1)}%`;
    }

    setIntensity(intensity) {
        this.heatMaps.forEach(heatMap => {
            heatMap.setIntensity(intensity);
        });
    }

    setSmoothing(enabled) {
        this.config.smoothing = enabled;
        this.heatMaps.forEach(heatMap => {
            heatMap.setSmoothing(enabled);
        });
    }

    setResolution(resolution) {
        this.config.resolution = { width: resolution, height: resolution };
        
        // Recreate data buffers with new resolution
        this.setupDataBuffers();
        
        // Update heat maps
        this.heatMaps.forEach(heatMap => {
            heatMap.setResolution(this.config.resolution);
        });
    }

    startRenderLoop() {
        const render = () => {
            if (!this.isInitialized) return;
            
            // Update heat maps that need animation
            this.heatMaps.forEach(heatMap => {
                if (heatMap.needsUpdate()) {
                    heatMap.render();
                }
            });
            
            this.animationFrame = requestAnimationFrame(render);
        };
        
        render();
    }

    applyStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .heatmap-container {
                display: flex;
                flex-direction: column;
                height: 100%;
                background: #1a1a1a;
                color: white;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            }
            
            .heatmap-controls {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px;
                background: #2a2a2a;
                border-bottom: 1px solid #444;
            }
            
            .heatmap-tabs {
                display: flex;
                gap: 10px;
            }
            
            .tab-btn {
                padding: 8px 16px;
                background: #444;
                border: none;
                border-radius: 4px;
                color: white;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            
            .tab-btn:hover {
                background: #555;
            }
            
            .tab-btn.active {
                background: #00ff88;
                color: #000;
            }
            
            .heatmap-options {
                display: flex;
                gap: 20px;
                align-items: center;
            }
            
            .heatmap-options label {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
            }
            
            .heatmap-display {
                flex: 1;
                position: relative;
                display: flex;
                justify-content: center;
                align-items: center;
                background: #000;
            }
            
            .heatmap-canvas {
                display: none;
                border: 1px solid #444;
                border-radius: 4px;
            }
            
            .heatmap-canvas.active {
                display: block;
            }
            
            .heatmap-overlay {
                position: absolute;
                top: 10px;
                left: 10px;
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .coordinate-display {
                background: rgba(42, 42, 42, 0.9);
                padding: 8px 12px;
                border-radius: 4px;
                border: 1px solid #444;
                font-family: monospace;
                font-size: 12px;
            }
            
            .color-legend {
                background: rgba(42, 42, 42, 0.9);
                padding: 10px;
                border-radius: 4px;
                border: 1px solid #444;
                width: 200px;
            }
            
            .legend-scale {
                height: 20px;
                border-radius: 10px;
                margin-bottom: 5px;
            }
            
            .legend-labels {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
            }
            
            .heatmap-stats {
                background: #2a2a2a;
                border-top: 1px solid #444;
                padding: 15px;
                max-height: 200px;
                overflow-y: auto;
            }
            
            .stat-panel h4 {
                margin: 0 0 10px 0;
                color: #00ff88;
            }
            
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 10px;
            }
            
            .stat-item {
                display: flex;
                justify-content: space-between;
                padding: 5px 0;
                border-bottom: 1px solid #444;
            }
            
            .stat-item:last-child {
                border-bottom: none;
            }
            
            .stat-item label {
                color: #aaa;
            }
            
            .stat-item span {
                font-weight: bold;
                color: white;
            }
        `;
        
        document.head.appendChild(style);
    }

    // Public API methods
    export(type = 'all', format = 'png') {
        if (type === 'all') {
            const exports = {};
            this.canvases.forEach((canvas, mapType) => {
                exports[mapType] = canvas.toDataURL(`image/${format}`);
            });
            return exports;
        } else {
            const canvas = this.canvases.get(type);
            return canvas ? canvas.toDataURL(`image/${format}`) : null;
        }
    }

    destroy() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        this.isInitialized = false;
    }
}

// Supporting class for heat map data management
class HeatMapDataBuffer {
    constructor(config) {
        this.width = config.width;
        this.height = config.height;
        this.maxAge = config.maxAge;
        
        this.grid = new Array(this.width * this.height).fill(0);
        this.timestamps = new Array(this.width * this.height).fill(0);
    }

    addDataPoint(x, y, value) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
        
        const index = y * this.width + x;
        this.grid[index] = Math.min(1, this.grid[index] + value);
        this.timestamps[index] = Date.now();
    }

    getValue(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return 0;
        
        const index = y * this.width + x;
        const age = Date.now() - this.timestamps[index];
        
        if (age > this.maxAge) return 0;
        
        // Apply age-based decay
        const decay = Math.max(0, 1 - age / this.maxAge);
        return this.grid[index] * decay;
    }

    getGridData() {
        const currentTime = Date.now();
        return this.grid.map((value, index) => {
            const age = currentTime - this.timestamps[index];
            if (age > this.maxAge) return 0;
            
            const decay = Math.max(0, 1 - age / this.maxAge);
            return value * decay;
        });
    }

    clear() {
        this.grid.fill(0);
        this.timestamps.fill(0);
    }
}

// Supporting class for individual heat map rendering
class HeatMap {
    constructor(config) {
        this.canvas = config.canvas;
        this.context = config.context;
        this.type = config.type;
        this.colorScheme = config.colorScheme;
        this.resolution = config.resolution;
        
        this.intensity = 1.0;
        this.smoothing = true;
        this.needsRender = false;
        
        this.imageData = this.context.createImageData(this.canvas.width, this.canvas.height);
    }

    updateData(gridData) {
        this.gridData = gridData;
        this.needsRender = true;
    }

    setIntensity(intensity) {
        this.intensity = intensity;
        this.needsRender = true;
    }

    setSmoothing(enabled) {
        this.smoothing = enabled;
        this.needsRender = true;
    }

    setResolution(resolution) {
        this.resolution = resolution;
        this.needsRender = true;
    }

    needsUpdate() {
        return this.needsRender;
    }

    render() {
        if (!this.gridData) return;
        
        const data = this.imageData.data;
        const canvasWidth = this.canvas.width;
        const canvasHeight = this.canvas.height;
        
        for (let y = 0; y < canvasHeight; y++) {
            for (let x = 0; x < canvasWidth; x++) {
                const gridX = Math.floor((x / canvasWidth) * this.resolution.width);
                const gridY = Math.floor((y / canvasHeight) * this.resolution.height);
                
                let value = this.getGridValue(gridX, gridY);
                
                if (this.smoothing) {
                    value = this.applySmoothingFilter(gridX, gridY);
                }
                
                value = Math.min(1, value * this.intensity);
                
                const color = this.valueToColor(value);
                const index = (y * canvasWidth + x) * 4;
                
                data[index] = color.r;
                data[index + 1] = color.g;
                data[index + 2] = color.b;
                data[index + 3] = color.a;
            }
        }
        
        this.context.putImageData(this.imageData, 0, 0);
        this.needsRender = false;
    }

    getGridValue(x, y) {
        const index = y * this.resolution.width + x;
        return this.gridData[index] || 0;
    }

    applySmoothingFilter(x, y) {
        let sum = 0;
        let count = 0;
        
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                const nx = x + dx;
                const ny = y + dy;
                
                if (nx >= 0 && nx < this.resolution.width && 
                    ny >= 0 && ny < this.resolution.height) {
                    sum += this.getGridValue(nx, ny);
                    count++;
                }
            }
        }
        
        return count > 0 ? sum / count : 0;
    }

    valueToColor(value) {
        const colors = this.colorScheme.map(hex => this.hexToRgb(hex));
        
        if (value <= 0) return { r: 0, g: 0, b: 0, a: 0 };
        if (value >= 1) return { ...colors[colors.length - 1], a: 255 };
        
        const scaledValue = value * (colors.length - 1);
        const index = Math.floor(scaledValue);
        const fraction = scaledValue - index;
        
        const color1 = colors[index];
        const color2 = colors[Math.min(index + 1, colors.length - 1)];
        
        return {
            r: Math.round(color1.r + (color2.r - color1.r) * fraction),
            g: Math.round(color1.g + (color2.g - color1.g) * fraction),
            b: Math.round(color1.b + (color2.b - color1.b) * fraction),
            a: Math.round(255 * value)
        };
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }
}

module.exports = EconomicHeatMapSystem;
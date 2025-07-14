/**
 * 3D Market Depth Visualization
 * Real-time 3D visualization of order book depth and market microstructure
 */

class MarketDepth3D {
    constructor(container, config = {}) {
        this.container = container;
        this.config = {
            symbol: config.symbol || 'BTC/USD',
            maxDepth: config.maxDepth || 50,
            heightScale: config.heightScale || 100,
            colorScheme: config.colorScheme || {
                bids: { base: 0x00ff88, highlight: 0x00ffaa },
                asks: { base: 0xff4444, highlight: 0xff6666 },
                spread: 0xffaa00
            },
            animation: config.animation !== false,
            gridSize: config.gridSize || 0.5,
            ...config
        };

        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        this.orderBookData = {
            bids: [],
            asks: [],
            spread: 0,
            midPrice: 0
        };
        
        this.visualElements = {
            bidBars: [],
            askBars: [],
            gridLines: null,
            labels: [],
            spreadPlane: null
        };
        
        this.animationMixers = [];
        this.isInitialized = false;
        this.animationId = null;
        
        this.initialize();
    }

    async initialize() {
        await this.setupThreeJS();
        this.setupScene();
        this.setupCamera();
        this.setupLighting();
        this.setupControls();
        this.setupGrid();
        this.setupEventHandlers();
        this.startRenderLoop();
        
        this.isInitialized = true;
        console.log('3D Market Depth Visualization initialized');
    }

    async setupThreeJS() {
        const THREE = await import('three');
        window.THREE = THREE;
        
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        this.scene.fog = new THREE.Fog(0x0a0a0a, 100, 1000);
        
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.outputEncoding = THREE.sRGBEncoding;
        
        this.container.appendChild(this.renderer.domElement);
    }

    setupScene() {
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
        this.scene.add(ambientLight);
        
        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 500;
        this.scene.add(directionalLight);
        
        // Add point lights for depth visualization
        const bidLight = new THREE.PointLight(this.config.colorScheme.bids.base, 0.5, 100);
        bidLight.position.set(-25, 30, 0);
        this.scene.add(bidLight);
        
        const askLight = new THREE.PointLight(this.config.colorScheme.asks.base, 0.5, 100);
        askLight.position.set(25, 30, 0);
        this.scene.add(askLight);
    }

    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            2000
        );
        this.camera.position.set(80, 60, 80);
        this.camera.lookAt(0, 0, 0);
    }

    setupLighting() {
        // Additional atmospheric lighting
        const hemisphereLight = new THREE.HemisphereLight(0x404040, 0x080808, 0.4);
        this.scene.add(hemisphereLight);
        
        // Rim lighting for better depth perception
        const rimLight = new THREE.DirectionalLight(0x00aaff, 0.3);
        rimLight.position.set(-50, 50, -50);
        this.scene.add(rimLight);
    }

    async setupControls() {
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 20;
        this.controls.maxDistance = 200;
        this.controls.maxPolarAngle = Math.PI / 2;
    }

    setupGrid() {
        // Create base grid
        const gridSize = 100;
        const divisions = 20;
        
        const gridHelper = new THREE.GridHelper(gridSize, divisions, 0x444444, 0x222222);
        gridHelper.position.y = -1;
        this.scene.add(gridHelper);
        
        // Create price axis labels
        this.createAxisLabels();
        
        // Create coordinate planes for better spatial understanding
        this.createCoordinatePlanes();
    }

    createAxisLabels() {
        const loader = new THREE.FontLoader();
        
        // We'll create simple text labels using CSS3D or canvas textures
        this.createTextLabel('BIDS', -30, 5, 0, this.config.colorScheme.bids.base);
        this.createTextLabel('ASKS', 30, 5, 0, this.config.colorScheme.asks.base);
        this.createTextLabel('VOLUME', 0, 20, -40, 0xffffff);
        this.createTextLabel('PRICE', 0, 5, 40, 0xffffff);
    }

    createTextLabel(text, x, y, z, color) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
        context.font = 'Bold 24px Arial';
        context.textAlign = 'center';
        context.fillText(text, canvas.width / 2, canvas.height / 2 + 8);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        
        sprite.position.set(x, y, z);
        sprite.scale.set(20, 5, 1);
        
        this.scene.add(sprite);
        this.visualElements.labels.push(sprite);
    }

    createCoordinatePlanes() {
        // XZ plane (base)
        const planeGeometry = new THREE.PlaneGeometry(100, 100);
        const planeMaterial = new THREE.MeshBasicMaterial({
            color: 0x111111,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });
        
        const basePlane = new THREE.Mesh(planeGeometry, planeMaterial);
        basePlane.rotation.x = -Math.PI / 2;
        basePlane.position.y = -1;
        this.scene.add(basePlane);
    }

    updateOrderBookData(orderBookUpdate) {
        if (!this.isInitialized) return;
        
        this.orderBookData = {
            bids: orderBookUpdate.bids || [],
            asks: orderBookUpdate.asks || [],
            spread: orderBookUpdate.spread || 0,
            midPrice: orderBookUpdate.midPrice || 0,
            timestamp: orderBookUpdate.timestamp || Date.now()
        };
        
        this.updateVisualization();
    }

    updateVisualization() {
        this.clearPreviousVisualization();
        this.createBidVisualization();
        this.createAskVisualization();
        this.createSpreadVisualization();
        this.updateMetrics();
    }

    clearPreviousVisualization() {
        // Remove previous bid bars
        this.visualElements.bidBars.forEach(bar => {
            this.scene.remove(bar);
            if (bar.geometry) bar.geometry.dispose();
            if (bar.material) bar.material.dispose();
        });
        this.visualElements.bidBars = [];
        
        // Remove previous ask bars
        this.visualElements.askBars.forEach(bar => {
            this.scene.remove(bar);
            if (bar.geometry) bar.geometry.dispose();
            if (bar.material) bar.material.dispose();
        });
        this.visualElements.askBars = [];
        
        // Remove spread plane
        if (this.visualElements.spreadPlane) {
            this.scene.remove(this.visualElements.spreadPlane);
            this.visualElements.spreadPlane = null;
        }
    }

    createBidVisualization() {
        const bids = this.orderBookData.bids.slice(0, this.config.maxDepth);
        const maxVolume = Math.max(...bids.map(bid => bid.volume));
        
        bids.forEach((bid, index) => {
            const bar = this.createVolumeBar(
                bid.price,
                bid.volume,
                maxVolume,
                index,
                'bid'
            );
            
            this.visualElements.bidBars.push(bar);
            this.scene.add(bar);
            
            // Add price label
            this.createPriceLabel(bid.price, index, 'bid');
        });
    }

    createAskVisualization() {
        const asks = this.orderBookData.asks.slice(0, this.config.maxDepth);
        const maxVolume = Math.max(...asks.map(ask => ask.volume));
        
        asks.forEach((ask, index) => {
            const bar = this.createVolumeBar(
                ask.price,
                ask.volume,
                maxVolume,
                index,
                'ask'
            );
            
            this.visualElements.askBars.push(bar);
            this.scene.add(bar);
            
            // Add price label
            this.createPriceLabel(ask.price, index, 'ask');
        });
    }

    createVolumeBar(price, volume, maxVolume, index, side) {
        // Calculate bar dimensions
        const volumeRatio = volume / maxVolume;
        const barHeight = volumeRatio * this.config.heightScale;
        const barWidth = 1.5;
        const barDepth = 0.8;
        
        // Create geometry
        const geometry = new THREE.BoxGeometry(barWidth, barHeight, barDepth);
        
        // Create material with appropriate color
        const colorScheme = this.config.colorScheme[side === 'bid' ? 'bids' : 'asks'];
        const material = new THREE.MeshPhongMaterial({
            color: colorScheme.base,
            transparent: true,
            opacity: 0.8,
            shininess: 100
        });
        
        // Create mesh
        const bar = new THREE.Mesh(geometry, material);
        
        // Position the bar
        const xPosition = side === 'bid' ? -(index + 1) * 2 : (index + 1) * 2;
        const yPosition = barHeight / 2;
        const zPosition = 0;
        
        bar.position.set(xPosition, yPosition, zPosition);
        bar.castShadow = true;
        bar.receiveShadow = true;
        
        // Add user data for interaction
        bar.userData = {
            price: price,
            volume: volume,
            side: side,
            index: index
        };
        
        // Add glow effect for high volume
        if (volumeRatio > 0.7) {
            this.addGlowEffect(bar, colorScheme.highlight);
        }
        
        // Add animation if enabled
        if (this.config.animation) {
            this.animateBarEntry(bar);
        }
        
        return bar;
    }

    addGlowEffect(mesh, glowColor) {
        const glowGeometry = mesh.geometry.clone();
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: glowColor,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        glowMesh.scale.multiplyScalar(1.1);
        mesh.add(glowMesh);
    }

    animateBarEntry(bar) {
        // Start with zero scale
        bar.scale.set(1, 0, 1);
        
        // Animate scale to full size
        const targetScale = new THREE.Vector3(1, 1, 1);
        const duration = 500 + Math.random() * 300; // 500-800ms
        
        this.animateProperty(bar.scale, targetScale, duration, 'easeOutBounce');
    }

    animateProperty(object, target, duration, easing = 'easeOutQuad') {
        const start = {
            x: object.x,
            y: object.y,
            z: object.z
        };
        
        const startTime = Date.now();
        
        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            let easedProgress = progress;
            switch (easing) {
                case 'easeOutBounce':
                    easedProgress = this.easeOutBounce(progress);
                    break;
                case 'easeOutQuad':
                    easedProgress = 1 - (1 - progress) * (1 - progress);
                    break;
            }
            
            object.x = start.x + (target.x - start.x) * easedProgress;
            object.y = start.y + (target.y - start.y) * easedProgress;
            object.z = start.z + (target.z - start.z) * easedProgress;
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }

    easeOutBounce(t) {
        if (t < 1 / 2.75) {
            return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
            return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
            return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
            return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
    }

    createPriceLabel(price, index, side) {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 128;
        canvas.height = 32;
        
        context.fillStyle = side === 'bid' ? '#00ff88' : '#ff4444';
        context.font = 'Bold 14px Arial';
        context.textAlign = 'center';
        context.fillText(`$${price.toFixed(2)}`, canvas.width / 2, canvas.height / 2 + 4);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        
        const xPosition = side === 'bid' ? -(index + 1) * 2 : (index + 1) * 2;
        sprite.position.set(xPosition, -5, 0);
        sprite.scale.set(8, 2, 1);
        
        this.scene.add(sprite);
        this.visualElements.labels.push(sprite);
    }

    createSpreadVisualization() {
        if (this.orderBookData.spread <= 0) return;
        
        // Create a translucent plane to represent the spread
        const spreadGeometry = new THREE.PlaneGeometry(4, this.config.heightScale);
        const spreadMaterial = new THREE.MeshBasicMaterial({
            color: this.config.colorScheme.spread,
            transparent: true,
            opacity: 0.2,
            side: THREE.DoubleSide
        });
        
        this.visualElements.spreadPlane = new THREE.Mesh(spreadGeometry, spreadMaterial);
        this.visualElements.spreadPlane.position.set(0, this.config.heightScale / 2, 0);
        this.visualElements.spreadPlane.rotation.y = Math.PI / 2;
        
        this.scene.add(this.visualElements.spreadPlane);
        
        // Add spread value label
        this.createSpreadLabel();
    }

    createSpreadLabel() {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = `#${this.config.colorScheme.spread.toString(16).padStart(6, '0')}`;
        context.font = 'Bold 18px Arial';
        context.textAlign = 'center';
        context.fillText(`Spread: $${this.orderBookData.spread.toFixed(2)}`, canvas.width / 2, canvas.height / 2 + 6);
        
        const texture = new THREE.CanvasTexture(canvas);
        const material = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(material);
        
        sprite.position.set(0, this.config.heightScale + 10, 0);
        sprite.scale.set(15, 4, 1);
        
        this.scene.add(sprite);
        this.visualElements.labels.push(sprite);
    }

    updateMetrics() {
        // Calculate market depth metrics
        const totalBidVolume = this.orderBookData.bids.reduce((sum, bid) => sum + bid.volume, 0);
        const totalAskVolume = this.orderBookData.asks.reduce((sum, ask) => sum + ask.volume, 0);
        const imbalance = (totalBidVolume - totalAskVolume) / (totalBidVolume + totalAskVolume);
        
        // Update UI with metrics
        this.displayMetrics({
            bidVolume: totalBidVolume,
            askVolume: totalAskVolume,
            imbalance: imbalance,
            spread: this.orderBookData.spread,
            midPrice: this.orderBookData.midPrice
        });
    }

    displayMetrics(metrics) {
        // Create or update metrics panel
        let metricsPanel = document.getElementById('depth-metrics-panel');
        
        if (!metricsPanel) {
            metricsPanel = document.createElement('div');
            metricsPanel.id = 'depth-metrics-panel';
            metricsPanel.style.cssText = `
                position: absolute;
                top: 20px;
                left: 20px;
                background: rgba(42, 42, 42, 0.9);
                color: white;
                padding: 15px;
                border-radius: 8px;
                border: 1px solid #444;
                font-family: monospace;
                font-size: 12px;
                z-index: 100;
            `;
            this.container.appendChild(metricsPanel);
        }
        
        metricsPanel.innerHTML = `
            <div style="margin-bottom: 10px; font-weight: bold; color: #00ff88;">
                ${this.config.symbol} - Market Depth
            </div>
            <div>Mid Price: $${metrics.midPrice.toFixed(2)}</div>
            <div>Spread: $${metrics.spread.toFixed(4)} (${((metrics.spread / metrics.midPrice) * 100).toFixed(3)}%)</div>
            <div style="color: #00ff88;">Bid Volume: ${metrics.bidVolume.toFixed(4)}</div>
            <div style="color: #ff4444;">Ask Volume: ${metrics.askVolume.toFixed(4)}</div>
            <div style="color: ${metrics.imbalance > 0 ? '#00ff88' : '#ff4444'};">
                Imbalance: ${(metrics.imbalance * 100).toFixed(2)}%
            </div>
        `;
    }

    setupEventHandlers() {
        // Mouse interaction for bar selection
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        this.renderer.domElement.addEventListener('click', (event) => {
            mouse.x = (event.clientX / this.container.clientWidth) * 2 - 1;
            mouse.y = -(event.clientY / this.container.clientHeight) * 2 + 1;
            
            raycaster.setFromCamera(mouse, this.camera);
            
            const allBars = [...this.visualElements.bidBars, ...this.visualElements.askBars];
            const intersects = raycaster.intersectObjects(allBars);
            
            if (intersects.length > 0) {
                this.handleBarClick(intersects[0].object);
            }
        });
        
        // Hover effects
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            mouse.x = (event.clientX / this.container.clientWidth) * 2 - 1;
            mouse.y = -(event.clientY / this.container.clientHeight) * 2 + 1;
            
            raycaster.setFromCamera(mouse, this.camera);
            
            const allBars = [...this.visualElements.bidBars, ...this.visualElements.askBars];
            const intersects = raycaster.intersectObjects(allBars);
            
            this.handleBarHover(intersects.length > 0 ? intersects[0].object : null);
        });
        
        // Resize handler
        window.addEventListener('resize', () => this.handleResize());
    }

    handleBarClick(bar) {
        const userData = bar.userData;
        
        // Highlight the selected bar
        this.highlightBar(bar);
        
        // Show detailed information
        this.showBarDetails(userData);
        
        // Trigger events for other components
        this.dispatchEvent('barSelected', userData);
    }

    highlightBar(selectedBar) {
        // Reset all bars to normal appearance
        const allBars = [...this.visualElements.bidBars, ...this.visualElements.askBars];
        allBars.forEach(bar => {
            bar.material.opacity = 0.8;
            bar.scale.set(1, bar.scale.y, 1);
        });
        
        // Highlight selected bar
        selectedBar.material.opacity = 1.0;
        selectedBar.scale.set(1.2, selectedBar.scale.y, 1.2);
        
        // Reset after delay
        setTimeout(() => {
            selectedBar.material.opacity = 0.8;
            selectedBar.scale.set(1, selectedBar.scale.y, 1);
        }, 2000);
    }

    showBarDetails(userData) {
        // Create detail popup
        const popup = document.createElement('div');
        popup.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(42, 42, 42, 0.95);
            color: white;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #444;
            font-family: monospace;
            z-index: 200;
        `;
        
        popup.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h3 style="margin: 0; color: ${userData.side === 'bid' ? '#00ff88' : '#ff4444'};">
                    ${userData.side.toUpperCase()} Order Details
                </h3>
                <button id="close-popup" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer;">×</button>
            </div>
            <div>Price: $${userData.price.toFixed(2)}</div>
            <div>Volume: ${userData.volume.toFixed(4)}</div>
            <div>Side: ${userData.side}</div>
            <div>Position: #${userData.index + 1}</div>
        `;
        
        this.container.appendChild(popup);
        
        // Close handler
        document.getElementById('close-popup').onclick = () => popup.remove();
        
        // Auto-close
        setTimeout(() => {
            if (popup.parentNode) popup.remove();
        }, 5000);
    }

    handleBarHover(hoveredBar) {
        const allBars = [...this.visualElements.bidBars, ...this.visualElements.askBars];
        
        // Reset all bars
        allBars.forEach(bar => {
            bar.scale.set(1, bar.scale.y, 1);
        });
        
        // Scale up hovered bar
        if (hoveredBar) {
            hoveredBar.scale.set(1.1, hoveredBar.scale.y, 1.1);
            this.container.style.cursor = 'pointer';
        } else {
            this.container.style.cursor = 'default';
        }
    }

    startRenderLoop() {
        const render = () => {
            if (!this.isInitialized) return;
            
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
            
            this.animationId = requestAnimationFrame(render);
        };
        
        render();
    }

    handleResize() {
        const width = this.container.clientWidth;
        const height = this.container.clientHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
    }

    dispatchEvent(eventType, data) {
        const event = new CustomEvent(eventType, { detail: data });
        this.container.dispatchEvent(event);
    }

    // Public API methods
    setSymbol(symbol) {
        this.config.symbol = symbol;
        this.clearPreviousVisualization();
        
        // Update symbol label
        this.visualElements.labels.forEach(label => {
            if (label.userData && label.userData.isSymbolLabel) {
                this.scene.remove(label);
            }
        });
        
        this.createTextLabel(symbol, 0, this.config.heightScale + 20, 0, 0xffffff);
    }

    setMaxDepth(depth) {
        this.config.maxDepth = depth;
        this.updateVisualization();
    }

    export(format = 'png') {
        return this.renderer.domElement.toDataURL(`image/${format}`);
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.clearPreviousVisualization();
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.container && this.renderer) {
            this.container.removeChild(this.renderer.domElement);
        }
        
        this.isInitialized = false;
    }
}

module.exports = MarketDepth3D;
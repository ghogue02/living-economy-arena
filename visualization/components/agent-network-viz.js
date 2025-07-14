/**
 * Agent Network Visualization Component
 * 3D network graph showing agent relationships, trust networks, and trade flows
 */

class AgentNetworkVisualization {
    constructor(container, config = {}) {
        this.container = container;
        this.config = {
            maxNodes: config.maxNodes || 1000,
            maxEdges: config.maxEdges || 5000,
            nodeSize: config.nodeSize || { min: 2, max: 20 },
            edgeWidth: config.edgeWidth || { min: 0.5, max: 5 },
            physics: config.physics !== false,
            clustering: config.clustering !== false,
            force3D: config.force3D !== false,
            ...config
        };

        this.nodes = new Map();
        this.edges = new Map();
        this.clusters = new Map();
        
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        
        this.networkData = {
            nodes: [],
            edges: [],
            clusters: [],
            metrics: {}
        };
        
        this.isInitialized = false;
        this.animationId = null;
        
        this.initialize();
    }

    async initialize() {
        await this.setupThreeJS();
        this.setupNetworkComponents();
        this.setupEventHandlers();
        this.startRenderLoop();
        
        this.isInitialized = true;
        console.log('Agent Network Visualization initialized');
    }

    async setupThreeJS() {
        // Import Three.js dynamically
        const THREE = await import('three');
        window.THREE = THREE;
        
        // Scene setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);
        
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(
            75,
            this.container.clientWidth / this.container.clientHeight,
            0.1,
            10000
        );
        this.camera.position.set(100, 100, 100);
        
        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        this.container.appendChild(this.renderer.domElement);
        
        // Orbit controls
        const { OrbitControls } = await import('three/examples/jsm/controls/OrbitControls.js');
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.1;
        
        // Lighting
        this.setupLighting();
        
        // Resize handler
        window.addEventListener('resize', () => this.handleResize());
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        
        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 100, 50);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        
        // Point lights for atmosphere
        const colors = [0x00ff88, 0xff4444, 0x4488ff];
        colors.forEach((color, i) => {
            const pointLight = new THREE.PointLight(color, 0.3, 200);
            pointLight.position.set(
                Math.cos(i * 2.094) * 150,
                50,
                Math.sin(i * 2.094) * 150
            );
            this.scene.add(pointLight);
        });
    }

    setupNetworkComponents() {
        // Create material library
        this.materials = {
            node: {
                wealthy: new THREE.MeshPhongMaterial({ 
                    color: 0x00ff88,
                    transparent: true,
                    opacity: 0.8
                }),
                average: new THREE.MeshPhongMaterial({ 
                    color: 0x4488ff,
                    transparent: true,
                    opacity: 0.7
                }),
                poor: new THREE.MeshPhongMaterial({ 
                    color: 0xff4444,
                    transparent: true,
                    opacity: 0.6
                }),
                inactive: new THREE.MeshPhongMaterial({ 
                    color: 0x666666,
                    transparent: true,
                    opacity: 0.3
                })
            },
            edge: {
                trust: new THREE.LineBasicMaterial({ 
                    color: 0x00ff88,
                    transparent: true,
                    opacity: 0.6
                }),
                trade: new THREE.LineBasicMaterial({ 
                    color: 0xffaa00,
                    transparent: true,
                    opacity: 0.5
                }),
                conflict: new THREE.LineBasicMaterial({ 
                    color: 0xff4444,
                    transparent: true,
                    opacity: 0.4
                })
            }
        };
        
        // Create node and edge groups
        this.nodeGroup = new THREE.Group();
        this.edgeGroup = new THREE.Group();
        this.labelGroup = new THREE.Group();
        
        this.scene.add(this.nodeGroup);
        this.scene.add(this.edgeGroup);
        this.scene.add(this.labelGroup);
        
        // Create particle system for background effects
        this.createParticleSystem();
    }

    createParticleSystem() {
        const particleCount = 1000;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        
        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 2000;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
        }
        
        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particleMaterial = new THREE.PointsMaterial({
            color: 0x888888,
            size: 1,
            transparent: true,
            opacity: 0.3
        });
        
        const particleSystem = new THREE.Points(particles, particleMaterial);
        this.scene.add(particleSystem);
    }

    updateNetworkData(data) {
        if (!this.isInitialized) return;
        
        // Update nodes
        if (data.agents) {
            this.updateNodes(data.agents);
        }
        
        // Update edges (relationships)
        if (data.relationships) {
            this.updateEdges(data.relationships);
        }
        
        // Update clusters
        if (data.clusters) {
            this.updateClusters(data.clusters);
        }
        
        // Apply force-directed layout if enabled
        if (this.config.physics) {
            this.applyForceLayout();
        }
    }

    updateNodes(agents) {
        const currentTime = Date.now();
        
        agents.forEach(agent => {
            let node = this.nodes.get(agent.id);
            
            if (!node) {
                node = this.createNode(agent);
                this.nodes.set(agent.id, node);
                this.nodeGroup.add(node.mesh);
            }
            
            // Update node properties
            this.updateNodeAppearance(node, agent);
            this.updateNodePosition(node, agent);
            this.updateNodeActivity(node, currentTime);
        });
        
        // Remove inactive nodes
        this.cleanupInactiveNodes(agents, currentTime);
    }

    createNode(agent) {
        const geometry = new THREE.SphereGeometry(this.getNodeSize(agent), 16, 16);
        const material = this.getNodeMaterial(agent);
        const mesh = new THREE.Mesh(geometry, material);
        
        // Set initial position
        mesh.position.set(
            agent.position?.x || (Math.random() - 0.5) * 500,
            agent.position?.y || (Math.random() - 0.5) * 500,
            agent.position?.z || (Math.random() - 0.5) * 500
        );
        
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        
        // Add glow effect for important nodes
        if (agent.wealth > 10000) {
            this.addGlowEffect(mesh);
        }
        
        return {
            id: agent.id,
            mesh: mesh,
            agent: agent,
            lastUpdate: Date.now(),
            velocity: { x: 0, y: 0, z: 0 },
            connections: new Set()
        };
    }

    addGlowEffect(mesh) {
        const glowGeometry = new THREE.SphereGeometry(mesh.geometry.parameters.radius * 1.5, 16, 16);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: 0x00ff88,
            transparent: true,
            opacity: 0.2,
            side: THREE.BackSide
        });
        
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
        mesh.add(glowMesh);
    }

    updateNodeAppearance(node, agent) {
        // Update size based on wealth/importance
        const newSize = this.getNodeSize(agent);
        node.mesh.scale.setScalar(newSize / node.mesh.geometry.parameters.radius);
        
        // Update material based on status
        const newMaterial = this.getNodeMaterial(agent);
        if (node.mesh.material !== newMaterial) {
            node.mesh.material = newMaterial;
        }
        
        // Update agent data
        node.agent = agent;
        node.lastUpdate = Date.now();
    }

    getNodeSize(agent) {
        const baseSize = this.config.nodeSize.min;
        const maxSize = this.config.nodeSize.max;
        
        // Size based on wealth/importance
        const wealthFactor = Math.log(agent.wealth + 1) / Math.log(100000);
        const connectionFactor = (agent.connections || 0) / 100;
        
        const sizeFactor = Math.min(wealthFactor + connectionFactor, 1);
        
        return baseSize + (maxSize - baseSize) * sizeFactor;
    }

    getNodeMaterial(agent) {
        const wealth = agent.wealth || 0;
        const isActive = Date.now() - (agent.lastActivity || 0) < 60000; // 1 minute
        
        if (!isActive) return this.materials.node.inactive;
        
        if (wealth > 50000) return this.materials.node.wealthy;
        if (wealth > 10000) return this.materials.node.average;
        return this.materials.node.poor;
    }

    updateEdges(relationships) {
        // Clear existing edges
        this.edgeGroup.clear();
        this.edges.clear();
        
        relationships.forEach(rel => {
            const sourceNode = this.nodes.get(rel.source);
            const targetNode = this.nodes.get(rel.target);
            
            if (sourceNode && targetNode) {
                const edge = this.createEdge(sourceNode, targetNode, rel);
                this.edges.set(`${rel.source}-${rel.target}`, edge);
                this.edgeGroup.add(edge.line);
                
                // Update node connections
                sourceNode.connections.add(rel.target);
                targetNode.connections.add(rel.source);
            }
        });
    }

    createEdge(sourceNode, targetNode, relationship) {
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(6);
        
        // Set positions
        positions[0] = sourceNode.mesh.position.x;
        positions[1] = sourceNode.mesh.position.y;
        positions[2] = sourceNode.mesh.position.z;
        positions[3] = targetNode.mesh.position.x;
        positions[4] = targetNode.mesh.position.y;
        positions[5] = targetNode.mesh.position.z;
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const material = this.getEdgeMaterial(relationship);
        const line = new THREE.Line(geometry, material);
        
        return {
            line: line,
            source: sourceNode,
            target: targetNode,
            relationship: relationship
        };
    }

    getEdgeMaterial(relationship) {
        switch (relationship.type) {
            case 'trust':
                return this.materials.edge.trust;
            case 'trade':
                return this.materials.edge.trade;
            case 'conflict':
                return this.materials.edge.conflict;
            default:
                return this.materials.edge.trust;
        }
    }

    applyForceLayout() {
        const forces = {
            attraction: 0.01,
            repulsion: 100,
            damping: 0.9
        };
        
        // Apply repulsion between all nodes
        const nodeArray = Array.from(this.nodes.values());
        
        for (let i = 0; i < nodeArray.length; i++) {
            for (let j = i + 1; j < nodeArray.length; j++) {
                const node1 = nodeArray[i];
                const node2 = nodeArray[j];
                
                const dx = node2.mesh.position.x - node1.mesh.position.x;
                const dy = node2.mesh.position.y - node1.mesh.position.y;
                const dz = node2.mesh.position.z - node1.mesh.position.z;
                
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
                
                if (distance > 0 && distance < 100) {
                    const repulsionForce = forces.repulsion / (distance * distance);
                    const fx = (dx / distance) * repulsionForce;
                    const fy = (dy / distance) * repulsionForce;
                    const fz = (dz / distance) * repulsionForce;
                    
                    node1.velocity.x -= fx;
                    node1.velocity.y -= fy;
                    node1.velocity.z -= fz;
                    
                    node2.velocity.x += fx;
                    node2.velocity.y += fy;
                    node2.velocity.z += fz;
                }
            }
        }
        
        // Apply attraction for connected nodes
        this.edges.forEach(edge => {
            const dx = edge.target.mesh.position.x - edge.source.mesh.position.x;
            const dy = edge.target.mesh.position.y - edge.source.mesh.position.y;
            const dz = edge.target.mesh.position.z - edge.source.mesh.position.z;
            
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            const idealDistance = 50;
            
            if (distance > idealDistance) {
                const attractionForce = forces.attraction * (distance - idealDistance);
                const fx = (dx / distance) * attractionForce;
                const fy = (dy / distance) * attractionForce;
                const fz = (dz / distance) * attractionForce;
                
                edge.source.velocity.x += fx;
                edge.source.velocity.y += fy;
                edge.source.velocity.z += fz;
                
                edge.target.velocity.x -= fx;
                edge.target.velocity.y -= fy;
                edge.target.velocity.z -= fz;
            }
        });
        
        // Apply velocities and damping
        this.nodes.forEach(node => {
            node.mesh.position.x += node.velocity.x;
            node.mesh.position.y += node.velocity.y;
            node.mesh.position.z += node.velocity.z;
            
            node.velocity.x *= forces.damping;
            node.velocity.y *= forces.damping;
            node.velocity.z *= forces.damping;
        });
        
        // Update edge positions
        this.updateEdgePositions();
    }

    updateEdgePositions() {
        this.edges.forEach(edge => {
            const positions = edge.line.geometry.attributes.position.array;
            
            positions[0] = edge.source.mesh.position.x;
            positions[1] = edge.source.mesh.position.y;
            positions[2] = edge.source.mesh.position.z;
            positions[3] = edge.target.mesh.position.x;
            positions[4] = edge.target.mesh.position.y;
            positions[5] = edge.target.mesh.position.z;
            
            edge.line.geometry.attributes.position.needsUpdate = true;
        });
    }

    cleanupInactiveNodes(activeAgents, currentTime) {
        const activeIds = new Set(activeAgents.map(a => a.id));
        const inactiveThreshold = 300000; // 5 minutes
        
        this.nodes.forEach((node, id) => {
            if (!activeIds.has(id) || 
                currentTime - node.lastUpdate > inactiveThreshold) {
                
                this.nodeGroup.remove(node.mesh);
                this.nodes.delete(id);
                
                // Remove related edges
                this.edges.forEach((edge, edgeId) => {
                    if (edgeId.includes(id)) {
                        this.edgeGroup.remove(edge.line);
                        this.edges.delete(edgeId);
                    }
                });
            }
        });
    }

    setupEventHandlers() {
        // Mouse interaction
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        
        this.renderer.domElement.addEventListener('click', (event) => {
            mouse.x = (event.clientX / this.container.clientWidth) * 2 - 1;
            mouse.y = -(event.clientY / this.container.clientHeight) * 2 + 1;
            
            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.nodeGroup.children);
            
            if (intersects.length > 0) {
                this.handleNodeClick(intersects[0].object);
            }
        });
        
        // Hover effects
        this.renderer.domElement.addEventListener('mousemove', (event) => {
            mouse.x = (event.clientX / this.container.clientWidth) * 2 - 1;
            mouse.y = -(event.clientY / this.container.clientHeight) * 2 + 1;
            
            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObjects(this.nodeGroup.children);
            
            this.handleNodeHover(intersects.length > 0 ? intersects[0].object : null);
        });
    }

    handleNodeClick(nodeMesh) {
        // Find the node data
        const node = Array.from(this.nodes.values()).find(n => n.mesh === nodeMesh);
        if (!node) return;
        
        // Highlight connected nodes
        this.highlightConnections(node);
        
        // Show node info panel
        this.showNodeInfo(node.agent);
        
        // Focus camera on node
        this.focusOnNode(node);
    }

    highlightConnections(node) {
        // Reset all node materials
        this.nodes.forEach(n => {
            n.mesh.material.opacity = 0.3;
        });
        
        // Highlight selected node and connections
        node.mesh.material.opacity = 1.0;
        
        node.connections.forEach(connectedId => {
            const connectedNode = this.nodes.get(connectedId);
            if (connectedNode) {
                connectedNode.mesh.material.opacity = 0.8;
            }
        });
        
        // Reset after delay
        setTimeout(() => {
            this.nodes.forEach(n => {
                n.mesh.material.opacity = this.getNodeMaterial(n.agent).opacity;
            });
        }, 3000);
    }

    showNodeInfo(agent) {
        const infoPanel = document.createElement('div');
        infoPanel.className = 'node-info-panel';
        infoPanel.innerHTML = `
            <div class="info-header">
                <h3>Agent ${agent.id}</h3>
                <button class="close-btn">×</button>
            </div>
            <div class="info-content">
                <div class="info-item">
                    <label>Wealth:</label>
                    <span>$${agent.wealth.toLocaleString()}</span>
                </div>
                <div class="info-item">
                    <label>Connections:</label>
                    <span>${agent.connections || 0}</span>
                </div>
                <div class="info-item">
                    <label>Trust Score:</label>
                    <span>${agent.trustScore || 0}</span>
                </div>
                <div class="info-item">
                    <label>Activity:</label>
                    <span>${agent.activity || 'Unknown'}</span>
                </div>
            </div>
        `;
        
        // Position panel
        infoPanel.style.position = 'absolute';
        infoPanel.style.top = '20px';
        infoPanel.style.right = '20px';
        infoPanel.style.background = 'rgba(42, 42, 42, 0.95)';
        infoPanel.style.color = 'white';
        infoPanel.style.padding = '15px';
        infoPanel.style.borderRadius = '8px';
        infoPanel.style.border = '1px solid #444';
        infoPanel.style.zIndex = '1000';
        
        this.container.appendChild(infoPanel);
        
        // Close handler
        infoPanel.querySelector('.close-btn').onclick = () => {
            infoPanel.remove();
        };
        
        // Auto-close after 10 seconds
        setTimeout(() => {
            if (infoPanel.parentNode) {
                infoPanel.remove();
            }
        }, 10000);
    }

    focusOnNode(node) {
        const targetPosition = node.mesh.position.clone();
        targetPosition.z += 100; // Move camera back
        
        // Smooth camera transition
        const startPosition = this.camera.position.clone();
        const duration = 1000; // 1 second
        const startTime = Date.now();
        
        const animateCamera = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const eased = 1 - Math.pow(1 - progress, 3);
            
            this.camera.position.lerpVectors(startPosition, targetPosition, eased);
            this.controls.target.lerp(node.mesh.position, eased);
            
            if (progress < 1) {
                requestAnimationFrame(animateCamera);
            }
        };
        
        animateCamera();
    }

    handleNodeHover(hoveredMesh) {
        // Reset all node scales
        this.nodes.forEach(node => {
            node.mesh.scale.setScalar(1);
        });
        
        // Scale up hovered node
        if (hoveredMesh) {
            hoveredMesh.scale.setScalar(1.2);
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

    // Public API methods
    setViewMode(mode) {
        switch (mode) {
            case 'wealth':
                this.colorNodesByWealth();
                break;
            case 'activity':
                this.colorNodesByActivity();
                break;
            case 'connections':
                this.colorNodesByConnections();
                break;
            case 'clusters':
                this.colorNodesByClusters();
                break;
        }
    }

    colorNodesByWealth() {
        this.nodes.forEach(node => {
            const wealth = node.agent.wealth || 0;
            let color;
            
            if (wealth > 50000) color = 0x00ff88;
            else if (wealth > 10000) color = 0xffaa00;
            else color = 0xff4444;
            
            node.mesh.material.color.setHex(color);
        });
    }

    colorNodesByActivity() {
        const currentTime = Date.now();
        
        this.nodes.forEach(node => {
            const lastActivity = node.agent.lastActivity || 0;
            const timeSinceActivity = currentTime - lastActivity;
            
            let color;
            if (timeSinceActivity < 60000) color = 0x00ff88; // Active
            else if (timeSinceActivity < 300000) color = 0xffaa00; // Moderately active
            else color = 0x666666; // Inactive
            
            node.mesh.material.color.setHex(color);
        });
    }

    export(format = 'png') {
        if (format === 'png') {
            return this.renderer.domElement.toDataURL('image/png');
        }
        
        // Add other export formats as needed
        return null;
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        if (this.renderer) {
            this.renderer.dispose();
        }
        
        if (this.container && this.renderer) {
            this.container.removeChild(this.renderer.domElement);
        }
        
        this.isInitialized = false;
    }
}

module.exports = AgentNetworkVisualization;
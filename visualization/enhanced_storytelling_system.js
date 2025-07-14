/**
 * Enhanced Living Economy Storytelling System
 * Transforms the 500 AI agent system into an engaging, story-driven experience
 */

class EnhancedStorytellingSystem {
    constructor() {
        this.isRunning = false;
        this.components = new Map();
        this.websocket = null;
        this.storyData = {
            narratives: [],
            agents: [],
            flows: [],
            reasoning: [],
            timeline: [],
            ripples: [],
            networks: {}
        };
        
        // Animation states
        this.animationFrameId = null;
        this.animations = {
            supply_chain: [],
            ripples: [],
            thoughts: []
        };
        
        console.log('🎭 Enhanced Storytelling System initialized');
    }
    
    async initialize() {
        console.log('🎨 Initializing enhanced storytelling features...');
        
        try {
            // Initialize story-driven components
            await this.initializeStorytellingPanels();
            await this.initializeAgentBiographyCards();
            await this.initializeSupplyChainAnimation();
            await this.initializeAIReasoningDisplay();
            await this.initializeEventsTimeline();
            await this.initializeImpactRipples();
            await this.initializeRelationshipNetwork();
            await this.initializeDataConnection();
            
            this.components.set('storytelling_system', { status: 'active', type: 'coordinator' });
            console.log(`✅ Enhanced storytelling system initialized`);
            
        } catch (error) {
            console.error('❌ Storytelling system initialization failed:', error);
            throw error;
        }
    }
    
    async initializeStorytellingPanels() {
        console.log('📖 Creating storytelling panels...');
        
        // Create main storytelling container
        const container = document.createElement('div');
        container.id = 'storytelling-container';
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            grid-template-rows: 1fr 1fr 1fr;
            gap: 15px;
            padding: 15px;
            box-sizing: border-box;
            font-family: 'Segoe UI', sans-serif;
            color: white;
            overflow: hidden;
        `;
        
        document.body.appendChild(container);
        
        // Create story panels
        this.createStorytellingPanel('Economic Narratives', 'narratives-panel', container, 'top-left');
        this.createStorytellingPanel('Agent Biographies', 'biographies-panel', container, 'top-center');
        this.createStorytellingPanel('Supply Chain Flows', 'flows-panel', container, 'top-right');
        this.createStorytellingPanel('AI Reasoning', 'reasoning-panel', container, 'middle-left');
        this.createStorytellingPanel('Events Timeline', 'timeline-panel', container, 'middle-center');
        this.createStorytellingPanel('Impact Ripples', 'ripples-panel', container, 'middle-right');
        this.createStorytellingPanel('Agent Networks', 'networks-panel', container, 'bottom-left');
        this.createStorytellingPanel('System Status', 'status-panel', container, 'bottom-center');
        this.createStorytellingPanel('Live Market', 'market-panel', container, 'bottom-right');
    }
    
    createStorytellingPanel(title, id, container, position) {
        const panel = document.createElement('div');
        panel.id = id;
        panel.style.cssText = `
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            padding: 20px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            backdrop-filter: blur(20px);
            transition: all 0.3s ease;
            position: relative;
        `;
        
        // Add hover effects
        panel.addEventListener('mouseenter', () => {
            panel.style.border = '1px solid rgba(0, 255, 136, 0.3)';
            panel.style.background = 'rgba(255, 255, 255, 0.05)';
        });
        
        panel.addEventListener('mouseleave', () => {
            panel.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            panel.style.background = 'rgba(255, 255, 255, 0.03)';
        });
        
        // Create header
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        `;
        
        const titleElement = document.createElement('h3');
        titleElement.textContent = title;
        titleElement.style.cssText = `
            margin: 0;
            font-size: 1.3rem;
            font-weight: 300;
            background: linear-gradient(135deg, #00ff88 0%, #00d2ff 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        `;
        
        // Add status indicator
        const statusIndicator = document.createElement('div');
        statusIndicator.className = 'status-indicator';
        statusIndicator.style.cssText = `
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #00ff88;
            box-shadow: 0 0 10px rgba(0, 255, 136, 0.5);
            animation: pulse 2s infinite;
        `;
        
        header.appendChild(titleElement);
        header.appendChild(statusIndicator);
        
        // Create content area
        const content = document.createElement('div');
        content.className = 'panel-content';
        content.style.cssText = `
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 12px;
            overflow-y: auto;
            scrollbar-width: thin;
            scrollbar-color: rgba(0, 255, 136, 0.3) transparent;
        `;
        
        // Custom scrollbar styles
        const scrollbarStyle = document.createElement('style');
        scrollbarStyle.textContent = `
            .panel-content::-webkit-scrollbar {
                width: 6px;
            }
            .panel-content::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.1);
                border-radius: 3px;
            }
            .panel-content::-webkit-scrollbar-thumb {
                background: rgba(0, 255, 136, 0.3);
                border-radius: 3px;
            }
            .panel-content::-webkit-scrollbar-thumb:hover {
                background: rgba(0, 255, 136, 0.5);
            }
            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.3; }
            }
        `;
        document.head.appendChild(scrollbarStyle);
        
        panel.appendChild(header);
        panel.appendChild(content);
        container.appendChild(panel);
        
        // Initialize with loading state
        this.showLoadingState(content, title);
    }
    
    showLoadingState(contentElement, panelTitle) {
        contentElement.innerHTML = `
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                text-align: center;
                color: #666;
            ">
                <div style="
                    font-size: 2rem;
                    margin-bottom: 15px;
                    animation: spin 2s linear infinite;
                ">⚡</div>
                <div style="font-size: 0.9rem;">
                    Connecting to AI agents...
                </div>
                <div style="font-size: 0.8rem; margin-top: 5px; color: #888;">
                    Loading ${panelTitle.toLowerCase()}
                </div>
            </div>
        `;
        
        // Add spin animation
        const spinStyle = document.createElement('style');
        spinStyle.textContent = `
            @keyframes spin {
                from { transform: rotate(0deg); }
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(spinStyle);
    }
    
    async initializeAgentBiographyCards() {
        console.log('👤 Setting up agent biography cards...');
        this.components.set('agent_biographies', { status: 'active', type: 'visualization' });
    }
    
    async initializeSupplyChainAnimation() {
        console.log('🔄 Setting up supply chain animation...');
        
        // Create canvas for supply chain flows
        const flowsPanel = document.getElementById('flows-panel');
        if (flowsPanel) {
            const canvas = document.createElement('canvas');
            canvas.id = 'supply-chain-canvas';
            canvas.width = 400;
            canvas.height = 300;
            canvas.style.cssText = `
                width: 100%;
                height: 100%;
                border-radius: 8px;
            `;
            
            // Replace loading content with canvas
            const content = flowsPanel.querySelector('.panel-content');
            if (content) {
                content.innerHTML = '';
                content.appendChild(canvas);
            }
            
            this.supplyChainCanvas = canvas;
            this.supplyChainCtx = canvas.getContext('2d');
        }
        
        this.components.set('supply_chain_animation', { status: 'active', type: 'animation' });
    }
    
    async initializeAIReasoningDisplay() {
        console.log('🧠 Setting up AI reasoning display...');
        this.components.set('ai_reasoning', { status: 'active', type: 'visualization' });
    }
    
    async initializeEventsTimeline() {
        console.log('⏱️ Setting up events timeline...');
        this.components.set('events_timeline', { status: 'active', type: 'visualization' });
    }
    
    async initializeImpactRipples() {
        console.log('🌊 Setting up impact ripples...');
        
        // Create canvas for ripple effects
        const ripplesPanel = document.getElementById('ripples-panel');
        if (ripplesPanel) {
            const canvas = document.createElement('canvas');
            canvas.id = 'ripples-canvas';
            canvas.width = 400;
            canvas.height = 300;
            canvas.style.cssText = `
                width: 100%;
                height: 100%;
                border-radius: 8px;
            `;
            
            const content = ripplesPanel.querySelector('.panel-content');
            if (content) {
                content.innerHTML = '';
                content.appendChild(canvas);
            }
            
            this.ripplesCanvas = canvas;
            this.ripplesCtx = canvas.getContext('2d');
        }
        
        this.components.set('impact_ripples', { status: 'active', type: 'animation' });
    }
    
    async initializeRelationshipNetwork() {
        console.log('🕸️ Setting up relationship network...');
        
        // Create canvas for network visualization
        const networksPanel = document.getElementById('networks-panel');
        if (networksPanel) {
            const canvas = document.createElement('canvas');
            canvas.id = 'network-canvas';
            canvas.width = 400;
            canvas.height = 300;
            canvas.style.cssText = `
                width: 100%;
                height: 100%;
                border-radius: 8px;
            `;
            
            const content = networksPanel.querySelector('.panel-content');
            if (content) {
                content.innerHTML = '';
                content.appendChild(canvas);
            }
            
            this.networkCanvas = canvas;
            this.networkCtx = canvas.getContext('2d');
        }
        
        this.components.set('relationship_network', { status: 'active', type: 'visualization' });
    }
    
    async initializeDataConnection() {
        console.log('📡 Connecting to enhanced data stream...');
        
        try {
            this.websocket = new WebSocket('ws://localhost:8765');
            
            this.websocket.onopen = () => {
                console.log('📡 Connected to enhanced 500 agent system');
                this.updateConnectionStatus('Connected to enhanced storytelling system');
            };
            
            this.websocket.onmessage = (event) => {
                const data = JSON.parse(event.data);
                this.handleEnhancedData(data);
            };
            
            this.websocket.onerror = (error) => {
                console.warn('⚠️ Enhanced system not available, using simulation mode');
                this.updateConnectionStatus('Enhanced system offline - simulation mode');
                this.startEnhancedSimulation();
            };
            
            this.websocket.onclose = () => {
                console.warn('📡 Connection lost, attempting to reconnect...');
                this.updateConnectionStatus('Connection lost - retrying...');
                setTimeout(() => this.initializeDataConnection(), 5000);
            };
            
        } catch (error) {
            console.warn('⚠️ WebSocket not available, using enhanced simulation mode');
            this.startEnhancedSimulation();
        }
    }
    
    updateConnectionStatus(message) {
        const statusPanel = document.getElementById('status-panel');
        if (statusPanel) {
            const content = statusPanel.querySelector('.panel-content');
            if (content) {
                content.innerHTML = `
                    <div style="
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        height: 100%;
                        text-align: center;
                    ">
                        <div style="font-size: 1.5rem; margin-bottom: 10px;">📡</div>
                        <div style="color: #00ff88; font-size: 0.9rem;">${message}</div>
                        <div style="color: #666; font-size: 0.8rem; margin-top: 10px;">
                            Enhanced storytelling features active
                        </div>
                    </div>
                `;
            }
        }
    }
    
    handleEnhancedData(data) {
        if (data.type === 'system_update' && data.storytelling) {
            this.storyData = data.storytelling;
            this.updateAllStorytellingComponents();
        }
    }
    
    updateAllStorytellingComponents() {
        this.updateEconomicNarratives();
        this.updateAgentBiographies();
        this.updateSupplyChainFlows();
        this.updateAIReasoning();
        this.updateEventsTimeline();
        this.updateImpactRipples();
        this.updateRelationshipNetwork();
        this.updateMarketOverview();
    }
    
    updateEconomicNarratives() {
        const narrativesPanel = document.getElementById('narratives-panel');
        if (!narrativesPanel) return;
        
        const content = narrativesPanel.querySelector('.panel-content');
        if (!content) return;
        
        const narratives = this.storyData.economic_narratives || [];
        
        if (narratives.length === 0) {
            content.innerHTML = `
                <div style="text-align: center; color: #666; padding: 20px;">
                    <div style="font-size: 1.5rem; margin-bottom: 10px;">📖</div>
                    <div>Waiting for economic stories...</div>
                </div>
            `;
            return;
        }
        
        content.innerHTML = narratives.map(narrative => `
            <div style="
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 15px;
                margin-bottom: 10px;
                border-left: 3px solid ${this.getMoodColor(narrative.mood)};
                transition: all 0.3s ease;
            " onmouseover="this.style.background='rgba(255, 255, 255, 0.08)'" 
               onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                ">
                    <span style="
                        font-size: 0.9rem;
                        color: #00ff88;
                        font-weight: 500;
                    ">${narrative.agent_id}</span>
                    <span style="
                        font-size: 0.8rem;
                        color: #666;
                    ">${new Date(narrative.timestamp * 1000).toLocaleTimeString()}</span>
                </div>
                <div style="
                    font-size: 0.95rem;
                    line-height: 1.4;
                    color: #ddd;
                    margin-bottom: 8px;
                ">${narrative.story}</div>
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    font-size: 0.8rem;
                    color: #999;
                ">
                    <span>💰 ${narrative.impact > 0 ? '+' : ''}${narrative.impact.toFixed(0)}</span>
                    <span>🎭 ${narrative.mood}</span>
                    <span>🏢 ${narrative.sector}</span>
                </div>
            </div>
        `).join('');
    }
    
    updateAgentBiographies() {
        const biographiesPanel = document.getElementById('biographies-panel');
        if (!biographiesPanel) return;
        
        const content = biographiesPanel.querySelector('.panel-content');
        if (!content) return;
        
        const agents = this.storyData.featured_agents || [];
        
        if (agents.length === 0) {
            content.innerHTML = `
                <div style="text-align: center; color: #666; padding: 20px;">
                    <div style="font-size: 1.5rem; margin-bottom: 10px;">👤</div>
                    <div>Loading agent biographies...</div>
                </div>
            `;
            return;
        }
        
        content.innerHTML = agents.map(agent => `
            <div style="
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 15px;
                margin-bottom: 10px;
                border: 1px solid ${this.getAgentTypeColor(agent.agent_type)};
                transition: all 0.3s ease;
            " onmouseover="this.style.background='rgba(255, 255, 255, 0.08)'" 
               onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                ">
                    <div style="
                        font-size: 1rem;
                        color: #00ff88;
                        font-weight: 500;
                    ">${agent.agent_id}</div>
                    <div style="
                        font-size: 0.8rem;
                        color: ${this.getAgentTypeColor(agent.agent_type)};
                        background: rgba(255, 255, 255, 0.1);
                        padding: 4px 8px;
                        border-radius: 6px;
                    ">${agent.agent_type}</div>
                </div>
                <div style="
                    font-size: 0.85rem;
                    color: #ccc;
                    margin-bottom: 8px;
                    line-height: 1.3;
                ">${agent.biography?.background || 'Economic agent with unique perspective'}</div>
                <div style="
                    font-size: 0.8rem;
                    color: #999;
                    margin-bottom: 8px;
                ">${agent.biography?.personality_description || agent.personality}</div>
                <div style="
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.8rem;
                    color: #888;
                ">
                    <span>💰 $${agent.wealth?.toFixed(0) || '0'}</span>
                    <span>🎭 ${agent.mood || 'neutral'}</span>
                    <span>🏢 ${agent.sector}</span>
                </div>
                <div style="
                    margin-top: 8px;
                    font-size: 0.8rem;
                    color: #aaa;
                    font-style: italic;
                    line-height: 1.3;
                ">${agent.story_snippet || 'Agent continues their economic journey...'}</div>
            </div>
        `).join('');
    }
    
    updateSupplyChainFlows() {
        if (!this.supplyChainCtx) return;
        
        const flows = this.storyData.supply_chain_flows || [];
        const ctx = this.supplyChainCtx;
        const canvas = this.supplyChainCanvas;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        ctx.fillStyle = 'rgba(10, 10, 10, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (flows.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Waiting for supply chain data...', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        // Draw flows
        flows.forEach((flow, index) => {
            const y = 50 + index * 60;
            const startX = 50;
            const endX = canvas.width - 50;
            
            // Draw flow line
            ctx.strokeStyle = '#00ff88';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(startX, y);
            ctx.lineTo(endX, y);
            ctx.stroke();
            
            // Draw producer (from)
            ctx.fillStyle = '#00ff88';
            ctx.fillRect(startX - 5, y - 5, 10, 10);
            
            // Draw consumer (to)
            ctx.fillStyle = '#00d2ff';
            ctx.fillRect(endX - 5, y - 5, 10, 10);
            
            // Draw flow info
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'left';
            ctx.fillText(`${flow.from} → ${flow.to}`, startX + 20, y - 10);
            ctx.fillText(`$${flow.value.toFixed(0)} (${flow.sector})`, startX + 20, y + 20);
        });
    }
    
    updateAIReasoning() {
        const reasoningPanel = document.getElementById('reasoning-panel');
        if (!reasoningPanel) return;
        
        const content = reasoningPanel.querySelector('.panel-content');
        if (!content) return;
        
        const reasoning = this.storyData.ai_reasoning || [];
        
        if (reasoning.length === 0) {
            content.innerHTML = `
                <div style="text-align: center; color: #666; padding: 20px;">
                    <div style="font-size: 1.5rem; margin-bottom: 10px;">🧠</div>
                    <div>Waiting for AI reasoning...</div>
                </div>
            `;
            return;
        }
        
        content.innerHTML = reasoning.map(thought => `
            <div style="
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 15px;
                margin-bottom: 10px;
                border: 1px solid rgba(255, 215, 0, 0.3);
                position: relative;
                transition: all 0.3s ease;
            " onmouseover="this.style.background='rgba(255, 255, 255, 0.08)'" 
               onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'">
                <div style="
                    position: absolute;
                    top: -10px;
                    left: 20px;
                    background: rgba(255, 215, 0, 0.8);
                    color: #000;
                    padding: 4px 8px;
                    border-radius: 20px;
                    font-size: 0.7rem;
                    font-weight: bold;
                ">💭 THINKING</div>
                <div style="
                    margin-top: 10px;
                    font-size: 0.9rem;
                    color: #00ff88;
                    font-weight: 500;
                    margin-bottom: 8px;
                ">${thought.agent_id}</div>
                <div style="
                    font-size: 0.85rem;
                    color: #ddd;
                    margin-bottom: 8px;
                    line-height: 1.4;
                ">${thought.thought_process}</div>
                <div style="
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.8rem;
                    color: #999;
                ">
                    <span>🎯 ${thought.action}</span>
                    <span>🔮 ${thought.confidence.toFixed(0)}% confident</span>
                </div>
            </div>
        `).join('');
    }
    
    updateEventsTimeline() {
        const timelinePanel = document.getElementById('timeline-panel');
        if (!timelinePanel) return;
        
        const content = timelinePanel.querySelector('.panel-content');
        if (!content) return;
        
        const events = this.storyData.timeline_events || [];
        
        if (events.length === 0) {
            content.innerHTML = `
                <div style="text-align: center; color: #666; padding: 20px;">
                    <div style="font-size: 1.5rem; margin-bottom: 10px;">⏱️</div>
                    <div>Waiting for events...</div>
                </div>
            `;
            return;
        }
        
        content.innerHTML = events.map(event => `
            <div style="
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 15px;
                margin-bottom: 10px;
                border-left: 3px solid ${this.getImpactColor(event.impact)};
                transition: all 0.3s ease;
            " onmouseover="this.style.background='rgba(255, 255, 255, 0.08)'" 
               onmouseout="this.style.background='rgba(255, 255, 255, 0.05)'">
                <div style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 8px;
                ">
                    <span style="
                        font-size: 0.9rem;
                        color: #00ff88;
                        font-weight: 500;
                    ">${event.title}</span>
                    <span style="
                        font-size: 0.8rem;
                        color: #666;
                    ">${new Date(event.timestamp * 1000).toLocaleTimeString()}</span>
                </div>
                <div style="
                    font-size: 0.85rem;
                    color: #ddd;
                    margin-bottom: 8px;
                    line-height: 1.4;
                ">${event.description}</div>
                <div style="
                    display: flex;
                    justify-content: space-between;
                    font-size: 0.8rem;
                    color: #999;
                ">
                    <span>📊 ${event.impact}</span>
                    <span>🏷️ ${event.category}</span>
                </div>
            </div>
        `).join('');
    }
    
    updateImpactRipples() {
        if (!this.ripplesCtx) return;
        
        const ripples = this.storyData.impact_ripples || [];
        const ctx = this.ripplesCtx;
        const canvas = this.ripplesCanvas;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        ctx.fillStyle = 'rgba(10, 10, 10, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (ripples.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Waiting for impact ripples...', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        // Draw ripple effects
        ripples.forEach((ripple, index) => {
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const time = Date.now() - ripple.timestamp * 1000;
            const rippleRadius = Math.min(100, time / 50);
            
            // Draw primary impact
            ctx.strokeStyle = ripple.primary_impact > 0 ? '#00ff88' : '#ff6b6b';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(centerX, centerY, rippleRadius, 0, 2 * Math.PI);
            ctx.stroke();
            
            // Draw ripple effects
            ripple.ripple_effects.forEach((effect, effectIndex) => {
                const effectRadius = rippleRadius + effectIndex * 20;
                ctx.strokeStyle = effect.effect === 'positive' ? '#00ff88' : '#ff6b6b';
                ctx.lineWidth = 1;
                ctx.setLineDash([5, 5]);
                ctx.beginPath();
                ctx.arc(centerX, centerY, effectRadius, 0, 2 * Math.PI);
                ctx.stroke();
                ctx.setLineDash([]);
            });
            
            // Draw source label
            ctx.fillStyle = '#fff';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(ripple.source, centerX, centerY - rippleRadius - 10);
        });
    }
    
    updateRelationshipNetwork() {
        if (!this.networkCtx) return;
        
        const network = this.storyData.relationship_networks || {};
        const ctx = this.networkCtx;
        const canvas = this.networkCanvas;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background
        ctx.fillStyle = 'rgba(10, 10, 10, 0.8)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (!network.nodes || network.nodes.length === 0) {
            ctx.fillStyle = '#666';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Waiting for network data...', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        // Draw edges first
        if (network.edges) {
            network.edges.forEach(edge => {
                const sourceNode = network.nodes.find(n => n.id === edge.source);
                const targetNode = network.nodes.find(n => n.id === edge.target);
                
                if (sourceNode && targetNode) {
                    const sourceX = (sourceNode.wealth || 1000) / 50;
                    const sourceY = Math.random() * canvas.height;
                    const targetX = (targetNode.wealth || 1000) / 50;
                    const targetY = Math.random() * canvas.height;
                    
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
                    ctx.lineWidth = edge.strength || 1;
                    ctx.beginPath();
                    ctx.moveTo(sourceX, sourceY);
                    ctx.lineTo(targetX, targetY);
                    ctx.stroke();
                }
            });
        }
        
        // Draw nodes
        network.nodes.forEach(node => {
            const x = (node.wealth || 1000) / 50;
            const y = Math.random() * canvas.height;
            const size = node.size || 5;
            
            ctx.fillStyle = node.color || '#00ff88';
            ctx.beginPath();
            ctx.arc(x, y, size, 0, 2 * Math.PI);
            ctx.fill();
            
            // Draw label
            ctx.fillStyle = '#fff';
            ctx.font = '10px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(node.id, x, y - size - 5);
        });
    }
    
    updateMarketOverview() {
        const marketPanel = document.getElementById('market-panel');
        if (!marketPanel) return;
        
        const content = marketPanel.querySelector('.panel-content');
        if (!content) return;
        
        // Simulated market data
        const marketData = {
            gdp: 3.2,
            inflation: 2.1,
            unemployment: 4.8,
            agents_active: 347,
            total_wealth: 567000
        };
        
        content.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 15px;">
                <div style="
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                ">
                    <div style="
                        background: rgba(0, 255, 136, 0.1);
                        border-radius: 8px;
                        padding: 15px;
                        text-align: center;
                    ">
                        <div style="font-size: 1.5rem; color: #00ff88; font-weight: bold;">
                            ${marketData.gdp}%
                        </div>
                        <div style="font-size: 0.8rem; color: #999;">GDP Growth</div>
                    </div>
                    <div style="
                        background: rgba(0, 210, 255, 0.1);
                        border-radius: 8px;
                        padding: 15px;
                        text-align: center;
                    ">
                        <div style="font-size: 1.5rem; color: #00d2ff; font-weight: bold;">
                            ${marketData.inflation}%
                        </div>
                        <div style="font-size: 0.8rem; color: #999;">Inflation</div>
                    </div>
                </div>
                <div style="
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                    padding: 15px;
                ">
                    <div style="font-size: 1.2rem; color: #00ff88; margin-bottom: 10px;">
                        ${marketData.agents_active}/500 Agents Active
                    </div>
                    <div style="font-size: 0.9rem; color: #ddd;">
                        Total Wealth: $${marketData.total_wealth.toLocaleString()}
                    </div>
                </div>
            </div>
        `;
    }
    
    startEnhancedSimulation() {
        console.log('🎭 Starting enhanced simulation mode...');
        
        // Generate simulated storytelling data
        setInterval(() => {
            this.generateSimulatedStoryData();
        }, 3000);
    }
    
    generateSimulatedStoryData() {
        // Generate simulated narratives
        const narratives = this.generateSimulatedNarratives();
        const agents = this.generateSimulatedAgents();
        const flows = this.generateSimulatedFlows();
        const reasoning = this.generateSimulatedReasoning();
        const timeline = this.generateSimulatedTimeline();
        const ripples = this.generateSimulatedRipples();
        const networks = this.generateSimulatedNetworks();
        
        this.storyData = {
            economic_narratives: narratives,
            featured_agents: agents,
            supply_chain_flows: flows,
            ai_reasoning: reasoning,
            timeline_events: timeline,
            impact_ripples: ripples,
            relationship_networks: networks
        };
        
        this.updateAllStorytellingComponents();
    }
    
    generateSimulatedNarratives() {
        const agents = ['Agent_001', 'Agent_045', 'Agent_123', 'Agent_234', 'Agent_345'];
        const stories = [
            'successfully expanded operations into renewable energy',
            'formed strategic partnership with tech innovators',
            'discovered new market opportunities in sustainability',
            'optimized supply chain for better efficiency',
            'invested heavily in future technologies'
        ];
        const moods = ['optimistic', 'confident', 'cautious', 'concerned'];
        const sectors = ['technology', 'finance', 'healthcare', 'energy', 'manufacturing'];
        
        return Array.from({length: 5}, (_, i) => ({
            id: `narrative_${i}`,
            timestamp: Date.now() / 1000 - i * 60,
            agent_id: agents[i],
            story: `${agents[i]} ${stories[i]}`,
            mood: moods[i % moods.length],
            impact: (Math.random() - 0.5) * 1000,
            sector: sectors[i % sectors.length]
        }));
    }
    
    generateSimulatedAgents() {
        const types = ['producer', 'consumer', 'financier', 'innovator', 'regulator'];
        const personalities = ['conservative', 'aggressive', 'innovative', 'adaptive'];
        const sectors = ['technology', 'finance', 'healthcare', 'energy', 'manufacturing'];
        
        return Array.from({length: 4}, (_, i) => ({
            agent_id: `Agent_${String(i + 1).padStart(3, '0')}`,
            agent_type: types[i % types.length],
            personality: personalities[i % personalities.length],
            sector: sectors[i % sectors.length],
            wealth: 1000 + Math.random() * 2000,
            mood: ['optimistic', 'confident', 'cautious', 'concerned'][i % 4],
            biography: {
                background: `Experienced ${types[i % types.length]} with deep market knowledge`,
                personality_description: `${personalities[i % personalities.length]} approach to economic decisions`
            },
            story_snippet: `Currently focusing on ${sectors[i % sectors.length]} sector opportunities`
        }));
    }
    
    generateSimulatedFlows() {
        return Array.from({length: 3}, (_, i) => ({
            id: `flow_${i}`,
            from: `Agent_${String(i + 1).padStart(3, '0')}`,
            to: `Agent_${String(i + 100).padStart(3, '0')}`,
            type: 'goods',
            value: 100 + Math.random() * 400,
            sector: ['technology', 'finance', 'healthcare'][i % 3],
            timestamp: Date.now() / 1000 - i * 30
        }));
    }
    
    generateSimulatedReasoning() {
        const agents = ['Agent_001', 'Agent_045', 'Agent_123'];
        const actions = ['PRODUCE', 'INVEST', 'INNOVATE'];
        const thoughts = [
            'Market conditions are favorable for expansion',
            'Risk assessment suggests conservative approach',
            'Innovation opportunities detected in current sector'
        ];
        
        return Array.from({length: 3}, (_, i) => ({
            agent_id: agents[i],
            timestamp: Date.now() / 1000 - i * 45,
            reasoning: `Analyzing market trends and competitor behavior`,
            action: actions[i],
            confidence: 70 + Math.random() * 30,
            thought_process: thoughts[i]
        }));
    }
    
    generateSimulatedTimeline() {
        const events = [
            'Market volatility increased',
            'New regulatory framework announced',
            'Technology breakthrough achieved',
            'Supply chain optimization completed'
        ];
        
        return Array.from({length: 4}, (_, i) => ({
            id: `event_${i}`,
            timestamp: Date.now() / 1000 - i * 120,
            title: events[i],
            description: `Significant impact on ${['technology', 'finance', 'healthcare', 'energy'][i % 4]} sector`,
            impact: ['major', 'significant', 'minor'][i % 3],
            category: ['economic', 'regulatory', 'technological'][i % 3]
        }));
    }
    
    generateSimulatedRipples() {
        return Array.from({length: 2}, (_, i) => ({
            id: `ripple_${i}`,
            source: `Agent_${String(i + 1).padStart(3, '0')}`,
            timestamp: Date.now() / 1000 - i * 60,
            primary_impact: (Math.random() - 0.5) * 500,
            sector: ['technology', 'finance'][i % 2],
            ripple_effects: [
                {
                    target: 'market_sentiment',
                    effect: 'positive',
                    magnitude: 50 + Math.random() * 30
                },
                {
                    target: 'sector_performance',
                    effect: 'boost',
                    magnitude: 40 + Math.random() * 20
                }
            ]
        }));
    }
    
    generateSimulatedNetworks() {
        const nodes = Array.from({length: 10}, (_, i) => ({
            id: `Agent_${String(i + 1).padStart(3, '0')}`,
            type: ['producer', 'consumer', 'financier'][i % 3],
            sector: ['technology', 'finance', 'healthcare'][i % 3],
            wealth: 1000 + Math.random() * 1500,
            size: 5 + Math.random() * 10,
            color: ['#00ff88', '#00d2ff', '#ff6b6b'][i % 3]
        }));
        
        const edges = Array.from({length: 5}, (_, i) => ({
            source: `Agent_${String(i + 1).padStart(3, '0')}`,
            target: `Agent_${String(i + 5).padStart(3, '0')}`,
            type: 'trading',
            strength: 1 + Math.random() * 3,
            interactions: Math.floor(Math.random() * 10) + 1
        }));
        
        return { nodes, edges };
    }
    
    // Helper methods for styling
    getMoodColor(mood) {
        const colors = {
            optimistic: '#00ff88',
            confident: '#00d2ff',
            cautious: '#ffd93d',
            concerned: '#ff8c94',
            stressed: '#ff6b6b'
        };
        return colors[mood] || '#ffffff';
    }
    
    getAgentTypeColor(type) {
        const colors = {
            producer: '#00ff88',
            consumer: '#00d2ff',
            financier: '#ff6b6b',
            innovator: '#ffd93d',
            regulator: '#a8e6cf',
            service_provider: '#ff8c94',
            supplier: '#c7cedb'
        };
        return colors[type] || '#ffffff';
    }
    
    getImpactColor(impact) {
        const colors = {
            major: '#ff6b6b',
            significant: '#ffd93d',
            minor: '#00ff88'
        };
        return colors[impact] || '#ffffff';
    }
    
    async start() {
        console.log('🎭 Starting enhanced storytelling system...');
        this.isRunning = true;
        
        // Start animation loop
        this.animate();
        
        console.log('✅ Enhanced storytelling system is running!');
    }
    
    animate() {
        if (!this.isRunning) return;
        
        // Update animations
        this.updateAnimations();
        
        // Schedule next frame
        this.animationFrameId = requestAnimationFrame(() => this.animate());
    }
    
    updateAnimations() {
        // Update supply chain animations
        this.updateSupplyChainFlows();
        
        // Update ripple animations
        this.updateImpactRipples();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        if (this.websocket) {
            this.websocket.close();
        }
    }
    
    getSystemStatus() {
        return {
            isRunning: this.isRunning,
            componentCount: this.components.size,
            connectedToBackend: this.websocket?.readyState === WebSocket.OPEN,
            storyDataLoaded: Object.keys(this.storyData).length > 0
        };
    }
}

// Export for use
window.EnhancedStorytellingSystem = EnhancedStorytellingSystem;
console.log('🎭 Enhanced Living Economy Storytelling System loaded successfully!');
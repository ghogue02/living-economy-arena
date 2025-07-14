/**
 * Market Crisis System Integration Module
 * Integrates all crisis engines into a unified crisis management system
 */

const MarketCrisisEngine = require('./crisis-engine');
const BankRunEngine = require('./bank-run-engine');
const BubbleEngine = require('./bubble-engine');
const SupplyShockEngine = require('./supply-shock-engine');
const CurrencyCrisisEngine = require('./currency-crisis-engine');
const DebtCascadeEngine = require('./debt-cascade-engine');
const EconomicWarfareEngine = require('./economic-warfare-engine');
const InterventionEngine = require('./intervention-engine');
const CrisisIndicatorsEngine = require('./crisis-indicators');

const EventEmitter = require('eventemitter3');
const logger = require('pino')();

class IntegratedCrisisSystem extends EventEmitter {
    constructor(economicEngine, psychologyEngine, config = {}) {
        super();
        
        this.economicEngine = economicEngine;
        this.psychologyEngine = psychologyEngine;
        
        this.config = {
            enableAllSystems: config.enableAllSystems !== false,
            cascadeMultiplier: config.cascadeMultiplier || 1.2,
            interventionDelay: config.interventionDelay || 5,
            systemIntegration: config.systemIntegration || 'full',
            ...config
        };

        this.state = {
            systemActive: false,
            lastUpdate: 0,
            totalCrises: 0,
            systemStress: 0,
            interventionsActive: 0,
            cascadeEvents: 0
        };

        // Initialize all crisis engines
        this.initializeCrisisEngines();
        
        // Setup cross-engine coordination
        this.setupEngineCoordination();
        
        logger.info('Integrated Crisis System initialized', {
            engines: Object.keys(this.engines).length,
            config: this.config.systemIntegration
        });
    }

    initializeCrisisEngines() {
        this.engines = {};
        
        try {
            // Core crisis engine (orchestrator)
            this.engines.crisis = new MarketCrisisEngine(
                this.economicEngine, 
                this.psychologyEngine, 
                this.config.crisis
            );
            
            // Specialized crisis engines
            this.engines.bankRun = new BankRunEngine(
                this.engines.crisis, 
                this.psychologyEngine, 
                this.config.bankRun
            );
            
            this.engines.bubble = new BubbleEngine(
                this.engines.crisis, 
                this.psychologyEngine, 
                this.config.bubble
            );
            
            this.engines.supplyShock = new SupplyShockEngine(
                this.engines.crisis, 
                this.psychologyEngine, 
                this.config.supplyShock
            );
            
            this.engines.currencyCrisis = new CurrencyCrisisEngine(
                this.engines.crisis, 
                this.psychologyEngine, 
                this.config.currencyCrisis
            );
            
            this.engines.debtCascade = new DebtCascadeEngine(
                this.engines.crisis, 
                this.psychologyEngine, 
                this.config.debtCascade
            );
            
            this.engines.economicWarfare = new EconomicWarfareEngine(
                this.engines.crisis, 
                this.psychologyEngine, 
                this.config.economicWarfare
            );
            
            this.engines.intervention = new InterventionEngine(
                this.engines.crisis, 
                this.psychologyEngine, 
                this.config.intervention
            );
            
            this.engines.indicators = new CrisisIndicatorsEngine(
                this.engines.crisis, 
                this.psychologyEngine, 
                this.config.indicators
            );
            
            // Make engines available to each other for coordination
            this.engines.crisis.bankRunEngine = this.engines.bankRun;
            this.engines.crisis.bubbleEngine = this.engines.bubble;
            this.engines.crisis.supplyShockEngine = this.engines.supplyShock;
            this.engines.crisis.currencyCrisisEngine = this.engines.currencyCrisis;
            this.engines.crisis.debtCascadeEngine = this.engines.debtCascade;
            this.engines.crisis.economicWarfareEngine = this.engines.economicWarfare;
            this.engines.crisis.interventionEngine = this.engines.intervention;
            this.engines.crisis.crisisIndicatorsEngine = this.engines.indicators;
            
            logger.info('All crisis engines initialized successfully');
            
        } catch (error) {
            logger.error('Error initializing crisis engines', { error: error.message });
            throw error;
        }
    }

    setupEngineCoordination() {
        // Setup event listeners for cross-engine coordination
        
        // Crisis triggers cascade to other systems
        this.engines.crisis.on('crisis_triggered', (crisis) => {
            this.handleCrisisCascade(crisis);
        });
        
        // Bank runs can trigger currency crises
        this.engines.bankRun.on('bank_run_triggered', (bankRun) => {
            if (bankRun.intensity > 0.7) {
                this.engines.currencyCrisis.forceCurrencyCrisis('ARENA', 'currency_attack', bankRun.intensity * 0.8);
            }
        });
        
        // Bubble bursts can trigger debt cascades
        this.engines.bubble.on('bubble_burst', (bubble) => {
            if (bubble.burst_severity > 0.6) {
                this.engines.debtCascade.forceDebtCascade('corporate_cascade', bubble.burst_severity * 0.9);
            }
        });
        
        // Supply shocks can trigger economic warfare
        this.engines.supplyShock.on('supply_shock_triggered', (shock) => {
            if (shock.intensity > 0.8 && shock.type === 'trade_embargo') {
                // Escalate to economic warfare
                this.engines.economicWarfare.forceEconomicWar('sovereign_union', 'trading_guild', 'resource_warfare');
            }
        });
        
        // High systemic risk triggers interventions
        this.engines.indicators.on('crisis_alert', (alert) => {
            if (alert.severity >= 4 && !this.engines.intervention.state.interventionActive) {
                setTimeout(() => {
                    this.engines.intervention.forceIntervention('fiscal_stimulus');
                }, this.config.interventionDelay * 100); // Delay for realism
            }
        });
        
        // Economic warfare can trigger sanctions
        this.engines.economicWarfare.on('economic_warfare_escalated', (war) => {
            if (war.intensity > 0.6) {
                this.engines.economicWarfare.forceSanction(war.faction1, war.faction2, war.intensity);
            }
        });
        
        // Aggregate event forwarding
        this.setupEventForwarding();
    }

    setupEventForwarding() {
        // Forward all engine events through the integrated system
        const eventTypes = [
            'crisis_triggered', 'crisis_ended',
            'bank_run_triggered', 'bank_run_resolved', 'bank_failure',
            'bubble_formed', 'bubble_burst',
            'supply_shock_triggered', 'supply_shock_resolved',
            'currency_crisis_triggered', 'currency_crisis_resolved', 'speculative_attack_launched',
            'debt_cascade_triggered', 'debt_cascade_resolved', 'debt_default', 'credit_freeze_triggered',
            'economic_warfare_escalated', 'economic_war_resolved', 'sanction_retaliation',
            'intervention_launched', 'intervention_completed',
            'crisis_alert', 'early_warning'
        ];
        
        for (const [engineName, engine] of Object.entries(this.engines)) {
            for (const eventType of eventTypes) {
                engine.on(eventType, (data) => {
                    this.emit(eventType, { engine: engineName, ...data });
                    this.updateSystemMetrics(eventType, data);
                });
            }
        }
    }

    handleCrisisCascade(crisis) {
        this.state.cascadeEvents++;
        
        // Determine cascade targets based on crisis type and intensity
        const cascadeTargets = this.determineCascadeTargets(crisis);
        
        for (const target of cascadeTargets) {
            const cascadeIntensity = crisis.intensity * this.config.cascadeMultiplier * Math.random();
            
            setTimeout(() => {
                this.triggerCascadeCrisis(target, cascadeIntensity);
            }, Math.random() * 5000); // Random delay 0-5 seconds
        }
    }

    determineCascadeTargets(crisis) {
        const targets = [];
        
        switch (crisis.type) {
            case 'bank_run':
                if (crisis.intensity > 0.6) targets.push('currency_crisis', 'debt_cascade');
                break;
            case 'bubble_burst':
                if (crisis.intensity > 0.7) targets.push('bank_run', 'debt_cascade');
                break;
            case 'supply_shock':
                if (crisis.intensity > 0.5) targets.push('currency_crisis', 'economic_warfare');
                break;
            case 'currency_crisis':
                if (crisis.intensity > 0.8) targets.push('bank_run', 'supply_shock');
                break;
            case 'debt_cascade':
                if (crisis.intensity > 0.7) targets.push('bank_run', 'currency_crisis');
                break;
        }
        
        return targets;
    }

    triggerCascadeCrisis(targetType, intensity) {
        switch (targetType) {
            case 'bank_run':
                this.engines.bankRun.forceBankRun('commercial_bank_1');
                break;
            case 'bubble_burst':
                this.engines.bubble.forceBubbleBurst('technology');
                break;
            case 'supply_shock':
                this.engines.supplyShock.forceSupplyShock('energy', 'resource_shortage', intensity);
                break;
            case 'currency_crisis':
                this.engines.currencyCrisis.forceCurrencyCrisis('REGIONAL', 'currency_attack', intensity);
                break;
            case 'debt_cascade':
                this.engines.debtCascade.forceDebtCascade('corporate_cascade', intensity);
                break;
            case 'economic_warfare':
                this.engines.economicWarfare.forceEconomicWar('corporate_alliance', 'tech_syndicate', 'trade_war');
                break;
        }
        
        logger.warn('Cascade crisis triggered', { targetType, intensity });
    }

    updateSystemMetrics(eventType, data) {
        this.state.lastUpdate = Date.now();
        
        // Update crisis count
        if (eventType.includes('triggered')) {
            this.state.totalCrises++;
        }
        
        // Update intervention count
        if (eventType === 'intervention_launched') {
            this.state.interventionsActive++;
        } else if (eventType === 'intervention_completed') {
            this.state.interventionsActive = Math.max(0, this.state.interventionsActive - 1);
        }
        
        // Calculate system stress
        this.calculateSystemStress();
    }

    calculateSystemStress() {
        let stress = 0;
        let componentCount = 0;
        
        // Aggregate stress from all engines
        try {
            const crisisStatus = this.engines.crisis.getCrisisStatus();
            stress += crisisStatus.crisisIntensity * 0.3;
            componentCount++;
            
            const bankStatus = this.engines.bankRun.getBankRunStatus();
            stress += bankStatus.systemPanic * 0.2;
            componentCount++;
            
            const currencyStatus = this.engines.currencyCrisis.getCurrencyCrisisStatus();
            const activeCurrencyCrises = currencyStatus.activeCrises || [];
            stress += Math.min(1, activeCurrencyCrises.length * 0.2) * 0.15;
            componentCount++;
            
            const debtStatus = this.engines.debtCascade.getDebtCascadeStatus();
            stress += debtStatus.systemicRisk * 0.15;
            componentCount++;
            
            const warfareStatus = this.engines.economicWarfare.getEconomicWarfareStatus();
            const activeWars = warfareStatus.activeWars || [];
            stress += Math.min(1, activeWars.length * 0.3) * 0.1;
            componentCount++;
            
            const supplyStatus = this.engines.supplyShock.getSupplyShockStatus();
            const activeShocks = supplyStatus.activeShocks || [];
            stress += Math.min(1, activeShocks.length * 0.2) * 0.1;
            componentCount++;
            
        } catch (error) {
            logger.error('Error calculating system stress', { error: error.message });
            return;
        }
        
        this.state.systemStress = componentCount > 0 ? stress / componentCount : 0;
    }

    // Main tick processing - coordinates all engines
    tick(marketData, agents) {
        if (!this.state.systemActive) return null;
        
        const tickStart = Date.now();
        const results = {};
        
        try {
            // Run crisis indicators first for early warning
            results.indicators = this.engines.indicators.tick(marketData, agents);
            
            // Run core crisis engine
            results.crisis = this.engines.crisis.tick(marketData, agents);
            
            // Run specialized engines in parallel (simulated)
            const enginePromises = [
                this.engines.bankRun.tick(marketData, agents),
                this.engines.bubble.tick(marketData, agents),
                this.engines.supplyShock.tick(marketData, agents),
                this.engines.currencyCrisis.tick(marketData, agents),
                this.engines.debtCascade.tick(marketData, agents),
                this.engines.economicWarfare.tick(marketData, agents),
                this.engines.intervention.tick(marketData, agents)
            ];
            
            // Collect results
            results.bankRun = enginePromises[0];
            results.bubble = enginePromises[1];
            results.supplyShock = enginePromises[2];
            results.currencyCrisis = enginePromises[3];
            results.debtCascade = enginePromises[4];
            results.economicWarfare = enginePromises[5];
            results.intervention = enginePromises[6];
            
            // Update system metrics
            this.calculateSystemStress();
            
            const processingTime = Date.now() - tickStart;
            
            // Emit system update
            this.emit('system_update', {
                results,
                systemStress: this.state.systemStress,
                processingTime,
                timestamp: Date.now()
            });
            
            return {
                ...results,
                systemMetrics: {
                    systemStress: this.state.systemStress,
                    totalCrises: this.state.totalCrises,
                    interventionsActive: this.state.interventionsActive,
                    cascadeEvents: this.state.cascadeEvents,
                    processingTime
                }
            };
            
        } catch (error) {
            logger.error('Error in crisis system tick', { error: error.message });
            return null;
        }
    }

    // Public API
    start() {
        this.state.systemActive = true;
        this.state.lastUpdate = Date.now();
        
        logger.info('Integrated Crisis System started');
        this.emit('system_started');
    }

    stop() {
        this.state.systemActive = false;
        
        logger.info('Integrated Crisis System stopped');
        this.emit('system_stopped');
    }

    getSystemStatus() {
        return {
            active: this.state.systemActive,
            systemStress: this.state.systemStress,
            totalCrises: this.state.totalCrises,
            interventionsActive: this.state.interventionsActive,
            cascadeEvents: this.state.cascadeEvents,
            lastUpdate: this.state.lastUpdate,
            engines: {
                crisis: this.engines.crisis ? 'active' : 'inactive',
                bankRun: this.engines.bankRun ? 'active' : 'inactive',
                bubble: this.engines.bubble ? 'active' : 'inactive',
                supplyShock: this.engines.supplyShock ? 'active' : 'inactive',
                currencyCrisis: this.engines.currencyCrisis ? 'active' : 'inactive',
                debtCascade: this.engines.debtCascade ? 'active' : 'inactive',
                economicWarfare: this.engines.economicWarfare ? 'active' : 'inactive',
                intervention: this.engines.intervention ? 'active' : 'inactive',
                indicators: this.engines.indicators ? 'active' : 'inactive'
            }
        };
    }

    getComprehensiveStatus() {
        const status = {};
        
        try {
            for (const [engineName, engine] of Object.entries(this.engines)) {
                const methodName = `get${engineName.charAt(0).toUpperCase() + engineName.slice(1)}Status`;
                
                if (engineName === 'crisis') {
                    status.crisis = engine.getCrisisStatus();
                } else if (engineName === 'bankRun') {
                    status.bankRun = engine.getBankRunStatus();
                } else if (engineName === 'bubble') {
                    status.bubble = engine.getBubbleStatus();
                } else if (engineName === 'supplyShock') {
                    status.supplyShock = engine.getSupplyShockStatus();
                } else if (engineName === 'currencyCrisis') {
                    status.currencyCrisis = engine.getCurrencyCrisisStatus();
                } else if (engineName === 'debtCascade') {
                    status.debtCascade = engine.getDebtCascadeStatus();
                } else if (engineName === 'economicWarfare') {
                    status.economicWarfare = engine.getEconomicWarfareStatus();
                } else if (engineName === 'intervention') {
                    status.intervention = engine.getInterventionStatus();
                } else if (engineName === 'indicators') {
                    status.indicators = engine.getCrisisIndicatorsStatus();
                }
            }
            
        } catch (error) {
            logger.error('Error getting comprehensive status', { error: error.message });
        }
        
        return {
            system: this.getSystemStatus(),
            engines: status
        };
    }

    getDashboard() {
        try {
            const dashboard = this.engines.indicators.getDashboard();
            
            // Add system-wide information
            dashboard.systemStress = this.state.systemStress;
            dashboard.activeCrises = this.state.totalCrises;
            dashboard.activeInterventions = this.state.interventionsActive;
            dashboard.cascadeEvents = this.state.cascadeEvents;
            
            // Add engine health
            dashboard.engineHealth = {};
            for (const [engineName, engine] of Object.entries(this.engines)) {
                dashboard.engineHealth[engineName] = 'operational';
            }
            
            return dashboard;
            
        } catch (error) {
            logger.error('Error generating dashboard', { error: error.message });
            return {
                systemHealth: { score: 0.5, status: 'unknown' },
                error: 'Dashboard generation failed'
            };
        }
    }

    // Testing and manual controls
    triggerTestCrisis(crisisType, intensity = 0.8) {
        const results = {};
        
        switch (crisisType) {
            case 'bank_run':
                results.success = this.engines.bankRun.forceBankRun('commercial_bank_1');
                break;
            case 'bubble':
                results.success = this.engines.bubble.forceBubble('technology', intensity);
                break;
            case 'supply_shock':
                results.success = this.engines.supplyShock.forceSupplyShock('energy', 'resource_shortage', intensity);
                break;
            case 'currency_crisis':
                results.success = this.engines.currencyCrisis.forceCurrencyCrisis('ARENA', 'currency_attack', intensity);
                break;
            case 'debt_cascade':
                results.cascadeId = this.engines.debtCascade.forceDebtCascade('corporate_cascade', intensity);
                results.success = !!results.cascadeId;
                break;
            case 'economic_war':
                results.success = this.engines.economicWarfare.forceEconomicWar('corporate_alliance', 'sovereign_union', 'trade_war');
                break;
            case 'systemic':
                results.success = this.engines.crisis.forceCrisis('debt_cascade', intensity);
                break;
            default:
                results.success = false;
                results.error = 'Unknown crisis type';
        }
        
        if (results.success) {
            logger.info('Test crisis triggered', { crisisType, intensity });
            this.emit('test_crisis_triggered', { crisisType, intensity, results });
        }
        
        return results;
    }

    triggerTestIntervention(interventionType = 'fiscal_stimulus') {
        return this.engines.intervention.forceIntervention(interventionType);
    }

    resetSystem() {
        this.state.totalCrises = 0;
        this.state.cascadeEvents = 0;
        this.state.interventionsActive = 0;
        this.state.systemStress = 0;
        
        logger.info('Crisis system reset');
        this.emit('system_reset');
    }

    // Get specific engine for direct access
    getEngine(engineName) {
        return this.engines[engineName] || null;
    }
}

module.exports = IntegratedCrisisSystem;
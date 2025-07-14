/**
 * Bank Run Mechanics Engine
 * Simulates panic-driven liquidity crises with agent psychological contagion
 */

const EventEmitter = require('eventemitter3');
const Decimal = require('decimal.js');
const { v4: uuidv4 } = require('uuid');
const logger = require('pino')();

class BankRunEngine extends EventEmitter {
    constructor(crisisEngine, psychologyEngine, config = {}) {
        super();
        
        this.crisisEngine = crisisEngine;
        this.psychologyEngine = psychologyEngine;
        
        this.config = {
            panicThreshold: config.panicThreshold || 0.7,
            contagionRate: config.contagionRate || 0.15,
            withdrawalLimit: config.withdrawalLimit || 0.3,
            liquidityBuffer: config.liquidityBuffer || 0.2,
            panicDecayRate: config.panicDecayRate || 0.02,
            socialInfluenceRadius: config.socialInfluenceRadius || 5,
            ...config
        };

        this.state = {
            bankingInstitutions: new Map(),
            activeBankRuns: new Map(),
            panicLevels: new Map(),
            withdrawalQueues: new Map(),
            liquidityStress: 0,
            systemPanic: 0,
            contagionMap: new Map()
        };

        this.initializeBankingSystem();
        
        logger.info('Bank Run Engine initialized');
    }

    initializeBankingSystem() {
        // Initialize virtual banks/financial institutions
        const banks = [
            { id: 'central_bank', name: 'Central Bank', liquidity: 1.0, reserves: 0.3, systemically_important: true },
            { id: 'commercial_bank_1', name: 'First Commercial Bank', liquidity: 0.8, reserves: 0.15, systemically_important: true },
            { id: 'commercial_bank_2', name: 'Second Commercial Bank', liquidity: 0.75, reserves: 0.12, systemically_important: false },
            { id: 'investment_bank', name: 'Investment Bank', liquidity: 0.6, reserves: 0.08, systemically_important: true },
            { id: 'community_bank', name: 'Community Bank', liquidity: 0.7, reserves: 0.18, systemically_important: false }
        ];

        banks.forEach(bank => {
            this.state.bankingInstitutions.set(bank.id, {
                ...bank,
                deposits: new Decimal(1000000 + Math.random() * 5000000),
                loans: new Decimal(800000 + Math.random() * 4000000),
                assets: new Decimal(1200000 + Math.random() * 6000000),
                confidence: 0.8,
                withdrawalRate: 0,
                queueLength: 0,
                runRisk: 0,
                interbank_connections: new Set(),
                agent_deposits: new Map()
            });
        });

        // Establish interbank connections
        this.establishInterbankNetwork();
    }

    establishInterbankNetwork() {
        const bankIds = Array.from(this.state.bankingInstitutions.keys());
        
        // Create interconnected network
        for (const bankId of bankIds) {
            const bank = this.state.bankingInstitutions.get(bankId);
            
            // Connect to other banks based on systemic importance
            for (const otherBankId of bankIds) {
                if (bankId !== otherBankId) {
                    const otherBank = this.state.bankingInstitutions.get(otherBankId);
                    
                    // Higher probability of connection for systemically important banks
                    const connectionProbability = (bank.systemically_important ? 0.8 : 0.4) * 
                                                 (otherBank.systemically_important ? 0.8 : 0.4);
                    
                    if (Math.random() < connectionProbability) {
                        bank.interbank_connections.add(otherBankId);
                    }
                }
            }
        }
    }

    // Main tick processing
    tick(marketData, agents) {
        this.updateBankStates(marketData, agents);
        this.calculateRunRisks();
        this.processWithdrawals(agents);
        this.updatePanicLevels(agents);
        this.processContagion();
        this.evaluateBankRunTriggers();
        this.updateActiveBankRuns();
        
        return this.getBankRunStatus();
    }

    updateBankStates(marketData, agents) {
        for (const [bankId, bank] of this.state.bankingInstitutions) {
            // Update liquidity based on market conditions
            const marketStress = this.calculateMarketStress(marketData);
            bank.liquidity = Math.max(0.1, bank.liquidity - marketStress * 0.01);
            
            // Update agent deposits
            this.updateAgentDeposits(bank, agents);
            
            // Calculate confidence based on various factors
            bank.confidence = this.calculateBankConfidence(bank, marketData);
            
            // Update run risk based on confidence and liquidity
            bank.runRisk = this.calculateBankRunRisk(bank);
        }
    }

    updateAgentDeposits(bank, agents) {
        bank.agent_deposits.clear();
        let totalDeposits = new Decimal(0);
        
        for (const [agentId, agent] of agents) {
            if (agent.isActive && agent.preferredBank === bank.id) {
                const deposit = agent.wealth ? agent.wealth.mul(0.7) : new Decimal(1000);
                bank.agent_deposits.set(agentId, deposit);
                totalDeposits = totalDeposits.plus(deposit);
            }
        }
        
        bank.deposits = totalDeposits;
    }

    calculateBankConfidence(bank, marketData) {
        let confidence = 0.8; // Base confidence
        
        // Liquidity affects confidence
        confidence += (bank.liquidity - 0.5) * 0.4;
        
        // Reserves affect confidence
        confidence += (bank.reserves - 0.1) * 0.3;
        
        // Market conditions affect confidence
        const psychologyState = this.psychologyEngine.getPsychologyState();
        confidence += (psychologyState.globalSentiment - 0.5) * 0.5;
        confidence -= psychologyState.fearIndex * 0.3;
        
        // Loan-to-deposit ratio affects confidence
        const loanRatio = bank.loans.div(bank.deposits.plus(1)).toNumber();
        if (loanRatio > 0.9) confidence -= 0.2;
        if (loanRatio > 1.0) confidence -= 0.3;
        
        return Math.max(0, Math.min(1, confidence));
    }

    calculateBankRunRisk(bank) {
        let risk = 0;
        
        // Low confidence increases risk
        risk += (1 - bank.confidence) * 0.4;
        
        // Low liquidity increases risk
        risk += (1 - bank.liquidity) * 0.3;
        
        // High withdrawal rate increases risk
        risk += bank.withdrawalRate * 0.2;
        
        // Queue length indicates developing run
        risk += Math.min(bank.queueLength / 100, 0.5) * 0.1;
        
        return Math.max(0, Math.min(1, risk));
    }

    calculateRunRisks() {
        for (const [bankId, bank] of this.state.bankingInstitutions) {
            bank.runRisk = this.calculateBankRunRisk(bank);
        }
    }

    processWithdrawals(agents) {
        for (const [bankId, bank] of this.state.bankingInstitutions) {
            const queue = this.state.withdrawalQueues.get(bankId) || [];
            let processedWithdrawals = 0;
            let totalWithdrawalAmount = new Decimal(0);
            
            // Process withdrawals based on bank's liquidity capacity
            const maxWithdrawals = Math.floor(bank.liquidity * 100);
            
            while (queue.length > 0 && processedWithdrawals < maxWithdrawals) {
                const withdrawal = queue.shift();
                const agent = agents.get(withdrawal.agentId);
                
                if (agent && agent.isActive) {
                    const requestedAmount = withdrawal.amount;
                    const actualAmount = requestedAmount.mul(Math.min(1, bank.liquidity * 2));
                    
                    // Process withdrawal
                    agent.wealth = (agent.wealth || new Decimal(0)).plus(actualAmount);
                    bank.deposits = bank.deposits.minus(actualAmount);
                    totalWithdrawalAmount = totalWithdrawalAmount.plus(actualAmount);
                    
                    // Reduce bank liquidity
                    const liquidityImpact = actualAmount.div(bank.assets).toNumber();
                    bank.liquidity = Math.max(0.1, bank.liquidity - liquidityImpact);
                    
                    processedWithdrawals++;
                }
            }
            
            // Update withdrawal rate and queue length
            bank.withdrawalRate = processedWithdrawals / Math.max(1, bank.agent_deposits.size);
            bank.queueLength = queue.length;
            
            // Update withdrawal queue
            this.state.withdrawalQueues.set(bankId, queue);
        }
    }

    updatePanicLevels(agents) {
        for (const [agentId, agent] of agents) {
            if (!agent.isActive) continue;
            
            let panicLevel = this.state.panicLevels.get(agentId) || 0;
            
            // Calculate agent-specific panic factors
            const psychology = agent.psychology || {};
            const fear = psychology.fear || 0.5;
            const confidence = psychology.confidence || 0.5;
            
            // Bank-specific panic
            if (agent.preferredBank) {
                const bank = this.state.bankingInstitutions.get(agent.preferredBank);
                if (bank) {
                    panicLevel += (1 - bank.confidence) * 0.2;
                    panicLevel += bank.runRisk * 0.3;
                    panicLevel += bank.withdrawalRate * 0.4;
                }
            }
            
            // Market panic
            const psychologyState = this.psychologyEngine.getPsychologyState();
            panicLevel += psychologyState.fearIndex * 0.3;
            panicLevel += (1 - psychologyState.globalSentiment) * 0.2;
            
            // Personal psychology
            panicLevel += fear * 0.3;
            panicLevel -= confidence * 0.2;
            
            // Social contagion
            panicLevel += this.calculateSocialContagion(agentId, agents) * 0.4;
            
            // Natural decay
            panicLevel *= (1 - this.config.panicDecayRate);
            
            // Clamp and store
            panicLevel = Math.max(0, Math.min(1, panicLevel));
            this.state.panicLevels.set(agentId, panicLevel);
            
            // Trigger withdrawal if panic exceeds threshold
            if (panicLevel > this.config.panicThreshold && Math.random() < 0.3) {
                this.triggerWithdrawal(agentId, agent);
            }
        }
        
        // Update system panic level
        const allPanicLevels = Array.from(this.state.panicLevels.values());
        this.state.systemPanic = allPanicLevels.length > 0 
            ? allPanicLevels.reduce((sum, level) => sum + level, 0) / allPanicLevels.length 
            : 0;
    }

    calculateSocialContagion(agentId, agents) {
        let contagion = 0;
        let influenceCount = 0;
        
        // Get agent's social network (simplified - using random connections)
        const influenceRadius = this.config.socialInfluenceRadius;
        const agentIds = Array.from(agents.keys());
        const connections = this.getAgentConnections(agentId, agentIds, influenceRadius);
        
        for (const connectedAgentId of connections) {
            const connectedPanic = this.state.panicLevels.get(connectedAgentId) || 0;
            contagion += connectedPanic;
            influenceCount++;
        }
        
        return influenceCount > 0 ? (contagion / influenceCount) * this.config.contagionRate : 0;
    }

    getAgentConnections(agentId, allAgentIds, radius) {
        // Simplified social network - in reality would use actual relationship data
        const connections = [];
        const agentIndex = allAgentIds.indexOf(agentId);
        
        for (let i = 0; i < radius && connections.length < radius; i++) {
            const nextIndex = (agentIndex + i + 1) % allAgentIds.length;
            const prevIndex = (agentIndex - i - 1 + allAgentIds.length) % allAgentIds.length;
            
            if (i < radius / 2) connections.push(allAgentIds[nextIndex]);
            if (connections.length < radius) connections.push(allAgentIds[prevIndex]);
        }
        
        return connections;
    }

    triggerWithdrawal(agentId, agent) {
        if (!agent.preferredBank) return;
        
        const bank = this.state.bankingInstitutions.get(agent.preferredBank);
        if (!bank) return;
        
        const deposit = bank.agent_deposits.get(agentId);
        if (!deposit || deposit.lte(0)) return;
        
        // Panic withdrawals typically try to withdraw more than available
        const panicMultiplier = 1 + (this.state.panicLevels.get(agentId) || 0) * 0.5;
        const withdrawalAmount = deposit.mul(Math.min(this.config.withdrawalLimit * panicMultiplier, 1));
        
        // Add to withdrawal queue
        const queue = this.state.withdrawalQueues.get(agent.preferredBank) || [];
        queue.push({
            agentId,
            amount: withdrawalAmount,
            timestamp: Date.now(),
            urgency: this.state.panicLevels.get(agentId) || 0
        });
        
        // Sort queue by urgency (panic level)
        queue.sort((a, b) => b.urgency - a.urgency);
        
        this.state.withdrawalQueues.set(agent.preferredBank, queue);
        
        logger.debug('Panic withdrawal triggered', {
            agentId,
            bankId: agent.preferredBank,
            amount: withdrawalAmount.toString(),
            panicLevel: this.state.panicLevels.get(agentId)
        });
    }

    processContagion() {
        // Bank-to-bank contagion through interbank network
        for (const [bankId, bank] of this.state.bankingInstitutions) {
            if (bank.runRisk > 0.6) { // High risk bank
                // Spread fear to connected banks
                for (const connectedBankId of bank.interbank_connections) {
                    const connectedBank = this.state.bankingInstitutions.get(connectedBankId);
                    if (connectedBank) {
                        const contagionStrength = bank.runRisk * 0.2;
                        connectedBank.confidence = Math.max(0, connectedBank.confidence - contagionStrength);
                        
                        // Update contagion map
                        const contagionKey = `${bankId}->${connectedBankId}`;
                        this.state.contagionMap.set(contagionKey, {
                            source: bankId,
                            target: connectedBankId,
                            strength: contagionStrength,
                            timestamp: Date.now()
                        });
                    }
                }
            }
        }
        
        // Clean old contagion records
        const cutoffTime = Date.now() - 300000; // 5 minutes
        for (const [key, contagion] of this.state.contagionMap) {
            if (contagion.timestamp < cutoffTime) {
                this.state.contagionMap.delete(key);
            }
        }
    }

    evaluateBankRunTriggers() {
        for (const [bankId, bank] of this.state.bankingInstitutions) {
            if (this.state.activeBankRuns.has(bankId)) continue;
            
            const triggerProbability = this.calculateBankRunTriggerProbability(bank);
            
            if (triggerProbability > 0.8 && Math.random() < 0.1) {
                this.triggerBankRun(bankId, bank);
            }
        }
    }

    calculateBankRunTriggerProbability(bank) {
        let probability = 0;
        
        // Primary factors
        probability += bank.runRisk * 0.4;
        probability += (1 - bank.confidence) * 0.3;
        probability += (1 - bank.liquidity) * 0.2;
        probability += bank.withdrawalRate * 0.1;
        
        // Queue length pressure
        if (bank.queueLength > 50) probability += 0.2;
        if (bank.queueLength > 100) probability += 0.3;
        
        // System panic amplifies individual bank risk
        probability += this.state.systemPanic * 0.3;
        
        return Math.min(1, probability);
    }

    triggerBankRun(bankId, bank) {
        const bankRun = {
            id: uuidv4(),
            bankId,
            bankName: bank.name,
            startTime: Date.now(),
            intensity: 0.5 + Math.random() * 0.3,
            phase: 'initial', // initial, acceleration, peak, resolution
            duration: 0,
            withdrawalsProcessed: 0,
            liquidityLost: new Decimal(0),
            depositors_affected: new Set(),
            contagion_spread: []
        };
        
        // Intensify based on bank importance
        if (bank.systemically_important) {
            bankRun.intensity *= 1.3;
        }
        
        this.state.activeBankRuns.set(bankId, bankRun);
        
        // Immediate effects
        bank.confidence *= 0.6; // Sharp confidence drop
        bank.liquidity *= 0.8; // Immediate liquidity pressure
        
        // Trigger psychological response in agents
        this.spreadBankRunPanic(bankId, bankRun.intensity);
        
        logger.warn('Bank run triggered', {
            bankId,
            bankName: bank.name,
            intensity: bankRun.intensity,
            systemicallyImportant: bank.systemically_important
        });
        
        this.emit('bank_run_triggered', bankRun);
    }

    spreadBankRunPanic(bankId, intensity) {
        // Increase panic levels for depositors of the affected bank
        for (const [agentId, panicLevel] of this.state.panicLevels) {
            const agents = this.crisisEngine.economicEngine.agents;
            const agent = agents.get(agentId);
            
            if (agent && agent.preferredBank === bankId) {
                // Direct depositors experience high panic
                const newPanic = Math.min(1, panicLevel + intensity * 0.6);
                this.state.panicLevels.set(agentId, newPanic);
            } else {
                // Others experience some contagion
                const newPanic = Math.min(1, panicLevel + intensity * 0.2);
                this.state.panicLevels.set(agentId, newPanic);
            }
        }
        
        // Update psychology engine
        this.psychologyEngine.triggerPsychologyEvent('market_crash', intensity);
    }

    updateActiveBankRuns() {
        for (const [bankId, bankRun] of this.state.activeBankRuns) {
            bankRun.duration++;
            
            const bank = this.state.bankingInstitutions.get(bankId);
            if (!bank) continue;
            
            // Update bank run phase
            this.updateBankRunPhase(bankRun, bank);
            
            // Apply bank run effects
            this.applyBankRunEffects(bankRun, bank);
            
            // Check for resolution
            if (this.shouldResolveBankRun(bankRun, bank)) {
                this.resolveBankRun(bankId, bankRun);
            }
        }
    }

    updateBankRunPhase(bankRun, bank) {
        if (bankRun.duration < 5) {
            bankRun.phase = 'initial';
        } else if (bankRun.duration < 15 && bank.queueLength > 50) {
            bankRun.phase = 'acceleration';
            bankRun.intensity *= 1.1; // Accelerating intensity
        } else if (bankRun.duration < 30 && bank.queueLength > 100) {
            bankRun.phase = 'peak';
            bankRun.intensity = Math.min(1, bankRun.intensity * 1.05);
        } else {
            bankRun.phase = 'resolution';
            bankRun.intensity *= 0.95; // Gradually declining
        }
    }

    applyBankRunEffects(bankRun, bank) {
        const intensityEffect = bankRun.intensity * 0.1;
        
        // Liquidity pressure
        bank.liquidity = Math.max(0.05, bank.liquidity - intensityEffect);
        
        // Confidence erosion
        bank.confidence = Math.max(0, bank.confidence - intensityEffect * 0.5);
        
        // Increased withdrawal processing urgency
        bank.withdrawalRate += intensityEffect;
        
        // Track affected depositors
        const queue = this.state.withdrawalQueues.get(bank.id) || [];
        queue.forEach(withdrawal => {
            bankRun.depositors_affected.add(withdrawal.agentId);
        });
    }

    shouldResolveBankRun(bankRun, bank) {
        // Resolution conditions
        return (
            bankRun.duration > 50 || // Time limit
            bankRun.intensity < 0.1 || // Low intensity
            bank.queueLength < 5 || // Few remaining withdrawals
            bank.liquidity < 0.1 // Bank failure
        );
    }

    resolveBankRun(bankId, bankRun) {
        const bank = this.state.bankingInstitutions.get(bankId);
        bankRun.endTime = Date.now();
        bankRun.totalDuration = bankRun.endTime - bankRun.startTime;
        
        // Determine resolution type
        if (bank.liquidity < 0.1) {
            bankRun.resolution = 'bank_failure';
            this.processBankFailure(bankId, bank);
        } else if (bankRun.intensity < 0.3) {
            bankRun.resolution = 'natural_resolution';
        } else {
            bankRun.resolution = 'intervention_resolution';
            // Trigger intervention through crisis engine
            this.crisisEngine.triggerIntervention({ systemicRisk: bankRun.intensity });
        }
        
        this.state.activeBankRuns.delete(bankId);
        
        logger.info('Bank run resolved', {
            bankId,
            resolution: bankRun.resolution,
            duration: bankRun.totalDuration,
            depositorsAffected: bankRun.depositors_affected.size
        });
        
        this.emit('bank_run_resolved', bankRun);
    }

    processBankFailure(bankId, bank) {
        // Bank failure consequences
        bank.liquidity = 0;
        bank.confidence = 0;
        bank.deposits = new Decimal(0);
        
        // Trigger systemic effects
        this.state.systemPanic = Math.min(1, this.state.systemPanic + 0.3);
        
        // Spread contagion to connected banks
        for (const connectedBankId of bank.interbank_connections) {
            const connectedBank = this.state.bankingInstitutions.get(connectedBankId);
            if (connectedBank) {
                connectedBank.confidence *= 0.7;
                connectedBank.liquidity *= 0.9;
            }
        }
        
        logger.error('Bank failure', { bankId, bankName: bank.name });
        this.emit('bank_failure', { bankId, bank });
    }

    // Utility methods
    calculateMarketStress(marketData) {
        let stress = 0;
        let marketCount = 0;
        
        for (const [marketId, market] of marketData) {
            stress += market.volatility || 0;
            marketCount++;
        }
        
        return marketCount > 0 ? stress / marketCount : 0;
    }

    // Public API
    getBankRunStatus() {
        return {
            activeBankRuns: Array.from(this.state.activeBankRuns.values()),
            systemPanic: this.state.systemPanic,
            liquidityStress: this.state.liquidityStress,
            bankingSystem: this.getBankingSystemOverview(),
            withdrawalQueues: this.getWithdrawalQueuesOverview(),
            contagionNetwork: Array.from(this.state.contagionMap.values())
        };
    }

    getBankingSystemOverview() {
        const overview = [];
        
        for (const [bankId, bank] of this.state.bankingInstitutions) {
            overview.push({
                id: bankId,
                name: bank.name,
                liquidity: bank.liquidity,
                confidence: bank.confidence,
                runRisk: bank.runRisk,
                withdrawalRate: bank.withdrawalRate,
                queueLength: bank.queueLength,
                systemicallyImportant: bank.systemically_important,
                hasActiveRun: this.state.activeBankRuns.has(bankId)
            });
        }
        
        return overview;
    }

    getWithdrawalQueuesOverview() {
        const overview = [];
        
        for (const [bankId, queue] of this.state.withdrawalQueues) {
            if (queue.length > 0) {
                overview.push({
                    bankId,
                    queueLength: queue.length,
                    totalAmount: queue.reduce((sum, w) => sum.plus(w.amount), new Decimal(0)).toString(),
                    averageUrgency: queue.reduce((sum, w) => sum + w.urgency, 0) / queue.length
                });
            }
        }
        
        return overview;
    }

    getPanicStatistics() {
        const panicLevels = Array.from(this.state.panicLevels.values());
        
        return {
            systemPanic: this.state.systemPanic,
            agentsInPanic: panicLevels.filter(level => level > this.config.panicThreshold).length,
            averagePanic: panicLevels.length > 0 ? panicLevels.reduce((sum, level) => sum + level, 0) / panicLevels.length : 0,
            maxPanic: Math.max(...panicLevels, 0),
            panicDistribution: {
                low: panicLevels.filter(level => level < 0.3).length,
                medium: panicLevels.filter(level => level >= 0.3 && level < 0.7).length,
                high: panicLevels.filter(level => level >= 0.7).length
            }
        };
    }

    // Manual triggers for testing
    forceBankRun(bankId) {
        const bank = this.state.bankingInstitutions.get(bankId);
        if (bank && !this.state.activeBankRuns.has(bankId)) {
            this.triggerBankRun(bankId, bank);
            return true;
        }
        return false;
    }

    setPanicLevel(agentId, level) {
        this.state.panicLevels.set(agentId, Math.max(0, Math.min(1, level)));
    }
}

module.exports = BankRunEngine;
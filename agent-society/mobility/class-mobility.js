/**
 * Class Mobility System
 * Manages social class changes and economic opportunity distribution
 */

const EventEmitter = require('eventemitter3');

class ClassMobilitySystem extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Class definitions
            classes: config.classes || [
                {
                    name: 'underclass',
                    wealthRange: [0, 500],
                    opportunities: 0.2,
                    mobilityProbability: 0.05,
                    politicalPower: 0.1
                },
                {
                    name: 'working',
                    wealthRange: [501, 5000],
                    opportunities: 0.4,
                    mobilityProbability: 0.08,
                    politicalPower: 0.3
                },
                {
                    name: 'middle',
                    wealthRange: [5001, 50000],
                    opportunities: 0.7,
                    mobilityProbability: 0.06,
                    politicalPower: 0.5
                },
                {
                    name: 'upper_middle',
                    wealthRange: [50001, 500000],
                    opportunities: 0.9,
                    mobilityProbability: 0.04,
                    politicalPower: 0.8
                },
                {
                    name: 'upper',
                    wealthRange: [500001, Infinity],
                    opportunities: 1.0,
                    mobilityProbability: 0.02,
                    politicalPower: 1.0
                }
            ],
            
            // Mobility factors
            mobilityFactors: config.mobilityFactors || {
                education: 0.3,
                reputation: 0.25,
                social_connections: 0.2,
                economic_performance: 0.15,
                luck: 0.1
            },
            
            // System parameters
            mobilityCheckInterval: config.mobilityCheckInterval || 7, // days
            generationalMobilityBoost: config.generationalMobilityBoost || 0.1,
            discriminationFactors: config.discriminationFactors || {},
            
            ...config
        };

        this.agents = new Map();
        this.classDistribution = new Map();
        this.mobilityHistory = [];
        
        this.state = {
            lastMobilityCheck: Date.now(),
            totalMobilityEvents: 0,
            upwardMobility: 0,
            downwardMobility: 0,
            classBarriers: new Map(),
            opportunityDistribution: new Map()
        };

        this.initializeClassSystem();
    }

    initializeClassSystem() {
        // Initialize class distribution tracking
        this.config.classes.forEach(classData => {
            this.classDistribution.set(classData.name, 0);
            this.state.opportunityDistribution.set(classData.name, classData.opportunities);
        });
        
        // Set up mobility processing timer
        this.mobilityInterval = setInterval(() => {
            this.processMobilityChanges();
        }, this.config.mobilityCheckInterval * 24 * 60 * 60 * 1000); // Convert days to ms
    }

    registerAgent(agentId, initialClass, wealth) {
        const classData = this.getClassData(initialClass);
        
        const agent = {
            id: agentId,
            currentClass: initialClass,
            wealth,
            classHistory: [{
                className: initialClass,
                startDate: Date.now(),
                wealth
            }],
            
            // Mobility factors
            education: Math.random() * 100,
            reputation: 50,
            socialConnections: 0,
            economicPerformance: 50,
            
            // Mobility state
            mobilityScore: 0,
            timeInClass: 0,
            mobilityAttempts: 0,
            lastMobilityCheck: Date.now(),
            
            // Barriers and advantages
            advantages: new Set(),
            barriers: new Set(),
            discrimination: 0,
            privilege: 0,
            
            // Opportunity access
            opportunityAccess: classData ? classData.opportunities : 0.5,
            missedOpportunities: 0,
            successfulOpportunities: 0
        };

        this.agents.set(agentId, agent);
        
        // Update class distribution
        if (classData) {
            this.classDistribution.set(initialClass, 
                (this.classDistribution.get(initialClass) || 0) + 1
            );
        }
        
        return agent;
    }

    getClassData(className) {
        return this.config.classes.find(c => c.name === className);
    }

    determineClassByWealth(wealth) {
        for (const classData of this.config.classes) {
            if (wealth >= classData.wealthRange[0] && wealth <= classData.wealthRange[1]) {
                return classData.name;
            }
        }
        return 'working'; // Default class
    }

    // Main mobility processing
    processMobilityChanges() {
        const now = Date.now();
        
        for (const [agentId, agent] of this.agents) {
            // Update time in class
            agent.timeInClass = now - agent.lastMobilityCheck;
            
            // Calculate current mobility score
            const mobilityScore = this.calculateMobilityScore(agent);
            agent.mobilityScore = mobilityScore;
            
            // Check for class change opportunity
            if (this.shouldAttemptMobilityChange(agent)) {
                this.attemptClassMobility(agent);
            }
            
            // Update opportunity access
            this.updateOpportunityAccess(agent);
            
            agent.lastMobilityCheck = now;
        }
        
        this.updateClassDistribution();
        this.updateSystemMetrics();
    }

    calculateMobilityScore(agent) {
        let score = 0;
        
        // Apply mobility factors
        for (const [factor, weight] of Object.entries(this.config.mobilityFactors)) {
            let factorValue = 0;
            
            switch (factor) {
                case 'education':
                    factorValue = agent.education;
                    break;
                case 'reputation':
                    factorValue = agent.reputation;
                    break;
                case 'social_connections':
                    factorValue = Math.min(100, agent.socialConnections * 2);
                    break;
                case 'economic_performance':
                    factorValue = agent.economicPerformance;
                    break;
                case 'luck':
                    factorValue = Math.random() * 100;
                    break;
            }
            
            score += factorValue * weight;
        }
        
        // Apply advantages and barriers
        agent.advantages.forEach(advantage => {
            score *= this.getAdvantageMultiplier(advantage);
        });
        
        agent.barriers.forEach(barrier => {
            score *= this.getBarrierMultiplier(barrier);
        });
        
        // Apply discrimination and privilege
        score = score * (1 - agent.discrimination) * (1 + agent.privilege);
        
        return Math.max(0, Math.min(100, score));
    }

    getAdvantageMultiplier(advantage) {
        const multipliers = {
            'family_wealth': 1.3,
            'elite_education': 1.4,
            'business_network': 1.2,
            'political_connections': 1.25,
            'inheritance': 1.5,
            'mentorship': 1.15,
            'early_success': 1.2
        };
        return multipliers[advantage] || 1.1;
    }

    getBarrierMultiplier(barrier) {
        const multipliers = {
            'systemic_discrimination': 0.7,
            'lack_of_capital': 0.8,
            'poor_education': 0.75,
            'criminal_record': 0.6,
            'health_issues': 0.85,
            'geographic_isolation': 0.9,
            'family_obligations': 0.9
        };
        return multipliers[barrier] || 0.9;
    }

    shouldAttemptMobilityChange(agent) {
        const currentClass = this.getClassData(agent.currentClass);
        if (!currentClass) return false;
        
        // Base probability from class definition
        let probability = currentClass.mobilityProbability;
        
        // Increase probability with high mobility score
        if (agent.mobilityScore > 70) probability *= 2;
        if (agent.mobilityScore > 85) probability *= 1.5;
        
        // Reduce probability with low mobility score
        if (agent.mobilityScore < 30) probability *= 0.5;
        
        // Time in class factor (longer time increases probability)
        const timeBonus = Math.min(2, agent.timeInClass / (365 * 24 * 60 * 60 * 1000)); // Years in class
        probability *= (1 + timeBonus * 0.1);
        
        return Math.random() < probability;
    }

    attemptClassMobility(agent) {
        agent.mobilityAttempts++;
        
        const currentClassIndex = this.config.classes.findIndex(c => c.name === agent.currentClass);
        const mobilityDirection = this.determineMobilityDirection(agent);
        
        let targetClassIndex = currentClassIndex;
        let success = false;
        
        if (mobilityDirection === 'up' && currentClassIndex < this.config.classes.length - 1) {
            targetClassIndex = currentClassIndex + 1;
            success = this.attemptUpwardMobility(agent, targetClassIndex);
        } else if (mobilityDirection === 'down' && currentClassIndex > 0) {
            targetClassIndex = currentClassIndex - 1;
            this.executeDownwardMobility(agent, targetClassIndex);
            success = true;
        }
        
        if (success) {
            this.executeClassChange(agent, this.config.classes[targetClassIndex].name);
        } else {
            this.recordFailedMobilityAttempt(agent, mobilityDirection);
        }
    }

    determineMobilityDirection(agent) {
        // Determine if agent should move up or down
        const wealthBasedClass = this.determineClassByWealth(agent.wealth);
        const currentClassIndex = this.config.classes.findIndex(c => c.name === agent.currentClass);
        const wealthClassIndex = this.config.classes.findIndex(c => c.name === wealthBasedClass);
        
        // If wealth suggests higher class
        if (wealthClassIndex > currentClassIndex && agent.mobilityScore > 60) {
            return 'up';
        }
        
        // If wealth suggests lower class
        if (wealthClassIndex < currentClassIndex || agent.mobilityScore < 30) {
            return 'down';
        }
        
        // Otherwise, try to move up if score is high enough
        return agent.mobilityScore > 50 ? 'up' : 'stable';
    }

    attemptUpwardMobility(agent, targetClassIndex) {
        const targetClass = this.config.classes[targetClassIndex];
        const currentClass = this.getClassData(agent.currentClass);
        
        // Calculate success probability
        let successProbability = agent.mobilityScore / 100;
        
        // Wealth requirement check
        if (agent.wealth < targetClass.wealthRange[0]) {
            successProbability *= 0.3; // Much harder without wealth
        }
        
        // Class barrier effects
        const barrier = this.getClassBarrier(agent.currentClass, targetClass.name);
        successProbability *= (1 - barrier);
        
        // Education requirement for upper classes
        if (targetClassIndex >= 3 && agent.education < 70) {
            successProbability *= 0.5;
        }
        
        // Social connections requirement
        if (targetClassIndex >= 2 && agent.socialConnections < 10) {
            successProbability *= 0.7;
        }
        
        const success = Math.random() < successProbability;
        
        if (!success) {
            // Failed attempt may increase barriers
            this.increaseClassBarrier(agent.currentClass, targetClass.name);
        }
        
        return success;
    }

    executeDownwardMobility(agent, targetClassIndex) {
        // Downward mobility is generally easier and may be forced
        const targetClass = this.config.classes[targetClassIndex];
        
        // Record the decline
        this.emit('downward_mobility', {
            agentId: agent.id,
            fromClass: agent.currentClass,
            toClass: targetClass.name,
            reason: this.determineDownwardReason(agent)
        });
    }

    determineDownwardReason(agent) {
        if (agent.wealth < this.getClassData(agent.currentClass).wealthRange[0]) {
            return 'wealth_loss';
        }
        if (agent.reputation < 30) {
            return 'reputation_damage';
        }
        if (agent.economicPerformance < 25) {
            return 'economic_failure';
        }
        return 'general_decline';
    }

    executeClassChange(agent, newClass) {
        const oldClass = agent.currentClass;
        agent.currentClass = newClass;
        
        // Update class history
        agent.classHistory.push({
            className: newClass,
            startDate: Date.now(),
            wealth: agent.wealth,
            mobilityScore: agent.mobilityScore
        });
        
        // Update opportunity access
        const newClassData = this.getClassData(newClass);
        agent.opportunityAccess = newClassData.opportunities;
        
        // Update distribution
        this.classDistribution.set(oldClass, 
            Math.max(0, (this.classDistribution.get(oldClass) || 0) - 1)
        );
        this.classDistribution.set(newClass, 
            (this.classDistribution.get(newClass) || 0) + 1
        );
        
        // Record mobility event
        const mobilityEvent = {
            agentId: agent.id,
            fromClass: oldClass,
            toClass: newClass,
            timestamp: Date.now(),
            mobilityScore: agent.mobilityScore,
            direction: this.getClassDirection(oldClass, newClass)
        };
        
        this.mobilityHistory.push(mobilityEvent);
        this.state.totalMobilityEvents++;
        
        if (mobilityEvent.direction === 'up') {
            this.state.upwardMobility++;
        } else if (mobilityEvent.direction === 'down') {
            this.state.downwardMobility++;
        }
        
        this.emit('class_change', mobilityEvent);
        
        // Apply class change effects
        this.applyClassChangeEffects(agent, oldClass, newClass);
    }

    getClassDirection(oldClass, newClass) {
        const oldIndex = this.config.classes.findIndex(c => c.name === oldClass);
        const newIndex = this.config.classes.findIndex(c => c.name === newClass);
        
        if (newIndex > oldIndex) return 'up';
        if (newIndex < oldIndex) return 'down';
        return 'lateral';
    }

    applyClassChangeEffects(agent, oldClass, newClass) {
        const newClassData = this.getClassData(newClass);
        const oldClassData = this.getClassData(oldClass);
        
        // Update political power influence
        const powerChange = newClassData.politicalPower - oldClassData.politicalPower;
        
        // Social connections may change
        if (newClassData.politicalPower > oldClassData.politicalPower) {
            agent.socialConnections += Math.floor(powerChange * 10);
            this.addAdvantage(agent.id, 'class_promotion');
        } else {
            agent.socialConnections = Math.max(0, agent.socialConnections - Math.floor(Math.abs(powerChange) * 5));
            this.addBarrier(agent.id, 'class_demotion');
        }
        
        // Reputation effects
        if (newClass === 'upper' && oldClass !== 'upper') {
            agent.reputation += 10;
        } else if (oldClass === 'upper' && newClass !== 'upper') {
            agent.reputation -= 15;
        }
    }

    recordFailedMobilityAttempt(agent, direction) {
        agent.missedOpportunities++;
        
        this.emit('mobility_attempt_failed', {
            agentId: agent.id,
            currentClass: agent.currentClass,
            direction,
            mobilityScore: agent.mobilityScore,
            reason: this.determineMobilityFailureReason(agent, direction)
        });
    }

    determineMobilityFailureReason(agent, direction) {
        if (direction === 'up') {
            if (agent.wealth < 1000) return 'insufficient_wealth';
            if (agent.education < 50) return 'insufficient_education';
            if (agent.socialConnections < 5) return 'lack_of_connections';
            if (agent.reputation < 40) return 'poor_reputation';
            return 'class_barriers';
        }
        return 'unknown';
    }

    // Class barriers management
    getClassBarrier(fromClass, toClass) {
        const barrierKey = `${fromClass}_to_${toClass}`;
        return this.state.classBarriers.get(barrierKey) || 0;
    }

    increaseClassBarrier(fromClass, toClass) {
        const barrierKey = `${fromClass}_to_${toClass}`;
        const currentBarrier = this.state.classBarriers.get(barrierKey) || 0;
        this.state.classBarriers.set(barrierKey, Math.min(0.8, currentBarrier + 0.05));
    }

    // Advantages and barriers management
    addAdvantage(agentId, advantage) {
        const agent = this.agents.get(agentId);
        if (agent) {
            agent.advantages.add(advantage);
        }
    }

    addBarrier(agentId, barrier) {
        const agent = this.agents.get(agentId);
        if (agent) {
            agent.barriers.add(barrier);
        }
    }

    removeAdvantage(agentId, advantage) {
        const agent = this.agents.get(agentId);
        if (agent) {
            agent.advantages.delete(advantage);
        }
    }

    removeBarrier(agentId, barrier) {
        const agent = this.agents.get(agentId);
        if (agent) {
            agent.barriers.delete(barrier);
        }
    }

    // Opportunity access
    updateOpportunityAccess(agent) {
        const classData = this.getClassData(agent.currentClass);
        let baseAccess = classData.opportunities;
        
        // Adjust based on reputation
        const reputationBonus = (agent.reputation - 50) / 100 * 0.2;
        baseAccess += reputationBonus;
        
        // Adjust based on social connections
        const connectionBonus = Math.min(0.3, agent.socialConnections / 100);
        baseAccess += connectionBonus;
        
        // Apply discrimination penalty
        baseAccess *= (1 - agent.discrimination);
        
        agent.opportunityAccess = Math.max(0, Math.min(1, baseAccess));
    }

    processOpportunity(agentId, opportunityType, value) {
        const agent = this.agents.get(agentId);
        if (!agent) return false;
        
        const accessRoll = Math.random();
        const hasAccess = accessRoll < agent.opportunityAccess;
        
        if (hasAccess) {
            agent.successfulOpportunities++;
            
            // Opportunity success may improve mobility factors
            switch (opportunityType) {
                case 'education':
                    agent.education = Math.min(100, agent.education + value);
                    break;
                case 'business':
                    agent.economicPerformance = Math.min(100, agent.economicPerformance + value);
                    break;
                case 'social':
                    agent.socialConnections += value;
                    break;
                case 'reputation':
                    agent.reputation = Math.min(100, agent.reputation + value);
                    break;
            }
            
            this.emit('opportunity_success', {
                agentId,
                opportunityType,
                value,
                newMobilityScore: this.calculateMobilityScore(agent)
            });
            
            return true;
        } else {
            agent.missedOpportunities++;
            
            this.emit('opportunity_missed', {
                agentId,
                opportunityType,
                accessLevel: agent.opportunityAccess,
                currentClass: agent.currentClass
            });
            
            return false;
        }
    }

    // System updates
    updateClassDistribution() {
        // Recalculate class distribution
        const newDistribution = new Map();
        this.config.classes.forEach(classData => {
            newDistribution.set(classData.name, 0);
        });
        
        for (const agent of this.agents.values()) {
            const count = newDistribution.get(agent.currentClass) || 0;
            newDistribution.set(agent.currentClass, count + 1);
        }
        
        this.classDistribution = newDistribution;
    }

    updateSystemMetrics() {
        // Calculate mobility rates
        const recentEvents = this.mobilityHistory.filter(event => 
            Date.now() - event.timestamp < 30 * 24 * 60 * 60 * 1000 // Last 30 days
        );
        
        const upwardEvents = recentEvents.filter(e => e.direction === 'up').length;
        const downwardEvents = recentEvents.filter(e => e.direction === 'down').length;
        
        this.state.upwardMobilityRate = this.agents.size > 0 ? upwardEvents / this.agents.size : 0;
        this.state.downwardMobilityRate = this.agents.size > 0 ? downwardEvents / this.agents.size : 0;
        this.state.totalMobilityRate = this.agents.size > 0 ? recentEvents.length / this.agents.size : 0;
    }

    // External interface methods
    processReputationChange(agentId, reputationChange) {
        const agent = this.agents.get(agentId);
        if (agent) {
            agent.reputation = Math.max(0, Math.min(100, agent.reputation + reputationChange));
        }
    }

    processWealthChange(agentId, newWealth) {
        const agent = this.agents.get(agentId);
        if (agent) {
            agent.wealth = newWealth;
            
            // Check if wealth change necessitates class change
            const appropriateClass = this.determineClassByWealth(newWealth);
            if (appropriateClass !== agent.currentClass) {
                const classData = this.getClassData(appropriateClass);
                if (classData) {
                    this.executeClassChange(agent, appropriateClass);
                }
            }
        }
    }

    promoteAgent(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) return false;
        
        const currentClassIndex = this.config.classes.findIndex(c => c.name === agent.currentClass);
        if (currentClassIndex < this.config.classes.length - 1) {
            const targetClass = this.config.classes[currentClassIndex + 1];
            this.executeClassChange(agent, targetClass.name);
            return true;
        }
        return false;
    }

    demoteAgent(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) return false;
        
        const currentClassIndex = this.config.classes.findIndex(c => c.name === agent.currentClass);
        if (currentClassIndex > 0) {
            const targetClass = this.config.classes[currentClassIndex - 1];
            this.executeClassChange(agent, targetClass.name);
            return true;
        }
        return false;
    }

    // Analytics and reporting
    getClassMobilityStatistics() {
        return {
            totalAgents: this.agents.size,
            classDistribution: Object.fromEntries(this.classDistribution),
            
            // Mobility metrics
            totalMobilityEvents: this.state.totalMobilityEvents,
            upwardMobility: this.state.upwardMobility,
            downwardMobility: this.state.downwardMobility,
            upwardMobilityRate: this.state.upwardMobilityRate,
            downwardMobilityRate: this.state.downwardMobilityRate,
            totalMobilityRate: this.state.totalMobilityRate,
            
            // Barriers
            classBarriers: Object.fromEntries(this.state.classBarriers),
            
            // Opportunity access by class
            opportunityAccess: this.calculateOpportunityAccessByClass(),
            
            // Recent mobility events
            recentMobility: this.mobilityHistory.slice(-20)
        };
    }

    calculateOpportunityAccessByClass() {
        const accessByClass = {};
        
        for (const classData of this.config.classes) {
            const classAgents = Array.from(this.agents.values())
                .filter(agent => agent.currentClass === classData.name);
                
            if (classAgents.length > 0) {
                const avgAccess = classAgents.reduce((sum, agent) => sum + agent.opportunityAccess, 0) / classAgents.length;
                accessByClass[classData.name] = avgAccess;
            } else {
                accessByClass[classData.name] = classData.opportunities;
            }
        }
        
        return accessByClass;
    }

    getAgentMobilityProfile(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) return null;
        
        return {
            agentId,
            currentClass: agent.currentClass,
            wealth: agent.wealth,
            classHistory: agent.classHistory,
            
            // Mobility factors
            mobilityScore: agent.mobilityScore,
            education: agent.education,
            reputation: agent.reputation,
            socialConnections: agent.socialConnections,
            economicPerformance: agent.economicPerformance,
            
            // Access and opportunities
            opportunityAccess: agent.opportunityAccess,
            successfulOpportunities: agent.successfulOpportunities,
            missedOpportunities: agent.missedOpportunities,
            
            // Barriers and advantages
            advantages: Array.from(agent.advantages),
            barriers: Array.from(agent.barriers),
            discrimination: agent.discrimination,
            privilege: agent.privilege,
            
            // Mobility metrics
            timeInClass: agent.timeInClass,
            mobilityAttempts: agent.mobilityAttempts
        };
    }

    // Cleanup
    stop() {
        if (this.mobilityInterval) {
            clearInterval(this.mobilityInterval);
        }
    }
}

module.exports = ClassMobilitySystem;
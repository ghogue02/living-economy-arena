/**
 * Agent Society and Organization Systems
 * Creates emergent social dynamics for AI agents in the Living Economy Arena
 */

const SocialOrganizations = require('./organizations/social-organizations');
const ReputationSystem = require('./reputation/reputation-system');
const CollectiveBehavior = require('./collective/collective-behavior');
const ClassMobility = require('./mobility/class-mobility');
const CulturalEvolution = require('./culture/cultural-evolution');
const EventEmitter = require('eventemitter3');

class AgentSocietySystem extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            maxAgents: config.maxAgents || 100000,
            enableCorporations: config.enableCorporations !== false,
            enableCartels: config.enableCartels !== false,
            enableUnions: config.enableUnions !== false,
            enableCriminalOrgs: config.enableCriminalOrgs !== false,
            enableRevolutions: config.enableRevolutions !== false,
            enablePhilanthropy: config.enablePhilanthropy !== false,
            enableLobbying: config.enableLobbying !== false,
            
            // Social class parameters
            classSystemEnabled: config.classSystemEnabled !== false,
            socialMobilityRate: config.socialMobilityRate || 0.05, // 5% chance per period
            generationalWealthDecay: config.generationalWealthDecay || 0.1, // 10% decay per generation
            
            // Cultural parameters
            culturalEvolutionRate: config.culturalEvolutionRate || 0.02,
            culturalDiversityTarget: config.culturalDiversityTarget || 0.7,
            
            ...config
        };

        this.agents = new Map();
        this.organizations = new SocialOrganizations(this.config);
        this.reputation = new ReputationSystem(this.config);
        this.collectiveBehavior = new CollectiveBehavior(this.config);
        this.classMobility = new ClassMobility(this.config);
        this.culture = new CulturalEvolution(this.config);
        
        this.state = {
            totalAgents: 0,
            activeOrganizations: 0,
            revolutionThreshold: 0.8, // 80% dissatisfaction triggers revolution
            currentRevolutionProgress: 0,
            culturalEra: 'initial',
            generationCount: 0,
            lastGenerationalTransfer: Date.now()
        };

        this.setupEventHandlers();
        this.initializeSociety();
    }

    setupEventHandlers() {
        // Listen to organization events
        this.organizations.on('corporation_formed', (data) => {
            this.emit('social_event', { type: 'corporation_formed', ...data });
            this.updateSocialDynamics();
        });

        this.organizations.on('cartel_detected', (data) => {
            this.emit('social_event', { type: 'cartel_detected', ...data });
            this.handleCartelDetection(data);
        });

        this.organizations.on('union_strike', (data) => {
            this.emit('social_event', { type: 'union_strike', ...data });
            this.handleUnionStrike(data);
        });

        this.organizations.on('revolution_triggered', (data) => {
            this.emit('social_event', { type: 'revolution_triggered', ...data });
            this.handleRevolution(data);
        });

        // Listen to reputation changes
        this.reputation.on('reputation_milestone', (data) => {
            this.classMobility.processReputationChange(data.agentId, data.change);
        });

        // Listen to cultural shifts
        this.culture.on('cultural_shift', (data) => {
            this.emit('social_event', { type: 'cultural_shift', ...data });
            this.updateEconomicPreferences(data);
        });
    }

    initializeSociety() {
        // Set up initial cultural framework
        this.culture.initializeCulture();
        
        // Initialize class system
        this.classMobility.initializeClassSystem();
        
        // Start social dynamics timer
        this.socialDynamicsInterval = setInterval(() => {
            this.processSocialDynamics();
        }, 60000); // Every minute
    }

    // Agent registration and management
    registerAgent(agentId, agentData = {}) {
        const agent = {
            id: agentId,
            socialClass: agentData.socialClass || 'working',
            wealth: agentData.wealth || 1000,
            reputation: 50, // Start neutral
            culturalProfile: this.culture.generateAgentCulture(),
            organizationMemberships: new Set(),
            socialConnections: new Set(),
            politicalInfluence: 0,
            criminalRecord: [],
            philanthropicContributions: 0,
            revolutionaryTendency: Math.random() * 0.5, // 0-0.5 initial
            joinedAt: Date.now(),
            ...agentData
        };

        this.agents.set(agentId, agent);
        this.state.totalAgents++;

        // Register with subsystems
        this.reputation.registerAgent(agentId, agent.reputation);
        this.classMobility.registerAgent(agentId, agent.socialClass, agent.wealth);
        this.culture.registerAgent(agentId, agent.culturalProfile);

        // Auto-assign to initial organizations based on class
        this.autoAssignInitialOrganizations(agentId, agent);

        return agent;
    }

    autoAssignInitialOrganizations(agentId, agent) {
        // Working class agents more likely to join unions
        if (agent.socialClass === 'working' && Math.random() < 0.3) {
            this.organizations.createOrJoinUnion(agentId, agent.wealth);
        }
        
        // Upper class agents more likely to form corporations
        if (agent.socialClass === 'upper' && Math.random() < 0.4) {
            this.organizations.createCorporation(agentId, {
                initialCapital: agent.wealth * 0.5,
                industry: this.selectRandomIndustry()
            });
        }
        
        // Middle class agents might join professional associations
        if (agent.socialClass === 'middle' && Math.random() < 0.2) {
            this.organizations.joinProfessionalAssociation(agentId);
        }
    }

    // Main social dynamics processing
    processSocialDynamics() {
        // Process organizational activities
        this.organizations.processOrganizationalActivities();
        
        // Update social connections
        this.updateSocialConnections();
        
        // Process class mobility
        this.classMobility.processClassChanges();
        
        // Evolve culture
        this.culture.evolveCulture();
        
        // Check for revolutionary conditions
        this.checkRevolutionaryConditions();
        
        // Process generational wealth transfer
        this.processGenerationalTransfers();
        
        // Update social statistics
        this.updateSocialStatistics();
    }

    updateSocialConnections() {
        // Create new social connections based on proximity and shared interests
        const agents = Array.from(this.agents.values());
        
        for (let i = 0; i < Math.min(100, agents.length); i++) { // Process 100 random agents
            const agent = agents[Math.floor(Math.random() * agents.length)];
            this.formNewSocialConnections(agent);
        }
    }

    formNewSocialConnections(agent) {
        const potentialConnections = Array.from(this.agents.values())
            .filter(other => 
                other.id !== agent.id && 
                !agent.socialConnections.has(other.id) &&
                this.calculateSocialCompatibility(agent, other) > 0.6
            );

        // Form 1-3 new connections per cycle
        const connectionCount = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < connectionCount && i < potentialConnections.length; i++) {
            const connection = potentialConnections[Math.floor(Math.random() * potentialConnections.length)];
            this.createMutualConnection(agent.id, connection.id);
        }
    }

    calculateSocialCompatibility(agent1, agent2) {
        let compatibility = 0.5; // Base compatibility
        
        // Same social class increases compatibility
        if (agent1.socialClass === agent2.socialClass) compatibility += 0.2;
        
        // Similar wealth levels increase compatibility
        const wealthRatio = Math.min(agent1.wealth, agent2.wealth) / Math.max(agent1.wealth, agent2.wealth);
        compatibility += wealthRatio * 0.1;
        
        // Cultural similarity
        const culturalSimilarity = this.culture.calculateCulturalSimilarity(
            agent1.culturalProfile, 
            agent2.culturalProfile
        );
        compatibility += culturalSimilarity * 0.2;
        
        // Reputation similarity
        const reputationSimilarity = 1 - Math.abs(agent1.reputation - agent2.reputation) / 100;
        compatibility += reputationSimilarity * 0.1;
        
        return Math.min(1, compatibility);
    }

    createMutualConnection(agentId1, agentId2) {
        const agent1 = this.agents.get(agentId1);
        const agent2 = this.agents.get(agentId2);
        
        if (agent1 && agent2) {
            agent1.socialConnections.add(agentId2);
            agent2.socialConnections.add(agentId1);
            
            // Update reputation for social networking
            this.reputation.updateReputation(agentId1, 1, 'social_networking');
            this.reputation.updateReputation(agentId2, 1, 'social_networking');
        }
    }

    // Corporation formation mechanics
    createCorporation(founderId, corporationData) {
        const founder = this.agents.get(founderId);
        if (!founder) return null;

        const corporation = this.organizations.createCorporation(founderId, corporationData);
        
        if (corporation) {
            founder.organizationMemberships.add(corporation.id);
            founder.politicalInfluence += 5; // Corporations increase political influence
            
            this.reputation.updateReputation(founderId, 10, 'business_leadership');
            
            return corporation;
        }
        return null;
    }

    // Union formation and collective bargaining
    createOrJoinUnion(agentId, wealthLevel) {
        const agent = this.agents.get(agentId);
        if (!agent) return null;

        const union = this.organizations.createOrJoinUnion(agentId, wealthLevel);
        
        if (union) {
            agent.organizationMemberships.add(union.id);
            
            // Update reputation based on union activity
            this.reputation.updateReputation(agentId, 3, 'collective_action');
        }
        
        return union;
    }

    // Criminal organization systems
    formCriminalOrganization(leaderId, organizationType = 'gang') {
        const leader = this.agents.get(leaderId);
        if (!leader || leader.reputation > 30) return null; // Only low reputation agents

        const criminalOrg = this.organizations.createCriminalOrganization(leaderId, organizationType);
        
        if (criminalOrg) {
            leader.organizationMemberships.add(criminalOrg.id);
            leader.criminalRecord.push({
                type: 'organization_leadership',
                timestamp: Date.now(),
                severity: 'high'
            });
            
            this.reputation.updateReputation(leaderId, -20, 'criminal_activity');
        }
        
        return criminalOrg;
    }

    // Philanthropy systems
    makePhilanthropicContribution(agentId, amount, cause) {
        const agent = this.agents.get(agentId);
        if (!agent || agent.wealth < amount) return false;

        agent.wealth -= amount;
        agent.philanthropicContributions += amount;
        
        // Reputation boost based on contribution size relative to wealth
        const reputationBoost = Math.min(20, (amount / agent.wealth) * 100);
        this.reputation.updateReputation(agentId, reputationBoost, 'philanthropy');
        
        // Political influence increases with philanthropy
        agent.politicalInfluence += reputationBoost * 0.5;
        
        // Cultural impact
        this.culture.recordPhilanthropicAct(agentId, amount, cause);
        
        this.emit('social_event', {
            type: 'philanthropic_contribution',
            agentId,
            amount,
            cause,
            reputationBoost
        });
        
        return true;
    }

    // Lobbying systems
    conductLobbying(agentId, issue, investmentAmount) {
        const agent = this.agents.get(agentId);
        if (!agent || agent.wealth < investmentAmount) return false;

        agent.wealth -= investmentAmount;
        
        // Success based on political influence and investment
        const successProbability = Math.min(0.8, 
            (agent.politicalInfluence / 100) * 0.5 + 
            (investmentAmount / 10000) * 0.3 + 
            Math.random() * 0.2
        );
        
        const success = Math.random() < successProbability;
        
        if (success) {
            agent.politicalInfluence += 2;
            this.reputation.updateReputation(agentId, 5, 'political_influence');
            
            // Apply policy change effect
            this.applyPolicyChange(issue, agentId);
        }
        
        this.emit('social_event', {
            type: 'lobbying_attempt',
            agentId,
            issue,
            investment: investmentAmount,
            success
        });
        
        return success;
    }

    applyPolicyChange(issue, lobbyistId) {
        // Implement policy changes that affect the economy
        switch (issue) {
            case 'tax_reduction':
                this.emit('policy_change', { 
                    type: 'tax_rate_change', 
                    change: -0.05, 
                    instigator: lobbyistId 
                });
                break;
            case 'regulation_reduction':
                this.emit('policy_change', { 
                    type: 'regulation_change', 
                    change: -0.1, 
                    instigator: lobbyistId 
                });
                break;
            case 'market_protection':
                this.emit('policy_change', { 
                    type: 'market_barrier', 
                    change: 0.2, 
                    instigator: lobbyistId 
                });
                break;
        }
    }

    // Revolutionary mechanics
    checkRevolutionaryConditions() {
        const agents = Array.from(this.agents.values());
        const workingClassAgents = agents.filter(agent => agent.socialClass === 'working');
        
        if (workingClassAgents.length === 0) return;
        
        // Calculate average dissatisfaction
        const totalDissatisfaction = workingClassAgents.reduce((sum, agent) => {
            const wealthPercentile = this.calculateWealthPercentile(agent.wealth);
            const dissatisfaction = (1 - wealthPercentile) * agent.revolutionaryTendency;
            return sum + dissatisfaction;
        }, 0);
        
        const avgDissatisfaction = totalDissatisfaction / workingClassAgents.length;
        this.state.currentRevolutionProgress = avgDissatisfaction;
        
        if (avgDissatisfaction > this.state.revolutionThreshold) {
            this.triggerRevolution(workingClassAgents);
        }
    }

    triggerRevolution(dissatisfiedAgents) {
        const revolutionSize = dissatisfiedAgents.length;
        const upperClassAgents = Array.from(this.agents.values())
            .filter(agent => agent.socialClass === 'upper');
        
        // Revolution success based on size and organization
        const organizationBonus = dissatisfiedAgents.filter(agent => 
            this.hasUnionMembership(agent.id)
        ).length / dissatisfiedAgents.length;
        
        const successProbability = Math.min(0.9, 
            (revolutionSize / this.state.totalAgents) * 2 + 
            organizationBonus * 0.3 + 
            Math.random() * 0.2
        );
        
        const revolutionSucceeds = Math.random() < successProbability;
        
        if (revolutionSucceeds) {
            this.executeSuccessfulRevolution(dissatisfiedAgents, upperClassAgents);
        } else {
            this.executeFailedRevolution(dissatisfiedAgents);
        }
        
        this.emit('social_event', {
            type: 'revolution_outcome',
            success: revolutionSucceeds,
            participantCount: revolutionSize,
            dissatisfactionLevel: this.state.currentRevolutionProgress
        });
    }

    executeSuccessfulRevolution(revolutionaries, upperClass) {
        // Redistribute wealth from upper class to revolutionaries
        const totalUpperWealth = upperClass.reduce((sum, agent) => sum + agent.wealth, 0);
        const redistributionAmount = totalUpperWealth * 0.6; // Take 60% of upper class wealth
        const perRevolutionaryAmount = redistributionAmount / revolutionaries.length;
        
        // Take wealth from upper class
        upperClass.forEach(agent => {
            agent.wealth *= 0.4; // Keep 40%
            agent.socialClass = 'middle'; // Demote to middle class
            agent.politicalInfluence *= 0.2; // Lose most political power
            this.reputation.updateReputation(agent.id, -30, 'revolution_victim');
        });
        
        // Give wealth to revolutionaries
        revolutionaries.forEach(agent => {
            agent.wealth += perRevolutionaryAmount;
            agent.revolutionaryTendency *= 0.3; // Reduce revolutionary tendency
            this.reputation.updateReputation(agent.id, 15, 'revolution_success');
            
            // Some revolutionaries rise to upper class
            if (Math.random() < 0.1) {
                agent.socialClass = 'upper';
                agent.politicalInfluence += 20;
            }
        });
        
        // Cultural shift towards equality
        this.culture.triggerRevolutionaryCulturalShift();
        
        this.state.currentRevolutionProgress = 0; // Reset revolution progress
    }

    executeFailedRevolution(revolutionaries) {
        // Punishment for failed revolutionaries
        revolutionaries.forEach(agent => {
            agent.wealth *= 0.8; // Lose 20% of wealth
            agent.revolutionaryTendency += 0.1; // Become more revolutionary
            this.reputation.updateReputation(agent.id, -10, 'revolution_failure');
            
            // Some face severe consequences
            if (Math.random() < 0.2) {
                agent.criminalRecord.push({
                    type: 'sedition',
                    timestamp: Date.now(),
                    severity: 'high'
                });
                this.reputation.updateReputation(agent.id, -20, 'criminal_conviction');
            }
        });
        
        this.state.currentRevolutionProgress *= 0.7; // Reduce but don't eliminate
    }

    // Generational wealth transfer
    processGenerationalTransfers() {
        const now = Date.now();
        const daysSinceLastTransfer = (now - this.state.lastGenerationalTransfer) / (1000 * 60 * 60 * 24);
        
        if (daysSinceLastTransfer >= 30) { // Monthly generational events
            this.executeGenerationalTransfer();
            this.state.lastGenerationalTransfer = now;
            this.state.generationCount++;
        }
    }

    executeGenerationalTransfer() {
        const agents = Array.from(this.agents.values());
        
        // 5% of agents per month transfer wealth to "next generation"
        const transferringAgents = agents.filter(() => Math.random() < 0.05);
        
        transferringAgents.forEach(agent => {
            const inheritanceAmount = agent.wealth * (1 - this.config.generationalWealthDecay);
            const heritageBonus = agent.socialClass === 'upper' ? 1.2 : 
                                 agent.socialClass === 'middle' ? 1.1 : 1.0;
            
            const finalInheritance = inheritanceAmount * heritageBonus;
            
            // Create "heir" effects by boosting another agent
            const potentialHeirs = agents.filter(other => 
                other.id !== agent.id && 
                agent.socialConnections.has(other.id)
            );
            
            if (potentialHeirs.length > 0) {
                const heir = potentialHeirs[Math.floor(Math.random() * potentialHeirs.length)];
                heir.wealth += finalInheritance;
                
                // Social class mobility through inheritance
                if (finalInheritance > heir.wealth * 2 && heir.socialClass !== 'upper') {
                    this.classMobility.promoteAgent(heir.id);
                }
                
                this.emit('social_event', {
                    type: 'wealth_inheritance',
                    benefactor: agent.id,
                    heir: heir.id,
                    amount: finalInheritance,
                    generation: this.state.generationCount
                });
            }
            
            // "Retiring" agent keeps reduced wealth
            agent.wealth *= this.config.generationalWealthDecay;
        });
    }

    // Social statistics and analytics
    updateSocialStatistics() {
        this.state.activeOrganizations = this.organizations.getActiveOrganizationCount();
    }

    getSocialMetrics() {
        const agents = Array.from(this.agents.values());
        
        const classDistribution = {
            working: agents.filter(a => a.socialClass === 'working').length,
            middle: agents.filter(a => a.socialClass === 'middle').length,
            upper: agents.filter(a => a.socialClass === 'upper').length
        };
        
        const organizationStats = this.organizations.getOrganizationStatistics();
        const reputationStats = this.reputation.getReputationStatistics();
        const culturalStats = this.culture.getCulturalStatistics();
        
        return {
            totalAgents: this.state.totalAgents,
            classDistribution,
            organizationStats,
            reputationStats,
            culturalStats,
            revolutionProgress: this.state.currentRevolutionProgress,
            generationCount: this.state.generationCount,
            averageSocialConnections: agents.reduce((sum, a) => sum + a.socialConnections.size, 0) / agents.length,
            politicalInfluenceDistribution: this.calculatePoliticalInfluenceDistribution(agents)
        };
    }

    calculatePoliticalInfluenceDistribution(agents) {
        const sorted = agents.sort((a, b) => b.politicalInfluence - a.politicalInfluence);
        const top1Percent = sorted.slice(0, Math.ceil(agents.length * 0.01));
        const top10Percent = sorted.slice(0, Math.ceil(agents.length * 0.1));
        
        return {
            top1PercentInfluence: top1Percent.reduce((sum, a) => sum + a.politicalInfluence, 0),
            top10PercentInfluence: top10Percent.reduce((sum, a) => sum + a.politicalInfluence, 0),
            totalInfluence: agents.reduce((sum, a) => sum + a.politicalInfluence, 0)
        };
    }

    // Utility methods
    calculateWealthPercentile(wealth) {
        const allWealth = Array.from(this.agents.values()).map(a => a.wealth).sort((a, b) => a - b);
        const position = allWealth.findIndex(w => w >= wealth);
        return position / allWealth.length;
    }

    hasUnionMembership(agentId) {
        const agent = this.agents.get(agentId);
        if (!agent) return false;
        
        return this.organizations.hasUnionMembership(agentId);
    }

    selectRandomIndustry() {
        const industries = ['technology', 'manufacturing', 'finance', 'healthcare', 'energy', 'retail'];
        return industries[Math.floor(Math.random() * industries.length)];
    }

    // Event handlers
    handleCartelDetection(cartelData) {
        // Punish cartel members
        cartelData.members.forEach(memberId => {
            const agent = this.agents.get(memberId);
            if (agent) {
                agent.wealth *= 0.8; // Fine
                this.reputation.updateReputation(memberId, -25, 'cartel_participation');
                agent.criminalRecord.push({
                    type: 'antitrust_violation',
                    timestamp: Date.now(),
                    severity: 'medium'
                });
            }
        });
    }

    handleUnionStrike(strikeData) {
        // Economic impact of strikes
        strikeData.participants.forEach(memberId => {
            const agent = this.agents.get(memberId);
            if (agent) {
                // Temporary income loss but potential long-term gains
                agent.wealth *= 0.95; // 5% loss during strike
                this.reputation.updateReputation(memberId, 2, 'collective_bargaining');
            }
        });
    }

    updateEconomicPreferences(culturalData) {
        // Cultural shifts affect economic behavior
        const agents = Array.from(this.agents.values());
        
        agents.forEach(agent => {
            if (this.culture.isAgentAffectedByCulturalShift(agent.id, culturalData)) {
                // Update agent's economic preferences based on cultural shift
                this.updateAgentEconomicBehavior(agent, culturalData);
            }
        });
    }

    updateAgentEconomicBehavior(agent, culturalData) {
        // Modify agent behavior based on cultural evolution
        // This would integrate with the AI personality system
        switch (culturalData.shiftType) {
            case 'materialism_increase':
                agent.revolutionaryTendency *= 0.9;
                break;
            case 'collectivism_increase':
                agent.revolutionaryTendency *= 1.1;
                break;
            case 'environmentalism_rise':
                // Agents prefer sustainable investments
                break;
        }
    }

    updateSocialDynamics() {
        // Recalculate social metrics when major events occur
        this.updateSocialStatistics();
        
        // Adjust revolutionary tendencies based on recent events
        const agents = Array.from(this.agents.values());
        agents.forEach(agent => {
            const classAdjustment = agent.socialClass === 'working' ? 0.01 : 
                                   agent.socialClass === 'middle' ? -0.005 : -0.01;
            agent.revolutionaryTendency = Math.max(0, Math.min(1, 
                agent.revolutionaryTendency + classAdjustment
            ));
        });
    }

    // Cleanup
    stop() {
        if (this.socialDynamicsInterval) {
            clearInterval(this.socialDynamicsInterval);
        }
    }
}

module.exports = AgentSocietySystem;
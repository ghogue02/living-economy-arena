/**
 * Player Progression System
 * Ensures fair advancement, implements catch-up mechanics, and prevents permanent dominance
 */

const Decimal = require('decimal.js');
const EventEmitter = require('eventemitter3');

class PlayerProgressionSystem extends EventEmitter {
    constructor(config = {}) {
        super();
        
        this.config = {
            // Experience and leveling
            baseExperiencePerLevel: config.baseExperiencePerLevel || 1000,
            experienceScalingFactor: config.experienceScalingFactor || 1.2,
            maxLevel: config.maxLevel || 100,
            
            // Skill system
            skillCategories: config.skillCategories || [
                'trading', 'analysis', 'risk_management', 'market_making', 
                'arbitrage', 'research', 'networking', 'negotiation'
            ],
            maxSkillLevel: config.maxSkillLevel || 10,
            skillPointsPerLevel: config.skillPointsPerLevel || 3,
            
            // Catch-up mechanics
            catchUpThreshold: config.catchUpThreshold || 0.3, // Bottom 30% get bonuses
            catchUpExperienceMultiplier: config.catchUpExperienceMultiplier || 2.0,
            catchUpResourceBonus: config.catchUpResourceBonus || 0.5, // 50% bonus resources
            
            // New player protection
            newPlayerGracePeriod: config.newPlayerGracePeriod || 604800000, // 7 days
            newPlayerExperienceBonus: config.newPlayerExperienceBonus || 3.0,
            newPlayerLossProtection: config.newPlayerLossProtection || 0.7, // 70% loss reduction
            mentorProgramEnabled: config.mentorProgramEnabled || true,
            
            // Veteran challenges
            veteranLevelThreshold: config.veteranLevelThreshold || 75,
            veteranDifficultyMultiplier: config.veteranDifficultyMultiplier || 1.5,
            veteranResponsibilityRequirement: config.veteranResponsibilityRequirement || true,
            
            // Anti-dominance measures
            dominanceDetectionThreshold: config.dominanceDetectionThreshold || 0.1, // 10% market share
            dominancePenaltyMultiplier: config.dominancePenaltyMultiplier || 0.8, // 20% penalty
            maxAdvantageRatio: config.maxAdvantageRatio || 3.0, // 3x advantage max
            
            // Merit-based rewards
            meritCategories: config.meritCategories || [
                'innovation', 'cooperation', 'market_stability', 'education', 'fair_play'
            ],
            meritRewardMultiplier: config.meritRewardMultiplier || 1.5,
            
            // Specialization balancing
            specializationBonusCap: config.specializationBonusCap || 2.0, // 200% max bonus
            crossTrainingIncentive: config.crossTrainingIncentive || 0.2, // 20% bonus for diverse skills
            
            ...config
        };

        this.state = {
            players: new Map(),
            levelDistribution: new Map(),
            skillDistribution: new Map(),
            mentorships: new Map(),
            meritTracking: new Map(),
            progressionHistory: [],
            catchUpActiveList: new Set(),
            dominanceWatchList: new Set()
        };

        this.analytics = {
            averageLevel: 0,
            experienceDistribution: [],
            skillBalance: new Map(),
            progressionRate: new Map(),
            fairnessMetrics: new Map()
        };

        this.initializeSystem();
    }

    initializeSystem() {
        // Initialize skill balance tracking
        this.config.skillCategories.forEach(skill => {
            this.analytics.skillBalance.set(skill, {
                totalPlayers: 0,
                averageLevel: 0,
                distribution: new Array(this.config.maxSkillLevel + 1).fill(0)
            });
        });

        // Initialize merit tracking
        this.config.meritCategories.forEach(category => {
            this.state.meritTracking.set(category, new Map());
        });

        // Start progression analysis cycle
        this.startAnalysisCycle();
    }

    // Register new player
    registerPlayer(playerId, playerData = {}) {
        const player = {
            id: playerId,
            registrationDate: Date.now(),
            level: 1,
            experience: new Decimal(0),
            skillPoints: this.config.skillPointsPerLevel,
            skills: this.initializeSkills(),
            
            // Progression tracking
            experienceHistory: [],
            levelHistory: [{ level: 1, timestamp: Date.now() }],
            achievementHistory: [],
            
            // Performance metrics
            performanceStats: {
                totalTrades: 0,
                successRate: 0,
                averageProfit: new Decimal(0),
                marketImpact: 0,
                cooperationScore: 0,
                innovationScore: 0
            },
            
            // Status flags
            isNewPlayer: true,
            isVeteran: false,
            needsCatchUp: false,
            isDominant: false,
            hasActiveMentor: false,
            
            // Bonuses and penalties
            activeBonuses: [],
            activePenalties: [],
            specializations: [],
            meritScores: this.initializeMeritScores(),
            
            // Protection and assistance
            lossProtectionRemaining: this.config.newPlayerLossProtection,
            mentorshipEligible: true,
            lastProgressionUpdate: Date.now(),
            
            ...playerData
        };

        this.state.players.set(playerId, player);
        this.updateLevelDistribution();
        this.checkForMentorshipOpportunity(playerId);

        this.emit('player_registered', {
            playerId,
            level: player.level,
            isNewPlayer: player.isNewPlayer
        });

        return player;
    }

    initializeSkills() {
        const skills = {};
        this.config.skillCategories.forEach(skill => {
            skills[skill] = {
                level: 0,
                experience: new Decimal(0),
                bonuses: [],
                lastUsed: null
            };
        });
        return skills;
    }

    initializeMeritScores() {
        const merit = {};
        this.config.meritCategories.forEach(category => {
            merit[category] = {
                score: 0,
                recentActions: [],
                totalContributions: 0
            };
        });
        return merit;
    }

    // Award experience and handle level progression
    awardExperience(playerId, amount, source = 'general', skillCategory = null) {
        const player = this.state.players.get(playerId);
        if (!player) return false;

        let experienceAmount = new Decimal(amount);

        // Apply bonuses and penalties
        experienceAmount = this.applyExperienceModifiers(player, experienceAmount, source);

        // Award experience
        player.experience = player.experience.plus(experienceAmount);
        
        // Award skill-specific experience
        if (skillCategory && player.skills[skillCategory]) {
            const skillExp = experienceAmount.mul(0.3); // 30% goes to skill
            player.skills[skillCategory].experience = player.skills[skillCategory].experience.plus(skillExp);
            player.skills[skillCategory].lastUsed = Date.now();
            
            // Check for skill level up
            this.checkSkillLevelUp(player, skillCategory);
        }

        // Record experience history
        player.experienceHistory.push({
            timestamp: Date.now(),
            amount: experienceAmount.toNumber(),
            source,
            skillCategory,
            totalExperience: player.experience.toNumber()
        });

        // Check for level up
        this.checkLevelUp(player);

        // Update progression analytics
        this.updateProgressionAnalytics(playerId);

        this.emit('experience_awarded', {
            playerId,
            amount: experienceAmount.toNumber(),
            source,
            skillCategory,
            newLevel: player.level,
            newTotalExperience: player.experience.toNumber()
        });

        return true;
    }

    applyExperienceModifiers(player, baseExperience, source) {
        let modifiedExperience = baseExperience;

        // New player bonus
        if (player.isNewPlayer) {
            const gracePeriodRemaining = this.config.newPlayerGracePeriod - (Date.now() - player.registrationDate);
            if (gracePeriodRemaining > 0) {
                modifiedExperience = modifiedExperience.mul(this.config.newPlayerExperienceBonus);
            } else {
                player.isNewPlayer = false;
            }
        }

        // Catch-up bonus
        if (player.needsCatchUp) {
            modifiedExperience = modifiedExperience.mul(this.config.catchUpExperienceMultiplier);
        }

        // Veteran challenge modifier
        if (player.isVeteran) {
            modifiedExperience = modifiedExperience.div(this.config.veteranDifficultyMultiplier);
        }

        // Dominance penalty
        if (player.isDominant) {
            modifiedExperience = modifiedExperience.mul(this.config.dominancePenaltyMultiplier);
        }

        // Merit-based bonuses
        const meritBonus = this.calculateMeritBonus(player);
        modifiedExperience = modifiedExperience.mul(1 + meritBonus);

        // Active bonus/penalty effects
        player.activeBonuses.forEach(bonus => {
            if (bonus.type === 'experience' && bonus.expiresAt > Date.now()) {
                modifiedExperience = modifiedExperience.mul(bonus.multiplier);
            }
        });

        player.activePenalties.forEach(penalty => {
            if (penalty.type === 'experience' && penalty.expiresAt > Date.now()) {
                modifiedExperience = modifiedExperience.mul(penalty.multiplier);
            }
        });

        return modifiedExperience;
    }

    calculateMeritBonus(player) {
        let totalMeritBonus = 0;
        
        Object.values(player.meritScores).forEach(merit => {
            if (merit.score > 0) {
                totalMeritBonus += merit.score * 0.1; // 10% per merit point
            }
        });

        return Math.min(totalMeritBonus, this.config.meritRewardMultiplier - 1);
    }

    checkLevelUp(player) {
        const requiredExperience = this.calculateRequiredExperience(player.level);
        
        if (player.experience.gte(requiredExperience)) {
            const oldLevel = player.level;
            player.level++;
            player.skillPoints += this.config.skillPointsPerLevel;
            
            // Record level history
            player.levelHistory.push({
                level: player.level,
                timestamp: Date.now(),
                experienceAtLevelUp: player.experience.toNumber()
            });

            // Check for veteran status
            if (player.level >= this.config.veteranLevelThreshold && !player.isVeteran) {
                player.isVeteran = true;
                this.assignVeteranResponsibilities(player.id);
            }

            // Update level distribution
            this.updateLevelDistribution();

            this.emit('level_up', {
                playerId: player.id,
                oldLevel,
                newLevel: player.level,
                skillPointsAwarded: this.config.skillPointsPerLevel
            });

            // Check for additional level ups
            this.checkLevelUp(player);
        }
    }

    calculateRequiredExperience(level) {
        return new Decimal(this.config.baseExperiencePerLevel).mul(
            Math.pow(this.config.experienceScalingFactor, level - 1)
        );
    }

    checkSkillLevelUp(player, skillCategory) {
        const skill = player.skills[skillCategory];
        const requiredExperience = this.calculateSkillRequiredExperience(skill.level);
        
        if (skill.experience.gte(requiredExperience) && skill.level < this.config.maxSkillLevel) {
            skill.level++;
            
            // Award specialization bonuses
            this.updateSpecializationBonuses(player, skillCategory);
            
            // Update skill distribution analytics
            this.updateSkillDistribution();

            this.emit('skill_level_up', {
                playerId: player.id,
                skillCategory,
                newLevel: skill.level,
                specializationBonuses: this.getActiveSpecializationBonuses(player, skillCategory)
            });
        }
    }

    calculateSkillRequiredExperience(skillLevel) {
        return new Decimal(500).mul(Math.pow(1.5, skillLevel));
    }

    // Spend skill points to improve skills
    spendSkillPoints(playerId, skillCategory, pointsToSpend) {
        const player = this.state.players.get(playerId);
        if (!player || !player.skills[skillCategory]) return false;

        if (player.skillPoints < pointsToSpend) return false;
        if (player.skills[skillCategory].level >= this.config.maxSkillLevel) return false;

        // Spend points
        player.skillPoints -= pointsToSpend;
        
        // Award skill experience based on points spent
        const experienceGain = new Decimal(pointsToSpend * 100);
        player.skills[skillCategory].experience = player.skills[skillCategory].experience.plus(experienceGain);
        
        // Check for skill level up
        this.checkSkillLevelUp(player, skillCategory);

        // Award cross-training bonus if diverse skills
        this.awardCrossTrainingBonus(player);

        this.emit('skill_points_spent', {
            playerId,
            skillCategory,
            pointsSpent: pointsToSpend,
            remainingPoints: player.skillPoints,
            newSkillLevel: player.skills[skillCategory].level
        });

        return true;
    }

    awardCrossTrainingBonus(player) {
        const skillLevels = Object.values(player.skills).map(skill => skill.level);
        const averageSkillLevel = skillLevels.reduce((sum, level) => sum + level, 0) / skillLevels.length;
        const skillVariety = skillLevels.filter(level => level > 0).length;
        
        if (skillVariety >= this.config.skillCategories.length * 0.6) { // 60% of skills have levels
            const crossTrainingBonus = {
                type: 'experience',
                multiplier: 1 + this.config.crossTrainingIncentive,
                source: 'cross_training',
                expiresAt: Date.now() + 86400000, // 24 hours
                description: 'Cross-training experience bonus'
            };
            
            player.activeBonuses.push(crossTrainingBonus);
        }
    }

    // Update player status based on performance relative to others
    updatePlayerStatus(playerId) {
        const player = this.state.players.get(playerId);
        if (!player) return;

        // Check for catch-up eligibility
        this.checkCatchUpEligibility(player);
        
        // Check for dominance
        this.checkDominanceStatus(player);
        
        // Update merit scores
        this.updateMeritScores(player);
        
        // Clean up expired bonuses/penalties
        this.cleanupExpiredEffects(player);
    }

    checkCatchUpEligibility(player) {
        const playerLevel = player.level;
        const averageLevel = this.analytics.averageLevel;
        const levelGap = averageLevel - playerLevel;
        
        // Player needs catch-up if significantly below average
        const needsCatchUp = levelGap > (averageLevel * this.config.catchUpThreshold);
        
        if (needsCatchUp && !player.needsCatchUp) {
            player.needsCatchUp = true;
            this.state.catchUpActiveList.add(player.id);
            this.activateCatchUpMechanics(player);
        } else if (!needsCatchUp && player.needsCatchUp) {
            player.needsCatchUp = false;
            this.state.catchUpActiveList.delete(player.id);
            this.deactivateCatchUpMechanics(player);
        }
    }

    activateCatchUpMechanics(player) {
        // Add resource bonus
        const resourceBonus = {
            type: 'resource',
            multiplier: 1 + this.config.catchUpResourceBonus,
            source: 'catch_up',
            expiresAt: Date.now() + 604800000, // 7 days
            description: 'Catch-up resource bonus'
        };
        
        player.activeBonuses.push(resourceBonus);

        // Assign mentor if available
        if (this.config.mentorProgramEnabled && !player.hasActiveMentor) {
            this.assignMentor(player.id);
        }

        this.emit('catch_up_activated', {
            playerId: player.id,
            bonuses: [resourceBonus],
            mentorAssigned: player.hasActiveMentor
        });
    }

    deactivateCatchUpMechanics(player) {
        // Remove catch-up specific bonuses
        player.activeBonuses = player.activeBonuses.filter(bonus => bonus.source !== 'catch_up');

        this.emit('catch_up_deactivated', {
            playerId: player.id
        });
    }

    checkDominanceStatus(player) {
        // This would integrate with market data to check market share
        // For now, using performance stats as proxy
        const marketImpact = player.performanceStats.marketImpact;
        
        const isDominant = marketImpact > this.config.dominanceDetectionThreshold;
        
        if (isDominant && !player.isDominant) {
            player.isDominant = true;
            this.state.dominanceWatchList.add(player.id);
            this.applyDominancePenalties(player);
        } else if (!isDominant && player.isDominant) {
            player.isDominant = false;
            this.state.dominanceWatchList.delete(player.id);
            this.removeDominancePenalties(player);
        }
    }

    applyDominancePenalties(player) {
        const dominancePenalty = {
            type: 'experience',
            multiplier: this.config.dominancePenaltyMultiplier,
            source: 'dominance',
            expiresAt: Date.now() + 86400000, // 24 hours
            description: 'Market dominance penalty'
        };
        
        player.activePenalties.push(dominancePenalty);

        // Add additional challenges for dominant players
        this.assignDominanceResponsibilities(player);

        this.emit('dominance_penalty_applied', {
            playerId: player.id,
            penalties: [dominancePenalty]
        });
    }

    removeDominancePenalties(player) {
        player.activePenalties = player.activePenalties.filter(penalty => penalty.source !== 'dominance');

        this.emit('dominance_penalty_removed', {
            playerId: player.id
        });
    }

    // Mentor system management
    assignMentor(newPlayerId) {
        const newPlayer = this.state.players.get(newPlayerId);
        if (!newPlayer || !newPlayer.mentorshipEligible) return false;

        // Find suitable mentor
        const potentialMentors = Array.from(this.state.players.values()).filter(player => 
            player.isVeteran && 
            !player.isDominant &&
            player.meritScores.education.score > 5 &&
            !Array.from(this.state.mentorships.values()).some(m => m.mentorId === player.id)
        );

        if (potentialMentors.length === 0) return false;

        // Select mentor with highest education merit score
        const mentor = potentialMentors.reduce((best, current) => 
            current.meritScores.education.score > best.meritScores.education.score ? current : best
        );

        // Create mentorship
        const mentorshipId = `${mentor.id}_${newPlayerId}`;
        this.state.mentorships.set(mentorshipId, {
            id: mentorshipId,
            mentorId: mentor.id,
            menteeId: newPlayerId,
            startDate: Date.now(),
            active: true,
            sessionCount: 0,
            progressTracking: []
        });

        newPlayer.hasActiveMentor = true;
        newPlayer.mentorshipEligible = false;

        this.emit('mentorship_created', {
            mentorshipId,
            mentorId: mentor.id,
            menteeId: newPlayerId
        });

        return true;
    }

    // Merit system
    recordMeritAction(playerId, category, action, impact = 1) {
        const player = this.state.players.get(playerId);
        if (!player || !player.meritScores[category]) return false;

        const merit = player.meritScores[category];
        merit.score += impact;
        merit.totalContributions++;
        merit.recentActions.push({
            action,
            impact,
            timestamp: Date.now()
        });

        // Keep only recent actions
        if (merit.recentActions.length > 20) {
            merit.recentActions.shift();
        }

        // Update global merit tracking
        const globalMerit = this.state.meritTracking.get(category);
        if (!globalMerit.has(playerId)) {
            globalMerit.set(playerId, { score: 0, actions: 0 });
        }
        
        const playerGlobalMerit = globalMerit.get(playerId);
        playerGlobalMerit.score += impact;
        playerGlobalMerit.actions++;

        this.emit('merit_recorded', {
            playerId,
            category,
            action,
            impact,
            newScore: merit.score
        });

        return true;
    }

    // Analytics and reporting
    generateProgressionReport(playerId = null) {
        if (playerId) {
            return this.generatePlayerProgressionReport(playerId);
        }

        return this.generateSystemProgressionReport();
    }

    generatePlayerProgressionReport(playerId) {
        const player = this.state.players.get(playerId);
        if (!player) return null;

        return {
            playerId,
            currentLevel: player.level,
            experience: player.experience.toNumber(),
            nextLevelRequirement: this.calculateRequiredExperience(player.level).toNumber(),
            skillPoints: player.skillPoints,
            skills: Object.fromEntries(
                Object.entries(player.skills).map(([skill, data]) => [
                    skill,
                    {
                        level: data.level,
                        experience: data.experience.toNumber(),
                        nextLevelRequirement: this.calculateSkillRequiredExperience(data.level).toNumber()
                    }
                ])
            ),
            status: {
                isNewPlayer: player.isNewPlayer,
                isVeteran: player.isVeteran,
                needsCatchUp: player.needsCatchUp,
                isDominant: player.isDominant,
                hasActiveMentor: player.hasActiveMentor
            },
            activeBonuses: player.activeBonuses.filter(b => b.expiresAt > Date.now()),
            activePenalties: player.activePenalties.filter(p => p.expiresAt > Date.now()),
            meritScores: player.meritScores,
            progressionMetrics: this.calculatePlayerProgressionMetrics(player)
        };
    }

    generateSystemProgressionReport() {
        const totalPlayers = this.state.players.size;
        const newPlayers = Array.from(this.state.players.values()).filter(p => p.isNewPlayer).length;
        const veterans = Array.from(this.state.players.values()).filter(p => p.isVeteran).length;
        
        return {
            totalPlayers,
            newPlayers,
            veterans,
            averageLevel: this.analytics.averageLevel,
            levelDistribution: Object.fromEntries(this.state.levelDistribution),
            skillBalance: Object.fromEntries(this.analytics.skillBalance),
            fairnessMetrics: this.calculateFairnessMetrics(),
            catchUpActive: this.state.catchUpActiveList.size,
            dominanceWatch: this.state.dominanceWatchList.size,
            activeMentorships: Array.from(this.state.mentorships.values()).filter(m => m.active).length,
            systemHealth: this.calculateSystemHealth()
        };
    }

    calculatePlayerProgressionMetrics(player) {
        const daysSinceRegistration = (Date.now() - player.registrationDate) / 86400000;
        const experiencePerDay = daysSinceRegistration > 0 ? player.experience.div(daysSinceRegistration).toNumber() : 0;
        
        return {
            daysSinceRegistration,
            experiencePerDay,
            levelsPerWeek: (player.level - 1) / Math.max(1, daysSinceRegistration / 7),
            skillDiversity: Object.values(player.skills).filter(skill => skill.level > 0).length,
            meritTotal: Object.values(player.meritScores).reduce((sum, merit) => sum + merit.score, 0)
        };
    }

    calculateFairnessMetrics() {
        const players = Array.from(this.state.players.values());
        const levels = players.map(p => p.level);
        const experiences = players.map(p => p.experience.toNumber());
        
        return {
            levelGiniCoefficient: this.calculateGiniCoefficient(levels),
            experienceGiniCoefficient: this.calculateGiniCoefficient(experiences),
            newPlayerRetention: this.calculateNewPlayerRetention(),
            catchUpEffectiveness: this.calculateCatchUpEffectiveness(),
            veteranEngagement: this.calculateVeteranEngagement()
        };
    }

    calculateGiniCoefficient(values) {
        if (values.length === 0) return 0;
        
        values.sort((a, b) => a - b);
        const n = values.length;
        let sumOfDifferences = 0;
        
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                sumOfDifferences += Math.abs(values[i] - values[j]);
            }
        }
        
        const mean = values.reduce((sum, v) => sum + v, 0) / n;
        return sumOfDifferences / (2 * n * n * mean);
    }

    calculateNewPlayerRetention() {
        const newPlayers = Array.from(this.state.players.values()).filter(p => p.isNewPlayer);
        const activeNewPlayers = newPlayers.filter(p => 
            Date.now() - p.lastProgressionUpdate < 86400000 // Active in last 24 hours
        );
        
        return newPlayers.length > 0 ? activeNewPlayers.length / newPlayers.length : 1.0;
    }

    calculateCatchUpEffectiveness() {
        const catchUpPlayers = Array.from(this.state.players.values()).filter(p => p.needsCatchUp);
        if (catchUpPlayers.length === 0) return 1.0;
        
        const improvingPlayers = catchUpPlayers.filter(player => {
            const recentLevels = player.levelHistory.slice(-5);
            return recentLevels.length > 1 && 
                   recentLevels[recentLevels.length - 1].level > recentLevels[0].level;
        });
        
        return improvingPlayers.length / catchUpPlayers.length;
    }

    calculateVeteranEngagement() {
        const veterans = Array.from(this.state.players.values()).filter(p => p.isVeteran);
        if (veterans.length === 0) return 1.0;
        
        const activeVeterans = veterans.filter(v => 
            Date.now() - v.lastProgressionUpdate < 86400000 // Active in last 24 hours
        );
        
        return activeVeterans.length / veterans.length;
    }

    calculateSystemHealth() {
        const fairness = this.calculateFairnessMetrics();
        const balance = this.calculateSkillBalance();
        const engagement = this.calculateOverallEngagement();
        
        const healthScore = (
            (1 - fairness.levelGiniCoefficient) * 0.3 +
            fairness.newPlayerRetention * 0.25 +
            fairness.catchUpEffectiveness * 0.2 +
            balance * 0.15 +
            engagement * 0.1
        );
        
        return {
            overallScore: healthScore,
            status: healthScore > 0.8 ? 'EXCELLENT' : 
                   healthScore > 0.6 ? 'GOOD' : 
                   healthScore > 0.4 ? 'FAIR' : 'POOR',
            components: {
                fairness: 1 - fairness.levelGiniCoefficient,
                retention: fairness.newPlayerRetention,
                catchUpEffectiveness: fairness.catchUpEffectiveness,
                skillBalance: balance,
                engagement: engagement
            }
        };
    }

    calculateSkillBalance() {
        const skillDistributions = Array.from(this.analytics.skillBalance.values());
        const averageParticipation = skillDistributions.reduce((sum, skill) => sum + skill.totalPlayers, 0) / skillDistributions.length;
        
        const variance = skillDistributions.reduce((sum, skill) => 
            sum + Math.pow(skill.totalPlayers - averageParticipation, 2), 0) / skillDistributions.length;
        
        const coefficientOfVariation = averageParticipation > 0 ? Math.sqrt(variance) / averageParticipation : 0;
        
        return Math.max(0, 1 - coefficientOfVariation);
    }

    calculateOverallEngagement() {
        const totalPlayers = this.state.players.size;
        if (totalPlayers === 0) return 1.0;
        
        const activePlayers = Array.from(this.state.players.values()).filter(p => 
            Date.now() - p.lastProgressionUpdate < 86400000
        ).length;
        
        return activePlayers / totalPlayers;
    }

    // Utility methods
    updateLevelDistribution() {
        this.state.levelDistribution.clear();
        let totalLevel = 0;
        
        for (const player of this.state.players.values()) {
            const level = player.level;
            this.state.levelDistribution.set(level, (this.state.levelDistribution.get(level) || 0) + 1);
            totalLevel += level;
        }
        
        this.analytics.averageLevel = this.state.players.size > 0 ? totalLevel / this.state.players.size : 0;
    }

    updateSkillDistribution() {
        // Update skill balance analytics
        this.config.skillCategories.forEach(skillCategory => {
            const skillData = this.analytics.skillBalance.get(skillCategory);
            skillData.totalPlayers = 0;
            skillData.distribution = new Array(this.config.maxSkillLevel + 1).fill(0);
            
            let totalSkillLevel = 0;
            for (const player of this.state.players.values()) {
                const skillLevel = player.skills[skillCategory].level;
                if (skillLevel > 0) {
                    skillData.totalPlayers++;
                    skillData.distribution[skillLevel]++;
                    totalSkillLevel += skillLevel;
                }
            }
            
            skillData.averageLevel = skillData.totalPlayers > 0 ? totalSkillLevel / skillData.totalPlayers : 0;
        });
    }

    updateProgressionAnalytics(playerId) {
        const player = this.state.players.get(playerId);
        player.lastProgressionUpdate = Date.now();
        
        // Update player status based on progression
        this.updatePlayerStatus(playerId);
    }

    startAnalysisCycle() {
        // Run analytics update every hour
        this.analyticsInterval = setInterval(() => {
            this.updateLevelDistribution();
            this.updateSkillDistribution();
            
            // Check all players for status updates
            for (const playerId of this.state.players.keys()) {
                this.updatePlayerStatus(playerId);
            }
        }, 3600000);
    }

    cleanupExpiredEffects(player) {
        const now = Date.now();
        player.activeBonuses = player.activeBonuses.filter(bonus => bonus.expiresAt > now);
        player.activePenalties = player.activePenalties.filter(penalty => penalty.expiresAt > now);
    }

    // Placeholder methods for integration with other systems
    assignVeteranResponsibilities(playerId) {
        // Would integrate with mentor system, market governance, etc.
        this.emit('veteran_responsibilities_assigned', { playerId });
    }

    assignDominanceResponsibilities(player) {
        // Could include market stability duties, new player assistance, etc.
        this.emit('dominance_responsibilities_assigned', { playerId: player.id });
    }

    updateSpecializationBonuses(player, skillCategory) {
        // Calculate and apply specialization bonuses
        const skillLevel = player.skills[skillCategory].level;
        const bonus = Math.min(skillLevel * 0.1, this.config.specializationBonusCap - 1);
        
        // Remove old bonuses for this skill
        player.activeBonuses = player.activeBonuses.filter(b => 
            !(b.source === 'specialization' && b.skillCategory === skillCategory)
        );
        
        // Add new bonus
        if (bonus > 0) {
            player.activeBonuses.push({
                type: 'skill_bonus',
                skillCategory,
                multiplier: 1 + bonus,
                source: 'specialization',
                expiresAt: Infinity, // Permanent
                description: `${skillCategory} specialization bonus`
            });
        }
    }

    getActiveSpecializationBonuses(player, skillCategory) {
        return player.activeBonuses.filter(bonus => 
            bonus.source === 'specialization' && bonus.skillCategory === skillCategory
        );
    }

    updateMeritScores(player) {
        // Update merit scores based on recent performance
        // This would integrate with actual game metrics
        player.lastProgressionUpdate = Date.now();
    }

    stop() {
        if (this.analyticsInterval) {
            clearInterval(this.analyticsInterval);
        }
    }
}

module.exports = PlayerProgressionSystem;
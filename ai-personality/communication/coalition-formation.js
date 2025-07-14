/**
 * Coalition Formation Algorithms with Trust Verification
 * Advanced coalition-building with game theory and trust analysis
 */

class CoalitionFormationEngine {
    constructor(trustNetwork, reputationSystem) {
        this.trustNetwork = trustNetwork;
        this.reputationSystem = reputationSystem;
        this.activeCoalitions = new Map();
        this.coalitionHistory = new Map();
        this.gameTheoryEngine = new GameTheoryEngine();
        this.trustVerifier = new TrustVerificationSystem();
        this.coalitionOptimizer = new CoalitionOptimizer();
        
        // Coalition formation strategies
        this.strategies = {
            GREEDY: 'greedy_formation',
            OPTIMAL: 'optimal_formation',
            TRUST_BASED: 'trust_based_formation',
            GAME_THEORY: 'game_theory_formation',
            REPUTATION_WEIGHTED: 'reputation_weighted_formation',
            MUTUAL_BENEFIT: 'mutual_benefit_formation',
            RISK_BALANCED: 'risk_balanced_formation'
        };

        // Coalition types
        this.coalitionTypes = {
            TRADING: 'trading_coalition',
            INFORMATION: 'information_sharing',
            MARKET_MAKING: 'market_making',
            ARBITRAGE: 'arbitrage_coalition',
            DEFENSIVE: 'defensive_alliance',
            OFFENSIVE: 'market_manipulation',
            RESEARCH: 'research_consortium',
            EMERGENCY: 'crisis_response'
        };
    }

    // Core coalition formation methods
    findOptimalCoalition(initiator, purpose, availableAgents, constraints = {}) {
        const formationParams = {
            initiator: initiator,
            purpose: purpose,
            available_agents: availableAgents,
            constraints: {
                max_size: constraints.max_size || 8,
                min_trust_level: constraints.min_trust_level || 60,
                required_skills: constraints.required_skills || [],
                budget_constraints: constraints.budget_constraints || null,
                time_constraints: constraints.time_constraints || null,
                reputation_threshold: constraints.reputation_threshold || 50,
                ...constraints
            }
        };

        // Analyze coalition formation strategies
        const strategies = this.analyzeFormationStrategies(formationParams);
        
        // Find optimal coalition using multiple approaches
        const candidates = {
            greedy: this.greedyCoalitionFormation(formationParams),
            optimal: this.optimalCoalitionFormation(formationParams),
            trust_based: this.trustBasedFormation(formationParams),
            game_theory: this.gameTheoryFormation(formationParams),
            reputation_weighted: this.reputationWeightedFormation(formationParams)
        };

        // Evaluate and select best coalition
        const bestCoalition = this.evaluateCoalitionCandidates(candidates, formationParams);
        
        // Verify coalition feasibility
        const verification = this.verifyCoalitionFeasibility(bestCoalition, formationParams);
        
        return {
            recommended_coalition: bestCoalition,
            formation_strategy: bestCoalition.strategy,
            trust_verification: verification.trust_analysis,
            success_probability: verification.success_probability,
            expected_benefits: this.calculateExpectedBenefits(bestCoalition),
            risk_assessment: this.assessCoalitionRisks(bestCoalition),
            formation_plan: this.generateFormationPlan(bestCoalition)
        };
    }

    greedyCoalitionFormation(params) {
        const { initiator, available_agents, constraints } = params;
        const coalition = [initiator];
        const remaining = [...available_agents].filter(a => a !== initiator);
        
        // Sort agents by utility value
        const sortedAgents = remaining.map(agent => ({
            agent: agent,
            utility: this.calculateAgentUtility(agent, params.purpose, coalition),
            trust_level: this.trustNetwork.getTrustLevel(initiator, agent),
            reputation: this.reputationSystem.getReputation(agent)
        })).sort((a, b) => b.utility - a.utility);

        // Greedily add highest utility agents
        for (const candidate of sortedAgents) {
            if (coalition.length >= constraints.max_size) break;
            
            if (candidate.trust_level >= constraints.min_trust_level &&
                candidate.reputation >= constraints.reputation_threshold) {
                
                // Check if adding this agent improves coalition value
                const newUtility = this.calculateCoalitionUtility([...coalition, candidate.agent], params.purpose);
                const currentUtility = this.calculateCoalitionUtility(coalition, params.purpose);
                
                if (newUtility > currentUtility) {
                    coalition.push(candidate.agent);
                }
            }
        }

        return {
            members: coalition,
            strategy: this.strategies.GREEDY,
            utility: this.calculateCoalitionUtility(coalition, params.purpose),
            formation_cost: this.calculateFormationCost(coalition),
            stability_score: this.calculateStabilityScore(coalition)
        };
    }

    optimalCoalitionFormation(params) {
        const { initiator, available_agents, constraints } = params;
        
        // Use dynamic programming approach for optimal coalition
        const agents = [initiator, ...available_agents.filter(a => a !== initiator)];
        const n = agents.length;
        const maxSize = Math.min(constraints.max_size, n);
        
        // DP table: dp[mask] = {utility, members, cost}
        const dp = new Map();
        dp.set(0, { utility: 0, members: [], cost: 0 });
        
        // Generate all possible coalitions
        for (let mask = 1; mask < (1 << n); mask++) {
            const members = [];
            for (let i = 0; i < n; i++) {
                if (mask & (1 << i)) {
                    members.push(agents[i]);
                }
            }
            
            if (members.length > maxSize) continue;
            if (!members.includes(initiator)) continue;
            
            // Check trust constraints
            if (!this.verifyTrustConstraints(members, constraints)) continue;
            
            const utility = this.calculateCoalitionUtility(members, params.purpose);
            const cost = this.calculateFormationCost(members);
            const netValue = utility - cost;
            
            if (!dp.has(mask) || dp.get(mask).utility < netValue) {
                dp.set(mask, { utility: netValue, members, cost });
            }
        }
        
        // Find optimal coalition
        let bestCoalition = { utility: -Infinity, members: [initiator], cost: 0 };
        for (const [mask, coalition] of dp) {
            if (coalition.utility > bestCoalition.utility) {
                bestCoalition = coalition;
            }
        }

        return {
            members: bestCoalition.members,
            strategy: this.strategies.OPTIMAL,
            utility: bestCoalition.utility,
            formation_cost: bestCoalition.cost,
            stability_score: this.calculateStabilityScore(bestCoalition.members),
            optimality_proof: this.generateOptimalityProof(bestCoalition, dp)
        };
    }

    trustBasedFormation(params) {
        const { initiator, available_agents, constraints } = params;
        
        // Start with highest trust connections
        const trustGraph = this.buildTrustGraph(initiator, available_agents);
        const coalition = [initiator];
        
        // Use breadth-first search through trust network
        const queue = [{
            agent: initiator,
            trust_path: [],
            accumulated_trust: 100
        }];
        const visited = new Set([initiator]);
        
        while (queue.length > 0 && coalition.length < constraints.max_size) {
            const current = queue.shift();
            
            // Find trusted neighbors
            const neighbors = this.getTrustedNeighbors(current.agent, available_agents)
                .filter(neighbor => !visited.has(neighbor.agent))
                .sort((a, b) => b.trust_level - a.trust_level);
            
            for (const neighbor of neighbors) {
                if (coalition.length >= constraints.max_size) break;
                
                const pathTrust = this.calculatePathTrust(current.trust_path, neighbor.trust_level);
                
                if (pathTrust >= constraints.min_trust_level) {
                    coalition.push(neighbor.agent);
                    visited.add(neighbor.agent);
                    
                    queue.push({
                        agent: neighbor.agent,
                        trust_path: [...current.trust_path, neighbor.trust_level],
                        accumulated_trust: pathTrust
                    });
                }
            }
        }

        return {
            members: coalition,
            strategy: this.strategies.TRUST_BASED,
            utility: this.calculateCoalitionUtility(coalition, params.purpose),
            formation_cost: this.calculateFormationCost(coalition),
            stability_score: this.calculateStabilityScore(coalition),
            trust_network_strength: this.calculateTrustNetworkStrength(coalition),
            trust_redundancy: this.calculateTrustRedundancy(coalition)
        };
    }

    gameTheoryFormation(params) {
        const { initiator, available_agents, constraints, purpose } = params;
        
        // Model coalition formation as a cooperative game
        const players = [initiator, ...available_agents.filter(a => a !== initiator)];
        const game = this.gameTheoryEngine.createCoalitionGame(players, purpose);
        
        // Calculate characteristic function values
        const characteristicFunction = this.calculateCharacteristicFunction(players, purpose);
        
        // Find core solutions (stable coalitions)
        const coreSolutions = this.gameTheoryEngine.findCoreSolutions(characteristicFunction);
        
        // Calculate Shapley values for fair profit sharing
        const shapleyValues = this.gameTheoryEngine.calculateShapleyValues(characteristicFunction);
        
        // Find Nash equilibrium coalitions
        const nashCoalitions = this.gameTheoryEngine.findNashEquilibrium(game);
        
        // Select best solution based on multiple criteria
        const bestSolution = this.selectBestGameTheorySolution(
            coreSolutions, 
            nashCoalitions, 
            shapleyValues, 
            constraints
        );

        return {
            members: bestSolution.coalition,
            strategy: this.strategies.GAME_THEORY,
            utility: characteristicFunction.get(this.coalitionToMask(bestSolution.coalition)),
            formation_cost: this.calculateFormationCost(bestSolution.coalition),
            stability_score: bestSolution.stability_score,
            profit_sharing: bestSolution.profit_sharing,
            shapley_values: shapleyValues,
            core_membership: bestSolution.in_core,
            nash_equilibrium: bestSolution.is_nash
        };
    }

    reputationWeightedFormation(params) {
        const { initiator, available_agents, constraints } = params;
        
        // Calculate reputation-weighted scores for all agents
        const agentScores = available_agents.map(agent => {
            const reputation = this.reputationSystem.getReputation(agent);
            const trust = this.trustNetwork.getTrustLevel(initiator, agent);
            const utility = this.calculateAgentUtility(agent, params.purpose, [initiator]);
            
            // Weighted combination
            const score = (reputation * 0.4) + (trust * 0.3) + (utility * 0.3);
            
            return {
                agent: agent,
                score: score,
                reputation: reputation,
                trust: trust,
                utility: utility,
                reputation_history: this.getReputationHistory(agent)
            };
        }).sort((a, b) => b.score - a.score);

        // Build coalition using reputation-weighted selection
        const coalition = [initiator];
        const reputationThreshold = constraints.reputation_threshold;
        
        for (const candidate of agentScores) {
            if (coalition.length >= constraints.max_size) break;
            
            if (candidate.reputation >= reputationThreshold && 
                candidate.trust >= constraints.min_trust_level) {
                
                // Check reputation consistency
                const consistencyScore = this.calculateReputationConsistency(candidate.agent);
                if (consistencyScore >= 70) {
                    coalition.push(candidate.agent);
                }
            }
        }

        return {
            members: coalition,
            strategy: this.strategies.REPUTATION_WEIGHTED,
            utility: this.calculateCoalitionUtility(coalition, params.purpose),
            formation_cost: this.calculateFormationCost(coalition),
            stability_score: this.calculateStabilityScore(coalition),
            average_reputation: this.calculateAverageReputation(coalition),
            reputation_variance: this.calculateReputationVariance(coalition),
            reputation_risk: this.assessReputationRisk(coalition)
        };
    }

    // Trust verification and analysis
    verifyCoalitionTrust(coalition, trustThreshold = 60) {
        const trustMatrix = this.buildTrustMatrix(coalition);
        const analysis = {
            pairwise_trust: {},
            minimum_trust: Infinity,
            maximum_trust: -Infinity,
            average_trust: 0,
            trust_variance: 0,
            weak_links: [],
            strong_bonds: [],
            trust_redundancy: 0
        };

        let totalTrust = 0;
        let trustCount = 0;

        // Analyze all pairwise trust relationships
        for (let i = 0; i < coalition.length; i++) {
            for (let j = i + 1; j < coalition.length; j++) {
                const agentA = coalition[i];
                const agentB = coalition[j];
                const trust = this.trustNetwork.getTrustLevel(agentA, agentB);
                
                analysis.pairwise_trust[`${agentA}_${agentB}`] = trust;
                
                totalTrust += trust;
                trustCount++;
                
                analysis.minimum_trust = Math.min(analysis.minimum_trust, trust);
                analysis.maximum_trust = Math.max(analysis.maximum_trust, trust);
                
                if (trust < trustThreshold) {
                    analysis.weak_links.push({ agentA, agentB, trust });
                } else if (trust > 80) {
                    analysis.strong_bonds.push({ agentA, agentB, trust });
                }
            }
        }

        analysis.average_trust = totalTrust / trustCount;
        
        // Calculate trust variance
        let varianceSum = 0;
        for (const trust of Object.values(analysis.pairwise_trust)) {
            varianceSum += Math.pow(trust - analysis.average_trust, 2);
        }
        analysis.trust_variance = varianceSum / trustCount;

        // Calculate trust redundancy (multiple paths between agents)
        analysis.trust_redundancy = this.calculateTrustRedundancy(coalition);

        // Overall trust assessment
        analysis.trust_score = this.calculateOverallTrustScore(analysis);
        analysis.stability_risk = this.assessTrustStabilityRisk(analysis);
        analysis.recommendations = this.generateTrustRecommendations(analysis);

        return analysis;
    }

    // Coalition stability and optimization
    optimizeCoalitionStability(coalition, purpose) {
        const optimization = {
            current_stability: this.calculateStabilityScore(coalition),
            improvement_suggestions: [],
            member_replacements: [],
            structural_changes: [],
            incentive_adjustments: []
        };

        // Analyze stability factors
        const stabilityFactors = this.analyzeStabilityFactors(coalition, purpose);
        
        // Identify potential defectors
        const defectionRisks = this.identifyDefectionRisks(coalition);
        
        // Generate improvement strategies
        if (stabilityFactors.trust_issues.length > 0) {
            optimization.improvement_suggestions.push({
                type: 'trust_building',
                actions: this.generateTrustBuildingActions(stabilityFactors.trust_issues)
            });
        }

        if (stabilityFactors.utility_imbalance > 0.3) {
            optimization.improvement_suggestions.push({
                type: 'utility_balancing',
                actions: this.generateUtilityBalancingActions(coalition, purpose)
            });
        }

        // Suggest member replacements if beneficial
        const replacementCandidates = this.findReplacementCandidates(coalition, purpose);
        optimization.member_replacements = replacementCandidates.filter(r => r.improvement > 0.1);

        // Suggest structural changes
        optimization.structural_changes = this.suggestStructuralChanges(coalition, stabilityFactors);

        // Adjust incentive mechanisms
        optimization.incentive_adjustments = this.optimizeIncentiveMechanisms(coalition, purpose);

        return optimization;
    }

    // Coalition execution and monitoring
    executeCoalitionFormation(formationPlan) {
        const execution = {
            coalition_id: this.generateCoalitionId(),
            formation_start: Date.now(),
            phases: {},
            current_phase: 'invitation',
            success_probability: formationPlan.success_probability
        };

        // Phase 1: Send invitations
        execution.phases.invitation = this.executeInvitationPhase(formationPlan);
        
        // Phase 2: Negotiate terms
        if (execution.phases.invitation.success_rate > 0.5) {
            execution.current_phase = 'negotiation';
            execution.phases.negotiation = this.executeNegotiationPhase(formationPlan, execution.coalition_id);
        }

        // Phase 3: Finalize agreement
        if (execution.phases.negotiation && execution.phases.negotiation.agreement_reached) {
            execution.current_phase = 'finalization';
            execution.phases.finalization = this.executeFinalizationPhase(formationPlan, execution.coalition_id);
        }

        // Phase 4: Coalition activation
        if (execution.phases.finalization && execution.phases.finalization.all_committed) {
            execution.current_phase = 'activation';
            execution.phases.activation = this.activateCoalition(formationPlan, execution.coalition_id);
        }

        // Store active coalition
        if (execution.current_phase === 'activation') {
            this.storeActiveCoalition(execution.coalition_id, formationPlan, execution);
        }

        return execution;
    }

    monitorCoalitionPerformance(coalitionId) {
        const coalition = this.activeCoalitions.get(coalitionId);
        if (!coalition) {
            throw new Error(`Coalition ${coalitionId} not found`);
        }

        const monitoring = {
            coalition_id: coalitionId,
            performance_metrics: {},
            stability_metrics: {},
            trust_evolution: {},
            member_satisfaction: {},
            efficiency_analysis: {},
            risk_assessment: {}
        };

        // Performance monitoring
        monitoring.performance_metrics = {
            total_utility_generated: this.calculateTotalUtility(coalition),
            individual_contributions: this.calculateIndividualContributions(coalition),
            profit_distribution: this.calculateProfitDistribution(coalition),
            goal_achievement: this.assessGoalAchievement(coalition)
        };

        // Stability monitoring
        monitoring.stability_metrics = {
            current_stability: this.calculateCurrentStability(coalition),
            defection_probability: this.calculateDefectionProbability(coalition),
            internal_conflicts: this.detectInternalConflicts(coalition),
            external_pressures: this.assessExternalPressures(coalition)
        };

        // Trust evolution tracking
        monitoring.trust_evolution = this.trackTrustEvolution(coalition);

        // Member satisfaction analysis
        monitoring.member_satisfaction = this.analyzeMemberSatisfaction(coalition);

        // Efficiency analysis
        monitoring.efficiency_analysis = this.analyzeCoalitionEfficiency(coalition);

        // Risk assessment
        monitoring.risk_assessment = this.assessCoalitionRisks(coalition);

        return monitoring;
    }

    // Utility and analysis methods
    calculateAgentUtility(agent, purpose, currentCoalition) {
        const baseUtility = this.getAgentBaseUtility(agent, purpose);
        const synergy = this.calculateSynergy(agent, currentCoalition, purpose);
        const skills = this.getAgentSkills(agent);
        const relevantSkills = this.getRelevantSkills(purpose);
        
        const skillMatch = this.calculateSkillMatch(skills, relevantSkills);
        const reputationBonus = this.reputationSystem.getReputation(agent) * 0.1;
        
        return baseUtility + synergy + skillMatch + reputationBonus;
    }

    calculateCoalitionUtility(coalition, purpose) {
        if (coalition.length === 0) return 0;
        
        const individualUtilities = coalition.map(agent => 
            this.calculateAgentUtility(agent, purpose, coalition)
        );
        
        const baseUtility = individualUtilities.reduce((sum, utility) => sum + utility, 0);
        const synergyBonus = this.calculateCoalitionSynergy(coalition, purpose);
        const sizeEffect = this.calculateSizeEffect(coalition.length);
        const diversityBonus = this.calculateDiversityBonus(coalition);
        
        return baseUtility + synergyBonus + sizeEffect + diversityBonus;
    }

    calculateFormationCost(coalition) {
        const baseCost = coalition.length * 10; // Base coordination cost
        const communicationCost = coalition.length * (coalition.length - 1) * 2; // O(n²) communication
        const trustBuildingCost = this.calculateTrustBuildingCost(coalition);
        const negotiationCost = this.calculateNegotiationCost(coalition);
        
        return baseCost + communicationCost + trustBuildingCost + negotiationCost;
    }

    calculateStabilityScore(coalition) {
        const trustScore = this.calculateAverageTrust(coalition);
        const utilityBalance = this.calculateUtilityBalance(coalition);
        const conflictRisk = this.assessConflictRisk(coalition);
        const externalPressure = this.assessExternalPressure(coalition);
        
        return (trustScore * 0.4) + 
               (utilityBalance * 0.3) + 
               ((100 - conflictRisk) * 0.2) + 
               ((100 - externalPressure) * 0.1);
    }

    // Helper methods
    buildTrustGraph(initiator, agents) {
        const graph = new Map();
        
        [initiator, ...agents].forEach(agent => {
            const connections = agents.map(other => ({
                agent: other,
                trust: this.trustNetwork.getTrustLevel(agent, other)
            })).filter(conn => conn.trust > 0);
            
            graph.set(agent, connections);
        });
        
        return graph;
    }

    getTrustedNeighbors(agent, availableAgents) {
        return availableAgents.map(other => ({
            agent: other,
            trust_level: this.trustNetwork.getTrustLevel(agent, other)
        })).filter(neighbor => neighbor.trust_level > 0);
    }

    generateCoalitionId() {
        return `coalition_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    }

    getCoalitionAnalytics() {
        return {
            total_coalitions: this.activeCoalitions.size,
            coalition_types: this.analyzeCoalitionTypes(),
            average_size: this.calculateAverageCoalitionSize(),
            success_rate: this.calculateCoalitionSuccessRate(),
            stability_distribution: this.analyzeStabilityDistribution(),
            trust_metrics: this.analyzeCoalitionTrustMetrics(),
            performance_summary: this.summarizeCoalitionPerformance()
        };
    }
}

module.exports = CoalitionFormationEngine;
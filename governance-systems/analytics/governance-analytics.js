/**
 * Governance Analytics
 * Voting behavior and outcome analysis system
 */

class GovernanceAnalytics {
    constructor() {
        this.votingData = new Map();
        this.participantData = new Map();
        this.proposalAnalytics = new Map();
        this.timeSeriesData = [];
        this.behaviorPatterns = new Map();
        this.networkAnalysis = new Map();
        this.predictionModels = new Map();
        
        this.initializeAnalytics();
    }

    initializeAnalytics() {
        // Initialize analytics modules
        this.participationAnalyzer = new ParticipationAnalyzer();
        this.behaviorAnalyzer = new VotingBehaviorAnalyzer();
        this.networkAnalyzer = new GovernanceNetworkAnalyzer();
        this.trendAnalyzer = new TrendAnalyzer();
        this.predictionEngine = new GovernancePredictionEngine();
    }

    // Record voting data
    recordVotingData(voteData) {
        const {
            proposalId,
            voterId,
            vote,
            votingPower,
            timestamp,
            mechanism,
            metadata = {}
        } = voteData;

        const record = {
            proposalId,
            voterId,
            vote,
            votingPower,
            timestamp,
            mechanism,
            metadata,
            recorded: Date.now()
        };

        // Store by proposal
        if (!this.votingData.has(proposalId)) {
            this.votingData.set(proposalId, []);
        }
        this.votingData.get(proposalId).push(record);

        // Store by participant
        if (!this.participantData.has(voterId)) {
            this.participantData.set(voterId, []);
        }
        this.participantData.get(voterId).push(record);

        // Add to time series
        this.timeSeriesData.push(record);

        // Trigger analysis updates
        this.updateAnalytics(record);

        return record;
    }

    // Update analytics with new data
    updateAnalytics(newRecord) {
        // Update participation metrics
        this.participationAnalyzer.updateMetrics(newRecord);
        
        // Analyze voting behavior
        this.behaviorAnalyzer.analyzeBehavior(newRecord);
        
        // Update network analysis
        this.networkAnalyzer.updateNetwork(newRecord);
        
        // Analyze trends
        this.trendAnalyzer.updateTrends(newRecord);
        
        // Update predictions
        this.predictionEngine.updatePredictions(newRecord);
    }

    // Get comprehensive proposal analytics
    getProposalAnalytics(proposalId) {
        const votes = this.votingData.get(proposalId) || [];
        
        if (votes.length === 0) {
            return null;
        }

        const analytics = {
            proposalId,
            overview: this.calculateProposalOverview(votes),
            participation: this.analyzeParticipation(votes),
            votingPatterns: this.analyzeVotingPatterns(votes),
            timeAnalysis: this.analyzeVotingTiming(votes),
            voterSegmentation: this.segmentVoters(votes),
            influenceAnalysis: this.analyzeInfluence(votes),
            predictiveMetrics: this.calculatePredictiveMetrics(votes)
        };

        this.proposalAnalytics.set(proposalId, analytics);

        return analytics;
    }

    // Calculate proposal overview metrics
    calculateProposalOverview(votes) {
        const totalVotes = votes.length;
        const totalVotingPower = votes.reduce((sum, vote) => sum + vote.votingPower, 0);
        
        const voteBreakdown = {};
        const powerBreakdown = {};
        
        for (const vote of votes) {
            voteBreakdown[vote.vote] = (voteBreakdown[vote.vote] || 0) + 1;
            powerBreakdown[vote.vote] = (powerBreakdown[vote.vote] || 0) + vote.votingPower;
        }

        const startTime = Math.min(...votes.map(v => v.timestamp));
        const endTime = Math.max(...votes.map(v => v.timestamp));
        const duration = endTime - startTime;

        return {
            totalVotes,
            totalVotingPower,
            voteBreakdown,
            powerBreakdown,
            duration,
            averageVotingPower: totalVotingPower / totalVotes,
            participationScore: this.calculateParticipationScore(votes)
        };
    }

    // Analyze participation patterns
    analyzeParticipation(votes) {
        const participants = new Set(votes.map(v => v.voterId));
        const participationRate = participants.size; // Would need total eligible voters
        
        // Voting frequency distribution
        const votingFrequency = {};
        for (const vote of votes) {
            const hour = new Date(vote.timestamp).getHours();
            votingFrequency[hour] = (votingFrequency[hour] || 0) + 1;
        }

        // Early vs late voters
        const sortedVotes = votes.sort((a, b) => a.timestamp - b.timestamp);
        const midpoint = sortedVotes.length / 2;
        const earlyVoters = sortedVotes.slice(0, midpoint);
        const lateVoters = sortedVotes.slice(midpoint);

        return {
            participationRate,
            uniqueParticipants: participants.size,
            votingFrequency,
            earlyVoters: earlyVoters.length,
            lateVoters: lateVoters.length,
            earlyVoterPower: earlyVoters.reduce((sum, v) => sum + v.votingPower, 0),
            lateVoterPower: lateVoters.reduce((sum, v) => sum + v.votingPower, 0)
        };
    }

    // Analyze voting patterns
    analyzeVotingPatterns(votes) {
        // Power concentration analysis
        const voterPowers = votes.map(v => ({ voterId: v.voterId, power: v.votingPower }));
        const totalPower = voterPowers.reduce((sum, v) => sum + v.power, 0);
        const sortedByPower = voterPowers.sort((a, b) => b.power - a.power);
        
        const top10Percent = Math.ceil(sortedByPower.length * 0.1);
        const top10Power = sortedByPower.slice(0, top10Percent).reduce((sum, v) => sum + v.power, 0);
        const powerConcentration = totalPower > 0 ? (top10Power / totalPower) * 100 : 0;

        // Vote timing patterns
        const timingPatterns = this.analyzeTimingPatterns(votes);
        
        // Voting mechanism effectiveness
        const mechanismStats = {};
        for (const vote of votes) {
            if (!mechanismStats[vote.mechanism]) {
                mechanismStats[vote.mechanism] = { count: 0, totalPower: 0 };
            }
            mechanismStats[vote.mechanism].count++;
            mechanismStats[vote.mechanism].totalPower += vote.votingPower;
        }

        return {
            powerConcentration,
            timingPatterns,
            mechanismStats,
            giniCoefficient: this.calculateGiniCoefficient(voterPowers.map(v => v.power))
        };
    }

    // Analyze voting timing
    analyzeVotingTiming(votes) {
        const sortedVotes = votes.sort((a, b) => a.timestamp - b.timestamp);
        
        if (sortedVotes.length === 0) {
            return {};
        }

        const startTime = sortedVotes[0].timestamp;
        const endTime = sortedVotes[sortedVotes.length - 1].timestamp;
        const duration = endTime - startTime;

        // Calculate voting velocity over time
        const timeWindows = this.createTimeWindows(startTime, endTime, 10);
        const velocityData = timeWindows.map(window => {
            const windowVotes = sortedVotes.filter(v => 
                v.timestamp >= window.start && v.timestamp < window.end
            );
            return {
                window: window.index,
                votes: windowVotes.length,
                power: windowVotes.reduce((sum, v) => sum + v.votingPower, 0),
                velocity: windowVotes.length / ((window.end - window.start) / 1000) // votes per second
            };
        });

        // Peak voting periods
        const peakVelocity = Math.max(...velocityData.map(d => d.velocity));
        const peakWindow = velocityData.find(d => d.velocity === peakVelocity);

        return {
            duration,
            velocityData,
            peakVelocity,
            peakWindow: peakWindow?.window,
            averageVelocity: votes.length / (duration / 1000)
        };
    }

    // Segment voters by behavior
    segmentVoters(votes) {
        const voterStats = new Map();

        // Calculate stats for each voter
        for (const vote of votes) {
            if (!voterStats.has(vote.voterId)) {
                voterStats.set(vote.voterId, {
                    voterId: vote.voterId,
                    totalPower: 0,
                    votes: [],
                    participationTime: 0
                });
            }
            
            const stats = voterStats.get(vote.voterId);
            stats.totalPower += vote.votingPower;
            stats.votes.push(vote);
            
            if (stats.participationTime === 0) {
                stats.participationTime = vote.timestamp;
            }
        }

        // Segment voters
        const segments = {
            whales: [], // High voting power
            early: [], // Early voters
            consistent: [], // Regular participants
            swing: [], // Change votes frequently
            inactive: [] // Low participation
        };

        const sortedByPower = Array.from(voterStats.values()).sort((a, b) => b.totalPower - a.totalPower);
        const powerThreshold = sortedByPower[Math.floor(sortedByPower.length * 0.1)]?.totalPower || 0;

        for (const stats of voterStats.values()) {
            // Whale classification
            if (stats.totalPower >= powerThreshold) {
                segments.whales.push(stats.voterId);
            }

            // Early voter classification
            const allVotes = Array.from(voterStats.values()).flatMap(s => s.votes);
            const medianTime = this.calculateMedian(allVotes.map(v => v.timestamp));
            if (stats.participationTime < medianTime) {
                segments.early.push(stats.voterId);
            }

            // Additional segmentation logic...
        }

        return segments;
    }

    // Analyze voter influence
    analyzeInfluence(votes) {
        const influenceMetrics = new Map();

        for (const vote of votes) {
            if (!influenceMetrics.has(vote.voterId)) {
                influenceMetrics.set(vote.voterId, {
                    voterId: vote.voterId,
                    directInfluence: 0,
                    networkInfluence: 0,
                    temporalInfluence: 0
                });
            }

            const metrics = influenceMetrics.get(vote.voterId);
            
            // Direct influence based on voting power
            metrics.directInfluence += vote.votingPower;
            
            // Network influence (simplified - would need social graph)
            metrics.networkInfluence += this.calculateNetworkInfluence(vote.voterId, votes);
            
            // Temporal influence (early voters have more influence)
            const timeScore = this.calculateTemporalInfluence(vote, votes);
            metrics.temporalInfluence += timeScore;
        }

        return Object.fromEntries(influenceMetrics);
    }

    // Calculate predictive metrics
    calculatePredictiveMetrics(votes) {
        const features = {
            participationRate: votes.length,
            avgVotingPower: votes.reduce((sum, v) => sum + v.votingPower, 0) / votes.length,
            timeToFirstVote: this.calculateTimeToFirstVote(votes),
            powerConcentration: this.calculatePowerConcentration(votes),
            earlyMomentum: this.calculateEarlyMomentum(votes)
        };

        return {
            features,
            predictions: {
                finalParticipation: this.predictFinalParticipation(features),
                outcomeConfidence: this.predictOutcomeConfidence(features),
                controversyScore: this.calculateControversyScore(votes)
            }
        };
    }

    // Get participant analytics
    getParticipantAnalytics(participantId) {
        const participantVotes = this.participantData.get(participantId) || [];
        
        if (participantVotes.length === 0) {
            return null;
        }

        return {
            participantId,
            overview: {
                totalVotes: participantVotes.length,
                totalVotingPower: participantVotes.reduce((sum, v) => sum + v.votingPower, 0),
                averageVotingPower: participantVotes.reduce((sum, v) => sum + v.votingPower, 0) / participantVotes.length,
                firstVote: Math.min(...participantVotes.map(v => v.timestamp)),
                lastVote: Math.max(...participantVotes.map(v => v.timestamp)),
                activeProposals: new Set(participantVotes.map(v => v.proposalId)).size
            },
            votingPattern: this.analyzeParticipantVotingPattern(participantVotes),
            influence: this.calculateParticipantInfluence(participantId),
            engagement: this.calculateEngagementScore(participantVotes),
            behavior: this.classifyVotingBehavior(participantVotes)
        };
    }

    // Analyze participant voting pattern
    analyzeParticipantVotingPattern(votes) {
        const voteTypes = {};
        const mechanisms = {};
        const timeDistribution = {};

        for (const vote of votes) {
            voteTypes[vote.vote] = (voteTypes[vote.vote] || 0) + 1;
            mechanisms[vote.mechanism] = (mechanisms[vote.mechanism] || 0) + 1;
            
            const hour = new Date(vote.timestamp).getHours();
            timeDistribution[hour] = (timeDistribution[hour] || 0) + 1;
        }

        return {
            voteTypes,
            mechanisms,
            timeDistribution,
            consistency: this.calculateVotingConsistency(votes),
            timing: this.analyzeVotingTiming(votes)
        };
    }

    // Get governance trends
    getGovernanceTrends(timeRange = '30d') {
        const cutoffTime = Date.now() - this.parseDuration(timeRange);
        const recentData = this.timeSeriesData.filter(d => d.timestamp >= cutoffTime);

        return {
            participation: this.analyzeTrend(recentData, 'participation'),
            votingPower: this.analyzeTrend(recentData, 'votingPower'),
            proposalTypes: this.analyzeProposalTypeTrends(recentData),
            mechanisms: this.analyzeMechanismTrends(recentData),
            outcomes: this.analyzeOutcomeTrends(recentData),
            networkMetrics: this.getNetworkTrends(recentData)
        };
    }

    // Get network analysis
    getNetworkAnalysis() {
        return {
            overview: this.networkAnalyzer.getOverview(),
            centrality: this.networkAnalyzer.calculateCentrality(),
            communities: this.networkAnalyzer.detectCommunities(),
            influence: this.networkAnalyzer.calculateInfluenceScores(),
            clustering: this.networkAnalyzer.calculateClustering()
        };
    }

    // Generate governance health score
    calculateGovernanceHealthScore() {
        const metrics = {
            participation: this.calculateParticipationHealth(),
            distribution: this.calculatePowerDistributionHealth(),
            engagement: this.calculateEngagementHealth(),
            efficiency: this.calculateEfficiencyHealth(),
            transparency: this.calculateTransparencyHealth()
        };

        const weights = {
            participation: 0.25,
            distribution: 0.25,
            engagement: 0.2,
            efficiency: 0.15,
            transparency: 0.15
        };

        const healthScore = Object.entries(metrics).reduce((score, [metric, value]) => {
            return score + (value * weights[metric]);
        }, 0);

        return {
            overall: Math.round(healthScore),
            components: metrics,
            recommendations: this.generateHealthRecommendations(metrics)
        };
    }

    // Helper methods
    calculateParticipationScore(votes) {
        const uniqueVoters = new Set(votes.map(v => v.voterId)).size;
        const totalVotingPower = votes.reduce((sum, v) => sum + v.votingPower, 0);
        const avgPower = totalVotingPower / votes.length;
        
        // Normalize score (simplified)
        return Math.min(100, (uniqueVoters * avgPower) / 1000);
    }

    calculateGiniCoefficient(values) {
        if (values.length <= 1) return 0;

        const sortedValues = values.sort((a, b) => a - b);
        const n = sortedValues.length;
        const sum = sortedValues.reduce((a, b) => a + b, 0);
        
        if (sum === 0) return 0;

        let numerator = 0;
        for (let i = 0; i < n; i++) {
            numerator += (2 * (i + 1) - n - 1) * sortedValues[i];
        }

        return numerator / (n * sum);
    }

    createTimeWindows(startTime, endTime, windowCount) {
        const duration = endTime - startTime;
        const windowSize = duration / windowCount;
        
        return Array.from({ length: windowCount }, (_, i) => ({
            index: i,
            start: startTime + (i * windowSize),
            end: startTime + ((i + 1) * windowSize)
        }));
    }

    calculateMedian(values) {
        const sorted = values.sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);
        
        if (sorted.length % 2 === 0) {
            return (sorted[middle - 1] + sorted[middle]) / 2;
        }
        return sorted[middle];
    }

    calculateNetworkInfluence(voterId, votes) {
        // Simplified network influence calculation
        return votes.filter(v => v.voterId === voterId).length * 0.1;
    }

    calculateTemporalInfluence(vote, allVotes) {
        const sortedVotes = allVotes.sort((a, b) => a.timestamp - b.timestamp);
        const position = sortedVotes.findIndex(v => v.timestamp === vote.timestamp);
        const totalVotes = sortedVotes.length;
        
        // Earlier votes have higher temporal influence
        return (totalVotes - position) / totalVotes;
    }

    calculateTimeToFirstVote(votes) {
        if (votes.length === 0) return 0;
        const firstVote = Math.min(...votes.map(v => v.timestamp));
        const proposalStart = firstVote; // Simplified
        return firstVote - proposalStart;
    }

    calculatePowerConcentration(votes) {
        const powers = votes.map(v => v.votingPower);
        return this.calculateGiniCoefficient(powers);
    }

    calculateEarlyMomentum(votes) {
        const sortedVotes = votes.sort((a, b) => a.timestamp - b.timestamp);
        const early25Percent = sortedVotes.slice(0, Math.floor(sortedVotes.length * 0.25));
        return early25Percent.reduce((sum, v) => sum + v.votingPower, 0);
    }

    predictFinalParticipation(features) {
        // Simplified prediction model
        return features.participationRate * 1.2;
    }

    predictOutcomeConfidence(features) {
        // Simplified confidence calculation
        return Math.min(100, features.powerConcentration * 100);
    }

    calculateControversyScore(votes) {
        const voteTypes = {};
        for (const vote of votes) {
            voteTypes[vote.vote] = (voteTypes[vote.vote] || 0) + 1;
        }
        
        const values = Object.values(voteTypes);
        const variance = values.reduce((acc, val) => acc + Math.pow(val - (votes.length / values.length), 2), 0) / values.length;
        
        return Math.min(100, variance / 10);
    }

    parseDuration(duration) {
        const units = { 'd': 24*60*60*1000, 'h': 60*60*1000, 'm': 60*1000 };
        const match = duration.match(/(\d+)([dhm])/);
        if (match) {
            return parseInt(match[1]) * units[match[2]];
        }
        return 30 * 24 * 60 * 60 * 1000; // Default 30 days
    }

    // Additional methods would be implemented for complete analytics...
    calculateParticipationHealth() { return 75; }
    calculatePowerDistributionHealth() { return 60; }
    calculateEngagementHealth() { return 80; }
    calculateEfficiencyHealth() { return 70; }
    calculateTransparencyHealth() { return 85; }

    generateHealthRecommendations(metrics) {
        const recommendations = [];
        
        if (metrics.participation < 70) {
            recommendations.push("Increase participation through incentives and education");
        }
        
        if (metrics.distribution < 60) {
            recommendations.push("Address power concentration through voting power reforms");
        }
        
        return recommendations;
    }
}

// Supporting analyzer classes (simplified implementations)
class ParticipationAnalyzer {
    updateMetrics(record) {
        // Update participation metrics
    }
}

class VotingBehaviorAnalyzer {
    analyzeBehavior(record) {
        // Analyze voting behavior patterns
    }
}

class GovernanceNetworkAnalyzer {
    updateNetwork(record) {
        // Update network analysis
    }
    
    getOverview() {
        return {};
    }
    
    calculateCentrality() {
        return {};
    }
    
    detectCommunities() {
        return {};
    }
    
    calculateInfluenceScores() {
        return {};
    }
    
    calculateClustering() {
        return {};
    }
}

class TrendAnalyzer {
    updateTrends(record) {
        // Update trend analysis
    }
}

class GovernancePredictionEngine {
    updatePredictions(record) {
        // Update prediction models
    }
}

module.exports = { GovernanceAnalytics };
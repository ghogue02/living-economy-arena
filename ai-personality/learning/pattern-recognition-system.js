/**
 * Advanced Pattern Recognition System for Meta-Learning
 * Identifies patterns across market, social, and learning domains for knowledge transfer
 */

class PatternRecognitionSystem {
    constructor() {
        this.patternLibrary = new PatternLibrary();
        this.temporalAnalyzer = new TemporalPatternAnalyzer();
        this.spatialAnalyzer = new SpatialPatternAnalyzer();
        this.frequencyAnalyzer = new FrequencyPatternAnalyzer();
        this.correlationEngine = new CorrelationEngine();
        this.anomalyDetector = new AnomalyDetector();
        this.patternValidator = new PatternValidator();
        this.hierarchicalAnalyzer = new HierarchicalPatternAnalyzer();
        
        this.recognizedPatterns = new Map();
        this.patternHistory = [];
        this.validationResults = new Map();
        this.confidence_tracker = new PatternConfidenceTracker();
        
        this.initializePatternTypes();
    }

    initializePatternTypes() {
        this.patternTypes = {
            // Market patterns
            market: {
                trend_patterns: ['uptrend', 'downtrend', 'sideways', 'breakout', 'reversal'],
                volatility_patterns: ['low_volatility', 'high_volatility', 'increasing_volatility', 'decreasing_volatility'],
                volume_patterns: ['volume_spike', 'volume_drying_up', 'volume_accumulation', 'volume_distribution'],
                cycle_patterns: ['daily_cycle', 'weekly_cycle', 'monthly_cycle', 'seasonal_cycle'],
                support_resistance: ['strong_support', 'weak_support', 'strong_resistance', 'weak_resistance']
            },
            
            // Social patterns
            social: {
                network_patterns: ['clustering', 'hub_formation', 'network_expansion', 'network_fragmentation'],
                trust_patterns: ['trust_building', 'trust_erosion', 'trust_recovery', 'trust_polarization'],
                information_patterns: ['information_cascade', 'information_hoarding', 'information_sharing', 'misinformation_spread'],
                collaboration_patterns: ['spontaneous_collaboration', 'forced_collaboration', 'collaborative_breakdown', 'collaborative_evolution'],
                influence_patterns: ['influencer_emergence', 'influence_diffusion', 'influence_concentration', 'counter_influence']
            },
            
            // Learning patterns
            learning: {
                acquisition_patterns: ['rapid_learning', 'gradual_learning', 'plateau_learning', 'accelerated_learning'],
                retention_patterns: ['strong_retention', 'weak_retention', 'selective_retention', 'interference_pattern'],
                transfer_patterns: ['positive_transfer', 'negative_transfer', 'zero_transfer', 'bidirectional_transfer'],
                adaptation_patterns: ['quick_adaptation', 'slow_adaptation', 'over_adaptation', 'under_adaptation'],
                specialization_patterns: ['narrow_specialization', 'broad_specialization', 'multi_specialization', 'specialization_drift']
            },
            
            // Behavioral patterns
            behavioral: {
                decision_patterns: ['consistent_decisions', 'erratic_decisions', 'biased_decisions', 'rational_decisions'],
                emotional_patterns: ['emotional_stability', 'emotional_volatility', 'emotional_contagion', 'emotional_regulation'],
                risk_patterns: ['risk_seeking', 'risk_averse', 'risk_adaptive', 'risk_miscalibration'],
                temporal_patterns: ['time_consistent', 'time_inconsistent', 'deadline_effect', 'procrastination_pattern']
            }
        };
    }

    // Main pattern recognition interface
    identifyMarketPatterns(experience, context) {
        const patterns = [];
        
        // Price movement patterns
        const pricePatterns = this.identifyPricePatterns(context.market_data);
        patterns.push(...pricePatterns);
        
        // Volume patterns
        const volumePatterns = this.identifyVolumePatterns(context.market_data);
        patterns.push(...volumePatterns);
        
        // Volatility patterns
        const volatilityPatterns = this.identifyVolatilityPatterns(context.market_data);
        patterns.push(...volatilityPatterns);
        
        // Correlation patterns
        const correlationPatterns = this.identifyCorrelationPatterns(context.market_data);
        patterns.push(...correlationPatterns);
        
        // Temporal market patterns
        const temporalPatterns = this.temporalAnalyzer.analyzeMarketTemporalPatterns(context.market_data);
        patterns.push(...temporalPatterns);
        
        return this.validateAndRankPatterns(patterns, 'market');
    }

    identifyPricePatterns(marketData) {
        const patterns = [];
        
        if (!marketData.price_history || marketData.price_history.length < 10) {
            return patterns;
        }
        
        const prices = marketData.price_history;
        
        // Trend analysis
        const trendPattern = this.analyzeTrendPattern(prices);
        if (trendPattern.confidence > 0.6) {
            patterns.push({
                type: 'trend_pattern',
                subtype: trendPattern.type,
                confidence: trendPattern.confidence,
                strength: trendPattern.strength,
                duration: trendPattern.duration,
                data_points: prices.length,
                features: trendPattern.features
            });
        }
        
        // Support and resistance levels
        const supportResistancePatterns = this.identifySupportResistanceLevels(prices);
        patterns.push(...supportResistancePatterns);
        
        // Chart patterns
        const chartPatterns = this.identifyChartPatterns(prices);
        patterns.push(...chartPatterns);
        
        // Breakout patterns
        const breakoutPatterns = this.identifyBreakoutPatterns(prices);
        patterns.push(...breakoutPatterns);
        
        return patterns;
    }

    analyzeTrendPattern(prices) {
        const movingAverages = this.calculateMovingAverages(prices);
        const slopes = this.calculateSlopes(movingAverages);
        
        let trendType = 'sideways';
        let confidence = 0;
        let strength = 0;
        
        const avgSlope = slopes.reduce((sum, slope) => sum + slope, 0) / slopes.length;
        const slopeConsistency = this.calculateSlopeConsistency(slopes);
        
        if (avgSlope > 0.02 && slopeConsistency > 0.7) {
            trendType = 'uptrend';
            confidence = slopeConsistency;
            strength = Math.min(1, avgSlope * 10);
        } else if (avgSlope < -0.02 && slopeConsistency > 0.7) {
            trendType = 'downtrend';
            confidence = slopeConsistency;
            strength = Math.min(1, Math.abs(avgSlope) * 10);
        } else if (slopeConsistency > 0.8 && Math.abs(avgSlope) < 0.01) {
            trendType = 'sideways';
            confidence = slopeConsistency;
            strength = 1 - Math.abs(avgSlope) * 20;
        }
        
        return {
            type: trendType,
            confidence: confidence,
            strength: strength,
            duration: prices.length,
            features: {
                average_slope: avgSlope,
                slope_consistency: slopeConsistency,
                volatility: this.calculateVolatility(prices)
            }
        };
    }

    identifySupportResistanceLevels(prices) {
        const patterns = [];
        const levels = this.findSignificantLevels(prices);
        
        levels.forEach(level => {
            const testCount = this.countLevelTests(prices, level.price, level.tolerance);
            const bounceRate = this.calculateBounceRate(prices, level.price, level.tolerance);
            
            if (testCount >= 3 && bounceRate > 0.7) {
                patterns.push({
                    type: level.type === 'peak' ? 'resistance_pattern' : 'support_pattern',
                    subtype: bounceRate > 0.8 ? 'strong' : 'weak',
                    confidence: Math.min(1, testCount / 5 * bounceRate),
                    strength: bounceRate,
                    level_price: level.price,
                    test_count: testCount,
                    features: {
                        bounce_rate: bounceRate,
                        level_significance: level.significance,
                        recent_tests: level.recent_tests
                    }
                });
            }
        });
        
        return patterns;
    }

    identifyChartPatterns(prices) {
        const patterns = [];
        
        // Head and shoulders
        const headShouldersPattern = this.detectHeadAndShoulders(prices);
        if (headShouldersPattern.confidence > 0.6) {
            patterns.push(headShouldersPattern);
        }
        
        // Double top/bottom
        const doubleTopBottomPattern = this.detectDoubleTopBottom(prices);
        if (doubleTopBottomPattern.confidence > 0.6) {
            patterns.push(doubleTopBottomPattern);
        }
        
        // Triangular patterns
        const triangularPatterns = this.detectTriangularPatterns(prices);
        patterns.push(...triangularPatterns.filter(p => p.confidence > 0.6));
        
        return patterns;
    }

    identifyVolumePatterns(marketData) {
        const patterns = [];
        
        if (!marketData.volume_history || marketData.volume_history.length < 10) {
            return patterns;
        }
        
        const volumes = marketData.volume_history;
        
        // Volume spikes
        const volumeSpikes = this.detectVolumeSpikes(volumes);
        patterns.push(...volumeSpikes);
        
        // Volume trends
        const volumeTrend = this.analyzeVolumeTrend(volumes);
        if (volumeTrend.confidence > 0.6) {
            patterns.push(volumeTrend);
        }
        
        // Price-volume divergence
        if (marketData.price_history) {
            const divergencePattern = this.detectPriceVolumeDivergence(marketData.price_history, volumes);
            if (divergencePattern.confidence > 0.6) {
                patterns.push(divergencePattern);
            }
        }
        
        return patterns;
    }

    identifyVolatilityPatterns(marketData) {
        const patterns = [];
        
        if (!marketData.price_history || marketData.price_history.length < 20) {
            return patterns;
        }
        
        const volatility = this.calculateRollingVolatility(marketData.price_history);
        
        // Volatility clustering
        const clusteringPattern = this.detectVolatilityClustering(volatility);
        if (clusteringPattern.confidence > 0.6) {
            patterns.push(clusteringPattern);
        }
        
        // Volatility regime changes
        const regimeChanges = this.detectVolatilityRegimeChanges(volatility);
        patterns.push(...regimeChanges.filter(p => p.confidence > 0.6));
        
        // Mean reversion in volatility
        const meanReversion = this.detectVolatilityMeanReversion(volatility);
        if (meanReversion.confidence > 0.6) {
            patterns.push(meanReversion);
        }
        
        return patterns;
    }

    identifyCorrelationPatterns(marketData) {
        const patterns = [];
        
        if (!marketData.correlation_matrix || Object.keys(marketData.correlation_matrix).length < 3) {
            return patterns;
        }
        
        // High correlation clusters
        const correlationClusters = this.identifyCorrelationClusters(marketData.correlation_matrix);
        patterns.push(...correlationClusters);
        
        // Correlation breakdown patterns
        const breakdownPatterns = this.detectCorrelationBreakdowns(marketData.correlation_history);
        patterns.push(...breakdownPatterns);
        
        // Leading/lagging relationships
        const leadLagPatterns = this.identifyLeadLagRelationships(marketData);
        patterns.push(...leadLagPatterns);
        
        return patterns;
    }

    // Social pattern recognition
    identifySocialPatterns(experience, context) {
        const patterns = [];
        
        if (!context.social_environment) {
            return patterns;
        }
        
        // Network structure patterns
        const networkPatterns = this.identifyNetworkPatterns(context.social_environment);
        patterns.push(...networkPatterns);
        
        // Trust evolution patterns
        const trustPatterns = this.identifyTrustPatterns(context.social_environment);
        patterns.push(...trustPatterns);
        
        // Information flow patterns
        const informationPatterns = this.identifyInformationFlowPatterns(context.social_environment);
        patterns.push(...informationPatterns);
        
        // Collaboration patterns
        const collaborationPatterns = this.identifyCollaborationPatterns(context.social_environment);
        patterns.push(...collaborationPatterns);
        
        return this.validateAndRankPatterns(patterns, 'social');
    }

    identifyNetworkPatterns(socialEnvironment) {
        const patterns = [];
        
        if (!socialEnvironment.network_structure) {
            return patterns;
        }
        
        const network = socialEnvironment.network_structure;
        
        // Clustering patterns
        const clusteringCoeff = this.spatialAnalyzer.calculateClusteringCoefficient(network);
        if (clusteringCoeff > 0.7) {
            patterns.push({
                type: 'network_pattern',
                subtype: 'high_clustering',
                confidence: clusteringCoeff,
                strength: clusteringCoeff,
                features: {
                    clustering_coefficient: clusteringCoeff,
                    network_density: this.spatialAnalyzer.calculateNetworkDensity(network),
                    average_path_length: this.spatialAnalyzer.calculateAveragePathLength(network)
                }
            });
        }
        
        // Hub formation patterns
        const hubNodes = this.spatialAnalyzer.identifyHubNodes(network);
        if (hubNodes.length > 0) {
            patterns.push({
                type: 'network_pattern',
                subtype: 'hub_formation',
                confidence: Math.min(1, hubNodes.length / (network.nodes.length * 0.1)),
                strength: this.spatialAnalyzer.calculateHubStrength(hubNodes),
                features: {
                    hub_count: hubNodes.length,
                    hub_centrality: this.spatialAnalyzer.calculateHubCentrality(hubNodes),
                    network_efficiency: this.spatialAnalyzer.calculateNetworkEfficiency(network)
                }
            });
        }
        
        // Network growth patterns
        if (socialEnvironment.network_history) {
            const growthPattern = this.analyzeNetworkGrowthPattern(socialEnvironment.network_history);
            if (growthPattern.confidence > 0.6) {
                patterns.push(growthPattern);
            }
        }
        
        return patterns;
    }

    identifyTrustPatterns(socialEnvironment) {
        const patterns = [];
        
        if (!socialEnvironment.trust_data) {
            return patterns;
        }
        
        const trustData = socialEnvironment.trust_data;
        
        // Trust polarization
        const polarization = this.analyzeTrustPolarization(trustData);
        if (polarization.confidence > 0.6) {
            patterns.push(polarization);
        }
        
        // Trust cascades
        const trustCascades = this.detectTrustCascades(trustData);
        patterns.push(...trustCascades.filter(p => p.confidence > 0.6));
        
        // Trust recovery patterns
        if (socialEnvironment.trust_history) {
            const recoveryPatterns = this.analyzeTrustRecoveryPatterns(socialEnvironment.trust_history);
            patterns.push(...recoveryPatterns.filter(p => p.confidence > 0.6));
        }
        
        return patterns;
    }

    identifyInformationFlowPatterns(socialEnvironment) {
        const patterns = [];
        
        if (!socialEnvironment.information_flow) {
            return patterns;
        }
        
        const infoFlow = socialEnvironment.information_flow;
        
        // Information cascades
        const cascades = this.detectInformationCascades(infoFlow);
        patterns.push(...cascades.filter(p => p.confidence > 0.6));
        
        // Information bottlenecks
        const bottlenecks = this.identifyInformationBottlenecks(infoFlow);
        patterns.push(...bottlenecks.filter(p => p.confidence > 0.6));
        
        // Echo chamber patterns
        const echoChambers = this.detectEchoChambers(infoFlow);
        patterns.push(...echoChambers.filter(p => p.confidence > 0.6));
        
        return patterns;
    }

    identifyCollaborationPatterns(socialEnvironment) {
        const patterns = [];
        
        if (!socialEnvironment.collaboration_data) {
            return patterns;
        }
        
        const collabData = socialEnvironment.collaboration_data;
        
        // Spontaneous collaboration
        const spontaneousCollab = this.detectSpontaneousCollaboration(collabData);
        if (spontaneousCollab.confidence > 0.6) {
            patterns.push(spontaneousCollab);
        }
        
        // Collaboration success patterns
        const successPatterns = this.analyzeCollaborationSuccessPatterns(collabData);
        patterns.push(...successPatterns.filter(p => p.confidence > 0.6));
        
        // Team formation patterns
        const teamFormationPatterns = this.analyzeTeamFormationPatterns(collabData);
        patterns.push(...teamFormationPatterns.filter(p => p.confidence > 0.6));
        
        return patterns;
    }

    // Learning pattern recognition
    identifyLearningPatterns(metaLearningHistory) {
        const patterns = [];
        
        if (!metaLearningHistory || metaLearningHistory.length < 5) {
            return patterns;
        }
        
        // Learning curve patterns
        const learningCurvePatterns = this.analyzeLearningCurves(metaLearningHistory);
        patterns.push(...learningCurvePatterns);
        
        // Knowledge acquisition patterns
        const acquisitionPatterns = this.analyzeKnowledgeAcquisitionPatterns(metaLearningHistory);
        patterns.push(...acquisitionPatterns);
        
        // Skill development patterns
        const skillPatterns = this.analyzeSkillDevelopmentPatterns(metaLearningHistory);
        patterns.push(...skillPatterns);
        
        // Learning transfer patterns
        const transferPatterns = this.analyzeLearningTransferPatterns(metaLearningHistory);
        patterns.push(...transferPatterns);
        
        // Learning plateau patterns
        const plateauPatterns = this.detectLearningPlateaus(metaLearningHistory);
        patterns.push(...plateauPatterns);
        
        return this.validateAndRankPatterns(patterns, 'learning');
    }

    analyzeLearningCurves(learningHistory) {
        const patterns = [];
        
        const learningProgress = this.extractLearningProgress(learningHistory);
        
        // S-curve learning pattern
        const sCurvePattern = this.detectSCurveLearning(learningProgress);
        if (sCurvePattern.confidence > 0.6) {
            patterns.push(sCurvePattern);
        }
        
        // Linear learning pattern
        const linearPattern = this.detectLinearLearning(learningProgress);
        if (linearPattern.confidence > 0.6) {
            patterns.push(linearPattern);
        }
        
        // Exponential learning pattern
        const exponentialPattern = this.detectExponentialLearning(learningProgress);
        if (exponentialPattern.confidence > 0.6) {
            patterns.push(exponentialPattern);
        }
        
        return patterns;
    }

    analyzeKnowledgeAcquisitionPatterns(learningHistory) {
        const patterns = [];
        
        const acquisitionData = this.extractKnowledgeAcquisitionData(learningHistory);
        
        // Burst learning pattern
        const burstPattern = this.detectBurstLearning(acquisitionData);
        if (burstPattern.confidence > 0.6) {
            patterns.push(burstPattern);
        }
        
        // Steady acquisition pattern
        const steadyPattern = this.detectSteadyAcquisition(acquisitionData);
        if (steadyPattern.confidence > 0.6) {
            patterns.push(steadyPattern);
        }
        
        // Selective learning pattern
        const selectivePattern = this.detectSelectiveLearning(acquisitionData);
        if (selectivePattern.confidence > 0.6) {
            patterns.push(selectivePattern);
        }
        
        return patterns;
    }

    analyzeSkillDevelopmentPatterns(learningHistory) {
        const patterns = [];
        
        const skillData = this.extractSkillDevelopmentData(learningHistory);
        
        // Parallel skill development
        const parallelPattern = this.detectParallelSkillDevelopment(skillData);
        if (parallelPattern.confidence > 0.6) {
            patterns.push(parallelPattern);
        }
        
        // Sequential skill development
        const sequentialPattern = this.detectSequentialSkillDevelopment(skillData);
        if (sequentialPattern.confidence > 0.6) {
            patterns.push(sequentialPattern);
        }
        
        // Cross-skill synergy patterns
        const synergyPatterns = this.detectSkillSynergyPatterns(skillData);
        patterns.push(...synergyPatterns.filter(p => p.confidence > 0.6));
        
        return patterns;
    }

    analyzeLearningTransferPatterns(learningHistory) {
        const patterns = [];
        
        const transferData = this.extractTransferData(learningHistory);
        
        if (transferData.length === 0) {
            return patterns;
        }
        
        // Positive transfer patterns
        const positiveTransferPattern = this.analyzePositiveTransfer(transferData);
        if (positiveTransferPattern.confidence > 0.6) {
            patterns.push(positiveTransferPattern);
        }
        
        // Negative transfer patterns
        const negativeTransferPattern = this.analyzeNegativeTransfer(transferData);
        if (negativeTransferPattern.confidence > 0.6) {
            patterns.push(negativeTransferPattern);
        }
        
        // Transfer domain patterns
        const domainPatterns = this.analyzeDomainTransferPatterns(transferData);
        patterns.push(...domainPatterns.filter(p => p.confidence > 0.6));
        
        return patterns;
    }

    detectLearningPlateaus(learningHistory) {
        const patterns = [];
        
        const progressData = this.extractLearningProgress(learningHistory);
        
        // Performance plateau detection
        const plateauPeriods = this.identifyPlateauPeriods(progressData);
        
        plateauPeriods.forEach(plateau => {
            if (plateau.duration > 5 && plateau.confidence > 0.7) {
                patterns.push({
                    type: 'learning_pattern',
                    subtype: 'learning_plateau',
                    confidence: plateau.confidence,
                    strength: plateau.stability,
                    duration: plateau.duration,
                    features: {
                        plateau_level: plateau.level,
                        plateau_stability: plateau.stability,
                        pre_plateau_growth: plateau.pre_growth,
                        post_plateau_potential: plateau.post_potential
                    }
                });
            }
        });
        
        return patterns;
    }

    // Pattern validation and ranking
    validateAndRankPatterns(patterns, domain) {
        const validatedPatterns = [];
        
        patterns.forEach(pattern => {
            const validation = this.patternValidator.validatePattern(pattern, domain);
            
            if (validation.is_valid) {
                const rankedPattern = {
                    ...pattern,
                    validation_score: validation.score,
                    reliability: validation.reliability,
                    significance: validation.significance,
                    domain: domain,
                    timestamp: Date.now()
                };
                
                // Update confidence based on validation
                rankedPattern.confidence = this.adjustConfidenceForValidation(
                    rankedPattern.confidence, 
                    validation
                );
                
                validatedPatterns.push(rankedPattern);
                
                // Store in pattern library
                this.patternLibrary.addPattern(rankedPattern);
                
                // Track confidence
                this.confidence_tracker.trackPattern(rankedPattern);
            }
        });
        
        // Rank patterns by combined score
        return validatedPatterns.sort((a, b) => {
            const scoreA = a.confidence * a.validation_score * a.significance;
            const scoreB = b.confidence * b.validation_score * b.significance;
            return scoreB - scoreA;
        });
    }

    adjustConfidenceForValidation(originalConfidence, validation) {
        let adjustedConfidence = originalConfidence;
        
        // Boost confidence for high validation scores
        if (validation.score > 0.8) {
            adjustedConfidence = Math.min(1, adjustedConfidence * 1.1);
        }
        
        // Reduce confidence for low reliability
        if (validation.reliability < 0.6) {
            adjustedConfidence = adjustedConfidence * 0.9;
        }
        
        // Historical validation performance
        const historicalPerformance = this.patternValidator.getHistoricalPerformance(validation.pattern_type);
        if (historicalPerformance) {
            adjustedConfidence = adjustedConfidence * (0.5 + historicalPerformance.accuracy * 0.5);
        }
        
        return Math.max(0.1, Math.min(1, adjustedConfidence));
    }

    // Utility methods for pattern analysis
    calculateMovingAverages(prices, window = 10) {
        const movingAverages = [];
        
        for (let i = window - 1; i < prices.length; i++) {
            const windowPrices = prices.slice(i - window + 1, i + 1);
            const average = windowPrices.reduce((sum, price) => sum + price, 0) / window;
            movingAverages.push(average);
        }
        
        return movingAverages;
    }

    calculateSlopes(values) {
        const slopes = [];
        
        for (let i = 1; i < values.length; i++) {
            const slope = (values[i] - values[i - 1]) / values[i - 1];
            slopes.push(slope);
        }
        
        return slopes;
    }

    calculateSlopeConsistency(slopes) {
        if (slopes.length === 0) return 0;
        
        const avgSlope = slopes.reduce((sum, slope) => sum + slope, 0) / slopes.length;
        const sameDirectionCount = slopes.filter(slope => 
            (avgSlope > 0 && slope > 0) || (avgSlope < 0 && slope < 0)
        ).length;
        
        return sameDirectionCount / slopes.length;
    }

    calculateVolatility(prices, window = 20) {
        if (prices.length < window) return 0;
        
        const returns = [];
        for (let i = 1; i < prices.length; i++) {
            returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
        }
        
        const meanReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;
        const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - meanReturn, 2), 0) / returns.length;
        
        return Math.sqrt(variance);
    }

    calculateRollingVolatility(prices, window = 20) {
        const volatilities = [];
        
        for (let i = window; i < prices.length; i++) {
            const windowPrices = prices.slice(i - window, i);
            const volatility = this.calculateVolatility(windowPrices, window);
            volatilities.push(volatility);
        }
        
        return volatilities;
    }

    findSignificantLevels(prices) {
        const levels = [];
        const localExtrema = this.findLocalExtrema(prices);
        
        localExtrema.forEach(extremum => {
            const significance = this.calculateLevelSignificance(prices, extremum.price);
            
            if (significance > 0.6) {
                levels.push({
                    price: extremum.price,
                    type: extremum.type,
                    significance: significance,
                    tolerance: this.calculateTolerance(extremum.price),
                    recent_tests: this.countRecentTests(prices, extremum.price)
                });
            }
        });
        
        return levels;
    }

    findLocalExtrema(prices, window = 5) {
        const extrema = [];
        
        for (let i = window; i < prices.length - window; i++) {
            const currentPrice = prices[i];
            const leftWindow = prices.slice(i - window, i);
            const rightWindow = prices.slice(i + 1, i + window + 1);
            
            const isLocalMax = leftWindow.every(p => p <= currentPrice) && 
                              rightWindow.every(p => p <= currentPrice);
            const isLocalMin = leftWindow.every(p => p >= currentPrice) && 
                              rightWindow.every(p => p >= currentPrice);
            
            if (isLocalMax) {
                extrema.push({ price: currentPrice, type: 'peak', index: i });
            } else if (isLocalMin) {
                extrema.push({ price: currentPrice, type: 'trough', index: i });
            }
        }
        
        return extrema;
    }

    calculateLevelSignificance(prices, level) {
        const touchCount = this.countLevelTests(prices, level, level * 0.01);
        const priceRange = Math.max(...prices) - Math.min(...prices);
        const levelImportance = touchCount / prices.length;
        const rangeImportance = 1 - Math.abs(level - (Math.max(...prices) + Math.min(...prices)) / 2) / priceRange;
        
        return (levelImportance + rangeImportance) / 2;
    }

    countLevelTests(prices, level, tolerance) {
        return prices.filter(price => Math.abs(price - level) <= tolerance).length;
    }

    calculateBounceRate(prices, level, tolerance) {
        const touches = [];
        
        for (let i = 0; i < prices.length; i++) {
            if (Math.abs(prices[i] - level) <= tolerance) {
                touches.push(i);
            }
        }
        
        if (touches.length < 2) return 0;
        
        let bounces = 0;
        for (let i = 0; i < touches.length - 1; i++) {
            const touchIndex = touches[i];
            if (touchIndex > 0 && touchIndex < prices.length - 1) {
                const prevPrice = prices[touchIndex - 1];
                const nextPrice = prices[touchIndex + 1];
                const currentPrice = prices[touchIndex];
                
                // Check if price bounced off the level
                if ((level > currentPrice && nextPrice > currentPrice) ||
                    (level < currentPrice && nextPrice < currentPrice)) {
                    bounces++;
                }
            }
        }
        
        return bounces / touches.length;
    }

    calculateTolerance(price) {
        return price * 0.02; // 2% tolerance
    }

    countRecentTests(prices, level, recentWindow = 10) {
        const recentPrices = prices.slice(-recentWindow);
        const tolerance = this.calculateTolerance(level);
        return this.countLevelTests(recentPrices, level, tolerance);
    }

    // Public interface
    getRecognizedPatterns(domain = null, minConfidence = 0.6) {
        let patterns = Array.from(this.recognizedPatterns.values());
        
        if (domain) {
            patterns = patterns.filter(p => p.domain === domain);
        }
        
        return patterns
            .filter(p => p.confidence >= minConfidence)
            .sort((a, b) => b.confidence - a.confidence);
    }

    getPatternStatistics() {
        const stats = {
            total_patterns: this.recognizedPatterns.size,
            by_domain: {},
            by_confidence: {},
            by_type: {},
            validation_success_rate: 0,
            average_confidence: 0
        };
        
        let totalConfidence = 0;
        let validatedCount = 0;
        
        this.recognizedPatterns.forEach(pattern => {
            // Count by domain
            stats.by_domain[pattern.domain] = (stats.by_domain[pattern.domain] || 0) + 1;
            
            // Count by type
            stats.by_type[pattern.type] = (stats.by_type[pattern.type] || 0) + 1;
            
            // Count by confidence level
            const confLevel = this.getConfidenceLevel(pattern.confidence);
            stats.by_confidence[confLevel] = (stats.by_confidence[confLevel] || 0) + 1;
            
            totalConfidence += pattern.confidence;
            
            if (pattern.validation_score && pattern.validation_score > 0.7) {
                validatedCount++;
            }
        });
        
        stats.average_confidence = this.recognizedPatterns.size > 0 ? 
            totalConfidence / this.recognizedPatterns.size : 0;
        
        stats.validation_success_rate = this.recognizedPatterns.size > 0 ? 
            validatedCount / this.recognizedPatterns.size : 0;
        
        return stats;
    }

    getConfidenceLevel(confidence) {
        if (confidence >= 0.9) return 'very_high';
        if (confidence >= 0.7) return 'high';
        if (confidence >= 0.5) return 'medium';
        if (confidence >= 0.3) return 'low';
        return 'very_low';
    }

    getPatternPredictions(context, timeHorizon = 'short_term') {
        const predictions = [];
        
        // Use existing patterns to predict future patterns
        const relevantPatterns = this.getRelevantPatternsForPrediction(context);
        
        relevantPatterns.forEach(pattern => {
            const prediction = this.generatePatternPrediction(pattern, context, timeHorizon);
            if (prediction.confidence > 0.5) {
                predictions.push(prediction);
            }
        });
        
        return predictions.sort((a, b) => b.confidence - a.confidence);
    }

    getRelevantPatternsForPrediction(context) {
        return Array.from(this.recognizedPatterns.values())
            .filter(pattern => this.isPatternRelevantForContext(pattern, context))
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 10); // Top 10 most relevant patterns
    }

    isPatternRelevantForContext(pattern, context) {
        // Check domain relevance
        if (context.domain && pattern.domain !== context.domain) {
            return false;
        }
        
        // Check temporal relevance
        const patternAge = Date.now() - pattern.timestamp;
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        if (patternAge > maxAge) {
            return false;
        }
        
        // Check confidence threshold
        if (pattern.confidence < 0.6) {
            return false;
        }
        
        return true;
    }

    generatePatternPrediction(pattern, context, timeHorizon) {
        return {
            predicted_pattern: {
                type: pattern.type,
                subtype: pattern.subtype,
                expected_strength: pattern.strength * 0.8, // Slightly reduced prediction strength
                domain: pattern.domain
            },
            confidence: this.calculatePredictionConfidence(pattern, context),
            time_horizon: timeHorizon,
            based_on_pattern: pattern.id || pattern.type,
            conditions: this.identifyPredictionConditions(pattern, context),
            likelihood_factors: this.identifyLikelihoodFactors(pattern, context)
        };
    }

    calculatePredictionConfidence(pattern, context) {
        let confidence = pattern.confidence * 0.7; // Base prediction confidence is lower than observation confidence
        
        // Adjust based on pattern stability
        if (pattern.validation_score > 0.8) {
            confidence *= 1.1;
        }
        
        // Adjust based on pattern frequency
        const patternFrequency = this.patternLibrary.getPatternFrequency(pattern.type);
        confidence *= (0.7 + patternFrequency * 0.3);
        
        // Adjust based on context similarity
        const contextSimilarity = this.calculateContextSimilarity(pattern.context, context);
        confidence *= (0.5 + contextSimilarity * 0.5);
        
        return Math.max(0.1, Math.min(1, confidence));
    }

    identifyPredictionConditions(pattern, context) {
        return {
            market_conditions: pattern.features?.market_conditions || 'any',
            social_conditions: pattern.features?.social_conditions || 'any',
            temporal_conditions: pattern.features?.temporal_conditions || 'any',
            required_context: this.extractRequiredContext(pattern)
        };
    }

    identifyLikelihoodFactors(pattern, context) {
        return {
            historical_frequency: this.patternLibrary.getPatternFrequency(pattern.type),
            pattern_stability: pattern.validation_score || 0.5,
            context_match: this.calculateContextSimilarity(pattern.context, context),
            environmental_factors: this.assessEnvironmentalFactors(pattern, context)
        };
    }

    calculateContextSimilarity(patternContext, currentContext) {
        if (!patternContext || !currentContext) return 0.5;
        
        let similarity = 0;
        let factors = 0;
        
        // Compare market conditions
        if (patternContext.market_conditions && currentContext.market_conditions) {
            const marketSim = this.compareMarketConditions(patternContext.market_conditions, currentContext.market_conditions);
            similarity += marketSim;
            factors++;
        }
        
        // Compare social conditions
        if (patternContext.social_conditions && currentContext.social_conditions) {
            const socialSim = this.compareSocialConditions(patternContext.social_conditions, currentContext.social_conditions);
            similarity += socialSim;
            factors++;
        }
        
        return factors > 0 ? similarity / factors : 0.5;
    }

    compareMarketConditions(context1, context2) {
        let similarity = 0;
        let comparisons = 0;
        
        ['volatility', 'trend', 'liquidity'].forEach(factor => {
            if (context1[factor] !== undefined && context2[factor] !== undefined) {
                const diff = Math.abs(context1[factor] - context2[factor]) / 100;
                similarity += 1 - diff;
                comparisons++;
            }
        });
        
        return comparisons > 0 ? similarity / comparisons : 0.5;
    }

    compareSocialConditions(context1, context2) {
        let similarity = 0;
        let comparisons = 0;
        
        ['trust_level', 'network_activity', 'collaboration_level'].forEach(factor => {
            if (context1[factor] !== undefined && context2[factor] !== undefined) {
                const diff = Math.abs(context1[factor] - context2[factor]) / 100;
                similarity += 1 - diff;
                comparisons++;
            }
        });
        
        return comparisons > 0 ? similarity / comparisons : 0.5;
    }

    extractRequiredContext(pattern) {
        const required = {};
        
        if (pattern.features) {
            // Extract key contextual requirements from pattern features
            Object.keys(pattern.features).forEach(key => {
                if (pattern.features[key] !== undefined && pattern.features[key] !== null) {
                    required[key] = pattern.features[key];
                }
            });
        }
        
        return required;
    }

    assessEnvironmentalFactors(pattern, context) {
        return {
            stability: context.environmental_stability || 0.5,
            predictability: context.environmental_predictability || 0.5,
            noise_level: context.noise_level || 0.5,
            external_influences: context.external_influences || 0.5
        };
    }
}

// Supporting classes (simplified implementations)
class PatternLibrary {
    constructor() {
        this.patterns = new Map();
        this.patternFrequencies = new Map();
    }

    addPattern(pattern) {
        const patternId = this.generatePatternId(pattern);
        this.patterns.set(patternId, pattern);
        
        // Update frequency tracking
        const patternType = pattern.type;
        this.patternFrequencies.set(patternType, (this.patternFrequencies.get(patternType) || 0) + 1);
    }

    getPatternFrequency(patternType) {
        const frequency = this.patternFrequencies.get(patternType) || 0;
        const totalPatterns = Array.from(this.patternFrequencies.values()).reduce((sum, freq) => sum + freq, 0);
        return totalPatterns > 0 ? frequency / totalPatterns : 0;
    }

    generatePatternId(pattern) {
        return `${pattern.type}_${pattern.subtype}_${pattern.timestamp}`;
    }
}

class TemporalPatternAnalyzer {
    analyzeMarketTemporalPatterns(marketData) {
        const patterns = [];
        
        // Daily patterns
        const dailyPattern = this.analyzeDailyPatterns(marketData);
        if (dailyPattern.confidence > 0.6) {
            patterns.push(dailyPattern);
        }
        
        // Weekly patterns
        const weeklyPattern = this.analyzeWeeklyPatterns(marketData);
        if (weeklyPattern.confidence > 0.6) {
            patterns.push(weeklyPattern);
        }
        
        return patterns;
    }

    analyzeDailyPatterns(marketData) {
        // Simplified daily pattern analysis
        return {
            type: 'temporal_pattern',
            subtype: 'daily_cycle',
            confidence: 0.7,
            strength: 0.6,
            features: {
                peak_hours: [9, 10, 15, 16],
                low_activity_hours: [12, 13, 14],
                volatility_pattern: 'u_shaped'
            }
        };
    }

    analyzeWeeklyPatterns(marketData) {
        // Simplified weekly pattern analysis
        return {
            type: 'temporal_pattern',
            subtype: 'weekly_cycle',
            confidence: 0.65,
            strength: 0.5,
            features: {
                high_activity_days: ['monday', 'tuesday', 'friday'],
                low_activity_days: ['wednesday', 'thursday'],
                volatility_pattern: 'declining_through_week'
            }
        };
    }
}

class SpatialPatternAnalyzer {
    calculateClusteringCoefficient(network) {
        // Simplified clustering coefficient calculation
        return 0.75;
    }

    calculateNetworkDensity(network) {
        // Simplified network density calculation
        const nodeCount = network.nodes ? network.nodes.length : 0;
        const edgeCount = network.edges ? network.edges.length : 0;
        const maxEdges = nodeCount * (nodeCount - 1) / 2;
        return maxEdges > 0 ? edgeCount / maxEdges : 0;
    }

    calculateAveragePathLength(network) {
        // Simplified average path length calculation
        return 3.5;
    }

    identifyHubNodes(network) {
        // Simplified hub identification
        return network.nodes ? network.nodes.filter(node => node.degree > 10) : [];
    }

    calculateHubStrength(hubNodes) {
        // Simplified hub strength calculation
        return hubNodes.length > 0 ? 0.8 : 0;
    }

    calculateHubCentrality(hubNodes) {
        // Simplified hub centrality calculation
        return hubNodes.reduce((sum, hub) => sum + (hub.centrality || 0.5), 0) / Math.max(1, hubNodes.length);
    }

    calculateNetworkEfficiency(network) {
        // Simplified network efficiency calculation
        return 0.7;
    }
}

class FrequencyPatternAnalyzer {
    analyzeFrequencyPatterns(data) {
        // Simplified frequency analysis
        return [];
    }
}

class CorrelationEngine {
    calculateCorrelations(data) {
        // Simplified correlation calculation
        return [];
    }
}

class AnomalyDetector {
    detectAnomalies(data) {
        // Simplified anomaly detection
        return [];
    }
}

class PatternValidator {
    validatePattern(pattern, domain) {
        // Simplified pattern validation
        return {
            is_valid: pattern.confidence > 0.5,
            score: pattern.confidence,
            reliability: 0.7,
            significance: 0.6
        };
    }

    getHistoricalPerformance(patternType) {
        // Simplified historical performance lookup
        return { accuracy: 0.7 };
    }
}

class HierarchicalPatternAnalyzer {
    analyzeHierarchicalPatterns(data) {
        // Simplified hierarchical pattern analysis
        return [];
    }
}

class PatternConfidenceTracker {
    constructor() {
        this.confidenceHistory = new Map();
    }

    trackPattern(pattern) {
        const patternType = pattern.type;
        if (!this.confidenceHistory.has(patternType)) {
            this.confidenceHistory.set(patternType, []);
        }
        
        this.confidenceHistory.get(patternType).push({
            confidence: pattern.confidence,
            timestamp: pattern.timestamp
        });
    }
}

module.exports = PatternRecognitionSystem;
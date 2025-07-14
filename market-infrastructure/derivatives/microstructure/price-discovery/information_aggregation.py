"""
Advanced Price Discovery Mechanisms with Information Aggregation
Phase 3 Market Microstructure Optimization
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Dict, List, Tuple, Optional, Callable, Any
from enum import Enum
import asyncio
from datetime import datetime, timedelta
import scipy.stats as stats
from scipy.optimize import minimize
import networkx as nx

class InformationType(Enum):
    FUNDAMENTAL = "fundamental"
    TECHNICAL = "technical"
    SENTIMENT = "sentiment"
    ORDER_FLOW = "order_flow"
    NEWS = "news"
    MACRO = "macro"

class InformationQuality(Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    NOISE = "noise"

@dataclass
class InformationSignal:
    source_id: str
    signal_type: InformationType
    quality: InformationQuality
    value: float
    confidence: float
    timestamp: datetime
    decay_rate: float
    weight: float

@dataclass
class PriceComponent:
    fundamental_value: float
    noise_component: float
    information_premium: float
    liquidity_discount: float
    final_price: float

@dataclass
class MarketParticipant:
    participant_id: str
    information_set: List[InformationSignal]
    trading_strategy: str
    information_quality: float
    market_impact: float

class AdvancedPriceDiscovery:
    """Sophisticated price discovery with multi-source information aggregation"""
    
    def __init__(self, symbol: str):
        self.symbol = symbol
        self.information_signals: List[InformationSignal] = []
        self.price_history: List[float] = []
        self.information_weights: Dict[str, float] = {}
        self.market_participants: List[MarketParticipant] = []
        
        # Core components
        self.signal_processor = InformationSignalProcessor()
        self.aggregator = InformationAggregator()
        self.consensus_builder = MarketConsensusBuilder()
        self.price_imputation = PriceImputationEngine()
        self.efficiency_monitor = MarketEfficiencyMonitor()
        
    async def discover_price(self, market_data: Dict) -> PriceComponent:
        """Comprehensive price discovery using all available information"""
        
        # Collect and process information signals
        await self._collect_information_signals(market_data)
        
        # Process signals for quality and relevance
        processed_signals = await self.signal_processor.process_signals(
            self.information_signals
        )
        
        # Aggregate information into consensus
        consensus = await self.aggregator.aggregate_information(
            processed_signals, self.market_participants
        )
        
        # Build market consensus price
        consensus_price = await self.consensus_builder.build_consensus(
            consensus, market_data
        )
        
        # Decompose price into components
        price_components = await self._decompose_price(
            consensus_price, market_data, processed_signals
        )
        
        # Monitor and adjust for market efficiency
        efficiency_adjustment = await self.efficiency_monitor.calculate_adjustment(
            price_components, market_data
        )
        
        final_price = consensus_price + efficiency_adjustment
        
        # Create comprehensive price component breakdown
        return PriceComponent(
            fundamental_value=price_components['fundamental'],
            noise_component=price_components['noise'],
            information_premium=price_components['information_premium'],
            liquidity_discount=price_components['liquidity_discount'],
            final_price=final_price
        )
    
    async def _collect_information_signals(self, market_data: Dict):
        """Collect information signals from multiple sources"""
        
        current_time = datetime.now()
        
        # Order flow signals
        order_flow_signal = InformationSignal(
            source_id="order_flow",
            signal_type=InformationType.ORDER_FLOW,
            quality=InformationQuality.HIGH,
            value=market_data.get('order_flow_imbalance', 0.0),
            confidence=0.8,
            timestamp=current_time,
            decay_rate=0.1,
            weight=1.0
        )
        
        # Technical signals
        technical_signal = InformationSignal(
            source_id="technical_analysis",
            signal_type=InformationType.TECHNICAL,
            quality=InformationQuality.MEDIUM,
            value=market_data.get('technical_score', 0.0),
            confidence=0.6,
            timestamp=current_time,
            decay_rate=0.05,
            weight=1.0
        )
        
        # Sentiment signals
        sentiment_signal = InformationSignal(
            source_id="market_sentiment",
            signal_type=InformationType.SENTIMENT,
            quality=InformationQuality.MEDIUM,
            value=market_data.get('sentiment_score', 0.0),
            confidence=0.5,
            timestamp=current_time,
            decay_rate=0.02,
            weight=1.0
        )
        
        # News signals
        news_signal = InformationSignal(
            source_id="news_analysis",
            signal_type=InformationType.NEWS,
            quality=InformationQuality.HIGH,
            value=market_data.get('news_sentiment', 0.0),
            confidence=0.7,
            timestamp=current_time,
            decay_rate=0.03,
            weight=1.0
        )
        
        # Add signals to collection
        new_signals = [order_flow_signal, technical_signal, sentiment_signal, news_signal]
        self.information_signals.extend(new_signals)
        
        # Remove expired signals
        cutoff_time = current_time - timedelta(hours=24)
        self.information_signals = [
            signal for signal in self.information_signals
            if signal.timestamp > cutoff_time
        ]
    
    async def _decompose_price(self, consensus_price: float, market_data: Dict,
                             signals: List[InformationSignal]) -> Dict[str, float]:
        """Decompose price into fundamental and noise components"""
        
        # Fundamental value estimation
        fundamental_signals = [s for s in signals if s.signal_type == InformationType.FUNDAMENTAL]
        fundamental_value = np.mean([s.value for s in fundamental_signals]) if fundamental_signals else consensus_price
        
        # Noise component estimation
        price_volatility = market_data.get('volatility', 0.02)
        noise_component = np.random.normal(0, price_volatility * 0.1)
        
        # Information premium calculation
        information_quality_avg = np.mean([s.confidence for s in signals])
        information_premium = (information_quality_avg - 0.5) * consensus_price * 0.001
        
        # Liquidity discount calculation
        bid_ask_spread = market_data.get('bid_ask_spread', 0.001)
        order_book_depth = market_data.get('order_book_depth', 100000)
        liquidity_discount = bid_ask_spread * (1 - min(1.0, order_book_depth / 1000000))
        
        return {
            'fundamental': fundamental_value,
            'noise': noise_component,
            'information_premium': information_premium,
            'liquidity_discount': liquidity_discount
        }


class InformationSignalProcessor:
    """Process and validate information signals"""
    
    def __init__(self):
        self.signal_filters = {
            InformationType.ORDER_FLOW: self._process_order_flow,
            InformationType.TECHNICAL: self._process_technical,
            InformationType.SENTIMENT: self._process_sentiment,
            InformationType.NEWS: self._process_news,
            InformationType.FUNDAMENTAL: self._process_fundamental,
            InformationType.MACRO: self._process_macro
        }
    
    async def process_signals(self, signals: List[InformationSignal]) -> List[InformationSignal]:
        """Process and filter information signals"""
        
        processed_signals = []
        
        for signal in signals:
            # Apply signal-specific processing
            processor = self.signal_filters.get(signal.signal_type, self._process_generic)
            processed_signal = await processor(signal)
            
            if processed_signal:
                # Apply temporal decay
                processed_signal = await self._apply_temporal_decay(processed_signal)
                
                # Validate signal quality
                if await self._validate_signal_quality(processed_signal):
                    processed_signals.append(processed_signal)
        
        return processed_signals
    
    async def _process_order_flow(self, signal: InformationSignal) -> Optional[InformationSignal]:
        """Process order flow information signals"""
        
        # Normalize order flow imbalance
        normalized_value = np.tanh(signal.value * 5)  # Compress to [-1, 1]
        
        # Adjust confidence based on order flow strength
        confidence_adjustment = min(1.0, abs(signal.value) * 2)
        
        signal.value = normalized_value
        signal.confidence *= confidence_adjustment
        
        return signal
    
    async def _process_technical(self, signal: InformationSignal) -> Optional[InformationSignal]:
        """Process technical analysis signals"""
        
        # Apply momentum adjustment
        momentum_factor = 1 + abs(signal.value) * 0.1
        signal.confidence *= momentum_factor
        
        # Cap extreme values
        signal.value = np.clip(signal.value, -2.0, 2.0)
        
        return signal
    
    async def _process_sentiment(self, signal: InformationSignal) -> Optional[InformationSignal]:
        """Process market sentiment signals"""
        
        # Sentiment often has lower reliability
        signal.confidence *= 0.8
        
        # Apply contrarian adjustment for extreme sentiment
        if abs(signal.value) > 1.5:
            signal.value *= -0.5  # Contrarian signal
            signal.confidence *= 0.5
        
        return signal
    
    async def _process_news(self, signal: InformationSignal) -> Optional[InformationSignal]:
        """Process news-based signals"""
        
        # News signals decay faster
        signal.decay_rate *= 2.0
        
        # High-impact news gets higher weight
        if abs(signal.value) > 1.0:
            signal.weight *= 1.5
        
        return signal
    
    async def _process_fundamental(self, signal: InformationSignal) -> Optional[InformationSignal]:
        """Process fundamental analysis signals"""
        
        # Fundamental signals are more persistent
        signal.decay_rate *= 0.5
        signal.weight *= 1.2
        
        return signal
    
    async def _process_macro(self, signal: InformationSignal) -> Optional[InformationSignal]:
        """Process macroeconomic signals"""
        
        # Macro signals affect all securities
        signal.weight *= 0.8
        signal.decay_rate *= 0.3
        
        return signal
    
    async def _process_generic(self, signal: InformationSignal) -> Optional[InformationSignal]:
        """Generic signal processing"""
        return signal
    
    async def _apply_temporal_decay(self, signal: InformationSignal) -> InformationSignal:
        """Apply temporal decay to signal strength"""
        
        time_elapsed = (datetime.now() - signal.timestamp).total_seconds() / 3600  # hours
        decay_factor = np.exp(-signal.decay_rate * time_elapsed)
        
        signal.confidence *= decay_factor
        signal.weight *= decay_factor
        
        return signal
    
    async def _validate_signal_quality(self, signal: InformationSignal) -> bool:
        """Validate signal meets quality thresholds"""
        
        quality_thresholds = {
            InformationQuality.HIGH: 0.7,
            InformationQuality.MEDIUM: 0.4,
            InformationQuality.LOW: 0.2,
            InformationQuality.NOISE: 0.0
        }
        
        threshold = quality_thresholds.get(signal.quality, 0.5)
        return signal.confidence >= threshold


class InformationAggregator:
    """Aggregate information from multiple sources using advanced techniques"""
    
    def __init__(self):
        self.aggregation_methods = {
            'weighted_average': self._weighted_average,
            'bayesian_fusion': self._bayesian_fusion,
            'dempster_shafer': self._dempster_shafer,
            'kalman_filter': self._kalman_filter
        }
    
    async def aggregate_information(self, signals: List[InformationSignal],
                                  participants: List[MarketParticipant]) -> Dict[str, Any]:
        """Aggregate information using multiple techniques"""
        
        # Group signals by type
        signal_groups = {}
        for signal in signals:
            signal_type = signal.signal_type
            if signal_type not in signal_groups:
                signal_groups[signal_type] = []
            signal_groups[signal_type].append(signal)
        
        # Apply different aggregation methods
        aggregation_results = {}
        
        for method_name, method_func in self.aggregation_methods.items():
            try:
                result = await method_func(signal_groups, participants)
                aggregation_results[method_name] = result
            except Exception as e:
                print(f"Aggregation method {method_name} failed: {e}")
                aggregation_results[method_name] = 0.0
        
        # Meta-aggregation of results
        final_aggregate = await self._meta_aggregate(aggregation_results)
        
        return {
            'aggregate_value': final_aggregate,
            'method_results': aggregation_results,
            'confidence': self._calculate_aggregate_confidence(signals),
            'consensus_strength': self._calculate_consensus_strength(signals)
        }
    
    async def _weighted_average(self, signal_groups: Dict, participants: List[MarketParticipant]) -> float:
        """Simple weighted average aggregation"""
        
        total_weighted_value = 0.0
        total_weight = 0.0
        
        for signal_type, signals in signal_groups.items():
            for signal in signals:
                weight = signal.weight * signal.confidence
                total_weighted_value += signal.value * weight
                total_weight += weight
        
        return total_weighted_value / total_weight if total_weight > 0 else 0.0
    
    async def _bayesian_fusion(self, signal_groups: Dict, participants: List[MarketParticipant]) -> float:
        """Bayesian information fusion"""
        
        # Prior belief (neutral)
        prior_mean = 0.0
        prior_variance = 1.0
        
        posterior_mean = prior_mean
        posterior_precision = 1.0 / prior_variance
        
        # Update with each signal
        for signal_type, signals in signal_groups.items():
            for signal in signals:
                # Signal precision based on confidence
                signal_precision = signal.confidence / (1 - signal.confidence + 1e-6)
                
                # Bayesian update
                posterior_precision += signal_precision
                posterior_mean = ((posterior_mean * (posterior_precision - signal_precision)) + 
                                (signal.value * signal_precision)) / posterior_precision
        
        return posterior_mean
    
    async def _dempster_shafer(self, signal_groups: Dict, participants: List[MarketParticipant]) -> float:
        """Dempster-Shafer evidence theory aggregation"""
        
        # Simplified D-S implementation
        # In practice, this would use proper mass functions
        
        belief_positive = 0.0
        belief_negative = 0.0
        uncertainty = 1.0
        
        for signal_type, signals in signal_groups.items():
            for signal in signals:
                evidence_strength = signal.confidence * signal.weight
                
                if signal.value > 0:
                    belief_positive += evidence_strength * signal.value
                else:
                    belief_negative += evidence_strength * abs(signal.value)
                
                uncertainty -= evidence_strength
        
        # Normalize
        total_belief = belief_positive + belief_negative + max(0, uncertainty)
        
        if total_belief > 0:
            net_belief = (belief_positive - belief_negative) / total_belief
        else:
            net_belief = 0.0
        
        return net_belief
    
    async def _kalman_filter(self, signal_groups: Dict, participants: List[MarketParticipant]) -> float:
        """Kalman filter for dynamic information aggregation"""
        
        # Simplified Kalman filter implementation
        # State: information value
        # Observation: new signals
        
        # Initialize state
        state_estimate = 0.0
        state_variance = 1.0
        
        # Process noise
        process_noise = 0.01
        
        for signal_type, signals in signal_groups.items():
            for signal in signals:
                # Predict
                predicted_state = state_estimate
                predicted_variance = state_variance + process_noise
                
                # Update with observation
                observation = signal.value
                observation_noise = 1.0 / (signal.confidence + 1e-6)
                
                # Kalman gain
                kalman_gain = predicted_variance / (predicted_variance + observation_noise)
                
                # Update state
                state_estimate = predicted_state + kalman_gain * (observation - predicted_state)
                state_variance = (1 - kalman_gain) * predicted_variance
        
        return state_estimate
    
    async def _meta_aggregate(self, aggregation_results: Dict[str, float]) -> float:
        """Meta-aggregation of different aggregation methods"""
        
        # Weight different methods
        method_weights = {
            'weighted_average': 0.3,
            'bayesian_fusion': 0.3,
            'dempster_shafer': 0.2,
            'kalman_filter': 0.2
        }
        
        weighted_sum = 0.0
        total_weight = 0.0
        
        for method, result in aggregation_results.items():
            weight = method_weights.get(method, 0.25)
            weighted_sum += result * weight
            total_weight += weight
        
        return weighted_sum / total_weight if total_weight > 0 else 0.0
    
    def _calculate_aggregate_confidence(self, signals: List[InformationSignal]) -> float:
        """Calculate overall confidence in aggregated information"""
        
        if not signals:
            return 0.0
        
        # Combine confidence using geometric mean
        confidence_product = 1.0
        for signal in signals:
            confidence_product *= signal.confidence
        
        aggregate_confidence = confidence_product ** (1.0 / len(signals))
        
        # Adjust for number of signals (more signals = higher confidence)
        diversity_bonus = min(0.2, len(signals) * 0.02)
        
        return min(1.0, aggregate_confidence + diversity_bonus)
    
    def _calculate_consensus_strength(self, signals: List[InformationSignal]) -> float:
        """Calculate strength of consensus among signals"""
        
        if len(signals) < 2:
            return 0.0
        
        # Calculate agreement among signals
        signal_values = [s.value for s in signals]
        signal_weights = [s.confidence * s.weight for s in signals]
        
        # Weighted variance
        weighted_mean = np.average(signal_values, weights=signal_weights)
        weighted_variance = np.average((signal_values - weighted_mean) ** 2, weights=signal_weights)
        
        # Consensus strength inversely related to variance
        consensus_strength = 1.0 / (1.0 + weighted_variance)
        
        return consensus_strength


class MarketConsensusBuilder:
    """Build market consensus from aggregated information"""
    
    def __init__(self):
        self.consensus_history: List[float] = []
        self.momentum_factor = 0.1
        
    async def build_consensus(self, aggregated_info: Dict, market_data: Dict) -> float:
        """Build market consensus price from aggregated information"""
        
        # Get current market price
        current_price = market_data.get('mid_price', 100.0)
        
        # Get aggregated information value
        info_value = aggregated_info.get('aggregate_value', 0.0)
        info_confidence = aggregated_info.get('confidence', 0.5)
        consensus_strength = aggregated_info.get('consensus_strength', 0.5)
        
        # Calculate information-driven price adjustment
        price_impact = info_value * info_confidence * consensus_strength
        
        # Apply momentum from previous consensus
        if self.consensus_history:
            momentum = np.mean(self.consensus_history[-5:])  # Last 5 periods
            price_impact += momentum * self.momentum_factor
        
        # Calculate consensus price
        consensus_price = current_price * (1 + price_impact)
        
        # Store consensus for momentum calculation
        self.consensus_history.append(price_impact)
        if len(self.consensus_history) > 100:
            self.consensus_history = self.consensus_history[-100:]
        
        return consensus_price


class PriceImputationEngine:
    """Advanced price imputation for missing or stale data"""
    
    def __init__(self):
        self.imputation_methods = {
            'linear_interpolation': self._linear_interpolation,
            'spline_interpolation': self._spline_interpolation,
            'kalman_imputation': self._kalman_imputation,
            'ml_imputation': self._ml_imputation
        }
    
    async def impute_missing_prices(self, price_series: List[float], 
                                  timestamps: List[datetime]) -> List[float]:
        """Impute missing prices using multiple methods"""
        
        # Identify missing values
        missing_indices = [i for i, price in enumerate(price_series) if np.isnan(price)]
        
        if not missing_indices:
            return price_series
        
        # Apply different imputation methods
        imputed_series = {}
        
        for method_name, method_func in self.imputation_methods.items():
            try:
                imputed_series[method_name] = await method_func(price_series, timestamps)
            except Exception as e:
                print(f"Imputation method {method_name} failed: {e}")
        
        # Ensemble imputation
        final_series = await self._ensemble_imputation(imputed_series, price_series)
        
        return final_series
    
    async def _linear_interpolation(self, prices: List[float], timestamps: List[datetime]) -> List[float]:
        """Linear interpolation imputation"""
        return pd.Series(prices).interpolate(method='linear').tolist()
    
    async def _spline_interpolation(self, prices: List[float], timestamps: List[datetime]) -> List[float]:
        """Spline interpolation imputation"""
        return pd.Series(prices).interpolate(method='spline', order=3).tolist()
    
    async def _kalman_imputation(self, prices: List[float], timestamps: List[datetime]) -> List[float]:
        """Kalman filter-based imputation"""
        # Simplified Kalman filter for price imputation
        imputed_prices = prices.copy()
        
        # Find non-missing values for initialization
        valid_indices = [i for i, p in enumerate(prices) if not np.isnan(p)]
        
        if len(valid_indices) < 2:
            return imputed_prices
        
        # Initialize with first valid price
        state = prices[valid_indices[0]]
        variance = 1.0
        
        for i in range(len(prices)):
            if np.isnan(prices[i]):
                # Predict (impute)
                imputed_prices[i] = state
                variance += 0.01  # Process noise
            else:
                # Update with observation
                kalman_gain = variance / (variance + 0.1)  # Observation noise
                state = state + kalman_gain * (prices[i] - state)
                variance = (1 - kalman_gain) * variance
                imputed_prices[i] = prices[i]
        
        return imputed_prices
    
    async def _ml_imputation(self, prices: List[float], timestamps: List[datetime]) -> List[float]:
        """Machine learning-based imputation"""
        # Placeholder for ML-based imputation
        # Would use techniques like autoencoder, LSTM, or other ML models
        return pd.Series(prices).fillna(method='bfill').fillna(method='ffill').tolist()
    
    async def _ensemble_imputation(self, imputed_series: Dict[str, List[float]], 
                                 original_prices: List[float]) -> List[float]:
        """Ensemble multiple imputation methods"""
        
        if not imputed_series:
            return original_prices
        
        ensemble_prices = []
        
        for i in range(len(original_prices)):
            if not np.isnan(original_prices[i]):
                # Use original price if available
                ensemble_prices.append(original_prices[i])
            else:
                # Average imputed values
                imputed_values = [series[i] for series in imputed_series.values() 
                                if i < len(series) and not np.isnan(series[i])]
                
                if imputed_values:
                    ensemble_prices.append(np.mean(imputed_values))
                else:
                    # Fallback to last known price
                    last_valid = next((original_prices[j] for j in range(i-1, -1, -1) 
                                     if not np.isnan(original_prices[j])), 100.0)
                    ensemble_prices.append(last_valid)
        
        return ensemble_prices


class MarketEfficiencyMonitor:
    """Monitor and measure market efficiency"""
    
    def __init__(self):
        self.efficiency_history: List[float] = []
        self.price_discovery_metrics = {}
        
    async def calculate_adjustment(self, price_components: Dict, market_data: Dict) -> float:
        """Calculate efficiency adjustment to price discovery"""
        
        # Measure current market efficiency
        efficiency_score = await self._measure_efficiency(market_data)
        
        # Calculate information incorporation speed
        incorporation_speed = await self._measure_incorporation_speed(market_data)
        
        # Detect anomalies and inefficiencies
        anomaly_score = await self._detect_price_anomalies(price_components, market_data)
        
        # Calculate adjustment based on efficiency metrics
        adjustment = 0.0
        
        # Adjust for low efficiency
        if efficiency_score < 0.7:
            adjustment -= (0.7 - efficiency_score) * 0.001  # Up to 10bps adjustment
        
        # Adjust for slow information incorporation
        if incorporation_speed < 0.5:
            adjustment += (0.5 - incorporation_speed) * 0.0005
        
        # Adjust for detected anomalies
        adjustment += anomaly_score * 0.001
        
        return adjustment
    
    async def _measure_efficiency(self, market_data: Dict) -> float:
        """Measure overall market efficiency"""
        
        # Efficiency indicators
        bid_ask_spread = market_data.get('bid_ask_spread', 0.001)
        order_book_depth = market_data.get('order_book_depth', 100000)
        trade_frequency = market_data.get('trade_frequency', 100)
        price_impact = market_data.get('average_price_impact', 0.001)
        
        # Normalize indicators (lower is better for spreads and impact)
        spread_score = max(0, 1 - bid_ask_spread * 1000)  # Normalize spread
        depth_score = min(1, order_book_depth / 1000000)  # Normalize depth
        frequency_score = min(1, trade_frequency / 1000)  # Normalize frequency
        impact_score = max(0, 1 - price_impact * 1000)   # Normalize impact
        
        # Weighted efficiency score
        efficiency = (spread_score * 0.3 + depth_score * 0.3 + 
                     frequency_score * 0.2 + impact_score * 0.2)
        
        self.efficiency_history.append(efficiency)
        if len(self.efficiency_history) > 100:
            self.efficiency_history = self.efficiency_history[-100:]
        
        return efficiency
    
    async def _measure_incorporation_speed(self, market_data: Dict) -> float:
        """Measure speed of information incorporation into prices"""
        
        # Get recent price movements and information events
        price_changes = market_data.get('price_changes', [])
        information_events = market_data.get('information_events', [])
        
        if not price_changes or not information_events:
            return 0.5  # Neutral score
        
        # Calculate time between information and price adjustment
        incorporation_times = []
        
        for event in information_events[-10:]:  # Last 10 events
            event_time = event.get('timestamp', datetime.now())
            
            # Find first significant price movement after event
            for i, change in enumerate(price_changes):
                change_time = change.get('timestamp', datetime.now())
                
                if change_time > event_time and abs(change.get('magnitude', 0)) > 0.001:
                    incorporation_time = (change_time - event_time).total_seconds()
                    incorporation_times.append(incorporation_time)
                    break
        
        if not incorporation_times:
            return 0.5
        
        # Speed score (faster = higher score)
        average_time = np.mean(incorporation_times)
        speed_score = 1 / (1 + average_time / 3600)  # Normalize by hour
        
        return speed_score
    
    async def _detect_price_anomalies(self, price_components: Dict, market_data: Dict) -> float:
        """Detect price anomalies and inefficiencies"""
        
        anomaly_score = 0.0
        
        # Check for excessive noise
        noise_ratio = abs(price_components.get('noise', 0)) / price_components.get('fundamental', 100)
        if noise_ratio > 0.05:  # More than 5% noise
            anomaly_score += noise_ratio * 0.5
        
        # Check for liquidity discounts exceeding reasonable levels
        liquidity_discount = price_components.get('liquidity_discount', 0)
        if liquidity_discount > 0.01:  # More than 1% discount
            anomaly_score += liquidity_discount * 10
        
        # Check for price-volume anomalies
        volume_ratio = market_data.get('volume_ratio', 1.0)
        price_volatility = market_data.get('volatility', 0.02)
        
        # High volatility with low volume suggests manipulation or inefficiency
        if price_volatility > 0.05 and volume_ratio < 0.5:
            anomaly_score += 0.1
        
        return min(1.0, anomaly_score)


# Usage example
async def main():
    # Initialize price discovery system
    pd_system = AdvancedPriceDiscovery("AAPL")
    
    # Market data
    market_data = {
        'mid_price': 150.0,
        'bid_ask_spread': 0.002,
        'order_book_depth': 500000,
        'trade_frequency': 150,
        'volatility': 0.025,
        'order_flow_imbalance': 0.1,
        'technical_score': 0.3,
        'sentiment_score': -0.2,
        'news_sentiment': 0.5,
        'volume_ratio': 0.8,
        'average_price_impact': 0.0005
    }
    
    # Discover price
    price_components = await pd_system.discover_price(market_data)
    
    print(f"Price Discovery Results:")
    print(f"Fundamental Value: ${price_components.fundamental_value:.4f}")
    print(f"Noise Component: ${price_components.noise_component:.4f}")
    print(f"Information Premium: ${price_components.information_premium:.4f}")
    print(f"Liquidity Discount: ${price_components.liquidity_discount:.4f}")
    print(f"Final Discovered Price: ${price_components.final_price:.4f}")

if __name__ == "__main__":
    asyncio.run(main())
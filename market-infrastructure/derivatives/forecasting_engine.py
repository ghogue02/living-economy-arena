"""
Advanced Economic Forecasting Engine - Phase 3 Market Complexity
Machine learning-based economic forecasting with multiple models and ensemble methods
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any, Union
from dataclasses import dataclass, field
from enum import Enum
import json
from abc import ABC, abstractmethod
from economic_indicators import EconomicIndicator, EconomicDataPoint

class ForecastModel(Enum):
    ARIMA = "arima"
    LSTM = "lstm"
    RANDOM_FOREST = "random_forest"
    SUPPORT_VECTOR = "support_vector"
    ENSEMBLE = "ensemble"
    BAYESIAN = "bayesian"
    PROPHET = "prophet"

class ForecastHorizon(Enum):
    SHORT_TERM = "short_term"  # 1-3 months
    MEDIUM_TERM = "medium_term"  # 3-12 months
    LONG_TERM = "long_term"  # 1-5 years

class ConfidenceLevel(Enum):
    HIGH = "high"  # >90%
    MEDIUM = "medium"  # 70-90%
    LOW = "low"  # 50-70%
    VERY_LOW = "very_low"  # <50%

@dataclass
class ForecastPoint:
    """Individual forecast point"""
    timestamp: datetime
    predicted_value: float
    confidence_interval_lower: float
    confidence_interval_upper: float
    confidence_level: float
    model_used: ForecastModel
    feature_importance: Dict[str, float] = field(default_factory=dict)

@dataclass
class ForecastResult:
    """Complete forecast result"""
    indicator_id: str
    forecast_date: datetime
    horizon: ForecastHorizon
    forecast_points: List[ForecastPoint]
    model_performance: Dict[str, float]
    assumptions: List[str]
    risk_factors: List[str]
    scenario_analysis: Dict[str, List[ForecastPoint]]

@dataclass
class ModelPerformance:
    """Model performance metrics"""
    model_type: ForecastModel
    mae: float  # Mean Absolute Error
    rmse: float  # Root Mean Square Error
    mape: float  # Mean Absolute Percentage Error
    accuracy: float  # Directional accuracy
    last_updated: datetime
    training_data_size: int

class BaseForecastModel(ABC):
    """Base class for all forecasting models"""
    
    def __init__(self, model_type: ForecastModel):
        self.model_type = model_type
        self.is_trained = False
        self.model_params: Dict[str, Any] = {}
        self.feature_names: List[str] = []
        self.performance: Optional[ModelPerformance] = None
    
    @abstractmethod
    def fit(self, data: List[EconomicDataPoint], features: Optional[Dict[str, List[float]]] = None):
        """Train the model on historical data"""
        pass
    
    @abstractmethod
    def predict(self, periods: int, confidence_level: float = 0.95) -> List[ForecastPoint]:
        """Generate predictions for specified periods"""
        pass
    
    @abstractmethod
    def validate(self, test_data: List[EconomicDataPoint]) -> ModelPerformance:
        """Validate model performance on test data"""
        pass

class ARIMAForecastModel(BaseForecastModel):
    """ARIMA-based forecasting model"""
    
    def __init__(self):
        super().__init__(ForecastModel.ARIMA)
        self.trend_component = 0.0
        self.seasonal_component = 0.0
        self.noise_variance = 0.0
        self.lag_coefficients: List[float] = []
    
    def fit(self, data: List[EconomicDataPoint], features: Optional[Dict[str, List[float]]] = None):
        """Fit ARIMA model to data"""
        if len(data) < 10:
            raise ValueError("Insufficient data for ARIMA fitting")
        
        values = [dp.value for dp in data]
        
        # Simple ARIMA estimation
        self.trend_component = self._estimate_trend(values)
        self.seasonal_component = self._estimate_seasonality(values)
        self.noise_variance = self._estimate_noise_variance(values)
        self.lag_coefficients = self._estimate_lag_coefficients(values)
        
        self.is_trained = True
        self.model_params = {
            'trend': self.trend_component,
            'seasonality': self.seasonal_component,
            'noise_variance': self.noise_variance,
            'lag_order': len(self.lag_coefficients)
        }
    
    def _estimate_trend(self, values: List[float]) -> float:
        """Estimate linear trend component"""
        x = np.arange(len(values))
        return np.polyfit(x, values, 1)[0]
    
    def _estimate_seasonality(self, values: List[float]) -> float:
        """Estimate seasonal component strength"""
        if len(values) < 24:
            return 0.0
        
        # Calculate seasonal correlations
        seasonal_lags = [3, 6, 12]  # Quarterly, semi-annual, annual
        correlations = []
        
        for lag in seasonal_lags:
            if len(values) > lag:
                corr = np.corrcoef(values[:-lag], values[lag:])[0, 1]
                correlations.append(abs(corr))
        
        return max(correlations) if correlations else 0.0
    
    def _estimate_noise_variance(self, values: List[float]) -> float:
        """Estimate noise variance"""
        detrended = values - np.polyval([self.trend_component, np.mean(values)], 
                                       np.arange(len(values)))
        return np.var(detrended)
    
    def _estimate_lag_coefficients(self, values: List[float], max_lags: int = 6) -> List[float]:
        """Estimate autoregressive coefficients"""
        if len(values) <= max_lags:
            return [0.5]  # Default coefficient
        
        coefficients = []
        for lag in range(1, min(max_lags + 1, len(values) - 1)):
            corr = np.corrcoef(values[:-lag], values[lag:])[0, 1]
            coefficients.append(max(-0.9, min(0.9, corr)))  # Bound coefficients
        
        return coefficients
    
    def predict(self, periods: int, confidence_level: float = 0.95) -> List[ForecastPoint]:
        """Generate ARIMA predictions"""
        if not self.is_trained:
            raise ValueError("Model must be trained before prediction")
        
        forecasts = []
        base_date = datetime.now()
        
        for i in range(1, periods + 1):
            # ARIMA prediction calculation
            trend_value = self.trend_component * i
            seasonal_value = self.seasonal_component * np.sin(2 * np.pi * i / 12)
            
            # AR component (simplified)
            ar_value = sum(
                coeff * 0.95**j for j, coeff in enumerate(self.lag_coefficients)
            ) if self.lag_coefficients else 0
            
            predicted_value = trend_value + seasonal_value + ar_value
            
            # Confidence interval
            std_error = np.sqrt(self.noise_variance * (1 + i * 0.1))  # Increasing uncertainty
            z_score = 1.96 if confidence_level == 0.95 else 2.58  # 95% or 99%
            
            lower_bound = predicted_value - z_score * std_error
            upper_bound = predicted_value + z_score * std_error
            
            forecast_point = ForecastPoint(
                timestamp=base_date + timedelta(days=30 * i),
                predicted_value=predicted_value,
                confidence_interval_lower=lower_bound,
                confidence_interval_upper=upper_bound,
                confidence_level=confidence_level,
                model_used=ForecastModel.ARIMA,
                feature_importance={'trend': 0.4, 'seasonality': 0.3, 'ar_component': 0.3}
            )
            
            forecasts.append(forecast_point)
        
        return forecasts
    
    def validate(self, test_data: List[EconomicDataPoint]) -> ModelPerformance:
        """Validate ARIMA model performance"""
        if not self.is_trained or len(test_data) < 3:
            return ModelPerformance(
                model_type=self.model_type,
                mae=float('inf'),
                rmse=float('inf'),
                mape=float('inf'),
                accuracy=0.0,
                last_updated=datetime.now(),
                training_data_size=0
            )
        
        predictions = self.predict(len(test_data))
        actual_values = [dp.value for dp in test_data]
        predicted_values = [fp.predicted_value for fp in predictions]
        
        # Calculate performance metrics
        mae = np.mean(np.abs(np.array(actual_values) - np.array(predicted_values)))
        rmse = np.sqrt(np.mean((np.array(actual_values) - np.array(predicted_values))**2))
        
        # MAPE calculation
        mape = np.mean(np.abs((np.array(actual_values) - np.array(predicted_values)) / 
                             np.array(actual_values))) * 100
        
        # Directional accuracy
        if len(actual_values) > 1:
            actual_directions = np.sign(np.diff(actual_values))
            predicted_directions = np.sign(np.diff(predicted_values))
            accuracy = np.mean(actual_directions == predicted_directions)
        else:
            accuracy = 0.0
        
        performance = ModelPerformance(
            model_type=self.model_type,
            mae=mae,
            rmse=rmse,
            mape=mape,
            accuracy=accuracy,
            last_updated=datetime.now(),
            training_data_size=len(test_data)
        )
        
        self.performance = performance
        return performance

class LSTMForecastModel(BaseForecastModel):
    """LSTM neural network forecasting model (simplified simulation)"""
    
    def __init__(self):
        super().__init__(ForecastModel.LSTM)
        self.sequence_length = 12  # Look-back window
        self.network_weights: Dict[str, np.ndarray] = {}
        self.scaler_params: Dict[str, float] = {}
    
    def fit(self, data: List[EconomicDataPoint], features: Optional[Dict[str, List[float]]] = None):
        """Fit LSTM model (simplified simulation)"""
        if len(data) < self.sequence_length * 2:
            raise ValueError("Insufficient data for LSTM fitting")
        
        values = np.array([dp.value for dp in data])
        
        # Normalize data
        self.scaler_params = {
            'mean': np.mean(values),
            'std': np.std(values)
        }
        
        normalized_values = (values - self.scaler_params['mean']) / self.scaler_params['std']
        
        # Simulate LSTM training (simplified)
        self.network_weights = {
            'lstm_weights': np.random.normal(0, 0.1, (self.sequence_length, 64)),
            'dense_weights': np.random.normal(0, 0.1, (64, 1)),
            'lstm_bias': np.random.normal(0, 0.01, 64),
            'dense_bias': np.random.normal(0, 0.01, 1)
        }
        
        self.is_trained = True
        self.model_params = {
            'sequence_length': self.sequence_length,
            'hidden_units': 64,
            'mean': self.scaler_params['mean'],
            'std': self.scaler_params['std']
        }
    
    def predict(self, periods: int, confidence_level: float = 0.95) -> List[ForecastPoint]:
        """Generate LSTM predictions (simplified simulation)"""
        if not self.is_trained:
            raise ValueError("Model must be trained before prediction")
        
        forecasts = []
        base_date = datetime.now()
        
        # Simulate LSTM predictions
        for i in range(1, periods + 1):
            # Simulate network forward pass
            base_prediction = np.tanh(i * 0.1) * self.scaler_params['std'] + self.scaler_params['mean']
            
            # Add some complexity based on sequence
            trend_factor = 1 + (i - periods/2) * 0.01
            noise_factor = np.random.normal(0, 0.02)
            
            predicted_value = base_prediction * trend_factor + noise_factor
            
            # Confidence interval (wider for longer horizons)
            uncertainty = self.scaler_params['std'] * 0.1 * np.sqrt(i)
            z_score = 1.96 if confidence_level == 0.95 else 2.58
            
            lower_bound = predicted_value - z_score * uncertainty
            upper_bound = predicted_value + z_score * uncertainty
            
            forecast_point = ForecastPoint(
                timestamp=base_date + timedelta(days=30 * i),
                predicted_value=predicted_value,
                confidence_interval_lower=lower_bound,
                confidence_interval_upper=upper_bound,
                confidence_level=confidence_level,
                model_used=ForecastModel.LSTM,
                feature_importance={'sequence_memory': 0.6, 'trend': 0.3, 'noise': 0.1}
            )
            
            forecasts.append(forecast_point)
        
        return forecasts
    
    def validate(self, test_data: List[EconomicDataPoint]) -> ModelPerformance:
        """Validate LSTM model performance"""
        if not self.is_trained or len(test_data) < 3:
            return ModelPerformance(
                model_type=self.model_type,
                mae=float('inf'),
                rmse=float('inf'),
                mape=float('inf'),
                accuracy=0.0,
                last_updated=datetime.now(),
                training_data_size=0
            )
        
        predictions = self.predict(len(test_data))
        actual_values = [dp.value for dp in test_data]
        predicted_values = [fp.predicted_value for fp in predictions]
        
        # Calculate performance metrics (similar to ARIMA)
        mae = np.mean(np.abs(np.array(actual_values) - np.array(predicted_values)))
        rmse = np.sqrt(np.mean((np.array(actual_values) - np.array(predicted_values))**2))
        mape = np.mean(np.abs((np.array(actual_values) - np.array(predicted_values)) / 
                             np.array(actual_values))) * 100
        
        if len(actual_values) > 1:
            actual_directions = np.sign(np.diff(actual_values))
            predicted_directions = np.sign(np.diff(predicted_values))
            accuracy = np.mean(actual_directions == predicted_directions)
        else:
            accuracy = 0.0
        
        performance = ModelPerformance(
            model_type=self.model_type,
            mae=mae,
            rmse=rmse,
            mape=mape,
            accuracy=accuracy,
            last_updated=datetime.now(),
            training_data_size=len(test_data)
        )
        
        self.performance = performance
        return performance

class EnsembleForecastModel(BaseForecastModel):
    """Ensemble model combining multiple forecasting approaches"""
    
    def __init__(self, models: List[BaseForecastModel], weights: Optional[List[float]] = None):
        super().__init__(ForecastModel.ENSEMBLE)
        self.component_models = models
        self.weights = weights or [1.0 / len(models)] * len(models)
        self.model_performances: List[ModelPerformance] = []
    
    def fit(self, data: List[EconomicDataPoint], features: Optional[Dict[str, List[float]]] = None):
        """Fit all component models"""
        for model in self.component_models:
            try:
                model.fit(data, features)
            except Exception as e:
                print(f"Warning: Failed to fit {model.model_type.value}: {e}")
        
        self.is_trained = True
        self.model_params = {
            'num_models': len(self.component_models),
            'weights': self.weights,
            'component_types': [m.model_type.value for m in self.component_models]
        }
    
    def predict(self, periods: int, confidence_level: float = 0.95) -> List[ForecastPoint]:
        """Generate ensemble predictions"""
        if not self.is_trained:
            raise ValueError("Model must be trained before prediction")
        
        # Get predictions from all models
        model_predictions = []
        for model in self.component_models:
            if model.is_trained:
                try:
                    predictions = model.predict(periods, confidence_level)
                    model_predictions.append(predictions)
                except Exception as e:
                    print(f"Warning: Prediction failed for {model.model_type.value}: {e}")
        
        if not model_predictions:
            raise ValueError("No models produced valid predictions")
        
        # Combine predictions
        ensemble_forecasts = []
        base_date = datetime.now()
        
        for i in range(periods):
            if i < len(model_predictions[0]):
                # Weighted average of predictions
                predicted_values = []
                lower_bounds = []
                upper_bounds = []
                
                for j, predictions in enumerate(model_predictions):
                    if i < len(predictions):
                        predicted_values.append(predictions[i].predicted_value)
                        lower_bounds.append(predictions[i].confidence_interval_lower)
                        upper_bounds.append(predictions[i].confidence_interval_upper)
                
                if predicted_values:
                    ensemble_prediction = np.average(predicted_values, weights=self.weights[:len(predicted_values)])
                    ensemble_lower = np.average(lower_bounds, weights=self.weights[:len(lower_bounds)])
                    ensemble_upper = np.average(upper_bounds, weights=self.weights[:len(upper_bounds)])
                    
                    # Calculate feature importance as average
                    feature_importance = {}
                    for predictions in model_predictions:
                        if i < len(predictions):
                            for feature, importance in predictions[i].feature_importance.items():
                                feature_importance[feature] = feature_importance.get(feature, 0) + importance
                    
                    for feature in feature_importance:
                        feature_importance[feature] /= len(model_predictions)
                    
                    forecast_point = ForecastPoint(
                        timestamp=base_date + timedelta(days=30 * (i + 1)),
                        predicted_value=ensemble_prediction,
                        confidence_interval_lower=ensemble_lower,
                        confidence_interval_upper=ensemble_upper,
                        confidence_level=confidence_level,
                        model_used=ForecastModel.ENSEMBLE,
                        feature_importance=feature_importance
                    )
                    
                    ensemble_forecasts.append(forecast_point)
        
        return ensemble_forecasts
    
    def validate(self, test_data: List[EconomicDataPoint]) -> ModelPerformance:
        """Validate ensemble model performance"""
        if not self.is_trained or len(test_data) < 3:
            return ModelPerformance(
                model_type=self.model_type,
                mae=float('inf'),
                rmse=float('inf'),
                mape=float('inf'),
                accuracy=0.0,
                last_updated=datetime.now(),
                training_data_size=0
            )
        
        # Validate component models
        self.model_performances = []
        for model in self.component_models:
            if model.is_trained:
                try:
                    performance = model.validate(test_data)
                    self.model_performances.append(performance)
                except Exception as e:
                    print(f"Warning: Validation failed for {model.model_type.value}: {e}")
        
        # Calculate ensemble performance
        predictions = self.predict(len(test_data))
        actual_values = [dp.value for dp in test_data]
        predicted_values = [fp.predicted_value for fp in predictions]
        
        mae = np.mean(np.abs(np.array(actual_values) - np.array(predicted_values)))
        rmse = np.sqrt(np.mean((np.array(actual_values) - np.array(predicted_values))**2))
        mape = np.mean(np.abs((np.array(actual_values) - np.array(predicted_values)) / 
                             np.array(actual_values))) * 100
        
        if len(actual_values) > 1:
            actual_directions = np.sign(np.diff(actual_values))
            predicted_directions = np.sign(np.diff(predicted_values))
            accuracy = np.mean(actual_directions == predicted_directions)
        else:
            accuracy = 0.0
        
        performance = ModelPerformance(
            model_type=self.model_type,
            mae=mae,
            rmse=rmse,
            mape=mape,
            accuracy=accuracy,
            last_updated=datetime.now(),
            training_data_size=len(test_data)
        )
        
        self.performance = performance
        return performance

class AdvancedForecastingEngine:
    """Advanced forecasting engine with multiple models and scenario analysis"""
    
    def __init__(self):
        self.models: Dict[str, BaseForecastModel] = {}
        self.forecasts: Dict[str, ForecastResult] = {}
        self.scenario_parameters: Dict[str, Dict[str, float]] = {}
        self.performance_history: List[ModelPerformance] = []
    
    def register_model(self, model_id: str, model: BaseForecastModel):
        """Register a forecasting model"""
        self.models[model_id] = model
    
    def create_ensemble_model(self, model_id: str, component_model_ids: List[str], 
                            weights: Optional[List[float]] = None):
        """Create ensemble from existing models"""
        component_models = [self.models[mid] for mid in component_model_ids if mid in self.models]
        
        if not component_models:
            raise ValueError("No valid component models found")
        
        ensemble = EnsembleForecastModel(component_models, weights)
        self.models[model_id] = ensemble
    
    def train_models(self, indicator: EconomicIndicator, 
                    test_split: float = 0.2, features: Optional[Dict[str, List[float]]] = None):
        """Train all registered models on indicator data"""
        if len(indicator.data_points) < 20:
            raise ValueError("Insufficient data for model training")
        
        # Split data
        total_points = len(indicator.data_points)
        split_index = int(total_points * (1 - test_split))
        
        train_data = indicator.data_points[:split_index]
        test_data = indicator.data_points[split_index:]
        
        # Train models
        for model_id, model in self.models.items():
            try:
                print(f"Training {model_id}...")
                model.fit(train_data, features)
                
                # Validate model
                performance = model.validate(test_data)
                self.performance_history.append(performance)
                
                print(f"  {model_id} - MAE: {performance.mae:.3f}, RMSE: {performance.rmse:.3f}, "
                      f"Accuracy: {performance.accuracy:.3f}")
                
            except Exception as e:
                print(f"Failed to train {model_id}: {e}")
    
    def generate_forecast(self, indicator_id: str, model_id: str, 
                         horizon: ForecastHorizon, periods: int,
                         confidence_level: float = 0.95) -> ForecastResult:
        """Generate forecast using specified model"""
        if model_id not in self.models:
            raise ValueError(f"Model {model_id} not found")
        
        model = self.models[model_id]
        if not model.is_trained:
            raise ValueError(f"Model {model_id} not trained")
        
        # Generate base forecast
        forecast_points = model.predict(periods, confidence_level)
        
        # Create scenario analysis
        scenarios = self._generate_scenarios(forecast_points)
        
        # Identify risk factors
        risk_factors = self._identify_risk_factors(forecast_points, horizon)
        
        # Create assumptions
        assumptions = self._generate_assumptions(model, horizon)
        
        forecast_result = ForecastResult(
            indicator_id=indicator_id,
            forecast_date=datetime.now(),
            horizon=horizon,
            forecast_points=forecast_points,
            model_performance=model.performance.__dict__ if model.performance else {},
            assumptions=assumptions,
            risk_factors=risk_factors,
            scenario_analysis=scenarios
        )
        
        self.forecasts[f"{indicator_id}_{model_id}"] = forecast_result
        return forecast_result
    
    def _generate_scenarios(self, base_forecast: List[ForecastPoint]) -> Dict[str, List[ForecastPoint]]:
        """Generate alternative scenarios"""
        scenarios = {}
        
        # Optimistic scenario (values 20% higher)
        optimistic = []
        for fp in base_forecast:
            optimistic_fp = ForecastPoint(
                timestamp=fp.timestamp,
                predicted_value=fp.predicted_value * 1.2,
                confidence_interval_lower=fp.confidence_interval_lower * 1.15,
                confidence_interval_upper=fp.confidence_interval_upper * 1.25,
                confidence_level=fp.confidence_level * 0.8,  # Lower confidence for extreme scenario
                model_used=fp.model_used,
                feature_importance=fp.feature_importance.copy()
            )
            optimistic.append(optimistic_fp)
        scenarios['optimistic'] = optimistic
        
        # Pessimistic scenario (values 20% lower)
        pessimistic = []
        for fp in base_forecast:
            pessimistic_fp = ForecastPoint(
                timestamp=fp.timestamp,
                predicted_value=fp.predicted_value * 0.8,
                confidence_interval_lower=fp.confidence_interval_lower * 0.75,
                confidence_interval_upper=fp.confidence_interval_upper * 0.85,
                confidence_level=fp.confidence_level * 0.8,
                model_used=fp.model_used,
                feature_importance=fp.feature_importance.copy()
            )
            pessimistic.append(pessimistic_fp)
        scenarios['pessimistic'] = pessimistic
        
        return scenarios
    
    def _identify_risk_factors(self, forecast_points: List[ForecastPoint], 
                             horizon: ForecastHorizon) -> List[str]:
        """Identify potential risk factors affecting forecast"""
        risk_factors = []
        
        # Analyze forecast uncertainty
        avg_confidence = np.mean([fp.confidence_level for fp in forecast_points])
        if avg_confidence < 0.7:
            risk_factors.append("Low model confidence in predictions")
        
        # Analyze trend volatility
        values = [fp.predicted_value for fp in forecast_points]
        if len(values) > 1:
            volatility = np.std(np.diff(values)) / np.mean(values)
            if volatility > 0.1:
                risk_factors.append("High forecast volatility")
        
        # Horizon-specific risks
        if horizon == ForecastHorizon.LONG_TERM:
            risk_factors.extend([
                "Structural economic changes",
                "Policy regime shifts",
                "Technological disruption"
            ])
        elif horizon == ForecastHorizon.MEDIUM_TERM:
            risk_factors.extend([
                "Business cycle fluctuations",
                "Monetary policy changes"
            ])
        else:  # SHORT_TERM
            risk_factors.extend([
                "Market sentiment shifts",
                "Data revisions"
            ])
        
        return risk_factors
    
    def _generate_assumptions(self, model: BaseForecastModel, 
                            horizon: ForecastHorizon) -> List[str]:
        """Generate key assumptions underlying the forecast"""
        assumptions = []
        
        # Model-specific assumptions
        if model.model_type == ForecastModel.ARIMA:
            assumptions.append("Historical patterns continue")
            assumptions.append("No structural breaks in time series")
        elif model.model_type == ForecastModel.LSTM:
            assumptions.append("Neural network captures complex patterns")
            assumptions.append("Sufficient training data available")
        elif model.model_type == ForecastModel.ENSEMBLE:
            assumptions.append("Combination of models improves accuracy")
            assumptions.append("Model diversity reduces prediction errors")
        
        # Horizon-specific assumptions
        if horizon == ForecastHorizon.LONG_TERM:
            assumptions.extend([
                "No major economic crises",
                "Gradual technological change",
                "Stable political environment"
            ])
        elif horizon == ForecastHorizon.MEDIUM_TERM:
            assumptions.extend([
                "Current economic cycle continues",
                "No major policy reversals"
            ])
        else:  # SHORT_TERM
            assumptions.extend([
                "Recent trends persist",
                "No major shocks or surprises"
            ])
        
        return assumptions
    
    def compare_model_performance(self) -> Dict[str, Any]:
        """Compare performance across all models"""
        if not self.performance_history:
            return {'status': 'no_performance_data'}
        
        # Group by model type
        model_performance = {}
        for performance in self.performance_history:
            model_type = performance.model_type.value
            if model_type not in model_performance:
                model_performance[model_type] = []
            model_performance[model_type].append(performance)
        
        # Calculate average performance metrics
        comparison = {}
        for model_type, performances in model_performance.items():
            comparison[model_type] = {
                'avg_mae': np.mean([p.mae for p in performances if not np.isinf(p.mae)]),
                'avg_rmse': np.mean([p.rmse for p in performances if not np.isinf(p.rmse)]),
                'avg_mape': np.mean([p.mape for p in performances if not np.isinf(p.mape)]),
                'avg_accuracy': np.mean([p.accuracy for p in performances]),
                'num_evaluations': len(performances)
            }
        
        # Identify best performing model
        valid_models = {k: v for k, v in comparison.items() if not np.isnan(v['avg_mae'])}
        if valid_models:
            best_model = min(valid_models.keys(), key=lambda x: valid_models[x]['avg_mae'])
            comparison['best_model'] = best_model
        
        return comparison
    
    def get_forecast_summary(self, forecast_key: str) -> Dict[str, Any]:
        """Get summary of forecast results"""
        if forecast_key not in self.forecasts:
            return {'error': 'Forecast not found'}
        
        forecast = self.forecasts[forecast_key]
        
        # Calculate summary statistics
        predicted_values = [fp.predicted_value for fp in forecast.forecast_points]
        
        summary = {
            'indicator_id': forecast.indicator_id,
            'forecast_date': forecast.forecast_date,
            'horizon': forecast.horizon.value,
            'num_periods': len(forecast.forecast_points),
            'predicted_trend': 'rising' if predicted_values[-1] > predicted_values[0] else 'falling',
            'avg_predicted_value': np.mean(predicted_values),
            'prediction_range': (min(predicted_values), max(predicted_values)),
            'avg_confidence': np.mean([fp.confidence_level for fp in forecast.forecast_points]),
            'num_risk_factors': len(forecast.risk_factors),
            'num_assumptions': len(forecast.assumptions),
            'model_performance': forecast.model_performance
        }
        
        return summary

# Example usage and testing
if __name__ == "__main__":
    print("Advanced Economic Forecasting Engine - Phase 3 Market Complexity")
    print("=" * 70)
    
    # Initialize forecasting engine
    forecasting_engine = AdvancedForecastingEngine()
    
    # Register models
    arima_model = ARIMAForecastModel()
    lstm_model = LSTMForecastModel()
    
    forecasting_engine.register_model("arima", arima_model)
    forecasting_engine.register_model("lstm", lstm_model)
    
    # Create ensemble model
    forecasting_engine.create_ensemble_model("ensemble", ["arima", "lstm"], [0.6, 0.4])
    
    # Create sample indicator with data
    from economic_indicators import UnemploymentIndicator
    unemployment = UnemploymentIndicator()
    
    # Add historical data
    for i in range(36):  # 3 years of monthly data
        date = datetime.now() - timedelta(days=30 * (36 - i))
        value = 4.0 + 0.5 * np.sin(i * 0.2) + np.random.normal(0, 0.3)
        data_point = EconomicDataPoint(
            indicator_id="unemployment_rate",
            value=max(0, value),  # Ensure non-negative
            timestamp=date,
            source="historical_data"
        )
        unemployment.add_data_point(data_point)
    
    print(f"Training models on {len(unemployment.data_points)} data points...")
    
    # Train models
    try:
        forecasting_engine.train_models(unemployment, test_split=0.2)
    except Exception as e:
        print(f"Training error: {e}")
    
    # Generate forecasts
    print("\\nGenerating forecasts...")
    
    try:
        # Short-term forecast
        short_forecast = forecasting_engine.generate_forecast(
            "unemployment_rate", "ensemble", ForecastHorizon.SHORT_TERM, 6
        )
        
        print(f"\\nShort-term Unemployment Forecast (6 months):")
        for i, fp in enumerate(short_forecast.forecast_points):
            print(f"  Month {i+1}: {fp.predicted_value:.2f}% "
                  f"[{fp.confidence_interval_lower:.2f}%, {fp.confidence_interval_upper:.2f}%]")
        
        # Display scenarios
        print("\\nScenario Analysis:")
        for scenario_name, scenario_points in short_forecast.scenario_analysis.items():
            avg_value = np.mean([sp.predicted_value for sp in scenario_points])
            print(f"  {scenario_name.title()}: {avg_value:.2f}% average")
        
        # Display risk factors
        print(f"\\nRisk Factors ({len(short_forecast.risk_factors)}):")
        for risk in short_forecast.risk_factors:
            print(f"  - {risk}")
        
        # Model performance comparison
        print("\\nModel Performance Comparison:")
        comparison = forecasting_engine.compare_model_performance()
        
        for model_type, metrics in comparison.items():
            if isinstance(metrics, dict) and 'avg_mae' in metrics:
                print(f"  {model_type}: MAE={metrics['avg_mae']:.3f}, "
                      f"RMSE={metrics['avg_rmse']:.3f}, "
                      f"Accuracy={metrics['avg_accuracy']:.3f}")
        
        if 'best_model' in comparison:
            print(f"\\nBest performing model: {comparison['best_model']}")
        
    except Exception as e:
        print(f"Forecasting error: {e}")
    
    print("\\nAdvanced Economic Forecasting Engine initialized successfully!")
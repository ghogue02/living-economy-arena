"""
Economic Indicator Systems - Phase 3 Market Complexity
Real-time economic metrics, leading/lagging indicators, and forecasting systems
"""

import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field
from enum import Enum
import asyncio
import json
from abc import ABC, abstractmethod

class IndicatorType(Enum):
    LEADING = "leading"
    LAGGING = "lagging"
    COINCIDENT = "coincident"
    COMPOSITE = "composite"

class EconomicSector(Enum):
    MANUFACTURING = "manufacturing"
    SERVICES = "services"
    CONSTRUCTION = "construction"
    AGRICULTURE = "agriculture"
    TECHNOLOGY = "technology"
    ENERGY = "energy"
    FINANCE = "finance"
    HEALTHCARE = "healthcare"
    RETAIL = "retail"

@dataclass
class EconomicDataPoint:
    """Individual economic data measurement"""
    indicator_id: str
    value: float
    timestamp: datetime
    source: str
    confidence: float = 1.0
    seasonal_adjusted: bool = False
    revision_number: int = 0
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class IndicatorMetadata:
    """Metadata for economic indicators"""
    name: str
    description: str
    category: str
    frequency: str  # daily, weekly, monthly, quarterly, annual
    unit: str
    source_agency: str
    calculation_method: str
    historical_range: Tuple[datetime, datetime]
    weight_in_composite: float = 0.0
    seasonal_pattern: bool = False

class EconomicIndicator(ABC):
    """Base class for all economic indicators"""
    
    def __init__(self, indicator_id: str, metadata: IndicatorMetadata):
        self.indicator_id = indicator_id
        self.metadata = metadata
        self.data_points: List[EconomicDataPoint] = []
        self.is_active = True
        
    @abstractmethod
    def calculate_value(self, raw_data: Dict[str, Any]) -> float:
        """Calculate indicator value from raw data"""
        pass
    
    @abstractmethod
    def validate_data(self, data_point: EconomicDataPoint) -> bool:
        """Validate data point for this indicator"""
        pass
    
    def add_data_point(self, data_point: EconomicDataPoint):
        """Add new data point to indicator"""
        if self.validate_data(data_point):
            self.data_points.append(data_point)
            self.data_points.sort(key=lambda x: x.timestamp)
    
    def get_latest_value(self) -> Optional[float]:
        """Get most recent indicator value"""
        if self.data_points:
            return self.data_points[-1].value
        return None
    
    def get_trend(self, periods: int = 12) -> str:
        """Calculate trend direction over specified periods"""
        if len(self.data_points) < periods:
            return "insufficient_data"
        
        recent_values = [dp.value for dp in self.data_points[-periods:]]
        trend_slope = np.polyfit(range(len(recent_values)), recent_values, 1)[0]
        
        if trend_slope > 0.01:
            return "rising"
        elif trend_slope < -0.01:
            return "falling"
        else:
            return "stable"

class GDPIndicator(EconomicIndicator):
    """Gross Domestic Product indicator"""
    
    def __init__(self):
        metadata = IndicatorMetadata(
            name="Gross Domestic Product",
            description="Total value of goods and services produced",
            category="output",
            frequency="quarterly",
            unit="billions_usd",
            source_agency="Bureau of Economic Analysis",
            calculation_method="expenditure_approach",
            historical_range=(datetime(1947, 1, 1), datetime.now())
        )
        super().__init__("gdp_total", metadata)
    
    def calculate_value(self, raw_data: Dict[str, Any]) -> float:
        """Calculate GDP from components"""
        consumption = raw_data.get('consumption', 0)
        investment = raw_data.get('investment', 0)
        government_spending = raw_data.get('government_spending', 0)
        net_exports = raw_data.get('exports', 0) - raw_data.get('imports', 0)
        
        return consumption + investment + government_spending + net_exports
    
    def validate_data(self, data_point: EconomicDataPoint) -> bool:
        """Validate GDP data point"""
        return (data_point.value > 0 and 
                data_point.confidence >= 0.5 and
                data_point.indicator_id == self.indicator_id)

class UnemploymentIndicator(EconomicIndicator):
    """Unemployment rate indicator"""
    
    def __init__(self):
        metadata = IndicatorMetadata(
            name="Unemployment Rate",
            description="Percentage of labor force that is unemployed",
            category="employment",
            frequency="monthly",
            unit="percentage",
            source_agency="Bureau of Labor Statistics",
            calculation_method="survey_based",
            historical_range=(datetime(1948, 1, 1), datetime.now())
        )
        super().__init__("unemployment_rate", metadata)
    
    def calculate_value(self, raw_data: Dict[str, Any]) -> float:
        """Calculate unemployment rate"""
        unemployed = raw_data.get('unemployed_persons', 0)
        labor_force = raw_data.get('labor_force', 1)
        
        return (unemployed / labor_force) * 100 if labor_force > 0 else 0
    
    def validate_data(self, data_point: EconomicDataPoint) -> bool:
        """Validate unemployment data"""
        return (0 <= data_point.value <= 100 and
                data_point.confidence >= 0.7)

class CPIIndicator(EconomicIndicator):
    """Consumer Price Index indicator"""
    
    def __init__(self):
        metadata = IndicatorMetadata(
            name="Consumer Price Index",
            description="Average change in prices paid by consumers",
            category="inflation",
            frequency="monthly",
            unit="index_value",
            source_agency="Bureau of Labor Statistics",
            calculation_method="weighted_average",
            historical_range=(datetime(1913, 1, 1), datetime.now())
        )
        super().__init__("cpi_all_items", metadata)
    
    def calculate_value(self, raw_data: Dict[str, Any]) -> float:
        """Calculate CPI from basket prices"""
        basket_items = raw_data.get('basket_items', {})
        weights = raw_data.get('weights', {})
        
        weighted_sum = sum(
            basket_items.get(item, 0) * weights.get(item, 0)
            for item in basket_items.keys()
        )
        
        return weighted_sum
    
    def validate_data(self, data_point: EconomicDataPoint) -> bool:
        """Validate CPI data"""
        return (data_point.value >= 0 and
                data_point.confidence >= 0.8)

class YieldCurveIndicator(EconomicIndicator):
    """Yield curve indicator for financial markets"""
    
    def __init__(self):
        metadata = IndicatorMetadata(
            name="Yield Curve Spread",
            description="Spread between 10-year and 2-year Treasury yields",
            category="financial",
            frequency="daily",
            unit="basis_points",
            source_agency="Federal Reserve",
            calculation_method="spread_calculation",
            historical_range=(datetime(1976, 1, 1), datetime.now())
        )
        super().__init__("yield_curve_10y2y", metadata)
    
    def calculate_value(self, raw_data: Dict[str, Any]) -> float:
        """Calculate yield curve spread"""
        yield_10y = raw_data.get('yield_10y', 0)
        yield_2y = raw_data.get('yield_2y', 0)
        
        return (yield_10y - yield_2y) * 100  # Convert to basis points
    
    def validate_data(self, data_point: EconomicDataPoint) -> bool:
        """Validate yield curve data"""
        return (-500 <= data_point.value <= 500 and  # Reasonable spread range
                data_point.confidence >= 0.9)

class CompositeEconomicIndex:
    """Composite index combining multiple indicators"""
    
    def __init__(self, index_id: str, name: str, components: List[Tuple[EconomicIndicator, float]]):
        self.index_id = index_id
        self.name = name
        self.components = components  # List of (indicator, weight) tuples
        self.history: List[Tuple[datetime, float]] = []
    
    def calculate_index_value(self, timestamp: datetime) -> Optional[float]:
        """Calculate composite index value at given timestamp"""
        weighted_sum = 0
        total_weight = 0
        
        for indicator, weight in self.components:
            # Find closest data point to timestamp
            closest_value = self._get_closest_value(indicator, timestamp)
            if closest_value is not None:
                weighted_sum += closest_value * weight
                total_weight += weight
        
        if total_weight > 0:
            index_value = weighted_sum / total_weight
            self.history.append((timestamp, index_value))
            return index_value
        
        return None
    
    def _get_closest_value(self, indicator: EconomicIndicator, timestamp: datetime) -> Optional[float]:
        """Get indicator value closest to timestamp"""
        if not indicator.data_points:
            return None
        
        closest_point = min(
            indicator.data_points,
            key=lambda dp: abs((dp.timestamp - timestamp).total_seconds())
        )
        
        # Only use if within reasonable time window
        time_diff = abs((closest_point.timestamp - timestamp).total_seconds())
        if time_diff <= 86400 * 30:  # Within 30 days
            return closest_point.value
        
        return None

class EconomicForecastingEngine:
    """Machine learning-based economic forecasting system"""
    
    def __init__(self):
        self.models: Dict[str, Any] = {}
        self.forecasts: Dict[str, List[Tuple[datetime, float, float]]] = {}  # (date, value, confidence)
    
    def train_model(self, indicator: EconomicIndicator, forecast_horizon: int = 12):
        """Train forecasting model for specific indicator"""
        if len(indicator.data_points) < 24:
            return False
        
        # Prepare training data
        values = [dp.value for dp in indicator.data_points]
        timestamps = [dp.timestamp for dp in indicator.data_points]
        
        # Simple ARIMA-style model simulation
        model_params = self._fit_arima_model(values)
        self.models[indicator.indicator_id] = {
            'type': 'arima',
            'params': model_params,
            'last_update': datetime.now(),
            'training_data_size': len(values)
        }
        
        return True
    
    def _fit_arima_model(self, values: List[float]) -> Dict[str, float]:
        """Simulate ARIMA model fitting"""
        # Calculate basic statistics for simple forecasting
        recent_values = values[-12:] if len(values) >= 12 else values
        trend = np.polyfit(range(len(recent_values)), recent_values, 1)[0]
        volatility = np.std(recent_values)
        mean_level = np.mean(recent_values)
        
        return {
            'trend': trend,
            'volatility': volatility,
            'mean_level': mean_level,
            'seasonality': self._detect_seasonality(values)
        }
    
    def _detect_seasonality(self, values: List[float]) -> float:
        """Simple seasonality detection"""
        if len(values) < 24:
            return 0.0
        
        # Calculate correlation with lagged values
        correlations = []
        for lag in [3, 6, 12]:  # Quarterly, semi-annual, annual
            if len(values) > lag:
                corr = np.corrcoef(values[:-lag], values[lag:])[0, 1]
                correlations.append(abs(corr))
        
        return max(correlations) if correlations else 0.0
    
    def generate_forecast(self, indicator_id: str, periods: int = 6) -> List[Tuple[datetime, float, float]]:
        """Generate forecast for indicator"""
        if indicator_id not in self.models:
            return []
        
        model = self.models[indicator_id]
        params = model['params']
        
        forecasts = []
        base_date = datetime.now()
        
        for i in range(1, periods + 1):
            # Simple forecast calculation
            forecast_value = (
                params['mean_level'] + 
                params['trend'] * i +
                np.random.normal(0, params['volatility'] * 0.1)
            )
            
            # Calculate confidence (decreases with distance)
            confidence = max(0.5, 1.0 - (i * 0.1))
            
            forecast_date = base_date + timedelta(days=30 * i)
            forecasts.append((forecast_date, forecast_value, confidence))
        
        self.forecasts[indicator_id] = forecasts
        return forecasts

class EconomicAlertSystem:
    """System for monitoring and alerting on economic changes"""
    
    def __init__(self):
        self.alert_rules: List[Dict[str, Any]] = []
        self.active_alerts: List[Dict[str, Any]] = []
        self.alert_history: List[Dict[str, Any]] = []
    
    def add_alert_rule(self, rule: Dict[str, Any]):
        """Add new alert rule"""
        required_fields = ['rule_id', 'indicator_id', 'condition', 'threshold']
        if all(field in rule for field in required_fields):
            self.alert_rules.append(rule)
    
    def check_alerts(self, indicators: List[EconomicIndicator]):
        """Check all indicators against alert rules"""
        new_alerts = []
        
        for rule in self.alert_rules:
            indicator = next(
                (ind for ind in indicators if ind.indicator_id == rule['indicator_id']), 
                None
            )
            
            if indicator and self._evaluate_condition(indicator, rule):
                alert = self._create_alert(indicator, rule)
                new_alerts.append(alert)
                self.active_alerts.append(alert)
        
        return new_alerts
    
    def _evaluate_condition(self, indicator: EconomicIndicator, rule: Dict[str, Any]) -> bool:
        """Evaluate if indicator meets alert condition"""
        latest_value = indicator.get_latest_value()
        if latest_value is None:
            return False
        
        condition = rule['condition']
        threshold = rule['threshold']
        
        if condition == 'above':
            return latest_value > threshold
        elif condition == 'below':
            return latest_value < threshold
        elif condition == 'change_above':
            if len(indicator.data_points) >= 2:
                prev_value = indicator.data_points[-2].value
                change = abs(latest_value - prev_value) / prev_value
                return change > threshold
        
        return False
    
    def _create_alert(self, indicator: EconomicIndicator, rule: Dict[str, Any]) -> Dict[str, Any]:
        """Create alert object"""
        return {
            'alert_id': f"alert_{datetime.now().timestamp()}",
            'rule_id': rule['rule_id'],
            'indicator_id': indicator.indicator_id,
            'indicator_name': indicator.metadata.name,
            'current_value': indicator.get_latest_value(),
            'threshold': rule['threshold'],
            'condition': rule['condition'],
            'severity': rule.get('severity', 'medium'),
            'timestamp': datetime.now(),
            'message': rule.get('message', f"Alert triggered for {indicator.metadata.name}")
        }

class PolicyImpactAnalyzer:
    """Analyze economic impact of policy changes"""
    
    def __init__(self):
        self.policy_events: List[Dict[str, Any]] = []
        self.impact_analyses: List[Dict[str, Any]] = []
    
    def register_policy_event(self, event: Dict[str, Any]):
        """Register a policy change event"""
        required_fields = ['event_id', 'policy_type', 'announcement_date', 'implementation_date']
        if all(field in event for field in required_fields):
            self.policy_events.append(event)
    
    def analyze_policy_impact(self, event_id: str, indicators: List[EconomicIndicator], 
                            analysis_window: int = 90) -> Dict[str, Any]:
        """Analyze impact of specific policy on economic indicators"""
        event = next((e for e in self.policy_events if e['event_id'] == event_id), None)
        if not event:
            return {}
        
        implementation_date = event['implementation_date']
        results = {}
        
        for indicator in indicators:
            impact = self._calculate_indicator_impact(
                indicator, implementation_date, analysis_window
            )
            results[indicator.indicator_id] = impact
        
        analysis = {
            'event_id': event_id,
            'analysis_date': datetime.now(),
            'policy_type': event['policy_type'],
            'implementation_date': implementation_date,
            'indicator_impacts': results,
            'overall_assessment': self._assess_overall_impact(results)
        }
        
        self.impact_analyses.append(analysis)
        return analysis
    
    def _calculate_indicator_impact(self, indicator: EconomicIndicator, 
                                  policy_date: datetime, window_days: int) -> Dict[str, Any]:
        """Calculate impact on specific indicator"""
        # Get data before and after policy implementation
        before_date = policy_date - timedelta(days=window_days)
        after_date = policy_date + timedelta(days=window_days)
        
        before_data = [
            dp.value for dp in indicator.data_points
            if before_date <= dp.timestamp < policy_date
        ]
        
        after_data = [
            dp.value for dp in indicator.data_points
            if policy_date <= dp.timestamp <= after_date
        ]
        
        if len(before_data) < 3 or len(after_data) < 3:
            return {'impact': 'insufficient_data'}
        
        before_mean = np.mean(before_data)
        after_mean = np.mean(after_data)
        
        # Calculate percentage change
        if before_mean != 0:
            percentage_change = ((after_mean - before_mean) / abs(before_mean)) * 100
        else:
            percentage_change = 0
        
        # Statistical significance test (simplified)
        before_std = np.std(before_data)
        after_std = np.std(after_data)
        combined_std = np.sqrt((before_std**2 + after_std**2) / 2)
        
        if combined_std > 0:
            t_statistic = abs(after_mean - before_mean) / combined_std
            is_significant = t_statistic > 2.0  # Simplified significance test
        else:
            is_significant = False
        
        return {
            'before_mean': before_mean,
            'after_mean': after_mean,
            'percentage_change': percentage_change,
            'is_significant': is_significant,
            'confidence': min(len(before_data), len(after_data)) / 10.0,
            'impact_magnitude': 'high' if abs(percentage_change) > 5 else 'medium' if abs(percentage_change) > 2 else 'low'
        }
    
    def _assess_overall_impact(self, indicator_impacts: Dict[str, Any]) -> str:
        """Assess overall policy impact across all indicators"""
        significant_impacts = sum(
            1 for impact in indicator_impacts.values()
            if isinstance(impact, dict) and impact.get('is_significant', False)
        )
        
        total_indicators = len(indicator_impacts)
        
        if significant_impacts >= total_indicators * 0.7:
            return 'high_impact'
        elif significant_impacts >= total_indicators * 0.3:
            return 'medium_impact'
        else:
            return 'low_impact'

# Example usage and testing
if __name__ == "__main__":
    print("Economic Indicator Systems - Phase 3 Market Complexity")
    print("=" * 60)
    
    # Create sample indicators
    gdp = GDPIndicator()
    unemployment = UnemploymentIndicator()
    cpi = CPIIndicator()
    yield_curve = YieldCurveIndicator()
    
    # Add sample data points
    sample_data = [
        (gdp, {'consumption': 15000, 'investment': 3000, 'government_spending': 3500, 'exports': 2000, 'imports': 2200}),
        (unemployment, {'unemployed_persons': 6500000, 'labor_force': 165000000}),
        (cpi, {'basket_items': {'food': 105.2, 'housing': 103.8, 'transportation': 108.1}, 'weights': {'food': 0.3, 'housing': 0.4, 'transportation': 0.3}}),
        (yield_curve, {'yield_10y': 2.85, 'yield_2y': 2.45})
    ]
    
    for indicator, raw_data in sample_data:
        value = indicator.calculate_value(raw_data)
        data_point = EconomicDataPoint(
            indicator_id=indicator.indicator_id,
            value=value,
            timestamp=datetime.now(),
            source="sample_data",
            confidence=0.9
        )
        indicator.add_data_point(data_point)
        print(f"{indicator.metadata.name}: {value:.2f} {indicator.metadata.unit}")
    
    # Create composite index
    leading_index = CompositeEconomicIndex(
        "leading_economic_index",
        "Leading Economic Index",
        [(yield_curve, 0.3), (unemployment, -0.4), (gdp, 0.3)]  # Unemployment inversely weighted
    )
    
    index_value = leading_index.calculate_index_value(datetime.now())
    print(f"\nLeading Economic Index: {index_value:.2f}")
    
    # Test forecasting
    forecasting_engine = EconomicForecastingEngine()
    
    # Add more sample data for forecasting
    for i in range(24):
        date = datetime.now() - timedelta(days=30 * i)
        value = 3.5 + 0.1 * np.sin(i * 0.5) + np.random.normal(0, 0.2)
        data_point = EconomicDataPoint(
            indicator_id=unemployment.indicator_id,
            value=value,
            timestamp=date,
            source="historical_data"
        )
        unemployment.add_data_point(data_point)
    
    forecasting_engine.train_model(unemployment)
    forecasts = forecasting_engine.generate_forecast(unemployment.indicator_id, 6)
    
    print(f"\nUnemployment Rate Forecasts:")
    for date, value, confidence in forecasts:
        print(f"  {date.strftime('%Y-%m')}: {value:.2f}% (confidence: {confidence:.2f})")
    
    # Test alert system
    alert_system = EconomicAlertSystem()
    alert_system.add_alert_rule({
        'rule_id': 'unemployment_spike',
        'indicator_id': 'unemployment_rate',
        'condition': 'above',
        'threshold': 5.0,
        'severity': 'high',
        'message': 'Unemployment rate above 5%'
    })
    
    alerts = alert_system.check_alerts([unemployment])
    if alerts:
        print(f"\nActive Alerts: {len(alerts)}")
        for alert in alerts:
            print(f"  {alert['message']} - Current: {alert['current_value']:.2f}%")
    
    print("\nEconomic Indicator Systems initialized successfully!")
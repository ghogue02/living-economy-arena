"""
Comprehensive Test Suite for Economic Indicator Systems - Phase 3 Market Complexity
Tests for real-time metrics, forecasting, and international comparisons
"""

import unittest
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional

# Import all economic indicator modules
from economic_indicators import (
    EconomicIndicator, EconomicDataPoint, IndicatorMetadata,
    GDPIndicator, UnemploymentIndicator, CPIIndicator, YieldCurveIndicator,
    CompositeEconomicIndex, EconomicForecastingEngine, EconomicAlertSystem,
    PolicyImpactAnalyzer
)
from sector_indicators import (
    ManufacturingIndicators, ServicesIndicators, TechnologyIndicators,
    SectorAnalysisEngine, SectorMetrics, EconomicSector, SectorHealthStatus
)
from international_indicators import (
    GlobalEconomicIndicator, GlobalGDPIndicator, GlobalInflationIndicator,
    InternationalComparisonEngine, Country, Currency, CountryProfile
)
from forecasting_engine import (
    ARIMAForecastModel, LSTMForecastModel, EnsembleForecastModel,
    AdvancedForecastingEngine, ForecastHorizon, ForecastPoint
)

class TestEconomicIndicators(unittest.TestCase):
    """Test core economic indicator functionality"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.gdp_indicator = GDPIndicator()
        self.unemployment_indicator = UnemploymentIndicator()
        self.cpi_indicator = CPIIndicator()
        self.yield_curve_indicator = YieldCurveIndicator()
    
    def test_gdp_calculation(self):
        """Test GDP calculation from components"""
        raw_data = {
            'consumption': 15000,
            'investment': 3000,
            'government_spending': 3500,
            'exports': 2000,
            'imports': 2200
        }
        
        expected_gdp = 15000 + 3000 + 3500 + (2000 - 2200)
        calculated_gdp = self.gdp_indicator.calculate_value(raw_data)
        
        self.assertEqual(calculated_gdp, expected_gdp)
        self.assertGreater(calculated_gdp, 0)
    
    def test_unemployment_calculation(self):
        """Test unemployment rate calculation"""
        raw_data = {
            'unemployed_persons': 6500000,
            'labor_force': 165000000
        }
        
        expected_rate = (6500000 / 165000000) * 100
        calculated_rate = self.unemployment_indicator.calculate_value(raw_data)
        
        self.assertAlmostEqual(calculated_rate, expected_rate, places=4)
        self.assertTrue(0 <= calculated_rate <= 100)
    
    def test_cpi_calculation(self):
        """Test CPI calculation from basket items"""
        raw_data = {
            'basket_items': {'food': 105.2, 'housing': 103.8, 'transportation': 108.1},
            'weights': {'food': 0.3, 'housing': 0.4, 'transportation': 0.3}
        }
        
        expected_cpi = (105.2 * 0.3) + (103.8 * 0.4) + (108.1 * 0.3)
        calculated_cpi = self.cpi_indicator.calculate_value(raw_data)
        
        self.assertAlmostEqual(calculated_cpi, expected_cpi, places=2)
    
    def test_yield_curve_calculation(self):
        """Test yield curve spread calculation"""
        raw_data = {
            'yield_10y': 2.85,
            'yield_2y': 2.45
        }
        
        expected_spread = (2.85 - 2.45) * 100  # In basis points
        calculated_spread = self.yield_curve_indicator.calculate_value(raw_data)
        
        self.assertAlmostEqual(calculated_spread, expected_spread, places=1)
    
    def test_data_point_validation(self):
        """Test data point validation"""
        valid_gdp_data = EconomicDataPoint(
            indicator_id="gdp_total",
            value=21000,
            timestamp=datetime.now(),
            source="test",
            confidence=0.9
        )
        
        invalid_gdp_data = EconomicDataPoint(
            indicator_id="gdp_total",
            value=-5000,  # Negative GDP invalid
            timestamp=datetime.now(),
            source="test",
            confidence=0.9
        )
        
        self.assertTrue(self.gdp_indicator.validate_data(valid_gdp_data))
        self.assertFalse(self.gdp_indicator.validate_data(invalid_gdp_data))
    
    def test_trend_calculation(self):
        """Test trend calculation from historical data"""
        # Add sample data points with upward trend
        for i in range(12):
            data_point = EconomicDataPoint(
                indicator_id="gdp_total",
                value=20000 + i * 200,  # Increasing trend
                timestamp=datetime.now() - timedelta(days=30 * (12 - i)),
                source="test"
            )
            self.gdp_indicator.add_data_point(data_point)
        
        trend = self.gdp_indicator.get_trend(periods=12)
        self.assertEqual(trend, "rising")
    
    def test_composite_index(self):
        """Test composite economic index calculation"""
        # Add data to component indicators
        gdp_data = EconomicDataPoint(
            indicator_id="gdp_total",
            value=21000,
            timestamp=datetime.now(),
            source="test"
        )
        self.gdp_indicator.add_data_point(gdp_data)
        
        unemployment_data = EconomicDataPoint(
            indicator_id="unemployment_rate",
            value=3.5,
            timestamp=datetime.now(),
            source="test"
        )
        self.unemployment_indicator.add_data_point(unemployment_data)
        
        # Create composite index
        composite = CompositeEconomicIndex(
            "test_index",
            "Test Economic Index",
            [(self.gdp_indicator, 0.6), (self.unemployment_indicator, -0.4)]
        )
        
        index_value = composite.calculate_index_value(datetime.now())
        self.assertIsNotNone(index_value)
        self.assertGreater(index_value, 0)

class TestSectorIndicators(unittest.TestCase):
    """Test sector-specific indicator functionality"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.manufacturing = ManufacturingIndicators()
        self.services = ServicesIndicators()
        self.technology = TechnologyIndicators()
        self.sector_engine = SectorAnalysisEngine()
    
    def test_manufacturing_pmi(self):
        """Test manufacturing PMI calculation"""
        sample_data = {
            'new_orders': 55.2,
            'production': 52.8,
            'employment': 51.5,
            'supplier_deliveries': 48.9,
            'inventories': 47.3
        }
        
        pmi_value = self.manufacturing.pmi_indicator.calculate_value(sample_data)
        
        # PMI should be weighted average
        expected_pmi = (55.2 * 0.3) + (52.8 * 0.25) + (51.5 * 0.2) + (48.9 * 0.15) + (47.3 * 0.1)
        self.assertAlmostEqual(pmi_value, expected_pmi, places=1)
        self.assertTrue(0 <= pmi_value <= 100)
    
    def test_services_pmi(self):
        """Test services PMI calculation"""
        sample_data = {
            'business_activity': 58.4,
            'new_orders': 56.7,
            'employment': 54.2,
            'prices': 62.1,
            'business_expectations': 59.8
        }
        
        pmi_value = self.services.services_pmi.calculate_value(sample_data)
        self.assertTrue(0 <= pmi_value <= 100)
        self.assertGreater(pmi_value, 50)  # Indicates expansion
    
    def test_technology_innovation_index(self):
        """Test technology innovation index calculation"""
        sample_data = {
            'patent_applications': 15000,
            'rd_spending': 500000000,  # $500M
            'tech_startups': 1200
        }
        
        innovation_value = self.technology.innovation_index.calculate_value(sample_data)
        self.assertTrue(0 <= innovation_value <= 100)
        self.assertGreater(innovation_value, 0)
    
    def test_sector_health_calculation(self):
        """Test sector health metrics calculation"""
        # Add sample data to manufacturing indicators
        pmi_data = EconomicDataPoint(
            indicator_id="manufacturing_pmi",
            value=55.0,
            timestamp=datetime.now(),
            source="test"
        )
        self.manufacturing.pmi_indicator.add_data_point(pmi_data)
        
        metrics = self.sector_engine.calculate_sector_health(EconomicSector.MANUFACTURING)
        
        self.assertIsInstance(metrics, SectorMetrics)
        self.assertEqual(metrics.sector, EconomicSector.MANUFACTURING)
        self.assertIsInstance(metrics.health_status, SectorHealthStatus)
        self.assertIn(metrics.trend_direction, ["rising", "falling", "stable", "unknown"])
    
    def test_sector_rankings(self):
        """Test sector ranking functionality"""
        rankings = self.sector_engine.rank_sectors()
        
        self.assertIsInstance(rankings, list)
        self.assertTrue(all(isinstance(item, tuple) and len(item) == 2 for item in rankings))
        
        # Rankings should be in descending order
        if len(rankings) > 1:
            for i in range(len(rankings) - 1):
                self.assertGreaterEqual(rankings[i][1], rankings[i + 1][1])

class TestInternationalIndicators(unittest.TestCase):
    """Test international comparison functionality"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.comparison_engine = InternationalComparisonEngine()
        self.global_gdp = GlobalGDPIndicator()
        self.global_inflation = GlobalInflationIndicator()
    
    def test_country_profile_initialization(self):
        """Test country profile creation"""
        profile_data = {
            'currency': 'USD',
            'development_level': 'developed',
            'gdp_nominal': 26900,
            'gdp_per_capita': 80000,
            'population': 331000000,
            'land_area': 9834000,
            'primary_exports': ['technology', 'aircraft'],
            'trade_partners': [Country.CHINA, Country.CANADA]
        }
        
        self.comparison_engine.initialize_country_profile(Country.USA, profile_data)
        
        self.assertIn(Country.USA, self.comparison_engine.country_profiles)
        profile = self.comparison_engine.country_profiles[Country.USA]
        self.assertEqual(profile.currency, Currency.USD)
        self.assertEqual(profile.gdp_nominal, 26900)
    
    def test_global_indicator_data(self):
        """Test adding country data to global indicators"""
        gdp_data = EconomicDataPoint(
            indicator_id="global_gdp",
            value=26900,
            timestamp=datetime.now(),
            source="test"
        )
        
        self.global_gdp.add_country_data(Country.USA, gdp_data)
        
        latest_value = self.global_gdp.get_country_latest_value(Country.USA)
        self.assertEqual(latest_value, 26900)
    
    def test_international_comparison(self):
        """Test international economic comparison"""
        # Add sample data for multiple countries
        countries_data = {
            Country.USA: 26900,
            Country.CHINA: 17900,
            Country.GERMANY: 4300
        }
        
        for country, gdp_value in countries_data.items():
            data_point = EconomicDataPoint(
                indicator_id="global_gdp",
                value=gdp_value,
                timestamp=datetime.now(),
                source="test"
            )
            self.global_gdp.add_country_data(country, data_point)
        
        # Register indicator with comparison engine
        self.comparison_engine.global_indicators['gdp'] = self.global_gdp
        
        comparison = self.comparison_engine.compare_indicator_globally(
            'gdp', list(countries_data.keys())
        )
        
        self.assertEqual(len(comparison.country_values), 3)
        self.assertEqual(len(comparison.rankings), 3)
        
        # Check rankings are correct (USA should be first)
        first_country, first_value, first_rank = comparison.rankings[0]
        self.assertEqual(first_country, Country.USA)
        self.assertEqual(first_rank, 1)
    
    def test_economic_similarity(self):
        """Test economic similarity calculation"""
        # Initialize profiles for comparison
        usa_data = {
            'currency': 'USD',
            'development_level': 'developed',
            'gdp_per_capita': 80000,
            'trade_partners': [Country.CHINA, Country.CANADA]
        }
        
        germany_data = {
            'currency': 'EUR',
            'development_level': 'developed',
            'gdp_per_capita': 51000,
            'trade_partners': [Country.CHINA, Country.FRANCE]
        }
        
        self.comparison_engine.initialize_country_profile(Country.USA, usa_data)
        self.comparison_engine.initialize_country_profile(Country.GERMANY, germany_data)
        
        similarity = self.comparison_engine.calculate_economic_similarity(
            Country.USA, Country.GERMANY
        )
        
        self.assertTrue(0 <= similarity <= 1)
        self.assertGreater(similarity, 0.5)  # Should be similar (both developed)

class TestForecastingEngine(unittest.TestCase):
    """Test advanced forecasting functionality"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.arima_model = ARIMAForecastModel()
        self.lstm_model = LSTMForecastModel()
        self.forecasting_engine = AdvancedForecastingEngine()
        
        # Create sample indicator with data
        self.unemployment = UnemploymentIndicator()
        for i in range(24):  # 2 years of data
            date = datetime.now() - timedelta(days=30 * (24 - i))
            value = 4.0 + 0.5 * np.sin(i * 0.2) + np.random.normal(0, 0.2)
            data_point = EconomicDataPoint(
                indicator_id="unemployment_rate",
                value=max(0, value),
                timestamp=date,
                source="test"
            )
            self.unemployment.add_data_point(data_point)
    
    def test_arima_model_fitting(self):
        """Test ARIMA model training"""
        self.arima_model.fit(self.unemployment.data_points)
        
        self.assertTrue(self.arima_model.is_trained)
        self.assertIsNotNone(self.arima_model.trend_component)
        self.assertIsNotNone(self.arima_model.seasonal_component)
        self.assertGreater(self.arima_model.noise_variance, 0)
    
    def test_arima_prediction(self):
        """Test ARIMA model prediction"""
        self.arima_model.fit(self.unemployment.data_points)
        predictions = self.arima_model.predict(6)
        
        self.assertEqual(len(predictions), 6)
        
        for prediction in predictions:
            self.assertIsInstance(prediction, ForecastPoint)
            self.assertGreater(prediction.predicted_value, 0)
            self.assertLess(prediction.confidence_interval_lower, prediction.predicted_value)
            self.assertGreater(prediction.confidence_interval_upper, prediction.predicted_value)
    
    def test_lstm_model_fitting(self):
        """Test LSTM model training"""
        self.lstm_model.fit(self.unemployment.data_points)
        
        self.assertTrue(self.lstm_model.is_trained)
        self.assertIn('mean', self.lstm_model.scaler_params)
        self.assertIn('std', self.lstm_model.scaler_params)
    
    def test_ensemble_model(self):
        """Test ensemble model functionality"""
        # Train component models
        self.arima_model.fit(self.unemployment.data_points)
        self.lstm_model.fit(self.unemployment.data_points)
        
        # Create ensemble
        ensemble = EnsembleForecastModel([self.arima_model, self.lstm_model], [0.6, 0.4])
        ensemble.fit(self.unemployment.data_points)
        
        predictions = ensemble.predict(6)
        
        self.assertEqual(len(predictions), 6)
        self.assertTrue(ensemble.is_trained)
        
        # Ensemble predictions should exist
        for prediction in predictions:
            self.assertIsInstance(prediction, ForecastPoint)
            self.assertGreater(prediction.predicted_value, 0)
    
    def test_model_validation(self):
        """Test model validation functionality"""
        # Split data for validation
        train_data = self.unemployment.data_points[:18]
        test_data = self.unemployment.data_points[18:]
        
        # Train and validate ARIMA
        arima_trained = ARIMAForecastModel()
        arima_trained.fit(train_data)
        performance = arima_trained.validate(test_data)
        
        self.assertIsNotNone(performance.mae)
        self.assertIsNotNone(performance.rmse)
        self.assertIsNotNone(performance.mape)
        self.assertTrue(0 <= performance.accuracy <= 1)
    
    def test_forecasting_engine_integration(self):
        """Test full forecasting engine functionality"""
        # Register models
        self.forecasting_engine.register_model("arima", self.arima_model)
        self.forecasting_engine.register_model("lstm", self.lstm_model)
        
        # Train models
        self.forecasting_engine.train_models(self.unemployment, test_split=0.2)
        
        # Generate forecast
        forecast_result = self.forecasting_engine.generate_forecast(
            "unemployment_rate", "arima", ForecastHorizon.SHORT_TERM, 6
        )
        
        self.assertEqual(forecast_result.indicator_id, "unemployment_rate")
        self.assertEqual(len(forecast_result.forecast_points), 6)
        self.assertIsInstance(forecast_result.risk_factors, list)
        self.assertIsInstance(forecast_result.assumptions, list)
        self.assertIn('optimistic', forecast_result.scenario_analysis)
        self.assertIn('pessimistic', forecast_result.scenario_analysis)

class TestEconomicAlertSystem(unittest.TestCase):
    """Test economic alert system functionality"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.alert_system = EconomicAlertSystem()
        self.unemployment = UnemploymentIndicator()
        
        # Add current data point
        current_data = EconomicDataPoint(
            indicator_id="unemployment_rate",
            value=6.2,  # Above threshold
            timestamp=datetime.now(),
            source="test"
        )
        self.unemployment.add_data_point(current_data)
    
    def test_alert_rule_creation(self):
        """Test alert rule creation"""
        rule = {
            'rule_id': 'unemployment_spike',
            'indicator_id': 'unemployment_rate',
            'condition': 'above',
            'threshold': 5.0,
            'severity': 'high'
        }
        
        self.alert_system.add_alert_rule(rule)
        self.assertEqual(len(self.alert_system.alert_rules), 1)
    
    def test_alert_triggering(self):
        """Test alert triggering functionality"""
        rule = {
            'rule_id': 'unemployment_spike',
            'indicator_id': 'unemployment_rate',
            'condition': 'above',
            'threshold': 5.0,
            'severity': 'high'
        }
        
        self.alert_system.add_alert_rule(rule)
        alerts = self.alert_system.check_alerts([self.unemployment])
        
        self.assertEqual(len(alerts), 1)
        self.assertEqual(alerts[0]['rule_id'], 'unemployment_spike')
        self.assertGreater(alerts[0]['current_value'], 5.0)

class TestPolicyImpactAnalyzer(unittest.TestCase):
    """Test policy impact analysis functionality"""
    
    def setUp(self):
        """Set up test fixtures"""
        self.policy_analyzer = PolicyImpactAnalyzer()
        self.unemployment = UnemploymentIndicator()
        
        # Add data before and after policy date
        policy_date = datetime.now() - timedelta(days=60)
        
        for i in range(120):  # 4 months of data
            date = datetime.now() - timedelta(days=120 - i)
            
            # Simulate policy impact (unemployment decreases after policy)
            if date < policy_date:
                base_value = 5.5
            else:
                base_value = 4.8  # Lower after policy
            
            value = base_value + np.random.normal(0, 0.2)
            data_point = EconomicDataPoint(
                indicator_id="unemployment_rate",
                value=max(0, value),
                timestamp=date,
                source="test"
            )
            self.unemployment.add_data_point(data_point)
    
    def test_policy_event_registration(self):
        """Test policy event registration"""
        event = {
            'event_id': 'stimulus_package_2024',
            'policy_type': 'fiscal_stimulus',
            'announcement_date': datetime.now() - timedelta(days=90),
            'implementation_date': datetime.now() - timedelta(days=60),
            'description': 'Economic stimulus package'
        }
        
        self.policy_analyzer.register_policy_event(event)
        self.assertEqual(len(self.policy_analyzer.policy_events), 1)
    
    def test_policy_impact_analysis(self):
        """Test policy impact analysis"""
        # Register policy event
        implementation_date = datetime.now() - timedelta(days=60)
        event = {
            'event_id': 'stimulus_package_2024',
            'policy_type': 'fiscal_stimulus',
            'announcement_date': datetime.now() - timedelta(days=90),
            'implementation_date': implementation_date,
            'description': 'Economic stimulus package'
        }
        
        self.policy_analyzer.register_policy_event(event)
        
        # Analyze impact
        analysis = self.policy_analyzer.analyze_policy_impact(
            'stimulus_package_2024', [self.unemployment], analysis_window=30
        )
        
        self.assertEqual(analysis['event_id'], 'stimulus_package_2024')
        self.assertIn('unemployment_rate', analysis['indicator_impacts'])
        self.assertIn('overall_assessment', analysis)
        
        # Should show negative impact on unemployment (good policy outcome)
        unemployment_impact = analysis['indicator_impacts']['unemployment_rate']
        if 'percentage_change' in unemployment_impact:
            self.assertLess(unemployment_impact['percentage_change'], 0)  # Unemployment decreased

def run_comprehensive_test_suite():
    """Run the complete test suite for economic indicator systems"""
    print("Running Comprehensive Economic Indicator Test Suite")
    print("=" * 60)
    
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add all test classes
    test_classes = [
        TestEconomicIndicators,
        TestSectorIndicators,
        TestInternationalIndicators,
        TestForecastingEngine,
        TestEconomicAlertSystem,
        TestPolicyImpactAnalyzer
    ]
    
    for test_class in test_classes:
        tests = unittest.TestLoader().loadTestsFromTestCase(test_class)
        test_suite.addTests(tests)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    # Print summary
    print(f"\nTest Results Summary:")
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Success rate: {(result.testsRun - len(result.failures) - len(result.errors))/result.testsRun*100:.1f}%")
    
    if result.failures:
        print(f"\nFailures:")
        for test, traceback in result.failures:
            print(f"  - {test}: {traceback.split('AssertionError:')[-1].strip()}")
    
    if result.errors:
        print(f"\nErrors:")
        for test, traceback in result.errors:
            print(f"  - {test}: {traceback.split('Exception:')[-1].strip()}")
    
    return result.wasSuccessful()

if __name__ == "__main__":
    # Set random seed for reproducible tests
    np.random.seed(42)
    
    success = run_comprehensive_test_suite()
    
    if success:
        print("\n✅ All tests passed! Economic Indicator Systems are ready for deployment.")
    else:
        print("\n❌ Some tests failed. Please review and fix issues before deployment.")
    
    print("\nEconomic Indicator Test Suite completed!")
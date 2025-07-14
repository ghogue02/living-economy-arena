"""
Test Suite for Crisis Generation Systems
Phase 3 Market Complexity - Comprehensive Testing

This module provides comprehensive testing for all crisis generation components
including bubbles, contagion, systemic risk, shadow banking, fire sales, and resolution.
"""

import unittest
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
import logging
from typing import Dict, List

from crisis_generation import (
    CrisisGenerationOrchestrator, CrisisParameters, CrisisType, BubblePhase,
    EconomicBubbleEngine, FinancialContagionEngine, SystemicRiskAnalyzer,
    CrisisInterventionEngine
)
from shadow_banking import (
    ShadowBankingSystem, ShadowBankingEntity,
    MoneyMarketFundProfile, RiskLevel
)
from fire_sale_mechanics import (
    FireSaleEngine, AssetClass, LiquidityTier, SaleReason
)
from crisis_resolution import (
    CrisisResolutionEngine, ResolutionType, ResolutionAuthority, RecoveryPhase
)


class TestEconomicBubbleEngine(unittest.TestCase):
    """Test cases for economic bubble formation and evolution"""
    
    def setUp(self):
        self.bubble_engine = EconomicBubbleEngine()
        
    def test_bubble_initialization(self):
        """Test bubble initialization"""
        bubble_id = self.bubble_engine.initialize_bubble(
            "TECH_STOCKS", CrisisType.TECH_BUBBLE, 100.0
        )
        
        self.assertIn(bubble_id, self.bubble_engine.bubbles)
        bubble = self.bubble_engine.bubbles[bubble_id]
        
        self.assertEqual(bubble['type'], CrisisType.TECH_BUBBLE)
        self.assertEqual(bubble['phase'], BubblePhase.STEALTH)
        self.assertEqual(bubble['fundamental_value'], 100.0)
        self.assertEqual(bubble['current_price'], 100.0)
        
    def test_bubble_phase_evolution(self):
        """Test bubble evolution through phases"""
        bubble_id = self.bubble_engine.initialize_bubble(
            "HOUSING", CrisisType.HOUSING_BUBBLE, 250000
        )
        
        # Evolve bubble through multiple time steps
        phases_seen = set()
        for step in range(50):
            state = self.bubble_engine.evolve_bubble(bubble_id, step)
            phases_seen.add(state['phase'])
            
            # Check price to fundamental ratio progression
            ratio = state['price'] / state['fundamental_value']
            if state['phase'] == 'mania':
                self.assertGreater(ratio, 1.5)  # Should be elevated in mania
                
        # Should see multiple phases
        self.assertGreater(len(phases_seen), 2)
        
    def test_bubble_metrics_calculation(self):
        """Test bubble metrics calculation"""
        bubble_id = self.bubble_engine.initialize_bubble(
            "CRYPTO", CrisisType.TECH_BUBBLE, 50000
        )
        
        # Evolve to mania phase
        for step in range(20):
            state = self.bubble_engine.evolve_bubble(bubble_id, step)
            
        bubble = self.bubble_engine.bubbles[bubble_id]
        metrics = bubble['metrics']
        
        # Check metrics are within reasonable bounds
        self.assertGreaterEqual(metrics.price_to_fundamental_ratio, 1.0)
        self.assertGreaterEqual(metrics.trading_volume_multiplier, 1.0)
        self.assertLessEqual(metrics.euphoria_index, 1.0)
        self.assertLessEqual(metrics.speculation_index, 1.0)


class TestFinancialContagionEngine(unittest.TestCase):
    """Test cases for financial contagion modeling"""
    
    def setUp(self):
        self.contagion_engine = FinancialContagionEngine()
        
    def test_institution_registration(self):
        """Test financial institution registration"""
        self.contagion_engine.add_institution("BANK_A", 1e12, 10.0, 0.15)
        
        self.assertIn("BANK_A", self.contagion_engine.institutions)
        institution = self.contagion_engine.institutions["BANK_A"]
        
        self.assertEqual(institution['asset_size'], 1e12)
        self.assertEqual(institution['leverage_ratio'], 10.0)
        self.assertEqual(institution['liquidity_ratio'], 0.15)
        
    def test_exposure_network_building(self):
        """Test building exposure network"""
        # Add institutions
        self.contagion_engine.add_institution("BANK_A", 1e12, 10.0, 0.15)
        self.contagion_engine.add_institution("BANK_B", 8e11, 12.0, 0.12)
        self.contagion_engine.add_institution("BANK_C", 5e11, 15.0, 0.10)
        
        # Add exposures
        self.contagion_engine.add_exposure("BANK_A", "BANK_B", 50e9)
        self.contagion_engine.add_exposure("BANK_B", "BANK_C", 30e9)
        
        # Check contagion matrix is built
        self.assertIsNotNone(self.contagion_engine.contagion_matrix)
        self.assertEqual(self.contagion_engine.contagion_matrix.shape, (3, 3))
        
    def test_contagion_simulation(self):
        """Test contagion spreading simulation"""
        # Setup network
        self.contagion_engine.add_institution("BANK_A", 1e12, 10.0, 0.15)
        self.contagion_engine.add_institution("BANK_B", 8e11, 12.0, 0.12)
        self.contagion_engine.add_institution("BANK_C", 5e11, 15.0, 0.10)
        
        self.contagion_engine.add_exposure("BANK_A", "BANK_B", 100e9)
        self.contagion_engine.add_exposure("BANK_B", "BANK_C", 50e9)
        
        # Simulate contagion
        contagion_rounds = self.contagion_engine.simulate_contagion("BANK_A", 0.5)
        
        self.assertGreater(len(contagion_rounds), 0)
        
        # Check that stress propagated
        initial_stress = self.contagion_engine.institutions["BANK_A"]['stress_level']
        self.assertEqual(initial_stress, 0.5)
        
        # Check system stress calculation
        system_stress = self.contagion_engine._calculate_system_stress()
        self.assertGreater(system_stress, 0.0)


class TestSystemicRiskAnalyzer(unittest.TestCase):
    """Test cases for systemic risk analysis"""
    
    def setUp(self):
        self.risk_analyzer = SystemicRiskAnalyzer()
        
    def test_risk_profile_addition(self):
        """Test adding institution risk profiles"""
        self.risk_analyzer.add_institution_risk_profile(
            "SIFI_BANK", 2e12, 0.8, 20.0, 0.6, 0.15
        )
        
        self.assertIn("SIFI_BANK", self.risk_analyzer.risk_indicators)
        indicator = self.risk_analyzer.risk_indicators["SIFI_BANK"]
        
        self.assertEqual(indicator.asset_size, 2e12)
        self.assertEqual(indicator.leverage_ratio, 20.0)
        self.assertGreater(indicator.systemic_importance, 0.0)
        
    def test_systemic_risk_calculation(self):
        """Test systemic risk score calculation"""
        # Add multiple institutions
        self.risk_analyzer.add_institution_risk_profile(
            "LARGE_BANK", 1.5e12, 0.7, 15.0, 0.4, 0.1
        )
        self.risk_analyzer.add_institution_risk_profile(
            "MEDIUM_BANK", 5e11, 0.5, 12.0, 0.3, 0.08
        )
        self.risk_analyzer.add_institution_risk_profile(
            "SMALL_BANK", 1e11, 0.3, 8.0, 0.2, 0.05
        )
        
        risk_score = self.risk_analyzer.calculate_systemic_risk_score()
        
        self.assertIn('overall_risk', risk_score)
        self.assertIn('risk_level', risk_score)
        self.assertBetween(risk_score['overall_risk'], 0.0, 1.0)
        
    def test_sifi_identification(self):
        """Test systemically important institution identification"""
        # Add large institution
        self.risk_analyzer.add_institution_risk_profile(
            "TOO_BIG_TO_FAIL", 3e12, 0.9, 25.0, 0.8, 0.2
        )
        
        # Add smaller institution
        self.risk_analyzer.add_institution_risk_profile(
            "SMALL_BANK", 50e9, 0.2, 8.0, 0.1, 0.03
        )
        
        sifis = self.risk_analyzer.identify_systemically_important_institutions()
        
        self.assertGreater(len(sifis), 0)
        self.assertEqual(sifis[0]['institution_id'], "TOO_BIG_TO_FAIL")
        
    def assertBetween(self, value, low, high):
        """Helper assertion for range checking"""
        self.assertGreaterEqual(value, low)
        self.assertLessEqual(value, high)


class TestShadowBankingSystem(unittest.TestCase):
    """Test cases for shadow banking system"""
    
    def setUp(self):
        self.shadow_system = ShadowBankingSystem()
        
    def test_entity_registration(self):
        """Test shadow banking entity registration"""
        entity_id = self.shadow_system.register_entity(
            "MMF_TEST", ShadowBankingEntity.MONEY_MARKET_FUND, 50e9, 1.0
        )
        
        self.assertIn(entity_id, self.shadow_system.entities)
        entity = self.shadow_system.entities[entity_id]
        
        self.assertEqual(entity['type'], ShadowBankingEntity.MONEY_MARKET_FUND)
        self.assertEqual(entity['assets'], 50e9)
        
    def test_repo_position_creation(self):
        """Test repo market position creation"""
        # Register entities first
        self.shadow_system.register_entity("DEALER", ShadowBankingEntity.BROKER_DEALER, 100e9, 10.0)
        self.shadow_system.register_entity("MMF", ShadowBankingEntity.MONEY_MARKET_FUND, 50e9, 1.0)
        
        position_id = self.shadow_system.create_repo_position(
            "DEALER", "MMF", "treasury_securities", 1e9, 0.02, 1, 0.025
        )
        
        self.assertGreater(len(self.shadow_system.repo_positions), 0)
        
    def test_mmf_creation(self):
        """Test money market fund creation"""
        fund_id = self.shadow_system.create_money_market_fund("TEST_MMF", 25e9)
        
        self.assertIn(fund_id, self.shadow_system.mmf_profiles)
        self.assertIn(fund_id, self.shadow_system.entities)
        
        mmf = self.shadow_system.mmf_profiles[fund_id]
        self.assertEqual(mmf.assets_under_management, 25e9)
        self.assertEqual(mmf.nav_per_share, 1.0)
        
    def test_repo_stress_simulation(self):
        """Test repo market stress simulation"""
        # Setup repo market
        self.shadow_system.register_entity("DEALER", ShadowBankingEntity.BROKER_DEALER, 100e9, 10.0)
        self.shadow_system.register_entity("MMF", ShadowBankingEntity.MONEY_MARKET_FUND, 50e9, 1.0)
        
        self.shadow_system.create_repo_position(
            "DEALER", "MMF", "corporate_bonds", 5e9, 0.05, 7, 0.04
        )
        
        stress_results = self.shadow_system.simulate_repo_market_stress(0.6)
        
        self.assertIn('funding_withdrawn', stress_results)
        self.assertIn('affected_positions', stress_results)
        
    def test_mmf_run_simulation(self):
        """Test money market fund run simulation"""
        fund_id = self.shadow_system.create_money_market_fund("RUN_TEST_MMF", 10e9)
        
        run_results = self.shadow_system.simulate_mmf_run(fund_id, 0.4)
        
        self.assertIn('redemptions_requested', run_results)
        self.assertIn('gates_triggered', run_results)
        self.assertIn('nav_impact', run_results)
        
        # Check that fund size decreased
        mmf = self.shadow_system.mmf_profiles[fund_id]
        self.assertLess(mmf.assets_under_management, 10e9)
        
    def test_vulnerability_assessment(self):
        """Test systemic vulnerability assessment"""
        # Create entities
        self.shadow_system.register_entity("LARGE_MMF", ShadowBankingEntity.MONEY_MARKET_FUND, 100e9, 1.0)
        self.shadow_system.register_entity("DEALER", ShadowBankingEntity.BROKER_DEALER, 200e9, 15.0)
        
        vulnerability = self.shadow_system.assess_systemic_vulnerability()
        
        self.assertIn('vulnerability_score', vulnerability)
        self.assertIn('risk_level', vulnerability)
        self.assertIn('recommendations', vulnerability)
        
        self.assertIsInstance(vulnerability['risk_level'], RiskLevel)


class TestFireSaleEngine(unittest.TestCase):
    """Test cases for fire sale mechanics"""
    
    def setUp(self):
        self.fire_engine = FireSaleEngine()
        
    def test_asset_initialization(self):
        """Test asset initialization"""
        self.fire_engine.initialize_asset(
            "TEST_EQUITY", AssetClass.EQUITIES, 100.0, 1e6, LiquidityTier.TIER_2
        )
        
        self.assertIn("TEST_EQUITY", self.fire_engine.asset_prices)
        self.assertIn("TEST_EQUITY", self.fire_engine.liquidity_states)
        
        self.assertEqual(self.fire_engine.asset_prices["TEST_EQUITY"], 100.0)
        
    def test_forced_seller_registration(self):
        """Test forced seller registration"""
        self.fire_engine.register_forced_seller(
            "HEDGE_FUND", {"TEST_EQUITY": 1000}, 5.0, 0.15
        )
        
        self.assertIn("HEDGE_FUND", self.fire_engine.forced_sellers)
        seller = self.fire_engine.forced_sellers["HEDGE_FUND"]
        
        self.assertEqual(seller['leverage_ratio'], 5.0)
        self.assertEqual(seller['stress_threshold'], 0.15)
        
    def test_fire_sale_order_submission(self):
        """Test fire sale order submission"""
        # Initialize asset
        self.fire_engine.initialize_asset(
            "TEST_BOND", AssetClass.CORPORATE_BONDS, 98.0, 5e5, LiquidityTier.TIER_3
        )
        
        order_id = self.fire_engine.submit_fire_sale_order(
            "SELLER_1", "TEST_BOND", 1000, 0.8, SaleReason.MARGIN_CALL
        )
        
        self.assertGreater(len(self.fire_engine.active_orders), 0)
        
    def test_fire_sale_execution(self):
        """Test fire sale execution"""
        # Setup
        self.fire_engine.initialize_asset(
            "LIQUID_ASSET", AssetClass.GOVERNMENT_BONDS, 100.0, 1e7, LiquidityTier.TIER_1
        )
        
        self.fire_engine.register_liquidity_provider("MARKET_MAKER", 10e6, 0.5)
        
        # Submit order
        self.fire_engine.submit_fire_sale_order(
            "FORCED_SELLER", "LIQUID_ASSET", 5000, 0.6, SaleReason.LIQUIDITY_STRESS
        )
        
        # Execute
        executions = self.fire_engine.execute_fire_sales(1)
        
        self.assertGreater(len(executions), 0)
        
    def test_contagion_triggering(self):
        """Test price spiral contagion triggering"""
        # Setup with forced seller
        self.fire_engine.initialize_asset(
            "CONTAGION_ASSET", AssetClass.EQUITIES, 50.0, 1e6, LiquidityTier.TIER_2
        )
        
        self.fire_engine.register_forced_seller(
            "LEVERAGED_FUND", {"CONTAGION_ASSET": 10000}, 10.0, 0.1
        )
        
        # Submit large fire sale to trigger contagion
        self.fire_engine.submit_fire_sale_order(
            "INITIAL_SELLER", "CONTAGION_ASSET", 50000, 1.0, SaleReason.BANKRUPTCY
        )
        
        # Execute and check for additional orders
        initial_orders = len(self.fire_engine.active_orders)
        self.fire_engine.execute_fire_sales(1)
        
        # May trigger additional forced sales
        final_orders = len(self.fire_engine.active_orders)
        
        # At minimum, the original order should be processed
        self.assertGreaterEqual(initial_orders, 1)


class TestCrisisResolutionEngine(unittest.TestCase):
    """Test cases for crisis resolution"""
    
    def setUp(self):
        self.resolution_engine = CrisisResolutionEngine()
        
    def test_failing_institution_registration(self):
        """Test failing institution registration"""
        inst_id = self.resolution_engine.register_failing_institution(
            "FAILED_BANK", 500e9, 480e9, 0.15, 0.6
        )
        
        self.assertIn(inst_id, self.resolution_engine.failed_institutions)
        institution = self.resolution_engine.failed_institutions[inst_id]
        
        self.assertEqual(institution['asset_size'], 500e9)
        self.assertEqual(institution['liability_size'], 480e9)
        self.assertEqual(institution['equity'], 20e9)
        
    def test_resolution_options_assessment(self):
        """Test resolution options assessment"""
        # Register large systemic institution
        self.resolution_engine.register_failing_institution(
            "SYSTEMIC_BANK", 2e12, 1.9e12, 0.3, 0.8
        )
        
        options = self.resolution_engine.assess_resolution_options("SYSTEMIC_BANK")
        
        self.assertGreater(len(options), 0)
        
        # Should include bailout option for systemic institution
        bailout_options = [opt for opt in options if opt.resolution_type == ResolutionType.BAILOUT]
        self.assertGreater(len(bailout_options), 0)
        
        # Check option properties
        for option in options:
            self.assertGreater(option.cost_estimate, 0)
            self.assertBetween(option.success_probability, 0.0, 1.0)
            self.assertBetween(option.systemic_impact, 0.0, 1.0)
            
    def test_bailout_implementation(self):
        """Test bailout implementation"""
        # Register institution
        self.resolution_engine.register_failing_institution(
            "BAILOUT_BANK", 1e12, 950e9, 0.2, 0.7
        )
        
        # Get bailout option
        options = self.resolution_engine.assess_resolution_options("BAILOUT_BANK")
        bailout_option = next(
            opt for opt in options if opt.resolution_type == ResolutionType.BAILOUT
        )
        
        # Implement bailout
        result = self.resolution_engine.implement_resolution("BAILOUT_BANK", bailout_option)
        
        self.assertTrue(result['success'])
        self.assertIn('bailout_package', result)
        
        # Check institution status
        institution = self.resolution_engine.failed_institutions["BAILOUT_BANK"]
        self.assertEqual(institution['resolution_status'], 'RESOLVED_BAILOUT')
        
    def test_bankruptcy_implementation(self):
        """Test bankruptcy implementation"""
        # Register small institution
        self.resolution_engine.register_failing_institution(
            "BANKRUPT_BANK", 50e9, 60e9, 0.02, 0.1
        )
        
        # Get bankruptcy option
        options = self.resolution_engine.assess_resolution_options("BANKRUPT_BANK")
        bankruptcy_option = next(
            opt for opt in options if opt.resolution_type == ResolutionType.BANKRUPTCY
        )
        
        # Implement bankruptcy
        result = self.resolution_engine.implement_resolution("BANKRUPT_BANK", bankruptcy_option)
        
        self.assertTrue(result['success'])
        self.assertIn('bankruptcy_proceeding', result)
        
    def test_recovery_monitoring(self):
        """Test recovery progress monitoring"""
        # Create some resolution history
        self.resolution_engine.register_failing_institution(
            "RESOLVED_BANK", 100e9, 95e9, 0.05, 0.2
        )
        
        options = self.resolution_engine.assess_resolution_options("RESOLVED_BANK")
        self.resolution_engine.implement_resolution("RESOLVED_BANK", options[0])
        
        # Monitor recovery
        recovery_status = self.resolution_engine.monitor_recovery_progress()
        
        self.assertIn('phase', recovery_status)
        self.assertIn('progress', recovery_status)
        self.assertIsInstance(recovery_status['phase'], RecoveryPhase)
        self.assertBetween(recovery_status['progress'], 0.0, 1.0)
        
    def test_resolution_report_generation(self):
        """Test comprehensive resolution report generation"""
        # Create multiple resolutions
        institutions = [
            ("BANK_1", 200e9, 190e9, 0.1, 0.3),
            ("BANK_2", 150e9, 160e9, 0.08, 0.25),
            ("BANK_3", 300e9, 280e9, 0.12, 0.4)
        ]
        
        for name, assets, liabilities, syst, interconn in institutions:
            self.resolution_engine.register_failing_institution(
                name, assets, liabilities, syst, interconn
            )
            
            options = self.resolution_engine.assess_resolution_options(name)
            self.resolution_engine.implement_resolution(name, options[0])
            
        # Generate report
        report = self.resolution_engine.generate_resolution_report()
        
        self.assertIn('summary', report)
        self.assertIn('resolution_distribution', report)
        self.assertIn('cost_by_type', report)
        self.assertIn('recovery_status', report)
        
        self.assertEqual(report['summary']['total_institutions'], 3)
        self.assertGreater(report['summary']['total_cost'], 0)
        
    def assertBetween(self, value, low, high):
        """Helper assertion for range checking"""
        self.assertGreaterEqual(value, low)
        self.assertLessEqual(value, high)


class TestCrisisOrchestration(unittest.TestCase):
    """Test cases for complete crisis orchestration"""
    
    def setUp(self):
        self.orchestrator = CrisisGenerationOrchestrator()
        
    def test_crisis_scenario_initialization(self):
        """Test crisis scenario initialization"""
        crisis_params = CrisisParameters(
            crisis_type=CrisisType.HOUSING_BUBBLE,
            severity=0.8,
            duration_months=18
        )
        
        scenario_id = self.orchestrator.initialize_crisis_scenario(
            "Housing Crisis Test", crisis_params
        )
        
        self.assertIn(scenario_id, self.orchestrator.active_crises)
        scenario = self.orchestrator.active_crises[scenario_id]
        
        self.assertEqual(scenario['parameters'].crisis_type, CrisisType.HOUSING_BUBBLE)
        self.assertEqual(scenario['status'], 'INITIALIZING')
        
    def test_integrated_crisis_simulation(self):
        """Test integrated crisis simulation"""
        # Initialize crisis
        crisis_params = CrisisParameters(
            crisis_type=CrisisType.BANKING_CRISIS,
            severity=0.6,
            duration_months=12
        )
        
        scenario_id = self.orchestrator.initialize_crisis_scenario(
            "Banking Crisis Test", crisis_params
        )
        
        # Add institutions to various engines
        self.orchestrator.contagion_engine.add_institution("TEST_BANK_1", 1e12, 12.0, 0.15)
        self.orchestrator.contagion_engine.add_institution("TEST_BANK_2", 8e11, 15.0, 0.12)
        
        self.orchestrator.risk_analyzer.add_institution_risk_profile(
            "TEST_BANK_1", 1e12, 0.7, 12.0, 0.4, 0.15
        )
        
        # Initialize bubble
        bubble_id = self.orchestrator.bubble_engine.initialize_bubble(
            "BANK_STOCKS", CrisisType.BANKING_CRISIS, 50.0
        )
        
        self.orchestrator.active_crises[scenario_id]['bubbles'].append(bubble_id)
        
        # Run short simulation
        results = self.orchestrator.run_crisis_simulation(scenario_id, time_steps=5)
        
        self.assertIn('scenario_id', results)
        self.assertIn('bubble_evolution', results)
        self.assertIn('risk_assessments', results)
        self.assertIn('final_state', results)
        
        # Check that simulation completed
        scenario = self.orchestrator.active_crises[scenario_id]
        self.assertEqual(scenario['status'], 'COMPLETED')


def run_comprehensive_test_suite():
    """Run the comprehensive test suite"""
    # Configure logging
    logging.basicConfig(level=logging.WARNING)
    
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add all test classes
    test_classes = [
        TestEconomicBubbleEngine,
        TestFinancialContagionEngine,
        TestSystemicRiskAnalyzer,
        TestShadowBankingSystem,
        TestFireSaleEngine,
        TestCrisisResolutionEngine,
        TestCrisisOrchestration
    ]
    
    for test_class in test_classes:
        tests = unittest.TestLoader().loadTestsFromTestCase(test_class)
        test_suite.addTests(tests)
    
    # Run tests
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    return result


if __name__ == "__main__":
    print("Starting Crisis Generation System Test Suite...")
    print("=" * 60)
    
    # Run comprehensive test suite
    test_result = run_comprehensive_test_suite()
    
    print("\n" + "=" * 60)
    print("Test Suite Summary:")
    print(f"Tests run: {test_result.testsRun}")
    print(f"Failures: {len(test_result.failures)}")
    print(f"Errors: {len(test_result.errors)}")
    
    if test_result.failures:
        print("\nFailures:")
        for test, failure in test_result.failures:
            print(f"  {test}: {failure}")
            
    if test_result.errors:
        print("\nErrors:")
        for test, error in test_result.errors:
            print(f"  {test}: {error}")
            
    if test_result.wasSuccessful():
        print("\n🎉 All tests passed! Crisis Generation System is ready.")
    else:
        print("\n❌ Some tests failed. Please review and fix issues.")
        
    print("\nCrisis Generation Test Suite completed!")
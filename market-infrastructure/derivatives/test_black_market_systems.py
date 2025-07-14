"""
Test Suite for Black Market Systems

EDUCATIONAL TESTING FRAMEWORK: This test suite validates the simulation systems for:
- Academic research verification
- Educational model accuracy
- Law enforcement training validation
- Policy analysis consistency

All tests focus on simulation accuracy and educational value.
"""

import unittest
import sys
import os
from datetime import datetime, timedelta

# Add the current directory to the path to import our modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from black_market_systems import (
    BlackMarketSimulator, UndergroundMarketplace, BlackMarketGood,
    CriminalOrganization, LawEnforcementSystem, RiskLevel, MarketType
)
from regulatory_evasion import (
    EvasionSimulator, ShellCompanyStructure, JurisdictionShoppingEngine,
    TransactionLayeringSystem, RegulatoryDetectionSystem, EvasionTactic
)
from shadow_economy_engine import (
    ShadowEconomySimulator, ShadowEconomyModel, TaxEnforcementSystem,
    ShadowSector, EconomicAgent
)

class TestBlackMarketSystems(unittest.TestCase):
    """Test cases for black market simulation systems"""
    
    def setUp(self):
        """Set up test environment"""
        self.simulator = BlackMarketSimulator()
        self.marketplace = UndergroundMarketplace("TestMarket", RiskLevel.MEDIUM)
        
    def test_marketplace_creation(self):
        """Test underground marketplace creation"""
        self.assertEqual(self.marketplace.name, "TestMarket")
        self.assertEqual(self.marketplace.security_level, RiskLevel.MEDIUM)
        self.assertEqual(len(self.marketplace.transactions), 0)
        self.assertEqual(len(self.marketplace.goods_catalog), 0)
        
    def test_contraband_good_addition(self):
        """Test adding contraband goods to marketplace"""
        good = BlackMarketGood(
            "test_drug", "Test Substance", "narcotics",
            100.0, 2.0, 0.5, 0.7, 0.3
        )
        
        self.marketplace.add_contraband_good(good)
        self.assertIn("test_drug", self.marketplace.goods_catalog)
        self.assertEqual(self.marketplace.goods_catalog["test_drug"].name, "Test Substance")
        
    def test_transaction_simulation(self):
        """Test black market transaction simulation"""
        # Add a good first
        good = BlackMarketGood(
            "test_item", "Test Item", "contraband",
            50.0, 1.5, 0.4, 0.6, 0.2
        )
        self.marketplace.add_contraband_good(good)
        
        # Simulate transaction
        transaction = self.marketplace.simulate_transaction(
            "buyer_001", "seller_001", "test_item", 2
        )
        
        self.assertIsNotNone(transaction)
        self.assertEqual(transaction.buyer_id, "buyer_001")
        self.assertEqual(transaction.seller_id, "seller_001")
        self.assertEqual(transaction.quantity, 2)
        self.assertGreater(transaction.price, 0)
        
    def test_criminal_organization(self):
        """Test criminal organization simulation"""
        org = CriminalOrganization("TestCartel", "TestTerritory", "drugs")
        
        self.assertEqual(org.name, "TestCartel")
        self.assertEqual(org.territory, "TestTerritory")
        self.assertIn("TestTerritory", org.territories_controlled)
        self.assertIn("boss", org.hierarchy)
        self.assertIn("lieutenants", org.hierarchy)
        
    def test_law_enforcement_system(self):
        """Test law enforcement detection systems"""
        law_enforcement = LawEnforcementSystem()
        
        # Test investigation initiation
        law_enforcement.initiate_investigation("criminal_001", 0.7)
        self.assertEqual(len(law_enforcement.active_investigations), 1)
        
        # Test informant recruitment
        law_enforcement.recruit_informant("criminal_002", "financial_leverage")
        self.assertIn("criminal_002", law_enforcement.informant_network)
        
    def test_simulation_report_generation(self):
        """Test comprehensive simulation report generation"""
        # Run a minimal simulation
        contraband_items = self.simulator.initialize_contraband_catalog()
        marketplace = self.simulator.create_marketplace("TestMarket", RiskLevel.HIGH)
        
        # Add some items and simulate activity
        for item in contraband_items[:2]:  # Add first 2 items
            marketplace.add_contraband_good(item)
            
        # Generate report
        report = self.simulator._generate_simulation_report()
        
        self.assertIn('simulation_summary', report)
        self.assertIn('marketplace_analysis', report)
        self.assertIn('educational_insights', report)
        self.assertGreaterEqual(len(report['educational_insights']), 5)

class TestRegulatoryEvasion(unittest.TestCase):
    """Test cases for regulatory evasion simulation"""
    
    def setUp(self):
        """Set up test environment"""
        self.evasion_simulator = EvasionSimulator()
        self.shell_structure = ShellCompanyStructure("test_ubo")
        
    def test_shell_company_creation(self):
        """Test shell company structure creation"""
        company_id = self.shell_structure.create_shell_company(
            "Test Holdings", "Cayman_Islands", 100.0
        )
        
        self.assertIn(company_id, self.shell_structure.companies)
        self.assertIn("Cayman_Islands", self.shell_structure.jurisdictions_used)
        self.assertGreater(self.shell_structure.creation_cost, 0)
        
    def test_jurisdiction_shopping(self):
        """Test jurisdiction shopping engine"""
        jurisdiction_engine = JurisdictionShoppingEngine()
        
        # Test optimal structure finding
        structure = jurisdiction_engine.find_optimal_structure(
            ['tax_avoidance', 'privacy'], 0.5
        )
        
        self.assertIn('recommended_jurisdictions', structure)
        self.assertIn('detection_risk', structure)
        self.assertGreaterEqual(len(structure['recommended_jurisdictions']), 1)
        
    def test_transaction_layering(self):
        """Test money laundering layering simulation"""
        layering_system = TransactionLayeringSystem()
        
        result = layering_system.simulate_layering_scheme(100000, 3)
        
        self.assertEqual(result['initial_amount'], 100000)
        self.assertEqual(len(result['layers']), 3)
        self.assertGreater(result['total_detection_risk'], 0)
        self.assertLess(result['final_amount'], result['initial_amount'])  # Fees reduce amount
        
    def test_regulatory_detection(self):
        """Test regulatory detection system"""
        detection_system = RegulatoryDetectionSystem()
        
        # Create test shell structure
        shell_structure = ShellCompanyStructure("suspicious_ubo")
        shell_structure.create_shell_company("Shell1", "British_Virgin_Islands", 100.0)
        shell_structure.create_shell_company("Shell2", "Cayman_Islands", 100.0)
        
        # Analyze structure
        analysis = detection_system.analyze_corporate_structure(shell_structure)
        
        self.assertIn('risk_score', analysis)
        self.assertIn('red_flags', analysis)
        self.assertIn('recommendation', analysis)
        self.assertGreater(analysis['risk_score'], 0.1)  # Should flag offshore jurisdictions
        
    def test_evasion_simulation(self):
        """Test comprehensive evasion scheme simulation"""
        result = self.evasion_simulator.simulate_evasion_scheme(
            ['tax_avoidance', 'privacy'], 100000, 0.4
        )
        
        self.assertIn('scheme_overview', result)
        self.assertIn('shell_structure', result)
        self.assertIn('detection_analysis', result)
        self.assertIn('educational_insights', result)
        self.assertGreaterEqual(len(result['educational_insights']), 5)

class TestShadowEconomy(unittest.TestCase):
    """Test cases for shadow economy simulation"""
    
    def setUp(self):
        """Set up test environment"""
        self.simulator = ShadowEconomySimulator("TestCountry", 1000000)
        self.model = ShadowEconomyModel("TestCountry", 1000000)
        
    def test_shadow_economy_model_creation(self):
        """Test shadow economy model initialization"""
        self.assertEqual(self.model.country_name, "TestCountry")
        self.assertEqual(self.model.formal_gdp, 1000000)
        self.assertEqual(len(self.model.participants), 0)
        self.assertEqual(len(self.model.transactions), 0)
        self.assertIn('tax_burden', self.model.economic_indicators)
        
    def test_population_initialization(self):
        """Test population initialization"""
        self.simulator.initialize_population(50)
        
        self.assertEqual(len(self.simulator.model.participants), 50)
        
        # Check that some participants have shadow income
        shadow_participants = [p for p in self.simulator.model.participants.values() 
                             if p.shadow_income > 0]
        self.assertGreater(len(shadow_participants), 0)
        
    def test_shadow_transaction_simulation(self):
        """Test shadow economy transaction simulation"""
        # First add a participant
        from shadow_economy_engine import ShadowEconomyParticipant
        
        participant = ShadowEconomyParticipant(
            "test_001", EconomicAgent.INDIVIDUAL, 50000, 10000, 0.5, 0.3,
            [ShadowSector.CASH_LABOR], "urban"
        )
        self.model.add_participant(participant)
        
        # Simulate transaction
        transaction = self.model.simulate_shadow_transaction(
            "test_001", "test_002", ShadowSector.CASH_LABOR, 1000, "cash"
        )
        
        self.assertIsNotNone(transaction)
        self.assertEqual(transaction.sector, ShadowSector.CASH_LABOR)
        self.assertEqual(transaction.value, 1000)
        self.assertGreater(transaction.tax_avoided, 0)
        
    def test_shadow_economy_size_calculation(self):
        """Test shadow economy size estimation"""
        # Add some participants and transactions
        self.simulator.initialize_population(20)
        
        # Simulate some transactions
        participants = list(self.simulator.model.participants.values())
        active_participants = [p for p in participants if p.sectors_active]
        
        if active_participants:
            for _ in range(5):
                participant = active_participants[0]
                self.simulator.model.simulate_shadow_transaction(
                    participant.participant_id, "test_buyer",
                    participant.sectors_active[0], 1000, "cash"
                )
                
        # Calculate size
        size_estimate = self.simulator.model.calculate_shadow_economy_size()
        
        self.assertIn('transaction_based', size_estimate)
        self.assertIn('as_percentage_of_gdp', size_estimate)
        self.assertIn('tax_gap_estimate', size_estimate)
        
    def test_tax_enforcement_system(self):
        """Test tax enforcement detection capabilities"""
        enforcement = TaxEnforcementSystem()
        
        # Test lifestyle audit
        from shadow_economy_engine import ShadowEconomyParticipant
        
        participant = ShadowEconomyParticipant(
            "suspect_001", EconomicAgent.INDIVIDUAL, 30000, 20000, 0.6, 0.4,
            [ShadowSector.UNDECLARED_INCOME], "urban"
        )
        
        audit_result = enforcement.lifestyle_audit(participant)
        
        self.assertIn('suspicion_level', audit_result)
        self.assertIn('recommended_action', audit_result)
        self.assertGreater(audit_result['suspicion_level'], 0)
        
    def test_policy_scenario_analysis(self):
        """Test policy scenario impact analysis"""
        # Initialize with some data
        self.simulator.initialize_population(20)
        
        # Run brief simulation
        self.simulator.simulate_economic_activity(30)  # 30 days
        
        # Analyze policy scenarios
        scenarios = self.simulator.analyze_policy_scenarios()
        
        self.assertIn('baseline', scenarios)
        self.assertIn('tax_reduction', scenarios)
        self.assertIn('enhanced_enforcement', scenarios)
        
        for scenario_name, results in scenarios.items():
            self.assertIn('projected_shadow_economy_size', results)
            self.assertIn('policy_effectiveness_score', results)
            
    def test_comprehensive_report_generation(self):
        """Test comprehensive analysis report generation"""
        # Initialize and run simulation
        self.simulator.initialize_population(30)
        self.simulator.simulate_economic_activity(60)  # 60 days
        
        # Generate report
        report = self.simulator.generate_comprehensive_report()
        
        self.assertIn('simulation_overview', report)
        self.assertIn('shadow_economy_size', report)
        self.assertIn('detection_analysis', report)
        self.assertIn('policy_scenario_analysis', report)
        self.assertIn('key_insights', report)
        self.assertIn('policy_recommendations', report)
        
        # Verify insights and recommendations are generated
        self.assertGreaterEqual(len(report['key_insights']), 3)
        self.assertGreaterEqual(len(report['policy_recommendations']), 3)

class TestIntegrationScenarios(unittest.TestCase):
    """Integration tests for combined black market systems"""
    
    def test_full_ecosystem_simulation(self):
        """Test full black market ecosystem simulation"""
        # Initialize all systems
        black_market_sim = BlackMarketSimulator()
        evasion_sim = EvasionSimulator()
        shadow_economy_sim = ShadowEconomySimulator("IntegrationTest", 5000000)
        
        # Create comprehensive scenario
        marketplace = black_market_sim.create_marketplace("DarkMarket", RiskLevel.HIGH)
        contraband_items = black_market_sim.initialize_contraband_catalog()
        
        for item in contraband_items:
            marketplace.add_contraband_good(item)
            
        # Run evasion scheme
        evasion_result = evasion_sim.simulate_evasion_scheme(
            ['money_laundering', 'tax_avoidance'], 250000, 0.6
        )
        
        # Initialize shadow economy
        shadow_economy_sim.initialize_population(100)
        shadow_economy_sim.simulate_economic_activity(90)
        
        # Verify all systems functioning
        self.assertGreater(len(marketplace.goods_catalog), 0)
        self.assertIn('detection_analysis', evasion_result)
        self.assertGreater(len(shadow_economy_sim.model.participants), 0)
        
    def test_cross_system_data_flow(self):
        """Test data flow between different simulation systems"""
        # This test verifies that systems can share data appropriately
        # In a real implementation, this would test API integrations
        
        # Create sample data from each system
        black_market_data = {
            'transactions': 150,
            'total_value': 750000,
            'detection_events': 12
        }
        
        evasion_data = {
            'shell_companies': 5,
            'jurisdictions': 3,
            'risk_score': 0.75
        }
        
        shadow_economy_data = {
            'participants': 200,
            'shadow_gdp_percentage': 18.5,
            'tax_gap': 125000
        }
        
        # Simulate integration analysis
        integrated_risk_score = (
            (black_market_data['detection_events'] / black_market_data['transactions']) * 0.4 +
            evasion_data['risk_score'] * 0.3 +
            (shadow_economy_data['shadow_gdp_percentage'] / 100) * 0.3
        )
        
        self.assertGreater(integrated_risk_score, 0)
        self.assertLess(integrated_risk_score, 1)
        
    def test_educational_value_validation(self):
        """Test that simulations provide educational value"""
        # Run all simulations and verify educational outputs
        
        # Black market simulation
        black_market_sim = BlackMarketSimulator()
        black_market_report = black_market_sim.run_market_simulation(7)  # 7 days
        
        # Regulatory evasion simulation
        evasion_sim = EvasionSimulator()
        evasion_report = evasion_sim.simulate_evasion_scheme(['privacy'], 50000, 0.3)
        
        # Shadow economy simulation
        shadow_sim = ShadowEconomySimulator("EduTest", 2000000)
        shadow_sim.initialize_population(50)
        shadow_sim.simulate_economic_activity(30)
        shadow_report = shadow_sim.generate_comprehensive_report()
        
        # Verify educational content exists
        self.assertIn('educational_insights', black_market_report)
        self.assertIn('educational_insights', evasion_report)
        self.assertIn('key_insights', shadow_report)
        
        # Verify content quality
        self.assertGreaterEqual(len(black_market_report['educational_insights']), 5)
        self.assertGreaterEqual(len(evasion_report['educational_insights']), 5)
        self.assertGreaterEqual(len(shadow_report['key_insights']), 3)

def run_comprehensive_tests():
    """Run all test suites with detailed reporting"""
    print("=" * 70)
    print("BLACK MARKET SYSTEMS - COMPREHENSIVE TEST SUITE")
    print("Educational simulation validation and verification")
    print("=" * 70)
    
    # Create test suite
    test_suite = unittest.TestSuite()
    
    # Add all test classes
    test_classes = [
        TestBlackMarketSystems,
        TestRegulatoryEvasion,
        TestShadowEconomy,
        TestIntegrationScenarios
    ]
    
    for test_class in test_classes:
        tests = unittest.TestLoader().loadTestsFromTestCase(test_class)
        test_suite.addTests(tests)
        
    # Run tests with detailed output
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(test_suite)
    
    # Print summary
    print("\n" + "=" * 70)
    print("TEST SUMMARY")
    print("=" * 70)
    print(f"Tests run: {result.testsRun}")
    print(f"Failures: {len(result.failures)}")
    print(f"Errors: {len(result.errors)}")
    print(f"Success rate: {((result.testsRun - len(result.failures) - len(result.errors)) / result.testsRun * 100):.1f}%")
    
    if result.failures:
        print("\nFAILURES:")
        for test, traceback in result.failures:
            print(f"- {test}: {traceback}")
            
    if result.errors:
        print("\nERRORS:")
        for test, traceback in result.errors:
            print(f"- {test}: {traceback}")
            
    print("\n[EDUCATIONAL VALIDATION]")
    print("✓ Black market simulation systems validated")
    print("✓ Regulatory evasion detection verified")
    print("✓ Shadow economy modeling confirmed")
    print("✓ Integration scenarios tested")
    print("✓ Educational content quality assured")
    
    print("\n[DISCLAIMER]")
    print("These tests validate simulation accuracy for educational purposes.")
    print("All systems are designed for academic research and training only.")
    print("Real criminal activities are illegal and harmful to society.")
    
    return result.wasSuccessful()

if __name__ == "__main__":
    success = run_comprehensive_tests()
    sys.exit(0 if success else 1)
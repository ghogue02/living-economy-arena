"""
Test Suite for Corporation Formation Systems
==========================================

Comprehensive test suite for all corporate systems including
formation, governance, M&A, and orchestration capabilities.
"""

import asyncio
import pytest
from decimal import Decimal
from datetime import datetime
import sys
import os

# Add the parent directory to the path to import our modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from corporation_formation import (
    CorporationFormationSystem, CorporateStructure, ShareClass, 
    MATransactionType, Corporation, IPOProcess
)
from corporate_governance import (
    CorporateGovernanceSystem, ESGCategory, CompensationComponent,
    ProxyProposalType, ActivistCampaignType
)
from mergers_acquisitions import (
    MASystem, TransactionType, ValuationMethod, 
    FinancingSource, MATransaction
)
from corporate_orchestrator import (
    CorporateOrchestrator, CorporateLifecycleStage, 
    CorporateEventType, MarketCondition
)

class TestCorporationFormation:
    """Test corporation formation system"""
    
    @pytest.fixture
    def formation_system(self):
        return CorporationFormationSystem()
    
    @pytest.mark.asyncio
    async def test_form_corporation(self, formation_system):
        """Test basic corporation formation"""
        corp_id = await formation_system.form_corporation(
            "Test Corp",
            CorporateStructure.C_CORPORATION,
            Decimal('1000000')
        )
        
        assert corp_id in formation_system.corporations
        corp = formation_system.corporations[corp_id]
        assert corp.name == "Test Corp"
        assert corp.structure == CorporateStructure.C_CORPORATION
        assert corp.initial_capital == Decimal('1000000')
        
    @pytest.mark.asyncio
    async def test_share_issuance(self, formation_system):
        """Test share issuance functionality"""
        corp_id = await formation_system.form_corporation(
            "Share Test Corp",
            CorporateStructure.C_CORPORATION,
            Decimal('1000000')
        )
        
        corp = formation_system.corporations[corp_id]
        
        # Issue shares
        success = corp.issue_shares(
            ShareClass.COMMON,
            500000,
            Decimal('10.00'),
            "test_shareholder"
        )
        
        assert success
        assert "test_shareholder" in corp.shareholders
        assert corp.shareholders["test_shareholder"].shares_owned == 500000
        assert corp.outstanding_shares == 1500000  # 1M initial + 500K new
        
    @pytest.mark.asyncio
    async def test_ipo_process(self, formation_system):
        """Test IPO process"""
        corp_id = await formation_system.form_corporation(
            "IPO Test Corp",
            CorporateStructure.C_CORPORATION,
            Decimal('50000000')
        )
        
        ipo_id = await formation_system.process_ipo(corp_id, Decimal('100000000'))
        
        assert ipo_id in formation_system.ipo_processes
        corp = formation_system.corporations[corp_id]
        assert corp.public_status
        assert corp.exchange_listing == "NASDAQ"
        
    @pytest.mark.asyncio
    async def test_ma_transaction(self, formation_system):
        """Test M&A transaction initiation"""
        # Create acquirer and target
        acquirer_id = await formation_system.form_corporation(
            "Acquirer Corp",
            CorporateStructure.C_CORPORATION,
            Decimal('500000000')
        )
        
        target_id = await formation_system.form_corporation(
            "Target Corp",
            CorporateStructure.C_CORPORATION,
            Decimal('100000000')
        )
        
        # Initiate M&A transaction
        ma_id = await formation_system.initiate_ma_transaction(
            acquirer_id,
            target_id,
            MATransactionType.ACQUISITION,
            Decimal('25.00')
        )
        
        assert ma_id in formation_system.ma_transactions
        transaction = formation_system.ma_transactions[ma_id]
        assert transaction.acquirer.corporation_id == acquirer_id
        assert transaction.target.corporation_id == target_id
        assert transaction.offer_price_per_share == Decimal('25.00')

class TestCorporateGovernance:
    """Test corporate governance system"""
    
    @pytest.fixture
    def governance_system(self):
        return CorporateGovernanceSystem()
    
    @pytest.mark.asyncio
    async def test_establish_governance_program(self, governance_system):
        """Test governance program establishment"""
        corp_id = "test_corp_001"
        
        components = await governance_system.establish_governance_program(corp_id)
        
        assert corp_id in governance_system.governance_programs
        assert "board_committees" in components
        assert "compensation_program" in components
        assert "shareholder_rights" in components
        assert "activist_management" in components
        assert "esg_framework" in components
        
    @pytest.mark.asyncio
    async def test_governance_assessment(self, governance_system):
        """Test governance assessment"""
        corp_id = "test_corp_002"
        
        await governance_system.establish_governance_program(corp_id)
        assessment = await governance_system.conduct_governance_assessment(corp_id)
        
        assert "overall_governance_score" in assessment
        assert "component_scores" in assessment
        assert "recommendations" in assessment
        assert assessment["overall_governance_score"] > 0
        
    def test_executive_compensation_design(self, governance_system):
        """Test executive compensation design"""
        corp_id = "test_corp_003"
        
        # This would typically be called after establishing governance program
        # For testing, we'll create a minimal setup
        from corporate_governance import ExecutiveCompensationProgram
        
        comp_program = ExecutiveCompensationProgram(corp_id)
        
        company_performance = {
            "revenue_growth": 0.15,
            "ebitda_margin": 0.20,
            "return_on_equity": 0.15,
            "total_shareholder_return": 0.12
        }
        
        package = comp_program.design_compensation_package(
            "CEO", 1.0, company_performance
        )
        
        assert "base_salary" in package
        assert "total_compensation" in package
        assert "pay_mix" in package
        assert package["total_compensation"] > package["base_salary"]

class TestMergersAcquisitions:
    """Test M&A system"""
    
    @pytest.fixture
    def ma_system(self):
        return MASystem()
    
    @pytest.mark.asyncio
    async def test_initiate_transaction(self, ma_system):
        """Test M&A transaction initiation"""
        acquirer_data = {
            "name": "Big Corp",
            "revenue": 1000000000,
            "ebitda": 200000000,
            "industry": "technology"
        }
        
        target_data = {
            "name": "Small Corp",
            "revenue": 100000000,
            "ebitda": 20000000,
            "industry": "technology"
        }
        
        transaction_id = await ma_system.initiate_transaction(
            TransactionType.ACQUISITION,
            acquirer_data,
            target_data
        )
        
        assert transaction_id in ma_system.transactions
        transaction = ma_system.transactions[transaction_id]
        assert transaction.transaction_type == TransactionType.ACQUISITION
        assert transaction.acquirer_data["name"] == "Big Corp"
        assert transaction.target_data["name"] == "Small Corp"
        
    @pytest.mark.asyncio
    async def test_valuation_analysis(self, ma_system):
        """Test valuation analysis"""
        target_data = {
            "revenue": 100000000,
            "ebitda": 20000000,
            "net_income": 12000000,
            "total_assets": 150000000,
            "total_debt": 50000000,
            "cash": 15000000
        }
        
        transaction_id = await ma_system.initiate_transaction(
            TransactionType.ACQUISITION,
            {"name": "Acquirer"},
            target_data
        )
        
        valuation_results = await ma_system.perform_valuation_analysis(transaction_id)
        
        assert "valuation_methods" in valuation_results
        assert "dcf" in valuation_results["valuation_methods"]
        assert "comparable_companies" in valuation_results["valuation_methods"]
        assert "weighted_average" in valuation_results
        assert "recommendation" in valuation_results
        
    @pytest.mark.asyncio
    async def test_due_diligence(self, ma_system):
        """Test due diligence process"""
        transaction_id = await ma_system.initiate_transaction(
            TransactionType.ACQUISITION,
            {"name": "Acquirer"},
            {"name": "Target", "revenue": 100000000}
        )
        
        dd_results = await ma_system.conduct_due_diligence(transaction_id)
        
        assert "completion_rate" in dd_results
        assert "total_items" in dd_results
        assert "recommendation" in dd_results
        assert dd_results["total_items"] > 0

class TestCorporateOrchestrator:
    """Test corporate orchestrator"""
    
    @pytest.fixture
    def orchestrator(self):
        return CorporateOrchestrator()
    
    @pytest.mark.asyncio
    async def test_create_complete_corporation(self, orchestrator):
        """Test complete corporation creation"""
        corp_id = await orchestrator.create_complete_corporation(
            "Orchestrator Test Corp",
            CorporateStructure.C_CORPORATION,
            Decimal('5000000'),
            "technology"
        )
        
        assert corp_id in orchestrator.active_corporations
        corp_info = orchestrator.active_corporations[corp_id]
        assert corp_info["industry"] == "technology"
        assert corp_info["lifecycle_stage"] == CorporateLifecycleStage.FORMATION
        assert "governance_components" in corp_info
        
    @pytest.mark.asyncio
    async def test_funding_round_management(self, orchestrator):
        """Test funding round management"""
        corp_id = await orchestrator.create_complete_corporation(
            "Funding Test Corp",
            CorporateStructure.C_CORPORATION,
            Decimal('1000000'),
            "technology"
        )
        
        funding_result = await orchestrator.manage_funding_round(
            corp_id,
            "Series A",
            Decimal('10000000'),
            Decimal('40000000'),
            ["VC Fund 1", "VC Fund 2"]
        )
        
        assert "amount_raised" in funding_result
        assert funding_result["amount_raised"] == Decimal('10000000')
        assert "dilution_percentage" in funding_result
        
        # Check lifecycle stage update
        corp_info = orchestrator.active_corporations[corp_id]
        assert corp_info["lifecycle_stage"] == CorporateLifecycleStage.EARLY_STAGE
        
    @pytest.mark.asyncio
    async def test_market_intelligence_analysis(self, orchestrator):
        """Test market intelligence analysis"""
        corp_id = await orchestrator.create_complete_corporation(
            "Intelligence Test Corp",
            CorporateStructure.C_CORPORATION,
            Decimal('10000000'),
            "technology"
        )
        
        intelligence = orchestrator.conduct_market_intelligence_analysis(corp_id)
        
        assert "market_conditions" in intelligence
        assert "governance_benchmark" in intelligence
        assert "ma_likelihood_analysis" in intelligence
        assert "strategic_recommendations" in intelligence
        
    def test_corporate_ecosystem_overview(self, orchestrator):
        """Test corporate ecosystem overview"""
        overview = orchestrator.get_corporate_ecosystem_overview()
        
        assert "ecosystem_overview" in overview
        assert "lifecycle_distribution" in overview
        assert "industry_distribution" in overview
        assert "market_cap_distribution" in overview
        assert "recent_activity" in overview
        assert "system_health" in overview

class TestIntegration:
    """Test system integration"""
    
    @pytest.mark.asyncio
    async def test_full_corporate_lifecycle(self):
        """Test complete corporate lifecycle"""
        orchestrator = CorporateOrchestrator()
        
        # 1. Create corporation
        corp_id = await orchestrator.create_complete_corporation(
            "Lifecycle Test Corp",
            CorporateStructure.C_CORPORATION,
            Decimal('2000000'),
            "technology"
        )
        
        # 2. Funding round
        await orchestrator.manage_funding_round(
            corp_id,
            "Series A",
            Decimal('15000000'),
            Decimal('60000000'),
            ["Investor A", "Investor B"]
        )
        
        # 3. Market intelligence
        intelligence = orchestrator.conduct_market_intelligence_analysis(corp_id)
        assert intelligence["ma_likelihood_analysis"]["ma_likelihood_percentage"] >= 0
        
        # 4. Get comprehensive profile
        profile = orchestrator.get_corporation_comprehensive_profile(corp_id)
        assert profile["corporation_profile"]["corporation_id"] == corp_id
        assert "formation_data" in profile
        assert "governance_data" in profile
        
        # Verify corporate events were recorded
        assert len(orchestrator.corporate_events) >= 2  # Formation + funding
        
    @pytest.mark.asyncio
    async def test_ma_integration(self):
        """Test M&A integration across systems"""
        orchestrator = CorporateOrchestrator()
        
        # Create acquirer
        acquirer_id = await orchestrator.create_complete_corporation(
            "Acquirer Corp",
            CorporateStructure.C_CORPORATION,
            Decimal('100000000'),
            "technology"
        )
        
        # Create target
        target_id = await orchestrator.create_complete_corporation(
            "Target Corp",
            CorporateStructure.C_CORPORATION,
            Decimal('20000000'),
            "technology"
        )
        
        # Fund target
        await orchestrator.manage_funding_round(
            target_id,
            "Series A",
            Decimal('5000000'),
            Decimal('25000000'),
            ["Target Investor"]
        )
        
        # Execute M&A
        ma_result = await orchestrator.execute_ma_transaction(
            acquirer_id,
            target_id,
            TransactionType.ACQUISITION,
            Decimal('30000000')
        )
        
        assert "transaction_id" in ma_result
        assert "structure_results" in ma_result
        assert "close_results" in ma_result
        
        # Verify acquisition was recorded in events
        ma_events = [event for event in orchestrator.corporate_events 
                    if event.event_type == CorporateEventType.ACQUISITION]
        assert len(ma_events) > 0

# Performance and stress tests
class TestPerformance:
    """Test system performance"""
    
    @pytest.mark.asyncio
    async def test_multiple_corporations_creation(self):
        """Test creating multiple corporations"""
        orchestrator = CorporateOrchestrator()
        
        start_time = datetime.now()
        
        corp_ids = []
        for i in range(10):
            corp_id = await orchestrator.create_complete_corporation(
                f"Performance Test Corp {i+1}",
                CorporateStructure.C_CORPORATION,
                Decimal('1000000'),
                "technology"
            )
            corp_ids.append(corp_id)
            
        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        
        assert len(corp_ids) == 10
        assert all(corp_id in orchestrator.active_corporations for corp_id in corp_ids)
        assert duration < 10.0  # Should complete in under 10 seconds
        
    @pytest.mark.asyncio
    async def test_system_scalability(self):
        """Test system scalability with multiple operations"""
        orchestrator = CorporateOrchestrator()
        
        # Create corporations
        corp_ids = []
        for i in range(5):
            corp_id = await orchestrator.create_complete_corporation(
                f"Scale Test Corp {i+1}",
                CorporateStructure.C_CORPORATION,
                Decimal('5000000'),
                "technology"
            )
            corp_ids.append(corp_id)
            
        # Add funding rounds
        for corp_id in corp_ids:
            await orchestrator.manage_funding_round(
                corp_id,
                "Series A",
                Decimal('10000000'),
                Decimal('40000000'),
                [f"Investor {corp_id}"]
            )
            
        # Conduct market intelligence for all
        for corp_id in corp_ids:
            intelligence = orchestrator.conduct_market_intelligence_analysis(corp_id)
            assert "market_conditions" in intelligence
            
        # Verify ecosystem overview
        overview = orchestrator.get_corporate_ecosystem_overview()
        assert overview["ecosystem_overview"]["total_corporations"] == 5
        assert len(orchestrator.corporate_events) >= 10  # Formation + funding events

# Test runner
async def run_all_tests():
    """Run all tests"""
    print("🧪 RUNNING CORPORATION SYSTEMS TEST SUITE")
    print("=" * 60)
    
    # Test results tracking
    test_results = {
        "passed": 0,
        "failed": 0,
        "errors": []
    }
    
    test_classes = [
        TestCorporationFormation,
        TestCorporateGovernance,
        TestMergersAcquisitions,
        TestCorporateOrchestrator,
        TestIntegration,
        TestPerformance
    ]
    
    for test_class in test_classes:
        print(f"\n📋 Running {test_class.__name__}")
        print("-" * 40)
        
        # Get test methods
        test_methods = [method for method in dir(test_class) if method.startswith('test_')]
        
        for method_name in test_methods:
            try:
                test_instance = test_class()
                
                # Setup fixtures if needed
                if hasattr(test_instance, 'formation_system'):
                    test_instance.formation_system = test_instance.formation_system()
                if hasattr(test_instance, 'governance_system'):
                    test_instance.governance_system = test_instance.governance_system()
                if hasattr(test_instance, 'ma_system'):
                    test_instance.ma_system = test_instance.ma_system()
                if hasattr(test_instance, 'orchestrator'):
                    test_instance.orchestrator = test_instance.orchestrator()
                
                # Run test method
                method = getattr(test_instance, method_name)
                
                if asyncio.iscoroutinefunction(method):
                    await method()
                else:
                    method()
                    
                print(f"  ✅ {method_name}")
                test_results["passed"] += 1
                
            except Exception as e:
                print(f"  ❌ {method_name}: {str(e)}")
                test_results["failed"] += 1
                test_results["errors"].append(f"{test_class.__name__}.{method_name}: {str(e)}")
    
    # Print test summary
    print(f"\n📊 TEST SUMMARY")
    print("=" * 60)
    print(f"Total Passed: {test_results['passed']}")
    print(f"Total Failed: {test_results['failed']}")
    print(f"Success Rate: {test_results['passed'] / (test_results['passed'] + test_results['failed']) * 100:.1f}%")
    
    if test_results["errors"]:
        print(f"\n❌ FAILED TESTS:")
        for error in test_results["errors"]:
            print(f"  • {error}")
    
    return test_results

if __name__ == "__main__":
    # Run the test suite
    results = asyncio.run(run_all_tests())
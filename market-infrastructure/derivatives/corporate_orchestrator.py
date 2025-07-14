"""
Corporate Orchestrator - Phase 3 Market Complexity
==================================================

Master orchestrator for all corporate systems including formation,
governance, M&A, and IPO processes. Provides unified interface
and coordination across all corporate activities.

Features:
- Unified corporate entity lifecycle management
- Cross-system integration and coordination
- Advanced analytics and reporting
- Regulatory compliance orchestration
- Market intelligence and benchmarking
"""

import asyncio
import json
from dataclasses import dataclass
from decimal import Decimal
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional, Any, Tuple
import logging
from collections import defaultdict

# Import all corporate systems
from corporation_formation import (
    CorporationFormationSystem, CorporateStructure, 
    ShareClass, MATransactionType, IPOProcess
)
from corporate_governance import (
    CorporateGovernanceSystem, ESGCategory, CompensationComponent,
    ProxyProposalType, ActivistCampaignType
)
from mergers_acquisitions import (
    MASystem, TransactionType, ValuationMethod, 
    FinancingSource, DueDiligenceArea
)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CorporateLifecycleStage(Enum):
    """Stages in corporate lifecycle"""
    FORMATION = "formation"
    EARLY_STAGE = "early_stage"
    GROWTH = "growth"
    MATURITY = "maturity"
    RESTRUCTURING = "restructuring"
    ACQUISITION_TARGET = "acquisition_target"
    ACQUIRING_COMPANY = "acquiring_company"
    PUBLIC_COMPANY = "public_company"

class CorporateEventType(Enum):
    """Types of corporate events"""
    INCORPORATION = "incorporation"
    FUNDING_ROUND = "funding_round"
    BOARD_CHANGE = "board_change"
    EXECUTIVE_CHANGE = "executive_change"
    GOVERNANCE_UPDATE = "governance_update"
    IPO = "ipo"
    ACQUISITION = "acquisition"
    MERGER = "merger"
    SPIN_OFF = "spin_off"
    DIVIDEND = "dividend"
    STOCK_SPLIT = "stock_split"
    ESG_INITIATIVE = "esg_initiative"

class MarketCondition(Enum):
    """Market condition indicators"""
    BULL_MARKET = "bull_market"
    BEAR_MARKET = "bear_market"
    SIDEWAYS_MARKET = "sideways_market"
    HIGH_VOLATILITY = "high_volatility"
    LOW_VOLATILITY = "low_volatility"
    CREDIT_EXPANSION = "credit_expansion"
    CREDIT_CONTRACTION = "credit_contraction"

@dataclass
class CorporateEvent:
    """Corporate event tracking"""
    event_id: str
    corporation_id: str
    event_type: CorporateEventType
    event_date: datetime
    description: str
    impact_score: float  # 0-100
    stakeholders_affected: List[str]
    financial_impact: Optional[Decimal] = None
    regulatory_implications: List[str] = None
    
class CorporateIntelligence:
    """Corporate intelligence and market analysis"""
    
    def __init__(self):
        self.market_conditions = {}
        self.industry_benchmarks = {}
        self.regulatory_updates = []
        self.market_sentiment = {}
        
    def analyze_market_conditions(self) -> Dict[str, Any]:
        """Analyze current market conditions for corporate activities"""
        
        # Simulate market condition analysis
        conditions = {
            "ipo_market": {
                "favorability": "favorable",  # favorable, neutral, challenging
                "volume_trend": "increasing",
                "valuation_multiples": "elevated",
                "investor_appetite": "strong"
            },
            "ma_market": {
                "activity_level": "high",
                "strategic_premium": "15-25%",
                "financing_availability": "abundant",
                "regulatory_environment": "moderate"
            },
            "credit_markets": {
                "availability": "good",
                "pricing": "attractive",
                "terms": "favorable",
                "covenant_intensity": "moderate"
            },
            "governance_focus": {
                "esg_importance": "very_high",
                "shareholder_activism": "elevated",
                "regulatory_scrutiny": "high",
                "transparency_demands": "increasing"
            }
        }
        
        return conditions
        
    def benchmark_governance_practices(self, corporation_id: str, 
                                     governance_score: float) -> Dict[str, Any]:
        """Benchmark governance practices against peers"""
        
        # Industry benchmarks (simulated)
        benchmarks = {
            "technology": {"average_score": 78, "top_quartile": 85, "median": 76},
            "financial": {"average_score": 82, "top_quartile": 89, "median": 81},
            "healthcare": {"average_score": 75, "top_quartile": 83, "median": 74},
            "industrial": {"average_score": 73, "top_quartile": 81, "median": 72}
        }
        
        # Assume technology industry for this example
        industry_benchmark = benchmarks["technology"]
        
        return {
            "corporation_score": governance_score,
            "industry_average": industry_benchmark["average_score"],
            "industry_median": industry_benchmark["median"],
            "top_quartile_threshold": industry_benchmark["top_quartile"],
            "percentile_ranking": self._calculate_percentile(governance_score, industry_benchmark),
            "improvement_areas": self._identify_improvement_areas(governance_score),
            "peer_comparison": "above_average" if governance_score > industry_benchmark["average_score"] else "below_average"
        }
        
    def _calculate_percentile(self, score: float, benchmark: Dict[str, float]) -> float:
        """Calculate percentile ranking"""
        if score >= benchmark["top_quartile"]:
            return 85.0  # Top quartile
        elif score >= benchmark["median"]:
            return 60.0  # Above median
        elif score >= benchmark["average_score"] * 0.9:
            return 40.0  # Slightly below average
        else:
            return 25.0  # Bottom quartile
            
    def _identify_improvement_areas(self, score: float) -> List[str]:
        """Identify areas for governance improvement"""
        areas = []
        
        if score < 80:
            areas.append("Board independence and diversity")
        if score < 75:
            areas.append("Executive compensation alignment")
        if score < 70:
            areas.append("Shareholder rights enhancement")
        if score < 65:
            areas.append("ESG program development")
            
        return areas
        
    def predict_ma_likelihood(self, corporation_data: Dict[str, Any]) -> Dict[str, Any]:
        """Predict likelihood of M&A activity"""
        
        # Factors influencing M&A likelihood
        revenue = corporation_data.get("revenue", Decimal('0'))
        growth_rate = corporation_data.get("growth_rate", 0.0)
        profitability = corporation_data.get("profitability_margin", 0.0)
        market_position = corporation_data.get("market_position", "middle")
        
        # Calculate M&A likelihood score
        likelihood_score = 0.0
        
        # Size factor (smaller companies more likely to be acquired)
        if revenue < Decimal('100000000'):  # < $100M
            likelihood_score += 0.3
        elif revenue < Decimal('1000000000'):  # < $1B
            likelihood_score += 0.2
        else:
            likelihood_score += 0.1
            
        # Growth factor
        if growth_rate > 0.2:  # > 20% growth
            likelihood_score += 0.2
        elif growth_rate > 0.1:  # > 10% growth
            likelihood_score += 0.15
        else:
            likelihood_score += 0.05
            
        # Profitability factor
        if profitability > 0.2:  # > 20% margin
            likelihood_score += 0.15
        elif profitability > 0.1:  # > 10% margin
            likelihood_score += 0.1
        else:
            likelihood_score += 0.05
            
        # Market position factor
        if market_position == "leader":
            likelihood_score += 0.1
        elif market_position == "challenger":
            likelihood_score += 0.15
        else:  # niche or middle
            likelihood_score += 0.2
            
        likelihood_percentage = min(95, likelihood_score * 100)
        
        return {
            "ma_likelihood_percentage": likelihood_percentage,
            "likelihood_category": self._categorize_likelihood(likelihood_percentage),
            "key_factors": self._identify_ma_factors(corporation_data),
            "potential_acquirer_types": self._identify_potential_acquirers(corporation_data),
            "estimated_valuation_range": self._estimate_valuation_range(corporation_data)
        }
        
    def _categorize_likelihood(self, percentage: float) -> str:
        """Categorize M&A likelihood"""
        if percentage >= 70:
            return "high"
        elif percentage >= 40:
            return "medium"
        else:
            return "low"
            
    def _identify_ma_factors(self, corp_data: Dict[str, Any]) -> List[str]:
        """Identify factors driving M&A attractiveness"""
        factors = []
        
        growth_rate = corp_data.get("growth_rate", 0.0)
        if growth_rate > 0.15:
            factors.append("High growth rate")
            
        profitability = corp_data.get("profitability_margin", 0.0)
        if profitability > 0.15:
            factors.append("Strong profitability")
            
        market_position = corp_data.get("market_position", "")
        if market_position in ["leader", "challenger"]:
            factors.append("Strong market position")
            
        technology_assets = corp_data.get("technology_assets", False)
        if technology_assets:
            factors.append("Valuable technology assets")
            
        return factors
        
    def _identify_potential_acquirers(self, corp_data: Dict[str, Any]) -> List[str]:
        """Identify potential acquirer types"""
        acquirer_types = []
        
        industry = corp_data.get("industry", "")
        if "technology" in industry.lower():
            acquirer_types.extend(["Tech Giants", "Private Equity", "Strategic Competitors"])
        elif "healthcare" in industry.lower():
            acquirer_types.extend(["Pharma Companies", "Healthcare Conglomerates", "Private Equity"])
        else:
            acquirer_types.extend(["Strategic Buyers", "Private Equity", "Financial Buyers"])
            
        return acquirer_types
        
    def _estimate_valuation_range(self, corp_data: Dict[str, Any]) -> Dict[str, Decimal]:
        """Estimate valuation range for M&A"""
        revenue = corp_data.get("revenue", Decimal('100000000'))
        
        # Industry multiples
        revenue_multiple_low = Decimal('2.5')
        revenue_multiple_high = Decimal('4.5')
        
        return {
            "low_valuation": revenue * revenue_multiple_low,
            "high_valuation": revenue * revenue_multiple_high,
            "base_valuation": revenue * Decimal('3.5')
        }

class CorporateOrchestrator:
    """Master orchestrator for all corporate systems"""
    
    def __init__(self):
        # Initialize all corporate systems
        self.formation_system = CorporationFormationSystem()
        self.governance_system = CorporateGovernanceSystem()
        self.ma_system = MASystem()
        
        # Corporate intelligence
        self.intelligence = CorporateIntelligence()
        
        # Event tracking
        self.corporate_events: List[CorporateEvent] = []
        
        # System coordination
        self.system_id = "corporate_orchestrator_v1"
        self.active_corporations = {}  # Unified corporation registry
        
        logger.info("Corporate Orchestrator initialized")
        
    async def create_complete_corporation(self, name: str, structure: CorporateStructure,
                                        initial_capital: Decimal, 
                                        industry: str = "technology") -> str:
        """Create a complete corporation with all systems integrated"""
        
        # 1. Form the corporation
        corporation_id = await self.formation_system.form_corporation(
            name, structure, initial_capital
        )
        
        # 2. Establish governance program
        governance_components = await self.governance_system.establish_governance_program(
            corporation_id
        )
        
        # 3. Register in unified registry
        corporation = self.formation_system.corporations[corporation_id]
        self.active_corporations[corporation_id] = {
            "corporation": corporation,
            "governance_components": governance_components,
            "lifecycle_stage": CorporateLifecycleStage.FORMATION,
            "industry": industry,
            "creation_date": datetime.now(),
            "last_updated": datetime.now()
        }
        
        # 4. Record formation event
        formation_event = CorporateEvent(
            event_id=f"event_{len(self.corporate_events)+1:06d}",
            corporation_id=corporation_id,
            event_type=CorporateEventType.INCORPORATION,
            event_date=datetime.now(),
            description=f"Corporation {name} formed as {structure.value}",
            impact_score=85.0,
            stakeholders_affected=["founders", "initial_investors"],
            financial_impact=initial_capital
        )
        self.corporate_events.append(formation_event)
        
        logger.info(f"Created complete corporation: {name} ({corporation_id})")
        return corporation_id
        
    async def manage_funding_round(self, corporation_id: str, round_type: str,
                                 amount_raised: Decimal, valuation: Decimal,
                                 investors: List[str]) -> Dict[str, Any]:
        """Manage a funding round with governance implications"""
        
        if corporation_id not in self.active_corporations:
            raise ValueError("Corporation not found")
            
        corp_info = self.active_corporations[corporation_id]
        corporation = corp_info["corporation"]
        
        # Calculate new share issuance
        pre_money_valuation = valuation - amount_raised
        new_shares_percentage = amount_raised / valuation
        new_shares = int(corporation.outstanding_shares * new_shares_percentage / (1 - new_shares_percentage))
        price_per_share = amount_raised / new_shares
        
        # Issue new shares
        for i, investor in enumerate(investors):
            investor_shares = new_shares // len(investors)
            corporation.issue_shares(
                ShareClass.PREFERRED_A if round_type.startswith("Series") else ShareClass.COMMON,
                investor_shares,
                price_per_share,
                investor
            )
            
        # Update corporation financials
        corporation.cash_balance += amount_raised
        corporation.share_price = price_per_share
        
        # Update governance (add investor representation)
        if amount_raised > Decimal('10000000'):  # $10M+ rounds get board seats
            governance_components = corp_info["governance_components"]
            for investor in investors[:1]:  # Lead investor gets board seat
                if hasattr(self.governance_system.governance_programs[corporation_id]["board_committees"], "audit"):
                    board_committees = self.governance_system.governance_programs[corporation_id]["board_committees"]
                    # Add investor director (simplified)
                    
        # Update lifecycle stage
        if amount_raised > Decimal('50000000'):  # $50M+
            corp_info["lifecycle_stage"] = CorporateLifecycleStage.GROWTH
        elif amount_raised > Decimal('10000000'):  # $10M+
            corp_info["lifecycle_stage"] = CorporateLifecycleStage.EARLY_STAGE
            
        # Record funding event
        funding_event = CorporateEvent(
            event_id=f"event_{len(self.corporate_events)+1:06d}",
            corporation_id=corporation_id,
            event_type=CorporateEventType.FUNDING_ROUND,
            event_date=datetime.now(),
            description=f"{round_type} funding round: ${amount_raised:,.0f} raised",
            impact_score=90.0,
            stakeholders_affected=["existing_shareholders", "new_investors", "employees"],
            financial_impact=amount_raised
        )
        self.corporate_events.append(funding_event)
        
        corp_info["last_updated"] = datetime.now()
        
        return {
            "round_type": round_type,
            "amount_raised": amount_raised,
            "post_money_valuation": valuation,
            "new_shares_issued": new_shares,
            "price_per_share": price_per_share,
            "dilution_percentage": new_shares_percentage * 100,
            "new_cash_balance": corporation.cash_balance,
            "lifecycle_stage": corp_info["lifecycle_stage"].value
        }
        
    async def orchestrate_ipo_process(self, corporation_id: str, 
                                    target_raise: Decimal) -> Dict[str, Any]:
        """Orchestrate complete IPO process"""
        
        if corporation_id not in self.active_corporations:
            raise ValueError("Corporation not found")
            
        corp_info = self.active_corporations[corporation_id]
        corporation = corp_info["corporation"]
        
        # Pre-IPO governance review and enhancement
        governance_assessment = await self.governance_system.conduct_governance_assessment(corporation_id)
        
        # Enhance governance if needed
        if governance_assessment["overall_governance_score"] < 80:
            # Implement governance improvements
            await self._enhance_pre_ipo_governance(corporation_id)
            
        # Process IPO
        ipo_id = await self.formation_system.process_ipo(corporation_id, target_raise)
        ipo_process = self.formation_system.ipo_processes[ipo_id]
        
        # Update corporation status
        corp_info["lifecycle_stage"] = CorporateLifecycleStage.PUBLIC_COMPANY
        corp_info["last_updated"] = datetime.now()
        
        # Record IPO event
        ipo_event = CorporateEvent(
            event_id=f"event_{len(self.corporate_events)+1:06d}",
            corporation_id=corporation_id,
            event_type=CorporateEventType.IPO,
            event_date=datetime.now(),
            description=f"IPO completed: {ipo_process.shares_offered:,} shares at ${ipo_process.final_price}",
            impact_score=100.0,
            stakeholders_affected=["all_shareholders", "employees", "management", "public_investors"],
            financial_impact=ipo_process.shares_offered * ipo_process.final_price
        )
        self.corporate_events.append(ipo_event)
        
        return {
            "ipo_id": ipo_id,
            "final_price": ipo_process.final_price,
            "shares_sold": ipo_process.shares_offered,
            "gross_proceeds": ipo_process.shares_offered * ipo_process.final_price,
            "post_money_valuation": corporation.market_cap,
            "governance_score_pre_ipo": governance_assessment["overall_governance_score"],
            "public_float_percentage": ipo_process.shares_offered / corporation.outstanding_shares * 100
        }
        
    async def _enhance_pre_ipo_governance(self, corporation_id: str):
        """Enhance governance structure pre-IPO"""
        
        corp_info = self.active_corporations[corporation_id]
        corporation = corp_info["corporation"]
        
        # Add independent directors
        from corporation_formation import GovernanceRole
        corporation.add_board_member("Independent Director 1", GovernanceRole.INDEPENDENT_DIRECTOR, True, ["audit"])
        corporation.add_board_member("Independent Director 2", GovernanceRole.INDEPENDENT_DIRECTOR, True, ["compensation"])
        corporation.add_board_member("Independent Director 3", GovernanceRole.INDEPENDENT_DIRECTOR, True, ["nominating"])
        
        # Update governance score
        corporation.update_governance_score()
        
        logger.info(f"Enhanced governance for pre-IPO corporation {corporation_id}")
        
    async def execute_ma_transaction(self, acquirer_id: str, target_id: str,
                                   transaction_type: TransactionType,
                                   offer_price: Decimal) -> Dict[str, Any]:
        """Execute complete M&A transaction with all systems"""
        
        if acquirer_id not in self.active_corporations or target_id not in self.active_corporations:
            raise ValueError("One or both corporations not found")
            
        # Get corporation data
        acquirer_info = self.active_corporations[acquirer_id]
        target_info = self.active_corporations[target_id]
        
        acquirer_data = self._extract_corporation_data(acquirer_info)
        target_data = self._extract_corporation_data(target_info)
        
        # Initiate transaction in M&A system
        transaction_id = await self.ma_system.initiate_transaction(
            transaction_type, acquirer_data, target_data
        )
        
        # Structure transaction
        financing_mix = {
            "cash": offer_price * Decimal('0.6'),
            "debt": offer_price * Decimal('0.3'),
            "equity": offer_price * Decimal('0.1')
        }
        
        structure_results = await self.ma_system.structure_transaction(
            transaction_id, offer_price, financing_mix
        )
        
        # Conduct due diligence
        dd_results = await self.ma_system.conduct_due_diligence(transaction_id)
        
        # Manage regulatory process
        regulatory_results = await self.ma_system.manage_regulatory_process(transaction_id)
        
        # Create integration plan
        integration_plan = await self.ma_system.plan_integration(transaction_id)
        
        # Close transaction
        close_results = await self.ma_system.close_transaction(transaction_id)
        
        if close_results["status"] == "completed":
            # Update corporate structures
            await self._update_post_acquisition_structure(acquirer_id, target_id, transaction_id)
            
            # Record M&A event
            ma_event = CorporateEvent(
                event_id=f"event_{len(self.corporate_events)+1:06d}",
                corporation_id=acquirer_id,
                event_type=CorporateEventType.ACQUISITION,
                event_date=datetime.now(),
                description=f"Acquired {target_info['corporation'].name} for ${offer_price:,.0f}",
                impact_score=95.0,
                stakeholders_affected=["acquirer_shareholders", "target_shareholders", "employees", "customers"],
                financial_impact=offer_price
            )
            self.corporate_events.append(ma_event)
            
        return {
            "transaction_id": transaction_id,
            "structure_results": structure_results,
            "due_diligence": dd_results,
            "regulatory_status": regulatory_results,
            "integration_plan": integration_plan,
            "close_results": close_results
        }
        
    def _extract_corporation_data(self, corp_info: Dict[str, Any]) -> Dict[str, Any]:
        """Extract corporation data for M&A system"""
        
        corporation = corp_info["corporation"]
        
        return {
            "name": corporation.name,
            "revenue": corporation.revenue,
            "ebitda": corporation.ebitda,
            "net_income": corporation.net_income,
            "total_assets": corporation.total_assets,
            "total_debt": corporation.total_debt,
            "cash": corporation.cash_balance,
            "outstanding_shares": corporation.outstanding_shares,
            "current_share_price": corporation.share_price,
            "market_cap": corporation.market_cap,
            "industry": corp_info["industry"],
            "country": "US"  # Default
        }
        
    async def _update_post_acquisition_structure(self, acquirer_id: str, 
                                               target_id: str, transaction_id: str):
        """Update corporate structure post-acquisition"""
        
        acquirer_info = self.active_corporations[acquirer_id]
        target_info = self.active_corporations[target_id]
        
        # Update acquirer
        acquirer_corp = acquirer_info["corporation"]
        target_corp = target_info["corporation"]
        
        # Add target as subsidiary
        acquirer_corp.subsidiaries.append(target_id)
        
        # Combine financials (simplified)
        acquirer_corp.revenue += target_corp.revenue
        acquirer_corp.ebitda += target_corp.ebitda
        acquirer_corp.total_assets += target_corp.total_assets
        
        # Update lifecycle stage
        acquirer_info["lifecycle_stage"] = CorporateLifecycleStage.ACQUIRING_COMPANY
        target_info["lifecycle_stage"] = CorporateLifecycleStage.ACQUISITION_TARGET
        
        # Update timestamps
        acquirer_info["last_updated"] = datetime.now()
        target_info["last_updated"] = datetime.now()
        
        logger.info(f"Updated post-acquisition structure for {acquirer_id} acquiring {target_id}")
        
    def conduct_market_intelligence_analysis(self, corporation_id: str) -> Dict[str, Any]:
        """Conduct comprehensive market intelligence analysis"""
        
        if corporation_id not in self.active_corporations:
            raise ValueError("Corporation not found")
            
        corp_info = self.active_corporations[corporation_id]
        corporation = corp_info["corporation"]
        
        # Market conditions analysis
        market_conditions = self.intelligence.analyze_market_conditions()
        
        # Governance benchmarking
        governance_benchmark = self.intelligence.benchmark_governance_practices(
            corporation_id, corporation.governance_score
        )
        
        # M&A likelihood analysis
        corp_data = self._extract_corporation_data(corp_info)
        corp_data["growth_rate"] = 0.15  # Assume 15% growth
        corp_data["profitability_margin"] = corporation.ebitda / corporation.revenue
        corp_data["market_position"] = "challenger"  # Simplified
        
        ma_analysis = self.intelligence.predict_ma_likelihood(corp_data)
        
        return {
            "corporation_id": corporation_id,
            "analysis_date": datetime.now(),
            "market_conditions": market_conditions,
            "governance_benchmark": governance_benchmark,
            "ma_likelihood_analysis": ma_analysis,
            "strategic_recommendations": self._generate_strategic_recommendations(
                corporation, market_conditions, governance_benchmark, ma_analysis
            )
        }
        
    def _generate_strategic_recommendations(self, corporation, market_conditions: Dict[str, Any],
                                          governance_benchmark: Dict[str, Any],
                                          ma_analysis: Dict[str, Any]) -> List[str]:
        """Generate strategic recommendations"""
        
        recommendations = []
        
        # IPO recommendations
        if (not corporation.public_status and 
            market_conditions["ipo_market"]["favorability"] == "favorable" and
            corporation.revenue > Decimal('100000000')):
            recommendations.append("Consider IPO process given favorable market conditions")
            
        # Governance improvements
        if governance_benchmark["percentile_ranking"] < 60:
            recommendations.append("Enhance governance practices to reach industry median")
            
        # M&A recommendations
        if ma_analysis["ma_likelihood_percentage"] > 50:
            recommendations.append("Prepare for potential M&A activity - enhance strategic positioning")
            
        # ESG initiatives
        if corporation.esg_score < 70:
            recommendations.append("Implement comprehensive ESG program to meet stakeholder expectations")
            
        # Capital structure optimization
        debt_ratio = corporation.total_debt / corporation.total_assets
        if debt_ratio > 0.6:
            recommendations.append("Consider debt reduction to optimize capital structure")
            
        return recommendations
        
    def get_corporate_ecosystem_overview(self) -> Dict[str, Any]:
        """Get comprehensive overview of corporate ecosystem"""
        
        # Lifecycle distribution
        lifecycle_distribution = defaultdict(int)
        for corp_info in self.active_corporations.values():
            lifecycle_distribution[corp_info["lifecycle_stage"].value] += 1
            
        # Industry distribution
        industry_distribution = defaultdict(int)
        for corp_info in self.active_corporations.values():
            industry_distribution[corp_info["industry"]] += 1
            
        # Market cap distribution
        market_cap_ranges = {
            "micro_cap": 0,    # < $300M
            "small_cap": 0,    # $300M - $2B
            "mid_cap": 0,      # $2B - $10B
            "large_cap": 0,    # $10B - $200B
            "mega_cap": 0      # > $200B
        }
        
        for corp_info in self.active_corporations.values():
            market_cap = corp_info["corporation"].market_cap
            if market_cap < 300000000:
                market_cap_ranges["micro_cap"] += 1
            elif market_cap < 2000000000:
                market_cap_ranges["small_cap"] += 1
            elif market_cap < 10000000000:
                market_cap_ranges["mid_cap"] += 1
            elif market_cap < 200000000000:
                market_cap_ranges["large_cap"] += 1
            else:
                market_cap_ranges["mega_cap"] += 1
                
        # Calculate total market value
        total_market_value = sum(
            corp_info["corporation"].market_cap 
            for corp_info in self.active_corporations.values()
        )
        
        # Event analysis
        recent_events = [event for event in self.corporate_events 
                        if event.event_date > datetime.now() - timedelta(days=90)]
        
        event_types = defaultdict(int)
        for event in recent_events:
            event_types[event.event_type.value] += 1
            
        return {
            "ecosystem_overview": {
                "total_corporations": len(self.active_corporations),
                "total_market_value": total_market_value,
                "average_market_cap": total_market_value / len(self.active_corporations) if self.active_corporations else Decimal('0'),
                "public_companies": len([c for c in self.active_corporations.values() if c["corporation"].public_status]),
                "total_events_tracked": len(self.corporate_events)
            },
            "lifecycle_distribution": dict(lifecycle_distribution),
            "industry_distribution": dict(industry_distribution),
            "market_cap_distribution": market_cap_ranges,
            "recent_activity": {
                "events_last_90_days": len(recent_events),
                "event_type_breakdown": dict(event_types),
                "average_event_impact": sum(event.impact_score for event in recent_events) / len(recent_events) if recent_events else 0
            },
            "system_health": {
                "formation_system_active": True,
                "governance_system_active": True,
                "ma_system_active": True,
                "integration_status": "operational"
            }
        }
        
    def get_corporation_comprehensive_profile(self, corporation_id: str) -> Dict[str, Any]:
        """Get comprehensive corporation profile across all systems"""
        
        if corporation_id not in self.active_corporations:
            raise ValueError("Corporation not found")
            
        corp_info = self.active_corporations[corporation_id]
        
        # Formation system data
        formation_analytics = self.formation_system.get_corporation_analytics(corporation_id)
        
        # Governance system data
        governance_analytics = self.governance_system.get_governance_analytics(corporation_id)
        
        # Corporate events for this corporation
        corp_events = [event for event in self.corporate_events 
                      if event.corporation_id == corporation_id]
        
        # Market intelligence
        market_intelligence = self.conduct_market_intelligence_analysis(corporation_id)
        
        return {
            "corporation_profile": {
                "corporation_id": corporation_id,
                "lifecycle_stage": corp_info["lifecycle_stage"].value,
                "industry": corp_info["industry"],
                "creation_date": corp_info["creation_date"],
                "last_updated": corp_info["last_updated"]
            },
            "formation_data": formation_analytics,
            "governance_data": governance_analytics,
            "corporate_events": {
                "total_events": len(corp_events),
                "recent_events": [
                    {
                        "event_type": event.event_type.value,
                        "event_date": event.event_date,
                        "description": event.description,
                        "impact_score": event.impact_score
                    }
                    for event in corp_events[-5:]  # Last 5 events
                ]
            },
            "market_intelligence": market_intelligence,
            "strategic_position": {
                "competitive_strength": "strong" if formation_analytics["financial_metrics"]["market_cap"] > Decimal('1000000000') else "moderate",
                "growth_trajectory": corp_info["lifecycle_stage"].value,
                "governance_maturity": "high" if governance_analytics["esg_analytics"]["overall_esg_score"] > 80 else "moderate",
                "market_readiness": "ipo_ready" if formation_analytics["governance_metrics"]["governance_score"] > 80 else "growth_stage"
            }
        }

# Example usage and testing
async def demonstrate_corporate_orchestrator():
    """Demonstrate the corporate orchestrator capabilities"""
    
    orchestrator = CorporateOrchestrator()
    
    print("🎭 CORPORATE ORCHESTRATOR DEMONSTRATION")
    print("=" * 60)
    
    # 1. Create complete corporation
    print("\n1. COMPLETE CORPORATION CREATION")
    print("-" * 30)
    
    corp_id = await orchestrator.create_complete_corporation(
        "NextGen AI Solutions",
        CorporateStructure.C_CORPORATION,
        Decimal('5000000'),  # $5M initial capital
        "technology"
    )
    
    print(f"Created corporation: {corp_id}")
    print(f"Industry: technology")
    print(f"Initial capital: $5,000,000")
    
    # 2. Manage funding rounds
    print("\n2. FUNDING ROUND MANAGEMENT")
    print("-" * 30)
    
    # Series A
    series_a_result = await orchestrator.manage_funding_round(
        corp_id,
        "Series A",
        Decimal('15000000'),  # $15M raised
        Decimal('60000000'),  # $60M post-money valuation
        ["Accel Partners", "Sequoia Capital"]
    )
    
    print(f"Series A Results:")
    print(f"  Amount Raised: ${series_a_result['amount_raised']:,.0f}")
    print(f"  Post-Money Valuation: ${series_a_result['post_money_valuation']:,.0f}")
    print(f"  Price per Share: ${series_a_result['price_per_share']:.2f}")
    print(f"  Dilution: {series_a_result['dilution_percentage']:.1f}%")
    print(f"  Lifecycle Stage: {series_a_result['lifecycle_stage']}")
    
    # Series B
    series_b_result = await orchestrator.manage_funding_round(
        corp_id,
        "Series B",
        Decimal('40000000'),  # $40M raised
        Decimal('200000000'), # $200M post-money valuation
        ["Tiger Global", "Andreessen Horowitz", "General Catalyst"]
    )
    
    print(f"\nSeries B Results:")
    print(f"  Amount Raised: ${series_b_result['amount_raised']:,.0f}")
    print(f"  Post-Money Valuation: ${series_b_result['post_money_valuation']:,.0f}")
    print(f"  Lifecycle Stage: {series_b_result['lifecycle_stage']}")
    
    # 3. Market intelligence analysis
    print("\n3. MARKET INTELLIGENCE ANALYSIS")
    print("-" * 30)
    
    intelligence = orchestrator.conduct_market_intelligence_analysis(corp_id)
    
    print("Market Intelligence Results:")
    print(f"  IPO Market: {intelligence['market_conditions']['ipo_market']['favorability']}")
    print(f"  M&A Activity: {intelligence['market_conditions']['ma_market']['activity_level']}")
    print(f"  Governance Percentile: {intelligence['governance_benchmark']['percentile_ranking']:.0f}th")
    print(f"  M&A Likelihood: {intelligence['ma_likelihood_analysis']['ma_likelihood_percentage']:.0f}%")
    
    print("\nStrategic Recommendations:")
    for rec in intelligence['strategic_recommendations']:
        print(f"  • {rec}")
    
    # 4. IPO process
    print("\n4. IPO ORCHESTRATION")
    print("-" * 30)
    
    ipo_result = await orchestrator.orchestrate_ipo_process(
        corp_id,
        Decimal('150000000')  # $150M target raise
    )
    
    print(f"IPO Results:")
    print(f"  Final Price: ${ipo_result['final_price']}")
    print(f"  Shares Sold: {ipo_result['shares_sold']:,}")
    print(f"  Gross Proceeds: ${ipo_result['gross_proceeds']:,.0f}")
    print(f"  Post-Money Valuation: ${ipo_result['post_money_valuation']:,.0f}")
    print(f"  Public Float: {ipo_result['public_float_percentage']:.1f}%")
    
    # 5. Create acquisition target
    print("\n5. M&A TRANSACTION ORCHESTRATION")
    print("-" * 30)
    
    target_id = await orchestrator.create_complete_corporation(
        "DataInsights Corp",
        CorporateStructure.C_CORPORATION,
        Decimal('2000000'),
        "technology"
    )
    
    # Simulate target growth
    await orchestrator.manage_funding_round(
        target_id,
        "Series A",
        Decimal('8000000'),
        Decimal('32000000'),
        ["Benchmark Capital"]
    )
    
    # Execute acquisition
    ma_result = await orchestrator.execute_ma_transaction(
        corp_id,  # acquirer
        target_id,  # target
        TransactionType.ACQUISITION,
        Decimal('50000000')  # $50M offer
    )
    
    print(f"M&A Transaction Results:")
    print(f"  Transaction ID: {ma_result['transaction_id']}")
    print(f"  Due Diligence: {ma_result['due_diligence']['recommendation']}")
    print(f"  Close Status: {ma_result['close_results']['status']}")
    
    if ma_result['close_results']['status'] == 'completed':
        print(f"  Transaction Value: ${ma_result['close_results']['transaction_value']:,.0f}")
        print(f"  Expected Synergies: ${ma_result['close_results']['synergies_expected']:,.0f}")
    
    # 6. Comprehensive corporation profile
    print("\n6. COMPREHENSIVE CORPORATION PROFILE")
    print("-" * 30)
    
    profile = orchestrator.get_corporation_comprehensive_profile(corp_id)
    
    print(f"Corporation Profile for {corp_id}:")
    print(f"  Lifecycle Stage: {profile['corporation_profile']['lifecycle_stage']}")
    print(f"  Market Cap: ${profile['formation_data']['financial_metrics']['market_cap']:,.0f}")
    print(f"  Governance Score: {profile['governance_data']['governance_analytics']['overall_esg_score']:.0f}/100")
    print(f"  ESG Rating: {profile['governance_data']['esg_analytics']['esg_rating']}")
    print(f"  Total Events: {profile['corporate_events']['total_events']}")
    print(f"  Strategic Position: {profile['strategic_position']['competitive_strength']}")
    
    # 7. Corporate ecosystem overview
    print("\n7. CORPORATE ECOSYSTEM OVERVIEW")
    print("-" * 30)
    
    ecosystem = orchestrator.get_corporate_ecosystem_overview()
    
    print("Corporate Ecosystem Overview:")
    print(f"  Total Corporations: {ecosystem['ecosystem_overview']['total_corporations']}")
    print(f"  Total Market Value: ${ecosystem['ecosystem_overview']['total_market_value']:,.0f}")
    print(f"  Public Companies: {ecosystem['ecosystem_overview']['public_companies']}")
    print(f"  Events Last 90 Days: {ecosystem['recent_activity']['events_last_90_days']}")
    
    print("\nLifecycle Distribution:")
    for stage, count in ecosystem['lifecycle_distribution'].items():
        print(f"  {stage.replace('_', ' ').title()}: {count}")
        
    print("\nMarket Cap Distribution:")
    for range_name, count in ecosystem['market_cap_distribution'].items():
        print(f"  {range_name.replace('_', ' ').title()}: {count}")
    
    print("\n✅ Corporate Orchestrator demonstration completed successfully!")
    return orchestrator

if __name__ == "__main__":
    # Run the demonstration
    asyncio.run(demonstrate_corporate_orchestrator())
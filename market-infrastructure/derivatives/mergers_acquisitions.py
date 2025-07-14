"""
Mergers & Acquisitions Framework - Phase 3 Market Complexity
==========================================================

Comprehensive M&A transaction management system with sophisticated
due diligence, valuation, financing, and integration capabilities.

Features:
- Complete M&A transaction lifecycle management
- Sophisticated valuation models and scenarios
- Comprehensive due diligence frameworks
- Financing structure optimization
- Integration planning and execution
- Regulatory approval processes
- Cross-border transaction capabilities
"""

import asyncio
import json
import uuid
from dataclasses import dataclass, field
from decimal import Decimal
from datetime import datetime, timedelta
from enum import Enum
from typing import Dict, List, Optional, Any, Tuple, Set
import logging
from collections import defaultdict
import random
import math

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class TransactionType(Enum):
    """Types of M&A transactions"""
    MERGER_OF_EQUALS = "merger_of_equals"
    ACQUISITION = "acquisition"
    REVERSE_MERGER = "reverse_merger"
    TENDER_OFFER = "tender_offer"
    LEVERAGED_BUYOUT = "leveraged_buyout"
    MANAGEMENT_BUYOUT = "management_buyout"
    SPIN_OFF = "spin_off"
    CARVE_OUT = "carve_out"
    JOINT_VENTURE = "joint_venture"
    ASSET_PURCHASE = "asset_purchase"
    RECAPITALIZATION = "recapitalization"

class DueDiligenceArea(Enum):
    """Areas of due diligence review"""
    FINANCIAL = "financial"
    LEGAL = "legal"
    OPERATIONAL = "operational"
    COMMERCIAL = "commercial"
    TECHNOLOGY = "technology"
    HUMAN_RESOURCES = "human_resources"
    ENVIRONMENTAL = "environmental"
    TAX = "tax"
    REGULATORY = "regulatory"
    INTELLECTUAL_PROPERTY = "intellectual_property"

class ValuationMethod(Enum):
    """Valuation methodologies"""
    DCF = "discounted_cash_flow"
    COMPARABLE_COMPANIES = "comparable_companies"
    PRECEDENT_TRANSACTIONS = "precedent_transactions"
    LBO_ANALYSIS = "leveraged_buyout_analysis"
    SUM_OF_PARTS = "sum_of_parts"
    ASSET_BASED = "asset_based"
    REPLACEMENT_COST = "replacement_cost"

class FinancingSource(Enum):
    """Sources of transaction financing"""
    CASH = "cash"
    DEBT = "debt"
    EQUITY = "equity"
    MEZZANINE = "mezzanine"
    SELLER_FINANCING = "seller_financing"
    EARNOUT = "earnout"
    CONTINGENT_VALUE_RIGHTS = "contingent_value_rights"

class IntegrationArea(Enum):
    """Areas of post-merger integration"""
    SYSTEMS_INTEGRATION = "systems_integration"
    ORGANIZATIONAL_DESIGN = "organizational_design"
    CULTURE_INTEGRATION = "culture_integration"
    OPERATIONS_INTEGRATION = "operations_integration"
    TECHNOLOGY_INTEGRATION = "technology_integration"
    CUSTOMER_INTEGRATION = "customer_integration"
    SUPPLIER_INTEGRATION = "supplier_integration"

@dataclass
class ValuationRange:
    """Valuation range from different methodologies"""
    method: ValuationMethod
    low_value: Decimal
    base_value: Decimal
    high_value: Decimal
    weight: float
    confidence_level: float
    
    def get_weighted_value(self) -> Decimal:
        """Get confidence-weighted valuation"""
        return self.base_value * Decimal(str(self.confidence_level))

@dataclass
class DueDiligenceItem:
    """Individual due diligence review item"""
    area: DueDiligenceArea
    item_name: str
    description: str
    priority: str  # "high", "medium", "low"
    assigned_team: str
    status: str    # "pending", "in_progress", "completed", "issue_identified"
    completion_date: Optional[datetime] = None
    findings: List[str] = field(default_factory=list)
    risk_level: str = "low"  # "low", "medium", "high", "critical"
    
class SynergyAnalysis:
    """Analysis of transaction synergies"""
    
    def __init__(self, acquirer_revenue: Decimal, target_revenue: Decimal,
                 acquirer_costs: Decimal, target_costs: Decimal):
        self.acquirer_revenue = acquirer_revenue
        self.target_revenue = target_revenue
        self.acquirer_costs = acquirer_costs
        self.target_costs = target_costs
        
        # Synergy categories
        self.cost_synergies = self._calculate_cost_synergies()
        self.revenue_synergies = self._calculate_revenue_synergies()
        self.tax_synergies = self._calculate_tax_synergies()
        self.financial_synergies = self._calculate_financial_synergies()
        
        # Implementation timeline
        self.synergy_timeline = self._create_synergy_timeline()
        
    def _calculate_cost_synergies(self) -> Dict[str, Decimal]:
        """Calculate various cost synergies"""
        combined_costs = self.acquirer_costs + self.target_costs
        
        synergies = {
            "headcount_reduction": combined_costs * Decimal('0.08'),      # 8% of costs
            "facilities_consolidation": combined_costs * Decimal('0.03'), # 3% of costs
            "procurement_savings": combined_costs * Decimal('0.02'),      # 2% of costs
            "systems_consolidation": combined_costs * Decimal('0.015'),   # 1.5% of costs
            "vendor_rationalization": combined_costs * Decimal('0.01'),   # 1% of costs
            "overhead_elimination": combined_costs * Decimal('0.025')     # 2.5% of costs
        }
        
        return synergies
        
    def _calculate_revenue_synergies(self) -> Dict[str, Decimal]:
        """Calculate various revenue synergies"""
        combined_revenue = self.acquirer_revenue + self.target_revenue
        
        synergies = {
            "cross_selling": combined_revenue * Decimal('0.03'),         # 3% revenue uplift
            "market_expansion": combined_revenue * Decimal('0.02'),      # 2% revenue uplift
            "product_bundling": combined_revenue * Decimal('0.015'),     # 1.5% revenue uplift
            "pricing_optimization": combined_revenue * Decimal('0.01'),  # 1% revenue uplift
            "channel_optimization": combined_revenue * Decimal('0.01'),  # 1% revenue uplift
            "innovation_acceleration": combined_revenue * Decimal('0.02') # 2% revenue uplift
        }
        
        return synergies
        
    def _calculate_tax_synergies(self) -> Dict[str, Decimal]:
        """Calculate tax-related synergies"""
        combined_revenue = self.acquirer_revenue + self.target_revenue
        
        synergies = {
            "tax_optimization": combined_revenue * Decimal('0.005'),     # 0.5% revenue
            "loss_utilization": combined_revenue * Decimal('0.003'),     # 0.3% revenue
            "interest_deductibility": combined_revenue * Decimal('0.002') # 0.2% revenue
        }
        
        return synergies
        
    def _calculate_financial_synergies(self) -> Dict[str, Decimal]:
        """Calculate financial synergies"""
        combined_revenue = self.acquirer_revenue + self.target_revenue
        
        synergies = {
            "cost_of_capital_reduction": combined_revenue * Decimal('0.01'), # 1% revenue
            "debt_capacity_optimization": combined_revenue * Decimal('0.005'), # 0.5% revenue
            "working_capital_optimization": combined_revenue * Decimal('0.01') # 1% revenue
        }
        
        return synergies
        
    def _create_synergy_timeline(self) -> Dict[str, Dict[str, float]]:
        """Create timeline for synergy realization"""
        return {
            "year_1": {
                "cost_synergies": 0.3,      # 30% of cost synergies realized
                "revenue_synergies": 0.1,   # 10% of revenue synergies realized
                "tax_synergies": 0.5,       # 50% of tax synergies realized
                "financial_synergies": 0.4  # 40% of financial synergies realized
            },
            "year_2": {
                "cost_synergies": 0.7,      # 70% cumulative
                "revenue_synergies": 0.4,   # 40% cumulative
                "tax_synergies": 0.8,       # 80% cumulative
                "financial_synergies": 0.7  # 70% cumulative
            },
            "year_3": {
                "cost_synergies": 1.0,      # 100% cumulative
                "revenue_synergies": 0.8,   # 80% cumulative
                "tax_synergies": 1.0,       # 100% cumulative
                "financial_synergies": 1.0  # 100% cumulative
            }
        }
        
    def get_total_synergies(self) -> Dict[str, Decimal]:
        """Get total synergies by category"""
        return {
            "total_cost_synergies": sum(self.cost_synergies.values()),
            "total_revenue_synergies": sum(self.revenue_synergies.values()),
            "total_tax_synergies": sum(self.tax_synergies.values()),
            "total_financial_synergies": sum(self.financial_synergies.values()),
            "total_synergies": (sum(self.cost_synergies.values()) + 
                              sum(self.revenue_synergies.values()) + 
                              sum(self.tax_synergies.values()) + 
                              sum(self.financial_synergies.values()))
        }
        
    def calculate_synergy_npv(self, discount_rate: Decimal = Decimal('0.1')) -> Decimal:
        """Calculate NPV of synergies over 3 years"""
        total_synergies = self.get_total_synergies()["total_synergies"]
        
        npv = Decimal('0')
        
        for year in range(1, 4):  # 3 years
            year_key = f"year_{year}"
            timeline = self.synergy_timeline[year_key]
            
            # Calculate weighted synergy realization for the year
            year_synergies = (
                sum(self.cost_synergies.values()) * Decimal(str(timeline["cost_synergies"])) +
                sum(self.revenue_synergies.values()) * Decimal(str(timeline["revenue_synergies"])) +
                sum(self.tax_synergies.values()) * Decimal(str(timeline["tax_synergies"])) +
                sum(self.financial_synergies.values()) * Decimal(str(timeline["financial_synergies"]))
            ) / 4  # Average across categories
            
            # Discount to present value
            pv_factor = Decimal('1') / ((Decimal('1') + discount_rate) ** year)
            npv += year_synergies * pv_factor
            
        return npv

class ValuationModel:
    """Comprehensive valuation model for M&A transactions"""
    
    def __init__(self, target_company_data: Dict[str, Any]):
        self.target_data = target_company_data
        self.valuation_ranges: List[ValuationRange] = []
        
        # Key financial metrics
        self.revenue = Decimal(str(target_company_data.get("revenue", 100000000)))
        self.ebitda = Decimal(str(target_company_data.get("ebitda", 20000000)))
        self.net_income = Decimal(str(target_company_data.get("net_income", 12000000)))
        self.total_assets = Decimal(str(target_company_data.get("total_assets", 150000000)))
        self.total_debt = Decimal(str(target_company_data.get("total_debt", 50000000)))
        self.cash = Decimal(str(target_company_data.get("cash", 15000000)))
        
        # Growth assumptions
        self.revenue_growth_rate = Decimal(str(target_company_data.get("revenue_growth", 0.1)))
        self.ebitda_margin = self.ebitda / self.revenue
        
    def dcf_valuation(self, projection_years: int = 5, 
                     terminal_growth_rate: Decimal = Decimal('0.03'),
                     discount_rate: Decimal = Decimal('0.12')) -> ValuationRange:
        """Perform discounted cash flow valuation"""
        
        # Project free cash flows
        free_cash_flows = []
        current_revenue = self.revenue
        
        for year in range(1, projection_years + 1):
            # Project revenue growth
            year_revenue = current_revenue * (Decimal('1') + self.revenue_growth_rate)
            year_ebitda = year_revenue * self.ebitda_margin
            
            # Estimate free cash flow (simplified)
            year_taxes = year_ebitda * Decimal('0.25')  # 25% tax rate
            year_capex = year_revenue * Decimal('0.03')  # 3% of revenue
            year_working_capital_change = year_revenue * Decimal('0.02')  # 2% of revenue
            
            year_fcf = year_ebitda - year_taxes - year_capex - year_working_capital_change
            free_cash_flows.append(year_fcf)
            current_revenue = year_revenue
            
        # Calculate terminal value
        terminal_fcf = free_cash_flows[-1] * (Decimal('1') + terminal_growth_rate)
        terminal_value = terminal_fcf / (discount_rate - terminal_growth_rate)
        
        # Discount all cash flows to present value
        pv_cash_flows = Decimal('0')
        for year, fcf in enumerate(free_cash_flows, 1):
            pv_factor = Decimal('1') / ((Decimal('1') + discount_rate) ** year)
            pv_cash_flows += fcf * pv_factor
            
        # Discount terminal value
        terminal_pv_factor = Decimal('1') / ((Decimal('1') + discount_rate) ** projection_years)
        pv_terminal_value = terminal_value * terminal_pv_factor
        
        # Enterprise value
        enterprise_value = pv_cash_flows + pv_terminal_value
        
        # Equity value
        equity_value = enterprise_value - self.total_debt + self.cash
        
        # Create range (+/- 15% for DCF uncertainty)
        base_value = equity_value
        low_value = base_value * Decimal('0.85')
        high_value = base_value * Decimal('1.15')
        
        return ValuationRange(
            method=ValuationMethod.DCF,
            low_value=low_value,
            base_value=base_value,
            high_value=high_value,
            weight=0.4,  # 40% weight in blended valuation
            confidence_level=0.8
        )
        
    def comparable_companies_valuation(self) -> ValuationRange:
        """Valuation based on comparable public companies"""
        
        # Industry multiples (simulated)
        ev_revenue_multiple = Decimal('3.5')
        ev_ebitda_multiple = Decimal('12.0')
        pe_multiple = Decimal('18.0')
        
        # Calculate valuations using different multiples
        ev_from_revenue = self.revenue * ev_revenue_multiple
        ev_from_ebitda = self.ebitda * ev_ebitda_multiple
        equity_from_pe = self.net_income * pe_multiple
        
        # Convert EV to equity value
        equity_from_revenue = ev_from_revenue - self.total_debt + self.cash
        equity_from_ebitda = ev_from_ebitda - self.total_debt + self.cash
        
        # Average the approaches
        base_value = (equity_from_revenue + equity_from_ebitda + equity_from_pe) / 3
        
        # Create range (+/- 20% for market volatility)
        low_value = base_value * Decimal('0.8')
        high_value = base_value * Decimal('1.2')
        
        return ValuationRange(
            method=ValuationMethod.COMPARABLE_COMPANIES,
            low_value=low_value,
            base_value=base_value,
            high_value=high_value,
            weight=0.35,  # 35% weight
            confidence_level=0.85
        )
        
    def precedent_transactions_valuation(self) -> ValuationRange:
        """Valuation based on precedent M&A transactions"""
        
        # Transaction multiples (typically higher than trading multiples)
        ev_revenue_multiple = Decimal('4.2')  # 20% premium
        ev_ebitda_multiple = Decimal('14.5')  # 20% premium
        
        # Calculate valuations
        ev_from_revenue = self.revenue * ev_revenue_multiple
        ev_from_ebitda = self.ebitda * ev_ebitda_multiple
        
        # Convert to equity value
        equity_from_revenue = ev_from_revenue - self.total_debt + self.cash
        equity_from_ebitda = ev_from_ebitda - self.total_debt + self.cash
        
        # Average the approaches
        base_value = (equity_from_revenue + equity_from_ebitda) / 2
        
        # Create range (+/- 25% for transaction variability)
        low_value = base_value * Decimal('0.75')
        high_value = base_value * Decimal('1.25')
        
        return ValuationRange(
            method=ValuationMethod.PRECEDENT_TRANSACTIONS,
            low_value=low_value,
            base_value=base_value,
            high_value=high_value,
            weight=0.25,  # 25% weight
            confidence_level=0.75
        )
        
    def perform_comprehensive_valuation(self) -> Dict[str, Any]:
        """Perform comprehensive valuation using multiple methods"""
        
        # Calculate valuation ranges
        dcf_range = self.dcf_valuation()
        comps_range = self.comparable_companies_valuation()
        precedents_range = self.precedent_transactions_valuation()
        
        self.valuation_ranges = [dcf_range, comps_range, precedents_range]
        
        # Calculate weighted average valuation
        weighted_low = sum(vr.low_value * Decimal(str(vr.weight)) for vr in self.valuation_ranges)
        weighted_base = sum(vr.base_value * Decimal(str(vr.weight)) for vr in self.valuation_ranges)
        weighted_high = sum(vr.high_value * Decimal(str(vr.weight)) for vr in self.valuation_ranges)
        
        # Calculate football field range
        all_lows = [vr.low_value for vr in self.valuation_ranges]
        all_highs = [vr.high_value for vr in self.valuation_ranges]
        
        return {
            "valuation_methods": {
                "dcf": {
                    "low": dcf_range.low_value,
                    "base": dcf_range.base_value,
                    "high": dcf_range.high_value
                },
                "comparable_companies": {
                    "low": comps_range.low_value,
                    "base": comps_range.base_value,
                    "high": comps_range.high_value
                },
                "precedent_transactions": {
                    "low": precedents_range.low_value,
                    "base": precedents_range.base_value,
                    "high": precedents_range.high_value
                }
            },
            "weighted_average": {
                "low": weighted_low,
                "base": weighted_base,
                "high": weighted_high
            },
            "football_field_range": {
                "minimum": min(all_lows),
                "maximum": max(all_highs)
            },
            "recommendation": {
                "fair_value": weighted_base,
                "offer_range_low": weighted_base * Decimal('1.05'),  # 5% premium minimum
                "offer_range_high": weighted_base * Decimal('1.25')  # 25% premium maximum
            }
        }

class MATransaction:
    """Comprehensive M&A transaction management"""
    
    def __init__(self, transaction_id: str, transaction_type: TransactionType,
                 acquirer_data: Dict[str, Any], target_data: Dict[str, Any]):
        self.transaction_id = transaction_id
        self.transaction_type = transaction_type
        self.acquirer_data = acquirer_data
        self.target_data = target_data
        
        # Transaction timeline
        self.announcement_date = datetime.now()
        self.expected_close_date = self._calculate_expected_close_date()
        self.actual_close_date = None
        
        # Transaction terms
        self.offer_price_per_share = Decimal('0')
        self.total_transaction_value = Decimal('0')
        self.premium_to_market = Decimal('0')
        
        # Financing structure
        self.financing_structure = {}
        self.total_financing_required = Decimal('0')
        
        # Due diligence
        self.due_diligence_items: List[DueDiligenceItem] = []
        self.due_diligence_complete = False
        
        # Regulatory approvals
        self.regulatory_approvals_required = []
        self.regulatory_approvals_received = []
        
        # Shareholder approvals
        self.shareholder_approvals = {}
        
        # Integration planning
        self.integration_plan = {}
        
        # Transaction status
        self.status = "announced"  # announced, pending, approved, completed, terminated
        
        # Initialize components
        self.valuation_model = ValuationModel(target_data)
        self.synergy_analysis = None
        
    def _calculate_expected_close_date(self) -> datetime:
        """Calculate expected transaction close date"""
        base_timeline = {
            TransactionType.ACQUISITION: 120,           # 4 months
            TransactionType.MERGER_OF_EQUALS: 180,      # 6 months
            TransactionType.LEVERAGED_BUYOUT: 90,       # 3 months
            TransactionType.TENDER_OFFER: 60,           # 2 months
            TransactionType.ASSET_PURCHASE: 90,         # 3 months
            TransactionType.JOINT_VENTURE: 120          # 4 months
        }
        
        days_to_close = base_timeline.get(self.transaction_type, 120)
        return self.announcement_date + timedelta(days=days_to_close)
        
    def structure_transaction(self, offer_price: Decimal, 
                            financing_sources: Dict[FinancingSource, Decimal]) -> Dict[str, Any]:
        """Structure the transaction terms and financing"""
        
        # Basic transaction terms
        target_shares = self.target_data.get("outstanding_shares", 10000000)
        self.offer_price_per_share = offer_price
        self.total_transaction_value = offer_price * Decimal(str(target_shares))
        
        # Calculate premium
        current_market_price = Decimal(str(self.target_data.get("current_share_price", 50.0)))
        self.premium_to_market = (offer_price - current_market_price) / current_market_price * 100
        
        # Structure financing
        self.financing_structure = {}
        self.total_financing_required = self.total_transaction_value
        
        for source, amount in financing_sources.items():
            self.financing_structure[source.value] = {
                "amount": amount,
                "percentage": float(amount / self.total_financing_required * 100),
                "cost_of_capital": self._get_financing_cost(source),
                "terms": self._get_financing_terms(source)
            }
            
        # Calculate synergies
        acquirer_revenue = Decimal(str(self.acquirer_data.get("revenue", 500000000)))
        target_revenue = Decimal(str(self.target_data.get("revenue", 100000000)))
        acquirer_costs = acquirer_revenue - Decimal(str(self.acquirer_data.get("ebitda", 100000000)))
        target_costs = target_revenue - Decimal(str(self.target_data.get("ebitda", 20000000)))
        
        self.synergy_analysis = SynergyAnalysis(acquirer_revenue, target_revenue, 
                                              acquirer_costs, target_costs)
        
        return {
            "transaction_terms": {
                "offer_price_per_share": self.offer_price_per_share,
                "total_transaction_value": self.total_transaction_value,
                "premium_to_market": self.premium_to_market,
                "transaction_multiple_revenue": self.total_transaction_value / Decimal(str(self.target_data.get("revenue", 1))),
                "transaction_multiple_ebitda": self.total_transaction_value / Decimal(str(self.target_data.get("ebitda", 1)))
            },
            "financing_structure": self.financing_structure,
            "synergies": self.synergy_analysis.get_total_synergies(),
            "synergy_npv": self.synergy_analysis.calculate_synergy_npv()
        }
        
    def _get_financing_cost(self, source: FinancingSource) -> Decimal:
        """Get cost of capital for financing source"""
        costs = {
            FinancingSource.CASH: Decimal('0.02'),      # 2% opportunity cost
            FinancingSource.DEBT: Decimal('0.06'),      # 6% interest rate
            FinancingSource.EQUITY: Decimal('0.12'),    # 12% cost of equity
            FinancingSource.MEZZANINE: Decimal('0.15'), # 15% mezzanine cost
            FinancingSource.SELLER_FINANCING: Decimal('0.08'), # 8% seller note
            FinancingSource.EARNOUT: Decimal('0.10')    # 10% earnout discount
        }
        return costs.get(source, Decimal('0.10'))
        
    def _get_financing_terms(self, source: FinancingSource) -> Dict[str, Any]:
        """Get typical terms for financing source"""
        terms = {
            FinancingSource.CASH: {"maturity": "immediate", "security": "none"},
            FinancingSource.DEBT: {"maturity": "5_years", "security": "senior_secured"},
            FinancingSource.EQUITY: {"maturity": "permanent", "dilution": "yes"},
            FinancingSource.MEZZANINE: {"maturity": "7_years", "equity_kicker": "yes"},
            FinancingSource.SELLER_FINANCING: {"maturity": "3_years", "subordinated": "yes"},
            FinancingSource.EARNOUT: {"maturity": "3_years", "performance_based": "yes"}
        }
        return terms.get(source, {})
        
    def create_due_diligence_plan(self) -> List[DueDiligenceItem]:
        """Create comprehensive due diligence plan"""
        
        dd_items = []
        
        # Financial due diligence
        financial_items = [
            ("Financial Statements Audit", "Review 3-year audited financials", "high"),
            ("Quality of Earnings", "Analyze earnings quality and sustainability", "high"),
            ("Working Capital Analysis", "Review working capital requirements", "medium"),
            ("Debt Analysis", "Review all debt instruments and covenants", "high"),
            ("Tax Review", "Comprehensive tax position analysis", "medium"),
            ("Management Projections", "Review business plan and forecasts", "medium")
        ]
        
        for name, desc, priority in financial_items:
            dd_items.append(DueDiligenceItem(
                area=DueDiligenceArea.FINANCIAL,
                item_name=name,
                description=desc,
                priority=priority,
                assigned_team="Financial DD Team",
                status="pending"
            ))
            
        # Legal due diligence
        legal_items = [
            ("Corporate Structure", "Review corporate organization and entities", "high"),
            ("Material Contracts", "Review all material customer and supplier contracts", "high"),
            ("Litigation Review", "Identify all pending and threatened litigation", "high"),
            ("Regulatory Compliance", "Review compliance with applicable regulations", "medium"),
            ("Environmental Liabilities", "Assess environmental risks and liabilities", "medium"),
            ("Employment Matters", "Review employment agreements and policies", "medium")
        ]
        
        for name, desc, priority in legal_items:
            dd_items.append(DueDiligenceItem(
                area=DueDiligenceArea.LEGAL,
                item_name=name,
                description=desc,
                priority=priority,
                assigned_team="Legal DD Team",
                status="pending"
            ))
            
        # Operational due diligence
        operational_items = [
            ("Market Position", "Analyze competitive position and market share", "high"),
            ("Customer Analysis", "Review customer concentration and loyalty", "high"),
            ("Supplier Analysis", "Assess supplier relationships and dependencies", "medium"),
            ("Operations Review", "Evaluate operational efficiency and scalability", "medium"),
            ("Management Assessment", "Assess management team capabilities", "high"),
            ("IT Systems Review", "Review technology infrastructure and capabilities", "medium")
        ]
        
        for name, desc, priority in operational_items:
            dd_items.append(DueDiligenceItem(
                area=DueDiligenceArea.OPERATIONAL,
                item_name=name,
                description=desc,
                priority=priority,
                assigned_team="Operational DD Team",
                status="pending"
            ))
            
        self.due_diligence_items = dd_items
        return dd_items
        
    def conduct_due_diligence(self) -> Dict[str, Any]:
        """Conduct due diligence review"""
        
        if not self.due_diligence_items:
            self.create_due_diligence_plan()
            
        # Simulate due diligence completion
        total_items = len(self.due_diligence_items)
        completed_items = 0
        issues_identified = 0
        
        for item in self.due_diligence_items:
            # Simulate completion (80% completion rate)
            if random.random() < 0.8:
                item.status = "completed"
                item.completion_date = datetime.now()
                completed_items += 1
                
                # Simulate issue identification (15% chance)
                if random.random() < 0.15:
                    item.risk_level = random.choice(["medium", "high"])
                    item.findings.append(f"Issue identified in {item.item_name}")
                    issues_identified += 1
            else:
                item.status = "in_progress"
                
        completion_rate = completed_items / total_items * 100
        self.due_diligence_complete = completion_rate > 95
        
        # Categorize findings by area
        findings_by_area = defaultdict(list)
        for item in self.due_diligence_items:
            if item.findings:
                findings_by_area[item.area.value].extend(item.findings)
                
        return {
            "completion_rate": completion_rate,
            "total_items": total_items,
            "completed_items": completed_items,
            "issues_identified": issues_identified,
            "high_risk_items": len([item for item in self.due_diligence_items if item.risk_level == "high"]),
            "findings_by_area": dict(findings_by_area),
            "recommendation": "proceed" if issues_identified < 3 else "proceed_with_caution" if issues_identified < 6 else "reconsider"
        }
        
    def get_regulatory_requirements(self) -> List[str]:
        """Determine required regulatory approvals"""
        
        approvals = []
        
        # Antitrust approvals
        transaction_value = self.total_transaction_value
        if transaction_value > Decimal('100000000'):  # $100M threshold
            approvals.append("HSR_Filing_Required")
            
        if transaction_value > Decimal('1000000000'):  # $1B threshold
            approvals.append("DOJ_Antitrust_Review")
            
        if transaction_value > Decimal('5000000000'):  # $5B threshold
            approvals.append("FTC_Second_Request_Likely")
            
        # Industry-specific approvals
        target_industry = self.target_data.get("industry", "")
        if "bank" in target_industry.lower():
            approvals.extend(["Federal_Reserve_Approval", "FDIC_Approval", "State_Banking_Approval"])
        elif "insurance" in target_industry.lower():
            approvals.append("State_Insurance_Commission_Approval")
        elif "telecom" in target_industry.lower():
            approvals.extend(["FCC_Approval", "State_Telecom_Approval"])
        elif "utility" in target_industry.lower():
            approvals.extend(["FERC_Approval", "State_Utility_Commission_Approval"])
            
        # Foreign investment review
        acquirer_country = self.acquirer_data.get("country", "US")
        target_country = self.target_data.get("country", "US")
        
        if acquirer_country != "US" and target_country == "US":
            approvals.append("CFIUS_Review")
        elif target_country != "US":
            approvals.append(f"{target_country}_Foreign_Investment_Review")
            
        # Securities approvals
        if self.transaction_type in [TransactionType.MERGER_OF_EQUALS, TransactionType.ACQUISITION]:
            approvals.append("SEC_Registration_Statement")
            
        self.regulatory_approvals_required = approvals
        return approvals
        
    def create_integration_plan(self) -> Dict[str, Any]:
        """Create post-merger integration plan"""
        
        integration_plan = {
            "integration_approach": self._determine_integration_approach(),
            "timeline": self._create_integration_timeline(),
            "workstreams": self._define_integration_workstreams(),
            "governance": self._setup_integration_governance(),
            "synergy_tracking": self._setup_synergy_tracking(),
            "risk_mitigation": self._identify_integration_risks()
        }
        
        self.integration_plan = integration_plan
        return integration_plan
        
    def _determine_integration_approach(self) -> str:
        """Determine integration approach based on transaction characteristics"""
        
        # Factors influencing integration approach
        size_ratio = Decimal(str(self.target_data.get("revenue", 1))) / Decimal(str(self.acquirer_data.get("revenue", 1)))
        industry_overlap = self.acquirer_data.get("industry") == self.target_data.get("industry")
        
        if size_ratio < 0.1:  # Small target
            return "absorption"
        elif size_ratio > 0.8 and industry_overlap:  # Large, similar business
            return "best_of_both"
        elif not industry_overlap:
            return "preservation"
        else:
            return "transformation"
            
    def _create_integration_timeline(self) -> Dict[str, Dict[str, str]]:
        """Create integration timeline"""
        
        close_date = self.expected_close_date
        
        return {
            "day_1": {
                "period": "Day 1",
                "key_activities": "Legal close, communications, day 1 operations",
                "duration": "1 day",
                "start_date": close_date.strftime("%Y-%m-%d")
            },
            "first_100_days": {
                "period": "Days 1-100",
                "key_activities": "Leadership team integration, quick wins, detailed planning",
                "duration": "100 days",
                "start_date": close_date.strftime("%Y-%m-%d")
            },
            "year_1": {
                "period": "Year 1",
                "key_activities": "System integration, organization design, major synergies",
                "duration": "12 months",
                "start_date": close_date.strftime("%Y-%m-%d")
            },
            "year_2_3": {
                "period": "Years 2-3",
                "key_activities": "Full integration, culture alignment, performance optimization",
                "duration": "24 months",
                "start_date": (close_date + timedelta(days=365)).strftime("%Y-%m-%d")
            }
        }
        
    def _define_integration_workstreams(self) -> Dict[str, Dict[str, Any]]:
        """Define integration workstreams"""
        
        return {
            "leadership_integration": {
                "priority": "critical",
                "timeline": "first_100_days",
                "activities": ["Leadership team selection", "Organizational design", "Communication strategy"],
                "dependencies": ["Legal close"]
            },
            "systems_integration": {
                "priority": "high",
                "timeline": "year_1",
                "activities": ["ERP integration", "Data migration", "IT infrastructure"],
                "dependencies": ["Leadership integration"]
            },
            "commercial_integration": {
                "priority": "high",
                "timeline": "first_100_days",
                "activities": ["Sales force integration", "Customer communications", "Product portfolio"],
                "dependencies": ["Leadership integration"]
            },
            "operations_integration": {
                "priority": "medium",
                "timeline": "year_1",
                "activities": ["Facility consolidation", "Process standardization", "Supply chain"],
                "dependencies": ["Systems integration"]
            },
            "culture_integration": {
                "priority": "medium",
                "timeline": "year_2_3",
                "activities": ["Culture assessment", "Training programs", "Employee engagement"],
                "dependencies": ["Leadership integration"]
            }
        }
        
    def _setup_integration_governance(self) -> Dict[str, Any]:
        """Setup integration governance structure"""
        
        return {
            "steering_committee": {
                "chair": "Acquirer CEO",
                "members": ["CFO", "COO", "CHRO", "CTO", "Target CEO"],
                "meeting_frequency": "weekly",
                "responsibilities": ["Strategic decisions", "Resource allocation", "Issue escalation"]
            },
            "integration_management_office": {
                "lead": "Integration Director",
                "team_size": 8,
                "responsibilities": ["Program management", "Communication", "Synergy tracking"],
                "reporting": "Weekly to steering committee"
            },
            "workstream_leads": {
                "count": 5,
                "responsibilities": ["Workstream execution", "Timeline management", "Issue identification"],
                "reporting": "Bi-weekly to IMO"
            }
        }
        
    def _setup_synergy_tracking(self) -> Dict[str, Any]:
        """Setup synergy tracking and measurement"""
        
        if not self.synergy_analysis:
            return {}
            
        total_synergies = self.synergy_analysis.get_total_synergies()
        
        return {
            "tracking_methodology": "bottom_up",
            "reporting_frequency": "monthly",
            "synergy_targets": {
                "year_1": total_synergies["total_synergies"] * Decimal('0.3'),
                "year_2": total_synergies["total_synergies"] * Decimal('0.7'),
                "year_3": total_synergies["total_synergies"] * Decimal('1.0')
            },
            "accountability": {
                "cost_synergies": "CFO",
                "revenue_synergies": "Commercial Lead",
                "tax_synergies": "Tax Director",
                "financial_synergies": "CFO"
            },
            "measurement_approach": {
                "baseline_establishment": "Pre-close run rate",
                "adjustment_methodology": "Clean team approach",
                "verification_process": "Third party validation"
            }
        }
        
    def _identify_integration_risks(self) -> List[Dict[str, Any]]:
        """Identify key integration risks"""
        
        return [
            {
                "risk": "Key talent retention",
                "probability": "medium",
                "impact": "high",
                "mitigation": "Retention programs, communication, career development"
            },
            {
                "risk": "Customer attrition",
                "probability": "medium",
                "impact": "high",
                "mitigation": "Customer communication, service continuity, account management"
            },
            {
                "risk": "System integration delays",
                "probability": "high",
                "impact": "medium",
                "mitigation": "Parallel systems, phased approach, expert resources"
            },
            {
                "risk": "Cultural integration challenges",
                "probability": "medium",
                "impact": "medium",
                "mitigation": "Culture assessment, communication, training programs"
            },
            {
                "risk": "Synergy delivery shortfall",
                "probability": "medium",
                "impact": "high",
                "mitigation": "Detailed planning, tracking, accountability, contingency plans"
            }
        ]

class MASystem:
    """Comprehensive M&A transaction management system"""
    
    def __init__(self):
        self.transactions: Dict[str, MATransaction] = {}
        self.system_id = "ma_system_v1"
        
        # Market statistics
        self.total_transaction_value = Decimal('0')
        self.completed_transactions = 0
        self.average_premium = Decimal('0')
        
        logger.info("M&A System initialized")
        
    async def initiate_transaction(self, transaction_type: TransactionType,
                                 acquirer_data: Dict[str, Any],
                                 target_data: Dict[str, Any]) -> str:
        """Initiate a new M&A transaction"""
        
        transaction_id = f"ma_{len(self.transactions)+1:06d}_{datetime.now().year}"
        
        transaction = MATransaction(
            transaction_id=transaction_id,
            transaction_type=transaction_type,
            acquirer_data=acquirer_data,
            target_data=target_data
        )
        
        self.transactions[transaction_id] = transaction
        
        logger.info(f"Initiated {transaction_type.value} transaction: {transaction_id}")
        return transaction_id
        
    async def perform_valuation_analysis(self, transaction_id: str) -> Dict[str, Any]:
        """Perform comprehensive valuation analysis"""
        
        if transaction_id not in self.transactions:
            raise ValueError("Transaction not found")
            
        transaction = self.transactions[transaction_id]
        valuation_results = transaction.valuation_model.perform_comprehensive_valuation()
        
        logger.info(f"Completed valuation analysis for {transaction_id}")
        return valuation_results
        
    async def structure_transaction(self, transaction_id: str, offer_price: Decimal,
                                  financing_mix: Dict[str, Decimal]) -> Dict[str, Any]:
        """Structure transaction terms and financing"""
        
        if transaction_id not in self.transactions:
            raise ValueError("Transaction not found")
            
        transaction = self.transactions[transaction_id]
        
        # Convert financing mix to FinancingSource enum
        financing_sources = {}
        for source_name, amount in financing_mix.items():
            source_enum = FinancingSource(source_name)
            financing_sources[source_enum] = amount
            
        structure_results = transaction.structure_transaction(offer_price, financing_sources)
        
        logger.info(f"Structured transaction {transaction_id}")
        return structure_results
        
    async def conduct_due_diligence(self, transaction_id: str) -> Dict[str, Any]:
        """Conduct comprehensive due diligence"""
        
        if transaction_id not in self.transactions:
            raise ValueError("Transaction not found")
            
        transaction = self.transactions[transaction_id]
        dd_results = transaction.conduct_due_diligence()
        
        logger.info(f"Completed due diligence for {transaction_id}")
        return dd_results
        
    async def manage_regulatory_process(self, transaction_id: str) -> Dict[str, Any]:
        """Manage regulatory approval process"""
        
        if transaction_id not in self.transactions:
            raise ValueError("Transaction not found")
            
        transaction = self.transactions[transaction_id]
        required_approvals = transaction.get_regulatory_requirements()
        
        # Simulate regulatory approval process
        approvals_received = []
        approvals_pending = []
        
        for approval in required_approvals:
            # Simulate approval probability (85% approval rate)
            if random.random() < 0.85:
                approvals_received.append({
                    "approval": approval,
                    "status": "approved",
                    "date_received": datetime.now(),
                    "conditions": []
                })
            else:
                approvals_pending.append({
                    "approval": approval,
                    "status": "pending",
                    "expected_date": datetime.now() + timedelta(days=random.randint(30, 90)),
                    "requirements": ["Additional information required"]
                })
                
        transaction.regulatory_approvals_received = approvals_received
        
        return {
            "total_approvals_required": len(required_approvals),
            "approvals_received": len(approvals_received),
            "approvals_pending": len(approvals_pending),
            "approval_rate": len(approvals_received) / len(required_approvals) * 100 if required_approvals else 100,
            "approvals_received_detail": approvals_received,
            "approvals_pending_detail": approvals_pending
        }
        
    async def plan_integration(self, transaction_id: str) -> Dict[str, Any]:
        """Create comprehensive integration plan"""
        
        if transaction_id not in self.transactions:
            raise ValueError("Transaction not found")
            
        transaction = self.transactions[transaction_id]
        integration_plan = transaction.create_integration_plan()
        
        logger.info(f"Created integration plan for {transaction_id}")
        return integration_plan
        
    async def close_transaction(self, transaction_id: str) -> Dict[str, Any]:
        """Close M&A transaction"""
        
        if transaction_id not in self.transactions:
            raise ValueError("Transaction not found")
            
        transaction = self.transactions[transaction_id]
        
        # Check completion requirements
        requirements_met = {
            "due_diligence_complete": transaction.due_diligence_complete,
            "regulatory_approvals": len(transaction.regulatory_approvals_received) >= len(transaction.regulatory_approvals_required) * 0.9,
            "financing_secured": bool(transaction.financing_structure),
            "shareholder_approval": True  # Simplified
        }
        
        if all(requirements_met.values()):
            transaction.status = "completed"
            transaction.actual_close_date = datetime.now()
            
            # Update system statistics
            self.completed_transactions += 1
            self.total_transaction_value += transaction.total_transaction_value
            
            logger.info(f"Closed transaction {transaction_id}")
            
            return {
                "status": "completed",
                "close_date": transaction.actual_close_date,
                "transaction_value": transaction.total_transaction_value,
                "premium_paid": transaction.premium_to_market,
                "synergies_expected": transaction.synergy_analysis.get_total_synergies()["total_synergies"] if transaction.synergy_analysis else Decimal('0'),
                "integration_timeline": len(transaction.integration_plan.get("timeline", {}))
            }
        else:
            missing_requirements = [req for req, met in requirements_met.items() if not met]
            return {
                "status": "pending",
                "missing_requirements": missing_requirements,
                "requirements_met": requirements_met
            }
            
    def get_transaction_analytics(self, transaction_id: str) -> Dict[str, Any]:
        """Get comprehensive transaction analytics"""
        
        if transaction_id not in self.transactions:
            raise ValueError("Transaction not found")
            
        transaction = self.transactions[transaction_id]
        
        # Calculate days to close
        if transaction.actual_close_date:
            days_to_close = (transaction.actual_close_date - transaction.announcement_date).days
        else:
            days_to_close = (datetime.now() - transaction.announcement_date).days
            
        # Integration progress (if applicable)
        integration_progress = 0
        if transaction.integration_plan:
            # Simplified progress calculation
            integration_progress = min(100, days_to_close / 365 * 100)
            
        return {
            "transaction_overview": {
                "transaction_id": transaction_id,
                "transaction_type": transaction.transaction_type.value,
                "status": transaction.status,
                "announcement_date": transaction.announcement_date,
                "expected_close_date": transaction.expected_close_date,
                "actual_close_date": transaction.actual_close_date,
                "days_to_close": days_to_close
            },
            "financial_metrics": {
                "transaction_value": transaction.total_transaction_value,
                "offer_price_per_share": transaction.offer_price_per_share,
                "premium_to_market": transaction.premium_to_market,
                "financing_sources": len(transaction.financing_structure),
                "total_synergies": transaction.synergy_analysis.get_total_synergies()["total_synergies"] if transaction.synergy_analysis else Decimal('0')
            },
            "process_metrics": {
                "due_diligence_completion": len([item for item in transaction.due_diligence_items if item.status == "completed"]) / len(transaction.due_diligence_items) * 100 if transaction.due_diligence_items else 0,
                "regulatory_approval_rate": len(transaction.regulatory_approvals_received) / len(transaction.regulatory_approvals_required) * 100 if transaction.regulatory_approvals_required else 100,
                "integration_progress": integration_progress
            },
            "risk_assessment": {
                "high_risk_dd_items": len([item for item in transaction.due_diligence_items if item.risk_level == "high"]),
                "pending_regulatory_approvals": len(transaction.regulatory_approvals_required) - len(transaction.regulatory_approvals_received),
                "integration_risks": len(transaction.integration_plan.get("risk_mitigation", [])) if transaction.integration_plan else 0
            }
        }
        
    def get_market_overview(self) -> Dict[str, Any]:
        """Get M&A market overview"""
        
        # Transaction statistics
        transaction_types = defaultdict(int)
        total_premium = Decimal('0')
        premium_count = 0
        
        for transaction in self.transactions.values():
            transaction_types[transaction.transaction_type.value] += 1
            if transaction.premium_to_market > 0:
                total_premium += transaction.premium_to_market
                premium_count += 1
                
        avg_premium = total_premium / premium_count if premium_count > 0 else Decimal('0')
        
        # Market activity by value ranges
        value_ranges = {
            "under_100m": 0,
            "100m_to_1b": 0,
            "1b_to_5b": 0,
            "over_5b": 0
        }
        
        for transaction in self.transactions.values():
            value = transaction.total_transaction_value
            if value < 100000000:
                value_ranges["under_100m"] += 1
            elif value < 1000000000:
                value_ranges["100m_to_1b"] += 1
            elif value < 5000000000:
                value_ranges["1b_to_5b"] += 1
            else:
                value_ranges["over_5b"] += 1
                
        return {
            "market_activity": {
                "total_transactions": len(self.transactions),
                "completed_transactions": self.completed_transactions,
                "completion_rate": self.completed_transactions / len(self.transactions) * 100 if self.transactions else 0,
                "total_transaction_value": self.total_transaction_value,
                "average_transaction_value": self.total_transaction_value / len(self.transactions) if self.transactions else Decimal('0')
            },
            "transaction_types": dict(transaction_types),
            "value_distribution": value_ranges,
            "market_trends": {
                "average_premium": avg_premium,
                "average_time_to_close": 120,  # days (simplified)
                "success_rate": 85.0  # percentage (simplified)
            },
            "regulatory_environment": {
                "average_regulatory_approvals": sum(len(t.regulatory_approvals_required) for t in self.transactions.values()) / len(self.transactions) if self.transactions else 0,
                "approval_success_rate": 85.0  # percentage (simplified)
            }
        }

# Example usage and testing
async def demonstrate_ma_system():
    """Demonstrate the M&A system capabilities"""
    
    system = MASystem()
    
    print("🤝 MERGERS & ACQUISITIONS SYSTEM DEMONSTRATION")
    print("=" * 60)
    
    # Sample company data
    acquirer_data = {
        "name": "TechGlobal Corp",
        "revenue": 2000000000,    # $2B revenue
        "ebitda": 400000000,      # $400M EBITDA
        "market_cap": 15000000000, # $15B market cap
        "industry": "technology",
        "country": "US"
    }
    
    target_data = {
        "name": "InnovateSoft Inc",
        "revenue": 500000000,     # $500M revenue
        "ebitda": 75000000,       # $75M EBITDA
        "net_income": 45000000,   # $45M net income
        "total_assets": 300000000, # $300M assets
        "total_debt": 100000000,  # $100M debt
        "cash": 50000000,         # $50M cash
        "outstanding_shares": 20000000, # 20M shares
        "current_share_price": 35.0,    # $35/share
        "revenue_growth": 0.15,   # 15% growth
        "industry": "technology",
        "country": "US"
    }
    
    # 1. Initiate transaction
    print("\n1. TRANSACTION INITIATION")
    print("-" * 30)
    
    transaction_id = await system.initiate_transaction(
        TransactionType.ACQUISITION,
        acquirer_data,
        target_data
    )
    
    print(f"Transaction initiated: {transaction_id}")
    print(f"Type: {TransactionType.ACQUISITION.value}")
    print(f"Acquirer: {acquirer_data['name']}")
    print(f"Target: {target_data['name']}")
    
    # 2. Valuation analysis
    print("\n2. VALUATION ANALYSIS")
    print("-" * 30)
    
    valuation_results = await system.perform_valuation_analysis(transaction_id)
    
    print("Valuation Results:")
    print(f"  DCF Valuation: ${valuation_results['valuation_methods']['dcf']['base']:,.0f}")
    print(f"  Comparable Companies: ${valuation_results['valuation_methods']['comparable_companies']['base']:,.0f}")
    print(f"  Precedent Transactions: ${valuation_results['valuation_methods']['precedent_transactions']['base']:,.0f}")
    print(f"  Weighted Average: ${valuation_results['weighted_average']['base']:,.0f}")
    print(f"  Recommended Offer Range: ${valuation_results['recommendation']['offer_range_low']:,.0f} - ${valuation_results['recommendation']['offer_range_high']:,.0f}")
    
    # 3. Structure transaction
    print("\n3. TRANSACTION STRUCTURING")
    print("-" * 30)
    
    offer_price = Decimal('42.50')  # $42.50 per share (21% premium)
    financing_mix = {
        "cash": Decimal('400000000'),         # $400M cash
        "debt": Decimal('250000000'),         # $250M debt
        "equity": Decimal('200000000')        # $200M new equity
    }
    
    structure_results = await system.structure_transaction(transaction_id, offer_price, financing_mix)
    
    print("Transaction Structure:")
    print(f"  Offer Price: ${structure_results['transaction_terms']['offer_price_per_share']}/share")
    print(f"  Total Value: ${structure_results['transaction_terms']['total_transaction_value']:,.0f}")
    print(f"  Premium: {structure_results['transaction_terms']['premium_to_market']:.1f}%")
    print(f"  Revenue Multiple: {structure_results['transaction_terms']['transaction_multiple_revenue']:.1f}x")
    print(f"  EBITDA Multiple: {structure_results['transaction_terms']['transaction_multiple_ebitda']:.1f}x")
    
    print("\nFinancing Structure:")
    for source, details in structure_results['financing_structure'].items():
        print(f"  {source.title()}: ${details['amount']:,.0f} ({details['percentage']:.1f}%)")
        
    print(f"\nExpected Synergies: ${structure_results['synergies']['total_synergies']:,.0f}")
    print(f"Synergy NPV: ${structure_results['synergy_npv']:,.0f}")
    
    # 4. Due diligence
    print("\n4. DUE DILIGENCE PROCESS")
    print("-" * 30)
    
    dd_results = await system.conduct_due_diligence(transaction_id)
    
    print("Due Diligence Results:")
    print(f"  Completion Rate: {dd_results['completion_rate']:.1f}%")
    print(f"  Total Items: {dd_results['total_items']}")
    print(f"  Completed Items: {dd_results['completed_items']}")
    print(f"  Issues Identified: {dd_results['issues_identified']}")
    print(f"  High Risk Items: {dd_results['high_risk_items']}")
    print(f"  Recommendation: {dd_results['recommendation'].upper()}")
    
    if dd_results['findings_by_area']:
        print("\nFindings by Area:")
        for area, findings in dd_results['findings_by_area'].items():
            print(f"  {area.title()}: {len(findings)} findings")
    
    # 5. Regulatory approvals
    print("\n5. REGULATORY APPROVAL PROCESS")
    print("-" * 30)
    
    regulatory_results = await system.manage_regulatory_process(transaction_id)
    
    print("Regulatory Approval Status:")
    print(f"  Total Approvals Required: {regulatory_results['total_approvals_required']}")
    print(f"  Approvals Received: {regulatory_results['approvals_received']}")
    print(f"  Approvals Pending: {regulatory_results['approvals_pending']}")
    print(f"  Approval Rate: {regulatory_results['approval_rate']:.1f}%")
    
    # 6. Integration planning
    print("\n6. INTEGRATION PLANNING")
    print("-" * 30)
    
    integration_plan = await system.plan_integration(transaction_id)
    
    print("Integration Plan:")
    print(f"  Integration Approach: {integration_plan['integration_approach']}")
    print(f"  Workstreams: {len(integration_plan['workstreams'])}")
    print(f"  Timeline Phases: {len(integration_plan['timeline'])}")
    print(f"  Integration Risks: {len(integration_plan['risk_mitigation'])}")
    
    print("\nKey Workstreams:")
    for workstream, details in integration_plan['workstreams'].items():
        print(f"  {workstream.replace('_', ' ').title()}: {details['priority']} priority, {details['timeline']}")
    
    # 7. Transaction close
    print("\n7. TRANSACTION CLOSE")
    print("-" * 30)
    
    close_results = await system.close_transaction(transaction_id)
    
    print("Transaction Close Results:")
    print(f"  Status: {close_results['status'].upper()}")
    
    if close_results['status'] == 'completed':
        print(f"  Close Date: {close_results['close_date'].strftime('%Y-%m-%d')}")
        print(f"  Final Transaction Value: ${close_results['transaction_value']:,.0f}")
        print(f"  Premium Paid: {close_results['premium_paid']:.1f}%")
        print(f"  Expected Synergies: ${close_results['synergies_expected']:,.0f}")
    else:
        print(f"  Missing Requirements: {', '.join(close_results['missing_requirements'])}")
    
    # 8. Transaction analytics
    print("\n8. TRANSACTION ANALYTICS")
    print("-" * 30)
    
    analytics = system.get_transaction_analytics(transaction_id)
    
    print("Transaction Analytics:")
    print(f"  Days to Close: {analytics['transaction_overview']['days_to_close']}")
    print(f"  Due Diligence Completion: {analytics['process_metrics']['due_diligence_completion']:.1f}%")
    print(f"  Regulatory Approval Rate: {analytics['process_metrics']['regulatory_approval_rate']:.1f}%")
    print(f"  Integration Progress: {analytics['process_metrics']['integration_progress']:.1f}%")
    print(f"  High Risk DD Items: {analytics['risk_assessment']['high_risk_dd_items']}")
    
    # 9. Market overview
    print("\n9. M&A MARKET OVERVIEW")
    print("-" * 30)
    
    market_overview = system.get_market_overview()
    
    print("M&A Market Overview:")
    print(f"  Total Transactions: {market_overview['market_activity']['total_transactions']}")
    print(f"  Completed Transactions: {market_overview['market_activity']['completed_transactions']}")
    print(f"  Completion Rate: {market_overview['market_activity']['completion_rate']:.1f}%")
    print(f"  Total Transaction Value: ${market_overview['market_activity']['total_transaction_value']:,.0f}")
    print(f"  Average Premium: {market_overview['market_trends']['average_premium']:.1f}%")
    print(f"  Success Rate: {market_overview['market_trends']['success_rate']:.1f}%")
    
    print("\n✅ M&A System demonstration completed successfully!")
    return system

if __name__ == "__main__":
    # Run the demonstration
    asyncio.run(demonstrate_ma_system())
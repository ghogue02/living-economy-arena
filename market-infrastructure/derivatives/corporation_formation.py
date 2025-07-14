"""
Corporation Formation Systems - Phase 3 Market Complexity
=========================================================

Advanced corporate entity creation, governance, and management systems.
Implements comprehensive business entity formation with legal structures,
M&A capabilities, and sophisticated corporate governance frameworks.

Features:
- Multiple corporate structures (C-Corp, S-Corp, LLC, Partnership, etc.)
- Corporate governance with boards, executives, and shareholder rights
- Mergers & acquisitions with due diligence and valuation
- Shareholder management and voting systems
- IPO and securities issuance capabilities
- Executive compensation and stock options
- Corporate social responsibility and ESG frameworks
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

class CorporateStructure(Enum):
    """Corporate entity types with different legal structures"""
    C_CORPORATION = "c_corp"
    S_CORPORATION = "s_corp"
    LLC = "llc"
    PARTNERSHIP = "partnership"
    LLP = "llp"
    SOLE_PROPRIETORSHIP = "sole_prop"
    REIT = "reit"
    PUBLIC_COMPANY = "public"
    PRIVATE_EQUITY = "private_equity"
    VENTURE_CAPITAL = "venture_capital"

class ShareClass(Enum):
    """Different types of share classes"""
    COMMON = "common"
    PREFERRED_A = "preferred_a"
    PREFERRED_B = "preferred_b"
    PREFERRED_C = "preferred_c"
    VOTING = "voting"
    NON_VOTING = "non_voting"
    SUPER_VOTING = "super_voting"
    CONVERTIBLE = "convertible"

class GovernanceRole(Enum):
    """Corporate governance roles"""
    CEO = "ceo"
    CFO = "cfo"
    COO = "coo"
    CTO = "cto"
    CHAIRMAN = "chairman"
    LEAD_DIRECTOR = "lead_director"
    INDEPENDENT_DIRECTOR = "independent_director"
    EXECUTIVE_DIRECTOR = "executive_director"
    AUDIT_COMMITTEE_CHAIR = "audit_chair"
    COMPENSATION_COMMITTEE_CHAIR = "comp_chair"

class MATransactionType(Enum):
    """Types of M&A transactions"""
    ACQUISITION = "acquisition"
    MERGER = "merger"
    REVERSE_MERGER = "reverse_merger"
    SPIN_OFF = "spin_off"
    SPLIT_OFF = "split_off"
    TENDER_OFFER = "tender_offer"
    LEVERAGED_BUYOUT = "lbo"
    MANAGEMENT_BUYOUT = "mbo"
    ASSET_PURCHASE = "asset_purchase"
    JOINT_VENTURE = "joint_venture"

@dataclass
class ShareHolding:
    """Represents a shareholder's ownership stake"""
    shareholder_id: str
    share_class: ShareClass
    shares_owned: int
    purchase_price: Decimal
    purchase_date: datetime
    voting_rights: int = 1  # votes per share
    dividend_rights: bool = True
    liquidation_preference: Optional[Decimal] = None
    conversion_ratio: Optional[Decimal] = None
    
class BoardMember:
    """Represents a board member with governance responsibilities"""
    
    def __init__(self, member_id: str, name: str, role: GovernanceRole,
                 independent: bool = True, committees: List[str] = None):
        self.member_id = member_id
        self.name = name
        self.role = role
        self.independent = independent
        self.committees = committees or []
        self.appointment_date = datetime.now()
        self.term_length = 3  # years
        self.compensation = Decimal("250000")  # annual
        self.equity_awards = []
        
    def calculate_total_compensation(self) -> Decimal:
        """Calculate total annual compensation including equity"""
        equity_value = sum(award.get('value', Decimal('0')) for award in self.equity_awards)
        return self.compensation + equity_value
        
    def is_independent(self) -> bool:
        """Check if member meets independence criteria"""
        return self.independent and self.role in [
            GovernanceRole.INDEPENDENT_DIRECTOR,
            GovernanceRole.LEAD_DIRECTOR,
            GovernanceRole.AUDIT_COMMITTEE_CHAIR
        ]

@dataclass
class ExecutiveCompensation:
    """Executive compensation package structure"""
    executive_id: str
    base_salary: Decimal
    target_bonus: Decimal
    stock_options: int
    restricted_stock: int
    performance_shares: int
    benefits_value: Decimal
    severance_multiple: float = 2.0  # years of salary
    change_in_control_multiplier: float = 2.5
    
    def total_compensation(self, stock_price: Decimal) -> Decimal:
        """Calculate total compensation value"""
        option_value = self.stock_options * stock_price * Decimal('0.3')  # rough option value
        restricted_value = self.restricted_stock * stock_price
        performance_value = self.performance_shares * stock_price * Decimal('0.8')  # probability adjusted
        
        return (self.base_salary + self.target_bonus + self.benefits_value + 
                option_value + restricted_value + performance_value)

class Corporation:
    """Main corporation entity with comprehensive governance and operations"""
    
    def __init__(self, corporation_id: str, name: str, structure: CorporateStructure,
                 incorporation_state: str = "Delaware", initial_capital: Decimal = Decimal('1000000')):
        self.corporation_id = corporation_id
        self.name = name
        self.structure = structure
        self.incorporation_state = incorporation_state
        self.incorporation_date = datetime.now()
        
        # Capital structure
        self.authorized_shares = 10000000  # 10M shares authorized
        self.outstanding_shares = 1000000   # 1M shares initially issued
        self.treasury_shares = 0
        self.share_price = Decimal('10.00')
        self.market_cap = self.outstanding_shares * self.share_price
        self.initial_capital = initial_capital
        
        # Ownership and governance
        self.shareholders: Dict[str, ShareHolding] = {}
        self.board_members: Dict[str, BoardMember] = {}
        self.executives: Dict[str, ExecutiveCompensation] = {}
        
        # Financial metrics
        self.revenue = Decimal('50000000')  # $50M annual revenue
        self.ebitda = self.revenue * Decimal('0.25')  # 25% margin
        self.net_income = self.ebitda * Decimal('0.6')  # after taxes/interest
        self.total_assets = initial_capital * 3
        self.total_debt = self.total_assets * Decimal('0.4')  # 40% debt ratio
        self.cash_balance = initial_capital * Decimal('0.3')
        
        # Corporate metrics
        self.credit_rating = "BBB+"
        self.esg_score = 65  # out of 100
        self.governance_score = 75
        self.public_status = False
        self.exchange_listing = None
        
        # M&A and transactions
        self.acquisition_history: List[Dict] = []
        self.pending_transactions: List[Dict] = []
        self.subsidiaries: List[str] = []
        self.joint_ventures: List[str] = []
        
        # Initialize basic governance structure
        self._setup_initial_governance()
        
    def _setup_initial_governance(self):
        """Set up basic board and executive structure"""
        # Create founding CEO
        ceo = BoardMember(
            f"board_{self.corporation_id}_001",
            f"CEO {self.name}",
            GovernanceRole.CEO,
            independent=False
        )
        self.board_members[ceo.member_id] = ceo
        
        # CEO compensation
        ceo_comp = ExecutiveCompensation(
            executive_id=ceo.member_id,
            base_salary=Decimal('1500000'),
            target_bonus=Decimal('2250000'),
            stock_options=100000,
            restricted_stock=50000,
            performance_shares=75000,
            benefits_value=Decimal('250000')
        )
        self.executives[ceo.member_id] = ceo_comp
        
        # Add independent directors
        for i in range(2, 8):  # 6 additional board members
            director = BoardMember(
                f"board_{self.corporation_id}_{i:03d}",
                f"Director {i}",
                GovernanceRole.INDEPENDENT_DIRECTOR if i > 3 else GovernanceRole.EXECUTIVE_DIRECTOR,
                independent=i > 3
            )
            self.board_members[director.member_id] = director
            
    def issue_shares(self, share_class: ShareClass, quantity: int, 
                    price_per_share: Decimal, recipient_id: str) -> bool:
        """Issue new shares to investors"""
        if self.outstanding_shares + quantity > self.authorized_shares:
            logger.warning(f"Cannot issue {quantity} shares - would exceed authorized shares")
            return False
            
        shareholding = ShareHolding(
            shareholder_id=recipient_id,
            share_class=share_class,
            shares_owned=quantity,
            purchase_price=price_per_share,
            purchase_date=datetime.now()
        )
        
        if recipient_id in self.shareholders:
            # Add to existing holding
            existing = self.shareholders[recipient_id]
            total_value = (existing.shares_owned * existing.purchase_price + 
                          quantity * price_per_share)
            total_shares = existing.shares_owned + quantity
            existing.shares_owned = total_shares
            existing.purchase_price = total_value / total_shares  # weighted average
        else:
            self.shareholders[recipient_id] = shareholding
            
        self.outstanding_shares += quantity
        proceeds = quantity * price_per_share
        self.cash_balance += proceeds
        self.market_cap = self.outstanding_shares * self.share_price
        
        logger.info(f"Issued {quantity} {share_class.value} shares at ${price_per_share} to {recipient_id}")
        return True
        
    def calculate_ownership_percentage(self, shareholder_id: str) -> Decimal:
        """Calculate ownership percentage for a shareholder"""
        if shareholder_id not in self.shareholders:
            return Decimal('0')
        
        shares = self.shareholders[shareholder_id].shares_owned
        return Decimal(shares) / Decimal(self.outstanding_shares) * 100
        
    def declare_dividend(self, dividend_per_share: Decimal, 
                        payment_date: datetime = None) -> Dict[str, Decimal]:
        """Declare and calculate dividend payments"""
        if payment_date is None:
            payment_date = datetime.now() + timedelta(days=30)
            
        total_dividend = Decimal('0')
        dividend_payments: Dict[str, Decimal] = {}
        
        for shareholder_id, holding in self.shareholders.items():
            if holding.dividend_rights:
                payment = holding.shares_owned * dividend_per_share
                dividend_payments[shareholder_id] = payment
                total_dividend += payment
                
        # Check if company has sufficient cash
        if total_dividend > self.cash_balance:
            logger.warning(f"Insufficient cash for dividend: ${total_dividend} vs ${self.cash_balance}")
            return {}
            
        self.cash_balance -= total_dividend
        logger.info(f"Declared dividend of ${dividend_per_share} per share, total ${total_dividend}")
        
        return dividend_payments
        
    def conduct_shareholder_vote(self, proposal: str, proposal_id: str) -> Dict[str, Any]:
        """Conduct shareholder voting on corporate matters"""
        votes_for = 0
        votes_against = 0
        abstentions = 0
        total_voting_power = 0
        
        voting_results = {}
        
        for shareholder_id, holding in self.shareholders.items():
            voting_power = holding.shares_owned * holding.voting_rights
            total_voting_power += voting_power
            
            # Simulate voting behavior (in practice, this would be actual votes)
            vote_probability = random.random()
            if vote_probability > 0.8:
                vote = "abstain"
                abstentions += voting_power
            elif vote_probability > 0.4:
                vote = "for"
                votes_for += voting_power
            else:
                vote = "against"
                votes_against += voting_power
                
            voting_results[shareholder_id] = {
                "vote": vote,
                "voting_power": voting_power
            }
            
        # Calculate results
        participation_rate = ((votes_for + votes_against + abstentions) / 
                             total_voting_power * 100)
        approval_rate = votes_for / (votes_for + votes_against) * 100 if (votes_for + votes_against) > 0 else 0
        passed = approval_rate > 50  # Simple majority
        
        return {
            "proposal_id": proposal_id,
            "proposal": proposal,
            "votes_for": votes_for,
            "votes_against": votes_against,
            "abstentions": abstentions,
            "total_voting_power": total_voting_power,
            "participation_rate": participation_rate,
            "approval_rate": approval_rate,
            "passed": passed,
            "voting_details": voting_results
        }
        
    def add_board_member(self, name: str, role: GovernanceRole, 
                        independent: bool = True, committees: List[str] = None) -> str:
        """Add a new board member"""
        member_id = f"board_{self.corporation_id}_{len(self.board_members)+1:03d}"
        member = BoardMember(member_id, name, role, independent, committees)
        self.board_members[member_id] = member
        
        logger.info(f"Added board member: {name} ({role.value})")
        return member_id
        
    def calculate_enterprise_value(self) -> Decimal:
        """Calculate enterprise value for M&A purposes"""
        return self.market_cap + self.total_debt - self.cash_balance
        
    def calculate_valuation_multiples(self) -> Dict[str, Decimal]:
        """Calculate common valuation multiples"""
        ev = self.calculate_enterprise_value()
        
        return {
            "price_to_earnings": self.market_cap / self.net_income if self.net_income > 0 else Decimal('0'),
            "ev_to_ebitda": ev / self.ebitda if self.ebitda > 0 else Decimal('0'),
            "price_to_sales": self.market_cap / self.revenue if self.revenue > 0 else Decimal('0'),
            "price_to_book": self.market_cap / (self.total_assets - self.total_debt),
            "debt_to_equity": self.total_debt / (self.total_assets - self.total_debt),
            "return_on_equity": self.net_income / (self.total_assets - self.total_debt) * 100
        }
        
    def update_governance_score(self) -> int:
        """Update corporate governance score based on board composition"""
        score = 50  # base score
        
        # Board independence
        total_members = len(self.board_members)
        independent_members = sum(1 for m in self.board_members.values() if m.is_independent())
        independence_ratio = independent_members / total_members if total_members > 0 else 0
        score += int(independence_ratio * 30)  # up to 30 points
        
        # Board size (optimal 7-12 members)
        if 7 <= total_members <= 12:
            score += 10
        elif total_members < 7:
            score += max(0, 10 - (7 - total_members) * 2)
        else:
            score += max(0, 10 - (total_members - 12) * 2)
            
        # CEO duality (CEO also Chairman reduces score)
        ceo_members = [m for m in self.board_members.values() if m.role == GovernanceRole.CEO]
        chairman_members = [m for m in self.board_members.values() if m.role == GovernanceRole.CHAIRMAN]
        if ceo_members and chairman_members and ceo_members[0].member_id == chairman_members[0].member_id:
            score -= 5
            
        # Committee structure
        audit_chairs = [m for m in self.board_members.values() if "audit" in m.committees]
        comp_chairs = [m for m in self.board_members.values() if "compensation" in m.committees]
        if audit_chairs:
            score += 5
        if comp_chairs:
            score += 5
            
        self.governance_score = min(100, max(0, score))
        return self.governance_score

class MATransaction:
    """Mergers & Acquisitions transaction management"""
    
    def __init__(self, transaction_id: str, transaction_type: MATransactionType,
                 acquirer: Corporation, target: Corporation):
        self.transaction_id = transaction_id
        self.transaction_type = transaction_type
        self.acquirer = acquirer
        self.target = target
        self.announcement_date = datetime.now()
        self.expected_close_date = datetime.now() + timedelta(days=180)
        
        # Transaction terms
        self.offer_price_per_share = Decimal('0')
        self.total_transaction_value = Decimal('0')
        self.premium_to_market = Decimal('0')
        self.cash_portion = Decimal('0')
        self.stock_portion = Decimal('0')
        self.exchange_ratio = Decimal('0')
        
        # Due diligence and approvals
        self.due_diligence_complete = False
        self.regulatory_approvals = []
        self.shareholder_approvals = []
        self.financing_secured = False
        
        # Strategic rationale
        self.synergies_expected = Decimal('0')
        self.cost_synergies = Decimal('0')
        self.revenue_synergies = Decimal('0')
        self.strategic_rationale = ""
        
        self.status = "announced"
        
    def calculate_offer_premium(self) -> Decimal:
        """Calculate premium over current market price"""
        current_price = self.target.share_price
        self.premium_to_market = (self.offer_price_per_share - current_price) / current_price * 100
        return self.premium_to_market
        
    def perform_due_diligence(self) -> Dict[str, Any]:
        """Conduct comprehensive due diligence analysis"""
        due_diligence_results = {
            "financial_analysis": {
                "revenue_quality": random.uniform(0.7, 0.95),
                "margin_sustainability": random.uniform(0.6, 0.9),
                "cash_flow_predictability": random.uniform(0.65, 0.92),
                "debt_capacity": self.target.total_debt / self.target.total_assets,
                "working_capital_efficiency": random.uniform(0.75, 0.95)
            },
            "operational_analysis": {
                "market_position": random.uniform(0.6, 0.9),
                "competitive_advantages": random.uniform(0.5, 0.85),
                "management_quality": random.uniform(0.7, 0.95),
                "operational_efficiency": random.uniform(0.65, 0.9),
                "technology_platform": random.uniform(0.6, 0.88)
            },
            "legal_analysis": {
                "regulatory_compliance": random.uniform(0.8, 0.98),
                "litigation_risks": random.uniform(0.7, 0.95),
                "intellectual_property": random.uniform(0.6, 0.9),
                "contract_analysis": random.uniform(0.75, 0.95),
                "environmental_liabilities": random.uniform(0.8, 0.97)
            },
            "synergies_analysis": {
                "cost_synergies_achievable": random.uniform(0.7, 0.9),
                "revenue_synergies_achievable": random.uniform(0.4, 0.7),
                "integration_complexity": random.uniform(0.6, 0.85),
                "time_to_realize": random.uniform(12, 36)  # months
            }
        }
        
        # Calculate overall due diligence score
        financial_score = sum(due_diligence_results["financial_analysis"].values()) / len(due_diligence_results["financial_analysis"])
        operational_score = sum(due_diligence_results["operational_analysis"].values()) / len(due_diligence_results["operational_analysis"])
        legal_score = sum(due_diligence_results["legal_analysis"].values()) / len(due_diligence_results["legal_analysis"])
        
        overall_score = (financial_score * 0.4 + operational_score * 0.35 + legal_score * 0.25) * 100
        
        due_diligence_results["overall_score"] = overall_score
        due_diligence_results["recommendation"] = "proceed" if overall_score > 75 else "proceed_with_caution" if overall_score > 60 else "do_not_proceed"
        
        self.due_diligence_complete = True
        return due_diligence_results
        
    def calculate_synergies(self) -> Dict[str, Decimal]:
        """Calculate expected synergies from the transaction"""
        # Cost synergies (typically easier to achieve)
        target_costs = self.target.revenue - self.target.ebitda
        acquirer_costs = self.acquirer.revenue - self.acquirer.ebitda
        
        # Estimate cost synergies as % of combined cost base
        combined_costs = target_costs + acquirer_costs
        cost_synergy_rate = Decimal('0.05')  # 5% cost reduction
        self.cost_synergies = combined_costs * cost_synergy_rate
        
        # Revenue synergies (more uncertain)
        combined_revenue = self.target.revenue + self.acquirer.revenue
        revenue_synergy_rate = Decimal('0.03')  # 3% revenue uplift
        self.revenue_synergies = combined_revenue * revenue_synergy_rate
        
        self.synergies_expected = self.cost_synergies + self.revenue_synergies
        
        return {
            "cost_synergies": self.cost_synergies,
            "revenue_synergies": self.revenue_synergies,
            "total_synergies": self.synergies_expected,
            "synergies_multiple": self.synergies_expected / self.total_transaction_value * 100 if self.total_transaction_value > 0 else Decimal('0')
        }
        
    def get_regulatory_requirements(self) -> List[str]:
        """Determine required regulatory approvals"""
        approvals_needed = []
        
        # Antitrust review thresholds
        if self.total_transaction_value > Decimal('100000000'):  # $100M
            approvals_needed.append("FTC_Hart_Scott_Rodino")
            
        if self.total_transaction_value > Decimal('1000000000'):  # $1B
            approvals_needed.append("DOJ_Antitrust_Review")
            
        # Industry-specific approvals
        if any(industry in [self.acquirer.name, self.target.name] for industry in ["Bank", "Insurance", "Telecom"]):
            approvals_needed.append("Industry_Regulatory_Approval")
            
        # Foreign investment review
        if "Foreign" in self.acquirer.name or "International" in self.acquirer.name:
            approvals_needed.append("CFIUS_Review")
            
        self.regulatory_approvals = approvals_needed
        return approvals_needed

class IPOProcess:
    """Initial Public Offering process management"""
    
    def __init__(self, corporation: Corporation, target_raise: Decimal):
        self.corporation = corporation
        self.target_raise = target_raise
        self.process_id = f"ipo_{corporation.corporation_id}_{datetime.now().strftime('%Y%m%d')}"
        
        # IPO timeline and structure
        self.announcement_date = datetime.now()
        self.roadshow_start = datetime.now() + timedelta(days=30)
        self.pricing_date = datetime.now() + timedelta(days=45)
        self.trading_start_date = datetime.now() + timedelta(days=46)
        
        # Offering details
        self.shares_offered = 0
        self.price_range_low = Decimal('0')
        self.price_range_high = Decimal('0')
        self.final_price = Decimal('0')
        self.overallotment_option = True  # Green shoe
        self.overallotment_shares = 0
        
        # Syndicate and allocation
        self.lead_underwriters = []
        self.co_managers = []
        self.underwriting_fee = Decimal('0.07')  # 7% gross spread
        self.institutional_allocation = Decimal('0.75')  # 75% to institutions
        self.retail_allocation = Decimal('0.25')  # 25% to retail
        
        # Valuation and metrics
        self.pre_money_valuation = Decimal('0')
        self.post_money_valuation = Decimal('0')
        self.use_of_proceeds = {}
        
        self.status = "planning"
        
    def calculate_valuation_range(self) -> Tuple[Decimal, Decimal]:
        """Calculate IPO valuation range based on comparables"""
        # Use existing financial metrics to estimate valuation
        revenue_multiple = Decimal('4.0')  # Industry average
        ebitda_multiple = Decimal('12.0')
        
        revenue_valuation = self.corporation.revenue * revenue_multiple
        ebitda_valuation = self.corporation.ebitda * ebitda_multiple
        
        # Take average and apply +/- 20% range
        base_valuation = (revenue_valuation + ebitda_valuation) / 2
        low_valuation = base_valuation * Decimal('0.8')
        high_valuation = base_valuation * Decimal('1.2')
        
        return low_valuation, high_valuation
        
    def structure_offering(self, percentage_sold: Decimal = Decimal('0.2')) -> Dict[str, Any]:
        """Structure the IPO offering"""
        low_val, high_val = self.calculate_valuation_range()
        
        # Calculate shares to sell (% of company)
        total_shares_post_ipo = int(self.corporation.outstanding_shares / (1 - percentage_sold))
        self.shares_offered = total_shares_post_ipo - self.corporation.outstanding_shares
        
        # Price range
        self.price_range_low = low_val / total_shares_post_ipo
        self.price_range_high = high_val / total_shares_post_ipo
        
        # Overallotment option (15% of base offering)
        self.overallotment_shares = int(self.shares_offered * Decimal('0.15'))
        
        # Use of proceeds
        gross_proceeds = self.shares_offered * ((self.price_range_low + self.price_range_high) / 2)
        underwriting_fees = gross_proceeds * self.underwriting_fee
        net_proceeds = gross_proceeds - underwriting_fees
        
        self.use_of_proceeds = {
            "debt_repayment": net_proceeds * Decimal('0.4'),
            "growth_capex": net_proceeds * Decimal('0.3'),
            "working_capital": net_proceeds * Decimal('0.2'),
            "general_corporate": net_proceeds * Decimal('0.1')
        }
        
        return {
            "shares_offered": self.shares_offered,
            "price_range": f"${self.price_range_low:.2f} - ${self.price_range_high:.2f}",
            "percentage_sold": percentage_sold * 100,
            "gross_proceeds_estimate": gross_proceeds,
            "net_proceeds_estimate": net_proceeds,
            "use_of_proceeds": self.use_of_proceeds
        }
        
    def conduct_roadshow(self) -> Dict[str, Any]:
        """Simulate investor roadshow results"""
        # Generate institutional investor interest
        institutional_orders = []
        total_demand = 0
        
        # Simulate 50-100 institutional investors
        num_institutions = random.randint(50, 100)
        
        for i in range(num_institutions):
            # Random order size (as multiple of shares offered)
            order_multiple = random.lognormvariate(0, 1.5)  # Log-normal distribution for order sizes
            order_size = int(self.shares_offered * min(order_multiple, 3.0) / num_institutions)
            
            # Price preference (within or above range)
            price_preference = self.price_range_low + (self.price_range_high - self.price_range_low) * Decimal(random.uniform(0.8, 1.2))
            
            if order_size > 0:
                institutional_orders.append({
                    "investor_id": f"institution_{i+1:03d}",
                    "order_size": order_size,
                    "price_preference": price_preference,
                    "quality_score": random.uniform(0.6, 1.0)  # Investor quality
                })
                total_demand += order_size
                
        # Calculate oversubscription ratio
        oversubscription = total_demand / self.shares_offered
        
        # Determine final pricing based on demand
        if oversubscription > 3.0:
            self.final_price = self.price_range_high * Decimal('1.1')  # Price above range
        elif oversubscription > 2.0:
            self.final_price = self.price_range_high
        elif oversubscription > 1.5:
            self.final_price = (self.price_range_low + self.price_range_high) / 2
        elif oversubscription > 1.0:
            self.final_price = self.price_range_low
        else:
            self.final_price = self.price_range_low * Decimal('0.9')  # Price below range
            
        return {
            "total_demand": total_demand,
            "oversubscription_ratio": oversubscription,
            "final_price": self.final_price,
            "institutional_orders": len(institutional_orders),
            "pricing_recommendation": "above_range" if oversubscription > 3.0 else "in_range" if oversubscription > 1.0 else "below_range"
        }
        
    def complete_ipo(self) -> Dict[str, Any]:
        """Complete the IPO process and update corporation status"""
        # Calculate final proceeds
        gross_proceeds = self.shares_offered * self.final_price
        underwriting_fees = gross_proceeds * self.underwriting_fee
        net_proceeds = gross_proceeds - underwriting_fees
        
        # Update corporation structure
        self.corporation.outstanding_shares += self.shares_offered
        self.corporation.cash_balance += net_proceeds
        self.corporation.share_price = self.final_price
        self.corporation.market_cap = self.corporation.outstanding_shares * self.final_price
        self.corporation.public_status = True
        self.corporation.exchange_listing = "NASDAQ"  # Default exchange
        
        # Create new public shareholders (simplified)
        public_shareholder_id = "public_float"
        public_holding = ShareHolding(
            shareholder_id=public_shareholder_id,
            share_class=ShareClass.COMMON,
            shares_owned=self.shares_offered,
            purchase_price=self.final_price,
            purchase_date=datetime.now()
        )
        self.corporation.shareholders[public_shareholder_id] = public_holding
        
        self.status = "completed"
        
        return {
            "final_price": self.final_price,
            "shares_sold": self.shares_offered,
            "gross_proceeds": gross_proceeds,
            "net_proceeds": net_proceeds,
            "post_money_valuation": self.corporation.market_cap,
            "public_float": self.shares_offered / self.corporation.outstanding_shares * 100,
            "first_day_trading": self.trading_start_date
        }

class CorporationFormationSystem:
    """Main system for corporation formation and management"""
    
    def __init__(self):
        self.corporations: Dict[str, Corporation] = {}
        self.ma_transactions: Dict[str, MATransaction] = {}
        self.ipo_processes: Dict[str, IPOProcess] = {}
        self.system_id = "corp_formation_v1"
        
        # Market-wide statistics
        self.total_market_cap = Decimal('0')
        self.active_ma_transactions = 0
        self.completed_ipos = 0
        self.average_governance_score = 0
        
        logger.info("Corporation Formation System initialized")
        
    async def form_corporation(self, name: str, structure: CorporateStructure,
                              initial_capital: Decimal, incorporation_state: str = "Delaware") -> str:
        """Form a new corporation with specified structure"""
        corporation_id = f"corp_{len(self.corporations)+1:06d}"
        
        corporation = Corporation(
            corporation_id=corporation_id,
            name=name,
            structure=structure,
            incorporation_state=incorporation_state,
            initial_capital=initial_capital
        )
        
        self.corporations[corporation_id] = corporation
        self._update_market_statistics()
        
        logger.info(f"Formed {structure.value}: {name} (ID: {corporation_id})")
        return corporation_id
        
    async def initiate_ma_transaction(self, acquirer_id: str, target_id: str,
                                     transaction_type: MATransactionType,
                                     offer_price_per_share: Decimal) -> str:
        """Initiate a mergers & acquisitions transaction"""
        if acquirer_id not in self.corporations or target_id not in self.corporations:
            raise ValueError("Invalid corporation IDs")
            
        transaction_id = f"ma_{len(self.ma_transactions)+1:06d}"
        acquirer = self.corporations[acquirer_id]
        target = self.corporations[target_id]
        
        transaction = MATransaction(transaction_id, transaction_type, acquirer, target)
        transaction.offer_price_per_share = offer_price_per_share
        transaction.total_transaction_value = offer_price_per_share * target.outstanding_shares
        transaction.calculate_offer_premium()
        
        # Set cash/stock mix (80% cash, 20% stock typical)
        transaction.cash_portion = transaction.total_transaction_value * Decimal('0.8')
        transaction.stock_portion = transaction.total_transaction_value * Decimal('0.2')
        
        self.ma_transactions[transaction_id] = transaction
        acquirer.pending_transactions.append(transaction_id)
        target.pending_transactions.append(transaction_id)
        
        logger.info(f"Initiated {transaction_type.value}: {acquirer.name} acquiring {target.name} for ${transaction.total_transaction_value}")
        return transaction_id
        
    async def process_ipo(self, corporation_id: str, target_raise: Decimal) -> str:
        """Process an Initial Public Offering"""
        if corporation_id not in self.corporations:
            raise ValueError("Invalid corporation ID")
            
        corporation = self.corporations[corporation_id]
        if corporation.public_status:
            raise ValueError("Corporation is already public")
            
        ipo_process = IPOProcess(corporation, target_raise)
        
        # Structure the offering
        offering_details = ipo_process.structure_offering()
        
        # Conduct roadshow
        roadshow_results = ipo_process.conduct_roadshow()
        
        # Complete IPO
        completion_results = ipo_process.complete_ipo()
        
        self.ipo_processes[ipo_process.process_id] = ipo_process
        self.completed_ipos += 1
        self._update_market_statistics()
        
        logger.info(f"Completed IPO for {corporation.name}: ${completion_results['final_price']} per share")
        
        return ipo_process.process_id
        
    async def execute_ma_transaction(self, transaction_id: str) -> Dict[str, Any]:
        """Execute a completed M&A transaction"""
        if transaction_id not in self.ma_transactions:
            raise ValueError("Invalid transaction ID")
            
        transaction = self.ma_transactions[transaction_id]
        
        # Perform due diligence
        dd_results = transaction.perform_due_diligence()
        
        if dd_results["recommendation"] == "do_not_proceed":
            transaction.status = "terminated"
            return {"status": "terminated", "reason": "due_diligence_failed"}
            
        # Calculate synergies
        synergies = transaction.calculate_synergies()
        
        # Get regulatory approvals
        regulatory_reqs = transaction.get_regulatory_requirements()
        
        # Conduct shareholder votes
        acquirer_vote = transaction.acquirer.conduct_shareholder_vote(
            f"Approve acquisition of {transaction.target.name}",
            f"vote_{transaction_id}_acquirer"
        )
        
        target_vote = transaction.target.conduct_shareholder_vote(
            f"Approve sale to {transaction.acquirer.name}",
            f"vote_{transaction_id}_target"
        )
        
        # Check if transaction proceeds
        if not (acquirer_vote["passed"] and target_vote["passed"]):
            transaction.status = "terminated"
            return {"status": "terminated", "reason": "shareholder_rejection"}
            
        # Execute transaction
        # Simplified: combine companies (in practice, much more complex)
        transaction.acquirer.subsidiaries.append(transaction.target.corporation_id)
        transaction.acquirer.total_assets += transaction.target.total_assets
        transaction.acquirer.revenue += transaction.target.revenue
        transaction.acquirer.ebitda += transaction.target.ebitda + synergies["cost_synergies"]
        transaction.acquirer.cash_balance -= transaction.cash_portion
        
        # Issue new shares for stock portion
        if transaction.stock_portion > 0:
            new_shares = int(transaction.stock_portion / transaction.acquirer.share_price)
            transaction.acquirer.outstanding_shares += new_shares
            
        transaction.status = "completed"
        self.active_ma_transactions -= 1
        
        return {
            "status": "completed",
            "transaction_value": transaction.total_transaction_value,
            "synergies_expected": synergies["total_synergies"],
            "combined_revenue": transaction.acquirer.revenue,
            "combined_market_cap": transaction.acquirer.market_cap
        }
        
    def get_corporation_analytics(self, corporation_id: str) -> Dict[str, Any]:
        """Get comprehensive analytics for a corporation"""
        if corporation_id not in self.corporations:
            raise ValueError("Invalid corporation ID")
            
        corp = self.corporations[corporation_id]
        
        # Financial metrics
        valuation_multiples = corp.calculate_valuation_multiples()
        
        # Governance analysis
        governance_score = corp.update_governance_score()
        
        # Ownership analysis
        ownership_concentration = {}
        for shareholder_id in corp.shareholders:
            ownership_concentration[shareholder_id] = corp.calculate_ownership_percentage(shareholder_id)
            
        # Performance metrics
        total_exec_comp = sum(
            exec_comp.total_compensation(corp.share_price)
            for exec_comp in corp.executives.values()
        )
        
        return {
            "basic_info": {
                "corporation_id": corporation_id,
                "name": corp.name,
                "structure": corp.structure.value,
                "incorporation_state": corp.incorporation_state,
                "public_status": corp.public_status,
                "exchange_listing": corp.exchange_listing
            },
            "financial_metrics": {
                "market_cap": corp.market_cap,
                "enterprise_value": corp.calculate_enterprise_value(),
                "revenue": corp.revenue,
                "ebitda": corp.ebitda,
                "net_income": corp.net_income,
                "total_assets": corp.total_assets,
                "cash_balance": corp.cash_balance,
                "valuation_multiples": valuation_multiples
            },
            "governance_metrics": {
                "governance_score": governance_score,
                "board_size": len(corp.board_members),
                "independent_directors": sum(1 for m in corp.board_members.values() if m.is_independent()),
                "total_executive_compensation": total_exec_comp,
                "esg_score": corp.esg_score
            },
            "ownership_structure": {
                "outstanding_shares": corp.outstanding_shares,
                "share_price": corp.share_price,
                "ownership_concentration": ownership_concentration,
                "number_of_shareholders": len(corp.shareholders)
            },
            "corporate_activity": {
                "subsidiaries": len(corp.subsidiaries),
                "pending_transactions": len(corp.pending_transactions),
                "acquisition_history": len(corp.acquisition_history)
            }
        }
        
    def get_market_overview(self) -> Dict[str, Any]:
        """Get overview of the entire corporate market"""
        self._update_market_statistics()
        
        # Corporation counts by structure
        structure_counts = defaultdict(int)
        for corp in self.corporations.values():
            structure_counts[corp.structure.value] += 1
            
        # Market cap distribution
        market_cap_ranges = {
            "micro_cap": 0,      # < $300M
            "small_cap": 0,      # $300M - $2B
            "mid_cap": 0,        # $2B - $10B  
            "large_cap": 0,      # $10B - $200B
            "mega_cap": 0        # > $200B
        }
        
        for corp in self.corporations.values():
            market_cap = corp.market_cap
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
                
        # M&A activity
        ma_activity = {
            "active_transactions": len([t for t in self.ma_transactions.values() if t.status in ["announced", "pending"]]),
            "completed_transactions": len([t for t in self.ma_transactions.values() if t.status == "completed"]),
            "total_ma_value": sum(t.total_transaction_value for t in self.ma_transactions.values() if t.status == "completed")
        }
        
        return {
            "system_overview": {
                "total_corporations": len(self.corporations),
                "total_market_cap": self.total_market_cap,
                "public_companies": len([c for c in self.corporations.values() if c.public_status]),
                "average_governance_score": self.average_governance_score,
                "completed_ipos": self.completed_ipos
            },
            "structure_distribution": dict(structure_counts),
            "market_cap_distribution": market_cap_ranges,
            "ma_activity": ma_activity,
            "market_health": {
                "high_governance_companies": len([c for c in self.corporations.values() if c.governance_score > 80]),
                "esg_leaders": len([c for c in self.corporations.values() if c.esg_score > 80]),
                "investment_grade_credit": len([c for c in self.corporations.values() if c.credit_rating in ["AAA", "AA", "A", "BBB"]])
            }
        }
        
    def _update_market_statistics(self):
        """Update system-wide market statistics"""
        self.total_market_cap = sum(corp.market_cap for corp in self.corporations.values())
        if self.corporations:
            self.average_governance_score = sum(corp.governance_score for corp in self.corporations.values()) / len(self.corporations)
        self.active_ma_transactions = len([t for t in self.ma_transactions.values() if t.status in ["announced", "pending"]])

# Example usage and testing
async def demonstrate_corporation_formation():
    """Demonstrate the corporation formation system capabilities"""
    
    system = CorporationFormationSystem()
    
    print("🏢 CORPORATION FORMATION SYSTEMS DEMONSTRATION")
    print("=" * 60)
    
    # 1. Form different types of corporations
    print("\n1. FORMING CORPORATIONS")
    print("-" * 30)
    
    tech_corp_id = await system.form_corporation(
        "TechInnovate Corp",
        CorporateStructure.C_CORPORATION,
        Decimal('50000000')  # $50M initial capital
    )
    
    bank_corp_id = await system.form_corporation(
        "Global Financial Partners",
        CorporateStructure.PUBLIC_COMPANY,
        Decimal('500000000')  # $500M initial capital
    )
    
    pe_fund_id = await system.form_corporation(
        "Alpha Capital Management",
        CorporateStructure.PRIVATE_EQUITY,
        Decimal('2000000000')  # $2B capital
    )
    
    # 2. Issue shares and build ownership structure
    print("\n2. BUILDING OWNERSHIP STRUCTURES")
    print("-" * 30)
    
    tech_corp = system.corporations[tech_corp_id]
    
    # Seed funding round
    tech_corp.issue_shares(ShareClass.PREFERRED_A, 500000, Decimal('2.00'), "vc_fund_001")
    tech_corp.issue_shares(ShareClass.COMMON, 1000000, Decimal('0.50'), "founder_001")
    tech_corp.issue_shares(ShareClass.COMMON, 750000, Decimal('0.50'), "founder_002")
    
    # Add key board members
    tech_corp.add_board_member("John Smith", GovernanceRole.CHAIRMAN, True, ["audit", "compensation"])
    tech_corp.add_board_member("Sarah Johnson", GovernanceRole.INDEPENDENT_DIRECTOR, True, ["audit"])
    tech_corp.add_board_member("Mike Davis", GovernanceRole.INDEPENDENT_DIRECTOR, True, ["compensation"])
    
    # 3. Conduct IPO process
    print("\n3. INITIAL PUBLIC OFFERING")
    print("-" * 30)
    
    ipo_id = await system.process_ipo(tech_corp_id, Decimal('100000000'))  # $100M raise
    ipo_process = system.ipo_processes[ipo_id]
    
    print(f"IPO completed for {tech_corp.name}")
    print(f"Final price: ${ipo_process.final_price}")
    print(f"Shares sold: {ipo_process.shares_offered:,}")
    print(f"Gross proceeds: ${ipo_process.shares_offered * ipo_process.final_price:,.0f}")
    
    # 4. M&A Transaction
    print("\n4. MERGERS & ACQUISITIONS")
    print("-" * 30)
    
    # Create target company
    target_id = await system.form_corporation(
        "StartupTarget Inc",
        CorporateStructure.C_CORPORATION,
        Decimal('10000000')
    )
    
    # Initiate acquisition
    ma_id = await system.initiate_ma_transaction(
        acquirer_id=tech_corp_id,
        target_id=target_id,
        transaction_type=MATransactionType.ACQUISITION,
        offer_price_per_share=Decimal('25.00')
    )
    
    # Execute transaction
    ma_result = await system.execute_ma_transaction(ma_id)
    print(f"M&A Transaction: {ma_result['status']}")
    if ma_result['status'] == 'completed':
        print(f"Transaction value: ${ma_result['transaction_value']:,.0f}")
        print(f"Expected synergies: ${ma_result['synergies_expected']:,.0f}")
    
    # 5. Corporate governance and analytics
    print("\n5. CORPORATE ANALYTICS")
    print("-" * 30)
    
    analytics = system.get_corporation_analytics(tech_corp_id)
    
    print(f"Company: {analytics['basic_info']['name']}")
    print(f"Market Cap: ${analytics['financial_metrics']['market_cap']:,.0f}")
    print(f"P/E Ratio: {analytics['financial_metrics']['valuation_multiples']['price_to_earnings']:.1f}")
    print(f"Governance Score: {analytics['governance_metrics']['governance_score']}/100")
    print(f"Board Independence: {analytics['governance_metrics']['independent_directors']}/{analytics['governance_metrics']['board_size']}")
    
    # 6. Market overview
    print("\n6. MARKET OVERVIEW")
    print("-" * 30)
    
    market_overview = system.get_market_overview()
    print(f"Total Corporations: {market_overview['system_overview']['total_corporations']}")
    print(f"Total Market Cap: ${market_overview['system_overview']['total_market_cap']:,.0f}")
    print(f"Public Companies: {market_overview['system_overview']['public_companies']}")
    print(f"Completed IPOs: {market_overview['system_overview']['completed_ipos']}")
    print(f"Active M&A: {market_overview['ma_activity']['active_transactions']}")
    
    print("\n✅ Corporation Formation System demonstration completed successfully!")
    return system

if __name__ == "__main__":
    # Run the demonstration
    asyncio.run(demonstrate_corporation_formation())
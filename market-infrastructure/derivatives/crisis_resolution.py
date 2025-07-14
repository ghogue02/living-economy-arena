"""
Crisis Resolution System
Phase 3 Market Complexity - Crisis Resolution and Recovery Mechanisms

This module implements comprehensive crisis resolution mechanisms including
bailouts, bankruptcies, restructuring, and economic recovery processes.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any, Set
from dataclasses import dataclass, field
from enum import Enum
import random
from datetime import datetime, timedelta
import logging
from collections import defaultdict


class ResolutionType(Enum):
    """Types of crisis resolution mechanisms"""
    BAILOUT = "bailout"
    BANKRUPTCY = "bankruptcy"
    RESTRUCTURING = "restructuring"
    LIQUIDATION = "liquidation"
    MERGER_ACQUISITION = "merger_acquisition"
    BRIDGE_BANK = "bridge_bank"
    GOOD_BANK_BAD_BANK = "good_bank_bad_bank"
    DEBT_FORGIVENESS = "debt_forgiveness"
    CAPITAL_INJECTION = "capital_injection"
    ASSET_GUARANTEE = "asset_guarantee"


class ResolutionAuthority(Enum):
    """Authorities responsible for crisis resolution"""
    CENTRAL_BANK = "central_bank"
    TREASURY = "treasury"
    FDIC = "fdic"
    RESOLUTION_CORPORATION = "resolution_corporation"
    COURT_SYSTEM = "court_system"
    INTERNATIONAL_BODY = "international_body"


class RecoveryPhase(Enum):
    """Phases of economic recovery"""
    CRISIS_PEAK = "crisis_peak"
    STABILIZATION = "stabilization"
    EARLY_RECOVERY = "early_recovery"
    SUSTAINED_GROWTH = "sustained_growth"
    NORMALIZATION = "normalization"


@dataclass
class ResolutionPlan:
    """Crisis resolution plan details"""
    institution_id: str
    resolution_type: ResolutionType
    authority: ResolutionAuthority
    cost_estimate: float
    timeline_months: int
    success_probability: float
    systemic_impact: float
    moral_hazard_score: float
    political_feasibility: float
    legal_complexity: float


@dataclass
class BailoutPackage:
    """Government bailout package details"""
    package_id: str
    total_amount: float
    equity_injection: float
    debt_guarantee: float
    asset_purchase: float
    conditions: List[str]
    recipient_institutions: List[str]
    repayment_terms: Dict
    oversight_requirements: List[str]
    public_support: float


@dataclass
class BankruptcyProceeding:
    """Bankruptcy proceeding details"""
    institution_id: str
    filing_date: datetime
    bankruptcy_type: str  # Chapter 7, 11, etc.
    total_assets: float
    total_liabilities: float
    creditor_classes: Dict[str, float]
    recovery_rates: Dict[str, float]
    liquidation_value: float
    going_concern_value: float
    restructuring_plan: Optional[Dict] = None


class CrisisResolutionEngine:
    """Core engine for crisis resolution and recovery management"""
    
    def __init__(self):
        self.failed_institutions: Dict[str, Dict] = {}
        self.resolution_plans: Dict[str, ResolutionPlan] = {}
        self.active_resolutions: Dict[str, Dict] = {}
        self.bailout_packages: Dict[str, BailoutPackage] = {}
        self.bankruptcy_proceedings: Dict[str, BankruptcyProceeding] = {}
        
        self.resolution_costs: Dict[str, float] = {}
        self.systemic_impact_history: List[Dict] = []
        self.recovery_metrics: Dict[str, float] = {}
        
        # Policy parameters
        self.bailout_criteria = {
            'systemic_importance': 0.1,
            'interconnectedness': 0.15,
            'size_threshold': 100e9,  # $100B assets
            'political_cost_limit': 1e12  # $1T total
        }
        
    def register_failing_institution(self, institution_id: str, asset_size: float,
                                   liability_size: float, systemic_importance: float,
                                   interconnectedness: float) -> str:
        """Register a failing financial institution"""
        self.failed_institutions[institution_id] = {
            'asset_size': asset_size,
            'liability_size': liability_size,
            'equity': asset_size - liability_size,
            'systemic_importance': systemic_importance,
            'interconnectedness': interconnectedness,
            'failure_date': datetime.now(),
            'resolution_status': 'PENDING',
            'creditors': {},
            'counterparties': set(),
            'critical_functions': [],
            'public_support': 0.0
        }
        
        logging.error(f"Registered failing institution: {institution_id}")
        return institution_id
        
    def assess_resolution_options(self, institution_id: str) -> List[ResolutionPlan]:
        """Assess available resolution options for failed institution"""
        if institution_id not in self.failed_institutions:
            raise ValueError(f"Institution {institution_id} not found")
            
        institution = self.failed_institutions[institution_id]
        resolution_options = []
        
        # Option 1: Bailout
        bailout_plan = self._assess_bailout_option(institution_id, institution)
        if bailout_plan:
            resolution_options.append(bailout_plan)
            
        # Option 2: Bankruptcy/Liquidation
        bankruptcy_plan = self._assess_bankruptcy_option(institution_id, institution)
        resolution_options.append(bankruptcy_plan)
        
        # Option 3: Restructuring
        restructuring_plan = self._assess_restructuring_option(institution_id, institution)
        if restructuring_plan:
            resolution_options.append(restructuring_plan)
            
        # Option 4: Merger/Acquisition
        merger_plan = self._assess_merger_option(institution_id, institution)
        if merger_plan:
            resolution_options.append(merger_plan)
            
        # Option 5: Bridge Bank
        if institution['systemic_importance'] > 0.1:
            bridge_plan = self._assess_bridge_bank_option(institution_id, institution)
            resolution_options.append(bridge_plan)
            
        # Sort by cost-effectiveness and systemic impact
        resolution_options.sort(key=lambda x: (x.systemic_impact, x.cost_estimate))
        
        return resolution_options
        
    def _assess_bailout_option(self, institution_id: str, institution: Dict) -> Optional[ResolutionPlan]:
        """Assess bailout option for failing institution"""
        # Check bailout criteria
        if (institution['systemic_importance'] < self.bailout_criteria['systemic_importance'] and
            institution['interconnectedness'] < self.bailout_criteria['interconnectedness'] and
            institution['asset_size'] < self.bailout_criteria['size_threshold']):
            return None  # Doesn't meet bailout criteria
            
        # Calculate bailout cost
        equity_shortfall = max(0, -institution['equity'])
        recapitalization_target = institution['asset_size'] * 0.08  # 8% capital ratio
        total_injection_needed = equity_shortfall + recapitalization_target
        
        # Add buffer for market confidence
        confidence_buffer = total_injection_needed * 0.3
        total_cost = total_injection_needed + confidence_buffer
        
        # Political feasibility assessment
        public_support_factor = 1 - institution.get('public_support', 0.5)
        political_feasibility = max(0.1, 0.8 - public_support_factor)
        
        # Success probability
        success_probability = 0.85 * political_feasibility
        
        return ResolutionPlan(
            institution_id=institution_id,
            resolution_type=ResolutionType.BAILOUT,
            authority=ResolutionAuthority.TREASURY,
            cost_estimate=total_cost,
            timeline_months=3,
            success_probability=success_probability,
            systemic_impact=0.2,  # Low systemic impact
            moral_hazard_score=0.9,  # High moral hazard
            political_feasibility=political_feasibility,
            legal_complexity=0.3
        )
        
    def _assess_bankruptcy_option(self, institution_id: str, institution: Dict) -> ResolutionPlan:
        """Assess bankruptcy/liquidation option"""
        # Estimate liquidation costs
        asset_fire_sale_discount = 0.3  # 30% discount on fire sale
        liquidation_value = institution['asset_size'] * (1 - asset_fire_sale_discount)
        
        # Administrative costs
        admin_costs = institution['asset_size'] * 0.05  # 5% of assets
        
        # Systemic impact assessment
        systemic_impact = (
            institution['systemic_importance'] * 0.6 +
            institution['interconnectedness'] * 0.4
        )
        
        # Success probability (always succeeds but with varying recovery)
        success_probability = 0.95
        
        total_cost = admin_costs  # Direct government cost
        
        return ResolutionPlan(
            institution_id=institution_id,
            resolution_type=ResolutionType.BANKRUPTCY,
            authority=ResolutionAuthority.COURT_SYSTEM,
            cost_estimate=total_cost,
            timeline_months=12,
            success_probability=success_probability,
            systemic_impact=systemic_impact,
            moral_hazard_score=0.0,  # No moral hazard
            political_feasibility=0.8,
            legal_complexity=0.7
        )
        
    def _assess_restructuring_option(self, institution_id: str, institution: Dict) -> Optional[ResolutionPlan]:
        """Assess debt restructuring option"""
        # Only viable if institution has positive going-concern value
        if institution['equity'] < -institution['asset_size'] * 0.5:
            return None  # Too insolvent
            
        # Estimate restructuring costs
        debt_forgiveness = abs(institution['equity']) * 0.7  # 70% of equity shortfall
        advisory_costs = institution['asset_size'] * 0.02  # 2% advisory fees
        
        total_cost = advisory_costs  # Government cost (debt forgiveness is creditor cost)
        
        # Success probability depends on creditor cooperation
        creditor_recovery_rate = max(0.3, 1 + institution['equity'] / institution['liability_size'])
        success_probability = min(0.8, creditor_recovery_rate)
        
        return ResolutionPlan(
            institution_id=institution_id,
            resolution_type=ResolutionType.RESTRUCTURING,
            authority=ResolutionAuthority.RESOLUTION_CORPORATION,
            cost_estimate=total_cost,
            timeline_months=8,
            success_probability=success_probability,
            systemic_impact=0.4,
            moral_hazard_score=0.5,
            political_feasibility=0.6,
            legal_complexity=0.8
        )
        
    def _assess_merger_option(self, institution_id: str, institution: Dict) -> Optional[ResolutionPlan]:
        """Assess merger/acquisition option"""
        # Simplified: only viable for smaller institutions
        if institution['asset_size'] > 500e9:  # $500B threshold
            return None
            
        # Find potential acquirers (simplified)
        acquisition_premium = abs(institution['equity']) if institution['equity'] < 0 else 0
        
        # Government incentives/guarantees
        government_guarantee = acquisition_premium * 0.5  # 50% guarantee
        
        success_probability = 0.6  # Market-dependent
        
        return ResolutionPlan(
            institution_id=institution_id,
            resolution_type=ResolutionType.MERGER_ACQUISITION,
            authority=ResolutionAuthority.FDIC,
            cost_estimate=government_guarantee,
            timeline_months=6,
            success_probability=success_probability,
            systemic_impact=0.1,
            moral_hazard_score=0.3,
            political_feasibility=0.7,
            legal_complexity=0.5
        )
        
    def _assess_bridge_bank_option(self, institution_id: str, institution: Dict) -> ResolutionPlan:
        """Assess bridge bank option for systemically important institutions"""
        # Bridge bank setup costs
        operational_costs = institution['asset_size'] * 0.03  # 3% annual operating cost
        capital_injection = institution['asset_size'] * 0.08  # 8% capital ratio
        
        total_cost = operational_costs + capital_injection
        
        return ResolutionPlan(
            institution_id=institution_id,
            resolution_type=ResolutionType.BRIDGE_BANK,
            authority=ResolutionAuthority.FDIC,
            cost_estimate=total_cost,
            timeline_months=24,
            success_probability=0.8,
            systemic_impact=0.3,
            moral_hazard_score=0.4,
            political_feasibility=0.5,
            legal_complexity=0.9
        )
        
    def implement_resolution(self, institution_id: str, chosen_plan: ResolutionPlan) -> Dict:
        """Implement chosen resolution plan"""
        if institution_id not in self.failed_institutions:
            raise ValueError(f"Institution {institution_id} not found")
            
        resolution_id = f"{institution_id}_{chosen_plan.resolution_type.value}_{datetime.now().strftime('%Y%m%d')}"
        
        self.active_resolutions[resolution_id] = {
            'institution_id': institution_id,
            'plan': chosen_plan,
            'start_date': datetime.now(),
            'status': 'IMPLEMENTING',
            'progress': 0.0,
            'actual_cost': 0.0,
            'complications': [],
            'public_reaction': self._assess_public_reaction(chosen_plan)
        }
        
        # Update institution status
        self.failed_institutions[institution_id]['resolution_status'] = 'IN_RESOLUTION'
        
        # Execute specific resolution type
        implementation_result = self._execute_resolution_type(resolution_id, chosen_plan)
        
        # Record costs
        self.resolution_costs[resolution_id] = implementation_result['actual_cost']
        
        # Record systemic impact
        self.systemic_impact_history.append({
            'timestamp': datetime.now(),
            'resolution_id': resolution_id,
            'institution_id': institution_id,
            'resolution_type': chosen_plan.resolution_type.value,
            'systemic_impact': implementation_result['systemic_impact'],
            'market_reaction': implementation_result['market_reaction']
        })
        
        logging.info(f"Implemented {chosen_plan.resolution_type.value} for {institution_id}")
        return implementation_result
        
    def _assess_public_reaction(self, plan: ResolutionPlan) -> Dict:
        """Assess public reaction to resolution plan"""
        base_support = 0.5
        
        # Bailout reduces public support
        if plan.resolution_type == ResolutionType.BAILOUT:
            support_penalty = -0.4
        elif plan.resolution_type == ResolutionType.BANKRUPTCY:
            support_penalty = 0.2  # Public likes seeing consequences
        else:
            support_penalty = 0.0
            
        # Cost impact
        cost_penalty = -min(0.3, plan.cost_estimate / 100e9)  # Per $100B
        
        final_support = max(0.1, base_support + support_penalty + cost_penalty)
        
        return {
            'approval_rating': final_support,
            'media_sentiment': 'NEGATIVE' if final_support < 0.4 else 'NEUTRAL' if final_support < 0.6 else 'POSITIVE',
            'political_pressure': 1 - final_support
        }
        
    def _execute_resolution_type(self, resolution_id: str, plan: ResolutionPlan) -> Dict:
        """Execute specific type of resolution"""
        resolution = self.active_resolutions[resolution_id]
        institution = self.failed_institutions[plan.institution_id]
        
        if plan.resolution_type == ResolutionType.BAILOUT:
            return self._execute_bailout(resolution_id, plan, institution)
        elif plan.resolution_type == ResolutionType.BANKRUPTCY:
            return self._execute_bankruptcy(resolution_id, plan, institution)
        elif plan.resolution_type == ResolutionType.RESTRUCTURING:
            return self._execute_restructuring(resolution_id, plan, institution)
        elif plan.resolution_type == ResolutionType.MERGER_ACQUISITION:
            return self._execute_merger(resolution_id, plan, institution)
        elif plan.resolution_type == ResolutionType.BRIDGE_BANK:
            return self._execute_bridge_bank(resolution_id, plan, institution)
        else:
            return self._execute_generic_resolution(resolution_id, plan, institution)
            
    def _execute_bailout(self, resolution_id: str, plan: ResolutionPlan, institution: Dict) -> Dict:
        """Execute bailout resolution"""
        # Create bailout package
        package_id = f"BAILOUT_{plan.institution_id}_{datetime.now().strftime('%Y%m%d')}"
        
        equity_injection = max(0, -institution['equity']) * 1.2  # 20% buffer
        debt_guarantee = institution['liability_size'] * 0.3  # Guarantee 30% of debt
        asset_purchase = 0.0  # No direct asset purchases in this model
        
        bailout_package = BailoutPackage(
            package_id=package_id,
            total_amount=plan.cost_estimate,
            equity_injection=equity_injection,
            debt_guarantee=debt_guarantee,
            asset_purchase=asset_purchase,
            conditions=[
                "Executive compensation limits",
                "Dividend restrictions",
                "Capital ratio maintenance",
                "Regular stress testing",
                "Board oversight"
            ],
            recipient_institutions=[plan.institution_id],
            repayment_terms={
                'preferred_shares': equity_injection,
                'guarantee_fee': debt_guarantee * 0.02,  # 2% annual fee
                'warrants': institution['asset_size'] * 0.01  # 1% equity warrants
            },
            oversight_requirements=[
                "Monthly financial reporting",
                "Government board members",
                "Lending targets",
                "Risk management oversight"
            ],
            public_support=self.active_resolutions[resolution_id]['public_reaction']['approval_rating']
        )
        
        self.bailout_packages[package_id] = bailout_package
        
        # Update institution
        institution['equity'] += equity_injection
        institution['resolution_status'] = 'RESOLVED_BAILOUT'
        
        # Market reaction
        market_reaction = {
            'institution_stock_price': 0.3,  # 30% jump
            'sector_spillover': 0.15,
            'bond_spreads': -0.5,  # Spreads tighten
            'credit_availability': 0.2
        }
        
        return {
            'success': True,
            'actual_cost': plan.cost_estimate,
            'systemic_impact': 0.1,  # Reduced due to confidence restoration
            'market_reaction': market_reaction,
            'bailout_package': bailout_package,
            'timeline_actual': plan.timeline_months
        }
        
    def _execute_bankruptcy(self, resolution_id: str, plan: ResolutionPlan, institution: Dict) -> Dict:
        """Execute bankruptcy resolution"""
        # Create bankruptcy proceeding
        proceeding = BankruptcyProceeding(
            institution_id=plan.institution_id,
            filing_date=datetime.now(),
            bankruptcy_type="Chapter 11",  # Reorganization
            total_assets=institution['asset_size'],
            total_liabilities=institution['liability_size'],
            creditor_classes={
                'secured_creditors': institution['liability_size'] * 0.4,
                'unsecured_creditors': institution['liability_size'] * 0.3,
                'subordinated_debt': institution['liability_size'] * 0.2,
                'equity_holders': institution['liability_size'] * 0.1
            },
            recovery_rates={
                'secured_creditors': 0.85,
                'unsecured_creditors': 0.45,
                'subordinated_debt': 0.15,
                'equity_holders': 0.0
            },
            liquidation_value=institution['asset_size'] * 0.7,
            going_concern_value=institution['asset_size'] * 0.85
        )
        
        self.bankruptcy_proceedings[plan.institution_id] = proceeding
        
        # Update institution
        institution['resolution_status'] = 'RESOLVED_BANKRUPTCY'
        
        # Market reaction (negative)
        market_reaction = {
            'institution_stock_price': -0.9,  # 90% loss
            'sector_spillover': -0.25,
            'bond_spreads': 1.5,  # Spreads widen significantly
            'credit_availability': -0.4
        }
        
        return {
            'success': True,
            'actual_cost': plan.cost_estimate,
            'systemic_impact': plan.systemic_impact,
            'market_reaction': market_reaction,
            'bankruptcy_proceeding': proceeding,
            'timeline_actual': plan.timeline_months * 1.2  # Usually takes longer
        }
        
    def _execute_restructuring(self, resolution_id: str, plan: ResolutionPlan, institution: Dict) -> Dict:
        """Execute debt restructuring resolution"""
        # Negotiate debt reduction
        debt_reduction = abs(institution['equity']) * 0.6  # 60% of shortfall forgiven
        new_equity = institution['equity'] + debt_reduction
        
        # Update institution
        institution['equity'] = new_equity
        institution['liability_size'] -= debt_reduction
        institution['resolution_status'] = 'RESOLVED_RESTRUCTURING'
        
        # Market reaction (mixed)
        market_reaction = {
            'institution_stock_price': 0.1,  # Small positive
            'sector_spillover': -0.05,
            'bond_spreads': 0.3,  # Some widening
            'credit_availability': -0.1
        }
        
        return {
            'success': True,
            'actual_cost': plan.cost_estimate,
            'systemic_impact': plan.systemic_impact * 0.8,  # Reduced impact
            'market_reaction': market_reaction,
            'debt_reduction': debt_reduction,
            'timeline_actual': plan.timeline_months
        }
        
    def _execute_merger(self, resolution_id: str, plan: ResolutionPlan, institution: Dict) -> Dict:
        """Execute merger/acquisition resolution"""
        # Simulate acquisition
        acquisition_price = max(0, institution['equity'])  # No negative prices
        government_guarantee = plan.cost_estimate
        
        # Update institution
        institution['resolution_status'] = 'RESOLVED_MERGER'
        
        # Market reaction (positive for stability)
        market_reaction = {
            'institution_stock_price': 0.2,  # Acquisition premium
            'sector_spillover': 0.1,
            'bond_spreads': -0.2,  # Spreads tighten
            'credit_availability': 0.1
        }
        
        return {
            'success': True,
            'actual_cost': government_guarantee,
            'systemic_impact': plan.systemic_impact * 0.5,  # Significant reduction
            'market_reaction': market_reaction,
            'acquisition_details': {
                'price': acquisition_price,
                'government_guarantee': government_guarantee
            },
            'timeline_actual': plan.timeline_months
        }
        
    def _execute_bridge_bank(self, resolution_id: str, plan: ResolutionPlan, institution: Dict) -> Dict:
        """Execute bridge bank resolution"""
        # Create bridge bank
        bridge_bank_capital = institution['asset_size'] * 0.08
        operational_subsidy = institution['asset_size'] * 0.03
        
        # Update institution
        institution['equity'] = bridge_bank_capital
        institution['resolution_status'] = 'RESOLVED_BRIDGE_BANK'
        
        # Market reaction (neutral to positive)
        market_reaction = {
            'institution_stock_price': 0.0,  # Government ownership
            'sector_spillover': 0.05,
            'bond_spreads': -0.1,  # Slight tightening
            'credit_availability': 0.15
        }
        
        return {
            'success': True,
            'actual_cost': bridge_bank_capital + operational_subsidy,
            'systemic_impact': plan.systemic_impact * 0.6,  # Reduced impact
            'market_reaction': market_reaction,
            'bridge_bank_details': {
                'capital_injection': bridge_bank_capital,
                'operational_subsidy': operational_subsidy,
                'expected_privatization_timeline': 36  # months
            },
            'timeline_actual': plan.timeline_months
        }
        
    def _execute_generic_resolution(self, resolution_id: str, plan: ResolutionPlan, institution: Dict) -> Dict:
        """Execute generic resolution (fallback)"""
        institution['resolution_status'] = 'RESOLVED_OTHER'
        
        return {
            'success': True,
            'actual_cost': plan.cost_estimate,
            'systemic_impact': plan.systemic_impact,
            'market_reaction': {'neutral': True},
            'timeline_actual': plan.timeline_months
        }
        
    def monitor_recovery_progress(self) -> Dict:
        """Monitor overall economic recovery progress"""
        if not self.systemic_impact_history:
            return {'phase': RecoveryPhase.NORMALIZATION, 'progress': 1.0}
            
        # Calculate recent systemic stress
        recent_impacts = [
            event['systemic_impact'] 
            for event in self.systemic_impact_history[-10:]  # Last 10 events
        ]
        
        avg_recent_impact = np.mean(recent_impacts) if recent_impacts else 0.0
        
        # Determine recovery phase
        if avg_recent_impact > 0.7:
            phase = RecoveryPhase.CRISIS_PEAK
            progress = 0.1
        elif avg_recent_impact > 0.4:
            phase = RecoveryPhase.STABILIZATION
            progress = 0.3
        elif avg_recent_impact > 0.2:
            phase = RecoveryPhase.EARLY_RECOVERY
            progress = 0.6
        elif avg_recent_impact > 0.1:
            phase = RecoveryPhase.SUSTAINED_GROWTH
            progress = 0.8
        else:
            phase = RecoveryPhase.NORMALIZATION
            progress = 1.0
            
        # Calculate recovery metrics
        total_resolution_cost = sum(self.resolution_costs.values())
        successful_resolutions = sum(
            1 for res in self.active_resolutions.values()
            if res['status'] in ['COMPLETED', 'SUCCESSFUL']
        )
        total_resolutions = len(self.active_resolutions)
        
        recovery_metrics = {
            'phase': phase,
            'progress': progress,
            'total_cost': total_resolution_cost,
            'success_rate': successful_resolutions / total_resolutions if total_resolutions > 0 else 0.0,
            'average_systemic_impact': avg_recent_impact,
            'institutions_resolved': len(self.failed_institutions),
            'time_since_peak': self._calculate_time_since_peak()
        }
        
        self.recovery_metrics = recovery_metrics
        return recovery_metrics
        
    def _calculate_time_since_peak(self) -> int:
        """Calculate months since crisis peak"""
        if not self.systemic_impact_history:
            return 0
            
        # Find peak impact
        max_impact = max(event['systemic_impact'] for event in self.systemic_impact_history)
        peak_event = next(
            event for event in self.systemic_impact_history
            if event['systemic_impact'] == max_impact
        )
        
        time_diff = datetime.now() - peak_event['timestamp']
        return int(time_diff.days / 30)  # Convert to months
        
    def generate_resolution_report(self) -> Dict:
        """Generate comprehensive crisis resolution report"""
        if not self.failed_institutions:
            return {'message': 'No institutions in resolution'}
            
        # Resolution type distribution
        resolution_types = defaultdict(int)
        for resolution in self.active_resolutions.values():
            resolution_types[resolution['plan'].resolution_type.value] += 1
            
        # Cost analysis
        total_cost = sum(self.resolution_costs.values())
        cost_by_type = defaultdict(float)
        for resolution_id, cost in self.resolution_costs.items():
            if resolution_id in self.active_resolutions:
                res_type = self.active_resolutions[resolution_id]['plan'].resolution_type.value
                cost_by_type[res_type] += cost
                
        # Effectiveness analysis
        avg_systemic_impact = np.mean([
            event['systemic_impact'] for event in self.systemic_impact_history
        ]) if self.systemic_impact_history else 0.0
        
        # Public support analysis
        avg_public_support = np.mean([
            res['public_reaction']['approval_rating'] 
            for res in self.active_resolutions.values()
        ]) if self.active_resolutions else 0.5
        
        return {
            'summary': {
                'total_institutions': len(self.failed_institutions),
                'total_cost': total_cost,
                'average_systemic_impact': avg_systemic_impact,
                'average_public_support': avg_public_support
            },
            'resolution_distribution': dict(resolution_types),
            'cost_by_type': dict(cost_by_type),
            'recovery_status': self.monitor_recovery_progress(),
            'bailout_packages': len(self.bailout_packages),
            'bankruptcy_proceedings': len(self.bankruptcy_proceedings),
            'moral_hazard_score': self._calculate_moral_hazard_score()
        }
        
    def _calculate_moral_hazard_score(self) -> float:
        """Calculate overall moral hazard score"""
        if not self.active_resolutions:
            return 0.0
            
        total_moral_hazard = sum(
            res['plan'].moral_hazard_score * res['plan'].cost_estimate
            for res in self.active_resolutions.values()
        )
        
        total_cost = sum(
            res['plan'].cost_estimate for res in self.active_resolutions.values()
        )
        
        return total_moral_hazard / total_cost if total_cost > 0 else 0.0


# Example usage and testing
if __name__ == "__main__":
    # Initialize crisis resolution engine
    resolution_engine = CrisisResolutionEngine()
    
    # Register failing institutions
    resolution_engine.register_failing_institution(
        "MEGABANK_A", 2e12, 1.8e12, 0.25, 0.8  # $2T assets, highly systemic
    )
    
    resolution_engine.register_failing_institution(
        "REGIONAL_BANK_B", 100e9, 95e9, 0.05, 0.2  # $100B assets, less systemic
    )
    
    resolution_engine.register_failing_institution(
        "INVESTMENT_BANK_C", 500e9, 480e9, 0.15, 0.6  # $500B assets, moderate systemic
    )
    
    print("Crisis Resolution Engine initialized with failing institutions")
    
    # Assess resolution options for each institution
    for institution_id in resolution_engine.failed_institutions:
        print(f"\nAssessing resolution options for {institution_id}:")
        options = resolution_engine.assess_resolution_options(institution_id)
        
        for i, option in enumerate(options):
            print(f"  Option {i+1}: {option.resolution_type.value}")
            print(f"    Cost: ${option.cost_estimate:.2e}")
            print(f"    Success Probability: {option.success_probability:.2%}")
            print(f"    Systemic Impact: {option.systemic_impact:.3f}")
            print(f"    Moral Hazard: {option.moral_hazard_score:.3f}")
            
        # Choose least costly option with acceptable systemic impact
        chosen_option = min(
            [opt for opt in options if opt.systemic_impact <= 0.5],
            key=lambda x: x.cost_estimate,
            default=options[0]
        )
        
        print(f"  Chosen: {chosen_option.resolution_type.value}")
        
        # Implement resolution
        result = resolution_engine.implement_resolution(institution_id, chosen_option)
        print(f"  Implementation: {'Success' if result['success'] else 'Failed'}")
        print(f"  Actual Cost: ${result['actual_cost']:.2e}")
        
    # Monitor recovery
    recovery_status = resolution_engine.monitor_recovery_progress()
    print(f"\nRecovery Status:")
    print(f"Phase: {recovery_status['phase'].value}")
    print(f"Progress: {recovery_status['progress']:.1%}")
    print(f"Total Cost: ${recovery_status['total_cost']:.2e}")
    
    # Generate final report
    report = resolution_engine.generate_resolution_report()
    print(f"\nFinal Report:")
    print(f"Institutions Resolved: {report['summary']['total_institutions']}")
    print(f"Total Cost: ${report['summary']['total_cost']:.2e}")
    print(f"Public Support: {report['summary']['average_public_support']:.1%}")
    print(f"Moral Hazard Score: {report['moral_hazard_score']:.3f}")
    
    print("\nCrisis Resolution System implementation completed successfully!")
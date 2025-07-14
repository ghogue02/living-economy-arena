"""
Shadow Banking System
Phase 3 Market Complexity - Shadow Banking and Systemic Vulnerabilities

This module implements shadow banking systems that create systemic vulnerabilities,
including repo markets, money market funds, and structured investment vehicles.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass, field
from enum import Enum
import random
from datetime import datetime, timedelta
import logging
from collections import defaultdict


class ShadowBankingEntity(Enum):
    """Types of shadow banking entities"""
    MONEY_MARKET_FUND = "money_market_fund"
    REPO_MARKET = "repo_market"
    STRUCTURED_INVESTMENT_VEHICLE = "siv"
    HEDGE_FUND = "hedge_fund"
    PRIVATE_EQUITY = "private_equity"
    ASSET_BACKED_SECURITY = "asset_backed_security"
    CONDUIT = "conduit"
    SPECIAL_PURPOSE_VEHICLE = "spv"
    INVESTMENT_BANK = "investment_bank"
    BROKER_DEALER = "broker_dealer"


class RiskLevel(Enum):
    """Risk levels for shadow banking activities"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    EXTREME = "extreme"


@dataclass
class ShadowBankingMetrics:
    """Metrics for shadow banking system monitoring"""
    total_assets: float = 0.0
    leverage_ratio: float = 1.0
    maturity_mismatch: float = 0.0  # Short funding, long assets
    liquidity_coverage: float = 1.0
    interconnectedness: float = 0.0
    regulatory_arbitrage: float = 0.0
    systemic_importance: float = 0.0
    run_risk: float = 0.0


@dataclass
class RepoMarketPosition:
    """Repo market position details"""
    participant_id: str
    collateral_type: str
    collateral_value: float
    cash_amount: float
    haircut: float
    repo_rate: float
    maturity_days: int
    counterparty: str
    position_type: str  # "borrower" or "lender"


@dataclass
class MoneyMarketFundProfile:
    """Money market fund characteristics"""
    fund_id: str
    assets_under_management: float
    nav_per_share: float = 1.0
    weighted_average_maturity: int = 30  # days
    weekly_liquid_assets: float = 0.30
    daily_liquid_assets: float = 0.10
    credit_quality: str = "AAA"
    investor_concentration: float = 0.0
    gate_threshold: float = 0.30  # Redemption gate trigger


class ShadowBankingSystem:
    """Core shadow banking system implementation"""
    
    def __init__(self):
        self.entities: Dict[str, Dict] = {}
        self.repo_positions: List[RepoMarketPosition] = []
        self.mmf_profiles: Dict[str, MoneyMarketFundProfile] = {}
        self.interconnection_matrix: np.ndarray = None
        self.system_metrics = ShadowBankingMetrics()
        self.run_events: List[Dict] = []
        
    def register_entity(self, entity_id: str, entity_type: ShadowBankingEntity,
                       initial_assets: float, leverage_target: float = 2.0):
        """Register a shadow banking entity"""
        self.entities[entity_id] = {
            'type': entity_type,
            'assets': initial_assets,
            'liabilities': initial_assets / leverage_target,
            'equity': initial_assets - (initial_assets / leverage_target),
            'leverage_ratio': leverage_target,
            'funding_sources': {},
            'asset_portfolio': {},
            'risk_metrics': {
                'var_95': 0.0,
                'expected_shortfall': 0.0,
                'liquidity_risk': 0.0,
                'credit_risk': 0.0,
                'market_risk': 0.0
            },
            'regulatory_capital': 0.0,
            'stress_level': 0.0,
            'run_susceptibility': 0.0
        }
        
        logging.info(f"Registered {entity_type.value} entity: {entity_id}")
        return entity_id
        
    def create_repo_position(self, borrower: str, lender: str, collateral_type: str,
                           collateral_value: float, haircut: float = 0.02,
                           maturity_days: int = 1, repo_rate: float = 0.02) -> str:
        """Create a repo market position"""
        cash_amount = collateral_value * (1 - haircut)
        
        position = RepoMarketPosition(
            participant_id=borrower,
            collateral_type=collateral_type,
            collateral_value=collateral_value,
            cash_amount=cash_amount,
            haircut=haircut,
            repo_rate=repo_rate,
            maturity_days=maturity_days,
            counterparty=lender,
            position_type="borrower"
        )
        
        self.repo_positions.append(position)
        
        # Update entity positions
        if borrower in self.entities:
            self.entities[borrower]['funding_sources'][f'repo_{len(self.repo_positions)}'] = {
                'amount': cash_amount,
                'cost': repo_rate,
                'maturity': maturity_days,
                'type': 'repo'
            }
            
        # Create corresponding lender position
        lender_position = RepoMarketPosition(
            participant_id=lender,
            collateral_type=collateral_type,
            collateral_value=collateral_value,
            cash_amount=cash_amount,
            haircut=haircut,
            repo_rate=repo_rate,
            maturity_days=maturity_days,
            counterparty=borrower,
            position_type="lender"
        )
        
        self.repo_positions.append(lender_position)
        
        position_id = f"repo_{len(self.repo_positions)//2}"
        logging.info(f"Created repo position: {position_id}")
        return position_id
        
    def create_money_market_fund(self, fund_id: str, initial_aum: float) -> str:
        """Create a money market fund"""
        mmf = MoneyMarketFundProfile(
            fund_id=fund_id,
            assets_under_management=initial_aum
        )
        
        self.mmf_profiles[fund_id] = mmf
        
        # Register as shadow banking entity
        self.register_entity(fund_id, ShadowBankingEntity.MONEY_MARKET_FUND, initial_aum, 1.0)
        
        # Initialize typical MMF portfolio
        self._initialize_mmf_portfolio(fund_id)
        
        logging.info(f"Created money market fund: {fund_id}")
        return fund_id
        
    def _initialize_mmf_portfolio(self, fund_id: str):
        """Initialize typical money market fund portfolio"""
        entity = self.entities[fund_id]
        aum = entity['assets']
        
        # Typical MMF asset allocation
        entity['asset_portfolio'] = {
            'treasury_bills': aum * 0.30,
            'commercial_paper': aum * 0.25,
            'certificates_of_deposit': aum * 0.20,
            'repo_agreements': aum * 0.15,
            'government_agency_debt': aum * 0.10
        }
        
    def simulate_repo_market_stress(self, stress_severity: float = 0.5) -> Dict:
        """Simulate repo market stress event"""
        stress_results = {
            'timestamp': datetime.now(),
            'severity': stress_severity,
            'affected_positions': [],
            'haircut_increases': {},
            'funding_withdrawn': 0.0,
            'fire_sales': []
        }
        
        # Increase haircuts across collateral types
        collateral_stress = {
            'corporate_bonds': stress_severity * 0.05,
            'mortgage_securities': stress_severity * 0.08,
            'treasury_securities': stress_severity * 0.02,
            'equities': stress_severity * 0.12,
            'foreign_bonds': stress_severity * 0.10
        }
        
        total_funding_withdrawn = 0.0
        
        for position in self.repo_positions:
            if position.position_type == "borrower":
                # Apply haircut stress
                if position.collateral_type in collateral_stress:
                    haircut_increase = collateral_stress[position.collateral_type]
                    new_haircut = position.haircut + haircut_increase
                    
                    # Calculate funding shortfall
                    new_cash_amount = position.collateral_value * (1 - new_haircut)
                    funding_shortfall = position.cash_amount - new_cash_amount
                    
                    if funding_shortfall > 0:
                        stress_results['affected_positions'].append({
                            'borrower': position.participant_id,
                            'collateral_type': position.collateral_type,
                            'funding_shortfall': funding_shortfall,
                            'haircut_increase': haircut_increase
                        })
                        
                        total_funding_withdrawn += funding_shortfall
                        
                        # Force asset sales if funding withdrawn
                        if funding_shortfall > position.collateral_value * 0.1:
                            fire_sale = self._trigger_fire_sale(
                                position.participant_id, funding_shortfall
                            )
                            stress_results['fire_sales'].append(fire_sale)
                            
                    stress_results['haircut_increases'][position.collateral_type] = haircut_increase
                    
        stress_results['funding_withdrawn'] = total_funding_withdrawn
        
        # Update system stress levels
        self._update_system_stress(stress_severity)
        
        logging.warning(f"Repo market stress: {total_funding_withdrawn:.2e} funding withdrawn")
        return stress_results
        
    def _trigger_fire_sale(self, entity_id: str, required_liquidity: float) -> Dict:
        """Trigger fire sale of assets"""
        if entity_id not in self.entities:
            return {}
            
        entity = self.entities[entity_id]
        portfolio = entity['asset_portfolio']
        
        fire_sale = {
            'entity': entity_id,
            'required_liquidity': required_liquidity,
            'assets_sold': {},
            'price_impact': {},
            'total_proceeds': 0.0
        }
        
        # Sell most liquid assets first at discounted prices
        liquidity_ranking = [
            'treasury_bills', 'repo_agreements', 'commercial_paper',
            'certificates_of_deposit', 'government_agency_debt', 'corporate_bonds'
        ]
        
        remaining_liquidity_need = required_liquidity
        
        for asset_type in liquidity_ranking:
            if asset_type in portfolio and remaining_liquidity_need > 0:
                available_amount = portfolio[asset_type]
                sell_amount = min(available_amount, remaining_liquidity_need * 1.2)  # Sell extra for safety
                
                # Fire sale discount based on asset type and market stress
                if asset_type in ['treasury_bills', 'repo_agreements']:
                    discount = 0.02  # Minimal discount for most liquid
                elif asset_type in ['commercial_paper', 'certificates_of_deposit']:
                    discount = 0.05
                else:
                    discount = 0.10  # Higher discount for less liquid
                    
                # Additional discount for market stress
                stress_discount = self.system_metrics.run_risk * 0.05
                total_discount = discount + stress_discount
                
                proceeds = sell_amount * (1 - total_discount)
                
                fire_sale['assets_sold'][asset_type] = sell_amount
                fire_sale['price_impact'][asset_type] = total_discount
                fire_sale['total_proceeds'] += proceeds
                
                # Update portfolio
                portfolio[asset_type] -= sell_amount
                remaining_liquidity_need -= proceeds
                
                if remaining_liquidity_need <= 0:
                    break
                    
        return fire_sale
        
    def simulate_mmf_run(self, fund_id: str, redemption_pressure: float = 0.3) -> Dict:
        """Simulate money market fund run"""
        if fund_id not in self.mmf_profiles:
            raise ValueError(f"Money market fund {fund_id} not found")
            
        mmf = self.mmf_profiles[fund_id]
        entity = self.entities[fund_id]
        
        run_results = {
            'fund_id': fund_id,
            'timestamp': datetime.now(),
            'redemption_pressure': redemption_pressure,
            'redemptions_requested': 0.0,
            'liquidity_available': 0.0,
            'gates_triggered': False,
            'nav_impact': 0.0,
            'asset_sales': {},
            'contagion_risk': 0.0
        }
        
        # Calculate redemption amount
        redemptions_requested = mmf.assets_under_management * redemption_pressure
        run_results['redemptions_requested'] = redemptions_requested
        
        # Check available liquidity
        daily_liquid = mmf.assets_under_management * mmf.daily_liquid_assets
        weekly_liquid = mmf.assets_under_management * mmf.weekly_liquid_assets
        
        if redemptions_requested > daily_liquid:
            # Need to sell assets
            liquidity_shortfall = redemptions_requested - daily_liquid
            
            if liquidity_shortfall > weekly_liquid - daily_liquid:
                # Trigger redemption gates
                run_results['gates_triggered'] = True
                actual_redemptions = daily_liquid + (weekly_liquid - daily_liquid)
                
                # NAV impact from gates
                run_results['nav_impact'] = -0.02  # 2% discount for gating
                mmf.nav_per_share *= (1 + run_results['nav_impact'])
                
            else:
                actual_redemptions = redemptions_requested
                
            # Force asset sales
            asset_sales = self._mmf_asset_liquidation(fund_id, liquidity_shortfall)
            run_results['asset_sales'] = asset_sales
            
            # NAV impact from fire sales
            fire_sale_impact = sum(sale['price_impact'] * sale['amount'] 
                                 for sale in asset_sales.values()) / mmf.assets_under_management
            run_results['nav_impact'] += fire_sale_impact
            mmf.nav_per_share *= (1 - fire_sale_impact)
            
        else:
            actual_redemptions = redemptions_requested
            
        # Update fund size
        mmf.assets_under_management -= actual_redemptions
        entity['assets'] = mmf.assets_under_management
        
        # Calculate contagion risk
        run_results['contagion_risk'] = self._calculate_mmf_contagion_risk(fund_id, redemption_pressure)
        
        # Record run event
        self.run_events.append(run_results)
        
        logging.warning(f"MMF run on {fund_id}: {actual_redemptions:.2e} redeemed")
        return run_results
        
    def _mmf_asset_liquidation(self, fund_id: str, liquidity_needed: float) -> Dict:
        """Handle money market fund asset liquidation"""
        entity = self.entities[fund_id]
        portfolio = entity['asset_portfolio']
        
        liquidation_results = {}
        
        # Liquidation order (most to least liquid)
        liquidation_order = [
            'treasury_bills', 'repo_agreements', 'government_agency_debt',
            'certificates_of_deposit', 'commercial_paper'
        ]
        
        remaining_need = liquidity_needed
        
        for asset_type in liquidation_order:
            if asset_type in portfolio and remaining_need > 0:
                available = portfolio[asset_type]
                liquidate_amount = min(available, remaining_need)
                
                # Price impact based on liquidation pressure and asset type
                if asset_type == 'treasury_bills':
                    price_impact = 0.001  # Minimal impact
                elif asset_type in ['repo_agreements', 'government_agency_debt']:
                    price_impact = 0.005
                else:
                    price_impact = 0.01
                    
                # Additional impact from market stress
                stress_impact = self.system_metrics.run_risk * 0.002
                total_impact = price_impact + stress_impact
                
                proceeds = liquidate_amount * (1 - total_impact)
                
                liquidation_results[asset_type] = {
                    'amount': liquidate_amount,
                    'price_impact': total_impact,
                    'proceeds': proceeds
                }
                
                portfolio[asset_type] -= liquidate_amount
                remaining_need -= proceeds
                
                if remaining_need <= 0:
                    break
                    
        return liquidation_results
        
    def _calculate_mmf_contagion_risk(self, fund_id: str, redemption_pressure: float) -> float:
        """Calculate contagion risk from MMF run"""
        base_contagion = redemption_pressure * 0.5
        
        # Amplify based on fund size and interconnectedness
        mmf = self.mmf_profiles[fund_id]
        total_mmf_assets = sum(f.assets_under_management for f in self.mmf_profiles.values())
        
        if total_mmf_assets > 0:
            size_factor = mmf.assets_under_management / total_mmf_assets
            contagion_risk = base_contagion * (1 + size_factor)
        else:
            contagion_risk = base_contagion
            
        return min(1.0, contagion_risk)
        
    def simulate_structured_product_crisis(self, product_type: str = "CDO") -> Dict:
        """Simulate structured product crisis"""
        crisis_results = {
            'product_type': product_type,
            'timestamp': datetime.now(),
            'rating_downgrades': {},
            'market_freeze': False,
            'price_discovery_breakdown': 0.0,
            'liquidity_evaporation': 0.0,
            'investor_losses': 0.0
        }
        
        # Simulate rating downgrades
        if product_type == "CDO":
            crisis_results['rating_downgrades'] = {
                'AAA_to_junk': 0.15,
                'AA_to_BB': 0.25,
                'A_to_B': 0.30,
                'BBB_to_CCC': 0.40
            }
        elif product_type == "MBS":
            crisis_results['rating_downgrades'] = {
                'AAA_to_junk': 0.08,
                'AA_to_BB': 0.15,
                'A_to_B': 0.20,
                'BBB_to_CCC': 0.25
            }
            
        # Market freeze conditions
        crisis_results['market_freeze'] = True
        crisis_results['price_discovery_breakdown'] = 0.8  # 80% breakdown
        crisis_results['liquidity_evaporation'] = 0.9  # 90% liquidity loss
        
        # Estimate investor losses
        total_structured_products = sum(
            sum(entity['asset_portfolio'].get(product_type.lower(), 0) 
                for entity in self.entities.values())
        )
        
        if product_type == "CDO":
            average_loss = 0.6  # 60% average loss
        elif product_type == "MBS":
            average_loss = 0.4  # 40% average loss
        else:
            average_loss = 0.3  # 30% average loss
            
        crisis_results['investor_losses'] = total_structured_products * average_loss
        
        # Update system stress
        self.system_metrics.run_risk = min(1.0, self.system_metrics.run_risk + 0.3)
        
        logging.error(f"Structured product crisis: {product_type} market frozen")
        return crisis_results
        
    def calculate_shadow_banking_metrics(self) -> ShadowBankingMetrics:
        """Calculate comprehensive shadow banking system metrics"""
        if not self.entities:
            return self.system_metrics
            
        # Total system size
        total_assets = sum(entity['assets'] for entity in self.entities.values())
        
        # Weighted average leverage
        weighted_leverage = sum(
            entity['assets'] * entity['leverage_ratio'] 
            for entity in self.entities.values()
        ) / total_assets if total_assets > 0 else 0
        
        # Maturity mismatch calculation
        total_short_funding = 0.0
        total_long_assets = 0.0
        
        for entity in self.entities.values():
            # Short-term funding (< 30 days)
            short_funding = sum(
                funding['amount'] for funding in entity['funding_sources'].values()
                if funding.get('maturity', 365) <= 30
            )
            total_short_funding += short_funding
            
            # Long-term assets (> 30 days) - simplified assumption
            long_assets = entity['assets'] * 0.7  # Assume 70% are long-term
            total_long_assets += long_assets
            
        maturity_mismatch = (total_short_funding / total_long_assets 
                           if total_long_assets > 0 else 0)
        
        # Interconnectedness (simplified)
        interconnectedness = len(self.repo_positions) / (len(self.entities) ** 2) if self.entities else 0
        
        # Run risk (based on recent events)
        recent_runs = [event for event in self.run_events 
                      if (datetime.now() - event['timestamp']).days <= 30]
        run_risk = min(1.0, len(recent_runs) * 0.2)
        
        # Regulatory arbitrage (simplified metric)
        traditional_banks = sum(1 for entity in self.entities.values() 
                              if entity['type'] not in [ShadowBankingEntity.MONEY_MARKET_FUND,
                                                       ShadowBankingEntity.HEDGE_FUND])
        shadow_entities = len(self.entities) - traditional_banks
        regulatory_arbitrage = shadow_entities / len(self.entities) if self.entities else 0
        
        # Update system metrics
        self.system_metrics = ShadowBankingMetrics(
            total_assets=total_assets,
            leverage_ratio=weighted_leverage,
            maturity_mismatch=maturity_mismatch,
            liquidity_coverage=1.0 - run_risk,  # Inverse relationship
            interconnectedness=interconnectedness,
            regulatory_arbitrage=regulatory_arbitrage,
            systemic_importance=min(1.0, total_assets / 50e12),  # Relative to $50T
            run_risk=run_risk
        )
        
        return self.system_metrics
        
    def _update_system_stress(self, additional_stress: float):
        """Update system-wide stress levels"""
        current_stress = self.system_metrics.run_risk
        new_stress = min(1.0, current_stress + additional_stress * 0.5)
        self.system_metrics.run_risk = new_stress
        
        # Propagate stress to individual entities
        for entity in self.entities.values():
            entity['stress_level'] = min(1.0, entity['stress_level'] + additional_stress * 0.3)
            
    def assess_systemic_vulnerability(self) -> Dict:
        """Assess overall systemic vulnerability"""
        metrics = self.calculate_shadow_banking_metrics()
        
        # Calculate vulnerability score
        vulnerability_factors = {
            'size': min(1.0, metrics.total_assets / 30e12),  # Relative to $30T
            'leverage': min(1.0, metrics.leverage_ratio / 20.0),
            'maturity_mismatch': metrics.maturity_mismatch,
            'interconnectedness': metrics.interconnectedness,
            'run_risk': metrics.run_risk,
            'regulatory_arbitrage': metrics.regulatory_arbitrage
        }
        
        # Weighted vulnerability score
        weights = {
            'size': 0.20,
            'leverage': 0.20,
            'maturity_mismatch': 0.15,
            'interconnectedness': 0.15,
            'run_risk': 0.20,
            'regulatory_arbitrage': 0.10
        }
        
        vulnerability_score = sum(
            vulnerability_factors[factor] * weights[factor]
            for factor in vulnerability_factors
        )
        
        # Risk level classification
        if vulnerability_score < 0.3:
            risk_level = RiskLevel.LOW
        elif vulnerability_score < 0.5:
            risk_level = RiskLevel.MEDIUM
        elif vulnerability_score < 0.7:
            risk_level = RiskLevel.HIGH
        else:
            risk_level = RiskLevel.EXTREME
            
        return {
            'vulnerability_score': vulnerability_score,
            'risk_level': risk_level,
            'vulnerability_factors': vulnerability_factors,
            'system_metrics': metrics,
            'recommendations': self._generate_risk_recommendations(risk_level, vulnerability_factors)
        }
        
    def _generate_risk_recommendations(self, risk_level: RiskLevel, 
                                     vulnerability_factors: Dict) -> List[str]:
        """Generate risk mitigation recommendations"""
        recommendations = []
        
        if risk_level in [RiskLevel.HIGH, RiskLevel.EXTREME]:
            recommendations.append("Implement emergency liquidity facilities")
            recommendations.append("Strengthen capital requirements for SIFIs")
            
        if vulnerability_factors['leverage'] > 0.7:
            recommendations.append("Impose leverage ratio limits")
            
        if vulnerability_factors['maturity_mismatch'] > 0.5:
            recommendations.append("Require stable funding ratios")
            
        if vulnerability_factors['run_risk'] > 0.6:
            recommendations.append("Enhance deposit insurance coverage")
            recommendations.append("Implement redemption fees and gates")
            
        if vulnerability_factors['interconnectedness'] > 0.7:
            recommendations.append("Mandate central clearing for repos")
            recommendations.append("Limit counterparty exposures")
            
        if vulnerability_factors['regulatory_arbitrage'] > 0.6:
            recommendations.append("Extend bank regulations to shadow banks")
            recommendations.append("Implement activity-based regulation")
            
        return recommendations


# Example usage and testing
if __name__ == "__main__":
    # Initialize shadow banking system
    shadow_system = ShadowBankingSystem()
    
    # Create various shadow banking entities
    shadow_system.register_entity("MMF_Prime", ShadowBankingEntity.MONEY_MARKET_FUND, 50e9)
    shadow_system.register_entity("Repo_Dealer_A", ShadowBankingEntity.BROKER_DEALER, 200e9, 15.0)
    shadow_system.register_entity("SIV_Alpha", ShadowBankingEntity.STRUCTURED_INVESTMENT_VEHICLE, 30e9, 8.0)
    shadow_system.register_entity("Hedge_Fund_Beta", ShadowBankingEntity.HEDGE_FUND, 10e9, 5.0)
    
    # Create money market fund
    shadow_system.create_money_market_fund("MMF_Prime", 50e9)
    
    # Create repo positions
    shadow_system.create_repo_position(
        "Repo_Dealer_A", "MMF_Prime", "treasury_securities", 1e9, 0.02, 1, 0.025
    )
    
    shadow_system.create_repo_position(
        "SIV_Alpha", "Repo_Dealer_A", "corporate_bonds", 5e8, 0.05, 7, 0.04
    )
    
    # Calculate initial metrics
    initial_metrics = shadow_system.calculate_shadow_banking_metrics()
    print("Initial Shadow Banking Metrics:")
    print(f"Total Assets: ${initial_metrics.total_assets:.2e}")
    print(f"Average Leverage: {initial_metrics.leverage_ratio:.2f}")
    print(f"Maturity Mismatch: {initial_metrics.maturity_mismatch:.3f}")
    print(f"Run Risk: {initial_metrics.run_risk:.3f}")
    
    # Assess systemic vulnerability
    vulnerability = shadow_system.assess_systemic_vulnerability()
    print(f"\nSystemic Vulnerability: {vulnerability['vulnerability_score']:.3f}")
    print(f"Risk Level: {vulnerability['risk_level'].value}")
    
    # Simulate repo market stress
    print("\nSimulating repo market stress...")
    repo_stress = shadow_system.simulate_repo_market_stress(0.6)
    print(f"Funding withdrawn: ${repo_stress['funding_withdrawn']:.2e}")
    print(f"Fire sales triggered: {len(repo_stress['fire_sales'])}")
    
    # Simulate MMF run
    print("\nSimulating money market fund run...")
    mmf_run = shadow_system.simulate_mmf_run("MMF_Prime", 0.4)
    print(f"Redemptions: ${mmf_run['redemptions_requested']:.2e}")
    print(f"Gates triggered: {mmf_run['gates_triggered']}")
    print(f"NAV impact: {mmf_run['nav_impact']:.3f}")
    
    print("\nShadow Banking System implementation completed successfully!")
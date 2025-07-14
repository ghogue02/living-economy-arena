"""
Market Crisis Generation System
Phase 3 Market Complexity - Crisis and Systemic Risk Modeling

This module implements comprehensive economic bubble formation, financial contagion,
and systemic risk modeling systems for advanced market simulation.
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


class CrisisType(Enum):
    """Types of financial crises"""
    HOUSING_BUBBLE = "housing_bubble"
    TECH_BUBBLE = "tech_bubble"
    CURRENCY_CRISIS = "currency_crisis"
    BANKING_CRISIS = "banking_crisis"
    SOVEREIGN_DEBT = "sovereign_debt"
    COMMODITY_BUBBLE = "commodity_bubble"
    CRYPTO_CRASH = "crypto_crash"
    PENSION_CRISIS = "pension_crisis"
    INSURANCE_FAILURE = "insurance_failure"
    HEDGE_FUND_BLOWUP = "hedge_fund_blowup"


class BubblePhase(Enum):
    """Phases of economic bubble formation"""
    STEALTH = "stealth"
    AWARENESS = "awareness"
    MANIA = "mania"
    BLOW_OFF = "blow_off"
    CRASH = "crash"
    DESPAIR = "despair"


class ContagionChannel(Enum):
    """Channels of financial contagion transmission"""
    DIRECT_EXPOSURE = "direct_exposure"
    FUNDING_LIQUIDITY = "funding_liquidity"
    MARKET_LIQUIDITY = "market_liquidity"
    CONFIDENCE_CHANNEL = "confidence_channel"
    PORTFOLIO_REBALANCING = "portfolio_rebalancing"
    FIRE_SALES = "fire_sales"


@dataclass
class CrisisParameters:
    """Parameters for crisis modeling"""
    crisis_type: CrisisType
    severity: float = 1.0  # 0.1 (mild) to 10.0 (severe)
    duration_months: int = 12
    contagion_probability: float = 0.3
    recovery_speed: float = 0.5
    policy_response_delay: int = 3  # months
    interconnectedness: float = 0.7
    leverage_ratio: float = 10.0
    
    
@dataclass
class BubbleMetrics:
    """Metrics tracking bubble formation"""
    price_to_fundamental_ratio: float = 1.0
    trading_volume_multiplier: float = 1.0
    leverage_expansion: float = 1.0
    speculation_index: float = 0.0
    media_attention: float = 0.0
    new_participant_flow: float = 0.0
    euphoria_index: float = 0.0


@dataclass
class SystemicRiskIndicator:
    """Systemic risk measurement"""
    institution_id: str
    asset_size: float
    interconnectedness_score: float
    leverage_ratio: float
    liquidity_risk: float
    concentration_risk: float
    systemic_importance: float = 0.0


class EconomicBubbleEngine:
    """Engine for economic bubble formation and evolution"""
    
    def __init__(self):
        self.bubbles: Dict[str, Dict] = {}
        self.fundamental_values: Dict[str, float] = {}
        self.bubble_history: List[Dict] = []
        
    def initialize_bubble(self, asset_id: str, bubble_type: CrisisType, 
                         fundamental_value: float) -> str:
        """Initialize a new economic bubble"""
        bubble_id = f"{asset_id}_{bubble_type.value}_{datetime.now().strftime('%Y%m%d')}"
        
        self.bubbles[bubble_id] = {
            'asset_id': asset_id,
            'type': bubble_type,
            'phase': BubblePhase.STEALTH,
            'fundamental_value': fundamental_value,
            'current_price': fundamental_value,
            'metrics': BubbleMetrics(),
            'participants': {
                'rational_investors': 0.8,
                'momentum_traders': 0.15,
                'noise_traders': 0.05
            },
            'leverage_available': 2.0,
            'media_coverage': 0.1,
            'regulatory_attention': 0.0,
            'created_at': datetime.now(),
            'phase_duration': 0
        }
        
        self.fundamental_values[asset_id] = fundamental_value
        
        logging.info(f"Initialized {bubble_type.value} bubble for {asset_id}")
        return bubble_id
    
    def evolve_bubble(self, bubble_id: str, time_step: int) -> Dict:
        """Evolve bubble through different phases"""
        bubble = self.bubbles[bubble_id]
        current_phase = bubble['phase']
        
        # Phase transition logic
        bubble['phase_duration'] += 1
        
        if current_phase == BubblePhase.STEALTH:
            self._stealth_phase_dynamics(bubble)
            if bubble['metrics'].price_to_fundamental_ratio > 1.2:
                bubble['phase'] = BubblePhase.AWARENESS
                bubble['phase_duration'] = 0
                
        elif current_phase == BubblePhase.AWARENESS:
            self._awareness_phase_dynamics(bubble)
            if bubble['metrics'].media_attention > 0.5:
                bubble['phase'] = BubblePhase.MANIA
                bubble['phase_duration'] = 0
                
        elif current_phase == BubblePhase.MANIA:
            self._mania_phase_dynamics(bubble)
            if bubble['metrics'].euphoria_index > 0.8 or bubble['phase_duration'] > 6:
                bubble['phase'] = BubblePhase.BLOW_OFF
                bubble['phase_duration'] = 0
                
        elif current_phase == BubblePhase.BLOW_OFF:
            self._blow_off_phase_dynamics(bubble)
            if bubble['phase_duration'] > 2 or random.random() < 0.3:
                bubble['phase'] = BubblePhase.CRASH
                bubble['phase_duration'] = 0
                
        elif current_phase == BubblePhase.CRASH:
            self._crash_phase_dynamics(bubble)
            if bubble['current_price'] < bubble['fundamental_value'] * 0.5:
                bubble['phase'] = BubblePhase.DESPAIR
                bubble['phase_duration'] = 0
                
        elif current_phase == BubblePhase.DESPAIR:
            self._despair_phase_dynamics(bubble)
        
        # Record state
        bubble_state = {
            'bubble_id': bubble_id,
            'timestamp': datetime.now(),
            'phase': bubble['phase'].value,
            'price': bubble['current_price'],
            'fundamental_value': bubble['fundamental_value'],
            'metrics': bubble['metrics']
        }
        
        self.bubble_history.append(bubble_state)
        return bubble_state
    
    def _stealth_phase_dynamics(self, bubble: Dict):
        """Stealth phase: early insider accumulation"""
        # Slow price appreciation
        price_change = np.random.normal(0.02, 0.01)
        bubble['current_price'] *= (1 + price_change)
        
        # Update metrics
        bubble['metrics'].price_to_fundamental_ratio = (
            bubble['current_price'] / bubble['fundamental_value']
        )
        bubble['metrics'].trading_volume_multiplier = 1.1
        bubble['metrics'].speculation_index = 0.1
        
    def _awareness_phase_dynamics(self, bubble: Dict):
        """Awareness phase: smart money and early adopters enter"""
        # Accelerating price growth
        price_change = np.random.normal(0.05, 0.02)
        bubble['current_price'] *= (1 + price_change)
        
        # Increasing participation
        bubble['participants']['momentum_traders'] += 0.02
        bubble['participants']['rational_investors'] -= 0.02
        
        # Growing media attention
        bubble['media_coverage'] += 0.1
        bubble['metrics'].media_attention = min(1.0, bubble['media_coverage'])
        
        # Update metrics
        bubble['metrics'].price_to_fundamental_ratio = (
            bubble['current_price'] / bubble['fundamental_value']
        )
        bubble['metrics'].trading_volume_multiplier = 1.5
        bubble['metrics'].speculation_index = 0.3
        
    def _mania_phase_dynamics(self, bubble: Dict):
        """Mania phase: widespread participation and euphoria"""
        # Rapid price acceleration
        price_change = np.random.normal(0.10, 0.05)
        bubble['current_price'] *= (1 + price_change)
        
        # Massive participation shift
        bubble['participants']['noise_traders'] += 0.05
        bubble['participants']['momentum_traders'] += 0.03
        bubble['participants']['rational_investors'] -= 0.08
        
        # Leverage expansion
        bubble['leverage_available'] *= 1.2
        bubble['metrics'].leverage_expansion = bubble['leverage_available'] / 2.0
        
        # Euphoria building
        bubble['metrics'].euphoria_index = min(1.0, 
            bubble['metrics'].price_to_fundamental_ratio * 0.2)
        
        # New participant flow
        bubble['metrics'].new_participant_flow = 0.2
        
        # Update metrics
        bubble['metrics'].price_to_fundamental_ratio = (
            bubble['current_price'] / bubble['fundamental_value']
        )
        bubble['metrics'].trading_volume_multiplier = 3.0
        bubble['metrics'].speculation_index = 0.7
        
    def _blow_off_phase_dynamics(self, bubble: Dict):
        """Blow-off phase: final parabolic move"""
        # Parabolic price movement
        price_change = np.random.normal(0.15, 0.10)
        bubble['current_price'] *= (1 + price_change)
        
        # Maximum euphoria
        bubble['metrics'].euphoria_index = 1.0
        bubble['metrics'].speculation_index = 1.0
        
        # Leverage at maximum
        bubble['leverage_available'] *= 1.5
        bubble['metrics'].leverage_expansion = bubble['leverage_available'] / 2.0
        
        # Everyone is in
        bubble['participants']['noise_traders'] = 0.6
        bubble['participants']['momentum_traders'] = 0.35
        bubble['participants']['rational_investors'] = 0.05
        
        # Update metrics
        bubble['metrics'].price_to_fundamental_ratio = (
            bubble['current_price'] / bubble['fundamental_value']
        )
        bubble['metrics'].trading_volume_multiplier = 5.0
        
    def _crash_phase_dynamics(self, bubble: Dict):
        """Crash phase: rapid deleveraging and selling"""
        # Sharp price decline
        price_change = np.random.normal(-0.20, 0.10)
        bubble['current_price'] *= (1 + price_change)
        
        # Forced deleveraging
        bubble['leverage_available'] *= 0.7
        bubble['metrics'].leverage_expansion = bubble['leverage_available'] / 2.0
        
        # Participant exodus
        bubble['participants']['noise_traders'] *= 0.8
        bubble['participants']['momentum_traders'] *= 0.9
        bubble['participants']['rational_investors'] += 0.05
        
        # Metrics collapse
        bubble['metrics'].euphoria_index *= 0.5
        bubble['metrics'].speculation_index *= 0.6
        bubble['metrics'].trading_volume_multiplier = 2.0
        
        # Update price ratio
        bubble['metrics'].price_to_fundamental_ratio = (
            bubble['current_price'] / bubble['fundamental_value']
        )
        
    def _despair_phase_dynamics(self, bubble: Dict):
        """Despair phase: capitulation and value investors return"""
        # Slow price recovery or continued decline
        price_change = np.random.normal(-0.02, 0.05)
        bubble['current_price'] *= (1 + price_change)
        
        # Rational investors return
        bubble['participants']['rational_investors'] += 0.02
        bubble['participants']['noise_traders'] *= 0.95
        
        # Leverage normalization
        bubble['leverage_available'] = max(2.0, bubble['leverage_available'] * 0.9)
        
        # Metrics recovery
        bubble['metrics'].euphoria_index = 0.0
        bubble['metrics'].speculation_index = 0.1
        bubble['metrics'].trading_volume_multiplier = 0.8
        
        # Update price ratio
        bubble['metrics'].price_to_fundamental_ratio = (
            bubble['current_price'] / bubble['fundamental_value']
        )


class FinancialContagionEngine:
    """Engine for modeling financial contagion across markets and institutions"""
    
    def __init__(self):
        self.institutions: Dict[str, Dict] = {}
        self.contagion_matrix: np.ndarray = None
        self.contagion_events: List[Dict] = []
        self.transmission_channels: Dict[ContagionChannel, float] = {
            ContagionChannel.DIRECT_EXPOSURE: 0.3,
            ContagionChannel.FUNDING_LIQUIDITY: 0.25,
            ContagionChannel.MARKET_LIQUIDITY: 0.2,
            ContagionChannel.CONFIDENCE_CHANNEL: 0.15,
            ContagionChannel.PORTFOLIO_REBALANCING: 0.1,
        }
        
    def add_institution(self, institution_id: str, asset_size: float,
                       leverage_ratio: float, liquidity_ratio: float):
        """Add financial institution to contagion network"""
        self.institutions[institution_id] = {
            'asset_size': asset_size,
            'leverage_ratio': leverage_ratio,
            'liquidity_ratio': liquidity_ratio,
            'health_score': 1.0,
            'stress_level': 0.0,
            'exposures': {},
            'funding_sources': {},
            'contagion_susceptibility': 0.0
        }
        
        # Rebuild contagion matrix
        self._build_contagion_matrix()
        
    def add_exposure(self, from_institution: str, to_institution: str,
                    exposure_amount: float, exposure_type: str = "credit"):
        """Add exposure between institutions"""
        if from_institution not in self.institutions:
            raise ValueError(f"Institution {from_institution} not found")
            
        if to_institution not in self.institutions:
            raise ValueError(f"Institution {to_institution} not found")
            
        self.institutions[from_institution]['exposures'][to_institution] = {
            'amount': exposure_amount,
            'type': exposure_type,
            'risk_weight': 1.0
        }
        
        # Rebuild contagion matrix
        self._build_contagion_matrix()
        
    def _build_contagion_matrix(self):
        """Build contagion transmission matrix"""
        n_institutions = len(self.institutions)
        if n_institutions == 0:
            return
            
        institution_list = list(self.institutions.keys())
        self.contagion_matrix = np.zeros((n_institutions, n_institutions))
        
        for i, inst1 in enumerate(institution_list):
            for j, inst2 in enumerate(institution_list):
                if i != j:
                    # Calculate contagion probability based on exposures
                    exposure_prob = self._calculate_exposure_contagion(inst1, inst2)
                    funding_prob = self._calculate_funding_contagion(inst1, inst2)
                    market_prob = self._calculate_market_contagion(inst1, inst2)
                    confidence_prob = self._calculate_confidence_contagion(inst1, inst2)
                    
                    total_prob = (
                        exposure_prob * self.transmission_channels[ContagionChannel.DIRECT_EXPOSURE] +
                        funding_prob * self.transmission_channels[ContagionChannel.FUNDING_LIQUIDITY] +
                        market_prob * self.transmission_channels[ContagionChannel.MARKET_LIQUIDITY] +
                        confidence_prob * self.transmission_channels[ContagionChannel.CONFIDENCE_CHANNEL]
                    )
                    
                    self.contagion_matrix[i, j] = min(1.0, total_prob)
                    
    def _calculate_exposure_contagion(self, from_inst: str, to_inst: str) -> float:
        """Calculate contagion probability through direct exposures"""
        exposures = self.institutions[from_inst]['exposures']
        if to_inst not in exposures:
            return 0.0
            
        exposure_amount = exposures[to_inst]['amount']
        from_assets = self.institutions[from_inst]['asset_size']
        
        # Exposure as percentage of assets
        exposure_ratio = exposure_amount / from_assets
        
        # Higher exposure = higher contagion probability
        return min(1.0, exposure_ratio * 2.0)
        
    def _calculate_funding_contagion(self, from_inst: str, to_inst: str) -> float:
        """Calculate contagion probability through funding liquidity"""
        from_liquidity = self.institutions[from_inst]['liquidity_ratio']
        to_leverage = self.institutions[to_inst]['leverage_ratio']
        
        # Lower liquidity and higher leverage = higher contagion
        return (1 - from_liquidity) * (to_leverage / 20.0)
        
    def _calculate_market_contagion(self, from_inst: str, to_inst: str) -> float:
        """Calculate contagion probability through market liquidity"""
        from_size = self.institutions[from_inst]['asset_size']
        to_size = self.institutions[to_inst]['asset_size']
        
        # Larger institutions have higher market impact
        size_factor = (from_size + to_size) / (2 * 1e12)  # Normalize to trillions
        return min(0.5, size_factor)
        
    def _calculate_confidence_contagion(self, from_inst: str, to_inst: str) -> float:
        """Calculate contagion probability through confidence channel"""
        from_health = self.institutions[from_inst]['health_score']
        to_stress = self.institutions[to_inst]['stress_level']
        
        # Lower health and higher stress = higher confidence contagion
        return (1 - from_health) * to_stress
        
    def simulate_contagion(self, initial_shock_institution: str, 
                          shock_severity: float = 0.5) -> List[Dict]:
        """Simulate contagion spreading from initial shock"""
        if initial_shock_institution not in self.institutions:
            raise ValueError(f"Institution {initial_shock_institution} not found")
            
        # Initialize shock
        self.institutions[initial_shock_institution]['health_score'] *= (1 - shock_severity)
        self.institutions[initial_shock_institution]['stress_level'] = shock_severity
        
        contagion_rounds = []
        institution_list = list(self.institutions.keys())
        affected_institutions = {initial_shock_institution}
        
        round_num = 0
        while round_num < 10:  # Maximum 10 rounds
            round_num += 1
            new_infections = set()
            round_data = {
                'round': round_num,
                'newly_affected': [],
                'total_affected': len(affected_institutions),
                'system_stress': self._calculate_system_stress()
            }
            
            for affected_inst in affected_institutions:
                inst_index = institution_list.index(affected_inst)
                
                for j, target_inst in enumerate(institution_list):
                    if target_inst not in affected_institutions:
                        contagion_prob = self.contagion_matrix[inst_index, j]
                        
                        # Amplify probability based on source institution stress
                        source_stress = self.institutions[affected_inst]['stress_level']
                        adjusted_prob = contagion_prob * (1 + source_stress)
                        
                        if random.random() < adjusted_prob:
                            # Contagion spreads
                            shock_transmission = shock_severity * contagion_prob * 0.7
                            self.institutions[target_inst]['health_score'] *= (1 - shock_transmission)
                            self.institutions[target_inst]['stress_level'] = shock_transmission
                            
                            new_infections.add(target_inst)
                            round_data['newly_affected'].append({
                                'institution': target_inst,
                                'source': affected_inst,
                                'transmission_prob': adjusted_prob,
                                'shock_size': shock_transmission
                            })
                            
                            # Record contagion event
                            self.contagion_events.append({
                                'timestamp': datetime.now(),
                                'source': affected_inst,
                                'target': target_inst,
                                'channel': 'multi_channel',
                                'probability': adjusted_prob,
                                'shock_size': shock_transmission
                            })
            
            if not new_infections:
                break
                
            affected_institutions.update(new_infections)
            contagion_rounds.append(round_data)
            
        return contagion_rounds
        
    def _calculate_system_stress(self) -> float:
        """Calculate overall system stress level"""
        if not self.institutions:
            return 0.0
            
        total_assets = sum(inst['asset_size'] for inst in self.institutions.values())
        weighted_stress = sum(
            inst['stress_level'] * inst['asset_size'] 
            for inst in self.institutions.values()
        )
        
        return weighted_stress / total_assets if total_assets > 0 else 0.0


class SystemicRiskAnalyzer:
    """Analyzer for systemic risk measurement and monitoring"""
    
    def __init__(self):
        self.risk_indicators: Dict[str, SystemicRiskIndicator] = {}
        self.risk_thresholds = {
            'leverage_warning': 15.0,
            'leverage_critical': 25.0,
            'concentration_warning': 0.1,
            'concentration_critical': 0.2,
            'interconnection_warning': 0.7,
            'interconnection_critical': 0.9
        }
        
    def add_institution_risk_profile(self, institution_id: str, asset_size: float,
                                   interconnectedness: float, leverage_ratio: float,
                                   liquidity_risk: float, concentration_risk: float):
        """Add institution risk profile for systemic analysis"""
        indicator = SystemicRiskIndicator(
            institution_id=institution_id,
            asset_size=asset_size,
            interconnectedness_score=interconnectedness,
            leverage_ratio=leverage_ratio,
            liquidity_risk=liquidity_risk,
            concentration_risk=concentration_risk
        )
        
        # Calculate systemic importance
        indicator.systemic_importance = self._calculate_systemic_importance(indicator)
        
        self.risk_indicators[institution_id] = indicator
        
    def _calculate_systemic_importance(self, indicator: SystemicRiskIndicator) -> float:
        """Calculate systemic importance score"""
        # Size factor (0-0.4)
        total_assets = sum(ind.asset_size for ind in self.risk_indicators.values())
        size_factor = min(0.4, indicator.asset_size / (total_assets + indicator.asset_size))
        
        # Interconnectedness factor (0-0.3)
        interconnect_factor = indicator.interconnectedness_score * 0.3
        
        # Leverage factor (0-0.2)
        leverage_factor = min(0.2, indicator.leverage_ratio / 50.0)
        
        # Concentration factor (0-0.1)
        concentration_factor = indicator.concentration_risk * 0.1
        
        return size_factor + interconnect_factor + leverage_factor + concentration_factor
        
    def calculate_systemic_risk_score(self) -> Dict[str, float]:
        """Calculate overall systemic risk score"""
        if not self.risk_indicators:
            return {'overall_risk': 0.0, 'risk_level': 'LOW'}
            
        # Aggregate risk metrics
        total_assets = sum(ind.asset_size for ind in self.risk_indicators.values())
        
        # Weighted average systemic importance
        weighted_importance = sum(
            ind.systemic_importance * ind.asset_size 
            for ind in self.risk_indicators.values()
        ) / total_assets
        
        # Concentration risk (Herfindahl index)
        asset_shares = [ind.asset_size / total_assets for ind in self.risk_indicators.values()]
        herfindahl_index = sum(share ** 2 for share in asset_shares)
        
        # Interconnectedness risk
        avg_interconnectedness = np.mean([
            ind.interconnectedness_score for ind in self.risk_indicators.values()
        ])
        
        # Leverage risk
        asset_weighted_leverage = sum(
            ind.leverage_ratio * ind.asset_size 
            for ind in self.risk_indicators.values()
        ) / total_assets
        
        # Liquidity risk
        asset_weighted_liquidity = sum(
            ind.liquidity_risk * ind.asset_size 
            for ind in self.risk_indicators.values()
        ) / total_assets
        
        # Overall systemic risk score (0-1)
        systemic_risk = (
            weighted_importance * 0.3 +
            herfindahl_index * 0.2 +
            avg_interconnectedness * 0.2 +
            min(1.0, asset_weighted_leverage / 25.0) * 0.2 +
            asset_weighted_liquidity * 0.1
        )
        
        # Risk level classification
        if systemic_risk < 0.3:
            risk_level = 'LOW'
        elif systemic_risk < 0.6:
            risk_level = 'MEDIUM'
        elif systemic_risk < 0.8:
            risk_level = 'HIGH'
        else:
            risk_level = 'CRITICAL'
            
        return {
            'overall_risk': systemic_risk,
            'risk_level': risk_level,
            'weighted_importance': weighted_importance,
            'concentration_index': herfindahl_index,
            'interconnectedness': avg_interconnectedness,
            'leverage_risk': asset_weighted_leverage,
            'liquidity_risk': asset_weighted_liquidity,
            'too_big_to_fail_count': sum(1 for ind in self.risk_indicators.values() 
                                       if ind.systemic_importance > 0.1)
        }
        
    def identify_systemically_important_institutions(self) -> List[Dict]:
        """Identify institutions that are too big to fail"""
        sifis = []
        
        for inst_id, indicator in self.risk_indicators.items():
            if indicator.systemic_importance > 0.1:  # Threshold for SIFI
                risk_profile = {
                    'institution_id': inst_id,
                    'systemic_importance': indicator.systemic_importance,
                    'asset_size': indicator.asset_size,
                    'leverage_ratio': indicator.leverage_ratio,
                    'interconnectedness': indicator.interconnectedness_score,
                    'risk_assessment': self._assess_institution_risk(indicator)
                }
                sifis.append(risk_profile)
                
        # Sort by systemic importance
        sifis.sort(key=lambda x: x['systemic_importance'], reverse=True)
        return sifis
        
    def _assess_institution_risk(self, indicator: SystemicRiskIndicator) -> str:
        """Assess individual institution risk level"""
        risk_factors = 0
        
        if indicator.leverage_ratio > self.risk_thresholds['leverage_critical']:
            risk_factors += 3
        elif indicator.leverage_ratio > self.risk_thresholds['leverage_warning']:
            risk_factors += 1
            
        if indicator.concentration_risk > self.risk_thresholds['concentration_critical']:
            risk_factors += 2
        elif indicator.concentration_risk > self.risk_thresholds['concentration_warning']:
            risk_factors += 1
            
        if indicator.interconnectedness_score > self.risk_thresholds['interconnection_critical']:
            risk_factors += 2
        elif indicator.interconnectedness_score > self.risk_thresholds['interconnection_warning']:
            risk_factors += 1
            
        if indicator.liquidity_risk > 0.8:
            risk_factors += 2
        elif indicator.liquidity_risk > 0.5:
            risk_factors += 1
            
        if risk_factors >= 6:
            return 'CRITICAL'
        elif risk_factors >= 4:
            return 'HIGH'
        elif risk_factors >= 2:
            return 'MEDIUM'
        else:
            return 'LOW'


class CrisisInterventionEngine:
    """Engine for modeling crisis intervention mechanisms"""
    
    def __init__(self):
        self.interventions: List[Dict] = []
        self.policy_tools = {
            'interest_rate_cut': {'effectiveness': 0.3, 'delay': 1, 'cost': 0.1},
            'quantitative_easing': {'effectiveness': 0.5, 'delay': 2, 'cost': 0.3},
            'emergency_lending': {'effectiveness': 0.4, 'delay': 0, 'cost': 0.2},
            'bank_bailout': {'effectiveness': 0.7, 'delay': 1, 'cost': 0.8},
            'deposit_insurance': {'effectiveness': 0.6, 'delay': 0, 'cost': 0.4},
            'capital_injection': {'effectiveness': 0.8, 'delay': 1, 'cost': 0.9},
            'regulatory_forbearance': {'effectiveness': 0.3, 'delay': 0, 'cost': 0.1},
            'coordinated_intervention': {'effectiveness': 0.9, 'delay': 2, 'cost': 1.0}
        }
        
    def assess_intervention_need(self, systemic_risk_score: float, 
                               contagion_spread: float) -> Dict:
        """Assess need for crisis intervention"""
        urgency_score = (systemic_risk_score * 0.6) + (contagion_spread * 0.4)
        
        if urgency_score < 0.3:
            intervention_level = 'MONITORING'
            recommended_tools = []
        elif urgency_score < 0.5:
            intervention_level = 'PREVENTIVE'
            recommended_tools = ['interest_rate_cut', 'regulatory_forbearance']
        elif urgency_score < 0.7:
            intervention_level = 'CORRECTIVE'
            recommended_tools = ['emergency_lending', 'deposit_insurance', 'quantitative_easing']
        elif urgency_score < 0.9:
            intervention_level = 'CRISIS'
            recommended_tools = ['bank_bailout', 'capital_injection', 'coordinated_intervention']
        else:
            intervention_level = 'EMERGENCY'
            recommended_tools = list(self.policy_tools.keys())
            
        return {
            'urgency_score': urgency_score,
            'intervention_level': intervention_level,
            'recommended_tools': recommended_tools,
            'assessment_time': datetime.now()
        }
        
    def implement_intervention(self, tool_name: str, intensity: float = 1.0,
                             target_institutions: List[str] = None) -> Dict:
        """Implement crisis intervention tool"""
        if tool_name not in self.policy_tools:
            raise ValueError(f"Unknown intervention tool: {tool_name}")
            
        tool_config = self.policy_tools[tool_name]
        
        intervention = {
            'tool': tool_name,
            'intensity': intensity,
            'target_institutions': target_institutions or [],
            'effectiveness': tool_config['effectiveness'] * intensity,
            'implementation_delay': tool_config['delay'],
            'cost': tool_config['cost'] * intensity,
            'implemented_at': datetime.now(),
            'status': 'IMPLEMENTING'
        }
        
        self.interventions.append(intervention)
        return intervention
        
    def calculate_intervention_effectiveness(self, crisis_severity: float) -> float:
        """Calculate combined effectiveness of all active interventions"""
        active_interventions = [
            i for i in self.interventions 
            if i['status'] in ['IMPLEMENTING', 'ACTIVE']
        ]
        
        if not active_interventions:
            return 0.0
            
        # Calculate combined effectiveness (with diminishing returns)
        total_effectiveness = 0.0
        for i, intervention in enumerate(active_interventions):
            # Diminishing returns for additional interventions
            weight = 1.0 / (1 + i * 0.3)
            total_effectiveness += intervention['effectiveness'] * weight
            
        # Cap at 95% effectiveness
        total_effectiveness = min(0.95, total_effectiveness)
        
        # Adjust for crisis severity
        return total_effectiveness * (1 - crisis_severity * 0.2)


class CrisisGenerationOrchestrator:
    """Main orchestrator for crisis generation and management"""
    
    def __init__(self):
        self.bubble_engine = EconomicBubbleEngine()
        self.contagion_engine = FinancialContagionEngine()
        self.risk_analyzer = SystemicRiskAnalyzer()
        self.intervention_engine = CrisisInterventionEngine()
        
        self.active_crises: Dict[str, Dict] = {}
        self.crisis_history: List[Dict] = []
        
    def initialize_crisis_scenario(self, scenario_name: str, 
                                 crisis_params: CrisisParameters) -> str:
        """Initialize a comprehensive crisis scenario"""
        scenario_id = f"{scenario_name}_{datetime.now().strftime('%Y%m%d_%H%M')}"
        
        self.active_crises[scenario_id] = {
            'name': scenario_name,
            'parameters': crisis_params,
            'status': 'INITIALIZING',
            'created_at': datetime.now(),
            'bubbles': [],
            'affected_institutions': [],
            'interventions': [],
            'timeline': []
        }
        
        logging.info(f"Initialized crisis scenario: {scenario_id}")
        return scenario_id
        
    def run_crisis_simulation(self, scenario_id: str, time_steps: int = 100) -> Dict:
        """Run comprehensive crisis simulation"""
        if scenario_id not in self.active_crises:
            raise ValueError(f"Crisis scenario {scenario_id} not found")
            
        scenario = self.active_crises[scenario_id]
        scenario['status'] = 'RUNNING'
        
        simulation_results = {
            'scenario_id': scenario_id,
            'total_steps': time_steps,
            'bubble_evolution': [],
            'contagion_events': [],
            'risk_assessments': [],
            'interventions': [],
            'final_state': {}
        }
        
        for step in range(time_steps):
            step_results = self._simulate_step(scenario_id, step)
            
            # Record step results
            if step_results['bubbles']:
                simulation_results['bubble_evolution'].extend(step_results['bubbles'])
            if step_results['contagion']:
                simulation_results['contagion_events'].extend(step_results['contagion'])
            if step_results['interventions']:
                simulation_results['interventions'].extend(step_results['interventions'])
                
            simulation_results['risk_assessments'].append(step_results['risk_assessment'])
            
            # Check for crisis resolution
            if step_results['risk_assessment']['overall_risk'] < 0.1:
                logging.info(f"Crisis resolved at step {step}")
                break
                
        scenario['status'] = 'COMPLETED'
        simulation_results['final_state'] = self._generate_final_state(scenario_id)
        
        # Add to history
        self.crisis_history.append({
            'scenario_id': scenario_id,
            'scenario': scenario,
            'results': simulation_results,
            'completed_at': datetime.now()
        })
        
        return simulation_results
        
    def _simulate_step(self, scenario_id: str, step: int) -> Dict:
        """Simulate one time step of crisis evolution"""
        scenario = self.active_crises[scenario_id]
        step_results = {
            'step': step,
            'bubbles': [],
            'contagion': [],
            'interventions': [],
            'risk_assessment': {}
        }
        
        # Evolve bubbles
        for bubble_id in scenario['bubbles']:
            bubble_state = self.bubble_engine.evolve_bubble(bubble_id, step)
            step_results['bubbles'].append(bubble_state)
            
        # Check for contagion triggers
        systemic_risk = self.risk_analyzer.calculate_systemic_risk_score()
        step_results['risk_assessment'] = systemic_risk
        
        if systemic_risk['overall_risk'] > 0.5 and random.random() < 0.3:
            # Trigger contagion event
            institutions = list(self.contagion_engine.institutions.keys())
            if institutions:
                shock_institution = random.choice(institutions)
                contagion_rounds = self.contagion_engine.simulate_contagion(
                    shock_institution, shock_severity=0.3
                )
                step_results['contagion'] = contagion_rounds
                
        # Assess intervention needs
        intervention_assessment = self.intervention_engine.assess_intervention_need(
            systemic_risk['overall_risk'],
            self.contagion_engine._calculate_system_stress()
        )
        
        # Implement interventions if needed
        if intervention_assessment['intervention_level'] in ['CRISIS', 'EMERGENCY']:
            for tool in intervention_assessment['recommended_tools'][:2]:  # Limit to 2 tools
                intervention = self.intervention_engine.implement_intervention(
                    tool, intensity=0.7
                )
                step_results['interventions'].append(intervention)
                
        return step_results
        
    def _generate_final_state(self, scenario_id: str) -> Dict:
        """Generate final state summary"""
        scenario = self.active_crises[scenario_id]
        
        return {
            'scenario_duration': (datetime.now() - scenario['created_at']).days,
            'total_bubbles': len(scenario['bubbles']),
            'affected_institutions': len(scenario['affected_institutions']),
            'total_interventions': len(scenario['interventions']),
            'final_systemic_risk': self.risk_analyzer.calculate_systemic_risk_score(),
            'system_stress': self.contagion_engine._calculate_system_stress(),
            'resolution_status': 'RESOLVED' if self.risk_analyzer.calculate_systemic_risk_score()['overall_risk'] < 0.2 else 'ONGOING'
        }


# Example usage and testing
if __name__ == "__main__":
    # Initialize crisis orchestrator
    orchestrator = CrisisGenerationOrchestrator()
    
    # Create sample crisis scenario
    crisis_params = CrisisParameters(
        crisis_type=CrisisType.HOUSING_BUBBLE,
        severity=0.8,
        duration_months=18,
        contagion_probability=0.4,
        leverage_ratio=15.0
    )
    
    scenario_id = orchestrator.initialize_crisis_scenario(
        "Subprime Housing Crisis", crisis_params
    )
    
    # Add some financial institutions
    orchestrator.contagion_engine.add_institution("Bank_A", 1e12, 12.0, 0.15)
    orchestrator.contagion_engine.add_institution("Bank_B", 8e11, 15.0, 0.12)
    orchestrator.contagion_engine.add_institution("Bank_C", 5e11, 18.0, 0.10)
    
    # Add risk profiles
    orchestrator.risk_analyzer.add_institution_risk_profile(
        "Bank_A", 1e12, 0.8, 12.0, 0.4, 0.15
    )
    orchestrator.risk_analyzer.add_institution_risk_profile(
        "Bank_B", 8e11, 0.7, 15.0, 0.5, 0.20
    )
    orchestrator.risk_analyzer.add_institution_risk_profile(
        "Bank_C", 5e11, 0.6, 18.0, 0.6, 0.25
    )
    
    # Initialize housing bubble
    bubble_id = orchestrator.bubble_engine.initialize_bubble(
        "housing_market", CrisisType.HOUSING_BUBBLE, 250000  # Average home price
    )
    
    orchestrator.active_crises[scenario_id]['bubbles'].append(bubble_id)
    
    print("Crisis Generation System Initialized Successfully!")
    print(f"Created scenario: {scenario_id}")
    print(f"Housing bubble: {bubble_id}")
    
    # Run short simulation
    results = orchestrator.run_crisis_simulation(scenario_id, time_steps=20)
    
    print(f"\nSimulation completed with {len(results['bubble_evolution'])} bubble states")
    print(f"Final systemic risk: {results['final_state']['final_systemic_risk']['overall_risk']:.3f}")
    print(f"Resolution status: {results['final_state']['resolution_status']}")
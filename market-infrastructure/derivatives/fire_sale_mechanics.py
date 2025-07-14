"""
Fire Sale Mechanics System
Phase 3 Market Complexity - Asset Price Spirals and Liquidity Crises

This module implements fire sale mechanics with asset price spirals, liquidity 
evaporation, and forced deleveraging dynamics.
"""

import numpy as np
import pandas as pd
from typing import Dict, List, Tuple, Optional, Any, Set
from dataclasses import dataclass, field
from enum import Enum
import random
from datetime import datetime, timedelta
import logging
from collections import defaultdict, deque


class AssetClass(Enum):
    """Asset classes for fire sale modeling"""
    EQUITIES = "equities"
    CORPORATE_BONDS = "corporate_bonds"
    GOVERNMENT_BONDS = "government_bonds"
    REAL_ESTATE = "real_estate"
    COMMODITIES = "commodities"
    DERIVATIVES = "derivatives"
    STRUCTURED_PRODUCTS = "structured_products"
    FOREIGN_EXCHANGE = "foreign_exchange"
    CRYPTOCURRENCY = "cryptocurrency"
    PRIVATE_EQUITY = "private_equity"


class LiquidityTier(Enum):
    """Liquidity tiers for different assets"""
    TIER_1 = "tier_1"  # Most liquid (US Treasuries, major currencies)
    TIER_2 = "tier_2"  # Liquid (large cap stocks, IG corporate bonds)
    TIER_3 = "tier_3"  # Semi-liquid (small cap stocks, HY bonds)
    TIER_4 = "tier_4"  # Illiquid (real estate, private equity)
    TIER_5 = "tier_5"  # Highly illiquid (distressed assets, exotic derivatives)


class SaleReason(Enum):
    """Reasons for forced asset sales"""
    MARGIN_CALL = "margin_call"
    REDEMPTION_PRESSURE = "redemption_pressure"
    REGULATORY_REQUIREMENT = "regulatory_requirement"
    LIQUIDITY_STRESS = "liquidity_stress"
    RISK_MANAGEMENT = "risk_management"
    COVENANT_BREACH = "covenant_breach"
    BANKRUPTCY = "bankruptcy"


@dataclass
class FireSaleOrder:
    """Individual fire sale order"""
    seller_id: str
    asset_class: AssetClass
    asset_id: str
    quantity: float
    urgency: float  # 0.0 (can wait) to 1.0 (immediate)
    reason: SaleReason
    minimum_price: float
    time_limit: int  # hours
    created_at: datetime
    filled_quantity: float = 0.0
    average_price: float = 0.0
    status: str = "PENDING"


@dataclass
class MarketImpact:
    """Market impact from fire sales"""
    asset_id: str
    price_change: float
    volume_shock: float
    liquidity_impact: float
    volatility_increase: float
    bid_ask_widening: float
    depth_reduction: float


@dataclass
class LiquidityState:
    """Current liquidity state of an asset"""
    asset_id: str
    normal_daily_volume: float
    current_bid_ask_spread: float
    market_depth: float
    liquidity_tier: LiquidityTier
    stress_multiplier: float = 1.0
    fire_sale_volume: float = 0.0


class FireSaleEngine:
    """Core engine for fire sale mechanics and price spiral modeling"""
    
    def __init__(self):
        self.active_orders: List[FireSaleOrder] = []
        self.completed_orders: List[FireSaleOrder] = []
        self.asset_prices: Dict[str, float] = {}
        self.liquidity_states: Dict[str, LiquidityState] = {}
        self.market_impacts: List[MarketImpact] = []
        self.forced_sellers: Dict[str, Dict] = {}
        self.liquidity_providers: Dict[str, Dict] = {}
        self.price_history: Dict[str, deque] = defaultdict(lambda: deque(maxlen=100))
        
        # Market microstructure parameters
        self.impact_decay_rate = 0.1  # How quickly market impact fades
        self.liquidity_recovery_rate = 0.05  # How quickly liquidity recovers
        self.contagion_threshold = 0.15  # Price drop threshold for contagion
        
    def initialize_asset(self, asset_id: str, asset_class: AssetClass,
                        initial_price: float, daily_volume: float,
                        liquidity_tier: LiquidityTier):
        """Initialize an asset for fire sale modeling"""
        self.asset_prices[asset_id] = initial_price
        
        # Set liquidity parameters based on tier
        liquidity_params = self._get_liquidity_parameters(liquidity_tier)
        
        self.liquidity_states[asset_id] = LiquidityState(
            asset_id=asset_id,
            normal_daily_volume=daily_volume,
            current_bid_ask_spread=liquidity_params['bid_ask_spread'],
            market_depth=liquidity_params['market_depth'],
            liquidity_tier=liquidity_tier
        )
        
        # Initialize price history
        self.price_history[asset_id].append(initial_price)
        
        logging.info(f"Initialized asset {asset_id} with price ${initial_price}")
        
    def _get_liquidity_parameters(self, tier: LiquidityTier) -> Dict:
        """Get liquidity parameters based on tier"""
        params = {
            LiquidityTier.TIER_1: {
                'bid_ask_spread': 0.0005,  # 5 bps
                'market_depth': 1.0,
                'impact_coefficient': 0.1
            },
            LiquidityTier.TIER_2: {
                'bid_ask_spread': 0.002,   # 20 bps
                'market_depth': 0.7,
                'impact_coefficient': 0.3
            },
            LiquidityTier.TIER_3: {
                'bid_ask_spread': 0.01,    # 100 bps
                'market_depth': 0.4,
                'impact_coefficient': 0.6
            },
            LiquidityTier.TIER_4: {
                'bid_ask_spread': 0.05,    # 500 bps
                'market_depth': 0.2,
                'impact_coefficient': 1.0
            },
            LiquidityTier.TIER_5: {
                'bid_ask_spread': 0.15,    # 1500 bps
                'market_depth': 0.1,
                'impact_coefficient': 2.0
            }
        }
        
        return params.get(tier, params[LiquidityTier.TIER_3])
        
    def register_forced_seller(self, seller_id: str, portfolio: Dict[str, float],
                             leverage_ratio: float = 1.0, stress_threshold: float = 0.1):
        """Register an entity that may be forced to sell"""
        self.forced_sellers[seller_id] = {
            'portfolio': portfolio.copy(),
            'leverage_ratio': leverage_ratio,
            'stress_threshold': stress_threshold,
            'current_stress': 0.0,
            'margin_requirement': 0.0,
            'liquidity_need': 0.0,
            'fire_sale_history': []
        }
        
        logging.info(f"Registered forced seller: {seller_id}")
        
    def register_liquidity_provider(self, provider_id: str, capacity: float,
                                  risk_tolerance: float = 0.5):
        """Register a liquidity provider (market maker, etc.)"""
        self.liquidity_providers[provider_id] = {
            'capacity': capacity,
            'available_capacity': capacity,
            'risk_tolerance': risk_tolerance,
            'current_positions': {},
            'pnl': 0.0
        }
        
        logging.info(f"Registered liquidity provider: {provider_id}")
        
    def submit_fire_sale_order(self, seller_id: str, asset_id: str, 
                             quantity: float, urgency: float,
                             reason: SaleReason, time_limit: int = 24) -> str:
        """Submit a fire sale order"""
        if asset_id not in self.asset_prices:
            raise ValueError(f"Asset {asset_id} not initialized")
            
        current_price = self.asset_prices[asset_id]
        
        # Determine asset class from asset_id (simplified)
        asset_class = self._determine_asset_class(asset_id)
        
        # Set minimum acceptable price based on urgency
        price_discount = urgency * 0.3  # Up to 30% discount for urgent sales
        minimum_price = current_price * (1 - price_discount)
        
        order = FireSaleOrder(
            seller_id=seller_id,
            asset_class=asset_class,
            asset_id=asset_id,
            quantity=quantity,
            urgency=urgency,
            reason=reason,
            minimum_price=minimum_price,
            time_limit=time_limit,
            created_at=datetime.now()
        )
        
        self.active_orders.append(order)
        order_id = f"FS_{len(self.active_orders)}_{datetime.now().strftime('%H%M%S')}"
        
        logging.warning(f"Fire sale order submitted: {order_id} for {quantity} of {asset_id}")
        return order_id
        
    def _determine_asset_class(self, asset_id: str) -> AssetClass:
        """Determine asset class from asset ID"""
        if "EQUITY" in asset_id.upper():
            return AssetClass.EQUITIES
        elif "BOND" in asset_id.upper():
            return AssetClass.CORPORATE_BONDS
        elif "TREASURY" in asset_id.upper():
            return AssetClass.GOVERNMENT_BONDS
        elif "REAL_ESTATE" in asset_id.upper():
            return AssetClass.REAL_ESTATE
        elif "CRYPTO" in asset_id.upper():
            return AssetClass.CRYPTOCURRENCY
        else:
            return AssetClass.EQUITIES  # Default
            
    def execute_fire_sales(self, time_step: int) -> List[Dict]:
        """Execute fire sales for current time step"""
        execution_results = []
        
        # Sort orders by urgency (most urgent first)
        sorted_orders = sorted(self.active_orders, key=lambda x: x.urgency, reverse=True)
        
        for order in sorted_orders[:]:  # Create copy to allow removal during iteration
            if order.status != "PENDING":
                continue
                
            # Calculate market impact
            impact = self._calculate_market_impact(order)
            
            # Find liquidity
            liquidity_available = self._find_available_liquidity(order, impact)
            
            # Execute order (full or partial)
            execution_result = self._execute_order(order, liquidity_available, impact)
            execution_results.append(execution_result)
            
            # Update market state
            self._update_market_state(order, impact, execution_result)
            
            # Check for price spiral triggers
            self._check_price_spiral_triggers(order.asset_id, impact)
            
            # Remove completed orders
            if order.status in ["FILLED", "CANCELLED"]:
                self.active_orders.remove(order)
                self.completed_orders.append(order)
                
        return execution_results
        
    def _calculate_market_impact(self, order: FireSaleOrder) -> MarketImpact:
        """Calculate market impact of fire sale order"""
        asset_id = order.asset_id
        liquidity_state = self.liquidity_states[asset_id]
        
        # Volume as fraction of normal daily volume
        volume_ratio = order.quantity / liquidity_state.normal_daily_volume
        
        # Get impact coefficient based on liquidity tier
        tier_params = self._get_liquidity_parameters(liquidity_state.liquidity_tier)
        impact_coeff = tier_params['impact_coefficient']
        
        # Market impact calculation (square root law with modifications)
        base_impact = impact_coeff * np.sqrt(volume_ratio)
        
        # Urgency amplification
        urgency_multiplier = 1 + (order.urgency * 0.5)
        
        # Stress amplification
        stress_multiplier = liquidity_state.stress_multiplier
        
        # Total price impact
        price_impact = base_impact * urgency_multiplier * stress_multiplier
        
        # Bid-ask spread widening
        spread_widening = price_impact * 0.3
        
        # Market depth reduction
        depth_reduction = min(0.8, volume_ratio * 2)  # Max 80% depth reduction
        
        # Volatility increase
        volatility_increase = price_impact * 1.5
        
        return MarketImpact(
            asset_id=asset_id,
            price_change=-price_impact,  # Negative for sales
            volume_shock=volume_ratio,
            liquidity_impact=depth_reduction,
            volatility_increase=volatility_increase,
            bid_ask_widening=spread_widening,
            depth_reduction=depth_reduction
        )
        
    def _find_available_liquidity(self, order: FireSaleOrder, impact: MarketImpact) -> float:
        """Find available liquidity for fire sale order"""
        asset_id = order.asset_id
        liquidity_state = self.liquidity_states[asset_id]
        
        # Base liquidity from market depth
        base_liquidity = liquidity_state.market_depth * liquidity_state.normal_daily_volume * 0.1
        
        # Reduce liquidity based on stress
        stressed_liquidity = base_liquidity * (1 - liquidity_state.stress_multiplier + 1)
        
        # Liquidity provider contribution
        provider_liquidity = 0.0
        post_impact_price = self.asset_prices[asset_id] * (1 + impact.price_change)
        
        for provider_id, provider in self.liquidity_providers.items():
            if provider['available_capacity'] > 0:
                # Risk tolerance check
                if abs(impact.price_change) <= provider['risk_tolerance']:
                    provider_contribution = min(
                        provider['available_capacity'],
                        order.quantity * 0.3  # Max 30% from single provider
                    )
                    provider_liquidity += provider_contribution
                    
        total_liquidity = stressed_liquidity + provider_liquidity
        
        return min(total_liquidity, order.quantity)
        
    def _execute_order(self, order: FireSaleOrder, liquidity_available: float,
                      impact: MarketImpact) -> Dict:
        """Execute fire sale order"""
        current_price = self.asset_prices[order.asset_id]
        execution_price = current_price * (1 + impact.price_change)
        
        # Check minimum price constraint
        if execution_price < order.minimum_price:
            execution_price = order.minimum_price
            # Reduce executable quantity if price floor hit
            liquidity_available *= 0.5
            
        # Determine fill quantity
        fill_quantity = min(liquidity_available, order.quantity - order.filled_quantity)
        
        if fill_quantity > 0:
            # Update order
            order.filled_quantity += fill_quantity
            weighted_avg_price = (
                (order.average_price * (order.filled_quantity - fill_quantity) +
                 execution_price * fill_quantity) / order.filled_quantity
            )
            order.average_price = weighted_avg_price
            
            # Check if order is complete
            if order.filled_quantity >= order.quantity * 0.95:  # 95% fill threshold
                order.status = "FILLED"
            elif (datetime.now() - order.created_at).total_seconds() > order.time_limit * 3600:
                order.status = "CANCELLED"  # Time limit exceeded
                
        execution_result = {
            'order_id': f"FS_{order.seller_id}_{order.asset_id}",
            'asset_id': order.asset_id,
            'fill_quantity': fill_quantity,
            'execution_price': execution_price,
            'market_impact': impact,
            'timestamp': datetime.now(),
            'liquidity_consumed': liquidity_available
        }
        
        return execution_result
        
    def _update_market_state(self, order: FireSaleOrder, impact: MarketImpact,
                           execution_result: Dict):
        """Update market state after fire sale execution"""
        asset_id = order.asset_id
        
        # Update asset price
        self.asset_prices[asset_id] *= (1 + impact.price_change)
        self.price_history[asset_id].append(self.asset_prices[asset_id])
        
        # Update liquidity state
        liquidity_state = self.liquidity_states[asset_id]
        
        # Increase bid-ask spread
        liquidity_state.current_bid_ask_spread *= (1 + impact.bid_ask_widening)
        
        # Reduce market depth
        liquidity_state.market_depth *= (1 - impact.depth_reduction)
        
        # Increase stress multiplier
        liquidity_state.stress_multiplier = min(3.0, 
            liquidity_state.stress_multiplier * (1 + impact.volatility_increase * 0.1))
        
        # Add to fire sale volume
        liquidity_state.fire_sale_volume += execution_result['fill_quantity']
        
        # Record market impact
        self.market_impacts.append(impact)
        
        # Update liquidity providers
        self._update_liquidity_providers(execution_result)
        
    def _update_liquidity_providers(self, execution_result: Dict):
        """Update liquidity provider positions and capacity"""
        fill_quantity = execution_result['fill_quantity']
        execution_price = execution_result['execution_price']
        
        if fill_quantity == 0:
            return
            
        # Distribute among liquidity providers proportionally
        total_provider_capacity = sum(p['available_capacity'] for p in self.liquidity_providers.values())
        
        if total_provider_capacity == 0:
            return
            
        for provider_id, provider in self.liquidity_providers.items():
            if provider['available_capacity'] > 0:
                # Calculate provider's share
                provider_share = provider['available_capacity'] / total_provider_capacity
                provider_fill = fill_quantity * provider_share * 0.5  # Conservative allocation
                
                if provider_fill > 0:
                    # Update position
                    asset_id = execution_result['asset_id']
                    if asset_id not in provider['current_positions']:
                        provider['current_positions'][asset_id] = {
                            'quantity': 0.0,
                            'average_price': 0.0
                        }
                        
                    position = provider['current_positions'][asset_id]
                    total_quantity = position['quantity'] + provider_fill
                    
                    if total_quantity > 0:
                        position['average_price'] = (
                            (position['average_price'] * position['quantity'] +
                             execution_price * provider_fill) / total_quantity
                        )
                        position['quantity'] = total_quantity
                        
                    # Reduce available capacity
                    cost = provider_fill * execution_price
                    provider['available_capacity'] -= cost
                    
    def _check_price_spiral_triggers(self, asset_id: str, impact: MarketImpact):
        """Check for price spiral triggers and initiate cascading effects"""
        price_drop = abs(impact.price_change)
        
        if price_drop > self.contagion_threshold:
            # Trigger additional forced selling
            self._trigger_contagion_sales(asset_id, price_drop)
            
    def _trigger_contagion_sales(self, trigger_asset: str, price_drop: float):
        """Trigger contagion sales from price drops"""
        contagion_results = []
        
        for seller_id, seller in self.forced_sellers.items():
            # Check if seller has exposure to trigger asset
            if trigger_asset in seller['portfolio']:
                exposure = seller['portfolio'][trigger_asset]
                
                # Calculate loss impact
                loss_impact = exposure * price_drop
                
                # Update seller stress
                portfolio_value = sum(
                    quantity * self.asset_prices.get(asset, 0)
                    for asset, quantity in seller['portfolio'].items()
                )
                
                if portfolio_value > 0:
                    stress_increase = loss_impact / portfolio_value
                    seller['current_stress'] += stress_increase
                    
                    # Check if stress exceeds threshold
                    if seller['current_stress'] > seller['stress_threshold']:
                        # Trigger forced selling
                        forced_sales = self._generate_forced_sales(seller_id, seller)
                        contagion_results.extend(forced_sales)
                        
        return contagion_results
        
    def _generate_forced_sales(self, seller_id: str, seller: Dict) -> List[str]:
        """Generate forced sales for distressed seller"""
        forced_sales = []
        
        # Calculate liquidity needed to reduce stress
        portfolio_value = sum(
            quantity * self.asset_prices.get(asset, 0)
            for asset, quantity in seller['portfolio'].items()
        )
        
        target_stress_reduction = seller['current_stress'] - seller['stress_threshold']
        liquidity_needed = portfolio_value * target_stress_reduction
        
        # Prioritize sales by liquidity (sell most liquid first)
        asset_liquidity = {}
        for asset in seller['portfolio']:
            if asset in self.liquidity_states:
                tier_score = {
                    LiquidityTier.TIER_1: 5,
                    LiquidityTier.TIER_2: 4,
                    LiquidityTier.TIER_3: 3,
                    LiquidityTier.TIER_4: 2,
                    LiquidityTier.TIER_5: 1
                }
                asset_liquidity[asset] = tier_score[self.liquidity_states[asset].liquidity_tier]
                
        # Sort by liquidity (most liquid first)
        sorted_assets = sorted(asset_liquidity.keys(), 
                              key=lambda x: asset_liquidity[x], reverse=True)
        
        remaining_liquidity_need = liquidity_needed
        
        for asset in sorted_assets:
            if remaining_liquidity_need <= 0:
                break
                
            quantity_held = seller['portfolio'][asset]
            asset_price = self.asset_prices.get(asset, 0)
            
            if quantity_held > 0 and asset_price > 0:
                # Sell proportion needed
                max_sale_value = quantity_held * asset_price
                sale_value = min(max_sale_value, remaining_liquidity_need * 1.2)  # 20% buffer
                sale_quantity = sale_value / asset_price
                
                # Submit fire sale order
                order_id = self.submit_fire_sale_order(
                    seller_id=seller_id,
                    asset_id=asset,
                    quantity=sale_quantity,
                    urgency=min(1.0, seller['current_stress']),
                    reason=SaleReason.LIQUIDITY_STRESS
                )
                
                forced_sales.append(order_id)
                remaining_liquidity_need -= sale_value
                
                # Update portfolio
                seller['portfolio'][asset] -= sale_quantity
                
        return forced_sales
        
    def simulate_time_step(self) -> Dict:
        """Simulate one time step of fire sale dynamics"""
        step_results = {
            'timestamp': datetime.now(),
            'executions': [],
            'market_impacts': [],
            'liquidity_recovery': {},
            'new_stress_events': 0
        }
        
        # Execute pending fire sales
        executions = self.execute_fire_sales(1)
        step_results['executions'] = executions
        
        # Apply liquidity recovery
        recovery_results = self._apply_liquidity_recovery()
        step_results['liquidity_recovery'] = recovery_results
        
        # Check for new stress events
        stress_events = self._monitor_stress_buildup()
        step_results['new_stress_events'] = len(stress_events)
        
        # Record current market impacts
        step_results['market_impacts'] = self.market_impacts[-10:]  # Last 10 impacts
        
        return step_results
        
    def _apply_liquidity_recovery(self) -> Dict:
        """Apply liquidity recovery over time"""
        recovery_results = {}
        
        for asset_id, liquidity_state in self.liquidity_states.items():
            # Gradual recovery of market depth
            if liquidity_state.market_depth < 1.0:
                recovery_rate = self.liquidity_recovery_rate
                liquidity_state.market_depth = min(1.0, 
                    liquidity_state.market_depth * (1 + recovery_rate))
                    
            # Gradual reduction of bid-ask spread
            tier_params = self._get_liquidity_parameters(liquidity_state.liquidity_tier)
            normal_spread = tier_params['bid_ask_spread']
            
            if liquidity_state.current_bid_ask_spread > normal_spread:
                spread_recovery = self.liquidity_recovery_rate * 2
                liquidity_state.current_bid_ask_spread = max(normal_spread,
                    liquidity_state.current_bid_ask_spread * (1 - spread_recovery))
                    
            # Gradual reduction of stress multiplier
            if liquidity_state.stress_multiplier > 1.0:
                stress_recovery = self.liquidity_recovery_rate
                liquidity_state.stress_multiplier = max(1.0,
                    liquidity_state.stress_multiplier * (1 - stress_recovery))
                    
            # Reset fire sale volume gradually
            liquidity_state.fire_sale_volume *= 0.9
            
            recovery_results[asset_id] = {
                'market_depth': liquidity_state.market_depth,
                'bid_ask_spread': liquidity_state.current_bid_ask_spread,
                'stress_multiplier': liquidity_state.stress_multiplier
            }
            
        return recovery_results
        
    def _monitor_stress_buildup(self) -> List[str]:
        """Monitor for stress buildup in forced sellers"""
        stress_events = []
        
        for seller_id, seller in self.forced_sellers.items():
            # Calculate current portfolio value and stress
            portfolio_value = sum(
                quantity * self.asset_prices.get(asset, 0)
                for asset, quantity in seller['portfolio'].items()
            )
            
            # Check margin requirements if leveraged
            if seller['leverage_ratio'] > 1.0:
                equity_value = portfolio_value / seller['leverage_ratio']
                maintenance_margin = portfolio_value * 0.25  # 25% maintenance margin
                
                if equity_value < maintenance_margin:
                    # Margin call triggered
                    margin_call_amount = maintenance_margin - equity_value
                    seller['liquidity_need'] = margin_call_amount
                    stress_events.append(f"MARGIN_CALL_{seller_id}")
                    
            # Check for covenant breaches or other stress indicators
            if seller['current_stress'] > seller['stress_threshold'] * 1.5:
                stress_events.append(f"STRESS_BREACH_{seller_id}")
                
        return stress_events
        
    def get_fire_sale_statistics(self) -> Dict:
        """Get comprehensive fire sale statistics"""
        if not self.completed_orders:
            return {'message': 'No completed fire sale orders'}
            
        # Order statistics
        total_orders = len(self.completed_orders)
        filled_orders = sum(1 for order in self.completed_orders if order.status == "FILLED")
        
        # Volume statistics
        total_volume = sum(order.filled_quantity for order in self.completed_orders)
        total_value = sum(order.filled_quantity * order.average_price 
                         for order in self.completed_orders if order.average_price > 0)
        
        # Price impact statistics
        price_impacts = [impact.price_change for impact in self.market_impacts]
        avg_price_impact = np.mean(price_impacts) if price_impacts else 0.0
        max_price_impact = min(price_impacts) if price_impacts else 0.0  # Most negative
        
        # Asset-level statistics
        asset_stats = {}
        for asset_id in self.asset_prices:
            if len(self.price_history[asset_id]) > 1:
                prices = list(self.price_history[asset_id])
                total_return = (prices[-1] / prices[0]) - 1
                volatility = np.std(np.diff(np.log(prices))) if len(prices) > 2 else 0.0
                
                asset_stats[asset_id] = {
                    'total_return': total_return,
                    'volatility': volatility,
                    'current_price': prices[-1],
                    'initial_price': prices[0]
                }
                
        return {
            'order_statistics': {
                'total_orders': total_orders,
                'filled_orders': filled_orders,
                'fill_rate': filled_orders / total_orders if total_orders > 0 else 0.0
            },
            'volume_statistics': {
                'total_volume': total_volume,
                'total_value': total_value,
                'average_order_size': total_volume / total_orders if total_orders > 0 else 0.0
            },
            'impact_statistics': {
                'average_price_impact': avg_price_impact,
                'maximum_price_impact': max_price_impact,
                'total_impacts_recorded': len(self.market_impacts)
            },
            'asset_statistics': asset_stats,
            'system_stress': {
                'active_orders': len(self.active_orders),
                'stressed_sellers': sum(1 for seller in self.forced_sellers.values()
                                      if seller['current_stress'] > seller['stress_threshold'])
            }
        }


# Example usage and testing
if __name__ == "__main__":
    # Initialize fire sale engine
    fire_sale_engine = FireSaleEngine()
    
    # Initialize assets
    fire_sale_engine.initialize_asset(
        "EQUITY_LARGE_CAP", AssetClass.EQUITIES, 100.0, 1e6, LiquidityTier.TIER_2
    )
    
    fire_sale_engine.initialize_asset(
        "CORPORATE_BOND_IG", AssetClass.CORPORATE_BONDS, 98.5, 5e5, LiquidityTier.TIER_3
    )
    
    fire_sale_engine.initialize_asset(
        "REAL_ESTATE_REIT", AssetClass.REAL_ESTATE, 50.0, 1e5, LiquidityTier.TIER_4
    )
    
    # Register forced sellers
    fire_sale_engine.register_forced_seller(
        "HEDGE_FUND_A", 
        {"EQUITY_LARGE_CAP": 10000, "CORPORATE_BOND_IG": 5000},
        leverage_ratio=5.0,
        stress_threshold=0.15
    )
    
    fire_sale_engine.register_forced_seller(
        "PENSION_FUND_B",
        {"CORPORATE_BOND_IG": 20000, "REAL_ESTATE_REIT": 8000},
        leverage_ratio=1.2,
        stress_threshold=0.05
    )
    
    # Register liquidity providers
    fire_sale_engine.register_liquidity_provider("MARKET_MAKER_1", 10e6, 0.3)
    fire_sale_engine.register_liquidity_provider("MARKET_MAKER_2", 5e6, 0.5)
    
    print("Fire Sale Engine initialized with assets and participants")
    
    # Simulate initial fire sale
    order_id = fire_sale_engine.submit_fire_sale_order(
        "HEDGE_FUND_A", "EQUITY_LARGE_CAP", 2000, 0.8, SaleReason.MARGIN_CALL
    )
    
    print(f"Submitted fire sale order: {order_id}")
    
    # Run simulation steps
    for step in range(5):
        step_results = fire_sale_engine.simulate_time_step()
        print(f"Step {step}: {len(step_results['executions'])} executions, "
              f"{step_results['new_stress_events']} stress events")
              
    # Get final statistics
    stats = fire_sale_engine.get_fire_sale_statistics()
    print(f"\nFinal Statistics:")
    print(f"Fill rate: {stats['order_statistics']['fill_rate']:.2%}")
    print(f"Average price impact: {stats['impact_statistics']['average_price_impact']:.3f}")
    
    print("\nFire Sale Mechanics implementation completed successfully!")
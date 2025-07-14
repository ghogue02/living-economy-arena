"""
Optimal Liquidity Provision Systems with Dynamic Spread Pricing
Phase 3 Market Microstructure Optimization
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Dict, List, Tuple, Optional, Callable
from enum import Enum
import asyncio
from datetime import datetime, timedelta
import scipy.optimize as optimize

class LiquidityTier(Enum):
    TIER_1 = "tier_1"  # Best bid/ask
    TIER_2 = "tier_2"  # Near market
    TIER_3 = "tier_3"  # Away from market
    ICEBERG = "iceberg"  # Hidden liquidity

class VenueCharacteristics(Enum):
    MAKER_TAKER = "maker_taker"
    TAKER_MAKER = "taker_maker"
    FLAT_FEE = "flat_fee"
    INVERTED = "inverted"

@dataclass
class LiquidityLayer:
    price: float
    size: float
    tier: LiquidityTier
    venue: str
    expected_fill_rate: float
    expected_pnl: float

@dataclass
class MarketMetrics:
    bid_ask_spread: float
    order_book_depth: float
    trade_frequency: float
    volatility: float
    tick_size: float
    liquidity_score: float

@dataclass
class VenueConfig:
    venue_id: str
    characteristics: VenueCharacteristics
    maker_rebate_bps: float
    taker_fee_bps: float
    tick_size: float
    min_order_size: float
    max_order_size: float

class DynamicLiquidityProvider:
    """Advanced liquidity provision with multi-venue optimization"""
    
    def __init__(self, symbol: str, venues: List[VenueConfig]):
        self.symbol = symbol
        self.venues = {venue.venue_id: venue for venue in venues}
        self.liquidity_layers: Dict[str, List[LiquidityLayer]] = {}
        self.market_metrics_history: List[MarketMetrics] = []
        self.liquidity_optimizer = LiquidityOptimizer()
        self.spread_pricer = DynamicSpreadPricer()
        self.rebate_harvester = RebateHarvester(venues)
        
    async def optimize_liquidity_provision(self, market_data: Dict) -> Dict[str, List[LiquidityLayer]]:
        """Optimize liquidity provision across all venues and tiers"""
        
        # Update market metrics
        metrics = await self._calculate_market_metrics(market_data)
        self.market_metrics_history.append(metrics)
        
        # Calculate optimal spreads for each tier
        optimal_spreads = await self.spread_pricer.calculate_tiered_spreads(
            metrics, self.venues
        )
        
        # Optimize size allocation across venues and tiers
        venue_allocations = {}
        
        for venue_id, venue_config in self.venues.items():
            venue_layers = await self._optimize_venue_liquidity(
                venue_id, venue_config, optimal_spreads, metrics, market_data
            )
            venue_allocations[venue_id] = venue_layers
        
        # Apply cross-venue arbitrage considerations
        venue_allocations = await self._apply_cross_venue_optimization(
            venue_allocations, market_data
        )
        
        self.liquidity_layers = venue_allocations
        return venue_allocations
    
    async def _calculate_market_metrics(self, market_data: Dict) -> MarketMetrics:
        """Calculate comprehensive market quality metrics"""
        
        order_book = market_data.get('order_book', {})
        trades = market_data.get('recent_trades', [])
        
        # Calculate bid-ask spread
        best_bid = order_book.get('best_bid', 0)
        best_ask = order_book.get('best_ask', 0)
        mid_price = (best_bid + best_ask) / 2
        bid_ask_spread = (best_ask - best_bid) / mid_price if mid_price > 0 else 0
        
        # Calculate order book depth
        bid_depth = sum(order_book.get('bids', {}).values())
        ask_depth = sum(order_book.get('asks', {}).values())
        order_book_depth = (bid_depth + ask_depth) / 2
        
        # Calculate trade frequency
        trade_frequency = len(trades) / 3600 if trades else 0  # trades per hour
        
        # Calculate volatility
        prices = [trade['price'] for trade in trades[-100:]]
        returns = [np.log(prices[i]/prices[i-1]) for i in range(1, len(prices))]
        volatility = np.std(returns) * np.sqrt(252 * 24) if len(returns) > 1 else 0.01
        
        # Get tick size
        tick_size = market_data.get('tick_size', 0.01)
        
        # Calculate liquidity score
        liquidity_score = self._calculate_liquidity_score(
            bid_ask_spread, order_book_depth, trade_frequency, volatility
        )
        
        return MarketMetrics(
            bid_ask_spread=bid_ask_spread,
            order_book_depth=order_book_depth,
            trade_frequency=trade_frequency,
            volatility=volatility,
            tick_size=tick_size,
            liquidity_score=liquidity_score
        )
    
    def _calculate_liquidity_score(self, spread: float, depth: float, 
                                 frequency: float, volatility: float) -> float:
        """Calculate overall market liquidity score"""
        
        # Normalize components
        spread_score = max(0, 1 - spread * 100)  # Lower spread = higher score
        depth_score = min(1, depth / 100000)     # Higher depth = higher score
        frequency_score = min(1, frequency / 1000)  # Higher frequency = higher score
        volatility_score = max(0, 1 - volatility * 10)  # Lower volatility = higher score
        
        # Weighted average
        return (spread_score * 0.3 + depth_score * 0.3 + 
                frequency_score * 0.2 + volatility_score * 0.2)
    
    async def _optimize_venue_liquidity(self, venue_id: str, venue_config: VenueConfig,
                                      optimal_spreads: Dict, metrics: MarketMetrics,
                                      market_data: Dict) -> List[LiquidityLayer]:
        """Optimize liquidity provision for a specific venue"""
        
        mid_price = market_data.get('mid_price', 100.0)
        venue_layers = []
        
        # Generate layers for each tier
        for tier in LiquidityTier:
            if tier == LiquidityTier.ICEBERG:
                continue  # Handle separately
                
            spread = optimal_spreads.get(tier, {}).get(venue_id, 0.001)
            
            # Calculate bid and ask prices
            bid_price = mid_price * (1 - spread / 2)
            ask_price = mid_price * (1 + spread / 2)
            
            # Optimize size for this tier and venue
            optimal_size = await self._optimize_tier_size(
                tier, venue_config, metrics, market_data
            )
            
            # Calculate expected fill rate and PnL
            fill_rate = await self._estimate_fill_rate(
                tier, spread, optimal_size, metrics
            )
            expected_pnl = await self._estimate_expected_pnl(
                tier, spread, optimal_size, venue_config, fill_rate
            )
            
            # Create bid and ask layers
            bid_layer = LiquidityLayer(
                price=bid_price,
                size=optimal_size,
                tier=tier,
                venue=venue_id,
                expected_fill_rate=fill_rate,
                expected_pnl=expected_pnl
            )
            
            ask_layer = LiquidityLayer(
                price=ask_price,
                size=optimal_size,
                tier=tier,
                venue=venue_id,
                expected_fill_rate=fill_rate,
                expected_pnl=expected_pnl
            )
            
            venue_layers.extend([bid_layer, ask_layer])
        
        # Add iceberg orders if beneficial
        iceberg_layers = await self._optimize_iceberg_orders(
            venue_config, metrics, market_data
        )
        venue_layers.extend(iceberg_layers)
        
        return venue_layers
    
    async def _optimize_tier_size(self, tier: LiquidityTier, venue_config: VenueConfig,
                                metrics: MarketMetrics, market_data: Dict) -> float:
        """Optimize order size for a specific tier"""
        
        # Base size calculation
        base_size = 1000  # shares
        
        # Adjust based on tier
        tier_multipliers = {
            LiquidityTier.TIER_1: 1.0,
            LiquidityTier.TIER_2: 1.5,
            LiquidityTier.TIER_3: 2.0
        }
        size_multiplier = tier_multipliers.get(tier, 1.0)
        
        # Adjust based on market liquidity
        liquidity_adjustment = 1 + metrics.liquidity_score
        
        # Adjust based on volatility (smaller sizes in volatile markets)
        volatility_adjustment = 1 / (1 + metrics.volatility * 10)
        
        # Apply venue constraints
        optimal_size = base_size * size_multiplier * liquidity_adjustment * volatility_adjustment
        optimal_size = max(venue_config.min_order_size, 
                          min(venue_config.max_order_size, optimal_size))
        
        return optimal_size
    
    async def _estimate_fill_rate(self, tier: LiquidityTier, spread: float,
                                size: float, metrics: MarketMetrics) -> float:
        """Estimate probability of order fill for given parameters"""
        
        # Base fill rates by tier
        base_fill_rates = {
            LiquidityTier.TIER_1: 0.8,
            LiquidityTier.TIER_2: 0.6,
            LiquidityTier.TIER_3: 0.4,
            LiquidityTier.ICEBERG: 0.7
        }
        
        base_rate = base_fill_rates.get(tier, 0.5)
        
        # Adjust for spread (tighter spreads = higher fill rate)
        spread_adjustment = 1 / (1 + spread * 100)
        
        # Adjust for market activity
        activity_adjustment = min(1.5, metrics.trade_frequency / 100)
        
        # Adjust for size (smaller orders fill more often)
        size_adjustment = 1000 / (1000 + size)
        
        fill_rate = base_rate * spread_adjustment * activity_adjustment * size_adjustment
        return min(1.0, fill_rate)
    
    async def _estimate_expected_pnl(self, tier: LiquidityTier, spread: float,
                                   size: float, venue_config: VenueConfig,
                                   fill_rate: float) -> float:
        """Estimate expected PnL for liquidity provision"""
        
        # Revenue from spread capture
        spread_revenue = spread * size * 100 * fill_rate  # Assuming $100 stock price
        
        # Revenue from rebates
        rebate_revenue = venue_config.maker_rebate_bps / 10000 * size * 100 * fill_rate
        
        # Cost from adverse selection (simplified)
        adverse_selection_cost = spread * 0.3 * size * 100 * fill_rate
        
        # Risk cost (inventory holding)
        risk_cost = 0.0001 * size * 100 * fill_rate  # 1bp risk cost
        
        expected_pnl = spread_revenue + rebate_revenue - adverse_selection_cost - risk_cost
        
        return expected_pnl
    
    async def _optimize_iceberg_orders(self, venue_config: VenueConfig,
                                     metrics: MarketMetrics, 
                                     market_data: Dict) -> List[LiquidityLayer]:
        """Optimize iceberg order strategy"""
        
        # Only use icebergs in liquid markets
        if metrics.liquidity_score < 0.7:
            return []
        
        mid_price = market_data.get('mid_price', 100.0)
        
        # Conservative iceberg strategy
        iceberg_spread = 0.002  # 20bps
        iceberg_size = 5000  # Large hidden size
        visible_size = 500   # Small visible portion
        
        bid_iceberg = LiquidityLayer(
            price=mid_price * (1 - iceberg_spread / 2),
            size=iceberg_size,
            tier=LiquidityTier.ICEBERG,
            venue=venue_config.venue_id,
            expected_fill_rate=0.3,
            expected_pnl=iceberg_spread * iceberg_size * 100 * 0.3
        )
        
        ask_iceberg = LiquidityLayer(
            price=mid_price * (1 + iceberg_spread / 2),
            size=iceberg_size,
            tier=LiquidityTier.ICEBERG,
            venue=venue_config.venue_id,
            expected_fill_rate=0.3,
            expected_pnl=iceberg_spread * iceberg_size * 100 * 0.3
        )
        
        return [bid_iceberg, ask_iceberg]
    
    async def _apply_cross_venue_optimization(self, venue_allocations: Dict,
                                            market_data: Dict) -> Dict:
        """Apply cross-venue optimization and arbitrage considerations"""
        
        # Identify arbitrage opportunities
        arbitrage_opportunities = await self._detect_arbitrage_opportunities(
            venue_allocations, market_data
        )
        
        # Adjust allocations to capture arbitrage
        if arbitrage_opportunities:
            venue_allocations = await self._adjust_for_arbitrage(
                venue_allocations, arbitrage_opportunities
            )
        
        # Balance inventory risk across venues
        venue_allocations = await self._balance_cross_venue_inventory(
            venue_allocations
        )
        
        return venue_allocations
    
    async def _detect_arbitrage_opportunities(self, venue_allocations: Dict,
                                            market_data: Dict) -> List[Dict]:
        """Detect cross-venue arbitrage opportunities"""
        
        opportunities = []
        
        # Compare prices across venues for same tier
        for tier in LiquidityTier:
            venue_prices = {}
            
            for venue_id, layers in venue_allocations.items():
                tier_layers = [l for l in layers if l.tier == tier]
                if tier_layers:
                    venue_prices[venue_id] = {
                        'bid': max(l.price for l in tier_layers if l.price < market_data.get('mid_price', 100)),
                        'ask': min(l.price for l in tier_layers if l.price > market_data.get('mid_price', 100))
                    }
            
            # Look for crossed markets
            for venue1 in venue_prices:
                for venue2 in venue_prices:
                    if venue1 != venue2:
                        if (venue_prices[venue1]['bid'] > venue_prices[venue2]['ask'] and
                            venue_prices[venue1]['bid'] > 0 and venue_prices[venue2]['ask'] > 0):
                            
                            opportunities.append({
                                'type': 'crossed_market',
                                'buy_venue': venue2,
                                'sell_venue': venue1,
                                'profit_per_share': venue_prices[venue1]['bid'] - venue_prices[venue2]['ask'],
                                'tier': tier
                            })
        
        return opportunities
    
    async def _adjust_for_arbitrage(self, venue_allocations: Dict,
                                  opportunities: List[Dict]) -> Dict:
        """Adjust liquidity provision to capture arbitrage"""
        
        # Implementation would adjust order placement to capture arbitrage
        # while maintaining market making obligations
        return venue_allocations
    
    async def _balance_cross_venue_inventory(self, venue_allocations: Dict) -> Dict:
        """Balance inventory risk across venues"""
        
        # Implementation would adjust order sizes to balance
        # inventory exposure across different venues
        return venue_allocations


class LiquidityOptimizer:
    """Portfolio optimization for liquidity provision"""
    
    def __init__(self):
        self.risk_aversion = 0.01
    
    async def optimize_allocation(self, expected_returns: np.ndarray,
                                covariance_matrix: np.ndarray,
                                constraints: Dict) -> np.ndarray:
        """Optimize allocation using modern portfolio theory"""
        
        n_assets = len(expected_returns)
        
        # Objective function (maximize utility = return - risk penalty)
        def objective(weights):
            portfolio_return = np.dot(weights, expected_returns)
            portfolio_variance = np.dot(weights, np.dot(covariance_matrix, weights))
            return -(portfolio_return - 0.5 * self.risk_aversion * portfolio_variance)
        
        # Constraints
        constraints_list = [
            {'type': 'eq', 'fun': lambda w: np.sum(w) - 1}  # Weights sum to 1
        ]
        
        # Bounds (no short selling by default)
        bounds = [(0, 1) for _ in range(n_assets)]
        
        # Initial guess
        x0 = np.ones(n_assets) / n_assets
        
        # Optimize
        result = optimize.minimize(
            objective, x0, method='SLSQP', 
            bounds=bounds, constraints=constraints_list
        )
        
        return result.x if result.success else x0


class DynamicSpreadPricer:
    """Dynamic spread pricing based on market microstructure"""
    
    def __init__(self):
        self.base_spreads = {
            LiquidityTier.TIER_1: 0.0005,  # 0.5bps
            LiquidityTier.TIER_2: 0.001,   # 1bps
            LiquidityTier.TIER_3: 0.002    # 2bps
        }
    
    async def calculate_tiered_spreads(self, metrics: MarketMetrics,
                                     venues: Dict[str, VenueConfig]) -> Dict:
        """Calculate optimal spreads for each tier and venue"""
        
        spreads = {}
        
        for tier in LiquidityTier:
            if tier == LiquidityTier.ICEBERG:
                continue
                
            base_spread = self.base_spreads.get(tier, 0.001)
            
            # Adjust for market conditions
            volatility_adjustment = 1 + metrics.volatility * 5
            liquidity_adjustment = 2 - metrics.liquidity_score
            
            adjusted_spread = base_spread * volatility_adjustment * liquidity_adjustment
            
            # Venue-specific adjustments
            tier_spreads = {}
            for venue_id, venue_config in venues.items():
                venue_adjustment = await self._calculate_venue_adjustment(
                    venue_config, metrics
                )
                
                tier_spreads[venue_id] = adjusted_spread * venue_adjustment
            
            spreads[tier] = tier_spreads
        
        return spreads
    
    async def _calculate_venue_adjustment(self, venue_config: VenueConfig,
                                        metrics: MarketMetrics) -> float:
        """Calculate venue-specific spread adjustment"""
        
        # Base adjustment by venue type
        venue_adjustments = {
            VenueCharacteristics.MAKER_TAKER: 1.0,
            VenueCharacteristics.TAKER_MAKER: 0.9,
            VenueCharacteristics.INVERTED: 0.8,
            VenueCharacteristics.FLAT_FEE: 1.1
        }
        
        base_adjustment = venue_adjustments.get(venue_config.characteristics, 1.0)
        
        # Adjust for rebate levels
        rebate_adjustment = 1 - venue_config.maker_rebate_bps / 100
        
        return base_adjustment * rebate_adjustment


class RebateHarvester:
    """Optimize for rebate harvesting while providing liquidity"""
    
    def __init__(self, venues: List[VenueConfig]):
        self.venues = {v.venue_id: v for v in venues}
        self.rebate_scores = {}
    
    async def calculate_rebate_scores(self, market_metrics: MarketMetrics) -> Dict[str, float]:
        """Calculate rebate attractiveness score for each venue"""
        
        scores = {}
        
        for venue_id, venue_config in self.venues.items():
            # Basic rebate value
            rebate_value = venue_config.maker_rebate_bps
            
            # Adjust for expected fill rate (higher fills = more rebates)
            fill_rate_factor = market_metrics.trade_frequency / 1000
            
            # Adjust for tick size (finer ticks allow better positioning)
            tick_factor = 0.01 / venue_config.tick_size
            
            score = rebate_value * fill_rate_factor * tick_factor
            scores[venue_id] = score
        
        self.rebate_scores = scores
        return scores
    
    async def optimize_rebate_capture(self, venue_allocations: Dict) -> Dict:
        """Optimize allocations for rebate capture"""
        
        # Prioritize venues with higher rebate scores
        for venue_id in sorted(self.rebate_scores.keys(), 
                              key=lambda x: self.rebate_scores[x], reverse=True):
            
            if venue_id in venue_allocations:
                # Increase allocation to high-rebate venues
                for layer in venue_allocations[venue_id]:
                    layer.size *= (1 + self.rebate_scores[venue_id] / 100)
        
        return venue_allocations


# Usage example
async def main():
    # Configure venues
    venues = [
        VenueConfig(
            venue_id="NYSE",
            characteristics=VenueCharacteristics.MAKER_TAKER,
            maker_rebate_bps=0.2,
            taker_fee_bps=0.3,
            tick_size=0.01,
            min_order_size=100,
            max_order_size=100000
        ),
        VenueConfig(
            venue_id="NASDAQ",
            characteristics=VenueCharacteristics.MAKER_TAKER,
            maker_rebate_bps=0.25,
            taker_fee_bps=0.3,
            tick_size=0.01,
            min_order_size=100,
            max_order_size=100000
        ),
        VenueConfig(
            venue_id="BATS",
            characteristics=VenueCharacteristics.INVERTED,
            maker_rebate_bps=0.35,
            taker_fee_bps=0.1,
            tick_size=0.01,
            min_order_size=100,
            max_order_size=100000
        )
    ]
    
    # Initialize liquidity provider
    lp = DynamicLiquidityProvider("AAPL", venues)
    
    # Market data
    market_data = {
        'mid_price': 150.0,
        'order_book': {
            'best_bid': 149.98,
            'best_ask': 150.02,
            'bids': {149.98: 1000, 149.97: 1500},
            'asks': {150.02: 1000, 150.03: 1500}
        },
        'recent_trades': [
            {'price': 150.0, 'size': 500, 'timestamp': datetime.now()},
            {'price': 150.01, 'size': 300, 'timestamp': datetime.now()}
        ],
        'tick_size': 0.01
    }
    
    # Optimize liquidity provision
    allocations = await lp.optimize_liquidity_provision(market_data)
    
    # Display results
    for venue_id, layers in allocations.items():
        print(f"\n{venue_id} Liquidity Layers:")
        for layer in layers:
            print(f"  {layer.tier.value}: ${layer.price:.2f} x {layer.size} "
                  f"(Fill Rate: {layer.expected_fill_rate:.1%}, "
                  f"Expected PnL: ${layer.expected_pnl:.2f})")

if __name__ == "__main__":
    asyncio.run(main())
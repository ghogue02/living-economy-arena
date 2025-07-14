"""
Advanced Market Making Algorithms with Inventory Management
Phase 3 Market Microstructure Optimization
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Dict, List, Tuple, Optional, Callable
from enum import Enum
import asyncio
from datetime import datetime, timedelta
import math

class MarketRegime(Enum):
    TRENDING = "trending"
    MEAN_REVERTING = "mean_reverting"
    VOLATILE = "volatile"
    QUIET = "quiet"

class OrderSide(Enum):
    BID = "bid"
    ASK = "ask"

@dataclass
class Quote:
    bid_price: float
    ask_price: float
    bid_size: float
    ask_size: float
    timestamp: datetime
    spread_bps: float

@dataclass
class Position:
    symbol: str
    quantity: float  # positive = long, negative = short
    average_price: float
    unrealized_pnl: float
    market_value: float

@dataclass
class InventoryConstraints:
    max_position: float
    max_daily_turnover: float
    risk_limit_var: float
    concentration_limit: float

class AdvancedMarketMaker:
    """Sophisticated market making with inventory management and dynamic pricing"""
    
    def __init__(self, symbol: str, constraints: InventoryConstraints):
        self.symbol = symbol
        self.constraints = constraints
        self.position = Position(symbol, 0.0, 0.0, 0.0, 0.0)
        self.quotes_history: List[Quote] = []
        self.trades_history = []
        self.inventory_target = 0.0
        self.risk_aversion = 0.01
        self.market_regime = MarketRegime.QUIET
        
        # Model parameters
        self.volatility_estimator = ExponentialVolatilityEstimator()
        self.spread_optimizer = DynamicSpreadOptimizer()
        self.inventory_manager = InventoryManager(constraints)
        self.adverse_selection_model = AdverseSelectionModel()
        
    async def generate_quotes(self, market_data: Dict) -> Quote:
        """Generate optimal bid/ask quotes based on current market conditions"""
        
        # Get current market state
        mid_price = market_data['mid_price']
        volatility = await self.volatility_estimator.estimate(market_data)
        order_flow_imbalance = market_data.get('order_flow_imbalance', 0.0)
        
        # Detect market regime
        self.market_regime = await self._detect_market_regime(market_data)
        
        # Calculate base spread
        base_spread = await self.spread_optimizer.calculate_optimal_spread(
            volatility, order_flow_imbalance, self.market_regime
        )
        
        # Apply inventory management adjustments
        inventory_adjustment = await self.inventory_manager.calculate_skew(
            self.position, mid_price, volatility
        )
        
        # Apply adverse selection protection
        adverse_selection_adjustment = await self.adverse_selection_model.calculate_protection(
            market_data, self.position
        )
        
        # Calculate final bid/ask prices
        spread_half = base_spread / 2
        skew = inventory_adjustment + adverse_selection_adjustment
        
        bid_price = mid_price - spread_half - skew
        ask_price = mid_price + spread_half - skew
        
        # Determine optimal quote sizes
        bid_size, ask_size = await self._calculate_quote_sizes(
            volatility, self.position, market_data
        )
        
        quote = Quote(
            bid_price=bid_price,
            ask_price=ask_price,
            bid_size=bid_size,
            ask_size=ask_size,
            timestamp=datetime.now(),
            spread_bps=(ask_price - bid_price) / mid_price * 10000
        )
        
        self.quotes_history.append(quote)
        return quote
    
    async def _detect_market_regime(self, market_data: Dict) -> MarketRegime:
        """Detect current market regime for strategy adaptation"""
        
        # Get recent price history
        prices = market_data.get('price_history', [])
        if len(prices) < 20:
            return MarketRegime.QUIET
        
        # Calculate regime indicators
        volatility = np.std(prices[-20:])
        trend_strength = abs(np.corrcoef(range(20), prices[-20:])[0, 1])
        volume_ratio = market_data.get('volume_ratio', 1.0)
        
        # Regime classification logic
        if volatility > np.percentile([np.std(prices[i:i+20]) for i in range(len(prices)-20)], 80):
            return MarketRegime.VOLATILE
        elif trend_strength > 0.7:
            return MarketRegime.TRENDING
        elif volume_ratio < 0.5:
            return MarketRegime.QUIET
        else:
            return MarketRegime.MEAN_REVERTING
    
    async def _calculate_quote_sizes(self, volatility: float, position: Position, 
                                   market_data: Dict) -> Tuple[float, float]:
        """Calculate optimal bid and ask sizes"""
        
        # Base size calculation
        base_size = self._get_base_quote_size(market_data)
        
        # Adjust for inventory position
        inventory_ratio = position.quantity / self.constraints.max_position
        
        # Reduce size on the side we're already leaning
        if inventory_ratio > 0:  # Long position - reduce ask size
            bid_size = base_size * (1 + abs(inventory_ratio) * 0.5)
            ask_size = base_size * (1 - abs(inventory_ratio) * 0.5)
        else:  # Short position - reduce bid size
            bid_size = base_size * (1 - abs(inventory_ratio) * 0.5)
            ask_size = base_size * (1 + abs(inventory_ratio) * 0.5)
        
        # Adjust for volatility
        volatility_adjustment = 1 / (1 + volatility * 10)
        bid_size *= volatility_adjustment
        ask_size *= volatility_adjustment
        
        # Apply minimum and maximum size constraints
        min_size = 100
        max_size = 10000
        
        bid_size = max(min_size, min(max_size, bid_size))
        ask_size = max(min_size, min(max_size, ask_size))
        
        return bid_size, ask_size
    
    def _get_base_quote_size(self, market_data: Dict) -> float:
        """Get base quote size based on market conditions"""
        average_trade_size = market_data.get('average_trade_size', 1000)
        liquidity_score = market_data.get('liquidity_score', 0.5)
        
        return average_trade_size * liquidity_score * 2
    
    async def handle_fill(self, side: OrderSide, quantity: float, price: float):
        """Handle order fill and update position"""
        
        # Update position
        if side == OrderSide.BID:  # We bought
            old_quantity = self.position.quantity
            old_value = old_quantity * self.position.average_price
            new_quantity = old_quantity + quantity
            new_value = old_value + quantity * price
            
            self.position.quantity = new_quantity
            if new_quantity != 0:
                self.position.average_price = new_value / new_quantity
        else:  # We sold
            self.position.quantity -= quantity
        
        # Record trade
        trade = {
            'timestamp': datetime.now(),
            'side': side,
            'quantity': quantity,
            'price': price,
            'position_after': self.position.quantity
        }
        self.trades_history.append(trade)
        
        # Check risk limits
        await self._check_risk_limits()
    
    async def _check_risk_limits(self):
        """Check and enforce risk limits"""
        
        # Position limit check
        if abs(self.position.quantity) > self.constraints.max_position:
            await self._reduce_position()
        
        # Daily turnover check
        daily_turnover = self._calculate_daily_turnover()
        if daily_turnover > self.constraints.max_daily_turnover:
            await self._reduce_quote_sizes()
        
        # VaR limit check
        current_var = self._calculate_var()
        if current_var > self.constraints.risk_limit_var:
            await self._reduce_risk_exposure()
    
    async def _reduce_position(self):
        """Reduce position when over limits"""
        excess = abs(self.position.quantity) - self.constraints.max_position
        # Implementation would place closing orders
        print(f"Position limit exceeded, need to reduce by {excess}")
    
    async def _reduce_quote_sizes(self):
        """Reduce quote sizes when turnover limits exceeded"""
        # Implementation would adjust quote sizing
        print("Daily turnover limit exceeded, reducing quote sizes")
    
    async def _reduce_risk_exposure(self):
        """Reduce risk exposure when VaR limits exceeded"""
        # Implementation would adjust spreads and sizes
        print("VaR limit exceeded, reducing risk exposure")
    
    def _calculate_daily_turnover(self) -> float:
        """Calculate today's turnover"""
        today = datetime.now().date()
        today_trades = [
            t for t in self.trades_history 
            if t['timestamp'].date() == today
        ]
        return sum(t['quantity'] * t['price'] for t in today_trades)
    
    def _calculate_var(self) -> float:
        """Calculate Value at Risk"""
        # Simplified VaR calculation
        position_value = abs(self.position.quantity * self.position.average_price)
        volatility = 0.02  # Placeholder - would use proper volatility estimate
        confidence_level = 0.95
        
        return position_value * volatility * 2.33  # 99% VaR approximation


class ExponentialVolatilityEstimator:
    """Exponential weighted volatility estimation"""
    
    def __init__(self, decay_factor: float = 0.94):
        self.decay_factor = decay_factor
        self.variance_estimate = None
    
    async def estimate(self, market_data: Dict) -> float:
        """Estimate current volatility"""
        returns = market_data.get('returns', [])
        if not returns:
            return 0.02  # Default volatility
        
        if self.variance_estimate is None:
            self.variance_estimate = np.var(returns[-20:]) if len(returns) >= 20 else 0.0004
        
        # Update with latest return
        if returns:
            latest_return = returns[-1]
            self.variance_estimate = (
                self.decay_factor * self.variance_estimate + 
                (1 - self.decay_factor) * latest_return ** 2
            )
        
        return math.sqrt(self.variance_estimate)


class DynamicSpreadOptimizer:
    """Dynamic spread optimization based on market conditions"""
    
    def __init__(self):
        self.base_spread_bps = 2.0
        self.regime_multipliers = {
            MarketRegime.QUIET: 0.8,
            MarketRegime.MEAN_REVERTING: 1.0,
            MarketRegime.TRENDING: 1.2,
            MarketRegime.VOLATILE: 1.5
        }
    
    async def calculate_optimal_spread(self, volatility: float, 
                                     order_flow_imbalance: float,
                                     regime: MarketRegime) -> float:
        """Calculate optimal bid-ask spread"""
        
        # Base spread in price units
        base_spread = self.base_spread_bps / 10000
        
        # Volatility adjustment
        volatility_adjustment = 1 + volatility * 20
        
        # Order flow imbalance adjustment
        imbalance_adjustment = 1 + abs(order_flow_imbalance) * 0.5
        
        # Market regime adjustment
        regime_adjustment = self.regime_multipliers[regime]
        
        optimal_spread = (base_spread * volatility_adjustment * 
                         imbalance_adjustment * regime_adjustment)
        
        return optimal_spread


class InventoryManager:
    """Advanced inventory management with dynamic targeting"""
    
    def __init__(self, constraints: InventoryConstraints):
        self.constraints = constraints
        self.target_inventory = 0.0
        self.inventory_half_life = 3600  # 1 hour in seconds
    
    async def calculate_skew(self, position: Position, mid_price: float,
                           volatility: float) -> float:
        """Calculate price skew based on inventory position"""
        
        # Current inventory as fraction of max position
        inventory_ratio = position.quantity / self.constraints.max_position
        
        # Risk-adjusted skew calculation
        inventory_risk = inventory_ratio * volatility
        
        # Exponential skew function for aggressive inventory management
        skew_intensity = 0.01  # 1bp per 1% inventory ratio
        price_skew = np.tanh(inventory_ratio * 5) * skew_intensity * mid_price
        
        return price_skew
    
    async def update_target_inventory(self, market_signal: float):
        """Update target inventory based on market signals"""
        # Market signal could be from prediction models, momentum indicators, etc.
        max_target = self.constraints.max_position * 0.3  # Max 30% of limit as target
        self.target_inventory = np.clip(market_signal, -max_target, max_target)


class AdverseSelectionModel:
    """Model for adverse selection protection"""
    
    def __init__(self):
        self.information_arrival_rate = 0.1
        self.informed_trader_probability = 0.2
    
    async def calculate_protection(self, market_data: Dict, 
                                 position: Position) -> float:
        """Calculate adverse selection protection adjustment"""
        
        # Order flow toxicity indicators
        order_imbalance = market_data.get('order_flow_imbalance', 0.0)
        volume_concentration = market_data.get('volume_concentration', 0.0)
        price_impact = market_data.get('recent_price_impact', 0.0)
        
        # Adverse selection score
        toxicity_score = (abs(order_imbalance) * 0.4 + 
                         volume_concentration * 0.3 + 
                         abs(price_impact) * 0.3)
        
        # Protection adjustment (wider spreads when toxicity is high)
        protection_bps = toxicity_score * 2.0  # Up to 2bps protection
        
        return protection_bps / 10000  # Convert to price units


# Usage example
async def main():
    constraints = InventoryConstraints(
        max_position=100000,
        max_daily_turnover=1000000,
        risk_limit_var=50000,
        concentration_limit=0.1
    )
    
    mm = AdvancedMarketMaker("AAPL", constraints)
    
    # Simulate market making
    market_data = {
        'mid_price': 150.0,
        'order_flow_imbalance': 0.1,
        'volume_ratio': 0.8,
        'price_history': [149.8, 149.9, 150.0, 150.1, 150.0],
        'returns': [0.001, 0.0005, -0.0002, 0.0003],
        'average_trade_size': 1000,
        'liquidity_score': 0.7
    }
    
    quote = await mm.generate_quotes(market_data)
    print(f"Generated quote: Bid {quote.bid_price:.2f}@{quote.bid_size}, "
          f"Ask {quote.ask_price:.2f}@{quote.ask_size}, "
          f"Spread: {quote.spread_bps:.1f}bps")

if __name__ == "__main__":
    asyncio.run(main())
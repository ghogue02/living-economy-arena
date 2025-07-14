#!/usr/bin/env python3
"""
Market Maker Liquidity Engine
Ensures deep liquidity across all trading pairs
"""

import asyncio
import time
import uuid
from typing import Dict, List, Optional, Tuple, Set
from dataclasses import dataclass, field
from decimal import Decimal, ROUND_HALF_UP
from enum import Enum
import numpy as np
from collections import defaultdict, deque
import logging
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

class LiquidityTier(Enum):
    TIER_1 = "tier_1"  # Major pairs, tightest spreads
    TIER_2 = "tier_2"  # Popular pairs, moderate spreads
    TIER_3 = "tier_3"  # Minor pairs, wider spreads
    EXOTIC = "exotic"   # Exotic pairs, widest spreads

class MarketRegime(Enum):
    NORMAL = "normal"
    VOLATILE = "volatile"
    TRENDING = "trending"
    CRISIS = "crisis"

@dataclass
class LiquidityParameter:
    """Configuration for market making on a specific pair"""
    symbol: str
    tier: LiquidityTier
    target_spread_bps: int
    max_spread_bps: int
    min_quantity: Decimal
    max_quantity: Decimal
    inventory_limit: Decimal
    refresh_frequency_ms: int
    skew_factor: float = 0.1
    
    # Dynamic parameters
    volatility_multiplier: float = 1.5
    volume_factor: float = 1.0
    risk_adjustment: float = 1.0

@dataclass
class LiquidityMetrics:
    """Real-time liquidity metrics"""
    symbol: str
    bid_depth: Decimal
    ask_depth: Decimal
    spread_bps: float
    effective_spread_bps: float
    price_impact_bps: float
    uptime_percentage: float
    quote_updates_per_second: float
    timestamp: float = field(default_factory=time.time)

class InventoryManager:
    """Manages inventory across all market making positions"""
    
    def __init__(self):
        self.positions: Dict[str, Decimal] = defaultdict(Decimal)
        self.target_positions: Dict[str, Decimal] = defaultdict(Decimal)
        self.position_limits: Dict[str, Decimal] = defaultdict(lambda: Decimal('1000'))
        self.rebalance_threshold: Dict[str, Decimal] = defaultdict(lambda: Decimal('100'))
        
    def update_position(self, symbol: str, quantity: Decimal, price: Decimal) -> None:
        """Update position after trade"""
        self.positions[symbol] += quantity
        
    def get_inventory_skew(self, symbol: str) -> float:
        """Calculate inventory skew factor for quote adjustment"""
        position = self.positions.get(symbol, Decimal('0'))
        limit = self.position_limits.get(symbol, Decimal('1000'))
        
        if limit > 0:
            return float(position / limit)
        return 0.0
    
    def needs_rebalancing(self, symbol: str) -> bool:
        """Check if position needs rebalancing"""
        position = abs(self.positions.get(symbol, Decimal('0')))
        threshold = self.rebalance_threshold.get(symbol, Decimal('100'))
        
        return position > threshold
    
    def get_rebalance_quantity(self, symbol: str) -> Decimal:
        """Calculate quantity needed for rebalancing"""
        current_position = self.positions.get(symbol, Decimal('0'))
        target_position = self.target_positions.get(symbol, Decimal('0'))
        
        return target_position - current_position

class VolatilityEstimator:
    """Real-time volatility estimation for dynamic spread adjustment"""
    
    def __init__(self, window_size: int = 100):
        self.window_size = window_size
        self.price_history: Dict[str, deque] = defaultdict(lambda: deque(maxlen=window_size))
        self.volatility_cache: Dict[str, float] = {}
        
    def update_price(self, symbol: str, price: Decimal) -> None:
        """Update price and recalculate volatility"""
        self.price_history[symbol].append(float(price))
        
        if len(self.price_history[symbol]) >= 20:  # Minimum data points
            self._calculate_volatility(symbol)
    
    def _calculate_volatility(self, symbol: str) -> None:
        """Calculate realized volatility using log returns"""
        prices = list(self.price_history[symbol])
        
        if len(prices) < 2:
            self.volatility_cache[symbol] = 0.02  # Default 2%
            return
        
        # Calculate log returns
        returns = []
        for i in range(1, len(prices)):
            if prices[i-1] > 0:
                returns.append(np.log(prices[i] / prices[i-1]))
        
        if returns:
            volatility = np.std(returns) * np.sqrt(86400)  # Annualized (assuming 1 day = 86400 price updates)
            self.volatility_cache[symbol] = max(0.001, volatility)  # Minimum 0.1%
        else:
            self.volatility_cache[symbol] = 0.02
    
    def get_volatility(self, symbol: str) -> float:
        """Get current volatility estimate"""
        return self.volatility_cache.get(symbol, 0.02)

class AdaptiveMarketMaker:
    """Adaptive market making strategy that adjusts to market conditions"""
    
    def __init__(self, 
                 symbol: str, 
                 parameters: LiquidityParameter,
                 inventory_manager: InventoryManager,
                 volatility_estimator: VolatilityEstimator):
        
        self.symbol = symbol
        self.parameters = parameters
        self.inventory_manager = inventory_manager
        self.volatility_estimator = volatility_estimator
        
        # State tracking
        self.current_regime = MarketRegime.NORMAL
        self.active_quotes: List[str] = []
        self.last_quote_time = 0
        self.quote_count = 0
        self.uptime_start = time.time()
        
        # Performance metrics
        self.trades_executed = 0
        self.gross_pnl = Decimal('0')
        self.fees_paid = Decimal('0')
        
    def classify_market_regime(self, market_data) -> MarketRegime:
        """Classify current market regime for parameter adaptation"""
        volatility = self.volatility_estimator.get_volatility(self.symbol)
        spread_bps = market_data.get('spread_bps', 10)
        volume_ratio = market_data.get('volume_ratio', 1.0)
        
        # Crisis: High volatility + wide spreads
        if volatility > 0.05 and spread_bps > 50:
            return MarketRegime.CRISIS
        
        # Volatile: High volatility but normal spreads
        elif volatility > 0.03:
            return MarketRegime.VOLATILE
        
        # Trending: Consistent price movement with high volume
        elif volume_ratio > 2.0 and volatility > 0.015:
            return MarketRegime.TRENDING
        
        # Normal: Low volatility, normal spreads
        else:
            return MarketRegime.NORMAL
    
    def adapt_parameters(self, regime: MarketRegime) -> LiquidityParameter:
        """Adapt market making parameters based on market regime"""
        adapted_params = self.parameters
        
        if regime == MarketRegime.CRISIS:
            # Widen spreads, reduce quantity
            adapted_params.target_spread_bps = int(self.parameters.target_spread_bps * 3)
            adapted_params.max_quantity = self.parameters.max_quantity / 2
            adapted_params.volatility_multiplier = 3.0
            
        elif regime == MarketRegime.VOLATILE:
            # Moderate spread widening
            adapted_params.target_spread_bps = int(self.parameters.target_spread_bps * 2)
            adapted_params.volatility_multiplier = 2.0
            
        elif regime == MarketRegime.TRENDING:
            # Faster refresh, adjust for trend
            adapted_params.refresh_frequency_ms = max(100, self.parameters.refresh_frequency_ms // 2)
            adapted_params.skew_factor = 0.2  # Higher skew sensitivity
            
        # Normal regime uses default parameters
        
        return adapted_params
    
    async def generate_quotes(self, market_data: Dict) -> List[Dict]:
        """Generate optimized bid/ask quotes"""
        
        # Update market regime
        self.current_regime = self.classify_market_regime(market_data)
        adapted_params = self.adapt_parameters(self.current_regime)
        
        # Get current market state
        mid_price = Decimal(str(market_data.get('mid_price', 50000)))
        volatility = self.volatility_estimator.get_volatility(self.symbol)
        inventory_skew = self.inventory_manager.get_inventory_skew(self.symbol)
        
        # Calculate target spread
        base_spread_bps = adapted_params.target_spread_bps
        volatility_adjustment = volatility * adapted_params.volatility_multiplier * 10000  # Convert to bps
        
        target_spread_bps = base_spread_bps + volatility_adjustment
        target_spread_bps = min(target_spread_bps, adapted_params.max_spread_bps)
        
        # Convert to price
        target_spread = mid_price * Decimal(str(target_spread_bps / 10000))
        half_spread = target_spread / 2
        
        # Apply inventory skew
        skew_adjustment = mid_price * Decimal(str(inventory_skew * adapted_params.skew_factor))
        
        # Calculate quote prices
        bid_price = mid_price - half_spread - skew_adjustment
        ask_price = mid_price + half_spread - skew_adjustment
        
        # Calculate quote sizes with regime-based adjustment
        base_quantity = adapted_params.min_quantity + (adapted_params.max_quantity - adapted_params.min_quantity) / 2
        
        # Adjust size based on regime
        if self.current_regime in [MarketRegime.CRISIS, MarketRegime.VOLATILE]:
            quote_size = base_quantity * Decimal('0.5')  # Reduce size in volatile markets
        else:
            quote_size = base_quantity
        
        quotes = []
        
        # Generate bid quote
        if abs(inventory_skew) < 0.8:  # Don't quote if inventory too skewed
            quotes.append({
                'side': 'bid',
                'price': bid_price.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                'quantity': quote_size,
                'timestamp': time.time(),
                'quote_id': str(uuid.uuid4())
            })
        
        # Generate ask quote
        if abs(inventory_skew) < 0.8:
            quotes.append({
                'side': 'ask',
                'price': ask_price.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP),
                'quantity': quote_size,
                'timestamp': time.time(),
                'quote_id': str(uuid.uuid4())
            })
        
        self.quote_count += len(quotes)
        self.last_quote_time = time.time()
        
        return quotes
    
    def get_performance_metrics(self) -> Dict:
        """Get performance metrics for this market maker"""
        uptime = time.time() - self.uptime_start
        quotes_per_second = self.quote_count / uptime if uptime > 0 else 0
        
        return {
            'symbol': self.symbol,
            'regime': self.current_regime.value,
            'trades_executed': self.trades_executed,
            'gross_pnl': str(self.gross_pnl),
            'fees_paid': str(self.fees_paid),
            'net_pnl': str(self.gross_pnl - self.fees_paid),
            'quotes_per_second': round(quotes_per_second, 2),
            'uptime_hours': round(uptime / 3600, 2),
            'inventory_position': str(self.inventory_manager.positions.get(self.symbol, Decimal('0'))),
            'current_volatility': round(self.volatility_estimator.get_volatility(self.symbol), 4)
        }

class LiquidityEngine:
    """
    Central liquidity engine managing market makers across all trading pairs
    Ensures consistent liquidity and optimal spreads
    """
    
    def __init__(self):
        self.market_makers: Dict[str, AdaptiveMarketMaker] = {}
        self.inventory_manager = InventoryManager()
        self.volatility_estimator = VolatilityEstimator()
        
        # Engine configuration
        self.liquidity_targets: Dict[LiquidityTier, Dict] = {
            LiquidityTier.TIER_1: {
                'target_spread_bps': 5,
                'max_spread_bps': 20,
                'min_depth_usd': 10000,
                'refresh_ms': 100
            },
            LiquidityTier.TIER_2: {
                'target_spread_bps': 10,
                'max_spread_bps': 50,
                'min_depth_usd': 5000,
                'refresh_ms': 200
            },
            LiquidityTier.TIER_3: {
                'target_spread_bps': 25,
                'max_spread_bps': 100,
                'min_depth_usd': 2000,
                'refresh_ms': 500
            },
            LiquidityTier.EXOTIC: {
                'target_spread_bps': 50,
                'max_spread_bps': 200,
                'min_depth_usd': 1000,
                'refresh_ms': 1000
            }
        }
        
        # Performance tracking
        self.total_quotes_sent = 0
        self.total_trades_executed = 0
        self.aggregate_pnl = Decimal('0')
        self.start_time = time.time()
        
        logger.info("Liquidity Engine initialized")
    
    def add_trading_pair(self, 
                        symbol: str, 
                        tier: LiquidityTier,
                        min_quantity: Decimal,
                        max_quantity: Decimal,
                        inventory_limit: Decimal) -> None:
        """Add a new trading pair for market making"""
        
        # Get tier configuration
        tier_config = self.liquidity_targets[tier]
        
        # Create liquidity parameters
        parameters = LiquidityParameter(
            symbol=symbol,
            tier=tier,
            target_spread_bps=tier_config['target_spread_bps'],
            max_spread_bps=tier_config['max_spread_bps'],
            min_quantity=min_quantity,
            max_quantity=max_quantity,
            inventory_limit=inventory_limit,
            refresh_frequency_ms=tier_config['refresh_ms']
        )
        
        # Create adaptive market maker
        market_maker = AdaptiveMarketMaker(
            symbol=symbol,
            parameters=parameters,
            inventory_manager=self.inventory_manager,
            volatility_estimator=self.volatility_estimator
        )
        
        self.market_makers[symbol] = market_maker
        
        # Set inventory limits
        self.inventory_manager.position_limits[symbol] = inventory_limit
        
        logger.info(f"Added market maker for {symbol} (Tier: {tier.value})")
    
    async def update_market_data(self, symbol: str, market_data: Dict) -> None:
        """Update market data and trigger quote refresh if needed"""
        
        # Update volatility estimator
        if 'price' in market_data:
            self.volatility_estimator.update_price(symbol, Decimal(str(market_data['price'])))
        
        # Check if market maker exists for this symbol
        if symbol in self.market_makers:
            market_maker = self.market_makers[symbol]
            
            # Check if quotes need refresh
            time_since_last_quote = time.time() - market_maker.last_quote_time
            refresh_threshold = market_maker.parameters.refresh_frequency_ms / 1000
            
            if time_since_last_quote >= refresh_threshold:
                await self._refresh_quotes(symbol, market_data)
    
    async def _refresh_quotes(self, symbol: str, market_data: Dict) -> None:
        """Refresh quotes for a specific symbol"""
        market_maker = self.market_makers[symbol]
        
        try:
            # Generate new quotes
            new_quotes = await market_maker.generate_quotes(market_data)
            
            # Send quotes to exchange (mock implementation)
            for quote in new_quotes:
                await self._send_quote_to_exchange(symbol, quote)
                self.total_quotes_sent += 1
            
        except Exception as e:
            logger.error(f"Error refreshing quotes for {symbol}: {e}")
    
    async def _send_quote_to_exchange(self, symbol: str, quote: Dict) -> None:
        """Send quote to exchange (mock implementation)"""
        # In real implementation, this would send orders to the exchange
        logger.debug(f"Quote sent for {symbol}: {quote['side']} {quote['quantity']} @ {quote['price']}")
    
    def process_trade_execution(self, symbol: str, quantity: Decimal, price: Decimal, side: str) -> None:
        """Process trade execution and update inventory"""
        
        # Update inventory (negative for sells, positive for buys from MM perspective)
        trade_quantity = quantity if side == 'buy' else -quantity
        self.inventory_manager.update_position(symbol, trade_quantity, price)
        
        # Update market maker metrics
        if symbol in self.market_makers:
            market_maker = self.market_makers[symbol]
            market_maker.trades_executed += 1
            
            # Simple PnL calculation (would be more complex in reality)
            pnl_impact = quantity * price * Decimal('0.0001')  # Assume small profit per trade
            market_maker.gross_pnl += pnl_impact
            self.aggregate_pnl += pnl_impact
        
        self.total_trades_executed += 1
        
        logger.info(f"Trade executed: {side} {quantity} {symbol} @ {price}")
    
    async def rebalance_inventory(self) -> None:
        """Rebalance inventory across all positions"""
        rebalance_tasks = []
        
        for symbol in self.market_makers.keys():
            if self.inventory_manager.needs_rebalancing(symbol):
                rebalance_quantity = self.inventory_manager.get_rebalance_quantity(symbol)
                rebalance_tasks.append(self._execute_rebalance_trade(symbol, rebalance_quantity))
        
        if rebalance_tasks:
            await asyncio.gather(*rebalance_tasks)
            logger.info(f"Rebalanced {len(rebalance_tasks)} positions")
    
    async def _execute_rebalance_trade(self, symbol: str, quantity: Decimal) -> None:
        """Execute rebalancing trade for a symbol"""
        # Mock rebalancing trade execution
        side = 'sell' if quantity < 0 else 'buy'
        logger.info(f"Rebalancing {symbol}: {side} {abs(quantity)}")
    
    def get_liquidity_metrics(self) -> Dict[str, LiquidityMetrics]:
        """Get real-time liquidity metrics for all pairs"""
        metrics = {}
        
        for symbol, market_maker in self.market_makers.items():
            # Calculate uptime
            uptime = time.time() - market_maker.uptime_start
            uptime_percentage = 100.0  # Simplified - would track actual downtime
            
            # Calculate quotes per second
            quotes_per_second = market_maker.quote_count / uptime if uptime > 0 else 0
            
            # Mock depth calculations (would come from order book in reality)
            bid_depth = Decimal('10000')  # $10k depth
            ask_depth = Decimal('10000')  # $10k depth
            
            metrics[symbol] = LiquidityMetrics(
                symbol=symbol,
                bid_depth=bid_depth,
                ask_depth=ask_depth,
                spread_bps=market_maker.parameters.target_spread_bps,
                effective_spread_bps=market_maker.parameters.target_spread_bps * 1.1,
                price_impact_bps=5.0,
                uptime_percentage=uptime_percentage,
                quote_updates_per_second=quotes_per_second
            )
        
        return metrics
    
    def get_engine_performance(self) -> Dict:
        """Get overall engine performance metrics"""
        uptime = time.time() - self.start_time
        quotes_per_second = self.total_quotes_sent / uptime if uptime > 0 else 0
        
        # Aggregate metrics from all market makers
        total_inventory_value = Decimal('0')
        for symbol, position in self.inventory_manager.positions.items():
            # Mock price for calculation
            mock_price = Decimal('50000') if 'BTC' in symbol else Decimal('3000')
            total_inventory_value += abs(position) * mock_price
        
        return {
            'total_market_makers': len(self.market_makers),
            'total_quotes_sent': self.total_quotes_sent,
            'total_trades_executed': self.total_trades_executed,
            'quotes_per_second': round(quotes_per_second, 2),
            'aggregate_pnl': str(self.aggregate_pnl),
            'total_inventory_value': str(total_inventory_value),
            'uptime_hours': round(uptime / 3600, 2),
            'active_pairs': list(self.market_makers.keys())
        }
    
    async def start_liquidity_engine(self) -> None:
        """Start the liquidity engine with all market makers"""
        logger.info("Starting Liquidity Engine...")
        
        # Start background tasks
        tasks = [
            self._quote_refresh_loop(),
            self._inventory_monitoring_loop(),
            self._performance_monitoring_loop()
        ]
        
        await asyncio.gather(*tasks)
    
    async def _quote_refresh_loop(self) -> None:
        """Background loop for quote refreshing"""
        while True:
            for symbol in self.market_makers.keys():
                # Mock market data update
                mock_market_data = {
                    'price': 50000 + np.random.normal(0, 100),  # Mock price with noise
                    'volume': 1000,
                    'spread_bps': 10
                }
                await self.update_market_data(symbol, mock_market_data)
            
            await asyncio.sleep(0.1)  # 100ms refresh cycle
    
    async def _inventory_monitoring_loop(self) -> None:
        """Background loop for inventory monitoring"""
        while True:
            await self.rebalance_inventory()
            await asyncio.sleep(30)  # Check every 30 seconds
    
    async def _performance_monitoring_loop(self) -> None:
        """Background loop for performance monitoring"""
        while True:
            await asyncio.sleep(60)  # Report every minute
            
            performance = self.get_engine_performance()
            liquidity_metrics = self.get_liquidity_metrics()
            
            logger.info(f"Liquidity Engine Performance: {performance}")
            
            # Check for any issues
            for symbol, metrics in liquidity_metrics.items():
                if metrics.spread_bps > 100:  # Wide spread warning
                    logger.warning(f"Wide spread detected for {symbol}: {metrics.spread_bps} bps")

def create_standard_liquidity_setup() -> LiquidityEngine:
    """Create a standard liquidity setup for the living economy"""
    engine = LiquidityEngine()
    
    # Add major pairs (Tier 1)
    engine.add_trading_pair("BTC/USD", LiquidityTier.TIER_1, 
                           Decimal('0.01'), Decimal('10'), Decimal('100'))
    engine.add_trading_pair("ETH/USD", LiquidityTier.TIER_1,
                           Decimal('0.1'), Decimal('100'), Decimal('1000'))
    
    # Add popular pairs (Tier 2)
    engine.add_trading_pair("SOL/USD", LiquidityTier.TIER_2,
                           Decimal('1'), Decimal('1000'), Decimal('10000'))
    engine.add_trading_pair("CREDITS/USD", LiquidityTier.TIER_2,
                           Decimal('100'), Decimal('100000'), Decimal('1000000'))
    
    # Add prediction markets (Tier 3)
    engine.add_trading_pair("PRED-AI-SINGULARITY/USD", LiquidityTier.TIER_3,
                           Decimal('10'), Decimal('10000'), Decimal('100000'))
    
    return engine

if __name__ == "__main__":
    # Demo
    async def demo():
        engine = create_standard_liquidity_setup()
        
        # Simulate some market data updates
        for _ in range(5):
            await engine.update_market_data("BTC/USD", {
                'price': 50000 + np.random.normal(0, 100),
                'volume': 1000,
                'spread_bps': 8
            })
            
            await asyncio.sleep(0.2)
        
        # Show performance
        performance = engine.get_engine_performance()
        metrics = engine.get_liquidity_metrics()
        
        print("Liquidity Engine Demo:")
        print(f"Performance: {performance}")
        print(f"Liquidity Metrics: {list(metrics.keys())}")
    
    asyncio.run(demo())
#!/usr/bin/env python3
"""
High-Frequency Trading Engine for AI Agents
Ultra-low latency execution with advanced strategies
"""

import asyncio
import time
import uuid
from typing import Dict, List, Optional, Callable, Any, Tuple
from dataclasses import dataclass, field
from decimal import Decimal
from enum import Enum
import numpy as np
from collections import deque, defaultdict
import logging
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

class HFTStrategy(Enum):
    MARKET_MAKING = "market_making"
    ARBITRAGE = "arbitrage"
    MOMENTUM = "momentum"
    MEAN_REVERSION = "mean_reversion"
    LIQUIDITY_PROVISION = "liquidity_provision"
    STATISTICAL_ARBITRAGE = "statistical_arbitrage"
    LATENCY_ARBITRAGE = "latency_arbitrage"

class SignalType(Enum):
    BUY = "buy"
    SELL = "sell"
    HOLD = "hold"
    CLOSE = "close"

@dataclass
class TradingSignal:
    """High-frequency trading signal"""
    strategy: HFTStrategy
    signal_type: SignalType
    symbol: str
    price: Optional[Decimal]
    quantity: Decimal
    confidence: float  # 0.0 to 1.0
    urgency: int  # 1-10, 10 being most urgent
    timestamp: float = field(default_factory=time.time)
    metadata: Dict[str, Any] = field(default_factory=dict)

@dataclass
class MarketMicrostructure:
    """Real-time market microstructure data"""
    symbol: str
    bid_price: Decimal
    ask_price: Decimal
    bid_size: Decimal
    ask_size: Decimal
    last_price: Decimal
    volume: Decimal
    timestamp: float
    order_book_imbalance: float  # (bid_size - ask_size) / (bid_size + ask_size)
    price_impact: float
    effective_spread: Decimal

class BaseHFTStrategy(ABC):
    """Base class for HFT strategies"""
    
    def __init__(self, name: str, agent_id: str):
        self.name = name
        self.agent_id = agent_id
        self.position = Decimal('0')
        self.pnl = Decimal('0')
        self.trades_count = 0
        self.win_rate = 0.0
        self.max_position = Decimal('1000')  # Risk limit
        self.is_active = True
        
    @abstractmethod
    async def generate_signal(self, market_data: MarketMicrostructure) -> Optional[TradingSignal]:
        """Generate trading signal based on market data"""
        pass
    
    @abstractmethod
    def update_position(self, trade_quantity: Decimal, trade_price: Decimal) -> None:
        """Update strategy position after trade execution"""
        pass

class MarketMakingStrategy(BaseHFTStrategy):
    """High-frequency market making strategy"""
    
    def __init__(self, agent_id: str):
        super().__init__("Market Making", agent_id)
        self.target_spread_bps = 5  # Target 5 basis points
        self.inventory_limit = Decimal('500')
        self.skew_factor = 0.1  # How much to skew quotes based on inventory
        
    async def generate_signal(self, market_data: MarketMicrostructure) -> Optional[TradingSignal]:
        """Generate market making signals"""
        
        # Calculate target spread
        mid_price = (market_data.bid_price + market_data.ask_price) / 2
        target_spread = mid_price * Decimal(str(self.target_spread_bps / 10000))
        half_spread = target_spread / 2
        
        # Adjust for inventory (skew quotes if we have too much inventory)
        inventory_skew = self.position * Decimal(str(self.skew_factor))
        
        # Generate both bid and ask signals
        signals = []
        
        # Bid signal (only if we're not at max long position)
        if self.position < self.inventory_limit:
            bid_price = mid_price - half_spread - inventory_skew
            if bid_price > market_data.bid_price:  # Only if we can improve the bid
                signals.append(TradingSignal(
                    strategy=HFTStrategy.MARKET_MAKING,
                    signal_type=SignalType.BUY,
                    symbol=market_data.symbol,
                    price=bid_price,
                    quantity=Decimal('10'),
                    confidence=0.8,
                    urgency=7,
                    metadata={"side": "bid", "inventory": str(self.position)}
                ))
        
        # Ask signal (only if we're not at max short position)
        if self.position > -self.inventory_limit:
            ask_price = mid_price + half_spread - inventory_skew
            if ask_price < market_data.ask_price:  # Only if we can improve the ask
                signals.append(TradingSignal(
                    strategy=HFTStrategy.MARKET_MAKING,
                    signal_type=SignalType.SELL,
                    symbol=market_data.symbol,
                    price=ask_price,
                    quantity=Decimal('10'),
                    confidence=0.8,
                    urgency=7,
                    metadata={"side": "ask", "inventory": str(self.position)}
                ))
        
        return signals[0] if signals else None
    
    def update_position(self, trade_quantity: Decimal, trade_price: Decimal) -> None:
        """Update position and calculate PnL"""
        self.position += trade_quantity
        self.trades_count += 1
        # Simplified PnL calculation
        self.pnl += trade_quantity * trade_price

class MomentumStrategy(BaseHFTStrategy):
    """High-frequency momentum trading strategy"""
    
    def __init__(self, agent_id: str):
        super().__init__("Momentum", agent_id)
        self.price_history = deque(maxlen=100)
        self.volume_history = deque(maxlen=100)
        self.momentum_threshold = 0.002  # 0.2% price move
        
    async def generate_signal(self, market_data: MarketMicrostructure) -> Optional[TradingSignal]:
        """Generate momentum-based signals"""
        
        # Store current data
        self.price_history.append(float(market_data.last_price))
        self.volume_history.append(float(market_data.volume))
        
        if len(self.price_history) < 10:
            return None
        
        # Calculate short-term momentum
        recent_prices = list(self.price_history)[-10:]
        price_change = (recent_prices[-1] - recent_prices[0]) / recent_prices[0]
        
        # Calculate volume momentum
        recent_volumes = list(self.volume_history)[-10:]
        avg_volume = sum(recent_volumes) / len(recent_volumes)
        current_volume = recent_volumes[-1]
        volume_ratio = current_volume / avg_volume if avg_volume > 0 else 1
        
        # Generate signal based on momentum and volume
        if abs(price_change) > self.momentum_threshold and volume_ratio > 1.5:
            signal_type = SignalType.BUY if price_change > 0 else SignalType.SELL
            confidence = min(0.9, abs(price_change) * 100 + volume_ratio * 0.1)
            
            return TradingSignal(
                strategy=HFTStrategy.MOMENTUM,
                signal_type=signal_type,
                symbol=market_data.symbol,
                price=None,  # Market order
                quantity=Decimal('50'),
                confidence=confidence,
                urgency=9,
                metadata={
                    "price_change": price_change,
                    "volume_ratio": volume_ratio
                }
            )
        
        return None
    
    def update_position(self, trade_quantity: Decimal, trade_price: Decimal) -> None:
        """Update position and calculate PnL"""
        self.position += trade_quantity
        self.trades_count += 1

class ArbitrageStrategy(BaseHFTStrategy):
    """Cross-exchange arbitrage strategy"""
    
    def __init__(self, agent_id: str):
        super().__init__("Arbitrage", agent_id)
        self.exchange_prices = {}  # Track prices across exchanges
        self.min_profit_bps = 10  # Minimum 10 bps profit
        
    async def generate_signal(self, market_data: MarketMicrostructure) -> Optional[TradingSignal]:
        """Generate arbitrage signals"""
        
        # Store current exchange price
        self.exchange_prices["current"] = market_data.last_price
        
        # Mock additional exchange prices (in real implementation, these would come from other exchanges)
        self.exchange_prices["exchange_b"] = market_data.last_price * Decimal('1.0015')  # 15 bps higher
        self.exchange_prices["exchange_c"] = market_data.last_price * Decimal('0.9985')  # 15 bps lower
        
        # Find arbitrage opportunities
        prices = list(self.exchange_prices.values())
        if len(prices) < 2:
            return None
        
        max_price = max(prices)
        min_price = min(prices)
        profit_bps = ((max_price - min_price) / min_price) * 10000
        
        if profit_bps > self.min_profit_bps:
            # Buy on exchange with lowest price, sell on exchange with highest price
            return TradingSignal(
                strategy=HFTStrategy.ARBITRAGE,
                signal_type=SignalType.BUY,  # Simplified - would need dual signals in reality
                symbol=market_data.symbol,
                price=min_price,
                quantity=Decimal('25'),
                confidence=0.95,
                urgency=10,
                metadata={
                    "profit_bps": float(profit_bps),
                    "buy_exchange": "current",
                    "sell_exchange": "other"
                }
            )
        
        return None
    
    def update_position(self, trade_quantity: Decimal, trade_price: Decimal) -> None:
        """Update position"""
        self.position += trade_quantity
        self.trades_count += 1

class HighFrequencyTradingEngine:
    """
    Ultra-high performance HFT engine
    Processes thousands of signals per second
    """
    
    def __init__(self):
        self.strategies: Dict[str, BaseHFTStrategy] = {}
        self.active_signals: deque = deque(maxlen=10000)
        self.execution_queue: asyncio.Queue = asyncio.Queue()
        self.market_data_feed = {}
        
        # Performance metrics
        self.signals_generated = 0
        self.orders_executed = 0
        self.total_latency_us = 0  # microseconds
        self.successful_trades = 0
        
        # Risk management
        self.max_daily_loss = Decimal('10000')
        self.position_limits = defaultdict(lambda: Decimal('1000'))
        self.daily_pnl = Decimal('0')
        
        # Execution settings
        self.max_execution_latency_us = 1000  # 1ms max latency
        self.order_size_limit = Decimal('1000')
        
        logger.info("High-frequency trading engine initialized")
    
    def register_strategy(self, strategy: BaseHFTStrategy) -> None:
        """Register a new HFT strategy"""
        self.strategies[strategy.agent_id] = strategy
        logger.info(f"Registered strategy: {strategy.name} for agent {strategy.agent_id}")
    
    async def process_market_data(self, market_data: MarketMicrostructure) -> None:
        """Process incoming market data and generate signals"""
        start_time = time.perf_counter()
        
        # Store market data
        self.market_data_feed[market_data.symbol] = market_data
        
        # Generate signals from all active strategies
        signal_tasks = []
        for strategy in self.strategies.values():
            if strategy.is_active:
                signal_tasks.append(strategy.generate_signal(market_data))
        
        # Execute all strategies in parallel
        signals = await asyncio.gather(*signal_tasks, return_exceptions=True)
        
        # Process valid signals
        for signal in signals:
            if isinstance(signal, TradingSignal):
                await self._validate_and_queue_signal(signal)
                self.signals_generated += 1
                self.active_signals.append(signal)
        
        # Track latency
        end_time = time.perf_counter()
        latency_us = (end_time - start_time) * 1_000_000
        self.total_latency_us += latency_us
        
        if latency_us > self.max_execution_latency_us:
            logger.warning(f"High latency detected: {latency_us:.0f}μs")
    
    async def _validate_and_queue_signal(self, signal: TradingSignal) -> bool:
        """Validate signal and add to execution queue"""
        
        # Risk checks
        strategy = self.strategies.get(signal.metadata.get("agent_id", ""))
        if strategy:
            # Position limit check
            if abs(strategy.position) >= self.max_position:
                logger.warning(f"Position limit exceeded for {strategy.agent_id}")
                return False
            
            # Daily loss limit check
            if self.daily_pnl <= -self.max_daily_loss:
                logger.warning("Daily loss limit reached")
                return False
        
        # Order size check
        if signal.quantity > self.order_size_limit:
            signal.quantity = self.order_size_limit
        
        # Queue for execution
        await self.execution_queue.put(signal)
        return True
    
    async def execute_signals(self, exchange_interface) -> None:
        """Execute signals from the queue"""
        while True:
            try:
                # Get signal from queue with timeout
                signal = await asyncio.wait_for(self.execution_queue.get(), timeout=0.001)
                
                start_time = time.perf_counter()
                
                # Execute order through exchange interface
                result = await self._execute_order(signal, exchange_interface)
                
                # Track execution metrics
                end_time = time.perf_counter()
                execution_latency = (end_time - start_time) * 1_000_000
                
                if result.get("success"):
                    self.orders_executed += 1
                    self.successful_trades += 1
                    
                    # Update strategy position
                    strategy = self.strategies.get(signal.metadata.get("agent_id", ""))
                    if strategy:
                        executed_qty = Decimal(str(result.get("filled_quantity", 0)))
                        executed_price = Decimal(str(result.get("price", 0)))
                        strategy.update_position(executed_qty, executed_price)
                
                logger.debug(f"Order executed in {execution_latency:.0f}μs: {result}")
                
            except asyncio.TimeoutError:
                # No signals in queue, continue
                await asyncio.sleep(0.0001)  # 0.1ms sleep
            except Exception as e:
                logger.error(f"Error executing signal: {e}")
    
    async def _execute_order(self, signal: TradingSignal, exchange_interface) -> Dict[str, Any]:
        """Execute individual order"""
        try:
            # Convert signal to order format
            from ..exchange.core_exchange import Order, OrderSide, OrderType
            
            order_side = OrderSide.BUY if signal.signal_type == SignalType.BUY else OrderSide.SELL
            order_type = OrderType.MARKET if signal.price is None else OrderType.LIMIT
            
            # Create order object (simplified - would need proper trading pair)
            order = Order(
                id=str(uuid.uuid4()),
                agent_id=signal.metadata.get("agent_id", "hft_agent"),
                trading_pair=None,  # Would need proper trading pair
                side=order_side,
                order_type=order_type,
                quantity=signal.quantity,
                price=signal.price
            )
            
            # Execute through exchange
            result = await exchange_interface.place_order(order)
            return result
            
        except Exception as e:
            logger.error(f"Order execution failed: {e}")
            return {"success": False, "error": str(e)}
    
    def get_strategy_performance(self) -> Dict[str, Any]:
        """Get performance metrics for all strategies"""
        performance = {}
        
        for agent_id, strategy in self.strategies.items():
            performance[agent_id] = {
                "strategy_name": strategy.name,
                "position": str(strategy.position),
                "pnl": str(strategy.pnl),
                "trades_count": strategy.trades_count,
                "win_rate": strategy.win_rate,
                "is_active": strategy.is_active
            }
        
        return performance
    
    def get_engine_stats(self) -> Dict[str, Any]:
        """Get overall engine performance statistics"""
        avg_latency = self.total_latency_us / max(1, self.signals_generated)
        success_rate = self.successful_trades / max(1, self.orders_executed)
        
        return {
            "signals_generated": self.signals_generated,
            "orders_executed": self.orders_executed,
            "successful_trades": self.successful_trades,
            "success_rate": round(success_rate, 4),
            "average_latency_us": round(avg_latency, 2),
            "daily_pnl": str(self.daily_pnl),
            "active_strategies": len([s for s in self.strategies.values() if s.is_active]),
            "queue_size": self.execution_queue.qsize()
        }
    
    async def start_hft_engine(self, exchange_interface) -> None:
        """Start the HFT engine with all components"""
        logger.info("Starting HFT engine...")
        
        # Start signal execution loop
        execution_task = asyncio.create_task(self.execute_signals(exchange_interface))
        
        # Start performance monitoring
        monitoring_task = asyncio.create_task(self._monitor_performance())
        
        # Wait for tasks
        await asyncio.gather(execution_task, monitoring_task)
    
    async def _monitor_performance(self) -> None:
        """Monitor and log performance metrics"""
        while True:
            await asyncio.sleep(10)  # Report every 10 seconds
            
            stats = self.get_engine_stats()
            logger.info(f"HFT Engine Stats: {stats}")
            
            # Performance warnings
            if stats["average_latency_us"] > self.max_execution_latency_us:
                logger.warning(f"High average latency: {stats['average_latency_us']:.0f}μs")
            
            if stats["success_rate"] < 0.95:
                logger.warning(f"Low success rate: {stats['success_rate']:.2%}")

class HFTAgentFactory:
    """Factory for creating specialized HFT agents"""
    
    @staticmethod
    def create_market_maker(agent_id: str) -> MarketMakingStrategy:
        """Create a market making agent"""
        return MarketMakingStrategy(agent_id)
    
    @staticmethod
    def create_momentum_trader(agent_id: str) -> MomentumStrategy:
        """Create a momentum trading agent"""
        return MomentumStrategy(agent_id)
    
    @staticmethod
    def create_arbitrageur(agent_id: str) -> ArbitrageStrategy:
        """Create an arbitrage trading agent"""
        return ArbitrageStrategy(agent_id)
    
    @staticmethod
    def create_hft_swarm(num_agents: int = 10) -> List[BaseHFTStrategy]:
        """Create a swarm of diverse HFT agents"""
        agents = []
        
        # Mix of different strategy types
        for i in range(num_agents):
            agent_id = f"hft_agent_{i}"
            
            if i % 3 == 0:
                agents.append(HFTAgentFactory.create_market_maker(agent_id))
            elif i % 3 == 1:
                agents.append(HFTAgentFactory.create_momentum_trader(agent_id))
            else:
                agents.append(HFTAgentFactory.create_arbitrageur(agent_id))
        
        return agents

if __name__ == "__main__":
    # Demo HFT engine
    async def demo():
        engine = HighFrequencyTradingEngine()
        
        # Create and register strategies
        agents = HFTAgentFactory.create_hft_swarm(5)
        for agent in agents:
            engine.register_strategy(agent)
        
        # Simulate market data
        market_data = MarketMicrostructure(
            symbol="BTC/USD",
            bid_price=Decimal('50000'),
            ask_price=Decimal('50010'),
            bid_size=Decimal('10'),
            ask_size=Decimal('8'),
            last_price=Decimal('50005'),
            volume=Decimal('1000'),
            timestamp=time.time(),
            order_book_imbalance=0.1,
            price_impact=0.02,
            effective_spread=Decimal('10')
        )
        
        # Process market data
        await engine.process_market_data(market_data)
        
        # Show results
        print("HFT Engine Demo Results:")
        print(f"Engine stats: {engine.get_engine_stats()}")
        print(f"Strategy performance: {engine.get_strategy_performance()}")
    
    asyncio.run(demo())
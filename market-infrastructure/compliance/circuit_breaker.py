#!/usr/bin/env python3
"""
Circuit Breaker System for Market Protection
Prevents unrealistic market movements and systemic risks
"""

import asyncio
import time
import uuid
from typing import Dict, List, Optional, Tuple, Set, Callable
from dataclasses import dataclass, field
from decimal import Decimal
from enum import Enum
import numpy as np
from collections import defaultdict, deque
import logging
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

class BreakType(Enum):
    PRICE_LIMIT = "price_limit"          # Single stock circuit breaker
    VOLATILITY = "volatility"            # Volatility-based halt
    VOLUME_SPIKE = "volume_spike"        # Unusual volume activity
    MARKET_WIDE = "market_wide"          # Market-wide circuit breaker
    LIQUIDITY = "liquidity"              # Liquidity-based halt
    ERROR_TRADE = "error_trade"          # Erroneous trade detection
    MANIPULATION = "manipulation"         # Market manipulation detection

class HaltLevel(Enum):
    LEVEL_1 = 1  # 7% decline, 15-minute halt
    LEVEL_2 = 2  # 13% decline, 15-minute halt
    LEVEL_3 = 3  # 20% decline, halt until next trading day

class HaltStatus(Enum):
    ACTIVE = "active"
    HALTED = "halted"
    COOLING_DOWN = "cooling_down"
    SUSPENDED = "suspended"

@dataclass
class CircuitBreakerRule:
    """Configuration for a specific circuit breaker rule"""
    rule_id: str
    break_type: BreakType
    symbol: Optional[str]  # None for market-wide rules
    
    # Price-based parameters
    price_threshold_pct: Optional[float] = None
    price_window_seconds: Optional[int] = None
    
    # Volatility parameters
    volatility_threshold: Optional[float] = None
    volatility_window: Optional[int] = None
    
    # Volume parameters
    volume_multiplier: Optional[float] = None
    volume_window_seconds: Optional[int] = None
    
    # Halt parameters
    halt_duration_seconds: int = 900  # 15 minutes default
    cooldown_seconds: int = 300       # 5 minutes cooldown
    
    # Trigger conditions
    consecutive_triggers: int = 1
    max_triggers_per_day: int = 5
    
    is_active: bool = True

@dataclass
class HaltEvent:
    """Record of a circuit breaker activation"""
    event_id: str
    rule_id: str
    break_type: BreakType
    symbol: Optional[str]
    trigger_time: float
    halt_duration: int
    trigger_price: Optional[Decimal] = None
    trigger_data: Dict = field(default_factory=dict)
    resolved_time: Optional[float] = None
    is_active: bool = True

class MarketDataTracker:
    """Tracks market data for circuit breaker analysis"""
    
    def __init__(self, max_history_points: int = 10000):
        self.max_history = max_history_points
        
        # Price tracking
        self.price_history: Dict[str, deque] = defaultdict(lambda: deque(maxlen=max_history_points))
        self.price_timestamps: Dict[str, deque] = defaultdict(lambda: deque(maxlen=max_history_points))
        
        # Volume tracking  
        self.volume_history: Dict[str, deque] = defaultdict(lambda: deque(maxlen=max_history_points))
        self.volume_timestamps: Dict[str, deque] = defaultdict(lambda: deque(maxlen=max_history_points))
        
        # Trade tracking
        self.trade_history: Dict[str, List] = defaultdict(list)
        
        # Market-wide metrics
        self.market_index_history: deque = deque(maxlen=max_history_points)
        self.market_timestamps: deque = deque(maxlen=max_history_points)
        
    def update_price(self, symbol: str, price: Decimal, timestamp: float = None) -> None:
        """Update price data for circuit breaker monitoring"""
        if timestamp is None:
            timestamp = time.time()
            
        self.price_history[symbol].append(float(price))
        self.price_timestamps[symbol].append(timestamp)
    
    def update_volume(self, symbol: str, volume: Decimal, timestamp: float = None) -> None:
        """Update volume data"""
        if timestamp is None:
            timestamp = time.time()
            
        self.volume_history[symbol].append(float(volume))
        self.volume_timestamps[symbol].append(timestamp)
    
    def record_trade(self, symbol: str, price: Decimal, quantity: Decimal, timestamp: float = None) -> None:
        """Record individual trade for analysis"""
        if timestamp is None:
            timestamp = time.time()
            
        trade_record = {
            'price': float(price),
            'quantity': float(quantity),
            'timestamp': timestamp
        }
        
        # Keep only recent trades (last hour)
        cutoff_time = timestamp - 3600
        self.trade_history[symbol] = [
            trade for trade in self.trade_history[symbol] 
            if trade['timestamp'] > cutoff_time
        ]
        
        self.trade_history[symbol].append(trade_record)
    
    def get_price_change(self, symbol: str, window_seconds: int) -> Optional[float]:
        """Calculate price change over specified window"""
        if symbol not in self.price_history or len(self.price_history[symbol]) < 2:
            return None
        
        current_time = time.time()
        cutoff_time = current_time - window_seconds
        
        prices = list(self.price_history[symbol])
        timestamps = list(self.price_timestamps[symbol])
        
        # Find prices within the window
        recent_prices = []
        for i, ts in enumerate(timestamps):
            if ts >= cutoff_time:
                recent_prices.append(prices[i])
        
        if len(recent_prices) < 2:
            return None
        
        start_price = recent_prices[0]
        current_price = recent_prices[-1]
        
        if start_price > 0:
            return (current_price - start_price) / start_price
        
        return None
    
    def get_volatility(self, symbol: str, window_points: int = 50) -> Optional[float]:
        """Calculate recent volatility"""
        if symbol not in self.price_history or len(self.price_history[symbol]) < window_points:
            return None
        
        prices = list(self.price_history[symbol])[-window_points:]
        
        # Calculate log returns
        returns = []
        for i in range(1, len(prices)):
            if prices[i-1] > 0:
                returns.append(np.log(prices[i] / prices[i-1]))
        
        if len(returns) < 2:
            return None
        
        return float(np.std(returns))
    
    def get_volume_ratio(self, symbol: str, window_seconds: int) -> Optional[float]:
        """Calculate volume ratio compared to historical average"""
        if symbol not in self.volume_history:
            return None
        
        current_time = time.time()
        cutoff_time = current_time - window_seconds
        
        volumes = list(self.volume_history[symbol])
        timestamps = list(self.volume_timestamps[symbol])
        
        # Recent volume
        recent_volume = 0
        for i, ts in enumerate(timestamps):
            if ts >= cutoff_time:
                recent_volume += volumes[i]
        
        # Historical average (last 30 periods)
        if len(volumes) < 30:
            return None
        
        historical_avg = sum(volumes[-30:]) / 30
        
        if historical_avg > 0:
            return recent_volume / historical_avg
        
        return None

class CircuitBreakerAnalyzer:
    """Analyzes market data for circuit breaker triggers"""
    
    def __init__(self, data_tracker: MarketDataTracker):
        self.data_tracker = data_tracker
        
    def check_price_limit_trigger(self, rule: CircuitBreakerRule, symbol: str) -> Optional[Dict]:
        """Check if price limit circuit breaker should trigger"""
        if rule.price_threshold_pct is None or rule.price_window_seconds is None:
            return None
        
        price_change = self.data_tracker.get_price_change(symbol, rule.price_window_seconds)
        
        if price_change is None:
            return None
        
        # Check if price change exceeds threshold
        if abs(price_change) >= abs(rule.price_threshold_pct / 100):
            current_price = None
            if symbol in self.data_tracker.price_history and self.data_tracker.price_history[symbol]:
                current_price = self.data_tracker.price_history[symbol][-1]
            
            return {
                'trigger_met': True,
                'price_change_pct': price_change * 100,
                'threshold_pct': rule.price_threshold_pct,
                'current_price': current_price,
                'window_seconds': rule.price_window_seconds
            }
        
        return None
    
    def check_volatility_trigger(self, rule: CircuitBreakerRule, symbol: str) -> Optional[Dict]:
        """Check if volatility circuit breaker should trigger"""
        if rule.volatility_threshold is None:
            return None
        
        volatility = self.data_tracker.get_volatility(symbol, rule.volatility_window or 100)
        
        if volatility is None:
            return None
        
        if volatility >= rule.volatility_threshold:
            return {
                'trigger_met': True,
                'current_volatility': volatility,
                'threshold': rule.volatility_threshold,
                'window_points': rule.volatility_window or 100
            }
        
        return None
    
    def check_volume_spike_trigger(self, rule: CircuitBreakerRule, symbol: str) -> Optional[Dict]:
        """Check if volume spike circuit breaker should trigger"""
        if rule.volume_multiplier is None or rule.volume_window_seconds is None:
            return None
        
        volume_ratio = self.data_tracker.get_volume_ratio(symbol, rule.volume_window_seconds)
        
        if volume_ratio is None:
            return None
        
        if volume_ratio >= rule.volume_multiplier:
            return {
                'trigger_met': True,
                'volume_ratio': volume_ratio,
                'threshold_multiplier': rule.volume_multiplier,
                'window_seconds': rule.volume_window_seconds
            }
        
        return None
    
    def check_error_trade_trigger(self, rule: CircuitBreakerRule, symbol: str) -> Optional[Dict]:
        """Check for erroneous trades that should trigger circuit breaker"""
        if symbol not in self.data_tracker.trade_history:
            return None
        
        recent_trades = self.data_tracker.trade_history[symbol]
        if len(recent_trades) < 2:
            return None
        
        # Look for trades that are significantly outside normal range
        prices = [trade['price'] for trade in recent_trades[-20:]]  # Last 20 trades
        
        if len(prices) < 10:
            return None
        
        # Calculate price statistics
        mean_price = np.mean(prices[:-1])  # Exclude latest trade
        std_price = np.std(prices[:-1])
        latest_price = prices[-1]
        
        # Check if latest trade is more than 5 standard deviations away
        if std_price > 0:
            z_score = abs(latest_price - mean_price) / std_price
            
            if z_score > 5.0:  # Likely erroneous trade
                return {
                    'trigger_met': True,
                    'z_score': z_score,
                    'latest_price': latest_price,
                    'mean_price': mean_price,
                    'std_price': std_price
                }
        
        return None

class CircuitBreakerSystem:
    """
    Main circuit breaker system managing all market protection rules
    """
    
    def __init__(self):
        self.rules: Dict[str, CircuitBreakerRule] = {}
        self.active_halts: Dict[str, HaltEvent] = {}  # symbol -> halt event
        self.halt_history: List[HaltEvent] = []
        self.data_tracker = MarketDataTracker()
        self.analyzer = CircuitBreakerAnalyzer(self.data_tracker)
        
        # System state
        self.is_market_open = True
        self.system_enabled = True
        self.daily_trigger_counts: Dict[str, int] = defaultdict(int)
        
        # Callbacks for external systems
        self.halt_callbacks: List[Callable] = []
        self.resume_callbacks: List[Callable] = []
        
        # Performance metrics
        self.total_halts_triggered = 0
        self.false_positive_count = 0
        self.system_uptime_start = time.time()
        
        logger.info("Circuit Breaker System initialized")
    
    def add_rule(self, rule: CircuitBreakerRule) -> None:
        """Add a new circuit breaker rule"""
        self.rules[rule.rule_id] = rule
        logger.info(f"Added circuit breaker rule: {rule.rule_id} ({rule.break_type.value})")
    
    def remove_rule(self, rule_id: str) -> bool:
        """Remove a circuit breaker rule"""
        if rule_id in self.rules:
            del self.rules[rule_id]
            logger.info(f"Removed circuit breaker rule: {rule_id}")
            return True
        return False
    
    def register_halt_callback(self, callback: Callable) -> None:
        """Register callback for when trading is halted"""
        self.halt_callbacks.append(callback)
    
    def register_resume_callback(self, callback: Callable) -> None:
        """Register callback for when trading resumes"""
        self.resume_callbacks.append(callback)
    
    async def process_market_data(self, symbol: str, price: Decimal, volume: Decimal = None, timestamp: float = None) -> None:
        """Process incoming market data and check for circuit breaker triggers"""
        if not self.system_enabled:
            return
        
        if timestamp is None:
            timestamp = time.time()
        
        # Update data tracker
        self.data_tracker.update_price(symbol, price, timestamp)
        if volume is not None:
            self.data_tracker.update_volume(symbol, volume, timestamp)
        
        # Check if symbol is already halted
        if symbol in self.active_halts:
            await self._check_halt_expiration(symbol)
            return
        
        # Check all relevant rules
        await self._check_circuit_breaker_rules(symbol)
    
    async def process_trade(self, symbol: str, price: Decimal, quantity: Decimal, timestamp: float = None) -> None:
        """Process individual trade for circuit breaker analysis"""
        if not self.system_enabled:
            return
        
        if timestamp is None:
            timestamp = time.time()
        
        # Record trade
        self.data_tracker.record_trade(symbol, price, quantity, timestamp)
        
        # Also update price data
        await self.process_market_data(symbol, price, timestamp=timestamp)
    
    async def _check_circuit_breaker_rules(self, symbol: str) -> None:
        """Check all circuit breaker rules for a symbol"""
        
        for rule in self.rules.values():
            if not rule.is_active:
                continue
            
            # Skip if rule is symbol-specific and doesn't match
            if rule.symbol is not None and rule.symbol != symbol:
                continue
            
            # Check daily trigger limit
            if self.daily_trigger_counts[rule.rule_id] >= rule.max_triggers_per_day:
                continue
            
            # Check specific trigger conditions
            trigger_data = None
            
            if rule.break_type == BreakType.PRICE_LIMIT:
                trigger_data = self.analyzer.check_price_limit_trigger(rule, symbol)
            elif rule.break_type == BreakType.VOLATILITY:
                trigger_data = self.analyzer.check_volatility_trigger(rule, symbol)
            elif rule.break_type == BreakType.VOLUME_SPIKE:
                trigger_data = self.analyzer.check_volume_spike_trigger(rule, symbol)
            elif rule.break_type == BreakType.ERROR_TRADE:
                trigger_data = self.analyzer.check_error_trade_trigger(rule, symbol)
            
            # Trigger circuit breaker if conditions are met
            if trigger_data and trigger_data.get('trigger_met'):
                await self._trigger_circuit_breaker(rule, symbol, trigger_data)
    
    async def _trigger_circuit_breaker(self, rule: CircuitBreakerRule, symbol: str, trigger_data: Dict) -> None:
        """Trigger a circuit breaker halt"""
        
        # Create halt event
        halt_event = HaltEvent(
            event_id=str(uuid.uuid4()),
            rule_id=rule.rule_id,
            break_type=rule.break_type,
            symbol=symbol,
            trigger_time=time.time(),
            halt_duration=rule.halt_duration_seconds,
            trigger_data=trigger_data
        )
        
        # Record current price if available
        if symbol in self.data_tracker.price_history and self.data_tracker.price_history[symbol]:
            halt_event.trigger_price = Decimal(str(self.data_tracker.price_history[symbol][-1]))
        
        # Activate halt
        self.active_halts[symbol] = halt_event
        self.halt_history.append(halt_event)
        self.total_halts_triggered += 1
        self.daily_trigger_counts[rule.rule_id] += 1
        
        # Notify external systems
        for callback in self.halt_callbacks:
            try:
                await callback(symbol, halt_event)
            except Exception as e:
                logger.error(f"Error in halt callback: {e}")
        
        logger.warning(f"CIRCUIT BREAKER TRIGGERED: {symbol} - {rule.break_type.value}")
        logger.warning(f"Trigger data: {trigger_data}")
        logger.warning(f"Halt duration: {rule.halt_duration_seconds} seconds")
    
    async def _check_halt_expiration(self, symbol: str) -> None:
        """Check if a halt should be lifted"""
        if symbol not in self.active_halts:
            return
        
        halt_event = self.active_halts[symbol]
        current_time = time.time()
        
        # Check if halt duration has expired
        if current_time >= halt_event.trigger_time + halt_event.halt_duration:
            await self._resume_trading(symbol)
    
    async def _resume_trading(self, symbol: str) -> None:
        """Resume trading for a halted symbol"""
        if symbol not in self.active_halts:
            return
        
        halt_event = self.active_halts[symbol]
        halt_event.resolved_time = time.time()
        halt_event.is_active = False
        
        # Remove from active halts
        del self.active_halts[symbol]
        
        # Notify external systems
        for callback in self.resume_callbacks:
            try:
                await callback(symbol, halt_event)
            except Exception as e:
                logger.error(f"Error in resume callback: {e}")
        
        logger.info(f"Trading resumed for {symbol} after {halt_event.halt_duration} second halt")
    
    def manual_halt(self, symbol: str, duration_seconds: int, reason: str) -> str:
        """Manually trigger a halt for a symbol"""
        halt_event = HaltEvent(
            event_id=str(uuid.uuid4()),
            rule_id="manual",
            break_type=BreakType.MANIPULATION,  # Use manipulation type for manual halts
            symbol=symbol,
            trigger_time=time.time(),
            halt_duration=duration_seconds,
            trigger_data={"reason": reason, "manual": True}
        )
        
        self.active_halts[symbol] = halt_event
        self.halt_history.append(halt_event)
        
        logger.warning(f"MANUAL HALT: {symbol} - {reason}")
        return halt_event.event_id
    
    def manual_resume(self, symbol: str) -> bool:
        """Manually resume trading for a halted symbol"""
        if symbol in self.active_halts:
            asyncio.create_task(self._resume_trading(symbol))
            return True
        return False
    
    def is_trading_halted(self, symbol: str) -> bool:
        """Check if trading is currently halted for a symbol"""
        return symbol in self.active_halts
    
    def get_halt_status(self, symbol: str) -> Optional[HaltEvent]:
        """Get current halt status for a symbol"""
        return self.active_halts.get(symbol)
    
    def get_system_status(self) -> Dict:
        """Get overall system status and metrics"""
        uptime = time.time() - self.system_uptime_start
        
        return {
            'system_enabled': self.system_enabled,
            'market_open': self.is_market_open,
            'active_rules': len([r for r in self.rules.values() if r.is_active]),
            'total_rules': len(self.rules),
            'active_halts': len(self.active_halts),
            'total_halts_triggered': self.total_halts_triggered,
            'false_positive_count': self.false_positive_count,
            'uptime_hours': round(uptime / 3600, 2),
            'halted_symbols': list(self.active_halts.keys())
        }
    
    def get_halt_history(self, symbol: str = None, hours: int = 24) -> List[HaltEvent]:
        """Get halt history, optionally filtered by symbol and time"""
        cutoff_time = time.time() - (hours * 3600)
        
        filtered_halts = []
        for halt in self.halt_history:
            if halt.trigger_time >= cutoff_time:
                if symbol is None or halt.symbol == symbol:
                    filtered_halts.append(halt)
        
        return filtered_halts

def create_standard_circuit_breakers() -> CircuitBreakerSystem:
    """Create a standard set of circuit breaker rules"""
    system = CircuitBreakerSystem()
    
    # Market-wide circuit breakers (like NYSE)
    system.add_rule(CircuitBreakerRule(
        rule_id="market_wide_level_1",
        break_type=BreakType.MARKET_WIDE,
        symbol=None,
        price_threshold_pct=-7.0,  # 7% decline
        price_window_seconds=300,   # 5 minutes
        halt_duration_seconds=900,  # 15 minutes
        max_triggers_per_day=1
    ))
    
    system.add_rule(CircuitBreakerRule(
        rule_id="market_wide_level_2",
        break_type=BreakType.MARKET_WIDE,
        symbol=None,
        price_threshold_pct=-13.0,  # 13% decline
        price_window_seconds=300,
        halt_duration_seconds=900,
        max_triggers_per_day=1
    ))
    
    system.add_rule(CircuitBreakerRule(
        rule_id="market_wide_level_3",
        break_type=BreakType.MARKET_WIDE,
        symbol=None,
        price_threshold_pct=-20.0,  # 20% decline
        price_window_seconds=300,
        halt_duration_seconds=86400,  # Halt until next day
        max_triggers_per_day=1
    ))
    
    # Individual stock circuit breakers
    system.add_rule(CircuitBreakerRule(
        rule_id="individual_stock_5pct",
        break_type=BreakType.PRICE_LIMIT,
        symbol=None,  # Applies to all symbols
        price_threshold_pct=5.0,    # 5% move in either direction
        price_window_seconds=300,   # 5 minutes
        halt_duration_seconds=300,  # 5 minute halt
        max_triggers_per_day=3
    ))
    
    # Volatility circuit breaker
    system.add_rule(CircuitBreakerRule(
        rule_id="high_volatility",
        break_type=BreakType.VOLATILITY,
        symbol=None,
        volatility_threshold=0.1,   # 10% volatility
        volatility_window=50,       # 50 data points
        halt_duration_seconds=600,  # 10 minutes
        max_triggers_per_day=2
    ))
    
    # Volume spike detection
    system.add_rule(CircuitBreakerRule(
        rule_id="volume_spike",
        break_type=BreakType.VOLUME_SPIKE,
        symbol=None,
        volume_multiplier=10.0,     # 10x normal volume
        volume_window_seconds=300,  # 5 minutes
        halt_duration_seconds=300,  # 5 minutes
        max_triggers_per_day=3
    ))
    
    # Error trade detection
    system.add_rule(CircuitBreakerRule(
        rule_id="error_trade_detection",
        break_type=BreakType.ERROR_TRADE,
        symbol=None,
        halt_duration_seconds=600,  # 10 minutes to investigate
        max_triggers_per_day=5
    ))
    
    return system

if __name__ == "__main__":
    # Demo
    async def demo():
        system = create_standard_circuit_breakers()
        
        # Simulate normal market data
        print("Simulating normal market conditions...")
        await system.process_market_data("BTC/USD", Decimal('50000'))
        await system.process_market_data("BTC/USD", Decimal('50100'))
        await system.process_market_data("BTC/USD", Decimal('50050'))
        
        # Simulate price spike that should trigger circuit breaker
        print("Simulating price spike...")
        await system.process_market_data("BTC/USD", Decimal('53000'))  # 6% jump
        
        # Check system status
        status = system.get_system_status()
        print(f"System status: {status}")
        
        # Check if trading is halted
        is_halted = system.is_trading_halted("BTC/USD")
        print(f"BTC/USD trading halted: {is_halted}")
        
        if is_halted:
            halt_status = system.get_halt_status("BTC/USD")
            print(f"Halt details: {halt_status}")
    
    asyncio.run(demo())
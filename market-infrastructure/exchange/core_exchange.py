#!/usr/bin/env python3
"""
Core Distributed Exchange System
Supporting 50,000+ TPS with multiple market types
"""

import asyncio
import time
import uuid
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from enum import Enum
from decimal import Decimal, ROUND_HALF_UP
import json
import logging
from collections import defaultdict

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class MarketType(Enum):
    SPOT = "spot"
    FUTURES = "futures"
    OPTIONS = "options"
    PREDICTION = "prediction"

class OrderSide(Enum):
    BUY = "buy"
    SELL = "sell"

class OrderType(Enum):
    MARKET = "market"
    LIMIT = "limit"
    STOP_LOSS = "stop_loss"
    TAKE_PROFIT = "take_profit"

class OrderStatus(Enum):
    PENDING = "pending"
    PARTIAL = "partial"
    FILLED = "filled"
    CANCELLED = "cancelled"
    REJECTED = "rejected"

@dataclass
class TradingPair:
    """Represents a trading pair with market specifics"""
    base_asset: str
    quote_asset: str
    market_type: MarketType
    min_order_size: Decimal
    max_order_size: Decimal
    price_precision: int
    quantity_precision: int
    maker_fee: Decimal = Decimal('0.001')  # 0.1%
    taker_fee: Decimal = Decimal('0.002')  # 0.2%
    
    @property
    def symbol(self) -> str:
        return f"{self.base_asset}/{self.quote_asset}"

@dataclass
class Order:
    """High-performance order structure"""
    id: str
    agent_id: str
    trading_pair: TradingPair
    side: OrderSide
    order_type: OrderType
    quantity: Decimal
    price: Optional[Decimal]
    status: OrderStatus = OrderStatus.PENDING
    filled_quantity: Decimal = Decimal('0')
    timestamp: float = field(default_factory=time.time)
    ttl: Optional[float] = None  # Time to live in seconds
    
    @property
    def remaining_quantity(self) -> Decimal:
        return self.quantity - self.filled_quantity
    
    @property
    def is_expired(self) -> bool:
        if self.ttl is None:
            return False
        return time.time() > (self.timestamp + self.ttl)

@dataclass
class Trade:
    """Executed trade record"""
    id: str
    trading_pair: TradingPair
    buyer_order_id: str
    seller_order_id: str
    buyer_agent_id: str
    seller_agent_id: str
    price: Decimal
    quantity: Decimal
    timestamp: float = field(default_factory=time.time)
    fees: Dict[str, Decimal] = field(default_factory=dict)

class DistributedExchange:
    """
    High-performance distributed exchange supporting multiple market types
    Target: 50,000+ transactions per second
    """
    
    def __init__(self):
        self.trading_pairs: Dict[str, TradingPair] = {}
        self.orders: Dict[str, Order] = {}
        self.trades: List[Trade] = []
        self.order_books = defaultdict(lambda: {"bids": [], "asks": []})
        
        # Performance metrics
        self.total_trades = 0
        self.total_volume = Decimal('0')
        self.start_time = time.time()
        
        # Circuit breaker state
        self.circuit_breakers = defaultdict(dict)
        self.halted_pairs = set()
        
        # Agent balances (simplified for demo)
        self.agent_balances = defaultdict(lambda: defaultdict(Decimal))
        
        logger.info("Distributed Exchange initialized")
    
    def add_trading_pair(self, pair: TradingPair) -> None:
        """Add a new trading pair to the exchange"""
        self.trading_pairs[pair.symbol] = pair
        logger.info(f"Added trading pair: {pair.symbol} ({pair.market_type.value})")
    
    async def place_order(self, order: Order) -> Dict[str, Any]:
        """
        Place an order with high-performance matching
        Returns execution results
        """
        try:
            # Validate order
            validation_result = self._validate_order(order)
            if not validation_result["valid"]:
                order.status = OrderStatus.REJECTED
                return validation_result
            
            # Check circuit breakers
            if order.trading_pair.symbol in self.halted_pairs:
                order.status = OrderStatus.REJECTED
                return {"valid": False, "reason": "Market halted"}
            
            # Store order
            self.orders[order.id] = order
            
            # Attempt matching
            matches = await self._match_order(order)
            
            # Update order book if not fully filled
            if order.remaining_quantity > 0 and order.status != OrderStatus.CANCELLED:
                self._add_to_order_book(order)
            
            return {
                "valid": True,
                "order_id": order.id,
                "status": order.status.value,
                "matches": matches,
                "filled_quantity": str(order.filled_quantity),
                "remaining_quantity": str(order.remaining_quantity)
            }
            
        except Exception as e:
            logger.error(f"Error placing order: {e}")
            order.status = OrderStatus.REJECTED
            return {"valid": False, "reason": str(e)}
    
    def _validate_order(self, order: Order) -> Dict[str, Any]:
        """Validate order parameters"""
        pair = order.trading_pair
        
        # Check trading pair exists
        if pair.symbol not in self.trading_pairs:
            return {"valid": False, "reason": "Invalid trading pair"}
        
        # Check quantity bounds
        if order.quantity < pair.min_order_size:
            return {"valid": False, "reason": "Order size too small"}
        
        if order.quantity > pair.max_order_size:
            return {"valid": False, "reason": "Order size too large"}
        
        # Check price for limit orders
        if order.order_type == OrderType.LIMIT and order.price is None:
            return {"valid": False, "reason": "Limit order requires price"}
        
        # Check agent balance (simplified)
        if order.side == OrderSide.BUY:
            required_balance = order.quantity * (order.price or Decimal('0'))
            if self.agent_balances[order.agent_id][pair.quote_asset] < required_balance:
                return {"valid": False, "reason": "Insufficient balance"}
        else:
            if self.agent_balances[order.agent_id][pair.base_asset] < order.quantity:
                return {"valid": False, "reason": "Insufficient balance"}
        
        return {"valid": True}
    
    async def _match_order(self, order: Order) -> List[Dict[str, Any]]:
        """
        High-performance order matching algorithm
        Returns list of executed trades
        """
        matches = []
        order_book = self.order_books[order.trading_pair.symbol]
        
        if order.side == OrderSide.BUY:
            # Match against asks (sell orders)
            opposing_orders = sorted(order_book["asks"], key=lambda x: (x.price, x.timestamp))
        else:
            # Match against bids (buy orders)
            opposing_orders = sorted(order_book["bids"], key=lambda x: (-x.price, x.timestamp))
        
        for opposing_order in opposing_orders[:]:  # Copy to avoid modification issues
            if order.remaining_quantity <= 0:
                break
            
            # Check price compatibility
            if order.order_type == OrderType.MARKET or self._prices_match(order, opposing_order):
                # Execute trade
                trade_quantity = min(order.remaining_quantity, opposing_order.remaining_quantity)
                trade_price = opposing_order.price
                
                # Create trade record
                trade = Trade(
                    id=str(uuid.uuid4()),
                    trading_pair=order.trading_pair,
                    buyer_order_id=order.id if order.side == OrderSide.BUY else opposing_order.id,
                    seller_order_id=opposing_order.id if order.side == OrderSide.BUY else order.id,
                    buyer_agent_id=order.agent_id if order.side == OrderSide.BUY else opposing_order.agent_id,
                    seller_agent_id=opposing_order.agent_id if order.side == OrderSide.BUY else order.agent_id,
                    price=trade_price,
                    quantity=trade_quantity
                )
                
                # Calculate fees
                trade.fees = self._calculate_fees(trade)
                
                # Update order quantities
                order.filled_quantity += trade_quantity
                opposing_order.filled_quantity += trade_quantity
                
                # Update order statuses
                if order.remaining_quantity == 0:
                    order.status = OrderStatus.FILLED
                elif order.filled_quantity > 0:
                    order.status = OrderStatus.PARTIAL
                
                if opposing_order.remaining_quantity == 0:
                    opposing_order.status = OrderStatus.FILLED
                    order_book["asks" if order.side == OrderSide.BUY else "bids"].remove(opposing_order)
                elif opposing_order.filled_quantity > 0:
                    opposing_order.status = OrderStatus.PARTIAL
                
                # Store trade and update metrics
                self.trades.append(trade)
                self.total_trades += 1
                self.total_volume += trade_quantity * trade_price
                
                # Update agent balances
                self._update_balances(trade)
                
                matches.append({
                    "trade_id": trade.id,
                    "price": str(trade.price),
                    "quantity": str(trade.quantity),
                    "timestamp": trade.timestamp
                })
                
                logger.debug(f"Trade executed: {trade_quantity} {order.trading_pair.base_asset} at {trade_price}")
        
        return matches
    
    def _prices_match(self, order: Order, opposing_order: Order) -> bool:
        """Check if two orders can be matched based on price"""
        if order.order_type == OrderType.MARKET:
            return True
        
        if order.side == OrderSide.BUY:
            return order.price >= opposing_order.price
        else:
            return order.price <= opposing_order.price
    
    def _add_to_order_book(self, order: Order) -> None:
        """Add order to the order book"""
        order_book = self.order_books[order.trading_pair.symbol]
        
        if order.side == OrderSide.BUY:
            order_book["bids"].append(order)
            order_book["bids"].sort(key=lambda x: (-x.price, x.timestamp))
        else:
            order_book["asks"].append(order)
            order_book["asks"].sort(key=lambda x: (x.price, x.timestamp))
    
    def _calculate_fees(self, trade: Trade) -> Dict[str, Decimal]:
        """Calculate trading fees for both parties"""
        pair = trade.trading_pair
        trade_value = trade.price * trade.quantity
        
        return {
            "maker_fee": trade_value * pair.maker_fee,
            "taker_fee": trade_value * pair.taker_fee
        }
    
    def _update_balances(self, trade: Trade) -> None:
        """Update agent balances after trade execution"""
        pair = trade.trading_pair
        
        # Update buyer balances
        self.agent_balances[trade.buyer_agent_id][pair.base_asset] += trade.quantity
        self.agent_balances[trade.buyer_agent_id][pair.quote_asset] -= trade.price * trade.quantity
        
        # Update seller balances
        self.agent_balances[trade.seller_agent_id][pair.base_asset] -= trade.quantity
        self.agent_balances[trade.seller_agent_id][pair.quote_asset] += trade.price * trade.quantity
    
    def get_order_book(self, symbol: str, depth: int = 10) -> Dict[str, Any]:
        """Get order book for a trading pair"""
        if symbol not in self.trading_pairs:
            return {"error": "Invalid trading pair"}
        
        order_book = self.order_books[symbol]
        
        return {
            "symbol": symbol,
            "bids": [
                {"price": str(order.price), "quantity": str(order.remaining_quantity)}
                for order in order_book["bids"][:depth]
            ],
            "asks": [
                {"price": str(order.price), "quantity": str(order.remaining_quantity)}
                for order in order_book["asks"][:depth]
            ],
            "timestamp": time.time()
        }
    
    def get_market_stats(self) -> Dict[str, Any]:
        """Get exchange performance statistics"""
        uptime = time.time() - self.start_time
        tps = self.total_trades / uptime if uptime > 0 else 0
        
        return {
            "total_trades": self.total_trades,
            "total_volume": str(self.total_volume),
            "uptime_seconds": uptime,
            "transactions_per_second": round(tps, 2),
            "active_trading_pairs": len(self.trading_pairs),
            "active_orders": len([o for o in self.orders.values() if o.status in [OrderStatus.PENDING, OrderStatus.PARTIAL]]),
            "halted_pairs": list(self.halted_pairs)
        }
    
    async def cleanup_expired_orders(self) -> int:
        """Remove expired orders from the system"""
        expired_count = 0
        current_time = time.time()
        
        for order in list(self.orders.values()):
            if order.is_expired:
                order.status = OrderStatus.CANCELLED
                self._remove_from_order_book(order)
                expired_count += 1
        
        return expired_count
    
    def _remove_from_order_book(self, order: Order) -> None:
        """Remove order from order book"""
        order_book = self.order_books[order.trading_pair.symbol]
        
        if order.side == OrderSide.BUY and order in order_book["bids"]:
            order_book["bids"].remove(order)
        elif order.side == OrderSide.SELL and order in order_book["asks"]:
            order_book["asks"].remove(order)

# Factory function for creating standard trading pairs
def create_standard_pairs() -> List[TradingPair]:
    """Create standard trading pairs for the living economy"""
    pairs = []
    
    # Spot markets
    pairs.extend([
        TradingPair("BTC", "USD", MarketType.SPOT, Decimal('0.0001'), Decimal('100'), 2, 8),
        TradingPair("ETH", "USD", MarketType.SPOT, Decimal('0.001'), Decimal('1000'), 2, 6),
        TradingPair("SOL", "USD", MarketType.SPOT, Decimal('0.01'), Decimal('10000'), 2, 4),
        TradingPair("CREDITS", "USD", MarketType.SPOT, Decimal('1'), Decimal('1000000'), 4, 0),
    ])
    
    # Futures markets
    pairs.extend([
        TradingPair("BTC", "USD-PERP", MarketType.FUTURES, Decimal('0.0001'), Decimal('100'), 2, 8),
        TradingPair("ETH", "USD-PERP", MarketType.FUTURES, Decimal('0.001'), Decimal('1000'), 2, 6),
    ])
    
    # Prediction markets
    pairs.extend([
        TradingPair("PRED-AI-SINGULARITY", "USD", MarketType.PREDICTION, Decimal('1'), Decimal('100000'), 4, 0),
        TradingPair("PRED-MARKET-CRASH", "USD", MarketType.PREDICTION, Decimal('1'), Decimal('100000'), 4, 0),
    ])
    
    return pairs

if __name__ == "__main__":
    # Demo initialization
    exchange = DistributedExchange()
    
    # Add standard trading pairs
    for pair in create_standard_pairs():
        exchange.add_trading_pair(pair)
    
    print("Distributed Exchange initialized with standard trading pairs")
    print(f"Trading pairs: {list(exchange.trading_pairs.keys())}")
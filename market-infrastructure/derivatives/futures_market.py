#!/usr/bin/env python3
"""
Advanced Futures Market Implementation
Phase 3: Sophisticated derivatives with realistic specifications and margin systems
"""

import asyncio
import time
import uuid
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from enum import Enum
from decimal import Decimal, ROUND_HALF_UP
import json
import logging
from datetime import datetime, timedelta
import math

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ContractType(Enum):
    COMMODITY = "commodity"
    FINANCIAL = "financial"
    CRYPTO = "crypto"
    ENERGY = "energy"
    WEATHER = "weather"
    VOLATILITY = "volatility"

class SettlementType(Enum):
    PHYSICAL = "physical"
    CASH = "cash"

@dataclass
class FuturesContract:
    """Realistic futures contract specifications"""
    symbol: str
    underlying: str
    contract_type: ContractType
    settlement_type: SettlementType
    contract_size: Decimal
    tick_size: Decimal
    min_price_increment: Decimal
    expiry_date: datetime
    settlement_date: datetime
    margin_requirement: Decimal
    maintenance_margin: Decimal
    daily_price_limit: Decimal
    contract_value: Decimal = field(default=Decimal('0'))
    open_interest: int = field(default=0)
    volume: int = field(default=0)
    settlement_price: Optional[Decimal] = None
    
    def __post_init__(self):
        """Calculate derived values"""
        self.contract_value = self.contract_size * self.tick_size

@dataclass
class MarginAccount:
    """Margin account for futures trading"""
    account_id: str
    initial_margin: Decimal = field(default=Decimal('0'))
    maintenance_margin: Decimal = field(default=Decimal('0'))
    variation_margin: Decimal = field(default=Decimal('0'))
    equity: Decimal = field(default=Decimal('0'))
    available_margin: Decimal = field(default=Decimal('0'))
    margin_calls: List[Dict] = field(default_factory=list)
    positions: Dict[str, Any] = field(default_factory=dict)

@dataclass
class FuturesPosition:
    """Futures position tracking"""
    contract_symbol: str
    quantity: int
    entry_price: Decimal
    current_price: Decimal
    unrealized_pnl: Decimal = field(default=Decimal('0'))
    realized_pnl: Decimal = field(default=Decimal('0'))
    margin_used: Decimal = field(default=Decimal('0'))
    timestamp: datetime = field(default_factory=datetime.now)

class FuturesMarket:
    """Advanced futures market with realistic contract specifications"""
    
    def __init__(self):
        self.contracts: Dict[str, FuturesContract] = {}
        self.margin_accounts: Dict[str, MarginAccount] = {}
        self.positions: Dict[str, Dict[str, FuturesPosition]] = {}
        self.daily_settlement_prices: Dict[str, Dict[str, Decimal]] = {}
        self.price_history: Dict[str, List[Tuple[datetime, Decimal]]] = {}
        self.open_interest_history: Dict[str, List[Tuple[datetime, int]]] = {}
        
        # Initialize standard contracts
        self._initialize_standard_contracts()
        
    def _initialize_standard_contracts(self):
        """Initialize standard futures contracts"""
        
        # Commodity futures
        contracts = [
            # Agricultural
            {
                'symbol': 'ZC-H24', 'underlying': 'CORN', 'contract_type': ContractType.COMMODITY,
                'settlement_type': SettlementType.PHYSICAL, 'contract_size': Decimal('5000'),
                'tick_size': Decimal('0.25'), 'min_price_increment': Decimal('0.25'),
                'expiry_date': datetime(2024, 3, 15), 'settlement_date': datetime(2024, 3, 20),
                'margin_requirement': Decimal('2000'), 'maintenance_margin': Decimal('1500'),
                'daily_price_limit': Decimal('50')
            },
            {
                'symbol': 'ZW-K24', 'underlying': 'WHEAT', 'contract_type': ContractType.COMMODITY,
                'settlement_type': SettlementType.PHYSICAL, 'contract_size': Decimal('5000'),
                'tick_size': Decimal('0.25'), 'min_price_increment': Decimal('0.25'),
                'expiry_date': datetime(2024, 5, 15), 'settlement_date': datetime(2024, 5, 20),
                'margin_requirement': Decimal('2500'), 'maintenance_margin': Decimal('2000'),
                'daily_price_limit': Decimal('60')
            },
            
            # Energy
            {
                'symbol': 'CL-M24', 'underlying': 'CRUDE_OIL', 'contract_type': ContractType.ENERGY,
                'settlement_type': SettlementType.PHYSICAL, 'contract_size': Decimal('1000'),
                'tick_size': Decimal('0.01'), 'min_price_increment': Decimal('0.01'),
                'expiry_date': datetime(2024, 6, 20), 'settlement_date': datetime(2024, 6, 25),
                'margin_requirement': Decimal('5000'), 'maintenance_margin': Decimal('4000'),
                'daily_price_limit': Decimal('10')
            },
            {
                'symbol': 'NG-N24', 'underlying': 'NATURAL_GAS', 'contract_type': ContractType.ENERGY,
                'settlement_type': SettlementType.PHYSICAL, 'contract_size': Decimal('10000'),
                'tick_size': Decimal('0.001'), 'min_price_increment': Decimal('0.001'),
                'expiry_date': datetime(2024, 7, 25), 'settlement_date': datetime(2024, 7, 30),
                'margin_requirement': Decimal('3000'), 'maintenance_margin': Decimal('2500'),
                'daily_price_limit': Decimal('2')
            },
            
            # Precious metals
            {
                'symbol': 'GC-Q24', 'underlying': 'GOLD', 'contract_type': ContractType.COMMODITY,
                'settlement_type': SettlementType.PHYSICAL, 'contract_size': Decimal('100'),
                'tick_size': Decimal('0.10'), 'min_price_increment': Decimal('0.10'),
                'expiry_date': datetime(2024, 8, 26), 'settlement_date': datetime(2024, 8, 30),
                'margin_requirement': Decimal('8000'), 'maintenance_margin': Decimal('6500'),
                'daily_price_limit': Decimal('100')
            },
            
            # Financial futures
            {
                'symbol': 'ES-U24', 'underlying': 'SP500', 'contract_type': ContractType.FINANCIAL,
                'settlement_type': SettlementType.CASH, 'contract_size': Decimal('50'),
                'tick_size': Decimal('0.25'), 'min_price_increment': Decimal('0.25'),
                'expiry_date': datetime(2024, 9, 15), 'settlement_date': datetime(2024, 9, 15),
                'margin_requirement': Decimal('15000'), 'maintenance_margin': Decimal('12000'),
                'daily_price_limit': Decimal('200')
            },
            
            # Cryptocurrency futures
            {
                'symbol': 'BTC-Z24', 'underlying': 'BITCOIN', 'contract_type': ContractType.CRYPTO,
                'settlement_type': SettlementType.CASH, 'contract_size': Decimal('5'),
                'tick_size': Decimal('5'), 'min_price_increment': Decimal('5'),
                'expiry_date': datetime(2024, 12, 29), 'settlement_date': datetime(2024, 12, 29),
                'margin_requirement': Decimal('25000'), 'maintenance_margin': Decimal('20000'),
                'daily_price_limit': Decimal('5000')
            },
            
            # Weather derivatives
            {
                'symbol': 'HDD-F25', 'underlying': 'HEATING_DEGREE_DAYS', 'contract_type': ContractType.WEATHER,
                'settlement_type': SettlementType.CASH, 'contract_size': Decimal('20'),
                'tick_size': Decimal('1'), 'min_price_increment': Decimal('1'),
                'expiry_date': datetime(2025, 1, 31), 'settlement_date': datetime(2025, 2, 5),
                'margin_requirement': Decimal('1000'), 'maintenance_margin': Decimal('800'),
                'daily_price_limit': Decimal('50')
            },
            
            # Volatility futures
            {
                'symbol': 'VX-G25', 'underlying': 'VIX', 'contract_type': ContractType.VOLATILITY,
                'settlement_type': SettlementType.CASH, 'contract_size': Decimal('1000'),
                'tick_size': Decimal('0.05'), 'min_price_increment': Decimal('0.05'),
                'expiry_date': datetime(2025, 2, 19), 'settlement_date': datetime(2025, 2, 21),
                'margin_requirement': Decimal('5000'), 'maintenance_margin': Decimal('4000'),
                'daily_price_limit': Decimal('20')
            }
        ]
        
        for contract_data in contracts:
            contract = FuturesContract(**contract_data)
            self.contracts[contract.symbol] = contract
            self.price_history[contract.symbol] = []
            self.open_interest_history[contract.symbol] = []
    
    async def place_futures_order(self, agent_id: str, contract_symbol: str, 
                                quantity: int, price: Optional[Decimal] = None,
                                order_type: str = "limit") -> Dict[str, Any]:
        """Place a futures order with margin requirements"""
        
        if contract_symbol not in self.contracts:
            return {"status": "error", "message": "Contract not found"}
        
        contract = self.contracts[contract_symbol]
        
        # Ensure margin account exists
        if agent_id not in self.margin_accounts:
            self.margin_accounts[agent_id] = MarginAccount(account_id=agent_id)
        
        margin_account = self.margin_accounts[agent_id]
        
        # Calculate required margin
        required_margin = abs(quantity) * contract.margin_requirement
        
        # Check available margin
        if required_margin > margin_account.available_margin:
            return {
                "status": "rejected", 
                "message": f"Insufficient margin. Required: {required_margin}, Available: {margin_account.available_margin}"
            }
        
        # Process the order
        order_id = str(uuid.uuid4())
        execution_price = price or self._get_current_price(contract_symbol)
        
        # Update position
        position_key = f"{agent_id}_{contract_symbol}"
        if position_key not in self.positions:
            self.positions[position_key] = {}
        
        if contract_symbol not in self.positions[position_key]:
            self.positions[position_key][contract_symbol] = FuturesPosition(
                contract_symbol=contract_symbol,
                quantity=0,
                entry_price=Decimal('0'),
                current_price=execution_price
            )
        
        position = self.positions[position_key][contract_symbol]
        
        # Update position quantity and weighted average price
        if position.quantity == 0:
            position.entry_price = execution_price
            position.quantity = quantity
        else:
            # Calculate weighted average for position additions
            if (position.quantity > 0 and quantity > 0) or (position.quantity < 0 and quantity < 0):
                total_value = (position.quantity * position.entry_price) + (quantity * execution_price)
                total_quantity = position.quantity + quantity
                position.entry_price = total_value / total_quantity if total_quantity != 0 else Decimal('0')
                position.quantity = total_quantity
            else:
                # Position reduction or reversal
                position.quantity += quantity
                if position.quantity == 0:
                    position.entry_price = Decimal('0')
        
        position.current_price = execution_price
        position.margin_used = abs(position.quantity) * contract.margin_requirement
        
        # Update margin account
        margin_account.available_margin -= required_margin
        margin_account.positions[contract_symbol] = position
        
        # Update contract statistics
        contract.volume += abs(quantity)
        contract.open_interest += quantity if quantity > 0 else 0
        
        # Record price history
        self.price_history[contract_symbol].append((datetime.now(), execution_price))
        
        logger.info(f"Futures order executed: {agent_id} {quantity} {contract_symbol} @ {execution_price}")
        
        return {
            "status": "filled",
            "order_id": order_id,
            "contract_symbol": contract_symbol,
            "quantity": quantity,
            "price": execution_price,
            "margin_used": required_margin,
            "position": {
                "quantity": position.quantity,
                "entry_price": position.entry_price,
                "unrealized_pnl": position.unrealized_pnl
            }
        }
    
    def _get_current_price(self, contract_symbol: str) -> Decimal:
        """Get current market price for contract"""
        # Simplified price generation - in real implementation, would come from order book
        if contract_symbol not in self.price_history or not self.price_history[contract_symbol]:
            # Base prices for different contract types
            base_prices = {
                'ZC-H24': Decimal('450.00'),  # Corn cents/bushel
                'ZW-K24': Decimal('550.00'),  # Wheat cents/bushel
                'CL-M24': Decimal('80.00'),   # Crude oil $/barrel
                'NG-N24': Decimal('3.50'),    # Natural gas $/MMBtu
                'GC-Q24': Decimal('2000.00'), # Gold $/oz
                'ES-U24': Decimal('4500.00'), # S&P 500 index points
                'BTC-Z24': Decimal('50000.00'), # Bitcoin $
                'HDD-F25': Decimal('1200.00'),  # Heating degree days
                'VX-G25': Decimal('20.00')     # VIX points
            }
            return base_prices.get(contract_symbol, Decimal('100.00'))
        
        # Get last price and add small random movement
        last_price = self.price_history[contract_symbol][-1][1]
        volatility = Decimal('0.02')  # 2% daily volatility
        random_factor = Decimal(str(0.98 + 0.04 * time.time() % 1))  # Pseudo-random
        return last_price * random_factor
    
    async def mark_to_market(self, agent_id: str) -> Dict[str, Any]:
        """Daily mark-to-market settlement"""
        
        if agent_id not in self.margin_accounts:
            return {"status": "error", "message": "No margin account found"}
        
        margin_account = self.margin_accounts[agent_id]
        total_variation_margin = Decimal('0')
        
        for contract_symbol, position in margin_account.positions.items():
            if position.quantity == 0:
                continue
            
            current_price = self._get_current_price(contract_symbol)
            contract = self.contracts[contract_symbol]
            
            # Calculate P&L since last settlement
            price_change = current_price - position.current_price
            pnl_change = position.quantity * price_change * contract.contract_size
            
            position.unrealized_pnl += pnl_change
            position.current_price = current_price
            
            # Variation margin calculation
            variation_margin = pnl_change
            total_variation_margin += variation_margin
            
            # Check for margin calls
            required_maintenance = abs(position.quantity) * contract.maintenance_margin
            position_equity = position.margin_used + position.unrealized_pnl
            
            if position_equity < required_maintenance:
                margin_call = {
                    "contract": contract_symbol,
                    "required": required_maintenance - position_equity,
                    "timestamp": datetime.now(),
                    "deadline": datetime.now() + timedelta(hours=1)
                }
                margin_account.margin_calls.append(margin_call)
        
        # Update account equity
        margin_account.variation_margin += total_variation_margin
        margin_account.equity = margin_account.initial_margin + margin_account.variation_margin
        margin_account.available_margin = margin_account.equity - sum(
            pos.margin_used for pos in margin_account.positions.values()
        )
        
        return {
            "status": "completed",
            "variation_margin": total_variation_margin,
            "account_equity": margin_account.equity,
            "available_margin": margin_account.available_margin,
            "margin_calls": len(margin_account.margin_calls)
        }
    
    def get_contract_specifications(self, contract_symbol: str) -> Optional[Dict[str, Any]]:
        """Get detailed contract specifications"""
        
        if contract_symbol not in self.contracts:
            return None
        
        contract = self.contracts[contract_symbol]
        return {
            "symbol": contract.symbol,
            "underlying": contract.underlying,
            "contract_type": contract.contract_type.value,
            "settlement_type": contract.settlement_type.value,
            "contract_size": str(contract.contract_size),
            "tick_size": str(contract.tick_size),
            "min_price_increment": str(contract.min_price_increment),
            "expiry_date": contract.expiry_date.isoformat(),
            "settlement_date": contract.settlement_date.isoformat(),
            "margin_requirement": str(contract.margin_requirement),
            "maintenance_margin": str(contract.maintenance_margin),
            "daily_price_limit": str(contract.daily_price_limit),
            "open_interest": contract.open_interest,
            "volume": contract.volume,
            "current_price": str(self._get_current_price(contract_symbol))
        }
    
    def get_margin_account_status(self, agent_id: str) -> Optional[Dict[str, Any]]:
        """Get margin account status"""
        
        if agent_id not in self.margin_accounts:
            return None
        
        account = self.margin_accounts[agent_id]
        
        return {
            "account_id": account.account_id,
            "initial_margin": str(account.initial_margin),
            "maintenance_margin": str(account.maintenance_margin),
            "variation_margin": str(account.variation_margin),
            "equity": str(account.equity),
            "available_margin": str(account.available_margin),
            "margin_calls": len(account.margin_calls),
            "positions": {
                symbol: {
                    "quantity": pos.quantity,
                    "entry_price": str(pos.entry_price),
                    "current_price": str(pos.current_price),
                    "unrealized_pnl": str(pos.unrealized_pnl),
                    "margin_used": str(pos.margin_used)
                }
                for symbol, pos in account.positions.items()
                if pos.quantity != 0
            }
        }
    
    async def daily_settlement(self) -> Dict[str, Any]:
        """Perform daily settlement for all contracts"""
        
        settlement_results = {}
        
        for contract_symbol, contract in self.contracts.items():
            # Calculate settlement price (typically volume-weighted average)
            current_price = self._get_current_price(contract_symbol)
            contract.settlement_price = current_price
            
            # Store daily settlement price
            today = datetime.now().date().isoformat()
            if contract_symbol not in self.daily_settlement_prices:
                self.daily_settlement_prices[contract_symbol] = {}
            
            self.daily_settlement_prices[contract_symbol][today] = current_price
            
            settlement_results[contract_symbol] = {
                "settlement_price": str(current_price),
                "volume": contract.volume,
                "open_interest": contract.open_interest
            }
            
            # Reset daily volume
            contract.volume = 0
        
        # Mark-to-market all margin accounts
        for agent_id in self.margin_accounts.keys():
            await self.mark_to_market(agent_id)
        
        logger.info("Daily settlement completed for all futures contracts")
        
        return {
            "status": "completed",
            "settlement_date": datetime.now().isoformat(),
            "contracts": settlement_results
        }
    
    def get_market_data(self, contract_symbol: str) -> Optional[Dict[str, Any]]:
        """Get comprehensive market data for a contract"""
        
        if contract_symbol not in self.contracts:
            return None
        
        contract = self.contracts[contract_symbol]
        current_price = self._get_current_price(contract_symbol)
        
        # Calculate price statistics
        price_data = [price for _, price in self.price_history[contract_symbol][-100:]]  # Last 100 prices
        
        if len(price_data) >= 2:
            high_24h = max(price_data)
            low_24h = min(price_data)
            change_24h = price_data[-1] - price_data[0] if len(price_data) > 1 else Decimal('0')
            volatility = self._calculate_volatility(price_data)
        else:
            high_24h = low_24h = current_price
            change_24h = Decimal('0')
            volatility = Decimal('0')
        
        return {
            "symbol": contract.symbol,
            "underlying": contract.underlying,
            "current_price": str(current_price),
            "settlement_price": str(contract.settlement_price) if contract.settlement_price else None,
            "high_24h": str(high_24h),
            "low_24h": str(low_24h),
            "change_24h": str(change_24h),
            "change_24h_percent": str((change_24h / current_price * 100).quantize(Decimal('0.01'))),
            "volume": contract.volume,
            "open_interest": contract.open_interest,
            "volatility": str(volatility),
            "margin_requirement": str(contract.margin_requirement),
            "expiry_date": contract.expiry_date.isoformat(),
            "days_to_expiry": (contract.expiry_date - datetime.now()).days
        }
    
    def _calculate_volatility(self, price_data: List[Decimal]) -> Decimal:
        """Calculate historical volatility"""
        if len(price_data) < 2:
            return Decimal('0')
        
        returns = []
        for i in range(1, len(price_data)):
            return_rate = (price_data[i] / price_data[i-1] - 1)
            returns.append(return_rate)
        
        if not returns:
            return Decimal('0')
        
        mean_return = sum(returns) / len(returns)
        variance = sum((r - mean_return) ** 2 for r in returns) / len(returns)
        volatility = variance.sqrt() * Decimal('252').sqrt()  # Annualized
        
        return volatility.quantize(Decimal('0.0001'))

# Example usage and testing
async def main():
    """Test the futures market implementation"""
    
    futures_market = FuturesMarket()
    
    print("=== Futures Market Implementation Test ===")
    
    # Test contract specifications
    print("\n1. Contract Specifications:")
    for symbol in ['ZC-H24', 'CL-M24', 'BTC-Z24']:
        specs = futures_market.get_contract_specifications(symbol)
        print(f"{symbol}: {specs['underlying']} - Margin: ${specs['margin_requirement']}")
    
    # Test order placement
    print("\n2. Placing Futures Orders:")
    
    # Agent 1 goes long corn
    result1 = await futures_market.place_futures_order("agent_001", "ZC-H24", 10, Decimal('455.00'))
    print(f"Agent 001 corn order: {result1['status']} - Position: {result1['position']['quantity']}")
    
    # Agent 2 goes short crude oil
    result2 = await futures_market.place_futures_order("agent_002", "CL-M24", -5, Decimal('79.50'))
    print(f"Agent 002 oil order: {result2['status']} - Position: {result2['position']['quantity']}")
    
    # Test margin accounts
    print("\n3. Margin Account Status:")
    margin_status = futures_market.get_margin_account_status("agent_001")
    if margin_status:
        print(f"Agent 001 equity: ${margin_status['equity']}, Available: ${margin_status['available_margin']}")
    
    # Test mark-to-market
    print("\n4. Mark-to-Market:")
    mtm_result = await futures_market.mark_to_market("agent_001")
    print(f"Agent 001 variation margin: ${mtm_result['variation_margin']}")
    
    # Test market data
    print("\n5. Market Data:")
    market_data = futures_market.get_market_data("ZC-H24")
    if market_data:
        print(f"Corn: ${market_data['current_price']} (24h: {market_data['change_24h_percent']}%)")
        print(f"Volume: {market_data['volume']}, Open Interest: {market_data['open_interest']}")
        print(f"Days to expiry: {market_data['days_to_expiry']}")
    
    # Test daily settlement
    print("\n6. Daily Settlement:")
    settlement = await futures_market.daily_settlement()
    print(f"Settlement completed: {settlement['status']}")
    print(f"Contracts settled: {len(settlement['contracts'])}")

if __name__ == "__main__":
    asyncio.run(main())
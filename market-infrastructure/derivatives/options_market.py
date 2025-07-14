#!/usr/bin/env python3
"""
Advanced Options Market Implementation
Phase 3: Options trading with Black-Scholes pricing and Greeks calculations
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

class OptionType(Enum):
    CALL = "call"
    PUT = "put"

class OptionStyle(Enum):
    EUROPEAN = "european"
    AMERICAN = "american"
    BERMUDAN = "bermudan"

class ExerciseStatus(Enum):
    OPEN = "open"
    EXERCISED = "exercised"
    EXPIRED = "expired"
    ASSIGNED = "assigned"

@dataclass
class OptionContract:
    """Comprehensive options contract specification"""
    symbol: str
    underlying: str
    option_type: OptionType
    strike_price: Decimal
    expiry_date: datetime
    option_style: OptionStyle
    contract_size: int = 100  # Number of shares per contract
    premium: Optional[Decimal] = None
    implied_volatility: Optional[Decimal] = None
    open_interest: int = 0
    volume: int = 0
    
    # Greeks (calculated dynamically)
    delta: Optional[Decimal] = None
    gamma: Optional[Decimal] = None
    theta: Optional[Decimal] = None
    vega: Optional[Decimal] = None
    rho: Optional[Decimal] = None

@dataclass
class Greeks:
    """Option Greeks for risk management"""
    delta: Decimal
    gamma: Decimal
    theta: Decimal
    vega: Decimal
    rho: Decimal

@dataclass
class OptionPosition:
    """Option position tracking"""
    contract_symbol: str
    quantity: int  # Positive = long, negative = short
    premium_paid: Decimal
    current_premium: Decimal
    unrealized_pnl: Decimal = field(default=Decimal('0'))
    realized_pnl: Decimal = field(default=Decimal('0'))
    exercise_status: ExerciseStatus = ExerciseStatus.OPEN
    timestamp: datetime = field(default_factory=datetime.now)

class BlackScholesCalculator:
    """Black-Scholes option pricing model with Greeks"""
    
    @staticmethod
    def _normal_cdf(x: float) -> float:
        """Cumulative distribution function for standard normal distribution"""
        return 0.5 * (1 + math.erf(x / math.sqrt(2)))
    
    @staticmethod
    def _normal_pdf(x: float) -> float:
        """Probability density function for standard normal distribution"""
        return math.exp(-0.5 * x * x) / math.sqrt(2 * math.pi)
    
    @classmethod
    def calculate_option_price(cls, S: Decimal, K: Decimal, T: Decimal, r: Decimal, 
                             sigma: Decimal, option_type: OptionType) -> Decimal:
        """
        Calculate Black-Scholes option price
        S: Current stock price
        K: Strike price
        T: Time to expiry (in years)
        r: Risk-free rate
        sigma: Volatility
        """
        
        # Convert to float for calculations
        S_f = float(S)
        K_f = float(K)
        T_f = float(T)
        r_f = float(r)
        sigma_f = float(sigma)
        
        if T_f <= 0:
            # Option has expired
            if option_type == OptionType.CALL:
                return max(S - K, Decimal('0'))
            else:
                return max(K - S, Decimal('0'))
        
        # Calculate d1 and d2
        d1 = (math.log(S_f / K_f) + (r_f + 0.5 * sigma_f * sigma_f) * T_f) / (sigma_f * math.sqrt(T_f))
        d2 = d1 - sigma_f * math.sqrt(T_f)
        
        if option_type == OptionType.CALL:
            price = S_f * cls._normal_cdf(d1) - K_f * math.exp(-r_f * T_f) * cls._normal_cdf(d2)
        else:  # PUT
            price = K_f * math.exp(-r_f * T_f) * cls._normal_cdf(-d2) - S_f * cls._normal_cdf(-d1)
        
        return Decimal(str(max(price, 0.01)))  # Minimum price of $0.01
    
    @classmethod
    def calculate_greeks(cls, S: Decimal, K: Decimal, T: Decimal, r: Decimal, 
                        sigma: Decimal, option_type: OptionType) -> Greeks:
        """Calculate option Greeks"""
        
        # Convert to float for calculations
        S_f = float(S)
        K_f = float(K)
        T_f = float(T)
        r_f = float(r)
        sigma_f = float(sigma)
        
        if T_f <= 0:
            # Option has expired
            return Greeks(
                delta=Decimal('0'),
                gamma=Decimal('0'),
                theta=Decimal('0'),
                vega=Decimal('0'),
                rho=Decimal('0')
            )
        
        # Calculate d1 and d2
        d1 = (math.log(S_f / K_f) + (r_f + 0.5 * sigma_f * sigma_f) * T_f) / (sigma_f * math.sqrt(T_f))
        d2 = d1 - sigma_f * math.sqrt(T_f)
        
        # Delta
        if option_type == OptionType.CALL:
            delta = cls._normal_cdf(d1)
        else:
            delta = cls._normal_cdf(d1) - 1
        
        # Gamma (same for calls and puts)
        gamma = cls._normal_pdf(d1) / (S_f * sigma_f * math.sqrt(T_f))
        
        # Theta
        theta_part1 = -(S_f * cls._normal_pdf(d1) * sigma_f) / (2 * math.sqrt(T_f))
        if option_type == OptionType.CALL:
            theta_part2 = -r_f * K_f * math.exp(-r_f * T_f) * cls._normal_cdf(d2)
            theta = (theta_part1 + theta_part2) / 365  # Per day
        else:
            theta_part2 = r_f * K_f * math.exp(-r_f * T_f) * cls._normal_cdf(-d2)
            theta = (theta_part1 + theta_part2) / 365  # Per day
        
        # Vega (same for calls and puts)
        vega = S_f * cls._normal_pdf(d1) * math.sqrt(T_f) / 100  # Per 1% volatility change
        
        # Rho
        if option_type == OptionType.CALL:
            rho = K_f * T_f * math.exp(-r_f * T_f) * cls._normal_cdf(d2) / 100
        else:
            rho = -K_f * T_f * math.exp(-r_f * T_f) * cls._normal_cdf(-d2) / 100
        
        return Greeks(
            delta=Decimal(str(delta)).quantize(Decimal('0.0001')),
            gamma=Decimal(str(gamma)).quantize(Decimal('0.0001')),
            theta=Decimal(str(theta)).quantize(Decimal('0.01')),
            vega=Decimal(str(vega)).quantize(Decimal('0.01')),
            rho=Decimal(str(rho)).quantize(Decimal('0.01'))
        )

class OptionsMarket:
    """Advanced options market with Black-Scholes pricing and Greeks"""
    
    def __init__(self):
        self.contracts: Dict[str, OptionContract] = {}
        self.positions: Dict[str, Dict[str, OptionPosition]] = {}
        self.underlying_prices: Dict[str, Decimal] = {}
        self.risk_free_rate: Decimal = Decimal('0.05')  # 5% risk-free rate
        self.dividend_yields: Dict[str, Decimal] = {}
        
        # Initialize standard option chains
        self._initialize_option_chains()
    
    def _initialize_option_chains(self):
        """Initialize standard option chains for major underlyings"""
        
        # Set underlying prices
        self.underlying_prices.update({
            'AAPL': Decimal('175.00'),
            'MSFT': Decimal('350.00'),
            'GOOGL': Decimal('140.00'),
            'TSLA': Decimal('250.00'),
            'SPY': Decimal('450.00'),
            'QQQ': Decimal('380.00'),
            'BTC': Decimal('50000.00'),
            'ETH': Decimal('3000.00')
        })
        
        # Initialize dividend yields
        self.dividend_yields.update({
            'AAPL': Decimal('0.005'),  # 0.5%
            'MSFT': Decimal('0.007'),  # 0.7%
            'GOOGL': Decimal('0.000'), # 0%
            'TSLA': Decimal('0.000'),  # 0%
            'SPY': Decimal('0.015'),   # 1.5%
            'QQQ': Decimal('0.006'),   # 0.6%
            'BTC': Decimal('0.000'),   # 0%
            'ETH': Decimal('0.000')    # 0%
        })
        
        # Create option chains for each underlying
        for underlying, price in self.underlying_prices.items():
            self._create_option_chain(underlying, price)
    
    def _create_option_chain(self, underlying: str, current_price: Decimal):
        """Create a comprehensive option chain for an underlying"""
        
        # Expiry dates (weekly and monthly)
        expiry_dates = []
        
        # Weekly expiries for next 4 weeks
        for weeks in range(1, 5):
            friday = datetime.now() + timedelta(weeks=weeks)
            # Adjust to Friday (weekday 4)
            friday = friday + timedelta(days=(4 - friday.weekday()) % 7)
            expiry_dates.append(friday)
        
        # Monthly expiries for next 6 months
        for months in range(1, 7):
            third_friday = datetime.now().replace(day=1) + timedelta(days=32*months)
            third_friday = third_friday.replace(day=1)
            # Find third Friday
            first_friday = third_friday + timedelta(days=(4 - third_friday.weekday()) % 7)
            third_friday = first_friday + timedelta(days=14)
            expiry_dates.append(third_friday)
        
        # Strike prices (ITM, ATM, OTM)
        strike_interval = max(Decimal('5'), current_price * Decimal('0.025'))  # 2.5% or $5 minimum
        strikes = []
        
        # Generate strikes from 70% to 130% of current price
        for multiplier in [0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3]:
            strike = (current_price * Decimal(str(multiplier))).quantize(strike_interval)
            strikes.append(strike)
        
        # Create contracts for each combination
        for expiry in expiry_dates:
            for strike in strikes:
                for option_type in [OptionType.CALL, OptionType.PUT]:
                    # Generate option symbol
                    expiry_str = expiry.strftime("%y%m%d")
                    strike_str = f"{int(strike * 1000):08d}"  # Strike in cents, 8 digits
                    type_char = "C" if option_type == OptionType.CALL else "P"
                    symbol = f"{underlying}{expiry_str}{type_char}{strike_str}"
                    
                    contract = OptionContract(
                        symbol=symbol,
                        underlying=underlying,
                        option_type=option_type,
                        strike_price=strike,
                        expiry_date=expiry,
                        option_style=OptionStyle.AMERICAN
                    )
                    
                    # Calculate initial pricing and Greeks
                    self._update_option_pricing(contract)
                    
                    self.contracts[symbol] = contract
    
    def _update_option_pricing(self, contract: OptionContract):
        """Update option pricing and Greeks using Black-Scholes"""
        
        underlying_price = self.underlying_prices.get(contract.underlying, Decimal('100'))
        time_to_expiry = self._calculate_time_to_expiry(contract.expiry_date)
        
        # Estimate implied volatility based on underlying
        volatility_map = {
            'AAPL': Decimal('0.25'),   # 25%
            'MSFT': Decimal('0.22'),   # 22%
            'GOOGL': Decimal('0.28'),  # 28%
            'TSLA': Decimal('0.45'),   # 45%
            'SPY': Decimal('0.18'),    # 18%
            'QQQ': Decimal('0.20'),    # 20%
            'BTC': Decimal('0.80'),    # 80%
            'ETH': Decimal('0.75')     # 75%
        }
        
        implied_vol = volatility_map.get(contract.underlying, Decimal('0.25'))
        
        # Adjust volatility based on moneyness and time to expiry
        moneyness = underlying_price / contract.strike_price
        if contract.option_type == OptionType.PUT:
            moneyness = contract.strike_price / underlying_price
        
        # Volatility smile - higher vol for OTM options
        if moneyness < Decimal('0.95'):
            implied_vol *= Decimal('1.2')  # 20% higher for OTM
        elif moneyness > Decimal('1.05'):
            implied_vol *= Decimal('1.1')  # 10% higher for ITM
        
        # Calculate premium and Greeks
        premium = BlackScholesCalculator.calculate_option_price(
            underlying_price, contract.strike_price, time_to_expiry,
            self.risk_free_rate, implied_vol, contract.option_type
        )
        
        greeks = BlackScholesCalculator.calculate_greeks(
            underlying_price, contract.strike_price, time_to_expiry,
            self.risk_free_rate, implied_vol, contract.option_type
        )
        
        # Update contract
        contract.premium = premium
        contract.implied_volatility = implied_vol
        contract.delta = greeks.delta
        contract.gamma = greeks.gamma
        contract.theta = greeks.theta
        contract.vega = greeks.vega
        contract.rho = greeks.rho
    
    def _calculate_time_to_expiry(self, expiry_date: datetime) -> Decimal:
        """Calculate time to expiry in years"""
        time_diff = expiry_date - datetime.now()
        days_to_expiry = time_diff.total_seconds() / (24 * 3600)
        return Decimal(str(max(days_to_expiry / 365.25, 0.001)))  # Minimum 8.76 hours
    
    async def place_option_order(self, agent_id: str, contract_symbol: str,
                               quantity: int, premium: Optional[Decimal] = None,
                               order_type: str = "limit") -> Dict[str, Any]:
        """Place an options order"""
        
        if contract_symbol not in self.contracts:
            return {"status": "error", "message": "Option contract not found"}
        
        contract = self.contracts[contract_symbol]
        
        # Update pricing before execution
        self._update_option_pricing(contract)
        
        execution_premium = premium or contract.premium
        
        # Calculate total cost/credit
        total_cost = execution_premium * abs(quantity) * contract.contract_size
        
        # Create position
        order_id = str(uuid.uuid4())
        
        if agent_id not in self.positions:
            self.positions[agent_id] = {}
        
        if contract_symbol not in self.positions[agent_id]:
            self.positions[agent_id][contract_symbol] = OptionPosition(
                contract_symbol=contract_symbol,
                quantity=0,
                premium_paid=Decimal('0'),
                current_premium=execution_premium
            )
        
        position = self.positions[agent_id][contract_symbol]
        
        # Update position
        if position.quantity == 0:
            position.premium_paid = execution_premium
            position.quantity = quantity
        else:
            # Calculate weighted average premium for position additions
            if (position.quantity > 0 and quantity > 0) or (position.quantity < 0 and quantity < 0):
                total_premium_paid = (position.quantity * position.premium_paid) + (quantity * execution_premium)
                total_quantity = position.quantity + quantity
                position.premium_paid = total_premium_paid / total_quantity if total_quantity != 0 else Decimal('0')
                position.quantity = total_quantity
            else:
                # Position reduction or reversal
                position.quantity += quantity
                if position.quantity == 0:
                    position.premium_paid = Decimal('0')
        
        position.current_premium = execution_premium
        position.unrealized_pnl = (position.current_premium - position.premium_paid) * position.quantity * contract.contract_size
        
        # Update contract statistics
        contract.volume += abs(quantity)
        contract.open_interest += quantity if quantity > 0 else 0
        
        logger.info(f"Option order executed: {agent_id} {quantity} {contract_symbol} @ ${execution_premium}")
        
        return {
            "status": "filled",
            "order_id": order_id,
            "contract_symbol": contract_symbol,
            "quantity": quantity,
            "premium": execution_premium,
            "total_cost": total_cost,
            "position": {
                "quantity": position.quantity,
                "avg_premium": position.premium_paid,
                "unrealized_pnl": position.unrealized_pnl
            }
        }
    
    async def exercise_option(self, agent_id: str, contract_symbol: str,
                            quantity: int) -> Dict[str, Any]:
        """Exercise an option position"""
        
        if agent_id not in self.positions or contract_symbol not in self.positions[agent_id]:
            return {"status": "error", "message": "No position found"}
        
        position = self.positions[agent_id][contract_symbol]
        contract = self.contracts[contract_symbol]
        
        if position.quantity <= 0:
            return {"status": "error", "message": "Cannot exercise short positions"}
        
        if quantity > position.quantity:
            return {"status": "error", "message": "Insufficient long position"}
        
        # Check if option is in-the-money
        underlying_price = self.underlying_prices[contract.underlying]
        
        if contract.option_type == OptionType.CALL:
            itm = underlying_price > contract.strike_price
            intrinsic_value = max(underlying_price - contract.strike_price, Decimal('0'))
        else:  # PUT
            itm = underlying_price < contract.strike_price
            intrinsic_value = max(contract.strike_price - underlying_price, Decimal('0'))
        
        if not itm:
            return {"status": "warning", "message": "Option is out-of-the-money"}
        
        # Calculate exercise value
        exercise_value = intrinsic_value * quantity * contract.contract_size
        
        # Update position
        position.quantity -= quantity
        position.exercise_status = ExerciseStatus.EXERCISED
        
        # Calculate realized P&L
        cost_basis = position.premium_paid * quantity * contract.contract_size
        realized_pnl = exercise_value - cost_basis
        position.realized_pnl += realized_pnl
        
        logger.info(f"Option exercised: {agent_id} {quantity} {contract_symbol} - P&L: ${realized_pnl}")
        
        return {
            "status": "exercised",
            "quantity": quantity,
            "intrinsic_value": intrinsic_value,
            "exercise_value": exercise_value,
            "realized_pnl": realized_pnl,
            "remaining_position": position.quantity
        }
    
    def get_option_chain(self, underlying: str, expiry_date: Optional[datetime] = None) -> Dict[str, Any]:
        """Get option chain for an underlying"""
        
        chain = {"calls": [], "puts": []}
        
        for symbol, contract in self.contracts.items():
            if contract.underlying != underlying:
                continue
            
            if expiry_date and contract.expiry_date.date() != expiry_date.date():
                continue
            
            # Update pricing
            self._update_option_pricing(contract)
            
            option_data = {
                "symbol": symbol,
                "strike": str(contract.strike_price),
                "premium": str(contract.premium),
                "bid": str(contract.premium * Decimal('0.98')),  # Simplified bid
                "ask": str(contract.premium * Decimal('1.02')),  # Simplified ask
                "volume": contract.volume,
                "open_interest": contract.open_interest,
                "implied_volatility": str(contract.implied_volatility),
                "delta": str(contract.delta),
                "gamma": str(contract.gamma),
                "theta": str(contract.theta),
                "vega": str(contract.vega),
                "expiry": contract.expiry_date.isoformat(),
                "days_to_expiry": self._calculate_time_to_expiry(contract.expiry_date) * 365
            }
            
            if contract.option_type == OptionType.CALL:
                chain["calls"].append(option_data)
            else:
                chain["puts"].append(option_data)
        
        # Sort by strike price
        chain["calls"].sort(key=lambda x: float(x["strike"]))
        chain["puts"].sort(key=lambda x: float(x["strike"]))
        
        return {
            "underlying": underlying,
            "underlying_price": str(self.underlying_prices.get(underlying, Decimal('0'))),
            "chain": chain
        }
    
    def calculate_portfolio_greeks(self, agent_id: str) -> Dict[str, Decimal]:
        """Calculate portfolio-level Greeks for an agent"""
        
        if agent_id not in self.positions:
            return {
                "delta": Decimal('0'),
                "gamma": Decimal('0'),
                "theta": Decimal('0'),
                "vega": Decimal('0'),
                "rho": Decimal('0')
            }
        
        portfolio_greeks = {
            "delta": Decimal('0'),
            "gamma": Decimal('0'),
            "theta": Decimal('0'),
            "vega": Decimal('0'),
            "rho": Decimal('0')
        }
        
        for contract_symbol, position in self.positions[agent_id].items():
            if position.quantity == 0:
                continue
            
            contract = self.contracts[contract_symbol]
            self._update_option_pricing(contract)
            
            # Weight Greeks by position size
            multiplier = Decimal(str(position.quantity)) * contract.contract_size
            
            portfolio_greeks["delta"] += contract.delta * multiplier
            portfolio_greeks["gamma"] += contract.gamma * multiplier
            portfolio_greeks["theta"] += contract.theta * multiplier
            portfolio_greeks["vega"] += contract.vega * multiplier
            portfolio_greeks["rho"] += contract.rho * multiplier
        
        return portfolio_greeks
    
    def get_position_summary(self, agent_id: str) -> Dict[str, Any]:
        """Get comprehensive position summary for an agent"""
        
        if agent_id not in self.positions:
            return {"positions": [], "portfolio_value": "0", "portfolio_greeks": {}}
        
        positions = []
        total_value = Decimal('0')
        
        for contract_symbol, position in self.positions[agent_id].items():
            if position.quantity == 0:
                continue
            
            contract = self.contracts[contract_symbol]
            self._update_option_pricing(contract)
            
            position.current_premium = contract.premium
            position.unrealized_pnl = (position.current_premium - position.premium_paid) * position.quantity * contract.contract_size
            
            position_value = position.current_premium * position.quantity * contract.contract_size
            total_value += position_value
            
            positions.append({
                "symbol": contract_symbol,
                "underlying": contract.underlying,
                "option_type": contract.option_type.value,
                "strike": str(contract.strike_price),
                "expiry": contract.expiry_date.isoformat(),
                "quantity": position.quantity,
                "avg_premium": str(position.premium_paid),
                "current_premium": str(position.current_premium),
                "position_value": str(position_value),
                "unrealized_pnl": str(position.unrealized_pnl),
                "delta": str(contract.delta * position.quantity),
                "theta": str(contract.theta * position.quantity)
            })
        
        portfolio_greeks = self.calculate_portfolio_greeks(agent_id)
        
        return {
            "agent_id": agent_id,
            "positions": positions,
            "portfolio_value": str(total_value),
            "portfolio_greeks": {k: str(v) for k, v in portfolio_greeks.items()}
        }

# Example usage and testing
async def main():
    """Test the options market implementation"""
    
    options_market = OptionsMarket()
    
    print("=== Options Market Implementation Test ===")
    
    # Test option chain
    print("\n1. AAPL Option Chain (Next Friday):")
    next_friday = datetime.now() + timedelta(days=(4 - datetime.now().weekday()) % 7 + 7)
    chain = options_market.get_option_chain("AAPL", next_friday)
    
    print(f"AAPL @ ${chain['underlying_price']}")
    print("Calls:")
    for call in chain['chain']['calls'][:5]:  # First 5 calls
        print(f"  Strike ${call['strike']}: Premium ${call['premium']} (Δ{call['delta']}, θ{call['theta']})")
    
    # Test option orders
    print("\n2. Placing Option Orders:")
    
    # Agent 1 buys AAPL calls
    result1 = await options_market.place_option_order("agent_001", chain['chain']['calls'][2]['symbol'], 5)
    print(f"Agent 001 call purchase: {result1['status']} - Cost: ${result1['total_cost']}")
    
    # Agent 2 sells TSLA puts
    tsla_chain = options_market.get_option_chain("TSLA")
    result2 = await options_market.place_option_order("agent_002", tsla_chain['chain']['puts'][3]['symbol'], -2)
    print(f"Agent 002 put sale: {result2['status']} - Credit: ${result2['total_cost']}")
    
    # Test portfolio Greeks
    print("\n3. Portfolio Greeks:")
    greeks = options_market.calculate_portfolio_greeks("agent_001")
    print(f"Agent 001 - Delta: {greeks['delta']}, Theta: {greeks['theta']}, Vega: {greeks['vega']}")
    
    # Test position summary
    print("\n4. Position Summary:")
    summary = options_market.get_position_summary("agent_001")
    print(f"Portfolio Value: ${summary['portfolio_value']}")
    for pos in summary['positions']:
        print(f"  {pos['symbol']}: {pos['quantity']} contracts, P&L: ${pos['unrealized_pnl']}")
    
    # Test option exercise
    print("\n5. Option Exercise:")
    # Simulate price movement to make option ITM
    options_market.underlying_prices["AAPL"] = Decimal("185.00")  # Move price up
    exercise_result = await options_market.exercise_option("agent_001", result1['contract_symbol'], 1)
    print(f"Exercise result: {exercise_result['status']} - Realized P&L: ${exercise_result.get('realized_pnl', 'N/A')}")

if __name__ == "__main__":
    asyncio.run(main())
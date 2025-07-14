#!/usr/bin/env python3
"""
Advanced Swaps Market Implementation
Phase 3: Interest rate swaps, currency swaps, and credit derivatives
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

class SwapType(Enum):
    INTEREST_RATE = "interest_rate"
    CURRENCY = "currency"
    CREDIT_DEFAULT = "credit_default"
    COMMODITY = "commodity"
    EQUITY = "equity"
    VARIANCE = "variance"
    TOTAL_RETURN = "total_return"

class PaymentFrequency(Enum):
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"
    SEMI_ANNUAL = "semi_annual"
    ANNUAL = "annual"

class DayCountConvention(Enum):
    ACT_360 = "act_360"
    ACT_365 = "act_365"
    THIRTY_360 = "30_360"
    ACT_ACT = "act_act"

class SwapStatus(Enum):
    ACTIVE = "active"
    TERMINATED = "terminated"
    DEFAULTED = "defaulted"
    MATURED = "matured"

@dataclass
class SwapLeg:
    """Individual leg of a swap contract"""
    leg_id: str
    notional: Decimal
    currency: str
    rate_type: str  # "fixed", "floating", "index"
    rate: Optional[Decimal] = None  # For fixed rates
    spread: Decimal = field(default=Decimal('0'))
    reference_rate: Optional[str] = None  # e.g., "LIBOR", "SOFR", "EURIBOR"
    payment_frequency: PaymentFrequency = PaymentFrequency.QUARTERLY
    day_count: DayCountConvention = DayCountConvention.ACT_360
    payment_dates: List[datetime] = field(default_factory=list)

@dataclass
class SwapContract:
    """Comprehensive swap contract specification"""
    swap_id: str
    swap_type: SwapType
    counterparty_1: str
    counterparty_2: str
    start_date: datetime
    maturity_date: datetime
    leg_1: SwapLeg  # Payer leg
    leg_2: SwapLeg  # Receiver leg
    notional: Decimal
    currency: str
    status: SwapStatus = SwapStatus.ACTIVE
    
    # Valuation data
    fair_value: Decimal = field(default=Decimal('0'))
    pv01: Decimal = field(default=Decimal('0'))  # Price value of 1 basis point
    duration: Decimal = field(default=Decimal('0'))
    
    # Risk metrics
    credit_exposure: Decimal = field(default=Decimal('0'))
    collateral_posted: Decimal = field(default=Decimal('0'))
    
    # Payment tracking
    payment_history: List[Dict] = field(default_factory=list)
    accrued_interest: Dict[str, Decimal] = field(default_factory=dict)

@dataclass
class CreditDefaultSwap:
    """Credit Default Swap specific implementation"""
    cds_id: str
    reference_entity: str
    protection_buyer: str
    protection_seller: str
    notional: Decimal
    spread: Decimal  # CDS spread in basis points
    start_date: datetime
    maturity_date: datetime
    recovery_rate: Decimal = Decimal('0.40')  # 40% typical recovery
    probability_of_default: Decimal = Decimal('0.02')  # 2% annual
    upfront_payment: Decimal = field(default=Decimal('0'))
    status: SwapStatus = SwapStatus.ACTIVE

class InterestRateSwap:
    """Interest Rate Swap implementation with realistic curve management"""
    
    def __init__(self):
        self.yield_curves: Dict[str, Dict[str, Decimal]] = {}
        self.reference_rates: Dict[str, Decimal] = {}
        self.swap_contracts: Dict[str, SwapContract] = {}
        
        # Initialize yield curves and reference rates
        self._initialize_market_data()
    
    def _initialize_market_data(self):
        """Initialize realistic market data"""
        
        # US Dollar yield curve (example rates)
        self.yield_curves["USD"] = {
            "1M": Decimal("5.25"),
            "3M": Decimal("5.30"),
            "6M": Decimal("5.35"),
            "1Y": Decimal("5.20"),
            "2Y": Decimal("4.80"),
            "3Y": Decimal("4.50"),
            "5Y": Decimal("4.20"),
            "7Y": Decimal("4.10"),
            "10Y": Decimal("4.00"),
            "30Y": Decimal("3.90")
        }
        
        # Euro yield curve
        self.yield_curves["EUR"] = {
            "1M": Decimal("3.75"),
            "3M": Decimal("3.80"),
            "6M": Decimal("3.85"),
            "1Y": Decimal("3.70"),
            "2Y": Decimal("3.40"),
            "3Y": Decimal("3.20"),
            "5Y": Decimal("3.00"),
            "7Y": Decimal("2.90"),
            "10Y": Decimal("2.80"),
            "30Y": Decimal("2.70")
        }
        
        # Reference rates
        self.reference_rates = {
            "SOFR": Decimal("5.25"),      # Secured Overnight Financing Rate
            "LIBOR_3M": Decimal("5.30"),  # 3-month LIBOR (legacy)
            "EURIBOR_3M": Decimal("3.80"), # 3-month EURIBOR
            "SONIA": Decimal("5.20"),     # Sterling Overnight Index Average
            "ESTR": Decimal("3.75")       # Euro Short-term Rate
        }
    
    def create_interest_rate_swap(self, payer: str, receiver: str,
                                notional: Decimal, fixed_rate: Decimal,
                                floating_rate_ref: str, tenor_years: int,
                                currency: str = "USD") -> str:
        """Create a vanilla interest rate swap"""
        
        swap_id = str(uuid.uuid4())
        start_date = datetime.now()
        maturity_date = start_date + timedelta(days=365 * tenor_years)
        
        # Generate payment dates (quarterly)
        payment_dates = []
        current_date = start_date + timedelta(days=90)  # First payment in 3 months
        while current_date <= maturity_date:
            payment_dates.append(current_date)
            current_date += timedelta(days=90)
        
        # Fixed leg (payer pays fixed)
        fixed_leg = SwapLeg(
            leg_id=f"{swap_id}_fixed",
            notional=notional,
            currency=currency,
            rate_type="fixed",
            rate=fixed_rate,
            payment_frequency=PaymentFrequency.QUARTERLY,
            payment_dates=payment_dates.copy()
        )
        
        # Floating leg (payer receives floating)
        floating_leg = SwapLeg(
            leg_id=f"{swap_id}_floating",
            notional=notional,
            currency=currency,
            rate_type="floating",
            reference_rate=floating_rate_ref,
            payment_frequency=PaymentFrequency.QUARTERLY,
            payment_dates=payment_dates.copy()
        )
        
        swap = SwapContract(
            swap_id=swap_id,
            swap_type=SwapType.INTEREST_RATE,
            counterparty_1=payer,
            counterparty_2=receiver,
            start_date=start_date,
            maturity_date=maturity_date,
            leg_1=fixed_leg,
            leg_2=floating_leg,
            notional=notional,
            currency=currency
        )
        
        # Calculate initial fair value
        self._calculate_swap_valuation(swap)
        
        self.swap_contracts[swap_id] = swap
        
        logger.info(f"IRS created: {payer} pays {fixed_rate}% fixed, receives {floating_rate_ref} on ${notional}")
        
        return swap_id
    
    def _calculate_swap_valuation(self, swap: SwapContract):
        """Calculate fair value and risk metrics for swap"""
        
        # Simplified present value calculation
        fixed_leg_pv = Decimal('0')
        floating_leg_pv = Decimal('0')
        
        # Get discount factors from yield curve
        currency_curve = self.yield_curves.get(swap.currency, self.yield_curves["USD"])
        
        for payment_date in swap.leg_1.payment_dates:
            time_to_payment = (payment_date - datetime.now()).days / 365.25
            
            # Interpolate discount rate
            discount_rate = self._interpolate_rate(currency_curve, time_to_payment)
            discount_factor = (Decimal('1') + discount_rate / Decimal('100')) ** Decimal(str(-time_to_payment))
            
            # Fixed leg cash flow
            fixed_payment = swap.notional * swap.leg_1.rate / Decimal('100') * Decimal('0.25')  # Quarterly
            fixed_leg_pv += fixed_payment * discount_factor
            
            # Floating leg cash flow (projected)
            floating_rate = self.reference_rates.get(swap.leg_2.reference_rate, Decimal('5.0'))
            floating_payment = swap.notional * floating_rate / Decimal('100') * Decimal('0.25')
            floating_leg_pv += floating_payment * discount_factor
        
        # Fair value is difference between legs (from payer's perspective)
        swap.fair_value = floating_leg_pv - fixed_leg_pv
        
        # Calculate PV01 (price value of 1 basis point)
        swap.pv01 = swap.notional * Decimal('0.0001') * self._calculate_duration(swap)
        
        # Calculate modified duration
        swap.duration = self._calculate_duration(swap)
    
    def _interpolate_rate(self, curve: Dict[str, Decimal], time_years: float) -> Decimal:
        """Linear interpolation of yield curve rates"""
        
        # Convert time to string format for lookup
        if time_years <= 1/12:
            return curve["1M"]
        elif time_years <= 0.25:
            return curve["3M"]
        elif time_years <= 0.5:
            return curve["6M"]
        elif time_years <= 1:
            return curve["1Y"]
        elif time_years <= 2:
            return curve["2Y"]
        elif time_years <= 3:
            return curve["3Y"]
        elif time_years <= 5:
            return curve["5Y"]
        elif time_years <= 7:
            return curve["7Y"]
        elif time_years <= 10:
            return curve["10Y"]
        else:
            return curve["30Y"]
    
    def _calculate_duration(self, swap: SwapContract) -> Decimal:
        """Calculate modified duration of the swap"""
        time_to_maturity = (swap.maturity_date - datetime.now()).days / 365.25
        return Decimal(str(time_to_maturity * 0.8))  # Simplified duration calculation

class CurrencySwap:
    """Currency Swap implementation"""
    
    def __init__(self):
        self.fx_rates: Dict[str, Decimal] = {}
        self.swap_contracts: Dict[str, SwapContract] = {}
        
        # Initialize FX rates
        self._initialize_fx_rates()
    
    def _initialize_fx_rates(self):
        """Initialize currency exchange rates"""
        
        self.fx_rates = {
            "EUR/USD": Decimal("1.0850"),
            "GBP/USD": Decimal("1.2650"),
            "USD/JPY": Decimal("148.50"),
            "USD/CHF": Decimal("0.9120"),
            "AUD/USD": Decimal("0.6780"),
            "USD/CAD": Decimal("1.3420"),
            "NZD/USD": Decimal("0.6250")
        }
    
    def create_currency_swap(self, counterparty_1: str, counterparty_2: str,
                           notional_1: Decimal, currency_1: str,
                           notional_2: Decimal, currency_2: str,
                           tenor_years: int) -> str:
        """Create a currency swap"""
        
        swap_id = str(uuid.uuid4())
        start_date = datetime.now()
        maturity_date = start_date + timedelta(days=365 * tenor_years)
        
        # Generate payment dates
        payment_dates = []
        current_date = start_date + timedelta(days=90)
        while current_date <= maturity_date:
            payment_dates.append(current_date)
            current_date += timedelta(days=90)
        
        # Currency 1 leg
        leg_1 = SwapLeg(
            leg_id=f"{swap_id}_{currency_1}",
            notional=notional_1,
            currency=currency_1,
            rate_type="floating",
            reference_rate=f"{currency_1}_RATE",
            payment_dates=payment_dates.copy()
        )
        
        # Currency 2 leg
        leg_2 = SwapLeg(
            leg_id=f"{swap_id}_{currency_2}",
            notional=notional_2,
            currency=currency_2,
            rate_type="floating",
            reference_rate=f"{currency_2}_RATE",
            payment_dates=payment_dates.copy()
        )
        
        swap = SwapContract(
            swap_id=swap_id,
            swap_type=SwapType.CURRENCY,
            counterparty_1=counterparty_1,
            counterparty_2=counterparty_2,
            start_date=start_date,
            maturity_date=maturity_date,
            leg_1=leg_1,
            leg_2=leg_2,
            notional=notional_1,  # Base notional
            currency=currency_1
        )
        
        self.swap_contracts[swap_id] = swap
        
        logger.info(f"Currency swap created: {notional_1} {currency_1} vs {notional_2} {currency_2}")
        
        return swap_id

class CreditDefaultSwapMarket:
    """Credit Default Swap market implementation"""
    
    def __init__(self):
        self.cds_contracts: Dict[str, CreditDefaultSwap] = {}
        self.credit_spreads: Dict[str, Decimal] = {}
        self.default_probabilities: Dict[str, Decimal] = {}
        
        # Initialize credit market data
        self._initialize_credit_data()
    
    def _initialize_credit_data(self):
        """Initialize credit spreads and default probabilities"""
        
        # Credit spreads in basis points
        self.credit_spreads = {
            "AAPL": Decimal("25"),      # 25 bps - high quality
            "TSLA": Decimal("150"),     # 150 bps - medium quality
            "F": Decimal("300"),        # 300 bps - lower quality
            "GOVT_US": Decimal("0"),    # 0 bps - risk-free
            "HIGH_YIELD": Decimal("500"), # 500 bps - high yield
            "DISTRESSED": Decimal("1000") # 1000 bps - distressed
        }
        
        # Annual default probabilities
        self.default_probabilities = {
            "AAPL": Decimal("0.005"),   # 0.5%
            "TSLA": Decimal("0.020"),   # 2.0%
            "F": Decimal("0.050"),      # 5.0%
            "HIGH_YIELD": Decimal("0.080"), # 8.0%
            "DISTRESSED": Decimal("0.200")  # 20.0%
        }
    
    def create_credit_default_swap(self, protection_buyer: str, protection_seller: str,
                                 reference_entity: str, notional: Decimal,
                                 tenor_years: int) -> str:
        """Create a Credit Default Swap"""
        
        cds_id = str(uuid.uuid4())
        start_date = datetime.now()
        maturity_date = start_date + timedelta(days=365 * tenor_years)
        
        # Get market spread for reference entity
        spread = self.credit_spreads.get(reference_entity, Decimal("200"))  # Default 200 bps
        default_prob = self.default_probabilities.get(reference_entity, Decimal("0.02"))  # Default 2%
        
        # Calculate upfront payment if needed
        upfront = self._calculate_upfront_payment(spread, tenor_years, notional)
        
        cds = CreditDefaultSwap(
            cds_id=cds_id,
            reference_entity=reference_entity,
            protection_buyer=protection_buyer,
            protection_seller=protection_seller,
            notional=notional,
            spread=spread,
            start_date=start_date,
            maturity_date=maturity_date,
            probability_of_default=default_prob,
            upfront_payment=upfront
        )
        
        self.cds_contracts[cds_id] = cds
        
        logger.info(f"CDS created: {protection_buyer} buys protection on {reference_entity} - {spread} bps")
        
        return cds_id
    
    def _calculate_upfront_payment(self, spread: Decimal, tenor: int, notional: Decimal) -> Decimal:
        """Calculate upfront payment for CDS"""
        
        # Simplified calculation - typically would use more sophisticated pricing model
        standard_spread = Decimal("100")  # 100 bps standard
        spread_diff = spread - standard_spread
        
        # Upfront payment as percentage of notional
        upfront_pct = spread_diff * Decimal(str(tenor)) / Decimal("10000")
        
        return notional * upfront_pct

class SwapsMarket:
    """Comprehensive swaps market orchestrator"""
    
    def __init__(self):
        self.irs_market = InterestRateSwap()
        self.currency_market = CurrencySwap()
        self.cds_market = CreditDefaultSwapMarket()
        
        self.all_swaps: Dict[str, Any] = {}
        self.agent_positions: Dict[str, List[str]] = {}
    
    async def create_swap(self, swap_type: str, agent_id: str, **kwargs) -> Dict[str, Any]:
        """Create a swap contract"""
        
        if agent_id not in self.agent_positions:
            self.agent_positions[agent_id] = []
        
        try:
            if swap_type == "interest_rate":
                swap_id = self.irs_market.create_interest_rate_swap(**kwargs)
                swap = self.irs_market.swap_contracts[swap_id]
                
            elif swap_type == "currency":
                swap_id = self.currency_market.create_currency_swap(**kwargs)
                swap = self.currency_market.swap_contracts[swap_id]
                
            elif swap_type == "credit_default":
                swap_id = self.cds_market.create_credit_default_swap(**kwargs)
                swap = self.cds_market.cds_contracts[swap_id]
                
            else:
                return {"status": "error", "message": f"Unknown swap type: {swap_type}"}
            
            # Track position
            self.agent_positions[agent_id].append(swap_id)
            self.all_swaps[swap_id] = swap
            
            return {
                "status": "created",
                "swap_id": swap_id,
                "swap_type": swap_type,
                "details": self._get_swap_details(swap_id, swap_type)
            }
            
        except Exception as e:
            logger.error(f"Error creating swap: {e}")
            return {"status": "error", "message": str(e)}
    
    def _get_swap_details(self, swap_id: str, swap_type: str) -> Dict[str, Any]:
        """Get swap details for response"""
        
        if swap_type == "interest_rate":
            swap = self.irs_market.swap_contracts[swap_id]
            return {
                "notional": str(swap.notional),
                "currency": swap.currency,
                "fixed_rate": str(swap.leg_1.rate),
                "floating_rate": swap.leg_2.reference_rate,
                "maturity": swap.maturity_date.isoformat(),
                "fair_value": str(swap.fair_value),
                "pv01": str(swap.pv01)
            }
        elif swap_type == "currency":
            swap = self.currency_market.swap_contracts[swap_id]
            return {
                "leg_1_notional": str(swap.leg_1.notional),
                "leg_1_currency": swap.leg_1.currency,
                "leg_2_notional": str(swap.leg_2.notional),
                "leg_2_currency": swap.leg_2.currency,
                "maturity": swap.maturity_date.isoformat()
            }
        elif swap_type == "credit_default":
            cds = self.cds_market.cds_contracts[swap_id]
            return {
                "reference_entity": cds.reference_entity,
                "notional": str(cds.notional),
                "spread": str(cds.spread),
                "recovery_rate": str(cds.recovery_rate),
                "upfront_payment": str(cds.upfront_payment),
                "maturity": cds.maturity_date.isoformat()
            }
        
        return {}
    
    def get_agent_portfolio(self, agent_id: str) -> Dict[str, Any]:
        """Get agent's swap portfolio"""
        
        if agent_id not in self.agent_positions:
            return {"positions": [], "total_notional": "0", "portfolio_pv01": "0"}
        
        positions = []
        total_notional = Decimal('0')
        portfolio_pv01 = Decimal('0')
        
        for swap_id in self.agent_positions[agent_id]:
            swap = self.all_swaps.get(swap_id)
            if not swap:
                continue
            
            if hasattr(swap, 'notional'):
                total_notional += swap.notional
            
            if hasattr(swap, 'pv01'):
                portfolio_pv01 += swap.pv01
            
            # Determine swap type
            swap_type = "unknown"
            if swap_id in self.irs_market.swap_contracts:
                swap_type = "interest_rate"
            elif swap_id in self.currency_market.swap_contracts:
                swap_type = "currency"
            elif swap_id in self.cds_market.cds_contracts:
                swap_type = "credit_default"
            
            positions.append({
                "swap_id": swap_id,
                "swap_type": swap_type,
                "details": self._get_swap_details(swap_id, swap_type)
            })
        
        return {
            "agent_id": agent_id,
            "positions": positions,
            "total_notional": str(total_notional),
            "portfolio_pv01": str(portfolio_pv01),
            "position_count": len(positions)
        }
    
    def get_market_statistics(self) -> Dict[str, Any]:
        """Get overall swaps market statistics"""
        
        total_irs = len(self.irs_market.swap_contracts)
        total_currency = len(self.currency_market.swap_contracts)
        total_cds = len(self.cds_market.cds_contracts)
        
        # Calculate total notional
        total_notional = Decimal('0')
        for swap in self.irs_market.swap_contracts.values():
            total_notional += swap.notional
        for swap in self.currency_market.swap_contracts.values():
            total_notional += swap.notional
        for cds in self.cds_market.cds_contracts.values():
            total_notional += cds.notional
        
        return {
            "total_contracts": total_irs + total_currency + total_cds,
            "interest_rate_swaps": total_irs,
            "currency_swaps": total_currency,
            "credit_default_swaps": total_cds,
            "total_notional": str(total_notional),
            "active_participants": len(self.agent_positions)
        }

# Example usage and testing
async def main():
    """Test the swaps market implementation"""
    
    swaps_market = SwapsMarket()
    
    print("=== Swaps Market Implementation Test ===")
    
    # Test Interest Rate Swap
    print("\n1. Creating Interest Rate Swap:")
    irs_result = await swaps_market.create_swap(
        "interest_rate",
        "agent_001",
        payer="agent_001",
        receiver="market_maker_1",
        notional=Decimal("10000000"),  # $10M
        fixed_rate=Decimal("4.5"),     # 4.5%
        floating_rate_ref="SOFR",
        tenor_years=5,
        currency="USD"
    )
    print(f"IRS created: {irs_result['status']} - ID: {irs_result['swap_id']}")
    print(f"Fair Value: ${irs_result['details']['fair_value']}")
    
    # Test Currency Swap
    print("\n2. Creating Currency Swap:")
    fx_result = await swaps_market.create_swap(
        "currency",
        "agent_002",
        counterparty_1="agent_002",
        counterparty_2="market_maker_2",
        notional_1=Decimal("5000000"),  # $5M USD
        currency_1="USD",
        notional_2=Decimal("4300000"),  # €4.3M EUR
        currency_2="EUR",
        tenor_years=3
    )
    print(f"Currency swap created: {fx_result['status']} - ID: {fx_result['swap_id']}")
    
    # Test Credit Default Swap
    print("\n3. Creating Credit Default Swap:")
    cds_result = await swaps_market.create_swap(
        "credit_default",
        "agent_003",
        protection_buyer="agent_003",
        protection_seller="hedge_fund_1",
        reference_entity="TSLA",
        notional=Decimal("1000000"),   # $1M
        tenor_years=5
    )
    print(f"CDS created: {cds_result['status']} - ID: {cds_result['swap_id']}")
    print(f"Spread: {cds_result['details']['spread']} bps")
    
    # Test portfolio summary
    print("\n4. Agent Portfolio:")
    portfolio = swaps_market.get_agent_portfolio("agent_001")
    print(f"Agent 001 positions: {portfolio['position_count']}")
    print(f"Total notional: ${portfolio['total_notional']}")
    print(f"Portfolio PV01: ${portfolio['portfolio_pv01']}")
    
    # Test market statistics
    print("\n5. Market Statistics:")
    stats = swaps_market.get_market_statistics()
    print(f"Total contracts: {stats['total_contracts']}")
    print(f"IRS: {stats['interest_rate_swaps']}, FX: {stats['currency_swaps']}, CDS: {stats['credit_default_swaps']}")
    print(f"Total notional: ${stats['total_notional']}")
    print(f"Active participants: {stats['active_participants']}")

if __name__ == "__main__":
    asyncio.run(main())
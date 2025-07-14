#!/usr/bin/env python3
"""
Structured Products and Complex Financial Instruments
Phase 3: CDOs, synthetic products, structured notes, exotic derivatives
"""

import asyncio
import time
import uuid
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, field
from enum import Enum
from decimal import Decimal, ROUND_HALF_UP
import json
import logging
from datetime import datetime, timedelta
import math
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ProductType(Enum):
    CDO = "collateralized_debt_obligation"
    SYNTHETIC_CDO = "synthetic_cdo"
    STRUCTURED_NOTE = "structured_note"
    BARRIER_OPTION = "barrier_option"
    ASIAN_OPTION = "asian_option"
    LOOKBACK_OPTION = "lookback_option"
    DIGITAL_OPTION = "digital_option"
    VARIANCE_SWAP = "variance_swap"
    WEATHER_DERIVATIVE = "weather_derivative"
    CATASTROPHE_BOND = "catastrophe_bond"
    SYNTHETIC_ETF = "synthetic_etf"

class RiskLevel(Enum):
    CONSERVATIVE = "conservative"
    MODERATE = "moderate"
    AGGRESSIVE = "aggressive"
    SPECULATIVE = "speculative"

class CreditRating(Enum):
    AAA = "AAA"
    AA = "AA"
    A = "A"
    BBB = "BBB"
    BB = "BB"
    B = "B"
    CCC = "CCC"
    DEFAULT = "D"

@dataclass
class UnderlyingAsset:
    """Individual asset in a structured product"""
    asset_id: str
    asset_type: str
    weight: Decimal
    current_price: Decimal
    volatility: Decimal
    credit_rating: Optional[CreditRating] = None
    default_probability: Decimal = field(default=Decimal('0'))
    correlation_matrix: Dict[str, Decimal] = field(default_factory=dict)

@dataclass
class Tranche:
    """CDO/Structured product tranche"""
    tranche_id: str
    name: str
    attachment_point: Decimal  # Where losses start affecting this tranche
    detachment_point: Decimal  # Where tranche is wiped out
    coupon_rate: Decimal
    rating: CreditRating
    notional: Decimal
    outstanding: Decimal = field(default=None)
    losses: Decimal = field(default=Decimal('0'))
    
    def __post_init__(self):
        if self.outstanding is None:
            self.outstanding = self.notional

@dataclass
class StructuredProduct:
    """Base structured product class"""
    product_id: str
    product_type: ProductType
    issuer: str
    notional: Decimal
    issue_date: datetime
    maturity_date: datetime
    underlying_assets: List[UnderlyingAsset]
    tranches: List[Tranche] = field(default_factory=list)
    
    # Valuation
    current_value: Decimal = field(default=Decimal('0'))
    fair_value: Decimal = field(default=Decimal('0'))
    
    # Risk metrics
    delta: Decimal = field(default=Decimal('0'))
    gamma: Decimal = field(default=Decimal('0'))
    vega: Decimal = field(default=Decimal('0'))
    theta: Decimal = field(default=Decimal('0'))
    
    # Performance tracking
    returns: List[Decimal] = field(default_factory=list)
    volatility: Decimal = field(default=Decimal('0'))
    max_drawdown: Decimal = field(default=Decimal('0'))

class CDOEngine:
    """Collateralized Debt Obligation implementation"""
    
    def __init__(self):
        self.cdos: Dict[str, StructuredProduct] = {}
        self.correlation_matrix: Dict[Tuple[str, str], Decimal] = {}
        
        # Initialize default asset pool
        self._initialize_asset_pool()
    
    def _initialize_asset_pool(self):
        """Initialize diversified asset pool for CDO creation"""
        
        self.asset_pool = {
            # Corporate bonds
            "CORP_AAA_1": UnderlyingAsset("CORP_AAA_1", "corporate_bond", Decimal("0.05"), 
                                         Decimal("100"), Decimal("0.05"), CreditRating.AAA, Decimal("0.001")),
            "CORP_A_1": UnderlyingAsset("CORP_A_1", "corporate_bond", Decimal("0.08"), 
                                       Decimal("98"), Decimal("0.12"), CreditRating.A, Decimal("0.010")),
            "CORP_BBB_1": UnderlyingAsset("CORP_BBB_1", "corporate_bond", Decimal("0.10"), 
                                         Decimal("95"), Decimal("0.18"), CreditRating.BBB, Decimal("0.025")),
            
            # Mortgage-backed securities
            "MBS_PRIME": UnderlyingAsset("MBS_PRIME", "mortgage", Decimal("0.15"), 
                                        Decimal("102"), Decimal("0.08"), CreditRating.AA, Decimal("0.005")),
            "MBS_SUBPRIME": UnderlyingAsset("MBS_SUBPRIME", "mortgage", Decimal("0.20"), 
                                           Decimal("85"), Decimal("0.25"), CreditRating.BB, Decimal("0.080")),
            
            # Asset-backed securities
            "ABS_AUTO": UnderlyingAsset("ABS_AUTO", "auto_loan", Decimal("0.12"), 
                                       Decimal("99"), Decimal("0.15"), CreditRating.A, Decimal("0.015")),
            "ABS_CREDIT": UnderlyingAsset("ABS_CREDIT", "credit_card", Decimal("0.18"), 
                                         Decimal("96"), Decimal("0.22"), CreditRating.BBB, Decimal("0.035")),
            
            # Commercial real estate
            "CRE_OFFICE": UnderlyingAsset("CRE_OFFICE", "commercial_real_estate", Decimal("0.25"), 
                                         Decimal("110"), Decimal("0.20"), CreditRating.A, Decimal("0.020")),
            
            # High-yield bonds
            "HY_ENERGY": UnderlyingAsset("HY_ENERGY", "high_yield_bond", Decimal("0.35"), 
                                        Decimal("88"), Decimal("0.35"), CreditRating.B, Decimal("0.120")),
            "HY_RETAIL": UnderlyingAsset("HY_RETAIL", "high_yield_bond", Decimal("0.30"), 
                                        Decimal("92"), Decimal("0.28"), CreditRating.BB, Decimal("0.090"))
        }
        
        # Initialize correlation matrix
        assets = list(self.asset_pool.keys())
        for i, asset1 in enumerate(assets):
            for j, asset2 in enumerate(assets):
                if i <= j:
                    if i == j:
                        correlation = Decimal("1.0")
                    else:
                        # Higher correlation for similar asset types
                        type1 = self.asset_pool[asset1].asset_type
                        type2 = self.asset_pool[asset2].asset_type
                        
                        if type1 == type2:
                            correlation = Decimal("0.6") + Decimal(str(random.uniform(-0.2, 0.2)))
                        else:
                            correlation = Decimal("0.2") + Decimal(str(random.uniform(-0.1, 0.3)))
                    
                    self.correlation_matrix[(asset1, asset2)] = correlation
                    self.correlation_matrix[(asset2, asset1)] = correlation
    
    def create_cdo(self, issuer: str, selected_assets: List[str], 
                   total_notional: Decimal, tranche_structure: str = "standard") -> str:
        """Create a CDO with specified assets and tranche structure"""
        
        cdo_id = str(uuid.uuid4())
        issue_date = datetime.now()
        maturity_date = issue_date + timedelta(days=365 * 5)  # 5-year CDO
        
        # Select underlying assets
        underlying_assets = []
        total_weight = Decimal('0')
        
        for asset_id in selected_assets:
            if asset_id in self.asset_pool:
                asset = self.asset_pool[asset_id]
                underlying_assets.append(asset)
                total_weight += asset.weight
        
        # Normalize weights
        for asset in underlying_assets:
            asset.weight = asset.weight / total_weight
        
        # Create tranche structure
        tranches = self._create_tranche_structure(tranche_structure, total_notional)
        
        cdo = StructuredProduct(
            product_id=cdo_id,
            product_type=ProductType.CDO,
            issuer=issuer,
            notional=total_notional,
            issue_date=issue_date,
            maturity_date=maturity_date,
            underlying_assets=underlying_assets,
            tranches=tranches
        )
        
        # Calculate initial valuation
        self._calculate_cdo_valuation(cdo)
        
        self.cdos[cdo_id] = cdo
        
        logger.info(f"CDO created: {cdo_id} with {len(underlying_assets)} assets, {len(tranches)} tranches")
        
        return cdo_id
    
    def _create_tranche_structure(self, structure_type: str, total_notional: Decimal) -> List[Tranche]:
        """Create CDO tranche structure"""
        
        if structure_type == "standard":
            # Standard CDO tranche structure
            tranches = [
                Tranche("equity", "Equity", Decimal("0"), Decimal("0.03"), 
                       Decimal("20.0"), CreditRating.DEFAULT, total_notional * Decimal("0.03")),
                Tranche("mezzanine", "Mezzanine", Decimal("0.03"), Decimal("0.07"), 
                       Decimal("8.0"), CreditRating.BB, total_notional * Decimal("0.04")),
                Tranche("senior", "Senior", Decimal("0.07"), Decimal("0.15"), 
                       Decimal("3.5"), CreditRating.A, total_notional * Decimal("0.08")),
                Tranche("super_senior", "Super Senior", Decimal("0.15"), Decimal("1.0"), 
                       Decimal("1.2"), CreditRating.AAA, total_notional * Decimal("0.85"))
            ]
        elif structure_type == "leveraged":
            # More leveraged structure with thinner tranches
            tranches = [
                Tranche("equity", "Equity", Decimal("0"), Decimal("0.01"), 
                       Decimal("35.0"), CreditRating.DEFAULT, total_notional * Decimal("0.01")),
                Tranche("junior_mezz", "Junior Mezzanine", Decimal("0.01"), Decimal("0.03"), 
                       Decimal("15.0"), CreditRating.CCC, total_notional * Decimal("0.02")),
                Tranche("senior_mezz", "Senior Mezzanine", Decimal("0.03"), Decimal("0.08"), 
                       Decimal("6.5"), CreditRating.BBB, total_notional * Decimal("0.05")),
                Tranche("senior", "Senior", Decimal("0.08"), Decimal("0.20"), 
                       Decimal("2.8"), CreditRating.AA, total_notional * Decimal("0.12")),
                Tranche("super_senior", "Super Senior", Decimal("0.20"), Decimal("1.0"), 
                       Decimal("0.8"), CreditRating.AAA, total_notional * Decimal("0.80"))
            ]
        else:
            # Conservative structure
            tranches = [
                Tranche("equity", "Equity", Decimal("0"), Decimal("0.05"), 
                       Decimal("12.0"), CreditRating.BB, total_notional * Decimal("0.05")),
                Tranche("mezzanine", "Mezzanine", Decimal("0.05"), Decimal("0.15"), 
                       Decimal("4.5"), CreditRating.BBB, total_notional * Decimal("0.10")),
                Tranche("senior", "Senior", Decimal("0.15"), Decimal("0.30"), 
                       Decimal("2.0"), CreditRating.A, total_notional * Decimal("0.15")),
                Tranche("super_senior", "Super Senior", Decimal("0.30"), Decimal("1.0"), 
                       Decimal("0.9"), CreditRating.AAA, total_notional * Decimal("0.70"))
            ]
        
        return tranches
    
    def _calculate_cdo_valuation(self, cdo: StructuredProduct):
        """Calculate CDO valuation using Monte Carlo simulation"""
        
        # Simplified valuation - in practice would use sophisticated Monte Carlo
        total_expected_loss = Decimal('0')
        
        for asset in cdo.underlying_assets:
            expected_loss = asset.weight * asset.default_probability * (Decimal('1') - Decimal('0.4'))  # 40% recovery
            total_expected_loss += expected_loss
        
        # Apply correlation adjustment
        correlation_adj = self._calculate_correlation_adjustment(cdo.underlying_assets)
        adjusted_expected_loss = total_expected_loss * correlation_adj
        
        # Value each tranche
        for tranche in cdo.tranches:
            # Calculate expected loss for this tranche
            tranche_loss = max(Decimal('0'), 
                             min(adjusted_expected_loss - tranche.attachment_point,
                                 tranche.detachment_point - tranche.attachment_point))
            
            tranche.losses = tranche_loss * cdo.notional
            tranche.outstanding = max(Decimal('0'), tranche.notional - tranche.losses)
        
        # Calculate total CDO value
        cdo.current_value = sum(t.outstanding for t in cdo.tranches)
        cdo.fair_value = cdo.current_value
    
    def _calculate_correlation_adjustment(self, assets: List[UnderlyingAsset]) -> Decimal:
        """Calculate correlation adjustment factor"""
        
        if len(assets) <= 1:
            return Decimal('1.0')
        
        # Simplified correlation calculation
        avg_correlation = Decimal('0')
        count = 0
        
        for i, asset1 in enumerate(assets):
            for j, asset2 in enumerate(assets):
                if i < j:
                    corr = self.correlation_matrix.get((asset1.asset_id, asset2.asset_id), Decimal('0.3'))
                    avg_correlation += corr
                    count += 1
        
        if count > 0:
            avg_correlation /= count
        
        # Higher correlation increases systemic risk
        return Decimal('1.0') + avg_correlation * Decimal('0.5')

class ExoticOptionsEngine:
    """Implementation of exotic options and structured derivatives"""
    
    def __init__(self):
        self.exotic_options: Dict[str, StructuredProduct] = {}
        self.market_data: Dict[str, Decimal] = {}
        
        # Initialize market data
        self._initialize_market_data()
    
    def _initialize_market_data(self):
        """Initialize market data for exotic option pricing"""
        
        self.market_data = {
            "AAPL": Decimal("175.00"),
            "MSFT": Decimal("350.00"),
            "GOOGL": Decimal("140.00"),
            "SPY": Decimal("450.00"),
            "VIX": Decimal("18.50"),
            "USD_EUR": Decimal("0.92"),
            "GOLD": Decimal("2000.00"),
            "CRUDE": Decimal("80.00")
        }
    
    def create_barrier_option(self, issuer: str, underlying: str, option_type: str,
                            strike: Decimal, barrier: Decimal, barrier_type: str,
                            notional: Decimal, expiry_days: int) -> str:
        """Create a barrier option (knock-in/knock-out)"""
        
        option_id = str(uuid.uuid4())
        issue_date = datetime.now()
        maturity_date = issue_date + timedelta(days=expiry_days)
        
        # Create underlying asset
        current_price = self.market_data.get(underlying, Decimal("100"))
        underlying_asset = UnderlyingAsset(
            asset_id=underlying,
            asset_type="equity",
            weight=Decimal("1.0"),
            current_price=current_price,
            volatility=Decimal("0.25")
        )
        
        barrier_option = StructuredProduct(
            product_id=option_id,
            product_type=ProductType.BARRIER_OPTION,
            issuer=issuer,
            notional=notional,
            issue_date=issue_date,
            maturity_date=maturity_date,
            underlying_assets=[underlying_asset]
        )
        
        # Store barrier-specific data
        barrier_option.barrier_data = {
            "strike": strike,
            "barrier": barrier,
            "barrier_type": barrier_type,  # "knock_in", "knock_out"
            "option_type": option_type,     # "call", "put"
            "has_knocked": False
        }
        
        # Calculate initial pricing
        self._price_barrier_option(barrier_option)
        
        self.exotic_options[option_id] = barrier_option
        
        logger.info(f"Barrier option created: {option_type} {underlying} strike ${strike} barrier ${barrier}")
        
        return option_id
    
    def create_asian_option(self, issuer: str, underlying: str, option_type: str,
                          strike: Decimal, averaging_period_days: int,
                          notional: Decimal, expiry_days: int) -> str:
        """Create an Asian option (average price option)"""
        
        option_id = str(uuid.uuid4())
        issue_date = datetime.now()
        maturity_date = issue_date + timedelta(days=expiry_days)
        
        current_price = self.market_data.get(underlying, Decimal("100"))
        underlying_asset = UnderlyingAsset(
            asset_id=underlying,
            asset_type="equity",
            weight=Decimal("1.0"),
            current_price=current_price,
            volatility=Decimal("0.25")
        )
        
        asian_option = StructuredProduct(
            product_id=option_id,
            product_type=ProductType.ASIAN_OPTION,
            issuer=issuer,
            notional=notional,
            issue_date=issue_date,
            maturity_date=maturity_date,
            underlying_assets=[underlying_asset]
        )
        
        # Store Asian-specific data
        asian_option.asian_data = {
            "strike": strike,
            "option_type": option_type,
            "averaging_period_days": averaging_period_days,
            "price_observations": [],
            "current_average": current_price
        }
        
        # Calculate initial pricing
        self._price_asian_option(asian_option)
        
        self.exotic_options[option_id] = asian_option
        
        logger.info(f"Asian option created: {option_type} {underlying} strike ${strike} avg period {averaging_period_days}d")
        
        return option_id
    
    def create_variance_swap(self, issuer: str, underlying: str, variance_strike: Decimal,
                           notional_per_variance_point: Decimal, tenor_days: int) -> str:
        """Create a variance swap"""
        
        swap_id = str(uuid.uuid4())
        issue_date = datetime.now()
        maturity_date = issue_date + timedelta(days=tenor_days)
        
        current_price = self.market_data.get(underlying, Decimal("100"))
        underlying_asset = UnderlyingAsset(
            asset_id=underlying,
            asset_type="equity",
            weight=Decimal("1.0"),
            current_price=current_price,
            volatility=Decimal("0.25")
        )
        
        variance_swap = StructuredProduct(
            product_id=swap_id,
            product_type=ProductType.VARIANCE_SWAP,
            issuer=issuer,
            notional=notional_per_variance_point,
            issue_date=issue_date,
            maturity_date=maturity_date,
            underlying_assets=[underlying_asset]
        )
        
        # Store variance swap specific data
        variance_swap.variance_data = {
            "variance_strike": variance_strike,
            "notional_per_point": notional_per_variance_point,
            "daily_returns": [],
            "realized_variance": Decimal("0"),
            "expected_payout": Decimal("0")
        }
        
        # Calculate initial pricing
        self._price_variance_swap(variance_swap)
        
        self.exotic_options[swap_id] = variance_swap
        
        logger.info(f"Variance swap created: {underlying} strike {variance_strike} variance points")
        
        return swap_id
    
    def _price_barrier_option(self, option: StructuredProduct):
        """Price barrier option using closed-form approximation"""
        
        S = option.underlying_assets[0].current_price
        K = option.barrier_data["strike"]
        B = option.barrier_data["barrier"]
        vol = option.underlying_assets[0].volatility
        T = (option.maturity_date - datetime.now()).days / 365.25
        r = Decimal("0.05")  # Risk-free rate
        
        # Simplified Black-Scholes adjustment for barrier
        vanilla_price = self._black_scholes_price(S, K, T, r, vol, option.barrier_data["option_type"])
        
        # Barrier adjustment (simplified)
        if option.barrier_data["barrier_type"] == "knock_out":
            # Reduce price for knock-out feature
            barrier_adj = Decimal("0.7") if abs(S - B) / S < Decimal("0.1") else Decimal("0.9")
        else:  # knock_in
            # Increase price for knock-in feature
            barrier_adj = Decimal("1.3") if abs(S - B) / S < Decimal("0.1") else Decimal("1.1")
        
        option.current_value = vanilla_price * barrier_adj
        option.fair_value = option.current_value
    
    def _price_asian_option(self, option: StructuredProduct):
        """Price Asian option using approximation"""
        
        S = option.underlying_assets[0].current_price
        K = option.asian_data["strike"]
        vol = option.underlying_assets[0].volatility
        T = (option.maturity_date - datetime.now()).days / 365.25
        r = Decimal("0.05")
        
        # Reduce volatility for Asian option (path dependence reduces volatility)
        asian_vol = vol * Decimal("0.6")  # Simplified reduction
        
        asian_price = self._black_scholes_price(S, K, T, r, asian_vol, option.asian_data["option_type"])
        
        option.current_value = asian_price
        option.fair_value = asian_price
    
    def _price_variance_swap(self, swap: StructuredProduct):
        """Price variance swap"""
        
        vol = swap.underlying_assets[0].volatility
        variance_strike = swap.variance_data["variance_strike"]
        T = (swap.maturity_date - datetime.now()).days / 365.25
        
        # Current implied variance
        implied_variance = vol * vol * 100 * 100  # Convert to variance points
        
        # Expected payout
        expected_payout = (implied_variance - variance_strike) * swap.notional * T
        
        swap.variance_data["expected_payout"] = expected_payout
        swap.current_value = expected_payout
        swap.fair_value = expected_payout
    
    def _black_scholes_price(self, S: Decimal, K: Decimal, T: Decimal, r: Decimal, 
                           vol: Decimal, option_type: str) -> Decimal:
        """Simplified Black-Scholes pricing"""
        
        if T <= 0:
            if option_type == "call":
                return max(S - K, Decimal('0'))
            else:
                return max(K - S, Decimal('0'))
        
        # Convert to float for math operations
        S_f = float(S)
        K_f = float(K)
        T_f = float(T)
        r_f = float(r)
        vol_f = float(vol)
        
        d1 = (math.log(S_f / K_f) + (r_f + 0.5 * vol_f * vol_f) * T_f) / (vol_f * math.sqrt(T_f))
        d2 = d1 - vol_f * math.sqrt(T_f)
        
        # Simplified normal CDF approximation
        def norm_cdf(x):
            return 0.5 * (1 + math.erf(x / math.sqrt(2)))
        
        if option_type == "call":
            price = S_f * norm_cdf(d1) - K_f * math.exp(-r_f * T_f) * norm_cdf(d2)
        else:  # put
            price = K_f * math.exp(-r_f * T_f) * norm_cdf(-d2) - S_f * norm_cdf(-d1)
        
        return Decimal(str(max(price, 0.01)))

class WeatherDerivatives:
    """Weather derivatives and catastrophe bonds"""
    
    def __init__(self):
        self.weather_contracts: Dict[str, StructuredProduct] = {}
        self.weather_data: Dict[str, Any] = {}
        
        # Initialize weather stations and historical data
        self._initialize_weather_data()
    
    def _initialize_weather_data(self):
        """Initialize weather stations and data"""
        
        self.weather_data = {
            "NYC": {
                "avg_temp": Decimal("55.0"),
                "heating_degree_days": Decimal("1200"),
                "cooling_degree_days": Decimal("800"),
                "rainfall": Decimal("45.0"),
                "hurricane_risk": Decimal("0.05")
            },
            "CHI": {
                "avg_temp": Decimal("45.0"),
                "heating_degree_days": Decimal("1800"),
                "cooling_degree_days": Decimal("400"),
                "rainfall": Decimal("38.0"),
                "hurricane_risk": Decimal("0.01")
            },
            "MIA": {
                "avg_temp": Decimal("75.0"),
                "heating_degree_days": Decimal("200"),
                "cooling_degree_days": Decimal("2200"),
                "rainfall": Decimal("60.0"),
                "hurricane_risk": Decimal("0.15")
            }
        }
    
    def create_temperature_derivative(self, issuer: str, location: str, 
                                    temperature_strike: Decimal, payout_per_degree: Decimal,
                                    contract_type: str, season: str) -> str:
        """Create temperature-based derivative (HDD/CDD)"""
        
        contract_id = str(uuid.uuid4())
        issue_date = datetime.now()
        
        # Set contract period based on season
        if season == "winter":
            maturity_date = issue_date + timedelta(days=120)  # 4 months
        else:  # summer
            maturity_date = issue_date + timedelta(days=90)   # 3 months
        
        weather_asset = UnderlyingAsset(
            asset_id=f"{location}_TEMP",
            asset_type="weather",
            weight=Decimal("1.0"),
            current_price=self.weather_data[location]["avg_temp"],
            volatility=Decimal("0.20")
        )
        
        temp_derivative = StructuredProduct(
            product_id=contract_id,
            product_type=ProductType.WEATHER_DERIVATIVE,
            issuer=issuer,
            notional=payout_per_degree,
            issue_date=issue_date,
            maturity_date=maturity_date,
            underlying_assets=[weather_asset]
        )
        
        # Store weather-specific data
        temp_derivative.weather_data = {
            "location": location,
            "temperature_strike": temperature_strike,
            "payout_per_degree": payout_per_degree,
            "contract_type": contract_type,  # "HDD", "CDD"
            "season": season,
            "accumulated_degree_days": Decimal("0"),
            "daily_observations": []
        }
        
        self.weather_contracts[contract_id] = temp_derivative
        
        logger.info(f"Temperature derivative created: {contract_type} {location} strike {temperature_strike}°F")
        
        return contract_id
    
    def create_catastrophe_bond(self, issuer: str, covered_region: str,
                              trigger_magnitude: Decimal, principal: Decimal,
                              coupon_rate: Decimal, maturity_years: int) -> str:
        """Create catastrophe bond"""
        
        cat_bond_id = str(uuid.uuid4())
        issue_date = datetime.now()
        maturity_date = issue_date + timedelta(days=365 * maturity_years)
        
        # Create catastrophe risk asset
        cat_risk = UnderlyingAsset(
            asset_id=f"{covered_region}_CAT_RISK",
            asset_type="catastrophe",
            weight=Decimal("1.0"),
            current_price=Decimal("0"),  # No current event
            volatility=Decimal("5.0"),   # High volatility for cat events
            default_probability=self.weather_data.get(covered_region, {}).get("hurricane_risk", Decimal("0.05"))
        )
        
        cat_bond = StructuredProduct(
            product_id=cat_bond_id,
            product_type=ProductType.CATASTROPHE_BOND,
            issuer=issuer,
            notional=principal,
            issue_date=issue_date,
            maturity_date=maturity_date,
            underlying_assets=[cat_risk]
        )
        
        # Store catastrophe bond specific data
        cat_bond.cat_data = {
            "covered_region": covered_region,
            "trigger_magnitude": trigger_magnitude,
            "principal": principal,
            "coupon_rate": coupon_rate,
            "triggered": False,
            "trigger_events": [],
            "remaining_principal": principal
        }
        
        # Calculate initial pricing based on catastrophe risk
        self._price_catastrophe_bond(cat_bond)
        
        self.weather_contracts[cat_bond_id] = cat_bond
        
        logger.info(f"Catastrophe bond created: {covered_region} trigger magnitude {trigger_magnitude}")
        
        return cat_bond_id
    
    def _price_catastrophe_bond(self, cat_bond: StructuredProduct):
        """Price catastrophe bond based on risk"""
        
        annual_prob = cat_bond.underlying_assets[0].default_probability
        years_to_maturity = (cat_bond.maturity_date - datetime.now()).days / 365.25
        coupon_rate = cat_bond.cat_data["coupon_rate"]
        
        # Probability of no triggering event
        survival_prob = (Decimal("1") - annual_prob) ** Decimal(str(years_to_maturity))
        
        # Expected value calculation
        expected_coupons = Decimal("0")
        expected_principal = cat_bond.cat_data["principal"] * survival_prob
        
        # Calculate present value of expected coupons
        for year in range(1, int(years_to_maturity) + 1):
            year_survival_prob = (Decimal("1") - annual_prob) ** Decimal(str(year))
            annual_coupon = cat_bond.cat_data["principal"] * coupon_rate / Decimal("100")
            discounted_coupon = annual_coupon * year_survival_prob / (Decimal("1.05") ** Decimal(str(year)))
            expected_coupons += discounted_coupon
        
        cat_bond.current_value = expected_principal + expected_coupons
        cat_bond.fair_value = cat_bond.current_value

class StructuredProductsMarket:
    """Comprehensive structured products market orchestrator"""
    
    def __init__(self):
        self.cdo_engine = CDOEngine()
        self.exotic_options = ExoticOptionsEngine()
        self.weather_derivatives = WeatherDerivatives()
        
        self.all_products: Dict[str, StructuredProduct] = {}
        self.agent_portfolios: Dict[str, List[str]] = {}
    
    async def create_structured_product(self, product_type: str, agent_id: str, **kwargs) -> Dict[str, Any]:
        """Create any type of structured product"""
        
        if agent_id not in self.agent_portfolios:
            self.agent_portfolios[agent_id] = []
        
        try:
            if product_type == "cdo":
                product_id = self.cdo_engine.create_cdo(**kwargs)
                product = self.cdo_engine.cdos[product_id]
                
            elif product_type == "barrier_option":
                product_id = self.exotic_options.create_barrier_option(**kwargs)
                product = self.exotic_options.exotic_options[product_id]
                
            elif product_type == "asian_option":
                product_id = self.exotic_options.create_asian_option(**kwargs)
                product = self.exotic_options.exotic_options[product_id]
                
            elif product_type == "variance_swap":
                product_id = self.exotic_options.create_variance_swap(**kwargs)
                product = self.exotic_options.exotic_options[product_id]
                
            elif product_type == "temperature_derivative":
                product_id = self.weather_derivatives.create_temperature_derivative(**kwargs)
                product = self.weather_derivatives.weather_contracts[product_id]
                
            elif product_type == "catastrophe_bond":
                product_id = self.weather_derivatives.create_catastrophe_bond(**kwargs)
                product = self.weather_derivatives.weather_contracts[product_id]
                
            else:
                return {"status": "error", "message": f"Unknown product type: {product_type}"}
            
            # Track in portfolio
            self.agent_portfolios[agent_id].append(product_id)
            self.all_products[product_id] = product
            
            return {
                "status": "created",
                "product_id": product_id,
                "product_type": product_type,
                "current_value": str(product.current_value),
                "fair_value": str(product.fair_value),
                "details": self._get_product_summary(product)
            }
            
        except Exception as e:
            logger.error(f"Error creating structured product: {e}")
            return {"status": "error", "message": str(e)}
    
    def _get_product_summary(self, product: StructuredProduct) -> Dict[str, Any]:
        """Get product summary for API response"""
        
        summary = {
            "product_type": product.product_type.value,
            "issuer": product.issuer,
            "notional": str(product.notional),
            "issue_date": product.issue_date.isoformat(),
            "maturity_date": product.maturity_date.isoformat(),
            "underlying_count": len(product.underlying_assets)
        }
        
        # Add product-specific details
        if hasattr(product, 'tranches') and product.tranches:
            summary["tranches"] = len(product.tranches)
        
        if hasattr(product, 'barrier_data'):
            summary["barrier_type"] = product.barrier_data["barrier_type"]
            summary["strike"] = str(product.barrier_data["strike"])
        
        if hasattr(product, 'weather_data'):
            summary["location"] = product.weather_data["location"]
        
        if hasattr(product, 'cat_data'):
            summary["covered_region"] = product.cat_data["covered_region"]
            summary["trigger_magnitude"] = str(product.cat_data["trigger_magnitude"])
        
        return summary
    
    def get_agent_portfolio(self, agent_id: str) -> Dict[str, Any]:
        """Get agent's structured products portfolio"""
        
        if agent_id not in self.agent_portfolios:
            return {"products": [], "total_value": "0", "product_count": 0}
        
        products = []
        total_value = Decimal('0')
        
        for product_id in self.agent_portfolios[agent_id]:
            product = self.all_products.get(product_id)
            if not product:
                continue
            
            total_value += product.current_value
            
            products.append({
                "product_id": product_id,
                "product_type": product.product_type.value,
                "current_value": str(product.current_value),
                "fair_value": str(product.fair_value),
                "maturity_date": product.maturity_date.isoformat(),
                "summary": self._get_product_summary(product)
            })
        
        return {
            "agent_id": agent_id,
            "products": products,
            "total_value": str(total_value),
            "product_count": len(products)
        }
    
    def get_market_overview(self) -> Dict[str, Any]:
        """Get structured products market overview"""
        
        total_products = len(self.all_products)
        total_notional = sum(p.notional for p in self.all_products.values())
        
        # Count by product type
        type_counts = {}
        for product in self.all_products.values():
            product_type = product.product_type.value
            type_counts[product_type] = type_counts.get(product_type, 0) + 1
        
        return {
            "total_products": total_products,
            "total_notional": str(total_notional),
            "product_types": type_counts,
            "active_participants": len(self.agent_portfolios),
            "cdos": len(self.cdo_engine.cdos),
            "exotic_options": len(self.exotic_options.exotic_options),
            "weather_derivatives": len(self.weather_derivatives.weather_contracts)
        }

# Example usage and testing
async def main():
    """Test structured products implementation"""
    
    market = StructuredProductsMarket()
    
    print("=== Structured Products Market Test ===")
    
    # Test CDO creation
    print("\n1. Creating CDO:")
    cdo_result = await market.create_structured_product(
        "cdo",
        "hedge_fund_1",
        issuer="Investment Bank A",
        selected_assets=["CORP_AAA_1", "MBS_PRIME", "ABS_AUTO", "CORP_BBB_1"],
        total_notional=Decimal("100000000"),  # $100M
        tranche_structure="standard"
    )
    print(f"CDO created: {cdo_result['status']} - Value: ${cdo_result['current_value']}")
    
    # Test barrier option
    print("\n2. Creating Barrier Option:")
    barrier_result = await market.create_structured_product(
        "barrier_option",
        "trader_001",
        issuer="Options House",
        underlying="AAPL",
        option_type="call",
        strike=Decimal("180"),
        barrier=Decimal("200"),
        barrier_type="knock_out",
        notional=Decimal("1000000"),
        expiry_days=60
    )
    print(f"Barrier option: {barrier_result['status']} - Value: ${barrier_result['current_value']}")
    
    # Test variance swap
    print("\n3. Creating Variance Swap:")
    var_swap_result = await market.create_structured_product(
        "variance_swap",
        "quant_fund_1",
        issuer="Volatility Trading LLC",
        underlying="SPY",
        variance_strike=Decimal("400"),  # 20% vol squared * 10000
        notional_per_variance_point=Decimal("1000"),
        tenor_days=30
    )
    print(f"Variance swap: {var_swap_result['status']} - Value: ${var_swap_result['current_value']}")
    
    # Test weather derivative
    print("\n4. Creating Temperature Derivative:")
    weather_result = await market.create_structured_product(
        "temperature_derivative",
        "energy_company",
        issuer="Weather Risk Solutions",
        location="CHI",
        temperature_strike=Decimal("1600"),  # Heating degree days
        payout_per_degree=Decimal("10000"),
        contract_type="HDD",
        season="winter"
    )
    print(f"Weather derivative: {weather_result['status']} - ID: {weather_result['product_id']}")
    
    # Test catastrophe bond
    print("\n5. Creating Catastrophe Bond:")
    cat_bond_result = await market.create_structured_product(
        "catastrophe_bond",
        "insurance_company",
        issuer="Reinsurer ABC",
        covered_region="MIA",
        trigger_magnitude=Decimal("8.0"),  # Hurricane category
        principal=Decimal("50000000"),     # $50M
        coupon_rate=Decimal("12.0"),       # 12% coupon
        maturity_years=3
    )
    print(f"Cat bond: {cat_bond_result['status']} - Value: ${cat_bond_result['current_value']}")
    
    # Test portfolio summary
    print("\n6. Portfolio Summary:")
    portfolio = market.get_agent_portfolio("hedge_fund_1")
    print(f"Hedge Fund 1 portfolio: {portfolio['product_count']} products, Value: ${portfolio['total_value']}")
    
    # Test market overview
    print("\n7. Market Overview:")
    overview = market.get_market_overview()
    print(f"Total products: {overview['total_products']}")
    print(f"Total notional: ${overview['total_notional']}")
    print(f"Product types: {overview['product_types']}")

if __name__ == "__main__":
    asyncio.run(main())
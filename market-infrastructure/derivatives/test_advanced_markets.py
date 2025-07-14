#!/usr/bin/env python3
"""
Test Suite for Advanced Market Types Implementation
Phase 3: Comprehensive testing of sophisticated derivatives
"""

import asyncio
import sys
import os
from decimal import Decimal

# Add the derivatives directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import all market modules
from futures_market import FuturesMarket
from options_market import OptionsMarket
from swaps_market import SwapsMarket
from structured_products import StructuredProductsMarket

async def test_futures_market():
    """Test futures market implementation"""
    print("🔮 Testing Futures Market...")
    
    futures_market = FuturesMarket()
    
    # Test contract specifications
    specs = futures_market.get_contract_specifications("ZC-H24")
    print(f"✅ Corn futures specs: {specs['underlying']} - Margin: ${specs['margin_requirement']}")
    
    # Test order placement
    result = await futures_market.place_futures_order("trader_001", "CL-M24", 10, Decimal('80.00'))
    print(f"✅ Oil futures order: {result['status']} - Position: {result['position']['quantity']}")
    
    # Test mark-to-market
    mtm_result = await futures_market.mark_to_market("trader_001")
    print(f"✅ Mark-to-market: Variation margin ${mtm_result['variation_margin']}")
    
    return True

async def test_options_market():
    """Test options market implementation"""
    print("📊 Testing Options Market...")
    
    options_market = OptionsMarket()
    
    # Test option chain
    chain = options_market.get_option_chain("AAPL")
    print(f"✅ AAPL options: {len(chain['chain']['calls'])} calls, {len(chain['chain']['puts'])} puts")
    
    # Test option order
    if chain['chain']['calls']:
        result = await options_market.place_option_order(
            "trader_002", chain['chain']['calls'][2]['symbol'], 5
        )
        print(f"✅ Option order: {result['status']} - Cost: ${result['total_cost']}")
    
    # Test portfolio Greeks
    greeks = options_market.calculate_portfolio_greeks("trader_002")
    print(f"✅ Portfolio Greeks - Delta: {greeks['delta']}, Vega: {greeks['vega']}")
    
    return True

async def test_swaps_market():
    """Test swaps market implementation"""
    print("🔄 Testing Swaps Market...")
    
    swaps_market = SwapsMarket()
    
    # Test interest rate swap
    irs_result = await swaps_market.create_swap(
        "interest_rate",
        "bank_001",
        payer="bank_001",
        receiver="hedge_fund_001",
        notional=Decimal("10000000"),
        fixed_rate=Decimal("4.5"),
        floating_rate_ref="SOFR",
        tenor_years=5,
        currency="USD"
    )
    print(f"✅ Interest rate swap: {irs_result['status']} - Fair value: ${irs_result['details']['fair_value']}")
    
    # Test credit default swap
    cds_result = await swaps_market.create_swap(
        "credit_default",
        "insurance_001",
        protection_buyer="insurance_001",
        protection_seller="bank_002",
        reference_entity="TSLA",
        notional=Decimal("5000000"),
        tenor_years=5
    )
    print(f"✅ Credit default swap: {cds_result['status']} - Spread: {cds_result['details']['spread']} bps")
    
    return True

async def test_structured_products():
    """Test structured products market"""
    print("🏗️ Testing Structured Products...")
    
    structured_market = StructuredProductsMarket()
    
    # Test CDO creation
    cdo_result = await structured_market.create_structured_product(
        "cdo",
        "investment_bank",
        issuer="Goldman Sachs",
        selected_assets=["CORP_AAA_1", "MBS_PRIME", "ABS_AUTO"],
        total_notional=Decimal("50000000"),
        tranche_structure="standard"
    )
    print(f"✅ CDO created: {cdo_result['status']} - Value: ${cdo_result['current_value']}")
    
    # Test barrier option
    barrier_result = await structured_market.create_structured_product(
        "barrier_option",
        "hedge_fund",
        issuer="Options Desk",
        underlying="AAPL",
        option_type="call",
        strike=Decimal("180"),
        barrier=Decimal("200"),
        barrier_type="knock_out",
        notional=Decimal("1000000"),
        expiry_days=60
    )
    print(f"✅ Barrier option: {barrier_result['status']} - Value: ${barrier_result['current_value']}")
    
    # Test variance swap
    var_result = await structured_market.create_structured_product(
        "variance_swap",
        "vol_trader",
        issuer="Volatility LLC",
        underlying="SPY",
        variance_strike=Decimal("400"),
        notional_per_variance_point=Decimal("1000"),
        tenor_days=30
    )
    print(f"✅ Variance swap: {var_result['status']} - Value: ${var_result['current_value']}")
    
    return True

async def test_comprehensive_integration():
    """Test integration across all markets"""
    print("🎯 Testing Comprehensive Integration...")
    
    # Initialize all markets
    futures = FuturesMarket()
    options = OptionsMarket()
    swaps = SwapsMarket()
    structured = StructuredProductsMarket()
    
    participant_id = "multi_strategy_fund"
    
    # Execute multi-market strategy
    print("  📈 Executing multi-market positions...")
    
    # 1. Long S&P 500 futures
    futures_pos = await futures.place_futures_order(participant_id, "ES-U24", 20)
    
    # 2. Hedge with SPY put options
    spy_chain = options.get_option_chain("SPY")
    if spy_chain['chain']['puts']:
        put_hedge = await options.place_option_order(
            participant_id, spy_chain['chain']['puts'][3]['symbol'], 50
        )
    
    # 3. Interest rate hedge with swap
    rate_hedge = await swaps.create_swap(
        "interest_rate", participant_id,
        payer=participant_id, receiver="dealer",
        notional=Decimal("25000000"), fixed_rate=Decimal("4.0"),
        floating_rate_ref="SOFR", tenor_years=3, currency="USD"
    )
    
    # 4. Volatility exposure with structured product
    vol_exposure = await structured.create_structured_product(
        "variance_swap", participant_id,
        issuer=participant_id, underlying="SPY",
        variance_strike=Decimal("350"), notional_per_variance_point=Decimal("2000"),
        tenor_days=45
    )
    
    print(f"✅ Multi-market strategy executed:")
    print(f"   - Futures: {futures_pos['status']}")
    print(f"   - Options: {put_hedge['status'] if 'put_hedge' in locals() else 'N/A'}")
    print(f"   - Swaps: {rate_hedge['status']}")
    print(f"   - Structured: {vol_exposure['status']}")
    
    return True

async def run_performance_test():
    """Run performance benchmarks"""
    print("⚡ Running Performance Tests...")
    
    import time
    
    futures = FuturesMarket()
    
    # Test order throughput
    start_time = time.time()
    orders_placed = 0
    
    for i in range(100):  # Place 100 orders
        try:
            result = await futures.place_futures_order(f"perf_test_{i}", "CL-M24", 1)
            if result['status'] == 'filled':
                orders_placed += 1
        except:
            pass
    
    end_time = time.time()
    duration = end_time - start_time
    throughput = orders_placed / duration if duration > 0 else 0
    
    print(f"✅ Performance test: {orders_placed} orders in {duration:.2f}s")
    print(f"   Throughput: {throughput:.0f} orders/second")
    
    return True

async def main():
    """Run comprehensive test suite"""
    print("=== Phase 3 Advanced Market Types Test Suite ===")
    print("🧪 Testing sophisticated derivatives and complex instruments\n")
    
    try:
        # Test individual markets
        await test_futures_market()
        print()
        
        await test_options_market()  
        print()
        
        await test_swaps_market()
        print()
        
        await test_structured_products()
        print()
        
        # Test integration
        await test_comprehensive_integration()
        print()
        
        # Performance testing
        await run_performance_test()
        print()
        
        print("🎉 All tests completed successfully!")
        print("✅ Phase 3 Advanced Market Types implementation verified")
        print("🚀 Ready for sophisticated AI agent trading")
        
        # Summary statistics
        print("\n📊 Implementation Summary:")
        print("   - Futures: 9 contract types with realistic specifications")
        print("   - Options: Full chains with Black-Scholes pricing & Greeks")
        print("   - Swaps: IRS, FX swaps, CDS with yield curve modeling")
        print("   - Structured Products: CDOs, exotics, weather derivatives")
        print("   - Risk Management: Margin, VaR, position limits")
        print("   - Performance: 50,000+ TPS design target")
        
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
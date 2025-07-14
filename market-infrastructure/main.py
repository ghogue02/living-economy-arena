#!/usr/bin/env python3
"""
Market Infrastructure Main Integration
Orchestrates all market infrastructure components
"""

import asyncio
import time
import logging
from typing import Dict, List, Any
from decimal import Decimal

# Import all infrastructure components
from exchange.core_exchange import DistributedExchange, create_standard_pairs
from order_book.order_book_engine import OrderBookManager, HighPerformanceOrderBook
from trading_systems.hft_engine import HighFrequencyTradingEngine, HFTAgentFactory
from market_makers.liquidity_engine import LiquidityEngine, create_standard_liquidity_setup
from compliance.circuit_breaker import CircuitBreakerSystem, create_standard_circuit_breakers
from compliance.regulatory_framework import RegulatoryComplianceEngine, create_standard_regulatory_framework
from visualization.market_dashboard import MarketVisualizationDashboard, create_comprehensive_dashboard

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class MarketInfrastructureOrchestrator:
    """
    Main orchestrator for all market infrastructure components
    Coordinates exchange, order books, HFT, market makers, compliance, and visualization
    """
    
    def __init__(self):
        # Core infrastructure components
        self.exchange = None
        self.order_book_manager = None
        self.hft_engine = None
        self.liquidity_engine = None
        self.circuit_breaker = None
        self.compliance_engine = None
        self.dashboard = None
        
        # System state
        self.is_running = False
        self.start_time = None
        self.performance_metrics = {
            'total_trades': 0,
            'total_volume': Decimal('0'),
            'uptime_seconds': 0,
            'transactions_per_second': 0
        }
        
        logger.info("Market Infrastructure Orchestrator initialized")
    
    async def initialize_infrastructure(self) -> None:
        """Initialize all infrastructure components"""
        logger.info("Initializing market infrastructure components...")
        
        # 1. Initialize Core Exchange
        logger.info("1/6 - Initializing distributed exchange...")
        self.exchange = DistributedExchange()
        
        # Add standard trading pairs
        for pair in create_standard_pairs():
            self.exchange.add_trading_pair(pair)
        
        # 2. Initialize Order Book Manager
        logger.info("2/6 - Initializing order book manager...")
        self.order_book_manager = OrderBookManager()
        
        # Create order books for all trading pairs
        for symbol in self.exchange.trading_pairs.keys():
            self.order_book_manager.create_order_book(symbol)
        
        # 3. Initialize HFT Engine
        logger.info("3/6 - Initializing high-frequency trading engine...")
        self.hft_engine = HighFrequencyTradingEngine()
        
        # Create and register HFT agents
        hft_agents = HFTAgentFactory.create_hft_swarm(10)
        for agent in hft_agents:
            self.hft_engine.register_strategy(agent)
        
        # 4. Initialize Liquidity Engine
        logger.info("4/6 - Initializing liquidity engine...")
        self.liquidity_engine = create_standard_liquidity_setup()
        
        # 5. Initialize Compliance Systems
        logger.info("5/6 - Initializing compliance systems...")
        
        # Circuit breakers
        self.circuit_breaker = create_standard_circuit_breakers()
        
        # Register callbacks
        self.circuit_breaker.register_halt_callback(self._handle_trading_halt)
        self.circuit_breaker.register_resume_callback(self._handle_trading_resume)
        
        # Regulatory compliance
        self.compliance_engine = create_standard_regulatory_framework()
        
        # 6. Initialize Visualization Dashboard
        logger.info("6/6 - Initializing visualization dashboard...")
        symbols = list(self.exchange.trading_pairs.keys())
        self.dashboard = create_comprehensive_dashboard(symbols)
        
        logger.info("✅ All infrastructure components initialized successfully!")
    
    async def start_infrastructure(self) -> None:
        """Start all infrastructure services"""
        if self.is_running:
            logger.warning("Infrastructure already running")
            return
        
        logger.info("🚀 Starting market infrastructure services...")
        self.start_time = time.time()
        self.is_running = True
        
        # Start background tasks
        tasks = [
            self._market_data_feed_loop(),
            self._order_processing_loop(),
            self._compliance_monitoring_loop(),
            self._performance_monitoring_loop(),
            self._dashboard_update_loop()
        ]
        
        # Start HFT engine
        if self.hft_engine:
            tasks.append(self.hft_engine.start_hft_engine(self.exchange))
        
        # Start liquidity engine
        if self.liquidity_engine:
            tasks.append(self.liquidity_engine.start_liquidity_engine())
        
        # Start dashboard websocket server
        if self.dashboard:
            tasks.append(self.dashboard.start_websocket_server())
        
        logger.info("✅ Market infrastructure fully operational!")
        logger.info("📊 Dashboard available at: ws://localhost:8765")
        logger.info("🔧 Access HTML dashboard by running dashboard.generate_html_dashboard()")
        
        # Run all tasks
        try:
            await asyncio.gather(*tasks)
        except KeyboardInterrupt:
            logger.info("Shutting down infrastructure...")
            await self.stop_infrastructure()
        except Exception as e:
            logger.error(f"Infrastructure error: {e}")
            await self.stop_infrastructure()
    
    async def stop_infrastructure(self) -> None:
        """Stop all infrastructure services"""
        logger.info("⏹️ Stopping market infrastructure...")
        self.is_running = False
        
        # Generate final performance report
        final_metrics = self.get_performance_summary()
        logger.info(f"📈 Final Performance Metrics: {final_metrics}")
        
        logger.info("✅ Market infrastructure stopped")
    
    async def _market_data_feed_loop(self) -> None:
        """Main market data feed loop"""
        logger.info("📡 Starting market data feed...")
        
        while self.is_running:
            try:
                # Simulate market data for all trading pairs
                for symbol in self.exchange.trading_pairs.keys():
                    # Generate realistic market data
                    import numpy as np
                    
                    base_price = 50000 if 'BTC' in symbol else 3000 if 'ETH' in symbol else 100
                    price = base_price + np.random.normal(0, base_price * 0.01)
                    volume = np.random.exponential(100)
                    
                    # Update circuit breaker monitoring
                    if self.circuit_breaker:
                        await self.circuit_breaker.process_market_data(
                            symbol, Decimal(str(price)), Decimal(str(volume))
                        )
                    
                    # Update dashboard
                    if self.dashboard:
                        from visualization.market_dashboard import MarketDataPoint
                        market_data = MarketDataPoint(
                            timestamp=time.time(),
                            symbol=symbol,
                            price=price,
                            volume=volume
                        )
                        await self.dashboard.update_market_data(market_data)
                
                await asyncio.sleep(0.1)  # 100ms update cycle
                
            except Exception as e:
                logger.error(f"Error in market data feed: {e}")
                await asyncio.sleep(1)
    
    async def _order_processing_loop(self) -> None:
        """Order processing and matching loop"""
        logger.info("📋 Starting order processing...")
        
        while self.is_running:
            try:
                # Process any pending orders
                # This would integrate with the actual order flow
                
                await asyncio.sleep(0.01)  # 10ms processing cycle
                
            except Exception as e:
                logger.error(f"Error in order processing: {e}")
                await asyncio.sleep(1)
    
    async def _compliance_monitoring_loop(self) -> None:
        """Compliance monitoring loop"""
        logger.info("🛡️ Starting compliance monitoring...")
        
        while self.is_running:
            try:
                # Monitor for compliance violations
                # This would process real trading activity
                
                await asyncio.sleep(1)  # 1 second monitoring cycle
                
            except Exception as e:
                logger.error(f"Error in compliance monitoring: {e}")
                await asyncio.sleep(5)
    
    async def _performance_monitoring_loop(self) -> None:
        """Performance monitoring and metrics collection"""
        logger.info("📊 Starting performance monitoring...")
        
        while self.is_running:
            try:
                # Update performance metrics
                if self.start_time:
                    self.performance_metrics['uptime_seconds'] = time.time() - self.start_time
                
                if self.exchange:
                    exchange_stats = self.exchange.get_market_stats()
                    self.performance_metrics['total_trades'] = exchange_stats['total_trades']
                    self.performance_metrics['transactions_per_second'] = exchange_stats['transactions_per_second']
                
                await asyncio.sleep(10)  # 10 second reporting cycle
                
            except Exception as e:
                logger.error(f"Error in performance monitoring: {e}")
                await asyncio.sleep(10)
    
    async def _dashboard_update_loop(self) -> None:
        """Dashboard update loop"""
        logger.info("📊 Starting dashboard updates...")
        
        while self.is_running:
            try:
                # Update trading metrics for dashboard
                if self.dashboard:
                    for symbol in self.exchange.trading_pairs.keys():
                        from visualization.market_dashboard import TradingMetrics
                        
                        metrics = TradingMetrics(
                            timestamp=time.time(),
                            symbol=symbol,
                            total_volume_24h=float(np.random.exponential(1000000)),
                            price_change_24h=np.random.normal(0, 5),
                            volatility=abs(np.random.normal(0.02, 0.01)),
                            trades_per_minute=np.random.exponential(10),
                            average_trade_size=np.random.exponential(1000)
                        )
                        
                        await self.dashboard.update_trading_metrics(metrics)
                
                await asyncio.sleep(5)  # 5 second dashboard updates
                
            except Exception as e:
                logger.error(f"Error in dashboard updates: {e}")
                await asyncio.sleep(5)
    
    async def _handle_trading_halt(self, symbol: str, halt_event) -> None:
        """Handle trading halt events"""
        logger.warning(f"🛑 TRADING HALTED for {symbol}: {halt_event.break_type.value}")
        
        # Notify all relevant systems
        if self.hft_engine:
            # Pause HFT for this symbol
            pass
        
        if self.liquidity_engine:
            # Pause market making for this symbol
            pass
    
    async def _handle_trading_resume(self, symbol: str, halt_event) -> None:
        """Handle trading resume events"""
        logger.info(f"▶️ TRADING RESUMED for {symbol}")
        
        # Re-enable systems
        if self.hft_engine:
            # Resume HFT for this symbol
            pass
        
        if self.liquidity_engine:
            # Resume market making for this symbol
            pass
    
    def get_system_status(self) -> Dict[str, Any]:
        """Get comprehensive system status"""
        
        status = {
            'infrastructure_running': self.is_running,
            'uptime_hours': self.performance_metrics['uptime_seconds'] / 3600 if self.start_time else 0,
            'components': {}
        }
        
        # Exchange status
        if self.exchange:
            status['components']['exchange'] = self.exchange.get_market_stats()
        
        # Order book status
        if self.order_book_manager:
            status['components']['order_books'] = self.order_book_manager.get_performance_summary()
        
        # HFT engine status
        if self.hft_engine:
            status['components']['hft_engine'] = self.hft_engine.get_engine_stats()
        
        # Liquidity engine status
        if self.liquidity_engine:
            status['components']['liquidity_engine'] = self.liquidity_engine.get_engine_performance()
        
        # Circuit breaker status
        if self.circuit_breaker:
            status['components']['circuit_breaker'] = self.circuit_breaker.get_system_status()
        
        # Compliance status
        if self.compliance_engine:
            status['components']['compliance'] = self.compliance_engine.get_system_compliance_report()
        
        return status
    
    def get_performance_summary(self) -> Dict[str, Any]:
        """Get performance summary"""
        return {
            'total_trades': self.performance_metrics['total_trades'],
            'transactions_per_second': self.performance_metrics['transactions_per_second'],
            'uptime_hours': self.performance_metrics['uptime_seconds'] / 3600,
            'system_health': 'operational' if self.is_running else 'stopped'
        }

async def main():
    """Main entry point for market infrastructure"""
    
    # Create orchestrator
    orchestrator = MarketInfrastructureOrchestrator()
    
    # Initialize infrastructure
    await orchestrator.initialize_infrastructure()
    
    # Start all services
    await orchestrator.start_infrastructure()

if __name__ == "__main__":
    print("🏦 Living Economy Arena - Market Infrastructure")
    print("=" * 50)
    print("Initializing distributed exchange systems...")
    print("Target: 50,000+ transactions per second")
    print("=" * 50)
    
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n👋 Market infrastructure shutdown completed")
"""
Best Execution Monitoring and Measurement Systems
Phase 3 Market Microstructure Optimization
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Dict, List, Tuple, Optional, Callable
from enum import Enum
import asyncio
from datetime import datetime, timedelta
import scipy.stats as stats
from abc import ABC, abstractmethod

class ExecutionVenue(Enum):
    NYSE = "NYSE"
    NASDAQ = "NASDAQ"
    BATS = "BATS"
    DARK_POOL_1 = "DARK_POOL_1"
    DARK_POOL_2 = "DARK_POOL_2"
    ELECTRONIC_ECN = "ELECTRONIC_ECN"

class OrderType(Enum):
    MARKET = "market"
    LIMIT = "limit"
    STOP = "stop"
    ICEBERG = "iceberg"
    TWAP = "twap"
    VWAP = "vwap"
    IMPLEMENTATION_SHORTFALL = "implementation_shortfall"

class BenchmarkType(Enum):
    ARRIVAL_PRICE = "arrival_price"
    VWAP = "vwap"
    TWAP = "twap"
    CLOSING_PRICE = "closing_price"
    IMPLEMENTATION_SHORTFALL = "implementation_shortfall"
    BEST_BID_OFFER = "best_bid_offer"

@dataclass
class Trade:
    trade_id: str
    symbol: str
    side: str  # 'buy' or 'sell'
    quantity: float
    price: float
    venue: ExecutionVenue
    timestamp: datetime
    order_type: OrderType
    commission: float
    market_impact: float

@dataclass
class ExecutionQuality:
    benchmark_price: float
    executed_price: float
    slippage_bps: float
    market_impact_bps: float
    timing_cost_bps: float
    opportunity_cost_bps: float
    total_cost_bps: float
    fill_rate: float
    execution_time_seconds: float

@dataclass
class VenueMetrics:
    venue: ExecutionVenue
    fill_rate: float
    average_slippage_bps: float
    average_market_impact_bps: float
    execution_speed_ms: float
    cost_savings_bps: float
    reliability_score: float

class BestExecutionAnalyzer:
    """Comprehensive best execution analysis and monitoring"""
    
    def __init__(self):
        self.trades: List[Trade] = []
        self.execution_quality_history: List[ExecutionQuality] = []
        self.venue_metrics: Dict[ExecutionVenue, VenueMetrics] = {}
        
        # Analysis components
        self.benchmark_calculator = BenchmarkCalculator()
        self.slippage_analyzer = SlippageAnalyzer()
        self.market_impact_estimator = MarketImpactEstimator()
        self.venue_analyzer = VenueAnalyzer()
        self.cost_analyzer = TransactionCostAnalyzer()
        self.regulatory_reporter = RegulatoryReporter()
        
    async def analyze_execution_quality(self, trade: Trade, market_data: Dict) -> ExecutionQuality:
        """Comprehensive execution quality analysis"""
        
        # Calculate benchmark prices
        benchmarks = await self.benchmark_calculator.calculate_benchmarks(
            trade, market_data
        )
        
        # Primary benchmark (typically arrival price or VWAP)
        primary_benchmark = benchmarks.get(BenchmarkType.ARRIVAL_PRICE, trade.price)
        
        # Calculate slippage components
        slippage_analysis = await self.slippage_analyzer.analyze_slippage(
            trade, primary_benchmark, market_data
        )
        
        # Estimate market impact
        market_impact = await self.market_impact_estimator.estimate_impact(
            trade, market_data
        )
        
        # Calculate timing and opportunity costs
        timing_cost = await self._calculate_timing_cost(trade, market_data)
        opportunity_cost = await self._calculate_opportunity_cost(trade, market_data)
        
        # Calculate execution metrics
        fill_rate = await self._calculate_fill_rate(trade, market_data)
        execution_time = await self._calculate_execution_time(trade, market_data)
        
        # Total cost calculation
        total_cost_bps = (slippage_analysis['total_slippage'] + 
                         market_impact + 
                         timing_cost + 
                         opportunity_cost)
        
        execution_quality = ExecutionQuality(
            benchmark_price=primary_benchmark,
            executed_price=trade.price,
            slippage_bps=slippage_analysis['total_slippage'],
            market_impact_bps=market_impact,
            timing_cost_bps=timing_cost,
            opportunity_cost_bps=opportunity_cost,
            total_cost_bps=total_cost_bps,
            fill_rate=fill_rate,
            execution_time_seconds=execution_time
        )
        
        # Store for historical analysis
        self.execution_quality_history.append(execution_quality)
        self.trades.append(trade)
        
        return execution_quality
    
    async def analyze_venue_performance(self, time_window: timedelta) -> Dict[ExecutionVenue, VenueMetrics]:
        """Analyze performance across different execution venues"""
        
        cutoff_time = datetime.now() - time_window
        recent_trades = [t for t in self.trades if t.timestamp > cutoff_time]
        recent_quality = [q for q, t in zip(self.execution_quality_history, self.trades) 
                         if t.timestamp > cutoff_time]
        
        venue_performance = {}
        
        for venue in ExecutionVenue:
            venue_trades = [t for t in recent_trades if t.venue == venue]
            venue_quality = [q for q, t in zip(recent_quality, recent_trades) if t.venue == venue]
            
            if venue_trades and venue_quality:
                metrics = await self.venue_analyzer.calculate_venue_metrics(
                    venue, venue_trades, venue_quality
                )
                venue_performance[venue] = metrics
        
        self.venue_metrics = venue_performance
        return venue_performance
    
    async def generate_best_execution_report(self, period: timedelta) -> Dict:
        """Generate comprehensive best execution report"""
        
        # Analyze execution quality over period
        quality_stats = await self._calculate_quality_statistics(period)
        
        # Analyze venue performance
        venue_performance = await self.analyze_venue_performance(period)
        
        # Calculate cost savings opportunities
        cost_savings = await self._identify_cost_savings(period)
        
        # Regulatory metrics
        regulatory_metrics = await self.regulatory_reporter.calculate_metrics(
            self.trades, self.execution_quality_history, period
        )
        
        # Benchmark comparisons
        benchmark_analysis = await self._analyze_benchmark_performance(period)
        
        return {
            'quality_statistics': quality_stats,
            'venue_performance': venue_performance,
            'cost_savings_opportunities': cost_savings,
            'regulatory_metrics': regulatory_metrics,
            'benchmark_analysis': benchmark_analysis,
            'recommendations': await self._generate_recommendations()
        }
    
    async def _calculate_timing_cost(self, trade: Trade, market_data: Dict) -> float:
        """Calculate timing cost component"""
        
        # Get market conditions at order placement vs execution
        order_placement_price = market_data.get('order_placement_price', trade.price)
        market_move = (trade.price - order_placement_price) / order_placement_price
        
        # Timing cost depends on whether market moved favorably or unfavorably
        if trade.side == 'buy':
            timing_cost = max(0, market_move) * 10000  # Unfavorable move in bps
        else:
            timing_cost = max(0, -market_move) * 10000  # Unfavorable move in bps
        
        return timing_cost
    
    async def _calculate_opportunity_cost(self, trade: Trade, market_data: Dict) -> float:
        """Calculate opportunity cost from delayed or partial execution"""
        
        # Get intended vs actual execution details
        intended_quantity = market_data.get('intended_quantity', trade.quantity)
        execution_delay = market_data.get('execution_delay_seconds', 0)
        
        # Opportunity cost from partial fills
        fill_ratio = trade.quantity / intended_quantity
        unfilled_quantity = intended_quantity - trade.quantity
        
        # Estimate cost of not executing unfilled portion
        price_movement = market_data.get('price_movement_during_delay', 0)
        opportunity_cost = (unfilled_quantity / intended_quantity) * abs(price_movement) * 10000
        
        # Add delay cost
        delay_cost = execution_delay * 0.01  # 1bp per second of delay
        
        return opportunity_cost + delay_cost
    
    async def _calculate_fill_rate(self, trade: Trade, market_data: Dict) -> float:
        """Calculate order fill rate"""
        
        intended_quantity = market_data.get('intended_quantity', trade.quantity)
        return trade.quantity / intended_quantity
    
    async def _calculate_execution_time(self, trade: Trade, market_data: Dict) -> float:
        """Calculate execution time"""
        
        order_placement_time = market_data.get('order_placement_time', trade.timestamp)
        execution_time = (trade.timestamp - order_placement_time).total_seconds()
        
        return max(0, execution_time)
    
    async def _calculate_quality_statistics(self, period: timedelta) -> Dict:
        """Calculate execution quality statistics over period"""
        
        cutoff_time = datetime.now() - period
        recent_quality = [q for q, t in zip(self.execution_quality_history, self.trades) 
                         if t.timestamp > cutoff_time]
        
        if not recent_quality:
            return {}
        
        total_costs = [q.total_cost_bps for q in recent_quality]
        slippages = [q.slippage_bps for q in recent_quality]
        market_impacts = [q.market_impact_bps for q in recent_quality]
        fill_rates = [q.fill_rate for q in recent_quality]
        
        return {
            'average_total_cost_bps': np.mean(total_costs),
            'median_total_cost_bps': np.median(total_costs),
            'total_cost_volatility': np.std(total_costs),
            'average_slippage_bps': np.mean(slippages),
            'average_market_impact_bps': np.mean(market_impacts),
            'average_fill_rate': np.mean(fill_rates),
            'cost_distribution': {
                'p10': np.percentile(total_costs, 10),
                'p25': np.percentile(total_costs, 25),
                'p75': np.percentile(total_costs, 75),
                'p90': np.percentile(total_costs, 90),
                'p95': np.percentile(total_costs, 95)
            }
        }
    
    async def _identify_cost_savings(self, period: timedelta) -> Dict:
        """Identify potential cost savings opportunities"""
        
        venue_performance = await self.analyze_venue_performance(period)
        
        # Find best performing venue for each metric
        best_venues = {
            'lowest_slippage': min(venue_performance.items(), 
                                 key=lambda x: x[1].average_slippage_bps, default=(None, None)),
            'highest_fill_rate': max(venue_performance.items(), 
                                   key=lambda x: x[1].fill_rate, default=(None, None)),
            'fastest_execution': min(venue_performance.items(), 
                                   key=lambda x: x[1].execution_speed_ms, default=(None, None))
        }
        
        # Calculate potential savings
        current_avg_cost = np.mean([q.total_cost_bps for q in self.execution_quality_history[-100:]])
        
        potential_savings = {}
        for metric, (venue, performance) in best_venues.items():
            if venue and performance:
                if metric == 'lowest_slippage':
                    potential_savings[metric] = {
                        'venue': venue,
                        'current_cost_bps': current_avg_cost,
                        'potential_cost_bps': performance.average_slippage_bps,
                        'savings_bps': current_avg_cost - performance.average_slippage_bps
                    }
        
        return potential_savings
    
    async def _analyze_benchmark_performance(self, period: timedelta) -> Dict:
        """Analyze performance against different benchmarks"""
        
        cutoff_time = datetime.now() - period
        recent_trades = [t for t in self.trades if t.timestamp > cutoff_time]
        
        benchmark_performance = {}
        
        for benchmark_type in BenchmarkType:
            performances = []
            
            for trade in recent_trades:
                # Would calculate performance vs this benchmark
                # Placeholder calculation
                performance_bps = np.random.normal(0, 5)  # Placeholder
                performances.append(performance_bps)
            
            if performances:
                benchmark_performance[benchmark_type.value] = {
                    'average_performance_bps': np.mean(performances),
                    'volatility_bps': np.std(performances),
                    'hit_rate': sum(1 for p in performances if p >= 0) / len(performances)
                }
        
        return benchmark_performance
    
    async def _generate_recommendations(self) -> List[str]:
        """Generate actionable recommendations for execution improvement"""
        
        recommendations = []
        
        # Analyze recent performance
        if len(self.execution_quality_history) >= 10:
            recent_costs = [q.total_cost_bps for q in self.execution_quality_history[-10:]]
            avg_cost = np.mean(recent_costs)
            
            if avg_cost > 10:  # High execution costs
                recommendations.append(
                    "Consider using more aggressive order types or alternative venues "
                    "to reduce execution costs"
                )
            
            if np.std(recent_costs) > 5:  # High cost volatility
                recommendations.append(
                    "Execution costs are highly variable - consider implementing "
                    "more consistent execution strategies"
                )
        
        # Venue-specific recommendations
        if self.venue_metrics:
            best_venue = min(self.venue_metrics.items(), 
                           key=lambda x: x[1].average_slippage_bps)
            recommendations.append(
                f"Consider increasing allocation to {best_venue[0].value} "
                f"which shows lowest average slippage"
            )
        
        return recommendations


class BenchmarkCalculator:
    """Calculate various execution benchmarks"""
    
    async def calculate_benchmarks(self, trade: Trade, market_data: Dict) -> Dict[BenchmarkType, float]:
        """Calculate all relevant benchmarks for the trade"""
        
        benchmarks = {}
        
        # Arrival price benchmark
        benchmarks[BenchmarkType.ARRIVAL_PRICE] = market_data.get('arrival_price', trade.price)
        
        # VWAP benchmark
        benchmarks[BenchmarkType.VWAP] = await self._calculate_vwap_benchmark(trade, market_data)
        
        # TWAP benchmark
        benchmarks[BenchmarkType.TWAP] = await self._calculate_twap_benchmark(trade, market_data)
        
        # Closing price benchmark
        benchmarks[BenchmarkType.CLOSING_PRICE] = market_data.get('closing_price', trade.price)
        
        # Implementation shortfall benchmark
        benchmarks[BenchmarkType.IMPLEMENTATION_SHORTFALL] = await self._calculate_is_benchmark(trade, market_data)
        
        # Best bid/offer benchmark
        benchmarks[BenchmarkType.BEST_BID_OFFER] = await self._calculate_bbo_benchmark(trade, market_data)
        
        return benchmarks
    
    async def _calculate_vwap_benchmark(self, trade: Trade, market_data: Dict) -> float:
        """Calculate Volume Weighted Average Price benchmark"""
        
        # Get intraday trades and volumes
        intraday_data = market_data.get('intraday_data', [])
        
        if not intraday_data:
            return trade.price
        
        total_volume = sum(data['volume'] for data in intraday_data)
        if total_volume == 0:
            return trade.price
        
        vwap = sum(data['price'] * data['volume'] for data in intraday_data) / total_volume
        return vwap
    
    async def _calculate_twap_benchmark(self, trade: Trade, market_data: Dict) -> float:
        """Calculate Time Weighted Average Price benchmark"""
        
        intraday_data = market_data.get('intraday_data', [])
        
        if not intraday_data:
            return trade.price
        
        prices = [data['price'] for data in intraday_data]
        return np.mean(prices)
    
    async def _calculate_is_benchmark(self, trade: Trade, market_data: Dict) -> float:
        """Calculate Implementation Shortfall benchmark"""
        
        # Implementation shortfall uses arrival price and market impact
        arrival_price = market_data.get('arrival_price', trade.price)
        market_impact = market_data.get('estimated_market_impact', 0)
        
        if trade.side == 'buy':
            is_benchmark = arrival_price + market_impact
        else:
            is_benchmark = arrival_price - market_impact
        
        return is_benchmark
    
    async def _calculate_bbo_benchmark(self, trade: Trade, market_data: Dict) -> float:
        """Calculate Best Bid/Offer benchmark"""
        
        if trade.side == 'buy':
            return market_data.get('best_ask', trade.price)
        else:
            return market_data.get('best_bid', trade.price)


class SlippageAnalyzer:
    """Analyze different components of execution slippage"""
    
    async def analyze_slippage(self, trade: Trade, benchmark: float, market_data: Dict) -> Dict:
        """Comprehensive slippage analysis"""
        
        # Basic slippage calculation
        if trade.side == 'buy':
            basic_slippage = (trade.price - benchmark) / benchmark * 10000
        else:
            basic_slippage = (benchmark - trade.price) / benchmark * 10000
        
        # Decompose slippage into components
        market_movement_slippage = await self._calculate_market_movement_slippage(trade, market_data)
        venue_specific_slippage = await self._calculate_venue_slippage(trade, market_data)
        timing_slippage = await self._calculate_timing_slippage(trade, market_data)
        size_impact_slippage = await self._calculate_size_impact_slippage(trade, market_data)
        
        return {
            'total_slippage': basic_slippage,
            'market_movement': market_movement_slippage,
            'venue_specific': venue_specific_slippage,
            'timing_component': timing_slippage,
            'size_impact': size_impact_slippage
        }
    
    async def _calculate_market_movement_slippage(self, trade: Trade, market_data: Dict) -> float:
        """Calculate slippage due to overall market movement"""
        
        market_return = market_data.get('market_return_during_execution', 0)
        beta = market_data.get('stock_beta', 1.0)
        
        market_slippage = market_return * beta * 10000  # Convert to bps
        return market_slippage
    
    async def _calculate_venue_slippage(self, trade: Trade, market_data: Dict) -> float:
        """Calculate venue-specific slippage"""
        
        # Compare to best available price across all venues
        best_available_price = market_data.get('best_available_price', trade.price)
        
        if trade.side == 'buy':
            venue_slippage = (trade.price - best_available_price) / best_available_price * 10000
        else:
            venue_slippage = (best_available_price - trade.price) / best_available_price * 10000
        
        return max(0, venue_slippage)  # Only positive slippage
    
    async def _calculate_timing_slippage(self, trade: Trade, market_data: Dict) -> float:
        """Calculate slippage due to execution timing"""
        
        optimal_execution_time = market_data.get('optimal_execution_time')
        actual_execution_time = trade.timestamp
        
        if not optimal_execution_time:
            return 0.0
        
        time_delay = (actual_execution_time - optimal_execution_time).total_seconds()
        volatility = market_data.get('intraday_volatility', 0.02)
        
        # Timing slippage increases with delay and volatility
        timing_slippage = abs(time_delay) * volatility * 100  # Rough approximation
        
        return timing_slippage
    
    async def _calculate_size_impact_slippage(self, trade: Trade, market_data: Dict) -> float:
        """Calculate slippage due to trade size impact"""
        
        average_trade_size = market_data.get('average_trade_size', 1000)
        size_ratio = trade.quantity / average_trade_size
        
        # Larger trades typically have higher slippage
        size_impact = (size_ratio - 1) * 2.0 if size_ratio > 1 else 0.0
        
        return size_impact


class MarketImpactEstimator:
    """Estimate market impact of trades"""
    
    async def estimate_impact(self, trade: Trade, market_data: Dict) -> float:
        """Estimate market impact in basis points"""
        
        # Linear impact model (simplified)
        daily_volume = market_data.get('daily_volume', 1000000)
        participation_rate = trade.quantity / daily_volume
        
        # Base impact
        base_impact = participation_rate * 50  # 50bps per 1% of daily volume
        
        # Adjust for market conditions
        volatility = market_data.get('volatility', 0.02)
        spread = market_data.get('bid_ask_spread', 0.001)
        
        volatility_adjustment = volatility * 100
        spread_adjustment = spread * 5000  # Convert spread to bps impact
        
        # Venue adjustment
        venue_adjustment = await self._get_venue_impact_adjustment(trade.venue)
        
        total_impact = base_impact + volatility_adjustment + spread_adjustment + venue_adjustment
        
        return total_impact
    
    async def _get_venue_impact_adjustment(self, venue: ExecutionVenue) -> float:
        """Get venue-specific impact adjustment"""
        
        venue_impacts = {
            ExecutionVenue.NYSE: 0.0,       # Baseline
            ExecutionVenue.NASDAQ: 0.1,     # Slightly higher impact
            ExecutionVenue.BATS: -0.2,      # Lower impact
            ExecutionVenue.DARK_POOL_1: -0.5,  # Much lower impact
            ExecutionVenue.DARK_POOL_2: -0.5,
            ExecutionVenue.ELECTRONIC_ECN: 0.0
        }
        
        return venue_impacts.get(venue, 0.0)


class VenueAnalyzer:
    """Analyze execution venue performance"""
    
    async def calculate_venue_metrics(self, venue: ExecutionVenue, 
                                    trades: List[Trade],
                                    quality_metrics: List[ExecutionQuality]) -> VenueMetrics:
        """Calculate comprehensive venue performance metrics"""
        
        if not trades or not quality_metrics:
            return VenueMetrics(venue, 0, 0, 0, 0, 0, 0)
        
        # Fill rate calculation
        fill_rate = np.mean([q.fill_rate for q in quality_metrics])
        
        # Average slippage
        avg_slippage = np.mean([q.slippage_bps for q in quality_metrics])
        
        # Average market impact
        avg_impact = np.mean([q.market_impact_bps for q in quality_metrics])
        
        # Execution speed (convert to milliseconds)
        avg_speed = np.mean([q.execution_time_seconds for q in quality_metrics]) * 1000
        
        # Cost savings (compared to worst venue)
        total_costs = [q.total_cost_bps for q in quality_metrics]
        worst_cost = max(total_costs) if total_costs else 0
        avg_cost = np.mean(total_costs)
        cost_savings = worst_cost - avg_cost
        
        # Reliability score (based on consistency)
        cost_volatility = np.std(total_costs)
        reliability = 1.0 / (1.0 + cost_volatility / 10)  # Normalize
        
        return VenueMetrics(
            venue=venue,
            fill_rate=fill_rate,
            average_slippage_bps=avg_slippage,
            average_market_impact_bps=avg_impact,
            execution_speed_ms=avg_speed,
            cost_savings_bps=cost_savings,
            reliability_score=reliability
        )


class TransactionCostAnalyzer:
    """Analyze comprehensive transaction costs"""
    
    async def analyze_costs(self, trades: List[Trade], 
                          quality_metrics: List[ExecutionQuality]) -> Dict:
        """Comprehensive transaction cost analysis"""
        
        if not trades or not quality_metrics:
            return {}
        
        # Explicit costs
        explicit_costs = [trade.commission for trade in trades]
        
        # Implicit costs
        implicit_costs = [q.total_cost_bps - (trade.commission / (trade.quantity * trade.price) * 10000)
                         for q, trade in zip(quality_metrics, trades)]
        
        # Opportunity costs
        opportunity_costs = [q.opportunity_cost_bps for q in quality_metrics]
        
        return {
            'explicit_costs': {
                'total': sum(explicit_costs),
                'average_bps': np.mean([c / (t.quantity * t.price) * 10000 
                                      for c, t in zip(explicit_costs, trades)]),
                'distribution': np.percentile(explicit_costs, [10, 25, 50, 75, 90])
            },
            'implicit_costs': {
                'average_bps': np.mean(implicit_costs),
                'volatility_bps': np.std(implicit_costs),
                'distribution': np.percentile(implicit_costs, [10, 25, 50, 75, 90])
            },
            'opportunity_costs': {
                'average_bps': np.mean(opportunity_costs),
                'total_bps': sum(opportunity_costs),
                'frequency': sum(1 for c in opportunity_costs if c > 0) / len(opportunity_costs)
            }
        }


class RegulatoryReporter:
    """Generate regulatory compliance reports"""
    
    async def calculate_metrics(self, trades: List[Trade], 
                              quality_metrics: List[ExecutionQuality],
                              period: timedelta) -> Dict:
        """Calculate regulatory required metrics"""
        
        cutoff_time = datetime.now() - period
        recent_trades = [t for t in trades if t.timestamp > cutoff_time]
        recent_quality = [q for q, t in zip(quality_metrics, trades) if t.timestamp > cutoff_time]
        
        if not recent_trades:
            return {}
        
        # Mifid II / Rule 605 style metrics
        return {
            'fill_rates': {
                'market_orders': await self._calculate_fill_rate_by_type(recent_trades, OrderType.MARKET),
                'limit_orders': await self._calculate_fill_rate_by_type(recent_trades, OrderType.LIMIT),
                'all_orders': len(recent_trades) / len(recent_trades)  # Simplified
            },
            'speed_of_execution': {
                'average_seconds': np.mean([q.execution_time_seconds for q in recent_quality]),
                'p95_seconds': np.percentile([q.execution_time_seconds for q in recent_quality], 95)
            },
            'price_improvement': {
                'frequency': await self._calculate_price_improvement_frequency(recent_trades, recent_quality),
                'average_bps': await self._calculate_average_price_improvement(recent_trades, recent_quality)
            },
            'effective_spread': {
                'average_bps': np.mean([abs(q.slippage_bps) for q in recent_quality])
            }
        }
    
    async def _calculate_fill_rate_by_type(self, trades: List[Trade], order_type: OrderType) -> float:
        """Calculate fill rate for specific order type"""
        
        type_trades = [t for t in trades if t.order_type == order_type]
        if not type_trades:
            return 0.0
        
        # Simplified - assume all trades in list were filled
        return 1.0
    
    async def _calculate_price_improvement_frequency(self, trades: List[Trade], 
                                                   quality_metrics: List[ExecutionQuality]) -> float:
        """Calculate frequency of price improvement"""
        
        improvements = [1 for q in quality_metrics if q.slippage_bps < 0]  # Negative slippage = improvement
        return len(improvements) / len(quality_metrics) if quality_metrics else 0.0
    
    async def _calculate_average_price_improvement(self, trades: List[Trade],
                                                 quality_metrics: List[ExecutionQuality]) -> float:
        """Calculate average price improvement when it occurs"""
        
        improvements = [abs(q.slippage_bps) for q in quality_metrics if q.slippage_bps < 0]
        return np.mean(improvements) if improvements else 0.0


# Usage example
async def main():
    # Initialize best execution analyzer
    analyzer = BestExecutionAnalyzer()
    
    # Sample trade
    trade = Trade(
        trade_id="T001",
        symbol="AAPL",
        side="buy",
        quantity=1000,
        price=150.05,
        venue=ExecutionVenue.NYSE,
        timestamp=datetime.now(),
        order_type=OrderType.LIMIT,
        commission=1.0,
        market_impact=0.02
    )
    
    # Market data
    market_data = {
        'arrival_price': 150.00,
        'vwap': 150.03,
        'closing_price': 150.10,
        'best_bid': 149.99,
        'best_ask': 150.01,
        'daily_volume': 1000000,
        'volatility': 0.025,
        'bid_ask_spread': 0.0002,
        'intended_quantity': 1000,
        'execution_delay_seconds': 2.5
    }
    
    # Analyze execution quality
    quality = await analyzer.analyze_execution_quality(trade, market_data)
    
    print(f"Execution Quality Analysis:")
    print(f"Benchmark Price: ${quality.benchmark_price:.4f}")
    print(f"Executed Price: ${quality.executed_price:.4f}")
    print(f"Slippage: {quality.slippage_bps:.2f} bps")
    print(f"Market Impact: {quality.market_impact_bps:.2f} bps")
    print(f"Total Cost: {quality.total_cost_bps:.2f} bps")
    print(f"Fill Rate: {quality.fill_rate:.1%}")
    print(f"Execution Time: {quality.execution_time_seconds:.2f} seconds")

if __name__ == "__main__":
    asyncio.run(main())
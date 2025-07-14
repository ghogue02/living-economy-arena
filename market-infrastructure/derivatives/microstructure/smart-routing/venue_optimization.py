"""
Smart Order Routing with Venue Selection Optimization
Phase 3 Market Microstructure Optimization
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Dict, List, Tuple, Optional, Callable
from enum import Enum
import asyncio
from datetime import datetime, timedelta
import scipy.optimize as optimize
from abc import ABC, abstractmethod

class VenueType(Enum):
    EXCHANGE = "exchange"
    DARK_POOL = "dark_pool"
    ECN = "ecn"
    ATS = "ats"
    CROSSING_NETWORK = "crossing_network"
    INTERNALIZER = "internalizer"

class OrderCharacteristics(Enum):
    AGGRESSIVE = "aggressive"
    PASSIVE = "passive"
    ICEBERG = "iceberg"
    BLOCK = "block"
    SWEEP = "sweep"

@dataclass
class VenueConfig:
    venue_id: str
    venue_type: VenueType
    fee_structure: Dict[str, float]
    latency_profile: Dict[str, float]
    liquidity_profile: Dict[str, float]
    market_share: float
    reliability_score: float
    dark_pool_protection: bool

@dataclass
class OrderSlice:
    slice_id: str
    parent_order_id: str
    venue: str
    quantity: float
    order_type: str
    timing_strategy: str
    expected_fill_rate: float
    expected_cost_bps: float

@dataclass
class ExecutionResult:
    venue: str
    quantity_filled: float
    average_price: float
    total_cost: float
    execution_time_ms: float
    market_impact_bps: float
    opportunity_cost_bps: float

class SmartOrderRouter:
    """Intelligent order routing with multi-venue optimization"""
    
    def __init__(self):
        self.venues: Dict[str, VenueConfig] = {}
        self.routing_algorithms = {
            'cost_minimization': CostMinimizationRouter(),
            'implementation_shortfall': ImplementationShortfallRouter(),
            'market_impact_minimization': MarketImpactRouter(),
            'liquidity_seeking': LiquiditySeekingRouter(),
            'time_priority': TimePriorityRouter()
        }
        
        self.execution_history: List[ExecutionResult] = []
        self.venue_performance_tracker = VenuePerformanceTracker()
        self.dynamic_optimizer = DynamicRoutingOptimizer()
        
    async def route_order(self, order: Dict, routing_strategy: str = 'cost_minimization') -> List[OrderSlice]:
        """Route order optimally across venues"""
        
        # Analyze order characteristics
        order_analysis = await self._analyze_order_characteristics(order)
        
        # Get current market conditions
        market_conditions = await self._get_market_conditions(order['symbol'])
        
        # Analyze venue availability and performance
        venue_analysis = await self._analyze_venue_landscape(order, market_conditions)
        
        # Select optimal routing algorithm
        router = self.routing_algorithms.get(routing_strategy)
        if not router:
            router = self.routing_algorithms['cost_minimization']
        
        # Generate routing plan
        routing_plan = await router.generate_routing_plan(
            order, order_analysis, venue_analysis, market_conditions
        )
        
        # Optimize slice timing and sizing
        optimized_slices = await self.dynamic_optimizer.optimize_execution_plan(
            routing_plan, market_conditions
        )
        
        # Apply risk controls and constraints
        validated_slices = await self._apply_routing_constraints(optimized_slices, order)
        
        return validated_slices
    
    async def execute_routing_plan(self, slices: List[OrderSlice]) -> List[ExecutionResult]:
        """Execute the routing plan across multiple venues"""
        
        execution_tasks = []
        
        # Create execution tasks for each venue
        venue_groups = {}
        for slice_order in slices:
            venue = slice_order.venue
            if venue not in venue_groups:
                venue_groups[venue] = []
            venue_groups[venue].append(slice_order)
        
        # Execute on each venue in parallel
        for venue, venue_slices in venue_groups.items():
            task = asyncio.create_task(
                self._execute_on_venue(venue, venue_slices)
            )
            execution_tasks.append(task)
        
        # Wait for all executions to complete
        execution_results = await asyncio.gather(*execution_tasks, return_exceptions=True)
        
        # Flatten results and handle exceptions
        all_results = []
        for result in execution_results:
            if isinstance(result, Exception):
                print(f"Execution error: {result}")
            elif isinstance(result, list):
                all_results.extend(result)
            else:
                all_results.append(result)
        
        # Update performance tracking
        for result in all_results:
            await self.venue_performance_tracker.update_performance(result)
            self.execution_history.append(result)
        
        return all_results
    
    async def _analyze_order_characteristics(self, order: Dict) -> Dict:
        """Analyze order characteristics to inform routing decisions"""
        
        size = order.get('quantity', 0)
        symbol = order.get('symbol', '')
        urgency = order.get('urgency', 'medium')
        
        # Get symbol-specific metrics
        avg_daily_volume = await self._get_average_daily_volume(symbol)
        current_spread = await self._get_current_spread(symbol)
        volatility = await self._get_volatility(symbol)
        
        # Calculate order characteristics
        participation_rate = size / avg_daily_volume if avg_daily_volume > 0 else 0
        
        # Classify order type
        if participation_rate > 0.1:
            order_class = OrderCharacteristics.BLOCK
        elif urgency == 'high':
            order_class = OrderCharacteristics.AGGRESSIVE
        elif size > avg_daily_volume * 0.01:
            order_class = OrderCharacteristics.ICEBERG
        else:
            order_class = OrderCharacteristics.PASSIVE
        
        return {
            'order_class': order_class,
            'participation_rate': participation_rate,
            'size_category': self._categorize_order_size(participation_rate),
            'urgency_level': urgency,
            'estimated_market_impact': participation_rate * volatility * 100,  # bps
            'complexity_score': self._calculate_complexity_score(order),
            'dark_pool_suitable': participation_rate > 0.05,  # Large orders suitable for dark pools
            'sweep_candidate': urgency == 'high' and participation_rate < 0.02
        }
    
    async def _get_market_conditions(self, symbol: str) -> Dict:
        """Get current market conditions for the symbol"""
        
        return {
            'volatility': await self._get_volatility(symbol),
            'spread_bps': await self._get_current_spread(symbol),
            'liquidity_score': await self._get_liquidity_score(symbol),
            'market_impact_coefficient': await self._get_market_impact_coefficient(symbol),
            'trading_session': await self._get_trading_session(),
            'market_regime': await self._detect_market_regime(symbol),
            'venue_fragmentation': await self._calculate_venue_fragmentation(symbol)
        }
    
    async def _analyze_venue_landscape(self, order: Dict, market_conditions: Dict) -> Dict:
        """Analyze current venue landscape and availability"""
        
        venue_analysis = {}
        
        for venue_id, venue_config in self.venues.items():
            # Get real-time venue metrics
            venue_metrics = await self._get_venue_metrics(venue_id, order['symbol'])
            
            # Calculate venue attractiveness score
            attractiveness = await self._calculate_venue_attractiveness(
                venue_config, venue_metrics, order, market_conditions
            )
            
            venue_analysis[venue_id] = {
                'config': venue_config,
                'metrics': venue_metrics,
                'attractiveness_score': attractiveness,
                'estimated_fill_rate': venue_metrics.get('fill_rate', 0.8),
                'estimated_cost_bps': venue_metrics.get('average_cost_bps', 5.0),
                'available_liquidity': venue_metrics.get('available_liquidity', 0),
                'execution_risk': venue_metrics.get('execution_risk', 0.1)
            }
        
        return venue_analysis
    
    async def _calculate_venue_attractiveness(self, venue_config: VenueConfig,
                                            venue_metrics: Dict, order: Dict,
                                            market_conditions: Dict) -> float:
        """Calculate venue attractiveness score"""
        
        # Base attractiveness factors
        cost_score = 1.0 / (1.0 + venue_metrics.get('average_cost_bps', 5.0) / 10.0)
        liquidity_score = min(1.0, venue_metrics.get('available_liquidity', 0) / order['quantity'])
        reliability_score = venue_config.reliability_score
        latency_score = 1.0 / (1.0 + venue_config.latency_profile.get('average_ms', 10) / 100.0)
        
        # Venue type preferences based on order characteristics
        venue_type_bonus = 0.0
        if venue_config.venue_type == VenueType.DARK_POOL and order.get('quantity', 0) > 10000:
            venue_type_bonus = 0.2
        elif venue_config.venue_type == VenueType.EXCHANGE and order.get('urgency') == 'high':
            venue_type_bonus = 0.1
        
        # Market condition adjustments
        volatility_adjustment = 1.0
        if market_conditions.get('volatility', 0.02) > 0.05:  # High volatility
            if venue_config.venue_type == VenueType.DARK_POOL:
                volatility_adjustment = 1.2  # Dark pools better in volatile markets
        
        # Calculate final attractiveness
        attractiveness = (cost_score * 0.3 + 
                         liquidity_score * 0.3 + 
                         reliability_score * 0.2 + 
                         latency_score * 0.2 + 
                         venue_type_bonus) * volatility_adjustment
        
        return min(1.0, attractiveness)
    
    async def _apply_routing_constraints(self, slices: List[OrderSlice], original_order: Dict) -> List[OrderSlice]:
        """Apply routing constraints and risk controls"""
        
        validated_slices = []
        total_quantity = sum(slice_order.quantity for slice_order in slices)
        
        # Ensure total quantity matches original order
        if abs(total_quantity - original_order['quantity']) > 0.01:
            # Adjust last slice to match exactly
            if slices:
                adjustment = original_order['quantity'] - total_quantity
                slices[-1].quantity += adjustment
        
        # Apply venue concentration limits
        venue_quantities = {}
        for slice_order in slices:
            venue = slice_order.venue
            venue_quantities[venue] = venue_quantities.get(venue, 0) + slice_order.quantity
        
        # Limit concentration per venue (e.g., max 50% to any single venue for large orders)
        max_venue_concentration = 0.5 if original_order['quantity'] > 10000 else 1.0
        
        for slice_order in slices:
            venue = slice_order.venue
            venue_total = venue_quantities[venue]
            
            if venue_total / original_order['quantity'] <= max_venue_concentration:
                validated_slices.append(slice_order)
            else:
                # Reduce slice size to meet concentration limit
                max_allowed = original_order['quantity'] * max_venue_concentration
                if slice_order.venue not in [s.venue for s in validated_slices]:
                    # First slice for this venue
                    slice_order.quantity = min(slice_order.quantity, max_allowed)
                    validated_slices.append(slice_order)
        
        return validated_slices
    
    async def _execute_on_venue(self, venue: str, slices: List[OrderSlice]) -> List[ExecutionResult]:
        """Execute order slices on a specific venue"""
        
        results = []
        
        for slice_order in slices:
            start_time = datetime.now()
            
            # Simulate execution (in practice, this would connect to actual venue APIs)
            execution_result = await self._simulate_venue_execution(venue, slice_order)
            
            end_time = datetime.now()
            execution_time = (end_time - start_time).total_seconds() * 1000  # milliseconds
            
            result = ExecutionResult(
                venue=venue,
                quantity_filled=execution_result['quantity_filled'],
                average_price=execution_result['average_price'],
                total_cost=execution_result['total_cost'],
                execution_time_ms=execution_time,
                market_impact_bps=execution_result['market_impact_bps'],
                opportunity_cost_bps=execution_result['opportunity_cost_bps']
            )
            
            results.append(result)
        
        return results
    
    async def _simulate_venue_execution(self, venue: str, slice_order: OrderSlice) -> Dict:
        """Simulate order execution on venue (placeholder for actual execution)"""
        
        # Get venue configuration
        venue_config = self.venues.get(venue)
        if not venue_config:
            raise ValueError(f"Unknown venue: {venue}")
        
        # Simulate execution with some randomness
        fill_rate = np.random.uniform(0.8, 1.0)  # 80-100% fill rate
        quantity_filled = slice_order.quantity * fill_rate
        
        # Simulate price and costs
        base_price = 100.0  # Placeholder
        market_impact = np.random.uniform(0, 2.0)  # 0-2 bps
        venue_fee = venue_config.fee_structure.get('taker_fee_bps', 0.3)
        
        average_price = base_price * (1 + market_impact / 10000)
        total_cost = quantity_filled * average_price + venue_fee * quantity_filled * base_price / 10000
        
        opportunity_cost = (slice_order.quantity - quantity_filled) * 0.5  # Cost of unfilled quantity
        
        return {
            'quantity_filled': quantity_filled,
            'average_price': average_price,
            'total_cost': total_cost,
            'market_impact_bps': market_impact,
            'opportunity_cost_bps': opportunity_cost
        }
    
    # Helper methods
    async def _get_average_daily_volume(self, symbol: str) -> float:
        return 1000000  # Placeholder
    
    async def _get_current_spread(self, symbol: str) -> float:
        return 0.002  # 20 bps placeholder
    
    async def _get_volatility(self, symbol: str) -> float:
        return 0.025  # 2.5% placeholder
    
    async def _get_liquidity_score(self, symbol: str) -> float:
        return 0.8  # Placeholder
    
    async def _get_market_impact_coefficient(self, symbol: str) -> float:
        return 0.1  # Placeholder
    
    async def _get_trading_session(self) -> str:
        hour = datetime.now().hour
        if 9 <= hour <= 16:
            return 'regular'
        else:
            return 'extended'
    
    async def _detect_market_regime(self, symbol: str) -> str:
        return 'normal'  # Placeholder
    
    async def _calculate_venue_fragmentation(self, symbol: str) -> float:
        return 0.6  # Placeholder
    
    async def _get_venue_metrics(self, venue_id: str, symbol: str) -> Dict:
        # Placeholder venue metrics
        return {
            'fill_rate': np.random.uniform(0.85, 0.98),
            'average_cost_bps': np.random.uniform(1.0, 8.0),
            'available_liquidity': np.random.uniform(50000, 500000),
            'execution_risk': np.random.uniform(0.05, 0.2)
        }
    
    def _categorize_order_size(self, participation_rate: float) -> str:
        if participation_rate > 0.1:
            return 'large'
        elif participation_rate > 0.01:
            return 'medium'
        else:
            return 'small'
    
    def _calculate_complexity_score(self, order: Dict) -> float:
        # Simplified complexity calculation
        base_complexity = 1.0
        if order.get('order_type') == 'iceberg':
            base_complexity += 0.5
        if order.get('time_in_force') == 'IOC':
            base_complexity += 0.3
        return base_complexity


class RoutingAlgorithm(ABC):
    """Abstract base class for routing algorithms"""
    
    @abstractmethod
    async def generate_routing_plan(self, order: Dict, order_analysis: Dict,
                                  venue_analysis: Dict, market_conditions: Dict) -> List[OrderSlice]:
        pass


class CostMinimizationRouter(RoutingAlgorithm):
    """Routing algorithm focused on minimizing total execution costs"""
    
    async def generate_routing_plan(self, order: Dict, order_analysis: Dict,
                                  venue_analysis: Dict, market_conditions: Dict) -> List[OrderSlice]:
        
        total_quantity = order['quantity']
        slices = []
        
        # Sort venues by cost attractiveness
        sorted_venues = sorted(venue_analysis.items(), 
                             key=lambda x: x[1]['estimated_cost_bps'])
        
        remaining_quantity = total_quantity
        slice_id = 0
        
        for venue_id, venue_info in sorted_venues:
            if remaining_quantity <= 0:
                break
            
            # Calculate optimal allocation to this venue
            max_venue_capacity = venue_info['available_liquidity']
            venue_allocation = min(remaining_quantity, max_venue_capacity * 0.3)  # Conservative allocation
            
            if venue_allocation > 0:
                slice_order = OrderSlice(
                    slice_id=f"{order['order_id']}_slice_{slice_id}",
                    parent_order_id=order['order_id'],
                    venue=venue_id,
                    quantity=venue_allocation,
                    order_type=self._determine_order_type(venue_info, order_analysis),
                    timing_strategy='immediate',
                    expected_fill_rate=venue_info['estimated_fill_rate'],
                    expected_cost_bps=venue_info['estimated_cost_bps']
                )
                
                slices.append(slice_order)
                remaining_quantity -= venue_allocation
                slice_id += 1
        
        return slices
    
    def _determine_order_type(self, venue_info: Dict, order_analysis: Dict) -> str:
        """Determine optimal order type for venue"""
        
        if order_analysis['urgency_level'] == 'high':
            return 'market'
        elif venue_info['config'].venue_type == VenueType.DARK_POOL:
            return 'hidden'
        else:
            return 'limit'


class ImplementationShortfallRouter(RoutingAlgorithm):
    """Implementation Shortfall optimization routing"""
    
    async def generate_routing_plan(self, order: Dict, order_analysis: Dict,
                                  venue_analysis: Dict, market_conditions: Dict) -> List[OrderSlice]:
        
        # Implement Almgren-Chriss model for optimal execution
        total_quantity = order['quantity']
        volatility = market_conditions['volatility']
        risk_aversion = 0.01  # Risk aversion parameter
        
        # Calculate optimal trading trajectory
        num_intervals = min(10, int(total_quantity / 1000))  # Max 10 intervals
        if num_intervals < 1:
            num_intervals = 1
        
        slice_sizes = await self._calculate_optimal_trajectory(
            total_quantity, num_intervals, volatility, risk_aversion
        )
        
        # Allocate slices to venues
        slices = []
        sorted_venues = sorted(venue_analysis.items(), 
                             key=lambda x: x[1]['attractiveness_score'], reverse=True)
        
        for i, slice_size in enumerate(slice_sizes):
            # Round-robin venue allocation with bias toward better venues
            venue_idx = i % min(len(sorted_venues), 3)  # Use top 3 venues
            venue_id, venue_info = sorted_venues[venue_idx]
            
            slice_order = OrderSlice(
                slice_id=f"{order['order_id']}_IS_{i}",
                parent_order_id=order['order_id'],
                venue=venue_id,
                quantity=slice_size,
                order_type='limit',
                timing_strategy='scheduled',
                expected_fill_rate=venue_info['estimated_fill_rate'],
                expected_cost_bps=venue_info['estimated_cost_bps']
            )
            
            slices.append(slice_order)
        
        return slices
    
    async def _calculate_optimal_trajectory(self, total_quantity: float, num_intervals: int,
                                          volatility: float, risk_aversion: float) -> List[float]:
        """Calculate optimal trading trajectory using Almgren-Chriss model"""
        
        # Simplified implementation of optimal trajectory
        T = 1.0  # Time horizon (normalized)
        dt = T / num_intervals
        
        # Market impact parameters
        temp_impact = 0.01  # Temporary impact coefficient
        perm_impact = 0.005  # Permanent impact coefficient
        
        # Calculate optimal trajectory
        kappa = np.sqrt(risk_aversion * volatility**2 / (temp_impact))
        tau = T * kappa
        
        trajectory = []
        for i in range(num_intervals):
            t = i * dt
            remaining_time = T - t
            
            if remaining_time > 0:
                # Optimal trading rate
                rate = total_quantity * kappa * np.sinh(kappa * remaining_time) / np.sinh(tau)
                slice_size = rate * dt
            else:
                slice_size = 0
            
            trajectory.append(max(0, slice_size))
        
        # Normalize to ensure total equals target quantity
        total_allocated = sum(trajectory)
        if total_allocated > 0:
            trajectory = [size * total_quantity / total_allocated for size in trajectory]
        
        return trajectory


class MarketImpactRouter(RoutingAlgorithm):
    """Routing focused on minimizing market impact"""
    
    async def generate_routing_plan(self, order: Dict, order_analysis: Dict,
                                  venue_analysis: Dict, market_conditions: Dict) -> List[OrderSlice]:
        
        # Prefer dark pools and venues with lower market impact
        dark_pools = {k: v for k, v in venue_analysis.items() 
                     if v['config'].venue_type == VenueType.DARK_POOL}
        
        slices = []
        total_quantity = order['quantity']
        
        if dark_pools and order_analysis['dark_pool_suitable']:
            # Allocate majority to dark pools
            dark_allocation = total_quantity * 0.7
            
            # Distribute among dark pools
            num_dark_pools = len(dark_pools)
            dark_slice_size = dark_allocation / num_dark_pools
            
            slice_id = 0
            for venue_id, venue_info in dark_pools.items():
                slice_order = OrderSlice(
                    slice_id=f"{order['order_id']}_dark_{slice_id}",
                    parent_order_id=order['order_id'],
                    venue=venue_id,
                    quantity=dark_slice_size,
                    order_type='hidden',
                    timing_strategy='patient',
                    expected_fill_rate=venue_info['estimated_fill_rate'] * 0.8,  # Lower for dark
                    expected_cost_bps=venue_info['estimated_cost_bps'] * 0.6     # Better cost
                )
                slices.append(slice_order)
                slice_id += 1
            
            # Remainder to best lit venue
            remaining = total_quantity - dark_allocation
            if remaining > 0:
                lit_venues = {k: v for k, v in venue_analysis.items() 
                             if v['config'].venue_type != VenueType.DARK_POOL}
                
                if lit_venues:
                    best_lit = max(lit_venues.items(), key=lambda x: x[1]['attractiveness_score'])
                    venue_id, venue_info = best_lit
                    
                    slice_order = OrderSlice(
                        slice_id=f"{order['order_id']}_lit_{slice_id}",
                        parent_order_id=order['order_id'],
                        venue=venue_id,
                        quantity=remaining,
                        order_type='limit',
                        timing_strategy='patient',
                        expected_fill_rate=venue_info['estimated_fill_rate'],
                        expected_cost_bps=venue_info['estimated_cost_bps']
                    )
                    slices.append(slice_order)
        
        else:
            # Use cost minimization as fallback
            cost_router = CostMinimizationRouter()
            slices = await cost_router.generate_routing_plan(
                order, order_analysis, venue_analysis, market_conditions
            )
        
        return slices


class LiquiditySeekingRouter(RoutingAlgorithm):
    """Routing focused on finding liquidity"""
    
    async def generate_routing_plan(self, order: Dict, order_analysis: Dict,
                                  venue_analysis: Dict, market_conditions: Dict) -> List[OrderSlice]:
        
        # Sort venues by available liquidity
        sorted_venues = sorted(venue_analysis.items(), 
                             key=lambda x: x[1]['available_liquidity'], reverse=True)
        
        slices = []
        total_quantity = order['quantity']
        remaining_quantity = total_quantity
        slice_id = 0
        
        for venue_id, venue_info in sorted_venues:
            if remaining_quantity <= 0:
                break
            
            available_liquidity = venue_info['available_liquidity']
            allocation = min(remaining_quantity, available_liquidity * 0.5)  # Take up to 50% of available
            
            if allocation > 0:
                slice_order = OrderSlice(
                    slice_id=f"{order['order_id']}_liq_{slice_id}",
                    parent_order_id=order['order_id'],
                    venue=venue_id,
                    quantity=allocation,
                    order_type='limit',
                    timing_strategy='aggressive',
                    expected_fill_rate=min(0.95, venue_info['estimated_fill_rate'] * 1.1),
                    expected_cost_bps=venue_info['estimated_cost_bps']
                )
                
                slices.append(slice_order)
                remaining_quantity -= allocation
                slice_id += 1
        
        return slices


class TimePriorityRouter(RoutingAlgorithm):
    """Routing optimized for time priority and speed"""
    
    async def generate_routing_plan(self, order: Dict, order_analysis: Dict,
                                  venue_analysis: Dict, market_conditions: Dict) -> List[OrderSlice]:
        
        # Sort venues by latency (fastest first)
        sorted_venues = sorted(venue_analysis.items(), 
                             key=lambda x: x[1]['config'].latency_profile.get('average_ms', 100))
        
        slices = []
        total_quantity = order['quantity']
        
        # Use fastest venue for majority of order
        if sorted_venues:
            fastest_venue_id, fastest_venue_info = sorted_venues[0]
            
            primary_allocation = total_quantity * 0.8
            slice_order = OrderSlice(
                slice_id=f"{order['order_id']}_fast_primary",
                parent_order_id=order['order_id'],
                venue=fastest_venue_id,
                quantity=primary_allocation,
                order_type='market',  # Aggressive for speed
                timing_strategy='immediate',
                expected_fill_rate=fastest_venue_info['estimated_fill_rate'],
                expected_cost_bps=fastest_venue_info['estimated_cost_bps'] * 1.2  # Higher cost for speed
            )
            slices.append(slice_order)
            
            # Backup allocation to second fastest
            remaining = total_quantity - primary_allocation
            if len(sorted_venues) > 1 and remaining > 0:
                backup_venue_id, backup_venue_info = sorted_venues[1]
                
                backup_slice = OrderSlice(
                    slice_id=f"{order['order_id']}_fast_backup",
                    parent_order_id=order['order_id'],
                    venue=backup_venue_id,
                    quantity=remaining,
                    order_type='limit',
                    timing_strategy='immediate',
                    expected_fill_rate=backup_venue_info['estimated_fill_rate'],
                    expected_cost_bps=backup_venue_info['estimated_cost_bps']
                )
                slices.append(backup_slice)
        
        return slices


class VenuePerformanceTracker:
    """Track and analyze venue performance over time"""
    
    def __init__(self):
        self.performance_history: List[Dict] = []
        self.venue_scores: Dict[str, float] = {}
        
    async def update_performance(self, execution_result: ExecutionResult):
        """Update venue performance metrics"""
        
        performance_record = {
            'timestamp': datetime.now(),
            'venue': execution_result.venue,
            'fill_rate': execution_result.quantity_filled / 1000,  # Normalized
            'cost_bps': execution_result.market_impact_bps + execution_result.opportunity_cost_bps,
            'execution_time_ms': execution_result.execution_time_ms,
            'total_cost': execution_result.total_cost
        }
        
        self.performance_history.append(performance_record)
        
        # Update venue scores
        await self._update_venue_scores()
    
    async def _update_venue_scores(self):
        """Update venue performance scores"""
        
        # Group performance by venue
        venue_performance = {}
        for record in self.performance_history[-1000:]:  # Last 1000 records
            venue = record['venue']
            if venue not in venue_performance:
                venue_performance[venue] = []
            venue_performance[venue].append(record)
        
        # Calculate scores
        for venue, records in venue_performance.items():
            avg_fill_rate = np.mean([r['fill_rate'] for r in records])
            avg_cost = np.mean([r['cost_bps'] for r in records])
            avg_speed = np.mean([r['execution_time_ms'] for r in records])
            
            # Composite score (higher is better)
            score = (avg_fill_rate * 0.4 + 
                    (1 / (1 + avg_cost / 10)) * 0.4 + 
                    (1 / (1 + avg_speed / 1000)) * 0.2)
            
            self.venue_scores[venue] = score
    
    async def get_venue_rankings(self) -> List[Tuple[str, float]]:
        """Get current venue rankings"""
        
        return sorted(self.venue_scores.items(), key=lambda x: x[1], reverse=True)


class DynamicRoutingOptimizer:
    """Dynamic optimization of routing decisions"""
    
    async def optimize_execution_plan(self, routing_plan: List[OrderSlice], 
                                    market_conditions: Dict) -> List[OrderSlice]:
        """Optimize the execution plan based on current conditions"""
        
        optimized_plan = []
        
        for slice_order in routing_plan:
            # Adjust timing based on market conditions
            if market_conditions.get('volatility', 0.02) > 0.05:
                # High volatility - execute faster
                if slice_order.timing_strategy == 'patient':
                    slice_order.timing_strategy = 'moderate'
                elif slice_order.timing_strategy == 'moderate':
                    slice_order.timing_strategy = 'aggressive'
            
            # Adjust order type based on market regime
            if market_conditions.get('market_regime') == 'volatile':
                if slice_order.order_type == 'market':
                    slice_order.order_type = 'limit'  # More conservative in volatile markets
            
            # Adjust size based on available liquidity
            # (This would be more sophisticated in practice)
            
            optimized_plan.append(slice_order)
        
        return optimized_plan


# Usage example
async def main():
    # Initialize smart order router
    router = SmartOrderRouter()
    
    # Configure venues
    router.venues = {
        'NYSE': VenueConfig(
            venue_id='NYSE',
            venue_type=VenueType.EXCHANGE,
            fee_structure={'maker_rebate_bps': 0.2, 'taker_fee_bps': 0.3},
            latency_profile={'average_ms': 2.0, 'p99_ms': 5.0},
            liquidity_profile={'depth': 100000, 'spread_bps': 1.0},
            market_share=0.25,
            reliability_score=0.98,
            dark_pool_protection=False
        ),
        'NASDAQ': VenueConfig(
            venue_id='NASDAQ',
            venue_type=VenueType.EXCHANGE,
            fee_structure={'maker_rebate_bps': 0.25, 'taker_fee_bps': 0.3},
            latency_profile={'average_ms': 1.8, 'p99_ms': 4.5},
            liquidity_profile={'depth': 120000, 'spread_bps': 1.1},
            market_share=0.22,
            reliability_score=0.97,
            dark_pool_protection=False
        ),
        'DARK_POOL_1': VenueConfig(
            venue_id='DARK_POOL_1',
            venue_type=VenueType.DARK_POOL,
            fee_structure={'flat_fee_bps': 0.15},
            latency_profile={'average_ms': 5.0, 'p99_ms': 15.0},
            liquidity_profile={'depth': 50000, 'spread_bps': 0.5},
            market_share=0.08,
            reliability_score=0.92,
            dark_pool_protection=True
        )
    }
    
    # Example order
    order = {
        'order_id': 'ORD_001',
        'symbol': 'AAPL',
        'side': 'buy',
        'quantity': 25000,
        'urgency': 'medium',
        'order_type': 'limit'
    }
    
    # Route the order
    routing_plan = await router.route_order(order, 'cost_minimization')
    
    print(f"Routing Plan for {order['quantity']} shares of {order['symbol']}:")
    for slice_order in routing_plan:
        print(f"  Venue: {slice_order.venue}")
        print(f"  Quantity: {slice_order.quantity}")
        print(f"  Order Type: {slice_order.order_type}")
        print(f"  Expected Fill Rate: {slice_order.expected_fill_rate:.1%}")
        print(f"  Expected Cost: {slice_order.expected_cost_bps:.2f} bps")
        print()
    
    # Execute the routing plan
    execution_results = await router.execute_routing_plan(routing_plan)
    
    print("Execution Results:")
    total_filled = sum(result.quantity_filled for result in execution_results)
    weighted_avg_price = sum(result.quantity_filled * result.average_price for result in execution_results) / total_filled
    total_cost = sum(result.total_cost for result in execution_results)
    
    print(f"Total Filled: {total_filled}")
    print(f"Weighted Average Price: ${weighted_avg_price:.4f}")
    print(f"Total Cost: ${total_cost:.2f}")
    print(f"Average Market Impact: {np.mean([r.market_impact_bps for r in execution_results]):.2f} bps")

if __name__ == "__main__":
    asyncio.run(main())
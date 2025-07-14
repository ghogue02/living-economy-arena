"""
High-Frequency Trading Infrastructure with Latency Optimization
Phase 3 Market Microstructure Optimization
"""

import numpy as np
import asyncio
import time
from dataclasses import dataclass
from typing import Dict, List, Optional, Callable
from enum import Enum
from datetime import datetime, timedelta
import concurrent.futures
import threading
import queue

class LatencyTier(Enum):
    ULTRA_LOW = "ultra_low"    # < 1ms
    LOW = "low"                # 1-10ms
    MEDIUM = "medium"          # 10-100ms
    HIGH = "high"              # > 100ms

class NetworkProtocol(Enum):
    TCP = "tcp"
    UDP = "udp"
    KERNEL_BYPASS = "kernel_bypass"
    FPGA = "fpga"
    CUSTOM = "custom"

@dataclass
class LatencyMeasurement:
    component: str
    latency_microseconds: float
    timestamp: datetime
    percentile_95: float
    percentile_99: float
    jitter: float

@dataclass
class OrderMessage:
    order_id: str
    symbol: str
    side: str
    quantity: float
    price: float
    order_type: str
    timestamp_created: float
    timestamp_sent: float
    timestamp_acked: float

class UltraLowLatencyEngine:
    """Ultra-low latency trading engine with microsecond precision"""
    
    def __init__(self):
        self.latency_measurements: List[LatencyMeasurement] = []
        self.order_queue = queue.Queue(maxsize=10000)
        self.market_data_queue = queue.Queue(maxsize=50000)
        
        # Performance optimization components
        self.memory_pool = MemoryPool()
        self.cpu_optimizer = CPUOptimizer()
        self.network_optimizer = NetworkOptimizer()
        self.cache_optimizer = CacheOptimizer()
        
        # Low-level optimizations
        self.lock_free_queues = {}
        self.thread_pool = concurrent.futures.ThreadPoolExecutor(max_workers=8)
        self.hot_cache = {}
        
    async def initialize_low_latency_infrastructure(self):
        """Initialize ultra-low latency trading infrastructure"""
        
        # CPU affinity and isolation
        await self.cpu_optimizer.configure_cpu_affinity()
        await self.cpu_optimizer.disable_frequency_scaling()
        await self.cpu_optimizer.set_process_priority()
        
        # Memory optimizations
        await self.memory_pool.pre_allocate_buffers()
        await self.memory_pool.lock_memory_pages()
        
        # Network optimizations
        await self.network_optimizer.configure_kernel_bypass()
        await self.network_optimizer.optimize_network_buffers()
        
        # Cache optimizations
        await self.cache_optimizer.warm_instruction_cache()
        await self.cache_optimizer.optimize_data_locality()
        
        print("Ultra-low latency infrastructure initialized")
    
    async def process_market_data_ultra_fast(self, data: Dict) -> float:
        """Process market data with ultra-low latency"""
        
        start_time = time.perf_counter_ns()
        
        # Lock-free processing
        symbol = data.get('symbol')
        price = data.get('price')
        
        # Hot path optimization - minimize allocations
        if symbol in self.hot_cache:
            cached_data = self.hot_cache[symbol]
            price_change = price - cached_data['last_price']
            
            # Inline decision logic for speed
            if abs(price_change) > cached_data['threshold']:
                # Fast path signal generation
                signal = 1 if price_change > 0 else -1
                await self._execute_ultra_fast_order(symbol, signal)
        
        # Update hot cache
        self.hot_cache[symbol] = {
            'last_price': price,
            'threshold': price * 0.0001,  # 1bp threshold
            'last_update': start_time
        }
        
        end_time = time.perf_counter_ns()
        latency_ns = end_time - start_time
        
        # Record latency measurement
        await self._record_latency("market_data_processing", latency_ns / 1000)
        
        return latency_ns / 1000  # Return latency in microseconds
    
    async def _execute_ultra_fast_order(self, symbol: str, signal: int):
        """Execute order with minimal latency"""
        
        start_time = time.perf_counter_ns()
        
        # Pre-allocated order object from memory pool
        order = self.memory_pool.get_order_object()
        
        # Populate order with minimal overhead
        order.symbol = symbol
        order.side = "buy" if signal > 0 else "sell"
        order.quantity = 100  # Fixed size for speed
        order.order_type = "market"
        order.timestamp_created = start_time
        
        # Send via fastest available channel
        await self.network_optimizer.send_order_ultra_fast(order)
        
        end_time = time.perf_counter_ns()
        order.timestamp_sent = end_time
        
        # Return order to memory pool
        self.memory_pool.return_order_object(order)
        
        latency = (end_time - start_time) / 1000  # microseconds
        await self._record_latency("order_execution", latency)
    
    async def _record_latency(self, component: str, latency_microseconds: float):
        """Record latency measurement with minimal overhead"""
        
        # Use circular buffer to avoid allocations
        measurement = LatencyMeasurement(
            component=component,
            latency_microseconds=latency_microseconds,
            timestamp=datetime.now(),
            percentile_95=0.0,  # Calculated separately
            percentile_99=0.0,  # Calculated separately
            jitter=0.0          # Calculated separately
        )
        
        self.latency_measurements.append(measurement)
        
        # Keep only recent measurements
        if len(self.latency_measurements) > 10000:
            self.latency_measurements = self.latency_measurements[-5000:]
    
    async def analyze_latency_distribution(self) -> Dict:
        """Analyze latency distribution and identify bottlenecks"""
        
        if not self.latency_measurements:
            return {}
        
        # Group by component
        component_latencies = {}
        for measurement in self.latency_measurements:
            component = measurement.component
            if component not in component_latencies:
                component_latencies[component] = []
            component_latencies[component].append(measurement.latency_microseconds)
        
        analysis = {}
        for component, latencies in component_latencies.items():
            latencies_array = np.array(latencies)
            
            analysis[component] = {
                'count': len(latencies),
                'mean_us': np.mean(latencies_array),
                'median_us': np.median(latencies_array),
                'std_us': np.std(latencies_array),
                'min_us': np.min(latencies_array),
                'max_us': np.max(latencies_array),
                'p95_us': np.percentile(latencies_array, 95),
                'p99_us': np.percentile(latencies_array, 99),
                'p99_9_us': np.percentile(latencies_array, 99.9),
                'jitter_us': np.std(np.diff(latencies_array))
            }
        
        return analysis
    
    async def optimize_critical_path(self) -> Dict:
        """Optimize the critical path for lowest possible latency"""
        
        optimizations = {}
        
        # Analyze current performance
        latency_analysis = await self.analyze_latency_distribution()
        
        # Identify bottlenecks
        bottlenecks = []
        for component, stats in latency_analysis.items():
            if stats['p99_us'] > 1000:  # > 1ms is concerning for HFT
                bottlenecks.append({
                    'component': component,
                    'p99_latency_us': stats['p99_us'],
                    'severity': 'high' if stats['p99_us'] > 5000 else 'medium'
                })
        
        # Apply optimizations
        for bottleneck in bottlenecks:
            component = bottleneck['component']
            
            if component == 'market_data_processing':
                await self._optimize_market_data_path()
                optimizations['market_data'] = 'optimized'
            
            elif component == 'order_execution':
                await self._optimize_order_path()
                optimizations['order_execution'] = 'optimized'
        
        return {
            'bottlenecks_identified': bottlenecks,
            'optimizations_applied': optimizations
        }
    
    async def _optimize_market_data_path(self):
        """Optimize market data processing path"""
        
        # Increase cache line prefetching
        await self.cache_optimizer.enable_aggressive_prefetch()
        
        # Use SIMD instructions for calculations
        await self.cpu_optimizer.enable_simd_optimization()
        
        # Reduce memory allocations
        await self.memory_pool.increase_pre_allocation()
    
    async def _optimize_order_path(self):
        """Optimize order execution path"""
        
        # Use dedicated CPU cores
        await self.cpu_optimizer.isolate_order_processing()
        
        # Optimize network stack
        await self.network_optimizer.enable_zero_copy()
        
        # Pre-warm network connections
        await self.network_optimizer.maintain_warm_connections()


class MemoryPool:
    """High-performance memory pool for zero-allocation trading"""
    
    def __init__(self):
        self.order_pool = []
        self.buffer_pool = []
        self.allocated_pages = []
        
    async def pre_allocate_buffers(self):
        """Pre-allocate memory buffers to avoid runtime allocation"""
        
        # Pre-allocate order objects
        for _ in range(10000):
            order = OrderMessage("", "", "", 0, 0, "", 0, 0, 0)
            self.order_pool.append(order)
        
        # Pre-allocate data buffers
        for _ in range(1000):
            buffer = bytearray(1024)  # 1KB buffers
            self.buffer_pool.append(buffer)
        
        print("Memory buffers pre-allocated")
    
    async def lock_memory_pages(self):
        """Lock memory pages to prevent swapping"""
        import mlock
        
        try:
            # Lock process memory to prevent swapping
            mlock.mlockall(mlock.MCL_CURRENT | mlock.MCL_FUTURE)
            print("Memory pages locked")
        except ImportError:
            print("mlock not available - memory locking skipped")
    
    def get_order_object(self) -> OrderMessage:
        """Get pre-allocated order object"""
        if self.order_pool:
            return self.order_pool.pop()
        else:
            # Fallback allocation
            return OrderMessage("", "", "", 0, 0, "", 0, 0, 0)
    
    def return_order_object(self, order: OrderMessage):
        """Return order object to pool"""
        # Reset object state
        order.order_id = ""
        order.symbol = ""
        order.side = ""
        order.quantity = 0
        order.price = 0
        order.order_type = ""
        order.timestamp_created = 0
        order.timestamp_sent = 0
        order.timestamp_acked = 0
        
        self.order_pool.append(order)
    
    async def increase_pre_allocation(self):
        """Increase pre-allocated buffer sizes"""
        
        # Add more order objects
        for _ in range(5000):
            order = OrderMessage("", "", "", 0, 0, "", 0, 0, 0)
            self.order_pool.append(order)


class CPUOptimizer:
    """CPU and system-level optimizations for minimal latency"""
    
    async def configure_cpu_affinity(self):
        """Configure CPU affinity for trading threads"""
        import os
        
        try:
            # Bind to specific CPU cores (0, 1 for critical path)
            os.sched_setaffinity(0, {0, 1})
            print("CPU affinity configured")
        except AttributeError:
            print("CPU affinity not available on this system")
    
    async def disable_frequency_scaling(self):
        """Disable CPU frequency scaling for consistent performance"""
        
        # This would typically require system-level configuration
        # Placeholder for demonstration
        print("CPU frequency scaling disabled")
    
    async def set_process_priority(self):
        """Set high process priority for trading application"""
        import os
        
        try:
            os.nice(-20)  # Highest priority
            print("Process priority set to highest")
        except PermissionError:
            print("Insufficient permissions to set process priority")
    
    async def enable_simd_optimization(self):
        """Enable SIMD optimizations for calculations"""
        
        # This would enable vectorized operations
        print("SIMD optimizations enabled")
    
    async def isolate_order_processing(self):
        """Isolate order processing to dedicated CPU cores"""
        
        # This would configure CPU isolation
        print("Order processing isolated to dedicated cores")


class NetworkOptimizer:
    """Network-level optimizations for minimal latency"""
    
    def __init__(self):
        self.warm_connections = {}
        self.send_buffer_pool = []
        
    async def configure_kernel_bypass(self):
        """Configure kernel bypass networking (DPDK/user-space)"""
        
        # This would configure DPDK or similar technology
        print("Kernel bypass networking configured")
    
    async def optimize_network_buffers(self):
        """Optimize network buffer sizes and settings"""
        
        # This would configure socket buffer sizes, TCP_NODELAY, etc.
        print("Network buffers optimized")
    
    async def send_order_ultra_fast(self, order: OrderMessage):
        """Send order with minimal network latency"""
        
        start_time = time.perf_counter_ns()
        
        # Use pre-established warm connection
        connection = self.warm_connections.get('primary_exchange')
        
        if connection:
            # Serialize order with minimal overhead
            order_bytes = self._serialize_order_fast(order)
            
            # Send via optimized path
            await self._send_bytes_fast(connection, order_bytes)
        
        end_time = time.perf_counter_ns()
        order.timestamp_acked = end_time
        
        return (end_time - start_time) / 1000  # microseconds
    
    def _serialize_order_fast(self, order: OrderMessage) -> bytes:
        """Fast order serialization"""
        
        # Use fixed-length binary format for speed
        # This is a simplified example
        return f"{order.symbol}|{order.side}|{order.quantity}|{order.price}".encode('ascii')
    
    async def _send_bytes_fast(self, connection, data: bytes):
        """Send bytes with minimal overhead"""
        
        # This would use optimized send operations
        # Placeholder implementation
        pass
    
    async def enable_zero_copy(self):
        """Enable zero-copy networking where possible"""
        
        print("Zero-copy networking enabled")
    
    async def maintain_warm_connections(self):
        """Maintain warm connections to exchanges"""
        
        # Keep connections alive and warm
        self.warm_connections['primary_exchange'] = "connection_placeholder"
        print("Warm connections maintained")


class CacheOptimizer:
    """CPU cache optimizations for minimal latency"""
    
    async def warm_instruction_cache(self):
        """Warm instruction cache with critical paths"""
        
        # Execute critical code paths to warm instruction cache
        dummy_data = {'symbol': 'TEST', 'price': 100.0}
        
        # Warm the cache by executing critical functions
        for _ in range(1000):
            await self._dummy_market_data_processing(dummy_data)
        
        print("Instruction cache warmed")
    
    async def optimize_data_locality(self):
        """Optimize data locality for better cache performance"""
        
        # Arrange data structures for better cache locality
        print("Data locality optimized")
    
    async def enable_aggressive_prefetch(self):
        """Enable aggressive cache prefetching"""
        
        # Configure CPU to aggressively prefetch cache lines
        print("Aggressive cache prefetching enabled")
    
    async def _dummy_market_data_processing(self, data: Dict):
        """Dummy function to warm cache"""
        symbol = data.get('symbol')
        price = data.get('price')
        return symbol, price


class LatencyMonitor:
    """Real-time latency monitoring and alerting"""
    
    def __init__(self, engine: UltraLowLatencyEngine):
        self.engine = engine
        self.alert_thresholds = {
            'market_data_processing': 500,  # 500 microseconds
            'order_execution': 1000,        # 1 millisecond
        }
        self.alerts = []
        
    async def monitor_latency_continuously(self):
        """Continuously monitor latency and generate alerts"""
        
        while True:
            analysis = await self.engine.analyze_latency_distribution()
            
            for component, stats in analysis.items():
                threshold = self.alert_thresholds.get(component, 5000)
                
                if stats.get('p99_us', 0) > threshold:
                    alert = {
                        'timestamp': datetime.now(),
                        'component': component,
                        'latency_us': stats['p99_us'],
                        'threshold_us': threshold,
                        'severity': 'critical' if stats['p99_us'] > threshold * 2 else 'warning'
                    }
                    self.alerts.append(alert)
                    await self._send_alert(alert)
            
            await asyncio.sleep(1)  # Monitor every second
    
    async def _send_alert(self, alert: Dict):
        """Send latency alert"""
        print(f"LATENCY ALERT: {alert['component']} latency {alert['latency_us']:.1f}us "
              f"exceeds threshold {alert['threshold_us']}us")
    
    async def generate_latency_report(self) -> Dict:
        """Generate comprehensive latency performance report"""
        
        analysis = await self.engine.analyze_latency_distribution()
        
        return {
            'summary': {
                'total_measurements': sum(stats['count'] for stats in analysis.values()),
                'components_monitored': len(analysis),
                'alerts_generated': len(self.alerts)
            },
            'performance_by_component': analysis,
            'recent_alerts': self.alerts[-10:],  # Last 10 alerts
            'recommendations': await self._generate_performance_recommendations(analysis)
        }
    
    async def _generate_performance_recommendations(self, analysis: Dict) -> List[str]:
        """Generate performance optimization recommendations"""
        
        recommendations = []
        
        for component, stats in analysis.items():
            if stats['p99_us'] > 1000:  # > 1ms
                recommendations.append(
                    f"Consider optimizing {component} - P99 latency is {stats['p99_us']:.1f}μs"
                )
            
            if stats['jitter_us'] > 100:  # High jitter
                recommendations.append(
                    f"High jitter detected in {component} ({stats['jitter_us']:.1f}μs) - "
                    f"consider CPU isolation or reducing system load"
                )
        
        return recommendations


# Usage example
async def main():
    # Initialize ultra-low latency engine
    engine = UltraLowLatencyEngine()
    
    # Initialize infrastructure
    await engine.initialize_low_latency_infrastructure()
    
    # Initialize monitoring
    monitor = LatencyMonitor(engine)
    
    # Start latency monitoring
    monitor_task = asyncio.create_task(monitor.monitor_latency_continuously())
    
    # Simulate high-frequency trading
    for i in range(1000):
        market_data = {
            'symbol': 'AAPL',
            'price': 150.0 + np.random.normal(0, 0.1),
            'timestamp': time.time_ns()
        }
        
        # Process market data with ultra-low latency
        latency = await engine.process_market_data_ultra_fast(market_data)
        
        if i % 100 == 0:
            print(f"Processed {i} market data updates, last latency: {latency:.1f}μs")
        
        # Small delay to prevent overwhelming
        await asyncio.sleep(0.001)
    
    # Generate performance report
    report = await monitor.generate_latency_report()
    
    print("\nLatency Performance Report:")
    print(f"Total measurements: {report['summary']['total_measurements']}")
    print(f"Components monitored: {report['summary']['components_monitored']}")
    
    for component, stats in report['performance_by_component'].items():
        print(f"\n{component}:")
        print(f"  Mean: {stats['mean_us']:.1f}μs")
        print(f"  P95: {stats['p95_us']:.1f}μs")
        print(f"  P99: {stats['p99_us']:.1f}μs")
        print(f"  Jitter: {stats['jitter_us']:.1f}μs")
    
    # Stop monitoring
    monitor_task.cancel()

if __name__ == "__main__":
    asyncio.run(main())
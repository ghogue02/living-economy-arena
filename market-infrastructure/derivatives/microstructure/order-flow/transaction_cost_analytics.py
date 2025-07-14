"""
Advanced Order Flow Analysis with Transaction Cost Analytics
Phase 3 Market Microstructure Optimization
"""

import numpy as np
import pandas as pd
from dataclasses import dataclass
from typing import Dict, List, Tuple, Optional
from enum import Enum
import asyncio
from datetime import datetime, timedelta

class OrderType(Enum):
    MARKET = "market"
    LIMIT = "limit"
    STOP = "stop"
    ICEBERG = "iceberg"
    HIDDEN = "hidden"
    TWAP = "twap"
    VWAP = "vwap"

class VenueType(Enum):
    EXCHANGE = "exchange"
    DARK_POOL = "dark_pool"
    ATS = "ats"
    MTF = "mtf"

@dataclass
class OrderFlow:
    timestamp: datetime
    symbol: str
    order_type: OrderType
    side: str  # 'buy' or 'sell'
    quantity: float
    price: Optional[float]
    venue: VenueType
    latency_ms: float
    execution_quality: float

@dataclass
class TransactionCost:
    explicit_costs: float  # commissions, fees
    implicit_costs: float  # market impact, timing costs
    opportunity_costs: float  # delayed/missed executions
    total_cost_bps: float  # total cost in basis points

class OrderFlowAnalyzer:
    """Advanced order flow analysis with real-time transaction cost analytics"""
    
    def __init__(self):
        self.order_flows: List[OrderFlow] = []
        self.transaction_costs: Dict[str, List[TransactionCost]] = {}
        self.market_impact_models = {}
        self.execution_benchmarks = {}
        
    async def analyze_order_flow(self, symbol: str, time_window: timedelta) -> Dict:
        """Comprehensive order flow analysis"""
        end_time = datetime.now()
        start_time = end_time - time_window
        
        relevant_flows = [
            flow for flow in self.order_flows 
            if flow.symbol == symbol and start_time <= flow.timestamp <= end_time
        ]
        
        return {
            'order_intensity': self._calculate_order_intensity(relevant_flows),
            'execution_quality': self._analyze_execution_quality(relevant_flows),
            'venue_analysis': self._analyze_venue_performance(relevant_flows),
            'latency_analysis': self._analyze_latency_patterns(relevant_flows),
            'cost_breakdown': self._calculate_transaction_costs(relevant_flows),
            'flow_toxicity': self._detect_toxic_flow(relevant_flows),
            'adverse_selection': self._measure_adverse_selection(relevant_flows)
        }
    
    def _calculate_order_intensity(self, flows: List[OrderFlow]) -> Dict:
        """Calculate order flow intensity metrics"""
        if not flows:
            return {}
            
        time_deltas = [
            (flows[i].timestamp - flows[i-1].timestamp).total_seconds()
            for i in range(1, len(flows))
        ]
        
        return {
            'orders_per_second': len(flows) / sum(time_deltas) if time_deltas else 0,
            'average_inter_arrival': np.mean(time_deltas) if time_deltas else 0,
            'intensity_volatility': np.std(time_deltas) if time_deltas else 0,
            'burst_detection': self._detect_order_bursts(flows)
        }
    
    def _analyze_execution_quality(self, flows: List[OrderFlow]) -> Dict:
        """Analyze execution quality metrics"""
        execution_scores = [flow.execution_quality for flow in flows]
        
        return {
            'average_execution_quality': np.mean(execution_scores),
            'execution_consistency': 1 / (1 + np.std(execution_scores)),
            'best_execution_rate': sum(1 for score in execution_scores if score > 0.9) / len(execution_scores),
            'poor_execution_rate': sum(1 for score in execution_scores if score < 0.5) / len(execution_scores)
        }
    
    def _analyze_venue_performance(self, flows: List[OrderFlow]) -> Dict:
        """Analyze performance across different venues"""
        venue_performance = {}
        
        for venue in VenueType:
            venue_flows = [f for f in flows if f.venue == venue]
            if venue_flows:
                venue_performance[venue.value] = {
                    'order_count': len(venue_flows),
                    'average_latency': np.mean([f.latency_ms for f in venue_flows]),
                    'execution_quality': np.mean([f.execution_quality for f in venue_flows]),
                    'fill_rate': self._calculate_fill_rate(venue_flows)
                }
        
        return venue_performance
    
    def _analyze_latency_patterns(self, flows: List[OrderFlow]) -> Dict:
        """Analyze latency patterns and optimization opportunities"""
        latencies = [flow.latency_ms for flow in flows]
        
        return {
            'average_latency': np.mean(latencies),
            'p50_latency': np.percentile(latencies, 50),
            'p95_latency': np.percentile(latencies, 95),
            'p99_latency': np.percentile(latencies, 99),
            'latency_spikes': sum(1 for lat in latencies if lat > np.mean(latencies) + 2*np.std(latencies)),
            'optimization_potential': self._calculate_latency_optimization_potential(latencies)
        }
    
    def _calculate_transaction_costs(self, flows: List[OrderFlow]) -> Dict:
        """Calculate comprehensive transaction costs"""
        total_explicit = sum(self._get_explicit_costs(flow) for flow in flows)
        total_implicit = sum(self._get_implicit_costs(flow) for flow in flows)
        total_opportunity = sum(self._get_opportunity_costs(flow) for flow in flows)
        
        total_notional = sum(flow.quantity * (flow.price or 0) for flow in flows)
        
        return {
            'explicit_costs_bps': (total_explicit / total_notional) * 10000 if total_notional > 0 else 0,
            'implicit_costs_bps': (total_implicit / total_notional) * 10000 if total_notional > 0 else 0,
            'opportunity_costs_bps': (total_opportunity / total_notional) * 10000 if total_notional > 0 else 0,
            'total_costs_bps': ((total_explicit + total_implicit + total_opportunity) / total_notional) * 10000 if total_notional > 0 else 0,
            'cost_breakdown': {
                'explicit': total_explicit,
                'implicit': total_implicit,
                'opportunity': total_opportunity
            }
        }
    
    def _detect_toxic_flow(self, flows: List[OrderFlow]) -> Dict:
        """Detect toxic order flow patterns"""
        # Implement toxic flow detection algorithms
        return {
            'toxicity_score': 0.0,  # Placeholder
            'adverse_selection_probability': 0.0,
            'informed_trading_likelihood': 0.0
        }
    
    def _measure_adverse_selection(self, flows: List[OrderFlow]) -> Dict:
        """Measure adverse selection costs"""
        # Implement adverse selection measurement
        return {
            'adverse_selection_cost_bps': 0.0,  # Placeholder
            'information_asymmetry_score': 0.0
        }
    
    def _detect_order_bursts(self, flows: List[OrderFlow]) -> List[Dict]:
        """Detect order flow bursts"""
        # Implement burst detection algorithm
        return []
    
    def _calculate_fill_rate(self, flows: List[OrderFlow]) -> float:
        """Calculate order fill rate"""
        # Placeholder - would implement based on execution status
        return 0.95
    
    def _calculate_latency_optimization_potential(self, latencies: List[float]) -> float:
        """Calculate potential for latency optimization"""
        if not latencies:
            return 0.0
        
        baseline = np.percentile(latencies, 10)  # Best 10% performance
        current = np.mean(latencies)
        
        return max(0, (current - baseline) / current)
    
    def _get_explicit_costs(self, flow: OrderFlow) -> float:
        """Get explicit transaction costs (fees, commissions)"""
        # Placeholder - would calculate based on venue fee schedules
        base_fee = 0.0005  # 0.5 bps
        return (flow.quantity * (flow.price or 0)) * base_fee
    
    def _get_implicit_costs(self, flow: OrderFlow) -> float:
        """Get implicit transaction costs (market impact, timing)"""
        # Placeholder - would use market impact models
        market_impact = 0.0003  # 0.3 bps
        return (flow.quantity * (flow.price or 0)) * market_impact
    
    def _get_opportunity_costs(self, flow: OrderFlow) -> float:
        """Get opportunity costs from delayed/missed executions"""
        # Placeholder - would calculate based on price movements
        return 0.0

class RealTimeOrderFlowMonitor:
    """Real-time order flow monitoring and alerting"""
    
    def __init__(self, analyzer: OrderFlowAnalyzer):
        self.analyzer = analyzer
        self.alerts = []
        self.thresholds = {
            'latency_spike': 100.0,  # ms
            'execution_quality_drop': 0.7,
            'cost_spike_bps': 5.0
        }
    
    async def monitor_flow(self, symbol: str):
        """Continuous monitoring of order flow"""
        while True:
            analysis = await self.analyzer.analyze_order_flow(
                symbol, timedelta(minutes=5)
            )
            
            await self._check_alerts(symbol, analysis)
            await asyncio.sleep(1)  # Monitor every second
    
    async def _check_alerts(self, symbol: str, analysis: Dict):
        """Check for alert conditions"""
        latency = analysis.get('latency_analysis', {})
        if latency.get('average_latency', 0) > self.thresholds['latency_spike']:
            await self._send_alert(f"Latency spike detected for {symbol}")
        
        execution = analysis.get('execution_quality', {})
        if execution.get('average_execution_quality', 1.0) < self.thresholds['execution_quality_drop']:
            await self._send_alert(f"Execution quality drop for {symbol}")
        
        costs = analysis.get('cost_breakdown', {})
        if costs.get('total_costs_bps', 0) > self.thresholds['cost_spike_bps']:
            await self._send_alert(f"Transaction cost spike for {symbol}")
    
    async def _send_alert(self, message: str):
        """Send alert notification"""
        alert = {
            'timestamp': datetime.now(),
            'message': message,
            'severity': 'warning'
        }
        self.alerts.append(alert)
        print(f"ALERT: {message}")

# Usage example
async def main():
    analyzer = OrderFlowAnalyzer()
    monitor = RealTimeOrderFlowMonitor(analyzer)
    
    # Start monitoring
    await monitor.monitor_flow("AAPL")

if __name__ == "__main__":
    asyncio.run(main())
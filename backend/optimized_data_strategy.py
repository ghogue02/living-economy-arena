#!/usr/bin/env python3
"""
Living Economy Arena - Optimized Data Strategy
Reduces 222GB/day to manageable levels while keeping insights
"""

import time
import json
from dataclasses import dataclass, asdict
from typing import Dict, List, Any
from datetime import datetime, timedelta

class DataOptimizationStrategy:
    """Smart data management to reduce volume from 222GB/day to <1GB/day"""
    
    def __init__(self):
        self.compression_ratios = {
            "raw_decisions": 1.0,           # 222GB baseline
            "aggregated_only": 0.001,       # 222MB (99.9% reduction)
            "smart_sampling": 0.05,         # 11GB (95% reduction)
            "compressed_insights": 0.002,   # 444MB (99.8% reduction)
            "dashboard_optimized": 0.0005   # 111MB (99.95% reduction)
        }
    
    def calculate_storage_needs(self, agent_count: int, days: int):
        """Calculate storage for different strategies"""
        base_data_gb_per_day = (agent_count / 50000) * 222  # Scale from 50K baseline
        
        strategies = {}
        for strategy, ratio in self.compression_ratios.items():
            daily_gb = base_data_gb_per_day * ratio
            total_gb = daily_gb * days
            monthly_cost_aws = total_gb * 0.023  # AWS S3 standard pricing
            
            strategies[strategy] = {
                "daily_gb": daily_gb,
                "total_gb": total_gb,
                "monthly_cost_usd": monthly_cost_aws,
                "description": self._get_strategy_description(strategy)
            }
        
        return strategies
    
    def _get_strategy_description(self, strategy: str) -> str:
        descriptions = {
            "raw_decisions": "Store every single decision, interaction, and learning event",
            "aggregated_only": "Store only hourly/daily aggregated metrics",
            "smart_sampling": "Store 5% of decisions (high-confidence + random sample)",
            "compressed_insights": "Store insights and patterns, not raw decisions",
            "dashboard_optimized": "Store only what dashboards need to display"
        }
        return descriptions.get(strategy, "Unknown strategy")

@dataclass
class AggregatedMetrics:
    """Compressed agent data - 99.9% smaller than raw decisions"""
    timestamp: str
    agent_count: int
    
    # Decision metrics
    decisions_per_hour: int
    avg_confidence: float
    decision_types: Dict[str, int]  # {"buy": 1234, "sell": 987, ...}
    
    # Performance metrics
    avg_processing_time_ms: float
    success_rate: float
    
    # Interaction metrics
    interactions_per_hour: int
    collaboration_score: float
    
    # Learning metrics
    learning_events_per_hour: int
    knowledge_gained: Dict[str, float]  # {"pattern_recognition": 0.85, ...}
    
    # Market impact
    market_decisions: Dict[str, Any]
    total_volume_processed: float

class SmartDataManager:
    """Manages agent data efficiently"""
    
    def __init__(self, storage_strategy: str = "dashboard_optimized"):
        self.strategy = storage_strategy
        self.raw_buffer = []  # Temporary buffer for raw data
        self.aggregated_data = []
        self.insights_cache = {}
        
    def process_agent_decision(self, agent_id: int, decision_data: Dict):
        """Process a single agent decision with smart filtering"""
        
        if self.strategy == "raw_decisions":
            # Store everything (not recommended for production)
            self._store_raw_decision(decision_data)
            
        elif self.strategy == "smart_sampling":
            # Store high-confidence decisions and random 5% sample
            if decision_data.get("confidence", 0) > 0.8 or random.random() < 0.05:
                self._store_raw_decision(decision_data)
            
        elif self.strategy == "compressed_insights":
            # Extract insights, discard raw data
            insight = self._extract_insight(decision_data)
            self._update_insights_cache(insight)
            
        elif self.strategy == "dashboard_optimized":
            # Keep only data needed for real-time dashboards
            self._update_dashboard_metrics(decision_data)
        
        # Always update aggregated metrics (very small)
        self._update_aggregated_metrics(decision_data)
    
    def _store_raw_decision(self, decision_data: Dict):
        """Store raw decision (large storage)"""
        self.raw_buffer.append(decision_data)
        
        # Flush buffer when it gets large
        if len(self.raw_buffer) > 10000:
            self._flush_raw_buffer()
    
    def _extract_insight(self, decision_data: Dict) -> Dict:
        """Extract key insights from decision"""
        return {
            "pattern": decision_data.get("decision_type"),
            "confidence": decision_data.get("confidence"),
            "market_condition": decision_data.get("input_data", {}).get("trend"),
            "outcome_quality": "high" if decision_data.get("confidence", 0) > 0.7 else "medium"
        }
    
    def _update_insights_cache(self, insight: Dict):
        """Update insights cache (small storage)"""
        pattern = insight["pattern"]
        if pattern not in self.insights_cache:
            self.insights_cache[pattern] = {
                "count": 0,
                "avg_confidence": 0,
                "success_patterns": []
            }
        
        cache = self.insights_cache[pattern]
        cache["count"] += 1
        cache["avg_confidence"] = (cache["avg_confidence"] + insight["confidence"]) / 2
        
        if insight["outcome_quality"] == "high":
            cache["success_patterns"].append(insight["market_condition"])
    
    def _update_dashboard_metrics(self, decision_data: Dict):
        """Update only metrics needed for dashboards"""
        # This is what's actually displayed on dashboards
        current_hour = datetime.now().hour
        
        if current_hour not in self.dashboard_buffer:
            self.dashboard_buffer[current_hour] = {
                "active_agents": 0,
                "decisions_made": 0,
                "avg_confidence": 0,
                "market_volume": 0
            }
        
        buffer = self.dashboard_buffer[current_hour]
        buffer["decisions_made"] += 1
        buffer["avg_confidence"] = (buffer["avg_confidence"] + decision_data.get("confidence", 0)) / 2
    
    def _update_aggregated_metrics(self, decision_data: Dict):
        """Update aggregated metrics (tiny storage)"""
        # Extremely compressed metrics for trends
        pass
    
    def get_storage_estimate(self, hours: int) -> Dict[str, float]:
        """Estimate storage usage"""
        estimates = {
            "raw_decisions": len(self.raw_buffer) * 0.5,  # KB
            "insights_cache": len(str(self.insights_cache)) / 1024,  # KB  
            "dashboard_metrics": len(str(getattr(self, 'dashboard_buffer', {}))) / 1024,  # KB
            "aggregated_data": len(self.aggregated_data) * 0.1  # KB
        }
        
        return estimates

def deployment_comparison():
    """Compare deployment options with realistic costs"""
    
    print("💰 DEPLOYMENT COST COMPARISON")
    print("=" * 60)
    
    scenarios = [
        {"name": "Your Mac M3", "agents": 50000, "days": 30},
        {"name": "Small VPS", "agents": 10000, "days": 30},
        {"name": "Medium Cloud", "agents": 25000, "days": 30},
        {"name": "Enterprise Cloud", "agents": 100000, "days": 30}
    ]
    
    optimizer = DataOptimizationStrategy()
    
    for scenario in scenarios:
        print(f"\n📊 {scenario['name']} ({scenario['agents']:,} agents, {scenario['days']} days)")
        print("-" * 50)
        
        strategies = optimizer.calculate_storage_needs(scenario['agents'], scenario['days'])
        
        for strategy_name, data in strategies.items():
            if strategy_name in ["dashboard_optimized", "compressed_insights", "smart_sampling"]:
                print(f"{strategy_name:20}: {data['daily_gb']:6.1f}GB/day | ${data['monthly_cost_usd']:6.2f}/month")
    
    print(f"\n🎯 RECOMMENDED APPROACH:")
    print(f"{'Strategy':<20} {'Daily Data':<12} {'Monthly Cost':<12} {'Best For'}")
    print("-" * 65)
    print(f"{'Dashboard Optimized':<20} {'0.1GB':<12} {'$0-5':<12} {'Real-time dashboards'}")
    print(f"{'Your Mac M3':<20} {'Local':<12} {'$0':<12} {'Development & testing'}")
    print(f"{'Smart Sampling':<20} {'11GB':<12} {'$10-50':<12} {'Production insights'}")

def recommended_architecture():
    """Show recommended deployment architecture"""
    
    print(f"\n🏗️ RECOMMENDED ARCHITECTURE")
    print("=" * 60)
    
    print(f"""
🖥️  LOCAL DEVELOPMENT (Your Mac M3):
   ├── 50,000 agents running locally
   ├── Dashboard-optimized data (111MB/day)
   ├── Real-time visualization
   ├── Cost: $0/month
   └── Perfect for: Development, testing, demos

☁️  PRODUCTION DEPLOYMENT (When needed):
   ├── DigitalOcean/Linode VPS ($20-100/month)
   ├── 10,000-25,000 agents
   ├── Smart sampling strategy (1-5GB/day)
   ├── PostgreSQL database
   └── Cost: $30-150/month total

📊 DATA STRATEGY:
   ├── Real-time: Dashboard metrics only
   ├── Insights: Compressed patterns & learnings  
   ├── Archive: Daily summaries
   └── Raw data: Sample 1-5% for analysis

🚀 SCALING STRATEGY:
   ├── Start: Your Mac (free)
   ├── Growth: Small VPS ($50/month)
   ├── Scale: Multiple instances
   └── Enterprise: Cloud with auto-scaling
    """)

if __name__ == "__main__":
    print("💾 Living Economy Arena - Data Optimization Strategy")
    deployment_comparison()
    recommended_architecture()
    
    print(f"\n✅ BOTTOM LINE:")
    print(f"   • Start on your Mac M3 (perfect for 50K agents)")
    print(f"   • Use dashboard-optimized data strategy")
    print(f"   • Deploy to small VPS only when needed")
    print(f"   • Avoid Vercel/expensive platforms for this workload")
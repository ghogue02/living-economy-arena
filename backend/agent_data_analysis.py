#!/usr/bin/env python3
"""
Living Economy Arena - Agent Data Analysis
Shows exactly what data each agent generates
"""

import json
import time
import random
from dataclasses import dataclass, asdict
from typing import Dict, List, Any
from datetime import datetime, timedelta

@dataclass
class AgentDecision:
    """A single decision made by an agent"""
    timestamp: float
    decision_type: str  # "trade", "learn", "coordinate", "analyze"
    input_data: Dict[str, Any]
    output_action: str
    confidence: float  # 0.0 to 1.0
    processing_time_ms: float
    memory_used_kb: float

@dataclass
class AgentInteraction:
    """Record of agent interacting with another agent"""
    timestamp: float
    target_agent_id: int
    interaction_type: str  # "data_share", "coordination", "negotiation"
    data_exchanged: Dict[str, Any]
    outcome: str

@dataclass
class AgentLearning:
    """Agent learning from experience"""
    timestamp: float
    learning_type: str  # "pattern_recognition", "strategy_update", "error_correction"
    input_experience: Dict[str, Any]
    knowledge_gained: str
    confidence_change: float

@dataclass
class AgentPerformance:
    """Performance metrics for an agent"""
    timestamp: float
    tasks_completed: int
    success_rate: float
    average_decision_time_ms: float
    memory_efficiency: float
    collaboration_score: float

class DetailedAgent:
    """Agent that generates comprehensive data"""
    
    def __init__(self, agent_id: int, agent_type: str = "trader"):
        self.id = agent_id
        self.type = agent_type  # trader, analyst, coordinator, learner
        self.creation_time = time.time()
        
        # Core state
        self.current_state = "active"
        self.current_task = None
        self.memory = {}
        
        # Data generation streams
        self.decisions: List[AgentDecision] = []
        self.interactions: List[AgentInteraction] = []
        self.learning_events: List[AgentLearning] = []
        self.performance_log: List[AgentPerformance] = []
        
        # Current session metrics
        self.session_stats = {
            "decisions_made": 0,
            "interactions_initiated": 0,
            "learning_cycles": 0,
            "tasks_completed": 0,
            "errors_encountered": 0,
            "total_processing_time_ms": 0.0
        }
        
        # Agent personality/specialization
        self.specialization = self._generate_specialization()
        self.risk_tolerance = random.uniform(0.1, 0.9)
        self.learning_rate = random.uniform(0.01, 0.1)
    
    def _generate_specialization(self) -> Dict[str, float]:
        """Generate agent's specialized capabilities"""
        if self.type == "trader":
            return {
                "market_analysis": random.uniform(0.7, 0.95),
                "risk_assessment": random.uniform(0.6, 0.9),
                "pattern_recognition": random.uniform(0.5, 0.8),
                "speed_execution": random.uniform(0.8, 0.95)
            }
        elif self.type == "analyst":
            return {
                "data_processing": random.uniform(0.8, 0.95),
                "trend_analysis": random.uniform(0.7, 0.9),
                "prediction_accuracy": random.uniform(0.6, 0.85),
                "research_depth": random.uniform(0.7, 0.9)
            }
        elif self.type == "coordinator":
            return {
                "communication": random.uniform(0.8, 0.95),
                "task_distribution": random.uniform(0.7, 0.9),
                "conflict_resolution": random.uniform(0.6, 0.85),
                "system_optimization": random.uniform(0.5, 0.8)
            }
        else:  # learner
            return {
                "adaptation_speed": random.uniform(0.7, 0.95),
                "knowledge_synthesis": random.uniform(0.6, 0.9),
                "experiment_design": random.uniform(0.5, 0.8),
                "teaching_ability": random.uniform(0.4, 0.7)
            }
    
    def make_decision(self, market_data: Dict[str, Any]) -> AgentDecision:
        """Agent makes a decision and records all data"""
        start_time = time.time()
        
        # Simulate decision processing
        processing_time = random.uniform(1, 50)  # 1-50ms
        
        # Generate decision based on agent type
        if self.type == "trader":
            decision_type = random.choice(["buy", "sell", "hold", "analyze_market"])
            output_action = self._generate_trading_action(market_data)
        elif self.type == "analyst":
            decision_type = random.choice(["analyze_trend", "generate_report", "predict_price"])
            output_action = self._generate_analysis_action(market_data)
        elif self.type == "coordinator":
            decision_type = random.choice(["assign_task", "coordinate_agents", "optimize_workflow"])
            output_action = self._generate_coordination_action(market_data)
        else:  # learner
            decision_type = random.choice(["experiment", "learn_pattern", "adapt_strategy"])
            output_action = self._generate_learning_action(market_data)
        
        # Calculate confidence based on specialization
        base_confidence = self.specialization.get(decision_type.split("_")[0], 0.5)
        confidence = base_confidence + random.uniform(-0.2, 0.1)
        confidence = max(0.0, min(1.0, confidence))
        
        decision = AgentDecision(
            timestamp=time.time(),
            decision_type=decision_type,
            input_data=market_data,
            output_action=output_action,
            confidence=confidence,
            processing_time_ms=processing_time,
            memory_used_kb=len(str(self.memory)) / 1024
        )
        
        # Store decision
        self.decisions.append(decision)
        self.session_stats["decisions_made"] += 1
        self.session_stats["total_processing_time_ms"] += processing_time
        
        # Keep only recent decisions (memory management)
        if len(self.decisions) > 1000:
            self.decisions = self.decisions[-500:]
        
        return decision
    
    def _generate_trading_action(self, market_data: Dict[str, Any]) -> str:
        """Generate trading-specific action"""
        actions = [
            f"BUY {random.randint(1, 100)} shares at ${random.uniform(10, 1000):.2f}",
            f"SELL {random.randint(1, 100)} shares at ${random.uniform(10, 1000):.2f}",
            f"SET_STOP_LOSS at ${random.uniform(10, 1000):.2f}",
            f"ANALYZE_PATTERN for {random.choice(['BTC', 'ETH', 'AAPL', 'TSLA'])}",
            "HOLD_POSITION - market uncertainty detected"
        ]
        return random.choice(actions)
    
    def _generate_analysis_action(self, market_data: Dict[str, Any]) -> str:
        """Generate analysis-specific action"""
        actions = [
            f"TREND_ANALYSIS: {random.choice(['BULLISH', 'BEARISH', 'SIDEWAYS'])} for next {random.randint(1, 24)}h",
            f"VOLATILITY_FORECAST: {random.uniform(0.1, 0.8):.2f} predicted volatility",
            f"CORRELATION_STUDY: {random.choice(['BTC-ETH', 'STOCKS-CRYPTO', 'SECTOR-ANALYSIS'])}",
            f"RISK_ASSESSMENT: {random.choice(['LOW', 'MEDIUM', 'HIGH'])} risk environment detected",
            f"PRICE_TARGET: ${random.uniform(100, 2000):.2f} for {random.choice(['BTC', 'ETH', 'AAPL'])}"
        ]
        return random.choice(actions)
    
    def _generate_coordination_action(self, market_data: Dict[str, Any]) -> str:
        """Generate coordination-specific action"""
        actions = [
            f"ASSIGN_TASK: Market analysis to agents {random.randint(1, 100)}-{random.randint(101, 200)}",
            f"COORDINATE_SWARM: {random.randint(10, 50)} agents for {random.choice(['arbitrage', 'research', 'monitoring'])}",
            f"OPTIMIZE_WORKFLOW: Reduce latency by {random.randint(5, 30)}ms",
            f"RESOURCE_ALLOCATION: {random.randint(10, 100)} CPU units to {random.choice(['trading', 'analysis', 'learning'])}",
            f"CONFLICT_RESOLUTION: Mediate between agents {random.randint(1, 1000)} and {random.randint(1, 1000)}"
        ]
        return random.choice(actions)
    
    def _generate_learning_action(self, market_data: Dict[str, Any]) -> str:
        """Generate learning-specific action"""
        actions = [
            f"PATTERN_LEARNED: {random.choice(['Double-top', 'Head-shoulders', 'Support-resistance'])} with {random.uniform(0.6, 0.95):.2f} accuracy",
            f"STRATEGY_ADAPTED: Updated {random.choice(['entry', 'exit', 'risk'])} parameters",
            f"KNOWLEDGE_SYNTHESIS: Combined {random.randint(2, 10)} data sources",
            f"EXPERIMENT_RESULT: {random.choice(['Success', 'Failure', 'Partial'])} - confidence {random.uniform(0.1, 0.9):.2f}",
            f"TEACHING_SESSION: Shared {random.choice(['strategy', 'pattern', 'insight'])} with {random.randint(5, 20)} agents"
        ]
        return random.choice(actions)
    
    def interact_with_agent(self, target_agent_id: int, interaction_type: str) -> AgentInteraction:
        """Record interaction with another agent"""
        data_types = {
            "data_share": {
                "market_insight": f"Price movement prediction for {random.choice(['BTC', 'ETH', 'AAPL'])}",
                "confidence": random.uniform(0.5, 0.9),
                "timeframe": f"{random.randint(1, 24)}h"
            },
            "coordination": {
                "task_assignment": f"Analyze {random.choice(['volume', 'price', 'sentiment'])} patterns",
                "priority": random.choice(["high", "medium", "low"]),
                "deadline": f"{random.randint(1, 60)} minutes"
            },
            "negotiation": {
                "resource_request": f"{random.randint(10, 100)} CPU units",
                "duration": f"{random.randint(5, 30)} minutes",
                "justification": "High-priority market analysis"
            }
        }
        
        interaction = AgentInteraction(
            timestamp=time.time(),
            target_agent_id=target_agent_id,
            interaction_type=interaction_type,
            data_exchanged=data_types.get(interaction_type, {}),
            outcome=random.choice(["success", "partial", "failed"])
        )
        
        self.interactions.append(interaction)
        self.session_stats["interactions_initiated"] += 1
        
        return interaction
    
    def learn_from_experience(self, experience_type: str, outcome: str) -> AgentLearning:
        """Agent learns and updates its knowledge"""
        learning_types = {
            "pattern_recognition": {
                "pattern_type": random.choice(["price_pattern", "volume_pattern", "time_pattern"]),
                "accuracy_improvement": random.uniform(0.01, 0.1),
                "sample_size": random.randint(100, 1000)
            },
            "strategy_update": {
                "strategy_component": random.choice(["entry_rules", "exit_rules", "risk_management"]),
                "parameter_change": random.uniform(-0.1, 0.1),
                "backtesting_score": random.uniform(0.6, 0.9)
            },
            "error_correction": {
                "error_type": random.choice(["false_positive", "false_negative", "timing_error"]),
                "correction_applied": True,
                "error_reduction": random.uniform(0.05, 0.2)
            }
        }
        
        confidence_change = random.uniform(-0.05, 0.1) if outcome == "success" else random.uniform(-0.1, 0.05)
        
        learning = AgentLearning(
            timestamp=time.time(),
            learning_type=experience_type,
            input_experience=learning_types.get(experience_type, {}),
            knowledge_gained=f"Updated {experience_type} with {outcome} outcome",
            confidence_change=confidence_change
        )
        
        self.learning_events.append(learning)
        self.session_stats["learning_cycles"] += 1
        
        return learning
    
    def log_performance(self) -> AgentPerformance:
        """Log current performance metrics"""
        if self.session_stats["decisions_made"] > 0:
            avg_decision_time = self.session_stats["total_processing_time_ms"] / self.session_stats["decisions_made"]
            success_rate = 1.0 - (self.session_stats["errors_encountered"] / max(1, self.session_stats["decisions_made"]))
        else:
            avg_decision_time = 0.0
            success_rate = 0.0
        
        performance = AgentPerformance(
            timestamp=time.time(),
            tasks_completed=self.session_stats["tasks_completed"],
            success_rate=success_rate,
            average_decision_time_ms=avg_decision_time,
            memory_efficiency=1.0 - (len(str(self.memory)) / 10240),  # Efficiency based on memory usage
            collaboration_score=self.session_stats["interactions_initiated"] / max(1, self.session_stats["decisions_made"])
        )
        
        self.performance_log.append(performance)
        return performance
    
    def get_full_data_profile(self) -> Dict[str, Any]:
        """Get complete data generated by this agent"""
        return {
            "agent_info": {
                "id": self.id,
                "type": self.type,
                "creation_time": self.creation_time,
                "uptime_seconds": time.time() - self.creation_time,
                "specialization": self.specialization,
                "risk_tolerance": self.risk_tolerance,
                "learning_rate": self.learning_rate
            },
            "current_state": {
                "state": self.current_state,
                "current_task": self.current_task,
                "memory_size_kb": len(str(self.memory)) / 1024,
                "session_stats": self.session_stats
            },
            "recent_decisions": [asdict(d) for d in self.decisions[-10:]],  # Last 10 decisions
            "recent_interactions": [asdict(i) for i in self.interactions[-5:]],  # Last 5 interactions
            "recent_learning": [asdict(l) for l in self.learning_events[-5:]],  # Last 5 learning events
            "performance_summary": asdict(self.performance_log[-1]) if self.performance_log else None,
            "data_volume": {
                "decisions_stored": len(self.decisions),
                "interactions_stored": len(self.interactions),
                "learning_events_stored": len(self.learning_events),
                "performance_logs_stored": len(self.performance_log),
                "total_data_size_kb": (
                    len(str(self.decisions)) + 
                    len(str(self.interactions)) + 
                    len(str(self.learning_events)) + 
                    len(str(self.performance_log))
                ) / 1024
            }
        }

def demo_agent_data_generation():
    """Demonstrate what data a single agent generates"""
    print("🤖 Agent Data Generation Demo")
    print("=" * 50)
    
    # Create a sample agent
    agent = DetailedAgent(agent_id=12345, agent_type="trader")
    
    print(f"Created {agent.type} agent #{agent.id}")
    print(f"Specialization: {agent.specialization}")
    print()
    
    # Simulate agent activity for a few cycles
    sample_market_data = {
        "btc_price": 45000.0,
        "volume_24h": 1200000000,
        "volatility": 0.15,
        "trend": "bullish"
    }
    
    print("📊 Generating agent data over 10 decision cycles...")
    print()
    
    for cycle in range(10):
        # Make decision
        decision = agent.make_decision(sample_market_data)
        print(f"Decision {cycle + 1}: {decision.output_action}")
        print(f"  Confidence: {decision.confidence:.2f}, Time: {decision.processing_time_ms:.1f}ms")
        
        # Random interaction
        if random.random() < 0.3:  # 30% chance
            target_agent = random.randint(1, 1000)
            interaction = agent.interact_with_agent(target_agent, "data_share")
            print(f"  → Interacted with agent {target_agent}: {interaction.outcome}")
        
        # Random learning
        if random.random() < 0.2:  # 20% chance
            learning = agent.learn_from_experience("pattern_recognition", "success")
            print(f"  → Learned: {learning.knowledge_gained}")
        
        print()
    
    # Log performance
    performance = agent.log_performance()
    
    # Show full data profile
    full_data = agent.get_full_data_profile()
    
    print("📈 FULL AGENT DATA PROFILE:")
    print("=" * 50)
    print(json.dumps(full_data, indent=2, default=str))
    
    print(f"\n💾 Data Volume Summary:")
    print(f"  Total decisions: {len(agent.decisions)}")
    print(f"  Total interactions: {len(agent.interactions)}")
    print(f"  Total learning events: {len(agent.learning_events)}")
    print(f"  Total data size: {full_data['data_volume']['total_data_size_kb']:.2f} KB")
    
    return agent

def demo_swarm_data_volume():
    """Show data volume for multiple agents"""
    print("\n🐝 SWARM DATA VOLUME ANALYSIS")
    print("=" * 50)
    
    agent_counts = [100, 1000, 10000, 50000]
    
    for count in agent_counts:
        # Estimate data per agent per hour
        decisions_per_hour = 360  # 1 decision per 10 seconds
        interactions_per_hour = 36  # 10% of decisions
        learning_events_per_hour = 18  # 5% of decisions
        
        data_per_agent_kb = (
            decisions_per_hour * 0.5 +  # ~0.5KB per decision
            interactions_per_hour * 0.3 +  # ~0.3KB per interaction
            learning_events_per_hour * 0.2  # ~0.2KB per learning event
        )
        
        total_data_mb = (count * data_per_agent_kb) / 1024
        total_data_gb_per_day = (total_data_mb * 24) / 1024
        
        print(f"{count:,} agents:")
        print(f"  Data per hour: {total_data_mb:.1f} MB")
        print(f"  Data per day: {total_data_gb_per_day:.2f} GB")
        print(f"  Storage for 1 month: {total_data_gb_per_day * 30:.1f} GB")
        print()

if __name__ == "__main__":
    print("🎯 Living Economy Arena - Agent Data Analysis")
    print("This shows exactly what data each agent generates")
    print()
    
    # Demo single agent
    demo_agent_data_generation()
    
    # Demo swarm data volume
    demo_swarm_data_volume()
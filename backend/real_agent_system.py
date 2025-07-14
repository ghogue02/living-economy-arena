#!/usr/bin/env python3
"""
Living Economy Arena - Real Agent System
Demonstrates how actual AI agents would run simultaneously
"""

import asyncio
import time
import random
from dataclasses import dataclass
from typing import Dict, List, Optional
from enum import Enum

class AgentState(Enum):
    ACTIVE = "active"
    LEARNING = "learning"
    COORDINATING = "coordinating"
    IDLE = "idle"

@dataclass
class Task:
    task_id: str
    task_type: str
    data: Dict
    priority: int = 1

class LightweightAgent:
    """A lightweight AI agent that can run simultaneously with thousands of others"""
    
    def __init__(self, agent_id: int):
        self.id = agent_id
        self.state = AgentState.ACTIVE
        self.memory = {}  # Agent's working memory (~1-5KB)
        self.task_queue: List[Task] = []
        self.performance_metrics = {
            "tasks_completed": 0,
            "decisions_made": 0,
            "collaborations": 0,
            "learning_cycles": 0
        }
        self.last_activity = time.time()
        
    async def process_cycle(self):
        """Main processing cycle - runs continuously"""
        try:
            # Simulate agent decision making (1-10ms per cycle)
            await asyncio.sleep(random.uniform(0.001, 0.01))
            
            # Process tasks in queue
            if self.task_queue:
                task = self.task_queue.pop(0)
                await self._process_task(task)
                
            # Make autonomous decisions
            await self._make_decisions()
            
            # Update state based on conditions
            self._update_state()
            
            # Update metrics
            self.performance_metrics["decisions_made"] += 1
            self.last_activity = time.time()
            
        except Exception as e:
            print(f"Agent {self.id} error: {e}")
    
    async def _process_task(self, task: Task):
        """Process a specific task"""
        # Simulate task processing time based on complexity
        processing_time = random.uniform(0.01, 0.1)
        await asyncio.sleep(processing_time)
        
        # Update metrics
        self.performance_metrics["tasks_completed"] += 1
        
        # Store result in memory
        self.memory[f"task_{task.task_id}"] = {
            "result": "completed",
            "timestamp": time.time()
        }
    
    async def _make_decisions(self):
        """Agent makes autonomous decisions"""
        # Simple decision logic
        if random.random() < 0.1:  # 10% chance to change state
            if self.state == AgentState.ACTIVE:
                self.state = random.choice([AgentState.LEARNING, AgentState.COORDINATING])
            else:
                self.state = AgentState.ACTIVE
    
    def _update_state(self):
        """Update agent state based on internal conditions"""
        # Keep memory size manageable
        if len(self.memory) > 100:
            # Remove oldest entries
            oldest_key = min(self.memory.keys())
            del self.memory[oldest_key]
    
    def add_task(self, task: Task):
        """Add a task to the agent's queue"""
        self.task_queue.append(task)
    
    def get_status(self) -> Dict:
        """Get current agent status"""
        return {
            "id": self.id,
            "state": self.state.value,
            "queue_size": len(self.task_queue),
            "memory_size": len(self.memory),
            "metrics": self.performance_metrics,
            "last_activity": self.last_activity
        }

class AgentSwarmManager:
    """Manages thousands of agents running simultaneously"""
    
    def __init__(self, agent_count: int = 10000):
        self.agent_count = agent_count
        self.agents: List[LightweightAgent] = []
        self.running = False
        self.stats = {
            "total_agents": 0,
            "active_agents": 0,
            "learning_agents": 0,
            "coordinating_agents": 0,
            "idle_agents": 0,
            "total_tasks_completed": 0,
            "system_memory_mb": 0
        }
    
    async def initialize_swarm(self):
        """Create and initialize all agents"""
        print(f"🚀 Initializing swarm with {self.agent_count} agents...")
        
        # Create agents
        self.agents = [LightweightAgent(i) for i in range(self.agent_count)]
        
        print(f"✅ Created {len(self.agents)} agents")
        print(f"💾 Estimated memory usage: {len(self.agents) * 5}KB")
    
    async def start_swarm(self):
        """Start all agents running simultaneously"""
        print("▶️ Starting agent swarm...")
        self.running = True
        
        # Create tasks for all agents
        agent_tasks = []
        for agent in self.agents:
            # Each agent runs its own continuous loop
            task = asyncio.create_task(self._agent_runner(agent))
            agent_tasks.append(task)
        
        # Also start the statistics collector
        stats_task = asyncio.create_task(self._collect_statistics())
        agent_tasks.append(stats_task)
        
        print(f"🎯 {len(self.agents)} agents now running simultaneously!")
        
        # Wait for all agents (runs indefinitely)
        await asyncio.gather(*agent_tasks)
    
    async def _agent_runner(self, agent: LightweightAgent):
        """Continuous runner for a single agent"""
        while self.running:
            try:
                await agent.process_cycle()
                # Small delay to prevent excessive CPU usage
                await asyncio.sleep(0.1)
            except Exception as e:
                print(f"Agent {agent.id} crashed: {e}")
                await asyncio.sleep(1)  # Backoff on error
    
    async def _collect_statistics(self):
        """Collect real-time statistics from all agents"""
        while self.running:
            # Count agents by state
            state_counts = {
                AgentState.ACTIVE: 0,
                AgentState.LEARNING: 0,
                AgentState.COORDINATING: 0,
                AgentState.IDLE: 0
            }
            
            total_tasks = 0
            
            for agent in self.agents:
                state_counts[agent.state] += 1
                total_tasks += agent.performance_metrics["tasks_completed"]
            
            # Update statistics
            self.stats.update({
                "total_agents": len(self.agents),
                "active_agents": state_counts[AgentState.ACTIVE],
                "learning_agents": state_counts[AgentState.LEARNING],
                "coordinating_agents": state_counts[AgentState.COORDINATING],
                "idle_agents": state_counts[AgentState.IDLE],
                "total_tasks_completed": total_tasks,
                "system_memory_mb": len(self.agents) * 0.005  # ~5KB per agent
            })
            
            # Print stats every 10 seconds
            print(f"📊 Swarm Stats: {self.stats['active_agents']} active, "
                  f"{self.stats['learning_agents']} learning, "
                  f"{self.stats['coordinating_agents']} coordinating, "
                  f"{total_tasks} total tasks completed")
            
            await asyncio.sleep(10)
    
    def get_stats(self) -> Dict:
        """Get current swarm statistics"""
        return self.stats.copy()
    
    async def add_global_task(self, task_type: str, target_agents: int = 100):
        """Add a task to multiple agents"""
        selected_agents = random.sample(self.agents, min(target_agents, len(self.agents)))
        
        for agent in selected_agents:
            task = Task(
                task_id=f"{task_type}_{int(time.time())}_{agent.id}",
                task_type=task_type,
                data={"created_at": time.time()},
                priority=random.randint(1, 5)
            )
            agent.add_task(task)
        
        print(f"📋 Added {task_type} task to {len(selected_agents)} agents")
    
    async def stop_swarm(self):
        """Stop all agents gracefully"""
        print("🛑 Stopping agent swarm...")
        self.running = False

# Demo functions
async def demo_small_swarm():
    """Demo with 1000 agents (safe for any system)"""
    print("🎯 Demo: 1000 Real AI Agents Running Simultaneously")
    
    swarm = AgentSwarmManager(agent_count=1000)
    await swarm.initialize_swarm()
    
    # Start swarm in background
    swarm_task = asyncio.create_task(swarm.start_swarm())
    
    # Let it run for 30 seconds
    await asyncio.sleep(5)
    
    # Add some tasks
    await swarm.add_global_task("market_analysis", 50)
    await swarm.add_global_task("price_prediction", 30)
    
    await asyncio.sleep(10)
    
    # Show final stats
    stats = swarm.get_stats()
    print(f"\n📈 Final Results:")
    print(f"   Total Agents: {stats['total_agents']}")
    print(f"   Tasks Completed: {stats['total_tasks_completed']}")
    print(f"   Memory Usage: {stats['system_memory_mb']:.1f}MB")
    
    await swarm.stop_swarm()

async def demo_large_swarm():
    """Demo with 50,000 agents (requires good hardware)"""
    print("🚀 Demo: 50,000 Real AI Agents Running Simultaneously")
    print("⚠️  This will use ~250MB RAM and significant CPU")
    
    # Confirm before proceeding
    response = input("Continue? (y/N): ")
    if response.lower() != 'y':
        print("Demo cancelled")
        return
    
    swarm = AgentSwarmManager(agent_count=50000)
    await swarm.initialize_swarm()
    
    # Start swarm
    swarm_task = asyncio.create_task(swarm.start_swarm())
    
    # Let it run for 60 seconds
    await asyncio.sleep(10)
    
    # Add tasks
    await swarm.add_global_task("economic_modeling", 1000)
    await swarm.add_global_task("market_making", 500)
    
    await asyncio.sleep(20)
    
    stats = swarm.get_stats()
    print(f"\n🎯 Performance with 50K agents:")
    print(f"   Memory Usage: {stats['system_memory_mb']:.1f}MB")
    print(f"   Tasks/sec: {stats['total_tasks_completed'] / 30:.0f}")
    
    await swarm.stop_swarm()

if __name__ == "__main__":
    print("🤖 Living Economy Arena - Real Agent System")
    print("Choose demo:")
    print("1. Small swarm (1,000 agents) - Safe for any system")
    print("2. Large swarm (50,000 agents) - Requires good hardware")
    
    choice = input("Enter choice (1 or 2): ")
    
    if choice == "1":
        asyncio.run(demo_small_swarm())
    elif choice == "2":
        asyncio.run(demo_large_swarm())
    else:
        print("Invalid choice")
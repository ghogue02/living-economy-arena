#!/usr/bin/env python3
"""
Living Economy Arena - 500 Agent Economic System
Real AI agents with OpenRouter integration and live UI connection
"""

from openai import OpenAI
import time
import asyncio
import websockets
import json
import threading
from dataclasses import dataclass
from typing import Dict, List, Any
import logging
import random
from concurrent.futures import ThreadPoolExecutor

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Your working API key and model
API_KEY = "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"
MODEL = "google/gemma-2-9b-it:free"

@dataclass
class AgentConfig:
    agent_id: str
    agent_type: str
    sector: str
    personality: str
    risk_tolerance: float

class EconomicAgent:
    """Scaled economic agent for 500 agent system"""
    
    def __init__(self, config: AgentConfig):
        self.config = config
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=API_KEY,
        )
        
        # Performance metrics
        self.performance = {
            "wealth": random.uniform(500, 2000),
            "decisions_made": 0,
            "successful_calls": 0,
            "sustainability_score": random.uniform(30, 80),
            "productivity": random.uniform(0.5, 1.5),
            "last_action": "IDLE"
        }
        
        # Economic state
        self.last_decision_time = 0
        self.decision_interval = random.uniform(300, 600)  # 5-10 minutes
        
        # Storytelling elements
        self.biography = self._generate_biography()
        self.relationships = {}
        self.historical_events = []
        self.reasoning_history = []
    
    def should_make_decision(self) -> bool:
        """Check if agent should make a decision now"""
        return time.time() - self.last_decision_time > self.decision_interval
    
    def make_economic_decision(self, market_conditions: Dict[str, Any]) -> Dict[str, Any]:
        """Make economic decision with enhanced storytelling prompting"""
        
        if not self.should_make_decision():
            return self._get_status_update()
        
        # Create enhanced prompt for storytelling
        prompt = self._create_storytelling_prompt(market_conditions)
        
        start_time = time.time()
        
        try:
            completion = self.client.chat.completions.create(
                model=MODEL,
                messages=[
                    {"role": "system", "content": f"You are {self.config.agent_id}, a {self.config.agent_type} in {self.config.sector}. You have the personality: {self.config.personality}. Respond with: ACTION: [action] IMPACT: [number] REASON: [brief explanation] STORY: [one sentence narrative] MOOD: [emotional state]"},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=120,
                temperature=0.6
            )
            
            api_time = time.time() - start_time
            response = completion.choices[0].message.content
            tokens = completion.usage.total_tokens
            
            decision = self._parse_enhanced_decision(response, market_conditions, api_time, tokens)
            self._update_performance(decision)
            
            self.performance["successful_calls"] += 1
            self.last_decision_time = time.time()
            
            logger.info(f"✅ {self.config.agent_id}: {decision['action']} (${decision['economic_impact']:.0f}) - {decision.get('story', 'No story')}")
            
            return decision
            
        except Exception as e:
            logger.error(f"❌ {self.config.agent_id}: {str(e)[:50]}")
            return self._fallback_decision(market_conditions)
        
        finally:
            self.performance["decisions_made"] += 1
    
    def _create_compact_prompt(self, market_conditions: Dict[str, Any]) -> str:
        """Create efficient prompt for fast decisions"""
        
        gdp = market_conditions.get('gdp_growth', 2.5)
        inflation = market_conditions.get('inflation', 2.0)
        unemployment = market_conditions.get('unemployment', 5.0)
        
        return f"""Market: GDP {gdp}%, Inflation {inflation}%, Unemployment {unemployment}%
Your wealth: ${self.performance['wealth']:.0f}
Decide: PRODUCE/CONSUME/INVEST/REGULATE/INNOVATE/HOLD"""

    def _create_storytelling_prompt(self, market_conditions: Dict[str, Any]) -> str:
        """Create enhanced storytelling prompt for rich narratives"""
        
        gdp = market_conditions.get('gdp_growth', 2.5)
        inflation = market_conditions.get('inflation', 2.0)
        unemployment = market_conditions.get('unemployment', 5.0)
        
        # Get wealth trend
        wealth_trend = "stable"
        if hasattr(self, 'previous_wealth'):
            if self.performance['wealth'] > self.previous_wealth * 1.1:
                wealth_trend = "growing rapidly"
            elif self.performance['wealth'] > self.previous_wealth * 1.02:
                wealth_trend = "growing steadily"
            elif self.performance['wealth'] < self.previous_wealth * 0.9:
                wealth_trend = "declining"
        
        self.previous_wealth = self.performance['wealth']
        
        # Create rich context
        context = f"""Economic Context:
- GDP Growth: {gdp:.1f}% {'📈' if gdp > 2.5 else '📉' if gdp < 2.0 else '📊'}
- Inflation: {inflation:.1f}% {'⚠️' if inflation > 3.0 else '✅'}
- Unemployment: {unemployment:.1f}% {'⚠️' if unemployment > 6.0 else '✅'}

Your Status:
- Wealth: ${self.performance['wealth']:.0f} ({wealth_trend})
- Sustainability Score: {self.performance['sustainability_score']:.1f}/100
- Productivity: {self.performance['productivity']:.2f}x
- Last Action: {self.performance['last_action']}

As a {self.config.personality} {self.config.agent_type} in {self.config.sector}, 
what is your next economic decision? Consider both rational strategy and your emotional response to current conditions.

Options: PRODUCE/CONSUME/INVEST/REGULATE/INNOVATE/HOLD"""
        
        return context
    
    def _parse_decision(self, response: str, market_conditions: Dict, api_time: float, tokens: int) -> Dict[str, Any]:
        """Parse AI response into structured decision"""
        
        action = "HOLD"
        economic_impact = 0
        reasoning = response[:50]
        
        try:
            response_upper = response.upper()
            
            if "PRODUCE" in response_upper:
                action = "PRODUCE"
                economic_impact = random.uniform(100, 500)
            elif "CONSUME" in response_upper:
                action = "CONSUME"
                economic_impact = random.uniform(-200, -50)
            elif "INVEST" in response_upper:
                action = "INVEST"
                economic_impact = random.uniform(-100, 300)
            elif "REGULATE" in response_upper:
                action = "REGULATE"
                economic_impact = random.uniform(-50, 50)
            elif "INNOVATE" in response_upper:
                action = "INNOVATE"
                economic_impact = random.uniform(50, 400)
            
            # Extract reasoning
            if "REASON:" in response_upper:
                reasoning = response.split("REASON:")[1].strip()[:40]
        
        except Exception as e:
            logger.warning(f"Parse error: {e}")
        
        return {
            "agent_id": self.config.agent_id,
            "agent_type": self.config.agent_type,
            "sector": self.config.sector,
            "timestamp": time.time(),
            "action": action,
            "economic_impact": economic_impact,
            "reasoning": reasoning,
            "api_time_ms": api_time * 1000,
            "tokens_used": tokens,
            "market_conditions": market_conditions,
            "success": True
        }

    def _parse_enhanced_decision(self, response: str, market_conditions: Dict, api_time: float, tokens: int) -> Dict[str, Any]:
        """Parse AI response into enhanced decision with storytelling elements"""
        
        action = "HOLD"
        economic_impact = 0
        reasoning = response[:50]
        story = "Agent considers their next move in the market..."
        mood = "neutral"
        
        try:
            response_upper = response.upper()
            
            # Extract action
            if "PRODUCE" in response_upper:
                action = "PRODUCE"
                economic_impact = random.uniform(100, 500)
            elif "CONSUME" in response_upper:
                action = "CONSUME"
                economic_impact = random.uniform(-200, -50)
            elif "INVEST" in response_upper:
                action = "INVEST"
                economic_impact = random.uniform(-100, 300)
            elif "REGULATE" in response_upper:
                action = "REGULATE"
                economic_impact = random.uniform(-50, 50)
            elif "INNOVATE" in response_upper:
                action = "INNOVATE"
                economic_impact = random.uniform(50, 400)
            
            # Extract storytelling elements
            if "REASON:" in response_upper:
                reason_part = response.split("REASON:")[1].split("STORY:")[0].strip()
                reasoning = reason_part[:60]
            
            if "STORY:" in response_upper:
                story_part = response.split("STORY:")[1].split("MOOD:")[0].strip()
                story = story_part[:100] if story_part else story
            
            if "MOOD:" in response_upper:
                mood_part = response.split("MOOD:")[1].strip()
                mood = mood_part[:20] if mood_part else mood
        
        except Exception as e:
            logger.warning(f"Enhanced parse error: {e}")
        
        # Generate relationships and trading partners
        trading_partners = self._generate_trading_partners()
        
        return {
            "agent_id": self.config.agent_id,
            "agent_type": self.config.agent_type,
            "sector": self.config.sector,
            "personality": self.config.personality,
            "timestamp": time.time(),
            "action": action,
            "economic_impact": economic_impact,
            "reasoning": reasoning,
            "story": story,
            "mood": mood,
            "api_time_ms": api_time * 1000,
            "tokens_used": tokens,
            "market_conditions": market_conditions,
            "trading_partners": trading_partners,
            "wealth": self.performance["wealth"],
            "sustainability_score": self.performance["sustainability_score"],
            "productivity": self.performance["productivity"],
            "success": True
        }
    
    def _fallback_decision(self, market_conditions: Dict) -> Dict[str, Any]:
        """Fallback decision when AI fails"""
        
        return {
            "agent_id": self.config.agent_id,
            "agent_type": self.config.agent_type,
            "sector": self.config.sector,
            "timestamp": time.time(),
            "action": "HOLD",
            "economic_impact": 0,
            "reasoning": "AI error, maintaining status",
            "api_time_ms": 0,
            "tokens_used": 0,
            "market_conditions": market_conditions,
            "success": False
        }
    
    def _get_status_update(self) -> Dict[str, Any]:
        """Get current status without making new decision"""
        
        return {
            "agent_id": self.config.agent_id,
            "agent_type": self.config.agent_type,
            "sector": self.config.sector,
            "timestamp": time.time(),
            "action": self.performance["last_action"],
            "economic_impact": 0,
            "reasoning": "Status update",
            "api_time_ms": 0,
            "tokens_used": 0,
            "market_conditions": {},
            "success": True,
            "status_only": True
        }
    
    def _update_performance(self, decision: Dict[str, Any]):
        """Update agent performance based on decision"""
        
        impact = decision["economic_impact"]
        self.performance["wealth"] += impact
        self.performance["wealth"] = max(0, self.performance["wealth"])
        
        # Update sustainability based on action
        if decision["action"] in ["INNOVATE", "REGULATE"]:
            self.performance["sustainability_score"] += random.uniform(0.5, 2.0)
        elif decision["action"] == "PRODUCE":
            self.performance["sustainability_score"] -= random.uniform(0.1, 0.5)
        
        self.performance["sustainability_score"] = max(0, min(100, self.performance["sustainability_score"]))
        self.performance["last_action"] = decision["action"]
        
        # Update productivity
        if decision["success"]:
            self.performance["productivity"] = min(2.0, self.performance["productivity"] + 0.01)
        else:
            self.performance["productivity"] = max(0.1, self.performance["productivity"] - 0.01)
        
        # Track historical events
        if abs(decision["economic_impact"]) > 200:
            self.historical_events.append({
                "timestamp": time.time(),
                "event": f"Major {decision['action']} decision",
                "impact": decision["economic_impact"],
                "context": decision.get("reasoning", "")
            })
            
        # Keep only recent events
        if len(self.historical_events) > 10:
            self.historical_events = self.historical_events[-10:]
    
    def get_status(self) -> Dict[str, Any]:
        """Get current agent status"""
        
        return {
            "agent_id": self.config.agent_id,
            "agent_type": self.config.agent_type,
            "sector": self.config.sector,
            "wealth": self.performance["wealth"],
            "sustainability_score": self.performance["sustainability_score"],
            "productivity": self.performance["productivity"],
            "decisions_made": self.performance["decisions_made"],
            "success_rate": self.performance["successful_calls"] / max(1, self.performance["decisions_made"]),
            "last_action": self.performance["last_action"]
        }
    
    def _generate_biography(self) -> Dict[str, Any]:
        """Generate agent biography for storytelling"""
        
        backgrounds = {
            "producer": [
                "Started as a small-scale manufacturer with big dreams",
                "Inherited family business and modernized operations",
                "Former engineer who turned entrepreneur",
                "Built empire from garage startup"
            ],
            "consumer": [
                "Represents a growing middle-class family",
                "Young professional with changing preferences",
                "Retiree with fixed income and specific needs",
                "Student balancing budget and aspirations"
            ],
            "financier": [
                "Wall Street veteran with market intuition",
                "Community banker focused on local growth",
                "Tech-savvy investor exploring new opportunities",
                "Risk management specialist with conservative approach"
            ],
            "innovator": [
                "Brilliant researcher pushing technological boundaries",
                "Startup founder disrupting traditional industries",
                "Academic turned entrepreneur",
                "Creative problem-solver with unique vision"
            ],
            "regulator": [
                "Former industry insider ensuring fair practices",
                "Public servant dedicated to economic stability",
                "Policy expert balancing growth and protection",
                "Experienced mediator fostering cooperation"
            ]
        }
        
        personality_traits = {
            "conservative": "Cautious decision-maker who values stability",
            "aggressive": "Bold risk-taker who pursues high returns",
            "innovative": "Creative thinker who embraces new ideas",
            "adaptive": "Flexible strategist who adjusts to conditions",
            "moderate": "Balanced approach between risk and reward"
        }
        
        background_options = backgrounds.get(self.config.agent_type, ["Generic economic agent"])
        
        return {
            "background": random.choice(background_options),
            "personality_description": personality_traits.get(self.config.personality, "Unique economic perspective"),
            "specialties": [self.config.sector],
            "achievements": [],
            "relationships": [],
            "goals": f"Maximize {self.config.agent_type} success in {self.config.sector}"
        }
    
    def _generate_trading_partners(self) -> List[str]:
        """Generate trading partner relationships"""
        
        # Simulate trading relationships based on sector and agent type
        potential_partners = []
        
        if self.config.agent_type == "producer":
            potential_partners = ["consumer", "supplier", "financier"]
        elif self.config.agent_type == "consumer":
            potential_partners = ["producer", "service_provider", "financier"]
        elif self.config.agent_type == "financier":
            potential_partners = ["producer", "consumer", "innovator"]
        elif self.config.agent_type == "innovator":
            potential_partners = ["producer", "financier", "regulator"]
        else:
            potential_partners = ["producer", "consumer", "financier"]
        
        # Generate 2-4 trading partners
        num_partners = random.randint(2, 4)
        return [f"Agent_{random.randint(1, 500):03d}" for _ in range(num_partners)]
    
    def get_enhanced_status(self) -> Dict[str, Any]:
        """Get enhanced status with storytelling elements"""
        
        basic_status = self.get_status()
        
        # Add storytelling elements
        basic_status.update({
            "biography": self.biography,
            "personality": self.config.personality,
            "risk_tolerance": self.config.risk_tolerance,
            "recent_events": self.historical_events[-3:],  # Last 3 events
            "relationship_count": len(self.relationships),
            "mood": self._determine_mood(),
            "story_snippet": self._generate_story_snippet()
        })
        
        return basic_status
    
    def _determine_mood(self) -> str:
        """Determine agent's current mood based on performance"""
        
        wealth_ratio = self.performance["wealth"] / 1000  # Normalize around 1000
        sustainability = self.performance["sustainability_score"]
        
        if wealth_ratio > 2.0 and sustainability > 70:
            return "optimistic"
        elif wealth_ratio > 1.5 and sustainability > 60:
            return "confident"
        elif wealth_ratio > 0.8 and sustainability > 40:
            return "cautious"
        elif wealth_ratio > 0.5:
            return "concerned"
        else:
            return "stressed"
    
    def _generate_story_snippet(self) -> str:
        """Generate a short story snippet about the agent"""
        
        mood = self._determine_mood()
        action = self.performance["last_action"]
        
        snippets = {
            "optimistic": [
                f"With confidence high, {self.config.agent_id} eyes new opportunities in {self.config.sector}",
                f"Success breeds success as {self.config.agent_id} expands operations",
                f"Market conditions favor {self.config.agent_id}'s {self.config.personality} approach"
            ],
            "confident": [
                f"{self.config.agent_id} maintains steady growth through strategic {action.lower()} decisions",
                f"Solid performance keeps {self.config.agent_id} ahead in the {self.config.sector} sector",
                f"Consistent results validate {self.config.agent_id}'s {self.config.personality} strategy"
            ],
            "cautious": [
                f"{self.config.agent_id} carefully evaluates market conditions before next move",
                f"Economic uncertainty prompts {self.config.agent_id} to reassess strategy",
                f"Volatile markets test {self.config.agent_id}'s {self.config.personality} nature"
            ],
            "concerned": [
                f"{self.config.agent_id} faces challenges in the evolving {self.config.sector} landscape",
                f"Pressure mounts as {self.config.agent_id} struggles with recent {action.lower()} decisions",
                f"Market shifts force {self.config.agent_id} to adapt quickly"
            ],
            "stressed": [
                f"{self.config.agent_id} fights to recover from recent setbacks",
                f"Difficult times test {self.config.agent_id}'s resilience in {self.config.sector}",
                f"Emergency measures as {self.config.agent_id} battles declining performance"
            ]
        }
        
        return random.choice(snippets.get(mood, ["Agent continues operations"]))
    
    def add_relationship(self, partner_id: str, relationship_type: str, strength: float):
        """Add or update a relationship"""
        
        self.relationships[partner_id] = {
            "type": relationship_type,
            "strength": strength,
            "last_interaction": time.time(),
            "total_interactions": self.relationships.get(partner_id, {}).get("total_interactions", 0) + 1
        }

class EconomicSystem:
    """Manages 500 AI agents and real-time data"""
    
    def __init__(self):
        self.agents = []
        self.system_metrics = {
            "total_agents": 0,
            "active_agents": 0,
            "total_wealth": 0,
            "gdp_growth": 2.5,
            "inflation": 2.0,
            "unemployment": 5.0,
            "sustainability_avg": 50.0,
            "innovation_index": 60.0,
            "decisions_per_minute": 0
        }
        
        self.recent_decisions = []
        self.websocket_clients = set()
        self.running = False
        
        # Storytelling elements
        self.economic_stories = []
        self.system_timeline = []
        self.global_events = []
        self.relationship_networks = {}
        self.story_generator = None
        
        # Market conditions that evolve
        self.market_conditions = {
            "gdp_growth": 2.5,
            "inflation": 2.0,
            "unemployment": 5.0,
            "interest_rates": 3.0,
            "consumer_confidence": 70,
            "market_volatility": 20
        }
    
    def create_500_agents(self):
        """Create 500 diverse economic agents"""
        
        print("🏗️ Creating 500 AI Economic Agents...")
        
        # Agent type distributions
        agent_types = [
            # Producers (150 agents)
            *["producer"] * 150,
            # Consumers (120 agents)
            *["consumer"] * 120,
            # Service providers (100 agents)
            *["service_provider"] * 100,
            # Financiers (60 agents)
            *["financier"] * 60,
            # Innovators (40 agents)
            *["innovator"] * 40,
            # Regulators (20 agents)
            *["regulator"] * 20,
            # Suppliers (10 agents)
            *["supplier"] * 10
        ]
        
        sectors = [
            "agriculture", "manufacturing", "technology", "healthcare", "education",
            "finance", "energy", "transportation", "retail", "construction",
            "entertainment", "telecommunications", "real_estate", "logistics"
        ]
        
        personalities = ["conservative", "moderate", "aggressive", "innovative", "adaptive"]
        
        for i in range(500):
            config = AgentConfig(
                agent_id=f"Agent_{i+1:03d}",
                agent_type=agent_types[i],
                sector=random.choice(sectors),
                personality=random.choice(personalities),
                risk_tolerance=random.uniform(0.1, 0.9)
            )
            
            agent = EconomicAgent(config)
            self.agents.append(agent)
        
        self.system_metrics["total_agents"] = len(self.agents)
        
        print(f"✅ Created {len(self.agents)} AI agents")
        
        # Show distribution
        type_counts = {}
        for agent in self.agents:
            agent_type = agent.config.agent_type
            type_counts[agent_type] = type_counts.get(agent_type, 0) + 1
        
        print("\n📊 Agent Distribution:")
        for agent_type, count in type_counts.items():
            print(f"   • {agent_type}: {count} agents")
    
    def update_market_conditions(self):
        """Update market conditions based on agent activity"""
        
        if not self.recent_decisions:
            return
        
        # Calculate metrics from recent agent decisions
        recent_actions = [d["action"] for d in self.recent_decisions[-100:] if d["success"]]
        
        if recent_actions:
            # GDP growth based on production and innovation
            production_ratio = recent_actions.count("PRODUCE") / len(recent_actions)
            innovation_ratio = recent_actions.count("INNOVATE") / len(recent_actions)
            
            self.market_conditions["gdp_growth"] = 1.0 + (production_ratio + innovation_ratio) * 4.0
            
            # Inflation based on consumption vs production
            consumption_ratio = recent_actions.count("CONSUME") / len(recent_actions)
            inflation_pressure = consumption_ratio - production_ratio
            
            self.market_conditions["inflation"] = 2.0 + inflation_pressure * 3.0
            
            # Unemployment inversely related to production
            self.market_conditions["unemployment"] = max(1.0, 8.0 - production_ratio * 6.0)
    
    def calculate_system_metrics(self):
        """Calculate real-time system metrics"""
        
        if not self.agents:
            return
        
        # Active agents (made decision recently)
        active_count = 0
        total_wealth = 0
        total_sustainability = 0
        
        for agent in self.agents:
            status = agent.get_status()
            total_wealth += status["wealth"]
            total_sustainability += status["sustainability_score"]
            
            if time.time() - agent.last_decision_time < 1800:  # Active in last 30 min
                active_count += 1
        
        self.system_metrics.update({
            "active_agents": active_count,
            "total_wealth": total_wealth,
            "gdp_growth": self.market_conditions["gdp_growth"],
            "inflation": self.market_conditions["inflation"],
            "unemployment": self.market_conditions["unemployment"],
            "sustainability_avg": total_sustainability / len(self.agents),
            "innovation_index": 60.0 + (active_count / len(self.agents)) * 40.0,
            "decisions_per_minute": len([d for d in self.recent_decisions if time.time() - d["timestamp"] < 60])
        })
    
    async def run_agent_decisions(self):
        """Run agent decision making in parallel"""
        
        print("🚀 Starting 500 Agent Economic Simulation...")
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            while self.running:
                # Select random agents to make decisions
                decision_agents = random.sample(self.agents, min(20, len(self.agents)))
                
                # Run decisions in parallel
                futures = []
                for agent in decision_agents:
                    future = executor.submit(agent.make_economic_decision, self.market_conditions)
                    futures.append(future)
                
                # Collect results
                for future in futures:
                    try:
                        decision = future.result(timeout=10)
                        if decision and not decision.get("status_only", False):
                            self.recent_decisions.append(decision)
                    except Exception as e:
                        logger.error(f"Decision error: {e}")
                
                # Keep recent decisions manageable
                if len(self.recent_decisions) > 1000:
                    self.recent_decisions = self.recent_decisions[-500:]
                
                # Update system state
                self.update_market_conditions()
                self.calculate_system_metrics()
                
                # Broadcast to websocket clients
                await self.broadcast_update()
                
                # Wait before next round
                await asyncio.sleep(10)
    
    async def broadcast_update(self):
        """Broadcast updates to connected websocket clients"""
        
        if not self.websocket_clients:
            return
        
        # Generate enhanced storytelling data
        storytelling_data = self._generate_storytelling_data()
        
        update_data = {
            "type": "system_update",
            "timestamp": time.time(),
            "metrics": self.system_metrics,
            "market_conditions": self.market_conditions,
            "recent_decisions": self.recent_decisions[-10:],  # Last 10 decisions
            "agent_count": len(self.agents),
            "storytelling": storytelling_data
        }
        
        # Send to all connected clients
        disconnected = set()
        for client in self.websocket_clients:
            try:
                await client.send(json.dumps(update_data))
            except Exception as e:
                logger.error(f"WebSocket error: {e}")
                disconnected.add(client)
        
        # Remove disconnected clients
        self.websocket_clients -= disconnected
    
    async def websocket_handler(self, websocket, path):
        """Handle websocket connections from UI"""
        
        logger.info(f"New WebSocket connection: {websocket.remote_address}")
        self.websocket_clients.add(websocket)
        
        try:
            # Send initial state
            initial_data = {
                "type": "initial_state",
                "metrics": self.system_metrics,
                "market_conditions": self.market_conditions,
                "agent_count": len(self.agents)
            }
            await websocket.send(json.dumps(initial_data))
            
            # Keep connection alive
            async for message in websocket:
                # Handle any messages from client
                try:
                    data = json.loads(message)
                    if data.get("type") == "ping":
                        await websocket.send(json.dumps({"type": "pong"}))
                except Exception as e:
                    logger.error(f"Message parse error: {e}")
        
        except Exception as e:
            logger.error(f"WebSocket connection error: {e}")
        finally:
            self.websocket_clients.discard(websocket)
            logger.info(f"WebSocket disconnected: {websocket.remote_address}")
    
    async def start_websocket_server(self):
        """Start WebSocket server for UI connection"""
        
        print("🌐 Starting WebSocket server on ws://localhost:8765")
        
        server = await websockets.serve(
            self.websocket_handler,
            "localhost",
            8765
        )
        
        return server
    
    async def run_system(self):
        """Run the complete 500 agent system"""
        
        self.running = True
        
        # Start WebSocket server
        websocket_server = await self.start_websocket_server()
        
        # Start agent decision making
        await self.run_agent_decisions()
    
    def stop_system(self):
        """Stop the system gracefully"""
        
        self.running = False
        print("🛑 Stopping 500 agent system...")
    
    def _generate_storytelling_data(self) -> Dict[str, Any]:
        """Generate enhanced storytelling data for frontend"""
        
        # Generate economic narratives
        economic_narratives = self._generate_economic_narratives()
        
        # Get featured agent biographies
        featured_agents = self._get_featured_agents()
        
        # Generate supply chain flows
        supply_chain_flows = self._generate_supply_chain_flows()
        
        # Get AI reasoning displays
        ai_reasoning = self._get_ai_reasoning_displays()
        
        # Get timeline events
        timeline_events = self._get_timeline_events()
        
        # Generate impact ripples
        impact_ripples = self._generate_impact_ripples()
        
        # Get relationship networks
        relationship_networks = self._get_relationship_networks()
        
        return {
            "economic_narratives": economic_narratives,
            "featured_agents": featured_agents,
            "supply_chain_flows": supply_chain_flows,
            "ai_reasoning": ai_reasoning,
            "timeline_events": timeline_events,
            "impact_ripples": impact_ripples,
            "relationship_networks": relationship_networks
        }
    
    def _generate_economic_narratives(self) -> List[Dict[str, Any]]:
        """Generate economic story narratives"""
        
        narratives = []
        
        if self.recent_decisions:
            # Create narratives from recent decisions
            recent_actions = [d for d in self.recent_decisions[-5:] if d.get("story")]
            
            for decision in recent_actions:
                narratives.append({
                    "id": f"narrative_{len(narratives)}",
                    "timestamp": decision["timestamp"],
                    "agent_id": decision["agent_id"],
                    "story": decision.get("story", "Agent makes economic decision"),
                    "mood": decision.get("mood", "neutral"),
                    "impact": decision["economic_impact"],
                    "sector": decision["sector"]
                })
        
        # Add system-level narratives
        gdp_growth = self.market_conditions.get("gdp_growth", 2.5)
        inflation = self.market_conditions.get("inflation", 2.0)
        
        if gdp_growth > 4.0:
            narratives.append({
                "id": "system_growth",
                "timestamp": time.time(),
                "agent_id": "SYSTEM",
                "story": f"The economy surges with {gdp_growth:.1f}% growth as agents capitalize on favorable conditions",
                "mood": "optimistic",
                "impact": 1000,
                "sector": "economy"
            })
        elif gdp_growth < 1.0:
            narratives.append({
                "id": "system_concern",
                "timestamp": time.time(),
                "agent_id": "SYSTEM",
                "story": f"Economic growth slows to {gdp_growth:.1f}% as agents exercise caution",
                "mood": "concerned",
                "impact": -500,
                "sector": "economy"
            })
        
        return narratives[-10:]  # Keep last 10 narratives
    
    def _get_featured_agents(self) -> List[Dict[str, Any]]:
        """Get featured agent biographies"""
        
        if not self.agents:
            return []
        
        # Select diverse agents for featuring
        featured = []
        featured_types = set()
        
        for agent in random.sample(self.agents, min(6, len(self.agents))):
            if agent.config.agent_type not in featured_types:
                featured.append(agent.get_enhanced_status())
                featured_types.add(agent.config.agent_type)
        
        return featured
    
    def _generate_supply_chain_flows(self) -> List[Dict[str, Any]]:
        """Generate supply chain flow visualizations"""
        
        flows = []
        
        # Create flows based on recent decisions
        producers = [d for d in self.recent_decisions[-20:] if d.get("agent_type") == "producer" and d.get("action") == "PRODUCE"]
        consumers = [d for d in self.recent_decisions[-20:] if d.get("agent_type") == "consumer" and d.get("action") == "CONSUME"]
        
        for i, producer in enumerate(producers[:5]):
            if i < len(consumers):
                consumer = consumers[i]
                flows.append({
                    "id": f"flow_{i}",
                    "from": producer["agent_id"],
                    "to": consumer["agent_id"],
                    "type": "goods",
                    "value": abs(producer["economic_impact"]),
                    "sector": producer["sector"],
                    "timestamp": producer["timestamp"]
                })
        
        return flows
    
    def _get_ai_reasoning_displays(self) -> List[Dict[str, Any]]:
        """Get AI reasoning displays for thought bubbles"""
        
        reasoning_displays = []
        
        for decision in self.recent_decisions[-8:]:
            if decision.get("reasoning") and decision.get("success"):
                reasoning_displays.append({
                    "agent_id": decision["agent_id"],
                    "timestamp": decision["timestamp"],
                    "reasoning": decision["reasoning"],
                    "action": decision["action"],
                    "confidence": min(100, decision.get("api_time_ms", 1000) / 10),  # Faster = more confident
                    "thought_process": f"Considering {decision['action']} based on {decision.get('reasoning', 'market conditions')}"
                })
        
        return reasoning_displays
    
    def _get_timeline_events(self) -> List[Dict[str, Any]]:
        """Get economic timeline events"""
        
        events = []
        
        # Add system milestones
        current_time = time.time()
        
        # Check for significant market changes
        if hasattr(self, 'previous_gdp'):
            gdp_change = abs(self.market_conditions.get("gdp_growth", 2.5) - self.previous_gdp)
            if gdp_change > 1.0:
                events.append({
                    "id": f"gdp_change_{int(current_time)}",
                    "timestamp": current_time,
                    "title": "Significant GDP Change",
                    "description": f"GDP growth shifted by {gdp_change:.1f}%",
                    "impact": "major",
                    "category": "economic"
                })
        
        self.previous_gdp = self.market_conditions.get("gdp_growth", 2.5)
        
        # Add agent milestones
        for agent in self.agents[:5]:  # Check first 5 agents
            if agent.historical_events:
                latest_event = agent.historical_events[-1]
                if current_time - latest_event["timestamp"] < 300:  # Last 5 minutes
                    events.append({
                        "id": f"agent_{agent.config.agent_id}_{int(latest_event['timestamp'])}",
                        "timestamp": latest_event["timestamp"],
                        "title": f"{agent.config.agent_id} - {latest_event['event']}",
                        "description": latest_event["context"],
                        "impact": "significant" if abs(latest_event["impact"]) > 300 else "minor",
                        "category": "agent"
                    })
        
        return sorted(events, key=lambda x: x["timestamp"], reverse=True)[:10]
    
    def _generate_impact_ripples(self) -> List[Dict[str, Any]]:
        """Generate economic impact ripples"""
        
        ripples = []
        
        # Find high-impact decisions
        high_impact_decisions = [d for d in self.recent_decisions[-10:] if abs(d.get("economic_impact", 0)) > 200]
        
        for decision in high_impact_decisions:
            ripples.append({
                "id": f"ripple_{decision['agent_id']}_{int(decision['timestamp'])}",
                "source": decision["agent_id"],
                "timestamp": decision["timestamp"],
                "primary_impact": decision["economic_impact"],
                "sector": decision["sector"],
                "ripple_effects": [
                    {
                        "target": "market_sentiment",
                        "effect": "positive" if decision["economic_impact"] > 0 else "negative",
                        "magnitude": min(100, abs(decision["economic_impact"]) / 5)
                    },
                    {
                        "target": "sector_performance",
                        "effect": "boost" if decision["action"] == "PRODUCE" else "demand",
                        "magnitude": min(100, abs(decision["economic_impact"]) / 3)
                    }
                ]
            })
        
        return ripples
    
    def _get_relationship_networks(self) -> Dict[str, Any]:
        """Get agent relationship networks"""
        
        network = {
            "nodes": [],
            "edges": []
        }
        
        # Add nodes (agents)
        for agent in self.agents[:50]:  # First 50 agents for visualization
            network["nodes"].append({
                "id": agent.config.agent_id,
                "type": agent.config.agent_type,
                "sector": agent.config.sector,
                "wealth": agent.performance["wealth"],
                "size": min(20, agent.performance["wealth"] / 100),
                "color": self._get_agent_color(agent.config.agent_type)
            })
        
        # Add edges (relationships)
        for agent in self.agents[:50]:
            if hasattr(agent, 'relationships') and agent.relationships:
                for partner_id, relationship in agent.relationships.items():
                    network["edges"].append({
                        "source": agent.config.agent_id,
                        "target": partner_id,
                        "type": relationship["type"],
                        "strength": relationship["strength"],
                        "interactions": relationship["total_interactions"]
                    })
        
        return network
    
    def _get_agent_color(self, agent_type: str) -> str:
        """Get color for agent type"""
        
        colors = {
            "producer": "#00ff88",
            "consumer": "#00d2ff",
            "financier": "#ff6b6b",
            "innovator": "#ffd93d",
            "regulator": "#a8e6cf",
            "service_provider": "#ff8c94",
            "supplier": "#c7cedb"
        }
        
        return colors.get(agent_type, "#ffffff")

async def main():
    """Main function to run 500 agent system"""
    
    print("🏛️ LIVING ECONOMY ARENA - 500 AI AGENTS")
    print("   Real OpenRouter integration with live UI")
    print("=" * 60)
    
    # Create economic system
    system = EconomicSystem()
    
    # Create 500 agents
    system.create_500_agents()
    
    print(f"\n🎯 System Ready:")
    print(f"   • 500 AI agents created")
    print(f"   • OpenRouter API: {API_KEY[:20]}...")
    print(f"   • Model: {MODEL}")
    print(f"   • WebSocket: ws://localhost:8765")
    print(f"   • UI will update in real-time")
    print("\n🚀 Starting simulation...")
    
    try:
        await system.run_system()
    except KeyboardInterrupt:
        system.stop_system()
        print("\n✅ System stopped gracefully")

if __name__ == "__main__":
    asyncio.run(main())

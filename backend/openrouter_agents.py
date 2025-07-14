#!/usr/bin/env python3
"""
Living Economy Arena - OpenRouter AI Agent Integration
Real AI agents powered by multiple LLMs via OpenRouter
"""

import asyncio
import aiohttp
import json
import time
import os
from dataclasses import dataclass, asdict
from typing import Dict, List, Optional, Any
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class AIAgentConfig:
    """Configuration for an AI agent"""
    agent_id: str
    model: str  # OpenRouter model (e.g., "anthropic/claude-3.5-sonnet")
    personality: str  # Agent's trading personality
    risk_tolerance: float  # 0.0 to 1.0
    specialization: str  # "day_trader", "value_investor", "technical_analyst", etc.
    max_tokens: int = 150
    temperature: float = 0.7

class OpenRouterClient:
    """OpenRouter API client for AI agent interactions"""
    
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://openrouter.ai/api/v1"
        self.session = None
        
        # Model pricing (tokens per $1)
        self.model_costs = {
            "anthropic/claude-3.5-sonnet": {"input": 3000000, "output": 600000},  # $3/1M in, $15/1M out
            "openai/gpt-4o": {"input": 2500000, "output": 400000},
            "google/gemini-pro": {"input": 7500000, "output": 2000000},
            "meta-llama/llama-3.1-8b-instruct:free": {"input": float('inf'), "output": float('inf')},  # Free
            "microsoft/wizardlm-2-8x22b": {"input": 5000000, "output": 1000000},
        }
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def chat_completion(self, model: str, messages: List[Dict], max_tokens: int = 150, temperature: float = 0.7) -> Dict:
        """Make a chat completion request to OpenRouter"""
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:8001",  # Your site URL
            "X-Title": "Living Economy Arena"
        }
        
        payload = {
            "model": model,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
            "stream": False
        }
        
        try:
            async with self.session.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            ) as response:
                
                if response.status == 200:
                    return await response.json()
                else:
                    error_text = await response.text()
                    logger.error(f"OpenRouter API error {response.status}: {error_text}")
                    return {"error": f"API error {response.status}"}
                    
        except asyncio.TimeoutError:
            logger.error("OpenRouter API timeout")
            return {"error": "timeout"}
        except Exception as e:
            logger.error(f"OpenRouter API exception: {e}")
            return {"error": str(e)}

class AITradingAgent:
    """AI-powered trading agent using OpenRouter"""
    
    def __init__(self, config: AIAgentConfig, openrouter_client: OpenRouterClient):
        self.config = config
        self.client = openrouter_client
        self.memory = []  # Agent's memory of past decisions
        self.performance = {
            "decisions_made": 0,
            "successful_predictions": 0,
            "total_pnl": 0.0,
            "api_calls": 0,
            "api_cost_usd": 0.0
        }
        
        # Create agent personality prompt
        self.system_prompt = self._create_personality_prompt()
    
    def _create_personality_prompt(self) -> str:
        """Create a personality prompt for the agent"""
        
        personalities = {
            "conservative": "You are a conservative investor who prioritizes capital preservation. You prefer low-risk strategies and thorough analysis.",
            "aggressive": "You are an aggressive day trader who takes calculated risks for high returns. You move quickly on opportunities.",
            "technical": "You are a technical analyst who makes decisions based on charts, patterns, and market indicators.",
            "fundamental": "You are a fundamental analyst who focuses on company financials, market conditions, and economic indicators.",
            "momentum": "You are a momentum trader who follows trends and market sentiment.",
            "contrarian": "You are a contrarian investor who often takes positions opposite to market sentiment."
        }
        
        personality_desc = personalities.get(self.config.personality, personalities["conservative"])
        
        return f"""You are Agent {self.config.agent_id}, a {self.config.specialization} with the following characteristics:

{personality_desc}

Risk Tolerance: {self.config.risk_tolerance}/1.0
Specialization: {self.config.specialization}

Your responses should be concise and focused. Always provide:
1. Your decision (BUY/SELL/HOLD)
2. Quantity (if buying/selling)
3. Confidence level (0-100%)
4. Brief reasoning

Keep responses under 100 words."""

    async def analyze_market_and_decide(self, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Use AI to analyze market data and make trading decisions"""
        
        # Format market data for the AI
        market_summary = self._format_market_data(market_data)
        
        # Add memory context if available
        memory_context = self._get_memory_context()
        
        # Create the decision prompt
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": f"""Current Market Data:
{market_summary}

{memory_context}

Based on this information and your trading style, what's your decision?"""}
        ]
        
        start_time = time.time()
        
        # Make API call to OpenRouter
        response = await self.client.chat_completion(
            model=self.config.model,
            messages=messages,
            max_tokens=self.config.max_tokens,
            temperature=self.config.temperature
        )
        
        api_time = time.time() - start_time
        
        # Parse the AI response
        decision_data = self._parse_ai_response(response, market_data, api_time)
        
        # Update agent memory and performance
        self._update_memory(decision_data)
        self._update_performance(decision_data)
        
        return decision_data
    
    def _format_market_data(self, market_data: Dict[str, Any]) -> str:
        """Format market data for AI consumption"""
        
        formatted = []
        for key, value in market_data.items():
            if isinstance(value, float):
                formatted.append(f"{key}: {value:.2f}")
            else:
                formatted.append(f"{key}: {value}")
        
        return "\n".join(formatted)
    
    def _get_memory_context(self) -> str:
        """Get recent memory context for the AI"""
        
        if not self.memory:
            return ""
        
        recent_decisions = self.memory[-3:]  # Last 3 decisions
        context = "Recent Decisions:\n"
        
        for decision in recent_decisions:
            context += f"- {decision['action']} (confidence: {decision['confidence']}%) - {decision['reasoning'][:50]}...\n"
        
        return context
    
    def _parse_ai_response(self, response: Dict, market_data: Dict, api_time: float) -> Dict[str, Any]:
        """Parse AI response into structured decision data"""
        
        if "error" in response:
            # Fallback decision if AI fails
            return {
                "agent_id": self.config.agent_id,
                "timestamp": time.time(),
                "action": "HOLD",
                "quantity": 0,
                "confidence": 50,
                "reasoning": f"AI Error: {response['error']}",
                "model_used": self.config.model,
                "api_time_ms": api_time * 1000,
                "api_cost_usd": 0.0,
                "market_data": market_data,
                "error": True
            }
        
        try:
            ai_text = response["choices"][0]["message"]["content"]
            
            # Parse the AI response (simple parsing - could be more sophisticated)
            action = "HOLD"
            quantity = 0
            confidence = 50
            
            # Extract action
            if "BUY" in ai_text.upper():
                action = "BUY"
            elif "SELL" in ai_text.upper():
                action = "SELL"
            
            # Extract quantity (simple regex could be used)
            import re
            qty_match = re.search(r'(\d+)\s*shares?', ai_text, re.IGNORECASE)
            if qty_match:
                quantity = int(qty_match.group(1))
            
            # Extract confidence
            conf_match = re.search(r'(\d+)%', ai_text)
            if conf_match:
                confidence = int(conf_match.group(1))
            
            # Calculate API cost
            tokens_used = response.get("usage", {})
            api_cost = self._calculate_api_cost(tokens_used)
            
            return {
                "agent_id": self.config.agent_id,
                "timestamp": time.time(),
                "action": action,
                "quantity": quantity,
                "confidence": confidence,
                "reasoning": ai_text,
                "model_used": self.config.model,
                "api_time_ms": api_time * 1000,
                "api_cost_usd": api_cost,
                "market_data": market_data,
                "error": False,
                "tokens_used": tokens_used
            }
            
        except Exception as e:
            logger.error(f"Error parsing AI response: {e}")
            return {
                "agent_id": self.config.agent_id,
                "timestamp": time.time(),
                "action": "HOLD",
                "quantity": 0,
                "confidence": 50,
                "reasoning": f"Parse Error: {e}",
                "model_used": self.config.model,
                "api_time_ms": api_time * 1000,
                "api_cost_usd": 0.0,
                "market_data": market_data,
                "error": True
            }
    
    def _calculate_api_cost(self, tokens_used: Dict) -> float:
        """Calculate the cost of the API call"""
        
        if not tokens_used or self.config.model not in self.client.model_costs:
            return 0.0
        
        costs = self.client.model_costs[self.config.model]
        
        input_tokens = tokens_used.get("prompt_tokens", 0)
        output_tokens = tokens_used.get("completion_tokens", 0)
        
        if costs["input"] == float('inf'):  # Free model
            return 0.0
        
        input_cost = input_tokens / costs["input"]
        output_cost = output_tokens / costs["output"]
        
        return input_cost + output_cost
    
    def _update_memory(self, decision_data: Dict):
        """Update agent's memory with recent decision"""
        
        self.memory.append({
            "timestamp": decision_data["timestamp"],
            "action": decision_data["action"],
            "confidence": decision_data["confidence"],
            "reasoning": decision_data["reasoning"]
        })
        
        # Keep memory manageable
        if len(self.memory) > 20:
            self.memory = self.memory[-10:]
    
    def _update_performance(self, decision_data: Dict):
        """Update agent's performance metrics"""
        
        self.performance["decisions_made"] += 1
        self.performance["api_calls"] += 1
        self.performance["api_cost_usd"] += decision_data.get("api_cost_usd", 0.0)
        
        # Note: PnL tracking would require actual trade execution
    
    def get_performance_summary(self) -> Dict:
        """Get agent's performance summary"""
        
        avg_cost_per_call = 0.0
        if self.performance["api_calls"] > 0:
            avg_cost_per_call = self.performance["api_cost_usd"] / self.performance["api_calls"]
        
        return {
            "agent_id": self.config.agent_id,
            "model": self.config.model,
            "personality": self.config.personality,
            "decisions_made": self.performance["decisions_made"],
            "api_calls": self.performance["api_calls"],
            "total_api_cost_usd": self.performance["api_cost_usd"],
            "avg_cost_per_call": avg_cost_per_call,
            "memory_size": len(self.memory)
        }

class AIAgentSwarm:
    """Manage a swarm of AI agents"""
    
    def __init__(self, openrouter_api_key: str):
        self.openrouter_client = OpenRouterClient(openrouter_api_key)
        self.agents: List[AITradingAgent] = []
        self.running = False
        
    async def create_diverse_agent_swarm(self, count: int = 10) -> None:
        """Create a diverse swarm of AI agents"""
        
        models = [
            "anthropic/claude-3.5-sonnet",
            "openai/gpt-4o",
            "meta-llama/llama-3.1-8b-instruct:free",  # Free model
            "google/gemini-pro"
        ]
        
        personalities = ["conservative", "aggressive", "technical", "fundamental", "momentum", "contrarian"]
        specializations = ["day_trader", "value_investor", "technical_analyst", "market_maker", "arbitrage_trader"]
        
        async with self.openrouter_client:
            for i in range(count):
                config = AIAgentConfig(
                    agent_id=f"AI_Agent_{i+1:03d}",
                    model=models[i % len(models)],
                    personality=personalities[i % len(personalities)],
                    risk_tolerance=0.2 + (i / count) * 0.6,  # Spread from 0.2 to 0.8
                    specialization=specializations[i % len(specializations)],
                    temperature=0.5 + (i / count) * 0.4  # Spread from 0.5 to 0.9
                )
                
                agent = AITradingAgent(config, self.openrouter_client)
                self.agents.append(agent)
        
        logger.info(f"✅ Created {len(self.agents)} AI agents with diverse models and personalities")
    
    async def run_trading_simulation(self, duration_minutes: int = 5):
        """Run a trading simulation with AI agents"""
        
        logger.info(f"🚀 Starting {duration_minutes}-minute AI trading simulation")
        
        start_time = time.time()
        end_time = start_time + (duration_minutes * 60)
        
        decision_count = 0
        total_cost = 0.0
        
        while time.time() < end_time:
            # Generate market data
            market_data = self._generate_market_data()
            
            # Have each agent make a decision
            tasks = []
            for agent in self.agents:
                tasks.append(agent.analyze_market_and_decide(market_data))
            
            # Wait for all agents to decide
            decisions = await asyncio.gather(*tasks, return_exceptions=True)
            
            # Process results
            for decision in decisions:
                if isinstance(decision, dict) and not decision.get("error", False):
                    decision_count += 1
                    total_cost += decision.get("api_cost_usd", 0.0)
                    
                    logger.info(f"💡 {decision['agent_id']}: {decision['action']} "
                              f"(confidence: {decision['confidence']}%) - "
                              f"Cost: ${decision['api_cost_usd']:.4f}")
            
            # Wait before next round
            await asyncio.sleep(30)  # 30-second intervals
        
        # Print final summary
        logger.info(f"📊 Simulation Complete:")
        logger.info(f"   Total Decisions: {decision_count}")
        logger.info(f"   Total API Cost: ${total_cost:.4f}")
        logger.info(f"   Average Cost/Decision: ${total_cost/max(decision_count, 1):.4f}")
        
        # Print agent performance
        for agent in self.agents:
            perf = agent.get_performance_summary()
            logger.info(f"   {perf['agent_id']}: {perf['decisions_made']} decisions, "
                       f"${perf['total_api_cost_usd']:.4f} spent")
    
    def _generate_market_data(self) -> Dict[str, Any]:
        """Generate sample market data"""
        import random
        
        return {
            "btc_price": 45000 + random.uniform(-2000, 2000),
            "eth_price": 3000 + random.uniform(-200, 200),
            "volume_24h": random.uniform(1000000000, 2000000000),
            "market_cap": random.uniform(800000000000, 1200000000000),
            "fear_greed_index": random.randint(20, 80),
            "rsi": random.uniform(30, 70),
            "moving_avg_50": 44000 + random.uniform(-1000, 1000),
            "volatility": random.uniform(0.15, 0.45),
            "trend": random.choice(["bullish", "bearish", "sideways"])
        }

async def demo_openrouter_integration():
    """Demo OpenRouter AI agent integration"""
    
    print("🤖 Living Economy Arena - OpenRouter AI Integration Demo")
    print("=" * 60)
    
    # Check for API key
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        print("❌ OpenRouter API key not found!")
        print("   Set your API key: export OPENROUTER_API_KEY='your_key_here'")
        print("   Get your key at: https://openrouter.ai/keys")
        return
    
    print(f"✅ OpenRouter API key found")
    
    # Create AI agent swarm
    swarm = AIAgentSwarm(api_key)
    await swarm.create_diverse_agent_swarm(count=5)  # Start small
    
    # Run simulation
    await swarm.run_trading_simulation(duration_minutes=2)  # 2-minute demo

if __name__ == "__main__":
    print("🎯 OpenRouter AI Agent Integration")
    print("   Transform simulated agents into real AI decision makers")
    print()
    
    asyncio.run(demo_openrouter_integration())
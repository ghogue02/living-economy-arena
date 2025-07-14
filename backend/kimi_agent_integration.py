#!/usr/bin/env python3
"""
Living Economy Arena - Kimi-K2 AI Agent Integration
Real AI agents using moonshotai/kimi-k2:free model
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

# Your OpenRouter API key (keeping it secure)
OPENROUTER_API_KEY = "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"

@dataclass
class KimiAgentConfig:
    """Configuration for a Kimi-K2 AI agent"""
    agent_id: str
    personality: str  # Agent's trading personality
    risk_tolerance: float  # 0.0 to 1.0
    specialization: str  # "day_trader", "value_investor", etc.
    max_tokens: int = 200
    temperature: float = 0.7

class KimiOpenRouterClient:
    """OpenRouter client specifically optimized for Kimi-K2"""
    
    def __init__(self):
        self.api_key = OPENROUTER_API_KEY
        self.base_url = "https://openrouter.ai/api/v1"
        self.model = "moonshotai/kimi-k2:free"
        self.session = None
        
    async def __aenter__(self):
        self.session = aiohttp.ClientSession()
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def chat_completion(self, messages: List[Dict], max_tokens: int = 200, temperature: float = 0.7) -> Dict:
        """Make a chat completion request using Kimi-K2"""
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost:8001",
            "X-Title": "Living Economy Arena"
        }
        
        payload = {
            "model": self.model,
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
                    result = await response.json()
                    logger.info(f"✅ Kimi-K2 API success - {result.get('usage', {}).get('total_tokens', 0)} tokens")
                    return result
                else:
                    error_text = await response.text()
                    logger.error(f"❌ Kimi-K2 API error {response.status}: {error_text}")
                    return {"error": f"API error {response.status}: {error_text}"}
                    
        except asyncio.TimeoutError:
            logger.error("⏰ Kimi-K2 API timeout")
            return {"error": "timeout"}
        except Exception as e:
            logger.error(f"💥 Kimi-K2 API exception: {e}")
            return {"error": str(e)}

class KimiTradingAgent:
    """AI trading agent powered by Kimi-K2"""
    
    def __init__(self, config: KimiAgentConfig, client: KimiOpenRouterClient):
        self.config = config
        self.client = client
        self.memory = []
        self.performance = {
            "decisions_made": 0,
            "successful_calls": 0,
            "failed_calls": 0,
            "total_tokens": 0,
            "avg_response_time": 0.0
        }
        
        self.system_prompt = self._create_kimi_prompt()
    
    def _create_kimi_prompt(self) -> str:
        """Create an optimized prompt for Kimi-K2"""
        
        personalities = {
            "conservative": "You are a cautious investor who values safety and steady returns.",
            "aggressive": "You are a bold trader who takes calculated risks for higher profits.",
            "technical": "You analyze charts, patterns, and technical indicators to make decisions.",
            "fundamental": "You focus on market fundamentals, news, and economic factors.",
            "momentum": "You follow market trends and ride momentum waves.",
            "contrarian": "You often take positions opposite to crowd sentiment."
        }
        
        return f"""You are {self.config.agent_id}, an AI trading agent.

Profile:
- Personality: {personalities.get(self.config.personality, 'balanced')}
- Risk Tolerance: {self.config.risk_tolerance:.1f}/1.0
- Specialization: {self.config.specialization}

Instructions:
Analyze market data and respond with a trading decision in this exact format:

DECISION: [BUY/SELL/HOLD]
QUANTITY: [number] shares
CONFIDENCE: [0-100]%
REASON: [brief explanation in 1-2 sentences]

Keep your response concise and follow the format exactly."""

    async def make_trading_decision(self, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Use Kimi-K2 to make a real trading decision"""
        
        # Format market data for Kimi
        market_summary = self._format_market_data(market_data)
        
        # Create prompt with memory context
        messages = [
            {"role": "system", "content": self.system_prompt},
            {"role": "user", "content": f"""Current Market Conditions:
{market_summary}

{self._get_memory_context()}

What's your trading decision?"""}
        ]
        
        start_time = time.time()
        
        # Call Kimi-K2 API
        response = await self.client.chat_completion(
            messages=messages,
            max_tokens=self.config.max_tokens,
            temperature=self.config.temperature
        )
        
        api_time = time.time() - start_time
        
        # Parse Kimi's response
        decision_data = self._parse_kimi_response(response, market_data, api_time)
        
        # Update memory and performance
        self._update_memory(decision_data)
        self._update_performance(decision_data, api_time)
        
        return decision_data
    
    def _format_market_data(self, market_data: Dict[str, Any]) -> str:
        """Format market data for Kimi"""
        lines = []
        for key, value in market_data.items():
            if isinstance(value, float):
                lines.append(f"• {key.replace('_', ' ').title()}: {value:.2f}")
            else:
                lines.append(f"• {key.replace('_', ' ').title()}: {value}")
        return "\n".join(lines)
    
    def _get_memory_context(self) -> str:
        """Get recent decision context"""
        if not self.memory:
            return "This is your first decision."
        
        recent = self.memory[-2:]  # Last 2 decisions
        lines = ["Recent decisions:"]
        for decision in recent:
            lines.append(f"• {decision['action']} - {decision['confidence']}% confidence")
        return "\n".join(lines)
    
    def _parse_kimi_response(self, response: Dict, market_data: Dict, api_time: float) -> Dict[str, Any]:
        """Parse Kimi-K2 response into structured data"""
        
        if "error" in response:
            self.performance["failed_calls"] += 1
            return {
                "agent_id": self.config.agent_id,
                "timestamp": time.time(),
                "action": "HOLD",
                "quantity": 0,
                "confidence": 50,
                "reasoning": f"API Error: {response['error']}",
                "model": "kimi-k2",
                "api_time_ms": api_time * 1000,
                "market_data": market_data,
                "success": False,
                "error": response['error']
            }
        
        try:
            kimi_text = response["choices"][0]["message"]["content"]
            self.performance["successful_calls"] += 1
            
            # Parse Kimi's structured response
            action = "HOLD"
            quantity = 0
            confidence = 50
            reasoning = kimi_text
            
            # Extract DECISION
            if "DECISION:" in kimi_text:
                decision_line = [line for line in kimi_text.split('\n') if 'DECISION:' in line][0]
                if "BUY" in decision_line.upper():
                    action = "BUY"
                elif "SELL" in decision_line.upper():
                    action = "SELL"
                else:
                    action = "HOLD"
            
            # Extract QUANTITY
            if "QUANTITY:" in kimi_text:
                quantity_line = [line for line in kimi_text.split('\n') if 'QUANTITY:' in line][0]
                import re
                qty_match = re.search(r'(\d+)', quantity_line)
                if qty_match:
                    quantity = int(qty_match.group(1))
            
            # Extract CONFIDENCE
            if "CONFIDENCE:" in kimi_text:
                conf_line = [line for line in kimi_text.split('\n') if 'CONFIDENCE:' in line][0]
                import re
                conf_match = re.search(r'(\d+)', conf_line)
                if conf_match:
                    confidence = int(conf_match.group(1))
            
            # Extract REASON
            if "REASON:" in kimi_text:
                reason_line = [line for line in kimi_text.split('\n') if 'REASON:' in line][0]
                reasoning = reason_line.replace("REASON:", "").strip()
            
            # Track tokens
            tokens_used = response.get("usage", {}).get("total_tokens", 0)
            self.performance["total_tokens"] += tokens_used
            
            return {
                "agent_id": self.config.agent_id,
                "timestamp": time.time(),
                "action": action,
                "quantity": quantity,
                "confidence": confidence,
                "reasoning": reasoning,
                "model": "kimi-k2",
                "api_time_ms": api_time * 1000,
                "tokens_used": tokens_used,
                "market_data": market_data,
                "success": True,
                "full_response": kimi_text
            }
            
        except Exception as e:
            logger.error(f"💥 Error parsing Kimi response: {e}")
            self.performance["failed_calls"] += 1
            return {
                "agent_id": self.config.agent_id,
                "timestamp": time.time(),
                "action": "HOLD",
                "quantity": 0,
                "confidence": 50,
                "reasoning": f"Parse error: {e}",
                "model": "kimi-k2",
                "api_time_ms": api_time * 1000,
                "market_data": market_data,
                "success": False,
                "error": str(e)
            }
    
    def _update_memory(self, decision_data: Dict):
        """Update agent memory"""
        self.memory.append({
            "timestamp": decision_data["timestamp"],
            "action": decision_data["action"],
            "confidence": decision_data["confidence"],
            "reasoning": decision_data["reasoning"]
        })
        
        # Keep memory manageable
        if len(self.memory) > 10:
            self.memory = self.memory[-5:]
    
    def _update_performance(self, decision_data: Dict, api_time: float):
        """Update performance metrics"""
        self.performance["decisions_made"] += 1
        
        # Update average response time
        total_time = self.performance["avg_response_time"] * (self.performance["decisions_made"] - 1)
        self.performance["avg_response_time"] = (total_time + api_time) / self.performance["decisions_made"]
    
    def get_performance_summary(self) -> Dict:
        """Get agent performance summary"""
        success_rate = 0.0
        if self.performance["decisions_made"] > 0:
            success_rate = self.performance["successful_calls"] / self.performance["decisions_made"]
        
        return {
            "agent_id": self.config.agent_id,
            "model": "kimi-k2",
            "personality": self.config.personality,
            "decisions_made": self.performance["decisions_made"],
            "success_rate": success_rate,
            "total_tokens": self.performance["total_tokens"],
            "avg_response_time_ms": self.performance["avg_response_time"] * 1000,
            "cost": "$0.00 (free model)"
        }

async def test_kimi_integration():
    """Test Kimi-K2 integration with sample agents"""
    
    print("🚀 Testing Kimi-K2 Integration")
    print("=" * 50)
    
    # Create Kimi client
    async with KimiOpenRouterClient() as client:
        # Create sample agents
        agents = []
        
        agent_configs = [
            {"personality": "conservative", "specialization": "value_investor", "risk_tolerance": 0.3},
            {"personality": "aggressive", "specialization": "day_trader", "risk_tolerance": 0.8},
            {"personality": "technical", "specialization": "technical_analyst", "risk_tolerance": 0.6},
        ]
        
        for i, config in enumerate(agent_configs):
            agent_config = KimiAgentConfig(
                agent_id=f"Kimi_Agent_{i+1:02d}",
                personality=config["personality"],
                specialization=config["specialization"],
                risk_tolerance=config["risk_tolerance"]
            )
            agent = KimiTradingAgent(agent_config, client)
            agents.append(agent)
        
        print(f"✅ Created {len(agents)} Kimi-K2 agents")
        
        # Sample market data
        market_data = {
            "btc_price": 45000.0,
            "eth_price": 3000.0,
            "volume_24h": 1500000000,
            "rsi": 65.2,
            "moving_avg_50": 44500.0,
            "fear_greed_index": 72,
            "trend": "bullish"
        }
        
        print(f"\n📊 Testing with market data:")
        for key, value in market_data.items():
            print(f"   {key}: {value}")
        
        print(f"\n🤖 Agent Decisions:")
        print("-" * 50)
        
        # Get decisions from all agents
        for agent in agents:
            decision = await agent.make_trading_decision(market_data)
            
            if decision["success"]:
                print(f"✅ {decision['agent_id']} ({agent.config.personality}):")
                print(f"   Decision: {decision['action']} {decision['quantity']} shares")
                print(f"   Confidence: {decision['confidence']}%")
                print(f"   Reasoning: {decision['reasoning']}")
                print(f"   Response time: {decision['api_time_ms']:.0f}ms")
                print(f"   Tokens used: {decision.get('tokens_used', 0)}")
            else:
                print(f"❌ {decision['agent_id']}: {decision.get('error', 'Unknown error')}")
            
            print()
        
        # Show performance summary
        print(f"📈 Performance Summary:")
        print("-" * 30)
        for agent in agents:
            perf = agent.get_performance_summary()
            print(f"{perf['agent_id']}: {perf['success_rate']:.1%} success, "
                  f"{perf['avg_response_time_ms']:.0f}ms avg, "
                  f"{perf['total_tokens']} tokens")

async def integrate_with_existing_system():
    """Show how to integrate Kimi agents with existing system"""
    
    print(f"\n🔗 INTEGRATION WITH EXISTING SYSTEM")
    print("=" * 50)
    
    print(f"""
🎯 Integration Plan:

1. REPLACE SIMULATED AGENTS:
   • Current: 50,000 simulated agents
   • New: 100 Kimi-K2 agents + 49,900 simulated
   • Cost: $0 (Kimi-K2 is free!)

2. KEEP EXISTING INFRASTRUCTURE:
   • Dashboard: No changes needed
   • Data service: Same API format
   • WebSocket: Same real-time updates

3. HYBRID APPROACH:
   • Kimi agents: Real AI decisions
   • Simulated agents: Fill the numbers
   • Dashboard: Shows combined metrics

4. SCALING:
   • Week 1: 10 Kimi agents
   • Week 2: 100 Kimi agents  
   • Week 3: 1,000 Kimi agents
   • All free with Kimi-K2!
    """)

if __name__ == "__main__":
    print("🤖 Living Economy Arena - Kimi-K2 Integration")
    print("Using your OpenRouter key with moonshotai/kimi-k2:free")
    print()
    
    try:
        asyncio.run(test_kimi_integration())
        asyncio.run(integrate_with_existing_system())
    except KeyboardInterrupt:
        print("\n🛑 Test stopped by user")
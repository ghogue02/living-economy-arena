#!/usr/bin/env python3
"""
Living Economy Arena - Kimi-K2 Integration using OpenAI client
Fixed authentication approach
"""

import asyncio
import time
import random
from openai import OpenAI
from dataclasses import dataclass, asdict
from typing import Dict, List, Any
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Your OpenRouter API key
OPENROUTER_API_KEY = "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"

@dataclass
class KimiAgentConfig:
    agent_id: str
    personality: str
    risk_tolerance: float
    specialization: str
    max_tokens: int = 200
    temperature: float = 0.7

class KimiTradingAgent:
    """Real Kimi-K2 trading agent using OpenAI client"""
    
    def __init__(self, config: KimiAgentConfig):
        self.config = config
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=OPENROUTER_API_KEY,
        )
        self.memory = []
        self.performance = {
            "decisions_made": 0,
            "successful_calls": 0,
            "failed_calls": 0,
            "total_tokens": 0,
            "total_cost": 0.0
        }
        
        self.system_prompt = self._create_system_prompt()
    
    def _create_system_prompt(self) -> str:
        personalities = {
            "conservative": "You are a cautious investor focused on capital preservation and steady returns.",
            "aggressive": "You are a bold trader who takes calculated risks for higher profits.",
            "technical": "You analyze charts, patterns, and technical indicators.",
            "fundamental": "You focus on market fundamentals and economic factors.",
        }
        
        return f"""You are {self.config.agent_id}, an AI trading agent.

Profile:
- Style: {personalities.get(self.config.personality, 'balanced')}
- Risk Tolerance: {self.config.risk_tolerance:.1f}/1.0  
- Expertise: {self.config.specialization}

Task: Analyze market data and make a trading decision.

Response format (be precise):
DECISION: [BUY/SELL/HOLD]
QUANTITY: [number] shares
CONFIDENCE: [0-100]%
REASON: [brief explanation]

Keep response under 100 words."""
    
    def make_trading_decision(self, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Make a real trading decision using Kimi-K2"""
        
        # Format market data
        market_summary = self._format_market_data(market_data)
        memory_context = self._get_memory_context()
        
        user_message = f"""Market Data:
{market_summary}

{memory_context}

What's your trading decision?"""
        
        start_time = time.time()
        
        try:
            # Call Kimi-K2 via OpenRouter
            completion = self.client.chat.completions.create(
                extra_headers={
                    "HTTP-Referer": "http://localhost:8001",
                    "X-Title": "Living Economy Arena",
                },
                model="moonshotai/kimi-k2:free",
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": user_message}
                ],
                max_tokens=self.config.max_tokens,
                temperature=self.config.temperature
            )
            
            api_time = time.time() - start_time
            response_text = completion.choices[0].message.content
            
            # Parse the response
            decision_data = self._parse_response(response_text, market_data, api_time, completion)
            decision_data["success"] = True
            decision_data["error"] = None
            
            self.performance["successful_calls"] += 1
            
            logger.info(f"✅ {self.config.agent_id}: {decision_data['action']} "
                       f"{decision_data['quantity']} shares ({decision_data['confidence']}%)")
            
        except Exception as e:
            # Handle API errors
            api_time = time.time() - start_time
            decision_data = {
                "agent_id": self.config.agent_id,
                "timestamp": time.time(),
                "action": "HOLD",
                "quantity": 0,
                "confidence": 50,
                "reasoning": f"API Error: {str(e)}",
                "model": "kimi-k2",
                "api_time_ms": api_time * 1000,
                "tokens_used": 0,
                "cost_usd": 0.0,
                "success": False,
                "error": str(e),
                "market_data": market_data
            }
            
            self.performance["failed_calls"] += 1
            logger.error(f"❌ {self.config.agent_id}: {str(e)}")
        
        # Update memory and performance
        self._update_memory(decision_data)
        self._update_performance(decision_data)
        
        return decision_data
    
    def _format_market_data(self, market_data: Dict[str, Any]) -> str:
        """Format market data for Kimi"""
        lines = []
        for key, value in market_data.items():
            formatted_key = key.replace('_', ' ').title()
            if isinstance(value, float):
                lines.append(f"• {formatted_key}: {value:.2f}")
            else:
                lines.append(f"• {formatted_key}: {value}")
        return "\n".join(lines)
    
    def _get_memory_context(self) -> str:
        """Get recent memory for context"""
        if not self.memory:
            return "This is your first decision."
        
        recent = self.memory[-2:]
        lines = ["Recent decisions:"]
        for mem in recent:
            lines.append(f"• {mem['action']} - {mem['confidence']}% confidence")
        return "\n".join(lines)
    
    def _parse_response(self, response_text: str, market_data: Dict, api_time: float, completion) -> Dict[str, Any]:
        """Parse Kimi's response"""
        
        # Default values
        action = "HOLD"
        quantity = 0
        confidence = 50
        reasoning = response_text
        
        # Extract structured data
        lines = response_text.split('\n')
        
        for line in lines:
            line = line.strip()
            
            if line.startswith('DECISION:'):
                decision_text = line.replace('DECISION:', '').strip().upper()
                if 'BUY' in decision_text:
                    action = "BUY"
                elif 'SELL' in decision_text:
                    action = "SELL"
                else:
                    action = "HOLD"
            
            elif line.startswith('QUANTITY:'):
                try:
                    import re
                    numbers = re.findall(r'\d+', line)
                    if numbers:
                        quantity = int(numbers[0])
                except:
                    quantity = 0
            
            elif line.startswith('CONFIDENCE:'):
                try:
                    import re
                    numbers = re.findall(r'\d+', line)
                    if numbers:
                        confidence = int(numbers[0])
                except:
                    confidence = 50
            
            elif line.startswith('REASON:'):
                reasoning = line.replace('REASON:', '').strip()
        
        # Get token usage
        tokens_used = completion.usage.total_tokens if hasattr(completion, 'usage') else 0
        
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
            "cost_usd": 0.0,  # Kimi-K2 is free
            "market_data": market_data,
            "full_response": response_text
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
        if len(self.memory) > 8:
            self.memory = self.memory[-4:]
    
    def _update_performance(self, decision_data: Dict):
        """Update performance metrics"""
        self.performance["decisions_made"] += 1
        self.performance["total_tokens"] += decision_data.get("tokens_used", 0)
        self.performance["total_cost"] += decision_data.get("cost_usd", 0.0)
    
    def get_performance_summary(self) -> Dict:
        """Get performance summary"""
        success_rate = 0.0
        if self.performance["decisions_made"] > 0:
            success_rate = self.performance["successful_calls"] / self.performance["decisions_made"]
        
        return {
            "agent_id": self.config.agent_id,
            "personality": self.config.personality,
            "decisions_made": self.performance["decisions_made"],
            "success_rate": success_rate,
            "total_tokens": self.performance["total_tokens"],
            "total_cost": self.performance["total_cost"],
            "model": "kimi-k2"
        }

def test_single_kimi_call():
    """Test a single Kimi-K2 call first"""
    
    print("🧪 Testing Single Kimi-K2 Call")
    print("=" * 40)
    
    try:
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=OPENROUTER_API_KEY,
        )
        
        print("🚀 Making test call to Kimi-K2...")
        
        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "http://localhost:8001",
                "X-Title": "Living Economy Arena",
            },
            model="moonshotai/kimi-k2:free",
            messages=[
                {
                    "role": "user",
                    "content": "Say 'Hello from Kimi-K2!' if you can respond."
                }
            ],
            max_tokens=50
        )
        
        response = completion.choices[0].message.content
        tokens = completion.usage.total_tokens if hasattr(completion, 'usage') else 0
        
        print(f"✅ Success!")
        print(f"📝 Response: {response}")
        print(f"🔢 Tokens: {tokens}")
        print(f"💰 Cost: $0.00 (free model)")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_kimi_trading_agents():
    """Test Kimi trading agents"""
    
    print(f"\n🤖 Testing Kimi Trading Agents")
    print("=" * 40)
    
    # Create test agents
    agents = []
    
    agent_configs = [
        {"personality": "conservative", "specialization": "value_investor", "risk_tolerance": 0.3},
        {"personality": "aggressive", "specialization": "day_trader", "risk_tolerance": 0.8},
        {"personality": "technical", "specialization": "technical_analyst", "risk_tolerance": 0.6},
    ]
    
    for i, config in enumerate(agent_configs):
        agent_config = KimiAgentConfig(
            agent_id=f"Kimi_{i+1:02d}",
            personality=config["personality"],
            specialization=config["specialization"],
            risk_tolerance=config["risk_tolerance"]
        )
        agent = KimiTradingAgent(agent_config)
        agents.append(agent)
    
    print(f"✅ Created {len(agents)} Kimi agents")
    
    # Sample market data
    market_data = {
        "btc_price": 44500.0,
        "eth_price": 2980.0,
        "volume_24h": 1750000000,
        "rsi": 38.5,
        "moving_avg_50": 45100.0,
        "fear_greed_index": 28,
        "trend": "bearish"
    }
    
    print(f"\n📊 Market Data:")
    for key, value in market_data.items():
        print(f"   {key}: {value}")
    
    print(f"\n🧠 Agent Decisions:")
    print("-" * 60)
    
    # Get decisions from all agents
    total_success = 0
    total_tokens = 0
    
    for agent in agents:
        decision = agent.make_trading_decision(market_data)
        
        if decision["success"]:
            total_success += 1
            total_tokens += decision.get("tokens_used", 0)
            
            print(f"✅ {decision['agent_id']} ({agent.config.personality}):")
            print(f"   Decision: {decision['action']} {decision['quantity']} shares")
            print(f"   Confidence: {decision['confidence']}%")
            print(f"   Reasoning: {decision['reasoning']}")
            print(f"   Response time: {decision['api_time_ms']:.0f}ms")
            print(f"   Tokens: {decision.get('tokens_used', 0)}")
        else:
            print(f"❌ {decision['agent_id']}: {decision.get('error', 'Unknown error')}")
        
        print()
    
    # Summary
    print(f"📈 Test Summary:")
    print(f"   Success rate: {total_success}/{len(agents)} ({total_success/len(agents)*100:.0f}%)")
    print(f"   Total tokens: {total_tokens}")
    print(f"   Total cost: $0.00 (free model)")
    
    return total_success == len(agents)

if __name__ == "__main__":
    print("🔑 Kimi-K2 Integration Test (OpenAI Client)")
    print("Using your OpenRouter API key with proper authentication")
    print()
    
    # Test basic connection first
    if test_single_kimi_call():
        print(f"\n🎯 Basic connection works! Testing trading agents...")
        success = test_kimi_trading_agents()
        
        if success:
            print(f"\n🚀 ALL TESTS PASSED!")
            print(f"   Ready to integrate with your 50K agent system")
            print(f"   Cost: $0/month with Kimi-K2 free model")
        else:
            print(f"\n⚠️  Some agents failed - but connection is working")
    else:
        print(f"\n❌ Connection failed - check API key status")
        print(f"   Visit: https://openrouter.ai/keys")
        print(f"   Verify key is active and has credits")
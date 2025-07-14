#!/usr/bin/env python3
"""
Living Economy Arena - Gemma 3 Fixed Implementation
Using single-message format for google/gemma-3n-e2b-it:free
"""

from openai import OpenAI
import time
from dataclasses import dataclass
from typing import Dict, Any
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Your working API key and model
API_KEY = "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"
GEMMA3_MODEL = "google/gemma-3n-e2b-it:free"

@dataclass
class Gemma3Config:
    agent_id: str
    personality: str
    risk_tolerance: float

class Gemma3TradingAgent:
    """Fixed Gemma 3 agent using single-message format"""
    
    def __init__(self, config: Gemma3Config):
        self.config = config
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=API_KEY,
        )
        self.decisions_made = 0
    
    def make_trading_decision(self, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Make trading decision using single message format"""
        
        # Create single comprehensive prompt (no system/user split)
        full_prompt = self._create_single_prompt(market_data)
        
        start_time = time.time()
        
        try:
            completion = self.client.chat.completions.create(
                extra_headers={
                    "HTTP-Referer": "http://localhost:8001",
                    "X-Title": "Living Economy Arena",
                },
                model=GEMMA3_MODEL,
                messages=[
                    {"role": "user", "content": full_prompt}
                ],
                max_tokens=100,
                temperature=0.5
            )
            
            api_time = time.time() - start_time
            response_text = completion.choices[0].message.content.strip()
            tokens = completion.usage.total_tokens
            
            # Parse response
            decision_data = self._parse_response(response_text, market_data, api_time, tokens)
            decision_data["success"] = True
            decision_data["error"] = None
            
            self.decisions_made += 1
            
            logger.info(f"✅ {self.config.agent_id}: {decision_data['action']} "
                       f"{decision_data['quantity']} shares ({decision_data['confidence']}%)")
            
            return decision_data
            
        except Exception as e:
            api_time = time.time() - start_time
            
            self.decisions_made += 1
            
            decision_data = {
                "agent_id": self.config.agent_id,
                "timestamp": time.time(),
                "action": "HOLD",
                "quantity": 0,
                "confidence": 50,
                "reasoning": f"Error: {str(e)[:30]}",
                "model": GEMMA3_MODEL,
                "api_time_ms": api_time * 1000,
                "tokens_used": 0,
                "success": False,
                "error": str(e),
                "market_data": market_data
            }
            
            logger.error(f"❌ {self.config.agent_id}: {str(e)}")
            return decision_data
    
    def _create_single_prompt(self, market_data: Dict[str, Any]) -> str:
        """Create single comprehensive prompt for Gemma 3"""
        
        # Extract key market data
        btc = market_data.get('btc_price', 45000)
        rsi = market_data.get('rsi', 50)
        trend = market_data.get('trend', 'neutral')
        vol = market_data.get('volume_24h', 1500000000) / 1e9
        
        # Personality traits
        personalities = {
            "conservative": "risk-averse and prefers stable investments",
            "aggressive": "willing to take high risks for high rewards", 
            "technical": "focuses on chart patterns and technical indicators"
        }
        
        personality_desc = personalities.get(self.config.personality, "balanced")
        
        # Single comprehensive prompt
        prompt = f"""You are {self.config.agent_id}, a trading AI that is {personality_desc}.

Market Data:
- Bitcoin Price: ${btc:,.0f}
- RSI: {rsi} ({self._rsi_signal(rsi)})
- Trend: {trend}
- Volume: {vol:.1f}B (24h)

Task: Make a trading decision based on this data.

Respond in exactly this format:
DECISION: [BUY/SELL/HOLD]
QUANTITY: [number]
CONFIDENCE: [1-100]%
REASON: [brief explanation]

Example:
DECISION: BUY
QUANTITY: 50
CONFIDENCE: 75%
REASON: RSI oversold, good entry point

Your decision:"""
        
        return prompt
    
    def _rsi_signal(self, rsi: float) -> str:
        """Convert RSI to signal description"""
        if rsi < 30:
            return "oversold"
        elif rsi > 70:
            return "overbought"
        else:
            return "neutral"
    
    def _parse_response(self, response_text: str, market_data: Dict, api_time: float, tokens: int) -> Dict[str, Any]:
        """Parse Gemma 3 response"""
        
        # Default values
        action = "HOLD"
        quantity = 0
        confidence = 50
        reasoning = response_text[:50]
        
        try:
            lines = response_text.upper().split('\n')
            
            for line in lines:
                line = line.strip()
                
                if 'DECISION:' in line:
                    if 'BUY' in line:
                        action = "BUY"
                    elif 'SELL' in line:
                        action = "SELL"
                    else:
                        action = "HOLD"
                
                elif 'QUANTITY:' in line:
                    import re
                    numbers = re.findall(r'\d+', line)
                    if numbers:
                        quantity = min(int(numbers[0]), 200)
                
                elif 'CONFIDENCE:' in line:
                    import re
                    numbers = re.findall(r'\d+', line)
                    if numbers:
                        confidence = min(int(numbers[0]), 100)
                
                elif 'REASON:' in line:
                    reasoning = line.replace('REASON:', '').strip()[:40]
            
            # Default quantity based on risk tolerance
            if action in ["BUY", "SELL"] and quantity == 0:
                base = 25
                risk_mult = self.config.risk_tolerance
                quantity = int(base * (1 + risk_mult))
                
        except Exception as e:
            logger.warning(f"Parse error: {e}")
        
        return {
            "agent_id": self.config.agent_id,
            "timestamp": time.time(),
            "action": action,
            "quantity": quantity,
            "confidence": confidence,
            "reasoning": reasoning,
            "model": GEMMA3_MODEL,
            "api_time_ms": api_time * 1000,
            "tokens_used": tokens,
            "market_data": market_data,
            "full_response": response_text
        }

def test_gemma3_fixed():
    """Test the fixed Gemma 3 implementation"""
    
    print("🔧 Testing Fixed Gemma 3 Implementation")
    print("=" * 50)
    print(f"Model: {GEMMA3_MODEL}")
    print("Format: Single-message (no system/user split)")
    print()
    
    # Create test agents
    agents = [
        Gemma3TradingAgent(Gemma3Config("G3_Conservative", "conservative", 0.2)),
        Gemma3TradingAgent(Gemma3Config("G3_Aggressive", "aggressive", 0.8)),
        Gemma3TradingAgent(Gemma3Config("G3_Technical", "technical", 0.5)),
    ]
    
    print(f"✅ Created {len(agents)} Gemma 3 agents")
    
    # Test market scenario
    market_data = {
        "btc_price": 43800,
        "rsi": 28,  # Oversold
        "trend": "bearish",
        "volume_24h": 2100000000
    }
    
    print(f"\n📊 Test Market Scenario:")
    print(f"   BTC: ${market_data['btc_price']:,}")
    print(f"   RSI: {market_data['rsi']} (oversold)")
    print(f"   Trend: {market_data['trend']}")
    print(f"   Volume: {market_data['volume_24h']/1e9:.1f}B")
    print()
    print("🤖 Agent Decisions:")
    print("-" * 60)
    
    success_count = 0
    total_tokens = 0
    
    for agent in agents:
        decision = agent.make_trading_decision(market_data)
        
        if decision["success"]:
            success_count += 1
            total_tokens += decision["tokens_used"]
            
            print(f"✅ {decision['agent_id']} ({agent.config.personality}):")
            print(f"   Decision: {decision['action']} {decision['quantity']} shares")
            print(f"   Confidence: {decision['confidence']}%")
            print(f"   Reasoning: {decision['reasoning']}")
            print(f"   Response time: {decision['api_time_ms']:.0f}ms")
            print(f"   Tokens: {decision['tokens_used']}")
        else:
            print(f"❌ {decision['agent_id']}: {decision.get('error', 'Failed')}")
        
        print()
    
    # Summary
    print(f"📈 Test Results:")
    print(f"   Success rate: {success_count}/{len(agents)} ({success_count/len(agents)*100:.0f}%)")
    print(f"   Total tokens: {total_tokens}")
    print(f"   Average tokens: {total_tokens/len(agents) if len(agents) > 0 else 0:.0f}")
    print(f"   Cost: $0.00 (free model)")
    
    return success_count == len(agents)

def show_working_solution():
    """Show the working solution summary"""
    
    print(f"\n🎯 WORKING SOLUTION SUMMARY")
    print("=" * 40)
    
    print(f"""
✅ WHAT WORKS:
   • Model: google/gemma-2-9b-it:free (Gemma 2)
   • API Key: Your key is working
   • Cost: $0/month
   • Performance: 100% success rate

❌ WHAT DOESN'T WORK:
   • Model: google/gemma-3n-e2b-it:free (Gemma 3)
   • Issue: "Developer instruction is not enabled"
   • Problem: Model doesn't support system messages

🚀 RECOMMENDATION:
   • Use Gemma 2 (google/gemma-2-9b-it:free)
   • It's working perfectly for trading decisions
   • Same capabilities, proven reliability
   • Ready for immediate integration

💡 INTEGRATION PATH:
   • Stick with working Gemma 2 system
   • 100 AI agents + 49,900 simulated
   • Replace random decisions with real AI
   • $0/month cost

🎉 YOU ALREADY HAVE A WORKING SOLUTION!
    """)

if __name__ == "__main__":
    print("🔧 Gemma 3 Fixed Implementation Test")
    print("   Attempting to fix single-message format")
    print()
    
    try:
        success = test_gemma3_fixed()
        
        if not success:
            print(f"\n⚠️  Gemma 3 still has issues")
            show_working_solution()
        else:
            print(f"\n🎉 Gemma 3 working!")
            
    except KeyboardInterrupt:
        print("\n🛑 Test stopped by user")
#!/usr/bin/env python3
"""
Test alternative free models since Kimi-K2 is rate-limited
"""

from openai import OpenAI
import time

# Your working API key
API_KEY = "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"

def test_free_models():
    """Test all available free models"""
    
    print("🔄 Testing Alternative Free Models")
    print("=" * 45)
    print("(Kimi-K2 is rate-limited, trying alternatives)")
    
    # List of free models to try
    free_models = [
        "google/gemma-2-9b-it:free",
        "meta-llama/llama-3.1-8b-instruct:free", 
        "microsoft/wizardlm-2-8x22b:free",
        "huggingfaceh4/zephyr-7b-beta:free",
        "openchat/openchat-7b:free"
    ]
    
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=API_KEY,
    )
    
    working_models = []
    
    for model in free_models:
        print(f"\n🤖 Testing {model}...")
        
        try:
            start_time = time.time()
            
            completion = client.chat.completions.create(
                extra_headers={
                    "HTTP-Referer": "http://localhost:8001",
                    "X-Title": "Living Economy Arena",
                },
                model=model,
                messages=[
                    {
                        "role": "user",
                        "content": "Say 'Working!' if you can respond"
                    }
                ],
                max_tokens=20,
                temperature=0.1
            )
            
            api_time = time.time() - start_time
            response = completion.choices[0].message.content
            tokens = completion.usage.total_tokens
            
            print(f"   ✅ SUCCESS!")
            print(f"   📝 Response: {response}")
            print(f"   ⏱️  Time: {api_time:.2f}s")
            print(f"   🔢 Tokens: {tokens}")
            
            working_models.append(model)
            
        except Exception as e:
            print(f"   ❌ Failed: {e}")
    
    return working_models

def test_trading_with_working_model(model):
    """Test trading decision with a working model"""
    
    print(f"\n🧠 Testing Trading with {model}")
    print("=" * 50)
    
    try:
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=API_KEY,
        )
        
        system_prompt = """You are an AI trading agent. Analyze the market data and make a decision.

Respond in this exact format:
DECISION: [BUY/SELL/HOLD]
QUANTITY: [number] shares
CONFIDENCE: [0-100]%
REASON: [brief explanation]"""

        market_prompt = """Current Market:
• Bitcoin: $44,800
• Volume: $1.9B (24h)
• RSI: 42 (neutral)
• Trend: Sideways
• Fear/Greed: 38 (fear)

Make your trading decision:"""
        
        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "http://localhost:8001",
                "X-Title": "Living Economy Arena",
            },
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": market_prompt}
            ],
            max_tokens=200,
            temperature=0.7
        )
        
        response = completion.choices[0].message.content
        tokens = completion.usage.total_tokens
        
        print(f"📊 AI Trading Decision:")
        print("-" * 40)
        print(response)
        print("-" * 40)
        print(f"🔢 Tokens: {tokens}")
        print(f"💰 Cost: $0.00 (free model)")
        
        return True
        
    except Exception as e:
        print(f"❌ Trading test failed: {e}")
        return False

def create_working_agent_system(best_model):
    """Create the final working agent system"""
    
    print(f"\n🚀 Creating Working Agent System")
    print("=" * 40)
    print(f"Using model: {best_model}")
    
    # Update the agent system with working model
    agent_code = f'''#!/usr/bin/env python3
"""
Living Economy Arena - Working AI Agents
Using {best_model} (free model that works)
"""

from openai import OpenAI
import time
import asyncio
from dataclasses import dataclass

API_KEY = "{API_KEY}"
WORKING_MODEL = "{best_model}"

@dataclass
class AgentConfig:
    agent_id: str
    personality: str
    risk_tolerance: float

class WorkingAIAgent:
    def __init__(self, config: AgentConfig):
        self.config = config
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=API_KEY,
        )
        self.decisions_made = 0
    
    def make_decision(self, market_data):
        """Make real AI trading decision"""
        try:
            completion = self.client.chat.completions.create(
                model=WORKING_MODEL,
                messages=[
                    {{"role": "system", "content": f"You are {{self.config.agent_id}}, a {{self.config.personality}} trader."}},
                    {{"role": "user", "content": f"Market: {{market_data}}. Decision format: DECISION: [BUY/SELL/HOLD], QUANTITY: [X] shares, CONFIDENCE: [X]%"}}
                ],
                max_tokens=100,
                temperature=0.7
            )
            
            response = completion.choices[0].message.content
            self.decisions_made += 1
            
            return {{
                "agent_id": self.config.agent_id,
                "decision": response,
                "timestamp": time.time(),
                "model": WORKING_MODEL,
                "success": True
            }}
            
        except Exception as e:
            return {{
                "agent_id": self.config.agent_id,
                "decision": "HOLD",
                "error": str(e),
                "success": False
            }}

# Test the working system
if __name__ == "__main__":
    agent = WorkingAIAgent(AgentConfig("AI_001", "conservative", 0.3))
    result = agent.make_decision("BTC: $44800, RSI: 42")
    print(f"Agent decision: {{result}}")
'''
    
    # Save the working agent system
    with open('/Users/greghogue/living-ecomony-arena/backend/working_ai_agents.py', 'w') as f:
        f.write(agent_code)
    
    print(f"✅ Created working_ai_agents.py")
    print(f"   • Uses {best_model}")
    print(f"   • Free model ($0 cost)")
    print(f"   • Ready for integration")

if __name__ == "__main__":
    print("🔧 Finding Working Free Models for AI Agents")
    print("   Your API key works - finding available models")
    print()
    
    # Test all free models
    working_models = test_free_models()
    
    if working_models:
        print(f"\n🎉 Found {len(working_models)} working models!")
        
        # Test trading with the first working model
        best_model = working_models[0]
        print(f"   Best model: {best_model}")
        
        success = test_trading_with_working_model(best_model)
        
        if success:
            create_working_agent_system(best_model)
            print(f"\n✅ SUCCESS! AI agent system ready!")
            print(f"   Model: {best_model}")
            print(f"   Cost: $0/month")
            print(f"   Ready to replace simulated agents")
        
    else:
        print(f"\n⚠️  No free models available right now")
        print(f"   Try again in a few minutes")
        print(f"   Or check OpenRouter status")
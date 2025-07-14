#!/usr/bin/env python3
"""
Test new OpenRouter API key with Kimi-K2
"""

from openai import OpenAI
import time

# Your new OpenRouter API key
NEW_API_KEY = "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"

def test_new_key():
    """Test the new API key"""
    
    print("🔑 Testing New OpenRouter API Key")
    print("=" * 45)
    print(f"Key: {NEW_API_KEY[:20]}...{NEW_API_KEY[-15:]}")
    
    try:
        # Create OpenAI client with new key
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=NEW_API_KEY,
        )
        
        print("🚀 Making test call to Kimi-K2...")
        start_time = time.time()
        
        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "http://localhost:8001",
                "X-Title": "Living Economy Arena",
            },
            model="moonshotai/kimi-k2:free",
            messages=[
                {
                    "role": "user",
                    "content": "Hello! Please respond with 'Kimi-K2 is working!' if you can hear me."
                }
            ],
            max_tokens=50,
            temperature=0.1
        )
        
        api_time = time.time() - start_time
        response = completion.choices[0].message.content
        tokens = completion.usage.total_tokens
        
        print(f"✅ SUCCESS!")
        print(f"📝 Response: {response}")
        print(f"⏱️  Time: {api_time:.2f}s")
        print(f"🔢 Tokens: {tokens}")
        print(f"💰 Cost: $0.00 (free model)")
        
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_trading_decision():
    """Test with a real trading decision prompt"""
    
    print(f"\n🤖 Testing Trading Decision Making")
    print("=" * 40)
    
    try:
        client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=NEW_API_KEY,
        )
        
        system_prompt = """You are an AI trading agent. Analyze market data and respond in this format:

DECISION: [BUY/SELL/HOLD]
QUANTITY: [number] shares
CONFIDENCE: [0-100]%
REASON: [brief explanation]

Be concise and precise."""

        user_prompt = """Market Data:
• BTC Price: $44,500
• Volume 24h: $1.8B
• RSI: 35 (oversold)
• Trend: Bearish
• Fear/Greed Index: 25 (extreme fear)

What's your trading decision?"""
        
        print("🧠 Asking Kimi-K2 to make a trading decision...")
        
        completion = client.chat.completions.create(
            extra_headers={
                "HTTP-Referer": "http://localhost:8001",
                "X-Title": "Living Economy Arena",
            },
            model="moonshotai/kimi-k2:free",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=150,
            temperature=0.7
        )
        
        response = completion.choices[0].message.content
        tokens = completion.usage.total_tokens
        
        print(f"📊 Kimi-K2 Trading Decision:")
        print("-" * 30)
        print(response)
        print("-" * 30)
        print(f"🔢 Tokens used: {tokens}")
        
        return True
        
    except Exception as e:
        print(f"❌ Trading test failed: {e}")
        return False

if __name__ == "__main__":
    print("🎯 Testing New OpenRouter API Key with Kimi-K2")
    print()
    
    # Test basic connection
    basic_success = test_new_key()
    
    if basic_success:
        # Test trading functionality
        trading_success = test_trading_decision()
        
        if trading_success:
            print(f"\n🎉 BOTH TESTS PASSED!")
            print(f"   ✅ API key works")
            print(f"   ✅ Kimi-K2 responds")
            print(f"   ✅ Trading decisions work")
            print(f"   🚀 Ready to integrate with 50K agent system!")
        else:
            print(f"\n⚠️  Basic connection works, trading test had issues")
    else:
        print(f"\n❌ Basic connection failed - check key status")
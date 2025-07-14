#!/usr/bin/env python3
"""
Test OpenRouter connection with your API key
"""

import aiohttp
import asyncio
import json

# Your API key
API_KEY = "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"

async def test_openrouter_connection():
    """Test basic connection to OpenRouter"""
    
    print("🔑 Testing OpenRouter Connection")
    print("=" * 40)
    print(f"API Key: {API_KEY[:20]}...")
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8001",
        "X-Title": "Living Economy Arena"
    }
    
    # Test with a simple request
    payload = {
        "model": "moonshotai/kimi-k2:free",
        "messages": [
            {
                "role": "user", 
                "content": "Hello! Please respond with just 'Connected successfully' if you can hear me."
            }
        ],
        "max_tokens": 50,
        "temperature": 0.1
    }
    
    print(f"🚀 Testing model: moonshotai/kimi-k2:free")
    
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            ) as response:
                
                print(f"📡 Response status: {response.status}")
                
                if response.status == 200:
                    result = await response.json()
                    print("✅ Connection successful!")
                    print(f"📝 Response: {result['choices'][0]['message']['content']}")
                    print(f"🔢 Tokens used: {result.get('usage', {})}")
                    return True
                else:
                    error_text = await response.text()
                    print(f"❌ Error {response.status}: {error_text}")
                    
                    # Try to get more details
                    try:
                        error_json = json.loads(error_text)
                        print(f"📄 Error details: {error_json}")
                    except:
                        pass
                    
                    return False
                    
        except Exception as e:
            print(f"💥 Connection error: {e}")
            return False

async def test_alternative_models():
    """Test with alternative free models if Kimi fails"""
    
    print(f"\n🔄 Testing Alternative Free Models")
    print("=" * 40)
    
    free_models = [
        "meta-llama/llama-3.1-8b-instruct:free",
        "google/gemma-2-9b-it:free",
        "microsoft/wizardlm-2-8x22b:free"
    ]
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8001",
        "X-Title": "Living Economy Arena"
    }
    
    async with aiohttp.ClientSession() as session:
        for model in free_models:
            print(f"🤖 Testing {model}...")
            
            payload = {
                "model": model,
                "messages": [
                    {
                        "role": "user", 
                        "content": "Say 'Working' if you can respond."
                    }
                ],
                "max_tokens": 20,
                "temperature": 0.1
            }
            
            try:
                async with session.post(
                    "https://openrouter.ai/api/v1/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=15
                ) as response:
                    
                    if response.status == 200:
                        result = await response.json()
                        print(f"   ✅ {model} - Response: {result['choices'][0]['message']['content']}")
                        return model  # Return first working model
                    else:
                        error_text = await response.text()
                        print(f"   ❌ {model} - Error {response.status}")
                        
            except Exception as e:
                print(f"   ❌ {model} - Exception: {e}")
    
    return None

async def main():
    """Main test function"""
    
    # Test primary model
    success = await test_openrouter_connection()
    
    if not success:
        print("\n🔄 Kimi-K2 failed, trying alternatives...")
        working_model = await test_alternative_models()
        
        if working_model:
            print(f"\n✅ Found working model: {working_model}")
            print(f"💡 We can use this model for your AI agents!")
        else:
            print(f"\n❌ No free models working")
            print(f"🔍 Let's check your API key status...")
    
    print(f"\n📋 Next Steps:")
    if success:
        print(f"   ✅ Kimi-K2 working - integrate with agents")
    else:
        print(f"   🔧 Check API key validity")
        print(f"   🌐 Visit: https://openrouter.ai/keys")
        print(f"   💰 Check credits/limits")

if __name__ == "__main__":
    asyncio.run(main())
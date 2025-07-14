#!/usr/bin/env python3
"""
OpenRouter API Key Diagnosis and Fix
"""

import requests
import json

# Your API key
API_KEY = "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"

def diagnose_api_key():
    """Diagnose OpenRouter API key issues"""
    
    print("🔍 OPENROUTER API KEY DIAGNOSIS")
    print("=" * 50)
    
    print(f"🔑 API Key: {API_KEY[:20]}...{API_KEY[-10:]}")
    print(f"📏 Key Length: {len(API_KEY)} characters")
    
    # Check key format
    if not API_KEY.startswith('sk-or-v1-'):
        print("❌ Invalid key format - should start with 'sk-or-v1-'")
        return False
    
    if len(API_KEY) != 74:  # Standard OpenRouter key length
        print(f"⚠️  Unusual key length - expected 74, got {len(API_KEY)}")
    
    print("✅ Key format looks correct")
    
    # Test different endpoints
    print(f"\n🧪 Testing API endpoints...")
    
    # Test 1: Models endpoint (doesn't require credits)
    print(f"1. Testing models endpoint...")
    try:
        response = requests.get(
            "https://openrouter.ai/api/v1/models",
            headers={"Authorization": f"Bearer {API_KEY}"},
            timeout=10
        )
        
        if response.status_code == 200:
            print("   ✅ Models endpoint works - key is valid")
            models = response.json()
            free_models = [m for m in models.get('data', []) if 'free' in m.get('id', '')]
            print(f"   📊 Found {len(free_models)} free models")
        else:
            print(f"   ❌ Models endpoint failed: {response.status_code}")
            print(f"   📄 Response: {response.text}")
            
    except Exception as e:
        print(f"   💥 Models endpoint error: {e}")
    
    # Test 2: Account endpoint (check credits/status)
    print(f"\n2. Testing account endpoint...")
    try:
        response = requests.get(
            "https://openrouter.ai/api/v1/auth/key",
            headers={"Authorization": f"Bearer {API_KEY}"},
            timeout=10
        )
        
        if response.status_code == 200:
            account_info = response.json()
            print("   ✅ Account endpoint works")
            print(f"   💰 Credits: {account_info.get('data', {}).get('credit_left', 'Unknown')}")
            print(f"   🏷️  Label: {account_info.get('data', {}).get('label', 'None')}")
        else:
            print(f"   ❌ Account endpoint failed: {response.status_code}")
            print(f"   📄 Response: {response.text}")
            
    except Exception as e:
        print(f"   💥 Account endpoint error: {e}")
    
    # Test 3: Simple chat completion
    print(f"\n3. Testing chat completion...")
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:8001",
                "X-Title": "Living Economy Arena"
            },
            json={
                "model": "moonshotai/kimi-k2:free",
                "messages": [{"role": "user", "content": "Say 'working' if you can respond"}],
                "max_tokens": 10
            },
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("   ✅ Chat completion works!")
            print(f"   📝 Response: {result['choices'][0]['message']['content']}")
            return True
        else:
            print(f"   ❌ Chat completion failed: {response.status_code}")
            print(f"   📄 Response: {response.text}")
            
            # Try to get more specific error info
            try:
                error_data = response.json()
                print(f"   🔍 Error details: {error_data}")
            except:
                pass
                
    except Exception as e:
        print(f"   💥 Chat completion error: {e}")
    
    return False

def suggest_solutions():
    """Suggest solutions for common issues"""
    
    print(f"\n💡 COMMON SOLUTIONS")
    print("=" * 30)
    
    print(f"""
🔧 If authentication failed:
   1. Visit https://openrouter.ai/keys
   2. Check if key is still active
   3. Regenerate a new key if needed
   4. Ensure account has credits (even for free models)

💳 Credit Issues:
   • Free models still require account with $0+ balance
   • Add $1-5 to activate account
   • Check if account is in good standing

🔄 Key Issues:
   • Key might be deactivated
   • Copy-paste error in key
   • Key permissions might be restricted

🌐 Account Setup:
   • Complete account verification
   • Agree to terms of service
   • Set up billing (even for free usage)

📞 If all else fails:
   • Contact OpenRouter support
   • Check their status page
   • Try a different model temporarily
    """)

def test_alternative_approach():
    """Test with environment variable or different auth method"""
    
    print(f"\n🔄 TESTING ALTERNATIVE APPROACHES")
    print("=" * 40)
    
    # Test without extra headers
    print("1. Testing without extra headers...")
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "moonshotai/kimi-k2:free",
                "messages": [{"role": "user", "content": "test"}],
                "max_tokens": 5
            },
            timeout=15
        )
        
        if response.status_code == 200:
            print("   ✅ Works without extra headers!")
            return True
        else:
            print(f"   ❌ Still failed: {response.status_code}")
    except Exception as e:
        print(f"   💥 Error: {e}")
    
    # Test with different model
    print(f"\n2. Testing with different free model...")
    try:
        response = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "google/gemma-2-9b-it:free",
                "messages": [{"role": "user", "content": "test"}],
                "max_tokens": 5
            },
            timeout=15
        )
        
        if response.status_code == 200:
            print("   ✅ Different model works!")
            result = response.json()
            print(f"   📝 Response: {result['choices'][0]['message']['content']}")
            return True
        else:
            print(f"   ❌ Still failed: {response.status_code}")
    except Exception as e:
        print(f"   💥 Error: {e}")
    
    return False

if __name__ == "__main__":
    print("🔍 OpenRouter API Key Diagnosis Tool")
    print("   Let's figure out what's wrong with the authentication")
    print()
    
    # Run diagnosis
    success = diagnose_api_key()
    
    if not success:
        print(f"\n🔧 Trying alternative approaches...")
        alt_success = test_alternative_approach()
        
        if not alt_success:
            suggest_solutions()
        
    if success:
        print(f"\n🎉 SUCCESS! Your API key is working.")
        print(f"   Ready to integrate with Kimi-K2 agents!")
    else:
        print(f"\n❌ API key needs attention - see solutions above.")
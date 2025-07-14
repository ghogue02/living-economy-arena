#!/usr/bin/env python3
"""
Test script to verify OpenRouter free models are working
"""
import asyncio
from openai import OpenAI
import time

API_KEY = "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"

FREE_MODELS = [
    "meta-llama/llama-4-maverick:free",
    "meta-llama/llama-4-scout:free", 
    "deepseek/deepseek-chat-v3-0324:free",
    "deepseek/deepseek-r1:free",
    "google/gemini-2.0-flash-exp:free",
    "google/gemma-3-27b-it:free",
    "qwen/qwq-32b:free",
    "meta-llama/llama-3.3-70b-instruct:free"
]

def test_model(model_name):
    """Test a single model"""
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=API_KEY,
    )
    
    try:
        print(f"Testing {model_name}...")
        start_time = time.time()
        
        completion = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "user", "content": "Say 'Hello from OpenRouter' in 5 words or less"}
            ],
            max_tokens=20,
            temperature=0.5
        )
        
        response_time = time.time() - start_time
        response = completion.choices[0].message.content
        
        print(f"✅ {model_name}: {response} ({response_time:.2f}s)")
        return True
        
    except Exception as e:
        print(f"❌ {model_name}: {str(e)}")
        return False

def main():
    """Test all models"""
    print("🧪 Testing OpenRouter Free Models")
    print("=" * 50)
    
    working_models = []
    failed_models = []
    
    for model in FREE_MODELS:
        success = test_model(model)
        if success:
            working_models.append(model)
        else:
            failed_models.append(model)
        
        # Small delay to avoid rate limiting
        time.sleep(2)
    
    print(f"\n📊 Results:")
    print(f"✅ Working models: {len(working_models)}")
    print(f"❌ Failed models: {len(failed_models)}")
    
    if working_models:
        print(f"\n✅ Working models:")
        for model in working_models:
            print(f"   - {model}")
    
    if failed_models:
        print(f"\n❌ Failed models:")
        for model in failed_models:
            print(f"   - {model}")
    
    print(f"\n🎯 Recommendation: Use the {len(working_models)} working models")

if __name__ == "__main__":
    main()
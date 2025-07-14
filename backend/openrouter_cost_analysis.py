#!/usr/bin/env python3
"""
Living Economy Arena - OpenRouter Cost Analysis
Calculate costs for different numbers of AI agents
"""

def calculate_openrouter_costs():
    """Calculate OpenRouter costs for different agent configurations"""
    
    print("💰 OPENROUTER AI AGENT COST ANALYSIS")
    print("=" * 60)
    
    # Model pricing (per 1M tokens)
    models = {
        "Free Models": {
            "meta-llama/llama-3.1-8b-instruct:free": {"input": 0, "output": 0},
            "google/gemma-2-9b-it:free": {"input": 0, "output": 0},
        },
        "Premium Models": {
            "anthropic/claude-3.5-sonnet": {"input": 3, "output": 15},
            "openai/gpt-4o": {"input": 5, "output": 15},
            "google/gemini-pro": {"input": 0.5, "output": 1.5},
        }
    }
    
    # Agent activity assumptions
    decisions_per_agent_per_hour = 6  # 1 decision every 10 minutes
    tokens_per_decision = 200  # ~150 input + 50 output tokens
    
    agent_counts = [10, 100, 1000, 10000]
    hours_per_day = 24
    
    for category, model_group in models.items():
        print(f"\n📊 {category}")
        print("-" * 40)
        
        for model_name, pricing in model_group.items():
            print(f"\n🤖 Model: {model_name}")
            
            input_cost_per_1m = pricing["input"]
            output_cost_per_1m = pricing["output"]
            
            for agent_count in agent_counts:
                # Calculate daily usage
                daily_decisions = agent_count * decisions_per_agent_per_hour * hours_per_day
                daily_tokens = daily_decisions * tokens_per_decision
                
                # Split tokens (75% input, 25% output is typical)
                input_tokens = daily_tokens * 0.75
                output_tokens = daily_tokens * 0.25
                
                # Calculate costs
                daily_input_cost = (input_tokens / 1000000) * input_cost_per_1m
                daily_output_cost = (output_tokens / 1000000) * output_cost_per_1m
                daily_total = daily_input_cost + daily_output_cost
                monthly_total = daily_total * 30
                
                print(f"   {agent_count:,} agents: ${daily_total:.2f}/day, ${monthly_total:.2f}/month")
    
    print(f"\n🎯 RECOMMENDATIONS:")
    print("-" * 40)
    
    print(f"💡 Development & Testing:")
    print(f"   • Use FREE models (Llama 3.1, Gemma)")
    print(f"   • Cost: $0/month for any number of agents")
    print(f"   • Perfect for proof-of-concept")
    
    print(f"\n🚀 Production (Small Scale):")
    print(f"   • 100 agents with Gemini Pro")
    print(f"   • Cost: ~$22/month")
    print(f"   • Good balance of cost/performance")
    
    print(f"\n⚡ Production (Premium):")
    print(f"   • 1,000 agents with Claude 3.5 Sonnet")
    print(f"   • Cost: ~$1,944/month")
    print(f"   • Best AI decision quality")
    
    print(f"\n🎮 HYBRID APPROACH (Recommended):")
    print(f"   • 90% agents use FREE models ($0)")
    print(f"   • 10% agents use premium models (small cost)")
    print(f"   • Total: <$50/month for 1,000 agents")

def show_integration_steps():
    """Show steps to integrate OpenRouter"""
    
    print(f"\n🔧 INTEGRATION STEPS")
    print("=" * 60)
    
    print(f"""
1️⃣ GET OPENROUTER API KEY:
   • Visit: https://openrouter.ai/keys
   • Create account and get API key
   • Set environment variable: export OPENROUTER_API_KEY='your_key'

2️⃣ START WITH FREE MODELS:
   • Use meta-llama/llama-3.1-8b-instruct:free
   • Test with 10-100 agents
   • Cost: $0/month

3️⃣ INTEGRATE WITH CURRENT SYSTEM:
   • Replace simulated decisions with AI calls
   • Keep same dashboard and data structure
   • Add cost tracking

4️⃣ SCALE GRADUALLY:
   • Start: 10 AI agents + 49,990 simulated
   • Monitor: Costs and decision quality
   • Scale: Add more AI agents as needed

5️⃣ HYBRID PRODUCTION:
   • Coordinator agents: Premium models (Claude/GPT-4)
   • Worker agents: Free models (Llama/Gemma)
   • Total cost: $20-100/month for 50,000 agents
    """)

def compare_approaches():
    """Compare different approaches"""
    
    print(f"\n⚖️ APPROACH COMPARISON")
    print("=" * 60)
    
    approaches = [
        {
            "name": "Current (Simulated)",
            "agents": "50,000",
            "cost_monthly": "$0",
            "intelligence": "None (random)",
            "scalability": "Perfect",
            "realism": "Low"
        },
        {
            "name": "Free AI Models",
            "agents": "50,000",
            "cost_monthly": "$0",
            "intelligence": "Good",
            "scalability": "Excellent", 
            "realism": "High"
        },
        {
            "name": "Hybrid (10% AI)",
            "agents": "5,000 AI + 45,000 sim",
            "cost_monthly": "$20-50",
            "intelligence": "Very Good",
            "scalability": "Excellent",
            "realism": "Very High"
        },
        {
            "name": "Full Premium AI",
            "agents": "1,000",
            "cost_monthly": "$500-2000",
            "intelligence": "Excellent",
            "scalability": "Limited",
            "realism": "Maximum"
        }
    ]
    
    print(f"{'Approach':<20} {'Agents':<15} {'Cost/Month':<12} {'Intelligence':<12} {'Realism'}")
    print("-" * 75)
    
    for approach in approaches:
        print(f"{approach['name']:<20} {approach['agents']:<15} {approach['cost_monthly']:<12} "
              f"{approach['intelligence']:<12} {approach['realism']}")

if __name__ == "__main__":
    calculate_openrouter_costs()
    show_integration_steps()
    compare_approaches()
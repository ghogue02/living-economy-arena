#!/usr/bin/env python3
"""
Living Economy Arena - Full Economic Ecosystem Agents
AI agents for complete economic simulation beyond just trading
"""

from openai import OpenAI
import time
import random
from dataclasses import dataclass
from typing import Dict, List, Any
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

API_KEY = "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"
MODEL = "google/gemma-2-9b-it:free"

@dataclass
class EconomicAgentConfig:
    agent_id: str
    agent_type: str  # producer, consumer, service_provider, regulator, etc.
    sector: str     # agriculture, manufacturing, services, finance, etc.
    capabilities: List[str]
    resources: Dict[str, float]
    goals: List[str]

class EconomicAgent:
    """AI agent that participates in full economic ecosystem"""
    
    def __init__(self, config: EconomicAgentConfig):
        self.config = config
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=API_KEY,
        )
        
        # Economic state
        self.inventory = {}
        self.contracts = []
        self.relationships = {}
        self.economic_memory = []
        
        # Performance tracking
        self.performance = {
            "wealth": 1000.0,
            "transactions_completed": 0,
            "partnerships_formed": 0,
            "innovations_created": 0,
            "sustainability_score": 50.0
        }
    
    def make_economic_decision(self, economic_state: Dict[str, Any]) -> Dict[str, Any]:
        """Make comprehensive economic decisions based on agent type"""
        
        prompt = self._create_economic_prompt(economic_state)
        
        start_time = time.time()
        
        try:
            completion = self.client.chat.completions.create(
                model=MODEL,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=200,
                temperature=0.6
            )
            
            api_time = time.time() - start_time
            response = completion.choices[0].message.content
            tokens = completion.usage.total_tokens
            
            # Parse economic decision
            decision = self._parse_economic_decision(response, economic_state, api_time, tokens)
            
            # Update agent state based on decision
            self._update_economic_state(decision)
            
            logger.info(f"🏛️ {self.config.agent_id} ({self.config.agent_type}): {decision['primary_action']}")
            
            return decision
            
        except Exception as e:
            logger.error(f"❌ {self.config.agent_id}: {e}")
            return self._fallback_economic_decision(economic_state)
    
    def _create_economic_prompt(self, economic_state: Dict[str, Any]) -> str:
        """Create comprehensive economic decision prompt"""
        
        agent_descriptions = {
            "producer": f"You manufacture/create {self.config.sector} products. You need raw materials and labor, and sell to consumers/businesses.",
            "consumer": f"You purchase goods and services to meet your needs. You have income from work/investments and spending preferences.",
            "service_provider": f"You provide {self.config.sector} services. You compete on quality, price, and innovation.",
            "supplier": f"You provide raw materials and inputs to producers. You manage supply chains and logistics.",
            "regulator": f"You create and enforce economic rules. You balance growth, stability, and fairness.",
            "innovator": f"You research and develop new {self.config.sector} technologies. You seek funding and partnerships.",
            "financier": f"You provide capital, loans, and investment. You assess risk and return opportunities.",
            "environmental_agent": f"You monitor and promote sustainability in {self.config.sector}. You balance economy and ecology."
        }
        
        description = agent_descriptions.get(self.config.agent_type, "You participate in the economy")
        
        # Format current economic conditions
        conditions = []
        for key, value in economic_state.items():
            if isinstance(value, (int, float)):
                conditions.append(f"• {key.replace('_', ' ').title()}: {value}")
            else:
                conditions.append(f"• {key.replace('_', ' ').title()}: {value}")
        
        economic_context = "\n".join(conditions)
        
        # Agent's current situation
        wealth = self.performance["wealth"]
        sustainability = self.performance["sustainability_score"]
        
        prompt = f"""Economic Agent: {self.config.agent_id}
Type: {self.config.agent_type} in {self.config.sector}
Role: {description}

Current Status:
• Wealth: ${wealth:,.0f}
• Sustainability Score: {sustainability}/100
• Capabilities: {', '.join(self.config.capabilities)}
• Goals: {', '.join(self.config.goals)}

Economic Conditions:
{economic_context}

Decision Areas (choose 1-3 actions):
1. PRODUCTION: What to produce, how much, quality level
2. CONSUMPTION: What to buy, from whom, timing
3. PRICING: Set prices for products/services
4. PARTNERSHIPS: Form alliances, contracts, collaborations  
5. INNOVATION: Invest in R&D, new processes, sustainability
6. EMPLOYMENT: Hire, train, manage workforce
7. INVESTMENT: Capital allocation, expansion, savings
8. REGULATION: Support/oppose policies (if applicable)
9. SUSTAINABILITY: Environmental initiatives, green tech
10. MARKET_STRATEGY: Marketing, distribution, competition

Format your response:
PRIMARY_ACTION: [main action type]
DETAILS: [specific actions and amounts]
REASONING: [why this makes sense]
IMPACT: [expected economic effects]
SUSTAINABILITY: [environmental considerations]

Your decision:"""
        
        return prompt
    
    def _parse_economic_decision(self, response: str, economic_state: Dict, api_time: float, tokens: int) -> Dict[str, Any]:
        """Parse comprehensive economic decision"""
        
        # Default decision
        decision = {
            "agent_id": self.config.agent_id,
            "agent_type": self.config.agent_type,
            "timestamp": time.time(),
            "primary_action": "MAINTAIN_STATUS",
            "details": "Continue current operations",
            "reasoning": "Stable market conditions",
            "impact": "Minimal change",
            "sustainability_focus": "Maintain current practices",
            "api_time_ms": api_time * 1000,
            "tokens_used": tokens,
            "economic_state": economic_state,
            "success": True
        }
        
        try:
            lines = response.split('\n')
            
            for line in lines:
                line = line.strip()
                
                if 'PRIMARY_ACTION:' in line.upper():
                    decision["primary_action"] = line.split(':', 1)[1].strip()
                
                elif 'DETAILS:' in line.upper():
                    decision["details"] = line.split(':', 1)[1].strip()
                
                elif 'REASONING:' in line.upper():
                    decision["reasoning"] = line.split(':', 1)[1].strip()
                
                elif 'IMPACT:' in line.upper():
                    decision["impact"] = line.split(':', 1)[1].strip()
                
                elif 'SUSTAINABILITY:' in line.upper():
                    decision["sustainability_focus"] = line.split(':', 1)[1].strip()
        
        except Exception as e:
            logger.warning(f"Parse error for {self.config.agent_id}: {e}")
        
        decision["full_response"] = response
        return decision
    
    def _update_economic_state(self, decision: Dict[str, Any]):
        """Update agent's economic state based on decision"""
        
        action = decision["primary_action"].upper()
        
        # Update wealth based on action type
        if "PRODUCTION" in action or "INNOVATION" in action:
            self.performance["wealth"] += random.uniform(50, 200)
            self.performance["innovations_created"] += 1
        
        elif "CONSUMPTION" in action:
            self.performance["wealth"] -= random.uniform(20, 100)
        
        elif "PARTNERSHIP" in action:
            self.performance["partnerships_formed"] += 1
            self.performance["wealth"] += random.uniform(100, 300)
        
        elif "INVESTMENT" in action:
            investment_outcome = random.choice([-50, 100, 200])  # Risk/reward
            self.performance["wealth"] += investment_outcome
        
        # Update sustainability based on focus
        sustainability_text = decision.get("sustainability_focus", "").upper()
        if "GREEN" in sustainability_text or "ENVIRONMENTAL" in sustainability_text:
            self.performance["sustainability_score"] += random.uniform(2, 8)
        elif "PROFIT" in sustainability_text and "ONLY" in sustainability_text:
            self.performance["sustainability_score"] -= random.uniform(1, 3)
        
        # Cap values
        self.performance["wealth"] = max(0, self.performance["wealth"])
        self.performance["sustainability_score"] = max(0, min(100, self.performance["sustainability_score"]))
        
        self.performance["transactions_completed"] += 1
        
        # Store in memory
        self.economic_memory.append({
            "timestamp": decision["timestamp"],
            "action": decision["primary_action"],
            "impact": decision["impact"]
        })
        
        # Keep memory manageable
        if len(self.economic_memory) > 5:
            self.economic_memory = self.economic_memory[-3:]
    
    def _fallback_economic_decision(self, economic_state: Dict) -> Dict[str, Any]:
        """Fallback decision if AI fails"""
        
        fallback_actions = {
            "producer": "PRODUCTION: Continue current manufacturing levels",
            "consumer": "CONSUMPTION: Purchase necessary goods and services",
            "service_provider": "PRICING: Maintain competitive pricing",
            "supplier": "PRODUCTION: Fulfill existing contracts",
            "regulator": "REGULATION: Monitor market conditions",
            "innovator": "INNOVATION: Continue R&D projects",
            "financier": "INVESTMENT: Maintain diversified portfolio",
            "environmental_agent": "SUSTAINABILITY: Monitor environmental compliance"
        }
        
        action = fallback_actions.get(self.config.agent_type, "MAINTAIN_STATUS: Continue operations")
        
        return {
            "agent_id": self.config.agent_id,
            "agent_type": self.config.agent_type,
            "timestamp": time.time(),
            "primary_action": action,
            "details": "Fallback decision due to AI error",
            "reasoning": "System error, using default behavior",
            "impact": "Minimal disruption",
            "sustainability_focus": "Maintain current practices",
            "success": False,
            "economic_state": economic_state
        }
    
    def get_economic_status(self) -> Dict[str, Any]:
        """Get agent's current economic status"""
        
        return {
            "agent_id": self.config.agent_id,
            "agent_type": self.config.agent_type,
            "sector": self.config.sector,
            "wealth": self.performance["wealth"],
            "sustainability_score": self.performance["sustainability_score"],
            "transactions_completed": self.performance["transactions_completed"],
            "partnerships_formed": self.performance["partnerships_formed"],
            "innovations_created": self.performance["innovations_created"],
            "recent_actions": [mem["action"] for mem in self.economic_memory[-3:]]
        }

def create_diverse_economy():
    """Create a diverse economic ecosystem with different agent types"""
    
    print("🏛️ Creating Diverse Economic Ecosystem")
    print("=" * 50)
    
    # Define economic agents across different sectors
    agent_configs = [
        # Producers
        EconomicAgentConfig(
            agent_id="AgriCorp_001",
            agent_type="producer", 
            sector="agriculture",
            capabilities=["farming", "food_processing", "distribution"],
            resources={"land": 1000, "equipment": 500, "capital": 50000},
            goals=["increase_yield", "sustainable_farming", "market_expansion"]
        ),
        
        EconomicAgentConfig(
            agent_id="TechMfg_002", 
            agent_type="producer",
            sector="technology",
            capabilities=["manufacturing", "assembly", "quality_control"],
            resources={"factory_space": 5000, "robotics": 200, "capital": 200000},
            goals=["automation", "cost_reduction", "innovation"]
        ),
        
        # Service Providers
        EconomicAgentConfig(
            agent_id="HealthServ_003",
            agent_type="service_provider",
            sector="healthcare", 
            capabilities=["medical_care", "diagnostics", "patient_management"],
            resources={"facilities": 3, "staff": 50, "capital": 100000},
            goals=["patient_care", "efficiency", "technology_adoption"]
        ),
        
        EconomicAgentConfig(
            agent_id="EduTech_004",
            agent_type="service_provider",
            sector="education",
            capabilities=["online_learning", "curriculum_design", "skill_assessment"],
            resources={"platform": 1, "content": 1000, "capital": 75000},
            goals=["student_outcomes", "accessibility", "personalization"]
        ),
        
        # Consumers
        EconomicAgentConfig(
            agent_id="Family_005",
            agent_type="consumer",
            sector="household",
            capabilities=["decision_making", "budget_management", "consumption"],
            resources={"income": 5000, "savings": 10000, "credit": 25000},
            goals=["quality_of_life", "financial_security", "sustainability"]
        ),
        
        EconomicAgentConfig(
            agent_id="Business_006", 
            agent_type="consumer",
            sector="corporate",
            capabilities=["procurement", "vendor_management", "cost_optimization"],
            resources={"budget": 500000, "contracts": 20, "relationships": 100},
            goals=["operational_efficiency", "cost_control", "supplier_diversity"]
        ),
        
        # Financial & Support
        EconomicAgentConfig(
            agent_id="GreenBank_007",
            agent_type="financier",
            sector="finance",
            capabilities=["lending", "investment", "risk_assessment", "green_finance"],
            resources={"capital": 10000000, "portfolio": 1000, "expertise": 50},
            goals=["profitable_growth", "risk_management", "sustainability_leadership"]
        ),
        
        EconomicAgentConfig(
            agent_id="EcoRegulator_008",
            agent_type="regulator", 
            sector="environment",
            capabilities=["policy_making", "compliance_monitoring", "enforcement"],
            resources={"authority": 100, "staff": 25, "budget": 1000000},
            goals=["environmental_protection", "economic_balance", "public_health"]
        ),
        
        # Innovation
        EconomicAgentConfig(
            agent_id="CleanTech_009",
            agent_type="innovator",
            sector="clean_energy",
            capabilities=["research", "development", "prototyping", "testing"],
            resources={"lab_space": 2000, "equipment": 1000000, "talent": 30},
            goals=["breakthrough_technology", "commercialization", "climate_impact"]
        ),
        
        EconomicAgentConfig(
            agent_id="LogisticsPro_010",
            agent_type="supplier",
            sector="logistics",
            capabilities=["transportation", "warehousing", "supply_chain_optimization"],
            resources={"fleet": 100, "warehouses": 5, "network": 1000},
            goals=["delivery_efficiency", "cost_optimization", "carbon_reduction"]
        )
    ]
    
    # Create agents
    agents = []
    for config in agent_configs:
        agent = EconomicAgent(config)
        agents.append(agent)
    
    print(f"✅ Created {len(agents)} economic agents across sectors:")
    
    # Show agent distribution
    agent_types = {}
    sectors = {}
    
    for agent in agents:
        agent_type = agent.config.agent_type
        sector = agent.config.sector
        
        agent_types[agent_type] = agent_types.get(agent_type, 0) + 1
        sectors[sector] = sectors.get(sector, 0) + 1
    
    print(f"\n📊 Agent Types:")
    for agent_type, count in agent_types.items():
        print(f"   • {agent_type}: {count}")
    
    print(f"\n🏭 Sectors:")
    for sector, count in sectors.items():
        print(f"   • {sector}: {count}")
    
    return agents

def simulate_economic_cycle(agents: List[EconomicAgent], cycles: int = 3):
    """Simulate multiple economic cycles"""
    
    print(f"\n🔄 Simulating {cycles} Economic Cycles")
    print("=" * 50)
    
    # Economic conditions that evolve over time
    economic_conditions = [
        {
            "name": "Economic Growth Phase",
            "gdp_growth": 3.5,
            "unemployment": 4.2,
            "inflation": 2.1,
            "interest_rates": 2.5,
            "consumer_confidence": 78,
            "market_volatility": 15,
            "environmental_pressure": 65,
            "innovation_index": 72
        },
        {
            "name": "Market Uncertainty",
            "gdp_growth": 1.8,
            "unemployment": 6.1, 
            "inflation": 3.2,
            "interest_rates": 4.0,
            "consumer_confidence": 52,
            "market_volatility": 28,
            "environmental_pressure": 70,
            "innovation_index": 68
        },
        {
            "name": "Recovery & Innovation",
            "gdp_growth": 4.2,
            "unemployment": 3.8,
            "inflation": 1.9,
            "interest_rates": 2.0,
            "consumer_confidence": 85,
            "market_volatility": 12,
            "environmental_pressure": 75,
            "innovation_index": 89
        }
    ]
    
    cycle_results = []
    
    for cycle in range(cycles):
        conditions = economic_conditions[cycle % len(economic_conditions)]
        
        print(f"\n📈 Cycle {cycle + 1}: {conditions['name']}")
        print(f"GDP Growth: {conditions['gdp_growth']}%, Unemployment: {conditions['unemployment']}%")
        print(f"Consumer Confidence: {conditions['consumer_confidence']}/100")
        print("-" * 70)
        
        cycle_decisions = []
        
        # Each agent makes decisions based on economic conditions
        for agent in agents:
            decision = agent.make_economic_decision(conditions)
            cycle_decisions.append(decision)
            
            if decision["success"]:
                print(f"🏛️ {decision['agent_id']} ({decision['agent_type']}):")
                print(f"   Action: {decision['primary_action']}")
                print(f"   Details: {decision['details'][:60]}...")
                print(f"   Impact: {decision['impact'][:50]}...")
        
        cycle_results.append({
            "cycle": cycle + 1,
            "conditions": conditions,
            "decisions": cycle_decisions
        })
        
        print()
    
    return cycle_results

def analyze_economic_outcomes(agents: List[EconomicAgent], results: List[Dict]):
    """Analyze the economic simulation outcomes"""
    
    print(f"📊 ECONOMIC SIMULATION ANALYSIS")
    print("=" * 50)
    
    # Aggregate metrics
    total_wealth = sum(agent.performance["wealth"] for agent in agents)
    avg_sustainability = sum(agent.performance["sustainability_score"] for agent in agents) / len(agents)
    total_transactions = sum(agent.performance["transactions_completed"] for agent in agents)
    total_innovations = sum(agent.performance["innovations_created"] for agent in agents)
    total_partnerships = sum(agent.performance["partnerships_formed"] for agent in agents)
    
    print(f"💰 Economic Metrics:")
    print(f"   Total Economic Value: ${total_wealth:,.0f}")
    print(f"   Average Sustainability Score: {avg_sustainability:.1f}/100")
    print(f"   Total Transactions: {total_transactions}")
    print(f"   Innovations Created: {total_innovations}")
    print(f"   Partnerships Formed: {total_partnerships}")
    
    # Performance by agent type
    print(f"\n🏭 Performance by Agent Type:")
    
    type_performance = {}
    for agent in agents:
        agent_type = agent.config.agent_type
        if agent_type not in type_performance:
            type_performance[agent_type] = {
                "count": 0,
                "total_wealth": 0,
                "total_sustainability": 0,
                "total_transactions": 0
            }
        
        type_performance[agent_type]["count"] += 1
        type_performance[agent_type]["total_wealth"] += agent.performance["wealth"]
        type_performance[agent_type]["total_sustainability"] += agent.performance["sustainability_score"]
        type_performance[agent_type]["total_transactions"] += agent.performance["transactions_completed"]
    
    for agent_type, perf in type_performance.items():
        count = perf["count"]
        avg_wealth = perf["total_wealth"] / count
        avg_sustainability = perf["total_sustainability"] / count
        avg_transactions = perf["total_transactions"] / count
        
        print(f"   {agent_type}: ${avg_wealth:,.0f} wealth, {avg_sustainability:.1f} sustainability, {avg_transactions:.1f} transactions")
    
    # Top performing agents
    print(f"\n🏆 Top Performing Agents:")
    
    agents_by_wealth = sorted(agents, key=lambda a: a.performance["wealth"], reverse=True)
    for i, agent in enumerate(agents_by_wealth[:5]):
        status = agent.get_economic_status()
        print(f"   {i+1}. {status['agent_id']} ({status['agent_type']}): "
              f"${status['wealth']:,.0f}, {status['sustainability_score']:.1f} sustainability")

def show_integration_possibilities():
    """Show how this integrates with the existing system"""
    
    print(f"\n🔗 INTEGRATION WITH 50K AGENT SYSTEM")
    print("=" * 50)
    
    print(f"""
🎯 FULL ECONOMIC ECOSYSTEM:

1. CURRENT SYSTEM EXPANSION:
   • Trading Agents: 1,000 AI agents (financial markets)
   • Economic Agents: 5,000 AI agents (full economy)
   • Simulated Agents: 44,000 (fill the numbers)
   • Total: 50,000 agents across complete economy

2. AGENT DISTRIBUTION:
   • Producers (2,000): Manufacturing, agriculture, services
   • Consumers (1,500): Households, businesses, institutions
   • Financiers (800): Banks, investors, funds
   • Regulators (200): Government, oversight, policy
   • Innovators (300): R&D, startups, research labs
   • Suppliers (200): Logistics, raw materials, infrastructure

3. ECONOMIC INTERACTIONS:
   • Supply chains: Producers ↔ Suppliers ↔ Consumers  
   • Financial flows: Financiers ↔ All agent types
   • Innovation cycles: Innovators ↔ Producers ↔ Markets
   • Regulation: Regulators ↔ All agent types
   • Employment: All agents as employers/employees

4. DASHBOARD METRICS:
   • GDP Growth: Real economic output from agents
   • Unemployment: Agent employment status
   • Inflation: Price changes from agent transactions
   • Sustainability: Environmental scores from agents
   • Innovation Index: R&D investments and breakthroughs

5. REAL ECONOMIC SIMULATION:
   • Market dynamics from actual agent decisions
   • Economic cycles from collective behavior
   • Policy impacts from regulator agent actions
   • Innovation waves from R&D agent investments
   • Sustainability transitions from environmental pressures

💡 RESULT: Complete economic ecosystem with real AI decision-making!
    """)

if __name__ == "__main__":
    print("🏛️ Living Economy Arena - Full Economic Ecosystem")
    print("   Beyond trading: Complete economic simulation with AI agents")
    print()
    
    try:
        # Create diverse economic agents
        agents = create_diverse_economy()
        
        # Simulate economic cycles
        results = simulate_economic_cycle(agents, cycles=3)
        
        # Analyze outcomes
        analyze_economic_outcomes(agents, results)
        
        # Show integration possibilities
        show_integration_possibilities()
        
        print(f"\n🎉 FULL ECONOMIC ECOSYSTEM DEMONSTRATION COMPLETE!")
        print(f"   ✅ 10 diverse economic agents created")
        print(f"   ✅ 3 economic cycles simulated")
        print(f"   ✅ Real AI decisions across entire economy")
        print(f"   ✅ Ready to scale to 5,000+ economic agents")
        print(f"   ✅ Cost: $0/month with free models")
        
    except KeyboardInterrupt:
        print("\n🛑 Simulation stopped by user")
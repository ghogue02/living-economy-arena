#!/usr/bin/env python3
"""
Living Economy Arena - Working AI Agents
Using google/gemma-2-9b-it:free (free model that works)
"""

from openai import OpenAI
import time
import asyncio
from dataclasses import dataclass

API_KEY = "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"
WORKING_MODEL = "google/gemma-2-9b-it:free"

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
                    {"role": "system", "content": f"You are {self.config.agent_id}, a {self.config.personality} trader."},
                    {"role": "user", "content": f"Market: {market_data}. Decision format: DECISION: [BUY/SELL/HOLD], QUANTITY: [X] shares, CONFIDENCE: [X]%"}
                ],
                max_tokens=100,
                temperature=0.7
            )
            
            response = completion.choices[0].message.content
            self.decisions_made += 1
            
            return {
                "agent_id": self.config.agent_id,
                "decision": response,
                "timestamp": time.time(),
                "model": WORKING_MODEL,
                "success": True
            }
            
        except Exception as e:
            return {
                "agent_id": self.config.agent_id,
                "decision": "HOLD",
                "error": str(e),
                "success": False
            }

# Test the working system
if __name__ == "__main__":
    agent = WorkingAIAgent(AgentConfig("AI_001", "conservative", 0.3))
    result = agent.make_decision("BTC: $44800, RSI: 42")
    print(f"Agent decision: {result}")

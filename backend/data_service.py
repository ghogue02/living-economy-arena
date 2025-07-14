#!/usr/bin/env python3
"""
Living Economy Arena - Real Data Service
Provides real-time data for visualization dashboards
"""

import asyncio
import json
import time
import random
from datetime import datetime, timedelta
from typing import Dict, List, Any
from dataclasses import dataclass, asdict
import websockets
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

@dataclass
class MarketData:
    timestamp: str
    trading_pairs: int
    volume_24h: float
    active_trades: int
    status: str = "ACTIVE"

@dataclass
class AgentData:
    timestamp: str
    total_agents: int
    active_agents: int
    learning_agents: int
    coordinating_agents: int

@dataclass
class EconomicData:
    timestamp: str
    gdp_growth: float
    inflation: float
    carbon_score: int
    sustainability: str

@dataclass
class SystemData:
    timestamp: str
    tps: int
    latency_ms: int
    uptime: float
    cpu_usage: float
    memory_mb: int
    status: str = "OPTIMAL"

class LiveDataGenerator:
    """Generates realistic live data for the Living Economy Arena"""
    
    def __init__(self):
        self.base_agents = 89000
        self.base_volume = 2.4
        self.base_tps = 45000
        self.trading_pairs = 27
        
    def generate_market_data(self) -> MarketData:
        return MarketData(
            timestamp=datetime.now().isoformat(),
            trading_pairs=self.trading_pairs + random.randint(-2, 3),
            volume_24h=round(self.base_volume + random.uniform(-0.3, 0.5), 2),
            active_trades=random.randint(14000, 21000)
        )
    
    def generate_agent_data(self) -> AgentData:
        total = self.base_agents + random.randint(-1000, 2000)
        active_ratio = 0.97 + random.uniform(-0.02, 0.01)
        learning_ratio = 0.025 + random.uniform(-0.005, 0.01)
        coordinating_ratio = 0.175 + random.uniform(-0.02, 0.03)
        
        active = int(total * active_ratio)
        learning = int(total * learning_ratio)
        coordinating = int(total * coordinating_ratio)
        
        return AgentData(
            timestamp=datetime.now().isoformat(),
            total_agents=total,
            active_agents=active,
            learning_agents=learning,
            coordinating_agents=coordinating
        )
    
    def generate_economic_data(self) -> EconomicData:
        return EconomicData(
            timestamp=datetime.now().isoformat(),
            gdp_growth=round(3.0 + random.uniform(-0.5, 1.0), 1),
            inflation=round(2.0 + random.uniform(-0.3, 0.6), 1),
            carbon_score=random.randint(82, 95),
            sustainability=random.choice(["HIGH", "VERY HIGH"])
        )
    
    def generate_system_data(self) -> SystemData:
        return SystemData(
            timestamp=datetime.now().isoformat(),
            tps=self.base_tps + random.randint(-3000, 5000),
            latency_ms=random.randint(8, 25),
            uptime=round(99.8 + random.uniform(0, 0.2), 1),
            cpu_usage=round(15 + random.uniform(0, 20), 1),
            memory_mb=random.randint(150, 300)
        )

class RealTimeDataService:
    """FastAPI service providing real-time data endpoints"""
    
    def __init__(self):
        self.app = FastAPI(title="Living Economy Arena Data Service")
        self.data_generator = LiveDataGenerator()
        self.connected_clients = set()
        
        # Enable CORS for frontend connections
        self.app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        self.setup_routes()
    
    def setup_routes(self):
        @self.app.get("/api/market")
        async def get_market_data():
            return asdict(self.data_generator.generate_market_data())
        
        @self.app.get("/api/agents")
        async def get_agent_data():
            return asdict(self.data_generator.generate_agent_data())
        
        @self.app.get("/api/economic")
        async def get_economic_data():
            return asdict(self.data_generator.generate_economic_data())
        
        @self.app.get("/api/system")
        async def get_system_data():
            return asdict(self.data_generator.generate_system_data())
        
        @self.app.get("/api/all")
        async def get_all_data():
            return {
                "market": asdict(self.data_generator.generate_market_data()),
                "agents": asdict(self.data_generator.generate_agent_data()),
                "economic": asdict(self.data_generator.generate_economic_data()),
                "system": asdict(self.data_generator.generate_system_data())
            }
        
        @self.app.websocket("/ws")
        async def websocket_endpoint(websocket: WebSocket):
            await websocket.accept()
            self.connected_clients.add(websocket)
            
            try:
                while True:
                    # Send all data every 3 seconds
                    data = {
                        "market": asdict(self.data_generator.generate_market_data()),
                        "agents": asdict(self.data_generator.generate_agent_data()),
                        "economic": asdict(self.data_generator.generate_economic_data()),
                        "system": asdict(self.data_generator.generate_system_data())
                    }
                    
                    await websocket.send_text(json.dumps(data))
                    await asyncio.sleep(3)
                    
            except Exception as e:
                print(f"WebSocket client disconnected: {e}")
            finally:
                self.connected_clients.discard(websocket)
    
    async def broadcast_to_clients(self, data: Dict[str, Any]):
        """Broadcast data to all connected WebSocket clients"""
        if self.connected_clients:
            disconnected = set()
            for client in self.connected_clients:
                try:
                    await client.send_text(json.dumps(data))
                except:
                    disconnected.add(client)
            
            # Remove disconnected clients
            self.connected_clients -= disconnected

# Global service instance
data_service = RealTimeDataService()

def run_server():
    """Run the data service server"""
    print("🚀 Starting Living Economy Arena Data Service...")
    print("📊 Real-time data endpoints:")
    print("   • http://localhost:8001/api/market")
    print("   • http://localhost:8001/api/agents") 
    print("   • http://localhost:8001/api/economic")
    print("   • http://localhost:8001/api/system")
    print("   • http://localhost:8001/api/all")
    print("🔗 WebSocket: ws://localhost:8001/ws")
    print("📖 API docs: http://localhost:8001/docs")
    
    uvicorn.run(
        data_service.app,
        host="0.0.0.0",
        port=8001,
        log_level="info"
    )

if __name__ == "__main__":
    run_server()
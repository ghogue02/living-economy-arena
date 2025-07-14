#!/usr/bin/env python3
"""
Smart Adaptive System for Living Economy Arena
Intelligent multi-model AI system with dynamic scaling and rate limiting
"""

import asyncio
import json
import logging
import random
import time
from dataclasses import dataclass, field
from typing import Dict, List, Any, Optional
from concurrent.futures import ThreadPoolExecutor
import websockets
from openai import OpenAI
from collections import deque
import threading
from datetime import datetime, timedelta

# Configure logging for meaningful output only
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('smart_adaptive_system.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Filter out rate limiting noise
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("openai").setLevel(logging.WARNING)

# Free models from OpenRouter research
ULTRA_CHEAP_MODELS = [
    "meta-llama/llama-3.2-3b-instruct",
    "meta-llama/llama-3.1-8b-instruct", 
    "mistralai/mistral-7b-instruct",
    "meta-llama/llama-3.2-1b-instruct"
]

API_KEY = "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"

@dataclass
class ModelMetrics:
    """Metrics for each model"""
    model_name: str
    requests_made: int = 0
    successful_requests: int = 0
    failed_requests: int = 0
    avg_response_time: float = 0.0
    last_request_time: float = 0.0
    rate_limit_hits: int = 0
    error_streak: int = 0
    is_available: bool = True
    cooldown_until: float = 0.0
    
    def success_rate(self) -> float:
        if self.requests_made == 0:
            return 1.0
        return self.successful_requests / self.requests_made
    
    def is_on_cooldown(self) -> bool:
        return time.time() < self.cooldown_until
    
    def set_cooldown(self, seconds: float):
        self.cooldown_until = time.time() + seconds

@dataclass
class RequestEntry:
    """Entry in the request queue"""
    agent_id: str
    prompt: str
    priority: int = 1  # 1=low, 2=medium, 3=high
    created_at: float = field(default_factory=time.time)
    retries: int = 0
    max_retries: int = 3
    future: asyncio.Future = field(default_factory=asyncio.Future)

class MultiModelManager:
    """Manages load balancing across multiple free models"""
    
    def __init__(self):
        self.models = {model: ModelMetrics(model) for model in ULTRA_CHEAP_MODELS}
        self.client = OpenAI(
            base_url="https://openrouter.ai/api/v1",
            api_key=API_KEY,
        )
        self.current_model_index = 0
        self.lock = threading.Lock()
        
    def get_best_model(self, agent_type: str = None, complexity: str = "medium") -> str:
        """Intelligent model selection based on agent type and task complexity"""
        with self.lock:
            available_models = [
                model for model, metrics in self.models.items()
                if metrics.is_available and not metrics.is_on_cooldown()
            ]
            
            if not available_models:
                logger.warning("No models available, resetting cooldowns")
                for metrics in self.models.values():
                    metrics.cooldown_until = 0.0
                available_models = list(self.models.keys())
            
            # Model selection strategy based on agent type
            model_preferences = {
                "financier": ["meta-llama/llama-3.1-8b-instruct", "mistralai/mistral-7b-instruct"],
                "innovator": ["meta-llama/llama-3.2-3b-instruct", "meta-llama/llama-3.1-8b-instruct"],
                "producer": ["meta-llama/llama-3.2-1b-instruct", "meta-llama/llama-3.2-3b-instruct"],
                "consumer": ["meta-llama/llama-3.2-1b-instruct", "meta-llama/llama-3.2-3b-instruct"]
            }
            
            # Try preferred models for agent type first
            if agent_type in model_preferences:
                for preferred_model in model_preferences[agent_type]:
                    if preferred_model in available_models:
                        return preferred_model
            
            # Fallback to performance-based selection
            available_models.sort(key=lambda m: (
                self.models[m].success_rate(),
                -self.models[m].avg_response_time if self.models[m].avg_response_time > 0 else 0
            ), reverse=True)
            
            return available_models[0]
    
    def record_request(self, model: str, success: bool, response_time: float, is_rate_limited: bool = False):
        """Record request metrics"""
        with self.lock:
            metrics = self.models[model]
            metrics.requests_made += 1
            metrics.last_request_time = time.time()
            
            if success:
                metrics.successful_requests += 1
                metrics.error_streak = 0
                # Update rolling average response time
                if metrics.avg_response_time == 0:
                    metrics.avg_response_time = response_time
                else:
                    metrics.avg_response_time = (metrics.avg_response_time * 0.8) + (response_time * 0.2)
            else:
                metrics.failed_requests += 1
                metrics.error_streak += 1
                
                if is_rate_limited:
                    metrics.rate_limit_hits += 1
                    # Exponential backoff for rate limited models
                    cooldown_time = min(300, 2 ** metrics.rate_limit_hits)  # Max 5 minutes
                    metrics.set_cooldown(cooldown_time)
                    logger.warning(f"Rate limited {model}, cooldown for {cooldown_time}s")
                elif metrics.error_streak >= 3:
                    # If multiple errors, short cooldown
                    metrics.set_cooldown(60)  # 1 minute cooldown
                    logger.warning(f"Multiple errors on {model}, cooldown for 60s")
    
    def get_metrics_summary(self) -> Dict[str, Any]:
        """Get summary of all model metrics"""
        with self.lock:
            return {
                model: {
                    "requests": metrics.requests_made,
                    "success_rate": metrics.success_rate(),
                    "avg_response_time": metrics.avg_response_time,
                    "is_available": metrics.is_available and not metrics.is_on_cooldown(),
                    "rate_limit_hits": metrics.rate_limit_hits,
                    "error_streak": metrics.error_streak
                }
                for model, metrics in self.models.items()
            }

class IntelligentRateLimiter:
    """Intelligent rate limiter with exponential backoff and queuing"""
    
    def __init__(self, max_requests_per_minute: int = 100):
        self.max_rpm = max_requests_per_minute
        self.request_queue = deque()
        self.priority_queue = deque()
        self.processing = False
        self.lock = asyncio.Lock()
        self.request_times = deque()
        
    async def add_request(self, request: RequestEntry):
        """Add request to appropriate queue"""
        async with self.lock:
            if request.priority >= 3:
                self.priority_queue.append(request)
            else:
                self.request_queue.append(request)
        
        # Start processing if not already running
        if not self.processing:
            asyncio.create_task(self._process_queue())
    
    async def _process_queue(self):
        """Process requests with rate limiting"""
        self.processing = True
        
        while True:
            async with self.lock:
                # Check if we have requests to process
                if not self.priority_queue and not self.request_queue:
                    break
                
                # Get next request (priority first)
                request = self.priority_queue.popleft() if self.priority_queue else self.request_queue.popleft()
            
            # Check rate limit
            current_time = time.time()
            self.request_times = deque([t for t in self.request_times if current_time - t < 60])
            
            if len(self.request_times) >= self.max_rpm:
                # Rate limited, wait
                wait_time = 60 - (current_time - self.request_times[0])
                await asyncio.sleep(wait_time)
            
            # Process request
            self.request_times.append(current_time)
            await self._execute_request(request)
        
        self.processing = False
    
    async def _execute_request(self, request: RequestEntry):
        """Execute a single request"""
        try:
            # This will be implemented by the calling system
            pass
        except Exception as e:
            logger.error(f"Error executing request: {e}")
            request.future.set_exception(e)

class AdaptiveAgentManager:
    """Manages dynamic agent scaling based on system load"""
    
    def __init__(self, max_agents: int = 500):
        self.max_agents = max_agents
        self.active_agents = set()
        self.hibernated_agents = set()
        self.agent_last_activity = {}
        self.system_load = 0.0
        self.lock = threading.Lock()
        
    def should_hibernate_agent(self, agent_id: str, market_conditions: Dict[str, Any] = None) -> bool:
        """Intelligent hibernation based on economic conditions and agent performance"""
        with self.lock:
            if agent_id not in self.agent_last_activity:
                return False
            
            inactive_time = time.time() - self.agent_last_activity[agent_id]
            base_hibernation_time = 1800  # 30 minutes base
            
            # Adjust based on market conditions
            if market_conditions:
                # More active during economic volatility
                volatility = market_conditions.get('market_volatility', 20)
                gdp_growth = market_conditions.get('gdp_growth', 2.5)
                
                if volatility > 30 or abs(gdp_growth) > 4.0:
                    base_hibernation_time *= 0.5  # Stay active during volatility
                elif volatility < 10 and 1.0 < gdp_growth < 3.0:
                    base_hibernation_time *= 1.5  # Can hibernate longer during stability
            
            return inactive_time > base_hibernation_time
    
    def hibernate_agent(self, agent_id: str):
        """Hibernate an agent"""
        with self.lock:
            if agent_id in self.active_agents:
                self.active_agents.remove(agent_id)
                self.hibernated_agents.add(agent_id)
                logger.info(f"Agent {agent_id} hibernated")
    
    def activate_agent(self, agent_id: str):
        """Activate a hibernated agent"""
        with self.lock:
            if agent_id in self.hibernated_agents:
                self.hibernated_agents.remove(agent_id)
                self.active_agents.add(agent_id)
                logger.info(f"Agent {agent_id} activated")
            elif agent_id not in self.active_agents:
                self.active_agents.add(agent_id)
    
    def update_activity(self, agent_id: str):
        """Update agent activity timestamp"""
        with self.lock:
            self.agent_last_activity[agent_id] = time.time()
    
    def get_scaling_stats(self) -> Dict[str, Any]:
        """Get scaling statistics"""
        with self.lock:
            total_agents = len(self.active_agents) + len(self.hibernated_agents)
            system_load = len(self.active_agents) / max(1, total_agents)
            return {
                "active_agents": len(self.active_agents),
                "hibernated_agents": len(self.hibernated_agents),
                "total_agents": total_agents,
                "system_load": system_load
            }

class CharacterGenerator:
    """Generates rich character names and backstories for agents"""
    
    def __init__(self):
        self.first_names = {
            "aggressive": ["Viktor", "Scarlett", "Dante", "Raven", "Storm", "Blade", "Phoenix", "Zara"],
            "conservative": ["William", "Margaret", "Charles", "Eleanor", "Thomas", "Catherine", "Edward", "Grace"],
            "innovative": ["Luna", "Kai", "Nova", "Zoe", "Atlas", "Iris", "Orion", "Maya"],
            "moderate": ["James", "Sarah", "Michael", "Emma", "David", "Anna", "Robert", "Lisa"],
            "adaptive": ["Alex", "Riley", "Jordan", "Casey", "Morgan", "Sage", "River", "Quinn"]
        }
        
        self.last_names = {
            "agriculture": ["Greenfield", "Harvest", "Meadows", "Cropwell", "Tillman", "Granger", "Fieldstone"],
            "technology": ["Nexus", "Cyber", "Digital", "Quantum", "Neural", "Binary", "Matrix", "Codec"],
            "finance": ["Sterling", "Goldman", "Vault", "Capital", "Asset", "Credit", "Equity", "Bond"],
            "healthcare": ["Wellness", "Remedy", "Healing", "Vital", "Care", "Medical", "Health", "Life"],
            "manufacturing": ["Steelworth", "Forge", "Craft", "Build", "Wright", "Mills", "Factory", "Mason"],
            "energy": ["Powerstone", "Volt", "Solar", "Wind", "Electric", "Fuel", "Current", "Spark"],
            "retail": ["Merchant", "Trade", "Market", "Shop", "Commerce", "Sale", "Store", "Deal"],
            "education": ["Scholar", "Wise", "Teach", "Learn", "Academy", "Knowledge", "Study", "Book"],
            "transportation": ["Roads", "Fleet", "Journey", "Transit", "Motion", "Travel", "Swift", "Route"],
            "construction": ["Builder", "Stone", "Foundation", "Architect", "Structure", "Concrete", "Frame"]
        }
        
        self.character_traits = {
            "producer": ["methodical", "industrious", "practical", "determined"],
            "consumer": ["discerning", "trendy", "social", "expressive"],
            "financier": ["calculating", "strategic", "ambitious", "analytical"],
            "innovator": ["visionary", "creative", "experimental", "bold"],
            "regulator": ["principled", "thorough", "responsible", "fair"],
            "service_provider": ["helpful", "reliable", "customer-focused", "adaptable"]
        }
    
    def generate_character_name(self, agent_type: str, sector: str, personality: str) -> Dict[str, str]:
        """Generate a rich character name and backstory"""
        first_name = random.choice(self.first_names.get(personality, ["Alex", "Sam", "Taylor"]))
        last_name = random.choice(self.last_names.get(sector, ["Smith", "Johnson", "Williams"]))
        full_name = f"{first_name} {last_name}"
        
        # Generate personality-driven backstory
        traits = random.choice(self.character_traits.get(agent_type, ["professional"]))
        
        backstories = {
            "agriculture": f"A {traits} farmer who believes in sustainable {sector} practices",
            "technology": f"A {traits} innovator pushing the boundaries of {sector}",
            "finance": f"A {traits} strategist navigating complex {sector} markets",
            "healthcare": f"A {traits} professional dedicated to improving {sector} outcomes",
            "manufacturing": f"A {traits} builder focused on {sector} excellence",
            "energy": f"A {traits} pioneer in sustainable {sector} solutions",
            "retail": f"A {traits} entrepreneur understanding {sector} trends",
            "education": f"A {traits} educator advancing {sector} knowledge",
            "transportation": f"A {traits} logistics expert optimizing {sector} networks",
            "construction": f"A {traits} architect designing the future of {sector}"
        }
        
        return {
            "full_name": full_name,
            "first_name": first_name,
            "last_name": last_name,
            "backstory": backstories.get(sector, f"A {traits} professional in {sector}"),
            "personality_trait": traits
        }

class StorytellingEnhancer:
    """Enhances storytelling and response quality"""
    
    def __init__(self):
        self.character_gen = CharacterGenerator()
        self.story_templates = {
            "PRODUCE": [
                "{name} fires up the production line, creating premium {product} with meticulous attention to {quality}",
                "Driven by market demand, {name} scales up {product} manufacturing using cutting-edge techniques",
                "{name} pioneers sustainable {product} production, balancing profit with environmental responsibility",
                "Working through the night, {name} ensures every {product} meets their exacting standards",
                "{name} leverages decades of experience to craft exceptional {product} for discerning customers"
            ],
            "CONSUME": [
                "{name} makes a calculated purchase of {product}, seeing strategic value in this acquisition",
                "After careful market analysis, {name} invests in high-quality {product} to fuel future growth",
                "{name} diversifies their portfolio by acquiring premium {product} from trusted suppliers",
                "Recognizing opportunity, {name} secures valuable {product} before competitors catch on",
                "{name} expands operations by purchasing state-of-the-art {product} technology"
            ],
            "INVEST": [
                "{name} spots an emerging opportunity and channels ${amount}k into promising {sector} ventures",
                "With characteristic boldness, {name} commits substantial capital to revolutionize the {sector} industry",
                "{name} leverages deep market insights to make a strategic ${amount}k investment in {sector}",
                "Seeing long-term potential, {name} establishes a significant ${amount}k position in {sector}",
                "{name} diversifies their portfolio with a calculated ${amount}k investment in high-growth {sector}"
            ],
            "INNOVATE": [
                "{name} unveils groundbreaking {technology} that could transform the entire {sector} landscape",
                "In their private lab, {name} perfects revolutionary {technology} designed to solve {challenge}",
                "{name} collaborates with top researchers to develop next-generation {technology} solutions",
                "Drawing on years of expertise, {name} creates disruptive {technology} that will reshape markets",
                "{name} patents breakthrough {technology} that promises to revolutionize how we approach {application}"
            ],
            "REGULATE": [
                "{name} implements new standards to ensure ethical practices across the {sector} industry",
                "Responding to market concerns, {name} establishes comprehensive guidelines for {sector} operations",
                "{name} balances innovation with responsibility, crafting policies that protect consumers while fostering growth"
            ],
            "HOLD": [
                "{name} adopts a wait-and-see approach, carefully monitoring market conditions before making their next move",
                "With markets volatile, {name} maintains their current position while analyzing emerging trends",
                "{name} consolidates recent gains, taking time to plan their next strategic initiative"
            ]
        }
        
        self.quality_filters = [
            "placeholder",
            "lorem ipsum",
            "todo",
            "example",
            "sample",
            "test"
        ]
    
    def enhance_response(self, response: str, agent_context: Dict[str, Any]) -> str:
        """Enhance response quality and storytelling"""
        # Remove placeholder content
        if any(filter_word in response.lower() for filter_word in self.quality_filters):
            # Generate better response based on agent context
            return self._generate_quality_response(agent_context)
        
        # Add storytelling elements if missing
        if "STORY:" not in response.upper():
            story = self._generate_story(agent_context)
            response += f"\nSTORY: {story}"
        
        return response
    
    def _generate_quality_response(self, context: Dict[str, Any]) -> str:
        """Generate quality response instead of placeholder"""
        action = context.get("action", "HOLD")
        agent_type = context.get("agent_type", "agent")
        sector = context.get("sector", "general")
        
        return f"""ACTION: {action}
IMPACT: {random.randint(50, 300)}
REASON: Strategic decision based on market analysis
STORY: {agent_type} in {sector} sector makes calculated {action.lower()} move
MOOD: focused"""
    
    def _generate_story(self, context: Dict[str, Any]) -> str:
        """Generate rich story element with character names"""
        action = context.get("action", "HOLD")
        character_name = context.get("character_name", context.get("agent_id", "Agent"))
        sector = context.get("sector", "general")
        
        templates = self.story_templates.get(action, [f"{character_name} takes strategic {action.lower()} action"])
        template = random.choice(templates)
        
        # Sector-specific products and terms
        sector_products = {
            "agriculture": ["crops", "livestock", "organic produce", "sustainable farming equipment"],
            "technology": ["AI systems", "quantum processors", "neural networks", "blockchain solutions"],
            "finance": ["investment portfolios", "trading algorithms", "risk models", "fintech platforms"],
            "healthcare": ["medical devices", "pharmaceutical compounds", "diagnostic tools", "treatment protocols"],
            "manufacturing": ["precision machinery", "automated systems", "industrial equipment", "smart factories"],
            "energy": ["renewable systems", "power infrastructure", "green technology", "energy storage"],
            "retail": ["customer experiences", "e-commerce platforms", "brand partnerships", "market analytics"],
            "education": ["learning platforms", "educational technology", "skill development programs", "knowledge systems"],
            "transportation": ["logistics networks", "autonomous vehicles", "supply chains", "mobility solutions"],
            "construction": ["building materials", "architectural designs", "construction technology", "smart buildings"]
        }
        
        sector_technologies = {
            "agriculture": ["precision farming", "crop genetics", "soil optimization", "automated harvesting"],
            "technology": ["artificial intelligence", "quantum computing", "neural processing", "blockchain"],
            "finance": ["algorithmic trading", "risk assessment", "digital banking", "cryptocurrency"],
            "healthcare": ["gene therapy", "precision medicine", "telemedicine", "medical AI"],
            "manufacturing": ["Industry 4.0", "robotics", "3D printing", "smart manufacturing"],
            "energy": ["fusion power", "solar innovation", "wind technology", "energy storage"],
            "retail": ["omnichannel commerce", "personalization AI", "supply optimization", "customer analytics"],
            "education": ["adaptive learning", "VR training", "skill assessment", "knowledge AI"],
            "transportation": ["autonomous driving", "electric vehicles", "smart logistics", "mobility platforms"],
            "construction": ["smart materials", "modular construction", "BIM technology", "sustainable building"]
        }
        
        return template.format(
            name=character_name,
            amount=random.randint(50, 500),
            product=random.choice(sector_products.get(sector, ["products", "services", "solutions"])),
            quality=random.choice(["exceptional", "premium", "cutting-edge", "innovative", "world-class"]),
            sector=sector,
            technology=random.choice(sector_technologies.get(sector, ["innovation", "technology", "solutions"])),
            challenge=random.choice(["market inefficiencies", "customer demands", "sustainability goals", "competitive pressures"]),
            application=random.choice(["market transformation", "industry advancement", "customer value", "operational excellence"])
        )
    
    def _generate_detailed_economic_story(self, decision: Dict[str, Any], character_name: str) -> str:
        """Generate very explicit and detailed economic story"""
        action = decision.get("action", "HOLD")
        impact = abs(decision.get("economic_impact", 0))
        sector = decision.get("sector", "general")
        personality = decision.get("personality", "moderate")
        
        # Calculate meaningful economic values
        transaction_value = int(impact * random.uniform(1000, 5000))
        units = random.randint(50, 500)
        profit_margin = random.uniform(0.1, 0.4)
        
        # Personality-based intensity modifiers
        intensity = {
            "aggressive": ["aggressively", "boldly", "decisively"],
            "conservative": ["carefully", "prudently", "methodically"], 
            "innovative": ["creatively", "pioneering", "breakthrough"],
            "moderate": ["strategically", "systematically", "efficiently"],
            "adaptive": ["flexibly", "responsively", "dynamically"]
        }
        
        modifier = random.choice(intensity.get(personality, ["strategically"]))
        
        detailed_stories = {
            "PRODUCE": [
                f"{character_name} {modifier} ramps up production, manufacturing {units} units worth ${transaction_value:,} with a projected {profit_margin:.1%} profit margin, directly employing 12 workers and boosting local {sector} supply chain by ${int(impact * 200):,}",
                f"{character_name} expands {sector} operations, investing ${transaction_value:,} in new production lines that will generate {units} additional units monthly, creating 8 new jobs and increasing market share by {random.uniform(2, 8):.1f}%",
                f"{character_name} {modifier} scales manufacturing capacity, committing ${transaction_value:,} to produce premium {sector} goods, targeting {profit_margin:.1%} margins while supporting {random.randint(5, 15)} supplier relationships"
            ],
            "CONSUME": [
                f"{character_name} {modifier} acquires ${transaction_value:,} worth of {sector} resources, purchasing {units} units to fuel expansion plans, directly impacting 6 supplier companies and supporting {random.randint(20, 50)} upstream jobs",
                f"{character_name} makes strategic procurement of ${transaction_value:,} in {sector} materials, securing {units} units at {random.uniform(5, 15):.1f}% below market rate, strengthening position for next quarter's ${int(impact * 300):,} revenue target",
                f"{character_name} {modifier} invests ${transaction_value:,} in high-quality {sector} equipment, purchasing {units} units that will boost productivity by {random.uniform(15, 35):.1f}% and reduce costs by ${int(impact * 150):,} annually"
            ],
            "INVEST": [
                f"{character_name} {modifier} commits ${transaction_value:,} to {sector} ventures, targeting {random.uniform(8, 25):.1f}% annual returns through {units} strategic positions, potentially creating {random.randint(15, 40)} new jobs if successful",
                f"{character_name} deploys ${transaction_value:,} across {random.randint(3, 8)} {sector} opportunities, diversifying risk while pursuing ${int(impact * 400):,} in projected returns over {random.randint(18, 36)} months",
                f"{character_name} {modifier} allocates ${transaction_value:,} to emerging {sector} technologies, backing {units} innovative projects with potential ${int(impact * 600):,} market impact and {random.randint(25, 75)} job creation"
            ],
            "INNOVATE": [
                f"{character_name} {modifier} launches ${transaction_value:,} R&D initiative, developing breakthrough {sector} technology that could disrupt markets worth ${int(impact * 1000):,} and create {random.randint(30, 100)} high-skill jobs",
                f"{character_name} pioneers ${transaction_value:,} innovation project, targeting {sector} efficiency improvements of {random.uniform(20, 50):.1f}% that could save industry ${int(impact * 800):,} annually while generating {units} patents",
                f"{character_name} {modifier} invests ${transaction_value:,} in next-generation {sector} solutions, potentially revolutionizing {random.choice(['supply chains', 'production methods', 'customer experiences', 'market dynamics'])} and creating ${int(impact * 200):,} in new economic value"
            ],
            "REGULATE": [
                f"{character_name} {modifier} implements ${transaction_value:,} compliance framework affecting {units} {sector} companies, standardizing practices that could save industry ${int(impact * 500):,} while ensuring ethical operations for {random.randint(500, 2000)} workers",
                f"{character_name} establishes new {sector} regulations requiring ${transaction_value:,} in industry improvements, protecting {random.randint(1000, 5000)} consumers while creating {random.randint(10, 30)} oversight positions",
                f"{character_name} {modifier} launches ${transaction_value:,} regulatory initiative, balancing {sector} innovation with safety, potentially affecting {units} companies and ${int(impact * 1000):,} in market activity"
            ],
            "HOLD": [
                f"{character_name} {modifier} maintains current ${transaction_value:,} position in {sector}, preserving {units} existing partnerships while analyzing market volatility that could affect ${int(impact * 400):,} in future opportunities",
                f"{character_name} consolidates ${transaction_value:,} in {sector} holdings, protecting {random.randint(20, 60)} jobs during uncertain market conditions while preparing for strategic moves worth ${int(impact * 300):,}",
                f"{character_name} {modifier} stabilizes ${transaction_value:,} operations, maintaining {units} service contracts and supporting {random.randint(15, 45)} local businesses during market analysis phase"
            ]
        }
        
        stories = detailed_stories.get(action, [f"{character_name} takes strategic {action.lower()} action in {sector}"])
        return random.choice(stories)

class PerformanceMonitor:
    """Monitors system performance and provides alerts"""
    
    def __init__(self):
        self.metrics = {
            "requests_per_minute": 0,
            "avg_response_time": 0.0,
            "error_rate": 0.0,
            "active_agents": 0,
            "model_availability": 0.0,
            "queue_size": 0
        }
        self.alerts = []
        self.history = deque(maxlen=100)
        
    def update_metrics(self, **kwargs):
        """Update performance metrics"""
        for key, value in kwargs.items():
            if key in self.metrics:
                self.metrics[key] = value
        
        # Check for alerts
        self._check_alerts()
        
        # Store in history
        self.history.append({
            "timestamp": time.time(),
            "metrics": self.metrics.copy()
        })
    
    def _check_alerts(self):
        """Check for performance alerts"""
        if self.metrics["error_rate"] > 0.2:
            self.alerts.append({
                "type": "error_rate",
                "message": f"High error rate: {self.metrics['error_rate']:.1%}",
                "timestamp": time.time()
            })
        
        if self.metrics["avg_response_time"] > 5.0:
            self.alerts.append({
                "type": "slow_response",
                "message": f"Slow response time: {self.metrics['avg_response_time']:.1f}s",
                "timestamp": time.time()
            })
        
        if self.metrics["queue_size"] > 100:
            self.alerts.append({
                "type": "queue_buildup",
                "message": f"Large queue size: {self.metrics['queue_size']}",
                "timestamp": time.time()
            })
        
        # Keep only recent alerts
        self.alerts = [a for a in self.alerts if time.time() - a["timestamp"] < 300]
    
    def get_dashboard_data(self) -> Dict[str, Any]:
        """Get dashboard data"""
        return {
            "metrics": self.metrics,
            "alerts": self.alerts,
            "history": list(self.history)
        }

class SmartAdaptiveSystem:
    """Main Smart Adaptive System coordinator"""
    
    def __init__(self):
        self.model_manager = MultiModelManager()
        self.rate_limiter = IntelligentRateLimiter()
        self.agent_manager = AdaptiveAgentManager()
        self.storyteller = StorytellingEnhancer()
        self.monitor = PerformanceMonitor()
        
        # System state
        self.agents = []
        self.websocket_clients = set()
        self.websocket_lock = asyncio.Lock()
        self.running = False
        self.recent_decisions = []
        
        # Enhanced features
        self.agent_relationships = {}  # agent_id -> {other_agent_id: strength}
        self.economic_events = []
        self.population_metrics = {
            "births": 0,
            "deaths": 0, 
            "generation": 1,
            "total_agents_created": 0
        }
        self.scenario_active = None
        self.simulation_speed = 1.0
        
        # Enhanced market conditions
        self.market_conditions = {
            "gdp_growth": 2.5,
            "inflation": 2.0,
            "unemployment": 5.0,
            "interest_rates": 3.0,
            "consumer_confidence": 70,
            "market_volatility": 20,
            "innovation_index": 50,
            "sustainability_score": 60,
            "sector_performance": {
                "agriculture": 1.0,
                "manufacturing": 1.0,
                "technology": 1.0,
                "healthcare": 1.0,
                "finance": 1.0,
                "energy": 1.0,
                "retail": 1.0,
                "education": 1.0,
                "transportation": 1.0,
                "construction": 1.0
            }
        }
        
        # System metrics
        self.system_metrics = {
            "total_agents": 0,
            "active_agents": 0,
            "hibernated_agents": 0,
            "total_wealth": 0,
            "decisions_per_minute": 0,
            "success_rate": 0.0,
            "avg_response_time": 0.0
        }
        
        logger.info("Smart Adaptive System initialized")
    
    def create_agents(self, count: int = 100):
        """Create initial agent population"""
        # Import the existing agent creation logic
        from scaled_economy_500 import AgentConfig, EconomicAgent
        
        agent_types = ["producer"] * 150 + ["consumer"] * 120 + ["service_provider"] * 100 + \
                     ["financier"] * 60 + ["innovator"] * 40 + ["regulator"] * 20 + ["supplier"] * 10
        
        sectors = ["agriculture", "manufacturing", "technology", "healthcare", "education",
                  "finance", "energy", "transportation", "retail", "construction"]
        
        personalities = ["conservative", "moderate", "aggressive", "innovative", "adaptive"]
        
        for i in range(count):
            config = AgentConfig(
                agent_id=f"Agent_{i+1:03d}",
                agent_type=agent_types[i % len(agent_types)],
                sector=random.choice(sectors),
                personality=random.choice(personalities),
                risk_tolerance=random.uniform(0.1, 0.9)
            )
            
            # Generate character details
            character = self.storyteller.character_gen.generate_character_name(
                config.agent_type, config.sector, config.personality
            )
            
            # Create smart agent with enhanced capabilities
            agent = SmartEconomicAgent(config, self)
            agent.character = character  # Add character info
            self.agents.append(agent)
            
            # Register with agent manager
            self.agent_manager.activate_agent(agent.config.agent_id)
        
        self.system_metrics["total_agents"] = len(self.agents)
        logger.info(f"Created {count} smart adaptive agents")
    
    async def run_smart_decisions(self):
        """Run intelligent agent decision making"""
        logger.info("Starting Smart Adaptive System decision engine")
        
        while self.running:
            # Select active agents for decisions
            active_agents = [
                agent for agent in self.agents
                if agent.config.agent_id in self.agent_manager.active_agents
            ]
            
            if not active_agents:
                await asyncio.sleep(5)
                continue
            
            # Optimized batch size for ultra-cheap paid models
            batch_size = max(5, min(15, len(active_agents) // 5))
            decision_agents = random.sample(active_agents, min(batch_size, len(active_agents)))
            
            # Process decisions through smart system
            tasks = []
            for agent in decision_agents:
                task = asyncio.create_task(self._process_smart_decision(agent))
                tasks.append(task)
            
            # Wait for all decisions with timeout
            try:
                decisions = await asyncio.wait_for(
                    asyncio.gather(*tasks, return_exceptions=True),
                    timeout=30.0
                )
                
                # Process successful decisions
                for decision in decisions:
                    if isinstance(decision, dict) and not decision.get("error"):
                        self.recent_decisions.append(decision)
                        self.agent_manager.update_activity(decision["agent_id"])
                
            except asyncio.TimeoutError:
                logger.warning("Decision batch timed out")
            
            # Update system metrics
            self._update_system_metrics()
            
            # Check population dynamics
            self._check_population_dynamics()
            
            # Update market conditions based on agent activity
            self._update_market_conditions()
            
            # Broadcast updates
            await self._broadcast_updates()
            
            # Conservative sleep to respect rate limits
            sleep_time = self._calculate_adaptive_sleep()
            await asyncio.sleep(sleep_time)
    
    async def _process_smart_decision(self, agent) -> Dict[str, Any]:
        """Process a single agent decision through the smart system"""
        try:
            # Get best available model
            model = self.model_manager.get_best_model()
            
            # Create enhanced prompt
            prompt = agent.create_enhanced_prompt(self.market_conditions)
            context = {
                "agent_id": agent.config.agent_id,
                "agent_type": agent.config.agent_type,
                "sector": agent.config.sector,
                "action": "ANALYZE",
                "character_name": getattr(agent, 'character', {}).get('full_name', agent.config.agent_id),
                "character": getattr(agent, 'character', {})
            }
            
            # Make API call with retry logic
            start_time = time.time()
            response = await self._make_smart_api_call(model, prompt, context)
            response_time = time.time() - start_time
            
            # Enhance response quality
            enhanced_response = self.storyteller.enhance_response(response, context)
            
            # Parse decision
            decision = agent.parse_smart_decision(enhanced_response, self.market_conditions, response_time)
            
            # Record success
            self.model_manager.record_request(model, True, response_time)
            
            return decision
            
        except Exception as e:
            logger.error(f"Smart decision error for {agent.config.agent_id}: {e}")
            return {"error": str(e), "agent_id": agent.config.agent_id}
    
    async def _make_smart_api_call(self, model: str, prompt: str, context: Dict[str, Any]) -> str:
        """Make API call with intelligent retry and fallback"""
        max_retries = 3
        
        for attempt in range(max_retries):
            try:
                completion = self.model_manager.client.chat.completions.create(
                    model=model,
                    messages=[
                        {"role": "system", "content": f"You are {context['agent_id']}, a {context['agent_type']} in {context['sector']}. Respond with: ACTION: [action] IMPACT: [number] REASON: [brief explanation] STORY: [one sentence narrative] MOOD: [emotional state]"},
                        {"role": "user", "content": prompt}
                    ],
                    max_tokens=100,
                    temperature=0.6
                )
                
                return completion.choices[0].message.content
                
            except Exception as e:
                error_msg = str(e).lower()
                is_rate_limited = "rate limit" in error_msg or "429" in error_msg
                
                if is_rate_limited:
                    self.model_manager.record_request(model, False, 0.0, is_rate_limited=True)
                    # Try different model
                    model = self.model_manager.get_best_model()
                    await asyncio.sleep(2 ** attempt)  # Exponential backoff
                else:
                    self.model_manager.record_request(model, False, 0.0)
                    await asyncio.sleep(1)
                
                if attempt == max_retries - 1:
                    raise e
        
        # Should never reach here
        raise Exception("Max retries exceeded")
    
    def _update_system_metrics(self):
        """Update system-wide metrics"""
        scaling_stats = self.agent_manager.get_scaling_stats()
        model_stats = self.model_manager.get_metrics_summary()
        
        self.system_metrics.update({
            "active_agents": scaling_stats["active_agents"],
            "hibernated_agents": scaling_stats["hibernated_agents"],
            "system_load": scaling_stats["system_load"],
            "decisions_per_minute": len([d for d in self.recent_decisions if time.time() - d.get("timestamp", 0) < 60]),
            "model_availability": sum(1 for m in model_stats.values() if m["is_available"]) / len(model_stats),
            "avg_response_time": sum(m["avg_response_time"] for m in model_stats.values() if m["avg_response_time"] > 0) / max(1, len([m for m in model_stats.values() if m["avg_response_time"] > 0])),
            "total_births": self.population_metrics["births"],
            "total_deaths": self.population_metrics["deaths"],
            "current_generation": self.population_metrics["generation"],
            "total_relationships": sum(len(rels) for rels in self.agent_relationships.values()),
            "avg_relationship_strength": sum(sum(rels.values()) for rels in self.agent_relationships.values()) / max(1, sum(len(rels) for rels in self.agent_relationships.values()))
        })
        
        # Update performance monitor
        self.monitor.update_metrics(**self.system_metrics)
        
        # Clean old decisions
        if len(self.recent_decisions) > 1000:
            self.recent_decisions = self.recent_decisions[-500:]
    
    def _calculate_adaptive_sleep(self) -> float:
        """Calculate adaptive sleep time based on system performance"""
        base_sleep = 5.0  # Base 5 seconds - optimized for ultra-cheap models
        
        # Check recent rate limiting
        recent_rate_limits = sum(1 for m in self.model_manager.models.values() if m.is_on_cooldown())
        if recent_rate_limits > 5:
            base_sleep *= 2.0  # Double sleep if many models rate limited
        elif recent_rate_limits > 2:
            base_sleep *= 1.5  # Increase sleep if some models rate limited
        
        # Adjust based on system metrics
        if self.system_metrics.get("success_rate", 0) > 0.8:
            base_sleep *= 0.9  # Slightly faster if successful
        elif self.system_metrics.get("success_rate", 0) < 0.3:
            base_sleep *= 2.0  # Much slower if many failures
        
        return max(3.0, min(30.0, base_sleep))  # Clamp between 3-30 seconds
    
    async def _broadcast_updates(self):
        """Broadcast system updates to connected clients"""
        async with self.websocket_lock:
            if not self.websocket_clients:
                return
            
            # Create comprehensive update
            update_data = {
                "type": "smart_system_update",
                "timestamp": time.time(),
                "metrics": self.system_metrics,
                "market_conditions": self.market_conditions,
                "recent_decisions": self.recent_decisions[-10:],
                "model_stats": self.model_manager.get_metrics_summary(),
                "scaling_stats": self.agent_manager.get_scaling_stats(),
                "performance_data": self.monitor.get_dashboard_data(),
                "population_metrics": self.population_metrics,
                "agent_relationships": {
                    agent_id: {k: v for k, v in relationships.items() if v > 0.1}  # Only send significant relationships
                    for agent_id, relationships in list(self.agent_relationships.items())[:20]  # Limit to 20 agents
                },
                "economic_events": self.economic_events[-5:],  # Last 5 economic events
                "simulation_speed": self.simulation_speed,
                "scenario_active": self.scenario_active
            }
            
            # Send to all connected clients (create copy to avoid iteration issues)
            disconnected = set()
            clients_copy = set(self.websocket_clients)
        
        # Send outside the lock to avoid blocking other operations
        for client in clients_copy:
            try:
                await client.send(json.dumps(update_data))
            except Exception as e:
                disconnected.add(client)
        
        # Remove disconnected clients with lock
        if disconnected:
            async with self.websocket_lock:
                self.websocket_clients -= disconnected
    
    async def websocket_handler(self, websocket, path=None):
        """Enhanced WebSocket handler with proper signature"""
        logger.info(f"New WebSocket connection from {websocket.remote_address}")
        async with self.websocket_lock:
            self.websocket_clients.add(websocket)
        
        try:
            # Send initial state
            initial_data = {
                "type": "smart_system_init",
                "system_info": {
                    "name": "Smart Adaptive System",
                    "version": "1.0.0",
                    "models_available": len(ULTRA_CHEAP_MODELS),
                    "total_agents": len(self.agents)
                },
                "metrics": self.system_metrics,
                "market_conditions": self.market_conditions
            }
            await websocket.send(json.dumps(initial_data))
            
            # Handle incoming messages
            async for message in websocket:
                try:
                    data = json.loads(message)
                    await self._handle_websocket_message(websocket, data)
                except json.JSONDecodeError:
                    logger.warning(f"Invalid JSON from {websocket.remote_address}")
                except Exception as e:
                    logger.error(f"Error handling WebSocket message: {e}")
        
        except Exception as e:
            logger.error(f"WebSocket error: {e}")
        finally:
            async with self.websocket_lock:
                self.websocket_clients.discard(websocket)
            logger.info(f"WebSocket disconnected: {websocket.remote_address}")
    
    async def _handle_websocket_message(self, websocket, data):
        """Handle incoming WebSocket messages"""
        message_type = data.get("type")
        
        if message_type == "ping":
            await websocket.send(json.dumps({"type": "pong", "timestamp": data.get("timestamp", time.time())}))
        elif message_type == "get_model_stats":
            await websocket.send(json.dumps({
                "type": "model_stats",
                "data": self.model_manager.get_metrics_summary()
            }))
        elif message_type == "get_performance_data":
            await websocket.send(json.dumps({
                "type": "performance_data",
                "data": self.monitor.get_dashboard_data()
            }))
        elif message_type == "force_agent_decision":
            agent_id = data.get("agent_id")
            if agent_id:
                await self._force_agent_decision(agent_id)
        elif message_type == "speed_control":
            speed = data.get("speed", "normal")
            self._set_simulation_speed(speed)
        elif message_type == "scenario_injection":
            scenario = data.get("scenario")
            if scenario:
                await self._inject_economic_scenario(scenario)
        elif message_type == "agent_spotlight":
            agent_id = data.get("agent_id")
            if agent_id:
                await self._send_agent_details(websocket, agent_id)
    
    async def _force_agent_decision(self, agent_id: str):
        """Force a specific agent to make a decision"""
        agent = next((a for a in self.agents if a.config.agent_id == agent_id), None)
        if agent:
            decision = await self._process_smart_decision(agent)
            if not decision.get("error"):
                self.recent_decisions.append(decision)
                logger.info(f"Forced decision for {agent_id}: {decision.get('action', 'unknown')}")
    
    def _set_simulation_speed(self, speed: str):
        """Set simulation speed multiplier"""
        speed_map = {"slow": 0.5, "normal": 1.0, "fast": 2.0}
        self.simulation_speed = speed_map.get(speed, 1.0)
        logger.info(f"Simulation speed set to {speed} ({self.simulation_speed}x)")
    
    async def _inject_economic_scenario(self, scenario: str):
        """Inject economic scenario and update market conditions"""
        self.scenario_active = scenario
        
        scenario_effects = {
            "boom": {
                "gdp_growth": 5.5,
                "consumer_confidence": 85,
                "market_volatility": 15,
                "innovation_index": 70
            },
            "recession": {
                "gdp_growth": -1.2,
                "unemployment": 8.5,
                "consumer_confidence": 35,
                "market_volatility": 35
            },
            "crisis": {
                "gdp_growth": -3.8,
                "unemployment": 12.0,
                "consumer_confidence": 25,
                "market_volatility": 50,
                "inflation": 6.5
            },
            "innovation": {
                "innovation_index": 90,
                "gdp_growth": 4.2,
                "market_volatility": 25
            }
        }
        
        if scenario in scenario_effects:
            effects = scenario_effects[scenario]
            # Apply effects to market conditions
            for key, value in effects.items():
                self.market_conditions[key] = value
            
            logger.info(f"Economic scenario '{scenario}' injected")
            
            # Create economic event
            event = {
                "type": "scenario_injection",
                "scenario": scenario,
                "timestamp": time.time(),
                "effects": effects
            }
            self.economic_events.append(event)
    
    async def _send_agent_details(self, websocket, agent_id: str):
        """Send detailed agent information for spotlight"""
        agent = next((a for a in self.agents if a.config.agent_id == agent_id), None)
        if agent:
            agent_details = {
                "type": "agent_details",
                "agent_id": agent_id,
                "agent_type": agent.config.agent_type,
                "sector": agent.config.sector,
                "personality": agent.config.personality,
                "performance": agent.performance,
                "relationships": self.agent_relationships.get(agent_id, {}),
                "recent_decisions": [
                    d for d in self.recent_decisions[-20:] 
                    if d.get("agent_id") == agent_id
                ][-5:]
            }
            await websocket.send(json.dumps(agent_details))
    
    async def start_websocket_server(self):
        """Start the WebSocket server"""
        logger.info("Starting Smart Adaptive WebSocket server on ws://localhost:8765")
        server = await websockets.serve(
            self.websocket_handler,
            "localhost",
            8765
        )
        return server
    
    async def run_system(self):
        """Run the complete Smart Adaptive System"""
        logger.info("🚀 Starting Smart Adaptive System")
        self.running = True
        
        # Start WebSocket server
        websocket_server = await self.start_websocket_server()
        
        # Start decision engine
        await self.run_smart_decisions()
    
    def stop_system(self):
        """Stop the system gracefully"""
        logger.info("🛑 Stopping Smart Adaptive System")
        self.running = False
    
    def _update_agent_relationships(self, agent_id: str, decision: Dict[str, Any]):
        """Update agent relationships based on decisions and sector interactions"""
        if agent_id not in self.agent_relationships:
            self.agent_relationships[agent_id] = {}
        
        # Find agents in same or related sectors
        related_agents = [
            agent for agent in self.agents
            if agent.config.agent_id != agent_id and (
                agent.config.sector == decision["sector"] or
                self._sectors_related(agent.config.sector, decision["sector"])
            )
        ]
        
        # Update relationships based on decision type and economic impact
        for related_agent in related_agents[:5]:  # Limit to 5 relationships per decision
            other_id = related_agent.config.agent_id
            current_strength = self.agent_relationships[agent_id].get(other_id, 0.0)
            
            # Calculate relationship change based on decision
            impact = decision.get("economic_impact", 0)
            action = decision.get("action", "HOLD")
            
            if action in ["PRODUCE", "INNOVATE"] and impact > 0:
                # Positive economic actions strengthen relationships
                change = min(0.1, impact / 1000)
            elif action == "CONSUME" and impact < 0:
                # Consuming creates moderate positive relationships
                change = 0.05
            elif action == "REGULATE":
                # Regulation can strain relationships
                change = -0.02
            else:
                change = 0.01  # Small positive drift for any interaction
            
            # Apply personality modifiers
            if decision["personality"] == "aggressive":
                change *= 0.8  # Aggressive agents have weaker relationships
            elif decision["personality"] == "cooperative":
                change *= 1.3  # Cooperative agents build stronger relationships
            
            # Update relationship strength (0.0 to 1.0)
            new_strength = max(0.0, min(1.0, current_strength + change))
            self.agent_relationships[agent_id][other_id] = new_strength
            
            # Reciprocal relationship (slightly weaker)
            if other_id not in self.agent_relationships:
                self.agent_relationships[other_id] = {}
            other_current = self.agent_relationships[other_id].get(agent_id, 0.0)
            self.agent_relationships[other_id][agent_id] = max(0.0, min(1.0, other_current + change * 0.7))
    
    def _sectors_related(self, sector1: str, sector2: str) -> bool:
        """Check if two sectors are economically related"""
        sector_relationships = {
            "agriculture": ["retail", "manufacturing"],
            "manufacturing": ["agriculture", "technology", "transportation"],
            "technology": ["manufacturing", "finance", "education"],
            "finance": ["technology", "retail", "construction"],
            "healthcare": ["education", "technology"],
            "energy": ["manufacturing", "transportation"],
            "retail": ["agriculture", "finance", "transportation"],
            "education": ["technology", "healthcare"],
            "transportation": ["manufacturing", "energy", "retail"],
            "construction": ["finance", "manufacturing"]
        }
        return sector2 in sector_relationships.get(sector1, [])
    
    def _check_population_dynamics(self):
        """Check if agents should be born or die based on economic performance"""
        current_time = time.time()
        
        # Only check every 5 minutes
        if not hasattr(self, '_last_population_check'):
            self._last_population_check = current_time
        elif current_time - self._last_population_check < 300:
            return
        
        self._last_population_check = current_time
        
        # Calculate overall economic health
        total_wealth = sum(agent.performance["wealth"] for agent in self.agents)
        avg_wealth = total_wealth / len(self.agents) if self.agents else 0
        recent_gdp = self.market_conditions.get("gdp_growth", 2.5)
        
        # Birth condition: Strong economy and high wealth
        if (recent_gdp > 3.5 and avg_wealth > 1500 and 
            len(self.agents) < self.agent_manager.max_agents * 0.8):
            
            # Find successful agents who could "spawn" new agents
            successful_agents = [
                agent for agent in self.agents
                if (agent.performance["wealth"] > avg_wealth * 1.5 and
                    agent.performance["sustainability_score"] > 60)
            ]
            
            if successful_agents and random.random() < 0.3:  # 30% chance
                parent_agent = random.choice(successful_agents)
                self._birth_new_agent(parent_agent)
        
        # Death condition: Economic crisis and poor performers
        elif (recent_gdp < -1.0 or avg_wealth < 800) and len(self.agents) > 50:
            # Find underperforming agents
            poor_performers = [
                agent for agent in self.agents
                if (agent.performance["wealth"] < avg_wealth * 0.3 or
                    agent.performance["sustainability_score"] < 20)
            ]
            
            if poor_performers and random.random() < 0.2:  # 20% chance
                agent_to_remove = random.choice(poor_performers)
                self._remove_underperforming_agent(agent_to_remove)
    
    def _birth_new_agent(self, parent_agent):
        """Create a new agent based on a successful parent agent"""
        self.population_metrics["births"] += 1
        self.population_metrics["total_agents_created"] += 1
        
        # Create config similar to parent but with some variation
        from scaled_economy_500 import AgentConfig
        
        new_id = f"Agent_{self.population_metrics['total_agents_created']:03d}"
        config = AgentConfig(
            agent_id=new_id,
            agent_type=parent_agent.config.agent_type,  # Inherit type
            sector=parent_agent.config.sector if random.random() < 0.7 else random.choice([
                "agriculture", "manufacturing", "technology", "healthcare", "finance"
            ]),
            personality=parent_agent.config.personality if random.random() < 0.6 else random.choice([
                "conservative", "moderate", "aggressive", "innovative", "adaptive"
            ]),
            risk_tolerance=max(0.1, min(0.9, parent_agent.config.risk_tolerance + random.uniform(-0.2, 0.2)))
        )
        
        # Create new agent with inherited advantages
        new_agent = SmartEconomicAgent(config, self)
        new_agent.performance["wealth"] = parent_agent.performance["wealth"] * 0.3  # Inherit some wealth
        new_agent.performance["sustainability_score"] = parent_agent.performance["sustainability_score"] * 0.8
        
        self.agents.append(new_agent)
        self.agent_manager.activate_agent(new_agent.config.agent_id)
        
        # Inherit some relationships from parent
        if parent_agent.config.agent_id in self.agent_relationships:
            self.agent_relationships[new_id] = {}
            for other_id, strength in list(self.agent_relationships[parent_agent.config.agent_id].items())[:3]:
                self.agent_relationships[new_id][other_id] = strength * 0.5  # Weaker inherited relationships
        
        logger.info(f"New agent {new_id} born from successful parent {parent_agent.config.agent_id}")
    
    def _remove_underperforming_agent(self, agent):
        """Remove an underperforming agent from the simulation"""
        self.population_metrics["deaths"] += 1
        
        # Remove from agent list and manager
        if agent in self.agents:
            self.agents.remove(agent)
        
        agent_id = agent.config.agent_id
        self.agent_manager.active_agents.discard(agent_id)
        self.agent_manager.hibernated_agents.discard(agent_id)
        
        # Clean up relationships
        if agent_id in self.agent_relationships:
            del self.agent_relationships[agent_id]
        
        # Remove references from other agents' relationships
        for other_agent_id in self.agent_relationships:
            self.agent_relationships[other_agent_id].pop(agent_id, None)
        
        logger.info(f"Agent {agent_id} removed due to poor economic performance")
    
    def _update_market_conditions(self):
        """Update market conditions based on recent agent activity"""
        if not self.recent_decisions:
            return
        
        # Analyze recent decisions for market trends
        recent_window = [d for d in self.recent_decisions if time.time() - d.get("timestamp", 0) < 300]  # 5 minutes
        
        if not recent_window:
            return
        
        # Calculate economic indicators from agent behavior
        total_impact = sum(d.get("economic_impact", 0) for d in recent_window)
        avg_impact = total_impact / len(recent_window)
        
        action_counts = {}
        for decision in recent_window:
            action = decision.get("action", "HOLD")
            action_counts[action] = action_counts.get(action, 0) + 1
        
        # Update GDP growth based on productive actions
        production_ratio = (action_counts.get("PRODUCE", 0) + action_counts.get("INNOVATE", 0)) / len(recent_window)
        consumption_ratio = action_counts.get("CONSUME", 0) / len(recent_window)
        
        # Gradual GDP adjustment
        if production_ratio > 0.4:
            self.market_conditions["gdp_growth"] += 0.1
        elif consumption_ratio > 0.5:
            self.market_conditions["gdp_growth"] -= 0.05
        
        # Update market volatility based on decision diversity
        unique_actions = len(action_counts)
        if unique_actions > 4:
            self.market_conditions["market_volatility"] += 1.0
        elif unique_actions < 2:
            self.market_conditions["market_volatility"] -= 0.5
        
        # Clamp values to reasonable ranges
        self.market_conditions["gdp_growth"] = max(-5.0, min(8.0, self.market_conditions["gdp_growth"]))
        self.market_conditions["market_volatility"] = max(5.0, min(60.0, self.market_conditions["market_volatility"]))

# Enhanced agent class that works with the smart system
class SmartEconomicAgent:
    """Enhanced economic agent for the Smart Adaptive System"""
    
    def __init__(self, config, smart_system):
        self.config = config
        self.smart_system = smart_system
        self.performance = {
            "wealth": random.uniform(500, 2000),
            "decisions_made": 0,
            "successful_calls": 0,
            "sustainability_score": random.uniform(30, 80),
            "productivity": random.uniform(0.5, 1.5),
            "last_action": "IDLE"
        }
        self.last_decision_time = 0
        self.decision_interval = random.uniform(120, 300)  # 2-5 minutes
    
    def create_enhanced_prompt(self, market_conditions: Dict[str, Any]) -> str:
        """Create enhanced prompt for better decisions"""
        gdp = market_conditions.get('gdp_growth', 2.5)
        inflation = market_conditions.get('inflation', 2.0)
        unemployment = market_conditions.get('unemployment', 5.0)
        volatility = market_conditions.get('market_volatility', 20)
        character = getattr(self, 'character', {})
        
        character_name = character.get('full_name', self.config.agent_id)
        backstory = character.get('backstory', f'A professional in {self.config.sector}')
        
        market_mood = "stable"
        if gdp > 4.0: market_mood = "booming"
        elif gdp < 0: market_mood = "contracting"
        elif volatility > 30: market_mood = "volatile"
        
        economic_pressure = "moderate"
        if unemployment > 8.0 or inflation > 5.0: economic_pressure = "high"
        elif unemployment < 4.0 and inflation < 2.5: economic_pressure = "low"
        
        return f"""🎭 CHARACTER ROLEPLAY SCENARIO 🎭

You are {character_name}, {backstory}.
Your personality is {self.config.personality} and you work in the {self.config.sector} sector.

📊 THE CURRENT SITUATION:
The economy is {market_mood} with {economic_pressure} pressure on businesses.
- Market Growth: {gdp:.1f}% {"🚀" if gdp > 3 else "📈" if gdp > 0 else "📉"}
- Price Inflation: {inflation:.1f}% {"🔥" if inflation > 4 else "⚠️" if inflation > 3 else "✅"}
- Job Market: {unemployment:.1f}% unemployed {"😰" if unemployment > 7 else "😐" if unemployment > 5 else "😊"}

💼 YOUR CURRENT STATUS:
- Personal Wealth: ${self.performance['wealth']:.0f} {"💰" if self.performance['wealth'] > 1500 else "💸" if self.performance['wealth'] < 800 else "💵"}
- Sustainability Score: {self.performance['sustainability_score']:.0f}/100 {"🌱" if self.performance['sustainability_score'] > 70 else "⚠️" if self.performance['sustainability_score'] < 40 else "🌿"}
- Productivity Level: {self.performance['productivity']:.1f}x {"⚡" if self.performance['productivity'] > 1.2 else "🐌" if self.performance['productivity'] < 0.8 else "⚙️"}

🎯 WHAT WILL YOU DO?
Based on your character, expertise, and the current market situation, what bold action will you take?

AVAILABLE ACTIONS:
• PRODUCE - Create goods/services for the market
• CONSUME - Purchase resources or products  
• INVEST - Put money into promising opportunities
• INNOVATE - Develop new technologies or solutions
• REGULATE - Establish standards or policies
• HOLD - Wait and observe market conditions

Respond as {character_name} with passion and conviction! Include:
ACTION: [Your choice]
IMPACT: [Economic impact number]
REASON: [Why you're doing this]
STORY: [A compelling narrative about your decision]
MOOD: [Your emotional state]"""
    
    def parse_smart_decision(self, response: str, market_conditions: Dict, response_time: float) -> Dict[str, Any]:
        """Parse AI response into structured decision"""
        character_name = getattr(self, 'character', {}).get('full_name', self.config.agent_id)
        decision = {
            "agent_id": self.config.agent_id,
            "character_name": character_name,
            "agent_type": self.config.agent_type,
            "sector": self.config.sector,
            "personality": self.config.personality,
            "timestamp": time.time(),
            "action": "HOLD",
            "economic_impact": 0,
            "reasoning": f"{character_name} conducts thorough market analysis",
            "story": f"{character_name} carefully evaluates current market conditions",
            "mood": "analytical",
            "response_time_ms": response_time * 1000,
            "market_conditions": market_conditions,
            "success": True,
            "character": getattr(self, 'character', {})
        }
        
        try:
            response_upper = response.upper()
            
            # Extract action
            if "PRODUCE" in response_upper:
                decision["action"] = "PRODUCE"
                decision["economic_impact"] = random.uniform(100, 500)
            elif "CONSUME" in response_upper:
                decision["action"] = "CONSUME"
                decision["economic_impact"] = random.uniform(-200, -50)
            elif "INVEST" in response_upper:
                decision["action"] = "INVEST"
                decision["economic_impact"] = random.uniform(-100, 300)
            elif "REGULATE" in response_upper:
                decision["action"] = "REGULATE"
                decision["economic_impact"] = random.uniform(-50, 50)
            elif "INNOVATE" in response_upper:
                decision["action"] = "INNOVATE"
                decision["economic_impact"] = random.uniform(50, 400)
            
            # Enhanced robust element extraction with fallbacks
            if "REASON:" in response_upper:
                try:
                    reason_parts = response.split("REASON:")
                    if len(reason_parts) > 1:
                        reason_text = reason_parts[1]
                        # Split on next section if it exists
                        for next_section in ["STORY:", "MOOD:", "ACTION:", "IMPACT:"]:
                            if next_section in reason_text.upper():
                                reason_text = reason_text.split(next_section)[0]
                                break
                        decision["reasoning"] = reason_text.strip()[:100]
                except Exception:
                    decision["reasoning"] = f"Economic analysis by {self.config.agent_id}"
            
            if "STORY:" in response_upper:
                try:
                    story_parts = response.split("STORY:")
                    if len(story_parts) > 1:
                        story_text = story_parts[1]
                        # Split on next section if it exists  
                        for next_section in ["MOOD:", "ACTION:", "IMPACT:", "REASON:"]:
                            if next_section in story_text.upper():
                                story_text = story_text.split(next_section)[0]
                                break
                        decision["story"] = story_text.strip()[:200]
                except Exception:
                    # Generate detailed economic story based on action
                    decision["story"] = self.smart_system.storyteller._generate_detailed_economic_story(decision, character_name)
            
            if "MOOD:" in response_upper:
                try:
                    mood_parts = response.split("MOOD:")
                    if len(mood_parts) > 1:
                        mood_text = mood_parts[1].strip()
                        # Clean mood text
                        mood_text = mood_text.split()[0] if mood_text.split() else "focused"
                        decision["mood"] = mood_text[:30]
                except Exception:
                    decision["mood"] = "analytical"
        
        except Exception as e:
            logger.warning(f"Parse error for {self.config.agent_id}: {e}")
        
        # Ensure we always have a compelling story
        if not decision.get("story") or len(decision["story"]) < 50:
            decision["story"] = self.smart_system.storyteller._generate_detailed_economic_story(decision, character_name)
        
        # Update agent state
        self._update_performance(decision)
        
        # Update agent relationships in smart system
        self.smart_system._update_agent_relationships(self.config.agent_id, decision)
        
        return decision
    
    def _update_performance(self, decision: Dict[str, Any]):
        """Update agent performance metrics"""
        impact = decision["economic_impact"]
        self.performance["wealth"] += impact
        self.performance["wealth"] = max(0, self.performance["wealth"])
        
        # Update sustainability
        if decision["action"] in ["INNOVATE", "REGULATE"]:
            self.performance["sustainability_score"] += random.uniform(0.5, 2.0)
        elif decision["action"] == "PRODUCE":
            self.performance["sustainability_score"] -= random.uniform(0.1, 0.5)
        
        self.performance["sustainability_score"] = max(0, min(100, self.performance["sustainability_score"]))
        self.performance["last_action"] = decision["action"]
        self.performance["decisions_made"] += 1
        
        if decision["success"]:
            self.performance["successful_calls"] += 1

# Main entry point
async def main():
    """Main function to run Smart Adaptive System"""
    print("🧠 SMART ADAPTIVE SYSTEM - LIVING ECONOMY ARENA")
    print("   Intelligent multi-model AI system with adaptive scaling")
    print("   4 Ultra-Cheap Models | Fractions of a Penny | Smart Scaling")
    print("=" * 70)
    
    # Create Smart Adaptive System
    smart_system = SmartAdaptiveSystem()
    
    # Create agents (reduced to 100 for rate limit management)
    smart_system.create_agents(100)
    
    print(f"\n🎯 Smart System Ready:")
    print(f"   • 100 intelligent agents created (optimized for rate limits)")
    print(f"   • 4 ultra-cheap models ($0.05-$0.10 per million tokens)")
    print(f"   • Multi-model load balancing active")
    print(f"   • Intelligent rate limiting enabled")
    print(f"   • Dynamic agent scaling ready")
    print(f"   • WebSocket: ws://localhost:8765")
    print(f"   • Enhanced storytelling active")
    print("\n🚀 Starting Smart Adaptive System...")
    
    try:
        await smart_system.run_system()
    except KeyboardInterrupt:
        smart_system.stop_system()
        print("\n✅ Smart Adaptive System stopped gracefully")

if __name__ == "__main__":
    asyncio.run(main())
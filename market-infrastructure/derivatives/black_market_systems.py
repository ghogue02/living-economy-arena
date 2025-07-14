"""
Black Market Systems - Underground Economy Simulation Framework

EDUCATIONAL SIMULATION ONLY - For economic modeling and law enforcement training
This system models underground economies for:
- Academic research on illicit markets
- Law enforcement training scenarios  
- Economic warfare game mechanics
- Policy analysis and regulatory effectiveness

WARNING: This is simulation software only. Real criminal activities are illegal.
"""

import json
import hashlib
import random
import time
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass, field
from enum import Enum
from datetime import datetime, timedelta

class RiskLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    EXTREME = "extreme"

class MarketType(Enum):
    CONTRABAND_GOODS = "contraband_goods"
    ILLEGAL_SERVICES = "illegal_services"
    MONEY_LAUNDERING = "money_laundering"
    INFORMATION_TRADING = "information_trading"
    UNDERGROUND_BANKING = "underground_banking"

class DetectionStatus(Enum):
    UNDETECTED = "undetected"
    MONITORED = "monitored"
    INVESTIGATED = "investigated"
    COMPROMISED = "compromised"

@dataclass
class BlackMarketGood:
    """Simulated contraband item for educational modeling"""
    item_id: str
    name: str
    category: str
    base_value: float
    risk_multiplier: float
    detection_probability: float
    supply_volatility: float
    demand_elasticity: float
    legal_alternatives: List[str] = field(default_factory=list)
    
class BlackMarketTransaction:
    """Simulated illicit transaction for analysis"""
    def __init__(self, transaction_id: str, buyer_id: str, seller_id: str,
                 good: BlackMarketGood, quantity: int, price: float):
        self.transaction_id = transaction_id
        self.buyer_id = buyer_id
        self.seller_id = seller_id
        self.good = good
        self.quantity = quantity
        self.price = price
        self.timestamp = datetime.now()
        self.anonymity_layer = random.choice(['tor', 'vpn', 'mixer', 'physical'])
        self.detection_risk = self._calculate_detection_risk()
        
    def _calculate_detection_risk(self) -> float:
        """Calculate probability of law enforcement detection"""
        base_risk = self.good.detection_probability
        volume_risk = min(self.quantity * 0.01, 0.5)
        value_risk = min(self.price * 0.0001, 0.3)
        return min(base_risk + volume_risk + value_risk, 0.95)

class UndergroundMarketplace:
    """Simulated dark web marketplace for educational purposes"""
    
    def __init__(self, name: str, security_level: RiskLevel):
        self.name = name
        self.security_level = security_level
        self.vendors: Dict[str, Dict] = {}
        self.transactions: List[BlackMarketTransaction] = []
        self.goods_catalog: Dict[str, BlackMarketGood] = {}
        self.reputation_system = {}
        self.escrow_service = EscrowService()
        self.detection_status = DetectionStatus.UNDETECTED
        self.law_enforcement_heat = 0.0
        
    def add_contraband_good(self, good: BlackMarketGood):
        """Add simulated contraband for educational modeling"""
        print(f"[SIMULATION] Adding contraband good: {good.name}")
        print(f"[EDUCATIONAL] This simulates how underground markets catalog illicit items")
        self.goods_catalog[good.item_id] = good
        
    def register_vendor(self, vendor_id: str, specialties: List[str]):
        """Register simulated criminal vendor"""
        self.vendors[vendor_id] = {
            'specialties': specialties,
            'reputation': 0.5,
            'transactions': 0,
            'last_active': datetime.now(),
            'risk_profile': random.choice(list(RiskLevel))
        }
        
    def simulate_transaction(self, buyer_id: str, seller_id: str, 
                           good_id: str, quantity: int) -> Optional[BlackMarketTransaction]:
        """Simulate illicit transaction for analysis"""
        if good_id not in self.goods_catalog:
            return None
            
        good = self.goods_catalog[good_id]
        price = self._calculate_black_market_price(good, quantity)
        
        transaction = BlackMarketTransaction(
            f"txn_{len(self.transactions)}",
            buyer_id, seller_id, good, quantity, price
        )
        
        # Simulate law enforcement detection chance
        if random.random() < transaction.detection_risk:
            self.law_enforcement_heat += 0.1
            print(f"[SIMULATION] Transaction flagged by law enforcement systems")
            
        self.transactions.append(transaction)
        return transaction
        
    def _calculate_black_market_price(self, good: BlackMarketGood, quantity: int) -> float:
        """Calculate price with risk premium and market dynamics"""
        base_price = good.base_value * quantity
        risk_premium = base_price * good.risk_multiplier
        supply_adjustment = random.uniform(0.8, 1.5)  # Supply volatility
        return base_price + risk_premium * supply_adjustment

class EscrowService:
    """Simulated underground escrow for educational analysis"""
    
    def __init__(self):
        self.holdings: Dict[str, float] = {}
        self.disputes: List[Dict] = []
        
    def create_escrow(self, transaction_id: str, amount: float):
        """Create escrow account for simulated transaction"""
        self.holdings[transaction_id] = amount
        print(f"[SIMULATION] Escrow created for transaction {transaction_id}")
        
    def release_escrow(self, transaction_id: str, to_seller: bool = True):
        """Release escrowed funds in simulation"""
        if transaction_id in self.holdings:
            amount = self.holdings.pop(transaction_id)
            recipient = "seller" if to_seller else "buyer"
            print(f"[SIMULATION] Released ${amount} from escrow to {recipient}")

class MoneyLaunderingDetection:
    """Law enforcement money laundering detection system"""
    
    def __init__(self):
        self.suspicious_patterns = []
        self.flagged_accounts = set()
        self.investigation_threshold = 10000.0
        
    def analyze_transaction_pattern(self, transactions: List[BlackMarketTransaction]) -> Dict:
        """Analyze transactions for money laundering indicators"""
        analysis = {
            'structuring_detected': False,
            'unusual_patterns': [],
            'high_risk_transactions': [],
            'recommended_actions': []
        }
        
        # Check for structuring (breaking large amounts into smaller ones)
        daily_totals = {}
        for txn in transactions:
            date = txn.timestamp.date()
            if date not in daily_totals:
                daily_totals[date] = 0
            daily_totals[date] += txn.price
            
        # Flag unusual patterns
        for date, total in daily_totals.items():
            if total > self.investigation_threshold:
                analysis['high_risk_transactions'].append(f"High volume on {date}: ${total}")
                
        if len(analysis['high_risk_transactions']) > 0:
            analysis['recommended_actions'].append("Initiate AML investigation")
            analysis['recommended_actions'].append("Request additional documentation")
            
        return analysis

class CriminalOrganization:
    """Simulated criminal enterprise for educational modeling"""
    
    def __init__(self, name: str, territory: str, specialization: str):
        self.name = name
        self.territory = territory
        self.specialization = specialization
        self.hierarchy = self._initialize_hierarchy()
        self.revenue_streams = []
        self.territories_controlled = [territory]
        self.law_enforcement_pressure = 0.0
        self.informants = []
        
    def _initialize_hierarchy(self) -> Dict:
        """Create simulated criminal hierarchy"""
        return {
            'boss': f"boss_{self.name}",
            'lieutenants': [f"lt_{i}_{self.name}" for i in range(3)],
            'soldiers': [f"soldier_{i}_{self.name}" for i in range(10)],
            'associates': [f"assoc_{i}_{self.name}" for i in range(20)]
        }
        
    def expand_territory(self, new_territory: str, resistance_level: float):
        """Simulate territorial expansion"""
        success_chance = 0.7 - resistance_level
        if random.random() < success_chance:
            self.territories_controlled.append(new_territory)
            print(f"[SIMULATION] {self.name} expanded into {new_territory}")
        else:
            print(f"[SIMULATION] {self.name} failed to expand into {new_territory}")

class LawEnforcementSystem:
    """Law enforcement detection and response system"""
    
    def __init__(self):
        self.active_investigations = {}
        self.surveillance_targets = set()
        self.informant_network = {}
        self.detection_algorithms = MoneyLaunderingDetection()
        
    def initiate_investigation(self, target: str, evidence_level: float):
        """Start criminal investigation"""
        investigation_id = f"inv_{len(self.active_investigations)}"
        self.active_investigations[investigation_id] = {
            'target': target,
            'evidence_level': evidence_level,
            'started': datetime.now(),
            'status': 'active',
            'resources_allocated': self._determine_resources(evidence_level)
        }
        print(f"[LAW ENFORCEMENT] Investigation {investigation_id} initiated on {target}")
        
    def _determine_resources(self, evidence_level: float) -> Dict:
        """Determine investigation resources based on evidence"""
        if evidence_level > 0.8:
            return {'agents': 10, 'surveillance': True, 'warrants': True}
        elif evidence_level > 0.5:
            return {'agents': 5, 'surveillance': True, 'warrants': False}
        else:
            return {'agents': 2, 'surveillance': False, 'warrants': False}
            
    def recruit_informant(self, criminal_id: str, leverage: str):
        """Simulate informant recruitment"""
        self.informant_network[criminal_id] = {
            'leverage': leverage,
            'reliability': random.uniform(0.3, 0.9),
            'recruitment_date': datetime.now(),
            'intelligence_provided': 0
        }
        print(f"[LAW ENFORCEMENT] Informant recruited: {criminal_id}")

class UndergroundBankingSystem:
    """Simulated hawala and informal value transfer"""
    
    def __init__(self):
        self.hawala_dealers = {}
        self.transfer_codes = {}
        self.settlement_records = []
        
    def register_hawala_dealer(self, dealer_id: str, location: str, reputation: float):
        """Register underground banking dealer"""
        self.hawala_dealers[dealer_id] = {
            'location': location,
            'reputation': reputation,
            'outstanding_transfers': {},
            'settlement_history': []
        }
        
    def initiate_transfer(self, sender_id: str, recipient_id: str, amount: float, 
                         origin_dealer: str, destination_dealer: str) -> str:
        """Simulate hawala transfer"""
        transfer_code = hashlib.md5(f"{sender_id}{recipient_id}{time.time()}".encode()).hexdigest()[:8]
        
        self.transfer_codes[transfer_code] = {
            'sender': sender_id,
            'recipient': recipient_id,
            'amount': amount,
            'origin_dealer': origin_dealer,
            'destination_dealer': destination_dealer,
            'status': 'pending',
            'created': datetime.now()
        }
        
        print(f"[SIMULATION] Hawala transfer initiated: {transfer_code}")
        return transfer_code

class BlackMarketSimulator:
    """Main simulation engine for underground economy modeling"""
    
    def __init__(self):
        self.marketplaces: Dict[str, UndergroundMarketplace] = {}
        self.criminal_organizations: Dict[str, CriminalOrganization] = {}
        self.law_enforcement = LawEnforcementSystem()
        self.underground_banking = UndergroundBankingSystem()
        self.global_heat_level = 0.0
        self.simulation_log = []
        
    def create_marketplace(self, name: str, security_level: RiskLevel) -> UndergroundMarketplace:
        """Create simulated underground marketplace"""
        marketplace = UndergroundMarketplace(name, security_level)
        self.marketplaces[name] = marketplace
        
        # Log for educational analysis
        self.simulation_log.append({
            'event': 'marketplace_created',
            'name': name,
            'security_level': security_level.value,
            'timestamp': datetime.now().isoformat()
        })
        
        return marketplace
        
    def initialize_contraband_catalog(self):
        """Initialize simulated contraband goods for educational purposes"""
        contraband_items = [
            BlackMarketGood("drugs_cocaine", "Cocaine", "narcotics", 100.0, 3.0, 0.7, 0.8, 0.3),
            BlackMarketGood("weapons_ak47", "AK-47", "weapons", 1500.0, 2.5, 0.8, 0.6, 0.2),
            BlackMarketGood("counterfeit_currency", "Fake USD", "counterfeit", 50.0, 4.0, 0.9, 0.9, 0.1),
            BlackMarketGood("stolen_data", "Credit Card Data", "data", 10.0, 2.0, 0.5, 0.7, 0.4),
            BlackMarketGood("hacking_services", "DDoS Attack", "services", 500.0, 2.8, 0.6, 0.5, 0.3)
        ]
        
        print("[EDUCATIONAL] Initializing contraband catalog for simulation")
        print("These items represent common black market goods for academic study")
        
        return contraband_items
        
    def run_market_simulation(self, days: int = 30):
        """Run comprehensive underground economy simulation"""
        print(f"[SIMULATION START] Running {days}-day black market simulation")
        print("This is educational modeling for law enforcement training")
        
        # Initialize simulation components
        contraband_items = self.initialize_contraband_catalog()
        
        # Create sample marketplaces
        silk_road_sim = self.create_marketplace("SilkRoad_Sim", RiskLevel.HIGH)
        dream_market_sim = self.create_marketplace("DreamMarket_Sim", RiskLevel.MEDIUM)
        
        # Add contraband to marketplaces
        for item in contraband_items:
            silk_road_sim.add_contraband_good(item)
            dream_market_sim.add_contraband_good(item)
            
        # Create criminal organizations
        self.criminal_organizations["cartel_alpha"] = CriminalOrganization(
            "Alpha Cartel", "South America", "drug_trafficking"
        )
        
        # Simulate daily activity
        for day in range(days):
            self._simulate_daily_activity(day)
            
        # Generate comprehensive analysis report
        return self._generate_simulation_report()
        
    def _simulate_daily_activity(self, day: int):
        """Simulate one day of black market activity"""
        # Random transactions
        for marketplace_name, marketplace in self.marketplaces.items():
            num_transactions = random.randint(5, 20)
            
            for _ in range(num_transactions):
                # Simulate buyer and seller
                buyer_id = f"buyer_{random.randint(1000, 9999)}"
                seller_id = f"vendor_{random.randint(100, 999)}"
                
                # Random good and quantity
                if marketplace.goods_catalog:
                    good_id = random.choice(list(marketplace.goods_catalog.keys()))
                    quantity = random.randint(1, 10)
                    
                    transaction = marketplace.simulate_transaction(
                        buyer_id, seller_id, good_id, quantity
                    )
                    
                    # Chance of law enforcement detection
                    if transaction and random.random() < 0.1:
                        self.law_enforcement.initiate_investigation(
                            seller_id, random.uniform(0.3, 0.9)
                        )
                        
    def _generate_simulation_report(self) -> Dict:
        """Generate comprehensive simulation analysis"""
        total_transactions = sum(len(mp.transactions) for mp in self.marketplaces.values())
        total_investigations = len(self.law_enforcement.active_investigations)
        
        report = {
            'simulation_summary': {
                'total_marketplaces': len(self.marketplaces),
                'total_transactions': total_transactions,
                'total_investigations': total_investigations,
                'global_heat_level': self.global_heat_level
            },
            'marketplace_analysis': {},
            'law_enforcement_effectiveness': self._calculate_enforcement_effectiveness(),
            'educational_insights': self._generate_educational_insights()
        }
        
        # Analyze each marketplace
        for name, marketplace in self.marketplaces.items():
            report['marketplace_analysis'][name] = {
                'transaction_count': len(marketplace.transactions),
                'total_volume': sum(txn.price for txn in marketplace.transactions),
                'detection_status': marketplace.detection_status.value,
                'law_enforcement_heat': marketplace.law_enforcement_heat
            }
            
        return report
        
    def _calculate_enforcement_effectiveness(self) -> Dict:
        """Calculate law enforcement simulation effectiveness"""
        active_investigations = len(self.law_enforcement.active_investigations)
        total_criminals = sum(len(org.hierarchy['soldiers']) + len(org.hierarchy['associates']) 
                            for org in self.criminal_organizations.values())
        
        if total_criminals > 0:
            investigation_rate = active_investigations / total_criminals
        else:
            investigation_rate = 0
            
        return {
            'investigation_rate': investigation_rate,
            'active_investigations': active_investigations,
            'informant_network_size': len(self.law_enforcement.informant_network),
            'detection_effectiveness': min(investigation_rate * 2, 1.0)
        }
        
    def _generate_educational_insights(self) -> List[str]:
        """Generate educational insights from simulation"""
        return [
            "Underground markets rely heavily on anonymity and reputation systems",
            "Law enforcement effectiveness depends on intelligence gathering and informants",
            "Economic incentives drive both criminal activity and enforcement efforts",
            "Technology creates new opportunities and challenges for both sides",
            "International cooperation is essential for combating transnational crime",
            "Prevention through legitimate alternatives reduces black market demand",
            "Financial tracking is crucial for disrupting criminal organizations"
        ]

def main():
    """Main simulation entry point for educational purposes"""
    print("=" * 70)
    print("BLACK MARKET SIMULATION - EDUCATIONAL FRAMEWORK")
    print("For law enforcement training and academic research only")
    print("=" * 70)
    
    simulator = BlackMarketSimulator()
    
    # Run comprehensive simulation
    report = simulator.run_market_simulation(days=30)
    
    # Display results
    print("\n[SIMULATION COMPLETE]")
    print(f"Marketplaces analyzed: {report['simulation_summary']['total_marketplaces']}")
    print(f"Transactions simulated: {report['simulation_summary']['total_transactions']}")
    print(f"Investigations triggered: {report['simulation_summary']['total_investigations']}")
    
    print("\n[EDUCATIONAL INSIGHTS]")
    for insight in report['educational_insights']:
        print(f"- {insight}")
        
    print("\n[DISCLAIMER]")
    print("This simulation is for educational purposes only.")
    print("Real criminal activities are illegal and harmful to society.")
    print("Use this knowledge to support law enforcement and crime prevention.")
    
    return report

if __name__ == "__main__":
    main()
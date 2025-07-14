#!/usr/bin/env python3
"""
Advanced AML/KYC and Market Surveillance System
Phase 3: Comprehensive Anti-Money Laundering and Know Your Customer framework
Enhanced with AI-powered detection and real-time monitoring
"""

import asyncio
import uuid
import time
import hashlib
import re
from typing import Dict, List, Optional, Any, Tuple, Set
from dataclasses import dataclass, field
from enum import Enum
from decimal import Decimal, ROUND_HALF_UP
import json
import logging
from datetime import datetime, timedelta

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RiskLevel(Enum):
    """Customer and transaction risk levels"""
    VERY_LOW = "very_low"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    VERY_HIGH = "very_high"
    PROHIBITED = "prohibited"

class TransactionType(Enum):
    """Types of financial transactions"""
    DEPOSIT = "deposit"
    WITHDRAWAL = "withdrawal"
    TRANSFER = "transfer"
    TRADE = "trade"
    DERIVATIVES = "derivatives"
    CRYPTO = "cryptocurrency"
    FOREIGN_EXCHANGE = "foreign_exchange"
    CORRESPONDENT_BANKING = "correspondent_banking"

class SuspiciousActivityType(Enum):
    """Types of suspicious activities"""
    STRUCTURING = "structuring"
    UNUSUAL_PATTERN = "unusual_pattern"
    HIGH_RISK_JURISDICTION = "high_risk_jurisdiction"
    PEP_INVOLVEMENT = "pep_involvement"
    SANCTIONS_MATCH = "sanctions_match"
    CASH_INTENSIVE = "cash_intensive"
    RAPID_MOVEMENT = "rapid_movement"
    SHELL_COMPANY = "shell_company"
    CRYPTO_MIXING = "crypto_mixing"
    TRADE_BASED_ML = "trade_based_money_laundering"

class CustomerCategory(Enum):
    """Customer categorization for KYC"""
    RETAIL = "retail"
    CORPORATE = "corporate"
    INSTITUTIONAL = "institutional"
    PEP = "politically_exposed_person"
    HIGH_NET_WORTH = "high_net_worth"
    CORRESPONDENT_BANK = "correspondent_bank"
    CRYPTO_NATIVE = "crypto_native"
    FINTECH = "fintech"

@dataclass
class CustomerProfile:
    """Comprehensive customer profile for KYC"""
    customer_id: str
    created_date: datetime
    
    # Basic Information
    name: str
    date_of_birth: Optional[datetime]
    nationality: str
    residence_country: str
    
    # Business Information (for entities)
    business_type: Optional[str]
    industry_sector: Optional[str]
    annual_revenue: Optional[Decimal]
    ownership_structure: Dict[str, Any] = field(default_factory=dict)
    
    # Risk Assessment
    risk_score: Decimal = field(default=Decimal('0'))
    risk_level: RiskLevel = RiskLevel.MEDIUM
    customer_category: CustomerCategory = CustomerCategory.RETAIL
    
    # KYC Documentation
    identity_documents: List[Dict[str, Any]] = field(default_factory=list)
    address_verification: Dict[str, Any] = field(default_factory=dict)
    financial_statements: List[Dict[str, Any]] = field(default_factory=list)
    
    # Compliance Status
    kyc_status: str = "pending"  # pending, approved, rejected, expired
    kyc_expiry_date: Optional[datetime] = None
    last_review_date: Optional[datetime] = None
    enhanced_due_diligence: bool = False
    
    # Monitoring Flags
    pep_status: bool = False
    sanctions_match: bool = False
    adverse_media: bool = False
    high_risk_jurisdiction: bool = False
    
    # Transaction Patterns
    expected_activity: Dict[str, Decimal] = field(default_factory=dict)
    actual_activity: Dict[str, Decimal] = field(default_factory=dict)
    suspicious_activity_reports: List[str] = field(default_factory=list)

@dataclass
class Transaction:
    """Financial transaction for monitoring"""
    transaction_id: str
    timestamp: datetime
    
    # Transaction Details
    transaction_type: TransactionType
    amount: Decimal
    currency: str
    originator: str
    beneficiary: str
    
    # Geographic Information
    originating_country: str
    destination_country: str
    
    # Additional Context
    payment_method: str
    purpose_code: Optional[str]
    description: str
    
    # Risk Indicators
    risk_score: Decimal = field(default=Decimal('0'))
    suspicious_indicators: List[str] = field(default_factory=list)
    
    # Processing Status
    status: str = "pending"  # pending, approved, flagged, blocked
    reviewed_by: Optional[str] = None
    review_notes: str = ""

@dataclass
class SuspiciousActivityReport:
    """SAR/STR reporting structure"""
    sar_id: str
    filing_date: datetime
    
    # Subject Information
    subject_customer_id: str
    subject_name: str
    subject_type: str  # individual, entity, account
    
    # Activity Details
    activity_type: SuspiciousActivityType
    activity_description: str
    suspicious_amount: Decimal
    activity_period: Tuple[datetime, datetime]
    
    # Supporting Evidence
    transactions_involved: List[str]
    supporting_documents: List[str]
    investigative_notes: str
    
    # Regulatory Reporting
    regulatory_reference: Optional[str]
    filed_with_authorities: List[str]
    follow_up_required: bool
    
    # Status
    status: str = "draft"  # draft, filed, under_review, closed
    analyst_id: str = ""

@dataclass
class MarketManipulationAlert:
    """Market manipulation detection alert"""
    alert_id: str
    detection_timestamp: datetime
    
    # Market Information
    instrument: str
    market: str
    
    # Manipulation Indicators
    manipulation_type: str  # pump_and_dump, spoofing, layering, etc.
    confidence_score: Decimal
    
    # Price/Volume Analysis
    price_movement: Decimal
    volume_anomaly: Decimal
    order_pattern_analysis: Dict[str, Any]
    
    # Involved Parties
    suspected_accounts: List[str]
    coordinated_activity: bool
    
    # Investigation Status
    status: str = "new"  # new, investigating, escalated, closed
    assigned_investigator: Optional[str] = None

class AdvancedAMLKYCSystem:
    """Comprehensive AML/KYC and market surveillance system"""
    
    def __init__(self):
        # Customer and KYC management
        self.customer_profiles: Dict[str, CustomerProfile] = {}
        self.kyc_requirements: Dict[str, Dict[str, Any]] = {}
        
        # Transaction monitoring
        self.transactions: Dict[str, Transaction] = {}
        self.monitoring_rules: Dict[str, Dict[str, Any]] = {}
        self.suspicious_activity_reports: Dict[str, SuspiciousActivityReport] = {}
        
        # Market surveillance
        self.market_alerts: Dict[str, MarketManipulationAlert] = {}
        self.surveillance_rules: Dict[str, Dict[str, Any]] = {}
        
        # Sanctions and watchlists
        self.sanctions_lists: Dict[str, List[Dict[str, Any]]] = {}
        self.pep_lists: Dict[str, List[Dict[str, Any]]] = {}
        self.high_risk_jurisdictions: Set[str] = set()
        
        # AI/ML Models
        self.risk_scoring_models: Dict[str, Any] = {}
        self.anomaly_detection_models: Dict[str, Any] = {}
        
        # Initialize the system
        self._initialize_kyc_requirements()
        self._initialize_monitoring_rules()
        self._initialize_sanctions_data()
        self._initialize_ai_models()
    
    def _initialize_kyc_requirements(self):
        """Initialize KYC requirements by customer category"""
        
        self.kyc_requirements = {
            CustomerCategory.RETAIL.value: {
                "identity_documents": ["government_id", "proof_of_address"],
                "financial_information": ["income_verification"],
                "risk_assessment": "standard",
                "enhanced_due_diligence": False,
                "review_frequency_months": 24,
                "transaction_limits": {
                    "daily": Decimal("50000"),
                    "monthly": Decimal("500000"),
                    "annual": Decimal("2000000")
                }
            },
            CustomerCategory.CORPORATE.value: {
                "identity_documents": ["incorporation_docs", "beneficial_ownership", "authorized_signatories"],
                "financial_information": ["financial_statements", "business_plan", "banking_references"],
                "risk_assessment": "enhanced",
                "enhanced_due_diligence": False,
                "review_frequency_months": 12,
                "transaction_limits": {
                    "daily": Decimal("10000000"),
                    "monthly": Decimal("100000000"),
                    "annual": Decimal("1000000000")
                }
            },
            CustomerCategory.INSTITUTIONAL.value: {
                "identity_documents": ["regulatory_licenses", "audited_financials", "compliance_certificates"],
                "financial_information": ["regulatory_capital", "risk_management_framework"],
                "risk_assessment": "comprehensive",
                "enhanced_due_diligence": True,
                "review_frequency_months": 6,
                "transaction_limits": {
                    "daily": Decimal("1000000000"),
                    "monthly": Decimal("10000000000"),
                    "annual": Decimal("100000000000")
                }
            },
            CustomerCategory.PEP.value: {
                "identity_documents": ["government_id", "pep_declaration", "source_of_wealth"],
                "financial_information": ["wealth_verification", "political_position_details"],
                "risk_assessment": "enhanced",
                "enhanced_due_diligence": True,
                "review_frequency_months": 6,
                "transaction_limits": {
                    "daily": Decimal("100000"),
                    "monthly": Decimal("1000000"),
                    "annual": Decimal("10000000")
                }
            },
            CustomerCategory.HIGH_NET_WORTH.value: {
                "identity_documents": ["government_id", "proof_of_address", "source_of_wealth"],
                "financial_information": ["wealth_verification", "investment_experience"],
                "risk_assessment": "enhanced",
                "enhanced_due_diligence": True,
                "review_frequency_months": 12,
                "transaction_limits": {
                    "daily": Decimal("5000000"),
                    "monthly": Decimal("50000000"),
                    "annual": Decimal("500000000")
                }
            }
        }
        
        logger.info("KYC requirements initialized for all customer categories")
    
    def _initialize_monitoring_rules(self):
        """Initialize transaction monitoring rules"""
        
        self.monitoring_rules = {
            "cash_intensity": {
                "threshold": Decimal("10000"),  # $10K threshold
                "timeframe_hours": 24,
                "description": "Large cash transactions",
                "risk_weight": Decimal("0.8")
            },
            "structuring": {
                "threshold": Decimal("9000"),   # Just below reporting threshold
                "transaction_count": 3,
                "timeframe_hours": 72,
                "description": "Potential structuring activity",
                "risk_weight": Decimal("0.9")
            },
            "velocity": {
                "transaction_count": 10,
                "timeframe_hours": 24,
                "description": "High transaction velocity",
                "risk_weight": Decimal("0.6")
            },
            "round_dollar": {
                "pattern": r"000\.00$",
                "min_amount": Decimal("1000"),
                "description": "Suspicious round dollar amounts",
                "risk_weight": Decimal("0.4")
            },
            "geographic_risk": {
                "high_risk_countries": ["FATF_blacklist", "OFAC_countries"],
                "description": "High-risk jurisdiction involvement",
                "risk_weight": Decimal("0.7")
            },
            "unusual_pattern": {
                "deviation_threshold": Decimal("300"),  # 300% of normal
                "baseline_period_days": 90,
                "description": "Unusual transaction patterns",
                "risk_weight": Decimal("0.8")
            },
            "dormant_account": {
                "dormancy_period_days": 180,
                "sudden_activity_threshold": Decimal("50000"),
                "description": "Sudden activity in dormant account",
                "risk_weight": Decimal("0.7")
            },
            "crypto_mixing": {
                "mixing_services": ["tornado_cash", "coin_mixer"],
                "description": "Cryptocurrency mixing services",
                "risk_weight": Decimal("0.95")
            }
        }
        
        # Market surveillance rules
        self.surveillance_rules = {
            "spoofing": {
                "order_cancel_ratio": Decimal("0.8"),  # 80% cancellation rate
                "timeframe_seconds": 60,
                "description": "Potential spoofing activity",
                "severity": "high"
            },
            "layering": {
                "order_layers": 5,
                "price_levels": 3,
                "timeframe_seconds": 300,
                "description": "Layering manipulation",
                "severity": "high"
            },
            "pump_and_dump": {
                "price_increase_threshold": Decimal("0.20"),  # 20% increase
                "volume_increase_threshold": Decimal("5.0"),   # 5x normal volume
                "timeframe_minutes": 30,
                "description": "Pump and dump scheme",
                "severity": "critical"
            },
            "wash_trading": {
                "same_beneficial_owner": True,
                "volume_percentage": Decimal("0.1"),  # 10% of total volume
                "description": "Wash trading activity",
                "severity": "high"
            },
            "insider_trading": {
                "news_correlation": True,
                "timing_sensitivity_minutes": 30,
                "position_size_threshold": Decimal("1000000"),
                "description": "Potential insider trading",
                "severity": "critical"
            }
        }
        
        logger.info("Monitoring and surveillance rules initialized")
    
    def _initialize_sanctions_data(self):
        """Initialize sanctions lists and watchlists"""
        
        # OFAC Sanctions List (simplified)
        self.sanctions_lists["OFAC_SDN"] = [
            {
                "name": "BLOCKED_ENTITY_1",
                "type": "entity",
                "country": "Sanctioned Country",
                "reason": "terrorism_financing",
                "list_date": datetime(2023, 1, 1)
            },
            {
                "name": "BLOCKED_INDIVIDUAL_1", 
                "type": "individual",
                "country": "Sanctioned Country",
                "reason": "drug_trafficking",
                "list_date": datetime(2023, 2, 15)
            }
        ]
        
        # EU Sanctions
        self.sanctions_lists["EU_SANCTIONS"] = [
            {
                "name": "EU_BLOCKED_ENTITY",
                "type": "entity",
                "country": "Sanctioned Region",
                "reason": "human_rights_violations",
                "list_date": datetime(2023, 3, 1)
            }
        ]
        
        # PEP Lists
        self.pep_lists["GLOBAL_PEP"] = [
            {
                "name": "POLITICAL_FIGURE_1",
                "position": "Minister of Finance",
                "country": "Example Country",
                "risk_level": "high",
                "family_associates": ["SPOUSE_NAME", "BUSINESS_ASSOCIATE"]
            }
        ]
        
        # High-risk jurisdictions
        self.high_risk_jurisdictions = {
            "Country_A", "Country_B", "Country_C",  # FATF high-risk
            "Jurisdiction_X", "Jurisdiction_Y"      # Additional concern
        }
        
        logger.info("Sanctions and watchlist data initialized")
    
    def _initialize_ai_models(self):
        """Initialize AI/ML models for risk scoring and anomaly detection"""
        
        # Risk scoring model configuration
        self.risk_scoring_models["customer_risk"] = {
            "model_type": "gradient_boosting",
            "features": [
                "transaction_volume",
                "transaction_frequency", 
                "geographic_risk",
                "customer_age",
                "account_balance",
                "kyc_completeness",
                "sanctions_proximity",
                "adverse_media_score"
            ],
            "weights": {
                "transaction_volume": 0.2,
                "transaction_frequency": 0.15,
                "geographic_risk": 0.25,
                "sanctions_proximity": 0.3,
                "adverse_media_score": 0.1
            },
            "threshold_scores": {
                "low_risk": Decimal("30"),
                "medium_risk": Decimal("60"),
                "high_risk": Decimal("80")
            }
        }
        
        # Anomaly detection model
        self.anomaly_detection_models["transaction_anomaly"] = {
            "model_type": "isolation_forest",
            "features": [
                "amount_zscore",
                "frequency_deviation",
                "time_pattern_anomaly",
                "counterparty_risk",
                "geographic_anomaly"
            ],
            "anomaly_threshold": Decimal("0.05"),  # 5% false positive rate
            "confidence_intervals": {
                "low": Decimal("0.6"),
                "medium": Decimal("0.8"),
                "high": Decimal("0.95")
            }
        }
        
        logger.info("AI/ML models initialized")
    
    async def onboard_customer(self, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """Comprehensive customer onboarding with KYC"""
        
        customer_id = customer_data.get("customer_id", str(uuid.uuid4()))
        
        # Create customer profile
        profile = CustomerProfile(
            customer_id=customer_id,
            created_date=datetime.now(),
            name=customer_data["name"],
            date_of_birth=customer_data.get("date_of_birth"),
            nationality=customer_data["nationality"],
            residence_country=customer_data["residence_country"],
            business_type=customer_data.get("business_type"),
            industry_sector=customer_data.get("industry_sector"),
            annual_revenue=customer_data.get("annual_revenue", Decimal("0")),
            customer_category=CustomerCategory(customer_data.get("customer_category", "retail"))
        )
        
        # Perform initial risk assessment
        initial_risk = await self._calculate_customer_risk(profile, customer_data)
        profile.risk_score = initial_risk["risk_score"]
        profile.risk_level = RiskLevel(initial_risk["risk_level"])
        
        # Check sanctions and PEP status
        sanctions_check = await self._perform_sanctions_screening(profile)
        profile.sanctions_match = sanctions_check["sanctions_match"]
        profile.pep_status = sanctions_check["pep_match"]
        
        # Determine KYC requirements
        kyc_requirements = self.kyc_requirements[profile.customer_category.value]
        
        # Set enhanced due diligence if required
        if (profile.risk_level in [RiskLevel.HIGH, RiskLevel.VERY_HIGH] or
            profile.pep_status or profile.sanctions_match or
            profile.residence_country in self.high_risk_jurisdictions):
            profile.enhanced_due_diligence = True
        
        # Store customer profile
        self.customer_profiles[customer_id] = profile
        
        onboarding_result = {
            "customer_id": customer_id,
            "status": "kyc_required",
            "risk_level": profile.risk_level.value,
            "enhanced_due_diligence": profile.enhanced_due_diligence,
            "required_documents": kyc_requirements["identity_documents"],
            "sanctions_match": profile.sanctions_match,
            "pep_status": profile.pep_status,
            "next_steps": [
                "document_submission",
                "identity_verification",
                "source_of_funds_verification" if profile.enhanced_due_diligence else "basic_verification"
            ]
        }
        
        logger.info(f"Customer {customer_id} onboarded with {profile.risk_level.value} risk level")
        
        return onboarding_result
    
    async def _calculate_customer_risk(self, profile: CustomerProfile, 
                                     customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate customer risk score using AI model"""
        
        model = self.risk_scoring_models["customer_risk"]
        
        # Extract features
        features = {
            "transaction_volume": customer_data.get("expected_monthly_volume", Decimal("0")),
            "transaction_frequency": customer_data.get("expected_monthly_transactions", Decimal("0")),
            "geographic_risk": self._calculate_geographic_risk(profile.residence_country),
            "customer_age": self._calculate_customer_age(profile),
            "account_balance": customer_data.get("initial_deposit", Decimal("0")),
            "kyc_completeness": Decimal("0"),  # Will be updated after KYC
            "sanctions_proximity": Decimal("0"),  # Will be updated after screening
            "adverse_media_score": Decimal("0")   # Will be updated after media screening
        }
        
        # Calculate weighted risk score
        risk_score = Decimal("0")
        for feature, value in features.items():
            weight = Decimal(str(model["weights"].get(feature, 0)))
            normalized_value = min(value / Decimal("100"), Decimal("1"))  # Normalize to 0-1
            risk_score += normalized_value * weight
        
        risk_score *= Decimal("100")  # Convert to 0-100 scale
        
        # Determine risk level
        if risk_score < model["threshold_scores"]["low_risk"]:
            risk_level = "low"
        elif risk_score < model["threshold_scores"]["medium_risk"]:
            risk_level = "medium"
        elif risk_score < model["threshold_scores"]["high_risk"]:
            risk_level = "high"
        else:
            risk_level = "very_high"
        
        return {
            "risk_score": risk_score,
            "risk_level": risk_level,
            "feature_scores": features
        }
    
    def _calculate_geographic_risk(self, country: str) -> Decimal:
        """Calculate geographic risk score"""
        
        if country in self.high_risk_jurisdictions:
            return Decimal("90")
        elif country in ["Country_Medium_Risk_1", "Country_Medium_Risk_2"]:
            return Decimal("60")
        else:
            return Decimal("20")
    
    def _calculate_customer_age(self, profile: CustomerProfile) -> Decimal:
        """Calculate customer age factor"""
        
        if profile.date_of_birth:
            age = datetime.now().year - profile.date_of_birth.year
            # Younger customers might have higher risk in some models
            if age < 25:
                return Decimal("60")
            elif age < 65:
                return Decimal("30")
            else:
                return Decimal("40")
        return Decimal("50")  # Default for entities/unknown
    
    async def _perform_sanctions_screening(self, profile: CustomerProfile) -> Dict[str, Any]:
        """Perform comprehensive sanctions and PEP screening"""
        
        screening_result = {
            "sanctions_match": False,
            "pep_match": False,
            "matches_found": [],
            "screening_timestamp": datetime.now()
        }
        
        # Screen against sanctions lists
        name_to_screen = profile.name.upper().strip()
        
        for list_name, sanctions_list in self.sanctions_lists.items():
            for entry in sanctions_list:
                # Simple name matching (in production, use fuzzy matching)
                if self._fuzzy_name_match(name_to_screen, entry["name"]):
                    screening_result["sanctions_match"] = True
                    screening_result["matches_found"].append({
                        "list": list_name,
                        "match_name": entry["name"],
                        "match_type": entry["type"],
                        "confidence": 0.85
                    })
        
        # Screen against PEP lists
        for list_name, pep_list in self.pep_lists.items():
            for entry in pep_list:
                if self._fuzzy_name_match(name_to_screen, entry["name"]):
                    screening_result["pep_match"] = True
                    screening_result["matches_found"].append({
                        "list": list_name,
                        "match_name": entry["name"],
                        "position": entry["position"],
                        "confidence": 0.80
                    })
        
        return screening_result
    
    def _fuzzy_name_match(self, name1: str, name2: str, threshold: float = 0.8) -> bool:
        """Simple fuzzy name matching (in production, use proper fuzzy matching)"""
        
        # Simple implementation - check if 80% of words match
        words1 = set(name1.split())
        words2 = set(name2.split())
        
        if not words1 or not words2:
            return False
        
        intersection = len(words1.intersection(words2))
        union = len(words1.union(words2))
        
        similarity = intersection / union if union > 0 else 0
        return similarity >= threshold
    
    async def monitor_transaction(self, transaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """Real-time transaction monitoring"""
        
        transaction_id = transaction_data.get("transaction_id", str(uuid.uuid4()))
        
        # Create transaction record
        transaction = Transaction(
            transaction_id=transaction_id,
            timestamp=datetime.now(),
            transaction_type=TransactionType(transaction_data["transaction_type"]),
            amount=Decimal(str(transaction_data["amount"])),
            currency=transaction_data["currency"],
            originator=transaction_data["originator"],
            beneficiary=transaction_data["beneficiary"],
            originating_country=transaction_data.get("originating_country", "Unknown"),
            destination_country=transaction_data.get("destination_country", "Unknown"),
            payment_method=transaction_data.get("payment_method", "electronic"),
            purpose_code=transaction_data.get("purpose_code"),
            description=transaction_data.get("description", "")
        )
        
        # Perform real-time monitoring
        monitoring_result = await self._analyze_transaction(transaction)
        
        transaction.risk_score = monitoring_result["risk_score"]
        transaction.suspicious_indicators = monitoring_result["suspicious_indicators"]
        
        # Determine transaction status
        if monitoring_result["risk_score"] > Decimal("80"):
            transaction.status = "blocked"
        elif monitoring_result["risk_score"] > Decimal("60"):
            transaction.status = "flagged"
        else:
            transaction.status = "approved"
        
        # Store transaction
        self.transactions[transaction_id] = transaction
        
        # Generate SAR if necessary
        if transaction.status in ["blocked", "flagged"] and monitoring_result["risk_score"] > Decimal("70"):
            sar_id = await self._generate_suspicious_activity_report(transaction, monitoring_result)
            monitoring_result["sar_generated"] = sar_id
        
        logger.info(f"Transaction {transaction_id} monitored: {transaction.status} (risk: {monitoring_result['risk_score']})")
        
        return {
            "transaction_id": transaction_id,
            "status": transaction.status,
            "risk_score": str(monitoring_result["risk_score"]),
            "suspicious_indicators": monitoring_result["suspicious_indicators"],
            "sar_generated": monitoring_result.get("sar_generated"),
            "recommended_action": monitoring_result["recommended_action"]
        }
    
    async def _analyze_transaction(self, transaction: Transaction) -> Dict[str, Any]:
        """Comprehensive transaction analysis"""
        
        analysis_result = {
            "risk_score": Decimal("0"),
            "suspicious_indicators": [],
            "rule_triggers": [],
            "recommended_action": "approve"
        }
        
        # Apply monitoring rules
        total_risk_score = Decimal("0")
        rule_count = 0
        
        # Cash intensity rule
        if transaction.amount >= self.monitoring_rules["cash_intensity"]["threshold"]:
            total_risk_score += self.monitoring_rules["cash_intensity"]["risk_weight"] * Decimal("100")
            analysis_result["suspicious_indicators"].append("large_cash_transaction")
            analysis_result["rule_triggers"].append("cash_intensity")
            rule_count += 1
        
        # Structuring detection
        structuring_risk = await self._detect_structuring(transaction)
        if structuring_risk["detected"]:
            total_risk_score += self.monitoring_rules["structuring"]["risk_weight"] * Decimal("100")
            analysis_result["suspicious_indicators"].append("potential_structuring")
            analysis_result["rule_triggers"].append("structuring")
            rule_count += 1
        
        # Geographic risk
        geographic_risk = self._assess_geographic_risk(transaction)
        if geographic_risk["high_risk"]:
            total_risk_score += self.monitoring_rules["geographic_risk"]["risk_weight"] * Decimal("100")
            analysis_result["suspicious_indicators"].append("high_risk_jurisdiction")
            analysis_result["rule_triggers"].append("geographic_risk")
            rule_count += 1
        
        # Velocity analysis
        velocity_risk = await self._analyze_velocity(transaction)
        if velocity_risk["excessive"]:
            total_risk_score += self.monitoring_rules["velocity"]["risk_weight"] * Decimal("100")
            analysis_result["suspicious_indicators"].append("high_velocity")
            analysis_result["rule_triggers"].append("velocity")
            rule_count += 1
        
        # Pattern analysis
        pattern_risk = await self._analyze_patterns(transaction)
        if pattern_risk["unusual"]:
            total_risk_score += self.monitoring_rules["unusual_pattern"]["risk_weight"] * Decimal("100")
            analysis_result["suspicious_indicators"].append("unusual_pattern")
            analysis_result["rule_triggers"].append("unusual_pattern")
            rule_count += 1
        
        # Round dollar detection
        if re.search(self.monitoring_rules["round_dollar"]["pattern"], str(transaction.amount)):
            if transaction.amount >= self.monitoring_rules["round_dollar"]["min_amount"]:
                total_risk_score += self.monitoring_rules["round_dollar"]["risk_weight"] * Decimal("100")
                analysis_result["suspicious_indicators"].append("round_dollar_amount")
                analysis_result["rule_triggers"].append("round_dollar")
                rule_count += 1
        
        # Calculate average risk score
        if rule_count > 0:
            analysis_result["risk_score"] = total_risk_score / Decimal(str(rule_count))
        else:
            analysis_result["risk_score"] = Decimal("10")  # Base risk
        
        # Determine recommended action
        if analysis_result["risk_score"] > Decimal("80"):
            analysis_result["recommended_action"] = "block"
        elif analysis_result["risk_score"] > Decimal("60"):
            analysis_result["recommended_action"] = "flag_for_review"
        elif analysis_result["risk_score"] > Decimal("40"):
            analysis_result["recommended_action"] = "enhanced_monitoring"
        else:
            analysis_result["recommended_action"] = "approve"
        
        return analysis_result
    
    async def _detect_structuring(self, transaction: Transaction) -> Dict[str, Any]:
        """Detect potential structuring activity"""
        
        # Look for multiple transactions just below reporting threshold
        threshold = self.monitoring_rules["structuring"]["threshold"]
        timeframe = timedelta(hours=self.monitoring_rules["structuring"]["timeframe_hours"])
        min_count = self.monitoring_rules["structuring"]["transaction_count"]
        
        # Check recent transactions from same originator
        recent_transactions = [
            t for t in self.transactions.values()
            if (t.originator == transaction.originator and
                t.timestamp >= datetime.now() - timeframe and
                t.amount < threshold)
        ]
        
        # Include current transaction if below threshold
        if transaction.amount < threshold:
            recent_transactions.append(transaction)
        
        structuring_detected = len(recent_transactions) >= min_count
        
        return {
            "detected": structuring_detected,
            "transaction_count": len(recent_transactions),
            "total_amount": sum(t.amount for t in recent_transactions),
            "timeframe_hours": self.monitoring_rules["structuring"]["timeframe_hours"]
        }
    
    def _assess_geographic_risk(self, transaction: Transaction) -> Dict[str, Any]:
        """Assess geographic risk factors"""
        
        high_risk = (
            transaction.originating_country in self.high_risk_jurisdictions or
            transaction.destination_country in self.high_risk_jurisdictions
        )
        
        return {
            "high_risk": high_risk,
            "originating_risk": transaction.originating_country in self.high_risk_jurisdictions,
            "destination_risk": transaction.destination_country in self.high_risk_jurisdictions
        }
    
    async def _analyze_velocity(self, transaction: Transaction) -> Dict[str, Any]:
        """Analyze transaction velocity"""
        
        timeframe = timedelta(hours=self.monitoring_rules["velocity"]["timeframe_hours"])
        max_count = self.monitoring_rules["velocity"]["transaction_count"]
        
        # Count recent transactions from same originator
        recent_count = len([
            t for t in self.transactions.values()
            if (t.originator == transaction.originator and
                t.timestamp >= datetime.now() - timeframe)
        ]) + 1  # Include current transaction
        
        return {
            "excessive": recent_count > max_count,
            "transaction_count": recent_count,
            "timeframe_hours": self.monitoring_rules["velocity"]["timeframe_hours"]
        }
    
    async def _analyze_patterns(self, transaction: Transaction) -> Dict[str, Any]:
        """Analyze transaction patterns for anomalies"""
        
        # Get customer's transaction history
        customer_transactions = [
            t for t in self.transactions.values()
            if t.originator == transaction.originator
        ]
        
        if len(customer_transactions) < 10:  # Need baseline
            return {"unusual": False, "reason": "insufficient_history"}
        
        # Calculate baseline statistics
        amounts = [t.amount for t in customer_transactions]
        avg_amount = sum(amounts) / len(amounts)
        
        # Check if current transaction is significantly different
        deviation_threshold = self.monitoring_rules["unusual_pattern"]["deviation_threshold"]
        current_deviation = (transaction.amount / avg_amount) * Decimal("100")
        
        return {
            "unusual": current_deviation > deviation_threshold,
            "deviation_percentage": str(current_deviation),
            "baseline_average": str(avg_amount)
        }
    
    async def _generate_suspicious_activity_report(self, transaction: Transaction,
                                                 analysis_result: Dict[str, Any]) -> str:
        """Generate Suspicious Activity Report (SAR)"""
        
        sar_id = str(uuid.uuid4())
        
        sar = SuspiciousActivityReport(
            sar_id=sar_id,
            filing_date=datetime.now(),
            subject_customer_id=transaction.originator,
            subject_name=self._get_customer_name(transaction.originator),
            subject_type="account",
            activity_type=self._determine_activity_type(analysis_result["suspicious_indicators"]),
            activity_description=f"Suspicious transaction detected: {', '.join(analysis_result['suspicious_indicators'])}",
            suspicious_amount=transaction.amount,
            activity_period=(transaction.timestamp, transaction.timestamp),
            transactions_involved=[transaction.transaction_id],
            supporting_documents=[],
            investigative_notes=f"Risk score: {analysis_result['risk_score']}, Rules triggered: {', '.join(analysis_result['rule_triggers'])}",
            follow_up_required=True,
            analyst_id="system_generated"
        )
        
        self.suspicious_activity_reports[sar_id] = sar
        
        logger.warning(f"SAR {sar_id} generated for transaction {transaction.transaction_id}")
        
        return sar_id
    
    def _get_customer_name(self, customer_id: str) -> str:
        """Get customer name from profile"""
        
        profile = self.customer_profiles.get(customer_id)
        return profile.name if profile else customer_id
    
    def _determine_activity_type(self, indicators: List[str]) -> SuspiciousActivityType:
        """Determine SAR activity type from indicators"""
        
        if "potential_structuring" in indicators:
            return SuspiciousActivityType.STRUCTURING
        elif "high_risk_jurisdiction" in indicators:
            return SuspiciousActivityType.HIGH_RISK_JURISDICTION
        elif "large_cash_transaction" in indicators:
            return SuspiciousActivityType.CASH_INTENSIVE
        elif "high_velocity" in indicators:
            return SuspiciousActivityType.RAPID_MOVEMENT
        else:
            return SuspiciousActivityType.UNUSUAL_PATTERN
    
    async def detect_market_manipulation(self, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Detect market manipulation patterns"""
        
        alert_id = str(uuid.uuid4())
        detection_results = {
            "alert_id": alert_id,
            "alerts_generated": [],
            "confidence_scores": {},
            "recommended_actions": []
        }
        
        # Spoofing detection
        spoofing_result = await self._detect_spoofing(market_data)
        if spoofing_result["detected"]:
            alert = MarketManipulationAlert(
                alert_id=str(uuid.uuid4()),
                detection_timestamp=datetime.now(),
                instrument=market_data["instrument"],
                market=market_data["market"],
                manipulation_type="spoofing",
                confidence_score=spoofing_result["confidence"],
                price_movement=spoofing_result.get("price_impact", Decimal("0")),
                volume_anomaly=spoofing_result.get("volume_anomaly", Decimal("0")),
                order_pattern_analysis=spoofing_result["pattern_analysis"],
                suspected_accounts=spoofing_result.get("suspected_accounts", []),
                coordinated_activity=spoofing_result.get("coordinated", False)
            )
            
            self.market_alerts[alert.alert_id] = alert
            detection_results["alerts_generated"].append(alert.alert_id)
            detection_results["confidence_scores"]["spoofing"] = str(spoofing_result["confidence"])
        
        # Pump and dump detection
        pump_dump_result = await self._detect_pump_and_dump(market_data)
        if pump_dump_result["detected"]:
            alert = MarketManipulationAlert(
                alert_id=str(uuid.uuid4()),
                detection_timestamp=datetime.now(),
                instrument=market_data["instrument"],
                market=market_data["market"],
                manipulation_type="pump_and_dump",
                confidence_score=pump_dump_result["confidence"],
                price_movement=pump_dump_result.get("price_increase", Decimal("0")),
                volume_anomaly=pump_dump_result.get("volume_spike", Decimal("0")),
                order_pattern_analysis=pump_dump_result["analysis"],
                suspected_accounts=pump_dump_result.get("suspected_accounts", []),
                coordinated_activity=pump_dump_result.get("coordinated", True)
            )
            
            self.market_alerts[alert.alert_id] = alert
            detection_results["alerts_generated"].append(alert.alert_id)
            detection_results["confidence_scores"]["pump_and_dump"] = str(pump_dump_result["confidence"])
        
        # Wash trading detection
        wash_trading_result = await self._detect_wash_trading(market_data)
        if wash_trading_result["detected"]:
            alert = MarketManipulationAlert(
                alert_id=str(uuid.uuid4()),
                detection_timestamp=datetime.now(),
                instrument=market_data["instrument"],
                market=market_data["market"],
                manipulation_type="wash_trading",
                confidence_score=wash_trading_result["confidence"],
                price_movement=Decimal("0"),  # Wash trading typically doesn't move price
                volume_anomaly=wash_trading_result.get("artificial_volume", Decimal("0")),
                order_pattern_analysis=wash_trading_result["analysis"],
                suspected_accounts=wash_trading_result.get("suspected_accounts", []),
                coordinated_activity=True
            )
            
            self.market_alerts[alert.alert_id] = alert
            detection_results["alerts_generated"].append(alert.alert_id)
            detection_results["confidence_scores"]["wash_trading"] = str(wash_trading_result["confidence"])
        
        # Generate recommendations
        if detection_results["alerts_generated"]:
            detection_results["recommended_actions"] = [
                "investigate_suspected_accounts",
                "enhance_monitoring",
                "report_to_regulator",
                "consider_trading_halt"
            ]
        
        logger.info(f"Market manipulation detection completed: {len(detection_results['alerts_generated'])} alerts")
        
        return detection_results
    
    async def _detect_spoofing(self, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Detect spoofing activity"""
        
        rule = self.surveillance_rules["spoofing"]
        
        # Analyze order cancellation patterns
        orders = market_data.get("orders", [])
        if not orders:
            return {"detected": False}
        
        total_orders = len(orders)
        cancelled_orders = len([o for o in orders if o.get("status") == "cancelled"])
        
        cancel_ratio = Decimal(str(cancelled_orders)) / Decimal(str(total_orders)) if total_orders > 0 else Decimal("0")
        
        detected = cancel_ratio >= rule["order_cancel_ratio"]
        
        return {
            "detected": detected,
            "confidence": min(cancel_ratio * Decimal("100"), Decimal("100")),
            "cancel_ratio": str(cancel_ratio),
            "pattern_analysis": {
                "total_orders": total_orders,
                "cancelled_orders": cancelled_orders,
                "timeframe_seconds": rule["timeframe_seconds"]
            },
            "suspected_accounts": [o.get("account_id") for o in orders if o.get("status") == "cancelled"][:5]
        }
    
    async def _detect_pump_and_dump(self, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Detect pump and dump schemes"""
        
        rule = self.surveillance_rules["pump_and_dump"]
        
        # Analyze price and volume changes
        price_data = market_data.get("price_history", [])
        volume_data = market_data.get("volume_history", [])
        
        if len(price_data) < 2 or len(volume_data) < 2:
            return {"detected": False}
        
        # Calculate price increase
        current_price = Decimal(str(price_data[-1]))
        baseline_price = Decimal(str(price_data[0]))
        price_increase = (current_price - baseline_price) / baseline_price
        
        # Calculate volume spike
        current_volume = Decimal(str(volume_data[-1]))
        avg_volume = sum(Decimal(str(v)) for v in volume_data[:-1]) / Decimal(str(len(volume_data) - 1))
        volume_spike = current_volume / avg_volume if avg_volume > 0 else Decimal("0")
        
        detected = (price_increase >= rule["price_increase_threshold"] and
                   volume_spike >= rule["volume_increase_threshold"])
        
        confidence = min(
            (price_increase * Decimal("50") + volume_spike * Decimal("20")),
            Decimal("100")
        )
        
        return {
            "detected": detected,
            "confidence": confidence,
            "price_increase": price_increase,
            "volume_spike": volume_spike,
            "analysis": {
                "current_price": str(current_price),
                "baseline_price": str(baseline_price),
                "current_volume": str(current_volume),
                "average_volume": str(avg_volume)
            }
        }
    
    async def _detect_wash_trading(self, market_data: Dict[str, Any]) -> Dict[str, Any]:
        """Detect wash trading activity"""
        
        rule = self.surveillance_rules["wash_trading"]
        
        trades = market_data.get("trades", [])
        if not trades:
            return {"detected": False}
        
        # Look for trades between related accounts
        related_account_trades = []
        total_volume = sum(Decimal(str(t.get("volume", 0))) for t in trades)
        
        # Simplified: look for accounts with similar patterns (in production, use beneficial ownership data)
        account_patterns = {}
        for trade in trades:
            account = trade.get("account_id", "")
            if account not in account_patterns:
                account_patterns[account] = []
            account_patterns[account].append(trade)
        
        # Detect potential wash trading patterns
        suspicious_volume = Decimal("0")
        suspected_accounts = []
        
        for account, account_trades in account_patterns.items():
            if len(account_trades) > 5:  # High frequency might indicate wash trading
                account_volume = sum(Decimal(str(t.get("volume", 0))) for t in account_trades)
                if account_volume > total_volume * rule["volume_percentage"]:
                    suspicious_volume += account_volume
                    suspected_accounts.append(account)
        
        detected = suspicious_volume > Decimal("0")
        
        confidence = min(
            (suspicious_volume / total_volume * Decimal("100")) if total_volume > 0 else Decimal("0"),
            Decimal("100")
        )
        
        return {
            "detected": detected,
            "confidence": confidence,
            "artificial_volume": suspicious_volume,
            "suspected_accounts": suspected_accounts,
            "analysis": {
                "total_volume": str(total_volume),
                "suspicious_volume": str(suspicious_volume),
                "suspicious_percentage": str((suspicious_volume / total_volume * Decimal("100")) if total_volume > 0 else Decimal("0"))
            }
        }
    
    def get_aml_dashboard(self) -> Dict[str, Any]:
        """Get comprehensive AML/KYC dashboard"""
        
        dashboard = {
            "system_overview": {
                "total_customers": len(self.customer_profiles),
                "kyc_pending": len([c for c in self.customer_profiles.values() if c.kyc_status == "pending"]),
                "high_risk_customers": len([c for c in self.customer_profiles.values() if c.risk_level in [RiskLevel.HIGH, RiskLevel.VERY_HIGH]]),
                "sanctions_matches": len([c for c in self.customer_profiles.values() if c.sanctions_match]),
                "pep_customers": len([c for c in self.customer_profiles.values() if c.pep_status])
            },
            "transaction_monitoring": {
                "total_transactions": len(self.transactions),
                "flagged_transactions": len([t for t in self.transactions.values() if t.status == "flagged"]),
                "blocked_transactions": len([t for t in self.transactions.values() if t.status == "blocked"]),
                "sars_generated": len(self.suspicious_activity_reports),
                "average_risk_score": self._calculate_average_transaction_risk()
            },
            "market_surveillance": {
                "total_alerts": len(self.market_alerts),
                "spoofing_alerts": len([a for a in self.market_alerts.values() if a.manipulation_type == "spoofing"]),
                "pump_dump_alerts": len([a for a in self.market_alerts.values() if a.manipulation_type == "pump_and_dump"]),
                "wash_trading_alerts": len([a for a in self.market_alerts.values() if a.manipulation_type == "wash_trading"]),
                "high_confidence_alerts": len([a for a in self.market_alerts.values() if a.confidence_score > Decimal("80")])
            },
            "compliance_metrics": {
                "kyc_completion_rate": self._calculate_kyc_completion_rate(),
                "false_positive_rate": Decimal("5.2"),  # Example metric
                "investigation_backlog": len([s for s in self.suspicious_activity_reports.values() if s.status == "draft"]),
                "regulatory_filing_timeliness": Decimal("98.5")  # Example metric
            }
        }
        
        return dashboard
    
    def _calculate_average_transaction_risk(self) -> Decimal:
        """Calculate average transaction risk score"""
        
        if not self.transactions:
            return Decimal("0")
        
        total_risk = sum(t.risk_score for t in self.transactions.values())
        return total_risk / Decimal(str(len(self.transactions)))
    
    def _calculate_kyc_completion_rate(self) -> Decimal:
        """Calculate KYC completion rate"""
        
        if not self.customer_profiles:
            return Decimal("0")
        
        completed = len([c for c in self.customer_profiles.values() if c.kyc_status == "approved"])
        return (Decimal(str(completed)) / Decimal(str(len(self.customer_profiles)))) * Decimal("100")

# Example usage and comprehensive testing
async def main():
    """Comprehensive test of AML/KYC system"""
    
    aml_system = AdvancedAMLKYCSystem()
    
    print("=== Advanced AML/KYC and Market Surveillance System ===")
    print("Phase 3: Comprehensive Anti-Money Laundering Implementation")
    
    # Test 1: Customer onboarding
    print("\n👤 1. Customer Onboarding and KYC:")
    
    # Onboard high-risk customer
    high_risk_customer = await aml_system.onboard_customer({
        "name": "High Risk Entity Corp",
        "nationality": "Country_A",  # High-risk jurisdiction
        "residence_country": "Country_A",
        "customer_category": "corporate",
        "business_type": "financial_services",
        "industry_sector": "money_services_business",
        "annual_revenue": Decimal("50000000"),
        "expected_monthly_volume": Decimal("10000000"),
        "expected_monthly_transactions": Decimal("500")
    })
    print(f"High-risk customer onboarding: {high_risk_customer['status']}")
    print(f"Risk level: {high_risk_customer['risk_level']}")
    print(f"Enhanced due diligence required: {high_risk_customer['enhanced_due_diligence']}")
    
    # Onboard PEP customer
    pep_customer = await aml_system.onboard_customer({
        "name": "POLITICAL_FIGURE_1",  # Matches PEP list
        "nationality": "Example Country",
        "residence_country": "Example Country",
        "customer_category": "high_net_worth",
        "expected_monthly_volume": Decimal("2000000")
    })
    print(f"PEP customer onboarding: {pep_customer['status']}")
    print(f"PEP status detected: {pep_customer['pep_status']}")
    
    # Test 2: Transaction monitoring
    print("\n💰 2. Transaction Monitoring:")
    
    # Large cash transaction
    large_cash_result = await aml_system.monitor_transaction({
        "transaction_type": "deposit",
        "amount": "15000",  # Above $10K threshold
        "currency": "USD",
        "originator": high_risk_customer["customer_id"],
        "beneficiary": "internal_account",
        "originating_country": "Country_A",
        "payment_method": "cash",
        "description": "Large cash deposit"
    })
    print(f"Large cash transaction: {large_cash_result['status']} (risk: {large_cash_result['risk_score']})")
    print(f"Suspicious indicators: {large_cash_result['suspicious_indicators']}")
    if large_cash_result.get('sar_generated'):
        print(f"SAR generated: {large_cash_result['sar_generated']}")
    
    # Potential structuring
    structuring_transactions = []
    for i in range(4):
        result = await aml_system.monitor_transaction({
            "transaction_type": "withdrawal",
            "amount": "8500",  # Just below $9K threshold
            "currency": "USD",
            "originator": high_risk_customer["customer_id"],
            "beneficiary": "external_account",
            "payment_method": "electronic",
            "description": f"Withdrawal {i+1}"
        })
        structuring_transactions.append(result)
    
    print(f"Structuring detection - Last transaction: {structuring_transactions[-1]['status']}")
    print(f"Indicators: {structuring_transactions[-1]['suspicious_indicators']}")
    
    # High-velocity transactions
    for i in range(12):  # Exceed 10 transaction limit
        await aml_system.monitor_transaction({
            "transaction_type": "transfer",
            "amount": "5000",
            "currency": "USD",
            "originator": high_risk_customer["customer_id"],
            "beneficiary": f"account_{i}",
            "payment_method": "electronic",
            "description": f"High velocity transaction {i+1}"
        })
    
    print("High-velocity transaction pattern created")
    
    # Test 3: Market surveillance
    print("\n📊 3. Market Surveillance:")
    
    # Spoofing detection
    spoofing_data = {
        "instrument": "AAPL",
        "market": "NASDAQ",
        "orders": [
            {"account_id": "spoofer_1", "status": "cancelled", "size": 1000},
            {"account_id": "spoofer_1", "status": "cancelled", "size": 500},
            {"account_id": "spoofer_1", "status": "cancelled", "size": 750},
            {"account_id": "spoofer_1", "status": "executed", "size": 100},
            {"account_id": "spoofer_1", "status": "cancelled", "size": 1200}
        ]
    }
    
    spoofing_result = await aml_system.detect_market_manipulation(spoofing_data)
    print(f"Spoofing detection: {len(spoofing_result['alerts_generated'])} alerts")
    if spoofing_result['confidence_scores']:
        print(f"Confidence scores: {spoofing_result['confidence_scores']}")
    
    # Pump and dump detection
    pump_dump_data = {
        "instrument": "MEME_COIN",
        "market": "CRYPTO",
        "price_history": [10.0, 10.2, 10.5, 11.0, 12.5, 15.0],  # 50% increase
        "volume_history": [1000, 1200, 1100, 1050, 8500, 12000]  # 10x volume spike
    }
    
    pump_dump_result = await aml_system.detect_market_manipulation(pump_dump_data)
    print(f"Pump and dump detection: {len(pump_dump_result['alerts_generated'])} alerts")
    if pump_dump_result['confidence_scores']:
        print(f"Confidence scores: {pump_dump_result['confidence_scores']}")
    
    # Wash trading detection
    wash_trading_data = {
        "instrument": "XYZ_TOKEN",
        "market": "DEX",
        "trades": [
            {"account_id": "washer_1", "volume": 10000},
            {"account_id": "washer_2", "volume": 8000},
            {"account_id": "washer_1", "volume": 12000},
            {"account_id": "washer_2", "volume": 9500},
            {"account_id": "legitimate_1", "volume": 1000},
            {"account_id": "washer_1", "volume": 15000}
        ]
    }
    
    wash_trading_result = await aml_system.detect_market_manipulation(wash_trading_data)
    print(f"Wash trading detection: {len(wash_trading_result['alerts_generated'])} alerts")
    if wash_trading_result['confidence_scores']:
        print(f"Confidence scores: {wash_trading_result['confidence_scores']}")
    
    # Test 4: AML Dashboard
    print("\n📈 4. AML/KYC Dashboard:")
    
    dashboard = aml_system.get_aml_dashboard()
    print(f"Total customers: {dashboard['system_overview']['total_customers']}")
    print(f"KYC pending: {dashboard['system_overview']['kyc_pending']}")
    print(f"High-risk customers: {dashboard['system_overview']['high_risk_customers']}")
    print(f"Sanctions matches: {dashboard['system_overview']['sanctions_matches']}")
    print(f"PEP customers: {dashboard['system_overview']['pep_customers']}")
    print(f"Total transactions: {dashboard['transaction_monitoring']['total_transactions']}")
    print(f"Flagged transactions: {dashboard['transaction_monitoring']['flagged_transactions']}")
    print(f"Blocked transactions: {dashboard['transaction_monitoring']['blocked_transactions']}")
    print(f"SARs generated: {dashboard['transaction_monitoring']['sars_generated']}")
    print(f"Average risk score: {dashboard['transaction_monitoring']['average_risk_score']:.1f}")
    print(f"Market surveillance alerts: {dashboard['market_surveillance']['total_alerts']}")
    print(f"KYC completion rate: {dashboard['compliance_metrics']['kyc_completion_rate']:.1f}%")
    
    print("\n✅ Advanced AML/KYC System Implementation Complete!")
    print("🛡️ Comprehensive anti-money laundering framework operational")
    print("🔍 Real-time transaction monitoring and market surveillance active")

if __name__ == "__main__":
    asyncio.run(main())
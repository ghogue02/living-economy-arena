#!/usr/bin/env python3
"""
Regulatory Compliance Framework for AI Agent Trading
Ensures all AI agents operate within regulatory boundaries
"""

import asyncio
import time
import uuid
from typing import Dict, List, Optional, Tuple, Set, Any
from dataclasses import dataclass, field
from decimal import Decimal
from enum import Enum
import json
import logging
from abc import ABC, abstractmethod

logger = logging.getLogger(__name__)

class RegulationType(Enum):
    MARKET_MANIPULATION = "market_manipulation"
    POSITION_LIMITS = "position_limits"
    DISCLOSURE = "disclosure"
    BEST_EXECUTION = "best_execution"
    RISK_MANAGEMENT = "risk_management"
    KNOW_YOUR_CUSTOMER = "kyc"
    ANTI_MONEY_LAUNDERING = "aml"
    TRADE_REPORTING = "trade_reporting"

class ViolationSeverity(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AgentStatus(Enum):
    COMPLIANT = "compliant"
    WARNING = "warning"
    RESTRICTED = "restricted"
    SUSPENDED = "suspended"
    BANNED = "banned"

@dataclass
class ComplianceRule:
    """Regulatory compliance rule definition"""
    rule_id: str
    regulation_type: RegulationType
    description: str
    
    # Thresholds and limits
    position_limit: Optional[Decimal] = None
    daily_volume_limit: Optional[Decimal] = None
    concentration_limit: Optional[float] = None  # % of total market
    
    # Time-based constraints
    holding_period_min: Optional[int] = None  # Minimum holding time in seconds
    wash_sale_window: Optional[int] = None    # Wash sale detection window
    
    # Behavioral constraints
    max_order_frequency: Optional[int] = None  # Orders per minute
    max_cancel_ratio: Optional[float] = None   # Cancel to fill ratio
    
    # Reporting requirements
    requires_pre_trade_check: bool = False
    requires_post_trade_report: bool = False
    
    is_active: bool = True
    enforcement_level: ViolationSeverity = ViolationSeverity.MEDIUM

@dataclass
class ViolationRecord:
    """Record of a compliance violation"""
    violation_id: str
    agent_id: str
    rule_id: str
    violation_type: RegulationType
    severity: ViolationSeverity
    timestamp: float
    description: str
    evidence: Dict[str, Any]
    penalty_applied: Optional[str] = None
    resolved: bool = False
    resolution_time: Optional[float] = None

@dataclass
class AgentProfile:
    """Compliance profile for an AI agent"""
    agent_id: str
    agent_type: str
    registration_time: float
    
    # Risk classification
    risk_level: str = "medium"  # low, medium, high
    max_position_size: Decimal = Decimal('10000')
    allowed_instruments: Set[str] = field(default_factory=set)
    
    # Trading permissions
    can_trade_derivatives: bool = False
    can_use_leverage: bool = False
    max_leverage: float = 1.0
    
    # Status tracking
    status: AgentStatus = AgentStatus.COMPLIANT
    violations_count: int = 0
    last_violation_time: Optional[float] = None
    
    # KYC/AML information
    kyc_verified: bool = False
    aml_score: float = 0.0  # 0-1, higher is riskier
    
    # Performance tracking
    total_trades: int = 0
    total_volume: Decimal = Decimal('0')
    current_positions: Dict[str, Decimal] = field(default_factory=dict)

class TradingBehaviorAnalyzer:
    """Analyzes AI agent trading behavior for compliance violations"""
    
    def __init__(self):
        self.trade_history: Dict[str, List] = {}  # agent_id -> trades
        self.order_history: Dict[str, List] = {}  # agent_id -> orders
        self.position_history: Dict[str, List] = {}  # agent_id -> positions
        
    def record_trade(self, agent_id: str, trade_data: Dict) -> None:
        """Record a trade for compliance analysis"""
        if agent_id not in self.trade_history:
            self.trade_history[agent_id] = []
        
        trade_record = {
            'timestamp': time.time(),
            'symbol': trade_data.get('symbol'),
            'side': trade_data.get('side'),
            'quantity': float(trade_data.get('quantity', 0)),
            'price': float(trade_data.get('price', 0)),
            'order_id': trade_data.get('order_id')
        }
        
        self.trade_history[agent_id].append(trade_record)
        
        # Keep only recent history (last 30 days)
        cutoff_time = time.time() - (30 * 24 * 3600)
        self.trade_history[agent_id] = [
            trade for trade in self.trade_history[agent_id]
            if trade['timestamp'] > cutoff_time
        ]
    
    def record_order(self, agent_id: str, order_data: Dict) -> None:
        """Record an order for compliance analysis"""
        if agent_id not in self.order_history:
            self.order_history[agent_id] = []
        
        order_record = {
            'timestamp': time.time(),
            'order_id': order_data.get('order_id'),
            'symbol': order_data.get('symbol'),
            'side': order_data.get('side'),
            'quantity': float(order_data.get('quantity', 0)),
            'price': float(order_data.get('price', 0)),
            'order_type': order_data.get('order_type'),
            'status': order_data.get('status', 'pending')
        }
        
        self.order_history[agent_id].append(order_record)
        
        # Keep only recent history
        cutoff_time = time.time() - (7 * 24 * 3600)  # 7 days for orders
        self.order_history[agent_id] = [
            order for order in self.order_history[agent_id]
            if order['timestamp'] > cutoff_time
        ]
    
    def detect_wash_trading(self, agent_id: str, window_seconds: int = 3600) -> List[Dict]:
        """Detect potential wash trading patterns"""
        if agent_id not in self.trade_history:
            return []
        
        trades = self.trade_history[agent_id]
        current_time = time.time()
        cutoff_time = current_time - window_seconds
        
        # Get recent trades
        recent_trades = [t for t in trades if t['timestamp'] > cutoff_time]
        
        violations = []
        
        # Look for rapid buy/sell patterns in same instrument
        by_symbol = {}
        for trade in recent_trades:
            symbol = trade['symbol']
            if symbol not in by_symbol:
                by_symbol[symbol] = []
            by_symbol[symbol].append(trade)
        
        for symbol, symbol_trades in by_symbol.items():
            if len(symbol_trades) < 4:  # Need at least 4 trades
                continue
            
            # Look for alternating buy/sell pattern
            for i in range(len(symbol_trades) - 3):
                trades_subset = symbol_trades[i:i+4]
                
                # Check if it's buy-sell-buy-sell pattern within short time
                if (trades_subset[0]['side'] == 'buy' and
                    trades_subset[1]['side'] == 'sell' and
                    trades_subset[2]['side'] == 'buy' and
                    trades_subset[3]['side'] == 'sell'):
                    
                    time_span = trades_subset[3]['timestamp'] - trades_subset[0]['timestamp']
                    
                    if time_span < 300:  # Within 5 minutes
                        violations.append({
                            'type': 'wash_trading',
                            'symbol': symbol,
                            'trades': trades_subset,
                            'time_span': time_span
                        })
        
        return violations
    
    def detect_layering(self, agent_id: str) -> List[Dict]:
        """Detect layering/spoofing patterns"""
        if agent_id not in self.order_history:
            return []
        
        orders = self.order_history[agent_id]
        violations = []
        
        # Group orders by symbol
        by_symbol = {}
        for order in orders:
            symbol = order['symbol']
            if symbol not in by_symbol:
                by_symbol[symbol] = []
            by_symbol[symbol].append(order)
        
        for symbol, symbol_orders in by_symbol.items():
            # Look for pattern: many orders on one side, then cancellation, then trade on other side
            symbol_orders.sort(key=lambda x: x['timestamp'])
            
            # Analyze order patterns (simplified detection)
            recent_orders = [o for o in symbol_orders if time.time() - o['timestamp'] < 3600]
            
            if len(recent_orders) > 20:  # High order frequency
                cancel_ratio = len([o for o in recent_orders if o['status'] == 'cancelled']) / len(recent_orders)
                
                if cancel_ratio > 0.8:  # High cancellation ratio
                    violations.append({
                        'type': 'layering',
                        'symbol': symbol,
                        'order_count': len(recent_orders),
                        'cancel_ratio': cancel_ratio
                    })
        
        return violations
    
    def check_position_concentration(self, agent_id: str, total_market_cap: Dict[str, Decimal]) -> List[Dict]:
        """Check if agent has excessive concentration in any instrument"""
        violations = []
        
        # This would typically come from the position tracking system
        # For now, we'll use mock data
        agent_positions = {
            'BTC/USD': Decimal('1000000'),  # $1M position
            'ETH/USD': Decimal('500000')    # $500k position
        }
        
        for symbol, position_value in agent_positions.items():
            if symbol in total_market_cap:
                concentration = float(position_value / total_market_cap[symbol])
                
                if concentration > 0.05:  # More than 5% of market
                    violations.append({
                        'type': 'position_concentration',
                        'symbol': symbol,
                        'position_value': str(position_value),
                        'concentration_pct': concentration * 100
                    })
        
        return violations

class RegulatoryComplianceEngine:
    """
    Main regulatory compliance engine for AI agent oversight
    """
    
    def __init__(self):
        self.rules: Dict[str, ComplianceRule] = {}
        self.agent_profiles: Dict[str, AgentProfile] = {}
        self.violations: List[ViolationRecord] = []
        self.behavior_analyzer = TradingBehaviorAnalyzer()
        
        # Compliance state
        self.monitoring_enabled = True
        self.auto_enforcement = True
        
        # Performance metrics
        self.total_checks_performed = 0
        self.violations_detected = 0
        self.false_positives = 0
        
        logger.info("Regulatory Compliance Engine initialized")
    
    def add_compliance_rule(self, rule: ComplianceRule) -> None:
        """Add a new compliance rule"""
        self.rules[rule.rule_id] = rule
        logger.info(f"Added compliance rule: {rule.rule_id} ({rule.regulation_type.value})")
    
    def register_agent(self, agent_profile: AgentProfile) -> None:
        """Register a new AI agent for compliance monitoring"""
        self.agent_profiles[agent_profile.agent_id] = agent_profile
        logger.info(f"Registered agent for compliance: {agent_profile.agent_id}")
    
    async def pre_trade_check(self, agent_id: str, trade_request: Dict) -> Dict[str, Any]:
        """Perform pre-trade compliance check"""
        if not self.monitoring_enabled:
            return {"approved": True, "reason": "Monitoring disabled"}
        
        if agent_id not in self.agent_profiles:
            return {"approved": False, "reason": "Agent not registered"}
        
        agent = self.agent_profiles[agent_id]
        
        # Check agent status
        if agent.status in [AgentStatus.SUSPENDED, AgentStatus.BANNED]:
            return {"approved": False, "reason": f"Agent status: {agent.status.value}"}
        
        # Check position limits
        symbol = trade_request.get('symbol')
        quantity = Decimal(str(trade_request.get('quantity', 0)))
        side = trade_request.get('side')
        
        # Calculate new position
        current_position = agent.current_positions.get(symbol, Decimal('0'))
        if side == 'buy':
            new_position = current_position + quantity
        else:
            new_position = current_position - quantity
        
        # Check position limits
        if abs(new_position) > agent.max_position_size:
            return {"approved": False, "reason": "Position limit exceeded"}
        
        # Check instrument permissions
        if symbol not in agent.allowed_instruments and agent.allowed_instruments:
            return {"approved": False, "reason": "Instrument not allowed"}
        
        # Check specific compliance rules
        for rule in self.rules.values():
            if not rule.is_active:
                continue
            
            violation = await self._check_rule_compliance(agent_id, rule, trade_request)
            if violation:
                if rule.enforcement_level in [ViolationSeverity.HIGH, ViolationSeverity.CRITICAL]:
                    return {"approved": False, "reason": f"Rule violation: {rule.rule_id}"}
        
        self.total_checks_performed += 1
        return {"approved": True, "reason": "Compliance check passed"}
    
    async def post_trade_monitoring(self, agent_id: str, trade_data: Dict) -> None:
        """Perform post-trade compliance monitoring"""
        if not self.monitoring_enabled:
            return
        
        # Record trade for analysis
        self.behavior_analyzer.record_trade(agent_id, trade_data)
        
        # Update agent profile
        if agent_id in self.agent_profiles:
            agent = self.agent_profiles[agent_id]
            agent.total_trades += 1
            agent.total_volume += Decimal(str(trade_data.get('quantity', 0))) * Decimal(str(trade_data.get('price', 0)))
            
            # Update position
            symbol = trade_data.get('symbol')
            quantity = Decimal(str(trade_data.get('quantity', 0)))
            side = trade_data.get('side')
            
            if symbol not in agent.current_positions:
                agent.current_positions[symbol] = Decimal('0')
            
            if side == 'buy':
                agent.current_positions[symbol] += quantity
            else:
                agent.current_positions[symbol] -= quantity
        
        # Run behavioral analysis
        await self._run_behavioral_analysis(agent_id)
    
    async def _check_rule_compliance(self, agent_id: str, rule: ComplianceRule, trade_request: Dict) -> Optional[ViolationRecord]:
        """Check compliance against a specific rule"""
        
        if rule.regulation_type == RegulationType.POSITION_LIMITS:
            return await self._check_position_limits(agent_id, rule, trade_request)
        elif rule.regulation_type == RegulationType.BEST_EXECUTION:
            return await self._check_best_execution(agent_id, rule, trade_request)
        # Add more rule type checks as needed
        
        return None
    
    async def _check_position_limits(self, agent_id: str, rule: ComplianceRule, trade_request: Dict) -> Optional[ViolationRecord]:
        """Check position limit compliance"""
        if rule.position_limit is None:
            return None
        
        agent = self.agent_profiles.get(agent_id)
        if not agent:
            return None
        
        symbol = trade_request.get('symbol')
        quantity = Decimal(str(trade_request.get('quantity', 0)))
        side = trade_request.get('side')
        
        current_position = agent.current_positions.get(symbol, Decimal('0'))
        
        if side == 'buy':
            new_position = current_position + quantity
        else:
            new_position = current_position - quantity
        
        if abs(new_position) > rule.position_limit:
            return ViolationRecord(
                violation_id=str(uuid.uuid4()),
                agent_id=agent_id,
                rule_id=rule.rule_id,
                violation_type=rule.regulation_type,
                severity=rule.enforcement_level,
                timestamp=time.time(),
                description=f"Position limit exceeded: {new_position} > {rule.position_limit}",
                evidence={
                    'current_position': str(current_position),
                    'new_position': str(new_position),
                    'position_limit': str(rule.position_limit),
                    'trade_request': trade_request
                }
            )
        
        return None
    
    async def _check_best_execution(self, agent_id: str, rule: ComplianceRule, trade_request: Dict) -> Optional[ViolationRecord]:
        """Check best execution compliance"""
        # Simplified best execution check
        # In reality, this would compare against market data to ensure best price
        
        order_type = trade_request.get('order_type')
        if order_type == 'market':
            # Market orders generally satisfy best execution
            return None
        
        # For limit orders, we'd need to check if the price is reasonable
        # This is a simplified placeholder
        return None
    
    async def _run_behavioral_analysis(self, agent_id: str) -> None:
        """Run behavioral analysis to detect violations"""
        
        # Check for wash trading
        wash_violations = self.behavior_analyzer.detect_wash_trading(agent_id)
        for violation in wash_violations:
            await self._record_violation(
                agent_id, 
                "wash_trading_detection", 
                RegulationType.MARKET_MANIPULATION,
                ViolationSeverity.HIGH,
                "Potential wash trading detected",
                violation
            )
        
        # Check for layering
        layering_violations = self.behavior_analyzer.detect_layering(agent_id)
        for violation in layering_violations:
            await self._record_violation(
                agent_id,
                "layering_detection",
                RegulationType.MARKET_MANIPULATION,
                ViolationSeverity.HIGH,
                "Potential layering/spoofing detected",
                violation
            )
        
        # Check position concentration
        # Mock total market cap data
        mock_market_caps = {
            'BTC/USD': Decimal('1000000000'),  # $1B market
            'ETH/USD': Decimal('500000000')    # $500M market
        }
        
        concentration_violations = self.behavior_analyzer.check_position_concentration(agent_id, mock_market_caps)
        for violation in concentration_violations:
            await self._record_violation(
                agent_id,
                "position_concentration",
                RegulationType.POSITION_LIMITS,
                ViolationSeverity.MEDIUM,
                "Excessive position concentration",
                violation
            )
    
    async def _record_violation(self, agent_id: str, rule_id: str, violation_type: RegulationType, severity: ViolationSeverity, description: str, evidence: Dict) -> None:
        """Record a compliance violation"""
        
        violation = ViolationRecord(
            violation_id=str(uuid.uuid4()),
            agent_id=agent_id,
            rule_id=rule_id,
            violation_type=violation_type,
            severity=severity,
            timestamp=time.time(),
            description=description,
            evidence=evidence
        )
        
        self.violations.append(violation)
        self.violations_detected += 1
        
        # Update agent profile
        if agent_id in self.agent_profiles:
            agent = self.agent_profiles[agent_id]
            agent.violations_count += 1
            agent.last_violation_time = time.time()
            
            # Apply automatic penalties if enabled
            if self.auto_enforcement:
                await self._apply_penalty(agent, violation)
        
        logger.warning(f"Compliance violation recorded: {agent_id} - {description}")
    
    async def _apply_penalty(self, agent: AgentProfile, violation: ViolationRecord) -> None:
        """Apply automatic penalty for violation"""
        
        if violation.severity == ViolationSeverity.LOW:
            # Just a warning for low severity
            pass
        elif violation.severity == ViolationSeverity.MEDIUM:
            # Reduce position limits temporarily
            agent.max_position_size *= Decimal('0.8')
        elif violation.severity == ViolationSeverity.HIGH:
            # Restrict trading temporarily
            agent.status = AgentStatus.RESTRICTED
        elif violation.severity == ViolationSeverity.CRITICAL:
            # Suspend trading
            agent.status = AgentStatus.SUSPENDED
        
        violation.penalty_applied = f"Status: {agent.status.value}, Position limit: {agent.max_position_size}"
        logger.warning(f"Penalty applied to {agent.agent_id}: {violation.penalty_applied}")
    
    def get_agent_compliance_report(self, agent_id: str) -> Dict[str, Any]:
        """Generate compliance report for an agent"""
        if agent_id not in self.agent_profiles:
            return {"error": "Agent not found"}
        
        agent = self.agent_profiles[agent_id]
        
        # Get recent violations
        recent_violations = [
            v for v in self.violations 
            if v.agent_id == agent_id and time.time() - v.timestamp < (30 * 24 * 3600)
        ]
        
        return {
            'agent_id': agent_id,
            'status': agent.status.value,
            'risk_level': agent.risk_level,
            'kyc_verified': agent.kyc_verified,
            'total_trades': agent.total_trades,
            'total_volume': str(agent.total_volume),
            'violations_count': agent.violations_count,
            'recent_violations': len(recent_violations),
            'max_position_size': str(agent.max_position_size),
            'current_positions': {k: str(v) for k, v in agent.current_positions.items()},
            'last_violation': agent.last_violation_time
        }
    
    def get_system_compliance_report(self) -> Dict[str, Any]:
        """Generate system-wide compliance report"""
        
        # Agent statistics
        total_agents = len(self.agent_profiles)
        compliant_agents = len([a for a in self.agent_profiles.values() if a.status == AgentStatus.COMPLIANT])
        suspended_agents = len([a for a in self.agent_profiles.values() if a.status == AgentStatus.SUSPENDED])
        
        # Violation statistics
        recent_violations = [v for v in self.violations if time.time() - v.timestamp < (24 * 3600)]
        violation_by_type = {}
        for violation in recent_violations:
            vtype = violation.violation_type.value
            violation_by_type[vtype] = violation_by_type.get(vtype, 0) + 1
        
        return {
            'total_agents': total_agents,
            'compliant_agents': compliant_agents,
            'suspended_agents': suspended_agents,
            'total_checks_performed': self.total_checks_performed,
            'violations_detected': self.violations_detected,
            'recent_violations_24h': len(recent_violations),
            'violations_by_type': violation_by_type,
            'monitoring_enabled': self.monitoring_enabled,
            'auto_enforcement': self.auto_enforcement
        }

def create_standard_regulatory_framework() -> RegulatoryComplianceEngine:
    """Create standard regulatory compliance setup"""
    engine = RegulatoryComplianceEngine()
    
    # Position limit rules
    engine.add_compliance_rule(ComplianceRule(
        rule_id="max_position_limit",
        regulation_type=RegulationType.POSITION_LIMITS,
        description="Maximum position size limit",
        position_limit=Decimal('100000'),  # $100k max position
        enforcement_level=ViolationSeverity.HIGH
    ))
    
    # Market manipulation detection
    engine.add_compliance_rule(ComplianceRule(
        rule_id="wash_trading_prevention",
        regulation_type=RegulationType.MARKET_MANIPULATION,
        description="Prevent wash trading patterns",
        wash_sale_window=3600,  # 1 hour window
        enforcement_level=ViolationSeverity.CRITICAL
    ))
    
    # Order frequency limits
    engine.add_compliance_rule(ComplianceRule(
        rule_id="order_frequency_limit",
        regulation_type=RegulationType.RISK_MANAGEMENT,
        description="Limit order frequency to prevent market disruption",
        max_order_frequency=60,  # 60 orders per minute max
        enforcement_level=ViolationSeverity.MEDIUM
    ))
    
    # Best execution requirement
    engine.add_compliance_rule(ComplianceRule(
        rule_id="best_execution",
        regulation_type=RegulationType.BEST_EXECUTION,
        description="Ensure best execution for client orders",
        requires_pre_trade_check=True,
        enforcement_level=ViolationSeverity.MEDIUM
    ))
    
    return engine

if __name__ == "__main__":
    # Demo
    async def demo():
        engine = create_standard_regulatory_framework()
        
        # Register a test agent
        agent = AgentProfile(
            agent_id="test_agent_001",
            agent_type="market_maker",
            registration_time=time.time(),
            allowed_instruments={"BTC/USD", "ETH/USD"}
        )
        engine.register_agent(agent)
        
        # Test pre-trade check
        trade_request = {
            'symbol': 'BTC/USD',
            'side': 'buy',
            'quantity': 10,
            'price': 50000,
            'order_type': 'limit'
        }
        
        check_result = await engine.pre_trade_check("test_agent_001", trade_request)
        print(f"Pre-trade check result: {check_result}")
        
        # Simulate trade execution
        if check_result['approved']:
            await engine.post_trade_monitoring("test_agent_001", trade_request)
        
        # Generate compliance report
        report = engine.get_agent_compliance_report("test_agent_001")
        print(f"Agent compliance report: {report}")
        
        system_report = engine.get_system_compliance_report()
        print(f"System compliance report: {system_report}")
    
    asyncio.run(demo())
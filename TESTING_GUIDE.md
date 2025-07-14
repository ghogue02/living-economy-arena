# 🧪 Living Economy Arena - Complete Testing Guide

## 🚀 Quick Start Tests (5 minutes)

### **1. Phase 2 Integration Demo** 
```bash
cd /Users/greghogue/living-ecomony-arena/phase2-integration-tests
node demo.js
```
**Tests**: Agent coordination, scaling systems, performance validation

### **2. Market Infrastructure Demo**
```bash
cd /Users/greghogue/living-ecomony-arena/market-infrastructure
python main.py
```
**Tests**: Trading engine, order books, compliance systems

### **3. AI Personality Demo**
```bash
cd /Users/greghogue/living-ecomony-arena/ai-personality/openrouter-integration
node demo/demo.js
```
**Tests**: AI agent personalities, communication systems

## 🎯 Phase-by-Phase Testing

### **Phase 1: Market Infrastructure**
```bash
# Test economic engine
cd economic-engine
npm test  # If available
node core/simulation/engine.js

# Test market infrastructure  
cd ../market-infrastructure
python main.py
# Watch for: Exchange startup, order book creation, HFT agents
```

### **Phase 2: AI Intelligence**
```bash
# Test AI personality systems
cd ai-personality
node enhanced-personality-system.js

# Test phase 2 integration
cd ../phase2-integration-tests
node test-runner.js
```

### **Phase 3: Advanced Markets**
```bash
# Test derivatives markets
cd market-infrastructure/derivatives
python test_advanced_markets.py

# Test multi-currency systems
cd ../
python test_currencies.py  # If available
```

### **Phase 4: Governance & Social Systems**
```bash
# Test AI governance (if implemented)
cd ai-governance
node index.js

# Test social dynamics
cd ../agent-society
node phase4-integration-orchestrator.js

# Test environmental systems
cd ../environmental-systems
node index.js

# Test governance systems
cd ../governance-systems
node index.js

# Test ecosystem integration
cd ../ecosystem-integration
npm start
```

## 🌐 Web-Based Testing

### **Real-Time Dashboards**
1. **Market Dashboard**: `http://localhost:8765` (after running market infrastructure)
2. **Ecosystem Gateway**: `http://localhost:8080` (after running ecosystem integration)
3. **Visualization Interface**: Open `/visualization/index.html`

### **API Testing**
```bash
# Test market data endpoints
curl http://localhost:8080/api/markets
curl http://localhost:8080/api/indicators
curl http://localhost:8080/api/agents

# Test governance endpoints
curl http://localhost:8080/api/governance/status
curl http://localhost:8080/api/environmental/metrics
```

## 🔧 Specific System Tests

### **AI Agent Testing**
```javascript
// Create test agents
const agent = new EnhancedPersonalitySystem();
agent.initialize();
agent.demonstrateCapabilities();
```

### **Trading System Testing**
```python
# Test high-frequency trading
from market_infrastructure.trading_systems.hft_engine import HFTEngine
engine = HFTEngine()
engine.start_trading_simulation()
```

### **Governance Testing**
```javascript
// Test voting mechanisms
const governance = new GovernanceSystem();
governance.createVote('test-proposal', ['Option A', 'Option B']);
```

## 📊 Performance Benchmarks

### **Load Testing**
```bash
# Test with high agent count
cd phase2-integration-tests
node load-testing-framework.js

# Monitor performance
node performance-validator.js
```

### **Stress Testing**
```bash
# Test market infrastructure under load
cd market-infrastructure
python -c "
from main import MarketInfrastructureOrchestrator
orchestrator = MarketInfrastructureOrchestrator()
orchestrator.run_stress_test()
"
```

## 🎮 Interactive Testing

### **Player Interaction Systems**
```bash
cd player-interaction-systems
node test-integration.js
```

### **Game Balance Testing**
```bash
cd game-balance
node index.js
```

### **Security Testing**
```bash
cd security
node testing/penetration-testing-framework.js
```

## 📈 System Integration Tests

### **Cross-System Communication**
```bash
# Test all systems working together
cd phase2-integration-tests
node scenario-testing.js
```

### **Real-World Scenarios**
```bash
# Run economic crisis simulation
node scenario-testing.js --scenario crisis

# Run growth scenario
node scenario-testing.js --scenario growth

# Run market manipulation test
node scenario-testing.js --scenario manipulation
```

## 🐛 Debugging & Validation

### **Check System Health**
```bash
# Monitor all systems
cd ecosystem-integration
node monitoring/system-health-check.js
```

### **Validate Data Integrity**
```bash
# Check data consistency across systems
node integration/data-validation.js
```

### **Performance Monitoring**
```bash
# Real-time performance metrics
node monitoring/performance-dashboard.js
```

## ✅ Success Indicators

### **What You Should See:**

1. **Market Infrastructure**: Active trading, order matching, realistic spreads
2. **AI Agents**: Intelligent behavior, learning, social interactions
3. **Economic Indicators**: Real-time metrics, market health data
4. **Governance**: Successful voting, proposal execution
5. **Environmental**: Carbon tracking, sustainability metrics
6. **Integration**: All systems communicating seamlessly

### **Performance Targets:**
- **Response Time**: < 500ms for most operations
- **Throughput**: 1000+ operations/second
- **Uptime**: 99%+ availability
- **Memory Usage**: Optimized for large-scale simulation
- **CPU Usage**: Efficient multi-core utilization

## 🚨 Troubleshooting

### **Common Issues:**
1. **Port Conflicts**: Change ports in config files
2. **Missing Dependencies**: Run `npm install` in each directory
3. **Python Dependencies**: Run `pip install -r requirements.txt`
4. **Memory Issues**: Reduce agent count in config files
5. **Network Issues**: Check firewall and port availability

### **Debug Mode:**
Add `DEBUG=true` environment variable for verbose logging:
```bash
DEBUG=true node demo.js
```

## 🎯 Recommended Testing Order

1. **Start with Phase 2 Integration Demo** (validates core functionality)
2. **Run Market Infrastructure** (validates trading systems)
3. **Test Individual Phase 4 Systems** (validates new features)
4. **Run Ecosystem Integration** (validates unified platform)
5. **Execute Performance Tests** (validates scalability)
6. **Try Real-World Scenarios** (validates practical usage)

This testing guide will help you validate that your complete Living Economy Arena is working correctly across all phases and systems!
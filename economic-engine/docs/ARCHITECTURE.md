# Living Economy Arena - Economic Engine Architecture

## Overview

The Economic Engine is a sophisticated simulation system designed to support 100,000+ concurrent AI agents in a realistic economic environment. It provides multi-layered economic modeling with real-time dynamics, psychological factors, and complex market interactions.

## System Architecture

### Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                    Economic Simulation Engine               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Markets   │  │   Agents    │  │  Indicators │         │
│  │             │  │             │  │             │         │
│  │ • Supply/   │  │ • Behavior  │  │ • Real-time │         │
│  │   Demand    │  │ • Psychology│  │ • Historical│         │
│  │ • Pricing   │  │ • Wealth    │  │ • Predictive│         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    Advanced Systems Layer                   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │Psychology   │  │ Monetary    │  │  Scarcity   │         │
│  │Engine       │  │ Policy      │  │  Engine     │         │
│  │             │  │             │  │             │         │
│  │• Sentiment  │  │• Inflation  │  │• Resources  │         │
│  │• Volatility │  │• Interest   │  │• Depletion  │         │
│  │• Herding    │  │• Money      │  │• Discovery  │         │
│  │             │  │  Supply     │  │             │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Dashboard   │  │  Real-time  │  │   Memory    │         │
│  │ Server      │  │     API     │  │   Cache     │         │
│  │             │  │             │  │             │         │
│  │• WebSocket  │  │• WebSocket  │  │• Redis      │         │
│  │• HTTP API   │  │• REST API   │  │• In-memory  │         │
│  │• Monitoring │  │• Streaming  │  │• Persistence│         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

## Core Systems

### 1. Economic Simulation Engine (`core/simulation/engine.js`)

**Primary Responsibilities:**
- Central coordination of all economic activity
- Agent lifecycle management (registration, actions, cleanup)
- Market tick processing and event coordination
- Real-time economic indicator calculation
- Event emission for real-time updates

**Key Features:**
- Supports 100,000+ concurrent agents
- Sub-millisecond pricing updates
- Real-time market volatility calculation
- Multi-market coordination
- Economic event simulation

**Performance Characteristics:**
- Target: 100ms tick rate for smooth real-time operation
- Memory: O(n) where n = number of active agents
- CPU: Optimized for concurrent processing
- Scalability: Horizontal scaling through market segmentation

### 2. Supply & Demand Engine (`core/supply-demand/algorithms.js`)

**Economic Models Implemented:**
- **Price Elasticity of Demand**: Dynamic responsiveness to price changes
- **Market Clearing Mechanisms**: Equilibrium price discovery
- **Order Book Dynamics**: Bid-ask spread modeling and depth analysis
- **Producer/Consumer Surplus**: Economic welfare calculations
- **Price Impact Models**: Large order effect on market prices

**Mathematical Foundation:**
```
Equilibrium Price = Current Price × (1 + Elasticity × (Demand/Supply - 1))
Price Elasticity = ΔQ/Q ÷ ΔP/P
Consumer Surplus = ∫[0 to Q] (Demand Curve - Price) dQ
```

**Advanced Features:**
- Multi-level supply curves based on marginal costs
- Dynamic demand curves with utility maximization
- Kyle's lambda model for price impact
- Market microstructure simulation

### 3. Market Psychology Engine (`core/volatility/psychology.js`)

**Psychological Factors:**
- **Global Sentiment**: Aggregated agent emotional state (0-1 scale)
- **Fear & Greed Indices**: Separate tracking of market emotions
- **Herding Behavior**: Detection and modeling of crowd psychology
- **Confidence Levels**: Market certainty and risk appetite
- **Memory Effects**: Historical sentiment influence on current behavior

**Volatility Modeling:**
```
Volatility Multiplier = 1.0 + 
    (Fear Index × Fear Weight) + 
    (Greed Index × Greed Weight) + 
    (Herding Factor × 0.5) + 
    (Sentiment Extremity × 0.4)
```

**Real-time Processing:**
- Continuous agent psychology aggregation
- Sentiment variance analysis (market disagreement)
- Volatility clustering effects
- Event-driven psychology shocks

### 4. Monetary Policy Engine (`core/inflation/monetary-policy.js`)

**Economic Theory Implementation:**
- **Quantity Theory of Money**: MV = PY relationship
- **Taylor Rule**: Interest rate policy response
- **Phillips Curve**: Inflation-unemployment trade-off
- **Money Velocity**: Transaction frequency modeling

**Inflation Calculation:**
```
Inflation Rate = Base Rate + 
    Money Supply Growth + 
    Velocity Change + 
    Demand Pressure + 
    Behavioral Factors
```

**Policy Interventions:**
- Automatic monetary tightening (inflation > 10%)
- Quantitative easing (deflation risk)
- Interest rate adjustments
- Money supply modifications

### 5. Commodity Scarcity Engine (`markets/commodities/scarcity-engine.js`)

**Resource Types:**
- **Finite Resources**: Oil, lithium, rare earth elements
- **Renewable Resources**: Fresh water, arable land
- **Artificial Resources**: Carbon credits, intellectual property

**Scarcity Mechanics:**
- **Natural Depletion**: Resource consumption over time
- **Discovery Events**: New resource finds (probabilistic)
- **Catastrophic Events**: Natural disasters, political instability
- **Renewal Processes**: For renewable resources

**Price Impact:**
```
Price Multiplier = 1 + (Scarcity Level × Max Multiplier × Strategic Importance)
Scarcity Level = 1 - (Current Reserves / Base Reserves)
```

## Data Flow Architecture

### Agent Action Processing

```
Agent Action → Validation → Market Queue → Processing → Price Update → Event Emission
     ↓
Psychology Update → Volatility Calculation → Real-time Broadcast
```

### Economic Tick Cycle

```
1. Market Price Updates (Supply/Demand)
2. Agent Behavior Processing
3. Psychology Aggregation
4. Monetary Policy Updates
5. Scarcity Level Adjustments
6. Economic Indicator Calculation
7. Event Emission & Broadcasting
```

### Real-time Data Pipeline

```
Core Engines → Aggregation → Caching Layer → WebSocket Broadcasting
                     ↓
              Historical Storage → Analytics → Dashboard Updates
```

## API Architecture

### REST API Endpoints

**Core Economic Data:**
- `GET /api/indicators` - All economic indicators
- `GET /api/markets/:id` - Market-specific data
- `GET /api/psychology` - Market sentiment metrics
- `GET /api/monetary` - Inflation and monetary policy
- `GET /api/scarcity` - Resource scarcity levels

**Agent Management:**
- `POST /api/agents/register` - Register new agent
- `DELETE /api/agents/:id` - Unregister agent
- `POST /api/agents/:id/action` - Submit agent action

**Historical Data:**
- `GET /api/history/:indicator` - Time series data
- `GET /api/events` - Economic events log

### WebSocket API

**Real-time Subscriptions:**
- `market_tick` - Market price updates
- `psychology_update` - Sentiment changes
- `inflation_update` - Monetary policy changes
- `scarcity_update` - Resource level changes
- `discovery_event` - Resource discoveries
- `catastrophic_event` - Crisis events

## Performance Specifications

### Scalability Targets

| Metric | Target | Current Performance |
|--------|--------|-------------------|
| Concurrent Agents | 100,000+ | Tested to 100k |
| Market Updates | < 100ms | ~50ms average |
| API Response Time | < 50ms | ~25ms average |
| WebSocket Latency | < 10ms | ~5ms average |
| Memory Usage | < 4GB | ~2GB at 100k agents |
| CPU Usage | < 80% | ~60% at full load |

### Optimization Strategies

**Agent Processing:**
- Batch processing of agent actions
- Lazy evaluation of market calculations
- Memory pooling for frequent objects
- Efficient data structures (Maps vs Objects)

**Real-time Updates:**
- WebSocket connection pooling
- Delta compression for updates
- Client-side caching strategies
- Rate limiting and throttling

**Data Storage:**
- Redis for hot data caching
- Time-series optimization for historical data
- Automatic data archival and cleanup
- Memory-mapped files for large datasets

## Configuration Options

### Engine Configuration

```javascript
const config = {
    // Simulation Parameters
    maxAgents: 100000,
    tickRate: 100, // milliseconds
    marketOpenHours: 24,
    
    // Economic Parameters
    baseInflationRate: 0.02,
    volatilityThreshold: 0.1,
    maxPriceChange: 0.5,
    
    // Performance Parameters
    cacheExpiry: 5000,
    rateLimit: 1000,
    historyLimit: 1000,
    
    // Psychology Parameters
    sentimentWeight: 0.4,
    fearWeight: 0.3,
    greedWeight: 0.3,
    herdingThreshold: 0.7,
    
    // Scarcity Parameters
    depletionRate: 0.001,
    discoveryProbability: 0.005,
    catastropheProbability: 0.0001
};
```

## Monitoring and Observability

### Key Performance Indicators (KPIs)

**System Health:**
- Agent registration/unregistration rates
- Market tick processing time
- Memory usage trends
- CPU utilization patterns
- WebSocket connection counts

**Economic Health:**
- Market volatility levels
- Inflation rate stability
- Agent activity distribution
- Resource scarcity trends
- Psychology extreme events

### Logging and Alerting

**Log Levels:**
- `ERROR`: Critical system failures
- `WARN`: Performance degradation, unusual patterns
- `INFO`: Normal operation events, agent milestones
- `DEBUG`: Detailed processing information

**Alert Triggers:**
- High inflation (> 10%)
- System overload (CPU > 90%)
- Memory pressure (> 90% usage)
- Critical resource scarcity
- Psychology extreme events (panic/euphoria)

## Testing Strategy

### Test Categories

**Unit Tests:**
- Individual engine component functionality
- Mathematical model accuracy
- Data structure performance
- Edge case handling

**Integration Tests:**
- Cross-component interaction
- Event flow validation
- API endpoint functionality
- WebSocket communication

**Performance Tests:**
- Load testing with 100k agents
- Stress testing under extreme conditions
- Memory leak detection
- Response time validation

**Scenario Tests:**
- Market crash simulation
- Resource discovery impact
- Inflation spiral scenarios
- Agent behavior extremes

## Security Considerations

### Input Validation
- Agent action sanitization
- Rate limiting per agent
- Parameter boundary checking
- SQL injection prevention

### Access Control
- API key authentication
- Role-based permissions
- WebSocket connection limits
- Admin endpoint protection

### Data Protection
- Sensitive data encryption
- Agent identity anonymization
- Audit trail maintenance
- Backup security

## Future Enhancements

### Planned Features
- Machine learning integration for predictive models
- Advanced agent AI with neural networks
- Cross-market arbitrage opportunities
- International trade simulation
- Climate change economic modeling

### Scalability Improvements
- Microservice architecture migration
- Kubernetes deployment
- Database sharding strategies
- Edge computing integration

### Advanced Analytics
- Real-time anomaly detection
- Predictive crisis modeling
- Agent behavior clustering
- Market efficiency analysis
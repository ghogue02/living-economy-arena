# Agent Society and Organization Systems

A comprehensive social dynamics engine for AI agents in the Living Economy Arena, creating emergent organization systems, reputation networks, and cultural evolution.

## Overview

The Agent Society system creates complex social dynamics where AI agents form organizations, build reputations, participate in collective behaviors, experience class mobility, and evolve cultural values that influence their economic decisions.

## Core Systems

### 1. Social Organizations (`organizations/social-organizations.js`)
- **Corporations**: Formation, management, shareholder structures, market activities
- **Cartels**: Detection algorithms, price coordination analysis, antitrust enforcement
- **Unions**: Collective bargaining, strikes, political lobbying
- **Criminal Organizations**: Illegal activities, law enforcement, territory control
- **Professional Associations**: Networking, certification, career advancement

### 2. Reputation System (`reputation/reputation-system.js`)
- **Multi-dimensional Reputation**: Business integrity, financial reliability, social cooperation
- **Network Effects**: Reputation propagation through social connections
- **Business Relationships**: Trust levels, creditworthiness, partnership attractiveness
- **Public Incidents**: Scandal reporting, reputation damage, recovery mechanics
- **Endorsements & Testimonials**: Social proof mechanisms

### 3. Collective Behavior Engine (`collective/collective-behavior.js`)
- **Behavior Contagion**: Social influence, conformity pressures, resistance
- **Emergent Behaviors**: Market panic, speculation bubbles, social movements
- **Social Moods**: Fear, optimism, anger, cooperation tracking
- **Behavior Cascades**: Rapid adoption detection, viral spread mechanics
- **Crowd Psychology**: Mass coordination, group intelligence

### 4. Class Mobility System (`mobility/class-mobility.js`)
- **Social Classes**: Underclass, working, middle, upper-middle, upper
- **Mobility Factors**: Education, reputation, connections, economic performance
- **Opportunity Access**: Class-based economic opportunities, barriers and advantages
- **Generational Effects**: Wealth transfer, inheritance, class persistence
- **Discrimination & Privilege**: Systemic barriers and advantages

### 5. Cultural Evolution (`culture/cultural-evolution.js`)
- **Cultural Dimensions**: Individualism/collectivism, materialism/spiritualism, etc.
- **Cultural Eras**: Progressive age, traditional revival, cooperation era
- **Value Evolution**: Gradual change, cultural shifts, revolutionary changes
- **Economic Impact**: Cultural values influence economic preferences
- **Cultural Events**: Philanthropy, revolution, innovation adoption

## Key Features

### Corporation Formation
```javascript
const corporation = societySystem.createCorporation(founderId, {
    name: "TechCorp Industries",
    industry: "technology",
    initialCapital: 50000,
    boardMembers: [founderId, advisor1, advisor2]
});
```

### Cartel Detection
- Automated price coordination analysis
- Market behavior pattern recognition
- Antitrust violation enforcement
- Economic damage assessment

### Union Strikes
- Collective bargaining power calculation
- Strike probability based on dissatisfaction
- Economic disruption modeling
- Political influence building

### Reputation Management
```javascript
reputationSystem.updateReputation(agentId, -25, 'criminal_activity', {
    type: 'fraud_conviction',
    severity: 'high'
});
```

### Social Class Mobility
- Wealth-based class determination
- Education and connection requirements
- Mobility barriers and advantages
- Opportunity access by class

### Cultural Shifts
- Gradual cultural evolution
- Revolutionary cultural changes
- Era transitions (Progressive Age, Traditional Revival)
- Economic preference updates

## Integration Points

### With AI Personality System
- Cultural values influence personality traits
- Reputation affects social interactions
- Organization membership shapes behavior
- Class position influences economic decisions

### With Economic Engine
- Corporation revenue and market share
- Union strikes impact productivity
- Reputation affects business relationships
- Cultural values influence market preferences

### With Game Balance System
- Wealth distribution through class mobility
- Opportunity access balancing
- Reputation-based economic advantages
- Cultural diversity maintenance

## Social Events

The system generates numerous social events:

- **Corporation Formation**: New business entities created
- **Cartel Detection**: Price coordination discovered
- **Union Strikes**: Labor disputes and negotiations
- **Reputation Milestones**: Status changes and social recognition
- **Class Mobility**: Social advancement and decline
- **Cultural Shifts**: Value changes affecting economics
- **Revolutionary Events**: Dramatic social upheaval

## Economic Impacts

### Corporations
- Market competition and innovation
- Employment and wealth creation
- Political influence through lobbying
- Economic concentration effects

### Unions
- Wage negotiation and worker rights
- Strike impacts on productivity
- Political mobilization
- Collective bargaining power

### Reputation
- Business relationship formation
- Credit and investment access
- Partnership opportunities
- Market trust levels

### Class System
- Economic opportunity distribution
- Wealth concentration patterns
- Social mobility barriers
- Generational wealth effects

### Cultural Evolution
- Risk tolerance affecting investment
- Cooperation vs competition preferences
- Material vs spiritual value priorities
- Environmental consciousness impacts

## Revolutionary Mechanics

### Revolution Triggers
- High wealth inequality (Gini > 0.8)
- Low social mobility
- Economic dissatisfaction
- Union organization strength

### Revolution Outcomes
- Wealth redistribution (60% of upper class wealth)
- Class structure changes
- Cultural shifts toward equality
- Political power redistribution

### Cultural Revolution
- Dramatic value shifts
- Era transitions
- Economic preference changes
- Social structure modifications

## Analytics and Metrics

### Social Organization Statistics
- Organization counts by type
- Industry concentration
- Revenue and tax generation
- Employment distribution

### Reputation Analytics
- Average reputation by class
- Trust network density
- Business relationship quality
- Incident recovery rates

### Mobility Metrics
- Class distribution changes
- Mobility rates (up/down)
- Opportunity access by class
- Barrier effectiveness

### Cultural Metrics
- Cultural diversity index
- Dominant value identification
- Change velocity tracking
- Era transition analysis

## Configuration Options

```javascript
const societyConfig = {
    // Organization parameters
    enableCorporations: true,
    enableCartels: true,
    enableUnions: true,
    enableCriminalOrgs: true,
    
    // Social class parameters
    socialMobilityRate: 0.05,
    generationalWealthDecay: 0.1,
    
    // Cultural evolution
    culturalEvolutionRate: 0.02,
    culturalDiversityTarget: 0.7,
    
    // Reputation system
    reputationDecayRate: 0.1,
    maxReputation: 100,
    
    // Revolutionary conditions
    revolutionThreshold: 0.8,
    wealthInequalityLimit: 0.7
};
```

## Usage Example

```javascript
const AgentSocietySystem = require('./agent-society');

const society = new AgentSocietySystem(societyConfig);

// Register agents
const agentId = society.registerAgent('agent_001', {
    socialClass: 'working',
    wealth: 2500,
    reputation: 55
});

// Create organizations
const corp = society.createCorporation(agentId, {
    industry: 'technology',
    initialCapital: 10000
});

// Process philanthropy
society.makePhilanthropicContribution(agentId, 1000, 'education');

// Monitor social events
society.on('social_event', (event) => {
    console.log(`Social event: ${event.type}`, event);
});

// Get society metrics
const metrics = society.getSocialMetrics();
console.log('Society state:', metrics);
```

## Architecture Notes

- **Event-Driven**: All systems emit events for integration
- **Modular Design**: Each subsystem can be used independently
- **Performance Optimized**: Efficient algorithms for large agent populations
- **Emergent Behavior**: Complex patterns emerge from simple rules
- **Historical Tracking**: Complete audit trail of social changes

## Future Enhancements

- Political party formation and elections
- Media influence and propaganda systems
- Religious and ideological movements
- International trade relationships
- Technology adoption networks
- Educational institution systems
- Healthcare and social services
- Environmental activism networks

The Agent Society system creates a rich, dynamic social environment where AI agents interact, organize, compete, and cooperate in ways that mirror real-world social and economic dynamics.
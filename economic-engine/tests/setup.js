// Jest test setup
const { performance } = require('perf_hooks');

// Global test utilities
global.testUtils = {
  createMockAgent: (overrides = {}) => ({
    id: 'test-agent-' + Math.random().toString(36).substr(2, 9),
    isActive: true,
    sentiment: 0.5,
    wealth: 1000,
    portfolio: new Map(),
    pendingActions: [],
    behaviorProfile: 'balanced',
    createdAt: Date.now(),
    ...overrides
  }),
  
  createMockMarket: (overrides = {}) => ({
    id: 'test-market',
    name: 'Test Market',
    basePrice: 100,
    currentPrice: 100,
    supply: 1000000,
    demand: 1000000,
    volatility: 0.1,
    scarcity: 0.3,
    priceHistory: [],
    ...overrides
  }),
  
  measurePerformance: async (fn) => {
    const start = performance.now();
    const result = await fn();
    const end = performance.now();
    return {
      result,
      duration: end - start
    };
  }
};

// Increase timeout for integration tests
jest.setTimeout(30000);
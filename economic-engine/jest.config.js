module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'core/**/*.js',
    'markets/**/*.js',
    'indicators/**/*.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000
};
// setup.js - Jest setup file for server tests

// Set environment to test
process.env.NODE_ENV = 'test';

// Set test-specific environment variables
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '1h';

// Global test setup
beforeAll(() => {
  // Global setup for all tests
});

afterAll(() => {
  // Global cleanup for all tests
});

// Suppress console.log during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   warn: jest.fn(),
//   error: jest.fn(),
// };

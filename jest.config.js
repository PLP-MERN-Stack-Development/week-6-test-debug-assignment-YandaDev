// jest.config.js - Root Jest configuration file

module.exports = {
  projects: [
    // Server-side tests configuration
    {
      displayName: 'server',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/server/tests/**/*.test.js'],
      testPathIgnorePatterns: [
        '/node_modules/', 
        '/server/src/routes/',
        '/server/src/middleware/',
        '/server/src/models/',
        '/server/src/utils/'
      ],
      moduleFileExtensions: ['js', 'json', 'node'],
      setupFilesAfterEnv: ['<rootDir>/server/tests/setup.js'],
      coverageDirectory: '<rootDir>/coverage/server',
      collectCoverageFrom: [
        'server/src/**/*.js',
        '!server/src/server.js',
        '!server/src/uploads/**',
        '!server/src/seeds/**',
        '!server/src/logs/**',
        '!**/node_modules/**',
      ],
      testTimeout: 30000,
    },
    
    // Client-side tests configuration
    {
      displayName: 'client',
      testEnvironment: 'jsdom',
      testMatch: ['<rootDir>/client/src/tests/**/*.test.{js,jsx}'],
      moduleFileExtensions: ['js', 'jsx', 'json'],
      moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
        '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/client/src/tests/__mocks__/fileMock.js',
      },
      setupFilesAfterEnv: ['<rootDir>/client/src/tests/setup.js'],
      transform: {
        '^.+\\.(js|jsx)$': 'babel-jest',
      },
      coverageDirectory: '<rootDir>/coverage/client',
      collectCoverageFrom: [
        'client/src/**/*.{js,jsx}',
        '!client/src/main.jsx',
        '!client/src/index.css',
        '!client/src/App.css',
        '!**/node_modules/**',
      ],
      testTimeout: 10000,
    },
  ],
  
  // Global coverage settings
  collectCoverage: true,
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
  coverageThreshold: {
    global: {
      statements: 50,
      branches: 40,
      functions: 40,
      lines: 50,
    },
  },
}; 
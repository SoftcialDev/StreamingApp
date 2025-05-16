// apps/api/jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",

  // Only look in src and integration-test folders
  roots: ['<rootDir>/src', '<rootDir>/integration-test'],

  // Match both unit and integration tests
  testMatch: [
    "**/__tests__/**/*.+(ts|tsx|js)",
    "**/?(*.)+(spec|test).+(ts|tsx|js)"
  ],

  // Support module resolution for your common package
  moduleDirectories: ["node_modules", "<rootDir>/src"],

  // Load env vars
  setupFiles: ["dotenv/config"],

  // Clear mocks between tests
  clearMocks: true
};

// packages/common/jest.config.js
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],               
  testMatch: ["**/*.test.ts"],           
  moduleFileExtensions: ["ts","js","json"],
  setupFiles: ["dotenv/config"],
  testPathIgnorePatterns: ["<rootDir>/dist/", "node_modules"]
};

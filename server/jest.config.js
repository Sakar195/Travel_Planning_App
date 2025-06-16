// server/jest.config.js
module.exports = {
  testEnvironment: "node",
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",
  // An array of file extensions your modules use
  moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node"],
  // A setup file to run before each test file
  setupFilesAfterEnv: ["./jest.setup.js"], // We will create this next
  // Verbose output
  verbose: true,
  testTimeout: 30000, // Increase timeout to 30 seconds for integration tests
};

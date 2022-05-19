module.exports = {
  forceExit: true,
  setupFilesAfterEnv: ["<rootDir>/test/setupTest.js"],
  testMatch: ["<rootDir>/test/*.test.js", "<rootDir>/test/*.unittest.js"],
  watchPathIgnorePatterns: [
    "<rootDir>/.git",
    "<rootDir>/node_modules",
    "<rootDir>/examples/*/dist",
    "<rootDir>/coverage",
  ],
  modulePathIgnorePatterns: ["<rootDir>/.git"],
  transformIgnorePatterns: ["<rootDir>"],
  coverageDirectory: "<rootDir>/coverage",
  coveragePathIgnorePatterns: [
    "<rootDir>/test",
    "<rootDir>/example",
    "<rootDir>/node_modules",
  ],
  testEnvironment: "node",
  coverageReporters: ["clover", "json", "lcov", "text"],
};

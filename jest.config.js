module.exports = {
    transform: {
      "^.+\\.tsx?$": "ts-jest",
    },
    testRegex: "(.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    modulePathIgnorePatterns: ["<rootDir>/jest.config.js","<rootDir>/dist","<rootDir>/src"],
    roots: ["<rootDir>/src/", "<rootDir>/tests/"]
  };
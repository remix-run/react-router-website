/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    // Handle module aliases
    "^~/(.*)$": "<rootDir>/app/$1",
  },
};

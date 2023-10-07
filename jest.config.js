/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './lib',
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['text'],
};

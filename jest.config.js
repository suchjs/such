const { defaults: tsjPreset } = require('ts-jest/presets');
module.exports = {
  testEnvironment: 'node',
  transform: Object.assign({}, tsjPreset.transform),
  verbose: true,
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$',
  testPathIgnorePatterns: [
    '<rootDir>/lib/',
    '<rootDir>/dist/',
    '<rootDir>/node_modules/',
    '<rootDir>/local/',
  ],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverage: true,
  collectCoverageFrom: ['src/**/*.{ts,js}', '!<rootDir>/node_modules/'],
  moduleFileExtensions: ['ts', 'js'],
  moduleNameMapper: {
    '^@/(.*)': '<rootDir>/src/$1',
  },
  rootDir: '.',
};

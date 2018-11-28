const { defaults: tsjPreset } = require('ts-jest/presets');
module.exports = {
  testEnvironment: 'node',
  transform: Object.assign({},tsjPreset.transform),
  verbose: true,
  testRegex: "(/__tests__/.*|(\\.|/)(test|spec))\\.(jsx?|tsx?)$",
  testPathIgnorePatterns: ['<rootDir>/lib/','<rootDir>/dist/','<rootDir>/node_modules/','<rootDir>/src/'],
  coverageDirectory: '<rootDir>/',
  moduleFileExtensions: [
    "ts",
    "js",
  ],
  moduleNameMapper:{
    '^@/(.*)': '<rootDir>/src/$1'
  }
};
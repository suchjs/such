import Such from '../src/index';

describe('validate built-in types in nodejs', () => {
  // test a dict value
  test(':dict', () => {
    // wrong dict
    expect(() => {
      return Such.as(':dict');
    }).toThrow();
    // wrong dict without config
    expect(() => {
      return Such.as(':dict:&<dataDir>/dict.txt');
    }).toThrow();
  });
  // cascader
  test(':cascader', () => {
    // wrong cascader
    expect(() => {
      return Such.as(':cascader');
    }).toThrow();
    expect(() => {
      return Such.as(':cascader:#[root=true]');
    }).toThrow();
  });
});

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
  // test a dict
  test(':dict after loadData', async () => {
    await Such.loadData();
    expect(typeof Such.as(':dict:&<dataDir>/dict.txt') === 'string').toBeTruthy();
  });
  // cascader
  test(':cascader', () => {
    // wrong cascader
    expect(() => {
      return Such.as(':cascader');
    }).toThrow();
    // only root, without a data refrence
    expect(() => {
      return Such.as(':cascader:#[root=true]');
    }).toThrow();
  });
  // async
  test(':cascader after loadData', async () => {
    await Such.loadData();
    const data = Such.as<{
      country: string
      state: string,
      city: string
    }>({
      country: ":cascader:&<dataDir>/city.json:#[root=true]", 
      state: ":cascader:&./country", 
      city:":cascader:&./state" 
    });
    expect(typeof data.country === 'string').toBeTruthy();
    expect(typeof data.state === 'string').toBeTruthy();
    expect(typeof data.city === 'string').toBeTruthy();
  });
});

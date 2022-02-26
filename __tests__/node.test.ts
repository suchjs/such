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
    await Such.clearCache();
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
    // use user defined type
    const provinceData = Such.instance<{
      errno: number;
      errmsg: string;
      data?: {
        province: string;
        city: string;
        area: string;
      };
    }>({
      'errno:{1}': [0, 1],
      errmsg: ':string:{10,30}',
      'data?': {
        province: ':province',
        city: ':cascader:&./province',
        area: ':cascader:&./city',
      },
    });
    for (let i = 0; i < 100; i++) {
      const value = provinceData.a();
      if (value.data) {
        expect(value.data.province.length > 0).toBeTruthy();
        expect(value.data.city.length > 0).toBeTruthy();
        expect(value.data.area.length > 0).toBeTruthy();
      }
    }
  });
  // test async
  test('asc method', async ()=> {
    await Such.clearCache();
    for(const _i of Array.from({
      length: 100
    })){
      const data = await Such.asc<{
        errno: number;
        errmsg: string;
        data?: {
          province: string;
        }
      }>('mock.json');
      expect([0, 1].includes(data.errno)).toBeTruthy();
      expect(typeof data.errmsg === 'string').toBeTruthy();
      expect(typeof data.data === undefined || typeof data.data.province === 'string').toBeTruthy();
    }
  });
});

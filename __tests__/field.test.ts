import Such from '../src/browser';

describe('test filed', () => {
  // optional, equal to '{0,1}'
  test('test optional', () => {
    const optional = Such.instance({
      'a?': ':boolean',
    });
    let hasATimes = 0;
    let notHasATimes = 0;
    for (let i = 0; i < 100; i++) {
      const value = optional.a() as { 'a?': boolean };
      if (value.hasOwnProperty('a')) {
        hasATimes++;
      } else {
        notHasATimes++;
      }
    }
    expect(hasATimes > 0 && notHasATimes > 0).toBeTruthy();
  });
  // test oneOf
  test('test oneOf', () => {
    expect(() => {
      return Such.as(':string', {
        config: {
          oneOf: true,
        },
      });
    }).toThrow();
    expect(() => {
      return Such.as({
        'a:{1}': ':string',
      });
    }).toThrow();
    expect(() => {
      const instance = Such.instance({
        'a{2,3}': [true, false],
      });
      return instance.a({
        keys: {
          '/a': {
            index: 0,
          },
        },
      });
    }).toThrow();
    expect(() => {
      const instance = Such.instance({
        'a:{2,3}': [true, false],
      });
      return instance.a({
        keys: {
          '/a': {
            index: 2,
          },
        },
      });
    }).toThrow();
    expect(() => {
      const instance = Such.instance({
        'a:{1}': [true, false],
      });
      const totalTimes = 100;
      let okTimes = 0;
      for (let i = 0; i < totalTimes; i++) {
        const result = instance.a({
          keys: {
            '/a': {
              index: 0,
            },
          },
        }) as {
          a: boolean;
        };
        okTimes += +(result.a === true);
      }
      return okTimes === totalTimes;
    }).toBeTruthy();
  });
  // test length
  test('test list count', () => {
    // when the count of key is 1
    // it will not be an array
    const list = Such.instance({
      'a{0,5}': ':boolean',
    });
    for (let i = 0; i < 100; i++) {
      const value = list.a() as { a: boolean[] | undefined };
      if (Array.isArray(value.a)) {
        expect(value.a.length).toBeGreaterThanOrEqual(1);
        expect(value.a.length).toBeLessThanOrEqual(5);
      } else {
        expect(
          typeof value.a === 'boolean' || typeof value.a === 'undefined',
        ).toBeTruthy();
      }
    }
    // use a '+0' as always list
    const alwaysArrayList = Such.instance({
      'a{+0,5}': ':boolean',
    });
    for (let i = 0; i < 100; i++) {
      const value = alwaysArrayList.a() as { a: boolean[] };
      expect(Array.isArray(value.a)).toBeTruthy();
      expect(value.a.length).toBeGreaterThanOrEqual(0);
      expect(value.a.length).toBeLessThanOrEqual(5);
    }
    // use a '+1' as always list
    const alwaysHasItemArrayList = Such.instance({
      'a{+1,5}': ':boolean',
    });
    for (let i = 0; i < 100; i++) {
      const value = alwaysHasItemArrayList.a() as { a: boolean[] };
      expect(Array.isArray(value.a)).toBeTruthy();
      expect(value.a.length).toBeGreaterThanOrEqual(1);
      expect(value.a.length).toBeLessThanOrEqual(5);
    }
  });
  // test when value
  test("test when the list's value is an array", () => {
    const list = Such.instance({
      'a{3}': [':boolean', ':string'],
    });
    for (let i = 0; i < 100; i++) {
      const value = list.a() as { a: Array<boolean | string> };
      expect(Array.isArray(value.a)).toBeTruthy();
      expect(value.a.length).toEqual(3);
      const flag = (value.a as (boolean | string)[]).every(
        (item) => typeof item === 'boolean' || typeof item === 'string',
      );
      expect(flag).toBeTruthy();
    }
    // use a ':' to use one of the array's index field
    const oneOfList = Such.instance({
      'a:{3}': [':boolean', ':string'],
    });
    for (let i = 0; i < 100; i++) {
      const value = oneOfList.a() as { a: boolean[] | string[] };
      expect(Array.isArray(value.a)).toBeTruthy();
      expect(value.a.length).toEqual(3);
      if (typeof value.a[0] === 'boolean') {
        const flag = (value.a as boolean[]).every(
          (item) => typeof item === 'boolean',
        );
        expect(flag).toBeTruthy();
      } else {
        const flag = (value.a as string[]).every(
          (item) => typeof item === 'string',
        );
        expect(flag).toBeTruthy();
      }
    }
  });
  // test all
  test('test all key config', () => {
    const list = Such.instance({
      'a:{+0,3}?': ['hello', true],
    });
    let optionalATimes = 0;
    for (let i = 0; i < 100; i++) {
      const value = list.a() as { a?: Array<boolean> | Array<string> };
      if (value.hasOwnProperty('a')) {
        expect(Array.isArray(value.a)).toBeTruthy();
        if (value.a.length) {
          if (typeof value.a[0] === 'string') {
            const flag = (value.a as string[]).every(
              (item) => typeof item === 'string',
            );
            expect(flag).toBeTruthy();
          } else {
            const flag = (value.a as boolean[]).every(
              (item) => typeof item === 'boolean',
            );
            expect(flag).toBeTruthy();
          }
        }
      } else {
        optionalATimes++;
      }
    }
    expect(optionalATimes > 0).toBeTruthy();
  });
  // test keys options
  test('test instance keys option ', () => {
    const opt = {
      'a?': 'a is optinal',
    };
    const totalTimes = 100;
    const optInstance = Such.instance(opt);
    // normal without options
    let hasATimes = 0;
    for (let i = 0; i < totalTimes; i++) {
      const data = optInstance.a() as typeof opt;
      if (data.hasOwnProperty('a')) {
        hasATimes++;
      }
    }
    expect(hasATimes > 0 && hasATimes < 100).toBeTruthy();
    // with options
    // use max 0 to set never appear
    hasATimes = 0;
    for (let i = 0; i < totalTimes; i++) {
      const data = optInstance.a({
        keys: {
          '/a': {
            max: 0,
          },
        },
      }) as typeof opt;
      if (data.hasOwnProperty('a')) {
        hasATimes++;
      }
    }
    expect(hasATimes).toEqual(0);
    // use exist
    hasATimes = 0;
    for (let i = 0; i < totalTimes; i++) {
      const data = optInstance.a({
        keys: {
          '/a': {
            exist: false,
          },
        },
      }) as typeof opt;
      if (data.hasOwnProperty('a')) {
        hasATimes++;
      }
    }
    expect(hasATimes).toEqual(0);
    // use min 1 to set must appear
    hasATimes = 0;
    for (let i = 0; i < totalTimes; i++) {
      const data = optInstance.a({
        keys: {
          '/a': {
            min: 1,
          },
        },
      }) as typeof opt;
      if (data.hasOwnProperty('a')) {
        hasATimes++;
      }
    }
    expect(hasATimes).toEqual(totalTimes);
    // use exist
    hasATimes = 0;
    for (let i = 0; i < totalTimes; i++) {
      const data = optInstance.a({
        keys: {
          '/a': {
            exist: true,
          },
        },
      }) as typeof opt;
      if (data.hasOwnProperty('a')) {
        hasATimes++;
      }
    }
    expect(hasATimes).toEqual(totalTimes);
    // wrong optional
    expect(() => {
      return optInstance.a({
        keys: {
          '/a': {
            // the min is great than the max
            min: 1,
            max: 0,
          },
        },
      });
    }).toThrow();
    expect(() => {
      return optInstance.a({
        keys: {
          '/a': {
            // the max is great than 1
            min: 0,
            max: 2,
          },
        },
      });
    }).toThrow();
    // min and max
    const minMax = {
      'a{2,5}': '2 to 5 times',
    };
    const minMaxInstance = Such.instance(minMax);
    // normal without min and max
    let thanMinTimes = 0;
    for (let i = 0; i < totalTimes; i++) {
      const data = minMaxInstance.a() as {
        a: string[];
      };
      expect(Array.isArray(data.a)).toBeTruthy();
      expect(data.a.length >= 2 && data.a.length <= 5).toBeTruthy();
      if (data.a.length > 2) {
        thanMinTimes++;
      }
    }
    expect(thanMinTimes > 0).toBeTruthy();
    // wrong min and max key rule
    expect(() => {
      return minMaxInstance.a({
        keys: {
          '/a': {
            // the min is great than the original max
            min: 6,
          },
        },
      });
    }).toThrow();
    expect(() => {
      return minMaxInstance.a({
        keys: {
          '/a': {
            // the min is less than the original max
            min: 1,
          },
        },
      });
    }).toThrow();
    expect(() => {
      return minMaxInstance.a({
        keys: {
          '/a': {
            // the max is less than the original min
            max: 1,
          },
        },
      });
    }).toThrow();
    expect(() => {
      return minMaxInstance.a({
        keys: {
          '/a': {
            // the max is great than the original max
            max: 7,
          },
        },
      });
    }).toThrow();
    expect(() => {
      return minMaxInstance.a({
        keys: {
          '/a': {
            // the min is great than the max
            max: 3,
            min: 4,
          },
        },
      });
    }).toThrow();
    // use a min and max key rule
    for (let i = 0; i < totalTimes; i++) {
      const data = minMaxInstance.a({
        keys: {
          '/a': {
            // set the min equal max
            min: 3,
            max: 3,
          },
        },
      }) as {
        a: string[];
      };
      expect(Array.isArray(data.a)).toBeTruthy();
      expect(data.a.length === 3).toBeTruthy();
    }
    // set the max as original min
    for (let i = 0; i < totalTimes; i++) {
      const data = minMaxInstance.a({
        keys: {
          '/a': {
            // set the min equal max
            max: 2,
          },
        },
      }) as {
        a: string[];
      };
      expect(Array.isArray(data.a)).toBeTruthy();
      expect(data.a.length === 2).toBeTruthy();
    }
    // set the max as original min
    for (let i = 0; i < totalTimes; i++) {
      const data = minMaxInstance.a({
        keys: {
          '/a': {
            // set the min equal max
            min: 5,
          },
        },
      }) as {
        a: string[];
      };
      expect(Array.isArray(data.a)).toBeTruthy();
      expect(data.a.length === 5).toBeTruthy();
    }
    // both has min and max
    const optMinMax = {
      'a{2,5}?': 'optional and array',
    };
    const optMinMaxInstance = Such.instance(optMinMax);
    expect(() => {
      return optMinMaxInstance.a({
        keys: {
          '/a': {
            // the max is bigger than the original max
            max: 7,
          },
        },
      });
    }).toThrow();
    expect(() => {
      return optMinMaxInstance.a({
        keys: {
          '/a': {
            // the min is less than the original min
            min: 1,
          },
        },
      });
    }).toThrow();
    expect(() => {
      return optMinMaxInstance.a({
        keys: {
          '/a': {
            // the max is less than the original min
            max: 1,
          },
        },
      });
    }).toThrow();
    expect(() => {
      return optMinMaxInstance.a({
        keys: {
          '/a': {
            // the min is bigger than the original max
            min: 7,
          },
        },
      });
    }).toThrow();
    expect(() => {
      return optMinMaxInstance.a({
        keys: {
          '/a': {
            exist: false,
            // the exist is false, no need to set min or max
            min: 3,
          },
        },
      });
    }).toThrow();
    expect(() => {
      return optMinMaxInstance.a({
        keys: {
          '/a': {
            exist: true,
            // the min is bigger than the original max
            min: 7,
          },
        },
      });
    }).toThrow();
    // use both exist and min and max
    hasATimes = 0;
    for (let i = 0; i < totalTimes; i++) {
      const data = optMinMaxInstance.a({
        keys: {
          '/a': {
            exist: false,
          },
        },
      }) as typeof opt;
      if (data.hasOwnProperty('a')) {
        hasATimes++;
      }
    }
    expect(hasATimes).toEqual(0);
    // exist true
    hasATimes = 0;
    for (let i = 0; i < totalTimes; i++) {
      const data = optMinMaxInstance.a({
        keys: {
          '/a': {
            exist: true,
          },
        },
      }) as typeof opt;
      if (data.hasOwnProperty('a')) {
        hasATimes++;
      }
    }
    expect(hasATimes).toEqual(totalTimes);
    // both
    hasATimes = 0;
    for (let i = 0; i < totalTimes; i++) {
      const data = optMinMaxInstance.a({
        keys: {
          '/a': {
            exist: true,
            min: 3,
            max: 3,
          },
        },
      }) as {
        a?: string[];
      };
      if (data.hasOwnProperty('a') && data.a.length === 3) {
        hasATimes++;
      }
    }
    expect(hasATimes).toEqual(totalTimes);
    // both
    hasATimes = 0;
    for (let i = 0; i < totalTimes; i++) {
      const data = optMinMaxInstance.a({
        keys: {
          '/a': {
            exist: false,
          },
        },
      }) as {
        a?: string[];
      };
      if (data.hasOwnProperty('a')) {
        hasATimes++;
      }
    }
    expect(hasATimes).toEqual(0);
    // keys
    const instance = Such.instance({
      'a{2,5}?': 'a',
      'b:{1}': [
        {
          'c?': 'c',
        },
        {
          'd{+1,3}': 'd',
        },
      ],
    });
    const ruleKeys = instance.keys();
    expect(ruleKeys.hasOwnProperty('/a')).toBeTruthy();
    expect(ruleKeys['/a'].optional).toBeTruthy();
    expect(ruleKeys['/a'].min).toEqual(2);
    expect(ruleKeys['/a'].max).toEqual(5);
    expect(ruleKeys['/b'].min).toEqual(1);
    expect(ruleKeys['/b'].max).toEqual(1);
    expect(ruleKeys['/b'].oneOf).toBeTruthy();
    expect(ruleKeys['/b/0/c'].optional).toBeTruthy();
    expect(ruleKeys['/b/1/d'].min).toEqual(1);
    expect(ruleKeys['/b/1/d'].max).toEqual(3);
    expect(ruleKeys['/b/1/d'].alwaysArray).toBeTruthy();
  });
});

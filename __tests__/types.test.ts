import Such from '../src/browser';

describe('test built-in types', () => {
  const DICTS = ['a', 'b', 'c'];
  const COUNTRIES = {
    China: ['BeiJing', 'ShangHai', 'WuHan'],
    America: ['Washington', 'New York', 'Los Angeles'],
  };
  Such.assign('dict', DICTS);
  Such.assign('countries', COUNTRIES);
  // test string
  test(':string', () => {
    // string with length 3
    const string = Such.instance(':string:{3}');
    for (let i = 0; i < 100; i++) {
      const value = string.a();
      expect(typeof value === 'string' && value.length === 3).toBeTruthy();
    }
    // wrong unicode range
    expect(() => {
      return Such.as(':string:[65]:{3}');
    }).toThrow();
    expect(() => {
      return Such.as(':string:[\\u41]:{3}');
    }).toThrow();
    expect(() => {
      return Such.as(':string:[\\u41,90]:{3}');
    }).toThrow();
    expect(() => {
      return Such.as(':string:[65,\\u5a]:{3}');
    }).toThrow();
    expect(() => {
      return Such.as(':string:[90,65]:{3}');
    }).toThrow();
    expect(() => {
      return Such.as(':string:[95,90-65]:{3}');
    }).toThrow();
    expect(() => {
      return Such.as(':string:[95,\\u5a-\\u41]:{3}');
    }).toThrow();
    expect(() => {
      return Such.as(':string:[\\u1000,\\u1000000]:{3}');
    }).toThrow();
    // some character
    const A = Such.instance(':string:[65,65]:{3}');
    for (let i = 0; i < 100; i++) {
      const value = A.a();
      expect(typeof value === 'string' && value === 'AAA').toBeTruthy();
    }
    // uppercase string
    const uppercase = Such.instance(':string:[65,90]:{3,5}');
    for (let i = 0; i < 100; i++) {
      const value = uppercase.a();
      expect(typeof value === 'string').toBeTruthy();
      if (typeof value === 'string') {
        expect(value.length >= 3 && value.length <= 5).toBeTruthy();
        for (const ch of value) {
          const charCode = ch.charCodeAt(0);
          expect(charCode >= 65 && charCode <= 90).toBeTruthy();
        }
      }
    }
    // uppercase and dash
    const uppercaseDash = Such.instance(':string:[95,65-90]:{3,5}');
    for (let i = 0; i < 100; i++) {
      const value = uppercaseDash.a();
      expect(typeof value === 'string').toBeTruthy();
      if (typeof value === 'string') {
        expect(/^[A-Z_]{3,5}$/.test(value)).toBeTruthy();
      }
    }
    // alphaNumbericDash string
    const alphaNumericDash1 = Such.instance(
      ':string:[95,65-90,48-57,97-122]:{3,5}',
    );
    for (let i = 0; i < 100; i++) {
      const value = alphaNumericDash1.a();
      expect(typeof value === 'string').toBeTruthy();
      if (typeof value === 'string') {
        expect(/^\w{3,5}$/.test(value)).toBeTruthy();
      }
    }
    // mix unicode
    const alphaNumericDash2 = Such.instance(
      ':string:[65-90,\\u5f,48-57,97-122]:{3,5}',
    );
    for (let i = 0; i < 100; i++) {
      const value = alphaNumericDash2.a();
      expect(typeof value === 'string').toBeTruthy();
      if (typeof value === 'string') {
        expect(/^\w{3,5}$/.test(value)).toBeTruthy();
      }
    }
  });
  // test number
  test(':number', () => {
    // a default random number
    const random = Such.instance(':number');
    for (let i = 0; i < 100; i++) {
      const value = random.a() as number;
      expect(!isNaN(value)).toBeTruthy();
    }
    // wrong numbers
    expect(() => {
      return Such.as(':number:[]');
    }).toThrow();
    expect(() => {
      return Such.as(':number:[1]');
    }).toThrow();
    expect(() => {
      return Such.as(':number:[true,2]');
    }).toThrow();
    expect(() => {
      return Such.as(':number:[1,2,3]');
    }).toThrow();
    expect(() => {
      return Such.as(':number:[2,1]');
    }).toThrow();
    // a number
    const number = Such.instance(':number:[100,200]');
    for (let i = 0; i < 100; i++) {
      const value = number.a() as number;
      expect(!isNaN(value) && value >= 100 && value <= 200).toBeTruthy();
    }
    // a number with step
    const stepNumber = Such.instance(':number:[100,200]:#[step=2]');
    for (let i = 0; i < 100; i++) {
      const value = stepNumber.a() as number;
      expect(
        !isNaN(value) &&
          value >= 100 &&
          value <= 200 &&
          (value - 100) % 2 === 0,
      ).toBeTruthy();
    }
    // one hundred
    const hundred = Such.instance(':number:[100,100]');
    for (let i = 0; i < 100; i++) {
      const value = hundred.a() as number;
      expect(value === 100).toBeTruthy();
    }
    // integer
    const integer = Such.instance(':number:[100,200]:%d');
    for (let i = 0; i < 100; i++) {
      const value = integer.a() as number;
      expect(
        !isNaN(value) && value % 1 === 0 && value >= 100 && value <= 200,
      ).toBeTruthy();
    }
    // not contains min
    const integerExcludeMin = Such.instance(
      ':number:[100,200]:#[exclude="min"]',
    );
    for (let i = 0; i < 100; i++) {
      const value = integerExcludeMin.a() as number;
      expect(!isNaN(value)).toBeTruthy();
      expect(value).toBeGreaterThan(100);
      expect(value).toBeLessThanOrEqual(200);
    }
    // not contains max
    const integerExcludeMax = Such.instance(
      ':number:[100,200]:#[exclude="max"]',
    );
    for (let i = 0; i < 100; i++) {
      const value = integerExcludeMax.a() as number;
      expect(!isNaN(value)).toBeTruthy();
      expect(value).toBeGreaterThanOrEqual(100);
      expect(value).toBeLessThan(200);
    }
    // not contains both min and max
    const integerExcludeBoth = Such.instance(
      ':number:[100,200]:#[exclude="both"]',
    );
    for (let i = 0; i < 100; i++) {
      const value = integerExcludeBoth.a() as number;
      expect(!isNaN(value)).toBeTruthy();
      expect(value).toBeGreaterThan(100);
      expect(value).toBeLessThan(200);
    }
  });
  // test date type
  test(':date', () => {
    // a default random date
    const random = Such.instance(':date');
    for (let i = 0; i < 100; i++) {
      const value = random.a() as Date;
      expect(value instanceof Date).toBeTruthy();
    }
    // a date with range
    const rangeDate = Such.instance(':date:["2015-01-01","2020-01-01"]');
    for (let i = 0; i < 100; i++) {
      const value = rangeDate.a() as Date;
      expect(value instanceof Date).toBeTruthy();
      expect(+value).toBeGreaterThanOrEqual(+new Date('2015/01/01 00:00:00'));
      expect(+value).toBeLessThanOrEqual(+new Date('2020/01/01 00:00:00'));
    }
    // a date with format
    const formatDate = Such.instance(':date:%yyyy-mm-dd HH\\:MM\\:ss');
    for (let i = 0; i < 100; i++) {
      const value = formatDate.a() as string;
      expect(typeof value === 'string').toBeTruthy();
      expect(
        /^\d{4}\-\d{2}\-\d{2} [0-5][0-9]:[0-5][0-9]:[0-5][0-9]$/.test(value),
      ).toBeTruthy();
    }
    // wrong date
    expect(() => {
      return Such.as(':date:["+1 days","-1 days"]');
    }).toThrow();
    expect(() => {
      return Such.as(':date:["+1 days"]');
    }).toThrow();
    expect(() => {
      return Such.as(':date:["tomorrow","yesteday"]');
    }).toThrow();
    expect(() => {
      return Such.as(':date:["2022","2021"]');
    }).toThrow();
  });
  // test increment
  test(':increment', () => {
    // make a increment
    const increment = Such.instance(':increment');
    const startValue = increment.a() as number;
    const nowValue = increment.a() as number;
    expect(startValue).toEqual(1);
    expect(nowValue - startValue).toEqual(1);
    // make a increment with step
    const stepIncrement = Such.instance(':increment:#[step=3]');
    const stepStartValue = stepIncrement.a() as number;
    const stepNowValue = stepIncrement.a() as number;
    expect(stepNowValue - stepStartValue).toEqual(3);
    // make a increment with start
    const startIncrement = Such.instance(':increment:#[start=0]');
    expect(startIncrement.a() as number).toEqual(0);
    // make a increment with length
    const lenIncrement = Such.instance(':increment:{3}');
    expect(lenIncrement.a() as number[]).toEqual([1, 2, 3]);
    expect(lenIncrement.a() as number[]).toEqual([4, 5, 6]);
  });
  // test ref
  test(':ref', () => {
    // make a ref
    const ref = {
      a: 'hello',
      b: ':ref:&./a',
    };
    const refData = Such.as(ref) as typeof ref;
    expect(refData.a).toEqual(ref.a);
    expect(refData.a).toEqual(refData.b);
    // make a absolute ref
    const absRef = {
      b: 'world',
      c: ':ref:&/b',
    };
    const absRefData = Such.as(absRef) as typeof absRef;
    expect(absRefData.b).toEqual(absRef.b);
    expect(absRefData.b).toEqual(absRefData.c);
    // make a multiple ref
    const multiRef = {
      a: 'hello',
      b: 'world',
      c: ':ref:&/a,./b',
    };
    const multiRefData = Such.as(multiRef) as typeof multiRef & {
      c: string[];
    };
    expect(multiRefData.c).toEqual([multiRef.a, multiRef.b]);
    // wrong ref without a path
    expect(() => {
      return Such.as({
        a: 1,
        b: ':ref',
      });
    }).toThrow();
  });
  // test a regexp
  test(':regexp', () => {
    // wrong regexp
    expect(() => {
      return Such.as(':regexp');
    }).toThrow();
    expect(() => {
      return Such.as(':regexp://');
    }).toThrow();
    expect(() => {
      return Such.as(':regexp:/(/');
    }).toThrow();
    // a normal regexp
    const regexp = Such.instance(':regexp:/a{3,5}/i');
    for (let i = 0; i < 100; i++) {
      const value = regexp.a() as string;
      expect(typeof value === 'string').toBeTruthy();
      expect(/^a{3,5}$/i.test(value)).toBeTruthy();
    }
    // a regexp with named group
    const namedRegexp = Such.instance(':regexp:/(?<ch>a|b|c)/:#[ch="c"]');
    expect(namedRegexp.a() as string).toEqual('c');
  });
  // test a dict value
  test(':dict', () => {
    // wrong dict
    expect(() => {
      return Such.as(':dict');
    }).toThrow();
    expect(() => {
      return Such.as(':dict:#[data=1]');
    }).toThrow();
    // dict
    const dict = Such.instance(':dict:#[data=dict]');
    for (let i = 0; i < 100; i++) {
      const value = dict.a() as string;
      expect(typeof value === 'string').toBeTruthy();
      expect(DICTS.includes(value)).toBeTruthy();
    }
  });
  // cascader
  test(':cascader', () => {
    // wrong cascader
    expect(() => {
      return Such.as(':cascader');
    }).toThrow();
    expect(() => {
      return Such.as(':cascader:#[data=countries]');
    }).toThrow();
    expect(() => {
      return Such.as(':cascader:#[root=true]');
    }).toThrow();
    // a cascader
    const cascader = {
      country: ':cascader:#[root=true,data=countries]',
      city: ':cascader:&./country',
    };
    const cascaderData = Such.instance(cascader);
    for (let i = 0; i < 100; i++) {
      const value = cascaderData.a() as typeof cascader;
      const country = value.country as keyof typeof COUNTRIES;
      expect(COUNTRIES.hasOwnProperty(country)).toBeTruthy();
      expect(COUNTRIES[country].includes(value.city)).toBeTruthy();
    }
  });
});

describe('test built-in recommend types', () => {
  // :integer
  test(':integer', () => {
    const integer = Such.instance(':integer:[1,100]');
    for (let i = 0; i < 100; i++) {
      const value = integer.a() as number;
      expect(typeof value === 'number' && value % 1 === 0).toBeTruthy();
    }
    // alias integer
    const int = Such.instance(':int:[1,100]');
    for (let i = 0; i < 100; i++) {
      const value = int.a() as number;
      expect(typeof value === 'number' && value % 1 === 0).toBeTruthy();
    }
  });
  // boolean
  test(':boolean', () => {
    const integer = Such.instance(':boolean');
    for (let i = 0; i < 100; i++) {
      const value = integer.a() as boolean;
      expect(typeof value === 'boolean').toBeTruthy();
    }
  });
  // uppsercase
  test(':uppercase', () => {
    const uppercase = Such.instance(':uppercase:{3}');
    for (let i = 0; i < 100; i++) {
      const value = uppercase.a() as string;
      expect(
        typeof value === 'string' && /^[A-Z]{3}$/.test(value),
      ).toBeTruthy();
    }
  });
  // lowercase
  test(':lowercase', () => {
    const lowercase = Such.instance(':lowercase:{3}');
    for (let i = 0; i < 100; i++) {
      const value = lowercase.a() as string;
      expect(
        typeof value === 'string' && /^[a-z]{3}$/.test(value),
      ).toBeTruthy();
    }
  });
  // alphaNumericDash
  test(':alphaNumericDash', () => {
    const alphaNumericDash = Such.instance(':alphaNumericDash:{3}');
    for (let i = 0; i < 100; i++) {
      const value = alphaNumericDash.a() as string;
      expect(typeof value === 'string' && /^\w{3}$/.test(value)).toBeTruthy();
    }
  });
  // color$hex
  test(':color$hex', () => {
    const color$hex = Such.instance(':color$hex');
    for (let i = 0; i < 100; i++) {
      const value = color$hex.a() as string;
      expect(
        typeof value === 'string' && /^#[0-9A-F]{6}$/.test(value),
      ).toBeTruthy();
    }
  });
  // color$rgb
  test(':color$rgb', () => {
    const color$rgb = Such.instance(':color$rgb');
    for (let i = 0; i < 100; i++) {
      const value = color$rgb.a() as string;
      expect(/^rgb\((.*)?\)$/.test(value)).toBeTruthy();
      const segs = RegExp.$1.split(',');
      expect(segs.length).toEqual(3);
      const flag = segs.every((num: string) => {
        const actualNum = Number(num);
        return !isNaN(actualNum) && actualNum >= 0 && actualNum <= 255;
      });
      expect(flag).toBeTruthy();
    }
  });
  // color$rgba
  test(':color$rgba', () => {
    const color$rgba = Such.instance(':color$rgba');
    for (let i = 0; i < 100; i++) {
      const value = color$rgba.a() as string;
      expect(/^rgba\((.*)?\)$/.test(value)).toBeTruthy();
      const segs = RegExp.$1.split(',');
      expect(segs.length).toEqual(4);
      const flag = segs.every((num: string, index: number) => {
        const actualNum = Number(num);
        return (
          !isNaN(actualNum) &&
          (index < 3
            ? actualNum >= 0 && actualNum <= 255
            : actualNum >= 0 && actualNum <= 1)
        );
      });
      expect(flag).toBeTruthy();
    }
  });
  // color$hsl
  test(':color$hsl', () => {
    const color$hsl = Such.instance(':color$hsl');
    for (let i = 0; i < 100; i++) {
      const value = color$hsl.a() as string;
      expect(/^hsl\((.*)?\)$/.test(value)).toBeTruthy();
      const segs = RegExp.$1.split(',');
      expect(segs.length).toEqual(3);
      const flag = segs.every((num: string, index: number) => {
        if (index === 0) {
          const actualNum = Number(num);
          return !isNaN(actualNum) && actualNum >= 0 && actualNum <= 360;
        } else {
          return /^([1-9][0-9]|[0-9]|100)%$/.test(num);
        }
      });
      expect(flag).toBeTruthy();
    }
  });
});

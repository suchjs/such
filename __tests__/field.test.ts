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
});

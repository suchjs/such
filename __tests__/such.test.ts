import Such from '../src/browser';

describe('validate built-in types', () => {
  // test string
  test(':string', () => {
    // string with length 3
    const string = Such.instance(':string:{3}');
    for (let i = 0; i < 100; i++) {
      const value = string.a();
      expect(typeof value === 'string' && value.length === 3).toBeTruthy();
    }
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
    // alphaNumberic string
    const alphaNumericDash = Such.instance(
      ':string:[95,65-90,48-57,97-122]:{3,5}',
    );
    for (let i = 0; i < 100; i++) {
      const value = alphaNumericDash.a();
      expect(typeof value === 'string').toBeTruthy();
      if (typeof value === 'string') {
        expect(/^\w{3,5}$/.test(value)).toBeTruthy();
      }
    }
  });
  // test number
  test(':number', () => {
    // a number
    const number = Such.instance(':number:[100,200]');
    for (let i = 0; i < 100; i++) {
      const value = number.a() as number;
      expect(!isNaN(value) && value >= 100 && value <= 200).toBeTruthy();
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
      expect(!isNaN(value) && value % 1 === 0).toBeTruthy();
    }
  });
});

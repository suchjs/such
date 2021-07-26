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
    // uppercase string
    const uppercase = Such.instance(':string:[65,90]:{3,5}');
    for (let i = 0; i < 100; i++) {
      const value = uppercase.a();
      expect(typeof value === 'string').toBeTruthy();
      if (typeof value === 'string') {
        expect(value.length >= 3 && value.length <= 5);
        for (const ch of value) {
          const charCode = ch.charCodeAt(0);
          expect(charCode >= 65 && charCode <= 90).toBeTruthy();
        }
      }
    }
  });
});

import Parser from '../src/data/parser';
const getFunc = (context: string) => {
  return Parser.parse(context).Func;
};
describe('validate parser and dispatch', () => {
  test('count parser', () => {
    expect(Parser.parse('[100,200]')).toEqual({
      Size: {
        range: ['100', '200'],
      },
    });
    expect(Parser.parse('[\\u4e00,\\9af5]')).toEqual({
      Size: {
        range: ['\\u4e00', '\\9af5'],
      },
    });
    expect(Parser.parse('[aa\\,a,bbb]')).toEqual({
      Size: {
        range: ['aa\\,a', 'bbb'],
      },
    });
  });
  test('length parser', () => {
    expect(Parser.parse('{1}')).toEqual({
      Length: {
        least: '1',
        most: '1',
      },
    });
    expect(Parser.parse('{1,5}')).toEqual({
      Length: {
        least: '1',
        most: '5',
      },
    });
    expect(() => Parser.parse('{1,}')).toThrow();
    expect(() => Parser.parse('{,1}')).toThrow();
    expect(() => Parser.parse('{\\,,1}')).toThrow();
  });
  test('config parser', () => {
    expect(Parser.parse('#[a=true,b="333",c=1e10,d,f=false,g="\\""]')).toEqual({
      Config: {
        a: true,
        b: '333',
        c: 1e10,
        d: true,
        f: false,
        g: '"',
      },
    });
  });
  test('regexp parser', () => {
    expect(Parser.parse('/aa(bb)/i')).toEqual({
      Regexp: {
        rule: '/aa(bb)/i',
      },
    });
    expect(Parser.parse('/aa\\//i')).toEqual({
      Regexp: {
        rule: '/aa\\//i',
      },
    });
  });
  test('format parser', () => {
    expect(Parser.parse('%yyyy-mm-dd')).toEqual({
      Format: {
        format: '%yyyy-mm-dd',
      },
    });
    expect(Parser.parse('%yyyy-mm-dd HH\\:MM\\:ss')).toEqual({
      Format: {
        format: '%yyyy-mm-dd HH\\:MM\\:ss',
      },
    });
  });
  test('function parser', () => {
    // const fn1 = getFunc('@fn');
    // expect(fn1.params[0]).toEqual([]);
    // expect(fn1.options[0]).toEqual({
    //   name: 'fn',
    //   params: [],
    // });
    // expect(fn1.queue).toEqual(['fn']);
    // const fn2 = getFunc(
    //   '@fn(true,obj.name,333)|fn2(333)|fn("haha",\'heihei\')',
    // );
    // expect(fn2.queue).toEqual(['fn', 'fn2', 'fn']);
    // expect(fn2.params[0]).toEqual([true, 333]);
    // expect(fn2.params[2]).toEqual(['haha', 'heihei']);
  });
});

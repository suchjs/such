import Such, { createNsSuch } from '../src/browser';

describe('validate namespace', () => {
  // test namespace
  test('test namespace', () => {
    const mySuch = createNsSuch('my');
    const hisSuch = createNsSuch('his');
    mySuch.define('myString', 'string', '{1}');
    expect((mySuch.as(':myString') as string).length).toEqual(1);
    expect(Such.as(':myString')).toEqual(':myString');
    // export type
    mySuch.setExportType('myString');
    expect((hisSuch.as(':@my/myString') as string).length).toEqual(1);
  });
});

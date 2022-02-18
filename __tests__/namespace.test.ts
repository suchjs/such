import Such, { createNsSuch } from '../src/browser';

describe('test namespace', () => {
  // test namespace
  test('test create namespace such', () => {
    const mySuch = createNsSuch('my');
    const hisSuch = createNsSuch('his');
    mySuch.define('myString', 'string', '{1}');
    expect((mySuch.as(':myString') as string).length).toEqual(1);
    expect(Such.as(':myString')).toEqual(':myString');
    // export type
    mySuch.setExportType('myString');
    expect((hisSuch.as(':@my/myString') as string).length).toEqual(1);
  });
  // test namespace
  test('test namespace api', () => {
    // global such
    Such.define('nsEnum', [1, 2, 3]);
    Such.assign('nsData', [1, 2, 3]);
    Such.assign('nsFn', function(){
      // do nothing
    });
    // global such no need to export
    expect((() => {
      Such.setExportType('nsEnum');
      Such.setExportFn('nsFn');
      Such.setExportVar('nsData');
      return false;
    })()).toBeFalsy();
    // ns such
    const apiSuch = createNsSuch('api');
    apiSuch.assign('data', [1, 2, 3]);
    apiSuch.assign('fn', function(){
      // do nothing
    });
    apiSuch.define('enum', [1, 2, 3]);
    // export function
    expect(() => {
      apiSuch.setExportFn('fn1');
    }).toThrow();
    expect((() => {
      apiSuch.setExportFn('fn');
      return true;
    })()).toBeTruthy();
    // export variable
    expect(() => {
      apiSuch.setExportVar('data1');
    }).toThrow();
    expect((() => {
      apiSuch.setExportVar('data');
      return true;
    })()).toBeTruthy();
    // export type
    expect(() => {
      apiSuch.setExportType('enum1');
    }).toThrow();
    expect((() => {
      apiSuch.setExportType('enum');
      return true;
    })()).toBeTruthy();
  });
});

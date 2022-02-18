import PathMap from '../src/helpers/pathmap';
import { dateformat, strtotime } from '../src/helpers/dateformat';

describe('test helper methods', () => {
  // test pathmap
  test('test pathmap', () => {
    // map 1
    const map = new PathMap(false);
    map.set([0], 1);
    map.set([1], 2);
    expect(map.has([0])).toBeTruthy();
    expect(map.has([2])).toBeFalsy();
    expect(map.get([0])).toEqual(1);
    expect(map.get([1])).toEqual(2);
    expect(map.get([])).toEqual([1, 2]);
    // map2
    const map2 = new PathMap(false);
    map2.set([0, 0], 1);
    map2.set([0, 1], 2);
    expect(map2.has([0])).toBeTruthy();
    expect(map2.has([0, 3])).toBeFalsy();
    expect(map2.has([1])).toBeFalsy();
    expect(map2.get([0, 0])).toEqual(1);
    expect(map2.get([0, 1])).toEqual(2);
    expect(map2.get([])).toEqual([[1, 2]]);
  });
  // test dateformat
  test('test dateformat', () => {
    // strtotime
    expect(() => {
      strtotime({});
    }).toThrow();
    expect(strtotime(1645180122694).getFullYear() === 2022).toBeTruthy();
    // today
    const today = dateformat('yyyy', strtotime('today'));
    expect(today).toEqual((new Date).getFullYear().toString());
    // tomorrow
    const tomorrow = strtotime('tomorrow');
    const curDay = new Date;
    curDay.setDate(curDay.getDate() + 1);
    expect(tomorrow.getDate()).toEqual(curDay.getDate());
    // cur date
    const curDate = strtotime('20220218');
    curDate.setHours(15, 50, 25);
    curDate.setMilliseconds(335);
    expect(dateformat('dddd', curDate)).toEqual('Friday');
    expect(dateformat('ddd', curDate)).toEqual('Fri');
    expect(dateformat('mmmm', curDate)).toEqual('February');
    expect(dateformat('mmm', curDate)).toEqual('Feb');
    expect(dateformat('yy', curDate)).toEqual('22');
    expect(dateformat('h', curDate)).toEqual('3');
    expect(dateformat('hh', curDate)).toEqual('03');
    expect(dateformat('l', curDate)).toEqual('335');
    expect(dateformat('L', curDate)).toEqual('34');
    expect(dateformat('tt', curDate)).toEqual('pm');
    expect(dateformat('t', curDate)).toEqual('p');
    expect(dateformat('TT', curDate)).toEqual('PM');
    expect(dateformat('T', curDate)).toEqual('P');
    expect(dateformat('S', curDate)).toEqual('th');
    expect(dateformat('N', curDate)).toEqual('5');
    // new date
  });

});

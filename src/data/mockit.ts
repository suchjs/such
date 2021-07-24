// mockit
import number from '../mockit/number';
import string from '../mockit/string';
import regexp from '../mockit/regexp';
import date from '../mockit/date';
import ref from '../mockit/ref';
import id from '../mockit/id';
import { TMClassList } from '../types/mockit';

export const mockitList: TMClassList = {
  number,
  string,
  regexp,
  date,
  ref,
  id,
};
// all mockits
export const ALL_MOCKITS: TMClassList = {};

export const addMockitList = (mockitList: TMClassList): void => {
  Object.keys(mockitList).map((key: string) => {
    if (key.startsWith('_')) {
      // ignore special mockits name begin with '_'
      return;
    }
    ALL_MOCKITS[key] = mockitList[key];
  });
};

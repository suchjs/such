// mockit
import number from '../mockit/number';
import string from '../mockit/string';
import regexp from '../mockit/regexp';
import date from '../mockit/date';
import ref from '../mockit/ref';
import increment from '../mockit/increment';
import { TMClassList } from '../types/mockit';

// all mockits
export const ALL_MOCKITS: TMClassList = {
  number,
  string,
  regexp,
  date,
  ref,
  increment,
};

// add new mockits
export const addMockitList = (mockitList: TMClassList): void => {
  Object.keys(mockitList).map((key: string) => {
    ALL_MOCKITS[key] = mockitList[key];
  });
};

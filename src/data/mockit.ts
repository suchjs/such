// mockit
import number from '../mockit/number';
import string from '../mockit/string';
import regexp from '../mockit/regexp';
import date from '../mockit/date';
import ref from '../mockit/ref';
import increment from '../mockit/increment';
import template from '../mockit/template';
import { TMClassList } from '../types/mockit';
import globalStore from './store';
import { tmplMockitName } from './config';
// all mockits
export const builtinMockits = {
  number,
  string,
  regexp,
  date,
  ref,
  increment,
  [tmplMockitName]: template,
};

// add new mockits
export const addMockitList = (mockitList: TMClassList): void => {
  Object.keys(mockitList).map((key: string) => {
    globalStore.mockits[key] = mockitList[key];
  });
};

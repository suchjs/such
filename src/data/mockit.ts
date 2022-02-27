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
import { TStrList } from '../types/common';
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

/**
 * 
 * @param mockitList TMClassList
 * @param isBuiltin boolean
 */
export const addMockitList = (mockitList: TMClassList, isBuiltin?: boolean): void => {
  Object.keys(mockitList).map((key: string) => {
    globalStore.mockits[key] = mockitList[key];
    if(isBuiltin){
      addBuiltinTypes(key);
    }
  });
};

/**
 * 
 * @param args TStrList
 */
export const addBuiltinTypes = (...args: TStrList): void => {
  globalStore.builtins.push(...args);
}
import Mockit from './mockit/namespace';
import { TObj, TFunc, TStrList } from './types';
export interface Store {
  (name: string, value: unknown, alwaysVar: boolean): void;
  vars: TObj;
  fns: TObj<TFunc>;
  mockits: TObj<Mockit>;
  alias: TObj<string>;
  aliasTypes: TStrList;
  fileCache: {
    [index: string]: TStrList;
  };
  config: TObj;
}
const store: Store = (() => {
  const fns: TObj<TFunc> = {};
  const vars: TObj = {};
  const fn = ((name: string, value: unknown, alwaysVar: boolean): void => {
    if (typeof value !== 'function' || alwaysVar) {
      vars[name] = value;
    } else {
      fns[name] = value as TFunc;
    }
  }) as Store;
  fn.fns = fns;
  fn.vars = vars;
  fn.mockits = {};
  fn.alias = {};
  fn.aliasTypes = [];
  fn.fileCache = {};
  fn.config = {};
  return fn;
})();
export default store;

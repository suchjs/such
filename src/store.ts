import { NormalObject } from './types';
export interface Store {
  (name: string, value: any, alwaysVar: boolean): void;
  vars: NormalObject;
  fns: NormalObject;
  mockits: NormalObject;
  alias: NormalObject;
  aliasTypes: string[];
  fileCache: NormalObject;
  config: NormalObject;
}
const store: Store = (() => {
  const fns: {[index: string]: () => any} = {};
  const vars: NormalObject = {};
  const fn = ((name: string, value: any, alwaysVar: boolean): void => {
    if(typeof value !== 'function' || alwaysVar) {
      vars[name] = value;
    } else {
      fns[name] = value;
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

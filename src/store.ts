import Mockit from './mockit/namespace';
import { TObject } from './types';
export interface Store {
  (name: string, value: unknown, alwaysVar: boolean): void;
  vars: TObject;
  fns: TObject;
  mockits: TObject<Mockit<unknown>>;
  alias: TObject<string>;
  aliasTypes: string[];
  fileCache: TObject;
  config: TObject;
}
const store: Store = (() => {
  const fns: { [index: string]: () => unknown } = {};
  const vars: TObject = {};
  const fn = ((name: string, value: unknown, alwaysVar: boolean): void => {
    if (typeof value !== 'function' || alwaysVar) {
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

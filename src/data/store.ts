import { isObject } from '../helpers/utils';
import Mockit from '../core/mockit';
import { TObj, TFunc, TStrList } from '../types/common';
import { TMModifierFn, TMRuleFn } from '../types/mockit';
import { TSSConfig } from '../types/node';
type MockitsCache<T> = TObj<{
  rules: TStrList;
  ruleFns: TObj<TMRuleFn>;
  modifiers: TStrList;
  modifierFns: TObj<TMModifierFn<T>>;
  define?: TObj;
}>;
export interface IFileCache {
  mtime: number;
  content: string;
}
export interface Store {
  (name: string, value: unknown, alwaysVar: boolean): void;
  vars: TObj;
  fns: TObj<TFunc>;
  mockits: TObj<Mockit | unknown>;
  mockitsCache: MockitsCache<unknown>;
  alias: TObj<string>;
  aliasTypes: TStrList;
  fileCache: {
    [index: string]: IFileCache | TStrList | string;
  };
  config: TSSConfig;
}
export const isFileCache = (
  target: IFileCache | string | TStrList,
): target is IFileCache => {
  return isObject(target) && typeof target.mtime === 'number';
};
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
  fn.mockitsCache = {};
  fn.alias = {};
  fn.aliasTypes = [];
  fn.fileCache = {};
  fn.config = {};
  return fn;
})();
export default store;

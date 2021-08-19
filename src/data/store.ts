import { isObject } from '../helpers/utils';
import { TObj, TFunc, TStrList } from '../types/common';
import {
  TMClass,
  TMClassList,
  TMFactoryOptions,
  TMModifierFn,
  TMRuleFn,
} from '../types/mockit';
import { TSSConfig } from '../types/node';
type MockitsCache<T> = TObj<{
  rules: TStrList;
  ruleFns: TObj<TMRuleFn>;
  modifiers: TStrList;
  modifierFns: TObj<TMModifierFn<T>>;
  define?: Partial<TMFactoryOptions>;
}>;
export interface IFileCache {
  mtime: number;
  content: string;
}
export interface Store {
  (name: string, value: unknown, alwaysVar: boolean): void;
  vars: TObj;
  fns: TObj<TFunc>;
  mockits: TMClassList;
  exportLimit: (nsType: string) => boolean;
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
const createStore = (): Store => {
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
  fn.exportLimit = (_nsType: string) => false;
  fn.mockitsCache = {};
  fn.alias = {};
  fn.aliasTypes = [];
  fn.fileCache = {};
  fn.config = {};
  return fn;
};
const globalStore = createStore();
// namespace stores
const nsStores: Store[] = [];
const nsStoreHashs: {
  [index: string]: number;
} = {};
/**
 * return a store with namespace
 * @param namespace [string]
 * @returns Store|never
 */
export const createNsStore = (namespace: string): Store | never => {
  if (nsStoreHashs.hasOwnProperty(namespace)) {
    throw new Error(
      `The store namespace '${namespace}' has been in used when you called the method 'createNsStore'.`,
    );
  }
  const store = createStore();
  nsStoreHashs[namespace] = nsStores.length;
  nsStores.push(store);
  return store;
};
/**
 * @param namespace [string]
 * @returns Store|undefined
 */
export const getNsStore = (namespace: string): Store => {
  if (nsStoreHashs.hasOwnProperty(namespace)) {
    return nsStores[nsStoreHashs[namespace]];
  }
};
/**
 *
 * @param type [string]
 * @param namespace [string]
 * @param thirdNs [string]
 * @returns
 */
export const getNsMockit = (
  type: string,
  namespace?: string,
  thirdNs?: string,
): {
  klass: TMClass;
  realType: string;
} => {
  let curStore: Store;
  let realType = type;
  if (!namespace) {
    // from the root builtin
    curStore = globalStore;
  } else if (!thirdNs) {
    // from self
    curStore = getNsStore(namespace);
  } else {
    // from the third
    curStore = getNsStore(thirdNs);
    if (!(curStore && curStore.exportLimit(type))) {
      curStore = undefined;
    }
  }
  if (curStore) {
    const { alias, mockits } = curStore;
    if (alias.hasOwnProperty(type)) {
      realType = alias[type];
    }
    return {
      klass: mockits[realType],
      realType,
    };
  }
};
/* The global store */

export default globalStore;

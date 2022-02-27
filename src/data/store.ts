import { hasOwn, isObject } from '../helpers/utils';
import { TObj, TFunc, TStrList } from '../types/common';
import {
  TMClass,
  TMClassList,
  TMFactoryOptions,
  TMModifierFn,
  TMRuleFn,
} from '../types/mockit';
import { TSSConfig, TSuchSettings } from '../types/node';
// import { builtinMockits } from './mockit';
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

export type TFileCacheData = IFileCache | TStrList | string;
export interface Store {
  (name: string, value: unknown, alwaysVar: boolean): void;
  namespace?: string;
  vars: TObj;
  fns: TObj<TFunc>;
  mockits: TMClassList;
  exports: {
    vars: TObj;
    fns: TObj<TFunc>;
    types: string[];
  };
  mockitsCache: MockitsCache<unknown>;
  alias: TObj<string>;
  aliasTypes: TStrList;
  builtins: TStrList;
  fileCache: {
    [index: string]: TFileCacheData;
  };
  extends: {
    [index: string]: TSuchSettings;
  };
  config: TSSConfig;
  clear: (clearCache?: boolean) => void;
}
export const isFileCache = (
  target: IFileCache | string | TStrList,
): target is IFileCache => {
  return isObject(target) && typeof target.mtime === 'number';
};
const createStore = (namespace?: string): Store => {
  const fn = ((name: string, value: unknown, alwaysVar: boolean): void => {
    if (typeof value !== 'function' || alwaysVar) {
      fn.vars[name] = value;
    } else {
      fn.fns[name] = value as TFunc;
    }
  }) as Store;
  fn.builtins = [];
  // initialize the store data
  const init = (clearCache?: boolean) => {
    fn.fns = {};
    fn.vars = {};
    fn.exports = {
      vars: {},
      fns: {},
      types: [],
    };
    fn.mockitsCache = {};
    fn.alias = {};
    fn.aliasTypes = [];
    if (clearCache) fn.fileCache = {};
    fn.config = {};
    fn.extends = {};
  };
  const clearMockits = namespace
    ? () => {
        // if has namespace, just clear
        fn.mockits = {};
      }
    : () => {
        const mockits = fn.builtins.reduce((ret, key) => {
          ret[key] = fn.mockits[key];
          return ret;
        }, {} as TMClassList);
        fn.mockits = mockits;
      };
  fn.mockits = {};
  fn.namespace = namespace;
  fn.clear = (clearCache?: boolean) => {
    init(clearCache);
    clearMockits();
  };
  init(true);
  return fn;
};
const globalStore = createStore();
// namespace stores
const nsStores: TObj<Store> = {};
/**
 * return a store with namespace
 * @param namespace [string]
 * @returns Store|never
 */
export const createNsStore = (namespace: string): Store | never => {
  if (!namespace || hasOwn(nsStores, namespace)) {
    throw new Error(
      `The store with namespace '${namespace}' has been created.`,
    );
  }
  const store = createStore(namespace);
  nsStores[namespace] = store;
  return store;
};
/**
 * @param namespace [string]
 * @returns Store|undefined
 */
export const getNsStore = (namespace: string): Store => {
  if (hasOwn(nsStores, namespace)) {
    return nsStores[namespace];
  }
};
/**
 *
 * @param type [string]
 * @param namespace [string]
 * @param thirdNs [string]
 * @returns
 */
interface INsRealMockit {
  klass: TMClass;
  realType: string;
}
export const getNsMockit = (
  type: string,
  namespace?: string,
  thirdNs?: string,
): INsRealMockit => {
  let curStore: Store;
  let useSelfNs = false;
  const handle = (store: Store): INsRealMockit => {
    const { alias, mockits } = store;
    let realType = type;
    if (hasOwn(alias, type)) {
      realType = alias[type];
    }
    return {
      klass: mockits[realType],
      realType,
    };
  };
  let ret: INsRealMockit;
  if (!namespace) {
    // from the root builtin
    ret = handle(globalStore);
  } else if (!thirdNs || (useSelfNs = thirdNs === namespace)) {
    // from self
    curStore = getNsStore(namespace);
    // use self namespace, always return data from
    if (useSelfNs) {
      ret = handle(curStore);
    } else {
      // seek self namespace store first
      if (curStore) {
        ret = handle(curStore);
      }
      // if not found, seek for global
      if (!ret.klass) {
        ret = handle(globalStore);
      }
    }
  } else {
    // from the third
    curStore = getNsStore(thirdNs);
    if (curStore && curStore.exports.types.includes(type)) {
      ret = handle(curStore);
    }
  }
  // if found at last, return
  if (ret && ret.klass) {
    return ret;
  }
  return {
    klass: undefined,
    realType: type,
  };
};
/* The global store */
export default globalStore;

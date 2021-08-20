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
    if (alias.hasOwnProperty(type)) {
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
    if (curStore && curStore.exportLimit(type)) {
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

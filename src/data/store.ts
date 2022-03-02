import {
  hasOwn,
  isArray,
  isObject,
  setArrayEmtpy,
  setObjectEmpty,
} from '../helpers/utils';
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
  mutates?: TStrList;
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
  builtins: TStrList;
  vars: TObj;
  fns: TObj<TFunc>;
  mockits: TMClassList;
  mockitsCache: MockitsCache<unknown>;
  alias: TObj<string>;
  aliasTypes: TStrList;
  fileCache: {
    [index: string]: TFileCacheData;
  };
  extends: {
    [index: string]: TSuchSettings;
  };
  config: TSSConfig;
  exports: {
    vars: TObj;
    fns: TObj<TFunc>;
    types: string[];
  };
  clear: (options?: {
    reset?: boolean;
    exclude?: Array<TStoreAllowedClearFileds> | TStoreAllowedClearFileds;
  }) => void;
}

export type TStoreAllowedClearFileds =
  | 'vars'
  | 'fns'
  | 'mockits'
  | 'mockitsCache'
  | 'alias'
  | 'aliasTypes'
  | 'fileCache'
  | 'config'
  | 'extends'
  | 'exports';

export const isFileCache = (
  target: IFileCache | string | TStrList,
): target is IFileCache => {
  return isObject(target) && typeof target.mtime === 'number';
};
const plainObjectFields = [
  'fns',
  'vars',
  'mockitsCache',
  'alias',
  'fileCache',
  'config',
  'extends',
] as const;
const createStore = (namespace?: string): Store => {
  const fn = ((name: string, value: unknown, alwaysVar: boolean): void => {
    if (typeof value !== 'function' || alwaysVar) {
      fn.vars[name] = value;
    } else {
      fn.fns[name] = value as TFunc;
    }
  }) as Store;
  fn.clear = (options?: {
    reset?: boolean;
    exclude?: Array<TStoreAllowedClearFileds> | TStoreAllowedClearFileds;
  }) => {
    const reset = options?.reset;
    const exclude = options?.exclude
      ? isArray(options.exclude)
        ? options.exclude
        : [options.exclude]
      : [];
    if (reset) {
      clearByInit(...exclude);
    } else {
      clearOrigin(...exclude);
    }
  };
  const clearMockits = namespace
    ? (reset?: boolean) => {
        if (reset) {
          fn.mockits = {};
        } else {
          // if has namespace, just clear
          setObjectEmpty(fn.mockits);
        }
      }
    : (reset?: boolean) => {
        if (reset) {
          const mockits = fn.builtins.reduce((ret, key) => {
            ret[key] = fn.mockits[key];
            return ret;
          }, {} as TMClassList);
          fn.mockits = mockits;
        } else {
          for (const key of Object.getOwnPropertyNames(fn.mockits)) {
            if (!fn.builtins.includes(key)) {
              delete fn.mockits[key];
            }
          }
        }
      };
  // clear but also re init
  const clearByInit = (...excludes: Array<TStoreAllowedClearFileds>) => {
    plainObjectFields.forEach((key) => {
      if (!excludes.includes(key)) {
        fn[key] = {};
      }
    });
    if (!excludes.includes('mockits')) {
      clearMockits(true);
    }
    if (!excludes.includes('exports')) {
      fn.exports = {
        vars: {},
        fns: {},
        types: [],
      };
    }
    if (!excludes.includes('aliasTypes')) {
      fn.aliasTypes = [];
    }
  };
  // clear the origin data
  const clearOrigin = (...excludes: Array<TStoreAllowedClearFileds>) => {
    plainObjectFields.forEach((key) => {
      if (!excludes.includes(key)) {
        setObjectEmpty(fn[key] as TObj);
      }
    });
    if (!excludes.includes('mockits')) {
      clearMockits();
    }
    if (!excludes.includes('exports')) {
      setArrayEmtpy(fn.exports.types);
      setObjectEmpty(fn.exports.vars);
      setObjectEmpty(fn.exports.fns);
    }
    if (!excludes.includes('aliasTypes')) {
      setArrayEmtpy(fn.aliasTypes);
    }
  };
  // initialize the origin data
  fn.namespace = namespace;
  fn.builtins = [];
  fn.mockits = {};
  fn.clear({
    reset: true,
    exclude: 'mockits',
  });
  return fn;
};
const globalStoreData = createStore();
// namespace stores
const nsStores: TObj<Store> = {};
/**
 * return a storeData with namespace
 * @param namespace [string]
 * @returns Store|never
 */
export const createNsStore = (namespace: string): Store | never => {
  if (!namespace || hasOwn(nsStores, namespace)) {
    throw new Error(
      `The storeData with namespace '${namespace}' has been created.`,
    );
  }
  const storeData = createStore(namespace);
  nsStores[namespace] = storeData;
  return storeData;
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
  let curStoreData: Store;
  let useSelfNs = false;
  const handle = (storeData: Store): INsRealMockit => {
    const { alias, mockits } = storeData;
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
    ret = handle(globalStoreData);
  } else if (!thirdNs || (useSelfNs = thirdNs === namespace)) {
    // from self
    curStoreData = getNsStore(namespace);
    // use self namespace, always return data from
    if (useSelfNs) {
      ret = handle(curStoreData);
    } else {
      // seek self namespace storeData first
      if (curStoreData) {
        ret = handle(curStoreData);
      }
      // if not found, seek for global
      if (!ret.klass) {
        ret = handle(globalStoreData);
      }
    }
  } else {
    // from the third
    curStoreData = getNsStore(thirdNs);
    if (curStoreData && curStoreData.exports.types.includes(type)) {
      ret = handle(curStoreData);
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
/* The global storeData */
export default globalStoreData;

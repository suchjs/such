import { AssignType, TAssignedData } from '../types/instance';
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
  (name: string, value: unknown, assignType: AssignType): void;
  namespace?: string;
  builtins: TStrList;
  vars: TObj;
  fns: TObj<TFunc>;
  varsTypes: TObj<AssignType>;
  fnsTypes: TObj<AssignType>;
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
  get(name: string): TAssignedData;
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
  'mockitsCache',
  'alias',
  'fileCache',
  'config',
  'extends',
] as const;
const createStore = (namespace?: string): Store => {
  const fn = ((name: string, value: unknown, assignType: AssignType): void => {
    const alwaysVar = (assignType & 0b1) > 0;
    const isVar = typeof value !== 'function' || alwaysVar;
    const assignTypes = isVar ? fn.varsTypes : fn.fnsTypes;
    const lastAssignType: AssignType = (assignType >> 1) << 1;
    const isEqualNameDiffType = hasOwn(isVar ? fn.fns : fn.vars, name);
    if (isEqualNameDiffType) {
      const names = ['variable', 'function'];
      const reversed = +!isVar;
      throw new Error(
        `The field '${name}' that assigned as a ${
          names[0 ^ reversed]
        } was also assigned as a ${names[1 ^ reversed]} before.`,
      );
    }
    if (hasOwn(assignTypes, name)) {
      const origAssignType = assignTypes[name];
      // must strict or equal than before
      if (lastAssignType < origAssignType) {
        throw new Error(
          `The variable '${name}' has ever assigned with a assign type '${AssignType[origAssignType]}', can't re assigned with a less strictly type '${AssignType[lastAssignType]}' again.`,
        );
      }
      switch (lastAssignType) {
        case AssignType.MustNotOverride:
          throw new Error(
            `The variable '${name}' with a assign type '${AssignType[lastAssignType]}' has ever exist,can't assign it again.`,
          );
        case AssignType.OverrideIfNotExist:
          return;
        case AssignType.Override:
        default:
          break;
      }
    } else {
      assignTypes[name] = lastAssignType;
    }
    if (typeof value !== 'function' || alwaysVar) {
      fn.vars[name] = value;
    } else {
      fn.fns[name] = value as TFunc;
    }
  }) as Store;
  fn.get = (name: string): TAssignedData => {
    if (hasOwn(fn.vars, name)) {
      return {
        exist: true,
        value: fn.vars[name],
        type: fn.varsTypes[name],
      };
    }
    if (hasOwn(fn.fns, name)) {
      return {
        exist: true,
        value: fn.fns[name],
        type: fn.fnsTypes[name],
      };
    }
    return {
      exist: false,
      value: undefined,
    };
  };
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
    // clear the assigned variables
    (['fns', 'vars'] as const).forEach((key) => {
      if (!excludes.includes(key)) {
        fn[key] = {};
        fn[`${key}Types`] = {};
      }
    });
    // clear other object types
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
    // clear the assigned variables
    (['fns', 'vars'] as const).forEach((key) => {
      if (!excludes.includes(key)) {
        setObjectEmpty(fn[key]);
        setObjectEmpty(fn[`${key}Types`]);
      }
    });
    // clear other object types
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

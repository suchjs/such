import { TFunc, TObj } from '../types/common';
import { TFieldPath } from './pathmap';
import { IPPPathItem } from '../types/parser';
import { Mocker } from '../core/such';
/**
 *
 * @param target [unkown]
 * @returns [string] the type of the target
 */
export const typeOf = (target: unknown): string => {
  return Object.prototype.toString.call(target).slice(8, -1);
};

/**
 *
 * @param target [unkown]
 * @returns [boolean] check if the target is a function
 */
export const isFn = <T = TFunc>(target: unknown): target is T =>
  typeof target === 'function';

/**
 *
 * @param target [unkown]
 * @returns [boolean] check if the target is an array
 */
export const isArray = <T = unknown[]>(target: unknown): target is T => {
  return Array.isArray(target);
};

/**
 *
 * @param target [unkown]
 * @returns [boolean] check if the target is a plain object
 */
export const isObject = (target: unknown): target is TObj =>
  typeOf(target) === 'Object';

/**
 *
 * @param target [unkown]
 * @returns [boolean] check if the target is a plain object and not empty
 */
export const isNoEmptyObject = (target: unknown): boolean => {
  return isObject(target) && Object.keys(target).length > 0;
};

/**
 *
 * @param target [unkown]
 * @returns [boolean] check if the target is a promise object
 */
export const isPromise = (target: unknown): boolean => {
  return (
    typeOf(target) === 'Promise' || (isObject(target) && isFn(target.then))
  );
};

/**
 *
 * @param chars [string] regexp instance context string
 * @returns [string] escaped context string
 */
export const encodeRegexpChars = (chars: string): string => {
  return chars.replace(/([()\[{^$.*+?\/\-])/g, '\\$1');
};

/**
 *
 * @param min [number] the min of the random number
 * @param max [number] the max of the random number
 * @returns [number] a random number between min and max
 */
export const makeRandom = (min: number, max: number): number => {
  if (min === max) {
    return min;
  }
  return min + Math.floor(Math.random() * (max + 1 - min));
};

/**
 *
 * @param begin [character] the begin character
 * @param end [character] the end character
 * @param args [characters] more character begin and end pairs
 * @returns [character[]] all characters between begin and end
 */
export const makeStrRangeList = (
  begin?: string,
  end?: string,
  ...args: string[]
): string[] => {
  if (!begin || !end) {
    return [];
  }
  const min = begin.charCodeAt(0);
  const max = end.charCodeAt(0);
  const results = [];
  let cur = min;
  while (cur <= max) {
    results.push(String.fromCharCode(cur++));
  }
  return args.length > 0 && args.length % 2 === 0
    ? results.concat(makeStrRangeList(...args))
    : results;
};

/**
 *
 * @param start [number] the range of the start
 * @param end [number] the range of the end
 * @param step [number] the step of the range
 * @returns number[]
 */
export const range = (start: number, end: number, step = 1): number[] => {
  const length = Math.floor((end - start) / step) + 1;
  return Array.from(
    {
      length,
    },
    (_: undefined, index: number) => {
      return start + index * step;
    },
  );
};

/**
 *
 * @returns [boolean] return random true or false
 */
export const isOptional = (): boolean => {
  return Math.random() >= 0.5;
};

/**
 *
 * @param target [string] the string need be capitalized
 * @returns [string]
 */
export const capitalize = (target: string): string => {
  return target && target.length
    ? target.charAt(0).toUpperCase() + target.slice(1)
    : '';
};

/**
 *
 * @param target [string]
 * @returns [string] translate back the translate characters
 */
export const decodeTrans = (target: string): string => {
  return target.replace(/\\(.)/g, '$1');
};

/**
 *
 * @param exp [string] a javascript expression
 * @returns [unkown|never]
 */
export const getExp = (exp: string): unknown | never => {
  const fn = new Function('', `return ${exp}`);
  try {
    return fn();
  } catch (e) {
    throw new Error(`wrong expression of "${exp}".reason:${e}`);
  }
};

/**
 *
 * @param args [unkown[]]
 * @returns [unkown|never]
 */
export const getExpValue = (...args: unknown[]): unknown | never => {
  const param = '__$__';
  const value = args.pop();
  let cur;
  while ((cur = args.shift()) !== undefined) {
    try {
      return new Function(param, `return ${param}.${value}`)(cur);
    } catch (e) {
      // continue
    }
  }
};

function deepCopyHandle<T>(target: T, copy: T): void {
  let keys: Array<keyof T> = [];
  if (isObject(copy)) {
    keys = Object.keys(copy) as Array<keyof T>;
  } else if (isArray(copy)) {
    keys = range(0, copy.length - 1) as Array<keyof T>;
  }
  keys.map((key) => {
    const from = copy[key];
    const to = target[key];
    const fromType = typeOf(from);
    const toType = typeOf(to);
    if (fromType === 'Object' || fromType === 'Array') {
      target[key] = (toType === fromType
        ? target[key]
        : fromType === 'Object'
        ? {}
        : []) as typeof from;
      deepCopy(target[key], from);
    } else {
      target[key] = from;
    }
  });
}

/**
 *
 * @param target [any]
 * @param args [unkown[]]
 * @returns [unkown] deep copy the nest of args into target
 */
export const deepCopy = <T = unknown>(target: T, ...args: unknown[]): T => {
  let isObj = false;
  let isArr = false;
  if ((isObj = isObject(target)) || (isArr = isArray(target))) {
    for (let i = 0, j = args.length; i < j; i++) {
      const copy = args[i];
      if ((isObj && isObject(copy)) || (isArr && isArray(copy))) {
        deepCopyHandle(target, copy);
      }
    }
  }
  return target;
};

/**
 *
 * @param obj [object]
 * @param keys [string[]]
 * @returns [object] get the pointed `keys` of the `obj` and remove them from `obj`
 */
export const shifTObj = <T = TObj>(
  obj: T,
  keys: Array<keyof T>,
): Partial<T> => {
  const res: Partial<T> = {};
  keys.map((key) => {
    res[key] = obj[key];
    delete obj[key];
  });
  return res;
};

/**
 *
 * @param res [array]
 * @returns [Array<Promise>] translate the array of `res` into array of `Promise<res>`
 */
export const withPromise = <T = unknown>(res: T[]): Array<Promise<T> | T> => {
  let last: Array<Promise<T> | T> = [];
  let hasPromise = false;
  res.map((item: T) => {
    const imPromise = isPromise(item);
    if (hasPromise) {
      if (imPromise) {
        last.push(item);
      } else {
        last.push(Promise.resolve(item));
      }
    } else {
      if (imPromise) {
        hasPromise = true;
        last = last.map((cur) => Promise.resolve(cur));
        last.push(item);
      } else {
        last.push(item);
      }
    }
  });
  return last;
};

/**
 *
 * @param first [TFieldPath]
 * @param second [TFieldPath]
 * @returns [boolean] check if two paths has a relation of parent and sub child
 */
export const isRelativePath = (
  first: TFieldPath,
  second: TFieldPath,
): boolean => {
  const len = first.length;
  if (len > second.length) {
    return isRelativePath(second, first);
  }
  let i = 0;
  while (i < len) {
    const cur = first[i].toString();
    const compare = second[i].toString();
    if (cur !== compare) {
      break;
    }
    i++;
  }
  return i === len;
};

/**
 *
 * @param item [IPPPathItem]
 * @param mocker [Mocker]
 * @returns
 */
export const getPathInfo = (
  item: IPPPathItem,
  mocker: Mocker,
): {
  lastPath: TFieldPath;
  isExists: boolean;
} => {
  let isExists = true;
  let lastPath: TFieldPath;
  const { path } = mocker;
  if (!item.relative) {
    lastPath = item.path;
  } else {
    if (path.length < item.depth + 1) {
      isExists = false;
    } else {
      lastPath = path.slice(0, -(1 + item.depth)).concat(item.path);
    }
  }
  return {
    lastPath,
    isExists,
  };
};

/**
 *
 * @param item [IPPPathItem]
 * @param mocker [Mocker]
 * @returns [Mocker|never] get the reference mocker by path
 */
export const getRefMocker = (
  item: IPPPathItem,
  mocker: Mocker,
): Mocker | never => {
  const { root, path } = mocker;
  const { instances } = root;
  const { isExists, lastPath } = getPathInfo(item, mocker);
  let refMocker: Mocker;
  if (isExists && (refMocker = instances.get(lastPath))) {
    if (isRelativePath(path, lastPath)) {
      throw new Error(
        `the ref path of "${path.join('/')}" and "${lastPath.join(
          '/',
        )}" is a relative path.`,
      );
    } else {
      return refMocker;
    }
  } else {
    throw new Error(
      `the path of "${
        lastPath ? '/' + lastPath.join('/') : item.fullpath
      }" is not exists in the instances.`,
    );
  }
};

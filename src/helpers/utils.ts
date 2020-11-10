import { TFunc, TObj } from '../types/common';
import { TFieldPath } from './pathmap';
import { IPPPathItem } from '../types/parser';
import { Mocker } from '../core/such';
export const encodeRegexpChars = (chars: string): string => {
  return chars.replace(/([()\[{^$.*+?\/\-])/g, '\\$1');
};
export const typeOf = (target: unknown): string => {
  return Object.prototype.toString.call(target).slice(8, -1);
};
export const isFn = <T = TFunc>(target: unknown): target is T =>
  typeof target === 'function';

export const makeRandom = (min: number, max: number): number => {
  if (min === max) {
    return min;
  } else {
    return min + Math.floor(Math.random() * (max + 1 - min));
  }
};
export const makeStrRangeList = (
  first?: string,
  last?: string,
  ...args: string[]
): string[] => {
  if (!first || !last) {
    return [];
  }
  const min = first.charCodeAt(0);
  const max = last.charCodeAt(0);
  const results = [];
  let i = 0;
  while (min + i <= max) {
    results.push(String.fromCharCode(min + i));
    i++;
  }
  return args.length > 0 && args.length % 2 === 0
    ? results.concat(makeStrRangeList(...args))
    : results;
};
export const isOptional = (): boolean => {
  return Math.random() >= 0.5;
};
export const capitalize = (target: string): string => {
  return target && target.length
    ? target.charAt(0).toUpperCase() + target.slice(1)
    : '';
};
export const decodeTrans = (target: string): string => {
  return target.replace(/\\(.)/g, '$1');
};
export const getExp = (exp: string): unknown | never => {
  const fn = new Function('', `return ${exp}`);
  try {
    return fn();
  } catch (e) {
    throw new Error(`wrong expression of "${exp}".reason:${e}`);
  }
};
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
export const range = (start: number, end: number, step = 1): number[] => {
  const count = Math.floor((end - start) / step) + 1;
  return Array.from(new Array(count), (_: undefined, index: number) => {
    return start + index * step;
  });
};

function deepCopyHandle<T>(target: T, copy: T): void {
  let keys: Array<keyof T> = [];
  if (isObject(copy)) {
    keys = Object.keys(copy) as Array<keyof T>;
  } else if (Array.isArray(copy)) {
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

export const deepCopy = <T = unknown>(target: T, ...args: unknown[]): T => {
  let isObj = false;
  let isArr = false;
  if ((isObj = isObject(target)) || (isArr = Array.isArray(target))) {
    for (let i = 0, j = args.length; i < j; i++) {
      const copy = args[i];
      if ((isObj && isObject(copy)) || (isArr && Array.isArray(copy))) {
        deepCopyHandle(target, copy);
      }
    }
  }
  return target;
};
export const isNoEmptyObject = (target: unknown): boolean => {
  return typeOf(target) === 'Object' && Object.keys(target).length > 0;
};
export const isPromise = (target: unknown): boolean => {
  return (
    typeOf(target) === 'Promise' ||
    (typeOf(target) === 'Object' && isFn((target as TObj).then))
  );
};
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
export const isRelativePath = (
  first: TFieldPath,
  second: TFieldPath,
): boolean => {
  if (first.length > second.length) {
    return isRelativePath(second, first);
  }
  const len = first.length;
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
export const getRefMocker = (
  item: IPPPathItem,
  mocker: Mocker,
): Mocker | never => {
  let isExists = true;
  let lastPath: TFieldPath;
  const { root, path } = mocker;
  const { instances } = root;
  if (!item.relative) {
    lastPath = item.path;
  } else {
    if (path.length < item.depth + 1) {
      isExists = false;
    } else {
      lastPath = path.slice(0, -(1 + item.depth)).concat(item.path);
    }
  }
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
export const isObject = (target: unknown): target is TObj =>
  typeOf(target) === 'Object';

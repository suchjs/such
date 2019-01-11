import { Mocker } from '../such';
import { NormalObject, ParamsPathItem } from '../types';
import PathMap, { Path } from './pathmap';
export const encodeRegexpChars = (chars: string) => {
  return chars.replace(/([()\[{^$.*+?\/\-])/g, '\\$1');
};
export const typeOf = (target: any): string => {
  return Object.prototype.toString.call(target).slice(8, -1);
};
export const isFn = (target: any): boolean => typeof target === 'function';
export const map = (target: (any[] | NormalObject | string), fn: (item: any, index: number | string) => void) => {
  if(typeOf(target) === 'Array') {
    return (target as any[]).map(fn);
  } else if(typeOf(target) === 'Object') {
    const ret: NormalObject = {};
    target = target as NormalObject;
    for(const key in target) {
      if(target.hasOwnProperty(key)) {
        ret[key] = fn(target[key], key);
      }
    }
    return ret;
  } else if(typeOf(target) === 'String') {
    target = target as string;
    for(let i = 0, j = target.length; i < j; i++) {
      const code = target.charCodeAt(i);
      if(code >= 0xD800 && code <= 0xDBFF) {
        const nextCode = target.charCodeAt(i + 1);
        if(nextCode >= 0xDC00 && nextCode <= 0xDFFF) {
          fn(target.substr(i, 2), i);
          i++;
        } else {
          throw new Error('wrong code point');
        }
      } else {
        fn(target.charAt(i), i);
      }
    }
  }
};
export const makeRandom = (min: number, max: number): number => {
  if(min === max) {
    return min;
  } else {
    return min + Math.floor(Math.random() * (max + 1 - min));
  }
};
export const makeStrRangeList = (first?: string, last?: string, ...args: string[]): string[] => {
  if(!first || !last) {return []; }
  const min = first.charCodeAt(0);
  const max = last.charCodeAt(0);
  const results = [];
  let i = 0;
  while(min + i <= max) {
    results.push(String.fromCharCode(min + i));
    i++;
  }
  return args.length > 0 && args.length % 2 === 0 ? results.concat(makeStrRangeList(...args)) : results;
};
export const isOptional = (): boolean => {
  return Math.random() >= 0.5;
};
export const capitalize = (target: string): string => {
  return target && target.length ? target.charAt(0).toUpperCase() + target.slice(1) : '';
};
export const decodeTrans = (target: string): string => {
  return target.replace(/\\(.)/g, '$1');
};
export const getExp = (exp: string): any | never => {
  const fn = new Function('', `return ${exp}`);
  try {
    return fn();
  } catch(e) {
    throw new Error(`wrong expression of "${exp}".reason:${e}`);
  }
};
export const getExpValue = (...args: any[]): any | never => {
  const param = '__$__';
  const value = args.pop();
  let cur;
  while((cur = args.shift()) !== undefined) {
    try {
      return (new Function(param, `return ${param}.${value}`))(cur);
    } catch(e) {
      // continue
    }
  }
};
export const range = (start: number, end: number, step: number = 1) => {
  return Array.apply(null, new Array(end - start + 1)).map((_: undefined, index: number) => {
    return start + index * step;
  });
};
export const deepCopy = (target: any, ...args: any[]) => {
  const type = typeOf(target);
  if(type === 'Object' || type === 'Array') {
    for(let i = 0, j = args.length; i < j; i++) {
      const copy = args[i];
      if(typeOf(copy) !== type) {
        continue;
      }
      const keys = type === 'Object' ? Object.keys(copy) : range(0, copy.length - 1);
      keys.map((key: number | string) => {
        const from = copy[key];
        const to = target[key];
        const fromType = typeOf(from);
        const toType = typeOf(to);
        if(fromType === 'Object' || fromType === 'Array') {
          target[key] = toType === fromType ? target[key] : (fromType === 'Object' ? {} : []);
          deepCopy(target[key], from);
        } else {
          target[key] = from;
        }
      });
    }
  }
  return target;
};
export const isNoEmptyObject = (target: any) => {
  return typeOf(target) === 'Object' && Object.keys(target).length > 0;
};
export const isPromise = (target: any) => {
  return typeOf(target) === 'Promise' || (target && isFn(target.then));
};
export const shiftObject = (obj: NormalObject, keys: string[]) => {
  const res: NormalObject = {};
  keys.map((key: string) => {
    res[key] = obj[key];
    delete obj[key];
  });
  return res;
};
export const withPromise = (res: any[]) => {
  let last: any[] = [];
  let hasPromise = false;
  res.map((item: any) => {
    const imPromise = isPromise(item);
    if(hasPromise) {
      if(imPromise) {
        last.push(item);
      } else {
        last.push(Promise.resolve(item));
      }
    } else {
      if(imPromise) {
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
export const isRelativePath = (first: Path, second: Path): boolean => {
  if(first.length > second.length) {
    return isRelativePath(second, first);
  }
  const len = first.length;
  let i = 0;
  while(i < len) {
    const cur = first[i].toString();
    const compare = second[i].toString();
    if(cur !== compare) {
      break;
    }
    i++;
  }
  return i === len;
};
export const getRefMocker = (item: ParamsPathItem, mocker: Mocker) => {
  let isExists = true;
  let lastPath: Path;
  const { root, path } = mocker;
  const { instances } = root;
  if(!item.relative) {
    lastPath = item.path;
  } else {
    if(path.length < item.depth + 1) {
      isExists = false;
    } else {
      lastPath = path.slice(0, - (1 + item.depth)).concat(item.path);
    }
  }
  let refMocker: Mocker;
  if(isExists && (refMocker = instances.get(lastPath))) {
    if(isRelativePath(path, lastPath)) {
      throw new Error(`the ref path of "${path.join('/')}" and "${lastPath.join('/')}" is a relative path.`);
    } else {
      return refMocker;
    }
  } else {
    // tslint:disable-next-line:max-line-length
    throw new Error(`the path of "${lastPath ? '/' + lastPath.join('/') : item.fullpath}" is not exists in the instances.`);
  }
};

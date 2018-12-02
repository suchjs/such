import { NormalObject } from '../types';
export const encodeRegexpChars = (chars: string) => {
  return chars.replace(/([()[{^$.*+?-])/g, '\\$1');
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
// tslint:disable-next-line:max-line-length
export const deepLoop = (obj: any, fn: (key: string | number, value: any, parent: object, path: string) => any, curPath: string[] = []) => {
  const type = typeOf(obj);
  if(type === 'Object') {
    for(const key in obj) {
      if(obj.hasOwnProperty(key)) {
        const value = obj[key];
        const valType = typeOf(value);
        fn.call(null, key, value, obj, curPath.concat(key).join('.'));
        if(['Object', 'Array'].indexOf(valType) > -1) {
          deepLoop(obj[key], fn, curPath.concat(key));
        }
      }
    }
  } else if(type === 'Array') {
    for(let key = 0, len = obj.length; key < len; key++) {
      const value = obj[key];
      const valType = typeOf(value);
      fn.call(null, key, value, obj, curPath.concat('' + key).join('.'));
      if(['Object', 'Array'].indexOf(valType) > -1) {
        deepLoop(obj[key], fn, curPath.concat('' + key));
      }
    }
  }
  return;
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
  return target.replace(/\\(.)/g, (_, res) => res);
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

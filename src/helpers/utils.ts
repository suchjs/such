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
export const deepLoop = (obj: any, fn: (key: string | number, value: any, parent: Object, path: string) => any, curPath: string[] = []) => {
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
  return Math.round(Math.random()) === 0;
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

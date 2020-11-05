import { Mocker } from '../such';
import { TObject, ParamsPathItem } from '../types';
export declare const encodeRegexpChars: (chars: string) => string;
export declare const typeOf: (target: any) => string;
export declare const isFn: (target: any) => boolean;
export declare const map: (
  target: string | any[] | TObject,
  fn: (item: any, index: string | number) => void,
) => TObject;
export declare const makeRandom: (min: number, max: number) => number;
export declare const makeStrRangeList: (
  first?: string,
  last?: string,
  ...args: string[]
) => string[];
export declare const isOptional: () => boolean;
export declare const capitalize: (target: string) => string;
export declare const decodeTrans: (target: string) => string;
export declare const getExp: (exp: string) => any;
export declare const getExpValue: (...args: any[]) => any;
export declare const range: (start: number, end: number, step?: number) => any;
export declare const deepCopy: (target: any, ...args: any[]) => any;
export declare const isNoEmptyObject: (target: any) => boolean;
export declare const isPromise: (target: any) => boolean;
export declare const shiftObject: (obj: TObject, keys: string[]) => TObject;
export declare const withPromise: (res: any[]) => any[];
export declare const isRelativePath: (
  first: (string | number)[],
  second: (string | number)[],
) => boolean;
export declare const getRefMocker: (
  item: ParamsPathItem,
  mocker: Mocker,
) => Mocker;

import { TConstructor, TObj } from './common';
import {
  IPPConfig,
  IPPFormat,
  IPPFunc,
  IPPLength,
  IPPPath,
  IPPRegexp,
  IPPSize,
} from './parser';

export type TMModifierFn<T> = (res: T) => T | string | never;
export type TMRuleFn<T = unknown> = (cur: T) => T | void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TMConfigFullRule<U = any, T = TConstructor<U | any>> = {
  type: T;
  default?: U | (() => U);
  validator?: () => boolean | never;
  required?: boolean;
};
export type TMConfigRule<T = TConstructor> = T | T[] | TMConfigFullRule;
export type TMConfig<T = TConstructor> = TObj<TMConfigRule<T>>;
export type TMParams = {
  [index: string]: unknown;
  Config?: IPPConfig;
  Func?: IPPFunc;
  Format?: IPPFormat;
  Path?: IPPPath;
  Length?: IPPLength;
  Size?: IPPSize;
  Regexp?: IPPRegexp;
};

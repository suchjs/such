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
import Mockit from '../core/mockit';
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
  $config?: IPPConfig;
  $func?: IPPFunc;
  $format?: IPPFormat;
  $path?: IPPPath;
  $length?: IPPLength;
  $size?: IPPSize;
  $regexp?: IPPRegexp;
};
export type TMFactoryOptions = {
  param?: string;
  configOptions?: TObj;
  init?: () => void;
  generate: () => unknown;
  generateFn?: () => void;
};
export type TMClass = new (...args: unknown[]) => Mockit;
export type TMClassList = TObj<TMClass>;

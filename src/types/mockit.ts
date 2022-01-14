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
import { Such, Template } from '../core/such';
import { TSuchInject } from './instance';
import { TFieldPath } from '../helpers/pathmap';
export type TMModifierFn<T> = (res: T) => T | string | never;
export type TMRuleFn<T = unknown> = (cur: T) => T | void;
export type TMParamsValidFn = (params: TMParams) => void | never;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TMConfigFullRule<U = any, T = TConstructor<U | any>> = {
  type: T;
  default?: U | (() => U);
  validator?: (value: unknown) => boolean | never;
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
  $template?: Template;
};
export type TMAttrs = string[];
export type TMGenerateFn = (options?: TSuchInject, such?: Such) => unknown;
export type TMFactoryOptions = {
  param?: string;
  configOptions?: TMConfig;
  selfConfigOptions?: TMConfig;
  allowAttrs?: TMAttrs;
  init?: () => void;
  generate: TMGenerateFn;
  validator?: TMParamsValidFn;
};
export type TMClass = new (
  callerNamespace?: string,
  path?: TFieldPath,
) => Mockit;
export type TMClassList = TObj<TMClass>;

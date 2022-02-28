import { TStrList, TFunc, TObj } from './common';

/**
 * IParserConfig
 * @export
 * @interface IParserConfig
 */
export interface IParserConfig {
  startTag: TStrList;
  endTag: TStrList;
  separator?: string;
  rule?: RegExp;
  pattern?: RegExp;
}

/**
 * IParserFactory
 * @export
 * @interface IParserFactory
 */
export interface IParserFactory {
  config: IParserConfig;
  setting?: TObj;
  parse(): unknown | never;
}

/**
 * IPP is short for 'Interface Parser Property'
 */
export interface IPPWrapper {
  prefix: string;
  suffix: string;
}

/**
 * property: length
 * @export
 * @interface IPPLength
 */
export interface IPPLength {
  least: number;
  most: number;
}
/**
 * property: size
 * @export
 * @interface IPPSize
 */
export interface IPPSize<T = number | string> {
  range: Array<T>;
}
/**
 * property: format
 * @export
 * @interface IPPFormat
 */
export interface IPPFormat {
  format: string;
}
/**
 *
 * @export
 * @interface IPPFunc
 */
export interface IPPFuncOptions {
  name: string;
  params?: IPPFuncParam[];
}
/**
 * property: func
 * @export
 * @interface IPPFunc
 */
export interface IPPFuncParam {
  value?: unknown;
  variable?: boolean;
}
export interface IPPFunc {
  queue: TStrList;
  params: IPPFuncParam[][];
  fns: ((isUserDefined: boolean) => TFunc)[];
  options: IPPFuncOptions[];
}
/**
 * property: regexp
 * @export
 * @interface IPPRegexp
 */
export interface IPPRegexp {
  rule: string;
}
/**
 * property: path
 * @export
 * @interface IPPPathItem
 */
export interface IPPPathItem {
  relative: boolean;
  depth: number;
  path: Array<string | number>;
  fullpath: string;
  variable: string;
  fix: boolean;
}
export type IPPPath = IPPPathItem[];
/**
 * property: config
 * @export
 * @interface IPPConfig
 */
export interface IPPConfig<T = unknown | { variable: string }> {
  [index: string]: T;
}
/**
 *
 * @export
 * @interface Options
 */
export interface Options {
  Number: IPPSize & IPPFormat;
  String: IPPLength & IPPWrapper;
}

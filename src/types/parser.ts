import { TFunc, TObj } from 'src/types';

/**
 * types for parser
 * 解析属性用到的类型
 */
export interface IPPWrapper {
  prefix: string;
  suffix: string;
}
/**
 * interface parser <params|property> length
 * 长度属性
 */
export interface IPPLength {
  least: number;
  most: number;
}
/**
 *
 * @interface IPPCount
 */
export interface IPPCount {
  range: Array<string | number>;
}
/**
 *
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
  params?: unknown[];
}
export interface IPPFunc {
  queue: string[];
  params: unknown[][];
  fns: TFunc[];
  options: IPPFuncOptions[];
}
/**
 *
 *
 * @export
 * @interface IPPRegexp
 */
export interface IPPRegexp {
  rule: string;
}
/**
 *
 *
 * @export
 * @interface IPPPathItem
 */
export interface IPPPathItem {
  relative: boolean;
  depth: number;
  path: Array<string | number>;
  fullpath: string;
  variable: string;
}
export type IPPPath = IPPPathItem[];
/**
 *
 *
 * @export
 * @interface IPPConfig
 */
export interface IPPConfig {
  [index: string]: string;
}
/**
 *
 * @export
 * @interface Options
 */
export interface Options {
  Number: IPPCount & IPPFormat;
  String: IPPLength & IPPWrapper;
}
// parser
export interface IParserConfig {
  startTag: string[];
  endTag: string[];
  separator?: string;
  rule?: RegExp;
  pattern?: RegExp;
}
export interface IParserInstance {
  config: IParserConfig;
  setting?: TObj;
  parse(): TObj | never;
}

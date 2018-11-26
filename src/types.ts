export interface NormalObject {
  [index: string]: any;
}
export type valueof<T> = T[keyof T];
export type PrototypeMethodNames<T> = {[K in keyof T]: T[K] extends () => void ? K : never; }[keyof T];
/**
 *
 * @interface ParamsWrapper
 */
export interface ParamsWrapper {
  prefix: string;
  suffix: string;
}
/**
 *
 * @interface ParamsLength
 */
export interface ParamsLength {
  least: number;
  most: number;
}
/**
 *
 * @interface ParamsCount
 */
export interface ParamsCount {
  range: Array<string | number>;
}
/**
 *
 * @interface ParamsFormat
 */
export interface ParamsFormat {
  format: string;
}
/**
 *
 * @export
 * @interface ParamsFunc
 */
export interface ParamsFuncItem {
    name: string;
    params?: any[];
}
export type ParamsFunc = ParamsFuncItem[];
/**
 *
 *
 * @export
 * @interface ParamsRegexp
 */
export interface ParamsRegexp {
  rule: string;
}
/**
 *
 *
 * @export
 * @interface ParamsPathItem
 */
export interface ParamsPathItem {
  relative: boolean;
  depth: number;
  path: Array<string | number>;
  fullpath: string;
}
export type ParamsPath = ParamsPathItem[];
/**
 *
 *
 * @export
 * @interface ParamsConfig
 */
export interface ParamsConfig {
  [index: string]: string;
}
/**
 *
 * @export
 * @interface Options
 */
export interface Options {
  Number: ParamsCount & ParamsFormat;
  String: ParamsLength & ParamsWrapper;
}
// parser
export interface ParserConfig {
  startTag: string[];
  endTag: string[];
  separator?: string;
  rule?: RegExp;
  pattern?: RegExp;
}
export interface ParserInstance {
  config: ParserConfig;
  setting?: object;
  parse(): object | never;
}
// such config
/**
 *
 *
 * @interface MockitOptions
 */
export interface MockitOptions {
  param: string;
  ignoreRules?: string[];
  init?: () => void;
  generate?: () => any;
  generateFn?: () => void;
}
export type NormalFn = (...args: any[]) => any;
export interface FnList {
  [index: string]: NormalFn;
}
export interface SuchConfGlobal {
  vars?: NormalObject;
  fns?: FnList;
}
export interface SuchConfDefine {
  [index: string]: NormalFn | MockitOptions | [string, string] | [string, MockitOptions];
}
export interface SuchConfParser {
  [index: string]: ParserInstance;
}
export interface SuchConfFile {
  extends?: string | string[];
  assign?: SuchConfGlobal;
  parser?: SuchConfParser;
  define?: SuchConfDefine;
}

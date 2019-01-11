import PathMap, { Path } from './helpers/pathmap';
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
export interface ParamsFuncOptions {
  name: string;
  params?: any[];
}
export interface ParamsFunc {
  queue: string[];
  params: any[][];
  fns: NormalFn[];
  options: ParamsFuncOptions[];
}
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
  variable: string;
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
  param?: string;
  configOptions?: NormalObject;
  init?: () => void;
  generate: () => any;
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
export interface SuchConfTypes {
  [index: string]: NormalFn | MockitOptions | [string, string] | [string, MockitOptions];
}
export interface SuchConfParser {
  [index: string]: ParserInstance;
}
export interface SuchConfConfig {
  suchDir?: string;
  dataDir?: string;
  preload?: boolean | string[];
}
export interface SuchConfFile {
  extends?: string | string[];
  config?: SuchConfConfig;
  globals?: SuchConfGlobal;
  parsers?: SuchConfParser;
  types?: SuchConfTypes;
  alias?: {[index: string]: string};
}
//
export interface SuchInstance {
  [index: string]: any;
}
//
export interface SuchOptions {
  datas: PathMap<any>;
  dpath: Path;
  such: SuchInstance;
  mocker: NormalObject;
}
//

export type TypeContructor = (new (t?: any) => any);
// tslint:disable-next-line:max-line-length
export type MockitConfigItem<T> = T | TypeContructor[] | {type: T, default: (new() => T) | (() => (new() => T)), validator?: () => boolean | never, required?: boolean};
export interface MockitConfig {
  [index: string]: MockitConfigItem<any>;
}

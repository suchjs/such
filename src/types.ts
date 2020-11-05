import PathMap, { Path } from './helpers/pathmap';
export interface TObject<T = unknown> {
  [index: string]: T;
}
export type ValueOf<T> = T[keyof T];
export type PrototypeMethodNames<T> = {
  [K in keyof T]: T[K] extends () => void ? K : never;
}[keyof T];
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
  params?: unknown[];
}
export interface ParamsFunc {
  queue: string[];
  params: unknown[][];
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
  setting?: TObject;
  parse(): TObject | never;
}
// such config
/**
 *
 *
 * @interface MockitOptions
 */
export interface MockitOptions {
  param?: string;
  configOptions?: TObject;
  init?: () => void;
  generate: () => unknown;
  generateFn?: () => void;
}
export type NormalFn = (...args: unknown[]) => unknown;
export interface FnList {
  [index: string]: NormalFn;
}
export interface SuchConfGlobal {
  vars?: TObject;
  fns?: FnList;
}
export interface SuchConfTypes {
  [index: string]:
    | NormalFn
    | MockitOptions
    | [string, string]
    | [string, MockitOptions];
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
  alias?: { [index: string]: string };
}
//
export interface SuchInstance {
  [index: string]: unknown;
}
//
export interface SuchOptions {
  datas: PathMap<unknown>;
  dpath: Path;
  such: SuchInstance;
  mocker: TObject;
}
//

export type TypeConstructor = new (t?: unknown) => unknown;

export type MockitConfigItem<T> =
  | T
  | TypeConstructor[]
  | {
      type: T;
      default: (new () => T) | (() => new () => T);
      validator?: () => boolean | never;
      required?: boolean;
    };
export interface MockitConfig {
  [index: string]: MockitConfigItem<unknown>;
}

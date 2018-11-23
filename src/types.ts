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

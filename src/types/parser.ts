import { TStrList, TFunc, TObj } from './common';

/**
 * IParserConfig
 * 解析器配置
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
 * 属性解析器实例
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
 * 解析属性用到的类型
 */
export interface IPPWrapper {
  prefix: string;
  suffix: string;
}

/**
 * property: length
 * 长度属性
 * @export
 * @interface IPPLength
 */
export interface IPPLength {
  least: number;
  most: number;
}
/**
 * property: size
 * 大小属性
 * @export
 * @interface IPPSize
 */
export interface IPPSize<T = number | string> {
  range: Array<T>;
}
/**
 * property: format
 * 格式化
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
 * 方法函数
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
 * 正则表达式
 * @export
 * @interface IPPRegexp
 */
export interface IPPRegexp {
  rule: string;
}
/**
 * property: path
 * 路径
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
 * property: config
 * 配置项解析
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

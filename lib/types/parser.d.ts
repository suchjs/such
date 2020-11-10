import { TStrList, TFunc, TObj } from './common';
export interface IParserConfig {
    startTag: TStrList;
    endTag: TStrList;
    separator?: string;
    rule?: RegExp;
    pattern?: RegExp;
}
export interface IParserFactory {
    config: IParserConfig;
    setting?: TObj;
    parse(): unknown | never;
}
export interface IPPWrapper {
    prefix: string;
    suffix: string;
}
export interface IPPLength {
    least: number;
    most: number;
}
export interface IPPSize<T = number | string> {
    range: Array<T>;
}
export interface IPPFormat {
    format: string;
}
export interface IPPFuncOptions {
    name: string;
    params?: IPPFuncParam[];
}
export interface IPPFuncParam {
    value?: unknown;
    variable?: boolean;
}
export interface IPPFunc {
    queue: TStrList;
    params: IPPFuncParam[][];
    fns: TFunc[];
    options: IPPFuncOptions[];
}
export interface IPPRegexp {
    rule: string;
}
export interface IPPPathItem {
    relative: boolean;
    depth: number;
    path: Array<string | number>;
    fullpath: string;
    variable: string;
}
export declare type IPPPath = IPPPathItem[];
export interface IPPConfig<T = unknown> {
    [index: string]: T;
}
export interface Options {
    Number: IPPSize & IPPFormat;
    String: IPPLength & IPPWrapper;
}

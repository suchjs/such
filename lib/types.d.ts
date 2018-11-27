import PathMap, { Path } from './helpers/pathmap';
export interface NormalObject {
    [index: string]: any;
}
export declare type valueof<T> = T[keyof T];
export declare type PrototypeMethodNames<T> = {
    [K in keyof T]: T[K] extends () => void ? K : never;
}[keyof T];
export interface ParamsWrapper {
    prefix: string;
    suffix: string;
}
export interface ParamsLength {
    least: number;
    most: number;
}
export interface ParamsCount {
    range: Array<string | number>;
}
export interface ParamsFormat {
    format: string;
}
export interface ParamsFuncOptions {
    name: string;
    params?: any[];
}
export interface ParamsFunc {
    queue: string[];
    params: {
        [index: string]: any[];
    };
    fns: {
        [index: string]: NormalFn;
    };
    options: ParamsFuncOptions[];
}
export interface ParamsRegexp {
    rule: string;
}
export interface ParamsPathItem {
    relative: boolean;
    depth: number;
    path: Array<string | number>;
    fullpath: string;
}
export declare type ParamsPath = ParamsPathItem[];
export interface ParamsConfig {
    [index: string]: string;
}
export interface Options {
    Number: ParamsCount & ParamsFormat;
    String: ParamsLength & ParamsWrapper;
}
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
export interface MockitOptions {
    param: string;
    ignoreRules?: string[];
    init?: () => void;
    generate?: () => any;
    generateFn?: () => void;
}
export declare type NormalFn = (...args: any[]) => any;
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
export interface SuchConfFile {
    extends?: string | string[];
    globals?: SuchConfGlobal;
    parsers?: SuchConfParser;
    types?: SuchConfTypes;
    alias?: {
        [index: string]: string;
    };
}
export interface SuchInstance {
    [index: string]: any;
}
export interface SuchOptions {
    datas: PathMap<any>;
    dpath: Path;
    such: SuchInstance;
}

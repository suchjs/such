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
export interface ParamsFuncItem {
    name: string;
    params?: any[];
}
export declare type ParamsFunc = ParamsFuncItem[];
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

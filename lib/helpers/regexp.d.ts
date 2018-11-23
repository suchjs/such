import { NormalObject } from '../types';
export declare type Flag = 'i' | 'm' | 'g' | 'u' | 'y' | 's';
export declare type FlagsHash = {
    [key in Flag]?: boolean;
};
export declare type FlagsBinary = {
    [key in Flag]: number;
};
export interface ParserConf {
    namedGroupConf?: NormalObject;
}
export interface BuildConfData extends ParserConf {
    flags: FlagsHash;
    namedGroupData: NormalObject;
    captureGroupData: NormalObject;
    beginWiths: string[];
    endWiths: string[];
}
export declare const parserRule: RegExp;
export declare const regexpRule: RegExp;
export default class Parser {
    readonly rule: string;
    private config;
    readonly context: string;
    readonly flags: Flag[];
    readonly lastRule: string;
    private queues;
    private ruleInput;
    private flagsHash;
    private totalFlagBinary;
    private rootQueues;
    constructor(rule: string, config?: ParserConf);
    setConfig(conf: ParserConf): void;
    build(): string | never;
    private parse;
    private checkFlags;
    private hasFlag;
}

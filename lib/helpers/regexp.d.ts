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
    info(): {
        rule: string;
        context: string;
        lastRule: string;
        flags: Flag[];
        queues: RegexpPart[];
    };
    private parse;
    private checkFlags;
    private hasFlag;
}
interface NumberRange {
    min: number;
    max: number;
}
declare abstract class RegexpPart {
    input: string;
    readonly queues: RegexpPart[];
    isComplete: boolean;
    parent: null | RegexpPart;
    buildForTimes: boolean;
    abstract readonly type: string;
    protected min: number;
    protected max: number;
    protected curCodePoint: number;
    protected dataConf: NormalObject;
    constructor(input?: string);
    codePoint: number;
    setRange(options: NumberRange): void;
    add(target: string | RegexpPart, options?: NormalObject): void | boolean | never;
    pop(): RegexpPart;
    build(conf: BuildConfData): string | never;
    setDataConf(conf: BuildConfData, result: string): void;
    toString(): string;
    untilEnd(context: string): void;
    isAncestorOf(target: RegexpPart): boolean;
    getRuleInput(parseReference?: boolean): string;
    protected buildRuleInputFromQueues(): string;
    protected prebuild(conf: BuildConfData): string | never;
}
export {};

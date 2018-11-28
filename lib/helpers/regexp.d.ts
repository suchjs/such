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
export interface NumberRange {
    min: number;
    max: number;
}
export declare abstract class RegexpPart {
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
export declare abstract class RegexpEmpty extends RegexpPart {
    constructor(input?: string);
}
export declare abstract class RegexpOrigin extends RegexpPart {
    protected prebuild(): string;
}
export declare class RegexpReference extends RegexpPart {
    readonly type = "reference";
    ref: RegexpGroup | null;
    index: number;
    constructor(input: string);
    protected prebuild(conf: BuildConfData): any;
}
export declare class RegexpSpecial extends RegexpEmpty {
    readonly special: string;
    readonly type = "special";
    constructor(special: string);
}
export declare class RegexpAny extends RegexpPart {
    readonly type = "any";
    constructor();
    protected prebuild(conf: BuildConfData): string;
}
export declare class RegexpNull extends RegexpPart {
    readonly type = "null";
    constructor();
    protected prebuild(): string;
}
export declare class RegexpBackspace extends RegexpPart {
    readonly type = "backspace";
    constructor();
    protected prebuild(): string;
}
export declare class RegexpBegin extends RegexpEmpty {
    readonly type = "begin";
}
export declare class RegexpControl extends RegexpPart {
    readonly type = "control";
    constructor(input: string);
    protected prebuild(): string;
}
export declare class RegexpCharset extends RegexpPart {
    readonly type = "charset";
    readonly charset: string;
    constructor(input: string);
    protected prebuild(conf: BuildConfData): string;
}
export declare class RegexpPrint extends RegexpPart {
    readonly type = "print";
    protected prebuild(): string;
}
export declare class RegexpIgnore extends RegexpEmpty {
    readonly type = "ignore";
    protected prebuild(): string;
}
export declare class RegexpChar extends RegexpOrigin {
    readonly type = "char";
    constructor(input: string);
}
export declare class RegexpTranslateChar extends RegexpOrigin {
    readonly type = "translate";
    constructor(input: string);
    protected prebuild(): string;
}
export declare class RegexpOctal extends RegexpPart {
    readonly type = "octal";
    constructor(input: string);
    protected prebuild(): string;
}
export declare abstract class RegexpTimes extends RegexpPart {
    readonly type = "times";
    protected readonly maxNum: number;
    protected greedy: boolean;
    protected abstract readonly rule: RegExp;
    protected minRepeat: number;
    protected maxRepeat: number;
    constructor();
    target: RegexpPart;
    untilEnd(context: string): number;
    abstract parse(): void;
}
export declare class RegexpTimesMulti extends RegexpTimes {
    protected rule: RegExp;
    parse(): void;
}
export declare class RegexpTimesQuantifiers extends RegexpTimes {
    protected rule: RegExp;
    parse(): void;
}
export declare class RegexpSet extends RegexpPart {
    readonly type = "set";
    reverse: boolean;
    constructor();
    add(target: RegexpPart): void;
    isSetStart(): boolean;
    getRuleInput(): string;
    protected prebuild(conf: BuildConfData): string;
}
export declare class RegexpRange extends RegexpPart {
    readonly type = "range";
    constructor();
    add(target: RegexpPart): void;
    getRuleInput(): string;
    protected prebuild(): string;
}
export declare abstract class RegexpHexCode extends RegexpOrigin {
    readonly type = "hexcode";
    protected abstract rule: RegExp;
    protected abstract codeType: string;
    untilEnd(context: string): number;
}
export declare class RegexpUnicode extends RegexpHexCode {
    protected rule: RegExp;
    protected codeType: string;
}
export declare class RegexpUnicodeAll extends RegexpHexCode {
    protected rule: RegExp;
    protected codeType: string;
}
export declare class RegexpASCII extends RegexpHexCode {
    protected rule: RegExp;
    protected codeType: string;
}
export declare class RegexpGroup extends RegexpPart {
    readonly type = "group";
    captureIndex: number;
    groupIndex: number;
    captureName: string;
    isRoot: boolean;
    private groups;
    private curRule;
    constructor();
    addNewGroup(queue?: RegexpPart[]): void;
    add(target: RegexpPart): void;
    isGroupStart(): boolean;
    getRuleInput(parseReference: boolean): string;
    protected buildRule(flags: FlagsHash): any;
    protected prebuild(conf: BuildConfData): string;
    private isEndLimitChar;
}

import { NormalObject, ParserConfig } from '../types';
export interface Tags {
    start: string;
    end: string;
}
export interface ParserConstructor extends ParserConfig {
    readonly splitor?: string;
    new (): ParserInterface;
}
export declare abstract class ParserInterface {
    protected params: string[];
    protected patterns: any[][];
    protected tags: Tags;
    protected code: string;
    protected setting: NormalObject;
    protected frozenData: NormalObject;
    constructor();
    init(): this;
    info(): {
        tags: Tags;
        params: string[];
        code: string;
        patterns: any[][];
    };
    parseCode(code: string, tags: Tags): void;
    abstract parse(): object | never;
    protected halt(err: string): never;
}
export interface ParserList {
    [index: string]: ParserConstructor;
}
export interface ParserInstances {
    [index: string]: ParserInterface;
}
export declare class Dispatcher {
    protected parsers: ParserList;
    protected tagPairs: string[];
    protected pairHash: NormalObject;
    protected readonly splitor: string;
    protected instances: ParserInstances;
    addParser(name: string, config: ParserConfig, parse: () => void, setting?: NormalObject): never | void;
    parse(code: string): NormalObject | never;
    protected getInstance(name: string): ParserInterface;
    protected parseUntilFind(context: string): NormalObject;
    protected halt(err: string): never;
}
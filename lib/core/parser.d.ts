import { IParserConfig } from '../types/parser';
import { TMatchResult, TObj, TStrList } from '../types/common';
export interface Tags {
    start: string;
    end: string;
}
export interface IParserConstructor extends IParserConfig {
    readonly splitor?: string;
    new (): AParser;
}
export declare abstract class AParser {
    params: TStrList;
    patterns: TMatchResult[];
    tags: Tags;
    code: string;
    setting: TObj;
    protected constructor();
    init(): AParser;
    info(): Pick<AParser, 'tags' | 'params' | 'code' | 'patterns'>;
    parseCode(code: string, tags: Tags): void;
    abstract parse(): unknown | never;
    protected halt(err: string): never;
}
export interface IParserList {
    [index: string]: IParserConstructor;
}
export interface IParserInstances {
    [index: string]: AParser;
}
declare type TParseUntilResult = {
    data: {
        type: string;
        instance: AParser;
    };
    total: number;
};
export declare class Dispatcher {
    protected parsers: IParserList;
    protected tagPairs: TStrList;
    protected pairHash: TObj<string>;
    protected readonly splitor: string;
    protected instances: IParserInstances;
    addParser(name: string, config: IParserConfig, parse: () => void, setting?: TObj): never | void;
    parse(code: string): TObj<TObj> | never;
    protected getInstance(name: string): AParser;
    protected parseUntilFind(context: string): TParseUntilResult | never;
    protected halt(err: string): never;
}
export {};

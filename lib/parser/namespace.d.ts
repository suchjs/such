import { TObject, ParserConfig } from '../types';
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
  protected setting: TObject;
  protected defaults: TObject;
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
  protected pairHash: TObject;
  protected readonly splitor: string;
  protected instances: ParserInstances;
  addParser(
    name: string,
    config: ParserConfig,
    parse: () => void,
    setting?: TObject,
  ): never | void;
  parse(code: string): TObject | never;
  protected getInstance(name: string): ParserInterface;
  protected parseUntilFind(context: string): TObject;
  protected halt(err: string): never;
}

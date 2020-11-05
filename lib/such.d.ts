import PathMap, { Path } from './helpers/pathmap';
import { TObject, ParserConfig, SuchConfFile } from './types';
export interface SuchConfig {
  instance?: boolean;
  config?: KeyRuleInterface;
}
export interface KeyRuleInterface {
  min?: number;
  max?: number;
  optional?: boolean;
  oneOf?: boolean;
  alwaysArray?: boolean;
}
export interface MockitInstances {
  [index: string]: any;
}
export interface MockerOptions {
  target: any;
  path: Path;
  parent?: Mocker;
  config?: KeyRuleInterface;
}
export interface PromiseResult {
  dpath: Path;
  result: Promise<any>;
}
export declare class Mocker {
  static parseKey(
    key: string,
  ): {
    key: string;
    config: TObject;
  };
  result: any;
  readonly target: any;
  readonly config: TObject;
  readonly path: Path;
  readonly type: string;
  readonly instances?: PathMap<Mocker>;
  readonly datas?: PathMap<any>;
  readonly root: Mocker;
  readonly parent: Mocker;
  readonly dataType: string;
  readonly isRoot: boolean;
  readonly mockFn: (dpath: Path) => any;
  readonly mockit: TObject;
  readonly promises: PromiseResult[];
  constructor(
    options: MockerOptions,
    rootInstances?: PathMap<Mocker>,
    rootDatas?: PathMap<any>,
  );
  setParams(value: string | TObject): any;
  mock(dpath: Path): any;
}
export default class Such {
  static readonly utils: {
    [index: string]: (...args: any[]) => any;
  };
  static alias(short: string, long: string): void;
  static config(config: SuchConfFile): void;
  static parser(
    name: string,
    params: {
      config: ParserConfig;
      parse: () => void;
      setting?: TObject;
    },
  ): never | void;
  static as(target: any, options?: SuchConfig): any;
  static assign(name: string, value: any, alwaysVar?: boolean): void;
  static define(type: string, ...args: any[]): void | never;
  readonly target: any;
  readonly options: SuchConfig;
  readonly mocker: Mocker;
  readonly instances: PathMap<Mocker>;
  readonly mockits: PathMap<TObject>;
  readonly datas: PathMap<any>;
  readonly paths: PathMap<Path>;
  protected struct: TObject;
  private initail;
  constructor(target: any, options?: SuchConfig);
  a(): any;
}

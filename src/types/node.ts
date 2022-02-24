import { TFunc, TObj, TStrList } from './common';
import { TPath } from './common';
import { TMFactoryOptions } from './mockit';
import { IParserFactory } from './parser';
import { NSuch } from '../node';

export type TQueryDataFunc = (name: string) => string;
export interface TContextParam {
  query: TQueryDataFunc;
  data: TQueryDataFunc;
  method: string; 
}
export interface TSSConfig {
  rootDir?: TPath;
  suchDir?: TPath;
  dataDir?: TPath;
  preload?: boolean | TStrList;
  extensions?: TStrList;
  server?: {
    port?: number;
    prefix?: string;
    directory?: string;
    timeout?: [number, number] | number;
    extContentTypes?: TObj<string | string[]>;
    pathSegSplit?: string;
    injectContext?: boolean;
    buildConfig?: (
      pathname: TPath,
      context?: TContextParam,
      config?: TSSConfig,
    ) => TObj;
  };
}
export interface TSSGlobals {
  vars?: TObj;
  fns?: TFunc;
}
export interface TSSTypes {
  [index: string]:
    | string
    | TFunc
    | TMFactoryOptions
    | [string, string]
    | [unknown[]]
    | [string, TMFactoryOptions];
}
export type TSSParsers = {
  [index: string]: IParserFactory;
};
export type TSuchSettings = {
  extends?: string | TStrList;
  config?: TSSConfig;
  globals?: TSSGlobals;
  parsers?: TSSParsers;
  types?: TSSTypes;
  alias?: TObj<string>;
};

export type TNodeSuch = NSuch;

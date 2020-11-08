import { TFunc, TObj, TStrList } from 'src/types';
import { TPath } from './common';
import { TMFactoryOptions } from './mockit';
import { IParserFactory } from './parser';

export interface TSSConfig {
  rootDir?: TPath;
  suchDir?: TPath;
  dataDir?: TPath;
  preload?: boolean | TStrList;
}
export interface TSSGlobals {
  vars?: TObj;
  fns?: TFunc;
}
export interface TSSTypes {
  [index: string]:
    | TFunc
    | TMFactoryOptions
    | [string, string]
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

export type TNodeSuch = {
  loadConf: (name: string | string[]) => TObj | TObj[];
  reloadData: () => Promise<unknown>;
  clearCache: () => Promise<unknown>;
};

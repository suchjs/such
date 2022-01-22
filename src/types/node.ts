import { TFunc, TObj, TStrList } from './common';
import { TPath } from './common';
import { TMFactoryOptions } from './mockit';
import { IParserFactory } from './parser';
import { LoadExtendFunc } from '../node';
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

export type TNodeSuch = {
  loadConf: (configFile: TPath) => void;
  loadExtend: LoadExtendFunc;
  loadData: () => Promise<unknown>;
  reloadData: () => Promise<unknown>;
  clearCache: () => Promise<unknown>;
};

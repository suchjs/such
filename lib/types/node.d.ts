import { TFunc, TObj, TStrList } from './common';
import { TPath } from './common';
import { TMFactoryOptions } from './mockit';
import { IParserFactory } from './parser';
import { loadConf } from '../index';
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
    [index: string]: TFunc | TMFactoryOptions | [string, string] | [string, TMFactoryOptions];
}
export declare type TSSParsers = {
    [index: string]: IParserFactory;
};
export declare type TSuchSettings = {
    extends?: string | TStrList;
    config?: TSSConfig;
    globals?: TSSGlobals;
    parsers?: TSSParsers;
    types?: TSSTypes;
    alias?: TObj<string>;
};
export declare type TNodeSuch = {
    loadConf: typeof loadConf;
    reloadData: () => Promise<unknown>;
    clearCache: () => Promise<unknown>;
};

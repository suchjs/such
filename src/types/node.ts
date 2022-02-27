import { TFunc, TObj, TStrList } from './common';
import { TPath } from './common';
import { TMFactoryOptions } from './mockit';
import { IParserFactory } from './parser';
import { NSuch } from '../node';
import { IAInstanceOptions } from './instance';

export type TQueryDataFunc = (name: string) => string;
export interface TContextParam {
  query: TQueryDataFunc;
  data: TQueryDataFunc;
  method: string;
  extension: string;
  [index: string]: unknown;
}
export interface TSSConfig {
  rootDir?: TPath;
  suchDir?: TPath;
  dataDir?: TPath;
  preload?: boolean | TStrList;
  extensions?: TStrList;
  server?: {
    port?: number;
    prefix?:
      | string
      | [
          string,
          {
            exclude: Array<
              | {
                  path: string | RegExp;
                  method?:
                    | 'get'
                    | 'post'
                    | 'put'
                    | 'delete'
                    | 'options'
                    | 'head'
                    | 'trace'
                    | 'patch'
                    | 'connect';
                }
              | string
            >;
          },
        ];
    directory?: string;
    watch?: boolean;
    timeout?: [number, number] | number;
    extContentTypes?: TObj<string | string[]>;
    pathSegSplit?: string;
    injectContext?: boolean;
    buildConfig?: (
      pathname: TPath,
      context?: TContextParam,
      config?: TSSConfig,
    ) => {
      timeout?: [number, number] | number;
      headers?: TObj<string>;
      instance?: IAInstanceOptions;
      [index: string]: unknown;
    };
    404?: {
      headers?: TObj<string>;
      body?: string;
    };
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

import { TFunc, TObj, TStrList } from 'src/types';

export interface TSSConfig {
  suchDir?: string;
  dataDir?: string;
  preload?: boolean | TStrList;
}
export interface TSSGlobals {
  vars?: TObj;
  fns?: TFunc;
}
export interface TSSTypes {
  [index: string]:
    | TFunc
    | MockitOptions
    | [string, string]
    | [string, MockitOptions];
}
export interface SuchConfParser {
  [index: string]: ParserInstance;
}
export type TSuchSettings = {
  extends?: string | TStrList;
  config?: TSSConfig;
  globals?: TSSGlobals;
  parsers?: SuchConfParser;
  types?: TSSTypes;
  alias?: TObj<string>;
};

import { IPPPathItem } from '../types/parser';
import { TStrList } from '../types/common';
export declare const loadDict: (filePath: string | TStrList, useCache?: boolean) => Promise<TStrList | TStrList[]>;
export declare const getAllFiles: (directory: string) => Promise<TStrList>;
export declare const loadJson: (filePath: string | TStrList) => Promise<TStrList | TStrList[]>;
export declare const loadAllData: (allFiles: TStrList) => Promise<unknown>;
export declare const loadTemplate: (file: string) => Promise<string>;
export declare const getRealPath: (item: IPPPathItem) => string;
export declare const getCascaderValue: (data: unknown, values: TStrList) => unknown | never;

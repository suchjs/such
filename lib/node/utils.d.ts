export declare const loadDict: (filePath: string | string[], useCache?: boolean) => Promise<string[] | string[][]>;
export declare const getAllFiles: (directory: string) => Promise<string[]>;
export declare const loadJson: (filePath: string | string[]) => Promise<string[] | string[][]>;
export declare const loadAllData: (allFiles: string[]) => Promise<[string[] | string[][], string[] | string[][]]>;
export declare const loadTemplate: (file: string) => Promise<{}>;
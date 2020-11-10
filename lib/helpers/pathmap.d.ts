export declare type TFieldPathKey = string | number;
export declare type TFieldPath = TFieldPathKey[];
export declare type TFieldValue<T = unknown> = {
    [index: string]: T;
} | T[];
export default class PathMap<T> {
    readonly isPlain: boolean;
    private result;
    private initial;
    constructor(isPlain: boolean);
    set(keys: TFieldPath, value: T): PathMap<T> | never;
    get(keys: TFieldPath): T;
    clear(): void;
    has(keys: TFieldPath): boolean;
}

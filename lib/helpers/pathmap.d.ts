export declare type PathKey = string | number;
export declare type Path = PathKey[];
export declare type PathValue<T> = {
    [index: string]: T;
} | T[];
export default class PathMap<T> {
    readonly isPlain: boolean;
    private result;
    private initial;
    constructor(isPlain: boolean);
    set(keys: Path, value: T): this;
    get(keys: Path): T;
    clear(): void;
    has(keys: Path): boolean;
}

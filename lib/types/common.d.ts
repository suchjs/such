export declare type TFunc = (...args: unknown[]) => unknown;
export declare type TPath = string;
export declare type TStrList = string[];
export declare type TResult<T> = T | never;
export declare type TMatchResult = Array<string | undefined>;
export declare type TObj<T = unknown> = {
    [index: string]: T;
};
export declare type TConstructor<T = any> = new (...args: any) => T;
export declare type ValueOf<T> = T[keyof T];
export declare type PrototypeMethodNames<T> = {
    [K in keyof T]: T[K] extends () => void ? K : never;
}[keyof T];

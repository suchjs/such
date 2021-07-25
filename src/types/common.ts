export type TFunc = (...args: unknown[]) => unknown;
export type TPath = string;
export type TStrList = string[];
export type TMultiStr = string | TStrList;
export type TResult<T> = T | never;
export type TMatchResult = Array<string | undefined>;
export type TObj<T = unknown> = {
  [index: string]: T;
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type TConstructor<T = any> = new (...args: any) => T;
export type ValueOf<T> = T[keyof T];
export type PrototypeMethodNames<T> = {
  [K in keyof T]: T[K] extends () => void ? K : never;
}[keyof T];

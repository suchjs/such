export type TFunc = (...args: unknown[]) => unknown;
export type TPath = string;
export type TStrList = string[];
export type TObj<T = unknown> = {
  [index: string]: T;
};
export type ValueOf<T> = T[keyof T];
export type PrototypeMethodNames<T> = {
  [K in keyof T]: T[K] extends () => void ? K : never;
}[keyof T];

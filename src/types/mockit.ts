export type TMModifierFn<T> = (res: T) => T | string | never;
export type TMRuleFn<T = unknown> = (cur: T) => T | void;

import PathMap, { TFieldPath } from '../helpers/pathmap';
import { Mocker } from '../core/such';
import Mockit from '../core/mockit';
import { TMParams } from './mockit';
import { TObj, TPath } from './common';

export type NestedPartial<T> = {
  [P in keyof T]: Partial<T[P]>;
};
export type TOverrideParams = NestedPartial<
  Pick<TMParams, '$config' | '$length'>
>;

export type TDynamicDependValue = {
  index?: string;
  value: unknown;
};

export type TDynamicConfig = [TPath | TPath[], (...args: Array<TDynamicDependValue>) => TInstanceDynamicConfig];

export type TSuchInject = {
  datas: PathMap<unknown>;
  dpath: TFieldPath;
  mocker: Mocker;
  key?: Required<TEnumedIndex>;
  param?: TOverrideParams;
};

export type TEnumedIndex = {
  index?: number;
};

export type TOptionalExist = {
  exist?: boolean;
};
/**
 *
 *
 * @interface IAsOptions
 */
export interface IAsOptions {
  config?: IMockerKeyRule;
}

/**
 *
 *
 * @interface IKeyRule
 */
export interface IMockerKeyRule {
  min?: number;
  max?: number;
  optional?: boolean;
  oneOf?: boolean;
  alwaysArray?: boolean;
  dynamics?: TObj<TDynamicConfig>
}

export interface IMockerPathRuleKeys {
  [index: string]: IMockerKeyRule;
}

export type TInstanceKeysConfig = Pick<IMockerKeyRule, 'min' | 'max'> &
  TEnumedIndex &
  TOptionalExist;
/**
 *
 */
export interface IAInstanceOptions {
  keys?: {
    [index: string]: TInstanceKeysConfig;
  };
  params?: {
    [index: string]: TOverrideParams;
  };
}

export type TInstanceDynamicConfig = {
  key?: TInstanceKeysConfig 
  param?: TOverrideParams;
}
/**
 *
 *
 * @interface TMockitInstances
 */
export type TMockitInstances<T extends Mockit<unknown>> = {
  [index: string]: T;
};
/**
 *
 *
 * @export
 * @interface IMockerOptions
 */
export interface IMockerOptions {
  target: unknown;
  path: TFieldPath;
  parent?: Mocker;
  config?: IMockerKeyRule;
}

export enum EnumSpecialType {
  Enum = 1,
  Template = 2,
}

/**
 * AssignType for assign method
 */
export enum AssignType {
  None = 0b0,
  AlwaysVariable = 0b1,
  // assign type
  MustNotOverride = 0b10,
  OverrideIfNotExist = 0b100,
  Override = 0b1000
}

export type TAssignedData = {
  value: unknown;
  exist: boolean;
  type?: AssignType;
}
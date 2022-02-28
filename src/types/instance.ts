import PathMap, { TFieldPath } from '../helpers/pathmap';
import { Mocker } from '../core/such';
import Mockit from '../core/mockit';
import { TMParams } from './mockit';

export type NestedPartial<T> = {
  [P in keyof T]: Partial<T[P]>
};
export type TOverrideParams = NestedPartial<Pick<TMParams, '$config' | '$length' | '$size'>>;
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
}

export interface IMockerPathRuleKeys {
  [index: string]: IMockerKeyRule;
}
/**
 *
 */
export interface IAInstanceOptions {
  keys?: {
    [index: string]: Pick<IMockerKeyRule, 'min' | 'max'> &
      TEnumedIndex &
      TOptionalExist;
  };
  params?: {
    [index: string]: TOverrideParams;
  };
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

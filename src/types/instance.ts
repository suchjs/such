import PathMap, { TFieldPath } from '../helpers/pathmap';
import { Mocker, Template } from '../core/such';
import Mockit from '../core/mockit';
export type TSuchInject = {
  datas: PathMap<unknown>;
  dpath: TFieldPath;
  mocker: Mocker;
  config?: Required<TEnumedIndex>;
  template?: Template;
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

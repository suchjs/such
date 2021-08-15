import PathMap, { TFieldPath } from '../helpers/pathmap';
import { Mocker, Template } from '../core/such';
import Mockit from '../core/mockit';
export interface TSuchInject {
  datas: PathMap<unknown>;
  dpath: TFieldPath;
  mocker: Mocker;
  template?: Template;
}
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
    [index: string]: Pick<IMockerKeyRule, 'min' | 'max'> & {
      exist?: boolean;
      index?: number;
    };
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

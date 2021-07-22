import PathMap, { TFieldPath } from '../helpers/pathmap';
import { Mocker } from '../core/such';
import Mockit from '../core/mockit';
export interface TSuchInject {
  datas: PathMap<unknown>;
  dpath: TFieldPath;
  mocker: Mocker;
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

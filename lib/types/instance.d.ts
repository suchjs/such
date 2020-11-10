import PathMap, { TFieldPath } from '../helpers/pathmap';
import Such, { Mocker } from '../core/such';
import Mockit from '../core/mockit';
export interface TSuchInject {
    datas: PathMap<unknown>;
    dpath: TFieldPath;
    such: typeof Such;
    mocker: Mocker;
}
export interface IAsOptions {
    config?: IMockerKeyRule;
}
export interface IMockerKeyRule {
    min?: number;
    max?: number;
    optional?: boolean;
    oneOf?: boolean;
    alwaysArray?: boolean;
}
export declare type TMockitInstances<T extends Mockit<unknown>> = {
    [index: string]: T;
};
export interface IMockerOptions {
    target: unknown;
    path: TFieldPath;
    parent?: Mocker;
    config?: IMockerKeyRule;
}
export interface IPromiseResult {
    dpath: TFieldPath;
    result: Promise<unknown>;
}

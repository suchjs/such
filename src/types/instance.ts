import PathMap, { TFieldPath } from '../helpers/pathmap';
import Such, { Mocker } from '../core/such';
export interface TSuchInject {
  datas: PathMap<unknown>;
  dpath: TFieldPath;
  such: typeof Such;
  mocker: Mocker;
}

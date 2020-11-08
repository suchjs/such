import PathMap, { Path } from '../helpers/pathmap';
import Such, { Mocker } from '../core/such';
export interface TSuchInject {
  datas: PathMap<unknown>;
  dpath: Path;
  such: typeof Such;
  mocker: Mocker;
}

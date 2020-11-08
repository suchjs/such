import { TObj } from 'src/types';
import PathMap, { Path } from 'src/helpers/pathmap';
export interface TSuchInject<S = TObj, M = TObj> {
  datas: PathMap<unknown>;
  dpath: Path;
  such: TObj<S>;
  mocker: M;
}

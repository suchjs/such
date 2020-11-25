import { TStrList } from '../../types/common';
import { IPPPath, IPPPathItem } from '../../types/parser';
import { makeRandom } from '../../helpers/utils';
import store from '../../data/store';
import { getRealPath, loadDict } from '../utils';
const { config, fileCache } = store;
type TMultiStr = string | TStrList;
export default {
  init(): void {
    this.addRule('$path', function ($path: IPPPath) {
      if (!$path) {
        throw new Error('the dict type must have a path param.');
      } else {
        $path.every((item: IPPPathItem) => {
          if (item.depth > 0) {
            throw new Error(
              `the dict type of path "${item.fullpath}" is not based on rootDir.`,
            );
          }
          return true;
        });
      }
    });
  },
  generate(): TMultiStr | Promise<TMultiStr> {
    const { $path, $length } = this.params;
    const preload = config.preload as boolean | TStrList;
    let isSync = false;
    if (typeof preload === 'boolean') {
      isSync = preload === true;
    } else if (Array.isArray(config.preload)) {
      isSync = $path.every((item: IPPPathItem) =>
        preload.includes(item.fullpath),
      );
    }
    const makeOne = (result: TStrList[]): string => {
      const dict = result[makeRandom(0, result.length - 1)];
      return dict[makeRandom(0, dict.length - 1)];
    };
    const makeAll = (result: TStrList[]): TMultiStr => {
      let count = $length ? makeRandom($length.least, $length.most) : 1;
      const one = count === 1;
      const last: TStrList = [];
      while (count--) {
        last.push(makeOne(result));
      }
      return one ? last[0] : last;
    };
    const lastPaths = $path.map((item: IPPPathItem) => {
      return getRealPath(item);
    });
    if (isSync) {
      const queues: TStrList[] = [];
      lastPaths.map((filePath: string) => {
        queues.push(fileCache[filePath] as TStrList);
      });
      return makeAll(queues);
    } else {
      return loadDict(lastPaths).then((result) => {
        return makeAll(result as TStrList[]);
      });
    }
  },
};

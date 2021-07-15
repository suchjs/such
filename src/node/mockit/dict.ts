import { TStrList } from '../../types/common';
import { IPPPath, IPPPathItem } from '../../types/parser';
import { makeRandom } from '../../helpers/utils';
import store from '../../data/store';
import { getRealPath } from '../utils';
const { fileCache } = store;
type TMultiStr = string | TStrList;
export default {
  /**
   * init
   */
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

  /**
   *
   * @returns [TMultiStr] return items of the dict
   */
  generate(): TMultiStr {
    const { $path, $length } = this.params;
    const lastPaths = $path.map((item: IPPPathItem) => {
      return getRealPath(item);
    });
    const queues: TStrList[] = [];
    // all the dict files must preload before generate
    // check if every path is in preload
    for (const filePath of lastPaths) {
      if (!fileCache.hasOwnProperty(filePath)) {
        throw new Error(
          `the dict filepath '${filePath}' is not found in dict directory`,
        );
      } else {
        queues.push(fileCache[filePath] as TStrList);
      }
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
    return makeAll(queues);
  },
};

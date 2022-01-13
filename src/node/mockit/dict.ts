import { TMultiStr, TStrList } from '../../types/common';
import { IPPPath, IPPPathItem } from '../../types/parser';
import store from '../../data/store';
import { getRealPath } from '../utils';
import { hasOwn, makeDictData } from '../../helpers/utils';

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
    const { $path } = this.params;
    const lastPaths = $path.map((item: IPPPathItem) => {
      return getRealPath(item);
    });
    const queues: TStrList[] = [];
    const { fileCache } = store;
    // all the dict files must preload before generate
    // check if every path is in preload
    for (const filePath of lastPaths) {
      if (!hasOwn(fileCache, filePath)) {
        throw new Error(`the dict of '${filePath}' is not loaded or not found`);
      } else {
        queues.push(fileCache[filePath] as TStrList);
      }
    }
    const makeAll = makeDictData(this.params);
    return makeAll(queues);
  },
};

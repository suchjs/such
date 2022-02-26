import { TMultiStr, TStrList } from '../../types/common';
import { IPPPath, IPPPathItem } from '../../types/parser';
import { getFileCacheData } from '../utils';
import { makeDictData } from '../../helpers/utils';
import Mockit from '../../core/mockit';
import { Such } from 'src/core/such';
import { TSuchInject } from 'src/types/instance';

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
  generate(this: Mockit<TMultiStr>, _options: TSuchInject, such: Such): TMultiStr {
    const { $path } = this.params;
    const queues = $path.map((item: IPPPathItem) => {
      const content = getFileCacheData(item, such.store);
      if(content === undefined){
        throw new Error(`the dict of '${item.fullpath}' is not loaded or not found`);
      }
      return content as TStrList;
    });
    // all the dict files must preload before generate
    // check if every path is in preload
    const makeAll = makeDictData(this.params);
    return makeAll(queues);
  },
};

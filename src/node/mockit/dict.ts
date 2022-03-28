import { TMultiStr, TStrList } from '../../types/common';
import { IPPPath, IPPPathItem } from '../../types/parser';
import { getFileCacheData } from '../utils';
import { makeDictData } from '../../helpers/utils';
import Mockit from '../../core/mockit';
import { Such } from '../../core/such';
import { TSuchInject } from '../../types/instance';

export default {
  // config options
  configOptions: {
    data: {
      type: Array,
    },
  },
  /**
   * init
   */
  init(): void {
    this.addRule('$path', function ($path: IPPPath) {
      if ($path) {
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
  generate(
    this: Mockit<TMultiStr>,
    options: TSuchInject,
    such: Such,
  ): TMultiStr {
    const { mocker } = options;
    const { $path, $config } = this.params;
    let queues: TStrList[];
    if ($config?.data) {
      // if the config data is set
      // use the data as a dict 
      // but the path can't set now
      if ($path) {
        throw new Error(
          `[${mocker.path.join(
            '/',
          )}]You can't set a dict type both with a config 'data' and a reference file path:"${
            $path[0]
          }".`,
        );
      }
      queues = [$config.data as TStrList];
    } else {
      // all the dict files must preload before generate
      // check if every path is in preload
      queues = $path.map((item: IPPPathItem) => {
        const content = getFileCacheData(
          item,
          such.store('config', 'fileCache'),
        );
        if (content === undefined) {
          throw new Error(
            `the dict of '${item.fullpath}' is not loaded or not found`,
          );
        }
        return content as TStrList;
      });
    }
    const makeAll = makeDictData(this.params);
    return makeAll(queues);
  },
};

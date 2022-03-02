import { IPPPath } from '../../types/parser';
import { makeCascaderData } from '../../helpers/utils';
import { getFileCacheData } from '../utils';
import { TSuchInject } from '../../types/instance';
import { TStrList } from '../../types/common';
import Mockit from '../../core/mockit';
import { Such } from '../../core/such';

export default {
  // config options
  configOptions: {
    root: {
      type: Boolean,
      default: false,
    },
    handle: {
      type: Function,
    },
  },
  // init method
  init(): void {
    // cascader value need '$path' data attribute
    // for root node, the $path pointed to the data file
    // for child node, the $path reference to the parent node
    this.addRule('$path', ($path: IPPPath) => {
      if (!$path) {
        throw new Error('the cascader type must have a path or ref.');
      } else if ($path.length !== 1) {
        throw new Error('the cascader type must have an only path or ref.');
      }
    });
  },
  /**
   * generate a cascader value
   * @param options [TSuchReject]
   * @returns [unkown]
   */
  generate(this: Mockit<unknown>, options: TSuchInject, such: Such): unknown | never {
    const { mocker } = options;
    const { handle, values, lastPath } = makeCascaderData(this.params, mocker);
    const data = getFileCacheData(lastPath, such.store('config', 'fileCache'));
    return handle(data, values as TStrList);
  },
};

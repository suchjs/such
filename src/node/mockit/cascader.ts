import { IPPPath } from '../../types/parser';
import { makeCascaderData } from '../../helpers/utils';
import store from '../../data/store';
import { getRealPath } from '../utils';
import { TSuchInject } from '../../types/instance';
import { TStrList } from '../../types/common';

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
  generate(options: TSuchInject): unknown | never {
    const { fileCache } = store;
    const { mocker } = options;
    const { handle, values, lastPath } = makeCascaderData(this.params, mocker);
    const realPath = getRealPath(lastPath);
    const data = fileCache[realPath];
    return handle(data, values as TStrList);
  },
};

import { IPPPath } from '../../types/parser';
import { makeCascaderData } from '../../helpers/utils';
import store from '../../data/store';
import { getRealPath } from '../utils';
import { TSuchInject } from '../../types/instance';
import { TStrList } from '../../types/common';
const { fileCache } = store;

export default {
  configOptions: {
    root: {
      type: Boolean,
      default: false,
    },
    handle: {
      type: Function,
    },
  },
  init(): void {
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
    const { mocker } = options;
    const { handle, values, lastPath } = makeCascaderData(this.params, mocker);
    const realPath = getRealPath(lastPath);
    const data = fileCache[realPath];
    return handle(data, values as TStrList);
  },
};

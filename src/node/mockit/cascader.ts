import { IPPPath } from '../../types/parser';
import { getRefMocker } from '../../helpers/utils';
import store from '../../data/store';
import { getCascaderValue, getRealPath } from '../utils';
import { TSuchInject } from '../../types/instance';
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
    let { $path, $config } = this.params;
    let lastPath = $path[0];
    let handle = $config.handle;
    const values: unknown[] = [];
    // the nested max level < 10
    let loop = 1;
    // loop to get the root mocker
    while (!$config.root && loop++ < 10) {
      const refMocker = getRefMocker(lastPath, mocker);
      if (!refMocker) {
        // eslint-disable-next-line no-console
        console.error(
          `the cascader reference the path '${lastPath}' is not exist or generated.`,
        );
        return;
      }
      const { mockit } = refMocker;
      const { params } = mockit;
      $path = params.$path;
      $config = params.$config;
      lastPath = $path[0];
      handle = handle || $config.handle;
      values.unshift(refMocker.result);
    }
    handle = handle || getCascaderValue;
    const realPath = getRealPath(lastPath);
    const data = fileCache[realPath];
    return handle(data, values);
  },
};

import { TStrList } from '../../types/common';
import { IPPPath, IPPPathItem } from '../../types/parser';
import { getRefMocker, withPromise } from '../../helpers/utils';
import store from '../../data/store';
import { getCascaderValue, getRealPath, loadJson } from '../utils';
import { TSuchInject } from '../../types/instance';
const { config, fileCache } = store;

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
  generate(options: TSuchInject): TStrList | Promise<TStrList> {
    const { mocker } = options;
    let { $path, $config } = this.params;
    let lastPath = $path[0];
    let handle = $config.handle;
    const values: unknown[] = [];
    let loop = 1;
    while (!$config.root && loop++ < 10) {
      const refMocker = getRefMocker(lastPath, mocker);
      const { mockit } = refMocker;
      const { params } = mockit;
      $path = params.$path;
      $config = params.$config;
      lastPath = $path[0];
      handle = handle || $config.handle;
      values.unshift(refMocker.result);
    }
    handle = handle || getCascaderValue;
    let isSync = false;
    const preload = config.preload as boolean | string[];
    if (typeof preload === 'boolean') {
      isSync = preload === true;
    } else if (Array.isArray(config.preload)) {
      isSync = ($path as IPPPath).every((item: IPPPathItem) =>
        preload.includes(item.fullpath),
      );
    }
    const realPath = getRealPath(lastPath);
    if (isSync) {
      const data = fileCache[realPath];
      return handle(data, values);
    } else {
      return loadJson(realPath).then((data) => {
        return Promise.all(withPromise(values)).then((last: unknown[]) => {
          const cur = handle(data, last);
          return cur;
        });
      });
    }
  },
};

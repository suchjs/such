import { getRefMocker, withPromise } from '../../helpers/utils';
import store from '../../store';
import { Mocker } from '../../such';
import {
  TObj,
  SuchOptions,
  ParamsPath,
  ParamsPathItem,
  TStrList,
} from '../../types';
import { getCascaderValue, getRealPath, loadJson } from '../utils';
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
    this.addRule('Path', (Path: ParamsPath) => {
      if (!Path) {
        throw new Error('the cascader type must have a path or ref.');
      } else if (Path.length !== 1) {
        throw new Error('the cascader type must have an only path or ref.');
      }
    });
  },
  generate(options: SuchOptions): TStrList | Promise<TStrList> {
    const { mocker } = options;
    let { Path, Config } = this.params;
    let lastPath = Path[0];
    let handle = Config.handle;
    const values: unknown[] = [];
    let loop = 1;
    while (!Config.root && loop++ < 10) {
      const refMocker = getRefMocker(lastPath, mocker as Mocker);
      const { mockit } = refMocker;
      const { params } = mockit;
      Path = params.Path;
      Config = params.Config;
      lastPath = Path[0];
      handle = handle || Config.handle;
      values.unshift(refMocker.result);
    }
    handle = handle || getCascaderValue;
    let isSync = false;
    const preload = config.preload as boolean | string[];
    if (typeof preload === 'boolean') {
      isSync = preload === true;
    } else if (Array.isArray(config.preload)) {
      isSync = (Path as ParamsPath).every((item: ParamsPathItem) =>
        preload.includes(item.fullpath),
      );
    }
    const realPath = getRealPath(lastPath);
    if (isSync) {
      const data = fileCache[realPath];
      return handle(data, values);
    } else {
      return loadJson(realPath).then((data: TObj) => {
        return Promise.all(withPromise(values)).then((last: unknown[]) => {
          const cur = handle(data, last);
          return cur;
        });
      });
    }
  },
};

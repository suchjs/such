import { getRefMocker, typeOf, withPromise } from '../../helpers/utils';
import store from '../../store';
import { Mocker } from '../../such';
import { NormalObject, SuchOptions } from '../../types';
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
  init() {
    this.addRule('Path', (Path: NormalObject) => {
      if(!Path) {
        throw new Error('the cascader type must have a path or ref.');
      } else if(Path.length !== 1) {
        throw new Error('the cascader type must have an only path or ref.');
      }
    });
  },
  generate(options: SuchOptions ) {
    const { mocker } = options;
    let { Path, Config } = this.params;
    let lastPath = Path[0];
    let handle = Config.handle;
    const values: any[] = [];
    let loop = 1;
    while(!Config.root && loop++ < 10) {
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
    // tslint:disable-next-line:max-line-length
    const isSync = config.preload === true || (typeOf(config.preload) === 'Array' && config.preload.indexOf(lastPath.fullpath) > -1);
    const realPath = getRealPath(lastPath);
    if(isSync) {
      const data = fileCache[realPath];
      return handle(data, values);
    } else {
      return loadJson(realPath).then((data: NormalObject) => {
        return Promise.all(withPromise(values)).then((last: any[]) => {
          const cur = handle(data, last);
          return cur;
        });
      });
    }
  },
};

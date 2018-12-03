import * as path from 'path';
import { makeRandom, typeOf } from '../../helpers/utils';
import store from '../../store';
import { NormalObject, ParamsPathItem } from '../../types';
import { loadDict } from '../utils';
const { config, fileCache } = store;

export default {
  configOptions: {
    count: {
      type: Number,
      validator(target: any) {
        return typeof target === 'number' && target > 0 && target % 1 === 0;
      },
      default: 1,
    },
  },
  init() {
    this.addRule('Path', (Path: NormalObject) => {
      if(!Path) {
        throw new Error(`the dict type must have a path.`);
      }
    });
  },
  generate() {
    const { Path, Config } = this.params;
    // tslint:disable-next-line:max-line-length
    const isSync = config.preload === true || (typeOf(config.preload) === 'Array' && Path.every((item: ParamsPathItem) => config.preload.indexOf(item.fullpath) > -1));
    const makeOne = (result: string[][]) => {
      const dict = result[makeRandom(0, result.length - 1)];
      return dict[makeRandom(0, dict.length - 1)];
    };
    const makeAll = (result: string[][]) => {
      let count = Config.count || 1;
      const one = count === 1;
      const last: string[] = [];
      while(count--) {
        last.push(makeOne(result));
      }
      return one ? last[0] : last;
    };
    const lastPaths = Path.map((item: ParamsPathItem) => {
      const { variable } = item;
      let { fullpath } = item;
      if(variable) {
        fullpath = fullpath.replace(`<${variable}>`, config[variable]);
      } else {
        fullpath = path.resolve(config.dataDir || config.rootDir, fullpath);
      }
      return fullpath;
    });
    if(isSync) {
      const queues: string[][] = [];
      lastPaths.map((filePath: string) => {
        queues.push(fileCache[filePath]);
      });
      return makeAll(queues);
    } else {
      return loadDict(lastPaths).then((result) => {
        return makeAll(result as string[][]);
      });
    }
  },
};

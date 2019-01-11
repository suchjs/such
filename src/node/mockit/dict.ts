import { makeRandom, typeOf } from '../../helpers/utils';
import store from '../../store';
import { NormalObject, ParamsPathItem } from '../../types';
import { getRealPath, loadDict } from '../utils';
const { config, fileCache } = store;

export default {
  init() {
    this.addRule('Path', function(Path: NormalObject) {
      if(!Path) {
        throw new Error('the dict type must have a path param.');
      } else {
        Path.every((item: ParamsPathItem) => {
          if(item.depth > 0) {
            throw new Error(`the dict type of path "${item.fullpath}" is not based on rootDir.`);
          }
          return true;
        });
      }
    });
  },
  generate() {
    const { Path, Length } = this.params;
    // tslint:disable-next-line:max-line-length
    const isSync = config.preload === true || (typeOf(config.preload) === 'Array' && Path.every((item: ParamsPathItem) => config.preload.indexOf(item.fullpath) > -1));
    const makeOne = (result: string[][]) => {
      const dict = result[makeRandom(0, result.length - 1)];
      return dict[makeRandom(0, dict.length - 1)];
    };
    const makeAll = (result: string[][]) => {
      let count = Length ? makeRandom(Length.least, Length.most) : 1;
      const one = count === 1;
      const last: string[] = [];
      while(count--) {
        last.push(makeOne(result));
      }
      return one ? last[0] : last;
    };
    const lastPaths = Path.map((item: ParamsPathItem) => {
      return getRealPath(item);
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

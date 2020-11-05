import { makeRandom } from '../../helpers/utils';
import store from '../../store';
import { ParamsPath, ParamsPathItem } from '../../types';
import { getRealPath, loadDict } from '../utils';
const { config, fileCache } = store;
type TString = string | string[];
export default {
  init(): void {
    this.addRule('Path', function (Path: ParamsPath) {
      if (!Path) {
        throw new Error('the dict type must have a path param.');
      } else {
        Path.every((item: ParamsPathItem) => {
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
  generate(): TString | Promise<TString> {
    const { Path, Length } = this.params;
    const preload = config.preload as boolean | string[];
    let isSync = false;
    if (typeof preload === 'boolean') {
      isSync = preload === true;
    } else if (Array.isArray(config.preload)) {
      isSync = Path.every((item: ParamsPathItem) =>
        preload.includes(item.fullpath),
      );
    }
    const makeOne = (result: string[][]): string => {
      const dict = result[makeRandom(0, result.length - 1)];
      return dict[makeRandom(0, dict.length - 1)];
    };
    const makeAll = (result: string[][]): TString => {
      let count = Length ? makeRandom(Length.least, Length.most) : 1;
      const one = count === 1;
      const last: string[] = [];
      while (count--) {
        last.push(makeOne(result));
      }
      return one ? last[0] : last;
    };
    const lastPaths = Path.map((item: ParamsPathItem) => {
      return getRealPath(item);
    });
    if (isSync) {
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

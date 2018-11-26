import PathMap, { Path as DPath } from '../helpers/pathmap';
import { ParamsPath, ParamsPathItem } from '../types';
import Mockit from './namespace';
export default class ToRef extends Mockit<any> {
  constructor(constructName: string) {
    super(constructName);
  }
  public init() {
    // path
    this.addRule('Path', function(Path: ParamsPath) {
      // no validate because no dpath and datas.
    });
  }
  public generate(datas: PathMap<any>, dpath: DPath) {
    const { Path } = this.params;
    const result: any[] = [];
    let isExists = true;
    Path.map((item: ParamsPathItem) => {
      let lastPath: DPath;
      if(!item.relative) {
        lastPath = item.path;
      } else {
        if(dpath.length < item.depth + 1) {
          isExists = false;
        } else {
          lastPath = dpath.slice(0, - (1 + item.depth)).concat(item.path);
        }
      }
      if(isExists && datas.has(lastPath)) {
        result.push(datas.get(lastPath));
      } else {
        throw new Error(`the path of "/${lastPath.join('/')}" is not exists in the datas.`);
      }
    });
    return Path.length === 1 ? result[0] : result;
  }
  public test() {
    return true;
  }
}

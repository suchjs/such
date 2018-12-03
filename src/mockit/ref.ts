import { Path as DPath } from '../helpers/pathmap';
import { withPromise } from '../helpers/utils';
import { ParamsPath, ParamsPathItem, SuchOptions } from '../types';
import Mockit from './namespace';
export default class ToRef extends Mockit<any> {
  constructor(constructName: string) {
    super(constructName);
  }
  public init() {
    // path
    this.addRule('Path', function(Path: ParamsPath) {
      if(!Path) {
        throw new Error(`the ref type must has a path param.`);
      }
    });
  }
  public generate(options: SuchOptions) {
    const { datas, dpath } = options;
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
        // tslint:disable-next-line:max-line-length
        throw new Error(`the path of "${lastPath ? '/' + lastPath.join('/') : item.fullpath}" is not exists in the datas.`);
      }
    });
    return Path.length === 1 ? result[0] : withPromise(result);
  }
  public test() {
    return true;
  }
}

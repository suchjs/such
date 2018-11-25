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
      console.log('path is', Path);
    });
  }
  public generate(datas: PathMap<any>, dpath: DPath) {
    const { Path } = this.params;
  }
  public test() {
    return true;
  }
}

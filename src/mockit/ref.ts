import { getRefMocker, withPromise } from '../helpers/utils';
import { Mocker } from '../such';
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
    const { mocker } = options;
    const { Path } = this.params;
    const result: any[] = [];
    Path.map((item: ParamsPathItem) => {
      const refMocker = getRefMocker(item, mocker as Mocker);
      result.push(refMocker.result);
    });
    return Path.length === 1 ? result[0] : withPromise(result);
  }
  public test() {
    return true;
  }
}

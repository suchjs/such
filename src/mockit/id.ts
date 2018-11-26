import PathMap, { Path  } from '../helpers/pathmap';
import { NormalObject, ParamsConfig } from '../types';
import Mockit from './namespace';
export default class ToId extends Mockit<number> {
  constructor(constructName: string) {
    super(constructName);
  }
  public init() {
    // config
    this.addRule('Config', function(Config: ParamsConfig) {
      //
      const allowKeys = ['start', 'step'];
      const last: NormalObject = {};
      const hasDisallow = Object.keys(Config).some((key) => {
        const flag = allowKeys.indexOf(key) < 0;
        last[key] = Config[key];
        if(typeof last[key] !== 'number') {
          throw new Error(`the config of key "${key}" must be a number.got ${last[key]}`);
        }
        return flag;
      });
      if(hasDisallow) {
        throw new Error(`the config of id can only support keys:${allowKeys.join(',')}`);
      }
    });
  }
  public generate(datas: PathMap<any>, dpath: Path) {
    const { Config } = this.params;
    const start = Config.hasOwnProperty('start') ? Config.start : 1;
    const step = Config.hasOwnProperty('step') ? Config.step : 1;
    let len = dpath.length;
    while(len--) {
      const cur = dpath[len];
      if(typeof cur === 'number') {
        return start + step * cur;
      }
    }
    return start;
  }
  public test() {
    return true;
  }
}

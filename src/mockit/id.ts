import { NormalObject, ParamsConfig, SuchOptions } from '../types';
import Mockit from './namespace';
export default class ToId extends Mockit<number> {
  constructor(constructName: string) {
    super(constructName);
  }
  public init() {
    // config
    this.addRule('Config', function(Config: ParamsConfig) {
      if(!Config) {
        return;
      }
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
  public generate(options: SuchOptions) {
    const { dpath } = options;
    const config = this.params.Config || {};
    const start = config.hasOwnProperty('start') ? config.start : 1;
    const step = config.hasOwnProperty('step') ? config.step : 1;
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

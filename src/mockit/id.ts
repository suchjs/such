import { SuchOptions } from '../types';
import Mockit from './namespace';
export default class ToId extends Mockit<number> {
  constructor(constructName: string) {
    super(constructName);
  }
  public init() {
    this.configOptions = {
      step: {
        type: Number,
        default: 1,
      },
      start: {
        type: Number,
        default: 1,
      },
    };
  }
  public generate(options: SuchOptions) {
    const { dpath } = options;
    const config = this.params.Config || {};
    const { start, step } = config;
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

import { TSuchInject } from '../types/instance';
import Mockit from '../core/mockit';
export default class ToId extends Mockit<number> {
  constructor(constructName: string) {
    super(constructName);
  }
  // init
  public init(): void {
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
  public generate(options: TSuchInject): number {
    const { dpath } = options;
    const config = (this.params.Config || {}) as {
      start?: number;
      step?: number;
    };
    const { start, step } = config;
    let len = dpath.length;
    while (len--) {
      const cur = dpath[len];
      if (typeof cur === 'number') {
        return start + step * cur;
      }
    }
    return start;
  }
  public test(): boolean {
    return true;
  }
}

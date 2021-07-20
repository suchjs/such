import { TSuchInject } from '../types/instance';
import Mockit from '../core/mockit';
import { IPPSize } from '../types/parser';
import { makeRandom } from 'src/helpers/utils';
export default class ToId extends Mockit<number | number[]> {
  // set constructor name
  constructor(protected readonly constrName: string = 'ToId') {
    super(constrName);
  }
  // init
  public init(): void {
    // set default config params
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
    // allow $size, now it become to a range type
    this.addRule('$size', function ($size: IPPSize) {
      if (!$size) {
        return;
      }
    });
  }
  // generate
  public generate(options: TSuchInject): number | number[] {
    const { dpath } = options;
    const { $config, $length } = this.params;
    const config = ($config || {}) as {
      start?: number;
      step?: number;
    };
    const { start, step } = config;
    if ($length) {
      const { least, most } = $length;
      const count = makeRandom(least, most);
      let i = 0;
      const result: number[] = [];
      while (i < count) {
        result.push(start + step * i);
        i++;
      }
      return result;
    }
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

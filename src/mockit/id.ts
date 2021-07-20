import { TSuchInject } from '../types/instance';
import Mockit from '../core/mockit';
import { IPPSize } from '../types/parser';
import { makeRandom } from '../helpers/utils';
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
    const { $config, $length } = this.params;
    const config = ($config || {}) as {
      start?: number;
      step?: number;
    };
    const { start, step } = config;
    const { mocker } = options;
    const storeData = mocker.storeData as { id: number };
    if ($length) {
      const { least, most } = $length;
      const result: number[] = [];
      let count = makeRandom(least, most);
      if (count > 0) {
        if (typeof storeData['id'] !== 'number') {
          storeData['id'] = start;
          // push the start id
          result.push(storeData['id']);
          // reduce count
          count--;
        }
        // if count still > 1
        while (count-- > 0) {
          storeData['id'] += step;
          result.push(storeData['id']);
        }
      }
      return result;
    }
    if (typeof storeData['id'] === 'number') {
      storeData['id'] += step;
    } else {
      storeData['id'] = start;
    }
    return storeData['id'] as number;
  }
  public test(): boolean {
    return true;
  }
}

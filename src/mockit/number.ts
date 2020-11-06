import printf, { rule as formatRule } from 'nprintf';
import { IPPConfig, IPPSize } from 'src/types/parser';
import { isOptional } from '../helpers/utils';
import { TObj } from '../types';
import Mockit, { ModifierFn } from './namespace';

const factor = (type: number) => {
  const epsilon = Number.EPSILON || Math.pow(2, -52);
  switch (type) {
    case 2:
      return 1 - Math.random();
    case 3:
      return (1 + epsilon) * Math.random();
    case 0:
      return (1 - epsilon) * (1 - Math.random());
    case 1:
    default:
      return Math.random();
  }
};
export default class ToNumber extends Mockit<number> {
  constructor(constructName: string) {
    super(constructName);
  }
  //
  public init() {
    this.configOptions = {
      step: {
        type: Number,
      },
    };
    // Size Rule
    this.addRule('Size', function (Size: TObj) {
      if (!Size) {
        return;
      }
      const { range } = Size;
      const size = range.length;
      if (size !== 2) {
        // tslint:disable-next-line:max-line-length
        throw new Error(
          size < 2
            ? `the Size param must have the min and the max params`
            : `the Size param length should be 2,but got ${size}`,
        );
      }
      let [min, max] = range;
      min = min.trim();
      max = max.trim();
      if (min === '' && max === '') {
        throw new Error(`the min param and max param can not both undefined`);
      }
      if (min === '') {
        min = Number.MIN_SAFE_INTEGER || Number.MIN_VALUE;
      }
      if (max === '') {
        max = Number.MAX_SAFE_INTEGER || Number.MAX_VALUE;
      }
      if (isNaN(min)) {
        throw new Error(`the min param expect a number,but got ${min}`);
      }
      if (isNaN(max)) {
        throw new Error(`the max param expect a number,but got ${max}`);
      }
      const lastMin = Number(min);
      const lastMax = Number(max);
      if (lastMin > lastMax) {
        throw new Error(
          `the min number ${min} is big than the max number ${max}`,
        );
      }
      return {
        range: [lastMin, lastMax],
      };
    });
    // Format rule
    this.addRule('Format', function (Format: TObj) {
      if (!Format) {
        return;
      }
      const { format } = Format;
      if (!formatRule.test(format)) {
        throw new Error(`Wrong format rule(${format})`);
      }
    });
    // Format Modifier
    this.addModifier('Format', function (result: number, Format: TObj) {
      return printf(Format.format, result);
    } as ModifierFn<number>);
  }
  public generate(): number {
    const { params } = this;
    const Size = params.Size as IPPSize;
    const Config = params.Config as IPPConfig;
    let result: number;
    if (Size) {
      const { range } = Size;
      const step = Config && Config.step;
      const [min, max] = range;
      if (step) {
        const minPlus = 0;
        const maxPlus = Math.floor((max - min) / step);
        if (maxPlus > minPlus) {
          return (
            +min +
            step * (minPlus + Math.floor(Math.random() * (maxPlus - minPlus)))
          );
        }
      }
      result = +min + (max - min) * factor(3);
    } else {
      result = Math.random() * Math.pow(10, Math.floor(10 * Math.random()));
      result = isOptional() ? -result : result;
    }
    return result;
  }
  public test(): boolean {
    return true;
  }
}

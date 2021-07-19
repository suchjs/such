import printf, { rule as formatRule } from 'nprintf';
import { TMModifierFn } from '../types/mockit';
import { IPPFormat, IPPSize } from '../types/parser';
import { isOptional } from '../helpers/utils';
import Mockit from '../core/mockit';

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
  // init
  public init(): void {
    this.configOptions = {
      step: {
        type: Number,
      },
    };
    // $size Rule
    this.addRule('$size', function ($size: IPPSize) {
      if (!$size) {
        return;
      }
      const { range } = $size;
      const size = range.length;
      if (size !== 2) {
        throw new Error(
          size < 2
            ? `the $size param must have the min and the max params`
            : `the $size param length should be 2,but got ${size}`,
        );
      }
      let [min, max] = range;
      min = (min as string).trim();
      max = (max as string).trim();
      if (min === '' && max === '') {
        throw new Error(`the min param and max param can not both undefined`);
      }
      if (min === '') {
        min = Number.MIN_SAFE_INTEGER || Number.MIN_VALUE;
      }
      if (max === '') {
        max = Number.MAX_SAFE_INTEGER || Number.MAX_VALUE;
      }
      if (isNaN(min as number)) {
        throw new Error(`the min param expect a number,but got ${min}`);
      }
      if (isNaN(max as number)) {
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
    // $format rule
    this.addRule('$format', function ($format: IPPFormat) {
      if (!$format) {
        return;
      }
      const { format } = $format;
      if (!formatRule.test(format)) {
        throw new Error(`Wrong format rule(${format})`);
      }
    });
    // $format Modifier
    this.addModifier('$format', function (result: number, $format: IPPFormat) {
      return printf($format.format, result);
    } as TMModifierFn<number>);
  }
  /**
   * generate a random number
   * @returns [number]
   */
  public generate(): number {
    const { $size, $config } = this.params;
    let result: number;
    if ($size) {
      const { range } = $size;
      const step = $config && ($config.step as number);
      const [min, max] = range as number[];
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

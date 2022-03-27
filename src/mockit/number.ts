import printf, { rule as formatRule } from 'nprintf';
import { TMAttrs, TMModifierFn } from '../types/mockit';
import { IPPFormat, IPPSize } from '../types/parser';
import { isOptional } from '../helpers/utils';
import Mockit from '../core/mockit';
import { TSuchInject } from '../types/instance';

/**
 * Inclusive
 */
const INCLUSIVE = {
  none: 0,
  min: 1,
  max: 2,
  both: 3,
};

const factor = (type: number) => {
  const epsilon = Number.EPSILON || Math.pow(2, -52);
  switch (type) {
    case INCLUSIVE.max:
      return 1 - Math.random();
    case INCLUSIVE.both:
      return (1 + epsilon) * Math.random();
    case INCLUSIVE.none:
      return (1 - epsilon) * (1 - Math.random());
    case INCLUSIVE.min:
    default:
      return Math.random();
  }
};
const configOptions = {
  step: {
    type: Number,
  },
};
export default class ToNumber extends Mockit<number> {
  public static readonly constrName: string = 'ToNumber';
  // config options
  public static configOptions = configOptions;
  public static selfConfigOptions = configOptions;
  // allowed data attribute
  public static readonly allowAttrs: TMAttrs = [];
  // init
  public init(): void {
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
  public generate(options: TSuchInject): number {
    const { $size, $config } = this.getCurrentParams(options);
    let result: number;
    if ($size) {
      const { range } = $size;
      const step = $config && ($config.step as number);
      const [min, max] = range as number[];
      const exclude = $config && ($config.exclude as string);
      // if has step, use the step
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
      let fac = INCLUSIVE.both;
      // if has exclude config, change the factor
      if (exclude) {
        const excludes = exclude.split(',');
        excludes.map((end: keyof typeof INCLUSIVE) => {
          fac -= INCLUSIVE[end];
        });
        fac = fac < 0 ? 0 : fac;
      }
      result = +min + (max - min) * factor(fac);
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

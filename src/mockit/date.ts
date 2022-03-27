import { TMAttrs, TMModifierFn } from '../types/mockit';
import { IPPFormat, IPPSize } from '../types/parser';
import { strRule } from '../data/config';
import {
  decodeTrans,
  makeRandom,
  dateformat,
  strtotime,
} from '../helpers/utils';
import Mockit from '../core/mockit';
import { TSuchInject } from '../types/instance';
const makeDate = (param: string | number, now?: Date): Date | never => {
  let date: Date;
  if (typeof param === 'number') {
    date = new Date(param);
  } else if (strRule.test(param as string)) {
    date = strtotime(RegExp.$2, now);
  } else {
    throw new Error(`invalid date:${param}`);
  }
  return date;
};
const configOptions = {
  now: {
    type: [Date, String],
    default: new Date(),
    validator(value: unknown): boolean | never {
      return value instanceof Date;
    },
  },
};
export default class ToDate extends Mockit<string | Date> {
  // set constructor name
  // keep the name in parameter
  // don't short for `super('ToDate')`
  // the constrName may not make sence, need check the ts
  public static readonly constrName: string = 'ToDate';
  // allowed data attribute
  public static readonly allowAttrs: TMAttrs = [];
  // set config options
  public static configOptions = configOptions;
  public static selfConfigOptions = configOptions;
  // init
  public init(): void {
    // range
    this.addRule(
      '$size',
      function ($size: IPPSize) {
        if (!$size) {
          return;
        }
        const { range } = $size;
        if (range.length !== 2) {
          throw new Error(
            `the time range should supply 2 arguments,but got ${range.length}`,
          );
        }
      },
      true,
    );
    // $format rule
    this.addRule(
      '$format',
      function ($format: IPPFormat) {
        if (!$format) {
          return;
        }
        // nothing
        let { format } = $format;
        format = decodeTrans(format.slice(1));
        return {
          format,
        };
      },
      true,
    );
    // modifier
    this.addModifier('$format', function (result: unknown, $format: IPPFormat) {
      const { format } = $format;
      return dateformat(format, result as Date);
    } as TMModifierFn<string>);
  }
  // generate
  public generate(options: TSuchInject): Date {
    const { $size, $config = {} } = this.getCurrentParams(options);
    const now =
      typeof $config.now === 'string'
        ? strtotime($config.now)
        : ($config.now as Date);
    const [startTime, endTime] = (
      $size
        ? (() => {
            const [start, end] = $size.range;
            const startDate: Date | never = makeDate(start, now);
            const endDate: Date | never = makeDate(end, now);
            const startTime = startDate.getTime();
            const endTime = endDate.getTime();
            if (endTime < startTime) {
              throw new Error(
                `the time range of start time ${start} is big than end time ${end}.`,
              );
            }
            return [startTime, endTime];
          })()
        : [
            strtotime('-10 years', now).getTime(),
            strtotime('+10 years', now).getTime(),
          ]
    ) as number[];
    const time = makeRandom(startTime, endTime);
    const date = new Date();
    date.setTime(time);
    return date;
  }
  public test(): boolean {
    return true;
  }
}

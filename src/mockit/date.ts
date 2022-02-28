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
const makeDate = (param: string | number): Date | never => {
  let date: Date;
  if (typeof param === 'number') {
    date = new Date(param);
  } else if (strRule.test(param as string)) {
    date = strtotime(RegExp.$2);
  } else {
    throw new Error(`invalid date:${param}`);
  }
  return date;
};
export default class ToDate extends Mockit<string | Date> {
  // set constructor name
  // keep the name in parameter
  // don't short for `super('ToDate')`
  // the constrName may not make sence, need check the ts
  public static readonly constrName: string = 'ToDate';
  // allowed data attribute
  public static readonly allowAttrs: TMAttrs = [];
  // init
  public init(): void {
    // range
    this.addRule('$size', function ($size: IPPSize) {
      if (!$size) {
        return;
      }
      const { range } = $size;
      if (range.length !== 2) {
        throw new Error(
          `the time range should supply 2 arguments,but got ${range.length}`,
        );
      } else {
        const [start, end] = range;
        const startDate: Date | never = makeDate(start);
        const endDate: Date | never = makeDate(end);
        const startTime = startDate.getTime();
        const endTime = endDate.getTime();
        if (endTime < startTime) {
          throw new Error(
            `the time range of start time ${start} is big than end time ${end}.`,
          );
        } else {
          return {
            range: [startTime, endTime],
          };
        }
      }
    });
    // $format rule
    this.addRule('$format', function ($format: IPPFormat) {
      if (!$format) {
        return;
      }
      // nothing
      let { format } = $format;
      format = decodeTrans(format.slice(1));
      return {
        format,
      };
    });
    // modifier
    this.addModifier('$format', function (result: unknown, $format: IPPFormat) {
      const { format } = $format;
      return dateformat(format, result as Date);
    } as TMModifierFn<string>);
  }
  public generate(options: TSuchInject): Date {
    let { $size } = this.params;
    if ($size && options.param?.$size) {
      $size = {
        ...$size,
        ...options.param.$size,
      };
    }
    const range = (
      $size ?? {
        range: [
          strtotime('-10 year').getTime(),
          strtotime('+10 year').getTime(),
        ],
      }
    ).range as number[];
    const time = makeRandom(range[0], range[1]);
    const date = new Date();
    date.setTime(time);
    return date;
  }
  public test(): boolean {
    return true;
  }
}

import { TMModifierFn } from '../types/mockit';
import { IPPFormat, IPPSize } from '../types/parser';
import { strRule } from '../data/config';
import {
  decodeTrans,
  makeRandom,
  dateformat,
  strtotime,
} from '../helpers/utils';
import Mockit from '../core/mockit';
const makeDate = (param: string | number): Date | never => {
  let date: Date;
  if (!isNaN(param as number)) {
    date = new Date(param as number);
  } else if (strRule.test(param as string)) {
    date = strtotime(RegExp.$2);
  } else {
    throw new Error(`invalid date:${param}`);
  }
  return date;
};
export default class ToDate extends Mockit<string | Date> {
  // set constructor name
  constructor() {
    super('ToDate');
  }
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
        const startdate: Date | never = makeDate(start);
        const enddate: Date | never = makeDate(end);
        const starttime = startdate.getTime();
        const endtime = enddate.getTime();
        if (endtime < starttime) {
          throw new Error(
            `the time range of start time ${start} is big than end time ${end}.`,
          );
        } else {
          return {
            range: [starttime, endtime],
          };
        }
      }
    });
    // $format rule
    this.addRule('$format', function ($format: IPPFormat) {
      if (!$format) {
        return {
          format: 'yyyy-mm-dd',
        };
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
  public generate(): Date {
    const { $size } = this.params;
    const range = (
      $size ?? {
        range: [
          strtotime('-10 year').getTime(),
          strtotime('+10 year').getTime(),
        ],
      }
    ).range as number[];
    const time = makeRandom(range[0], range[1]);
    return new Date(time);
  }
  public test(): boolean {
    return true;
  }
}

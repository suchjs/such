import { TMModifierFn } from '../types/mockit';
import { IPPFormat, IPPSize } from '../types/parser';
import { strRule } from '../data/config';
import { dateformat, strtotime } from '../helpers/dateformat';
import { decodeTrans, makeRandom } from '../helpers/utils';
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
  constructor(constructName: string) {
    super(constructName);
  }
  public init(): void {
    // range
    this.addRule('Size', function (Size: IPPSize) {
      if (!Size) {
        return;
      }
      const { range } = Size;
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
    // Format rule
    this.addRule('Format', function (Format: IPPFormat) {
      if (!Format) {
        return {
          format: 'yyyy-mm-dd',
        };
      }
      // nothing
      let { format } = Format;
      format = decodeTrans(format.slice(1));
      return {
        format,
      };
    });
    // modifier
    this.addModifier('Format', function (result: unknown, Format: IPPFormat) {
      const { format } = Format;
      return dateformat(format, result as Date);
    } as TMModifierFn<string>);
  }
  public generate(): Date {
    const { Size } = this.params;
    const range = (
      Size ?? {
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

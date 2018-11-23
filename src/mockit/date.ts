import { strRule } from '../config';
import { dateformat, strtotime } from '../helpers/dateformat';
import { decodeTrans, makeRandom } from '../helpers/utils';
import { ParamsCount, ParamsFormat } from '../types';
import Mockit, { ModifierFn } from './namespace';
const makeDate = (param: string | number): Date | never => {
  let date: Date;
  if(!isNaN(param as number)) {
    date = new Date(param as number);
  } else if(strRule.test(param as string)) {
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
  public init() {
    // range
    this.addRule('Count', function(Count: ParamsCount) {
      const { range } = Count;
      if(range.length !== 2) {
        throw new Error(`the time range should supply 2 arguments,but got ${range.length}`);
      } else {
        const [ start, end ] = range;
        const startdate: Date | never = makeDate(start);
        const enddate: Date | never = makeDate(end);
        const starttime = startdate.getTime();
        const endtime = enddate.getTime();
        if(endtime < starttime) {
          throw new Error(`the time range of start time ${start} is big than end time ${end}.`);
        } else {
          return {
            range: [starttime, endtime],
          };
        }
      }
    });
    // Format rule
    this.addRule('Format', function(Format: ParamsFormat) {
      // nothing
      let { format } = Format;
      format = decodeTrans(format.slice(1));
      return {
        format,
      };
    });
    // modifier
    this.addModifier('Format', (function(result: any, Format: ParamsFormat) {
      const { format } = Format;
      return dateformat(format, result as Date);
    })  as ModifierFn<string>);
  }
  public generate() {
    const { Count } = this.params;
    const { range } = Count;
    const time = makeRandom(range[0], range[1]);
    return new Date(time);
  }
  public test() {
    return true;
  }
}

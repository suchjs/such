// mockit
import number from './mockit/number';
import string from './mockit/string';
import regexp from './mockit/regexp';
import date from './mockit/date';
import ref from './mockit/ref';
import id from './mockit/id';
//
export class BaseMockit extends Mockit {
  test(): boolean {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  generate(..._args: any): any {
    // just wait for implement
  }
  init(): void {
    // just wait for implement
  }
}
import Mockit from './mockit/namespace';
export type TMockitList = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [index: string]: new (...args: any) => Mockit;
};
export const mockitList: TMockitList = {
  number,
  string,
  regexp,
  date,
  ref,
  id,
};

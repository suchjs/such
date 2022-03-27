import { TSuchInject } from '../types/instance';
import { IPPPath, IPPPathItem } from '../types/parser';
import { getRefMocker } from '../helpers/utils';
import { Mocker } from '../core/such';
import Mockit from '../core/mockit';
import { TMAttrs } from '../types/mockit';
export default class ToRef extends Mockit<unknown> {
  // set constructor name
  public static readonly constrName: string = 'ToRef';
  // allowed data attribute
  public static readonly allowAttrs: TMAttrs = [];
  // init
  public init(): void {
    // path
    this.addRule('$path', function ($path: IPPPath) {
      if (!$path) {
        throw new Error(`the ref type must has a path param.`);
      }
    });
  }
  /**
   * get a ref value
   * @param options [TSuchReject]
   * @returns [unkown]
   */
  public generate(options: TSuchInject): unknown {
    const { mocker } = options;
    const { $path } = this.params;
    const result: unknown[] = [];
    if (mocker) {
      // only mocker
      $path.map((item: IPPPathItem) => {
        let refMocker = getRefMocker(item, mocker as Mocker);
        if (refMocker) {
          while (refMocker) {
            result.push(refMocker.result);
            refMocker = refMocker.next;
          }
        } else {
          throw new Error(
            `The ':ref' type's reference path "${item.fullpath}" is not found in the data paths.`,
          );
        }
      });
    } else {
      throw new Error(
        `The ':ref' data type need a mocker object or a template object in a template literal.`,
      );
    }
    return $path.length === 1 && result.length === 1 ? result[0] : result;
  }
  public test(): boolean {
    return true;
  }
}

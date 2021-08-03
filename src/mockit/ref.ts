import { TSuchInject } from '../types/instance';
import { IPPPath, IPPPathItem } from '../types/parser';
import { getRefMocker, isArray } from '../helpers/utils';
import { Mocker } from '../core/such';
import Mockit from '../core/mockit';
import { tmplRefRule } from '../data/config';
export default class ToRef extends Mockit<unknown> {
  // set constructor name
  constructor(public readonly constrName: string = 'ToRef') {
    super(constrName);
  }
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
    const { mocker, template } = options;
    const { $path } = this.params;
    const result: unknown[] = [];
    if (template) {
      // template literal
      if (mocker) {
        $path.map((item: IPPPathItem) => {
          let finded = false;
          let isTmplRef = false;
          if ((isTmplRef = tmplRefRule.test(item.fullpath))) {
            const index = RegExp.$1;
            const data = template.getRefValue(index);
            if (data) {
              if (isArray(data)) {
                data.map((item) => {
                  result.push(item.result);
                });
              } else {
                result.push(data.result);
              }
              finded = true;
            }
          }
          if (!finded) {
            const refMocker = getRefMocker(item, mocker as Mocker);
            if (refMocker) {
              result.push(refMocker.result);
              finded = true;
            }
          }
          if (!finded) {
            throw new Error(
              `The ':ref' type's reference path "${
                item.fullpath
              }" in template literal can't be found ${
                isTmplRef ? 'neithor in the inner template nor ' : ''
              }in the data paths.`,
            );
          }
        });
      } else {
        // just call Such.template
        $path.map((item: IPPPathItem) => {
          if (tmplRefRule.test(item.fullpath)) {
            const index = RegExp.$1;
            const data = template.getRefValue(index);
            if (data) {
              // check if array data when the index is a name
              if (isArray(data)) {
                data.map((item) => {
                  result.push(item.result);
                });
              } else {
                result.push(data.result);
              }
            } else {
              throw new Error(
                `The ':ref' type's reference path "${item.fullpath}" in template literal is not found.`,
              );
            }
          }
        });
      }
    } else if (mocker) {
      // only mocker
      $path.map((item: IPPPathItem) => {
        const refMocker = getRefMocker(item, mocker as Mocker);
        if (refMocker) {
          result.push(refMocker.result);
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

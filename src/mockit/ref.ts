import { TSuchInject } from '../types/instance';
import { IPPPath, IPPPathItem } from '../types/parser';
import { getRefMocker, withPromise } from '../helpers/utils';
import { Mocker } from '../core/such';
import Mockit from '../core/mockit';
export default class ToRef extends Mockit<unknown> {
  constructor(constructName: string) {
    super(constructName);
  }
  public init(): void {
    // path
    this.addRule('Path', function (Path: IPPPath) {
      if (!Path) {
        throw new Error(`the ref type must has a path param.`);
      }
    });
  }
  public generate(options: TSuchInject): unknown {
    const { mocker } = options;
    const { Path } = this.params;
    const result: unknown[] = [];
    Path.map((item: IPPPathItem) => {
      const refMocker = getRefMocker(item, mocker as Mocker);
      result.push(refMocker.result);
    });
    return Path.length === 1 ? result[0] : withPromise(result);
  }
  public test(): boolean {
    return true;
  }
}

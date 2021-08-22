import { IPPPath } from '../../types/parser';
import { makeCascaderData } from '../../helpers/utils';
import { TSuchInject } from '../../types/instance';
import Mockit from '../../core/mockit';
import { TStrList } from '../../types/common';
import { TMAttrs, TMParams } from '../../types/mockit';

const configOptions = {
  root: {
    type: Boolean,
    default: false,
  },
  handle: {
    type: Function,
  },
  data: {
    type: Object,
  },
};
export default class ToCascader extends Mockit<unknown> {
  // set constructor name
  public static readonly constrName: string = 'ToCascader';
  // config options
  public static configOptions = configOptions;
  public static selfConfigOptions = configOptions;
  // allowed data attribute
  public static readonly allowAttrs: TMAttrs = [];
  // validate all params
  public static validator = (params: TMParams): void | never => {
    const { $config, $path } = params;
    if ($config.root) {
      // in browser
      if ($path) {
        throw new Error(
          `the data type 'cascader' doesn't need a path when it's a root node`,
        );
      }
      if (!$config.data) {
        throw new Error(
          `the data type 'cascader' must set a 'data' configuration in a root node`,
        );
      }
    } else {
      const pathNum = $path.length;
      if (pathNum === 0) {
        throw new Error(
          `the data type 'cascader' need a reference path to the root node`,
        );
      } else if (pathNum > 1) {
        throw new Error(
          `the data type 'cascader' should only use one reference`,
        );
      }
    }
  };
  // init
  public init(): void {
    // allow $path parse
    this.addRule('$path', ($path: IPPPath) => {
      if ($path && $path.length !== 1) {
        throw new Error('the cascader type must have an only path or ref.');
      }
    });
  }
  /**
   * generate a cascader value
   * @param options [TSuchReject]
   * @returns [unkown]
   */
  generate(options: TSuchInject): unknown | never {
    const { mocker } = options;
    const { handle, values, $config } = makeCascaderData(this.params, mocker);
    return handle($config.data, values as TStrList);
  }
  // set test
  public test(): boolean {
    return true;
  }
}

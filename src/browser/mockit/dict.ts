import { TMultiStr, TStrList } from '../../types/common';
import { IPPConfig } from '../../types/parser';
import { isArray, makeDictData } from '../../helpers/utils';
import Mockit from '../../core/mockit';

export default class ToDict extends Mockit<TMultiStr> {
  // set constructor name
  constructor(public readonly constrName: string = 'ToDict') {
    super(constrName);
  }
  /**
   * init
   */
  public init(): void {
    this.configOptions = {
      data: {
        type: Array,
      },
    };
    // in browser, get data from config
    this.addRule('$config', function ($config: IPPConfig) {
      if (!$config || !$config['data']) {
        throw new Error(
          "the data type 'dict' must supply a 'data' field of 'data attribute' configuration, no configuration was set",
        );
      }
      if (!isArray($config['data'])) {
        throw new Error(
          "the data type 'dict' has a none array 'data' field in configuration 'data attribute'",
        );
      }
    });
  }
  /**
   *
   * @returns [TMultiStr] return items of the dict
   */
  public generate(): TMultiStr {
    const queues: TStrList[] = [];
    const { $config } = this.params;
    const { data } = $config;
    queues.push(data as TStrList);
    const makeAll = makeDictData(this.params);
    return makeAll(queues);
  }
  // test
  public test(): boolean {
    return true;
  }
}

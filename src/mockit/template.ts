import { makeRandom } from '../helpers/utils';
import Mockit from '../core/mockit';
import { Template } from '../core/such';
import { TSuchInject } from '../types/instance';
/**
 * mock a string
 * @export
 * @class ToTemplate
 * @extends {Mockit<string>}
 */
export default class ToTemplate extends Mockit<string> {
  // private $template: Template;
  private $template: Template;
  // set constructor name
  constructor(public readonly constrName: string = 'ToTemplate') {
    super(constrName);
  }
  // set template object
  public setTemplate($template: Template): void {
    this.$template = $template;
  }
  // init
  public init(): void {
    // set allow data attributes
    this.setAllowAttrs('$length');
  }
  // generate
  public generate(options: TSuchInject): string {
    const { $template } = this;
    const params = this.params;
    const { $length } = params;
    const result = $template.value(options);
    if ($length) {
      const least = Number($length.least);
      const most = Number($length.most);
      const total = makeRandom(least, most);
      if (total > 1) {
        return result.repeat(total);
      }
    }
    return result;
  }
  // test
  public test(): boolean {
    return true;
  }
}

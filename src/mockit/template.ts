import { makeRandom } from '../helpers/utils';
import Mockit from '../core/mockit';
import { Template } from '../core/such';
import { TSuchInject } from '../types/instance';
import { TMAttrs } from '../types/mockit';
/**
 * mock a string
 * @export
 * @class ToTemplate
 * @extends {Mockit<string>}
 */
export default class ToTemplate extends Mockit<string> {
  // protected $template: Template;
  protected $template: Template;
  // set constructor name
  public static readonly constrName: string = 'ToTemplate';
  // allowed data attribute
  public static readonly allowAttrs: TMAttrs = [];
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
    let { $length } = params;
    const result = $template.value(options);
    if ($length) {
      $length = Object.assign({}, $length, options.param?.$length);
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

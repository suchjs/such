import { TSuchInject } from '../types/instance';
import Mockit from '../core/mockit';
export default class ToRef extends Mockit<unknown> {
    constructor(constructName: string);
    init(): void;
    generate(options: TSuchInject): unknown;
    test(): boolean;
}

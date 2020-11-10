import { TSuchInject } from '../types/instance';
import Mockit from '../core/mockit';
export default class ToId extends Mockit<number> {
    constructor(constructName: string);
    init(): void;
    generate(options: TSuchInject): number;
    test(): boolean;
}

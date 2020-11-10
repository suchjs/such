import Mockit from '../core/mockit';
export default class ToNumber extends Mockit<number> {
    constructor(constructName: string);
    init(): void;
    generate(): number;
    test(): boolean;
}

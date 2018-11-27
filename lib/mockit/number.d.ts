import Mockit from './namespace';
export default class ToNumber extends Mockit<number> {
    constructor(constructName: string);
    init(): void;
    generate(): number;
    test(): boolean;
}

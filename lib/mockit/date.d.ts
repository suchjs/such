import Mockit from '../core/mockit';
export default class ToDate extends Mockit<string | Date> {
    constructor(constructName: string);
    init(): void;
    generate(): Date;
    test(): boolean;
}

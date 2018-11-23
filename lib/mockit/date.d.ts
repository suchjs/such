import Mockit from './namespace';
export default class ToDate extends Mockit<string | Date> {
    constructor(constructName: string);
    init(): void;
    generate(): Date;
    test(): boolean;
}

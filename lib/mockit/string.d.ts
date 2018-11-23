import Mockit from './namespace';
export default class ToString extends Mockit<string> {
    constructor(constructName: string);
    init(): void;
    generate(): string;
    test(): boolean;
}

import Mockit from '../core/mockit';
export default class ToString extends Mockit<string> {
    constructor(constructName: string);
    init(): void;
    generate(): string;
    test(): boolean;
}

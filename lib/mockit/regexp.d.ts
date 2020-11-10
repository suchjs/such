import Mockit from '../core/mockit';
export default class ToRegexp extends Mockit<string> {
    private instance;
    constructor(constructName: string);
    init(): void;
    generate(): string;
    test(): boolean;
}

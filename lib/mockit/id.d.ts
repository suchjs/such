import { SuchOptions } from '../types';
import Mockit from './namespace';
export default class ToId extends Mockit<number> {
    constructor(constructName: string);
    init(): void;
    generate(options: SuchOptions): any;
    test(): boolean;
}

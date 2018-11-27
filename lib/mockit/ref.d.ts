import { SuchOptions } from '../types';
import Mockit from './namespace';
export default class ToRef extends Mockit<any> {
    constructor(constructName: string);
    init(): void;
    generate(options: SuchOptions): any;
    test(): boolean;
}

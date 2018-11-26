import PathMap, { Path } from '../helpers/pathmap';
import Mockit from './namespace';
export default class ToNumber extends Mockit<number> {
    constructor(constructName: string);
    init(): void;
    generate(datas: PathMap<any>, dpath: Path): number;
    test(): boolean;
}

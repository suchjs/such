import PathMap, { Path } from '../helpers/pathmap';
import Mockit from './namespace';
export default class ToId extends Mockit<number> {
    constructor(constructName: string);
    init(): void;
    generate(datas: PathMap<any>, dpath: Path): any;
    test(): boolean;
}
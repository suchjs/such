import PathMap, { Path } from '../helpers/pathmap';
import Mockit from './namespace';
export default class ToDate extends Mockit<string | Date> {
    constructor(constructName: string);
    init(): void;
    generate(datas: PathMap<any>, dpath: Path): Date;
    test(): boolean;
}

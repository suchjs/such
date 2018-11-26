import PathMap, { Path } from '../helpers/pathmap';
import Mockit from './namespace';
export default class ToString extends Mockit<string> {
    constructor(constructName: string);
    init(): void;
    generate(datas: PathMap<any>, dpath: Path): string;
    test(): boolean;
}

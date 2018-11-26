import PathMap, { Path } from '../helpers/pathmap';
import Mockit from './namespace';
export default class ToRegexp extends Mockit<string> {
    private instance;
    constructor(constructName: string);
    init(): void;
    generate(datas: PathMap<any>, dpath: Path): string;
    test(): boolean;
}

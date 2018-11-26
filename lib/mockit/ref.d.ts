import PathMap, { Path as DPath } from '../helpers/pathmap';
import Mockit from './namespace';
export default class ToRef extends Mockit<any> {
    constructor(constructName: string);
    init(): void;
    generate(datas: PathMap<any>, dpath: DPath): any;
    test(): boolean;
}

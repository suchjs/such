import { TStrList } from '../../types/common';
declare type TMultiStr = string | TStrList;
declare const _default: {
    init(): void;
    generate(): TMultiStr | Promise<TMultiStr>;
};
export default _default;

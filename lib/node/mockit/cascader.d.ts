import { SuchOptions } from '../../types';
declare const _default: {
    configOptions: {
        root: {
            type: BooleanConstructor;
            default: boolean;
        };
        handle: {
            type: FunctionConstructor;
        };
    };
    init(): void;
    generate(options: SuchOptions): any;
};
export default _default;

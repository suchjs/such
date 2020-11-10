import { TStrList } from '../../types/common';
import { TSuchInject } from '../../types/instance';
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
    generate(options: TSuchInject): TStrList | Promise<TStrList>;
};
export default _default;

declare const _default: {
    configOptions: {
        count: {
            type: NumberConstructor;
            validator(target: any): boolean;
            default: number;
        };
    };
    init(): void;
    generate(): string | string[] | Promise<string | string[]>;
};
export default _default;

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parser = {
    config: {
        startTag: ['%'],
        endTag: [],
    },
    parse: function () {
        var params = this.info().params;
        if (params.length !== 1) {
            return this.halt("wrong format param:" + params.join(''));
        }
        return {
            format: params[0],
        };
    },
};
exports.default = parser;
//# sourceMappingURL=format.js.map
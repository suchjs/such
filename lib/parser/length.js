"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parser = {
    config: {
        startTag: ['{'],
        endTag: ['}'],
        separator: ',',
    },
    parse: function () {
        var params = this.info().params;
        if (params.length > 2) {
            return this.halt('The length should not have more than 2 params');
        }
        return {
            least: params[0],
            most: params[params.length - 1],
        };
    },
};
exports.default = parser;
//# sourceMappingURL=length.js.map
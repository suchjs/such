"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parser = {
    config: {
        startTag: ['['],
        endTag: [']'],
        separator: ',',
    },
    parse: function () {
        var params = this.info().params;
        return {
            range: params,
        };
    },
};
exports.default = parser;
//# sourceMappingURL=size.js.map
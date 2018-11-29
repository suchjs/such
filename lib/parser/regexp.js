"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var reregexp_1 = require("reregexp");
var parser = {
    config: {
        startTag: ['/'],
        endTag: [],
        rule: reregexp_1.parserRule,
    },
    parse: function () {
        var params = this.info().params;
        if (params.length !== 1) {
            return this.halt("invalid regexp rule:" + params.join(''));
        }
        return {
            rule: params[0],
        };
    },
};
exports.default = parser;
//# sourceMappingURL=regexp.js.map
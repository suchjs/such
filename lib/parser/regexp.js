"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var regexp_1 = require("../helpers/regexp");
var parser = {
    config: {
        startTag: ['/'],
        endTag: [],
        rule: regexp_1.parserRule,
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
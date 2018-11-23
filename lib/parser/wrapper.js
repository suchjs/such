"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parser = {
    config: {
        startTag: ['<'],
        endTag: ['>'],
        separator: ',',
    },
    parse: function () {
        var params = this.info().params;
        if (params.length !== 2) {
            return this.showError('');
        }
        return {
            prefix: params[0],
            suffix: params[1],
        };
    },
};
exports.default = parser;
//# sourceMappingURL=wrapper.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var parser = {
    config: {
        startTag: ['{'],
        endTag: ['}'],
        separator: ',',
    },
    parse: function () {
        var _this = this;
        var params = this.info().params;
        if (params.length > 2) {
            return this.halt('the length should not have more than 2 params');
        }
        var least = params[0];
        var most = params[params.length - 1];
        var result = { least: least, most: most };
        var valid = function (key) {
            var value = result[key];
            if (isNaN(Number(value)) ||
                !/^(?:[1-9]+\d*|0)$/.test(value) ||
                +value < 0) {
                return _this.halt("the length param of " + key + " expect a integer number greater than or equal to 0,but got \"" + value + "\"");
            }
        };
        valid('least');
        if (params.length === 2) {
            valid('most');
            if (Number(least) >= Number(most)) {
                throw new Error("the length param of least \"" + least + "\" is greater than or equal to the most \"" + most + "\"");
            }
        }
        return {
            least: Number(least),
            most: Number(most),
        };
    },
};
exports.default = parser;
//# sourceMappingURL=length.js.map
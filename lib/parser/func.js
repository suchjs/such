"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("../config");
var utils_1 = require("../helpers/utils");
var parser = {
    config: {
        startTag: ['@'],
        endTag: [],
        separator: '|',
        pattern: /^([a-z][\w$]*)(?:\(((?:(?:(['"])(?:(?!\3)[^\\]|\\.)*\3|[\w$]+)\s*(?:,(?!\s*\))|(?=\s*\)))\s*)*)\)|)/,
        rule: new RegExp("^@(?:[a-z][\\w$]*(?:\\((?:(?:(['\"])(?:(?!\\1)[^\\\\]|\\\\.)*\\1|[\\w$]+)\\s*(?:,(?!\\s*\\))|(?=\\s*\\)))\\s*)*\\)|)(?:\\|(?!$|" + config_1.encodeSplitor + ")|(?=\\s*$|" + config_1.encodeSplitor + ")))*"),
    },
    parse: function () {
        var _a = this.info(), patterns = _a.patterns, code = _a.code;
        if (!patterns.length) {
            this.halt("no modify functions find in \"" + code + "\"");
        }
        else {
            var rule_1 = /(['"])((?:(?!\1)[^\\]|\\.)*)\1|([\w$]+)/g;
            var result_1 = [];
            var nativeValues_1 = ['true', 'false', 'undefined', 'null'];
            patterns.forEach(function (match) {
                var _ = match[0], name = match[1], args = match[2];
                var params = [];
                if (args) {
                    var segs = null;
                    while ((segs = rule_1.exec(args)) !== null) {
                        var plainValue = segs[3];
                        var param = {};
                        if (plainValue) {
                            if (nativeValues_1.indexOf(plainValue) > -1 || !isNaN(plainValue)) {
                                param.value = utils_1.getExp(plainValue);
                            }
                            else {
                                param.value = plainValue;
                                param.variable = true;
                            }
                        }
                        else {
                            param.value = segs[2];
                        }
                        params.push(param);
                    }
                }
                result_1.push({
                    name: name,
                    params: params,
                });
            });
            return result_1;
        }
    },
};
exports.default = parser;
//# sourceMappingURL=func.js.map
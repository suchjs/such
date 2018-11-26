"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var regexp_1 = require("../helpers/regexp");
var utils_1 = require("../helpers/utils");
var parser = {
    config: {
        startTag: ['#['],
        endTag: [']'],
        separator: ',',
    },
    parse: function () {
        var params = this.info().params;
        var config = {};
        if (params.length) {
            var rule = /^\s*([$\w]+)\s*(?:=\s*(?:(['"])((?:(?!\2)[^\\]|\\.)*)\2|(.+))\s*)?$/;
            var nativeValues = ['true', 'false', 'null', 'undefined'];
            for (var i = 0, j = params.length; i < j; i++) {
                var param = params[i];
                if (rule.test(param)) {
                    var key = RegExp.$1, strValue = RegExp.$3, plainValue = RegExp.$4;
                    if (config.hasOwnProperty(key)) {
                        throw new Error("the config of \"" + key + "\" has exists,do not define again.");
                    }
                    if (strValue) {
                        config[key] = utils_1.decodeTrans(strValue);
                    }
                    else if (plainValue) {
                        var value = plainValue;
                        if (value.charAt(0) === '/') {
                            if (regexp_1.regexpRule.test(value)) {
                                config[key] = utils_1.getExp(value);
                            }
                            else {
                                this.halt("wrong regexp:" + value);
                            }
                        }
                        else if (!isNaN(Number(value))) {
                            config[key] = Number(value);
                        }
                        else if (nativeValues.indexOf(value) > -1) {
                            config[key] = utils_1.getExp(value);
                        }
                        else {
                            this.halt("wrong param:" + param);
                        }
                    }
                    else {
                        config[key] = true;
                    }
                }
                else {
                    this.halt("the config params of index " + i + " \"" + param + "\" is wrong,please check it.");
                }
            }
        }
        return config;
    },
    setting: {
        frozen: false,
    },
};
exports.default = parser;
//# sourceMappingURL=config.js.map
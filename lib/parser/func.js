"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("../data/config");
var utils_1 = require("../helpers/utils");
var store_1 = require("../data/store");
var globalFns = store_1.default.fns;
var parseFuncParams = function (options) {
    var name = options.name, params = options.params;
    var isUserDefined = globalFns.hasOwnProperty(name);
    var confName = '__CONFIG__';
    var varName = '__VARS__';
    var argName = '__ARGS__';
    var resName = '__RESULT__';
    var expName = '__EXP__';
    var fnName = isUserDefined ? '__FN__' : resName + "." + name;
    var useFnParam = isUserDefined ? [fnName] : [];
    var lastParams = isUserDefined ? [resName] : [];
    var paramValues = [];
    var index = 0;
    params.forEach(function (param) {
        var value = param.value, variable = param.variable;
        if (variable) {
            var isObjChain = typeof value === 'string'
                ? value.includes('.') || value.includes('[')
                : false;
            lastParams.push(isObjChain
                ? expName + "(" + confName + ",\"" + value + "\")"
                : confName + ".hasOwnProperty(\"" + value + "\") ? " + confName + "[\"" + value + "\"] : " + varName + "[\"" + value + "\"]");
        }
        else {
            paramValues.push(value);
            lastParams.push(argName + "[" + index++ + "]");
        }
    });
    return {
        fn: new Function(useFnParam.concat(argName, varName, resName, confName, expName).join(','), isUserDefined
            ? "return " + fnName + ".apply(this,[" + lastParams.join(',') + "]);"
            : "return " + fnName + "(" + lastParams.join(',') + ")"),
        param: paramValues,
    };
};
var parser = {
    config: {
        startTag: ['@'],
        endTag: [],
        separator: '|',
        pattern: /^([a-z][\w$]*)(?:\(((?:(?:(['"])(?:(?!\3)[^\\]|\\.)*\3|[\w$]+(?:\.[\w$]+|\[(?:(['"])(?:(?!\4)[^\\]|\\.)*\4|\d+)\])*)\s*(?:,(?!\s*\))|(?=\s*\)))\s*)*)\)|)/,
        rule: new RegExp("^@(?:[a-z][\\w$]*(?:\\((?:(?:(['\"])(?:(?!\\1)[^\\\\]|\\\\.)*\\1|[\\w$]+(?:\\.[\\w$]+|\\[(?:(['\"])(?:(?!\\2)[^\\\\]|\\.)*\\2|\\d+)\\])*)\\s*(?:,(?!\\s*\\))|(?=\\s*\\)))\\s*)*\\)|)(?:\\|(?!$|" + config_1.encodeSplitor + ")|(?=\\s*$|" + config_1.encodeSplitor + ")))*"),
    },
    parse: function () {
        var _a = this.info(), patterns = _a.patterns, code = _a.code;
        var result = {
            queue: [],
            fns: [],
            params: [],
            options: [],
        };
        if (!patterns.length) {
            this.halt("no modify functions find in \"" + code + "\"");
        }
        else {
            var rule_1 = /(['"])((?:(?!\1)[^\\]|\\.)*)\1|([\w$]+(?:\.[\w$]+|\[(?:(['"])(?:(?!\4)[^\\]|\\.)*\4|\d+)\])*)/g;
            var nativeValues_1 = ['true', 'false', 'undefined', 'null', 'NaN'];
            patterns.forEach(function (match) {
                var name = match[1], args = match[2];
                var params = [];
                if (args) {
                    var segs = null;
                    while ((segs = rule_1.exec(args)) !== null) {
                        var plainValue = segs[3];
                        var cur = {};
                        if (plainValue) {
                            if (nativeValues_1.indexOf(plainValue) > -1 ||
                                !isNaN(Number(plainValue))) {
                                cur.value = utils_1.getExp(plainValue);
                            }
                            else {
                                cur.value = plainValue;
                                cur.variable = true;
                            }
                        }
                        else {
                            cur.value = segs[2];
                        }
                        params.push(cur);
                    }
                }
                result.queue.push(name);
                var options = {
                    name: name,
                    params: params,
                };
                result.options.push(options);
                var _a = parseFuncParams(options), fn = _a.fn, param = _a.param;
                result.fns.push(fn);
                result.params.push(param);
            });
            return result;
        }
    },
};
exports.default = parser;
//# sourceMappingURL=func.js.map
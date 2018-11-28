"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var regexp_1 = require("../helpers/regexp");
var namespace_1 = require("./namespace");
var ToRegexp = (function (_super) {
    __extends(ToRegexp, _super);
    function ToRegexp(constructName) {
        return _super.call(this, constructName) || this;
    }
    ToRegexp.prototype.init = function () {
        this.addRule('Regexp', function (Regexp) {
            if (!Regexp) {
                throw new Error("the regexp type must has a regexp rule.");
            }
            var rule = Regexp.rule;
            if (!regexp_1.regexpRule.test(rule)) {
                throw new Error('wrong regexp expression');
            }
        });
        this.addRule('Config', function (Config) {
            if (!Config) {
                return;
            }
            var result = {};
            var rule = /(.?)\|/g;
            Object.keys(Config).forEach(function (key) {
                var value = Config[key];
                if (typeof value === 'string') {
                    var match = void 0;
                    var segs = [];
                    var groups = [];
                    var lastIndex = 0;
                    while ((match = rule.exec(value)) !== null) {
                        if (match[1] === '\\') {
                            segs.push(value.slice(lastIndex, rule.lastIndex));
                        }
                        else {
                            groups.push(segs.join('') + value.slice(lastIndex, rule.lastIndex - 1));
                            segs = [];
                        }
                        lastIndex = rule.lastIndex;
                    }
                    if (lastIndex < value.length) {
                        groups.push(value.slice(lastIndex, value.length));
                    }
                    result[key] = groups;
                }
                else {
                    result[key] = value;
                }
            });
            return result;
        });
    };
    ToRegexp.prototype.generate = function () {
        var instance = this.instance;
        var _a = this.params, Config = _a.Config, Regexp = _a.Regexp;
        if (!instance) {
            instance = this.instance = new regexp_1.default(Regexp.rule, {
                namedGroupConf: Config || {},
            });
        }
        return instance.build();
    };
    ToRegexp.prototype.test = function () {
        return true;
    };
    return ToRegexp;
}(namespace_1.default));
exports.default = ToRegexp;
//# sourceMappingURL=regexp.js.map
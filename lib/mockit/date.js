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
var config_1 = require("../config");
var dateformat_1 = require("../helpers/dateformat");
var utils_1 = require("../helpers/utils");
var namespace_1 = require("./namespace");
var makeDate = function (param) {
    var date;
    if (!isNaN(param)) {
        date = new Date(param);
    }
    else if (config_1.strRule.test(param)) {
        date = dateformat_1.strtotime(RegExp.$2);
    }
    else {
        throw new Error("invalid date:" + param);
    }
    return date;
};
var ToDate = (function (_super) {
    __extends(ToDate, _super);
    function ToDate(constructName) {
        return _super.call(this, constructName) || this;
    }
    ToDate.prototype.init = function () {
        this.addRule('Count', function (Count) {
            if (!Count) {
                return;
            }
            var range = Count.range;
            if (range.length !== 2) {
                throw new Error("the time range should supply 2 arguments,but got " + range.length);
            }
            else {
                var start = range[0], end = range[1];
                var startdate = makeDate(start);
                var enddate = makeDate(end);
                var starttime = startdate.getTime();
                var endtime = enddate.getTime();
                if (endtime < starttime) {
                    throw new Error("the time range of start time " + start + " is big than end time " + end + ".");
                }
                else {
                    return {
                        range: [starttime, endtime],
                    };
                }
            }
        });
        this.addRule('Format', function (Format) {
            if (!Format) {
                return {
                    format: 'yyyy-mm-dd',
                };
            }
            var format = Format.format;
            format = utils_1.decodeTrans(format.slice(1));
            return {
                format: format,
            };
        });
        this.addModifier('Format', (function (result, Format) {
            var format = Format.format;
            return dateformat_1.dateformat(format, result);
        }));
    };
    ToDate.prototype.generate = function () {
        var Count = this.params.Count;
        var range = Count.range;
        var time = utils_1.makeRandom(range[0], range[1]);
        return new Date(time);
    };
    ToDate.prototype.test = function () {
        return true;
    };
    return ToDate;
}(namespace_1.default));
exports.default = ToDate;
//# sourceMappingURL=date.js.map
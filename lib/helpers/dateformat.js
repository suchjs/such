"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var fixDate = function (date) {
    if (typeof date === 'undefined') {
        return new Date();
    }
    if (date instanceof Date) {
        return date;
    }
    return new Date(date);
};
var makeDate = function (year, month, day) {
    var localDate = new Date();
    var fullYear = localDate.getFullYear().toString();
    year = year || fullYear;
    month = month || (localDate.getMonth() + 1).toString();
    day = day || localDate.getDate().toString();
    year = (year.length < 4 ? fullYear.slice(0, fullYear.length - year.length) : '') + year;
    var strDate = [year, month, day].join('/') + ' 00:00:00';
    return new Date(strDate);
};
var strToDate = function (dateStr, baseDate) {
    var mS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    var mL = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    var r1 = /^(\d{4})([-\/.])(\d{1,2})\2(\d{1,2})$/;
    var r2 = /^(today|yesterday|tomorrow)$/;
    var r3 = /^(\d{4})(\d{1,2})(\d{1,2})$/;
    var r4 = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{2}|\d{4})?)$/;
    var r5 = new RegExp('^(' + mS.concat(mL).join('|') + ')(?:\\s+|\\.)(?:(([13]?1)(?:st)?|([12]?2)(?:nd)?|([12]?3)(?:rd)?|([12]0|[12]?[4-9])(?:th)?|(30)th))(?:\\s*,\\s*(\\d{2}|\\d{4}))?$');
    var r6 = /^(([+-]?\d+)\s+(day|month|week|year)s?(\s+(?!$)|))+?(\s+ago)?$/;
    var r6e = /([+-]?\d+)\s+(day|month|week|year)s?/g;
    var match;
    var localDate = new Date();
    dateStr = dateStr.toLowerCase();
    if (dateStr === '') {
        localDate.setHours(0, 0, 0, 0);
        return localDate;
    }
    else if (match = dateStr.match(r1)) {
        return makeDate(match[1], match[3], match[4]);
    }
    else if (match = dateStr.match(r2)) {
        var addNum = {
            today: 0,
            tomorrow: 1,
            yesterday: -1,
        };
        var key = match[1];
        if (baseDate) {
            baseDate = fixDate(baseDate);
            if (addNum[key]) {
                baseDate.setDate(baseDate.getDate() + addNum[key]);
            }
            baseDate.setHours(0, 0, 0, 0);
            return baseDate;
        }
        else {
            if (addNum[key]) {
                return makeDate(null, null, (localDate.getDate() + addNum[key]).toString());
            }
            return makeDate(null, null, null);
        }
    }
    else if (match = dateStr.match(r3)) {
        return makeDate.apply(null, match.slice(1, 4));
    }
    else if (match = dateStr.match(r4)) {
        return makeDate(match[4], match[1], match[2]);
    }
    else if (match = dateStr.match(r5)) {
        var month = match[1];
        var day = match[3];
        var year = match[8];
        var atMS = mS.indexOf(month);
        var atML = mL.indexOf(month);
        if (atMS > -1) {
            month = (atMS + 1).toString();
        }
        else {
            month = (atML + 1).toString();
        }
        return makeDate(year, month, day);
    }
    else if (match = dateStr.match(r6)) {
        var needReverse_1 = match[5] ? '-' : '';
        var group = void 0;
        var info_1 = {
            year: [],
            month: [],
            day: [],
            week: [],
        };
        var result_1 = {
            year: 0,
            month: 0,
            day: 0,
            week: 0,
            date: 0,
            fullYear: 0,
        };
        while ((group = r6e.exec(dateStr)) !== undefined) {
            var type = group[2];
            var num = group[1];
            info_1[type].push('(' + num + ')');
        }
        Object.keys(info_1).map(function (key) {
            var arr = info_1[key];
            if (arr.length) {
                result_1[key] = new Function('', 'return ' + needReverse_1 + '(' + arr.join('+') + ')')();
            }
            else {
                result_1[key] = 0;
            }
        });
        result_1.date = result_1.week * 7 + result_1.day;
        result_1.fullYear = result_1.year;
        var setFnQueues = ['date', 'month', 'fullYear'];
        var lastDate = fixDate(baseDate);
        for (var i = 0, j = setFnQueues.length; i < j; i++) {
            var key = setFnQueues[i];
            var num = result_1[key];
            var method = utils_1.capitalize(key);
            if (num) {
                var setFn = lastDate["set" + method];
                var getFn = lastDate["get" + method];
                var orig = getFn();
                try {
                    setFn.call(lastDate, orig + num);
                }
                catch (e) {
                    throw e;
                }
            }
        }
        return lastDate;
    }
    else {
        throw new Error('can not parse the date!');
    }
};
exports.strtotime = function (date) {
    if (!isNaN(date)) {
        return new Date(+date);
    }
    else if (typeof date === 'string') {
        var result = void 0;
        try {
            result = new Date(date);
        }
        catch (e) {
            try {
                result = strToDate(date);
            }
            catch (e) {
                throw e;
            }
        }
        return result;
    }
    else {
        throw new Error("invalid date:" + date);
    }
};
var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var formatter = {
    d: function () {
        return this.getDate();
    },
    dd: function () {
        return zerofill('d', this);
    },
    dddd: function () {
        return dayNames[this.getDay()];
    },
    ddd: function () {
        return formatter.dddd.call(this).slice(0, 3);
    },
    m: function () {
        return this.getMonth() + 1;
    },
    mm: function () {
        return zerofill('m', this);
    },
    mmmm: function () {
        return monthNames[this.getMonth()];
    },
    mmm: function () {
        return formatter.mmmm.call(this).slice(0, 3);
    },
    yyyy: function () {
        return this.getFullYear().toString().padStart(4, '0');
    },
    yy: function () {
        return this.getFullYear().toString().slice(-2).padStart(2, '0');
    },
    h: function () {
        return this.getHours() % 12;
    },
    hh: function () {
        return zerofill('h', this);
    },
    H: function () {
        return this.getHours();
    },
    HH: function () {
        return zerofill('H', this);
    },
    M: function () {
        return this.getMinutes();
    },
    MM: function () {
        return zerofill('M', this);
    },
    s: function () {
        return this.getSeconds();
    },
    ss: function () {
        return zerofill('s', this);
    },
    l: function () {
        return this.getMilliseconds().toString().padStart(3, '0');
    },
    L: function () {
        return Math.round(this.getMilliseconds() / 10).toString().padStart(2, '0');
    },
    tt: function () {
        return this.getHours() >= 12 ? 'pm' : 'am';
    },
    t: function () {
        return formatter.tt.call(this).charAt(0);
    },
    TT: function () {
        return this.getHours() >= 12 ? 'PM' : 'AM';
    },
    T: function () {
        return formatter.TT.call(this).charAt(0);
    },
    S: function () {
        return ['st', 'nd', 'rd'][this.getDate() % 10 - 1] || 'th';
    },
    N: function () {
        return this.getDay() || 7;
    },
};
var zerofill = function (fnName, date) {
    return formatter[fnName].call(date).toString().padStart(2, '0');
};
exports.dateformat = function (fmt, date) {
    return fmt.replace(/[A-Za-z]*/g, function (type) {
        if (formatter[type]) {
            return formatter[type].call(date);
        }
        return type;
    });
};
//# sourceMappingURL=dateformat.js.map
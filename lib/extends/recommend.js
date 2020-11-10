"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var confs = {
    types: {
        integer: ['number', '%d'],
        percent: ['number', '[0,100]:%d%'],
        chinese: ['string', '[\\u4E00,\\u9FA5]'],
        uppercase: ['string', '[65,90]'],
        lowercase: ['string', '[97,122]'],
        alphaNumericDash: ['string', '[48-57,97-122,65-90,95]'],
        url: [
            'regexp',
            '/(?<protocol>http|https|ftp|telnet|file):\\/\\/(?<domain>(?:[a-z0-9]+(?:-?[a-z0-9]+|[a-z0-9]*))\\.(?<ltd>com|cn|com\\.cn|org|net|gov\\.cn|wang|ren|xyz|top|cc|io))(?<port>(?::(?:6[0-5][0-5][0-3][0-5]|[1-5]\\d{4}|[1-9]\\d{0,3}))?)\\/(?<pathname>(?:[0-9a-z]+\\/)*(?<filename>\\w+(?<extname>\\.(?:html|htm|php|do)))?)(?<query>\\?([0-9a-z_]+=(?:[0-9a-z]+|(?:%[0-9A-F]{2}){2,})&)*([0-9a-z_]+=(?:[0-9a-z]+|(?:%[0-9A-F]{2}){2,})))(?<hash>#[0-9a-z_=]{5,})?/',
        ],
        email: [
            'regexp',
            '/(?<user>(?:[a-z0-9]+(?:[-_]?[a-z0-9]+|[a-z0-9]*)))@(?<domain>(?:[a-z0-9]+(?:-?[a-z0-9]+|[a-z0-9]*))\\.(?<ltd>com|cn|com\\.cn|org|net|gov\\.cn|wang|ren|xyz|top|cc|io))/',
        ],
        boolean: function (options) {
            var such = options.such;
            return such.utils.isOptional();
        },
        color$hex: function (options) {
            var such = options.such;
            return ('#' +
                such.utils.makeRandom(0x000000, 0xffffff).toString(16).toUpperCase());
        },
        color$rgb: function (options) {
            var such = options.such;
            var instance = such.instance(':int[0,255]');
            return ('rgb(' + [instance.a(), instance.a(), instance.a()].join(',') + ')');
        },
        color$rgba: function (options) {
            var such = options.such;
            var instance = such.instance(':int[0,255]');
            var opacity = such.as(':number[0,1]:%.2f');
            return ('rgba(' +
                [instance.a(), instance.a(), instance.a(), opacity || 0].join(',') +
                ')');
        },
        color$hsl: function (options) {
            var such = options.such;
            var highlight = such.as(':int[0,360]');
            var instance = such.instance(':percent');
            return 'hsl(' + [highlight, instance.a(), instance.a()].join(',') + ')';
        },
        color$hsla: function (options) {
            var such = options.such;
            var highlight = such.as(':int[0,360]');
            var instance = such.instance(':percent');
            var opacity = such.as(':number[0,1]:%.2f');
            return ('hsla(' +
                [highlight, instance.a(), instance.a(), opacity || 0].join(',') +
                ')');
        },
    },
    alias: {
        int: 'integer',
        bool: 'boolean',
    },
};
exports.default = confs;
//# sourceMappingURL=recommend.js.map
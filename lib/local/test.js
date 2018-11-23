"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var such_1 = require("../such");
such_1.default.define('text', 'string', '[\\u4f00,\\u4fff]');
such_1.default.define('url', 'regexp', '/https?::\\/\\/[a-z0-9]*[\-a-z0-9]?[a-z0-9]+\\.(?:com|cn|net|org)\\//');
such_1.default.define('image', 'regexp', '/https?::\\/\\/[a-z0-9]*[\-a-z0-9]?[a-z0-9]+\\.(?:com|cn|net|org)\\//');
console.log(such_1.default.as(':url'));
console.log(such_1.default.as(':url'));
var example = such_1.default.as({
    'title': '这是一个测试',
    'desc': 'suchjs是个描述性的模拟库',
    'tech{1,3}': [{
            'chinese': ':string[\\u4E00,\\u9FA5]:{10,20}',
            'uppercase': ':string[65,90]:{5,10}',
            'lowercase': ':string[97,122]:{10,20}',
            'numbers': ':string[48,57]:{8}',
            'underline': '_',
            'alphaNumericDash': ':string[48-57,97-122,65-90,95]:{15}',
            'optional?': '描述可有可无',
            'module?{2}': ['amd', 'cmd', 'umd'],
            'module1{3}': ['amd', 'cmd', 'umd'],
            'module2:{3}': ['amd', 'cmd', 'umd'],
        }],
}, {
    instance: true,
});
for (var i = 0, j = 2; i < j; i++) {
}
//# sourceMappingURL=test.js.map
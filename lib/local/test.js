"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var such_1 = require("../such");
such_1.default.define('boolean', {
    generate: function (datas, dpath) {
        return such_1.default.utils.isOptional();
    },
});
such_1.default.assign('haha', function (result) {
    console.log(this, result);
    return 333;
});
console.log(such_1.default.as({
    'a': ':number',
    'b': {
        c: 'ni好',
        h: ':string',
    },
    'd': ':ref&./a',
    'e': ':boolean',
    'f:{2,5}': [{ id: ':id#[start=1,step=3]' }],
    'g{5,8}': ['e', 'f', ':id'],
}));
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
for (var i = 0, j = 1; i < j; i++) {
}
//# sourceMappingURL=test.js.map
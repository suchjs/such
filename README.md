<h1 align="center">Suchjs</h1>

<div align="center">
  
  ![Suchjs Logo](./source/image/logo.png)

</div>
<div align="center">

[![npm version](https://badge.fury.io/js/suchjs.svg)](https://badge.fury.io/js/suchjs)&nbsp;&nbsp;[![Build Status](https://travis-ci.com/suchjs/such.svg?branch=master)](https://travis-ci.com/suchjs/such)&nbsp;&nbsp;[![Coverage Status](https://coveralls.io/repos/github/suchjs/such/badge.svg)](https://coveralls.io/github/suchjs/such)

</div>

An expandable and powerful library for generating fake data, both in nodejs & browser envirionment. You can use it to build a mock data server in nodejs, or just mocking data locally in the browser, normal built-in types can seen in [official site](https://www.suchjs.com/?locale=en-US), more extended types can seen in the [document](https://suchjs.github.io/vp-suchjs/en/extTypes.html), you can start it easily.

## Installation

[How to install](https://suchjs.github.io/vp-suchjs/en/installation.html)

## Online demos

```javascript
import globalSuch from 'suchjs';
// assign a city data
globalSuch.assign('city', {
  BeiJing: {
    BeiJing: ['ChaoYang', 'HaiDian', 'DongCheng'],
  },
  ShangHai: {
    ShangHai: ['JingAn', 'PuDong', 'PuTuo'],
  },
  GuangZhou: {
    GuangZhou: ['PanYu', 'YueXiu', 'BaiYun'],
  },
});
// assign a type 'mobile$china' base on 'regexp' type
globalSuch.define(
  'mobile$china',
  'regexp',
  '/(\\+86-)?(?<service>1[3-8][0-9])\\d{8}/',
);
// assign a type 'who' as an enum type
globalSuch.define('who', ["I'm", "He's", "She's"]);
console.log(globalSuch.as({
  string: ":string:[65,121]:{10,20}:@concat('_suffix')",
  number: ':number:[100,200]:%.2f',
  date: ":date:['-1 week','+1 week']:%yyyy-mm-dd HH\\:MM\\:ss",
  regexp: ':regexp:/[a-z]{1,3}[0-9]{2,10}/',
  range: ':increment:{2,3}:#[start=2,step=3]',
  'menu{2}': {
    id: ':increment',
    title: ':uppercase:{5,10}',
    'childs{2}': {
      cid: ':increment',
      refPid: ':ref:&../id',
      title: ':lowercase:{5,10}',
    },
  },
  cascader: {
    province: ':cascader:#[root=true,data=city]',
    city: ':cascader:&./province',
    area: ':cascader:&./city',
  },
  'enum:{1}': ['one', 'two'],
  template:
    ':::`:who` coming from `:ref:&./cascader/province`-`:ref:&./cascader/city`-`:ref:&./cascader/area`',
  diy: ':mobile$china',
  escape: '\\:number',
  extends: {
    bool: ':bool',
    int: ':int',
    percent: ':percent',
    uppercase: ':uppercase:{2,4}',
    lowercase: ':lowercase:{2,4}',
    alpha: ':alpha:{3,6}',
    alphaNumeric: ':alphaNumeric:{3,6}',
    alphaNumericDash: ':alphaNumericDash:{3,6}',
    tld: ':tld',
    domain: ':domain',
    protocol: ':protocol',
    url: ':url',
    email: ":email:#[domain='163.com']",
    ipv4: ':ipv4',
    ipv6: ':ipv6',
    color$hex: ':color$hex',
    color$rgb: ':color$rgb',
    color$rgba: ':color$rgba',
    color$hsl: ':color$hsl',
    color$hsla: ':color$hsla',
  },
}));
```

[Playground](https://suchjs.github.io/vp-suchjs/en/playground.html)

## Changelog

[Changelog](./CHANGELOG.md)

## Expandable & Powerful

Suchjs has powerful APIs for you to [design your own data](https://suchjs.github.io/vp-suchjs/en/api.html#such-define), you can use a template literal mixed normal string and all supported data types to generate a DIY string just like an article. A built-in recommend extend types can be seen in [such:recommend](./src/extends/recommend.ts)

## Questions & Bugs?

Welcome to report to us with [issue](https://github.com/suchjs/such/issues) if you meet any question or bug.

## License

[MIT License](./LICENSE).

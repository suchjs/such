# suchjs

[![npm version](https://badge.fury.io/js/suchjs.svg)](https://badge.fury.io/js/suchjs)&nbsp;&nbsp;[![Build Status](https://travis-ci.com/suchjs/such.svg?branch=master)](https://travis-ci.com/suchjs/such)

A javascript mock library, both for node & browser, make the data mocking extendedable and easily, written in typescript.


## Documents

[中文文档](https://github.com/suchjs/such/wiki/%E4%B8%AD%E6%96%87%E6%96%87%E6%A1%A3)

## How to use

```bash
npm install --save-dev suchjs
```

- builtin types

1. number[数字]

```javascript
// make a number between 1 to 100, default is float
// 创建一个1到100之间的数字，默认是浮点小数类型
Such.as(':number[1,100]'); // 10.42907893476090786
// formats
// 格式化
Such.as(':number[1,100]:%d'); // 10, integers
Such.as(':number[1,100]:%.2f'); // 10.43, floats with digits
```

2. string[字符串]

```javascript
// make a string which the length is between 10 to 20
// 创建一个长度为10到20之间的字符串
Such.as(':string{10,20}'); // 'a9zd,a?3Gdkl'
// limit the code points
// 利用unicode码点值限制生成字符串的字符
Such.as(':string[65,90]:{10,20}'); // 'DAIOKGIELKBIUPD', uppercase character
Such.as(':string[97,122]:{10,20}'); // 'gusdkjaolcnb', lowercase character
```

3. date[日期]

```javascript
// make a date
// 创建一个日期
Such.as(':date'); // 2018-10-24
// make a date between 2010 to 2020
// 限制日期的大小
Such.as(':date[2010,2020]'); // 2015-1-22
// format
// 格式化日期显示形式
Such.as(':date[2010,2020]:%yyyy-mm-dd HH\\:MM\\:ss'); // 2015-01-22 20:10:11
```

4. id[增长 id]

```javascript
// make an id
// 创建一个自增长id
Such.as(':id'); // 1  => 2 => 3
// config the id
// 配置id参数
Such.as(':id#[start=5,step=2]'); // 5 => 7 => 9
```

5. regexp[正则表达式]

```javascript
// make a string match a given regular expression
// 根据指定正则表达式生成字符
Such.as(':regexp/[a-z]{10,20}/'); // 'kcigdsleagiewdm'
```

These are some builtin types, you can extend a new type of yourself easily.

以上只列举了一些内置的类型，你可以根据内置或其它已有类型轻松的扩展自己的数据类型。您也可以通过添加解析器，将数据类型描述字符解析成对应的参数，然后在自己扩展类型中使用。

- node

1. in your root dir,touch a config file named `such.config.js`

```bash
# touch such.config.js
# mkdir suchas
# cd suchas
# mkdir data
```

```javascript
{
  "extends":["such:recommend"],
  "config": {
    "suchDir": "./suchas", // make a dir in your root named "suchas" or other names you want.
    "dataDir": "./suchas/data", // make a dir in your such dir named "data" or other names you want.
    "preload": true // or a file list that based on your data dir,contains dict files and other json files.
  },
  "types": {
    // extend types, will run Such.define to register
  },
  "parsers": {
    // extend parsers, will run Such.parser to add parser
  },
  "alias": {
    // alias types for short
  }
}
```

2. in your data dir(e.g ./suchas/data),you can create a dict file such as `test.txt`,the file will more like this.

   > Hello  
   >  World  
   >  Welcome

3. in your such dir(e.g ./suchas),you can create a json file such as `test.json`,add some code like this.

```javascript
{
  "test": ":dict&<dataDir>/test.txt"
}
```

4. then you can call it like this:

```javascript
// if the dict is preloaded.(set in the such.config.js file).
Such.as("test.json")
// or
(async (){
  await Such.as("test.json");
})();
// will output
{
  "test": "Hello" || "World" || "Welcome"
}
```

You can also install `such-cli`,and do those in the command line.

```bash
npm install --save-dev such-cli
such init
```

- browser

```html
<!--download the such.min.js-->
<script src="./dist/such.min.js"></script>
```

## Support types

- base types

1. `string`

   ```javascript
   // make a string the unicode point between 97 to 122(lowercase),the length is between 10 to 20
   :string[97,122]:{10,20} // e.g: asjshgddsgdh
   ```

2. `number`

   ```javascript
   // make a number between 200 to 300,and format it.
   :number[200,300]:%.2f // e.g 235.18
   ```

3. `date`

   ```javascript
   // make a date between today and tomorrow
   :date["today","tomorrow"]:%yyyy-mm-dd HH\:MM\:ss // e.g 2018-12-02 12:01:35
   ```

4. `regexp`

   ```javascript
   // make a string match the regexp
   :regexp/[a-z]{3,5}(\\d+)\\1/ //e.g ask2525
   ```

5. `id`

   ```javascript
   {
     "books[1,5]":{
       "id":":id#[start=2,step=2]",
       "title": ":string[97,122]:{10,20}"
     }
   }
   // e.g
   /*
   {
     "books":[{
       id: 2,
       title: "akiegsdkzgdd"
     },{
       id: 4,
       title: "kskeisllngx"
     }]
   }
   */
   ```

6. `ref`

   ```javascript
   // get a reference of other field what has been has a data.
   {
     "firstname": "William",
     "lastname": "Clinton",
     "fullname": ":ref&./firstname,./lastname:@join(' ')"
   }
   /*
   {
     "firstname": "William",
     "lastname": "Clinton",
     "fullname": "William Clinton"
   }
   */
   ```

- extend types,e.g recommend

  `boolean` `bool`(alias short) `url` `uppercase` `lowercase` `email` `integer` `int`(alias short) ... for more,you can see [such:recommend](https://github.com/suchjs/such/blob/master/src/config/recommend.ts)

## Questions & Bugs?

Welcome to report to us with issue if you meet any question or bug. [Issue](https://github.com/suchjs/such/issues)

## License

[MIT License](./LICENSE).

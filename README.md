# suchjs
[![npm version](https://badge.fury.io/js/suchjs.svg)](https://badge.fury.io/js/suchjs)&nbsp;&nbsp;[![Build Status](https://travis-ci.org/suchjs/such.svg?branch=master)](https://travis-ci.org/suchjs/such)

An easy to use and extend mock tool.

## Documents
[中文文档](https://github.com/suchjs/such/wiki/%E4%B8%AD%E6%96%87%E6%96%87%E6%A1%A3)
## How to use
- node
```bash
npm install --save-dev suchjs
``` 
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
> Hello  
  World  
  Welcome

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
You can also install `such-cli`,and do those in the command line.(will supply soon)
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
  `boolean` `bool`(alias short) `url` `uppercase` `lowercase` `email` `integer` `int`(alias short) ... for more,you can see [such:recommend](./src/config/recommend)

## Questions & Bugs?
Welcome to report to us with issue if you meet any question or bug. [Issue](https://github.com/suchjs/such/issues)

## License
[MIT License](./LICENSE).

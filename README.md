# Suchjs

[![npm version](https://badge.fury.io/js/suchjs.svg)](https://badge.fury.io/js/suchjs)&nbsp;&nbsp;[![Build Status](https://travis-ci.com/suchjs/such.svg?branch=master)](https://travis-ci.com/suchjs/such)

A javascript mock library, both for node & browser, make the data mocking extendedable and easily, written in typescript.


## Documents

  [Document](https://github.com/suchjs/such/wiki/API) &nbsp; [中文文档](https://github.com/suchjs/such/wiki/%E4%B8%AD%E6%96%87%E6%96%87%E6%A1%A3)

## Installation
-  ### Browser & package tools / Nodejs

    ```bash
    # npm
    npm install --save suchjs

    # yarn
    yarn add suchjs

    ```

-   ### Browser & source code

    Download the source code [./dist/such.min.js](./dist/such.min.js) and save the js file.

### Usage

`Suchjs` use a colon `:` symbol as the splitor of the data's properties, one splitor stand for one property, the first property is the type of the data need to be mocked. There are some normal builtin types supported by the library, of course, you can define your own type easily.  


- ## Builtin types

  1. string

      ```javascript
      // make a string which the length is between 10 to 20
      Such.as(':string{10,20}'); // 'a9zd,a?3Gdkl'
      // Limit the string's unicode code points range with the range property syntax '[min, max]'
      Such.as(':string[65,90]:{10,20}'); 
      // 'DAIOKGIELKBIUPD', uppercase character
      Such.as(':string[97,122]:{10,20}'); // 'gusdkjaolcnb', lowercase character
      ```

  2. number

      ```javascript
      // make a number between 1 to 100, default is float
      Such.as(':number[1,100]'); // 10.42907893476090786
      // formats
      Such.as(':number[1,100]:%d'); // 10, integers
      Such.as(':number[1,100]:%.2f'); // 10.43, floats with digits
      ```

  3. date

      ```javascript
      // make a date
      Such.as(':date'); // 2018-10-24
      // make a date between 2010 to 2020
      Such.as(':date[2010,2020]'); // 2015-1-22
      // use a format property with syntax '%format'
      Such.as(':date[2010,2020]:%yyyy-mm-dd HH\\:MM\\:ss'); // 2015-01-22 20:10:11
      ```

  4. id

      ```javascript
      // make an autoincreased id
      Such.as(':id'); // 1  => 2 => 3
      // config the id with a config property with syntax '#[xxx = xxx]'
      Such.as(':id#[start=5,step=2]'); // 5 => 7 => 9
      ```

  5. regexp

      ```javascript
      // make a string match a given regular expression
      Such.as(':regexp/[a-z]{10,20}/'); // 'kcigdsleagiewdm'
      ```

  6. ref

      ```javascript
      // make a refrence of the previous appeared field
      Such.as({
        "pwd": "***",
        "repeat_pwd": ":ref&./pwd"
      }); // {"pwd":"***", repeat_pwd:"***"}
      ```


- ### More ability in Nodejs

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

  3. in your such dir(e.g ./suchas),you can create a json file such as `mock.json`,add some code like this.

      ```javascript
      {
        "test": ":dict&<dataDir>/test.txt"
      }
      ```

  4. then you can call it like this:

      ```javascript
      // if the dict is preloaded.(set in the such.config.js file).
      (async () => {
        await Such.loadData();
        const result = Such.as("mock.json");
      })();

      // will output
      {
        "test": "Hello" || "World" || "Welcome"
      }
      ```

      You can also install `such-cli`, and do those in the command line.

      ```bash
      npm install --save-dev such-cli
      such init
      ```

- ### Extended types, such:recommend

  `boolean`/`bool`(alias short) `url` `uppercase` `lowercase` `email` `integer` `int`(alias short) ... for more,you can see [such:recommend](./src/config/recommend.ts)

## Questions & Bugs?

Welcome to report to us with issue if you meet any question or bug. [Issue](https://github.com/suchjs/such/issues)

## License

[MIT License](./LICENSE).

/* eslint-disable no-console */
import Such, { createNsSuch } from '../src/index';
import PathMap from '../src/helpers/pathmap';
(async () => {
  await Such.loadData();
  // console.log(Such.as(':dict:&<dataDir>/dict.txt'));
  // const txt = await Such.asc('mock.txt');
  // console.log(txt);
  const instance = Such.instance(":string:[97,99]:{3,10}");
  console.log(instance.a({
    params: {
      '/': {
        $length: {
          least: 10
        },
        $size: {
          range: [97, 97]
        }
      }
    }
  }));
  // Such.store.clear();
  // console.log(Such.store);
  // const instance = Such.instance({
  //   "errno:{1}": [0, 1],
  //   "errmsg": ":string:{10,30}",
  //   "data?": {
  //     "list{3,10}": {
  //       "province": ":province",
  //       "city": ":cascader:&./province",
  //       "area": ":cascader:&./city"
  //     }
  //   }
  // });
  // // console.log(Such.template('`:province`,`:cascader:&/${0}`,`<number>:number`,`:ref:&//${number}`').a());
  // for(let i = 0; i < 10; i++){
  //   console.log(instance.a({
  //     keys: {}
  //   }));
  // }
  // console.log(Such.template('`:bool``:ref:&//${0}`').a());
  // const tmplRef = {
  //   a: 'hello',
  //   b: 'world',
  //   c: ':::`:ref:&./a`:`:regexp:/abc/`;`:ref:&./b`:`:ref:&//${1}`;',
  // };
  // const tmplRefData = Such.as(tmplRef);
  // console.log(tmplRefData);
  // const globalConfig = {
  //   suffix: 'ok'
  // };
  // Such.define('myTmpl', "'`:number:%d`'`:string`");
  // for(let i = 0; i < 2; i++){
  //   console.log(Such.as(':myTmpl:{3}'));
  // }
  // const namedTmplRef = {
  //   a: 'hello',
  //   b: 'world',
  //   c: ':::`<say>:ref:&./a`,`<say>:ref:&./b`!`<helloworld>:ref:&/${say}:@join(",")`!`:ref:&/${helloworld}`!',
  // };
  // const namedTmplRefData = Such.as(namedTmplRef) as typeof namedTmplRef;
  // console.log(namedTmplRefData);
  // await Such.loadData();
  // for (let i = 0; i < 1; i++) {
  //   const value = await Such.as({
  //     errno: ':number[0,1]:%d',
  //     errmsg: ':string{0,20}',
  //     'count?': ':number[1,2]:#[exclude="max"]',
  //     'list{2,5}': {
  //       id: ':increment:#[step=1.5]',
  //       url: ':url',
  //       date: ':date:%yyyy-mm-dd HH\\:MM\\:ss',
  //       price: ':number[100,200]:%.2f',
  //       content: ':regexp:/(?:[a-z]{3,8} ){3,10}/',
  //       isNew: ':boolean',
  //       firstName: ':string{5,10}',
  //       lastName: ':string{3,10}',
  //       fullName: ':ref:&./firstName,./lastName:@join(" ")',
  //     },
  //     color: ':color$hex:#[argb=true,lowercase=true]',
  //     'from:{1}': ['a.com', 'b.com'],
  //     'more{3}': ':number',
  //   });
  //   console.log(value);
  // }
  // const instance = Such.instance<number>(':increment{3}');
  // for (let i = 0; i < 5; i++) {
  //   const result = instance.a();
  //   console.log(result);
  // }
  // console.log(Such.as({ 
  //   bool: ":bool", 
  //   int: ":int", 
  //   percent: ":percent", 
  //   uppercase: ":uppercase:{2,4}", 
  //   lowercase: ":lowercase:{2,4}", 
  //   alpha: ":alpha:{3,6}", 
  //   alphaNumeric: ":alphaNumeric:{3,6}", 
  //   alphaNumericDash: ":alphaNumericDash:{3,6}", 
  //   tld: ":tld", 
  //   domain: ":domain", 
  //   protocol: ":protocol", 
  //   url: ":url", 
  //   email: ":email:#[domain='163.com']", 
  //   ipv4: ":ipv4", 
  //   ipv6: ":ipv6", 
  //   color$hex: ":color$hex", 
  //   color$rgb: ":color$rgb", 
  //   color$rgba: ":color$rgba", 
  //   color$hsl: ":color$hsl", 
  //   color$hsla: ":color$hsla", 
  // }));
  // console.log(Such.as({ 
  //   bool: ":bool", 
  //   int: ":int", 
  //   percent: ":percent", 
  //   uppercase: ":uppercase:{2,4}", 
  //   lowercase: ":lowercase:{2,4}", 
  //   alpha: ":alpha:{3,6}", 
  //   alphaNumeric: ":alphaNumeric:{3,6}", 
  //   alphaNumericDash: ":alphaNumericDash:{3,6}", 
  //   tld: ":tld", 
  //   domain: ":domain", 
  //   protocol: ":protocol", 
  //   url: ":url", 
  //   email: ":email:#[domain='163.com']", 
  //   ipv4: ":ipv4", 
  //   ipv6: ":ipv6", 
  //   color$hex: ":color$hex", 
  //   color$rgb: ":color$rgb", 
  //   color$rgba: ":color$rgba", 
  //   color$hsl: ":color$hsl", 
  //   color$hsla: ":color$hsla", 
  // }));
  // dict
  // const dict = Such.instance(':dict:&<dataDir>/dict.txt');
  // console.log(dict.a());
  // lowercase
  // const color$hex = Such.instance(':color$hsl');
  // console.log(color$hex.a());
  // console.log(color$hex.a());
  // list
  // const list = Such.instance({
  //   'a{3}': [':boolean', ':string'],
  // });
  // console.log(list.a());
  // Such.assign('city', {
  //   北京市: {
  //     北京市: ['朝阳区', '东城区', '西城区'],
  //   },
  //   湖北省: {
  //     武汉市: ['洪湖区', '东西湖区', '黄陂区'],
  //   },
  //   山东省: {
  //     青岛市: ['市北区', '四方区', '黄岛区'],
  //   },
  //   上海市: {
  //     上海市: ['闵行区', '普陀区', '静安区'],
  //   },
  // });
  // Such.define('mobile', 'regexp', '/(\\+86\\-)?(?<service>1[3-8][0-9])\\d{8}/');
  // // 创建模拟实例
  // const instance = Such.instance({
  //   errno: ':int:[0,1]',
  //   errmsg: ':string{0,20}:@concat("_hahaha")',
  //   'count?': ':number[1e5,1e6]:%d',
  //   'list{2,5}': {
  //     id: ':increment',
  //     range: ':increment:#[start=0]:{3}',
  //     position: {
  //       province: ':cascader:#[root=true,data=city]',
  //       city: ':cascader:&./province',
  //       area: ':cascader:&./city',
  //       address: ':ref:&./province,./city,./area:@join("-")',
  //     },
  //     regexp: ':regexp:/\\$[a-z]w*/',
  //     email: ':email:#[domain="163.com"]',
  //     mobile: ':mobile',
  //     date: ':date:["+1 days","+1 years"]:%yyyy-mm-dd HH\\:MM\\:ss',
  //     number: ':number:[100,200]:%.2f',
  //     bool: ':bool',
  //     'childs{+1,3}': {
  //       pid: ':ref:&../id',
  //       mobile: ':mobile:#[service="135"]',
  //     },
  //   },
  //   'oneof{1}': ['hehe.com', 'haha.com'],
  //   'no-translate': '\\:number',
  //   colors: {
  //     hex: ':color$hex',
  //     rgb: ':color$rgb',
  //     rgba: ':color$rgba',
  //     hsl: ':color$hsl',
  //   },
  // });
  // 生成模拟数据
  // const value = instance.a();
  // console.log(value);
  // const instance = Such.instance({
  //   'a:{4,5}': [true, false],
  // });
  // // console.log(instance.a());
  // console.log(
  //   instance.a({
  //     keys: {
  //       '/a': {
  //         index: 0,
  //       },
  //     },
  //   }),
  // );
  // console.log(instance.keys());
  // const mySuch = createNsSuch('my');
  // mySuch.define('myString', 'string', '{10}');
  // mySuch.assign('dict', ['1', '2', '3']);
  // console.log(mySuch.as(':myString'));
  // // console.log(mySuch.as(':dict:#[data=dict]'));
  // const hisSuch = createNsSuch('his');
  // console.log(hisSuch.as(':myString'));
  // hisSuch.define('hisString', 'string', '{1}');
  // hisSuch.define('hisNumber', 'number', '[500,1000]');
  // hisSuch.alias('string', 'hisString');
  // console.log(hisSuch.as(':hisString'));
  // console.log(hisSuch.as(':string'));
  // console.log(hisSuch.as(':hisNumber'));
  // console.log(mySuch.as(':hisString'));
  // hisSuch.setExportType('hisString');
  // console.log(mySuch.as(':@his/hisString'));
  // console.log(mySuch.as(':string:{3}'));
  // console.log(mySuch.as(':@his/hisNumber'));
  // console.log(Such.as(':@his/hisString'));
  // Such.define('tmpl1', '<`:string{5}`hahah>:::{2,4}');
  // console.log(Such.as(':tmpl1:{5}'));
  // console.log(Such.as(':url'));
  // console.log(Such.as({ 'a{1,5}': ["a", "b", ":string"]}));
  // Such.define('letter', ['a', 'b', 'c']);
  // const instance = Such.instance(':letter');
  // console.log(
  //   instance.a({
  //     keys: {
  //       '/': {
  //         index: 1,
  //       },
  //     },
  //   }),
  // );
})();

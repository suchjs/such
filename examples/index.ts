/* eslint-disable no-console */
import Such from '../src/browser';

(async () => {
  // await Such.loadData();
  // for (let i = 0; i < 1; i++) {
  //   const value = await Such.as({
  //     errno: ':number[0,1]:%d',
  //     errmsg: ':string{0,20}',
  //     'count?': ':number[1,2]:#[exclude="max"]',
  //     'list{+0,5}': {
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
  // const instance = Such.instance(':increment{3}');
  // for (let i = 0; i < 5; i++) {
  //   const result = instance.a();
  //   console.log(result);
  // }
  // // dict
  // const dict = Such.instance(':dict:&<dataDir>/dict.txt');
  // console.log(dict.a());
  // // lowercase
  // const color$hex = Such.instance(':color$hsl');
  // console.log(color$hex.a());
  // console.log(color$hex.a());
  // // list
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
  // // 生成模拟数据
  // const value = instance.a();
  // console.log(value);
  const instance = Such.instance({
    'a:{4,5}': [true, false],
  });
  // console.log(instance.a());
  console.log(
    instance.a({
      keys: {
        '/a': {
          index: 0,
        },
      },
    }),
  );
  // console.log(instance.keys());
})();

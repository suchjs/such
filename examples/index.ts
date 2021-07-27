import Such from '../src/index';

(async () => {
  await Such.loadData();
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
  //   // eslint-disable-next-line no-console
  //   console.log(value);
  // }
  // const instance = Such.instance(':increment{3}');
  // for (let i = 0; i < 5; i++) {
  //   const result = instance.a();
  //   // eslint-disable-next-line no-console
  //   console.log(result);
  // }
  // dict
  // const dict = Such.instance(':dict:&<dataDir>/dict.txt');
  // // eslint-disable-next-line no-console
  // console.log(dict.a());
  // // lowercase
  const color$hex = Such.instance(':color$hsl');
  // eslint-disable-next-line no-console
  console.log(color$hex.a());
  console.log(color$hex.a());
  // console.log(color$hex.a());
})();

import Such from '../src/index';

(async () => {
  await Such.loadData();
  for (let i = 0; i < 1; i++) {
    const value = await Such.as({
      errno: ':number[0,1]:%d',
      errmsg: ':string{0,20}',
      data: {
        'count?': ':number[1e5,1e6]:%d',
        'list{+0,5}': {
          url: ':url',
          date: ':date:%yyyy-mm-dd HH\\:MM\\:ss',
          price: ':number[100,200]:%.2f',
          content: ':regexp:/(?:[a-z]{3,8} ){3,10}/',
          isNew: ':boolean',
          color: ':color$rgba',
        },
        'from:{1}': ['a.com', 'b.com'],
      },
      'more{3}': '\\:number',
    });
    // eslint-disable-next-line no-console
    console.log(value);
  }
})();

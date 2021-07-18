import Such from '../src/index';

const instance = Such.instance({
  name: ':string{3,5}',
  'list{3,5}': [
    {
      title: ':dict:&<dataDir>/dict.txt',
      email: ':email',
      url: ':url',
      date: ':date',
    },
  ],
  'more{3}': '\\:number',
});
(async () => {
  await Such.loadData();
  for (let i = 0; i < 3; i++) {
    const value = await instance.a();
    console.log(value);
  }
})();

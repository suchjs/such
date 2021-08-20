import { default as Conf } from './extends/recommend';
import { Such } from './core/such';
// add browser supported type
import dict from './browser/mockit/dict';
import cascader from './browser/mockit/cascader';
// add mockit list
import { addMockitList } from './data/mockit';
import { createNsSuch } from './core/such';
// add dict/cascader
addMockitList({
  dict,
  cascader,
});
const rootSuch = new Such();
rootSuch.config(Conf);

export default {
  namespace(ns?: string): Such {
    if (!ns) {
      return rootSuch;
    }
    return createNsSuch(ns);
  },
};

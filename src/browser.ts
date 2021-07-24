import { default as Conf } from './extends/recommend';
import Such from './core/such';
// add browser supported type
import dict from './browser/mockit/dict';
import cascader from './browser/mockit/cascader';
import { addMockitList } from './data/mockit';
// add mockit list
addMockitList({
  dict,
  cascader,
});
Such.config(Conf);
export default Such;

import { map } from './helpers/utils';
import * as ParserList from './parser/index';
import { Dispatcher } from './parser/namespace';
const dispatcher = new Dispatcher();
map(ParserList, (item, key) => {
  // remove such as __esModule key
  if((key as string).indexOf('_') === 0) {
    return;
  }
  dispatcher.addParser(key as string, item.config, item.parse, item.setting || {});
});
export default dispatcher;

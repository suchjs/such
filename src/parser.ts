import { map } from './helpers/utils';
import * as ParserList from './parser/index';
import { Dispatcher } from './parser/namespace';
const dispatcher = new Dispatcher();
map(ParserList, (item, key) => {
  dispatcher.addParser(
    key as string,
    item.config,
    item.parse,
    item.setting || {},
  );
});
export default dispatcher;

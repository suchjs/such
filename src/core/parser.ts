import * as ParserList from '../parser/index';
import { Dispatcher } from '../parser/namespace';
const dispatcher = new Dispatcher();
Object.keys(ParserList).map((key: keyof typeof ParserList) => {
  const item = ParserList[key];
  dispatcher.addParser(
    key as string,
    item.config,
    item.parse,
    item.setting || {},
  );
});
export default dispatcher;

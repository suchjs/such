import $size from '../parser/size';
import $length from '../parser/length';
import $format from '../parser/format';
import $config from '../parser/config';
import $func from '../parser/func';
import $regexp from '../parser/regexp';
import $path from '../parser/path';
import { Dispatcher } from '../core/parser';
const ParserList = { $size, $length, $format, $config, $func, $regexp, $path };
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

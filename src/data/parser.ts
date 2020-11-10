import { default as Size } from '../parser/size';
import { default as Length } from '../parser/length';
import { default as Format } from '../parser/format';
import { default as Config } from '../parser/config';
import { default as Func } from '../parser/func';
import { default as Regexp } from '../parser/regexp';
import { default as Path } from '../parser/path';
import { Dispatcher } from '../core/parser';
const ParserList = { Size, Length, Format, Config, Func, Regexp, Path };
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

import { NormalObject } from '../types';
export const rule = /^%([#\-+0 ]*)?([1-9]\d*)?(?:\.([1-9]\d*))?([dfeEoxXi])(%)?$/;
const parse = (format: string) => {
  let match: (string[] | null);
  if((match = format.match(rule)) !== null && match[0] !== '') {
    const conf = {
      align: 'right',
      type: '',
      fill: ' ',
      prefix: '',
      digits: 6,
      minWidth: 1,
      hash: false,
      percent: false,
    };
    const [_, flags, width, precision, type, percent] = match;
    const isFloatType = ['f', 'e', 'E'].indexOf(type) > -1;
    // eg:%.2d %.2o
    if(precision !== undefined && !isFloatType) {
      throw new Error(`Type of "${type}" should not have a percision width`);
    }
    conf.type = type;
    conf.digits = precision !== undefined ? +precision : conf.digits;
    conf.minWidth = width !== undefined ? +width : conf.minWidth;
    conf.percent = percent === '%';
    // parse flags
    if(flags !== undefined) {
      const segs = flags.split('');
      let seg;
      let exists = '';
      while((seg = segs.shift()) !== undefined) {
        if(exists.indexOf(seg) > -1) {
          throw new Error(`repeated flag of (${seg})`);
        } else {
          exists += seg;
          switch(seg) {
            case '+':
              conf.prefix = '+';
              break;
            case ' ':
              if(conf.prefix !== '+') {
                conf.prefix = ' ';
              }
              break;
            case '0':
              if(conf.align !== 'left') {
                conf.fill = '0';
              }
              break;
            case '-':
              conf.align = 'left';
              conf.fill = ' ';
              break;
            case '#':
              conf.hash = true;
              break;
          }
        }
      }
    }
    return conf;
  } else {
    throw new Error('Wrong format param');
  }
};
const printf = (format: string | NormalObject, target: number): string | number => {
  const conf = typeof format === 'string' ? parse(format) : format;
  let result: number | string;
  switch(conf.type) {
    case 'd':
    case 'i':
    case 'f':
      if(conf.type === 'f') {
        const ep = Math.pow(10, conf.digits);
        result = Math.round(target * ep) / ep;
      } else {
        result = Math.round(target);
      }
      if(result < 0) {
        conf.prefix = '-';
        result = result.toString().slice(1);
      } else {
        result = result.toString();
      }
      break;
    case 'o':
    case 'x':
    case 'X':
      result = target > 0 ? Math.floor(target) : Math.ceil(target);
      if(result < 0) {
        conf.prefix = '-';
      }
      if(conf.type === 'o') {
        result = Math.abs(result).toString(8);
        if(conf.hash) {
          result = '0' + result;
        } else {
          result = result.toString();
        }
      } else {
        result = Math.abs(result).toString(16);
        const isUpper = conf.type === 'X';
        if(conf.hash) {
          conf.prefix += isUpper ? '0X' : '0x';
        }
        if(isUpper) {
          result = result.toUpperCase();
        }
      }
      break;
    case 'e':
    case 'E':
      const e = Math.floor(Math.log10(target));
      let point = e.toString();
      if(e < 0) {
        if(e >= -9) {
          point = '-0' + point.charAt(1);
        }
      } else {
        if(e <= 9) {
          point = '0' + point;
        }
        point = '+' + point;
      }
      point = conf.type + point;
      return printf(Object.assign({}, conf, {
        type: 'f',
        minWidth: conf.width - point.length,
        percent: false,
      }), target / Math.pow(10, e)) + point + (conf.percent ? '%' : '');
  }
  const width = conf.minWidth;
  const fn = conf.align === 'right' ? 'padStart' : 'padEnd';
  if(conf.fill === '0') {
    result = conf.prefix + (result as string)[fn](width - conf.prefix.length, conf.fill);
  } else {
    result = (conf.prefix + result)[fn](width, conf.fill);
  }
  if(conf.percent) {
    result += '%';
  }
  return /^(?:[-+ ]|0(?!\d*\.\d+))|[ %]$/.test(result as string) ? result : Number(result);
};
export default printf;

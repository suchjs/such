import { TSuchInject } from '../types/instance';
import { TSuchSettings } from '../types/node';
const confs: TSuchSettings = {
  types: {
    integer: ['number', '%d'],
    percent: ['number', '[0,100]:%d%'],
    chinese: ['string', '[\\u4E00,\\u9FA5]'],
    uppercase: ['string', '[65,90]'],
    lowercase: ['string', '[97,122]'],
    alphaNumericDash: ['string', '[48-57,97-122,65-90,95]'],
    url: [
      'regexp',
      '/(?<protocol>http|https|ftp|telnet|file):\\/\\/(?<domain>(?:[a-z0-9]+(?:-?[a-z0-9]+|[a-z0-9]*))\\.(?<ltd>com|cn|com\\.cn|org|net|gov\\.cn|wang|ren|xyz|top|cc|io))(?<port>(?::(?:6[0-5][0-5][0-3][0-5]|[1-5]\\d{4}|[1-9]\\d{0,3}))?)\\/(?<pathname>(?:[0-9a-z]+\\/)*(?<filename>\\w+(?<extname>\\.(?:html|htm|php|do)))?)(?<query>\\?([0-9a-z_]+=(?:[0-9a-z]+|(?:%[0-9A-F]{2}){2,})&)*([0-9a-z_]+=(?:[0-9a-z]+|(?:%[0-9A-F]{2}){2,})))(?<hash>#[0-9a-z_=]{5,})?/',
    ],
    email: [
      'regexp',
      '/(?<user>(?:[a-z0-9]+(?:[-_]?[a-z0-9]+|[a-z0-9]*)))@(?<domain>(?:[a-z0-9]+(?:-?[a-z0-9]+|[a-z0-9]*))\\.(?<ltd>com|cn|com\\.cn|org|net|gov\\.cn|wang|ren|xyz|top|cc|io))/',
    ],
    boolean(options: TSuchInject): boolean {
      const { such } = options;
      return such.utils.isOptional();
    },
    color$hex(options: TSuchInject): string {
      const { such } = options;
      return (
        '#' +
        such.utils.makeRandom(0x000000, 0xffffff).toString(16).toUpperCase()
      );
    },
    color$rgb(options: TSuchInject): string {
      const { such } = options;
      const instance = such.instance(':int[0,255]');
      return (
        'rgb(' + [instance.a(), instance.a(), instance.a()].join(',') + ')'
      );
    },
    color$rgba(options: TSuchInject): string {
      const { such } = options;
      const instance = such.instance(':int[0,255]');
      const opacity = such.as(':number[0,1]:%.2f');
      return (
        'rgba(' +
        [instance.a(), instance.a(), instance.a(), opacity || 0].join(',') +
        ')'
      );
    },
    color$hsl(options: TSuchInject): string {
      const { such } = options;
      const highlight = such.as(':int[0,360]');
      const instance = such.instance(':percent');
      return 'hsl(' + [highlight, instance.a(), instance.a()].join(',') + ')';
    },
    color$hsla(options: TSuchInject): string {
      const { such } = options;
      const highlight = such.as(':int[0,360]');
      const instance = such.instance(':percent');
      const opacity = such.as(':number[0,1]:%.2f');
      return (
        'hsla(' +
        [highlight, instance.a(), instance.a(), opacity || 0].join(',') +
        ')'
      );
    },
  },
  alias: {
    int: 'integer',
    bool: 'boolean',
  },
};
export default confs;

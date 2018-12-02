import { SuchConfFile } from '../types';
const confs: SuchConfFile = {
  types: {
    integer: ['number', '%d'],
    percent: ['number', '[0,100]:%d%'],
    chinese: ['string', '[\\u4E00,\\u9FA5]'],
    uppercase: ['string', '[65,90]'],
    lowercase: ['string', '[97,122]'],
    alphaNumericDash: ['string', '[48-57,97-122,65-90,95]'],
    // tslint:disable-next-line:max-line-length
    url: ['regexp', '/(?<protocol>http|https|ftp|sftp|mailto|telnet|pop|smb|sms|ssh|mid):\\/\\/(?<domain>(?:[a-z0-9]+(?:-?[a-z0-9]+|[a-z0-9]*))\\.(?<ltd>com|cn|com\\.cn|org|net|gov\\.cn|wang|ren|xyz|top|cc|io))\\/(?<pathname>(?:[0-9a-z]+\\/)*(?<filename>\\w+(?<extname>\\.(?:html|htm|php|do)))?)(?<query>\\?([0-9a-z_]+=(?:[0-9a-z]+|(?:%[0-9A-F]{2}){2,})&)*([0-9a-z_]+=(?:[0-9a-z]+|(?:%[0-9A-F]{2}){2,})))(?<hash>#[0-9a-z_=]{5,})?/'],
    // tslint:disable-next-line:max-line-length
    email: ['regexp', '/(?<user>(?:[a-z0-9]+(?:[-_]?[a-z0-9]+|[a-z0-9]*)))@(?<domain>(?:[a-z0-9]+(?:-?[a-z0-9]+|[a-z0-9]*))\\.(?<ltd>com|cn|com\\.cn|org|net|gov\\.cn|wang|ren|xyz|top|cc|io))/'],
    boolean(options) {
      const { such } = options;
      return such.utils.isOptional();
    },
    color$hex(options) {
      const { such } = options;
      return '#' + such.utils.makeRandom(0x000000, 0xffffff).toString(16).toUpperCase();
    },
    color$rgb(options) {
      const { such } = options;
      const instance = such.as(':int[0,255]', {instance: true});
      return 'rgb(' + [instance.a(), instance.a(), instance.a()].join(',') + ')';
    },
    color$rgba(options) {
      const { such } = options;
      const instance = such.as(':int[0,255]', {instance: true});
      const opacity = such.as(':number[0,1]:%.2f');
      return 'rgba(' + [instance.a(), instance.a(), instance.a(), opacity || 0].join(',') + ')';
    },
    color$hsl(options) {
      const { such } = options;
      const highlight = such.as(':int[0,360]');
      const instance = such.as(':percent', {instance: true});
      return 'hsl(' + [highlight, instance.a(), instance.a()].join(',') + ')';
    },
    color$hsla(options) {
      const { such } = options;
      const highlight = such.as(':int[0,360]');
      const instance = such.as(':percent', {instance: true});
      const opacity = such.as(':number[0,1]:%.2f');
      return 'hsla(' + [highlight, instance.a(), instance.a(), opacity || 0].join(',') + ')';
    },
  },
  alias: {
    int: 'integer',
    bool: 'boolean',
  },
};
export default confs;

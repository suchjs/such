import { hasOwn, makeRandom } from '../helpers/utils';
import SuchMocker, { Such } from '../core/such';
import { TSuchInject } from '../types/instance';
import { TSuchSettings } from '../types/node';

type StoreGenerateFn = () => string;
/**
 * enum protocols/tlds
 * escape for domain
 */
const protocols = [
  'https',
  'http',
  'ftp',
  'telnet',
  'mailto',
  'gopher',
  'file',
];
const tlds = [
  'com',
  'net',
  'org',
  'top',
  'wang',
  'ren',
  'xyz',
  'cc',
  'co',
  'io',
  'cn',
  'com.cn',
  'org.cn',
  'gov.cn',
];
const escapeTlds = tlds.map((name) => name.replace(/\./g, '\\.'));
const domainRule = `(?<domainLabel>[a-z0-9]+(?:-?[a-z0-9]+|[a-z0-9]*))\\.(?<tld>${escapeTlds.join(
  '|',
)})`;
const fullDomainRule = `(?<domain>${domainRule})`;
const STORE_KEY = 'generate';
/**
 * ip string to number array
 */
const ip4str2num = (ip: string, errorTips: string): number[] | never => {
  const segs = ip.split('.');
  const ret: number[] = [];
  const rule = /^\d{1,3}$/;
  if (segs.length === 4) {
    const flag = segs.every((seg) => {
      if (rule.test(seg)) {
        const num = Number(seg);
        if (num >= 0 && num <= 255) {
          ret.push(num);
          return true;
        }
      }
      return false;
    });
    if (flag) return ret;
  }
  throw new Error(`${errorTips}"${ip}"`);
};
/**
 * compare two ip
 * isMax: means the max ip, now the 'min' param give the max
 */
const compareIp = <T extends string>(
  min: T,
  max: T,
  { isMax = false, type = '' } = {},
): number[] | never => {
  if (isMax) {
    if (!min) return max.split('.').map(Number);
  } else {
    if (!max) return min.split('.').map(Number);
  }
  const errorTips = `wrong config ${isMax ? 'max' : 'min'} ip${
    type ? ' of class ' + type : ''
  }:`;
  const minSegs = ip4str2num(min, errorTips);
  const maxSegs = ip4str2num(max, errorTips);
  for (let i = 0; i < 4; i++) {
    const curMin = minSegs[i];
    const curMax = maxSegs[i];
    if (curMin === curMax) continue;
    if (curMin > curMax)
      throw new Error(`${errorTips}${min}, is bigger than ${max}`);
  }
  return isMax ? minSegs : maxSegs;
};
/**
 * generate a random ip between min to max
 */
const genRandomIp = <T extends number[]>(minSegs: T, maxSegs: T): T => {
  const randomIp = [];
  let isEverBigger = false;
  for (let i = 0; i < 4; i++) {
    const min = minSegs[i];
    const max = maxSegs[i];
    if (isEverBigger) {
      randomIp.push(makeRandom(min, 255));
    } else {
      const cur = makeRandom(min, max);
      randomIp.push(cur);
      isEverBigger = cur > min;
    }
  }
  return randomIp as T;
};
const confs: TSuchSettings = {
  types: {
    /**
     * numbers
     */
    integer: ['number', '%d'],
    percent: ['number', '[0,100]:%d%'],
    /**
     * language
     */
    chinese: ['string', '[\\u4E00,\\u9FA5]'],
    /**
     * aplhabet and number characters
     */
    uppercase: ['string', '[65,90]'],
    lowercase: ['string', '[97,122]'],
    alpha: ['string', '[65-90,97-122]'],
    numeric: ['string', '[48,57]'],
    alphaNumeric: ['string', '[48-57,97-122,65-90]'],
    alphaNumericDash: ['string', '[48-57,97-122,65-90,95]'],
    /**
     * url
     */
    protocol: [protocols],
    tld: [tlds],
    domain: ['regexp', `/${domainRule}/`],
    url: [
      'regexp',
      `/(?<protocol>${protocols.join(
        '|',
      )}):\\/\\/${fullDomainRule}(?<port>(?::(?:6[0-5][0-5][0-3][0-5]|[1-5]\\d{4}|[1-9]\\d{0,3}))?)\\/(?<pathname>(?:[0-9a-z]+\\/)*(?<filename>\\w+(?<extname>\\.(?:html|htm|php|do)))?)(?<query>\\?([0-9a-z_]+=(?:[0-9a-z]+|(?:%[0-9A-F]{2}){2,})&)*([0-9a-z_]+=(?:[0-9a-z]+|(?:%[0-9A-F]{2}){2,})))(?<hash>#[0-9a-z_=]{5,})?/`,
    ],
    ip: {
      configOptions: {
        v6: {
          type: Boolean,
          default: false,
        },
        compress: {
          type: Number,
          default: 0,
        },
        type: {
          type: String,
        },
        min: {
          type: String,
        },
        max: {
          type: String,
        },
      },
      generate(options: TSuchInject, such: Such): string {
        const { $config } = this.getCurrentParams(options);
        const { v6 } = $config;
        const { mocker } = options;
        let gen = mocker.store(STORE_KEY) as StoreGenerateFn;
        if (!(typeof gen === 'function')) {
          let instance: SuchMocker;
          if (v6) {
            instance = such.instance(`:ipv6#[compress=${$config.compress}]`);
          } else {
            const { type, min, max } = $config;
            const configs: string[] = [];
            if (type) {
              configs.push(`type="${type}"`);
            }
            if (min) {
              configs.push(`min="${min}"`);
            }
            if (max) {
              configs.push(`max="${max}"`);
            }
            const config = configs.length ? `#[${configs.join(',')}]` : '';
            instance = such.instance(`:ipv4${config}`);
          }
          gen = () => instance.a() as string;
          mocker.store(STORE_KEY, gen);
        }
        return gen();
      },
    },
    ipv6: {
      configOptions: {
        compress: {
          type: Number,
          default: 0,
        },
      },
      generate(options: TSuchInject, such: Such): string {
        const { mocker } = options;
        let gen = mocker.store(STORE_KEY) as () => string;
        if (!(typeof gen === 'function')) {
          const { $config } = this.getCurrentParams(options);
          const { compress } = $config;
          if (compress > 0) {
            const instance = such.instance(':regexp/[0-9a-f]{3,4}/');
            gen = (): string => {
              const ret: string[] = [];
              const repRule = /^0*/;
              let zeroBits = 0;
              let continuous = false;
              for (let i = 0; i < 8; i++) {
                const value =
                  Math.random() < compress
                    ? ''
                    : (instance.a() as string).replace(repRule, '');
                if (value !== '') {
                  ret.push(value);
                  // reset zeroBits
                  if (zeroBits > 0) zeroBits = 0;
                } else {
                  if (continuous) {
                    // keep the placeholder zero
                    ret.push('0');
                  } else {
                    if (zeroBits > 1) {
                      // ingnore
                    } else if (zeroBits === 1) {
                      // clear the '0'
                      ret[ret.length - 1] = '';
                      // when is in the beginning
                      if (i === 1) {
                        ret.push('');
                      }
                      // set continuous
                      continuous = true;
                    } else {
                      // keep the placeholder zero
                      ret.push('0');
                    }
                    zeroBits++;
                  }
                }
              }
              // when is in the ending
              if (zeroBits > 1) {
                ret.push('');
              }
              return ret.join(':');
            };
          } else {
            const instance = such.instance(':regexp/[0-9a-f]{4}/');
            gen = (): string => {
              const ret: string[] = [];
              for (let i = 0; i < 8; i++) {
                ret.push(instance.a() as string);
              }
              return ret.join(':');
            };
          }
          mocker.store(STORE_KEY, gen);
        }
        return gen();
      },
    },
    ipv4: {
      configOptions: {
        type: {
          type: String,
        },
        min: {
          type: String,
        },
        max: {
          type: String,
        },
      },
      generate(options: TSuchInject): string {
        const { mocker } = options;
        let gen = mocker.store(STORE_KEY) as StoreGenerateFn;
        if (typeof gen !== 'function') {
          const { $config } = this.getCurrentParams(options);
          const { type } = $config;
          const { min, max } = $config;
          let minSegs: number[], maxSegs: number[];
          switch (type) {
            case 'A':
              minSegs = compareIp('0.0.0.0', min, { type });
              maxSegs = compareIp(max, '127.255.255.255', {
                type,
                isMax: true,
              });
              break;
            case 'B':
              minSegs = compareIp('128.0.0.0', min, { type });
              maxSegs = compareIp(max, '191.255.255.255', {
                type,
                isMax: true,
              });
              break;
            case 'C':
              minSegs = compareIp('192.0.0.0', min, { type });
              maxSegs = compareIp(max, '223.255.255.255', {
                type,
                isMax: true,
              });
              break;
            case 'D':
              minSegs = compareIp('224.0.0.0', min, { type });
              maxSegs = compareIp(max, '239.255.255.255', {
                type,
                isMax: true,
              });
              break;
            case 'E':
              minSegs = compareIp('240.0.0.0', min, { type });
              maxSegs = compareIp(max, '247.255.255.255', {
                type,
                isMax: true,
              });
              break;
            default:
              if (type)
                throw new Error(
                  `wrong type class of ip address: "${type}", should be "A" or "B" or "C" ... "E"`,
                );
              minSegs = compareIp('0.0.0.0', min);
              maxSegs = compareIp(max, '255.255.255.255', { isMax: true });
          }
          gen = (): string => genRandomIp(minSegs, maxSegs).join('.');
          mocker.store(STORE_KEY, gen);
        }
        return gen();
      },
    },
    /**
     * email
     */
    email: [
      'regexp',
      `/(?<user>(?:[a-z0-9]+(?:[-_]?[a-z0-9]+|[a-z0-9]*)))@${fullDomainRule}/`,
    ],
    /**
     * boolean
     */
    boolean(_: TSuchInject, such: Such): boolean {
      return such.utils.isOptional();
    },
    /**
     * colors
     */
    color$hex: {
      configOptions: {
        lowercase: {
          type: Boolean,
          default: false,
        },
        argb: {
          type: Boolean,
          default: false,
        },
        min: {
          type: Number,
          default: 0x000000,
        },
        max: {
          type: Number,
        },
      },
      generate(options: TSuchInject, such: Such): string {
        const { $config = {} } = this.getCurrentParams(options);
        const { lowercase, argb, min, max } = $config;
        const { makeRandom } = such.utils;
        let hexValue: number;
        let len = 6;
        if (!argb) {
          hexValue = makeRandom(min, hasOwn($config, 'max') ? max : 0xffffff);
        } else {
          len = 8;
          hexValue = makeRandom(
            0x00000000,
            hasOwn($config, 'max') ? max : 0xffffffff,
          );
        }
        if (!lowercase) {
          return `#${hexValue.toString(16).toUpperCase().padStart(len, '0')}`;
        }
        return `#${hexValue.toString(16).padStart(len, '0')}`;
      },
    },
    color$rgb(_: TSuchInject, such: Such): string {
      const instance = such.instance(':int[0,255]');
      return (
        'rgb(' + [instance.a(), instance.a(), instance.a()].join(',') + ')'
      );
    },
    color$rgba(_: TSuchInject, such: Such): string {
      const instance = such.instance(':int[0,255]');
      const opacity = such.as(':number[0,1]:%.2f');
      return (
        'rgba(' +
        [instance.a(), instance.a(), instance.a(), opacity || 0].join(',') +
        ')'
      );
    },
    color$hsl(_: TSuchInject, such: Such): string {
      const highlight = such.as(':int[0,360]');
      const instance = such.instance(':percent');
      return 'hsl(' + [highlight, instance.a(), instance.a()].join(',') + ')';
    },
    color$hsla(_: TSuchInject, such: Such): string {
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

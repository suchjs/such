import { PrototypeMethodNames } from '../types/common';
import { capitalize } from './utils';

interface ISpecialDayAdd {
  today: number;
  tomorrow: number;
  yesterday: number;
}
interface IDateHashInterface<T> {
  year: T;
  month: T;
  day: T;
  week: T;
}
type TDateHashInfo = IDateHashInterface<string[]>;
type TDateHashInfoKey = keyof TDateHashInfo;
type TDateMethods = PrototypeMethodNames<Date>;
interface DateHashResult extends IDateHashInterface<number> {
  date: number;
  fullYear: number;
}

/**
 *
 * @param date [Date|string|number]
 * @returns [Date] always return a Date object from the date parameter
 */
const fixDate = (date?: Date | string | number): Date => {
  if (typeof date === 'undefined') {
    return new Date();
  }
  if (date instanceof Date) {
    return date;
  }
  return new Date(date);
};

/**
 *
 * @param year [string]
 * @param month [string]
 * @param day [string]
 */
const makeDate = (
  year: string | null,
  month: string | null,
  day: string | null,
): Date => {
  const localDate = new Date();
  const fullYear = localDate.getFullYear().toString();
  year = year || fullYear;
  month = month || (localDate.getMonth() + 1).toString();
  day = day || localDate.getDate().toString();
  const yearLen = year.length;
  if (yearLen < 4) {
    year = fullYear.slice(0, fullYear.length - yearLen) + year;
  }
  return new Date(`${year}/${month}/${day} 00:00:00`);
};
/**
 *
 * @param dateStr
 * @param baseDate
 */
const strToDate = (
  dateStr: string,
  baseDate?: Date | string | number,
): Date | never => {
  // if dateStr is empty, return begin of today
  const localDate = new Date();
  if (dateStr === '') {
    localDate.setHours(0, 0, 0, 0);
    return localDate;
  }
  const mS: string[] = [
    'jan',
    'feb',
    'mar',
    'apr',
    'may',
    'jun',
    'jul',
    'aug',
    'sep',
    'oct',
    'nov',
    'dec',
  ];
  const mL: string[] = [
    'january',
    'february',
    'march',
    'april',
    'may',
    'june',
    'july',
    'august',
    'september',
    'october',
    'november',
    'december',
  ];
  /**
  1. r1|format: 2016/06/01,2016-06-01,2016.06.01
  2. r2|format: special datetime (today|yeasterday|tomorrow)
  3. r3|format: 20160601 201661
  4. r4|format: 06/01/2016 06/01 06/01/16 month/date/year
  5. r5|format: [June 1st] June 1st,2016,June.1,Jun 1st ect.
  6. r6&r6e|format: +1 day,-1 week,1 week ago
  */
  // match the r1 format
  const r1 = /^(\d{4})([-\/.])(\d{1,2})\2(\d{1,2})$/;
  dateStr = dateStr.toLowerCase();
  let matchs;
  if ((matchs = dateStr.match(r1))) {
    return makeDate(matchs[1], matchs[3], matchs[4]);
  }
  // match the r2 format
  const r2 = /^(today|yesterday|tomorrow)$/;
  if ((matchs = dateStr.match(r2))) {
    const addNum: ISpecialDayAdd = {
      today: 0,
      tomorrow: 1,
      yesterday: -1,
    };
    const key: keyof ISpecialDayAdd = matchs[1] as keyof ISpecialDayAdd;
    if (baseDate) {
      baseDate = fixDate(baseDate);
      if (addNum[key]) {
        baseDate.setDate(baseDate.getDate() + addNum[key]);
      }
      baseDate.setHours(0, 0, 0, 0);
      return baseDate;
    } else {
      if (addNum[key]) {
        return makeDate(
          null,
          null,
          (localDate.getDate() + addNum[key]).toString(),
        );
      }
      return makeDate(null, null, null);
    }
  }
  // match the r3 format
  const r3 = /^(\d{4})(\d{1,2})(\d{1,2})$/;
  if ((matchs = dateStr.match(r3))) {
    const args = matchs.slice(1, 4) as Parameters<typeof makeDate>;
    return makeDate(...args);
  }
  // match the r4 format
  const r4 = /^(\d{1,2})\/(\d{1,2})(?:\/(\d{2}|\d{4})?)$/;
  if ((matchs = dateStr.match(r4))) {
    return makeDate(matchs[4], matchs[1], matchs[2]);
  }
  // match the r5 format
  const r5 = new RegExp(
    '^(' +
      mS.concat(mL).join('|') +
      ')(?:\\s+|\\.)(?:(([13]?1)(?:st)?|([12]?2)(?:nd)?|([12]?3)(?:rd)?|([12]0|[12]?[4-9])(?:th)?|(30)th))(?:\\s*,\\s*(\\d{2}|\\d{4}))?$',
  );
  if ((matchs = dateStr.match(r5))) {
    let month = matchs[1];
    const day = matchs[3];
    const year = matchs[8];
    const atMS = mS.indexOf(month);
    const atML = mL.indexOf(month);
    if (atMS > -1) {
      month = (atMS + 1).toString();
    } else {
      month = (atML + 1).toString();
    }
    return makeDate(year, month, day);
  }
  // match the r6 format
  const r6 = /^(([+-]?\d+)\s+(day|month|week|year)s?(\s+(?!$)|))+?(\s+ago)?$/;
  const r6e = /([+-]?\d+)\s+(day|month|week|year)s?/g;
  if ((matchs = dateStr.match(r6))) {
    const needReverse = matchs[5] ? '-' : '';
    const info: TDateHashInfo = {
      year: [],
      month: [],
      day: [],
      week: [],
    };
    const result: DateHashResult = {
      year: 0,
      month: 0,
      day: 0,
      week: 0,
      date: 0,
      fullYear: 0,
    };
    let group = null;
    while ((group = r6e.exec(dateStr)) !== null) {
      const type = group[2];
      const num = group[1];
      info[type as TDateHashInfoKey].push('(' + num + ')');
    }
    Object.keys(info).map((key: TDateHashInfoKey) => {
      const arr = info[key];
      if (arr.length) {
        result[key] = new Function(
          '',
          'return ' + needReverse + '(' + arr.join('+') + ')',
        )();
      } else {
        result[key] = 0;
      }
    });
    result.date = result.week * 7 + result.day;
    result.fullYear = result.year;
    const setFnQueues: Array<keyof DateHashResult> = [
      'date',
      'month',
      'fullYear',
    ];
    const lastDate: Date = fixDate(baseDate);
    for (let i = 0, j = setFnQueues.length; i < j; i++) {
      const key: keyof DateHashResult = setFnQueues[i];
      const num = result[key];
      const method = capitalize(key);
      if (num) {
        const orig = lastDate[`get${method}` as TDateMethods]() as number;
        try {
          (lastDate[`set${method}` as TDateMethods] as (num: number) => number)(
            orig + num,
          );
        } catch (e) {
          throw e;
        }
      }
    }
    return lastDate;
  } else {
    // doesn't match any of the patterns
    throw new Error('can not parse the date!');
  }
};

/**
 *
 * @param date [unkown]
 * @returns [Date|never] return a Date object from the date
 */
export const strtotime = (date: unknown): Date | never => {
  if (!isNaN(date as number)) {
    return new Date(+date);
  } else if (typeof date === 'string') {
    let result: Date;
    try {
      result = new Date(date);
      if (isNaN(+result)) {
        throw new Error('invalid date');
      }
    } catch (e) {
      try {
        result = strToDate(date);
      } catch (e) {
        throw e;
      }
    }
    return result;
  } else {
    throw new Error(`invalid date:${date}`);
  }
};

const dayNames = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const formatter: TFormatter & ThisType<Date> = {
  d(): string {
    return this.getDate();
  },
  dd(): string {
    return zerofill('d', this);
  },
  dddd(): string {
    return dayNames[this.getDay()];
  },
  ddd(): string {
    return formatter.dddd().slice(0, 3);
  },
  m(): string {
    return this.getMonth() + 1;
  },
  mm(): string {
    return zerofill('m', this);
  },
  mmmm(): string {
    return monthNames[this.getMonth()];
  },
  mmm(): string {
    return formatter.mmmm().slice(0, 3);
  },
  yyyy(): string {
    return this.getFullYear().toString().padStart(4, '0');
  },
  yy(): string {
    return this.getFullYear().toString().slice(-2).padStart(2, '0');
  },
  h(): string {
    return (this.getHours() % 12).toString();
  },
  hh(): string {
    return zerofill('h', this);
  },
  H(): string {
    return this.getHours().toString();
  },
  HH(): string {
    return zerofill('H', this);
  },
  M(): string {
    return this.getMinutes();
  },
  MM(): string {
    return zerofill('M', this);
  },
  s(): string {
    return this.getSeconds().toString();
  },
  ss(): string {
    return zerofill('s', this);
  },
  l(): string {
    return this.getMilliseconds().toString().padStart(3, '0');
  },
  L(): string {
    return Math.round(this.getMilliseconds() / 10)
      .toString()
      .padStart(2, '0');
  },
  tt(): string {
    return this.getHours() >= 12 ? 'pm' : 'am';
  },
  t(): string {
    return formatter.tt.call(this).charAt(0);
  },
  TT(): string {
    return this.getHours() >= 12 ? 'PM' : 'AM';
  },
  T(): string {
    return formatter.TT.call(this).charAt(0);
  },
  S(): string {
    return ['st', 'nd', 'rd'][(this.getDate() % 10) - 1] || 'th';
  },
  N(): string {
    return this.getDay().toString() || '7';
  },
};
type TFormatter = {
  d(): string;
  dd(): string;
  dddd(): string;
  ddd(): string;
  m(): string;
  mm(): string;
  mmm(): string;
  mmmm(): string;
  yy(): string;
  yyyy(): string;
  h(): string;
  hh(): string;
  H(): string;
  HH(): string;
  s(): string;
  ss(): string;
  M(): string;
  MM(): string;
  t(): string;
  tt(): string;
  T(): string;
  TT(): string;
  l(): string;
  L(): string;
  S(): string;
  N(): string;
};
const zerofill = (fnName: keyof TFormatter, date: Date): string => {
  return formatter[fnName].call(date).toString().padStart(2, '0');
};

/**
 *
 * @param fmt [string] the format of the date
 * @param date [Date] the Date object
 * @returns [string] return the formatted date string of the `date` paramter
 */
export const dateformat = (fmt: string, date: Date): string => {
  return fmt.replace(/[A-Za-z]*/g, (type: keyof TFormatter) => {
    if (formatter[type]) {
      return formatter[type].call(date);
    }
    return type;
  });
};

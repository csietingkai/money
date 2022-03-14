import { ExchangeRateVo } from 'api/exchangeRate';

import { SortType } from 'util/Enum';
import { Record } from 'util/Interface';

export const isNull = (obj: any): boolean => {
    return obj === null || obj === undefined;
};

export const isStringEmpty = (str: string): boolean => {
    return isNull(str) || !str.length;
};

export const isStringBlank = (str: string): boolean => {
    return isNull(str) || !str.trim().length;
};

export const isObjEqual = (objA: any, objB: any): boolean => {
    return JSON.stringify(objA) === JSON.stringify(objB);
};

export const isNumber = (obj: any): boolean => {
    return (!isNaN(obj)) && /^-?\d+(\.\d*)?$/.test(obj);
};

export const isArray = (obj: any): boolean => {
    return Array.isArray(obj);
};

export const isArrayEmpty = (obj: any): boolean => {
    return !isArray(obj) || obj.map((x: any) => x).length === 0;
};

export const isValidDate = (obj: any): boolean => {
    return obj instanceof Date && !isNaN(obj.getTime());
};

export const isFunction = (obj: any): boolean => {
    return obj && {}.toString.call(obj) === '[object Function]';
};

export const isExternalUrl = (url: string): boolean => {
    return !isStringBlank(url) && substr(trim(url), 0, 4) === 'http';
};

export const trim = (str: string): string => {
    return isStringBlank(str) ? '' : str.trim();
};

export const substr = (str: string, from: number, length?: number): string => {
    return isStringBlank(str) ? '' : str.substr(from, length);
};

export const firstDigitUppercase = (str: string): string => {
    return substr(str, 0, 1).toUpperCase() + substr(str, 1);
};

export const toNumber = (obj: any, defaultVal: number = 0): number => {
    return parseFloat(obj) || defaultVal;
};

export const find = <K, V>(records: Record<K, V>[], key: K): boolean => {
    const record = records.find(x => x.key === key);
    return !!record;
};

export const toDate = (str: any, defaultVal: Date | null = null): Date | null => {
    const d: Date = new Date(str);
    if (isValidDate(d)) {
        return d;
    }
    return defaultVal;
};

export const toDateStr = (date: Date): string => {
    return new Intl.DateTimeFormat('zh-TW', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(date);
};

export const isSameDate = (date1: Date, date2: Date): boolean => {
    return date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate();
};

export const numberComma = (num: number): string => {
    if (!num || isNaN(num)) {
        num = 0;
    }
    const strNum = num.toString();
    return strNum.replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
};

export const reverseNumberComma = (str: string): number => {
    const num: number = parseFloat(str.replace(/,/g, ''));
    if (numberComma(num) === str) {
        return num;
    }
    return 0;
};

export const convert = <K, V>(records: Record<K, V>[], key: K): K | V => {
    const record = records.find(x => x.key === key);
    return record ? record.value : key;
};

export const reverseConvert = <K, V>(records: Record<K, V>[], value: V): K | V => {
    const record = records.find(x => x.value === value);
    return record ? record.key : value;
};

export const groupBy = (datas: any[], key: string) => {
    return datas.reduce((group, item) => {
        const value = item[key];
        if (!Array.isArray(group[value])) {
            group[value] = [];
        }
        group[value].push(item);
    }, {});
};

export const getValueByKeys = (obj: any, ...keys: string[]): any => {
    let value: any = obj;
    for (const key of keys) {
        if (!isNull(value[key])) {
            value = value[key];
        } else {
            return value;
        }
    }
    return value;
};

export const sum = (list: number[]): number => {
    return list.reduce((acc, val) => { return acc + val; }, 0);
};

export const sumByKey = (list: any[], key: string): number => {
    return sum(list.map(item => parseFloat(item[key]) || 0));
};

export const sumMoney = (amounts: { num: number, currency: string; }[], exchangeRateList: ExchangeRateVo[]): number => {
    let sum: number = 0;
    amounts.forEach(m => {
        let rate = 1;
        const c = exchangeRateList.find(e => e.currency === m.currency);
        if (c?.record) {
            rate = c.record.spotSell;
        }
        sum += m.num * rate;
    });
    return sum;
};

export const Comparator = (sortType: SortType = SortType.ASC) => <T>(a: T, b: T): number => {
    if (sortType === SortType.ASC) {
        return a > b ? 1 : (a === b ? 0 : -1);
    } else {
        return a < b ? 1 : (a === b ? 0 : -1);
    }
};

export const sort = <T>(list: T[], sortType: SortType = SortType.ASC): T[] => {
    return list.sort(Comparator(sortType));
};

export const sortByKey = (list: any[], key: string, sortType: SortType = SortType.ASC): any[] => {
    return sort(list.map(x => x[key], sortType));
};

export const handleRequestDate = (data: any): any => {
    if (!data || typeof data !== 'object') {
        return data;
    }
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            const value = data[key];
            if (value && value instanceof Date) {
                const date = new Date(value);
                // TODO time zone in config?
                date.setHours(date.getHours() + 8);
                data[key] = date.toISOString();
            } else if (typeof value === 'object') {
                data[key] = handleRequestDate(data[key]);
            }
        }
    }
    return data;
};

export const random = (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
};

export const rgba = (red: number, green: number, blue: number, alpha: number = 1): string => `rgba(${red},${green},${blue},${alpha})`;
export const black = (alpha: number = 1): string => rgba(2, 2, 2, alpha);
export const blue = (alpha: number = 1): string => rgba(32, 168, 216, alpha);
export const purple = (alpha: number = 1): string => rgba(111, 66, 193, alpha);
export const pink = (alpha: number = 1): string => rgba(232, 62, 140, alpha);
export const red = (alpha: number = 1): string => rgba(248, 108, 107, alpha);
export const orange = (alpha: number = 1): string => rgba(248, 203, 0, alpha);
export const yellow = (alpha: number = 1): string => rgba(255, 193, 7, alpha);
export const green = (alpha: number = 1): string => rgba(77, 189, 116, alpha);
export const cyan = (alpha: number = 1): string => rgba(99, 194, 222, alpha);

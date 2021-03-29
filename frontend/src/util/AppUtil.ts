import { getAuthToken } from 'reducer/StateHolder';
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

export const toDate = (str: string, defaultVal: Date | null = null): Date | null => {
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

export const Comparator = (sortType: SortType = SortType.ASC) => <T extends {}>(a: T, b: T): number => {
    if (sortType === SortType.ASC) {
        return a > b ? 1 : (a === b ? 0 : -1);
    } else {
        return a < b ? 1 : (a === b ? 0 : -1);
    }
};

export const sort = <T extends {}>(list: T[], sortType: SortType = SortType.ASC): T[] => {
    return list.sort(Comparator(sortType));
};

export const sortByKey = (list: any[], key: string, sortType: SortType = SortType.ASC): any[] => {
    return sort(list.map(x => x[key], sortType));
};

export const getAuthHeader = () => {
    return {
        'X-Auth-Token': getAuthToken()?.tokenString
    };
};

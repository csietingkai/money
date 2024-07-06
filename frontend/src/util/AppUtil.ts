import { StockType } from './Enum';

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

export const toDate = (str: any, defaultVal: Date | null = null): Date | null => {
    const d: Date = new Date(str);
    if (isValidDate(d)) {
        return d;
    }
    return defaultVal;
};

export const toDateStr = (date?: Date): string | undefined => {
    if (!date) {
        console.warn(`parameter date: \'${date}\' is not valid`);
        return undefined;
    }
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

export const getBenifitColor = (num: number, stockType: StockType): string => {
    if (num === 0) {
        return 'secondary';
    }
    let positive: string = '';
    let negitive: string = '';
    if (stockType === StockType.TW) {
        positive = 'danger';
        negitive = 'success';
    } else {
        positive = 'success';
        negitive = 'danger';
    }
    return num > 0 ? positive : negitive;
};
import { AuthToken } from 'api/auth';
import { toNumber } from 'util/AppUtil';

import { ACCOUNT_RECORD_DELETABLE_KEY, AUTH_TOKEN_KEY, DEFAULT_FOREIGNER_CURRENCY_KEY, DEFAULT_RECORD_TYPE_KEY, DEFAULT_ROLE_KEY, PREDICT_DAYS_KEY, STOCK_STYLE_KEY } from 'util/Constant';
import { StockStyle } from 'util/Enum';

const setState = (key: string, value: string) => {
    localStorage.setItem(key, value);
};

const getState = (key: string): string => {
    return localStorage.getItem(key);
};

const removeState = (key: string) => {
    localStorage.removeItem(key);
};

export const setAuthToken = (authToken: AuthToken): void => {
    setState(AUTH_TOKEN_KEY, JSON.stringify(authToken));
};

export const getAuthToken = (): AuthToken => {
    const authTokenStr: string = getState(AUTH_TOKEN_KEY);
    if (!authTokenStr) {
        return undefined;
    }
    const parseObj = JSON.parse(authTokenStr);
    const authToken: AuthToken = {
        id: parseObj.id,
        name: parseObj.name,
        role: parseObj.role,
        tokenString: parseObj.tokenString,
        expiryDate: new Date(parseObj.expiryDate)
    };
    return authToken;
};

export const removeAuthToken = (): void => {
    removeState(AUTH_TOKEN_KEY);
};

export const getDefaultForeignerCurrency = (): string => {
    return getState(DEFAULT_FOREIGNER_CURRENCY_KEY);
};

export const getStockStyle = (): StockStyle => {
    const style = getState(STOCK_STYLE_KEY);
    if (StockStyle.US === style) {
        return StockStyle.US;
    } else if (StockStyle.TW === style) {
        return StockStyle.TW;
    } else {
        setStockStyle(StockStyle.US);
        return StockStyle.US;
    }
};

export const getPredictDays = (): number => {
    const days = getState(PREDICT_DAYS_KEY);
    return toNumber(days);
};

export const isAccountRecordDeletable = (): boolean => {
    const deletable = getState(ACCOUNT_RECORD_DELETABLE_KEY);
    if (deletable === 'true') {
        return true;
    } else if (deletable === 'false') {
        return false;
    }
    return false;
};

export const getDefaultRole = (): string => {
    return getState(DEFAULT_ROLE_KEY);
};

export const getDefaultRecordType = (): string => {
    return getState(DEFAULT_RECORD_TYPE_KEY);
};

export const setStockStyle = (style: StockStyle): void => {
    setState(STOCK_STYLE_KEY, style);
};

export const setDefaultForeignerCurrency = (defaultForeignerCurrency: string): void => {
    setState(DEFAULT_FOREIGNER_CURRENCY_KEY, defaultForeignerCurrency);
};

export const setPredictDays = (days: number): void => {
    setState(PREDICT_DAYS_KEY, `${days}`);
};

export const setAccountRecordDeletable = (deletable: boolean): void => {
    setState(ACCOUNT_RECORD_DELETABLE_KEY, `${deletable}`);
};

export const setDefaultRole = (role: string): void => {
    setState(DEFAULT_ROLE_KEY, role);
};

export const setDefaultRecordType = (recordType: string): void => {
    setState(DEFAULT_RECORD_TYPE_KEY, recordType);
};

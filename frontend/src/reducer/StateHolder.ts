import { AuthToken, Role } from 'api/auth';

import { AUTH_TOKEN_KEY, STOCK_STYLE_KEY } from 'util/Constant';
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

export const setAuthToken = (authToken: AuthToken) => {
    setState(AUTH_TOKEN_KEY, JSON.stringify(authToken));
};

export const getAuthToken = (): AuthToken => {
    const authTokenStr: string = getState(AUTH_TOKEN_KEY);
    if (!authTokenStr) {
        return undefined;
    }
    const parseObj = JSON.parse(authTokenStr);
    const authToken: AuthToken = {
        name: parseObj.name,
        role: parseObj.role as Role,
        tokenString: parseObj.tokenString,
        expiryDate: new Date(parseObj.expiryDate)
    };
    return authToken;
};

export const removeAuthToken = () => {
    removeState(AUTH_TOKEN_KEY);
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

export const setStockStyle = (style: StockStyle) => {
    setState(STOCK_STYLE_KEY, style);
};

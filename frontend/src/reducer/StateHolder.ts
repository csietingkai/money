import { AuthToken } from '../api/auth';

const setState = (key: string, value: string) => {
    localStorage.setItem(key, value);
};

const getState = (key: string): string => {
    return localStorage.getItem(key) || '';
};

const removeState = (key: string) => {
    localStorage.removeItem(key);
};

const AUTH_TOKEN_KEY = 'AUTH_TOKEN';
export const setAuthToken = (authToken: AuthToken): void => {
    setState(AUTH_TOKEN_KEY, JSON.stringify(authToken));
};
export const getAuthToken = (): AuthToken | undefined => {
    const authTokenStr: string = getState(AUTH_TOKEN_KEY);
    if (!authTokenStr) {
        removeAuthToken();
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

const SIDEBAR_SHOW_KEY: string = 'sidebarShow';
export const getSidebarShow = (): boolean => {
    const val: string = getState(SIDEBAR_SHOW_KEY);
    if (val === 'true') {
        return true;
    } else if (val === 'false') {
        return false;
    }
    return true;
};
export const setSidebarShow = (val: boolean) => {
    setState(SIDEBAR_SHOW_KEY, `${val}`);
};

const SIDEBAR_FOLDABLE_KEY: string = 'sidebarShow';
export const getSidebarFoldable = (): boolean => {
    const val: string = getState(SIDEBAR_FOLDABLE_KEY);
    if (val === 'true') {
        return true;
    } else if (val === 'false') {
        return false;
    }
    return true;
};
export const setSidebarFoldable = (val: boolean) => {
    setState(SIDEBAR_FOLDABLE_KEY, `${val}`);
};

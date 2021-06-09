import axios from 'axios';
import { combineReducers } from 'redux';

import { SET_EXCHANGE_RATE_LIST, LOGIN, LOGOUT, SET_ACCOUNT_LIST } from 'reducer/ActionType';
import { getAuthToken, setAuthToken, removeAuthToken } from 'reducer/StateHolder';

import { AuthToken } from 'api/auth';
import { ExchangeRate } from 'api/exchangeRate';

import { Action } from 'util/Interface';
import { Account } from 'api/account';

const authReducer = (state: any = { authToken: getAuthToken() }, action: Action<AuthToken>): any => {
    const newState: any = { ...state };
    const { type, payload } = action;
    if (type === LOGIN) {
        setAuthToken(payload);
        newState.authToken = getAuthToken();
        axios.defaults.headers = { 'X-Auth-Token': getAuthToken()?.tokenString };
        const { href } = window.location;
        if (href.indexOf('login') >= 0 || href.indexOf('register') >= 0) {
            window.location.replace('/#/dashboard');
        }
    } else if (type === LOGOUT) {
        removeAuthToken();
        newState.authToken = undefined;
        window.location.replace('/#/login');
    }
    return newState;
};

const exchangeRateReducer = (state: any = { list: [] }, action: Action<ExchangeRate[]>): any => {
    const newState: any = { ...state };
    const { type, payload } = action;
    if (type === SET_EXCHANGE_RATE_LIST) {
        newState.list = payload;
    }
    return newState;
};

const accountReducer = (state: any = { list: [] }, action: Action<Account[]>): any => {
    const newState: any = { ...state };
    const { type, payload } = action;
    if (type === SET_ACCOUNT_LIST) {
        newState.list = payload;
    }
    return newState;
};

const reducers = [
    { key: 'auth', reducer: authReducer },
    { key: 'exchangeRate', reducer: exchangeRateReducer },
    { key: 'account', reducer: accountReducer }
];

export default combineReducers(reducers.reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.reducer;
    return acc;
}, {}));

import axios from 'axios';
import { combineReducers } from 'redux';

import { SET_EXCHANGE_RATE_LIST, LOGIN, LOGOUT, SET_ACCOUNT_LIST, SET_STOCK_STYLE } from 'reducer/ActionType';
import { DEFAULT_REDUX_ACCOUNT_STATE, DEFAULT_REDUX_AUTH_STATE, DEFAULT_REDUX_EXCHANGE_RATE_STATE, DEFAULT_REDUX_SYSTEM_SETTING_STATE, ReduxAccountState, ReduxAuthState, ReduxExchangeRateState, ReduxSystemSettingState } from 'reducer/Selector';
import { getAuthToken, setAuthToken, removeAuthToken, getStockStyle, setStockStyle } from 'reducer/StateHolder';

import { AuthToken } from 'api/auth';
import { ExchangeRate } from 'api/exchangeRate';

import { Action } from 'util/Interface';
import { Account } from 'api/account';
import { StockStyle } from 'util/Enum';

const authReducer = (state: ReduxAuthState = DEFAULT_REDUX_AUTH_STATE, action: Action<AuthToken>): ReduxAuthState => {
    const newState: ReduxAuthState = { ...state };
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

const exchangeRateReducer = (state: ReduxExchangeRateState = DEFAULT_REDUX_EXCHANGE_RATE_STATE, action: Action<ExchangeRate[]>): ReduxExchangeRateState => {
    const newState: ReduxExchangeRateState = { ...state };
    const { type, payload } = action;
    if (type === SET_EXCHANGE_RATE_LIST) {
        newState.list = payload;
    }
    return newState;
};

const accountReducer = (state: ReduxAccountState = DEFAULT_REDUX_ACCOUNT_STATE, action: Action<Account[]>): ReduxAccountState => {
    const newState: ReduxAccountState = { ...state };
    const { type, payload } = action;
    if (type === SET_ACCOUNT_LIST) {
        newState.list = payload;
    }
    return newState;
};

const systemReducer = (state: ReduxSystemSettingState = DEFAULT_REDUX_SYSTEM_SETTING_STATE, action: Action<StockStyle>): ReduxSystemSettingState => {
    const newState: ReduxSystemSettingState = { ...state };
    const { type, payload } = action;
    if (type === SET_STOCK_STYLE) {
        setStockStyle(payload);
        newState.stockStyle = payload;
    }
    return newState;
};

const reducers = [
    { key: 'auth', reducer: authReducer },
    { key: 'exchangeRate', reducer: exchangeRateReducer },
    { key: 'account', reducer: accountReducer },
    { key: 'setting', reducer: systemReducer }
];

export default combineReducers(reducers.reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.reducer;
    return acc;
}, {}));

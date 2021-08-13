import axios from 'axios';
import { combineReducers } from 'redux';

import { SET_EXCHANGE_RATE_LIST, LOGIN, LOGOUT, SET_ACCOUNT_LIST, SET_STOCK_STYLE, SET_STOCK_TRACKING_LIST, SET_LOADING } from 'reducer/ActionType';
import { DEFAULT_REDUX_ACCOUNT_STATE, DEFAULT_REDUX_AUTH_STATE, DEFAULT_REDUX_EXCHANGE_RATE_STATE, DEFAULT_REDUX_STOCK_STATE, DEFAULT_REDUX_SYSTEM_SETTING_STATE, ReduxAccountState, ReduxAuthState, ReduxExchangeRateState, ReduxStockState, ReduxSystemSettingState } from 'reducer/Selector';
import { getAuthToken, setAuthToken, removeAuthToken, setStockStyle } from 'reducer/StateHolder';

import { AuthToken } from 'api/auth';
import { ExchangeRate } from 'api/exchangeRate';
import { UserTrackingStockVo } from 'api/stock';

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

const stockReducer = (state: ReduxStockState = DEFAULT_REDUX_STOCK_STATE, action: Action<UserTrackingStockVo[]>): ReduxStockState => {
    const newState: ReduxStockState = { ...state };
    const { type, payload } = action;
    if (type === SET_STOCK_TRACKING_LIST) {
        newState.tracking = payload;
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

const systemReducer = (state: ReduxSystemSettingState = DEFAULT_REDUX_SYSTEM_SETTING_STATE, action: Action<StockStyle | boolean>): ReduxSystemSettingState => {
    const newState: ReduxSystemSettingState = { ...state };
    const { type, payload } = action;
    if (type === SET_STOCK_STYLE) {
        setStockStyle(payload as StockStyle);
        newState.stockStyle = payload as StockStyle;
    } else if (type === SET_LOADING) {
        newState.loading = payload as boolean;
    }
    return newState;
};

const reducers = [
    { key: 'auth', reducer: authReducer },
    { key: 'stock', reducer: stockReducer },
    { key: 'exchangeRate', reducer: exchangeRateReducer },
    { key: 'account', reducer: accountReducer },
    { key: 'setting', reducer: systemReducer }
];

export default combineReducers(reducers.reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.reducer;
    return acc;
}, {}));

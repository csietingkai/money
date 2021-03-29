import axios from 'axios';
import { combineReducers } from 'redux';

import { SET_EXCHANGE_RATE_LIST, LOGIN, LOGOUT } from 'reducer/ActionType';
import { getAuthToken, setAuthToken, removeAuthToken } from 'reducer/StateHolder';

import { AuthToken } from 'api/auth';
import { ExchangeRate } from 'api/exchangeRate';

import { getAuthHeader } from 'util/AppUtil';
import { Action } from 'util/Interface';

const authReducer = (state: any = { authToken: getAuthToken() }, action: Action<AuthToken>): any => {
    const newState: any = { ...state };
    const { type, payload } = action;
    if (type === LOGIN) {
        setAuthToken(payload);
        newState.authToken = getAuthToken();
        axios.defaults.headers = getAuthHeader();
    } else if (type === LOGOUT) {
        removeAuthToken();
        newState.authToken = undefined;
        window.location.replace('/#/dashboard');
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

const reducers = [
    { key: 'auth', reducer: authReducer },
    { key: 'exchangeRate', reducer: exchangeRateReducer }
];

export default combineReducers(reducers.reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.reducer;
    return acc;
}, {}));

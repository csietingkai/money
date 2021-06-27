import { Dispatch } from 'react';
import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';

import { Login, Logout, SetAccountList, SetExchangeRateList, SetStockStyle } from 'reducer/Action';
import { getAccountList, getAuthTokenName, getAuthTokenString, getExchangeRateList, getStockStyle, ReduxState } from 'reducer/Selector';
import rootReducer from 'reducer/Reducer';

import AccountApi, { Account, AccountsResponse } from 'api/account';
import AuthApi, { AuthResponse, AuthToken } from 'api/auth';
import ExchangeRateApi, { ExchangeRate, ExchangeRateListResponse } from 'api/exchangeRate';

import { isArrayEmpty } from 'util/AppUtil';
import { StockStyle } from 'util/Enum';
import { Action } from 'util/Interface';

export const validateToken = (dispatch: Dispatch<Action<AuthToken>>, getState: () => ReduxState): void => {
    const tokenString: string = getAuthTokenString(getState());
    if (tokenString) {
        AuthApi.validate(tokenString).then((response: AuthResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(Login(data));
            } else {
                dispatch(Logout());
            }
        }).catch(error => {
            console.error(error);
            dispatch(Logout());
        });
    } else {
        dispatch(Logout());
    }
};

export const fetchExchangeRateList = (dispatch: Dispatch<Action<ExchangeRate[]>>, getState: () => ReduxState): void => {
    const tokenString: string = getAuthTokenString(getState());
    const exchangeRateList: ExchangeRate[] = getExchangeRateList(getState());
    if (tokenString && isArrayEmpty(exchangeRateList)) {
        ExchangeRateApi.getAll().then((response: ExchangeRateListResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(SetExchangeRateList(data));
            } else {
                dispatch(SetExchangeRateList([]));
            }
        });
    }
};

export const fetchAccountList = (dispatch: Dispatch<Action<Account[]>>, getState: () => ReduxState): void => {
    const tokenString: string = getAuthTokenString(getState());
    const accountList: Account[] = getAccountList(getState());
    if (tokenString && isArrayEmpty(accountList)) {
        const ownerName: string = getAuthTokenName(getState());
        AccountApi.getAccounts(ownerName).then((response: AccountsResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(SetAccountList(data));
            } else {
                dispatch(SetAccountList([]));
            }
        });
    }
};

export const setStockStyle = (dispatch: Dispatch<Action<StockStyle>>, getState: () => ReduxState): void => {
    dispatch(SetStockStyle(getStockStyle(getState())));
};

const store = createStore<any, any, any, any>(rootReducer, applyMiddleware(thunkMiddleware));

export default store;

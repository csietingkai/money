import { Dispatch } from 'react';
import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';

import { Login, Logout, SetAccountList, SetExchangeRateList, SetFundTrackingList, SetLoading, SetStockStyle, SetStockTrackingList } from 'reducer/Action';
import { getAccountList, getAuthTokenName, getAuthTokenString, getExchangeRateList, getFundTrackingList, getStockStyle, getStockTrackingList, isLoading, ReduxState } from 'reducer/Selector';
import rootReducer from 'reducer/Reducer';

import AccountApi, { Account, AccountsResponse } from 'api/account';
import AuthApi, { AuthResponse, AuthToken } from 'api/auth';
import ExchangeRateApi, { ExchangeRateVo, ExchangeRateListResponse } from 'api/exchangeRate';
import FundApi, { FundTrackingListResponse, UserTrackingFundVo } from 'api/fund';
import StockApi, { StockTrackingListResponse, UserTrackingStockVo } from 'api/stock';

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

export const fetchStockTrackingList = (dispatch: Dispatch<Action<UserTrackingStockVo[]>>, getState: () => ReduxState): void => {
    const tokenString: string = getAuthTokenString(getState());
    const stockList: UserTrackingStockVo[] = getStockTrackingList(getState());
    if (tokenString && isArrayEmpty(stockList)) {
        const username = getAuthTokenName(getState());
        StockApi.getTrackingList(username).then((response: StockTrackingListResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(SetStockTrackingList(data));
            } else {
                dispatch(SetStockTrackingList([]));
            }
        }).catch(error => {
            console.error(error);
            dispatch(Logout());
        });
    }
};

export const fetchFundTrackingList = (dispatch: Dispatch<Action<UserTrackingFundVo[]>>, getState: () => ReduxState): void => {
    const tokenString: string = getAuthTokenString(getState());
    const fundList: UserTrackingFundVo[] = getFundTrackingList(getState());
    if (tokenString && isArrayEmpty(fundList)) {
        const username = getAuthTokenName(getState());
        FundApi.getTrackingList(username).then((response: FundTrackingListResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(SetFundTrackingList(data));
            } else {
                dispatch(SetFundTrackingList([]));
            }
        }).catch(error => {
            console.error(error);
            dispatch(Logout());
        });
    }
};

export const fetchExchangeRateList = (dispatch: Dispatch<Action<ExchangeRateVo[]>>, getState: () => ReduxState): void => {
    const tokenString: string = getAuthTokenString(getState());
    const exchangeRateList: ExchangeRateVo[] = getExchangeRateList(getState());
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

export const setLoading = (dispatch: Dispatch<Action<boolean>>, getState: () => ReduxState): void => {
    dispatch(SetLoading(isLoading(getState())));
};

const store = createStore<any, any, any, any>(rootReducer, applyMiddleware(thunkMiddleware));

export default store;

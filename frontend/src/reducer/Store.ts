import { Dispatch } from 'react';
import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';

import {
    Login, Logout, SetAccountList, SetDefaultMarketType, SetDefaultRecordType, SetDefaultRole, SetExchangeRateList, SetFundList, SetFundOwnList,
    SetFundTrackingList, SetLoading, SetMarketTypes, SetRecordTypes, SetRoles, SetStockList, SetStockOwnList, SetStockTrackingList
} from 'reducer/Action';
import {
    getAccountList, getAuthTokenName, getAuthTokenString, getDefaultRecordType, getDefaultRole, getExchangeRateList, getFundList, getFundOwnList, getFundTrackingList, getRecordTypes,
    getRoles, getStockList, getStockOwnList, getStockTrackingList, isLoading, ReduxState
} from 'reducer/Selector';
import rootReducer from 'reducer/Reducer';

import AccountApi, { Account, AccountListResponse } from 'api/account';
import AuthApi, { AuthResponse, AuthToken } from 'api/auth';
import EnumApi, { EnumResponse } from 'api/enum';
import ExchangeRateApi, { ExchangeRateVo, ExchangeRateListResponse } from 'api/exchangeRate';
import FundApi, { FundListResponse, FundTrackingListResponse, FundVo, UserFundListResponse, UserFundVo, UserTrackingFundVo } from 'api/fund';
import StockApi, { StockListResponse, StockTrackingListResponse, StockVo, UserStockListResponse, UserStockVo, UserTrackingStockVo } from 'api/stock';

import { isArrayEmpty } from 'util/AppUtil';
import { Action, ApiResponse } from 'util/Interface';

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

export const init = (dispatch: Dispatch<Action<any>>, getState: () => ReduxState): void => {
    const apis: any[] = [];
    const responseHandlers: ((response: ApiResponse<any>) => void)[] = [];

    const tokenString: string = getAuthTokenString(getState());

    const stockList: StockVo[] = getStockList(getState());
    if (tokenString && isArrayEmpty(stockList)) {
        apis.push(StockApi.getAll());
        responseHandlers.push((response: StockListResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(SetStockList(data));
            } else {
                dispatch(SetStockList([]));
            }
        });
    }

    const stockOwnList: UserStockVo[] = getStockOwnList(getState());
    if (tokenString && isArrayEmpty(stockOwnList)) {
        apis.push(StockApi.getOwn(getAuthTokenName(getState())));
        responseHandlers.push((response: UserStockListResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(SetStockOwnList(data));
            } else {
                dispatch(SetStockOwnList([]));
            }
        });
    }

    const stockTrackingList: UserTrackingStockVo[] = getStockTrackingList(getState());
    if (tokenString && isArrayEmpty(stockTrackingList)) {
        apis.push(StockApi.getTrackingList(getAuthTokenName(getState())));
        responseHandlers.push((response: StockTrackingListResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(SetStockTrackingList(data));
            } else {
                dispatch(SetStockTrackingList([]));
            }
        });
    }

    const fundList: FundVo[] = getFundList(getState());
    if (tokenString && isArrayEmpty(fundList)) {
        apis.push(FundApi.getAll());
        responseHandlers.push((response: FundListResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(SetFundList(data));
            } else {
                dispatch(SetFundList([]));
            }
        });
    }

    const fundOwnList: UserFundVo[] = getFundOwnList(getState());
    if (tokenString && isArrayEmpty(fundOwnList)) {
        apis.push(FundApi.getOwn(getAuthTokenName(getState())));
        responseHandlers.push((response: UserFundListResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(SetFundOwnList(data));
            } else {
                dispatch(SetFundOwnList([]));
            }
        });
    }

    const fundTrackingList: UserTrackingFundVo[] = getFundTrackingList(getState());
    if (tokenString && isArrayEmpty(fundTrackingList)) {
        apis.push(FundApi.getTrackingList(getAuthTokenName(getState())));
        responseHandlers.push((response: FundTrackingListResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(SetFundTrackingList(data));
            } else {
                dispatch(SetFundTrackingList([]));
            }
        });
    }

    const exchangeRateList: ExchangeRateVo[] = getExchangeRateList(getState());
    if (tokenString && isArrayEmpty(exchangeRateList)) {
        apis.push(ExchangeRateApi.getAll());
        responseHandlers.push((response: ExchangeRateListResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(SetExchangeRateList(data));
            } else {
                dispatch(SetExchangeRateList([]));
            }
        });
    }

    const accountList: Account[] = getAccountList(getState());
    if (tokenString && isArrayEmpty(accountList)) {
        apis.push(AccountApi.getAccounts(getAuthTokenName(getState())));
        responseHandlers.push((response: AccountListResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(SetAccountList(data));
            } else {
                dispatch(SetAccountList([]));
            }
        });
    }

    const roles: string[] = getRoles(getState());
    if (tokenString && isArrayEmpty(roles)) {
        apis.push(EnumApi.getRoles());
        responseHandlers.push((response: EnumResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(SetRoles(data));
                if (!getDefaultRole(getState())) {
                    dispatch(SetDefaultRole(data[0]));
                }
            } else {
                dispatch(SetRoles([]));
                dispatch(SetDefaultRole(''));
            }
        });
    }

    const recordTypes: string[] = getRecordTypes(getState());
    if (tokenString && isArrayEmpty(recordTypes)) {
        apis.push(EnumApi.getRecordTypes());
        responseHandlers.push((response: EnumResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(SetRecordTypes(data));
                if (!getDefaultRecordType(getState())) {
                    dispatch(SetDefaultRecordType(data[0]));
                }
            } else {
                dispatch(SetRecordTypes([]));
                dispatch(SetDefaultRecordType(''));
            }
        });
    }

    Promise.all(apis).then((responses: ApiResponse<any>[]) => {
        responses.forEach((x, i) => responseHandlers[i](x));
    });
};

export const setLoading = (dispatch: Dispatch<Action<boolean>>, getState: () => ReduxState): void => {
    dispatch(SetLoading(isLoading(getState())));
};

const store = createStore<any, any, any, any>(rootReducer, applyMiddleware(thunkMiddleware));

export default store;

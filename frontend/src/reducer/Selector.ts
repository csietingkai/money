import * as StateHolder from 'reducer/StateHolder';

import { Account } from 'api/account';
import { AuthToken, Role } from 'api/auth';
import { ExchangeRate } from 'api/exchangeRate';
import { UserTrackingStockVo } from 'api/stock';

import { StockStyle } from 'util/Enum';

export interface ReduxState {
    auth: ReduxAuthState;
    stock: ReduxStockState;
    exchangeRate: ReduxExchangeRateState;
    account: ReduxAccountState;
    setting: ReduxSystemSettingState;
}

export type ReduxChildState = ReduxAuthState | ReduxStockState | ReduxExchangeRateState | ReduxAccountState | ReduxSystemSettingState;

// authReducer
export interface ReduxAuthState {
    authToken: AuthToken;
}
export const DEFAULT_REDUX_AUTH_STATE: ReduxAuthState = {
    authToken: StateHolder.getAuthToken()
};
const getAuthState = (state: ReduxState): ReduxAuthState => state.auth;
export const getAuthToken = (state: ReduxState): AuthToken => getAuthState(state)?.authToken;
export const getAuthTokenName = (state: ReduxState): string => getAuthToken(state)?.name;
export const getAuthTokenRole = (state: ReduxState): Role => getAuthToken(state)?.role;
export const getAuthTokenString = (state: ReduxState): string => getAuthToken(state)?.tokenString;
export const getAuthTokenExpiryDate = (state: ReduxState): Date => getAuthToken(state)?.expiryDate;

// stockReducer
export interface ReduxStockState {
    tracking: UserTrackingStockVo[];
}
export const DEFAULT_REDUX_STOCK_STATE: ReduxStockState = {
    tracking: []
};
const getStockState = (state: ReduxState): ReduxStockState => state.stock;
export const getStockTrackingList = (state: ReduxState): UserTrackingStockVo[] => getStockState(state)?.tracking;

// exchangeReducer
export interface ReduxExchangeRateState {
    list: ExchangeRate[];
}
export const DEFAULT_REDUX_EXCHANGE_RATE_STATE: ReduxExchangeRateState = {
    list: []
};
const getExchangeRateState = (state: ReduxState): ReduxExchangeRateState => state.exchangeRate;
export const getExchangeRateList = (state: ReduxState, withNtd: boolean = true): ExchangeRate[] => {
    let list = getExchangeRateState(state)?.list;
    if (list && !withNtd) {
        list = list.filter(x => x.currency !== 'TWD');
    }
    return list;
};

// accountReducer
export interface ReduxAccountState {
    list: Account[];
}
export const DEFAULT_REDUX_ACCOUNT_STATE: ReduxAccountState = {
    list: []
};
const getAccountState = (state: ReduxState): ReduxAccountState => state.account;
export const getAccountList = (state: ReduxState): Account[] => getAccountState(state)?.list;

// system variable
export interface ReduxSystemSettingState {
    stockStyle: StockStyle;
    loading: boolean;
}
export const DEFAULT_REDUX_SYSTEM_SETTING_STATE: ReduxSystemSettingState = {
    stockStyle: StateHolder.getStockStyle(),
    loading: false
};
const getSystemSetting = (state: ReduxState): ReduxSystemSettingState => state.setting;
export const getStockStyle = (state: ReduxState): StockStyle => getSystemSetting(state)?.stockStyle;
export const isLoading = (state: ReduxState): boolean => getSystemSetting(state)?.loading;

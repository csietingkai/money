import { Account } from 'api/account';
import { AuthToken, Role } from 'api/auth';
import { ExchangeRate } from 'api/exchangeRate';
import { Stock } from 'api/stock';

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
const getAuthState = (state: ReduxState): ReduxAuthState => state.auth;
export const getAuthToken = (state: ReduxState): AuthToken => getAuthState(state)?.authToken;
export const getAuthTokenName = (state: ReduxState): string => getAuthToken(state)?.name;
export const getAuthTokenRole = (state: ReduxState): Role => getAuthToken(state)?.role;
export const getAuthTokenString = (state: ReduxState): string => getAuthToken(state)?.tokenString;
export const getAuthTokenExpiryDate = (state: ReduxState): Date => getAuthToken(state)?.expiryDate;

// stockReducer
export interface ReduxStockState {
    tracking: Stock[];
}
const getStockState = (state: ReduxState): ReduxStockState => state.stock;
export const getStockTrackingList = (state: ReduxState): Stock[] => getStockState(state)?.tracking;

// exchangeReducer
export interface ReduxExchangeRateState {
    list: ExchangeRate[];
}
const getExchangeRateState = (state: ReduxState): ReduxExchangeRateState => state.exchangeRate;
export const getExchangeRateList = (state: ReduxState): ExchangeRate[] => getExchangeRateState(state)?.list;

// accountReducer
export interface ReduxAccountState {
    list: Account[];
}
const getAccountState = (state: ReduxState): ReduxAccountState => state.account;
export const getAccountList = (state: ReduxState): Account[] => getAccountState(state)?.list;

// system variable
export interface ReduxSystemSettingState {
    stockStyle: StockStyle;
}
const getSystemSetting = (state: ReduxState): ReduxSystemSettingState => state.setting;
export const getStockStyle = (state: ReduxState): StockStyle => getSystemSetting(state)?.stockStyle;

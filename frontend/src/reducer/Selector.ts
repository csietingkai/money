import { ExchangeRateQueryCondition } from 'view/investment/ExchangeRateQuerier';

import * as StateHolder from 'reducer/StateHolder';

import { Account } from 'api/account';
import { AuthToken, Role } from 'api/auth';
import { ExchangeRateVo } from 'api/exchangeRate';
import { FundVo, UserTrackingFundVo } from 'api/fund';
import { StockVo, UserTrackingStockVo } from 'api/stock';

import { StockStyle } from 'util/Enum';
import { FundQueryCondition } from 'view/investment/FundQuerier';
import { StockQueryCondition } from 'view/investment/StockQuerier';

export interface ReduxState {
    auth: ReduxAuthState;
    stock: ReduxStockState;
    fund: ReduxFundState;
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
    list: StockVo[],
    tracking: UserTrackingStockVo[];
    condition: StockQueryCondition;
}
export const DEFAULT_REDUX_STOCK_STATE: ReduxStockState = {
    list: [],
    tracking: [],
    condition: { code: '', name: '', start: new Date(), end: new Date() }
};
const getStockState = (state: ReduxState): ReduxStockState => state.stock;
export const getStockList = (state: ReduxState): StockVo[] => getStockState(state)?.list;
export const getStockTrackingList = (state: ReduxState): UserTrackingStockVo[] => getStockState(state)?.tracking;
export const getStockQueryCondition = (state: ReduxState): StockQueryCondition => getStockState(state)?.condition;

// fundReducer
export interface ReduxFundState {
    list: FundVo[],
    tracking: UserTrackingFundVo[];
    condition: FundQueryCondition;
}
export const DEFAULT_REDUX_FUND_STATE: ReduxFundState = {
    list: [],
    tracking: [],
    condition: { code: '', name: '', start: new Date(), end: new Date() }
};
const getFundState = (state: ReduxState): ReduxFundState => state.fund;
export const getFundList = (state: ReduxState): FundVo[] => getFundState(state)?.list;
export const getFundTrackingList = (state: ReduxState): UserTrackingFundVo[] => getFundState(state)?.tracking;
export const getFundQueryCondition = (state: ReduxState): FundQueryCondition => getFundState(state)?.condition;

// exchangeReducer
export interface ReduxExchangeRateState {
    list: ExchangeRateVo[];
    condition: ExchangeRateQueryCondition;
}
export const DEFAULT_REDUX_EXCHANGE_RATE_STATE: ReduxExchangeRateState = {
    list: [],
    condition: { start: new Date(), end: new Date() }
};
const getExchangeRateState = (state: ReduxState): ReduxExchangeRateState => state.exchangeRate;
export const getExchangeRateList = (state: ReduxState, withNtd: boolean = true): ExchangeRateVo[] => {
    let list = getExchangeRateState(state)?.list;
    if (list && !withNtd) {
        list = list.filter(x => x.currency !== 'TWD');
    }
    return list;
};
export const getExchangeRateQueryCondition = (state: ReduxState): ExchangeRateQueryCondition => getExchangeRateState(state)?.condition;

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

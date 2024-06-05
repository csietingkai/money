import * as StateHolder from './StateHolder';
import { Account } from '../api/account';
import { AuthToken, UserSetting } from '../api/auth';
import { UserStockVo } from '../api/stock';
import { UserFundVo } from '../api/fund';
import StockQueryCondition from '../views/stock/interface/StockQueryCondition';
import StockTradeCondition from '../views/stock/interface/StockTradeCondition';
import { StockType } from '../util/Enum';
import { Notification, Option } from '../util/Interface';
import FundQueryCondition from '../views/fund/interface/FundQueryCondition';
import FundTradeCondition from '../views/fund/interface/FundTradeCondition';

export interface ReduxState {
    auth: ReduxAuthState;
    account: ReduxAccountState;
    stock: ReduxStockState;
    fund: ReduxFundState;
    option: ReduxOptionState;
    setting: ReduxSystemSettingState;
}

export type ReduxChildState = ReduxAuthState | ReduxAccountState | ReduxStockState | ReduxOptionState | ReduxSystemSettingState;

// authReducer
export interface ReduxAuthState {
    authToken: AuthToken | undefined;
    userSetting: UserSetting | undefined;
}
export const DEFAULT_REDUX_AUTH_STATE: ReduxAuthState = {
    authToken: undefined,
    userSetting: undefined
};
const getAuthState = (state: ReduxState): ReduxAuthState => state.auth;
export const getAuthToken = (state: ReduxState): AuthToken => getAuthState(state)?.authToken as AuthToken;
export const getAuthTokenId = (state: ReduxState): string => getAuthToken(state)?.id;
export const getAuthTokenName = (state: ReduxState): string => getAuthToken(state)?.name;
export const getAuthTokenRole = (state: ReduxState): string => getAuthToken(state)?.role;
export const getAuthTokenString = (state: ReduxState): string => getAuthToken(state)?.tokenString;
export const getAuthTokenExpiryDate = (state: ReduxState): Date => getAuthToken(state)?.expiryDate;
export const getUserSetting = (state: ReduxState): UserSetting => getAuthState(state)?.userSetting as UserSetting;
export const getStockType = (state: ReduxState): StockType => getUserSetting(state)?.stockType;
export const getPredictDays = (state: ReduxState): number => getUserSetting(state)?.predictDays;
export const getStockFeeRate = (state: ReduxState): number => getUserSetting(state)?.stockFeeRate;
export const getFundFeeRate = (state: ReduxState): number => getUserSetting(state)?.fundFeeRate;
export const isAccountRecordDeletable = (state: ReduxState): boolean => getUserSetting(state)?.accountRecordDeletable;
export const getDefaultRecordType = (state: ReduxState): string => getUserSetting(state)?.accountRecordType;

// accountReducer
export interface ReduxAccountState {
    list: Account[];
}
export const DEFAULT_REDUX_ACCOUNT_STATE: ReduxAccountState = {
    list: []
};
const getAccountState = (state: ReduxState): ReduxAccountState => state.account;
export const getAccountList = (state: ReduxState): Account[] => getAccountState(state)?.list;

// stockReducer
export interface ReduxStockState {
    own: UserStockVo[];
    queryCondition: StockQueryCondition;
    tradeCondition: StockTradeCondition;
}
export const DEFAULT_REDUX_STOCK_STATE: ReduxStockState = {
    own: [],
    queryCondition: { code: '', name: '', start: new Date(new Date().setDate(new Date().getDate() - 180)), end: new Date() },
    tradeCondition: { type: 'buy', code: '', name: '', date: new Date(), currency: '', price: 0, share: 0 }
};
const getStockState = (state: ReduxState): ReduxStockState => state.stock;
export const getStockOwnList = (state: ReduxState): UserStockVo[] => getStockState(state)?.own;
export const getStockQueryCondition = (state: ReduxState): StockQueryCondition => getStockState(state)?.queryCondition;
export const getStockTradeCondition = (state: ReduxState): StockTradeCondition => getStockState(state)?.tradeCondition;

// fundReducer
export interface ReduxFundState {
    own: UserFundVo[];
    queryCondition: FundQueryCondition;
    tradeCondition: FundTradeCondition;
}
export const DEFAULT_REDUX_FUND_STATE: ReduxFundState = {
    own: [],
    queryCondition: { code: '', name: '', start: new Date(new Date().setDate(new Date().getDate() - 180)), end: new Date() },
    tradeCondition: { type: 'buy', code: '', name: '', date: new Date(), price: 0, share: 0 }
};
const getFundState = (state: ReduxState): ReduxFundState => state.fund;
export const getFundOwnList = (state: ReduxState): UserFundVo[] => getFundState(state)?.own;
export const getFundQueryCondition = (state: ReduxState): FundQueryCondition => getFundState(state)?.queryCondition;
export const getFundTradeCondition = (state: ReduxState): FundTradeCondition => getFundState(state)?.tradeCondition;

// options
export interface ReduxOptionState {
    currencies: Option[];
    fileTypes: Option[];
    stockTypes: Option[];
    recordTypes: Option[];
    todayFiles: Option[];
}
export const DEFAULT_REDUX_OPTION_STATE: ReduxOptionState = {
    currencies: [],
    fileTypes: [],
    stockTypes: [],
    recordTypes: [],
    todayFiles: []
};
const getOptionState = (state: ReduxState): ReduxOptionState => state.option;
export const getCurrencies = (state: ReduxState): Option[] => getOptionState(state)?.currencies;
export const getFileTypes = (state: ReduxState): Option[] => getOptionState(state)?.fileTypes;
export const getStockTypes = (state: ReduxState): Option[] => getOptionState(state)?.stockTypes;
export const getRecordTypes = (state: ReduxState): Option[] => getOptionState(state)?.recordTypes;

// system variable
export interface ReduxSystemSettingState {
    loading: boolean;
    sidebarShow: boolean;
    sidebarFoldable: boolean;
    notifications: Notification[];
}
export const DEFAULT_REDUX_SYSTEM_SETTING_STATE: ReduxSystemSettingState = {
    loading: false,
    sidebarShow: StateHolder.getSidebarShow(),
    sidebarFoldable: StateHolder.getSidebarFoldable(),
    notifications: []
};
const getSystemSetting = (state: ReduxState): ReduxSystemSettingState => state.setting;
export const isLoading = (state: ReduxState): boolean => getSystemSetting(state)?.loading;
export const isSidebarShow = (state: ReduxState): boolean => getSystemSetting(state)?.sidebarShow;
export const isSidebarFoldable = (state: ReduxState): boolean => getSystemSetting(state)?.sidebarFoldable;
export const getNotifications = (state: ReduxState): Notification[] => getSystemSetting(state)?.notifications;

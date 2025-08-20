import * as StateHolder from './StateHolder';
import { Account } from '../api/account';
import { AuthToken, UserSetting } from '../api/auth';
import { BankInfo } from '../api/bankInfo';
import { UserStockVo } from '../api/stock';
import { UserFundVo } from '../api/fund';
import { ExchangeRateVo } from '../api/exchangeRate';
import { StockType } from '../util/Enum';
import { Lang, Notification, Option } from '../util/Interface';
import StockQueryCondition from '../views/stock/interface/StockQueryCondition';
import StockTradeCondition from '../views/stock/interface/StockTradeCondition';
import FundQueryCondition from '../views/fund/interface/FundQueryCondition';
import FundTradeCondition from '../views/fund/interface/FundTradeCondition';
import ExchangeRateQueryCondition from '../views/exchangeRate/interface/ExchangeRateQueryCondition';
import ExchangeRateTradeCondition from '../views/exchangeRate/interface/ExchangeRateTradeCondition';
import AccountRecordQueryCondition from '../views/account/interface/AccountRecordQueryCondition';
import dictionary from '../assets/locales/dictionary';

export interface ReduxState {
    auth: ReduxAuthState;
    account: ReduxAccountState;
    bankInfo: ReduxBankInfoState;
    stock: ReduxStockState;
    fund: ReduxFundState;
    exchangeRate: ReduxExchangeRateState;
    option: ReduxOptionState;
    setting: ReduxSystemSettingState;
}

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
export const getDefaultRecordType = (state: ReduxState): string => getUserSetting(state)?.accountRecordType;
export const isAccountRecordDeletable = (state: ReduxState): boolean => getUserSetting(state)?.accountRecordDeletable;
export const isOnlyShowOwnStock = (state: ReduxState): boolean => getUserSetting(state)?.onlyShowOwnStock;
export const isOnlyShowOwnFund = (state: ReduxState): boolean => getUserSetting(state)?.onlyShowOwnFund;
export const isCalcBonusInCost = (state: ReduxState): boolean => getUserSetting(state)?.calcBonusInCost;
export const getLang = (state: ReduxState): Lang => getUserSetting(state)?.lang || StateHolder.getLang();
export const getMessages = (state: ReduxState): Record<string, string> => dictionary[getLang(state)];

// accountReducer
export interface ReduxAccountState {
    list: Account[];
    queryCondition: AccountRecordQueryCondition;
}
export const DEFAULT_REDUX_ACCOUNT_STATE: ReduxAccountState = {
    list: [],
    queryCondition: {}
};
const getAccountState = (state: ReduxState): ReduxAccountState => state.account;
export const getAccountList = (state: ReduxState): Account[] => getAccountState(state)?.list;
export const getAccountRecordQueryCondition = (state: ReduxState): AccountRecordQueryCondition => getAccountState(state)?.queryCondition;

export interface ReduxBankInfoState {
    list: BankInfo[];
}
export const DEFAULT_REDUX_BANK_INFO_STATE: ReduxBankInfoState = {
    list: []
};
const getBankInfoState = (state: ReduxState): ReduxBankInfoState => state.bankInfo;
export const getBankInfoList = (state: ReduxState): BankInfo[] => getBankInfoState(state)?.list;

// stockReducer
export interface ReduxStockState {
    own: UserStockVo[];
    queryCondition: StockQueryCondition;
    tradeCondition?: StockTradeCondition;
}
export const DEFAULT_REDUX_STOCK_STATE: ReduxStockState = {
    own: [],
    queryCondition: { code: '', name: '' },
    tradeCondition: undefined
};
const getStockState = (state: ReduxState): ReduxStockState => state.stock;
export const getStockOwnList = (state: ReduxState): UserStockVo[] => getStockState(state)?.own;
export const getStockQueryCondition = (state: ReduxState): StockQueryCondition => getStockState(state)?.queryCondition;
export const getStockTradeCondition = (state: ReduxState): StockTradeCondition | undefined => getStockState(state)?.tradeCondition;

// fundReducer
export interface ReduxFundState {
    own: UserFundVo[];
    queryCondition: FundQueryCondition;
    tradeCondition?: FundTradeCondition;
}
export const DEFAULT_REDUX_FUND_STATE: ReduxFundState = {
    own: [],
    queryCondition: { code: '', name: '' },
    tradeCondition: undefined
};
const getFundState = (state: ReduxState): ReduxFundState => state.fund;
export const getFundOwnList = (state: ReduxState): UserFundVo[] => getFundState(state)?.own;
export const getFundQueryCondition = (state: ReduxState): FundQueryCondition => getFundState(state)?.queryCondition;
export const getFundTradeCondition = (state: ReduxState): FundTradeCondition | undefined => getFundState(state)?.tradeCondition;

// exchange rate
export interface ReduxExchangeRateState {
    exchangeRates: ExchangeRateVo[];
    queryCondition: ExchangeRateQueryCondition;
    tradeCondition?: ExchangeRateTradeCondition;
}
export const DEFAULT_REDUX_EXCHANGE_RATE_STATE: ReduxExchangeRateState = {
    exchangeRates: [],
    queryCondition: { currency: '' },
    tradeCondition: undefined
};
const getExchangeRateState = (state: ReduxState): ReduxExchangeRateState => state.exchangeRate;
export const getExchangeRateList = (state: ReduxState): ExchangeRateVo[] => getExchangeRateState(state)?.exchangeRates;
export const getExchangeRateQueryCondition = (state: ReduxState): ExchangeRateQueryCondition => getExchangeRateState(state)?.queryCondition;
export const getExchangeRateTradeCondition = (state: ReduxState): ExchangeRateTradeCondition | undefined => getExchangeRateState(state)?.tradeCondition;

// options
export interface ReduxOptionState {
    fileTypes: Option[];
    stockTypes: Option[];
    recordTypes: Option[];
    todayFiles: Option[];
}
export const DEFAULT_REDUX_OPTION_STATE: ReduxOptionState = {
    fileTypes: [],
    stockTypes: [],
    recordTypes: [],
    todayFiles: []
};
const getOptionState = (state: ReduxState): ReduxOptionState => state.option;
export const getCurrencies = (state: ReduxState): Option[] => getExchangeRateList(state)?.map(x => ({ key: x.currency, value: x.name }));
export const getFileTypes = (state: ReduxState): Option[] => getOptionState(state)?.fileTypes;
export const getStockTypes = (state: ReduxState): Option[] => getOptionState(state)?.stockTypes;
export const getRecordTypes = (state: ReduxState): Option[] => getOptionState(state)?.recordTypes;
export const getBankInfos = (state: ReduxState): Option[] => getBankInfoList(state)?.map(x => ({ key: x.code, value: x.name }));

// system variable
export interface ReduxSystemSettingState {
    loading: boolean;
    sidebarShow: boolean;
    sidebarFoldable: boolean;
    notifications: Notification[];
    isMobile: boolean;
}
export const DEFAULT_REDUX_SYSTEM_SETTING_STATE: ReduxSystemSettingState = {
    loading: false,
    sidebarShow: StateHolder.getSidebarShow(),
    sidebarFoldable: StateHolder.getSidebarFoldable(),
    notifications: [],
    isMobile: false,
};
const getSystemSetting = (state: ReduxState): ReduxSystemSettingState => state.setting;
export const isLoading = (state: ReduxState): boolean => getSystemSetting(state)?.loading;
export const isSidebarShow = (state: ReduxState): boolean => getSystemSetting(state)?.sidebarShow;
export const isSidebarFoldable = (state: ReduxState): boolean => getSystemSetting(state)?.sidebarFoldable;
export const getNotifications = (state: ReduxState): Notification[] => getSystemSetting(state)?.notifications;
export const isMobile = (state: ReduxState): boolean => getSystemSetting(state)?.isMobile;

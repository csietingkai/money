import { Dispatch } from 'react';
import { Login, Logout, SetAccountList, SetLoading, Notify, SetSidebarFoldable, SetSidebarShow, SetUserSetting, SetOwnStockList, SetStockQueryCondition, SetStockTradeCondition, SetFundQueryCondition, SetFundTradeCondition, SetOwnFundList, SetExchangeRateQueryCondition, SetExchangeRateTradeCondition, SetBankInfoList } from './Action';
import { LoginRespVo, UserSetting } from '../api/auth';
import { Account } from '../api/account';
import { Action } from '../util/Interface';
import { UserStockVo } from '../api/stock';
import StockTradeCondition from '../views/stock/interface/StockTradeCondition';
import StockQueryCondition from '../views/stock/interface/StockQueryCondition';
import { UserFundVo } from '../api/fund';
import FundQueryCondition from '../views/fund/interface/FundQueryCondition';
import FundTradeCondition from '../views/fund/interface/FundTradeCondition';
import ExchangeRateTradeCondition from '../views/exchangeRate/interface/ExchangeRateTradeCondition';
import ExchangeRateQueryCondition from '../views/exchangeRate/interface/ExchangeRateQueryCondition';
import { BankInfo } from '../api/bankInfo';

// auth
export const LoginDispatcher = (dispatch: Dispatch<Action<LoginRespVo>>) => (vo: LoginRespVo): void => dispatch(Login(vo));
export const LogoutDispatcher = (dispatch: Dispatch<Action<undefined>>) => (): void => dispatch(Logout());
export const SetUserSettingDispatcher = (dispatch: Dispatch<Action<UserSetting>>) => (setting: UserSetting): void => dispatch(SetUserSetting(setting));

// account
export const SetAccountListDispatcher = (dispatch: Dispatch<Action<Account[]>>) => (accounts: Account[]): void => dispatch(SetAccountList(accounts));

// bank info
export const SetBankInfoListDispatcher = (dispatch: Dispatch<Action<BankInfo[]>>) => (bankInfos: BankInfo[]): void => dispatch(SetBankInfoList(bankInfos));

// stock
export const SetOwnStockListDispatcher = (dispatch: Dispatch<Action<UserStockVo[]>>) => (vos: UserStockVo[]): void => dispatch(SetOwnStockList(vos));
export const SetStockQueryConditionDispatcher = (dispatch: Dispatch<Action<StockQueryCondition>>) => (condition: StockQueryCondition): void => dispatch(SetStockQueryCondition(condition));
export const SetStockTradeConditionDispatcher = (dispatch: Dispatch<Action<StockTradeCondition | undefined>>) => (condition?: StockTradeCondition): void => dispatch(SetStockTradeCondition(condition));

// fund
export const SetOwnFundListDispatcher = (dispatch: Dispatch<Action<UserFundVo[]>>) => (vos: UserFundVo[]): void => dispatch(SetOwnFundList(vos));
export const SetFundQueryConditionDispatcher = (dispatch: Dispatch<Action<FundQueryCondition>>) => (condition: FundQueryCondition): void => dispatch(SetFundQueryCondition(condition));
export const SetFundTradeConditionDispatcher = (dispatch: Dispatch<Action<FundTradeCondition | undefined>>) => (condition?: FundTradeCondition): void => dispatch(SetFundTradeCondition(condition));

// currency
export const SetExchangeRateQueryConditionDispatcher = (dispatch: Dispatch<Action<ExchangeRateQueryCondition>>) => (condition: ExchangeRateQueryCondition): void => dispatch(SetExchangeRateQueryCondition(condition));
export const SetExchangeRateTradeConditionDispatcher = (dispatch: Dispatch<Action<ExchangeRateTradeCondition | undefined>>) => (condition?: ExchangeRateTradeCondition): void => dispatch(SetExchangeRateTradeCondition(condition));

// system setting
export const SetLoadingDispatcher = (dispatch: Dispatch<Action<boolean>>) => (loading: boolean): void => dispatch(SetLoading(loading));
export const SetSidebarShowDispatcher = (dispatch: Dispatch<Action<boolean>>) => (sidebarShow: boolean): void => dispatch(SetSidebarShow(sidebarShow));
export const SetSidebarFoldableDispatcher = (dispatch: Dispatch<Action<boolean>>) => (sidebarFoldable: boolean): void => dispatch(SetSidebarFoldable(sidebarFoldable));
export const SetNotifyDispatcher = (dispatch: Dispatch<Action<string>>) => (message: string): void => dispatch(Notify(message));

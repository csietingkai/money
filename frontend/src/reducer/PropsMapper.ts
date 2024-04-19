import { Dispatch } from 'react';
import { Login, Logout, SetAccountList, SetLoading, Notify, SetSidebarFoldable, SetSidebarShow, SetUserSetting, SetOwnStockList, SetStockQueryCondition, SetStockTradeCondition, SetFundQueryCondition, SetFundTradeCondition, SetOwnFundList } from './Action';
import { LoginRespVo, UserSetting } from '../api/auth';
import { Account } from '../api/account';
import { Action } from '../util/Interface';
import { UserStockVo } from '../api/stock';
import StockTradeCondition from '../views/stock/interface/StockTradeCondition';
import StockQueryCondition from '../views/stock/interface/StockQueryCondition';
import { UserFundVo } from '../api/fund';
import FundQueryCondition from '../views/fund/interface/FundQueryCondition';
import FundTradeCondition from '../views/fund/interface/FundTradeCondition';

// auth
export const LoginDispatcher = (dispatch: Dispatch<Action<LoginRespVo>>) => (vo: LoginRespVo): void => dispatch(Login(vo));
export const LogoutDispatcher = (dispatch: Dispatch<Action<undefined>>) => (): void => dispatch(Logout());
export const SetUserSettingDispatcher = (dispatch: Dispatch<Action<UserSetting>>) => (setting: UserSetting): void => dispatch(SetUserSetting(setting));

// account
export const SetAccountListDispatcher = (dispatch: Dispatch<Action<Account[]>>) => (accounts: Account[]): void => dispatch(SetAccountList(accounts));

// stock
export const SetOwnStockListDispatcher = (dispatch: Dispatch<Action<UserStockVo[]>>) => (vos: UserStockVo[]): void => dispatch(SetOwnStockList(vos));
export const SetStockQueryConditionDispatcher = (dispatch: Dispatch<Action<StockQueryCondition>>) => (condition: StockQueryCondition): void => dispatch(SetStockQueryCondition(condition));
export const SetStockTradeConditionDispatcher = (dispatch: Dispatch<Action<StockTradeCondition>>) => (condition: StockTradeCondition): void => dispatch(SetStockTradeCondition(condition));

// fund
export const SetOwnFundListDispatcher = (dispatch: Dispatch<Action<UserFundVo[]>>) => (vos: UserFundVo[]): void => dispatch(SetOwnFundList(vos));
export const SetFundQueryConditionDispatcher = (dispatch: Dispatch<Action<FundQueryCondition>>) => (condition: FundQueryCondition): void => dispatch(SetFundQueryCondition(condition));
export const SetFundTradeConditionDispatcher = (dispatch: Dispatch<Action<FundTradeCondition>>) => (condition: FundTradeCondition): void => dispatch(SetFundTradeCondition(condition));

// system setting
export const SetLoadingDispatcher = (dispatch: Dispatch<Action<boolean>>) => (loading: boolean): void => dispatch(SetLoading(loading));
export const SetSidebarShowDispatcher = (dispatch: Dispatch<Action<boolean>>) => (sidebarShow: boolean): void => dispatch(SetSidebarShow(sidebarShow));
export const SetSidebarFoldableDispatcher = (dispatch: Dispatch<Action<boolean>>) => (sidebarFoldable: boolean): void => dispatch(SetSidebarFoldable(sidebarFoldable));
export const SetNotifyDispatcher = (dispatch: Dispatch<Action<string>>) => (message: string): void => dispatch(Notify(message));

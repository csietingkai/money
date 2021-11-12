import { Dispatch } from 'react';

import { ExchangeRateQueryCondition } from 'view/investment/ExchangeRateQuerier';
import { FundQueryCondition } from 'view/investment/FundQuerier';
import { StockQueryCondition } from 'view/investment/StockQuerier';

import { Login, Logout, SetAccountList, SetExchangeRateQueryCondition, SetFundList, SetFundQueryCondition, SetFundTrackingList, SetLoading, SetStockList, SetStockQueryCondition, SetStockStyle, SetStockTrackingList } from 'reducer/Action';

import { Account } from 'api/account';
import { AuthToken } from 'api/auth';
import { FundVo, UserTrackingFundVo } from 'api/fund';
import { StockVo, UserTrackingStockVo } from 'api/stock';

import { StockStyle } from 'util/Enum';
import { Action } from 'util/Interface';

// auth
export const LoginDispatcher = (dispatch: Dispatch<Action<AuthToken>>) => (authToken: AuthToken): void => dispatch(Login(authToken));
export const LogoutDispatcher = (dispatch: Dispatch<Action<undefined>>) => (): void => dispatch(Logout());

// stock
export const SetStockListDispatcher = (dispatch: Dispatch<Action<StockVo[]>>) => (stocks: StockVo[]): void => dispatch(SetStockList(stocks));
export const SetStockTrackingListDispatcher = (dispatch: Dispatch<Action<UserTrackingStockVo[]>>) => (stocks: UserTrackingStockVo[]): void => dispatch(SetStockTrackingList(stocks));
export const SetStockQueryConditionDispatcher = (dispatch: Dispatch<Action<StockQueryCondition>>) => (condition: StockQueryCondition): void => dispatch(SetStockQueryCondition(condition));

// fund
export const SetFundListDispatcher = (dispatch: Dispatch<Action<FundVo[]>>) => (stocks: FundVo[]): void => dispatch(SetFundList(stocks));
export const SetFundTrackingListDispatcher = (dispatch: Dispatch<Action<UserTrackingFundVo[]>>) => (funds: UserTrackingFundVo[]): void => dispatch(SetFundTrackingList(funds));
export const SetFundQueryConditionDispatcher = (dispatch: Dispatch<Action<FundQueryCondition>>) => (condition: FundQueryCondition): void => dispatch(SetFundQueryCondition(condition));

// exchange rate
export const SetExchangeRateQueryConditionDispatcher = (dispatch: Dispatch<Action<ExchangeRateQueryCondition>>) => (condition: ExchangeRateQueryCondition): void => dispatch(SetExchangeRateQueryCondition(condition));

// account
export const SetAccountListDispatcher = (dispatch: Dispatch<Action<Account[]>>) => (accounts: Account[]): void => dispatch(SetAccountList(accounts));

// system setting
export const SetStockStyleDispatcher = (dispatch: Dispatch<Action<StockStyle>>) => (style: StockStyle): void => dispatch(SetStockStyle(style));
export const SetLoadingDispatcher = (dispatch: Dispatch<Action<boolean>>) => (loading: boolean): void => dispatch(SetLoading(loading));

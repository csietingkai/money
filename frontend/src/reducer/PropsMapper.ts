import { Dispatch } from 'react';

import { ExchangeRateQueryCondition } from 'view/investment/ExchangeRateQuerier';
import { FundQueryCondition } from 'view/investment/FundQuerier';
import { StockQueryCondition } from 'view/investment/StockQuerier';

import { Login, Logout, SetAccountList, SetAccountRecordDeletable, SetExchangeRateList, SetExchangeRateQueryCondition, SetFundList, SetFundOwnList, SetFundPredictResult, SetFundQueryCondition, SetFundTrackingList, SetLoading, SetPredictDays, SetStockList, SetStockOwnList, SetStockPredictResult, SetStockQueryCondition, SetStockStyle, SetStockTrackingList } from 'reducer/Action';

import { Account } from 'api/account';
import { AuthToken } from 'api/auth';
import { ExchangeRateVo } from 'api/exchangeRate';
import { FundVo, UserFundVo, UserTrackingFundVo } from 'api/fund';
import { StockVo, UserStockVo, UserTrackingStockVo } from 'api/stock';

import { StockStyle } from 'util/Enum';
import { Action, PredictResultVo } from 'util/Interface';

// auth
export const LoginDispatcher = (dispatch: Dispatch<Action<AuthToken>>) => (authToken: AuthToken): void => dispatch(Login(authToken));
export const LogoutDispatcher = (dispatch: Dispatch<Action<undefined>>) => (): void => dispatch(Logout());

// stock
export const SetStockListDispatcher = (dispatch: Dispatch<Action<StockVo[]>>) => (stocks: StockVo[]): void => dispatch(SetStockList(stocks));
export const SetStockOwnListDispatcher = (dispatch: Dispatch<Action<UserStockVo[]>>) => (stocks: UserStockVo[]): void => dispatch(SetStockOwnList(stocks));
export const SetStockTrackingListDispatcher = (dispatch: Dispatch<Action<UserTrackingStockVo[]>>) => (stocks: UserTrackingStockVo[]): void => dispatch(SetStockTrackingList(stocks));
export const SetStockQueryConditionDispatcher = (dispatch: Dispatch<Action<StockQueryCondition>>) => (condition: StockQueryCondition): void => dispatch(SetStockQueryCondition(condition));
export const SetStockPredictResultDispatcher = (dispatch: Dispatch<Action<PredictResultVo[]>>) => (result: PredictResultVo[]): void => dispatch(SetStockPredictResult(result));

// fund
export const SetFundListDispatcher = (dispatch: Dispatch<Action<FundVo[]>>) => (funds: FundVo[]): void => dispatch(SetFundList(funds));
export const SetFundOwnListDispatcher = (dispatch: Dispatch<Action<UserFundVo[]>>) => (funds: UserFundVo[]): void => dispatch(SetFundOwnList(funds));
export const SetFundTrackingListDispatcher = (dispatch: Dispatch<Action<UserTrackingFundVo[]>>) => (funds: UserTrackingFundVo[]): void => dispatch(SetFundTrackingList(funds));
export const SetFundQueryConditionDispatcher = (dispatch: Dispatch<Action<FundQueryCondition>>) => (condition: FundQueryCondition): void => dispatch(SetFundQueryCondition(condition));
export const SetFundPredictResultDispatcher = (dispatch: Dispatch<Action<PredictResultVo[]>>) => (result: PredictResultVo[]): void => dispatch(SetFundPredictResult(result));

// exchange rate
export const SetExchangeRateListDispatcher = (dispatch: Dispatch<Action<ExchangeRateVo[]>>) => (exchangeRateList: ExchangeRateVo[]): void => dispatch(SetExchangeRateList(exchangeRateList));
export const SetExchangeRateQueryConditionDispatcher = (dispatch: Dispatch<Action<ExchangeRateQueryCondition>>) => (condition: ExchangeRateQueryCondition): void => dispatch(SetExchangeRateQueryCondition(condition));

// account
export const SetAccountListDispatcher = (dispatch: Dispatch<Action<Account[]>>) => (accounts: Account[]): void => dispatch(SetAccountList(accounts));

// system setting
export const SetStockStyleDispatcher = (dispatch: Dispatch<Action<StockStyle>>) => (style: StockStyle): void => dispatch(SetStockStyle(style));
export const SetPredictDaysDispatcher = (dispatch: Dispatch<Action<number>>) => (days: number): void => dispatch(SetPredictDays(days));
export const SetAccountRecordDeletableDispatcher = (dispatch: Dispatch<Action<boolean>>) => (deletable: boolean): void => dispatch(SetAccountRecordDeletable(deletable));
export const SetLoadingDispatcher = (dispatch: Dispatch<Action<boolean>>) => (loading: boolean): void => dispatch(SetLoading(loading));

import { ExchangeRateQueryCondition } from 'view/investment/ExchangeRateQuerier';
import { FundQueryCondition } from 'view/investment/FundQuerier';
import { StockQueryCondition } from 'view/investment/StockQuerier';

import { SET_EXCHANGE_RATE_LIST, LOGIN, LOGOUT, SET_ACCOUNT_LIST, SET_STOCK_STYLE, SET_LOADING, SET_STOCK_TRACKING_LIST, SET_FUND_TRACKING_LIST, SET_EXCHANGE_RATE_QUERY_CONDITION, SET_FUND_QUERY_CONDITION, SET_STOCK_QUERY_CONDITION } from 'reducer/ActionType';

import { Account } from 'api/account';
import { AuthToken } from 'api/auth';
import { ExchangeRateVo } from 'api/exchangeRate';
import { UserTrackingFundVo } from 'api/fund';
import { UserTrackingStockVo } from 'api/stock';

import { StockStyle } from 'util/Enum';
import { Action } from 'util/Interface';

// auth
export const Login = (payload: AuthToken): Action<AuthToken> => ({ type: LOGIN, payload });
export const Logout = (): Action<undefined> => ({ type: LOGOUT, payload: undefined });

// stock
export const SetStockTrackingList = (payload: UserTrackingStockVo[]): Action<UserTrackingStockVo[]> => ({ type: SET_STOCK_TRACKING_LIST, payload });
export const SetStockQueryCondition = (payload: StockQueryCondition): Action<StockQueryCondition> => ({ type: SET_STOCK_QUERY_CONDITION, payload });

// fund
export const SetFundTrackingList = (payload: UserTrackingFundVo[]): Action<UserTrackingFundVo[]> => ({ type: SET_FUND_TRACKING_LIST, payload });
export const SetFundQueryCondition = (payload: FundQueryCondition): Action<FundQueryCondition> => ({ type: SET_FUND_QUERY_CONDITION, payload });

// exchange rate
export const SetExchangeRateList = (payload: ExchangeRateVo[]): Action<ExchangeRateVo[]> => ({ type: SET_EXCHANGE_RATE_LIST, payload });
export const SetExchangeRateQueryCondition = (payload: ExchangeRateQueryCondition): Action<ExchangeRateQueryCondition> => ({ type: SET_EXCHANGE_RATE_QUERY_CONDITION, payload });

// account
export const SetAccountList = (payload: Account[]): Action<Account[]> => ({ type: SET_ACCOUNT_LIST, payload });

// system setting
export const SetStockStyle = (payload: StockStyle): Action<StockStyle> => ({ type: SET_STOCK_STYLE, payload });
export const SetLoading = (payload: boolean): Action<boolean> => ({ type: SET_LOADING, payload });

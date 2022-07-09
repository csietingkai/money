import { ExchangeRateQueryCondition } from 'view/investment/ExchangeRate';
import { FundQueryCondition } from 'view/investment/FundView';
import { StockQueryCondition } from 'view/investment/StockView';

import {
    SET_EXCHANGE_RATE_LIST, LOGIN, LOGOUT, SET_ACCOUNT_LIST, SET_STOCK_STYLE, SET_LOADING, SET_STOCK_TRACKING_LIST, SET_FUND_TRACKING_LIST,
    SET_EXCHANGE_RATE_QUERY_CONDITION, SET_FUND_QUERY_CONDITION, SET_STOCK_QUERY_CONDITION, SET_STOCK_LIST, SET_FUND_LIST, SET_STOCK_OWN_LIST, SET_FUND_OWN_LIST,
    SET_STOCK_PREDICT_RESULT, SET_FUND_PREDICT_RESULT, SET_PREDICT_DAYS, SET_ACCOUNT_RECORD_DELETABLE, SET_DEFAULT_MARKET_TYPE, SET_DEFAULT_RECORD_TYPE,
    SET_DEFAULT_ROLE, SET_MARKET_TYPES, SET_RECORD_TYPES, SET_ROLES, SET_EXCHANGE_RATE_DEFAULT_FOREIGNER_CURRENCY
} from 'reducer/ActionType';

import { Account } from 'api/account';
import { AuthToken } from 'api/auth';
import { ExchangeRateVo } from 'api/exchangeRate';
import { FundVo, UserFundVo, UserTrackingFundVo } from 'api/fund';
import { StockVo, UserStockVo, UserTrackingStockVo } from 'api/stock';

import { StockStyle } from 'util/Enum';
import { Action, PredictResultVo } from 'util/Interface';

// auth
export const Login = (payload: AuthToken): Action<AuthToken> => ({ type: LOGIN, payload });
export const Logout = (): Action<undefined> => ({ type: LOGOUT, payload: undefined });

// stock
export const SetStockList = (payload: StockVo[]): Action<StockVo[]> => ({ type: SET_STOCK_LIST, payload });
export const SetStockOwnList = (payload: UserStockVo[]): Action<UserStockVo[]> => ({ type: SET_STOCK_OWN_LIST, payload });
export const SetStockTrackingList = (payload: UserTrackingStockVo[]): Action<UserTrackingStockVo[]> => ({ type: SET_STOCK_TRACKING_LIST, payload });
export const SetStockQueryCondition = (payload: StockQueryCondition): Action<StockQueryCondition> => ({ type: SET_STOCK_QUERY_CONDITION, payload });
export const SetStockPredictResult = (payload: PredictResultVo[]): Action<PredictResultVo[]> => ({ type: SET_STOCK_PREDICT_RESULT, payload });

// fund
export const SetFundList = (payload: FundVo[]): Action<FundVo[]> => ({ type: SET_FUND_LIST, payload });
export const SetFundOwnList = (payload: UserFundVo[]): Action<UserFundVo[]> => ({ type: SET_FUND_OWN_LIST, payload });
export const SetFundTrackingList = (payload: UserTrackingFundVo[]): Action<UserTrackingFundVo[]> => ({ type: SET_FUND_TRACKING_LIST, payload });
export const SetFundQueryCondition = (payload: FundQueryCondition): Action<FundQueryCondition> => ({ type: SET_FUND_QUERY_CONDITION, payload });
export const SetFundPredictResult = (payload: PredictResultVo[]): Action<PredictResultVo[]> => ({ type: SET_FUND_PREDICT_RESULT, payload });

// exchange rate
export const SetExchangeRateList = (payload: ExchangeRateVo[]): Action<ExchangeRateVo[]> => ({ type: SET_EXCHANGE_RATE_LIST, payload });
export const SetExchangeRateQueryCondition = (payload: ExchangeRateQueryCondition): Action<ExchangeRateQueryCondition> => ({ type: SET_EXCHANGE_RATE_QUERY_CONDITION, payload });
export const SetExchangeRateDefaultForeignerCurrency = (payload: string): Action<string> => ({ type: SET_EXCHANGE_RATE_DEFAULT_FOREIGNER_CURRENCY, payload });

// account
export const SetAccountList = (payload: Account[]): Action<Account[]> => ({ type: SET_ACCOUNT_LIST, payload });

// system setting
export const SetStockStyle = (payload: StockStyle): Action<StockStyle> => ({ type: SET_STOCK_STYLE, payload });
export const SetPredictDays = (payload: number): Action<number> => ({ type: SET_PREDICT_DAYS, payload });
export const SetAccountRecordDeletable = (payload: boolean): Action<boolean> => ({ type: SET_ACCOUNT_RECORD_DELETABLE, payload });
export const SetLoading = (payload: boolean): Action<boolean> => ({ type: SET_LOADING, payload });
export const SetMarketTypes = (payload: string[]): Action<string[]> => ({ type: SET_MARKET_TYPES, payload });
export const SetDefaultMarketType = (payload: string): Action<string> => ({ type: SET_DEFAULT_MARKET_TYPE, payload });
export const SetRoles = (payload: string[]): Action<string[]> => ({ type: SET_ROLES, payload });
export const SetDefaultRole = (payload: string): Action<string> => ({ type: SET_DEFAULT_ROLE, payload });
export const SetRecordTypes = (payload: string[]): Action<string[]> => ({ type: SET_RECORD_TYPES, payload });
export const SetDefaultRecordType = (payload: string): Action<string> => ({ type: SET_DEFAULT_RECORD_TYPE, payload });

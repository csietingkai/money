import { SET_EXCHANGE_RATE_LIST, LOGIN, LOGOUT, SET_ACCOUNT_LIST, SET_STOCK_STYLE, SET_LOADING, SET_STOCK_TRACKING_LIST, SET_FUND_TRACKING_LIST } from 'reducer/ActionType';

import { Account } from 'api/account';
import { AuthToken } from 'api/auth';
import { ExchangeRate } from 'api/exchangeRate';
import { UserTrackingFundVo } from 'api/fund';
import { UserTrackingStockVo } from 'api/stock';

import { StockStyle } from 'util/Enum';
import { Action } from 'util/Interface';

// auth
export const Login = (payload: AuthToken): Action<AuthToken> => ({ type: LOGIN, payload });
export const Logout = (): Action<undefined> => ({ type: LOGOUT, payload: undefined });

// stock
export const SetStockTrackingList = (payload: UserTrackingStockVo[]): Action<UserTrackingStockVo[]> => ({ type: SET_STOCK_TRACKING_LIST, payload });

// fund
export const SetFundTrackingList = (payload: UserTrackingFundVo[]): Action<UserTrackingFundVo[]> => ({ type: SET_FUND_TRACKING_LIST, payload });

// exchange rate
export const SetExchangeRateList = (payload: ExchangeRate[]): Action<ExchangeRate[]> => ({ type: SET_EXCHANGE_RATE_LIST, payload });

// account
export const SetAccountList = (payload: Account[]): Action<Account[]> => ({ type: SET_ACCOUNT_LIST, payload });

// system setting
export const SetStockStyle = (payload: StockStyle): Action<StockStyle> => ({ type: SET_STOCK_STYLE, payload });
export const SetLoading = (payload: boolean): Action<boolean> => ({ type: SET_LOADING, payload });

import { SET_EXCHANGE_RATE_LIST, LOGIN, LOGOUT, SET_ACCOUNT_LIST } from 'reducer/ActionType';

import { AuthToken } from 'api/auth';

import { Action } from 'util/Interface';
import { ExchangeRate } from 'api/exchangeRate';
import { Account } from 'api/account';

// auth
export const Login = (payload: AuthToken): Action<AuthToken> => ({ type: LOGIN, payload });
export const Logout = (): Action<undefined> => ({ type: LOGOUT, payload: undefined });

// stock

// exchange rate
export const SetExchangeRateList = (payload: ExchangeRate[]): Action<ExchangeRate[]> => ({ type: SET_EXCHANGE_RATE_LIST, payload });

// account
export const SetAccountList = (payload: Account[]): Action<Account[]> => ({ type: SET_ACCOUNT_LIST, payload });

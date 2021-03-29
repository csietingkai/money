import { SET_EXCHANGE_RATE_LIST as SET_EXCHANGE_RATE_LIST, LOGIN, LOGOUT } from 'reducer/ActionType';

import { AuthToken } from 'api/auth';

import { Action } from 'util/Interface';
import { ExchangeRate } from 'api/exchangeRate';

// auth
export const Login = (payload: AuthToken): Action<AuthToken> => ({ type: LOGIN, payload });
export const Logout = (): Action<undefined> => ({ type: LOGOUT, payload: undefined });

// stock

// exchange rate
export const SetExchangeRateList = (payload: ExchangeRate[]): Action<ExchangeRate[]> => ({ type: SET_EXCHANGE_RATE_LIST, payload });

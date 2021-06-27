import { Dispatch } from 'react';

import { Login, Logout, SetAccountList, SetStockStyle } from 'reducer/Action';

import { Account } from 'api/account';
import { AuthToken } from 'api/auth';

import { StockStyle } from 'util/Enum';
import { Action } from 'util/Interface';

// auth
export const LoginDispatcher = (dispatch: Dispatch<Action<AuthToken>>) => (authToken: AuthToken): void => dispatch(Login(authToken));
export const LogoutDispatcher = (dispatch: Dispatch<Action<undefined>>) => (): void => dispatch(Logout());

// stock

// account
export const SetAccountListDispatcher = (dispatch: Dispatch<Action<Account[]>>) => (accounts: Account[]): void => dispatch(SetAccountList(accounts));

// system setting
export const SetStockStyleDispatcher = (dispatch: Dispatch<Action<StockStyle>>) => (style: StockStyle): void => dispatch(SetStockStyle(style));

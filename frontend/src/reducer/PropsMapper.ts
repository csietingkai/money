import { Login, Logout, SetAccountList, SetStockStyle } from 'reducer/Action';

import { Account } from 'api/account';
import { AuthToken } from 'api/auth';
import { StockStyle } from 'util/Enum';

// auth
export const LoginDispatcher = (dispatch: any) => (authToken: AuthToken) => dispatch(Login(authToken));
export const LogoutDispatcher = (dispatch: any) => () => dispatch(Logout());

// stock

// account
export const SetAccountListDispatcher = (dispatch: any) => (accounts: Account[]) => dispatch(SetAccountList(accounts));

// system setting
export const SetStockStyleDispatcher = (dispatch: any) => (style: StockStyle) => dispatch(SetStockStyle(style));

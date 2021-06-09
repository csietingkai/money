import { Login, Logout, SetAccountList } from 'reducer/Action';

import { Account } from 'api/account';
import { AuthToken } from 'api/auth';

export const LoginDispatcher = (dispatch: any) => (authToken: AuthToken) => dispatch(Login(authToken));

export const LogoutDispatcher = (dispatch: any) => () => dispatch(Logout());

export const SetAccountListDispatcher = (dispatch: any) => (accounts: Account[]) => dispatch(SetAccountList(accounts));

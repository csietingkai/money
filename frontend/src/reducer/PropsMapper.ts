import { Login, Logout } from 'reducer/Action';

import { AuthToken } from 'api/auth';

export const LoginDispatcher = (dispatch: any) => (authToken: AuthToken) => dispatch(Login(authToken));

export const LogoutDispatcher = (dispatch: any) => () => dispatch(Logout());

import { LOGIN, LOGOUT } from 'reducer/ActionType';

import { AuthToken } from 'api/auth';

import { Action } from 'util/Interface';

export const Login = (payload: AuthToken): Action<AuthToken> => ({ type: LOGIN, payload });

export const Logout = (): Action<undefined> => ({ type: LOGOUT, payload: undefined });

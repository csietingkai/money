import { Dispatch } from 'react';

import { Login, Logout, SetAccountList, SetFundTrackingList, SetLoading, SetStockStyle, SetStockTrackingList } from 'reducer/Action';

import { Account } from 'api/account';
import { AuthToken } from 'api/auth';
import { UserTrackingStockVo } from 'api/stock';

import { StockStyle } from 'util/Enum';
import { Action } from 'util/Interface';
import { UserTrackingFundVo } from 'api/fund';

// auth
export const LoginDispatcher = (dispatch: Dispatch<Action<AuthToken>>) => (authToken: AuthToken): void => dispatch(Login(authToken));
export const LogoutDispatcher = (dispatch: Dispatch<Action<undefined>>) => (): void => dispatch(Logout());

// stock
export const SetStockTrackingListDispatcher = (dispatch: Dispatch<Action<UserTrackingStockVo[]>>) => (stocks: UserTrackingStockVo[]): void => dispatch(SetStockTrackingList(stocks));

// fund
export const SetFundTrackingListDispatcher = (dispatch: Dispatch<Action<UserTrackingFundVo[]>>) => (funds: UserTrackingFundVo[]): void => dispatch(SetFundTrackingList(funds));

// account
export const SetAccountListDispatcher = (dispatch: Dispatch<Action<Account[]>>) => (accounts: Account[]): void => dispatch(SetAccountList(accounts));

// system setting
export const SetStockStyleDispatcher = (dispatch: Dispatch<Action<StockStyle>>) => (style: StockStyle): void => dispatch(SetStockStyle(style));
export const SetLoadingDispatcher = (dispatch: Dispatch<Action<boolean>>) => (loading: boolean): void => dispatch(SetLoading(loading));

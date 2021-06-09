import { Account } from 'api/account';
import { AuthToken, Role } from 'api/auth';
import { ExchangeRate } from 'api/exchangeRate';

// authReducer
const getAuthState = (state: any): any => state.auth;
export const getAuthToken = (state: any): AuthToken => getAuthState(state)?.authToken;
export const getAuthTokenName = (state: any): string => getAuthToken(state)?.name;
export const getAuthTokenRole = (state: any): Role => getAuthToken(state)?.role;
export const getAuthTokenString = (state: any): string => getAuthToken(state)?.tokenString;
export const getAuthTokenExpiryDate = (state: any): Date => getAuthToken(state)?.expiryDate;

// stockReducer
const getStockState = (state: any): any => state.stock;
export const getStockTrackingList = (state: any): any[] => [];

// exchangeReducer
const getExchangeRateState = (state: any): any => state.exchangeRate;
export const getExchangeRateList = (state: any): ExchangeRate[] => getExchangeRateState(state)?.list;

// accountReducer
const getAccountState = (state: any): any => state.account;
export const getAccountList = (state: any): Account[] => getAccountState(state)?.list;

import { AuthToken } from 'api/auth';

import { Role } from 'util/Enum';

// authReducer
export const getAuthToken = (state: any): AuthToken => state.auth.authToken;
export const getAuthTokenName = (state: any): string => getAuthToken(state).name;
export const getAuthTokenRole = (state: any): Role => getAuthToken(state).role;
export const getAuthTokenString = (state: any): string => getAuthToken(state).tokenString;
export const getAuthTokenExpiryDate = (state: any): Date => getAuthToken(state).expiryDate;

// stockReducer

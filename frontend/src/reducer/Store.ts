import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';

import { Login, Logout, SetExchangeRateList } from 'reducer/Action';
import { getAuthToken, getAuthTokenString, getExchangeRateList } from 'reducer/Selector';
import rootReducer from 'reducer/Reducer';

import AuthApi, { AuthResponse, AuthToken } from 'api/auth';
import ExchangeRateApi, { ExchangeRate, ExchangeRateListResponse } from 'api/exchangeRate';

import { isArrayEmpty } from 'util/AppUtil';

export const validateToken = (dispatch: any, getState: () => any) => {
    const tokenString: string = getAuthTokenString(getState());
    if (tokenString) {
        AuthApi.validate(tokenString).then((response: AuthResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(Login(data));
            } else {
                dispatch(Logout());
            }
        }).catch(error => {
            console.error(error);
            dispatch(Logout());
        });
    } else {
        dispatch(Logout());
    }
};

export const fetchExchangeRateList = (dispatch: any, getState: () => ExchangeRate[]) => {
    const tokenString: string = getAuthTokenString(getState());
    const exchangeRateList: ExchangeRate[] = getExchangeRateList(getState());
    if (tokenString && isArrayEmpty(exchangeRateList)) {
        ExchangeRateApi.getAll().then((response: ExchangeRateListResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(SetExchangeRateList(data));
            } else {
                dispatch(SetExchangeRateList([]));
            }
        });
    }
};

const store = createStore<any, any, any, any>(rootReducer, applyMiddleware(thunkMiddleware));

export default store;

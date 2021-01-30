import { applyMiddleware, createStore } from 'redux';
import thunkMiddleware from 'redux-thunk';

import { Login, Logout } from 'reducer/Action';
import { getAuthToken, getAuthTokenString } from 'reducer/Selector';
import rootReducer from 'reducer/Reducer';

import AuthApi, { AuthResponse, AuthToken } from 'api/auth';

import { SystemState } from 'util/Interface';

export const validateToken = (dispatch: any, getState: () => SystemState) => {
    const authToken: AuthToken = getAuthToken(getState());
    const tokenString: string = authToken ? authToken.tokenString : '';
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

const store = createStore<any, any, any, any>(rootReducer, applyMiddleware(thunkMiddleware));

export default store;

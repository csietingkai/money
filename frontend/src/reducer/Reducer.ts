import { combineReducers } from 'redux';

import { LOGIN, LOGOUT } from 'reducer/ActionType';
import { getAuthToken, setAuthToken, removeAuthToken } from 'reducer/StateHolder';

import { AuthToken } from 'api/auth';

import { Action, SystemState } from 'util/Interface';

const initialState: SystemState = {
    authToken: getAuthToken()
};

const authReducer = (state: SystemState = initialState, action: Action<AuthToken>): any => {
    const newState: SystemState = { ...state };
    const { type, payload } = action;
    if (type === LOGIN) {
        setAuthToken(payload);
        newState.authToken = getAuthToken();
    } else if (type === LOGOUT) {
        removeAuthToken();
        newState.authToken = undefined;
    }
    return newState;
};

const reducers = [
    { key: 'auth', reducer: authReducer }
];

export default combineReducers(reducers.reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.reducer;
    return acc;
}, {}));

import { Dispatch, legacy_createStore as createStore } from 'redux';
import rootReducer from './Reducer';
import * as AppUtil from '../util/AppUtil';
import AccountApi, { Account, AccountListResponse } from '../api/account';
import AuthApi, { AuthResponse, AuthToken, LoginRespVo } from '../api/auth';
import OptionApi, { OptionResponse } from '../api/option';
import FundApi, { UserFundListResponse } from '../api/fund';
import StockApi, { UserStockListResponse } from '../api/stock';
import { Login, Logout, SetAccountList, SetCurrencyOptions, SetFileTypeOptions, SetLoading, SetOwnFundList, SetOwnStockList, SetRecordTypeOptions, SetStockTypeOptions } from './Action';
import { ReduxState, getAuthTokenString, getAccountList, getCurrencies, getFileTypes, getStockTypes, getRecordTypes, getAuthTokenId } from './Selector';
import { Action, ApiResponse, Option } from '../util/Interface';
import { getAuthToken } from './StateHolder';

export const validateToken = (dispatch: Dispatch<Action<LoginRespVo | undefined>>, getState: () => ReduxState): void => {
    const tokenString: string | undefined = getAuthToken()?.tokenString;
    if (tokenString) {
        AuthApi.validate(tokenString).then((response: AuthResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(Login(data));
                init(dispatch, getState);
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

export const init = (dispatch: Dispatch<Action<any>>, getState: () => ReduxState): void => {
    const apis: any[] = [];
    const responseHandlers: ((response: ApiResponse<any>) => void)[] = [];

    const tokenString: string = getAuthTokenString(getState());

    const currencies: Option[] = getCurrencies(getState());
    if (tokenString && AppUtil.isArrayEmpty(currencies)) {
        apis.push(OptionApi.getCurrencies());
        responseHandlers.push((response: OptionResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(SetCurrencyOptions(data));
            } else {
                dispatch(SetCurrencyOptions([]));
            }
        });
    }

    const fileTypes: Option[] = getFileTypes(getState());
    if (tokenString && AppUtil.isArrayEmpty(fileTypes)) {
        apis.push(OptionApi.getFileTypes());
        responseHandlers.push((response: OptionResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(SetFileTypeOptions(data));
            } else {
                dispatch(SetFileTypeOptions([]));
            }
        });
    }

    const stockTypes: Option[] = getStockTypes(getState());
    if (tokenString && AppUtil.isArrayEmpty(stockTypes)) {
        apis.push(OptionApi.getStockTypes());
        responseHandlers.push((response: OptionResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(SetStockTypeOptions(data));
            } else {
                dispatch(SetStockTypeOptions([]));
            }
        });
    }

    const recordTypes: Option[] = getRecordTypes(getState());
    if (tokenString && AppUtil.isArrayEmpty(recordTypes)) {
        apis.push(OptionApi.getRecordTypes());
        responseHandlers.push((response: OptionResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(SetRecordTypeOptions(data));
            } else {
                dispatch(SetRecordTypeOptions([]));
            }
        });
    }

    if (tokenString) {
        apis.push(AccountApi.getAccounts(getAuthTokenId(getState())));
        responseHandlers.push((response: AccountListResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(SetAccountList(data));
            } else {
                dispatch(SetAccountList([]));
            }
        });
    }

    if (tokenString) {
        apis.push(StockApi.getOwn());
        responseHandlers.push((response: UserStockListResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(SetOwnStockList(data));
            } else {
                dispatch(SetOwnStockList([]));
            }
        });
    }

    if (tokenString) {
        apis.push(FundApi.getOwn());
        responseHandlers.push((response: UserFundListResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(SetOwnFundList(data));
            } else {
                dispatch(SetOwnFundList([]));
            }
        });
    }

    Promise.all(apis).then((responses: ApiResponse<any>[]) => {
        responses.forEach((x, i) => responseHandlers[i](x));
    });
};

const store = createStore<any, any>(rootReducer);
export default store;

import { Dispatch, legacy_createStore as createStore } from 'redux';
import rootReducer from './Reducer';
import * as AppUtil from '../util/AppUtil';
import AccountApi, { AccountListResponse } from '../api/account';
import AuthApi, { AuthResponse, AuthToken, UserResponse } from '../api/auth';
import BankInfoApi, { BankInfo, BankInfoListResponse } from '../api/bankInfo';
import ExchangeRateApi, { ExchangeRateListResponse } from '../api/exchangeRate';
import OptionApi, { OptionResponse } from '../api/option';
import FundApi, { UserFundListResponse } from '../api/fund';
import StockApi, { UserStockListResponse } from '../api/stock';
import { Login, Logout, SetAccountList, SetBankInfoList, SetExchangeRates, SetFileTypeOptions, SetIsMobile, SetOwnFundList, SetOwnStockList, SetRecordTypeOptions, SetStockTypeOptions, SetUserSetting } from './Action';
import { ReduxState, getAuthTokenString, getCurrencies, getFileTypes, getStockTypes, getRecordTypes, getBankInfoList } from './Selector';
import { Action, ApiResponse, Option } from '../util/Interface';
import { getAuthToken } from './StateHolder';

export const validateToken = (dispatch: Dispatch<Action<AuthToken | undefined>>, getState: () => ReduxState): void => {
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
    dispatch(SetIsMobile(navigator.userAgent.indexOf('Android') != -1))

    const apis: any[] = [];
    const responseHandlers: ((response: ApiResponse<any>) => void)[] = [];

    const tokenString: string = getAuthTokenString(getState());

    if (tokenString) {
        apis.push(AuthApi.getUserSetting());
        responseHandlers.push((response: UserResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(SetUserSetting(data));
            } else {
                dispatch(SetUserSetting(undefined));
            }
        });
    }

    const currencies: Option[] = getCurrencies(getState());
    if (tokenString && AppUtil.isArrayEmpty(currencies)) {
        apis.push(ExchangeRateApi.getAll());
        responseHandlers.push((response: ExchangeRateListResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(SetExchangeRates(data));
            } else {
                dispatch(SetExchangeRates([]));
            }
        });
    }

    const bankInfos: BankInfo[] = getBankInfoList(getState());
    if (tokenString && AppUtil.isArrayEmpty(bankInfos)) {
        apis.push(BankInfoApi.getAll());
        responseHandlers.push((response: BankInfoListResponse) => {
            const { success, data } = response;
            if (success) {
                dispatch(SetBankInfoList(data));
            } else {
                dispatch(SetBankInfoList([]));
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
        apis.push(AccountApi.getAccounts());
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

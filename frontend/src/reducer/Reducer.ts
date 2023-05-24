import axios from 'axios';
import { combineReducers } from 'redux';

import { ExchangeRateQueryCondition } from 'view/investment/ExchangeRate';

import {
    SET_EXCHANGE_RATE_LIST, LOGIN, LOGOUT, SET_ACCOUNT_LIST, SET_STOCK_STYLE, SET_STOCK_TRACKING_LIST, SET_LOADING, SET_FUND_TRACKING_LIST,
    SET_EXCHANGE_RATE_QUERY_CONDITION, SET_FUND_QUERY_CONDITION, SET_STOCK_QUERY_CONDITION, SET_STOCK_LIST, SET_FUND_LIST, SET_STOCK_OWN_LIST,
    SET_FUND_OWN_LIST, SET_STOCK_PREDICT_RESULT, SET_FUND_PREDICT_RESULT, SET_PREDICT_DAYS, SET_ACCOUNT_RECORD_DELETABLE, SET_DEFAULT_RECORD_TYPE,
    SET_DEFAULT_ROLE, SET_RECORD_TYPES, SET_ROLES, SET_EXCHANGE_RATE_DEFAULT_FOREIGNER_CURRENCY
} from 'reducer/ActionType';
import {
    DEFAULT_REDUX_ACCOUNT_STATE, DEFAULT_REDUX_AUTH_STATE, DEFAULT_REDUX_EXCHANGE_RATE_STATE, DEFAULT_REDUX_FUND_STATE, DEFAULT_REDUX_STOCK_STATE,
    DEFAULT_REDUX_SYSTEM_SETTING_STATE, ReduxAccountState, ReduxAuthState, ReduxExchangeRateState, ReduxFundState, ReduxStockState, ReduxSystemSettingState
} from 'reducer/Selector';
import { getAuthToken, setAuthToken, removeAuthToken, setStockStyle, setPredictDays, setAccountRecordDeletable, setDefaultRole, setDefaultRecordType, setDefaultForeignerCurrency } from 'reducer/StateHolder';

import { Account } from 'api/account';
import { AuthToken } from 'api/auth';
import { ExchangeRateVo } from 'api/exchangeRate';
import { FundVo, UserFundVo, UserTrackingFundVo } from 'api/fund';
import { StockVo, UserStockVo, UserTrackingStockVo } from 'api/stock';

import { Action, PredictResultVo } from 'util/Interface';
import { StockStyle } from 'util/Enum';
import { FundQueryCondition } from 'view/investment/FundView';
import { StockQueryCondition } from 'view/investment/StockView';

const authReducer = (state: ReduxAuthState = DEFAULT_REDUX_AUTH_STATE, action: Action<AuthToken>): ReduxAuthState => {
    const newState: ReduxAuthState = { ...state };
    const { type, payload } = action;
    if (type === LOGIN) {
        setAuthToken(payload);
        newState.authToken = getAuthToken();
        axios.defaults.headers = { 'X-Auth-Token': getAuthToken()?.tokenString };
        const { href } = window.location;
        if (href.indexOf('login') >= 0 || href.indexOf('register') >= 0) {
            window.location.replace('/#/dashboard');
        }
    } else if (type === LOGOUT) {
        removeAuthToken();
        newState.authToken = undefined;
        window.location.replace('/#/login');
    }
    return newState;
};

const stockReducer = (state: ReduxStockState = DEFAULT_REDUX_STOCK_STATE, action: Action<StockVo[] | UserStockVo[] | UserTrackingStockVo[] | StockQueryCondition | PredictResultVo[]>): ReduxStockState => {
    const newState: ReduxStockState = { ...state };
    const { type, payload } = action;
    if (type === SET_STOCK_LIST) {
        newState.list = payload as StockVo[];
    } else if (type === SET_STOCK_OWN_LIST) {
        newState.own = payload as UserStockVo[];
    } else if (type === SET_STOCK_TRACKING_LIST) {
        newState.tracking = payload as UserTrackingStockVo[];
    } else if (type === SET_STOCK_QUERY_CONDITION) {
        newState.condition = payload as StockQueryCondition;
    } else if (type === SET_STOCK_PREDICT_RESULT) {
        newState.predict = payload as PredictResultVo[];
    }
    return newState;
};

const fundReducer = (state: ReduxFundState = DEFAULT_REDUX_FUND_STATE, action: Action<FundVo[] | UserFundVo[] | UserTrackingFundVo[] | FundQueryCondition | PredictResultVo[]>): ReduxFundState => {
    const newState: ReduxFundState = { ...state };
    const { type, payload } = action;
    if (type === SET_FUND_LIST) {
        newState.list = payload as FundVo[];
    } else if (type === SET_FUND_OWN_LIST) {
        newState.own = payload as UserFundVo[];
    } else if (type === SET_FUND_TRACKING_LIST) {
        newState.tracking = payload as UserTrackingFundVo[];
    } else if (type === SET_FUND_QUERY_CONDITION) {
        newState.condition = payload as FundQueryCondition;
    } else if (type === SET_FUND_PREDICT_RESULT) {
        newState.predict = payload as PredictResultVo[];
    }
    return newState;
};

const exchangeRateReducer = (state: ReduxExchangeRateState = DEFAULT_REDUX_EXCHANGE_RATE_STATE, action: Action<ExchangeRateVo[] | ExchangeRateQueryCondition | string>): ReduxExchangeRateState => {
    const newState: ReduxExchangeRateState = { ...state };
    const { type, payload } = action;
    if (type === SET_EXCHANGE_RATE_LIST) {
        newState.list = payload as ExchangeRateVo[];
    } else if (type === SET_EXCHANGE_RATE_QUERY_CONDITION) {
        newState.condition = payload as ExchangeRateQueryCondition;
    } else if (type === SET_EXCHANGE_RATE_DEFAULT_FOREIGNER_CURRENCY) {
        setDefaultForeignerCurrency(payload as string);
        newState.defaultForeignerCurrency = payload as string;
    }
    return newState;
};

const accountReducer = (state: ReduxAccountState = DEFAULT_REDUX_ACCOUNT_STATE, action: Action<Account[]>): ReduxAccountState => {
    const newState: ReduxAccountState = { ...state };
    const { type, payload } = action;
    if (type === SET_ACCOUNT_LIST) {
        newState.list = payload;
    }
    return newState;
};

const systemReducer = (state: ReduxSystemSettingState = DEFAULT_REDUX_SYSTEM_SETTING_STATE, action: Action<StockStyle | number | boolean | string[] | string>): ReduxSystemSettingState => {
    const newState: ReduxSystemSettingState = { ...state };
    const { type, payload } = action;
    if (type === SET_STOCK_STYLE) {
        setStockStyle(payload as StockStyle);
        newState.stockStyle = payload as StockStyle;
    } else if (type === SET_PREDICT_DAYS) {
        setPredictDays(payload as number);
        newState.predictDays = payload as number;
    } else if (type === SET_ACCOUNT_RECORD_DELETABLE) {
        setAccountRecordDeletable(payload as boolean);
        newState.accountRecordDeletable = payload as boolean;
    } else if (type === SET_LOADING) {
        newState.loading = payload as boolean;
    } else if (type === SET_ROLES) {
        newState.roles = payload as string[];
    } else if (type === SET_DEFAULT_ROLE) {
        setDefaultRole(payload as string);
        newState.defaultRole = payload as string;
    } else if (type === SET_RECORD_TYPES) {
        newState.recordTypes = payload as string[];
    } else if (type === SET_DEFAULT_RECORD_TYPE) {
        setDefaultRecordType(payload as string);
        newState.defaultRecordType = payload as string;
    }
    return newState;
};

const reducers = [
    { key: 'auth', reducer: authReducer },
    { key: 'stock', reducer: stockReducer },
    { key: 'fund', reducer: fundReducer },
    { key: 'exchangeRate', reducer: exchangeRateReducer },
    { key: 'account', reducer: accountReducer },
    { key: 'setting', reducer: systemReducer }
];

export default combineReducers(reducers.reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.reducer;
    return acc;
}, {}));

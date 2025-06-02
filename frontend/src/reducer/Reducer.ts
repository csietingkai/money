import { combineReducers } from 'redux';
import axios from 'axios';
import { AuthToken, UserSetting } from '../api/auth';
import { Account } from '../api/account';
import { UserStockVo } from '../api/stock';
import { UserFundVo } from '../api/fund';
import { ExchangeRateVo } from '../api/exchangeRate';
import { DEFAULT_REDUX_ACCOUNT_STATE, DEFAULT_REDUX_AUTH_STATE, DEFAULT_REDUX_BANK_INFO_STATE, DEFAULT_REDUX_EXCHANGE_RATE_STATE, DEFAULT_REDUX_FUND_STATE, DEFAULT_REDUX_OPTION_STATE, DEFAULT_REDUX_STOCK_STATE, DEFAULT_REDUX_SYSTEM_SETTING_STATE, ReduxAccountState, ReduxAuthState, ReduxBankInfoState, ReduxExchangeRateState, ReduxFundState, ReduxOptionState, ReduxStockState, ReduxSystemSettingState } from './Selector';
import { LOGIN, LOGOUT, SET_ACCOUNT_LIST, SET_LOADING, NOTIFY, SET_SIDEBAR_FOLDABLE, SET_SIDEBAR_SHOW, SET_USER_SETTING, SET_FILE_TYPE_OPTIONS, SET_RECORD_TYPE_OPTIONS, SET_STOCK_TYPE_OPTIONS, SET_OWN_STOCK_LIST, SET_STOCK_QUERY_CONDITION, SET_STOCK_TRADE_CONDITION, SET_OWN_FUND_LIST, SET_FUND_QUERY_CONDITION, SET_FUND_TRADE_CONDITION, SET_IS_MOBILE, SET_EXCHANGE_RATES, SET_EXCHANGE_RATE_QUERY_CONDITION, SET_EXCHANGE_RATE_TRADE_CONDITION, SET_BANK_INFO_LIST, SET_ACCOUNT_RECORD_QUERY_CONDITION } from './ActionType';
import { removeAuthToken, setAuthToken, setLang, setSidebarFoldable, setSidebarShow } from './StateHolder';
import { Action, Lang, Option } from '../util/Interface';
import StockQueryCondition from '../views/stock/interface/StockQueryCondition';
import StockTradeCondition from '../views/stock/interface/StockTradeCondition';
import FundQueryCondition from '../views/fund/interface/FundQueryCondition';
import FundTradeCondition from '../views/fund/interface/FundTradeCondition';
import ExchangeRateQueryCondition from '../views/exchangeRate/interface/ExchangeRateQueryCondition';
import ExchangeRateTradeCondition from '../views/exchangeRate/interface/ExchangeRateTradeCondition';
import { BankInfo } from '../api/bankInfo';
import AccountRecordQueryCondition from '../views/account/interface/AccountRecordQueryCondition';

const authReducer = (state: ReduxAuthState = DEFAULT_REDUX_AUTH_STATE, action: Action<AuthToken | UserSetting>): ReduxAuthState => {
    const newState: ReduxAuthState = { ...state };
    const { type, payload } = action;
    if (type === LOGIN) {
        if (payload) {
            const authToken = payload as AuthToken;;
            setAuthToken(authToken);
            newState.authToken = authToken;
            axios.defaults.headers['X-Auth-Token'] = authToken.tokenString;
            const { href } = window.location;
            if (href.indexOf('login') >= 0) {
                window.location.replace('/#/dashboard');
            }
        } else {
            removeAuthToken();
            newState.authToken = undefined;
            newState.userSetting = undefined;
            window.location.replace('/#/login');
        }
    } else if (type === LOGOUT) {
        removeAuthToken();
        newState.authToken = undefined;
        window.location.replace('/#/login');
    } else if (type === SET_USER_SETTING) {
        newState.userSetting = payload as UserSetting;
        if (newState.userSetting) {
            setLang(newState.userSetting.lang);
        }
    }
    return newState;
};

const accountReducer = (state: ReduxAccountState = DEFAULT_REDUX_ACCOUNT_STATE, action: Action<Account[] | AccountRecordQueryCondition>): ReduxAccountState => {
    const newState: ReduxAccountState = { ...state };
    const { type, payload } = action;
    if (type === SET_ACCOUNT_LIST) {
        newState.list = payload as Account[];
    } else if (type === SET_ACCOUNT_RECORD_QUERY_CONDITION) {
        newState.queryCondition = payload as AccountRecordQueryCondition;
    }
    return newState;
};

const bankInfoReducer = (state: ReduxBankInfoState = DEFAULT_REDUX_BANK_INFO_STATE, action: Action<BankInfo[]>): ReduxBankInfoState => {
    const newState: ReduxBankInfoState = { ...state };
    const { type, payload } = action;
    if (type === SET_BANK_INFO_LIST) {
        newState.list = payload;
    }
    return newState;
};

const stockReducer = (state: ReduxStockState = DEFAULT_REDUX_STOCK_STATE, action: Action<UserStockVo[] | StockQueryCondition | StockTradeCondition | undefined>): ReduxStockState => {
    const newState: ReduxStockState = { ...state };
    const { type, payload } = action;
    if (type === SET_OWN_STOCK_LIST) {
        newState.own = payload as UserStockVo[];
    } else if (type === SET_STOCK_QUERY_CONDITION) {
        newState.queryCondition = payload as StockQueryCondition;
    } else if (type === SET_STOCK_TRADE_CONDITION) {
        if (payload) {
            newState.tradeCondition = payload as StockTradeCondition;
        } else {
            newState.tradeCondition = undefined;
        }
    }
    return newState;
};

const fundReducer = (state: ReduxFundState = DEFAULT_REDUX_FUND_STATE, action: Action<UserFundVo[] | FundQueryCondition | FundTradeCondition | undefined>): ReduxFundState => {
    const newState: ReduxFundState = { ...state };
    const { type, payload } = action;
    if (type === SET_OWN_FUND_LIST) {
        newState.own = payload as UserFundVo[];
    } else if (type === SET_FUND_QUERY_CONDITION) {
        newState.queryCondition = payload as FundQueryCondition;
    } else if (type === SET_FUND_TRADE_CONDITION) {
        if (payload) {
            newState.tradeCondition = payload as FundTradeCondition;
        } else {
            newState.tradeCondition = undefined;
        }
    }
    return newState;
};

const exchangeRateReducer = (state: ReduxExchangeRateState = DEFAULT_REDUX_EXCHANGE_RATE_STATE, action: Action<ExchangeRateVo[] | ExchangeRateQueryCondition | ExchangeRateTradeCondition | undefined>): ReduxExchangeRateState => {
    const newState: ReduxExchangeRateState = { ...state };
    const { type, payload } = action;
    if (type === SET_EXCHANGE_RATES) {
        newState.exchangeRates = payload as ExchangeRateVo[];
    } else if (type === SET_EXCHANGE_RATE_QUERY_CONDITION) {
        newState.queryCondition = payload as ExchangeRateQueryCondition;
    } else if (type === SET_EXCHANGE_RATE_TRADE_CONDITION) {
        if (payload) {
            newState.tradeCondition = payload as ExchangeRateTradeCondition;
        } else {
            newState.tradeCondition = undefined;
        }
    }
    return newState;
};

const optionReducer = (state: ReduxOptionState = DEFAULT_REDUX_OPTION_STATE, action: Action<Option[]>): ReduxOptionState => {
    const newState: ReduxOptionState = { ...state };
    const { type, payload } = action;
    if (type === SET_FILE_TYPE_OPTIONS) {
        newState.fileTypes = payload;
    } else if (type === SET_STOCK_TYPE_OPTIONS) {
        newState.stockTypes = payload;
    } else if (type === SET_RECORD_TYPE_OPTIONS) {
        newState.recordTypes = payload;
    }
    return newState;
};

const systemReducer = (state: ReduxSystemSettingState = DEFAULT_REDUX_SYSTEM_SETTING_STATE, action: Action<boolean | string>): ReduxSystemSettingState => {
    const newState: ReduxSystemSettingState = { ...state };
    const { type, payload } = action;
    if (type === SET_LOADING) {
        newState.loading = payload as boolean;
    } else if (type === SET_SIDEBAR_SHOW) {
        newState.sidebarShow = payload as boolean;
        setSidebarShow(newState.sidebarShow);
    } else if (type === SET_SIDEBAR_FOLDABLE) {
        newState.sidebarFoldable = payload as boolean;
        setSidebarFoldable(newState.sidebarFoldable);
    } else if (type === NOTIFY) {
        const now: number = new Date().getTime();
        newState.notifications = [...newState.notifications, { time: now, message: payload as string }].filter(x => now - x.time <= 30000);
    } else if (type === SET_IS_MOBILE) {
        newState.isMobile = payload as boolean;
    }
    return newState;
};

const reducers = [
    { key: 'auth', reducer: authReducer },
    { key: 'account', reducer: accountReducer },
    { key: 'bankInfo', reducer: bankInfoReducer },
    { key: 'stock', reducer: stockReducer },
    { key: 'fund', reducer: fundReducer },
    { key: 'exchangeRate', reducer: exchangeRateReducer },
    { key: 'option', reducer: optionReducer },
    { key: 'setting', reducer: systemReducer }
];

export default combineReducers(reducers.reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.reducer;
    return acc;
}, {}));

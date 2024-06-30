import { combineReducers } from 'redux';
import axios from 'axios';
import { AuthToken, LoginRespVo, UserSetting } from '../api/auth';
import { Account } from '../api/account';
import { DEFAULT_REDUX_ACCOUNT_STATE, DEFAULT_REDUX_AUTH_STATE, DEFAULT_REDUX_FUND_STATE, DEFAULT_REDUX_OPTION_STATE, DEFAULT_REDUX_STOCK_STATE, DEFAULT_REDUX_SYSTEM_SETTING_STATE, ReduxAccountState, ReduxAuthState, ReduxFundState, ReduxOptionState, ReduxStockState, ReduxSystemSettingState } from './Selector';
import { LOGIN, LOGOUT, SET_ACCOUNT_LIST, SET_LOADING, NOTIFY, SET_SIDEBAR_FOLDABLE, SET_SIDEBAR_SHOW, SET_USER_SETTING, SET_CURRENCY_OPTIONS, SET_FILE_TYPE_OPTIONS, SET_RECORD_TYPE_OPTIONS, SET_STOCK_TYPE_OPTIONS, SET_OWN_STOCK_LIST, SET_STOCK_QUERY_CONDITION, SET_STOCK_TRADE_CONDITION, SET_OWN_FUND_LIST, SET_FUND_QUERY_CONDITION, SET_FUND_TRADE_CONDITION } from './ActionType';
import { removeAuthToken, setAuthToken, setSidebarFoldable, setSidebarShow } from './StateHolder';
import { Action, Option } from '../util/Interface';
import { UserStockVo } from '../api/stock';
import StockQueryCondition from '../views/stock/interface/StockQueryCondition';
import StockTradeCondition from '../views/stock/interface/StockTradeCondition';
import { UserFundVo } from '../api/fund';
import FundQueryCondition from '../views/fund/interface/FundQueryCondition';
import FundTradeCondition from '../views/fund/interface/FundTradeCondition';

const authReducer = (state: ReduxAuthState = DEFAULT_REDUX_AUTH_STATE, action: Action<LoginRespVo | AuthToken | UserSetting>): ReduxAuthState => {
    const newState: ReduxAuthState = { ...state };
    const { type, payload } = action;
    if (type === LOGIN) {
        if (payload) {
            const { authToken, setting } = payload as LoginRespVo;
            setAuthToken(authToken);
            newState.authToken = authToken;
            newState.userSetting = setting;
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

const optionReducer = (state: ReduxOptionState = DEFAULT_REDUX_OPTION_STATE, action: Action<Option[]>): ReduxOptionState => {
    const newState: ReduxOptionState = { ...state };
    const { type, payload } = action;
    if (type === SET_CURRENCY_OPTIONS) {
        newState.currencies = payload;
    } else if (type === SET_FILE_TYPE_OPTIONS) {
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
    }
    return newState;
};

const reducers = [
    { key: 'auth', reducer: authReducer },
    { key: 'account', reducer: accountReducer },
    { key: 'stock', reducer: stockReducer },
    { key: 'fund', reducer: fundReducer },
    { key: 'option', reducer: optionReducer },
    { key: 'setting', reducer: systemReducer }
];

export default combineReducers(reducers.reduce((acc: any, curr: any) => {
    acc[curr.key] = curr.reducer;
    return acc;
}, {}));

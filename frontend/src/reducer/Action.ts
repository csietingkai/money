
import { LOGIN, LOGOUT, SET_ACCOUNT_LIST, SET_LOADING, NOTIFY, SET_SIDEBAR_FOLDABLE, SET_SIDEBAR_SHOW, SET_USER_SETTING, SET_FILE_TYPE_OPTIONS, SET_RECORD_TYPE_OPTIONS, SET_STOCK_TYPE_OPTIONS, SET_OWN_STOCK_LIST, SET_STOCK_TRADE_CONDITION, SET_STOCK_QUERY_CONDITION, SET_FUND_QUERY_CONDITION, SET_FUND_TRADE_CONDITION, SET_OWN_FUND_LIST, SET_IS_MOBILE, SET_EXCHANGE_RATE_QUERY_CONDITION, SET_EXCHANGE_RATE_TRADE_CONDITION, SET_EXCHANGE_RATES, SET_BANK_INFO_LIST } from './ActionType';
import { AuthToken, UserSetting } from '../api/auth';
import { Account } from '../api/account';
import { Action, Option } from '../util/Interface';
import { ExchangeRateVo } from '../api/exchangeRate';
import { UserStockVo } from '../api/stock';
import { UserFundVo } from '../api/fund';
import StockQueryCondition from '../views/stock/interface/StockQueryCondition';
import StockTradeCondition from '../views/stock/interface/StockTradeCondition';
import FundQueryCondition from '../views/fund/interface/FundQueryCondition';
import FundTradeCondition from '../views/fund/interface/FundTradeCondition';
import ExchangeRateQueryCondition from '../views/exchangeRate/interface/ExchangeRateQueryCondition';
import ExchangeRateTradeCondition from '../views/exchangeRate/interface/ExchangeRateTradeCondition';
import { BankInfo } from '../api/bankInfo';

// auth
export const Login = (payload: AuthToken): Action<AuthToken> => ({ type: LOGIN, payload });
export const Logout = (): Action<undefined> => ({ type: LOGOUT, payload: undefined });
export const SetUserSetting = (payload?: UserSetting): Action<UserSetting | undefined> => ({ type: SET_USER_SETTING, payload });

// account
export const SetAccountList = (payload: Account[]): Action<Account[]> => ({ type: SET_ACCOUNT_LIST, payload });

// bank info
export const SetBankInfoList = (payload: BankInfo[]): Action<BankInfo[]> => ({ type: SET_BANK_INFO_LIST, payload });

// stock
export const SetOwnStockList = (payload: UserStockVo[]): Action<UserStockVo[]> => ({ type: SET_OWN_STOCK_LIST, payload });
export const SetStockQueryCondition = (payload: StockQueryCondition): Action<StockQueryCondition> => ({ type: SET_STOCK_QUERY_CONDITION, payload });
export const SetStockTradeCondition = (payload?: StockTradeCondition): Action<StockTradeCondition | undefined> => ({ type: SET_STOCK_TRADE_CONDITION, payload });

// fund
export const SetOwnFundList = (payload: UserFundVo[]): Action<UserFundVo[]> => ({ type: SET_OWN_FUND_LIST, payload });
export const SetFundQueryCondition = (payload: FundQueryCondition): Action<FundQueryCondition> => ({ type: SET_FUND_QUERY_CONDITION, payload });
export const SetFundTradeCondition = (payload?: FundTradeCondition): Action<FundTradeCondition | undefined> => ({ type: SET_FUND_TRADE_CONDITION, payload });

// currency
export const SetExchangeRates = (payload: ExchangeRateVo[]): Action<ExchangeRateVo[]> => ({ type: SET_EXCHANGE_RATES, payload });
export const SetExchangeRateQueryCondition = (payload: ExchangeRateQueryCondition): Action<ExchangeRateQueryCondition> => ({ type: SET_EXCHANGE_RATE_QUERY_CONDITION, payload });
export const SetExchangeRateTradeCondition = (payload?: ExchangeRateTradeCondition): Action<ExchangeRateTradeCondition | undefined> => ({ type: SET_EXCHANGE_RATE_TRADE_CONDITION, payload });

// options
export const SetFileTypeOptions = (payload: Option[]): Action<Option[]> => ({ type: SET_FILE_TYPE_OPTIONS, payload });
export const SetStockTypeOptions = (payload: Option[]): Action<Option[]> => ({ type: SET_STOCK_TYPE_OPTIONS, payload });
export const SetRecordTypeOptions = (payload: Option[]): Action<Option[]> => ({ type: SET_RECORD_TYPE_OPTIONS, payload });

// system setting
export const SetLoading = (payload: boolean): Action<boolean> => ({ type: SET_LOADING, payload });
export const SetSidebarShow = (payload: boolean): Action<boolean> => ({ type: SET_SIDEBAR_SHOW, payload });
export const SetSidebarFoldable = (payload: boolean): Action<boolean> => ({ type: SET_SIDEBAR_FOLDABLE, payload });
export const Notify = (payload: string): Action<string> => ({ type: NOTIFY, payload });
export const SetIsMobile = (payload: boolean): Action<boolean> => ({ type: SET_IS_MOBILE, payload });

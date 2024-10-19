export const API_URL: string = process.env.API_URL as string;

// api auth
export const AUTH_LOGIN_PATH: string = '/login';
export const AUTH_CHANGE_PWD_PATH: string = '/changePwd';
export const AUTH_VALIDATE_PATH: string = '/validate';
export const AUTH_LOGOUT_PATH: string = '/userLogout';
export const AUTH_UPDATE_SETTING_PATH: string = '/updateUserSetting';

// api file
const FINANCIAL_FILE_API_PREFIX: string = '/financialFile';
export const FINANCIAL_FILE_LIST_PATH: string = FINANCIAL_FILE_API_PREFIX + '/list';
export const FINANCIAL_FILE_UPLOAD_PATH: string = FINANCIAL_FILE_API_PREFIX + '/upload';
export const FINANCIAL_FILE_UPDATE_PATH: string = FINANCIAL_FILE_API_PREFIX + '/update';
export const FINANCIAL_FILE_DOWNLOAD_PATH: string = FINANCIAL_FILE_API_PREFIX + '/download';
export const FINANCIAL_FILE_REMOVE_PATH: string = FINANCIAL_FILE_API_PREFIX + '/remove';

// api stock
const STOCK_API_PREFIX: string = '/stock';
export const STOCK_GET_ALL_PATH: string = STOCK_API_PREFIX + '/getAll';
export const STOCK_GET_RECORDS_PATH: string = STOCK_API_PREFIX + '/getRecords';
export const STOCK_REFRESH_PATH: string = STOCK_API_PREFIX + '/refresh';
export const USER_STOCK_PRECALC_PATH: string = STOCK_API_PREFIX + '/precalc';
export const USER_STOCK_BUY_PATH: string = STOCK_API_PREFIX + '/buy';
export const USER_STOCK_SELL_PATH: string = STOCK_API_PREFIX + '/sell';
export const USER_STOCK_BONUS_PATH: string = STOCK_API_PREFIX + '/bonus';
export const USER_STOCK_DELETE_PATH: string = STOCK_API_PREFIX + '/deleteRecord';
export const USER_STOCK_GET_OWN_PATH: string = STOCK_API_PREFIX + '/getOwn';
export const USER_STOCK_GET_OWN_RECORDS_PATH: string = STOCK_API_PREFIX + '/getOwnRecords';
export const STOCK_GET_TRACKING_LIST_PATH: string = STOCK_API_PREFIX + '/getTrackingList';
export const STOCK_TRACK_PATH: string = STOCK_API_PREFIX + '/track';
export const STOCK_UNTRACK_PATH: string = STOCK_API_PREFIX + '/untrack';
export const STOCK_PREDICT_PATH: string = STOCK_API_PREFIX + '/predict';

// api fund
const FUND_API_PREFIX: string = '/fund';
export const FUND_GET_ALL_PATH: string = FUND_API_PREFIX + '/getAll';
export const FUND_GET_RECORDS_PATH: string = FUND_API_PREFIX + '/getRecords';
export const FUND_REFRESH_PATH: string = FUND_API_PREFIX + '/refresh';
export const USER_FUND_BUY_PATH: string = FUND_API_PREFIX + '/buy';
export const USER_FUND_SELL_PATH: string = FUND_API_PREFIX + '/sell';
export const USER_FUND_BOUNS_PATH: string = FUND_API_PREFIX + '/bonus';
export const USER_FUND_DELETE_PATH: string = FUND_API_PREFIX + '/deleteRecord';
export const USER_FUND_GET_OWN_PATH: string = FUND_API_PREFIX + '/getOwn';
export const USER_FUND_GET_OWN_RECORDS_PATH: string = FUND_API_PREFIX + '/getOwnRecords';
export const FUND_GET_TRACKING_LIST_PATH: string = FUND_API_PREFIX + '/getTrackingList';
export const FUND_TRACK_PATH: string = FUND_API_PREFIX + '/track';
export const FUND_UNTRACK_PATH: string = FUND_API_PREFIX + '/untrack';
export const FUND_PREDICT_PATH: string = FUND_API_PREFIX + '/predict';

// api account
const ACCOUNT_API_PREFIX: string = '/account';
export const ACCOUNT_GET_PATH: string = ACCOUNT_API_PREFIX + '/get';
export const ACCOUNT_GET_ALL_PATH: string = ACCOUNT_API_PREFIX + '/getAll';
export const ACCOUNT_CREATE_PATH: string = ACCOUNT_API_PREFIX + '/insert';
export const ACCOUNT_UPDATE_PATH: string = ACCOUNT_API_PREFIX + '/update';
export const ACCOUNT_DELETE_PATH: string = ACCOUNT_API_PREFIX + '/delete';
export const ACCOUNT_GET_RECORDS_PATH: string = ACCOUNT_API_PREFIX + '/getRecords';
export const ACCOUNT_MONTH_BALANCE_PATH: string = ACCOUNT_API_PREFIX + '/monthBalance';
export const ACCOUNT_INCOME_RECORD_PATH: string = ACCOUNT_API_PREFIX + '/income';
export const ACCOUNT_TRANSFER_RECORD_PATH: string = ACCOUNT_API_PREFIX + '/transfer';
export const ACCOUNT_EXPEND_RECORD_PATH: string = ACCOUNT_API_PREFIX + '/expend';
export const ACCOUNT_UPDATE_RECORD_PATH: string = ACCOUNT_API_PREFIX + '/updateRecord';
export const ACCOUNT_DELETE_RECORD_PATH: string = ACCOUNT_API_PREFIX + '/deleteRecord';

// api exchange rate
const EXCHANGE_RATE_API_PREFIX: string = '/exchangeRate';
export const EXCHANGE_RATE_GET_ALL_PATH: string = EXCHANGE_RATE_API_PREFIX + '/getAll';
export const EXCHANGE_RATE_GET_RECORDS_PATH: string = EXCHANGE_RATE_API_PREFIX + '/getRecords';
export const EXCHANGE_RATE_REFRESH_PATH: string = EXCHANGE_RATE_API_PREFIX + '/refresh';
export const EXCHANGE_RATE_TRADE_PATH: string = EXCHANGE_RATE_API_PREFIX + '/trade';

// api options
const OPTION_API_PREFIX: string = '/option';
export const OPTION_GET_FILE_TYPES: string = OPTION_API_PREFIX + '/fileTypes';
export const OPTION_GET_STOCK_TYPES: string = OPTION_API_PREFIX + '/stockTypes';
export const OPTION_GET_RECORD_TYPES: string = OPTION_API_PREFIX + '/recordTypes';

// api bankInfo
const BANK_INFO_API_PREFIX: string = '/bankInfo';
export const BANK_INFO_GET_ALL_PATH: string = BANK_INFO_API_PREFIX + '/getAll';

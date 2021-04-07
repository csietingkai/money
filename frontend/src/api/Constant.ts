export const API_URL: string = process.env.API_URL;

// api auth
export const AUTH_LOGIN_PATH: string = '/login';
export const AUTH_REGISTER_PATH: string = '/register';
export const AUTH_VALIDATE_PATH: string = '/validate';

// api file
const FILE_API_PREFIX: string = '/file';
export const FILE_UPLOAD_PATH: string = FILE_API_PREFIX + '/upload';
export const FILE_DOWNLOAD_PATH: string = FILE_API_PREFIX + '/download';

// api stock
const STOCK_API_PREFIX: string = '/stock';
export const STOCK_GET_PATH: string = STOCK_API_PREFIX + '/get';
export const STOCK_GET_RECORDS_PATH: string = STOCK_API_PREFIX + '/getRecords';
export const STOCK_REFRESH_PATH: string = STOCK_API_PREFIX + '/refresh';

// api account
const ACCOUNT_API_PREFIX: string = '/account';
export const ACCOUNT_GET_PATH: string = ACCOUNT_API_PREFIX + '/get';
export const ACCOUNT_GET_ALL_PATH: string = ACCOUNT_API_PREFIX + '/getAll';
export const ACCOUNT_CREATE_PATH: string = ACCOUNT_API_PREFIX + '/insert';
export const ACCOUNT_UPDATE_PATH: string = ACCOUNT_API_PREFIX + '/update';
export const ACCOUNT_DELETE_PATH: string = ACCOUNT_API_PREFIX + '/delete';
export const ACCOUNT_GET_RECORDS_PATH: string = ACCOUNT_API_PREFIX + '/getRecords';
export const ACCOUNT_CREATE_RECORD_PATH: string = ACCOUNT_API_PREFIX + '/insertRecord';

// api exchange rate
const EXCHANGE_RATE_API_PREFIX: string = '/exchangeRate';
export const EXCHANGE_RATE_GET_ALL_PATH: string = EXCHANGE_RATE_API_PREFIX + '/getAll';
export const EXCHANGE_RATE_REFRESH_PATH: string = EXCHANGE_RATE_API_PREFIX + '/refresh';
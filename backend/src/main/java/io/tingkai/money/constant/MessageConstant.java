package io.tingkai.money.constant;

public class MessageConstant {

	// simple message
	public static final String SUCCESS = "SUCCESS";
	public static final String FAIL = "FAIL";
	public static final String QUERY_NO_DATA = "Query for {0} Find No Data";
	public static final String ALREADY_EXIST = "Data Already Exists in Database";
	public static final String NOT_EXIST = "Data Not Exists in Database";
	public static final String FIELD_MISSING = "Not All Required Fields are Filled";

	// auth
	public static final String AUTHENTICATE_FAIL = "Bad Token";
	public static final String LOGIN_SUCCESS = "User: {0} Login Success";
	public static final String LOGOUT_SUCCESS = "User Logout Success";
	public static final String USER_NOT_FOUND = "Username: {0} not found";
	public static final String WRONG_PASSWORD = "Wrong password";
	public static final String CREATE_USER_WARN = "Create User: {0} warning, cause by: {1}";
	public static final String AUTH_TOKEN_EXPIRE = "Auth Token has been expired";
	public static final String NO_THIS_ROLE = "Role Error: {0}";
	public static final String USER_CHANGE_SETTING_SUCCESS = "User Change Settings Success";
	public static final String USER_CHANGE_PASSWORD_SUCCESS = "User Change Password Success";

	// file
	public static final String FILE_UPLOAD_SUCCESS = "Upload File: {0} Success";
	public static final String FILE_DOWNLOAD_SUCCESS = "Download File Success";
	public static final String FILE_DELETE_SUCCESS = "Delete File: {0} Success";
	public static final String FILE_DOWNLOAD_NOT_FOUND = "File: {0} Not Found";

	// stock
	public static final String STOCK_GET_ALL_SUCCESS = "Get All Stocks Success";
	public static final String STOCK_GET_SUCCESS = "Get Stock: {0} Success";
	public static final String STOCK_REFRESH_SUCCESS = "Stock Refresh Success";
	public static final String USER_STOCK_PRECALC_SUCCESS = "Pre Calc Success";
	public static final String USER_STOCK_BUY_SUCCESS = "User: Buy {0} {1} shares with Price: {2} Success";
	public static final String USER_STOCK_SELL_SUCCESS = "User: Sell {0} {1} shares with Price: {2} Success";
	public static final String USER_STOCK_BONUS_SUCCESS = "Get Bonus {0} from stock: {1} Success";
	public static final String USER_STOCK_GET_TRACKING_LIST_SUCCESS = "User: Tracking Stock List Fetch Success";
	public static final String STOCK_SHARE_AMOUNT_INVALID = "Stock Share: {0} is invalid";

	// fund
	public static final String FUND_GET_ALL_SUCCESS = "Get All Funds Success";
	public static final String FUND_GET_SUCCESS = "Get Fund: {0} Success";
	public static final String FUND_REFRESH_SUCCESS = "Fund Refresh Success";
	public static final String USER_FUND_BUY_SUCCESS = "User: Buy {0} {1} shares with Price: {2} Success";
	public static final String USER_FUND_SELL_SUCCESS = "User: Sell {0} {1} shares with Price: {2} Success";
	public static final String USER_FUND_BONUS_SUCCESS = "Get Bonus {0} from fund: {1} Success";
	public static final String USER_FUND_GET_TRACKING_LIST_SUCCESS = "User Tracking Fund List Fetch Success";
	public static final String FUND_SHARE_AMOUNT_INVALID = "Fund Share: {0} is invalid";

	// exchange rate
	public static final String EXCHANGE_RATE_GET_ALL_SUCCESS = "Get All Exchange Rate Success";
	public static final String EXCHANGE_RATE_GET_SUCCESS = "Get Exchange Rate: {0} Success";
	public static final String EXCHANGE_RATE_TRADE = "Trade {0}({1}) to {2}({3}) with rate {4}";

	// account
	public static final String ACCOUNT_GET_ALL_SUCCESS = "Get Accounts Success";
	public static final String ACCOUNT_INSERT_SUCCESS = "Create Account<{0}> Success";
	public static final String ACCOUNT_UPDATE_SUCCESS = "Update Account<{0}> Success";
	public static final String ACCOUNT_GET_RECORDS_SUCCESS = "Get Account<{0}> Records Success";
	public static final String ACCOUNT_GET_MONTH_BALANCE_SUCCESS = "Get Records Success";
	public static final String ACCOUNT_INSERT_RECORDS_SUCCESS = "Create Account Records Success";
	public static final String ACCOUNT_RECORD_DELETE_SUCCESS = "Account Record Delete Success";
	public static final String ACCOUNT_BALANCE_NOT_ENOUGH = "Account: {0} doesn't have enough balance";
	public static final String ACCOUNT_WRONG_AMOUNT = "Amount: {0} is invalid";
	public static final String ACCOUNT_INCOME_DESC = "[Account<{0}>][INCOME] {1}";
	public static final String ACCOUNT_TRANSFER_DESC = "[Account<{0} - {1}>][TRANSFER] {2}";
	public static final String ACCOUNT_EXPEND_DESC = "[Account<{0}>][EXPEND] {1}";
}

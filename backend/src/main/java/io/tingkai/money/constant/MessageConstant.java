package io.tingkai.money.constant;

public class MessageConstant {

	// simple message
	public static final String SUCCESS = "SUCCESS";
	public static final String FAIL = "FAIL";
	public static final String QUERY_NO_DATA = "Query for {0} Find No Data";
	public static final String ALREADY_EXIST = "Data Already Exists in Database";
	public static final String NOT_EXIST = "Data Not Exists in Database";
	public static final String FIELD_MISSING = "Not All Fields are Required";

	// auth
	public static final String AUTHENTICATE_FAIL = "Bad Token";
	public static final String LOGIN_SUCCESS = "User: {0} Login Success";
	public static final String USER_NOT_FOUND = "Username: {0} not found";
	public static final String WRONG_PASSWORD = "Wrong password";
	public static final String CREATE_USER_FAIL = "Create User: {0} failed, cause by: {1}";
	public static final String AUTH_TOKEN_EXPIRE = "Auth Token has been expired";
	public static final String NO_THIS_ROLE = "There is no such role called: {0}";

	// file
	public static final String FILE_UPLOAD_SUCCESS = "Upload File: {0} Success";
	public static final String FILE_UPLOAD_FAIL = "Upload File: {0} Fail";
	public static final String FILE_DOWNLOAD_SUCCESS = "Download File Success";
	public static final String FILE_DOWNLOAD_FAIL = "Download File Fail";
	public static final String FILE_DELETE_SUCCESS = "Delete File Success";
	public static final String FILE_DELETE_FAIL = "Delete File Fail";

	// python
	public static final String FETCH_EXCHANGE_RATE_FAIL = "fetchExchangeRate fail!";

	// stock
	public static final String STOCK_GET_ALL_SUCCESS = "Get All Stocks Success";
	public static final String STOCK_GET_ALL_FAIL = "Get All Stocks Fail";
	public static final String STOCK_GET_SUCCESS = "Get Stock: {0} Success";
	public static final String STOCK_GET_FAIL = "Get Stock: {0} Fail";
	public static final String STOCK_REFRESH_SUCCESS = "Stock Fresh Success";
	public static final String STOCK_REFRESH_FAIL = "Stock Fresh Fail";
	public static final String USER_STOCK_GET_TRACKING_LIST_SUCCESS = "User: {0} Tracking List Fetch Success";
	public static final String USER_STOCK_GET_TRACKING_LIST_FAIL = "User: {0} Tracking List Fetch Fail";
	public static final String STOCK_SHARE_AMOUNT_INVALID = "Stock Share: {0} is invalid";

	// exchange rate
	public static final String EXCHANGE_RATE_GET_ALL_SUCCESS = "Get All Exchange Rate Success";
	public static final String EXCHANGE_RATE_GET_ALL_FAIL = "Get All Exchange Rate Fail";

	// account
	public static final String ACCOUNT_GET_ALL_SUCCESS = "Get {0}'s Accounts Success";
	public static final String ACCOUNT_GET_ALL_FAIL = "Get {0}'s Accounts Fail";
	public static final String ACCOUNT_GET_SUCCESS = "Get Account Info Success";
	public static final String ACCOUNT_GET_FAIL = "Get Account Info Fail";
	public static final String ACCOUNT_INSERT_SUCCESS = "Create Account<{0}, {1}> Success";
	public static final String ACCOUNT_INSERT_FAIL = "Create Account<{0}, {1}> Fail";
	public static final String ACCOUNT_UPDATE_SUCCESS = "Update Account<{0}, {1}> Success";
	public static final String ACCOUNT_UPDATE_FAIL = "Update Account<{0}, {1}> Fail";
	public static final String ACCOUNT_GET_RECORDS_SUCCESS = "Get Account<{0}> Records Success";
	public static final String ACCOUNT_GET_RECORDS_FAIL = "Get Account<{0}> Records Fail";
	public static final String ACCOUNT_INSERT_RECORDS_SUCCESS = "Create Account <{0}> Records Success";
	public static final String ACCOUNT_INSERT_RECORDS_FAIL = "Create Account<{0}> Records Fail";
	public static final String ACCOUNT_BALANCE_NOT_ENOUGH = "Account: {0} doesn't have enough balance";

}

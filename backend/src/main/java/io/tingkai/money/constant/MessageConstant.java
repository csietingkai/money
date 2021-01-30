package io.tingkai.money.constant;

/**
 * messages used for responses
 * 
 * @author tingkai
 */
public class MessageConstant {

	// simple message
	public static final String SUCCESS = "SUCCESS";
	public static final String FAIL = "FAIL";

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
}

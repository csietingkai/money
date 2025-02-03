package io.tingkai.money.constant;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Month;
import java.util.Arrays;
import java.util.List;

public class CodeConstants {

	// === init === //
	public static final String APP_CACHE = "APP_CACHE";
	public static final String PYTHON_CACHE = "PYTHON_CACHE";
	public static final String USER_CACHE = "USER_CACHE";

	// === date time format === //
	public static final String DATE_FORMAT = "yyyy/MM/dd";
	public static final String TIME_FORMAT = "HH:mm:ss";
	public static final String DATE_TIME_FORMAT = DATE_FORMAT + " " + TIME_FORMAT;
	public static final LocalDateTime DATE_TIME_MIN = LocalDateTime.of(1999, Month.JANUARY, 1, 0, 0);
	public static final LocalDateTime DATE_TIME_MAX = LocalDateTime.of(2099, Month.DECEMBER, 31, 23, 59);

	// === security === //
	public static final String REQUEST_TOKEN_KEY = "X-Auth-Token";
	public static final String PRNG_NAME = "SHA1PRNG";
	public static final String DIGEST_ALGORITHM_NAME = "SHA-256";
	public static final int PRNG_PRODUCT_LENGTH = 32;
	public static final int AUTH_TOKEN_VALID_HOURS = 12;
	public static final String AUTH_TOKEN_KEY = "authToken:{0}";
	public static final String AUTH_USER_KEY = "authUser:{0}";

	// === mail === //
	public static final String CONFIRM_EMAIL_SUBJECT = "Money AP Confrim Email";
	public static final String CONFIRM_EMAIL_CONTENT = "Click the following link to verify email:\n";

	// === account === //
	public static final String ACCOUNT_LIST = "account-list:{0}";

	// === bank info === //
	public static final String BANK_INFO_LIST_KEY = "bank-info-list";

	/// === exchange rate === //
	public static final String BASE_EXCHANGE_RATE = "TWD";
	public static final String EXCHANGE_RATE_FETCHING_CURRENCY = "fetching-exchange-rate";
	public static final String EXCHANGE_RATE_LIST_KEY = "exchange-rate-list";
	public static final LocalDateTime EXCHANGE_RATE_FETCH_START_DATETIME = LocalDateTime.of(LocalDateTime.now().getYear() - 1, Month.JANUARY, 1, 0, 0);

	/// === stock list === //
	public static final String STOCK_FETCHING_CODE = "fetching-stock-code";
	public static final int[] MA_DAYS = { 5, 10, 20, 40, 60 };
	public static final BigDecimal FEE_RATE = new BigDecimal(0.001425d);
	public static final BigDecimal MIN_FEE = new BigDecimal(20);
	public static final BigDecimal MIN_SMALL_FEE = new BigDecimal(1);
	public static final BigDecimal TAX_RATE = new BigDecimal(0.003d);

	// === user tracking stock === //
	public static final String USER_TRACKING_STOCK_KEY = "track-stock-user:{0}";

	/// === fund list === //
	public static final String FUND_FETCHING_CODE = "fetching-fund-code";

	// === user tracking fund === //
	public static final String USER_TRACKING_FUND_KEY = "track-fund-user:{0}";

	// === other === //
	public static final int PAGINATION_SIZE = 10;
	public static final char UNDERLINE = '_';
	public static final String EMPTY_STRING = "";
	public static final String RANDOM_RANGE = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
	public static final int NUMBER_PERCISION = 6;
	public static final List<String> VALID_OPTION_LANGUAGE = Arrays.asList("TW", "US");
	public static final String OPTION_LANGUAGE_TW = VALID_OPTION_LANGUAGE.get(0);
	public static final String OPTION_LANGUAGE_US = VALID_OPTION_LANGUAGE.get(1);
}

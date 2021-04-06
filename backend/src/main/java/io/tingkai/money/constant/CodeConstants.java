package io.tingkai.money.constant;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Month;
import java.time.ZoneId;

public class CodeConstants {

	// === init === //
	public static final String DB_INIT_ROOT_USERNAME = "root";
	public static final String APP_CACHE = "APP_CACHE";
	public static final String PYTHON_CACHE = "PYTHON_CACHE";
	public static final String USER_CACHE = "USER_CACHE";

	// === date time format === //
	public static final ZoneId ZONE_TPE = ZoneId.of("Asia/Taipei");
	public static final ZoneId ZONE_UTC = ZoneId.of("UTC");
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
	public static final String AUTH_TOKEN_KEY = "authToken:";
	public static final String AUTH_USER_KEY = "authUser:";

	// === mail === //
	public static final String CONFIRM_EMAIL_SUBJECT = "Money AP Confrim Email";
	public static final String CONFIRM_EMAIL_CONTENT = "Click the following link to verify email:\n";

	// === python === //
	public static final int UPDATE_FREQUENCY_HOURS = 8;
	/// === exchange rate === //
	public static final String EXCHANGE_RATE_LIST_KEY = "exchange-rate-list";
	public static final String EXCHANGE_RATE_UPDATE_TIME_KEY = "exchange-rate-update-time";
	public static final String EXCHANGE_RATE_RECORD_UPDATE_TIME_KEY = "exchange-rate-record-update-time";
	public static final LocalDateTime EXCHANGE_RATE_FETCH_START_DATETIME = LocalDateTime.of(LocalDateTime.now().getYear() - 1, Month.JANUARY, 1, 0, 0);

	/// === stock list === //
	public static final String STOCK_UPDATE_TIME_KEY = "stock-update-time";
	public static final String STOCK_LIST_KEY = "stock-list";
	public static final String STOCK_SKIP_FETCH_LIST_KEY = "stock-skip-fetch-list";
	public static final String STOCK_RECORD_UPDATE_TIME_KEY = "stock-record-update-time";
	public static final String STOCK_FETCHING_CODE = "fetching-stock-record";
	public static final BigDecimal FEE_RATE = new BigDecimal(0.001425d);
	public static final BigDecimal MIN_FEE = new BigDecimal(20);
	public static final BigDecimal TAX_RATE = new BigDecimal(0.003d);

	// === user tracking stock === //
	public static final String USER_TRACKING_STOCK_KEY = "user:";

	// === other === //
	public static final char UNDERLINE = '_';
	public static final String EMPTY_STRING = "";
	public static final String RANDOM_RANGE = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
}

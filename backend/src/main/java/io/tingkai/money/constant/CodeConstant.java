package io.tingkai.money.constant;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.Month;

public class CodeConstant {

	// === init === //
	public static final String APP_CACHE = "APP_CACHE";
	public static final String PYTHON_CACHE = "PYTHON_CACHE";

	// === date time format === //
	public static final String DATE_FORMAT = "yyyy/MM/dd";
	public static final String TIME_FORMAT = "HH:mm:ss";
	public static final String DATE_TIME_FORMAT = DATE_FORMAT + " " + TIME_FORMAT;
	public static final LocalDateTime DATE_TIME_MIN = LocalDateTime.of(1999, Month.JANUARY, 1, 0, 0);
	public static final LocalDateTime DATE_TIME_MAX = LocalDateTime.of(2099, Month.DECEMBER, 31, 23, 59);

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
}

package io.tingkai.money.model.response;

public class ExchangeRateResponse<T> extends BaseResponse<T> {

	public ExchangeRateResponse(boolean success, T t, String pattern) {
		super(success, t, pattern);
	}

	public ExchangeRateResponse(boolean success, T t, String pattern, String... params) {
		super(success, t, pattern, params);
	}

	public ExchangeRateResponse(Exception e) {
		super(e);
	}
}

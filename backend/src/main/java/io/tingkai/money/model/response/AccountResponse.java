package io.tingkai.money.model.response;

public class AccountResponse<T> extends BaseResponse<T> {

	public AccountResponse(boolean success, T t, String pattern) {
		super(success, t, pattern);
	}

	public AccountResponse(boolean success, T t, String pattern, String... params) {
		super(success, t, pattern, params);
	}

	public AccountResponse(Exception e) {
		super(e);
	}
}

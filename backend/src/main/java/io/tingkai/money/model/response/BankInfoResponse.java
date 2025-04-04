package io.tingkai.money.model.response;

import io.tingkai.base.model.response.BaseResponse;

public class BankInfoResponse<T> extends BaseResponse<T> {

	public BankInfoResponse(boolean success, T t, String pattern) {
		super(success, t, pattern);
	}

	public BankInfoResponse(boolean success, T t, String pattern, String... params) {
		super(success, t, pattern, params);
	}

	public BankInfoResponse(Exception e) {
		super(e);
	}
}

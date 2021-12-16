package io.tingkai.money.model.response;

public class FundResponse<T> extends BaseResponse<T> {

	public FundResponse(boolean success, T t, String pattern) {
		super(success, t, pattern);
	}

	public FundResponse(boolean success, T t, String pattern, String... params) {
		super(success, t, pattern, params);
	}

	public FundResponse(Exception e) {
		super(e);
	}
}

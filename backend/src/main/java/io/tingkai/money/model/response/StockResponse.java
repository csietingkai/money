package io.tingkai.money.model.response;

public class StockResponse<T> extends BaseResponse<T> {

	public StockResponse(boolean success, T t, String pattern) {
		super(success, t, pattern);
	}

	public StockResponse(boolean success, T t, String pattern, String... params) {
		super(success, t, pattern, params);
	}

	public StockResponse(Exception e) {
		super(e);
	}
}

package io.tingkai.money.model.response;

import io.tingkai.money.controller.StockController;

/**
 * response for {@link StockController} request.
 * 
 * @author tingkai
 */
public class StockResponse<T> extends BaseResponse<T> {

	public StockResponse(boolean success, T authToken, String pattern) {
		super(success, authToken, pattern);
	}

	public StockResponse(boolean success, T authToken, String pattern, String... params) {
		super(success, authToken, pattern, params);
	}

	public StockResponse(Exception e) {
		super(e);
	}
}

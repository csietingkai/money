package io.tingkai.money.model.response;

import io.tingkai.base.model.response.BaseResponse;

public class UserResponse<T> extends BaseResponse<T> {

	public UserResponse(boolean success, T t, String pattern) {
		super(success, t, pattern);
	}

	public UserResponse(boolean success, T t, String pattern, String... params) {
		super(success, t, pattern, params);
	}

	public UserResponse(Exception e) {
		super(e);
	}

}

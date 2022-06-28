package io.tingkai.money.model.response;

public class EnumResponse<T> extends BaseResponse<T> {

	public EnumResponse(boolean success, T enums, String pattern) {
		super(success, enums, pattern);
	}

	public EnumResponse(boolean success, T enums, String pattern, String... params) {
		super(success, enums, pattern, params);
	}

	public EnumResponse(Exception e) {
		super(e);
	}
}

package io.tingkai.base.model.response;

import java.text.MessageFormat;

import lombok.Data;

@Data
public class BaseResponse<T> {

	private boolean success;

	private T data;

	private String message;

	public BaseResponse(Exception e) {
		this(false, null, e.getMessage());
	}

	public BaseResponse(boolean success, T data, String pattern, String... params) {
		super();
		this.success = success;
		this.data = data;
		this.message = MessageFormat.format(pattern, (Object[]) params);
	}
}

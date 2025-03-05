package io.tingkai.base.model.exception;

import java.text.MessageFormat;

public class BaseException extends Exception {

	private static final long serialVersionUID = 1L;

	public BaseException(String pattern, Object... params) {
		super(MessageFormat.format(pattern, params));
	}
}

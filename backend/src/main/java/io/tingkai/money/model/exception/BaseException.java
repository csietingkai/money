package io.tingkai.money.model.exception;

import java.text.MessageFormat;

public class BaseException extends Exception {

	private static final long serialVersionUID = -1611635490643308036L;

	public BaseException(String pattern, Object... params) {
		super(MessageFormat.format(pattern, params));
	}
}

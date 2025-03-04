package io.tingkai.money.model.exception;

import io.tingkai.money.constant.MessageConstant;

public class AuthTokenExpireException extends BaseException {

	private static final long serialVersionUID = 1L;

	public AuthTokenExpireException() {
		super(MessageConstant.AUTH_TOKEN_EXPIRE);
	}
}

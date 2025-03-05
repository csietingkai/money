package io.tingkai.auth.model.exception;

import io.tingkai.auth.constant.AuthConstant;
import io.tingkai.base.model.exception.BaseException;

public class AuthTokenExpireException extends BaseException {

	private static final long serialVersionUID = 1L;

	public AuthTokenExpireException() {
		super(AuthConstant.AUTH_TOKEN_EXPIRE);
	}
}

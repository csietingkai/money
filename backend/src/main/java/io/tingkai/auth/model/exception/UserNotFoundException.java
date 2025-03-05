package io.tingkai.auth.model.exception;

import io.tingkai.auth.constant.AuthConstant;
import io.tingkai.base.model.exception.BaseException;

public class UserNotFoundException extends BaseException {

	private static final long serialVersionUID = 1L;

	public UserNotFoundException(String username) {
		super(AuthConstant.USER_NOT_FOUND, username);
	}
}

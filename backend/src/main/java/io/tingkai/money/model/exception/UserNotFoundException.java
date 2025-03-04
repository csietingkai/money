package io.tingkai.money.model.exception;

import io.tingkai.money.constant.MessageConstant;

public class UserNotFoundException extends BaseException {

	private static final long serialVersionUID = 1L;

	public UserNotFoundException(String username) {
		super(MessageConstant.USER_NOT_FOUND, username);
	}
}

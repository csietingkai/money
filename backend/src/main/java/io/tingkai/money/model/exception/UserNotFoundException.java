package io.tingkai.money.model.exception;

import io.tingkai.money.constant.MessageConstant;

/**
 * when frontend send login request and username doesn't exist in sql database,
 * throw this exception
 * 
 * @author tingkai
 */
public class UserNotFoundException extends BaseException {

	private static final long serialVersionUID = 6321898238786597173L;

	public UserNotFoundException(String username) {
		super(MessageConstant.USER_NOT_FOUND, username);
	}
}

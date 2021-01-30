package io.tingkai.money.model.exception;

import io.tingkai.money.constant.MessageConstant;

/**
 * when frontend send login request and username exist in sql database but
 * password is wrong, throw this exception
 * 
 * @author tingkai
 */
public class WrongPasswordException extends BaseException {

	private static final long serialVersionUID = 5209732071693211931L;

	public WrongPasswordException() {
		super(MessageConstant.WRONG_PASSWORD);
	}
}

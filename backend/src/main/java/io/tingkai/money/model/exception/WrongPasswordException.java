package io.tingkai.money.model.exception;

import io.tingkai.money.constant.MessageConstant;

public class WrongPasswordException extends BaseException {

	private static final long serialVersionUID = 5209732071693211931L;

	public WrongPasswordException() {
		super(MessageConstant.WRONG_PASSWORD);
	}
}

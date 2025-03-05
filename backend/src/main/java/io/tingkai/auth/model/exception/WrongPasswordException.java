package io.tingkai.auth.model.exception;

import io.tingkai.auth.constant.AuthConstant;
import io.tingkai.base.model.exception.BaseException;

public class WrongPasswordException extends BaseException {

	private static final long serialVersionUID = 1L;

	public WrongPasswordException() {
		super(AuthConstant.WRONG_PASSWORD);
	}
}

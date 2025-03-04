package io.tingkai.money.model.exception;

import io.tingkai.money.constant.MessageConstant;

public class NotExistException extends BaseException {

	private static final long serialVersionUID = 1L;

	public NotExistException() {
		super(MessageConstant.NOT_EXIST);
	}
}

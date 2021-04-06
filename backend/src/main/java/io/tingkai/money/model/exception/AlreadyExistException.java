package io.tingkai.money.model.exception;

import io.tingkai.money.constant.MessageConstant;

public class AlreadyExistException extends BaseException {

	private static final long serialVersionUID = -9158252023859129401L;

	public AlreadyExistException() {
		super(MessageConstant.ALREADY_EXIST);
	}
}

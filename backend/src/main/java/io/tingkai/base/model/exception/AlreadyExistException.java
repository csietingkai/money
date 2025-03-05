package io.tingkai.base.model.exception;

import io.tingkai.base.constant.BaseMessageConstant;

public class AlreadyExistException extends BaseException {

	private static final long serialVersionUID = 1L;

	public AlreadyExistException() {
		super(BaseMessageConstant.ALREADY_EXIST);
	}
}

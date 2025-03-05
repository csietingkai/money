package io.tingkai.base.model.exception;

import io.tingkai.base.constant.BaseMessageConstant;

public class NotExistException extends BaseException {

	private static final long serialVersionUID = 1L;

	public NotExistException() {
		super(BaseMessageConstant.NOT_EXIST);
	}
}

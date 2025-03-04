package io.tingkai.money.model.exception;

import io.tingkai.money.constant.MessageConstant;

public class FieldMissingException extends BaseException {

	private static final long serialVersionUID = 1L;

	public FieldMissingException() {
		super(MessageConstant.FIELD_MISSING);
	}
}

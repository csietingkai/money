package io.tingkai.money.model.exception;

import io.tingkai.money.constant.MessageConstant;

public class FieldMissingException extends BaseException {

	private static final long serialVersionUID = -5151469626091986686L;

	public FieldMissingException() {
		super(MessageConstant.FIELD_MISSING);
	}
}

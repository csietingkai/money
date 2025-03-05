package io.tingkai.base.model.exception;

import io.tingkai.base.constant.BaseMessageConstant;

public class FieldMissingException extends BaseException {

	private static final long serialVersionUID = 1L;

	public FieldMissingException() {
		super(BaseMessageConstant.FIELD_MISSING);
	}
}

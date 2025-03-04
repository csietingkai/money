package io.tingkai.money.model.exception;

import io.tingkai.money.constant.MessageConstant;

public class FinancialFileNotFoundException extends BaseException {

	private static final long serialVersionUID = 1L;

	public FinancialFileNotFoundException(String filename) {
		super(MessageConstant.FILE_DOWNLOAD_NOT_FOUND, filename);
	}
}

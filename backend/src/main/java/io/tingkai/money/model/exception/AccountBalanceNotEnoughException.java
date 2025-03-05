package io.tingkai.money.model.exception;

import io.tingkai.base.model.exception.BaseException;
import io.tingkai.money.constant.MessageConstant;

public class AccountBalanceNotEnoughException extends BaseException {

	private static final long serialVersionUID = 1L;

	public AccountBalanceNotEnoughException(String accountName) {
		super(MessageConstant.ACCOUNT_BALANCE_NOT_ENOUGH, accountName);
	}
}

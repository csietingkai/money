package io.tingkai.money.model.exception;

import java.math.BigDecimal;

import io.tingkai.money.constant.MessageConstant;

public class AccountBalanceWrongException extends BaseException {

	private static final long serialVersionUID = 1L;

	public AccountBalanceWrongException(BigDecimal amount) {
		super(MessageConstant.ACCOUNT_WRONG_AMOUNT, amount);
	}
}

package io.tingkai.money.model.exception;

import java.math.BigDecimal;

import io.tingkai.base.model.exception.BaseException;
import io.tingkai.money.constant.MessageConstant;

public class AccountBalanceWrongException extends BaseException {

	private static final long serialVersionUID = 1L;

	public AccountBalanceWrongException(BigDecimal amount) {
		super(MessageConstant.ACCOUNT_WRONG_AMOUNT, amount);
	}
}

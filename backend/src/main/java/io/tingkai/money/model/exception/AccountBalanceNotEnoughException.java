package io.tingkai.money.model.exception;

import io.tingkai.money.constant.MessageConstant;

/**
 * when you don't have enough money in account, throw this exception
 * 
 * @author tingkai
 */
public class AccountBalanceNotEnoughException extends BaseException {

	private static final long serialVersionUID = 2347383174393435466L;

	public AccountBalanceNotEnoughException(String accountName) {
		super(MessageConstant.ACCOUNT_BALANCE_NOT_ENOUGH, accountName);
	}
}

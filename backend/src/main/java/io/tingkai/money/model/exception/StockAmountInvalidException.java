package io.tingkai.money.model.exception;

import java.math.BigDecimal;

import io.tingkai.money.constant.MessageConstant;

public class StockAmountInvalidException extends BaseException {

	private static final long serialVersionUID = 9139982358950833235L;

	public StockAmountInvalidException(BigDecimal amount) {
		super(MessageConstant.STOCK_SHARE_AMOUNT_INVALID, amount);
	}
}

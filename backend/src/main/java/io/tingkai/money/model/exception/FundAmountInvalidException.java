package io.tingkai.money.model.exception;

import java.math.BigDecimal;

import io.tingkai.money.constant.MessageConstant;

public class FundAmountInvalidException extends BaseException {

	private static final long serialVersionUID = 8930407884881996457L;

	public FundAmountInvalidException(BigDecimal amount) {
		super(MessageConstant.FUND_SHARE_AMOUNT_INVALID, amount);
	}
}

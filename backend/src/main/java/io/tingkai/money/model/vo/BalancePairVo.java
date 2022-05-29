package io.tingkai.money.model.vo;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class BalancePairVo {

	protected String currency;
	protected BigDecimal amount;

	public static BalancePairVo of(String currency, BigDecimal amount) {
		BalancePairVo pair = new BalancePairVo();
		pair.setCurrency(currency);
		pair.setAmount(amount);
		return pair;
	}
}

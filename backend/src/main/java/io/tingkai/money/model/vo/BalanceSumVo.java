package io.tingkai.money.model.vo;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class BalanceSumVo {

	protected int year;
	protected int month;
	protected BigDecimal income;
	protected BigDecimal expend;
	protected BigDecimal surplus;

	public static BalanceSumVo of(int year, int month, BigDecimal income, BigDecimal expend) {
		BalanceSumVo vo = new BalanceSumVo();
		vo.setYear(year);
		vo.setMonth(month);
		vo.setIncome(income);
		vo.setExpend(expend);
		vo.setSurplus(income.subtract(expend));
		return vo;
	}
}

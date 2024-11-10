package io.tingkai.money.model.vo;

import java.math.BigDecimal;
import java.util.Map;

import lombok.Data;

@Data
public class BalanceDetailVo {

	protected int year;
	protected int month;
	protected Map<String, BigDecimal> income;
	protected Map<String, BigDecimal> expend;

	public static BalanceDetailVo of(int year, int month, Map<String, BigDecimal> income, Map<String, BigDecimal> expend) {
		BalanceDetailVo vo = new BalanceDetailVo();
		vo.setYear(year);
		vo.setMonth(month);
		vo.setIncome(income);
		vo.setExpend(expend);
		return vo;
	}
}

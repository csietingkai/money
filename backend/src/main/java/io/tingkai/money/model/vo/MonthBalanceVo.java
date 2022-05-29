package io.tingkai.money.model.vo;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class MonthBalanceVo {

	protected int year;
	protected int month;
	protected List<BalancePairVo> income = new ArrayList<BalancePairVo>();
	protected List<BalancePairVo> expend = new ArrayList<BalancePairVo>();
}

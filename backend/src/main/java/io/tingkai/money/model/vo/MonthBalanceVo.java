package io.tingkai.money.model.vo;

import java.util.ArrayList;
import java.util.List;

import lombok.Data;

@Data
public class MonthBalanceVo {

	protected List<BalanceSumVo> sums = new ArrayList<BalanceSumVo>();

	protected List<BalanceDetailVo> details = new ArrayList<BalanceDetailVo>();
}

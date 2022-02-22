package io.tingkai.money.model.vo;

import java.math.BigDecimal;

import lombok.Data;

@Data
public class PredictResultVo {

	protected BigDecimal lower;
	protected BigDecimal price;
	protected BigDecimal upper;
}

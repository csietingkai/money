package io.tingkai.money.model.vo;

import java.math.BigDecimal;

import io.tingkai.money.entity.ExchangeRateRecord;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class ExchangeRateRecordVo extends ExchangeRateRecord implements Transformable<ExchangeRateRecord> {

	protected BigDecimal ma5;
	protected BigDecimal ma10;
	protected BigDecimal ma20;
	protected BigDecimal ma40;
	protected BigDecimal ma60;
	protected BigDecimal bbup;
	protected BigDecimal bbdown;
}

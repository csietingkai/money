package io.tingkai.money.model.vo;

import java.math.BigDecimal;

import org.springframework.beans.BeanUtils;

import io.tingkai.money.entity.StockRecord;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class StockRecordVo extends StockRecord implements Transformable<StockRecord> {

	protected BigDecimal ma5;
	protected BigDecimal ma10;
	protected BigDecimal ma20;
	protected BigDecimal ma40;
	protected BigDecimal ma60;
	protected BigDecimal bbup;
	protected BigDecimal bbdown;

	@Override
	public void transform(StockRecord entity) {
		BeanUtils.copyProperties(entity, this);
	}
}

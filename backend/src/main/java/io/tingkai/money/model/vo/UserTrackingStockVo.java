package io.tingkai.money.model.vo;

import java.math.BigDecimal;

import io.tingkai.money.entity.StockRecord;
import io.tingkai.money.entity.UserTrackingStock;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class UserTrackingStockVo extends UserTrackingStock implements Transformable<UserTrackingStock> {

	protected String stockName;
	protected StockRecord record;
	protected BigDecimal amplitude; // 漲跌幅
}

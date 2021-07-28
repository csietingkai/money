package io.tingkai.money.model.vo;

import java.math.BigDecimal;

import org.springframework.beans.BeanUtils;

import io.tingkai.money.entity.StockRecord;
import io.tingkai.money.entity.UserTrackingStock;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class UserTrackingStockVo extends UserTrackingStock implements Transformable<UserTrackingStock> {

	private String stockName;
	private StockRecord record;
	private BigDecimal amplitude; // 漲跌幅

	@Override
	public void transform(UserTrackingStock entity) {
		BeanUtils.copyProperties(entity, this);
	}
}

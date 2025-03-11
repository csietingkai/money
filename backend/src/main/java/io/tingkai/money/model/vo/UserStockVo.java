package io.tingkai.money.model.vo;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import io.tingkai.base.model.vo.Transformable;
import io.tingkai.money.entity.UserStock;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class UserStockVo extends UserStock implements Transformable<UserStock> {

	protected String stockName;
	protected BigDecimal price;
	protected LocalDateTime priceDate;
	protected BigDecimal cost;
}

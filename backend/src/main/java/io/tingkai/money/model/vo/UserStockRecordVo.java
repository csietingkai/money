package io.tingkai.money.model.vo;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import io.tingkai.money.entity.UserStockRecord;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class UserStockRecordVo extends UserStockRecord implements Transformable<UserStockRecord> {

	protected UUID fileId;
	protected BigDecimal price;
	protected LocalDateTime priceDate;
	protected BigDecimal cost;
}

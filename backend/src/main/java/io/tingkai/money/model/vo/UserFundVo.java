package io.tingkai.money.model.vo;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import io.tingkai.money.entity.UserFund;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class UserFundVo extends UserFund implements Transformable<UserFund> {

	protected String fundName;
	protected BigDecimal price;
	protected LocalDateTime priceDate;
}

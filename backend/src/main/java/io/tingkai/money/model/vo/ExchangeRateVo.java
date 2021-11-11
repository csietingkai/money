package io.tingkai.money.model.vo;

import java.time.LocalDateTime;

import io.tingkai.money.entity.ExchangeRate;
import io.tingkai.money.entity.ExchangeRateRecord;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class ExchangeRateVo extends ExchangeRate implements Transformable<ExchangeRate> {

	protected ExchangeRateRecord record;
	protected LocalDateTime updateTime;
}

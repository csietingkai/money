package io.tingkai.money.model.vo;

import java.time.LocalDateTime;

import org.springframework.beans.BeanUtils;

import io.tingkai.money.entity.Stock;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class StockVo extends Stock implements Transformable<Stock> {

	protected LocalDateTime updateTime;

	@Override
	public void transform(Stock entity) {
		BeanUtils.copyProperties(entity, this);
	}
}

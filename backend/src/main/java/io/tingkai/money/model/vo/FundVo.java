package io.tingkai.money.model.vo;

import java.time.LocalDateTime;

import io.tingkai.money.entity.Fund;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class FundVo extends Fund implements Transformable<Fund> {

	protected LocalDateTime updateTime;
}

package io.tingkai.money.model.vo;

import java.util.UUID;

import io.tingkai.money.entity.UserFundRecord;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class UserFundRecordVo extends UserFundRecord implements Transformable<UserFundRecord> {
	protected UUID fileId;
}

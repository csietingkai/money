package io.tingkai.money.model.vo;

import java.math.BigDecimal;

import io.tingkai.money.entity.FundRecord;
import io.tingkai.money.entity.UserTrackingFund;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class UserTrackingFundVo extends UserTrackingFund implements Transformable<UserTrackingFund> {

	protected String fundName;
	protected FundRecord record;
	protected BigDecimal amplitude; // 漲跌幅
}

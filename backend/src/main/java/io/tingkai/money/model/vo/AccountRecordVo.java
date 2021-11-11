package io.tingkai.money.model.vo;

import java.math.BigDecimal;

import io.tingkai.money.entity.AccountRecord;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
public class AccountRecordVo extends AccountRecord implements Transformable<AccountRecord> {

	protected String transFromName;
	protected String transFromCurrency;
	protected String transToName;
	protected String transToCurrency;
	protected BigDecimal transCurrentExchangeRate;
}

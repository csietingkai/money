package io.tingkai.money.model.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import org.springframework.lang.Nullable;

import lombok.Data;

@Data
public class FundBuyRequest {
	protected UUID accountId;
	protected String fundCode;
	protected LocalDate date;
	protected BigDecimal share;
	protected BigDecimal price;
	protected BigDecimal rate;
	protected BigDecimal payment;
	protected BigDecimal fee;
	@Nullable
	protected UUID fileId;
}

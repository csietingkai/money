package io.tingkai.money.model.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.lang.Nullable;

import lombok.Data;

@Data
public class FundTradeRecordEditRequest {
	protected UUID recordId;
	protected UUID accountId;
	protected String fundCode;
	protected LocalDateTime date;
	protected BigDecimal share;
	protected BigDecimal price;
	protected BigDecimal rate;
	protected BigDecimal fee;
	protected BigDecimal total;
	@Nullable
	protected UUID fileId;
	protected UUID accountRecordId;
}

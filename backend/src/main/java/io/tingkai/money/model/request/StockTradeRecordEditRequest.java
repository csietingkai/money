package io.tingkai.money.model.request;

import java.math.BigDecimal;
import java.util.UUID;

import org.springframework.lang.Nullable;

import lombok.Data;

@Data
public class StockTradeRecordEditRequest {
	protected UUID recordId;
	protected UUID accountId;
	protected String stockCode;
	protected String date;
	protected BigDecimal share;
	protected BigDecimal price;
	protected BigDecimal fee;
	@Nullable
	protected BigDecimal tax;
	protected BigDecimal total;
	@Nullable
	protected UUID fileId;
	protected UUID accountRecordId;
}

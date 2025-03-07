package io.tingkai.money.model.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import org.springframework.lang.Nullable;

import lombok.Data;

@Data
public class StockBuyRequest {
	protected UUID accountId;
	protected String stockCode;
	protected LocalDate date;
	protected BigDecimal share;
	protected BigDecimal price;
	protected BigDecimal fee;
	protected BigDecimal total;
	@Nullable
	protected UUID fileId;
}

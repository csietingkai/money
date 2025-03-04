package io.tingkai.money.model.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.lang.Nullable;

import lombok.Data;

@Data
public class StockBonusRequest {
	protected UUID accountId;
	protected String stockCode;
	protected LocalDateTime date;
	protected BigDecimal share;
	protected BigDecimal price;
	protected BigDecimal fee;
	protected BigDecimal total;
	@Nullable
	protected UUID fileId;
}

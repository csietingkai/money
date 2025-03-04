package io.tingkai.money.model.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Data;

@Data
public class ExchangeRateTradeRequest {
	protected UUID fromAccountId;
	protected UUID toAccountId;
	protected LocalDateTime date;
	protected BigDecimal rate;
	protected BigDecimal srcPayment;
	protected BigDecimal targetPayment;
}

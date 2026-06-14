package io.tingkai.money.model.request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import org.jspecify.annotations.Nullable;

import lombok.Data;

@Data
public class AccountRecordTransferRequest {
	protected UUID fromId;
	protected UUID toId;
	protected LocalDate date;
	protected BigDecimal amount;
	protected String type;
	protected String description;
	@Nullable
	protected UUID fileId;
}

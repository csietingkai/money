package io.tingkai.money.model.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import org.springframework.lang.Nullable;

import lombok.Data;

@Data
public class AccountRecordEditRequest {
	protected UUID recordId;
	@Nullable
	protected UUID toId;
	protected LocalDateTime date;
	protected BigDecimal amount;
	protected String type;
	protected String description;
	@Nullable
	protected UUID fileId;
}

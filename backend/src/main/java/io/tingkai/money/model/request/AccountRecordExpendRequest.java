package io.tingkai.money.model.request;

import java.math.BigDecimal;
import java.util.UUID;

import org.springframework.lang.Nullable;

import lombok.Data;

@Data
public class AccountRecordExpendRequest {
	protected UUID accountId;
	protected String date;
	protected BigDecimal amount;
	protected String type;
	protected String description;
	@Nullable
	protected UUID fileId;
}

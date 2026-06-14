package io.tingkai.money.model.request;

import org.jspecify.annotations.Nullable;

import lombok.Data;

@Data
public class AccountInsertRequest {
	protected String name;
	protected String currency;
	@Nullable
	protected String bankCode;
	@Nullable
	protected String bankNo;
	protected boolean shown = true;
}

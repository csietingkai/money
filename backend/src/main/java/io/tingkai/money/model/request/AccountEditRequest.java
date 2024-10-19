package io.tingkai.money.model.request;

import java.util.UUID;

import org.springframework.lang.Nullable;

import lombok.Data;

@Data
public class AccountEditRequest {
	protected UUID id;
	protected String name;
	@Nullable
	protected String bankCode;
	@Nullable
	protected String bankNo;
	protected boolean shown = true;
}

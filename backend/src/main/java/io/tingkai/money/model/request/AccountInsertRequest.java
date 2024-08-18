package io.tingkai.money.model.request;

import lombok.Data;

@Data
public class AccountInsertRequest {
	protected String name;
	protected String currency;
}

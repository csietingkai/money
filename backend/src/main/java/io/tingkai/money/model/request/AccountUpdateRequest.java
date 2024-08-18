package io.tingkai.money.model.request;

import java.util.UUID;

import lombok.Data;

@Data
public class AccountUpdateRequest {
	protected UUID id;
	protected String name;
}

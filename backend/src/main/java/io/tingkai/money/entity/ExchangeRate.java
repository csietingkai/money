package io.tingkai.money.entity;

import io.tingkai.money.constant.DatabaseConstants;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = DatabaseConstants.TABLE_EXCHANGE_RATE)
public class ExchangeRate {
	@Id
	protected String currency;
	protected String name;
}

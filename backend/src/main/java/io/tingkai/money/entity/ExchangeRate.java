package io.tingkai.money.entity;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import io.tingkai.money.constant.DatabaseConstants;
import lombok.Data;

@Entity
@Data
@Table(name = DatabaseConstants.TABLE_EXCHANGE_RATE)
public class ExchangeRate {
	@Id
	protected String currency;
	protected String name;
}

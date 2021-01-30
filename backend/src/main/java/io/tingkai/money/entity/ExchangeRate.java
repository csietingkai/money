package io.tingkai.money.entity;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

import io.tingkai.money.constant.DatabaseConstants;
import lombok.Data;

/**
 * Entity for sql database table 'exchange_rate'
 * 
 * @author tingkai
 */
@Entity
@Data
@Table(name = DatabaseConstants.TABLE_EXCHANGE_RATE)
public class ExchangeRate {
	@Id
	private String currency;
	private String name;
}

package io.tingkai.money.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

import io.tingkai.money.constant.DatabaseConstants;
import lombok.Data;

@Entity
@Data
@Table(name = DatabaseConstants.TABLE_EXCHANGE_RATE_RECORD, uniqueConstraints = { @UniqueConstraint(columnNames = { "currency", "date" }) })
public class ExchangeRateRecord {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	protected UUID id;
	@Column(unique = true)
	protected String currency;
	protected LocalDateTime date;
	protected BigDecimal cashBuy;
	protected BigDecimal cashSell;
	protected BigDecimal spotBuy;
	protected BigDecimal spotSell;
}

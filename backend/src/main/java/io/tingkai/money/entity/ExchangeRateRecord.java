package io.tingkai.money.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import io.tingkai.money.constant.DatabaseConstant;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;

@Entity
@Data
@Table(name = DatabaseConstant.TABLE_EXCHANGE_RATE_RECORD, uniqueConstraints = { @UniqueConstraint(columnNames = { "currency", "date" }) })
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

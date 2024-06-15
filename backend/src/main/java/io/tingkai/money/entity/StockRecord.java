package io.tingkai.money.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import io.tingkai.money.constant.DatabaseConstants;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Data;

@Entity
@Data
@Table(name = DatabaseConstants.TABLE_STOCK_RECORD, uniqueConstraints = { @UniqueConstraint(columnNames = { "code", "dealDate" }) })
public class StockRecord {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	protected UUID id;
	protected String code;
	protected LocalDateTime dealDate;
	protected BigDecimal dealShare;
	protected BigDecimal openPrice;
	protected BigDecimal highPrice;
	protected BigDecimal lowPrice;
	protected BigDecimal closePrice;
}

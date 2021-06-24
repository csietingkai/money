package io.tingkai.money.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

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

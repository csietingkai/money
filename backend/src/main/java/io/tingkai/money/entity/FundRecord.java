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
@Table(name = DatabaseConstants.TABLE_FUND_RECORD, uniqueConstraints = { @UniqueConstraint(columnNames = { "code", "date" }) })
public class FundRecord {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	protected UUID id;
	protected String code;
	protected LocalDateTime date;
	protected BigDecimal price;
}

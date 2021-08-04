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
@Table(name = DatabaseConstants.TABLE_FUND_RECORD, uniqueConstraints = { @UniqueConstraint(columnNames = { "code", "date" }) })
public class FundRecord {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	protected UUID id;
	protected String code;
	protected LocalDateTime date;
	protected BigDecimal price;
}

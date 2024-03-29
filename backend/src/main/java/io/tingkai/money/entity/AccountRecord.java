package io.tingkai.money.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import javax.persistence.Entity;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.enumeration.RecordType;
import lombok.Data;

@Entity
@Data
@Table(name = DatabaseConstants.TABLE_ACCOUNT_RECORD)
public class AccountRecord {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	protected UUID id;
	protected LocalDateTime transDate;
	protected BigDecimal transAmount;
	protected UUID transFrom;
	protected UUID transTo;
	@Enumerated(EnumType.STRING)
	protected RecordType recordType;
	protected String description;
}

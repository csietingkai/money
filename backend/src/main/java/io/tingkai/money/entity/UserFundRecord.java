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
import io.tingkai.money.enumeration.DealType;
import lombok.Data;

@Entity
@Data
@Table(name = DatabaseConstants.TABLE_USER_FUND_RECORD)
public class UserFundRecord {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	protected UUID id;
	protected UUID userFundId;
	protected UUID accountId;
	@Enumerated(EnumType.STRING)
	protected DealType type;
	protected LocalDateTime date;
	protected BigDecimal share;
	protected BigDecimal price;
	protected BigDecimal rate;
	protected BigDecimal fee;
	protected BigDecimal total;
	protected UUID accountRecordId;
}
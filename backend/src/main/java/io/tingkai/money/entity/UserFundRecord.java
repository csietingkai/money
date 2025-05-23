package io.tingkai.money.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import io.tingkai.money.constant.DatabaseConstant;
import io.tingkai.money.enumeration.DealType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = DatabaseConstant.TABLE_USER_FUND_RECORD)
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
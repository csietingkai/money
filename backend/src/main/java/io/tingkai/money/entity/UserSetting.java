package io.tingkai.money.entity;

import java.math.BigDecimal;
import java.util.UUID;

import io.tingkai.money.constant.DatabaseConstants;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = DatabaseConstants.TABLE_USER_SETTING)
public class UserSetting {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	protected UUID id;
	protected UUID userId;
	protected String stockType;
	protected BigDecimal predictDays;
	protected BigDecimal stockFeeRate;
	protected BigDecimal fundFeeRate;
	protected Boolean accountRecordDeletable;
	protected String accountRecordType;
}

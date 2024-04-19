package io.tingkai.money.entity;

import java.math.BigDecimal;
import java.util.UUID;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import io.tingkai.money.constant.DatabaseConstants;
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

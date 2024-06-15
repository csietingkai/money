package io.tingkai.money.entity;

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
@Table(name = DatabaseConstants.TABLE_USER_TRACKING_STOCK, uniqueConstraints = { @UniqueConstraint(columnNames = { "userId", "stockCode" }) })
public class UserTrackingStock {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	protected UUID id;
	protected UUID userId;
	protected String stockCode;
}

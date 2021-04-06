package io.tingkai.money.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import javax.persistence.Column;
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
@Table(name = DatabaseConstants.TABLE_USER_STOCK_RECORD)
public class UserStockRecord {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private UUID id;
	@Column(unique = true)
	private UUID userStockId;
	@Enumerated(EnumType.STRING)
	private DealType type;
	private LocalDateTime date;
	private BigDecimal share;
	private BigDecimal price;
	private BigDecimal fee;
	private BigDecimal tax;
}
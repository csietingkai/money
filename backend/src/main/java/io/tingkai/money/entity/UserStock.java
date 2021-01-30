package io.tingkai.money.entity;

import java.math.BigDecimal;
import java.util.UUID;

import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;

import io.tingkai.money.constant.DatabaseConstants;
import lombok.Data;

/**
 * Entity for sql database table 'user_stock'
 * 
 * @author tingkai
 */
@Entity
@Data
@Table(name = DatabaseConstants.TABLE_USER_STOCK, uniqueConstraints = { @UniqueConstraint(columnNames = { "userName", "stockCode" }) })
public class UserStock {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	private UUID id;
	private String userName;
	private String stockCode;
	private BigDecimal amount;
}
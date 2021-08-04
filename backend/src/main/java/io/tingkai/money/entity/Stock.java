package io.tingkai.money.entity;

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
import io.tingkai.money.enumeration.MarketType;
import lombok.Data;

@Entity
@Data
@Table(name = DatabaseConstants.TABLE_STOCK)
public class Stock {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	protected UUID id;
	@Column(unique = true)
	protected String code;
	protected String name;
	@Column(unique = true)
	protected String isinCode;
	protected String currency;
	protected LocalDateTime offeringDate;
	@Enumerated(EnumType.STRING)
	protected MarketType marketType;
	protected String industryType;
	protected String cfiCode;
	protected String symbol;
	protected String description;
}

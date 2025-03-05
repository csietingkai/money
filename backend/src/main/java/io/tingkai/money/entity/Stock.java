package io.tingkai.money.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import io.tingkai.money.constant.DatabaseConstant;
import io.tingkai.money.enumeration.MarketType;
import jakarta.persistence.Column;
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
@Table(name = DatabaseConstant.TABLE_STOCK)
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

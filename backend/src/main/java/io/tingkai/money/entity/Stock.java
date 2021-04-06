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
	private UUID id;
	@Column(unique = true)
	private String code;
	private String name;
	@Column(unique = true)
	private String isinCode;
	private LocalDateTime offeringDate;
	@Enumerated(EnumType.STRING)
	private MarketType marketType;
	private String industryType;
	private String cfiCode;
	private String description;
}

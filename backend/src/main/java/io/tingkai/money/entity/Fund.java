package io.tingkai.money.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import io.tingkai.money.constant.DatabaseConstants;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = DatabaseConstants.TABLE_FUND)
public class Fund {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	protected UUID id;
	@Column(unique = true)
	protected String code;
	@Column(unique = true)
	protected String symbol;
	protected String name;
	@Column(unique = true)
	protected String isinCode;
	protected LocalDateTime offeringDate;
	protected String currency;
	protected String description;
}

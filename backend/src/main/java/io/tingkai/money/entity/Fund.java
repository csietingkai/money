package io.tingkai.money.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.Table;

import io.tingkai.money.constant.DatabaseConstants;
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

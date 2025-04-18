package io.tingkai.money.entity;

import java.time.LocalDateTime;
import java.util.UUID;

import io.tingkai.money.constant.DatabaseConstant;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = DatabaseConstant.TABLE_FINANCIAL_FILE)
public class FinancialFile {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	protected UUID id;
	protected UUID userId;
	protected String filename;
	protected String type;
	protected LocalDateTime date;
}

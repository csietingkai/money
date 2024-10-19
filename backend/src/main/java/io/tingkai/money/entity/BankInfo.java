package io.tingkai.money.entity;

import java.util.UUID;

import io.tingkai.money.constant.DatabaseConstants;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = DatabaseConstants.TABLE_BANK_INFO)
public class BankInfo {
	@Id
	protected UUID id;
	protected String code;
	protected String name;
}

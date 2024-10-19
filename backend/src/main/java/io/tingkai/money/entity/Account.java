package io.tingkai.money.entity;

import java.math.BigDecimal;
import java.util.UUID;

import org.springframework.lang.Nullable;

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
@Table(name = DatabaseConstants.TABLE_ACCOUNT, uniqueConstraints = { @UniqueConstraint(columnNames = { "name", "userId" }) })
public class Account {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	protected UUID id;
	protected String name;
	protected UUID userId;
	protected String currency;
	protected BigDecimal balance;
	@Nullable
	protected String bankCode;
	@Nullable
	protected String bankNo;
	protected boolean shown = true;
}

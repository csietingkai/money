package io.tingkai.money.entity;

import java.util.UUID;

import io.tingkai.money.constant.DatabaseConstants;
import io.tingkai.money.enumeration.Role;
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
@Table(name = DatabaseConstants.TABLE_USER)
public class User {
	@Id
	@GeneratedValue(strategy = GenerationType.AUTO)
	protected UUID id;
	@Column(unique = true)
	protected String name;
	protected String pwd;
	@Enumerated(EnumType.STRING)
	protected Role role;
}
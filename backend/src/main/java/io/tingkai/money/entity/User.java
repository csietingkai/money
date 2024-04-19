package io.tingkai.money.entity;

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
import io.tingkai.money.enumeration.Role;
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
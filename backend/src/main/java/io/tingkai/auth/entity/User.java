package io.tingkai.auth.entity;

import java.util.UUID;

import io.tingkai.auth.constant.AuthConstant;
import io.tingkai.auth.enumeration.Role;
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
@Table(name = AuthConstant.TABLE_USER)
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
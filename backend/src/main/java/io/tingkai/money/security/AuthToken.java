package io.tingkai.money.security;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.UUID;

import io.tingkai.money.enumeration.Role;
import lombok.Data;

@Data
public class AuthToken implements Serializable {
	private static final long serialVersionUID = 3013734004152704512L;
	private UUID id;
	private String name;
	private Role role;
	private String tokenString;
	private LocalDateTime expiryDate;

	public boolean isExpired() {
		return LocalDateTime.now().isAfter(this.expiryDate);
	}
}

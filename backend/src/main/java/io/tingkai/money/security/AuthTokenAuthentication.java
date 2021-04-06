package io.tingkai.money.security;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

public class AuthTokenAuthentication implements Authentication {

	private static final long serialVersionUID = 3476207526350034201L;

	protected boolean isAuthenticated;

	protected Collection<? extends GrantedAuthority> authorities;

	protected AuthToken authToken;

	public AuthTokenAuthentication(AuthToken authToken) {
		this.authToken = authToken;
		List<SimpleGrantedAuthority> newAuthorities = new ArrayList<SimpleGrantedAuthority>();

		if (this.authToken.getTokenString() != null) {
			this.isAuthenticated = true;
			newAuthorities.add(new SimpleGrantedAuthority(authToken.getRole().name()));
		}

		this.authorities = newAuthorities;
	}

	public AuthTokenAuthentication(String tokenString) {
		this.authToken = new AuthToken();
		this.authToken.setTokenString(tokenString);
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return this.authorities;
	}

	@Override
	public Object getCredentials() {
		return this.authToken.getTokenString();
	}

	@Override
	public Object getDetails() {
		return this.authToken;
	}

	@Override
	public String getName() {
		return this.authToken.getName();
	}

	@Override
	public Object getPrincipal() {
		return this.authToken.getName();
	}

	@Override
	public boolean isAuthenticated() {
		return this.isAuthenticated;
	}

	@Override
	public void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException {
		if (!isAuthenticated) {
			this.isAuthenticated = false;
		} else {
			throw new IllegalArgumentException();
		}
	}

	@Override
	public String toString() {
		return "AuthTokenAuthentication [getCredentials()=" + getCredentials() + ", getDetails()=" + getDetails() + ", getName()=" + getName() + ", getPrincipal()=" + getPrincipal() + "]";
	}
}

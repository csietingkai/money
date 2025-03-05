package io.tingkai.auth.security;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

public class AuthTokenAuthentication implements Authentication {

	private static final long serialVersionUID = 1L;

	protected boolean isAuthenticated;

	protected Collection<? extends GrantedAuthority> authorities;

	protected AuthToken authToken;

	public AuthTokenAuthentication(AuthToken authToken) {
		this.authToken = authToken;
		List<SimpleGrantedAuthority> newAuthorities = new ArrayList<SimpleGrantedAuthority>();

		if (this.authToken.getTokenString() != null) {
			isAuthenticated = true;
			newAuthorities.add(new SimpleGrantedAuthority(authToken.getRole().name()));
		}

		authorities = newAuthorities;
	}

	public AuthTokenAuthentication(String tokenString) {
		authToken = new AuthToken();
		authToken.setTokenString(tokenString);
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return authorities;
	}

	@Override
	public Object getCredentials() {
		return authToken.getTokenString();
	}

	@Override
	public Object getDetails() {
		return authToken;
	}

	@Override
	public String getName() {
		return authToken.getName();
	}

	@Override
	public Object getPrincipal() {
		return authToken.getId();
	}

	@Override
	public boolean isAuthenticated() {
		return isAuthenticated;
	}

	@Override
	public void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException {
		if (!isAuthenticated) {
			isAuthenticated = false;
		} else {
			throw new IllegalArgumentException();
		}
	}

	@Override
	public String toString() {
		return "AuthTokenAuthentication [getCredentials()=" + getCredentials() + ", getDetails()=" + getDetails() + ", getName()=" + getName() + ", getPrincipal()=" + getPrincipal() + "]";
	}
}

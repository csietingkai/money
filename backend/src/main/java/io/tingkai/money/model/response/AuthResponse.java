package io.tingkai.money.model.response;

import io.tingkai.money.security.AuthToken;

public class AuthResponse extends BaseResponse<AuthToken> {

	public AuthResponse(boolean success, AuthToken authToken, String pattern) {
		super(success, authToken, pattern);
	}

	public AuthResponse(boolean success, AuthToken authToken, String pattern, String... params) {
		super(success, authToken, pattern, params);
	}

	public AuthResponse(Exception e) {
		super(e);
	}
}

package io.tingkai.auth.model.response;

import io.tingkai.auth.security.AuthToken;
import io.tingkai.base.model.response.BaseResponse;

public class AuthResponse extends BaseResponse<AuthToken> {

	public AuthResponse(boolean success, AuthToken vo, String pattern) {
		super(success, vo, pattern);
	}

	public AuthResponse(boolean success, AuthToken vo, String pattern, String... params) {
		super(success, vo, pattern, params);
	}

	public AuthResponse(Exception e) {
		super(e);
	}
}

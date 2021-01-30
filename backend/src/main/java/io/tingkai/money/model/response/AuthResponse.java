package io.tingkai.money.model.response;

import io.tingkai.money.controller.AuthController;
import io.tingkai.money.security.AuthToken;

/**
 * response when {@link AuthController#login(String, String) login} or
 * {@link AuthController#validate(String) validate} request.
 * 
 * @author tingkai
 */
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

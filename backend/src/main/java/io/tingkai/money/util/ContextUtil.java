package io.tingkai.money.util;

import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import io.tingkai.money.constant.CodeConstants;
import io.tingkai.money.security.AuthTokenAuthentication;

public class ContextUtil {

	public static UUID getUserId() {
		AuthTokenAuthentication authToken = getAuthToken();
		if (AppUtil.isPresent(authToken)) {
			return UUID.fromString(authToken.getPrincipal().toString());
		}
		return null;
	}

	public static String getUserName() {
		AuthTokenAuthentication authToken = getAuthToken();
		if (AppUtil.isPresent(authToken)) {
			return authToken.getName().toString();
		}
		return CodeConstants.EMPTY_STRING;
	}

	public static String getTokenString() {
		AuthTokenAuthentication authToken = getAuthToken();
		if (AppUtil.isPresent(authToken)) {
			return authToken.getCredentials().toString();
		}
		return CodeConstants.EMPTY_STRING;
	}

	public static AuthTokenAuthentication getAuthToken() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth instanceof AuthTokenAuthentication) {
			return (AuthTokenAuthentication) auth;
		}
		return null;
	}
}

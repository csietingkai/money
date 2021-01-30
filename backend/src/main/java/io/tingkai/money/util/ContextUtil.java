package io.tingkai.money.util;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import io.tingkai.money.constant.CodeConstants;
import io.tingkai.money.security.AuthTokenAuthentication;

/**
 * Provide method to get current user and tokenString
 * 
 * @author tingkai
 */
public class ContextUtil {

	public static String getUserName() {
		AuthTokenAuthentication authToken = getAuthToken();
		if (AppUtil.isPresent(authToken)) {
			return authToken.getPrincipal().toString();
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

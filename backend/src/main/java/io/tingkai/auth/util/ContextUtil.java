package io.tingkai.auth.util;

import java.util.UUID;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import io.tingkai.auth.security.AuthTokenAuthentication;
import io.tingkai.base.constant.BaseCodeConstant;
import io.tingkai.base.util.BaseAppUtil;


public class ContextUtil {

	public static UUID getUserId() {
		AuthTokenAuthentication authToken = getAuthToken();
		if (BaseAppUtil.isPresent(authToken)) {
			return UUID.fromString(authToken.getPrincipal().toString());
		}
		return null;
	}

	public static String getUserName() {
		AuthTokenAuthentication authToken = getAuthToken();
		if (BaseAppUtil.isPresent(authToken)) {
			return authToken.getName().toString();
		}
		return BaseCodeConstant.EMPTY_STRING;
	}

	public static String getTokenString() {
		AuthTokenAuthentication authToken = getAuthToken();
		if (BaseAppUtil.isPresent(authToken)) {
			return authToken.getCredentials().toString();
		}
		return BaseCodeConstant.EMPTY_STRING;
	}

	public static AuthTokenAuthentication getAuthToken() {
		Authentication auth = SecurityContextHolder.getContext().getAuthentication();
		if (auth instanceof AuthTokenAuthentication) {
			return (AuthTokenAuthentication) auth;
		}
		return null;
	}
}

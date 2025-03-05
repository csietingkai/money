package io.tingkai.auth.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import io.tingkai.auth.constant.AuthConstant;
import io.tingkai.auth.model.exception.AuthTokenExpireException;
import io.tingkai.base.util.BaseAppUtil;
import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class AuthTokenAuthenticationProvider implements AuthenticationProvider {

	@Autowired
	private AuthTokenService authTokenService;

	@Override
	public Authentication authenticate(Authentication authentication) {
		if (authentication.getCredentials() != null) {
			AuthToken authToken = null;
			try {
				authToken = authTokenService.validate(authentication.getCredentials().toString());
			} catch (AuthTokenExpireException e) {
				log.warn(e.getMessage());
			}
			if (BaseAppUtil.isPresent(authToken)) {
				return new AuthTokenAuthentication(authToken);
			}
		}

		throw new BadCredentialsException(AuthConstant.AUTHENTICATE_FAIL);
	}

	@Override
	public boolean supports(Class<?> authentication) {
		return authentication.equals(AuthTokenAuthentication.class);
	}
}

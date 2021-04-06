package io.tingkai.money.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.model.exception.AuthTokenExpireException;
import io.tingkai.money.util.AppUtil;

@Component
public class AuthTokenAuthenticationProvider implements AuthenticationProvider {

	@Autowired
	private AuthTokenService authTokenService;

	@Override
	public Authentication authenticate(Authentication authentication) {
		if (authentication.getCredentials() != null) {
			AuthToken authToken = null;
			try {
				authToken = this.authTokenService.validate(authentication.getCredentials().toString());
			} catch (AuthTokenExpireException e) {
				e.printStackTrace();
			}
			if (AppUtil.isPresent(authToken)) {
				return new AuthTokenAuthentication(authToken);
			}
		}

		throw new BadCredentialsException(MessageConstant.AUTHENTICATE_FAIL);
	}

	@Override
	public boolean supports(Class<?> authentication) {
		return authentication.equals(AuthTokenAuthentication.class);
	}
}

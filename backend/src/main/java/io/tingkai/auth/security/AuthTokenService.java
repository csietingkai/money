package io.tingkai.auth.security;

import java.text.MessageFormat;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import io.tingkai.auth.constant.AuthConstant;
import io.tingkai.auth.entity.User;
import io.tingkai.auth.model.exception.AuthTokenExpireException;
import io.tingkai.base.util.BaseAppUtil;

@Service
public final class AuthTokenService {

	@Autowired
	@Qualifier(AuthConstant.AUTH_CACHE)
	private RedisTemplate<String, String> stringRedisTemplate;

	@Autowired
	@Qualifier(AuthConstant.AUTH_CACHE)
	private RedisTemplate<String, AuthToken> authTokenRedisTemplate;

	@Autowired
	private TokenStringService tokenStringService;

	/**
	 * if user had login, update expire date, else generate new {@link AuthToken}
	 * and return it.
	 */
	public AuthToken issue(User user) {
		String existingAuthTokenString = stringRedisTemplate.opsForValue().get(MessageFormat.format(AuthConstant.AUTH_USER_KEY, user.getId()));

		AuthToken authToken = generate(user);
		if (BaseAppUtil.isPresent(existingAuthTokenString)) {
			authToken = authTokenRedisTemplate.opsForValue().get(MessageFormat.format(AuthConstant.AUTH_TOKEN_KEY, existingAuthTokenString));
			if (authToken.getExpiryDate().isBefore(LocalDateTime.now())) {
				authToken.setExpiryDate(getExpiryDate());
			}
		}
		stringRedisTemplate.opsForValue().set(MessageFormat.format(AuthConstant.AUTH_USER_KEY, user.getId()), authToken.getTokenString(), AuthConstant.AUTH_TOKEN_VALID_HOURS, TimeUnit.HOURS);
		authTokenRedisTemplate.opsForValue().set(MessageFormat.format(AuthConstant.AUTH_TOKEN_KEY, authToken.getTokenString()), authToken, AuthConstant.AUTH_TOKEN_VALID_HOURS, TimeUnit.HOURS);

		return authToken;
	}

	public void remove(UUID userId) {
		String tokenString = stringRedisTemplate.opsForValue().get(MessageFormat.format(AuthConstant.AUTH_USER_KEY, userId));
		stringRedisTemplate.delete(MessageFormat.format(AuthConstant.AUTH_USER_KEY, userId));
		authTokenRedisTemplate.delete(MessageFormat.format(AuthConstant.AUTH_TOKEN_KEY, tokenString));
	}

	public void revoke(AuthToken authToken) {
		stringRedisTemplate.delete(MessageFormat.format(AuthConstant.AUTH_USER_KEY, authToken.getId()));
		authTokenRedisTemplate.delete(MessageFormat.format(AuthConstant.AUTH_TOKEN_KEY, authToken.getTokenString()));
	}

	public AuthToken validate(String tokenString) throws AuthTokenExpireException {
		AuthToken token = authTokenRedisTemplate.opsForValue().get(MessageFormat.format(AuthConstant.AUTH_TOKEN_KEY, tokenString));
		if (BaseAppUtil.isEmpty(token) || token.getExpiryDate().isBefore(LocalDateTime.now())) {
			throw new AuthTokenExpireException();
		}
		return token;
	}

	private AuthToken generate(User user) {
		AuthToken authToken = new AuthToken();
		authToken.setId(user.getId());
		authToken.setName(user.getName());
		authToken.setTokenString(tokenStringService.next());
		authToken.setExpiryDate(getExpiryDate());
		authToken.setRole(user.getRole());
		authToken.setName(user.getName());
		return authToken;
	}

	private LocalDateTime getExpiryDate() {
		LocalDateTime expiryDate = LocalDateTime.now();
		expiryDate = expiryDate.plusHours(AuthConstant.AUTH_TOKEN_VALID_HOURS);
		return expiryDate;
	}
}

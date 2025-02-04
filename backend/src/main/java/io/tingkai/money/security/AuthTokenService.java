package io.tingkai.money.security;

import java.text.MessageFormat;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.CodeConstants;
import io.tingkai.money.entity.User;
import io.tingkai.money.model.exception.AuthTokenExpireException;
import io.tingkai.money.util.AppUtil;

@Service
public final class AuthTokenService {

	@Autowired
	@Qualifier(CodeConstants.USER_CACHE)
	private RedisTemplate<String, String> stringRedisTemplate;

	@Autowired
	@Qualifier(CodeConstants.USER_CACHE)
	private RedisTemplate<String, AuthToken> authTokenRedisTemplate;

	@Autowired
	private TokenStringService tokenStringService;

	/**
	 * if user had login, update expire date, else generate new {@link AuthToken}
	 * and return it.
	 */
	public AuthToken issue(User user) {
		String existingAuthTokenString = this.stringRedisTemplate.opsForValue().get(MessageFormat.format(CodeConstants.AUTH_USER_KEY, user.getId()));

		AuthToken authToken = this.generate(user);
		if (AppUtil.isPresent(existingAuthTokenString)) {
			authToken = this.authTokenRedisTemplate.opsForValue().get(MessageFormat.format(CodeConstants.AUTH_TOKEN_KEY, existingAuthTokenString));
			if (authToken.isExpired()) {
				authToken.setExpiryDate(getExpiryDate());
			}
		}
		this.stringRedisTemplate.opsForValue().set(MessageFormat.format(CodeConstants.AUTH_USER_KEY, user.getId()), authToken.getTokenString(), CodeConstants.AUTH_TOKEN_VALID_HOURS, TimeUnit.HOURS);
		this.authTokenRedisTemplate.opsForValue().set(MessageFormat.format(CodeConstants.AUTH_TOKEN_KEY, authToken.getTokenString()), authToken, CodeConstants.AUTH_TOKEN_VALID_HOURS, TimeUnit.HOURS);

		return authToken;
	}

	public void remove(UUID userId) {
		String tokenString = this.stringRedisTemplate.opsForValue().get(MessageFormat.format(CodeConstants.AUTH_USER_KEY, userId));
		this.stringRedisTemplate.delete(MessageFormat.format(CodeConstants.AUTH_USER_KEY, userId));
		this.authTokenRedisTemplate.delete(MessageFormat.format(CodeConstants.AUTH_TOKEN_KEY, tokenString));
	}

	public void revoke(AuthToken authToken) {
		this.stringRedisTemplate.delete(MessageFormat.format(CodeConstants.AUTH_USER_KEY, authToken.getId()));
		this.authTokenRedisTemplate.delete(MessageFormat.format(CodeConstants.AUTH_TOKEN_KEY, authToken.getTokenString()));
	}

	public AuthToken validate(String tokenString) throws AuthTokenExpireException {
		AuthToken token = this.authTokenRedisTemplate.opsForValue().get(MessageFormat.format(CodeConstants.AUTH_TOKEN_KEY, tokenString));
		if (AppUtil.isEmpty(token) || token.isExpired()) {
			throw new AuthTokenExpireException();
		}
		return token;
	}

	private AuthToken generate(User user) {
		AuthToken authToken = new AuthToken();
		authToken.setId(user.getId());
		authToken.setName(user.getName());
		authToken.setTokenString(this.tokenStringService.next());
		authToken.setExpiryDate(this.getExpiryDate());
		authToken.setRole(user.getRole());
		authToken.setName(user.getName());
		return authToken;
	}

	private LocalDateTime getExpiryDate() {
		LocalDateTime dt = LocalDateTime.now();
		return dt.plusHours(CodeConstants.AUTH_TOKEN_VALID_HOURS);
	}
}

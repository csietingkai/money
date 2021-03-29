package io.tingkai.money.security;

import java.util.Calendar;
import java.util.Date;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.CodeConstants;
import io.tingkai.money.entity.User;
import io.tingkai.money.model.exception.AuthTokenExpireException;
import io.tingkai.money.util.AppUtil;
import io.tingkai.money.util.TimeUtil;

/**
 * Store login token to redis
 * 
 * @author tingkai
 */
@Service
public final class AuthTokenService {

	@Autowired
	private RedisTemplate<String, String> stringRedisTemplate;

	@Autowired
	private RedisTemplate<String, AuthToken> authTokenRedisTemplate;

	@Autowired
	private TokenStringService tokenStringService;

	/**
	 * if user had login, update expire date, else generate new {@link AuthToken}
	 * and return it.
	 */
	public AuthToken issue(User user) {
		String existingAuthTokenString = this.stringRedisTemplate.opsForValue().get(CodeConstants.AUTH_USER_KEY + user.getId());

		AuthToken authToken = this.generate(user);
		if (AppUtil.isPresent(existingAuthTokenString)) {
			authToken = this.authTokenRedisTemplate.opsForValue().get(CodeConstants.AUTH_TOKEN_KEY + existingAuthTokenString);
			if (authToken.getExpiryDate().before(new Date(TimeUtil.getCurrentDateTime()))) {
				authToken.setExpiryDate(getExpiryDate());
			}
		}
		this.stringRedisTemplate.opsForValue().set(CodeConstants.AUTH_USER_KEY + user.getId(), authToken.getTokenString(), CodeConstants.AUTH_TOKEN_VALID_HOURS, TimeUnit.HOURS);
		this.authTokenRedisTemplate.opsForValue().set(CodeConstants.AUTH_TOKEN_KEY + authToken.getTokenString(), authToken, CodeConstants.AUTH_TOKEN_VALID_HOURS, TimeUnit.HOURS);

		return authToken;
	}

	public void revoke(AuthToken authToken) {
		this.stringRedisTemplate.delete(CodeConstants.AUTH_USER_KEY + authToken.getName());
		this.authTokenRedisTemplate.delete(CodeConstants.AUTH_TOKEN_KEY + authToken.getTokenString());
	}

	public AuthToken validate(String tokenString) throws AuthTokenExpireException {
		AuthToken token = this.authTokenRedisTemplate.opsForValue().get(CodeConstants.AUTH_TOKEN_KEY + tokenString);
		if (AppUtil.isEmpty(token) || token.getExpiryDate().before(new Date())) {
			throw new AuthTokenExpireException();
		}
		return token;
	}

	private AuthToken generate(User user) {
		AuthToken authToken = new AuthToken();
		authToken.setName(user.getName());
		authToken.setTokenString(this.tokenStringService.next());
		authToken.setExpiryDate(this.getExpiryDate());
		authToken.setRole(user.getRole());
		authToken.setName(user.getName());
		return authToken;
	}

	private Date getExpiryDate() {
		Calendar calendar = Calendar.getInstance();
		calendar.setTime(new Date(TimeUtil.getCurrentDateTime()));
		calendar.add(Calendar.HOUR, CodeConstants.AUTH_TOKEN_VALID_HOURS);
		return calendar.getTime();
	}
}

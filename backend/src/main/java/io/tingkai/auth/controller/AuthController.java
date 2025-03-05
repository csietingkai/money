package io.tingkai.auth.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.tingkai.auth.constant.AuthConstant;
import io.tingkai.auth.entity.User;
import io.tingkai.auth.model.exception.AuthTokenExpireException;
import io.tingkai.auth.model.exception.IllegalRoleException;
import io.tingkai.auth.model.exception.UserNotFoundException;
import io.tingkai.auth.model.exception.WrongPasswordException;
import io.tingkai.auth.model.response.AuthResponse;
import io.tingkai.auth.security.AuthToken;
import io.tingkai.auth.security.AuthTokenService;
import io.tingkai.auth.service.AuthService;
import io.tingkai.auth.util.ContextUtil;
import io.tingkai.base.constant.BaseMessageConstant;
import io.tingkai.base.model.exception.AlreadyExistException;
import io.tingkai.base.model.exception.FieldMissingException;
import io.tingkai.base.model.exception.NotExistException;
import io.tingkai.base.util.BaseAppUtil;

@RestController
public class AuthController {

	public static final String LOGIN_PATH = "/login";
	public static final String REGISTER_PATH = "/register";
	public static final String CHANGE_PWD_PATH = "/changePwd";
	public static final String VALIDATE_PATH = "/validate";
	public static final String LOGOUT_PATH = "/userLogout";

	@Autowired
	private AuthService userService;

	@Autowired
	private AuthTokenService authTokenService;

	@RequestMapping(value = AuthController.LOGIN_PATH, method = RequestMethod.POST)
	public AuthResponse login(@RequestParam String username, @RequestParam String password) throws UserNotFoundException, WrongPasswordException {
		User user = userService.login(username, password);
		authTokenService.remove(user.getId());
		AuthToken token = authTokenService.issue(user);
		return new AuthResponse(true, token, AuthConstant.LOGIN_SUCCESS, user.getName());
	}

	@RequestMapping(value = AuthController.REGISTER_PATH, method = RequestMethod.POST)
	public AuthResponse register(@RequestBody User user) throws IllegalRoleException, AlreadyExistException, FieldMissingException {
		userService.create(user);
		return new AuthResponse(true, null, BaseMessageConstant.SUCCESS);
	}

	@RequestMapping(value = AuthController.CHANGE_PWD_PATH, method = RequestMethod.POST)
	public AuthResponse changePwd(@RequestParam String password) throws NotExistException, FieldMissingException {
		userService.changePwd(password);
		return new AuthResponse(true, null, AuthConstant.USER_CHANGE_PASSWORD_SUCCESS);
	}

	@RequestMapping(value = AuthController.VALIDATE_PATH, method = RequestMethod.GET)
	public AuthResponse validate(@RequestParam String tokenString) throws AuthTokenExpireException {
		AuthToken token = authTokenService.validate(tokenString);
		if (BaseAppUtil.isPresent(token)) {
			return new AuthResponse(true, token, AuthConstant.LOGIN_SUCCESS, token.getName());
		} else {
			return new AuthResponse(false, null, AuthConstant.AUTH_TOKEN_EXPIRE);
		}
	}

	@RequestMapping(value = AuthController.LOGOUT_PATH, method = RequestMethod.POST)
	public AuthResponse logout(@RequestHeader(name = AuthConstant.REQUEST_TOKEN_KEY) String tokenString) {
		AuthToken token = new AuthToken();
		token.setId(ContextUtil.getUserId());
		token.setTokenString(tokenString);
		authTokenService.revoke(token);
		return new AuthResponse(true, null, AuthConstant.LOGOUT_SUCCESS);
	}
}

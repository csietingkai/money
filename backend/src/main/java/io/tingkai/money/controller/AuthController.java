package io.tingkai.money.controller;

import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.tingkai.money.constant.CodeConstants;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.entity.User;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.AuthTokenExpireException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.IllegalRoleException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.exception.UserNotFoundException;
import io.tingkai.money.model.exception.WrongPasswordException;
import io.tingkai.money.model.response.AuthResponse;
import io.tingkai.money.security.AuthToken;
import io.tingkai.money.security.AuthTokenService;
import io.tingkai.money.service.MailService;
import io.tingkai.money.service.UserService;
import io.tingkai.money.util.AppUtil;

@RestController
public class AuthController {

	public static final String LOGIN_PATH = "/login";
	public static final String REGISTER_PATH = "/register";
	public static final String CONFIRM_PATH = "/confirm";
	public static final String VALIDATE_PATH = "/validate";
	public static final String LOGOUT_PATH = "/userLogout";

	@Autowired
	private UserService userService;

	@Autowired
	private AuthTokenService authTokenService;

	@Autowired
	private MailService mailService;

	@RequestMapping(value = AuthController.LOGIN_PATH, method = RequestMethod.POST)
	public AuthResponse login(@RequestParam String username, @RequestParam String password) throws UserNotFoundException, WrongPasswordException {
		User user = this.userService.login(username, password);
		this.authTokenService.remove(user.getId());
		AuthToken token = this.authTokenService.issue(user);
		return new AuthResponse(true, token, MessageConstant.LOGIN_SUCCESS, username);
	}

	@RequestMapping(value = AuthController.REGISTER_PATH, method = RequestMethod.POST)
	public AuthResponse register(@RequestBody User user, @RequestParam(required = false, defaultValue = "true") boolean sendMail) throws IllegalRoleException, AlreadyExistException, FieldMissingException {
		this.userService.create(user);
		if (sendMail) {
			this.mailService.sendConfirmEmail(user.getEmail());
		}

		return new AuthResponse(true, null, MessageConstant.SUCCESS);
	}

	@RequestMapping(value = AuthController.CONFIRM_PATH, method = RequestMethod.POST)
	public AuthResponse confirm(@RequestParam String email) throws NotExistException, FieldMissingException {
		// TODO browser can not open, but postman can
		this.userService.confirm(email);
		return new AuthResponse(true, null, MessageConstant.SUCCESS);
	}

	@RequestMapping(value = AuthController.VALIDATE_PATH, method = RequestMethod.GET)
	public AuthResponse validate(@RequestParam String tokenString) throws AuthTokenExpireException {
		AuthToken token = this.authTokenService.validate(tokenString);
		if (AppUtil.isPresent(token)) {
			return new AuthResponse(true, token, MessageConstant.LOGIN_SUCCESS, token.getName());
		} else {
			return new AuthResponse(false, null, MessageConstant.AUTH_TOKEN_EXPIRE);
		}
	}

	@RequestMapping(value = AuthController.LOGOUT_PATH, method = RequestMethod.POST)
	public AuthResponse logout(@RequestParam UUID userId, @RequestHeader(name = CodeConstants.REQUEST_TOKEN_KEY) String tokenString) {
		AuthToken token = new AuthToken();
		token.setId(userId);
		token.setTokenString(tokenString);
		this.authTokenService.revoke(token);
		return new AuthResponse(true, token, MessageConstant.LOGOUT_SUCCESS);
	}
}

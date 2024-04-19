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
import io.tingkai.money.entity.UserSetting;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.AuthTokenExpireException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.IllegalRoleException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.exception.UserNotFoundException;
import io.tingkai.money.model.exception.WrongPasswordException;
import io.tingkai.money.model.response.AuthResponse;
import io.tingkai.money.model.vo.LoginRespVo;
import io.tingkai.money.security.AuthToken;
import io.tingkai.money.security.AuthTokenService;
import io.tingkai.money.service.UserService;
import io.tingkai.money.util.AppUtil;

@RestController
public class AuthController {

	public static final String LOGIN_PATH = "/login";
	public static final String REGISTER_PATH = "/register";
	public static final String CHANGE_PWD_PATH = "/changePwd";
	public static final String VALIDATE_PATH = "/validate";
	public static final String LOGOUT_PATH = "/userLogout";
	public static final String UPDATE_SETTING_PATH = "/updateUserSetting";

	@Autowired
	private UserService userService;

	@Autowired
	private AuthTokenService authTokenService;

	@RequestMapping(value = AuthController.LOGIN_PATH, method = RequestMethod.POST)
	public AuthResponse login(@RequestParam String username, @RequestParam String password) throws UserNotFoundException, WrongPasswordException {
		User user = this.userService.login(username, password);
		this.authTokenService.remove(user.getId());
		AuthToken token = this.authTokenService.issue(user);
		UserSetting setting = this.userService.getUserSetting(user.getId());
		return new AuthResponse(true, LoginRespVo.of(token, setting), MessageConstant.LOGIN_SUCCESS, user.getName());
	}

	@RequestMapping(value = AuthController.REGISTER_PATH, method = RequestMethod.POST)
	public AuthResponse register(@RequestBody User user) throws IllegalRoleException, AlreadyExistException, FieldMissingException {
		this.userService.create(user);
		return new AuthResponse(true, null, MessageConstant.SUCCESS);
	}

	@RequestMapping(value = AuthController.CHANGE_PWD_PATH, method = RequestMethod.POST)
	public AuthResponse changePwd(@RequestParam UUID userId, @RequestParam String password) throws NotExistException, FieldMissingException {
		this.userService.changePwd(userId, password);
		return new AuthResponse(true, null, MessageConstant.USER_CHANGE_PASSWORD_SUCCESS);
	}

	@RequestMapping(value = AuthController.VALIDATE_PATH, method = RequestMethod.GET)
	public AuthResponse validate(@RequestParam String tokenString) throws AuthTokenExpireException {
		AuthToken token = this.authTokenService.validate(tokenString);
		if (AppUtil.isPresent(token)) {
			UserSetting setting = this.userService.getUserSetting(token.getId());
			return new AuthResponse(true, LoginRespVo.of(token, setting), MessageConstant.LOGIN_SUCCESS, token.getName());
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
		return new AuthResponse(true, null, MessageConstant.LOGOUT_SUCCESS);
	}

	@RequestMapping(value = AuthController.UPDATE_SETTING_PATH, method = RequestMethod.POST)
	public AuthResponse updateUserSetting(@RequestBody UserSetting setting) throws FieldMissingException, NotExistException {
		this.userService.updateUserSetting(setting);
		return new AuthResponse(true, null, MessageConstant.USER_CHANGE_SETTING_SUCCESS);
	}
}

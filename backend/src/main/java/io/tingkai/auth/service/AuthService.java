package io.tingkai.auth.service;

import java.text.MessageFormat;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import io.tingkai.auth.constant.AuthConstant;
import io.tingkai.auth.entity.User;
import io.tingkai.auth.enumeration.Role;
import io.tingkai.auth.facade.UserFacade;
import io.tingkai.auth.model.exception.UserNotFoundException;
import io.tingkai.auth.model.exception.WrongPasswordException;
import io.tingkai.auth.util.ContextUtil;
import io.tingkai.base.log.Loggable;
import io.tingkai.base.model.exception.AlreadyExistException;
import io.tingkai.base.model.exception.FieldMissingException;
import io.tingkai.base.model.exception.NotExistException;
import io.tingkai.base.util.BaseAppUtil;
import lombok.extern.slf4j.Slf4j;

@Service
@Loggable
@Slf4j
public class AuthService {

	@Autowired
	private UserFacade userFacade;

	@Autowired
	private PasswordEncoder bCryptPasswordEncoder;

	public User get(String name) {
		return userFacade.queryByName(name);
	}

	public User login(String name, String pwd) throws UserNotFoundException, WrongPasswordException {
		User user = userFacade.queryByName(name);
		if (BaseAppUtil.isEmpty(user)) {
			throw new UserNotFoundException(name);
		}
		if (!bCryptPasswordEncoder.matches(pwd, user.getPwd())) {
			throw new WrongPasswordException();
		}
		return user;
	}

	public User create(User entity) throws AlreadyExistException, FieldMissingException {
		if (entity.getRole() != Role.USER) {
			log.warn(MessageFormat.format(AuthConstant.CREATE_USER_WARN, entity.getName(), "Role Error"));
			entity.setRole(Role.USER);
		}
		entity.setPwd(bCryptPasswordEncoder.encode(entity.getPwd()));
		return userFacade.insert(entity);
	}

	public User changePwd(String newPwd) throws NotExistException, FieldMissingException {
		UUID userId = ContextUtil.getUserId();
		User entity = userFacade.query(userId);
		entity.setPwd(bCryptPasswordEncoder.encode(newPwd));
		return userFacade.update(entity);
	}
}

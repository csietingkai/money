package io.tingkai.money.service;

import java.text.MessageFormat;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import io.tingkai.money.constant.AppConstants;
import io.tingkai.money.constant.MessageConstant;
import io.tingkai.money.entity.User;
import io.tingkai.money.enumeration.Role;
import io.tingkai.money.facade.UserFacade;
import io.tingkai.money.logging.Loggable;
import io.tingkai.money.model.exception.AlreadyExistException;
import io.tingkai.money.model.exception.FieldMissingException;
import io.tingkai.money.model.exception.IllegalRoleException;
import io.tingkai.money.model.exception.NotExistException;
import io.tingkai.money.model.exception.UserNotFoundException;
import io.tingkai.money.model.exception.WrongPasswordException;
import io.tingkai.money.util.AppUtil;
import io.tingkai.money.util.ContextUtil;
import lombok.extern.slf4j.Slf4j;

@Service
@Loggable
@Slf4j
public class UserService {

	@Autowired
	private UserFacade userFacade;

	@Autowired
	private PasswordEncoder bCryptPasswordEncoder;

	public User get(String name) {
		return this.userFacade.queryByName(name);
	}

	public User login(String name, String pwd) throws UserNotFoundException, WrongPasswordException {
		User user = this.userFacade.queryByName(name);
		if (AppUtil.isEmpty(user)) {
			throw new UserNotFoundException(name);
		}
		if (!this.bCryptPasswordEncoder.matches(pwd, user.getPwd())) {
			throw new WrongPasswordException();
		}
		return user;
	}

	public User create(User entity) throws AlreadyExistException, FieldMissingException {
		if (entity.getRole() != Role.USER) {
			log.warn(MessageFormat.format(MessageConstant.CREATE_USER_WARN, entity.getName(), "Role Error"));
			entity.setRole(Role.USER);
		}
		entity.setPwd(this.bCryptPasswordEncoder.encode(entity.getPwd()));
		return this.userFacade.insert(entity);
	}

	public User confirm(String email) throws NotExistException, FieldMissingException {
		User entity = this.userFacade.queryByEmail(email);
		entity.setConfirm(true);
		return this.userFacade.update(entity);
	}

	public User setUserAsAdmin(User userToBeAdmin) throws NotExistException, FieldMissingException, IllegalRoleException {
		if (!isCurrentUserRoot()) {
			throw new IllegalRoleException("Need Root Role");
		}
		userToBeAdmin.setRole(Role.ADMIN);
		return this.userFacade.update(userToBeAdmin);
	}

	public boolean isCurrentUserRoot() {
		User loginUser = getCurrentLoginUser();
		return loginUser.getRole() == Role.ROOT;
	}

	public boolean isCurrentUserConfirm() {
		User loginUser = getCurrentLoginUser();
		return loginUser.getRole() == Role.ROOT;
	}

	public boolean isRootExist() {
		List<User> entities = this.userFacade.queryByRole(Role.ROOT);
		return entities.size() > 0;
	}

	public User createRoot(String initRootPassword) throws AlreadyExistException, FieldMissingException {
		User root = new User();
		root.setName(AppConstants.INIT_ROOT_USERNAME);
		root.setPwd(this.bCryptPasswordEncoder.encode(initRootPassword));
		root.setEmail(AppConstants.INIT_ROOT_EMAIL);
		root.setRole(Role.ROOT);
		return this.userFacade.insert(root);
	}

	private User getCurrentLoginUser() {
		String loginUsername = ContextUtil.getUserName();
		return this.userFacade.queryByName(loginUsername);
	}
}
